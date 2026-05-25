import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PaymentTimeline from '@/components/PaymentTimeline.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';
import {
    Home, TrendingUp, Euro, CheckCircle2, AlertTriangle,
    Download, ChevronDown, ChevronUp, XCircle, Info, Shield,
    Activity, Clock, Flame, Plus, MessageSquare, Flag, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mock data ─────────────────────────────────────────────────────────────────
const UTENTE = { nome: 'Marco', cognome: 'Bianchi' };

const IMMOBILI_INIZIALI = [
    { id: 1, prodotto: 1, address: 'Via Roma 42', city: 'Milano', lat: 45.4654, lng: 9.1859, tenant: 'Sofia Martini', monthlyRent: 1200, endDate: '31/12/2026', status: 'verde', payments: [{ month: 0, paid: true, day: 3 }, { month: 1, paid: true, day: 5 }, { month: 2, paid: true, day: 4 }, { month: 3, paid: true, day: 2 }], segnalazioneCorrente: null, meseCorrente: 'Aprile 2026', contestazioni: 0 },
    { id: 2, prodotto: 1, address: 'Corso Venezia 18', city: 'Milano', lat: 45.4708, lng: 9.1820, tenant: 'Luca Romano', monthlyRent: 950, endDate: '31/01/2027', status: 'giallo', payments: [{ month: 0, paid: true, day: 7 }, { month: 1, paid: true, day: 9 }, { month: 2, paid: true, day: 8 }], segnalazioneCorrente: null, meseCorrente: 'Aprile 2026', contestazioni: 1 },
    { id: 3, prodotto: 2, address: 'Via Dante 7', city: 'Roma', lat: 41.8934, lng: 12.4823, tenant: 'Elena Greco', monthlyRent: 1450, endDate: '14/01/2027', status: 'verde', criaPayments: [{ month: 0, paid: true, day: 5 }, { month: 1, paid: true, day: 5 }, { month: 2, paid: true, day: 5 }, { month: 3, paid: true, day: 5 }], tenantPayments: [{ month: 0, paid: true, day: 2 }, { month: 1, paid: true, day: 3 }, { month: 2, paid: true, day: 4 }], contestazioni: 0 },
    { id: 4, prodotto: 2, address: 'Piazza Navona 23', city: 'Roma', lat: 41.8991, lng: 12.4730, tenant: 'Marco Esposito', monthlyRent: 1100, endDate: '28/02/2027', status: 'rosso', criaPayments: [{ month: 0, paid: true, day: 5 }, { month: 1, paid: true, day: 5 }], tenantPayments: [{ month: 0, paid: true, day: 12 }, { month: 1, paid: true, day: 15 }], contestazioni: 2 },
    { id: 5, prodotto: 1, address: 'Via Garibaldi 56', city: 'Torino', lat: 45.0703, lng: 7.6869, tenant: 'Chiara Lombardi', monthlyRent: 850, endDate: '31/12/2026', status: 'rosso', payments: [{ month: 0, paid: true, day: 12 }, { month: 1, paid: true, day: 14 }, { month: 2, paid: true, day: 11 }], segnalazioneCorrente: 'pagato', meseCorrente: 'Aprile 2026', contestazioni: 0 },
];

const CONTESTAZIONI_RECENTI = [
    { id: 1, inquilino: 'Luca Romano', immobile: 'Corso Venezia 18', mese: 'Marzo 2026', stato: 'in verifica', data: '28/03/2026' },
    { id: 2, inquilino: 'Marco Esposito', immobile: 'Piazza Navona 23', mese: 'Febbraio 2026', stato: 'aperta', data: '15/02/2026' },
    { id: 3, inquilino: 'Marco Esposito', immobile: 'Piazza Navona 23', mese: 'Gennaio 2026', stato: 'risolta', data: '20/01/2026' },
];

const INQUILINI_PROBLEMATICI = [
    { id: 1, nome: 'Marco Esposito', immobile: 'Piazza Navona 23, Roma', status: 'rosso', ritardoMedio: '12 giorni', contestazioni: 2, note: 'Pagamenti sistematicamente tardivi. CRIA ha avviato procedura di sollecito.' },
    { id: 2, nome: 'Luca Romano', immobile: 'Corso Venezia 18, Milano', status: 'giallo', ritardoMedio: '8 giorni', contestazioni: 1, note: 'Pagamenti in ritardo negli ultimi 3 mesi.' },
];

const ATTIVITA_RECENTI = [
    { id: 1, testo: 'Sofia Martini ha pagato l\'affitto di Aprile', data: '02/04/2026', icon: CheckCircle2, color: 'text-green-600 bg-green-50', ref: '/dashboard/locatore/pagamenti' },
    { id: 2, testo: 'Luca Romano ha contestato la segnalazione di Marzo', data: '28/03/2026', icon: AlertTriangle, color: 'text-red-600 bg-red-50', ref: '/dashboard/locatore/contestazioni/1' },
    { id: 3, testo: 'CRIA ha bonificato l\'affitto di Via Dante 7 — Aprile', data: '05/04/2026', icon: Euro, color: 'text-purple-600 bg-purple-50', ref: '/dashboard/locatore/pagamenti' },
    { id: 4, testo: 'Il contratto di Via Roma 42 scade il 31/12/2026', data: '01/04/2026', icon: Clock, color: 'text-amber-600 bg-amber-50', ref: '/dashboard/locatore/immobili' },
    { id: 5, testo: 'Chiara Lombardi — segnalazione pagamento Aprile', data: '03/04/2026', icon: CheckCircle2, color: 'text-green-600 bg-green-50', ref: '/dashboard/locatore/segnalazioni' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;
const COLORI = { verde: '#22c55e', giallo: '#eab308', rosso: '#ef4444' };
const STATO_BADGE = {
    'aperta': 'bg-red-100 text-red-800',
    'in verifica': 'bg-yellow-100 text-yellow-800',
    'risolta': 'bg-green-100 text-green-800',
};

// ─── Mappa ─────────────────────────────────────────────────────────────────────
const Mappalocatore = ({ immobili }) => {
    const mapRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }
        if (!document.getElementById('leaflet-css')) {
            const l = document.createElement('link');
            l.id = 'leaflet-css'; l.rel = 'stylesheet';
            l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(l);
        }
        import('leaflet').then(mod => {
            const L = mod.default || mod;
            const map = L.map(mapRef.current, { scrollWheelZoom: false, zoomControl: true });
            instanceRef.current = map;
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
            const punti = immobili.filter(i => i.lat && i.lng);
            punti.forEach(im => {
                const colore = COLORI[im.status] || '#6b7280';
                const icon = L.divIcon({
                    className: '',
                    html: `<div style="width:16px;height:16px;background:${colore};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
                    iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -12],
                });
                L.marker([im.lat, im.lng], { icon })
                    .addTo(map)
                    .bindPopup(`<div style="font-size:12px;min-width:160px;"><strong>${im.address}</strong><br/><span style="color:#6b7280;">${im.city} · ${im.tenant}</span></div>`);
            });
            if (punti.length > 0) {
                const bounds = L.latLngBounds(punti.map(i => [i.lat, i.lng]));
                map.fitBounds(bounds, { padding: [40, 40] });
            }
        });
        return () => { if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; } };
    }, []);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Home className="w-5 h-5" /> I tuoi immobili sulla mappa
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative">
                    <div ref={mapRef} style={{ height: '320px', width: '100%', borderRadius: '0 0 12px 12px', zIndex: 0 }} />
                    <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg px-3 py-2 shadow-md flex gap-3">
                        {Object.entries(COLORI).map(([stato, colore]) => (
                            <div key={stato} className="flex items-center gap-1.5 text-xs text-gray-700">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: colore }} />
                                <span className="capitalize">{stato === 'verde' ? 'Regolare' : stato === 'giallo' ? 'In ritardo' : 'Irregolare'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// ─── Card Immobile P1 ──────────────────────────────────────────────────────────
const ImmobileP1 = ({ immobile }) => {
    const [aperto, setAperto] = useState(false);

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold text-foreground text-base">{immobile.address}</h3>
                            <span className="text-muted-foreground text-sm">{immobile.city}</span>
                            {immobile.contestazioni > 0 && (
                                <Link to={`/dashboard/locatore/contestazioni`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">
                                    <AlertTriangle className="w-3 h-3" /> {immobile.contestazioni} contestaz.
                                </Link>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>Inquilino: <span className="text-foreground font-medium">{immobile.tenant}</span></span>
                            <span>Canone: <span className="text-foreground font-medium">{fmtEur(immobile.monthlyRent)}/mese</span></span>
                            <span>Scade: <span className="text-foreground font-medium">{immobile.endDate}</span></span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={immobile.status} />
                        <button onClick={() => setAperto(s => !s)} className="text-muted-foreground hover:text-foreground p-1">
                            {aperto ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </CardHeader>
            {aperto && (
                <CardContent className="pt-0 border-t border-border">
                    <div className="pt-4">
                        <p className="text-xs text-muted-foreground mb-2">Storico pagamenti — ultimi 12 mesi</p>
                        <PaymentTimeline payments={immobile.payments} />
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

// ─── Card Immobile P2 ──────────────────────────────────────────────────────────
const ImmobileP2 = ({ immobile }) => {
    const [aperto, setAperto] = useState(false);
    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold text-foreground text-base">{immobile.address}</h3>
                            <span className="text-muted-foreground text-sm">{immobile.city}</span>
                            {immobile.contestazioni > 0 && (
                                <Link to={`/dashboard/locatore/contestazioni`} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">
                                    <AlertTriangle className="w-3 h-3" /> {immobile.contestazioni} contestaz.
                                </Link>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span>Inquilino: <span className="text-foreground font-medium">{immobile.tenant}</span></span>
                            <span>Canone: <span className="text-foreground font-medium">{fmtEur(immobile.monthlyRent)}/mese</span></span>
                            <span>Scade: <span className="text-foreground font-medium">{immobile.endDate}</span></span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={immobile.status} />
                        <button onClick={() => setAperto(s => !s)} className="text-muted-foreground hover:text-foreground p-1">
                            {aperto ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </CardHeader>
            {aperto && (
                <CardContent className="space-y-5 pt-0 border-t border-border">
                    <div className="pt-4">
                        <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-purple-500" /> Pagamenti CRIA verso di te (garantiti)
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">Ricevi sempre il 5 del mese, indipendentemente dall'inquilino</p>
                        <PaymentTimeline payments={immobile.criaPayments} />
                    </div>
                    <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-blue-500" /> Comportamento inquilino
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">Questo è il vantaggio di CRIA Completo: tu ricevi puntualmente mentre CRIA gestisce eventuali ritardi.</p>
                        <PaymentTimeline payments={immobile.tenantPayments} />
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

// ─── Salute portafoglio ────────────────────────────────────────────────────────
const SalutePiattaforma = ({ immobili }) => {
    const totale = immobili.length;
    const verdi = immobili.filter(i => i.status === 'verde').length;
    const gialli = immobili.filter(i => i.status === 'giallo').length;
    const rossi = immobili.filter(i => i.status === 'rosso').length;
    const score = Math.round((verdi * 100 + gialli * 50) / totale);
    const scoreColor = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600';
    const scoreLabel = score >= 80 ? 'Ottima' : score >= 50 ? 'Buona' : 'Da migliorare';

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="w-5 h-5" /> Salute del portafoglio
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-4xl font-bold tabular-nums ${scoreColor}`}>{score}%</p>
                        <p className={`text-sm font-medium ${scoreColor}`}>{scoreLabel}</p>
                    </div>
                    <div className="space-y-2 text-right">
                        {[
                            { label: 'Regolari', count: verdi, color: 'bg-green-500' },
                            { label: 'In ritardo', count: gialli, color: 'bg-yellow-500' },
                            { label: 'Irregolari', count: rossi, color: 'bg-red-500' },
                        ].map(({ label, count, color }) => (
                            <div key={label} className="flex items-center gap-2 justify-end">
                                <span className="text-xs text-muted-foreground">{label}</span>
                                <div className={`w-6 h-6 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold`}>{count}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                    <div className="bg-green-500 h-full transition-all" style={{ width: `${(verdi / totale) * 100}%` }} />
                    <div className="bg-yellow-500 h-full transition-all" style={{ width: `${(gialli / totale) * 100}%` }} />
                    <div className="bg-red-500 h-full transition-all" style={{ width: `${(rossi / totale) * 100}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{totale} immobili totali monitorati da CRIA</p>
            </CardContent>
        </Card>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const LandlordDashboard = () => {
    const [immobili, setImmobili] = useState(IMMOBILI_INIZIALI);

    const contatori = useMemo(() => {
        const totPrevisto = immobili.reduce((s, i) => s + i.monthlyRent, 0);
        const totReale = immobili.reduce((s, i) => {
            const pp = i.prodotto === 1 ? (i.payments || []) : (i.criaPayments || []);
            return s + pp.filter(p => p.paid).length * i.monthlyRent;
        }, 0);
        const pagMese = immobili.filter(i => i.prodotto === 1 ? i.segnalazioneCorrente === 'pagato' : (i.criaPayments || []).length > 0).length;
        const contestaz = immobili.reduce((s, i) => s + (i.contestazioni || 0), 0);
        return { totPrevisto, totReale, pagMese, contestaz };
    }, [immobili]);

    const onSegnala = (id, tipo) => {
        setImmobili(prev => prev.map(i => i.id === id ? { ...i, segnalazioneCorrente: tipo } : i));
        toast.success(tipo === 'pagato' ? 'Pagamento segnalato — l\'inquilino è stato notificato' : 'Mancato pagamento segnalato — CRIA avvierà le verifiche');
    };

    const p1 = immobili.filter(i => i.prodotto === 1);
    const p2 = immobili.filter(i => i.prodotto === 2);
    const segnalazioniDaFare = p1.filter(i => i.segnalazioneCorrente === null);

    return (
        <>
            <Helmet><title>Dashboard — CRIA</title></Helmet>

            <div className="space-y-8">

                {/* Intestazione + azioni rapide */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Buongiorno, {UTENTE.nome} 👋</h1>
                        <p className="text-sm text-muted-foreground mt-1">Ecco il riepilogo aggiornato dei tuoi immobili</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="gap-2"
                            onClick={() => toast.info('Download PDF disponibile dopo integrazione backend')}>
                            <Download className="w-4 h-4" /> Scarica report
                        </Button>
                        <Link to="/dashboard/locatore/immobili">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Plus className="w-4 h-4" /> Aggiungi immobile
                            </Button>
                        </Link>
                        <Link to="/dashboard/locatore/assistenza">
                            <Button size="sm" className="gap-2">
                                <MessageSquare className="w-4 h-4" /> Contatta CRIA
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Contatori */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'I miei immobili', value: immobili.length, icon: Home, color: 'bg-blue-500' },
                        { label: 'Entrate previste / mese', value: fmtEur(contatori.totPrevisto), icon: TrendingUp, color: 'bg-purple-500' },
                        { label: 'Incassato (totale)', value: fmtEur(contatori.totReale), icon: Euro, color: 'bg-green-500' },
                        { label: 'Pagamenti questo mese', value: `${contatori.pagMese} / ${immobili.length}`, icon: CheckCircle2, color: 'bg-teal-500' },
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

                {/* Mappa */}
                <Mappalocatore immobili={immobili} />

                {/* Alert contestazioni cliccabile */}
                {contatori.contestaz > 0 && (
                    <Link to="/dashboard/locatore/contestazioni">
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-700 flex-1">
                                Hai <strong>{contatori.contestaz} contestazioni aperte</strong>. CRIA le sta gestendo — riceverai aggiornamenti via email.
                            </p>
                            <ArrowRight className="w-4 h-4 text-red-500 flex-shrink-0" />
                        </div>
                    </Link>
                )}

                {/* Salute + Inquilini problematici */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SalutePiattaforma immobili={immobili} />
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Flame className="w-5 h-5 text-orange-500" /> Inquilini da monitorare
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {INQUILINI_PROBLEMATICI.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Nessun inquilino problematico — ottimo!</p>
                            ) : INQUILINI_PROBLEMATICI.map(inq => (
                                <div key={inq.id} className="p-3 rounded-xl border border-border space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-sm text-foreground">{inq.nome}</p>
                                        <StatusBadge status={inq.status} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">{inq.immobile}</p>
                                    <div className="flex gap-3 text-xs">
                                        <span className="text-muted-foreground">Ritardo medio: <span className="text-foreground font-medium">{inq.ritardoMedio}</span></span>
                                        <span className="text-muted-foreground">Contestazioni: <span className="text-foreground font-medium">{inq.contestazioni}</span></span>
                                    </div>
                                    <p className="text-xs text-muted-foreground italic">{inq.note}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Contestazioni recenti + Attività recenti */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <AlertTriangle className="w-5 h-5 text-red-500" /> Contestazioni recenti
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {CONTESTAZIONI_RECENTI.length === 0 ? (
                                <p className="text-sm text-muted-foreground px-4 py-6">Nessuna contestazione — tutto regolare!</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-border">
                                        {CONTESTAZIONI_RECENTI.map(c => (
                                            <tr key={c.id} className="hover:bg-muted/30 cursor-pointer">
                                                <td colSpan={3} className="p-0">
                                                    <Link to={`/dashboard/locatore/contestazioni/${c.id}`} className="flex w-full">
                                                        <div className="px-4 py-3 flex-1">
                                                            <p className="font-medium text-foreground text-xs">{c.inquilino}</p>
                                                            <p className="text-xs text-muted-foreground">{c.immobile}</p>
                                                        </div>
                                                        <div className="px-4 py-3 text-xs text-muted-foreground self-center">{c.mese}</div>
                                                        <div className="px-4 py-3 self-center">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATO_BADGE[c.stato]}`}>
                                                                {c.stato}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
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

                {/* Segnalazioni del mese */}
                {segnalazioniDaFare.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Flag className="w-5 h-5 text-amber-500" /> Segnalazioni del mese
                            </CardTitle>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                Se non segnali entro l'11 del mese, il pagamento verrà considerato regolare automaticamente.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {segnalazioniDaFare.map(im => (
                                <div key={im.id} className="flex items-center gap-3 p-3 rounded-xl border border-border flex-wrap">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-foreground">{im.address} · {im.city}</p>
                                        <p className="text-xs text-muted-foreground">{im.tenant} · {im.meseCorrente}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700"
                                            onClick={() => onSegnala(im.id, 'pagato')}>
                                            <CheckCircle2 className="w-4 h-4" /> Pagato
                                        </Button>
                                        <Button size="sm" variant="outline" className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                                            onClick={() => onSegnala(im.id, 'non_pagato')}>
                                            <XCircle className="w-4 h-4" /> Non ricevuto
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Immobili P1 */}
                {p1.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                                CRIA Gestione
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{p1.length} immobili</span>
                            </h2>
                            <Link to="/dashboard/locatore/immobili" className="text-xs text-primary hover:underline flex items-center gap-1">
                                Vedi tutti <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {p1.map(im => <ImmobileP1 key={im.id} immobile={im} />)}
                        </div>
                    </div>
                )}

                {/* Immobili P2 */}
                {p2.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                                CRIA Completo
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{p2.length} immobili</span>
                            </h2>
                            <Link to="/dashboard/locatore/immobili" className="text-xs text-primary hover:underline flex items-center gap-1">
                                Vedi tutti <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {p2.map(im => <ImmobileP2 key={im.id} immobile={im} />)}
                        </div>
                    </div>
                )}

            </div>
        </>
    );
};

export default LandlordDashboard;