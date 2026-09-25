// ═════════════════════════════════════════════════════════════════════════════
// PRATICHE E MOROSITÀ — SOLO PER I MOCKUP
// La pratica è il percorso di un prodotto su un immobile (flusso 4.2 della mappa):
// documenti → verifica di CRIA → prezzo e pagamento → firma → attiva.
// La morosità è la pratica che si apre quando un canone non arriva (flusso 4.4).
// ═════════════════════════════════════════════════════════════════════════════

export const FASI_PRATICA = [
    { id: 'documenti', etichetta: 'Documenti', descrizione: 'I tuoi documenti e quelli del candidato inquilino' },
    { id: 'istruttoria', etichetta: 'Verifica di CRIA', descrizione: 'Una persona del team controlla i documenti e decide' },
    { id: 'pagamento', etichetta: 'Prezzo e pagamento', descrizione: 'Il prezzo esce dal listino e si congela quando paghi' },
    { id: 'firma', etichetta: 'Firma', descrizione: 'Il contratto di servizio, firmato in piattaforma' },
    { id: 'attiva', etichetta: 'Attiva', descrizione: 'L’immobile entra tra i tuoi immobili' },
];

// Cosa carica il candidato dal suo link personale. Il proprietario vede quali
// documenti mancano, mai i documenti (documento di stato §14.5).
export const DOCUMENTI_CANDIDATO = [
    { tipo: 'consenso', etichetta: 'Informativa letta e consenso alla valutazione' },
    { tipo: 'identita', etichetta: 'Documento d’identità' },
    { tipo: 'codice_fiscale', etichetta: 'Codice fiscale' },
    { tipo: 'movimenti_canone', etichetta: 'Pagamenti del canone degli ultimi 12 mesi (solo quei movimenti)' },
    { tipo: 'reddito', etichetta: 'Documenti di reddito' },
];

const candidato = (dati, caricati) => ({
    ...dati,
    documenti: DOCUMENTI_CANDIDATO.map(d => ({ ...d, stato: caricati.includes(d.tipo) ? 'caricato' : 'mancante' })),
});

export const PRATICHE = [
    {
        id: 'pr-solferino14',
        personaId: 'mario',
        prodotto: 'P2',
        contratto: 'nuovo',
        immobile: { indirizzo: 'Via Solferino 14', cap: '20121', citta: 'Milano', provincia: 'MI', lat: 45.47538, lng: 9.18823, tipologia: 'Bilocale', mq: 55, catasto: 'Foglio 348 · Particella 112 · Sub 7' },
        titolarita: 'proprietario',
        canone: 1300, deposito: 2600, inizioPrevisto: '2026-11-01', durata: '4 + 4 anni',
        apertaIl: '2026-09-08', quotaPagataIl: '2026-09-08',
        stato: 'documenti',
        documentiProprietario: [{ tipo: 'visura', etichetta: 'Visura catastale', stato: 'verificato' }],
        candidato: candidato({ nome: 'Luca Bianchi', email: 'luca.bianchi@esempio.it', cellulare: '+39 340 111 2233', invitatoIl: '2026-09-08', ultimoAccesso: '2026-09-12', token: 'solferino14-lb' }, ['consenso', 'identita', 'codice_fiscale']),
    },
    {
        id: 'pr-savona22',
        personaId: 'mario',
        prodotto: 'P1',
        contratto: 'nuovo',
        immobile: { indirizzo: 'Via Savona 22', cap: '20144', citta: 'Milano', provincia: 'MI', lat: 45.45561, lng: 9.16655, tipologia: 'Trilocale', mq: 78, catasto: 'Foglio 470 · Particella 58 · Sub 12' },
        titolarita: 'proprietario',
        canone: 900, deposito: 1800, inizioPrevisto: '2026-10-15', durata: '3 + 2 anni, canone concordato',
        apertaIl: '2026-08-28', quotaPagataIl: '2026-08-28',
        stato: 'pagamento',
        documentiProprietario: [{ tipo: 'visura', etichetta: 'Visura catastale', stato: 'verificato' }],
        candidato: candidato({ nome: 'Sara Neri', email: 'sara.neri@esempio.it', cellulare: '+39 347 998 1122', invitatoIl: '2026-08-28', ultimoAccesso: '2026-09-02', token: 'savona22-sn' }, DOCUMENTI_CANDIDATO.map(d => d.tipo)),
        istruttoria: { conclusaIl: '2026-09-12', esito: 'approvata', nota: 'Storico rilevato da CRIA su 12 mesi, semaforo Regolare. Garanzia con la franchigia standard.' },
    },
    {
        id: 'pr-bergamo8',
        personaId: 'verdi',
        prodotto: 'P1E',
        contratto: 'esistente',
        immobile: { indirizzo: 'Via Bergamo 8', cap: '20135', citta: 'Milano', provincia: 'MI', lat: 45.46128, lng: 9.21079, tipologia: 'Bilocale', mq: 62, catasto: 'Foglio 512 · Particella 33 · Sub 4' },
        titolarita: 'societa',
        canone: 1150, deposito: 2300, inizio: '2024-03-01', durata: '4 + 4 anni',
        registrazione: { numero: 'TNE24T003411000KF', data: '2024-03-12', ufficio: 'Agenzia delle Entrate · DP II Milano' },
        apertaIl: '2026-09-01', quotaPagataIl: '2026-09-01',
        stato: 'firma',
        documentiProprietario: [
            { tipo: 'visura_camerale', etichetta: 'Visura camerale', stato: 'verificato' },
            { tipo: 'contratto', etichetta: 'Contratto di locazione registrato', stato: 'verificato' },
        ],
        candidato: candidato({ nome: 'Irene Fontana', email: 'irene.fontana@esempio.it', cellulare: '+39 333 404 5566', invitatoIl: '2026-09-01', ultimoAccesso: '2026-09-04', inquilinoAttuale: true, token: 'bergamo8-if' }, DOCUMENTI_CANDIDATO.map(d => d.tipo)),
        istruttoria: { conclusaIl: '2026-09-10', esito: 'approvata', nota: 'Contratto registrato e pagamenti degli ultimi 12 mesi coerenti con il canone. Franchigia del contratto esistente.' },
        pagamento: { pagataIl: '2026-09-14', prezzoCongelato: true },
    },
];

// Pratiche di morosità. L'indennizzo c'è solo con la garanzia, dopo la franchigia e
// per i mesi segnalati in tempo; allora il credito verso l'inquilino passa a CRIA.
export const MOROSITA = [
    {
        id: 'mor-tortona27-2026-07',
        contrattoId: 'c-tortona27',
        mesi: ['2026-07'],
        importo: 1050,
        apertaIl: '2026-07-12',
        stato: 'piano_in_corso',
        gestore: 'Ufficio recupero CRIA',
        eventi: [
            { il: '2026-07-04', titolo: 'Mancato pagamento segnalato', testo: 'Luglio segnalato come non pagato entro il 6: la copertura del mese è attiva.' },
            { il: '2026-07-12', titolo: 'Pratica aperta', testo: 'Il mese si è chiuso senza incasso: il recupero parte subito.' },
            { il: '2026-07-15', titolo: 'Primo contatto con l’inquilina', testo: 'Telefonata ed email a Martina Galli: conferma la difficoltà e chiede di rateizzare.' },
            { il: '2026-07-20', titolo: 'Indennizzo riconosciuto', testo: 'Luglio era coperto dalla garanzia: il credito verso l’inquilina passa a CRIA.', soloProprietario: true },
            { il: '2026-07-22', titolo: 'Indennizzo pagato', testo: 'Bonifico di 1050 € sul conto della società.', soloProprietario: true },
            { il: '2026-07-29', titolo: 'Piano di rientro proposto', testo: 'Tre rate mensili, approvate dal responsabile legale.' },
            { il: '2026-08-02', titolo: 'Piano accettato', testo: 'L’inquilina ha accettato il piano dalla sua area.' },
            { il: '2026-08-19', titolo: 'Prima rata pagata', testo: 'La prima rata è arrivata a CRIA.' },
        ],
        piano: {
            rate: [
                { n: 1, scadenza: '2026-08-20', importo: 350, stato: 'pagata', pagataIl: '2026-08-19' },
                { n: 2, scadenza: '2026-09-20', importo: 350, stato: 'in_scadenza' },
                { n: 3, scadenza: '2026-10-20', importo: 350, stato: 'futura' },
            ],
        },
        indennizzo: { stato: 'pagato', mese: '2026-07', importo: 1050, riconosciutoIl: '2026-07-20', pagatoIl: '2026-07-22', nota: 'Luglio segnalato entro il giorno 6, dopo la franchigia: coperto.' },
    },
];

export const praticheDi = (personaId) => PRATICHE.filter(p => p.personaId === personaId);
export const morositaDeiContratti = (contratti) => {
    const ids = new Set(contratti.map(c => c.id));
    return MOROSITA.filter(m => ids.has(m.contrattoId));
};
