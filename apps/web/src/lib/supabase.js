import { createClient } from '@supabase/supabase-js';

// ═════════════════════════════════════════════════════════════════════════════
// SUPABASE — progetto «cria», organizzazione CRIA, Francoforte (UE)
// Indirizzo e chiave pubblicabile sono fatti per stare nel browser: finiscono
// comunque nel codice che il sito scarica. La chiave segreta non entra mai nel
// frontend né nel repository.
// Con VITE_ACCESSO_DEMO=1 (solo in locale) si entra con le persone demo, senza
// password: serve a provare le schermate senza passare dal server.
// ═════════════════════════════════════════════════════════════════════════════

const URL_PROGETTO = import.meta.env.VITE_SUPABASE_URL || 'https://kmbvbeafhnfrucuvjjwh.supabase.co';
const CHIAVE_PUBBLICABILE = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_K4shWT6T_NbHTdgUuB0tRA_1doey3fH';

export const MODO_DEMO = import.meta.env.VITE_ACCESSO_DEMO === '1' || !CHIAVE_PUBBLICABILE;

export const supabase = MODO_DEMO ? null : createClient(URL_PROGETTO, CHIAVE_PUBBLICABILE, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'cria-accesso' },
});
