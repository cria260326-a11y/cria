import React from 'react';
import Assistenza from '@/components/aree/Assistenza';

// P-17 — Assistenza dell'inquilino. UI e logica stanno in components/aree/Assistenza;
// qui restano solo i dati d'esempio di quest'area.

const CATEGORIE = [
    { id: 'preventivi', label: 'Pagamenti e semaforo' },
    { id: 'pagamenti', label: 'Pagamenti e bonifici' },
    { id: 'account', label: 'Account e accesso' },
    { id: 'tecnico', label: 'Problema tecnico' },
    { id: 'altro', label: 'Altro' },
];

const AssistenzaInquilinoPage = () => (
    <Assistenza categorie={CATEGORIE} area="inquilino" />
);

export default AssistenzaInquilinoPage;
