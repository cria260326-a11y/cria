import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Users, Search, X, Eye, AlertTriangle, FileText,
    MessageSquare, Calendar, ChevronRight
} from 'lucide-react';

const CLIENTI = [
    { id: 1, nome: 'Marco Bianchi', ruolo: 'locatore', email: 'marco.bianchi@email.it', dataAssegnazione: '2026-02-10', stato: 'attivo', contestazioni: 1, documenti: 1, ticket: 0 },
    { id: 2, nome: 'Sofia Martini', ruolo: 'inquilino', email: 'sofia.martini@email.it', dataAssegnazione: '2026-03-15', stato: 'attivo', contestazioni: 1, documenti: 2, ticket: 1 },
    { id: 3, nome: 'Luca Romano', ruolo: 'inquilino', email: 'luca.romano@email.it', dataAssegnazione: '2026-03-20', stato: 'attivo', contestazioni: 0, documenti: 0, ticket: 1 },
    { id: 4, nome: 'Marco Esposito', ruolo: 'inquilino', email: 'marco.esposito@email.it', dataAssegnazione: '2026-04-28', stato: 'attivo', contestazioni: 2, documenti: 3, ticket: 0 },
    { id: 5, nome: 'Sara Conti', ruolo: 'locatore', email: 'sara.conti@email.it', dataAssegnazione: '2026-04-15', stato: 'attivo', contestazioni: 1, documenti: 0, ticket: 0 },
    { id: 6, nome: 'Elena Greco', ruolo: 'inquilino', email: 'elena.greco@email.it', dataAssegnazione: '2026-01-20', stato: 'chiuso', contestazioni: 0, documenti: 0, ticket: 0 },
    { id: 7, nome: 'Chiara Lombardi', ruolo: 'inquilino', email: 'chiara.lombardi@email.it', dataAssegnazione: '2026-04-30', stato: 'attivo', contestazioni: 1, documenti: 0, ticket: 0 },
    { id: 8, nome: 'Studio Conti', ruolo: 'agenzia', email: 'info@studioconti.it', dataAssegnazione: '2026-05-01', stato: 'attivo', contestazioni: 0, documenti: 1, ticket: 0 },
];

const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const RUOLO_BADGE = {
    locatore: 'bg-blue-100 text-blue-800',
    inquilino: 'bg-green-100 text-green-800',
    agenzia: 'bg-purple-100 text-purple-800',
};

const STATO_BADGE = {
    attivo: 'bg-green-100 text-green-800',
    chiuso: 'bg-gray-100 text-gray-600',
};

const ClientiAssegnatiPage = () => {
    const [search, setSearch] = useState('');
    const [filtroRuolo, setFRuolo] = useState('tutti');
    const [filtroStato, setFStato] = useState('attivo');

    const filtrati = useMemo(() => {
        let list = [...CLIENTI];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c => c.nome.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
        }
        if (filtroRuolo !== 'tutti') list = list.filter(c => c.ruolo === filtroRuolo);
        if (filtroStato !== 'tutti') list = list.filter(c => c.stato === filtroStato);
        return list.sort((a, b) => b.dataAssegnazione.localeCompare(a.dataAssegnazione));
    }, [search, filtroRuolo, filtroStato]);

    const contatori = useMemo(() => ({
        totali: CLIENTI.length,
        attivi: CLIENTI.filter(c => c.stato === 'attivo').length,
        locatori: CLIENTI.filter(c => c.ruolo === 'locatore' || c.ruolo === 'agenzia').length,
        inquilini: CLIENTI.filter(c => c.ruolo === 'inquilino').length,
    }), []);

    const hasFilters = search || filtroRuolo !== 'tutti' || filtroStato !== 'attivo';

    return (
        <>
            <Helmet><title>Clienti assegnati - CRIA Avvocato</title></Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Clienti assegnati</h1>
                    <p className="text-sm text-muted-foreground">Tutti i clienti che CRIA ti ha assegnato</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Totali', value: contatori.totali, color: 'bg-blue-500' },
                        { label: 'Attivi', value: contatori.attivi, color: 'bg-green-500' },
                        { label: 'locatori', value: contatori.locatori, color: 'bg-purple-500' },
                        { label: 'Inquilini', value: contatori.inquilini, color: 'bg-amber-500' },
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

                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca per nome o email..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }} />
                            </div>
                            <select value={filtroRuolo} onChange={e => setFRuolo(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti i ruoli</option>
                                <option value="locatore">locatori</option>
                                <option value="inquilino">Inquilini</option>
                                <option value="agenzia">Agenzie</option>
                            </select>
                            <select value={filtroStato} onChange={e => setFStato(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti</option>
                                <option value="attivo">Solo attivi</option>
                                <option value="chiuso">Chiusi</option>
                            </select>
                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFRuolo('tutti'); setFStato('attivo'); }}>
                                    <X className="w-3.5 h-3.5 mr-1" /> Azzera
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        {filtrati.length === 0 ? (
                            <div className="py-16 text-center">
                                <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Nessun cliente trovato</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Ruolo</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Assegnato il</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Pendenze</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtrati.map(c => (
                                        <tr key={c.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-foreground">{c.nome}</p>
                                                <p className="text-xs text-muted-foreground">{c.email}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RUOLO_BADGE[c.ruolo]}`}>
                                                    {c.ruolo}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmtData(c.dataAssegnazione)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2 flex-wrap">
                                                    {c.contestazioni > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-red-50 text-red-700">
                                                            <AlertTriangle className="w-3 h-3" /> {c.contestazioni}
                                                        </span>
                                                    )}
                                                    {c.documenti > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                                                            <FileText className="w-3 h-3" /> {c.documenti}
                                                        </span>
                                                    )}
                                                    {c.ticket > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-purple-50 text-purple-700">
                                                            <MessageSquare className="w-3 h-3" /> {c.ticket}
                                                        </span>
                                                    )}
                                                    {c.contestazioni === 0 && c.documenti === 0 && c.ticket === 0 && (
                                                        <span className="text-xs text-muted-foreground/60">—</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATO_BADGE[c.stato]}`}>
                                                    {c.stato}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link to={`/dashboard/avvocato/clienti/${c.id}`}>
                                                    <Button variant="ghost" size="sm" className="gap-1">
                                                        Apri <ChevronRight className="w-3.5 h-3.5" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default ClientiAssegnatiPage;