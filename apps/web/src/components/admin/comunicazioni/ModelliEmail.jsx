import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MODELLI_EMAIL } from '@/data/comunicazioni';

// ═════════════════════════════════════════════════════════════════════════════
// O-23 — i modelli: chi li riceve, quando partono e quanti ne sono partiti.
// In Postmark ognuno è un template con il suo alias; qui il nome in italiano.
// ═════════════════════════════════════════════════════════════════════════════

const GRUPPI = [
    { titolo: 'Partono da soli', nota: 'Da un evento della piattaforma', filtro: m => m.automatico },
    { titolo: 'Li manda un operatore', nota: 'Dalla sua schermata di lavoro', filtro: m => m.daOperatore },
    { titolo: 'Dalla sezione Email', nota: 'Con un contesto preso dai dati', filtro: m => m.manuale },
];

const ModelliEmail = ({ registro }) => {
    const quante = registro.reduce((t, e) => ({ ...t, [e.modello]: (t[e.modello] || 0) + 1 }), {});
    return (
        <div className="space-y-4">
            {GRUPPI.map(g => (
                <Card key={g.titolo}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">{g.titolo}</CardTitle>
                        <p className="text-xs text-muted-foreground">{g.nota}</p>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ul className="divide-y divide-border border-t border-border">
                            {Object.entries(MODELLI_EMAIL).filter(([, m]) => g.filtro(m)).map(([id, m]) => (
                                <li key={id} className="grid gap-1 p-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)_auto] sm:items-start">
                                    <div className="min-w-0">
                                        <p className="font-medium text-foreground">{m.nome}</p>
                                        <p className="text-xs text-muted-foreground">A: {m.a}</p>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <p>{m.quando}</p>
                                        {m.nota && <p className="text-foreground mt-0.5">{m.nota}</p>}
                                    </div>
                                    <p className="text-xs tabular-nums text-muted-foreground sm:text-right">{quante[id] || 0} nel registro</p>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default ModelliEmail;
