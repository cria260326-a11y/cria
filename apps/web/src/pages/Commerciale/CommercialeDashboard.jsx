import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users, FileText, Euro, TrendingUp, Activity,
    ArrowRight, Award, AlertTriangle, CheckCircle2,
    Target, ExternalLink, Copy, Clock
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mock dati ─────────────────────────────────────────────────────────────────
const UTENTE = { nome: 'Roberto', cognome: 'Bruno', codiceReferente: 'CRIA-RB-2026' };

const STATS = {
    clientiTotali: 28,
    clientiAttivi: 24,
    contrattiTotali: 22,
    provvigioniMese: 1280,
    provvigioniMesePrec: 980,
    provvigioniAnno: 8650,
    provvigioniMaturate: 450,
    contestazioniInfo: 2,
    conversioni: 87, // percentuale registrazioni → acquisto
};

const ANDAMENTO = [
    { mese: 'Gen', valore: 580 },
    { mese: 'Feb', valore: 720 },
    { mese: 'Mar', valore: 1100 },
    { mese: 'Apr', valore: 980 },
    { mese: 'Mag', valore: 1280 },
];

const ATTIVITA = [
    { id: 1, testo: 'Nuova provvigione di € 50 per Sara Conti — CRIA Gestione', data: '03/05/2026', icon: Euro, color: 'text-green-600 bg-green-50', ref: '/dashboard/commerciale/provvigioni' },
    { id: 2, testo: 'Marco Esposito ha completato l\'acquisto CRIA Completo', data: '02/05/2026', icon: CheckCircle2, color: 'text-blue-600 bg-blue-50', ref: '/dashboard/commerciale/clienti/4' },
    { id: 3, testo: 'Nuovo cliente registrato con il tuo codice — Luca Romano', data: '01/05/2026', icon: Users, color: 'text-purple-600 bg-purple-50', ref: '/dashboard/commerciale/clienti/3' },
    { id: 4, testo: 'Provvigione di € 30 pagata sul tuo IBAN', data: '30/04/2026', icon: Euro, color: 'text-amber-600 bg-amber-50', ref: '/dashboard/commerciale/provvigioni' },
    { id: 5, testo: 'Contestazione aperta su contratto Marco Esposito', data: '28/04/2026', icon: AlertTriangle, color: 'text-red-600 bg-red-50', ref: '/dashboard/commerciale/clienti/4' },
];

const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;

const URL_REFERENTE = `https://cria.it/registrazione?ref=${UTENTE.codiceReferente}`;

// ─── Mini bar chart ────────────────────────────────────────────────────────────
const MiniBars = ({ data, color = 'bg-primary' }) => {
    const max = Math.max(...data.map(d => d.valore));
    return (
        <div className="flex items-end gap-2 h-32">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="text-xs text-foreground font-medium tabular-nums">{fmtEur(d.valore)}</div>
                    <div className="w-full flex items-end h-20">
                        <div className={`w-full rounded-t-md ${color} transition-all`}
                            style={{ height: `${(d.valore / max) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{d.mese}</span>
                </div>
            ))}
        </div>
    );
};

const CommercialeDashboard = () => {
    const variazione = ((STATS.provvigioniMese - STATS.provvigioniMesePrec) / STATS.provvigioniMesePrec * 100).toFixed(1);
    const positiva = variazione > 0;

    const copiaLink = () => {
        navigator.clipboard.writeText(URL_REFERENTE);
        toast.success('Link copiato negli appunti');
    };

    return (
        <>
            <Helmet><title>Dashboard - CRIA Commerciale</title></Helmet>

            <div className="min-h-screen bg-background">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                    {/* Intestazione */}
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Buongiorno, {UTENTE.nome} 👋</h1>
                            <p className="text-sm text-muted-foreground mt-1">Ecco la situazione delle tue vendite</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Button variant="outline" size="sm" className="gap-2" onClick={copiaLink}>
                                <Copy className="w-4 h-4" /> Copia link referente
                            </Button>
                            <Link to="/dashboard/commerciale/profilo">
                                <Button size="sm" className="gap-2">
                                    <Award className="w-4 h-4" /> Il mio codice
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Banner codice referente */}
                    <Card className="border-2 border-primary/20">
                        <CardContent className="pt-5 pb-5 bg-primary/5 rounded-lg">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Award className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Il tuo codice referente</p>
                                    <p className="text-lg font-bold text-foreground font-mono">{UTENTE.codiceReferente}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Condividilo per generare nuovi clienti e maturare provvigioni</p>
                                </div>
                                <Button variant="outline" size="sm" className="gap-2"
                                    onClick={() => { navigator.clipboard.writeText(UTENTE.codiceReferente); toast.success('Codice copiato'); }}>
                                    <Copy className="w-3.5 h-3.5" /> Copia codice
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* KPI principali */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Clienti totali', value: STATS.clientiTotali, sub: `${STATS.clientiAttivi} attivi`, icon: Users, color: 'bg-blue-500' },
                            { label: 'Contratti generati', value: STATS.contrattiTotali, sub: `${STATS.conversioni}% conversione`, icon: FileText, color: 'bg-purple-500' },
                            { label: 'Provvigioni mese', value: fmtEur(STATS.provvigioniMese), sub: `${positiva ? '+' : ''}${variazione}% vs scorso`, icon: Euro, color: 'bg-green-500' },
                            { label: 'Provvigioni anno', value: fmtEur(STATS.provvigioniAnno), sub: `${fmtEur(STATS.provvigioniMaturate)} da incassare`, icon: TrendingUp, color: 'bg-amber-500' },
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

                    {/* Avviso contestazioni */}
                    {STATS.contestazioniInfo > 0 && (
                        <Link to="/dashboard/commerciale/clienti">
                            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors cursor-pointer">
                                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-amber-800">
                                        {STATS.contestazioniInfo} contestazioni aperte sui tuoi contratti
                                    </p>
                                    <p className="text-xs text-amber-700">
                                        CRIA le sta gestendo. Le visualizzi solo a titolo informativo.
                                    </p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            </div>
                        </Link>
                    )}

                    {/* Andamento + Attività */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <TrendingUp className="w-5 h-5" /> Andamento provvigioni
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <MiniBars data={ANDAMENTO} color="bg-green-500" />
                                <div className="flex justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                                    <span>Totale: <strong className="text-foreground tabular-nums">{fmtEur(ANDAMENTO.reduce((s, x) => s + x.valore, 0))}</strong></span>
                                    <span>Media: <strong className="text-foreground tabular-nums">{fmtEur(Math.round(ANDAMENTO.reduce((s, x) => s + x.valore, 0) / ANDAMENTO.length))}</strong></span>
                                </div>
                            </CardContent>
                        </Card>

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

                    {/* Performance KPI */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Target className="w-5 h-5" /> La tua performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[
                                    { label: 'Tasso conversione', value: `${STATS.conversioni}%`, trend: '+5%', positive: true },
                                    { label: 'Provvigione media', value: fmtEur(58), trend: '+€8', positive: true },
                                    { label: 'Tempo medio chiusura', value: '4.2 gg', trend: '-1gg', positive: true },
                                    { label: 'Posizione classifica', value: '#3', trend: '+1', positive: true },
                                ].map(p => (
                                    <div key={p.label} className="p-3 bg-muted/30 rounded-lg">
                                        <p className="text-xs text-muted-foreground">{p.label}</p>
                                        <p className="text-lg font-bold text-foreground tabular-nums mt-1">{p.value}</p>
                                        {p.trend && (
                                            <p className={`text-xs mt-1 ${p.positive ? 'text-green-600' : 'text-red-600'}`}>
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

export default CommercialeDashboard;