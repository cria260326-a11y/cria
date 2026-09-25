import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Euro, Clock, XCircle, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import { useDatiProprietario } from '@/hooks/useDatiArea';
import { PRODOTTI, fmtEuro } from '@/data/catalogo';
import { esitoMese, ESITI_MESE } from '@/lib/semaforo';
import { nomeMese, fmtData } from '@/lib/formato';

// P-14 — Pagamenti. Due casi distinti: incassa il proprietario, o incassa CRIA.

const PagamentiLocatorePage = () => {
    const { contratti } = useDatiProprietario();
    const [fImmobile, setFImmobile] = useState('tutti');

    const righe = useMemo(() => contratti
        .flatMap(c => c.mesi.map(m => ({ ...m, c })))
        .sort((a, b) => b.mese.localeCompare(a.mese) || a.c.immobile.indirizzo.localeCompare(b.c.immobile.indirizzo)), [contratti]);
    const filtrate = righe.filter(r => fImmobile === 'tutti' || r.c.id === fImmobile);

    const somma = (pred) => righe.filter(pred).reduce((s, r) => s + r.canone, 0);
    const incassato = somma(r => r.stato === 'pagato');
    const inVerifica = somma(r => r.stato === 'contestato' || r.stato === 'in_attesa');
    const nonPagato = somma(r => r.stato === 'insoluto');
    const daCria = righe.filter(r => r.bonificoIl).length;

    return (
        <>
            <Helmet><title>Pagamenti - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Pagamenti"
                    sottotitolo="I canoni degli ultimi 12 mesi, immobile per immobile"
                    azioni={<Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info('Esportazione disponibile con il collegamento al backend')}><Download className="w-4 h-4" /> Esporta CSV</Button>}
                />

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <Contatore etichetta="Incassato" valore={fmtEuro(incassato)} icona={Euro} colore="bg-green-500" />
                    <Contatore etichetta="In verifica" valore={fmtEuro(inVerifica)} icona={Clock} colore="bg-blue-500" />
                    <Contatore etichetta="Non pagato" valore={fmtEuro(nonPagato)} icona={XCircle} colore="bg-red-500" />
                    <Contatore etichetta="Bonifici da CRIA" valore={daCria} icona={ShieldCheck} colore="bg-purple-500" nota="Contratti CRIA Completo" />
                </div>

                <Card>
                    <CardContent className="pt-4 pb-4 flex flex-wrap gap-3 items-center">
                        <select value={fImmobile} onChange={e => setFImmobile(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                            <option value="tutti">Tutti gli immobili</option>
                            {contratti.map(c => <option key={c.id} value={c.id}>{c.immobile.indirizzo}</option>)}
                        </select>
                        {fImmobile !== 'tutti' && <Button variant="ghost" size="sm" onClick={() => setFImmobile('tutti')}><X className="w-3.5 h-3.5 mr-1" /> Azzera</Button>}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr className="text-left text-xs font-semibold text-muted-foreground uppercase">
                                    <th className="px-4 py-3">Mese</th><th className="px-4 py-3">Immobile</th><th className="px-4 py-3">Come</th>
                                    <th className="px-4 py-3">Pagato il</th><th className="px-4 py-3">Nel semaforo</th><th className="px-4 py-3 text-right">Importo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtrate.map(r => {
                                    const e = esitoMese(r);
                                    const cria = PRODOTTI[r.c.prodotto].incassa === 'cria';
                                    return (
                                        <tr key={`${r.c.id}-${r.mese}`} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{nomeMese(r.mese)}</td>
                                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.c.immobile.indirizzo}<span className="block text-xs">{r.c.conduttore.nome}</span></td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {cria
                                                    ? (r.bonificoIl ? `Incassato da CRIA, bonificato a te il ${fmtData(r.bonificoIl)}` : 'Incasso di CRIA')
                                                    : 'Incassato da te'}
                                            </td>
                                            <td className="px-4 py-3 tabular-nums text-muted-foreground whitespace-nowrap">{r.pagatoIl ? fmtData(r.pagatoIl) : '—'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                    <span className="w-2 h-2 rounded-full" style={{ background: ESITI_MESE[e].colore }} />{ESITI_MESE[e].etichetta}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3 text-right tabular-nums font-medium ${r.stato === 'pagato' ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{fmtEuro(r.canone)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default PagamentiLocatorePage;
