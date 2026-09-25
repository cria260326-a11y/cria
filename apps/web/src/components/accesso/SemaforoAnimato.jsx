import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SEMAFORO, ESITI_MESE, esitoMese, analizzaMesi, MESI_SEMAFORO } from '@/lib/semaforo';

// Dodici mesi d'esempio che si riempiono uno alla volta; il semaforo si calcola
// con la stessa regola della piattaforma (lib/semaforo.js), non è scritto a mano.
const MESI = [
    { mese: '2025-10', stato: 'pagato', giorno: 2 },
    { mese: '2025-11', stato: 'pagato', giorno: 3 },
    { mese: '2025-12', stato: 'pagato', giorno: 1 },
    { mese: '2026-01', stato: 'pagato', giorno: 4 },
    { mese: '2026-02', stato: 'non_rilevato' },
    { mese: '2026-03', stato: 'pagato', giorno: 3 },
    { mese: '2026-04', stato: 'pagato', giorno: 5 },
    { mese: '2026-05', stato: 'pagato', giorno: 2 },
    { mese: '2026-06', stato: 'pagato', giorno: 7 },
    { mese: '2026-07', stato: 'pagato', giorno: 3 },
    { mese: '2026-08', stato: 'pagato', giorno: 2 },
    { mese: '2026-09', stato: 'pagato', giorno: 4 },
];
const ANALISI = analizzaMesi(MESI);
const ABBR = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const PASSO = 0.16;
const fontTitolo = { fontFamily: "'Fraunces', 'Source Serif Pro', Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', 'SF Mono', monospace" };

const SemaforoAnimato = () => {
    const fermo = useReducedMotion();
    const [giro, setGiro] = useState(0);
    const s = SEMAFORO[ANALISI.semaforo];

    // Ogni dieci secondi il semaforo si ricostruisce da capo.
    useEffect(() => {
        if (fermo) return undefined;
        const t = setInterval(() => setGiro(g => g + 1), 10000);
        return () => clearInterval(t);
    }, [fermo]);

    const ritardo = (i) => (fermo ? 0 : i * PASSO);
    const fine = fermo ? 0 : MESI.length * PASSO + 0.2;

    return (
        <div key={giro} className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 p-6 space-y-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/60" style={fontMono}>
                Il tuo semaforo · ultimi {MESI_SEMAFORO} mesi
            </p>
            <div className="flex items-end gap-1.5">
                {MESI.map((m, i) => {
                    const esito = ESITI_MESE[esitoMese(m)];
                    return (
                        <div key={m.mese} className="flex-1 flex flex-col items-center gap-1.5">
                            <motion.div
                                className="w-full h-12 rounded-md"
                                style={{ originY: 1 }}
                                initial={fermo ? false : { scaleY: 0.25, backgroundColor: 'rgba(255,255,255,0.10)' }}
                                animate={{ scaleY: 1, backgroundColor: esito.pesa ? esito.colore : 'rgba(255,255,255,0.22)' }}
                                transition={{ delay: ritardo(i), duration: 0.35, ease: 'easeOut' }}
                            />
                            <span className="text-[10px] text-white/50" style={fontMono}>{ABBR[Number(m.mese.slice(5)) - 1]}</span>
                        </div>
                    );
                })}
            </div>
            <motion.div
                className="flex items-end justify-between gap-4"
                initial={fermo ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: fine, duration: 0.4 }}
            >
                <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full ring-4 ring-white/10" style={{ background: s.colore }} />
                    <div>
                        <p className="text-3xl leading-none" style={fontTitolo}>{s.etichetta}</p>
                        <p className="text-sm text-white/70 mt-1">{s.spiegazione}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/50" style={fontMono}>Giorno medio</p>
                    <p className="text-2xl tabular-nums" style={fontTitolo}>{String(ANALISI.media).replace('.', ',')}</p>
                </div>
            </motion.div>
            <p className="text-xs text-white/50">Il mese grigio nessuno l’ha segnalato: non conta, né a favore né contro.</p>
        </div>
    );
};

export default SemaforoAnimato;
