import React, { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LifeBuoy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import SelettoreContesto from '@/components/SelettoreContesto';
import AttesaAccesso from '@/components/accesso/AttesaAccesso';
import { isVerificata } from '@/lib/aree';

// ─── Layout minimale per l'area CLIENTE (P3) ──────────────────────────────────
// Il cliente non ha una dashboard completa: solo testata + contenuto centrato.
// Il selettore di contesto sostituisce il vecchio bottone Esci: chi ha anche
// altri cappelli passa da qui alle altre aree.
const ClienteLayout = ({ children }) => {
    const { persona, contesti, contestoAttivo, scegliContesto, loading } = useAuth();
    const location = useLocation();

    useEffect(() => {
        if (!persona || contestoAttivo?.area === 'cliente') return;
        if (contesti.some(c => c.area === 'cliente')) scegliContesto('cliente');
    }, [persona, contesti, contestoAttivo, scegliContesto]);

    if (loading) return <AttesaAccesso />;
    if (!persona) return <Navigate to="/login" replace state={{ da: location.pathname }} />;
    if (!isVerificata(persona)) return <Navigate to="/in-attesa" replace />;
    if (!contesti.some(c => c.area === 'cliente')) return <Navigate to="/dashboard" replace />;

    return (
        <div className="min-h-screen bg-background flex flex-col">

            <header className="border-b border-border bg-card">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
                    <Link to="/dashboard/cliente" className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#1A2D52] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">C</span>
                        </div>
                        <div className="leading-tight">
                            <p className="font-bold text-foreground text-sm">CRIA</p>
                            <p className="text-[10px] tracking-widest text-muted-foreground uppercase">Area cliente</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link to="/supporto">
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                                <LifeBuoy className="w-4 h-4" /> Assistenza
                            </Button>
                        </Link>
                        <SelettoreContesto />
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <div className="max-w-4xl mx-auto px-6 py-10">
                    {children}
                </div>
            </main>

            <footer className="border-t border-border py-6">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
                    <span>© {new Date().getFullYear()} CRIA — Centrale Rischi Immobiliare Affitti</span>
                    <div className="flex gap-4">
                        <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
                        <Link to="/termini" className="hover:text-foreground">Termini</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ClienteLayout;
