import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users, Scale, FileText, Euro, Activity, Clock,
    AlertTriangle, CheckCircle2, ArrowRight, Calendar,
    MessageSquare, TrendingUp, Award
} from 'lucide-react';

// ─── Mock dati ─────────────────────────────────────────────────────────────────
const UTENTE = { nome: 'Paolo', cognome: 'Conti', titolo: 'Avv.' };

const STATS = {
    clientiTotali: 18,
    clientiAttivi: 12,
    contestazioniAperte: 4,
    contestazioniChiuse: 23,
    documentiVerifica: 7,
    ticketAperti: 5,
    compensiMaturati: 2400,
    compensiPagati: 18400,
};

const SCADENZE_PROSSIME = [
    { id: 1, data: '2026-05-04', testo: 'Verificare documenti contestazione #2 — Marco Esposito', priorita: 'alta', ref: '/dashboard/avvocato/clienti/4' },
    { id: 2, data: '2026-05-05', testo: 'Risposta entro 48h — ticket Sofia Martini', priorita: 'alta', ref: '/dashboard/avvocato/clienti/2' },
    { id: 3, data: '2026-05-08', testo: 'Chiusura contestazione #3 entro finestra 7 giorni', priorita: 'media', ref: '/dashboard/avvocato/clienti/5' },
    { id: 4, data: '2026-05-15', testo: 'Aggiornamento note pratica — Luca Romano', priorita: 'bassa', ref: '/dashboard/avvocato/clienti/3' },
];

const ATTIVITA_RECENTI = [
    { id: 1, testo: 'Hai risolto la contestazione #1 a favore inquilino', data: '02/05/2026', icon: CheckCircle2, color: 'text-green-600 bg-green-50', ref: '/dashboard/avvocato/clienti/1' },
    { id: 2, testo: 'Verificato documento "Ricevuta bonifico Marzo.pdf"', data: '02/05/2026', icon: FileText, color: 'text-blue-600 bg-blue-50', ref: '/dashboard/avvocato/clienti/1' },
    { id: 3, testo: 'Nuovo ticket assegnato — Sofia Martini', data: '01/05/2026', icon: MessageSquare, color: 'text-purple-600 bg-purple-50', ref: '/dashboard/avvocato/clienti/2' },
    { id: 4, testo: 'Compenso di € 150 maturato per chiusura contestazione', data: '01/05/2026', icon: Euro, color: 'text-amber-600 bg-amber-50', ref: '/dashboard/avvocato/compensi' },
    { id: 5, testo: 'Nuovo cliente assegnato — Marco Esposito', data: '28/04/2026', icon: Users, color: 'text-teal-600 bg-teal-50', ref: '/dashboard/avvocato/clienti/4' },
];

const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;
const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const PRIORITA_COLOR = {
    alta: 'bg-red-100 text-red-700',
    media: 'bg-yellow-100 text-yellow-700',
    bassa: 'bg-gray-100 text-gray-600',
};

const AvvocatoDashboard = () => {

    return (
        <>
            <Helmet><title>Dashboard - CRIA Avvocato</title></Helmet>

            <div className="min-h-screen bg-background">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                    {/* Intestazione */}
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Buongiorno, {UTENTE.titolo} {UTENTE.cognome}</h1>
                            <p className="text-sm text-muted-foreground mt-1">Ecco la situazione delle pratiche assegnate</p>
                        </div>
                        <Link to="/dashboard/avvocato/coda">
                            <Button className="gap-2">
                                <CheckSquareIcon /> Vai alla coda di lavoro
                            </Button>
                        </Link>
                    </div>

                    {/* KPI principali */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Clienti assegnati', value: STATS.clientiTotali, sub: `${STATS.clientiAttivi} attivi`, icon: Users, color: 'bg-blue-500' },
                            { label: 'Contestazioni aperte', value: STATS.contestazioniAperte, sub: `${STATS.contestazioniChiuse} chiuse`, icon: Scale, color: 'bg-red-500' },
                            { label: 'Da fare oggi', value: STATS.documentiVerifica + STATS.ticketAperti, sub: `${STATS.documentiVerifica} doc · ${STATS.ticketAperti} ticket`, icon: Activity, color: 'bg-amber-500' },
                            { label: 'Compensi maturati', value: fmtEur(STATS.compensiMaturati), sub: `${fmtEur(STATS.compensiPagati)} pagati`, icon: Euro, color: 'bg-green-500' },
                        ].map(({ label, value, sub, icon: Icon, color }) => (
                            <Card key={label}>
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-2.5 rounded-lg ${color}`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    {sub && <p className="text-xs text-muted-foreground/70 mt-1">{sub}</p>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Alert coda di lavoro */}
                    {(STATS.documentiVerifica + STATS.ticketAperti + STATS.contestazioniAperte) > 0 && (
                        <Link to="/dashboard/avvocato/coda">
                            <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer">
                                <Activity className="w-5 h-5 text-primary flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">
                                        Hai {STATS.documentiVerifica + STATS.ticketAperti + STATS.contestazioniAperte} attività in coda
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {STATS.documentiVerifica} documenti da verificare · {STATS.ticketAperti} ticket aperti · {STATS.contestazioniAperte} contestazioni in gestione
                                    </p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
                            </div>
                        </Link>
                    )}

                    {/* Scadenze prossime + Attività recenti */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Calendar className="w-5 h-5" /> Scadenze prossime
                                    </CardTitle>
                                    <Link to="/dashboard/avvocato/scadenze" className="text-xs text-primary hover:underline flex items-center gap-1">
                                        Tutte <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {SCADENZE_PROSSIME.map(s => (
                                    <Link key={s.id} to={s.ref} className="flex items-start gap-3 hover:bg-muted/30 -mx-2 px-2 py-1.5 rounded-lg">
                                        <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-foreground leading-snug">{s.testo}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-muted-foreground tabular-nums">{fmtData(s.data)}</p>
                                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${PRIORITA_COLOR[s.priorita]}`}>
                                                    {s.priorita}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Activity className="w-5 h-5" /> Attività recenti
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {ATTIVITA_RECENTI.map(a => {
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

                    {/* Performance */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Award className="w-5 h-5" /> La tua performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'Tempo medio risoluzione', value: '3.4 gg', trend: '-12%', positive: true },
                                    { label: 'Contestazioni risolte', value: '23', trend: '+18%', positive: true },
                                    { label: 'Tasso a favore inquilino', value: '34%', trend: 'stabile', positive: null },
                                    { label: 'Soddisfazione clienti', value: '4.7/5', trend: '+0.3', positive: true },
                                ].map(p => (
                                    <div key={p.label} className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-xs text-muted-foreground">{p.label}</p>
                                        <p className="text-lg font-bold text-foreground tabular-nums mt-1">{p.value}</p>
                                        {p.trend && (
                                            <p className={`text-xs mt-1 ${p.positive === true ? 'text-green-600' :
                                                    p.positive === false ? 'text-red-600' : 'text-muted-foreground'
                                                }`}>
                                                {p.trend} vs mese scorso
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </>
    );
};

// Helper icona pulsante
const CheckSquareIcon = () => <Activity className="w-4 h-4" />;

export default AvvocatoDashboard;