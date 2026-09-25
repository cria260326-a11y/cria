// ═════════════════════════════════════════════════════════════════════════════
// ANAGRAFICA DI BACK OFFICE — SOLO PER I MOCKUP (lotto 5: O-02 … O-06)
// Quello che sa solo CRIA e che le aree di proprietario e inquilino non
// mostrano: da dove viene ogni anagrafica, i codici fiscali provvisori, chi ha
// letto gli estremi di registrazione e da quale ricevuta, lo storico di
// titolarità degli immobili. Ogni record punta agli id veri di datiDemo.js,
// personeDemo.js, pratiche.js e autocandidature.js: nomi, recapiti, contratti e
// mesi si leggono da lì, mai ricopiati qui.
//
// Tre livelli, come nel documento di stato §13.2: persona · contratto ·
// posizione. Qui ci sono le persone (e le società) e gli immobili; le
// posizioni si ricavano dai contratti.
//
// Fase 4: tabelle persone, immobili, immobili_titolarita, registrazioni.
// ═════════════════════════════════════════════════════════════════════════════

// ─── Soggetti ─────────────────────────────────────────────────────────────────
// Le chiavi sono gli id dei soggetti:
//   · l'id della persona demo, quando c'è (mario, giulia, verdi…);
//   · 'cand-<id pratica>' per i candidati inquilini invitati con una pratica;
//   · 'prec-<id referenza>' per i precedenti proprietari chiamati per una referenza;
//   · 'sog-…' per chi è parte di un contratto senza essere una persona demo,
//     e per le due anagrafiche nate solo in back office.
//
// origine: come l'anagrafica è entrata in CRIA
//   registrazione  si è registrato da solo
//   contratto      dal contratto caricato dal proprietario (contrattoId)
//   candidato      invitato con una pratica (praticaId)
//   referenza      indicato da un inquilino come precedente proprietario
//   firma          registrata per firmare una pratica per conto di una società (praticaId)
//
// indirizzo: la residenza (o la sede) quando la persona l'ha dichiarata. Se
//   manca, vale la casa in cui è in affitto, poi l'indirizzo di fatturazione:
//   il controllo dei doppioni confronta nome, indirizzo e paese.
//
// account (solo dove non si ricava dalla persona demo)
//   attivo · da_verificare · invitato · senza_account
//   daInvito: true quando l'account si è agganciato all'anagrafica già esistente (F-06)
export const SOGGETTI = {
    mario: {
        luogoNascita: 'Milano',
        creatoIl: '2025-09-16',
        origine: { tipo: 'contratto', contrattoId: 'c-italia88' },
        account: { dal: '2025-09-20', daInvito: true },
    },
    giulia: {
        luogoNascita: 'Milano',
        creatoIl: '2025-02-12',
        origine: { tipo: 'contratto', contrattoId: 'c-padova12' },
        account: { dal: '2025-03-02', daInvito: true },
    },
    verdi: {
        creatoIl: '2023-12-18',
        origine: { tipo: 'registrazione' },
        account: { dal: '2023-12-18' },
        sede: 'Corso Venezia 40, 20121 Milano',
        rappresentante: 'sog-laura-verdi',
    },
    martina: {
        luogoNascita: 'Milano',
        creatoIl: '2025-05-20',
        origine: { tipo: 'contratto', contrattoId: 'c-tortona27' },
        account: { dal: '2025-06-03', daInvito: true },
    },
    anna: {
        luogoNascita: 'Roma',
        creatoIl: '2026-09-12',
        origine: { tipo: 'registrazione' },
        account: { dal: '2026-09-12' },
    },
    elena: {
        luogoNascita: 'Napoli',
        creatoIl: '2026-08-20',
        origine: { tipo: 'registrazione' },
        account: { dal: '2026-08-20' },
    },

    // Parti dei contratti che non sono persone demo: nome e recapiti dal contratto.
    'sog-davide-colombo': {
        parte: { contrattoId: 'c-verdi3', verso: 'conduttore' },
        codiceFiscale: 'CLMDVD87H14F205W',
        dataNascita: '1987-06-14',
        luogoNascita: 'Milano',
        creatoIl: '2025-09-22',
        origine: { tipo: 'contratto', contrattoId: 'c-verdi3' },
        account: { stato: 'invitato', inviti: [{ il: '2025-10-01', canale: 'email', da: null }] },
    },
    'sog-chiara-lombardi': {
        parte: { contrattoId: 'c-verdi5', verso: 'conduttore' },
        // Undici cifre su una persona fisica: il codice provvisorio che l'Agenzia
        // delle Entrate dà a chi non ha ancora quello definitivo. Viene dal
        // contratto registrato nel 2023.
        codiceFiscale: '31265480972',
        dataNascita: '1994-02-17',
        luogoNascita: 'Lugano (Svizzera)',
        creatoIl: '2025-10-25',
        origine: { tipo: 'contratto', contrattoId: 'c-verdi5' },
        account: { stato: 'attivo', dal: '2025-11-03', daInvito: true },
        richiesteCodice: [{ il: '2026-08-31', canale: 'area', da: 'nicola' }],
    },
    'sog-francesca-bellini': {
        parte: { contrattoId: 'c-italia88', verso: 'locatore' },
        codiceFiscale: 'BLLFNC68P62F205Y',
        dataNascita: '1968-09-22',
        luogoNascita: 'Milano',
        creatoIl: '2025-09-15',
        origine: { tipo: 'registrazione' },
        account: { stato: 'attivo', dal: '2025-09-15' },
    },
    'sog-stefano-ricci': {
        parte: { contrattoId: 'c-monza140', verso: 'conduttore' },
        codiceFiscale: 'RCCSFN85S03Z600N',
        dataNascita: '1985-11-03',
        luogoNascita: 'Buenos Aires (Argentina)',
        creatoIl: '2023-12-18',
        origine: { tipo: 'contratto', contrattoId: 'c-monza140' },
        account: { stato: 'senza_account' },
        // Il provvisorio resta collegato: chi cerca con quello trova la stessa persona.
        codiciPrecedenti: [{ codice: '28430917651', tipo: 'provvisorio', dal: '2023-12-18', al: '2026-06-18' }],
        codiceDefinitivo: { il: '2026-06-18', da: 'ettore', fonte: 'certificato_attribuzione' },
    },

    // Candidati: nome e recapiti dalla pratica. Il codice fiscale c'è quando
    // l'istruttoria l'ha letto sul documento caricato dal candidato.
    'cand-pr-savona22': { codiceFiscale: 'NRESRA91E45F205N', dataNascita: '1991-05-05', luogoNascita: 'Milano' },
    'cand-pr-bergamo8': { codiceFiscale: 'FNTRNI89R70F205W', dataNascita: '1989-10-30', luogoNascita: 'Milano' },

    // Si è registrato da solo invece di usare l'invito ricevuto per Via Verdi 3,
    // con un'altra email e un altro cellulare, e sbagliando la data di nascita
    // (4 invece di 14 giugno): il codice fiscale che ne esce è diverso, quindi la
    // registrazione è passata. Stesso nome, stesso indirizzo, stesso paese di chi
    // è in CRIA dal contratto di Via Verdi 3: il controllo lo segnala. È la
    // stessa persona: il documento d'identità lo dice.
    'sog-davide-colombo-2': {
        tipo: 'fisica',
        nome: 'Davide',
        cognome: 'Colombo',
        email: 'd.colombo87@esempio.it',
        telefono: '+39 348 5566778',
        codiceFiscale: 'CLMDVD87H04F205V',
        dataNascita: '1987-06-04',
        luogoNascita: 'Milano',
        indirizzo: { via: 'Via Verdi 3', cap: '20121', citta: 'Milano', paese: 'Italia' },
        creatoIl: '2026-09-03',
        origine: { tipo: 'registrazione' },
        account: { stato: 'attivo', dal: '2026-09-03', identitaVerificataIl: '2026-09-07', identitaVerificataDa: 'valeria' },
    },
    // Il figlio di Mario Rossi: stesso nome, vive con lui in Corso Italia 88. Il
    // controllo li accosta; sono due persone diverse, e lo decide chi guarda i
    // documenti (date di nascita e codici fiscali diversi).
    'sog-mario-rossi-2': {
        tipo: 'fisica',
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario.rossi04@esempio.it',
        telefono: '+39 347 9081726',
        codiceFiscale: 'RSSMRA04C21F205P',
        dataNascita: '2004-03-21',
        luogoNascita: 'Milano',
        indirizzo: { via: 'Corso Italia 88', cap: '20122', citta: 'Milano', paese: 'Italia' },
        creatoIl: '2026-09-10',
        origine: { tipo: 'registrazione' },
        account: { stato: 'attivo', dal: '2026-09-10', identitaVerificataIl: '2026-09-11', identitaVerificataDa: 'ettore' },
    },
    // La legale rappresentante di Immobiliare Verdi, registrata per firmare la
    // pratica di Via Bergamo 8. Opera con i recapiti della società; il nome è
    // diverso, quindi il controllo dei doppioni non le accosta.
    'sog-laura-verdi': {
        rappresenta: 'verdi',
        codiceFiscale: 'VRDLRA71L52F205E',
        dataNascita: '1971-07-12',
        luogoNascita: 'Milano',
        creatoIl: '2026-09-14',
        origine: { tipo: 'firma', praticaId: 'pr-bergamo8' },
        account: { stato: 'senza_account', nota: 'Opera con l’account della società' },
    },
};

// ─── Estremi di registrazione ─────────────────────────────────────────────────
// Gli estremi dichiarati sono quelli del contratto in datiDemo.js. Qui c'è chi li
// ha letti dalla ricevuta e quando, e le richieste di ricevuta ai proprietari.
// La ricevuta dei proprietari demo è un documento di DOCUMENTI (tipo
// 'registrazione'); per chi non è una persona demo sta qui.
export const REGISTRAZIONI = {
    'c-verdi3': { inserimento: { da: 'valeria', il: '2025-10-10' } },
    'c-verdi5': { richieste: [{ il: '2026-09-01', da: 'valeria', canale: 'area' }] },
    'c-italia88': { ricevuta: { nome: 'Ricevuta di registrazione.pdf', caricataIl: '2026-09-14' } },
};

// ─── Immobili ─────────────────────────────────────────────────────────────────
// Il codice dell'immobile non cambia mai (§9.4): cambiano inquilini e
// proprietari, l'immobile e il suo storico restano. È assegnato quando
// l'immobile entra in CRIA, nell'ordine in cui è entrato.
//
// titolarita: una riga per titolare. Un cambio di proprietà chiude la riga
// precedente e ne apre una nuova: niente si sovrascrive.
//   soggettoId  il titolare, se è un soggetto CRIA
//   nome        il titolare precedente, se non è mai entrato in CRIA
//   fonte       visura · atto · dichiarazione (documentoId quando c'è)
export const IMMOBILI = [
    {
        id: 'imm-0001',
        inseritoIl: '2023-12-18',
        contratti: ['c-monza140'],
        titolarita: [
            { soggettoId: 'verdi', titolo: 'proprietario', quota: 100, dal: '2016-02-01', al: null, fonte: 'dichiarazione', registrataDa: null, registrataIl: '2023-12-18' },
        ],
    },
    {
        id: 'imm-0002',
        inseritoIl: '2025-02-12',
        contratti: ['c-padova12'],
        titolarita: [
            { nome: 'Carla Benedetti', titolo: 'proprietario', quota: 100, dal: '2004-06-18', al: '2024-11-19', fonte: 'atto', registrataDa: 'ettore', registrataIl: '2025-02-14' },
            { soggettoId: 'verdi', titolo: 'proprietario', quota: 100, dal: '2024-11-20', al: null, fonte: 'atto', registrataDa: 'ettore', registrataIl: '2025-02-14' },
        ],
    },
    {
        id: 'imm-0003',
        inseritoIl: '2025-05-20',
        contratti: ['c-tortona27'],
        titolarita: [
            { soggettoId: 'verdi', titolo: 'proprietario', quota: 100, dal: '2019-09-12', al: null, fonte: 'dichiarazione', registrataDa: null, registrataIl: '2025-05-20' },
        ],
    },
    {
        id: 'imm-0004',
        inseritoIl: '2025-09-16',
        contratti: ['c-italia88'],
        titolarita: [
            { soggettoId: 'sog-francesca-bellini', titolo: 'proprietario', quota: 100, dal: '2009-04-02', al: null, fonte: 'dichiarazione', registrataDa: null, registrataIl: '2025-09-16' },
        ],
    },
    {
        id: 'imm-0005',
        inseritoIl: '2025-09-22',
        contratti: ['c-verdi3'],
        titolarita: [
            { soggettoId: 'mario', titolo: 'proprietario', quota: 100, dal: '2018-05-10', al: null, fonte: 'visura', documentoId: 'doc-m4', registrataDa: 'valeria', registrataIl: '2025-09-24' },
        ],
    },
    {
        id: 'imm-0006',
        inseritoIl: '2025-10-25',
        contratti: ['c-verdi5'],
        titolarita: [
            { soggettoId: 'mario', titolo: 'proprietario', quota: 100, dal: '2018-05-10', al: null, fonte: 'visura', documentoId: 'doc-m6', registrataDa: null, registrataIl: '2025-10-25' },
        ],
    },
    {
        id: 'imm-0007',
        inseritoIl: '2026-08-28',
        pratiche: ['pr-savona22'],
        titolarita: [
            { soggettoId: 'mario', titolo: 'proprietario', quota: 100, dal: '2021-03-15', al: null, fonte: 'visura', registrataDa: 'ettore', registrataIl: '2026-09-12' },
        ],
    },
    {
        id: 'imm-0008',
        inseritoIl: '2026-09-01',
        pratiche: ['pr-bergamo8'],
        titolarita: [
            { soggettoId: 'verdi', titolo: 'proprietario', quota: 100, dal: '2020-07-01', al: null, fonte: 'dichiarazione', registrataDa: null, registrataIl: '2026-09-01' },
        ],
    },
    {
        id: 'imm-0009',
        inseritoIl: '2026-09-08',
        pratiche: ['pr-solferino14'],
        titolarita: [
            { soggettoId: 'mario', titolo: 'proprietario', quota: 100, dal: '2023-11-30', al: null, fonte: 'visura', registrataDa: 'valeria', registrataIl: '2026-09-09' },
        ],
    },
];
