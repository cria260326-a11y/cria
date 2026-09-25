import { useEffect, useMemo, useState } from 'react';
import {
    AUTOCANDIDATURE, PROVE_FORTI_MINIME, MESI_MINIMI, TENTATIVI_REFERENZA, GIORNI_LAVORATIVI_REFERENZA,
    ORDINE_CANALI, DICITURA_NON_RISCONTRATA, tipoProva, livelloProva,
} from '@/data/autocandidature';
import { PRODOTTI } from '@/data/catalogo';
import { OGGI } from '@/data/datiDemo';
import { meseSuccessivo } from '@/lib/formato';
import { emettiCertificato } from '@/lib/certificatiDemo';
import { creaFonte } from '@/lib/fonteDb';
import { supabase, MODO_DEMO } from '@/lib/supabase';

// ═════════════════════════════════════════════════════════════════════════════
// AUTOCANDIDATURE NEI MOCKUP — E-07, E-08 con E-09, E-10 (P7)
// L'autocandidatura nuova, le prove, le referenze e le risposte del precedente
// proprietario restano nel browser, così il percorso si prova da capo a fondo:
// pagamento, prove, referenza chiesta e risposta dal link personale, invio,
// istruttoria simulata ed emissione del certificato.
// Il livello di una prova viene dal tipo di documento (data/autocandidature.js):
// qui non si sceglie mai.
// Fase 4: tabelle autocandidature, prove e referenze; tentativi e scadenze li
// gestisce il server.
// ═════════════════════════════════════════════════════════════════════════════

const CHIAVE = 'criaAutocandidatureDemo'; // { nuove: [autocandidatura], modifiche: { [id]: {...} } }
const EVENTO = 'cria-autocandidature';

export const PERCORSO_AUTOCANDIDATURA = '/certificato/autocandidatura';
export const PERCORSO_PROVE = '/certificato/autocandidatura/prove';
export const percorsoReferenza = (token) => `/referenza/${encodeURIComponent(token)}`;

export const MESE_CORRENTE = OGGI.slice(0, 7);

const vuoto = () => ({ nuove: [], modifiche: {} });

// Senza storage (navigazione privata, blocchi) la demo resta in memoria.
let inMemoria = null;

const leggi = () => {
    try {
        const s = JSON.parse(localStorage.getItem(CHIAVE)) || {};
        return {
            nuove: Array.isArray(s.nuove) ? s.nuove : [],
            modifiche: s.modifiche || {},
        };
    } catch {
        return inMemoria || vuoto();
    }
};

const scrivi = (stato) => {
    inMemoria = stato;
    try {
        localStorage.setItem(CHIAVE, JSON.stringify(stato));
    } catch {
        // storage non disponibile: resta in memoria
    }
    window.dispatchEvent(new Event(EVENTO));
};

const tutte = (s = leggi()) => [...s.nuove, ...AUTOCANDIDATURE]
    .map(a => ({ prove: [], referenze: [], ...a, ...(s.modifiche[a.id] || {}) }));

// L'autocandidatura della persona: la più recente, se ce n'è più di una.
export const autocandidaturaDi = (personaId, s = leggi()) =>
    tutte(s)
        .filter(a => a.personaId === personaId)
        .sort((x, y) => y.apertaIl.localeCompare(x.apertaIl))[0] || null;

// Applica le modifiche restituite da `cambia`; se restituisce null non cambia nulla.
const aggiorna = (id, cambia) => {
    const s = leggi();
    const a = tutte(s).find(x => x.id === id);
    if (!a) return null;
    const modifiche = cambia(a);
    if (!modifiche) return null;
    scrivi({ ...s, modifiche: { ...s.modifiche, [id]: { ...(s.modifiche[id] || {}), ...modifiche } } });
    return { ...a, ...modifiche };
};

const aggiornaReferenza = (id, referenzaId, cambia) =>
    aggiorna(id, (a) => {
        const r = (a.referenze || []).find(x => x.id === referenzaId);
        const modifiche = r ? cambia(r, a) : null;
        return modifiche ? { referenze: a.referenze.map(x => (x.id === referenzaId ? { ...x, ...modifiche } : x)) } : null;
    });

// ─── Identificativi e token ───────────────────────────────────────────────────
const ALFABETO = 'abcdefghijkmnpqrstuvwxyz23456789';

const casuale = (n) => {
    const out = new Uint32Array(n);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(out);
    else for (let i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 2 ** 32);
    return Array.from(out, x => ALFABETO[x % ALFABETO.length]).join('');
};

// ─── Mesi e giorni ────────────────────────────────────────────────────────────
// ('2025-11', '2026-02') → ['2025-11', '2025-12', '2026-01', '2026-02']
export const mesiTra = (dal, al) => {
    const out = [];
    if (!dal || !al || dal > al) return out;
    for (let m = dal; m <= al; m = meseSuccessivo(m)) out.push(m);
    return out;
};

export const contaMesi = (dal, al) => mesiTra(dal, al).length;

// Da lunedì a venerdì. Nei mockup le festività non si contano.
export const aggiungiGiorniLavorativi = (iso, n) => {
    const [a, m, g] = iso.split('-').map(Number);
    const d = new Date(Date.UTC(a, m - 1, g));
    let contati = 0;
    while (contati < n) {
        d.setUTCDate(d.getUTCDate() + 1);
        const giorno = d.getUTCDay();
        if (giorno !== 0 && giorno !== 6) contati += 1;
    }
    return d.toISOString().slice(0, 10);
};

// Entro questa data, dopo tre tentativi su canali diversi, la richiesta si chiude.
export const scadenzaReferenza = (r) => aggiungiGiorniLavorativi(r.richiestaIl, GIORNI_LAVORATIVI_REFERENZA);

export const prossimoCanale = (r) => ORDINE_CANALI.find(c => !r.tentativi.some(t => t.canale === c)) || null;

// ─── Il minimo ────────────────────────────────────────────────────────────────
// Due prove forti e indipendenti che coprono almeno 12 mesi. Indipendenti = di
// tipo diverso: due estratti dello stesso conto sommano i mesi, non le prove.
// Un mese è coperto quando ci sono sopra almeno due tipi di prova forte.
// Le prove medie e deboli non entrano nel conto. La referenza conta quando è
// confermata; `referenze` dice quali stati contare, per le proiezioni
// («se conferma…», «senza la referenza…»).
const coperturaPerTipo = (a, statiReferenza) => {
    const perTipo = new Map();
    const aggiungi = (tipo, dal, al) => {
        const mesi = mesiTra(dal, al);
        if (!mesi.length) return;
        if (!perTipo.has(tipo)) perTipo.set(tipo, new Set());
        mesi.forEach(m => perTipo.get(tipo).add(m));
    };
    (a.prove || []).forEach(p => { if (livelloProva(p.tipo) === 'forte') aggiungi(p.tipo, p.dal, p.al); });
    (a.referenze || []).forEach(r => { if (statiReferenza.includes(r.stato)) aggiungi('referenza_proprietario', r.dal, r.al); });
    return perTipo;
};

export const verificaMinimo = (a, { referenze = ['confermata'] } = {}) => {
    const perTipo = coperturaPerTipo(a, referenze);
    const perMese = {};
    perTipo.forEach(mesi => mesi.forEach(m => { perMese[m] = (perMese[m] || 0) + 1; }));
    const mesiCoperti = Object.keys(perMese).filter(m => perMese[m] >= PROVE_FORTI_MINIME).sort();
    return {
        forti: perTipo.size,
        tipiForti: [...perTipo.keys()],
        copertura: mesiCoperti.length,
        mesiCoperti,
        perMese,                       // { 'AAAA-MM': quanti tipi di prova forte lo coprono }
        raggiunto: perTipo.size >= PROVE_FORTI_MINIME && mesiCoperti.length >= MESI_MINIMI,
    };
};

// Una referenza non riscontrata non ferma l'emissione: blocca solo se era una
// delle due prove forti e senza di lei il minimo non c'è.
export const referenzaBloccante = (a, r) => {
    if (r.stato !== 'non_riscontrata' || verificaMinimo(a).raggiunto) return false;
    const seAvesseConfermato = { ...a, referenze: a.referenze.map(x => (x.id === r.id ? { ...x, stato: 'confermata' } : x)) };
    return verificaMinimo(seAvesseConfermato).raggiunto;
};

// ─── Azioni dell'inquilino ────────────────────────────────────────────────────
// Si paga all'avvio: nei mockup il pagamento è simulato. Una per persona.
export const avviaAutocandidatura = (persona, metodo = 'carta') => {
    const s = leggi();
    const esistente = autocandidaturaDi(persona.id, s);
    if (esistente) return esistente;
    const a = {
        id: `auto-${persona.id}-${casuale(6)}`,
        personaId: persona.id,
        apertaIl: OGGI,
        pagamento: { pagataIl: OGGI, importo: PRODOTTI.P7.prezzo, metodo },
        stato: 'prove',
        prove: [],
        referenze: [],
        inviataIl: null,
        sottoMinimo: null,
        conclusaIl: null,
        certificatoId: null,
    };
    scrivi({ ...s, nuove: [a, ...s.nuove] });
    return a;
};

// Il livello non si passa: viene dal tipo.
export const aggiungiProva = (id, { tipo, file, dal, al, immobile = null, estremi = null }) =>
    aggiorna(id, (a) => {
        if (a.stato !== 'prove' || !tipoProva(tipo)?.siCarica || !file || !mesiTra(dal, al).length) return null;
        const prova = { id: `prova-${casuale(8)}`, tipo, file, dal, al, immobile, estremi, caricataIl: OGGI };
        return { prove: [...a.prove, prova] };
    });

export const togliProva = (id, provaId) =>
    aggiorna(id, (a) => (a.stato === 'prove' ? { prove: a.prove.filter(p => p.id !== provaId) } : null));

// Parte solo da qui, cioè solo se la chiede l'inquilino. Il primo tentativo di
// contatto parte subito, al recapito indicato sul contratto.
export const chiediReferenza = (id, { inquilino, nome, email = '', telefono = '', immobile, dal, al }) => {
    if (!MODO_DEMO) {
        const a = fonte.attuali().find(x => x.id === id);
        if (!a?.autocandidaturaDb) return null;
        supabase.rpc('chiedi_referenza', {
            l_autocandidatura: a.autocandidaturaDb, il_nome: nome, l_email: email, il_telefono: telefono,
            l_immobile: immobile, il_dal: dal, l_al: al, l_inquilino: inquilino,
        }).then(({ error }) => { if (!error) fonte.carica(); });
        return true;
    }
    return aggiorna(id, (a) => {
        if (a.stato !== 'prove' || !nome || !(email || telefono) || !immobile || !mesiTra(dal, al).length) return null;
        const referenza = {
            id: `ref-${casuale(8)}`,
            token: casuale(12),
            inquilino,
            proprietario: { nome, email: email || null, telefono: telefono || null },
            immobile,
            dal,
            al,
            richiestaIl: OGGI,
            tentativi: [{ canale: email ? 'email' : 'sms', il: OGGI }],
            stato: 'in_attesa',
            risposta: null,
            replica: null,
        };
        return { referenze: [...(a.referenze || []), referenza] };
    });
};

// La smentita è una contestazione: l'inquilino risponde per primo, con i
// movimenti del suo conto (solo i pagamenti del canone).
export const rispondiAllaSmentita = (id, referenzaId, file) => {
    if (!MODO_DEMO) {
        supabase.rpc('replica_alla_smentita', { la_referenza: referenzaId, il_file: file })
            .then(({ error }) => { if (!error) fonte.carica(); });
        return true;
    }
    return aggiornaReferenza(id, referenzaId, (r) => (r.stato === 'smentita' && !r.replica && file ? { replica: { file, il: OGGI } } : null));
};

// Si può inviare anche sotto il minimo: il certificato riporterà «storico insufficiente».
export const inviaACria = (id) =>
    aggiorna(id, (a) => (a.stato === 'prove'
        ? { stato: 'istruttoria', inviataIl: OGGI, sottoMinimo: !verificaMinimo(a).raggiunto }
        : null));

// ─── La risposta del precedente proprietario (E-10) ───────────────────────────
// La pagina pubblica trova la referenza dal token del link personale e vede
// solo la referenza: niente altro dell'autocandidatura.
export const referenzaDalDatabase = async (token) => {
    const { data, error } = await supabase.rpc('referenza_dal_token', { il_token: token });
    if (error || !data) return null;
    return { ...data, scadenza: scadenzaReferenza({ richiestaIl: data.richiestaIl }) };
};

export const trovaReferenzaPerToken = (token, s = leggi()) => {
    if (!token) return null;
    for (const a of tutte(s)) {
        const r = (a.referenze || []).find(x => x.token === token);
        if (r) return { ...r, scadenza: scadenzaReferenza(r) };
    }
    return null;
};

// esito 'conferma' | 'smentita'. Una smentita senza mesi e senza almeno un
// documento non si registra: senza prova decade e non lascia traccia.
export const rispondiReferenza = async (token, { esito, mesi = [], documenti = [] }) => {
    if (!MODO_DEMO) {
        const { data, error } = await supabase.rpc('rispondi_referenza', {
            il_token: token, l_esito: esito, i_mesi: mesi, i_documenti: documenti.map(d => ({ tipo: d.tipo, nome: d.nome })),
        });
        return !error && data === true;
    }
    return rispondiReferenzaDemo(token, { esito, mesi, documenti });
};

const rispondiReferenzaDemo = (token, { esito, mesi = [], documenti = [] }) => {
    const a = tutte().find(x => (x.referenze || []).some(r => r.token === token));
    const r = a?.referenze.find(x => x.token === token);
    if (!r || r.stato !== 'in_attesa') return null;
    if (esito === 'conferma') {
        return aggiornaReferenza(a.id, r.id, () => ({ stato: 'confermata', risposta: { esito, il: OGGI } }));
    }
    const nelPeriodo = [...new Set(mesi)].filter(m => m >= r.dal && m <= r.al).sort();
    if (esito !== 'smentita' || !nelPeriodo.length || !documenti.length) return null;
    return aggiornaReferenza(a.id, r.id, () => ({
        stato: 'smentita',
        risposta: { esito, il: OGGI, mesi: nelPeriodo, documenti: documenti.map(d => ({ tipo: d.tipo, nome: d.nome })) },
    }));
};

// ─── Simulazioni (solo nei mockup) ────────────────────────────────────────────
// CRIA riprova su un altro canale.
export const simulaTentativo = (id, referenzaId) =>
    aggiornaReferenza(id, referenzaId, (r) => {
        const canale = prossimoCanale(r);
        if (r.stato !== 'in_attesa' || !canale || r.tentativi.length >= TENTATIVI_REFERENZA) return null;
        return { tentativi: [...r.tentativi, { canale, il: OGGI }] };
    });

// Tre tentativi su canali diversi, dieci giorni lavorativi, nessuna risposta.
const chiusaSenzaRisposta = (r) => {
    const tentativi = [...r.tentativi];
    while (tentativi.length < TENTATIVI_REFERENZA) {
        const canale = ORDINE_CANALI.find(c => !tentativi.some(t => t.canale === c));
        if (!canale) break;
        tentativi.push({ canale, il: OGGI });
    }
    return { stato: 'non_riscontrata', tentativi, chiusaIl: scadenzaReferenza(r) };
};

export const simulaNessunaRisposta = (id, referenzaId) =>
    aggiornaReferenza(id, referenzaId, (r) => (r.stato === 'in_attesa' ? chiusaSenzaRisposta(r) : null));

// Nei mockup l'istruttoria legge dai documenti pagamenti regolari: il giorno
// del mese in cui è arrivato il canone, uno per mese coperto.
const GIORNI_DEMO = [3, 2, 4, 1, 3, 2, 5, 2, 3, 1, 4, 2];

// CRIA conclude l'istruttoria. Il tempo si comprime: le referenze ancora in
// attesa si chiudono come non riscontrate e il certificato lo dichiara.
// Una smentita si decide qui: se non regge, non lascia traccia; se è documentata
// e contraddice quello che l'inquilino ha dichiarato, è una dichiarazione falsa
// e l'autocandidatura non è accolta. Il certificato ha la fonte «verificato su
// documentazione»; sotto il minimo nessun mese documentato entra nel valore,
// quindi il valore è «storico insufficiente».
// proveEscluse: le prove che l'istruttoria (O-08) ha giudicato non conformi: non contano per il minimo.
export const concludiIstruttoria = (id, persona, { smentita = 'non_regge', proveEscluse = [] } = {}) => {
    const a = tutte().find(x => x.id === id);
    if (!a || a.stato !== 'istruttoria' || !persona || persona.id !== a.personaId) return null;

    if (smentita === 'fondata' && a.referenze.some(r => r.stato === 'smentita')) {
        return aggiorna(id, () => ({
            stato: 'rifiutata',
            conclusaIl: OGGI,
            referenze: a.referenze.map(r => (r.stato === 'smentita' ? { ...r, contestazione: { esito: 'fondata', il: OGGI } } : r)),
        }));
    }

    const referenze = a.referenze.map(r => {
        if (r.stato === 'in_attesa') return { ...r, ...chiusaSenzaRisposta(r) };
        if (r.stato === 'smentita') return { ...r, contestazione: { esito: 'non_regge', il: OGGI } };
        return r;
    });
    const minimo = verificaMinimo({ ...a, prove: (a.prove || []).filter(p => !proveEscluse.includes(p.id)), referenze });
    const periodo = minimo.raggiunto ? minimo.mesiCoperti.slice(-MESI_MINIMI) : null;
    const certificato = emettiCertificato(persona, {
        fonte: 'verificato_su_documentazione',
        ...(periodo && {
            periodo: { dal: periodo[0], al: periodo[periodo.length - 1] },
            mesiDocumentati: periodo.map((mese, i) => ({
                mese, stato: 'pagato', giorno: GIORNI_DEMO[i % GIORNI_DEMO.length], fonte: 'documentazione',
            })),
        }),
        annotazioni: referenze.some(r => r.stato === 'non_riscontrata') ? [DICITURA_NON_RISCONTRATA] : [],
    });
    return aggiorna(id, () => ({
        stato: 'emessa',
        conclusaIl: OGGI,
        referenze,
        certificatoId: certificato.id,
        esito: { raggiunto: minimo.raggiunto, forti: minimo.forti, copertura: minimo.copertura },
    }));
};

// Torna all'autocandidatura demo di partenza. I certificati già emessi restano.
export const ripristinaAutocandidatureDemo = () => scrivi(vuoto());

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Si aggiornano anche quando un'altra scheda cambia qualcosa: per esempio il
// precedente proprietario che risponde dal suo link.
const useVersione = () => {
    const [versione, setVersione] = useState(0);
    useEffect(() => {
        const ricarica = () => setVersione(v => v + 1);
        window.addEventListener(EVENTO, ricarica);
        window.addEventListener('storage', ricarica);
        return () => {
            window.removeEventListener(EVENTO, ricarica);
            window.removeEventListener('storage', ricarica);
        };
    }, []);
    return versione;
};

const fonte = creaFonte('autocandidature_visibili', () => tutte());
export const autocandidatureAttuali = () => fonte.attuali();
export const scordaAutocandidature = () => fonte.scorda();

export const useAutocandidatura = (personaId) => {
    const versione = useVersione();
    const dalDatabase = fonte.usa();
    return useMemo(
        () => {
            if (!MODO_DEMO) return dalDatabase.find(a => a.personaId === personaId) || null;
            return personaId ? autocandidaturaDi(personaId) : null;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [personaId, versione, dalDatabase],
    );
};

// La pagina pubblica di chi risponde (E-10): senza account, col token del
// link personale. Nel modo demo la referenza sta nel browser.
export const useReferenzaPerToken = (token) => {
    const versione = useVersione();
    const [dalDatabase, setDalDatabase] = useState(null);
    useEffect(() => {
        if (MODO_DEMO || !token) return undefined;
        let vivo = true;
        referenzaDalDatabase(token).then(r => { if (vivo) setDalDatabase(r); });
        return () => { vivo = false; };
    }, [token, versione]);
    return useMemo(
        () => (MODO_DEMO ? trovaReferenzaPerToken(token) : dalDatabase),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [token, versione, dalDatabase],
    );
};

// Il back office (lotto 5) vede le autocandidature di tutti, le più recenti prima.
export const useTutteLeAutocandidature = () => {
    const versione = useVersione();
    const dalDatabase = fonte.usa();
    return useMemo(
        () => (MODO_DEMO
            ? tutte().sort((x, y) => y.apertaIl.localeCompare(x.apertaIl))
            : [...dalDatabase].sort((x, y) => String(y.apertaIl).localeCompare(String(x.apertaIl)))),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [versione, dalDatabase],
    );
};
