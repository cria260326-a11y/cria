// Testi della pagina Verifica un inquilino (/verifica) — l'admin li cambia da Admin → Testi.
// Nome e prezzo di CRIA Verifica, ore dell'esito e giorni per scalare il costo non si
// scrivono qui: arrivano dal listino (data/catalogo.js) attraverso i segnaposto {…}.
// I colori del semaforo e le loro spiegazioni vengono da lib/semaforo.js; le domande
// frequenti da Admin → FAQ.
export default {
    id: 'verifica',
    nome: 'Verifica un inquilino',
    percorso: '/verifica',
    ordine: 50,
    testi: [
        { chiave: 'verifica.meta.titolo', sezione: 'Motori di ricerca', etichetta: 'Titolo della scheda del browser', testo: '{nomeProdotto} — CRIA' },
        { chiave: 'verifica.meta.descrizione', sezione: 'Motori di ricerca', etichetta: 'Descrizione per i motori di ricerca', testo: 'Prima di affittare: il semaforo del candidato inquilino con una sintesi, in piattaforma entro {ore} ore. {prezzo}, scalabili dal primo prodotto acquistato entro {giorni} giorni.', lungo: true },

        { chiave: 'verifica.nessunaInformazione', sezione: 'In più punti della pagina', etichetta: 'La risposta quando CRIA non ha dati sul candidato (compare in alto, nel riquadro «Oppure» e in «Cosa vedi»)', testo: 'Non abbiamo informazioni in merito' },

        { chiave: 'verifica.hero.occhiello', sezione: 'In alto', etichetta: 'Etichetta sopra il titolo', testo: '{nomeProdotto} · {prezzo}' },
        { chiave: 'verifica.hero.titolo', sezione: 'In alto', etichetta: 'Titolo', testo: 'Prima di affittare,\n*chiedi a CRIA.*' },
        { chiave: 'verifica.hero.sottotitolo', sezione: 'In alto', etichetta: 'Sottotitolo ({nessunaInformazione} è la risposta scritta sopra, con l’iniziale minuscola)', testo: 'Inserisci i dati del candidato inquilino. Entro {ore} ore trovi in piattaforma il suo semaforo con una breve sintesi, oppure la risposta «{nessunaInformazione}».', lungo: true },
        { chiave: 'verifica.hero.pulsanteRichiedi', sezione: 'In alto', etichetta: 'Pulsante principale', testo: 'Richiedi una verifica' },
        { chiave: 'verifica.hero.pulsanteRegistrati', sezione: 'In alto', etichetta: 'Pulsante secondario', testo: 'Non hai un account? Registrati' },
        { chiave: 'verifica.hero.punto1', sezione: 'In alto', etichetta: 'Sotto i pulsanti · punto 1', testo: 'Esito entro {ore} ore' },
        { chiave: 'verifica.hero.punto2', sezione: 'In alto', etichetta: 'Sotto i pulsanti · punto 2', testo: 'Lo leggi solo in piattaforma' },
        { chiave: 'verifica.hero.punto3', sezione: 'In alto', etichetta: 'Sotto i pulsanti · punto 3', testo: 'Scalabile entro {giorni} giorni' },

        { chiave: 'verifica.esempio.etichetta', sezione: 'In alto · l’esito in piattaforma (esempio)', etichetta: 'Etichetta in alto a destra', testo: 'Esempio' },
        { chiave: 'verifica.esempio.occhiello', sezione: 'In alto · l’esito in piattaforma (esempio)', etichetta: 'Occhiello', testo: 'Le mie interrogazioni' },
        { chiave: 'verifica.esempio.titolo', sezione: 'In alto · l’esito in piattaforma (esempio)', etichetta: 'Titolo', testo: 'Esito {nomeProdotto}' },
        { chiave: 'verifica.esempio.voceCandidato', sezione: 'In alto · l’esito in piattaforma (esempio)', etichetta: 'Voce «Candidato»', testo: 'Candidato' },
        { chiave: 'verifica.esempio.candidato', sezione: 'In alto · l’esito in piattaforma (esempio)', etichetta: 'Nome del candidato d’esempio', testo: 'Luca B.' },
        { chiave: 'verifica.esempio.voceCodiceFiscale', sezione: 'In alto · l’esito in piattaforma (esempio)', etichetta: 'Voce «Codice fiscale»', testo: 'Codice fiscale' },
        { chiave: 'verifica.esempio.codiceFiscale', sezione: 'In alto · l’esito in piattaforma (esempio)', etichetta: 'Codice fiscale d’esempio, coperto', testo: 'BNC••••••••••••Z' },
        { chiave: 'verifica.esempio.voceRichiesta', sezione: 'In alto · l’esito in piattaforma (esempio)', etichetta: 'Voce «Richiesta» (sotto, la data)', testo: 'Richiesta' },
        { chiave: 'verifica.esempio.voceEsito', sezione: 'In alto · l’esito in piattaforma (esempio)', etichetta: 'Voce «Esito» (sotto, la data)', testo: 'Esito' },
        { chiave: 'verifica.esempio.voceSintesi', sezione: 'In alto · l’esito in piattaforma (esempio)', etichetta: 'Voce «Sintesi» (sopra, il colore viene dal semaforo)', testo: 'Sintesi' },
        { chiave: 'verifica.esempio.sintesi', sezione: 'In alto · l’esito in piattaforma (esempio)', etichetta: 'Sintesi d’esempio', testo: 'Storico rilevato da CRIA negli ultimi {mesi} mesi. Paga in media il giorno 4, nessun mese non pagato.' },
        { chiave: 'verifica.esempio.nota', sezione: 'In alto · l’esito in piattaforma (esempio)', etichetta: 'Riga in fondo', testo: "Sull'interrogazione vedi semaforo e sintesi." },
        { chiave: 'verifica.esempio.email.occhiello', sezione: 'In alto · l’esito in piattaforma (esempio)', etichetta: 'Riquadro dell’email · occhiello', testo: 'Email da CRIA' },
        { chiave: 'verifica.esempio.email.testo', sezione: 'In alto · l’esito in piattaforma (esempio)', etichetta: 'Riquadro dell’email · testo', testo: "L'esito è pronto. Accedi per vederlo." },

        { chiave: 'verifica.esito.occhiello', sezione: 'Cosa ti restituisce', etichetta: 'Occhiello', testo: 'Cosa ti restituisce' },
        { chiave: 'verifica.esito.titolo', sezione: 'Cosa ti restituisce', etichetta: 'Titolo', testo: 'Il semaforo con una sintesi. *O la risposta che non sappiamo.*' },
        { chiave: 'verifica.esito.intro', sezione: 'Cosa ti restituisce', etichetta: 'Testo sotto il titolo (sotto, i quattro colori vengono dal semaforo)', testo: "Il semaforo è la media del giorno del mese in cui il candidato ha pagato il canone negli ultimi {mesi} mesi, calcolata sulla persona e su tutti i suoi contratti d'affitto. I mesi non rilevati pesano zero, quelli contestati restano fuori finché la contestazione non si chiude. Nessuno in CRIA può cambiare un semaforo a mano.", lungo: true },
        { chiave: 'verifica.esito.oppure', sezione: 'Cosa ti restituisce', etichetta: 'Riquadro tratteggiato · occhiello (il titolo è la risposta scritta in «In più punti della pagina»)', testo: 'Oppure' },
        { chiave: 'verifica.esito.oppureTesto', sezione: 'Cosa ti restituisce', etichetta: 'Riquadro tratteggiato · testo', testo: "CRIA non ha dati di pagamento su quella persona. Non è un giudizio, né in un senso né nell'altro." },

        { chiave: 'verifica.comeFunziona.occhiello', sezione: 'Come funziona', etichetta: 'Occhiello', testo: 'Come funziona' },
        { chiave: 'verifica.comeFunziona.titolo', sezione: 'Come funziona', etichetta: 'Titolo', testo: 'Tre passaggi, *tutti in piattaforma.*' },
        { chiave: 'verifica.comeFunziona.passo1.titolo', sezione: 'Come funziona', etichetta: 'Passo 1 · titolo', testo: 'Account con i dati di fatturazione' },
        { chiave: 'verifica.comeFunziona.passo1.testo', sezione: 'Come funziona', etichetta: 'Passo 1 · testo', testo: 'Ti registri come persona fisica o società e completi i dati di fatturazione: senza, l’interrogazione non parte. Come per ogni account, l’identità la verifica una persona dal documento che carichi.', lungo: true },
        { chiave: 'verifica.comeFunziona.passo2.titolo', sezione: 'Come funziona', etichetta: 'Passo 2 · titolo', testo: 'Inserisci il candidato' },
        { chiave: 'verifica.comeFunziona.passo2.testo', sezione: 'Come funziona', etichetta: 'Passo 2 · testo', testo: "Nome, cognome, data e luogo di nascita, codice fiscale. L'interrogazione costa {prezzo}." },
        { chiave: 'verifica.comeFunziona.passo3.titolo', sezione: 'Come funziona', etichetta: 'Passo 3 · titolo', testo: 'Entro {ore} ore, accedi' },
        { chiave: 'verifica.comeFunziona.passo3.testo', sezione: 'Come funziona', etichetta: 'Passo 3 · testo', testo: 'Ti mandiamo un’email che dice solo di accedere. L’esito lo leggi in piattaforma: niente PDF, niente report per email.' },

        { chiave: 'verifica.cosaVedi.occhiello', sezione: 'Cosa vedi', etichetta: 'Occhiello', testo: 'Cosa vedi' },
        { chiave: 'verifica.cosaVedi.titolo', sezione: 'Cosa vedi', etichetta: 'Titolo', testo: "Sull'interrogazione, semaforo e sintesi. *Sul tuo contratto, tutto.*" },
        { chiave: 'verifica.cosaVedi.intro', sezione: 'Cosa vedi', etichetta: 'Testo sotto il titolo', testo: "L'interrogazione ti mostra il semaforo del candidato e una sintesi. Se poi firmi con lui un contratto su CRIA, su quel contratto vedi tutto.", lungo: true },
        { chiave: 'verifica.cosaVedi.punto1', sezione: 'Cosa vedi', etichetta: 'Elenco · punto 1', testo: 'Nessun PDF, nessun report per email: l’esito resta in piattaforma' },
        { chiave: 'verifica.cosaVedi.punto2', sezione: 'Cosa vedi', etichetta: 'Elenco · punto 2 ({nessunaInformazione} è la risposta scritta in «In più punti della pagina», con l’iniziale minuscola)', testo: 'Se su di lui non abbiamo dati, te lo diciamo: «{nessunaInformazione}»' },
        { chiave: 'verifica.cosaVedi.punto3', sezione: 'Cosa vedi', etichetta: 'Elenco · punto 3', testo: 'Un contratto su CRIA si firma elettronicamente in piattaforma' },
        { chiave: 'verifica.cosaVedi.scalabile.titolo', sezione: 'Cosa vedi', etichetta: 'Riquadro bianco · titolo', testo: 'I {prezzo} si scalano' },
        { chiave: 'verifica.cosaVedi.scalabile.testo', sezione: 'Cosa vedi', etichetta: 'Riquadro bianco · testo', testo: "Se entro {giorni} giorni acquisti un prodotto CRIA con lo stesso account, il costo dell'interrogazione lo scaliamo dal primo prodotto. Vale un'interrogazione per ogni acquisto.", lungo: true },
        { chiave: 'verifica.cosaVedi.scalabile.listino', sezione: 'Cosa vedi', etichetta: 'Riquadro bianco · sopra l’elenco dei prodotti (nomi e prezzi vengono dal listino)', testo: 'I prodotti per proprietari, dal listino' },
        { chiave: 'verifica.cosaVedi.scalabile.link', sezione: 'Cosa vedi', etichetta: 'Riquadro bianco · link in fondo', testo: 'Cosa comprende ciascun prodotto' },

        { chiave: 'verifica.altriCasi.occhiello', sezione: 'Altri casi', etichetta: 'Occhiello', testo: 'Altri casi' },
        { chiave: 'verifica.altriCasi.titolo', sezione: 'Altri casi', etichetta: 'Titolo', testo: "Quando l'interrogazione *non è l'unica strada.*" },
        { chiave: 'verifica.altriCasi.caso1.titolo', sezione: 'Altri casi', etichetta: 'Scheda 1 · titolo', testo: 'Il candidato ti dà un certificato CRIA' },
        { chiave: 'verifica.altriCasi.caso1.testo', sezione: 'Altri casi', etichetta: 'Scheda 1 · testo', testo: 'Verificarlo è gratis, su una pagina pubblica, senza registrazione. Vedi se è autentico, il periodo e il semaforo certificati, la data di emissione e la validità, e se dopo l’emissione il semaforo è peggiorato, senza sapere di quanto. Per il semaforo di oggi serve un’interrogazione.', lungo: true },
        { chiave: 'verifica.altriCasi.caso2.titolo', sezione: 'Altri casi', etichetta: 'Scheda 2 · titolo', testo: 'Il candidato non ha storico su CRIA' },
        { chiave: 'verifica.altriCasi.caso2.testo', sezione: 'Altri casi', etichetta: 'Scheda 2 · testo', testo: 'Può chiedere il certificato su autocandidatura ({prezzo}): porta la sua documentazione e CRIA la istruisce. Il certificato dichiara da dove viene il dato.', lungo: true },
        { chiave: 'verifica.altriCasi.caso2.link', sezione: 'Altri casi', etichetta: 'Scheda 2 · link', testo: 'La pagina per inquilini' },
        { chiave: 'verifica.altriCasi.caso3.titolo', sezione: 'Altri casi', etichetta: 'Scheda 3 · titolo', testo: 'Sei un’agenzia immobiliare' },
        { chiave: 'verifica.altriCasi.caso3.testo', sezione: 'Altri casi', etichetta: 'Scheda 3 · testo (nome, prezzo e descrizione del prodotto vengono dal listino)', testo: '{nomeProdotto}: {prezzo}. {sintesi}' },
        { chiave: 'verifica.altriCasi.caso3.link', sezione: 'Altri casi', etichetta: 'Scheda 3 · link', testo: 'Scrivici' },

        { chiave: 'verifica.faq.occhiello', sezione: 'Domande frequenti', etichetta: 'Occhiello (le domande e le risposte si cambiano da Admin → FAQ)', testo: 'Domande frequenti' },
        { chiave: 'verifica.faq.titolo', sezione: 'Domande frequenti', etichetta: 'Titolo', testo: 'Le risposte alle *domande più comuni.*' },

        { chiave: 'verifica.chiusura.occhiello', sezione: 'Chiusura', etichetta: 'Occhiello', testo: 'Prima di firmare' },
        { chiave: 'verifica.chiusura.titolo', sezione: 'Chiusura', etichetta: 'Titolo', testo: "Un'interrogazione. *L'esito entro {ore} ore.*" },
        { chiave: 'verifica.chiusura.testo', sezione: 'Chiusura', etichetta: 'Testo sotto il titolo', testo: 'Serve un account con i dati di fatturazione completi. Poi inserisci il candidato e paghi {prezzo}, che si scalano dal primo prodotto acquistato entro {giorni} giorni.', lungo: true },
        { chiave: 'verifica.chiusura.pulsanteRichiedi', sezione: 'Chiusura', etichetta: 'Pulsante principale', testo: 'Richiedi una verifica' },
        { chiave: 'verifica.chiusura.pulsanteRegistrati', sezione: 'Chiusura', etichetta: 'Pulsante secondario', testo: 'Registrati' },
        { chiave: 'verifica.chiusura.dubbi', sezione: 'Chiusura', etichetta: 'Frase accanto ai pulsanti', testo: 'Hai dubbi?' },
        { chiave: 'verifica.chiusura.scrivici', sezione: 'Chiusura', etichetta: 'Link dopo la frase', testo: 'Scrivici' },
    ],
};
