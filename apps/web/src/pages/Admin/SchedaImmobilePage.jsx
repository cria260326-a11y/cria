import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Home, FileText, History, Receipt, Landmark, MapPin, Scale, ShieldAlert, ArrowRight, Hash, ClipboardList, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/StatusBadge.jsx';
import MappaImmobili from '@/components/MappaImmobili.jsx';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import TabellaMesi from '@/components/aree/TabellaMesi';
import FasiPratica from '@/components/aree/FasiPratica';
import NotaMockup from '@/components/NotaMockup';
import RegistrazioneContratto from '@/components/admin/anagrafica/RegistrazioneContratto';
import { Chip, Voce, VistaRistretta } from '@/components/admin/anagrafica/ElementiScheda';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import {
    useAnagrafica, livelloAnagrafica, ripristinaAnagraficaDemo, percorsoSoggetto,
    PERCORSI, STATO_IMMOBILE, FONTE_TITOLARITA, TITOLO,
} from '@/lib/anagraficheDemo';
import { CONTESTAZIONI, DOCUMENTI } from '@/data/datiDemo';
import { FASI_PRATICA, MOROSITA } from '@/data/pratiche';
import { PRODOTTI, nomeProdotto, prezzoProdotto, fmtEuro, COLORE_PRODOTTO } from '@/data/catalogo';
import { nomeOperatore } from '@/data/operatori';
import { analizzaMesi } from '@/lib/semaforo';
import { TIPO_DOCUMENTO, STATO_DOCUMENTO, etichettaStatoContestazione, classeStatoContestazione } from '@/lib/etichette';
import { fmtData, nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// SCHEDA IMMOBILE — O-06
// L'immobile ha un codice che non cambia mai (§9.4): cambiano inquilini e
// proprietari, l'immobile e il suo storico restano. Qui c'è il contratto in
// corso con la registrazione, i mesi, lo storico dei contratti e quello di
// titolarità. Niente si sovrascrive, niente si cancella.
// La rotta accetta anche l'id di un contratto o di una pratica, e porta al
// codice dell'immobile.
// ═════════════════════════════════════════════════════════════════════════════

const percorsoScheda = (id) => `/dashboard/admin/immobili/${id}`;
const etichettaFase = (stato) => FASI_PRATICA.find(f => f.id === stato)?.etichetta || stato;

const Titolo = ({ icona: Icona, children, destra }) => (
    <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="flex items-center gap-2 text-base"><Icona className="w-5 h-5" /> {children}</CardTitle>
            {destra}
        </div>
    </CardHeader>
);

const LinkSoggetto = ({ s, fallback }) => (s
    ? <Link to={percorsoSoggetto(s.id)} className="underline decoration-muted-foreground/40 hover:decoration-foreground">{s.nomeCompleto}</Link>
    : <span>{fallback || '—'}</span>);

// ─── Contratto o pratica in corso ─────────────────────────────────────────────
const ContrattoInCorso = ({ c, modello }) => {
    const p = PRODOTTI[c.prodotto];
    return (
        <Card>
            <Titolo icona={Home} destra={<StatusBadge status={analizzaMesi(c.mesi).semaforo} />}>Contratto in corso</Titolo>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <Voce etichetta="Proprietario"><LinkSoggetto s={modello.soggettoDi(c, 'locatore')} fallback={c.locatore.nome} /></Voce>
                <Voce etichetta="Inquilino"><LinkSoggetto s={modello.soggettoDi(c, 'conduttore')} fallback={c.conduttore.nome} /></Voce>
                <Voce etichetta="Prodotto">
                    <Chip aCapo classe={COLORE_PRODOTTO[c.prodotto]}>{nomeProdotto(c.prodotto)}</Chip>
                    <span className="block text-xs text-muted-foreground font-normal mt-1">{prezzoProdotto(c.prodotto)}</span>
                </Voce>
                <Voce etichetta="Canone">{fmtEuro(c.canone)} al mese</Voce>
                <Voce etichetta="Deposito">{fmtEuro(c.deposito)}</Voce>
                <Voce etichetta="Durata">{c.durata}</Voce>
                <Voce etichetta="Inizio">{fmtData(c.inizio)}</Voce>
                <Voce etichetta="Scadenza">{fmtData(c.fine)}</Voce>
                <Voce etichetta="Su CRIA da">{nomeMese(c.attivoDal)}</Voce>
                <Voce etichetta="Garanzia">{p.garanzia ? `Sì, franchigia di ${p.franchigiaMesi} ${p.franchigiaMesi === 1 ? 'mese' : 'mesi'}` : 'No'}</Voce>
                <Voce etichetta="Codice del contratto" className="col-span-2">
                    <span className="font-mono text-xs">{c.codiceUnivoco}</span>
                    <span className="block text-xs text-muted-foreground font-normal">È la causale di ogni bonifico verso CRIA.</span>
                </Voce>
            </CardContent>
        </Card>
    );
};

const PraticaInCorso = ({ p, modello }) => {
    const candidato = p.candidato && modello.trova(`cand-${p.id}`);
    return (
        <Card>
            <Titolo icona={ClipboardList}>Pratica in corso</Titolo>
            <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                    <p className="text-foreground"><span className="font-medium">Fase: {etichettaFase(p.stato)}</span> · aperta il {fmtData(p.apertaIl)}</p>
                    <FasiPratica stato={p.stato} compatto />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <Voce etichetta="Proprietario"><LinkSoggetto s={modello.trova(modello.risolvi(p.personaId))} /></Voce>
                    <Voce etichetta={p.candidato?.inquilinoAttuale ? 'Inquilino attuale' : 'Candidato inquilino'}>
                        <LinkSoggetto s={candidato} fallback={p.candidato ? p.candidato.nome : 'Non ancora invitato'} />
                    </Voce>
                    <Voce etichetta="Prodotto"><Chip aCapo classe={COLORE_PRODOTTO[p.prodotto]}>{nomeProdotto(p.prodotto)}</Chip></Voce>
                    <Voce etichetta="Canone">{fmtEuro(p.canone)} al mese</Voce>
                    <Voce etichetta={p.contratto === 'esistente' ? 'Inizio' : 'Inizio previsto'}>{fmtData(p.inizio || p.inizioPrevisto)}</Voce>
                    <Voce etichetta="Durata">{p.durata}</Voce>
                    {p.registrazione && (
                        <Voce etichetta="Registrazione dichiarata" className="col-span-2 sm:col-span-3">
                            <span className="font-mono text-xs">{p.registrazione.numero}</span>
                            <span className="block text-xs text-muted-foreground font-normal">{fmtData(p.registrazione.data)} · {p.registrazione.ufficio}. Si legge sulla ricevuta quando il contratto entra su CRIA.</span>
                        </Voce>
                    )}
                </div>
                <Link to="/dashboard/admin/onboarding" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">Vai alle pratiche da deliberare <ArrowRight className="w-3.5 h-3.5" /></Link>
            </CardContent>
        </Card>
    );
};

// ─── Storici ──────────────────────────────────────────────────────────────────
const StoricoContratti = ({ imm, modello }) => {
    // I proprietari del periodo, da titolarità: un contratto può passare da un proprietario all'altro con una vendita.
    const titolariTra = (dal, al) => imm.titolarita
        .filter(t => (!t.dal || t.dal <= al) && (!t.al || t.al >= dal))
        .sort((x, y) => (x.dal || '').localeCompare(y.dal || ''))
        .map(t => t.soggetto?.nomeCompleto || t.nome);
    const p = imm.pratiche[0];
    const righe = [
        ...imm.contratti.map(c => (
            <li key={c.id} className="p-3 space-y-1 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{fmtData(c.inizio)} → in corso</span>
                    <Chip classe={COLORE_PRODOTTO[c.prodotto]}>{nomeProdotto(c.prodotto)}</Chip>
                </div>
                <p className="text-xs text-muted-foreground">
                    Inquilino: <LinkSoggetto s={modello.soggettoDi(c, 'conduttore')} fallback={c.conduttore.nome} /> · scade il {fmtData(c.fine)} · su CRIA da {nomeMese(c.attivoDal).toLowerCase()}
                </p>
            </li>
        )),
        ...imm.contratti.flatMap(c => [...c.storicoInquilini].sort((x, y) => y.dal.localeCompare(x.dal)).map(s => (
            <li key={`${c.id}-${s.dal}`} className="p-3 space-y-1 text-sm">
                <p className="font-medium text-foreground">{fmtData(s.dal)} → {fmtData(s.al)}</p>
                <p className="text-xs text-muted-foreground">
                    Inquilino: {s.nome} · proprietario: {titolariTra(s.dal, s.al).join(', poi ') || '—'}
                </p>
                <p className="text-xs text-muted-foreground">Prima di CRIA: dichiarato dal proprietario. L’inquilino di allora resta un nome, non diventa un’anagrafica.</p>
            </li>
        ))),
    ];
    if (!imm.contratti.length && p?.contratto === 'esistente' && p.candidato) {
        righe.push(
            <li key="dichiarato" className="p-3 space-y-1 text-sm">
                <p className="font-medium text-foreground">{fmtData(p.inizio)} → in corso</p>
                <p className="text-xs text-muted-foreground">Contratto già in corso, dichiarato nella pratica: inquilina {p.candidato.nome}. Entra su CRIA quando la pratica è attiva.</p>
            </li>,
        );
    }
    return (
        <Card>
            <Titolo icona={History}>Storico dei contratti</Titolo>
            <CardContent className="space-y-3">
                {righe.length === 0
                    ? <p className="text-sm text-muted-foreground">Nessun contratto su CRIA per ora.</p>
                    : <ul className="divide-y divide-border rounded-lg border border-border">{righe}</ul>}
                <p className="text-xs text-muted-foreground">Quando cambia l’inquilino, il contratto si chiude e se ne apre uno nuovo: lo storico resta.</p>
            </CardContent>
        </Card>
    );
};

const StoricoTitolarita = ({ imm }) => {
    const righe = [...imm.titolarita].sort((x, y) => (y.dal || '').localeCompare(x.dal || ''));
    return (
        <Card>
            <Titolo icona={Landmark}>Storico di titolarità</Titolo>
            <CardContent className="space-y-3">
                <ul className="divide-y divide-border rounded-lg border border-border">
                    {righe.map((t, i) => (
                        <li key={`${t.soggettoId || t.nome}-${t.dal || i}`} className="p-3 space-y-1 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-foreground">
                                    {t.soggetto ? <LinkSoggetto s={t.soggetto} /> : t.nome}
                                </span>
                                <Chip classe={t.al ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-800'}>{t.al ? 'Precedente' : 'Attuale'}</Chip>
                                {!t.soggetto && <span className="text-xs text-muted-foreground">fuori da CRIA</span>}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {TITOLO[t.titolo]} per il {t.quota}% · {t.dal ? `dal ${fmtData(t.dal)}` : 'data non dichiarata'}{t.al ? ` al ${fmtData(t.al)}` : ' a oggi'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Fonte: {FONTE_TITOLARITA[t.fonte]}{t.documento ? ` · ${STATO_DOCUMENTO[t.documento.stato]?.etichetta.toLowerCase()}` : ''} ·{' '}
                                {t.registrataDa
                                    ? `riscontrata da ${nomeOperatore(t.registrataDa)} il ${fmtData(t.registrataIl)}`
                                    : `registrata il ${fmtData(t.registrataIl)}, non ancora riscontrata su un documento`}
                            </p>
                        </li>
                    ))}
                </ul>
                <p className="text-xs text-muted-foreground">Un cambio di proprietà chiude la riga precedente e ne apre una nuova: niente si sovrascrive e niente si cancella.</p>
            </CardContent>
        </Card>
    );
};

// ─── Colonna di destra ────────────────────────────────────────────────────────
const DatiImmobile = ({ imm }) => {
    const d = imm.dati;
    return (
        <Card>
            <Titolo icona={Hash}>Immobile</Titolo>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <Voce etichetta="Codice" className="col-span-2">
                    <span className="font-mono">{imm.codice}</span>
                    <span className="block text-xs text-muted-foreground font-normal">Non cambia mai, qualunque cosa succeda a contratti e proprietari.</span>
                </Voce>
                <Voce etichetta="Tipologia">{d.tipologia}</Voce>
                <Voce etichetta="Superficie">{d.mq ? `${d.mq} m²` : '—'}</Voce>
                <Voce etichetta="Dati catastali" className="col-span-2">{d.catasto || '—'}</Voce>
                <Voce etichetta="Indirizzo" className="col-span-2">{d.indirizzo}, {d.cap} {d.citta} ({d.provincia})</Voce>
                <Voce etichetta="In CRIA dal" className="col-span-2">{fmtData(imm.inseritoIl)}</Voce>
            </CardContent>
        </Card>
    );
};

const Documenti = ({ imm, reg, modello }) => {
    const ids = new Set(imm.contratti.map(c => c.id));
    const righe = [
        ...DOCUMENTI.filter(d => ids.has(d.contrattoId)).map(d => ({
            id: d.id, etichetta: TIPO_DOCUMENTO[d.tipo] || d.nome, il: d.caricatoIl, stato: d.stato,
            chi: modello.trova(modello.risolvi(d.personaId))?.nomeCompleto,
        })),
        // La ricevuta di chi non è una persona demo sta nel back office.
        ...(reg?.ricevuta && !reg.ricevuta.documentoId ? [{ id: 'ricevuta', etichetta: TIPO_DOCUMENTO.registrazione, il: reg.ricevuta.caricataIl, stato: null, chi: 'il proprietario' }] : []),
        ...imm.pratiche.flatMap(p => p.documentiProprietario.map(d => ({
            id: `${p.id}-${d.tipo}`, etichetta: d.etichetta, il: null, stato: d.stato,
            chi: modello.trova(modello.risolvi(p.personaId))?.nomeCompleto,
        }))),
    ];
    return (
        <Card>
            <Titolo icona={FileText}>Documenti ({righe.length})</Titolo>
            <CardContent className="space-y-2">
                {righe.length === 0 ? <p className="text-sm text-muted-foreground">Nessun documento.</p> : righe.map(d => (
                    <div key={d.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-foreground">{d.etichetta}</p>
                                {STATO_DOCUMENTO[d.stato] && <span className={`text-xs font-medium flex-shrink-0 ${STATO_DOCUMENTO[d.stato].classe}`}>{STATO_DOCUMENTO[d.stato].etichetta}</span>}
                            </div>
                            <p className="text-xs text-muted-foreground">{[d.chi && `da ${d.chi}`, d.il && fmtData(d.il)].filter(Boolean).join(' · ')}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

const Collegamenti = ({ imm }) => {
    const ids = new Set(imm.contratti.map(c => c.id));
    const morosita = MOROSITA.filter(m => ids.has(m.contrattoId));
    const contestazioni = CONTESTAZIONI.filter(k => ids.has(k.contrattoId)).sort((a, b) => b.apertaIl.localeCompare(a.apertaIl));
    if (!morosita.length && !contestazioni.length) return null;
    return (
        <Card>
            <Titolo icona={Scale}>Morosità e contestazioni</Titolo>
            <CardContent className="p-0">
                <ul className="divide-y divide-border border-t border-border">
                    {morosita.map(m => (
                        <li key={m.id}>
                            <Link to={`/dashboard/admin/morosita/${m.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30">
                                <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
                                <span className="flex-1 min-w-0 text-sm text-foreground">Morosità: {m.mesi.map(x => nomeMese(x).toLowerCase()).join(', ')}</span>
                                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            </Link>
                        </li>
                    ))}
                    {contestazioni.map(k => (
                        <li key={k.id}>
                            <Link to={`/dashboard/admin/contestazioni/${k.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30">
                                <span className="flex-1 min-w-0">
                                    <span className="block text-sm text-foreground">Contestazione di {nomeMese(k.mese).toLowerCase()}</span>
                                    <span className="block text-xs text-muted-foreground">Aperta il {fmtData(k.apertaIl)}</span>
                                </span>
                                <Chip classe={classeStatoContestazione(k.stato)}>{etichettaStatoContestazione(k.stato)}</Chip>
                                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

// ─── Pagina ───────────────────────────────────────────────────────────────────
const SchedaImmobilePage = () => {
    const { id } = useParams();
    const { operatore } = useOperatoreAttivo();
    const livello = livelloAnagrafica(operatore.funzione);
    const modello = useAnagrafica();
    const indietro = { to: PERCORSI.contratti, label: 'Contratti e immobili' };

    if (livello !== 'L') {
        return (
            <>
                <Helmet><title>Scheda immobile - CRIA</title></Helmet>
                <div className="space-y-6">
                    <IntestazionePagina titolo="Scheda immobile" indietro={indietro} />
                    <VistaRistretta livello={livello} />
                </div>
            </>
        );
    }

    const imm = modello.trovaImmobile(id);
    if (!imm) {
        return (
            <>
                <Helmet><title>Immobile non trovato - CRIA</title></Helmet>
                <div className="space-y-6">
                    <IntestazionePagina titolo="Immobile non trovato" indietro={indietro} />
                    <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nessun immobile con questo codice.</CardContent></Card>
                </div>
            </>
        );
    }
    // Arrivati con l'id di un contratto o di una pratica: si va al codice dell'immobile.
    if (imm.id !== id) return <Navigate to={percorsoScheda(imm.id)} replace />;

    const d = imm.dati;
    const c = imm.contratti[0] || null;
    const p = imm.pratiche[0] || null;
    const reg = c ? modello.registrazioneDi(c.id) : null;
    const stato = STATO_IMMOBILE[imm.stato];

    return (
        <>
            <Helmet><title>{d.indirizzo} - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    indietro={indietro}
                    titolo={`${d.indirizzo}, ${d.citta}`}
                    sottotitolo={[`Codice ${imm.codice}`, `${d.tipologia}${d.mq ? `, ${d.mq} m²` : ''}`, d.catasto].filter(Boolean).join(' · ')}
                    badge={<Chip classe={stato.classe}>{stato.etichetta}</Chip>}
                />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        {c && <ContrattoInCorso c={c} modello={modello} />}
                        {c && (
                            <Card>
                                <Titolo icona={Receipt}>Registrazione</Titolo>
                                <CardContent><RegistrazioneContratto registrazione={reg} /></CardContent>
                            </Card>
                        )}
                        {!c && p && <PraticaInCorso p={p} modello={modello} />}
                        {c && (
                            <div className="space-y-3">
                                <h2 className="text-base font-semibold text-foreground flex items-center gap-2"><CalendarCheck className="w-5 h-5" /> Mese per mese</h2>
                                <TabellaMesi mesi={c.mesi} prospettiva="cria" percorsoContestazioni="/dashboard/admin/contestazioni" />
                            </div>
                        )}
                        <StoricoContratti imm={imm} modello={modello} />
                        <StoricoTitolarita imm={imm} />
                    </div>

                    <div className="space-y-6">
                        {d.lat && d.lng && (
                            <Card>
                                <Titolo icona={MapPin}>Posizione</Titolo>
                                <CardContent className="pt-0">
                                    <MappaImmobili
                                        immobili={[{ id: imm.id, lat: d.lat, lng: d.lng, titolo: d.indirizzo, righe: [d.citta], stato: c ? analizzaMesi(c.mesi).semaforo : 'storico_insufficiente' }]}
                                        altezza={220}
                                    />
                                </CardContent>
                            </Card>
                        )}
                        <DatiImmobile imm={imm} />
                        <Collegamenti imm={imm} />
                        <Documenti imm={imm} reg={reg} modello={modello} />
                    </div>
                </div>

                <NotaMockup>
                    <p>Richieste di ricevuta ed estremi inseriti restano in questo browser.</p>
                    <button type="button" className="underline font-medium mt-2" onClick={() => { ripristinaAnagraficaDemo(); toast.success('Anagrafica demo ripristinata'); }}>
                        Ripristina l’anagrafica demo
                    </button>
                </NotaMockup>
            </div>
        </>
    );
};

export default SchedaImmobilePage;
