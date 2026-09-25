// ═════════════════════════════════════════════════════════════════════════════
// ISTRUTTORIA — SOLO PER I MOCKUP (lotto 5, O-07 e O-08)
// Quello che sa solo il back office: come è fatta la squadra, chi ha acquisito
// quale cliente, cosa il sistema ha estratto dai documenti dei candidati e il
// registro delle delibere già prese. Ogni record punta a pratiche, contratti,
// autocandidature e verifiche vere dei dati condivisi.
//
// Le soglie qui sotto sono proposte per far girare i mockup, non regole del
// documento di stato: in piattaforma sono parametri del responsabile prodotto.
//
// Fase 4: tabelle assegnazioni, verifiche_documenti, delibere e indicatori
// (documento di stato §13.5, §13.6, §14.3, §14.5).
// ═════════════════════════════════════════════════════════════════════════════

import { PRODOTTI } from '@/data/catalogo';

export const REGOLE_ISTRUTTORIA = {
    // Termine interno: dai documenti completi alla delibera. Interno, quindi
    // in giorni lavorativi.
    giorniLavorativiDelibera: 3,
    // Movimenti del canone e documenti di reddito si cancellano dopo la
    // delibera: termine verso il cliente, in giorni solari.
    giorniConservazioneSensibili: 30,
    // Oltre questa quota del reddito netto la proposta scende di un gradino.
    sogliaCanoneSuReddito: 40,
    // «La franchigia iniziale può essere più lunga: è un parametro» (§15.2).
    mesiFranchigiaAggiuntivi: 2,
    // Il motivo del dissenso è obbligatorio e deve dire qualcosa.
    caratteriMinimiMotivo: 20,
};

// ─── La squadra ───────────────────────────────────────────────────────────────
// Le lingue stanno sull'operatore (data/operatori.js). Qui le zone che segue,
// se prende le pratiche complesse e le assenze già note.
export const SQUADRA_ISTRUTTORIA = {
    valeria: {
        zone: ['MI', 'MB', 'LO'],
        complesse: true,
        assenze: [{ dal: '2026-09-28', al: '2026-10-02', motivo: 'Ferie' }],
    },
    ettore: {
        zone: ['MI', 'VR', 'BS', 'BG'],
        complesse: false,
        assenze: [],
    },
};

export const PROVINCE = {
    MI: 'Milano', MB: 'Monza e Brianza', LO: 'Lodi', VR: 'Verona', BS: 'Brescia',
    BG: 'Bergamo', TO: 'Torino', RM: 'Roma', NA: 'Napoli', BO: 'Bologna',
};

// Per le autocandidature l'immobile è scritto per esteso («Via Mazzini 3, Verona»).
export const PROVINCIA_DELLA_CITTA = {
    milano: 'MI', monza: 'MB', lodi: 'LO', verona: 'VR', brescia: 'BS',
    bergamo: 'BG', torino: 'TO', roma: 'RM', napoli: 'NA', bologna: 'BO',
};

// Le lingue che un cliente può dichiarare come preferite. Si dichiarano, non
// si deducono: mai da nome, cittadinanza o documento (§13.6).
export const LINGUE = ['italiano', 'inglese', 'spagnolo', 'francese'];

// ─── Chi ha acquisito il cliente ──────────────────────────────────────────────
// Incompatibilità della matrice (§13.4): chi ha acquisito un cliente non ne
// delibera l'istruttoria. Segue la persona, non la funzione di oggi: Ettore
// Marini ha portato Immobiliare Verdi quando lavorava nella rete commerciale.
export const ACQUISIZIONI = {
    verdi: { operatoreId: 'ettore', nota: 'Portata da Ettore Marini quando lavorava nella rete commerciale, fino a marzo 2026' },
    mario: { operatoreId: null, nota: 'Portato dalla rete commerciale, con il codice di Sara Esposito' },
};

// ─── Cosa il sistema ha estratto dai documenti ────────────────────────────────
// Dai movimenti del canone si estraggono gli indicatori prima che il documento
// si cancelli: sono quelli che restano (§14.5). Lo storico CRIA c'è quando il
// candidato è già nel database. Le pratiche nate nel browser hanno indicatori
// generati dal loro identificativo (lib/istruttoriaDemo.js).
export const INDICATORI = {
    // Luca Bianchi è nel database: lo stesso esito che CRIA Verifica ha dato a Elena Greco.
    'pr-solferino14': {
        storicoCria: { semaforo: 'verde', giornoMedio: 3, mesi: 12 },
        movimenti: { mensilita: 12, suMesi: 12, giornoMedio: 3, canonePrecedente: 1250, importiCoerenti: true, dateContinue: true, bancaCoerente: true },
        reddito: { nettoMensile: 3150, fonte: 'Ultime tre buste paga' },
    },
    'pr-savona22': {
        storicoCria: { semaforo: 'verde', giornoMedio: 4, mesi: 12 },
        movimenti: { mensilita: 12, suMesi: 12, giornoMedio: 4, canonePrecedente: 850, importiCoerenti: true, dateContinue: true, bancaCoerente: true },
        reddito: { nettoMensile: 2900, fonte: 'Dichiarazione dei redditi 2026' },
    },
    // Contratto esistente: i movimenti sono quelli del contratto in corso.
    'pr-bergamo8': {
        storicoCria: null,
        movimenti: { mensilita: 12, suMesi: 12, giornoMedio: 2, canonePrecedente: 1150, importiCoerenti: true, dateContinue: true, bancaCoerente: true },
        reddito: { nettoMensile: 3100, fonte: 'Ultime tre buste paga' },
    },
};

// ─── Esiti possibili ──────────────────────────────────────────────────────────
// Pratiche: la garanzia si concede, si concede con una franchigia più lunga,
// o non si concede. Con CRIA Segnalazione non c'è garanzia: si verificano i
// documenti. Autocandidature: il certificato si emette (il valore viene dalle
// prove) oppure non si accoglie, per una smentita documentata.
// «proposta» è come si legge quando è il sistema a proporlo.
export const ESITI = {
    approvata: { etichetta: 'Approvata', classe: 'bg-green-100 text-green-800', gradino: 0 },
    approvata_franchigia: { etichetta: 'Approvata con franchigia più lunga', classe: 'bg-amber-100 text-amber-800', gradino: 1 },
    respinta: { etichetta: 'Non approvata', classe: 'bg-red-100 text-red-800', gradino: 2 },
    emessa: { etichetta: 'Certificato emesso', proposta: 'Emettere il certificato', classe: 'bg-green-100 text-green-800' },
    rifiutata: { etichetta: 'Non accolta', proposta: 'Non accogliere', classe: 'bg-red-100 text-red-800' },
    pubblicata: { etichetta: 'Esito pubblicato', classe: 'bg-slate-100 text-slate-700' },
};

// Motivi di non conformità: lista chiusa, come le causali di proroga. Il
// rifiuto si conta: se metà dei documenti arriva non conforme, il problema
// sono le istruzioni (§14.5).
export const MOTIVI_NON_CONFORMITA = {
    non_filtrato: { etichetta: 'Non filtrato: è l’estratto conto completo', soloPer: ['movimenti_canone'] },
    illeggibile: { etichetta: 'Illeggibile o incompleto' },
    non_intestato: { etichetta: 'Non è intestato alla persona giusta' },
    scaduto: { etichetta: 'Scaduto', soloPer: ['identita'] },
    incoerente: { etichetta: 'Non torna con quanto dichiarato: importi, date o banca' },
    altro: { etichetta: 'Altro, spiegato nella nota' },
};

// Quanto resta ogni documento (§14.5): si conserva l'esito, non la fonte.
export const CONSERVAZIONE = {
    movimenti_canone: 'dopo_delibera',
    reddito: 'dopo_delibera',
    consenso: 'revoca',
    identita: 'contratto',
    codice_fiscale: 'contratto',
    visura: 'contratto',
    visura_camerale: 'contratto',
    contratto: 'contratto',
    delega: 'contratto',
    // Prove dell'autocandidatura: stanno con il certificato che hanno fondato.
    contratto_registrato: 'certificato',
    ricevute_canone: 'certificato',
    autodichiarazione: 'certificato',
    referenza_datore: 'certificato',
};

// Documenti che dicono troppo di una persona (§13.7-4, §14.5): li apre solo
// chi ha la pratica in coda, e solo finché ce l'ha.
export const DOCUMENTI_SENSIBILI = ['movimenti_canone', 'reddito'];

// ─── Registro delle delibere già prese ────────────────────────────────────────
// Le due pratiche già deliberate e le pratiche da cui sono nati i contratti in
// corso. Servono anche a misurare il tasso di dissenso: «se nessuno dissente
// mai, la delibera umana è finta» (§13.6, art. 22 GDPR).
// Le verifiche di CRIA Verifica non hanno una proposta da cui dissentire.
export const DELIBERE_STORICHE = [
    {
        id: 'del-pr-savona22', chiave: 'pratica:pr-savona22',
        proposta: 'approvata', esito: 'approvata', dissenso: false, motivo: null,
        fattori: ['Storico CRIA su 12 mesi: Regolare, giorno medio 4', 'Canone al 31% del reddito netto'],
        deliberataDa: 'valeria', deliberataIl: '2026-09-12',
    },
    {
        id: 'del-pr-bergamo8', chiave: 'pratica:pr-bergamo8',
        proposta: 'approvata', esito: 'approvata', dissenso: false, motivo: null,
        fattori: ['Pagamenti del contratto in corso: 12 su 12, giorno medio 2', 'Canone al 37% del reddito netto'],
        deliberataDa: 'valeria', deliberataIl: '2026-09-10',
    },
    {
        id: 'del-c-verdi5', chiave: 'contratto:c-verdi5',
        proposta: 'approvata', esito: 'approvata', dissenso: false, motivo: null,
        fattori: ['Pagamenti del contratto in corso: 12 su 12, giorno medio 5', 'Canone al 32% del reddito netto'],
        deliberataDa: 'ettore', deliberataIl: '2025-10-20',
    },
    {
        id: 'del-c-italia88', chiave: 'contratto:c-italia88',
        proposta: 'approvata_franchigia', esito: 'approvata', dissenso: true,
        motivo: 'Dodici canoni pagati entro il giorno 3, su un affitto di poco più basso e con lo stesso reddito: la quota sul reddito qui non aggiunge rischio.',
        fattori: ['Movimenti del canone: 12 su 12, giorno medio 2', 'Canone al 43% del reddito netto'],
        deliberataDa: 'ettore', deliberataIl: '2025-09-24',
    },
    {
        id: 'del-c-verdi3', chiave: 'contratto:c-verdi3',
        proposta: 'approvata', esito: 'approvata', dissenso: false, motivo: null,
        fattori: ['Movimenti del canone: 12 su 12, giorno medio 2', 'Canone al 34% del reddito netto'],
        deliberataDa: 'valeria', deliberataIl: '2025-09-18',
    },
    {
        id: 'del-c-tortona27', chiave: 'contratto:c-tortona27',
        proposta: 'approvata', esito: 'approvata', dissenso: false, motivo: null,
        fattori: ['Movimenti del canone: 12 su 12, giorno medio 5', 'Canone al 38% del reddito netto'],
        deliberataDa: 'valeria', deliberataIl: '2025-05-22',
    },
    {
        id: 'del-c-padova12', chiave: 'contratto:c-padova12',
        proposta: 'approvata', esito: 'approvata', dissenso: false, motivo: null,
        fattori: [`${PRODOTTI.P5.nome}, senza garanzia: documenti in ordine`],
        deliberataDa: 'valeria', deliberataIl: '2025-02-20',
    },
    {
        id: 'del-c-monza140', chiave: 'contratto:c-monza140',
        proposta: 'approvata', esito: 'approvata', dissenso: false, motivo: null,
        fattori: ['Movimenti del canone: 12 su 12, giorno medio 3', 'Canone al 33% del reddito netto'],
        deliberataDa: 'valeria', deliberataIl: '2023-12-14',
    },
    // CRIA Verifica: l'esito lo pubblica chi ha la richiesta in coda.
    { id: 'del-ver-elena-2026-08-20', chiave: 'verifica:ver-elena-2026-08-20', esito: 'pubblicata', deliberataDa: 'ettore', deliberataIl: '2026-08-21' },
    { id: 'del-ver-elena-2026-09-10', chiave: 'verifica:ver-elena-2026-09-10', esito: 'pubblicata', deliberataDa: 'valeria', deliberataIl: '2026-09-11' },
];
