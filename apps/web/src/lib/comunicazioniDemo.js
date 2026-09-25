import { useMemo } from 'react';
import { OGGI, CONTESTAZIONI } from '@/data/datiDemo';
import { trovaOperatore } from '@/data/operatori';
import { MODELLI_EMAIL, cicliSolleciti, registroEmailDaiDati, altriMessaggiDaiDati } from '@/data/comunicazioni';
import { useTutteLePratiche } from '@/lib/praticheDemo';
import { useTutteLeVerifiche } from '@/lib/verificheDemo';
import { useTutteLeAutocandidature } from '@/lib/autocandidatureDemo';
import { useContestazioniDemo, applicaEsitoContestazione } from '@/lib/incassiDemo';
import { useGaranzia } from '@/lib/garanziaDemo';
import { useVersioniParametri } from '@/lib/parametriCiclo';
import { creaStoreDemo, nuovoIdDemo } from '@/lib/storeDemo';

// ═════════════════════════════════════════════════════════════════════════════
// COMUNICAZIONI NEI MOCKUP — O-23, O-24
// I registri si ricavano dai dati condivisi e dagli store degli altri schermi:
// una pratica nuova porta il suo invito, un esito simulato la sua email, una
// decisione sulla contestazione l'avviso alle due parti, un contatto del
// gestore della morosità la sua email o il suo SMS. Le email mandate dalla
// sezione restano in questo browser, con chi le ha mandate.
// Fase 4: la Edge Function invia-email (Postmark) scrive email_log, e i webhook
// ne aggiornano lo stato.
// ═════════════════════════════════════════════════════════════════════════════

// La direzione vede i numeri, il DPO controlla chi accede: nessuno dei due
// lavora sui dati dei clienti (§13.5).
export const vedeSoloAggregati = (operatore) => ['direzione', 'dpo'].includes(operatore?.funzione);
export const puoScrivere = (operatore) => Boolean(operatore) && !vedeSoloAggregati(operatore);
export const motivoSoloAggregati = (operatore) => (operatore?.funzione === 'dpo'
    ? 'Il DPO controlla chi accede ai dati, non li usa: qui vede solo i numeri.'
    : 'La direzione vede solo dati aggregati, senza nomi.');

const store = creaStoreDemo('criaComunicazioniDemo', () => ({ inviate: [] }));

export const ripristinaComunicazioniDemo = () => store.ripristina();

// Postmark conferma la consegna poco dopo l'invio: nei mockup, un attimo.
const ATTESA_CONSEGNA = 1200;

/**
 * Manda un'email dalla sezione. Solo modelli manuali, a un destinatario con un indirizzo.
 * @returns {{ ok: boolean, errore?: string, email?: object }}
 */
export const inviaEmail = ({ modello, destinatario, oggetto, testo, contesto }, operatoreId) => {
    const operatore = trovaOperatore(operatoreId);
    if (!puoScrivere(operatore)) return { ok: false, errore: motivoSoloAggregati(operatore) };
    if (!MODELLI_EMAIL[modello]?.manuale) return { ok: false, errore: 'Questo modello non si manda dalla sezione' };
    if (!destinatario?.email) return { ok: false, errore: 'Manca il destinatario' };
    if (!String(oggetto || '').trim() || !String(testo || '').trim()) return { ok: false, errore: 'Servono oggetto e testo' };
    const record = {
        id: nuovoIdDemo('em'),
        modello,
        destinatario,
        il: OGGI,
        oggetto: oggetto.trim(),
        testo: testo.trim(),
        stato: 'in_coda',
        contesto: contesto || 'Dalla sezione Email',
        inviataDa: operatoreId,
    };
    store.aggiorna(s => ({ ...s, inviate: [record, ...(s.inviate || [])] }));
    setTimeout(() => store.aggiorna(s => ({
        ...s,
        inviate: (s.inviate || []).map(x => (x.id === record.id && x.stato === 'in_coda' ? { ...x, stato: 'consegnata' } : x)),
    })), ATTESA_CONSEGNA);
    return { ok: true, email: record };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useCicliSolleciti = () => {
    const versioni = useVersioniParametri();
    return useMemo(() => cicliSolleciti(versioni), [versioni]);
};

// Le contestazioni con le decisioni prese nella loro coda (O-10).
const useContestazioni = () => {
    const stato = useContestazioniDemo();
    return useMemo(() => CONTESTAZIONI.map(k => applicaEsitoContestazione(k, stato)), [stato]);
};

// Le email mandate dalla sezione sono di oggi: vengono prima di tutte le altre.
export const useRegistroEmail = () => {
    const pratiche = useTutteLePratiche();
    const verifiche = useTutteLeVerifiche();
    const autocandidature = useTutteLeAutocandidature();
    const contestazioni = useContestazioni();
    const garanzia = useGaranzia();
    const cicli = useCicliSolleciti();
    const s = store.useStore();
    return useMemo(
        () => [...(s.inviate || []), ...registroEmailDaiDati({ pratiche, verifiche, autocandidature, cicli, contestazioni, garanzia })],
        [s, pratiche, verifiche, autocandidature, cicli, contestazioni, garanzia],
    );
};

export const useAltriMessaggi = () => {
    const pratiche = useTutteLePratiche();
    const autocandidature = useTutteLeAutocandidature();
    const garanzia = useGaranzia();
    const registro = useRegistroEmail();
    return useMemo(
        () => altriMessaggiDaiDati({ pratiche, autocandidature, garanzia, email: registro }),
        [pratiche, autocandidature, garanzia, registro],
    );
};
