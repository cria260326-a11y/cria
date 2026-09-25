// Testi della pagina Supporto (/supporto) — l'admin li cambia da Admin → Testi.
// Le domande frequenti e le loro categorie non sono qui: si cambiano da Admin → FAQ.
export default {
    id: 'supporto',
    nome: 'Supporto',
    percorso: '/supporto',
    ordine: 70,
    testi: [
        { chiave: 'supporto.meta.titolo', sezione: 'Motori di ricerca', etichetta: 'Titolo della scheda del browser', testo: 'Supporto e FAQ — CRIA' },
        { chiave: 'supporto.meta.descrizione', sezione: 'Motori di ricerca', etichetta: 'Descrizione per i motori di ricerca', testo: 'Le domande frequenti su CRIA: prodotti e prezzi, iscrizione, semaforo, segnalazione mensile, contestazioni, CRIA Verifica e certificato. Per parlare con noi, accedi o registrati.', lungo: true },

        { chiave: 'supporto.hero.occhiello', sezione: 'In alto', etichetta: 'Etichetta sopra il titolo', testo: 'Supporto' },
        { chiave: 'supporto.hero.titolo', sezione: 'In alto', etichetta: 'Titolo', testo: 'Siamo qui *per aiutarti.*' },
        { chiave: 'supporto.hero.sottotitolo', sezione: 'In alto', etichetta: 'Sottotitolo', testo: 'Qui sotto trovi le domande frequenti, divise per argomento. Per parlare direttamente con noi, accedi al tuo account: la chat nella tua area è il canale più veloce.', lungo: true },

        { chiave: 'supporto.faq.tutte', sezione: 'Domande frequenti', etichetta: 'Filtro che mostra tutte le domande (le altre categorie e le domande si cambiano da Admin → FAQ)', testo: 'Tutte' },
        { chiave: 'supporto.faq.nessuna', sezione: 'Domande frequenti', etichetta: 'Messaggio quando una categoria non ha domande', testo: 'Nessuna domanda in questa categoria.' },

        { chiave: 'supporto.contatti.occhiello', sezione: 'Vuoi parlare con noi?', etichetta: 'Occhiello', testo: 'Vuoi parlare con noi?' },
        { chiave: 'supporto.contatti.titolo', sezione: 'Vuoi parlare con noi?', etichetta: 'Titolo', testo: 'La chat nella tua area è il *canale più veloce.*' },
        { chiave: 'supporto.contatti.accedi.occhiello', sezione: 'Vuoi parlare con noi?', etichetta: 'Riquadro bianco · occhiello', testo: 'Sei già su CRIA?' },
        { chiave: 'supporto.contatti.accedi.titolo', sezione: 'Vuoi parlare con noi?', etichetta: 'Riquadro bianco · titolo', testo: 'Accedi e *scrivici in chat.*' },
        { chiave: 'supporto.contatti.accedi.testo', sezione: 'Vuoi parlare con noi?', etichetta: 'Riquadro bianco · testo', testo: 'La chat di assistenza è disponibile direttamente dalla tua area personale. Risposte rapide, contesto già caricato, tutto in un posto solo.', lungo: true },
        { chiave: 'supporto.contatti.accedi.pulsante', sezione: 'Vuoi parlare con noi?', etichetta: 'Riquadro bianco · pulsante', testo: 'Accedi al tuo account' },
        { chiave: 'supporto.contatti.registrati.occhiello', sezione: 'Vuoi parlare con noi?', etichetta: 'Riquadro blu · occhiello', testo: 'Non hai ancora un account?' },
        { chiave: 'supporto.contatti.registrati.titolo', sezione: 'Vuoi parlare con noi?', etichetta: 'Riquadro blu · titolo', testo: 'Registrati gratis e *scrivici da lì.*' },
        { chiave: 'supporto.contatti.registrati.testo', sezione: 'Vuoi parlare con noi?', etichetta: 'Riquadro blu · testo', testo: 'La registrazione è gratuita e non ti vincola a nulla. Una volta dentro, hai accesso alla chat di assistenza anche prima di scegliere un prodotto.', lungo: true },
        { chiave: 'supporto.contatti.registrati.pulsante', sezione: 'Vuoi parlare con noi?', etichetta: 'Riquadro blu · pulsante', testo: 'Registrati gratis' },
        { chiave: 'supporto.contatti.email.frase', sezione: 'Vuoi parlare con noi?', etichetta: 'Riga in fondo · frase prima dell’indirizzo', testo: 'Per richieste generali o informazioni:' },
        { chiave: 'supporto.contatti.email.indirizzo', sezione: 'Vuoi parlare con noi?', etichetta: 'Riga in fondo · indirizzo email (è anche il link che apre la posta)', testo: 'info@cri-affitti.it' },
    ],
};
