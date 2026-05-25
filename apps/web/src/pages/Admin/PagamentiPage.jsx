import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search, ChevronUp, ChevronDown,
    Euro, Clock, CheckCircle2, Ban,
    Plus, XCircle, Zap
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Dati mock ─────────────────────────────────────────────────────────────────
const USCITE_INIZIALI = [
    { id: 1, data: '2026-04-05', ora: '09:00', immobile: 'Via Roma 42, Milano', a: 'Marco Bianchi', importo: 1200, mese: 'Aprile 2026', stato: 'inviato' },
    { id: 2, data: '2026-04-05', ora: '09:05', immobile: 'Corso Venezia 18, Milano', a: 'Marco Bianchi', importo: 950, mese: 'Aprile 2026', stato: 'in attesa' },
    { id: 3, data: '2026-04-05', ora: '09:10', immobile: 'Via Dante 7, Roma', a: 'Sara Conti', importo: 1450, mese: 'Aprile 2026', stato: 'inviato' },
    { id: 4, data: '2026-04-05', ora: '09:15', immobile: 'Piazza Navona 23, Roma', a: 'Sara Conti', importo: 1100, mese: 'Aprile 2026', stato: 'inviato' },
    { id: 5, data: '2026-04-05', ora: '09:20', immobile: 'Via Garibaldi 56, Torino', a: 'Luca Ferrari', importo: 850, mese: 'Aprile 2026', stato: 'in attesa' },
    { id: 6, data: '2026-04-05', ora: '09:25', immobile: 'Calle Larga 8, Venezia', a: 'Giulia Neri', importo: 1300, mese: 'Aprile 2026', stato: 'inviato' },
    { id: 7, data: '2026-03-05', ora: '09:00', immobile: 'Via Roma 42, Milano', a: 'Marco Bianchi', importo: 1200, mese: 'Marzo 2026', stato: 'inviato' },
    { id: 8, data: '2026-03-05', ora: '09:05', immobile: 'Corso Venezia 18, Milano', a: 'Marco Bianchi', importo: 950, mese: 'Marzo 2026', stato: 'inviato' },
    { id: 9, data: '2026-03-05', ora: '09:10', immobile: 'Via Dante 7, Roma', a: 'Sara Conti', importo: 1450, mese: 'Marzo 2026', stato: 'inviato' },
    { id: 10, data: '2026-03-05', ora: '09:15', immobile: 'Via Garibaldi 56, Torino', a: 'Luca Ferrari', importo: 850, mese: 'Marzo 2026', stato: 'inviato' },
    { id: 11, data: '2026-03-05', ora: '09:20', immobile: 'Calle Larga 8, Venezia', a: 'Giulia Neri', importo: 1300, mese: 'Marzo 2026', stato: 'inviato' },
    { id: 12, data: '2026-02-05', ora: '09:00', immobile: 'Via Roma 42, Milano', a: 'Marco Bianchi', importo: 1200, mese: 'Febbraio 2026', stato: 'inviato' },
    { id: 13, data: '2026-02-05', ora: '09:05', immobile: 'Corso Venezia 18, Milano', a: 'Marco Bianchi', importo: 950, mese: 'Febbraio 2026', stato: 'bloccato' },
    { id: 14, data: '2026-02-05', ora: '09:10', immobile: 'Via Dante 7, Roma', a: 'Sara Conti', importo: 1450, mese: 'Febbraio 2026', stato: 'inviato' },
];

const locatori_MOCK = [
    {
        id: 1, nome: 'Marco Bianchi', immobili: [
            { id: 1, indirizzo: 'Via Roma 42, Milano', canone: 1200 },
            { id: 2, indirizzo: 'Corso Venezia 18, Milano', canone: 950 },
        ]
    },
    {
        id: 2, nome: 'Sara Conti', immobili: [
            { id: 3, indirizzo: 'Via Dante 7, Roma', canone: 1450 },
            { id: 4, indirizzo: 'Piazza Navona 23, Roma', canone: 1100 },
        ]
    },
    {
        id: 3, nome: 'Luca Ferrari', immobili: [
            { id: 5, indirizzo: 'Via Garibaldi 56, Torino', canone: 850 },
        ]
    },
    {
        id: 4, nome: 'Giulia Neri', immobili: [
            { id: 6, indirizzo: 'Calle Larga 8, Venezia', canone: 1300 },
        ]
    },
];

const MESI_MOCK = [
    'Gennaio 2026', 'Febbraio 2026', 'Marzo 2026', 'Aprile 2026',
    'Maggio 2026', 'Giugno 2026', 'Luglio 2026', 'Agosto 2026',
];

const STATO_BADGE = {
    'inviato': 'bg-green-100 text-green-800',
    'in attesa': 'bg-yellow-100 text-yellow-800',
    'bloccato': 'bg-red-100 text-red-800',
};

const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;
const MESE_CORRENTE = 'Aprile 2026';

// ─── StatBox ───────────────────────────────────────────────────────────────────
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

// ─── Modal nuovo pagamento ─────────────────────────────────────────────────────
const ModalNuovoPagamento = ({ onClose, onSalva }) => {
    const [locatoreId, setlocatoreId] = useState('');
    const [immobileId, setImmobileId] = useState('');
    const [importo, setImporto] = useState('');
    const [mese, setMese] = useState('');
    const [loading, setLoading] = useState(false);

    const locatore = locatori_MOCK.find(l => l.id === Number(locatoreId));
    const immobile = locatore?.immobili.find(i => i.id === Number(immobileId));

    const handlelocatore = (val) => {
        setlocatoreId(val);
        setImmobileId('');
        setImporto('');
    };

    const handleImmobile = (val) => {
        setImmobileId(val);
        const imm = locatore?.immobili.find(i => i.id === Number(val));
        if (imm) setImporto(String(imm.canone));
    };

    const handleSalva = () => {
        if (!locatoreId || !immobileId || !importo || !mese) {
            toast.error('Compila tutti i campi');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onSalva({ locatore: locatore.nome, immobile: immobile.indirizzo, importo: Number(importo), mese });
            toast.success(`Pagamento registrato — email inviata a ${locatore.nome} via Edge Function`);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Nuovo pagamento locatore</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Zap className="w-3 h-3 text-yellow-500" /> Invio email via Edge Function
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">locatore <span className="text-red-500">*</span></label>
                        <Select value={locatoreId} onValueChange={handlelocatore}>
                            <SelectTrigger><SelectValue placeholder="Seleziona locatore" /></SelectTrigger>
                            <SelectContent>
                                {locatori_MOCK.map(l => <SelectItem key={l.id} value={String(l.id)}>{l.nome}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Immobile <span className="text-red-500">*</span></label>
                        <Select value={immobileId} onValueChange={handleImmobile} disabled={!locatoreId}>
                            <SelectTrigger>
                                <SelectValue placeholder={locatoreId ? 'Seleziona immobile' : 'Prima seleziona il locatore'} />
                            </SelectTrigger>
                            <SelectContent>
                                {locatore?.immobili.map(i => (
                                    <SelectItem key={i.id} value={String(i.id)}>
                                        {i.indirizzo} — € {i.canone.toLocaleString('it-IT')}/mese
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Importo (€) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                            <Input type="number" value={importo} onChange={e => setImporto(e.target.value)}
                                placeholder="Es. 1200" style={{ paddingLeft: '1.75rem' }} />
                        </div>
                        {immobile && (
                            <p className="text-xs text-muted-foreground">
                                Canone standard: € {immobile.canone.toLocaleString('it-IT')} — modificabile se necessario
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground">Mese di riferimento <span className="text-red-500">*</span></label>
                        <Select value={mese} onValueChange={setMese}>
                            <SelectTrigger><SelectValue placeholder="Seleziona mese" /></SelectTrigger>
                            <SelectContent>
                                {MESI_MOCK.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {locatore && immobile && importo && mese && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm space-y-1">
                            <p className="font-medium text-green-800">Riepilogo</p>
                            <p className="text-green-700">A: <strong>{locatore.nome}</strong></p>
                            <p className="text-green-700">Immobile: <strong>{immobile.indirizzo}</strong></p>
                            <p className="text-green-700">Importo: <strong>€ {Number(importo).toLocaleString('it-IT')}</strong></p>
                            <p className="text-green-700">Mese: <strong>{mese}</strong></p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 justify-end px-6 py-4 border-t border-border">
                    <Button variant="outline" onClick={onClose}>Annulla</Button>
                    <Button onClick={handleSalva} disabled={loading} className="gap-2 min-w-36">
                        {loading
                            ? <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Registrazione...</>
                            : <><Zap className="w-4 h-4" /> Registra e invia email</>
                        }
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ─── Componente principale ─────────────────────────────────────────────────────
const PagamentiPage = () => {
    const [lista, setLista] = useState(USCITE_INIZIALI);
    const [search, setSearch] = useState('');
    const [filtroStato, setStato] = useState('tutti');
    const [filtroMese, setMese] = useState('tutti');
    const [sortField, setSortField] = useState('data');
    const [sortDir, setSortDir] = useState('desc');
    const [showModal, setShowModal] = useState(false);

    const mesi = useMemo(() => [...new Set(lista.map(u => u.mese))], [lista]);

    const contatori = useMemo(() => {
        const questeMese = lista.filter(u => u.mese === MESE_CORRENTE);
        return {
            totMese: questeMese.reduce((s, u) => s + u.importo, 0),
            totInviati: lista.filter(u => u.stato === 'inviato').reduce((s, u) => s + u.importo, 0),
            inAttesa: lista.filter(u => u.stato === 'in attesa').length,
            bloccati: lista.filter(u => u.stato === 'bloccato').length,
        };
    }, [lista]);

    const filtered = useMemo(() => {
        let list = [...lista];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(u => u.immobile.toLowerCase().includes(q) || u.a.toLowerCase().includes(q));
        }
        if (filtroStato !== 'tutti') list = list.filter(u => u.stato === filtroStato);
        if (filtroMese !== 'tutti') list = list.filter(u => u.mese === filtroMese);
        list.sort((a, b) => {
            let va = a[sortField] ?? '', vb = b[sortField] ?? '';
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [lista, search, filtroStato, filtroMese, sortField, sortDir]);

    const toggleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };

    const marcaInviato = (id) => {
        setLista(prev => prev.map(u => u.id === id ? { ...u, stato: 'inviato' } : u));
        toast.success('Pagamento marcato come inviato');
    };

    const aggiuntaPagamento = (dati) => {
        setLista(prev => [{
            id: Date.now(),
            data: new Date().toISOString().split('T')[0],
            ora: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
            immobile: dati.immobile,
            a: dati.locatore,
            importo: dati.importo,
            mese: dati.mese,
            stato: 'inviato',
        }, ...prev]);
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

    const hasFilters = search || filtroStato !== 'tutti' || filtroMese !== 'tutti';

    return (
        <>
            <Helmet><title>Pagamenti locatori - CRIA Admin</title></Helmet>

            {showModal && (
                <ModalNuovoPagamento
                    onClose={() => setShowModal(false)}
                    onSalva={aggiuntaPagamento}
                />
            )}

            <div className="space-y-6">

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Pagamenti locatori</h1>
                        <p className="text-sm text-muted-foreground">Uscite CRIA → locatori per immobili gestiti con Prodotto 2</p>
                    </div>
                    <Button onClick={() => setShowModal(true)} className="gap-2 flex-shrink-0">
                        <Plus className="w-4 h-4" /> Nuovo pagamento
                    </Button>
                </div>

                {/* Contatori */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatBox label="Uscite questo mese" value={fmtEur(contatori.totMese)} icon={Euro} color="bg-blue-500" />
                    <StatBox label="Totale inviati" value={fmtEur(contatori.totInviati)} icon={CheckCircle2} color="bg-green-500" />
                    <StatBox label="In attesa" value={contatori.inAttesa} icon={Clock} color="bg-yellow-500" />
                    <StatBox label="Bloccati" value={contatori.bloccati} icon={Ban} color="bg-red-500" />
                </div>

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca immobile o locatore..." value={search}
                                    onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
                            </div>
                            <Select value={filtroMese} onValueChange={setMese}>
                                <SelectTrigger className="w-44"><SelectValue placeholder="Mese" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti i mesi</SelectItem>
                                    {mesi.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={filtroStato} onValueChange={setStato}>
                                <SelectTrigger className="w-36"><SelectValue placeholder="Stato" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti gli stati</SelectItem>
                                    <SelectItem value="inviato">Inviato</SelectItem>
                                    <SelectItem value="in attesa">In attesa</SelectItem>
                                    <SelectItem value="bloccato">Bloccato</SelectItem>
                                </SelectContent>
                            </Select>
                            {hasFilters && (
                                <Button variant="ghost" size="sm"
                                    onClick={() => { setSearch(''); setStato('tutti'); setMese('tutti'); }}>
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
                                        <Th label="locatore" field="a" />
                                        <Th label="Importo" field="importo" />
                                        <Th label="Mese rif." field="mese" />
                                        <Th label="Stato" field="stato" />
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                                Nessun pagamento trovato con i filtri selezionati.
                                            </td>
                                        </tr>
                                    ) : filtered.map((u) => (
                                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums">
                                                {new Date(u.data).toLocaleDateString('it-IT')} <span className="text-xs">{u.ora}</span>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-foreground">{u.immobile}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{u.a}</td>
                                            <td className="px-4 py-3 font-semibold tabular-nums text-foreground">{fmtEur(u.importo)}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{u.mese}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_BADGE[u.stato]}`}>
                                                    {u.stato}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {(u.stato === 'in attesa' || u.stato === 'bloccato') && (
                                                    <Button size="sm" variant="outline"
                                                        className="gap-1.5 text-green-700 border-green-300 hover:bg-green-50 h-7 text-xs"
                                                        onClick={() => marcaInviato(u.id)}>
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Marca inviato
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filtered.length > 0 && (
                            <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground flex items-center justify-between">
                                <span>{filtered.length === lista.length ? `${lista.length} pagamenti totali` : `${filtered.length} di ${lista.length}`}</span>
                                <span className="font-semibold tabular-nums text-foreground">
                                    Totale filtrato: {fmtEur(filtered.reduce((s, u) => s + u.importo, 0))}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default PagamentiPage;