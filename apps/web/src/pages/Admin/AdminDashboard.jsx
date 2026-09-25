import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, Banknote, Home, ListChecks, MapPin, Receipt, ShieldCheck, TrendingUp, UserRound, Users, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import NotaMockup from '@/components/NotaMockup';
import MappaImmobiliCria from '@/components/admin/MappaImmobiliCria';
import { righeDelMese, totaliDelMese } from '@/components/admin/incassi/CanoniMese';
import { OGGI } from '@/data/datiDemo';
import { fmtEuro } from '@/data/catalogo';
import { fmtDataLunga, nomeMese } from '@/lib/formato';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { useAnagrafica } from '@/lib/anagraficheDemo';
import { useCicloMensile, MESE_CORRENTE } from '@/lib/incassiDemo';
import { useTutteLePratiche } from '@/lib/praticheDemo';
import { useTutteLeVerifiche } from '@/lib/verificheDemo';
import { useTutteLeAutocandidature } from '@/lib/autocandidatureDemo';
import { numeriAzienda } from '@/lib/aggregati';

// ═════════════════════════════════════════════════════════════════════════════
// O-01 — PANORAMICA
// Come va l'azienda, non come va il lavoro: fatturato, entrate, uscite, canoni
// del mese, quante persone ci sono e dove stanno gli immobili. I numeri sono
// gli stessi della Contabilità (O-27) e dei Pagamenti (O-11), solo riassunti.
// Le code, gli avvisi e le regole di ogni funzione stanno in «Il lavoro di
// oggi» (O-34): sono due cose diverse e stanno in due pagine diverse.
// Per ora questa pagina la apre l'admin; gli altri entrano nel loro lavoro.
// ═════════════════════════════════════════════════════════════════════════════

const PERCORSO_LAVORO = '/dashboard/admin/lavoro';
const SENZA_ACCOUNT = ['senza_account', 'invitato'];

// In panoramica gli euro sono tondi: i centesimi stanno in Contabilità.
const euro = (n) => fmtEuro(Math.round(n));

const plurale = (n, uno, molti) => `${n} ${n === 1 ? uno : molti}`;

// «2.350 € canoni · 1.252 € prodotti»: le voci a zero non si scrivono.
const dettaglio = (voci) => voci.filter(([importo]) => importo > 0).map(([importo, cosa]) => `${euro(importo)} ${cosa}`).join(' · ');

// Le persone si contano sulle anagrafiche, come in Utenti (O-02): un soggetto
// è proprietario o inquilino per i contratti che ha, non per come è nato.
const contaPersone = (modello) => {
    const soggetti = modello.attivi;
    const conLegame = (id) => soggetti.filter(s => s.legami.some(l => l.id === id)).length;
    return {
        utenti: soggetti.filter(s => !SENZA_ACCOUNT.includes(s.account.stato)).length,
        soggetti: soggetti.length,
        proprietari: conLegame('proprietario'),
        inquilini: conLegame('inquilino'),
        clientiVerifica: conLegame('cliente_verifica'),
    };
};

const ContatoreLink = ({ percorso, ...resto }) => (
    <Link to={percorso} className="block rounded-xl transition hover:shadow-sm">
        <Contatore {...resto} />
    </Link>
);

const ImmobiliSullaMappa = ({ modello }) => {
    const conContratto = modello.immobili.filter(i => i.contratti.length > 0).length;
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4" /> Gli immobili</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <MappaImmobiliCria altezza={380} />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{modello.immobili.length} immobili · {conContratto} con un contratto · {modello.immobili.length - conContratto} in pratica. Il colore è il semaforo del contratto.</span>
                    <Link to="/dashboard/admin/contratti" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
                        Tutti gli immobili <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};

const Sezione = ({ titolo, nota, children }) => (
    <section className="space-y-3">
        <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{titolo}</h2>
            {nota && <p className="text-xs text-muted-foreground mt-0.5">{nota}</p>}
        </div>
        {children}
    </section>
);

const PanoramicaAzienda = () => {
    const pratiche = useTutteLePratiche();
    const verifiche = useTutteLeVerifiche();
    const autocandidature = useTutteLeAutocandidature();
    const ciclo = useCicloMensile();
    const modello = useAnagrafica();

    const soldi = useMemo(
        () => numeriAzienda({ mese: MESE_CORRENTE, pratiche, verifiche, autocandidature }),
        [pratiche, verifiche, autocandidature],
    );
    const canoni = useMemo(
        () => totaliDelMese(righeDelMese(ciclo.contratti, MESE_CORRENTE, ciclo.movimenti)),
        [ciclo],
    );
    const persone = useMemo(() => contaPersone(modello), [modello]);

    const mese = nomeMese(MESE_CORRENTE).toLowerCase();
    const arrivati = canoni.ricevutiCria + canoni.ricevutiProprietario;

    return (
        <div className="space-y-6">
            <Helmet><title>Panoramica - CRIA</title></Helmet>
            <IntestazionePagina
                titolo="Panoramica"
                sottotitolo={`Come sta andando CRIA: i numeri di ${mese} e gli immobili. Oggi è il ${fmtDataLunga(OGGI)}.`}
                azioni={(
                    <Button asChild size="sm" variant="outline" className="gap-2">
                        <Link to={PERCORSO_LAVORO}><ListChecks className="w-4 h-4" /> Il lavoro di oggi</Link>
                    </Button>
                )}
            />

            <Sezione titolo={`I soldi di ${mese}`} nota="Il fatturato è di competenza: entrate e uscite sono i soldi che si muovono davvero. I conti per esteso stanno in Contabilità.">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <ContatoreLink percorso="/dashboard/admin/contabilita" icona={TrendingUp} colore="bg-[#1A2D52]"
                        etichetta="Fatturato" valore={euro(soldi.fatturato)} nota="commissioni, quote e prodotti venduti" />
                    <ContatoreLink percorso="/dashboard/admin/contabilita" icona={Wallet} colore="bg-emerald-600"
                        etichetta="Entrate" valore={euro(soldi.entrate.totale)}
                        nota={dettaglio([[soldi.entrate.canoni, 'canoni'], [soldi.entrate.prodotti, 'prodotti'], [soldi.entrate.recuperi, 'rate rientrate']])} />
                    <ContatoreLink percorso="/dashboard/admin/bonifici" icona={Banknote} colore="bg-amber-500"
                        etichetta="Uscite" valore={euro(soldi.uscite.totale)}
                        nota={dettaglio([[soldi.uscite.girati, 'ai proprietari'], [soldi.uscite.indennizzi, 'indennizzi'], [soldi.uscite.provvigioni + soldi.uscite.premio, 'provvigioni e premio']])} />
                    <ContatoreLink percorso="/dashboard/admin/pagamenti" icona={Receipt} colore="bg-blue-500"
                        etichetta="Canoni arrivati" valore={euro(arrivati)}
                        nota={`su ${euro(canoni.attesi)} attesi${canoni.nonRilevati ? ` · ${plurale(canoni.nonRilevati, 'non rilevato', 'non rilevati')}` : ''}`} />
                </div>
            </Sezione>

            <Sezione titolo="Le persone" nota="Chi ha un account e che posizione ha sui contratti. L'elenco completo è in Utenti.">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <ContatoreLink percorso="/dashboard/admin/clienti" icona={Users} colore="bg-[#1A2D52]"
                        etichetta="Utenti" valore={persone.utenti} nota={`su ${persone.soggetti} soggetti conosciuti`} />
                    <ContatoreLink percorso="/dashboard/admin/clienti" icona={Home} colore="bg-blue-500"
                        etichetta="Proprietari" valore={persone.proprietari} nota="con un immobile su CRIA" />
                    <ContatoreLink percorso="/dashboard/admin/clienti" icona={UserRound} colore="bg-emerald-600"
                        etichetta="Inquilini" valore={persone.inquilini} nota="in un contratto seguito da CRIA" />
                    <ContatoreLink percorso="/dashboard/admin/clienti" icona={ShieldCheck} colore="bg-violet-500"
                        etichetta="Clienti Verifica" valore={persone.clientiVerifica} nota="hanno comprato CRIA Verifica" />
                </div>
            </Sezione>

            <ImmobiliSullaMappa modello={modello} />

            <NotaMockup>
                I numeri si calcolano dai contratti, dalle pratiche e dalle persone dei dati di prova: sono gli stessi che trovi
                in Contabilità, Pagamenti e Utenti. Le code e gli avvisi di ogni funzione stanno in «Il lavoro di oggi».
            </NotaMockup>
        </div>
    );
};

// ─── La pagina ────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const { operatore } = useOperatoreAttivo();
    // Per ora i numeri dell'azienda li apre l'admin: gli altri entrano nel loro lavoro.
    if (operatore.funzione !== 'admin') return <Navigate to={PERCORSO_LAVORO} replace />;
    return <PanoramicaAzienda />;
};

export default AdminDashboard;
