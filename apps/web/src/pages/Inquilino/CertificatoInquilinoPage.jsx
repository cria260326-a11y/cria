import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    BadgeCheck, RefreshCw, Copy, Ban, Eye, KeyRound, FileSearch, FilePlus2, RotateCcw, ArrowRight, Info,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import FoglioCertificato from '@/components/aree/FoglioCertificato';
import StatusBadge from '@/components/StatusBadge.jsx';
import NotaMockup from '@/components/NotaMockup';
import { useDatiInquilino } from '@/hooks/useDatiArea';
import { OGGI } from '@/data/datiDemo';
import { PRODOTTI, PARAMETRI, fmtEuro } from '@/data/catalogo';
import { MESI_SEMAFORO } from '@/lib/semaforo';
import { fmtData } from '@/lib/formato';
import {
    useCertificati, emettiCertificato, revocaCodice, ripristinaCertificatiDemo,
    statoCertificato, scadenzaCertificato, fattiCertificato, periodoDaCertificare,
    fmtPeriodoMesi, STATO_CERTIFICATO,
} from '@/lib/certificatiDemo';

// ═════════════════════════════════════════════════════════════════════════════
// IL MIO CERTIFICATO — I-07, con dentro codici e verifiche (I-08)
// Gratuito con un contratto CRIA attivo. Un codice per certificato: generarne
// uno aggiornato crea un codice nuovo e i vecchi restano verificabili fino alla
// scadenza, salvo revoca. L'inquilino vede quante volte e quando ogni codice è
// stato verificato, mai da chi (documento di stato §15.1).
// ═════════════════════════════════════════════════════════════════════════════

const FONT_TITOLI = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,400,50;0,9..144,600,50&display=swap';

const P7 = PRODOTTI.P7;

const contrattoAttivo = (c) => (!c.inizio || c.inizio <= OGGI) && (!c.fine || c.fine >= OGGI);

// '2026-08-05 10:12' → '05/08/2026 alle 10:12'
const fmtVerifica = (v) => (v.length > 10 ? `${fmtData(v.slice(0, 10))} alle ${v.slice(11, 16)}` : fmtData(v));

const copiaCodice = async (codice) => {
    try {
        await navigator.clipboard.writeText(codice);
        toast.success(`Codice ${codice} copiato`);
    } catch {
        toast.error('Copia non riuscita: seleziona il codice e copialo a mano');
    }
};

const StatoCodice = ({ stato }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATO_CERTIFICATO[stato].classe}`}>
        {STATO_CERTIFICATO[stato].etichetta}
    </span>
);

// ─── Genera un certificato aggiornato ─────────────────────────────────────────
const RigeneraCertificato = ({ attuale, prossimo, onConferma }) => {
    const stessoPeriodo = attuale.periodo.dal === prossimo.dal && attuale.periodo.al === prossimo.al;
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]">
                    <RefreshCw className="w-4 h-4" /> Genera un certificato aggiornato
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Generare un certificato aggiornato?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-2">
                            <p>
                                {stessoPeriodo
                                    ? `Il periodo resta lo stesso, ${fmtPeriodoMesi(prossimo)}: cambia solo il codice. Serve, per esempio, a dare un codice diverso a ogni proprietario.`
                                    : `Il nuovo certificato copre i ${MESI_SEMAFORO} mesi chiusi più recenti, ${fmtPeriodoMesi(prossimo)}, con i dati aggiornati.`}
                                {' '}Avrà un codice nuovo, diverso da {attuale.codice}, e vale {PARAMETRI.mesiValiditaCertificato} mesi. È gratuito.
                            </p>
                            <p>
                                I codici che hai già consegnato restano verificabili fino alla loro scadenza, a meno che tu non li revochi:
                                {' '}{attuale.codice} fino al {fmtData(scadenzaCertificato(attuale))}. Puoi revocarli quando vuoi da «Codici e verifiche».
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction className="bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={onConferma}>Genera il certificato</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

// ─── Revoca ───────────────────────────────────────────────────────────────────
const RevocaCodice = ({ certificato, onConferma }) => (
    <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800">
                <Ban className="w-3.5 h-3.5" /> Revoca
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Revocare il codice {certificato.codice}?</AlertDialogTitle>
                <AlertDialogDescription>
                    Da subito chi prova a verificarlo vede solo che è stato revocato: non vede più il tuo nome, il periodo né il semaforo.
                    Serve se l’hai consegnato a qualcuno con cui poi non hai concluso. La revoca non si annulla: se ti serve di nuovo,
                    genera un certificato con un codice nuovo.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={onConferma}>Revoca il codice</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

// ─── Un codice e le sue verifiche ─────────────────────────────────────────────
const RigaCodice = ({ certificato: c, contratti, inUso, onRevoca }) => {
    const stato = statoCertificato(c);
    const { valore } = fattiCertificato(c, contratti);
    const verifiche = [...c.verifiche].sort().reverse();
    const n = verifiche.length;
    const validita = {
        valido: `valido fino al ${fmtData(scadenzaCertificato(c))}`,
        scaduto: `scaduto il ${fmtData(scadenzaCertificato(c))}`,
        revocato: `revocato il ${fmtData(c.revocatoIl)}`,
    }[stato];

    return (
        <li className="p-5 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold tracking-wider text-foreground">{c.codice}</span>
                        <StatoCodice stato={stato} />
                        {inUso && <span className="text-xs text-muted-foreground">· è il certificato qui sopra</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>Periodo {fmtPeriodoMesi(c.periodo)}</span>
                        <StatusBadge status={valore} />
                    </div>
                    <p className="text-xs text-muted-foreground">Emesso il {fmtData(c.emessoIl)} · {validita}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => copiaCodice(c.codice)}>
                        <Copy className="w-3.5 h-3.5" /> Copia il codice
                    </Button>
                    {stato !== 'revocato' && <RevocaCodice certificato={c} onConferma={() => onRevoca(c)} />}
                </div>
            </div>

            <div className="rounded-lg bg-muted/40 px-3 py-2.5">
                <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    {n === 0 ? 'Non è ancora stato verificato' : `Verificato ${n} ${n === 1 ? 'volta' : 'volte'}`}
                </p>
                {n > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`Quando è stato verificato il codice ${c.codice}`}>
                        {verifiche.map((v, i) => (
                            <li key={`${v}-${i}`} className="px-2 py-0.5 rounded-md border border-border bg-background text-[11px] tabular-nums text-muted-foreground">
                                {fmtVerifica(v)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </li>
    );
};

// ─── Pagina ───────────────────────────────────────────────────────────────────
const CertificatoInquilinoPage = () => {
    const { persona, contratti } = useDatiInquilino();
    const certificati = useCertificati(persona?.id);
    const attivo = contratti.some(contrattoAttivo);
    const attuale = certificati.find(c => statoCertificato(c) === 'valido') || null;
    const prossimo = periodoDaCertificare();

    const emetti = () => {
        if (!persona || !attivo) return;
        const nuovo = emettiCertificato(persona);
        toast.success(`Certificato emesso: il codice è ${nuovo.codice}`);
    };

    const revoca = (c) => {
        if (revocaCodice(c.id)) toast.success(`Codice ${c.codice} revocato`);
    };

    const ripristina = () => {
        ripristinaCertificatiDemo();
        toast.success('Certificati demo ripristinati');
    };

    return (
        <>
            <Helmet>
                <title>Il mio certificato - CRIA</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link href={FONT_TITOLI} rel="stylesheet" />
            </Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Il mio certificato"
                    sottotitolo="Il documento da mostrare a chi ti affitta casa: certifica come hai pagato il canone in un periodo preciso"
                    badge={attivo ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <BadgeCheck className="w-3.5 h-3.5" /> Gratuito: hai un contratto CRIA attivo
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <Info className="w-3.5 h-3.5" /> Nessun contratto CRIA attivo
                        </span>
                    )}
                    azioni={attivo && attuale ? <RigeneraCertificato attuale={attuale} prossimo={prossimo} onConferma={emetti} /> : null}
                />

                {attuale ? (
                    <motion.div key={attuale.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <FoglioCertificato certificato={attuale} persona={persona} contratti={contratti} />
                    </motion.div>
                ) : (
                    <Card>
                        <CardContent className="py-12 flex flex-col items-center text-center gap-4">
                            <span className="w-14 h-14 rounded-full bg-[#1A2D52]/5 flex items-center justify-center">
                                <FilePlus2 className="w-7 h-7 text-[#1A2D52]" />
                            </span>
                            <div className="space-y-1.5 max-w-lg">
                                <p className="text-lg font-semibold text-foreground">
                                    {certificati.length ? 'Non hai un certificato valido' : 'Non hai ancora un certificato'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {certificati.length ? 'Quelli che hai emesso sono scaduti o revocati: li trovi qui sotto. ' : ''}
                                    {attivo
                                        ? `Il certificato copre i ${MESI_SEMAFORO} mesi chiusi più recenti, ${fmtPeriodoMesi(prossimo)}, e vale ${PARAMETRI.mesiValiditaCertificato} mesi dall’emissione. Con il tuo contratto CRIA è gratuito.`
                                        : 'Senza un contratto CRIA attivo il certificato passa dall’autocandidatura: trovi come qui sotto.'}
                                </p>
                            </div>
                            {attivo && (
                                <Button className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={emetti}>
                                    <FilePlus2 className="w-4 h-4" /> Genera il certificato
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                <section id="verifiche" className="space-y-3 scroll-mt-6" aria-labelledby="titolo-verifiche">
                    <div>
                        <h2 id="titolo-verifiche" className="text-base font-semibold text-foreground flex items-center gap-2">
                            <KeyRound className="w-5 h-5" /> Codici e verifiche
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Ogni certificato ha il suo codice. Generarne uno aggiornato crea un codice nuovo, e i vecchi restano verificabili
                            fino alla scadenza, a meno che tu non li revochi. Per ogni codice vedi quante volte e quando è stato verificato,
                            mai da chi: chi verifica resta anonimo.
                        </p>
                    </div>
                    <Card>
                        {certificati.length === 0 ? (
                            <CardContent className="py-8 text-center text-sm text-muted-foreground">
                                Nessun codice, per ora: compare qui quando generi il certificato.
                            </CardContent>
                        ) : (
                            <CardContent className="p-0">
                                <ul className="divide-y divide-border">
                                    {certificati.map(c => (
                                        <RigaCodice key={c.id} certificato={c} contratti={contratti} inUso={c.id === attuale?.id} onRevoca={revoca} />
                                    ))}
                                </ul>
                            </CardContent>
                        )}
                    </Card>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                        <FilePlus2 className="w-5 h-5 text-[#1A2D52] flex-shrink-0 mt-0.5" />
                        <div className="text-sm space-y-1">
                            <p className="font-medium text-foreground">Senza un contratto CRIA attivo</p>
                            <p className="text-muted-foreground">
                                Il certificato passa dall’autocandidatura e costa {fmtEuro(P7.prezzo)}. {P7.sintesi} <Link to="/certificato/autocandidatura" className="text-primary hover:underline">Inizia l’autocandidatura</Link>.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                        <FileSearch className="w-5 h-5 text-[#1A2D52] flex-shrink-0 mt-0.5" />
                        <div className="text-sm space-y-1">
                            <p className="font-medium text-foreground">I tuoi dati, sempre gratis</p>
                            <p className="text-muted-foreground">
                                Sapere cosa CRIA conserva su di te è un tuo diritto (art. 15 GDPR) ed è gratuito, con o senza certificato.
                                Il certificato è un’altra cosa: un documento fatto per essere mostrato a un terzo.
                            </p>
                            <Link to="/profilo/i-miei-dati" className="inline-flex items-center gap-1 text-primary hover:underline">
                                Vai a I miei dati <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>

                <NotaMockup>
                    <p>
                        I certificati che generi, le revoche e le verifiche fatte dalla pagina pubblica restano in questo browser. Il QR del
                        foglio qui si clicca: apre la verifica pubblica in un’altra scheda, e la verifica compare subito tra quelle del codice.
                    </p>
                    <Button size="sm" variant="outline" className="mt-3 gap-2 bg-white" onClick={ripristina}>
                        <RotateCcw className="w-3.5 h-3.5" /> Ripristina i certificati demo
                    </Button>
                </NotaMockup>
            </div>
        </>
    );
};

export default CertificatoInquilinoPage;
