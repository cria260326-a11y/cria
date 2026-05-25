import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Flag, Search, Filter, X, CheckCircle2, XCircle,
    AlertTriangle, Calendar, Download, Eye
} from 'lucide-react';

const SEGNALAZIONI = [
    { id: 1, data: '2026-04-03', mese: 'Aprile 2026', immobile: 'Via Roma 42, Milano', inquilino: 'Sofia Martini', tipo: 'pagato', esito: 'confermato', contestazione: null },
    { id: 2, data: '2026-04-09', mese: 'Aprile 2026', immobile: 'Corso Venezia 18, Milano', inquilino: 'Luca Romano', tipo: 'non_pagato', esito: 'in_verifica', contestazione: 1 },
    { id: 3, data: '2026-04-12', mese: 'Aprile 2026', immobile: 'Via Garibaldi 56, Torino', inquilino: 'Chiara Lombardi', tipo: 'pagato', esito: 'confermato', contestazione: null },
    { id: 4, data: '2026-03-04', mese: 'Marzo 2026', immobile: 'Via Roma 42, Milano', inquilino: 'Sofia Martini', tipo: 'pagato', esito: 'confermato', contestazione: null },
    { id: 5, data: '2026-03-12', mese: 'Marzo 2026', immobile: 'Corso Venezia 18, Milano', inquilino: 'Luca Romano', tipo: 'non_pagato', esito: 'risolto', contestazione: 1 },
    { id: 6, data: '2026-02-05', mese: 'Febbraio 2026', immobile: 'Via Roma 42, Milano', inquilino: 'Sofia Martini', tipo: 'pagato', esito: 'confermato', contestazione: null },
    { id: 7, data: '2026-01-15', mese: 'Gennaio 2026', immobile: 'Corso Venezia 18, Milano', inquilino: 'Luca Romano', tipo: 'non_pagato', esito: 'risolto', contestazione: 2 },
];

const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const TIPO_BADGE = {
    pagato: { label: 'Pagamento', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    non_pagato: { label: 'Mancato pagamento', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const ESITO_BADGE = {
    confermato: 'bg-green-100 text-green-800',
    in_verifica: 'bg-yellow-100 text-yellow-800',
    risolto: 'bg-blue-100 text-blue-800',
};

const SegnalazioniPage = () => {
    const [search, setSearch] = useState('');
    const [filtroTipo, setFTipo] = useState('tutti');
    const [filtroDa, setDa] = useState('');
    const [filtroA, setA] = useState('');

    const filtrate = useMemo(() => {
        let list = [...SEGNALAZIONI];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(s => s.immobile.toLowerCase().includes(q) || s.inquilino.toLowerCase().includes(q));
        }
        if (filtroTipo !== 'tutti') list = list.filter(s => s.tipo === filtroTipo);
        if (filtroDa) list = list.filter(s => s.data >= filtroDa);
        if (filtroA) list = list.filter(s => s.data <= filtroA);
        return list.sort((a, b) => b.data.localeCompare(a.data));
    }, [search, filtroTipo, filtroDa, filtroA]);

    const contatori = useMemo(() => ({
        totali: SEGNALAZIONI.length,
        pagati: SEGNALAZIONI.filter(s => s.tipo === 'pagato').length,
        nonPagati: SEGNALAZIONI.filter(s => s.tipo === 'non_pagato').length,
        contestate: SEGNALAZIONI.filter(s => s.contestazione !== null).length,
    }), []);

    const hasFilters = search || filtroTipo !== 'tutti' || filtroDa || filtroA;

    return (
        <>
            <Helmet><title>Segnalazioni - CRIA</title></Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Segnalazioni</h1>
                        <p className="text-sm text-muted-foreground">Storico delle tue segnalazioni di pagamento</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> Esporta CSV
                    </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Totali', value: contatori.totali, color: 'bg-blue-500' },
                        { label: 'Pagamenti', value: contatori.pagati, color: 'bg-green-500' },
                        { label: 'Mancati pagamenti', value: contatori.nonPagati, color: 'bg-red-500' },
                        { label: 'Contestate', value: contatori.contestate, color: 'bg-amber-500' },
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

                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca immobile o inquilino..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }} />
                            </div>
                            <select value={filtroTipo} onChange={e => setFTipo(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti i tipi</option>
                                <option value="pagato">Solo pagamenti</option>
                                <option value="non_pagato">Solo mancati pagamenti</option>
                            </select>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground px-1">Dal</span>
                                <Input type="date" value={filtroDa} onChange={e => setDa(e.target.value)} className="w-36" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground px-1">Al</span>
                                <Input type="date" value={filtroA} onChange={e => setA(e.target.value)} className="w-36" />
                            </div>
                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFTipo('tutti'); setDa(''); setA(''); }}>
                                    <X className="w-3.5 h-3.5 mr-1" /> Azzera
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        {filtrate.length === 0 ? (
                            <div className="py-16 text-center">
                                <Flag className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Nessuna segnalazione trovata</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Immobile</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Inquilino</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Mese</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tipo</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Esito</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtrate.map(s => {
                                        const tcfg = TIPO_BADGE[s.tipo];
                                        const Icon = tcfg.icon;
                                        return (
                                            <tr key={s.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmtData(s.data)}</td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-foreground text-xs">{s.immobile}</p>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">{s.inquilino}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{s.mese}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${tcfg.color}`}>
                                                        <Icon className="w-3 h-3" /> {tcfg.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ESITO_BADGE[s.esito] || 'bg-gray-100'}`}>
                                                        {s.esito.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {s.contestazione && (
                                                        <Link to={`/dashboard/locatore/contestazioni/${s.contestazione}`}>
                                                            <Button variant="ghost" size="sm" className="gap-1 text-red-600">
                                                                <AlertTriangle className="w-3.5 h-3.5" /> Contestaz.
                                                            </Button>
                                                        </Link>
                                                    )}
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

export default SegnalazioniPage;