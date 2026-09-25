// ═════════════════════════════════════════════════════════════════════════════
// CERTIFICATI — SOLO PER I MOCKUP
// Il certificato attesta un periodo, non un istante (documento di stato §15.1):
// «dal … al … questa persona ha avuto semaforo …». Vale sei mesi dall'emissione,
// ha un codice e un QR, e la verifica pubblica dice anche se il semaforo è
// peggiorato dopo l'emissione, senza dire di quanto. Un codice per certificato;
// l'inquilino può revocarlo e vede quante volte e quando è stato verificato.
// ═════════════════════════════════════════════════════════════════════════════

export const CERTIFICATI = [
    {
        id: 'cert-giulia-2026-08',
        personaId: 'giulia',
        emessoIl: '2026-08-03',
        periodo: { dal: '2025-08', al: '2026-07' },   // mesi inclusi
        fonte: 'rilevato_cria',
        codice: 'CRIA-7K2Q-94HF',
        revocatoIl: null,
        verifiche: ['2026-08-05 10:12', '2026-08-05 18:40', '2026-08-21 09:03'],
    },
    {
        id: 'cert-giulia-2026-02',
        personaId: 'giulia',
        emessoIl: '2026-02-10',
        periodo: { dal: '2025-02', al: '2026-01' },
        fonte: 'rilevato_cria',
        codice: 'CRIA-3XDM-5PLA',
        revocatoIl: '2026-03-01',
        verifiche: ['2026-02-12 11:30'],
    },
];

export const FONTE_CERTIFICATO = {
    rilevato_cria: 'Rilevato da CRIA',
    verificato_su_documentazione: 'Verificato su documentazione fornita dall’interessato',
};

export const certificatiDi = (personaId) => CERTIFICATI.filter(c => c.personaId === personaId);
export const trovaCertificatoPerCodice = (codice) =>
    CERTIFICATI.find(c => c.codice.toUpperCase() === String(codice || '').trim().toUpperCase()) || null;
