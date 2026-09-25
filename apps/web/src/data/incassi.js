// ═════════════════════════════════════════════════════════════════════════════
// CICLO MENSILE — SOLO PER I MOCKUP (lotto 5, O-09 → O-12)
// Quello che sa solo il back office del ciclo mensile: come sono state
// istruite le contestazioni, e i movimenti del conto di incasso di CRIA.
// Tutto punta ai contratti, ai mesi e alle contestazioni di datiDemo.js: i
// movimenti dei contratti CRIA Completo si ricavano dai mesi pagati, così il
// conto e il semaforo raccontano la stessa storia.
//
// Due estratti conto diversi, da non confondere (§13.7-4): questo è quello di
// CRIA, documentazione contabile che si conserva dieci anni. Quello del
// candidato sta nell'istruttoria e si cancella dopo la delibera.
//
// Fase 4: tabelle movimenti (con stato_abbinamento), contestazioni_istruttoria
// e firme_rettifica.
// ═════════════════════════════════════════════════════════════════════════════

import { CONTRATTI } from '@/data/datiDemo';
import { PRODOTTI } from '@/data/catalogo';

export const REGOLE_CICLO = {
    // La rettifica accolta va firmata due volte entro questo termine dalla
    // prima firma (documento di stato §13.8: «rettifica accolta 2 g»). Interno.
    giorniLavorativiSecondaFirma: 2,
    // Un movimento non resta in coda più di così senza un esito. Interno.
    giorniLavorativiAbbinamento: 2,
};

// ─── Contestazioni: l'istruttoria ─────────────────────────────────────────────
// Le parti vedono messaggi e prove (datiDemo.js). Qui c'è quello che vede solo
// CRIA: chi la segue, le note interne, la decisione, le due firme della rettifica.
export const CONTESTAZIONI_INTERNE = {
    'con-verdi5-2026-09': {
        assegnataA: 'nicola',
        presa: null,
        note: [],
    },
    'con-verdi5-2026-05': {
        assegnataA: 'nicola',
        presa: { da: 'nicola', il: '2026-05-11' },
        richieste: [{ a: 'locatore', testo: 'I movimenti del conto di maggio, con la data di accredito.', da: 'nicola', il: '2026-05-11' }],
        note: [{ da: 'nicola', il: '2026-05-12', testo: 'Lo screenshot dell’inquilina non mostra la data di esecuzione: decide l’estratto del proprietario.' }],
        decisione: {
            tipo: 'respinta', da: 'nicola', il: '2026-05-15', documento: 'dc-3',
            motivazione: 'Il bonifico è stato disposto il 13 e accreditato il 14: la segnalazione del 4 era corretta.',
        },
    },
    'con-padova12-2026-08': {
        assegnataA: 'nicola',
        presa: { da: 'nicola', il: '2026-08-07' },
        richieste: [{ a: 'locatore', testo: 'La conferma dell’accredito di agosto, con la data.', da: 'nicola', il: '2026-08-07' }],
        note: [],
        rettifica: {
            documento: 'dc-4', data: '2026-08-02',
            motivazione: 'La ricevuta del bonifico e la conferma del proprietario collocano l’accredito al 2 agosto.',
            primaFirma: { da: 'nicola', il: '2026-08-10' },
            secondaFirma: { da: 'luca', il: '2026-08-10' },
        },
    },
};

// Solo un documento della banca regge una rettifica: uno screenshot no.
export const DOCUMENTI_BANCARI = ['dc-1', 'dc-3', 'dc-4'];

// ─── Il conto di incasso di CRIA ──────────────────────────────────────────────
// Senza collegamento con la banca i movimenti si inseriscono a mano (§16.1). Il
// sistema cerca nella causale il codice univoco del contratto e propone
// l'abbinamento; chi lavora gli incassi conferma.
const MESI = ['GENNAIO', 'FEBBRAIO', 'MARZO', 'APRILE', 'MAGGIO', 'GIUGNO', 'LUGLIO', 'AGOSTO', 'SETTEMBRE', 'OTTOBRE', 'NOVEMBRE', 'DICEMBRE'];
export const nomeMeseCausale = (mese) => MESI[Number(mese.slice(5)) - 1];

// Come la banca scrive l'ordinante: cognome e nome, in maiuscolo.
export const ordinanteDi = (nome) => nome.split(' ').reverse().join(' ').toUpperCase();

// I bonifici puliti, uno per mese pagato dei contratti dove incassa CRIA.
const puliti = CONTRATTI
    .filter(c => PRODOTTI[c.prodotto]?.incassa === 'cria')
    .flatMap(c => c.mesi
        .filter(m => m.stato === 'pagato' && m.segnalazione?.fonte === 'cria')
        .map(m => ({
            id: `mov-${c.id}-${m.mese}`,
            data: m.pagatoIl,
            importo: c.canone,
            ordinante: ordinanteDi(c.conduttore.nome),
            causale: `${c.codiceUnivoco} CANONE ${nomeMeseCausale(m.mese)} ${m.mese.slice(0, 4)}`,
            registrato: { da: 'irene', il: m.pagatoIl },
            esito: { stato: 'abbinato_automatico', tipo: 'canone', contrattoId: c.id, mese: m.mese, da: 'irene', il: m.pagatoIl },
        })));

// Casi sporchi già risolti: stessi giorni e stessi importi dei mesi pagati.
const CORREZIONI = {
    'mov-c-verdi3-2026-06': {
        causale: 'AFFITTO GIUGNO VIA VERDI 3',
        esito: { stato: 'abbinato_manuale', nota: 'Causale senza codice: ordinante e importo coincidono con Via Verdi 3.' },
    },
    'mov-c-monza140-2026-02': {
        causale: 'CRIA-2PZR-6YIF CANONE FEBBRAIO',
        esito: { stato: 'abbinato_manuale', nota: 'Codice con un carattere sbagliato (6YIF invece di 6YJF): ordinante e importo coincidono.' },
    },
    'mov-c-verdi3-2025-12': {
        importo: 1000,
        causale: 'CRIA-7Q4K-2M9P DICEMBRE',
        esito: { stato: 'abbinato_manuale', nota: 'Importo diverso dal canone: i 100 € mancanti sono arrivati lo stesso giorno con un secondo bonifico.' },
    },
};

const storici = puliti.map(m => (CORREZIONI[m.id]
    ? { ...m, ...CORREZIONI[m.id], esito: { ...m.esito, ...CORREZIONI[m.id].esito } }
    : m));

export const MOVIMENTI_CONTO = [
    ...storici,
    {
        id: 'mov-c-verdi3-2025-12-b', data: '2025-12-03', importo: 100, ordinante: 'COLOMBO DAVIDE',
        causale: 'CRIA-7Q4K-2M9P INTEGRAZIONE DICEMBRE',
        registrato: { da: 'irene', il: '2025-12-03' },
        esito: { stato: 'abbinato_manuale', tipo: 'canone', contrattoId: 'c-verdi3', mese: '2025-12', da: 'irene', il: '2025-12-03', nota: 'Integrazione del canone di dicembre: con il primo bonifico fa 1.100 €.' },
    },
    // La prima rata del piano di rientro di Via Tortona 27: il credito è passato
    // a CRIA con l'indennizzo, quindi le rate arrivano sul conto di CRIA.
    {
        id: 'mov-rata-tortona27-1', data: '2026-08-19', importo: 350, ordinante: 'GALLI MARTINA',
        causale: 'CRIA-8MCU-3NQE RATA 1 PIANO DI RIENTRO',
        registrato: { da: 'irene', il: '2026-08-19' },
        esito: { stato: 'abbinato_automatico', tipo: 'rata', contrattoId: 'c-tortona27', morositaId: 'mor-tortona27-2026-07', rata: 1, da: 'irene', il: '2026-08-19' },
    },
    // In coda oggi, senza esito.
    { id: 'mov-2026-09-11-colombo', data: '2026-09-11', importo: 1100, ordinante: 'COLOMBO DAVIDE', causale: 'CRIA-7Q4K-2M9P CANONE SETTEMBRE', registrato: { da: 'irene', il: '2026-09-11' }, esito: null },
    { id: 'mov-2026-09-14-rinaldi', data: '2026-09-14', importo: 650, ordinante: 'RINALDI GIANLUCA', causale: 'SALDO FATT. 2026/118', registrato: { da: 'irene', il: '2026-09-14' }, esito: null },
    { id: 'mov-2026-09-15-ricci', data: '2026-09-15', importo: 1200, ordinante: 'RICCI STEFANO', causale: 'AFFITTO OTTOBRE VIALE MONZA', registrato: { da: 'irene', il: '2026-09-15' }, esito: null },
];

// Perché un movimento resta in coda. Si scrive accanto al movimento.
export const MOTIVI_CODA = {
    pagatore_sconosciuto: 'Pagatore sconosciuto: nessun codice e nessun inquilino con questo nome',
    causale_senza_codice: 'Causale senza il codice del contratto',
    codice_simile: 'Codice simile a quello di un contratto, ma non uguale',
    importo_diverso: 'Importo diverso da quello atteso',
    nessun_mese_atteso: 'Nessun canone atteso per il mese della causale',
    anticipo: 'Canone di un mese non ancora scaduto',
    ordinante_diverso: 'Chi paga non è l’inquilino del contratto',
    contratto_non_cria: 'Il canone di questo contratto lo incassa il proprietario',
};

// Un movimento che non si abbina a niente si restituisce: lo fa la tesoreria.
export const MOTIVI_NON_ABBINABILE = {
    estraneo: 'Non riguarda un contratto: da restituire all’ordinante',
    doppio: 'Pagamento doppio: da restituire',
    al_proprietario: 'Canone da pagare al proprietario, non a CRIA: da restituire',
    altro: 'Altro, spiegato nella nota',
};
