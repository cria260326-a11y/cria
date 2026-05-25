import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/StatusBadge.jsx';
import {
    Home, Search, Filter, Plus, Eye, MapPin, User,
    Euro, Calendar, X, ChevronRight, AlertTriangle,
    LayoutGrid, List
} from 'lucide-react';

// ─── Mock immobili ─────────────────────────────────────────────────────────────
const IMMOBILI = [
    { id: 1, address: 'Via Roma 42', city: 'Milano', cap: '20100', tenant: 'Sofia Martini', monthlyRent: 1200, prodotto: 1, ruolo: 'proprietario', status: 'verde', endDate: '2026-12-31', contestazioni: 0, segnalazioneCorrente: null },
    { id: 2, address: 'Corso Venezia 18', city: 'Milano', cap: '20121', tenant: 'Luca Romano', monthlyRent: 950, prodotto: 1, ruolo: 'proprietario', status: 'giallo', endDate: '2027-01-31', contestazioni: 1, segnalazioneCorrente: null },
    { id: 3, address: 'Via Dante 7', city: 'Roma', cap: '00184', tenant: 'Elena Greco', monthlyRent: 1450, prodotto: 2, ruolo: 'proprietario', status: 'verde', endDate: '2027-01-14', contestazioni: 0, segnalazioneCorrente: null },
    { id: 4, address: 'Piazza Navona 23', city: 'Roma', cap: '00186', tenant: 'Marco Esposito', monthlyRent: 1100, prodotto: 2, ruolo: 'gestore', status: 'rosso', endDate: '2027-02-28', contestazioni: 2, segnalazioneCorrente: null },
    { id: 5, address: 'Via Garibaldi 56', city: 'Torino', cap: '10122', tenant: 'Chiara Lombardi', monthlyRent: 850, prodotto: 1, ruolo: 'proprietario', status: 'rosso', endDate: '2026-12-31', contestazioni: 0, segnalazioneCorrente: 'pagato' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;
const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const PRODOTTO_LABEL = { 1: 'CRIA Gestione', 2: 'CRIA Completo' };
const PRODOTTO_BADGE = { 1: 'bg-blue-100 text-blue-800', 2: 'bg-purple-100 text-purple-800' };

// ─── Card immobile ─────────────────────────────────────────────────────────────
const ImmobileCard = ({ im }) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-5 pb-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{im.address}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {im.cap} {im.city}
                    </p>
                </div>
                <StatusBadge status={im.status} />
            </div>

            <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_BADGE[im.prodotto]}`}>
                    {PRODOTTO_LABEL[im.prodotto]}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                    {im.ruolo}
                </span>
                {im.contestazioni > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <AlertTriangle className="w-3 h-3" /> {im.contestazioni}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Inquilino</p>
                        <p className="text-sm font-medium text-foreground truncate">{im.tenant}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                        <p className="text-xs text-muted-foreground">Canone</p>
                        <p className="text-sm font-medium text-foreground">{fmtEur(im.monthlyRent)}/mese</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                    <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                        <p className="text-xs text-muted-foreground">Scadenza contratto</p>
                        <p className="text-sm font-medium text-foreground">{fmtData(im.endDate)}</p>
                    </div>
                </div>
            </div>

            <Link to={`/dashboard/locatore/immobili/${im.id}`}>
                <Button variant="outline" size="sm" className="w-full gap-2">
                    <Eye className="w-3.5 h-3.5" /> Apri scheda
                </Button>
            </Link>
        </CardContent>
    </Card>
);

// ─── Riga immobile (vista tabella) ─────────────────────────────────────────────
const ImmobileRow = ({ im }) => (
    <tr className="hover:bg-muted/30">
        <td className="px-4 py-3">
            <p className="font-medium text-foreground text-sm">{im.address}</p>
            <p className="text-xs text-muted-foreground">{im.cap} {im.city}</p>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{im.tenant}</td>
        <td className="px-4 py-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_BADGE[im.prodotto]}`}>
                {PRODOTTO_LABEL[im.prodotto]}
            </span>
        </td>
        <td className="px-4 py-3 text-sm text-foreground tabular-nums">{fmtEur(im.monthlyRent)}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">{fmtData(im.endDate)}</td>
        <td className="px-4 py-3"><StatusBadge status={im.status} /></td>
        <td className="px-4 py-3 text-right">
            <Link to={`/dashboard/locatore/immobili/${im.id}`}>
                <Button variant="ghost" size="sm" className="gap-1">
                    Apri <ChevronRight className="w-3.5 h-3.5" />
                </Button>
            </Link>
        </td>
    </tr>
);

// ─── Componente principale ────────────────────────────────────────────────────
const ImmobiliPage = () => {
    const [search, setSearch] = useState('');
    const [filtroStatus, setFStatus] = useState('tutti');
    const [filtroProdotto, setFProdotto] = useState('tutti');
    const [vista, setVista] = useState('grid');

    const contatori = useMemo(() => ({
        totali: IMMOBILI.length,
        p1: IMMOBILI.filter(i => i.prodotto === 1).length,
        p2: IMMOBILI.filter(i => i.prodotto === 2).length,
        rossi: IMMOBILI.filter(i => i.status === 'rosso').length,
    }), []);

    const filtrati = useMemo(() => {
        let list = [...IMMOBILI];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(i =>
                i.address.toLowerCase().includes(q) ||
                i.city.toLowerCase().includes(q) ||
                i.tenant.toLowerCase().includes(q)
            );
        }
        if (filtroStatus !== 'tutti') list = list.filter(i => i.status === filtroStatus);
        if (filtroProdotto !== 'tutti') list = list.filter(i => i.prodotto === Number(filtroProdotto));
        return list;
    }, [search, filtroStatus, filtroProdotto]);

    const hasFilters = search || filtroStatus !== 'tutti' || filtroProdotto !== 'tutti';

    return (
        <>
            <Helmet><title>I miei immobili - CRIA</title></Helmet>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Intestazione */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">I miei immobili</h1>
                        <p className="text-sm text-muted-foreground">Gestisci tutti i tuoi immobili in un unico posto</p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" /> Aggiungi immobile
                    </Button>
                </div>

                {/* Contatori */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Totali', value: contatori.totali, color: 'bg-blue-500' },
                        { label: 'CRIA Gestione', value: contatori.p1, color: 'bg-blue-600' },
                        { label: 'CRIA Completo', value: contatori.p2, color: 'bg-purple-500' },
                        { label: 'In stato rosso', value: contatori.rossi, color: 'bg-red-500' },
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

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca indirizzo, città o inquilino..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }} />
                            </div>

                            <select value={filtroStatus} onChange={e => setFStatus(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti gli stati</option>
                                <option value="verde">Regolari</option>
                                <option value="giallo">In ritardo</option>
                                <option value="rosso">Irregolari</option>
                            </select>

                            <select value={filtroProdotto} onChange={e => setFProdotto(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti i prodotti</option>
                                <option value="1">CRIA Gestione</option>
                                <option value="2">CRIA Completo</option>
                            </select>

                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFStatus('tutti'); setFProdotto('tutti'); }}>
                                    <X className="w-3.5 h-3.5 mr-1" /> Azzera
                                </Button>
                            )}

                            <div className="ml-auto flex gap-1 p-1 bg-muted rounded-lg">
                                <button onClick={() => setVista('grid')}
                                    className={`p-1.5 rounded ${vista === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button onClick={() => setVista('list')}
                                    className={`p-1.5 rounded ${vista === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Risultati */}
                {filtrati.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Home className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Nessun immobile trovato</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">Prova a rimuovere alcuni filtri</p>
                        </CardContent>
                    </Card>
                ) : vista === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtrati.map(im => <ImmobileCard key={im.id} im={im} />)}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Immobile</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Inquilino</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Prodotto</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Canone</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Scadenza</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtrati.map(im => <ImmobileRow key={im.id} im={im} />)}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

            </div>
        </>
    );
};

export default ImmobiliPage;