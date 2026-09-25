import { useEffect, useState } from 'react';
import { supabase, MODO_DEMO } from '@/lib/supabase';

// ═════════════════════════════════════════════════════════════════════════════
// UNA FONTE, SEMPRE UGUALE
// Le aree che leggono un elenco dal database fanno tutte la stessa cosa:
// chiedono una volta, tengono il risultato, lo rileggono quando cambia
// qualcosa o quando cambia la persona. Qui c'è quella cosa, scritta una volta.
//
// `elencoDemo` è quello che si usa nel modo demo, dove non si esce dal browser.
// ═════════════════════════════════════════════════════════════════════════════

export const creaFonte = (nomeFunzione, elencoDemo = () => []) => {
    const evento = `cria-fonte:${nomeFunzione}`;
    const annuncia = () => window.dispatchEvent(new Event(evento));
    let caricati = null;
    let inCorso = null;

    const attuali = () => caricati || (MODO_DEMO ? elencoDemo() : []);

    const carica = async () => {
        if (MODO_DEMO) return elencoDemo();
        const { data, error } = await supabase.rpc(nomeFunzione);
        if (error) throw error;
        caricati = data || [];
        annuncia();
        return caricati;
    };

    const scorda = () => {
        caricati = null;
        inCorso = null;
        annuncia();
    };

    const chiedi = () => {
        if (MODO_DEMO) return Promise.resolve(elencoDemo());
        if (!inCorso) {
            inCorso = carica().catch(() => {
                inCorso = null;
                return [];
            });
        }
        return inCorso;
    };

    const useElenco = () => {
        const [righe, setRighe] = useState(attuali);
        useEffect(() => {
            let vivo = true;
            const aggiorna = () => { if (vivo) setRighe(attuali()); };
            const rileggi = () => chiedi().then(aggiorna);
            rileggi();
            window.addEventListener(evento, rileggi);
            return () => {
                vivo = false;
                window.removeEventListener(evento, rileggi);
            };
        }, []);
        return righe;
    };

    return { attuali, carica, scorda, usa: useElenco, evento };
};
