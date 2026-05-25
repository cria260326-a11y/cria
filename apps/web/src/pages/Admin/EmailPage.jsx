import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Mail, Search, Filter, X, AlertCircle, Loader2,
    CheckCircle2, XCircle, Clock, Eye, AlertTriangle,
    Send, ChevronLeft, ChevronRight, RefreshCw,
    Inbox, MailPlus, Users, Check, FileText, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 30;

// ─── Mock email log ────────────────────────────────────────────────────────────
const EMAIL_LOG_MOCK = [
    { id: 1, to_email: 'marco.bianchi@email.it', from_email: 'noreply@cria.it', subject: 'Conferma registrazione CRIA', tipo: 'registrazione', origine: 'auth-signup', stato: 'delivered', created_at: '2026-05-04T09:30:00', to_user_id: 'u-1' },
    { id: 2, to_email: 'sofia.martini@email.it', from_email: 'noreply@cria.it', subject: 'Preventivo CRIA Gestione', tipo: 'preventivo', origine: 'admin-quote', stato: 'opened', created_at: '2026-05-04T08:15:00', to_user_id: 'u-2' },
    { id: 3, to_email: 'luca.romano@email.it', from_email: 'noreply@cria.it', subject: 'Pagamento ricevuto - Aprile 2026', tipo: 'pagamento', origine: 'stripe-webhook', stato: 'delivered', created_at: '2026-05-03T18:00:00', to_user_id: 'u-3' },
    { id: 4, to_email: 'elena.greco@email.it', from_email: 'noreply@cria.it', subject: 'Nuova segnalazione mancato pagamento', tipo: 'segnalazione', origine: 'segnalazione-cron', stato: 'sent', created_at: '2026-05-03T11:42:00', to_user_id: 'u-4' },
    { id: 5, to_email: 'old@deleted.com', from_email: 'noreply@cria.it', subject: 'Recupero password', tipo: 'reset_password', origine: 'auth-recover', stato: 'bounced', created_at: '2026-05-03T10:00:00' },
    { id: 6, to_email: 'paolo.conti@studioconti.it', from_email: 'noreply@cria.it', subject: 'Nuova contestazione assegnata', tipo: 'contestazione', origine: 'contestazione-assign', stato: 'opened', created_at: '2026-05-02T16:30:00', to_user_id: 'u-5' },
    { id: 7, to_email: 'sara.conti@email.it', from_email: 'noreply@cria.it', subject: 'Documenti verificati', tipo: 'documenti', origine: 'admin-doc-verify', stato: 'delivered', created_at: '2026-05-02T14:00:00', to_user_id: 'u-6' },
    { id: 8, to_email: 'commerciale@cria.it', from_email: 'noreply@cria.it', subject: 'Provvigioni Aprile disponibili', tipo: 'provvigione', origine: 'cron-mensile', stato: 'opened', created_at: '2026-05-01T09:00:00', to_user_id: 'u-7' },
    { id: 9, to_email: 'invalido@@@nope', from_email: 'noreply@cria.it', subject: 'Onboarding completato', tipo: 'onboarding', origine: 'onboarding-complete', stato: 'failed', created_at: '2026-04-30T17:20:00' },
    { id: 10, to_email: 'cliente@email.it', from_email: 'noreply@cria.it', subject: 'Esito CRIA Verifica', tipo: 'verifica_p3', origine: 'verifica-complete', stato: 'delivered', created_at: '2026-04-29T11:00:00', to_user_id: 'u-8' },
];

const TEMPLATES_MOCK = [
    { alias: 'newsletter_mensile', name: 'Newsletter mensile', subject: 'Le novità di {{mese}} su CRIA' },
    { alias: 'promo_estiva', name: 'Promo estate', subject: 'Offerta speciale per te, {{nome}}' },
    { alias: 'reminder_documenti', name: 'Reminder documenti', subject: 'Documenti mancanti per la tua pratica' },
    { alias: 'aggiornamento_servizio', name: 'Aggiornamento servizio', subject: 'Aggiornamento importante per il tuo servizio' },
];

const UTENTI_MOCK = [
    { id: 'u-1', nome: 'Marco', cognome: 'Bianchi', email: 'marco.bianchi@email.it', role: 'locatore', verificata: true, display_nome: 'Marco Bianchi' },
    { id: 'u-2', nome: 'Sofia', cognome: 'Martini', email: 'sofia.martini@email.it', role: 'inquilino', verificata: true, display_nome: 'Sofia Martini' },
    { id: 'u-3', nome: 'Luca', cognome: 'Romano', email: 'luca.romano@email.it', role: 'inquilino', verificata: true, display_nome: 'Luca Romano' },
    { id: 'u-4', nome: 'Elena', cognome: 'Greco', email: 'elena.greco@email.it', role: 'inquilino', verificata: false, display_nome: 'Elena Greco' },
    { id: 'u-5', nome: 'Paolo', cognome: 'Conti', email: 'paolo.conti@studioconti.it', role: 'avvocato', verificata: true, display_nome: 'Avv. Paolo Conti' },
    { id: 'u-6', nome: 'Sara', cognome: 'Conti', email: 'sara.conti@email.it', role: 'locatore', verificata: true, display_nome: 'Sara Conti' },
    { id: 'u-7', nome: 'Roberto', cognome: 'Bruno', email: 'commerciale@cria.it', role: 'commerciale', verificata: true, display_nome: 'Roberto Bruno' },
    { id: 'u-8', nome: 'Giulia', cognome: 'Esposito', email: 'cliente@email.it', role: 'cliente', verificata: true, display_nome: 'Giulia Esposito' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const STATO_CONFIG = {
    queued: { label: 'In coda', color: 'bg-gray-100 text-gray-800', icon: Clock },
    sent: { label: 'Inviata', color: 'bg-blue-100 text-blue-800', icon: Send },
    delivered: { label: 'Consegnata', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    opened: { label: 'Aperta', color: 'bg-emerald-100 text-emerald-800', icon: Eye },
    bounced: { label: 'Rimbalzata', color: 'bg-amber-100 text-amber-800', icon: AlertTriangle },
    spam: { label: 'Spam', color: 'bg-red-100 text-red-800', icon: XCircle },
    failed: { label: 'Fallita', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const fmtDateTime = (iso) => !iso ? '—' :
    new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Modal dettaglio ───────────────────────────────────────────────────────────
const ModalDettaglio = ({ mail, onClose }) => {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const sc = STATO_CONFIG[mail.stato] || STATO_CONFIG.queued;
    const Icon = sc.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
            <div className="bg-card border border-border rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
                onClick={e => e.stopPropagation()}>

                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <p className="font-semibold text-foreground">Dettaglio email</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                        <Icon className="w-3 h-3" /> {sc.label}
                    </span>

                    {[
                        { label: 'Destinatario', value: mail.to_email, linkUser: mail.to_user_id },
                        { label: 'Mittente', value: mail.from_email },
                        { label: 'Oggetto', value: mail.subject },
                        { label: 'Tipo', value: mail.tipo },
                        { label: 'Origine', value: mail.origine },
                        { label: 'Inviata il', value: fmtDateTime(mail.created_at) },
                    ].filter(r => r.value).map(r => (
                        <div key={r.label} className="bg-muted/40 rounded-lg p-3 space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">{r.label}</p>
                            <p className="text-sm text-foreground">{r.value}</p>
                            {r.linkUser && (
                                <button className="text-xs text-primary hover:underline flex items-center gap-1">
                                    Apri profilo utente <ArrowRight className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="px-6 py-4 border-t border-border flex justify-end">
                    <Button onClick={onClose} variant="outline">Chiudi</Button>
                </div>
            </div>
        </div>
    );
};

// ─── Tab Storico ───────────────────────────────────────────────────────────────
const TabStorico = () => {
    const [search, setSearch] = useState('');
    const [filtroData, setFiltroData] = useState('30gg');
    const [filtroStato, setFiltroStato] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroOrigine, setFiltroOrigine] = useState('');
    const [pagina, setPagina] = useState(0);
    const [selezionata, setSelezionata] = useState(null);
    const [loading, setLoading] = useState(false);

    const tipiDisponibili = useMemo(() => [...new Set(EMAIL_LOG_MOCK.map(m => m.tipo).filter(Boolean))], []);
    const originiDisponibili = useMemo(() => [...new Set(EMAIL_LOG_MOCK.map(m => m.origine).filter(Boolean))], []);

    const filtrate = useMemo(() => {
        let list = [...EMAIL_LOG_MOCK];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(m => m.to_email.toLowerCase().includes(q) || (m.subject || '').toLowerCase().includes(q));
        }
        if (filtroStato) list = list.filter(m => m.stato === filtroStato);
        if (filtroTipo) list = list.filter(m => m.tipo === filtroTipo);
        if (filtroOrigine) list = list.filter(m => m.origine === filtroOrigine);

        if (filtroData !== 'tutti') {
            const giorni = filtroData === '7gg' ? 7 : filtroData === '30gg' ? 30 : 90;
            const cutoff = new Date(Date.now() - giorni * 86400000);
            list = list.filter(m => new Date(m.created_at) >= cutoff);
        }
        return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [search, filtroData, filtroStato, filtroTipo, filtroOrigine]);

    const totale = filtrate.length;
    const totalePagine = Math.max(1, Math.ceil(totale / PAGE_SIZE));
    const visibili = filtrate.slice(pagina * PAGE_SIZE, (pagina + 1) * PAGE_SIZE);

    const filtriAttivi = search || filtroStato || filtroTipo || filtroOrigine || filtroData !== '30gg';

    const reset = () => {
        setSearch(''); setFiltroStato(''); setFiltroTipo(''); setFiltroOrigine(''); setFiltroData('30gg'); setPagina(0);
    };

    return (
        <div className="space-y-4">

            {/* Filtri */}
            <Card>
                <CardContent className="pt-4 pb-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Cerca per destinatario o oggetto..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }} />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Filter className="w-3.5 h-3.5" />
                            <span className="text-xs uppercase tracking-wider">Filtri</span>
                        </div>

                        <select value={filtroData} onChange={e => setFiltroData(e.target.value)}
                            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none">
                            <option value="7gg">Ultimi 7 giorni</option>
                            <option value="30gg">Ultimi 30 giorni</option>
                            <option value="90gg">Ultimi 90 giorni</option>
                            <option value="tutti">Tutti</option>
                        </select>

                        <select value={filtroStato} onChange={e => setFiltroStato(e.target.value)}
                            className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none">
                            <option value="">Tutti gli stati</option>
                            {Object.entries(STATO_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                        </select>

                        {tipiDisponibili.length > 0 && (
                            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none">
                                <option value="">Tutti i tipi</option>
                                {tipiDisponibili.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        )}

                        {originiDisponibili.length > 0 && (
                            <select value={filtroOrigine} onChange={e => setFiltroOrigine(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none">
                                <option value="">Tutte le origini</option>
                                {originiDisponibili.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        )}

                        {filtriAttivi && (
                            <Button variant="ghost" size="sm" onClick={reset} className="gap-1 text-red-600">
                                <X className="w-3.5 h-3.5" /> Reset
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Tabella */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : visibili.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Mail className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Nessuna email trovata</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            {filtriAttivi ? 'Prova a rimuovere alcuni filtri' : 'Le email inviate dalla piattaforma compariranno qui'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <p className="text-xs text-muted-foreground">
                        {totale} email totali · pagina {pagina + 1} di {totalePagine}
                    </p>

                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        {['Stato', 'Destinatario', 'Oggetto', 'Tipo', 'Origine', 'Inviata il', ''].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {visibili.map(m => {
                                        const sc = STATO_CONFIG[m.stato] || STATO_CONFIG.queued;
                                        return (
                                            <tr key={m.id} onClick={() => setSelezionata(m)}
                                                className="hover:bg-muted/30 cursor-pointer">
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                                                        {sc.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-foreground truncate max-w-[200px]">{m.to_email}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-muted-foreground truncate max-w-[260px]">{m.subject || '—'}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {m.tipo
                                                        ? <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded uppercase">{m.tipo}</span>
                                                        : <span className="text-xs text-muted-foreground/60">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{m.origine || '—'}</td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap">{fmtDateTime(m.created_at)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 inline" />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {totalePagine > 1 && (
                        <div className="flex items-center justify-between">
                            <Button variant="outline" size="sm" onClick={() => setPagina(p => Math.max(0, p - 1))}
                                disabled={pagina === 0} className="gap-1.5">
                                <ChevronLeft className="w-3.5 h-3.5" /> Precedente
                            </Button>
                            <p className="text-xs text-muted-foreground">Pagina {pagina + 1} di {totalePagine}</p>
                            <Button variant="outline" size="sm" onClick={() => setPagina(p => Math.min(totalePagine - 1, p + 1))}
                                disabled={pagina >= totalePagine - 1} className="gap-1.5">
                                Successiva <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    )}
                </>
            )}

            {selezionata && <ModalDettaglio mail={selezionata} onClose={() => setSelezionata(null)} />}
        </div>
    );
};

// ─── Tab Invia ─────────────────────────────────────────────────────────────────
const TabInvia = () => {
    const [templateAlias, setTemplateAlias] = useState('');
    const [filtroRole, setFiltroRole] = useState('');
    const [soloVerificate, setSoloVerificate] = useState(true);
    const [searchUtenti, setSearchUtenti] = useState('');
    const [utenti, setUtenti] = useState([]);
    const [caricato, setCaricato] = useState(false);
    const [selezionati, setSelezionati] = useState(new Set());
    const [replyTo, setReplyTo] = useState('');
    const [tipoLog, setTipoLog] = useState('newsletter');
    const [inviando, setInviando] = useState(false);
    const [risultato, setRisultato] = useState(null);

    const templateScelto = TEMPLATES_MOCK.find(t => t.alias === templateAlias);

    const caricaUtenti = () => {
        let list = [...UTENTI_MOCK];
        if (filtroRole) list = list.filter(u => u.role === filtroRole);
        if (soloVerificate) list = list.filter(u => u.verificata);
        if (searchUtenti.trim()) {
            const q = searchUtenti.toLowerCase();
            list = list.filter(u => u.email.toLowerCase().includes(q) || u.display_nome.toLowerCase().includes(q));
        }
        setUtenti(list);
        setSelezionati(new Set());
        setCaricato(true);
        toast.success(`${list.length} destinatari caricati`);
    };

    const toggleSel = (id) => {
        setSelezionati(prev => {
            const n = new Set(prev);
            if (n.has(id)) n.delete(id); else n.add(id);
            return n;
        });
    };

    const selezionaTutti = () => {
        setSelezionati(selezionati.size === utenti.length ? new Set() : new Set(utenti.map(u => u.id)));
    };

    const invia = () => {
        if (!templateAlias) { toast.error('Seleziona un template'); return; }
        if (selezionati.size === 0) { toast.error('Seleziona almeno un destinatario'); return; }
        if (!confirm(`Inviare email a ${selezionati.size} destinatari?`)) return;

        setInviando(true); setRisultato(null);
        // Simulazione invio
        setTimeout(() => {
            const ok = Math.floor(selezionati.size * 0.95);
            const ko = selezionati.size - ok;
            setRisultato({ ok, ko });
            setInviando(false);
            if (ko === 0) {
                toast.success(`${ok} email inviate con successo`);
                setSelezionati(new Set());
            } else {
                toast.error(`${ko} email fallite, ${ok} inviate`);
            }
        }, 1500);
    };

    const StepHeader = ({ num, label }) => (
        <div className="flex items-center gap-2">
            <span className="w-7 h-7 flex items-center justify-center bg-primary/10 border border-primary/30 text-primary rounded-full font-bold text-xs">{num}</span>
            <p className="font-semibold text-foreground">{label}</p>
        </div>
    );

    return (
        <div className="space-y-5">

            {/* Step 1 */}
            <Card>
                <CardContent className="pt-5 space-y-3">
                    <StepHeader num={1} label="Scegli il template" />
                    <select value={templateAlias} onChange={e => setTemplateAlias(e.target.value)}
                        className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">— Seleziona un template —</option>
                        {TEMPLATES_MOCK.map(t => (
                            <option key={t.alias} value={t.alias}>{t.name} ({t.alias})</option>
                        ))}
                    </select>
                    {templateScelto && (
                        <div className="bg-muted/40 rounded-lg p-3 space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">Oggetto</p>
                            <p className="text-sm text-foreground">{templateScelto.subject}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
                <CardContent className="pt-5 space-y-4">
                    <StepHeader num={2} label="Filtra destinatari" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs">Ruolo</Label>
                            <select value={filtroRole} onChange={e => setFiltroRole(e.target.value)}
                                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none mt-1">
                                <option value="">Tutti</option>
                                <option value="locatore">locatori</option>
                                <option value="inquilino">Inquilini</option>
                                <option value="cliente">Clienti</option>
                                <option value="avvocato">Avvocati</option>
                                <option value="commerciale">Commerciali</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs">Cerca per nome/email</Label>
                            <Input value={searchUtenti} onChange={e => setSearchUtenti(e.target.value)}
                                placeholder="Nome o email..." className="mt-1" />
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={soloVerificate} onChange={e => setSoloVerificate(e.target.checked)} />
                        <span className="text-sm text-foreground">Solo email verificate (raccomandato)</span>
                    </label>

                    <Button onClick={caricaUtenti} className="gap-2">
                        <Users className="w-4 h-4" /> Carica destinatari
                    </Button>
                </CardContent>
            </Card>

            {/* Step 3 */}
            {caricato && (
                <Card>
                    <CardContent className="pt-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <StepHeader num={3} label="Seleziona destinatari" />
                            <p className="text-xs text-muted-foreground">
                                <strong className="text-primary">{selezionati.size}</strong> di {utenti.length} selezionati
                            </p>
                        </div>

                        {utenti.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={selezionaTutti} className="text-primary">
                                {selezionati.size === utenti.length ? 'Deseleziona tutti' : 'Seleziona tutti'}
                            </Button>
                        )}

                        <div className="border border-border rounded-lg max-h-96 overflow-y-auto">
                            {utenti.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">Nessun destinatario corrisponde ai filtri</p>
                            ) : utenti.map(u => {
                                const sel = selezionati.has(u.id);
                                return (
                                    <button key={u.id} onClick={() => toggleSel(u.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0 hover:bg-muted/40 text-left ${sel ? 'bg-primary/5' : ''}`}>
                                        <div className={`w-4 h-4 border-2 rounded flex items-center justify-center flex-shrink-0 ${sel ? 'bg-primary border-primary' : 'border-border'}`}>
                                            {sel && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-foreground truncate">{u.display_nome}</p>
                                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                        </div>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize flex-shrink-0">
                                            {u.role}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 4 */}
            {caricato && utenti.length > 0 && (
                <Card>
                    <CardContent className="pt-5 space-y-4">
                        <StepHeader num={4} label="Opzioni e invio" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label className="text-xs">Tipo (per il log)</Label>
                                <Input value={tipoLog} onChange={e => setTipoLog(e.target.value)}
                                    placeholder="es. newsletter, promo_estate" className="mt-1" />
                                <p className="text-xs text-muted-foreground mt-1">Etichetta per ritrovare l'invio nello storico</p>
                            </div>
                            <div>
                                <Label className="text-xs">Reply-To (opzionale)</Label>
                                <Input type="email" value={replyTo} onChange={e => setReplyTo(e.target.value)}
                                    placeholder="info@cria.it" className="mt-1" />
                                <p className="text-xs text-muted-foreground mt-1">Le risposte arriveranno a questo indirizzo</p>
                            </div>
                        </div>

                        {risultato && (
                            <div className={`p-4 rounded-lg border ${risultato.ko === 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                                <p className={`text-sm font-medium ${risultato.ko === 0 ? 'text-green-700' : 'text-amber-700'}`}>
                                    Inviate: {risultato.ok} · Fallite: {risultato.ko}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Vai allo storico per vedere lo stato di consegna in tempo reale.
                                </p>
                            </div>
                        )}

                        <Button onClick={invia} disabled={inviando || !templateAlias || selezionati.size === 0} className="gap-2">
                            {inviando
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Invio in corso...</>
                                : <><Send className="w-4 h-4" /> Invia a {selezionati.size} destinatari</>}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const EmailPage = () => {
    const [tab, setTab] = useState('storico');

    const TABS = [
        { id: 'storico', label: 'Storico', icon: Inbox },
        { id: 'invia', label: 'Invia email', icon: MailPlus },
    ];

    return (
        <>
            <Helmet><title>Email - CRIA Admin</title></Helmet>

            <div className="space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Email transazionali</h1>
                    <p className="text-sm text-muted-foreground">Storico delle email e composer per invii batch ai destinatari filtrati</p>
                </div>

                <div className="flex gap-1 border-b border-border overflow-x-auto">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}>
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>

                {tab === 'storico' && <TabStorico />}
                {tab === 'invia' && <TabInvia />}

            </div>
        </>
    );
};

export default EmailPage;