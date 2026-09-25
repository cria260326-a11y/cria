// Testi della pagina Inizia (/inizia) — pages/Vetrina/IniziaPagina.jsx.
// L'admin li cambia da Testi. Nomi e prezzi dei prodotti arrivano dal listino.
export default {
    id: 'inizia',
    nome: 'Inizia',
    percorso: '/inizia',
    ordine: 60,
    testi: [
        { chiave: 'inizia.meta.titolo', sezione: 'Scheda del browser e motori di ricerca', etichetta: 'Titolo della scheda', testo: 'Inizia ora — CRIA' },
        { chiave: 'inizia.meta.descrizione', sezione: 'Scheda del browser e motori di ricerca', etichetta: 'Descrizione per i motori di ricerca', testo: 'Quattro porte per entrare in CRIA: verificare un candidato inquilino, ottenere il tuo certificato da inquilino, mettere un prodotto sul tuo contratto da proprietario, lavorare come agenzia immobiliare.', lungo: true },

        // ─── In alto ───
        { chiave: 'inizia.hero.occhiello', sezione: 'In alto', etichetta: 'Scritta nel riquadro sopra il titolo', testo: 'Iniziamo' },
        { chiave: 'inizia.hero.titolo', sezione: 'In alto', etichetta: 'Titolo', testo: 'Una sola domanda\nper partire: *cosa ti serve?*' },
        { chiave: 'inizia.hero.sottotitolo', sezione: 'In alto', etichetta: 'Sottotitolo', testo: 'Su CRIA si entra da quattro porte, in base a chi sei e a cosa cerchi. Per ognuna trovi a chi è rivolta, cosa ottieni e quanto costa.', lungo: true },

        // ─── Le quattro porte ───
        { chiave: 'inizia.porte.quantoCosta', sezione: 'Le quattro porte', etichetta: 'Titoletto del riquadro dei prezzi, uguale in ogni porta', testo: 'Quanto costa' },

        { chiave: 'inizia.porta1.etichetta', sezione: 'Le quattro porte · porta 1', etichetta: 'Etichetta accanto all’icona', testo: 'Porta 1' },
        { chiave: 'inizia.porta1.titolo', sezione: 'Le quattro porte · porta 1', etichetta: 'Titolo', testo: 'Sto scegliendo un inquilino' },
        { chiave: 'inizia.porta1.sottotitolo', sezione: 'Le quattro porte · porta 1', etichetta: 'Per chi', testo: 'Per il proprietario che sta per affittare' },
        { chiave: 'inizia.porta1.testo', sezione: 'Le quattro porte · porta 1', etichetta: 'Testo (sotto, nome e prezzo vengono dal listino)', testo: 'Interroghi CRIA sul candidato. Dentro la piattaforma vedi il suo semaforo e una breve sintesi, oppure «non abbiamo informazioni in merito».', lungo: true },
        { chiave: 'inizia.porta1.punto1', sezione: 'Le quattro porte · porta 1', etichetta: 'Punto 1', testo: 'Esito entro {ore} ore, da leggere in piattaforma' },
        { chiave: 'inizia.porta1.punto2', sezione: 'Le quattro porte · porta 1', etichetta: 'Punto 2', testo: 'I {prezzo} si scalano dal primo prodotto acquistato entro {giorni} giorni, sullo stesso account' },
        { chiave: 'inizia.porta1.punto3', sezione: 'Le quattro porte · porta 1', etichetta: 'Punto 3', testo: 'Serve un account con i dati di fatturazione completati' },
        { chiave: 'inizia.porta1.pulsante', sezione: 'Le quattro porte · porta 1', etichetta: 'Pulsante', testo: 'Verifica un candidato' },

        { chiave: 'inizia.porta2.etichetta', sezione: 'Le quattro porte · porta 2', etichetta: 'Etichetta accanto all’icona', testo: 'Porta 2' },
        { chiave: 'inizia.porta2.titolo', sezione: 'Le quattro porte · porta 2', etichetta: 'Titolo', testo: 'Sono un inquilino e voglio il mio certificato' },
        { chiave: 'inizia.porta2.sottotitolo', sezione: 'Le quattro porte · porta 2', etichetta: 'Per chi', testo: 'Per dimostrare come paghi l’affitto' },
        { chiave: 'inizia.porta2.testo', sezione: 'Le quattro porte · porta 2', etichetta: 'Testo', testo: 'Un certificato che attesta il tuo semaforo su un periodo, con QR e codice unico. Chi lo riceve lo verifica gratis su una pagina pubblica.', lungo: true },
        { chiave: 'inizia.porta2.prezzo1.voce', sezione: 'Le quattro porte · porta 2', etichetta: 'Prezzo 1 · per chi', testo: 'Con un contratto CRIA attivo' },
        { chiave: 'inizia.porta2.prezzo1.prezzo', sezione: 'Le quattro porte · porta 2', etichetta: 'Prezzo 1 · quanto', testo: 'Gratis' },
        { chiave: 'inizia.porta2.prezzo2.voce', sezione: 'Le quattro porte · porta 2', etichetta: 'Prezzo 2 · per chi (il prezzo viene dal listino)', testo: '{nomeProdotto}, se non hai storico CRIA' },
        { chiave: 'inizia.porta2.punto1', sezione: 'Le quattro porte · porta 2', etichetta: 'Punto 1', testo: 'Vale {mesi} mesi, poi si rigenera con i dati aggiornati' },
        { chiave: 'inizia.porta2.punto2', sezione: 'Le quattro porte · porta 2', etichetta: 'Punto 2', testo: 'Senza storico CRIA porti tu la documentazione e CRIA la istruisce' },
        { chiave: 'inizia.porta2.punto3', sezione: 'Le quattro porte · porta 2', etichetta: 'Punto 3', testo: 'L’accesso ai tuoi dati è sempre gratuito, per legge (art. 15 GDPR)' },
        { chiave: 'inizia.porta2.pulsante', sezione: 'Le quattro porte · porta 2', etichetta: 'Pulsante', testo: 'Scopri il certificato' },

        { chiave: 'inizia.porta3.etichetta', sezione: 'Le quattro porte · porta 3', etichetta: 'Etichetta accanto all’icona', testo: 'Porta 3' },
        { chiave: 'inizia.porta3.titolo', sezione: 'Le quattro porte · porta 3', etichetta: 'Titolo', testo: 'Affitto un immobile e voglio la copertura' },
        { chiave: 'inizia.porta3.sottotitolo', sezione: 'Le quattro porte · porta 3', etichetta: 'Per chi', testo: 'Per il proprietario, contratto per contratto' },
        { chiave: 'inizia.porta3.testo', sezione: 'Le quattro porte · porta 3', etichetta: 'Testo (sotto, prodotti e prezzi vengono dal listino)', testo: 'Metti un prodotto su ogni contratto: con garanzia o solo segnalazione, incassi tu o incassa CRIA. Il prezzo viene dal listino e dal canone, senza preventivo.', lungo: true },
        { chiave: 'inizia.porta3.pulsante', sezione: 'Le quattro porte · porta 3', etichetta: 'Pulsante', testo: 'Scopri i prodotti' },
        { chiave: 'inizia.porta3.secondario', sezione: 'Le quattro porte · porta 3', etichetta: 'Link sotto il pulsante', testo: 'Oppure registrati' },

        { chiave: 'inizia.porta4.etichetta', sezione: 'Le quattro porte · porta 4', etichetta: 'Etichetta accanto all’icona', testo: 'Porta 4' },
        { chiave: 'inizia.porta4.titolo', sezione: 'Le quattro porte · porta 4', etichetta: 'Titolo', testo: 'Sono un’agenzia immobiliare' },
        { chiave: 'inizia.porta4.sottotitolo', sezione: 'Le quattro porte · porta 4', etichetta: 'Per chi (sotto, testo, nome e prezzo vengono dal listino)', testo: 'Per chi seleziona i candidati dei propri annunci' },
        { chiave: 'inizia.porta4.punto1', sezione: 'Le quattro porte · porta 4', etichetta: 'Punto 1', testo: 'Scrivici per sapere come funziona e a quali condizioni' },
        { chiave: 'inizia.porta4.pulsante', sezione: 'Le quattro porte · porta 4', etichetta: 'Pulsante', testo: 'Contattaci' },

        // ─── Cosa succede dopo ───
        { chiave: 'inizia.dopo.occhiello', sezione: 'Cosa succede dopo', etichetta: 'Occhiello', testo: 'Cosa succede dopo' },
        { chiave: 'inizia.dopo.titolo', sezione: 'Cosa succede dopo', etichetta: 'Titolo', testo: 'Un solo account, *qualunque porta scegli.*' },
        { chiave: 'inizia.dopo.passo1.titolo', sezione: 'Cosa succede dopo', etichetta: 'Scheda 1 · titolo', testo: 'Ti registri' },
        { chiave: 'inizia.dopo.passo1.testo', sezione: 'Cosa succede dopo', etichetta: 'Scheda 1 · testo', testo: 'Come persona fisica o come società. Puoi entrare anche con Google.' },
        { chiave: 'inizia.dopo.passo2.titolo', sezione: 'Cosa succede dopo', etichetta: 'Scheda 2 · titolo', testo: 'Una persona verifica chi sei' },
        { chiave: 'inizia.dopo.passo2.testo', sezione: 'Cosa succede dopo', etichetta: 'Scheda 2 · testo', testo: 'Carichi un documento d’identità e lo controlla una persona di CRIA, anche se sei entrato con Google.' },
        { chiave: 'inizia.dopo.passo3.titolo', sezione: 'Cosa succede dopo', etichetta: 'Scheda 3 · titolo', testo: 'Più ruoli, un account' },
        { chiave: 'inizia.dopo.passo3.testo', sezione: 'Cosa succede dopo', etichetta: 'Scheda 3 · testo', testo: 'Se sei proprietario e anche inquilino, passi da un ruolo all’altro dal selettore del contesto.' },

        // ─── Chiusura ───
        { chiave: 'inizia.dubbi.titolo', sezione: 'Chiusura', etichetta: 'Titolo', testo: 'Non sai *da quale porta entrare?*' },
        { chiave: 'inizia.dubbi.testo', sezione: 'Chiusura', etichetta: 'Testo', testo: 'Scrivici e ti aiutiamo a capire da dove partire.' },
        { chiave: 'inizia.dubbi.pulsante', sezione: 'Chiusura', etichetta: 'Pulsante', testo: 'Parla con noi' },
    ],
};
