// ═════════════════════════════════════════════════════════════════════════════
// SCADENZE E PROROGHE — SOLO PER I MOCKUP (lotto 5, O-18 e O-19)
// Il motore delle scadenze del documento di stato (§13.6): ogni fase ha una
// decorrenza, un termine e una conseguenza. I termini interni si contano in
// giorni lavorativi, quelli verso il cliente in giorni solari: un termine
// contrattuale espresso in giorni lavorativi si contesta.
//
// Le fasi non si scrivono a mano: lib/scadenzeDemo.js le ricava dai dati
// condivisi (pratiche, mesi dei contratti, contestazioni, verifiche,
// autocandidature) e dalle code degli altri schermi del lotto: istruttoria
// (O-07), contestazioni (O-10), garanzia (O-14 → O-17). Le durate che quelle
// code già fissano si leggono da lì, così un termine non cambia da una pagina
// all'altra. Qui stanno le regole — cosa succede alla scadenza, a chi sale, se
// si proroga — e i dati che esistono solo qui: le richieste di accesso ai dati
// e le proroghe già concesse. Ogni record punta a un id vero dei dati condivisi.
//
// Fase 4: tabelle sla_fasi, proroghe e assegnazioni (§14.3). Le causali stanno
// in tabella e non in un enum, perché l'azienda deve poterle cambiare (§16.3).
// ═════════════════════════════════════════════════════════════════════════════

import { PARAMETRI, PRODOTTI } from '@/data/catalogo';
import { GIORNI_LAVORATIVI_REFERENZA } from '@/data/autocandidature';
import { REGOLE_ISTRUTTORIA } from '@/data/istruttoria';
import { REGOLE_CICLO } from '@/data/incassi';
import { TERMINI as TERMINI_GARANZIA } from '@/data/garanzia';
import { fmtData } from '@/lib/formato';

// Gli articoli davanti alle date: «il 16/09/2026», ma «l’11/09/2026» e «l’08/09/2026».
const conVocale = (iso) => ['08', '11'].includes(String(iso).slice(8, 10));
export const ilData = (iso) => `${conVocale(iso) ? 'l’' : 'il '}${fmtData(iso)}`;
export const dalData = (iso) => `${conVocale(iso) ? 'dall’' : 'dal '}${fmtData(iso)}`;
export const delData = (iso) => `${conVocale(iso) ? 'dell’' : 'del '}${fmtData(iso)}`;
export const alData = (iso) => `${conVocale(iso) ? 'all’' : 'al '}${fmtData(iso)}`;

// I tre calendari del documento, più i termini di CRIA Verifica e
// dell'autocandidatura e quelli del GDPR.
export const CALENDARI = {
    attivazione: { etichetta: 'Attivazione', descrizione: 'Dalla pratica completa alla delibera' },
    ciclo_mensile: { etichetta: 'Ciclo mensile', descrizione: 'Segnalazione, contestazione e rettifica' },
    morosita: { etichetta: 'Morosità', descrizione: 'Dal mese chiuso senza incasso al piano di rientro' },
    verifiche: { etichetta: 'Verifiche e certificati', descrizione: 'CRIA Verifica e autocandidatura' },
    dati_personali: { etichetta: 'Dati personali', descrizione: 'Gli obblighi del GDPR' },
};

export const ORDINE_CALENDARI = ['attivazione', 'ciclo_mensile', 'morosita', 'verifiche', 'dati_personali'];

// Da dove viene la durata di una fase. «Ipotesi» vuol dire che nessun documento
// la fissa: è una proposta da confermare con il titolare.
export const FONTE_DURATA = {
    documento: 'dal documento',
    contratto: 'dal contratto',
    legge: 'per legge',
    ipotesi: 'ipotesi da confermare',
};

// ─── La lista chiusa delle proroghe (§13.6) ───────────────────────────────────
// Ogni causale ha una durata fissa e un tetto al numero di volte, e nessun testo
// libero la giustifica. Esaurito il tetto, o per un motivo che qui non c'è,
// proroga solo un responsabile, per iscritto: la proroga compare nel cruscotto
// del mese con il suo nome. Le prime due sono gli esempi del documento, le
// altre due sono proposte. I giorni si contano nel calendario della fase.
export const CAUSALI_PROROGA = {
    documenti_cliente: {
        etichetta: 'Documenti attesi dal cliente',
        giorni: 10,
        tetto: 2,
        fonte: 'documento',
        spiegazione: 'Il cliente deve integrare un documento',
    },
    contenzioso: {
        etichetta: 'Contenzioso aperto',
        sospende: true,
        tetto: 1,
        fonte: 'documento',
        spiegazione: 'Il termine si ferma finché il contenzioso è aperto; i giorni di sospensione si aggiungono quando riparte',
    },
    documenti_esteri: {
        etichetta: 'Documenti esteri da tradurre',
        giorni: 5,
        tetto: 1,
        fonte: 'proposta',
        spiegazione: 'Serve una traduzione prima di decidere',
    },
    risposta_terzi: {
        etichetta: 'Risposta attesa da un terzo',
        giorni: 5,
        tetto: 1,
        fonte: 'proposta',
        spiegazione: 'Deve rispondere una banca, l’Agenzia delle Entrate o un precedente proprietario',
    },
};

export const ORDINE_CAUSALI = ['documenti_cliente', 'contenzioso', 'documenti_esteri', 'risposta_terzi'];

// ─── Le fasi ──────────────────────────────────────────────────────────────────
//   chi          chi deve agire: 'cria' oppure il cliente (proprietario, inquilino)
//   conteggio    'lavorativi' per i termini interni, 'solari' verso il cliente
//   soglia       quanti giorni prima del termine la fase è «vicina»: da lì, se è
//                di CRIA, sale al responsabile di chi la segue
//   automatica   alla scadenza la conseguenza si applica da sola
//   proroga      'lista' (le causali ammesse) · 'solo_fuori_lista' · 'mai'
//   dpo          la risalita va anche al DPO
export const FASI = {
    istruttoria: {
        etichetta: 'Istruttoria e delibera',
        calendario: 'attivazione',
        chi: 'cria',
        funzione: 'istruttoria',
        conteggio: 'lavorativi',
        durata: REGOLE_ISTRUTTORIA.giorniLavorativiDelibera,
        fonteDurata: 'ipotesi',
        decorrenza: 'Dall’ultimo documento del candidato',
        conseguenza: 'Il proprietario aspetta la delibera per pagare e firmare: la fase sale al responsabile',
        soglia: 1,
        proroga: 'lista',
        causali: ['documenti_cliente', 'contenzioso', 'documenti_esteri', 'risposta_terzi'],
        percorso: '/dashboard/admin/onboarding',
    },
    segnalazione_mese: {
        etichetta: 'Segnalazione del mese',
        calendario: 'ciclo_mensile',
        chi: 'proprietario',
        funzione: 'incassi',
        conteggio: 'solari',
        fonteDurata: 'contratto',
        decorrenza: 'Dalla scadenza del canone',
        // La conseguenza dipende dalla garanzia: la scrive lib/scadenzeDemo.js
        // con i parametri congelati sul contratto.
        soglia: 2,
        automatica: true,
        proroga: 'mai',
        senzaProroga: 'È un termine del contratto, congelato alla firma: non si proroga',
        percorso: '/dashboard/admin/segnalazioni',
    },
    finestra_contestazione: {
        etichetta: 'Finestra di contestazione',
        calendario: 'ciclo_mensile',
        chi: 'inquilino',
        funzione: 'assistenza',
        conteggio: 'solari',
        durata: PARAMETRI.giorniContestazione,
        fonteDurata: 'contratto',
        decorrenza: 'Dalla segnalazione di mancato pagamento',
        conseguenza: 'Chiusa la finestra la segnalazione non si contesta più, e il mese conta nel semaforo',
        soglia: 2,
        automatica: true,
        proroga: 'mai',
        senzaProroga: 'È un termine del contratto: non si proroga',
        percorso: '/dashboard/admin/contestazioni',
    },
    risposta_contestazione: {
        etichetta: 'Risposta alla contestazione',
        calendario: 'ciclo_mensile',
        chi: 'cria',
        funzione: 'assistenza',
        conteggio: 'solari',
        durata: PARAMETRI.giorniRispostaContestazione,
        fonteDurata: 'contratto',
        decorrenza: 'Dall’apertura della contestazione',
        conseguenza: 'Le due parti aspettano la decisione e il mese resta fuori dal semaforo: la fase sale al responsabile',
        soglia: 1,
        proroga: 'lista',
        causali: ['documenti_cliente'],
        percorso: '/dashboard/admin/contestazioni',
    },
    rettifica: {
        etichetta: 'Seconda firma della rettifica',
        calendario: 'ciclo_mensile',
        chi: 'cria',
        funzione: 'assistenza',
        conteggio: 'lavorativi',
        durata: REGOLE_CICLO.giorniLavorativiSecondaFirma,
        fonteDurata: 'documento',
        decorrenza: 'Dalla prima firma',
        conseguenza: 'Finché manca la seconda firma il mese non cambia e il semaforo mostra ancora il dato contestato: la fase sale al responsabile',
        soglia: 0,
        proroga: 'solo_fuori_lista',
        percorso: '/dashboard/admin/contestazioni',
    },
    rata_piano: {
        etichetta: 'Rata del piano di rientro',
        calendario: 'morosita',
        chi: 'inquilino',
        funzione: 'gestore_pratica',
        conteggio: 'solari',
        fonteDurata: 'contratto',
        decorrenza: 'Dalla rata precedente',
        conseguenza: 'Se la rata non arriva il gestore ricontatta l’inquilino; se il piano salta, passaggio al legale',
        soglia: 2,
        proroga: 'mai',
        senzaProroga: 'Le rate le cambia solo un nuovo piano, approvato dalla responsabile legale',
        percorso: '/dashboard/admin/morosita',
    },
    esito_verifica: {
        etichetta: 'Esito di CRIA Verifica',
        calendario: 'verifiche',
        chi: 'cria',
        funzione: 'istruttoria',
        conteggio: 'solari',
        ore: PRODOTTI.P3.oreEsito,
        fonteDurata: 'documento',
        decorrenza: 'Dalla richiesta pagata',
        conseguenza: 'È l’impegno preso con il cliente: la fase sale al responsabile',
        soglia: 0,
        proroga: 'solo_fuori_lista',
        percorso: null,
    },
    referenza_p7: {
        etichetta: 'Referenza del precedente proprietario',
        calendario: 'verifiche',
        chi: 'cria',
        funzione: 'istruttoria',
        conteggio: 'lavorativi',
        durata: GIORNI_LAVORATIVI_REFERENZA,
        fonteDurata: 'documento',
        decorrenza: 'Dalla richiesta dell’inquilino',
        conseguenza: 'Dopo tre tentativi su canali diversi senza risposta la referenza è «richiesta, non riscontrata»: il certificato esce e lo dichiara',
        soglia: 2,
        automatica: true,
        proroga: 'mai',
        senzaProroga: 'La regola è fissa: tre tentativi in dieci giorni lavorativi, poi il percorso va avanti',
        percorso: null,
    },
    istruttoria_p7: {
        etichetta: 'Istruttoria dell’autocandidatura',
        calendario: 'verifiche',
        chi: 'cria',
        funzione: 'istruttoria',
        conteggio: 'lavorativi',
        durata: REGOLE_ISTRUTTORIA.giorniLavorativiDelibera,
        fonteDurata: 'ipotesi',
        decorrenza: 'Dall’invio delle prove a CRIA',
        conseguenza: 'L’inquilino aspetta il certificato: la fase sale al responsabile',
        soglia: 1,
        proroga: 'lista',
        causali: ['documenti_cliente', 'documenti_esteri', 'risposta_terzi', 'contenzioso'],
        percorso: null,
    },
    cancellazione_documenti: {
        etichetta: 'Cancellazione dei documenti del candidato',
        calendario: 'dati_personali',
        chi: 'cria',
        funzione: 'istruttoria',
        conteggio: 'solari',
        durata: REGOLE_ISTRUTTORIA.giorniConservazioneSensibili,
        fonteDurata: 'documento',
        decorrenza: 'Dalla delibera',
        conseguenza: 'Movimenti del canone e redditi del candidato si cancellano, restano gli indicatori. Oltre il termine CRIA terrebbe un dato che ha promesso di non tenere',
        soglia: 3,
        proroga: 'lista',
        causali: ['contenzioso'],
        dpo: true,
        percorso: '/dashboard/admin/onboarding',
    },
    accesso_dati: {
        etichetta: 'Richiesta di accesso ai dati',
        calendario: 'dati_personali',
        chi: 'cria',
        funzione: 'assistenza',
        conteggio: 'solari',
        durata: 30,
        fonteDurata: 'legge',
        decorrenza: 'Dall’arrivo della richiesta',
        conseguenza: 'È un obbligo di legge, con sanzione: a sette giorni dal termine la fase sale da sola al responsabile e al DPO',
        soglia: 7,
        proroga: 'mai',
        senzaProroga: 'Nessuna proroga, nemmeno fuori lista: è un obbligo di legge (art. 12 GDPR)',
        dpo: true,
        percorso: null,
    },
};

// ─── Le fasi della garanzia ───────────────────────────────────────────────────
// Le calcola la pagina della garanzia (lib/garanziaDemo.js) con i suoi termini
// (data/garanzia.js): qui si aggiunge cosa succede alla scadenza e se si proroga.
const DALLA_GARANZIA = {
    primo_contatto: {
        conseguenza: 'Un ritardo affrontato presto si recupera con una telefonata: la fase sale alla responsabile legale',
        causali: ['contenzioso'],
        percorso: '/dashboard/admin/morosita',
    },
    proposta_piano: {
        conseguenza: 'L’inquilino ha chiesto di pagare a rate e aspetta: la fase sale alla responsabile legale',
        causali: ['documenti_cliente', 'contenzioso'],
        percorso: '/dashboard/admin/morosita',
    },
    decisione_piano: {
        conseguenza: 'Il piano resta fermo finché non si decide: la fase sale alla direzione',
        proroga: 'solo_fuori_lista',
        percorso: '/dashboard/admin/morosita',
    },
    decisione_legale: {
        conseguenza: 'Il recupero resta fermo finché non si decide: la fase sale alla direzione',
        proroga: 'solo_fuori_lista',
        percorso: '/dashboard/admin/morosita',
    },
    disposizione_indennizzo: {
        conseguenza: 'Il proprietario aspetta l’indennizzo: la fase sale alla responsabile amministrativa',
        causali: ['documenti_cliente', 'contenzioso'],
        percorso: '/dashboard/admin/indennizzi',
    },
    autorizzazione: {
        conseguenza: 'Il bonifico resta fermo finché una persona diversa da chi l’ha disposto non lo autorizza: la fase sale alla direzione',
        proroga: 'solo_fuori_lista',
        percorso: '/dashboard/admin/bonifici',
    },
    pagamento_indennizzo: {
        conseguenza: 'È il termine verso il proprietario: la fase sale alla responsabile amministrativa',
        proroga: 'solo_fuori_lista',
        percorso: '/dashboard/admin/bonifici',
    },
};

const maiuscola = (t) => t.charAt(0).toUpperCase() + t.slice(1);

Object.entries(DALLA_GARANZIA).forEach(([chiave, extra]) => {
    const t = TERMINI_GARANZIA[chiave];
    if (!t) return;
    FASI[chiave] = {
        etichetta: t.etichetta,
        calendario: 'morosita',
        chi: 'cria',
        funzione: t.funzione,
        conteggio: t.calendario,
        durata: t.giorni,
        fonteDurata: 'ipotesi',
        decorrenza: maiuscola(t.decorrenza),
        soglia: 1,
        proroga: 'lista',
        ...extra,
    };
});

// ─── Richieste di accesso ai dati (art. 12 e 15 GDPR) ─────────────────────────
// Arrivano anche da chi non ha un account: qui da inquilini e da un ex inquilino
// dei contratti demo, che hanno scritto a CRIA per email o per posta. La
// richiesta di chi ha un account nasce da «I miei dati» (F-15). La schermata
// dedicata è G-09, nel lotto 6.
export const RICHIESTE_DATI = [
    {
        id: 'rd-2026-014',
        codice: 'RD-2026-014',
        interessato: { nome: 'Chiara Lombardi', ruolo: 'inquilina', contrattoId: 'c-verdi5' },
        canale: 'email',
        ricevutaIl: '2026-08-21',
        evasaIl: null,
    },
    {
        id: 'rd-2026-015',
        codice: 'RD-2026-015',
        interessato: { nome: 'Davide Colombo', ruolo: 'inquilino', contrattoId: 'c-verdi3' },
        canale: 'email',
        ricevutaIl: '2026-09-09',
        evasaIl: null,
    },
    {
        id: 'rd-2026-011',
        codice: 'RD-2026-011',
        interessato: { nome: 'Andrea Costa', ruolo: 'ex inquilino', contrattoId: 'c-padova12' },
        canale: 'posta',
        ricevutaIl: '2026-06-15',
        evasaIl: '2026-07-03',
    },
];

export const CANALE_RICHIESTA = { email: 'per email', posta: 'per posta', area: 'dall’area personale' };

// ─── Proroghe già concesse ─────────────────────────────────────────────────
// Una fuori lista, per mostrare come compare nel cruscotto del mese: l'ha
// concessa il responsabile operativo, per iscritto, quando l'istruttoria di Via
// Savona 22 è salita a lui. Con la proroga la delibera del 12 settembre sta nel
// termine; quella di Via Bergamo 8, senza proroga, è arrivata un giorno dopo.
export const PROROGHE = [
    {
        id: 'prg-savona22-1',
        faseId: 'istruttoria:pr-savona22',
        tipoFase: 'istruttoria',
        causale: null,
        fuoriLista: true,
        giorni: 5,
        concessaDa: 'luca',
        concessaIl: '2026-09-07',
        motivazione: 'Due pratiche complete in coda alla stessa addetta nella stessa settimana: nessuna causale in lista copre il carico. Concedo cinque giorni lavorativi.',
    },
];
