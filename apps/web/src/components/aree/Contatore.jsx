import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const Contatore = ({ etichetta, valore, nota, icona: Icona, colore = 'bg-primary' }) => (
    <Card>
        <CardContent className="pt-5 pb-4 flex items-center gap-3">
            {Icona ? (
                <div className={`p-2.5 rounded-lg ${colore} flex-shrink-0`}>
                    <Icona className="w-5 h-5 text-white" />
                </div>
            ) : (
                <div className={`w-3 h-3 rounded-full ${colore} flex-shrink-0`} />
            )}
            <div className="min-w-0">
                <p className="text-xl font-bold tabular-nums text-foreground truncate">{valore}</p>
                <p className="text-xs text-muted-foreground">{etichetta}</p>
                {nota && <p className="text-[11px] text-muted-foreground/80 mt-0.5">{nota}</p>}
            </div>
        </CardContent>
    </Card>
);

export default Contatore;
