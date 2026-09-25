import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
    Clock, Search, SearchX, Wallet, Info, ArrowRight, FlaskConical, CheckCircle2, AlertTriangle, XCircle, Hourglass,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import NotaMockup from '@/components/NotaMockup';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useVerifiche, completaVerificaDemo } from '@/lib/verificheDemo';
import { mascheraCodiceFiscale, INDIRIZZO_VERIFICA, PERCORSO_VERIFICA } from '@/lib/certificatiDemo';
import {
    NESSUNA_INFORMAZIONE, STATO_VERIFICA, esitoEntro, nomeCandidato, statoCredito, giorniAllaScadenza,
} from '@/data/verifiche';
import { PRODOTTI, fmtEuro } from '@/data/catalogo';
import { SEMAFORO } from '@/lib/semaforo';
import { fmtData } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// ESITO DELLA VERIFICA — E-05 (area cliente, CRIA Verifica)
// L'esito si legge solo qui: l'email dice soltanto di accedere. È il semaforo
// con una breve sintesi, oppure «Non abbiamo informazioni in merito», e nient'altro:
// niente mesi, niente importi, niente altri contratti. Sotto, il credito dei
// soldi pagati, con la sua scadenza.
// ═════════════════════════════════════════════════════════════════════════════

const P3 = PRODOTTI.P3;
const INDIETRO = { to: '/dashboard/cliente', label: 'Le tue verifiche' };

const ICONA_SEMAFORO = {
    verde: CheckCircle2,
    giallo: AlertTriangle,
    rosso: XCircle,
    storico_insufficiente: Hourglass,
};

// ─── Candidato e date ─────────────────────────────────────────────────────────
const Dati = ({ v }) => {
    const voci = [
        { etichetta: 'Candidato', valore: nomeCandidato(v.soggetto) },
        { etichetta: 'Codice fiscale', valore: mascheraCodiceFiscale(v.soggetto.codiceFiscale), mono: true },
        { etichetta: 'Richiesta', valore: fmtData(v.richiestaIl) },
        { etichetta: 'Esito', valore: v.stato === 'conclusa' ? fmtData(v.esito?.il) : `entro il ${fmtData(esitoEntro(v))}` },
    ];
    return (
        <Card>
            <CardContent className="py-5">
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                    {voci.map(({ etichetta, valore, mono }) => (
                        <div key={etichetta} className="min-w-0">
                            <dt className="text-xs uppercase tracking-wider text-muted-foreground">{etichetta}</dt>
                            <dd className={`font-semibold text-foreground ${mono ? 'font-mono text-[13px] sm:text-sm sm:tracking-wider whitespace-nowrap' : 'break-words'}`}>{valore}</dd>
                        </div>
                    ))}
                </dl>
            </CardContent>
        </Card>
    );
};

// ─── Esito ────────────────────────────────────────────────────────────────────
const EsitoSemaforo = ({ esito }) => {
    const voce = SEMAFORO[esito.semaforo] || SEMAFORO.storico_insufficiente;
    const Icona = ICONA_SEMAFORO[esito.semaforo] || Hourglass;
    return (
        <Card className={`border ${voce.tenue}`}>
            <CardContent className="pt-6 pb-6 space-y-5">
                <div className="flex items-center gap-4">
                    <span className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: voce.colore }}>
                        <Icona className="w-8 h-8 text-white" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Semaforo</p>
                        <p className="text-2xl font-bold text-foreground">{voce.etichetta}</p>
                        <p className="text-sm text-muted-foreground">{voce.spiegazione}</p>
                    </div>
                </div>
                {esito.sintesi && (
                    <div className="rounded-lg bg-white/80 p-4">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Sintesi</p>
                        <p className="text-sm leading-relaxed text-foreground">{esito.sintesi}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const EsitoNessunaInformazione = () => (
    <Card className="border-2 border-dashed">
        <CardContent className="pt-6 pb-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <span className="w-16 h-16 rounded-full bg-[#1A2D52]/5 flex items-center justify-center flex-shrink-0">
                <Search className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
            </span>
            <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Esito</p>
                <p className="text-xl font-bold text-foreground">«{NESSUNA_INFORMAZIONE}»</p>
                <p className="text-sm text-muted-foreground">
                    CRIA non ha dati di pagamento su questa persona. Non è un esito positivo né negativo: vuol dire soltanto che
                    non c’è uno storico da mostrarti.
                </p>
            </div>
        </CardContent>
    </Card>
);

const InAttesa = ({ v, onSimula }) => (
    <>
        <Card>
            <CardContent className="py-10 flex flex-col items-center text-center gap-4">
                <span className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                    <Clock className="w-7 h-7 text-blue-700" aria-hidden="true" />
                </span>
                <div className="space-y-1.5 max-w-md">
                    <p className="text-lg font-semibold text-foreground">L’esito arriva entro il {fmtData(esitoEntro(v))}</p>
                    <p className="text-sm text-muted-foreground">
                        Entro {P3.oreEsito} ore dalla richiesta. Quando è pronto ti mandiamo un’email che dice solo di accedere:
                        l’esito lo leggi qui, in piattaforma. Niente PDF, niente report per email.
                    </p>
                </div>
            </CardContent>
        </Card>
        <NotaMockup>
            <p>
                In piattaforma l’esito lo prepara CRIA. Qui lo simuli: se il codice fiscale è di un inquilino dei profili demo, il
                semaforo esce dai suoi mesi; per gli altri, un esito plausibile, sempre lo stesso per lo stesso codice fiscale.
            </p>
            <Button size="sm" variant="outline" className="mt-3 gap-2 bg-white" onClick={onSimula}>
                <FlaskConical className="w-3.5 h-3.5" /> Simula l’esito
            </Button>
        </NotaMockup>
    </>
);

// ─── Credito ──────────────────────────────────────────────────────────────────
const BoxCredito = ({ v }) => {
    const stato = statoCredito(v);
    const { importo, scadeIl, usatoIl } = v.credito;

    if (stato === 'disponibile') {
        const giorni = giorniAllaScadenza(v);
        return (
            <div className="rounded-xl border border-green-200 bg-green-50/60 p-5 flex items-start gap-4">
                <span className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 text-green-700" aria-hidden="true" />
                </span>
                <div className="flex-1 space-y-2 text-sm min-w-0">
                    <p className="text-foreground">
                        <span className="font-semibold">Hai {fmtEuro(importo)} di credito fino al {fmtData(scadeIl)}</span>: si scala dal
                        primo prodotto che acquisti entro {P3.scalabileEntroGiorni} giorni dalla richiesta, su questo account.
                    </p>
                    <p className="text-muted-foreground">
                        Ogni acquisto scala una sola verifica.
                        {giorni <= 7 && (giorni === 0 ? ' Scade oggi.' : ` Scade tra ${giorni} ${giorni === 1 ? 'giorno' : 'giorni'}.`)}
                    </p>
                    <Link to="/scegli-prodotto" className="inline-flex items-center gap-1 font-medium text-[#1A2D52] hover:underline">
                        Scegli un prodotto <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-muted/30 p-5 flex items-start gap-4">
            <span className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                <Wallet className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            </span>
            <div className="flex-1 space-y-1 text-sm min-w-0">
                <p className="font-semibold text-foreground">
                    {stato === 'usato'
                        ? `Credito di ${fmtEuro(importo)} usato il ${fmtData(usatoIl)}`
                        : `Credito di ${fmtEuro(importo)} scaduto`}
                </p>
                <p className="text-muted-foreground">
                    {stato === 'usato'
                        ? 'È stato scalato da un prodotto acquistato con questo account.'
                        : `Valeva fino al ${fmtData(scadeIl)}, ${P3.scalabileEntroGiorni} giorni dalla richiesta, e non è stato usato.`}
                </p>
            </div>
        </div>
    );
};

// ─── Pagina ───────────────────────────────────────────────────────────────────
const EsitoVerificaPage = () => {
    const { id } = useParams();
    const { persona } = useAuth();
    const { trova } = useVerifiche(persona?.id);
    const v = trova(id);

    if (!v) {
        return (
            <>
                <Helmet><title>Verifica non trovata - CRIA</title></Helmet>
                <div className="space-y-6">
                    <IntestazionePagina titolo="Verifica non trovata" indietro={INDIETRO} />
                    <Card>
                        <CardContent className="py-12 flex flex-col items-center text-center gap-4">
                            <SearchX className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
                            <p className="text-sm text-muted-foreground max-w-sm">Questa verifica non c’è, oppure non è tra le tue.</p>
                            <Button asChild variant="outline">
                                <Link to="/dashboard/cliente">Torna alle tue verifiche</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    const conclusa = v.stato === 'conclusa';
    const stato = STATO_VERIFICA[v.stato];

    const simula = () => {
        if (completaVerificaDemo(v.id)?.stato === 'conclusa') toast.success('Esito simulato');
    };

    return (
        <>
            <Helmet><title>{`Esito ${P3.nome} - CRIA`}</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    indietro={INDIETRO}
                    titolo={`Esito ${P3.nome}`}
                    badge={<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${stato.classe}`}>{stato.etichetta}</span>}
                />

                <Dati v={v} />

                {!conclusa && <InAttesa v={v} onSimula={simula} />}
                {conclusa && (v.esito?.tipo === 'semaforo' ? <EsitoSemaforo esito={v.esito} /> : <EsitoNessunaInformazione />)}

                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                        L’esito non mostra i singoli mesi, gli importi né gli altri contratti del candidato. Per un periodo certificato il
                        candidato può consegnarti il suo certificato CRIA: lo verifichi con il codice su{' '}
                        <Link to={PERCORSO_VERIFICA} className="text-[#1A2D52] underline underline-offset-4">{INDIRIZZO_VERIFICA}</Link>.
                    </span>
                </p>

                <BoxCredito v={v} />
            </div>
        </>
    );
};

export default EsitoVerificaPage;
