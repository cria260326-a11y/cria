import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ShieldCheck, History, FileText } from 'lucide-react';

// ═════════════════════════════════════════════════════════════════════════════
// I MIEI CONSENSI — F-14
// Consensi separati per la valutazione e per l'inserimento nel database: sono
// due cose diverse e la seconda dura di più. Per ciascuno: quando, da dove, quale
// versione dell'informativa. E la revoca, con scritto cosa comporta.
// TESTI PROVVISORI: li valida il legale.
// ═════════════════════════════════════════════════════════════════════════════

const VERSIONE_INFORMATIVA = 'v1.0';

const CONSENSI_INIZIALI = [
    {
        id: 'valutazione',
        titolo: 'Valutazione della mia posizione',
        descrizione: "Permette a CRIA di esaminare i documenti che carichi per l'istruttoria.",
        dato: true,
        data: '12/03/2026 10:42',
        indirizzo: '93.41.•••.•••',
        conseguenza: "L'istruttoria in corso non può proseguire senza questo consenso.",
    },
    {
        id: 'database',
        titolo: 'Inserimento nella banca dati CRIA',
        descrizione: 'Permette a CRIA di conservare il tuo storico dei pagamenti e di usarlo per le verifiche. È separato dalla valutazione e dura di più.',
        dato: true,
        data: '12/03/2026 10:42',
        indirizzo: '93.41.•••.•••',
        conseguenza: "Non verrai più incluso nelle nuove verifiche. Cosa resta conservato, e per quanto, lo stabilisce l'informativa.",
    },
    {
        id: 'marketing',
        titolo: 'Comunicazioni commerciali',
        descrizione: 'Novità e offerte di CRIA, via email.',
        dato: false,
        data: null,
        indirizzo: null,
        conseguenza: 'Non riceverai più comunicazioni commerciali.',
    },
];

const STORICO_INIZIALE = [
    { consenso: 'Valutazione della mia posizione', azione: 'Dato', data: '12/03/2026 10:42', versione: 'v1.0', indirizzo: '93.41.•••.•••' },
    { consenso: 'Inserimento nella banca dati CRIA', azione: 'Dato', data: '12/03/2026 10:42', versione: 'v1.0', indirizzo: '93.41.•••.•••' },
];

const adesso = () => new Date().toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });

const ConsensiPage = () => {
    const [consensi, setConsensi] = useState(CONSENSI_INIZIALI);
    const [storico, setStorico] = useState(STORICO_INIZIALE);

    const cambia = (id, dato) => {
        const quando = adesso();
        const consenso = consensi.find(c => c.id === id);
        setConsensi(prev => prev.map(c => (c.id === id
            ? { ...c, dato, data: quando, indirizzo: '93.41.•••.•••' }
            : c)));
        setStorico(prev => [{
            consenso: consenso.titolo,
            azione: dato ? 'Dato' : 'Revocato',
            data: quando,
            versione: VERSIONE_INFORMATIVA,
            indirizzo: '93.41.•••.•••',
        }, ...prev]);
        toast.success(dato ? 'Consenso registrato' : 'Consenso revocato');
    };

    return (
        <>
            <Helmet><title>I miei consensi - CRIA</title></Helmet>

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6" /> I miei consensi
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Cosa hai autorizzato, quando, e sulla base di quale versione dell'informativa.{' '}
                        <Link to="/privacy" className="underline hover:text-foreground">Leggi l'informativa in vigore ({VERSIONE_INFORMATIVA})</Link>.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 italic">Testi provvisori, da validare con il legale.</p>
                </div>

                <div className="space-y-3">
                    {consensi.map(c => (
                        <Card key={c.id}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex-1 min-w-[16rem]">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-medium text-foreground">{c.titolo}</p>
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${c.dato ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                                                {c.dato ? 'Dato' : 'Non dato'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{c.descrizione}</p>
                                        {c.data && (
                                            <p className="text-xs text-muted-foreground mt-2 tabular-nums">
                                                {c.dato ? 'Dato' : 'Revocato'} il {c.data} · informativa {VERSIONE_INFORMATIVA} · da {c.indirizzo}
                                            </p>
                                        )}
                                    </div>

                                    {c.dato ? (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">Revoca</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Revocare il consenso?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        <span className="block font-medium text-foreground mb-2">{c.titolo}</span>
                                                        {c.conseguenza}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => cambia(c.id, false)} className="bg-red-600 hover:bg-red-700">
                                                        Revoca
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    ) : (
                                        <Button size="sm" onClick={() => cambia(c.id, true)}>Dai il consenso</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><History className="w-5 h-5" /> Storico</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Consenso</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Azione</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Quando</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Informativa</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Da</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {storico.map((riga, i) => (
                                    <tr key={`${riga.data}-${riga.consenso}-${i}`}>
                                        <td className="px-4 py-3 text-foreground">{riga.consenso}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{riga.azione}</td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">{riga.data}</td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            <span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {riga.versione}</span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">{riga.indirizzo}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default ConsensiPage;
