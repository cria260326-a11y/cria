import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, MODO_DEMO } from '@/lib/supabase';
import { PRATICHE, praticheDi } from '@/data/pratiche';

// ═════════════════════════════════════════════════════════════════════════════
// LE PRATICHE
// Dal database (db/schema/44_pratiche.sql): il proprietario vede le sue, chi
// lavora dentro CRIA tutte. Quello che serve alle regole — chi, quale
// prodotto, che stato, quanto — sta in colonna; il resto della pratica sta in
// un campo `dati` finché non serve interrogarlo.
//
// La forma degli oggetti è quella di sempre, così le schermate non cambiano.
// Nel modo demo tutto resta nel browser, come prima.
//
// Il link personale del candidato (E-11) non passa da qui: quella pagina si
// apre senza account e per ora legge i dati di prova.
// ═════════════════════════════════════════════════════════════════════════════

const CHIAVE = 'criaPraticheDemo'; // { nuove: [pratica], modifiche: { [id]: {...} } }
const EVENTO = 'cria-pratiche';
const annuncia = () => window.dispatchEvent(new Event(EVENTO));

const leggi = () => {
    try {
        return JSON.parse(localStorage.getItem(CHIAVE)) || { nuove: [], modifiche: {} };
    } catch {
        return { nuove: [], modifiche: {} };
    }
};

const scrivi = (stato) => {
    try {
        localStorage.setItem(CHIAVE, JSON.stringify(stato));
    } catch {
        // storage non disponibile
    }
    annuncia();
};

const praticheDemo = () => {
    const s = leggi();
    return [...s.nuove, ...PRATICHE].map(p => ({ ...p, ...(s.modifiche[p.id] || {}) }));
};

let caricate = null;
let inCorso = null;

export const praticheAttuali = () => caricate || (MODO_DEMO ? praticheDemo() : []);

export const caricaPratiche = async () => {
    if (MODO_DEMO) return praticheDemo();
    const { data, error } = await supabase.rpc('pratiche_visibili');
    if (error) throw error;
    caricate = data || [];
    annuncia();
    return caricate;
};

export const scordaPratiche = () => {
    caricate = null;
    inCorso = null;
    annuncia();
};

const chiedi = () => {
    if (MODO_DEMO) return Promise.resolve(praticheDemo());
    if (!inCorso) {
        inCorso = caricaPratiche().catch(() => {
            inCorso = null;
            return [];
        });
    }
    return inCorso;
};

// Tutte le pratiche che chi guarda può vedere, aggiornate quando cambiano.
const useLeMie = () => {
    const [pratiche, setPratiche] = useState(praticheAttuali);
    useEffect(() => {
        let vivo = true;
        const aggiorna = () => { if (vivo) setPratiche(praticheAttuali()); };
        const rileggi = () => chiedi().then(aggiorna);
        rileggi();
        window.addEventListener(EVENTO, rileggi);
        window.addEventListener('storage', rileggi);
        return () => {
            vivo = false;
            window.removeEventListener(EVENTO, rileggi);
            window.removeEventListener('storage', rileggi);
        };
    }, []);
    return pratiche;
};

/** Apre una pratica nuova. Restituisce { ok, id } oppure { ok: false, messaggio }. */
export const creaPratica = async (pratica) => {
    if (MODO_DEMO) {
        const s = leggi();
        scrivi({ ...s, nuove: [pratica, ...s.nuove] });
        return { ok: true, id: pratica.id };
    }
    const { data, error } = await supabase.rpc('apri_pratica', { i_dati: pratica });
    if (error) return { ok: false, messaggio: 'La pratica non è partita: riprova.' };
    await caricaPratiche();
    return { ok: true, id: data };
};

/**
 * Fa avanzare una pratica: il cliente paga e firma, CRIA istruisce e delibera.
 * `modifiche` può contenere lo stato nuovo e i dati che lo accompagnano.
 */
export const aggiornaPratica = async (id, modifiche) => {
    if (MODO_DEMO) {
        const s = leggi();
        scrivi({ ...s, modifiche: { ...s.modifiche, [id]: { ...(s.modifiche[id] || {}), ...modifiche } } });
        return { ok: true };
    }
    const p = praticheAttuali().find(x => x.id === id);
    if (!p?.praticaDb) return { ok: false, messaggio: 'Pratica non collegata al database.' };
    const { error } = await supabase.rpc('avanza_pratica', {
        la_pratica: p.praticaDb, il_nuovo_stato: modifiche.stato || p.stato, i_cambi: modifiche,
    });
    if (error) return { ok: false, messaggio: 'Il passaggio non è riuscito: riprova.' };
    await caricaPratiche();
    return { ok: true };
};

/** La delibera dell'istruttoria: approva o respinge, con la motivazione. */
export const deliberaPratica = async (pratica, esito, nota) => {
    if (MODO_DEMO) {
        return aggiornaPratica(pratica.id, esito === 'respinta'
            ? { stato: 'respinta', istruttoria: { conclusaIl: null, esito, nota } }
            : { stato: 'pagamento', istruttoria: { conclusaIl: null, esito, nota } });
    }
    if (!pratica?.praticaDb) return { ok: false, messaggio: 'Pratica non collegata al database.' };
    const { error } = await supabase.rpc('delibera_pratica', {
        la_pratica: pratica.praticaDb, l_esito: esito, la_nota: nota,
    });
    if (error) {
        const t = String(error.message || '');
        return { ok: false, messaggio: t.includes('portato il cliente') ? 'Chi ha portato il cliente non delibera la sua pratica.' : 'La delibera non è passata: riprova.' };
    }
    await caricaPratiche();
    return { ok: true };
};

/** Le pratiche di una persona. */
export const usePratiche = (personaId) => {
    const tutte = useLeMie();
    const pratiche = useMemo(
        () => (MODO_DEMO ? tutte.filter(p => p.personaId === personaId) : tutte.filter(p => p.personaId === personaId || p.soggettoId === personaId)),
        [tutte, personaId],
    );
    const trova = useCallback((id) => pratiche.find(p => p.id === id) || null, [pratiche]);
    return { pratiche, trova };
};

// La pagina pubblica del candidato (E-11) trova la pratica dal token del link
// personale, senza sapere di chi è. Si apre senza account: per ora legge i
// dati di prova, e passerà al database con il link firmato.
export const usePraticaPerToken = (token) => {
    const [versione, setVersione] = useState(0);
    useEffect(() => {
        const aggiorna = () => setVersione(v => v + 1);
        window.addEventListener(EVENTO, aggiorna);
        window.addEventListener('storage', aggiorna);
        return () => {
            window.removeEventListener(EVENTO, aggiorna);
            window.removeEventListener('storage', aggiorna);
        };
    }, []);
    return useMemo(() => {
        const s = leggi();
        const p = [...s.nuove, ...praticheAttuali(), ...PRATICHE].find(x => x.candidato?.token === token);
        return p ? { ...p, ...(s.modifiche[p.id] || {}) } : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, versione]);
};

/** Il back office vede le pratiche di tutti, le più recenti prima. */
export const useTutteLePratiche = () => {
    const tutte = useLeMie();
    return useMemo(() => [...tutte].sort((a, b) => String(b.apertaIl).localeCompare(String(a.apertaIl))), [tutte]);
};

/** Le pratiche di una persona, fuori da React. */
export const praticheDellaPersona = (personaId) => (MODO_DEMO
    ? praticheDi(personaId)
    : praticheAttuali().filter(p => p.personaId === personaId));
