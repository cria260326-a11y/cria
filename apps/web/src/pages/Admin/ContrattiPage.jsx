import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, X, ChevronRight, ChevronDown, FileText, Home, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/StatusBadge.jsx';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import NotaMockup from '@/components/NotaMockup';
import MappaImmobiliCria, { adessoNellImmobile, percorsoImmobile, titolareAttuale } from '@/components/admin/MappaImmobiliCria';
import RegistrazioneContratto from '@/components/admin/anagrafica/RegistrazioneContratto';
import { Chip, Termine, VistaRistretta } from '@/components/admin/anagrafica/ElementiScheda';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import {
    useAnagrafica, livelloAnagrafica, ripristinaAnagraficaDemo, percorsoSoggetto,
    STATO_REGISTRAZIONE, STATO_IMMOBILE,
} from '@/lib/anagraficheDemo';
import { useContratti } from '@/lib/contrattiFonte';
import { PRODOTTI_PROPRIETARIO, nomeProdotto, fmtEuro, COLORE_PRODOTTO } from '@/data/catalogo';
import { analizzaMesi } from '@/lib/semaforo';
import { fmtData } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// CONTRATTI E IMMOBILI — O-05
// Tre schede, una cosa per volta:
//   Immobili      la mappa (la stessa della panoramica) e l'elenco; il codice
//                 dell'immobile non cambia mai
//   Contratti     le parti, il prodotto, il canone, la registrazione, il semaforo
//   Registrazioni da completare
//                 non c'è un collegamento con l'Agenzia delle Entrate: il
//                 proprietario carica la ricevuta, un operatore ne scrive a mano
//                 gli estremi e li confronta con quelli dichiarati
// La scheda scelta sta nell'indirizzo (?scheda=…): i link della panoramica
// aprono quella giusta.
// ═════════════════════════════════════════════════════════════════════════════

const selectClasse = 'text-sm border border-border rounded-lg px-3 py-2 bg-background w-full sm:w-auto';
// Prima quello che si può fare subito: la ricevuta è arrivata, mancano gli estremi.
const ORDINE_CODA = { da_inserire: 0, senza_ricevuta: 1 };

const NomeSoggetto = ({ s, fallback }) => (s
    ? <Link to={percorsoSoggetto(s.id)} onClick={e => e.stopPropagation()} className="text-foreground hover:underline">{s.nomeCompleto}</Link>
    : <span className="text-muted-foreground">{fallback}</span>);

const Ricerca = ({ valore, onCambia, segnaposto }) => (
    <div className="relative w-full sm:flex-1 sm:min-w-56">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={segnaposto} value={valore} onChange={e => onCambia(e.target.value)} className="pl-9" aria-label="Cerca" />
    </div>
);

// ─── Immobili ─────────────────────────────────────────────────────────────────
const SchedaImmobili = ({ modello }) => {
    const [cerca, setCerca] = useState('');
    const q = cerca.trim().toLowerCase();
    const trovati = useMemo(() => modello.immobili.filter(i => {
        const t = titolareAttuale(i);
        return !q || [i.codice, i.dati.indirizzo, i.dati.citta, t?.soggetto?.nomeCompleto || t?.nome].filter(Boolean).join(' ').toLowerCase().includes(q);
    }), [modello, q]);

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="pt-4 space-y-3">
                    <MappaImmobiliCria immobili={trovati} />
                    <p className="text-xs text-muted-foreground">
                        Il colore è il semaforo del contratto in corso; in grigio gli immobili ancora in pratica. Un clic sul punto apre la scheda.
                    </p>
                </CardContent>
            </Card>
            <div className="flex flex-wrap items-center gap-3">
                <Ricerca valore={cerca} onCambia={setCerca} segnaposto="Indirizzo, proprietario, codice immobile…" />
                {cerca && <Button variant="ghost" size="sm" onClick={() => setCerca('')}><X className="w-3.5 h-3.5 mr-1" /> Azzera</Button>}
            </div>
            {trovati.length === 0 ? (
                <Card><CardContent className="py-14 text-center text-sm text-muted-foreground">Nessun immobile con questa ricerca.</CardContent></Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <ul className="divide-y divide-border">
                            {trovati.map(i => {
                                const t = titolareAttuale(i);
                                return (
                                    <li key={i.id}>
                                        <Link to={percorsoImmobile(i.id)} className="flex items-center gap-3 px-4 sm:px-6 py-3 hover:bg-muted/30">
                                            <span className="hidden sm:block w-24 flex-shrink-0 font-mono text-xs text-muted-foreground">{i.codice}</span>
                                            <span className="flex-1 min-w-0 space-y-0.5">
                                                <span className="block font-medium text-foreground">{i.dati.indirizzo}, {i.dati.citta}</span>
                                                <span className="block text-xs text-muted-foreground">
                                                    <span className="sm:hidden font-mono">{i.codice} · </span>
                                                    Proprietario: {t?.soggetto?.nomeCompleto || t?.nome || '—'} · {adessoNellImmobile(i)}
                                                </span>
                                            </span>
                                            <Chip classe={STATO_IMMOBILE[i.stato].classe}>{STATO_IMMOBILE[i.stato].etichetta}</Chip>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </CardContent>
                </Card>
            )}
            <p className="text-xs text-muted-foreground">Il codice dell’immobile non cambia mai: cambiano inquilini e proprietari, l’immobile e il suo storico restano.</p>
        </div>
    );
};

// ─── Contratti ────────────────────────────────────────────────────────────────
const SchedaContratti = ({ righe }) => {
    const navigate = useNavigate();
    const [cerca, setCerca] = useState('');
    const [fProdotto, setFProdotto] = useState('tutti');
    const [fRegistrazione, setFRegistrazione] = useState('tutti');
    const q = cerca.trim().toLowerCase();
    const trovati = righe.filter(r => {
        const testo = [r.c.immobile.indirizzo, r.c.immobile.citta, r.proprietario?.nomeCompleto, r.inquilino?.nomeCompleto, r.c.codiceUnivoco, r.reg.estremi.numero];
        if (q && !testo.filter(Boolean).join(' ').toLowerCase().includes(q)) return false;
        if (fProdotto !== 'tutti' && r.c.prodotto !== fProdotto) return false;
        if (fRegistrazione !== 'tutti' && r.reg.stato !== fRegistrazione) return false;
        return true;
    });
    const filtriAttivi = cerca || fProdotto !== 'tutti' || fRegistrazione !== 'tutti';

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <Ricerca valore={cerca} onCambia={setCerca} segnaposto="Indirizzo, parti, codice del contratto, numero di registrazione…" />
                <select value={fProdotto} onChange={e => setFProdotto(e.target.value)} className={selectClasse} aria-label="Prodotto">
                    <option value="tutti">Tutti i prodotti</option>
                    {PRODOTTI_PROPRIETARIO.map(p => <option key={p} value={p}>{nomeProdotto(p)}</option>)}
                </select>
                <select value={fRegistrazione} onChange={e => setFRegistrazione(e.target.value)} className={selectClasse} aria-label="Registrazione">
                    <option value="tutti">Ogni registrazione</option>
                    {Object.entries(STATO_REGISTRAZIONE).map(([k, v]) => <option key={k} value={k}>{v.etichetta}</option>)}
                </select>
                {filtriAttivi && (
                    <Button variant="ghost" size="sm" onClick={() => { setCerca(''); setFProdotto('tutti'); setFRegistrazione('tutti'); }}>
                        <X className="w-3.5 h-3.5 mr-1" /> Azzera
                    </Button>
                )}
            </div>

            {trovati.length === 0 ? (
                <Card><CardContent className="py-14 text-center text-sm text-muted-foreground">Nessun contratto con questi filtri.</CardContent></Card>
            ) : (
                <>
                    <Card className="hidden md:block">
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr className="text-left text-xs font-semibold text-muted-foreground uppercase">
                                        <th className="px-4 py-3">Immobile</th>
                                        <th className="px-4 py-3">Parti</th>
                                        <th className="px-4 py-3">Prodotto</th>
                                        <th className="px-4 py-3">Canone e durata</th>
                                        <th className="px-4 py-3">Registrazione</th>
                                        <th className="px-4 py-3">Semaforo</th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {trovati.map(r => (
                                        <tr key={r.c.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => navigate(percorsoImmobile(r.immobile.id))}>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Link to={percorsoImmobile(r.immobile.id)} onClick={e => e.stopPropagation()} className="font-medium text-foreground hover:underline">{r.c.immobile.indirizzo}</Link>
                                                <p className="text-xs text-muted-foreground">{r.c.immobile.citta}</p>
                                                <p className="text-xs text-muted-foreground font-mono whitespace-nowrap">{r.c.codiceUnivoco}</p>
                                            </td>
                                            <td className="px-4 py-3 text-xs space-y-0.5">
                                                <p><span className="text-muted-foreground">Proprietario:</span> <NomeSoggetto s={r.proprietario} fallback={r.c.locatore.nome} /></p>
                                                <p><span className="text-muted-foreground">Inquilino:</span> <NomeSoggetto s={r.inquilino} fallback={r.c.conduttore.nome} /></p>
                                            </td>
                                            <td className="px-4 py-3"><Chip aCapo classe={COLORE_PRODOTTO[r.c.prodotto]}>{nomeProdotto(r.c.prodotto)}</Chip></td>
                                            <td className="px-4 py-3 tabular-nums whitespace-nowrap">
                                                <p className="text-foreground whitespace-nowrap">{fmtEuro(r.c.canone)} al mese</p>
                                                <p className="text-xs text-muted-foreground whitespace-nowrap">{fmtData(r.c.inizio)} → {fmtData(r.c.fine)}</p>
                                            </td>
                                            <td className="px-4 py-3"><Chip classe={STATO_REGISTRAZIONE[r.reg.stato].classe}>{STATO_REGISTRAZIONE[r.reg.stato].breve}</Chip></td>
                                            <td className="px-4 py-3"><StatusBadge status={r.semaforo} /></td>
                                            <td className="px-4 py-3 text-right"><ChevronRight className="w-4 h-4 text-muted-foreground inline" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                    <div className="md:hidden space-y-3">
                        {trovati.map(r => (
                            <Card key={r.c.id}>
                                <CardContent className="pt-4 pb-4 space-y-2.5">
                                    <Link to={percorsoImmobile(r.immobile.id)} className="flex items-start gap-2">
                                        <span className="flex-1 min-w-0">
                                            <span className="block font-medium text-foreground">{r.c.immobile.indirizzo}, {r.c.immobile.citta}</span>
                                            <span className="block text-xs text-muted-foreground font-mono break-all">{r.c.codiceUnivoco}</span>
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    </Link>
                                    <p className="text-xs text-muted-foreground">
                                        Proprietario: <NomeSoggetto s={r.proprietario} fallback={r.c.locatore.nome} /> · Inquilino: <NomeSoggetto s={r.inquilino} fallback={r.c.conduttore.nome} />
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <Chip classe={COLORE_PRODOTTO[r.c.prodotto]}>{nomeProdotto(r.c.prodotto)}</Chip>
                                        <Chip classe={STATO_REGISTRAZIONE[r.reg.stato].classe}>{STATO_REGISTRAZIONE[r.reg.stato].breve}</Chip>
                                        <StatusBadge status={r.semaforo} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">{fmtEuro(r.c.canone)} al mese · {fmtData(r.c.inizio)} → {fmtData(r.c.fine)}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Il codice sotto l’indirizzo è quello del contratto: è la causale di ogni bonifico verso CRIA. Il semaforo è quello del contratto, il dettaglio di quello della persona.
                    </p>
                </>
            )}
        </div>
    );
};

// ─── Registrazioni da completare ──────────────────────────────────────────────
const SchedaRegistrazioni = ({ coda }) => {
    const [aperto, setAperto] = useState(null);
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Receipt className="w-5 h-5" /> Registrazioni da completare</CardTitle>
                <p className="text-sm text-muted-foreground">
                    I contratti di cui mancano gli estremi di registrazione all’Agenzia delle Entrate. Il proprietario carica la ricevuta, un operatore ne legge gli estremi e li confronta con quelli dichiarati. Chi non l’ha caricata riceve una richiesta nella sua area.
                </p>
            </CardHeader>
            <CardContent className="p-0">
                {coda.length === 0 ? (
                    <p className="px-6 pb-6 text-sm text-muted-foreground">Tutte le registrazioni sono riscontrate sulla ricevuta.</p>
                ) : (
                    <ul className="divide-y divide-border border-t border-border">
                        {coda.map(r => {
                            const stato = STATO_REGISTRAZIONE[r.reg.stato];
                            const eAperto = aperto === r.c.id;
                            return (
                                <li key={r.c.id}>
                                    <button
                                        type="button"
                                        onClick={() => setAperto(eAperto ? null : r.c.id)}
                                        aria-expanded={eAperto}
                                        className="w-full flex items-center gap-3 px-4 sm:px-6 py-3 text-left hover:bg-muted/30 focus-visible:outline-none focus-visible:bg-muted/30"
                                    >
                                        <span className="flex-1 min-w-0 space-y-1">
                                            <span className="block font-medium text-foreground">{r.c.immobile.indirizzo}, {r.c.immobile.citta}</span>
                                            <span className="block text-xs text-muted-foreground">Proprietario: {r.proprietario?.nomeCompleto || r.c.locatore.nome} · {nomeProdotto(r.c.prodotto)}</span>
                                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <Chip classe={stato.classe}>{stato.breve}</Chip>
                                                <Termine termine={r.reg.termine} etichetta={r.reg.stato === 'da_inserire' ? 'Da inserire entro il' : 'Risposta entro il'} />
                                                {r.reg.stato === 'senza_ricevuta' && !r.reg.ultimaRichiesta && <span className="text-xs text-muted-foreground">Non ancora chiesta</span>}
                                            </span>
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${eAperto ? 'rotate-180' : ''}`} />
                                    </button>
                                    {eAperto && (
                                        <div className="px-4 sm:px-6 pb-5 pt-1 space-y-3">
                                            <RegistrazioneContratto registrazione={r.reg} conStato={false} />
                                            <Link to={percorsoImmobile(r.immobile.id)} className="inline-block text-xs font-medium text-primary hover:underline">Apri la scheda dell’immobile →</Link>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};

// ─── La pagina ────────────────────────────────────────────────────────────────
const ContrattiPage = () => {
    const { operatore } = useOperatoreAttivo();
    const livello = livelloAnagrafica(operatore.funzione);
    const modello = useAnagrafica();
    const contratti = useContratti();
    const [parametri, setParametri] = useSearchParams();

    const righe = useMemo(() => contratti.map(c => ({
        c,
        semaforo: analizzaMesi(c.mesi).semaforo,
        reg: modello.registrazioneDi(c.id),
        proprietario: modello.soggettoDi(c, 'locatore'),
        inquilino: modello.soggettoDi(c, 'conduttore'),
        immobile: modello.trovaImmobile(c.id),
    })), [modello, contratti]);

    const coda = righe
        .filter(r => r.reg.stato !== 'completa')
        .sort((x, y) => (y.reg.termine?.scaduto ? 1 : 0) - (x.reg.termine?.scaduto ? 1 : 0) || ORDINE_CODA[x.reg.stato] - ORDINE_CODA[y.reg.stato]);
    const oltreTermine = coda.filter(r => r.reg.termine?.scaduto).length;

    const SCHEDE = [
        { id: 'immobili', etichetta: 'Immobili', numero: modello.immobili.length, icona: Home },
        { id: 'contratti', etichetta: 'Contratti', numero: contratti.length, icona: FileText },
        { id: 'registrazioni', etichetta: 'Registrazioni da completare', breve: 'Registrazioni', numero: coda.length, icona: Receipt, urgenti: oltreTermine },
    ];
    const scheda = SCHEDE.some(s => s.id === parametri.get('scheda')) ? parametri.get('scheda') : 'immobili';
    const scegli = (id) => setParametri(p => {
        const n = new URLSearchParams(p);
        n.set('scheda', id);
        return n;
    }, { replace: true });

    const intestazione = (
        <IntestazionePagina
            titolo="Contratti e immobili"
            sottotitolo="Gli immobili sulla mappa, i contratti con le loro parti, e le registrazioni ancora da riscontrare sulla ricevuta."
        />
    );

    if (livello !== 'L') {
        return (
            <>
                <Helmet><title>Contratti e immobili - CRIA</title></Helmet>
                <div className="space-y-6">
                    {intestazione}
                    {livello === 'agg' && (
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                            <Contatore etichetta="Contratti su CRIA" valore={contratti.length} icona={FileText} colore="bg-blue-500" />
                            <Contatore etichetta="Immobili" valore={modello.immobili.length} icona={Home} colore="bg-slate-500" />
                            <Contatore etichetta="Registrazioni da completare" valore={coda.length} icona={Receipt} colore="bg-amber-500" />
                        </div>
                    )}
                    <VistaRistretta livello={livello} />
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet><title>Contratti e immobili - CRIA</title></Helmet>
            <div className="space-y-6">
                {intestazione}

                {/* Sul telefono le tre schede si dividono la riga, con i nomi corti. */}
                <div className="grid grid-cols-3 sm:inline-flex gap-1 p-1 bg-muted rounded-lg w-full sm:w-auto" role="tablist" aria-label="Cosa vedere">
                    {SCHEDE.map(({ id, etichetta, breve, numero, icona: Icona, urgenti }) => (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={scheda === id}
                            onClick={() => scegli(id)}
                            className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors ${scheda === id ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Icona className="hidden sm:block w-4 h-4" />
                            <span className="sm:hidden">{breve || etichetta}</span>
                            <span className="hidden sm:inline">{etichetta}</span>
                            <span className="tabular-nums text-xs text-muted-foreground">{numero}</span>
                            {urgenti > 0 && <span className="rounded-full bg-red-100 px-1.5 text-[11px] font-semibold text-red-700" title="Oltre il termine">{urgenti}</span>}
                        </button>
                    ))}
                </div>

                {scheda === 'immobili' && <SchedaImmobili modello={modello} />}
                {scheda === 'contratti' && <SchedaContratti righe={righe} />}
                {scheda === 'registrazioni' && <SchedaRegistrazioni coda={coda} />}

                <NotaMockup>
                    <p>Richieste di ricevuta ed estremi inseriti restano in questo browser: le aree di proprietario e inquilino li vedranno col database.</p>
                    <button type="button" className="underline font-medium mt-2" onClick={() => { ripristinaAnagraficaDemo(); toast.success('Anagrafica demo ripristinata'); }}>
                        Ripristina l’anagrafica demo
                    </button>
                </NotaMockup>
            </div>
        </>
    );
};

export default ContrattiPage;
