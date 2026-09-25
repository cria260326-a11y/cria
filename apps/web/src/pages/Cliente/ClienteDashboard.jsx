import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Search, Clock, ChevronRight, Wallet, ArrowRight, Sparkles, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import StatusBadge from '@/components/StatusBadge.jsx';
import NotaMockup from '@/components/NotaMockup';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useVerifiche, ripristinaVerificheDemo } from '@/lib/verificheDemo';
import { mascheraCodiceFiscale } from '@/lib/certificatiDemo';
import { STATO_VERIFICA, esitoEntro, nomeCandidato, statoCredito, testoCredito } from '@/data/verifiche';
import { PRODOTTI, fmtEuro } from '@/data/catalogo';
import { SEMAFORO } from '@/lib/semaforo';
import { fmtData } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// LE TUE VERIFICHE — E-04 (area cliente, CRIA Verifica)
// Le richieste della persona, le più recenti prima: candidato con il codice
// fiscale mascherato, data, stato, esito e credito. Ogni riga apre l'esito
// (E-05). La chiamata alla Consulenza (P4) resta finché il business non decide
// su P4.
// ═════════════════════════════════════════════════════════════════════════════

const P3 = PRODOTTI.P3;

// P4 acquistato ma onboarding non ancora avviato → mostra CTA
const CONSULENZA_ATTIVA = {
    acquistata: true,
    dataAcquisto: '2026-04-20',
    onboardingAvviato: false,
};

// ─── Una riga dell'elenco ─────────────────────────────────────────────────────
const Indicatore = ({ v }) => {
    if (v.stato !== 'conclusa') {
        return (
            <span className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <Clock className="w-5 h-5 text-blue-700" />
            </span>
        );
    }
    if (v.esito?.tipo === 'semaforo') {
        return (
            <span className="w-10 h-10 rounded-full bg-white border border-border shadow-sm flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <span className="w-5 h-5 rounded-full" style={{ background: SEMAFORO[v.esito.semaforo]?.colore }} />
            </span>
        );
    }
    return (
        <span className="w-10 h-10 rounded-full border border-dashed border-muted-foreground/40 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <Search className="w-5 h-5 text-muted-foreground" />
        </span>
    );
};

// «In corso · esito entro …»: il bollino resta corto, così sul telefono non va a capo.
const ChipStato = ({ v }) => {
    const s = STATO_VERIFICA[v.stato];
    return (
        <>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.classe}`}>{s.etichetta}</span>
            {v.stato === 'in_corso' && <span className="text-xs text-blue-800">esito entro il {fmtData(esitoEntro(v))}</span>}
        </>
    );
};

const EsitoBreve = ({ esito }) => (esito?.tipo === 'semaforo'
    ? <StatusBadge status={esito.semaforo} />
    : (
        <span className="inline-flex items-center rounded-md border border-dashed border-muted-foreground/40 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            Nessuna informazione
        </span>
    ));

const RigaVerifica = ({ v }) => {
    const disponibile = statoCredito(v) === 'disponibile';
    return (
        <li>
            <Link
                to={`/dashboard/cliente/richieste/${v.id}`}
                className="flex items-center gap-4 p-4 sm:p-5 hover:bg-muted/40 focus-visible:outline-none focus-visible:bg-muted/40 transition-colors"
            >
                <Indicatore v={v} />
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <span className="font-semibold text-foreground">{nomeCandidato(v.soggetto)}</span>
                        <span className="font-mono text-xs tracking-wider text-muted-foreground">{mascheraCodiceFiscale(v.soggetto.codiceFiscale)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <ChipStato v={v} />
                        {v.stato === 'conclusa' && <EsitoBreve esito={v.esito} />}
                    </div>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>Richiesta il {fmtData(v.richiestaIl)}</span>
                        <span className={`inline-flex items-center gap-1.5 ${disponibile ? 'text-green-800' : ''}`}>
                            <Wallet className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" /> {testoCredito(v)}
                        </span>
                    </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
            </Link>
        </li>
    );
};

// ═════════════════════════════════════════════════════════════════════════════
const ClienteDashboard = () => {
    const navigate = useNavigate();
    const { persona } = useAuth();
    const { verifiche } = useVerifiche(persona?.id);

    const ripristina = () => {
        ripristinaVerificheDemo();
        toast.success('Verifiche demo ripristinate');
    };

    const nuovaVerifica = (
        <Button asChild className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]">
            <Link to="/verifica/nuova"><Plus /> Nuova verifica</Link>
        </Button>
    );

    return (
        <>
            <Helmet><title>Le tue verifiche - CRIA</title></Helmet>

            <div className="space-y-8">
                <IntestazionePagina
                    titolo="Le tue verifiche"
                    sottotitolo={`${P3.nome} sui tuoi candidati inquilini: l’esito arriva entro ${P3.oreEsito} ore e lo leggi qui.`}
                    azioni={nuovaVerifica}
                />

                {/* ── CTA Consulenza P4: onboarding abilitato ──────────────── */}
                {CONSULENZA_ATTIVA.acquistata && !CONSULENZA_ATTIVA.onboardingAvviato && (
                    <Card className="border-[#C97B5C]/40 bg-gradient-to-br from-[#C97B5C]/5 to-transparent">
                        <CardContent className="pt-6 pb-6">
                            <div className="flex items-start gap-4 flex-wrap">
                                <div className="p-3 bg-[#C97B5C]/10 rounded-xl flex-shrink-0">
                                    <Sparkles className="w-6 h-6 text-[#C97B5C]" />
                                </div>
                                <div className="flex-1 min-w-48">
                                    <h3 className="font-semibold text-foreground mb-1">
                                        Consulenza attiva — puoi avviare l'onboarding
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Hai acquistato la Consulenza CRIA il {fmtData(CONSULENZA_ATTIVA.dataAcquisto)}.
                                        Ora puoi iniziare l'onboarding per attivare {PRODOTTI.P1.nome} o {PRODOTTI.P2.nome}
                                        {' '}sui tuoi immobili.
                                    </p>
                                    <Button
                                        className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]"
                                        onClick={() => navigate('/onboarding')}
                                    >
                                        Inizia l'onboarding <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ── Le verifiche (P3) ────────────────────────────────────── */}
                <section className="space-y-3" aria-label="Elenco delle verifiche">
                    {verifiche.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 flex flex-col items-center text-center gap-4">
                                <span className="w-14 h-14 rounded-full bg-[#1A2D52]/5 flex items-center justify-center">
                                    <Search className="w-7 h-7 text-[#1A2D52]" />
                                </span>
                                <div className="space-y-1.5 max-w-md">
                                    <p className="text-lg font-semibold text-foreground">Non hai ancora richiesto verifiche</p>
                                    <p className="text-sm text-muted-foreground">
                                        Scrivi i dati del candidato e paga {fmtEuro(P3.prezzo)}: entro {P3.oreEsito} ore l’esito lo leggi qui.
                                    </p>
                                </div>
                                {nuovaVerifica}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <ul className="divide-y divide-border">
                                    {verifiche.map(v => <RigaVerifica key={v.id} v={v} />)}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                        <Wallet className="w-5 h-5 text-[#1A2D52] flex-shrink-0 mt-0.5" />
                        <div className="text-sm space-y-1">
                            <p className="font-medium text-foreground">I {fmtEuro(P3.prezzo)} di ogni verifica diventano un credito</p>
                            <p className="text-muted-foreground">
                                Lo scaliamo dal primo prodotto che acquisti con questo account entro {P3.scalabileEntroGiorni} giorni
                                dalla richiesta. Ogni acquisto scala una sola verifica.
                            </p>
                            <Link to="/scegli-prodotto" className="inline-flex items-center gap-1 text-primary hover:underline">
                                Vedi i prodotti <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </section>

                <NotaMockup>
                    <p>Le verifiche che richiedi e gli esiti che simuli restano in questo browser.</p>
                    <Button size="sm" variant="outline" className="mt-3 gap-2 bg-white" onClick={ripristina}>
                        <RotateCcw className="w-3.5 h-3.5" /> Ripristina le verifiche demo
                    </Button>
                </NotaMockup>
            </div>
        </>
    );
};

export default ClienteDashboard;
