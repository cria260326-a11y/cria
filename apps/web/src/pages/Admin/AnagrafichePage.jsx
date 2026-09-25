import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { GitMerge, Fingerprint, History, AlertTriangle, CheckCircle2, Hourglass, Plus, Clock, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import NotaMockup from '@/components/NotaMockup';
import AzioneSeparata from '@/components/admin/AzioneSeparata';
import SegnalaDoppione from '@/components/admin/anagrafica/SegnalaDoppione';
import { Chip, Termine, VistaRistretta } from '@/components/admin/anagrafica/ElementiScheda';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { MESSAGGI_UNICITA } from '@/lib/unicita';
import {
    useAnagrafica, livelloAnagrafica, ripristinaAnagraficaDemo, percorsoSoggetto,
    risolviDoppione, dichiaraDistinti, chiediCodice, registraCodice, controllaCodiceFiscale,
    STATO_ACCOUNT, STATO_COPPIA, VERSO, MOTIVI_DISTINTI, FONTI_CODICE, CANALI, REGOLE_DOPPIONI, TERMINI_ANAGRAFICA, PERCORSI,
} from '@/lib/anagraficheDemo';
import { trovaContratto } from '@/data/datiDemo';
import { nomeOperatore } from '@/data/operatori';
import { fmtData } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// REVISIONE ANAGRAFICHE — O-04
// Il sistema segnala, una persona decide. In coda: le coppie di anagrafiche
// che potrebbero essere la stessa persona — stesso nome, stesso indirizzo,
// stesso paese: email, cellulare e codice fiscale non si ripetono mai — e i
// codici fiscali provvisori.
// Due anagrafiche della stessa persona non si uniscono: si sente il cliente,
// si crea l'utente giusto da «Soggetti e utenti» (lo prepara un operatore, lo
// conferma un responsabile diverso), poi qui si segna la coppia come risolta.
// Ogni decisione resta scritta, con chi e quando.
// ═════════════════════════════════════════════════════════════════════════════

// Solo nei mockup: il codice che c'è sul documento di prova.
const CODICI_DI_PROVA = { 'sog-chiara-lombardi': 'LMBCHR94B57Z133E' };

const selectClasse = 'w-full text-sm border border-border rounded-lg px-3 py-2 bg-background';
const normale =(v) => String(v || '').trim().toLowerCase().replace(/\s+/g, ' ');
const soloCifre = (v) => String(v || '').replace(/^00/, '+').replace(/[^\d+]/g, '');

const indirizzoBreve = (i) => (i ? `${i.via}, ${[i.cap, i.citta].filter(Boolean).join(' ')}` : null);

const RIGHE_CONFRONTO = [
    { etichetta: 'Nome', valore: s => s.nomeCompleto, norma: normale },
    { etichetta: 'Indirizzo', valore: s => indirizzoBreve(s.indirizzo), norma: normale },
    { etichetta: 'Paese', valore: s => s.indirizzo?.paese || null, norma: normale },
    { etichetta: 'Codice fiscale', valore: s => s.codiceFiscale, norma: normale, mono: true },
    { etichetta: 'Nascita', valore: s => s.dataNascita && `${fmtData(s.dataNascita)}${s.luogoNascita ? `, ${s.luogoNascita}` : ''}`, norma: normale },
    { etichetta: 'Email', valore: s => s.email, norma: normale },
    { etichetta: 'Telefono', valore: s => s.telefono, norma: soloCifre },
    { etichetta: 'Tipo', valore: s => (s.tipo === 'giuridica' ? 'Persona giuridica' : 'Persona fisica') },
    { etichetta: 'Account', valore: s => STATO_ACCOUNT[s.account.stato].breve },
    {
        etichetta: 'Posizioni',
        valore: s => (s.posizioni.length
            ? s.posizioni.map(p => `${VERSO[p.verso].etichetta} · ${trovaContratto(p.contrattoId).immobile.indirizzo}`).join('; ')
            : 'Nessuna'),
    },
    { etichetta: 'Da dove viene', valore: s => `${s.origineBreve}, ${fmtData(s.creatoIl)}` },
];

// Uguale in verde, diverso in giallo: si guarda a colpo d'occhio cosa torna.
const Confronto = ({ a, b }) => (
    <div className="rounded-lg border border-border overflow-hidden text-xs">
        <div className="grid grid-cols-[5.5rem_1fr_1fr] sm:grid-cols-[8rem_1fr_1fr] bg-muted/40 font-semibold text-muted-foreground">
            <div className="px-2.5 py-2" />
            {[a, b].map((s, i) => (
                <div key={s.id} className="px-2.5 py-2 min-w-0">
                    <Link to={percorsoSoggetto(s.id)} className="text-foreground hover:underline">{i === 0 ? 'La più vecchia' : 'La più recente'}</Link>
                </div>
            ))}
        </div>
        {RIGHE_CONFRONTO.map(r => {
            const va = r.valore(a);
            const vb = r.valore(b);
            const esito = !r.norma || !va || !vb ? null : r.norma(va) === r.norma(vb) ? 'uguale' : 'diverso';
            const classe = esito === 'uguale' ? 'bg-green-50 text-green-900' : esito === 'diverso' ? 'bg-amber-50 text-amber-900' : 'text-foreground';
            return (
                <div key={r.etichetta} className="grid grid-cols-[5.5rem_1fr_1fr] sm:grid-cols-[8rem_1fr_1fr] border-t border-border">
                    <div className="px-2.5 py-2 text-muted-foreground">{r.etichetta}</div>
                    {[va, vb].map((v, i) => (
                        <div key={i} className={`px-2.5 py-2 min-w-0 break-words ${classe} ${r.mono ? 'font-mono' : ''}`}>{v || '—'}</div>
                    ))}
                </div>
            );
        })}
    </div>
);

// ─── Le decisioni su una coppia ───────────────────────────────────────────────
const FormDistinti = ({ c, onFatto }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [motivo, setMotivo] = useState('');
    const [nota, setNota] = useState('');
    const valido = motivo && (motivo !== 'altro' || nota.trim().length >= 5);

    const invia = () => {
        dichiaraDistinti(c.id, { motivo, nota: nota.trim() || null }, operatoreId);
        toast.success('Coppia chiusa: sono soggetti diversi');
        onFatto();
    };

    return (
        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor={`motivo-${c.id}`}>Perché sono soggetti diversi</Label>
                <select id={`motivo-${c.id}`} value={motivo} onChange={e => setMotivo(e.target.value)} className={selectClasse}>
                    <option value="">Scegli…</option>
                    {Object.entries(MOTIVI_DISTINTI).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor={`nota-distinti-${c.id}`}>{motivo === 'altro' ? 'Scrivi il motivo' : 'Nota, se serve'}</Label>
                <Textarea id={`nota-distinti-${c.id}`} rows={2} value={nota} onChange={e => setNota(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">La coppia esce dalla coda e non ci torna per le stesse ragioni.</p>
            <div className="flex flex-wrap items-start gap-2">
                <AzioneSeparata azione="separa_anagrafiche" onEsegui={invia} disabled={!valido}>Chiudi: soggetti diversi</AzioneSeparata>
                <Button type="button" variant="ghost" size="sm" onClick={onFatto}>Annulla</Button>
            </div>
        </div>
    );
};

// Dopo i passaggi fatti a mano — il contatto col cliente, l'utente creato da
// «Soggetti e utenti» — la coppia si segna risolta, con quello che si è fatto.
const FormRisolto = ({ c, modello, onFatto }) => {
    const { operatoreId } = useOperatoreAttivo();
    const creati = modello.preparazioni
        .filter(p => p.stato === 'confermata')
        .map(p => modello.trova(p.soggettoId))
        .filter(Boolean);
    const [utenteId, setUtenteId] = useState(c.preparazioni.find(p => p.stato === 'confermata')?.soggettoId || '');
    const [nota, setNota] = useState('');

    const invia = () => {
        risolviDoppione(c.id, { nota: nota.trim(), utenteId }, operatoreId);
        toast.success('Coppia segnata come risolta');
        onFatto();
    };

    return (
        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor={`risolto-nota-${c.id}`}>Cosa hai fatto</Label>
                <Textarea
                    id={`risolto-nota-${c.id}`}
                    rows={3}
                    value={nota}
                    onChange={e => setNota(e.target.value)}
                    placeholder="Per esempio: sentito al telefono, è la stessa persona; creato l’utente nuovo con l’email che userà, le due anagrafiche sono archiviate."
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor={`risolto-utente-${c.id}`}>Utente creato da collegare, se c’è</Label>
                <select id={`risolto-utente-${c.id}`} value={utenteId} onChange={e => setUtenteId(e.target.value)} className={selectClasse}>
                    <option value="">Nessuno</option>
                    {creati.map(u => <option key={u.id} value={u.id}>{u.nomeCompleto} · {u.email} · creato il {fmtData(u.creatoIl)}</option>)}
                </select>
            </div>
            <p className="text-xs text-muted-foreground">La coppia esce dalla coda e va fra le decisioni prese, con chi e quando.</p>
            <div className="flex flex-wrap items-start gap-2">
                <AzioneSeparata azione="risolvi_doppione" onEsegui={invia} disabled={nota.trim().length < 10}>Segna come risolto</AzioneSeparata>
                <Button type="button" variant="ghost" size="sm" onClick={onFatto}>Annulla</Button>
            </div>
        </div>
    );
};

const SchedaCoppia = ({ c, modello }) => {
    const [modo, setModo] = useState(null);
    const a = modello.trova(c.a);
    const b = modello.trova(c.b);
    const stato = STATO_COPPIA[c.stato];
    const inAttesa = c.preparazioni.find(p => p.stato === 'da_confermare');
    const creata = c.preparazioni.find(p => p.stato === 'confermata');
    const utente = creata && modello.trova(creata.soggettoId);

    return (
        <Card>
            <CardContent className="pt-5 pb-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                        <p className="font-semibold text-foreground">{a.nomeCompleto} · {b.nomeCompleto}</p>
                        <div className="flex flex-wrap gap-1.5">
                            {c.regole.map(r => <Chip key={r} classe="bg-muted text-foreground">{REGOLE_DOPPIONI[r]}</Chip>)}
                            {c.manuale && <Chip classe="bg-muted text-foreground">{REGOLE_DOPPIONI.manuale}</Chip>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {c.manuale
                                ? `Segnalata da ${nomeOperatore(c.manuale.da)} il ${fmtData(c.manuale.il)}: ${c.manuale.motivo}`
                                : `Rilevata il ${fmtData(c.rilevataIl)}, all’arrivo della seconda anagrafica`}
                        </p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1">
                        <Chip classe={stato.classe}>{stato.etichetta}</Chip>
                        <Termine termine={c.termine} etichetta="Da chiudere entro il" />
                    </div>
                </div>

                <Confronto a={a} b={b} />

                {c.preparazioni.filter(p => p.stato === 'respinta').map(p => (
                    <p key={p.id} className="text-xs text-muted-foreground">
                        Utente preparato da {nomeOperatore(p.preparatoDa)} il {fmtData(p.preparatoIl)}, respinto da {nomeOperatore(p.esito.da)} il {fmtData(p.esito.il)}: {p.esito.motivo}
                    </p>
                ))}
                {inAttesa && (
                    <p className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-sm text-blue-950">
                        Utente in preparazione per questa coppia: preparato da {nomeOperatore(inAttesa.preparatoDa)} il {fmtData(inAttesa.preparatoIl)}, aspetta la conferma in{' '}
                        <Link to={PERCORSI.soggetti} className="underline">Soggetti e utenti</Link>. Dopo, la coppia si segna risolta.
                    </p>
                )}
                {utente && (
                    <p className="rounded-lg border border-green-200 bg-green-50/60 p-3 text-sm text-green-950">
                        Utente creato: <Link to={percorsoSoggetto(utente.id)} className="underline">{utente.nomeCompleto}</Link>, confermato da {nomeOperatore(creata.esito.da)} il {fmtData(creata.esito.il)}.
                        {' '}Le due anagrafiche sono archiviate e rimandano a lui: ora segna la coppia come risolta.
                    </p>
                )}

                {c.stato === 'da_rivedere' && !modo && !inAttesa && (
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-start gap-3">
                            <AzioneSeparata azione="risolvi_doppione" onEsegui={() => setModo('risolto')}>
                                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Risolto
                            </AzioneSeparata>
                            {!creata && <AzioneSeparata azione="separa_anagrafiche" variant="outline" onEsegui={() => setModo('distinti')}>Sono soggetti diversi</AzioneSeparata>}
                        </div>
                        {!creata && (
                            <Link to={`${PERCORSI.soggetti}/nuovo?coppia=${encodeURIComponent(c.id)}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                                <UserPlus className="w-3.5 h-3.5" /> Crea l’utente con i dati di queste due anagrafiche
                            </Link>
                        )}
                    </div>
                )}
                {c.stato === 'da_rivedere' && modo === 'risolto' && <FormRisolto c={c} modello={modello} onFatto={() => setModo(null)} />}
                {c.stato === 'da_rivedere' && modo === 'distinti' && <FormDistinti c={c} onFatto={() => setModo(null)} />}
            </CardContent>
        </Card>
    );
};

// ─── Codici fiscali provvisori ────────────────────────────────────────────────
const FormCodice = ({ s, onFatto }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [testo, setTesto] = useState('');
    const [fonte, setFonte] = useState('');
    const [ricontrollato, setRicontrollato] = useState(false);
    const modello = useAnagrafica();
    const esitoForma = testo.replace(/\s+/g, '').length >= 16 ? controllaCodiceFiscale(testo, s) : null;
    // Un codice fiscale c'è una volta sola: se è già di un'altra anagrafica, non si registra.
    const giaDi = esitoForma?.valido ? modello.attivi.find(x => x.id !== s.id && x.codiceFiscale?.toUpperCase() === esitoForma.codice) : null;
    const esito = giaDi ? { valido: false, errore: `${MESSAGGI_UNICITA.codiceFiscale} È di ${giaDi.nomeCompleto}: se è la stessa persona, segnala il doppione.`, avvisi: [] } : esitoForma;
    const puoSalvare = esito?.valido && fonte && (esito.avvisi.length === 0 || ricontrollato);
    const prova = CODICI_DI_PROVA[s.id];

    const salva = () => {
        registraCodice(s.id, { codice: esito.codice, fonte }, operatoreId);
        toast.success('Codice definitivo registrato: il provvisorio resta collegato alla persona');
        onFatto();
    };

    return (
        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor={`cf-${s.id}`}>Codice fiscale definitivo</Label>
                    <Input id={`cf-${s.id}`} value={testo} onChange={e => setTesto(e.target.value.toUpperCase())} maxLength={20} className="font-mono uppercase" autoComplete="off" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor={`fonte-${s.id}`}>Da dove lo leggi</Label>
                    <select id={`fonte-${s.id}`} value={fonte} onChange={e => setFonte(e.target.value)} className={selectClasse}>
                        <option value="">Scegli…</option>
                        {Object.entries(FONTI_CODICE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                </div>
            </div>
            {esito && !esito.valido && <p className="text-xs text-red-700">{esito.errore}</p>}
            {esito?.valido && esito.avvisi.length === 0 && (
                <p className="text-xs text-green-800 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Forma, carattere di controllo, nome e data di nascita tornano.</p>
            )}
            {esito?.valido && esito.avvisi.length > 0 && (
                <div className="space-y-2">
                    {esito.avvisi.map(a => <p key={a} className="text-xs text-amber-800 flex items-start gap-1.5"><AlertTriangle className="w-4 h-4 flex-shrink-0" /> {a}</p>)}
                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={ricontrollato} onChange={e => setRicontrollato(e.target.checked)} className="mt-1 accent-primary" />
                        Ho ricontrollato sul documento: il codice è questo.
                    </label>
                </div>
            )}
            <div className="flex flex-wrap items-start gap-2">
                <AzioneSeparata azione="registra_codice" onEsegui={salva} disabled={!puoSalvare}>Registra il codice definitivo</AzioneSeparata>
                <Button type="button" variant="ghost" size="sm" onClick={onFatto}>Annulla</Button>
            </div>
            {prova && (
                <NotaMockup className="py-3">
                    <p>Sul documento di prova c’è <span className="font-mono">{prova}</span>.</p>
                    <button type="button" className="underline font-medium mt-1" onClick={() => { setTesto(prova); setFonte('tessera_sanitaria'); }}>Compila con il documento di prova</button>
                </NotaMockup>
            )}
        </div>
    );
};

const SchedaProvvisorio = ({ p }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [aperto, setAperto] = useState(false);
    const s = p.soggetto;
    const canale = s.account.stato === 'attivo' ? 'area' : s.email ? 'email' : 'sms';
    // Una richiesta ancora nel termine non si ripete: si aspetta la risposta.
    const inAttesa = p.termine && !p.termine.scaduto;

    const chiedi = () => {
        chiediCodice(s.id, canale, operatoreId);
        toast.success(`${p.ultima ? 'Sollecito mandato' : 'Richiesta mandata'} a ${s.nomeCompleto}, ${CANALI[canale]}`);
    };

    return (
        <Card>
            <CardContent className="pt-5 pb-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link to={percorsoSoggetto(s.id)} className="font-semibold text-foreground hover:underline">{s.nomeCompleto}</Link>
                        <p className="text-xs text-muted-foreground">
                            {[
                                s.dataNascita && `Nascita: ${fmtData(s.dataNascita)}${s.luogoNascita ? `, ${s.luogoNascita}` : ''}`,
                                ...s.posizioni.map(pos => `${VERSO[pos.verso].etichetta} · ${trovaContratto(pos.contrattoId).immobile.indirizzo}`),
                                STATO_ACCOUNT[s.account.stato].etichetta,
                            ].filter(Boolean).join(' · ')}
                        </p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-1">
                        <span className="font-mono text-sm text-foreground">{p.codice}</span>
                        <Termine termine={p.termine} etichetta="Risposta entro il" />
                    </div>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                    <li>In anagrafica dal {fmtData(s.creatoIl)} · {s.origineTesto}.</li>
                    {p.richieste.map((r, i) => (
                        <li key={r.id || i}>Codice definitivo chiesto il {fmtData(r.il)} {CANALI[r.canale]} da {nomeOperatore(r.da)}.</li>
                    ))}
                    {!p.ultima && <li>Il codice definitivo non è ancora stato chiesto.</li>}
                </ul>
                {!aperto && (
                    <div className="flex flex-wrap items-start gap-3">
                        {!inAttesa && (
                            <AzioneSeparata azione="chiedi_codice" variant="outline" onEsegui={chiedi}>
                                {p.ultima ? 'Sollecita' : 'Chiedi il codice definitivo'}
                            </AzioneSeparata>
                        )}
                        <AzioneSeparata azione="registra_codice" onEsegui={() => setAperto(true)}>Registra il codice definitivo</AzioneSeparata>
                    </div>
                )}
                {aperto && <FormCodice s={s} onFatto={() => setAperto(false)} />}
            </CardContent>
        </Card>
    );
};

// ─── Decisioni prese ──────────────────────────────────────────────────────────
const Decisione = ({ d, modello }) => {
    // Ogni nome porta alla sua scheda: quella di un'anagrafica unita dice dove è finita.
    const collega = (id) => (
        <Link to={percorsoSoggetto(id)} className="underline decoration-muted-foreground/40 hover:decoration-foreground">{modello.trova(id)?.nomeCompleto || '—'}</Link>
    );
    // Due anagrafiche della stessa persona hanno lo stesso nome: le distingue l'origine.
    const conOrigine = (id) => <>{collega(id)} <span className="text-muted-foreground">({modello.trova(id)?.origineBreve})</span></>;
    if (d.tipo === 'codice') {
        return (
            <li className="p-3 text-sm space-y-0.5">
                <p className="text-foreground">Codice definitivo per {collega(d.r.soggetto.id)}: <span className="font-mono text-xs">{d.r.provvisorio}</span> → <span className="font-mono text-xs">{d.r.soggetto.codiceFiscale}</span></p>
                <p className="text-xs text-muted-foreground">Registrato da {nomeOperatore(d.r.da)} il {fmtData(d.r.il)} · {FONTI_CODICE[d.r.fonte]}</p>
            </li>
        );
    }
    const { coppia: c } = d;
    if (c.esito.tipo === 'risolta') {
        const utente = c.esito.utenteId && modello.trova(c.esito.utenteId);
        return (
            <li className="p-3 text-sm space-y-0.5">
                <p className="text-foreground">Risolto: {conOrigine(c.a)} e {conOrigine(c.b)}</p>
                <p className="text-xs text-muted-foreground">{c.esito.nota}</p>
                {utente && <p className="text-xs text-muted-foreground">Utente collegato: {collega(utente.id)}</p>}
                <p className="text-xs text-muted-foreground">Segnato da {nomeOperatore(c.esito.da)} il {fmtData(c.esito.il)}</p>
            </li>
        );
    }
    return (
        <li className="p-3 text-sm space-y-0.5">
            <p className="text-foreground">Soggetti diversi: {collega(c.a)} e {collega(c.b)} · {MOTIVI_DISTINTI[c.esito.motivo]}{c.esito.nota ? ` · ${c.esito.nota}` : ''}</p>
            <p className="text-xs text-muted-foreground">Deciso da {nomeOperatore(c.esito.da)} il {fmtData(c.esito.il)}</p>
        </li>
    );
};

// ─── Pagina ───────────────────────────────────────────────────────────────────
const AnagrafichePage = () => {
    const { operatore } = useOperatoreAttivo();
    const livello = livelloAnagrafica(operatore.funzione);
    const modello = useAnagrafica();
    const [segnala, setSegnala] = useState(false);

    const aperte = modello.coppie.filter(c => !c.esito);
    const oltre = aperte.filter(c => c.termine.scaduto).length + modello.provvisori.filter(p => p.termine?.scaduto).length;
    const decisioni = [
        ...modello.coppie.filter(c => c.esito).map(c => ({ il: c.esito.il, tipo: c.esito.tipo, chiave: c.id, coppia: c })),
        ...modello.codiciRegolarizzati.map(r => ({ il: r.il, tipo: 'codice', chiave: `cf-${r.soggetto.id}`, r })),
    ].sort((x, y) => y.il.localeCompare(x.il));

    const intestazione = (
        <IntestazionePagina
            titolo="Revisione anagrafiche"
            sottotitolo="Possibili doppioni e codici fiscali provvisori. Il sistema segnala, una persona decide: niente si unisce e niente cambia da solo."
        />
    );
    const contatori = (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <Contatore etichetta="Doppioni da esaminare" valore={aperte.filter(c => c.stato === 'da_rivedere').length} icona={GitMerge} colore="bg-amber-500" />
            <Contatore etichetta="Utenti da confermare" nota="in Soggetti e utenti" valore={modello.preparazioni.filter(p => p.stato === 'da_confermare').length} icona={Hourglass} colore="bg-blue-500" />
            <Contatore etichetta="Codici provvisori" valore={modello.provvisori.length} icona={Fingerprint} colore="bg-slate-500" />
            <Contatore etichetta="Oltre il termine" valore={oltre} icona={Clock} colore="bg-red-500" />
        </div>
    );

    if (livello !== 'L') {
        return (
            <>
                <Helmet><title>Revisione anagrafiche - CRIA</title></Helmet>
                <div className="space-y-6">
                    {intestazione}
                    {livello === 'agg' && contatori}
                    <VistaRistretta livello={livello} />
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet><title>Revisione anagrafiche - CRIA</title></Helmet>
            <div className="space-y-6">
                {intestazione}
                {contatori}

                <section className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 max-w-3xl">
                            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><GitMerge className="w-5 h-5" /> Possibili doppioni</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Il sistema accosta due anagrafiche con lo stesso nome, lo stesso indirizzo e lo stesso paese: email, cellulare e codice fiscale non si ripetono mai, la registrazione li rifiuta.
                                Niente si unisce: si sente il cliente e, se è la stessa persona, si crea l’utente giusto da Soggetti e utenti, con due firme; poi qui si segna la coppia come risolta.
                                Da chiudere entro {TERMINI_ANAGRAFICA.lavoroInterno.giorni} giorni lavorativi.
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => setSegnala(v => !v)} aria-expanded={segnala}>
                            <Plus className="w-4 h-4" /> Segnala un doppione
                        </Button>
                    </div>
                    {segnala && <SegnalaDoppione modello={modello} onFatto={() => setSegnala(false)} />}
                    {aperte.length === 0
                        ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Nessun possibile doppione da esaminare.</CardContent></Card>
                        : aperte.map(c => <SchedaCoppia key={c.id} c={c} modello={modello} />)}
                </section>

                <section className="space-y-4">
                    <div className="max-w-3xl">
                        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Fingerprint className="w-5 h-5" /> Codici fiscali provvisori</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Undici cifre su una persona fisica sono il codice provvisorio, in attesa di quello definitivo; su una società sono il codice fiscale normale.
                            Il provvisorio non si butta: resta collegato alla persona. La risposta si aspetta {TERMINI_ANAGRAFICA.rispostaCliente.giorni} giorni.
                        </p>
                    </div>
                    {modello.provvisori.length === 0
                        ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Nessun codice fiscale provvisorio.</CardContent></Card>
                        : modello.provvisori.map(p => <SchedaProvvisorio key={p.soggetto.id} p={p} />)}
                </section>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base"><History className="w-5 h-5" /> Decisioni prese</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {decisioni.length === 0
                            ? <p className="text-sm text-muted-foreground">Ancora nessuna decisione.</p>
                            : <ul className="divide-y divide-border rounded-lg border border-border">{decisioni.map(d => <Decisione key={d.chiave} d={d} modello={modello} />)}</ul>}
                    </CardContent>
                </Card>

                <NotaMockup>
                    <p>Per provare su Davide Colombo: «Crea l’utente con i dati di queste due anagrafiche», preparalo operando come Valeria Monti, confermalo come Silvia Barbieri in Soggetti e utenti, poi torna qui e segna la coppia come risolta.</p>
                    <p className="mt-1">Utenti creati, decisioni e codici restano in questo browser.</p>
                    <button type="button" className="underline font-medium mt-2" onClick={() => { ripristinaAnagraficaDemo(); toast.success('Anagrafica demo ripristinata'); }}>
                        Ripristina l’anagrafica demo
                    </button>
                </NotaMockup>
            </div>
        </>
    );
};

export default AnagrafichePage;
