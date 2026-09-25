import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Info } from 'lucide-react';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import { useDatiInquilino } from '@/hooks/useDatiArea';
import { OGGI } from '@/data/datiDemo';
import { fmtEuro } from '@/data/catalogo';
import { esitoMese, ESITI_MESE } from '@/lib/semaforo';
import { nomeMese, fmtData, meseSuccessivo } from '@/lib/formato';
import EstremiBonifico from '@/components/aree/EstremiBonifico';
import { useProdotti, bonificoPronto, causaleCliente } from '@/lib/prodottiDemo';

// I-04 — I miei pagamenti.
// Con CRIA Completo il canone si paga a CRIA, con il codice del contratto come
// causale: qui l'inquilino trova gli estremi che l'admin ha messo nel prodotto.

const SEGNALATO = { pagato: 'Pagato', non_pagato: 'Non pagato', non_rilevato: 'Non segnalato' };

const PagamentiInquilinoPage = () => {
    const { contratti, analisiPersona } = useDatiInquilino();
    const catalogo = useProdotti();
    const prossimo = meseSuccessivo(OGGI.slice(0, 7));
    const righe = contratti.flatMap(c => c.mesi.map(m => ({ ...m, c }))).sort((a, b) => b.mese.localeCompare(a.mese));
    const piuContratti = contratti.length > 1;

    return (
        <>
            <Helmet><title>I miei pagamenti - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina titolo="I miei pagamenti" sottotitolo="I tuoi canoni degli ultimi 12 mesi e come contano nel semaforo" />

                {contratti.map(c => {
                    const prodotto = catalogo.trova(c.prodotto);
                    const aCria = prodotto?.incassa === 'cria';
                    return (
                        <Card key={c.id} className="border-2 border-primary/20">
                            <CardContent className="pt-5 pb-5 bg-primary/5 rounded-lg space-y-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Calendar className="w-6 h-6 text-primary" /></div>
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Prossimo canone{piuContratti ? ` · ${c.immobile.indirizzo}` : ''}</p>
                                        <p className="text-lg font-bold text-foreground">{nomeMese(prossimo)} · {fmtEuro(c.canone)}</p>
                                        <p className="text-sm text-muted-foreground">Scade il 1 {nomeMese(prossimo).toLowerCase()} · {aCria ? 'lo paghi a CRIA, che lo gira al proprietario' : `a ${c.locatore.nome}`}</p>
                                    </div>
                                </div>
                                {aCria && (bonificoPronto(prodotto)
                                    ? <EstremiBonifico bonifico={prodotto.bonifico} importo={c.canone} causale={causaleCliente(prodotto, c.codiceUnivoco)} titolo="Fai il bonifico del canone a" className="bg-background" />
                                    : <p className="text-sm text-muted-foreground">Le coordinate per il bonifico a CRIA arrivano qui a breve. Nella causale scrivi il codice del contratto: <span className="font-mono text-foreground">{c.codiceUnivoco}</span>.</p>)}
                            </CardContent>
                        </Card>
                    );
                })}

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <Contatore etichetta="Mesi pagati" valore={righe.filter(r => r.stato === 'pagato').length} colore="bg-green-500" />
                    <Contatore etichetta="Giorno medio di pagamento" valore={analisiPersona.media == null ? '—' : `il ${String(analisiPersona.media).replace('.', ',')}`} colore="bg-purple-500" />
                    <Contatore etichetta="Non rilevati" valore={analisiPersona.nonRilevati} colore="bg-gray-400" nota="Non contano nel semaforo" />
                    <Contatore etichetta="In verifica" valore={analisiPersona.inSospeso} colore="bg-blue-500" nota="Contestati o contestabili" />
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">
                        Il semaforo guarda il giorno del mese in cui paghi: entro il 5 è puntuale, dal 6 al 10 è in ritardo, oltre il 10 pesa di più. Se il proprietario non segnala nulla, il mese non conta né a favore né contro.
                    </p>
                </div>

                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr className="text-left text-xs font-semibold text-muted-foreground uppercase">
                                    <th className="px-4 py-3">Mese</th>{piuContratti && <th className="px-4 py-3">Immobile</th>}
                                    <th className="px-4 py-3">Pagato il</th><th className="px-4 py-3">Segnalato dal proprietario</th><th className="px-4 py-3">Nel semaforo</th><th className="px-4 py-3 text-right">Importo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {righe.map(r => {
                                    const e = esitoMese(r);
                                    return (
                                        <tr key={`${r.c.id}-${r.mese}`} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{nomeMese(r.mese)}</td>
                                            {piuContratti && <td className="px-4 py-3 text-muted-foreground">{r.c.immobile.indirizzo}</td>}
                                            <td className="px-4 py-3 tabular-nums text-muted-foreground whitespace-nowrap">{r.pagatoIl ? fmtData(r.pagatoIl) : '—'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{SEGNALATO[r.segnalazione.tipo]}{r.segnalazione.tipo !== 'non_rilevato' && ` il ${fmtData(r.segnalazione.il)}`}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                    <span className="w-2 h-2 rounded-full" style={{ background: ESITI_MESE[e].colore }} />{ESITI_MESE[e].etichetta}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">{fmtEuro(r.canone)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default PagamentiInquilinoPage;
