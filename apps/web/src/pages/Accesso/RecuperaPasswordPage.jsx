import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

// ═════════════════════════════════════════════════════════════════════════════
// RECUPERA PASSWORD
// Flusso: inserisci email → invio link reset → stato "controlla la casella"
// Per sicurezza NON riveliamo se l'email esiste o meno nel sistema.
// ═════════════════════════════════════════════════════════════════════════════
const RecuperaPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [errore, setErrore] = useState('');
    const [inviata, setInviata] = useState(false);
    const [loading, setLoading] = useState(false);

    const validaEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const handleSubmit = () => {
        setErrore('');
        if (!email.trim()) {
            setErrore('Inserisci la tua email.');
            return;
        }
        if (!validaEmail(email)) {
            setErrore('Inserisci un indirizzo email valido.');
            return;
        }
        setLoading(true);
        // TODO: Supabase auth.resetPasswordForEmail(email)
        setTimeout(() => {
            setLoading(false);
            setInviata(true);
        }, 800);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <>
            <Helmet><title>Recupera password - CRIA</title></Helmet>

            <div className="min-h-screen bg-[#F5F5F0]/60 flex flex-col">

                {/* Topbar */}
                <header className="bg-white border-b border-[#E5E5DE]">
                    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#1A2D52] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">C</span>
                            </div>
                            <div className="leading-tight">
                                <p className="font-bold text-[#1A2D52] text-sm">CRIA</p>
                                <p className="text-[9px] tracking-widest text-[#6B6B5E] uppercase">Centrale Rischi Immobiliare Affitti</p>
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Card centrale */}
                <main className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">

                        {!inviata ? (
                            <div className="bg-white rounded-2xl border border-[#E5E5DE] shadow-sm p-8 space-y-6">
                                <div className="space-y-2">
                                    <div className="w-12 h-12 bg-[#1A2D52]/5 rounded-xl flex items-center justify-center mb-4">
                                        <KeyRound className="w-6 h-6 text-[#1A2D52]" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-[#1A2D52]" style={{ fontFamily: "'Fraunces', serif" }}>
                                        Password dimenticata?
                                    </h1>
                                    <p className="text-sm text-[#6B6B5E]">
                                        Inserisci l'email con cui ti sei registrato. Ti invieremo un link per
                                        impostare una nuova password.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-[#1A2D52] uppercase tracking-wide">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B5E]" />
                                        <Input
                                            type="email"
                                            placeholder="latua@email.it"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className="pl-10 h-11"
                                            autoFocus
                                        />
                                    </div>
                                    {errore && <p className="text-xs text-red-600">{errore}</p>}
                                </div>

                                <Button
                                    className="w-full h-11 bg-[#1A2D52] hover:bg-[#0F1B33]"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? 'Invio in corso...' : 'Invia link di recupero'}
                                </Button>

                                <div className="text-center">
                                    <Link to="/login" className="text-sm text-[#6B6B5E] hover:text-[#1A2D52] inline-flex items-center gap-1.5">
                                        <ArrowLeft className="w-3.5 h-3.5" /> Torna al login
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-[#E5E5DE] shadow-sm p-8 space-y-6 text-center">
                                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-xl font-bold text-[#1A2D52]" style={{ fontFamily: "'Fraunces', serif" }}>
                                        Controlla la tua casella
                                    </h1>
                                    <p className="text-sm text-[#6B6B5E]">
                                        Se <span className="font-medium text-[#1A2D52]">{email}</span> è registrata
                                        su CRIA, riceverai a breve un link per reimpostare la password.
                                    </p>
                                    <p className="text-xs text-[#6B6B5E]">
                                        Non lo trovi? Controlla nello spam o riprova tra qualche minuto.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => { setInviata(false); setEmail(''); }}
                                    >
                                        Invia di nuovo
                                    </Button>
                                    <Link to="/login" className="text-sm text-[#6B6B5E] hover:text-[#1A2D52] inline-flex items-center gap-1.5">
                                        <ArrowLeft className="w-3.5 h-3.5" /> Torna al login
                                    </Link>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </>
    );
};

export default RecuperaPasswordPage;
