import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogIn, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import BottoneGoogle from '@/components/BottoneGoogle';
import CorniceAccesso, { fontTitolo } from '@/components/accesso/CorniceAccesso';

// ═════════════════════════════════════════════════════════════════════════════
// ACCESSO — F-01
// Email e password su Supabase Auth. Il ruolo non si sceglie da un menu: dopo
// l'accesso lo smistamento (F-09) guarda le posizioni della persona e decide
// dove portarla.
// ═════════════════════════════════════════════════════════════════════════════

const MESSAGGI = {
    credenziali: 'Email o password non corretti.',
    non_confermata: 'Prima di accedere conferma l’email: trovi il link nella posta.',
    senza_profilo: 'Questo account non ha ancora un profilo su CRIA.',
    rete: 'Non riusciamo a raggiungere il server. Riprova tra poco.',
};

const campo = (errore) => `w-full h-11 text-sm rounded-lg border px-3 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-[#1A2D52]/20 transition-colors ${errore ? 'border-red-400' : 'border-[#E5E5DE] focus:border-[#1A2D52]/40'}`;

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [params] = useSearchParams();
    const { accediConPassword } = useAuth();

    const [email, setEmail] = useState(params.get('email') || '');
    const [password, setPassword] = useState('');
    const [mostra, setMostra] = useState(false);
    const [errori, setErrori] = useState({});
    const [errore, setErrore] = useState('');
    const [invio, setInvio] = useState(false);

    const destinazione = location.state?.da || '/dashboard';

    const valida = () => {
        const e = {};
        if (!email.trim()) e.email = 'Inserisci l’email';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Questo indirizzo non sembra valido';
        if (!password) e.password = 'Inserisci la password';
        setErrori(e);
        return Object.keys(e).length === 0;
    };

    const invia = async (ev) => {
        ev.preventDefault();
        setErrore('');
        if (!valida()) return;
        setInvio(true);
        const esito = await accediConPassword(email, password);
        setInvio(false);
        if (esito.errore) {
            setErrore(MESSAGGI[esito.errore]);
            return;
        }
        toast.success(`Ciao ${esito.persona.tipo === 'giuridica' ? esito.persona.ragioneSociale : esito.persona.nome}`);
        navigate(destinazione, { replace: true });
    };

    return (
        <>
            <Helmet>
                <title>Accedi - CRIA</title>
                <meta name="description" content="Accedi a CRIA, la centrale rischi degli affitti" />
            </Helmet>

            <CorniceAccesso variante="accesso">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl text-[#1A2D52]" style={fontTitolo}>Accedi</h1>
                        <p className="text-[#6B6B5E]">Entra con l’email e la password del tuo account.</p>
                    </div>

                    {errore && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800" role="alert">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{errore}</p>
                        </div>
                    )}

                    <form onSubmit={invia} className="space-y-5" noValidate>
                        <div className="space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <input id="email" type="email" autoComplete="email" value={email}
                                onChange={e => { setEmail(e.target.value); setErrori(p => ({ ...p, email: undefined })); setErrore(''); }}
                                placeholder="nome@esempio.it" className={campo(errori.email)} disabled={invio} />
                            {errori.email && <p className="text-xs text-red-600">{errori.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="/recupera-password" className="text-sm text-[#1A2D52] hover:underline underline-offset-4">Password dimenticata?</Link>
                            </div>
                            <div className="relative">
                                <input id="password" type={mostra ? 'text' : 'password'} autoComplete="current-password" value={password}
                                    onChange={e => { setPassword(e.target.value); setErrori(p => ({ ...p, password: undefined })); setErrore(''); }}
                                    placeholder="••••••••" className={campo(errori.password)} style={{ paddingRight: '2.75rem' }} disabled={invio} />
                                <button type="button" onClick={() => setMostra(m => !m)} aria-label={mostra ? 'Nascondi la password' : 'Mostra la password'}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B5E] hover:text-[#1A2D52]">
                                    {mostra ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errori.password && <p className="text-xs text-red-600">{errori.password}</p>}
                        </div>

                        <Button type="submit" className="w-full h-12 text-base bg-[#1A2D52] hover:bg-[#0F1B33]" disabled={invio}>
                            {invio ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Accesso in corso…</> : <><LogIn className="w-5 h-5 mr-2" /> Accedi</>}
                        </Button>
                    </form>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-[#E5E5DE]" />
                            <span className="text-xs text-[#6B6B5E]">oppure</span>
                            <div className="h-px flex-1 bg-[#E5E5DE]" />
                        </div>
                        <BottoneGoogle />
                    </div>

                    <p className="text-sm text-[#6B6B5E]">
                        Non hai un account?{' '}
                        <Link to="/signup" className="font-medium text-[#1A2D52] hover:underline underline-offset-4">Registrati</Link>
                    </p>

                </div>
            </CorniceAccesso>
        </>
    );
};

export default LoginPage;
