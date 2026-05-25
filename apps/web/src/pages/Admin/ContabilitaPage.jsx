import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    TrendingUp, TrendingDown, Euro, ArrowUpRight, ArrowDownRight,
    Wallet, CreditCard, Users, Percent, Download,
    ChevronLeft, ChevronRight, Eye, ArrowRight, Activity,
    PieChart, BarChart3
} from 'lucide-react';

// ─── Mock dati ─────────────────────────────────────────────────────────────────
const MESI_NUM = [
    { num: '01', label: 'Gen', incassi: 142000, uscite: 98000, provvigioni: 14200 },
    { num: '02', label: 'Feb', incassi: 156000, uscite: 102000, provvigioni: 15600 },
    { num: '03', label: 'Mar', incassi: 184000, uscite: 121000, provvigioni: 18400 },
    { num: '04', label: 'Apr', incassi: 198000, uscite: 135000, provvigioni: 19800 },
    { num: '05', label: 'Mag', incassi: 212000, uscite: 146000, provvigioni: 21200 },
];

const MOVIMENTI_RECENTI = [
    { id: 1, data: '2026-05-04', tipo: 'incasso', descrizione: 'Pagamento abbonamento - Marco Bianchi', importo: 49, metodo: 'Stripe', ref: '/dashboard/admin/pagamenti' },
    { id: 2, data: '2026-05-04', tipo: 'uscita', descrizione: 'Bonifico locatore P2 - Elena Greco', importo: 1450, metodo: 'Bonifico', ref: '/dashboard/admin/bonifici' },
    { id: 3, data: '2026-05-03', tipo: 'incasso', descrizione: 'Vendita CRIA Gestione - Sara Conti', importo: 299, metodo: 'Stripe', ref: '/dashboard/admin/vendite' },
    { id: 4, data: '2026-05-03', tipo: 'provvigione', descrizione: 'Provvigione commerciale - Roberto Bruno', importo: 50, metodo: 'Bonifico', ref: '/dashboard/admin/provvigioni' },
    { id: 5, data: '2026-05-02', tipo: 'incasso', descrizione: 'Vendita CRIA Verifica - Cliente P3', importo: 49, metodo: 'Stripe', ref: '/dashboard/admin/vendite' },
    { id: 6, data: '2026-05-02', tipo: 'uscita', descrizione: 'Compenso avvocato - Avv. Paolo Conti', importo: 150, metodo: 'Bonifico', ref: '/dashboard/admin/collaboratori/5' },
    { id: 7, data: '2026-05-01', tipo: 'incasso', descrizione: 'Vendita CRIA Completo - Marco Esposito', importo: 499, metodo: 'Stripe', ref: '/dashboard/admin/vendite' },
    { id: 8, data: '2026-05-01', tipo: 'uscita', descrizione: 'Bonifico locatore P2 - Marco Bianchi', importo: 1200, metodo: 'Bonifico', ref: '/dashboard/admin/bonifici' },
];

const BREAKDOWN_PRODOTTI = [
    { prodotto: 'CRIA Gestione (P1)', vendite: 14, ricavo: 4186, percentuale: 28 },
    { prodotto: 'CRIA Completo (P2)', vendite: 22, ricavo: 10978, percentuale: 73 },
    { prodotto: 'CRIA Verifica (P3)', vendite: 89, ricavo: 4361, percentuale: 29 },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;
const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const TIPO_CONFIG = {
    incasso: { label: 'Incasso', color: 'text-green-600', bg: 'bg-green-50', icon: ArrowDownRight },
    uscita: { label: 'Uscita', color: 'text-red-600', bg: 'bg-red-50', icon: ArrowUpRight },
    provvigione: { label: 'Provvigione', color: 'text-purple-600', bg: 'bg-purple-50', icon: Percent },
};

// ─── Mini grafico a barre ──────────────────────────────────────────────────────
const MiniBarChart = ({ data, dataKey, color = 'bg-primary' }) => {
    const max = Math.max(...data.map(d => d[dataKey]));
    return (
        <div className="flex items-end gap-2 h-32">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex items-end h-24">
                        <div className={`w-full rounded-t-md ${color} transition-all`}
                            style={{ height: `${(d[dataKey] / max) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const ContabilitaPage = () => {
    const [periodo, setPeriodo] = useState('mese'); // 'mese' | 'trimestre' | 'anno'

    const meseAttuale = MESI_NUM[MESI_NUM.length - 1];
    const mesePrecedente = MESI_NUM[MESI_NUM.length - 2];

    const incassiVar = ((meseAttuale.incassi - mesePrecedente.incassi) / mesePrecedente.incassi * 100).toFixed(1);
    const usciteVar = ((meseAttuale.uscite - mesePrecedente.uscite) / mesePrecedente.uscite * 100).toFixed(1);
    const margineMese = meseAttuale.incassi - meseAttuale.uscite;
    const margineMesePrec = mesePrecedente.incassi - mesePrecedente.uscite;
    const margineVar = ((margineMese - margineMesePrec) / margineMesePrec * 100).toFixed(1);

    const totaleAnno = MESI_NUM.reduce((acc, m) => ({
        incassi: acc.incassi + m.incassi,
        uscite: acc.uscite + m.uscite,
        provv: acc.provv + m.provvigioni,
    }), { incassi: 0, uscite: 0, provv: 0 });

    return (
        <>
            <Helmet><title>Contabilità - CRIA Admin</title></Helmet>

            <div className="space-y-6">

                {/* Intestazione */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Contabilità</h1>
                        <p className="text-sm text-muted-foreground">Vista d'insieme cash flow, incassi, uscite e P&L mensile</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> Esporta CSV
                    </Button>
                </div>

                {/* Periodo */}
                <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
                    {[
                        { id: 'mese', label: 'Questo mese' },
                        { id: 'trimestre', label: 'Trimestre' },
                        { id: 'anno', label: 'Anno' },
                    ].map(p => (
                        <button key={p.id} onClick={() => setPeriodo(p.id)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${periodo === p.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                }`}>
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* KPI principali */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Incassi', value: fmtEur(meseAttuale.incassi), icon: ArrowDownRight, color: 'bg-green-500', varValue: incassiVar, positive: incassiVar > 0 },
                        { label: 'Uscite', value: fmtEur(meseAttuale.uscite), icon: ArrowUpRight, color: 'bg-red-500', varValue: usciteVar, positive: usciteVar < 0 },
                        { label: 'Margine netto', value: fmtEur(margineMese), icon: TrendingUp, color: 'bg-blue-500', varValue: margineVar, positive: margineVar > 0 },
                        { label: 'Provvigioni', value: fmtEur(meseAttuale.provvigioni), icon: Percent, color: 'bg-purple-500', varValue: null, positive: true },
                    ].map(({ label, value, icon: Icon, color, varValue, positive }) => (
                        <Card key={label}>
                            <CardContent className="pt-5 pb-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2.5 rounded-lg ${color}`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    {varValue !== null && (
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {positive ? '+' : ''}{varValue}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Trend mensile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BarChart3 className="w-5 h-5" /> Trend incassi (5 mesi)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MiniBarChart data={MESI_NUM} dataKey="incassi" color="bg-green-500" />
                            <div className="flex justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                                <span>Totale: <strong className="text-foreground tabular-nums">{fmtEur(totaleAnno.incassi)}</strong></span>
                                <span>Media: <strong className="text-foreground tabular-nums">{fmtEur(Math.round(totaleAnno.incassi / 5))}</strong></span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <BarChart3 className="w-5 h-5" /> Trend uscite (5 mesi)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MiniBarChart data={MESI_NUM} dataKey="uscite" color="bg-red-500" />
                            <div className="flex justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                                <span>Totale: <strong className="text-foreground tabular-nums">{fmtEur(totaleAnno.uscite)}</strong></span>
                                <span>Media: <strong className="text-foreground tabular-nums">{fmtEur(Math.round(totaleAnno.uscite / 5))}</strong></span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Breakdown prodotti + Movimenti recenti */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Breakdown prodotti */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <PieChart className="w-5 h-5" /> Ricavi per prodotto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {BREAKDOWN_PRODOTTI.map(p => (
                                <div key={p.prodotto} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-foreground">{p.prodotto}</span>
                                        <span className="tabular-nums text-foreground">{fmtEur(p.ricavo)}</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all"
                                            style={{ width: `${p.percentuale}%` }} />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{p.vendite} vendite</span>
                                        <span>{p.percentuale}%</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Riepilogo */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Wallet className="w-5 h-5" /> Riepilogo cash flow
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-3">
                                    <ArrowDownRight className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Entrate Stripe</p>
                                        <p className="text-xs text-muted-foreground">Pagamenti carta automatici</p>
                                    </div>
                                </div>
                                <p className="text-base font-bold text-green-600 tabular-nums">{fmtEur(meseAttuale.incassi - 18000)}</p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3">
                                    <ArrowDownRight className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Entrate bonifici</p>
                                        <p className="text-xs text-muted-foreground">Inquilini P2</p>
                                    </div>
                                </div>
                                <p className="text-base font-bold text-blue-600 tabular-nums">{fmtEur(18000)}</p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                                <div className="flex items-center gap-3">
                                    <ArrowUpRight className="w-5 h-5 text-red-600" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Bonifici locatori</p>
                                        <p className="text-xs text-muted-foreground">Pagamenti CRIA Completo</p>
                                    </div>
                                </div>
                                <p className="text-base font-bold text-red-600 tabular-nums">{fmtEur(meseAttuale.uscite - 24000)}</p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-3">
                                    <Percent className="w-5 h-5 text-purple-600" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Provvigioni e compensi</p>
                                        <p className="text-xs text-muted-foreground">Commerciali + avvocati</p>
                                    </div>
                                </div>
                                <p className="text-base font-bold text-purple-600 tabular-nums">{fmtEur(24000)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Movimenti recenti */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Activity className="w-5 h-5" /> Movimenti recenti
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="text-primary gap-1">
                                Vedi tutti <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tipo</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Descrizione</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Metodo</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Importo</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {MOVIMENTI_RECENTI.map(m => {
                                    const cfg = TIPO_CONFIG[m.tipo];
                                    const Icon = cfg.icon;
                                    return (
                                        <tr key={m.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmtData(m.data)}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                                                    <Icon className="w-3 h-3" /> {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-foreground">{m.descrizione}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{m.metodo}</td>
                                            <td className={`px-4 py-3 text-right tabular-nums font-medium ${cfg.color}`}>
                                                {m.tipo === 'incasso' ? '+' : '−'} {fmtEur(m.importo)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {m.ref && (
                                                    <Link to={m.ref}>
                                                        <Button variant="ghost" size="sm" className="gap-1">
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Link rapidi alle pagine specifiche */}
                <Card>
                    <CardContent className="pt-5">
                        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Approfondimenti</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Pagamenti', icon: CreditCard, ref: '/dashboard/admin/pagamenti' },
                                { label: 'Bonifici', icon: Euro, ref: '/dashboard/admin/bonifici' },
                                { label: 'Vendite', icon: TrendingUp, ref: '/dashboard/admin/vendite' },
                                { label: 'Provvigioni', icon: Percent, ref: '/dashboard/admin/provvigioni' },
                            ].map(({ label, icon: Icon, ref }) => (
                                <Link key={ref} to={ref}>
                                    <div className="p-4 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all">
                                        <Icon className="w-5 h-5 text-primary mb-2" />
                                        <p className="text-sm font-medium text-foreground">{label}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default ContabilitaPage;