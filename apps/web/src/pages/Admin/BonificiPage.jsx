import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search, ChevronUp, ChevronDown, CheckCircle2,
    Clock, Upload, Eye, XCircle, Landmark, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Dati mock ─────────────────────────────────────────────────────────────────
const BONIFICI_INIZIALI = [
    {
        id: 1,
        data: '2026-04-02',
        cliente: 'Sara Conti',
        clienteId: 2,
        prodotto: 'CRIA Completo',
        importo: 499,
        causale: 'Attivazione CRIA Completo',
        stato: 'ricevuta caricata',
        ricevuta: 'bonifico_sara_conti.pdf',
        note: '',
        datiBancari: { iban: 'IT40Y0300203280573605681220', intestatario: 'CRIA Srl', banca: 'UniCredit' },
    },
    {
        id: 2,
        data: '2026-04-05',
        cliente: 'Roberto Fabbri',
        clienteId: 5,
        prodotto: 'CRIA Completo',
        importo: 499,
        causale: 'Attivazione CRIA Completo',
        stato: 'in attesa ricevuta',
        ricevuta: null,
        note: '',
        datiBancari: { iban: 'IT40Y0300203280573605681220', intestatario: 'CRIA Srl', banca: 'UniCredit' },
    },
    {
        id: 3,
        data: '2026-03-20',
        cliente: 'Elena Vitali',
        clienteId: 8,
        prodotto: 'CRIA Gestione',
        importo: 299,
        causale: 'Attivazione CRIA Gestione',
        stato: 'verificato',
        ricevuta: 'bonifico_elena_vitali.pdf',
        note: 'Bonifico ricevuto il 22/03/2026',
        datiBancari: { iban: 'IT60X0542811101000000123456', intestatario: 'CRIA Srl', banca: 'Intesa Sanpaolo' },
    },
    {
        id: 4,
        data: '2026-03-15',
        cliente: 'Giorgio Esposito',
        clienteId: 14,
        prodotto: 'CRIA Completo',
        importo: 499,
        causale: 'Attivazione CRIA Completo',
        stato: 'attivato',
        ricevuta: 'bonifico_giorgio_esposito.pdf',
        note: 'Attivato il 17/03/2026',
        datiBancari: { iban: 'IT40Y0300203280573605681220', intestatario: 'CRIA Srl', banca: 'UniCredit' },
    },
    {
        id: 5,
        data: '2026-02-28',
        cliente: 'Paolo Gallo',
        clienteId: 11,
        prodotto: 'CRIA Gestione',
        importo: 299,
        causale: 'Attivazione CRIA Gestione',
        stato: 'attivato',
        ricevuta: 'bonifico_paolo_gallo.pdf',
        note: '',
        datiBancari: { iban: 'IT60X0542811101000000123456', intestatario: 'CRIA Srl', banca: 'Intesa Sanpaolo' },
    },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const STATO_CONFIG = {
    'in attesa ricevuta': { badge: 'bg-yellow-100 text-yellow-800', icon: Clock },
    'ricevuta caricata': { badge: 'bg-blue-100 text-blue-800', icon: Upload },
    'verificato': { badge: 'bg-orange-100 text-orange-800', icon: Eye },
    'attivato': { badge: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    'annullato': { badge: 'bg-red-100 text-red-800', icon: XCircle },
};

const WORKFLOW = ['in attesa ricevuta', 'ricevuta caricata', 'verificato', 'attivato'];

const fmt = (d) => new Date(d).toLocaleDateString('it-IT');
const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;

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

// ─── Modal dettaglio bonifico ─────────────────────────────────────────────────
const ModalBonifico = ({ bonifico, onClose, onAggiornaStato }) => {
    const statoIdx = WORKFLOW.indexOf(bonifico.stato);

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">Bonifico #{bonifico.id}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {/* Workflow visivo */}
                    <div className="flex items-center gap-1">
                        {WORKFLOW.map((s, i) => (
                            <React.Fragment key={s}>
                                <div className={`flex-1 text-center`}>
                                    <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${i < statoIdx ? 'bg-green-500 text-white' :
                                            i === statoIdx ? 'bg-primary text-primary-foreground' :
                                                'bg-muted text-muted-foreground'
                                        }`}>{i + 1}</div>
                                    <p className="text-xs text-muted-foreground mt-1 leading-tight">{s}</p>
                                </div>
                                {i < WORKFLOW.length - 1 && (
                                    <div className={`h-0.5 w-4 flex-shrink-0 ${i < statoIdx ? 'bg-green-500' : 'bg-muted'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Dati */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-xs text-muted-foreground mb-0.5">Cliente</p><p className="font-medium text-foreground">{bonifico.cliente}</p></div>
                        <div><p className="text-xs text-muted-foreground mb-0.5">Prodotto</p><p className="font-medium text-foreground">{bonifico.prodotto}</p></div>
                        <div><p className="text-xs text-muted-foreground mb-0.5">Importo</p><p className="font-semibold text-foreground tabular-nums">{fmtEur(bonifico.importo)}</p></div>
                        <div><p className="text-xs text-muted-foreground mb-0.5">Data richiesta</p><p className="font-medium text-foreground">{fmt(bonifico.data)}</p></div>
                    </div>

                    {/* Dati bancari CRIA */}
                    <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Dati bancari CRIA</p>
                        <p className="text-sm text-foreground font-mono">{bonifico.datiBancari.iban}</p>
                        <p className="text-sm text-muted-foreground">{bonifico.datiBancari.intestatario} — {bonifico.datiBancari.banca}</p>
                        <p className="text-sm text-muted-foreground">Causale: <span className="text-foreground">{bonifico.causale}</span></p>
                    </div>

                    {/* Ricevuta */}
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Ricevuta caricata dal cliente</p>
                        {bonifico.ricevuta ? (
                            <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                                <Upload className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-foreground flex-1">{bonifico.ricevuta}</span>
                                <Button size="sm" variant="outline" className="gap-1.5 h-7"
                                    onClick={() => toast.info('Anteprima disponibile dopo integrazione backend')}>
                                    <Eye className="w-3.5 h-3.5" /> Visualizza
                                </Button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Nessuna ricevuta caricata dal cliente.</p>
                        )}
                    </div>

                    {/* Note */}
                    {bonifico.note && (
                        <div className="p-3 bg-muted/40 rounded-lg">
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Note</p>
                            <p className="text-sm text-foreground">{bonifico.note}</p>
                        </div>
                    )}
                </div>

                {/* Azioni */}
                <div className="px-6 py-4 border-t border-border space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {bonifico.stato === 'ricevuta caricata' && (
                            <Button className="gap-2 bg-orange-600 hover:bg-orange-700"
                                onClick={() => { onAggiornaStato(bonifico.id, 'verificato'); onClose(); }}>
                                <Eye className="w-4 h-4" /> Segna come verificato
                            </Button>
                        )}
                        {bonifico.stato === 'verificato' && (
                            <Button className="gap-2 bg-green-600 hover:bg-green-700"
                                onClick={() => { onAggiornaStato(bonifico.id, 'attivato'); onClose(); }}>
                                <CheckCircle2 className="w-4 h-4" /> Attiva prodotto
                            </Button>
                        )}
                        {(bonifico.stato === 'in attesa ricevuta' || bonifico.stato === 'ricevuta caricata') && (
                            <Button variant="outline" className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => { onAggiornaStato(bonifico.id, 'annullato'); onClose(); }}>
                                <XCircle className="w-4 h-4" /> Annulla
                            </Button>
                        )}
                    </div>
                    <Button variant="ghost" onClick={onClose} className="w-full">Chiudi</Button>
                </div>
            </div>
        </div>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const BonificiPage = () => {
    const [lista, setLista] = useState(BONIFICI_INIZIALI);
    const [search, setSearch] = useState('');
    const [filtroStato, setStato] = useState('tutti');
    const [sortField, setSortField] = useState('data');
    const [sortDir, setSortDir] = useState('desc');
    const [modalBonifico, setModal] = useState(null);

    const contatori = useMemo(() => ({
        attesa: lista.filter(b => b.stato === 'in attesa ricevuta').length,
        caricati: lista.filter(b => b.stato === 'ricevuta caricata').length,
        verificati: lista.filter(b => b.stato === 'verificato').length,
        attivati: lista.filter(b => b.stato === 'attivato').length,
    }), [lista]);

    const aggiornaStato = (id, nuovoStato) => {
        setLista(prev => prev.map(b => b.id === id ? { ...b, stato: nuovoStato } : b));
        toast.success(`Bonifico ${nuovoStato === 'attivato' ? '✓ prodotto attivato' : `→ ${nuovoStato}`}`);
    };

    const filtered = useMemo(() => {
        let list = [...lista];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(b => b.cliente.toLowerCase().includes(q) || b.prodotto.toLowerCase().includes(q));
        }
        if (filtroStato !== 'tutti') list = list.filter(b => b.stato === filtroStato);
        list.sort((a, b) => {
            let va = a[sortField] ?? '', vb = b[sortField] ?? '';
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [lista, search, filtroStato, sortField, sortDir]);

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

    const hasFilters = search || filtroStato !== 'tutti';

    return (
        <>
            <Helmet><title>Bonifici - CRIA Admin</title></Helmet>

            {modalBonifico && (
                <ModalBonifico
                    bonifico={modalBonifico}
                    onClose={() => setModal(null)}
                    onAggiornaStato={aggiornaStato}
                />
            )}

            <div className="space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Bonifici</h1>
                    <p className="text-sm text-muted-foreground">Gestione richieste di pagamento tramite bonifico bancario</p>
                </div>

                {/* Workflow info */}
                <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    <Landmark className="w-4 h-4 flex-shrink-0" />
                    <span>Flusso: il cliente sceglie bonifico → riceve i dati bancari → carica la ricevuta → CRIA verifica → attiva il prodotto</span>
                </div>

                {/* Contatori */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatBox label="In attesa ricevuta" value={contatori.attesa} icon={Clock} color="bg-yellow-500" />
                    <StatBox label="Ricevuta caricata" value={contatori.caricati} icon={Upload} color="bg-blue-500" />
                    <StatBox label="Da verificare" value={contatori.verificati} icon={Eye} color="bg-orange-500" />
                    <StatBox label="Attivati" value={contatori.attivati} icon={CheckCircle2} color="bg-green-500" />
                </div>

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cerca cliente o prodotto..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                            </div>
                            <Select value={filtroStato} onValueChange={setStato}>
                                <SelectTrigger className="w-48"><SelectValue placeholder="Stato" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti gli stati</SelectItem>
                                    <SelectItem value="in attesa ricevuta">In attesa ricevuta</SelectItem>
                                    <SelectItem value="ricevuta caricata">Ricevuta caricata</SelectItem>
                                    <SelectItem value="verificato">Verificato</SelectItem>
                                    <SelectItem value="attivato">Attivato</SelectItem>
                                    <SelectItem value="annullato">Annullato</SelectItem>
                                </SelectContent>
                            </Select>
                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStato('tutti'); }}>
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
                                        <Th label="Importo" field="importo" />
                                        <Th label="Ricevuta" field="ricevuta" />
                                        <Th label="Stato" field="stato" />
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Gestisci</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                                                Nessun bonifico trovato con i filtri selezionati.
                                            </td>
                                        </tr>
                                    ) : filtered.map((b) => {
                                        const conf = STATO_CONFIG[b.stato] || STATO_CONFIG['annullato'];
                                        const Icon = conf.icon;
                                        return (
                                            <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmt(b.data)}</td>
                                                <td className="px-4 py-3 font-medium text-foreground">{b.cliente}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{b.prodotto}</td>
                                                <td className="px-4 py-3 font-semibold tabular-nums text-foreground">{fmtEur(b.importo)}</td>
                                                <td className="px-4 py-3">
                                                    {b.ricevuta
                                                        ? <span className="flex items-center gap-1.5 text-green-700 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Caricata</span>
                                                        : <span className="flex items-center gap-1.5 text-muted-foreground text-xs"><Clock className="w-3.5 h-3.5" /> In attesa</span>
                                                    }
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${conf.badge}`}>
                                                        <Icon className="w-3 h-3" />
                                                        {b.stato}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1.5"
                                                        onClick={() => setModal(b)}
                                                    >
                                                        Gestisci
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {filtered.length > 0 && (
                            <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
                                {filtered.length === lista.length
                                    ? `${lista.length} bonifici totali`
                                    : `${filtered.length} di ${lista.length} bonifici`}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default BonificiPage;