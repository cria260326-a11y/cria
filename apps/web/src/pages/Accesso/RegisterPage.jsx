import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

// ─── Prefissi telefonici ───────────────────────────────────────────────────────
const PREFISSI = [
    { code: '+39', label: '🇮🇹 +39' },
    { code: '+41', label: '🇨🇭 +41' },
    { code: '+33', label: '🇫🇷 +33' },
    { code: '+49', label: '🇩🇪 +49' },
    { code: '+44', label: '🇬🇧 +44' },
    { code: '+1', label: '🇺🇸 +1' },
];

// ─── Validatori ────────────────────────────────────────────────────────────────
const validatori = {
    nome: (v) => v.trim().length >= 2 ? null : 'Il nome deve avere almeno 2 caratteri',
    cognome: (v) => v.trim().length >= 2 ? null : 'Il cognome deve avere almeno 2 caratteri',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Email non valida',
    telefono: (v) => /^\d{6,15}$/.test(v.replace(/\s/g, '')) ? null : 'Numero non valido (6-15 cifre)',
    tipoAccount: (v) => v ? null : 'Seleziona il tipo di account',
    password: (v) => {
        if (v.length < 8) return 'Almeno 8 caratteri';
        if (!/[A-Z]/.test(v)) return 'Almeno una lettera maiuscola';
        if (!/[0-9]/.test(v)) return 'Almeno un numero';
        return null;
    },
    confermaPassword: (v, form) => v === form.password ? null : 'Le password non coincidono',
};

// ─── Indicatore forza password ─────────────────────────────────────────────────
const ForzaPassword = ({ password }) => {
    if (!password) return null;
    const checks = [
        { label: '8+ caratteri', ok: password.length >= 8 },
        { label: 'Maiuscola', ok: /[A-Z]/.test(password) },
        { label: 'Numero', ok: /[0-9]/.test(password) },
        { label: 'Simbolo', ok: /[^A-Za-z0-9]/.test(password) },
    ];
    const score = checks.filter(c => c.ok).length;
    const colore = score <= 1 ? 'bg-red-500' : score === 2 ? 'bg-orange-500' : score === 3 ? 'bg-yellow-500' : 'bg-green-500';
    const etichetta = score <= 1 ? 'Debole' : score === 2 ? 'Discreta' : score === 3 ? 'Buona' : 'Forte';

    return (
        <div className="space-y-2 mt-1">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colore : 'bg-muted'}`} />
                ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
                {checks.map(c => (
                    <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {c.ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {c.label}
                    </span>
                ))}
                <span className={`text-xs font-medium ml-auto ${colore.replace('bg-', 'text-')}`}>{etichetta}</span>
            </div>
        </div>
    );
};

// ─── Componente principale ─────────────────────────────────────────────────────
const RegisterPage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nome: '', cognome: '', email: '',
        prefisso: '+39', telefono: '',
        tipoAccount: '',
        password: '', confermaPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const set = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (touched[field]) validate(field, value);
    };

    const validate = (field, value) => {
        const fn = validatori[field];
        if (!fn) return null;
        const err = field === 'confermaPassword' ? fn(value, form) : fn(value);
        setErrors(prev => ({ ...prev, [field]: err }));
        return err;
    };

    const touch = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validate(field, form[field]);
    };

    const validateAll = () => {
        const newErrors = {};
        const fields = ['nome', 'cognome', 'email', 'telefono', 'tipoAccount', 'password', 'confermaPassword'];
        fields.forEach(f => {
            const fn = validatori[f];
            if (fn) newErrors[f] = f === 'confermaPassword' ? fn(form[f], form) : fn(form[f]);
        });
        setErrors(newErrors);
        setTouched(Object.fromEntries(fields.map(f => [f, true])));
        return Object.values(newErrors).every(e => !e);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateAll()) return;
        setLoading(true);
        // TODO: chiamata Edge Function / Supabase Auth
        setTimeout(() => {
            setLoading(false);
            sessionStorage.setItem('tipo_account', form.tipoAccount); // aggiungi questa riga
            setSubmitted(true);
        }, 1200);
    };

    const FieldError = ({ field }) => errors[field] && touched[field]
        ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
        : null;

    const inputClass = (field) => `w-full text-sm rounded-lg border px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${errors[field] && touched[field] ? 'border-red-400' : 'border-border'
        }`;

    // ── Schermata conferma email ──
    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
                <div className="w-full max-w-md text-center space-y-5">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Controlla la tua email</h1>
                    <p className="text-muted-foreground">
                        Abbiamo inviato un link di verifica a <strong>{form.email}</strong>.
                        Clicca il link per attivare il tuo account e iniziare l'onboarding.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Non hai ricevuto nulla?{' '}
                        <button className="text-primary underline">Invia di nuovo</button>
                    </p>
                    <Link to="/login">
                        <Button variant="outline" className="w-full">Torna al login</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet><title>Registrati - CRIA</title></Helmet>

            <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">

                {/* Header */}
                <header className="bg-transparent">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-end h-16">
                            <Link to="/">
                                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                                    Torna alla home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center px-4 py-8">
                    <div className="w-full max-w-md space-y-6">

                        {/* Logo + titolo */}
                        <div className="text-center space-y-2">
                            <img src="/logo.png" alt="CRIA" className="h-14 w-auto mx-auto mb-2" />
                            <h1 className="text-2xl font-bold text-foreground">Crea il tuo account</h1>
                            <p className="text-sm text-muted-foreground">
                                Hai già un account?{' '}
                                <Link to="/login" className="text-primary font-medium hover:underline">Accedi</Link>
                            </p>
                        </div>

                        {/* Form */}
                        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
                            <form onSubmit={handleSubmit} noValidate className="space-y-4">

                                {/* Tipo account */}
                                <div className="space-y-1">
                                    <Label>Tipo account <span className="text-red-500">*</span></Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Privato', 'agenzia / agenzia'].map(tipo => (
                                            <button
                                                key={tipo}
                                                type="button"
                                                onClick={() => set('tipoAccount', tipo)}
                                                className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${form.tipoAccount === tipo
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-border text-muted-foreground hover:border-primary/50'
                                                    }`}
                                            >
                                                {tipo}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.tipoAccount && touched.tipoAccount && (
                                        <p className="text-xs text-red-500">{errors.tipoAccount}</p>
                                    )}
                                </div>

                                {/* Nome + Cognome */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="nome">Nome <span className="text-red-500">*</span></Label>
                                        <input id="nome" type="text" value={form.nome}
                                            onChange={e => set('nome', e.target.value)}
                                            onBlur={() => touch('nome')}
                                            placeholder="Mario"
                                            className={inputClass('nome')} />
                                        <FieldError field="nome" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="cognome">Cognome <span className="text-red-500">*</span></Label>
                                        <input id="cognome" type="text" value={form.cognome}
                                            onChange={e => set('cognome', e.target.value)}
                                            onBlur={() => touch('cognome')}
                                            placeholder="Rossi"
                                            className={inputClass('cognome')} />
                                        <FieldError field="cognome" />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                    <input id="email" type="email" value={form.email}
                                        onChange={e => set('email', e.target.value)}
                                        onBlur={() => touch('email')}
                                        placeholder="mario.rossi@email.it"
                                        className={inputClass('email')} />
                                    <FieldError field="email" />
                                </div>

                                {/* Telefono */}
                                <div className="space-y-1">
                                    <Label htmlFor="telefono">Telefono <span className="text-red-500">*</span></Label>
                                    <div className="flex gap-2">
                                        <select
                                            value={form.prefisso}
                                            onChange={e => set('prefisso', e.target.value)}
                                            className="text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 flex-shrink-0"
                                        >
                                            {PREFISSI.map(p => (
                                                <option key={p.code} value={p.code}>{p.label}</option>
                                            ))}
                                        </select>
                                        <input id="telefono" type="tel" value={form.telefono}
                                            onChange={e => set('telefono', e.target.value)}
                                            onBlur={() => touch('telefono')}
                                            placeholder="333 1234567"
                                            className={`flex-1 ${inputClass('telefono')}`} />
                                    </div>
                                    <FieldError field="telefono" />
                                </div>

                                {/* Password */}
                                <div className="space-y-1">
                                    <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <input id="password" type={showPwd ? 'text' : 'password'} value={form.password}
                                            onChange={e => set('password', e.target.value)}
                                            onBlur={() => touch('password')}
                                            placeholder="••••••••"
                                            className={inputClass('password')}
                                            style={{ paddingRight: '2.5rem' }} />
                                        <button type="button" onClick={() => setShowPwd(s => !s)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <ForzaPassword password={form.password} />
                                    <FieldError field="password" />
                                </div>

                                {/* Conferma password */}
                                <div className="space-y-1">
                                    <Label htmlFor="confermaPassword">Conferma password <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <input id="confermaPassword" type={showConfirm ? 'text' : 'password'} value={form.confermaPassword}
                                            onChange={e => set('confermaPassword', e.target.value)}
                                            onBlur={() => touch('confermaPassword')}
                                            placeholder="••••••••"
                                            className={inputClass('confermaPassword')}
                                            style={{ paddingRight: '2.5rem' }} />
                                        <button type="button" onClick={() => setShowConfirm(s => !s)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {form.confermaPassword && form.confermaPassword === form.password && (
                                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                            <CheckCircle2 className="w-3 h-3" /> Le password coincidono
                                        </p>
                                    )}
                                    <FieldError field="confermaPassword" />
                                </div>

                                {/* Privacy */}
                                <p className="text-xs text-muted-foreground">
                                    Registrandoti accetti i nostri{' '}
                                    <Link to="/termini" className="text-primary hover:underline">Termini di servizio</Link>{' '}
                                    e la{' '}
                                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                                </p>

                                {/* Submit */}
                                <Button type="submit" className="w-full gap-2" disabled={loading}>
                                    {loading ? (
                                        <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Creazione account...</>
                                    ) : (
                                        'Crea account'
                                    )}
                                </Button>

                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Shield className="w-3.5 h-3.5" />
                            <span>I tuoi dati sono protetti e crittografati</span>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default RegisterPage;