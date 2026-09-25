import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { isVerificata } from '@/lib/aree';
import AttesaAccesso from '@/components/accesso/AttesaAccesso';

// Per le pagine a tutto schermo fuori dalle aree (scelta del prodotto,
// onboarding, checkout, firma): serve l'accesso e un'identità verificata.
const RichiedeAccesso = ({ children }) => {
    const { persona, loading } = useAuth();
    const location = useLocation();
    if (loading) return <AttesaAccesso />;
    if (!persona) return <Navigate to="/login" replace state={{ da: location.pathname + location.search }} />;
    if (!isVerificata(persona)) return <Navigate to="/in-attesa" replace />;
    return children;
};

export default RichiedeAccesso;
