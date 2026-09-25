import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Search, Plus, X, LayoutGrid, List, MapPin, ChevronRight } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge.jsx';
import MappaImmobili from '@/components/MappaImmobili.jsx';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import { useDatiProprietario } from '@/hooks/useDatiArea';
import { PRODOTTI, PRODOTTI_PROPRIETARIO, nomeProdotto, fmtEuro, COLORE_PRODOTTO } from '@/data/catalogo';
import { SEMAFORO, ORDINE_SEMAFORO } from '@/lib/semaforo';
import { fmtData } from '@/lib/formato';

// P-09 — I miei immobili, con la stessa mappa della panoramica.

const ImmobiliPage = () => {
    const navigate = useNavigate();
    const { contratti } = useDatiProprietario();
    const [cerca, setCerca] = useState('');
    const [fSemaforo, setFSemaforo] = useState('tutti');
    const [fProdotto, setFProdotto] = useState('tutti');
    const [vista, setVista] = useState('schede');

    const filtrati = useMemo(() => contratti.filter(c => {
        const q = cerca.trim().toLowerCase();
        if (q && !`${c.immobile.indirizzo} ${c.immobile.citta} ${c.conduttore.nome}`.toLowerCase().includes(q)) return false;
        if (fSemaforo !== 'tutti' && c.analisi.semaforo !== fSemaforo) return false;
        if (fProdotto !== 'tutti' && c.prodotto !== fProdotto) return false;
        return true;
    }), [contratti, cerca, fSemaforo, fProdotto]);

    const conta = (s) => contratti.filter(c => c.analisi.semaforo === s).length;
    const filtriAttivi = cerca || fSemaforo !== 'tutti' || fProdotto !== 'tutti';
    const punti = filtrati.map(c => ({
        id: c.id, lat: c.immobile.lat, lng: c.immobile.lng,
        titolo: `${c.immobile.indirizzo}, ${c.immobile.citta}`,
        righe: [`Inquilino: ${c.conduttore.nome}`, nomeProdotto(c.prodotto)],
        stato: c.analisi.semaforo,
    }));
    const apri = (id) => navigate(`/dashboard/locatore/immobili/${id}`);

    return (
        <>
            <Helmet><title>I miei immobili - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    titolo="I miei immobili"
                    sottotitolo="Ogni immobile con il suo contratto, il prodotto CRIA e il semaforo dell’inquilino"
                    azioni={<Link to="/scegli-prodotto"><Button className="gap-2"><Plus className="w-4 h-4" /> Aggiungi immobile</Button></Link>}
                />

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <Contatore etichetta="Immobili" valore={contratti.length} colore="bg-blue-500" />
                    {['verde', 'giallo', 'rosso'].map(s => (
                        <Contatore key={s} etichetta={SEMAFORO[s].etichetta} valore={conta(s)} colore={s === 'verde' ? 'bg-green-500' : s === 'giallo' ? 'bg-yellow-500' : 'bg-red-500'} />
                    ))}
                </div>

                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca indirizzo, città o inquilino…" value={cerca} onChange={e => setCerca(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
                            </div>
                            <select value={fSemaforo} onChange={e => setFSemaforo(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti i semafori</option>
                                {ORDINE_SEMAFORO.map(s => <option key={s} value={s}>{SEMAFORO[s].etichetta}</option>)}
                            </select>
                            <select value={fProdotto} onChange={e => setFProdotto(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti i prodotti</option>
                                {PRODOTTI_PROPRIETARIO.map(p => <option key={p} value={p}>{nomeProdotto(p)}</option>)}
                            </select>
                            {filtriAttivi && (
                                <Button variant="ghost" size="sm" onClick={() => { setCerca(''); setFSemaforo('tutti'); setFProdotto('tutti'); }}>
                                    <X className="w-3.5 h-3.5 mr-1" /> Azzera
                                </Button>
                            )}
                            <div className="ml-auto flex gap-1 p-1 bg-muted rounded-lg">
                                <button onClick={() => setVista('schede')} className={`p-1.5 rounded ${vista === 'schede' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`} title="Schede"><LayoutGrid className="w-4 h-4" /></button>
                                <button onClick={() => setVista('elenco')} className={`p-1.5 rounded ${vista === 'elenco' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`} title="Elenco"><List className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base"><MapPin className="w-5 h-5" /> Sulla mappa</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <MappaImmobili immobili={punti} altezza={360} onApri={apri} />
                    </CardContent>
                </Card>

                {filtrati.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Home className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Nessun immobile con questi filtri</p>
                        </CardContent>
                    </Card>
                ) : vista === 'schede' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtrati.map(c => (
                            <Card key={c.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-5 pb-5 space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-foreground">{c.immobile.indirizzo}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">{c.immobile.cap} {c.immobile.citta} · {c.immobile.tipologia}, {c.immobile.mq} m²</p>
                                        </div>
                                        <StatusBadge status={c.analisi.semaforo} />
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${COLORE_PRODOTTO[c.prodotto]}`}>{nomeProdotto(c.prodotto)}</span>
                                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                            {PRODOTTI[c.prodotto].garanzia ? `Garanzia · franchigia ${PRODOTTI[c.prodotto].franchigiaMesi} ${PRODOTTI[c.prodotto].franchigiaMesi === 1 ? 'mese' : 'mesi'}` : 'Senza garanzia'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-sm">
                                        <div><p className="text-xs text-muted-foreground">Inquilino</p><p className="font-medium text-foreground truncate">{c.conduttore.nome}</p></div>
                                        <div><p className="text-xs text-muted-foreground">Canone</p><p className="font-medium text-foreground">{fmtEuro(c.canone)}/mese</p></div>
                                        <div className="col-span-2"><p className="text-xs text-muted-foreground">Scadenza contratto</p><p className="font-medium text-foreground">{fmtData(c.fine)}</p></div>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => apri(c.id)}>Apri la scheda <ChevronRight className="w-3.5 h-3.5" /></Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr className="text-left text-xs font-semibold text-muted-foreground uppercase">
                                        <th className="px-4 py-3">Immobile</th><th className="px-4 py-3">Inquilino</th><th className="px-4 py-3">Prodotto</th>
                                        <th className="px-4 py-3">Canone</th><th className="px-4 py-3">Scadenza</th><th className="px-4 py-3">Semaforo</th><th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtrati.map(c => (
                                        <tr key={c.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => apri(c.id)}>
                                            <td className="px-4 py-3"><p className="font-medium text-foreground">{c.immobile.indirizzo}</p><p className="text-xs text-muted-foreground">{c.immobile.cap} {c.immobile.citta}</p></td>
                                            <td className="px-4 py-3 text-muted-foreground">{c.conduttore.nome}</td>
                                            <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${COLORE_PRODOTTO[c.prodotto]}`}>{nomeProdotto(c.prodotto)}</span></td>
                                            <td className="px-4 py-3 tabular-nums text-foreground">{fmtEuro(c.canone)}</td>
                                            <td className="px-4 py-3 tabular-nums text-muted-foreground">{fmtData(c.fine)}</td>
                                            <td className="px-4 py-3"><StatusBadge status={c.analisi.semaforo} /></td>
                                            <td className="px-4 py-3 text-right"><ChevronRight className="w-4 h-4 text-muted-foreground inline" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
};

export default ImmobiliPage;
