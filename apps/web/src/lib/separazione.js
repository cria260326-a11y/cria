import { FUNZIONI, nomeOperatore, trovaOperatore } from '@/data/operatori';

// ═════════════════════════════════════════════════════════════════════════════
// SEPARAZIONE DEI COMPITI (§13.4) — chi dispone non autorizza, chi propone non
// approva. Ogni azione sensibile passa di qui: dice se l'operatore può farla e,
// se no, perché e chi può.
//
// Nei mockup il controllo sta nell'interfaccia. In piattaforma i due campi
// diversi (disposto_da ≠ autorizzato_da, proposto_da ≠ approvato_da) sono un
// CHECK del database, non una validazione React (§14.3).
// ═════════════════════════════════════════════════════════════════════════════

// La matrice delle incompatibilità, da mostrare così com'è.
export const INCOMPATIBILITA = [
    { coppia: 'Acquisire un cliente e deliberarne l’istruttoria', perche: 'Il commerciale è pagato a provvigione: se delibera lui, il filtro non esiste' },
    { coppia: 'Proporre un piano di rientro e approvarlo', perche: 'L’approvazione del responsabile legale è il controllo sul credito' },
    { coppia: 'Disporre un pagamento e autorizzarlo', perche: 'Regola base della tesoreria' },
    { coppia: 'Rettificare un semaforo e averlo generato', perche: 'Il semaforo è l’asset: si corregge solo con una contestazione istruita, con prova e doppia firma' },
];

// Tutte le funzioni che lavorano sui casi: fuori restano direzione, DPO e prodotto.
const OPERATIVE = ['responsabile_operativo', 'istruttoria', 'incassi', 'assistenza', 'gestore_pratica', 'indennizzi', 'tesoreria', 'resp_amministrativo', 'resp_legale'];

/**
 * Le azioni sensibili.
 *   funzioni   chi può farla
 *   diversoDa  campi del record che contengono operatori che NON possono farla
 *   chiPuo     facoltativo: come dire a chi spetta, quando l'elenco sarebbe troppo lungo
 */
export const AZIONI = {
    delibera_istruttoria: {
        etichetta: 'Deliberare l’istruttoria',
        funzioni: ['istruttoria'],
        diversoDa: ['acquisitoDa'],
        incompatibilita: 'Chi ha acquisito il cliente non ne delibera l’istruttoria',
    },
    proponi_piano: {
        etichetta: 'Proporre un piano di rientro',
        funzioni: ['gestore_pratica'],
        diversoDa: [],
    },
    approva_piano: {
        etichetta: 'Approvare il piano di rientro',
        funzioni: ['resp_legale'],
        diversoDa: ['propostoDa'],
        incompatibilita: 'Chi propone un piano di rientro non lo approva',
    },
    disponi_pagamento: {
        etichetta: 'Disporre il pagamento',
        funzioni: ['tesoreria', 'indennizzi'],
        diversoDa: [],
    },
    autorizza_pagamento: {
        etichetta: 'Autorizzare il pagamento',
        funzioni: ['resp_amministrativo'],
        diversoDa: ['dispostoDa'],
        incompatibilita: 'Chi dispone un pagamento non lo autorizza',
    },
    prima_firma_rettifica: {
        etichetta: 'Proporre la rettifica del semaforo (prima firma)',
        funzioni: ['assistenza'],
        diversoDa: ['generatoDa'],
        incompatibilita: 'Chi ha generato il dato non lo rettifica',
    },
    seconda_firma_rettifica: {
        etichetta: 'Confermare la rettifica (seconda firma)',
        funzioni: ['responsabile_operativo', 'resp_legale'],
        diversoDa: ['primaFirmaDa', 'generatoDa'],
        incompatibilita: 'La seconda firma è di una persona diversa dalla prima, e da chi ha generato il dato',
    },
    proroga_fuori_lista: {
        etichetta: 'Concedere una proroga fuori lista',
        funzioni: ['responsabile_operativo', 'resp_amministrativo', 'resp_legale', 'resp_prodotto'],
        diversoDa: [],
    },
    modifica_listino: {
        etichetta: 'Aggiungere e cambiare i prodotti e i parametri del ciclo',
        funzioni: ['resp_prodotto'],
        diversoDa: [],
    },

    // Anagrafica (O-02…O-06). Due anagrafiche della stessa persona non si
    // uniscono: si sente il cliente e si crea un utente nuovo. Creare un utente
    // da CRIA è un'eccezione alla regola per cui i clienti si registrano da soli
    // (§13.4: un operatore potrebbe inventare un proprietario): lo prepara un
    // operatore e lo conferma un responsabile diverso — una quinta
    // incompatibilità, oltre alle quattro del §13.4.
    segnala_doppione: { etichetta: 'Segnalare un possibile doppione', funzioni: OPERATIVE, chiPuo: 'tutte le funzioni operative', diversoDa: [] },
    separa_anagrafiche: { etichetta: 'Dichiarare che sono soggetti diversi', funzioni: ['istruttoria', 'assistenza', 'responsabile_operativo'], diversoDa: [] },
    risolvi_doppione: { etichetta: 'Segnare risolto un possibile doppione', funzioni: ['istruttoria', 'assistenza', 'responsabile_operativo'], diversoDa: [] },
    prepara_utente: { etichetta: 'Preparare un utente creato da CRIA', funzioni: ['istruttoria', 'assistenza', 'responsabile_operativo'], diversoDa: [] },
    conferma_utente: {
        etichetta: 'Confermare o respingere un utente preparato',
        funzioni: ['responsabile_operativo', 'resp_amministrativo', 'resp_legale'],
        diversoDa: ['preparatoDa'],
        incompatibilita: 'Chi prepara l’utente non lo conferma',
    },
    chiedi_codice: { etichetta: 'Chiedere il codice fiscale definitivo', funzioni: ['istruttoria', 'assistenza'], diversoDa: [] },
    registra_codice: { etichetta: 'Registrare il codice fiscale definitivo', funzioni: ['istruttoria'], diversoDa: [] },
    chiedi_ricevuta: { etichetta: 'Chiedere la ricevuta al proprietario', funzioni: ['istruttoria', 'assistenza'], diversoDa: [] },
    inserisci_estremi: { etichetta: 'Inserire gli estremi di registrazione', funzioni: ['istruttoria'], diversoDa: [] },
    invita: { etichetta: 'Invitare ad attivare l’account', funzioni: ['assistenza', 'istruttoria'], diversoDa: [] },
};

const elencoNomi = (nomi) => (nomi.length <= 1 ? nomi.join('') : `${nomi.slice(0, -1).join(', ')} o ${nomi[nomi.length - 1]}`);

/**
 * @param {keyof AZIONI} azione
 * @param {{ operatoreId: string, record?: object }} contesto
 * @returns {{ consentito: boolean, motivo: string | null, chiPuo: string }}
 */
export const verificaAzione = (azione, { operatoreId, record = {} }) => {
    const a = AZIONI[azione];
    if (!a) throw new Error(`separazione: azione sconosciuta ${azione}`);
    const operatore = trovaOperatore(operatoreId);
    const chiPuo = a.chiPuo || elencoNomi(a.funzioni.map(f => FUNZIONI[f].etichetta.toLowerCase()));

    // L'admin ha accesso completo: fa quello che fa ogni funzione. Le regole
    // «persona diversa da» qui sotto valgono anche per lui.
    if (!operatore || !(operatore.funzione === 'admin' || a.funzioni.includes(operatore.funzione))) {
        return { consentito: false, motivo: `${a.etichetta} spetta a: ${chiPuo}.`, chiPuo };
    }
    const campo = a.diversoDa.find(c => {
        const v = record[c];
        return Array.isArray(v) ? v.includes(operatoreId) : v === operatoreId;
    });
    if (campo) {
        return { consentito: false, motivo: `${a.incompatibilita}: qui è ${nomeOperatore(operatoreId)}.`, chiPuo };
    }
    return { consentito: true, motivo: null, chiPuo };
};
