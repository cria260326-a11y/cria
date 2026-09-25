import React from 'react';
import { Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FUNZIONI } from '@/data/operatori';
import { etichettaCalendario } from '@/lib/calendario';
import { dalGiorno, ilGiorno } from '@/lib/garanziaDemo';
import Chip from './Chip';
import { STATO_FASE, quantoManca } from './stati';

// Le fasi della pratica e dell'indennizzo con decorrenza, termine e chi deve
// chiuderle (motore delle scadenze, §13.6). Sono queste che il rendiconto al
// riassicuratore conta come chiuse nel termine o fuori.
const TerminiPratica = ({ fasi }) => (
    <Card>
        <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><Timer className="w-5 h-5" /> Termini</CardTitle>
            <p className="text-xs text-muted-foreground">Interni in giorni lavorativi, verso il cliente in giorni solari.</p>
        </CardHeader>
        <CardContent>
            <ul className="divide-y divide-border">
                {fasi.map(f => (
                    <li key={f.id} className="py-2.5 flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{f.etichetta}</p>
                            <p className="text-xs text-muted-foreground">
                                {f.giorni} {etichettaCalendario(f.calendario, f.giorni)} {dalGiorno(f.decorrenza)}: entro {ilGiorno(f.termine)} · {FUNZIONI[f.funzione].etichetta.toLowerCase()}
                            </p>
                            {f.chiusaIl && <p className="text-xs text-muted-foreground">Chiusa {ilGiorno(f.chiusaIl)}</p>}
                            {(f.stato === 'in_corso' || f.stato === 'scaduta') && (
                                <p className={`text-xs font-medium ${f.urgente ? 'text-red-700' : 'text-foreground'}`}>{quantoManca(f.mancano, f.calendario)}</p>
                            )}
                        </div>
                        <Chip stato={STATO_FASE[f.stato]} />
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
);

export default TerminiPratica;
