import { useEffect, useState } from 'react';
import { supabase, MODO_DEMO } from '@/lib/supabase';
import { CONTRATTI } from '@/data/datiDemo';

// ═════════════════════════════════════════════════════════════════════════════
// DA DOVE ARRIVANO I CONTRATTI
// Dal database, con la funzione contratti_visibili: a chi lavora dentro CRIA
// tutti, a proprietari e inquilini i propri, e della controparte solo il nome
// (db/schema/40_letture_contratti.sql). Finché la risposta non arriva — e nel
// modo demo, che gira tutto nel browser — valgono i dati di prova del codice.
//
// La forma degli oggetti è la stessa di sempre, così le pagine non cambiano:
// id, canone, immobile, locatore, conduttore, mesi con segnalazione e
// copertura. L'id resta quello dei dati di prova (codice_demo) finché ci sono.
//
// Contestazioni, morosità e pratiche vivono ancora nel codice: di ogni mese si
// riprende da lì il collegamento alla contestazione, così le schermate che le
// mostrano continuano a funzionare. Sparisce quando passano anche loro.
// ═════════════════════════════════════════════════════════════════════════════

export const EVENTO_CONTRATTI = 'cria-contratti';
const annuncia = () => window.dispatchEvent(new Event(EVENTO_CONTRATTI));

let caricati = null;      // null finché il database non ha risposto
let inCorso = null;       // una sola richiesta alla volta

/** I contratti da usare adesso: quelli veri se sono arrivati, altrimenti i dati di prova. */
export const contrattiAttuali = () => caricati || CONTRATTI;

/** Vero quando quello che si sta leggendo viene dal database. */
export const contrattiDalDatabase = () => caricati !== null;

// Il pezzo che manca alla riga del database: la contestazione di quel mese,
// che sta ancora nei dati di prova.
const conContestazione = (contratto) => {
    const demo = CONTRATTI.find(c => c.id === contratto.id);
    if (!demo) return contratto;
    return {
        ...contratto,
        spec: demo.spec,
        primoMese: contratto.mesi[0]?.mese || demo.primoMese,
        mesi: contratto.mesi.map(m => {
            const suo = demo.mesi.find(x => x.mese === m.mese);
            return suo
                ? { ...m, contestazioneId: suo.contestazioneId, scadenzaContestazione: suo.scadenzaContestazione }
                : m;
        }),
    };
};

/** Legge i contratti dal database. Restituisce i dati di prova se non ci riesce. */
export const caricaContratti = async () => {
    if (MODO_DEMO) return CONTRATTI;
    const { data, error } = await supabase.rpc('contratti_visibili');
    if (error) throw error;
    caricati = (data || []).map(conContestazione);
    annuncia();
    return caricati;
};

/** Quando si entra o si esce: si dimentica chi c'era e si rilegge. */
export const scordaContratti = () => {
    caricati = null;
    inCorso = null;
    annuncia();
};

// Una richiesta sola anche se la chiedono tre pagine insieme.
const chiedi = () => {
    if (MODO_DEMO) return Promise.resolve(CONTRATTI);
    if (!inCorso) {
        inCorso = caricaContratti().catch(() => {
            inCorso = null;
            return CONTRATTI;
        });
    }
    return inCorso;
};

/**
 * I contratti per le pagine. Torna subito quelli che ci sono (i dati di prova
 * la prima volta) e si aggiorna quando arrivano quelli veri.
 */
export const useContratti = () => {
    const [contratti, setContratti] = useState(contrattiAttuali);
    useEffect(() => {
        let vivo = true;
        const aggiorna = () => { if (vivo) setContratti(contrattiAttuali()); };
        // All'avvio e a ogni cambio di persona: si richiede e poi si aggiorna.
        const rileggi = () => chiedi().then(aggiorna);
        rileggi();
        window.addEventListener(EVENTO_CONTRATTI, rileggi);
        return () => {
            vivo = false;
            window.removeEventListener(EVENTO_CONTRATTI, rileggi);
        };
    }, []);
    return contratti;
};

/** Il contratto con quell'id, fra quelli che si stanno usando. */
export const trovaContrattoAttuale = (id) => contrattiAttuali().find(c => c.id === id) || null;

/** I contratti di una persona, per verso: 'locatore' o 'conduttore'. */
export const contrattiPerVerso = (contratti, personaId, verso) => {
    if (!personaId) return [];
    return contratti.filter(c => (c.posizioni
        ? c.posizioni.some(p => p.verso === verso && p.personaId === personaId && !p.al)
        : c[verso]?.personaId === personaId));
};
