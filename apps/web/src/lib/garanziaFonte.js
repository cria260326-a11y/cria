import { useEffect, useState } from 'react';
import { supabase, MODO_DEMO } from '@/lib/supabase';

// ═════════════════════════════════════════════════════════════════════════════
// LA GARANZIA, DAL DATABASE
// Le pratiche di morosità con i loro contatti, i piani con le rate e gli
// indennizzi con le tre firme (db/schema/45_garanzia_letture.sql). Chi lavora
// dentro CRIA le vede tutte; il proprietario e l'inquilino quelle dei loro
// contratti.
//
// Qui arrivano solo i fatti. Quello che si calcola — le fasi, i termini, lo
// stato delle rate, gli indicatori — resta nel codice: è una regola di
// business, non un modo di conservare i dati.
// ═════════════════════════════════════════════════════════════════════════════

export const EVENTO_GARANZIA = 'cria-garanzia';
const annuncia = () => window.dispatchEvent(new Event(EVENTO_GARANZIA));

let caricata = null;
let inCorso = null;

/** { pratiche, indennizzi } se sono arrivati dal database, altrimenti null. */
export const garanziaDalDatabase = () => caricata;

export const caricaGaranzia = async () => {
    if (MODO_DEMO) return null;
    const { data, error } = await supabase.rpc('garanzia_visibile');
    if (error) throw error;
    caricata = data && Array.isArray(data.pratiche) ? data : null;
    annuncia();
    return caricata;
};

export const scordaGaranzia = () => {
    caricata = null;
    inCorso = null;
    annuncia();
};

const chiedi = () => {
    if (MODO_DEMO) return Promise.resolve(null);
    if (!inCorso) {
        inCorso = caricaGaranzia().catch(() => {
            inCorso = null;
            return null;
        });
    }
    return inCorso;
};

export const useGaranziaDalDatabase = () => {
    const [dati, setDati] = useState(garanziaDalDatabase);
    useEffect(() => {
        let vivo = true;
        const aggiorna = () => { if (vivo) setDati(garanziaDalDatabase()); };
        const rileggi = () => chiedi().then(aggiorna);
        rileggi();
        window.addEventListener(EVENTO_GARANZIA, rileggi);
        return () => {
            vivo = false;
            window.removeEventListener(EVENTO_GARANZIA, rileggi);
        };
    }, []);
    return dati;
};

// ─── Le azioni con due firme ─────────────────────────────────────────────────
const esitoErrore = (error, ripiego) => {
    const t = String(error?.message || '');
    if (t.includes('persona diversa') || t.includes('due_persone')) return 'Chi dispone non autorizza: serve un’altra persona.';
    if (t.includes('propone')) return 'Chi propone non approva: serve un’altra persona.';
    return ripiego;
};

export const disponiIndennizzoDb = async (indennizzoId, nota) => {
    const { error } = await supabase.rpc('disponi_indennizzo', { l_indennizzo: indennizzoId, la_nota: nota });
    if (error) return { ok: false, messaggio: esitoErrore(error, 'Non riuscito: riprova.') };
    await caricaGaranzia();
    return { ok: true };
};

export const autorizzaIndennizzoDb = async (indennizzoId) => {
    const { error } = await supabase.rpc('autorizza_indennizzo', { l_indennizzo: indennizzoId });
    if (error) return { ok: false, messaggio: esitoErrore(error, 'Non riuscito: riprova.') };
    await caricaGaranzia();
    return { ok: true };
};

export const eseguiIndennizzoDb = async (indennizzoId, riferimento) => {
    const { error } = await supabase.rpc('esegui_indennizzo', { l_indennizzo: indennizzoId, il_riferimento: riferimento });
    if (error) return { ok: false, messaggio: esitoErrore(error, 'Non riuscito: riprova.') };
    await caricaGaranzia();
    return { ok: true };
};

export const proponiPianoDb = async (morositaId, { nRate, primaScadenza, nota, importo }) => {
    const { data, error } = await supabase.rpc('proponi_piano', {
        la_morosita: morositaId, le_rate: nRate, la_prima_scadenza: primaScadenza, la_nota: nota, l_importo: importo,
    });
    if (error) return { ok: false, messaggio: esitoErrore(error, 'Il piano non è partito: riprova.') };
    await caricaGaranzia();
    return { ok: true, id: data };
};

export const approvaPianoDb = async (pianoId) => {
    const { error } = await supabase.rpc('approva_piano', { il_piano: pianoId });
    if (error) return { ok: false, messaggio: esitoErrore(error, 'Non riuscito: riprova.') };
    await caricaGaranzia();
    return { ok: true };
};

/** Una nota interna: la scrive chi lavora dentro CRIA, il cliente non la vede. */
export const scriviNotaDb = async (entita, id, testo) => {
    const { error } = await supabase.rpc('scrivi_nota_interna', { l_entita: entita, l_id: id, il_testo: testo });
    if (error) return { ok: false, messaggio: 'La nota non è stata salvata: riprova.' };
    await caricaGaranzia();
    return { ok: true };
};

export const registraContattoDb = async (morositaId, { canale, esito, nota, il }) => {
    const { error } = await supabase.rpc('registra_contatto', {
        la_morosita: morositaId, il_canale: canale, l_esito: esito, la_nota: nota, il_quando: il,
    });
    if (error) return { ok: false, messaggio: 'Il contatto non è stato registrato: riprova.' };
    await caricaGaranzia();
    return { ok: true };
};
