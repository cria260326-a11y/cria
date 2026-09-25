import React, { useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';

// ═════════════════════════════════════════════════════════════════════════════
// GRAFICI DI VENDITE E CONTABILITÀ
// Barre sottili che partono dalla linea di base, griglia a filo, pochi colori.
// Il numero si legge sempre senza passare col mouse: nelle legende, nelle
// etichette o nella tabella che ogni grafico può mostrare al suo posto.
// Una serie sola usa il blu di CRIA; categorie senza un ordine usano il blu e
// l'arancio controllati per chi non distingue i colori; i colori di stato
// (verde, giallo, rosso) restano al semaforo e a ciò che vuol dire bene o male.
// ═════════════════════════════════════════════════════════════════════════════

export const COLORI = {
    serie: 'hsl(var(--primary))',
    categoria1: '#2a78d6',
    categoria2: '#eb6834',
    neutro: '#9CA3AF',
    franchigia: '#94A3B8',
};

// Il tetto dell'asse: il primo numero tondo sopra il massimo (1, 2, 2,5, 5 × 10ⁿ).
const tettoTondo = (massimo) => {
    if (massimo <= 0) return 1;
    const potenza = 10 ** Math.floor(Math.log10(massimo));
    return [1, 2, 2.5, 5, 10].map(p => p * potenza).find(v => v >= massimo);
};

const percento = (parte, totale) => (totale ? (parte / totale) * 100 : 0);

// ─── Un grafico o la sua tabella ──────────────────────────────────────────────
export const ConTabella = ({ intestazioni, righe, children }) => {
    const [tabella, setTabella] = useState(false);
    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => setTabella(t => !t)}
                    aria-pressed={tabella}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    {tabella ? <BarChart3 className="w-3.5 h-3.5" /> : <Table2 className="w-3.5 h-3.5" />}
                    {tabella ? 'Grafico' : 'Tabella'}
                </button>
            </div>
            {tabella ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                {intestazioni.map((h, i) => (
                                    <th key={h} className={`py-2 text-xs font-medium text-muted-foreground ${i ? 'text-right pl-3' : 'text-left'}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {righe.map(r => (
                                <tr key={r[0]}>
                                    {r.map((c, i) => (
                                        <td key={i} className={`py-1.5 ${i ? 'text-right pl-3 tabular-nums' : 'text-foreground'}`}>{c}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : children}
        </div>
    );
};

// ─── Colonne nel tempo ────────────────────────────────────────────────────────
// Una serie. Con `selezionato` la colonna scelta è piena e le altre restano sullo
// sfondo; con `onSeleziona` una colonna si sceglie cliccandola.
//   dati: [{ chiave, etichetta, etichettaBreve, valore }]
export const GraficoColonne = ({ dati, formato = String, selezionato = null, onSeleziona, altezza = 144 }) => {
    const tetto = tettoTondo(Math.max(0, ...dati.map(d => d.valore)));
    const cliccabile = typeof onSeleziona === 'function';

    return (
        <div className="flex gap-2">
            <div className="w-12 flex-shrink-0 flex flex-col justify-between text-right text-[10px] leading-none tabular-nums text-muted-foreground -mt-1" style={{ height: altezza + 8 }} aria-hidden="true">
                <span>{formato(tetto)}</span>
                <span>{formato(tetto / 2)}</span>
                <span>{formato(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="relative" style={{ height: altezza }}>
                    {[0, 50, 100].map(p => (
                        <div key={p} className={`absolute inset-x-0 border-t ${p ? 'border-border/70' : 'border-border'}`} style={{ bottom: `${p}%` }} aria-hidden="true" />
                    ))}
                    <div className="absolute inset-0 flex items-end gap-1">
                        {dati.map((d, i) => {
                            const scelta = d.chiave === selezionato;
                            const pieno = selezionato == null || scelta;
                            const allinea = i < 2 ? 'left-0' : i > dati.length - 3 ? 'right-0' : 'left-1/2 -translate-x-1/2';
                            const altezzaBarra = d.valore > 0 ? `max(2px, ${percento(d.valore, tetto)}%)` : '0px';
                            const contenuto = (
                                <span className="relative w-full max-w-6" style={{ height: altezzaBarra }}>
                                    <span className={`absolute inset-0 rounded-t transition-colors ${pieno ? 'bg-primary' : 'bg-primary/25 group-hover:bg-primary/45'}`} />
                                    <span className={`pointer-events-none absolute bottom-full mb-1.5 ${allinea} z-10 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background shadow opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100`}>
                                        <span className="font-semibold tabular-nums">{formato(d.valore)}</span> · {d.etichetta}
                                    </span>
                                </span>
                            );
                            const classe = 'group relative flex-1 h-full flex items-end justify-center rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';
                            return cliccabile ? (
                                <button key={d.chiave} type="button" onClick={() => onSeleziona(d.chiave)} aria-pressed={scelta}
                                    aria-label={`${d.etichetta}: ${formato(d.valore)}`} className={`${classe} cursor-pointer`}>
                                    {contenuto}
                                </button>
                            ) : (
                                <div key={d.chiave} role="img" tabIndex={0} aria-label={`${d.etichetta}: ${formato(d.valore)}`} className={classe}>
                                    {contenuto}
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Sul telefono si legge un mese sì e uno no: l'etichetta visibile usa anche lo spazio delle vicine. */}
                <div className="mt-1.5 flex gap-1" aria-hidden="true">
                    {dati.map((d, i) => (
                        <span key={d.chiave}
                            className={`flex-1 min-w-0 flex justify-center whitespace-nowrap text-[10px] ${d.chiave === selezionato ? 'font-semibold text-foreground' : 'text-muted-foreground'} ${(dati.length - 1 - i) % 2 ? 'invisible sm:visible' : ''}`}>
                            {d.etichettaBreve || d.etichetta}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── Quanto c'è oggi, e dove voleva stare il piano ────────────────────────────
//   righe: [{ chiave, etichetta, valore, piano }] · quote fra 0 e 1
export const BarreConPiano = ({ righe, formato, etichettaValore = 'Oggi', etichettaPiano = 'Piano' }) => (
    <div className="space-y-3">
        {righe.map(r => (
            <div key={r.chiave}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 text-foreground">{r.etichetta}</span>
                    <span className="whitespace-nowrap tabular-nums text-foreground">
                        {formato(r.valore)} <span className="text-muted-foreground">· {etichettaPiano.toLowerCase()} {formato(r.piano)}</span>
                    </span>
                </div>
                <div className="relative mt-1.5 h-2 w-full rounded bg-muted" role="img"
                    aria-label={`${r.etichetta}: ${etichettaValore.toLowerCase()} ${formato(r.valore)}, ${etichettaPiano.toLowerCase()} ${formato(r.piano)}`}>
                    {r.valore > 0 && <span className="absolute inset-y-0 left-0 rounded bg-primary" style={{ width: `${Math.min(100, r.valore * 100)}%` }} />}
                    <span className="absolute -top-1 -bottom-1 w-0.5 rounded bg-foreground" style={{ left: `calc(${Math.min(100, r.piano * 100)}% - 1px)` }} aria-hidden="true" />
                </div>
            </div>
        ))}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pt-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-4 rounded bg-primary" aria-hidden="true" /> {etichettaValore}</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-3.5 w-0.5 rounded bg-foreground" aria-hidden="true" /> {etichettaPiano}</span>
        </div>
    </div>
);
