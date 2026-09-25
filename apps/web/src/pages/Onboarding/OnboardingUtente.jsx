import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, ChevronLeft, ChevronRight, FileText, Upload, X, Loader2, Info, Home, FileSignature, UserPlus, Receipt, Pencil } from 'lucide-react';
import AccessoShell, { SCHEDA, TITOLO_STILE } from '@/components/AccessoShell';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { PRODOTTI, PARAMETRI, nomeProdotto, prezzoProdotto, fmtEuro, calcolaPrezzo } from '@/data/catalogo';
import { DOCUMENTI_CANDIDATO } from '@/data/pratiche';
import { OGGI } from '@/data/datiDemo';
import { creaPratica } from '@/lib/praticheDemo';
import { nomeVisualizzato } from '@/lib/aree';
import { useProdotti, causaleCliente, CODICE_ISCRIZIONE } from '@/lib/prodottiDemo';
import MetodiPagamento from '@/components/aree/MetodiPagamento';

// ═════════════════════════════════════════════════════════════════════════════
// ONBOARDING DELL'IMMOBILE — P-02, con dentro P-03 (invito del candidato) e
// P-04 (prezzo calcolato). Si arriva dalla scelta del prodotto (P-01).
// L'identità non si chiede qui: è già verificata dal documento (F-07).
// All'invio si paga la quota di iscrizione e nasce la pratica (P-07).
// ═════════════════════════════════════════════════════════════════════════════

const PASSI = [
    { id: 'immobile', titolo: 'L’immobile', icona: Home },
    { id: 'contratto', titolo: 'Il contratto', icona: FileSignature },
    { id: 'inquilino', titolo: 'L’inquilino', icona: UserPlus },
    { id: 'riepilogo', titolo: 'Riepilogo e prezzo', icona: Receipt },
];

const TIPOLOGIE = ['Monolocale', 'Bilocale', 'Trilocale', 'Quadrilocale', 'Casa indipendente', 'Altro'];
const DURATE = ['4 + 4 anni, canone libero', '3 + 2 anni, canone concordato', 'Transitorio, da 1 a 18 mesi', 'Per studenti, da 6 a 36 mesi'];

const stile = (errore) => `w-full h-10 text-sm rounded-lg border px-3 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-[#1A2D52]/20 ${errore ? 'border-red-400' : 'border-[#E5E5DE]'}`;

const Campo = ({ etichetta, obbligatorio, errore, nota, className = '', children }) => (
    <div className={`space-y-1.5 ${className}`}>
        <Label>{etichetta} {obbligatorio && <span className="text-red-500">*</span>}</Label>
        {children}
        {nota && <p className="text-xs text-muted-foreground">{nota}</p>}
        {errore && <p className="text-xs text-red-600">{errore}</p>}
    </div>
);

const Scelta = ({ opzioni, valore, onChange }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {opzioni.map(o => (
            <button key={o.valore} type="button" onClick={() => onChange(o.valore)}
                className={`text-left px-4 py-3 rounded-lg border-2 text-sm transition-all ${valore === o.valore ? 'border-[#1A2D52] bg-[#1A2D52]/5 text-[#1A2D52] font-medium' : 'border-[#E5E5DE] text-muted-foreground hover:border-[#1A2D52]/40'}`}>
                {o.etichetta}
                {o.nota && <span className="block text-xs font-normal text-muted-foreground mt-0.5">{o.nota}</span>}
            </button>
        ))}
    </div>
);

const Carica = ({ etichetta, obbligatorio, file, onChange, errore, nota }) => {
    const ref = useRef(null);
    return (
        <Campo etichetta={etichetta} obbligatorio={obbligatorio} errore={errore} nota={nota}>
            <input ref={ref} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => { const f = e.target.files?.[0]; if (f) onChange({ nome: f.name }); e.target.value = ''; }} />
            {file ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-foreground flex-1 truncate">{file.nome}</span>
                    <button type="button" onClick={() => onChange(null)} className="text-muted-foreground hover:text-red-500" aria-label="Togli il file"><X className="w-4 h-4" /></button>
                </div>
            ) : (
                <button type="button" onClick={() => ref.current?.click()}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed hover:border-[#1A2D52]/40 hover:bg-[#1A2D52]/5 transition-colors ${errore ? 'border-red-300' : 'border-[#E5E5DE]'}`}>
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-left">
                        <span className="block text-sm font-medium text-foreground">Carica il file</span>
                        <span className="block text-xs text-muted-foreground">PDF, JPG o PNG</span>
                    </span>
                </button>
            )}
        </Campo>
    );
};

const Avviso = ({ children }) => (
    <div className="flex items-start gap-3 p-4 bg-[#F5F5F0] rounded-xl text-sm text-[#1A2D52]">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">{children}</div>
    </div>
);

// ─── Onboarding dell'immobile ────────────────────────────────────────────────
// Alcuni prodotti dicono già se il contratto di locazione c'è: CRIA Gestione
// ha le due varianti, CRIA Completo parte da un contratto nuovo. Per gli altri,
// compresi quelli aggiunti dall'admin, lo si chiede.
const CONTRATTO_DEL_PRODOTTO = { P1: 'no', P1E: 'si', P2: 'no' };

const OnboardingImmobile = ({ prodotto }) => {
    const navigate = useNavigate();
    const { persona } = useAuth();
    const p = PRODOTTI[prodotto];
    const giuridica = persona?.tipo === 'giuridica';

    const [passo, setPasso] = useState(0);
    const [errori, setErrori] = useState({});
    const [invio, setInvio] = useState(false);
    const [metodo, setMetodo] = useState('');
    const [erroreMetodo, setErroreMetodo] = useState('');
    const catalogo = useProdotti();
    const quota = catalogo.trova(CODICE_ISCRIZIONE);
    const [d, setD] = useState({
        indirizzo: '', cap: '', citta: '', provincia: '', tipologia: '', mq: '', catasto: '',
        titolarita: giuridica ? 'societa' : '', visura: null, delega: null,
        esistente: CONTRATTO_DEL_PRODOTTO[prodotto] ?? '',
        canone: '', deposito: '', inizio: '', durata: '', regNumero: '', regData: '', regUfficio: '', contrattoFile: null,
        invitaDopo: false, nome: '', cognome: '', cellulare: '', email: '', referente: '',
    });
    const set = (k, v) => { setD(prev => ({ ...prev, [k]: v })); setErrori(prev => ({ ...prev, [k]: undefined })); };
    const valore = (k) => ({ value: d[k], onChange: (e) => set(k, e.target.value) });
    const esistente = d.esistente === 'si';
    const canone = Number(String(d.canone).replace(',', '.')) || 0;

    const verifica = (i) => {
        const e = {};
        const obbl = (k, msg) => { if (!String(d[k] ?? '').trim()) e[k] = msg; };
        if (i === 0) {
            obbl('indirizzo', 'Inserisci l’indirizzo'); obbl('cap', 'Inserisci il CAP'); obbl('citta', 'Inserisci la città'); obbl('provincia', 'Inserisci la provincia');
            if (d.cap && !/^\d{5}$/.test(d.cap)) e.cap = 'Il CAP ha 5 cifre';
            if (!d.titolarita) e.titolarita = 'Indica il tuo rapporto con l’immobile';
            if (!d.visura) e.visura = 'La visura catastale serve alla verifica';
            if (d.titolarita === 'gestore' && !d.delega) e.delega = 'Serve la delega del proprietario';
        }
        if (i === 1) {
            if (!d.esistente) e.esistente = 'Indica se il contratto esiste già';
            if (!canone) e.canone = 'Inserisci il canone mensile';
            obbl('inizio', esistente ? 'Inserisci la data di inizio' : 'Inserisci la data di inizio prevista');
            obbl('durata', 'Scegli la durata');
            if (esistente) {
                obbl('regNumero', 'Inserisci il numero di registrazione'); obbl('regData', 'Inserisci la data di registrazione'); obbl('regUfficio', 'Inserisci l’ufficio');
                if (!d.contrattoFile) e.contrattoFile = 'Carica il contratto registrato';
            }
        }
        if (i === 2 && !d.invitaDopo) {
            obbl('nome', 'Inserisci il nome'); obbl('cognome', 'Inserisci il cognome');
            if (!/^\+?[\d\s]{8,16}$/.test(d.cellulare.trim())) e.cellulare = 'Serve un cellulare valido: il link arriva anche via SMS';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) e.email = 'Serve un’email valida';
        }
        setErrori(e);
        return Object.keys(e).length === 0;
    };

    const avanti = () => {
        if (!verifica(passo)) { toast.error('Controlla i campi evidenziati'); return; }
        setPasso(s => s + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const invia = () => {
        if (!metodo) {
            setErroreMetodo('Scegli come pagare la quota');
            return;
        }
        setInvio(true);
        setTimeout(async () => {
            const id = `pr-${Date.now()}`;
            const esito = await creaPratica({
                id,
                personaId: persona.id,
                prodotto,
                contratto: esistente ? 'esistente' : 'nuovo',
                immobile: { indirizzo: d.indirizzo.trim(), cap: d.cap, citta: d.citta.trim(), provincia: d.provincia.toUpperCase(), tipologia: d.tipologia || '—', mq: Number(d.mq) || null, catasto: d.catasto.trim() || '—' },
                titolarita: d.titolarita,
                canone,
                deposito: Number(d.deposito) || null,
                ...(esistente
                    ? { inizio: d.inizio, registrazione: { numero: d.regNumero.trim(), data: d.regData, ufficio: d.regUfficio.trim() } }
                    : { inizioPrevisto: d.inizio }),
                durata: d.durata,
                apertaIl: OGGI,
                quotaPagataIl: OGGI,
                stato: 'documenti',
                documentiProprietario: [
                    { tipo: 'visura', etichetta: 'Visura catastale', stato: 'in_attesa' },
                    ...(d.titolarita === 'gestore' ? [{ tipo: 'delega', etichetta: 'Delega del proprietario', stato: 'in_attesa' }] : []),
                    ...(esistente ? [{ tipo: 'contratto', etichetta: 'Contratto di locazione registrato', stato: 'in_attesa' }] : []),
                ],
                candidato: d.invitaDopo ? null : {
                    nome: `${d.nome.trim()} ${d.cognome.trim()}`, email: d.email.trim(), cellulare: d.cellulare.trim(),
                    invitatoIl: OGGI, ultimoAccesso: null, inquilinoAttuale: esistente, token: Math.random().toString(36).slice(2, 10),
                    documenti: DOCUMENTI_CANDIDATO.map(x => ({ ...x, stato: 'mancante' })),
                },
                referente: d.referente.trim() || null,
            });
            if (!esito.ok) { setInvio(false); toast.error(esito.messaggio || 'Pratica non aperta: riprova'); return; }
            toast.success('Pratica aperta: la trovi tra le tue pratiche');
            navigate(`/dashboard/locatore/pratiche/${esito.id || id}`);
        }, 900);
    };

    const prezzo = calcolaPrezzo(prodotto, canone);
    const titolarita = giuridica
        ? [{ valore: 'societa', etichetta: 'La società è proprietaria' }, { valore: 'gestore', etichetta: 'Gestiamo per conto del proprietario', nota: 'Serve la delega' }]
        : [{ valore: 'proprietario', etichetta: 'Sono il proprietario' }, { valore: 'comproprietario', etichetta: 'Sono comproprietario' }, { valore: 'gestore', etichetta: 'Gestisco per conto del proprietario', nota: 'Serve la delega' }];

    const Riga = ({ k, v }) => (<div className="flex justify-between gap-4 py-1.5 text-sm"><span className="text-muted-foreground">{k}</span><span className="text-foreground text-right">{v || '—'}</span></div>);
    const Blocco = ({ titolo, i, children }) => (
        <div className="rounded-xl border border-[#E5E5DE] p-4">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-[#1A2D52]">{titolo}</p>
                <button type="button" onClick={() => setPasso(i)} className="text-xs text-[#1A2D52] inline-flex items-center gap-1 hover:underline"><Pencil className="w-3 h-3" /> Modifica</button>
            </div>
            <div className="divide-y divide-[#E5E5DE]">{children}</div>
        </div>
    );

    return (
        <>
            <Helmet><title>{PASSI[passo].titolo} - CRIA</title></Helmet>
            <AccessoShell larghezza="max-w-3xl" azione={<Link to="/dashboard/locatore" className="text-sm text-[#6B6B5E] hover:text-[#1A2D52]">Esci e torna alla panoramica</Link>}>
                <div className="space-y-6">
                    <div className="flex items-end justify-between gap-4 flex-wrap">
                        <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-[#6B6B5E]">Nuovo immobile</p>
                            <h1 className="text-3xl text-[#1A2D52]" style={TITOLO_STILE}>{nomeProdotto(prodotto)}</h1>
                            <p className="text-sm text-[#6B6B5E]">{prezzoProdotto(prodotto)} · <Link to="/scegli-prodotto" className="underline underline-offset-4">cambia prodotto</Link></p>
                        </div>
                        <ol className="flex items-center gap-2">
                            {PASSI.map((s, i) => (
                                <li key={s.id} className={`flex items-center gap-1.5 text-xs ${i === passo ? 'text-[#1A2D52] font-semibold' : 'text-[#6B6B5E]'}`}>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center ${i < passo ? 'bg-green-500 text-white' : i === passo ? 'bg-[#1A2D52] text-white' : 'bg-[#E5E5DE]'}`}>
                                        {i < passo ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                                    </span>
                                    <span className="hidden md:inline">{s.titolo}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className={`${SCHEDA} space-y-6`}>
                        <h2 className="text-xl text-[#1A2D52] flex items-center gap-2" style={TITOLO_STILE}>
                            {React.createElement(PASSI[passo].icona, { className: 'w-5 h-5' })} {passo === 2 ? (esistente ? 'L’inquilino attuale' : 'Il candidato inquilino') : PASSI[passo].titolo}
                        </h2>

                        {passo === 0 && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                                    <Campo etichetta="Indirizzo" obbligatorio errore={errori.indirizzo} className="sm:col-span-4"><input className={stile(errori.indirizzo)} placeholder="Via Roma 42" {...valore('indirizzo')} /></Campo>
                                    <Campo etichetta="CAP" obbligatorio errore={errori.cap} className="sm:col-span-2"><input className={stile(errori.cap)} inputMode="numeric" maxLength={5} placeholder="20121" {...valore('cap')} /></Campo>
                                    <Campo etichetta="Città" obbligatorio errore={errori.citta} className="sm:col-span-4"><input className={stile(errori.citta)} placeholder="Milano" {...valore('citta')} /></Campo>
                                    <Campo etichetta="Provincia" obbligatorio errore={errori.provincia} className="sm:col-span-2"><input className={`${stile(errori.provincia)} uppercase`} maxLength={2} placeholder="MI" {...valore('provincia')} /></Campo>
                                    <Campo etichetta="Tipologia" className="sm:col-span-3">
                                        <select className={stile()} {...valore('tipologia')}><option value="">Scegli…</option>{TIPOLOGIE.map(t => <option key={t}>{t}</option>)}</select>
                                    </Campo>
                                    <Campo etichetta="Superficie (m²)" className="sm:col-span-3"><input className={stile()} inputMode="numeric" placeholder="60" {...valore('mq')} /></Campo>
                                    <Campo etichetta="Dati catastali" className="sm:col-span-6" nota="Foglio, particella e subalterno: li trovi sulla visura."><input className={stile()} placeholder="Foglio 348 · Particella 112 · Sub 7" {...valore('catasto')} /></Campo>
                                </div>
                                <Campo etichetta="Il tuo rapporto con l’immobile" obbligatorio errore={errori.titolarita}>
                                    <Scelta opzioni={titolarita} valore={d.titolarita} onChange={v => set('titolarita', v)} />
                                </Campo>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Carica etichetta="Visura catastale" obbligatorio file={d.visura} onChange={f => set('visura', f)} errore={errori.visura} />
                                    {d.titolarita === 'gestore' && <Carica etichetta="Delega del proprietario" obbligatorio file={d.delega} onChange={f => set('delega', f)} errore={errori.delega} />}
                                </div>
                                <Avviso><p>I documenti li controlla una persona del team CRIA. Ognuno carica i propri: quelli dell’inquilino li carica lui, dal suo link.</p></Avviso>
                            </div>
                        )}

                        {passo === 1 && (
                            <div className="space-y-5">
                                {!(prodotto in CONTRATTO_DEL_PRODOTTO) && (
                                    <Campo etichetta="Il contratto di locazione esiste già?" obbligatorio errore={errori.esistente}>
                                        <Scelta opzioni={[{ valore: 'si', etichetta: 'Sì, è già in corso' }, { valore: 'no', etichetta: 'No, è da fare' }]} valore={d.esistente} onChange={v => set('esistente', v)} />
                                    </Campo>
                                )}
                                {d.esistente && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Campo etichetta="Canone mensile (€)" obbligatorio errore={errori.canone}><input className={stile(errori.canone)} inputMode="decimal" placeholder="1000" {...valore('canone')} /></Campo>
                                            <Campo etichetta="Deposito cauzionale (€)"><input className={stile()} inputMode="decimal" placeholder="2000" {...valore('deposito')} /></Campo>
                                            <Campo etichetta={esistente ? 'Data di inizio' : 'Data di inizio prevista'} obbligatorio errore={errori.inizio}><input type="date" className={stile(errori.inizio)} {...valore('inizio')} /></Campo>
                                            <Campo etichetta="Durata" obbligatorio errore={errori.durata}>
                                                <select className={stile(errori.durata)} {...valore('durata')}><option value="">Scegli…</option>{DURATE.map(t => <option key={t}>{t}</option>)}</select>
                                            </Campo>
                                        </div>
                                        {esistente ? (
                                            <div className="space-y-4">
                                                <p className="text-sm font-medium text-[#1A2D52]">Estremi della registrazione</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <Campo etichetta="Numero" obbligatorio errore={errori.regNumero}><input className={stile(errori.regNumero)} placeholder="TNE24T003411000KF" {...valore('regNumero')} /></Campo>
                                                    <Campo etichetta="Data" obbligatorio errore={errori.regData}><input type="date" className={stile(errori.regData)} {...valore('regData')} /></Campo>
                                                    <Campo etichetta="Ufficio" obbligatorio errore={errori.regUfficio}><input className={stile(errori.regUfficio)} placeholder="DP II Milano" {...valore('regUfficio')} /></Campo>
                                                </div>
                                                <Carica etichetta="Contratto di locazione registrato" obbligatorio file={d.contrattoFile} onChange={f => set('contrattoFile', f)} errore={errori.contrattoFile} />
                                                <Avviso><p>CRIA non registra il contratto: ci servono gli estremi della registrazione che hai già fatto.{p.franchigiaMesi ? ` Su un contratto già in corso la garanzia parte dopo una franchigia di ${p.franchigiaMesi} ${p.franchigiaMesi === 1 ? 'mese' : 'mesi'}.` : ''}</p></Avviso>
                                            </div>
                                        ) : (
                                            <Avviso><p>Per i contratti nuovi usiamo il modello di contratto CRIA. La registrazione all’Agenzia delle Entrate resta a te: quando è fatta ci mandi gli estremi.</p></Avviso>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {passo === 2 && (
                            <div className="space-y-5">
                                <Avviso>
                                    <p>{esistente ? 'All’inquilino' : 'Al candidato'} mandiamo un SMS e un’email con un link personale: legge l’informativa, dà il consenso e carica lui i suoi documenti. Tu vedi quali documenti mancano, non i documenti.</p>
                                    <ul className="list-disc pl-5 text-xs space-y-0.5 pt-1">{DOCUMENTI_CANDIDATO.map(x => <li key={x.tipo}>{x.etichetta}</li>)}</ul>
                                </Avviso>
                                {!esistente && (
                                    <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 accent-[#1A2D52]" checked={d.invitaDopo} onChange={e => set('invitaDopo', e.target.checked)} />
                                        Non ho ancora scelto l’inquilino: lo invito dopo, dalla pratica
                                    </label>
                                )}
                                {!d.invitaDopo && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Campo etichetta="Nome" obbligatorio errore={errori.nome}><input className={stile(errori.nome)} {...valore('nome')} /></Campo>
                                        <Campo etichetta="Cognome" obbligatorio errore={errori.cognome}><input className={stile(errori.cognome)} {...valore('cognome')} /></Campo>
                                        <Campo etichetta="Cellulare" obbligatorio errore={errori.cellulare}><input className={stile(errori.cellulare)} inputMode="tel" placeholder="+39 333 123 4567" {...valore('cellulare')} /></Campo>
                                        <Campo etichetta="Email" obbligatorio errore={errori.email}><input type="email" className={stile(errori.email)} placeholder="nome@esempio.it" {...valore('email')} /></Campo>
                                    </div>
                                )}
                            </div>
                        )}

                        {passo === 3 && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Blocco titolo="Immobile" i={0}>
                                        <Riga k="Indirizzo" v={`${d.indirizzo}, ${d.cap} ${d.citta} (${d.provincia.toUpperCase()})`} />
                                        <Riga k="Tipologia" v={[d.tipologia, d.mq && `${d.mq} m²`].filter(Boolean).join(', ')} />
                                        <Riga k="Rapporto" v={titolarita.find(t => t.valore === d.titolarita)?.etichetta} />
                                    </Blocco>
                                    <Blocco titolo="Contratto" i={1}>
                                        <Riga k="Canone" v={`${fmtEuro(canone)}/mese`} />
                                        <Riga k={esistente ? 'Inizio' : 'Inizio previsto'} v={d.inizio && new Date(d.inizio).toLocaleDateString('it-IT')} />
                                        <Riga k="Durata" v={d.durata} />
                                        {esistente && <Riga k="Registrazione" v={d.regNumero} />}
                                    </Blocco>
                                    <Blocco titolo={esistente ? 'Inquilino attuale' : 'Candidato'} i={2}>
                                        {d.invitaDopo ? <Riga k="Invito" v="Lo mandi dopo, dalla pratica" /> : <><Riga k="Nome" v={`${d.nome} ${d.cognome}`} /><Riga k="Contatti" v={`${d.cellulare} · ${d.email}`} /></>}
                                    </Blocco>
                                    <div className="rounded-xl border border-[#E5E5DE] p-4">
                                        <p className="text-sm font-semibold text-[#1A2D52] mb-2">Il prezzo, dal listino</p>
                                        <div className="divide-y divide-[#E5E5DE]">
                                            {prezzo.voci.map(v => (
                                                <div key={v.etichetta} className="flex justify-between gap-4 py-1.5 text-sm">
                                                    <span><span className="text-foreground">{v.etichetta}</span><span className="block text-xs text-muted-foreground">{v.nota}</span></span>
                                                    <span className="text-foreground tabular-nums whitespace-nowrap">{fmtEuro(v.annuo, 2)}{v.unaVolta ? '' : '/anno'}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between gap-4 pt-2 text-sm font-semibold text-[#1A2D52]"><span>{prezzo.unaVolta ? 'Totale' : 'Totale annuo'}</span><span className="tabular-nums">{fmtEuro(prezzo.annuo, 2)}</span></div>
                                        </div>
                                    </div>
                                </div>
                                <Avviso>
                                    <p>È il prezzo del listino di oggi sul canone che hai dichiarato. Diventa definitivo dopo la verifica di CRIA e si congela quando paghi: se poi il listino cambia, il tuo contratto no.</p>
                                </Avviso>
                                <Campo etichetta="Codice referente" nota="Se ti ha seguito un commerciale CRIA. Facoltativo.">
                                    <input className={stile()} placeholder="CRIA-XX-0000" {...valore('referente')} />
                                </Campo>
                                <div className="space-y-2">
                                    <MetodiPagamento
                                        id="metodo-quota"
                                        metodi={['carta', 'sepa', 'bonifico']}
                                        valore={metodo}
                                        onScegli={(m) => { setMetodo(m); setErroreMetodo(''); }}
                                        disabled={invio}
                                        prodotto={quota}
                                        importo={PARAMETRI.quotaIscrizione}
                                        causale={causaleCliente(quota, d.indirizzo.trim())}
                                        notaBonifico="La pratica parte quando il bonifico arriva"
                                    />
                                    {erroreMetodo && <p className="text-sm text-red-600">{erroreMetodo}</p>}
                                </div>
                                <div className="rounded-xl bg-[#1A2D52] text-white p-5 flex items-center justify-between gap-4 flex-wrap">
                                    <div>
                                        <p className="text-sm text-white/70">Adesso paghi solo la quota di iscrizione</p>
                                        <p className="text-2xl" style={TITOLO_STILE}>{fmtEuro(PARAMETRI.quotaIscrizione)}</p>
                                        <p className="text-xs text-white/60">Fattura intestata a {nomeVisualizzato(persona)}</p>
                                    </div>
                                    <Button onClick={invia} disabled={invio} className="h-11 bg-white text-[#1A2D52] hover:bg-[#F5F5F0]">
                                        {invio ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Pagamento in corso…</> : 'Paga la quota e invia a CRIA'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {passo < 3 && (
                            <div className="flex items-center justify-between pt-2">
                                <Button variant="outline" onClick={() => setPasso(s => s - 1)} disabled={passo === 0} className="gap-2"><ChevronLeft className="w-4 h-4" /> Indietro</Button>
                                <Button onClick={avanti} className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]">Avanti <ChevronRight className="w-4 h-4" /></Button>
                            </div>
                        )}
                        {passo === 3 && (
                            <Button variant="outline" onClick={() => setPasso(2)} className="gap-2"><ChevronLeft className="w-4 h-4" /> Indietro</Button>
                        )}
                    </div>
                </div>
            </AccessoShell>
        </>
    );
};

const OnboardingUtente = () => {
    const [params] = useSearchParams();
    const { inVenditaAiProprietari } = useProdotti();
    const prodotto = params.get('prodotto');
    if (prodotto === 'P3') return <Navigate to="/verifica/nuova" replace />;
    if (!inVenditaAiProprietari.some(p => p.codice === prodotto)) return <Navigate to="/scegli-prodotto" replace />;
    return <OnboardingImmobile key={prodotto} prodotto={prodotto} />;
};

export default OnboardingUtente;
