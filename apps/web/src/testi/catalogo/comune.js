// Testata e piè di pagina di tutte le pagine della vetrina
// (components/VetrinaHeader.jsx e components/VetrinaFooter.jsx).
// Nomi e prezzi dei prodotti arrivano dal listino: qui ci sono solo i segnaposto.
export default {
    id: 'comune',
    nome: 'Testata e piè di pagina',
    percorso: '/',
    ordine: 5,
    testi: [
        { chiave: 'comune.testata.marchio', sezione: 'Testata', etichetta: 'Sotto il nome CRIA', testo: 'Centrale Rischi Immobiliare Affitti' },

        // Il menu è lo stesso sul computer e, aperto, sul telefono.
        { chiave: 'comune.menu.comeFunziona', sezione: 'Menu', etichetta: 'Voce «Come funziona»', testo: 'Come funziona' },
        { chiave: 'comune.menu.perChiE', sezione: 'Menu', etichetta: 'Voce che apre le porte d’ingresso', testo: 'Per chi è' },
        { chiave: 'comune.menu.porta1.titolo', sezione: 'Menu · Per chi è', etichetta: 'Porta 1 · proprietari · titolo (sotto, i nomi dei prodotti)', testo: 'Per proprietari' },
        { chiave: 'comune.menu.porta2.titolo', sezione: 'Menu · Per chi è', etichetta: 'Porta 2 · inquilini · titolo', testo: 'Per inquilini' },
        { chiave: 'comune.menu.porta2.testo', sezione: 'Menu · Per chi è', etichetta: 'Porta 2 · inquilini · riga sotto il titolo', testo: 'Il tuo semaforo e il certificato da mostrare' },
        { chiave: 'comune.menu.porta3.testo', sezione: 'Menu · Per chi è', etichetta: 'Porta 3 · verifica di un candidato · riga sotto il nome del prodotto', testo: 'Stai per affittare? {prezzo}, esito entro {ore} ore' },
        { chiave: 'comune.menu.porta4.testo', sezione: 'Menu · Per chi è', etichetta: 'Porta 4 · agenzie · riga sotto il nome del prodotto', testo: '{prezzo} · contattaci' },
        { chiave: 'comune.menu.supporto', sezione: 'Menu', etichetta: 'Voce «Supporto»', testo: 'Supporto' },
        { chiave: 'comune.menu.accedi', sezione: 'Menu', etichetta: 'Link per accedere', testo: 'Accedi' },
        { chiave: 'comune.menu.inizia', sezione: 'Menu', etichetta: 'Pulsante', testo: 'Inizia' },
        { chiave: 'comune.menu.apri', sezione: 'Menu', etichetta: 'Pulsante del menu sul telefono, chiuso (lo leggono gli screen reader)', testo: 'Apri il menu' },
        { chiave: 'comune.menu.chiudi', sezione: 'Menu', etichetta: 'Pulsante del menu sul telefono, aperto (lo leggono gli screen reader)', testo: 'Chiudi il menu' },

        { chiave: 'comune.piede.marchio', sezione: 'Piè di pagina', etichetta: 'Sotto il nome CRIA', testo: 'Centrale Rischi Immobiliare Affitti' },
        { chiave: 'comune.piede.descrizione', sezione: 'Piè di pagina', etichetta: 'Frase sotto il marchio', testo: "Lo storico dei pagamenti dell'affitto, riassunto in un semaforo sulla persona. Il proprietario lo consulta, l'inquilino lo vede sempre.", lungo: true },

        { chiave: 'comune.piede.perChiE.titolo', sezione: 'Piè di pagina · colonna Per chi è', etichetta: 'Titolo della colonna', testo: 'Per chi è' },
        { chiave: 'comune.piede.perChiE.proprietari', sezione: 'Piè di pagina · colonna Per chi è', etichetta: 'Link ai proprietari', testo: 'Per proprietari' },
        { chiave: 'comune.piede.perChiE.inquilini', sezione: 'Piè di pagina · colonna Per chi è', etichetta: 'Link agli inquilini', testo: 'Per inquilini' },
        { chiave: 'comune.piede.perChiE.agenzie', sezione: 'Piè di pagina · colonna Per chi è', etichetta: 'Link alle agenzie (dopo il link alla verifica, che è il nome del prodotto)', testo: '{nomeProdotto} · contattaci' },

        { chiave: 'comune.piede.risorse.titolo', sezione: 'Piè di pagina · colonna Risorse', etichetta: 'Titolo della colonna', testo: 'Risorse' },
        { chiave: 'comune.piede.risorse.comeFunziona', sezione: 'Piè di pagina · colonna Risorse', etichetta: 'Link a Come funziona', testo: 'Come funziona' },
        { chiave: 'comune.piede.risorse.verificaCertificato', sezione: 'Piè di pagina · colonna Risorse', etichetta: 'Link alla verifica di un certificato', testo: 'Verifica un certificato' },
        { chiave: 'comune.piede.risorse.supporto', sezione: 'Piè di pagina · colonna Risorse', etichetta: 'Link al supporto', testo: 'Supporto' },
        { chiave: 'comune.piede.risorse.inizia', sezione: 'Piè di pagina · colonna Risorse', etichetta: 'Link a Inizia', testo: 'Inizia' },

        { chiave: 'comune.piede.account.titolo', sezione: 'Piè di pagina · colonna Account', etichetta: 'Titolo della colonna', testo: 'Account' },
        { chiave: 'comune.piede.account.accedi', sezione: 'Piè di pagina · colonna Account', etichetta: 'Link per accedere', testo: 'Accedi' },
        { chiave: 'comune.piede.account.registrati', sezione: 'Piè di pagina · colonna Account', etichetta: 'Link per registrarsi', testo: 'Registrati' },

        { chiave: 'comune.piede.legali.titolo', sezione: 'Piè di pagina · colonna Legali', etichetta: 'Titolo della colonna', testo: 'Legali' },
        { chiave: 'comune.piede.legali.privacy', sezione: 'Piè di pagina · colonna Legali', etichetta: 'Link alla privacy', testo: 'Privacy' },
        { chiave: 'comune.piede.legali.termini', sezione: 'Piè di pagina · colonna Legali', etichetta: 'Link ai termini', testo: 'Termini' },
        { chiave: 'comune.piede.legali.cookie', sezione: 'Piè di pagina · colonna Legali', etichetta: 'Link ai cookie', testo: 'Cookie' },

        { chiave: 'comune.piede.copyright', sezione: 'Piè di pagina · riga in fondo', etichetta: 'Copyright', testo: '© 2026 CRIA — Centrale Rischi Immobiliare Affitti · Tutti i diritti riservati' },
        { chiave: 'comune.piede.partitaIva', sezione: 'Piè di pagina · riga in fondo', etichetta: 'Partita IVA, dopo il copyright (quella di oggi è un segnaposto)', testo: 'P.IVA 12345678901' },
        { chiave: 'comune.piede.madeIn', sezione: 'Piè di pagina · riga in fondo', etichetta: 'A destra, prima parte', testo: 'Made in' },
        { chiave: 'comune.piede.italia', sezione: 'Piè di pagina · riga in fondo', etichetta: 'A destra, seconda parte', testo: 'Italia 🇮🇹' },
    ],
};
