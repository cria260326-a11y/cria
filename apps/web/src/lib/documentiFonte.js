import { useEffect, useState } from 'react';
import { supabase, MODO_DEMO } from '@/lib/supabase';
import { DOCUMENTI, OGGI } from '@/data/datiDemo';
import { creaStoreDemo, nuovoIdDemo } from '@/lib/storeDemo';

// ═════════════════════════════════════════════════════════════════════════════
// I DOCUMENTI
// Il file sta nel magazzino di Supabase, la riga nella tabella documenti
// (db/schema/41_documenti.sql). Chi carica non decide lo stato: un documento
// nasce «in attesa» e lo verifica una persona dell'istruttoria.
// Il file non si scarica con un indirizzo fisso: si chiede un collegamento che
// vale pochi minuti, così un link copiato non resta aperto per sempre.
//
// Nel modo demo tutto resta nel browser: i documenti dei dati di prova più
// quelli aggiunti, senza file veri.
// ═════════════════════════════════════════════════════════════════════════════

export const EVENTO_DOCUMENTI = 'cria-documenti';
const annuncia = () => window.dispatchEvent(new Event(EVENTO_DOCUMENTI));

const store = creaStoreDemo('criaDocumentiDemo', () => ({ aggiunti: [], stati: {} }));

const daRigaDemo = (d, stati) => ({
    id: d.id,
    personaId: d.personaId,
    soggettoId: d.personaId,
    entitaTipo: d.contrattoId ? 'contratto' : 'persona',
    entitaId: d.contrattoId || d.personaId,
    contrattoId: d.contrattoId || null,
    tipo: d.tipo,
    nome: d.nome,
    percorso: null,
    stato: stati[d.id]?.stato || d.stato,
    motivo: stati[d.id]?.motivo || null,
    caricatoIl: d.caricatoIl,
    verificatoIl: stati[d.id]?.verificatoIl || null,
    verificatoDa: stati[d.id]?.verificatoDa || null,
    sensibile: false,
});

const documentiDemo = (s = store.leggi()) => [
    ...(s.aggiunti || []).map(d => daRigaDemo(d, s.stati || {})),
    ...DOCUMENTI.map(d => daRigaDemo(d, s.stati || {})),
];

let caricati = null;
let inCorso = null;

/** I documenti che si stanno usando: quelli veri se sono arrivati. */
export const documentiAttuali = () => caricati || (MODO_DEMO ? documentiDemo() : []);

export const caricaDocumenti = async () => {
    if (MODO_DEMO) return documentiDemo();
    const { data, error } = await supabase.rpc('documenti_visibili');
    if (error) throw error;
    caricati = data || [];
    annuncia();
    return caricati;
};

export const scordaDocumenti = () => {
    caricati = null;
    inCorso = null;
    annuncia();
};

const chiedi = () => {
    if (MODO_DEMO) return Promise.resolve(documentiDemo());
    if (!inCorso) {
        inCorso = caricaDocumenti().catch(() => {
            inCorso = null;
            return [];
        });
    }
    return inCorso;
};

export const useDocumenti = () => {
    const [documenti, setDocumenti] = useState(documentiAttuali);
    const statoDemo = store.useStore();
    useEffect(() => {
        let vivo = true;
        const aggiorna = () => { if (vivo) setDocumenti(documentiAttuali()); };
        const rileggi = () => chiedi().then(aggiorna);
        rileggi();
        window.addEventListener(EVENTO_DOCUMENTI, rileggi);
        return () => {
            vivo = false;
            window.removeEventListener(EVENTO_DOCUMENTI, rileggi);
        };
    }, []);
    useEffect(() => { if (MODO_DEMO) setDocumenti(documentiDemo()); }, [statoDemo]);
    return documenti;
};

/** I documenti di una persona: i suoi e quelli dei contratti che ha. */
export const documentiDellaPersona = (documenti, personaId, contratti = []) => {
    const suoi = new Set(contratti.map(c => c.id));
    return documenti.filter(d => (d.personaId === personaId || d.soggettoId === personaId)
        || (d.contrattoId && suoi.has(d.contrattoId)));
};

// Il nome del file, ripulito: niente spazi strani o accenti nel percorso.
const nomePerIlMagazzino = (nome) => nome
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-80);

/**
 * Carica un file e registra il documento.
 *   persona     chi sta caricando (serve la sua riga del database)
 *   entita      'persona' | 'contratto' | 'immobile'
 *   entitaId    l'id nel database dell'oggetto a cui si attacca
 * Restituisce { ok, id } oppure { ok: false, messaggio }.
 */
export const caricaDocumento = async (file, { persona, entita = 'persona', entitaId = null, tipo = 'altro', sensibile = false } = {}) => {
    if (!file) return { ok: false, messaggio: 'Nessun file scelto.' };
    if (MODO_DEMO) {
        const s = store.leggi();
        store.scrivi({
            ...s,
            aggiunti: [{
                id: nuovoIdDemo('doc'), personaId: persona?.id || null, contrattoId: entita === 'contratto' ? entitaId : null,
                nome: file.name, tipo, caricatoIl: OGGI, stato: 'in_attesa',
            }, ...(s.aggiunti || [])],
        });
        annuncia();
        return { ok: true, simulato: true };
    }
    const cartella = persona?.personaDb;
    if (!cartella) return { ok: false, messaggio: 'Serve l’accesso.' };
    const percorso = `${cartella}/${crypto.randomUUID()}-${nomePerIlMagazzino(file.name)}`;
    const { error: erroreFile } = await supabase.storage.from('documenti').upload(percorso, file, {
        contentType: file.type || 'application/octet-stream', upsert: false,
    });
    if (erroreFile) return { ok: false, messaggio: 'Il file non è stato caricato: riprova.' };
    const { data, error } = await supabase.rpc('registra_documento', {
        l_entita: entita,
        l_id: entita === 'persona' ? cartella : entitaId,
        il_tipo: tipo,
        il_nome: file.name,
        il_percorso: percorso,
        il_mime: file.type || null,
        la_dimensione: file.size ?? null,
        la_persona: null,
        sensibile,
    });
    if (error) {
        await supabase.storage.from('documenti').remove([percorso]);
        return { ok: false, messaggio: 'Questo documento non si può caricare qui.' };
    }
    await caricaDocumenti();
    return { ok: true, id: data };
};

/** Un collegamento per aprire il file, valido pochi minuti. */
export const apriDocumento = async (documento) => {
    if (MODO_DEMO || !documento?.percorso) {
        return { ok: false, messaggio: 'Questo è un documento di prova: non c’è un file da aprire.' };
    }
    const { data, error } = await supabase.storage.from('documenti').createSignedUrl(documento.percorso, 300);
    if (error) return { ok: false, messaggio: 'Il file non si apre: riprova.' };
    return { ok: true, url: data.signedUrl };
};

/** La verifica: la fa l'istruttoria, e resta scritta. */
export const verificaDocumento = async (documento, esito, motivo = null) => {
    if (MODO_DEMO) {
        const s = store.leggi();
        store.scrivi({ ...s, stati: { ...(s.stati || {}), [documento.id]: { stato: esito, motivo, verificatoIl: OGGI, verificatoDa: 'demo' } } });
        annuncia();
        return { ok: true, simulato: true };
    }
    const { error } = await supabase.rpc('verifica_documento', {
        il_documento: documento.id, l_esito: esito, il_motivo: motivo,
    });
    if (error) return { ok: false, messaggio: error.message.includes('motivo') ? 'Serve il motivo, almeno cinque lettere.' : 'Non si può verificare questo documento.' };
    await caricaDocumenti();
    return { ok: true };
};

/** Cancellare: il file sparisce, la riga resta. */
export const cancellaDocumento = async (documento, motivo = null) => {
    if (MODO_DEMO) {
        const s = store.leggi();
        store.scrivi({ ...s, aggiunti: (s.aggiunti || []).filter(d => d.id !== documento.id) });
        annuncia();
        return { ok: true, simulato: true };
    }
    const { error } = await supabase.rpc('cancella_documento', { il_documento: documento.id, il_motivo: motivo });
    if (error) return { ok: false, messaggio: 'Questo documento non lo puoi cancellare.' };
    await caricaDocumenti();
    return { ok: true };
};

export const ripristinaDocumentiDemo = () => {
    store.ripristina();
    annuncia();
};
