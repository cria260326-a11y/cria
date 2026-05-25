import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft, ChevronRight, User, Mail, Phone, Home,
    Scale, FileText, MessageSquare, StickyNote, Send,
    Upload, X, CheckCircle2, XCircle, AlertTriangle,
    Clock, Eye, Plus, Edit2, Save
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mock cliente ──────────────────────────────────────────────────────────────
const CLIENTE = {
    id: 2,
    nome: 'Sofia Martini',
    ruolo: 'inquilino',
    email: 'sofia.martini@email.it',
    telefono: '+39 347 9876543',
    codiceFiscale: 'MRTSFI88L42F205Z',
    indirizzoResidenza: 'Via Roma 42, 20100 Milano',
    immobile: 'Via Roma 42, Milano',
    controparte: { nome: 'Marco Bianchi', ruolo: 'locatore', email: 'marco.bianchi@email.it' },
    dataAssegnazione: '2026-03-15',

    contestazioni: [
        {
            id: 1, mese: 'Marzo 2026', stato: 'in verifica', motivo: 'Pagamento contestato', dataApertura: '2026-03-29',
            documenti: [
                { id: 1, nome: 'Ricevuta bonifico Marzo.pdf', caricatoDa: 'Sofia Martini', data: '29/03/2026', stato: 'da verificare' },
                { id: 2, nome: 'Estratto conto.pdf', caricatoDa: 'Marco Bianchi', data: '30/03/2026', stato: 'da verificare' },
            ],
            messaggi: [
                { id: 1, mittente: 'Sistema', testo: 'Contestazione aperta da Sofia Martini.', data: '29/03/2026 10:30', ruolo: 'sistema' },
                { id: 2, mittente: 'Sofia Martini', testo: 'Ho effettuato il bonifico il 3 Marzo. Allego ricevuta.', data: '29/03/2026 10:31', ruolo: 'inquilino' },
                { id: 3, mittente: 'Marco Bianchi', testo: 'Non ho ricevuto nessun accredito sul mio conto.', data: '30/03/2026 09:00', ruolo: 'locatore' },
            ],
        },
    ],

    documenti: [
        { id: 1, nome: 'Carta identità.pdf', tipo: 'identita', data: '2025-12-20', stato: 'verificato' },
        { id: 2, nome: 'Codice fiscale.pdf', tipo: 'cf', data: '2025-12-20', stato: 'verificato' },
        { id: 3, nome: 'Ricevuta bonifico Marzo.pdf', tipo: 'prova', data: '2026-03-29', stato: 'da verificare' },
    ],

    ticket: [
        {
            id: 1, oggetto: 'Domanda su clausola contratto', stato: 'aperto', creato: '2026-05-03',
            messaggi: [
                { id: 1, mittente: 'Sofia Martini', testo: 'Vorrei chiarimenti sulla clausola di rescissione anticipata. Come funziona?', data: '03/05/2026 14:00', ruolo: 'cliente' },
                { id: 2, mittente: 'Avv. Conti', testo: 'Buongiorno, dia mi qualche minuto per verificare il contratto e le rispondo a breve.', data: '03/05/2026 14:30', ruolo: 'avvocato' },
            ],
        },
    ],

    noteInterne: 'Cliente molto collaborativa. Ricevute pagamenti sempre in ordine. Caso semplice da risolvere.',
};

const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const STATO_BADGE = {
    'aperta': 'bg-red-100 text-red-800',
    'in verifica': 'bg-yellow-100 text-yellow-800',
    'risolta': 'bg-green-100 text-green-800',
    'chiusa': 'bg-gray-100 text-gray-600',
    'aperto': 'bg-blue-100 text-blue-800',
    'risolto': 'bg-green-100 text-green-800',
};

const DOC_BADGE = {
    'verificato': 'bg-green-100 text-green-800',
    'da verificare': 'bg-yellow-100 text-yellow-800',
};

const RUOLO_BADGE = {
    locatore: 'bg-blue-100 text-blue-800',
    inquilino: 'bg-green-100 text-green-800',
    agenzia: 'bg-purple-100 text-purple-800',
};

const MSG_STYLE = {
    sistema: 'bg-muted/60 text-muted-foreground italic text-xs text-center py-2',
    cliente: 'bg-muted text-foreground',
    avvocato: 'bg-primary/10 text-foreground ml-8',
    inquilino: 'bg-green-50 text-foreground',
    locatore: 'bg-blue-50 text-foreground',
};

// ─── Tab contestazioni ─────────────────────────────────────────────────────────
const TabContestazioni = ({ contestazioni, setContestazioni }) => {
    const [aperta, setAperta] = useState(contestazioni[0]?.id || null);
    const [messaggio, setMessaggio] = useState('');
    const c = contestazioni.find(x => x.id === aperta);

    const inviaMessaggio = () => {
        if (!messaggio.trim()) return;
        const nuovo = {
            id: Date.now(),
            mittente: 'Avv. Conti',
            testo: messaggio,
            data: new Date().toLocaleString('it-IT'),
            ruolo: 'avvocato',
        };
        setContestazioni(prev => prev.map(x => x.id === c.id ? { ...x, messaggi: [...x.messaggi, nuovo] } : x));
        setMessaggio('');
        toast.success('Messaggio inviato a entrambe le parti');
    };

    const verificaDoc = (docId) => {
        setContestazioni(prev => prev.map(x => x.id === c.id
            ? { ...x, documenti: x.documenti.map(d => d.id === docId ? { ...d, stato: 'verificato' } : d) }
            : x
        ));
        toast.success('Documento verificato');
    };

    const risolvi = (esito) => {
        setContestazioni(prev => prev.map(x => x.id === c.id ? { ...x, stato: 'risolta', esito } : x));
        toast.success(`Contestazione risolta a favore ${esito === 'favore_inquilino' ? 'inquilino' : 'locatore'}`);
    };

    if (contestazioni.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <Scale className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nessuna contestazione per questo cliente</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Selettore */}
            {contestazioni.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                    {contestazioni.map(x => (
                        <button key={x.id} onClick={() => setAperta(x.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${aperta === x.id ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                                }`}>
                            {x.mese}
                        </button>
                    ))}
                </div>
            )}

            {c && (
                <Card>
                    <CardContent className="pt-5 space-y-5">
                        <div className="flex items-start justify-between flex-wrap gap-3">
                            <div>
                                <p className="font-semibold text-foreground">{c.mese} — {c.motivo}</p>
                                <p className="text-xs text-muted-foreground">Aperta il {fmtData(c.dataApertura)}</p>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATO_BADGE[c.stato]}`}>
                                {c.stato}
                            </span>
                        </div>

                        {/* Azioni risoluzione */}
                        {c.stato !== 'risolta' && c.stato !== 'chiusa' && (
                            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Azioni</p>
                                <div className="flex flex-wrap gap-2">
                                    <Button size="sm" variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                        onClick={() => risolvi('favore_locatore')}>
                                        <CheckCircle2 className="w-4 h-4" /> Risolvi a favore locatore
                                    </Button>
                                    <Button size="sm" variant="outline" className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
                                        onClick={() => risolvi('favore_inquilino')}>
                                        <CheckCircle2 className="w-4 h-4" /> Risolvi a favore inquilino
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Documenti */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Documenti</p>
                            {c.documenti.map(doc => (
                                <div key={doc.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{doc.nome}</p>
                                        <p className="text-xs text-muted-foreground">{doc.caricatoDa} · {doc.data}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${DOC_BADGE[doc.stato]}`}>
                                        {doc.stato}
                                    </span>
                                    {doc.stato === 'da verificare' && (
                                        <Button size="sm" variant="ghost" className="h-7 text-green-600"
                                            onClick={() => verificaDoc(doc.id)}>
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Thread */}
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Comunicazioni</p>
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {c.messaggi.map(m => (
                                    <div key={m.id} className={`p-3 rounded-xl text-sm ${MSG_STYLE[m.ruolo] || 'bg-muted'}`}>
                                        {m.ruolo !== 'sistema' && (
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-xs">{m.mittente}</span>
                                                <span className="text-xs text-muted-foreground">{m.data}</span>
                                            </div>
                                        )}
                                        <p>{m.testo}</p>
                                    </div>
                                ))}
                            </div>

                            {c.stato !== 'risolta' && c.stato !== 'chiusa' && (
                                <div className="space-y-1.5 pt-2 border-t border-border">
                                    <p className="text-xs text-muted-foreground">Il messaggio verrà inviato a {CLIENTE.nome} e {CLIENTE.controparte.nome}</p>
                                    <div className="flex gap-2">
                                        <textarea value={messaggio} onChange={e => setMessaggio(e.target.value)}
                                            placeholder="Rispondi..." rows={2}
                                            className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                        <Button onClick={inviaMessaggio} className="gap-2 self-end">
                                            <Send className="w-4 h-4" /> Invia
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

// ─── Tab documenti ─────────────────────────────────────────────────────────────
const TabDocumenti = ({ documenti, setDocumenti }) => {
    const verifica = (id) => {
        setDocumenti(prev => prev.map(d => d.id === id ? { ...d, stato: 'verificato' } : d));
        toast.success('Documento verificato');
    };

    return (
        <Card>
            <CardContent className="pt-5 space-y-2">
                {documenti.map(d => (
                    <div key={d.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{d.nome}</p>
                            <p className="text-xs text-muted-foreground">{d.tipo} · {fmtData(d.data)}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${DOC_BADGE[d.stato]}`}>
                            {d.stato}
                        </span>
                        {d.stato === 'da verificare' && (
                            <Button size="sm" variant="outline" className="gap-1.5 text-green-600 border-green-200"
                                onClick={() => verifica(d.id)}>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verifica
                            </Button>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

// ─── Tab ticket ─────────────────────────────────────────────────────────────────
const TabTicket = ({ tickets, setTickets }) => {
    const [aperto, setAperto] = useState(tickets[0]?.id || null);
    const [messaggio, setMessaggio] = useState('');
    const t = tickets.find(x => x.id === aperto);

    const inviaMessaggio = () => {
        if (!messaggio.trim()) return;
        const nuovo = {
            id: Date.now(),
            mittente: 'Avv. Conti',
            testo: messaggio,
            data: new Date().toLocaleString('it-IT'),
            ruolo: 'avvocato',
        };
        setTickets(prev => prev.map(x => x.id === t.id ? { ...x, messaggi: [...x.messaggi, nuovo] } : x));
        setMessaggio('');
        toast.success('Risposta inviata');
    };

    if (tickets.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nessun ticket per questo cliente</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {tickets.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                    {tickets.map(x => (
                        <button key={x.id} onClick={() => setAperto(x.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${aperto === x.id ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                                }`}>
                            {x.oggetto}
                        </button>
                    ))}
                </div>
            )}

            {t && (
                <Card>
                    <CardContent className="pt-5 space-y-4">
                        <div className="flex items-start justify-between flex-wrap gap-3">
                            <div>
                                <p className="font-semibold text-foreground">{t.oggetto}</p>
                                <p className="text-xs text-muted-foreground">Aperto il {fmtData(t.creato)}</p>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATO_BADGE[t.stato]}`}>
                                {t.stato}
                            </span>
                        </div>

                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {t.messaggi.map(m => (
                                <div key={m.id} className={`p-3 rounded-xl text-sm ${MSG_STYLE[m.ruolo] || 'bg-muted'}`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-xs">{m.mittente}</span>
                                        <span className="text-xs text-muted-foreground">{m.data}</span>
                                    </div>
                                    <p>{m.testo}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-border">
                            <textarea value={messaggio} onChange={e => setMessaggio(e.target.value)}
                                placeholder="Rispondi al cliente..." rows={2}
                                className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            <Button onClick={inviaMessaggio} className="gap-2 self-end">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

// ─── Tab note ──────────────────────────────────────────────────────────────────
const TabNote = ({ note, setNote }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(note);

    const salva = () => {
        setNote(draft);
        setEditing(false);
        toast.success('Note interne salvate');
    };

    return (
        <Card>
            <CardContent className="pt-5 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <StickyNote className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>Note visibili solo a te. Il cliente non le vede.</p>
                    </div>
                    {!editing && (
                        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
                            <Edit2 className="w-3.5 h-3.5" /> Modifica
                        </Button>
                    )}
                </div>
                {editing ? (
                    <>
                        <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={8}
                            placeholder="Aggiungi note interne..."
                            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={() => { setDraft(note); setEditing(false); }}>Annulla</Button>
                            <Button size="sm" onClick={salva} className="gap-2">
                                <Save className="w-3.5 h-3.5" /> Salva
                            </Button>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-foreground whitespace-pre-wrap">{note || <span className="text-muted-foreground italic">Nessuna nota.</span>}</p>
                )}
            </CardContent>
        </Card>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const SchedaClienteAvvocatoPage = () => {
    const { id } = useParams();
    const [contestazioni, setContestazioni] = useState(CLIENTE.contestazioni);
    const [documenti, setDocumenti] = useState(CLIENTE.documenti);
    const [tickets, setTickets] = useState(CLIENTE.ticket);
    const [note, setNote] = useState(CLIENTE.noteInterne);
    const [tab, setTab] = useState('contestazioni');

    const TABS = [
        { id: 'contestazioni', label: 'Contestazioni', icon: Scale, count: contestazioni.length },
        { id: 'documenti', label: 'Documenti', icon: FileText, count: documenti.length },
        { id: 'ticket', label: 'Ticket', icon: MessageSquare, count: tickets.length },
        { id: 'note', label: 'Note interne', icon: StickyNote, count: null },
    ];

    return (
        <>
            <Helmet><title>{`${CLIENTE.nome} - CRIA Avvocato`}</title></Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/dashboard/avvocato/clienti">
                        <Button variant="ghost" size="sm" className="gap-1 px-2">
                            <ArrowLeft className="w-4 h-4" /> Clienti
                        </Button>
                    </Link>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{CLIENTE.nome}</span>
                </div>

                {/* Header anagrafica */}
                <Card>
                    <CardContent className="pt-5">
                        <div className="flex items-start gap-4 flex-wrap">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-base font-bold text-primary">
                                    {CLIENTE.nome.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h1 className="text-xl font-bold text-foreground">{CLIENTE.nome}</h1>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${RUOLO_BADGE[CLIENTE.ruolo]}`}>
                                        {CLIENTE.ruolo}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-3.5 h-3.5" /> {CLIENTE.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="w-3.5 h-3.5" /> {CLIENTE.telefono}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Home className="w-3.5 h-3.5" /> {CLIENTE.immobile}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="w-3.5 h-3.5" /> Controparte: {CLIENTE.controparte.nome}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-border overflow-x-auto">
                    {TABS.map(({ id, label, icon: Icon, count }) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}>
                            <Icon className="w-4 h-4" /> {label}
                            {count !== null && count > 0 && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Contenuto tab */}
                {tab === 'contestazioni' && <TabContestazioni contestazioni={contestazioni} setContestazioni={setContestazioni} />}
                {tab === 'documenti' && <TabDocumenti documenti={documenti} setDocumenti={setDocumenti} />}
                {tab === 'ticket' && <TabTicket tickets={tickets} setTickets={setTickets} />}
                {tab === 'note' && <TabNote note={note} setNote={setNote} />}

            </div>
        </>
    );
};

export default SchedaClienteAvvocatoPage;