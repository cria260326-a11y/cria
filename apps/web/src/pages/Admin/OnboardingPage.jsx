import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search, ChevronUp, ChevronDown, ArrowUpRight,
    ClipboardList, FileText, SendHorizonal, FileWarning, CheckCircle2,
} from 'lucide-react';

// ─── Dati mock pratiche ────────────────────────────────────────────────────────
// Modello: ogni pratica ha uno stato dei 7 definiti:
//   non_avviato, in_corso, documenti_in_verifica, documenti_da_integrare,
//   documenti_verificati, preventivo_inviato, pagato_e_attivo
//
// Le pratiche P1/P2 hanno tutte P4 come prodotto già acquistato (consumato all'avvio).
const PRATICHE = [
    { id: 1, data: '2026-04-01', cliente: 'Marco Bianchi', clienteId: 1, tipo: 'locatore', prodotti: ['P4', 'P1'], nImmobili: 2, stato: 'documenti_in_verifica' },
    { id: 2, data: '2026-04-02', cliente: 'Sara Conti', clienteId: 2, tipo: 'locatore', prodotti: ['P4', 'P2'], nImmobili: 1, stato: 'documenti_da_integrare' },
    { id: 3, data: '2026-04-03', cliente: 'Luca Ferrari', clienteId: 3, tipo: 'cliente_p3', prodotti: ['P3'], nImmobili: 0, stato: 'in_corso' },
    { id: 4, data: '2026-04-05', cliente: 'Giulia Neri', clienteId: 4, tipo: 'locatore', prodotti: ['P4', 'P1'], nImmobili: 3, stato: 'documenti_verificati' },
    { id: 5, data: '2026-04-06', cliente: 'Roberto Fabbri', clienteId: 5, tipo: 'cliente_p3', prodotti: ['P3'], nImmobili: 0, stato: 'documenti_in_verifica' },
    { id: 6, data: '2026-03-20', cliente: 'Chiara Lombardi', clienteId: 6, tipo: 'locatore', prodotti: ['P4', 'P1', 'P2'], nImmobili: 2, stato: 'pagato_e_attivo' },
    { id: 7, data: '2026-03-22', cliente: 'Davide Ricci', clienteId: 7, tipo: 'locatore', prodotti: ['P4', 'P2'], nImmobili: 1, stato: 'pagato_e_attivo' },
    { id: 8, data: '2026-03-25', cliente: 'Elena Vitali', clienteId: 8, tipo: 'cliente_p3', prodotti: ['P3'], nImmobili: 0, stato: 'pagato_e_attivo' },
    { id: 9, data: '2026-04-07', cliente: 'Paolo Gallo', clienteId: 11, tipo: 'locatore', prodotti: ['P4', 'P1'], nImmobili: 1, stato: 'preventivo_inviato' },
    { id: 10, data: '2026-04-08', cliente: 'Anna Russo', clienteId: 12, tipo: 'locatore', prodotti: ['P4', 'P2'], nImmobili: 1, stato: 'documenti_da_integrare' },
];

// ─── Stati pratica (7 stati definiti nel modello) ──────────────────────────────
const STATO_PRATICA = {
    'non_avviato': { label: 'Non avviato', class: 'bg-gray-100 text-gray-700' },
    'in_corso': { label: 'In corso', class: 'bg-blue-100 text-blue-800' },
    'documenti_in_verifica': { label: 'Documenti in verifica', class: 'bg-yellow-100 text-yellow-800' },
    'documenti_da_integrare': { label: 'Documenti da integrare', class: 'bg-orange-100 text-orange-800' },
    'documenti_verificati': { label: 'Documenti verificati', class: 'bg-blue-100 text-blue-800' },
    'preventivo_inviato': { label: 'Preventivo inviato', class: 'bg-purple-100 text-purple-800' },
    'pagato_e_attivo': { label: 'Pagato e attivo', class: 'bg-green-100 text-green-800' },
};

// ─── Badge prodotto (4 prodotti) ───────────────────────────────────────────────
const PRODOTTO_BADGE = {
    'P1': 'bg-blue-100 text-blue-800',
    'P2': 'bg-purple-100 text-purple-800',
    'P3': 'bg-amber-100 text-amber-800',
    'P4': 'bg-rose-100 text-rose-800',
};

const fmt = (d) => new Date(d).toLocaleDateString('it-IT');

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
const OnboardingPage = () => {
    const [tabTipo, setTabTipo] = useState('locatore');
    const [search, setSearch] = useState('');
    const [filtroStato, setStato] = useState('tutti');
    const [sortField, setSortField] = useState('data');
    const [sortDir, setSortDir] = useState('desc');

    // Source query (futuro):
    //   - Documenti da verificare:   SELECT count(*) FROM pratiche WHERE stato = 'documenti_in_verifica'
    //   - Preventivi da inviare:     SELECT count(*) FROM pratiche WHERE stato = 'documenti_verificati'
    //   - In integrazione:           SELECT count(*) FROM pratiche WHERE stato = 'documenti_da_integrare'
    //   - Pagati e attivi:           SELECT count(*) FROM pratiche WHERE stato = 'pagato_e_attivo'
    const contatori = useMemo(() => ({
        daVerificare: PRATICHE.filter(p => p.stato === 'documenti_in_verifica').length,
        daInviare: PRATICHE.filter(p => p.stato === 'documenti_verificati').length,
        inIntegrazione: PRATICHE.filter(p => p.stato === 'documenti_da_integrare').length,
        attivi: PRATICHE.filter(p => p.stato === 'pagato_e_attivo').length,
    }), []);

    const praticheFiltrate = useMemo(() => {
        let list = PRATICHE.filter(p => tabTipo === 'locatore' ? p.tipo === 'locatore' : p.tipo === 'cliente_p3');
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p => p.cliente.toLowerCase().includes(q));
        }
        if (filtroStato !== 'tutti') list = list.filter(p => p.stato === filtroStato);
        list.sort((a, b) => {
            let va = a[sortField] ?? '', vb = b[sortField] ?? '';
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [tabTipo, search, filtroStato, sortField, sortDir]);

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

    const countlocatori = PRATICHE.filter(p => p.tipo === 'locatore').length;
    const countP3 = PRATICHE.filter(p => p.tipo === 'cliente_p3').length;

    return (
        <>
            <Helmet><title>Onboarding - CRIA Admin</title></Helmet>

            <div className="space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Onboarding</h1>
                    <p className="text-sm text-muted-foreground">Pratiche di onboarding in corso e completate</p>
                </div>

                {/* Contatori azione */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatBox label="Documenti da verificare" value={contatori.daVerificare} icon={FileText} color="bg-yellow-500" />
                    <StatBox label="Preventivi da inviare" value={contatori.daInviare} icon={SendHorizonal} color="bg-blue-500" />
                    <StatBox label="In integrazione" value={contatori.inIntegrazione} icon={FileWarning} color="bg-orange-500" />
                    <StatBox label="Pagati e attivi" value={contatori.attivi} icon={CheckCircle2} color="bg-green-500" />
                </div>

                {/* Sub-tab tipo pratica */}
                <div className="flex gap-2">
                    <button onClick={() => setTabTipo('locatore')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${tabTipo === 'locatore' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                        Onboarding P1/P2 ({countlocatori})
                    </button>
                    <button onClick={() => setTabTipo('cliente_p3')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${tabTipo === 'cliente_p3' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                        Richiesta P3 ({countP3})
                    </button>
                </div>

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca cliente..." value={search}
                                    onChange={e => setSearch(e.target.value)} className="pl-9" />
                            </div>
                            <Select value={filtroStato} onValueChange={setStato}>
                                <SelectTrigger className="w-56"><SelectValue placeholder="Stato" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti gli stati</SelectItem>
                                    <SelectItem value="in_corso">In corso</SelectItem>
                                    <SelectItem value="documenti_in_verifica">Documenti in verifica</SelectItem>
                                    <SelectItem value="documenti_da_integrare">Documenti da integrare</SelectItem>
                                    <SelectItem value="documenti_verificati">Documenti verificati</SelectItem>
                                    <SelectItem value="preventivo_inviato">Preventivo inviato</SelectItem>
                                    <SelectItem value="pagato_e_attivo">Pagato e attivo</SelectItem>
                                </SelectContent>
                            </Select>
                            {(search || filtroStato !== 'tutti') && (
                                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStato('tutti'); }}>
                                    Azzera filtri
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tabella pratiche */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        <Th label="Data apertura" field="data" />
                                        <Th label="Cliente" field="cliente" />
                                        {tabTipo === 'locatore' && <Th label="Prodotti acquistati" field="prodotti" />}
                                        {tabTipo === 'locatore' && <Th label="Immobili" field="nImmobili" />}
                                        <Th label="Stato" field="stato" />
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Scheda</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {praticheFiltrate.length === 0 ? (
                                        <tr>
                                            <td colSpan={tabTipo === 'locatore' ? 6 : 4}
                                                className="px-4 py-12 text-center text-muted-foreground">
                                                Nessuna pratica trovata con i filtri selezionati.
                                            </td>
                                        </tr>
                                    ) : praticheFiltrate.map((p) => (
                                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">{fmt(p.data)}</td>
                                            <td className="px-4 py-3 font-medium text-foreground">{p.cliente}</td>
                                            {tabTipo === 'locatore' && (
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {p.prodotti.map(pr => (
                                                            <span key={pr} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_BADGE[pr]}`}>
                                                                {pr}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            )}
                                            {tabTipo === 'locatore' && (
                                                <td className="px-4 py-3 text-muted-foreground tabular-nums">{p.nImmobili}</td>
                                            )}
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_PRATICA[p.stato].class}`}>
                                                    {STATO_PRATICA[p.stato].label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link to={`/dashboard/admin/clienti/${p.clienteId}`}>
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
                        {praticheFiltrate.length > 0 && (
                            <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
                                {praticheFiltrate.length} {praticheFiltrate.length === 1 ? 'pratica' : 'pratiche'}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default OnboardingPage;