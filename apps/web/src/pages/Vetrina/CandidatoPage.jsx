import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Upload, FileText, X, Lock, ShieldCheck, AlertTriangle, ChevronDown, Info, Loader2, Trash2 } from 'lucide-react';
import AccessoShell, { SCHEDA, TITOLO_STILE } from '@/components/AccessoShell';
import NotaMockup from '@/components/NotaMockup';
import { usePraticaPerToken, aggiornaPratica } from '@/lib/praticheDemo';
import { OGGI } from '@/data/datiDemo';
import { nomeProdotto } from '@/data/catalogo';
import { persone } from '@/data/personeDemoIndice';
import { fmtData } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// DOCUMENTI DEL CANDIDATO — E-11, con dentro E-12 (come filtrare l'estratto
// conto) ed E-13 (documento non conforme).
// Si apre dal link personale mandato via SMS ed email: niente account. Il
// candidato legge l'informativa, dà i consensi — separati — e carica i suoi
// documenti. Il proprietario vede quali mancano, non i documenti (§14.5).
// ═════════════════════════════════════════════════════════════════════════════

const VERSIONE_INFORMATIVA = '1.0 del 15 settembre 2026';

// Documenti da caricare (il consenso si dà a parte, nel passo prima)
const DA_CARICARE = [
    { tipo: 'identita', etichetta: 'Documento d’identità', nota: 'Carta d’identità, passaporto o patente, fronte e retro' },
    { tipo: 'codice_fiscale', etichetta: 'Codice fiscale', nota: 'Tessera sanitaria o certificato di attribuzione' },
    { tipo: 'movimenti_canone', etichetta: 'Pagamenti del canone degli ultimi 12 mesi', nota: 'Solo i movimenti con cui hai pagato l’affitto, non l’estratto conto intero', filtrato: true },
    { tipo: 'reddito', etichetta: 'Documenti di reddito', nota: 'Ultime buste paga, oppure dichiarazione dei redditi' },
];

// Nei mockup un file che si chiama «estratto…» o «completo» simula un estratto conto non filtrato.
const sembraNonFiltrato = (nome) => /estratto|completo|conto_corrente|lista_movimenti/i.test(nome);

const Consenso = ({ attivo, onChange, titolo, testo, obbligatorio }) => (
    <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${attivo ? 'border-[#1A2D52] bg-[#1A2D52]/5' : 'border-[#E5E5DE] hover:border-[#1A2D52]/40'}`}>
        <input type="checkbox" className="w-4 h-4 mt-0.5 accent-[#1A2D52]" checked={attivo} onChange={e => onChange(e.target.checked)} />
        <span>
            <span className="block text-sm font-medium text-[#1A2D52]">{titolo} {obbligatorio ? <span className="text-red-500">*</span> : <span className="text-xs font-normal text-[#6B6B5E]">· facoltativo</span>}</span>
            <span className="block text-sm text-[#6B6B5E] mt-0.5">{testo}</span>
        </span>
    </label>
);

const ComeFiltrare = () => {
    const [aperto, setAperto] = useState(false);
    return (
        <div className="rounded-xl border border-[#E5E5DE] bg-[#F5F5F0]/60">
            <button type="button" onClick={() => setAperto(a => !a)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
                <span className="text-sm font-medium text-[#1A2D52]">Come si prendono solo i movimenti dell’affitto</span>
                <ChevronDown className={`w-4 h-4 text-[#1A2D52] transition-transform ${aperto ? 'rotate-180' : ''}`} />
            </button>
            {aperto && (
                <div className="px-4 pb-4 space-y-3 text-sm text-[#6B6B5E]">
                    <p>Ci servono solo data, importo, beneficiario e causale dei bonifici con cui hai pagato il canone negli ultimi 12 mesi. Il resto dell’estratto conto non lo vogliamo vedere: dice troppo di te.</p>
                    <ol className="list-decimal pl-5 space-y-1">
                        <li>Nell’home banking apri la lista dei movimenti e filtra per <span className="text-[#1A2D52]">beneficiario</span> (il proprietario) o per <span className="text-[#1A2D52]">causale</span> («affitto», «canone»).</li>
                        <li>Scegli gli ultimi 12 mesi.</li>
                        <li>Esporta o stampa in PDF <span className="text-[#1A2D52]">solo quei movimenti</span>. Quasi tutte le banche lo permettono dalla ricerca dei movimenti.</li>
                    </ol>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>Un rettangolo nero disegnato su un PDF non cancella il testo: sotto resta leggibile. Se la banca non filtra, stampa i soli movimenti e riscansionali.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const Caricamento = ({ doc, file, onFile, rifiuti }) => {
    const ref = useRef(null);
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[#1A2D52]">{doc.etichetta} <span className="text-red-500">*</span></p>
                {rifiuti > 0 && <span className="text-xs text-amber-700">{rifiuti} {rifiuti === 1 ? 'file rifiutato' : 'file rifiutati'}</span>}
            </div>
            <p className="text-xs text-[#6B6B5E]">{doc.nota}</p>
            <input ref={ref} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f.name); e.target.value = ''; }} />
            {file ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm flex-1 truncate">{file}</span>
                    <button type="button" onClick={() => onFile(null)} className="text-[#6B6B5E] hover:text-red-500" aria-label="Togli il file"><X className="w-4 h-4" /></button>
                </div>
            ) : (
                <button type="button" onClick={() => ref.current?.click()} className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-[#E5E5DE] hover:border-[#1A2D52]/40 hover:bg-[#1A2D52]/5 text-left">
                    <Upload className="w-4 h-4 text-[#6B6B5E]" />
                    <span className="text-sm text-[#1A2D52]">Carica il file</span>
                    <span className="text-xs text-[#6B6B5E] ml-auto">PDF, JPG o PNG</span>
                </button>
            )}
        </div>
    );
};

const CandidatoPage = () => {
    const { token } = useParams();
    const p = usePraticaPerToken(token);
    const [passo, setPasso] = useState(0);
    const [valutazione, setValutazione] = useState(false);
    const [database, setDatabase] = useState(false);
    const [file, setFile] = useState({});
    const [rifiuti, setRifiuti] = useState({});
    const [avviso, setAvviso] = useState('');
    const [invio, setInvio] = useState(false);

    if (!p || !p.candidato) {
        return (
            <AccessoShell>
                <div className={`${SCHEDA} text-center space-y-3`}>
                    <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
                    <h1 className="text-xl text-[#1A2D52]" style={TITOLO_STILE}>Questo link non è valido</h1>
                    <p className="text-sm text-[#6B6B5E]">Può essere scaduto o incompleto. Chiedi al proprietario di mandartene uno nuovo dalla sua pratica.</p>
                </div>
            </AccessoShell>
        );
    }

    const c = p.candidato;
    const proprietario = persone[p.personaId];
    const completati = c.documenti.every(d => d.stato === 'caricato');
    const nome = c.nome.split(' ')[0];

    const carica = (doc, nomeFile) => {
        setAvviso('');
        if (nomeFile && doc.filtrato && sembraNonFiltrato(nomeFile)) {
            setRifiuti(r => ({ ...r, [doc.tipo]: (r[doc.tipo] || 0) + 1 }));
            setAvviso(`«${nomeFile}» sembra un estratto conto completo: non l’abbiamo accettato né letto, e l’abbiamo cancellato subito. Carica solo i movimenti del canone.`);
            return;
        }
        setFile(f => ({ ...f, [doc.tipo]: nomeFile }));
    };

    const pronti = DA_CARICARE.every(d => file[d.tipo]);

    const invia = () => {
        setInvio(true);
        setTimeout(() => {
            aggiornaPratica(p.id, {
                stato: p.stato === 'documenti' ? 'istruttoria' : p.stato,
                candidato: {
                    ...c,
                    ultimoAccesso: OGGI,
                    consensi: { valutazione: true, database, versioneInformativa: VERSIONE_INFORMATIVA, il: OGGI },
                    documenti: c.documenti.map(d => ({ ...d, stato: 'caricato' })),
                },
            });
            setInvio(false);
            setPasso(3);
        }, 900);
    };

    return (
        <>
            <Helmet><title>I tuoi documenti - CRIA</title></Helmet>
            <AccessoShell larghezza="max-w-2xl">
                <div className="space-y-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#6B6B5E]">Link personale di {c.nome}</p>
                        <h1 className="text-3xl text-[#1A2D52]" style={TITOLO_STILE}>
                            {completati && passo < 3 ? 'Hai già inviato tutto' : `Ciao ${nome}, carichi tu i tuoi documenti`}
                        </h1>
                        <p className="text-[#6B6B5E] mt-1">
                            {proprietario ? `${proprietario} ti ha indicato` : 'Il proprietario ti ha indicato'} come {c.inquilinoAttuale ? 'inquilino' : 'candidato inquilino'} per {p.immobile.indirizzo}, {p.immobile.citta} ({nomeProdotto(p.prodotto)}).
                        </p>
                    </div>

                    {completati && passo < 3 ? (
                        <div className={`${SCHEDA} space-y-3`}>
                            <p className="flex items-center gap-2 text-green-700"><CheckCircle2 className="w-5 h-5" /> I documenti sono arrivati: CRIA li sta verificando.</p>
                            <p className="text-sm text-[#6B6B5E]">Il proprietario vede che la documentazione è completa, non i documenti. Se CRIA ha bisogno di altro, ti scrive a {c.email}.</p>
                        </div>
                    ) : (
                        <>
                            <ol className="flex items-center gap-2 text-xs">
                                {['Informativa e consensi', 'Documenti', 'Invio'].map((t, i) => (
                                    <li key={t} className={`flex items-center gap-1.5 ${i === Math.min(passo, 2) ? 'text-[#1A2D52] font-semibold' : 'text-[#6B6B5E]'}`}>
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${i < passo ? 'bg-green-500 text-white' : i === Math.min(passo, 2) ? 'bg-[#1A2D52] text-white' : 'bg-[#E5E5DE]'}`}>{i < passo ? '✓' : i + 1}</span>
                                        <span>{t}</span>
                                    </li>
                                ))}
                            </ol>

                            {passo === 0 && (
                                <div className={`${SCHEDA} space-y-5`}>
                                    <div className="flex items-start gap-3 p-4 bg-[#F5F5F0] rounded-xl text-sm text-[#1A2D52]">
                                        <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <p>I documenti li vede solo CRIA. Il proprietario sa soltanto quali mancano. Movimenti bancari e documenti di reddito si cancellano 30 giorni dopo la decisione: restano solo gli indicatori che servono al semaforo.</p>
                                    </div>
                                    <details className="rounded-xl border border-[#E5E5DE] p-4 text-sm text-[#6B6B5E]">
                                        <summary className="cursor-pointer text-[#1A2D52] font-medium">Leggi l’informativa (versione {VERSIONE_INFORMATIVA})</summary>
                                        <div className="mt-3 space-y-2">
                                            <p>CRIA tratta i tuoi dati per valutare la tua candidatura come inquilino per l’immobile indicato e, se lo consenti, per inserire lo storico dei tuoi pagamenti nel suo database.</p>
                                            <p>Puoi sempre sapere quali dati CRIA ha su di te, gratuitamente, e revocare il consenso all’inserimento nel database.</p>
                                            <p className="text-xs">Testo provvisorio: la versione definitiva la scrive un legale prima del lancio.</p>
                                        </div>
                                    </details>
                                    <div className="space-y-3">
                                        <Consenso attivo={valutazione} onChange={setValutazione} obbligatorio
                                            titolo="Consenso alla valutazione"
                                            testo="CRIA usa i documenti che carichi per valutare questa candidatura." />
                                        <Consenso attivo={database} onChange={setDatabase}
                                            titolo="Consenso all’inserimento nel database"
                                            testo="Lo storico dei tuoi pagamenti entra nel database CRIA: ti serve per avere il tuo certificato. Puoi revocarlo quando vuoi." />
                                    </div>
                                    <Button disabled={!valutazione} onClick={() => setPasso(1)} className="w-full h-11 bg-[#1A2D52] hover:bg-[#0F1B33]">Continua</Button>
                                </div>
                            )}

                            {passo === 1 && (
                                <div className={`${SCHEDA} space-y-5`}>
                                    {avviso && (
                                        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800" role="alert">
                                            <Trash2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <p><span className="font-medium">Documento non filtrato.</span> {avviso}</p>
                                        </div>
                                    )}
                                    {DA_CARICARE.map(doc => (
                                        <div key={doc.tipo} className="space-y-3">
                                            <Caricamento doc={doc} file={file[doc.tipo]} onFile={nomeFile => carica(doc, nomeFile)} rifiuti={rifiuti[doc.tipo] || 0} />
                                            {doc.filtrato && <ComeFiltrare />}
                                        </div>
                                    ))}
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setPasso(0)}>Indietro</Button>
                                        <Button disabled={!pronti} onClick={() => setPasso(2)} className="flex-1 h-11 bg-[#1A2D52] hover:bg-[#0F1B33]">Continua</Button>
                                    </div>
                                </div>
                            )}

                            {passo === 2 && (
                                <div className={`${SCHEDA} space-y-5`}>
                                    <ul className="space-y-2">
                                        {DA_CARICARE.map(d => (
                                            <li key={d.tipo} className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-4 h-4 text-green-600" /><span className="text-[#1A2D52]">{d.etichetta}</span><span className="text-[#6B6B5E] truncate ml-auto">{file[d.tipo]}</span></li>
                                        ))}
                                        <li className="flex items-center gap-3 text-sm"><ShieldCheck className="w-4 h-4 text-green-600" /><span className="text-[#1A2D52]">Consenso alla valutazione</span></li>
                                        <li className="flex items-center gap-3 text-sm"><ShieldCheck className={`w-4 h-4 ${database ? 'text-green-600' : 'text-[#6B6B5E]'}`} /><span className="text-[#1A2D52]">Inserimento nel database: {database ? 'sì' : 'no'}</span></li>
                                    </ul>
                                    <div className="flex items-start gap-3 p-4 bg-[#F5F5F0] rounded-xl text-sm text-[#1A2D52]"><Info className="w-4 h-4 flex-shrink-0 mt-0.5" /><p>Una persona del team CRIA controlla i documenti. Se serve altro ti scriviamo a {c.email}.</p></div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setPasso(1)}>Indietro</Button>
                                        <Button onClick={invia} disabled={invio} className="flex-1 h-11 bg-[#1A2D52] hover:bg-[#0F1B33]">
                                            {invio ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Invio in corso…</> : 'Invia a CRIA'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {passo === 3 && (
                                <div className={`${SCHEDA} text-center space-y-4`}>
                                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                                    <h2 className="text-2xl text-[#1A2D52]" style={TITOLO_STILE}>Documenti inviati</h2>
                                    <p className="text-[#6B6B5E]">CRIA li verifica: una persona del team, non un algoritmo. Il proprietario vede che la documentazione è completa, non i documenti.</p>
                                    <p className="text-sm text-[#6B6B5E]">Vuoi sapere come funziona il semaforo? <Link to="/per-inquilini" className="text-[#1A2D52] underline underline-offset-4">Per inquilini</Link></p>
                                </div>
                            )}
                        </>
                    )}

                    <NotaMockup>
                        <p>Il link arriva al candidato via SMS ed email. Per simulare un estratto conto non filtrato, carica tra i pagamenti del canone un file che si chiama «estratto_conto.pdf».</p>
                        <p className="mt-1">Link demo: <Link className="underline" to="/candidato/solferino14-lb">Via Solferino 14</Link> · invitato il {fmtData(c.invitatoIl)}</p>
                    </NotaMockup>
                </div>
            </AccessoShell>
        </>
    );
};

export default CandidatoPage;
