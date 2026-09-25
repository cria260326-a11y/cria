import React from 'react';
import Assistenza from '@/components/aree/Assistenza';

// P-17 — Assistenza del commerciale. UI e logica stanno in components/aree/Assistenza;
// qui restano solo i dati d'esempio di quest'area.

const CATEGORIE = [
    { id: 'preventivi', label: 'Prezzi e pagamenti' },
    { id: 'pagamenti', label: 'Pagamenti e bonifici' },
    { id: 'account', label: 'Account e accesso' },
    { id: 'tecnico', label: 'Problema tecnico' },
    { id: 'altro', label: 'Altro' },
];

const AssistenzaCommercialePage = () => (
    <Assistenza categorie={CATEGORIE} area="commerciale" />
);

export default AssistenzaCommercialePage;
