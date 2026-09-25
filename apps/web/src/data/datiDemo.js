// ═════════════════════════════════════════════════════════════════════════════
// DATI DEMO — SOLO PER I MOCKUP
// Una base dati unica per le aree di proprietario e inquilino. Le posizioni
// delle persone demo si ricavano da qui (personeDemo.js), quindi il selettore
// di contesto e le pagine non possono più raccontare cose diverse: se Mario ha
// due immobili nel selettore, ne ha due in ogni schermata.
//
// Lo stesso contratto è letto da due lati: Via Padova 12 è un contratto di
// Immobiliare Verdi visto dal proprietario e di Giulia Ferri visto
// dall'inquilina. Stessi mesi, stesse contestazioni, prospettive diverse.
//
// Nel modello dati si dice locatore e conduttore; nell'interfaccia proprietario
// e inquilino (documento di stato §13.1).
//
// Fase 4: questi dati arrivano dal database attraverso src/services/.
// ═════════════════════════════════════════════════════════════════════════════

import { PRODOTTI, PARAMETRI } from '@/data/catalogo';
import { aggiungiGiorni, giorniTra } from '@/lib/formato';

// La demo è fotografata a questa data: così segnalazioni, finestre e
// scadenze restano coerenti in qualunque giorno si apra il mockup.
export const OGGI = '2026-09-15';

const MESE_CORRENTE = OGGI.slice(0, 7);

const meseDopo = (mese, n) => {
    const [a, m] = mese.split('-').map(Number);
    const tot = a * 12 + (m - 1) + n;
    return `${Math.floor(tot / 12)}-${String((tot % 12) + 1).padStart(2, '0')}`;
};

const elencoMesi = (primo, ultimo) => {
    const out = [];
    for (let m = primo; m <= ultimo; m = meseDopo(m, 1)) out.push(m);
    return out;
};

// Un mese per voce, dal più vecchio al più recente:
//   numero                              pagamento arrivato quel giorno
//   'NR'                                nessuna segnalazione entro l'11 → non rilevato
//   'NP'                                segnalato non pagato e mai pagato → insoluto
//   { np, pagato }                      segnalato non pagato, poi pagato quel giorno
//   { np, contestazione }               segnalato non pagato, contestazione in corso
//   { np }                              segnalato non pagato, si può ancora contestare
const generaMesi = ({ prodotto, canone, attivoDal, primoMese, spec }) => {
    const p = PRODOTTI[prodotto];
    const fineFranchigia = p.garanzia ? meseDopo(attivoDal, p.franchigiaMesi) : null;
    const fonte = p.incassa === 'cria' ? 'cria' : 'proprietario';
    const mesi = elencoMesi(primoMese, MESE_CORRENTE);
    if (mesi.length !== spec.length) {
        throw new Error(`datiDemo: ${prodotto} ha ${spec.length} mesi descritti ma ${mesi.length} mesi da ${primoMese}`);
    }

    return mesi.map((mese, i) => {
        const s = spec[i];
        const giornoIso = (g) => `${mese}-${String(g).padStart(2, '0')}`;
        const copertura = (c) => (!p.garanzia ? null : mese < fineFranchigia ? 'in_franchigia' : c);
        const base = { mese, scadenza: `${mese}-01`, canone, contestazioneId: null, bonificoIl: null };

        if (typeof s === 'number') {
            // Chi incassa da sé segnala l'arrivo il giorno stesso; se il canone
            // arriva dopo l'11 vuol dire che entro la finestra ha segnalato il mancato pagamento.
            const segnalazione = fonte === 'proprietario' && s > PARAMETRI.giornoChiusuraMese
                ? { tipo: 'non_pagato', il: giornoIso(4), fonte }
                : { tipo: 'pagato', il: giornoIso(s), fonte };
            return {
                ...base, stato: 'pagato', giorno: s, pagatoIl: giornoIso(s), segnalazione,
                copertura: copertura('attiva'),
                bonificoIl: fonte === 'cria' ? aggiungiGiorni(giornoIso(s), 2) : null,
            };
        }
        if (s === 'NR') {
            return {
                ...base, stato: 'non_rilevato', giorno: null, pagatoIl: null,
                segnalazione: { tipo: 'non_rilevato', il: giornoIso(PARAMETRI.giornoChiusuraMese + 1), fonte: 'automatica' },
                copertura: copertura('decaduta_mancata_segnalazione'),
            };
        }
        if (s === 'NP') {
            return {
                ...base, stato: 'insoluto', giorno: null, pagatoIl: null,
                segnalazione: { tipo: 'non_pagato', il: giornoIso(4), fonte },
                copertura: copertura('attiva'),
            };
        }

        const segnalazione = { tipo: 'non_pagato', il: giornoIso(s.np), fonte };
        const tardiva = s.np > PARAMETRI.giornoScadenzaCanone + PARAMETRI.giorniFinestraCopertura;
        const cop = copertura(tardiva ? 'decaduta_tardiva' : 'attiva');
        const scadenzaContestazione = aggiungiGiorni(segnalazione.il, PARAMETRI.giorniContestazione);

        if (s.pagato) {
            return {
                ...base, stato: 'pagato', giorno: s.pagato, pagatoIl: giornoIso(s.pagato),
                segnalazione, copertura: cop, contestazioneId: s.contestazione || null, scadenzaContestazione,
            };
        }
        if (s.contestazione) {
            return {
                ...base, stato: 'contestato', giorno: null, pagatoIl: null,
                segnalazione, copertura: cop, contestazioneId: s.contestazione, scadenzaContestazione,
            };
        }
        const contestabile = giorniTra(OGGI, scadenzaContestazione) >= 0;
        return {
            ...base, stato: contestabile ? 'in_attesa' : 'insoluto', giorno: null, pagatoIl: null,
            segnalazione, copertura: cop, scadenzaContestazione,
        };
    });
};

// Il codice univoco del contratto è la causale di ogni bonifico verso CRIA
// (documento di stato §13.2): gli incassi riconciliano abbinando quello.
const CODICI_UNIVOCI = {
    'c-verdi3': 'CRIA-7Q4K-2M9P',
    'c-verdi5': 'CRIA-3HX8-KD5T',
    'c-italia88': 'CRIA-9WEN-4RB2',
    'c-padova12': 'CRIA-5TGA-8LVC',
    'c-monza140': 'CRIA-2PZR-6YJF',
    'c-tortona27': 'CRIA-8MCU-3NQE',
};

const contratto = (c) => ({ ...c, codiceUnivoco: CODICI_UNIVOCI[c.id], mesi: generaMesi(c) });

// ─── Contratti ────────────────────────────────────────────────────────────────
export const CONTRATTI = [
    contratto({
        id: 'c-verdi3',
        prodotto: 'P2',
        canone: 1100,
        deposito: 3300,
        immobile: { indirizzo: 'Via Verdi 3', cap: '20121', citta: 'Milano', provincia: 'MI', lat: 45.46852, lng: 9.18942, tipologia: 'Bilocale', mq: 62, catasto: 'Foglio 349 · Particella 112 · Sub 7' },
        locatore: { personaId: 'mario', nome: 'Mario Rossi', email: 'proprietario@cri-affitti.it', telefono: '+39 333 1234567' },
        conduttore: { personaId: null, nome: 'Davide Colombo', email: 'davide.colombo@esempio.it', telefono: '+39 348 1122334' },
        inizio: '2025-10-01', fine: '2029-09-30', durata: '4 + 4 anni',
        attivoDal: '2025-10', primoMese: '2025-10',
        registrazione: { numero: 'TMV25T012345000QF', data: '2025-10-08', ufficio: 'Agenzia delle Entrate · DP I Milano' },
        storicoInquilini: [{ nome: 'Elisa Ferrara', dal: '2021-02-01', al: '2025-08-31' }],
        spec: [2, 1, 3, 2, 1, 2, 3, 1, 2, 2, 1, 3],
    }),
    contratto({
        id: 'c-verdi5',
        prodotto: 'P1E',
        canone: 950,
        deposito: 2850,
        immobile: { indirizzo: 'Via Verdi 5', cap: '20121', citta: 'Milano', provincia: 'MI', lat: 45.46902, lng: 9.18871, tipologia: 'Monolocale', mq: 38, catasto: 'Foglio 349 · Particella 114 · Sub 3' },
        locatore: { personaId: 'mario', nome: 'Mario Rossi', email: 'proprietario@cri-affitti.it', telefono: '+39 333 1234567' },
        conduttore: { personaId: null, nome: 'Chiara Lombardi', email: 'chiara.lombardi@esempio.it', telefono: '+39 339 4455667' },
        inizio: '2023-06-01', fine: '2027-05-31', durata: '4 + 4 anni',
        attivoDal: '2025-11', primoMese: '2025-11',
        registrazione: { numero: 'TMV23T004512000KP', data: '2023-06-12', ufficio: 'Agenzia delle Entrate · DP I Milano' },
        storicoInquilini: [{ nome: 'Paolo Neri', dal: '2019-06-01', al: '2023-05-31' }],
        spec: [6, 8, 7, 9, 6, 'NR', { np: 4, pagato: 14, contestazione: 'con-verdi5-2026-05' }, 7, 8, 6, { np: 4, contestazione: 'con-verdi5-2026-09' }],
    }),
    contratto({
        id: 'c-italia88',
        prodotto: 'P1',
        canone: 1400,
        deposito: 4200,
        immobile: { indirizzo: 'Corso Italia 88', cap: '20122', citta: 'Milano', provincia: 'MI', lat: 45.45612, lng: 9.18804, tipologia: 'Trilocale', mq: 85, catasto: 'Foglio 437 · Particella 58 · Sub 12' },
        locatore: { personaId: null, nome: 'Francesca Bellini', email: 'francesca.bellini@esempio.it', telefono: '+39 347 9988776' },
        conduttore: { personaId: 'mario', nome: 'Mario Rossi', email: 'proprietario@cri-affitti.it', telefono: '+39 333 1234567' },
        inizio: '2024-09-01', fine: '2028-08-31', durata: '4 + 4 anni',
        attivoDal: '2025-10', primoMese: '2025-10',
        registrazione: { numero: 'TMV24T009876000ZA', data: '2024-09-10', ufficio: 'Agenzia delle Entrate · DP II Milano' },
        storicoInquilini: [],
        spec: [1, 2, 1, 3, 2, 1, 2, 1, 2, 3, 1, 2],
    }),
    contratto({
        id: 'c-padova12',
        prodotto: 'P5',
        canone: 780,
        deposito: 2340,
        immobile: { indirizzo: 'Via Padova 12', cap: '20127', citta: 'Milano', provincia: 'MI', lat: 45.49588, lng: 9.22291, tipologia: 'Bilocale', mq: 48, catasto: 'Foglio 187 · Particella 301 · Sub 9' },
        locatore: { personaId: 'verdi', nome: 'Immobiliare Verdi S.r.l.', email: 'societa@cri-affitti.it', telefono: '+39 02 87654321' },
        conduttore: { personaId: 'giulia', nome: 'Giulia Ferri', email: 'inquilino@cri-affitti.it', telefono: '+39 347 5550192' },
        inizio: '2025-03-01', fine: '2029-02-28', durata: '4 + 4 anni',
        attivoDal: '2025-03', primoMese: '2025-10',
        registrazione: { numero: 'TMV25T002233000LM', data: '2025-03-07', ufficio: 'Agenzia delle Entrate · DP II Milano' },
        storicoInquilini: [{ nome: 'Andrea Costa', dal: '2020-01-01', al: '2025-01-31' }],
        spec: [5, 7, 6, 'NR', 8, 6, 9, 7, 6, 7, { np: 4, pagato: 2, contestazione: 'con-padova12-2026-08' }, { np: 10 }],
    }),
    contratto({
        id: 'c-monza140',
        prodotto: 'P2',
        canone: 1250,
        deposito: 3750,
        immobile: { indirizzo: 'Viale Monza 140', cap: '20127', citta: 'Milano', provincia: 'MI', lat: 45.50391, lng: 9.22433, tipologia: 'Trilocale', mq: 78, catasto: 'Foglio 158 · Particella 44 · Sub 21' },
        locatore: { personaId: 'verdi', nome: 'Immobiliare Verdi S.r.l.', email: 'societa@cri-affitti.it', telefono: '+39 02 87654321' },
        conduttore: { personaId: null, nome: 'Stefano Ricci', email: 'stefano.ricci@esempio.it', telefono: '+39 340 2233445' },
        inizio: '2024-01-01', fine: '2027-12-31', durata: '4 + 4 anni',
        attivoDal: '2024-01', primoMese: '2025-10',
        registrazione: { numero: 'TMV24T000187000RB', data: '2024-01-09', ufficio: 'Agenzia delle Entrate · DP II Milano' },
        storicoInquilini: [],
        spec: [3, 2, 4, 2, 3, 1, 2, 4, 3, 2, 3, 2],
    }),
    contratto({
        id: 'c-tortona27',
        prodotto: 'P1',
        canone: 1050,
        deposito: 3150,
        immobile: { indirizzo: 'Via Tortona 27', cap: '20144', citta: 'Milano', provincia: 'MI', lat: 45.45204, lng: 9.16508, tipologia: 'Loft', mq: 70, catasto: 'Foglio 476 · Particella 90 · Sub 2' },
        locatore: { personaId: 'verdi', nome: 'Immobiliare Verdi S.r.l.', email: 'societa@cri-affitti.it', telefono: '+39 02 87654321' },
        conduttore: { personaId: 'martina', nome: 'Martina Galli', email: 'morosita@cri-affitti.it', telefono: '+39 351 6677889' },
        inizio: '2025-06-01', fine: '2029-05-31', durata: '4 + 4 anni',
        attivoDal: '2025-06', primoMese: '2025-10',
        registrazione: { numero: 'TMV25T006611000TC', data: '2025-06-06', ufficio: 'Agenzia delle Entrate · DP III Milano' },
        storicoInquilini: [],
        spec: [9, 12, 11, 'NR', 13, 10, 12, 'NR', 14, 'NP', 15, 'NR'],
    }),
];

// ─── Contestazioni ────────────────────────────────────────────────────────────
// I messaggi sono quelli che le parti si scambiano attraverso CRIA. Le note
// interne di CRIA non stanno qui: nessuna area esterna le vede.
export const CONTESTAZIONI = [
    {
        id: 'con-verdi5-2026-09',
        contrattoId: 'c-verdi5',
        mese: '2026-09',
        segnalazione: { tipo: 'non_pagato', il: '2026-09-04' },
        apertaIl: '2026-09-11',
        rispostaEntro: '2026-09-16',
        stato: 'aperta',
        chiusaIl: null,
        esito: null,
        motivo: 'L’inquilina dichiara di aver pagato con bonifico il 3 settembre e allega la ricevuta.',
        documenti: [
            { id: 'dc-1', nome: 'Ricevuta bonifico 03-09-2026.pdf', caricatoDa: 'conduttore', il: '2026-09-11' },
        ],
        messaggi: [
            { id: 1, autore: 'sistema', testo: 'Chiara Lombardi ha contestato la segnalazione di mancato pagamento di settembre.', il: '2026-09-11 18:42' },
            { id: 2, autore: 'conduttore', testo: 'Ho fatto il bonifico il 3 settembre. Allego la ricevuta: forse non è ancora arrivato sul conto.', il: '2026-09-11 18:44' },
        ],
    },
    {
        id: 'con-verdi5-2026-05',
        contrattoId: 'c-verdi5',
        mese: '2026-05',
        segnalazione: { tipo: 'non_pagato', il: '2026-05-04' },
        apertaIl: '2026-05-10',
        rispostaEntro: '2026-05-15',
        stato: 'risolta_favore_locatore',
        chiusaIl: '2026-05-15',
        esito: 'Il bonifico risulta arrivato il 14 maggio, non il 2 come dichiarato. La segnalazione resta valida e il mese conta come pagato il 14.',
        motivo: 'L’inquilina dichiarava di aver pagato il 2 maggio.',
        documenti: [
            { id: 'dc-2', nome: 'Screenshot bonifico maggio.jpg', caricatoDa: 'conduttore', il: '2026-05-10' },
            { id: 'dc-3', nome: 'Estratto movimenti maggio.pdf', caricatoDa: 'locatore', il: '2026-05-12' },
        ],
        messaggi: [
            { id: 1, autore: 'sistema', testo: 'Chiara Lombardi ha contestato la segnalazione di mancato pagamento di maggio.', il: '2026-05-10 09:12' },
            { id: 2, autore: 'conduttore', testo: 'Il bonifico l’ho disposto il 2 maggio.', il: '2026-05-10 09:13' },
            { id: 3, autore: 'cria', testo: 'Chiediamo al proprietario i movimenti del conto di maggio.', il: '2026-05-11 10:30' },
            { id: 4, autore: 'locatore', testo: 'Caricati. L’accredito compare il 14.', il: '2026-05-12 17:05' },
            { id: 5, autore: 'cria', testo: 'Il bonifico è stato disposto il 13 e accreditato il 14. La segnalazione resta valida.', il: '2026-05-15 11:20' },
        ],
    },
    {
        id: 'con-padova12-2026-08',
        contrattoId: 'c-padova12',
        mese: '2026-08',
        segnalazione: { tipo: 'non_pagato', il: '2026-08-04' },
        apertaIl: '2026-08-06',
        rispostaEntro: '2026-08-11',
        stato: 'risolta_favore_inquilino',
        chiusaIl: '2026-08-10',
        esito: 'Il canone risulta accreditato il 2 agosto. La segnalazione è stata rettificata e il mese conta come pagato il 2.',
        motivo: 'L’inquilina dichiara di aver pagato il 1° agosto.',
        documenti: [
            { id: 'dc-4', nome: 'Ricevuta bonifico 01-08-2026.pdf', caricatoDa: 'conduttore', il: '2026-08-06' },
        ],
        messaggi: [
            { id: 1, autore: 'sistema', testo: 'Giulia Ferri ha contestato la segnalazione di mancato pagamento di agosto.', il: '2026-08-06 08:30' },
            { id: 2, autore: 'conduttore', testo: 'Ho pagato il 1° agosto come ogni mese, allego la ricevuta.', il: '2026-08-06 08:31' },
            { id: 3, autore: 'cria', testo: 'Verifichiamo l’accredito con il proprietario.', il: '2026-08-07 09:45' },
            { id: 4, autore: 'locatore', testo: 'Confermiamo, l’accredito è del 2 agosto: la segnalazione era un nostro errore.', il: '2026-08-09 16:10' },
            { id: 5, autore: 'cria', testo: 'Contestazione accolta: la segnalazione è rettificata.', il: '2026-08-10 10:00' },
        ],
    },
];

// ─── Documenti ────────────────────────────────────────────────────────────────
export const DOCUMENTI = [
    { id: 'doc-m1', personaId: 'mario', contrattoId: null, nome: 'Carta d’identità.pdf', tipo: 'identita', caricatoIl: '2025-09-20', stato: 'verificato' },
    { id: 'doc-m2', personaId: 'mario', contrattoId: 'c-verdi3', nome: 'Contratto di locazione registrato.pdf', tipo: 'contratto', caricatoIl: '2025-09-22', stato: 'verificato' },
    { id: 'doc-m3', personaId: 'mario', contrattoId: 'c-verdi3', nome: 'Ricevuta di registrazione.pdf', tipo: 'registrazione', caricatoIl: '2025-10-09', stato: 'verificato' },
    { id: 'doc-m4', personaId: 'mario', contrattoId: 'c-verdi3', nome: 'Visura catastale.pdf', tipo: 'visura', caricatoIl: '2025-09-22', stato: 'verificato' },
    { id: 'doc-m5', personaId: 'mario', contrattoId: 'c-verdi5', nome: 'Contratto di locazione registrato.pdf', tipo: 'contratto', caricatoIl: '2025-10-25', stato: 'verificato' },
    { id: 'doc-m6', personaId: 'mario', contrattoId: 'c-verdi5', nome: 'Visura catastale.pdf', tipo: 'visura', caricatoIl: '2025-10-25', stato: 'da_integrare' },
    { id: 'doc-v1', personaId: 'verdi', contrattoId: null, nome: 'Visura camerale.pdf', tipo: 'visura_camerale', caricatoIl: '2025-02-10', stato: 'verificato' },
    { id: 'doc-v2', personaId: 'verdi', contrattoId: 'c-padova12', nome: 'Contratto di locazione registrato.pdf', tipo: 'contratto', caricatoIl: '2025-03-08', stato: 'verificato' },
    { id: 'doc-v3', personaId: 'verdi', contrattoId: 'c-monza140', nome: 'Contratto di locazione registrato.pdf', tipo: 'contratto', caricatoIl: '2024-01-10', stato: 'verificato' },
    { id: 'doc-v4', personaId: 'verdi', contrattoId: 'c-tortona27', nome: 'Contratto di locazione registrato.pdf', tipo: 'contratto', caricatoIl: '2025-06-07', stato: 'in_attesa' },
    { id: 'doc-g1', personaId: 'giulia', contrattoId: null, nome: 'Carta d’identità.pdf', tipo: 'identita', caricatoIl: '2025-03-02', stato: 'verificato' },
    { id: 'doc-g2', personaId: 'giulia', contrattoId: 'c-padova12', nome: 'Contratto di locazione registrato.pdf', tipo: 'contratto', caricatoIl: '2025-03-08', stato: 'verificato' },
    { id: 'doc-r1', personaId: 'mario', contrattoId: 'c-italia88', nome: 'Contratto di locazione registrato.pdf', tipo: 'contratto', caricatoIl: '2025-09-30', stato: 'verificato' },
];

// ─── Letture ──────────────────────────────────────────────────────────────────
export const trovaContratto = (id) => CONTRATTI.find(c => c.id === id) || null;

export const contrattiComeProprietario = (personaId) =>
    CONTRATTI.filter(c => personaId && c.locatore.personaId === personaId);

export const contrattiComeInquilino = (personaId) =>
    CONTRATTI.filter(c => personaId && c.conduttore.personaId === personaId);

export const contestazioniDeiContratti = (contratti) => {
    const ids = new Set(contratti.map(c => c.id));
    return CONTESTAZIONI
        .filter(k => ids.has(k.contrattoId))
        .sort((a, b) => b.apertaIl.localeCompare(a.apertaIl));
};

export const documentiDi = (personaId, contratti) => {
    const ids = new Set(contratti.map(c => c.id));
    return DOCUMENTI.filter(d => d.personaId === personaId && (d.contrattoId === null || ids.has(d.contrattoId)));
};

export const indirizzoCompleto = (c) => `${c.immobile.indirizzo}, ${c.immobile.citta}`;
