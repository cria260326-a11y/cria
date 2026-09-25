// ═════════════════════════════════════════════════════════════════════════════
// FAQ — una fonte sola
// Le legge la pagina pubblica /supporto e le modifica l'editor admin
// (pages/Admin/FaqAdminPage.jsx). Forma dei record da non cambiare:
//   FAQ       { id, categoriaId, domanda, risposta, ordine, attiva, pagine? }
// `pagine` dice su quali pagine della vetrina la domanda compare anche, oltre
// che in /supporto (PAGINE_FAQ in lib/faqDemo.js).
//   categoria { id, nome, ordine, attiva }
// Prezzi, percentuali, franchigie e giorni arrivano dal catalogo, così una FAQ
// non può dire un numero diverso dal listino.
// ═════════════════════════════════════════════════════════════════════════════

import { PRODOTTI, PARAMETRI, nomeProdotto, prezzoProdotto, fmtEuro } from '@/data/catalogo';
import { SEMAFORO, MESI_SEMAFORO } from '@/lib/semaforo';

const mesi = (n) => `${n} ${n === 1 ? 'mese' : 'mesi'}`;
const P = PRODOTTI;
const G = PARAMETRI;
const minuscola = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const stato = (k) => `${SEMAFORO[k].etichetta}: ${minuscola(SEMAFORO[k].spiegazione)}.`;

export const CATEGORIE_INIZIALI = [
    { id: 1, nome: 'Domande generali', ordine: 1, attiva: true },
    { id: 2, nome: 'Iscrizione e documenti', ordine: 2, attiva: true },
    { id: 3, nome: 'Per proprietari', ordine: 3, attiva: true },
    { id: 4, nome: 'Il semaforo', ordine: 4, attiva: true },
    { id: 5, nome: 'Contestazioni', ordine: 5, attiva: true },
    { id: 6, nome: 'CRIA Verifica', ordine: 6, attiva: true },
    { id: 7, nome: 'Per inquilini', ordine: 7, attiva: true },
    { id: 8, nome: 'I tuoi dati', ordine: 8, attiva: true },
];

export const FAQ_INIZIALI = [
    // ─── Domande generali ────────────────────────────────────────────────────
    {
        id: 1, categoriaId: 1, ordine: 1, attiva: true,
        domanda: "Cos'è CRIA?",
        risposta: `CRIA — Centrale Rischi Immobiliare Affitti — registra come vengono pagati gli affitti. Da questi dati nasce il semaforo dell'inquilino: il giorno del mese in cui paga, in media. Attorno al semaforo ci sono i servizi per il proprietario che vuole coprirsi, per chi sta valutando un candidato, per l'inquilino che vuole il proprio certificato e per le agenzie immobiliari.`,
    },
    {
        id: 2, categoriaId: 1, ordine: 2, attiva: true,
        domanda: 'Quali sono i prodotti e quanto costano?',
        risposta: `Per il proprietario, sul contratto: ${nomeProdotto('P1')} (${prezzoProdotto('P1')}), ${nomeProdotto('P1E')} (${prezzoProdotto('P1E')}), ${nomeProdotto('P2')} (${prezzoProdotto('P2')}) e ${nomeProdotto('P5')} (${prezzoProdotto('P5')}). Per chi valuta un candidato: ${nomeProdotto('P3')}, ${prezzoProdotto('P3')}. Per l'inquilino: il certificato è gratuito con un contratto CRIA attivo, oppure costa ${fmtEuro(P.P7.prezzo)} su autocandidatura. Per le agenzie: ${nomeProdotto('P6')}, abbonamento mensile con prezzo in definizione.`,
    },
    {
        id: 3, categoriaId: 1, ordine: 3, attiva: true,
        domanda: 'Devo chiedere un preventivo?',
        risposta: "No. Il prezzo viene dal listino e dal canone che dichiari sul contratto: lo vedi subito, non c'è un preventivo da chiedere né da aspettare.",
    },
    {
        id: 4, categoriaId: 1, ordine: 4, attiva: true,
        domanda: "Sono un'agenzia immobiliare: cosa posso usare?",
        risposta: `${nomeProdotto('P6')}: un abbonamento mensile per interrogare il database mentre selezioni i candidati dei tuoi annunci. Il prezzo è in definizione: per saperne di più scrivici a info@cri-affitti.it.`,
    },

    // ─── Iscrizione e documenti ──────────────────────────────────────────────
    {
        id: 5, categoriaId: 2, ordine: 1, attiva: true,
        domanda: 'Come mi registro?',
        risposta: "Ti registri come persona fisica o come società, con email oppure con Google. In entrambi i casi carichi il tuo documento d'identità e una persona del team CRIA verifica che sia davvero tu.",
    },
    {
        id: 6, categoriaId: 2, ordine: 2, attiva: true,
        domanda: 'Posso essere sia proprietario sia inquilino?',
        risposta: 'Sì, con lo stesso account. Entri come proprietario o come inquilino e passi da un ruolo all’altro dal selettore di contesto, senza un secondo account.',
    },
    {
        id: 7, categoriaId: 2, ordine: 3, attiva: true,
        domanda: 'Chi carica i documenti del candidato inquilino, e chi li vede?',
        risposta: "Ognuno carica i propri. Il candidato riceve un link personale, legge l'informativa, dà il consenso e carica i suoi documenti. Il proprietario vede quali documenti mancano, non i documenti.",
    },
    {
        id: 8, categoriaId: 2, ordine: 4, attiva: true,
        domanda: "Devo caricare l'estratto conto intero?",
        risposta: `No. Servono solo i movimenti con cui è stato pagato il canone negli ultimi ${MESI_SEMAFORO} mesi, non l'estratto conto completo.`,
    },
    {
        id: 9, categoriaId: 2, ordine: 5, attiva: true,
        domanda: 'Come si firma il contratto? Lo registra CRIA?',
        risposta: "Il contratto si firma elettronicamente dentro la piattaforma. CRIA non registra il contratto di locazione: ne riceve gli estremi di registrazione.",
    },

    // ─── Per proprietari ─────────────────────────────────────────────────────
    {
        id: 10, categoriaId: 3, ordine: 1, attiva: true,
        domanda: `Che differenza c'è tra ${P.P1.nome}, ${P.P2.nome} e ${P.P5.nome}?`,
        risposta: `${nomeProdotto('P1')}: ${prezzoProdotto('P1')}, con garanzia e franchigia di ${mesi(P.P1.franchigiaMesi)}; incassi tu il canone e ogni mese segnali se è arrivato. ${nomeProdotto('P1E')}: lo stesso per un contratto già in corso, ${prezzoProdotto('P1E')}, franchigia di ${mesi(P.P1E.franchigiaMesi)}. ${nomeProdotto('P2')}: ${prezzoProdotto('P2')}, con garanzia e franchigia di ${mesi(P.P2.franchigiaMesi)}; CRIA incassa il canone dall'inquilino e te lo bonifica, tu non segnali nulla. ${nomeProdotto('P5')}: ${prezzoProdotto('P5')}, senza garanzia; segnali i pagamenti e costruisci lo storico dell'inquilino.`,
    },
    {
        id: 11, categoriaId: 3, ordine: 2, attiva: true,
        domanda: 'Ho più immobili: devo scegliere un solo prodotto?',
        risposta: 'No. Il prodotto sta sul contratto, non sul tuo account: puoi avere un immobile con un prodotto e un altro con un prodotto diverso.',
    },
    {
        id: 12, categoriaId: 3, ordine: 3, attiva: true,
        domanda: 'Come funziona la segnalazione mensile?',
        risposta: `Il canone scade il giorno ${G.giornoScadenzaCanone}. Prima che la finestra si chiuda ricevi tre promemoria — ${G.solleciti.join(', ')} — per notifica, email e SMS, con una sola domanda: il canone è arrivato? Sì o no. Con ${nomeProdotto('P2')} non devi segnalare nulla: incassa CRIA e lo sa già.`,
    },
    {
        id: 13, categoriaId: 3, ordine: 4, attiva: true,
        domanda: 'Cosa succede se segnalo in ritardo o non segnalo?',
        risposta: `Se segnali il mancato pagamento entro ${G.giorniFinestraCopertura} giorni di calendario dalla scadenza, la copertura è attiva e la pratica di morosità parte subito. Se lo segnali dopo, per l'inquilino il mese conta comunque come non pagato, perché è la verità, ma la copertura di quel mese decade. Se entro il giorno ${G.giornoChiusuraMese} non arriva nessuna segnalazione, il mese diventa non rilevato: non conta nel semaforo e non è coperto. La copertura riprende dal primo mese segnalato correttamente.`,
    },
    {
        id: 14, categoriaId: 3, ordine: 5, attiva: true,
        domanda: "Cosa succede se l'inquilino non paga?",
        risposta: `Con ${P.P1.nome} e ${P.P2.nome} si apre la pratica di morosità e parte il recupero: prima un piano di rientro con l'inquilino, poi l'avvocato se serve; con la garanzia CRIA indennizza il proprietario. Se la copertura di quel mese è decaduta, la pratica si apre lo stesso: non coperto non vuol dire non gestito. Con ${nomeProdotto('P5')} non c'è copertura: il mancato pagamento vale per il semaforo dell'inquilino.`,
    },

    // ─── Il semaforo ─────────────────────────────────────────────────────────
    {
        id: 15, categoriaId: 4, ordine: 1, attiva: true,
        domanda: 'Come si calcola il semaforo?',
        risposta: `È la media del giorno del mese in cui il canone è stato pagato, negli ultimi ${MESI_SEMAFORO} mesi. Si calcola sulla persona, su tutti i suoi contratti di affitto, non su un contratto solo. ${stato('verde')} ${stato('giallo')} ${stato('rosso')}`,
    },
    {
        id: 16, categoriaId: 4, ordine: 2, attiva: true,
        domanda: 'Cosa vuol dire «Storico insufficiente»?',
        risposta: `${SEMAFORO.storico_insufficiente.spiegazione}. Finché i mesi rilevati non bastano, il semaforo non è né verde né giallo né rosso.`,
    },
    {
        id: 17, categoriaId: 4, ordine: 3, attiva: true,
        domanda: 'Cos\'è un mese «non rilevato»?',
        risposta: `È un mese che nessuno ha segnalato entro il giorno ${G.giornoChiusuraMese}. Non si sa cosa sia successo, quindi pesa zero: né a favore né contro l'inquilino.`,
    },
    {
        id: 18, categoriaId: 4, ordine: 4, attiva: true,
        domanda: "L'inquilino vede il proprio semaforo?",
        risposta: "Sempre, insieme alla spiegazione di come è costruito.",
    },
    {
        id: 19, categoriaId: 4, ordine: 5, attiva: true,
        domanda: 'Qualcuno in CRIA può cambiare un semaforo?',
        risposta: "No. Nessuno in CRIA può modificare un semaforo a mano. L'unica cosa che può correggerlo è una contestazione istruita.",
    },

    // ─── Contestazioni ───────────────────────────────────────────────────────
    {
        id: 20, categoriaId: 5, ordine: 1, attiva: true,
        domanda: 'Chi può contestare una segnalazione, e fino a quando?',
        risposta: `Solo l'inquilino, e solo una segnalazione di canone non pagato. Ha ${G.giorniContestazione} giorni dalla segnalazione e deve allegare una prova, per esempio la ricevuta del bonifico.`,
    },
    {
        id: 21, categoriaId: 5, ordine: 2, attiva: true,
        domanda: 'Chi decide, e in quanto tempo?',
        risposta: `Decide CRIA, sulle prove di entrambe le parti, e risponde entro ${G.giorniRispostaContestazione} giorni. Finché la contestazione è aperta, quel mese non conta nel semaforo.`,
    },

    // ─── CRIA Verifica ───────────────────────────────────────────────────────
    {
        id: 22, categoriaId: 6, ordine: 1, attiva: true,
        domanda: `Come funziona ${nomeProdotto('P3')}?`,
        risposta: `È per chi sta per affittare. Serve un account con i dati di fatturazione completi. Inserisci nome, cognome, data e luogo di nascita e codice fiscale del candidato e paghi ${fmtEuro(P.P3.prezzo)}. Il risultato arriva entro ${P.P3.oreEsito} ore.`,
    },
    {
        id: 23, categoriaId: 6, ordine: 2, attiva: true,
        domanda: 'Dove vedo il risultato?',
        risposta: "Dentro la piattaforma. L'email ti avvisa soltanto che il risultato è pronto e ti chiede di accedere: non contiene l'esito e non c'è nessun PDF.",
    },
    {
        id: 24, categoriaId: 6, ordine: 3, attiva: true,
        domanda: 'Cosa posso ricevere?',
        risposta: "Il semaforo del candidato con una breve sintesi, oppure «non abbiamo informazioni in merito» se CRIA non ha dati su quella persona.",
    },
    {
        id: 25, categoriaId: 6, ordine: 4, attiva: true,
        domanda: `I ${fmtEuro(P.P3.prezzo)} della verifica si recuperano?`,
        risposta: `Sì: si scalano dal primo prodotto che acquisti entro ${P.P3.scalabileEntroGiorni} giorni, sullo stesso account che ha fatto l'interrogazione. Si scala una sola interrogazione per acquisto.`,
    },
    {
        id: 26, categoriaId: 6, ordine: 5, attiva: true,
        domanda: 'Cosa vedo di un candidato, e cosa di un mio inquilino?',
        risposta: "Su un'interrogazione vedi solo il semaforo e la sintesi. Sul tuo contratto, con il tuo inquilino, vedi tutto.",
    },

    // ─── Per inquilini ───────────────────────────────────────────────────────
    {
        id: 27, categoriaId: 7, ordine: 1, attiva: true,
        domanda: 'Quanto costa il certificato?',
        risposta: `È gratuito se hai un contratto CRIA attivo. Se non hai storico su CRIA puoi chiederlo su autocandidatura, a ${fmtEuro(P.P7.prezzo)}.`,
    },
    {
        id: 28, categoriaId: 7, ordine: 2, attiva: true,
        domanda: 'Cosa certifica, e quanto dura?',
        risposta: `Certifica un periodo, non un istante: «dal … al …, semaforo …». Vale ${G.mesiValiditaCertificato} mesi dall'emissione, poi si rigenera con i dati aggiornati. Ha un QR e un codice univoco, il codice fiscale è mascherato e dichiara da dove viene il dato: «Rilevato da CRIA» oppure «Verificato su documentazione fornita dall'interessato».`,
    },
    {
        id: 29, categoriaId: 7, ordine: 3, attiva: true,
        domanda: 'Come si verifica un certificato?',
        risposta: "Gratis, su una pagina pubblica, senza registrarsi. La verifica dice se il certificato è autentico, il periodo e il valore certificati, la data di emissione e la validità, e se dopo l'emissione il semaforo è peggiorato (senza dire di quanto).",
    },
    {
        id: 30, categoriaId: 7, ordine: 4, attiva: true,
        domanda: 'Chi può vedere il mio certificato?',
        risposta: "Chi riceve da te il codice: consegnarlo è il tuo consenso. Puoi revocare un codice quando vuoi e vedi quante volte è stato verificato, non da chi.",
    },
    {
        id: 31, categoriaId: 7, ordine: 5, attiva: true,
        domanda: 'Non ho storico su CRIA: posso avere un certificato?',
        risposta: `Sì, con l'autocandidatura (${fmtEuro(P.P7.prezzo)}): porti tu la documentazione e CRIA la istruisce. Servono almeno due prove forti e indipendenti che coprano almeno ${MESI_SEMAFORO} mesi: i movimenti bancari filtrati sui pagamenti del canone, la referenza del proprietario precedente confermata da CRIA con un link personale inviato al recapito del contratto, il contratto registrato con gli estremi di registrazione. Con meno di così il risultato è «Storico insufficiente».`,
    },
    {
        id: 32, categoriaId: 7, ordine: 6, attiva: true,
        domanda: 'E se il mio proprietario precedente non risponde?',
        risposta: "La richiesta di referenza parte solo se la chiedi tu. Se dopo tre tentativi il proprietario precedente non risponde, sul certificato compare «referenza richiesta, non riscontrata».",
    },

    // Le domande della pagina «Per inquilini»
    {
        id: 34, categoriaId: 7, ordine: 7, attiva: true, pagine: ['per-inquilini'],
        domanda: 'Quanto mi costa?',
        risposta: `Vedere il tuo semaforo e chiedere i tuoi dati è gratuito. Il certificato è gratuito se hai un contratto CRIA attivo; se su CRIA non hai storico, passi dall'autocandidatura, che costa ${fmtEuro(P.P7.prezzo)}.`,
    },
    {
        id: 35, categoriaId: 7, ordine: 8, attiva: true, pagine: ['per-inquilini'],
        domanda: 'Cambio casa: il semaforo mi segue?',
        risposta: `Sì. Il semaforo è calcolato su di te, su tutti i tuoi contratti d'affitto degli ultimi ${MESI_SEMAFORO} mesi, non sul singolo contratto.`,
    },
    {
        id: 36, categoriaId: 7, ordine: 9, attiva: true, pagine: ['per-inquilini'],
        domanda: 'Mi candido per una casa: cosa vede il proprietario?',
        risposta: `Se fa un'interrogazione su di te (${P.P3.nome}), vede solo il semaforo e una sintesi. Se ti chiede i documenti, li carichi tu da un link personale, con informativa e consenso: lui vede quali mancano, non i documenti. Dei movimenti bancari servono solo i pagamenti del canone degli ultimi ${MESI_SEMAFORO} mesi. Se poi firmate un contratto su CRIA, su quel contratto vede tutto.`,
    },
    {
        id: 37, categoriaId: 7, ordine: 10, attiva: true, pagine: ['per-inquilini'],
        domanda: 'Qualcuno in CRIA può cambiare il mio semaforo?',
        risposta: 'No. Nessuno può modificarlo a mano. Lo corregge solo una contestazione istruita, e finché è aperta il mese contestato resta fuori dal calcolo.',
    },
    {
        id: 38, categoriaId: 7, ordine: 11, attiva: true, pagine: ['per-inquilini'],
        domanda: 'Il proprietario non segnala i pagamenti. Mi penalizza?',
        risposta: `No. Se al giorno ${G.giornoChiusuraMese} nessuno ha segnalato il mese, diventa non rilevato e nel semaforo pesa zero. Se invece il proprietario segnala in ritardo un canone non pagato, quel mese conta come non pagato.`,
    },
    {
        id: 39, categoriaId: 7, ordine: 12, attiva: true, pagine: ['per-inquilini'],
        domanda: 'Come mi registro?',
        risposta: 'Come persona fisica o come società. L’identità la verifica una persona dal documento che carichi, anche se entri con Google. Con lo stesso account puoi essere inquilino e proprietario: passi dall’uno all’altro dal selettore del contesto.',
    },

    // Le domande della pagina «Verifica un inquilino»
    {
        id: 40, categoriaId: 6, ordine: 6, attiva: true, pagine: ['verifica'],
        domanda: 'Quanto costa?',
        risposta: `${fmtEuro(P.P3.prezzo)} a interrogazione. Se entro ${P.P3.scalabileEntroGiorni} giorni acquisti un prodotto CRIA con lo stesso account, li scaliamo dal primo prodotto: un'interrogazione per ogni acquisto.`,
    },
    {
        id: 41, categoriaId: 6, ordine: 7, attiva: true, pagine: ['verifica'],
        domanda: 'Cosa mi serve?',
        risposta: 'Un account con i dati di fatturazione completi. Del candidato servono nome, cognome, data e luogo di nascita e codice fiscale.',
    },
    {
        id: 42, categoriaId: 6, ordine: 8, attiva: true, pagine: ['verifica'],
        domanda: 'Mi arriva un PDF o un report per email?',
        risposta: `No. Entro ${P.P3.oreEsito} ore ti arriva un'email che ti dice solo di accedere: l'esito lo leggi in piattaforma.`,
    },
    {
        id: 43, categoriaId: 6, ordine: 9, attiva: true, pagine: ['verifica'],
        domanda: 'Cosa vuol dire «non abbiamo informazioni in merito»?',
        risposta: 'Che CRIA non ha dati di pagamento su quella persona. Non è un giudizio, né positivo né negativo. Il candidato può costruire il suo certificato con l’autocandidatura.',
    },
    {
        id: 44, categoriaId: 6, ordine: 10, attiva: true, pagine: ['verifica'],
        domanda: 'Vedo lo storico del candidato mese per mese?',
        risposta: 'Sull’interrogazione no: vedi il semaforo e la sintesi. Se firmi con lui un contratto su CRIA, su quel contratto vedi tutto.',
    },
    {
        id: 45, categoriaId: 6, ordine: 11, attiva: true, pagine: ['verifica'],
        domanda: 'E se il semaforo fosse sbagliato?',
        risposta: `Nessuno in CRIA lo cambia a mano. Se una segnalazione di mancato pagamento è sbagliata, l'inquilino la contesta con la prova entro ${G.giorniContestazione} giorni; CRIA decide sulle evidenze di entrambe le parti e, finché la contestazione è aperta, quel mese non conta.`,
    },

    // ─── I tuoi dati ─────────────────────────────────────────────────────────
    {
        id: 33, categoriaId: 8, ordine: 1, attiva: true,
        domanda: 'Posso vedere i dati che CRIA ha su di me?',
        risposta: "Sì, ed è gratuito: l'accesso ai propri dati è un diritto previsto dalla legge (art. 15 GDPR). Non serve acquistare un certificato per esercitarlo.",
    },
];
