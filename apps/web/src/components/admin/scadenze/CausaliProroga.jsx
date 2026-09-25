import React from 'react';
import { ListChecks } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CAUSALI_PROROGA, ORDINE_CAUSALI, FASI } from '@/data/scadenze';
import { Chip } from '@/components/admin/scadenze/RigaFase';
import InfoSpiegazione from '@/components/aree/InfoSpiegazione';

// ═════════════════════════════════════════════════════════════════════════════
// O-19 — la lista chiusa delle causali di proroga, com'è: durata, tetto, a
// quali fasi si applica. Nella «i» accanto al titolo: come si contano i giorni
// e le fasi che non si prorogano, con il perché.
// ═════════════════════════════════════════════════════════════════════════════

const volte = (n) => (n === 1 ? 'una volta' : `${n} volte`);

const minuscola = (t) => t.charAt(0).toLowerCase() + t.slice(1);

const faseChe = (filtro) => Object.values(FASI).filter(filtro).map(d => minuscola(d.etichetta));

const CausaliProroga = () => {
    const mai = Object.values(FASI).filter(d => d.proroga === 'mai');
    const soloFuori = faseChe(d => d.proroga === 'solo_fuori_lista');

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <ListChecks className="w-5 h-5" /> Le causali di proroga
                    <InfoSpiegazione etichetta="Come si contano i giorni e cosa non si proroga" allinea="start" className="-my-1">
                        <p>I giorni si contano nel calendario della fase: lavorativi per i termini interni, solari per quelli verso il cliente.</p>
                        <p><span className="font-medium text-foreground">Solo fuori lista:</span> {soloFuori.join(', ')}.</p>
                        {mai.map(d => (
                            <p key={d.etichetta}><span className="font-medium text-foreground">{d.etichetta}:</span> {minuscola(d.senzaProroga)}.</p>
                        ))}
                    </InfoSpiegazione>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Una lista chiusa: se la giustificazione fosse testo libero, la scadenza smetterebbe di esistere.
                    Esaurito il tetto, o per un motivo che qui non c’è, proroga solo un responsabile, per iscritto.
                </p>
            </CardHeader>
            <CardContent>
                <ul className="divide-y divide-border rounded-lg border border-border">
                    {ORDINE_CAUSALI.map(k => {
                        const c = CAUSALI_PROROGA[k];
                        const fasi = faseChe(d => (d.causali || []).includes(k));
                        return (
                            <li key={k} className="p-3 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">{c.etichetta}</span>
                                    <Chip classe="bg-slate-100 text-slate-700">{c.sospende ? 'Ferma il termine' : `+${c.giorni} giorni`}</Chip>
                                    <Chip classe="bg-slate-100 text-slate-700">al massimo {volte(c.tetto)}</Chip>
                                    <Chip classe={c.fonte === 'documento' ? 'bg-green-50 text-green-800' : 'bg-violet-50 text-violet-800'}>
                                        {c.fonte === 'documento' ? 'Dal documento' : 'Proposta da confermare'}
                                    </Chip>
                                </div>
                                <p className="text-xs text-muted-foreground">{c.spiegazione}. Vale per: {fasi.join(', ')}.</p>
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
        </Card>
    );
};

export default CausaliProroga;
