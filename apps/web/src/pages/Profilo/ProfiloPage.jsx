import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User, Mail, Phone, Shield, Smartphone, Key, Eye, EyeOff, Edit2, Check, X, Calendar,
    CheckCircle2, AlertTriangle, LogOut, Building2, Zap, QrCode, Copy, Bell,
    Fingerprint, Receipt, ShieldCheck, FileSearch, ChevronRight, Lock, LayoutGrid,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { nomeVisualizzato, iniziali } from '@/lib/aree';

// ═════════════════════════════════════════════════════════════════════════════
// PROFILO PERSONALE — F-12
// Unifica le due copie identiche di proprietario e inquilino. È di tutti e si
// apre dentro l'area da cui si arriva. Fatturazione (F-13), identità (F-07),
// consensi (F-14) e accesso ai dati (F-15) hanno una pagina propria.
// ═════════════════════════════════════════════════════════════════════════════

const PREFERENZE_INIZIALI = {
    emailPagamenti: true,
    emailContestazioni: true,
    emailReport: true,
};

const SESSIONI = [
    { id: 1, dispositivo: 'MacBook Pro · Chrome', posizione: 'Milano, IT', data: '14/09/2026 09:30', corrente: true },
    { id: 2, dispositivo: 'iPhone · Safari', posizione: 'Milano, IT', data: '13/09/2026 19:45', corrente: false },
];

const STATO_IDENTITA = {
    non_caricato: { label: 'Da caricare', classe: 'bg-gray-100 text-gray-700' },
    in_attesa: { label: 'In verifica', classe: 'bg-blue-100 text-blue-800' },
    verificato: { label: 'Verificato', classe: 'bg-green-100 text-green-800' },
    da_integrare: { label: 'Da integrare', classe: 'bg-amber-100 text-amber-800' },
};

const CampoEditabile = ({ label, value, onSave, type = 'text', icon: Icon, readonly }) => {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value);
    // onSave risponde { ok, messaggio }: se il database dice di no, il campo resta aperto.
    const conferma = async () => {
        const esito = await onSave(val);
        if (esito && esito.ok === false) { toast.error(esito.messaggio || `${label}: non salvato`); return; }
        setEditing(false);
        toast.success(`${label} aggiornato`);
    };
    const annulla = () => { setVal(value); setEditing(false); };

    return (
        <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            {editing ? (
                <div className="flex items-center gap-2">
                    <Input type={type} value={val} onChange={e => setVal(e.target.value)} className="h-9 text-sm" autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') conferma(); if (e.key === 'Escape') annulla(); }} />
                    <button type="button" onClick={conferma} className="text-green-600"><Check className="w-4 h-4" /></button>
                    <button type="button" onClick={annulla} className="text-red-600"><X className="w-4 h-4" /></button>
                </div>
            ) : (
                <div className="flex items-center gap-2 group">
                    {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                    <p className="font-medium text-foreground">{val || '—'}</p>
                    {!readonly && (
                        <button type="button" onClick={() => setEditing(true)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const ForzaPwd = ({ pwd }) => {
    if (!pwd) return null;
    const checks = [
        { ok: pwd.length >= 8, label: '8+ char' },
        { ok: /[A-Z]/.test(pwd), label: 'Maiusc' },
        { ok: /[0-9]/.test(pwd), label: 'Numero' },
        { ok: /[^A-Za-z0-9]/.test(pwd), label: 'Simbolo' },
    ];
    const score = checks.filter(c => c.ok).length;
    const colore = score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-orange-500' : score === 3 ? 'bg-yellow-500' : 'bg-green-500';
    return (
        <div className="space-y-1.5 mt-1">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= score ? colore : 'bg-muted'}`} />)}
            </div>
            <div className="flex flex-wrap gap-x-3">
                {checks.map(c => (
                    <span key={c.label} className={`text-xs ${c.ok ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {c.ok ? '✓' : '○'} {c.label}
                    </span>
                ))}
            </div>
        </div>
    );
};

const Toggle = ({ label, descrizione, value, onChange }) => (
    <label className="flex items-start justify-between gap-4 p-3 hover:bg-muted/30 rounded-lg cursor-pointer">
        <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            {descrizione && <p className="text-xs text-muted-foreground mt-0.5">{descrizione}</p>}
        </div>
        <button type="button" onClick={() => onChange(!value)}
            className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-primary' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
    </label>
);

const Modal2FA = ({ onClose, onConfirm }) => {
    const [step, setStep] = useState(1);
    const [code, setCode] = useState('');
    const secret = 'JBSWY3DPEHPK3PXP';

    const conferma = () => {
        if (code.length !== 6) { toast.error('Inserisci il codice a 6 cifre'); return; }
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl shadow-xl max-w-md w-full p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">Attiva autenticazione a 2 fattori</h3>
                        <p className="text-xs text-muted-foreground">Step {step} di 2</p>
                    </div>
                </div>

                {step === 1 && (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Scansiona il codice QR con la tua app di autenticazione (Google Authenticator, Authy).</p>
                        <div className="flex justify-center p-6 bg-muted/30 rounded-xl">
                            <div className="w-40 h-40 bg-white border border-border rounded-lg flex items-center justify-center">
                                <QrCode className="w-24 h-24 text-foreground" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Oppure inserisci manualmente:</p>
                            <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg">
                                <code className="text-sm font-mono flex-1">{secret}</code>
                                <button type="button" onClick={() => { navigator.clipboard.writeText(secret); toast.success('Copiato'); }}
                                    className="text-muted-foreground hover:text-foreground">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end pt-2">
                            <Button variant="outline" onClick={onClose}>Annulla</Button>
                            <Button onClick={() => setStep(2)} className="gap-2">Avanti <Check className="w-4 h-4" /></Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Inserisci il codice a 6 cifre generato dalla tua app.</p>
                        <Input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000" maxLength={6} className="text-center text-2xl tracking-widest font-mono h-14" autoFocus />
                        <div className="flex gap-3 justify-end pt-2">
                            <Button variant="outline" onClick={() => setStep(1)}>Indietro</Button>
                            <Button onClick={conferma} className="gap-2"><Check className="w-4 h-4" /> Attiva 2FA</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const VoceAccount = ({ to, icona: Icona, titolo, testo, badge }) => (
    <Link to={to} className="flex items-start gap-3 p-4 rounded-xl border border-border hover:bg-accent transition-colors group">
        <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0"><Icona className="w-4 h-4 text-primary" /></div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-foreground">{titolo}</p>
                {badge}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{testo}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 group-hover:text-foreground" />
    </Link>
);

const ProfiloPage = () => {
    const { persona, contesti, aggiornaPersona } = useAuth();
    const [preferenze, setPreferenze] = useState(PREFERENZE_INIZIALI);
    const [showPwdSection, setShowPwd] = useState(false);
    const [pwdAttuale, setPwdAttuale] = useState('');
    const [nuovaPwd, setNuovaPwd] = useState('');
    const [confermaPwd, setConfermaPwd] = useState('');
    const [showPwdEye, setShowEye] = useState({ attuale: false, nuova: false, conferma: false });
    const [show2FAModal, setShow2FA] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);

    if (!persona) return null;

    const giuridica = persona.tipo === 'giuridica';
    const proprietario = contesti.some(c => c.area === 'locatore');
    const aggiorna = (campo) => (val) => aggiornaPersona({ [campo]: val });
    const setPref = (campo, val) => { setPreferenze(p => ({ ...p, [campo]: val })); toast.success('Preferenze aggiornate'); };
    const statoId = STATO_IDENTITA[persona.statoIdentita] || STATO_IDENTITA.non_caricato;

    const cambiaPassword = () => {
        if (!pwdAttuale.trim()) { toast.error('Inserisci la password attuale'); return; }
        if (nuovaPwd.length < 8) { toast.error('Almeno 8 caratteri'); return; }
        if (nuovaPwd !== confermaPwd) { toast.error('Le password non coincidono'); return; }
        if (!/[A-Z]/.test(nuovaPwd) || !/[0-9]/.test(nuovaPwd)) { toast.error('Servono una maiuscola e un numero'); return; }
        toast.success('Password aggiornata');
        setPwdAttuale(''); setNuovaPwd(''); setConfermaPwd(''); setShowPwd(false);
    };

    const attiva2FA = () => { setTwoFactor(true); toast.success('2FA attivata'); };
    const disattiva2FA = () => {
        if (window.confirm('Sicuro di voler disattivare il 2FA?')) {
            setTwoFactor(false);
            toast.info('2FA disattivata');
        }
    };

    const occhio = (campo, valore, setter) => (
        <div className="relative">
            <Input type={showPwdEye[campo] ? 'text' : 'password'} value={valore}
                onChange={e => setter(e.target.value)} placeholder="••••••••" style={{ paddingRight: '2.5rem' }} />
            <button type="button" onClick={() => setShowEye(s => ({ ...s, [campo]: !s[campo] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPwdEye[campo] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
    );

    return (
        <>
            <Helmet><title>Il mio profilo - CRIA</title></Helmet>

            {show2FAModal && <Modal2FA onClose={() => setShow2FA(false)} onConfirm={attiva2FA} />}

            <div className="space-y-6">

                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Il mio profilo</h1>
                        <p className="text-sm text-muted-foreground">Dati, sicurezza e preferenze. Valgono per tutte le tue aree.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-base font-bold text-primary">{iniziali(persona)}</span>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{nomeVisualizzato(persona)}</p>
                            <p className="text-xs text-muted-foreground">{giuridica ? 'Società o ente' : 'Persona fisica'}</p>
                        </div>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            {giuridica ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            {giuridica ? 'Dati della società' : 'Dati personali'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {giuridica ? (
                                <>
                                    <CampoEditabile label="Ragione sociale" value={persona.ragioneSociale} onSave={aggiorna('ragioneSociale')} />
                                    <CampoEditabile label="Partita IVA" value={persona.partitaIva} onSave={aggiorna('partitaIva')} readonly />
                                    <CampoEditabile label="Nome del referente" value={persona.nome} onSave={aggiorna('nome')} />
                                    <CampoEditabile label="Cognome del referente" value={persona.cognome} onSave={aggiorna('cognome')} />
                                </>
                            ) : (
                                <>
                                    <CampoEditabile label="Nome" value={persona.nome} onSave={aggiorna('nome')} />
                                    <CampoEditabile label="Cognome" value={persona.cognome} onSave={aggiorna('cognome')} />
                                    <CampoEditabile label="Codice fiscale" value={persona.codiceFiscale} onSave={aggiorna('codiceFiscale')} readonly />
                                </>
                            )}
                            <CampoEditabile label="Email" value={persona.email} onSave={aggiorna('email')} type="email" icon={Mail} />
                            <CampoEditabile label="Cellulare" value={persona.telefono} onSave={aggiorna('telefono')} type="tel" icon={Phone} />
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Account creato</p>
                                <p className="font-medium text-foreground flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> 15/01/2026
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            I dati verificati con il documento — {giuridica ? 'partita IVA' : 'codice fiscale'} — si correggono con un nuovo documento, non a mano.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="w-5 h-5" /> Il mio account</CardTitle>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-3">
                        <VoceAccount to="/profilo/identita" icona={Fingerprint} titolo="Documento d'identità" testo="Caricato e verificato da una persona"
                            badge={<span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statoId.classe}`}>{statoId.label}</span>} />
                        <VoceAccount to="/profilo/fatturazione" icona={Receipt} titolo="Dati di fatturazione" testo="Servono per completare un acquisto" />
                        <VoceAccount to="/profilo/consensi" icona={ShieldCheck} titolo="Consensi" testo="Cosa hai autorizzato, e come revocarlo" />
                        <VoceAccount to="/profilo/i-miei-dati" icona={FileSearch} titolo="I miei dati" testo="Chiedi gratis una copia di tutto quello che abbiamo" />
                    </CardContent>
                </Card>

                {contesti.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base"><LayoutGrid className="w-5 h-5" /> Le mie aree</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {contesti.map(contesto => {
                                const Icona = contesto.icona;
                                return (
                                    <Link key={contesto.area} to={contesto.home}
                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                                        <Icona className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-sm font-medium text-foreground">{contesto.cappello}</span>
                                            {contesto.posizioni.length > 0 && (
                                                <span className="block text-xs text-muted-foreground truncate">
                                                    {contesto.posizioni.length === 1 ? '1 immobile' : `${contesto.posizioni.length} immobili`}
                                                </span>
                                            )}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                    </Link>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Shield className="w-5 h-5" /> Sicurezza</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start justify-between gap-4 p-4 bg-muted/30 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0"><Key className="w-4 h-4 text-blue-600" /></div>
                                <div>
                                    <p className="font-medium text-foreground">Password</p>
                                    <p className="text-xs text-muted-foreground">Modificata l'ultima volta il 15/01/2026</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setShowPwd(s => !s)}>
                                {showPwdSection ? 'Annulla' : 'Modifica'}
                            </Button>
                        </div>

                        {showPwdSection && (
                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Password attuale</Label>
                                    {occhio('attuale', pwdAttuale, setPwdAttuale)}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Nuova password</Label>
                                    {occhio('nuova', nuovaPwd, setNuovaPwd)}
                                    <ForzaPwd pwd={nuovaPwd} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Conferma nuova password</Label>
                                    {occhio('conferma', confermaPwd, setConfermaPwd)}
                                    {confermaPwd && confermaPwd === nuovaPwd && (
                                        <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Le password coincidono</p>
                                    )}
                                </div>
                                <Button onClick={cambiaPassword} className="gap-2"><Zap className="w-4 h-4" /> Aggiorna password</Button>
                            </div>
                        )}

                        <div className="flex items-start justify-between gap-4 p-4 bg-muted/30 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg flex-shrink-0 ${twoFactor ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                    <Smartphone className={`w-4 h-4 ${twoFactor ? 'text-green-600' : 'text-yellow-600'}`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-foreground">Autenticazione a 2 fattori</p>
                                        {twoFactor
                                            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3" /> Attiva</span>
                                            : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Non attiva</span>}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {twoFactor ? 'Account protetto con codice da app autenticatore' : 'Aggiungi un livello extra di sicurezza'}
                                    </p>
                                </div>
                            </div>
                            {twoFactor
                                ? <Button variant="outline" size="sm" onClick={disattiva2FA} className="text-red-600 border-red-200 hover:bg-red-50">Disattiva</Button>
                                : <Button size="sm" onClick={() => setShow2FA(true)} className="gap-2"><Zap className="w-4 h-4" /> Attiva</Button>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Bell className="w-5 h-5" /> Notifiche</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {proprietario && (
                            <div className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/30 mb-2">
                                <div>
                                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                        Solleciti del ciclo mensile <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Via email e SMS. Non si possono spegnere: servono a non perdere la copertura del mese.
                                    </p>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground flex-shrink-0">Sempre attivi</span>
                            </div>
                        )}
                        <Toggle label="Pagamenti e bonifici" descrizione="Quando ricevi un pagamento o CRIA effettua un bonifico"
                            value={preferenze.emailPagamenti} onChange={v => setPref('emailPagamenti', v)} />
                        <Toggle label="Contestazioni" descrizione="Aggiornamenti sulle contestazioni che ti riguardano"
                            value={preferenze.emailContestazioni} onChange={v => setPref('emailContestazioni', v)} />
                        <Toggle label="Report mensili" descrizione="Riepilogo del mese"
                            value={preferenze.emailReport} onChange={v => setPref('emailReport', v)} />
                        <p className="text-xs text-muted-foreground px-3 pt-2">
                            Le comunicazioni commerciali si gestiscono nei <Link to="/profilo/consensi" className="underline hover:text-foreground">consensi</Link>.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><Smartphone className="w-5 h-5" /> Sessioni attive</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Dispositivo</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Posizione</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Ultima attività</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {SESSIONI.map(s => (
                                    <tr key={s.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-medium text-foreground">{s.dispositivo}</p>
                                                {s.corrente && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Corrente</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.posizione}</td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">{s.data}</td>
                                        <td className="px-4 py-3 text-right">
                                            {!s.corrente && (
                                                <Button size="sm" variant="ghost" className="text-red-600 gap-1.5" onClick={() => toast.success('Sessione terminata')}>
                                                    <LogOut className="w-3.5 h-3.5" /> Termina
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-red-600"><AlertTriangle className="w-5 h-5" /> Chiusura dell'account</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start justify-between gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <div>
                                <p className="font-medium text-red-700">Chiudi l'account</p>
                                <p className="text-xs text-red-600 mt-0.5">
                                    Non potrai più accedere. I dati che la legge obbliga a conservare restano per il tempo indicato nell'informativa.
                                </p>
                            </div>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-100 flex-shrink-0">Chiudi</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default ProfiloPage;
