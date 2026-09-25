import React from 'react';
import { PhoneOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatoInvio from '@/components/admin/comunicazioni/StatoInvio';
import { COLORE_PRODOTTO, nomeProdotto } from '@/data/catalogo';
import { nomeOperatore } from '@/data/operatori';
import { ilData } from '@/data/scadenze';
import { fmtData, nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// O-24 — un mese di un contratto: i tre solleciti, su ogni canale con il suo
// esito, e com'è finita. Dopo una risposta i solleciti che restano non partono.
// ═════════════════════════════════════════════════════════════════════════════

export const ESITI_CICLO = {
    risposto: { etichetta: 'Ha risposto', classe: 'bg-green-100 text-green-800' },
    senza_risposta: { etichetta: 'Nessuna risposta', classe: 'bg-red-100 text-red-800' },
    in_corso: { etichetta: 'In attesa di risposta', classe: 'bg-amber-100 text-amber-800' },
    programmato: { etichetta: 'Programmato', classe: 'bg-blue-50 text-blue-800' },
};

const SIMULATO = 'Simulato: il fornitore SMS non è ancora scelto';

/**
 * @param {{ ciclo, canale: 'tutti' | 'notifica' | 'email' | 'sms', richiesta?: object, onChiediCellulare?: () => void, puo?: boolean }} props
 *   richiesta  l'email già mandata per chiedere un cellulare, se c'è
 */
const CicloSolleciti = ({ ciclo, canale, richiesta, onChiediCellulare, puo = true }) => {
    const esito = ESITI_CICLO[ciclo.esito.esito];
    const fisso = ciclo.solleciti.some(s => s.invii.some(i => i.canale === 'sms' && i.stato === 'non_consegnata'));

    return (
        <Card>
            <CardContent className="pt-5 pb-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="font-semibold text-foreground">{ciclo.immobile} <span className="font-normal text-muted-foreground">· {nomeMese(ciclo.mese).toLowerCase()}</span></p>
                        <p className="text-xs text-muted-foreground break-words">{ciclo.proprietario.nome} · {ciclo.proprietario.telefono} · parametri versione {ciclo.parametri.versione}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${COLORE_PRODOTTO[ciclo.prodotto]}`}>{nomeProdotto(ciclo.prodotto)}</span>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${esito.classe}`}>{esito.etichetta}</span>
                    </div>
                </div>

                <ol className="space-y-2">
                    {ciclo.solleciti.map(s => {
                        const invii = s.invii.filter(i => canale === 'tutti' || i.canale === canale);
                        const nota = s.invii.find(i => i.nota && (canale === 'tutti' || i.canale === canale))?.nota;
                        return (
                            <li key={s.n} className={`grid gap-2 rounded-lg border p-3 sm:grid-cols-[13rem_1fr] sm:items-center ${s.stato === 'non_inviato' ? 'border-dashed border-border bg-muted/20' : 'border-border'}`}>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{s.n}. {s.etichetta}</p>
                                    <p className="text-xs text-muted-foreground tabular-nums">{fmtData(s.il)} · {s.ora}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {s.stato === 'non_inviato' ? (
                                        <span className="text-xs text-muted-foreground">Non è partito: {s.motivo.charAt(0).toLowerCase() + s.motivo.slice(1)}</span>
                                    ) : invii.map(i => (
                                        <StatoInvio key={i.canale} stato={i.stato} canale={i.canale} conCanale title={i.canale === 'sms' ? SIMULATO : undefined} />
                                    ))}
                                    {nota && <p className="w-full text-xs text-red-800">{nota}</p>}
                                </div>
                            </li>
                        );
                    })}
                </ol>

                <p className="text-sm text-foreground"><span className="font-medium">Com’è finito il mese:</span> {ciclo.esito.testo}.</p>

                {fisso && onChiediCellulare && (
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-red-200 bg-red-50/60 p-3 text-xs text-red-900">
                        <PhoneOff className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 min-w-[12rem]">Gli SMS non arrivano: il numero del proprietario è un fisso.</span>
                        {richiesta ? (
                            <span className="text-foreground">Cellulare chiesto per email da {nomeOperatore(richiesta.inviataDa)} {ilData(richiesta.il)}.</span>
                        ) : (
                            <Button size="sm" variant="outline" className="bg-white" disabled={!puo} onClick={onChiediCellulare}>Chiedi un cellulare</Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default CicloSolleciti;
