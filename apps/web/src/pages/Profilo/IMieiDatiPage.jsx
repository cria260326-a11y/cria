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
import { FileSearch, Download, Scale, Pencil, Mail } from 'lucide-react';

// ═════════════════════════════════════════════════════════════════════════════
// I MIEI DATI — F-15
// Sapere cosa CRIA ha su di sé è un diritto (art. 15 GDPR) ed è gratuito. Si
// paga il certificato — il documento da mostrare a un terzo — non il dato.
// La strada gratuita deve essere visibile, non nascosta.
// Risposta entro 30 giorni solari (art. 12): in piattaforma il contatore è
// visibile e risale in automatico (G-09).
// ═════════════════════════════════════════════════════════════════════════════

const GIORNI_RISPOSTA = 30;

const fmt = (data) => new Date(data).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

const traGiorni = (giorni) => {
    const d = new Date();
    d.setDate(d.getDate() + giorni);
    return d;
};

const RICHIESTE_INIZIALI = [
    { codice: 'RD-2026-003', inviata: '2026-02-10', scadenza: '2026-03-12', stato: 'evasa', evasaIl: '2026-02-24' },
];

const STATI = {
    in_lavorazione: { label: 'In lavorazione', classe: 'bg-blue-100 text-blue-800' },
    evasa: { label: 'Pronta', classe: 'bg-green-100 text-green-800' },
};

const IMieiDatiPage = () => {
    const [richieste, setRichieste] = useState(RICHIESTE_INIZIALI);

    const richiedi = () => {
        const numero = String(richieste.length + 3).padStart(3, '0');
        setRichieste(prev => [{
            codice: `RD-2026-${numero}`,
            inviata: new Date(),
            scadenza: traGiorni(GIORNI_RISPOSTA),
            stato: 'in_lavorazione',
            evasaIl: null,
        }, ...prev]);
        toast.success(`Richiesta inviata: rispondiamo entro il ${fmt(traGiorni(GIORNI_RISPOSTA))}`);
    };

    return (
        <>
            <Helmet><title>I miei dati - CRIA</title></Helmet>

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                        <FileSearch className="w-6 h-6" /> I miei dati
                    </h1>
                    <p className="text-sm text-muted-foreground">Sapere cosa CRIA conserva su di te è un tuo diritto, ed è gratuito.</p>
                </div>

                <Card>
                    <CardContent className="p-6 space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-green-800 mb-1">Questa richiesta · gratuita</p>
                                <p className="text-sm text-green-950">Ti restituisce tutti i dati che abbiamo su di te, per te.</p>
                            </div>
                            <div className="rounded-xl bg-muted/40 border border-border p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Il certificato · a parte</p>
                                <p className="text-sm text-foreground">È un documento con QR fatto per essere mostrato a un terzo. È un'altra cosa.</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <p className="text-sm text-muted-foreground">Rispondiamo entro {GIORNI_RISPOSTA} giorni dalla richiesta.</p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="gap-2"><FileSearch className="w-4 h-4" /> Richiedi una copia dei miei dati</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Richiedere una copia dei tuoi dati?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Prepariamo un file con tutti i dati che CRIA conserva su di te e ti avvisiamo quando è pronto,
                                            entro il {fmt(traGiorni(GIORNI_RISPOSTA))}. Non costa niente.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                                        <AlertDialogAction onClick={richiedi}>Invia la richiesta</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-base">Le mie richieste</CardTitle></CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Richiesta</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Inviata</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Rispondiamo entro</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {richieste.map(r => (
                                    <tr key={r.codice}>
                                        <td className="px-4 py-3 font-mono text-xs text-foreground">{r.codice}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{fmt(r.inviata)}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{fmt(r.scadenza)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATI[r.stato].classe}`}>{STATI[r.stato].label}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {r.stato === 'evasa' && (
                                                <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => toast.success('Download avviato')}>
                                                    <Download className="w-3.5 h-3.5" /> Scarica
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Scale className="w-5 h-5" /> Gli altri tuoi diritti</CardTitle></CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <Pencil className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-muted-foreground">
                                <span className="font-medium text-foreground">Un dato è sbagliato?</span> Se riguarda un pagamento si apre una contestazione;
                                negli altri casi scrivi all'<Link to="/supporto" className="underline hover:text-foreground">assistenza</Link>.
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-muted-foreground">
                                <span className="font-medium text-foreground">Opposizione o cancellazione:</span>{' '}
                                scrivi a <a href="mailto:privacy@cri-affitti.it" className="underline hover:text-foreground">privacy@cri-affitti.it</a>.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default IMieiDatiPage;
