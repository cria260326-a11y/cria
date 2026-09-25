import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { Mail, MailCheck, MailOpen, MailX, Server, RotateCcw, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import NotaMockup from '@/components/NotaMockup';
import RegistroEmail from '@/components/admin/comunicazioni/RegistroEmail';
import InviaEmail from '@/components/admin/comunicazioni/InviaEmail';
import ModelliEmail from '@/components/admin/comunicazioni/ModelliEmail';
import StatoInvio from '@/components/admin/comunicazioni/StatoInvio';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { useRegistroEmail, vedeSoloAggregati, motivoSoloAggregati, ripristinaComunicazioniDemo } from '@/lib/comunicazioniDemo';
import { MODELLI_EMAIL, POSTMARK, STATI_INVIO } from '@/data/comunicazioni';

// ═════════════════════════════════════════════════════════════════════════════
// EMAIL — O-23
// Gli invii della piattaforma con Postmark: il registro — modello, destinatario,
// stato, data —, i modelli e l'invio dalla sezione. Il registro racconta gli
// stessi fatti delle aree di proprietario e inquilino: i solleciti del mese,
// gli avvisi della contestazione a entrambe le parti, l'esito di CRIA Verifica
// che per email dice solo di accedere. La direzione e il DPO vedono i numeri.
// ═════════════════════════════════════════════════════════════════════════════

const conta = (elenco, chiave) => elenco.reduce((t, e) => ({ ...t, [e[chiave]]: (t[e[chiave]] || 0) + 1 }), {});

const SoloNumeri = ({ registro, operatore }) => {
    const perModello = Object.entries(conta(registro, 'modello')).sort((a, b) => b[1] - a[1]);
    const perStato = Object.entries(conta(registro, 'stato'));
    return (
        <div className="space-y-6">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-[#1A2D52] flex-shrink-0" />
                <p>{motivoSoloAggregati(operatore)}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">Per stato</CardTitle></CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        {perStato.map(([s, n]) => <span key={s} className="inline-flex items-center gap-2 text-sm"><StatoInvio stato={s} canale="email" /> <span className="tabular-nums">{n}</span></span>)}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base">Per modello</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <ul className="divide-y divide-border border-t border-border">
                            {perModello.map(([m, n]) => (
                                <li key={m} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                                    <span className="text-foreground">{MODELLI_EMAIL[m]?.nome || m}</span>
                                    <span className="tabular-nums text-muted-foreground">{n}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const EmailPage = () => {
    const { operatore } = useOperatoreAttivo();
    const registro = useRegistroEmail();
    const soloNumeri = vedeSoloAggregati(operatore);

    const numeri = useMemo(() => {
        const esito = (e) => STATI_INVIO[e.stato]?.esito;
        return {
            totale: registro.length,
            consegnate: registro.filter(e => esito(e) === 'ok').length,
            aperte: registro.filter(e => e.stato === 'aperta').length,
            ko: registro.filter(e => esito(e) === 'ko').length,
        };
    }, [registro]);

    const ripristina = () => {
        ripristinaComunicazioniDemo();
        toast.success('Tolte le email mandate dalla sezione');
    };

    return (
        <>
            <Helmet><title>Email - CRIA</title></Helmet>

            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Email"
                    sottotitolo="Gli invii della piattaforma con Postmark: il registro, i modelli e l’invio da qui."
                />

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Contatore icona={Mail} colore="bg-[#1A2D52]" valore={numeri.totale} etichetta="Email nel registro" />
                    <Contatore icona={MailCheck} colore="bg-green-600" valore={numeri.consegnate} etichetta="Consegnate" nota="Aperte comprese" />
                    <Contatore icona={MailOpen} colore="bg-emerald-600" valore={numeri.aperte} etichetta="Aperte" />
                    <Contatore icona={MailX} colore="bg-red-500" valore={numeri.ko} etichetta="Rimbalzate o spam" />
                </div>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base"><Server className="w-5 h-5" /> Postmark</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p className="text-foreground"><span className="font-medium">Stato:</span> {POSTMARK.stato}. <span className="font-medium">Flusso:</span> {POSTMARK.flusso}.</p>
                        <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                            {POSTMARK.note.map(n => <li key={n}>{n}</li>)}
                        </ul>
                    </CardContent>
                </Card>

                {soloNumeri ? <SoloNumeri registro={registro} operatore={operatore} /> : (
                    <Tabs defaultValue="registro" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="registro">Registro</TabsTrigger>
                            <TabsTrigger value="invia">Invia</TabsTrigger>
                            <TabsTrigger value="modelli">Modelli</TabsTrigger>
                        </TabsList>
                        <TabsContent value="registro"><RegistroEmail registro={registro} /></TabsContent>
                        <TabsContent value="invia"><InviaEmail /></TabsContent>
                        <TabsContent value="modelli"><ModelliEmail registro={registro} /></TabsContent>
                    </Tabs>
                )}

                <NotaMockup>
                    <p>Nessuna email parte davvero: il registro si ricava dai dati demo, e quelle mandate da qui restano in questo browser, con il nome di chi le ha mandate.</p>
                    <Button size="sm" variant="outline" className="mt-3 gap-2 bg-white" onClick={ripristina}>
                        <RotateCcw className="w-3.5 h-3.5" /> Togli le email mandate da qui
                    </Button>
                </NotaMockup>
            </div>
        </>
    );
};

export default EmailPage;
