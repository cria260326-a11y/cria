import { useEffect, useState } from 'react';
import { supabase, MODO_DEMO } from '@/lib/supabase';
import { documentiAttuali } from '@/lib/documentiFonte';

// ═════════════════════════════════════════════════════════════════════════════
// IL MESE CHE SI MUOVE
// Segnalare, contestare, decidere: le tre azioni del ciclo mensile passano da
// funzioni del database (db/schema/43_ciclo_mensile.sql), che controllano chi
// sta agendo e le regole:
//   · il mese lo segnala il proprietario, e la finestra decide se la copertura
//     di quel mese resta attiva;
//   · la contestazione la apre l'inquilino, entro i giorni previsti;
//   · la decisione che rettifica un mese vuole due firme diverse.
//
// Nel modo demo non si scrive niente: restano i dati di prova nel browser.
// ═════════════════════════════════════════════════════════════════════════════

export const EVENTO_CICLO = 'cria-ciclo';
const annuncia = () => window.dispatchEvent(new Event(EVENTO_CICLO));

let contestazioni = null;
let inCorso = null;

export const contestazioniAttuali = () => contestazioni || [];

export const caricaContestazioni = async () => {
    if (MODO_DEMO) return [];
    const { data, error } = await supabase.rpc('contestazioni_visibili');
    if (error) throw error;
    contestazioni = data || [];
    annuncia();
    return contestazioni;
};

export const scordaCiclo = () => {
    contestazioni = null;
    inCorso = null;
    annuncia();
};

const chiedi = () => {
    if (MODO_DEMO) return Promise.resolve([]);
    if (!inCorso) {
        inCorso = caricaContestazioni().catch(() => {
            inCorso = null;
            return [];
        });
    }
    return inCorso;
};

export const useContestazioni = () => {
    const [righe, setRighe] = useState(contestazioniAttuali);
    useEffect(() => {
        let vivo = true;
        const aggiorna = () => { if (vivo) setRighe(contestazioniAttuali()); };
        const rileggi = () => chiedi().then(aggiorna);
        rileggi();
        window.addEventListener(EVENTO_CICLO, rileggi);
        return () => {
            vivo = false;
            window.removeEventListener(EVENTO_CICLO, rileggi);
        };
    }, []);
    return righe;
};

// Dopo una scrittura cambiano sia le contestazioni sia i mesi dei contratti.
const rileggiTutto = async () => {
    const { caricaContratti } = await import('@/lib/contrattiFonte');
    await Promise.all([caricaContestazioni(), caricaContratti()]);
};

const messaggioErrore = (error, ripiego) => {
    const t = String(error?.message || '');
    if (t.includes('scaduto')) return 'Il tempo per contestare è scaduto.';
    if (t.includes('già contestata')) return 'Questa segnalazione è già contestata.';
    if (t.includes('motivo') || t.includes('motivazione')) return 'Serve il motivo, almeno cinque lettere.';
    if (t.includes('proprietario')) return 'Il mese lo segnala il proprietario.';
    if (t.includes('persona diversa')) return 'La seconda firma la mette una persona diversa dalla prima.';
    return ripiego;
};

/** Il proprietario dice se il canone del mese è arrivato. */
export const segnalaMese = async (contratto, mese, tipo, { giorno = null, nota = null } = {}) => {
    if (MODO_DEMO) return { ok: true, simulato: true };
    if (!contratto?.contrattoDb) return { ok: false, messaggio: 'Contratto non collegato al database.' };
    const { error } = await supabase.rpc('segnala_mese', {
        il_contratto: contratto.contrattoDb, il_mese: mese, il_tipo: tipo, il_giorno: giorno, la_nota: nota,
    });
    if (error) return { ok: false, messaggio: messaggioErrore(error, 'La segnalazione non è partita: riprova.') };
    await rileggiTutto();
    return { ok: true };
};

/** L'inquilino contesta una segnalazione di mancato pagamento. */
export const apriContestazione = async (contratto, mese, motivo) => {
    if (MODO_DEMO) return { ok: true, simulato: true };
    if (!contratto?.contrattoDb) return { ok: false, messaggio: 'Contratto non collegato al database.' };
    const { data, error } = await supabase.rpc('apri_contestazione', {
        il_contratto: contratto.contrattoDb, il_mese: mese, il_motivo: motivo,
    });
    if (error) return { ok: false, messaggio: messaggioErrore(error, 'La contestazione non è partita: riprova.') };
    await rileggiTutto();
    return { ok: true, id: data };
};

/** Un messaggio dentro una contestazione: alle parti, o interno. */
export const scriviSuContestazione = async (contestazioneId, testo, { interno = false } = {}) => {
    if (MODO_DEMO) return { ok: true, simulato: true };
    const { error } = await supabase.rpc('scrivi_su_contestazione', {
        la_contestazione: contestazioneId, il_testo: testo, l_interno: interno,
    });
    if (error) return { ok: false, messaggio: 'Il messaggio non è partito: riprova.' };
    await caricaContestazioni();
    return { ok: true };
};

/** CRIA decide: «respinta» chiude, «accolta» mette la prima firma. */
export const decidiContestazione = async (contestazioneId, esito, nota, giornoPagamento = null) => {
    if (MODO_DEMO) return { ok: true, simulato: true };
    const { error } = await supabase.rpc('decidi_contestazione', {
        la_contestazione: contestazioneId, l_esito: esito, la_nota: nota, il_giorno_pagamento: giornoPagamento,
    });
    if (error) return { ok: false, messaggio: messaggioErrore(error, 'La decisione non è passata: riprova.') };
    await rileggiTutto();
    return { ok: true };
};

/** La seconda firma: un'altra persona, e solo allora il mese cambia. */
export const confermaRettifica = async (contestazioneId, giornoPagamento) => {
    if (MODO_DEMO) return { ok: true, simulato: true };
    const { error } = await supabase.rpc('conferma_rettifica', {
        la_contestazione: contestazioneId, il_giorno_pagamento: giornoPagamento,
    });
    if (error) return { ok: false, messaggio: messaggioErrore(error, 'La seconda firma non è passata.') };
    await rileggiTutto();
    return { ok: true };
};

/** Vero per le contestazioni che stanno nel database (le altre sono di prova). */
export const nelDatabase = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(String(id));

/** La contestazione del database nella forma che usano le schermate. */
export const allaFormaDelleSchermate = (k) => ({
    id: k.id,
    contrattoId: k.contrattoId,
    mese: k.mese,
    segnalazione: k.segnalazione || { tipo: 'non_pagato', il: k.apertaIl },
    apertaIl: k.apertaIl,
    rispostaEntro: k.rispostaEntro,
    stato: k.stato === 'aperta' ? 'aperta' : k.stato,
    chiusaIl: k.chiusaIl,
    esito: k.esito,
    motivo: k.motivo,
    // Le prove caricate sul contratto: per chi decide sono i documenti della
    // contestazione, e la ricevuta del bonifico è quella che conta.
    documenti: documentiAttuali()
        .filter(d => d.contrattoId === k.contrattoId && ['prova', 'ricevuta', 'bonifico'].includes(d.tipo))
        .map(d => ({ id: d.id, nome: d.nome, caricatoDa: 'conduttore', il: d.caricatoIl, bancario: true })),
    messaggi: (k.messaggi || []).map(m => ({ id: m.id, autore: m.interno ? 'cria' : 'parte', testo: m.testo, il: m.il, interno: m.interno, nome: m.autore })),
    dalDatabase: true,
    rettifica: k.rettifica
        ? {
            data: k.rettificaData,
            primaFirma: k.primaFirmaDa ? { da: k.primaFirmaDa, il: k.apertaIl } : null,
            secondaFirma: k.secondaFirmaDa ? { da: k.secondaFirmaDa, il: k.chiusaIl } : null,
        }
        : null,
});
