import { useMemo } from 'react';
import { CONTESTAZIONI, OGGI } from '@/data/datiDemo';
import { MOROSITA } from '@/data/pratiche';
import { toast } from 'sonner';
import {
    garanziaDalDatabase, useGaranziaDalDatabase, disponiIndennizzoDb, autorizzaIndennizzoDb,
    eseguiIndennizzoDb, proponiPianoDb, approvaPianoDb, registraContattoDb, scriviNotaDb,
} from '@/lib/garanziaFonte';
import { PARAMETRI, PRODOTTI, nomeProdotto } from '@/data/catalogo';
import { FUNZIONI, nomeOperatore, trovaOperatore } from '@/data/operatori';
import {
    AVVOCATO_CONVENZIONATO, CANONI_GIRATI, CONTI_ACCREDITO, ESITI_CONTATTO, GIORNI_TOLLERANZA_RATA, INDENNIZZI,
    PRATICHE_BACKOFFICE, PRIMO_TRIMESTRE, PROVVIGIONI_DA_PAGARE, QUOTA_RIASSICURAZIONE, RENDICONTI_INVIATI, TERMINI,
} from '@/data/garanzia';
import { AZIONI, verificaAzione } from '@/lib/separazione';
import { creaStoreDemo, nuovoIdDemo } from '@/lib/storeDemo';
import { aggiungiGiorniSolari, calcolaTermine, giorniSolariTra, mancanoAlTermine } from '@/lib/calendario';
import { fmtData, meseSuccessivo, nomeMese } from '@/lib/formato';
import { contrattiAttuali, trovaContrattoAttuale } from '@/lib/contrattiFonte';

// ═════════════════════════════════════════════════════════════════════════════
// GARANZIA E TESORERIA NEI MOCKUP — morosità (O-14, O-15), piani di rientro
// (O-16), indennizzi (O-17), bonifici in uscita (O-13), riassicurazione (O-20).
//
// I dati di partenza sono quelli condivisi (contratti, mesi, MOROSITA) più le
// parti interne di data/garanzia.js; le azioni fatte nel browser stanno in uno
// store a parte e si sommano sopra. Ogni azione sensibile ricontrolla qui la
// separazione dei compiti, come farà il CHECK del database (§14.3): il
// pulsante spento nell'interfaccia non basta.
//
// Fase 4: le tabelle dell'area garanzia (§14.3) e il motore delle scadenze.
// ═════════════════════════════════════════════════════════════════════════════

const vuoto = () => ({
    pratiche: { nuove: [], modifiche: {} },
    indennizzi: { nuovi: [], modifiche: {} },
    bonifici: {},          // modifiche per id del bonifico
    piani: [],             // piani proposti nei mockup
    pianiModifiche: {},    // approvazioni, rifiuti, accettazioni, sostituzioni
    ratePagate: {},        // { [pianoId]: { [n]: data } }
    contatti: [],
    note: [],
    legale: {},            // { [praticaId]: [richieste, l'ultima è quella corrente] }
    rendiconti: {},        // { [trimestre]: { inviatoIl, inviatoDa } }
});

const store = creaStoreDemo('criaGaranziaDemo', vuoto);

export const ripristinaGaranziaDemo = () => store.ripristina();

// ─── Piccoli conti ────────────────────────────────────────────────────────────
const somma = (lista, f) => lista.reduce((t, x) => t + f(x), 0);
const arrotonda = (n) => Math.round(n * 100) / 100;
const pad = (n) => String(n).padStart(2, '0');
const perDataOra = (a, b) => `${a.il} ${a.ora || ''}`.localeCompare(`${b.il} ${b.ora || ''}`);
const traDate = (iso, dal, al) => !!iso && iso >= dal && iso <= al;

// «l’11/09/2026», «dall’8/09/2026»: davanti a 8 e 11 l'articolo si elide.
const elisa = (iso) => [8, 11].includes(Number(iso.slice(8, 10)));
export const ilGiorno = (iso) => `${elisa(iso) ? 'l’' : 'il '}${fmtData(iso)}`;
export const dalGiorno = (iso) => `${elisa(iso) ? 'dall’' : 'dal '}${fmtData(iso)}`;
export const ilGiornoDelMese = (n) => ([8, 11].includes(n) ? `l’${n}` : `il ${n}`);

export const chiusuraDelMese = (mese) => `${mese}-${pad(PARAMETRI.giornoChiusuraMese)}`;
const fineFinestra = (mese) => `${mese}-${pad(PARAMETRI.giornoScadenzaCanone + PARAMETRI.giorniFinestraCopertura)}`;
const meseDopo = (mese, n) => {
    let m = mese;
    for (let i = 0; i < n; i += 1) m = meseSuccessivo(m);
    return m;
};

// ─── Trimestri ────────────────────────────────────────────────────────────────
export const trimestreDi = (iso) => `${iso.slice(0, 4)}-T${Math.floor((Number(iso.slice(5, 7)) - 1) / 3) + 1}`;

export const confiniTrimestre = (t) => {
    const [anno, q] = t.split('-T').map(Number);
    const primo = (q - 1) * 3 + 1;
    const ultimoGiorno = new Date(Date.UTC(anno, primo + 2, 0)).getUTCDate();
    return {
        dal: `${anno}-${pad(primo)}-01`,
        al: `${anno}-${pad(primo + 2)}-${pad(ultimoGiorno)}`,
        mesi: [0, 1, 2].map(i => `${anno}-${pad(primo + i)}`),
    };
};

const trimestreSuccessivo = (t) => {
    const [anno, q] = t.split('-T').map(Number);
    return q === 4 ? `${anno + 1}-T1` : `${anno}-T${q + 1}`;
};

export const etichettaTrimestre = (t) => {
    const [anno, q] = t.split('-T');
    return `${q}° trimestre ${anno}`;
};

// ─── Chi può fare cosa ────────────────────────────────────────────────────────
// Le azioni sensibili stanno in lib/separazione.js. Qui le altre azioni della
// garanzia, che spettano a una funzione precisa; due restringono «disporre il
// pagamento» alla funzione della sezione: i bonifici la tesoreria, gli
// indennizzi la funzione indennizzi.
export const AZIONI_GARANZIA = {
    registra_contatto: { etichetta: 'Registrare un contatto con l’inquilino', funzioni: ['gestore_pratica'] },
    scrivi_nota: { etichetta: 'Scrivere una nota interna', funzioni: ['gestore_pratica', 'resp_legale'] },
    respingi_piano: {
        etichetta: 'Respingere il piano di rientro', funzioni: ['resp_legale'],
        diversoDa: ['propostoDa'], incompatibilita: 'Chi propone un piano di rientro non lo giudica',
    },
    chiedi_legale: { etichetta: 'Chiedere il passaggio al legale', funzioni: ['gestore_pratica'] },
    decidi_legale: { etichetta: 'Decidere il passaggio al legale', funzioni: ['resp_legale'] },
    disponi_bonifico: { etichetta: 'Disporre un bonifico in uscita', funzioni: ['tesoreria'], separata: 'disponi_pagamento' },
    disponi_indennizzo: { etichetta: 'Istruire e disporre un indennizzo', funzioni: ['indennizzi'], separata: 'disponi_pagamento' },
    rimanda_pagamento: {
        etichetta: 'Rimandare indietro un pagamento', funzioni: ['resp_amministrativo'],
        diversoDa: ['dispostoDa'], incompatibilita: 'Chi dispone un pagamento non lo giudica',
    },
    esegui_bonifico: { etichetta: 'Registrare il bonifico eseguito', funzioni: ['tesoreria'] },
    invia_rendiconto: { etichetta: 'Inviare il rendiconto al riassicuratore', funzioni: ['resp_amministrativo'] },
};

const elencoNomi = (nomi) => (nomi.length <= 1 ? nomi.join('') : `${nomi.slice(0, -1).join(', ')} o ${nomi[nomi.length - 1]}`);

/**
 * Come verificaAzione di lib/separazione.js, per le azioni della garanzia.
 * Per le azioni di AZIONI passa direttamente a verificaAzione.
 */
export const verificaGaranzia = (azione, { operatoreId, record = {} }) => {
    const a = AZIONI_GARANZIA[azione];
    if (!a) return verificaAzione(azione, { operatoreId, record });
    const chiPuo = elencoNomi(a.funzioni.map(f => FUNZIONI[f].etichetta.toLowerCase()));
    const operatore = trovaOperatore(operatoreId);
    // L'admin fa le azioni di ogni funzione; «persona diversa da» vale anche per lui.
    if (!operatore || !(operatore.funzione === 'admin' || a.funzioni.includes(operatore.funzione))) {
        return { consentito: false, motivo: `${a.etichetta} spetta a: ${chiPuo}.`, chiPuo };
    }
    if ((a.diversoDa || []).some(c => record[c] === operatoreId)) {
        return { consentito: false, motivo: `${a.incompatibilita}: qui è ${nomeOperatore(operatoreId)}.`, chiPuo };
    }
    if (a.separata) return verificaAzione(a.separata, { operatoreId, record });
    return { consentito: true, motivo: null, chiPuo };
};

export const etichettaAzione = (azione) => AZIONI_GARANZIA[azione]?.etichetta || AZIONI[azione]?.etichetta || azione;

// ─── Chi vede cosa (§13.5) ────────────────────────────────────────────────────
// Il ruolo dice che tipo di dati si vedono, l'assegnazione su quali pratiche.
// La direzione vede solo aggregati, il DPO il registro e non i dati.
const VEDONO = {
    morosita: ['gestore_pratica', 'resp_legale', 'responsabile_operativo', 'indennizzi', 'resp_amministrativo', 'assistenza'],
    indennizzi: ['indennizzi', 'resp_amministrativo', 'tesoreria', 'responsabile_operativo', 'gestore_pratica', 'resp_legale'],
    bonifici: ['tesoreria', 'resp_amministrativo', 'indennizzi', 'responsabile_operativo'],
};

/** 'dettaglio' · 'aggregati' · 'registro' · 'nessuna' */
export const vistaGaranzia = (funzione, sezione) => {
    if (sezione === 'riassicurazione') return 'aggregati';
    if (funzione === 'admin' || VEDONO[sezione]?.includes(funzione)) return 'dettaglio';
    if (funzione === 'direzione') return 'aggregati';
    if (funzione === 'dpo') return 'registro';
    return 'nessuna';
};

export const chiVedeLaSezione = (sezione) => elencoNomi((VEDONO[sezione] || []).map(f => FUNZIONI[f].etichetta.toLowerCase()));

// Contatti, recapiti e note interne: solo chi ha la pratica in coda — il gestore
// titolare — e chi ne risponde.
export const vedeFascicolo = (operatore, pratica) => {
    if (operatore.funzione === 'gestore_pratica') return pratica.gestoreId === operatore.id;
    return ['admin', 'resp_legale', 'responsabile_operativo'].includes(operatore.funzione);
};

// L'IBAN per intero lo vedono tesoreria, responsabile amministrativa e l'admin.
export const vedeIban = (funzione) => ['admin', 'tesoreria', 'resp_amministrativo'].includes(funzione);

export const mascheraIban = (iban) => (iban ? `${iban.slice(0, 4)} •••• ${iban.slice(-4)}` : '—');

export const formattaIban = (iban) => (iban ? iban.replace(/(.{4})/g, '$1 ').trim() : '—');

// ─── Fasi e termini (§13.6) ───────────────────────────────────────────────────
const fase = (chiave, { decorrenza, chiusaIl = null, nonDovuta = false, rif }) => {
    const t = TERMINI[chiave];
    const termine = calcolaTermine({ decorrenza, giorni: t.giorni, calendario: t.calendario });
    let stato;
    let mancano = null;
    if (chiusaIl) stato = chiusaIl <= termine ? 'nel_termine' : 'fuori_termine';
    else if (nonDovuta) stato = 'non_dovuta';
    else {
        mancano = mancanoAlTermine(OGGI, termine, t.calendario);
        stato = mancano < 0 ? 'scaduta' : 'in_corso';
    }
    return {
        id: [rif.praticaId, rif.indennizzoId, rif.pianoId, chiave].filter(Boolean).join(':'),
        chiave, etichetta: t.etichetta, funzione: t.funzione, calendario: t.calendario, giorni: t.giorni,
        decorrenza, termine, chiusaIl, stato, mancano,
        urgente: stato === 'scaduta' || (stato === 'in_corso' && mancano <= 1),
        ...rif,
    };
};

export const faseChiusa = (f) => f.stato === 'nel_termine' || f.stato === 'fuori_termine';

// ─── Piani di rientro ─────────────────────────────────────────────────────────
const componiPiano = (pi, s, alLegaleIl) => {
    const pagate = s.ratePagate[pi.id] || {};
    // Il passaggio al legale interrompe il piano che era in corso: il recupero passa all'avvocato.
    const interrottoIl = alLegaleIl && pi.accettatoIl && !pi.respintoIl && !pi.sostituitoIl ? alLegaleIl : null;
    const attivo = !pi.respintoIl && !pi.sostituitoIl && !interrottoIl;
    let prossimaTrovata = false;
    const rate = pi.rate.map(r => {
        const pagataIl = r.pagataIl || pagate[r.n] || null;
        if (pagataIl) return { ...r, pagataIl, stato: 'pagata' };
        if (!attivo || !pi.accettatoIl) return { ...r, pagataIl: null, stato: 'futura' };
        const ritardo = giorniSolariTra(r.scadenza, OGGI);
        if (ritardo > GIORNI_TOLLERANZA_RATA) return { ...r, pagataIl: null, stato: 'saltata' };
        if (ritardo > 0) return { ...r, pagataIl: null, stato: 'scaduta' };
        if (!prossimaTrovata) {
            prossimaTrovata = true;
            return { ...r, pagataIl: null, stato: 'in_scadenza' };
        }
        return { ...r, pagataIl: null, stato: 'futura' };
    });
    const totale = somma(rate, r => r.importo);
    const pagato = somma(rate.filter(r => r.pagataIl), r => r.importo);
    const completo = rate.length > 0 && rate.every(r => r.pagataIl);
    const stato = pi.respintoIl ? 'respinto'
        : pi.sostituitoIl ? 'sostituito'
            : !pi.approvatoIl ? 'proposto'
                : !pi.accettatoIl ? 'approvato'
                    : completo ? 'completato'
                        : interrottoIl ? 'interrotto' : 'in_corso';
    return {
        ...pi, rate, totale, pagato, residuo: totale - pagato, stato, interrottoIl,
        completatoIl: completo ? rate.map(r => r.pagataIl).sort().pop() : null,
        prossima: rate.find(r => r.stato !== 'pagata') || null,
    };
};

// Rate uguali in euro interi; l'ultima assorbe il resto.
export const calcolaRate = (residuo, nRate, primaScadenza) => {
    const base = Math.floor(residuo / nRate);
    const giorno = primaScadenza.slice(8, 10);
    let mese = primaScadenza.slice(0, 7);
    return Array.from({ length: nRate }, (_, i) => {
        const r = { n: i + 1, scadenza: `${mese}-${giorno}`, importo: i === nRate - 1 ? residuo - base * (nRate - 1) : base };
        mese = meseSuccessivo(mese);
        return r;
    });
};

// ─── Pratiche di morosità ─────────────────────────────────────────────────────
const PER_ID_BACKOFFICE = Object.fromEntries(PRATICHE_BACKOFFICE.map(p => [p.id, p]));
const ID_CONDIVISE = new Set(MOROSITA.map(m => m.id));

// Dal database, quando è arrivato: la pratica torna già nella forma di
// partenza, perché le colonne portano i fatti e `dati` il resto.
const daDatabase = (p) => ({
    ...p,
    condivisa: true,
    eventiCondivisi: p.eventi || [],
    contatti: p.contatti || [],
    note: p.note || [],
    pianoBase: (p.piani || []).length
        ? { ...p.piani[0], praticaId: p.id, rate: (p.piani[0].rate || []).map(r => ({ n: r.n, scadenza: r.scadenza, importo: Number(r.importo), pagataIl: r.pagataIl || null })) }
        : null,
});

const praticheDiPartenza = () => {
    const dal = garanziaDalDatabase();
    if (dal) return dal.pratiche.map(daDatabase);
    return praticheDeiDatiDiProva();
};

const praticheDeiDatiDiProva = () => [
    ...MOROSITA.map(m => {
        const { piano: pianoInterno, ...b } = PER_ID_BACKOFFICE[m.id] || {};
        return {
            ...b,
            id: m.id, contrattoId: m.contrattoId, mesi: m.mesi, importo: m.importo, apertaIl: m.apertaIl,
            condivisa: true, eventiCondivisi: m.eventi,
            contatti: b.contatti || [], note: b.note || [],
            pianoBase: m.piano
                ? { ...(pianoInterno || { id: `piano-${m.id}` }), praticaId: m.id, rate: m.piano.rate.map(r => ({ n: r.n, scadenza: r.scadenza, importo: r.importo, pagataIl: r.pagataIl || null })) }
                : null,
        };
    }),
    ...PRATICHE_BACKOFFICE.filter(p => !ID_CONDIVISE.has(p.id)).map(p => ({ ...p, condivisa: false, eventiCondivisi: [], pianoBase: null })),
];

const componiPratica = (base, s) => {
    const p = { ...base, ...(s.pratiche.modifiche[base.id] || {}) };
    const c = trovaContrattoAttuale(p.contrattoId);
    const mesiDati = p.mesi.map(m => c.mesi.find(x => x.mese === m)).filter(Boolean);
    const importo = p.importo ?? c.canone * p.mesi.length;
    const chiusuraMese = chiusuraDelMese(p.mesi[0]);
    // Se una contestazione ha tenuto ferma la pratica, i conti partono da quando si è chiusa.
    const partenza = p.sospensione?.al && p.sospensione.al > chiusuraMese ? p.sospensione.al : chiusuraMese;

    const contatti = [...p.contatti, ...s.contatti.filter(x => x.praticaId === p.id)].sort(perDataOra);
    const primoContatto = contatti.find(x => ESITI_CONTATTO[x.esito]?.raggiunto) || null;
    const note = [...p.note, ...s.note.filter(x => x.praticaId === p.id)].sort((a, b) => a.il.localeCompare(b.il));

    const richiesteLegale = s.legale[p.id] || [];
    const legale = richiesteLegale[richiesteLegale.length - 1] || null;
    const alLegaleIl = legale?.decisione === 'passata' ? legale.decisoIl : null;

    const piani = [...(p.pianoBase ? [p.pianoBase] : []), ...s.piani.filter(x => x.praticaId === p.id)]
        .map(pi => componiPiano({ ...pi, ...(s.pianiModifiche[pi.id] || {}) }, s, alLegaleIl));
    const pianoAttivo = [...piani].reverse().find(x => ['approvato', 'in_corso', 'completato', 'interrotto'].includes(x.stato)) || null;
    const pianoProposto = [...piani].reverse().find(x => x.stato === 'proposto') || null;
    const recuperi = piani.flatMap(pi => pi.rate.filter(r => r.pagataIl).map(r => ({
        praticaId: p.id, il: r.pagataIl, importo: r.importo, fonte: 'rata', pianoId: pi.id, n: r.n,
    })));

    let chiusaIl = p.chiusaIl || null;
    let esito = p.esito || null;
    if (!chiusaIl && pianoAttivo?.stato === 'completato') {
        chiusaIl = pianoAttivo.completatoIl;
        esito = 'rientrata';
    }
    const stato = chiusaIl ? 'chiusa'
        : legale?.decisione === 'passata' ? 'al_legale'
            : pianoProposto ? 'piano_proposto'
                : pianoAttivo?.stato === 'in_corso' ? 'piano_in_corso'
                    : pianoAttivo?.stato === 'approvato' ? 'piano_approvato'
                        : 'aperta';

    const q = {
        ...p, contratto: c, prodotto: PRODOTTI[c.prodotto], mesiDati, importo, chiusuraMese, partenza,
        copertura: mesiDati[0]?.copertura || null,
        contatti, primoContatto, note, piani, pianoAttivo, pianoProposto, recuperi,
        recuperato: somma(recuperi, r => r.importo),
        legale, richiesteLegale, chiusaIl, esito, stato,
        giorniAlPrimoContatto: primoContatto ? giorniSolariTra(partenza, primoContatto.il) : null,
    };
    return { ...q, fasi: fasiPratica(q) };
};

const fasiPratica = (p) => {
    const rif = { entita: 'pratica', praticaId: p.id };
    const decorrenza = p.sospensione?.al && p.sospensione.al > p.apertaIl ? p.sospensione.al : p.apertaIl;
    const fasi = [fase('primo_contatto', { decorrenza, chiusaIl: p.primoContatto?.il, nonDovuta: !!p.chiusaIl, rif })];

    const richiesta = p.contatti.find(x => x.esito === 'chiede_piano');
    if (richiesta) {
        const proposta = p.piani.find(pi => pi.propostoIl >= richiesta.il);
        fasi.push(fase('proposta_piano', { decorrenza: richiesta.il, chiusaIl: proposta?.propostoIl, nonDovuta: !!p.chiusaIl || p.stato === 'al_legale', rif }));
    }
    p.piani.forEach(pi => fasi.push(fase('decisione_piano', {
        decorrenza: pi.propostoIl, chiusaIl: pi.approvatoIl || pi.respintoIl || null, nonDovuta: !!p.chiusaIl, rif: { ...rif, pianoId: pi.id },
    })));
    if (p.legale) fasi.push(fase('decisione_legale', { decorrenza: p.legale.richiestoIl, chiusaIl: p.legale.decisoIl || null, rif }));
    return fasi;
};

// ─── Indennizzi ───────────────────────────────────────────────────────────────
// L'istruttoria: le quattro condizioni della copertura (§9.2), lette dal mese.
const controlliIndennizzo = (c, m, p) => {
    const prod = PRODOTTI[c.prodotto];
    const inizioCopertura = prod.garanzia ? meseDopo(c.attivoDal, prod.franchigiaMesi) : null;
    const k = m.contestazioneId ? CONTESTAZIONI.find(x => x.id === m.contestazioneId) : null;
    const contestazioneOk = !k || k.stato === 'risolta_favore_locatore' || p?.sospensione?.esito === 'risolta_favore_locatore';
    return [
        {
            chiave: 'garanzia', ok: !!prod.garanzia,
            testo: prod.garanzia ? `${nomeProdotto(c.prodotto)}: prodotto con garanzia` : `${nomeProdotto(c.prodotto)}: senza garanzia`,
        },
        {
            chiave: 'finestra', ok: m.segnalazione.tipo === 'non_pagato' && m.segnalazione.il <= fineFinestra(m.mese),
            testo: m.segnalazione.tipo === 'non_pagato'
                ? `Segnalato non pagato ${ilGiorno(m.segnalazione.il)}: la finestra chiudeva ${ilGiorno(fineFinestra(m.mese))}`
                : 'Mancato pagamento mai segnalato',
        },
        {
            chiave: 'franchigia', ok: !!inizioCopertura && m.mese >= inizioCopertura,
            testo: inizioCopertura ? `Fuori franchigia: la garanzia copre da ${nomeMese(inizioCopertura).toLowerCase()}` : 'Nessuna franchigia: manca la garanzia',
        },
        {
            chiave: 'contestazione', ok: contestazioneOk,
            testo: !k ? 'Nessuna contestazione sul mese'
                : contestazioneOk ? 'Contestazione chiusa a favore del proprietario' : 'Contestazione in corso: tutto fermo finché CRIA non decide',
        },
    ];
};

const indennizziDiPartenza = () => garanziaDalDatabase()?.indennizzi || INDENNIZZI;

const componiIndennizzi = (s, perPratica) => [...indennizziDiPartenza(), ...s.indennizzi.nuovi]
    .map(i => ({ ...i, ...(s.indennizzi.modifiche[i.id] || {}) }))
    .map(i => {
        const c = trovaContrattoAttuale(i.contrattoId);
        const m = c.mesi.find(x => x.mese === i.mese);
        const p = perPratica[i.praticaId] || null;
        const bonificoId = `bon-${i.id}`;
        const b = s.bonifici[bonificoId] || {};
        const eseguitoIl = b.eseguitoIl || i.eseguitoIl || null;
        const stato = eseguitoIl ? 'pagato' : i.autorizzatoIl ? 'autorizzato' : i.dispostoIl ? 'disposto' : 'da_disporre';
        const rif = { entita: 'indennizzo', indennizzoId: i.id, praticaId: i.praticaId };
        const apertura = p?.sospensione?.al && p.sospensione.al > p.apertaIl ? p.sospensione.al : p?.apertaIl || OGGI;
        const fasi = [fase('disposizione_indennizzo', { decorrenza: apertura, chiusaIl: i.dispostoIl || null, rif })];
        if (i.dispostoIl) fasi.push(fase('autorizzazione', { decorrenza: i.dispostoIl, chiusaIl: i.autorizzatoIl || null, rif }));
        fasi.push(fase('pagamento_indennizzo', { decorrenza: p?.partenza || chiusuraDelMese(i.mese), chiusaIl: eseguitoIl, rif }));
        return {
            ...i, contratto: c, meseDati: m, pratica: p,
            beneficiarioId: c.locatore.personaId, beneficiario: c.locatore.nome,
            bonificoId, eseguitoIl, eseguitoDa: b.eseguitoDa || i.eseguitoDa || null, riferimento: b.riferimento || i.riferimento || null,
            pagatoIl: eseguitoIl, stato, istruttoria: controlliIndennizzo(c, m, p), fasi,
        };
    });

// ─── Bonifici in uscita ───────────────────────────────────────────────────────
const componiBonifici = (s, indennizzi) => {
    const daIndennizzi = indennizzi.filter(i => i.autorizzatoIl).map(i => ({
        id: i.bonificoId, tipo: 'indennizzo', indennizzoId: i.id, praticaId: i.praticaId,
        contrattoId: i.contrattoId, mese: i.mese,
        beneficiarioId: i.beneficiarioId, beneficiario: i.beneficiario, importo: i.importo,
        causale: `Indennizzo di ${nomeMese(i.mese).toLowerCase()} · ${i.contratto.immobile.indirizzo} · ${i.contratto.codiceUnivoco}`,
        natoIl: i.autorizzatoIl,
        dispostoDa: i.dispostoDa, dispostoIl: i.dispostoIl, autorizzatoDa: i.autorizzatoDa, autorizzatoIl: i.autorizzatoIl,
        eseguitoDa: i.eseguitoDa, eseguitoIl: i.eseguitoIl, riferimento: i.riferimento,
        termineFinale: i.fasi.find(f => f.chiave === 'pagamento_indennizzo')?.termine || null,
    }));
    const canoni = CANONI_GIRATI.map(b => ({
        ...b, termineFinale: calcolaTermine({ decorrenza: b.natoIl, giorni: TERMINI.canone_girato.giorni, calendario: TERMINI.canone_girato.calendario }),
    }));
    return [...canoni, ...PROVVIGIONI_DA_PAGARE, ...daIndennizzi]
        .map(b => ({ ...b, ...(s.bonifici[b.id] || {}) }))
        .map(b => {
            const stato = b.eseguitoIl ? 'eseguito' : b.autorizzatoIl ? 'autorizzato' : b.dispostoIl ? 'disposto' : 'da_disporre';
            // Il termine del passo in corso: l'autorizzazione ha il suo, il resto guarda la scadenza verso il beneficiario.
            const termine = stato === 'disposto'
                ? calcolaTermine({ decorrenza: b.dispostoIl, giorni: TERMINI.autorizzazione.giorni, calendario: TERMINI.autorizzazione.calendario })
                : stato === 'eseguito' ? null : b.termineFinale || null;
            const calendario = stato === 'disposto' ? TERMINI.autorizzazione.calendario : 'solari';
            const mancano = termine ? mancanoAlTermine(OGGI, termine, calendario) : null;
            return {
                ...b, stato, iban: b.iban || CONTI_ACCREDITO[b.beneficiarioId]?.iban || null,
                termine, calendario, mancano, urgente: mancano != null && mancano <= 1,
                nelTermine: b.eseguitoIl && b.termineFinale ? b.eseguitoIl <= b.termineFinale : null,
            };
        })
        .sort((a, b) => (b.eseguitoIl || b.natoIl).localeCompare(a.eseguitoIl || a.natoIl));
};

// ─── Mesi fuori dalle pratiche ────────────────────────────────────────────────
// Segnalati non pagati e ancora senza incasso, ma senza pratica: dice perché.
const mesiSenzaPratica = (pratiche) => {
    const inPratica = new Set(pratiche.flatMap(p => p.mesi.map(m => `${p.contrattoId}|${m}`)));
    return contrattiAttuali().flatMap(c => c.mesi
        .filter(m => m.segnalazione.tipo === 'non_pagato' && m.stato !== 'pagato' && !inPratica.has(`${c.id}|${m.mese}`))
        .map(m => {
            const contestazione = m.contestazioneId ? CONTESTAZIONI.find(x => x.id === m.contestazioneId) || null : null;
            const motivo = !PRODOTTI[c.prodotto].garanzia ? 'senza_garanzia'
                : m.stato === 'contestato' ? 'contestazione'
                    : m.stato === 'in_attesa' ? 'contestabile'
                        : 'da_aprire';
            return { id: `${c.id}|${m.mese}`, contratto: c, mese: m, motivo, contestazione };
        }));
};

// I mesi dei contratti con garanzia che non arrivano a un indennizzo, e perché.
const mesiSenzaIndennizzo = (pratiche, indennizzi) => {
    const conIndennizzo = new Set(indennizzi.map(i => `${i.contrattoId}|${i.mese}`));
    const praticaDel = (c, mese) => pratiche.find(p => p.contrattoId === c.id && p.mesi.includes(mese)) || null;
    return contrattiAttuali().filter(c => PRODOTTI[c.prodotto].garanzia).flatMap(c => c.mesi
        .filter(m => !conIndennizzo.has(`${c.id}|${m.mese}`))
        .map(m => {
            const pratica = praticaDel(c, m.mese);
            if (m.stato === 'non_rilevato') return { motivo: 'non_rilevato', m };
            if (m.stato === 'contestato') return { motivo: 'contestazione', m, pratica };
            if (m.stato === 'pagato' && m.giorno > PARAMETRI.giornoChiusuraMese) return { motivo: 'pagato_dopo', m, pratica };
            if (m.stato !== 'pagato' && m.copertura === 'in_franchigia') return { motivo: 'in_franchigia', m, pratica };
            if (m.stato !== 'pagato' && m.copertura === 'decaduta_tardiva') return { motivo: 'tardiva', m, pratica };
            if (m.stato !== 'pagato' && pratica) return { motivo: 'in_istruttoria', m, pratica };
            return null;
        })
        .filter(Boolean)
        .map(x => ({ ...x, id: `${c.id}|${x.m.mese}`, contratto: c })))
        .sort((a, b) => b.m.mese.localeCompare(a.m.mese));
};

// ─── Indicatori (§13.6) ───────────────────────────────────────────────────────
// Il tempo dalla chiusura del mese al primo contatto andato a segno, in giorni
// solari; e la quota di fasi chiuse entro il termine, fra quelle chiuse.
export const misuraIndicatori = (pratiche, fasi, dal, al) => {
    const giorni = pratiche.filter(p => p.primoContatto && traDate(p.primoContatto.il, dal, al)).map(p => p.giorniAlPrimoContatto);
    const chiuse = fasi.filter(f => faseChiusa(f) && traDate(f.chiusaIl, dal, al));
    const nelTermine = chiuse.filter(f => f.stato === 'nel_termine').length;
    return {
        primoContatto: { media: giorni.length ? Math.round((somma(giorni, g => g) / giorni.length) * 10) / 10 : null, n: giorni.length },
        fasi: { nelTermine, totale: chiuse.length, percentuale: chiuse.length ? Math.round((nelTermine / chiuse.length) * 100) : null },
    };
};

export const DODICI_MESI_FA = aggiungiGiorniSolari(OGGI, -365);

// ─── Riassicurazione ──────────────────────────────────────────────────────────
const componiPeriodi = (s, pratiche, indennizzi, recuperi, fasi) => {
    const elenco = [];
    for (let t = PRIMO_TRIMESTRE; t <= trimestreDi(OGGI); t = trimestreSuccessivo(t)) elenco.push(t);
    const garantiti = contrattiAttuali().filter(c => PRODOTTI[c.prodotto].garanzia);
    return elenco.map(t => {
        const { dal, al, mesi } = confiniTrimestre(t);
        const mesiContratto = garantiti.flatMap(c => mesi.filter(m => c.mesi.some(x => x.mese === m)).map(() => c));
        const commissioni = arrotonda(somma(mesiContratto, c => c.canone * PRODOTTI[c.prodotto].percentuale / 100));
        const sinistri = pratiche.filter(p => traDate(p.apertaIl, dal, al) && p.copertura === 'attiva');
        const inviato = s.rendiconti[t] || RENDICONTI_INVIATI[t] || null;
        const chiuso = al < OGGI;
        const termine = calcolaTermine({ decorrenza: al, giorni: TERMINI.rendiconto.giorni, calendario: TERMINI.rendiconto.calendario });
        return {
            id: t, etichetta: etichettaTrimestre(t), dal, al, chiuso,
            contratti: new Set(mesiContratto.map(c => c.id)).size,
            mesiContratto: mesiContratto.length,
            commissioni,
            premioCeduto: arrotonda(commissioni * QUOTA_RIASSICURAZIONE),
            sinistri: sinistri.length,
            sinistriConIndennizzo: sinistri.filter(p => indennizzi.some(i => i.praticaId === p.id)).length,
            indennizziPagati: somma(indennizzi.filter(i => traDate(i.pagatoIl, dal, al)), i => i.importo),
            recuperi: somma(recuperi.filter(r => traDate(r.il, dal, al)), r => r.importo),
            indicatori: misuraIndicatori(pratiche, fasi, dal, al),
            inviatoIl: inviato?.inviatoIl || null, inviatoDa: inviato?.inviatoDa || null,
            termine, mancano: !inviato && chiuso ? mancanoAlTermine(OGGI, termine, 'solari') : null,
            stato: inviato ? 'inviato' : chiuso ? 'da_inviare' : 'in_corso',
        };
    });
};

// ─── Tutto insieme ────────────────────────────────────────────────────────────
const componi = (grezzo) => {
    const s = { ...vuoto(), ...grezzo };
    const senzaIndennizzo = [...praticheDiPartenza(), ...s.pratiche.nuove].map(p => componiPratica(p, s));
    const perPratica = Object.fromEntries(senzaIndennizzo.map(p => [p.id, p]));
    const indennizzi = componiIndennizzi(s, perPratica);
    const pratiche = senzaIndennizzo
        .map(p => ({ ...p, indennizzo: indennizzi.find(i => i.praticaId === p.id) || null }))
        .sort((a, b) => b.apertaIl.localeCompare(a.apertaIl));
    const bonifici = componiBonifici(s, indennizzi);
    const recuperi = pratiche.flatMap(p => p.recuperi);
    const fasi = [...pratiche.flatMap(p => p.fasi), ...indennizzi.flatMap(i => i.fasi)];
    return {
        pratiche, indennizzi, bonifici, recuperi, fasi,
        periodi: componiPeriodi(s, pratiche, indennizzi, recuperi, fasi),
        senzaPratica: mesiSenzaPratica(pratiche),
        senzaIndennizzo: mesiSenzaIndennizzo(pratiche, indennizzi),
        indicatori: misuraIndicatori(pratiche, fasi, DODICI_MESI_FA, OGGI),
        trimestreInCorso: misuraIndicatori(pratiche, fasi, confiniTrimestre(trimestreDi(OGGI)).dal, OGGI),
    };
};

export const useGaranzia = () => {
    const s = store.useStore();
    const dalDatabase = useGaranziaDalDatabase();
    // «dalDatabase» non si legge qui dentro: rifà il conto quando i dati veri
    // arrivano, perché componi li prende da sé.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => componi(s), [s, dalDatabase]);
};

// Per il motore delle scadenze (O-18): le fasi della garanzia con decorrenza, termine e stato.
export const useFasiGaranzia = () => useGaranzia().fasi;

// Lo stesso, fuori da React: per le funzioni pure del motore delle scadenze.
export const garanziaAttuale = () => componi(store.leggi());

// Per l'area dell'avvocato (lotto 7): le pratiche che la responsabile legale gli ha affidato.
export const usePraticheAvvocato = (personaId) => {
    const { pratiche } = useGaranzia();
    return useMemo(() => pratiche.filter(p => p.legale?.decisione === 'passata' && p.legale.avvocatoId === personaId), [pratiche, personaId]);
};

// ─── Riepilogo per la panoramica per funzione (O-01) ──────────────────────────
const contaPer = (lista, chiave) => lista.reduce((acc, x) => ({ ...acc, [x[chiave]]: (acc[x[chiave]] || 0) + 1 }), {});
const percorsoDi = (lista, base, id) => (lista.length === 1 ? `${base}/${id(lista[0])}` : base);
const fmtNumero = (n) => n.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const riepilogo = (g) => {
    const MOROSITA_URL = '/dashboard/admin/morosita';
    const aperte = g.pratiche.filter(p => p.stato !== 'chiusa');
    const daContattare = aperte.filter(p => !p.primoContatto);
    const conUrgenze = aperte.filter(p => p.fasi.some(f => f.urgente && f.funzione === 'gestore_pratica')
        || p.pianoAttivo?.rate.some(r => r.stato === 'scaduta' || r.stato === 'saltata'));
    const piani = g.pratiche.filter(p => p.pianoProposto);
    const legale = g.pratiche.filter(p => p.legale && !p.legale.decisione);
    const indDaDisporre = g.indennizzi.filter(i => i.stato === 'da_disporre');
    const bonDaDisporre = g.bonifici.filter(b => b.stato === 'da_disporre');
    const bonDaEseguire = g.bonifici.filter(b => b.stato === 'autorizzato');
    const bonDaAutorizzare = g.bonifici.filter(b => b.stato === 'disposto');
    const indDaAutorizzare = g.indennizzi.filter(i => i.stato === 'disposto');
    const rendiconti = g.periodi.filter(t => t.stato === 'da_inviare');
    const urgenteFase = (lista, chiave) => lista.filter(x => x.fasi.some(f => f.chiave === chiave && f.urgente)).length;
    const { primoContatto, fasi } = g.indicatori;

    return [
        {
            chiave: 'morosita_aperte', funzione: 'gestore_pratica', etichetta: 'Pratiche di morosità aperte',
            valore: aperte.length, urgenti: conUrgenze.length,
            nota: daContattare.length ? `${daContattare.length} ${daContattare.length === 1 ? 'primo contatto da fare' : 'primi contatti da fare'}` : 'Tutti gli inquilini già contattati',
            percorso: MOROSITA_URL, perOperatore: contaPer(aperte, 'gestoreId'),
            urgentiPerOperatore: contaPer(conUrgenze, 'gestoreId'),
        },
        {
            chiave: 'piani_da_approvare', funzione: 'resp_legale', etichetta: 'Piani di rientro da approvare',
            valore: piani.length, urgenti: urgenteFase(piani, 'decisione_piano'),
            nota: 'Chi propone non approva',
            percorso: percorsoDi(piani, MOROSITA_URL, p => p.id),
        },
        {
            chiave: 'legale_da_decidere', funzione: 'resp_legale', etichetta: 'Passaggi al legale da decidere',
            valore: legale.length, urgenti: urgenteFase(legale, 'decisione_legale'),
            percorso: percorsoDi(legale, MOROSITA_URL, p => p.id),
        },
        {
            chiave: 'indennizzi_da_disporre', funzione: 'indennizzi', etichetta: 'Indennizzi da istruire e disporre',
            valore: indDaDisporre.length, urgenti: urgenteFase(indDaDisporre, 'disposizione_indennizzo'),
            nota: indDaDisporre.length ? `${somma(indDaDisporre, i => i.importo).toLocaleString('it-IT')} € ai proprietari` : undefined,
            percorso: '/dashboard/admin/indennizzi',
        },
        {
            chiave: 'bonifici_da_disporre', funzione: 'tesoreria', etichetta: 'Bonifici da disporre',
            valore: bonDaDisporre.length, urgenti: bonDaDisporre.filter(b => b.urgente).length,
            percorso: '/dashboard/admin/bonifici',
        },
        {
            chiave: 'bonifici_da_eseguire', funzione: 'tesoreria', etichetta: 'Bonifici autorizzati da eseguire',
            valore: bonDaEseguire.length, urgenti: bonDaEseguire.filter(b => b.urgente).length,
            percorso: '/dashboard/admin/bonifici',
        },
        {
            chiave: 'pagamenti_da_autorizzare', funzione: 'resp_amministrativo', etichetta: 'Bonifici e indennizzi da autorizzare',
            valore: bonDaAutorizzare.length + indDaAutorizzare.length,
            urgenti: bonDaAutorizzare.filter(b => b.urgente).length + urgenteFase(indDaAutorizzare, 'autorizzazione'),
            nota: bonDaAutorizzare.length + indDaAutorizzare.length
                ? `${bonDaAutorizzare.length} ${bonDaAutorizzare.length === 1 ? 'bonifico' : 'bonifici'} · ${indDaAutorizzare.length} ${indDaAutorizzare.length === 1 ? 'indennizzo' : 'indennizzi'} · chi dispone non autorizza`
                : 'Chi dispone non autorizza',
            percorso: indDaAutorizzare.length && !bonDaAutorizzare.length ? '/dashboard/admin/indennizzi' : '/dashboard/admin/bonifici',
        },
        {
            chiave: 'rendiconto_da_inviare', funzione: 'resp_amministrativo', etichetta: 'Rendiconti al riassicuratore da inviare',
            valore: rendiconti.length, urgenti: rendiconti.filter(t => t.mancano <= 7).length,
            nota: rendiconti.length ? `${rendiconti[0].etichetta}: entro ${ilGiorno(rendiconti[0].termine)}` : undefined,
            percorso: '/dashboard/admin/riassicurazione',
        },
        {
            chiave: 'primo_contatto', funzione: 'direzione', tipo: 'indicatore', etichetta: 'Tempo medio al primo contatto',
            valore: primoContatto.media, unita: 'giorni',
            testo: primoContatto.media == null ? '—' : `${fmtNumero(primoContatto.media)} giorni`,
            nota: `Dalla chiusura del mese, ultimi 12 mesi · ${primoContatto.n} ${primoContatto.n === 1 ? 'pratica' : 'pratiche'}`,
            percorso: '/dashboard/admin/riassicurazione',
        },
        {
            chiave: 'fasi_nel_termine', funzione: 'direzione', tipo: 'indicatore', etichetta: 'Fasi chiuse nel termine',
            valore: fasi.percentuale, unita: '%',
            testo: fasi.percentuale == null ? '—' : `${fasi.percentuale}%`,
            nota: `${fasi.nelTermine} su ${fasi.totale}, morosità e indennizzi, ultimi 12 mesi`,
            percorso: '/dashboard/admin/riassicurazione',
        },
    ];
};

/**
 * Le code della garanzia e della tesoreria per la panoramica per funzione.
 * Una voce per coda: { chiave, funzione, etichetta, valore, urgenti, nota?,
 * percorso, perOperatore?, urgentiPerOperatore? }; più due indicatori (tipo 'indicatore'):
 * tempo medio al primo contatto e fasi chiuse nel termine.
 */
export const useRiepilogoGaranzia = () => {
    const g = useGaranzia();
    return useMemo(() => riepilogo(g), [g]);
};

// ─── Azioni ───────────────────────────────────────────────────────────────────
// Ognuna ricontrolla chi la fa e restituisce { ok, motivo }.
const rifiuto = (motivo) => ({ ok: false, motivo });
const FATTO = { ok: true };

const controlla = (azione, operatoreId, record) => {
    const v = verificaGaranzia(azione, { operatoreId, record });
    return v.consentito ? null : rifiuto(v.motivo);
};

const modifica = (ramo, id, cambi) => store.aggiorna(s => {
    const t = { ...vuoto(), ...s };
    return { ...t, [ramo]: { ...t[ramo], [id]: { ...(t[ramo][id] || {}), ...cambi } } };
});

const modificaIndennizzo = (id, cambi) => store.aggiorna(s => {
    const t = { ...vuoto(), ...s };
    return { ...t, indennizzi: { ...t.indennizzi, modifiche: { ...t.indennizzi.modifiche, [id]: { ...(t.indennizzi.modifiche[id] || {}), ...cambi } } } };
});

const aggiungi = (ramo, voce) => store.aggiorna(s => {
    const t = { ...vuoto(), ...s };
    return { ...t, [ramo]: [...t[ramo], voce] };
});

const nuovoRiferimento = () => `CRIA${OGGI.replace(/-/g, '')}${String(Math.floor(Math.random() * 900) + 100)}`;

// Le azioni si vedono subito (lo store) e vanno anche nel database, quando i
// dati vengono da lì: le regole delle due firme le ricontrolla il database, e
// se rifiuta si vede.
const nelDatabase = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(String(id));
const anchePerDavvero = (promessa) => {
    promessa.then(esito => { if (esito && esito.ok === false) toast.error(esito.messaggio); }).catch(() => {});
};
const aperta = (p) => p.stato !== 'chiusa';

export const registraContatto = (p, operatoreId, dati) => {
    const no = controlla('registra_contatto', operatoreId, p);
    if (no) return no;
    if (!aperta(p)) return rifiuto('La pratica è chiusa.');
    if (!dati.il || dati.il > OGGI || dati.il < p.apertaIl) return rifiuto(`La data va fra l’apertura (${fmtData(p.apertaIl)}) e oggi.`);
    if (!dati.ora) return rifiuto('Manca l’ora del contatto.');
    aggiungi('contatti', { id: nuovoIdDemo('ct'), praticaId: p.id, ...dati, registratoDa: operatoreId, registratoIl: OGGI });
    if (nelDatabase(p.morositaDb)) {
        anchePerDavvero(registraContattoDb(p.morositaDb, { canale: dati.canale, esito: dati.esito, nota: dati.nota || null, il: `${dati.il} ${dati.ora}` }));
    }
    return FATTO;
};

export const scriviNota = (p, operatoreId, testo) => {
    const no = controlla('scrivi_nota', operatoreId, p);
    if (no) return no;
    if (!testo.trim()) return rifiuto('La nota è vuota.');
    aggiungi('note', { id: nuovoIdDemo('nt'), praticaId: p.id, il: OGGI, autore: operatoreId, testo: testo.trim() });
    if (nelDatabase(p.morositaDb)) anchePerDavvero(scriviNotaDb('morosita', p.morositaDb, testo.trim()));
    return FATTO;
};

export const proponiPiano = (p, operatoreId, { nRate, primaScadenza, nota }) => {
    const no = controlla('proponi_piano', operatoreId, {});
    if (no) return no;
    if (!aperta(p) || p.stato === 'al_legale') return rifiuto('Su questa pratica non si propone un piano.');
    if (p.pianoProposto) return rifiuto('C’è già un piano in attesa di decisione.');
    const residuo = p.importo - p.recuperato;
    if (residuo <= 0) return rifiuto('Non c’è niente da rientrare.');
    if (!primaScadenza || primaScadenza <= OGGI) return rifiuto('La prima rata deve scadere dopo oggi.');
    aggiungi('piani', {
        id: nuovoIdDemo('piano'), praticaId: p.id, propostoDa: operatoreId, propostoIl: OGGI,
        nota: nota?.trim() || '', rate: calcolaRate(residuo, nRate, primaScadenza),
    });
    if (nelDatabase(p.morositaDb)) {
        anchePerDavvero(proponiPianoDb(p.morositaDb, { nRate, primaScadenza, nota: nota?.trim() || '', importo: residuo }));
    }
    return FATTO;
};

export const approvaPiano = (p, piano, operatoreId) => {
    const no = controlla('approva_piano', operatoreId, { propostoDa: piano.propostoDa });
    if (no) return no;
    if (piano.stato !== 'proposto') return rifiuto('Il piano non è in attesa di decisione.');
    store.aggiorna(s => {
        const t = { ...vuoto(), ...s };
        const mod = { ...t.pianiModifiche, [piano.id]: { ...(t.pianiModifiche[piano.id] || {}), approvatoDa: operatoreId, approvatoIl: OGGI } };
        // Il piano nuovo prende il posto di quello in corso: le rate già pagate restano rientrate.
        p.piani.filter(x => x.id !== piano.id && ['approvato', 'in_corso'].includes(x.stato)).forEach(x => {
            mod[x.id] = { ...(mod[x.id] || {}), sostituitoIl: OGGI };
        });
        return { ...t, pianiModifiche: mod };
    });
    if (nelDatabase(piano.id)) anchePerDavvero(approvaPianoDb(piano.id));
    return FATTO;
};

export const respingiPiano = (piano, operatoreId, motivo) => {
    const no = controlla('respingi_piano', operatoreId, { propostoDa: piano.propostoDa });
    if (no) return no;
    if (piano.stato !== 'proposto') return rifiuto('Il piano non è in attesa di decisione.');
    if (!motivo.trim()) return rifiuto('Scrivi perché lo respingi: il gestore deve saperlo.');
    modifica('pianiModifiche', piano.id, { respintoDa: operatoreId, respintoIl: OGGI, motivoRespinta: motivo.trim() });
    return FATTO;
};

export const chiediPassaggioLegale = (p, operatoreId, { motivo, nota }) => {
    const no = controlla('chiedi_legale', operatoreId, p);
    if (no) return no;
    if (!aperta(p) || p.stato === 'al_legale') return rifiuto('La pratica non è più del gestore.');
    if (p.legale && !p.legale.decisione) return rifiuto('C’è già una richiesta in attesa di decisione.');
    store.aggiorna(s => {
        const t = { ...vuoto(), ...s };
        return { ...t, legale: { ...t.legale, [p.id]: [...(t.legale[p.id] || []), { motivo, nota: nota?.trim() || '', richiestoDa: operatoreId, richiestoIl: OGGI, decisione: null }] } };
    });
    return FATTO;
};

// La responsabile legale decide su una richiesta del gestore, oppure passa la
// pratica di sua iniziativa: in quel caso la richiesta nasce con la decisione.
export const decidiPassaggioLegale = (p, operatoreId, { decisione, nota, motivo }) => {
    const no = controlla('decidi_legale', operatoreId, p);
    if (no) return no;
    if (!aperta(p) || p.stato === 'al_legale') return rifiuto('La pratica è già al legale o chiusa.');
    if (decisione === 'respinta' && !nota?.trim()) return rifiuto('Scrivi perché la pratica resta al gestore.');
    store.aggiorna(s => {
        const t = { ...vuoto(), ...s };
        const richieste = [...(t.legale[p.id] || [])];
        const inAttesa = richieste.length && !richieste[richieste.length - 1].decisione;
        const base = inAttesa ? richieste.pop() : { motivo, nota: '', richiestoDa: operatoreId, richiestoIl: OGGI };
        richieste.push({
            ...base, decisione, decisoDa: operatoreId, decisoIl: OGGI, notaDecisione: nota?.trim() || '',
            avvocatoId: decisione === 'passata' ? AVVOCATO_CONVENZIONATO : null,
        });
        return { ...t, legale: { ...t.legale, [p.id]: richieste } };
    });
    return FATTO;
};

export const disponiIndennizzo = (i, operatoreId) => {
    const no = controlla('disponi_indennizzo', operatoreId, i);
    if (no) return no;
    if (i.stato !== 'da_disporre') return rifiuto('L’indennizzo non è più da disporre.');
    const mancante = i.istruttoria.find(x => !x.ok);
    if (mancante) return rifiuto(`L’istruttoria non torna: ${mancante.testo.toLowerCase()}.`);
    modificaIndennizzo(i.id, { dispostoDa: operatoreId, dispostoIl: OGGI });
    if (nelDatabase(i.id)) anchePerDavvero(disponiIndennizzoDb(i.id, i.notaIstruttoria || null));
    return FATTO;
};

export const autorizzaIndennizzo = (i, operatoreId) => {
    const no = controlla('autorizza_pagamento', operatoreId, { dispostoDa: i.dispostoDa });
    if (no) return no;
    if (i.stato !== 'disposto') return rifiuto('L’indennizzo non è in attesa di autorizzazione.');
    modificaIndennizzo(i.id, { autorizzatoDa: operatoreId, autorizzatoIl: OGGI });
    if (nelDatabase(i.id)) anchePerDavvero(autorizzaIndennizzoDb(i.id));
    return FATTO;
};

export const rimandaIndennizzo = (i, operatoreId, motivo) => {
    const no = controlla('rimanda_pagamento', operatoreId, { dispostoDa: i.dispostoDa });
    if (no) return no;
    if (i.stato !== 'disposto') return rifiuto('L’indennizzo non è in attesa di autorizzazione.');
    if (!motivo.trim()) return rifiuto('Scrivi perché lo rimandi indietro.');
    modificaIndennizzo(i.id, {
        dispostoDa: null, dispostoIl: null,
        rimandi: [...(i.rimandi || []), { da: operatoreId, il: OGGI, motivo: motivo.trim(), dispostoDa: i.dispostoDa }],
    });
    return FATTO;
};

export const disponiBonifico = (b, operatoreId) => {
    const no = controlla('disponi_bonifico', operatoreId, b);
    if (no) return no;
    if (b.stato !== 'da_disporre') return rifiuto('Il bonifico non è più da disporre.');
    modifica('bonifici', b.id, { dispostoDa: operatoreId, dispostoIl: OGGI });
    return FATTO;
};

export const autorizzaBonifico = (b, operatoreId) => {
    const no = controlla('autorizza_pagamento', operatoreId, { dispostoDa: b.dispostoDa });
    if (no) return no;
    if (b.stato !== 'disposto') return rifiuto('Il bonifico non è in attesa di autorizzazione.');
    modifica('bonifici', b.id, { autorizzatoDa: operatoreId, autorizzatoIl: OGGI });
    return FATTO;
};

export const rimandaBonifico = (b, operatoreId, motivo) => {
    const no = controlla('rimanda_pagamento', operatoreId, { dispostoDa: b.dispostoDa });
    if (no) return no;
    if (b.stato !== 'disposto') return rifiuto('Il bonifico non è in attesa di autorizzazione.');
    if (!motivo.trim()) return rifiuto('Scrivi perché lo rimandi indietro.');
    modifica('bonifici', b.id, {
        dispostoDa: null, dispostoIl: null,
        rimandi: [...(b.rimandi || []), { da: operatoreId, il: OGGI, motivo: motivo.trim(), dispostoDa: b.dispostoDa }],
    });
    return FATTO;
};

export const eseguiBonifico = (b, operatoreId) => {
    const no = controlla('esegui_bonifico', operatoreId, b);
    if (no) return no;
    if (b.stato !== 'autorizzato') return rifiuto('Si esegue solo un bonifico autorizzato.');
    const riferimento = nuovoRiferimento();
    modifica('bonifici', b.id, { eseguitoDa: operatoreId, eseguitoIl: OGGI, riferimento });
    if (nelDatabase(b.indennizzoId)) anchePerDavvero(eseguiIndennizzoDb(b.indennizzoId, riferimento));
    return FATTO;
};

export const inviaRendiconto = (periodo, operatoreId) => {
    const no = controlla('invia_rendiconto', operatoreId, periodo);
    if (no) return no;
    if (periodo.stato !== 'da_inviare') return rifiuto('Il rendiconto si invia a trimestre chiuso, una volta sola.');
    modifica('rendiconti', periodo.id, { inviatoIl: OGGI, inviatoDa: operatoreId });
    return FATTO;
};

/**
 * Quando una contestazione si chiude a favore del proprietario e il mese resta
 * senza incasso, la pratica di morosità parte: è la sola cosa che la teneva
 * ferma. Da chiamare dalla gestione delle contestazioni (O-10); nei mockup la
 * chiama la simulazione di O-14. Senza garanzia (CRIA Segnalazione) non si apre:
 * conta solo il semaforo.
 */
export const apriPraticaDaContestazione = (contestazioneId) => {
    const k = CONTESTAZIONI.find(x => x.id === contestazioneId);
    if (!k) return rifiuto('Contestazione non trovata.');
    const c = trovaContrattoAttuale(k.contrattoId);
    const m = c.mesi.find(x => x.mese === k.mese);
    if (!PRODOTTI[c.prodotto].garanzia) return rifiuto(`${nomeProdotto(c.prodotto)} non ha recupero: conta solo per il semaforo.`);
    if (m.stato === 'pagato') return rifiuto('Il canone di quel mese è arrivato: niente da recuperare.');
    const id = `mor-${c.id.replace(/^c-/, '')}-${k.mese}`;
    let creata = false;
    store.aggiorna(s => {
        const t = { ...vuoto(), ...s };
        if (t.pratiche.nuove.some(p => p.id === id) || PRATICHE_BACKOFFICE.some(p => p.id === id)) return t;
        creata = true;
        const pratica = {
            id, contrattoId: c.id, mesi: [k.mese], apertaIl: OGGI,
            gestoreId: 'giorgio', assegnataIl: OGGI, assegnazione: 'automatica',
            contatti: [], note: [], condivisa: false, eventiCondivisi: [], pianoBase: null,
            sospensione: { dal: chiusuraDelMese(k.mese), al: OGGI, contestazioneId: k.id, esito: 'risolta_favore_locatore' },
        };
        // Con la copertura attiva nasce anche l'indennizzo da istruire.
        const indennizzo = m.copertura === 'attiva'
            ? [{ id: `ind-${c.id.replace(/^c-/, '')}-${k.mese}`, praticaId: id, contrattoId: c.id, mese: k.mese, importo: c.canone }]
            : [];
        return {
            ...t,
            pratiche: { ...t.pratiche, nuove: [...t.pratiche.nuove, pratica] },
            indennizzi: { ...t.indennizzi, nuovi: [...t.indennizzi.nuovi, ...indennizzo] },
        };
    });
    return creata ? { ok: true, praticaId: id } : rifiuto('La pratica è già aperta.');
};

// ─── Solo nei mockup: quello che fa l'inquilino dalla sua area ───────────────
export const simulaAccettazionePiano = (piano) => {
    if (piano.stato !== 'approvato') return rifiuto('Il piano non è in attesa dell’inquilino.');
    modifica('pianiModifiche', piano.id, { accettatoIl: OGGI });
    return FATTO;
};

export const simulaPagamentoRata = (piano, n) => {
    store.aggiorna(s => {
        const t = { ...vuoto(), ...s };
        return { ...t, ratePagate: { ...t.ratePagate, [piano.id]: { ...(t.ratePagate[piano.id] || {}), [n]: OGGI } } };
    });
    return FATTO;
};
