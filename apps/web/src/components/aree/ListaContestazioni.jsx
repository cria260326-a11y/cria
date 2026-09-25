import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Scale, ChevronRight } from 'lucide-react';
import { nomeMese, fmtData } from '@/lib/formato';
import { etichettaStatoContestazione, classeStatoContestazione, contestazioneChiusa } from '@/lib/etichette';

// Elenco delle contestazioni visto da una delle due parti. Il dettaglio si
// apre sempre dentro l'area da cui si guarda (basePath), mai in quella interna.
const ListaContestazioni = ({ contestazioni, contratti, prospettiva, basePath }) => {
    const navigate = useNavigate();
    const perId = Object.fromEntries(contratti.map(c => [c.id, c]));

    if (contestazioni.length === 0) {
        return (
            <Card>
                <CardContent className="py-16 text-center">
                    <Scale className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="font-medium text-foreground">Nessuna contestazione</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {prospettiva === 'locatore'
                            ? 'Quando un inquilino contesta una tua segnalazione di mancato pagamento, la trovi qui.'
                            : 'Puoi contestare una segnalazione di mancato pagamento entro 7 giorni, dalla pagina Segnalazioni.'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/40">
                        <tr className="text-left text-xs font-semibold text-muted-foreground uppercase">
                            <th className="px-4 py-3">Mese</th>
                            <th className="px-4 py-3">Immobile</th>
                            <th className="px-4 py-3">{prospettiva === 'locatore' ? 'Inquilino' : 'Proprietario'}</th>
                            <th className="px-4 py-3">Aperta il</th>
                            <th className="px-4 py-3">Stato</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {contestazioni.map(k => {
                            const c = perId[k.contrattoId];
                            const altra = prospettiva === 'locatore' ? c.conduttore : c.locatore;
                            return (
                                <tr key={k.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`${basePath}/${k.id}`)}>
                                    <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{nomeMese(k.mese)}</td>
                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.immobile.indirizzo}</td>
                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{altra.nome}</td>
                                    <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">{fmtData(k.apertaIl)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${classeStatoContestazione(k.stato)}`}>
                                            {etichettaStatoContestazione(k.stato, prospettiva)}
                                        </span>
                                        {!contestazioneChiusa(k.stato) && (
                                            <span className="block text-xs text-muted-foreground mt-0.5">CRIA risponde entro il {fmtData(k.rispostaEntro)}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <ChevronRight className="w-4 h-4 text-muted-foreground inline" />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
};

export default ListaContestazioni;
