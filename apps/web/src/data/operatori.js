// ═════════════════════════════════════════════════════════════════════════════
// OPERATORI INTERNI — SOLO PER I MOCKUP (lotto 5)
// Chi lavora dentro CRIA, per funzione. Il documento di stato ne descrive una
// quindicina (§13.4); qui ci sono quelle che servono all'operatività, con
// persone diverse dove il documento vuole che siano diverse: chi dispone non
// autorizza, chi propone non approva (§13.4, matrice delle incompatibilità).
//
// Ogni collega ha il suo account e la funzione
// sta nella tabella dei ruoli del database. L'account admin@cri-affitti.it è
// l'Amministratore: ha accesso completo, ma le regole «due persone diverse»
// valgono anche per lui (non autorizza quello che ha disposto lui).
// Chi crea le utenze e con quali permessi è il lotto 6.
// ═════════════════════════════════════════════════════════════════════════════

// livello: operatore · responsabile · direzione · controllo
export const FUNZIONI = {
    admin: {
        etichetta: 'Amministratore',
        livello: 'admin',
        cosaFa: 'Ha accesso completo: vede e fa quello che fa ogni funzione, e cambia i dati di tutti',
    },
    responsabile_operativo: {
        etichetta: 'Responsabile operativo',
        livello: 'responsabile',
        cosaFa: 'Coordina le code, assegna le pratiche, concede le proroghe fuori lista e mette la seconda firma sulle rettifiche',
    },
    istruttoria: {
        etichetta: 'Istruttoria',
        livello: 'operatore',
        cosaFa: 'Verifica i documenti delle pratiche assegnate e delibera, anche dissentendo dalla proposta',
    },
    incassi: {
        etichetta: 'Incassi',
        livello: 'operatore',
        cosaFa: 'Segue le segnalazioni del mese e riconcilia i bonifici in arrivo col codice del contratto',
    },
    assistenza: {
        etichetta: 'Assistenza e contestazioni',
        livello: 'operatore',
        cosaFa: 'Istruisce le contestazioni degli inquilini e risponde alle richieste',
    },
    gestore_pratica: {
        etichetta: 'Gestore delle morosità',
        livello: 'operatore',
        cosaFa: 'Contatta l’inquilino moroso, traccia ogni contatto e propone i piani di rientro',
    },
    indennizzi: {
        etichetta: 'Indennizzi',
        livello: 'operatore',
        cosaFa: 'Istruisce gli indennizzi dovuti ai proprietari e li dispone',
    },
    tesoreria: {
        etichetta: 'Tesoreria',
        livello: 'operatore',
        cosaFa: 'Dispone i bonifici in uscita: canoni girati, indennizzi, provvigioni',
    },
    resp_amministrativo: {
        etichetta: 'Responsabile amministrativa',
        livello: 'responsabile',
        cosaFa: 'Autorizza i pagamenti disposti da altri, tiene la contabilità e il rendiconto al riassicuratore',
    },
    resp_legale: {
        etichetta: 'Responsabile legale',
        livello: 'responsabile',
        cosaFa: 'Approva i piani di rientro proposti dai gestori e decide il passaggio al legale',
    },
    resp_prodotto: {
        etichetta: 'Responsabile prodotto',
        livello: 'responsabile',
        cosaFa: 'Tiene il listino e i parametri del ciclo mensile',
    },
    direzione: {
        etichetta: 'Direzione',
        livello: 'direzione',
        cosaFa: 'Legge solo dati aggregati, senza nomi. Il caso singolo lo apre su richiesta, come chiunque',
    },
    dpo: {
        etichetta: 'DPO',
        livello: 'controllo',
        cosaFa: 'Controlla chi accede a cosa: vede il registro degli accessi, non i dati',
    },
};

export const OPERATORI = [
    { id: 'luca', nome: 'Luca', cognome: 'Moretti', email: 'luca.moretti@cri-affitti.it', funzione: 'responsabile_operativo', responsabile: 'federica' },
    { id: 'valeria', nome: 'Valeria', cognome: 'Monti', email: 'valeria.monti@cri-affitti.it', funzione: 'istruttoria', responsabile: 'luca', lingue: ['italiano', 'inglese'] },
    { id: 'ettore', nome: 'Ettore', cognome: 'Marini', email: 'ettore.marini@cri-affitti.it', funzione: 'istruttoria', responsabile: 'luca', lingue: ['italiano', 'spagnolo'] },
    { id: 'irene', nome: 'Irene', cognome: 'Caputo', email: 'irene.caputo@cri-affitti.it', funzione: 'incassi', responsabile: 'silvia' },
    { id: 'nicola', nome: 'Nicola', cognome: 'Pace', email: 'nicola.pace@cri-affitti.it', funzione: 'assistenza', responsabile: 'luca' },
    { id: 'giorgio', nome: 'Giorgio', cognome: 'Fontana', email: 'giorgio.fontana@cri-affitti.it', funzione: 'gestore_pratica', responsabile: 'laura' },
    { id: 'beatrice', nome: 'Beatrice', cognome: 'Mancini', email: 'beatrice.mancini@cri-affitti.it', funzione: 'indennizzi', responsabile: 'silvia' },
    { id: 'alberto', nome: 'Alberto', cognome: 'Longo', email: 'alberto.longo@cri-affitti.it', funzione: 'tesoreria', responsabile: 'silvia' },
    { id: 'silvia', nome: 'Silvia', cognome: 'Barbieri', email: 'silvia.barbieri@cri-affitti.it', funzione: 'resp_amministrativo', responsabile: 'federica' },
    { id: 'laura', nome: 'Laura', cognome: 'Testa', titolo: 'Avv.', email: 'laura.testa@cri-affitti.it', funzione: 'resp_legale', responsabile: 'federica' },
    { id: 'matteo', nome: 'Matteo', cognome: 'Sala', email: 'matteo.sala@cri-affitti.it', funzione: 'resp_prodotto', responsabile: 'federica' },
    { id: 'federica', nome: 'Federica', cognome: 'Villa', email: 'federica.villa@cri-affitti.it', funzione: 'direzione', responsabile: null },
    { id: 'tommaso', nome: 'Tommaso', cognome: 'Pellegrini', email: 'tommaso.pellegrini@cri-affitti.it', funzione: 'dpo', responsabile: null },
];

// L'admin non è un collega fra gli altri: non compare negli elenchi per
// funzione, ma firma le sue azioni come chiunque.
export const AMMINISTRATORE = { id: 'admin', nome: 'Amministratore', cognome: 'CRIA', email: 'admin@cri-affitti.it', funzione: 'admin', responsabile: null };

export const trovaOperatore = (id) => (id === 'admin' ? AMMINISTRATORE : OPERATORI.find(o => o.id === id) || null);

export const nomeOperatore = (id) => {
    const o = trovaOperatore(id);
    return o ? `${o.titolo ? `${o.titolo} ` : ''}${o.nome} ${o.cognome}` : '—';
};

export const funzioneDi = (id) => FUNZIONI[trovaOperatore(id)?.funzione] || null;

export const operatoriConFunzione = (...funzioni) => OPERATORI.filter(o => funzioni.includes(o.funzione));

