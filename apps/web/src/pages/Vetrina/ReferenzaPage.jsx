import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2, FileText, Info, Loader2, Lock, RotateCcw, Send, Upload, UserCheck, X, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AccessoShell, { SCHEDA, TITOLO_STILE } from '@/components/AccessoShell';
import NotaMockup from '@/components/NotaMockup';
import { PROVE_SMENTITA, TOKEN_REFERENZA_DEMO } from '@/data/autocandidature';
import { fmtData, fmtDataLunga, meseBreve, nomeMese } from '@/lib/formato';
import { fmtPeriodoMesi } from '@/lib/certificatiDemo';
import {
    useReferenzaPerToken, rispondiReferenza, ripristinaAutocandidatureDemo, mesiTra, percorsoReferenza,
} from '@/lib/autocandidatureDemo';

// ═════════════════════════════════════════════════════════════════════════════
// REFERENZA DEL PRECEDENTE PROPRIETARIO — E-10
// Pubblica, senza account: si apre dal link personale che CRIA manda al recapito
// indicato sul contratto di locazione. Esiste solo perché l'inquilino l'ha chiesta
// (E-09): da qui si risponde a quella richiesta e a nient'altro, e si vede solo
// chi la chiede, l'immobile e il periodo.
// «Non confermo» è una contestazione, non un fatto: servono i mesi e almeno un
// documento; senza documento la smentita decade e non lascia traccia, e
// l'inquilino risponde per primo (documento di stato §14.6).
// ═════════════════════════════════════════════════════════════════════════════

const FONT_TITOLI = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,400,50;0,9..144,600,50&display=swap';

const plurale = (n, uno, molti) => `${n} ${n === 1 ? uno : molti}`;
// ['diffida', 'estratto conto'] → 'diffida ed estratto conto'
const elenco = (voci) => {
    if (voci.length <= 1) return voci[0] || '';
    const ultima = voci[voci.length - 1];
    return `${voci.slice(0, -1).join(', ')} ${/^e/i.test(ultima) ? 'ed' : 'e'} ${ultima}`;
};
// ['a', 'b', 'c'] → 'a, b o c'
const oppure = (voci) => (voci.length <= 1 ? voci[0] || '' : `${voci.slice(0, -1).join(', ')} o ${voci[voci.length - 1]}`);
const maiuscola = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const fmtMesi = (dal, al) => (dal === al ? nomeMese(dal).toLowerCase() : fmtPeriodoMesi({ dal, al }));
const etichettaDocumento = (tipo) => PROVE_SMENTITA.find(p => p.id === tipo)?.etichetta || tipo;

const STILE_SELECT = 'w-full h-10 text-sm rounded-lg border border-[#E5E5DE] px-3 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-[#1A2D52]/20';

// ─── Mattoni ──────────────────────────────────────────────────────────────────
const Cornice = ({ children }) => (
    <>
        <Helmet>
            <title>Richiesta di referenza - CRIA</title>
            <meta name="robots" content="noindex" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link href={FONT_TITOLI} rel="stylesheet" />
        </Helmet>
        <AccessoShell larghezza="max-w-2xl">{children}</AccessoShell>
    </>
);

const Riga = ({ etichetta, children }) => (
    <div className="py-3 grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
        <dt className="text-xs uppercase tracking-wide text-[#6B6B5E] sm:pt-0.5">{etichetta}</dt>
        <dd className="text-sm text-[#1A2D52] min-w-0">{children}</dd>
    </div>
);

const Intestazione = ({ r }) => (
    <div>
        <p className="text-xs uppercase tracking-[0.16em] text-[#6B6B5E]">Richiesta di referenza · link personale di {r.proprietario.nome}</p>
        <h1 className="text-3xl text-[#1A2D52]" style={TITOLO_STILE}>Una referenza per {r.inquilino}</h1>
    </div>
);

const LaRichiesta = ({ r }) => (
    <section className={`${SCHEDA} space-y-4`} aria-label="La richiesta">
        <dl className="divide-y divide-[#E5E5DE] border-y border-[#E5E5DE]">
            <Riga etichetta="Chi la chiede">{r.inquilino}</Riga>
            <Riga etichetta="Immobile">{r.immobile}</Riga>
            <Riga etichetta="Periodo">{maiuscola(fmtMesi(r.dal, r.al))} · {plurale(mesiTra(r.dal, r.al).length, 'mese', 'mesi')}</Riga>
            <Riga etichetta="Rispondi entro il">{fmtDataLunga(r.scadenza)}</Riga>
        </dl>
        <p className="flex items-start gap-2 text-xs text-[#6B6B5E]">
            <UserCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            Questa richiesta esiste perché l’ha chiesta {r.inquilino}: CRIA chiede una referenza solo quando è l’inquilino a volerla.
        </p>
    </section>
);

const Riservatezza = ({ r }) => (
    <div className="flex items-start gap-3 rounded-xl border border-[#E5E5DE] bg-white p-4 text-sm text-[#6B6B5E]">
        <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#1A2D52]" />
        <div className="space-y-1">
            <p><span className="font-medium text-[#1A2D52]">La tua risposta serve solo per questo certificato.</span> CRIA non la usa per altro.</p>
            <p>Ti abbiamo contattato al recapito indicato sul contratto di locazione, perché {r.inquilino} ti ha indicato come precedente proprietario.</p>
        </div>
    </div>
);

const NotaDemo = ({ conRipristino = false }) => {
    const ripristina = () => {
        ripristinaAutocandidatureDemo();
        toast.success('Autocandidatura demo ripristinata: puoi rispondere di nuovo');
    };
    return (
        <NotaMockup>
            <p>
                Il link arriva al precedente proprietario via email o SMS, al recapito indicato sul contratto di locazione. Non serve un
                account.
            </p>
            <p className="mt-1">
                Link demo:{' '}
                <Link className="underline font-mono" to={percorsoReferenza(TOKEN_REFERENZA_DEMO)}>{percorsoReferenza(TOKEN_REFERENZA_DEMO)}</Link>
                {' '}· Roberto Fabbri per Elena Greco, Via Mazzini 3, Verona.
            </p>
            <p className="mt-1">
                La risposta resta in questo browser e compare subito tra le prove di Elena Greco (accesso demo cliente@cri-affitti.it,
                pagina /certificato/autocandidatura/prove).
            </p>
            {conRipristino && (
                <Button size="sm" variant="outline" className="mt-3 gap-2 bg-white" onClick={ripristina}>
                    <RotateCcw className="w-3.5 h-3.5" /> Ripristina l’autocandidatura demo
                </Button>
            )}
        </NotaMockup>
    );
};

// ─── Link sconosciuto ─────────────────────────────────────────────────────────
const LinkNonValido = () => (
    <Cornice>
        <div className="space-y-6">
            <div className={`${SCHEDA} text-center space-y-3`}>
                <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
                <h1 className="text-xl text-[#1A2D52]" style={TITOLO_STILE}>Questo link non è valido</h1>
                <p className="text-sm text-[#6B6B5E]">
                    Può essere incompleto o non più attivo: controlla di averlo aperto per intero. Ogni richiesta di referenza ha il suo
                    link personale, e parte solo quando è l’inquilino a chiederla.
                </p>
            </div>
            <NotaDemo />
        </div>
    </Cornice>
);

// ─── Dopo la risposta, o richiesta chiusa ─────────────────────────────────────
const Esito = ({ r, appena }) => {
    if (r.stato === 'non_riscontrata') {
        return (
            <div className={`${SCHEDA} text-center space-y-3`}>
                <Info className="w-10 h-10 text-[#1A2D52] mx-auto" />
                <h2 className="text-2xl text-[#1A2D52]" style={TITOLO_STILE}>Questa richiesta è chiusa</h2>
                <p className="text-sm text-[#6B6B5E]">Non serve più una risposta: non devi fare nulla.</p>
            </div>
        );
    }

    const risposta = r.risposta || {};
    if (r.stato === 'confermata') {
        return (
            <div className={`${SCHEDA} text-center space-y-3`}>
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                <h2 className="text-2xl text-[#1A2D52]" style={TITOLO_STILE}>{appena ? 'Grazie, la tua conferma è arrivata' : 'Hai già risposto'}</h2>
                <p className="text-[#6B6B5E]">
                    {appena
                        ? `Diventa una delle prove del certificato di ${r.inquilino}.`
                        : `Il ${fmtData(risposta.il)} hai confermato che ${r.inquilino} ha pagato regolarmente.`}
                    {' '}Non devi fare altro.
                </p>
            </div>
        );
    }

    const mesi = risposta.mesi || [];
    const documenti = [...new Set((risposta.documenti || []).map(d => etichettaDocumento(d.tipo).toLowerCase()))];
    return (
        <div className={`${SCHEDA} space-y-4`}>
            <div className="text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                <h2 className="text-2xl text-[#1A2D52]" style={TITOLO_STILE}>{appena ? 'Grazie, la tua risposta è arrivata' : 'Hai già risposto'}</h2>
                <p className="text-[#6B6B5E]">
                    {appena ? '' : `Il ${fmtData(risposta.il)} `}hai indicato {plurale(mesi.length, 'mese', 'mesi')} e allegato: {elenco(documenti)}.
                </p>
            </div>
            <div className="flex items-start gap-3 p-4 bg-[#F5F5F0] rounded-xl text-sm text-[#1A2D52]">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                    CRIA esamina i mesi e i documenti che hai indicato. È una contestazione, non un fatto: da sola non entra nel semaforo di
                    {' '}{r.inquilino}, che prima di ogni decisione può rispondere con i suoi movimenti bancari. Non devi fare altro.
                </p>
            </div>
        </div>
    );
};

// ─── Pagina ───────────────────────────────────────────────────────────────────
const SceltaRisposta = ({ attiva, onClick, icona: Icona, tono, titolo, testo }) => (
    <button
        type="button" aria-pressed={attiva} onClick={onClick}
        className={`text-left p-4 rounded-xl border-2 transition-all ${attiva ? 'border-[#1A2D52] bg-[#1A2D52]/5' : 'border-[#E5E5DE] hover:border-[#1A2D52]/40'}`}
    >
        <Icona className={`w-5 h-5 mb-2 ${tono}`} />
        <span className="block font-medium text-[#1A2D52]">{titolo}</span>
        <span className="block text-sm text-[#6B6B5E] mt-0.5">{testo}</span>
    </button>
);

const ReferenzaPage = () => {
    const { token } = useParams();
    const r = useReferenzaPerToken(token);
    const [scelta, setScelta] = useState(null);          // 'conferma' | 'smentita'
    const [mesi, setMesi] = useState([]);
    const [documenti, setDocumenti] = useState([]);      // [{ id, tipo, nome }]
    const [tipoDocumento, setTipoDocumento] = useState('');
    const [invio, setInvio] = useState(false);
    const [appena, setAppena] = useState(false);
    const fileRef = useRef(null);

    if (!r) return <LinkNonValido />;

    if (appena || r.stato !== 'in_attesa') {
        return (
            <Cornice>
                <div className="space-y-6">
                    <Intestazione r={r} />
                    <Esito r={r} appena={appena} />
                    <NotaDemo conRipristino />
                </div>
            </Cornice>
        );
    }

    const periodo = mesiTra(r.dal, r.al);
    const nome = r.proprietario.nome.split(' ')[0];
    const pronta = scelta === 'conferma' || (scelta === 'smentita' && mesi.length > 0 && documenti.length > 0);
    const notaDocumento = PROVE_SMENTITA.find(p => p.id === tipoDocumento)?.nota;

    const alterna = (m) => setMesi(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]));

    const aggiungiDocumento = (nomeFile) => {
        if (!tipoDocumento || !nomeFile) return;
        setDocumenti(prev => [...prev, { id: `${Date.now()}-${prev.length}`, tipo: tipoDocumento, nome: nomeFile }]);
        setTipoDocumento('');
    };

    const invia = () => {
        if (!pronta) return;
        setInvio(true);
        setTimeout(async () => {
            const fatto = await rispondiReferenza(token, { esito: scelta, mesi, documenti });
            setInvio(false);
            if (!fatto) {
                toast.error('La risposta non è stata registrata: la richiesta potrebbe essere già chiusa');
                return;
            }
            setAppena(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 800);
    };

    return (
        <Cornice>
            <div className="space-y-6">
                <div className="space-y-2">
                    <Intestazione r={r} />
                    <p className="text-[#6B6B5E]">
                        Ciao {nome}, {r.inquilino} sta chiedendo il suo certificato CRIA e ti ha indicato come precedente proprietario. Ti
                        chiediamo una cosa sola: se nel periodo qui sotto ha pagato regolarmente l’affitto.
                    </p>
                </div>

                <LaRichiesta r={r} />

                <section className={`${SCHEDA} space-y-5`} aria-labelledby="titolo-risposta">
                    <h2 id="titolo-risposta" className="text-xl text-[#1A2D52]" style={TITOLO_STILE}>La tua risposta</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SceltaRisposta
                            attiva={scelta === 'conferma'} onClick={() => setScelta('conferma')}
                            icona={CheckCircle2} tono="text-green-600"
                            titolo="Confermo: ha pagato regolarmente"
                            testo={`${maiuscola(fmtMesi(r.dal, r.al))}, per ${r.immobile}.`}
                        />
                        <SceltaRisposta
                            attiva={scelta === 'smentita'} onClick={() => setScelta('smentita')}
                            icona={XCircle} tono="text-amber-600"
                            titolo="Non confermo"
                            testo="Indichi i mesi e alleghi almeno un documento."
                        />
                    </div>

                    {scelta === 'conferma' && (
                        <div className="space-y-4">
                            <p className="text-sm text-[#3D3D35]">
                                Confermi che {r.inquilino} ha pagato regolarmente l’affitto di {r.immobile}, {fmtMesi(r.dal, r.al)}.
                            </p>
                            <Button onClick={invia} disabled={invio} className="w-full h-11 gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]">
                                {invio ? <><Loader2 className="w-4 h-4 animate-spin" /> Invio in corso…</> : <><Send className="w-4 h-4" /> Invia la conferma</>}
                            </Button>
                        </div>
                    )}

                    {scelta === 'smentita' && (
                        <div className="space-y-5">
                            <div className="flex items-start gap-3 p-4 bg-[#F5F5F0] rounded-xl text-sm text-[#1A2D52]">
                                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1.5 leading-relaxed">
                                    <p>Una smentita è una contestazione, non un fatto: da sola non entra nel semaforo di {r.inquilino}.</p>
                                    <p>
                                        Per esaminarla CRIA ha bisogno dei mesi che riguarda e di almeno un documento che la provi. Senza un documento
                                        entro il termine, la smentita decade e non lascia traccia.
                                    </p>
                                    <p>{r.inquilino} potrà rispondere, con i suoi movimenti bancari, prima di ogni decisione.</p>
                                </div>
                            </div>

                            <fieldset className="space-y-2">
                                <legend className="text-sm font-medium text-[#1A2D52]">I mesi che riguarda <span className="text-red-500">*</span></legend>
                                <p className="text-xs text-[#6B6B5E]">Tocca i mesi a cui si riferisce la smentita.</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {periodo.map(m => {
                                        const scelto = mesi.includes(m);
                                        return (
                                            <button
                                                key={m} type="button" aria-pressed={scelto} onClick={() => alterna(m)} title={nomeMese(m)}
                                                className={`px-2.5 py-1 rounded-md border text-xs tabular-nums transition-colors ${scelto ? 'border-amber-400 bg-amber-100 text-amber-900 font-medium' : 'border-[#E5E5DE] bg-white text-[#3D3D35] hover:border-[#1A2D52]/40'}`}
                                            >
                                                {meseBreve(m)}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-[#6B6B5E]" aria-live="polite">
                                    {mesi.length ? plurale(mesi.length, 'mese selezionato', 'mesi selezionati') : 'Nessun mese selezionato'}
                                </p>
                            </fieldset>

                            <fieldset className="space-y-3">
                                <legend className="text-sm font-medium text-[#1A2D52]">I documenti <span className="text-red-500">*</span></legend>
                                <p className="text-xs text-[#6B6B5E]">Almeno uno tra {oppure(PROVE_SMENTITA.map(p => p.etichetta.toLowerCase()))}.</p>
                                {documenti.length > 0 && (
                                    <ul className="space-y-2">
                                        {documenti.map(d => (
                                            <li key={d.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <span className="text-sm flex-1 min-w-0 truncate">
                                                    <span className="font-medium">{etichettaDocumento(d.tipo)}</span> · {d.nome}
                                                </span>
                                                <button
                                                    type="button" onClick={() => setDocumenti(prev => prev.filter(x => x.id !== d.id))}
                                                    className="text-[#6B6B5E] hover:text-red-500" aria-label={`Togli ${d.nome}`}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                                    <select aria-label="Tipo di documento" className={STILE_SELECT} value={tipoDocumento} onChange={e => setTipoDocumento(e.target.value)}>
                                        <option value="">Tipo di documento…</option>
                                        {PROVE_SMENTITA.map(p => <option key={p.id} value={p.id}>{p.etichetta}</option>)}
                                    </select>
                                    <input
                                        ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={e => { const f = e.target.files?.[0]; if (f) aggiungiDocumento(f.name); e.target.value = ''; }}
                                    />
                                    <Button type="button" variant="outline" disabled={!tipoDocumento} onClick={() => fileRef.current?.click()} className="h-10 gap-2">
                                        <Upload className="w-4 h-4" /> Carica il documento
                                    </Button>
                                </div>
                                <p className="text-xs text-[#6B6B5E]">
                                    {notaDocumento || (tipoDocumento ? 'PDF, JPG o PNG.' : 'Scegli il tipo, poi carica il file: PDF, JPG o PNG.')}
                                </p>
                            </fieldset>

                            {!pronta && <p className="text-xs text-[#6B6B5E]">Per inviare servono almeno un mese e un documento.</p>}
                            <Button onClick={invia} disabled={!pronta || invio} className="w-full h-11 gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]">
                                {invio ? <><Loader2 className="w-4 h-4 animate-spin" /> Invio in corso…</> : <><Send className="w-4 h-4" /> Invia la risposta</>}
                            </Button>
                        </div>
                    )}
                </section>

                <Riservatezza r={r} />

                <NotaDemo />
            </div>
        </Cornice>
    );
};

export default ReferenzaPage;
