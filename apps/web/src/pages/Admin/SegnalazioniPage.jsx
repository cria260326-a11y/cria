import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search, ChevronUp, ChevronDown, CheckCircle2, Ban,
    XCircle, AlertTriangle, Clock, Bell, ArrowUpRight
} from 'lucide-react';

// ─── Dati mock ─────────────────────────────────────────────────────────────────
// Modello: locatori[] e inquilini[] come array (cointestatari possibili)
const SEGNALAZIONI = [
    {
        id: 1, data: '2026-04-01', immobile: 'Via Roma 42, Milano',
        locatori: ['Marco Bianchi'], inquilini: ['Sofia Martini'],
        tipo: 'pagato', segnalato_da: 'locatore', mese: 'Aprile 2026', stato: 'confermato', contestazione_id: null
    },
    {
        id: 2, data: '2026-04-01', immobile: 'Corso Venezia 18, Milano',
        locatori: ['Marco Bianchi'], inquilini: ['Luca Romano'],
        tipo: 'mancato pagamento', segnalato_da: 'CRIA', mese: 'Aprile 2026', stato: 'in verifica', contestazione_id: null
    },
    {
        id: 3, data: '2026-03-28', immobile: 'Via Garibaldi 56, Torino',
        locatori: ['Luca Ferrari'], inquilini: ['Chiara Lombardi'],
        tipo: 'mancato pagamento', segnalato_da: 'locatore', mese: 'Marzo 2026', stato: 'contestato', contestazione_id: 1
    },
    {
        id: 4, data: '2026-03-25', immobile: 'Via Dante 7, Roma',
        locatori: ['Anna Verdi', 'Paolo Verdi'], inquilini: ['Elena Greco'],
        tipo: 'pagato', segnalato_da: 'locatore', mese: 'Marzo 2026', stato: 'confermato', contestazione_id: null
    },
    {
        id: 5, data: '2026-03-20', immobile: 'Via Roma 15, Roma',
        locatori: ['Sara Conti'], inquilini: ['Marco Esposito'],
        tipo: 'pagato', segnalato_da: 'CRIA', mese: 'Marzo 2026', stato: 'confermato', contestazione_id: null
    },
    {
        id: 6, data: '2026-03-18', immobile: 'Piazza Navona 23, Roma',
        locatori: ['Sara Conti'], inquilini: ['Marco Esposito', 'Davide Romano'],
        tipo: 'mancato pagamento', segnalato_da: 'locatore', mese: 'Marzo 2026', stato: 'contestato', contestazione_id: 2
    },
    {
        id: 7, data: '2026-03-10', immobile: 'Viale Europa 3, Napoli',
        locatori: ['Roberto Fabbri'], inquilini: ['Paolo Gallo'],
        tipo: 'pagato', segnalato_da: 'locatore', mese: 'Marzo 2026', stato: 'confermato', contestazione_id: null
    },
    {
        id: 8, data: '2026-03-05', immobile: 'Corso Re Umberto 5, Torino',
        locatori: ['Roberto Fabbri'], inquilini: ['Elena Vitali'],
        tipo: 'pagato', segnalato_da: 'CRIA', mese: 'Marzo 2026', stato: 'confermato', contestazione_id: null
    },
    {
        id: 9, data: '2026-02-28', immobile: 'Corso Palestro 11, Brescia',
        locatori: ['Alessia Moretti'], inquilini: ['Fabio Colombo'],
        tipo: 'mancato pagamento', segnalato_da: 'locatore', mese: 'Febbraio 2026', stato: 'in verifica', contestazione_id: null
    },
    {
        id: 10, data: '2026-02-20', immobile: 'Via Mazzini 3, Verona',
        locatori: ['Davide Ricci'], inquilini: ['Marta Greco'],
        tipo: 'pagato', segnalato_da: 'locatore', mese: 'Febbraio 2026', stato: 'confermato', contestazione_id: null
    },
    {
        id: 11, data: '2026-02-15', immobile: 'Via Libertà 4, Monza',
        locatori: ['Davide Ricci'], inquilini: ['Stefano Bruno'],
        tipo: 'mancato pagamento', segnalato_da: 'CRIA', mese: 'Febbraio 2026', stato: 'contestato', contestazione_id: 3
    },
    {
        id: 12, data: '2026-01-15', immobile: 'Via Indipendenza 22, Bologna',
        locatori: ['Davide Ricci'], inquilini: ['Stefano Bruno'],
        tipo: 'mancato pagamento', segnalato_da: 'locatore', mese: 'Gennaio 2026', stato: 'insoluto', contestazione_id: null
    },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const TIPO_CONFIG = {
    'pagato': { label: 'Pagato', icon: CheckCircle2, badge: 'bg-green-100 text-green-800' },
    'mancato pagamento': { label: 'Non pagato', icon: XCircle, badge: 'bg-red-100 text-red-800' },
};

const STATO_BADGE = {
    'confermato': 'bg-green-100 text-green-800',
    'in verifica': 'bg-yellow-100 text-yellow-800',
    'contestato': 'bg-red-100 text-red-800',
    'insoluto': 'bg-gray-800 text-white',
};

const SEGNALATO_DA_BADGE = {
    'locatore': 'bg-blue-100 text-blue-800',
    'CRIA': 'bg-purple-100 text-purple-800',
};

const fmt = (d) => new Date(d).toLocaleDateString('it-IT');

// Helper: mostra una lista di persone in modo compatto
//   1 persona → "Marco Bianchi"
//   2+ persone → "Marco Bianchi + 1" (con tooltip pieni)
const formatPersone = (persone) => {
    if (!persone || persone.length === 0) return '—';
    if (persone.length === 1) return persone[0];
    return `${persone[0]} + ${persone.length - 1}`;
};

const StatBox = ({ label, value, icon: Icon, color }) => (
    <Card>
        <CardContent className="pt-5 pb-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
            </div>
        </CardContent>
    </Card>
);

// ═════════════════════════════════════════════════════════════════════════════
const SegnalazioniPage = () => {
    const [search, setSearch] = useState('');
    const [filtroTipo, setTipo] = useState('tutti');
    const [filtroStato, setStato] = useState('tutti');
    const [filtroDa, setDa] = useState('');
    const [filtroA, setA] = useState('');
    const [sortField, setSortField] = useState('data');
    const [sortDir, setSortDir] = useState('desc');

    const contatori = useMemo(() => ({
        totale: SEGNALAZIONI.length,
        pagati: SEGNALAZIONI.filter(s => s.tipo === 'pagato').length,
        mancati: SEGNALAZIONI.filter(s => s.tipo === 'mancato pagamento').length,
        contestati: SEGNALAZIONI.filter(s => s.stato === 'contestato').length,
        verifica: SEGNALAZIONI.filter(s => s.stato === 'in verifica').length,
        insoluti: SEGNALAZIONI.filter(s => s.stato === 'insoluto').length,
    }), []);

    const filtered = useMemo(() => {
        let list = [...SEGNALAZIONI];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(s =>
                s.immobile.toLowerCase().includes(q) ||
                s.locatori.some(l => l.toLowerCase().includes(q)) ||
                s.inquilini.some(i => i.toLowerCase().includes(q))
            );
        }
        if (filtroTipo !== 'tutti') list = list.filter(s => s.tipo === filtroTipo);
        if (filtroStato !== 'tutti') list = list.filter(s => s.stato === filtroStato);
        if (filtroDa) list = list.filter(s => s.data >= filtroDa);
        if (filtroA) list = list.filter(s => s.data <= filtroA);

        list.sort((a, b) => {
            let va = a[sortField] ?? '', vb = b[sortField] ?? '';
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [search, filtroTipo, filtroStato, filtroDa, filtroA, sortField, sortDir]);

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

    const hasFilters = search || filtroTipo !== 'tutti' || filtroStato !== 'tutti' || filtroDa || filtroA;

    return (
        <>
            <Helmet><title>Segnalazioni - CRIA Admin</title></Helmet>

            <div className="space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Segnalazioni</h1>
                    <p className="text-sm text-muted-foreground">Gestione delle segnalazioni di pagamento da inquilini e locatori</p>
                </div>

                {/* Contatori */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    <StatBox label="Totale segnalazioni" value={contatori.totale} icon={Bell} color="bg-blue-500" />
                    <StatBox label="Pagamenti segnalati" value={contatori.pagati} icon={CheckCircle2} color="bg-green-500" />
                    <StatBox label="Non pagati" value={contatori.mancati} icon={XCircle} color="bg-red-500" />
                    <StatBox label="Contestazioni aperte" value={contatori.contestati} icon={AlertTriangle} color="bg-orange-500" />
                    <StatBox label="Da verificare" value={contatori.verifica} icon={Clock} color="bg-yellow-500" />
                    <StatBox label="Insoluti" value={contatori.insoluti} icon={Ban} color="bg-gray-700" />
                </div>

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cerca immobile, locatore o inquilino..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={filtroTipo} onValueChange={setTipo}>
                                <SelectTrigger className="w-48"><SelectValue placeholder="Tipo segnalazione" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti i tipi</SelectItem>
                                    <SelectItem value="pagato">Pagato</SelectItem>
                                    <SelectItem value="mancato pagamento">Non pagato</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filtroStato} onValueChange={setStato}>
                                <SelectTrigger className="w-40"><SelectValue placeholder="Stato" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti gli stati</SelectItem>
                                    <SelectItem value="confermato">Confermato</SelectItem>
                                    <SelectItem value="in verifica">In verifica</SelectItem>
                                    <SelectItem value="contestato">Contestato</SelectItem>
                                    <SelectItem value="insoluto">Insoluto</SelectItem>
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
                                    onClick={() => { setSearch(''); setTipo('tutti'); setStato('tutti'); setDa(''); setA(''); }}>
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
                                        <Th label="Immobile" field="immobile" />
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">locatori</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Inquilini</th>
                                        <Th label="Tipo" field="tipo" />
                                        <Th label="Segnalato da" field="segnalato_da" />
                                        <Th label="Mese rif." field="mese" />
                                        <Th label="Stato" field="stato" />
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                                                Nessuna segnalazione trovata con i filtri selezionati.
                                            </td>
                                        </tr>
                                    ) : filtered.map((s) => {
                                        const tipoConf = TIPO_CONFIG[s.tipo];
                                        const Icon = tipoConf.icon;
                                        return (
                                            <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">{fmt(s.data)}</td>
                                                <td className="px-4 py-3 font-medium text-foreground">{s.immobile}</td>
                                                <td className="px-4 py-3 text-muted-foreground" title={s.locatori.join(', ')}>
                                                    {formatPersone(s.locatori)}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground" title={s.inquilini.join(', ')}>
                                                    {formatPersone(s.inquilini)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${tipoConf.badge}`}>
                                                        <Icon className="w-3 h-3" />
                                                        {tipoConf.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SEGNALATO_DA_BADGE[s.segnalato_da]}`}>
                                                        {s.segnalato_da}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{s.mese}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_BADGE[s.stato]}`}>
                                                        {s.stato}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {s.contestazione_id ? (
                                                        <Link to={`/dashboard/admin/contestazioni/${s.contestazione_id}`}>
                                                            <Button variant="outline" size="sm" className="gap-1.5">
                                                                Contestazione <ArrowUpRight className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {filtered.length > 0 && (
                            <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
                                {filtered.length === SEGNALAZIONI.length
                                    ? `${SEGNALAZIONI.length} segnalazioni totali`
                                    : `${filtered.length} di ${SEGNALAZIONI.length} segnalazioni`}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default SegnalazioniPage;