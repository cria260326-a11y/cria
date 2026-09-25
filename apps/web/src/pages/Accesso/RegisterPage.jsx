import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff, CheckCircle2, XCircle, User, Building2 } from 'lucide-react';
import BottoneGoogle from '@/components/BottoneGoogle';
import NotaMockup from '@/components/NotaMockup';
import CorniceAccesso, { fontTitolo } from '@/components/accesso/CorniceAccesso';
import { emailGiaUsata, telefonoGiaUsato, MESSAGGI_UNICITA } from '@/lib/unicita';
import { useAuth } from '@/contexts/AuthContext.jsx';

// ═════════════════════════════════════════════════════════════════════════════
// REGISTRAZIONE — F-02
// Solo i dati per entrare. Persona fisica e persona giuridica sono soggetti
// distinti, con reputazioni che non si sommano. La fatturazione si chiede al
// primo acquisto (F-13), l'identità si verifica dopo con il documento (F-07).
// L'iscrizione è vera: crea l'account e la persona nel database, e prima
// controlla che email e cellulare non siano già di qualcuno. Per ora senza
// conferma dell'email: si entra subito, e si carica il documento.
// ═════════════════════════════════════════════════════════════════════════════

const PREFISSI = [
    { code: '+39', label: '🇮🇹 +39' },
    { code: '+41', label: '🇨🇭 +41' },
    { code: '+33', label: '🇫🇷 +33' },
    { code: '+49', label: '🇩🇪 +49' },
    { code: '+44', label: '🇬🇧 +44' },
    { code: '+1', label: '🇺🇸 +1' },
];

const TIPI_PERSONA = [
    { valore: 'fisica', label: 'Persona fisica', icona: User },
    { valore: 'giuridica', label: 'Società o ente', icona: Building2 },
];

// Il valore è quello che legge l'onboarding (=== 'agenzia'). Prima veniva
// salvata l'etichetta, e le agenzie non ricevevano mai i passaggi dedicati.
const TIPI_ACCOUNT = [
    { valore: 'privato', label: 'Privato' },
    { valore: 'agenzia', label: 'Agenzia immobiliare' },
];

const giuridica = (form) => form.tipoPersona === 'giuridica';

const validatori = {
    tipoPersona: (v) => (v ? null : 'Indica se ti registri come persona o come società'),
    ragioneSociale: (v, form) => (!giuridica(form) || v.trim().length >= 2 ? null : 'Inserisci la ragione sociale'),
    partitaIva: (v, form) => (!giuridica(form) || /^\d{11}$/.test(v.replace(/\s/g, '')) ? null : 'La partita IVA ha 11 cifre'),
    nome: (v) => (v.trim().length >= 2 ? null : 'Il nome deve avere almeno 2 caratteri'),
    cognome: (v) => (v.trim().length >= 2 ? null : 'Il cognome deve avere almeno 2 caratteri'),
    // Email e cellulare già usati non passano: in CRIA ci si registra una volta sola.
    email: (v) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Email non valida';
        return emailGiaUsata(v) ? MESSAGGI_UNICITA.email : null;
    },
    telefono: (v, form) => {
        if (!/^\d{6,15}$/.test(v.replace(/\s/g, ''))) return 'Numero non valido (6-15 cifre)';
        return telefonoGiaUsato(`${form.prefisso}${v}`) ? MESSAGGI_UNICITA.telefono : null;
    },
    tipoAccount: (v) => (v ? null : 'Seleziona il tipo di account'),
    password: (v) => {
        if (v.length < 8) return 'Almeno 8 caratteri';
        if (!/[A-Z]/.test(v)) return 'Almeno una lettera maiuscola';
        if (!/[0-9]/.test(v)) return 'Almeno un numero';
        return null;
    },
    confermaPassword: (v, form) => (v === form.password ? null : 'Le password non coincidono'),
};

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

const RegisterPage = () => {
    const [form, setForm] = useState({
        tipoPersona: '', ragioneSociale: '', partitaIva: '',
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
    const [erroreGenerale, setErroreGenerale] = useState('');
    const { registrati } = useAuth();
    const navigate = useNavigate();

    const validate = (field, value, base = form) => {
        const fn = validatori[field];
        if (!fn) return null;
        const err = fn(value, { ...base, [field]: value });
        setErrors(prev => ({ ...prev, [field]: err }));
        return err;
    };

    const set = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (touched[field]) validate(field, value);
    };

    const touch = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validate(field, form[field]);
    };

    const campi = () => [
        'tipoPersona',
        ...(giuridica(form) ? ['ragioneSociale', 'partitaIva'] : []),
        'nome', 'cognome', 'email', 'telefono', 'tipoAccount', 'password', 'confermaPassword',
    ];

    const validateAll = () => {
        const fields = campi();
        const newErrors = {};
        fields.forEach(f => { newErrors[f] = validatori[f](form[f], form); });
        setErrors(newErrors);
        setTouched(Object.fromEntries(fields.map(f => [f, true])));
        return Object.values(newErrors).every(e => !e);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErroreGenerale('');
        if (!validateAll()) return;
        setLoading(true);
        const esito = await registrati({
            email: form.email,
            password: form.password,
            tipo: form.tipoPersona,
            nome: form.nome,
            cognome: form.cognome,
            ragioneSociale: giuridica(form) ? form.ragioneSociale : null,
            partitaIva: giuridica(form) ? form.partitaIva.replace(/\s/g, '') : null,
            telefono: `${form.prefisso} ${form.telefono.replace(/\s/g, '')}`,
            tipoAccount: form.tipoAccount,
        });
        setLoading(false);
        if (esito.errore) {
            // Email o cellulare già di qualcuno: l'errore va sul campo.
            const campo = { email_usata: 'email', telefono_usato: 'telefono' }[esito.errore];
            if (campo) {
                setErrors(prev => ({ ...prev, [campo]: MESSAGGI_UNICITA[campo] }));
                setTouched(prev => ({ ...prev, [campo]: true }));
                document.getElementById(campo)?.focus();
                return;
            }
            setErroreGenerale(esito.errore === 'debole'
                ? 'Questa password è troppo debole: scegline una più lunga.'
                : 'Non riusciamo a completare l’iscrizione adesso: riprova tra poco.');
            return;
        }
        sessionStorage.setItem('tipo_account', form.tipoAccount);
        sessionStorage.setItem('tipo_persona', form.tipoPersona);
        // Sul Mac, nel modo demo, l'iscrizione resta simulata.
        if (esito.simulata || esito.confermaEmail) {
            setSubmitted(true);
            return;
        }
        toast.success('Il tuo account è attivo: ora carica il documento d’identità');
        navigate('/dashboard', { replace: true });
    };

    const FieldError = ({ field }) => (errors[field] && touched[field]
        ? <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
        : null);

    const inputClass = (field) => `w-full text-sm rounded-lg border px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${errors[field] && touched[field] ? 'border-red-400' : 'border-border'}`;

    const sceltaClass = (attiva) => `px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${attiva
        ? 'border-primary bg-primary/5 text-primary'
        : 'border-border text-muted-foreground hover:border-primary/50'}`;

    if (submitted) {
        return (
            <>
                <Helmet><title>Controlla la tua email - CRIA</title></Helmet>
                <CorniceAccesso variante="registrazione">
                    <div className="space-y-5">
                        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-7 h-7 text-green-600" />
                        </div>
                        <h1 className="text-3xl text-[#1A2D52]" style={fontTitolo}>Controlla la tua email</h1>
                        <p className="text-[#6B6B5E]">
                            Abbiamo inviato un link di verifica a <strong className="text-[#1A2D52]">{form.email}</strong>.
                            Aprilo per confermare l’indirizzo: il passo successivo è il documento d’identità.
                        </p>
                        <p className="text-sm text-[#6B6B5E]">
                            Non hai ricevuto nulla?{' '}
                            <button type="button" className="text-[#1A2D52] underline underline-offset-4">Invia di nuovo</button>
                        </p>
                        <Link to="/login" className="block">
                            <Button variant="outline" className="w-full h-11">Torna al login</Button>
                        </Link>
                        <NotaMockup>
                            <Link to="/verifica-email?token=demo" className="underline font-medium">
                                Simula il click sul link ricevuto via email
                            </Link>
                        </NotaMockup>
                    </div>
                </CorniceAccesso>
            </>
        );
    }

    return (
        <>
            <Helmet><title>Registrati - CRIA</title></Helmet>

            <CorniceAccesso variante="registrazione">
                <div className="space-y-6 py-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl text-[#1A2D52]" style={fontTitolo}>Crea il tuo account</h1>
                        <p className="text-[#6B6B5E]">
                            Hai già un account?{' '}
                            <Link to="/login" className="font-medium text-[#1A2D52] hover:underline underline-offset-4">Accedi</Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">

                        <div className="space-y-1">
                            <Label>Ti registri come <span className="text-red-500">*</span></Label>
                            <div className="grid grid-cols-2 gap-3">
                                {TIPI_PERSONA.map(({ valore, label, icona: Icona }) => (
                                    <button key={valore} type="button" onClick={() => set('tipoPersona', valore)}
                                        className={`${sceltaClass(form.tipoPersona === valore)} flex items-center justify-center gap-2`}>
                                        <Icona className="w-4 h-4" /> {label}
                                    </button>
                                ))}
                            </div>
                            <FieldError field="tipoPersona" />
                        </div>

                        {giuridica(form) && (
                            <div className="space-y-4 rounded-xl bg-muted/30 p-4">
                                <div className="space-y-1">
                                    <Label htmlFor="ragioneSociale">Ragione sociale <span className="text-red-500">*</span></Label>
                                    <input id="ragioneSociale" type="text" value={form.ragioneSociale}
                                        onChange={e => set('ragioneSociale', e.target.value)}
                                        onBlur={() => touch('ragioneSociale')}
                                        placeholder="Immobiliare Esempio S.r.l."
                                        className={inputClass('ragioneSociale')} />
                                    <FieldError field="ragioneSociale" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="partitaIva">Partita IVA <span className="text-red-500">*</span></Label>
                                    <input id="partitaIva" type="text" inputMode="numeric" value={form.partitaIva}
                                        onChange={e => set('partitaIva', e.target.value)}
                                        onBlur={() => touch('partitaIva')}
                                        placeholder="12345678901"
                                        className={inputClass('partitaIva')} />
                                    <FieldError field="partitaIva" />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="nome">{giuridica(form) ? 'Nome del referente' : 'Nome'} <span className="text-red-500">*</span></Label>
                                <input id="nome" type="text" value={form.nome}
                                    onChange={e => set('nome', e.target.value)}
                                    onBlur={() => touch('nome')}
                                    placeholder="Mario"
                                    className={inputClass('nome')} />
                                <FieldError field="nome" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="cognome">{giuridica(form) ? 'Cognome del referente' : 'Cognome'} <span className="text-red-500">*</span></Label>
                                <input id="cognome" type="text" value={form.cognome}
                                    onChange={e => set('cognome', e.target.value)}
                                    onBlur={() => touch('cognome')}
                                    placeholder="Rossi"
                                    className={inputClass('cognome')} />
                                <FieldError field="cognome" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label>Tipo di account <span className="text-red-500">*</span></Label>
                            <div className="grid grid-cols-2 gap-3">
                                {TIPI_ACCOUNT.map(({ valore, label }) => (
                                    <button key={valore} type="button" onClick={() => set('tipoAccount', valore)}
                                        className={sceltaClass(form.tipoAccount === valore)}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                            {form.tipoAccount === 'agenzia' && (
                                <p className="text-xs text-muted-foreground">Per chi gestisce immobili per conto dei proprietari.</p>
                            )}
                            <FieldError field="tipoAccount" />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                            <input id="email" type="email" value={form.email}
                                onChange={e => set('email', e.target.value)}
                                onBlur={() => touch('email')}
                                placeholder="mario.rossi@email.it"
                                className={inputClass('email')} />
                            <FieldError field="email" />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="telefono">Cellulare <span className="text-red-500">*</span></Label>
                            <div className="flex gap-2">
                                <select
                                    value={form.prefisso}
                                    onChange={e => set('prefisso', e.target.value)}
                                    className="text-sm border border-border rounded-lg px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 flex-shrink-0"
                                >
                                    {PREFISSI.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
                                </select>
                                <input id="telefono" type="tel" value={form.telefono}
                                    onChange={e => set('telefono', e.target.value)}
                                    onBlur={() => touch('telefono')}
                                    placeholder="333 1234567"
                                    className={`flex-1 ${inputClass('telefono')}`} />
                            </div>
                            <p className="text-xs text-muted-foreground">Serve per gli avvisi importanti via SMS.</p>
                            <FieldError field="telefono" />
                        </div>

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

                        <p className="text-xs text-muted-foreground">
                            Registrandoti accetti i nostri{' '}
                            <Link to="/termini" className="text-primary hover:underline">Termini di servizio</Link>{' '}
                            e la{' '}
                            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                        </p>

                        {erroreGenerale && <p className="text-sm text-red-600" role="alert">{erroreGenerale}</p>}

                        <Button type="submit" className="w-full h-12 gap-2 text-base bg-[#1A2D52] hover:bg-[#0F1B33]" disabled={loading}>
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Creazione account...</>
                            ) : 'Crea account'}
                        </Button>
                    </form>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-[#E5E5DE]" />
                            <span className="text-xs text-[#6B6B5E]">oppure</span>
                            <div className="h-px flex-1 bg-[#E5E5DE]" />
                        </div>
                        <BottoneGoogle testo="Registrati con Google" />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#6B6B5E]">
                        <Shield className="w-3.5 h-3.5" />
                        <span>I tuoi dati sono protetti e crittografati</span>
                    </div>
                </div>
            </CorniceAccesso>
        </>
    );
};

export default RegisterPage;
