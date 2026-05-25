import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User, Mail, Phone, Shield, Smartphone, Key,
    Eye, EyeOff, Edit2, Check, X, Calendar,
    CheckCircle2, AlertTriangle, LogOut, Award,
    CreditCard, Zap, QrCode, Copy, Bell, Building2,
    Link as LinkIcon, BarChart3, ExternalLink, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Dati mock ─────────────────────────────────────────────────────────────────
const PROFILO_INIZIALE = {
    id: 7,
    nome: 'Roberto',
    cognome: 'Bruno',
    email: 'roberto.bruno@cria.it',
    telefono: '+39 339 1234567',
    codiceFiscale: 'BRNRBR80A01F205Z',

    // Dati pagamento
    partitaIVA: 'IT01234567890',
    iban: 'IT60 X054 2811 1010 0000 0123 456',

    // Codice referente
    codiceReferente: 'CRIA-RB-2026',

    createdAt: '2025-08-20',
    ultimoAccesso: '2026-05-04 09:30',
    twoFactorEnabled: true,
};

const STATISTICHE_CODICE = {
    utilizziTotali: 47,
    registrazioni: 32,
    acquisti: 28,
    conversione: 87.5, // acquisti / registrazioni
    ultimoMese: 8,
};

const PREFERENZE_INIZIALI = {
    emailNuoviClienti: true,
    emailProvvigioni: true,
    emailContestazioni: true,
    emailReport: true,
};

const SESSIONI = [
    { id: 1, dispositivo: 'MacBook Pro · Chrome', posizione: 'Milano, IT', data: '2026-05-04 09:30', corrente: true },
    { id: 2, dispositivo: 'iPhone · Safari', posizione: 'Milano, IT', data: '2026-05-03 19:00', corrente: false },
];

const URL_REFERENTE = `https://cria.it/registrazione?ref=${PROFILO_INIZIALE.codiceReferente}`;

// ─── Campo editabile ──────────────────────────────────────────────────────────
const CampoEditabile = ({ label, value, onSave, type = 'text', icon: Icon, readonly }) => {
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
                    {!readonly && (
                        <button onClick={() => setEditing(true)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Forza password ───────────────────────────────────────────────────────────
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

// ─── Toggle ──────────────────────────────────────────────────────────────────
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

// ─── Componente principale ────────────────────────────────────────────────────
const ProfiloCommercialePage = () => {
    const [profilo, setProfilo] = useState(PROFILO_INIZIALE);
    const [preferenze, setPreferenze] = useState(PREFERENZE_INIZIALI);
    const [showPwdSection, setShowPwd] = useState(false);
    const [pwdAttuale, setPwdAttuale] = useState('');
    const [nuovaPwd, setNuovaPwd] = useState('');
    const [confermaPwd, setConfermaPwd] = useState('');
    const [showPwdEye, setShowEye] = useState({ attuale: false, nuova: false, conferma: false });

    const aggiorna = (campo, val) => setProfilo(p => ({ ...p, [campo]: val }));
    const setPref = (campo, val) => { setPreferenze(p => ({ ...p, [campo]: val })); toast.success('Preferenze aggiornate'); };

    const cambiaPassword = () => {
        if (!pwdAttuale.trim()) { toast.error('Inserisci la password attuale'); return; }
        if (nuovaPwd.length < 8) { toast.error('Almeno 8 caratteri'); return; }
        if (nuovaPwd !== confermaPwd) { toast.error('Le password non coincidono'); return; }
        if (!/[A-Z]/.test(nuovaPwd) || !/[0-9]/.test(nuovaPwd)) { toast.error('Devono esserci maiuscole e numeri'); return; }
        toast.success('Password aggiornata');
        setPwdAttuale(''); setNuovaPwd(''); setConfermaPwd(''); setShowPwd(false);
    };

    const copiaCodice = () => {
        navigator.clipboard.writeText(profilo.codiceReferente);
        toast.success('Codice referente copiato');
    };

    const copiaLink = () => {
        navigator.clipboard.writeText(URL_REFERENTE);
        toast.success('Link di registrazione copiato');
    };

    return (
        <>
            <Helmet><title>Profilo - CRIA Commerciale</title></Helmet>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Intestazione */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Il mio profilo</h1>
                        <p className="text-sm text-muted-foreground">Dati personali, codice referente e impostazioni</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-base font-bold text-primary uppercase">
                                {profilo.nome[0]}{profilo.cognome[0]}
                            </span>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{profilo.nome} {profilo.cognome}</p>
                            <p className="text-xs text-muted-foreground">Commerciale CRIA</p>
                        </div>
                    </div>
                </div>

                {/* 1. Codice referente — IN EVIDENZA */}
                <Card className="border-2 border-primary/30">
                    <CardHeader className="pb-3 bg-primary/5">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Award className="w-5 h-5 text-primary" /> Il tuo codice referente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-5">

                        {/* Codice grande */}
                        <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-xl flex-wrap">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Codice</p>
                                <p className="text-2xl font-bold font-mono text-primary">{profilo.codiceReferente}</p>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2 ml-auto" onClick={copiaCodice}>
                                <Copy className="w-4 h-4" /> Copia
                            </Button>
                        </div>

                        {/* URL diretto */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Link di registrazione diretto</p>
                            <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg flex-wrap">
                                <LinkIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <code className="text-xs flex-1 truncate min-w-0">{URL_REFERENTE}</code>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" className="gap-1 h-7" onClick={copiaLink}>
                                        <Copy className="w-3.5 h-3.5" />
                                    </Button>
                                    <a href={URL_REFERENTE} target="_blank" rel="noopener noreferrer">
                                        <Button variant="ghost" size="sm" className="gap-1 h-7">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Button>
                                    </a>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Condividi questo link via email, WhatsApp, social. Chi si registra usando questo link verrà automaticamente associato a te.
                            </p>
                        </div>

                        {/* Statistiche utilizzo */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                                <BarChart3 className="w-3.5 h-3.5" /> Statistiche utilizzo
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Click totali', value: STATISTICHE_CODICE.utilizziTotali },
                                    { label: 'Registrazioni', value: STATISTICHE_CODICE.registrazioni },
                                    { label: 'Acquisti completati', value: STATISTICHE_CODICE.acquisti },
                                    { label: 'Conversione', value: `${STATISTICHE_CODICE.conversione}%` },
                                ].map(s => (
                                    <div key={s.label} className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-xs text-muted-foreground">{s.label}</p>
                                        <p className="text-lg font-bold tabular-nums text-foreground mt-1">{s.value}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
                                <TrendingUp className="w-3 h-3 text-green-600" />
                                {STATISTICHE_CODICE.ultimoMese} acquisti questo mese
                            </p>
                        </div>

                    </CardContent>
                </Card>

                {/* 2. Dati personali */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <User className="w-5 h-5" /> Dati personali
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <CampoEditabile label="Nome" value={profilo.nome} onSave={v => aggiorna('nome', v)} />
                            <CampoEditabile label="Cognome" value={profilo.cognome} onSave={v => aggiorna('cognome', v)} />
                            <CampoEditabile label="Email" value={profilo.email} onSave={v => aggiorna('email', v)} type="email" icon={Mail} />
                            <CampoEditabile label="Telefono" value={profilo.telefono} onSave={v => aggiorna('telefono', v)} type="tel" icon={Phone} />
                            <CampoEditabile label="Codice fiscale" value={profilo.codiceFiscale} onSave={v => aggiorna('codiceFiscale', v)} />
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Account creato</p>
                                <p className="font-medium text-foreground flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {new Date(profilo.createdAt).toLocaleDateString('it-IT')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Pagamento provvigioni */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CreditCard className="w-5 h-5" /> Pagamento provvigioni
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <CampoEditabile label="Partita IVA" value={profilo.partitaIVA} onSave={v => aggiorna('partitaIVA', v)} icon={Building2} />
                        <CampoEditabile label="IBAN per ricevere bonifici" value={profilo.iban} onSave={v => aggiorna('iban', v)} />
                        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            Le provvigioni maturate ti vengono bonificate entro la fine del mese successivo a questo IBAN.
                        </p>
                    </CardContent>
                </Card>

                {/* 4. Sicurezza */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Shield className="w-5 h-5" /> Sicurezza
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        <div className="flex items-start justify-between gap-4 p-4 bg-muted/30 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                    <Key className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">Password</p>
                                    <p className="text-xs text-muted-foreground">Cambia regolarmente la password</p>
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
                                    <div className="relative">
                                        <Input type={showPwdEye.attuale ? 'text' : 'password'} value={pwdAttuale}
                                            onChange={e => setPwdAttuale(e.target.value)} placeholder="••••••••" style={{ paddingRight: '2.5rem' }} />
                                        <button onClick={() => setShowEye(s => ({ ...s, attuale: !s.attuale }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            {showPwdEye.attuela ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Nuova password</Label>
                                    <div className="relative">
                                        <Input type={showPwdEye.nuova ? 'text' : 'password'} value={nuovaPwd}
                                            onChange={e => setNuovaPwd(e.target.value)} placeholder="••••••••" style={{ paddingRight: '2.5rem' }} />
                                        <button onClick={() => setShowEye(s => ({ ...s, nuova: !s.nuova }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            {showPwdEye.nuova ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <ForzaPwd pwd={nuovaPwd} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Conferma nuova password</Label>
                                    <div className="relative">
                                        <Input type={showPwdEye.conferma ? 'text' : 'password'} value={confermaPwd}
                                            onChange={e => setConfermaPwd(e.target.value)} placeholder="••••••••" style={{ paddingRight: '2.5rem' }} />
                                        <button onClick={() => setShowEye(s => ({ ...s, conferma: !s.conferma }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                            {showPwdEye.conferma ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <Button onClick={cambiaPassword} className="gap-2">
                                    <Zap className="w-4 h-4" /> Aggiorna password
                                </Button>
                            </div>
                        )}

                        <div className="flex items-start justify-between gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                                    <Smartphone className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-foreground">Autenticazione a 2 fattori</p>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircle2 className="w-3 h-3" /> Attiva
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Account protetto con codice da app autenticatore
                                    </p>
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                {/* 5. Notifiche */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Bell className="w-5 h-5" /> Notifiche email
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <Toggle label="Nuovi clienti acquisiti" descrizione="Quando un cliente si registra usando il tuo codice"
                            value={preferenze.emailNuoviClienti} onChange={v => setPref('emailNuoviClienti', v)} />
                        <Toggle label="Provvigioni" descrizione="Quando matura una nuova provvigione o viene effettuato un pagamento"
                            value={preferenze.emailProvvigioni} onChange={v => setPref('emailProvvigioni', v)} />
                        <Toggle label="Contestazioni" descrizione="Quando viene aperta una contestazione su un tuo contratto (sola informazione)"
                            value={preferenze.emailContestazioni} onChange={v => setPref('emailContestazioni', v)} />
                        <Toggle label="Report mensili" descrizione="Riepilogo mensile delle tue vendite e provvigioni"
                            value={preferenze.emailReport} onChange={v => setPref('emailReport', v)} />
                    </CardContent>
                </Card>

                {/* 6. Sessioni */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
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
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {SESSIONI.map(s => (
                                    <tr key={s.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-medium text-foreground">{s.dispositivo}</p>
                                                {s.corrente && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Corrente
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.posizione}</td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">{s.data}</td>
                                        <td className="px-4 py-3 text-right">
                                            {!s.corrente && (
                                                <Button size="sm" variant="ghost" className="text-red-600 gap-1.5"
                                                    onClick={() => toast.success('Sessione terminata')}>
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

            </div>
        </>
    );
};

export default ProfiloCommercialePage;