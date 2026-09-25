import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import AttesaAccesso from '@/components/accesso/AttesaAccesso';
import { useAuth } from '@/contexts/AuthContext.jsx';
import SelettoreContesto from '@/components/SelettoreContesto';
import LocatoreLayout from '@/components/layout/LocatoreLayout';
import InquilinoLayout from '@/components/layout/InquilinoLayout';
import ClienteLayout from '@/components/layout/ClienteLayout';
import CommercialeLayout from '@/components/layout/CommercialeLayout';
import AvvocatoLayout from '@/components/layout/AvvocatoLayout';
import AdminLayout from '@/components/layout/AdminLayout';

const LAYOUT = {
    locatore: LocatoreLayout,
    inquilino: InquilinoLayout,
    cliente: ClienteLayout,
    commerciale: CommercialeLayout,
    avvocato: AvvocatoLayout,
    admin: AdminLayout,
};

// ═════════════════════════════════════════════════════════════════════════════
// Pagine di tutti — profilo, identità, fatturazione, consensi, i miei dati —
// aperte dentro l'area da cui si arriva. Chi non ha ancora un'area (registrato
// e non verificato) le vede in una cornice semplice.
// ═════════════════════════════════════════════════════════════════════════════
const LayoutDelContesto = ({ children, titolo }) => {
    const { persona, contestoAttivo, loading } = useAuth();
    const location = useLocation();

    if (loading) return <AttesaAccesso />;
    if (!persona) return <Navigate to="/login" replace state={{ da: location.pathname }} />;

    const Layout = contestoAttivo ? LAYOUT[contestoAttivo.area] : null;
    if (Layout) return <Layout titolo={titolo}>{children}</Layout>;

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col">
            <header className="h-16 bg-card border-b border-border flex items-center justify-between gap-4 px-6">
                <Link to="/dashboard" className="flex items-center">
                    <img src="/logo.png" alt="CRIA" className="h-10 w-auto" />
                </Link>
                <SelettoreContesto />
            </header>
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
};

export default LayoutDelContesto;
