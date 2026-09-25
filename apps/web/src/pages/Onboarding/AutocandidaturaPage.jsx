import React, { useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    AlertTriangle, ArrowRight, BadgeCheck, CheckCircle2, Clock, FileText, Info, Loader2, Lock, Plus,
    RotateCcw, Send, ShieldCheck, Trash2, Upload, UserCheck, X, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import AccessoShell, { SCHEDA, TITOLO_STILE } from '@/components/AccessoShell';
import NotaMockup from '@/components/NotaMockup';
import StatusBadge from '@/components/StatusBadge.jsx';
import FoglioCertificato from '@/components/aree/FoglioCertificato';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { PRODOTTI, PARAMETRI, fmtEuro } from '@/data/catalogo';
import { FONTE_CERTIFICATO } from '@/data/certificati';
import { OGGI } from '@/data/datiDemo';
import { useContratti, contrattiPerVerso } from '@/lib/contrattiFonte';
import {
    TIPI_PROVA, LIVELLI_PROVA, ORDINE_LIVELLI, STATI_AUTOCANDIDATURA, STATI_REFERENZA, CANALI_CONTATTO,
    PROVE_SMENTITA, PROVE_FORTI_MINIME, MESI_MINIMI, TENTATIVI_REFERENZA, GIORNI_LAVORATIVI_REFERENZA,
    DICITURA_NON_RISCONTRATA, tipoProva,
} from '@/data/autocandidature';
import { SEMAFORO, MESI_SEMAFORO } from '@/lib/semaforo';
import { fmtData, meseBreve, nomeMese } from '@/lib/formato';
import { nomeVisualizzato } from '@/lib/aree';
import { useCertificati, fattiCertificato, fmtPeriodoMesi, scadenzaCertificato } from '@/lib/certificatiDemo';
import {
    useAutocandidatura, avviaAutocandidatura, aggiungiProva, togliProva, chiediReferenza, rispondiAllaSmentita,
    inviaACria, concludiIstruttoria, simulaTentativo, simulaNessunaRisposta, ripristinaAutocandidatureDemo,
    verificaMinimo, referenzaBloccante, scadenzaReferenza, mesiTra, contaMesi,
    PERCORSO_AUTOCANDIDATURA, PERCORSO_PROVE, MESE_CORRENTE, percorsoReferenza,
} from '@/lib/autocandidatureDemo';

// ═════════════════════════════════════════════════════════════════════════════
// CERTIFICATO SU AUTOCANDIDATURA (P7) — E-07, E-08 con dentro E-09
// Per l'inquilino senza storico su CRIA (documento di stato §14.6 e §15.2).
//   /certificato/autocandidatura        E-07: per chi è, livelli, minimo, fonte, pagamento
//   /certificato/autocandidatura/prove  E-08: prove e avanzamento, con dentro E-09
//                                       (la referenza del precedente proprietario),
//                                       invio a CRIA, istruttoria, certificato emesso
// Il livello di una prova viene dal tipo di documento, non si sceglie. Il minimo
// sono due prove forti di tipo diverso che coprono gli stessi 12 mesi; sotto, il
// certificato riporta «storico insufficiente». La referenza parte solo se la
// chiede l'inquilino.
// ═════════════════════════════════════════════════════════════════════════════

const FONT_TITOLI = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,400,50;0,9..144,600,50&display=swap';

const P7 = PRODOTTI.P7;
const FONTE_DOCUMENTI = FONTE_CERTIFICATO.verificato_su_documentazione;
const FONTE_CRIA = FONTE_CERTIFICATO.rilevato_cria;
const INSUFFICIENTE = SEMAFORO.storico_insufficiente.etichetta;
const CERTIFICATO_INQUILINO = '/dashboard/inquilino/certificato';
const CARICABILI = TIPI_PROVA.filter(t => t.siCarica);

const NOMI_MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const ANNO_CORRENTE = Number(MESE_CORRENTE.slice(0, 4));
const ANNI = Array.from({ length: 16 }, (_, i) => String(ANNO_CORRENTE - i));

// ─── Testi e formati ──────────────────────────────────────────────────────────
const plurale = (n, uno, molti) => `${n} ${n === 1 ? uno : molti}`;
// ['diffida', 'estratto conto'] → 'diffida ed estratto conto'
const elenco = (voci) => {
    if (voci.length <= 1) return voci[0] || '';
    const ultima = voci[voci.length - 1];
    return `${voci.slice(0, -1).join(', ')} ${/^e/i.test(ultima) ? 'ed' : 'e'} ${ultima}`;
};
// ['a', 'b', 'c'] → 'a, b o c'
const oppure = (voci) => (voci.length <= 1 ? voci[0] || '' : `${voci.slice(0, -1).join(', ')} o ${voci[voci.length - 1]}`);

// ('2025-02', '2026-08') → 'da febbraio 2025 ad agosto 2026'; un mese solo → 'febbraio 2025'
const fmtMesi = (dal, al) => (dal === al ? nomeMese(dal).toLowerCase() : fmtPeriodoMesi({ dal, al }));

const nomeCanale = (c) => (c === 'sms' ? 'SMS' : CANALI_CONTATTO[c].toLowerCase());

const fmtForti = (n) => (n > PROVE_FORTI_MINIME ? `${n} (minimo ${PROVE_FORTI_MINIME})` : `${n} di ${PROVE_FORTI_MINIME}`);
const fmtCopertura = (n) => (n > MESI_MINIMI ? `${n} mesi (minimo ${MESI_MINIMI})` : `${plurale(n, 'mese', 'mesi')} di ${MESI_MINIMI}`);
const testoContatore = (m) => `Prove forti: ${fmtForti(m.forti)} · copertura: ${fmtCopertura(m.copertura)}`;

const cosaManca = (m) => {
    if (m.forti === 0) {
        return `Non hai ancora prove forti. Servono ${PROVE_FORTI_MINIME} prove forti di tipo diverso che coprano gli stessi ${MESI_MINIMI} mesi.`;
    }
    if (m.forti < PROVE_FORTI_MINIME) {
        const altre = PROVE_FORTI_MINIME - m.forti;
        return `Hai ${m.forti === 1 ? 'una prova forte' : `${m.forti} prove forti`}: ${altre === 1 ? 'ne serve un’altra' : `ne servono altre ${altre}`}, di tipo diverso, sugli stessi mesi. I mesi coperti da due prove forti devono essere almeno ${MESI_MINIMI}.`;
    }
    return `Le prove forti coprono insieme ${plurale(m.copertura, 'mese', 'mesi')}: ne servono almeno ${MESI_MINIMI}. Aggiungi prove che coprano più mesi in comune.`;
};

const nomiInAttesa = (a) => elenco(a.referenze.filter(r => r.stato === 'in_attesa').map(r => r.proprietario.nome));

// ─── Mesi nei moduli ──────────────────────────────────────────────────────────
const MESE_VUOTO = { anno: '', mese: '' };
const daMese = (iso) => (iso ? { anno: iso.slice(0, 4), mese: iso.slice(5, 7) } : MESE_VUOTO);
const comeMese = (v) => (v.anno && v.mese ? `${v.anno}-${v.mese}` : '');

const erroriPeriodo = (dal, al) => {
    if (!dal) return { dal: 'Scegli mese e anno' };
    if (!al) return { al: 'Scegli mese e anno' };
    if (dal > al) return { al: 'La fine viene prima dell’inizio' };
    if (al > MESE_CORRENTE) return { al: `Al massimo ${nomeMese(MESE_CORRENTE).toLowerCase()}` };
    return {};
};

const stile = (errore) => `w-full h-10 text-sm rounded-lg border px-3 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-[#1A2D52]/20 ${errore ? 'border-red-400' : 'border-[#E5E5DE]'}`;

// ─── Mattoni ──────────────────────────────────────────────────────────────────
const Cornice = ({ titolo, children }) => (
    <>
        <Helmet>
            <title>{`${titolo} - CRIA`}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link href={FONT_TITOLI} rel="stylesheet" />
        </Helmet>
        <AccessoShell
            larghezza="max-w-3xl"
            azione={<Link to="/dashboard" className="text-sm text-[#6B6B5E] hover:text-[#1A2D52]">Torna alla tua area</Link>}
        >
            {children}
        </AccessoShell>
    </>
);

const TONI = {
    neutro: 'bg-[#F5F5F0] text-[#1A2D52]',
    attenzione: 'bg-amber-50 border border-amber-200 text-amber-900',
    ok: 'bg-green-50 border border-green-200 text-green-900',
    blocco: 'bg-red-50 border border-red-200 text-red-900',
};

const Avviso = ({ icona: Icona = Info, tono = 'neutro', children }) => (
    <div className={`flex items-start gap-3 p-4 rounded-xl text-sm ${TONI[tono]}`}>
        <Icona className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed min-w-0">{children}</div>
    </div>
);

const Titolo = ({ id, icona: Icona, children }) => (
    <h2 id={id} className="text-xl text-[#1A2D52] flex items-center gap-2" style={TITOLO_STILE}>
        {Icona && <Icona className="w-5 h-5 flex-shrink-0" />} {children}
    </h2>
);

const Pillola = ({ classe, children }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap ${classe}`}>{children}</span>
);

const BadgeLivello = ({ livello }) => <Pillola classe={LIVELLI_PROVA[livello].classe}>{LIVELLI_PROVA[livello].etichetta}</Pillola>;

const Campo = ({ id, etichetta, obbligatorio, errore, nota, className = '', children }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label htmlFor={id} className="block text-sm font-medium text-[#1A2D52]">
            {etichetta}{obbligatorio && <span className="text-red-500"> *</span>}
        </label>
        {children}
        {nota && <p className="text-xs text-[#6B6B5E]">{nota}</p>}
        {errore && <p className="text-xs text-red-600">{errore}</p>}
    </div>
);

// Mese e anno con due tendine: funziona uguale su tutti i browser.
const SceltaMese = ({ legenda, valore, onChange, errore }) => (
    <fieldset className="space-y-1.5 min-w-0">
        <legend className="text-xs text-[#6B6B5E] mb-1">{legenda}</legend>
        <div className="grid grid-cols-[1fr_6.5rem] gap-2">
            <select aria-label={`${legenda}: mese`} className={stile(errore)} value={valore.mese} onChange={e => onChange({ ...valore, mese: e.target.value })}>
                <option value="">Mese…</option>
                {NOMI_MESI.map((n, i) => <option key={n} value={String(i + 1).padStart(2, '0')}>{n}</option>)}
            </select>
            <select aria-label={`${legenda}: anno`} className={stile(errore)} value={valore.anno} onChange={e => onChange({ ...valore, anno: e.target.value })}>
                <option value="">Anno…</option>
                {ANNI.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
        </div>
        {errore && <p className="text-xs text-red-600">{errore}</p>}
    </fieldset>
);

const Periodo = ({ titolo, nota, dal, al, onDal, onAl, errori }) => (
    <div className="space-y-2">
        <p className="text-sm font-medium text-[#1A2D52]">{titolo} <span className="text-red-500">*</span></p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SceltaMese legenda="Dal" valore={dal} onChange={onDal} errore={errori.dal} />
            <SceltaMese legenda="Al" valore={al} onChange={onAl} errore={errori.al} />
        </div>
        {nota && <p className="text-xs text-[#6B6B5E]">{nota}</p>}
    </div>
);

// Nei mockup del file resta solo il nome.
const Carica = ({ id, file, onChange, errore, testo = 'Carica il file' }) => {
    const ref = useRef(null);
    return (
        <div className="space-y-1.5">
            <input
                id={id} ref={ref} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => { const f = e.target.files?.[0]; if (f) onChange(f.name); e.target.value = ''; }}
            />
            {file ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-foreground flex-1 truncate">{file}</span>
                    <button type="button" onClick={() => onChange(null)} className="text-[#6B6B5E] hover:text-red-500" aria-label="Togli il file">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button
                    type="button" onClick={() => ref.current?.click()}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed text-left hover:border-[#1A2D52]/40 hover:bg-[#1A2D52]/5 transition-colors ${errore ? 'border-red-300' : 'border-[#E5E5DE]'}`}
                >
                    <Upload className="w-4 h-4 text-[#6B6B5E] flex-shrink-0" />
                    <span>
                        <span className="block text-sm font-medium text-[#1A2D52]">{testo}</span>
                        <span className="block text-xs text-[#6B6B5E]">PDF, JPG o PNG</span>
                    </span>
                </button>
            )}
            {errore && <p className="text-xs text-red-600">{errore}</p>}
        </div>
    );
};

const PASSI = ['Pagamento', 'Prove', 'Istruttoria', 'Certificato'];
const PASSO_DELLO_STATO = { prove: 1, istruttoria: 2, rifiutata: 3, emessa: 4 };

const Passi = ({ stato }) => {
    const attivo = PASSO_DELLO_STATO[stato] ?? 1;
    return (
        <ol className="flex items-center gap-2" aria-label="Avanzamento dell’autocandidatura">
            {PASSI.map((t, i) => {
                const respinto = stato === 'rifiutata' && i === attivo;
                const fatto = i < attivo;
                const corrente = i === attivo && !respinto;
                let cerchio = 'bg-[#E5E5DE] text-[#6B6B5E]';
                if (respinto) cerchio = 'bg-red-500 text-white';
                else if (fatto) cerchio = 'bg-green-500 text-white';
                else if (corrente) cerchio = 'bg-[#1A2D52] text-white';
                return (
                    <li key={t} aria-current={corrente ? 'step' : undefined}
                        className={`flex items-center gap-1.5 text-xs ${corrente || respinto ? 'text-[#1A2D52] font-semibold' : 'text-[#6B6B5E]'}`}>
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center ${cerchio}`}>
                            {respinto ? <X className="w-3.5 h-3.5" /> : fatto ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                        </span>
                        <span className="hidden md:inline">{t}</span>
                    </li>
                );
            })}
        </ol>
    );
};

// ─── E-07 · La tabella dei livelli ────────────────────────────────────────────
const TabellaLivelli = () => (
    <div className="overflow-hidden rounded-xl border border-[#E5E5DE]">
        <table className="w-full text-sm">
            <caption className="sr-only">I tipi di documento e il loro livello di prova</caption>
            <thead className="bg-[#F5F5F0] text-left">
                <tr>
                    <th scope="col" className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[#6B6B5E]">Documento</th>
                    <th scope="col" className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-[#6B6B5E]">Livello</th>
                </tr>
            </thead>
            {ORDINE_LIVELLI.map(livello => (
                <tbody key={livello} className="divide-y divide-[#E5E5DE] border-t border-[#E5E5DE]">
                    {TIPI_PROVA.filter(t => t.livello === livello).map(t => (
                        <tr key={t.id} className="align-top">
                            <td className="px-4 py-3">
                                <p className="font-medium text-[#1A2D52]">{t.etichetta}</p>
                                <p className="text-xs text-[#6B6B5E] mt-0.5">{t.nota}</p>
                            </td>
                            <td className="px-4 py-3 w-32 sm:w-44">
                                <BadgeLivello livello={livello} />
                                <p className="text-[11px] leading-snug text-[#6B6B5E] mt-1">{LIVELLI_PROVA[livello].spiegazione}</p>
                            </td>
                        </tr>
                    ))}
                </tbody>
            ))}
        </table>
    </div>
);

// ─── E-07 · Il pagamento, o l'autocandidatura già aperta ──────────────────────
const Pagamento = ({ persona }) => {
    const navigate = useNavigate();
    const [invio, setInvio] = useState(false);

    const paga = () => {
        setInvio(true);
        setTimeout(() => {
            avviaAutocandidatura(persona);
            toast.success(`Pagamento di ${fmtEuro(P7.prezzo)} ricevuto: ora carica le prove`);
            navigate(PERCORSO_PROVE);
        }, 900);
    };

    return (
        <section className="rounded-2xl bg-[#1A2D52] text-white p-6 space-y-4" aria-label="Prezzo e pagamento">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-0.5">
                    <p className="text-sm text-white/70">Da pagare adesso</p>
                    <p className="text-3xl" style={TITOLO_STILE}>{fmtEuro(P7.prezzo)}</p>
                    <p className="text-xs text-white/60">
                        Fattura intestata a {nomeVisualizzato(persona)} ·{' '}
                        <Link to="/profilo/fatturazione" className="underline underline-offset-4 hover:text-white">dati di fatturazione</Link>
                    </p>
                </div>
                <Button onClick={paga} disabled={invio} className="h-11 gap-2 bg-white text-[#1A2D52] hover:bg-[#F5F5F0]">
                    {invio
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Pagamento in corso…</>
                        : <>Paga {fmtEuro(P7.prezzo)} e carica le prove <ArrowRight className="w-4 h-4" /></>}
                </Button>
            </div>
            <p className="text-xs text-white/70 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 flex-shrink-0" /> Pagamento protetto · poi carichi le prove e, se vuoi, chiedi la referenza
            </p>
        </section>
    );
};

const GIA_APERTA = {
    prove: { titolo: 'La tua autocandidatura è aperta', azione: 'Vai alle prove' },
    istruttoria: { titolo: 'La tua autocandidatura è in istruttoria', azione: 'Vedi a che punto è' },
    emessa: { titolo: 'Il tuo certificato su autocandidatura è emesso', azione: 'Vedi il certificato' },
    rifiutata: { titolo: 'La tua autocandidatura è conclusa', azione: 'Vedi l’esito' },
};

const GiaAperta = ({ autocandidatura: a }) => {
    const testi = GIA_APERTA[a.stato] || GIA_APERTA.prove;
    const stato = STATI_AUTOCANDIDATURA[a.stato];
    return (
        <section className={`${SCHEDA} flex flex-wrap items-center justify-between gap-4`}>
            <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-[#1A2D52]">{testi.titolo}</p>
                    {stato && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stato.classe}`}>{stato.etichetta}</span>}
                </div>
                <p className="text-sm text-[#6B6B5E]">Pagata il {fmtData(a.pagamento.pagataIl)}: non devi pagare di nuovo.</p>
            </div>
            <Button asChild className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]">
                <Link to={PERCORSO_PROVE}>{testi.azione} <ArrowRight className="w-4 h-4" /></Link>
            </Button>
        </section>
    );
};

// ─── E-07 ─────────────────────────────────────────────────────────────────────
const Punto = ({ children }) => (
    <li className="flex items-start gap-2.5">
        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#C97B5C]" />
        <span>{children}</span>
    </li>
);

const SchermataInizio = ({ persona, autocandidatura, haAreaInquilino }) => (
    <Cornice titolo={P7.nome}>
        <div className="space-y-6">
            <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#6B6B5E]">Il tuo certificato, senza storico su CRIA</p>
                <h1 className="text-3xl text-[#1A2D52]" style={TITOLO_STILE}>{P7.nome}</h1>
                <p className="text-sm text-[#6B6B5E] mt-1">{fmtEuro(P7.prezzo)} · {P7.sintesi}</p>
            </div>

            <section className={`${SCHEDA} space-y-4`} aria-labelledby="titolo-per-chi">
                <Titolo id="titolo-per-chi">Per chi è</Titolo>
                <p className="text-sm text-[#3D3D35] leading-relaxed">
                    Per chi su CRIA non ha storico. A chi ti affitta casa un certificato che dice «non abbiamo informazioni» non
                    serve: con l’autocandidatura porti tu la documentazione, CRIA la istruisce come farebbe con un candidato e il
                    certificato dichiara da dove viene il dato.
                </p>
                {haAreaInquilino && (
                    <Avviso>
                        <p>
                            Su CRIA hai già un contratto da inquilino: il certificato con i dati rilevati da CRIA lo trovi nella tua area,
                            ed è gratuito con un contratto attivo.
                        </p>
                        <Link to={CERTIFICATO_INQUILINO} className="inline-flex items-center gap-1 font-medium underline underline-offset-4">
                            Vai al tuo certificato <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </Avviso>
                )}
            </section>

            <section className={`${SCHEDA} space-y-4`} aria-labelledby="titolo-livelli">
                <div className="space-y-1">
                    <Titolo id="titolo-livelli">Le prove e il loro livello</Titolo>
                    <p className="text-sm text-[#6B6B5E]">Il livello lo decide il tipo di documento, non il giudizio di un operatore.</p>
                </div>
                <TabellaLivelli />
            </section>

            <section className={`${SCHEDA} space-y-4`} aria-labelledby="titolo-minimo">
                <Titolo id="titolo-minimo">Il minimo per emettere</Titolo>
                <p className="text-lg text-[#1A2D52] leading-snug">
                    <span className="font-semibold">{PROVE_FORTI_MINIME} prove forti e indipendenti</span> che coprano almeno{' '}
                    <span className="font-semibold">{MESI_MINIMI} mesi</span>.
                </p>
                <ul className="space-y-2 text-sm text-[#3D3D35]">
                    <Punto>Indipendenti vuol dire di tipo diverso, sugli stessi mesi: per esempio il contratto registrato e la referenza del precedente proprietario.</Punto>
                    <Punto>Le prove medie confermano la coerenza, ma non contano. Quelle deboli non contano.</Punto>
                    <Punto>Sotto i {MESI_MINIMI} mesi non si dà un colore: il certificato riporta «{INSUFFICIENTE}».</Punto>
                    <Punto>Dei movimenti bancari ci servono solo i pagamenti del canone, mai l’estratto conto intero.</Punto>
                </ul>
            </section>

            <section className={`${SCHEDA} space-y-4`} aria-labelledby="titolo-fonte">
                <Titolo id="titolo-fonte">Cosa dirà il certificato</Titolo>
                <div className="rounded-xl border border-[#1A2D52]/15 p-4">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B6B5E]">Fonte del dato</p>
                    <p className="font-semibold text-[#1A2D52] mt-1">{FONTE_DOCUMENTI}</p>
                    <p className="text-xs text-[#6B6B5E] mt-1">Non «{FONTE_CRIA}»: quella fonte vale per i mesi che CRIA segue su un contratto.</p>
                </div>
                <ul className="space-y-2 text-sm text-[#3D3D35]">
                    <Punto>Lo storico che porti non viene pesato di meno: viene etichettato con la sua fonte.</Punto>
                    <Punto>Non attiva in automatico la garanzia.</Punto>
                    <Punto>Quando su CRIA avrai {MESI_SEMAFORO} mesi di dati rilevati, esce dal calcolo da solo.</Punto>
                    <Punto>Se il precedente proprietario non risponde, il certificato viene emesso lo stesso e lo dichiara: «{DICITURA_NON_RISCONTRATA}».</Punto>
                    <Punto>
                        Come ogni certificato CRIA attesta un periodo, ha un codice e un QR per la verifica e vale{' '}
                        {PARAMETRI.mesiValiditaCertificato} mesi dall’emissione.
                    </Punto>
                </ul>
            </section>

            {autocandidatura ? <GiaAperta autocandidatura={autocandidatura} /> : <Pagamento persona={persona} />}

            <NotaMockup>
                <p>
                    Il pagamento è simulato: non parte nessun addebito. L’autocandidatura, le prove e le referenze restano in questo
                    browser. Elena Greco (cliente@cri-affitti.it) ha già un’autocandidatura demo aperta, con il contratto registrato
                    caricato e la referenza chiesta a Roberto Fabbri.
                </p>
            </NotaMockup>
        </div>
    </Cornice>
);

// ─── E-08 · A che punto sei ───────────────────────────────────────────────────
const Barra = ({ etichetta, valore, massimo }) => (
    <div>
        <div className="flex justify-between gap-3 text-xs text-[#6B6B5E]">
            <span>{etichetta}</span>
            <span className="tabular-nums">{valore} / {massimo}</span>
        </div>
        <div
            className="mt-1.5 h-2 rounded-full bg-[#E5E5DE] overflow-hidden" role="progressbar" aria-label={etichetta}
            aria-valuemin={0} aria-valuemax={massimo} aria-valuenow={Math.min(valore, massimo)}
        >
            <div className={`h-full rounded-full ${valore >= massimo ? 'bg-green-500' : 'bg-[#1A2D52]'}`} style={{ width: `${Math.min(valore / massimo, 1) * 100}%` }} />
        </div>
    </div>
);

const COLORE_MESE = (n) => {
    if (n >= PROVE_FORTI_MINIME) return 'bg-green-500';
    return n === 1 ? 'bg-[#1A2D52]/35' : 'bg-[#E5E5DE]';
};

// Un quadretto per mese, dal primo all'ultimo mese coperto da una prova forte.
const StrisciaMesi = ({ perMese }) => {
    const coperti = Object.keys(perMese).sort();
    if (!coperti.length) return null;
    const mesi = mesiTra(coperti[0], coperti[coperti.length - 1]).slice(-60);
    return (
        <div className="space-y-2">
            <div className="flex gap-px" aria-hidden="true">
                {mesi.map(m => {
                    const n = perMese[m] || 0;
                    return (
                        <span
                            key={m} title={`${nomeMese(m)}: ${n === 0 ? 'nessuna prova forte' : plurale(n, 'prova forte', 'prove forti')}`}
                            className={`h-6 flex-1 min-w-[3px] first:rounded-l last:rounded-r ${COLORE_MESE(n)}`}
                        />
                    );
                })}
            </div>
            <div className="flex justify-between text-[11px] text-[#6B6B5E] tabular-nums" aria-hidden="true">
                <span>{meseBreve(mesi[0])}</span>
                <span>{meseBreve(mesi[mesi.length - 1])}</span>
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#6B6B5E]">
                <li className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#1A2D52]/35" /> Una prova forte</li>
                <li className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500" /> Due o più: il mese è coperto</li>
                <li className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#E5E5DE]" /> Nessuna</li>
            </ul>
        </div>
    );
};

const PannelloAvanzamento = ({ a, minimo }) => {
    const inAttesa = a.referenze.filter(r => r.stato === 'in_attesa');
    const seConfermano = inAttesa.length ? verificaMinimo(a, { referenze: ['confermata', 'in_attesa'] }) : null;
    const cambia = seConfermano && (seConfermano.forti !== minimo.forti || seConfermano.copertura !== minimo.copertura);

    return (
        <section className={`${SCHEDA} space-y-5`} aria-labelledby="titolo-avanzamento">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Titolo id="titolo-avanzamento">A che punto sei</Titolo>
                {minimo.raggiunto
                    ? <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Minimo raggiunto</span>
                    : <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Minimo non ancora raggiunto</span>}
            </div>

            <p className="text-base font-semibold text-[#1A2D52]" aria-live="polite">{testoContatore(minimo)}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Barra etichetta="Prove forti, di tipo diverso" valore={minimo.forti} massimo={PROVE_FORTI_MINIME} />
                <Barra etichetta="Mesi coperti da due prove forti" valore={minimo.copertura} massimo={MESI_MINIMI} />
            </div>

            <StrisciaMesi perMese={minimo.perMese} />

            {minimo.raggiunto ? (
                <Avviso icona={CheckCircle2} tono="ok">
                    <p>Il minimo c’è: {a.stato === 'prove' ? 'puoi inviare a CRIA.' : 'CRIA sta istruendo le prove.'}</p>
                </Avviso>
            ) : (
                <Avviso>
                    <p>{cosaManca(minimo)}</p>
                    <p>Finché il minimo non c’è, il certificato riporterebbe «{INSUFFICIENTE}», senza colore.</p>
                </Avviso>
            )}

            {cambia && (
                <p className="text-sm text-[#6B6B5E]">
                    Se {nomiInAttesa(a)} {inAttesa.length === 1 ? 'conferma' : 'confermano'} la referenza:{' '}
                    {testoContatore(seConfermano).replace('Prove forti', 'prove forti')}{seConfermano.raggiunto ? ', e il minimo c’è' : ''}.
                </p>
            )}
        </section>
    );
};

// ─── E-08 · Le prove caricate ─────────────────────────────────────────────────
const RigaProva = ({ prova: p, idAutocandidatura, modificabile }) => {
    const t = tipoProva(p.tipo);
    if (!t) return null;
    const togli = () => {
        if (togliProva(idAutocandidatura, p.id)) toast.success(`${t.etichetta}: tolta dalle prove`);
    };
    return (
        <li className="p-4 flex items-start gap-3">
            <FileText className="w-5 h-5 text-[#1A2D52] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-[#1A2D52]">{t.etichetta}</p>
                    <BadgeLivello livello={t.livello} />
                </div>
                <p className="text-sm text-[#3D3D35]">
                    <span className="first-letter:uppercase inline-block">{fmtMesi(p.dal, p.al)}</span> · {plurale(contaMesi(p.dal, p.al), 'mese', 'mesi')}
                </p>
                {p.immobile && <p className="text-xs text-[#6B6B5E]">{p.immobile}</p>}
                {p.estremi && (
                    <p className="text-xs text-[#6B6B5E]">
                        Registrazione <span className="font-mono">{p.estremi.numero}</span> del {fmtData(p.estremi.data)} · {p.estremi.ufficio}
                    </p>
                )}
                <p className="text-xs text-[#6B6B5E] truncate">{p.file} · caricato il {fmtData(p.caricataIl)}</p>
                <p className={`text-xs ${t.livello === 'forte' ? 'text-green-700' : 'text-[#6B6B5E]'}`}>
                    {LIVELLI_PROVA[t.livello].effetto}{t.livello === 'medio' ? ': conferma la coerenza delle altre prove' : ''}
                </p>
            </div>
            {modificabile && (
                <button type="button" onClick={togli} className="p-1 text-[#6B6B5E] hover:text-red-600" aria-label={`Togli ${t.etichetta}`}>
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </li>
    );
};

const ElencoProve = ({ a, modificabile }) => (
    <section className={`${SCHEDA} space-y-4`} aria-labelledby="titolo-prove">
        <div className="space-y-1">
            <Titolo id="titolo-prove" icona={FileText}>Le prove che hai caricato</Titolo>
            <p className="text-sm text-[#6B6B5E]">Il livello viene dal tipo di documento: non si sceglie.</p>
        </div>
        {a.prove.length === 0 ? (
            <p className="text-sm text-[#6B6B5E] rounded-xl border border-dashed border-[#E5E5DE] p-4 text-center">Nessuna prova caricata, per ora.</p>
        ) : (
            <ul className="divide-y divide-[#E5E5DE] rounded-xl border border-[#E5E5DE]">
                {a.prove.map(p => <RigaProva key={p.id} prova={p} idAutocandidatura={a.id} modificabile={modificabile} />)}
            </ul>
        )}
    </section>
);

// ─── E-08 · Aggiungi una prova ────────────────────────────────────────────────
const PROVA_VUOTA = { tipo: '', dal: MESE_VUOTO, al: MESE_VUOTO, file: null, immobile: '', numero: '', data: '', ufficio: '' };

const NuovaProva = ({ a }) => {
    const [d, setD] = useState(PROVA_VUOTA);
    const [errori, setErrori] = useState({});
    const set = (k, v) => { setD(p => ({ ...p, [k]: v })); setErrori(p => ({ ...p, [k]: undefined })); };
    const t = tipoProva(d.tipo);
    const livello = t ? LIVELLI_PROVA[t.livello] : null;
    const contratto = d.tipo === 'contratto_registrato';

    const aggiungi = () => {
        const dal = comeMese(d.dal);
        const al = comeMese(d.al);
        const e = { ...erroriPeriodo(dal, al) };
        if (!d.tipo) e.tipo = 'Scegli il tipo di documento';
        if (!d.file) e.file = 'Carica il file';
        if (contratto) {
            if (!d.immobile.trim()) e.immobile = 'Inserisci l’indirizzo dell’immobile';
            if (!d.numero.trim()) e.numero = 'Inserisci il numero di registrazione';
            if (!d.data) e.data = 'Inserisci la data di registrazione';
            if (!d.ufficio.trim()) e.ufficio = 'Inserisci l’ufficio';
        }
        setErrori(e);
        if (Object.keys(e).length) {
            toast.error('Controlla i campi evidenziati');
            return;
        }
        const fatto = aggiungiProva(a.id, {
            tipo: d.tipo, file: d.file, dal, al,
            ...(contratto && {
                immobile: d.immobile.trim(),
                estremi: { numero: d.numero.trim().toUpperCase(), data: d.data, ufficio: d.ufficio.trim() },
            }),
        });
        if (!fatto) {
            toast.error('Non è stato possibile aggiungere la prova');
            return;
        }
        toast.success(`${t.etichetta}: aggiunta alle prove`);
        setD(PROVA_VUOTA);
    };

    return (
        <section className={`${SCHEDA} space-y-5`} aria-labelledby="titolo-nuova-prova">
            <div className="space-y-1">
                <Titolo id="titolo-nuova-prova" icona={Upload}>Aggiungi una prova</Titolo>
                <p className="text-sm text-[#6B6B5E]">La referenza del precedente proprietario non si carica: la chiedi qui sotto.</p>
            </div>

            <Campo id="tipo-prova" etichetta="Tipo di documento" obbligatorio errore={errori.tipo}>
                <select id="tipo-prova" className={stile(errori.tipo)} value={d.tipo} onChange={e => set('tipo', e.target.value)}>
                    <option value="">Scegli…</option>
                    {CARICABILI.map(x => <option key={x.id} value={x.id}>{x.etichetta}</option>)}
                </select>
            </Campo>

            {t && (
                <div className="flex items-start gap-3 rounded-xl border border-[#E5E5DE] p-4" aria-live="polite">
                    <BadgeLivello livello={t.livello} />
                    <div className="text-sm min-w-0">
                        <p className="text-[#1A2D52]">
                            <span className="font-medium">Livello {livello.etichetta.toLowerCase()}:</span> {livello.spiegazione.toLowerCase()}. {livello.effetto}.
                        </p>
                        <p className="text-xs text-[#6B6B5E] mt-0.5">{t.nota} Il livello lo decide il tipo di documento: non si sceglie.</p>
                    </div>
                </div>
            )}

            {d.tipo === 'movimenti_canone' && (
                <Avviso icona={AlertTriangle} tono="attenzione">
                    <p>Carica solo i movimenti con cui hai pagato il canone, non l’estratto conto intero: il resto dei tuoi movimenti non ci serve.</p>
                </Avviso>
            )}

            {contratto && (
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                    <Campo id="prova-immobile" etichetta="Indirizzo dell’immobile" obbligatorio errore={errori.immobile} className="sm:col-span-6">
                        <input id="prova-immobile" className={stile(errori.immobile)} placeholder="Via Mazzini 3, Verona" value={d.immobile} onChange={e => set('immobile', e.target.value)} />
                    </Campo>
                    <Campo id="prova-numero" etichetta="Numero di registrazione" obbligatorio errore={errori.numero} className="sm:col-span-3">
                        <input id="prova-numero" className={`${stile(errori.numero)} uppercase`} placeholder="TNE24T003411000KF" value={d.numero} onChange={e => set('numero', e.target.value)} />
                    </Campo>
                    <Campo id="prova-data" etichetta="Data di registrazione" obbligatorio errore={errori.data} className="sm:col-span-3">
                        <input id="prova-data" type="date" max={OGGI} className={stile(errori.data)} value={d.data} onChange={e => set('data', e.target.value)} />
                    </Campo>
                    <Campo id="prova-ufficio" etichetta="Ufficio" obbligatorio errore={errori.ufficio} className="sm:col-span-6">
                        <input id="prova-ufficio" className={stile(errori.ufficio)} placeholder="DP Verona" value={d.ufficio} onChange={e => set('ufficio', e.target.value)} />
                    </Campo>
                </div>
            )}

            <Periodo
                titolo="I mesi che copre" nota={`I mesi di affitto che il documento dimostra, fino a ${nomeMese(MESE_CORRENTE).toLowerCase()}.`}
                dal={d.dal} al={d.al} onDal={v => set('dal', v)} onAl={v => set('al', v)} errori={errori}
            />

            <div className="space-y-1.5">
                <p className="text-sm font-medium text-[#1A2D52]">Il file <span className="text-red-500">*</span></p>
                <Carica id="file-prova" file={d.file} onChange={f => set('file', f)} errore={errori.file} />
            </div>

            <Button onClick={aggiungi} className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]">
                <Plus className="w-4 h-4" /> Aggiungi la prova
            </Button>
        </section>
    );
};

// ─── E-09 · La referenza del precedente proprietario ──────────────────────────
const Tentativi = ({ r, scadenza }) => (
    <div className="space-y-2">
        <p className="text-sm font-medium text-[#1A2D52]">Tentativi di contatto: {r.tentativi.length} di {TENTATIVI_REFERENZA}</p>
        <ol className="space-y-1.5">
            {Array.from({ length: TENTATIVI_REFERENZA }, (_, i) => {
                const t = r.tentativi[i];
                return (
                    <li key={i} className="flex items-center gap-2 text-sm">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] flex-shrink-0 ${t ? 'bg-[#1A2D52] text-white' : 'bg-[#E5E5DE] text-[#6B6B5E]'}`}>
                            {i + 1}
                        </span>
                        {t
                            ? <span className="text-[#3D3D35]">{CANALI_CONTATTO[t.canale]} · {fmtData(t.il)}</span>
                            : <span className="text-[#6B6B5E]">{i === r.tentativi.length ? 'Se non risponde, CRIA riprova su un altro canale' : 'Solo se serve'}</span>}
                    </li>
                );
            })}
        </ol>
        <p className="text-xs text-[#6B6B5E]">
            Senza risposta entro il {fmtData(scadenza)} ({GIORNI_LAVORATIVI_REFERENZA} giorni lavorativi dalla richiesta) il certificato viene
            emesso lo stesso e riporta «{DICITURA_NON_RISCONTRATA}».
        </p>
    </div>
);

const NonRiscontrata = ({ r, a, scadenza }) => {
    const blocca = referenzaBloccante(a, r);
    return (
        <div className="space-y-2">
            <p className="text-sm text-[#3D3D35]">
                Nessuna risposta dopo {plurale(r.tentativi.length, 'tentativo', 'tentativi')} ({elenco(r.tentativi.map(t => nomeCanale(t.canale)))}),
                entro il {fmtData(r.chiusaIl || scadenza)}.
            </p>
            <p className="text-sm text-[#3D3D35]">
                Il certificato riporterà: <span className="font-medium text-[#1A2D52]">«{DICITURA_NON_RISCONTRATA}»</span>.
            </p>
            {blocca ? (
                <Avviso icona={AlertTriangle} tono="blocco">
                    <p>
                        Blocca: era una delle due prove forti e senza di lei il minimo non c’è. Aggiungi un’altra prova forte sugli stessi mesi,
                        oppure invia comunque: il certificato riporterà «{INSUFFICIENTE}».
                    </p>
                </Avviso>
            ) : (
                <p className="text-xs text-[#6B6B5E]">Non blocca: il certificato viene emesso lo stesso e lo dichiara.</p>
            )}
        </div>
    );
};

const Smentita = ({ r, a }) => {
    const [file, setFile] = useState(null);
    const risposta = r.risposta || { mesi: [], documenti: [] };
    const allegati = [...new Set(risposta.documenti.map(d => PROVE_SMENTITA.find(p => p.id === d.tipo)?.etichetta.toLowerCase() || d.tipo))];
    const puoRispondere = !r.replica && (a.stato === 'prove' || a.stato === 'istruttoria');

    const rispondi = () => {
        if (rispondiAllaSmentita(a.id, r.id, file)) {
            toast.success('La tua risposta è arrivata a CRIA');
            setFile(null);
        }
    };

    return (
        <div className="space-y-3">
            <p className="text-sm text-[#3D3D35]">
                Il {fmtData(risposta.il)} {r.proprietario.nome} ha risposto che non conferma{' '}
                {risposta.mesi.length === 1 ? 'questo mese' : `questi ${risposta.mesi.length} mesi`}:
            </p>
            <ul className="flex flex-wrap gap-1.5" aria-label="Mesi contestati">
                {risposta.mesi.map(m => (
                    <li key={m} className="px-2 py-0.5 rounded-md border border-amber-200 bg-amber-50 text-xs text-amber-900 tabular-nums" title={nomeMese(m)}>
                        {meseBreve(m)}
                    </li>
                ))}
            </ul>
            {allegati.length > 0 && <p className="text-sm text-[#3D3D35]">Ha allegato: {elenco(allegati)}.</p>}
            <Avviso>
                <p>È una contestazione, non un fatto: da sola non entra nel semaforo.</p>
                <p>Prima che CRIA decida, rispondi tu con i movimenti del tuo conto per quei mesi: solo i pagamenti del canone, non l’estratto conto intero.</p>
                <p>Se la smentita è documentata e contraddice quello che hai dichiarato, è una dichiarazione falsa ed è motivo di rifiuto.</p>
            </Avviso>
            {r.replica && (
                <p className="flex items-start gap-2 text-sm text-green-800">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Hai risposto il {fmtData(r.replica.il)} con «{r.replica.file}».</span>
                </p>
            )}
            {puoRispondere && (
                <div className="space-y-2">
                    <Carica id={`replica-${r.id}`} file={file} onChange={setFile} testo="Carica i movimenti del tuo conto" />
                    <Button disabled={!file} onClick={rispondi} className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]">
                        <Send className="w-4 h-4" /> Invia la tua risposta
                    </Button>
                </div>
            )}
            {r.contestazione?.esito === 'non_regge' && (
                <p className="text-sm text-[#3D3D35]">CRIA ha concluso che la smentita non regge: non lascia traccia.</p>
            )}
        </div>
    );
};

const SchedaReferenza = ({ r, a }) => {
    const stato = STATI_REFERENZA[r.stato];
    const scadenza = scadenzaReferenza(r);
    const recapiti = [r.proprietario.email, r.proprietario.telefono].filter(Boolean).join(' · ');
    return (
        <li className="rounded-xl border border-[#E5E5DE] p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="font-medium text-[#1A2D52]">{r.proprietario.nome}</p>
                    <p className="text-sm text-[#6B6B5E]">{r.immobile} · {fmtMesi(r.dal, r.al)}</p>
                    <p className="text-xs text-[#6B6B5E] break-words">Chiesta il {fmtData(r.richiestaIl)}{recapiti ? ` · ${recapiti}` : ''}</p>
                </div>
                {stato && <Pillola classe={stato.classe}>{stato.etichetta}</Pillola>}
            </div>
            {r.stato === 'in_attesa' && <Tentativi r={r} scadenza={scadenza} />}
            {r.stato === 'confermata' && (
                <Avviso icona={CheckCircle2} tono="ok">
                    <p>Confermata il {fmtData(r.risposta?.il)}: conta come prova forte, {fmtMesi(r.dal, r.al)}.</p>
                </Avviso>
            )}
            {r.stato === 'non_riscontrata' && <NonRiscontrata r={r} a={a} scadenza={scadenza} />}
            {r.stato === 'smentita' && <Smentita r={r} a={a} />}
        </li>
    );
};

const FormReferenza = ({ a, persona, onFatto, onAnnulla }) => {
    const [d, setD] = useState(() => {
        const contratto = [...a.prove].reverse().find(p => p.tipo === 'contratto_registrato');
        return { nome: '', email: '', telefono: '', immobile: contratto?.immobile || '', dal: daMese(contratto?.dal), al: daMese(contratto?.al) };
    });
    const [errori, setErrori] = useState({});
    const set = (k, v) => { setD(p => ({ ...p, [k]: v })); setErrori(p => ({ ...p, [k]: undefined, recapito: undefined })); };

    const chiedi = () => {
        const dal = comeMese(d.dal);
        const al = comeMese(d.al);
        const email = d.email.trim();
        const telefono = d.telefono.trim();
        const e = { ...erroriPeriodo(dal, al) };
        if (!d.nome.trim()) e.nome = 'Inserisci nome e cognome';
        if (!email && !telefono) e.recapito = 'Serve almeno un recapito: email o telefono';
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'L’email non sembra valida';
        if (telefono && !/^\+?[\d\s]{8,16}$/.test(telefono)) e.telefono = 'Il telefono non sembra valido';
        if (!d.immobile.trim()) e.immobile = 'Inserisci l’indirizzo dell’immobile';
        setErrori(e);
        if (Object.keys(e).length) {
            toast.error('Controlla i campi evidenziati');
            return;
        }
        const fatto = chiediReferenza(a.id, {
            inquilino: nomeVisualizzato(persona), nome: d.nome.trim(), email, telefono, immobile: d.immobile.trim(), dal, al,
        });
        if (!fatto) {
            toast.error('Non è stato possibile chiedere la referenza');
            return;
        }
        toast.success(`Richiesta partita: CRIA contatta ${d.nome.trim()}`);
        onFatto();
    };

    return (
        <div className="rounded-xl border border-[#1A2D52]/20 bg-[#F5F5F0]/50 p-4 sm:p-5 space-y-4">
            <p className="font-medium text-[#1A2D52]">A chi la chiediamo</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo id="ref-nome" etichetta="Nome e cognome del precedente proprietario" obbligatorio errore={errori.nome} className="sm:col-span-2">
                    <input id="ref-nome" className={stile(errori.nome)} placeholder="Roberto Fabbri" value={d.nome} onChange={e => set('nome', e.target.value)} />
                </Campo>
                <Campo id="ref-email" etichetta="Email" errore={errori.email}>
                    <input id="ref-email" type="email" className={stile(errori.email || errori.recapito)} placeholder="nome@esempio.it" value={d.email} onChange={e => set('email', e.target.value)} />
                </Campo>
                <Campo id="ref-telefono" etichetta="Telefono" errore={errori.telefono}>
                    <input id="ref-telefono" inputMode="tel" className={stile(errori.telefono || errori.recapito)} placeholder="+39 333 123 4567" value={d.telefono} onChange={e => set('telefono', e.target.value)} />
                </Campo>
            </div>
            {errori.recapito
                ? <p className="text-xs text-red-600">{errori.recapito}</p>
                : <p className="text-xs text-[#6B6B5E]">Come risultano dal contratto di locazione: CRIA lo contatta lì. Meglio entrambi, perché i tentativi sono su canali diversi.</p>}
            <Campo id="ref-immobile" etichetta="Indirizzo dell’immobile" obbligatorio errore={errori.immobile}>
                <input id="ref-immobile" className={stile(errori.immobile)} placeholder="Via Mazzini 3, Verona" value={d.immobile} onChange={e => set('immobile', e.target.value)} />
            </Campo>
            <Periodo
                titolo="Il periodo in cui ci hai abitato in affitto" dal={d.dal} al={d.al}
                onDal={v => set('dal', v)} onAl={v => set('al', v)} errori={errori}
            />
            <div className="flex flex-wrap gap-2">
                <Button onClick={chiedi} className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]">
                    <Send className="w-4 h-4" /> Chiedi la referenza
                </Button>
                {onAnnulla && <Button variant="outline" onClick={onAnnulla}>Annulla</Button>}
            </div>
            <p className="text-xs text-[#6B6B5E]">
                Il primo tentativo parte subito. Dal suo link il precedente proprietario vede chi chiede la referenza, l’immobile e il periodo.
            </p>
        </div>
    );
};

const BoxReferenza = ({ a, persona }) => {
    const [aperto, setAperto] = useState(false);
    const inCorso = a.stato === 'prove';
    const nessuna = a.referenze.length === 0;
    const mostraForm = inCorso && (nessuna || aperto);

    return (
        <section className={`${SCHEDA} space-y-5`} aria-labelledby="titolo-referenza">
            <div className="space-y-1">
                <Titolo id="titolo-referenza" icona={UserCheck}>Chiedi la referenza al precedente proprietario</Titolo>
                <p className="text-sm text-[#6B6B5E]">È una prova forte: conta quando lui la conferma.</p>
            </div>

            <Avviso icona={ShieldCheck}>
                <p className="font-semibold">Parte solo perché la chiedi tu.</p>
                <p>CRIA non contatta nessun proprietario di sua iniziativa, e nessuno può mandarci una referenza su di te se non l’hai chiesta.</p>
            </Avviso>

            <div className="text-sm text-[#3D3D35] space-y-2 leading-relaxed">
                <p>CRIA contatta il precedente proprietario al recapito indicato sul contratto di locazione, e lui risponde da un link personale.</p>
                <p>
                    Se non risponde dopo {TENTATIVI_REFERENZA} tentativi su canali diversi, entro {GIORNI_LAVORATIVI_REFERENZA} giorni lavorativi,
                    il certificato viene emesso lo stesso e riporta «{DICITURA_NON_RISCONTRATA}». Blocca solo se era una delle due prove
                    forti e senza di lei il minimo non c’è.
                </p>
            </div>

            <details className="rounded-xl border border-[#E5E5DE] p-4 text-sm">
                <summary className="cursor-pointer font-medium text-[#1A2D52]">E se non conferma?</summary>
                <div className="mt-3 space-y-2 text-[#3D3D35] leading-relaxed">
                    <p>È una contestazione, non un fatto: la smentita da sola non entra nel semaforo.</p>
                    <p>
                        CRIA gli chiede i mesi e almeno un documento: {oppure(PROVE_SMENTITA.map(p => p.etichetta.toLowerCase()))}.
                        Senza un documento entro il termine la smentita decade e non lascia traccia.
                    </p>
                    <p>Tu rispondi per primo, con i movimenti del tuo conto.</p>
                    <p>Una smentita documentata che contraddice quello che hai dichiarato è una dichiarazione falsa ed è motivo di rifiuto.</p>
                </div>
            </details>

            {!nessuna && (
                <ul className="space-y-3" aria-label="Referenze chieste">
                    {a.referenze.map(r => <SchedaReferenza key={r.id} r={r} a={a} />)}
                </ul>
            )}

            {mostraForm && (
                <FormReferenza a={a} persona={persona} onFatto={() => setAperto(false)} onAnnulla={nessuna ? null : () => setAperto(false)} />
            )}
            {inCorso && !mostraForm && (
                <Button variant="outline" className="gap-2 h-auto py-2 whitespace-normal text-left" onClick={() => setAperto(true)}>
                    <Plus className="w-4 h-4" /> Chiedi la referenza a un altro precedente proprietario
                </Button>
            )}
        </section>
    );
};

// ─── E-08 · Invio a CRIA ──────────────────────────────────────────────────────
const InviaComunque = ({ a, minimo, onConferma }) => {
    const inAttesa = nomiInAttesa(a);
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" className="h-11">Invia comunque…</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Inviare sotto il minimo?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-2">
                            <p>{testoContatore(minimo)}.</p>
                            <p>
                                Con queste prove il certificato riporterà <span className="font-semibold text-foreground">«{INSUFFICIENTE}»</span>,
                                senza colore: servono {PROVE_FORTI_MINIME} prove forti di tipo diverso che coprano almeno {MESI_MINIMI} mesi.
                            </p>
                            {inAttesa && <p>La referenza di {inAttesa} è ancora in attesa: se arriva confermata durante l’istruttoria, CRIA ne tiene conto.</p>}
                            <p>Dopo l’invio le prove non si modificano più.</p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Torna alle prove</AlertDialogCancel>
                    <AlertDialogAction className="bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={onConferma}>Invia comunque</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

const Invio = ({ a, minimo }) => {
    const inAttesa = nomiInAttesa(a);
    const invia = () => {
        if (!inviaACria(a.id)) return;
        toast.success('Inviata a CRIA: comincia l’istruttoria');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <section className={`${SCHEDA} space-y-4`} aria-labelledby="titolo-invio">
            <Titolo id="titolo-invio" icona={Send}>Invia a CRIA</Titolo>
            {minimo.raggiunto ? (
                <p className="text-sm text-[#3D3D35]">
                    Il minimo c’è. CRIA istruisce le tue prove come farebbe con un candidato. Dopo l’invio le prove non si modificano più.
                </p>
            ) : (
                <p className="text-sm text-[#3D3D35]">
                    «Invia a CRIA» si attiva quando hai {PROVE_FORTI_MINIME} prove forti di tipo diverso che coprono almeno {MESI_MINIMI} mesi.
                    Puoi anche inviare adesso: il certificato riporterà «{INSUFFICIENTE}», senza colore.
                </p>
            )}
            {inAttesa && <p className="text-xs text-[#6B6B5E]">La referenza di {inAttesa} è ancora in attesa: conta solo se arriva confermata.</p>}
            <div className="flex flex-wrap gap-2">
                <Button onClick={invia} disabled={!minimo.raggiunto} className="h-11 gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]">
                    <Send className="w-4 h-4" /> Invia a CRIA
                </Button>
                {!minimo.raggiunto && <InviaComunque a={a} minimo={minimo} onConferma={invia} />}
            </div>
        </section>
    );
};

// ─── E-08 · Stati finali ──────────────────────────────────────────────────────
const Testata = ({ icona: Icona, tono, titolo, children }) => (
    <div className="flex items-start gap-4">
        <span className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${tono}`}>
            <Icona className="w-6 h-6" />
        </span>
        <div className="space-y-1 min-w-0">
            <h2 className="text-xl text-[#1A2D52]" style={TITOLO_STILE}>{titolo}</h2>
            <div className="text-sm text-[#6B6B5E] space-y-1">{children}</div>
        </div>
    </div>
);

const InIstruttoria = ({ a, minimo }) => {
    const inAttesa = nomiInAttesa(a);
    return (
        <section className={`${SCHEDA} space-y-4`}>
            <Testata icona={Clock} tono="bg-amber-50 text-amber-600" titolo={`In istruttoria dal ${fmtData(a.inviataIl)}`}>
                <p>CRIA verifica le prove che hai portato, come farebbe con un candidato. Il livello di ogni prova resta quello del suo tipo di documento.</p>
            </Testata>
            {!minimo.raggiunto && (
                <Avviso icona={AlertTriangle} tono="attenzione">
                    <p>
                        Hai inviato sotto il minimo: con queste prove il certificato riporterà «{INSUFFICIENTE}», senza colore.
                        {inAttesa ? ` Conta ancora la referenza di ${inAttesa}, se arriva confermata.` : ''}
                    </p>
                </Avviso>
            )}
        </section>
    );
};

const CertificatoEmesso = ({ a, persona, haAreaInquilino }) => {
    const certificati = useCertificati(persona.id);
    const tuttiIContratti = useContratti();
    const contratti = useMemo(() => contrattiPerVerso(tuttiIContratti, persona.id, 'conduttore'), [tuttiIContratti, persona.id]);
    const certificato = certificati.find(c => c.id === a.certificatoId) || null;

    if (!certificato) {
        return (
            <section className={SCHEDA}>
                <Testata icona={Info} tono="bg-[#1A2D52]/5 text-[#1A2D52]" titolo="Certificato emesso">
                    <p>Il certificato è stato emesso il {fmtData(a.conclusaIl)}, ma in questo browser non c’è più: i certificati demo sono stati ripristinati.</p>
                </Testata>
            </section>
        );
    }

    const { valore } = fattiCertificato(certificato, contratti);
    const annotazioni = certificato.annotazioni || [];

    return (
        <div className="space-y-6">
            <section className={`${SCHEDA} space-y-5`}>
                <Testata icona={BadgeCheck} tono="bg-green-50 text-green-600" titolo={`Certificato emesso il ${fmtData(certificato.emessoIl)}`}>
                    <p>
                        Codice <span className="font-mono font-medium text-[#1A2D52] tracking-wider">{certificato.codice}</span> · valido fino
                        al {fmtData(scadenzaCertificato(certificato))}
                    </p>
                </Testata>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-[#E5E5DE] p-4">
                    <div className="space-y-1">
                        <dt className="text-[10px] uppercase tracking-[0.14em] text-[#6B6B5E]">Semaforo del periodo</dt>
                        <dd className="flex flex-wrap items-center gap-2 text-sm text-[#1A2D52]">
                            <StatusBadge status={valore} />
                            <span className="first-letter:uppercase inline-block">{fmtPeriodoMesi(certificato.periodo)}</span>
                        </dd>
                    </div>
                    <div className="space-y-1">
                        <dt className="text-[10px] uppercase tracking-[0.14em] text-[#6B6B5E]">Fonte del dato</dt>
                        <dd className="text-sm font-medium text-[#1A2D52]">{FONTE_CERTIFICATO[certificato.fonte] || certificato.fonte}</dd>
                    </div>
                </dl>

                {valore === 'storico_insufficiente' && (
                    <Avviso icona={AlertTriangle} tono="attenzione">
                        <p>Meno di {MESI_MINIMI} mesi coperti da due prove forti: il certificato non dà un colore e riporta «{INSUFFICIENTE}».</p>
                    </Avviso>
                )}

                {annotazioni.length > 0 && (
                    <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B6B5E]">Il certificato dichiara anche</p>
                        <ul className="text-sm font-medium text-[#1A2D52] space-y-0.5">
                            {annotazioni.map(t => <li key={t}>«{t}»</li>)}
                        </ul>
                    </div>
                )}

                <p className="text-sm text-[#3D3D35] leading-relaxed">
                    Lo storico che hai portato non viene pesato di meno: è etichettato con la sua fonte. Non attiva in automatico la
                    garanzia e, quando su CRIA avrai {MESI_SEMAFORO} mesi di dati rilevati, esce dal calcolo da solo.
                </p>

                {haAreaInquilino && (
                    <div className="flex flex-wrap items-center gap-3">
                        <Button asChild className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]">
                            <Link to={CERTIFICATO_INQUILINO}>Vai al tuo certificato <ArrowRight className="w-4 h-4" /></Link>
                        </Button>
                        <p className="text-xs text-[#6B6B5E]">Lo trovi nella tua area inquilino, con i codici e le verifiche.</p>
                    </div>
                )}
            </section>

            {!haAreaInquilino && <FoglioCertificato certificato={certificato} persona={persona} contratti={contratti} />}
        </div>
    );
};

const NonAccolta = ({ a }) => {
    const r = a.referenze.find(x => x.contestazione?.esito === 'fondata');
    return (
        <section className={SCHEDA}>
            <Testata icona={XCircle} tono="bg-red-50 text-red-600" titolo="Il certificato non è stato emesso">
                <p>
                    {r ? `La smentita di ${r.proprietario.nome} è documentata` : 'Una smentita documentata'} e contraddice quello che avevi
                    dichiarato: vale come dichiarazione falsa ed è motivo di rifiuto.
                </p>
                <p className="text-xs">Istruttoria conclusa il {fmtData(a.conclusaIl)}.</p>
            </Testata>
        </section>
    );
};

// ─── Simulazioni (solo nei mockup) ────────────────────────────────────────────
const NotaSimulazioni = ({ a, persona }) => {
    const inAttesa = a.referenze.filter(r => r.stato === 'in_attesa');
    const contestate = a.referenze.some(r => r.stato === 'smentita');

    const concludi = (smentita) => {
        const fatto = concludiIstruttoria(a.id, persona, { smentita });
        if (!fatto) return;
        toast.success(fatto.stato === 'emessa' ? 'Certificato emesso' : 'Autocandidatura non accolta');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const ripristina = () => {
        ripristinaAutocandidatureDemo();
        toast.success('Autocandidatura demo ripristinata');
    };

    return (
        <NotaMockup>
            <div className="space-y-4">
                <p>L’autocandidatura, le prove e le referenze restano in questo browser. La demo è ferma al {fmtData(OGGI)}.</p>

                {inAttesa.map(r => (
                    <div key={r.id} className="space-y-2">
                        <p>
                            Referenza di {r.proprietario.nome}: il suo link personale è{' '}
                            <Link to={percorsoReferenza(r.token)} target="_blank" rel="noopener noreferrer" className="underline font-mono break-all">
                                {percorsoReferenza(r.token)}
                            </Link>
                            . Aprilo e rispondi come farebbe lui: la risposta compare qui.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" className="bg-white" disabled={r.tentativi.length >= TENTATIVI_REFERENZA} onClick={() => simulaTentativo(a.id, r.id)}>
                                Simula un altro tentativo
                            </Button>
                            <Button size="sm" variant="outline" className="bg-white" onClick={() => simulaNessunaRisposta(a.id, r.id)}>
                                Simula nessuna risposta in {GIORNI_LAVORATIVI_REFERENZA} giorni lavorativi
                            </Button>
                        </div>
                    </div>
                ))}

                {a.stato === 'istruttoria' && (
                    <div className="space-y-2">
                        <p>
                            L’istruttoria la chiudi tu. Il tempo si comprime: le referenze ancora in attesa si chiudono come non riscontrate,
                            e dai documenti si leggono pagamenti regolari.
                        </p>
                        {contestate ? (
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" className="bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={() => concludi('non_regge')}>
                                    CRIA conclude: la smentita non regge
                                </Button>
                                <Button size="sm" variant="outline" className="bg-white" onClick={() => concludi('fondata')}>
                                    CRIA conclude: la smentita è documentata
                                </Button>
                            </div>
                        ) : (
                            <Button size="sm" className="bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={() => concludi()}>
                                CRIA conclude l’istruttoria
                            </Button>
                        )}
                    </div>
                )}

                <Button size="sm" variant="outline" className="gap-2 bg-white" onClick={ripristina}>
                    <RotateCcw className="w-3.5 h-3.5" /> Ripristina l’autocandidatura demo
                </Button>
            </div>
        </NotaMockup>
    );
};

// ─── E-08 ─────────────────────────────────────────────────────────────────────
const TITOLI_PROVE = {
    prove: 'Le tue prove',
    istruttoria: 'In istruttoria',
    emessa: 'Il tuo certificato',
    rifiutata: 'Autocandidatura non accolta',
};

const SchermataProve = ({ persona, autocandidatura: a, haAreaInquilino }) => {
    const minimo = useMemo(() => verificaMinimo(a), [a]);
    const titolo = TITOLI_PROVE[a.stato] || TITOLI_PROVE.prove;
    const aperta = a.stato === 'prove' || a.stato === 'istruttoria';

    return (
        <Cornice titolo={titolo}>
            <div className="space-y-6">
                <div className="flex items-end justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#6B6B5E]">{P7.nome} · pagata il {fmtData(a.pagamento.pagataIl)}</p>
                        <h1 className="text-3xl text-[#1A2D52]" style={TITOLO_STILE}>{titolo}</h1>
                        <p className="text-sm text-[#6B6B5E]">
                            {a.stato === 'prove' && 'Carica i documenti e, se vuoi, chiedi la referenza al precedente proprietario. '}
                            <Link to={PERCORSO_AUTOCANDIDATURA} className="underline underline-offset-4 hover:text-[#1A2D52]">Come funziona</Link>
                        </p>
                    </div>
                    <Passi stato={a.stato} />
                </div>

                {a.stato === 'emessa' && <CertificatoEmesso a={a} persona={persona} haAreaInquilino={haAreaInquilino} />}
                {a.stato === 'rifiutata' && <NonAccolta a={a} />}
                {a.stato === 'istruttoria' && <InIstruttoria a={a} minimo={minimo} />}

                {aperta && (
                    <>
                        <PannelloAvanzamento a={a} minimo={minimo} />
                        <ElencoProve a={a} modificabile={a.stato === 'prove'} />
                        {a.stato === 'prove' && <NuovaProva a={a} />}
                        <BoxReferenza a={a} persona={persona} />
                        {a.stato === 'prove' && <Invio a={a} minimo={minimo} />}
                    </>
                )}

                <NotaSimulazioni a={a} persona={persona} />
            </div>
        </Cornice>
    );
};

// ─── Pagina ───────────────────────────────────────────────────────────────────
// Una pagina per due indirizzi: /certificato/autocandidatura (E-07) e
// /certificato/autocandidatura/prove (E-08). Con `schermata` ('inizio' | 'prove')
// si forza la schermata. La rotta va dentro RichiedeAccesso.
const AutocandidaturaPage = ({ schermata }) => {
    const { pathname } = useLocation();
    const { persona, contesti } = useAuth();
    const autocandidatura = useAutocandidatura(persona?.id);
    const vista = schermata || (/\/prove\/?$/.test(pathname) ? 'prove' : 'inizio');
    const haAreaInquilino = contesti.some(c => c.area === 'inquilino');

    if (!persona) return <Navigate to="/login" replace state={{ da: pathname }} />;
    if (vista === 'prove') {
        if (!autocandidatura) return <Navigate to={PERCORSO_AUTOCANDIDATURA} replace />;
        return <SchermataProve persona={persona} autocandidatura={autocandidatura} haAreaInquilino={haAreaInquilino} />;
    }
    return <SchermataInizio persona={persona} autocandidatura={autocandidatura} haAreaInquilino={haAreaInquilino} />;
};

export default AutocandidaturaPage;
