import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, ShieldOff, Search, Wallet, Info } from 'lucide-react';
import AccessoShell, { TITOLO_STILE } from '@/components/AccessoShell';
import { PRODOTTI, PARAMETRI, nomeProdotto, prezzoProdotto, fmtEuro } from '@/data/catalogo';
import { useProdotti } from '@/lib/prodottiDemo';

// ═════════════════════════════════════════════════════════════════════════════
// SCELTA DEL PRODOTTO — P-01
// I prodotti del proprietario in vendita, come li decide l'admin (O-21): anche
// quelli nuovi, non quelli tolti dalla vendita. Il prodotto sta sul contratto,
// quindi si sceglie per ogni immobile; si paga dopo la verifica di CRIA. Il
// prezzo esce dal listino: nessun preventivo.
// ═════════════════════════════════════════════════════════════════════════════

const franchigia = (p) => (p.franchigiaMesi == null ? '' : ` · franchigia ${p.franchigiaMesi} ${p.franchigiaMesi === 1 ? 'mese' : 'mesi'}`);

const SceltaProdotto = () => {
    const navigate = useNavigate();
    const { inVenditaAiProprietari } = useProdotti();

    return (
        <>
            <Helmet><title>Scegli il prodotto - CRIA</title></Helmet>
            <AccessoShell larghezza="max-w-5xl" azione={<Link to="/dashboard" className="text-sm text-[#6B6B5E] hover:text-[#1A2D52]">Torna alla tua area</Link>}>
                <div className="space-y-8">
                    <div className="space-y-2 max-w-2xl">
                        <h1 className="text-3xl sm:text-4xl text-[#1A2D52]" style={TITOLO_STILE}>Che prodotto metti su questo immobile?</h1>
                        <p className="text-[#6B6B5E]">
                            Il prodotto sta sul contratto: per ogni immobile puoi sceglierne uno diverso. Il prezzo esce dal listino e dal canone che dichiari.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {inVenditaAiProprietari.map(({ codice }) => {
                            const p = PRODOTTI[codice];
                            return (
                                <button key={codice} type="button" onClick={() => navigate(`/onboarding?prodotto=${codice}`)}
                                    className="group text-left rounded-2xl border border-[#E5E5DE] bg-white p-6 hover:border-[#1A2D52]/40 hover:shadow-md transition-all flex flex-col gap-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xl text-[#1A2D52]" style={TITOLO_STILE}>{p.nome}</p>
                                            {p.variante && <p className="text-sm text-[#6B6B5E]">{p.variante}</p>}
                                        </div>
                                        <p className="text-sm font-semibold text-[#1A2D52] text-right">{prezzoProdotto(codice)}</p>
                                    </div>
                                    <p className="text-sm text-[#6B6B5E] leading-relaxed">{p.sintesi}</p>
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${p.garanzia ? 'bg-green-50 text-green-800' : 'bg-slate-100 text-slate-700'}`}>
                                            {p.garanzia ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                                            {p.garanzia ? `Garanzia${franchigia(p)}` : 'Senza garanzia'}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F0] text-[#1A2D52]">
                                            <Wallet className="w-3.5 h-3.5" /> {p.incassa === 'cria' ? 'Incassa CRIA e ti bonifica' : 'Incassi tu il canone'}
                                        </span>
                                    </div>
                                    <span className="inline-flex items-center gap-2 text-sm font-medium text-[#1A2D52] group-hover:gap-3 transition-all">
                                        Scegli {nomeProdotto(codice)} <ArrowRight className="w-4 h-4" />
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#E5E5DE]">
                            <Search className="w-5 h-5 text-[#1A2D52] flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-[#6B6B5E]">
                                Non hai ancora scelto l’inquilino? Verificalo prima con <Link to="/verifica" className="text-[#1A2D52] font-medium underline underline-offset-4">CRIA Verifica</Link>:
                                {' '}{fmtEuro(PRODOTTI.P3.prezzo)} che scaliamo dal prodotto, se lo acquisti entro {PRODOTTI.P3.scalabileEntroGiorni} giorni.
                            </p>
                        </div>
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#E5E5DE]">
                            <Info className="w-5 h-5 text-[#1A2D52] flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-[#6B6B5E]">
                                All’avvio della pratica paghi la quota di iscrizione ({fmtEuro(PARAMETRI.quotaIscrizione)}). Il prezzo del prodotto lo paghi dopo la verifica di CRIA, e da quel momento non cambia più.
                            </p>
                        </div>
                    </div>
                </div>
            </AccessoShell>
        </>
    );
};

export default SceltaProdotto;
