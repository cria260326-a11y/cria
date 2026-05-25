import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    CheckSquare, FileText, MessageSquare, Scale, Search,
    X, Filter, AlertTriangle, Clock, ArrowRight, User
} from 'lucide-react';

// ─── Mock coda lavoro ──────────────────────────────────────────────────────────
const TASK_INIZIALI = [
    { id: 1, tipo: 'documento', titolo: 'Ricevuta bonifico Marzo.pdf', cliente: 'Sofia Martini', clienteId: 2, dataAssegnazione: '2026-04-29', priorita: 'alta', note: 'Verificare autenticità ricevuta' },
    { id: 2, tipo: 'documento', titolo: 'Estratto conto Aprile.pdf', cliente: 'Marco Esposito', clienteId: 4, dataAssegnazione: '2026-05-01', priorita: 'alta', note: 'Documento per contestazione attiva' },
    { id: 3, tipo: 'documento', titolo: 'Visura camerale.pdf', cliente: 'Studio Conti', clienteId: 8, dataAssegnazione: '2026-05-02', priorita: 'media', note: 'Verifica validità' },
    { id: 4, tipo: 'ticket', titolo: 'Domanda su clausola contratto', cliente: 'Sofia Martini', clienteId: 2, dataAssegnazione: '2026-05-03', priorita: 'alta', note: 'Cliente in attesa da 2 giorni' },
    { id: 5, tipo: 'ticket', titolo: 'Richiesta chiarimento su contestazione', cliente: 'Luca Romano', clienteId: 3, dataAssegnazione: '2026-05-02', priorita: 'media', note: '' },
    { id: 6, tipo: 'contestazione', titolo: 'Contestazione #2 — Pagamento contestato', cliente: 'Marco Esposito', clienteId: 4, dataAssegnazione: '2026-04-30', priorita: 'alta', note: 'In verifica documenti' },
    { id: 7, tipo: 'contestazione', titolo: 'Contestazione #5 — Mancato pagamento', cliente: 'Chiara Lombardi', clienteId: 7, dataAssegnazione: '2026-05-01', priorita: 'media', note: 'Aperta dal locatore' },
    { id: 8, tipo: 'documento', titolo: 'Atto di proprietà.pdf', cliente: 'Marco Bianchi', clienteId: 1, dataAssegnazione: '2026-05-03', priorita: 'bassa', note: '' },
];

const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const TIPO_CONFIG = {
    documento: { label: 'Documento', icon: FileText, bg: 'bg-blue-50 border-blue-200', color: 'text-blue-700' },
    ticket: { label: 'Ticket', icon: MessageSquare, bg: 'bg-purple-50 border-purple-200', color: 'text-purple-700' },
    contestazione: { label: 'Contestazione', icon: Scale, bg: 'bg-red-50 border-red-200', color: 'text-red-700' },
};

const PRIORITA_COLOR = {
    alta: 'bg-red-100 text-red-700',
    media: 'bg-yellow-100 text-yellow-700',
    bassa: 'bg-gray-100 text-gray-600',
};

const CodaLavoroPage = () => {
    const [search, setSearch] = useState('');
    const [filtroTipo, setFTipo] = useState('tutti');
    const [filtroPriorita, setFPrio] = useState('tutte');

    const filtrati = useMemo(() => {
        let list = [...TASK_INIZIALI];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(t => t.titolo.toLowerCase().includes(q) || t.cliente.toLowerCase().includes(q));
        }
        if (filtroTipo !== 'tutti') list = list.filter(t => t.tipo === filtroTipo);
        if (filtroPriorita !== 'tutte') list = list.filter(t => t.priorita === filtroPriorita);
        // Sort: priorità (alta -> bassa) poi data
        const priorOrder = { alta: 0, media: 1, bassa: 2 };
        return list.sort((a, b) => priorOrder[a.priorita] - priorOrder[b.priorita] || a.dataAssegnazione.localeCompare(b.dataAssegnazione));
    }, [search, filtroTipo, filtroPriorita]);

    const contatori = useMemo(() => ({
        totali: TASK_INIZIALI.length,
        documenti: TASK_INIZIALI.filter(t => t.tipo === 'documento').length,
        ticket: TASK_INIZIALI.filter(t => t.tipo === 'ticket').length,
        contestazioni: TASK_INIZIALI.filter(t => t.tipo === 'contestazione').length,
        alta: TASK_INIZIALI.filter(t => t.priorita === 'alta').length,
    }), []);

    const hasFilters = search || filtroTipo !== 'tutti' || filtroPriorita !== 'tutte';

    return (
        <>
            <Helmet><title>Coda di lavoro - CRIA Avvocato</title></Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Coda di lavoro</h1>
                    <p className="text-sm text-muted-foreground">Tutto quello che richiede la tua azione, ordinato per priorità</p>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'In coda', value: contatori.totali, color: 'bg-blue-500' },
                        { label: 'Documenti', value: contatori.documenti, color: 'bg-blue-600' },
                        { label: 'Ticket', value: contatori.ticket, color: 'bg-purple-500' },
                        { label: 'Contestazioni', value: contatori.contestazioni, color: 'bg-red-500' },
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

                {/* Banner priorità alta */}
                {contatori.alta > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-800">
                            <p className="font-medium">{contatori.alta} {contatori.alta === 1 ? 'attività ad alta priorità' : 'attività ad alta priorità'}</p>
                            <p className="text-xs mt-0.5">Inizia da queste per rispettare le tempistiche di servizio.</p>
                        </div>
                    </div>
                )}

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca attività o cliente..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }} />
                            </div>
                            <select value={filtroTipo} onChange={e => setFTipo(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti i tipi</option>
                                <option value="documento">Documenti</option>
                                <option value="ticket">Ticket</option>
                                <option value="contestazione">Contestazioni</option>
                            </select>
                            <select value={filtroPriorita} onChange={e => setFPrio(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutte">Tutte le priorità</option>
                                <option value="alta">Alta</option>
                                <option value="media">Media</option>
                                <option value="bassa">Bassa</option>
                            </select>
                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFTipo('tutti'); setFPrio('tutte'); }}>
                                    <X className="w-3.5 h-3.5 mr-1" /> Azzera
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Lista task */}
                {filtrati.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <CheckSquare className="w-10 h-10 text-green-500 mx-auto mb-2" />
                            <p className="font-medium text-foreground">Tutto fatto!</p>
                            <p className="text-sm text-muted-foreground mt-1">Non ci sono attività in coda.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filtrati.map(t => {
                            const cfg = TIPO_CONFIG[t.tipo];
                            const Icon = cfg.icon;
                            return (
                                <Link key={t.id} to={`/dashboard/avvocato/clienti/${t.clienteId}`}>
                                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                        <CardContent className="py-4">
                                            <div className="flex items-start gap-4 flex-wrap">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${cfg.bg}`}>
                                                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                                                            {cfg.label}
                                                        </span>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITA_COLOR[t.priorita]}`}>
                                                            {t.priorita}
                                                        </span>
                                                    </div>
                                                    <p className="font-medium text-foreground truncate">{t.titolo}</p>
                                                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3" /> {t.cliente}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> Assegnato il {fmtData(t.dataAssegnazione)}
                                                        </span>
                                                    </div>
                                                    {t.note && <p className="text-xs text-muted-foreground italic mt-2">{t.note}</p>}
                                                </div>
                                                <Button variant="ghost" size="sm" className="gap-1 flex-shrink-0">
                                                    Apri <ArrowRight className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                )}

            </div>
        </>
    );
};

export default CodaLavoroPage;