import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
    Users, UserCog, Briefcase, Scale,
    Plus, Search, ChevronUp, ChevronDown,
    X, Eye, EyeOff, Zap, ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

// ─── Dati mock ─────────────────────────────────────────────────────────────────
const COLLABORATORI = [
    { id: 1, nome: 'Giulia', cognome: 'Rossi', email: 'giulia.rossi@cria.it', telefono: '+39 333 1111001', ruolo: 'manager', stato: 'attivo', createdAt: '2026-01-10', codiceReferente: null },
    { id: 2, nome: 'Andrea', cognome: 'Marino', email: 'andrea.marino@cria.it', telefono: '+39 333 1111002', ruolo: 'manager', stato: 'attivo', createdAt: '2026-01-15', codiceReferente: null },
    { id: 3, nome: 'Federica', cognome: 'Bruno', email: 'federica.bruno@cria.it', telefono: '+39 333 1111003', ruolo: 'manager', stato: 'sospeso', createdAt: '2026-02-01', codiceReferente: null },
    { id: 4, nome: 'Luca', cognome: 'Verdi', email: 'luca.verdi@cria.it', telefono: '+39 347 2222001', ruolo: 'commerciale', stato: 'attivo', createdAt: '2026-01-20', codiceReferente: 'REF-001' },
    { id: 5, nome: 'Sara', cognome: 'Galli', email: 'sara.galli@cria.it', telefono: '+39 347 2222002', ruolo: 'commerciale', stato: 'attivo', createdAt: '2026-02-05', codiceReferente: 'REF-002' },
    { id: 6, nome: 'Marco', cognome: 'Fontana', email: 'marco.fontana@cria.it', telefono: '+39 347 2222003', ruolo: 'commerciale', stato: 'attivo', createdAt: '2026-02-10', codiceReferente: 'REF-003' },
    { id: 7, nome: 'Elena', cognome: 'Mazza', email: 'elena.mazza@cria.it', telefono: '+39 347 2222004', ruolo: 'commerciale', stato: 'sospeso', createdAt: '2026-03-01', codiceReferente: 'REF-004' },
    { id: 8, nome: 'Avv. Paolo', cognome: 'Conti', email: 'p.conti@studioconti.it', telefono: '+39 320 3333001', ruolo: 'avvocato', stato: 'attivo', createdAt: '2026-01-12', codiceReferente: null },
    { id: 9, nome: 'Avv. Maria', cognome: 'Romano', email: 'm.romano@studioromano.it', telefono: '+39 320 3333002', ruolo: 'avvocato', stato: 'attivo', createdAt: '2026-02-20', codiceReferente: null },
    { id: 10, nome: 'Avv. Carlo', cognome: 'Ferrara', email: 'c.ferrara@ferrara-law.it', telefono: '+39 320 3333003', ruolo: 'avvocato', stato: 'attivo', createdAt: '2026-03-15', codiceReferente: null },
];

const fmt = (d) => new Date(d).toLocaleDateString('it-IT');

const STATO_BADGE = {
    'attivo': 'bg-green-100 text-green-800',
    'sospeso': 'bg-red-100 text-red-800',
};

const TAB_CONFIG = [
    { key: 'manager', label: 'Manager', icon: UserCog },
    { key: 'commerciale', label: 'Commerciali', icon: Briefcase },
    { key: 'avvocato', label: 'Avvocati', icon: Scale },
];

// ─── Modal nuovo collaboratore ────────────────────────────────────────────────
const ModalNuovoCollaboratore = ({ onClose }) => {
    const [form, setForm] = useState({
        nome: '', cognome: '', email: '', password: '',
        ruolo: 'manager', codiceReferente: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = () => {
        if (!form.nome || !form.cognome || !form.email || !form.password || !form.ruolo) {
            toast.error('Compila tutti i campi obbligatori');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success(`Accesso creato per ${form.nome} ${form.cognome} — Edge Function eseguita`);
            onClose();
        }, 1200);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Nuovo collaboratore</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Zap className="w-3 h-3 text-yellow-500" /> Azione eseguita via Edge Function
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="nome">Nome <span className="text-red-500">*</span></Label>
                            <Input id="nome" value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Mario" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="cognome">Cognome <span className="text-red-500">*</span></Label>
                            <Input id="cognome" value={form.cognome} onChange={e => set('cognome', e.target.value)} placeholder="Rossi" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                        <Input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="mario.rossi@cria.it" />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={e => set('password', e.target.value)}
                                placeholder="••••••••"
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(s => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Ruolo <span className="text-red-500">*</span></Label>
                        <Select value={form.ruolo} onValueChange={v => set('ruolo', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="commerciale">Commerciale</SelectItem>
                                <SelectItem value="avvocato">Avvocato</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {form.ruolo === 'commerciale' && (
                        <div className="space-y-1.5">
                            <Label htmlFor="codice">Codice referente</Label>
                            <Input
                                id="codice"
                                value={form.codiceReferente}
                                onChange={e => set('codiceReferente', e.target.value)}
                                placeholder="Es. REF-005"
                            />
                            <p className="text-xs text-muted-foreground">Il codice viene usato dai locatori per collegarsi al commerciale in fase di registrazione.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 justify-end px-6 py-4 border-t border-border">
                    <Button variant="outline" onClick={onClose}>Annulla</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="gap-2 min-w-32">
                        {loading ? (
                            <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Creazione...</>
                        ) : (
                            <><Zap className="w-4 h-4" /> Crea accesso</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ─── Tabella collaboratori ─────────────────────────────────────────────────────
const TabellaCollaboratori = ({ dati, ruolo }) => {
    const [search, setSearch] = useState('');
    const [filtroStato, setStato] = useState('tutti');
    const [sortField, setSortField] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const [lista, setLista] = useState(dati);

    const filtered = useMemo(() => {
        let list = [...lista];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.nome.toLowerCase().includes(q) ||
                c.cognome.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q)
            );
        }
        if (filtroStato !== 'tutti') list = list.filter(c => c.stato === filtroStato);
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
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Cerca nome o email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>
                <Select value={filtroStato} onValueChange={setStato}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Stato" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="tutti">Tutti</SelectItem>
                        <SelectItem value="attivo">Attivi</SelectItem>
                        <SelectItem value="sospeso">Sospesi</SelectItem>
                    </SelectContent>
                </Select>
                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStato('tutti'); }}>
                        Azzera filtri
                    </Button>
                )}
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/40">
                        <tr>
                            <Th label="Nome" field="nome" />
                            <Th label="Cognome" field="cognome" />
                            <Th label="Email" field="email" />
                            <Th label="Telefono" field="telefono" />
                            {ruolo === 'commerciale' && <Th label="Codice referente" field="codiceReferente" />}
                            <Th label="Creato il" field="createdAt" />
                            <Th label="Stato" field="stato" />
                            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={ruolo === 'commerciale' ? 8 : 7} className="px-4 py-12 text-center text-muted-foreground">
                                    Nessun collaboratore trovato.
                                </td>
                            </tr>
                        ) : filtered.map((c) => (
                            <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-medium text-foreground">{c.nome}</td>
                                <td className="px-4 py-3 text-foreground">{c.cognome}</td>
                                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                                <td className="px-4 py-3 text-muted-foreground tabular-nums">{c.telefono}</td>
                                {ruolo === 'commerciale' && (
                                    <td className="px-4 py-3">
                                        {c.codiceReferente
                                            ? <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{c.codiceReferente}</span>
                                            : <span className="text-muted-foreground">—</span>}
                                    </td>
                                )}
                                <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmt(c.createdAt)}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_BADGE[c.stato]}`}>
                                        {c.stato}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link to={`/dashboard/admin/collaboratori/${c.id}`}>
                                        <Button variant="ghost" size="sm" className="gap-1.5">
                                            Apri <ArrowUpRight className="w-3.5 h-3.5" />
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length > 0 && (
                    <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
                        {filtered.length === lista.length ? `${lista.length} collaboratori` : `${filtered.length} di ${lista.length}`}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const CollaboratoriPage = () => {
    const [tab, setTab] = useState('manager');
    const [showModal, setModal] = useState(false);

    const contatori = useMemo(() => ({
        totale: COLLABORATORI.filter(c => c.stato === 'attivo').length,
        manager: COLLABORATORI.filter(c => c.ruolo === 'manager' && c.stato === 'attivo').length,
        commerciali: COLLABORATORI.filter(c => c.ruolo === 'commerciale' && c.stato === 'attivo').length,
        avvocati: COLLABORATORI.filter(c => c.ruolo === 'avvocato' && c.stato === 'attivo').length,
    }), []);

    const datiTab = useMemo(() =>
        COLLABORATORI.filter(c => c.ruolo === tab),
        [tab]
    );

    return (
        <>
            <Helmet><title>Collaboratori - CRIA Admin</title></Helmet>

            {showModal && <ModalNuovoCollaboratore onClose={() => setModal(false)} />}

            <div className="space-y-6">

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Collaboratori</h1>
                        <p className="text-sm text-muted-foreground">Gestione manager, commerciali e avvocati della piattaforma</p>
                    </div>
                    <Button onClick={() => setModal(true)} className="gap-2 flex-shrink-0">
                        <Plus className="w-4 h-4" /> Nuovo collaboratore
                    </Button>
                </div>

                {/* Contatori */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Totale attivi', value: contatori.totale, icon: Users, color: 'bg-blue-500' },
                        { label: 'Manager attivi', value: contatori.manager, icon: UserCog, color: 'bg-purple-500' },
                        { label: 'Commerciali attivi', value: contatori.commerciali, icon: Briefcase, color: 'bg-green-500' },
                        { label: 'Avvocati attivi', value: contatori.avvocati, icon: Scale, color: 'bg-amber-500' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <Card key={label}>
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
                    ))}
                </div>

                {/* Tab + tabella */}
                <Card>
                    <div className="border-b border-border px-6">
                        <div className="flex gap-1">
                            {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
                                <button key={key} onClick={() => setTab(key)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key
                                        ? 'border-primary text-foreground'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}>
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <CardContent className="pt-5">
                        <TabellaCollaboratori dati={datiTab} ruolo={tab} />
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default CollaboratoriPage;