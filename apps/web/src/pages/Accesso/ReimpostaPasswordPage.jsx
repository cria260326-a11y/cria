import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, KeyRound, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import AccessoShell, { SCHEDA, TITOLO_STILE } from '@/components/AccessoShell';
import RequisitiPassword, { passwordValida } from '@/components/RequisitiPassword';
import NotaMockup from '@/components/NotaMockup';

// ═════════════════════════════════════════════════════════════════════════════
// NUOVA PASSWORD DAL LINK — F-05
// La pagina che riceve il link di recupero (F-04) e imposta la password.
// TODO fase 4: Supabase auth.updateUser({ password }) con la sessione di recupero.
// ═════════════════════════════════════════════════════════════════════════════

const ReimpostaPasswordPage = () => {
    const [params] = useSearchParams();
    const token = params.get('token');
    const navigate = useNavigate();

    const [fase, setFase] = useState('form');
    const [password, setPassword] = useState('');
    const [conferma, setConferma] = useState('');
    const [mostra, setMostra] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFase(!token || token === 'scaduto' ? 'scaduto' : 'form');
    }, [token]);

    const confermaOk = password === conferma && conferma.length > 0;

    const salva = () => {
        if (!passwordValida(password) || !confermaOk) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setFase('fatto');
        }, 700);
    };

    return (
        <>
            <Helmet><title>Nuova password - CRIA</title></Helmet>
            <AccessoShell>
                {fase === 'form' && (
                    <div className={`${SCHEDA} space-y-6`}>
                        <div className="space-y-2">
                            <div className="w-12 h-12 bg-[#1A2D52]/5 rounded-xl flex items-center justify-center mb-4">
                                <KeyRound className="w-6 h-6 text-[#1A2D52]" />
                            </div>
                            <h1 className="text-2xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>Scegli una nuova password</h1>
                            <p className="text-sm text-[#6B6B5E]">Dopo averla salvata, accedi con la nuova password.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-[#1A2D52] uppercase tracking-wide">Nuova password</label>
                            <div className="relative">
                                <Input type={mostra ? 'text' : 'password'} value={password}
                                    onChange={e => setPassword(e.target.value)} className="pr-10 h-11" autoFocus />
                                <button type="button" onClick={() => setMostra(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B5E] hover:text-[#1A2D52]">
                                    {mostra ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <RequisitiPassword password={password} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-[#1A2D52] uppercase tracking-wide">Conferma password</label>
                            <Input type={mostra ? 'text' : 'password'} value={conferma}
                                onChange={e => setConferma(e.target.value)} className="h-11" />
                            {conferma.length > 0 && !confermaOk && <p className="text-xs text-red-600">Le password non coincidono.</p>}
                        </div>

                        <Button className="w-full h-11 bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={salva}
                            disabled={loading || !passwordValida(password) || !confermaOk}>
                            {loading ? 'Salvataggio...' : 'Salva la nuova password'}
                        </Button>
                    </div>
                )}

                {fase === 'fatto' && (
                    <div className={`${SCHEDA} space-y-6 text-center`}>
                        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-7 h-7 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>Password aggiornata</h1>
                            <p className="text-sm text-[#6B6B5E]">Per sicurezza abbiamo chiuso le altre sessioni aperte.</p>
                        </div>
                        <Button className="w-full h-11 bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={() => navigate('/login')}>Vai al login</Button>
                    </div>
                )}

                {fase === 'scaduto' && (
                    <div className={`${SCHEDA} space-y-6 text-center`}>
                        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-7 h-7 text-amber-600" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>Il link non è più valido</h1>
                            <p className="text-sm text-[#6B6B5E]">I link di recupero durano poco. Chiedine uno nuovo.</p>
                        </div>
                        <Link to="/recupera-password" className="block">
                            <Button className="w-full h-11 bg-[#1A2D52] hover:bg-[#0F1B33]">Chiedi un nuovo link</Button>
                        </Link>
                        <Link to="/login" className="text-sm text-[#6B6B5E] hover:text-[#1A2D52] inline-flex items-center gap-1.5">
                            <ArrowLeft className="w-3.5 h-3.5" /> Torna al login
                        </Link>
                    </div>
                )}

                <NotaMockup className="mt-6">
                    Varianti: <Link className="underline" to="/reimposta-password?token=demo">link valido</Link>
                    {' · '}<Link className="underline" to="/reimposta-password?token=scaduto">link scaduto</Link>
                </NotaMockup>
            </AccessoShell>
        </>
    );
};

export default ReimpostaPasswordPage;
