import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, ChevronRight, Eye, EyeOff, Key, Lock, Monitor, ShieldCheck, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { OGGI } from '@/data/datiDemo';
import { fmtData } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// SEZIONI DEL PROFILO — le stesse righe del profilo personale (F-12), scritte
// per essere usate da tutte le aree: dato con o senza modifica, password,
// accesso in due passaggi, preferenze, voce dell'account, sessione. Il profilo
// interno (O-32) le usa già; F-12 può importarle da qui al posto delle sue.
// ═════════════════════════════════════════════════════════════════════════════

// Un dato del profilo. Senza onSalva non si modifica, e il lucchetto dice chi lo cambia.
// onSalva può restituire (anche con una promessa) { ok, messaggio }: se non va,
// il campo resta aperto e si dice perché.
export const CampoProfilo = ({ etichetta, valore, icona: Icona, onSalva, tipo = 'text', chiLoCambia }) => {
    const [modifica, setModifica] = useState(false);
    const [testo, setTesto] = useState(valore || '');
    const conferma = async () => {
        if (!testo.trim()) { toast.error(`${etichetta}: il campo non può restare vuoto`); return; }
        const esito = await onSalva(testo.trim());
        if (esito && esito.ok === false) { toast.error(esito.messaggio || `${etichetta}: non salvato`); return; }
        setModifica(false);
        toast.success(`${etichetta} aggiornato`);
    };
    const annulla = () => { setTesto(valore || ''); setModifica(false); };

    return (
        <div className="min-w-0">
            <p className="text-xs text-muted-foreground mb-1">{etichetta}</p>
            {modifica ? (
                <div className="flex items-center gap-2">
                    <Input type={tipo} value={testo} onChange={e => setTesto(e.target.value)} className="h-9 text-sm" autoFocus
                        aria-label={etichetta}
                        onKeyDown={e => { if (e.key === 'Enter') conferma(); if (e.key === 'Escape') annulla(); }} />
                    <button type="button" onClick={conferma} className="p-1 text-green-700" aria-label="Salva"><Check className="w-4 h-4" /></button>
                    <button type="button" onClick={annulla} className="p-1 text-red-700" aria-label="Annulla"><X className="w-4 h-4" /></button>
                </div>
            ) : (
                <div className="flex items-center gap-2 flex-wrap">
                    {Icona && <Icona className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                    <p className="font-medium text-foreground break-all">{valore || '—'}</p>
                    {onSalva ? (
                        <button type="button" onClick={() => setModifica(true)} className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">
                            Modifica
                        </button>
                    ) : chiLoCambia && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title={`Lo cambia ${chiLoCambia}`}>
                            <Lock className="w-3 h-3" /> {chiLoCambia}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Password ─────────────────────────────────────────────────────────────────
const CONTROLLI_PASSWORD = [
    { prova: p => p.length >= 8, etichetta: 'Almeno 8 caratteri' },
    { prova: p => /[A-Z]/.test(p), etichetta: 'Una maiuscola' },
    { prova: p => /[0-9]/.test(p), etichetta: 'Un numero' },
    { prova: p => /[^A-Za-z0-9]/.test(p), etichetta: 'Un simbolo' },
];

const CampoPassword = ({ id, etichetta, valore, onCambia }) => {
    const [visibile, setVisibile] = useState(false);
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-xs">{etichetta}</Label>
            <div className="relative">
                <Input id={id} type={visibile ? 'text' : 'password'} value={valore} onChange={e => onCambia(e.target.value)}
                    autoComplete={id === 'password-attuale' ? 'current-password' : 'new-password'} className="pr-10" />
                <button type="button" onClick={() => setVisibile(v => !v)} aria-label={visibile ? 'Nascondi' : 'Mostra'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {visibile ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};

export const SezionePassword = ({ modificataIl }) => {
    const [aperta, setAperta] = useState(false);
    const [attuale, setAttuale] = useState('');
    const [nuova, setNuova] = useState('');
    const [conferma, setConferma] = useState('');
    const superati = CONTROLLI_PASSWORD.filter(c => c.prova(nuova)).length;

    const chiudi = () => { setAttuale(''); setNuova(''); setConferma(''); setAperta(false); };
    const salva = () => {
        if (!attuale) { toast.error('Scrivi la password di adesso'); return; }
        if (superati < 3 || !CONTROLLI_PASSWORD[0].prova(nuova)) { toast.error('La nuova password è troppo debole'); return; }
        if (nuova !== conferma) { toast.error('Le due password non coincidono'); return; }
        toast.success('Password aggiornata');
        chiudi();
    };

    return (
        <div className="rounded-xl bg-muted/30 p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0"><Key className="w-4 h-4 text-blue-700" /></div>
                    <div>
                        <p className="font-medium text-foreground">Password</p>
                        <p className="text-xs text-muted-foreground">{modificataIl ? `Impostata il ${fmtData(modificataIl)}` : 'Impostata all’attivazione'}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => (aperta ? chiudi() : setAperta(true))}>{aperta ? 'Annulla' : 'Modifica'}</Button>
            </div>
            {aperta && (
                <div className="space-y-4 border-t border-border pt-4">
                    <CampoPassword id="password-attuale" etichetta="Password di adesso" valore={attuale} onCambia={setAttuale} />
                    <div className="space-y-2">
                        <CampoPassword id="password-nuova" etichetta="Nuova password" valore={nuova} onCambia={setNuova} />
                        {nuova && (
                            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                {CONTROLLI_PASSWORD.map(c => (
                                    <li key={c.etichetta} className={c.prova(nuova) ? 'text-green-700' : 'text-muted-foreground'}>
                                        {c.prova(nuova) ? '✓' : '○'} {c.etichetta}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <CampoPassword id="password-conferma" etichetta="Scrivila di nuovo" valore={conferma} onCambia={setConferma} />
                    <Button onClick={salva}>Aggiorna la password</Button>
                </div>
            )}
        </div>
    );
};

// Il secondo passaggio all'accesso. Se è obbligatorio non si spegne.
export const DueFattori = ({ attiva, obbligatoria, perche }) => (
    <div className="rounded-xl bg-muted/30 p-4 flex items-start gap-3">
        <div className={`p-2 rounded-lg flex-shrink-0 ${attiva ? 'bg-green-100' : 'bg-amber-100'}`}>
            <Smartphone className={`w-4 h-4 ${attiva ? 'text-green-700' : 'text-amber-700'}`} />
        </div>
        <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-foreground">Accesso in due passaggi</p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${attiva ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {attiva ? 'Attivo' : 'Non attivo'}
                </span>
                {obbligatoria && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="w-3 h-3" /> Non si spegne</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{perche}</p>
        </div>
    </div>
);

// ─── Preferenze ───────────────────────────────────────────────────────────────
export const Preferenza = ({ id, etichetta, descrizione, attiva, onCambia, bloccata }) => (
    <div className={`flex items-start justify-between gap-4 rounded-lg p-3 ${bloccata ? 'bg-muted/30' : ''}`}>
        <div className="min-w-0">
            <label htmlFor={id} className="text-sm font-medium text-foreground flex items-center gap-2">
                {etichetta} {bloccata && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
            </label>
            {descrizione && <p className="text-xs text-muted-foreground mt-0.5">{descrizione}</p>}
        </div>
        {bloccata
            ? <span className="text-xs font-medium text-muted-foreground flex-shrink-0">Sempre attive</span>
            : <Switch id={id} checked={attiva} onCheckedChange={onCambia} />}
    </div>
);

// ─── Account ──────────────────────────────────────────────────────────────────
export const VoceAccount = ({ to, icona: Icona, titolo, testo, badge }) => (
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

// ─── Sessione ─────────────────────────────────────────────────────────────────
// Solo quella di questo browser, letta dal browser stesso: le altre le conosce
// il server, che nei mockup non c'è.
const descriviBrowser = () => {
    const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;
    const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
    const sistema = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : null;
    return sistema ? `${browser} su ${sistema}` : browser;
};

export const SessioneCorrente = ({ onEsciAltrove }) => (
    <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-xl border border-border p-4">
            <Monitor className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{descriviBrowser()}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Questa sessione</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Accesso del {fmtData(OGGI)}</p>
            </div>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Le sessioni aperte altrove le mostra il server.</p>
            <Button variant="outline" size="sm" onClick={onEsciAltrove}>Esci dagli altri dispositivi</Button>
        </div>
    </div>
);
