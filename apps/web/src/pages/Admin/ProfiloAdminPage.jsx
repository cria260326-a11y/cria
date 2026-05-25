import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User, Mail, Phone, Shield, Smartphone, Key,
    Eye, EyeOff, Edit2, Check, X, Calendar,
    CheckCircle2, AlertTriangle, LogOut, Activity,
    Zap, QrCode, Copy
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Dati mock ─────────────────────────────────────────────────────────────────
const PROFILO_INIZIALE = {
    id: 1,
    nome: 'Antonino',
    cognome: 'Nocera',
    email: 'antonino@cria.it',
    telefono: '+39 333 1234567',
    ruolo: 'admin',
    createdAt: '2026-01-01',
    ultimoAccesso: '2026-05-04 09:30',
    twoFactorEnabled: false,
};

const SESSIONI = [
    { id: 1, dispositivo: 'MacBook Pro · Chrome', posizione: 'Lugano, CH', data: '2026-05-04 09:30', corrente: true },
    { id: 2, dispositivo: 'iPhone · Safari', posizione: 'Lugano, CH', data: '2026-05-03 18:15', corrente: false },
    { id: 3, dispositivo: 'MacBook Pro · Chrome', posizione: 'Milano, IT', data: '2026-05-01 14:22', corrente: false },
];

const ATTIVITA_ACCESSO = [
    { id: 1, azione: 'Login riuscito', dispositivo: 'MacBook Pro · Chrome', data: '2026-05-04 09:30' },
    { id: 2, azione: 'Password modificata', dispositivo: 'MacBook Pro · Chrome', data: '2026-04-28 10:00' },
    { id: 3, azione: 'Login riuscito', dispositivo: 'iPhone · Safari', data: '2026-05-03 18:15' },
    { id: 4, azione: 'Email modificata', dispositivo: 'MacBook Pro · Chrome', data: '2026-04-15 11:30' },
];

// ─── Campo editabile inline ───────────────────────────────────────────────────
const CampoEditabile = ({ label, value, onSave, type = 'text', icon: Icon }) => {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value);
    const conferma = () => { onSave(val); setEditing(false); toast.success(`${label} aggiornato`); };
    const annulla = () => { setVal(value); setEditing(false); };

    return (
        <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            {editing ? (
                <div className="flex items-center gap-2">
                    <Input type={type} value={val} onChange={e => setVal(e.target.value)}
                        className="h-9 text-sm" autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') conferma(); if (e.key === 'Escape') annulla(); }} />
                    <button onClick={conferma} className="text-green-600"><Check className="w-4 h-4" /></button>
                    <button onClick={annulla} className="text-red-600"><X className="w-4 h-4" /></button>
                </div>
            ) : (
                <div className="flex items-center gap-2 group">
                    {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                    <p className="font-medium text-foreground">{val || '—'}</p>
                    <button onClick={() => setEditing(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Indicatore forza password ─────────────────────────────────────────────────
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
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= score ? colore : 'bg-muted'}`} />
                ))}
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

// ─── Modal 2FA ─────────────────────────────────────────────────────────────────
const Modal2FA = ({ onClose, onConfirm }) => {
    const [step, setStep] = useState(1);
    const [code, setCode] = useState('');
    const secret = 'JBSWY3DPEHPK3PXP'; // mock — generato dal backend

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
                        <p className="text-sm text-muted-foreground">
                            Scansiona il codice QR con la tua app di autenticazione (Google Authenticator, Authy, 1Password).
                        </p>
                        <div className="flex justify-center p-6 bg-muted/30 rounded-xl">
                            <div className="w-40 h-40 bg-white border border-border rounded-lg flex items-center justify-center">
                                <QrCode className="w-24 h-24 text-foreground" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Oppure inserisci manualmente:</p>
                            <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg">
                                <code className="text-sm font-mono flex-1">{secret}</code>
                                <button onClick={() => { navigator.clipboard.writeText(secret); toast.success('Copiato'); }}
                                    className="text-muted-foreground hover:text-foreground">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end pt-2">
                            <Button variant="outline" onClick={onClose}>Annulla</Button>
                            <Button onClick={() => setStep(2)} className="gap-2">
                                Avanti <Check className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Inserisci il codice a 6 cifre generato dalla tua app.
                        </p>
                        <Input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000" maxLength={6}
                            className="text-center text-2xl tracking-widest font-mono h-14" autoFocus />
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800">
                                Salva i codici di backup in un posto sicuro. Senza l'app o i codici di backup non potrai accedere all'account.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end pt-2">
                            <Button variant="outline" onClick={() => setStep(1)}>Indietro</Button>
                            <Button onClick={conferma} className="gap-2">
                                <Check className="w-4 h-4" /> Attiva 2FA
                            </Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const ProfiloAdminPage = () => {
    const [profilo, setProfilo] = useState(PROFILO_INIZIALE);
    const [showPwdSection, setShowPwdSection] = useState(false);
    const [pwdAttuale, setPwdAttuale] = useState('');
    const [nuovaPwd, setNuovaPwd] = useState('');
    const [confermaPwd, setConfermaPwd] = useState('');
    const [showPwd, setShowPwd] = useState({ attuale: false, nuova: false, conferma: false });
    const [show2FAModal, setShow2FAModal] = useState(false);

    const aggiorna = (campo, val) => setProfilo(p => ({ ...p, [campo]: val }));

    const cambiaPassword = () => {
        if (!pwdAttuale.trim()) { toast.error('Inserisci la password attuale'); return; }
        if (nuovaPwd.length < 8) { toast.error('La nuova password deve avere almeno 8 caratteri'); return; }
        if (nuovaPwd !== confermaPwd) { toast.error('Le password non coincidono'); return; }
        if (!/[A-Z]/.test(nuovaPwd) || !/[0-9]/.test(nuovaPwd)) { toast.error('La password deve contenere maiuscole e numeri'); return; }

        // TODO: chiamata Edge Function per cambio password
        toast.success('Password aggiornata con successo');
        setPwdAttuale(''); setNuovaPwd(''); setConfermaPwd('');
        setShowPwdSection(false);
    };

    const attiva2FA = () => {
        aggiorna('twoFactorEnabled', true);
        toast.success('Autenticazione a 2 fattori attivata');
    };

    const disattiva2FA = () => {
        if (window.confirm('Sicuro di voler disattivare il 2FA? Il tuo account sarà meno protetto.')) {
            aggiorna('twoFactorEnabled', false);
            toast.info('2FA disattivato');
        }
    };

    const terminaSessione = (id) => {
        toast.success('Sessione terminata');
    };

    return (
        <>
            <Helmet><title>Profilo - CRIA Admin</title></Helmet>

            {show2FAModal && <Modal2FA onClose={() => setShow2FAModal(false)} onConfirm={attiva2FA} />}

            <div className="space-y-6">

                {/* Intestazione */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Il mio profilo</h1>
                        <p className="text-sm text-muted-foreground">Gestisci le informazioni del tuo account e le impostazioni di sicurezza</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-base font-bold text-primary uppercase">
                                {profilo.nome[0]}{profilo.cognome[0]}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{profilo.nome} {profilo.cognome}</p>
                            <p className="text-xs text-muted-foreground capitalize">{profilo.ruolo}</p>
                        </div>
                    </div>
                </div>

                {/* ── 1. Dati personali ─────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" /> Dati personali
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <CampoEditabile label="Nome" value={profilo.nome} onSave={v => aggiorna('nome', v)} />
                            <CampoEditabile label="Cognome" value={profilo.cognome} onSave={v => aggiorna('cognome', v)} />
                            <CampoEditabile label="Email" value={profilo.email} onSave={v => aggiorna('email', v)} type="email" icon={Mail} />
                            <CampoEditabile label="Telefono" value={profilo.telefono} onSave={v => aggiorna('telefono', v)} type="tel" icon={Phone} />
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Account creato</p>
                                <p className="font-medium text-foreground flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {new Date(profilo.createdAt).toLocaleDateString('it-IT')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Ultimo accesso</p>
                                <p className="font-medium text-foreground">{profilo.ultimoAccesso}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── 2. Sicurezza ──────────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5" /> Sicurezza
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">

                        {/* Password */}
                        <div className="flex items-start justify-between gap-4 p-4 bg-muted/30 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                    <Key className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Password</p>
                                    <p className="text-xs text-muted-foreground">Modificata l'ultima volta il 28/04/2026</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setShowPwdSection(s => !s)}>
                                {showPwdSection ? 'Annulla' : 'Modifica'}
                            </Button>
                        </div>

                        {showPwdSection && (
                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Password attuale</Label>
                                    <div className="relative">
                                        <Input type={showPwd.attuale ? 'text' : 'password'} value={pwdAttuale}
                                            onChange={e => setPwdAttuale(e.target.value)}
                                            placeholder="••••••••" style={{ paddingRight: '2.5rem' }} />
                                        <button onClick={() => setShowPwd(s => ({ ...s, attuale: !s.attuale }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            {showPwd.attuale ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Nuova password</Label>
                                    <div className="relative">
                                        <Input type={showPwd.nuova ? 'text' : 'password'} value={nuovaPwd}
                                            onChange={e => setNuovaPwd(e.target.value)}
                                            placeholder="••••••••" style={{ paddingRight: '2.5rem' }} />
                                        <button onClick={() => setShowPwd(s => ({ ...s, nuova: !s.nuova }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            {showPwd.nuova ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <ForzaPwd pwd={nuovaPwd} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Conferma nuova password</Label>
                                    <div className="relative">
                                        <Input type={showPwd.conferma ? 'text' : 'password'} value={confermaPwd}
                                            onChange={e => setConfermaPwd(e.target.value)}
                                            placeholder="••••••••" style={{ paddingRight: '2.5rem' }} />
                                        <button onClick={() => setShowPwd(s => ({ ...s, conferma: !s.conferma }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            {showPwd.conferma ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {confermaPwd && confermaPwd === nuovaPwd && (
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Le password coincidono
                                        </p>
                                    )}
                                </div>
                                <Button onClick={cambiaPassword} className="gap-2">
                                    <Zap className="w-4 h-4" /> Aggiorna password
                                </Button>
                            </div>
                        )}

                        {/* 2FA */}
                        <div className="flex items-start justify-between gap-4 p-4 bg-muted/30 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg flex-shrink-0 ${profilo.twoFactorEnabled ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                    <Smartphone className={`w-4 h-4 ${profilo.twoFactorEnabled ? 'text-green-600' : 'text-yellow-600'}`} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-foreground">Autenticazione a 2 fattori</p>
                                        {profilo.twoFactorEnabled ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle2 className="w-3 h-3" /> Attiva
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Non attiva
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {profilo.twoFactorEnabled
                                            ? 'Account protetto con codice da app autenticatore'
                                            : 'Aggiungi un livello extra di sicurezza al tuo account'}
                                    </p>
                                </div>
                            </div>
                            {profilo.twoFactorEnabled ? (
                                <Button variant="outline" size="sm" onClick={disattiva2FA} className="text-red-600 border-red-200 hover:bg-red-50">
                                    Disattiva
                                </Button>
                            ) : (
                                <Button size="sm" onClick={() => setShow2FAModal(true)} className="gap-2">
                                    <Zap className="w-4 h-4" /> Attiva
                                </Button>
                            )}
                        </div>

                    </CardContent>
                </Card>

                {/* ── 3. Sessioni attive ────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="w-5 h-5" /> Sessioni attive
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Dispositivo</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Posizione</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Ultima attività</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {SESSIONI.map(s => (
                                    <tr key={s.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-foreground">{s.dispositivo}</p>
                                                {s.corrente && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Sessione corrente
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.posizione}</td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">{s.data}</td>
                                        <td className="px-4 py-3 text-right">
                                            {!s.corrente && (
                                                <Button size="sm" variant="ghost" className="text-red-600 gap-1.5"
                                                    onClick={() => terminaSessione(s.id)}>
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

                {/* ── 4. Attività di accesso ────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" /> Attività recente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {ATTIVITA_ACCESSO.map(a => (
                                <div key={a.id} className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    <div className="flex-1 flex items-center justify-between flex-wrap gap-2">
                                        <div>
                                            <p className="text-sm text-foreground">{a.azione}</p>
                                            <p className="text-xs text-muted-foreground">{a.dispositivo}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground tabular-nums">{a.data}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default ProfiloAdminPage;