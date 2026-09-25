import { useEffect, useState } from 'react';
import { supabase, MODO_DEMO } from '@/lib/supabase';
import { creaStoreDemo, nuovoIdDemo } from '@/lib/storeDemo';

// ═════════════════════════════════════════════════════════════════════════════
// LE CONVERSAZIONI
// Un filo con una persona: assistenza, una domanda, un documento da rifare.
// Chi l'ha aperta la vede tutta, chi lavora dentro CRIA le vede tutte, e le
// note interne non escono mai verso il cliente — lo decide una colonna del
// database, non il modo in cui si disegna la pagina
// (db/schema/42_conversazioni.sql).
//
// Se il cliente scrive su una conversazione chiusa, si riapre: chiuderla non
// deve diventare un modo per non rispondere.
//
// Nel modo demo tutto resta nel browser, con tre fili di esempio.
// ═════════════════════════════════════════════════════════════════════════════

export const EVENTO_CONVERSAZIONI = 'cria-conversazioni';
const annuncia = () => window.dispatchEvent(new Event(EVENTO_CONVERSAZIONI));

const ora = () => new Date().toISOString();

// Tre fili per il modo demo. Quelli veri stanno nel database (db/seed).
const DEMO = [
    {
        id: 'k-demo-1', codice: 'ASS-2026-0001', oggetto: 'Domanda su CRIA Gestione', categoria: 'prodotti',
        area: 'locatore', stato: 'aperto', apertaDa: { personaId: 'mario', nome: 'Mario Rossi' },
        creatoIl: '2026-09-03T10:30:00Z', ultimoMessaggioIl: '2026-09-04T09:30:00Z',
        messaggi: [
            { id: 'm1', testo: 'Salve, vorrei capire meglio cosa comprende CRIA Gestione.', il: '2026-09-03T10:30:00Z', daCria: false, interno: false, autore: { personaId: 'mario', nome: 'Mario Rossi' } },
            { id: 'm2', testo: 'Comprende la segnalazione mensile, il semaforo del suo inquilino, le contestazioni decise da CRIA e la garanzia dopo la franchigia.', il: '2026-09-03T14:15:00Z', daCria: true, interno: false, autore: { personaId: 'nicola', nome: 'Nicola Pace' } },
        ],
    },
    {
        id: 'k-demo-2', codice: 'ASS-2026-0003', oggetto: 'Il semaforo di agosto', categoria: 'semaforo',
        area: 'inquilino', stato: 'in_corso', apertaDa: { personaId: 'giulia', nome: 'Giulia Ferri' },
        creatoIl: '2026-09-05T08:20:00Z', ultimoMessaggioIl: '2026-09-05T12:02:00Z',
        messaggi: [
            { id: 'm1', testo: 'Agosto risulta contestato ma avevo pagato il 1°. Il semaforo ne risente?', il: '2026-09-05T08:20:00Z', daCria: false, interno: false, autore: { personaId: 'giulia', nome: 'Giulia Ferri' } },
            { id: 'm2', testo: 'No: la contestazione è stata accolta e il mese conta come pagato il 2.', il: '2026-09-05T11:40:00Z', daCria: true, interno: false, autore: { personaId: 'nicola', nome: 'Nicola Pace' } },
        ],
    },
    {
        id: 'k-demo-3', codice: 'ASS-2026-0005', oggetto: 'Chiedo di rateizzare', categoria: 'morosita',
        area: 'inquilino', stato: 'aperto', apertaDa: { personaId: 'martina', nome: 'Martina Galli' },
        creatoIl: '2026-09-11T09:15:00Z', ultimoMessaggioIl: '2026-09-11T15:32:00Z',
        messaggi: [
            { id: 'm1', testo: 'Sono in difficoltà con luglio. Posso pagare a rate?', il: '2026-09-11T09:15:00Z', daCria: false, interno: false, autore: { personaId: 'martina', nome: 'Martina Galli' } },
            { id: 'm2', testo: 'Sì: il piano glielo propone il gestore della pratica e lo approva il responsabile legale.', il: '2026-09-11T15:30:00Z', daCria: true, interno: false, autore: { personaId: 'nicola', nome: 'Nicola Pace' } },
            { id: 'm3', testo: 'Nota interna: prima rata già pagata il 19 agosto.', il: '2026-09-11T15:32:00Z', daCria: true, interno: true, autore: { personaId: 'nicola', nome: 'Nicola Pace' } },
        ],
    },
];

const store = creaStoreDemo('criaConversazioniDemo', () => ({ nuove: [], messaggi: {}, stati: {} }));

const conversazioniDemo = (s = store.leggi()) => [...(s.nuove || []), ...DEMO].map(k => ({
    ...k,
    stato: s.stati?.[k.id] || k.stato,
    messaggi: [...k.messaggi, ...((s.messaggi || {})[k.id] || [])],
}));

let caricate = null;
let inCorso = null;

export const conversazioniAttuali = () => caricate || (MODO_DEMO ? conversazioniDemo() : []);

export const caricaConversazioni = async () => {
    if (MODO_DEMO) return conversazioniDemo();
    const { data, error } = await supabase.rpc('conversazioni_visibili');
    if (error) throw error;
    caricate = data || [];
    annuncia();
    return caricate;
};

export const scordaConversazioni = () => {
    caricate = null;
    inCorso = null;
    annuncia();
};

const chiedi = () => {
    if (MODO_DEMO) return Promise.resolve(conversazioniDemo());
    if (!inCorso) {
        inCorso = caricaConversazioni().catch(() => {
            inCorso = null;
            return [];
        });
    }
    return inCorso;
};

export const useConversazioni = () => {
    const [conversazioni, setConversazioni] = useState(conversazioniAttuali);
    const statoDemo = store.useStore();
    useEffect(() => {
        let vivo = true;
        const aggiorna = () => { if (vivo) setConversazioni(conversazioniAttuali()); };
        const rileggi = () => chiedi().then(aggiorna);
        rileggi();
        window.addEventListener(EVENTO_CONVERSAZIONI, rileggi);
        return () => {
            vivo = false;
            window.removeEventListener(EVENTO_CONVERSAZIONI, rileggi);
        };
    }, []);
    useEffect(() => { if (MODO_DEMO) setConversazioni(conversazioniDemo()); }, [statoDemo]);
    return conversazioni;
};

/** Apre un filo nuovo. Restituisce { ok, id } oppure { ok: false, messaggio }. */
export const apriConversazione = async ({ oggetto, categoria, area = null, testo, persona = null, perPersona = null }) => {
    if (MODO_DEMO) {
        const id = nuovoIdDemo('k');
        const s = store.leggi();
        store.scrivi({
            ...s,
            nuove: [{
                id, codice: null, oggetto, categoria, area, stato: 'aperto',
                apertaDa: { personaId: persona?.id || null, nome: persona?.nome || 'Tu' },
                creatoIl: ora(), ultimoMessaggioIl: ora(),
                messaggi: [{ id: nuovoIdDemo('m'), testo, il: ora(), daCria: false, interno: false, autore: { personaId: persona?.id || null, nome: persona?.nome || 'Tu' } }],
            }, ...(s.nuove || [])],
        });
        annuncia();
        return { ok: true, id };
    }
    const { data, error } = await supabase.rpc('apri_conversazione', {
        l_oggetto: oggetto, la_categoria: categoria, l_area: area, il_testo: testo, per_persona: perPersona,
    });
    if (error) return { ok: false, messaggio: 'La richiesta non è partita: riprova.' };
    await caricaConversazioni();
    return { ok: true, id: data };
};

/** Scrive un messaggio. `interno` vale solo per chi lavora dentro CRIA. */
export const scriviMessaggio = async (conversazioneId, testo, { interno = false, persona = null, daCria = false } = {}) => {
    if (!testo?.trim()) return { ok: false, messaggio: 'Il messaggio è vuoto.' };
    if (MODO_DEMO) {
        const s = store.leggi();
        const suoi = (s.messaggi || {})[conversazioneId] || [];
        store.scrivi({
            ...s,
            messaggi: {
                ...(s.messaggi || {}),
                [conversazioneId]: [...suoi, {
                    id: nuovoIdDemo('m'), testo: testo.trim(), il: ora(), daCria, interno,
                    autore: { personaId: persona?.id || null, nome: persona?.nome || (daCria ? 'CRIA' : 'Tu') },
                }],
            },
        });
        annuncia();
        return { ok: true };
    }
    const { error } = await supabase.rpc('scrivi_messaggio', {
        la_conversazione: conversazioneId, il_testo: testo.trim(), l_interno: interno,
    });
    if (error) return { ok: false, messaggio: 'Il messaggio non è partito: riprova.' };
    await caricaConversazioni();
    return { ok: true };
};

/** Aperto, in corso, risolto. */
export const cambiaStatoConversazione = async (conversazioneId, stato) => {
    if (MODO_DEMO) {
        const s = store.leggi();
        store.scrivi({ ...s, stati: { ...(s.stati || {}), [conversazioneId]: stato } });
        annuncia();
        return { ok: true };
    }
    const { error } = await supabase.rpc('cambia_stato_conversazione', { la_conversazione: conversazioneId, il_nuovo: stato });
    if (error) return { ok: false, messaggio: 'Lo stato non è cambiato: riprova.' };
    await caricaConversazioni();
    return { ok: true };
};

/** La forma che usano le pagine delle aree: «tu» e «CRIA», niente note interne.
 * Si tengono solo i fili della persona: nel database lo fa già la funzione,
 * qui vale anche per il modo demo. */
export const perLArea = (conversazioni, personaId) => conversazioni
    .filter(k => !personaId || k.apertaDa?.personaId === personaId)
    .map(k => ({
    id: k.id,
    oggetto: k.oggetto,
    categoria: k.categoria,
    stato: k.stato,
    creato: (k.creatoIl || '').slice(0, 10),
    ultimoMessaggio: k.ultimoMessaggioIl || k.creatoIl,
    nonLetti: 0,
    messaggi: k.messaggi.filter(m => !m.interno).map(m => ({
        id: m.id,
        mittente: !m.daCria && m.autore?.personaId === personaId ? 'tu' : 'cria',
        autore: m.daCria ? `${m.autore?.nome || 'CRIA'} · CRIA` : m.autore?.nome,
        testo: m.testo,
        data: m.il,
    })),
    }));

export const ripristinaConversazioniDemo = () => {
    store.ripristina();
    annuncia();
};
