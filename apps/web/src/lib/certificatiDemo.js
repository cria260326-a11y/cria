import { useEffect, useMemo, useState } from 'react';
import { CERTIFICATI } from '@/data/certificati';
import { OGGI, CONTESTAZIONI } from '@/data/datiDemo';
import { contrattiAttuali, contrattiPerVerso } from '@/lib/contrattiFonte';
import { trovaPersonaDemo } from '@/data/personeDemo';
import { MOROSITA } from '@/data/pratiche';
import { PARAMETRI } from '@/data/catalogo';
import { analizzaMesi, esitoMese, ORDINE_SEMAFORO, MESI_SEMAFORO } from '@/lib/semaforo';
import { fmtDataLunga, nomeMese } from '@/lib/formato';
import { nomeVisualizzato } from '@/lib/aree';
import { creaFonte } from '@/lib/fonteDb';
import { MODO_DEMO } from '@/lib/supabase';

// ═════════════════════════════════════════════════════════════════════════════
// CERTIFICATI NEI MOCKUP — I-07, I-08, E-06 (documento di stato §15.1)
// I certificati nuovi, le revoche e il registro delle verifiche restano nel
// browser, così emissione, consegna del codice e verifica pubblica si provano da
// capo a fondo. Il valore del periodo non si scrive a mano: si ricava dai mesi
// della persona dentro il periodo, su tutti i suoi contratti da inquilino.
// Fase 4: tabelle certificati e verifiche_certificato, rate limit sul server.
// ═════════════════════════════════════════════════════════════════════════════

const CHIAVE = 'criaCertificatiDemo'; // { nuovi: [certificato], modifiche: { [id]: {...} }, verifiche: { [id]: ['AAAA-MM-GG hh:mm'] } }
const EVENTO = 'cria-certificati';

export const INDIRIZZO_VERIFICA = 'cri-affitti.it/verifica-certificato';
export const PERCORSO_VERIFICA = '/verifica-certificato';

const vuoto = () => ({ nuovi: [], modifiche: {}, verifiche: {} });

// Senza storage (navigazione privata, blocchi) la demo resta in memoria.
let inMemoria = null;

const leggi = () => {
    try {
        const s = JSON.parse(localStorage.getItem(CHIAVE)) || {};
        return {
            nuovi: Array.isArray(s.nuovi) ? s.nuovi : [],
            modifiche: s.modifiche || {},
            verifiche: s.verifiche || {},
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

// Base e locali insieme, con revoche e verifiche locali applicate; i più recenti prima.
const tuttiICertificati = (s = leggi()) => [...s.nuovi, ...CERTIFICATI]
    .map(c => ({
        ...c,
        ...(s.modifiche[c.id] || {}),
        verifiche: [...(c.verifiche || []), ...(s.verifiche[c.id] || [])],
    }))
    .sort((a, b) => b.emessoIl.localeCompare(a.emessoIl));

// ─── Date e periodi ───────────────────────────────────────────────────────────
const spostaMese = (mese, n) => {
    const [a, m] = mese.split('-').map(Number);
    const tot = a * 12 + (m - 1) + n;
    return `${Math.floor(tot / 12)}-${String((tot % 12) + 1).padStart(2, '0')}`;
};

const giorniNelMese = (mese) => {
    const [a, m] = mese.split('-').map(Number);
    return new Date(Date.UTC(a, m, 0)).getUTCDate();
};

const contaMesi = (dal, al) => {
    const [a1, m1] = dal.split('-').map(Number);
    const [a2, m2] = al.split('-').map(Number);
    return (a2 * 12 + m2) - (a1 * 12 + m1) + 1;
};

// '2026-08-31' + 6 mesi → '2027-02-28': se il giorno non esiste, l'ultimo del mese.
const aggiungiMesi = (iso, n) => {
    const mese = spostaMese(iso.slice(0, 7), n);
    const giorno = Math.min(Number(iso.slice(8, 10)), giorniNelMese(mese));
    return `${mese}-${String(giorno).padStart(2, '0')}`;
};

// Il periodo di un certificato emesso oggi: i 12 mesi chiusi prima del mese
// dell'emissione. Con OGGI = 2026-09-15 → da 2025-09 a 2026-08.
export const periodoDaCertificare = (emessoIl = OGGI) => {
    const al = spostaMese(emessoIl.slice(0, 7), -1);
    return { dal: spostaMese(al, -(MESI_SEMAFORO - 1)), al };
};

// { dal: '2025-08', al: '2026-07' } → 'dal 1 agosto 2025 al 31 luglio 2026'
export const fmtPeriodo = ({ dal, al }) =>
    `dal ${fmtDataLunga(`${dal}-01`)} al ${fmtDataLunga(`${al}-${giorniNelMese(al)}`)}`;

// { dal: '2025-09', al: '2026-08' } → 'da settembre 2025 ad agosto 2026'
export const fmtPeriodoMesi = ({ dal, al }) => {
    const fine = nomeMese(al).toLowerCase();
    return `da ${nomeMese(dal).toLowerCase()} ${fine.startsWith('a') ? 'ad' : 'a'} ${fine}`;
};

// ─── Validità ─────────────────────────────────────────────────────────────────
// Vale sei mesi dall'emissione. Scaduto non vuol dire falso: vuol dire vecchio.
export const scadenzaCertificato = (c) => c.validoFinoAl || aggiungiMesi(c.emessoIl, PARAMETRI.mesiValiditaCertificato);

export const statoCertificato = (c, oggi = OGGI) => {
    if (c.revocatoIl) return 'revocato';
    return oggi > scadenzaCertificato(c) ? 'scaduto' : 'valido';
};

export const STATO_CERTIFICATO = {
    valido: { etichetta: 'Valido', classe: 'bg-green-100 text-green-800' },
    scaduto: { etichetta: 'Scaduto', classe: 'bg-gray-100 text-gray-700' },
    revocato: { etichetta: 'Revocato', classe: 'bg-red-100 text-red-800' },
};

// 'FRRGLI92D45F205W' → 'FRR••••••••••••W'. Un foglio che circola non porta in
// giro data e luogo di nascita: per il riscontro bastano nome e data.
export const mascheraCodiceFiscale = (cf) => {
    const s = String(cf || '').trim().toUpperCase();
    if (s.length < 5) return '—';
    return `${s.slice(0, 3)}${'•'.repeat(s.length - 4)}${s.slice(-1)}`;
};

// ─── I fatti del certificato ──────────────────────────────────────────────────
const RETTIFICATE = new Set(CONTESTAZIONI.filter(k => k.stato === 'risolta_favore_inquilino').map(k => k.id));

// Conta la segnalazione di mancato pagamento definitiva: non quella ancora
// contestabile o contestata, non quella rettificata da una contestazione vinta.
const segnalazioneDefinitiva = (m) =>
    m.segnalazione?.tipo === 'non_pagato'
    && esitoMese(m) !== 'in_sospeso'
    && !(m.contestazioneId && RETTIFICATE.has(m.contestazioneId));

// Calcolo puro: dal certificato e dai contratti da inquilino della persona.
// Il periodo e lo storico complessivo sono due campi distinti: lo storico conta
// tutti i mesi su CRIA fino alla fine del periodo, anche quelli prima.
// Il certificato su autocandidatura (P7) porta con sé i mesi istruiti sulla
// documentazione: entrano nel valore del periodo, non nello storico su CRIA, e
// dove CRIA ha rilevato lo stesso mese vale il mese rilevato.
export const fattiCertificato = (certificato, contratti = []) => {
    const { dal, al } = certificato.periodo;
    const dentro = (mese) => mese >= dal && mese <= al;
    const mesi = contratti.flatMap(c => c.mesi.map(m => ({ ...m, contrattoId: c.id })));
    const rilevati = new Set(mesi.map(m => m.mese));
    const documentati = (certificato.mesiDocumentati || []).filter(m => !rilevati.has(m.mese));
    const delPeriodo = [...mesi, ...documentati].filter(m => dentro(m.mese));
    const analisi = analizzaMesi(delPeriodo);
    const finoAlPeriodo = mesi.filter(m => m.mese <= al);
    const mesiStorico = [...new Set(finoAlPeriodo.map(m => m.mese))].sort();
    const ids = new Set(contratti.map(c => c.id));

    return {
        valore: analisi.semaforo,
        media: analisi.media,
        mensilitaVerificate: analisi.rilevati,   // mesi con un pagamento o un mancato pagamento registrato
        mesiDelPeriodo: contaMesi(dal, al),
        segnalazioni: delPeriodo.filter(segnalazioneDefinitiva).length,
        // Un accordo di rientro è un piano accettato (in corso o chiuso) su mesi del periodo.
        accordi: MOROSITA.filter(p => ids.has(p.contrattoId) && p.piano && p.stato !== 'piano_proposto' && p.mesi.some(dentro)).length,
        storico: {
            mesi: mesiStorico.length,
            contratti: new Set(finoAlPeriodo.map(m => m.contrattoId)).size,
            dal: mesiStorico[0] || null,
        },
    };
};

// Peggiorato = più avanti nell'ordine verde → giallo → rosso. «Storico
// insufficiente» non è un colore: non peggiora e non migliora nessuno.
const COLORI = ORDINE_SEMAFORO.filter(s => s !== 'storico_insufficiente');

export const semaforoPeggiorato = (certificato, attuale) => {
    const prima = COLORI.indexOf(certificato);
    return prima >= 0 && COLORI.indexOf(attuale) > prima;
};

// ─── Codici ───────────────────────────────────────────────────────────────────
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'; // [A-Z2-9]: niente 0 e 1

const casuali = (n) => {
    const out = new Uint32Array(n);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(out);
    else for (let i = 0; i < n; i++) out[i] = Math.floor(Math.random() * 2 ** 32);
    return Array.from(out);
};

const nuovoCodice = () => {
    const s = casuali(8).map(x => ALFABETO[x % ALFABETO.length]).join('');
    return `CRIA-${s.slice(0, 4)}-${s.slice(4)}`;
};

// Tollera minuscole, spazi, trattini mancanti, il prefisso omesso e il link
// intero incollato: 'cria 7k2q94hf', '7K2Q-94HF' → 'CRIA-7K2Q-94HF'.
// Restituisce null se il testo non ha la forma di un codice.
export const normalizzaCodice = (testo) => {
    const t = String(testo || '').toUpperCase();
    const m = t.match(/CRIA[\s-]*([A-Z2-9]{4})[\s-]*([A-Z2-9]{4})(?![A-Z0-9])/)
        || t.replace(/[\s-]/g, '').match(/^([A-Z2-9]{4})([A-Z2-9]{4})$/);
    return m ? `CRIA-${m[1]}-${m[2]}` : null;
};

export const cercaCertificato = (testo) => {
    const codice = normalizzaCodice(testo);
    if (!codice) return null;
    return tuttiICertificati().find(c => c.codice === codice) || null;
};

// ─── Azioni ───────────────────────────────────────────────────────────────────
// Un codice per certificato: emetterne uno nuovo non tocca i vecchi, che restano
// verificabili fino alla scadenza salvo revoca.
// Senza opzioni è il certificato con i dati rilevati da CRIA. Il certificato su
// autocandidatura (P7) passa { fonte: 'verificato_su_documentazione' } e, se il
// minimo c'è, il periodo istruito con i mesi letti dalla documentazione; le
// annotazioni sono quello che il certificato dichiara in più (per esempio la
// referenza richiesta e non riscontrata). Accetta anche la sola fonte come stringa.
export const emettiCertificato = (persona, opzioni = {}) => {
    const { fonte = 'rilevato_cria', periodo, mesiDocumentati, annotazioni } =
        typeof opzioni === 'string' ? { fonte: opzioni } : (opzioni || {});
    const s = leggi();
    const usati = new Set(tuttiICertificati(s).map(c => c.codice));
    let codice = nuovoCodice();
    while (usati.has(codice)) codice = nuovoCodice();
    const certificato = {
        id: `cert-${persona.id}-${Date.now().toString(36)}${casuali(1)[0].toString(36).slice(0, 4)}`,
        personaId: persona.id,
        emessoIl: OGGI,
        validoFinoAl: aggiungiMesi(OGGI, PARAMETRI.mesiValiditaCertificato),
        periodo: periodo || periodoDaCertificare(OGGI),
        fonte,
        ...(mesiDocumentati?.length ? { mesiDocumentati } : {}),
        ...(annotazioni?.length ? { annotazioni } : {}),
        codice,
        revocatoIl: null,
        verifiche: [],
    };
    scrivi({ ...s, nuovi: [certificato, ...s.nuovi] });
    return certificato;
};

// La revoca non si annulla. Restituisce il certificato revocato, o null.
export const revocaCodice = (id) => {
    const s = leggi();
    const c = tuttiICertificati(s).find(x => x.id === id);
    if (!c || c.revocatoIl) return null;
    scrivi({ ...s, modifiche: { ...s.modifiche, [id]: { ...(s.modifiche[id] || {}), revocatoIl: OGGI } } });
    return { ...c, revocatoIl: OGGI };
};

// La verifica è anonima: si registra quando, non chi. La demo vive al giorno
// OGGI, quindi la data è quella; l'ora è quella vera.
export const registraVerifica = (testo) => {
    const s = leggi();
    const codice = normalizzaCodice(testo);
    const c = codice && tuttiICertificati(s).find(x => x.codice === codice);
    if (!c) return null;
    const ora = new Date();
    const quando = `${OGGI} ${String(ora.getHours()).padStart(2, '0')}:${String(ora.getMinutes()).padStart(2, '0')}`;
    scrivi({ ...s, verifiche: { ...s.verifiche, [c.id]: [...(s.verifiche[c.id] || []), quando] } });
    return quando;
};

// Solo nei mockup: torna ai certificati di partenza.
export const ripristinaCertificatiDemo = () => scrivi(vuoto());

// ─── Verifica pubblica (E-06) ─────────────────────────────────────────────────
// Restituisce le quattro cose della verifica e niente di più: autenticità,
// periodo e valore, emissione e validità, e se dopo l'emissione il semaforo è
// peggiorato, senza dire di quanto. Il valore di oggi resta qui dentro.
// Nome e codice fiscale mascherato servono a riscontrare il foglio; la fonte
// accompagna il valore perché è il punto che un foglio alterato attaccherebbe.
// Un codice revocato non mostra più nulla della persona.
export const verificaCodice = (testo) => {
    const c = cercaCertificato(testo);
    if (!c) return { esito: 'non_trovato' };
    const stato = statoCertificato(c);
    if (stato === 'revocato') return { esito: 'revocato', codice: c.codice, revocatoIl: c.revocatoIl };

    const persona = trovaPersonaDemo(c.personaId);
    const contratti = contrattiPerVerso(contrattiAttuali(), c.personaId, 'conduttore');
    const { valore } = fattiCertificato(c, contratti);
    const oggi = analizzaMesi(contratti.flatMap(x => x.mesi)).semaforo;
    return {
        esito: stato, // 'valido' | 'scaduto'
        codice: c.codice,
        intestatario: {
            nome: nomeVisualizzato(persona) || '—',
            codiceFiscale: mascheraCodiceFiscale(persona?.codiceFiscale),
        },
        periodo: c.periodo,
        valore,
        fonte: c.fonte,
        annotazioni: c.annotazioni || [],
        emessoIl: c.emessoIl,
        validoFinoAl: scadenzaCertificato(c),
        peggiorato: semaforoPeggiorato(valore, oggi),
    };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
// I certificati della persona, base più locali, i più recenti prima. Si
// aggiorna anche quando un'altra scheda registra una verifica.
const fonte = creaFonte('certificati_visibili', () => tuttiICertificati());
export const certificatiAttuali = () => fonte.attuali();
export const scordaCertificati = () => fonte.scorda();

export const useCertificati = (personaId) => {
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
    const dalDatabase = fonte.usa();
    return useMemo(
        () => (MODO_DEMO ? tuttiICertificati() : dalDatabase).filter(c => c.personaId === personaId),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [personaId, versione, dalDatabase],
    );
};

// Il back office (lotto 5) vede i certificati di tutti.
export const useTuttiICertificati = () => {
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
    const dalDatabase = fonte.usa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => (MODO_DEMO ? tuttiICertificati() : dalDatabase), [versione, dalDatabase]);
};
