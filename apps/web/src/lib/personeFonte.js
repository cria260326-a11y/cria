import { useEffect, useState } from 'react';
import { supabase, MODO_DEMO } from '@/lib/supabase';
import { PERSONE_DEMO, trovaPersonaDemo } from '@/data/personeDemo';
import { trovaOperatore } from '@/data/operatori';
import { creaStoreDemo } from '@/lib/storeDemo';

// ═════════════════════════════════════════════════════════════════════════════
// LE PERSONE: DOVE STANNO
// In piattaforma: le tabelle persone, ruoli e persone_modifiche di Supabase
// (db/schema/20_persone.sql). Nessuno le scrive direttamente: si passa dalla
// funzione aggiorna_persona, che controlla chi agisce e scrive il registro.
//   - ognuno cambia i propri dati; da solo non cambia codice fiscale e partita
//     IVA, e lo stato dell'identità lo porta solo a «in attesa»
//   - l'admin cambia i dati di tutti, anche i suoi; per quelli degli altri
//     scrive il motivo
// Nei mockup locali (modo demo, senza Supabase) la stessa cosa sta nel
// browser, con le stesse regole: le pagine si provano senza password.
//
// codice_demo collega la persona ai dati di prova ancora nel codice
// (contratti, pratiche, pagamenti): per le pagine l'id della persona resta
// quello ('mario'), così quei dati continuano a trovarla.
// ═════════════════════════════════════════════════════════════════════════════

export const EVENTO_PERSONE = 'cria-persone';
const annuncia = () => window.dispatchEvent(new Event(EVENTO_PERSONE));

// Campi delle pagine → colonne della tabella.
const COLONNE = {
    tipo: 'tipo', nome: 'nome', cognome: 'cognome', ragioneSociale: 'ragione_sociale', partitaIva: 'partita_iva',
    codiceFiscale: 'codice_fiscale', dataNascita: 'data_nascita', luogoNascita: 'luogo_nascita', email: 'email',
    telefono: 'telefono', indirizzo: 'indirizzo', fatturazione: 'fatturazione', statoIdentita: 'stato_identita',
    motivoIntegrazione: 'motivo_integrazione',
};
const CAMPO_DI = Object.fromEntries(Object.entries(COLONNE).map(([campo, colonna]) => [colonna, campo]));

export const ETICHETTE_CAMPI = {
    tipo: 'tipo di persona', nome: 'nome', cognome: 'cognome', ragioneSociale: 'ragione sociale', partitaIva: 'partita IVA',
    codiceFiscale: 'codice fiscale', dataNascita: 'data di nascita', luogoNascita: 'luogo di nascita', email: 'email',
    telefono: 'cellulare', indirizzo: 'indirizzo', fatturazione: 'dati di fatturazione', statoIdentita: 'stato dell’identità',
    motivoIntegrazione: 'motivo dell’integrazione',
};

// Cosa fa una persona in CRIA → l'area da cui guarda.
const AREA_DEL_RUOLO = {
    admin: 'admin', interno: 'admin', proprietario: 'locatore', inquilino: 'inquilino', cliente: 'cliente', commerciale: 'commerciale', avvocato: 'avvocato',
};

/** Da una riga del database (con i suoi ruoli) alla persona come la usano le pagine. */
export const personaDaRiga = (riga, ruoli = []) => {
    const demo = riga.codice_demo ? trovaPersonaDemo(riga.codice_demo) : null;
    const admin = ruoli.some(r => r.ruolo === 'admin');
    const interno = ruoli.find(r => r.ruolo === 'interno');
    return {
        id: riga.codice_demo || riga.id,
        personaDb: riga.id,
        utenteId: riga.utente_id,
        codiceDemo: riga.codice_demo || null,
        tipo: riga.tipo,
        nome: riga.nome || '',
        cognome: riga.cognome || '',
        ragioneSociale: riga.ragione_sociale,
        partitaIva: riga.partita_iva,
        codiceFiscale: riga.codice_fiscale,
        dataNascita: riga.data_nascita,
        luogoNascita: riga.luogo_nascita,
        email: riga.email,
        telefono: riga.telefono,
        indirizzo: riga.indirizzo,
        fatturazione: riga.fatturazione,
        statoIdentita: riga.stato_identita,
        motivoIntegrazione: riga.motivo_integrazione,
        tipoAccount: riga.tipo_account,
        creataIl: riga.creata_il ? String(riga.creata_il).slice(0, 10) : null,
        emailVerificata: true,
        posizioni: demo?.posizioni || [],
        aree: [...new Set(ruoli.map(r => AREA_DEL_RUOLO[r.ruolo]).filter(Boolean))],
        ruoli: ruoli.map(r => r.ruolo),
        admin,
        funzione: admin ? 'admin' : interno?.funzione || null,
        operatoreId: admin ? 'admin' : interno ? riga.codice_demo : null,
        descrizione: demo?.descrizione || null,
    };
};

// ─── Modo demo: le stesse persone, nel browser ────────────────────────────────
// Le righe nascono dalle persone demo; il browser tiene le modifiche, il
// registro e i ruoli aggiunti (cliente dopo il primo acquisto).
const store = creaStoreDemo('criaPersoneDemo', () => ({ modifiche: {}, registro: [], ruoli: {} }));

const rigaDemo = (p) => ({
    id: p.id, utente_id: p.id, codice_demo: p.id, tipo: p.tipo || 'fisica',
    nome: p.nome || null, cognome: p.cognome || null, ragione_sociale: p.ragioneSociale || null, partita_iva: p.partitaIva || null,
    codice_fiscale: p.codiceFiscale || (p.tipo === 'giuridica' ? p.fatturazione?.codiceFiscale || p.partitaIva : null) || null,
    data_nascita: p.dataNascita || null, luogo_nascita: p.luogoNascita || null, email: p.email || null, telefono: p.telefono || null,
    indirizzo: null, fatturazione: p.fatturazione || null, stato_identita: p.statoIdentita || 'non_caricato',
    motivo_integrazione: null, tipo_account: null, creata_il: '2026-01-01',
});

const ruoliDemo = (p, aggiunti = []) => {
    const r = [];
    if (p.id === 'admin') r.push({ ruolo: 'admin' });
    const operatore = p.operatoreId && p.operatoreId !== 'admin' ? trovaOperatore(p.operatoreId) : null;
    if (operatore) r.push({ ruolo: 'interno', funzione: operatore.funzione });
    if ((p.posizioni || []).some(x => x.verso === 'locatore')) r.push({ ruolo: 'proprietario' });
    if ((p.posizioni || []).some(x => x.verso === 'conduttore')) r.push({ ruolo: 'inquilino' });
    ['cliente', 'commerciale', 'avvocato'].filter(a => (p.aree || []).includes(a)).forEach(a => r.push({ ruolo: a }));
    aggiunti.filter(a => !r.some(x => x.ruolo === a)).forEach(a => r.push({ ruolo: a }));
    return r;
};

const personeDemo = (s = store.leggi()) => PERSONE_DEMO.map(p => personaDaRiga(
    { ...rigaDemo(p), ...(s.modifiche?.[p.id] || {}) },
    ruoliDemo(p, s.ruoli?.[p.id] || []),
));

// ─── Lettura ──────────────────────────────────────────────────────────────────
/** La persona di chi è entrato. Nel modo demo, per id della persona demo. */
export const caricaMiaPersona = async (utenteId) => {
    if (MODO_DEMO) return personeDemo().find(p => p.id === utenteId) || null;
    const { data: riga, error } = await supabase.from('persone').select('*').eq('utente_id', utenteId).maybeSingle();
    if (error) throw error;
    if (!riga) return null;
    const { data: ruoli, error: e2 } = await supabase.from('ruoli').select('ruolo, funzione').eq('persona_id', riga.id);
    if (e2) throw e2;
    return personaDaRiga(riga, ruoli || []);
};

/** Tutte le persone: le legge chi lavora dentro CRIA (per gli altri il database ne dà una, la propria). */
export const caricaPersone = async () => {
    if (MODO_DEMO) return personeDemo();
    const [{ data: righe, error }, { data: ruoli, error: e2 }] = await Promise.all([
        supabase.from('persone').select('*').order('creata_il'),
        supabase.from('ruoli').select('persona_id, ruolo, funzione'),
    ]);
    if (error || e2) throw error || e2;
    return (righe || []).map(r => personaDaRiga(r, (ruoli || []).filter(x => x.persona_id === r.id)));
};

/** Il registro delle modifiche di una persona, dalla più recente. */
export const caricaModifiche = async (personaDb) => {
    if (MODO_DEMO) {
        return (store.leggi().registro || []).filter(v => v.personaDb === personaDb).sort((a, b) => b.il.localeCompare(a.il));
    }
    const { data, error } = await supabase.from('persone_modifiche').select('*').eq('persona_id', personaDb).order('il', { ascending: false });
    if (error) throw error;
    return (data || []).map(v => ({
        personaDb: v.persona_id, campo: CAMPO_DI[v.campo] || v.campo, prima: v.prima, dopo: v.dopo,
        daPersona: v.da_persona, daEmail: v.da_email, motivo: v.motivo, il: v.il,
    }));
};

// Le persone per chi lavora dentro CRIA, aggiornate a ogni modifica.
export const usePersone = ({ attivo = true } = {}) => {
    const [persone, setPersone] = useState([]);
    useEffect(() => {
        if (!attivo) return undefined;
        let vivo = true;
        const carica = () => caricaPersone().then(p => vivo && setPersone(p)).catch(() => vivo && setPersone([]));
        carica();
        window.addEventListener(EVENTO_PERSONE, carica);
        return () => {
            vivo = false;
            window.removeEventListener(EVENTO_PERSONE, carica);
        };
    }, [attivo]);
    return persone;
};

export const useModifiche = (personaDb) => {
    const [voci, setVoci] = useState([]);
    useEffect(() => {
        if (!personaDb) return undefined;
        let vivo = true;
        const carica = () => caricaModifiche(personaDb).then(v => vivo && setVoci(v)).catch(() => vivo && setVoci([]));
        carica();
        window.addEventListener(EVENTO_PERSONE, carica);
        return () => {
            vivo = false;
            window.removeEventListener(EVENTO_PERSONE, carica);
        };
    }, [personaDb]);
    return voci;
};

// ─── Scrittura ────────────────────────────────────────────────────────────────
export const MESSAGGI_PERSONE = {
    email_usata: 'Questa email è già di un’altra persona in CRIA.',
    telefono_usato: 'Questo cellulare è già di un’altra persona in CRIA.',
    codice_fiscale_usato: 'Questo codice fiscale è già di un’altra persona in CRIA.',
    motivo: 'Scrivi perché cambi i dati di questa persona.',
    permesso: 'Non puoi cambiare questi dati.',
    identita: 'L’identità la verifica CRIA.',
    non_valido: 'Uno dei dati non è scritto bene: controlla email, cellulare e codici.',
    rete: 'Non sono riuscito a salvare: riprova tra poco.',
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO = /^\+?[0-9 ]{6,20}$/;
const CODICE = /^([A-Z0-9]{16}|[0-9]{11})$/;
const soloCifre = (t) => String(t || '').replace(/[^0-9+]/g, '');

// Le stesse regole di aggiorna_persona, per il modo demo.
const controllaDemo = (bersaglio, campi, { motivo, attore, simulazione }) => {
    const chi = personeDemo().find(p => p.id === attore);
    const admin = Boolean(chi?.admin);
    if (!admin && bersaglio.id !== attore) return 'permesso';
    const soloAdmin = ['tipo', 'partitaIva', 'codiceFiscale'];
    if (!admin && Object.keys(campi).some(k => soloAdmin.includes(k))) return 'permesso';
    if (!admin && !simulazione && 'statoIdentita' in campi && campi.statoIdentita !== 'in_attesa') return 'identita';
    if (admin && bersaglio.id !== attore && String(motivo || '').trim().length < 5) return 'motivo';
    if ('email' in campi && campi.email && !EMAIL.test(campi.email)) return 'non_valido';
    if ('telefono' in campi && campi.telefono && !TELEFONO.test(campi.telefono)) return 'non_valido';
    if ('codiceFiscale' in campi && campi.codiceFiscale && !CODICE.test(String(campi.codiceFiscale).toUpperCase().replace(/\s/g, ''))) return 'non_valido';
    if ('partitaIva' in campi && campi.partitaIva && !/^\d{11}$/.test(String(campi.partitaIva).replace(/\s/g, ''))) return 'non_valido';
    const altri = personeDemo().filter(p => p.id !== bersaglio.id);
    if (campi.email && altri.some(p => (p.email || '').toLowerCase() === campi.email.toLowerCase())) return 'email_usata';
    if (campi.telefono && altri.some(p => p.telefono && soloCifre(p.telefono) === soloCifre(campi.telefono))) return 'telefono_usato';
    if (campi.codiceFiscale && altri.some(p => (p.codiceFiscale || '').toUpperCase() === String(campi.codiceFiscale).toUpperCase())) return 'codice_fiscale_usato';
    return null;
};

const erroreDaDatabase = (error) => {
    const testo = `${error?.message || ''}`;
    if (['email_usata', 'telefono_usato', 'codice_fiscale_usato'].includes(testo)) return testo;
    if (error?.code === '22023') return 'motivo';
    if (error?.code === '42501') return /identità/i.test(testo) ? 'identita' : 'permesso';
    if (error?.code === '23514' || /dato_non_valido/.test(testo)) return 'non_valido';
    return 'rete';
};

// I valori come li vuole la tabella: testi ripuliti, vuoti a null.
const pulito = (campo, valore) => {
    if (valore == null) return null;
    if (typeof valore === 'object') return valore;
    const t = String(valore).trim();
    if (!t) return null;
    if (campo === 'codiceFiscale') return t.toUpperCase().replace(/\s/g, '');
    if (campo === 'partitaIva') return t.replace(/\s/g, '');
    if (campo === 'email') return t.toLowerCase();
    return t;
};

/**
 * Cambia i dati di una persona.
 * @param {object} persona  la persona (serve personaDb, e id nel modo demo)
 * @param {object} campi    { nome, email, … } come li usano le pagine
 * @param {{ motivo?: string, attore?: string, simulazione?: boolean }} opzioni
 *        attore: nel modo demo, l'id di chi agisce (in piattaforma lo sa il database)
 *        simulazione: solo nel modo demo, per i bottoni che simulano l'esito della verifica
 * @returns {Promise<{ ok: true, persona: object } | { ok: false, errore: string, messaggio: string }>}
 */
export const aggiornaDatiPersona = async (persona, campi, { motivo = null, attore = null, simulazione = false } = {}) => {
    const puliti = Object.fromEntries(Object.entries(campi).filter(([k]) => COLONNE[k]).map(([k, v]) => [k, pulito(k, v)]));
    if (!Object.keys(puliti).length) return { ok: true, persona };
    if (MODO_DEMO) {
        const errore = controllaDemo(persona, puliti, { motivo, attore, simulazione });
        if (errore) return { ok: false, errore, messaggio: MESSAGGI_PERSONE[errore] };
        const cambiati = Object.keys(puliti).filter(k => JSON.stringify(persona[k] ?? null) !== JSON.stringify(puliti[k]));
        if (!cambiati.length) return { ok: true, persona };
        const il = new Date().toISOString();
        store.aggiorna(s => ({
            ...s,
            modifiche: {
                ...s.modifiche,
                [persona.id]: { ...(s.modifiche?.[persona.id] || {}), ...Object.fromEntries(cambiati.map(k => [COLONNE[k], puliti[k]])) },
            },
            registro: [
                ...cambiati.map(k => ({
                    personaDb: persona.personaDb || persona.id, campo: k,
                    prima: persona[k] == null ? null : typeof persona[k] === 'object' ? JSON.stringify(persona[k]) : String(persona[k]),
                    dopo: puliti[k] == null ? null : typeof puliti[k] === 'object' ? JSON.stringify(puliti[k]) : String(puliti[k]),
                    daPersona: attore, daEmail: personeDemo().find(p => p.id === attore)?.email || null, motivo: motivo?.trim() || null, il,
                })),
                ...(s.registro || []),
            ].slice(0, 500),
        }));
        annuncia();
        return { ok: true, persona: personeDemo().find(p => p.id === persona.id) };
    }
    const pCampi = Object.fromEntries(Object.entries(puliti).map(([k, v]) => [COLONNE[k], v]));
    const { data, error } = await supabase.rpc('aggiorna_persona', { p_persona: persona.personaDb, p_campi: pCampi, p_motivo: motivo });
    if (error) {
        const codice = erroreDaDatabase(error);
        return { ok: false, errore: codice, messaggio: MESSAGGI_PERSONE[codice] };
    }
    annuncia();
    return { ok: true, riga: data };
};

/** Al primo acquisto di CRIA Verifica la persona diventa cliente. */
export const diventaCliente = async (persona) => {
    if (MODO_DEMO) {
        store.aggiorna(s => ({ ...s, ruoli: { ...s.ruoli, [persona.id]: [...new Set([...(s.ruoli?.[persona.id] || []), 'cliente'])] } }));
        annuncia();
        return { ok: true };
    }
    const { error } = await supabase.rpc('diventa_cliente');
    if (error) return { ok: false, errore: 'rete', messaggio: MESSAGGI_PERSONE.rete };
    annuncia();
    return { ok: true };
};

/** Prima di iscriversi: email, cellulare e codice fiscale sono liberi? */
export const datiGiaUsati = async ({ email, telefono = null, codiceFiscale = null }) => {
    if (MODO_DEMO) {
        const tutte = personeDemo();
        return {
            email: tutte.some(p => (p.email || '').toLowerCase() === String(email).trim().toLowerCase()),
            telefono: Boolean(telefono) && tutte.some(p => p.telefono && soloCifre(p.telefono) === soloCifre(telefono)),
            codiceFiscale: Boolean(codiceFiscale) && tutte.some(p => (p.codiceFiscale || '').toUpperCase() === String(codiceFiscale).toUpperCase()),
        };
    }
    const { data, error } = await supabase.rpc('dati_gia_usati', { p_email: email, p_telefono: telefono, p_codice_fiscale: codiceFiscale });
    if (error) throw error;
    return { email: Boolean(data?.email), telefono: Boolean(data?.telefono), codiceFiscale: Boolean(data?.codice_fiscale) };
};

export const ripristinaPersoneDemo = () => {
    store.ripristina();
    annuncia();
};
