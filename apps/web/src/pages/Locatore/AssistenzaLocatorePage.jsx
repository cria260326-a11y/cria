import React from 'react';
import Assistenza from '@/components/aree/Assistenza';

// P-17 — Assistenza del proprietario. UI e logica stanno in components/aree/Assistenza;
// qui restano solo i dati d'esempio di quest'area.

const CATEGORIE = [
    { id: 'preventivi', label: 'Prezzi e pagamenti' },
    { id: 'pagamenti', label: 'Pagamenti e bonifici' },
    { id: 'account', label: 'Account e accesso' },
    { id: 'tecnico', label: 'Problema tecnico' },
    { id: 'altro', label: 'Altro' },
];

const AssistenzaLocatorePage = () => (
    <Assistenza categorie={CATEGORIE} area="locatore" />
);

export default AssistenzaLocatorePage;
