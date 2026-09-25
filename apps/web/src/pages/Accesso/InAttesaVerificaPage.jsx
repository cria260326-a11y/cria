import React from 'react';
import { Helmet } from 'react-helmet';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, Clock, AlertTriangle, Circle, Lock, LogOut, Upload } from 'lucide-react';
import AccessoShell, { SCHEDA, TITOLO_STILE } from '@/components/AccessoShell';
import NotaMockup from '@/components/NotaMockup';
import { MODO_DEMO } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { isVerificata } from '@/lib/aree';
import AttesaAccesso from '@/components/accesso/AttesaAccesso';

// ═════════════════════════════════════════════════════════════════════════════
// IN ATTESA DI VERIFICA — F-08
// Chi si è registrato ma non è ancora verificato vede cosa manca, con il
// rimando diretto al caricamento del documento (decisione del 14 settembre).
// ═════════════════════════════════════════════════════════════════════════════

const STILI_PASSO = {
    fatto: { icona: CheckCircle2, cerchio: 'bg-green-50 text-green-600' },
    in_corso: { icona: Clock, cerchio: 'bg-blue-50 text-blue-600' },
    attenzione: { icona: AlertTriangle, cerchio: 'bg-amber-50 text-amber-600' },
    da_fare: { icona: Circle, cerchio: 'bg-[#1A2D52]/5 text-[#1A2D52]' },
    bloccato: { icona: Lock, cerchio: 'bg-[#F5F5F0] text-[#6B6B5E]' },
};

const Passo = ({ stato, titolo, testo, children }) => {
    const { icona: Icona, cerchio } = STILI_PASSO[stato];
    return (
        <li className="flex items-start gap-4 rounded-xl border border-[#E5E5DE] p-4">
            <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${cerchio}`}>
                <Icona className="w-4 h-4" />
            </span>
            <div className="flex-1 min-w-0 space-y-3">
                <div>
                    <p className="font-medium text-[#1A2D52]">{titolo}</p>
                    <p className="text-sm text-[#6B6B5E]">{testo}</p>
                </div>
                {children}
            </div>
        </li>
    );
};

const PASSO_DOCUMENTO = {
    non_caricato: {
        stato: 'da_fare',
        testo: () => "Carica un documento d'identità: lo controlla una persona del nostro team.",
        bottone: 'Carica il documento',
    },
    in_attesa: {
        stato: 'in_corso',
        testo: () => 'Documento ricevuto. Lo sta controllando una persona del nostro team: ti scriviamo appena è fatto.',
        bottone: null,
    },
    da_integrare: {
        stato: 'attenzione',
        testo: (persona) => `Serve un'integrazione: ${persona.motivoIntegrazione || 'il documento non è leggibile'}.`,
        bottone: 'Carica di nuovo',
    },
};

const InAttesaVerificaPage = () => {
    const { persona, esci, aggiornaPersona, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return <AttesaAccesso />;
    if (!persona) return <Navigate to="/login" replace />;
    if (isVerificata(persona)) return <Navigate to="/dashboard" replace />;

    const documento = PASSO_DOCUMENTO[persona.statoIdentita] || PASSO_DOCUMENTO.non_caricato;

    const esciDaCria = async () => {
        await esci();
        navigate('/login');
    };

    return (
        <>
            <Helmet><title>In attesa di verifica - CRIA</title></Helmet>
            <AccessoShell
                larghezza="max-w-xl"
                azione={(
                    <Button variant="ghost" size="sm" onClick={esciDaCria} className="gap-2 text-[#6B6B5E]">
                        <LogOut className="w-4 h-4" /> Esci
                    </Button>
                )}
            >
                <div className={`${SCHEDA} space-y-6`}>
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-widest text-[#6B6B5E]">Ciao {persona.nome}</p>
                        <h1 className="text-2xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>Ci manca poco</h1>
                        <p className="text-sm text-[#6B6B5E]">Prima di entrare verifichiamo chi sei. Ecco a che punto sei.</p>
                    </div>

                    <ol className="space-y-3">
                        <Passo
                            stato={persona.emailVerificata ? 'fatto' : 'da_fare'}
                            titolo="Conferma dell'email"
                            testo={persona.emailVerificata
                                ? `Confermata: ${persona.email}`
                                : `Apri il link che ti abbiamo mandato a ${persona.email}.`}
                        >
                            {!persona.emailVerificata && (
                                <Button size="sm" variant="outline" onClick={() => toast.success('Nuovo link inviato')}>
                                    Mandami un nuovo link
                                </Button>
                            )}
                        </Passo>

                        <Passo stato={documento.stato} titolo="Documento d'identità" testo={documento.testo(persona)}>
                            {documento.bottone && (
                                <Button size="sm" className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={() => navigate('/profilo/identita')}>
                                    <Upload className="w-4 h-4" /> {documento.bottone}
                                </Button>
                            )}
                        </Passo>

                        <Passo
                            stato="bloccato"
                            titolo="Accesso alla piattaforma"
                            testo="Appena il documento è verificato entri nella tua area."
                        />
                    </ol>
                </div>

                {/* Solo sul Mac, per i controlli automatici. Sul sito l'identità la verifica l'admin dalla scheda della persona. */}
                {MODO_DEMO ? (
                    <NotaMockup className="mt-6">
                        <p className="mb-3">Simula l'esito della verifica umana:</p>
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" className="bg-white"
                                onClick={() => aggiornaPersona({ statoIdentita: 'in_attesa', motivoIntegrazione: null }, { simulazione: true })}>
                                Documento inviato
                            </Button>
                            <Button size="sm" variant="outline" className="bg-white"
                                onClick={() => aggiornaPersona({ statoIdentita: 'da_integrare', motivoIntegrazione: 'la foto del retro è sfocata' }, { simulazione: true })}>
                                Da integrare
                            </Button>
                            <Button size="sm" variant="outline" className="bg-white"
                                onClick={() => aggiornaPersona({ statoIdentita: 'verificato' }, { simulazione: true })}>
                                Verificato
                            </Button>
                        </div>
                    </NotaMockup>
                ) : (
                    <NotaMockup className="mt-6">
                        <p>Per ora l’identità la verifica l’admin: in «Soggetti e utenti» apre la tua scheda e la segna come verificata.</p>
                    </NotaMockup>
                )}
            </AccessoShell>
        </>
    );
};

export default InAttesaVerificaPage;
