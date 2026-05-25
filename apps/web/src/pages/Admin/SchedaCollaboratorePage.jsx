import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ArrowLeft, ChevronRight, User, Shield, Calendar,
    Edit2, Check, X, Eye, EyeOff, Zap, StickyNote,
    Send, UserCog, Briefcase, Scale, Euro, Users,
    MessageSquare, ArrowUpRight, CreditCard, Wallet
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Dati mock ─────────────────────────────────────────────────────────────────
const COLLABORATORI = {
    1: { id: 1, nome: 'Giulia', cognome: 'Rossi', email: 'giulia.rossi@cria.it', telefono: '+39 333 1111001', ruolo: 'manager', stato: 'attivo', createdAt: '2026-01-10', codiceReferente: null, datiPagamento: null },
    2: { id: 2, nome: 'Andrea', cognome: 'Marino', email: 'andrea.marino@cria.it', telefono: '+39 333 1111002', ruolo: 'manager', stato: 'attivo', createdAt: '2026-01-15', codiceReferente: null, datiPagamento: null },
    3: { id: 3, nome: 'Federica', cognome: 'Bruno', email: 'federica.bruno@cria.it', telefono: '+39 333 1111003', ruolo: 'manager', stato: 'sospeso', createdAt: '2026-02-01', codiceReferente: null, datiPagamento: null },
    4: { id: 4, nome: 'Luca', cognome: 'Verdi', email: 'luca.verdi@cria.it', telefono: '+39 347 2222001', ruolo: 'commerciale', stato: 'attivo', createdAt: '2026-01-20', codiceReferente: 'REF-001', datiPagamento: { iban: 'IT60X0542811101000000123456', intestatario: 'Luca Verdi', banca: 'Intesa Sanpaolo', partitaIva: '12345678901' } },
    5: { id: 5, nome: 'Sara', cognome: 'Galli', email: 'sara.galli@cria.it', telefono: '+39 347 2222002', ruolo: 'commerciale', stato: 'attivo', createdAt: '2026-02-05', codiceReferente: 'REF-002', datiPagamento: { iban: 'IT40Y0300203280573605681220', intestatario: 'Sara Galli', banca: 'UniCredit', partitaIva: '98765432100' } },
    8: { id: 8, nome: 'Avv. Paolo', cognome: 'Conti', email: 'p.conti@studioconti.it', telefono: '+39 320 3333001', ruolo: 'avvocato', stato: 'attivo', createdAt: '2026-01-12', codiceReferente: null, datiPagamento: { iban: 'IT28W0300203280000400162854', intestatario: 'Paolo Conti', banca: 'Mediolanum', partitaIva: '33445566778' } },
    9: { id: 9, nome: 'Avv. Maria', cognome: 'Romano', email: 'm.romano@studioromano.it', telefono: '+39 320 3333002', ruolo: 'avvocato', stato: 'attivo', createdAt: '2026-02-20', codiceReferente: null, datiPagamento: { iban: 'IT73P0200802030000001037118', intestatario: 'Maria Romano', banca: 'Monte dei Paschi', partitaIva: '44556677889' } },
};

const STORICO_AZIONI = [
    { id: 1, azione: 'Accesso creato', autore: 'Admin', data: '10/01/2026 09:00' },
    { id: 2, azione: 'Email modificata', autore: 'Admin', data: '15/02/2026 11:30' },
    { id: 3, azione: 'Password reimpostata', autore: 'Admin', data: '01/03/2026 14:00' },
];

const PROVVIGIONI_MOCK = {
    4: {
        maturate: 180, prelevabili: 130, inAttesa: 80, pagate: 340, lista: [
            { id: 1, data: '2026-04-01', cliente: 'Marco Bianchi', prodotto: 'CRIA Gestione', importo: 50, stato: 'maturata' },
            { id: 2, data: '2026-04-05', cliente: 'Giulia Neri', prodotto: 'CRIA Gestione', importo: 50, stato: 'maturata' },
            { id: 3, data: '2026-03-10', cliente: 'Luca Ferrari', prodotto: 'CRIA Gestione', importo: 80, stato: 'in attesa' },
            { id: 4, data: '2026-03-05', cliente: 'Davide Ricci', prodotto: 'CRIA Gestione', importo: 50, stato: 'pagata' },
            { id: 5, data: '2026-03-10', cliente: 'Elena Vitali', prodotto: 'CRIA Completo', importo: 80, stato: 'pagata' },
            { id: 6, data: '2026-02-10', cliente: 'Marco Bianchi', prodotto: 'CRIA Gestione', importo: 50, stato: 'pagata' },
        ]
    },
    5: {
        maturate: 80, prelevabili: 80, inAttesa: 0, pagate: 579, lista: [
            { id: 1, data: '2026-04-02', cliente: 'Sara Conti', prodotto: 'CRIA Completo', importo: 80, stato: 'maturata' },
            { id: 2, data: '2026-02-18', cliente: 'Giorgio Esposito', prodotto: 'CRIA Completo', importo: 80, stato: 'pagata' },
        ]
    },
    8: {
        maturate: 230, prelevabili: 80, inAttesa: 150, pagate: 310, lista: [
            { id: 1, data: '2026-04-01', cliente: 'Marco Bianchi', prodotto: 'CRIA Gestione', importo: 80, stato: 'maturata' },
            { id: 2, data: '2026-04-02', cliente: 'Sara Conti', prodotto: 'CRIA Completo', importo: 150, stato: 'in attesa' },
            { id: 3, data: '2026-03-05', cliente: 'Davide Ricci', prodotto: 'CRIA Gestione', importo: 80, stato: 'pagata' },
        ]
    },
    9: {
        maturate: 0, prelevabili: 0, inAttesa: 0, pagate: 150, lista: [
            { id: 1, data: '2026-03-10', cliente: 'Elena Vitali', prodotto: 'CRIA Completo', importo: 150, stato: 'pagata' },
        ]
    },
};

const CLIENTI_MOCK = {
    4: [
        { id: 1, nome: 'Marco Bianchi', immobile: 'Via Roma 42, Milano', prodotto: 1, stato: 'attiva' },
        { id: 4, nome: 'Giulia Neri', immobile: 'Piazza Navona 23, Roma', prodotto: 1, stato: 'attiva' },
        { id: 3, nome: 'Luca Ferrari', immobile: 'Via Garibaldi 56, Torino', prodotto: 1, stato: 'in verifica' },
    ],
    5: [
        { id: 2, nome: 'Sara Conti', immobile: 'Via Dante 7, Roma', prodotto: 2, stato: 'attiva' },
        { id: 13, nome: 'Giorgio Esposito', immobile: 'Corso Venezia 18, Milano', prodotto: 2, stato: 'attiva' },
    ],
    8: [
        { id: 1, nome: 'Marco Bianchi', immobile: 'Via Roma 42, Milano', prodotto: 1, stato: 'attiva', contestazioni: 1 },
        { id: 2, nome: 'Sara Conti', immobile: 'Via Dante 7, Roma', prodotto: 2, stato: 'in verifica', contestazioni: 2 },
    ],
    9: [
        { id: 11, nome: 'Paolo Gallo', immobile: 'Via Carducci 7, Trieste', prodotto: 1, stato: 'attiva', contestazioni: 0 },
    ],
};

const TICKETS_MOCK = {
    4: [{ id: 1, titolo: 'Problema con segnalazione pagamento', stato: 'aperto', data: '2026-04-01', messaggi: 2 }],
    5: [],
    8: [
        { id: 2, titolo: 'Richiesta documenti aggiuntivi', stato: 'aperto', data: '2026-04-02', messaggi: 1 },
        { id: 4, titolo: 'Chiarimenti contratto di locazione', stato: 'chiuso', data: '2026-03-15', messaggi: 3 },
    ],
    9: [],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) => new Date(d).toLocaleDateString('it-IT');
const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;

const RUOLO_CONFIG = {
    manager: { label: 'Manager', icon: UserCog, badge: 'bg-purple-100 text-purple-800' },
    commerciale: { label: 'Commerciale', icon: Briefcase, badge: 'bg-green-100 text-green-800' },
    avvocato: { label: 'Avvocato', icon: Scale, badge: 'bg-amber-100 text-amber-800' },
};

const STATO_BADGE = { attivo: 'bg-green-100 text-green-800', sospeso: 'bg-red-100 text-red-800' };
const PROVV_BADGE = { maturata: 'bg-blue-100 text-blue-800', 'in attesa': 'bg-yellow-100 text-yellow-800', pagata: 'bg-green-100 text-green-800' };
const PRODOTTO_BADGE = { 1: 'bg-blue-100 text-blue-800', 2: 'bg-purple-100 text-purple-800' };

// ─── Campo editabile inline ───────────────────────────────────────────────────
const CampoEditabile = ({ label, value, onSave, type = 'text' }) => {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value);
    const conferma = () => { onSave(val); setEditing(false); toast.success(`${label} aggiornato`); };
    const annulla = () => { setVal(value); setEditing(false); };
    return (
        <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            {editing ? (
                <div className="flex items-center gap-2">
                    <Input type={type} value={val} onChange={e => setVal(e.target.value)} className="h-8 text-sm" autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') conferma(); if (e.key === 'Escape') annulla(); }} />
                    <button onClick={conferma} className="text-green-600"><Check className="w-4 h-4" /></button>
                    <button onClick={annulla} className="text-red-600"><X className="w-4 h-4" /></button>
                </div>
            ) : (
                <div className="flex items-center gap-2 group">
                    <p className="font-medium text-foreground">{val || '—'}</p>
                    <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const SchedaCollaboratorePage = () => {
    const { id } = useParams();
    const iniziale = COLLABORATORI[Number(id)] || COLLABORATORI[4];

    const [collaboratore, setCollaboratore] = useState(iniziale);
    const [nota, setNota] = useState('');
    const [noteList, setNoteList] = useState([]);
    const [showResetPwd, setShowResetPwd] = useState(false);
    const [nuovaPassword, setNuovaPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);

    const ruoloConf = RUOLO_CONFIG[collaboratore.ruolo];
    const RuoloIcon = ruoloConf.icon;
    const isCommOrAvv = collaboratore.ruolo === 'commerciale' || collaboratore.ruolo === 'avvocato';

    const provv = PROVVIGIONI_MOCK[collaboratore.id] || { maturate: 0, prelevabili: 0, inAttesa: 0, pagate: 0, lista: [] };
    const clienti = CLIENTI_MOCK[collaboratore.id] || [];
    const tickets = TICKETS_MOCK[collaboratore.id] || [];

    const aggiorna = (field, value) => setCollaboratore(prev => ({ ...prev, [field]: value }));
    const toggleStato = () => {
        const nuovo = collaboratore.stato === 'attivo' ? 'sospeso' : 'attivo';
        setCollaboratore(prev => ({ ...prev, stato: nuovo }));
        toast.success(`Accesso ${nuovo === 'attivo' ? 'riattivato' : 'sospeso'}`);
    };
    const resetPassword = () => {
        if (!nuovaPassword.trim()) { toast.error('Inserisci la nuova password'); return; }
        toast.success('Password reimpostata via Edge Function');
        setNuovaPassword(''); setShowResetPwd(false);
    };
    const invioNota = () => {
        if (!nota.trim()) return;
        setNoteList(prev => [{ testo: nota, data: new Date().toLocaleDateString('it-IT'), autore: 'Admin' }, ...prev]);
        setNota('');
    };

    return (
        <>
            <Helmet><title>{`${collaboratore.nome} ${collaboratore.cognome} - Scheda Collaboratore`}</title></Helmet>

            <div className="space-y-6">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/dashboard/admin/collaboratori">
                        <Button variant="ghost" size="sm" className="gap-1 px-2">
                            <ArrowLeft className="w-4 h-4" /> Collaboratori
                        </Button>
                    </Link>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{collaboratore.nome} {collaboratore.cognome}</span>
                </div>

                {/* ── 1. Anagrafica ─────────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between flex-wrap gap-3">
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" /> Anagrafica
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${ruoloConf.badge}`}>
                                    <RuoloIcon className="w-3 h-3" /> {ruoloConf.label}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_BADGE[collaboratore.stato]}`}>
                                    {collaboratore.stato}
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <CampoEditabile label="Nome" value={collaboratore.nome} onSave={v => aggiorna('nome', v)} />
                            <CampoEditabile label="Cognome" value={collaboratore.cognome} onSave={v => aggiorna('cognome', v)} />
                            <CampoEditabile label="Email" value={collaboratore.email} onSave={v => aggiorna('email', v)} type="email" />
                            <CampoEditabile label="Telefono" value={collaboratore.telefono} onSave={v => aggiorna('telefono', v)} type="tel" />
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Data creazione accesso</p>
                                <p className="font-medium text-foreground flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" /> {fmt(collaboratore.createdAt)}
                                </p>
                            </div>
                            {collaboratore.ruolo === 'commerciale' && (
                                <CampoEditabile label="Codice referente" value={collaboratore.codiceReferente || ''}
                                    onSave={v => aggiorna('codiceReferente', v)} />
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ── 2. Contatori provvigioni + clienti (comm/avv) ─────── */}
                {isCommOrAvv && (
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { label: 'Clienti gestiti', value: clienti.length, icon: Users, color: 'bg-blue-500' },
                            { label: 'Provvigioni maturate', value: fmtEur(provv.maturate), icon: Euro, color: 'bg-blue-500' },
                            { label: 'Prelevabili', value: fmtEur(provv.prelevabili), icon: Wallet, color: 'bg-green-500' },
                            { label: 'In attesa verifica', value: fmtEur(provv.inAttesa), icon: Zap, color: 'bg-yellow-500' },
                            { label: 'Totale pagate', value: fmtEur(provv.pagate), icon: Check, color: 'bg-green-600' },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <Card key={label}>
                                <CardContent className="pt-5 pb-4 flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
                                        <Icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold tabular-nums text-foreground">{value}</p>
                                        <p className="text-xs text-muted-foreground">{label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ── 3. Clienti seguiti (comm/avv) ─────────────────────── */}
                {isCommOrAvv && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="w-5 h-5" />
                                {collaboratore.ruolo === 'commerciale' ? 'Clienti acquisiti' : 'Pratiche assegnate'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {clienti.length === 0 ? (
                                <p className="text-sm text-muted-foreground px-4 py-6">Nessun cliente assegnato.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="border-b border-border bg-muted/40">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Cliente</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Immobile</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Prodotto</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                            {collaboratore.ruolo === 'avvocato' && (
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Contestazioni</th>
                                            )}
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Scheda</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {clienti.map((c) => (
                                            <tr key={c.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3 font-medium text-foreground">{c.nome}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{c.immobile}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_BADGE[c.prodotto]}`}>
                                                        P{c.prodotto}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.stato === 'attiva' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>{c.stato}</span>
                                                </td>
                                                {collaboratore.ruolo === 'avvocato' && (
                                                    <td className="px-4 py-3">
                                                        {c.contestazioni > 0
                                                            ? <span className="text-sm font-medium text-red-600">{c.contestazioni} aperte</span>
                                                            : <span className="text-sm text-muted-foreground">—</span>}
                                                    </td>
                                                )}
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
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ── 4. Provvigioni (comm/avv) ──────────────────────────── */}
                {isCommOrAvv && provv.lista.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Euro className="w-5 h-5" /> Provvigioni e compensi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Prodotto</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Importo</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {provv.lista.map((p) => (
                                        <tr key={p.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmt(p.data)}</td>
                                            <td className="px-4 py-3 font-medium text-foreground">{p.cliente}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{p.prodotto}</td>
                                            <td className="px-4 py-3 font-semibold tabular-nums text-foreground">{fmtEur(p.importo)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PROVV_BADGE[p.stato] || 'bg-gray-100 text-gray-700'}`}>
                                                    {p.stato}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                )}

                {/* ── 5. Ticket assistenza (tutta pagina) ───────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MessageSquare className="w-5 h-5" /> Ticket assistenza
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {tickets.length === 0 ? (
                            <p className="text-sm text-muted-foreground px-4 py-6">Nessun ticket registrato.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Titolo</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Messaggi</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Apri</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {tickets.map((t) => (
                                        <tr key={t.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmt(t.data)}</td>
                                            <td className="px-4 py-3 font-medium text-foreground">{t.titolo}</td>
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums">{t.messaggi}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.stato === 'aperto' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                                                    }`}>{t.stato}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link to="/dashboard/admin/assistenza">
                                                    <Button variant="ghost" size="sm">Apri</Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

                {/* ── 6. Sicurezza accesso + Note interne affiancati ─────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Shield className="w-5 h-5" /> Sicurezza accesso
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <Button variant="outline"
                                    className={collaboratore.stato === 'attivo' ? 'text-red-600 border-red-200 hover:bg-red-50 gap-2' : 'text-green-600 border-green-200 hover:bg-green-50 gap-2'}
                                    onClick={toggleStato}>
                                    {collaboratore.stato === 'attivo' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                    {collaboratore.stato === 'attivo' ? 'Sospendi accesso' : 'Riattiva accesso'}
                                </Button>
                                <Button variant="outline" className="gap-2" onClick={() => setShowResetPwd(s => !s)}>
                                    <Zap className="w-4 h-4 text-yellow-500" /> Reimposta password
                                </Button>
                            </div>
                            {showResetPwd && (
                                <div className="p-4 bg-muted/40 rounded-lg space-y-3">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Zap className="w-3 h-3 text-yellow-500" /> Azione via Edge Function
                                    </p>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input type={showPwd ? 'text' : 'password'} placeholder="Nuova password..."
                                                value={nuovaPassword} onChange={e => setNuovaPassword(e.target.value)}
                                                style={{ paddingRight: '2.5rem' }} />
                                            <button type="button" onClick={() => setShowPwd(s => !s)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <Button onClick={resetPassword} className="gap-2">
                                            <Zap className="w-4 h-4" /> Conferma
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <StickyNote className="w-5 h-5" /> Note interne
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <textarea value={nota} onChange={e => setNota(e.target.value)}
                                    placeholder="Scrivi una nota interna..." rows={2}
                                    className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                <Button onClick={invioNota} size="sm" className="gap-2 self-end">
                                    <Send className="w-4 h-4" /> Salva
                                </Button>
                            </div>
                            {noteList.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Nessuna nota presente.</p>
                            ) : (
                                <div className="space-y-3">
                                    {noteList.map((n, i) => (
                                        <div key={i} className="p-3 bg-muted/40 rounded-lg">
                                            <p className="text-sm text-foreground">{n.testo}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{n.autore} — {n.data}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>

                {/* ── 7. Dati pagamento + Storico azioni (comm/avv) ─────── */}
                {isCommOrAvv && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <CreditCard className="w-5 h-5" /> Dati pagamento
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-5">
                                    <CampoEditabile label="IBAN" value={collaboratore.datiPagamento?.iban || ''} onSave={v => aggiorna('datiPagamento', { ...collaboratore.datiPagamento, iban: v })} />
                                    <CampoEditabile label="Intestatario" value={collaboratore.datiPagamento?.intestatario || ''} onSave={v => aggiorna('datiPagamento', { ...collaboratore.datiPagamento, intestatario: v })} />
                                    <CampoEditabile label="Banca" value={collaboratore.datiPagamento?.banca || ''} onSave={v => aggiorna('datiPagamento', { ...collaboratore.datiPagamento, banca: v })} />
                                    <CampoEditabile label="P.IVA / Cod. Fisc" value={collaboratore.datiPagamento?.partitaIva || ''} onSave={v => aggiorna('datiPagamento', { ...collaboratore.datiPagamento, partitaIva: v })} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Calendar className="w-5 h-5" /> Storico azioni
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {STORICO_AZIONI.map((s) => (
                                        <div key={s.id} className="flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm text-foreground">{s.azione}</p>
                                                <p className="text-xs text-muted-foreground">{s.autore} — {s.data}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Storico azioni per manager (standalone) */}
                {!isCommOrAvv && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Calendar className="w-5 h-5" /> Storico azioni
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {STORICO_AZIONI.map((s) => (
                                    <div key={s.id} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-foreground">{s.azione}</p>
                                            <p className="text-xs text-muted-foreground">{s.autore} — {s.data}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

            </div>
        </>
    );
};

export default SchedaCollaboratorePage;