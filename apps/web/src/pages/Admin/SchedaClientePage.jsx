import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PaymentTimeline from '@/components/PaymentTimeline.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';
import {
    User, FileText, CreditCard, AlertTriangle,
    StickyNote, ArrowLeft, Phone, Mail, ClipboardList,
    Calendar, Send, Home, CheckCircle2,
    XCircle, Eye, Download, MessageSquare, ChevronRight,
    Pencil, Check, X as XIcon, Package, ShoppingBag, Mailbox
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Dati mock ─────────────────────────────────────────────────────────────────
// I clienti coprono i 4 ruoli: user, locatore, inquilino, cliente
const CLIENTI_INIZIALI = {
    1: {
        id: 1, nome: 'Marco', cognome: 'Bianchi', email: 'marco.bianchi@email.it', telefono: '+39 333 1234567',
        createdAt: '2026-03-15', ruolo: 'locatore', tipoAccount: 'privato',
        codiceFiscale: 'BNCMRC85M12F205Z', indirizzoResidenza: 'Via Garibaldi 12, Milano',
        statoOnboarding: 'documenti_in_verifica',
        prodottiAcquistati: ['p4', 'p1'],   // ha comprato P4 (consulenza) per attivare onboarding + P1
        prodottiAttivi: ['p1'],              // P4 consumato, P1 attivo
        reputazione: null,
    },
    2: {
        id: 2, nome: 'Luca', cognome: 'Ferrari', email: 'luca.ferrari@email.it', telefono: '+39 320 3456789',
        createdAt: '2026-02-10', ruolo: 'inquilino',
        codiceFiscale: 'FRRLCU88A01H501P', indirizzoResidenza: 'Via Roma 42, Milano',
        statoOnboarding: null,
        prodottiAcquistati: [],
        prodottiAttivi: [],
        reputazione: 'verde',
        locatoreRiferimento: { id: 1, nome: 'Marco Bianchi' },
        contrattoProdotto: 2,  // inquilino di un P2 → CRIA gestisce pagamenti
    },
    3: {
        id: 3, nome: 'Giulia', cognome: 'Neri', email: 'giulia.neri@email.it', telefono: '+39 366 4567890',
        createdAt: '2026-03-22', ruolo: 'cliente',
        codiceFiscale: 'NRIGLL92C41H501T', indirizzoResidenza: 'Corso Buenos Aires 15, Milano',
        statoOnboarding: null,
        prodottiAcquistati: ['p3'],
        prodottiAttivi: [],
        reputazione: null,
    },
    4: {
        // User: solo dati registrazione, nessun onboarding, nessun acquisto
        id: 4, nome: 'Stefano', cognome: 'Bruno', email: 'stefano.bruno@email.it', telefono: '+39 320 5678904',
        createdAt: '2026-03-28', ruolo: 'user',
        codiceFiscale: null, indirizzoResidenza: null,
        statoOnboarding: null,
        prodottiAcquistati: [],
        prodottiAttivi: [],
        reputazione: null,
    },
};

const IMMOBILI_PER_CLIENTE = {
    1: [
        {
            id: 1, prodotto: 1, address: 'Via Roma 42', city: 'Milano', tenant: 'Sofia Martini', monthlyRent: '1.200',
            startDate: '01/01/2026', endDate: '31/12/2026', status: 'verde',
            payments: [{ month: 0, paid: true, day: 3 }, { month: 1, paid: true, day: 5 }, { month: 2, paid: true, day: 4 }]
        },
    ],
    2: [
        {
            id: 3, prodotto: 2, address: 'Via Roma 42', city: 'Milano', landlord: 'Marco Bianchi', monthlyRent: '1.200',
            startDate: '01/01/2026', endDate: '31/12/2026', status: 'verde',
            criaPayments: [{ month: 0, paid: true, day: 5 }, { month: 1, paid: true, day: 5 }],
            tenantPayments: [{ month: 0, paid: true, day: 3 }, { month: 1, paid: true, day: 4 }]
        },
    ],
    3: [],
    4: [],
};

const DOCUMENTI_INIZIALI = {
    1: [
        { id: 1, nome: 'Documento identità.pdf', tipo: 'Identità', stato: 'verificato', data: '2026-03-16' },
        { id: 2, nome: 'Codice fiscale.pdf', tipo: 'Identità', stato: 'verificato', data: '2026-03-16' },
        { id: 3, nome: 'Visura catastale.pdf', tipo: 'Catasto', stato: 'da verificare', data: '2026-03-20' },
        { id: 4, nome: 'Contratto di locazione.pdf', tipo: 'Contratto', stato: 'da verificare', data: '2026-03-20' },
    ],
    2: [
        { id: 1, nome: 'Documento identità.pdf', tipo: 'Identità', stato: 'verificato', data: '2026-02-12' },
    ],
    3: [
        { id: 1, nome: 'Documento identità.pdf', tipo: 'Identità', stato: 'verificato', data: '2026-03-23' },
        { id: 2, nome: 'Dati persona verificata.pdf', tipo: 'Verifica', stato: 'verificato', data: '2026-03-23' },
    ],
    4: [],
};

const ACQUISTI = {
    1: [
        { id: 1, data: '2026-03-15', tipo: 'Acquisto prodotto', descrizione: 'CRIA Consulenza (P4) - abilitazione onboarding', metodo: 'Stripe', importo: '€  29,00', stato: 'pagata' },
        { id: 2, data: '2026-04-01', tipo: 'Canone mensile', descrizione: 'Canone mensile Aprile 2026 - CRIA Gestione', metodo: 'Bonifico', importo: '€  49,00', stato: 'in attesa' },
    ],
    2: [],
    3: [
        { id: 1, data: '2026-03-22', tipo: 'Acquisto prodotto', descrizione: 'CRIA Verifica', metodo: 'Stripe', importo: '€  49,00', stato: 'pagata' },
    ],
    4: [],
};

const CONTESTAZIONI = {
    1: [{ id: 1, immobile: 'Via Roma 42, Milano', mese: 'Novembre 2025', stato: 'risolta', data: '2025-11-18', descrizione: 'Inquilino contesta mancato pagamento segnalato dal locatore.' }],
    2: [],
    3: [],
    4: [],
};

const TICKETS_CLIENTE = {
    1: [{ id: 1, titolo: 'Problema con segnalazione pagamento', stato: 'aperto', data: '2026-04-01', messaggi: 2 }],
    2: [],
    3: [],
    4: [],
};

const NOTE_INIZIALI = {
    1: [{ testo: 'Cliente ha richiesto supporto per caricamento documenti.', data: '2026-03-16', autore: 'Admin' }],
    2: [],
    3: [],
    4: [],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('it-IT') : '—';

// Stati onboarding allineati al modello dati
const STATO_ONBOARDING = {
    'non_avviato': { label: 'Non avviato', class: 'bg-gray-100 text-gray-700' },
    'in_corso': { label: 'In corso', class: 'bg-blue-100 text-blue-800' },
    'documenti_in_verifica': { label: 'Documenti in verifica', class: 'bg-yellow-100 text-yellow-800' },
    'documenti_da_integrare': { label: 'Documenti da integrare', class: 'bg-orange-100 text-orange-800' },
    'documenti_verificati': { label: 'Documenti verificati', class: 'bg-blue-100 text-blue-800' },
    'preventivo_inviato': { label: 'Preventivo inviato', class: 'bg-purple-100 text-purple-800' },
    'pagato_e_attivo': { label: 'Pagato e attivo', class: 'bg-green-100 text-green-800' },
};

const STATO_DOC = { 'verificato': 'bg-green-100 text-green-800', 'da verificare': 'bg-yellow-100 text-yellow-800', 'mancante': 'bg-red-100 text-red-800' };

const PRODOTTO_INFO = {
    p1: { label: 'CRIA Gestione (P1)', class: 'bg-blue-100 text-blue-800' },
    p2: { label: 'CRIA Completo (P2)', class: 'bg-purple-100 text-purple-800' },
    p3: { label: 'CRIA Verifica (P3)', class: 'bg-amber-100 text-amber-800' },
    p4: { label: 'Consulenza (P4)', class: 'bg-rose-100 text-rose-800' },
};

const RUOLO_BADGE = {
    user: 'bg-gray-100 text-gray-600',
    locatore: 'bg-blue-100 text-blue-800',
    inquilino: 'bg-green-100 text-green-800',
    cliente: 'bg-amber-100 text-amber-800',
};

const REP_CONFIG = {
    verde: { badge: 'bg-green-100 text-green-800', label: 'Regolare' },
    giallo: { badge: 'bg-yellow-100 text-yellow-800', label: 'In ritardo' },
    rosso: { badge: 'bg-red-100 text-red-800', label: 'Irregolare' },
};

// ─── Riga anagrafica con edit inline ──────────────────────────────────────────
const FieldRow = ({ icon: Icon, label, value, editable, onSave, placeholder = 'Non compilato' }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value || '');

    const startEdit = () => {
        setDraft(value || '');
        setEditing(true);
    };

    const cancelEdit = () => {
        setDraft(value || '');
        setEditing(false);
    };

    const confirmEdit = () => {
        const trimmed = draft.trim();
        onSave(trimmed || null);
        setEditing(false);
        toast.success(`${label} aggiornato`);
    };

    return (
        <div className="group">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            {editing ? (
                <div className="flex gap-2">
                    <Input
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        autoFocus
                        onKeyDown={e => {
                            if (e.key === 'Enter') confirmEdit();
                            if (e.key === 'Escape') cancelEdit();
                        }}
                        className="h-8 text-sm"
                    />
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600" onClick={confirmEdit}>
                        <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={cancelEdit}>
                        <XIcon className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-2 min-h-[24px]">
                    {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                    <span className={`text-sm ${value ? 'font-medium text-foreground' : 'italic text-muted-foreground'}`}>
                        {value || placeholder}
                    </span>
                    {editable && (
                        <button
                            onClick={startEdit}
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto p-1 hover:bg-muted rounded"
                            title={`Modifica ${label.toLowerCase()}`}
                        >
                            <Pencil className="w-3 h-3 text-muted-foreground" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Card immobile (riusato) ──────────────────────────────────────────────────
const ImmobileCard = ({ immobile, tipoCliente }) => {
    const { prodotto } = immobile;
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="font-semibold text-foreground">{immobile.address}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                            <span>{immobile.city}</span>
                            {immobile.tenant && <span>Inquilino: {immobile.tenant}</span>}
                            {immobile.landlord && <span>locatore: {immobile.landlord}</span>}
                            <span>Canone: €{immobile.monthlyRent}/mese</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_INFO[`p${prodotto}`]?.class}`}>
                            P{prodotto}
                        </span>
                        <StatusBadge status={immobile.status} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {prodotto === 2 ? (
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Pagamenti CRIA → locatore</p>
                            <PaymentTimeline payments={immobile.criaPayments || []} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Pagamenti Inquilino → CRIA</p>
                            <PaymentTimeline payments={immobile.tenantPayments || []} />
                        </div>
                    </div>
                ) : (
                    <PaymentTimeline payments={immobile.payments || []} />
                )}
                <div className="mt-3 text-right">
                    <Link to={`/dashboard/admin/immobili/${immobile.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                            Scheda immobile <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPALE
// ═════════════════════════════════════════════════════════════════════════════
const SchedaClientePage = () => {
    const { id } = useParams();
    const clienteId = Number(id) || 1;

    const [cliente, setCliente] = useState(CLIENTI_INIZIALI[clienteId] || CLIENTI_INIZIALI[1]);
    const [documenti, setDocumenti] = useState(DOCUMENTI_INIZIALI[clienteId] || []);
    const [nota, setNota] = useState('');
    const [noteList, setNoteList] = useState(NOTE_INIZIALI[clienteId] || []);

    const immobili = IMMOBILI_PER_CLIENTE[clienteId] || [];
    const acquisti = ACQUISTI[clienteId] || [];
    const contestazioni = CONTESTAZIONI[clienteId] || [];
    const tickets = TICKETS_CLIENTE[clienteId] || [];

    // ─── Logica di visibilità per ruolo ────────────────────────────────────────
    const isUser = cliente.ruolo === 'user';
    const islocatore = cliente.ruolo === 'locatore';
    const isInquilino = cliente.ruolo === 'inquilino';
    const isCliente = cliente.ruolo === 'cliente';

    const hasOnboarding = !!cliente.statoOnboarding && cliente.statoOnboarding !== 'non_avviato';
    const showImmobili = (islocatore || isInquilino) && immobili.length > 0;
    const showContestazioni = islocatore || isInquilino;
    const showAzioniOnboarding = hasOnboarding && (
        cliente.statoOnboarding === 'documenti_in_verifica' ||
        cliente.statoOnboarding === 'documenti_verificati'
    );

    // ─── Handlers anagrafica (inline edit) ─────────────────────────────────────
    const updateField = (field, val) => {
        setCliente(prev => ({ ...prev, [field]: val }));
        // TODO: chiamata Supabase + audit log (admin_inserter)
    };

    // ─── Handlers azioni admin onboarding ──────────────────────────────────────
    const verificaDocumenti = () => {
        setCliente(prev => ({ ...prev, statoOnboarding: 'documenti_verificati' }));
        toast.success('Documenti verificati. Ora puoi inviare il preventivo.');
    };

    const richiediIntegrazione = () => {
        setCliente(prev => ({ ...prev, statoOnboarding: 'documenti_da_integrare' }));
        toast.info('Richiesta integrazione inviata al cliente.');
    };

    const inviaPreventivo = () => {
        setCliente(prev => ({ ...prev, statoOnboarding: 'preventivo_inviato' }));
        toast.success('Preventivo inviato via email. Stato aggiornato.');
    };

    // ─── Handlers documenti ────────────────────────────────────────────────────
    const aggiornaStatoDoc = (docId, nuovoStato) => {
        setDocumenti(prev => prev.map(d => d.id === docId ? { ...d, stato: nuovoStato } : d));
        toast.success(`Documento aggiornato: ${nuovoStato}`);
    };

    const richiediIntegrazioneDoc = (docId, nome) => {
        aggiornaStatoDoc(docId, 'mancante');
        toast.info(`Richiesta integrazione per: ${nome}`);
    };

    // ─── Handler note ──────────────────────────────────────────────────────────
    const invioNota = () => {
        if (!nota.trim()) return;
        setNoteList(prev => [{ testo: nota, data: new Date().toLocaleDateString('it-IT'), autore: 'Admin' }, ...prev]);
        setNota('');
    };

    return (
        <>
            <Helmet><title>{cliente.nome} {cliente.cognome} - Scheda Utente</title></Helmet>

            <div className="space-y-6">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/dashboard/admin/clienti">
                        <Button variant="ghost" size="sm" className="gap-1 px-2">
                            <ArrowLeft className="w-4 h-4" /> Utenti
                        </Button>
                    </Link>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{cliente.nome} {cliente.cognome}</span>
                </div>

                {/* ─── 1. ANAGRAFICA (sempre visibile, edit inline) ─────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" /> Anagrafica
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* Campi modificabili dall'admin */}
                            <FieldRow label="Nome" value={cliente.nome} editable
                                onSave={v => updateField('nome', v)} />
                            <FieldRow label="Cognome" value={cliente.cognome} editable
                                onSave={v => updateField('cognome', v)} />
                            <FieldRow icon={Mail} label="Email" value={cliente.email} editable
                                onSave={v => updateField('email', v)} />
                            <FieldRow icon={Phone} label="Telefono" value={cliente.telefono} editable
                                onSave={v => updateField('telefono', v)} />
                            <FieldRow label="Codice fiscale" value={cliente.codiceFiscale} editable
                                onSave={v => updateField('codiceFiscale', v)} />
                            <FieldRow label="Indirizzo residenza" value={cliente.indirizzoResidenza} editable
                                onSave={v => updateField('indirizzoResidenza', v)} />

                            {/* Tipo account: solo se locatore */}
                            {islocatore && (
                                <FieldRow label="Tipo account" value={cliente.tipoAccount} editable
                                    onSave={v => updateField('tipoAccount', v)} />
                            )}

                            {/* Campi read-only */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Data registrazione</p>
                                <p className="font-medium text-foreground flex items-center gap-2 text-sm">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                    {fmt(cliente.createdAt)}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Ruolo</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${RUOLO_BADGE[cliente.ruolo]}`}>
                                    {cliente.ruolo}
                                </span>
                            </div>

                            {/* Onboarding (era: stato pratica) — solo se applicabile */}
                            {!isUser && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Onboarding</p>
                                    {cliente.statoOnboarding ? (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_ONBOARDING[cliente.statoOnboarding]?.class}`}>
                                            {STATO_ONBOARDING[cliente.statoOnboarding]?.label}
                                        </span>
                                    ) : (
                                        <span className="text-sm italic text-muted-foreground">Non applicabile</span>
                                    )}
                                </div>
                            )}

                            {/* Prodotti acquistati (storico) */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Prodotti acquistati</p>
                                {cliente.prodottiAcquistati.length === 0 ? (
                                    <span className="text-sm italic text-muted-foreground">Nessun acquisto</span>
                                ) : (
                                    <div className="flex gap-1 flex-wrap">
                                        {cliente.prodottiAcquistati.map(p => (
                                            <span key={p} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_INFO[p]?.class}`}>
                                                {p.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Prodotti attivi (solo P1/P2 abbonamenti) */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Prodotti attivi</p>
                                {cliente.prodottiAttivi.length === 0 ? (
                                    <span className="text-sm italic text-muted-foreground">Nessun prodotto attivo</span>
                                ) : (
                                    <div className="flex gap-1 flex-wrap">
                                        {cliente.prodottiAttivi.map(p => (
                                            <span key={p} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_INFO[p]?.class}`}>
                                                {PRODOTTO_INFO[p]?.label}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Reputazione: solo inquilino */}
                            {isInquilino && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Reputazione pagamenti</p>
                                    {cliente.reputazione ? (
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${REP_CONFIG[cliente.reputazione].badge}`}>
                                            <span className="w-2 h-2 rounded-full bg-current" />
                                            {REP_CONFIG[cliente.reputazione].label}
                                        </span>
                                    ) : (
                                        <span className="text-sm italic text-muted-foreground">Nessun dato</span>
                                    )}
                                </div>
                            )}

                            {/* locatore di riferimento: solo inquilino */}
                            {isInquilino && cliente.locatoreRiferimento && (
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">locatore di riferimento</p>
                                    <Link to={`/dashboard/admin/clienti/${cliente.locatoreRiferimento.id}`}
                                        className="text-sm font-medium text-primary hover:underline">
                                        {cliente.locatoreRiferimento.nome}
                                    </Link>
                                </div>
                            )}

                        </div>
                    </CardContent>
                </Card>

                {/* ─── 2. ONBOARDING (visibile solo se applicabile) ──────────── */}
                {hasOnboarding && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="w-5 h-5" /> Onboarding
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-muted/40 rounded-lg space-y-3">
                                <div className="flex items-center gap-2">
                                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Stato attuale</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_ONBOARDING[cliente.statoOnboarding]?.class}`}>
                                        {STATO_ONBOARDING[cliente.statoOnboarding]?.label}
                                    </span>
                                </div>

                                {/* Azioni admin per far avanzare lo stato */}
                                {showAzioniOnboarding && (
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                                        {cliente.statoOnboarding === 'documenti_in_verifica' && (
                                            <>
                                                <Button size="sm" className="gap-2" onClick={verificaDocumenti}>
                                                    <CheckCircle2 className="w-4 h-4" /> Verifica documenti
                                                </Button>
                                                <Button size="sm" variant="outline" className="gap-2" onClick={richiediIntegrazione}>
                                                    <XCircle className="w-4 h-4" /> Richiedi integrazione
                                                </Button>
                                            </>
                                        )}
                                        {cliente.statoOnboarding === 'documenti_verificati' && (
                                            <Button size="sm" className="gap-2" onClick={inviaPreventivo}>
                                                <Mailbox className="w-4 h-4" /> Invia preventivo
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ─── 3. IMMOBILI E PAGAMENTI (solo locatore/inquilino) ──── */}
                {showImmobili && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="w-5 h-5" /> Immobili e pagamenti
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {immobili.map(im => (
                                <ImmobileCard key={im.id} immobile={im} tipoCliente={cliente.ruolo} />
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* ─── 4. DOCUMENTI (sempre visibile, vuoto per user) ──────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" /> Documenti
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {documenti.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic px-4 py-8 text-center">
                                Nessun documento caricato. {isUser && 'L\'utente non ha ancora avviato un onboarding.'}
                            </p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nome file</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tipo</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {documenti.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 font-medium text-foreground">{doc.nome}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{doc.tipo}</td>
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmt(doc.data)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_DOC[doc.stato]}`}>
                                                    {doc.stato}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex gap-1 justify-end">
                                                    {doc.stato !== 'mancante' && (
                                                        <>
                                                            <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs"
                                                                onClick={() => toast.info('Visualizzazione disponibile dopo backend')}>
                                                                <Eye className="w-3.5 h-3.5" /> Vedi
                                                            </Button>
                                                            <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs"
                                                                onClick={() => toast.info('Download disponibile dopo backend')}>
                                                                <Download className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    {doc.stato === 'da verificare' && (
                                                        <Button size="sm" variant="ghost" className="h-7 text-green-600"
                                                            title="Verifica" onClick={() => aggiornaStatoDoc(doc.id, 'verificato')}>
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                    {doc.stato !== 'mancante' && (
                                                        <Button size="sm" variant="ghost" className="h-7 text-orange-600"
                                                            title="Richiedi integrazione" onClick={() => richiediIntegrazioneDoc(doc.id, doc.nome)}>
                                                            <XCircle className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

                {/* ─── 5. ACQUISTI E PAGAMENTI (sempre visibile, vuoto per user) ── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5" /> Acquisti e pagamenti
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {acquisti.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic px-4 py-8 text-center">
                                Nessun acquisto registrato.
                            </p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tipo</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Descrizione</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Metodo</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Importo</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {acquisti.map((a) => (
                                        <tr key={a.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmt(a.data)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${a.tipo === 'Acquisto prodotto' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                    {a.tipo}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-foreground">{a.descrizione}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${a.metodo === 'Stripe' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {a.metodo}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">{a.importo}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${a.stato === 'pagata' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {a.stato}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

                {/* ─── 6. CONTESTAZIONI (solo locatore/inquilino) ──────────── */}
                {showContestazioni && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Contestazioni
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {contestazioni.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">Nessuna contestazione registrata.</p>
                            ) : (
                                <div className="space-y-3">
                                    {contestazioni.map((c) => (
                                        <div key={c.id} className="p-4 bg-muted/40 rounded-lg space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-foreground text-sm">{c.immobile} — {c.mese}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.stato === 'risolta' ? 'bg-green-100 text-green-800' : c.stato === 'aperta' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {c.stato}
                                                    </span>
                                                    <Link to={`/dashboard/admin/contestazioni/${c.id}`}>
                                                        <Button variant="outline" size="sm">Gestisci</Button>
                                                    </Link>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{c.descrizione}</p>
                                            <p className="text-xs text-muted-foreground">Aperta il {fmt(c.data)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* ─── 7. TICKET ASSISTENZA (sempre visibile) ──────────────── */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" /> Ticket assistenza
                            </CardTitle>
                            <span className="text-xs text-muted-foreground">{tickets.length} ticket</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {tickets.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic px-4 py-6 text-center">Nessun ticket registrato.</p>
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
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.stato === 'aperto' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                                                    {t.stato}
                                                </span>
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

                {/* ─── 8. NOTE INTERNE (sempre visibile) ──────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
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
                            <p className="text-sm text-muted-foreground italic">Nessuna nota interna.</p>
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
        </>
    );
};

export default SchedaClientePage;