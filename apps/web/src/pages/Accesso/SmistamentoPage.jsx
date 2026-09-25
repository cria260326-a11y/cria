import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Search, FileCheck } from 'lucide-react';
import AccessoShell, { SCHEDA, TITOLO_STILE } from '@/components/AccessoShell';
import SelettoreContesto from '@/components/SelettoreContesto';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { isVerificata } from '@/lib/aree';
import AttesaAccesso from '@/components/accesso/AttesaAccesso';

// ═════════════════════════════════════════════════════════════════════════════
// SMISTAMENTO DOPO L'ACCESSO — F-09
// Una sola area → si entra direttamente. Più aree → si sceglie da dove
// guardare; poi si cambia in qualsiasi momento dal selettore in testata.
// ═════════════════════════════════════════════════════════════════════════════

const SmistamentoPage = () => {
    const { persona, contesti, scegliContesto, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return <AttesaAccesso />;
    if (!persona) return <Navigate to="/login" replace />;
    if (!isVerificata(persona)) return <Navigate to="/in-attesa" replace />;
    if (contesti.length === 1) return <Navigate to={contesti[0].home} replace />;

    const entra = (contesto) => {
        scegliContesto(contesto.area);
        navigate(contesto.home);
    };

    return (
        <>
            <Helmet><title>Da dove vuoi guardare? - CRIA</title></Helmet>
            <AccessoShell larghezza="max-w-2xl" azione={<SelettoreContesto />}>
                {contesti.length === 0 ? (
                    <div className={`${SCHEDA} space-y-6 text-center`}>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>Ciao {persona.nome}</h1>
                            <p className="text-sm text-[#6B6B5E]">
                                La tua identità è verificata, ma non hai ancora un contratto o un servizio attivo. Da qui puoi cominciare.
                            </p>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-3 text-left">
                            <Link to="/scegli-prodotto" className="rounded-xl border border-[#E5E5DE] p-4 hover:border-[#1A2D52]/40 transition-colors">
                                <ShieldCheck className="w-5 h-5 text-[#1A2D52] mb-2" />
                                <p className="font-medium text-[#1A2D52]">Proteggi un immobile</p>
                                <p className="text-xs text-[#6B6B5E]">Scegli il servizio per i tuoi contratti</p>
                            </Link>
                            <Link to="/verifica" className="rounded-xl border border-[#E5E5DE] p-4 hover:border-[#1A2D52]/40 transition-colors">
                                <Search className="w-5 h-5 text-[#1A2D52] mb-2" />
                                <p className="font-medium text-[#1A2D52]">Verifica un candidato</p>
                                <p className="text-xs text-[#6B6B5E]">Prima di firmare un contratto</p>
                            </Link>
                            <Link to="/certificato/autocandidatura" className="rounded-xl border border-[#E5E5DE] p-4 hover:border-[#1A2D52]/40 transition-colors">
                                <FileCheck className="w-5 h-5 text-[#1A2D52] mb-2" />
                                <p className="font-medium text-[#1A2D52]">Certifica il tuo storico</p>
                                <p className="text-xs text-[#6B6B5E]">Se cerchi casa e non sei ancora su CRIA</p>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>
                                Ciao {persona.nome}, da dove vuoi guardare?
                            </h1>
                            <p className="text-sm text-[#6B6B5E] max-w-lg mx-auto">
                                Su CRIA hai più di un ruolo. Ogni area mostra solo quello che riguarda quel ruolo.
                                Puoi cambiare in qualsiasi momento dal menu in alto a destra.
                            </p>
                        </div>
                        <div className="grid gap-3">
                            {contesti.map(contesto => {
                                const Icona = contesto.icona;
                                return (
                                    <button
                                        key={contesto.area}
                                        type="button"
                                        onClick={() => entra(contesto)}
                                        className="bg-white rounded-2xl border border-[#E5E5DE] shadow-sm p-5 w-full text-left flex items-center gap-4 hover:border-[#1A2D52]/40 transition-colors"
                                    >
                                        <span className="w-11 h-11 rounded-xl bg-[#1A2D52]/5 flex items-center justify-center flex-shrink-0">
                                            <Icona className="w-5 h-5 text-[#1A2D52]" />
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className="block font-semibold text-[#1A2D52]">{contesto.cappello}</span>
                                            <span className="block text-sm text-[#6B6B5E] mt-0.5">
                                                {contesto.posizioni.length > 0
                                                    ? contesto.posizioni.map(p => p.immobile).join(' · ')
                                                    : contesto.etichetta}
                                            </span>
                                        </span>
                                        <ArrowRight className="w-5 h-5 text-[#6B6B5E] flex-shrink-0" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </AccessoShell>
        </>
    );
};

export default SmistamentoPage;
