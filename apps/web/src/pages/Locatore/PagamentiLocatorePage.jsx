import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Euro, Search, Filter, X, ArrowDownRight, ArrowUpRight,
    TrendingUp, Calendar, Download, CheckCircle2, Clock, Shield
} from 'lucide-react';

const PAGAMENTI = [
    { id: 1, data: '2026-04-05', immobile: 'Via Roma 42, Milano', inquilino: 'Sofia Martini', importo: 1200, prodotto: 1, fonte: 'segnalazione', stato: 'ricevuto' },
    { id: 2, data: '2026-04-05', immobile: 'Via Dante 7, Roma', inquilino: 'Elena Greco', importo: 1450, prodotto: 2, fonte: 'cria_garantito', stato: 'ricevuto' },
    { id: 3, data: '2026-04-09', immobile: 'Corso Venezia 18, Milano', inquilino: 'Luca Romano', importo: 950, prodotto: 1, fonte: 'segnalazione', stato: 'contestato' },
    { id: 4, data: '2026-04-12', immobile: 'Via Garibaldi 56, Torino', inquilino: 'Chiara Lombardi', importo: 850, prodotto: 1, fonte: 'segnalazione', stato: 'ricevuto' },
    { id: 5, data: '2026-05-05', immobile: 'Piazza Navona 23, Roma', inquilino: 'Marco Esposito', importo: 1100, prodotto: 2, fonte: 'cria_garantito', stato: 'in_arrivo' },
    { id: 6, data: '2026-03-04', immobile: 'Via Roma 42, Milano', inquilino: 'Sofia Martini', importo: 1200, prodotto: 1, fonte: 'segnalazione', stato: 'ricevuto' },
    { id: 7, data: '2026-03-05', immobile: 'Via Dante 7, Roma', inquilino: 'Elena Greco', importo: 1450, prodotto: 2, fonte: 'cria_garantito', stato: 'ricevuto' },
];

const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;
const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const STATO_BADGE = {
    ricevuto: { label: 'Ricevuto', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    in_arrivo: { label: 'In arrivo', color: 'bg-blue-100 text-blue-800', icon: Clock },
    contestato: { label: 'Contestato', color: 'bg-red-100 text-red-800', icon: ArrowUpRight },
};

const FONTE_LABEL = {
    segnalazione: 'Segnalato dal locatore',
    cria_garantito: 'Bonifico CRIA garantito',
};

const PagamentiLocatorePage = () => {
    const [search, setSearch] = useState('');
    const [filtroDa, setDa] = useState('');
    const [filtroA, setA] = useState('');

    const filtrati = useMemo(() => {
        let list = [...PAGAMENTI];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p => p.immobile.toLowerCase().includes(q) || p.inquilino.toLowerCase().includes(q));
        }
        if (filtroDa) list = list.filter(p => p.data >= filtroDa);
        if (filtroA) list = list.filter(p => p.data <= filtroA);
        return list.sort((a, b) => b.data.localeCompare(a.data));
    }, [search, filtroDa, filtroA]);

    const contatori = useMemo(() => {
        const ricevuti = PAGAMENTI.filter(p => p.stato === 'ricevuto');
        const inArrivo = PAGAMENTI.filter(p => p.stato === 'in_arrivo');
        return {
            totaleIncassato: ricevuti.reduce((s, p) => s + p.importo, 0),
            totaleAttesa: inArrivo.reduce((s, p) => s + p.importo, 0),
            pagamentiOk: ricevuti.length,
            contestati: PAGAMENTI.filter(p => p.stato === 'contestato').length,
        };
    }, []);

    const hasFilters = search || filtroDa || filtroA;

    return (
        <>
            <Helmet><title>Pagamenti - CRIA</title></Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Pagamenti</h1>
                        <p className="text-sm text-muted-foreground">Riepilogo finanziario dei tuoi immobili</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> Esporta CSV
                    </Button>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Totale incassato', value: fmtEur(contatori.totaleIncassato), icon: ArrowDownRight, color: 'bg-green-500' },
                        { label: 'In attesa', value: fmtEur(contatori.totaleAttesa), icon: Clock, color: 'bg-blue-500' },
                        { label: 'Pagamenti ricevuti', value: contatori.pagamentiOk, icon: CheckCircle2, color: 'bg-teal-500' },
                        { label: 'Contestati', value: contatori.contestati, icon: ArrowUpRight, color: 'bg-red-500' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <Card key={label}>
                            <CardContent className="pt-5 pb-4 flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg ${color} flex-shrink-0`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Banner CRIA Completo */}
                <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                    <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-purple-800">
                        <p className="font-medium">I pagamenti CRIA Completo sono garantiti</p>
                        <p className="text-xs mt-0.5">Per gli immobili in CRIA Completo riceverai sempre il canone il 5 di ogni mese, indipendentemente dai pagamenti dell'inquilino.</p>
                    </div>
                </div>

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca immobile o inquilino..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground px-1">Dal</span>
                                <Input type="date" value={filtroDa} onChange={e => setDa(e.target.value)} className="w-36" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground px-1">Al</span>
                                <Input type="date" value={filtroA} onChange={e => setA(e.target.value)} className="w-36" />
                            </div>
                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setDa(''); setA(''); }}>
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
                                <Euro className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Nessun pagamento trovato</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Immobile</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Inquilino</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Fonte</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Importo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtrati.map(p => {
                                        const cfg = STATO_BADGE[p.stato];
                                        const Icon = cfg.icon;
                                        return (
                                            <tr key={p.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmtData(p.data)}</td>
                                                <td className="px-4 py-3 text-foreground text-xs">{p.immobile}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{p.inquilino}</td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{FONTE_LABEL[p.fonte]}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                                                        <Icon className="w-3 h-3" /> {cfg.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                                                    {fmtEur(p.importo)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default PagamentiLocatorePage;