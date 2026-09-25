// Etichette condivise dalle aree di proprietario e inquilino.
// Un termine, un posto: se cambia qui cambia ovunque.

const CHIUSE = ['risolta_favore_locatore', 'risolta_favore_inquilino', 'chiusa'];

export const contestazioneChiusa = (stato) => CHIUSE.includes(stato);

const STATO_CONTESTAZIONE = {
    aperta: { etichetta: 'Aperta', classe: 'bg-red-100 text-red-800' },
    in_verifica: { etichetta: 'In verifica', classe: 'bg-yellow-100 text-yellow-800' },
    documentazione_richiesta: { etichetta: 'Documenti richiesti', classe: 'bg-orange-100 text-orange-800' },
    risolta_favore_locatore: { etichetta: 'Risolta a favore del proprietario', classe: 'bg-blue-100 text-blue-800' },
    risolta_favore_inquilino: { etichetta: 'Risolta a favore dell’inquilino', classe: 'bg-purple-100 text-purple-800' },
    chiusa: { etichetta: 'Chiusa', classe: 'bg-gray-100 text-gray-700' },
};

// prospettiva: 'locatore' (area proprietario) · 'conduttore' (area inquilino)
export const etichettaStatoContestazione = (stato, prospettiva) => {
    if (stato === 'risolta_favore_locatore' && prospettiva === 'locatore') return 'Risolta a tuo favore';
    if (stato === 'risolta_favore_inquilino' && prospettiva === 'conduttore') return 'Risolta a tuo favore';
    return STATO_CONTESTAZIONE[stato]?.etichetta || stato;
};

export const classeStatoContestazione = (stato) => STATO_CONTESTAZIONE[stato]?.classe || 'bg-gray-100 text-gray-700';

export const COPERTURA = {
    attiva: { etichetta: 'Copertura attiva', classe: 'bg-green-100 text-green-800' },
    in_franchigia: { etichetta: 'In franchigia', classe: 'bg-slate-100 text-slate-700' },
    decaduta_mancata_segnalazione: { etichetta: 'Decaduta · non segnalato', classe: 'bg-red-100 text-red-800' },
    decaduta_tardiva: { etichetta: 'Decaduta · segnalato in ritardo', classe: 'bg-red-100 text-red-800' },
};

export const SEGNALAZIONE = {
    pagato: { etichetta: 'Pagato', classe: 'bg-green-100 text-green-800' },
    non_pagato: { etichetta: 'Non pagato', classe: 'bg-red-100 text-red-800' },
    non_rilevato: { etichetta: 'Non rilevato', classe: 'bg-gray-100 text-gray-700' },
};

export const TIPO_DOCUMENTO = {
    identita: 'Documento d’identità',
    contratto: 'Contratto registrato',
    registrazione: 'Ricevuta di registrazione',
    visura: 'Visura catastale',
    visura_camerale: 'Visura camerale',
    prova: 'Prova',
};

export const STATO_DOCUMENTO = {
    verificato: { etichetta: 'Verificato', classe: 'text-green-700' },
    in_attesa: { etichetta: 'In verifica', classe: 'text-yellow-700' },
    da_integrare: { etichetta: 'Da integrare', classe: 'text-orange-700' },
    rifiutato: { etichetta: 'Rifiutato', classe: 'text-red-700' },
};

// Ruoli e versi come si leggono a video: nel dato restano locatore, conduttore…
const RUOLI = {
    locatore: 'Proprietario', conduttore: 'Inquilino', inquilino: 'Inquilino',
    cliente: 'Cliente', commerciale: 'Commerciale', avvocato: 'Avvocato',
    admin: 'Admin', manager: 'Manager', agenzia: 'Agenzia', user: 'Utente',
    sistema: 'Sistema', cria: 'CRIA',
};

export const etichettaRuolo = (ruolo) =>
    RUOLI[ruolo] || (ruolo ? ruolo.charAt(0).toUpperCase() + ruolo.slice(1) : '');
