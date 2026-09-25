import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle, ChevronRight, Clock, Euro, ListChecks, PauseCircle, PhoneCall, ShieldAlert, Timer, UserRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import AccessoLimitato from '@/components/admin/garanzia/AccessoLimitato';
import Chip from '@/components/admin/garanzia/Chip';
import NotaGaranzia from '@/components/admin/garanzia/NotaGaranzia';
import Schede from '@/components/admin/garanzia/Schede';
import { STATO_FASE, STATO_PRATICA, mesiPratica, prossimoPasso, testoPrimoContatto } from '@/components/admin/garanzia/stati';
import { OGGI } from '@/data/datiDemo';
import { nomeOperatore } from '@/data/operatori';
import { COLORE_PRODOTTO, PARAMETRI, fmtEuro, nomeProdotto } from '@/data/catalogo';
import { TERMINI } from '@/data/garanzia';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { apriPraticaDaContestazione, ilGiorno, ilGiornoDelMese, useGaranzia, vistaGaranzia } from '@/lib/garanziaDemo';
import { COPERTURA } from '@/lib/etichette';
import { etichettaCalendario, giorniSolariTra } from '@/lib/calendario';
import { fmtData, nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// O-14 — PRATICHE DI MOROSITÀ
// Una pratica si apre quando il mese si chiude senza incasso (flusso 4.4) e ha
// un gestore titolare che la segue fino alla chiusura. In testa l'indicatore
// che conta più di tutti: il tempo dalla chiusura del mese al primo contatto
// con l'inquilino (§13.6). Sotto, i mesi non pagati che una pratica non ce
// l'hanno, e perché.
// ═════════════════════════════════════════════════════════════════════════════

const CONTESTAZIONE_DEMO = 'con-verdi5-2026-09';
const fmtGiorni = (n) => (n == null ? '—' : `${n.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} giorni`);

const RigaPratica = ({ p }) => {
    const c = p.contratto;
    const passo = prossimoPasso(p);
    const primo = testoPrimoContatto(p);
    const fasePrimo = p.fasi.find(f => f.chiave === 'primo_contatto');
    return (
        <li>
            <Link to={`/dashboard/admin/morosita/${p.id}`} className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-muted/40 focus-visible:outline-none focus-visible:bg-muted/40 transition-colors">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${passo.urgente ? 'bg-red-50' : 'bg-muted'}`} aria-hidden="true">
                    {passo.urgente ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <ShieldAlert className="w-4 h-4 text-muted-foreground" />}
                </span>
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-semibold text-foreground">{c.immobile.indirizzo} · {mesiPratica(p)}</span>
                        <Chip stato={STATO_PRATICA[p.stato]} />
                    </div>
                    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>{c.conduttore.nome} · {fmtEuro(p.importo)}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${COLORE_PRODOTTO[c.prodotto]}`}>{nomeProdotto(c.prodotto)}</span>
                        {COPERTURA[p.copertura] && <Chip stato={COPERTURA[p.copertura]} className="text-[11px] px-2" />}
                    </p>
                    <p className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                        <span className="inline-flex items-center gap-1"><UserRound className="w-3.5 h-3.5" aria-hidden="true" /> Gestore titolare: {nomeOperatore(p.gestoreId)}</span>
                        <span>Aperta {ilGiorno(p.apertaIl)}</span>
                    </p>
                    {primo && (
                        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5 mt-px flex-shrink-0" aria-hidden="true" />
                            <span>
                                {primo}{p.primoContatto && p.stato !== 'chiusa' ? ` · ${giorniSolariTra(p.primoContatto.il, OGGI)} giorni fa` : ''}
                                {p.primoContatto && <Chip stato={STATO_FASE[fasePrimo.stato]} className="ml-2 text-[11px] px-2" />}
                            </span>
                        </p>
                    )}
                    <p className={`text-sm ${passo.urgente ? 'text-red-700 font-medium' : 'text-foreground'}`}>{passo.testo}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-2" aria-hidden="true" />
            </Link>
        </li>
    );
};

// Perché un mese segnalato non pagato non ha (ancora) una pratica.
const motivoSenzaPratica = ({ contratto: c, mese: m, motivo, contestazione: k }) => {
    switch (motivo) {
        case 'contestazione':
            return {
                icona: PauseCircle,
                testo: `L’inquilino ha contestato la segnalazione ${ilGiorno(k.apertaIl)}: finché CRIA non decide (entro ${ilGiorno(k.rispostaEntro)}) la pratica resta ferma. Se decide per il proprietario, parte ${m.copertura === 'attiva' ? 'con la copertura attiva' : 'senza copertura'}.`,
                link: { to: `/dashboard/admin/contestazioni/${k.id}`, testo: 'Apri la contestazione' },
            };
        case 'senza_garanzia':
            return {
                icona: ShieldAlert,
                testo: `${nomeProdotto(c.prodotto)}: senza garanzia né recupero, il mese conta solo per il semaforo${m.scadenzaContestazione && m.stato === 'in_attesa' ? `, quando si chiude la finestra per contestare (${fmtData(m.scadenzaContestazione)})` : ''}.`,
            };
        case 'contestabile':
            return { icona: Clock, testo: `L’inquilino può contestare fino al ${fmtData(m.scadenzaContestazione)}: se il mese resta senza incasso, la pratica si apre dopo.` };
        default:
            return { icona: AlertTriangle, testo: `Mese chiuso senza incasso ${ilGiornoDelMese(PARAMETRI.giornoChiusuraMese)} e nessuna pratica aperta: va aperta subito.` };
    }
};

const MorositaAdminPage = () => {
    const { operatore } = useOperatoreAttivo();
    const g = useGaranzia();
    const vista = vistaGaranzia(operatore.funzione, 'morosita');
    const [scheda, setScheda] = useState('aperte');

    const aperte = g.pratiche.filter(p => p.stato !== 'chiusa');
    const chiuse = g.pratiche.filter(p => p.stato === 'chiusa');
    const daContattare = aperte.filter(p => !p.primoContatto);
    const residuo = aperte.reduce((t, p) => t + p.importo - p.recuperato, 0);
    const elenco = { aperte, chiuse, tutte: g.pratiche }[scheda];
    const { primoContatto, fasi } = g.indicatori;
    const trimestre = g.trimestreInCorso;
    const demoAperta = g.pratiche.some(p => p.sospensione?.contestazioneId === CONTESTAZIONE_DEMO);

    const simula = () => {
        const r = apriPraticaDaContestazione(CONTESTAZIONE_DEMO);
        if (r.ok) toast.success('Contestazione decisa per il proprietario: pratica aperta e assegnata a Giorgio Fontana');
        else toast.error(r.motivo);
    };

    return (
        <>
            <Helmet><title>Pratiche di morosità - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Pratiche di morosità"
                    sottotitolo={`Si apre una pratica quando il mese si chiude senza incasso, il giorno ${PARAMETRI.giornoChiusuraMese}. Il gestore titolare la segue fino alla chiusura.`}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Contatore etichetta="Pratiche aperte" valore={aperte.length} icona={ShieldAlert} colore="bg-red-500"
                        nota={daContattare.length ? `${daContattare.length} senza primo contatto` : 'Tutti gli inquilini contattati'} />
                    <Contatore etichetta="Tempo medio al primo contatto" valore={fmtGiorni(primoContatto.media)} icona={Timer} colore="bg-[#1A2D52]"
                        nota={`Dalla chiusura del mese, ultimi 12 mesi · nel trimestre ${fmtGiorni(trimestre.primoContatto.media)}`} />
                    <Contatore etichetta="Fasi chiuse nel termine" valore={fasi.percentuale == null ? '—' : `${fasi.percentuale}%`} icona={ListChecks} colore="bg-green-600"
                        nota={`${fasi.nelTermine} su ${fasi.totale}, ultimi 12 mesi`} />
                    <Contatore etichetta="Da recuperare" valore={fmtEuro(residuo)} icona={Euro} colore="bg-amber-500"
                        nota={`Sulle pratiche aperte · ${chiuse.length} chiuse`} />
                </div>

                <p className="text-xs text-muted-foreground">
                    Il primo contatto conta quando l’inquilino risponde, non al primo tentativo: va fatto entro {TERMINI.primo_contatto.giorni} {etichettaCalendario(TERMINI.primo_contatto.calendario)} dall’apertura.
                    È il numero che va al riassicuratore ogni trimestre: un ritardo affrontato subito si recupera con una telefonata.
                </p>

                {vista !== 'dettaglio' ? <AccessoLimitato vista={vista} sezione="morosita" /> : (
                    <>
                        <section className="space-y-3" aria-label="Elenco delle pratiche">
                            <Schede
                                etichetta="Quali pratiche"
                                valore={scheda}
                                onCambia={setScheda}
                                voci={[
                                    { id: 'aperte', etichetta: 'Aperte', conta: aperte.length },
                                    { id: 'chiuse', etichetta: 'Chiuse', conta: chiuse.length },
                                    { id: 'tutte', etichetta: 'Tutte', conta: g.pratiche.length },
                                ]}
                            />
                            <Card>
                                <CardContent className="p-0">
                                    {elenco.length === 0
                                        ? <p className="py-12 text-center text-sm text-muted-foreground">Nessuna pratica qui.</p>
                                        : <ul className="divide-y divide-border">{elenco.map(p => <RigaPratica key={p.id} p={p} />)}</ul>}
                                </CardContent>
                            </Card>
                        </section>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base"><PauseCircle className="w-5 h-5" /> Mesi non pagati senza pratica</CardTitle>
                                <p className="text-xs text-muted-foreground">Segnalati non pagati e ancora senza incasso, ma fermi per una regola: qui il perché.</p>
                            </CardHeader>
                            <CardContent>
                                {g.senzaPratica.length === 0 ? <p className="text-sm text-muted-foreground">Nessuno: ogni mese non pagato ha la sua pratica.</p> : (
                                    <ul className="divide-y divide-border">
                                        {g.senzaPratica.map(x => {
                                            const { icona: Icona, testo, link } = motivoSenzaPratica(x);
                                            return (
                                                <li key={x.id} className="py-3 flex items-start gap-3">
                                                    <Icona className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                                                    <div className="min-w-0 space-y-0.5">
                                                        <p className="text-sm font-medium text-foreground">
                                                            {x.contratto.immobile.indirizzo} · {nomeMese(x.mese.mese).toLowerCase()} · {x.contratto.conduttore.nome} · {fmtEuro(x.contratto.canone)}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">{testo}</p>
                                                        {link && <Link to={link.to} className="text-sm text-primary hover:underline">{link.testo}</Link>}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                <NotaGaranzia>
                    {!demoAperta && (
                        <button type="button" className="underline font-medium text-left" onClick={simula}>
                            Simula: CRIA chiude la contestazione di Via Verdi 5 a favore del proprietario, e la pratica di settembre si apre
                        </button>
                    )}
                </NotaGaranzia>
            </div>
        </>
    );
};

export default MorositaAdminPage;
