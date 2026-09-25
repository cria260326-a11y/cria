import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ReceiptEuro, Clock, Wallet, Loader2, Lock, CheckCircle2, AlertCircle, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AccessoShell, { SCHEDA, TITOLO_STILE } from '@/components/AccessoShell';
import NotaMockup from '@/components/NotaMockup';
import MetodiPagamento from '@/components/aree/MetodiPagamento';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { creaVerifica } from '@/lib/verificheDemo';
import { NESSUNA_INFORMAZIONE } from '@/data/verifiche';
import { OGGI } from '@/data/datiDemo';
import { PRODOTTI, fmtEuro } from '@/data/catalogo';
import { isVerificata, nomeVisualizzato } from '@/lib/aree';
import { useProdotti, causaleCliente } from '@/lib/prodottiDemo';
import { cn } from '@/lib/utils';

// ═════════════════════════════════════════════════════════════════════════════
// NUOVA VERIFICA — E-03 (CRIA Verifica, P3)
// Chi sta per affittare interroga CRIA su un candidato inquilino. Serve un
// account con l'identità verificata e i dati di fatturazione: senza, la
// richiesta non parte. Si paga alla richiesta; l'esito arriva entro le ore del
// prodotto e si legge solo in piattaforma. Quello che si paga torna come credito
// sul primo prodotto acquistato con lo stesso account entro i giorni del prodotto.
// Il codice fiscale del candidato si vede per intero solo qui, dove lo si scrive.
// ═════════════════════════════════════════════════════════════════════════════

const P3 = PRODOTTI.P3;
const RIQUADRO = cn(SCHEDA, 'p-5 sm:p-8');
const LUNGHEZZA_CF = 16;

const CAMPI = [
    { id: 'nome', etichetta: 'Nome' },
    { id: 'cognome', etichetta: 'Cognome' },
    { id: 'dataNascita', etichetta: 'Data di nascita', tipo: 'date' },
    { id: 'luogoNascita', etichetta: 'Luogo di nascita', segnaposto: 'Comune o Stato estero' },
    { id: 'codiceFiscale', etichetta: 'Codice fiscale', largo: true, classe: 'font-mono uppercase tracking-wider' },
];

const VUOTO = { nome: '', cognome: '', dataNascita: '', luogoNascita: '', codiceFiscale: '' };

// Il codice fiscale si scrive in maiuscolo e senza spazi, anche se lo si incolla.
const normalizza = (id, valore) => (id === 'codiceFiscale' ? valore.toUpperCase().replace(/\s/g, '') : valore);

const valida = (id, valore) => {
    const v = String(valore || '').trim();
    switch (id) {
        case 'nome':
            return v ? '' : 'Scrivi il nome del candidato';
        case 'cognome':
            return v ? '' : 'Scrivi il cognome del candidato';
        case 'dataNascita':
            if (!v) return 'Scrivi la data di nascita';
            if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || v < '1900-01-01') return 'Controlla la data di nascita';
            return v > OGGI ? 'La data di nascita non può essere nel futuro' : '';
        case 'luogoNascita':
            return v ? '' : 'Scrivi dove è nato il candidato';
        case 'codiceFiscale':
            if (!v) return 'Scrivi il codice fiscale';
            if (!/^[A-Z0-9]+$/.test(v)) return 'Solo lettere e numeri';
            return v.length === LUNGHEZZA_CF ? '' : `Il codice fiscale ha ${LUNGHEZZA_CF} caratteri: qui ce ne sono ${v.length}`;
        default:
            return '';
    }
};

// ─── Mattoni ──────────────────────────────────────────────────────────────────
const Regola = ({ icona: Icona, titolo, children }) => (
    <div className="rounded-xl border border-[#E5E5DE] bg-white p-4 space-y-1.5">
        <Icona className="w-5 h-5 text-[#1A2D52]" />
        <p className="text-sm font-semibold text-[#1A2D52]">{titolo}</p>
        <p className="text-xs leading-relaxed text-[#6B6B5E]">{children}</p>
    </div>
);

const Requisito = ({ ok, titolo, dettaglio, link }) => (
    <li className="flex items-start gap-3">
        {ok
            ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            : <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />}
        <div className="flex-1 min-w-0 space-y-1 text-sm">
            <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium text-foreground"><span className="sr-only">{ok ? 'Fatto: ' : 'Manca: '}</span>{titolo}</p>
                {ok && link && (
                    <Link to={link.to} className="flex-shrink-0 underline underline-offset-4 text-[#1A2D52]">{link.etichetta}</Link>
                )}
            </div>
            {dettaglio && <p className="text-[#6B6B5E]">{dettaglio}</p>}
            {!ok && link && (
                <Button asChild size="sm" className="mt-1 gap-1.5 bg-[#1A2D52] hover:bg-[#0F1B33]">
                    <Link to={link.to}>{link.etichetta} <ArrowRight /></Link>
                </Button>
            )}
        </div>
    </li>
);

const Campo = ({ campo, valore, errore, aiuto, disabilitato, onCambia, onControlla }) => {
    const idSotto = `${campo.id}-nota`;
    const sotto = errore || aiuto;
    return (
        <div className={cn('space-y-1.5', campo.largo && 'sm:col-span-2')}>
            <Label htmlFor={campo.id} className={errore ? 'text-destructive' : ''}>
                {campo.etichetta} <span className="text-red-500">*</span>
            </Label>
            <Input
                id={campo.id}
                type={campo.tipo || 'text'}
                value={valore}
                placeholder={campo.segnaposto}
                max={campo.tipo === 'date' ? OGGI : undefined}
                autoComplete="off"
                spellCheck={false}
                disabled={disabilitato}
                aria-invalid={!!errore}
                aria-describedby={sotto ? idSotto : undefined}
                onChange={e => onCambia(campo.id, e.target.value)}
                onBlur={() => onControlla(campo.id)}
                className={cn('bg-white', campo.classe, errore && 'border-destructive')}
            />
            {sotto && <p id={idSotto} className={cn('text-xs', errore ? 'text-destructive' : 'text-muted-foreground')}>{sotto}</p>}
        </div>
    );
};

// ─── Pagina ───────────────────────────────────────────────────────────────────
const NuovaVerificaPage = () => {
    const navigate = useNavigate();
    const { persona, contesti, aggiornaPersona } = useAuth();
    const [valori, setValori] = useState(VUOTO);
    const [errori, setErrori] = useState({});
    const [tentato, setTentato] = useState(false);
    const [metodo, setMetodo] = useState('');
    const [erroreMetodo, setErroreMetodo] = useState('');
    const catalogo = useProdotti();
    const [invio, setInvio] = useState(false);
    const timer = useRef(null);

    // Se si lascia la pagina durante il pagamento simulato, non parte niente.
    useEffect(() => () => clearTimeout(timer.current), []);

    if (!persona) return null;

    const haAreaCliente = contesti.some(c => c.area === 'cliente');
    const identitaOk = isVerificata(persona);
    const fatturazione = persona.fatturazione && typeof persona.fatturazione === 'object' ? persona.fatturazione : null;
    const pronta = identitaOk && !!fatturazione;
    const erroriAperti = CAMPI.some(c => errori[c.id]);

    const cambia = (id, grezzo) => {
        const valore = normalizza(id, grezzo);
        setValori(prev => ({ ...prev, [id]: valore }));
        if (errori[id] || tentato) setErrori(prev => ({ ...prev, [id]: valida(id, valore) }));
    };

    // All'uscita dal campo si controlla solo quello che è stato scritto: un campo
    // vuoto diventa un errore quando si prova a pagare.
    const controlla = (id) => {
        if (valori[id] || tentato) setErrori(prev => ({ ...prev, [id]: valida(id, valori[id]) }));
    };

    const invia = () => {
        if (!pronta || invio) return;
        const nuovi = Object.fromEntries(CAMPI.map(c => [c.id, valida(c.id, valori[c.id])]));
        setErrori(nuovi);
        setTentato(true);
        const primo = CAMPI.find(c => nuovi[c.id]);
        if (primo) {
            document.getElementById(primo.id)?.focus();
            return;
        }
        if (!metodo) {
            setErroreMetodo('Scegli come pagare');
            return;
        }
        const soggetto = {
            nome: valori.nome.trim(),
            cognome: valori.cognome.trim(),
            dataNascita: valori.dataNascita,
            luogoNascita: valori.luogoNascita.trim(),
            codiceFiscale: valori.codiceFiscale,
        };
        setInvio(true);
        timer.current = setTimeout(() => {
            const verifica = creaVerifica(persona.id, soggetto);
            // Chi non era ancora cliente trova da ora l'area delle sue verifiche.
            if (!haAreaCliente) aggiornaPersona({ aree: [...(persona.aree || []), 'cliente'] });
            toast.success(`Verifica richiesta: l’esito arriva entro ${P3.oreEsito} ore`);
            navigate(`/dashboard/cliente/richieste/${verifica.id}`);
        }, 900);
    };

    return (
        <>
            <Helmet><title>Nuova verifica - CRIA</title></Helmet>
            <AccessoShell
                larghezza="max-w-3xl"
                azione={(
                    <Link to={haAreaCliente ? '/dashboard/cliente' : '/dashboard'} className="text-sm text-[#6B6B5E] hover:text-[#1A2D52]">
                        {haAreaCliente ? 'Le tue verifiche' : 'La tua area'}
                    </Link>
                )}
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#6B6B5E]">{P3.nome}</p>
                        <h1 className="text-3xl sm:text-4xl text-[#1A2D52]" style={TITOLO_STILE}>Verifica un candidato inquilino</h1>
                        <p className="text-[#6B6B5E]">
                            Prima di firmare, chiedi a CRIA come ha pagato l’affitto: ricevi il semaforo con una breve sintesi,
                            oppure «{NESSUNA_INFORMAZIONE}».
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Regola icona={ReceiptEuro} titolo={`${fmtEuro(P3.prezzo)} a verifica`}>
                            Si paga quando invii la richiesta.
                        </Regola>
                        <Regola icona={Clock} titolo={`Esito entro ${P3.oreEsito} ore`}>
                            Ti mandiamo un’email che dice solo di accedere: l’esito lo leggi qui, in piattaforma. Niente PDF, niente report per email.
                        </Regola>
                        <Regola icona={Wallet} titolo={`I ${fmtEuro(P3.prezzo)} diventano un credito`}>
                            Li scaliamo dal primo prodotto che acquisti con questo account entro {P3.scalabileEntroGiorni} giorni.
                            Ogni acquisto scala una sola verifica.
                        </Regola>
                    </div>

                    <div className={cn(SCHEDA, 'p-5 sm:p-6 space-y-3')}>
                        <p className="text-sm font-semibold text-[#1A2D52]">Il tuo account</p>
                        <ul className="space-y-3">
                            <Requisito
                                ok={identitaOk}
                                titolo="Identità verificata"
                                dettaglio={identitaOk ? null : 'Una persona la controlla sul documento che carichi'}
                                link={identitaOk ? null : { to: '/profilo/identita', etichetta: 'Carica il documento' }}
                            />
                            <Requisito
                                ok={!!fatturazione}
                                titolo="Dati di fatturazione"
                                dettaglio={fatturazione
                                    ? `Fattura intestata a ${fatturazione.intestatario || nomeVisualizzato(persona)}`
                                    : 'Mancano: senza, la verifica non parte'}
                                link={{ to: '/profilo/fatturazione', etichetta: fatturazione ? 'Modifica' : 'Completa i dati di fatturazione' }}
                            />
                        </ul>
                        {!pronta && (
                            <p className="text-sm text-[#6B6B5E] pt-3 border-t border-[#E5E5DE]">
                                Quando è tutto a posto torna qui: ti chiediamo nome, cognome, data e luogo di nascita e codice fiscale del candidato.
                            </p>
                        )}
                    </div>

                    {pronta && (
                        <>
                            <section className={cn(RIQUADRO, 'space-y-5')} aria-labelledby="titolo-candidato">
                                <div className="space-y-1">
                                    <h2 id="titolo-candidato" className="text-xl text-[#1A2D52]" style={TITOLO_STILE}>Il candidato</h2>
                                    <p className="text-sm text-[#6B6B5E]">I dati come sono sul suo documento.</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {CAMPI.map(c => (
                                        <Campo
                                            key={c.id}
                                            campo={c}
                                            valore={valori[c.id]}
                                            errore={errori[c.id]}
                                            aiuto={c.id === 'codiceFiscale'
                                                ? `${valori.codiceFiscale.length}/${LUNGHEZZA_CF} caratteri. Per intero lo vedi solo qui: nelle tue verifiche compare mascherato.`
                                                : null}
                                            disabilitato={invio}
                                            onCambia={cambia}
                                            onControlla={controlla}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section className={cn(RIQUADRO, 'space-y-5')} aria-labelledby="titolo-pagamento">
                                <h2 id="titolo-pagamento" className="text-xl text-[#1A2D52]" style={TITOLO_STILE}>Pagamento</h2>
                                <div className="rounded-xl bg-[#1A2D52] text-white p-5 flex flex-wrap items-end justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-white/70">Da pagare adesso</p>
                                        <p className="text-3xl" style={TITOLO_STILE}>{fmtEuro(P3.prezzo)}</p>
                                    </div>
                                    <p className="text-xs text-white/70 sm:text-right max-w-[18rem]">
                                        Diventa un credito: lo scaliamo dal primo prodotto che acquisti con questo account entro {P3.scalabileEntroGiorni} giorni.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <MetodiPagamento
                                        metodi={['carta', 'bonifico']}
                                        valore={metodo}
                                        onScegli={(m) => { setMetodo(m); setErroreMetodo(''); }}
                                        disabled={invio}
                                        prodotto={catalogo.trova('P3')}
                                        importo={P3.prezzo}
                                        causale={causaleCliente(catalogo.trova('P3'), nomeVisualizzato(persona))}
                                        notaBonifico="La richiesta parte quando il bonifico arriva"
                                    />
                                    {erroreMetodo && <p className="text-sm text-red-600">{erroreMetodo}</p>}
                                </div>

                                {tentato && erroriAperti && <p className="text-sm text-red-600">Controlla i dati del candidato qui sopra.</p>}
                                <Button onClick={invia} disabled={invio} className="w-full h-12 text-base bg-[#1A2D52] hover:bg-[#0F1B33]">
                                    {invio
                                        ? <><Loader2 className="animate-spin" /> Pagamento in corso…</>
                                        : `Paga ${fmtEuro(P3.prezzo)} e invia`}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 flex-shrink-0" /> Pagamento protetto · l’esito lo leggi qui entro {P3.oreEsito} ore
                                </p>
                            </section>

                            <NotaMockup>
                                Il pagamento è simulato: nessun addebito. Anche con il bonifico, qui la richiesta parte subito.
                            </NotaMockup>
                        </>
                    )}
                </div>
            </AccessoShell>
        </>
    );
};

export default NuovaVerificaPage;
