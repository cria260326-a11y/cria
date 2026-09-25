import React from 'react';
import { Gauge, PenLine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { nomeOperatore } from '@/data/operatori';
import { FASI } from '@/data/scadenze';
import { cruscottoDelMese, riepilogoFasiChiuse } from '@/lib/scadenzeDemo';
import { etichettaCalendario } from '@/lib/calendario';
import { fmtData, nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// Il cruscotto del mese (§13.6): quante fasi di CRIA si chiudono nel termine —
// il numero che va nel rendiconto al riassicuratore — e le proroghe, quelle
// fuori lista una per una con il nome di chi le ha concesse.
// conOggetto: false nasconde di quale pratica si tratta (vista della direzione).
// ═════════════════════════════════════════════════════════════════════════════

const Cifra = ({ valore, etichetta, nota }) => (
    <div className="rounded-lg bg-muted/40 p-3">
        <p className="text-xl font-bold tabular-nums text-foreground">{valore}</p>
        <p className="text-xs text-muted-foreground">{etichetta}</p>
        {nota && <p className="text-[11px] text-muted-foreground/80 mt-0.5">{nota}</p>}
    </div>
);

const percento = (r) => (r.percentuale == null ? '—' : `${r.percentuale}%`);

const CruscottoMese = ({ fasi, proroghe, conOggetto = true }) => {
    const c = cruscottoDelMese(fasi, proroghe);
    const storico = riepilogoFasiChiuse(fasi);
    const mese = nomeMese(c.mese).toLowerCase();

    return (
        <Card id="cruscotto" className="scroll-mt-20">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Gauge className="w-5 h-5" /> Cruscotto di {mese}</CardTitle>
                <p className="text-sm text-muted-foreground">Contano le fasi di CRIA: una fase scaduta e ancora aperta conta come fuori termine.</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Cifra
                        valore={percento(c.chiuse)}
                        etichetta={`Chiuse nel termine a ${mese}`}
                        nota={`${c.chiuse.nelTermine} su ${c.chiuse.totale}${c.chiuse.conProrogaFuoriLista ? `, ${c.chiuse.conProrogaFuoriLista} con proroga fuori lista` : ''}`}
                    />
                    <Cifra
                        valore={percento(storico)}
                        etichetta="Chiuse nel termine da sempre"
                        nota={`${storico.nelTermine} su ${storico.totale}: va nel rendiconto al riassicuratore`}
                    />
                    <Cifra
                        valore={c.totaleInLista}
                        etichetta={`Proroghe in lista a ${mese}`}
                        nota={c.inLista.length ? c.inLista.map(x => `${x.etichetta} (${x.n})`).join(', ') : 'Nessuna'}
                    />
                    <Cifra valore={c.fuoriLista.length} etichetta={`Proroghe fuori lista a ${mese}`} nota="Una per una qui sotto" />
                </div>

                {c.fuoriLista.length > 0 && (
                    <div className="space-y-2">
                        <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><PenLine className="w-4 h-4" /> Fuori lista, con il nome di chi le ha concesse</p>
                        <ul className="space-y-2">
                            {c.fuoriLista.map(({ proroga: p, fase }) => (
                                <li key={p.id} className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm">
                                    <p className="text-foreground">
                                        <span className="font-semibold">{nomeOperatore(p.concessaDa)}</span>
                                        <span className="text-muted-foreground"> · {fmtData(p.concessaIl)} · </span>
                                        {FASI[p.tipoFase]?.etichetta || 'Fase'}
                                        {conOggetto && fase ? ` · ${fase.oggetto}` : ''}
                                        <span className="text-muted-foreground"> · +{p.giorni} {etichettaCalendario(FASI[p.tipoFase]?.conteggio, p.giorni)}</span>
                                    </p>
                                    <p className="text-xs italic text-amber-950 mt-1">«{p.motivazione}»</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default CruscottoMese;
