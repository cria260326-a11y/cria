import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/StatusBadge.jsx';
import {
    FileText, Search, X, Eye, ChevronRight, AlertTriangle,
    CheckCircle2, Calendar, Euro
} from 'lucide-react';

// ─── Mock contratti ────────────────────────────────────────────────────────────
const CONTRATTI = [
    { id: 1, immobile: 'Via Roma 42, Milano', cliente: 'Marco Bianchi', clienteId: 1, prodotto: 'P1', canone: 1200, dataAttivazione: '2026-02-15', dataScadenza: '2027-02-14', stato: 'verde', contestazioni: 0, provvigione: 60 },
    { id: 2, immobile: 'Corso Venezia 18, Milano', cliente: 'Marco Bianchi', clienteId: 1, prodotto: 'P1', canone: 950, dataAttivazione: '2026-02-20', dataScadenza: '2027-02-19', stato: 'giallo', contestazioni: 1, provvigione: 30 },
    { id: 3, immobile: 'Via Dante 7, Roma', cliente: 'Marco Bianchi', clienteId: 1, prodotto: 'P2', canone: 1450, dataAttivazione: '2026-03-10', dataScadenza: '2027-03-09', stato: 'verde', contestazioni: 0, provvigione: 100 },
    { id: 4, immobile: 'Piazza Navona 23, Roma', cliente: 'Marco Esposito', clienteId: 4, prodotto: 'P2', canone: 1100, dataAttivazione: '2026-04-30', dataScadenza: '2027-04-29', stato: 'rosso', contestazioni: 1, provvigione: 100 },
    { id: 5, immobile: 'Via Garibaldi 56, Torino', cliente: 'Sofia Martini', clienteId: 2, prodotto: 'P1', canone: 850, dataAttivazione: '2026-03-15', dataScadenza: '2027-03-14', stato: 'verde', contestazioni: 0, provvigione: 30 },
    { id: 6, immobile: 'Via Manzoni 8, Milano', cliente: 'Sara Conti', clienteId: 5, prodotto: 'P1', canone: 980, dataAttivazione: '2026-04-15', dataScadenza: '2027-04-14', stato: 'verde', contestazioni: 0, provvigione: 50 },
];

const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;
const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const PRODOTTO_BADGE = {
    P1: 'bg-blue-100 text-blue-800',
    P2: 'bg-purple-100 text-purple-800',
};

const PRODOTTO_LABEL = {
    P1: 'CRIA Gestione',
    P2: 'CRIA Completo',
};

const ContrattiCommercialePage = () => {
    const [search, setSearch] = useState('');
    const [filtroStato, setFStato] = useState('tutti');
    const [filtroProdotto, setFProdotto] = useState('tutti');

    const filtrati = useMemo(() => {
        let list = [...CONTRATTI];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c => c.immobile.toLowerCase().includes(q) || c.cliente.toLowerCase().includes(q));
        }
        if (filtroStato !== 'tutti') list = list.filter(c => c.stato === filtroStato);
        if (filtroProdotto !== 'tutti') list = list.filter(c => c.prodotto === filtroProdotto);
        return list.sort((a, b) => b.dataAttivazione.localeCompare(a.dataAttivazione));
    }, [search, filtroStato, filtroProdotto]);

    const contatori = useMemo(() => ({
        totali: CONTRATTI.length,
        p1: CONTRATTI.filter(c => c.prodotto === 'P1').length,
        p2: CONTRATTI.filter(c => c.prodotto === 'P2').length,
        contestati: CONTRATTI.filter(c => c.contestazioni > 0).length,
    }), []);

    const hasFilters = search || filtroStato !== 'tutti' || filtroProdotto !== 'tutti';

    return (
        <>
            <Helmet><title>I miei contratti - CRIA Commerciale</title></Helmet>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">I miei contratti</h1>
                    <p className="text-sm text-muted-foreground">Tutti i contratti generati con il tuo codice referente</p>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Totali', value: contatori.totali, color: 'bg-blue-500' },
                        { label: 'CRIA Gestione', value: contatori.p1, color: 'bg-blue-600' },
                        { label: 'CRIA Completo', value: contatori.p2, color: 'bg-purple-500' },
                        { label: 'Con contestazioni', value: contatori.contestati, color: 'bg-amber-500' },
                    ].map(({ label, value, color }) => (
                        <Card key={label}>
                            <CardContent className="pt-5 pb-4 flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                                <div>
                                    <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca immobile o cliente..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }} />
                            </div>
                            <select value={filtroStato} onChange={e => setFStato(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti gli stati</option>
                                <option value="verde">Regolari</option>
                                <option value="giallo">In ritardo</option>
                                <option value="rosso">Irregolari</option>
                            </select>
                            <select value={filtroProdotto} onChange={e => setFProdotto(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti i prodotti</option>
                                <option value="P1">CRIA Gestione</option>
                                <option value="P2">CRIA Completo</option>
                            </select>
                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFStato('tutti'); setFProdotto('tutti'); }}>
                                    <X className="w-3.5 h-3.5 mr-1" /> Azzera
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tabella */}
                <Card>
                    <CardContent className="p-0">
                        {filtrati.length === 0 ? (
                            <div className="py-16 text-center">
                                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Nessun contratto trovato</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Immobile</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Prodotto</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Canone</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Attivato il</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Provvigione</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtrati.map(c => (
                                        <tr key={c.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-foreground text-xs">{c.immobile}</p>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{c.cliente}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_BADGE[c.prodotto]}`}>
                                                    {PRODOTTO_LABEL[c.prodotto]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-foreground tabular-nums">{fmtEur(c.canone)}</td>
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmtData(c.dataAttivazione)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge status={c.stato} />
                                                    {c.contestazioni > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-amber-50 text-amber-700">
                                                            <AlertTriangle className="w-3 h-3" /> {c.contestazioni}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">{fmtEur(c.provvigione)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link to={`/dashboard/commerciale/clienti/${c.clienteId}`}>
                                                    <Button variant="ghost" size="sm" className="gap-1">
                                                        Cliente <ChevronRight className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default ContrattiCommercialePage;