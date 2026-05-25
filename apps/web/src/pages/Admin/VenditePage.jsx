import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search, ChevronUp, ChevronDown, ArrowUpRight,
    ShoppingCart, Euro, TrendingUp, Calendar
} from 'lucide-react';

// ─── Dati mock ─────────────────────────────────────────────────────────────────
const VENDITE = [
    { id: 1, data: '2026-04-01', cliente: 'Marco Bianchi', clienteId: 1, prodotto: 'CRIA Gestione', categoriaId: 'A', commerciale: 'Luca Verdi', codiceRef: 'REF-001', importo: 299, metodo: 'Stripe', stato: 'pagato' },
    { id: 2, data: '2026-04-02', cliente: 'Sara Conti', clienteId: 2, prodotto: 'CRIA Completo', categoriaId: 'B', commerciale: 'Sara Galli', codiceRef: 'REF-002', importo: 499, metodo: 'Bonifico', stato: 'in attesa' },
    { id: 3, data: '2026-04-03', cliente: 'Luca Ferrari', clienteId: 3, prodotto: 'CRIA Verifica', categoriaId: 'C', commerciale: 'Marco Fontana', codiceRef: 'REF-003', importo: 49, metodo: 'Stripe', stato: 'pagato' },
    { id: 4, data: '2026-04-05', cliente: 'Giulia Neri', clienteId: 4, prodotto: 'CRIA Gestione', categoriaId: 'A', commerciale: 'Luca Verdi', codiceRef: 'REF-001', importo: 299, metodo: 'Stripe', stato: 'pagato' },
    { id: 5, data: '2026-04-08', cliente: 'Roberto Fabbri', clienteId: 5, prodotto: 'CRIA Completo', categoriaId: 'B', commerciale: null, codiceRef: null, importo: 499, metodo: 'Bonifico', stato: 'in attesa' },
    { id: 6, data: '2026-04-10', cliente: 'Chiara Lombardi', clienteId: 6, prodotto: 'CRIA Verifica', categoriaId: 'C', commerciale: 'Sara Galli', codiceRef: 'REF-002', importo: 49, metodo: 'Stripe', stato: 'pagato' },
    { id: 7, data: '2026-03-05', cliente: 'Davide Ricci', clienteId: 7, prodotto: 'CRIA Gestione', categoriaId: 'A', commerciale: 'Marco Fontana', codiceRef: 'REF-003', importo: 299, metodo: 'Stripe', stato: 'pagato' },
    { id: 8, data: '2026-03-10', cliente: 'Elena Vitali', clienteId: 8, prodotto: 'CRIA Completo', categoriaId: 'B', commerciale: 'Luca Verdi', codiceRef: 'REF-001', importo: 499, metodo: 'Bonifico', stato: 'pagato' },
    { id: 9, data: '2026-03-15', cliente: 'Fabio Colombo', clienteId: 9, prodotto: 'CRIA Verifica', categoriaId: 'C', commerciale: null, codiceRef: null, importo: 49, metodo: 'Stripe', stato: 'pagato' },
    { id: 10, data: '2026-03-20', cliente: 'Anna Russo', clienteId: 10, prodotto: 'CRIA Gestione', categoriaId: 'A', commerciale: 'Sara Galli', codiceRef: 'REF-002', importo: 299, metodo: 'Stripe', stato: 'annullato' },
    { id: 11, data: '2026-03-22', cliente: 'Paolo Gallo', clienteId: 11, prodotto: 'CRIA Completo', categoriaId: 'B', commerciale: 'Marco Fontana', codiceRef: 'REF-003', importo: 499, metodo: 'Bonifico', stato: 'pagato' },
    { id: 12, data: '2026-03-28', cliente: 'Marta Greco', clienteId: 12, prodotto: 'CRIA Verifica', categoriaId: 'C', commerciale: 'Luca Verdi', codiceRef: 'REF-001', importo: 49, metodo: 'Stripe', stato: 'pagato' },
    { id: 13, data: '2026-02-10', cliente: 'Stefano Bruno', clienteId: 13, prodotto: 'CRIA Gestione', categoriaId: 'A', commerciale: null, codiceRef: null, importo: 299, metodo: 'Stripe', stato: 'pagato' },
    { id: 14, data: '2026-02-18', cliente: 'Giorgio Esposito', clienteId: 14, prodotto: 'CRIA Completo', categoriaId: 'B', commerciale: 'Sara Galli', codiceRef: 'REF-002', importo: 499, metodo: 'Bonifico', stato: 'pagato' },
    { id: 15, data: '2026-02-25', cliente: 'Marco Bianchi', clienteId: 1, prodotto: 'CRIA Verifica', categoriaId: 'C', commerciale: 'Luca Verdi', codiceRef: 'REF-001', importo: 49, metodo: 'Stripe', stato: 'pagato' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const STATO_BADGE = {
    'pagato': 'bg-green-100 text-green-800',
    'in attesa': 'bg-yellow-100 text-yellow-800',
    'annullato': 'bg-red-100 text-red-800',
};

const METODO_BADGE = {
    'Stripe': 'bg-purple-100 text-purple-800',
    'Bonifico': 'bg-blue-100 text-blue-800',
};

const PRODOTTO_BADGE = {
    'A': 'bg-blue-100 text-blue-800',
    'B': 'bg-purple-100 text-purple-800',
    'C': 'bg-amber-100 text-amber-800',
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

// ─── Componente ────────────────────────────────────────────────────────────────
const VenditePage = () => {
    const [search, setSearch] = useState('');
    const [filtroProdotto, setProd] = useState('tutti');
    const [filtroStato, setStato] = useState('tutti');
    const [filtroMetodo, setMetodo] = useState('tutti');
    const [filtroDa, setDa] = useState('');
    const [filtroA, setA] = useState('');
    const [sortField, setSortField] = useState('data');
    const [sortDir, setSortDir] = useState('desc');

    const contatori = useMemo(() => {
        const pagate = VENDITE.filter(v => v.stato === 'pagato');
        const questeMese = VENDITE.filter(v => v.data.startsWith(MESE_CORRENTE));
        const questeMesePagate = questeMese.filter(v => v.stato === 'pagato');
        return {
            totale: VENDITE.length,
            questeMese: questeMese.length,
            valoreTotale: pagate.reduce((s, v) => s + v.importo, 0),
            valoreQuesteMese: questeMesePagate.reduce((s, v) => s + v.importo, 0),
        };
    }, []);

    const filtered = useMemo(() => {
        let list = [...VENDITE];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(v =>
                v.cliente.toLowerCase().includes(q) ||
                (v.commerciale && v.commerciale.toLowerCase().includes(q)) ||
                (v.codiceRef && v.codiceRef.toLowerCase().includes(q))
            );
        }
        if (filtroProdotto !== 'tutti') list = list.filter(v => v.prodotto === filtroProdotto);
        if (filtroStato !== 'tutti') list = list.filter(v => v.stato === filtroStato);
        if (filtroMetodo !== 'tutti') list = list.filter(v => v.metodo === filtroMetodo);
        if (filtroDa) list = list.filter(v => v.data >= filtroDa);
        if (filtroA) list = list.filter(v => v.data <= filtroA);

        list.sort((a, b) => {
            let va = a[sortField] ?? '', vb = b[sortField] ?? '';
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [search, filtroProdotto, filtroStato, filtroMetodo, filtroDa, filtroA, sortField, sortDir]);

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

    const hasFilters = search || filtroProdotto !== 'tutti' || filtroStato !== 'tutti' || filtroMetodo !== 'tutti' || filtroDa || filtroA;
    const prodottiUnici = [...new Set(VENDITE.map(v => v.prodotto))];

    return (
        <>
            <Helmet><title>Vendite - CRIA Admin</title></Helmet>

            <div className="space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Vendite</h1>
                    <p className="text-sm text-muted-foreground">Storico di tutte le vendite dei prodotti CRIA</p>
                </div>

                {/* Contatori */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatBox label="Totale vendite" value={contatori.totale} icon={ShoppingCart} color="bg-blue-500" />
                    <StatBox label="Valore totale" value={fmtEur(contatori.valoreTotale)} icon={Euro} color="bg-green-500" />
                    <StatBox label="Vendite questo mese" value={contatori.questeMese} icon={Calendar} color="bg-purple-500" />
                    <StatBox label="Valore questo mese" value={fmtEur(contatori.valoreQuesteMese)} icon={TrendingUp} color="bg-amber-500" />
                </div>

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cerca cliente o commerciale..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                            <Select value={filtroProdotto} onValueChange={setProd}>
                                <SelectTrigger className="w-44"><SelectValue placeholder="Prodotto" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti i prodotti</SelectItem>
                                    {prodottiUnici.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={filtroMetodo} onValueChange={setMetodo}>
                                <SelectTrigger className="w-36"><SelectValue placeholder="Metodo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti</SelectItem>
                                    <SelectItem value="Stripe">Stripe</SelectItem>
                                    <SelectItem value="Bonifico">Bonifico</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filtroStato} onValueChange={setStato}>
                                <SelectTrigger className="w-36"><SelectValue placeholder="Stato" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti gli stati</SelectItem>
                                    <SelectItem value="pagato">Pagato</SelectItem>
                                    <SelectItem value="in attesa">In attesa</SelectItem>
                                    <SelectItem value="annullato">Annullato</SelectItem>
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
                                    onClick={() => { setSearch(''); setProd('tutti'); setStato('tutti'); setMetodo('tutti'); setDa(''); setA(''); }}>
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
                                        <Th label="Cliente" field="cliente" />
                                        <Th label="Prodotto" field="prodotto" />
                                        <Th label="Commerciale" field="commerciale" />
                                        <Th label="Importo" field="importo" />
                                        <Th label="Metodo" field="metodo" />
                                        <Th label="Stato" field="stato" />
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Cliente</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                                                Nessuna vendita trovata con i filtri selezionati.
                                            </td>
                                        </tr>
                                    ) : filtered.map((v) => (
                                        <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmt(v.data)}</td>
                                            <td className="px-4 py-3 font-medium text-foreground">{v.cliente}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_BADGE[v.categoriaId]}`}>
                                                    {v.prodotto}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {v.commerciale ? (
                                                    <div>
                                                        <p className="text-sm text-foreground">{v.commerciale}</p>
                                                        <p className="text-xs text-muted-foreground tabular-nums">{v.codiceRef}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-semibold tabular-nums text-foreground">{fmtEur(v.importo)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${METODO_BADGE[v.metodo]}`}>
                                                    {v.metodo}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_BADGE[v.stato]}`}>
                                                    {v.stato}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link to={`/dashboard/admin/clienti/${v.clienteId}`}>
                                                    <Button variant="ghost" size="sm" className="gap-1.5">
                                                        Apri <ArrowUpRight className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filtered.length > 0 && (
                            <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
                                <span>
                                    {filtered.length === VENDITE.length
                                        ? `${VENDITE.length} vendite totali`
                                        : `${filtered.length} di ${VENDITE.length} vendite`}
                                </span>
                                <span className="font-semibold tabular-nums text-foreground">
                                    Totale filtrato: {fmtEur(filtered.filter(v => v.stato === 'pagato').reduce((s, v) => s + v.importo, 0))}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default VenditePage;