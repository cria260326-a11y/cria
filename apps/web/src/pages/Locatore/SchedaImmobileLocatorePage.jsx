import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PaymentTimeline from '@/components/PaymentTimeline.jsx';
import StatusBadge from '@/components/StatusBadge.jsx';
import {
    ArrowLeft, ChevronRight, Home, MapPin, User, Phone, Mail,
    Euro, Calendar, FileText, Download, Upload, AlertTriangle,
    Shield, Info, CheckCircle2, Clock, History, X
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mock dati ─────────────────────────────────────────────────────────────────
const IMMOBILE_MOCK = {
    id: 1,
    address: 'Via Roma 42',
    city: 'Milano',
    cap: '20100',
    provincia: 'MI',
    lat: 45.4654,
    lng: 9.1859,
    prodotto: 1,
    ruolo: 'proprietario',
    status: 'verde',
    monthlyRent: 1200,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    durata: '12 mesi',
    contestazioni: 0,

    inquilino: {
        nome: 'Sofia Martini',
        email: 'sofia.martini@email.it',
        telefono: '+39 347 9876543',
        codiceFiscale: 'MRTSFI88L42F205Z',
        inquilinoDal: '2026-01-01',
    },

    payments: [
        { month: 0, paid: true, day: 3 },
        { month: 1, paid: true, day: 5 },
        { month: 2, paid: true, day: 4 },
        { month: 3, paid: true, day: 2 },
    ],

    documenti: [
        { id: 1, nome: 'Visura catastale.pdf', tipo: 'visura', data: '2026-01-10', dimensione: '245 KB' },
        { id: 2, nome: 'Contratto locazione.pdf', tipo: 'contratto', data: '2026-01-01', dimensione: '512 KB' },
        { id: 3, nome: 'Planimetria.pdf', tipo: 'extra', data: '2026-01-15', dimensione: '180 KB' },
    ],

    storicoInquilini: [
        { nome: 'Sofia Martini', dal: '2026-01-01', al: null, attuale: true },
        { nome: 'Andrea Bianchi', dal: '2024-01-01', al: '2025-12-31', attuale: false },
        { nome: 'Marta Rossi', dal: '2022-01-01', al: '2023-12-31', attuale: false },
    ],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;
const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');
const PRODOTTO_LABEL = { 1: 'CRIA Gestione', 2: 'CRIA Completo' };
const PRODOTTO_BADGE = { 1: 'bg-blue-100 text-blue-800', 2: 'bg-purple-100 text-purple-800' };

// ─── Mappa singolo immobile ───────────────────────────────────────────────────
const MappaSingolo = ({ lat, lng, label }) => {
    const mapRef = useRef(null);
    const instRef = useRef(null);

    useEffect(() => {
        if (instRef.current) { instRef.current.remove(); instRef.current = null; }
        if (!document.getElementById('leaflet-css')) {
            const l = document.createElement('link');
            l.id = 'leaflet-css'; l.rel = 'stylesheet';
            l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(l);
        }
        import('leaflet').then(mod => {
            const L = mod.default || mod;
            const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView([lat, lng], 15);
            instRef.current = map;
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
            const icon = L.divIcon({
                className: '',
                html: `<div style="width:18px;height:18px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
                iconSize: [18, 18], iconAnchor: [9, 9],
            });
            L.marker([lat, lng], { icon }).addTo(map).bindPopup(`<strong>${label}</strong>`);
        });
        return () => { if (instRef.current) { instRef.current.remove(); instRef.current = null; } };
    }, [lat, lng]);

    return <div ref={mapRef} style={{ height: '240px', width: '100%', borderRadius: '12px' }} />;
};

// ─── Componente principale ────────────────────────────────────────────────────
const SchedaImmobileLocatorePage = () => {
    const { id } = useParams();
    const im = IMMOBILE_MOCK; // TODO: in real app, fetch by id

    return (
        <>
            <Helmet><title>{im.address} - CRIA</title></Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/dashboard/locatore/immobili">
                        <Button variant="ghost" size="sm" className="gap-1 px-2">
                            <ArrowLeft className="w-4 h-4" /> Immobili
                        </Button>
                    </Link>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{im.address}, {im.city}</span>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{im.address}</h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5" /> {im.cap} {im.city} ({im.provincia})
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_BADGE[im.prodotto]}`}>
                                {PRODOTTO_LABEL[im.prodotto]}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
                                {im.ruolo}
                            </span>
                            {im.contestazioni > 0 && (
                                <Link to="/dashboard/locatore/contestazioni" className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    <AlertTriangle className="w-3 h-3" /> {im.contestazioni} contestaz.
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={im.status} />
                        <Button variant="outline" size="sm" className="gap-2"
                            onClick={() => toast.info('Download disponibile dopo backend')}>
                            <Download className="w-4 h-4" /> Scarica PDF
                        </Button>
                    </div>
                </div>

                {/* Layout 2 colonne: info + mappa */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Colonna sx: info contratto + inquilino */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Contratto */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="w-5 h-5" /> Dettagli contratto
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Canone mensile</p>
                                        <p className="font-medium text-foreground flex items-center gap-2">
                                            <Euro className="w-3.5 h-3.5 text-muted-foreground" /> {fmtEur(im.monthlyRent)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Durata</p>
                                        <p className="font-medium text-foreground">{im.durata}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Inizio</p>
                                        <p className="font-medium text-foreground flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {fmtData(im.startDate)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Scadenza</p>
                                        <p className="font-medium text-foreground flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {fmtData(im.endDate)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inquilino */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <User className="w-5 h-5" /> Inquilino attuale
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-base font-bold text-primary">
                                            {im.inquilino.nome.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                        </span>
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Nome</p>
                                            <p className="font-medium text-foreground">{im.inquilino.nome}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Inquilino dal</p>
                                            <p className="font-medium text-foreground">{fmtData(im.inquilino.inquilinoDal)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <p className="font-medium text-foreground flex items-center gap-1">
                                                <Mail className="w-3 h-3 text-muted-foreground" /> {im.inquilino.email}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Telefono</p>
                                            <p className="font-medium text-foreground flex items-center gap-1">
                                                <Phone className="w-3 h-3 text-muted-foreground" /> {im.inquilino.telefono}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Storico pagamenti */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Euro className="w-5 h-5" /> Storico pagamenti — ultimi 12 mesi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PaymentTimeline payments={im.payments} />
                                {im.prodotto === 2 && (
                                    <div className="mt-4 flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                        <Shield className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-purple-800">
                                            Con CRIA Completo ricevi sempre il canone puntualmente, indipendentemente dai pagamenti dell'inquilino.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Documenti */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <FileText className="w-5 h-5" /> Documenti ({im.documenti.length})
                                    </CardTitle>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Upload className="w-3.5 h-3.5" /> Carica
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {im.documenti.map(d => (
                                    <div key={d.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{d.nome}</p>
                                            <p className="text-xs text-muted-foreground">{fmtData(d.data)} · {d.dimensione}</p>
                                        </div>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                                            {d.tipo}
                                        </span>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                            <Download className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Storico inquilini */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <History className="w-5 h-5" /> Storico inquilini
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {im.storicoInquilini.map((inq, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${inq.attuale ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-foreground">{inq.nome}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {fmtData(inq.dal)} {inq.al ? `→ ${fmtData(inq.al)}` : '(in corso)'}
                                            </p>
                                        </div>
                                        {inq.attuale && (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                                                Attuale
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                    </div>

                    {/* Colonna dx: mappa + info rapide */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MapPin className="w-5 h-5" /> Posizione
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                                <MappaSingolo lat={im.lat} lng={im.lng} label={im.address} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Azioni rapide</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                                    <Download className="w-4 h-4" /> Esporta storico pagamenti
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                                    <Upload className="w-4 h-4" /> Carica documento
                                </Button>
                                <Link to="/dashboard/locatore/assistenza" className="block">
                                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                                        <Mail className="w-4 h-4" /> Contatta CRIA
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SchedaImmobileLocatorePage;