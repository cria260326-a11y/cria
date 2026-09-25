import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Clock, Ban, AlertTriangle, Lock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AccessoShell, { SCHEDA, TITOLO_STILE } from '@/components/AccessoShell';
import NotaMockup from '@/components/NotaMockup';
import { PRODOTTI, prezzoProdotto } from '@/data/catalogo';
import { FONTE_CERTIFICATO } from '@/data/certificati';
import { trovaPersonaDemo } from '@/data/personeDemo';
import { SEMAFORO } from '@/lib/semaforo';
import { fmtDataLunga } from '@/lib/formato';
import { nomeVisualizzato } from '@/lib/aree';
import {
    verificaCodice, registraVerifica, normalizzaCodice, cercaCertificato, statoCertificato,
    fmtPeriodo, STATO_CERTIFICATO,
} from '@/lib/certificatiDemo';

// ═════════════════════════════════════════════════════════════════════════════
// VERIFICA PUBBLICA DEL CERTIFICATO — E-06
// Gratuita e senza account. Non cerca una persona: controlla il foglio che la
// persona ha consegnato. Restituisce quattro cose — autenticità, periodo e
// valore, emissione e validità, peggioramento dopo l'emissione senza dire di
// quanto — più nome e codice fiscale mascherato per riscontrare il foglio. Il
// valore certificato si mostra sempre: con un solo «autentico sì/no» basterebbe
// alterare la cifra stampata (documento di stato §15.1).
// I tentativi sono limitati: qui un contatore nella sessione, in piattaforma il server.
// ═════════════════════════════════════════════════════════════════════════════

const FONT_TITOLI = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,400,50;0,9..144,600,50&display=swap';

const P3 = PRODOTTI.P3;
const CODICI_DEMO = ['CRIA-7K2Q-94HF', 'CRIA-3XDM-5PLA'];

// ─── Limite ai tentativi ──────────────────────────────────────────────────────
const CHIAVE_TENTATIVI = 'criaVerificaCertificatoTentativi';
const MASSIMO_TENTATIVI = 10;
let tentativiInMemoria = 0; // se sessionStorage non c'è, il limite regge fino al ricaricamento

const tentativiFatti = () => {
    try {
        return Math.max(Number(sessionStorage.getItem(CHIAVE_TENTATIVI)) || 0, tentativiInMemoria);
    } catch {
        return tentativiInMemoria;
    }
};

const segnaTentativo = () => {
    const n = tentativiFatti() + 1;
    tentativiInMemoria = n;
    try {
        sessionStorage.setItem(CHIAVE_TENTATIVI, String(n));
    } catch {
        // resta in memoria
    }
    return n;
};

const problemaDelCodice = (testo) => {
    const scambiati = testo.toUpperCase().replace(/0/g, 'O').replace(/1/g, 'I');
    return /[01]/.test(testo) && normalizzaCodice(scambiati)
        ? 'Nei codici CRIA non ci sono 0 né 1: forse è una O o una I?'
        : 'Il codice ha questa forma: CRIA-XXXX-XXXX. Controlla di averlo copiato per intero.';
};

// ─── Mattoni del risultato ────────────────────────────────────────────────────
const Testata = ({ icona: Icona, tono, titolo, children }) => (
    <div className="flex items-start gap-4">
        <span className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${tono}`}>
            <Icona className="w-6 h-6" />
        </span>
        <div className="space-y-1 min-w-0">
            <h2 className="text-xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>{titolo}</h2>
            <p className="text-sm text-[#6B6B5E]">{children}</p>
        </div>
    </div>
);

const Riga = ({ etichetta, children }) => (
    <div className="py-4 grid gap-1 sm:grid-cols-[11rem,1fr] sm:gap-4">
        <dt className="text-xs uppercase tracking-wide text-[#6B6B5E] sm:pt-0.5">{etichetta}</dt>
        <dd className="text-sm text-[#1A2D52] min-w-0">{children}</dd>
    </div>
);

const ValoreDiOggi = () => (
    <div className="flex items-start gap-3 rounded-xl bg-[#F5F5F0] p-4 text-sm text-[#3D3D35]">
        <Search className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#1A2D52]" />
        <p>
            Il certificato dice com’è andato il periodo certificato, non com’è oggi. Per il semaforo di oggi serve
            un’interrogazione:{' '}
            <Link to="/verifica" className="font-medium text-[#1A2D52] underline underline-offset-4 hover:no-underline">{P3.nome}</Link>,
            {' '}{prezzoProdotto('P3')}.
        </p>
    </div>
);

const Esito = ({ r, peggiorato }) => {
    if (r.esito === 'revocato') {
        return (
            <div className={`${SCHEDA} space-y-5`}>
                <Testata icona={Ban} tono="bg-red-50 text-red-600" titolo="Codice revocato">
                    Il certificato con il codice <span className="font-mono">{r.codice}</span> è stato emesso da CRIA, ma l’intestatario
                    ha revocato il codice il {fmtDataLunga(r.revocatoIl)}. Il foglio non vale più e i suoi dati non si mostrano: se ti
                    serve, chiedigli un certificato aggiornato.
                </Testata>
                <ValoreDiOggi />
            </div>
        );
    }

    const scaduto = r.esito === 'scaduto';
    const voce = SEMAFORO[r.valore];
    return (
        <div className={`${SCHEDA} space-y-6`}>
            <Testata
                icona={scaduto ? Clock : ShieldCheck}
                tono={scaduto ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}
                titolo={scaduto ? 'Autentico, ma scaduto' : 'Certificato autentico'}
            >
                {scaduto
                    ? `Emesso da CRIA, ma è scaduto il ${fmtDataLunga(r.validoFinoAl)}: non è falso, è vecchio. Chiedi all’intestatario un certificato aggiornato.`
                    : 'Emesso da CRIA e ancora valido.'}
                {' '}Confronta i dati qui sotto con il foglio: se qualcosa non coincide, il foglio è stato alterato e vale quello che leggi qui.
            </Testata>

            <dl className="divide-y divide-[#E5E5DE] border-y border-[#E5E5DE]">
                <Riga etichetta="Intestatario">
                    <span className="font-medium">{r.intestatario.nome}</span>
                    <span className="block font-mono text-xs tracking-wider text-[#6B6B5E] mt-0.5">{r.intestatario.codiceFiscale}</span>
                </Riga>
                <Riga etichetta="Periodo certificato">
                    <p className="font-medium first-letter:uppercase">{fmtPeriodo(r.periodo)}</p>
                    <p className="flex items-center gap-2 mt-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: voce.colore }} />
                        <span><span className="text-[#6B6B5E]">Semaforo del periodo:</span> <span className="font-semibold">{voce.etichetta}</span></span>
                    </p>
                    <p className="text-xs text-[#6B6B5E] mt-1">{voce.spiegazione}. Fonte del dato: {FONTE_CERTIFICATO[r.fonte] || r.fonte}.</p>
                    {r.annotazioni?.length > 0 && <p className="text-xs text-[#6B6B5E] mt-1">{r.annotazioni.join(' · ')}</p>}
                </Riga>
                <Riga etichetta="Emissione e validità">
                    <p>Emesso il {fmtDataLunga(r.emessoIl)}</p>
                    <p className="flex flex-wrap items-center gap-2 mt-1">
                        {scaduto ? `Scaduto il ${fmtDataLunga(r.validoFinoAl)}` : `Valido fino al ${fmtDataLunga(r.validoFinoAl)}`}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATO_CERTIFICATO[r.esito].classe}`}>
                            {STATO_CERTIFICATO[r.esito].etichetta}
                        </span>
                    </p>
                </Riga>
                <Riga etichetta="Dopo l’emissione">
                    {peggiorato ? (
                        <p className="flex items-start gap-2 text-amber-800">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span><span className="font-semibold">Il semaforo è peggiorato.</span> Di quanto non lo diciamo: il valore di oggi si conosce solo con un’interrogazione.</span>
                        </p>
                    ) : (
                        <p className="flex items-start gap-2 text-green-800">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="font-semibold">Il semaforo non è peggiorato.</span>
                        </p>
                    )}
                </Riga>
            </dl>

            <ValoreDiOggi />

            <p className="text-xs text-[#6B6B5E]">
                Codice {r.codice}. La verifica è anonima: l’intestatario vede quante volte e quando il certificato è stato verificato, non da chi.
            </p>
        </div>
    );
};

// ─── Pagina ───────────────────────────────────────────────────────────────────
const VerificaCertificatoPage = () => {
    const [params, setParams] = useSearchParams();
    const [testo, setTesto] = useState(() => params.get('codice') || '');
    const [errore, setErrore] = useState('');
    const [risultato, setRisultato] = useState(null);
    const [usati, setUsati] = useState(tentativiFatti);
    const [simulaPeggioramento, setSimulaPeggioramento] = useState(false);
    const avviata = useRef(false);
    const bloccato = usati >= MASSIMO_TENTATIVI;
    const restanti = MASSIMO_TENTATIVI - usati;

    const verifica = useCallback((valore) => {
        setRisultato(null);
        const grezzo = String(valore || '').trim();
        if (!grezzo) {
            setErrore('Scrivi il codice che trovi sul certificato, accanto al QR.');
            return;
        }
        const codice = normalizzaCodice(grezzo);
        if (!codice) {
            setErrore(problemaDelCodice(grezzo));
            return;
        }
        if (tentativiFatti() >= MASSIMO_TENTATIVI) {
            setUsati(tentativiFatti());
            setErrore('');
            return;
        }
        setUsati(segnaTentativo());
        setTesto(codice);
        const esito = verificaCodice(codice);
        if (esito.esito === 'non_trovato') {
            setErrore('Nessun certificato CRIA ha questo codice. Controlla di averlo scritto bene: se è giusto, il foglio non è stato emesso da CRIA.');
            return;
        }
        registraVerifica(codice);
        setErrore('');
        setRisultato({ ...esito, n: Date.now() });
    }, []);

    // Chi arriva dal QR ha il codice nel link: la verifica parte da sola, una volta.
    useEffect(() => {
        if (avviata.current) return;
        avviata.current = true;
        const dalLink = params.get('codice');
        if (dalLink) verifica(dalLink);
    }, [params, verifica]);

    const verificaEAggiornaLink = (valore) => {
        verifica(valore);
        const codice = normalizzaCodice(valore);
        if (codice && codice !== params.get('codice')) setParams({ codice }, { replace: true });
    };

    const invia = (e) => {
        e.preventDefault();
        verificaEAggiornaLink(testo);
    };

    const prova = (codice) => {
        setTesto(codice);
        verificaEAggiornaLink(codice);
    };

    let avvisoTentativi = null;
    if (bloccato) {
        avvisoTentativi = <p className="text-xs text-red-600">Hai fatto {MASSIMO_TENTATIVI} tentativi: per proteggere i dati, per ora non puoi farne altri. Riprova più tardi.</p>;
    } else if (usati > 0 && restanti <= 3) {
        avvisoTentativi = <p className="text-xs text-amber-700">Ti {restanti === 1 ? 'resta 1 tentativo' : `restano ${restanti} tentativi`} in questa sessione.</p>;
    }

    return (
        <>
            <Helmet>
                <title>Verifica un certificato - CRIA</title>
                <meta name="description" content="Verifica gratis un certificato CRIA con il suo codice: autenticità, periodo e semaforo certificati, validità." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link href={FONT_TITOLI} rel="stylesheet" />
            </Helmet>

            <AccessoShell
                larghezza="max-w-2xl"
                azione={<Link to="/come-funziona" className="text-sm text-[#6B6B5E] hover:text-[#1A2D52]">Come funziona CRIA</Link>}
            >
                <div className="space-y-6">
                    <div className={`${SCHEDA} space-y-6`}>
                        <div className="space-y-2">
                            <div className="w-12 h-12 bg-[#1A2D52]/5 rounded-xl flex items-center justify-center mb-4">
                                <ShieldCheck className="w-6 h-6 text-[#1A2D52]" />
                            </div>
                            <h1 className="text-2xl font-bold text-[#1A2D52]" style={TITOLO_STILE}>Verifica un certificato CRIA</h1>
                            <p className="text-sm text-[#6B6B5E]">
                                Scrivi il codice che trovi accanto al QR, oppure inquadra il QR con il telefono. Ti diciamo se il certificato è
                                autentico, cosa certifica, se è ancora valido e se dopo l’emissione il semaforo è peggiorato.
                            </p>
                            <p className="text-sm text-[#6B6B5E]">
                                È gratuita e non serve un account. Non cerca una persona: controlla il foglio che ti è stato consegnato.
                            </p>
                        </div>

                        <form onSubmit={invia} noValidate className="space-y-2">
                            <Label htmlFor="codice-certificato" className="text-xs font-medium text-[#1A2D52] uppercase tracking-wide">
                                Codice del certificato
                            </Label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    id="codice-certificato"
                                    value={testo}
                                    onChange={(e) => { setTesto(e.target.value); if (errore) setErrore(''); }}
                                    placeholder="CRIA-XXXX-XXXX"
                                    autoComplete="off"
                                    autoCapitalize="characters"
                                    spellCheck={false}
                                    maxLength={200}
                                    disabled={bloccato}
                                    aria-invalid={Boolean(errore) || bloccato}
                                    aria-describedby="codice-messaggio"
                                    className="h-11 font-mono uppercase tracking-wider"
                                />
                                <Button type="submit" disabled={bloccato} className="h-11 gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]">
                                    <ShieldCheck className="w-4 h-4" /> Verifica
                                </Button>
                            </div>
                            <div id="codice-messaggio" aria-live="polite" className="space-y-1">
                                {errore && <p className="text-xs text-red-600">{errore}</p>}
                                {avvisoTentativi}
                            </div>
                        </form>

                        <p className="flex items-center gap-1.5 text-xs text-[#6B6B5E]">
                            <Lock className="w-3.5 h-3.5 flex-shrink-0" /> Per proteggere i dati, i tentativi sono limitati.
                        </p>
                    </div>

                    <div aria-live="polite">
                        {risultato && (
                            <motion.div key={risultato.n} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                                <Esito r={risultato} peggiorato={risultato.peggiorato || simulaPeggioramento} />
                            </motion.div>
                        )}
                    </div>

                    <NotaMockup>
                        <p className="mb-3">Codici per provare la verifica:</p>
                        <div className="flex flex-wrap gap-2">
                            {CODICI_DEMO.map(codice => {
                                const c = cercaCertificato(codice);
                                const descrizione = c
                                    ? `${nomeVisualizzato(trovaPersonaDemo(c.personaId))} · ${STATO_CERTIFICATO[statoCertificato(c)].etichetta.toLowerCase()}`
                                    : 'non trovato';
                                return (
                                    <Button key={codice} size="sm" variant="outline" className="bg-white gap-2" disabled={bloccato} onClick={() => prova(codice)}>
                                        <span className="font-mono">{codice}</span>
                                        <span className="text-xs text-amber-800">{descrizione}</span>
                                    </Button>
                                );
                            })}
                        </div>
                        <p className="mt-3">
                            Il limite qui è un contatore nella sessione del browser: {Math.min(usati, MASSIMO_TENTATIVI)} tentativi su {MASSIMO_TENTATIVI}.
                            In piattaforma lo applica il server. Ogni verifica riuscita compare nell’area dell’inquilino, tra le verifiche del codice.
                        </p>
                        <p className="mt-3">Per vedere come appare un semaforo peggiorato dopo l’emissione:</p>
                        <Button size="sm" variant="outline" className="mt-2 bg-white" onClick={() => setSimulaPeggioramento(v => !v)}>
                            {simulaPeggioramento ? 'Togli la simulazione' : 'Simula un peggioramento'}
                        </Button>
                    </NotaMockup>
                </div>
            </AccessoShell>
        </>
    );
};

export default VerificaCertificatoPage;
