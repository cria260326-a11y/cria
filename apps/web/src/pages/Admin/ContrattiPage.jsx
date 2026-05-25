import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpRight, ChevronUp, ChevronDown, Home, FileText, AlertTriangle, Clock, Euro } from 'lucide-react';
import MappaImmobili from '@/components/MappaImmobili.jsx';

// ─── Modello dati ──────────────────────────────────────────────────────────────
// Un IMMOBILE è registrato sulla piattaforma. Ha:
//   - prodotto: P1 | P2 | P3       (P3 = solo verifica, niente locazione gestita)
//   - prodotto_stato: 'attivo' | 'in_scadenza' | 'scaduto' | 'cancellato'
//   - contratto_stato: 'attivo' | 'in_scadenza' | 'vacante' | 'concluso' | 'sospeso'
//
// In tabella mostro entrambi gli stati separatamente per evitare ambiguità.
const CONTRATTI = [
    { id: 1, indirizzo: 'Via Roma 42', citta: 'Milano', locatore: 'Marco Bianchi', inquilino: 'Sofia Martini', prodotto: 1, prodottoStato: 'attivo', contrattoStato: 'attivo', scadenza: '2026-12-31', canone: '1.200' },
    { id: 2, indirizzo: 'Corso Venezia 18', citta: 'Milano', locatore: 'Marco Bianchi', inquilino: 'Luca Romano', prodotto: 2, prodottoStato: 'attivo', contrattoStato: 'attivo', scadenza: '2027-01-31', canone: '950' },
    { id: 3, indirizzo: 'Via Dante 7', citta: 'Roma', locatore: 'Sara Conti', inquilino: 'Elena Greco', prodotto: 1, prodottoStato: 'attivo', contrattoStato: 'attivo', scadenza: '2027-01-14', canone: '1.450' },
    { id: 4, indirizzo: 'Piazza Navona 23', citta: 'Roma', locatore: 'Sara Conti', inquilino: 'Marco Esposito', prodotto: 2, prodottoStato: 'attivo', contrattoStato: 'attivo', scadenza: '2027-02-28', canone: '1.100' },
    { id: 5, indirizzo: 'Via Garibaldi 56', citta: 'Torino', locatore: 'Luca Ferrari', inquilino: 'Chiara Lombardi', prodotto: 1, prodottoStato: 'attivo', contrattoStato: 'in_scadenza', scadenza: '2026-04-15', canone: '850' },
    { id: 6, indirizzo: 'Corso Re Umberto 5', citta: 'Torino', locatore: 'Luca Ferrari', inquilino: 'Giorgio Esposito', prodotto: 2, prodottoStato: 'attivo', contrattoStato: 'in_scadenza', scadenza: '2026-04-20', canone: '780' },
    { id: 7, indirizzo: 'Calle Larga 8', citta: 'Venezia', locatore: 'Giulia Neri', inquilino: 'Anna Russo', prodotto: 1, prodottoStato: 'attivo', contrattoStato: 'attivo', scadenza: '2026-11-30', canone: '1.300' },
    { id: 8, indirizzo: 'Viale Roma 18', citta: 'Rimini', locatore: 'Giulia Neri', inquilino: null, prodotto: 1, prodottoStato: 'attivo', contrattoStato: 'vacante', scadenza: null, canone: '700' },
    { id: 9, indirizzo: 'Via Carducci 7', citta: 'Trieste', locatore: 'Roberto Fabbri', inquilino: 'Paolo Gallo', prodotto: 2, prodottoStato: 'attivo', contrattoStato: 'attivo', scadenza: '2026-10-31', canone: '900' },
    { id: 10, indirizzo: 'Corso Palestro 11', citta: 'Brescia', locatore: 'Roberto Fabbri', inquilino: 'Elena Vitali', prodotto: 1, prodottoStato: 'attivo', contrattoStato: 'attivo', scadenza: '2026-09-30', canone: '820' },
    { id: 11, indirizzo: 'Via Libertà 4', citta: 'Monza', locatore: 'Alessia Moretti', inquilino: 'Fabio Colombo', prodotto: 1, prodottoStato: 'attivo', contrattoStato: 'attivo', scadenza: '2026-08-31', canone: '650' },
    { id: 12, indirizzo: 'Piazza Garibaldi 1', citta: 'Parma', locatore: 'Alessia Moretti', inquilino: null, prodotto: 1, prodottoStato: 'attivo', contrattoStato: 'vacante', scadenza: null, canone: '600' },
    { id: 13, indirizzo: 'Riviera Tito Livio 9', citta: 'Padova', locatore: 'Davide Ricci', inquilino: 'Marta Greco', prodotto: 2, prodottoStato: 'attivo', contrattoStato: 'in_scadenza', scadenza: '2026-04-25', canone: '880' },
    { id: 14, indirizzo: 'Via Indipendenza 22', citta: 'Bologna', locatore: 'Davide Ricci', inquilino: 'Stefano Bruno', prodotto: 1, prodottoStato: 'scaduto', contrattoStato: 'sospeso', scadenza: '2026-07-31', canone: '950' },
    { id: 15, indirizzo: 'Via Mazzini 3', citta: 'Verona', locatore: 'Paolo Gallo', inquilino: 'Davide Ricci', prodotto: 2, prodottoStato: 'attivo', contrattoStato: 'attivo', scadenza: '2026-12-31', canone: '1.050' },
    { id: 16, indirizzo: 'Via Manzoni 8', citta: 'Como', locatore: 'Marco Bianchi', inquilino: null, prodotto: 1, prodottoStato: 'attivo', contrattoStato: 'concluso', scadenza: '2026-02-28', canone: '850' },
];

// ─── Stati: definizioni ────────────────────────────────────────────────────────
const CONTRATTO_STATO = {
    'attivo': { label: 'Attivo', class: 'bg-green-100 text-green-800' },
    'in_scadenza': { label: 'In scadenza', class: 'bg-orange-100 text-orange-800' },
    'vacante': { label: 'Vacante', class: 'bg-gray-100 text-gray-600' },
    'concluso': { label: 'Concluso', class: 'bg-slate-100 text-slate-700' },
    'sospeso': { label: 'Sospeso', class: 'bg-red-100 text-red-800' },
};

const PRODOTTO_STATO = {
    'attivo': { label: 'Attivo', class: 'bg-green-100 text-green-800' },
    'in_scadenza': { label: 'In scadenza', class: 'bg-orange-100 text-orange-800' },
    'scaduto': { label: 'Scaduto', class: 'bg-red-100 text-red-800' },
    'cancellato': { label: 'Cancellato', class: 'bg-gray-100 text-gray-600' },
};

const PRODOTTO_BADGE = {
    1: { class: 'bg-blue-100 text-blue-800', label: 'P1' },
    2: { class: 'bg-purple-100 text-purple-800', label: 'P2' },
    3: { class: 'bg-amber-100 text-amber-800', label: 'P3' },
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('it-IT') : '—';

const StatBox = ({ label, value, icon: Icon, color }) => (
    <Card>
        <CardContent className="pt-5 pb-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${color} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
            </div>
        </CardContent>
    </Card>
);

// ═════════════════════════════════════════════════════════════════════════════
const ContrattiPage = () => {
    const [search, setSearch] = useState('');
    const [filtroProdotto, setProd] = useState('tutti');
    const [filtroContratto, setStatoContratto] = useState('tutti');
    const [filtroProdottoStato, setStatoProdotto] = useState('tutti');
    const [sortField, setSortField] = useState('scadenza');
    const [sortDir, setSortDir] = useState('asc');

    const contatori = useMemo(() => ({
        totale: CONTRATTI.length,
        attivi: CONTRATTI.filter(c => c.contrattoStato === 'attivo').length,
        inScadenza: CONTRATTI.filter(c => c.contrattoStato === 'in_scadenza').length,
        vacanti: CONTRATTI.filter(c => c.contrattoStato === 'vacante').length,
        sospesi: CONTRATTI.filter(c => c.contrattoStato === 'sospeso').length,
        totCanoni: CONTRATTI
            .filter(c => c.contrattoStato === 'attivo' || c.contrattoStato === 'in_scadenza')
            .reduce((sum, c) => sum + Number(c.canone.replace('.', '')), 0)
            .toLocaleString('it-IT'),
    }), []);

    const filtered = useMemo(() => {
        let list = [...CONTRATTI];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.indirizzo.toLowerCase().includes(q) ||
                c.citta.toLowerCase().includes(q) ||
                c.locatore.toLowerCase().includes(q) ||
                (c.inquilino && c.inquilino.toLowerCase().includes(q))
            );
        }
        if (filtroProdotto !== 'tutti') list = list.filter(c => c.prodotto === Number(filtroProdotto));
        if (filtroContratto !== 'tutti') list = list.filter(c => c.contrattoStato === filtroContratto);
        if (filtroProdottoStato !== 'tutti') list = list.filter(c => c.prodottoStato === filtroProdottoStato);

        list.sort((a, b) => {
            let va = a[sortField] ?? '', vb = b[sortField] ?? '';
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [search, filtroProdotto, filtroContratto, filtroProdottoStato, sortField, sortDir]);

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

    const hasFilters = search || filtroProdotto !== 'tutti' || filtroContratto !== 'tutti' || filtroProdottoStato !== 'tutti';

    return (
        <>
            <Helmet><title>Contratti e Immobili - CRIA Admin</title></Helmet>

            <div className="space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Contratti e Immobili</h1>
                    <p className="text-sm text-muted-foreground">Gestione di tutti i contratti e immobili sulla piattaforma</p>
                </div>

                {/* Contatori */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatBox label="Totale immobili" value={contatori.totale} icon={Home} color="bg-blue-500" />
                    <StatBox label="Contratti attivi" value={contatori.attivi} icon={FileText} color="bg-green-500" />
                    <StatBox label="Tot. canoni mensili" value={`€ ${contatori.totCanoni}`} icon={Euro} color="bg-green-500" />
                    <StatBox label="In scadenza (30gg)" value={contatori.inScadenza} icon={Clock} color="bg-orange-500" />
                    <StatBox label="Vacanti / Sospesi" value={`${contatori.vacanti} / ${contatori.sospesi}`} icon={AlertTriangle} color="bg-gray-500" />
                </div>

                {/* Mappa */}
                <Card>
                    <CardContent className="p-2">
                        <MappaImmobili />
                    </CardContent>
                </Card>

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cerca indirizzo, locatore o inquilino..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={filtroProdotto} onValueChange={setProd}>
                                <SelectTrigger className="w-40"><SelectValue placeholder="Prodotto" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti i prodotti</SelectItem>
                                    <SelectItem value="1">CRIA Gestione (P1)</SelectItem>
                                    <SelectItem value="2">CRIA Completo (P2)</SelectItem>
                                    <SelectItem value="3">CRIA Verifica (P3)</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filtroContratto} onValueChange={setStatoContratto}>
                                <SelectTrigger className="w-44"><SelectValue placeholder="Stato contratto" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti i contratti</SelectItem>
                                    <SelectItem value="attivo">Attivo</SelectItem>
                                    <SelectItem value="in_scadenza">In scadenza</SelectItem>
                                    <SelectItem value="vacante">Vacante</SelectItem>
                                    <SelectItem value="concluso">Concluso</SelectItem>
                                    <SelectItem value="sospeso">Sospeso</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filtroProdottoStato} onValueChange={setStatoProdotto}>
                                <SelectTrigger className="w-44"><SelectValue placeholder="Stato prodotto" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti i prodotti</SelectItem>
                                    <SelectItem value="attivo">Attivo</SelectItem>
                                    <SelectItem value="in_scadenza">In scadenza</SelectItem>
                                    <SelectItem value="scaduto">Scaduto</SelectItem>
                                    <SelectItem value="cancellato">Cancellato</SelectItem>
                                </SelectContent>
                            </Select>
                            {hasFilters && (
                                <Button variant="ghost" size="sm"
                                    onClick={() => { setSearch(''); setProd('tutti'); setStatoContratto('tutti'); setStatoProdotto('tutti'); }}>
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
                                        <Th label="Indirizzo" field="indirizzo" />
                                        <Th label="locatore" field="locatore" />
                                        <Th label="Inquilino" field="inquilino" />
                                        <Th label="Prodotto" field="prodotto" />
                                        <Th label="Stato contratto" field="contrattoStato" />
                                        <Th label="Stato prodotto" field="prodottoStato" />
                                        <Th label="Canone" field="canone" />
                                        <Th label="Scadenza" field="scadenza" />
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Scheda</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                                                Nessun risultato con i filtri selezionati.
                                            </td>
                                        </tr>
                                    ) : filtered.map((c) => (
                                        <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-foreground">{c.indirizzo}</p>
                                                <p className="text-xs text-muted-foreground">{c.citta}</p>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{c.locatore}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {c.inquilino || <span className="text-gray-400 italic">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_BADGE[c.prodotto].class}`}>
                                                    {PRODOTTO_BADGE[c.prodotto].label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CONTRATTO_STATO[c.contrattoStato].class}`}>
                                                    {CONTRATTO_STATO[c.contrattoStato].label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_STATO[c.prodottoStato].class}`}>
                                                    {PRODOTTO_STATO[c.prodottoStato].label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">€ {c.canone}/mese</td>
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">{fmt(c.scadenza)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link to={`/dashboard/admin/immobili/${c.id}`}>
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
                            <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
                                {filtered.length === CONTRATTI.length
                                    ? `${CONTRATTI.length} immobili totali`
                                    : `${filtered.length} di ${CONTRATTI.length} immobili`}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default ContrattiPage;