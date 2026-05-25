import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PaymentTimeline from '@/components/PaymentTimeline.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';
import {
    Home, Calendar, Euro, CheckCircle2, AlertTriangle,
    Bell, Download, Activity, Award, Info, FileText,
    MessageSquare, ArrowRight, Flag, XCircle, TrendingUp,
    Clock, Shield
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mock dati ─────────────────────────────────────────────────────────────────
const UTENTE = { nome: 'Sofia', cognome: 'Martini' };

const CONTRATTO = {
    immobile: 'Via Roma 42, Milano',
    locatore: 'Marco Bianchi',
    monthlyRent: 1200,
    durata: '12 mesi',
    dataInizio: '01/01/2026',
    dataFine: '31/12/2026',
    totalePagato: 4800,
    totalePrevisto: 14400,
    status: 'verde',
    payments: [
        { month: 0, paid: true, day: 3 },
        { month: 1, paid: true, day: 5 },
        { month: 2, paid: true, day: 4 },
        { month: 3, paid: true, day: 2 },
    ],
};

const SEGNALAZIONI_RICEVUTE = [
    {
        id: 1,
        data: '2026-04-03',
        mese: 'Aprile 2026',
        tipo: 'pagato',
        contestabile: false,
        contestata: false,
        giorniRimanenti: 0,
    },
    {
        id: 2,
        data: '2026-04-29',
        mese: 'Aprile 2026',
        tipo: 'non_pagato',
        contestabile: true,
        contestata: false,
        giorniRimanenti: 5,
    },
];

const CONTESTAZIONI_APERTE = [
    { id: 1, mese: 'Marzo 2026', stato: 'in verifica', dataApertura: '2026-03-29' },
];

const ATTIVITA = [
    { id: 1, testo: 'Hai pagato l\'affitto di Aprile', data: '03/04/2026', icon: CheckCircle2, color: 'text-green-600 bg-green-50', ref: '/dashboard/inquilino/pagamenti' },
    { id: 2, testo: 'Marco Bianchi ha segnalato il pagamento ricevuto', data: '04/04/2026', icon: Bell, color: 'text-blue-600 bg-blue-50', ref: '/dashboard/inquilino/segnalazioni' },
    { id: 3, testo: 'CRIA ha aggiornato lo stato della contestazione', data: '30/03/2026', icon: Activity, color: 'text-purple-600 bg-purple-50', ref: '/dashboard/inquilino/contestazioni/1' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;

const SCORE_CONFIG = {
    verde: { label: 'Inquilino affidabile', desc: 'Pagamenti regolari negli ultimi 12 mesi', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: Award },
    giallo: { label: 'Pagamenti in ritardo', desc: 'Hai pagato in ritardo negli ultimi mesi', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Clock },
    rosso: { label: 'Pagamenti irregolari', desc: 'Stai accumulando ritardi — recupera la regolarità', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle },
};

// ─── Componente ────────────────────────────────────────────────────────────────
const TenantDashboard = () => {
    const [segnalazioni, setSegnalazioni] = useState(SEGNALAZIONI_RICEVUTE);
    const score = SCORE_CONFIG[CONTRATTO.status];
    const ScoreIcon = score.icon;

    const percentualePagato = Math.round((CONTRATTO.totalePagato / CONTRATTO.totalePrevisto) * 100);
    const segnalazioniContestabili = segnalazioni.filter(s => s.contestabile && !s.contestata && s.tipo === 'non_pagato');

    return (
        <>
            <Helmet><title>Dashboard - CRIA</title></Helmet>

            <div className="min-h-screen bg-background">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                    {/* Intestazione */}
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Buongiorno, {UTENTE.nome} 👋</h1>
                            <p className="text-sm text-muted-foreground mt-1">Ecco la situazione del tuo contratto</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" className="gap-2"
                                onClick={() => toast.info('Download disponibile dopo backend')}>
                                <Download className="w-4 h-4" /> Scarica report
                            </Button>
                            <Link to="/dashboard/inquilino/assistenza">
                                <Button size="sm" className="gap-2">
                                    <MessageSquare className="w-4 h-4" /> Contatta CRIA
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Score affidabilità */}
                    <Card className={`border-2 ${score.border}`}>
                        <CardContent className={`pt-5 pb-5 ${score.bg} rounded-lg`}>
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className={`w-14 h-14 rounded-full bg-white flex items-center justify-center flex-shrink-0 ${score.color}`}>
                                    <ScoreIcon className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <p className={`text-lg font-bold ${score.color}`}>{score.label}</p>
                                    <p className="text-sm text-muted-foreground">{score.desc}</p>
                                </div>
                                <StatusBadge status={CONTRATTO.status} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contatori */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Immobile in affitto', value: '1', icon: Home, color: 'bg-blue-500' },
                            { label: 'Durata contratto', value: CONTRATTO.durata, icon: Calendar, color: 'bg-purple-500' },
                            { label: 'Totale pagato', value: fmtEur(CONTRATTO.totalePagato), icon: Euro, color: 'bg-green-500' },
                            { label: 'Pagamenti regolari', value: '4 / 4', icon: CheckCircle2, color: 'bg-teal-500' },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <Card key={label}>
                                <CardContent className="pt-5 pb-4 flex items-center gap-3">
                                    <div className={`p-2.5 rounded-lg ${color} flex-shrink-0`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
                                        <p className="text-xs text-muted-foreground">{label}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Avviso contestabili */}
                    {segnalazioniContestabili.length > 0 && (
                        <Link to="/dashboard/inquilino/segnalazioni">
                            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl hover:bg-yellow-100 transition-colors cursor-pointer">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-yellow-800">
                                        {segnalazioniContestabili.length} {segnalazioniContestabili.length === 1 ? 'segnalazione contestabile' : 'segnalazioni contestabili'}
                                    </p>
                                    <p className="text-xs text-yellow-700">
                                        Hai ricevuto delle segnalazioni di mancato pagamento. Puoi contestarle entro pochi giorni.
                                    </p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                            </div>
                        </Link>
                    )}

                    {/* Avviso contestazioni aperte */}
                    {CONTESTAZIONI_APERTE.length > 0 && (
                        <Link to="/dashboard/inquilino/contestazioni">
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                                <Activity className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700 flex-1">
                                    Hai <strong>{CONTESTAZIONI_APERTE.length} contestazione aperta</strong>. CRIA la sta gestendo — riceverai aggiornamenti.
                                </p>
                                <ArrowRight className="w-4 h-4 text-red-500 flex-shrink-0" />
                            </div>
                        </Link>
                    )}

                    {/* Progresso contratto + Storico pagamenti */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Progresso contratto */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <TrendingUp className="w-5 h-5" /> Progresso contratto
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <p className="text-3xl font-bold text-foreground tabular-nums">{percentualePagato}%</p>
                                    <p className="text-sm text-muted-foreground">
                                        {fmtEur(CONTRATTO.totalePagato)} di {fmtEur(CONTRATTO.totalePrevisto)}
                                    </p>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all"
                                        style={{ width: `${percentualePagato}%` }} />
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-sm">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Inizio contratto</p>
                                        <p className="font-medium text-foreground">{CONTRATTO.dataInizio}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Fine contratto</p>
                                        <p className="font-medium text-foreground">{CONTRATTO.dataFine}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contratto attivo */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Home className="w-5 h-5" /> Il mio contratto
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Immobile</p>
                                    <p className="font-medium text-foreground">{CONTRATTO.immobile}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">locatore</p>
                                    <p className="font-medium text-foreground">{CONTRATTO.locatore}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Canone mensile</p>
                                    <p className="font-medium text-foreground">{fmtEur(CONTRATTO.monthlyRent)}</p>
                                </div>
                                <Link to="/dashboard/inquilino/contratto">
                                    <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                                        <FileText className="w-3.5 h-3.5" /> Apri scheda contratto
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Storico pagamenti */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Euro className="w-5 h-5" /> Storico pagamenti — ultimi 12 mesi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PaymentTimeline payments={CONTRATTO.payments} />
                            <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-800">
                                    Mantenere uno storico di pagamenti regolari aumenta il tuo punteggio inquilino e ti dà accesso a vantaggi futuri su nuovi contratti.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attività recenti */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Activity className="w-5 h-5" /> Attività recenti
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {ATTIVITA.map(a => {
                                const Icon = a.icon;
                                return (
                                    <Link key={a.id} to={a.ref} className="flex items-start gap-3 hover:bg-muted/30 -mx-2 px-2 py-1.5 rounded-lg">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${a.color}`}>
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-foreground leading-snug">{a.testo}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{a.data}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </>
    );
};

export default TenantDashboard;