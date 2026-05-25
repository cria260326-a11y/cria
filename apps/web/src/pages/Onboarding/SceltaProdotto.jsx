import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search, ArrowRight, Shield } from 'lucide-react';

const SCELTE = [
    {
        id: 'AB',
        icon: Home,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        border: 'border-blue-200 hover:border-blue-400',
        titolo: 'Gestisco un immobile in affitto',
        descrizione: 'Vuoi usare CRIA per monitorare i pagamenti, gestire documenti e contestazioni del tuo affitto.',
        dettagli: ['CRIA Gestione — gestisci tu con i nostri strumenti', 'CRIA Completo — gestiamo noi tutto al posto tuo'],
    },
    {
        id: 'C',
        icon: Search,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        border: 'border-amber-200 hover:border-amber-400',
        titolo: 'Voglio verificare un inquilino',
        descrizione: 'Vuoi sapere con chi hai a che fare prima di firmare un contratto. Pagamento unico, risposta in 48 ore.',
        dettagli: ['CRIA Verifica — verifica identità e affidabilità', 'Nessun abbonamento richiesto'],
    },
];

const SceltaProdotto = () => {
    const navigate = useNavigate();

    const handleScelta = (flussoId) => {
        // Salva la scelta in sessionStorage — sarà letta dalla pagina onboarding
        sessionStorage.setItem('onboarding_flusso', flussoId);
        navigate('/onboarding');
    };

    return (
        <>
            <Helmet><title>Cosa vuoi fare? - CRIA</title></Helmet>

            <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">

                {/* Logo */}
                <div className="flex justify-center pt-10">
                    <img src="/logo.png" alt="CRIA" className="h-14 w-auto" />
                </div>

                <div className="flex-1 flex items-center justify-center px-4 py-8">
                    <div className="w-full max-w-2xl space-y-8">

                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold text-foreground">Cosa vuoi fare?</h1>
                            <p className="text-muted-foreground">Scegli il percorso più adatto a te — potrai sempre aggiungere altri servizi in seguito.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {SCELTE.map((s) => {
                                const Icon = s.icon;
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => handleScelta(s.id)}
                                        className={`p-6 rounded-2xl border-2 bg-card text-left transition-all hover:shadow-lg group ${s.border}`}
                                    >
                                        <div className={`p-3 rounded-xl w-fit mb-4 ${s.iconBg}`}>
                                            <Icon className={`w-6 h-6 ${s.iconColor}`} />
                                        </div>
                                        <h2 className="text-lg font-bold text-foreground mb-2">{s.titolo}</h2>
                                        <p className="text-sm text-muted-foreground mb-4">{s.descrizione}</p>
                                        <ul className="space-y-1.5 mb-4">
                                            {s.dettagli.map((d) => (
                                                <li key={d} className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <span className="w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                                                    {d}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                                            Inizia <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Shield className="w-3.5 h-3.5" />
                            <span>I tuoi dati sono protetti e crittografati</span>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default SceltaProdotto;