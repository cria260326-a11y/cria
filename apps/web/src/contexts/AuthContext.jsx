import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { trovaPersonaDemoPerEmail } from '@/data/personeDemo';
import { contestiDisponibili, nomeVisualizzato } from '@/lib/aree';
import { supabase, MODO_DEMO } from '@/lib/supabase';
import { caricaMiaPersona, aggiornaDatiPersona, diventaCliente, datiGiaUsati, EVENTO_PERSONE } from '@/lib/personeFonte';
import { scordaContratti } from '@/lib/contrattiFonte';
import { scordaDocumenti } from '@/lib/documentiFonte';
import { scordaConversazioni } from '@/lib/conversazioniFonte';
import { scordaCiclo } from '@/lib/cicloFonte';
import { scordaPratiche } from '@/lib/praticheDemo';
import { scordaGaranzia } from '@/lib/garanziaFonte';
import { scordaVerifiche } from '@/lib/verificheDemo';
import { scordaAutocandidature } from '@/lib/autocandidatureDemo';
import { scordaCertificati } from '@/lib/certificatiDemo';

// Quando cambia la persona, tutto quello che dipende da chi guarda si rilegge.
const scordaTutto = () => {
    scordaContratti();
    scordaDocumenti();
    scordaConversazioni();
    scordaCiclo();
    scordaPratiche();
    scordaGaranzia();
    scordaVerifiche();
    scordaAutocandidature();
    scordaCertificati();
};

// ═════════════════════════════════════════════════════════════════════════════
// SESSIONE
// Una persona, le sue posizioni, e il contesto da cui sta guardando.
// Il ruolo non si dichiara: si ricava dai ruoli e dalle posizioni.
//
// L'accesso è vero: email e password su Supabase Auth, sessione nel browser.
// La persona, i suoi dati e i suoi ruoli arrivano dal database (tabelle
// persone e ruoli, db/schema/20_persone.sql); contratti, pratiche e pagamenti
// vengono ancora dai dati di prova, collegati alla persona con codice_demo.
// L'iscrizione crea l'account e, con esso, la persona. Per ora senza la
// conferma dell'email: chi si iscrive entra subito.
//
// Il modo demo (VITE_ACCESSO_DEMO=1, solo sul Mac) serve ai controlli
// automatici: la persona si sceglie scrivendo criaSessioneDemo nel browser, e
// dati e regole sono gli stessi, tenuti nel browser (lib/personeFonte).
// ═════════════════════════════════════════════════════════════════════════════

const AuthContext = createContext(null);
const CHIAVE_DEMO = 'criaSessioneDemo';      // { personaId } — solo in modo demo
const CHIAVE_PREFERENZE = 'criaPreferenze';  // { [personaId]: { area } }

const leggi = (chiave, vuoto) => {
    try {
        return JSON.parse(localStorage.getItem(chiave)) ?? vuoto;
    } catch {
        return vuoto;
    }
};

const scrivi = (chiave, valore) => {
    try {
        if (valore == null) localStorage.removeItem(chiave);
        else localStorage.setItem(chiave, JSON.stringify(valore));
    } catch {
        // storage non disponibile: resta in memoria
    }
};

const ERRORI = {
    invalid_credentials: 'credenziali',
    email_not_confirmed: 'non_confermata',
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth va usato dentro AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    // Nel modo demo l'«utente» è l'id della persona demo.
    const [utenteId, setUtenteId] = useState(() => (MODO_DEMO ? leggi(CHIAVE_DEMO, null)?.personaId ?? null : null));
    const [sessionePronta, setSessionePronta] = useState(MODO_DEMO);
    const [persona, setPersona] = useState(null);
    // Di quale utente è la persona caricata: finché non è quello della sessione, si aspetta.
    const [caricataPer, setCaricataPer] = useState(undefined);
    const [preferenze, setPreferenze] = useState(() => leggi(CHIAVE_PREFERENZE, {}));

    // La sessione la tiene Supabase: all'avvio si legge, poi si segue.
    useEffect(() => {
        if (MODO_DEMO) return undefined;
        let attivo = true;
        supabase.auth.getSession().then(({ data }) => {
            if (!attivo) return;
            setUtenteId(data.session?.user?.id ?? null);
            setSessionePronta(true);
        });
        const { data } = supabase.auth.onAuthStateChange((_evento, sessione) => {
            setUtenteId(sessione?.user?.id ?? null);
        });
        return () => {
            attivo = false;
            data.subscription.unsubscribe();
        };
    }, []);

    // La persona di chi è entrato; si ricarica quando i suoi dati cambiano.
    useEffect(() => {
        if (!sessionePronta) return undefined;
        let vivo = true;
        const carica = () => {
            if (!utenteId) {
                setPersona(null);
                setCaricataPer(null);
                return;
            }
            caricaMiaPersona(utenteId)
                .then(p => { if (vivo) { setPersona(p); setCaricataPer(utenteId); } })
                .catch(() => { if (vivo) { setPersona(null); setCaricataPer(utenteId); } });
        };
        carica();
        window.addEventListener(EVENTO_PERSONE, carica);
        return () => {
            vivo = false;
            window.removeEventListener(EVENTO_PERSONE, carica);
        };
    }, [utenteId, sessionePronta]);

    const mie = (persona && preferenze[persona.id]) || {};
    const contesti = useMemo(() => contestiDisponibili(persona), [persona]);
    const contestoAttivo = contesti.find(c => c.area === mie.area) || null;

    const aggiornaPreferenze = useCallback((id, cambia) => {
        setPreferenze(prev => {
            const prossime = { ...prev, [id]: { ...(prev[id] || {}), ...cambia(prev[id] || {}) } };
            scrivi(CHIAVE_PREFERENZE, prossime);
            return prossime;
        });
    }, []);

    // Dopo l'accesso o l'iscrizione la persona c'è già: la pagina successiva la trova.
    const entra = useCallback((id, trovata) => {
        scordaTutto();
        setPersona(trovata);
        setCaricataPer(id);
        setUtenteId(id);
    }, []);

    // Restituisce { persona } oppure { errore: 'credenziali' | 'non_confermata' | 'senza_profilo' | 'rete' }.
    const accediConPassword = useCallback(async (email, password) => {
        const indirizzo = email.trim().toLowerCase();
        if (MODO_DEMO) {
            const demo = trovaPersonaDemoPerEmail(indirizzo);
            if (!demo) return { errore: 'credenziali' };
            scrivi(CHIAVE_DEMO, { personaId: demo.id });
            const trovata = await caricaMiaPersona(demo.id);
            entra(demo.id, trovata);
            return { persona: trovata };
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email: indirizzo, password });
        if (error) return { errore: ERRORI[error.code] || (error.status === 400 ? 'credenziali' : 'rete') };
        let trovata = null;
        try {
            trovata = await caricaMiaPersona(data.user.id);
        } catch {
            return { errore: 'rete' };
        }
        if (!trovata) {
            await supabase.auth.signOut();
            return { errore: 'senza_profilo' };
        }
        entra(data.user.id, trovata);
        return { persona: trovata };
    }, [entra]);

    // L'iscrizione. Restituisce { ok, persona } oppure
    // { errore: 'email_usata' | 'telefono_usato' | 'debole' | 'rete' }.
    // Nel modo demo non crea niente: la pagina mostra l'esito simulato.
    const registrati = useCallback(async (dati) => {
        const email = dati.email.trim().toLowerCase();
        let usati;
        try {
            usati = await datiGiaUsati({ email, telefono: dati.telefono });
        } catch {
            return { errore: 'rete' };
        }
        if (usati.email) return { errore: 'email_usata' };
        if (usati.telefono) return { errore: 'telefono_usato' };
        if (MODO_DEMO) return { ok: true, simulata: true };
        const { data, error } = await supabase.auth.signUp({
            email,
            password: dati.password,
            options: {
                data: {
                    tipo: dati.tipo,
                    nome: dati.nome,
                    cognome: dati.cognome,
                    ragione_sociale: dati.ragioneSociale || null,
                    partita_iva: dati.partitaIva || null,
                    telefono: dati.telefono,
                    tipo_account: dati.tipoAccount,
                },
            },
        });
        if (error) {
            if (['user_already_exists', 'email_exists'].includes(error.code)) return { errore: 'email_usata' };
            if (error.code === 'weak_password') return { errore: 'debole' };
            return { errore: 'rete' };
        }
        // Con la conferma dell'email spenta la sessione c'è subito.
        if (!data.session) return { ok: true, confermaEmail: true };
        let trovata = null;
        try {
            trovata = await caricaMiaPersona(data.user.id);
        } catch {
            // la persona si ricarica al prossimo giro
        }
        entra(data.user.id, trovata);
        return { ok: true, persona: trovata };
    }, [entra]);

    const scegliContesto = useCallback((area) => {
        if (persona) aggiornaPreferenze(persona.id, () => ({ area }));
    }, [persona, aggiornaPreferenze]);

    // I dati della persona che è entrata: vanno nel database, con le regole di
    // aggiorna_persona. Restituisce { ok } oppure { ok: false, messaggio }.
    // `simulazione` vale solo nel modo demo, per i bottoni che simulano la
    // verifica dell'identità.
    const aggiornaPersona = useCallback(async (modifiche, { simulazione = false } = {}) => {
        if (!persona) return { ok: false, messaggio: 'Serve l’accesso.' };
        const { aree, ...campi } = modifiche;
        if (aree?.includes('cliente') && !persona.aree.includes('cliente')) {
            const esito = await diventaCliente(persona);
            if (!esito.ok) return esito;
        }
        return aggiornaDatiPersona(persona, campi, { attore: persona.id, simulazione: MODO_DEMO && simulazione });
    }, [persona]);

    const esci = useCallback(async () => {
        scordaTutto();
        if (persona) aggiornaPreferenze(persona.id, () => ({ area: null }));
        setPersona(null);
        setCaricataPer(null);
        setUtenteId(null);
        if (MODO_DEMO) {
            scrivi(CHIAVE_DEMO, null);
            return;
        }
        await supabase.auth.signOut();
    }, [persona, aggiornaPreferenze]);

    const value = {
        persona,
        contesti,
        contestoAttivo,
        accediConPassword,
        registrati,
        scegliContesto,
        aggiornaPersona,
        esci,
        loading: !sessionePronta || (Boolean(utenteId) && caricataPer !== utenteId),
        isAuthenticated: !!persona,
        // Compatibilità con il codice che legge ancora user e logout
        user: persona ? {
            id: persona.id,
            name: nomeVisualizzato(persona),
            email: persona.email,
            role: contestoAttivo?.area || null,
        } : null,
        logout: esci,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
