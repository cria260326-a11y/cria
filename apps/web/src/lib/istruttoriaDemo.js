import { useMemo } from 'react';
import { OGGI, trovaContratto } from '@/data/datiDemo';
import { PRODOTTI, nomeProdotto } from '@/data/catalogo';
import { FUNZIONI, nomeOperatore, operatoriConFunzione, trovaOperatore } from '@/data/operatori';
import { trovaPersonaDemo } from '@/data/personeDemo';
import { tipoProva, livelloProva, STATI_AUTOCANDIDATURA, STATI_REFERENZA, PROVE_FORTI_MINIME, MESI_MINIMI } from '@/data/autocandidature';
import { esitoEntro, nomeCandidato } from '@/data/verifiche';
import {
    REGOLE_ISTRUTTORIA, SQUADRA_ISTRUTTORIA, PROVINCE, PROVINCIA_DELLA_CITTA, ACQUISIZIONI,
    INDICATORI, CONSERVAZIONE, DOCUMENTI_SENSIBILI, DELIBERE_STORICHE,
} from '@/data/istruttoria';
import { creaStoreDemo, nuovoIdDemo } from '@/lib/storeDemo';
import { useTutteLePratiche, aggiornaPratica, deliberaPratica } from '@/lib/praticheDemo';
import {
    useTutteLeAutocandidature, verificaMinimo, concludiIstruttoria, inviaACria, scadenzaReferenza,
} from '@/lib/autocandidatureDemo';
import { useTutteLeVerifiche, completaVerificaDemo } from '@/lib/verificheDemo';
import { aggiungiGiorniLavorativi, aggiungiGiorniSolari, mancanoAlTermine } from '@/lib/calendario';
import { SEMAFORO } from '@/lib/semaforo';
import { nomeVisualizzato } from '@/lib/aree';
import { fmtData, nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// ISTRUTTORIA NEI MOCKUP — O-07 e O-08
// La coda si costruisce dai dati veri: pratiche dei proprietari (anche quelle
// nate nel browser), autocandidature inviate a CRIA e richieste di CRIA
// Verifica. Qui restano solo le azioni del back office: assegnazioni forzate,
// verifiche dei documenti, delibere, letture dei documenti sensibili.
// Una delibera che fa avanzare la pratica passa da aggiornaPratica, così il
// proprietario la vede nella sua area; quella di un'autocandidatura emette il
// certificato che l'inquilino vede nella sua.
//
// Fase 4: tabelle assegnazioni, verifiche_documenti, delibere, accessi_log;
// l'assegnazione la fa il motore sul server, la cancellazione a 30 giorni un job.
// ═════════════════════════════════════════════════════════════════════════════

const vuoto = () => ({ assegnazioni: {}, verifiche: {}, delibere: [], letture: [], lingue: {}, istantanee: {} });
const store = creaStoreDemo('criaIstruttoriaDemo', vuoto);
const normalizza = (s) => ({ ...vuoto(), ...(s || {}) });
const leggiStato = () => normalizza(store.leggi());
const cambiaStato = (fn) => store.scrivi(fn(leggiStato()));

export const PERCORSO_ISTRUTTORIA = '/dashboard/admin/onboarding';
export const percorsoVoce = (chiave) => `${PERCORSO_ISTRUTTORIA}?apri=${encodeURIComponent(chiave)}`;

export const FASI = {
    in_arrivo: { etichetta: 'In arrivo', classe: 'bg-blue-100 text-blue-800' },
    da_deliberare: { etichetta: 'Da deliberare', classe: 'bg-amber-100 text-amber-800' },
    deliberata: { etichetta: 'Deliberata', classe: 'bg-slate-100 text-slate-700' },
};

export const STATI_DOCUMENTO = {
    da_verificare: { etichetta: 'Da verificare', classe: 'bg-amber-100 text-amber-800' },
    conforme: { etichetta: 'Conforme', classe: 'bg-green-100 text-green-800' },
    non_conforme: { etichetta: 'Non conforme', classe: 'bg-red-100 text-red-800' },
    mancante: { etichetta: 'Non ancora caricato', classe: 'bg-slate-100 text-slate-700' },
    registrato: { etichetta: 'Registrato dal sistema', classe: 'bg-slate-100 text-slate-700' },
};

const LIVELLO_COMPLESSITA = ['bassa', 'media', 'alta'];

// ─── Piccoli aiuti ────────────────────────────────────────────────────────────
const chiaveDi = (tipo, id) => `${tipo}:${id}`;
const ultimo = (lista) => (lista.length ? lista[lista.length - 1] : null);
// «Valeria Monti ed Ettore Marini»: davanti a una e, ed.
const elenco = (nomi) => {
    if (nomi.length <= 1) return nomi.join('');
    const ultimo = nomi[nomi.length - 1];
    return `${nomi.slice(0, -1).join(', ')} ${/^[eE]/.test(ultimo) ? 'ed' : 'e'} ${ultimo}`;
};
const nomiOperatori = (ids) => elenco(ids.map(nomeOperatore));

// Un numero stabile da un testo: serve a dare indicatori plausibili, sempre
// gli stessi, alle pratiche nate nel browser.
const hash = (testo) => [...String(testo)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const provinciaDaTesto = (testo) => {
    const citta = String(testo || '').split(',').pop().trim().toLowerCase();
    return PROVINCIA_DELLA_CITTA[citta] || null;
};

export const etichettaProvincia = (sigla) => (sigla ? `${PROVINCE[sigla] || sigla} (${sigla})` : null);

const assente = (operatoreId, giorno) =>
    (SQUADRA_ISTRUTTORIA[operatoreId]?.assenze || []).some(a => giorno >= a.dal && giorno <= a.al);

export const linguaDi = (s, personaId) => s.lingue?.[personaId] || null;

// ─── Indicatori e proposta ────────────────────────────────────────────────────
// Le pratiche nate nel browser non hanno documenti veri: gli indicatori sono
// generati dall'identificativo, plausibili e sempre uguali.
const indicatoriDi = (p) => {
    if (INDICATORI[p.id]) return INDICATORI[p.id];
    const h = hash(p.id);
    const quote = [0.28, 0.33, 0.37, 0.43];
    return {
        storicoCria: null,
        movimenti: {
            mensilita: 12, suMesi: 12, giornoMedio: 2 + (h % 8),
            canonePrecedente: Math.round((p.canone * 0.92) / 10) * 10,
            importiCoerenti: true, dateContinue: true, bancaCoerente: true,
        },
        reddito: { nettoMensile: Math.round(p.canone / quote[h % quote.length] / 10) * 10, fonte: 'Ultime tre buste paga' },
    };
};

// Il semaforo che si legge dai movimenti del canone, con le soglie di lib/semaforo.
const semaforoDaMovimenti = (m) => {
    if (m.mensilita < 3) return 'storico_insufficiente';
    if (m.giornoMedio <= 5) return 'verde';
    return m.giornoMedio <= 10 ? 'giallo' : 'rosso';
};

const GRADINI = ['approvata', 'approvata_franchigia', 'respinta'];
const GRADINO_DEL_SEMAFORO = { verde: 0, giallo: 1, storico_insufficiente: 1, rosso: 2 };

// Le regole della proposta sono tre, e si leggono nella pagina:
//   1. il semaforo del candidato — lo storico CRIA se c'è, altrimenti i
//      movimenti del canone — dà il punto di partenza
//   2. oltre la soglia del reddito netto la proposta scende di un gradino
//   3. con CRIA Segnalazione non c'è garanzia: si verificano i documenti
const propostaPratica = (p, ind) => {
    const prod = PRODOTTI[p.prodotto];
    if (!prod?.garanzia) {
        return {
            esito: 'approvata', conProposta: true, alternative: ['approvata', 'respinta'],
            fattori: [{ testo: `${nomeProdotto(p.prodotto)} non ha garanzia: si verificano solo i documenti`, effetto: 'neutro' }],
        };
    }
    const fattori = [];
    let semaforo;
    if (ind.storicoCria) {
        semaforo = ind.storicoCria.semaforo;
        fattori.push({ testo: `Storico CRIA su ${ind.storicoCria.mesi} mesi: ${SEMAFORO[semaforo].etichetta}, giorno medio ${ind.storicoCria.giornoMedio}`, effetto: semaforo === 'verde' ? 'favorevole' : 'peggiora' });
    } else {
        semaforo = semaforoDaMovimenti(ind.movimenti);
        fattori.push({ testo: `Nessuno storico CRIA. Movimenti del canone: ${ind.movimenti.mensilita} su ${ind.movimenti.suMesi}, giorno medio ${ind.movimenti.giornoMedio} (${SEMAFORO[semaforo].etichetta})`, effetto: semaforo === 'verde' ? 'favorevole' : 'peggiora' });
    }
    let gradino = GRADINO_DEL_SEMAFORO[semaforo];
    const quota = Math.round((p.canone / ind.reddito.nettoMensile) * 100);
    if (quota > REGOLE_ISTRUTTORIA.sogliaCanoneSuReddito) {
        gradino = Math.min(2, gradino + 1);
        fattori.push({ testo: `Canone al ${quota}% del reddito netto: oltre il ${REGOLE_ISTRUTTORIA.sogliaCanoneSuReddito}%, la proposta scende di un gradino`, effetto: 'peggiora' });
    } else {
        fattori.push({ testo: `Canone al ${quota}% del reddito netto`, effetto: 'neutro' });
    }
    const m = ind.movimenti;
    if (!(m.importiCoerenti && m.dateContinue && m.bancaCoerente)) {
        fattori.push({ testo: 'I movimenti non tornano del tutto con quanto dichiarato: controllali prima di decidere', effetto: 'peggiora' });
    }
    return { esito: GRADINI[gradino], conProposta: true, alternative: GRADINI, fattori };
};

// Autocandidatura: il valore del certificato viene dalle prove, non da una
// scelta. Si decide solo se c'è una smentita del precedente proprietario:
// regge, e l'autocandidatura non si accoglie, o non regge, e decade.
const propostaAutocandidatura = (a, proveValide) => {
    const minimo = verificaMinimo({ ...a, prove: proveValide });
    const inAttesa = (a.referenze || []).filter(r => r.stato === 'in_attesa');
    const smentite = (a.referenze || []).filter(r => r.stato === 'smentita');
    const fattori = [
        { testo: `Prove forti di tipo diverso: ${minimo.forti} su ${PROVE_FORTI_MINIME}. Mesi coperti da due prove forti: ${minimo.copertura} su ${MESI_MINIMI}`, effetto: minimo.raggiunto ? 'favorevole' : 'peggiora' },
        { testo: minimo.raggiunto ? 'Il minimo c’è: il valore si calcola dai mesi documentati' : 'Il minimo non c’è: il certificato dirà «storico insufficiente»', effetto: minimo.raggiunto ? 'favorevole' : 'neutro' },
        ...inAttesa.map(r => ({ testo: `La referenza di ${r.proprietario.nome} è ancora senza risposta: deliberando adesso si chiude come «richiesta, non riscontrata»`, effetto: 'neutro' })),
    ];
    if (smentite.length) {
        const replicate = smentite.every(r => r.replica);
        smentite.forEach(r => fattori.push({
            testo: r.replica
                ? `${r.proprietario.nome} non conferma, ma l’inquilina ha risposto con i suoi movimenti`
                : `${r.proprietario.nome} non conferma, con documenti, e l’inquilina non ha risposto`,
            effetto: r.replica ? 'neutro' : 'peggiora',
        }));
        return { esito: replicate ? 'emessa' : 'rifiutata', conProposta: true, alternative: ['emessa', 'rifiutata'], fattori, minimo };
    }
    return { esito: 'emessa', conProposta: false, alternative: ['emessa'], fattori, minimo };
};

export const franchigiaPer = (prodotto, esito) => {
    const base = PRODOTTI[prodotto]?.franchigiaMesi || 0;
    return esito === 'approvata_franchigia' ? base + REGOLE_ISTRUTTORIA.mesiFranchigiaAggiuntivi : base;
};

const mesi = (n) => `${n} ${n === 1 ? 'mese' : 'mesi'}`;

export const descriviEsito = (voce, esito) => {
    if (voce.tipo === 'autocandidatura') {
        if (esito === 'rifiutata') return 'Non accolta: la smentita documentata contraddice quanto dichiarato';
        return voce.proposta?.minimo?.raggiunto ? 'Certificato con il valore dei mesi documentati' : 'Certificato con «storico insufficiente»';
    }
    const prod = PRODOTTI[voce.prodotto];
    if (esito === 'respinta') return prod?.garanzia ? 'Garanzia non concessa su questo candidato' : 'Candidato non accettato';
    if (!prod?.garanzia) return 'Documenti in ordine, senza garanzia';
    if (esito === 'approvata_franchigia') return `Garanzia con franchigia di ${mesi(franchigiaPer(voce.prodotto, esito))} invece di ${mesi(prod.franchigiaMesi)}`;
    return `Garanzia con la franchigia standard di ${mesi(prod.franchigiaMesi)}`;
};

// La nota che legge il proprietario: dice l'esito, non le ragioni interne.
// Reddito, movimenti e motivo del dissenso restano nel back office.
const notaPerProprietario = (p, esito) => {
    const prod = PRODOTTI[p.prodotto];
    if (esito === 'respinta') return 'CRIA non approva questo candidato. Puoi proporne un altro.';
    if (!prod?.garanzia) return `documenti in ordine. Con ${nomeProdotto(p.prodotto)} non c’è garanzia.`;
    if (esito === 'approvata_franchigia') return `documenti in ordine, garanzia con una franchigia di ${mesi(franchigiaPer(p.prodotto, esito))} invece di ${mesi(prod.franchigiaMesi)}.`;
    return `documenti in ordine, garanzia con la franchigia standard di ${mesi(prod.franchigiaMesi)}.`;
};

// ─── Conservazione ────────────────────────────────────────────────────────────
// Quando si cancella ogni documento (§14.5). La cancellazione a 30 giorni la fa
// un job e si registra; gli indicatori si estraggono prima.
export const conservazione = (doc, conclusaIl) => {
    if (doc.stato === 'non_conforme') {
        const quando = ultimo(doc.storico || [])?.il;
        return { testo: `Cancellato subito${quando ? ` il ${fmtData(quando)}` : ''}: resta solo il registro del rifiuto`, tono: 'rosso' };
    }
    switch (CONSERVAZIONE[doc.tipo]) {
        case 'dopo_delibera': {
            const giorni = REGOLE_ISTRUTTORIA.giorniConservazioneSensibili;
            if (!conclusaIl) return { testo: `Si cancella ${giorni} giorni dopo la delibera`, tono: 'ambra' };
            const il = aggiungiGiorniSolari(conclusaIl, giorni);
            const mancano = mancanoAlTermine(OGGI, il, 'solari');
            if (mancano <= 0) return { testo: `Cancellato il ${fmtData(il)} dal job, ${giorni} giorni dopo la delibera. Restano gli indicatori`, tono: 'grigio', cancellatoIl: il };
            return { testo: `Si cancella il ${fmtData(il)}, tra ${mancano} ${mancano === 1 ? 'giorno' : 'giorni'}`, tono: 'ambra', il };
        }
        case 'revoca': return { testo: 'Si conserva fino a 10 anni dalla revoca', tono: 'grigio' };
        case 'certificato': return { testo: 'Si conserva con il certificato che ha fondato: 10 anni', tono: 'grigio' };
        default: return { testo: 'Si conserva per la durata del contratto più 10 anni', tono: 'grigio' };
    }
};

// ─── Documenti ────────────────────────────────────────────────────────────────
const statoCandidato = (tipo, presente, storico) => {
    if (tipo === 'consenso') return presente ? 'registrato' : 'mancante';
    const u = ultimo(storico);
    if (!presente) return u?.esito === 'non_conforme' ? 'non_conforme' : 'mancante';
    return u?.esito === 'conforme' ? 'conforme' : 'da_verificare';
};

const documentiPratica = (p, s, chiave, cliente) => {
    const verifiche = s.verifiche[chiave] || {};
    const delCandidato = (p.candidato?.documenti || []).map(d => {
        const k = `cand:${d.tipo}`;
        const storico = verifiche[k] || [];
        const presente = d.stato === 'caricato';
        const stato = statoCandidato(d.tipo, presente, storico);
        return {
            chiave: k, tipo: d.tipo, etichetta: d.etichetta, di: 'candidato', chi: p.candidato.nome,
            presente, verificabile: d.tipo !== 'consenso', sensibile: DOCUMENTI_SENSIBILI.includes(d.tipo),
            storico, stato, ricaricato: stato === 'da_verificare' && ultimo(storico)?.esito === 'non_conforme',
        };
    });
    const delProprietario = (p.documentiProprietario || []).map(d => {
        const k = `prop:${d.tipo}`;
        const storico = verifiche[k] || [];
        const stato = d.stato === 'verificato' ? 'conforme' : ['da_integrare', 'rifiutato'].includes(d.stato) ? 'non_conforme' : 'da_verificare';
        return {
            chiave: k, tipo: d.tipo, etichetta: d.etichetta, di: 'proprietario', chi: cliente,
            presente: stato !== 'non_conforme', verificabile: true, sensibile: false,
            storico, stato, ricaricato: stato === 'da_verificare' && ultimo(storico)?.esito === 'non_conforme',
            verificatoPrima: stato === 'conforme' && !storico.length,
        };
    });
    return [...delCandidato, ...delProprietario];
};

const documentiAutocandidatura = (a, s, chiave, nome) => {
    const verifiche = s.verifiche[chiave] || {};
    return (a.prove || []).map(pr => {
        const k = `prova:${pr.id}`;
        const storico = verifiche[k] || [];
        const u = ultimo(storico);
        const stato = u?.esito === 'non_conforme' ? 'non_conforme' : u?.esito === 'conforme' ? 'conforme' : 'da_verificare';
        return {
            chiave: k, tipo: pr.tipo, etichetta: tipoProva(pr.tipo)?.etichetta || pr.tipo, di: 'inquilino', chi: nome,
            presente: stato !== 'non_conforme', verificabile: true, sensibile: DOCUMENTI_SENSIBILI.includes(pr.tipo),
            storico, stato, file: pr.file, livello: livelloProva(pr.tipo), dal: pr.dal, al: pr.al,
            immobile: pr.immobile, estremi: pr.estremi, caricataIl: pr.caricataIl, provaId: pr.id,
        };
    });
};

// ─── Le voci della coda ───────────────────────────────────────────────────────
const TIPO_ETICHETTA = { pratica: 'Pratica', autocandidatura: 'Autocandidatura', verifica: PRODOTTI.P3.nome, contratto: 'Pratica chiusa' };

const vocePratica = (p, s, deliberaDi) => {
    const chiave = chiaveDi('pratica', p.id);
    const persona = trovaPersonaDemo(p.personaId);
    const cliente = persona ? nomeVisualizzato(persona) : 'Proprietario';
    const acquisizione = ACQUISIZIONI[p.personaId] || null;
    const ind = indicatoriDi(p);
    const registro = deliberaDi(chiave);
    const conclusa = ['pagamento', 'firma', 'attiva', 'respinta'].includes(p.stato) || Boolean(p.istruttoria?.conclusaIl);
    const conclusaIl = p.istruttoria?.conclusaIl || registro?.deliberataIl || null;
    const fase = conclusa ? 'deliberata' : p.stato === 'istruttoria' ? 'da_deliberare' : 'in_arrivo';
    const documenti = documentiPratica(p, s, chiave, cliente);
    const completaIl = fase === 'da_deliberare' ? (p.candidato?.ultimoAccesso || p.apertaIl) : null;

    const fattoriComplessita = [
        p.titolarita === 'societa' && 'Proprietario società: visura camerale e poteri di firma',
        p.titolarita === 'gestore' && 'Gestore per conto del proprietario: serve la delega',
        !ind.storicoCria && 'Candidato senza storico CRIA',
    ].filter(Boolean);

    const mancano = documenti.filter(d => ['mancante', 'non_conforme'].includes(d.stato));
    let statoTesto;
    if (fase === 'deliberata') statoTesto = `Deliberata il ${fmtData(conclusaIl)}`;
    else if (!p.candidato) statoTesto = 'Il proprietario non ha ancora invitato il candidato';
    else if (mancano.length) statoTesto = `${mancano.length === 1 ? 'Manca un documento' : `Mancano ${mancano.length} documenti`}: ${elenco(mancano.map(d => d.etichetta.toLowerCase()))}`;
    else statoTesto = 'Documenti completi';

    const verificati = documenti.filter(d => d.verificabile && d.stato === 'conforme').length;
    const pronti = documenti.filter(d => d.verificabile && ['conforme', 'da_verificare'].includes(d.stato)).length;
    const indicatoriLetti = documenti.filter(d => ['movimenti_canone', 'reddito'].includes(d.tipo)).every(d => d.stato === 'conforme');

    return {
        chiave, tipo: 'pratica', id: p.id, raw: p,
        titolo: p.immobile.indirizzo,
        sottotitolo: `${p.immobile.cap} ${p.immobile.citta} · ${nomeProdotto(p.prodotto)} · contratto ${p.contratto === 'esistente' ? 'già in corso' : 'nuovo'}`,
        etichettaTipo: TIPO_ETICHETTA.pratica, prodotto: p.prodotto,
        clienteId: p.personaId, cliente, candidato: p.candidato?.nome || null,
        provincia: p.immobile.provincia || null,
        acquisitoDa: acquisizione?.operatoreId || null, acquisizione,
        complessita: { livello: LIVELLO_COMPLESSITA[Math.min(2, fattoriComplessita.length)], fattori: fattoriComplessita },
        arrivataIl: p.apertaIl, completaIl, conclusaIl, fase, statoTesto,
        termine: completaIl ? { data: aggiungiGiorniLavorativi(completaIl, REGOLE_ISTRUTTORIA.giorniLavorativiDelibera), calendario: 'lavorativi', perche: `${REGOLE_ISTRUTTORIA.giorniLavorativiDelibera} giorni lavorativi dai documenti completi` } : null,
        documenti, avanzamento: { verificati, pronti, totale: documenti.filter(d => d.verificabile).length },
        indicatori: ind,
        proposta: indicatoriLetti && fase !== 'in_arrivo' ? propostaPratica(p, ind) : null,
        delibera: registro || (conclusa ? { esito: p.istruttoria?.esito || (p.stato === 'respinta' ? 'respinta' : 'approvata'), deliberataIl: conclusaIl, daAltrove: true } : null),
    };
};

const voceAutocandidatura = (a, s, deliberaDi) => {
    const chiave = chiaveDi('autocandidatura', a.id);
    const persona = trovaPersonaDemo(a.personaId);
    const nome = persona ? nomeVisualizzato(persona) : 'Inquilino';
    const registro = deliberaDi(chiave);
    const fase = ['emessa', 'rifiutata'].includes(a.stato) ? 'deliberata' : a.stato === 'istruttoria' ? 'da_deliberare' : 'in_arrivo';
    const documenti = documentiAutocandidatura(a, s, chiave, nome);
    const proveValide = (a.prove || []).filter(pr => documenti.find(d => d.provaId === pr.id)?.stato !== 'non_conforme');
    const smentite = (a.referenze || []).filter(r => r.stato === 'smentita');
    const primaProva = (a.prove || [])[0]?.immobile || (a.referenze || [])[0]?.immobile;
    const fattoriComplessita = [
        'Storico solo su documenti, da istruire',
        ...smentite.map(r => `Smentita di ${r.proprietario.nome} da valutare`),
    ];
    const conclusaIl = a.conclusaIl || registro?.deliberataIl || null;
    const inAttesa = (a.referenze || []).filter(r => r.stato === 'in_attesa');
    let statoTesto;
    if (fase === 'deliberata') statoTesto = `${STATI_AUTOCANDIDATURA[a.stato]?.etichetta} il ${fmtData(conclusaIl)}`;
    else if (fase === 'in_arrivo') {
        const n = (a.prove || []).length;
        statoTesto = `L’inquilino raccoglie le prove: ${n === 1 ? 'una caricata' : `${n} caricate`}${inAttesa.length ? `, ${inAttesa.length === 1 ? 'una referenza' : `${inAttesa.length} referenze`} in attesa di risposta` : ''}`;
    }
    else statoTesto = `Inviata a CRIA il ${fmtData(a.inviataIl)}${a.sottoMinimo ? ', sotto il minimo' : ''}`;

    return {
        chiave, tipo: 'autocandidatura', id: a.id, raw: a,
        titolo: `Autocandidatura di ${nome}`,
        sottotitolo: `${PRODOTTI.P7.nome} · ${primaProva || 'nessun immobile indicato'}`,
        etichettaTipo: TIPO_ETICHETTA.autocandidatura, prodotto: 'P7',
        clienteId: a.personaId, cliente: nome, candidato: nome,
        provincia: provinciaDaTesto(primaProva),
        acquisitoDa: ACQUISIZIONI[a.personaId]?.operatoreId || null, acquisizione: ACQUISIZIONI[a.personaId] || null,
        complessita: { livello: LIVELLO_COMPLESSITA[Math.min(2, fattoriComplessita.length)], fattori: fattoriComplessita },
        arrivataIl: a.apertaIl, completaIl: a.inviataIl, conclusaIl, fase, statoTesto,
        termine: fase === 'da_deliberare' && a.inviataIl
            ? { data: aggiungiGiorniLavorativi(a.inviataIl, REGOLE_ISTRUTTORIA.giorniLavorativiDelibera), calendario: 'lavorativi', perche: `${REGOLE_ISTRUTTORIA.giorniLavorativiDelibera} giorni lavorativi dall’invio` }
            : null,
        documenti,
        referenze: (a.referenze || []).map(r => ({ ...r, etichettaStato: STATI_REFERENZA[r.stato]?.etichetta || r.stato, scadenza: scadenzaReferenza(r) })),
        avanzamento: {
            verificati: documenti.filter(d => d.stato === 'conforme').length,
            pronti: documenti.filter(d => d.stato !== 'non_conforme').length,
            totale: documenti.length,
        },
        proveEscluse: (a.prove || []).filter(pr => !proveValide.includes(pr)).map(pr => pr.id),
        proposta: fase === 'in_arrivo' ? null : propostaAutocandidatura(a, proveValide),
        delibera: registro || (fase === 'deliberata' ? { esito: a.stato === 'rifiutata' ? 'rifiutata' : 'emessa', deliberataIl: conclusaIl, daAltrove: true } : null),
    };
};

const voceVerifica = (v, deliberaDi) => {
    const chiave = chiaveDi('verifica', v.id);
    const persona = trovaPersonaDemo(v.personaId);
    const registro = deliberaDi(chiave);
    const fase = v.stato === 'conclusa' ? 'deliberata' : 'da_deliberare';
    const entro = esitoEntro(v);
    return {
        chiave, tipo: 'verifica', id: v.id, raw: v,
        titolo: `Verifica su ${nomeCandidato(v.soggetto)}`,
        sottotitolo: `Chiesta da ${persona ? nomeVisualizzato(persona) : 'un cliente'} il ${fmtData(v.richiestaIl)}`,
        etichettaTipo: TIPO_ETICHETTA.verifica, prodotto: 'P3',
        clienteId: v.personaId, cliente: persona ? nomeVisualizzato(persona) : 'Cliente', candidato: nomeCandidato(v.soggetto),
        soggetto: v.soggetto,
        provincia: null,
        acquisitoDa: ACQUISIZIONI[v.personaId]?.operatoreId || null, acquisizione: ACQUISIZIONI[v.personaId] || null,
        complessita: { livello: 'bassa', fattori: [] },
        arrivataIl: v.richiestaIl, completaIl: v.richiestaIl, conclusaIl: v.esito?.il || registro?.deliberataIl || null,
        fase, statoTesto: fase === 'deliberata' ? `Esito pubblicato il ${fmtData(v.esito?.il)}` : `Esito entro il ${fmtData(entro)}`,
        termine: fase === 'deliberata' ? null : { data: entro, calendario: 'solari', perche: `${PRODOTTI.P3.oreEsito} ore dalla richiesta` },
        documenti: [],
        avanzamento: null,
        proposta: null,
        delibera: registro || (fase === 'deliberata' ? { esito: 'pubblicata', deliberataIl: v.esito?.il, daAltrove: true } : null),
    };
};

// Le pratiche da cui sono nati i contratti in corso: solo registro.
const voceContratto = (d) => {
    const c = trovaContratto(d.chiave.split(':')[1]);
    if (!c) return null;
    return {
        chiave: d.chiave, tipo: 'contratto', id: c.id, raw: c,
        titolo: c.immobile.indirizzo,
        sottotitolo: `${c.immobile.cap} ${c.immobile.citta} · ${nomeProdotto(c.prodotto)} · oggi contratto attivo`,
        etichettaTipo: TIPO_ETICHETTA.contratto, prodotto: c.prodotto,
        clienteId: c.locatore.personaId, cliente: c.locatore.nome, candidato: c.conduttore.nome,
        provincia: c.immobile.provincia,
        acquisitoDa: ACQUISIZIONI[c.locatore.personaId]?.operatoreId || null, acquisizione: ACQUISIZIONI[c.locatore.personaId] || null,
        complessita: { livello: 'bassa', fattori: [] },
        arrivataIl: d.deliberataIl, completaIl: null, conclusaIl: d.deliberataIl,
        fase: 'deliberata', statoTesto: `Deliberata il ${fmtData(d.deliberataIl)}`,
        termine: null,
        documenti: [
            { chiave: 'cand:movimenti_canone', tipo: 'movimenti_canone', etichetta: 'Pagamenti del canone del candidato', di: 'candidato', chi: c.conduttore.nome, presente: false, verificabile: true, sensibile: true, storico: [], stato: 'conforme' },
            { chiave: 'cand:reddito', tipo: 'reddito', etichetta: 'Documenti di reddito', di: 'candidato', chi: c.conduttore.nome, presente: false, verificabile: true, sensibile: true, storico: [], stato: 'conforme' },
        ],
        avanzamento: null,
        proposta: { esito: d.proposta, conProposta: true, alternative: GRADINI, fattori: (d.fattori || []).map(testo => ({ testo, effetto: 'neutro' })) },
        delibera: d,
    };
};

// ─── Il motore di assegnazione ────────────────────────────────────────────────
// Automatico, con forzatura del responsabile. Quattro criteri in quest'ordine
// (§13.6): lingua dichiarata dal cliente · ubicazione dell'immobile · carico e
// disponibilità · complessità. Prima di tutto si tolgono gli incompatibili
// (chi ha acquisito il cliente). Nessun criterio legge origine, cittadinanza o
// nome della persona: la lingua è quella dichiarata, e basta.
// Il carico conta le voci arrivate prima e ancora aperte in quel giorno: così
// un'assegnazione, fatta, non cambia più.
const motore = (v, precedenti) => {
    const squadra = operatoriConFunzione('istruttoria');
    const esclusi = [];
    let restano = squadra.filter(o => {
        if (v.acquisitoDa === o.id) { esclusi.push({ id: o.id, motivo: 'ha acquisito il cliente, quindi non può deliberarne l’istruttoria' }); return false; }
        if (assente(o.id, v.arrivataIl)) { esclusi.push({ id: o.id, motivo: 'era assente il giorno dell’arrivo' }); return false; }
        return true;
    });
    const passi = [];
    if (!restano.length) return { operatoreId: null, passi, esclusi };

    const filtra = (criterio, dato, tieni, spiega) => {
        const scelti = restano.filter(tieni);
        if (scelti.length) restano = scelti;
        passi.push({ criterio, dato, restano: restano.map(o => o.id), nota: spiega(scelti) });
    };

    const lingua = v.lingua || 'italiano';
    filtra('Lingua dichiarata dal cliente', v.lingua ? lingua : 'non dichiarata: italiano',
        o => (o.lingue || ['italiano']).includes(lingua),
        scelti => (scelti.length ? `La parla${scelti.length > 1 ? 'no' : ''} ${nomiOperatori(scelti.map(o => o.id))}` : `Nessuno la parla: resta aperta a tutti, con il supporto di un mediatore`));

    if (v.provincia) {
        filtra('Ubicazione dell’immobile', etichettaProvincia(v.provincia),
            o => (SQUADRA_ISTRUTTORIA[o.id]?.zone || []).includes(v.provincia),
            scelti => (scelti.length ? `La segu${scelti.length > 1 ? 'ono' : 'e'} ${nomiOperatori(scelti.map(o => o.id))}` : 'Nessuno segue la zona: il criterio non decide'));
    } else {
        passi.push({ criterio: 'Ubicazione dell’immobile', dato: 'non si applica', restano: restano.map(o => o.id), nota: v.tipo === 'verifica' ? 'Un’interrogazione non ha un immobile' : 'Immobile non indicato' });
    }

    const carico = (id) => precedenti.filter(x => x.operatoreId === id && (!x.conclusaIl || x.conclusaIl >= v.arrivataIl)).length;
    const minimo = Math.min(...restano.map(o => carico(o.id)));
    const perCarico = restano.map(o => `${nomeOperatore(o.id)} ${carico(o.id)}`).join(' · ');
    restano = restano.filter(o => carico(o.id) === minimo);
    passi.push({ criterio: 'Carico e disponibilità', dato: `in coda all’arrivo: ${perCarico}`, restano: restano.map(o => o.id), nota: restano.length > 1 ? 'Stesso carico' : `Meno carico: ${nomeOperatore(restano[0].id)}` });

    if (v.complessita.livello === 'alta') {
        filtra('Complessità', 'alta', o => SQUADRA_ISTRUTTORIA[o.id]?.complesse,
            scelti => (scelti.length ? `Le pratiche complesse le segue ${nomiOperatori(scelti.map(o => o.id))}` : 'Nessuno in più per le complesse'));
    } else {
        passi.push({ criterio: 'Complessità', dato: v.complessita.livello, restano: restano.map(o => o.id), nota: 'Non serve a scegliere' });
    }

    // Parità: chi ne ha ricevute meno negli ultimi 30 giorni, poi il cognome.
    const dal = aggiungiGiorniSolari(v.arrivataIl, -30);
    const ricevute = (id) => precedenti.filter(x => x.operatoreId === id && x.arrivataIl >= dal).length;
    restano.sort((a, b) => ricevute(a.id) - ricevute(b.id) || a.cognome.localeCompare(b.cognome));
    if (passi.length && passi[passi.length - 1].restano.length > 1) {
        passi.push({ criterio: 'Parità', dato: 'chi ne ha ricevute meno negli ultimi 30 giorni', restano: [restano[0].id], nota: nomeOperatore(restano[0].id) });
    }
    return { operatoreId: restano[0].id, passi, esclusi };
};

const assegnaTutte = (voci, s) => {
    const ordinate = [...voci].sort((a, b) => a.arrivataIl.localeCompare(b.arrivataIl) || a.chiave.localeCompare(b.chiave));
    const fatte = [];
    const risultato = {};
    for (const v of ordinate) {
        const auto = motore(v, fatte);
        const forzata = v.fase !== 'deliberata' ? s.assegnazioni[v.chiave] || null : null;
        const storica = v.delibera?.deliberataDa && !v.delibera.daAltrove ? v.delibera.deliberataDa : null;
        const operatoreId = forzata?.operatoreId || storica || auto.operatoreId;
        risultato[v.chiave] = { operatoreId, auto, forzata, storica: Boolean(storica && !forzata) };
        fatte.push({ operatoreId, arrivataIl: v.arrivataIl, conclusaIl: v.conclusaIl });
    }
    return risultato;
};

// ─── Cosa impedisce la delibera, adesso ───────────────────────────────────────
const bloccoDelibera = (v) => {
    if (v.fase === 'deliberata') return null;
    if (v.tipo === 'verifica') return null;
    if (v.fase === 'in_arrivo') {
        if (v.tipo === 'autocandidatura') return 'L’inquilino non ha ancora inviato le prove a CRIA.';
        return v.candidato ? 'Si delibera quando i documenti del candidato ci sono tutti.' : 'Il proprietario non ha ancora invitato il candidato.';
    }
    const daVerificare = v.documenti.filter(d => d.verificabile && d.stato === 'da_verificare');
    if (daVerificare.length) return `Prima verifica ${daVerificare.length === 1 ? 'il documento' : 'i documenti'}: ${elenco(daVerificare.map(d => d.etichetta.toLowerCase()))}.`;
    const nonConformi = v.documenti.filter(d => d.di === 'proprietario' && d.stato === 'non_conforme');
    if (nonConformi.length) return `Manca un documento del proprietario da rifare: ${elenco(nonConformi.map(d => d.etichetta.toLowerCase()))}.`;
    if (!v.proposta) return 'La proposta si calcola quando i documenti sono verificati.';
    return null;
};

// Chi può aprire un documento: la funzione dice che tipo di dati, l'assegnazione
// su quali pratiche (§13.5). Chiusa la delibera, esce dalla coda e non si apre più.
export const puoAprire = (voce, doc, operatoreId) => {
    const op = trovaOperatore(operatoreId);
    const titolare = voce.assegnazione.operatoreId;
    if (voce.fase === 'deliberata') {
        return { puo: false, perche: `Non si apre più: la pratica è uscita dalla coda con la delibera del ${fmtData(voce.conclusaIl)}.` };
    }
    if (!doc.presente) return { puo: false, perche: doc.stato === 'non_conforme' ? 'Il file è stato cancellato quando è stato rifiutato.' : 'Il file non è ancora arrivato.' };
    if (op?.funzione !== 'istruttoria' || titolare !== operatoreId) {
        return { puo: false, perche: `Lo apre solo ${nomeOperatore(titolare)}, che ha la pratica in coda.` };
    }
    return { puo: true, perche: null };
};

// ─── Le statistiche ───────────────────────────────────────────────────────────
// Il tasso di dissenso conta solo le delibere in cui dissentire era possibile:
// quelle con una proposta del sistema e più di un esito.
export const statisticheDissenso = (delibere, dal, al = OGGI) => {
    const conProposta = delibere.filter(d => d.proposta && d.conProposta !== false && d.deliberataIl >= dal && d.deliberataIl <= al);
    const perOperatore = {};
    conProposta.forEach(d => {
        const o = (perOperatore[d.deliberataDa] ||= { totale: 0, dissensi: 0 });
        o.totale += 1;
        if (d.dissenso) o.dissensi += 1;
    });
    const dissensi = conProposta.filter(d => d.dissenso).length;
    return {
        totale: conProposta.length,
        dissensi,
        tasso: conProposta.length ? Math.round((dissensi / conProposta.length) * 100) : null,
        perOperatore,
    };
};

const costruisci = ({ s, pratiche, autocandidature, verifiche }) => {
    const delibere = [...DELIBERE_STORICHE, ...s.delibere];
    const deliberaDi = (chiave) => ultimo(delibere.filter(d => d.chiave === chiave));

    const grezze = [
        ...pratiche.map(p => vocePratica(p, s, deliberaDi)),
        ...autocandidature.map(a => voceAutocandidatura(a, s, deliberaDi)),
        ...verifiche.map(v => voceVerifica(v, deliberaDi)),
        ...DELIBERE_STORICHE.filter(d => d.chiave.startsWith('contratto:')).map(voceContratto),
    ].filter(Boolean).map(v => ({
        ...v,
        lingua: v.fase !== 'deliberata' ? linguaDi(s, v.clienteId) : null,
    }));

    const assegnazioni = assegnaTutte(grezze, s);
    const voci = grezze
        .map(v => ({ ...v, assegnazione: assegnazioni[v.chiave], blocco: bloccoDelibera(v) }))
        .sort((a, b) => (a.termine?.data || '9999').localeCompare(b.termine?.data || '9999') || b.arrivataIl.localeCompare(a.arrivataIl));

    const inizioMese = `${OGGI.slice(0, 7)}-01`;
    const verificheFatte = Object.values(s.verifiche).flatMap(perDoc => Object.values(perDoc).flat());
    const ultimi30 = aggiungiGiorniSolari(OGGI, -30);
    const recenti = verificheFatte.filter(x => x.il >= ultimi30);

    return {
        voci,
        delibere,
        dissenso: {
            mese: statisticheDissenso(delibere, inizioMese),
            anno: statisticheDissenso(delibere, aggiungiGiorniSolari(OGGI, -364)),
        },
        nonConformita: { verificati: recenti.length, nonConformi: recenti.filter(x => x.esito === 'non_conforme').length },
        letture: [...s.letture].reverse(),
        lingue: s.lingue,
    };
};

export const useIstruttoria = () => {
    const s = store.useStore();
    const pratiche = useTutteLePratiche();
    const autocandidature = useTutteLeAutocandidature();
    const verifiche = useTutteLeVerifiche();
    return useMemo(
        () => costruisci({ s: normalizza(s), pratiche, autocandidature, verifiche }),
        [s, pratiche, autocandidature, verifiche],
    );
};

// ─── Azioni ───────────────────────────────────────────────────────────────────
// Prima di toccare una pratica se ne tiene una copia: il «Ripristina» la
// rimette com'era, così la demo si rifà da capo.
const istantanea = (s, p) => (s.istantanee[p.id] ? s.istantanee : {
    ...s.istantanee,
    [p.id]: {
        stato: p.stato,
        istruttoria: p.istruttoria ?? null,
        candidato: p.candidato ?? null,
        documentiProprietario: p.documentiProprietario ?? [],
    },
});

const ricordaPratica = (p) => cambiaStato(s => ({ ...s, istantanee: istantanea(s, p) }));

// Ogni azione ha un numero d'ordine: le date della demo sono tutte «oggi»,
// e la traccia deve dire cosa è venuto prima.
const prossimo = (s) => (s.seq || 0) + 1;

export const forzaAssegnazione = ({ chiave, operatoreId, motivo, da }) =>
    cambiaStato(s => ({
        ...s,
        seq: prossimo(s),
        assegnazioni: { ...s.assegnazioni, [chiave]: { operatoreId, motivo: motivo.trim(), da, il: OGGI, seq: prossimo(s) } },
    }));

export const annullaForzatura = (chiave) =>
    cambiaStato(s => {
        const { [chiave]: _tolta, ...resto } = s.assegnazioni;
        return { ...s, assegnazioni: resto };
    });

// Verifica umana di un documento. Un documento non conforme si cancella subito
// e si chiede di nuovo: per il candidato la pratica torna ai documenti, per il
// proprietario il documento è «da integrare».
export const verificaDocumento = ({ voce, doc, esito, motivo = null, nota = '', da }) => {
    const record = { esito, motivo, nota: nota.trim() || null, da, il: OGGI };
    if (voce.tipo === 'pratica') {
        const p = voce.raw;
        ricordaPratica(p);
        if (doc.di === 'proprietario') {
            aggiornaPratica(p.id, {
                documentiProprietario: p.documentiProprietario.map(d => (d.tipo === doc.tipo ? { ...d, stato: esito === 'conforme' ? 'verificato' : 'da_integrare' } : d)),
            });
        } else if (esito === 'non_conforme') {
            aggiornaPratica(p.id, {
                stato: 'documenti',
                candidato: { ...p.candidato, documenti: p.candidato.documenti.map(d => (d.tipo === doc.tipo ? { ...d, stato: 'mancante' } : d)) },
            });
        }
    }
    cambiaStato(s => {
        const perVoce = s.verifiche[voce.chiave] || {};
        return {
            ...s,
            seq: prossimo(s),
            verifiche: { ...s.verifiche, [voce.chiave]: { ...perVoce, [doc.chiave]: [...(perVoce[doc.chiave] || []), { ...record, seq: prossimo(s) }] } },
        };
    });
    return record;
};

// Ogni apertura di un documento sensibile lascia una riga: è il registro che
// legge il DPO (accessi_log registra le letture, audit_log le modifiche).
export const registraLettura = ({ voce, doc, da }) =>
    cambiaStato(s => ({
        ...s,
        seq: prossimo(s),
        letture: [...s.letture, { id: nuovoIdDemo('let'), chiave: voce.chiave, riferimento: voce.id, documento: doc.etichetta, da, il: OGGI, tipo: 'normale', seq: prossimo(s) }],
    }));

// La delibera: conferma della proposta o dissenso motivato. Si registra chi, quando,
// cosa proponeva il sistema e perché la persona ha deciso diversamente.
export const delibera = ({ voce, esito, dissenso, motivo = '', da }) => {
    const record = {
        id: nuovoIdDemo('del'),
        chiave: voce.chiave,
        proposta: voce.proposta?.esito || null,
        conProposta: voce.proposta?.conProposta ?? false,
        esito,
        dissenso: Boolean(dissenso),
        motivo: dissenso ? motivo.trim() : null,
        fattori: (voce.proposta?.fattori || []).map(f => f.testo),
        deliberataDa: da,
        deliberataIl: OGGI,
    };

    if (voce.tipo === 'pratica') {
        const p = voce.raw;
        ricordaPratica(p);
        record.nota = notaPerProprietario(p, esito);
        // Nel database la delibera passa dalla sua funzione, che controlla chi
        // sta deliberando: chi ha portato il cliente non delibera la sua pratica.
        if (p.praticaDb) {
            deliberaPratica(p, esito === 'respinta' ? 'respinta' : 'approvata', record.nota);
        } else {
            aggiornaPratica(p.id, esito === 'respinta'
                ? { stato: 'respinta', istruttoria: { conclusaIl: OGGI, esito, nota: record.nota } }
                : { stato: 'pagamento', istruttoria: { conclusaIl: OGGI, esito, franchigiaMesi: franchigiaPer(p.prodotto, esito), nota: record.nota } });
        }
    } else if (voce.tipo === 'autocandidatura') {
        const a = voce.raw;
        const persona = trovaPersonaDemo(a.personaId) || { id: a.personaId };
        // proveEscluse: le prove non conformi non devono contare per il minimo.
        const fatto = concludiIstruttoria(a.id, persona, { smentita: esito === 'rifiutata' ? 'fondata' : 'non_regge', proveEscluse: voce.proveEscluse });
        if (!fatto) return null;
        record.certificatoId = fatto.certificatoId || null;
    } else if (voce.tipo === 'verifica') {
        const fatto = completaVerificaDemo(voce.id);
        if (!fatto) return null;
        record.esitoPubblicato = fatto.esito || null;
    }
    cambiaStato(s => ({ ...s, seq: prossimo(s), delibere: [...s.delibere, { ...record, seq: prossimo(s) }] }));
    return record;
};

// ─── Simulazioni (solo nei mockup) ────────────────────────────────────────────
// Il cliente dichiara la lingua preferita dalle sue preferenze: qui si simula.
export const simulaLingua = (personaId, lingua) =>
    cambiaStato(s => ({ ...s, lingue: { ...s.lingue, [personaId]: lingua === 'italiano' ? undefined : lingua } }));

export const simulaDocumentiCandidato = (p) => {
    ricordaPratica(p);
    aggiornaPratica(p.id, {
        stato: 'istruttoria',
        candidato: { ...p.candidato, ultimoAccesso: OGGI, documenti: p.candidato.documenti.map(d => ({ ...d, stato: 'caricato' })) },
    });
};

export const simulaRicaricaProprietario = (p, tipo) => {
    ricordaPratica(p);
    aggiornaPratica(p.id, { documentiProprietario: p.documentiProprietario.map(d => (d.tipo === tipo ? { ...d, stato: 'in_attesa' } : d)) });
};

export const simulaInvioAutocandidatura = (a) => inviaACria(a.id);

// Rimette le pratiche toccate da qui come erano e svuota la memoria
// dell'istruttoria. Autocandidature e verifiche hanno il loro ripristino.
export const ripristinaIstruttoriaDemo = () => {
    const s = leggiStato();
    Object.entries(s.istantanee).forEach(([id, prima]) => aggiornaPratica(id, prima));
    store.ripristina();
};

// ─── Riepilogo per la panoramica (O-01) ───────────────────────────────────────
// Una voce per coda: quanto c'è da lavorare, quanto è urgente, di chi è.
const conteggioPerOperatore = (voci) => voci.reduce((acc, v) => {
    const id = v.assegnazione.operatoreId;
    if (id) acc[id] = (acc[id] || 0) + 1;
    return acc;
}, {});

const urgente = (v) => v.termine && mancanoAlTermine(OGGI, v.termine.data, v.termine.calendario) <= 1;

export const riepilogoIstruttoria = (dati) => {
    const daDeliberare = dati.voci.filter(v => v.fase === 'da_deliberare' && v.tipo !== 'verifica');
    const verifiche = dati.voci.filter(v => v.fase === 'da_deliberare' && v.tipo === 'verifica');
    const conDocumenti = dati.voci.filter(v => v.fase !== 'deliberata');
    const documenti = conDocumenti.flatMap(v => v.documenti.filter(d => d.verificabile && d.stato === 'da_verificare').map(() => v));
    const { mese, anno } = dati.dissenso;
    return [
        {
            chiave: 'da_deliberare', funzione: 'istruttoria', etichetta: 'Pratiche da deliberare',
            valore: daDeliberare.length, urgenti: daDeliberare.filter(urgente).length,
            nota: `Termine interno: ${REGOLE_ISTRUTTORIA.giorniLavorativiDelibera} giorni lavorativi dai documenti completi`,
            percorso: PERCORSO_ISTRUTTORIA, perOperatore: conteggioPerOperatore(daDeliberare),
            urgentiPerOperatore: conteggioPerOperatore(daDeliberare.filter(urgente)),
        },
        {
            chiave: 'documenti_da_verificare', funzione: 'istruttoria', etichetta: 'Documenti da verificare',
            valore: documenti.length, urgenti: documenti.filter(urgente).length,
            nota: 'Verifica umana, documento per documento',
            percorso: PERCORSO_ISTRUTTORIA, perOperatore: conteggioPerOperatore(documenti),
            urgentiPerOperatore: conteggioPerOperatore(documenti.filter(urgente)),
        },
        {
            chiave: 'verifiche_da_esitare', funzione: 'istruttoria', etichetta: `${PRODOTTI.P3.nome} da esitare`,
            valore: verifiche.length, urgenti: verifiche.filter(urgente).length,
            nota: `Esito in piattaforma entro ${PRODOTTI.P3.oreEsito} ore dalla richiesta`,
            percorso: `${PERCORSO_ISTRUTTORIA}?vista=verifiche`, perOperatore: conteggioPerOperatore(verifiche),
            urgentiPerOperatore: conteggioPerOperatore(verifiche.filter(urgente)),
        },
        {
            chiave: 'tasso_dissenso', funzione: 'istruttoria', etichetta: 'Tasso di dissenso del mese',
            valore: mese.tasso ?? 0, urgenti: 0,
            nota: `${mese.dissensi} su ${mese.totale} delibere a ${nomeMese(OGGI.slice(0, 7)).toLowerCase()} · ${anno.tasso ?? 0}% negli ultimi 12 mesi`,
            percorso: PERCORSO_ISTRUTTORIA,
            perOperatore: Object.fromEntries(Object.entries(mese.perOperatore).map(([id, o]) => [id, Math.round((o.dissensi / o.totale) * 100)])),
        },
    ];
};

export const useRiepilogoIstruttoria = () => {
    const dati = useIstruttoria();
    return useMemo(() => riepilogoIstruttoria(dati), [dati]);
};

// ─── Per chi guarda ───────────────────────────────────────────────────────────
// Chi vede cosa in questa schermata (§13.5): l'istruttoria lavora la sua coda,
// il responsabile coordina senza aprire i documenti, il DPO vede il registro
// delle letture, tutti gli altri solo i numeri.
export const accessoIstruttoria = (operatore) => {
    const funzione = operatore?.funzione;
    if (funzione === 'admin') return { livello: 'coordinamento', testo: 'Hai accesso completo: vedi tutte le pratiche, le riassegni, apri i documenti e deliberi.' };
    if (funzione === 'istruttoria') return { livello: 'operativo', testo: 'Lavori la tua coda: verifichi i documenti delle pratiche assegnate a te e le deliberi.' };
    if (funzione === 'responsabile_operativo') return { livello: 'coordinamento', testo: 'Coordini la coda: vedi tutte le pratiche e puoi riassegnarle, ma non apri i documenti e non deliberi.' };
    if (funzione === 'dpo') return { livello: 'registro', testo: 'Vedi il registro di chi ha aperto quali documenti, non i documenti.' };
    const etichetta = FUNZIONI[funzione]?.etichetta || 'La tua funzione';
    return { livello: 'numeri', testo: funzione === 'direzione' ? 'La direzione vede solo dati aggregati, senza nomi.' : `${etichetta} non lavora questa coda: vedi solo i numeri.` };
};

