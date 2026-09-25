import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { Send, CheckCheck, PhoneOff, CircleSlash, ShieldCheck, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import NotaMockup from '@/components/NotaMockup';
import CicloSolleciti from '@/components/admin/comunicazioni/CicloSolleciti';
import FornitoreSms from '@/components/admin/comunicazioni/FornitoreSms';
import StatoInvio, { ICONA_CANALE } from '@/components/admin/comunicazioni/StatoInvio';
import { dataOra } from '@/components/admin/comunicazioni/RegistroEmail';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import {
    useCicliSolleciti, useRegistroEmail, useAltriMessaggi, inviaEmail, puoScrivere, vedeSoloAggregati, motivoSoloAggregati,
    ripristinaComunicazioniDemo,
} from '@/lib/comunicazioniDemo';
import { CANALI, ORDINE_CANALI, STATI_INVIO, MESI_REGISTRO, MESE_CORRENTE, componiManuale } from '@/data/comunicazioni';
import { nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// NOTIFICHE E SMS — O-24
// Il registro dei solleciti del ciclo mensile su tutti i canali: i tre
// solleciti prima della fine della finestra — giorno +1, +3 e la mattina
// dell'ultimo giorno utile (§9.2) — con l'esito di ogni invio e di come è finito
// il mese. Sotto, gli altri messaggi per SMS e notifica. Il fornitore SMS è
// una decisione aperta: finché non c'è, gli SMS sono simulati.
// ═════════════════════════════════════════════════════════════════════════════

const selettore = 'text-sm border border-border rounded-lg px-3 py-2 bg-background max-w-full';

const esitoDi = (i) => STATI_INVIO[i.stato]?.esito;

const NotifichePage = () => {
    const { operatore, operatoreId } = useOperatoreAttivo();
    const cicli = useCicliSolleciti();
    const registro = useRegistroEmail();
    const altri = useAltriMessaggi();
    const [mese, setMese] = useState(MESE_CORRENTE);
    const [canale, setCanale] = useState('tutti');
    const [soloProblemi, setSoloProblemi] = useState(false);
    const soloNumeri = vedeSoloAggregati(operatore);
    const puo = puoScrivere(operatore);

    const delMese = useMemo(() => cicli.filter(c => c.mese === mese), [cicli, mese]);
    const invii = delMese.flatMap(c => c.solleciti.flatMap(s => s.invii)).filter(i => i.stato !== 'programmato');
    const problema = (c) => c.esito.esito === 'senza_risposta' || c.solleciti.some(s => s.invii.some(i => esitoDi(i) === 'ko'));
    const visibili = delMese.filter(c => !soloProblemi || problema(c));
    const altriVisibili = altri.filter(m => canale === 'tutti' || m.canale === canale);

    const richiestaPer = (email) => registro.find(e => e.modello === 'numero_cellulare' && e.destinatario.email === email) || null;

    const chiediCellulare = (ciclo) => {
        const { oggetto, testo } = componiManuale('numero_cellulare', { destinatario: ciclo.proprietario });
        const r = inviaEmail({ modello: 'numero_cellulare', destinatario: ciclo.proprietario, oggetto, testo, contesto: 'Numero per i solleciti' }, operatoreId);
        if (r.ok) toast.success(`Email mandata a ${ciclo.proprietario.nome}: la trovi nel registro delle email`);
        else toast.error(r.errore);
    };

    const ripristina = () => {
        ripristinaComunicazioniDemo();
        toast.success('Tolte le email mandate dalle sezioni');
    };

    return (
        <>
            <Helmet><title>Notifiche e SMS - CRIA</title></Helmet>

            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Notifiche e SMS"
                    sottotitolo="I solleciti del ciclo mensile su tutti i canali, con l’esito. Senza tre avvisi tracciati il silenzio del proprietario non è una scelta."
                />

                <div className="flex flex-wrap gap-2" role="group" aria-label="Mese">
                    {MESI_REGISTRO.map(m => (
                        <Button key={m} type="button" size="sm" variant={m === mese ? 'default' : 'outline'} aria-pressed={m === mese} onClick={() => setMese(m)}>
                            {nomeMese(m)}{m > MESE_CORRENTE ? ' · programmati' : ''}
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Contatore icona={Send} colore="bg-[#1A2D52]" valore={invii.length} etichetta="Messaggi partiti" nota="Tre canali per sollecito" />
                    <Contatore icona={CheckCheck} colore="bg-green-600" valore={invii.filter(i => esitoDi(i) === 'ok').length} etichetta="Consegnati" nota="Letti e aperti compresi" />
                    <Contatore icona={PhoneOff} colore="bg-red-500" valore={invii.filter(i => esitoDi(i) === 'ko').length} etichetta="Non consegnati" />
                    <Contatore icona={CircleSlash} colore="bg-slate-500" valore={delMese.filter(c => c.esito.esito === 'senza_risposta').length} etichetta="Mesi senza risposta" nota="Diventano non rilevati" />
                </div>

                <FornitoreSms />

                {soloNumeri ? (
                    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                        <ShieldCheck className="w-5 h-5 text-[#1A2D52] flex-shrink-0" />
                        <p>{motivoSoloAggregati(operatore)}</p>
                    </div>
                ) : (
                    <>
                        <Card>
                            <CardContent className="pt-4 pb-4 flex flex-wrap items-center gap-2">
                                <select aria-label="Canale" value={canale} onChange={e => setCanale(e.target.value)} className={selettore}>
                                    <option value="tutti">Tutti i canali</option>
                                    {ORDINE_CANALI.map(c => <option key={c} value={c}>{CANALI[c].etichetta}</option>)}
                                </select>
                                <Button type="button" size="sm" variant={soloProblemi ? 'default' : 'outline'} aria-pressed={soloProblemi} onClick={() => setSoloProblemi(v => !v)}>
                                    Solo i mesi con un problema
                                </Button>
                                <p className="text-xs text-muted-foreground sm:ml-auto">Partono solo per chi incassa da sé: con CRIA Completo incassa CRIA e sa già.</p>
                            </CardContent>
                        </Card>

                        <section className="space-y-3" aria-label="Solleciti del mese">
                            {visibili.length === 0 ? (
                                <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Nessun mese con un problema.</CardContent></Card>
                            ) : visibili.map(c => (
                                <CicloSolleciti
                                    key={c.id}
                                    ciclo={c}
                                    canale={canale}
                                    puo={puo}
                                    richiesta={richiestaPer(c.proprietario.email)}
                                    onChiediCellulare={() => chiediCellulare(c)}
                                />
                            ))}
                        </section>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Gli altri messaggi</CardTitle>
                                <p className="text-sm text-muted-foreground">Inviti ai candidati e codici di firma per SMS; segnalazioni e contestazioni anche come notifica, a entrambe le parti.</p>
                            </CardHeader>
                            <CardContent className="p-0">
                                {altriVisibili.length === 0 && (
                                    <p className="border-t border-border p-4 text-sm text-muted-foreground">Nessun messaggio su questo canale: le email sono nella pagina Email.</p>
                                )}
                                <ul className="divide-y divide-border border-t border-border">
                                    {altriVisibili.map(m => {
                                        const Icona = ICONA_CANALE[m.canale];
                                        return (
                                            <li key={m.id} className="grid gap-2 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto] md:items-center">
                                                <div className="min-w-0">
                                                    <p className="flex items-center gap-1.5 text-sm font-medium text-foreground"><Icona className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" /> {m.destinatario.nome}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{m.destinatario.ruolo} · {m.contesto}</p>
                                                </div>
                                                <p className="text-sm text-foreground break-words">{m.testo}</p>
                                                <div className="flex items-center gap-2 md:justify-end">
                                                    <StatoInvio stato={m.stato} canale={m.canale} conCanale title={m.canale === 'sms' ? 'Simulato: il fornitore SMS non è ancora scelto' : undefined} />
                                                    <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">{dataOra(m.il)}</span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </CardContent>
                        </Card>
                    </>
                )}

                <NotaMockup>
                    <p>Gli SMS del registro sono simulati: il fornitore non è ancora scelto. «Chiedi un cellulare» manda un’email che trovi anche nella pagina Email, con il tuo nome.</p>
                    <Button size="sm" variant="outline" className="mt-3 gap-2 bg-white" onClick={ripristina}>
                        <RotateCcw className="w-3.5 h-3.5" /> Togli le email mandate da qui
                    </Button>
                </NotaMockup>
            </div>
        </>
    );
};

export default NotifichePage;
