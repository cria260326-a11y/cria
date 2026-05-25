// ─── Fonte dati condivisa tra admin e pagina onboarding utente ────────────────
// In produzione verrà sostituita da chiamate Supabase
// await supabase.from('onboarding_flussi').select('*')

export const FLUSSI_ONBOARDING = {
    AB: {
        id: 'AB',
        nome: 'Onboarding locatore',
        categoria: 'A+B',
        steps: [
            {
                id: 1,
                nome: 'Tipo soggetto e identità',
                descrizione: 'Dicci chi sei e carica i tuoi documenti di identità.',
                campi: [
                    { id: 'tipo_soggetto', nome: 'Tipo soggetto', tipo: 'select', obbligatorio: true, opzioni: ['Privato', 'Agenzia'], note: '' },
                    { id: 'codice_fiscale', nome: 'Codice fiscale', tipo: 'testo', obbligatorio: true, note: '' },
                    { id: 'partita_iva', nome: 'Partita IVA', tipo: 'testo', obbligatorio: false, note: 'Solo per agenzie' },
                    { id: 'doc_identita', nome: 'Documento identità', tipo: 'documento', obbligatorio: true, note: 'Carta identità o passaporto' },
                ]
            },
            {
                id: 2,
                nome: 'Dati immobile/i',
                descrizione: 'Inserisci i dati dei tuoi immobili e scegli il prodotto per ognuno.',
                campi: [
                    { id: 'n_immobili', nome: 'Numero immobili', tipo: 'numero', obbligatorio: true, note: '' },
                    { id: 'indirizzo', nome: 'Indirizzo immobile', tipo: 'testo', obbligatorio: true, note: 'Ripetere per ogni immobile' },
                    { id: 'prodotto', nome: 'Prodotto per immobile', tipo: 'select', obbligatorio: true, opzioni: ['CRIA Gestione (P1)', 'CRIA Completo (P2)'], note: '' },
                    { id: 'prop_locatore', nome: 'Sei il proprietario?', tipo: 'checkbox', obbligatorio: true, note: '' },
                ]
            },
            {
                id: 3,
                nome: 'Documenti immobile',
                descrizione: 'Carica i documenti relativi ai tuoi immobili.',
                campi: [
                    { id: 'visura', nome: 'Visura catastale', tipo: 'documento', obbligatorio: true, note: '' },
                    { id: 'contratto', nome: 'Contratto di locazione', tipo: 'documento', obbligatorio: false, note: 'Se già esistente' },
                    { id: 'atto_proprieta', nome: 'Atto di proprietà', tipo: 'documento', obbligatorio: false, note: 'Se proprietario ≠ locatore' },
                ]
            },
            {
                id: 4,
                nome: 'Referente e supporto',
                descrizione: 'Hai un codice referente o hai bisogno di supporto legale?',
                campi: [
                    { id: 'codice_referente', nome: 'Codice referente', tipo: 'testo', obbligatorio: false, note: 'Se ti ha indirizzato un commerciale CRIA' },
                    { id: 'supporto_legale', nome: 'Supporto legale', tipo: 'checkbox', obbligatorio: false, note: 'Richiedi assegnazione di un avvocato CRIA' },
                ]
            },
        ]
    },

    C: {
        id: 'C',
        nome: 'Onboarding Prodotto 3',
        categoria: 'C',
        steps: [
            {
                id: 1,
                nome: 'I tuoi documenti',
                descrizione: 'Carica il tuo documento di identità per procedere con la richiesta.',
                campi: [
                    { id: 'codice_fiscale', nome: 'Codice fiscale', tipo: 'testo', obbligatorio: true, note: '' },
                    { id: 'doc_identita', nome: 'Documento identità', tipo: 'documento', obbligatorio: true, note: 'Carta identità o passaporto' },
                ]
            },
            {
                id: 2,
                nome: 'Dati persona da verificare',
                descrizione: 'Inserisci i dati del potenziale inquilino che vuoi verificare.',
                campi: [
                    { id: 'nome_inquilino', nome: 'Nome', tipo: 'testo', obbligatorio: true, note: '' },
                    { id: 'cognome_inquilino', nome: 'Cognome', tipo: 'testo', obbligatorio: true, note: '' },
                    { id: 'data_nascita', nome: 'Data di nascita', tipo: 'data', obbligatorio: true, note: '' },
                    { id: 'luogo_nascita', nome: 'Luogo di nascita', tipo: 'testo', obbligatorio: true, note: '' },
                    { id: 'cf_inquilino', nome: 'Codice fiscale', tipo: 'testo', obbligatorio: true, note: '' },
                ]
            },
            {
                id: 3,
                nome: 'Pagamento',
                descrizione: 'Scegli il metodo di pagamento per completare la richiesta.',
                campi: [
                    { id: 'metodo_pagamento', nome: 'Metodo di pagamento', tipo: 'select', obbligatorio: true, opzioni: ['Carta di credito (Stripe)', 'Bonifico bancario'], note: '' },
                ]
            },
        ]
    }
};