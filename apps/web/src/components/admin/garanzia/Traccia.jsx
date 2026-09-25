import React from 'react';
import { CheckCircle2, CircleDashed, Undo2 } from 'lucide-react';
import { nomeOperatore } from '@/data/operatori';
import { ilGiorno } from '@/lib/garanziaDemo';
import { fmtData } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// Chi ha fatto cosa e quando, sempre in vista: disposto → autorizzato → eseguito,
// proposto → approvato → accettato. I passi da fare restano tratteggiati, e
// sotto i rimandi indietro con il loro motivo.
//
//   passi   [{ etichetta, chi?: operatoreId, testoChi?: string, il?: data, attesa?: string }]
//   rimandi [{ da, il, motivo, dispostoDa }]
// ═════════════════════════════════════════════════════════════════════════════

const Traccia = ({ passi, rimandi = [] }) => (
    <div className="space-y-1.5">
        <ol className="flex flex-col sm:flex-row sm:flex-wrap gap-x-5 gap-y-1.5 text-xs">
            {passi.map(p => {
                const fatto = !!p.il;
                return (
                    <li key={p.etichetta} className="flex items-start gap-1.5 min-w-0">
                        {fatto
                            ? <CheckCircle2 className="w-3.5 h-3.5 mt-px text-green-600 flex-shrink-0" aria-hidden="true" />
                            : <CircleDashed className="w-3.5 h-3.5 mt-px text-muted-foreground flex-shrink-0" aria-hidden="true" />}
                        <span className={fatto ? 'text-foreground' : 'text-muted-foreground'}>
                            <span className="font-medium">{p.etichetta}</span>
                            {fatto
                                ? <> · {p.testoChi || nomeOperatore(p.chi)} · {fmtData(p.il)}</>
                                : p.attesa && <> · {p.attesa}</>}
                        </span>
                    </li>
                );
            })}
        </ol>
        {rimandi.map(r => (
            <p key={`${r.il}-${r.da}-${r.motivo}`} className="flex items-start gap-1.5 text-xs text-amber-900">
                <Undo2 className="w-3.5 h-3.5 mt-px flex-shrink-0" aria-hidden="true" />
                <span>
                    Rimandato indietro da {nomeOperatore(r.da)} {ilGiorno(r.il)}{r.dispostoDa ? ` (disposto da ${nomeOperatore(r.dispostoDa)})` : ''}: {r.motivo}
                </span>
            </p>
        ))}
    </div>
);

export default Traccia;
