import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft, ChevronRight, User, Mail, Phone, Home,
    FileText, Euro, Calendar, AlertTriangle, Info,
    CheckCircle2, MapPin
} from 'lucide-react';

// ─── Mock cliente ──────────────────────────────────────────────────────────────
const CLIENTE = {
    id: 4,
    nome: 'Marco Esposito',
    email: 'marco.esposito@email.it',
    telefono: '+39 348 7654321',
    dataAcquisizione: '2026-04-28',
    tipoAccount: 'privato',
    indirizzo: 'Piazza Navona 23, 00186 Roma (RM)',

    contratti: [
        { id: 1, immobile: 'Piazza Navona 23, Roma', prodotto: 'P2', canone: 1100, dataAttivazione: '2026-04-30', durata: '12 mesi', stato: 'attivo', contestazioni: 1 },
    ],

    provvigioni: [
        { id: 1, data: '2026-04-30', motivo: 'Vendita CRIA Completo', importo: 100, stato: 'maturato' },
    ],

    contestazioni: [
        { id: 2, mese: 'Aprile 2026', stato: 'in verifica', dataApertura: '2026-04-30' },
    ],
};

const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;
const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const PRODOTTO_BADGE = {
    P1: 'bg-blue-100 text-blue-800',
    P2: 'bg-purple-100 text-purple-800',
};

const PRODOTTO_LABEL = {
    P1: 'CRIA Gestione',
    P2: 'CRIA Completo',
};

const STATO_PROV = {
    maturato: 'bg-yellow-100 text-yellow-800',
    pagato: 'bg-green-100 text-green-800',
};

const STATO_CONT = {
    'aperta': 'bg-red-100 text-red-800',
    'in verifica': 'bg-yellow-100 text-yellow-800',
    'risolta': 'bg-green-100 text-green-800',
    'chiusa': 'bg-gray-100 text-gray-600',
};

const SchedaClienteCommercialePage = () => {
    const { id } = useParams();

    const totaleProvvigione = CLIENTE.provvigioni.reduce((s, p) => s + p.importo, 0);

    return (
        <>
            <Helmet><title>{`${CLIENTE.nome} - CRIA Commerciale`}</title></Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/dashboard/commerciale/clienti">
                        <Button variant="ghost" size="sm" className="gap-1 px-2">
                            <ArrowLeft className="w-4 h-4" /> I miei clienti
                        </Button>
                    </Link>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{CLIENTE.nome}</span>
                </div>

                {/* Anagrafica */}
                <Card>
                    <CardContent className="pt-5">
                        <div className="flex items-start gap-4 flex-wrap">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-base font-bold text-primary">
                                    {CLIENTE.nome.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h1 className="text-xl font-bold text-foreground">{CLIENTE.nome}</h1>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                                        {CLIENTE.tipoAccount}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-3.5 h-3.5" /> {CLIENTE.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="w-3.5 h-3.5" /> {CLIENTE.telefono}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="w-3.5 h-3.5" /> {CLIENTE.indirizzo}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-3.5 h-3.5" /> Acquisito il {fmtData(CLIENTE.dataAcquisizione)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* KPI */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Contratti generati', value: CLIENTE.contratti.length, icon: FileText, color: 'bg-blue-500' },
                        { label: 'Provvigione totale', value: fmtEur(totaleProvvigione), icon: Euro, color: 'bg-green-500' },
                        { label: 'Contestazioni aperte', value: CLIENTE.contestazioni.length, icon: AlertTriangle, color: 'bg-amber-500' },
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

                {/* Banner contestazioni */}
                {CLIENTE.contestazioni.length > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                            <p className="font-medium">Contestazioni aperte (informazione)</p>
                            <p className="text-xs mt-0.5">CRIA sta gestendo le contestazioni di questo cliente. Tu le vedi solo a titolo informativo, non puoi gestirle.</p>
                        </div>
                    </div>
                )}

                {/* Contratti */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Home className="w-5 h-5" /> Contratti generati
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {CLIENTE.contratti.map(c => (
                            <div key={c.id} className="p-4 rounded-xl border border-border space-y-2">
                                <div className="flex items-start justify-between flex-wrap gap-2">
                                    <div>
                                        <p className="font-medium text-foreground">{c.immobile}</p>
                                        <p className="text-xs text-muted-foreground">Attivato il {fmtData(c.dataAttivazione)}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_BADGE[c.prodotto]}`}>
                                        {PRODOTTO_LABEL[c.prodotto]}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm pt-2 border-t border-border">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Canone</p>
                                        <p className="font-medium text-foreground">{fmtEur(c.canone)}/mese</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Durata</p>
                                        <p className="font-medium text-foreground">{c.durata}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Stato</p>
                                        <p className="font-medium text-foreground capitalize">{c.stato}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Provvigioni */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Euro className="w-5 h-5" /> Provvigioni generate da questo cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {CLIENTE.provvigioni.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">Nessuna provvigione ancora generata</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Motivo</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Importo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {CLIENTE.provvigioni.map(p => (
                                        <tr key={p.id} className="hover:bg-muted/30">
                                            <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmtData(p.data)}</td>
                                            <td className="px-4 py-3 text-foreground">{p.motivo}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATO_PROV[p.stato]}`}>
                                                    {p.stato}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">{fmtEur(p.importo)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>

                {/* Contestazioni info-only */}
                {CLIENTE.contestazioni.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <AlertTriangle className="w-5 h-5 text-amber-600" /> Contestazioni (sola visualizzazione)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {CLIENTE.contestazioni.map(c => (
                                <div key={c.id} className="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg flex-wrap">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Contestazione {c.mese}</p>
                                        <p className="text-xs text-muted-foreground">Aperta il {fmtData(c.dataApertura)}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATO_CONT[c.stato]}`}>
                                        {c.stato}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

            </div>
        </>
    );
};

export default SchedaClienteCommercialePage;