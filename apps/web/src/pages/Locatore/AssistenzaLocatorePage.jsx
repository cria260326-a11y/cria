import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    MessageSquare, Plus, Search, X, Send, Paperclip,
    CheckCircle2, Clock, AlertCircle, ArrowLeft, ChevronRight,
    HelpCircle, Mail, Phone
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mock ticket ───────────────────────────────────────────────────────────────
const TICKETS_INIZIALI = [
    {
        id: 1, oggetto: 'Domanda su preventivo', stato: 'aperto',
        categoria: 'preventivi', creato: '2026-05-03', ultimoMessaggio: '2026-05-04T09:30',
        nonLetti: 1,
        messaggi: [
            { id: 1, mittente: 'tu', testo: 'Salve, vorrei capire meglio quali servizi sono inclusi nel preventivo P1 inviato.', data: '2026-05-03 10:30' },
            { id: 2, mittente: 'cria', autore: 'Giulia · CRIA', testo: 'Buongiorno Marco! Il preventivo CRIA Gestione include la piattaforma per tracciare pagamenti e segnalazioni, gestione contestazioni con team interno, e supporto via chat 24/7.', data: '2026-05-03 14:15' },
            { id: 3, mittente: 'cria', autore: 'Giulia · CRIA', testo: 'Hai ricevuto il preventivo via email? Lo trovi anche nella sezione Documenti del tuo account.', data: '2026-05-04 09:30' },
        ],
    },
    {
        id: 2, oggetto: 'Modifica IBAN per bonifico', stato: 'in_corso',
        categoria: 'pagamenti', creato: '2026-04-28', ultimoMessaggio: '2026-04-30T11:00',
        nonLetti: 0,
        messaggi: [
            { id: 1, mittente: 'tu', testo: 'Devo cambiare IBAN per ricevere i bonifici di CRIA Completo. Come procedo?', data: '2026-04-28 16:00' },
            { id: 2, mittente: 'cria', autore: 'Marco · CRIA', testo: 'Ti ho appena inviato un modulo per la modifica IBAN. Compilalo e ricaricalo qui.', data: '2026-04-29 09:00' },
            { id: 3, mittente: 'tu', testo: 'Modulo compilato e caricato.', data: '2026-04-30 10:30' },
            { id: 4, mittente: 'cria', autore: 'Marco · CRIA', testo: 'Ricevuto, stiamo verificando il documento. Ti aggiorniamo entro 24 ore.', data: '2026-04-30 11:00' },
        ],
    },
    {
        id: 3, oggetto: 'Problema accesso piattaforma', stato: 'risolto',
        categoria: 'account', creato: '2026-04-10', ultimoMessaggio: '2026-04-11T15:30',
        nonLetti: 0,
        messaggi: [
            { id: 1, mittente: 'tu', testo: 'Non riesco ad accedere dal browser Safari, ricevo errore 403.', data: '2026-04-10 14:00' },
            { id: 2, mittente: 'cria', autore: 'Sara · CRIA', testo: 'Prova a svuotare la cache e i cookie. Se il problema persiste, fammelo sapere.', data: '2026-04-11 10:00' },
            { id: 3, mittente: 'tu', testo: 'Funziona, grazie!', data: '2026-04-11 15:30' },
        ],
    },
];

const STATO_BADGE = {
    aperto: { label: 'Aperto', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
    in_corso: { label: 'In corso', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    risolto: { label: 'Risolto', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
};

const CATEGORIE = [
    { id: 'preventivi', label: 'Preventivi e prezzi' },
    { id: 'pagamenti', label: 'Pagamenti e bonifici' },
    { id: 'account', label: 'Account e accesso' },
    { id: 'tecnico', label: 'Problema tecnico' },
    { id: 'altro', label: 'Altro' },
];

const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

// ─── Modal nuovo ticket ────────────────────────────────────────────────────────
const ModalNuovoTicket = ({ onClose, onCreate }) => {
    const [oggetto, setOggetto] = useState('');
    const [categoria, setCategoria] = useState('');
    const [messaggio, setMessaggio] = useState('');

    const conferma = () => {
        if (!oggetto.trim()) { toast.error('Inserisci un oggetto'); return; }
        if (!categoria) { toast.error('Seleziona una categoria'); return; }
        if (!messaggio.trim()) { toast.error('Scrivi un messaggio'); return; }
        onCreate({ oggetto, categoria, messaggio });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground">Nuova richiesta di assistenza</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label>Oggetto <span className="text-red-500">*</span></Label>
                        <Input value={oggetto} onChange={e => setOggetto(e.target.value)}
                            placeholder="Riassumi brevemente la tua richiesta" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Categoria <span className="text-red-500">*</span></Label>
                        <select value={categoria} onChange={e => setCategoria(e.target.value)}
                            className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background">
                            <option value="">— Seleziona una categoria —</option>
                            {CATEGORIE.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Messaggio <span className="text-red-500">*</span></Label>
                        <textarea value={messaggio} onChange={e => setMessaggio(e.target.value)} rows={5}
                            placeholder="Descrivi nel dettaglio il tuo problema o la tua domanda..."
                            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={onClose}>Annulla</Button>
                    <Button onClick={conferma} className="gap-2">
                        <Send className="w-4 h-4" /> Invia richiesta
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const AssistenzaLocatorePage = () => {
    const [tickets, setTickets] = useState(TICKETS_INIZIALI);
    const [search, setSearch] = useState('');
    const [filtroStato, setFStato] = useState('tutti');
    const [showModal, setShowModal] = useState(false);
    const [ticketAperto, setAperto] = useState(null);
    const [nuovoMessaggio, setNuovoMsg] = useState('');
    const messaggiRef = useRef(null);

    useEffect(() => {
        if (ticketAperto && messaggiRef.current) {
            messaggiRef.current.scrollTop = messaggiRef.current.scrollHeight;
        }
    }, [ticketAperto]);

    const filtrati = useMemo(() => {
        let list = [...tickets];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(t => t.oggetto.toLowerCase().includes(q));
        }
        if (filtroStato !== 'tutti') list = list.filter(t => t.stato === filtroStato);
        return list.sort((a, b) => b.ultimoMessaggio.localeCompare(a.ultimoMessaggio));
    }, [tickets, search, filtroStato]);

    const creaTicket = ({ oggetto, categoria, messaggio }) => {
        const nuovo = {
            id: Date.now(),
            oggetto, categoria,
            stato: 'aperto',
            creato: new Date().toISOString().split('T')[0],
            ultimoMessaggio: new Date().toISOString(),
            nonLetti: 0,
            messaggi: [{ id: 1, mittente: 'tu', testo: messaggio, data: new Date().toLocaleString('it-IT') }],
        };
        setTickets(prev => [nuovo, ...prev]);
        setAperto(nuovo.id);
        toast.success('Richiesta inviata — ti risponderemo a breve');
    };

    const inviaMessaggio = () => {
        if (!nuovoMessaggio.trim()) return;
        const nuovo = {
            id: Date.now(),
            mittente: 'tu',
            testo: nuovoMessaggio,
            data: new Date().toLocaleString('it-IT'),
        };
        setTickets(prev => prev.map(t => t.id === ticketAperto
            ? { ...t, messaggi: [...t.messaggi, nuovo], ultimoMessaggio: new Date().toISOString() }
            : t
        ));
        setNuovoMsg('');
    };

    const ticket = tickets.find(t => t.id === ticketAperto);

    // Vista dettaglio
    if (ticket) {
        return (
            <>
                <Helmet><title>{`${ticket.oggetto} - CRIA`}</title></Helmet>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                    <div className="flex items-center gap-2 text-sm">
                        <Button variant="ghost" size="sm" className="gap-1 px-2" onClick={() => setAperto(null)}>
                            <ArrowLeft className="w-4 h-4" /> Tutte le richieste
                        </Button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground font-medium truncate">{ticket.oggetto}</span>
                    </div>

                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{ticket.oggetto}</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Aperta il {fmtData(ticket.creato)} · Categoria: {CATEGORIE.find(c => c.id === ticket.categoria)?.label}
                            </p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${STATO_BADGE[ticket.stato].color}`}>
                            {React.createElement(STATO_BADGE[ticket.stato].icon, { className: 'w-3.5 h-3.5' })}
                            {STATO_BADGE[ticket.stato].label}
                        </span>
                    </div>

                    <Card>
                        <CardContent className="p-0 flex flex-col" style={{ height: '60vh' }}>
                            <div ref={messaggiRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                                {ticket.messaggi.map(m => (
                                    <div key={m.id} className={`flex ${m.mittente === 'tu' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] rounded-2xl p-3 ${m.mittente === 'tu' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                                            }`}>
                                            {m.autore && <p className="text-xs font-semibold opacity-80 mb-1">{m.autore}</p>}
                                            <p className="text-sm whitespace-pre-wrap">{m.testo}</p>
                                            <p className="text-xs opacity-60 mt-1">{m.data}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {ticket.stato !== 'risolto' && (
                                <div className="flex gap-2 p-3 border-t border-border">
                                    <textarea value={nuovoMessaggio} onChange={e => setNuovoMsg(e.target.value)}
                                        placeholder="Scrivi un messaggio..." rows={2}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); inviaMessaggio(); } }}
                                        className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    <Button onClick={inviaMessaggio} className="gap-2 self-end">
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </>
        );
    }

    // Vista lista
    return (
        <>
            <Helmet><title>Assistenza - CRIA</title></Helmet>

            {showModal && <ModalNuovoTicket onClose={() => setShowModal(false)} onCreate={creaTicket} />}

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Assistenza</h1>
                        <p className="text-sm text-muted-foreground">Le tue richieste di supporto al team CRIA</p>
                    </div>
                    <Button onClick={() => setShowModal(true)} className="gap-2">
                        <Plus className="w-4 h-4" /> Nuova richiesta
                    </Button>
                </div>

                {/* Contatti rapidi */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Card>
                        <CardContent className="pt-4 pb-4 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <Mail className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm font-medium text-foreground">supporto@cria.it</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4 flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                                <Phone className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Telefono</p>
                                <p className="text-sm font-medium text-foreground">+39 02 1234 5678</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4 pb-4 flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                                <HelpCircle className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">FAQ</p>
                                <p className="text-sm font-medium text-foreground">Trova risposte rapide</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca nelle tue richieste..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }} />
                            </div>
                            <select value={filtroStato} onChange={e => setFStato(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti gli stati</option>
                                <option value="aperto">Aperti</option>
                                <option value="in_corso">In corso</option>
                                <option value="risolto">Risolti</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista ticket */}
                {filtrati.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Nessuna richiesta trovata</p>
                            <p className="text-xs text-muted-foreground/70 mt-1 mb-4">Apri una nuova richiesta se hai bisogno di aiuto</p>
                            <Button onClick={() => setShowModal(true)} className="gap-2">
                                <Plus className="w-4 h-4" /> Nuova richiesta
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {filtrati.map(t => {
                            const cfg = STATO_BADGE[t.stato];
                            const Icon = cfg.icon;
                            return (
                                <Card key={t.id} className="hover:shadow-sm transition-shadow cursor-pointer"
                                    onClick={() => setAperto(t.id)}>
                                    <CardContent className="py-4">
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold text-foreground truncate">{t.oggetto}</p>
                                                    {t.nonLetti > 0 && (
                                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                                                            {t.nonLetti}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Aperta il {fmtData(t.creato)} · {CATEGORIE.find(c => c.id === t.categoria)?.label}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                                                    <Icon className="w-3 h-3" /> {cfg.label}
                                                </span>
                                                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                                    Apri <ChevronRight className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

            </div>
        </>
    );
};

export default AssistenzaLocatorePage;