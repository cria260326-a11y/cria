import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft, ChevronRight, AlertTriangle, Clock,
    CheckCircle2, XCircle, Search, FileText, Send,
    User, Home, Upload, Scale, Filter, Eye
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Dati mock ─────────────────────────────────────────────────────────────────
const CONTESTAZIONI_INIZIALI = [
    {
        id: 1,
        immobile: 'Via Roma 42, Milano',
        mese: 'Marzo 2026',
        dataApertura: '2026-03-28',
        motivo: 'Mancato pagamento',
        stato: 'in verifica',
        locatore: { nome: 'Marco Bianchi', email: 'marco.bianchi@email.it', telefono: '+39 333 1234567' },
        inquilino: { nome: 'Sofia Martini', email: 'sofia.martini@email.it', telefono: '+39 347 9876543' },
        avvocato: null,
        documenti: [
            { id: 1, nome: 'Ricevuta pagamento.pdf', caricatoDa: 'inquilino', data: '2026-03-29', stato: 'da verificare' },
            { id: 2, nome: 'Screenshot bonifico.jpg', caricatoDa: 'inquilino', data: '2026-03-29', stato: 'da verificare' },
            { id: 3, nome: 'Estratto conto Marzo.pdf', caricatoDa: 'locatore', data: '2026-03-30', stato: 'da verificare' },
        ],
        messaggi: [
            { id: 1, mittente: 'Sistema', testo: 'Contestazione aperta da Sofia Martini.', data: '2026-03-28 10:00', ruolo: 'sistema' },
            { id: 2, mittente: 'Sofia Martini', testo: 'Ho pagato il bonifico il 3 Marzo. Allego ricevuta.', data: '2026-03-28 10:30', ruolo: 'inquilino' },
            { id: 3, mittente: 'Marco Bianchi', testo: 'Non ho ricevuto nessun accredito sul mio conto.', data: '2026-03-29 09:00', ruolo: 'locatore' },
            { id: 4, mittente: 'Admin CRIA', testo: 'Abbiamo ricevuto i documenti. Stiamo verificando la situazione.', data: '2026-03-30 11:00', ruolo: 'admin' },
        ],
        note: '',
    },
    {
        id: 2,
        immobile: 'Piazza Navona 23, Roma',
        mese: 'Febbraio 2026',
        dataApertura: '2026-02-15',
        motivo: 'Pagamento contestato',
        stato: 'aperta',
        locatore: { nome: 'Sara Conti', email: 'sara.conti@email.it', telefono: '+39 347 2345678' },
        inquilino: { nome: 'Marco Esposito', email: 'marco.esposito@email.it', telefono: '+39 320 8765432' },
        avvocato: { nome: 'Avv. Paolo Conti', email: 'p.conti@studioconti.it' },
        documenti: [
            { id: 1, nome: 'Contratto locazione.pdf', caricatoDa: 'locatore', data: '2026-02-16', stato: 'verificato' },
        ],
        messaggi: [
            { id: 1, mittente: 'Sistema', testo: 'Contestazione aperta da Marco Esposito.', data: '2026-02-15 14:00', ruolo: 'sistema' },
            { id: 2, mittente: 'Marco Esposito', testo: 'Il pagamento è stato effettuato regolarmente. Chiedo verifica urgente.', data: '2026-02-15 14:30', ruolo: 'inquilino' },
        ],
        note: 'Caso complesso — assegnato ad avvocato.',
    },
    {
        id: 3,
        immobile: 'Corso Venezia 18, Milano',
        mese: 'Gennaio 2026',
        dataApertura: '2026-01-20',
        motivo: 'Mancato pagamento',
        stato: 'risolta',
        esito: 'favore_locatore',
        locatore: { nome: 'Marco Bianchi', email: 'marco.bianchi@email.it', telefono: '+39 333 1234567' },
        inquilino: { nome: 'Luca Romano', email: 'luca.romano@email.it', telefono: '+39 320 3456789' },
        avvocato: null,
        documenti: [],
        messaggi: [
            { id: 1, mittente: 'Sistema', testo: 'Contestazione aperta.', data: '2026-01-20 09:00', ruolo: 'sistema' },
            { id: 2, mittente: 'Admin CRIA', testo: 'Contestazione risolta a favore del locatore — pagamento non trovato.', data: '2026-01-25 15:00', ruolo: 'admin' },
        ],
        note: '',
    },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('it-IT') : '—';

const STATO_BADGE = {
    'aperta': 'bg-red-100 text-red-800',
    'in verifica': 'bg-yellow-100 text-yellow-800',
    'risolta': 'bg-green-100 text-green-800',
    'chiusa': 'bg-gray-100 text-gray-600',
};

const ESITO_BADGE = {
    'favore_locatore': 'bg-blue-100 text-blue-800',
    'favore_inquilino': 'bg-purple-100 text-purple-800',
};

const DOC_BADGE = {
    'verificato': 'bg-green-100 text-green-800',
    'da verificare': 'bg-yellow-100 text-yellow-800',
};

const MSG_STYLE = {
    sistema: 'bg-muted/60 text-muted-foreground italic text-xs text-center',
    admin: 'bg-primary/10 text-foreground',
    locatore: 'bg-blue-50 text-foreground',
    inquilino: 'bg-green-50 text-foreground',
};

// ─── Lista contestazioni ───────────────────────────────────────────────────────
const ListaContestazioni = ({ contestazioni }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filtroStato, setFiltro] = useState('tutti');
    const [filtroDa, setDa] = useState('');
    const [filtroA, setA] = useState('');

    const contatori = useMemo(() => ({
        aperte: contestazioni.filter(c => c.stato === 'aperta').length,
        inVerifica: contestazioni.filter(c => c.stato === 'in verifica').length,
        risolte: contestazioni.filter(c => c.stato === 'risolta').length,
    }), [contestazioni]);

    const filtrate = useMemo(() => {
        let list = [...contestazioni];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c => c.immobile.toLowerCase().includes(q) || c.locatore.nome.toLowerCase().includes(q) || c.inquilino.nome.toLowerCase().includes(q));
        }
        if (filtroStato !== 'tutti') list = list.filter(c => c.stato === filtroStato);
        if (filtroDa) list = list.filter(c => c.dataApertura >= filtroDa);
        if (filtroA) list = list.filter(c => c.dataApertura <= filtroA);
        return list;
    }, [contestazioni, search, filtroStato, filtroDa, filtroA]);

    const hasFilters = search || filtroStato !== 'tutti' || filtroDa || filtroA;

    return (
        <div className="space-y-6">
            {/* Contatori */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Aperte', value: contatori.aperte, color: 'bg-red-500' },
                    { label: 'In verifica', value: contatori.inVerifica, color: 'bg-yellow-500' },
                    { label: 'Risolte', value: contatori.risolte, color: 'bg-green-500' },
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
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="relative flex-1 min-w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Cerca immobile, locatore, inquilino..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: '2.5rem' }} />
                        </div>
                        <select value={filtroStato} onChange={e => setFiltro(e.target.value)}
                            className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none w-40">
                            <option value="tutti">Tutti gli stati</option>
                            <option value="aperta">Aperta</option>
                            <option value="in verifica">In verifica</option>
                            <option value="risolta">Risolta</option>
                            <option value="chiusa">Chiusa</option>
                        </select>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground px-1">Dal</span>
                            <Input type="date" value={filtroDa} onChange={e => setDa(e.target.value)} className="w-36" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground px-1">Al</span>
                            <Input type="date" value={filtroA} onChange={e => setA(e.target.value)} className="w-36" />
                        </div>
                        {hasFilters && (
                            <Button variant="ghost" size="sm"
                                onClick={() => { setSearch(''); setFiltro('tutti'); setDa(''); setA(''); }}>
                                Azzera
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Tabella */}
            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="border-b border-border bg-muted/40">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data apertura</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Immobile / Mese</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">locatore</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Inquilino</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Motivo</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Apri</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtrate.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Nessuna contestazione trovata.</td></tr>
                            ) : filtrate.map(c => (
                                <tr key={c.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/dashboard/admin/contestazioni/${c.id}`)}>
                                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmt(c.dataApertura)}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-foreground text-xs">{c.immobile}</p>
                                        <p className="text-xs text-muted-foreground">{c.mese}</p>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.locatore.nome}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.inquilino.nome}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.motivo}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_BADGE[c.stato]}`}>
                                            {c.stato}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" className="gap-1">
                                            <Eye className="w-3.5 h-3.5" /> Apri
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
};

// ─── Dettaglio contestazione ───────────────────────────────────────────────────
const DettaglioContestazione = ({ id, contestazioni, setContestazioni }) => {
    const contestazione = contestazioni.find(c => c.id === Number(id));
    const [messaggio, setMessaggio] = useState('');
    const [nota, setNota] = useState(contestazione?.note || '');

    if (!contestazione) return (
        <div className="text-center py-12 text-muted-foreground">Contestazione non trovata.</div>
    );

    const inviaMessaggio = () => {
        if (!messaggio.trim()) return;
        const nuovo = {
            id: Date.now(),
            mittente: 'Admin CRIA',
            testo: messaggio,
            data: new Date().toLocaleString('it-IT'),
            ruolo: 'admin',
        };
        setContestazioni(prev => prev.map(c => c.id === contestazione.id
            ? { ...c, messaggi: [...c.messaggi, nuovo] }
            : c
        ));
        setMessaggio('');
        toast.success('Messaggio inviato a entrambe le parti');
    };

    const cambiaStato = (nuovoStato, esito = null) => {
        setContestazioni(prev => prev.map(c => c.id === contestazione.id
            ? { ...c, stato: nuovoStato, ...(esito ? { esito } : {}) }
            : c
        ));
        toast.success(`Contestazione aggiornata: ${nuovoStato}`);
    };

    const verificaDoc = (docId) => {
        setContestazioni(prev => prev.map(c => c.id === contestazione.id
            ? { ...c, documenti: c.documenti.map(d => d.id === docId ? { ...d, stato: 'verificato' } : d) }
            : c
        ));
        toast.success('Documento verificato');
    };

    const salvaNota = () => {
        setContestazioni(prev => prev.map(c => c.id === contestazione.id ? { ...c, note: nota } : c));
        toast.success('Nota salvata');
    };

    return (
        <div className="space-y-6">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link to="/dashboard/admin/contestazioni">
                    <Button variant="ghost" size="sm" className="gap-1 px-2">
                        <ArrowLeft className="w-4 h-4" /> Contestazioni
                    </Button>
                </Link>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{contestazione.immobile} — {contestazione.mese}</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground">{contestazione.immobile}</h2>
                    <p className="text-sm text-muted-foreground">{contestazione.mese} · Aperta il {fmt(contestazione.dataApertura)}</p>
                    <p className="text-sm text-muted-foreground">Motivo: {contestazione.motivo}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATO_BADGE[contestazione.stato]}`}>
                        {contestazione.stato}
                    </span>
                    {contestazione.esito && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ESITO_BADGE[contestazione.esito]}`}>
                            {contestazione.esito === 'favore_locatore' ? 'A favore locatore' : 'A favore inquilino'}
                        </span>
                    )}
                </div>
            </div>

            {/* Azioni stato */}
            {contestazione.stato !== 'risolta' && contestazione.stato !== 'chiusa' && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Scale className="w-5 h-5" /> Risolvi contestazione
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="outline" className="gap-2"
                                onClick={() => cambiaStato('in verifica')}>
                                <Clock className="w-4 h-4 text-yellow-500" /> Metti in verifica
                            </Button>
                            <Button variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => cambiaStato('risolta', 'favore_locatore')}>
                                <CheckCircle2 className="w-4 h-4" /> Risolvi — favore locatore
                            </Button>
                            <Button variant="outline" className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                                onClick={() => cambiaStato('risolta', 'favore_inquilino')}>
                                <CheckCircle2 className="w-4 h-4" /> Risolvi — favore inquilino
                            </Button>
                            <Button variant="outline" className="gap-2 text-gray-600"
                                onClick={() => cambiaStato('chiusa')}>
                                <XCircle className="w-4 h-4" /> Chiudi senza esito
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Figure coinvolte */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                    { label: 'locatore', persona: contestazione.locatore, icon: Home, color: 'bg-blue-50 border-blue-200' },
                    { label: 'Inquilino', persona: contestazione.inquilino, icon: User, color: 'bg-green-50 border-green-200' },
                    contestazione.avvocato ? { label: 'Avvocato', persona: contestazione.avvocato, icon: Scale, color: 'bg-amber-50 border-amber-200' } : null,
                ].filter(Boolean).map(({ label, persona, icon: Icon, color }) => (
                    <div key={label} className={`p-4 rounded-xl border ${color} space-y-1`}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">{label}</p>
                        <p className="font-semibold text-foreground">{persona.nome}</p>
                        <p className="text-xs text-muted-foreground">{persona.email}</p>
                        {persona.telefono && <p className="text-xs text-muted-foreground">{persona.telefono}</p>}
                    </div>
                ))}
            </div>

            {/* Documenti + Note affiancati */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Documenti */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="w-5 h-5" /> Documenti ({contestazione.documenti.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {contestazione.documenti.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nessun documento caricato.</p>
                        ) : contestazione.documenti.map(doc => (
                            <div key={doc.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{doc.nome}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{doc.caricatoDa} · {fmt(doc.data)}</p>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${DOC_BADGE[doc.stato] || 'bg-gray-100 text-gray-600'}`}>
                                    {doc.stato}
                                </span>
                                {doc.stato === 'da verificare' && (
                                    <Button size="sm" variant="ghost" className="h-7 text-green-600 flex-shrink-0"
                                        onClick={() => verificaDoc(doc.id)}>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Note interne */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="w-5 h-5" /> Note interne
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <textarea value={nota} onChange={e => setNota(e.target.value)} rows={5}
                            placeholder="Aggiungi note interne (non visibili alle parti)..."
                            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <Button size="sm" onClick={salvaNota} className="gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Salva nota
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Thread messaggi */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MessageSquare className="w-5 h-5" /> Comunicazioni
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {contestazione.messaggi.map(m => (
                            <div key={m.id} className={`p-3 rounded-xl text-sm ${MSG_STYLE[m.ruolo] || 'bg-muted'}`}>
                                {m.ruolo !== 'sistema' && (
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-xs">{m.mittente}</span>
                                        <span className="text-xs text-muted-foreground">{m.data}</span>
                                    </div>
                                )}
                                <p className={m.ruolo === 'sistema' ? '' : 'text-foreground'}>{m.testo}</p>
                            </div>
                        ))}
                    </div>

                    {/* Invia messaggio ad entrambi */}
                    {contestazione.stato !== 'chiusa' && (
                        <div className="space-y-2 pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground">Il messaggio verrà inviato via email a locatore e inquilino</p>
                            <div className="flex gap-2">
                                <textarea value={messaggio} onChange={e => setMessaggio(e.target.value)}
                                    placeholder="Scrivi un aggiornamento alle parti..." rows={2}
                                    className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                <Button onClick={inviaMessaggio} className="gap-2 self-end">
                                    <Send className="w-4 h-4" /> Invia
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
};

// ─── Componente principale ─────────────────────────────────────────────────────
const ContestazionePage = () => {
    const { id } = useParams();
    const [contestazioni, setContestazioni] = useState(CONTESTAZIONI_INIZIALI);

    return (
        <>
            <Helmet><title>{id ? 'Dettaglio Contestazione' : 'Contestazioni'} - CRIA Admin</title></Helmet>
            <div className="space-y-6">
                {!id && (
                    <>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground mb-1">Contestazioni</h1>
                            <p className="text-sm text-muted-foreground">Gestisci tutte le contestazioni aperte tra locatori e inquilini</p>
                        </div>
                        <ListaContestazioni contestazioni={contestazioni} />
                    </>
                )}
                {id && (
                    <DettaglioContestazione
                        id={id}
                        contestazioni={contestazioni}
                        setContestazioni={setContestazioni}
                    />
                )}
            </div>
        </>
    );
};

export default ContestazionePage;