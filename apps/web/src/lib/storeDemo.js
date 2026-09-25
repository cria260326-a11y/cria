import { useEffect, useState } from 'react';

// ═════════════════════════════════════════════════════════════════════════════
// STORE DEMO — il modo unico di tenere nel browser quello che nei mockup si fa
// e si deve ritrovare: una delibera, un bonifico autorizzato, una proroga.
// Stesso schema degli store dei lotti precedenti (praticheDemo, verificheDemo):
// localStorage, un evento per avvisare le pagine aperte, memoria come riserva
// quando lo storage non c'è. Ogni store ha la sua chiave e il suo «Ripristina».
//
// Fase 4: al posto dello store, le tabelle; al posto dell'evento, il realtime.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * @param {string} chiave   chiave di localStorage, es. 'criaIstruttoriaDemo'
 * @param {() => any} iniziale  lo stato quando non c'è niente di salvato
 */
export const creaStoreDemo = (chiave, iniziale) => {
    const evento = `cria-store:${chiave}`;
    let inMemoria = null;

    const leggi = () => {
        try {
            const grezzo = localStorage.getItem(chiave);
            if (grezzo != null) return JSON.parse(grezzo);
        } catch {
            // storage non disponibile o dato rovinato: si usa la memoria
        }
        return inMemoria ?? iniziale();
    };

    const scrivi = (stato) => {
        inMemoria = stato;
        try {
            localStorage.setItem(chiave, JSON.stringify(stato));
        } catch {
            // resta in memoria
        }
        window.dispatchEvent(new Event(evento));
        return stato;
    };

    const aggiorna = (fn) => scrivi(fn(leggi()));

    const ripristina = () => {
        inMemoria = null;
        try {
            localStorage.removeItem(chiave);
        } catch {
            // niente da togliere
        }
        window.dispatchEvent(new Event(evento));
    };

    const useStore = () => {
        const [stato, setStato] = useState(leggi);
        useEffect(() => {
            const ricarica = () => setStato(leggi());
            const daAltraScheda = (e) => { if (e.key === chiave) ricarica(); };
            window.addEventListener(evento, ricarica);
            window.addEventListener('storage', daAltraScheda);
            return () => {
                window.removeEventListener(evento, ricarica);
                window.removeEventListener('storage', daAltraScheda);
            };
        }, []);
        return stato;
    };

    // Per chi deve sapere di ogni cambio fuori da React (es. il catalogo dei prodotti).
    const segui = (fn) => {
        window.addEventListener(evento, fn);
        return () => window.removeEventListener(evento, fn);
    };

    return { leggi, scrivi, aggiorna, ripristina, useStore, segui };
};

// Identificativo breve per i record creati nei mockup: prefisso-base36.
export const nuovoIdDemo = (prefisso) =>
    `${prefisso}-${Date.now().toString(36)}${Math.floor(Math.random() * 36 ** 3).toString(36)}`;
