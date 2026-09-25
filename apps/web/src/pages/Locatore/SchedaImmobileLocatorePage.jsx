import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, User, Mail, Phone, History, Download, Scale, MapPin, ShieldCheck, Euro, CalendarCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from '@/components/StatusBadge.jsx';
import MappaImmobili from '@/components/MappaImmobili.jsx';
import PaymentTimeline from '@/components/PaymentTimeline.jsx';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import BoxSemaforo from '@/components/aree/BoxSemaforo';
import TabellaMesi from '@/components/aree/TabellaMesi';
import { useDatiProprietario } from '@/hooks/useDatiArea';
import { morositaDeiContratti } from '@/data/pratiche';
import { PRODOTTI, nomeProdotto, prezzoProdotto, fmtEuro, COLORE_PRODOTTO } from '@/data/catalogo';
import { fmtData, nomeMese } from '@/lib/formato';
import { TIPO_DOCUMENTO, STATO_DOCUMENTO, etichettaStatoContestazione, classeStatoContestazione } from '@/lib/etichette';

// P-10 — Scheda immobile e contratto. Il semaforo e i mesi sono quelli dello
// stesso contratto aperto dall'elenco: non può più aprirsi "in ritardo" e
// mostrare "regolare".

const Voce = ({ etichetta, children }) => (
    <div>
        <p className="text-xs text-muted-foreground mb-0.5">{etichetta}</p>
        <p className="font-medium text-foreground">{children}</p>
    </div>
);

const SchedaImmobileLocatorePage = () => {
    const { id } = useParams();
    const { contratti, contestazioni, documenti } = useDatiProprietario();
    const c = contratti.find(x => x.id === id);

    if (!c) {
        return (
            <div className="space-y-6">
                <IntestazionePagina titolo="Immobile non trovato" indietro={{ to: '/dashboard/locatore/immobili', label: 'I miei immobili' }} />
                <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Questo immobile non è tra i tuoi.</CardContent></Card>
            </div>
        );
    }

    const p = PRODOTTI[c.prodotto];
    const docs = documenti.filter(d => d.contrattoId === c.id);
    const cont = contestazioni.filter(k => k.contrattoId === c.id);
    const morosita = morositaDeiContratti([c]);

    return (
        <>
            <Helmet><title>{c.immobile.indirizzo} - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    indietro={{ to: '/dashboard/locatore/immobili', label: 'I miei immobili' }}
                    titolo={c.immobile.indirizzo}
                    sottotitolo={`${c.immobile.cap} ${c.immobile.citta} (${c.immobile.provincia}) · ${c.immobile.tipologia}, ${c.immobile.mq} m² · ${c.immobile.catasto}`}
                    badge={<StatusBadge status={c.analisi.semaforo} />}
                    azioni={<>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${COLORE_PRODOTTO[c.prodotto]}`}>{nomeProdotto(c.prodotto)}</span>
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info('Il PDF si genera con il collegamento al backend')}><Download className="w-4 h-4" /> Scarica PDF</Button>
                    </>}
                />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        <BoxSemaforo
                            analisi={c.analisi}
                            titolo={`Semaforo di ${c.conduttore.nome} su questo contratto`}
                            nota="Sul tuo contratto vedi tutto, mese per mese. Il comportamento dell’inquilino su altri contratti non è visibile. Media del giorno di pagamento sugli ultimi 12 mesi; i mesi non rilevati e quelli in verifica non contano."
                        />

                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><CalendarCheck className="w-5 h-5" /> Ultimi 12 mesi</CardTitle></CardHeader>
                            <CardContent><PaymentTimeline mesi={c.mesi} /></CardContent>
                        </Card>

                        <div className="space-y-3">
                            <h2 className="text-base font-semibold text-foreground">Mese per mese</h2>
                            <TabellaMesi mesi={c.mesi} prospettiva="locatore" percorsoContestazioni="/dashboard/locatore/contestazioni" />
                        </div>

                        {morosita.map(m => (
                            <Link key={m.id} to={`/dashboard/locatore/morosita/${m.id}`}>
                                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
                                    <Scale className="w-5 h-5 text-amber-700 flex-shrink-0" />
                                    <p className="text-sm text-amber-900 flex-1">Pratica di morosità in corso: {m.mesi.map(x => nomeMese(x).toLowerCase()).join(', ')}. Apri per vedere recupero e indennizzo.</p>
                                    <ArrowRight className="w-4 h-4 text-amber-700 flex-shrink-0" />
                                </div>
                            </Link>
                        ))}

                        {cont.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Scale className="w-5 h-5" /> Contestazioni su questo contratto</CardTitle></CardHeader>
                                <CardContent className="p-0 divide-y divide-border">
                                    {cont.map(k => (
                                        <Link key={k.id} to={`/dashboard/locatore/contestazioni/${k.id}`} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-foreground">{nomeMese(k.mese)}</p>
                                                <p className="text-xs text-muted-foreground">Aperta il {fmtData(k.apertaIl)}</p>
                                            </div>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${classeStatoContestazione(k.stato)}`}>{etichettaStatoContestazione(k.stato, 'locatore')}</span>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                        </Link>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><MapPin className="w-5 h-5" /> Posizione</CardTitle></CardHeader>
                            <CardContent className="pt-0">
                                <MappaImmobili immobili={[{ id: c.id, lat: c.immobile.lat, lng: c.immobile.lng, titolo: c.immobile.indirizzo, righe: [c.immobile.citta], stato: c.analisi.semaforo }]} altezza={220} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Euro className="w-5 h-5" /> Contratto</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                <Voce etichetta="Canone">{fmtEuro(c.canone)}/mese</Voce>
                                <Voce etichetta="Deposito">{fmtEuro(c.deposito)}</Voce>
                                <Voce etichetta="Inizio">{fmtData(c.inizio)}</Voce>
                                <Voce etichetta="Scadenza">{fmtData(c.fine)}</Voce>
                                <div className="col-span-2"><Voce etichetta="Durata">{c.durata}</Voce></div>
                                <div className="col-span-2 pt-3 border-t border-border">
                                    <p className="text-xs text-muted-foreground mb-0.5">Registrazione</p>
                                    <p className="font-medium text-foreground font-mono text-xs">{c.registrazione.numero}</p>
                                    <p className="text-xs text-muted-foreground">{fmtData(c.registrazione.data)} · {c.registrazione.ufficio}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="w-5 h-5" /> Prodotto CRIA</CardTitle></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p className="font-medium text-foreground">{nomeProdotto(c.prodotto)}</p>
                                <p className="text-muted-foreground">{prezzoProdotto(c.prodotto)}</p>
                                <p className="text-muted-foreground">{p.sintesi}</p>
                                <p className="text-xs text-muted-foreground">Su CRIA dal {nomeMese(c.attivoDal).toLowerCase()}{p.garanzia ? ` · franchigia ${p.franchigiaMesi} ${p.franchigiaMesi === 1 ? 'mese' : 'mesi'}` : ''}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><User className="w-5 h-5" /> Inquilino</CardTitle></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p className="font-medium text-foreground">{c.conduttore.nome}</p>
                                <p className="text-muted-foreground flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {c.conduttore.email}</p>
                                <p className="text-muted-foreground flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {c.conduttore.telefono}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><History className="w-5 h-5" /> Storico inquilini</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                {[{ nome: c.conduttore.nome, dal: c.inizio, al: null }, ...c.storicoInquilini].map((inq, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-border">
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${inq.al ? 'bg-gray-300' : 'bg-green-500'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">{inq.nome}</p>
                                            <p className="text-xs text-muted-foreground">{fmtData(inq.dal)} → {inq.al ? fmtData(inq.al) : 'in corso'}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><FileText className="w-5 h-5" /> Documenti ({docs.length})</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                {docs.map(d => (
                                    <div key={d.id} className="flex items-center gap-3 p-2.5 bg-muted/30 rounded-lg">
                                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{TIPO_DOCUMENTO[d.tipo]}</p>
                                            <p className={`text-xs ${STATO_DOCUMENTO[d.stato].classe}`}>{STATO_DOCUMENTO[d.stato].etichetta} · {fmtData(d.caricatoIl)}</p>
                                        </div>
                                    </div>
                                ))}
                                <Link to="/dashboard/locatore/documenti" className="block text-xs text-primary hover:underline pt-1">Tutti i documenti →</Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SchedaImmobileLocatorePage;
