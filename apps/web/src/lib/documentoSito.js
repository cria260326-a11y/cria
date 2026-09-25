import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// ═════════════════════════════════════════════════════════════════════════════
// UN DOCUMENTO DEL SITO SALVATO IN SUPABASE (tabella documenti_sito)
// Stessa forma degli store dei mockup (leggi, scrivi, aggiorna, useStore), ma il
// dato sta nel database, così quello che l'admin cambia lo vedono tutti:
//   - il sito lo legge con documento_sito(chiave), senza il registro interno
//   - l'admin lo legge dalla tabella, registro compreso, e lo salva intero con
//     salva_documento_sito, che si ferma se nel frattempo qualcuno l'ha cambiato
// Le modifiche si vedono subito e partono una alla volta; se il database le
// rifiuta si torna al documento salvato e si dice perché.
// Una copia locale fa vedere l'ultimo documento già al primo disegno.
// ═════════════════════════════════════════════════════════════════════════════

const MESSAGGI = {
    '40001': 'Qualcun altro ha cambiato questi contenuti nel frattempo: li ricarico, rifai la modifica.',
    '42501': 'Solo l’admin può cambiare i contenuti del sito.',
};

export const creaDocumentoSito = (chiave, iniziale) => {
    const evento = `cria-documento:${chiave}`;
    const chiaveCopia = `criaDocumento:${chiave}`;

    const leggiCopia = () => {
        try {
            return JSON.parse(localStorage.getItem(chiaveCopia)) || {};
        } catch {
            return {};
        }
    };
    const scriviCopia = (contenuto) => {
        try {
            const { registro: _registro, ...pubblico } = contenuto || {};
            localStorage.setItem(chiaveCopia, JSON.stringify(pubblico));
        } catch {
            // storage non disponibile
        }
    };

    let stato = { ...iniziale(), ...leggiCopia() };
    let versione = null;          // l'ultima letta dall'admin: il database la confronta
    let letturaPubblica = null;
    let letturaAdmin = null;
    let coda = Promise.resolve();

    const annuncia = () => window.dispatchEvent(new Event(evento));

    const caricaPubblico = async () => {
        const { data, error } = await supabase.rpc('documento_sito', { la_chiave: chiave });
        if (error) return;
        if (!letturaAdmin) stato = { ...iniziale(), ...(data || {}) };
        scriviCopia(data || {});
        annuncia();
    };

    // Per chi non è admin la tabella non restituisce niente: resta quello pubblico.
    const caricaAdmin = async () => {
        const { data, error } = await supabase.from('documenti_sito').select('contenuto, versione').eq('chiave', chiave).maybeSingle();
        if (error) return;
        if (data) {
            stato = { ...iniziale(), ...data.contenuto };
            versione = data.versione;
        } else {
            versione = null;
        }
        annuncia();
    };

    const ricarica = (comeAdmin) => {
        if (comeAdmin) {
            letturaAdmin = caricaAdmin();
            return letturaAdmin;
        }
        letturaPubblica = caricaPubblico();
        return letturaPubblica;
    };

    const salva = (contenuto) => {
        coda = coda.then(async () => {
            if (letturaAdmin) await letturaAdmin;
            const { data, error } = await supabase.rpc('salva_documento_sito', {
                la_chiave: chiave, il_contenuto: contenuto, versione_letta: versione,
            });
            if (error) {
                toast.error(MESSAGGI[error.code] || 'Non sono riuscito a salvare: riprova tra poco.');
                await ricarica(true);
                return;
            }
            versione = data;
            scriviCopia(contenuto);
        });
        return coda;
    };

    const leggi = () => stato;
    const scrivi = (nuovo) => {
        stato = nuovo;
        annuncia();
        salva(nuovo);
        return nuovo;
    };
    const aggiorna = (fn) => scrivi(fn(leggi()));
    const ripristina = () => scrivi(iniziale());

    const useStore = ({ admin = false } = {}) => {
        const [s, setS] = useState(() => stato);
        useEffect(() => {
            const segui = () => setS(stato);
            window.addEventListener(evento, segui);
            if (admin && !letturaAdmin) ricarica(true);
            else if (!admin && !letturaPubblica && !letturaAdmin) ricarica(false);
            segui();
            return () => window.removeEventListener(evento, segui);
        }, [admin]);
        return s;
    };

    // Per chi deve sapere di ogni cambio fuori da React (es. il catalogo dei prodotti).
    const segui = (fn) => {
        window.addEventListener(evento, fn);
        return () => window.removeEventListener(evento, fn);
    };

    return { leggi, scrivi, aggiorna, ripristina, useStore, segui };
};
