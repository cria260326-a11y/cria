// ─── Servizio onboarding — layer Supabase ─────────────────────────────────────
// TODO: import { supabase } from '@/lib/supabase'

export const creaOnboarding = async (userId, flussoId) => {
    // TODO: await supabase.from('onboarding_pratiche').insert({ user_id: userId, flusso_id: flussoId, stato: 'in_corso', step_corrente: 1 })
    return { id: 'mock-pratica-1', userId, flussoId, stato: 'in_corso', stepCorrente: 1 };
};

export const salvaStep = async (praticaId, stepId, dati) => {
    // TODO: await supabase.from('onboarding_step_dati').upsert({ pratica_id: praticaId, step_id: stepId, dati, completato: true })
    console.log(`[onboardingService] Step ${stepId} salvato`, dati);
    return true;
};

export const caricaDocumento = async (praticaId, stepId, campoId, file) => {
    // TODO:
    // const path = `onboarding/${praticaId}/${stepId}/${campoId}/${file.name}`;
    // await supabase.storage.from('documenti').upload(path, file);
    // await supabase.from('onboarding_documenti').insert({ pratica_id: praticaId, step_id: stepId, campo_id: campoId, nome: file.name, path, stato: 'da_verificare' });
    console.log(`[onboardingService] Documento caricato: ${file.name}`);
    return { nome: file.name, stato: 'da_verificare' };
};

export const avanzaStep = async (praticaId, stepCorrente, totaleStep) => {
    const nuovoStep = stepCorrente + 1;
    const completato = nuovoStep > totaleStep;
    // TODO:
    // await supabase.from('onboarding_pratiche').update({ step_corrente: completato ? totaleStep : nuovoStep, stato: completato ? 'completato' : 'in_corso' }).eq('id', praticaId)
    // if (completato) await supabase.functions.invoke('onboarding-completato', { body: { pratica_id: praticaId } })
    return { nuovoStep, completato };
};

export const getStatoOnboarding = async (userId) => {
    // TODO: const { data } = await supabase.from('onboarding_pratiche').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single()
    return null;
};