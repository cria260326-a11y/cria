import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Eye, Lock, Database, CalendarCheck } from 'lucide-react';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import BoxSemaforo from '@/components/aree/BoxSemaforo';
import TabellaMesi from '@/components/aree/TabellaMesi';
import PaymentTimeline from '@/components/PaymentTimeline.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';
import { useDatiInquilino } from '@/hooks/useDatiArea';
import { SEMAFORO, MESI_SEMAFORO } from '@/lib/semaforo';

// ═════════════════════════════════════════════════════════════════════════════
// IL MIO SEMAFORO — I-02
// Il semaforo della persona, su tutti i suoi contratti, con la spiegazione di
// come è composto e di chi lo vede (documento di stato §13.8, decisione 4).
// ═════════════════════════════════════════════════════════════════════════════

const SemaforoInquilinoPage = () => {
    const { contratti, analisiPersona } = useDatiInquilino();
    const tutti = contratti.flatMap(c => c.mesi.map(m => ({ ...m, contrattoId: c.id, immobile: c.immobile.indirizzo })));
    const piuContratti = contratti.length > 1;

    return (
        <>
            <Helmet><title>Il mio semaforo - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina titolo="Il mio semaforo" sottotitolo="Come lo calcoliamo, mese per mese, e chi lo vede" />

                <BoxSemaforo
                    analisi={analisiPersona}
                    titolo={piuContratti ? 'Il tuo semaforo, su tutti i tuoi contratti' : 'Il tuo semaforo'}
                    nota="È calcolato su di te, non su un singolo contratto: se hai più affitti, contano tutti."
                />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Calculator className="w-5 h-5" /> Come si calcola</CardTitle></CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>Conta il giorno del mese in cui hai pagato il canone, negli ultimi {MESI_SEMAFORO} mesi. La media decide il colore:</p>
                            <ul className="space-y-2">
                                {['verde', 'giallo', 'rosso'].map(s => (
                                    <li key={s} className="flex items-start gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: SEMAFORO[s].colore }} />
                                        <span><span className="font-medium text-foreground">{SEMAFORO[s].etichetta}</span> · {SEMAFORO[s].spiegazione.toLowerCase()}</span>
                                    </li>
                                ))}
                            </ul>
                            <p>Un mese che il proprietario non ha segnalato è <span className="text-foreground">non rilevato</span>: non conta, né a favore né contro. Un mese contestato resta fuori finché CRIA non decide.</p>
                            <p>Con meno di 3 mesi rilevati il colore non si dà: il semaforo è <span className="text-foreground">{SEMAFORO.storico_insufficiente.etichetta.toLowerCase()}</span>.</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Eye className="w-5 h-5" /> Chi lo vede</CardTitle></CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            {[
                                ['Tu', 'Sempre, con tutto il dettaglio di questa pagina.'],
                                ['Il proprietario del tuo contratto', 'Solo i mesi di quel contratto. Non vede come paghi altri affitti.'],
                                ['Chi fa una verifica su di te', 'Solo il semaforo e una breve sintesi, non i mesi.'],
                                ['Chi riceve il tuo certificato', 'Il periodo certificato e il suo valore, e se dopo è peggiorato: lo decidi tu, consegnando il codice.'],
                            ].map(([chi, cosa]) => (
                                <div key={chi} className="p-3 rounded-lg bg-muted/30">
                                    <p className="font-medium text-foreground">{chi}</p>
                                    <p className="text-muted-foreground">{cosa}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {contratti.map(c => (
                    <Card key={c.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <CardTitle className="flex items-center gap-2 text-base"><CalendarCheck className="w-5 h-5" /> {c.immobile.indirizzo}, {c.immobile.citta}</CardTitle>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">Su questo contratto <StatusBadge status={c.analisi.semaforo} /></div>
                            </div>
                        </CardHeader>
                        <CardContent><PaymentTimeline mesi={c.mesi} /></CardContent>
                    </Card>
                ))}

                <div className="space-y-3">
                    <h2 className="text-base font-semibold text-foreground">Mese per mese</h2>
                    <TabellaMesi mesi={tutti} prospettiva="conduttore" percorsoContestazioni="/dashboard/inquilino/contestazioni" conCopertura={false} immobile={piuContratti} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                        <Database className="w-5 h-5 text-[#1A2D52] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Fonte del dato: rilevato da CRIA.</span> Ogni mese lo segnala il proprietario, oppure CRIA quando è lei a incassare il canone.</p>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                        <Lock className="w-5 h-5 text-[#1A2D52] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Nessuno lo cambia a mano.</span> Se una segnalazione è sbagliata la contesti dalle <Link to="/dashboard/inquilino/segnalazioni" className="text-primary hover:underline">segnalazioni</Link>: decide CRIA sulle prove. I dati che CRIA ha su di te li vedi gratis da <Link to="/profilo/i-miei-dati" className="text-primary hover:underline">I miei dati</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SemaforoInquilinoPage;
