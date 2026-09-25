import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    MessageSquare, Plus, Search, X, Send,
    CheckCircle2, Clock, AlertCircle, ArrowLeft, ChevronRight,
    HelpCircle, Mail, Phone
} from 'lucide-react';
import { toast } from 'sonner';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useConversazioni, perLArea, apriConversazione, scriviMessaggio } from '@/lib/conversazioniFonte';
import Messaggio from '@/components/aree/Messaggio';
import { fmtQuando } from '@/lib/formato';

// P-17 — Assistenza, uguale per proprietario, inquilino e commerciale.
// Cambiano solo i dati d'esempio: le richieste iniziali e le categorie.

const STATO_BADGE = {
    aperto: { label: 'Aperto', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
    in_corso: { label: 'In corso', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    risolto: { label: 'Risolto', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
};

const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

// ─── Modal nuovo ticket ────────────────────────────────────────────────────────
const ModalNuovoTicket = ({ categorie, onClose, onCreate }) => {
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
                            {categorie.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
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
// I fili arrivano dal database: qui ognuno vede i suoi (lib/conversazioniFonte).
// categorie: [{ id, label }] per il modulo e per le etichette delle richieste.
const Assistenza = ({ categorie, area = null }) => {
    const { persona } = useAuth();
    const conversazioni = useConversazioni();
    const tickets = useMemo(() => perLArea(conversazioni, persona?.id), [conversazioni, persona]);
    const [search, setSearch] = useState('');
    const [filtroStato, setFStato] = useState('tutti');
    const [showModal, setShowModal] = useState(false);
    const [ticketAperto, setAperto] = useState(null);
    const [nuovoMessaggio, setNuovoMsg] = useState('');
    const messaggiRef = useRef(null);

    const etichettaCategoria = (id) => categorie.find(c => c.id === id)?.label;

    // La conversazione si apre sull'ultimo messaggio, e ci resta quando ne arriva uno.
    const quantiMessaggi = tickets.find(t => t.id === ticketAperto)?.messaggi.length;
    useEffect(() => {
        if (ticketAperto && messaggiRef.current) {
            messaggiRef.current.scrollTop = messaggiRef.current.scrollHeight;
        }
    }, [ticketAperto, quantiMessaggi]);

    const filtrati = useMemo(() => {
        let list = [...tickets];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(t => t.oggetto.toLowerCase().includes(q));
        }
        if (filtroStato !== 'tutti') list = list.filter(t => t.stato === filtroStato);
        return list.sort((a, b) => b.ultimoMessaggio.localeCompare(a.ultimoMessaggio));
    }, [tickets, search, filtroStato]);

    const creaTicket = async ({ oggetto, categoria, messaggio }) => {
        const esito = await apriConversazione({ oggetto, categoria, area, testo: messaggio, persona });
        if (!esito.ok) { toast.error(esito.messaggio || 'Richiesta non inviata: riprova'); return; }
        setAperto(esito.id);
        toast.success('Richiesta inviata — ti risponderemo a breve');
    };

    const inviaMessaggio = async () => {
        const testo = nuovoMessaggio.trim();
        if (!testo || !ticketAperto) return;
        setNuovoMsg('');
        const esito = await scriviMessaggio(ticketAperto, testo, { persona });
        if (!esito.ok) { setNuovoMsg(testo); toast.error(esito.messaggio || 'Messaggio non inviato'); }
    };

    const ticket = tickets.find(t => t.id === ticketAperto);

    // Vista dettaglio
    if (ticket) {
        return (
            <>
                <Helmet><title>{`${ticket.oggetto} - CRIA`}</title></Helmet>
                <div className="space-y-6">

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
                                Aperta il {fmtData(ticket.creato)} · Categoria: {etichettaCategoria(ticket.categoria)}
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
                                    <Messaggio key={m.id} mio={m.mittente === 'tu'} autore={m.autore || 'CRIA'} quando={fmtQuando(m.data)}>
                                        {m.testo}
                                    </Messaggio>
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

            {showModal && <ModalNuovoTicket categorie={categorie} onClose={() => setShowModal(false)} onCreate={creaTicket} />}

            <div className="space-y-6">

                <IntestazionePagina
                    titolo="Assistenza"
                    sottotitolo="Le tue richieste di supporto al team CRIA"
                    azioni={
                        <Button onClick={() => setShowModal(true)} className="gap-2">
                            <Plus className="w-4 h-4" /> Nuova richiesta
                        </Button>
                    }
                />

                {/* Contatti rapidi */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Card>
                        <CardContent className="pt-4 pb-4 flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                <Mail className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm font-medium text-foreground">supporto@cri-affitti.it</p>
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
                                                    Aperta il {fmtData(t.creato)} · {etichettaCategoria(t.categoria)}
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

export default Assistenza;
