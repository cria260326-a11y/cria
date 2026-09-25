import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, CheckCircle2, UserCheck, Home, Link2, AlertTriangle, Clock } from 'lucide-react';
import AccessoShell, { SCHEDA, TITOLO_STILE } from '@/components/AccessoShell';
import RequisitiPassword, { passwordValida } from '@/components/RequisitiPassword';
import NotaMockup from '@/components/NotaMockup';

// ═════════════════════════════════════════════════════════════════════════════
// ATTIVAZIONE DA INVITO — F-06
// Il proprietario inserisce l'inquilino → l'inquilino riceve un link personale.
// Qui imposta la password e, se nel database esiste già un soggetto con i suoi
// dati, lo AGGANCIA all'account invece di crearne uno nuovo: altrimenti lo
// storico resterebbe su un record che nessun account vede.
//
// TODO fase 4: il token si valida lato server e porta con sé il soggetto trovato.
// ═════════════════════════════════════════════════════════════════════════════

const INVITO = {
    nome: 'Giulia',
    email: 'giulia.ferri@esempio.it',
    invitatoDa: 'Immobiliare Verdi S.r.l.',
    immobile: 'Via Padova 12, Milano',
};

// Il soggetto che esisteva già prima dell'account: inserito da un proprietario
// precedente, mai collegato a un login.
const SOGGETTO_ESISTENTE = {
    nome: 'Giulia Ferri',
    nascita: '5 aprile 1992, Milano',
    codiceFiscale: 'FRRGLI92D45F205W',
    posizioni: [
        { immobile: 'Via Padova 12, Milano', inseritaDa: 'Immobiliare Verdi S.r.l.', periodo: 'dal marzo 2025' },
        { immobile: 'Via Tadino 4, Milano', inseritaDa: 'Roberto Galli', periodo: 'da settembre 2022 a febbraio 2025' },
    ],
};

const mascheraCF = (cf) => `${cf.slice(0, 3)}${'•'.repeat(cf.length - 7)}${cf.slice(-4)}`;

const Intestazione = ({ icona: Icona, titolo, children }) => (
    <div className="space-y-3">
        <div className="w-12 h-12 bg-[#1A2D52]/5 rounded-xl flex items-center justify-center">
            <Icona className="w-6 h-6 text-[#1A2D52]" />
        </div>
        <h1 className="text-2xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>{titolo}</h1>
        {children}
    </div>
);

const AttivaAccountPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [fase, setFase] = useState('password');
    const [password, setPassword] = useState('');
    const [conferma, setConferma] = useState('');
    const [mostraPwd, setMostraPwd] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFase(token === 'scaduto' ? 'scaduto' : 'password');
    }, [token]);

    const confermaOk = password === conferma && conferma.length > 0;

    const impostaPassword = () => {
        if (!passwordValida(password) || !confermaOk) return;
        setLoading(true);
        // TODO fase 4: Edge Function attiva_account(token, password)
        setTimeout(() => {
            setLoading(false);
            setFase('aggancio');
        }, 700);
    };

    const entra = () => navigate('/login?email=inquilino@cri-affitti.it');

    return (
        <>
            <Helmet><title>Attiva il tuo account - CRIA</title></Helmet>

            <AccessoShell>
                {fase === 'scaduto' && (
                    <div className={`${SCHEDA} space-y-6 text-center`}>
                        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-7 h-7 text-amber-600" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>Il link di invito è scaduto</h1>
                            <p className="text-sm text-[#6B6B5E]">
                                I link di invito valgono per un tempo limitato. Chiedi a chi ti ha invitato di mandartene uno nuovo.
                            </p>
                        </div>
                        <Link to="/login" className="text-sm text-[#6B6B5E] hover:text-[#1A2D52] underline">Hai già un account? Accedi</Link>
                    </div>
                )}

                {fase === 'password' && (
                    <div className={`${SCHEDA} space-y-6`}>
                        <Intestazione icona={UserCheck} titolo={`Benvenuta su CRIA, ${INVITO.nome}`}>
                            <p className="text-sm text-[#6B6B5E]">
                                <span className="font-medium text-[#1A2D52]">{INVITO.invitatoDa}</span> ti ha aggiunta come inquilina per l'immobile:
                            </p>
                            <div className="flex items-center gap-2 p-3 bg-[#F5F5F0] rounded-lg text-sm text-[#1A2D52]">
                                <Home className="w-4 h-4 flex-shrink-0" /> {INVITO.immobile}
                            </div>
                            <p className="text-xs text-[#6B6B5E]">Imposta una password per attivare il tuo account ({INVITO.email}).</p>
                        </Intestazione>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-[#1A2D52] uppercase tracking-wide">Password</label>
                            <div className="relative">
                                <Input
                                    type={mostraPwd ? 'text' : 'password'}
                                    placeholder="La tua nuova password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="pr-10 h-11"
                                    autoFocus
                                />
                                <button type="button" onClick={() => setMostraPwd(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B5E] hover:text-[#1A2D52]">
                                    {mostraPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <RequisitiPassword password={password} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-[#1A2D52] uppercase tracking-wide">Conferma password</label>
                            <Input
                                type={mostraPwd ? 'text' : 'password'}
                                placeholder="Ripeti la password"
                                value={conferma}
                                onChange={e => setConferma(e.target.value)}
                                className="h-11"
                            />
                            {conferma.length > 0 && !confermaOk && <p className="text-xs text-red-600">Le password non coincidono.</p>}
                        </div>

                        <Button className="w-full h-11 bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={impostaPassword}
                            disabled={loading || !passwordValida(password) || !confermaOk}>
                            {loading ? 'Attivazione in corso...' : 'Continua'}
                        </Button>

                        <p className="text-xs text-[#6B6B5E] text-center">
                            Attivando l'account accetti i{' '}
                            <Link to="/termini" className="underline hover:text-[#1A2D52]">Termini di servizio</Link>
                            {' '}e la{' '}
                            <Link to="/privacy" className="underline hover:text-[#1A2D52]">Privacy Policy</Link>.
                        </p>
                    </div>
                )}

                {fase === 'aggancio' && (
                    <div className={`${SCHEDA} space-y-6`}>
                        <Intestazione icona={Link2} titolo="Esisti già nel nostro archivio">
                            <p className="text-sm text-[#6B6B5E]">
                                C'è già un profilo con i tuoi dati, inserito dai proprietari che hai avuto.
                                Collegandolo al tuo account vedi anche lo storico dei contratti precedenti.
                            </p>
                        </Intestazione>

                        <div className="rounded-xl border border-[#E5E5DE] divide-y divide-[#E5E5DE]">
                            <div className="p-4 space-y-0.5">
                                <p className="font-semibold text-[#1A2D52]">{SOGGETTO_ESISTENTE.nome}</p>
                                <p className="text-xs text-[#6B6B5E]">Nata il {SOGGETTO_ESISTENTE.nascita}</p>
                                <p className="text-xs text-[#6B6B5E] font-mono tracking-wide">{mascheraCF(SOGGETTO_ESISTENTE.codiceFiscale)}</p>
                            </div>
                            {SOGGETTO_ESISTENTE.posizioni.map(p => (
                                <div key={p.immobile} className="p-4 flex items-start gap-3">
                                    <Home className="w-4 h-4 text-[#6B6B5E] mt-0.5 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-medium text-[#1A2D52]">Inquilina · {p.immobile}</p>
                                        <p className="text-xs text-[#6B6B5E]">{p.periodo} · inserita da {p.inseritaDa}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Button className="w-full h-11 bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={() => setFase('attivato')}>
                                Sono io: collega il mio storico
                            </Button>
                            <Button variant="outline" className="w-full h-11" onClick={() => setFase('segnalato')}>
                                Qualcosa non corrisponde
                            </Button>
                        </div>
                    </div>
                )}

                {(fase === 'attivato' || fase === 'segnalato') && (
                    <div className={`${SCHEDA} space-y-6 text-center`}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${fase === 'attivato' ? 'bg-green-50' : 'bg-amber-50'}`}>
                            {fase === 'attivato'
                                ? <CheckCircle2 className="w-7 h-7 text-green-600" />
                                : <Clock className="w-7 h-7 text-amber-600" />}
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>
                                {fase === 'attivato' ? 'Account attivato' : 'Account attivato, storico in verifica'}
                            </h1>
                            <p className="text-sm text-[#6B6B5E]">
                                {fase === 'attivato'
                                    ? 'Il tuo storico è collegato: da ora lo trovi nella tua area.'
                                    : 'Abbiamo segnalato la differenza a un operatore, che controlla i dati prima di collegare lo storico e ti scrive quando è fatto. Intanto puoi entrare.'}
                            </p>
                        </div>
                        <Button className="w-full h-11 bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={entra}>Entra in CRIA</Button>
                    </div>
                )}

                <NotaMockup className="mt-6">
                    Varianti:{' '}
                    <Link className="underline" to="/attiva-account?token=demo">link valido</Link>
                    {' · '}
                    <Link className="underline" to="/attiva-account?token=scaduto">link scaduto</Link>.
                    Alla fine si entra come Giulia Ferri.
                </NotaMockup>
            </AccessoShell>
        </>
    );
};

export default AttivaAccountPage;
