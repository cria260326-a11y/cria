import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Search, MessageSquare, CheckCircle2, Clock,
    ChevronUp, ChevronDown, Send,
    X, ArrowLeft, Plus, User
} from 'lucide-react';
import { toast } from 'sonner';
import { etichettaRuolo } from '@/lib/etichette';
import { fmtQuando } from '@/lib/formato';
import Messaggio from '@/components/aree/Messaggio';
import { useConversazioni, scriviMessaggio, cambiaStatoConversazione, apriConversazione } from '@/lib/conversazioniFonte';
import { usePersone } from '@/lib/personeFonte';

// La conversazione del database, con i nomi che usa questa pagina.
// «chiuso» qui è «risolto» nel database: la parola che si vede è quella del
// back office, il valore resta quello.
const perIlBackOffice = (k) => ({
    id: k.id,
    titolo: k.oggetto,
    descrizione: k.categoria ? `Categoria: ${k.categoria}` : '',
    mittente: { nome: k.apertaDa?.nome || '—', ruolo: k.area || 'cliente' },
    destinatario: k.assegnataA?.nome || 'CRIA',
    stato: k.stato === 'risolto' ? 'chiuso' : 'aperto',
    data: (k.creatoIl || '').slice(0, 10),
    messaggi: (k.messaggi || []).map(m => ({
        id: m.id,
        autore: m.autore?.nome || 'CRIA',
        ruolo: m.daCria ? 'admin' : (k.area || 'cliente'),
        testo: m.testo,
        data: m.il,
        interno: m.interno,
        allegati: [],
    })),
});


const isInAttesa = (ticket) => {
    if (ticket.messaggi.length === 0) return false;
    const ultimo = ticket.messaggi[ticket.messaggi.length - 1];
    return ultimo.ruolo !== 'admin';
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
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
    const [testo, setTesto] = useState('');
    const [interno, setInterno] = useState(false);
    const listaRef = useRef(null);
    const messaggi = ticket.messaggi;

    // La conversazione si apre sull'ultimo messaggio, e ci resta quando ne arriva uno.
    useEffect(() => {
        if (listaRef.current) listaRef.current.scrollTop = listaRef.current.scrollHeight;
    }, [messaggi.length]);

    const inviaMessaggio = async () => {
        const scritto = testo.trim();
        if (!scritto) return;
        setTesto('');
        const esito = await scriviMessaggio(ticket.id, scritto, { interno });
        if (!esito.ok) { setTesto(scritto); toast.error(esito.messaggio || 'Messaggio non inviato'); }
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
                    {/* Quello che scrive CRIA sta a destra, quello che riceve a sinistra */}
                    <div ref={listaRef} className="p-4 space-y-3 max-h-[28rem] overflow-y-auto">
                        {messaggi.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">Ancora nessun messaggio.</p>
                        ) : messaggi.map((msg) => (
                            <Messaggio
                                key={msg.id}
                                mio={msg.ruolo === 'admin'}
                                autore={msg.autore}
                                ruolo={msg.interno ? 'Nota interna' : etichettaRuolo(msg.ruolo)}
                                quando={fmtQuando(msg.data)}
                                allegati={msg.allegati}
                            >
                                {msg.testo}
                            </Messaggio>
                        ))}
                    </div>

                    {/* Input risposta */}
                    {ticket.stato === 'aperto' && (
                        <div className="p-4 border-t border-border space-y-3">
                            <div className="flex gap-2">
                                <textarea
                                    value={testo}
                                    onChange={e => setTesto(e.target.value)}
                                    placeholder={interno ? 'Nota interna: il cliente non la vede…' : 'Scrivi una risposta…'}
                                    rows={2}
                                    className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); inviaMessaggio(); } }}
                                />
                                <Button size="sm" className="h-8 w-8 p-0 self-end" onClick={inviaMessaggio}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                                <input type="checkbox" checked={interno} onChange={e => setInterno(e.target.checked)} className="w-3.5 h-3.5 accent-amber-600" />
                                Nota interna: resta fra colleghi, il cliente non la legge
                            </label>
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
    const conversazioni = useConversazioni();
    const persone = usePersone();
    const tickets = useMemo(() => conversazioni.map(perIlBackOffice), [conversazioni]);
    const [idAttivo, setAttivo] = useState(null);
    const ticketAttivo = tickets.find(t => t.id === idAttivo) || null;
    const [search, setSearch] = useState('');
    const [filtroStato, setStato] = useState('tutti');
    const [filtroRuolo, setRuolo] = useState('tutti');
    const [sortField, setSortField] = useState('data');
    const [sortDir, setSortDir] = useState('desc');
    const [showNuovo, setNuovo] = useState(false);
    const [nuovoForm, setNuovoForm] = useState({ titolo: '', descrizione: '', destinatario: '' });

    // Un filo si apre sempre verso una persona: senza destinatario non esiste.
    const clienti = useMemo(() => persone
        .filter(x => (x.aree || []).some(a => ['locatore', 'inquilino', 'cliente', 'commerciale'].includes(a)))
        .map(x => ({ id: x.personaDb, nome: [x.ragioneSociale, `${x.nome} ${x.cognome}`.trim()].find(Boolean) })), [persone]);

    const contatori = useMemo(() => ({
        totale: tickets.length,
        aperti: tickets.filter(t => t.stato === 'aperto').length,
        chiusi: tickets.filter(t => t.stato === 'chiuso').length,
        attesa: tickets.filter(t => t.stato === 'aperto' && isInAttesa(t)).length,
    }), [tickets]);

    const cambiaStato = async (id) => {
        const t = tickets.find(x => x.id === id);
        if (!t) return;
        const nuovo = t.stato === 'aperto' ? 'risolto' : 'aperto';
        const esito = await cambiaStatoConversazione(id, nuovo);
        if (esito.ok) toast.success(nuovo === 'risolto' ? 'Ticket chiuso' : 'Ticket riaperto');
        else toast.error(esito.messaggio || 'Non riuscito');
    };

    const creaNuovo = async () => {
        if (!nuovoForm.titolo.trim()) { toast.error('Inserisci un titolo'); return; }
        if (!nuovoForm.destinatario) { toast.error('Scegli a chi scrivere'); return; }
        if (!nuovoForm.descrizione.trim()) { toast.error('Scrivi il messaggio'); return; }
        const esito = await apriConversazione({
            oggetto: nuovoForm.titolo, categoria: 'assistenza', area: null,
            testo: nuovoForm.descrizione, perPersona: nuovoForm.destinatario,
        });
        if (!esito.ok) { toast.error(esito.messaggio || 'Non riuscito'); return; }
        setNuovoForm({ titolo: '', descrizione: '', destinatario: '' });
        setNuovo(false);
        setAttivo(esito.id);
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
        const t = ticketAttivo;
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
                                <select value={nuovoForm.destinatario} onChange={e => setNuovoForm(p => ({ ...p, destinatario: e.target.value }))}
                                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground">
                                    <option value="">Scegli la persona…</option>
                                    {clienti.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                </select>
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
                                    <SelectItem value="locatore">Proprietario</SelectItem>
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
                                        <tr key={t.id} className={`transition-colors cursor-pointer ${isInAttesa(t) && t.stato === 'aperto' ? 'bg-orange-50 hover:bg-orange-100' : 'hover:bg-muted/30'}`} onClick={() => setAttivo(t.id)}>
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
                                                        {etichettaRuolo(t.mittente.ruolo)}
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
                                                <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setAttivo(t.id); }}>
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