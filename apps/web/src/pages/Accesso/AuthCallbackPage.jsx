import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, XCircle } from 'lucide-react';
import AccessoShell, { SCHEDA, TITOLO_STILE } from '@/components/AccessoShell';
import { useAuth } from '@/contexts/AuthContext.jsx';

// ═════════════════════════════════════════════════════════════════════════════
// RITORNO DA GOOGLE — F-16
// Google autentica, CRIA riconosce la persona. L'identità si verifica comunque
// con il documento: un account Google non dice chi è la persona.
// TODO fase 4: Supabase Auth scambia il codice e apre la sessione.
// ═════════════════════════════════════════════════════════════════════════════

const AuthCallbackPage = () => {
    const [params] = useSearchParams();
    const errore = params.get('errore');
    const navigate = useNavigate();
    const { persona, loading } = useAuth();
    // Google non è ancora collegato: la pagina lo dice.
    const nonAttivo = !loading && !persona;

    useEffect(() => {
        if (!errore && persona) navigate('/dashboard', { replace: true });
    }, [errore, persona, navigate]);

    return (
        <>
            <Helmet><title>Accesso con Google - CRIA</title></Helmet>
            <AccessoShell>
                <div className={`${SCHEDA} space-y-6 text-center`}>
                    {!errore && !nonAttivo ? (
                        <>
                            <Loader2 className="w-10 h-10 text-[#1A2D52] animate-spin mx-auto" />
                            <p className="text-sm text-[#6B6B5E]">Stiamo completando l'accesso con Google…</p>
                        </>
                    ) : (
                        <>
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                                <XCircle className="w-7 h-7 text-red-600" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>Accesso con Google non completato</h1>
                                <p className="text-sm text-[#6B6B5E]">Puoi riprovare, oppure accedere con email e password.</p>
                            </div>
                            <Link to="/login" className="text-sm text-[#6B6B5E] hover:text-[#1A2D52] underline">Torna al login</Link>
                        </>
                    )}
                </div>
            </AccessoShell>
        </>
    );
};

export default AuthCallbackPage;
