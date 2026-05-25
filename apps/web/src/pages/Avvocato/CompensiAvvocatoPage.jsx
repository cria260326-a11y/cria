import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Euro, Search, X, Filter, Download, TrendingUp,
    CheckCircle2, Clock, Info, ArrowDownRight, FileText
} from 'lucide-react';

// ─── Mock compensi ─────────────────────────────────────────────────────────────
const COMPENSI = [
    { id: 1, data: '2026-05-02', motivo: 'Chiusura contestazione #1', cliente: 'Marco Bianchi', importo: 150, stato: 'maturato', causale: 'Risoluzione contestazione' },
    { id: 2, data: '2026-05-01', motivo: 'Verifica documenti pratica', cliente: 'Studio Conti', importo: 80, stato: 'maturato', causale: 'Verifica documentale' },
    { id: 3, data: '2026-05-01', motivo: 'Consulenza pratica', cliente: 'Sara Conti', importo: 120, stato: 'maturato', causale: 'Consulenza' },
    { id: 4, data: '2026-04-28', motivo: 'Chiusura contestazione', cliente: 'Sofia Martini', importo: 150, stato: 'pagato', causale: 'Risoluzione contestazione', dataPagamento: '2026-04-30' },
    { id: 5, data: '2026-04-25', motivo: 'Verifica documenti onboarding', cliente: 'Luca Romano', importo: 80, stato: 'pagato', causale: 'Verifica documentale', dataPagamento: '2026-04-30' },
    { id: 6, data: '2026-04-20', motivo: 'Chiusura contestazione', cliente: 'Elena Greco', importo: 150, stato: 'pagato', causale: 'Risoluzione contestazione', dataPagamento: '2026-04-30' },
    { id: 7, data: '2026-04-15', motivo: 'Consulenza contrattuale', cliente: 'Marco Bianchi', importo: 200, stato: 'pagato', causale: 'Consulenza', dataPagamento: '2026-04-30' },
    { id: 8, data: '2026-04-10', motivo: 'Verifica documenti contestazione', cliente: 'Marco Esposito', importo: 80, stato: 'pagato', causale: 'Verifica documentale', dataPagamento: '2026-04-30' },
    { id: 9, data: '2026-03-28', motivo: 'Chiusura contestazione', cliente: 'Luca Romano', importo: 150, stato: 'pagato', causale: 'Risoluzione contestazione', dataPagamento: '2026-03-31' },
    { id: 10, data: '2026-03-15', motivo: 'Consulenza pratica', cliente: 'Sara Conti', importo: 120, stato: 'pagato', causale: 'Consulenza', dataPagamento: '2026-03-31' },
];

const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;
const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const STATO_BADGE = {
    maturato: { label: 'Maturato', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    pagato: { label: 'Pagato', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
};

const CompensiAvvocatoPage = () => {
    const [tab, setTab] = useState('tutti');
    const [search, setSearch] = useState('');
    const [filtroDa, setDa] = useState('');
    const [filtroA, setA] = useState('');

    const filtrati = useMemo(() => {
        let list = [...COMPENSI];
        if (tab !== 'tutti') list = list.filter(c => c.stato === tab);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c => c.cliente.toLowerCase().includes(q) || c.motivo.toLowerCase().includes(q));
        }
        if (filtroDa) list = list.filter(c => c.data >= filtroDa);
        if (filtroA) list = list.filter(c => c.data <= filtroA);
        return list.sort((a, b) => b.data.localeCompare(a.data));
    }, [tab, search, filtroDa, filtroA]);

    const contatori = useMemo(() => {
        const maturati = COMPENSI.filter(c => c.stato === 'maturato');
        const pagati = COMPENSI.filter(c => c.stato === 'pagato');
        return {
            totaleMaturati: maturati.reduce((s, c) => s + c.importo, 0),
            totalePagati: pagati.reduce((s, c) => s + c.importo, 0),
            countMaturati: maturati.length,
            countPagati: pagati.length,
            mediaCompenso: COMPENSI.length > 0 ? Math.round(COMPENSI.reduce((s, c) => s + c.importo, 0) / COMPENSI.length) : 0,
        };
    }, []);

    const TABS = [
        { id: 'tutti', label: 'Tutti', count: COMPENSI.length },
        { id: 'maturato', label: 'Maturati', count: contatori.countMaturati },
        { id: 'pagato', label: 'Pagati', count: contatori.countPagati },
    ];

    const hasFilters = search || filtroDa || filtroA;

    return (
        <>
            <Helmet><title>Compensi - CRIA Avvocato</title></Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Compensi</h1>
                        <p className="text-sm text-muted-foreground">Storico dei tuoi compensi maturati e pagati</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> Esporta CSV
                    </Button>
                </div>

                {/* Banner info */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium">Modalità di compenso</p>
                        <p className="text-xs mt-0.5">
                            I compensi maturano in base alle attività completate (chiusure contestazioni, verifiche documentali, consulenze).
                            I pagamenti vengono effettuati con bonifico mensile entro la fine del mese successivo.
                        </p>
                    </div>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Maturati (da pagare)', value: fmtEur(contatori.totaleMaturati), icon: Clock, color: 'bg-yellow-500' },
                        { label: 'Già pagati', value: fmtEur(contatori.totalePagati), icon: CheckCircle2, color: 'bg-green-500' },
                        { label: 'Compenso medio', value: fmtEur(contatori.mediaCompenso), icon: TrendingUp, color: 'bg-purple-500' },
                        { label: 'Attività totali', value: COMPENSI.length, icon: FileText, color: 'bg-blue-500' },
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

                {/* Tabs */}
                <div className="flex gap-1 border-b border-border">
                    {TABS.map(({ id, label, count }) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}>
                            {label}
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca per cliente o motivo..."
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
                                <p className="text-sm text-muted-foreground">Nessun compenso trovato</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Motivo</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Causale</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Importo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtrati.map(c => {
                                        const cfg = STATO_BADGE[c.stato];
                                        const Icon = cfg.icon;
                                        return (
                                            <tr key={c.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmtData(c.data)}</td>
                                                <td className="px-4 py-3 text-foreground">{c.motivo}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{c.cliente}</td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{c.causale}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                                                        <Icon className="w-3 h-3" /> {cfg.label}
                                                    </span>
                                                    {c.dataPagamento && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">il {fmtData(c.dataPagamento)}</p>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">
                                                    {fmtEur(c.importo)}
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

export default CompensiAvvocatoPage;