import { useCallback, useEffect, useMemo, useState } from 'react';
import { VERIFICHE, verificheDi, nuovoCredito } from '@/data/verifiche';
import { OGGI } from '@/data/datiDemo';
import { contrattiAttuali, contrattiPerVerso } from '@/lib/contrattiFonte';
import { PERSONE_DEMO } from '@/data/personeDemo';
import { analizzaMesi, SEMAFORO, MESI_SEMAFORO } from '@/lib/semaforo';
import { creaFonte } from '@/lib/fonteDb';
import { supabase, MODO_DEMO } from '@/lib/supabase';

// ═════════════════════════════════════════════════════════════════════════════
// CRIA VERIFICA NEI MOCKUP — E-03, E-04, E-05
// Le verifiche richieste e gli esiti simulati restano nel browser, così il
// percorso si prova da capo a fondo: richiesta, pagamento, attesa, esito.
// Fase 4: tabella verifiche; l'esito lo prepara CRIA, non il browser.
// ═════════════════════════════════════════════════════════════════════════════

const CHIAVE = 'criaVerificheDemo'; // { nuove: [verifica], modifiche: { [id]: {...} } }
const EVENTO = 'cria-verifiche';

const vuoto = () => ({ nuove: [], modifiche: {} });

// Senza storage (navigazione privata, blocchi) la demo resta in memoria.
let inMemoria = null;

const leggi = () => {
    try {
        const s = JSON.parse(localStorage.getItem(CHIAVE)) || {};
        return { nuove: Array.isArray(s.nuove) ? s.nuove : [], modifiche: s.modifiche || {} };
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

const conModifiche = (s) => (v) => ({ ...v, ...(s.modifiche[v.id] || {}) });

const nuovoId = () => `ver-${Date.now().toString(36)}${Math.floor(Math.random() * 36 ** 4).toString(36)}`;

// ─── Esito simulato ───────────────────────────────────────────────────────────
// In piattaforma l'esito lo prepara CRIA. Nei mockup: un candidato già
// verificato nelle demo dà lo stesso esito; se il codice fiscale è di una
// persona demo con contratti da inquilino, il semaforo si calcola dai suoi mesi
// come farà la piattaforma; per gli altri esce un esito plausibile, sempre lo
// stesso per lo stesso codice fiscale.
const PLAUSIBILI = [
    { semaforo: 'verde', media: 2, insoluti: 0, mesiConsiderati: MESI_SEMAFORO },
    { semaforo: 'verde', media: 4.5, insoluti: 0, mesiConsiderati: MESI_SEMAFORO },
    { semaforo: 'giallo', media: 7.5, insoluti: 0, mesiConsiderati: MESI_SEMAFORO },
    { semaforo: 'rosso', media: 8, insoluti: 1, mesiConsiderati: MESI_SEMAFORO },
    { semaforo: 'storico_insufficiente', media: 3, insoluti: 0, mesiConsiderati: 2 },
    null,
    null,
];

const indice = (testo, n) => [...testo].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % n;

const giorno = (media) => String(media).replace('.', ',');

// Solo semaforo e sintesi: il giorno medio e se c'è un mese non pagato, mai
// quali mesi, quanto, o su quali contratti.
const sintesiDa = ({ semaforo, media, insoluti, mesiConsiderati }) => {
    if (semaforo === 'storico_insufficiente') {
        return `Storico rilevato da CRIA troppo breve. ${SEMAFORO.storico_insufficiente.spiegazione}.`;
    }
    const parti = media == null ? [] : [`paga in media il giorno ${giorno(media)}`];
    parti.push(insoluti === 0 ? 'nessun mese non pagato' : insoluti === 1 ? 'un mese non pagato' : 'più di un mese non pagato');
    return `Storico rilevato da CRIA su ${mesiConsiderati} mesi: ${parti.join(', ')}.`;
};

const esitoSimulato = (codiceFiscale) => {
    const cf = String(codiceFiscale || '').trim().toUpperCase();
    const giaVerificato = VERIFICHE.find(v => v.esito && v.soggetto.codiceFiscale === cf);
    if (giaVerificato) {
        const { il, ...esito } = giaVerificato.esito;
        return esito;
    }
    const persona = PERSONE_DEMO.find(p => p.codiceFiscale === cf);
    const mesi = persona ? contrattiPerVerso(contrattiAttuali(), persona.id, 'conduttore').flatMap(c => c.mesi) : [];
    let analisi = null;
    if (mesi.length) analisi = analizzaMesi(mesi);
    else if (!persona) analisi = PLAUSIBILI[indice(cf, PLAUSIBILI.length)];
    return analisi
        ? { tipo: 'semaforo', semaforo: analisi.semaforo, sintesi: sintesiDa(analisi) }
        : { tipo: 'nessuna_informazione' };
};

// La fonte: dal database quando c'è, dai dati di prova nel modo demo.
const fonte = creaFonte('verifiche_visibili', () => {
    const s = leggi();
    return [...s.nuove, ...VERIFICHE].map(conModifiche(s));
});
export const verificheAttuali = () => fonte.attuali();
export const scordaVerifiche = () => fonte.scorda();

// ─── Azioni ───────────────────────────────────────────────────────────────────
// Il pagamento è già avvenuto: la verifica nasce in corso, con il suo credito.
export const creaVerifica = (personaId, soggetto) => {
    const { nome, cognome, dataNascita, luogoNascita, codiceFiscale } = soggetto;
    if (!MODO_DEMO) {
        // Nel database la richiesta nasce con il suo credito, e il codice lo fa lui.
        supabase.rpc('chiedi_verifica', { i_dati: { soggetto: { nome, cognome, dataNascita, luogoNascita, codiceFiscale } } })
            .then(({ error }) => { if (!error) fonte.carica(); });
        return { id: null, personaId, richiestaIl: OGGI, soggetto, stato: 'in_corso', esito: null };
    }
    const verifica = {
        id: nuovoId(),
        personaId,
        richiestaIl: OGGI,
        soggetto: { nome, cognome, dataNascita, luogoNascita, codiceFiscale },
        stato: 'in_corso',
        esito: null,
        credito: nuovoCredito(OGGI),
    };
    const s = leggi();
    scrivi({ ...s, nuove: [verifica, ...s.nuove] });
    return verifica;
};

// Solo nei mockup: «Simula l'esito». Restituisce la verifica aggiornata, o null.
export const completaVerificaDemo = (id) => {
    const s = leggi();
    const base = [...s.nuove, ...VERIFICHE].find(v => v.id === id);
    if (!base) return null;
    const attuale = conModifiche(s)(base);
    if (attuale.stato !== 'in_corso') return attuale;
    const cambia = { stato: 'conclusa', esito: { ...esitoSimulato(attuale.soggetto.codiceFiscale), il: OGGI } };
    scrivi({ ...s, modifiche: { ...s.modifiche, [id]: { ...(s.modifiche[id] || {}), ...cambia } } });
    return { ...attuale, ...cambia };
};

// Solo nei mockup: torna alle verifiche di partenza.
export const ripristinaVerificheDemo = () => scrivi(vuoto());

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Le verifiche della persona, base più locali, le più recenti prima. Si
// aggiorna anche quando un'altra scheda crea o completa una verifica.
export const useVerifiche = (personaId) => {
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
    const verifiche = useMemo(() => {
        if (!MODO_DEMO) {
            return dalDatabase.filter(v => v.personaId === personaId)
                .sort((a, b) => String(b.richiestaIl).localeCompare(String(a.richiestaIl)));
        }
        const s = leggi();
        return [...s.nuove.filter(v => v.personaId === personaId), ...verificheDi(personaId)]
            .map(conModifiche(s))
            .sort((a, b) => b.richiestaIl.localeCompare(a.richiestaIl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [personaId, versione, dalDatabase]);
    const trova = useCallback((id) => verifiche.find(v => v.id === id) || null, [verifiche]);
    return { verifiche, trova };
};

// Il back office (lotto 5) vede le verifiche di tutti i clienti.
export const useTutteLeVerifiche = () => {
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
    return useMemo(() => {
        if (!MODO_DEMO) return [...dalDatabase].sort((a, b) => String(b.richiestaIl).localeCompare(String(a.richiestaIl)));
        const s = leggi();
        return [...s.nuove, ...VERIFICHE].map(conModifiche(s)).sort((a, b) => b.richiestaIl.localeCompare(a.richiestaIl));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [versione, dalDatabase]);
};
