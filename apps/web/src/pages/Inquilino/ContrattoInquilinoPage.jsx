import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    FileText, Download, Upload, MapPin, User, Mail, Phone,
    Calendar, Euro, Home, CheckCircle2, AlertTriangle,
    Receipt, Clock, X, Plus
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mock dati ─────────────────────────────────────────────────────────────────
const CONTRATTO = {
    id: 1,
    immobile: 'Via Roma 42',
    city: 'Milano',
    cap: '20100',
    provincia: 'MI',
    lat: 45.4654,
    lng: 9.1859,
    monthlyRent: 1200,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    durata: '12 mesi',
    locatore: {
        nome: 'Marco Bianchi',
        email: 'marco.bianchi@email.it',
        telefono: '+39 333 1234567',
    },

    contrattoFirmato: { id: 1, nome: 'Contratto locazione firmato.pdf', data: '2026-01-01', dimensione: '512 KB' },

    documentiInquilino: [
        { id: 1, nome: 'Carta identità.pdf', tipo: 'identita', data: '2025-12-20', dimensione: '320 KB', verificato: true },
        { id: 2, nome: 'Codice fiscale.pdf', tipo: 'cf', data: '2025-12-20', dimensione: '180 KB', verificato: true },
    ],

    ricevuteFiscali: [
        { id: 1, mese: 'Aprile 2026', data: '2026-04-05', importo: 1200, numero: 'CRIA-2026-04-042' },
        { id: 2, mese: 'Marzo 2026', data: '2026-03-04', importo: 1200, numero: 'CRIA-2026-03-038' },
        { id: 3, mese: 'Febbraio 2026', data: '2026-02-05', importo: 1200, numero: 'CRIA-2026-02-029' },
        { id: 4, mese: 'Gennaio 2026', data: '2026-01-03', importo: 1200, numero: 'CRIA-2026-01-018' },
    ],

    documentiContestazioni: [
        { id: 1, nome: 'Ricevuta bonifico Marzo.pdf', data: '2026-03-29', dimensione: '210 KB', contestazioneId: 1 },
    ],
};

const fmtEur = (n) => `€ ${n.toLocaleString('it-IT')}`;
const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

// ─── Mappa ─────────────────────────────────────────────────────────────────────
const MappaImmobile = ({ lat, lng, label }) => {
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
const ContrattoInquilinoPage = () => {
    const [docInquilino, setDocInquilino] = useState(CONTRATTO.documentiInquilino);
    const fileInputRef = useRef(null);

    const handleUpload = (file) => {
        if (!file) return;
        const nuovo = {
            id: Date.now(),
            nome: file.name,
            tipo: 'extra',
            data: new Date().toISOString().split('T')[0],
            dimensione: `${Math.round(file.size / 1024)} KB`,
            verificato: false,
        };
        setDocInquilino(prev => [...prev, nuovo]);
        toast.success('Documento caricato — in attesa di verifica');
    };

    return (
        <>
            <Helmet><title>Il mio contratto - CRIA</title></Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Il mio contratto</h1>
                        <p className="text-sm text-muted-foreground">Tutti i dettagli, documenti e ricevute del tuo contratto di locazione</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> Scarica tutto (PDF)
                    </Button>
                </div>

                {/* Layout 2 colonne */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 space-y-6">

                        {/* Dettagli immobile + contratto */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Home className="w-5 h-5" /> {CONTRATTO.immobile}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="w-3.5 h-3.5" /> {CONTRATTO.cap} {CONTRATTO.city} ({CONTRATTO.provincia})
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Canone mensile</p>
                                        <p className="font-medium text-foreground flex items-center gap-2">
                                            <Euro className="w-3.5 h-3.5 text-muted-foreground" /> {fmtEur(CONTRATTO.monthlyRent)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Durata</p>
                                        <p className="font-medium text-foreground">{CONTRATTO.durata}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Inizio</p>
                                        <p className="font-medium text-foreground flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {fmtData(CONTRATTO.startDate)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Scadenza</p>
                                        <p className="font-medium text-foreground flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {fmtData(CONTRATTO.endDate)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* locatore */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <User className="w-5 h-5" /> Il tuo locatore
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-base font-bold text-primary">
                                            {CONTRATTO.locatore.nome.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                        </span>
                                    </div>
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Nome</p>
                                            <p className="font-medium text-foreground">{CONTRATTO.locatore.nome}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <p className="font-medium text-foreground flex items-center gap-1 text-sm">
                                                <Mail className="w-3 h-3 text-muted-foreground" /> {CONTRATTO.locatore.email}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Telefono</p>
                                            <p className="font-medium text-foreground flex items-center gap-1 text-sm">
                                                <Phone className="w-3 h-3 text-muted-foreground" /> {CONTRATTO.locatore.telefono}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contratto firmato */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="w-5 h-5" /> Contratto firmato
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{CONTRATTO.contrattoFirmato.nome}</p>
                                        <p className="text-xs text-muted-foreground">{fmtData(CONTRATTO.contrattoFirmato.data)} · {CONTRATTO.contrattoFirmato.dimensione}</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Download className="w-3.5 h-3.5" /> Scarica
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documenti inquilino */}
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User className="w-5 h-5" /> I miei documenti
                                    </CardTitle>
                                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
                                    <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="w-3.5 h-3.5" /> Carica
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {docInquilino.map(d => (
                                    <div key={d.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{d.nome}</p>
                                            <p className="text-xs text-muted-foreground">{fmtData(d.data)} · {d.dimensione}</p>
                                        </div>
                                        {d.verificato ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-600 flex-shrink-0">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Verificato
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-yellow-600 flex-shrink-0">
                                                <AlertTriangle className="w-3.5 h-3.5" /> In verifica
                                            </span>
                                        )}
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                            <Download className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Ricevute fiscali */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Receipt className="w-5 h-5" /> Ricevute fiscali
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-border bg-muted/40">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Mese</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Numero</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Importo</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {CONTRATTO.ricevuteFiscali.map(r => (
                                            <tr key={r.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3 font-medium text-foreground">{r.mese}</td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{r.numero}</td>
                                                <td className="px-4 py-3 text-muted-foreground tabular-nums">{fmtData(r.data)}</td>
                                                <td className="px-4 py-3 text-right tabular-nums font-medium text-foreground">{fmtEur(r.importo)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="ghost" size="sm" className="gap-1 h-7">
                                                        <Download className="w-3.5 h-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        {/* Documenti contestazioni passate */}
                        {CONTRATTO.documentiContestazioni.length > 0 && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Clock className="w-5 h-5" /> Documenti caricati nelle contestazioni
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {CONTRATTO.documentiContestazioni.map(d => (
                                        <div key={d.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{d.nome}</p>
                                                <p className="text-xs text-muted-foreground">{fmtData(d.data)} · {d.dimensione} · Contestazione #{d.contestazioneId}</p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                <Download className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                    </div>

                    {/* Colonna dx: mappa */}
                    <div>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <MapPin className="w-5 h-5" /> Posizione
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                                <MappaImmobile lat={CONTRATTO.lat} lng={CONTRATTO.lng} label={CONTRATTO.immobile} />
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </>
    );
};

export default ContrattoInquilinoPage;