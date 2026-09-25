import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, MailCheck, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import AccessoShell, { SCHEDA, TITOLO_STILE } from '@/components/AccessoShell';
import NotaMockup from '@/components/NotaMockup';

// ═════════════════════════════════════════════════════════════════════════════
// VERIFICA EMAIL — F-03
// Si arriva dal link ricevuto dopo la registrazione.
// TODO fase 4: Supabase Auth verifica il token.
// ═════════════════════════════════════════════════════════════════════════════

const VerificaEmailPage = () => {
    const [params] = useSearchParams();
    const token = params.get('token');
    const navigate = useNavigate();
    const [stato, setStato] = useState('verifica');

    useEffect(() => {
        setStato('verifica');
        const timer = setTimeout(() => {
            if (!token) setStato('mancante');
            else if (token === 'scaduto') setStato('scaduto');
            else setStato('ok');
        }, 900);
        return () => clearTimeout(timer);
    }, [token]);

    const continua = () => {
        toast.success('Email confermata: ora accedi');
        navigate('/login?email=nonverificato@cri-affitti.it');
    };

    return (
        <>
            <Helmet><title>Verifica email - CRIA</title></Helmet>
            <AccessoShell>
                <div className={`${SCHEDA} space-y-6 text-center`}>
                    {stato === 'verifica' && (
                        <>
                            <Loader2 className="w-10 h-10 text-[#1A2D52] animate-spin mx-auto" />
                            <p className="text-sm text-[#6B6B5E]">Stiamo confermando il tuo indirizzo…</p>
                        </>
                    )}

                    {stato === 'ok' && (
                        <>
                            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                <MailCheck className="w-7 h-7 text-green-600" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>Email confermata</h1>
                                <p className="text-sm text-[#6B6B5E]">
                                    Il prossimo passo è il documento d'identità: lo controlla una persona del nostro team,
                                    e finché non è verificato non si entra nella piattaforma.
                                </p>
                            </div>
                            <Button className="w-full h-11 bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={continua}>Continua</Button>
                        </>
                    )}

                    {stato === 'scaduto' && (
                        <>
                            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-7 h-7 text-amber-600" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>Il link è scaduto</h1>
                                <p className="text-sm text-[#6B6B5E]">Te ne mandiamo uno nuovo allo stesso indirizzo.</p>
                            </div>
                            <Button className="w-full h-11 bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={() => toast.success('Nuovo link inviato')}>
                                Mandami un nuovo link
                            </Button>
                        </>
                    )}

                    {stato === 'mancante' && (
                        <>
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                                <XCircle className="w-7 h-7 text-red-600" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>Link non valido</h1>
                                <p className="text-sm text-[#6B6B5E]">Apri il link direttamente dall'email che ti abbiamo mandato.</p>
                            </div>
                            <Link to="/login" className="text-sm text-[#6B6B5E] hover:text-[#1A2D52] underline">Torna al login</Link>
                        </>
                    )}
                </div>

                <NotaMockup className="mt-6">
                    «Continua» entra come Anna Conti, la persona demo registrata e non ancora verificata.
                    Varianti: <Link className="underline" to="/verifica-email?token=demo">valido</Link>
                    {' · '}<Link className="underline" to="/verifica-email?token=scaduto">scaduto</Link>
                    {' · '}<Link className="underline" to="/verifica-email">senza token</Link>
                </NotaMockup>
            </AccessoShell>
        </>
    );
};

export default VerificaEmailPage;
