import React from 'react';
import { Loader2 } from 'lucide-react';

// Mentre si legge la sessione: niente rimandi al login prima di sapere chi c'è.
const AttesaAccesso = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F0]/60">
        <Loader2 className="w-8 h-8 text-[#1A2D52] animate-spin" aria-label="Caricamento" />
    </div>
);

export default AttesaAccesso;
