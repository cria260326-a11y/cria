import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Users, Search, X, AlertTriangle, FileText, Euro,
    ChevronRight, CheckCircle2
} from 'lucide-react';

// ─── Mock clienti ──────────────────────────────────────────────────────────────
const CLIENTI = [
    { id: 1, nome: 'Marco Bianchi', email: 'marco.bianchi@email.it', dataAcquisizione: '2026-02-10', stato: 'attivo', contratti: 2, prodotto: 'P1', provvigioneTotale: 90, contestazioni: 0 },
    { id: 2, nome: 'Sofia Martini', email: 'sofia.martini@email.it', dataAcquisizione: '2026-03-15', stato: 'attivo', contratti: 1, prodotto: 'P1', provvigioneTotale: 30, contestazioni: 1 },
    { id: 3, nome: 'Luca Romano', email: 'luca.romano@email.it', dataAcquisizione: '2026-03-20', stato: 'attivo', contratti: 1, prodotto: 'P1', provvigioneTotale: 30, contestazioni: 0 },
    { id: 4, nome: 'Marco Esposito', email: 'marco.esposito@email.it', dataAcquisizione: '2026-04-28', stato: 'attivo', contratti: 1, prodotto: 'P2', provvigioneTotale: 100, contestazioni: 1 },
    { id: 5, nome: 'Sara Conti', email: 'sara.conti@email.it', dataAcquisizione: '2026-04-15', stato: 'attivo', contratti: 1, prodotto: 'P1', provvigioneTotale: 50, contestazioni: 0 },
    { id: 6, nome: 'Elena Greco', email: 'elena.greco@email.it', dataAcquisizione: '2026-01-20', stato: 'attivo', contratti: 1, prodotto: 'P2', provvigioneTotale: 100, contestazioni: 0 },
    { id: 7, nome: 'Chiara Lombardi', email: 'chiara.lombardi@email.it', dataAcquisizione: '2026-04-30', stato: 'attivo', contratti: 1, prodotto: 'P1', provvigioneTotale: 30, contestazioni: 0 },
    { id: 8, nome: 'Studio Conti', email: 'info@studioconti.it', dataAcquisizione: '2026-05-01', stato: 'attivo', contratti: 3, prodotto: 'P2', provvigioneTotale: 240, contestazioni: 0 },
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

const MieiClientiPage = () => {
    const [search, setSearch] = useState('');
    const [filtroProdotto, setFProdotto] = useState('tutti');
    const [filtroDa, setDa] = useState('');
    const [filtroA, setA] = useState('');

    const filtrati = useMemo(() => {
        let list = [...CLIENTI];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c => c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
        }
        if (filtroProdotto !== 'tutti') list = list.filter(c => c.prodotto === filtroProdotto);
        if (filtroDa) list = list.filter(c => c.dataAcquisizione >= filtroDa);
        if (filtroA) list = list.filter(c => c.dataAcquisizione <= filtroA);
        return list.sort((a, b) => b.dataAcquisizione.localeCompare(a.dataAcquisizione));
    }, [search, filtroProdotto, filtroDa, filtroA]);

    const contatori = useMemo(() => ({
        totali: CLIENTI.length,
        p1: CLIENTI.filter(c => c.prodotto === 'P1').length,
        p2: CLIENTI.filter(c => c.prodotto === 'P2').length,
        provvigioneSum: CLIENTI.reduce((s, c) => s + c.provvigioneTotale, 0),
    }), []);

    const hasFilters = search || filtroProdotto !== 'tutti' || filtroDa || filtroA;

    return (
        <>
            <Helmet><title>I miei clienti - CRIA Commerciale</title></Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">I miei clienti</h1>
                    <p className="text-sm text-muted-foreground">Tutti i clienti acquisiti con il tuo codice referente</p>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Totali', value: contatori.totali, color: 'bg-blue-500' },
                        { label: 'CRIA Gestione', value: contatori.p1, color: 'bg-blue-600' },
                        { label: 'CRIA Completo', value: contatori.p2, color: 'bg-purple-500' },
                        { label: 'Provvigioni totali', value: fmtEur(contatori.provvigioneSum), color: 'bg-green-500' },
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
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca per nome o email..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }} />
                            </div>
                            <select value={filtroProdotto} onChange={e => setFProdotto(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti i prodotti</option>
                                <option value="P1">CRIA Gestione</option>
                                <option value="P2">CRIA Completo</option>
                            </select>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground px-1">Acquisito dal</span>
                                <Input type="date" value={filtroDa} onChange={e => setDa(e.target.value)} className="w-36" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground px-1">Al</span>
                                <Input type="date" value={filtroA} onChange={e => setA(e.target.value)} className="w-36" />
                            </div>
                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFProdotto('tutti'); setDa(''); setA(''); }}>
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
                                <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Nessun cliente trovato</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Acquisito il</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Prodotto</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Contratti</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Provvigione</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtrati.map(c => (
                                        <tr key={c.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-foreground">{c.nome}</p>
                                                <p className="text-xs text-muted-foreground">{c.email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmtData(c.dataAcquisizione)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_BADGE[c.prodotto]}`}>
                                                    {PRODOTTO_LABEL[c.prodotto]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-foreground tabular-nums">{c.contratti}</td>
                                            <td className="px-4 py-3">
                                                {c.contestazioni > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700">
                                                        <AlertTriangle className="w-3 h-3" /> {c.contestazioni} contestaz.
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-green-50 text-green-700">
                                                        <CheckCircle2 className="w-3 h-3" /> Regolare
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">{fmtEur(c.provvigioneTotale)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link to={`/dashboard/commerciale/clienti/${c.id}`}>
                                                    <Button variant="ghost" size="sm" className="gap-1">
                                                        Apri <ChevronRight className="w-3.5 h-3.5" />
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

export default MieiClientiPage;