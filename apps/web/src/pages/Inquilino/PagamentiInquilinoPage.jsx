import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Euro, Search, X, ArrowUpRight, CheckCircle2, Clock,
    AlertTriangle, Download, Calendar, Info, TrendingUp
} from 'lucide-react';

const PAGAMENTI = [
    { id: 1, data: '2026-04-03', mese: 'Aprile 2026', importo: 1200, metodo: 'bonifico', stato: 'effettuato', segnalato: true, contestato: false },
    { id: 2, data: '2026-03-04', mese: 'Marzo 2026', importo: 1200, metodo: 'bonifico', stato: 'contestato', segnalato: true, contestato: true },
    { id: 3, data: '2026-02-05', mese: 'Febbraio 2026', importo: 1200, metodo: 'bonifico', stato: 'effettuato', segnalato: true, contestato: false },
    { id: 4, data: '2026-01-03', mese: 'Gennaio 2026', importo: 1200, metodo: 'bonifico', stato: 'effettuato', segnalato: true, contestato: false },
];

const PROSSIMO_PAGAMENTO = {
    mese: 'Maggio 2026',
    importo: 1200,
    scadenza: '2026-05-05',
};

const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;
const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const STATO_BADGE = {
    effettuato: { label: 'Effettuato', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    in_attesa: { label: 'In attesa', color: 'bg-blue-100 text-blue-800', icon: Clock },
    contestato: { label: 'Contestato', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
};

const PagamentiInquilinoPage = () => {
    const [search, setSearch] = useState('');
    const [filtroDa, setDa] = useState('');
    const [filtroA, setA] = useState('');

    const filtrati = useMemo(() => {
        let list = [...PAGAMENTI];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p => p.mese.toLowerCase().includes(q));
        }
        if (filtroDa) list = list.filter(p => p.data >= filtroDa);
        if (filtroA) list = list.filter(p => p.data <= filtroA);
        return list.sort((a, b) => b.data.localeCompare(a.data));
    }, [search, filtroDa, filtroA]);

    const contatori = useMemo(() => ({
        totalePagato: PAGAMENTI.filter(p => p.stato !== 'contestato').reduce((s, p) => s + p.importo, 0),
        pagamentiEff: PAGAMENTI.filter(p => p.stato === 'effettuato').length,
        contestati: PAGAMENTI.filter(p => p.stato === 'contestato').length,
        mediaGiorni: Math.round(PAGAMENTI.reduce((s, p) => s + new Date(p.data).getDate(), 0) / PAGAMENTI.length),
    }), []);

    const hasFilters = search || filtroDa || filtroA;
    const giorniAlPagamento = Math.ceil((new Date(PROSSIMO_PAGAMENTO.scadenza) - new Date()) / 86400000);

    return (
        <>
            <Helmet><title>Pagamenti - CRIA</title></Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Pagamenti</h1>
                        <p className="text-sm text-muted-foreground">Storico dei pagamenti effettuati per il tuo contratto</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> Esporta CSV
                    </Button>
                </div>

                {/* Prossimo pagamento */}
                <Card className="border-2 border-primary/20">
                    <CardContent className="pt-5 pb-5 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-7 h-7 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Prossimo pagamento</p>
                                <p className="text-lg font-bold text-foreground">{PROSSIMO_PAGAMENTO.mese} — {fmtEur(PROSSIMO_PAGAMENTO.importo)}</p>
                                <p className="text-sm text-muted-foreground">
                                    Scadenza: {fmtData(PROSSIMO_PAGAMENTO.scadenza)}
                                    {giorniAlPagamento > 0 && ` · tra ${giorniAlPagamento} giorni`}
                                    {giorniAlPagamento === 0 && ` · oggi`}
                                    {giorniAlPagamento < 0 && ` · scaduto da ${Math.abs(giorniAlPagamento)} giorni`}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* KPI */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Totale pagato', value: fmtEur(contatori.totalePagato), icon: Euro, color: 'bg-green-500' },
                        { label: 'Pagamenti effettuati', value: contatori.pagamentiEff, icon: CheckCircle2, color: 'bg-blue-500' },
                        { label: 'Contestati', value: contatori.contestati, icon: AlertTriangle, color: 'bg-red-500' },
                        { label: 'Giorno medio pagamento', value: contatori.mediaGiorni, icon: TrendingUp, color: 'bg-purple-500' },
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

                {/* Banner suggerimento */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium">Paga entro il giorno 5 per mantenere il tuo punteggio "verde"</p>
                        <p className="text-xs mt-0.5">Pagamenti regolari aumentano la tua reputazione come inquilino e ti danno accesso a vantaggi su nuovi contratti.</p>
                    </div>
                </div>

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca per mese..."
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

                {/* Tabella pagamenti */}
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
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Mese</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data pagamento</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Metodo</th>
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
                                                <td className="px-4 py-3 font-medium text-foreground">{p.mese}</td>
                                                <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmtData(p.data)}</td>
                                                <td className="px-4 py-3 text-muted-foreground capitalize">{p.metodo}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                                                        <Icon className="w-3 h-3" /> {cfg.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">{fmtEur(p.importo)}</td>
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

export default PagamentiInquilinoPage;