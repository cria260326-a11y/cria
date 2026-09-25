import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Users, Route, FileWarning, ScrollText, AlertTriangle } from 'lucide-react';
import { OGGI } from '@/data/datiDemo';
import { nomeOperatore, operatoriConFunzione } from '@/data/operatori';
import { SQUADRA_ISTRUTTORIA, PROVINCE } from '@/data/istruttoria';
import { PRODOTTI } from '@/data/catalogo';
import { fmtData, nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// I pannelli di contorno della coda dell'istruttoria (O-07).
// ═════════════════════════════════════════════════════════════════════════════

const percento = (s) => (s.tasso == null ? '—' : `${s.tasso}%`);

// «Se nessuno dissente mai, la delibera umana è finta» (§13.6): il tasso si
// misura e si vede. Senza nomi per chi vede solo aggregati.
export const TassoDissenso = ({ dissenso, conNomi = true }) => {
    const { mese, anno } = dissenso;
    const mai = anno.totale >= 5 && anno.dissensi === 0;
    const perOperatore = Object.entries(anno.perOperatore);
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Scale className="w-5 h-5" /> Tasso di dissenso</CardTitle>
                <p className="text-xs text-muted-foreground">Quante delibere non hanno seguito la proposta del sistema. Se nessuno dissente mai, la delibera umana è finta.</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/30 p-3">
                        <p className="text-2xl font-bold tabular-nums text-foreground">{percento(mese)}</p>
                        <p className="text-xs text-muted-foreground">{nomeMese(OGGI.slice(0, 7))} · {mese.dissensi} su {mese.totale}</p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3">
                        <p className="text-2xl font-bold tabular-nums text-foreground">{percento(anno)}</p>
                        <p className="text-xs text-muted-foreground">Ultimi 12 mesi · {anno.dissensi} su {anno.totale}</p>
                    </div>
                </div>
                {conNomi && perOperatore.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Per persona, negli ultimi 12 mesi</p>
                        {perOperatore.map(([id, o]) => {
                            const t = Math.round((o.dissensi / o.totale) * 100);
                            return (
                                <div key={id} className="space-y-1">
                                    <div className="flex items-center justify-between gap-2 text-xs">
                                        <span className="text-foreground">{nomeOperatore(id)}</span>
                                        <span className="text-muted-foreground tabular-nums">{o.dissensi} su {o.totale} · {t}%</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${t}%` }} /></div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {mai && (
                    <p className="flex items-start gap-2 text-xs text-amber-800"><AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> Nessun dissenso in {anno.totale} delibere: va guardato con il responsabile.</p>
                )}
                <p className="text-[11px] text-muted-foreground">Contano solo le delibere con una proposta da cui si poteva dissentire. Le richieste di {PRODOTTI.P3.nome} no.</p>
            </CardContent>
        </Card>
    );
};

const assenzeFuture = (id) => (SQUADRA_ISTRUTTORIA[id]?.assenze || []).filter(a => a.al >= OGGI);

export const Squadra = ({ voci }) => (
    <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Users className="w-5 h-5" /> La squadra</CardTitle></CardHeader>
        <CardContent className="space-y-3">
            {operatoriConFunzione('istruttoria').map(o => {
                const aperte = voci.filter(v => v.fase !== 'deliberata' && v.assegnazione.operatoreId === o.id).length;
                const squadra = SQUADRA_ISTRUTTORIA[o.id] || { zone: [] };
                return (
                    <div key={o.id} className="rounded-lg border border-border p-3 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">{nomeOperatore(o.id)}</p>
                            <span className="text-xs text-muted-foreground tabular-nums">{aperte} in coda</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Lingue: {(o.lingue || ['italiano']).join(', ')}</p>
                        <p className="text-xs text-muted-foreground">Zone: {squadra.zone.map(z => PROVINCE[z] || z).join(', ')}{squadra.complesse ? ' · segue le pratiche complesse' : ''}</p>
                        {assenzeFuture(o.id).map(a => (
                            <p key={a.dal} className="text-xs text-amber-800">{a.motivo} dal {fmtData(a.dal)} al {fmtData(a.al)}</p>
                        ))}
                    </div>
                );
            })}
        </CardContent>
    </Card>
);

export const ComeSiAssegna = () => (
    <Card>
        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Route className="w-5 h-5" /> Come si assegna</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
            <ol className="list-decimal pl-5 space-y-1 text-foreground">
                <li>Lingua preferita, dichiarata dal cliente</li>
                <li>Ubicazione dell’immobile</li>
                <li>Carico e disponibilità</li>
                <li>Complessità</li>
            </ol>
            <p className="text-xs text-muted-foreground">Prima si tolgono gli incompatibili: chi ha acquisito il cliente non ne delibera l’istruttoria. Il responsabile può forzare l’assegnazione, e il motivo resta scritto.</p>
            <p className="text-xs text-muted-foreground">Mai su base etnica: non si usano origine, cittadinanza o nome della persona, nemmeno per dedurre la lingua.</p>
        </CardContent>
    </Card>
);

// Il rifiuto si conta: se metà dei documenti arriva non conforme, il problema
// sono le istruzioni date al candidato (§14.5).
export const NonConformita = ({ nonConformita }) => {
    const { verificati, nonConformi } = nonConformita;
    const quota = verificati ? Math.round((nonConformi / verificati) * 100) : null;
    return (
        <Card>
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><FileWarning className="w-5 h-5" /> Documenti non conformi</CardTitle></CardHeader>
            <CardContent className="space-y-1">
                <p className="text-sm text-foreground">
                    {verificati ? <><span className="font-semibold tabular-nums">{nonConformi}</span> su {verificati} verificati negli ultimi 30 giorni ({quota}%)</> : 'Nessun documento verificato negli ultimi 30 giorni.'}
                </p>
                <p className="text-xs text-muted-foreground">Se la quota sale, il problema sono le istruzioni date al candidato, non i candidati.</p>
            </CardContent>
        </Card>
    );
};

// Il DPO vede chi ha aperto cosa, non i documenti.
export const RegistroLetture = ({ letture }) => (
    <Card>
        <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><ScrollText className="w-5 h-5" /> Registro delle letture</CardTitle>
            <p className="text-xs text-muted-foreground">Ogni apertura di un documento sensibile lascia una riga: chi, quale documento, di quale pratica, quando.</p>
        </CardHeader>
        <CardContent>
            {letture.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nessuna lettura registrata. Nei mockup le righe nascono quando un operatore apre movimenti o reddito dalla sua coda.</p>
            ) : (
                <ul className="divide-y divide-border">
                    {letture.map(l => (
                        <li key={l.id} className="py-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm">
                            <span className="text-foreground">{nomeOperatore(l.da)} · {l.documento}</span>
                            <span className="text-xs text-muted-foreground">{l.riferimento} · {fmtData(l.il)} · {l.tipo === 'deroga' ? 'deroga' : 'dalla sua coda'}</span>
                        </li>
                    ))}
                </ul>
            )}
        </CardContent>
    </Card>
);
