import React from 'react';
import { Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FORNITORE_SMS } from '@/data/comunicazioni';

// O-24 — il fornitore SMS è una decisione aperta (§16.1): cosa deve saper fare,
// e cosa succede finché non c'è. Nessun nome: la scelta non è fatta.
const FornitoreSms = () => (
    <Card className="border-amber-300">
        <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="flex items-center gap-2 text-base"><Smartphone className="w-5 h-5" /> {FORNITORE_SMS.titolo}</CardTitle>
                <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900">Decisione aperta</span>
            </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
            <p className="text-foreground">{FORNITORE_SMS.perche}.</p>
            <div>
                <p className="font-medium text-foreground">Cosa deve saper fare</p>
                <ul className="mt-1 list-disc pl-5 space-y-0.5 text-muted-foreground">
                    {FORNITORE_SMS.criteri.map(c => <li key={c}>{c}</li>)}
                </ul>
            </div>
            <p className="text-muted-foreground">{FORNITORE_SMS.nelFrattempo}.</p>
            <p className="text-xs text-muted-foreground">{FORNITORE_SMS.schema}.</p>
        </CardContent>
    </Card>
);

export default FornitoreSms;
