import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, Clock, CircleDashed, CalendarClock, MessageSquare, Info, ShieldCheck } from 'lucide-react';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import { useDatiInquilino } from '@/hooks/useDatiArea';
import { morositaDeiContratti } from '@/data/pratiche';
import { OGGI } from '@/data/datiDemo';
import { fmtEuro } from '@/data/catalogo';
import { fmtData, nomeMese, giorniTra } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// LA MIA PRATICA DI MOROSITÀ — I-09, con dentro il piano di rientro (I-10).
// L'inquilino vede lo stato del caso e le sue rate; non vede la corrispondenza
// interna, le valutazioni né il rapporto fra CRIA e il proprietario.
// ═════════════════════════════════════════════════════════════════════════════

const STATO = {
    aperta: { etichetta: 'Aperta', classe: 'bg-amber-100 text-amber-800' },
    piano_proposto: { etichetta: 'Piano di rientro proposto', classe: 'bg-blue-100 text-blue-800' },
    piano_in_corso: { etichetta: 'Piano di rientro in corso', classe: 'bg-blue-100 text-blue-800' },
    chiusa: { etichetta: 'Chiusa', classe: 'bg-green-100 text-green-800' },
};

const Pratica = ({ m, c }) => {
    const [pagate, setPagate] = useState({});
    const rate = (m.piano?.rate || []).map(r => (pagate[r.n] ? { ...r, stato: 'pagata', pagataIl: pagate[r.n] } : r));
    const pagato = rate.filter(r => r.stato === 'pagata').reduce((t, r) => t + r.importo, 0);
    const totale = rate.reduce((t, r) => t + r.importo, 0);
    const prossima = rate.find(r => r.stato !== 'pagata');
    const eventi = m.eventi.filter(e => !e.soloProprietario);

    const paga = (r) => {
        setPagate(p => ({ ...p, [r.n]: OGGI }));
        toast.success(`Rata ${r.n} pagata: ${fmtEuro(r.importo)}`);
    };

    return (
        <div className="space-y-6">
            <IntestazionePagina
                titolo="La mia pratica di morosità"
                sottotitolo={`${c.immobile.indirizzo}, ${c.immobile.citta} · canone di ${m.mesi.map(x => nomeMese(x).toLowerCase()).join(', ')} non pagato · ${fmtEuro(m.importo)}`}
                badge={<span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATO[m.stato]?.classe}`}>{STATO[m.stato]?.etichetta || m.stato}</span>}
                azioni={<Link to="/dashboard/inquilino/assistenza"><Button variant="outline" size="sm" className="gap-2"><MessageSquare className="w-4 h-4" /> Scrivi a CRIA</Button></Link>}
            />

            {prossima && (
                <Card className="border-[#1A2D52]/30">
                    <CardContent className="pt-5 pb-5 flex items-center gap-4 flex-wrap">
                        <CalendarClock className="w-6 h-6 text-[#1A2D52] flex-shrink-0" />
                        <div className="flex-1 min-w-[16rem]">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Prossima rata</p>
                            <p className="text-sm text-foreground">Rata {prossima.n} di {rate.length}: <span className="font-semibold">{fmtEuro(prossima.importo)}</span>, entro il {fmtData(prossima.scadenza)}{giorniTra(OGGI, prossima.scadenza) >= 0 ? ` (tra ${giorniTra(OGGI, prossima.scadenza)} giorni)` : ''}.</p>
                        </div>
                        <Button className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={() => paga(prossima)}>Paga la rata {prossima.n}</Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2">
                    <CardHeader className="pb-3"><CardTitle className="text-base">Il piano di rientro</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {rate.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Non c’è ancora un piano: CRIA ti contatta per concordarlo.</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                    <div className="p-3 rounded-lg bg-muted/30"><p className="text-xs text-muted-foreground">Pagato</p><p className="font-semibold text-foreground">{fmtEuro(pagato)}</p></div>
                                    <div className="p-3 rounded-lg bg-muted/30"><p className="text-xs text-muted-foreground">Da pagare</p><p className="font-semibold text-foreground">{fmtEuro(totale - pagato)}</p></div>
                                    <div className="p-3 rounded-lg bg-muted/30"><p className="text-xs text-muted-foreground">Totale</p><p className="font-semibold text-foreground">{fmtEuro(totale)} in {rate.length} rate</p></div>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-green-500" style={{ width: `${totale ? (pagato / totale) * 100 : 0}%` }} /></div>
                                <div className="divide-y divide-border">
                                    {rate.map(r => (
                                        <div key={r.n} className="flex items-center gap-3 py-3">
                                            {r.stato === 'pagata' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : r.stato === 'in_scadenza' ? <Clock className="w-4 h-4 text-amber-600" /> : <CircleDashed className="w-4 h-4 text-muted-foreground" />}
                                            <div className="flex-1">
                                                <p className="text-sm text-foreground">Rata {r.n}</p>
                                                <p className="text-xs text-muted-foreground">Entro il {fmtData(r.scadenza)}{r.pagataIl ? ` · pagata il ${fmtData(r.pagataIl)}` : ''}</p>
                                            </div>
                                            <span className="text-sm tabular-nums text-foreground">{fmtEuro(r.importo)}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-start gap-1.5"><Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Le rate si pagano a CRIA, che segue la pratica. Se una rata salta senza accordo, la pratica passa al legale.</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-base">Cosa è successo</CardTitle></CardHeader>
                        <CardContent>
                            <ol className="space-y-4">
                                {eventi.map(e => (
                                    <li key={e.il + e.titolo} className="flex gap-3">
                                        <span className="w-2 h-2 rounded-full bg-[#1A2D52] mt-1.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">{fmtData(e.il)}</p>
                                            <p className="text-sm font-medium text-foreground">{e.titolo}</p>
                                            <p className="text-xs text-muted-foreground">{e.testo}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="w-5 h-5" /> Il tuo semaforo</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>{m.mesi.map(x => nomeMese(x)).join(', ')} resta nel tuo storico come non pagato: è quello che è successo.</p>
                            <p>Il piano rispettato compare anche nel certificato, tra gli accordi di rientro del periodo.</p>
                            <Link to="/dashboard/inquilino/semaforo" className="text-primary hover:underline text-sm">Vai al tuo semaforo →</Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const MorositaInquilinoPage = () => {
    const { contratti } = useDatiInquilino();
    const pratiche = morositaDeiContratti(contratti);
    return (
        <>
            <Helmet><title>La mia pratica di morosità - CRIA</title></Helmet>
            {pratiche.length === 0 ? (
                <div className="space-y-6">
                    <IntestazionePagina titolo="La mia pratica di morosità" />
                    <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Non hai pratiche di morosità aperte.</CardContent></Card>
                </div>
            ) : (
                <div className="space-y-10">
                    {pratiche.map(m => <Pratica key={m.id} m={m} c={contratti.find(c => c.id === m.contrattoId)} />)}
                </div>
            )}
        </>
    );
};

export default MorositaInquilinoPage;
