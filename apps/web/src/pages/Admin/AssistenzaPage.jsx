import React, { useState, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Search, MessageSquare, CheckCircle2, Clock,
    ChevronUp, ChevronDown, Send, Paperclip,
    X, ArrowLeft, Plus, User
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Dati mock ─────────────────────────────────────────────────────────────────
const TICKETS_INIZIALI = [
    {
        id: 1,
        titolo: 'Problema con segnalazione pagamento',
        descrizione: 'Ho segnalato il pagamento ma non risulta nel sistema.',
        mittente: { nome: 'Marco Bianchi', ruolo: 'locatore' },
        destinatario: 'CRIA',
        stato: 'aperto',
        data: '2026-04-01',
        messaggi: [
            { id: 1, autore: 'Marco Bianchi', ruolo: 'locatore', testo: 'Ho segnalato il pagamento di Aprile ma non risulta nel sistema. Come posso risolvere?', data: '01/04/2026 10:22', allegati: [] },
            { id: 2, autore: 'CRIA', ruolo: 'admin', testo: 'Buongiorno Marco, stiamo verificando. Le risponderemo entro 24 ore.', data: '01/04/2026 11:05', allegati: [] },
        ],
    },
    {
        id: 2,
        titolo: 'Richiesta documenti aggiuntivi',
        descrizione: 'Avvocato richiede visura catastale aggiornata.',
        mittente: { nome: 'Avv. Paolo Conti', ruolo: 'avvocato' },
        destinatario: 'Sara Conti',
        stato: 'aperto',
        data: '2026-04-02',
        messaggi: [
            { id: 1, autore: 'Avv. Paolo Conti', ruolo: 'avvocato', testo: 'Gentile Sara, per completare la pratica ho bisogno della visura catastale aggiornata (non oltre 3 mesi).', data: '02/04/2026 09:15', allegati: [] },
        ],
    },
    {
        id: 3,
        titolo: 'Contestazione mancato pagamento Marzo',
        descrizione: "L'inquilino contesta la segnalazione del locatore.",
        mittente: { nome: 'Sofia Martini', ruolo: 'inquilino' },
        destinatario: 'CRIA',
        stato: 'aperto',
        data: '2026-03-29',
        messaggi: [
            { id: 1, autore: 'Sofia Martini', ruolo: 'inquilino', testo: 'Ho effettuato il pagamento il 27 marzo. Allego la ricevuta del bonifico.', data: '29/03/2026 14:30', allegati: ['ricevuta_bonifico.pdf'] },
            { id: 2, autore: 'CRIA', ruolo: 'admin', testo: 'Grazie Sofia, abbiamo ricevuto la documentazione. Stiamo verificando con il locatore.', data: '29/03/2026 15:00', allegati: [] },
            { id: 3, autore: 'Marco Bianchi', ruolo: 'locatore', testo: 'Il pagamento non risulta sul mio conto. Sto controllando con la banca.', data: '30/03/2026 10:00', allegati: [] },
        ],
    },
    {
        id: 4,
        titolo: 'Chiarimenti contratto di locazione',
        descrizione: 'Richiesta chiarimenti su clausole contrattuali.',
        mittente: { nome: 'Luca Ferrari', ruolo: 'locatore' },
        destinatario: 'Avv. Paolo Conti',
        stato: 'chiuso',
        data: '2026-03-15',
        messaggi: [
            { id: 1, autore: 'Luca Ferrari', ruolo: 'locatore', testo: 'Buongiorno, ho alcune domande sulla clausola di recesso anticipato nel contratto.', data: '15/03/2026 09:00', allegati: [] },
            { id: 2, autore: 'Avv. Paolo Conti', ruolo: 'avvocato', testo: 'Certo, la clausola prevede un preavviso di 6 mesi. Le mando il documento con le specifiche.', data: '15/03/2026 11:30', allegati: ['clausola_recesso.pdf'] },
            { id: 3, autore: 'Luca Ferrari', ruolo: 'locatore', testo: 'Perfetto, grazie mille. Tutto chiaro.', data: '15/03/2026 12:00', allegati: [] },
        ],
    },
    {
        id: 5,
        titolo: 'Richiesta info su inquilino',
        descrizione: 'Esito verifica disponibile.',
        mittente: { nome: 'CRIA', ruolo: 'admin' },
        destinatario: 'Giulia Neri',
        stato: 'chiuso',
        data: '2026-03-10',
        messaggi: [
            { id: 1, autore: 'CRIA', ruolo: 'admin', testo: 'Buongiorno Giulia, la verifica richiesta è stata completata. Può accedere al risultato dalla sua dashboard.', data: '10/03/2026 14:00', allegati: ['esito_verifica.pdf'] },
            { id: 2, autore: 'Giulia Neri', ruolo: 'cliente', testo: 'Grazie mille, ho visualizzato il risultato. Ottimo servizio!', data: '10/03/2026 15:30', allegati: [] },
        ],
    },
];

const isInAttesa = (ticket) => {
    if (ticket.messaggi.length === 0) return false;
    const ultimo = ticket.messaggi[ticket.messaggi.length - 1];
    return ultimo.ruolo !== 'admin';
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const RUOLO_COLOR = {
    admin: 'bg-primary text-primary-foreground',
    locatore: 'bg-blue-500 text-white',
    inquilino: 'bg-green-500 text-white',
    avvocato: 'bg-amber-500 text-white',
    cliente: 'bg-gray-400 text-white',
};

const RUOLO_BADGE = {
    admin: 'bg-purple-100 text-purple-800',
    locatore: 'bg-blue-100 text-blue-800',
    inquilino: 'bg-green-100 text-green-800',
    avvocato: 'bg-amber-100 text-amber-800',
    cliente: 'bg-gray-100 text-gray-700',
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

// ─── Vista ticket singolo ─────────────────────────────────────────────────────
const VistaTicket = ({ ticket, onBack, onCambiaStato }) => {
    const [messaggi, setMessaggi] = useState(ticket.messaggi);
    const [testo, setTesto] = useState('');
    const [allegati, setAllegati] = useState([]);
    const fileRef = useRef(null);
    const bottomRef = useRef(null);

    const inviaMessaggio = () => {
        if (!testo.trim()) return;
        const msg = {
            id: Date.now(),
            autore: 'CRIA',
            ruolo: 'admin',
            testo,
            data: new Date().toLocaleString('it-IT'),
            allegati: allegati.map(f => f.name),
        };
        setMessaggi(prev => [...prev, msg]);
        setTesto('');
        setAllegati([]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleFile = (e) => {
        const files = Array.from(e.target.files);
        setAllegati(prev => [...prev, ...files]);
        toast.success(`${files.length} file aggiunto/i`);
    };

    return (
        <div className="space-y-4">
            {/* Header ticket */}
            <div className="flex items-start gap-3">
                <Button variant="ghost" size="sm" className="gap-1 px-2 flex-shrink-0" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4" /> Tutti i ticket
                </Button>
            </div>

            <Card>
                <CardContent className="pt-5 pb-4">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">{ticket.titolo}</h2>
                            <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                                <span>Da: <strong className="text-foreground">{ticket.mittente.nome}</strong></span>
                                <span>A: <strong className="text-foreground">{ticket.destinatario}</strong></span>
                                <span>Aperto il: {fmt(ticket.data)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{ticket.descrizione}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${ticket.stato === 'aperto' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {ticket.stato}
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onCambiaStato(ticket.id)}
                                className={ticket.stato === 'aperto'
                                    ? 'text-gray-600 border-gray-300'
                                    : 'text-green-600 border-green-300'}
                            >
                                {ticket.stato === 'aperto' ? 'Chiudi ticket' : 'Riapri ticket'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Thread messaggi */}
            <Card>
                <CardContent className="p-0">
                    <div className="divide-y divide-border max-h-96 overflow-y-auto">
                        {messaggi.map((msg) => (
                            <div key={msg.id} className="p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${RUOLO_COLOR[msg.ruolo] || 'bg-gray-400 text-white'}`}>
                                        {msg.autore.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="font-medium text-sm text-foreground">{msg.autore}</span>
                                        <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${RUOLO_BADGE[msg.ruolo] || 'bg-gray-100 text-gray-700'}`}>
                                            {msg.ruolo}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">{msg.data}</span>
                                </div>
                                <p className="text-sm text-foreground pl-9">{msg.testo}</p>
                                {msg.allegati.length > 0 && (
                                    <div className="pl-9 flex flex-wrap gap-2">
                                        {msg.allegati.map((a, i) => (
                                            <span key={i} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                                                <Paperclip className="w-3 h-3" /> {a}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input risposta */}
                    {ticket.stato === 'aperto' && (
                        <div className="p-4 border-t border-border space-y-3">
                            {allegati.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {allegati.map((f, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                                            <Paperclip className="w-3 h-3" /> {f.name}
                                            <button onClick={() => setAllegati(prev => prev.filter((_, j) => j !== i))}>
                                                <X className="w-3 h-3 ml-1" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <textarea
                                    value={testo}
                                    onChange={e => setTesto(e.target.value)}
                                    placeholder="Scrivi una risposta..."
                                    rows={2}
                                    className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); inviaMessaggio(); } }}
                                />
                                <div className="flex flex-col gap-2">
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0"
                                        onClick={() => fileRef.current?.click()}>
                                        <Paperclip className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" className="h-8 w-8 p-0" onClick={inviaMessaggio}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                                <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFile} />
                            </div>
                        </div>
                    )}

                    {ticket.stato === 'chiuso' && (
                        <div className="p-4 border-t border-border text-center text-sm text-muted-foreground">
                            Ticket chiuso — riapri per inviare nuovi messaggi
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

// ─── Componente principale ─────────────────────────────────────────────────────
const AssistenzaPage = () => {
    const [tickets, setTickets] = useState(TICKETS_INIZIALI);
    const [ticketAttivo, setAttivo] = useState(null);
    const [search, setSearch] = useState('');
    const [filtroStato, setStato] = useState('tutti');
    const [filtroRuolo, setRuolo] = useState('tutti');
    const [sortField, setSortField] = useState('data');
    const [sortDir, setSortDir] = useState('desc');
    const [showNuovo, setNuovo] = useState(false);
    const [nuovoForm, setNuovoForm] = useState({ titolo: '', descrizione: '', destinatario: '' });

    const contatori = useMemo(() => ({
        totale: tickets.length,
        aperti: tickets.filter(t => t.stato === 'aperto').length,
        chiusi: tickets.filter(t => t.stato === 'chiuso').length,
        attesa: tickets.filter(t => t.stato === 'aperto' && isInAttesa(t)).length,
    }), [tickets]);

    const cambiaStato = (id) => {
        setTickets(prev => prev.map(t => {
            if (t.id !== id) return t;
            const nuovo = t.stato === 'aperto' ? 'chiuso' : 'aperto';
            toast.success(`Ticket ${nuovo}`);
            return { ...t, stato: nuovo };
        }));
        if (ticketAttivo?.id === id) {
            setAttivo(prev => ({ ...prev, stato: prev.stato === 'aperto' ? 'chiuso' : 'aperto' }));
        }
    };

    const creaNuovo = () => {
        if (!nuovoForm.titolo.trim()) { toast.error('Inserisci un titolo'); return; }
        const t = {
            id: Date.now(),
            titolo: nuovoForm.titolo,
            descrizione: nuovoForm.descrizione,
            mittente: { nome: 'CRIA', ruolo: 'admin' },
            destinatario: nuovoForm.destinatario || '—',
            stato: 'aperto',
            data: new Date().toISOString().split('T')[0],
            messaggi: [],
        };
        setTickets(prev => [t, ...prev]);
        setNuovoForm({ titolo: '', descrizione: '', destinatario: '' });
        setNuovo(false);
        toast.success('Ticket creato');
    };

    const filtered = useMemo(() => {
        let list = [...tickets];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(t =>
                t.titolo.toLowerCase().includes(q) ||
                t.mittente.nome.toLowerCase().includes(q) ||
                t.destinatario.toLowerCase().includes(q)
            );
        }
        if (filtroStato !== 'tutti') list = list.filter(t => t.stato === filtroStato);
        if (filtroRuolo !== 'tutti') list = list.filter(t => t.mittente.ruolo === filtroRuolo);
        list.sort((a, b) => {
            let va = a[sortField] ?? '', vb = b[sortField] ?? '';
            if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [tickets, search, filtroStato, filtroRuolo, sortField, sortDir]);

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

    // Vista ticket singolo
    if (ticketAttivo) {
        const t = tickets.find(t => t.id === ticketAttivo.id) || ticketAttivo;
        return (
            <div>
                <Helmet><title>{`Ticket #${t.id} - Assistenza CRIA`}</title></Helmet>
                <VistaTicket ticket={t} onBack={() => setAttivo(null)} onCambiaStato={cambiaStato} />
            </div>
        );
    }

    return (
        <>
            <Helmet><title>Assistenza - CRIA Admin</title></Helmet>

            {/* Modal nuovo ticket */}
            {showNuovo && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <h3 className="text-lg font-semibold text-foreground">Nuovo ticket</h3>
                            <button onClick={() => setNuovo(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Titolo <span className="text-red-500">*</span></label>
                                <Input value={nuovoForm.titolo} onChange={e => setNuovoForm(p => ({ ...p, titolo: e.target.value }))} placeholder="Es. Problema con pagamento" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Destinatario</label>
                                <Input value={nuovoForm.destinatario} onChange={e => setNuovoForm(p => ({ ...p, destinatario: e.target.value }))} placeholder="Nome cliente o ruolo" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Descrizione</label>
                                <textarea
                                    value={nuovoForm.descrizione}
                                    onChange={e => setNuovoForm(p => ({ ...p, descrizione: e.target.value }))}
                                    rows={3} placeholder="Descrizione del problema..."
                                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end px-6 py-4 border-t border-border">
                            <Button variant="outline" onClick={() => setNuovo(false)}>Annulla</Button>
                            <Button onClick={creaNuovo} className="gap-2"><Plus className="w-4 h-4" /> Crea ticket</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Assistenza</h1>
                        <p className="text-sm text-muted-foreground">Gestione ticket di supporto tra tutte le figure della piattaforma</p>
                    </div>
                    <Button onClick={() => setNuovo(true)} className="gap-2 flex-shrink-0">
                        <Plus className="w-4 h-4" /> Nuovo ticket
                    </Button>
                </div>

                {/* Contatori */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatBox label="Totale ticket" value={contatori.totale} icon={MessageSquare} color="bg-blue-500" />
                    <StatBox label="Aperti" value={contatori.aperti} icon={Clock} color="bg-orange-500" />
                    <StatBox label="Chiusi" value={contatori.chiusi} icon={CheckCircle2} color="bg-green-500" />
                    <StatBox label="In attesa risposta" value={contatori.attesa} icon={MessageSquare} color="bg-red-500" />
                </div>

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca titolo, mittente o destinatario..."
                                    value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
                            </div>
                            <Select value={filtroStato} onValueChange={setStato}>
                                <SelectTrigger className="w-36"><SelectValue placeholder="Stato" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti</SelectItem>
                                    <SelectItem value="aperto">Aperti</SelectItem>
                                    <SelectItem value="chiuso">Chiusi</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filtroRuolo} onValueChange={setRuolo}>
                                <SelectTrigger className="w-40"><SelectValue placeholder="Mittente" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tutti">Tutti i ruoli</SelectItem>
                                    <SelectItem value="locatore">locatore</SelectItem>
                                    <SelectItem value="inquilino">Inquilino</SelectItem>
                                    <SelectItem value="avvocato">Avvocato</SelectItem>
                                    <SelectItem value="cliente">Cliente</SelectItem>
                                    <SelectItem value="admin">CRIA</SelectItem>
                                </SelectContent>
                            </Select>
                            {(search || filtroStato !== 'tutti' || filtroRuolo !== 'tutti') && (
                                <Button variant="ghost" size="sm"
                                    onClick={() => { setSearch(''); setStato('tutti'); setRuolo('tutti'); }}>
                                    Azzera filtri
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tabella ticket */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        <Th label="Data" field="data" />
                                        <Th label="Titolo" field="titolo" />
                                        <Th label="Mittente" field="mittente" />
                                        <Th label="Destinatario" field="destinatario" />
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Messaggi</th>
                                        <Th label="Stato" field="stato" />
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Apri</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.length === 0 ? (
                                        <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Nessun ticket trovato.</td></tr>
                                    ) : filtered.map((t) => (
                                        <tr key={t.id} className={`transition-colors cursor-pointer ${isInAttesa(t) && t.stato === 'aperto' ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-muted/30'}`} onClick={() => setAttivo(t)}>
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmt(t.data)}</td>
                                            <td className="px-4 py-3 max-w-48">
                                                <div className="flex items-center gap-2">
                                                    {isInAttesa(t) && t.stato === 'aperto' && (
                                                        <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                                                    )}
                                                    <span className="font-medium text-foreground truncate">{t.titolo}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-sm text-foreground">{t.mittente.nome}</p>
                                                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${RUOLO_BADGE[t.mittente.ruolo]}`}>
                                                        {t.mittente.ruolo}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{t.destinatario}</td>
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums">{t.messaggi.length}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.stato === 'aperto' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                                                    }`}>{t.stato}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setAttivo(t); }}>
                                                    Apri
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filtered.length > 0 && (
                            <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
                                {filtered.length === tickets.length ? `${tickets.length} ticket totali` : `${filtered.length} di ${tickets.length}`}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default AssistenzaPage;