import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpRight, ChevronUp, ChevronDown } from 'lucide-react';

// ─── Dati mock ─────────────────────────────────────────────────────────────────
// NOTA: il campo `contratto` rappresenta il prodotto acquistato.
//   1 = CRIA Gestione (P1)
//   2 = CRIA Completo (P2)
//   3 = CRIA Verifica  (P3)
//   4 = Consulenza     (P4)  — add-on acquistabile, trasforma user → cliente
//   null = nessun acquisto (utente registrato ma non convertito)
const CLIENTI = [
    { id: 1, nome: 'Marco', cognome: 'Bianchi', email: 'marco.bianchi@email.it', telefono: '+39 333 1234567', ruolo: 'locatore', tipoAccount: 'privato', contratto: 1, createdAt: '2026-03-15', reputazione: null },
    { id: 2, nome: 'Sara', cognome: 'Conti', email: 'sara.conti@email.it', telefono: '+39 347 2345678', ruolo: 'locatore', tipoAccount: 'agenzia', contratto: 2, createdAt: '2026-03-18', reputazione: null },
    { id: 3, nome: 'Luca', cognome: 'Ferrari', email: 'luca.ferrari@email.it', telefono: '+39 320 3456789', ruolo: 'user', tipoAccount: null, contratto: null, createdAt: '2026-02-10', reputazione: null },
    { id: 4, nome: 'Giulia', cognome: 'Neri', email: 'giulia.neri@email.it', telefono: '+39 366 4567890', ruolo: 'cliente', tipoAccount: null, contratto: 3, createdAt: '2026-03-22', reputazione: null },
    { id: 5, nome: 'Roberto', cognome: 'Fabbri', email: 'roberto.fabbri@email.it', telefono: '+39 389 5678901', ruolo: 'locatore', contratto: 2, createdAt: '2026-01-08', reputazione: null },
    { id: 6, nome: 'Chiara', cognome: 'Lombardi', email: 'chiara.lombardi@email.it', telefono: '+39 331 6789012', ruolo: 'inquilino', tipoAccount: null, contratto: 1, createdAt: '2026-02-28', reputazione: 'verde' },
    { id: 7, nome: 'Davide', cognome: 'Ricci', email: 'davide.ricci@email.it', telefono: '+39 348 7890123', ruolo: 'inquilino', tipoAccount: null, contratto: 1, createdAt: '2026-03-01', reputazione: 'giallo' },
    { id: 8, nome: 'Elena', cognome: 'Vitali', email: 'elena.vitali@email.it', telefono: '+39 371 8901234', ruolo: 'inquilino', tipoAccount: null, contratto: 2, createdAt: '2026-03-30', reputazione: 'verde' },
    { id: 9, nome: 'Fabio', cognome: 'Colombo', email: 'fabio.colombo@email.it', telefono: '+39 329 9012345', ruolo: 'inquilino', tipoAccount: null, contratto: 1, createdAt: '2026-01-20', reputazione: 'rosso' },
    { id: 10, nome: 'Alessia', cognome: 'Moretti', email: 'alessia.moretti@email.it', telefono: '+39 340 0123456', ruolo: 'locatore', tipoAccount: 'agenzia', contratto: 2, createdAt: '2026-02-14', reputazione: null },
    { id: 11, nome: 'Paolo', cognome: 'Gallo', email: 'paolo.gallo@email.it', telefono: '+39 355 1234560', ruolo: 'cliente', tipoAccount: null, contratto: 3, createdAt: '2026-03-05', reputazione: null },
    { id: 12, nome: 'Anna', cognome: 'Russo', email: 'anna.russo@email.it', telefono: '+39 362 2345671', ruolo: 'inquilino', tipoAccount: null, contratto: 1, createdAt: '2026-03-12', reputazione: 'verde' },
    { id: 13, nome: 'Giorgio', cognome: 'Esposito', email: 'giorgio.esposito@email.it', telefono: '+39 333 3456782', ruolo: 'locatore', tipoAccount: 'agenzia', contratto: 2, createdAt: '2026-02-05', reputazione: null },
    { id: 14, nome: 'Marta', cognome: 'Greco', email: 'marta.greco@email.it', telefono: '+39 347 4567893', ruolo: 'inquilino', tipoAccount: null, contratto: 1, createdAt: '2026-01-15', reputazione: 'giallo' },
    { id: 15, nome: 'Stefano', cognome: 'Bruno', email: 'stefano.bruno@email.it', telefono: '+39 320 5678904', ruolo: 'user', tipoAccount: null, contratto: null, createdAt: '2026-03-28', reputazione: null },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
// Badge prodotto: 4 prodotti (P1, P2, P3, P4)
const CONTRATTO_BADGE = {
    1: { class: 'bg-blue-100 text-blue-800', label: 'P1' },
    2: { class: 'bg-purple-100 text-purple-800', label: 'P2' },
    3: { class: 'bg-amber-100 text-amber-800', label: 'P3' },
    4: { class: 'bg-rose-100 text-rose-800', label: 'P4' },
};

const RUOLO_BADGE = {
    user: 'bg-gray-100 text-gray-600',         // neutro: registrato ma non convertito
    locatore: 'bg-blue-100 text-blue-800',
    inquilino: 'bg-green-100 text-green-800',
    cliente: 'bg-amber-100 text-amber-800',
};

const REP_CONFIG = {
    verde: { badge: 'bg-green-100 text-green-800', label: 'Regolare' },
    giallo: { badge: 'bg-yellow-100 text-yellow-800', label: 'In ritardo' },
    rosso: { badge: 'bg-red-100 text-red-800', label: 'Irregolare' },
};

const fmt = (d) => new Date(d).toLocaleDateString('it-IT');

const StatBox = ({ label, value, color }) => (
    <Card>
        <CardContent className="pt-5 pb-4">
            <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </CardContent>
    </Card>
);

// ─── Componente ────────────────────────────────────────────────────────────────
const ClientiPage = () => {
    const [search, setSearch] = useState('');
    const [filtroRuolo, setRuolo] = useState('tutti');
    const [filtroContratto, setFiltro] = useState('tutti');
    const [dataDa, setDa] = useState('');
    const [dataA, setA] = useState('');
    const [sortField, setSortField] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');

    const contatori = useMemo(() => ({
        totale: CLIENTI.length,
        users: CLIENTI.filter(c => c.ruolo === 'user').length,
        locatori: CLIENTI.filter(c => c.ruolo === 'locatore').length,
        inquilini: CLIENTI.filter(c => c.ruolo === 'inquilino').length,
        clienti: CLIENTI.filter(c => c.ruolo === 'cliente').length,
    }), []);

    const filtered = useMemo(() => {
        let list = [...CLIENTI];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.nome.toLowerCase().includes(q) ||
                c.cognome.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q)
            );
        }
        if (filtroRuolo !== 'tutti') list = list.filter(c => c.ruolo === filtroRuolo);
        if (filtroContratto !== 'tutti') {
            if (filtroContratto === 'nessuno') {
                list = list.filter(c => c.contratto === null);
            } else {
                list = list.filter(c => c.contratto === Number(filtroContratto));
            }
        }
        if (dataDa) list = list.filter(c => c.createdAt >= dataDa);
        if (dataA) list = list.filter(c => c.createdAt <= dataA);
        list.sort((a, b) => {
            let va = a[sortField], vb = b[sortField];
            // null a fondo
            if (va === null) return 1;
            if (vb === null) return -1;
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [search, filtroRuolo, filtroContratto, dataDa, dataA, sortField, sortDir]);

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

    const hasFilters = search || filtroRuolo !== 'tutti' || filtroContratto !== 'tutti' || dataDa || dataA;

    return (
        <>
            <Helmet><title>Utenti - CRIA Admin</title></Helmet>
            <div className="space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Utenti</h1>
                    <p className="text-sm text-muted-foreground">Lista di tutti gli utenti registrati sulla piattaforma</p>
                </div>

                {/* Contatori */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatBox label="Totale utenti" value={contatori.totale} color="text-foreground" />
                    <StatBox label="User (non convertiti)" value={contatori.users} color="text-gray-600" />
                    <StatBox label="locatori" value={contatori.locatori} color="text-blue-600" />
                    <StatBox label="Inquilini" value={contatori.inquilini} color="text-green-600" />
                    <StatBox label="Clienti" value={contatori.clienti} color="text-amber-600" />
                </div>

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-end">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca nome o email..." value={search}
                                    onChange={e => setSearch(e.target.value)} className="pl-9" />
                            </div>
                            <Select value={filtroRuolo} onValueChange={setRuolo}>
                                <SelectTrigger className="w-36"><SelectValue placeholder="Ruolo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti i ruoli</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="locatore">locatore</SelectItem>
                                    <SelectItem value="inquilino">Inquilino</SelectItem>
                                    <SelectItem value="cliente">Cliente</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filtroContratto} onValueChange={setFiltro}>
                                <SelectTrigger className="w-44"><SelectValue placeholder="Prodotto" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti i prodotti</SelectItem>
                                    <SelectItem value="nessuno">Nessun acquisto</SelectItem>
                                    <SelectItem value="1">CRIA Gestione (P1)</SelectItem>
                                    <SelectItem value="2">CRIA Completo (P2)</SelectItem>
                                    <SelectItem value="3">CRIA Verifica (P3)</SelectItem>
                                    <SelectItem value="4">Consulenza (P4)</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground px-1">Dal</span>
                                <Input type="date" value={dataDa} onChange={e => setDa(e.target.value)} className="w-36" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground px-1">Al</span>
                                <Input type="date" value={dataA} onChange={e => setA(e.target.value)} className="w-36" />
                            </div>
                            {hasFilters && (
                                <Button variant="ghost" size="sm"
                                    onClick={() => { setSearch(''); setRuolo('tutti'); setFiltro('tutti'); setDa(''); setA(''); }}>
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
                                        <Th label="Data" field="createdAt" />
                                        <Th label="Nome" field="nome" />
                                        <Th label="Email" field="email" />
                                        <Th label="Telefono" field="telefono" />
                                        <Th label="Ruolo" field="ruolo" />
                                        <Th label="Prodotto" field="contratto" />
                                        <Th label="Reputazione" field="reputazione" />
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Scheda</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                                                Nessun utente trovato con i filtri selezionati.
                                            </td>
                                        </tr>
                                    ) : filtered.map((c) => (
                                        <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">{fmt(c.createdAt)}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-foreground">{c.nome} {c.cognome}</p>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">{c.telefono}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${RUOLO_BADGE[c.ruolo]}`}>
                                                        {c.ruolo}
                                                    </span>
                                                    {c.tipoAccount && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {c.tipoAccount}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {c.contratto ? (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CONTRATTO_BADGE[c.contratto].class}`}>
                                                        {CONTRATTO_BADGE[c.contratto].label}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {c.reputazione ? (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${REP_CONFIG[c.reputazione].badge}`}>
                                                        {REP_CONFIG[c.reputazione].label}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link to={`/dashboard/admin/clienti/${c.id}`}>
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
                                {filtered.length === CLIENTI.length
                                    ? `${CLIENTI.length} utenti totali`
                                    : `${filtered.length} di ${CLIENTI.length} utenti`}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default ClientiPage;