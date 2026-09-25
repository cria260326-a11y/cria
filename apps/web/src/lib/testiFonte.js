import { supabase, MODO_DEMO } from '@/lib/supabase';

// ═════════════════════════════════════════════════════════════════════════════
// DOVE STANNO I TESTI CAMBIATI DALL'ADMIN
// In piattaforma: la tabella testi_sito di Supabase (db/schema/10_contenuti_sito.sql).
//   - il sito legge solo i testi pubblicati, con la funzione testi_pubblicati()
//   - l'admin legge tutto e scrive solo la bozza; pubblica e torna all'originale
//     con due funzioni del database, che firmano e scrivono la cronologia
// Nei mockup locali (modo demo, senza Supabase) la stessa cosa sta nel browser.
// Dopo ogni scrittura parte l'evento, così il sito aperto nella stessa scheda
// si aggiorna subito.
// ═════════════════════════════════════════════════════════════════════════════

export const EVENTO_TESTI = 'cria-testi';

const annuncia = () => window.dispatchEvent(new Event(EVENTO_TESTI));

// ─── Modo demo: tutto nel browser ─────────────────────────────────────────────
const CHIAVE_DEMO = 'criaTestiDemo'; // { righe: { [chiave]: riga }, storico: [voce] }

const leggiDemo = () => {
    try {
        const s = JSON.parse(localStorage.getItem(CHIAVE_DEMO)) || {};
        return { righe: s.righe || {}, storico: s.storico || [] };
    } catch {
        return { righe: {}, storico: [] };
    }
};

const scriviDemo = (s) => {
    try {
        localStorage.setItem(CHIAVE_DEMO, JSON.stringify(s));
    } catch {
        // storage non disponibile
    }
};

const ADESSO = () => new Date().toISOString();
const CHI_DEMO = 'admin@cri-affitti.it';

// ─── Lettura ──────────────────────────────────────────────────────────────────
/** Per il sito: { [chiave]: testo pubblicato }. */
export const caricaPubblicati = async () => {
    if (MODO_DEMO) {
        const { righe } = leggiDemo();
        return Object.fromEntries(Object.values(righe).filter(r => r.pubblicato != null).map(r => [r.chiave, r.pubblicato]));
    }
    const { data, error } = await supabase.rpc('testi_pubblicati');
    if (error) throw error;
    return Object.fromEntries((data || []).map(r => [r.chiave, r.testo]));
};

/** Per l'anteprima dell'admin: { [chiave]: bozza }. A chi non è admin il database non ne dà. */
export const caricaBozze = async () => {
    if (MODO_DEMO) {
        const { righe } = leggiDemo();
        return Object.fromEntries(Object.values(righe).filter(r => r.bozza != null).map(r => [r.chiave, r.bozza]));
    }
    const { data, error } = await supabase.from('testi_sito').select('chiave, bozza').not('bozza', 'is', null);
    if (error) throw error;
    return Object.fromEntries((data || []).map(r => [r.chiave, r.bozza]));
};

// L'anteprima delle bozze vale solo nel browser dell'admin che l'ha accesa.
const CHIAVE_ANTEPRIMA = 'criaTestiAnteprima';
export const anteprimaAccesa = () => {
    try {
        return localStorage.getItem(CHIAVE_ANTEPRIMA) === '1';
    } catch {
        return false;
    }
};
export const accendiAnteprima = (si) => {
    try {
        if (si) localStorage.setItem(CHIAVE_ANTEPRIMA, '1');
        else localStorage.removeItem(CHIAVE_ANTEPRIMA);
    } catch {
        // storage non disponibile: niente anteprima
    }
    annuncia();
};

/** Per l'admin: { [chiave]: { chiave, bozza, bozza_il, bozza_di, pubblicato, pubblicato_il, pubblicato_di } }. */
export const caricaRighe = async () => {
    if (MODO_DEMO) return leggiDemo().righe;
    const { data, error } = await supabase.from('testi_sito').select('*');
    if (error) throw error;
    return Object.fromEntries((data || []).map(r => [r.chiave, r]));
};

export const caricaCronologia = async (chiave) => {
    if (MODO_DEMO) return leggiDemo().storico.filter(v => v.chiave === chiave);
    const { data, error } = await supabase
        .from('testi_sito_storico').select('*').eq('chiave', chiave).order('il', { ascending: false }).limit(20);
    if (error) throw error;
    return data || [];
};

// ─── Scrittura (solo admin: il database lo controlla) ─────────────────────────
export const salvaBozza = async (chiave, testo) => {
    if (MODO_DEMO) {
        const s = leggiDemo();
        s.righe[chiave] = { ...(s.righe[chiave] || { chiave, pubblicato: null }), bozza: testo, bozza_il: ADESSO(), bozza_di: CHI_DEMO };
        scriviDemo(s);
    } else {
        const { error } = await supabase.from('testi_sito').upsert({ chiave, bozza: testo }, { onConflict: 'chiave' });
        if (error) throw error;
    }
    annuncia();
};

export const scartaBozza = async (chiave) => {
    if (MODO_DEMO) {
        const s = leggiDemo();
        const r = s.righe[chiave];
        if (r) {
            if (r.pubblicato == null) delete s.righe[chiave];
            else s.righe[chiave] = { ...r, bozza: null, bozza_il: null, bozza_di: null };
        }
        scriviDemo(s);
    } else {
        const { error } = await supabase.from('testi_sito').update({ bozza: null }).eq('chiave', chiave);
        if (error) throw error;
    }
    annuncia();
};

/** Pubblica le bozze delle chiavi indicate; restituisce quante. */
export const pubblica = async (chiavi) => {
    let n = 0;
    if (MODO_DEMO) {
        const s = leggiDemo();
        chiavi.forEach(chiave => {
            const r = s.righe[chiave];
            if (!r || r.bozza == null) return;
            s.righe[chiave] = { ...r, pubblicato: r.bozza, pubblicato_il: ADESSO(), pubblicato_di: CHI_DEMO, bozza: null, bozza_il: null, bozza_di: null };
            s.storico.unshift({ id: `${chiave}-${Date.now()}-${n}`, chiave, valore: r.bozza, azione: 'pubblicato', il: ADESSO(), di: CHI_DEMO });
            n += 1;
        });
        scriviDemo(s);
    } else {
        const { data, error } = await supabase.rpc('pubblica_testi', { chiavi });
        if (error) throw error;
        n = data;
    }
    annuncia();
    return n;
};

export const tornaAllOriginale = async (chiave) => {
    if (MODO_DEMO) {
        const s = leggiDemo();
        if (s.righe[chiave]?.pubblicato != null) {
            s.storico.unshift({ id: `${chiave}-${Date.now()}`, chiave, valore: null, azione: 'ripristinato', il: ADESSO(), di: CHI_DEMO });
        }
        delete s.righe[chiave];
        scriviDemo(s);
    } else {
        const { error } = await supabase.rpc('ripristina_testo', { la_chiave: chiave });
        if (error) throw error;
    }
    annuncia();
};
