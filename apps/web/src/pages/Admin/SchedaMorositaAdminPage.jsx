import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Home, Lock, ShieldCheck, ShieldOff, UserRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import AccessoLimitato from '@/components/admin/garanzia/AccessoLimitato';
import Chip from '@/components/admin/garanzia/Chip';
import ContattiPratica from '@/components/admin/garanzia/ContattiPratica';
import CronologiaPratica from '@/components/admin/garanzia/CronologiaPratica';
import NotaGaranzia from '@/components/admin/garanzia/NotaGaranzia';
import NoteInterne from '@/components/admin/garanzia/NoteInterne';
import PassaggioLegale from '@/components/admin/garanzia/PassaggioLegale';
import PianoRientro from '@/components/admin/garanzia/PianoRientro';
import TerminiPratica from '@/components/admin/garanzia/TerminiPratica';
import Traccia from '@/components/admin/garanzia/Traccia';
import { STATO_INDENNIZZO, STATO_PRATICA, mesiPratica, nomeAvvocato, prossimoPasso } from '@/components/admin/garanzia/stati';
import { MOROSITA } from '@/data/pratiche';
import { FUNZIONI, nomeOperatore } from '@/data/operatori';
import { COLORE_PRODOTTO, fmtEuro, nomeProdotto } from '@/data/catalogo';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { dalGiorno, ilGiorno, simulaAccettazionePiano, simulaPagamentoRata, useGaranzia, vedeFascicolo, vistaGaranzia } from '@/lib/garanziaDemo';
import { COPERTURA } from '@/lib/etichette';
import { fmtDataLunga, nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// O-15 — SCHEDA DELLA PRATICA DI MOROSITÀ, con dentro il piano di rientro (O-16).
// La stessa pratica che proprietario (P-16) e inquilina (I-09) vedono dalle
// loro aree, più quello che resta a CRIA: il gestore titolare, i contatti con
// data, ora, canale ed esito, le note interne, chi ha proposto e chi ha
// approvato, i termini e il passaggio al legale.
// Contatti, recapiti e note li vede solo chi ha la pratica in coda.
// ═════════════════════════════════════════════════════════════════════════════

const ELENCO = '/dashboard/admin/morosita';

const Voce = ({ etichetta, children, className = '' }) => (
    <div className={className}>
        <p className="text-xs text-muted-foreground mb-0.5">{etichetta}</p>
        <div className="font-medium text-foreground">{children}</div>
    </div>
);

const Adesso = ({ p }) => {
    const passo = prossimoPasso(p);
    const Icona = p.stato === 'chiusa' ? CheckCircle2 : passo.urgente ? AlertTriangle : Clock;
    return (
        <Card className={p.stato === 'chiusa' ? 'border-green-300 bg-green-50/40' : passo.urgente ? 'border-red-300 bg-red-50/40' : 'border-[#1A2D52]/30'}>
            <CardContent className="pt-5 pb-5 flex items-start gap-4">
                <Icona className={`w-6 h-6 flex-shrink-0 ${p.stato === 'chiusa' ? 'text-green-600' : passo.urgente ? 'text-red-600' : 'text-[#1A2D52]'}`} aria-hidden="true" />
                <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Adesso{passo.funzione ? ` · tocca a: ${FUNZIONI[passo.funzione].etichetta.toLowerCase()}` : ''}
                    </p>
                    <p className="text-sm text-foreground mt-0.5">{passo.testo}</p>
                </div>
            </CardContent>
        </Card>
    );
};

const ChiSeNeOccupa = ({ p }) => {
    const condivisa = MOROSITA.find(m => m.id === p.id);
    return (
        <Card>
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><UserRound className="w-5 h-5" /> Chi se ne occupa</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
                <Voce etichetta="Gestore titolare">
                    {nomeOperatore(p.gestoreId)}
                    <span className="block text-xs font-normal text-muted-foreground">
                        {dalGiorno(p.assegnataIl)} · {p.assegnazione === 'automatica' ? 'assegnazione automatica' : 'assegnata dal responsabile'}
                    </span>
                </Voce>
                <Voce etichetta="Approva i piani e decide il passaggio al legale">{nomeOperatore('laura')}</Voce>
                {p.stato === 'al_legale' && (
                    <Voce etichetta="Avvocato esterno">
                        {nomeAvvocato(p.legale.avvocatoId)}
                        <span className="block text-xs font-normal text-muted-foreground">{dalGiorno(p.legale.decisoIl)}</span>
                    </Voce>
                )}
                {condivisa && (
                    <p className="text-xs text-muted-foreground pt-3 border-t border-border flex items-start gap-1.5">
                        <Lock className="w-3.5 h-3.5 mt-px flex-shrink-0" aria-hidden="true" />
                        Proprietario e inquilino leggono «{condivisa.gestore}», non il nome del gestore.
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

const ContrattoECopertura = ({ p, fascicolo }) => {
    const c = p.contratto;
    const m = p.mesiDati[0];
    return (
        <Card>
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Home className="w-5 h-5" /> Contratto e copertura</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <Voce etichetta="Immobile" className="col-span-2">
                    {c.immobile.indirizzo}, {c.immobile.citta}
                    <span className="block text-xs font-normal text-muted-foreground font-mono">{c.codiceUnivoco}</span>
                </Voce>
                <Voce etichetta="Proprietario">{c.locatore.nome}</Voce>
                <Voce etichetta="Inquilino">
                    {c.conduttore.nome}
                    {fascicolo ? (
                        <>
                            <span className="block text-xs font-normal text-muted-foreground">{c.conduttore.telefono}</span>
                            <span className="block text-xs font-normal text-muted-foreground break-words">{c.conduttore.email}</span>
                        </>
                    ) : <span className="block text-xs font-normal text-muted-foreground">Recapiti al gestore titolare</span>}
                </Voce>
                <Voce etichetta="Prodotto" className="col-span-2">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${COLORE_PRODOTTO[c.prodotto]}`}>{nomeProdotto(c.prodotto)}</span>
                    <span className="block text-xs font-normal text-muted-foreground mt-1">
                        Canone {fmtEuro(c.canone)} al mese
                        {p.prodotto.garanzia && ` · franchigia di ${p.prodotto.franchigiaMesi} ${p.prodotto.franchigiaMesi === 1 ? 'mese' : 'mesi'} da ${nomeMese(c.attivoDal).toLowerCase()}`}
                    </span>
                </Voce>
                {m && (
                    <Voce etichetta={nomeMese(m.mese)} className="col-span-2">
                        <span className="block text-sm font-normal text-muted-foreground">
                            Segnalato non pagato {ilGiorno(m.segnalazione.il)} · chiuso senza incasso {ilGiorno(p.chiusuraMese)}
                            {m.pagatoIl ? ` · pagato ${ilGiorno(m.pagatoIl)}` : ''}
                        </span>
                        {COPERTURA[m.copertura] && <Chip stato={COPERTURA[m.copertura]} className="mt-1.5" />}
                    </Voce>
                )}
            </CardContent>
        </Card>
    );
};

const IndennizzoPratica = ({ p }) => {
    const i = p.indennizzo;
    const garanzia = p.prodotto.garanzia;
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    {garanzia ? <ShieldCheck className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />} Indennizzo al proprietario
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                {i ? (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-foreground tabular-nums">{fmtEuro(i.importo)} · {nomeMese(i.mese).toLowerCase()}</p>
                            <Chip stato={STATO_INDENNIZZO[i.stato]} />
                        </div>
                        <Traccia
                            passi={[
                                { etichetta: 'Disposto', chi: i.dispostoDa, il: i.dispostoIl, attesa: 'dalla funzione indennizzi' },
                                { etichetta: 'Autorizzato', chi: i.autorizzatoDa, il: i.autorizzatoIl, attesa: 'dalla responsabile amministrativa' },
                                { etichetta: 'Pagato', chi: i.eseguitoDa, il: i.pagatoIl, attesa: 'con bonifico della tesoreria' },
                            ]}
                            rimandi={i.rimandi}
                        />
                        <Link to="/dashboard/admin/indennizzi" className="inline-flex items-center gap-1 text-primary hover:underline">Apri in Indennizzi <ArrowRight className="w-3.5 h-3.5" /></Link>
                    </>
                ) : (
                    <p className="text-muted-foreground">
                        {!garanzia ? `${nomeProdotto(p.contratto.prodotto)} non ha garanzia: nessun indennizzo.`
                            : p.copertura !== 'attiva' ? 'Il mese non è coperto: nessun indennizzo, ma il recupero va avanti lo stesso.'
                                : p.stato === 'chiusa' ? 'Nessun indennizzo: il canone è arrivato prima.' : 'Nessun indennizzo registrato.'}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

// Solo nei mockup: quello che farebbe l'inquilino dalla sua area, o gli incassi.
const simulazionePratica = (p) => {
    const piano = p.pianoAttivo;
    const esito = (r, testo) => (r.ok ? toast.success(testo) : toast.error(r.motivo));
    if (piano?.stato === 'approvato') {
        return (
            <button type="button" className="underline font-medium text-left" onClick={() => esito(simulaAccettazionePiano(piano), 'Piano accettato dall’inquilino')}>
                Simula: l’inquilino accetta il piano dalla sua area
            </button>
        );
    }
    if (piano?.stato === 'in_corso' && piano.prossima) {
        return (
            <button type="button" className="underline font-medium text-left" onClick={() => esito(simulaPagamentoRata(piano, piano.prossima.n), `Rata ${piano.prossima.n} arrivata: ${fmtEuro(piano.prossima.importo)} rientrati`)}>
                Simula: arriva la rata {piano.prossima.n} ({fmtEuro(piano.prossima.importo)}), riconciliata dagli incassi
            </button>
        );
    }
    return null;
};

const SchedaMorositaAdminPage = () => {
    const { id } = useParams();
    const { operatore } = useOperatoreAttivo();
    const { pratiche } = useGaranzia();
    const p = pratiche.find(x => x.id === id);
    const vista = vistaGaranzia(operatore.funzione, 'morosita');

    if (!p) {
        return (
            <div className="space-y-6">
                <Helmet><title>Pratica di morosità - CRIA</title></Helmet>
                <IntestazionePagina titolo="Pratica non trovata" indietro={{ to: ELENCO, label: 'Pratiche di morosità' }} />
                <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nessuna pratica di morosità con questo codice.</CardContent></Card>
            </div>
        );
    }

    if (vista !== 'dettaglio') {
        return (
            <div className="space-y-6">
                <Helmet><title>Pratica di morosità - CRIA</title></Helmet>
                <IntestazionePagina titolo="Pratica di morosità" indietro={{ to: ELENCO, label: 'Pratiche di morosità' }} />
                <AccessoLimitato vista={vista} sezione="morosita" />
            </div>
        );
    }

    const fascicolo = vedeFascicolo(operatore, p);
    const c = p.contratto;
    const fasi = [...p.fasi, ...(p.indennizzo?.fasi || [])];

    return (
        <>
            <Helmet><title>{`Morosità ${c.immobile.indirizzo} - CRIA`}</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    indietro={{ to: ELENCO, label: 'Pratiche di morosità' }}
                    titolo={`${c.immobile.indirizzo} · ${mesiPratica(p)}`}
                    sottotitolo={`${c.conduttore.nome} · ${fmtEuro(p.importo)} · aperta il ${fmtDataLunga(p.apertaIl)}${p.recuperato ? ` · rientrati ${fmtEuro(p.recuperato)}` : ''}`}
                    badge={<Chip stato={STATO_PRATICA[p.stato]} className="text-sm px-3 py-1" />}
                />

                <Adesso p={p} />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6 min-w-0">
                        {fascicolo ? <ContattiPratica pratica={p} /> : (
                            <Card>
                                <CardContent className="py-6 flex items-start gap-3 text-sm text-muted-foreground">
                                    <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                    <p>
                                        Contatti con l’inquilino, recapiti e note interne li vedono il gestore titolare ({nomeOperatore(p.gestoreId)}) e la
                                        responsabile legale. {p.primoContatto ? `Primo contatto registrato ${ilGiorno(p.primoContatto.il)}.` : 'Primo contatto non ancora fatto.'}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                        <PianoRientro pratica={p} />
                        <CronologiaPratica pratica={p} />
                    </div>

                    <div className="space-y-6 min-w-0">
                        <ChiSeNeOccupa p={p} />
                        <ContrattoECopertura p={p} fascicolo={fascicolo} />
                        <TerminiPratica fasi={fasi} />
                        <IndennizzoPratica p={p} />
                        <PassaggioLegale pratica={p} />
                        {fascicolo && <NoteInterne pratica={p} />}
                    </div>
                </div>

                <NotaGaranzia>{simulazionePratica(p)}</NotaGaranzia>
            </div>
        </>
    );
};

export default SchedaMorositaAdminPage;
