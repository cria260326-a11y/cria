// Testi dei Termini di servizio (/termini) — pages/Vetrina/Legali/TerminiPage.jsx.
// L'admin li cambia da Testi.
// ⚠️ TESTO PROVVISORIO — da revisionare con un consulente legale prima del lancio.
export default {
    id: 'termini',
    nome: 'Termini di servizio',
    percorso: '/termini',
    ordine: 97,
    testi: [
        { chiave: 'termini.meta.titolo', sezione: 'Scheda del browser', etichetta: 'Titolo della scheda', testo: 'Termini di servizio — CRIA' },

        { chiave: 'termini.hero.occhiello', sezione: 'In alto', etichetta: 'Occhiello', testo: '● Documenti legali' },
        { chiave: 'termini.hero.titolo', sezione: 'In alto', etichetta: 'Titolo', testo: 'Termini di servizio' },
        { chiave: 'termini.hero.sottotitolo', sezione: 'In alto', etichetta: 'Sottotitolo', testo: 'Ultimo aggiornamento: maggio 2026 · Condizioni generali di utilizzo della piattaforma CRIA' },

        { chiave: 'termini.paragrafo1.titolo', sezione: 'Paragrafo 1', etichetta: 'Titolo', testo: '1. Oggetto del servizio' },
        { chiave: 'termini.paragrafo1.testo', sezione: 'Paragrafo 1', etichetta: 'Testo', testo: `CRIA è una piattaforma digitale per la gestione trasparente dei rapporti di locazione. I presenti Termini regolano l'uso della piattaforma e l'acquisto dei prodotti CRIA da parte degli utenti registrati.`, lungo: true },

        { chiave: 'termini.paragrafo2.titolo', sezione: 'Paragrafo 2', etichetta: 'Titolo', testo: '2. I prodotti' },
        { chiave: 'termini.paragrafo2.testo', sezione: 'Paragrafo 2', etichetta: 'Testo', testo: `CRIA offre quattro prodotti: CRIA Gestione (P1) — strumenti per la gestione autonoma del contratto di locazione da parte del locatore, con durata di 12, 18 o 24 mesi; CRIA Completo (P2) — gestione del rapporto e dei pagamenti da parte di CRIA, con durata di 12, 18 o 24 mesi; CRIA Verifica (P3) — richiesta una tantum di informazioni sulla regolarità dei pagamenti di un potenziale inquilino; Consulenza (P4) — servizio una tantum propedeutico all'avvio dell'onboarding per i prodotti P1 e P2.`, lungo: true },

        { chiave: 'termini.paragrafo3.titolo', sezione: 'Paragrafo 3', etichetta: 'Titolo', testo: '3. Registrazione e account' },
        { chiave: 'termini.paragrafo3.testo', sezione: 'Paragrafo 3', etichetta: 'Testo', testo: `La registrazione richiede dati veritieri e aggiornati. L'account è personale e non cedibile. L'utente è responsabile della custodia delle credenziali e di ogni attività svolta tramite il proprio account. CRIA si riserva di sospendere account in caso di uso improprio o violazione dei presenti Termini.`, lungo: true },

        { chiave: 'termini.paragrafo4.titolo', sezione: 'Paragrafo 4', etichetta: 'Titolo', testo: '4. Onboarding e verifica documentale' },
        { chiave: 'termini.paragrafo4.testo', sezione: 'Paragrafo 4', etichetta: 'Testo', testo: `L'attivazione dei prodotti P1 e P2 è subordinata al completamento dell'onboarding: caricamento dei documenti richiesti, verifica da parte di CRIA, accettazione del preventivo e pagamento. CRIA può richiedere integrazioni documentali. In caso di documenti non veritieri, CRIA può rifiutare l'attivazione o risolvere il contratto.`, lungo: true },

        { chiave: 'termini.paragrafo5.titolo', sezione: 'Paragrafo 5', etichetta: 'Titolo', testo: '5. Pagamenti' },
        { chiave: 'termini.paragrafo5.testo', sezione: 'Paragrafo 5', etichetta: 'Testo', testo: `I pagamenti avvengono tramite Stripe. I prezzi sono indicati nel preventivo inviato all'utente e si intendono IVA inclusa salvo diversa indicazione. Il servizio si attiva al buon esito del pagamento. La fattura viene inviata via email.`, lungo: true },

        { chiave: 'termini.paragrafo6.titolo', sezione: 'Paragrafo 6', etichetta: 'Titolo', testo: '6. Segnalazioni di pagamento' },
        { chiave: 'termini.paragrafo6.testo', sezione: 'Paragrafo 6', etichetta: 'Testo', testo: `Nel prodotto P1, il locatore segnala mensilmente l'avvenuto o mancato pagamento del canone. In assenza di segnalazione entro il giorno 11 del mese, il pagamento si considera regolare. Le segnalazioni devono essere veritiere: segnalazioni false possono comportare responsabilità civile e la sospensione dell'account.`, lungo: true },

        { chiave: 'termini.paragrafo7.titolo', sezione: 'Paragrafo 7', etichetta: 'Titolo', testo: '7. Contestazioni' },
        { chiave: 'termini.paragrafo7.testo', sezione: 'Paragrafo 7', etichetta: 'Testo', testo: `L'inquilino può contestare una segnalazione entro 7 giorni dalla notifica, allegando documentazione probatoria. CRIA gestisce la contestazione come mediatore attraverso canali di comunicazione separati con le parti. L'esito della verifica è comunicato a entrambe le parti. Decorsi 7 giorni senza contestazione, la segnalazione si considera definitiva.`, lungo: true },

        { chiave: 'termini.paragrafo8.titolo', sezione: 'Paragrafo 8', etichetta: 'Titolo', testo: '8. Servizio di verifica (P3)' },
        { chiave: 'termini.paragrafo8.testo', sezione: 'Paragrafo 8', etichetta: 'Testo', testo: `Il servizio CRIA Verifica fornisce informazioni esclusivamente se presenti nella banca dati CRIA. La risposta può essere negativa ("non abbiamo informazioni in merito") senza diritto a rimborso. Le informazioni fornite hanno valore informativo e non costituiscono giudizio sull'affidabilità complessiva della persona.`, lungo: true },

        { chiave: 'termini.paragrafo9.titolo', sezione: 'Paragrafo 9', etichetta: 'Titolo', testo: '9. Obblighi dell\'utente' },
        { chiave: 'termini.paragrafo9.testo', sezione: 'Paragrafo 9', etichetta: 'Testo', testo: `L'utente si impegna a: fornire dati e documenti veritieri; usare la piattaforma nel rispetto della legge; non caricare contenuti illeciti o lesivi di diritti altrui; mantenere riservate le credenziali di accesso; comunicare tempestivamente variazioni rilevanti (cambio inquilino, cessazione contratto, cambio proprietà).`, lungo: true },

        { chiave: 'termini.paragrafo10.titolo', sezione: 'Paragrafo 10', etichetta: 'Titolo', testo: '10. Limitazioni di responsabilità' },
        { chiave: 'termini.paragrafo10.testo', sezione: 'Paragrafo 10', etichetta: 'Testo', testo: `CRIA fornisce strumenti di gestione e informazione ma non è parte dei contratti di locazione tra locatori e inquilini. CRIA non garantisce il buon esito dei rapporti di locazione né la solvibilità degli inquilini. Nei limiti di legge, la responsabilità di CRIA è limitata all'importo pagato dall'utente per il servizio nell'anno in corso.`, lungo: true },

        { chiave: 'termini.paragrafo11.titolo', sezione: 'Paragrafo 11', etichetta: 'Titolo', testo: '11. Durata, recesso e disdetta' },
        { chiave: 'termini.paragrafo11.testo', sezione: 'Paragrafo 11', etichetta: 'Testo', testo: `I prodotti P1 e P2 hanno la durata scelta al momento dell'acquisto (12, 18 o 24 mesi) e non si rinnovano automaticamente salvo diversa pattuizione. Il diritto di recesso per i consumatori si esercita entro 14 giorni dall'acquisto, salvo che il servizio sia già stato attivato su richiesta dell'utente. P3 e P4 sono servizi una tantum: il recesso non è esercitabile dopo l'erogazione.`, lungo: true },

        { chiave: 'termini.paragrafo12.titolo', sezione: 'Paragrafo 12', etichetta: 'Titolo', testo: '12. Legge applicabile e foro' },
        { chiave: 'termini.paragrafo12.testo', sezione: 'Paragrafo 12', etichetta: 'Testo', testo: `I presenti Termini sono regolati dalla legge italiana. Per le controversie con consumatori è competente il foro del luogo di residenza del consumatore; negli altri casi il foro di [città da inserire].`, lungo: true },

        { chiave: 'termini.contatti.testo', sezione: 'In fondo', etichetta: 'Frase prima dell’indirizzo email', testo: 'Per domande sui Termini di servizio scrivi a' },
        { chiave: 'termini.contatti.email', sezione: 'In fondo', etichetta: 'Indirizzo email (è anche il link che apre la posta)', testo: 'legal@cri-affitti.it' },
    ],
};
