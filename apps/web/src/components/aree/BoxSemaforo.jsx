import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SEMAFORO } from '@/lib/semaforo';

// Il semaforo con la spiegazione di come è composto, sempre visibile.
const BoxSemaforo = ({ analisi, titolo = 'Semaforo', nota }) => {
    const voce = SEMAFORO[analisi.semaforo];
    return (
        <Card className={`border ${voce.tenue}`}>
            <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <div className="w-7 h-7 rounded-full" style={{ background: voce.colore }} />
                    </div>
                    <div className="flex-1 min-w-[12rem]">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">{titolo}</p>
                        <p className="text-lg font-bold text-foreground">{voce.etichetta}</p>
                        <p className="text-sm text-muted-foreground">{voce.spiegazione}</p>
                    </div>
                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm">
                        {[
                            ['Giorno medio', analisi.media == null ? '—' : `il ${String(analisi.media).replace('.', ',')}`],
                            ['Mesi rilevati', analisi.rilevati],
                            ['Non rilevati', analisi.nonRilevati],
                            ['In verifica', analisi.inSospeso],
                        ].map(([k, v]) => (
                            <div key={k}>
                                <dt className="text-xs text-muted-foreground">{k}</dt>
                                <dd className="font-semibold tabular-nums text-foreground">{v}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
                <p className="text-xs text-muted-foreground mt-4 pt-3 border-t border-black/5">
                    {nota || 'Media del giorno di pagamento sugli ultimi 12 mesi: verde entro il 5, giallo dal 6 al 10, rosso oltre il 10 o con un mese non pagato. I mesi non rilevati e quelli in verifica non contano.'}
                </p>
            </CardContent>
        </Card>
    );
};

export default BoxSemaforo;
