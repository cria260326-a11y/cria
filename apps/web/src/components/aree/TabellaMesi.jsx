import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { esitoMese, ESITI_MESE } from '@/lib/semaforo';
import { nomeMese, fmtData } from '@/lib/formato';
import { COPERTURA, SEGNALAZIONE } from '@/lib/etichette';

const FONTE = { proprietario: 'dal proprietario', cria: 'da CRIA', automatica: 'automatica' };

// Mese per mese: cosa è stato segnalato, quando è arrivato il pagamento,
// come conta nel semaforo e, se c'è la garanzia, lo stato della copertura.
const TabellaMesi = ({ mesi, prospettiva, percorsoContestazioni, conCopertura = true, immobile }) => {
    const righe = [...mesi].sort((a, b) => b.mese.localeCompare(a.mese));
    const mostraCopertura = conCopertura && righe.some(m => m.copertura);
    return (
        <Card>
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/40">
                        <tr className="text-left text-xs font-semibold text-muted-foreground uppercase">
                            <th className="px-4 py-3">Mese</th>
                            {immobile && <th className="px-4 py-3">Immobile</th>}
                            <th className="px-4 py-3">Segnalazione</th>
                            <th className="px-4 py-3">Pagamento</th>
                            <th className="px-4 py-3">Nel semaforo</th>
                            {mostraCopertura && <th className="px-4 py-3">Copertura</th>}
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {righe.map(m => {
                            const e = esitoMese(m);
                            const seg = SEGNALAZIONE[m.segnalazione.tipo];
                            return (
                                <tr key={`${m.contrattoId || ''}${m.mese}`} className="hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{nomeMese(m.mese)}</td>
                                    {immobile && <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{m.immobile}</td>}
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${seg.classe}`}>{seg.etichetta}</span>
                                        <span className="block text-xs text-muted-foreground mt-0.5">
                                            {m.segnalazione.tipo === 'non_rilevato'
                                                ? 'nessuna segnalazione entro l’11'
                                                : `${fmtData(m.segnalazione.il)} · ${prospettiva === 'locatore' && m.segnalazione.fonte === 'proprietario' ? 'da te' : FONTE[m.segnalazione.fonte]}`}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                        {m.pagatoIl ? `il ${fmtData(m.pagatoIl)}` : '—'}
                                        {m.bonificoIl && <span className="block text-xs">bonificato il {fmtData(m.bonificoIl)}</span>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                                            <span className="w-2 h-2 rounded-full" style={{ background: ESITI_MESE[e].colore }} />
                                            {ESITI_MESE[e].etichetta}
                                        </span>
                                    </td>
                                    {mostraCopertura && (
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {m.copertura
                                                ? <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${COPERTURA[m.copertura].classe}`}>{COPERTURA[m.copertura].etichetta}</span>
                                                : <span className="text-xs text-muted-foreground">senza garanzia</span>}
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        {m.contestazioneId && percorsoContestazioni && (
                                            <Link to={`${percorsoContestazioni}/${m.contestazioneId}`} className="text-xs font-medium text-primary hover:underline">
                                                Contestazione →
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
};

export default TabellaMesi;
