import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Euro, Scale, ShieldCheck, Plus, MessageSquare, AlertTriangle, ArrowRight, MapPin, ClipboardList, Gavel } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge.jsx';
import MappaImmobili from '@/components/MappaImmobili.jsx';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import CanoneArrivato from '@/components/aree/CanoneArrivato';
import FasiPratica from '@/components/aree/FasiPratica';
import { usePratiche } from '@/lib/praticheDemo';
import { FASI_PRATICA, morositaDeiContratti } from '@/data/pratiche';
import Contatore from '@/components/aree/Contatore';
import { useDatiProprietario } from '@/hooks/useDatiArea';
import { OGGI } from '@/data/datiDemo';
import { PRODOTTI, nomeProdotto, fmtEuro, COLORE_PRODOTTO } from '@/data/catalogo';
import { SEMAFORO, ORDINE_SEMAFORO } from '@/lib/semaforo';
import { etichettaStatoContestazione, classeStatoContestazione, contestazioneChiusa } from '@/lib/etichette';
import { nomeMese, fmtData, fmtDataLunga } from '@/lib/formato';

// P-08 — Panoramica del proprietario. Tutto viene dai contratti della persona
// collegata: i numeri sono quelli del selettore di contesto.

const LandlordDashboard = () => {
    const navigate = useNavigate();
    const { persona, contratti, contestazioni } = useDatiProprietario();
    const { pratiche } = usePratiche(persona?.id);
    const inCorsoPratiche = pratiche.filter(p => p.stato !== 'attiva');
    const morosita = morositaDeiContratti(contratti);
    const nome = persona?.tipo === 'giuridica' ? persona.ragioneSociale : persona?.nome;

    const inCorso = contestazioni.filter(k => !contestazioneChiusa(k.stato));
    const canoni = contratti.reduce((s, c) => s + c.canone, 0);
    const conGaranzia = contratti.filter(c => PRODOTTI[c.prodotto].garanzia).length;
    const perSemaforo = ORDINE_SEMAFORO
        .map(s => ({ s, n: contratti.filter(c => c.analisi.semaforo === s).length }))
        .filter(x => x.n > 0);
    const perId = Object.fromEntries(contratti.map(c => [c.id, c]));
    const punti = contratti.map(c => ({
        id: c.id, lat: c.immobile.lat, lng: c.immobile.lng,
        titolo: `${c.immobile.indirizzo}, ${c.immobile.citta}`,
        righe: [`Inquilino: ${c.conduttore.nome}`, nomeProdotto(c.prodotto)],
        stato: c.analisi.semaforo,
    }));

    return (
        <>
            <Helmet><title>Panoramica - CRIA</title></Helmet>
            <div className="space-y-6">

                <IntestazionePagina
                    titolo={`Buongiorno, ${nome}`}
                    sottotitolo={`${contratti.length} ${contratti.length === 1 ? 'immobile' : 'immobili'} · situazione al ${fmtDataLunga(OGGI)}`}
                    azioni={<>
                        <Link to="/scegli-prodotto"><Button variant="outline" size="sm" className="gap-2"><Plus className="w-4 h-4" /> Aggiungi immobile</Button></Link>
                        <Link to="/dashboard/locatore/assistenza"><Button size="sm" className="gap-2"><MessageSquare className="w-4 h-4" /> Contatta CRIA</Button></Link>
                    </>}
                />

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <Contatore etichetta="Immobili" valore={contratti.length} icona={Home} colore="bg-blue-500" />
                    <Contatore etichetta="Canoni al mese" valore={fmtEuro(canoni)} icona={Euro} colore="bg-purple-500" />
                    <Contatore etichetta="Con garanzia" valore={`${conGaranzia} su ${contratti.length}`} icona={ShieldCheck} colore="bg-green-600" />
                    <Contatore etichetta="Contestazioni in corso" valore={inCorso.length} icona={Scale} colore={inCorso.length ? 'bg-red-500' : 'bg-slate-400'} />
                </div>

                {inCorso.length > 0 && (
                    <Link to={inCorso.length === 1 ? `/dashboard/locatore/contestazioni/${inCorso[0].id}` : '/dashboard/locatore/contestazioni'}>
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-800 flex-1">
                                {inCorso.length === 1
                                    ? <>{perId[inCorso[0].contrattoId].conduttore.nome} ha contestato la segnalazione di {nomeMese(inCorso[0].mese).toLowerCase()} su {perId[inCorso[0].contrattoId].immobile.indirizzo}. CRIA risponde entro il {fmtData(inCorso[0].rispostaEntro)}.</>
                                    : <>Hai {inCorso.length} contestazioni in corso. Decide CRIA sulla base delle prove.</>}
                            </p>
                            <ArrowRight className="w-4 h-4 text-red-500 flex-shrink-0" />
                        </div>
                    </Link>
                )}

                {morosita.map(m => {
                    const c = perId[m.contrattoId];
                    const prossima = m.piano?.rate.find(r => r.stato !== 'pagata');
                    return (
                        <Link key={m.id} to={`/dashboard/locatore/morosita/${m.id}`}>
                            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
                                <Gavel className="w-5 h-5 text-amber-700 flex-shrink-0" />
                                <p className="text-sm text-amber-900 flex-1">
                                    Pratica di morosità in corso su {c.immobile.indirizzo}: {m.mesi.map(x => nomeMese(x).toLowerCase()).join(', ')}.
                                    {prossima ? ` Piano di rientro: la rata ${prossima.n} scade il ${fmtData(prossima.scadenza)}.` : ''}
                                </p>
                                <ArrowRight className="w-4 h-4 text-amber-700 flex-shrink-0" />
                            </div>
                        </Link>
                    );
                })}

                {inCorsoPratiche.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base"><ClipboardList className="w-5 h-5" /> Pratiche in corso</CardTitle>
                                <Link to="/dashboard/locatore/pratiche" className="text-xs text-primary hover:underline flex items-center gap-1">Vedi tutte <ArrowRight className="w-3 h-3" /></Link>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {inCorsoPratiche.map(p => (
                                <Link key={p.id} to={`/dashboard/locatore/pratiche/${p.id}`} className="rounded-xl border border-border p-4 hover:bg-muted/30 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{p.immobile.indirizzo}</p>
                                            <p className="text-xs text-muted-foreground">{nomeProdotto(p.prodotto)}</p>
                                        </div>
                                        <span className="text-xs font-medium text-[#1A2D52]">{FASI_PRATICA.find(fz => fz.id === p.stato)?.etichetta}</span>
                                    </div>
                                    <FasiPratica stato={p.stato} compatto />
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <Card className="xl:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base"><MapPin className="w-5 h-5" /> I tuoi immobili sulla mappa</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <MappaImmobili immobili={punti} altezza={340} onApri={(id) => navigate(`/dashboard/locatore/immobili/${id}`)} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Semaforo dei tuoi inquilini</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {perSemaforo.map(({ s, n }) => (
                                <div key={s} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                                    <span className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ background: SEMAFORO[s].colore }} />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">{SEMAFORO[s].etichetta}</p>
                                        <p className="text-xs text-muted-foreground">{SEMAFORO[s].spiegazione}</p>
                                    </div>
                                    <span className="text-lg font-bold tabular-nums text-foreground">{n}</span>
                                </div>
                            ))}
                            <p className="text-xs text-muted-foreground">Calcolato sugli ultimi 12 mesi di ciascun contratto.</p>
                        </CardContent>
                    </Card>
                </div>

                <CanoneArrivato contratti={contratti} />

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-foreground">I tuoi immobili</h2>
                        <Link to="/dashboard/locatore/immobili" className="text-xs text-primary hover:underline flex items-center gap-1">Vedi tutti <ArrowRight className="w-3 h-3" /></Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {contratti.map(c => (
                            <Link key={c.id} to={`/dashboard/locatore/immobili/${c.id}`}>
                                <Card className="h-full hover:shadow-md transition-shadow">
                                    <CardContent className="pt-5 pb-5 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-foreground">{c.immobile.indirizzo}</p>
                                                <p className="text-xs text-muted-foreground">{c.immobile.cap} {c.immobile.citta} · {c.immobile.tipologia}</p>
                                            </div>
                                            <StatusBadge status={c.analisi.semaforo} />
                                        </div>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${COLORE_PRODOTTO[c.prodotto]}`}>{nomeProdotto(c.prodotto)}</span>
                                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-sm">
                                            <div><p className="text-xs text-muted-foreground">Inquilino</p><p className="font-medium text-foreground truncate">{c.conduttore.nome}</p></div>
                                            <div><p className="text-xs text-muted-foreground">Canone</p><p className="font-medium text-foreground">{fmtEuro(c.canone)}/mese</p></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {contestazioni.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base"><Scale className="w-5 h-5" /> Contestazioni</CardTitle>
                                <Link to="/dashboard/locatore/contestazioni" className="text-xs text-primary hover:underline flex items-center gap-1">Vedi tutte <ArrowRight className="w-3 h-3" /></Link>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 divide-y divide-border">
                            {contestazioni.slice(0, 3).map(k => {
                                const c = perId[k.contrattoId];
                                return (
                                    <Link key={k.id} to={`/dashboard/locatore/contestazioni/${k.id}`} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 flex-wrap">
                                        <div className="flex-1 min-w-[12rem]">
                                            <p className="text-sm font-medium text-foreground">{nomeMese(k.mese)} · {c.immobile.indirizzo}</p>
                                            <p className="text-xs text-muted-foreground">Contestata da {c.conduttore.nome} il {fmtData(k.apertaIl)}</p>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${classeStatoContestazione(k.stato)}`}>{etichettaStatoContestazione(k.stato, 'locatore')}</span>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                    </Link>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
};

export default LandlordDashboard;
