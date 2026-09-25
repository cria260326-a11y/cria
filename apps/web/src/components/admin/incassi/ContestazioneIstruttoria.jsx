import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { FileText, Landmark, Send, NotebookPen, Scale, TrafficCone, History, Gavel, Info, ShieldAlert } from 'lucide-react';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import { Messaggio, MessaggioDiSistema } from '@/components/aree/Messaggio';
import NotaMockup from '@/components/NotaMockup';
import AzioneSeparata from '@/components/admin/AzioneSeparata';
import { OGGI } from '@/data/datiDemo';
import { nomeProdotto, PRODOTTI } from '@/data/catalogo';
import { nomeOperatore } from '@/data/operatori';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { verificaAzione } from '@/lib/separazione';
import {
    prendiInCarico, chiediDocumenti, scriviAlleParti, aggiungiNota, respingiContestazione,
    proponiRettifica, confermaRettifica, negaRettifica, simulaDocumentiArrivati,
} from '@/lib/incassiDemo';
import { decidiContestazione as decidiContestazioneDb, confermaRettifica as confermaRettificaDb } from '@/lib/cicloFonte';
import { etichettaStatoContestazione, classeStatoContestazione } from '@/lib/etichette';
import { SEMAFORO, analizzaMesi } from '@/lib/semaforo';
import { fmtData, fmtQuando, nomeMese } from '@/lib/formato';
import { Pill, Voce, Termine, PulsanteFunzione } from '@/components/admin/istruttoria/Elementi';

// ═════════════════════════════════════════════════════════════════════════════
// L'istruttoria di una contestazione (O-10). Decide CRIA entro i giorni del
// parametro. Respingere lascia il dato com'è; accogliere vuol dire rettificare
// il semaforo, e la rettifica esiste solo così: con un documento della banca e
// due firme di persone diverse, nessuna delle quali ha generato il dato (§13.4).
// ═════════════════════════════════════════════════════════════════════════════

const MIN_MOTIVO = 20;
// Le parti con l'articolo giusto: «al proprietario», «all’inquilino».
const AL = { locatore: 'al proprietario', conduttore: 'all’inquilino' };
const DAL = { locatore: 'Dal proprietario', conduttore: 'Dall’inquilino', cria: 'Da CRIA' };
const DEL = { locatore: 'del proprietario', conduttore: 'dell’inquilino' };
const IL = { locatore: 'il proprietario', conduttore: 'l’inquilino' };

const Semaforino = ({ analisi }) => {
    const s = SEMAFORO[analisi.semaforo];
    return (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.colore }} /> {s.etichetta}
            {analisi.media != null && <span className="text-xs font-normal text-muted-foreground">· giorno medio {String(analisi.media).replace('.', ',')}</span>}
        </span>
    );
};

// Cosa cambia nel semaforo del contratto, prima di decidere.
const EffettoSemaforo = ({ k, contratto, dataProposta }) => {
    const conMese = (cambia) => analizzaMesi(contratto.mesi.map(m => (m.mese === k.mese ? { ...m, ...cambia } : m)));
    const adesso = analizzaMesi(contratto.mesi);
    const data = dataProposta || k.rettifica?.data;
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><TrafficCone className="w-5 h-5" /> Semaforo del contratto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
                {k.chiusa ? (
                    <Voce etichetta="Dopo la decisione"><Semaforino analisi={adesso} /></Voce>
                ) : (
                    <>
                        <Voce etichetta="Adesso: il mese è in verifica e non conta"><Semaforino analisi={adesso} /></Voce>
                        <Voce etichetta="Se si respinge: il mese resta non pagato"><Semaforino analisi={conMese({ stato: 'insoluto' })} /></Voce>
                        <Voce etichetta={data ? `Se si rettifica: pagato il ${Number(data.slice(8))}` : 'Se si rettifica'}>
                            {data ? <Semaforino analisi={conMese({ stato: 'pagato', giorno: Number(data.slice(8)), pagatoIl: data })} /> : <span className="text-sm text-muted-foreground">Dipende dal giorno in cui il canone è arrivato</span>}
                        </Voce>
                    </>
                )}
                <p className="text-xs text-muted-foreground">Nessuno cambia un semaforo a mano: cambia solo così.</p>
            </CardContent>
        </Card>
    );
};

const Prove = ({ k }) => (
    <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><FileText className="w-5 h-5" /> Prove ({k.documenti.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
            {k.documenti.map(d => (
                <div key={d.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30">
                    {d.bancario ? <Landmark className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" /> : <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground break-words">{d.nome}</p>
                        <p className="text-xs text-muted-foreground">{DAL[d.caricatoDa]} · {fmtData(d.il)} · {d.bancario ? 'documento della banca' : 'non è un documento della banca'}</p>
                    </div>
                </div>
            ))}
            <p className="text-xs text-muted-foreground">Una rettifica regge solo su un documento della banca: uno screenshot non basta.</p>
        </CardContent>
    </Card>
);

const Decisione = ({ k }) => {
    const r = k.rettifica;
    const d = k.decisione;
    const doc = (id) => k.documenti.find(x => x.id === id)?.nome || '—';
    return (
        <div className="space-y-3 text-sm">
            <p className="text-foreground">{k.esito}</p>
            {r?.secondaFirma ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg border border-border p-3">
                    <Voce etichetta="Prima firma · assistenza">{nomeOperatore(r.primaFirma.da)}, {fmtData(r.primaFirma.il)}</Voce>
                    <Voce etichetta="Seconda firma · responsabile">{nomeOperatore(r.secondaFirma.da)}, {fmtData(r.secondaFirma.il)}</Voce>
                    <Voce etichetta="Documento della banca">{doc(r.documento)}</Voce>
                    <Voce etichetta="Canone arrivato il">{fmtData(r.data)}</Voce>
                    <p className="sm:col-span-2 text-xs text-muted-foreground">«{r.motivazione}»</p>
                </div>
            ) : d ? (
                <div className="rounded-lg border border-border p-3 space-y-1">
                    <p className="text-foreground">Respinta da {nomeOperatore(d.da)} il {fmtData(d.il)}.</p>
                    <p className="text-xs text-muted-foreground">«{d.motivazione}»{d.documento ? ` · documento: ${doc(d.documento)}` : ''}</p>
                </div>
            ) : null}
            {k.morosita && (
                <p className="flex flex-wrap items-center gap-x-2 text-sm rounded-lg bg-muted/30 p-3">
                    <ShieldAlert className="w-4 h-4 text-red-700 flex-shrink-0" />
                    {k.morosita.aperta
                        ? <>Il canone resta non pagato: è partita la pratica di morosità del mese. <Link className="underline underline-offset-2 font-medium" to={`/dashboard/admin/morosita/${k.morosita.praticaId}`}>Apri la pratica</Link></>
                        : <>Pratica di morosità: {k.morosita.motivo} <Link className="underline underline-offset-2 font-medium" to="/dashboard/admin/morosita">Pratiche di morosità</Link></>}
                </p>
            )}
        </div>
    );
};

const SecondaFirma = ({ k }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [nega, setNega] = useState(false);
    const [motivo, setMotivo] = useState('');
    const r = k.rettifica;
    const record = { primaFirmaDa: r.primaFirma.da, generatoDa: k.generatoDa.operatoreId };
    const { consentito } = verificaAzione('seconda_firma_rettifica', { operatoreId, record });
    const doc = k.documenti.find(x => x.id === r.documento);
    return (
        <div className="rounded-lg border border-amber-300 bg-amber-50/60 p-3 space-y-3">
            <p className="text-sm font-medium text-amber-950">Rettifica proposta: manca la seconda firma</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Voce etichetta="Prima firma">{nomeOperatore(r.primaFirma.da)}, {fmtData(r.primaFirma.il)}</Voce>
                <Voce etichetta="Seconda firma"><Termine termine={{ data: k.secondaFirmaEntro, calendario: 'lavorativi' }} /></Voce>
                <Voce etichetta="Documento della banca">{doc?.nome || '—'}</Voce>
                <Voce etichetta="Canone arrivato il">{fmtData(r.data)} · il mese conta come pagato il {Number(r.data.slice(8))}</Voce>
            </div>
            <p className="text-xs text-amber-950">«{r.motivazione}»</p>
            <div className="flex flex-wrap items-start gap-3">
                <AzioneSeparata azione="seconda_firma_rettifica" record={record} onEsegui={async () => {
                    if (k.dalDatabase) {
                        const esito = await confermaRettificaDb(k.id, k.rettifica?.data);
                        if (!esito.ok) { toast.error(esito.messaggio); return; }
                    } else {
                        confermaRettifica(k, operatoreId);
                    }
                    toast.success('Rettifica firmata due volte: il mese è corretto e le parti lo vedono');
                }}>
                    Confermo la rettifica · seconda firma
                </AzioneSeparata>
                {consentito && <Button size="sm" variant="outline" className="bg-white" onClick={() => setNega(v => !v)}>Non confermo</Button>}
            </div>
            {nega && (
                <div className="space-y-2">
                    <Textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={2} className="bg-white text-sm" placeholder="Perché non confermi: torna a chi l’ha proposta" />
                    <Button size="sm" variant="destructive" disabled={motivo.trim().length < MIN_MOTIVO} onClick={() => { negaRettifica(k, motivo, operatoreId); toast.success('Rettifica non confermata: la contestazione torna in verifica'); }}>
                        Non confermo la rettifica
                    </Button>
                    <p className="text-xs text-muted-foreground">Almeno {MIN_MOTIVO} caratteri. La proposta resta nella traccia.</p>
                </div>
            )}
        </div>
    );
};

// onData: la data scelta per la rettifica, per l'anteprima del semaforo.
const Azioni = ({ k, onData }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [azione, setAzione] = useState(null);
    const [aChi, setAChi] = useState('locatore');
    const [testo, setTesto] = useState(`I movimenti del conto di ${nomeMese(k.mese).toLowerCase()}, con la data di accredito.`);
    const [motivazione, setMotivazione] = useState('');
    const bancari = k.documenti.filter(d => d.bancario);
    const [documento, setDocumento] = useState(bancari[0]?.id || '');
    const [data, setData] = useState('');
    const primoDelMese = `${k.mese}-01`;
    const recordPrima = { generatoDa: k.generatoDa.operatoreId };
    const chiudi = () => { setAzione(null); setMotivazione(''); onData(''); };
    const scegliData = (v) => { setData(v); onData(v); };

    const scelta = (id, etichetta) => (
        <Button type="button" size="sm" variant={azione === id ? 'default' : 'outline'} onClick={() => { setAzione(a => (a === id ? null : id)); onData(id === 'rettifica' && azione !== 'rettifica' ? data : ''); }}>{etichetta}</Button>
    );

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {scelta('documenti', 'Chiedi documenti')}
                {scelta('respingi', 'Respingi')}
                {scelta('rettifica', 'Proponi la rettifica')}
            </div>

            {azione === 'documenti' && (
                <div className="rounded-lg border border-border p-3 space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {['locatore', 'conduttore'].map(p => (
                            <label key={p} className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm cursor-pointer ${aChi === p ? 'border-primary' : 'border-border'}`}>
                                <input type="radio" name="a-chi" checked={aChi === p} onChange={() => setAChi(p)} /> {AL[p].charAt(0).toUpperCase() + AL[p].slice(1)}
                            </label>
                        ))}
                    </div>
                    <Textarea value={testo} onChange={e => setTesto(e.target.value)} rows={2} className="text-sm" />
                    <PulsanteFunzione funzioni={['assistenza']} azione="Istruire una contestazione" disabled={!testo.trim()} onEsegui={() => { chiediDocumenti(k, { a: aChi, testo }, operatoreId); chiudi(); toast.success(`Richiesta mandata ${AL[aChi]}: lo vedono tutte e due le parti`); }}>
                        Manda la richiesta
                    </PulsanteFunzione>
                </div>
            )}

            {azione === 'respingi' && (
                <div className="rounded-lg border border-border p-3 space-y-2">
                    <p className="text-sm text-foreground">
                        La segnalazione resta: il mese conta come non pagato.{' '}
                        {PRODOTTI[k.contratto.prodotto]?.garanzia
                            ? 'Parte la pratica di morosità del mese, con la copertura che il mese aveva.'
                            : `Con ${nomeProdotto(k.contratto.prodotto)} non c’è recupero: conta solo per il semaforo.`}
                    </p>
                    <Textarea value={motivazione} onChange={e => setMotivazione(e.target.value)} rows={3} className="text-sm" placeholder="Perché la contestazione non regge: lo leggono le parti" />
                    <p className="text-xs text-muted-foreground">Almeno {MIN_MOTIVO} caratteri ({motivazione.trim().length}).</p>
                    <PulsanteFunzione funzioni={['assistenza']} azione="Decidere una contestazione" disabled={motivazione.trim().length < MIN_MOTIVO} onEsegui={async () => {
                        if (k.dalDatabase) {
                            const esito = await decidiContestazioneDb(k.id, 'respinta', motivazione);
                            if (!esito.ok) { toast.error(esito.messaggio); return; }
                            chiudi();
                            toast.success('Contestazione respinta: le parti lo vedono');
                            return;
                        }
                        const m = respingiContestazione(k, motivazione, operatoreId);
                        chiudi();
                        toast.success(m.aperta ? 'Contestazione respinta: è partita la pratica di morosità del mese' : 'Contestazione respinta: le parti lo vedono');
                    }}>
                        Respingi la contestazione
                    </PulsanteFunzione>
                </div>
            )}

            {azione === 'rettifica' && (
                <div className="rounded-lg border border-border p-3 space-y-3">
                    <p className="text-sm text-foreground">Prima firma. Il mese cambia solo quando una seconda persona conferma.</p>
                    {bancari.length === 0 ? (
                        <p className="text-sm text-amber-800">Non c’è ancora un documento della banca: chiedilo alle parti prima di proporre la rettifica.</p>
                    ) : (
                        <>
                            <div className="space-y-1.5">
                                <p className="text-xs text-muted-foreground">Documento della banca</p>
                                {bancari.map(d => (
                                    <label key={d.id} className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer ${documento === d.id ? 'border-primary' : 'border-border'}`}>
                                        <input type="radio" name="documento-bancario" className="mt-1" checked={documento === d.id} onChange={() => setDocumento(d.id)} />
                                        <span className="break-words">{d.nome} <span className="text-xs text-muted-foreground">· {DAL[d.caricatoDa].toLowerCase()}</span></span>
                                    </label>
                                ))}
                            </div>
                            <label className="block space-y-1">
                                <span className="text-xs text-muted-foreground">Il giorno in cui il canone è arrivato, dal documento</span>
                                <Input type="date" value={data} min={primoDelMese} max={OGGI} onChange={e => scegliData(e.target.value)} className="max-w-[12rem]" />
                            </label>
                            <Textarea value={motivazione} onChange={e => setMotivazione(e.target.value)} rows={3} className="text-sm" placeholder="Cosa dice il documento, e perché la segnalazione va rettificata" />
                            <p className="text-xs text-muted-foreground">Almeno {MIN_MOTIVO} caratteri ({motivazione.trim().length}). Non può firmare chi ha generato il dato: {k.generatoDa.testo}.</p>
                            <AzioneSeparata
                                azione="prima_firma_rettifica" record={recordPrima}
                                disabled={!documento || !data || data < primoDelMese || data > OGGI || motivazione.trim().length < MIN_MOTIVO}
                                onEsegui={async () => {
                                    if (k.dalDatabase) {
                                        const esito = await decidiContestazioneDb(k.id, 'accolta', motivazione, data);
                                        if (!esito.ok) { toast.error(esito.messaggio); return; }
                                    } else {
                                        proponiRettifica(k, { documento, data, motivazione }, operatoreId);
                                    }
                                    chiudi();
                                    toast.success('Prima firma messa: la rettifica aspetta la seconda');
                                }}
                            >
                                Proponi la rettifica · prima firma
                            </AzioneSeparata>
                        </>
                    )}
                </div>
            )}
            {azione === 'rettifica' && data && <p className="text-xs text-muted-foreground">L’effetto sul semaforo si vede nel riquadro del contratto.</p>}
        </div>
    );
};

const Messaggi = ({ k, puoScrivere }) => {
    const [testo, setTesto] = useState('');
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Send className="w-5 h-5" /> Comunicazioni con le parti</CardTitle>
                <p className="text-xs text-muted-foreground">Le leggono proprietario e inquilino, ciascuno dalla sua area.</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {/* Quello che scrive CRIA sta a destra, quello che scrivono le parti a sinistra */}
                    {k.messaggi.map(m => (
                        m.autore === 'sistema'
                            ? <MessaggioDiSistema key={m.id}>{m.testo}</MessaggioDiSistema>
                            : (
                                <Messaggio
                                    key={m.id}
                                    mio={m.autore === 'cria'}
                                    autore={m.autore === 'locatore' ? `${k.contratto.locatore.nome} · proprietario` : `${k.contratto.conduttore.nome} · inquilino`}
                                    quando={fmtQuando(m.il)}
                                >
                                    {m.testo}
                                </Messaggio>
                            )
                    ))}
                </div>
                {puoScrivere && !k.chiusa && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-border">
                        <Textarea value={testo} onChange={e => setTesto(e.target.value)} rows={2} className="flex-1 text-sm" placeholder="Scrivi alle parti…" />
                        <Button className="gap-2 self-end" disabled={!testo.trim()} onClick={() => { scriviAlleParti(k, testo); setTesto(''); toast.success('Messaggio mandato alle parti'); }}>
                            <Send className="w-4 h-4" /> Invia
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const NoteInterne = ({ k, puoScrivere }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [testo, setTesto] = useState('');
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><NotebookPen className="w-5 h-5" /> Note interne</CardTitle>
                <p className="text-xs text-muted-foreground">Le parti non le vedono.</p>
            </CardHeader>
            <CardContent className="space-y-3">
                {k.note.length === 0 ? <p className="text-sm text-muted-foreground">Nessuna nota.</p> : k.note.map((n, i) => (
                    <div key={`${n.il}-${i}`} className="rounded-lg bg-muted/30 p-2.5">
                        <p className="text-sm text-foreground">{n.testo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{nomeOperatore(n.da)} · {fmtData(n.il)}</p>
                    </div>
                ))}
                {puoScrivere && (
                    <div className="space-y-2">
                        <Textarea value={testo} onChange={e => setTesto(e.target.value)} rows={2} className="text-sm" placeholder="Una nota per chi lavora la contestazione" />
                        <Button size="sm" variant="outline" disabled={!testo.trim()} onClick={() => { aggiungiNota(k, testo, operatoreId); setTesto(''); }}>Aggiungi la nota</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const Traccia = ({ k }) => {
    const e = [{ il: k.apertaIl, testo: `${k.contratto.conduttore.nome} apre la contestazione` }];
    if (k.presa) e.push({ il: k.presa.il, testo: `Presa in carico da ${nomeOperatore(k.presa.da)}` });
    k.richieste.forEach(r => e.push({ il: r.il, testo: `${nomeOperatore(r.da)} chiede documenti ${AL[r.a]}` }));
    k.documenti.filter(d => d.il > k.apertaIl).forEach(d => e.push({ il: d.il, testo: `${DAL[d.caricatoDa]} arriva «${d.nome}»` }));
    k.rettificheNegate.forEach(r => {
        e.push({ il: r.primaFirma.il, testo: `Prima firma di ${nomeOperatore(r.primaFirma.da)} su una rettifica` });
        e.push({ il: r.negataIl, testo: `${nomeOperatore(r.negataDa)} non conferma: «${r.motivo}»` });
    });
    if (k.rettifica?.primaFirma) e.push({ il: k.rettifica.primaFirma.il, testo: `Prima firma di ${nomeOperatore(k.rettifica.primaFirma.da)}: rettifica proposta` });
    if (k.rettifica?.secondaFirma) e.push({ il: k.rettifica.secondaFirma.il, testo: `Seconda firma di ${nomeOperatore(k.rettifica.secondaFirma.da)}: mese rettificato` });
    if (k.decisione) e.push({ il: k.decisione.il, testo: `${nomeOperatore(k.decisione.da)} respinge la contestazione` });
    if (k.morosita?.aperta) e.push({ il: k.morosita.il, testo: 'Parte la pratica di morosità del mese' });
    const eventi = e.map((x, i) => ({ ...x, i })).sort((a, b) => a.il.localeCompare(b.il) || a.i - b.i);
    return (
        <Card>
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><History className="w-5 h-5" /> Traccia</CardTitle></CardHeader>
            <CardContent>
                <ol className="relative ml-1.5 border-l border-border">
                    {eventi.map((x, i) => (
                        <li key={`${x.il}-${i}`} className="ml-5 pb-4 last:pb-0">
                            <span className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full border-2 border-background bg-muted-foreground/40" />
                            <p className="text-xs text-muted-foreground">{fmtData(x.il)}</p>
                            <p className="text-sm text-foreground">{x.testo}</p>
                        </li>
                    ))}
                </ol>
            </CardContent>
        </Card>
    );
};

const ContestazioneIstruttoria = ({ k, contratto, accesso }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [anteprima, setAnteprima] = useState('');
    const c = k.contratto;
    const puoLavorare = accesso.livello === 'operativo';
    const puoAnnotare = ['operativo', 'firma'].includes(accesso.livello);
    const ultimaRichiesta = k.richieste[k.richieste.length - 1];

    return (
        <div className="space-y-6">
            <IntestazionePagina
                indietro={{ to: '/dashboard/admin/contestazioni', label: 'Contestazioni' }}
                titolo={`Contestazione di ${nomeMese(k.mese).toLowerCase()}`}
                sottotitolo={`${c.immobile.indirizzo}, ${c.immobile.citta} · ${nomeProdotto(c.prodotto)} · inquilino ${c.conduttore.nome} · proprietario ${c.locatore.nome}`}
                badge={<Pill classe={classeStatoContestazione(k.stato)} className="text-sm px-3 py-1">{etichettaStatoContestazione(k.stato)}</Pill>}
            />

            <Card className={k.chiusa ? '' : 'border-[#1A2D52]/30'}>
                <CardContent className="pt-5 pb-5 flex items-start gap-4 flex-wrap">
                    {k.chiusa ? <Scale className="w-6 h-6 text-muted-foreground flex-shrink-0" /> : <Info className="w-6 h-6 text-[#1A2D52] flex-shrink-0" />}
                    <div className="flex-1 min-w-[14rem] space-y-1 text-sm">
                        {k.chiusa
                            ? <p className="text-foreground">Chiusa il {fmtData(k.chiusaIl)}.</p>
                            : <p className="text-foreground">CRIA risponde <Termine termine={k.termine} className="text-sm" /> <span className="text-xs text-muted-foreground">({k.termine.perche}, giorni solari)</span></p>}
                        <p className="text-xs text-muted-foreground">
                            Assegnata a {nomeOperatore(k.assegnataA)}{k.presa ? ` · presa in carico il ${fmtData(k.presa.il)}` : ' · non ancora presa in carico'}.
                            {!k.chiusa && ' Finché è aperta il mese resta in verifica e non conta nel semaforo.'}
                        </p>
                        {k.stato === 'documentazione_richiesta' && ultimaRichiesta && (
                            <p className="text-xs text-orange-800">In attesa {DEL[ultimaRichiesta.a]}: «{ultimaRichiesta.testo}»</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6 min-w-0">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base"><Gavel className="w-5 h-5" /> Istruttoria</CardTitle>
                            {!k.chiusa && <p className="text-xs text-muted-foreground">Respingere lascia il dato com’è. Rettificare vuole un documento della banca e due firme: l’assistenza propone, un responsabile conferma.</p>}
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {k.chiusa ? <Decisione k={k} /> : k.stato === 'aperta' ? (
                                <PulsanteFunzione funzioni={['assistenza']} azione="Prendere in carico una contestazione" onEsegui={() => { prendiInCarico(k, operatoreId); toast.success('Presa in carico: le parti lo vedono'); }}>
                                    Prendi in carico
                                </PulsanteFunzione>
                            ) : k.inAttesaSecondaFirma ? <SecondaFirma k={k} /> : puoLavorare ? (
                                <Azioni k={k} onData={setAnteprima} />
                            ) : (
                                <p className="text-sm text-muted-foreground">La istruisce {nomeOperatore(k.assegnataA)}, dell’assistenza. {accesso.livello === 'firma' ? 'Quando propone una rettifica, qui trovi la seconda firma.' : ''}</p>
                            )}
                        </CardContent>
                    </Card>
                    <Messaggi k={k} puoScrivere={puoLavorare} />
                </div>
                <div className="space-y-6 min-w-0">
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-base">Cosa è contestato</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <Voce etichetta="Segnalazione">Non pagato, {nomeMese(k.mese).toLowerCase()} · il {fmtData(k.segnalazione.il)}</Voce>
                            <Voce etichetta="Dato generato da">{k.generatoDa.testo}</Voce>
                            <Voce etichetta={`Motivo di ${c.conduttore.nome}`}>{k.motivo}</Voce>
                        </CardContent>
                    </Card>
                    <EffettoSemaforo k={k} contratto={contratto} dataProposta={anteprima} />
                    <Prove k={k} />
                    <NoteInterne k={k} puoScrivere={puoAnnotare} />
                    <Traccia k={k} />
                </div>
            </div>

            {!k.chiusa && k.stato === 'documentazione_richiesta' && (
                <NotaMockup>
                    <button type="button" className="underline underline-offset-2 font-medium" onClick={() => { simulaDocumentiArrivati(k); toast.success('Documento arrivato: la contestazione torna in verifica'); }}>
                        Simula: {IL[ultimaRichiesta?.a || 'locatore']} carica il documento richiesto
                    </button>
                </NotaMockup>
            )}
        </div>
    );
};

export default ContestazioneIstruttoria;
