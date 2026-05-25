import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search, ChevronUp, ChevronDown, ArrowUpRight,
    Euro, Clock, CheckCircle2, Percent, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Dati mock provvigioni ─────────────────────────────────────────────────────
const PROVVIGIONI = [
    { id: 1, data: '2026-04-01', beneficiario: 'Luca Verdi', ruolo: 'commerciale', cliente: 'Marco Bianchi', prodotto: 'CRIA Gestione', importoVendita: 299, importoProvv: 50, stato: 'maturata' },
    { id: 2, data: '2026-04-02', beneficiario: 'Sara Galli', ruolo: 'commerciale', cliente: 'Sara Conti', prodotto: 'CRIA Completo', importoVendita: 499, importoProvv: 80, stato: 'in attesa' },
    { id: 3, data: '2026-04-03', beneficiario: 'Marco Fontana', ruolo: 'commerciale', cliente: 'Luca Ferrari', prodotto: 'CRIA Verifica', importoVendita: 49, importoProvv: 10, stato: 'maturata' },
    { id: 4, data: '2026-04-05', beneficiario: 'Luca Verdi', ruolo: 'commerciale', cliente: 'Giulia Neri', prodotto: 'CRIA Gestione', importoVendita: 299, importoProvv: 50, stato: 'maturata' },
    { id: 5, data: '2026-04-01', beneficiario: 'Avv. Paolo Conti', ruolo: 'avvocato', cliente: 'Marco Bianchi', prodotto: 'CRIA Gestione', importoVendita: 299, importoProvv: 80, stato: 'maturata' },
    { id: 6, data: '2026-04-02', beneficiario: 'Avv. Maria Romano', ruolo: 'avvocato', cliente: 'Sara Conti', prodotto: 'CRIA Completo', importoVendita: 499, importoProvv: 150, stato: 'in attesa' },
    { id: 7, data: '2026-03-05', beneficiario: 'Marco Fontana', ruolo: 'commerciale', cliente: 'Davide Ricci', prodotto: 'CRIA Gestione', importoVendita: 299, importoProvv: 50, stato: 'pagata' },
    { id: 8, data: '2026-03-10', beneficiario: 'Luca Verdi', ruolo: 'commerciale', cliente: 'Elena Vitali', prodotto: 'CRIA Completo', importoVendita: 499, importoProvv: 80, stato: 'pagata' },
    { id: 9, data: '2026-03-05', beneficiario: 'Avv. Paolo Conti', ruolo: 'avvocato', cliente: 'Davide Ricci', prodotto: 'CRIA Gestione', importoVendita: 299, importoProvv: 80, stato: 'pagata' },
    { id: 10, data: '2026-03-10', beneficiario: 'Avv. Maria Romano', ruolo: 'avvocato', cliente: 'Elena Vitali', prodotto: 'CRIA Completo', importoVendita: 499, importoProvv: 150, stato: 'pagata' },
    { id: 11, data: '2026-02-18', beneficiario: 'Sara Galli', ruolo: 'commerciale', cliente: 'Giorgio Esposito', prodotto: 'CRIA Completo', importoVendita: 499, importoProvv: 80, stato: 'pagata' },
    { id: 12, data: '2026-02-18', beneficiario: 'Avv. Carlo Ferrara', ruolo: 'avvocato', cliente: 'Giorgio Esposito', prodotto: 'CRIA Completo', importoVendita: 499, importoProvv: 150, stato: 'pagata' },
];

// ─── Dati mock richieste pagamento ────────────────────────────────────────────
const RICHIESTE_INIZIALI = [
    { id: 1, dataRichiesta: '2026-04-03', beneficiario: 'Luca Verdi', ruolo: 'commerciale', importo: 180, iban: 'IT60X0542811101000000123456', stato: 'in attesa', dataPagamento: null },
    { id: 2, dataRichiesta: '2026-04-04', beneficiario: 'Avv. Paolo Conti', ruolo: 'avvocato', importo: 230, iban: 'IT28W0300203280000400162854', stato: 'in attesa', dataPagamento: null },
    { id: 3, dataRichiesta: '2026-03-15', beneficiario: 'Sara Galli', ruolo: 'commerciale', importo: 80, iban: 'IT40Y0300203280573605681220', stato: 'pagata', dataPagamento: '2026-03-18' },
    { id: 4, dataRichiesta: '2026-03-10', beneficiario: 'Marco Fontana', ruolo: 'commerciale', importo: 50, iban: 'IT95O0501803400000000168507', stato: 'pagata', dataPagamento: '2026-03-12' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const STATO_BADGE_PROVV = {
    'maturata': 'bg-blue-100 text-blue-800',
    'in attesa': 'bg-yellow-100 text-yellow-800',
    'pagata': 'bg-green-100 text-green-800',
};

const STATO_BADGE_RICH = {
    'in attesa': 'bg-yellow-100 text-yellow-800',
    'pagata': 'bg-green-100 text-green-800',
};

const RUOLO_BADGE = {
    'commerciale': 'bg-green-100 text-green-800',
    'avvocato': 'bg-amber-100 text-amber-800',
};

const fmt = (d) => new Date(d).toLocaleDateString('it-IT');
const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;
const MESE_CORRENTE = '2026-04';

const StatBox = ({ label, value, icon: Icon, color }) => (
    <Card>
        <CardContent className="pt-5 pb-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
            </div>
        </CardContent>
    </Card>
);

// ─── Tab 1: Provvigioni ───────────────────────────────────────────────────────
const TabProvvigioni = () => {
    const [search, setSearch] = useState('');
    const [filtroRuolo, setRuolo] = useState('tutti');
    const [filtroStato, setStato] = useState('tutti');
    const [filtroProdotto, setProd] = useState('tutti');
    const [filtroDa, setDa] = useState('');
    const [filtroA, setA] = useState('');
    const [sortField, setSortField] = useState('data');
    const [sortDir, setSortDir] = useState('desc');

    const contatori = useMemo(() => {
        const maturate = PROVVIGIONI.filter(p => p.stato === 'maturata');
        const inAttesa = PROVVIGIONI.filter(p => p.stato === 'in attesa');
        const pagate = PROVVIGIONI.filter(p => p.stato === 'pagata');
        const questeMese = PROVVIGIONI.filter(p => p.data.startsWith(MESE_CORRENTE));
        return {
            totMaturate: maturate.reduce((s, p) => s + p.importoProvv, 0),
            totInAttesa: inAttesa.reduce((s, p) => s + p.importoProvv, 0),
            totPagate: pagate.reduce((s, p) => s + p.importoProvv, 0),
            questeMese: questeMese.reduce((s, p) => s + p.importoProvv, 0),
        };
    }, []);

    const filtered = useMemo(() => {
        let list = [...PROVVIGIONI];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p => p.beneficiario.toLowerCase().includes(q) || p.cliente.toLowerCase().includes(q));
        }
        if (filtroRuolo !== 'tutti') list = list.filter(p => p.ruolo === filtroRuolo);
        if (filtroStato !== 'tutti') list = list.filter(p => p.stato === filtroStato);
        if (filtroProdotto !== 'tutti') list = list.filter(p => p.prodotto === filtroProdotto);
        if (filtroDa) list = list.filter(r => r.dataRichiesta >= filtroDa);
        if (filtroA) list = list.filter(r => r.dataRichiesta <= filtroA);
        list.sort((a, b) => {
            let va = a[sortField] ?? '', vb = b[sortField] ?? '';
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [search, filtroRuolo, filtroStato, filtroProdotto, filtroDa, filtroA, sortField, sortDir]);

    const toggleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const SortIcon = ({ field }) => sortField !== field
        ? <ChevronUp className="w-3.5 h-3.5 opacity-20" />
        : sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />;

    const Th = ({ label, field }) => (
        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground"
            onClick={() => toggleSort(field)}>
            <span className="flex items-center gap-1">{label}<SortIcon field={field} /></span>
        </th>
    );

    const prodottiUnici = [...new Set(PROVVIGIONI.map(p => p.prodotto))];
    const hasFilters = search || filtroRuolo !== 'tutti' || filtroStato !== 'tutti' || filtroProdotto !== 'tutti' || filtroDa || filtroA;

    return (
        <div className="space-y-4">
            {/* Contatori */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatBox label="Da pagare (maturate)" value={fmtEur(contatori.totMaturate)} icon={Percent} color="bg-blue-500" />
                <StatBox label="In attesa verifica" value={fmtEur(contatori.totInAttesa)} icon={Clock} color="bg-yellow-500" />
                <StatBox label="Pagate totale" value={fmtEur(contatori.totPagate)} icon={CheckCircle2} color="bg-green-500" />
                <StatBox label="Questo mese" value={fmtEur(contatori.questeMese)} icon={Euro} color="bg-purple-500" />
            </div>

            {/* Filtri */}
            <Card>
                <CardContent className="pt-4 pb-4">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="relative flex-1 min-w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Cerca beneficiario o cliente..." value={search}
                                onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
                        </div>
                        <Select value={filtroRuolo} onValueChange={setRuolo}>
                            <SelectTrigger className="w-40"><SelectValue placeholder="Ruolo" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tutti">Tutti</SelectItem>
                                <SelectItem value="commerciale">Commerciali</SelectItem>
                                <SelectItem value="avvocato">Avvocati</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filtroProdotto} onValueChange={setProd}>
                            <SelectTrigger className="w-44"><SelectValue placeholder="Prodotto" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tutti">Tutti i prodotti</SelectItem>
                                {prodottiUnici.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={filtroStato} onValueChange={setStato}>
                            <SelectTrigger className="w-36"><SelectValue placeholder="Stato" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tutti">Tutti gli stati</SelectItem>
                                <SelectItem value="maturata">Maturata</SelectItem>
                                <SelectItem value="in attesa">In attesa</SelectItem>
                                <SelectItem value="pagata">Pagata</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground px-1">Dal</span>
                            <Input type="date" value={filtroDa} onChange={e => setDa(e.target.value)} className="w-36" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground px-1">Al</span>
                            <Input type="date" value={filtroA} onChange={e => setA(e.target.value)} className="w-36" />
                        </div>
                        {hasFilters && (
                            <Button variant="ghost" size="sm"
                                onClick={() => { setSearch(''); setRuolo('tutti'); setStato('tutti'); setProd('tutti'); setDa(''); setA(''); }}>
                                Azzera filtri
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Tabella */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr>
                                    <Th label="Data" field="data" />
                                    <Th label="Beneficiario" field="beneficiario" />
                                    <Th label="Ruolo" field="ruolo" />
                                    <Th label="Cliente" field="cliente" />
                                    <Th label="Prodotto" field="prodotto" />
                                    <Th label="Vendita" field="importoVendita" />
                                    <Th label="Provvigione" field="importoProvv" />
                                    <Th label="Stato" field="stato" />
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Scheda</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">Nessuna provvigione trovata.</td></tr>
                                ) : filtered.map((p) => (
                                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmt(p.data)}</td>
                                        <td className="px-4 py-3 font-medium text-foreground">{p.beneficiario}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${RUOLO_BADGE[p.ruolo]}`}>
                                                {p.ruolo}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{p.cliente}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{p.prodotto}</td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmtEur(p.importoVendita)}</td>
                                        <td className="px-4 py-3 font-semibold tabular-nums text-foreground">{fmtEur(p.importoProvv)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_BADGE_PROVV[p.stato]}`}>
                                                {p.stato}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link to={`/dashboard/admin/clienti/${p.id}`}>
                                                <Button variant="ghost" size="sm"><ArrowUpRight className="w-3.5 h-3.5" /></Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length > 0 && (
                        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
                            <span>{filtered.length === PROVVIGIONI.length ? `${PROVVIGIONI.length} provvigioni` : `${filtered.length} di ${PROVVIGIONI.length}`}</span>
                            <span className="font-semibold tabular-nums text-foreground">
                                Totale filtrato: {fmtEur(filtered.reduce((s, p) => s + p.importoProvv, 0))}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

// ─── Tab 2: Richieste pagamento ───────────────────────────────────────────────
const TabRichieste = () => {
    const [richieste, setRichieste] = useState(RICHIESTE_INIZIALI);
    const [search, setSearch] = useState('');
    const [filtroStato, setStato] = useState('tutti');
    const [filtroDa, setDa] = useState('');
    const [filtroA, setA] = useState('');

    const marcaPagata = (id) => {
        const ora = new Date().toISOString().split('T')[0];
        setRichieste(prev => prev.map(r => r.id === id ? { ...r, stato: 'pagata', dataPagamento: ora } : r));
        toast.success('Provvigione pagata');
    };

    const filtered = useMemo(() => {
        let list = [...richieste];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(r => r.beneficiario.toLowerCase().includes(q));
        }
        if (filtroStato !== 'tutti') list = list.filter(r => r.stato === filtroStato);
        return list;
    }, [richieste, search, filtroStato]);

    const totAttesa = richieste.filter(r => r.stato === 'in attesa').reduce((s, r) => s + r.importo, 0);
    const totPagate = richieste.filter(r => r.stato === 'pagata').reduce((s, r) => s + r.importo, 0);

    return (
        <div className="space-y-4">
            {/* Contatori */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatBox label="Richieste in attesa" value={richieste.filter(r => r.stato === 'in attesa').length} icon={Clock} color="bg-yellow-500" />
                <StatBox label="Importo da pagare" value={fmtEur(totAttesa)} icon={Euro} color="bg-orange-500" />
                <StatBox label="Totale già pagato" value={fmtEur(totPagate)} icon={CheckCircle2} color="bg-green-500" />
            </div>

            {/* Filtri */}
            <Card>
                <CardContent className="pt-4 pb-4">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="relative flex-1 min-w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Cerca beneficiario..." value={search}
                                onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
                        </div>
                        <Select value={filtroStato} onValueChange={setStato}>
                            <SelectTrigger className="w-36"><SelectValue placeholder="Stato" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tutti">Tutti</SelectItem>
                                <SelectItem value="in attesa">In attesa</SelectItem>
                                <SelectItem value="pagata">Pagata</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground px-1">Dal</span>
                            <Input type="date" value={filtroDa} onChange={e => setDa(e.target.value)} className="w-36" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground px-1">Al</span>
                            <Input type="date" value={filtroA} onChange={e => setA(e.target.value)} className="w-36" />
                        </div>
                        {(search || filtroStato !== 'tutti' || filtroDa || filtroA) && (
                            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStato('tutti'); setDa(''); setA(''); }}>
                                Azzera filtri
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Tabella */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data richiesta</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Beneficiario</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Ruolo</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Importo richiesto</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">IBAN</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Pagata il</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Nessuna richiesta trovata.</td></tr>
                                ) : filtered.map((r) => (
                                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmt(r.dataRichiesta)}</td>
                                        <td className="px-4 py-3 font-medium text-foreground">{r.beneficiario}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${RUOLO_BADGE[r.ruolo]}`}>
                                                {r.ruolo}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-semibold tabular-nums text-foreground">{fmtEur(r.importo)}</td>
                                        <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{r.iban}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_BADGE_RICH[r.stato]}`}>
                                                {r.stato}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {r.stato === 'pagata' ? (
                                                <span className="text-sm text-muted-foreground tabular-nums flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" /> {fmt(r.dataPagamento)}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {r.stato === 'in attesa' && (
                                                <Button size="sm" variant="outline"
                                                    className="gap-1.5 text-green-700 border-green-300 hover:bg-green-50 h-7 text-xs"
                                                    onClick={() => marcaPagata(r.id)}>
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Pagata
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const ProvvigioniPage = () => {
    const [tab, setTab] = useState('provvigioni');

    const richiesteAttesa = RICHIESTE_INIZIALI.filter(r => r.stato === 'in attesa').length;

    return (
        <>
            <Helmet><title>Provvigioni - CRIA Admin</title></Helmet>

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Provvigioni e compensi</h1>
                    <p className="text-sm text-muted-foreground">Gestione provvigioni commerciali e compensi avvocati</p>
                </div>

                {/* Tab */}
                <div className="flex gap-1 border-b border-border">
                    {[
                        { key: 'provvigioni', label: 'Provvigioni' },
                        { key: 'richieste', label: 'Richieste pagamento', badge: richiesteAttesa || null },
                    ].map(({ key, label, badge }) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}>
                            {label}
                            {badge && (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold">
                                    {badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {tab === 'provvigioni' ? <TabProvvigioni /> : <TabRichieste />}

            </div>
        </>
    );
};

export default ProvvigioniPage;