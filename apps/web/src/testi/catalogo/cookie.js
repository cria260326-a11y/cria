// Testi della Cookie Policy (/cookie) — pages/Vetrina/Legali/CookiePage.jsx.
// L'admin li cambia da Testi. Il tipo di ogni cookie (tecnico o analitico)
// decide il colore dell'etichetta e resta nella pagina.
// ⚠️ TESTO PROVVISORIO — da revisionare con un consulente legale prima del lancio.
export default {
    id: 'cookie',
    nome: 'Cookie Policy',
    percorso: '/cookie',
    ordine: 98,
    testi: [
        { chiave: 'cookie.meta.titolo', sezione: 'Scheda del browser', etichetta: 'Titolo della scheda', testo: 'Cookie Policy — CRIA' },

        { chiave: 'cookie.hero.occhiello', sezione: 'In alto', etichetta: 'Occhiello', testo: '● Documenti legali' },
        { chiave: 'cookie.hero.titolo', sezione: 'In alto', etichetta: 'Titolo', testo: 'Cookie Policy' },
        { chiave: 'cookie.hero.sottotitolo', sezione: 'In alto', etichetta: 'Sottotitolo', testo: 'Ultimo aggiornamento: maggio 2026 · Informativa sull\'uso dei cookie sulla piattaforma CRIA' },

        { chiave: 'cookie.paragrafo1.titolo', sezione: 'Paragrafo 1', etichetta: 'Titolo', testo: '1. Cosa sono i cookie' },
        { chiave: 'cookie.paragrafo1.testo', sezione: 'Paragrafo 1', etichetta: 'Testo', testo: `I cookie sono piccoli file di testo che i siti visitati inviano al dispositivo dell'utente, dove vengono memorizzati per essere ritrasmessi agli stessi siti alla visita successiva. CRIA utilizza i cookie per garantire il funzionamento della piattaforma e, previo consenso, per finalità statistiche.`, lungo: true },

        { chiave: 'cookie.paragrafo2.titolo', sezione: 'Paragrafo 2', etichetta: 'Titolo', testo: '2. Cookie tecnici' },
        { chiave: 'cookie.paragrafo2.testo', sezione: 'Paragrafo 2', etichetta: 'Testo', testo: `Sono necessari al funzionamento della piattaforma (autenticazione, sicurezza, preferenze). Non richiedono consenso ai sensi della normativa vigente e non possono essere disattivati senza compromettere l'uso del servizio.`, lungo: true },

        { chiave: 'cookie.paragrafo3.titolo', sezione: 'Paragrafo 3', etichetta: 'Titolo', testo: '3. Cookie analitici' },
        { chiave: 'cookie.paragrafo3.testo', sezione: 'Paragrafo 3', etichetta: 'Testo', testo: `Utilizzati, solo previo consenso, per raccogliere statistiche aggregate sull'uso del sito (pagine visitate, tempo di permanenza). I dati sono anonimizzati e non consentono l'identificazione dell'utente.`, lungo: true },

        { chiave: 'cookie.paragrafo4.titolo', sezione: 'Paragrafo 4', etichetta: 'Titolo', testo: '4. Cookie di terze parti' },
        { chiave: 'cookie.paragrafo4.testo', sezione: 'Paragrafo 4', etichetta: 'Testo', testo: `Alcuni servizi integrati possono installare cookie propri: Stripe (pagamenti, cookie tecnici antifrode), provider di mappe (visualizzazione mappe immobili). Per questi cookie si rimanda alle informative dei rispettivi fornitori.`, lungo: true },

        { chiave: 'cookie.paragrafo5.titolo', sezione: 'Paragrafo 5', etichetta: 'Titolo', testo: '5. Come gestire i cookie' },
        { chiave: 'cookie.paragrafo5.testo', sezione: 'Paragrafo 5', etichetta: 'Testo', testo: `Puoi gestire le preferenze tramite il banner mostrato al primo accesso o dalle impostazioni del tuo browser (Chrome, Firefox, Safari, Edge consentono di bloccare o eliminare i cookie). La disattivazione dei cookie tecnici può impedire l'utilizzo dell'area riservata.`, lungo: true },

        { chiave: 'cookie.paragrafo6.titolo', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Titolo', testo: '6. Cookie utilizzati' },
        { chiave: 'cookie.tabella.nome', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Intestazione della colonna 1', testo: 'Nome' },
        { chiave: 'cookie.tabella.tipo', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Intestazione della colonna 2', testo: 'Tipo' },
        { chiave: 'cookie.tabella.durata', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Intestazione della colonna 3', testo: 'Durata' },
        { chiave: 'cookie.tabella.scopo', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Intestazione della colonna 4', testo: 'Scopo' },
        { chiave: 'cookie.tabella.tipoTecnico', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Tipo «tecnico», l’etichetta blu', testo: 'Tecnico' },
        { chiave: 'cookie.tabella.tipoAnalitico', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Tipo «analitico», l’etichetta gialla', testo: 'Analitico' },
        { chiave: 'cookie.tabella.riga1.nome', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Riga 1 · nome del cookie', testo: 'cria_session' },
        { chiave: 'cookie.tabella.riga1.durata', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Riga 1 · durata', testo: 'Sessione' },
        { chiave: 'cookie.tabella.riga1.scopo', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Riga 1 · scopo', testo: 'Mantiene la sessione di accesso dell\'utente autenticato.' },
        { chiave: 'cookie.tabella.riga2.nome', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Riga 2 · nome del cookie', testo: 'cria_prefs' },
        { chiave: 'cookie.tabella.riga2.durata', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Riga 2 · durata', testo: '12 mesi' },
        { chiave: 'cookie.tabella.riga2.scopo', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Riga 2 · scopo', testo: 'Memorizza le preferenze di interfaccia (es. impostazioni tabella).' },
        { chiave: 'cookie.tabella.riga3.nome', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Riga 3 · nome del cookie', testo: 'cookie_consent' },
        { chiave: 'cookie.tabella.riga3.durata', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Riga 3 · durata', testo: '12 mesi' },
        { chiave: 'cookie.tabella.riga3.scopo', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Riga 3 · scopo', testo: 'Registra le scelte espresse nel banner cookie.' },
        { chiave: 'cookie.tabella.riga4.nome', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Riga 4 · nome del cookie', testo: '_analytics' },
        { chiave: 'cookie.tabella.riga4.durata', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Riga 4 · durata', testo: '13 mesi' },
        { chiave: 'cookie.tabella.riga4.scopo', sezione: 'Paragrafo 6 · tabella dei cookie', etichetta: 'Riga 4 · scopo', testo: 'Statistiche aggregate e anonimizzate di utilizzo del sito (se attivato previo consenso).' },

        { chiave: 'cookie.contatti.testo', sezione: 'In fondo', etichetta: 'Frase prima dell’indirizzo email', testo: 'Per domande sull\'uso dei cookie scrivi a' },
        { chiave: 'cookie.contatti.email', sezione: 'In fondo', etichetta: 'Indirizzo email (è anche il link che apre la posta)', testo: 'privacy@cri-affitti.it' },
    ],
};
