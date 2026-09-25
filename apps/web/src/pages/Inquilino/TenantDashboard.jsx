import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, MessageSquare, AlertTriangle, ArrowRight, CalendarCheck, Scale, Euro, Gavel } from 'lucide-react';
import PaymentTimeline from '@/components/PaymentTimeline.jsx';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import BoxSemaforo from '@/components/aree/BoxSemaforo';
import { useDatiInquilino } from '@/hooks/useDatiArea';
import { OGGI } from '@/data/datiDemo';
import { morositaDeiContratti } from '@/data/pratiche';
import { fmtEuro, PRODOTTI } from '@/data/catalogo';
import { contestazioneChiusa, etichettaStatoContestazione, classeStatoContestazione } from '@/lib/etichette';
import { nomeMese, fmtData, fmtDataLunga, meseSuccessivo, giorniTra } from '@/lib/formato';

// I-01 — Panoramica dell'inquilino. Il semaforo è quello della persona,
// sempre visibile, con la spiegazione di come è composto.

const TenantDashboard = () => {
    const { persona, contratti, analisiPersona, contestazioni } = useDatiInquilino();
    const prossimo = meseSuccessivo(OGGI.slice(0, 7));
    const inCorso = contestazioni.filter(k => !contestazioneChiusa(k.stato));
    const morosita = morositaDeiContratti(contratti);
    const contestabili = contratti.flatMap(c => c.mesi.filter(m => m.stato === 'in_attesa').map(m => ({ ...m, c })));

    if (contratti.length === 0) {
        return (
            <div className="space-y-6">
                <IntestazionePagina titolo={`Buongiorno, ${persona?.nome}`} />
                <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Non risulti inquilino di nessun contratto CRIA.</CardContent></Card>
            </div>
        );
    }

    return (
        <>
            <Helmet><title>Panoramica - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    titolo={`Buongiorno, ${persona?.nome}`}
                    sottotitolo={`Il tuo semaforo, il tuo contratto e le segnalazioni del proprietario · situazione al ${fmtDataLunga(OGGI)}`}
                    azioni={<Link to="/dashboard/inquilino/assistenza"><Button size="sm" className="gap-2"><MessageSquare className="w-4 h-4" /> Contatta CRIA</Button></Link>}
                />

                <BoxSemaforo
                    analisi={analisiPersona}
                    titolo="Il tuo semaforo"
                    nota="Lo vedi sempre ed è calcolato su di te, su tutti i tuoi contratti di affitto: media del giorno di pagamento negli ultimi 12 mesi. Verde entro il 5, giallo dal 6 al 10, rosso oltre il 10 o con un mese non pagato. I mesi che il proprietario non ha segnalato e quelli contestati non contano."
                />
                <div className="flex justify-end -mt-3">
                    <Link to="/dashboard/inquilino/semaforo" className="text-xs text-primary hover:underline flex items-center gap-1">Come è calcolato e chi lo vede <ArrowRight className="w-3 h-3" /></Link>
                </div>

                {contestabili.map(m => (
                    <Link key={`${m.c.id}-${m.mese}`} to="/dashboard/inquilino/segnalazioni">
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-colors">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                            <p className="text-sm text-yellow-900 flex-1">
                                Il proprietario ha segnalato il mancato pagamento di {nomeMese(m.mese).toLowerCase()} il {fmtData(m.segnalazione.il)}.
                                Se hai pagato puoi contestarlo fino al {fmtData(m.scadenzaContestazione)} ({giorniTra(OGGI, m.scadenzaContestazione)} giorni).
                            </p>
                            <ArrowRight className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        </div>
                    </Link>
                ))}

                {morosita.map(m => {
                    const prossima = m.piano?.rate.find(r => r.stato !== 'pagata');
                    return (
                        <Link key={m.id} to="/dashboard/inquilino/morosita">
                            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
                                <Gavel className="w-5 h-5 text-amber-700 flex-shrink-0" />
                                <p className="text-sm text-amber-900 flex-1">
                                    Hai una pratica di morosità per il canone di {m.mesi.map(x => nomeMese(x).toLowerCase()).join(', ')}.
                                    {prossima ? ` La rata ${prossima.n} del piano di rientro scade il ${fmtData(prossima.scadenza)}.` : ''}
                                </p>
                                <ArrowRight className="w-4 h-4 text-amber-700 flex-shrink-0" />
                            </div>
                        </Link>
                    );
                })}

                {inCorso.length > 0 && (
                    <Link to="/dashboard/inquilino/contestazioni">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors">
                            <Scale className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <p className="text-sm text-blue-900 flex-1">Hai {inCorso.length} contestazione in corso. CRIA risponde entro il {fmtData(inCorso[0].rispostaEntro)}.</p>
                            <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        </div>
                    </Link>
                )}

                {contratti.map(c => (
                    <div key={c.id} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <Card className="xl:col-span-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base"><Home className="w-5 h-5" /> Il mio contratto</CardTitle>
                                    <Link to="/dashboard/inquilino/contratto" className="text-xs text-primary hover:underline">Apri la scheda →</Link>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div><p className="text-xs text-muted-foreground">Immobile</p><p className="font-medium text-foreground">{c.immobile.indirizzo}, {c.immobile.citta}</p></div>
                                <div><p className="text-xs text-muted-foreground">Proprietario</p><p className="font-medium text-foreground">{c.locatore.nome}</p></div>
                                <div><p className="text-xs text-muted-foreground">Canone</p><p className="font-medium text-foreground">{fmtEuro(c.canone)}/mese</p></div>
                                <div><p className="text-xs text-muted-foreground">Scadenza</p><p className="font-medium text-foreground">{fmtData(c.fine)}</p></div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Euro className="w-5 h-5" /> Prossimo canone</CardTitle></CardHeader>
                            <CardContent className="space-y-1">
                                <p className="text-2xl font-bold text-foreground">{fmtEuro(c.canone)}</p>
                                <p className="text-sm text-muted-foreground">Scade il 1 {nomeMese(prossimo).toLowerCase()}</p>
                                <p className="text-xs text-muted-foreground pt-2">Pagando entro il 5 il mese conta come puntuale.</p>
                                {PRODOTTI[c.prodotto]?.incassa === 'cria' && (
                                    <Link to="/dashboard/inquilino/pagamenti" className="inline-block pt-1 text-xs text-primary hover:underline">Lo paghi a CRIA: IBAN e causale →</Link>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="xl:col-span-3">
                            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><CalendarCheck className="w-5 h-5" /> I tuoi ultimi 12 mesi</CardTitle></CardHeader>
                            <CardContent><PaymentTimeline mesi={c.mesi} /></CardContent>
                        </Card>
                    </div>
                ))}

                {contestazioni.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Scale className="w-5 h-5" /> Le tue contestazioni</CardTitle></CardHeader>
                        <CardContent className="p-0 divide-y divide-border">
                            {contestazioni.map(k => (
                                <Link key={k.id} to={`/dashboard/inquilino/contestazioni/${k.id}`} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">{nomeMese(k.mese)}</p>
                                        <p className="text-xs text-muted-foreground">Aperta il {fmtData(k.apertaIl)}</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${classeStatoContestazione(k.stato)}`}>{etichettaStatoContestazione(k.stato, 'conduttore')}</span>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
};

export default TenantDashboard;
