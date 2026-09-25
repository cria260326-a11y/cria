import { useMemo } from 'react';
import { OGGI, CONTESTAZIONI } from '@/data/datiDemo';
import { PRODOTTI, PARAMETRI, fmtEuro, nomeProdotto } from '@/data/catalogo';
import { MOROSITA } from '@/data/pratiche';
import { FUNZIONI, nomeOperatore } from '@/data/operatori';
import {
    REGOLE_CICLO, CONTESTAZIONI_INTERNE, DOCUMENTI_BANCARI, MOVIMENTI_CONTO, MOTIVI_CODA,
} from '@/data/incassi';
import { creaStoreDemo, nuovoIdDemo } from '@/lib/storeDemo';
import { apriPraticaDaContestazione } from '@/lib/garanziaDemo';
import { aggiungiGiorniLavorativi, giorniLavorativiTra, mancanoAlTermine } from '@/lib/calendario';
import { contestazioneChiusa } from '@/lib/etichette';
import { fmtData, nomeMese, meseSuccessivo } from '@/lib/formato';
import { contrattiAttuali, trovaContrattoAttuale, useContratti } from '@/lib/contrattiFonte';
import { contestazioniAttuali, useContestazioni, allaFormaDelleSchermate } from '@/lib/cicloFonte';

// ═════════════════════════════════════════════════════════════════════════════
// CICLO MENSILE NEI MOCKUP — O-09 segnalazioni, O-10 contestazioni,
// O-11 pagamenti, O-12 riconciliazione.
// Si legge dai contratti e dalle contestazioni di datiDemo.js; qui restano le
// azioni del back office: l'istruttoria delle contestazioni con le due firme
// della rettifica, i movimenti inseriti a mano e gli abbinamenti.
// Una rettifica firmata due volte cambia il mese del contratto: le funzioni
// applicaContestazioniAlContratto e applicaEsitoContestazione servono anche
// alle aree di proprietario e inquilino, perché raccontino la stessa storia.
// Una contestazione respinta fa partire la pratica di morosità del mese
// (lib/garanziaDemo, O-14).
//
// Fase 4: tabelle contestazioni, firme_rettifica, movimenti; il 12 alle 00:05
// il cron scrive non_rilevato.
// ═════════════════════════════════════════════════════════════════════════════

export const MESE_CORRENTE = OGGI.slice(0, 7);
export const MESE_PROSSIMO = meseSuccessivo(MESE_CORRENTE);
const GIORNO_OGGI = Number(OGGI.slice(8));
const due = (n) => String(n).padStart(2, '0');

// ─── Il calendario del mese, dai parametri (§9.2, §9.2-bis) ───────────────────
const SCADENZA = PARAMETRI.giornoScadenzaCanone;
export const CICLO = {
    scadenza: SCADENZA,
    ultimoUtile: SCADENZA + PARAMETRI.giorniFinestraCopertura,
    chiusura: PARAMETRI.giornoChiusuraMese,
    nonRilevato: { giorno: PARAMETRI.giornoChiusuraMese + 1, ora: '00:05' },
    // Giorno +1, +3 e la mattina dell'ultimo giorno utile; su tre canali.
    solleciti: [SCADENZA + 1, SCADENZA + 3, SCADENZA + PARAMETRI.giorniFinestraCopertura]
        .map((giorno, i) => ({ n: i + 1, giorno, quando: PARAMETRI.solleciti[i] })),
    canali: ['notifica', 'email', 'SMS'],
};

export const incassaCria = (c) => PRODOTTI[c.prodotto]?.incassa === 'cria';
export const conGaranzia = (c) => Boolean(PRODOTTI[c.prodotto]?.garanzia);

// ─── Stores ───────────────────────────────────────────────────────────────────
const storeContestazioni = creaStoreDemo('criaContestazioniDemo', () => ({}));
const storeRiconciliazione = creaStoreDemo('criaRiconciliazioneDemo', () => ({ nuovi: [], esiti: {} }));
const leggiRiconciliazione = () => ({ nuovi: [], esiti: {}, ...(storeRiconciliazione.leggi() || {}) });

export const useContestazioniDemo = () => storeContestazioni.useStore() || {};
export const leggiContestazioniDemo = () => storeContestazioni.leggi() || {};

// ═════════════════════════════════════════════════════════════════════════════
// CONTESTAZIONI (O-10)
// ═════════════════════════════════════════════════════════════════════════════

// Il mese contestato cambia solo con una contestazione chiusa: accolta con la
// rettifica firmata due volte, o respinta. Mai a mano.
export const applicaContestazioniAlContratto = (c, stato = {}) => {
    const decise = CONTESTAZIONI.filter(k => k.contrattoId === c.id && stato[k.id]);
    if (!decise.length) return c;
    const mesi = c.mesi.map(m => {
        const k = decise.find(x => x.mese === m.mese);
        const loc = k && stato[k.id];
        if (!loc) return m;
        if (loc.stato === 'risolta_favore_inquilino' && loc.rettifica?.secondaFirma) {
            return { ...m, stato: 'pagato', giorno: Number(loc.rettifica.data.slice(8)), pagatoIl: loc.rettifica.data, rettificato: true };
        }
        if (loc.stato === 'risolta_favore_locatore' && m.stato === 'contestato') return { ...m, stato: 'insoluto' };
        return m;
    });
    return { ...c, mesi };
};

// La contestazione come la vedono le parti: stato, esito e messaggi di CRIA.
export const applicaEsitoContestazione = (k, stato = {}) => {
    const loc = stato[k.id];
    if (!loc) return k;
    return {
        ...k,
        stato: loc.stato || k.stato,
        chiusaIl: loc.chiusaIl || k.chiusaIl,
        esito: loc.esito || k.esito,
        messaggi: [...k.messaggi, ...(loc.messaggi || [])],
        documenti: [...k.documenti, ...(loc.documenti || []).map(({ bancario: _b, ...d }) => d)],
    };
};

const DI_CHI = { locatore: 'proprietario', conduttore: 'inquilino', cria: 'CRIA' };

// Chi ha generato il dato contestato: per la matrice (§13.4) non può firmare
// la rettifica. Un proprietario non è un operatore; un incasso P2 sì.
const generatoDaDel = (c, m) => {
    const s = m?.segnalazione;
    if (!s) return { operatoreId: null, testo: '—' };
    if (s.fonte === 'cria') return { operatoreId: 'irene', testo: `${nomeOperatore('irene')}, incassi, riconciliando il bonifico` };
    if (s.fonte === 'automatica') return { operatoreId: null, testo: `il sistema, alla chiusura del ${fmtData(s.il)}` };
    return { operatoreId: null, testo: `${c.locatore.nome}, proprietario, con la segnalazione del ${fmtData(s.il)}` };
};

const contestazioneCompleta = (k, stato) => {
    const c = trovaContrattoAttuale(k.contrattoId);
    const interna = CONTESTAZIONI_INTERNE[k.id] || {};
    const loc = stato[k.id] || {};
    const mese = c.mesi.find(m => m.mese === k.mese);
    const visti = applicaEsitoContestazione(k, stato);
    const documenti = [
        ...k.documenti.map(d => ({ ...d, bancario: DOCUMENTI_BANCARI.includes(d.id) })),
        ...(loc.documenti || []),
    ];
    const rettifica = loc.rettifica !== undefined ? loc.rettifica : interna.rettifica || null;
    const chiusa = contestazioneChiusa(visti.stato);
    const secondaFirmaEntro = rettifica?.primaFirma && !rettifica.secondaFirma
        ? aggiungiGiorniLavorativi(rettifica.primaFirma.il, REGOLE_CICLO.giorniLavorativiSecondaFirma)
        : null;
    return {
        ...visti,
        contratto: c,
        meseDati: mese,
        documenti,
        assegnataA: loc.assegnataA || interna.assegnataA || 'nicola',
        presa: loc.presa || interna.presa || null,
        richieste: [...(interna.richieste || []), ...(loc.richieste || [])],
        note: [...(interna.note || []), ...(loc.note || [])],
        rettifica,
        rettificheNegate: loc.rettificheNegate || [],
        decisione: loc.decisione || interna.decisione || null,
        morosita: loc.morosita || null,
        generatoDa: generatoDaDel(c, mese),
        chiusa,
        termine: chiusa ? null : { data: k.rispostaEntro, calendario: 'solari', perche: `${PARAMETRI.giorniRispostaContestazione} giorni dall’apertura` },
        secondaFirmaEntro,
        inAttesaSecondaFirma: Boolean(rettifica?.primaFirma && !rettifica.secondaFirma && !chiusa),
    };
};

// I mesi segnalati non pagati che l'inquilino può ancora contestare.
const ancoraContestabili = (contratti) => contratti.flatMap(c => c.mesi
    .filter(m => m.stato === 'in_attesa' && m.scadenzaContestazione && m.scadenzaContestazione >= OGGI)
    .map(m => ({ contratto: c, mese: m })));

// Per le azioni: legge, cambia la contestazione, scrive.
const cambiaContestazione = (id, fn) => {
    const s = leggiContestazioniDemo();
    const attuale = s[id] || {};
    storeContestazioni.scrivi({ ...s, [id]: { ...attuale, ...fn(attuale) } });
};

const messaggio = (autore, testo) => ({ id: nuovoIdDemo('msg'), autore, testo, il: `${OGGI} ora` });

export const prendiInCarico = (k, da) => cambiaContestazione(k.id, (a) => ({
    stato: 'in_verifica',
    presa: { da, il: OGGI },
    messaggi: [...(a.messaggi || []), messaggio('sistema', 'CRIA ha preso in carico la contestazione.')],
}));

export const chiediDocumenti = (k, { a: aChi, testo }, da) => cambiaContestazione(k.id, (a) => ({
    stato: 'documentazione_richiesta',
    richieste: [...(a.richieste || []), { a: aChi, testo: testo.trim(), da, il: OGGI }],
    messaggi: [...(a.messaggi || []), messaggio('cria', `Chiediamo ${aChi === 'locatore' ? 'al proprietario' : 'all’inquilino'}: ${testo.trim()}`)],
}));

export const scriviAlleParti = (k, testo) => cambiaContestazione(k.id, (a) => ({
    messaggi: [...(a.messaggi || []), messaggio('cria', testo.trim())],
}));

export const aggiungiNota = (k, testo, da) => cambiaContestazione(k.id, (a) => ({
    note: [...(a.note || []), { da, il: OGGI, testo: testo.trim() }],
}));

// Respinta la contestazione, il canone risulta davvero non pagato: la pratica
// di morosità del mese parte (O-14), con la copertura che il mese aveva. Senza
// garanzia non parte: conta solo il semaforo. Restituisce quello che è successo.
export const respingiContestazione = (k, motivazione, da) => {
    cambiaContestazione(k.id, (a) => ({
        stato: 'risolta_favore_locatore',
        chiusaIl: OGGI,
        esito: `La segnalazione resta valida. ${motivazione.trim()}`,
        decisione: { tipo: 'respinta', da, il: OGGI, motivazione: motivazione.trim() },
        messaggi: [...(a.messaggi || []), messaggio('cria', `Contestazione respinta. ${motivazione.trim()}`)],
    }));
    const r = apriPraticaDaContestazione(k.id);
    const morosita = r.ok
        ? { aperta: true, praticaId: r.praticaId, il: OGGI }
        : { aperta: false, motivo: r.motivo, il: OGGI };
    cambiaContestazione(k.id, () => ({ morosita }));
    return morosita;
};

// Prima firma: l'assistenza propone la rettifica con il documento della banca
// e la data in cui il canone è arrivato. Il mese non cambia ancora.
export const proponiRettifica = (k, { documento, data, motivazione }, da) => cambiaContestazione(k.id, () => ({
    rettifica: { documento, data, motivazione: motivazione.trim(), primaFirma: { da, il: OGGI }, secondaFirma: null },
}));

// Seconda firma: una persona diversa conferma. Solo adesso il mese cambia.
export const confermaRettifica = (k, da) => cambiaContestazione(k.id, (a) => {
    const r = a.rettifica || k.rettifica;
    const giorno = Number(r.data.slice(8));
    return {
        stato: 'risolta_favore_inquilino',
        chiusaIl: OGGI,
        rettifica: { ...r, secondaFirma: { da, il: OGGI } },
        esito: `Il canone risulta arrivato il ${fmtData(r.data)}. La segnalazione è rettificata e il mese conta come pagato il ${giorno}.`,
        messaggi: [...(a.messaggi || []), messaggio('cria', 'Contestazione accolta: la segnalazione è rettificata.')],
    };
});

export const negaRettifica = (k, motivo, da) => cambiaContestazione(k.id, (a) => ({
    rettifica: null,
    rettificheNegate: [...(a.rettificheNegate || []), { ...(a.rettifica || k.rettifica), negataDa: da, negataIl: OGGI, motivo: motivo.trim() }],
}));

// Solo nei mockup: la parte a cui si sono chiesti i documenti li carica.
export const simulaDocumentiArrivati = (k) => cambiaContestazione(k.id, (a) => {
    const ultima = [...(a.richieste || [])].reverse()[0] || { a: 'locatore' };
    const mese = nomeMese(k.mese).toLowerCase();
    const doc = ultima.a === 'locatore'
        ? { id: nuovoIdDemo('dc'), nome: `Movimenti del conto di ${mese}.pdf`, caricatoDa: 'locatore', il: OGGI, bancario: true }
        : { id: nuovoIdDemo('dc'), nome: `Estratto movimenti ${mese}, solo canone.pdf`, caricatoDa: 'conduttore', il: OGGI, bancario: true };
    return {
        stato: 'in_verifica',
        documenti: [...(a.documenti || []), doc],
        messaggi: [...(a.messaggi || []), messaggio(ultima.a, 'Caricato il documento richiesto.')],
    };
});

export const ripristinaContestazioniDemo = () => storeContestazioni.ripristina();

// ═════════════════════════════════════════════════════════════════════════════
// RICONCILIAZIONE (O-12)
// ═════════════════════════════════════════════════════════════════════════════

const ABBINATO = ['abbinato_automatico', 'abbinato_manuale'];
const RE_CODICE = /CRIA[\s-]*([A-Z0-9]{4})[\s-]*([A-Z0-9]{4})/;
const MESI_CAUSALE = ['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO', 'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'];

export const codiceNellaCausale = (causale) => {
    const m = String(causale || '').toUpperCase().match(RE_CODICE);
    return m ? `CRIA-${m[1]}-${m[2]}` : null;
};

const caratteriDiversi = (a, b) => (a.length === b.length ? [...a].filter((x, i) => x !== b[i]).length : Infinity);

const parole = (testo) => String(testo || '').toUpperCase().replace(/[^A-ZÀ-Ü ]/g, ' ').split(/\s+/).filter(Boolean);
const stessoNome = (ordinante, nome) => {
    const o = new Set(parole(ordinante));
    const n = parole(nome);
    return n.length > 0 && n.every(p => o.has(p));
};

// «SETTEMBRE» nella causale: il settembre più vicino alla data del movimento.
const meseDallaCausale = (causale, data) => {
    const testo = String(causale || '').toUpperCase();
    const i = MESI_CAUSALE.findIndex(m => testo.includes(m));
    if (i < 0) return null;
    const anno = Number(data.slice(0, 4));
    const riferimento = anno * 12 + Number(data.slice(5, 7)) - 1;
    const scelto = [anno - 1, anno, anno + 1]
        .map(a => ({ a, distanza: Math.abs(a * 12 + i - riferimento) }))
        .sort((x, y) => x.distanza - y.distanza)[0].a;
    return `${scelto}-${due(i + 1)}`;
};

const abbinatiA = (movimenti, contrattoId, mese) => movimenti
    .filter(m => ABBINATO.includes(m.esito?.stato) && m.esito.tipo === 'canone' && m.esito.contrattoId === contrattoId && m.esito.mese === mese);

// I canoni ancora da incassare su un contratto dove incassa CRIA: i mesi del
// contratto non pagati, più il mese prossimo, che si può pagare in anticipo.
export const mesiAttesi = (c, movimenti) => {
    const mesi = [...c.mesi.map(m => m.mese), MESE_PROSSIMO];
    return mesi.map(mese => {
        const m = c.mesi.find(x => x.mese === mese);
        const incassato = m?.stato === 'pagato' ? c.canone : abbinatiA(movimenti, c.id, mese).reduce((s, x) => s + x.importo, 0);
        return { mese, residuo: Math.max(0, c.canone - incassato), incassatoIl: m?.stato === 'pagato' ? m.pagatoIl : null };
    }).filter(x => x.residuo > 0);
};

// Le rate dei piani di rientro arrivano a CRIA: il credito è suo dopo l'indennizzo.
const rateAperte = (c, movimenti) => MOROSITA
    .filter(p => p.contrattoId === c.id && p.piano)
    .flatMap(p => p.piano.rate
        .filter(r => r.stato !== 'pagata' && !movimenti.some(m => ABBINATO.includes(m.esito?.stato) && m.esito.tipo === 'rata' && m.esito.morositaId === p.id && m.esito.rata === r.n))
        .map(r => ({ ...r, morositaId: p.id })));

// La proposta: cerca il codice nella causale, poi l'ordinante; controlla mese e
// importo. «alta» vuol dire che il sistema non ha dubbi: conferma chi lavora
// gli incassi. Tutto il resto resta in coda con il motivo.
export const proponiAbbinamento = (mov, movimenti) => {
    const motivi = [];
    const codice = codiceNellaCausale(mov.causale);
    let c = null;
    let via = null;
    if (codice) {
        c = contrattiAttuali().find(x => x.codiceUnivoco === codice) || null;
        if (c) via = 'codice';
        else {
            c = contrattiAttuali().find(x => caratteriDiversi(x.codiceUnivoco, codice) === 1) || null;
            if (c) { via = 'codice_simile'; motivi.push({ codice: 'codice_simile', testo: `Nella causale c’è ${codice}: il codice più vicino è ${c.codiceUnivoco}`, grave: true }); }
        }
    }
    if (!c) {
        c = contrattiAttuali().find(x => (incassaCria(x) || rateAperte(x, movimenti).length) && stessoNome(mov.ordinante, x.conduttore.nome)) || null;
        if (c) { via = 'ordinante'; motivi.push({ codice: 'causale_senza_codice', testo: 'Nella causale non c’è il codice: il contratto si riconosce dall’ordinante', grave: true }); }
    }
    if (!c) {
        return { contrattoId: null, affidabilita: 'nessuna', motivi: [{ codice: 'pagatore_sconosciuto', testo: MOTIVI_CODA.pagatore_sconosciuto, grave: true }], suggerimento: 'estraneo' };
    }
    if (!stessoNome(mov.ordinante, c.conduttore.nome)) {
        motivi.push({ codice: 'ordinante_diverso', testo: `Ordinante ${mov.ordinante}: l’inquilino è ${c.conduttore.nome}`, grave: true });
    }

    if (!incassaCria(c)) {
        const rata = rateAperte(c, movimenti)[0];
        if (!rata) {
            motivi.push({ codice: 'contratto_non_cria', testo: `${MOTIVI_CODA.contratto_non_cria}: ${nomeProdotto(c.prodotto)}`, grave: true });
            return { contrattoId: c.id, tipo: null, affidabilita: 'nessuna', motivi, suggerimento: 'al_proprietario', via };
        }
        if (Math.abs(mov.importo - rata.importo) > 0.005) motivi.push({ codice: 'importo_diverso', testo: `${fmtEuro(mov.importo, 2)} contro una rata di ${fmtEuro(rata.importo, 2)}`, grave: true });
        return {
            contrattoId: c.id, tipo: 'rata', morositaId: rata.morositaId, rata: rata.n, atteso: rata.importo,
            affidabilita: via === 'codice' && !motivi.some(m => m.grave) ? 'alta' : 'da_controllare', motivi, via,
        };
    }

    const attesi = mesiAttesi(c, movimenti);
    const meseCausale = meseDallaCausale(mov.causale, mov.data);
    let scelto = null;
    if (meseCausale) {
        scelto = attesi.find(x => x.mese === meseCausale) || null;
        if (!scelto) {
            const pagato = c.mesi.find(x => x.mese === meseCausale && x.stato === 'pagato');
            motivi.push({ codice: 'nessun_mese_atteso', testo: `${nomeMese(meseCausale)} risulta già incassato${pagato ? ` il ${fmtData(pagato.pagatoIl)}` : ''}: possibile doppio pagamento`, grave: true });
        }
    }
    if (!scelto) scelto = attesi[0] || null;
    if (!scelto) {
        motivi.push({ codice: 'nessun_mese_atteso', testo: 'Nessun canone atteso su questo contratto', grave: true });
        return { contrattoId: c.id, tipo: 'canone', mese: null, affidabilita: 'nessuna', motivi, suggerimento: 'doppio', via };
    }
    if (scelto.mese > MESE_CORRENTE) {
        motivi.push({ codice: 'anticipo', testo: `${nomeMese(scelto.mese)} scade il ${fmtData(`${scelto.mese}-${due(SCADENZA)}`)}: è un anticipo`, grave: scelto.mese > MESE_PROSSIMO });
    }
    if (Math.abs(mov.importo - scelto.residuo) > 0.005) {
        motivi.push({ codice: 'importo_diverso', testo: `${fmtEuro(mov.importo, 2)} contro ${fmtEuro(scelto.residuo, 2)} attesi`, grave: true });
    }
    return {
        contrattoId: c.id, tipo: 'canone', mese: scelto.mese, atteso: scelto.residuo,
        affidabilita: via === 'codice' && !motivi.some(m => m.grave) ? 'alta' : 'da_controllare', motivi, via,
    };
};

const tuttiIMovimenti = (s) => {
    const base = MOVIMENTI_CONTO.map(m => ({ ...m, esito: s.esiti[m.id] || m.esito, base: true }));
    const nuovi = s.nuovi.map(m => ({ ...m, esito: s.esiti[m.id] || null }));
    // Per data, i più recenti prima; a parità, quelli appena registrati.
    return [...nuovi, ...base].sort((a, b) => b.data.localeCompare(a.data) || Number(Boolean(a.base)) - Number(Boolean(b.base)));
};

const cambiaRiconciliazione = (fn) => storeRiconciliazione.scrivi(fn(leggiRiconciliazione()));

export const registraMovimento = ({ data, importo, ordinante, causale }, da) => {
    const mov = {
        id: nuovoIdDemo('mov'), data, importo: Math.round(importo * 100) / 100,
        ordinante: ordinante.trim().toUpperCase(), causale: causale.trim().toUpperCase(),
        registrato: { da, il: OGGI },
    };
    cambiaRiconciliazione(s => ({ ...s, nuovi: [mov, ...s.nuovi] }));
    return mov;
};

// esito: { stato, tipo, contrattoId, mese | morositaId + rata, nota, motivo }
export const registraEsito = (movId, esito, da) =>
    cambiaRiconciliazione(s => ({ ...s, esiti: { ...s.esiti, [movId]: { ...esito, da, il: OGGI } } }));

export const ripristinaRiconciliazioneDemo = () => storeRiconciliazione.ripristina();

// ═════════════════════════════════════════════════════════════════════════════
// SEGNALAZIONI (O-09) E PAGAMENTI (O-11)
// ═════════════════════════════════════════════════════════════════════════════

// I solleciti del mese a chi incassa da sé: partono se il proprietario non ha
// ancora risposto quel giorno. Il P2 non ne riceve: incassa CRIA e sa già.
export const sollecitiDelMese = (c, m) => {
    if (incassaCria(c)) return [];
    const risposta = m?.segnalazione && m.segnalazione.fonte !== 'automatica' ? m.segnalazione.il : null;
    return CICLO.solleciti.map(s => {
        const data = `${m.mese}-${due(s.giorno)}`;
        let stato;
        if (risposta && risposta < data) stato = 'non_serviva';
        else if (data > OGGI) stato = 'in_programma';
        else stato = 'inviato';
        return { ...s, data, stato };
    });
};

// Dove cade la segnalazione rispetto alla finestra dei 5 giorni.
export const posizioneNellaFinestra = (c, m) => {
    const s = m?.segnalazione;
    if (!s || incassaCria(c)) return null;
    if (s.tipo === 'non_rilevato') return 'nessuna_risposta';
    if (s.tipo === 'pagato') return 'pagato';
    return Number(s.il.slice(8)) <= CICLO.ultimoUtile ? 'entro' : 'dopo';
};

// Lo stato della copertura del mese (§9.2): attiva, a rischio, decaduta.
// Nel giorno g, se il proprietario non ha ancora risposto.
export const coperturaNelGiorno = (c, mese, g) => {
    if (incassaCria(c)) return { stato: 'cria', etichetta: 'Incassa CRIA', classe: 'bg-purple-100 text-purple-800', nota: 'Non si chiede nulla al proprietario' };
    if (g > CICLO.chiusura) return { stato: 'non_rilevato', etichetta: 'Non rilevato', classe: 'bg-gray-100 text-gray-700', nota: `Il ${CICLO.nonRilevato.giorno} alle ${CICLO.nonRilevato.ora} il sistema scrive non rilevato: fuori dal semaforo${conGaranzia(c) ? ', copertura decaduta' : ''}` };
    if (!conGaranzia(c)) return { stato: 'senza_garanzia', etichetta: 'Senza garanzia', classe: 'bg-slate-100 text-slate-700', nota: 'Conta solo per il semaforo' };
    const fine = (() => { let f = c.attivoDal; for (let i = 0; i < PRODOTTI[c.prodotto].franchigiaMesi; i += 1) f = meseSuccessivo(f); return f; })();
    if (mese < fine) return { stato: 'in_franchigia', etichetta: 'In franchigia', classe: 'bg-slate-100 text-slate-700', nota: 'La garanzia non copre ancora il mese' };
    if (g < CICLO.ultimoUtile) return { stato: 'attiva', etichetta: 'Attiva', classe: 'bg-green-100 text-green-800', nota: `In attesa di risposta: la finestra resta aperta fino al ${CICLO.ultimoUtile}` };
    if (g === CICLO.ultimoUtile) return { stato: 'a_rischio', etichetta: 'A rischio', classe: 'bg-amber-100 text-amber-800', nota: 'Ultimo giorno utile: da domani, senza risposta, la copertura del mese decade' };
    return { stato: 'decaduta', etichetta: 'Decaduta', classe: 'bg-red-100 text-red-800', nota: `Finestra chiusa: se segnala ora conta per il semaforo, entro l’${CICLO.chiusura}` };
};

// La copertura del mese com'è andata, dal dato del contratto.
export const coperturaDelMese = (c, m) => {
    if (incassaCria(c)) return { etichetta: 'Incassa CRIA', classe: 'bg-purple-100 text-purple-800' };
    if (!conGaranzia(c)) return { etichetta: 'Senza garanzia', classe: 'bg-slate-100 text-slate-700' };
    const mappa = {
        attiva: { etichetta: 'Attiva', classe: 'bg-green-100 text-green-800' },
        in_franchigia: { etichetta: 'In franchigia', classe: 'bg-slate-100 text-slate-700' },
        decaduta_tardiva: { etichetta: 'Decaduta · segnalato tardi', classe: 'bg-red-100 text-red-800' },
        decaduta_mancata_segnalazione: { etichetta: 'Decaduta · non segnalato', classe: 'bg-red-100 text-red-800' },
    };
    return mappa[m?.copertura] || { etichetta: '—', classe: 'bg-slate-100 text-slate-700' };
};

// Com'è il canone di un contratto in un mese: atteso, ricevuto, non pagato…
const STATI_CANONE = {
    ricevuto: { etichetta: 'Ricevuto', classe: 'bg-green-100 text-green-800' },
    anticipo: { etichetta: 'Ricevuto in anticipo', classe: 'bg-green-100 text-green-800' },
    parziale: { etichetta: 'Ricevuto in parte', classe: 'bg-amber-100 text-amber-800' },
    atteso: { etichetta: 'Atteso', classe: 'bg-blue-50 text-blue-800' },
    non_pagato: { etichetta: 'Non pagato', classe: 'bg-red-100 text-red-800' },
    contestato: { etichetta: 'Contestato', classe: 'bg-blue-100 text-blue-800' },
    contestabile: { etichetta: 'Non pagato · contestabile', classe: 'bg-orange-100 text-orange-800' },
    non_rilevato: { etichetta: 'Non rilevato', classe: 'bg-gray-100 text-gray-700' },
    fuori: { etichetta: '—', classe: 'bg-transparent text-muted-foreground' },
};
export { STATI_CANONE };

export const canoneDelMese = (c, mese, movimenti) => {
    const m = c.mesi.find(x => x.mese === mese);
    const cria = incassaCria(c);
    const trattenuta = cria ? Math.round(c.canone * PRODOTTI[c.prodotto].percentuale) / 100 : 0;
    const base = { contratto: c, mese, atteso: c.canone, cria, trattenuta, meseDati: m || null };
    if (!m) {
        if (mese !== MESE_PROSSIMO || mese < c.primoMese) return { ...base, stato: 'fuori' };
        const arrivati = cria ? abbinatiA(movimenti, c.id, mese) : [];
        const importo = arrivati.reduce((s, x) => s + x.importo, 0);
        if (!importo) return { ...base, stato: 'atteso', nota: cria ? `Scade il ${fmtData(`${mese}-${due(SCADENZA)}`)}` : `Dal ${CICLO.solleciti[0].giorno} si chiede al proprietario` };
        return {
            ...base, stato: importo >= c.canone ? 'anticipo' : 'parziale', ricevuto: importo,
            ricevutoIl: arrivati.map(x => x.data).sort().pop(), fonte: 'riconciliazione', movimenti: arrivati,
        };
    }
    const fonte = cria ? 'riconciliazione' : 'proprietario';
    switch (m.stato) {
        case 'pagato': return {
            ...base, stato: 'ricevuto', ricevuto: c.canone, ricevutoIl: m.pagatoIl, giorno: m.giorno, fonte,
            rettificato: Boolean(m.rettificato || (m.contestazioneId && m.segnalazione?.tipo === 'non_pagato' && m.giorno < Number(m.segnalazione.il.slice(8)))),
            movimenti: cria ? movimenti.filter(x => ABBINATO.includes(x.esito?.stato) && x.esito.tipo === 'canone' && x.esito.contrattoId === c.id && x.esito.mese === mese) : [],
            giratoIl: m.bonificoIl, girato: cria ? c.canone - trattenuta : null,
        };
        case 'contestato': return { ...base, stato: 'contestato', fonte, contestazioneId: m.contestazioneId };
        case 'in_attesa': return { ...base, stato: 'contestabile', fonte, contestabileFino: m.scadenzaContestazione };
        case 'non_rilevato': return { ...base, stato: 'non_rilevato', fonte: 'automatica' };
        default: return { ...base, stato: 'non_pagato', fonte, morosita: MOROSITA.find(p => p.contrattoId === c.id && p.mesi.includes(mese)) || null };
    }
};

// ═════════════════════════════════════════════════════════════════════════════
// TUTTO INSIEME
// ═════════════════════════════════════════════════════════════════════════════

const costruisci = (statoContestazioni, statoRiconciliazione) => {
    const contratti = contrattiAttuali().map(c => applicaContestazioniAlContratto(c, statoContestazioni));
    // Quelle vere del database più quelle dei dati di prova, nella stessa forma.
    const contestazioni = [
        ...contestazioniAttuali().map(allaFormaDelleSchermate),
        ...CONTESTAZIONI,
    ].map(k => contestazioneCompleta(k, statoContestazioni))
        .sort((a, b) => Number(a.chiusa) - Number(b.chiusa) || b.apertaIl.localeCompare(a.apertaIl));
    const movimenti = tuttiIMovimenti(statoRiconciliazione);
    const conProposte = movimenti.map(m => (m.esito ? m : { ...m, proposta: proponiAbbinamento(m, movimenti) }));
    const mesi = [...new Set(contratti.flatMap(c => c.mesi.map(m => m.mese)))].sort();
    return {
        contratti,
        contestazioni,
        contestabili: ancoraContestabili(contratti),
        movimenti: conProposte,
        mesi,
    };
};

export const useCicloMensile = () => {
    const contratti = useContratti();
    const dalDatabase = useContestazioni();
    const statoContestazioni = useContestazioniDemo();
    const statoRiconciliazione = storeRiconciliazione.useStore();
    return useMemo(
        () => costruisci(statoContestazioni, { nuovi: [], esiti: {}, ...(statoRiconciliazione || {}) }),
        // Come in anagraficheDemo: «contratti» rifà il conto quando la fonte cambia.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [statoContestazioni, statoRiconciliazione, contratti, dalDatabase],
    );
};

// ─── Riepilogo per la panoramica (O-01) ───────────────────────────────────────
const inCodaDa = (m) => giorniLavorativiTra(m.registrato?.il || m.data, OGGI);

export const riepilogoCicloMensile = (dati) => {
    const delMese = dati.contratti.map(c => ({ c, m: c.mesi.find(x => x.mese === MESE_CORRENTE) })).filter(x => x.m);
    const segnalano = delMese.filter(({ c }) => !incassaCria(c));
    const aperte = GIORNO_OGGI <= CICLO.chiusura ? segnalano.filter(({ m }) => !m.segnalazione) : [];
    const aRischio = aperte.filter(({ c }) => coperturaNelGiorno(c, MESE_CORRENTE, GIORNO_OGGI).stato === 'a_rischio');
    const nonRilevate = segnalano.filter(({ m }) => m.stato === 'non_rilevato');
    const contestazioniAperte = dati.contestazioni.filter(k => !k.chiusa);
    const vicine = contestazioniAperte.filter(k => mancanoAlTermine(OGGI, k.termine.data, 'solari') <= 1);
    const secondaFirma = contestazioniAperte.filter(k => k.inAttesaSecondaFirma);
    const nonArrivati = delMese.filter(({ m }) => ['insoluto', 'in_attesa', 'contestato'].includes(m.stato));
    const coda = dati.movimenti.filter(m => !m.esito);
    const perOperatore = (lista, chi) => (lista.length ? { [chi]: lista.length } : {});
    const perAssegnata = (lista) => lista.reduce((acc, k) => ({ ...acc, [k.assegnataA]: (acc[k.assegnataA] || 0) + 1 }), {});
    const fermi = coda.filter(m => inCodaDa(m) >= REGOLE_CICLO.giorniLavorativiAbbinamento);
    const nomeDelMese = nomeMese(MESE_CORRENTE).toLowerCase();
    return [
        {
            chiave: 'segnalazioni_aperte', funzione: 'incassi', etichetta: 'Segnalazioni del mese ancora aperte',
            valore: aperte.length, urgenti: aRischio.length,
            nota: GIORNO_OGGI <= CICLO.chiusura ? `Finestra fino al ${CICLO.ultimoUtile}, chiusura l’${CICLO.chiusura}` : `Il ciclo di ${nomeDelMese} si è chiuso l’${CICLO.chiusura}`,
            percorso: '/dashboard/admin/segnalazioni',
        },
        {
            chiave: 'non_rilevate', funzione: 'incassi', etichetta: `Mesi non rilevati a ${nomeDelMese}`,
            valore: nonRilevate.length, urgenti: 0,
            nota: 'Nessuna risposta entro l’11: fuori dal semaforo, copertura decaduta',
            percorso: '/dashboard/admin/segnalazioni',
        },
        {
            chiave: 'contestazioni_aperte', funzione: 'assistenza', etichetta: 'Contestazioni aperte',
            valore: contestazioniAperte.length, urgenti: vicine.length,
            nota: `CRIA risponde entro ${PARAMETRI.giorniRispostaContestazione} giorni dall’apertura`,
            percorso: '/dashboard/admin/contestazioni',
            perOperatore: perAssegnata(contestazioniAperte),
            urgentiPerOperatore: perAssegnata(vicine),
        },
        {
            chiave: 'rettifiche_seconda_firma', funzione: 'responsabile_operativo', etichetta: 'Rettifiche in attesa della seconda firma',
            valore: secondaFirma.length, urgenti: secondaFirma.filter(k => mancanoAlTermine(OGGI, k.secondaFirmaEntro, 'lavorativi') <= 1).length,
            nota: `Entro ${REGOLE_CICLO.giorniLavorativiSecondaFirma} giorni lavorativi dalla prima`,
            percorso: '/dashboard/admin/contestazioni',
        },
        {
            chiave: 'canoni_non_arrivati', funzione: 'incassi', etichetta: `Canoni di ${nomeDelMese} non arrivati`,
            valore: nonArrivati.length, urgenti: 0,
            nota: nonRilevate.length ? `Più ${nonRilevate.length} non ${nonRilevate.length === 1 ? 'rilevato' : 'rilevati'}: non si sa` : 'Segnalati non pagati, contestati o ancora contestabili',
            percorso: '/dashboard/admin/pagamenti',
        },
        {
            chiave: 'movimenti_non_abbinati', funzione: 'incassi', etichetta: 'Movimenti non abbinati',
            valore: coda.length, urgenti: fermi.length,
            nota: `In coda da ${REGOLE_CICLO.giorniLavorativiAbbinamento} giorni lavorativi o più: urgenti`,
            percorso: '/dashboard/admin/riconciliazione',
            perOperatore: perOperatore(coda, 'irene'),
            urgentiPerOperatore: perOperatore(fermi, 'irene'),
        },
    ];
};

export const useRiepilogoCicloMensile = () => {
    const dati = useCicloMensile();
    return useMemo(() => riepilogoCicloMensile(dati), [dati]);
};

// Lo stesso riepilogo, col nome che usa la panoramica per la funzione incassi.
export const useRiepilogoIncassi = useRiepilogoCicloMensile;

export { inCodaDa };

// ─── Chi vede cosa (§13.5) ────────────────────────────────────────────────────
const ACCESSI = {
    segnalazioni: { operativo: ['incassi'], lettura: ['responsabile_operativo', 'assistenza', 'gestore_pratica', 'resp_amministrativo'] },
    contestazioni: { operativo: ['assistenza'], firma: ['responsabile_operativo', 'resp_legale'], lettura: ['incassi'] },
    pagamenti: { operativo: ['incassi'], lettura: ['responsabile_operativo', 'resp_amministrativo', 'tesoreria', 'indennizzi'] },
    riconciliazione: { operativo: ['incassi'], lettura: ['responsabile_operativo', 'resp_amministrativo', 'tesoreria'] },
};

const TESTI = {
    segnalazioni: { operativo: 'Segui il ciclo del mese di tutti i contratti.', lettura: 'Vedi il ciclo del mese: lo segue la funzione incassi.' },
    contestazioni: { operativo: 'Istruisci le contestazioni: decidi, o proponi la rettifica con la prima firma.', firma: 'Metti la seconda firma sulle rettifiche proposte da altri.', lettura: 'Vedi le contestazioni: le istruisce l’assistenza.' },
    pagamenti: { operativo: 'Segui i canoni attesi e ricevuti.', lettura: 'Vedi i canoni attesi e ricevuti: li segue la funzione incassi.' },
    riconciliazione: { operativo: 'Inserisci i movimenti del conto e confermi gli abbinamenti.', lettura: 'Vedi movimenti e abbinamenti: li lavora la funzione incassi.' },
};

export const accessoCiclo = (schermata, operatore) => {
    const f = operatore?.funzione;
    if (f === 'admin') return { livello: 'operativo', testo: 'Hai accesso completo: lavori questa schermata come la funzione che la segue.' };
    const r = ACCESSI[schermata];
    const livello = r.operativo.includes(f) ? 'operativo' : r.firma?.includes(f) ? 'firma' : r.lettura.includes(f) ? 'lettura' : 'numeri';
    if (livello === 'numeri') {
        return { livello, testo: f === 'direzione' ? 'La direzione vede solo dati aggregati, senza nomi.' : `${FUNZIONI[f]?.etichetta || 'La tua funzione'} non lavora questa schermata: vedi solo i numeri.` };
    }
    return { livello, testo: TESTI[schermata][livello] };
};
