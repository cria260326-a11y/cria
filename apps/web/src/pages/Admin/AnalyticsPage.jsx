import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Activity, Users, TrendingUp, TrendingDown, UserPlus,
    CheckCircle2, Target, Clock, Award,
    ArrowUpRight, ArrowDownRight, BarChart3, PieChart,
    Globe, Calendar, Download, Zap
} from 'lucide-react';

// ─── Mock dati ─────────────────────────────────────────────────────────────────
const REGISTRAZIONI_MENSILI = [
    { mese: 'Gen', valore: 42 },
    { mese: 'Feb', valore: 58 },
    { mese: 'Mar', valore: 71 },
    { mese: 'Apr', valore: 89 },
    { mese: 'Mag', valore: 104 },
];

const FUNNEL_CONVERSION = [
    { step: 'Visitatori sito', valore: 12450, percentuale: 100 },
    { step: 'Click "Inizia"', valore: 3200, percentuale: 25.7 },
    { step: 'Registrazioni', valore: 1180, percentuale: 9.5 },
    { step: 'Onboarding completato', valore: 420, percentuale: 3.4 },
    { step: 'Preventivo accettato', valore: 285, percentuale: 2.3 },
    { step: 'Pagamento completato', valore: 247, percentuale: 2.0 },
];

const PRODOTTI_VENDITE = [
    { nome: 'CRIA Gestione (P1)', vendite: 87, ricavoTotale: 26013, percentuale: 35 },
    { nome: 'CRIA Completo (P2)', vendite: 62, ricavoTotale: 30938, percentuale: 41 },
    { nome: 'CRIA Verifica (P3)', vendite: 489, ricavoTotale: 23961, percentuale: 24 },
];

const TOP_COMMERCIALI = [
    { nome: 'Roberto Bruno', vendite: 28, ricavo: 12450 },
    { nome: 'Anna Verdi', vendite: 22, ricavo: 9870 },
    { nome: 'Marco Colombo', vendite: 18, ricavo: 7240 },
    { nome: 'Lucia De Santis', vendite: 15, ricavo: 6580 },
    { nome: 'Giorgio Marchetti', vendite: 12, ricavo: 4990 },
];

const CITTA_TOP = [
    { citta: 'Milano', immobili: 142, percentuale: 33.6 },
    { citta: 'Roma', immobili: 98, percentuale: 23.2 },
    { citta: 'Torino', immobili: 56, percentuale: 13.2 },
    { citta: 'Bologna', immobili: 42, percentuale: 9.9 },
    { citta: 'Firenze', immobili: 35, percentuale: 8.3 },
    { citta: 'Altre', immobili: 50, percentuale: 11.8 },
];

const PERFORMANCE_KPI = {
    tempoRispostaP3: '32h',  // su 48h target
    tempoRispostaPreventivo: '18h',  // su 24h target
    tempoRisoluzioneContest: '4.2gg',// su 7gg target
    uptimeServizio: '99.97%',
    npsScore: 72,
    csatScore: 4.6,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;
const fmtNum = (n) => n.toLocaleString('it-IT');

// ─── Mini sparkline ────────────────────────────────────────────────────────────
const Sparkline = ({ data, color = '#6366f1' }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(' ');
    return (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-12">
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
    );
};

// ─── Bar chart verticale ───────────────────────────────────────────────────────
const VerticalBars = ({ data, color = 'bg-primary' }) => {
    const max = Math.max(...data.map(d => d.valore));
    return (
        <div className="flex items-end gap-2 h-40">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="text-xs text-foreground font-medium tabular-nums">{d.valore}</div>
                    <div className="w-full flex items-end h-28">
                        <div className={`w-full rounded-t-md ${color} transition-all`}
                            style={{ height: `${(d.valore / max) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{d.mese}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Funnel ────────────────────────────────────────────────────────────────────
const Funnel = ({ data }) => {
    return (
        <div className="space-y-2">
            {data.map((d, i) => {
                const dropoff = i > 0 ? ((data[i - 1].valore - d.valore) / data[i - 1].valore * 100).toFixed(1) : null;
                return (
                    <div key={i} className="space-y-1.5">
                        {dropoff && (
                            <div className="flex items-center gap-1.5 text-xs text-red-500 ml-4">
                                <ArrowDownRight className="w-3 h-3" />
                                <span>{dropoff}% perso</span>
                            </div>
                        )}
                        <div className="bg-primary/10 rounded-lg overflow-hidden relative">
                            <div className="h-12 bg-primary flex items-center justify-between px-4 transition-all"
                                style={{ width: `${d.percentuale}%`, minWidth: '20%' }}>
                                <span className="text-sm font-medium text-primary-foreground truncate">{d.step}</span>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                <span className="text-sm font-bold text-foreground tabular-nums">{fmtNum(d.valore)}</span>
                                <span className="text-xs text-muted-foreground tabular-nums">{d.percentuale}%</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const AnalyticsPage = () => {
    const [periodo, setPeriodo] = useState('mese');

    return (
        <>
            <Helmet><title>Analytics - CRIA Admin</title></Helmet>

            <div className="space-y-6">

                {/* Intestazione */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Analytics</h1>
                        <p className="text-sm text-muted-foreground">KPI, trend e indicatori di performance della piattaforma</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" /> Esporta report
                        </Button>
                    </div>
                </div>

                {/* Periodo */}
                <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
                    {[
                        { id: '7gg', label: 'Ultimi 7 giorni' },
                        { id: 'mese', label: 'Ultimi 30 giorni' },
                        { id: 'trimestre', label: 'Ultimi 90 giorni' },
                        { id: 'anno', label: 'Ultimo anno' },
                    ].map(p => (
                        <button key={p.id} onClick={() => setPeriodo(p.id)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${periodo === p.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                }`}>
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* KPI con sparkline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Nuove registrazioni', value: 104, icon: UserPlus, color: 'bg-blue-500', varValue: 16.8, data: [42, 58, 71, 89, 104], lineColor: '#3b82f6' },
                        { label: 'Onboarding completi', value: 87, icon: CheckCircle2, color: 'bg-green-500', varValue: 12.3, data: [38, 51, 64, 78, 87], lineColor: '#22c55e' },
                        { label: 'Conversion rate', value: '7.2%', icon: Target, color: 'bg-purple-500', varValue: -2.1, data: [9.1, 8.5, 8.0, 7.4, 7.2], lineColor: '#a855f7' },
                        { label: 'Tempo medio onboarding', value: '4.2gg', icon: Clock, color: 'bg-amber-500', varValue: -8.5, data: [5.8, 5.2, 4.8, 4.5, 4.2], lineColor: '#f59e0b' },
                    ].map(({ label, value, icon: Icon, color, varValue, data, lineColor }) => {
                        const positive = label.startsWith('Tempo') ? varValue < 0 : varValue > 0;
                        return (
                            <Card key={label}>
                                <CardContent className="pt-5 pb-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-2.5 rounded-lg ${color}`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {positive ? '+' : ''}{varValue}%
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 mb-2">{label}</p>
                                    <Sparkline data={data} color={lineColor} />
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Trend registrazioni + Funnel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BarChart3 className="w-5 h-5" /> Registrazioni mensili
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <VerticalBars data={REGISTRAZIONI_MENSILI} color="bg-blue-500" />
                            <div className="flex justify-between text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
                                <span>Totale: <strong className="text-foreground tabular-nums">{REGISTRAZIONI_MENSILI.reduce((s, r) => s + r.valore, 0)}</strong></span>
                                <span>Media: <strong className="text-foreground tabular-nums">{Math.round(REGISTRAZIONI_MENSILI.reduce((s, r) => s + r.valore, 0) / REGISTRAZIONI_MENSILI.length)}/mese</strong></span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Target className="w-5 h-5" /> Funnel di conversione
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Funnel data={FUNNEL_CONVERSION} />
                        </CardContent>
                    </Card>
                </div>

                {/* Vendite prodotti + Città */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <PieChart className="w-5 h-5" /> Distribuzione vendite per prodotto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {PRODOTTI_VENDITE.map(p => (
                                <div key={p.nome} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-foreground">{p.nome}</span>
                                        <span className="tabular-nums text-foreground">{fmtEur(p.ricavoTotale)}</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all"
                                            style={{ width: `${p.percentuale}%` }} />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{p.vendite} vendite</span>
                                        <span>{p.percentuale}% del ricavo</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Globe className="w-5 h-5" /> Distribuzione geografica
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {CITTA_TOP.map(c => (
                                <div key={c.citta} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-foreground">{c.citta}</span>
                                        <span className="text-muted-foreground tabular-nums">{c.immobili} ({c.percentuale}%)</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full transition-all"
                                            style={{ width: `${c.percentuale}%` }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Top commerciali + Performance KPI */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Award className="w-5 h-5" /> Top commerciali del mese
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {TOP_COMMERCIALI.map((c, i) => (
                                <div key={c.nome} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-400 text-yellow-950' :
                                            i === 1 ? 'bg-gray-300 text-gray-900' :
                                                i === 2 ? 'bg-orange-400 text-orange-950' :
                                                    'bg-muted text-muted-foreground'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{c.nome}</p>
                                        <p className="text-xs text-muted-foreground">{c.vendite} vendite</p>
                                    </div>
                                    <p className="text-sm font-semibold text-foreground tabular-nums">{fmtEur(c.ricavo)}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Zap className="w-5 h-5" /> KPI di performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Tempo risposta P3', value: PERFORMANCE_KPI.tempoRispostaP3, target: 'su 48h', ok: true },
                                { label: 'Risposta preventivo', value: PERFORMANCE_KPI.tempoRispostaPreventivo, target: 'su 24h', ok: true },
                                { label: 'Risoluzione contest.', value: PERFORMANCE_KPI.tempoRisoluzioneContest, target: 'su 7gg', ok: true },
                                { label: 'Uptime servizio', value: PERFORMANCE_KPI.uptimeServizio, target: 'SLA 99.9%', ok: true },
                                { label: 'NPS Score', value: PERFORMANCE_KPI.npsScore, target: 'Ottimo', ok: true },
                                { label: 'CSAT Score', value: PERFORMANCE_KPI.csatScore + '/5', target: 'Eccellente', ok: true },
                            ].map(k => (
                                <div key={k.label} className="p-3 bg-muted/30 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs text-muted-foreground">{k.label}</p>
                                        {k.ok && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                    </div>
                                    <p className="text-lg font-bold text-foreground tabular-nums">{k.value}</p>
                                    <p className="text-xs text-muted-foreground">{k.target}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </>
    );
};

export default AnalyticsPage;