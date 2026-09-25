import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Scale, Hourglass, ListChecks } from 'lucide-react';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import NotaMockup from '@/components/NotaMockup';
import { OGGI } from '@/data/datiDemo';
import { PARAMETRI } from '@/data/catalogo';
import { nomeOperatore } from '@/data/operatori';
import { REGOLE_CICLO } from '@/data/incassi';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { useCicloMensile, accessoCiclo, ripristinaContestazioniDemo } from '@/lib/incassiDemo';
import { etichettaStatoContestazione, classeStatoContestazione } from '@/lib/etichette';
import { aggiungiGiorniSolari, mancanoAlTermine } from '@/lib/calendario';
import { fmtData, nomeMese } from '@/lib/formato';
import { AvvisoAccesso, Numero, Pill, Termine } from '@/components/admin/istruttoria/Elementi';
import ContestazioneIstruttoria from '@/components/admin/incassi/ContestazioneIstruttoria';

// ═════════════════════════════════════════════════════════════════════════════
// CONTESTAZIONI — O-10, elenco e dettaglio (la stessa pagina per le due rotte).
// La coda delle contestazioni aperte dagli inquilini, con il termine di
// risposta di CRIA (§9.3). La rettifica del semaforo esiste solo come esito di
// una contestazione istruita: documento della banca e doppia firma (§13.4).
// Proprietario e inquilino vedono la stessa contestazione dalla loro area.
// ═════════════════════════════════════════════════════════════════════════════

const REGOLE = [
    `L’inquilino contesta una segnalazione di mancato pagamento entro ${PARAMETRI.giorniContestazione} giorni, con una prova.`,
    `CRIA risponde entro ${PARAMETRI.giorniRispostaContestazione} giorni solari dall’apertura. Finché è aperta, il mese non conta nel semaforo.`,
    'Respingere lascia il dato com’è e, se il contratto ha la garanzia, fa partire la pratica di morosità del mese. Accogliere vuol dire rettificare, e si rettifica solo con un documento della banca.',
    `Due firme di persone diverse: l’assistenza propone, un responsabile conferma entro ${REGOLE_CICLO.giorniLavorativiSecondaFirma} giorni lavorativi. Non firma chi ha generato il dato.`,
];

const Riga = ({ k }) => {
    const c = k.contratto;
    return (
        <Link to={`/dashboard/admin/contestazioni/${k.id}`} className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition">
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{nomeMese(k.mese)} · {c.immobile.indirizzo}</p>
                        <Pill classe={classeStatoContestazione(k.stato)}>{etichettaStatoContestazione(k.stato)}</Pill>
                        {k.inAttesaSecondaFirma && <Pill classe="bg-amber-50 text-amber-800 border border-amber-200">manca la seconda firma</Pill>}
                    </div>
                    <p className="text-sm text-foreground">Inquilino {c.conduttore.nome} · proprietario {c.locatore.nome}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{k.motivo}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Aperta il {fmtData(k.apertaIl)}</span>
                        {k.chiusa ? <span>Chiusa il {fmtData(k.chiusaIl)}</span> : <span>CRIA risponde <Termine termine={k.termine} /></span>}
                        <span>{nomeOperatore(k.assegnataA)}</span>
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
        </Link>
    );
};

const Elenco = ({ dati, accesso }) => {
    const aperte = dati.contestazioni.filter(k => !k.chiusa);
    const vicine = aperte.filter(k => mancanoAlTermine(OGGI, k.termine.data, 'solari') <= 1);
    const firma = aperte.filter(k => k.inAttesaSecondaFirma);
    const dal = aggiungiGiorniSolari(OGGI, -90);
    const chiuse = dati.contestazioni.filter(k => k.chiusa && k.chiusaIl >= dal);
    const soloNumeri = accesso.livello === 'numeri';

    return (
        <div className="space-y-6">
            <IntestazionePagina
                titolo="Contestazioni"
                sottotitolo="Le contestazioni aperte dagli inquilini. Decide CRIA; il semaforo si rettifica solo con una prova della banca e due firme."
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Numero etichetta="Aperte" valore={aperte.length} tono={aperte.length ? 'attenzione' : 'normale'} />
                <Numero etichetta="Vicine al termine" valore={vicine.length} nota="un giorno o meno" tono={vicine.length ? 'allarme' : 'normale'} />
                <Numero etichetta="Aspettano la seconda firma" valore={firma.length} />
                <Numero etichetta="Chiuse negli ultimi 90 giorni" valore={chiuse.length} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-3 min-w-0">
                    {soloNumeri ? (
                        <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Il dettaglio lo vede chi istruisce le contestazioni.</CardContent></Card>
                    ) : dati.contestazioni.length === 0 ? (
                        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nessuna contestazione.</CardContent></Card>
                    ) : dati.contestazioni.map(k => <Riga key={k.id} k={k} />)}
                </div>
                <div className="space-y-6 min-w-0">
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><ListChecks className="w-5 h-5" /> Come si decide</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {REGOLE.map(r => <li key={r} className="text-sm text-foreground flex items-start gap-2"><Scale className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />{r}</li>)}
                            </ul>
                        </CardContent>
                    </Card>
                    {!soloNumeri && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base"><Hourglass className="w-5 h-5" /> Ancora contestabili</CardTitle>
                                <p className="text-xs text-muted-foreground">Segnalazioni di mancato pagamento che l’inquilino può ancora contestare.</p>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {dati.contestabili.length === 0 ? <p className="text-sm text-muted-foreground">Nessuna.</p> : dati.contestabili.map(({ contratto: c, mese: m }) => (
                                    <div key={`${c.id}-${m.mese}`} className="rounded-lg bg-muted/30 p-2.5">
                                        <p className="text-sm font-medium text-foreground">{nomeMese(m.mese)} · {c.immobile.indirizzo}</p>
                                        <p className="text-xs text-muted-foreground">Segnalato il {fmtData(m.segnalazione.il)} · {c.conduttore.nome} può contestare fino al {fmtData(m.scadenzaContestazione)}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <NotaMockup>
                <p className="mb-2">Per istruire entra come Nicola Pace (assistenza) o come admin; per la seconda firma come Luca Moretti o l’Avv. Laura Testa: deve essere una persona diversa da chi ha messo la prima. Proprietario e inquilino vedono la stessa contestazione dalla loro area.</p>
                <p className="mb-2 text-xs text-amber-800">Il ripristino rimette le contestazioni com’erano. Una pratica di morosità partita da una contestazione respinta si toglie con il ripristino delle pratiche di morosità.</p>
                <button type="button" className="underline underline-offset-2 font-medium" onClick={() => { ripristinaContestazioniDemo(); toast.success('Contestazioni ripristinate'); }}>
                    Ripristina le contestazioni
                </button>
            </NotaMockup>
        </div>
    );
};

const ContestazionePage = () => {
    const { id } = useParams();
    const dati = useCicloMensile();
    const { operatore } = useOperatoreAttivo();
    const accesso = accessoCiclo('contestazioni', operatore);

    if (id) {
        const k = dati.contestazioni.find(x => x.id === id);
        const contratto = k && dati.contratti.find(c => c.id === k.contrattoId);
        return (
            <div className="space-y-6">
                <Helmet><title>{k ? `Contestazione di ${nomeMese(k.mese).toLowerCase()}` : 'Contestazione'} - CRIA</title></Helmet>
                {!k ? (
                    <>
                        <IntestazionePagina titolo="Contestazione non trovata" indietro={{ to: '/dashboard/admin/contestazioni', label: 'Contestazioni' }} />
                        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Questa contestazione non esiste.</CardContent></Card>
                    </>
                ) : accesso.livello === 'numeri' ? (
                    <>
                        <IntestazionePagina titolo="Contestazione" indietro={{ to: '/dashboard/admin/contestazioni', label: 'Contestazioni' }} />
                        <AvvisoAccesso testo={accesso.testo} />
                    </>
                ) : (
                    <ContestazioneIstruttoria k={k} contratto={contratto} accesso={accesso} />
                )}
            </div>
        );
    }

    return (
        <>
            <Helmet><title>Contestazioni - CRIA</title></Helmet>
            <Elenco dati={dati} accesso={accesso} />
        </>
    );
};

export default ContestazionePage;
