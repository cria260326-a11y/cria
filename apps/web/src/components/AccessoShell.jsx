import React from 'react';
import { Link } from 'react-router-dom';

// Cornice comune delle pagine di accesso: stessa grafica di recupero password
// e attivazione account.
export const TITOLO_STILE = { fontFamily: "'Fraunces', serif" };
export const SCHEDA = 'bg-white rounded-2xl border border-[#E5E5DE] shadow-sm p-8';

const AccessoShell = ({ children, larghezza = 'max-w-md', azione = null }) => (
    <div className="min-h-screen bg-[#F5F5F0]/60 flex flex-col">
        <header className="bg-white border-b border-[#E5E5DE]">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1A2D52] rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">C</span>
                    </div>
                    <div className="leading-tight">
                        <p className="font-bold text-[#1A2D52] text-sm">CRIA</p>
                        <p className="text-[9px] tracking-widest text-[#6B6B5E] uppercase">Centrale Rischi Immobiliare Affitti</p>
                    </div>
                </Link>
                {azione}
            </div>
        </header>
        <main className="flex-1 flex items-center justify-center px-6 py-12">
            <div className={`w-full ${larghezza}`}>{children}</div>
        </main>
    </div>
);

export default AccessoShell;
