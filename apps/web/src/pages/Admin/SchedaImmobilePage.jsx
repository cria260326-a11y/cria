import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PaymentTimeline from '@/components/PaymentTimeline.jsx';
import {
    ArrowLeft, Home, User, Users, FileText,
    AlertTriangle, ChevronRight, CheckCircle2, XCircle,
    Upload, Send, StickyNote, Plus, Clock, Building2,
    ArrowUpRight, RefreshCw, UserMinus, Euro, Zap,
    PauseCircle, PlayCircle, StopCircle
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mappa singolo immobile ───────────────────────────────────────────────────
const COLORI_REPUTAZIONE = { verde: '#22c55e', giallo: '#eab308', rosso: '#ef4444' };

const MappaSingolaImmobile = ({ lat, lng, indirizzo, reputazione }) => {
    const mapRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }
        if (!lat || !lng) return;

        if (!document.getElementById('leaflet-css')) {
            const l = document.createElement('link');
            l.id = 'leaflet-css'; l.rel = 'stylesheet';
            l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(l);
        }

        import('leaflet').then((mod) => {
            const L = mod.default || mod;
            window.L = L;
            delete L.Icon.Default.prototype._getIconUrl;

            const map = L.map(mapRef.current, { center: [lat, lng], zoom: 15, scrollWheelZoom: false, zoomControl: true });
            instanceRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap',
            }).addTo(map);

            const colore = COLORI_REPUTAZIONE[reputazione] || '#6b7280';
            const icon = L.divIcon({
                className: '',
                html: `<div style="width:18px;height:18px;background:${colore};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
                iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -12],
            });

            L.marker([lat, lng], { icon })
                .addTo(map)
                .bindPopup(`<div style="font-size:13px;font-weight:600;">${indirizzo}</div>`)
                .openPopup();
        });

        return () => {
            if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }
        };
    }, [lat, lng, reputazione]);

    if (!lat || !lng) {
        return (
            <div className="h-full min-h-48 rounded-lg border border-border bg-muted/30 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Zap className="w-5 h-5 text-yellow-500" />
                <p className="text-xs">Coordinate non disponibili</p>
                <p className="text-xs">Geocodifica l'indirizzo per vedere la mappa</p>
            </div>
        );
    }

    return <div ref={mapRef} style={{ height: '100%', width: '100%', zIndex: 0 }} />;
};

// ─── Dati mock ─────────────────────────────────────────────────────────────────
// Modello: locatori[] e inquilini[] sono array (cointestatari possibili)
// Reputazione = media degli inquilini correnti
const IMMOBILI = {
    1: {
        id: 'IMM-001',
        indirizzo: 'Via Roma 42',
        citta: 'Milano',
        cap: '20100',
        provincia: 'MI',
        piano: '3° piano',
        mq: 85,
        vani: 3,
        valoreImmobile: '320.000',
        prodotto: 1,
        prodottoStato: 'attivo',
        contrattoStato: 'attivo',
        canone: '1.200',
        dataInizio: '01/01/2026',
        dataFine: '31/12/2026',
        durata: 12,
        prossimoPagamento: '5 Mag 2026',
        meseCorrentePagato: true,
        giorniRimanenti: 240,
        proprietari: [
            { id: 1, nome: 'Marco Bianchi', coincideConlocatore: true },
        ],
        locatori: [
            {
                id: 1, nome: 'Marco Bianchi', email: 'marco.bianchi@email.it',
                telefono: '+39 333 1234567', codiceFiscale: 'BNCMRC85M12F205Z', tipo: 'Privato',
            },
        ],
        inquilini: [
            {
                id: 3, nome: 'Sofia Martini', email: 'sofia.martini@email.it',
                telefono: '+39 347 9876543', codiceFiscale: 'MRTSFA92D45F205K',
                reputazione: 'verde', puntualita: 92,
            },
        ],
        pagamenti: [
            { month: 0, paid: true, day: 3 }, { month: 1, paid: true, day: 5 },
            { month: 2, paid: true, day: 4 }, { month: 3, paid: true, day: 2 },
        ],
    },

    2: {
        id: 'IMM-002',
        indirizzo: 'Corso Venezia 18',
        citta: 'Milano',
        cap: '20121',
        provincia: 'MI',
        piano: '1° piano',
        mq: 65,
        vani: 2,
        valoreImmobile: '280.000',
        prodotto: 2,
        prodottoStato: 'attivo',
        contrattoStato: 'attivo',
        canone: '950',
        dataInizio: '01/02/2026',
        dataFine: '31/01/2027',
        durata: 12,
        prossimoPagamento: '5 Mag 2026',
        meseCorrentePagato: true,
        giorniRimanenti: 271,
        proprietari: [
            {
                id: null, nome: 'Giovanni Rossi', coincideConlocatore: false,
                email: 'giovanni.rossi@email.it', telefono: '+39 348 1111222',
                codiceFiscale: 'RSSGNN60A01H501Z', tipo: 'Privato',
            },
        ],
        locatori: [
            {
                id: 2, nome: 'Agenzia ImmoBlu Srl', email: 'info@immoblu.it',
                telefono: '+39 02 9876543', codiceFiscale: 'IMMOBLU123456', tipo: 'Agenzia',
            },
        ],
        inquilini: [
            {
                id: 4, nome: 'Luca Romano', email: 'luca.romano@email.it',
                telefono: '+39 333 4445556', codiceFiscale: 'RMNLCU90B12H501P',
                reputazione: 'giallo', puntualita: 75,
            },
        ],
        criaPayments: [
            { month: 0, paid: true, day: 5 }, { month: 1, paid: true, day: 5 },
            { month: 2, paid: true, day: 5 },
        ],
        tenantPayments: [
            { month: 0, paid: true, day: 7 }, { month: 1, paid: true, day: 9 },
            { month: 2, paid: true, day: 8 },
        ],
    },

    // 2 locatori cointestatari (coppia proprietaria)
    3: {
        id: 'IMM-003',
        indirizzo: 'Via Dante 7',
        citta: 'Roma',
        cap: '00184',
        provincia: 'RM',
        piano: '2° piano',
        mq: 110,
        vani: 4,
        valoreImmobile: '450.000',
        prodotto: 1,
        prodottoStato: 'attivo',
        contrattoStato: 'in_scadenza',
        canone: '1.450',
        dataInizio: '15/01/2025',
        dataFine: '14/01/2027',
        durata: 24,
        prossimoPagamento: '5 Mag 2026',
        meseCorrentePagato: true,
        giorniRimanenti: 254,
        proprietari: [
            { id: 5, nome: 'Anna Verdi', coincideConlocatore: true },
            { id: 6, nome: 'Paolo Verdi', coincideConlocatore: true },
        ],
        locatori: [
            {
                id: 5, nome: 'Anna Verdi', email: 'anna.verdi@email.it',
                telefono: '+39 333 1112233', codiceFiscale: 'VRDNNA75T55H501W', tipo: 'Privato',
            },
            {
                id: 6, nome: 'Paolo Verdi', email: 'paolo.verdi@email.it',
                telefono: '+39 333 1112244', codiceFiscale: 'VRDPLA73B12H501S', tipo: 'Privato',
            },
        ],
        inquilini: [
            {
                id: 7, nome: 'Elena Greco', email: 'elena.greco@email.it',
                telefono: '+39 347 7778899', codiceFiscale: 'GRCLNE90E45H501T',
                reputazione: 'verde', puntualita: 100,
            },
        ],
        pagamenti: [
            { month: 0, paid: true, day: 3 }, { month: 1, paid: true, day: 4 },
            { month: 2, paid: true, day: 5 }, { month: 3, paid: true, day: 3 },
        ],
    },

    // 2 inquilini cointestatari (coinquilini studenti)
    4: {
        id: 'IMM-004',
        indirizzo: 'Piazza Navona 23',
        citta: 'Roma',
        cap: '00186',
        provincia: 'RM',
        piano: '4° piano',
        mq: 95,
        vani: 3,
        valoreImmobile: '380.000',
        prodotto: 2,
        prodottoStato: 'attivo',
        contrattoStato: 'attivo',
        canone: '1.100',
        dataInizio: '01/09/2025',
        dataFine: '31/08/2026',
        durata: 12,
        prossimoPagamento: '5 Mag 2026',
        meseCorrentePagato: true,
        giorniRimanenti: 118,
        proprietari: [
            { id: 8, nome: 'Sara Conti', coincideConlocatore: true },
        ],
        locatori: [
            {
                id: 8, nome: 'Sara Conti', email: 'sara.conti@email.it',
                telefono: '+39 333 5556677', codiceFiscale: 'CNTSRA80M55H501Q', tipo: 'Privato',
            },
        ],
        inquilini: [
            {
                id: 9, nome: 'Marco Esposito', email: 'marco.esposito@email.it',
                telefono: '+39 347 1234500', codiceFiscale: 'SPSMRC95L01H501R',
                reputazione: 'verde', puntualita: 95,
            },
            {
                id: 10, nome: 'Davide Romano', email: 'davide.romano@email.it',
                telefono: '+39 347 1234511', codiceFiscale: 'RMNDVD96M02H501P',
                reputazione: 'giallo', puntualita: 78,
            },
        ],
        criaPayments: [
            { month: 0, paid: true, day: 5 }, { month: 1, paid: true, day: 5 },
        ],
        tenantPayments: [
            { month: 0, paid: true, day: 8 }, { month: 1, paid: false, day: null },
        ],
    },
};

const DOCUMENTI_IMMOBILE = [
    { id: 1, nome: 'Visura catastale.pdf', tipo: 'Catasto', appartenenza: 'Immobile', stato: 'verificato', data: '2026-01-10', caricatoDa: 'locatore' },
    { id: 2, nome: 'Planimetria.pdf', tipo: 'Immobile', appartenenza: 'Immobile', stato: 'verificato', data: '2026-01-10', caricatoDa: 'locatore' },
    { id: 3, nome: 'Contratto locazione.pdf', tipo: 'Contratto', appartenenza: 'locatore', stato: 'verificato', data: '2026-01-15', caricatoDa: 'locatore' },
    { id: 4, nome: 'Documento identità.pdf', tipo: 'Identità', appartenenza: 'locatore', stato: 'verificato', data: '2026-01-15', caricatoDa: 'locatore' },
    { id: 5, nome: 'Documento identità.pdf', tipo: 'Identità', appartenenza: 'Inquilino', stato: 'verificato', data: '2026-01-20', caricatoDa: 'Inquilino' },
    { id: 6, nome: 'Busta paga Marzo.pdf', tipo: 'Reddito', appartenenza: 'Inquilino', stato: 'da verificare', data: '2026-03-30', caricatoDa: 'Inquilino' },
    { id: 7, nome: 'Atto di proprietà.pdf', tipo: 'Proprietà', appartenenza: 'Proprietario', stato: 'verificato', data: '2026-01-10', caricatoDa: 'Admin' },
];

const STORICO_INQUILINI = [
    { nome: 'Sofia Martini', dal: '01/01/2026', al: 'In corso', reputazione: 'verde', motivo: '—' },
    { nome: 'Carlo Bruni', dal: '01/01/2025', al: '31/12/2025', reputazione: 'giallo', motivo: 'Disdetta anticipata' },
    { nome: 'Marta Esposito', dal: '01/06/2023', al: '31/12/2024', reputazione: 'verde', motivo: 'Scadenza naturale' },
    { nome: 'Andrea Bianchi', dal: '01/06/2022', al: '31/05/2023', reputazione: 'rosso', motivo: 'Mancato pagamento' },
];

const STORICO_PROPRIETA = [
    { proprietario: 'Marco Bianchi', dal: '01/01/2020', al: 'In corso', note: 'Proprietario attuale' },
    { proprietario: 'Luigi Bianchi', dal: '01/01/2010', al: '31/12/2019', note: 'Padre del proprietario attuale' },
];

const CONTESTAZIONI = [
    { id: 1, mese: 'Novembre 2025', stato: 'risolta', data: '18/11/2025', descrizione: 'Contestazione mancato pagamento — risolta a favore locatore.' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const STATO_DOC = {
    'verificato': 'bg-green-100 text-green-800',
    'da verificare': 'bg-yellow-100 text-yellow-800',
    'mancante': 'bg-red-100 text-red-800',
};

const PRODOTTO_BADGE = {
    1: { class: 'bg-blue-100 text-blue-800', label: 'CRIA Gestione (P1)' },
    2: { class: 'bg-purple-100 text-purple-800', label: 'CRIA Completo (P2)' },
    3: { class: 'bg-amber-100 text-amber-800', label: 'CRIA Verifica (P3)' },
};

const APPARTENENZA_COLOR = {
    'Immobile': 'bg-gray-100 text-gray-700',
    'locatore': 'bg-blue-100 text-blue-700',
    'Proprietario': 'bg-orange-100 text-orange-700',
    'Inquilino': 'bg-green-100 text-green-700',
};

const CARICATO_COLOR = {
    'Admin': 'bg-purple-100 text-purple-700',
    'locatore': 'bg-blue-100 text-blue-700',
    'Inquilino': 'bg-green-100 text-green-700',
    'Proprietario': 'bg-orange-100 text-orange-700',
};

const REP_CONFIG = {
    verde: { badge: 'bg-green-100 text-green-800', dot: 'bg-green-500', label: 'Verde' },
    giallo: { badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500', label: 'Giallo' },
    rosso: { badge: 'bg-red-100 text-red-800', dot: 'bg-red-500', label: 'Rosso' },
};

const CONTRATTO_STATO = {
    'attivo': { label: 'Attivo', class: 'bg-green-100 text-green-800' },
    'in_scadenza': { label: 'In scadenza', class: 'bg-orange-100 text-orange-800' },
    'vacante': { label: 'Vacante', class: 'bg-gray-100 text-gray-600' },
    'concluso': { label: 'Concluso', class: 'bg-slate-100 text-slate-700' },
    'sospeso': { label: 'Sospeso', class: 'bg-red-100 text-red-800' },
};

const PRODOTTO_STATO = {
    'attivo': { label: 'Attivo', class: 'bg-green-100 text-green-800' },
    'in_scadenza': { label: 'In scadenza', class: 'bg-orange-100 text-orange-800' },
    'scaduto': { label: 'Scaduto', class: 'bg-red-100 text-red-800' },
    'cancellato': { label: 'Cancellato', class: 'bg-gray-100 text-gray-600' },
};

// Calcolo reputazione media inquilini (verde > giallo > rosso)
const calcolaReputazioneMedia = (inquilini) => {
    if (!inquilini || inquilini.length === 0) return null;
    const valori = { verde: 3, giallo: 2, rosso: 1 };
    const inverso = { 3: 'verde', 2: 'giallo', 1: 'rosso' };
    const media = Math.round(
        inquilini.reduce((sum, i) => sum + (valori[i.reputazione] || 0), 0) / inquilini.length
    );
    const puntualitaMedia = Math.round(
        inquilini.reduce((sum, i) => sum + (i.puntualita || 0), 0) / inquilini.length
    );
    return { reputazione: inverso[media] || 'giallo', puntualita: puntualitaMedia };
};

// ─── Box figura coinvolta (riusabile) ──────────────────────────────────────────
const FiguraBox = ({ titolo, dati, color, clienteId, tipo }) => (
    <div className={`p-4 rounded-lg border ${color} flex flex-col gap-3`}>
        <p className="text-xs font-semibold text-muted-foreground uppercase">{titolo}</p>
        <div className="flex-1">
            <p className="font-semibold text-foreground">{dati.nome}</p>
            {dati.tipo && <p className="text-xs text-muted-foreground mb-1">{dati.tipo}</p>}
            {dati.email && <p className="text-sm text-muted-foreground">{dati.email}</p>}
            {dati.telefono && <p className="text-sm text-muted-foreground">{dati.telefono}</p>}
            {dati.codiceFiscale && <p className="text-xs text-muted-foreground tabular-nums mt-1">CF: {dati.codiceFiscale}</p>}
            {dati.reputazione && (
                <div className="mt-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${REP_CONFIG[dati.reputazione].badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${REP_CONFIG[dati.reputazione].dot}`} />
                        {REP_CONFIG[dati.reputazione].label} · {dati.puntualita}%
                    </span>
                </div>
            )}
        </div>
        {clienteId && (
            <Link to={`/dashboard/admin/clienti/${clienteId}`}>
                <Button variant="outline" size="sm" className="w-full gap-2">
                    Scheda cliente <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
            </Link>
        )}
    </div>
);

// ─── Modal conferma azione critica ────────────────────────────────────────────
const ModalConferma = ({ titolo, descrizione, onConferma, onAnnulla, color = 'destructive' }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{titolo}</h3>
            <p className="text-sm text-muted-foreground">{descrizione}</p>
            <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onAnnulla}>Annulla</Button>
                <Button variant={color} onClick={onConferma}>Conferma</Button>
            </div>
        </div>
    </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPALE
// ═════════════════════════════════════════════════════════════════════════════
const SchedaImmobilePage = () => {
    const { id } = useParams();
    const immobile = IMMOBILI[Number(id)] || IMMOBILI[1];

    const [documenti, setDocumenti] = useState(DOCUMENTI_IMMOBILE);
    const [nota, setNota] = useState('');
    const [noteList, setNoteList] = useState([
        { testo: 'Immobile in buone condizioni. Ultima ispezione gennaio 2026.', data: '10/01/2026', autore: 'Admin' },
    ]);
    const [modalAzione, setModalAzione] = useState(null); // null | { tipo, titolo, descrizione }

    // Reputazione aggregata (per multi-inquilino)
    const reputazioneAgg = calcolaReputazioneMedia(immobile.inquilini);
    const haInquilini = immobile.inquilini && immobile.inquilini.length > 0;

    const cambiaStatoDoc = (docId, nuovoStato) => {
        setDocumenti(prev => prev.map(d => d.id === docId ? { ...d, stato: nuovoStato } : d));
        toast.success(`Documento aggiornato: ${nuovoStato}`);
    };

    const invioNota = () => {
        if (!nota.trim()) return;
        setNoteList(prev => [{ testo: nota, data: new Date().toLocaleDateString('it-IT'), autore: 'Admin' }, ...prev]);
        setNota('');
    };

    // Azioni critiche
    const azioniCritiche = [
        {
            tipo: 'cambio_inquilino', label: 'Cambio inquilino', icon: UserMinus, color: 'border-orange-300 text-orange-700 hover:bg-orange-50',
            titolo: 'Cambio inquilino',
            descrizione: 'Stai per registrare un cambio di inquilino. Lo storico verrà conservato. Richiede aggiornamento documenti.'
        },
        {
            tipo: 'cambio_proprieta', label: 'Cambio proprietà', icon: RefreshCw, color: 'border-red-300 text-red-700 hover:bg-red-50',
            titolo: 'Cambio proprietà',
            descrizione: 'Stai per registrare un cambio di proprietà. Lo storico verrà conservato. Richiede verifica documentale.'
        },
        {
            tipo: 'sospendi', label: 'Sospendi immobile', icon: PauseCircle, color: 'border-amber-300 text-amber-700 hover:bg-amber-50',
            titolo: 'Sospendi immobile',
            descrizione: 'L\'immobile uscirà dalla gestione attiva. Il locatore non potrà più operare finché non rinnova il prodotto.'
        },
        {
            tipo: 'termina', label: 'Termina contratto', icon: StopCircle, color: 'border-red-300 text-red-700 hover:bg-red-50',
            titolo: 'Termina contratto anticipatamente',
            descrizione: 'Il contratto di locazione verrà chiuso prima della scadenza naturale. Lo storico viene conservato.'
        },
        {
            tipo: 'riattiva', label: 'Riattiva contratto', icon: PlayCircle, color: 'border-green-300 text-green-700 hover:bg-green-50',
            titolo: 'Riattiva contratto',
            descrizione: 'L\'immobile tornerà in gestione attiva. Verifica che il locatore abbia rinnovato il prodotto.'
        },
    ];

    return (
        <>
            <Helmet><title>{immobile.indirizzo} - Scheda Immobile</title></Helmet>

            {modalAzione && (
                <ModalConferma
                    titolo={modalAzione.titolo}
                    descrizione={modalAzione.descrizione}
                    onConferma={() => {
                        toast.success(`${modalAzione.titolo}: procedura avviata. Verrà completata col backend.`);
                        setModalAzione(null);
                    }}
                    onAnnulla={() => setModalAzione(null)}
                />
            )}

            <div className="space-y-6">

                {/* ─── BREADCRUMB + REPUTAZIONE INQUILINO IN ALTO A DESTRA ── */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-sm">
                        <Link to="/dashboard/admin/contratti">
                            <Button variant="ghost" size="sm" className="gap-1 px-2">
                                <ArrowLeft className="w-4 h-4" /> Contratti e Immobili
                            </Button>
                        </Link>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">{immobile.indirizzo}, {immobile.citta}</span>
                    </div>

                    {haInquilini && reputazioneAgg && (
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${REP_CONFIG[reputazioneAgg.reputazione].badge}`}>
                            <span className={`w-2 h-2 rounded-full ${REP_CONFIG[reputazioneAgg.reputazione].dot}`} />
                            {REP_CONFIG[reputazioneAgg.reputazione].label.toUpperCase()} · {immobile.inquilini.length > 1 ? 'inquilini' : 'inquilino'} · Puntualità {reputazioneAgg.puntualita}%
                        </span>
                    )}
                </div>

                {/* ─── 1. STATO ATTUALE: 2 sezioni affiancate, ognuna 2x2 ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Contratto di locazione */}
                    <Card>
                        <CardContent className="pt-5 pb-5">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">
                                Contratto di locazione
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Stato</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CONTRATTO_STATO[immobile.contrattoStato].class}`}>
                                        {CONTRATTO_STATO[immobile.contrattoStato].label}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Giorni rimanenti</p>
                                    <p className="text-sm font-semibold tabular-nums text-foreground">{immobile.giorniRimanenti} giorni</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Scadenza</p>
                                    <p className="text-sm font-semibold text-foreground">{immobile.dataFine}</p>
                                </div>
                                <div>
                                    {/* Cella vuota: bilanciamento layout 2x2 */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prodotto CRIA */}
                    <Card>
                        <CardContent className="pt-5 pb-5">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">
                                Prodotto CRIA
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Stato</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_STATO[immobile.prodottoStato].class}`}>
                                        {PRODOTTO_STATO[immobile.prodottoStato].label}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Durata</p>
                                    <p className="text-sm font-semibold tabular-nums text-foreground">{immobile.prodottoDurata} mesi</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Scadenza</p>
                                    <p className="text-sm font-semibold text-foreground">{immobile.prodottoScadenza}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1.5">Giorni rimanenti</p>
                                    <p className="text-sm font-semibold tabular-nums text-foreground">{immobile.prodottoGiorniRimanenti} giorni</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* ─── 2. DATI IMMOBILE (66/34 con mappa) ─────────────────── */}
                <Card className="overflow-hidden">
                    <div className="flex">
                        <div className="flex flex-col" style={{ width: '66%' }}>
                            <div className="flex items-center gap-3 px-5 py-6 flex-wrap">
                                <Home className="w-5 h-5 text-foreground" />
                                <span className="font-semibold text-foreground">Dati immobile</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRODOTTO_BADGE[immobile.prodotto].class}`}>
                                    {PRODOTTO_BADGE[immobile.prodotto].label}
                                </span>
                            </div>
                            <div className="p-5 grid grid-cols-3 gap-x-6 gap-y-5 flex-1">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">ID immobile</p>
                                    <p className="font-mono font-medium text-foreground">{immobile.id}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Indirizzo</p>
                                    <p className="font-medium text-foreground">{immobile.indirizzo}, {immobile.citta}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">CAP / Provincia</p>
                                    <p className="font-medium text-foreground">{immobile.cap} — {immobile.provincia}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Piano / Mq / Vani</p>
                                    <p className="font-medium text-foreground">{immobile.piano} · {immobile.mq} mq · {immobile.vani} vani</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Valore immobile</p>
                                    <p className="font-medium text-foreground tabular-nums flex items-center gap-1">
                                        <Euro className="w-3.5 h-3.5" /> {immobile.valoreImmobile}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Canone mensile</p>
                                    <p className="font-medium text-foreground tabular-nums">€ {immobile.canone}/mese</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Durata contratto</p>
                                    <p className="font-medium text-foreground">{immobile.durata} mesi</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Inizio / Fine</p>
                                    <p className="font-medium text-foreground">{immobile.dataInizio} → {immobile.dataFine}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Coordinate</p>
                                    {immobile.lat && immobile.lng ? (
                                        <p className="font-mono text-xs text-muted-foreground">{immobile.lat}, {immobile.lng}</p>
                                    ) : (
                                        <div className="space-y-1">
                                            <span className="text-xs text-yellow-600 flex items-center gap-1">
                                                <Zap className="w-3 h-3" /> Da geocodificare
                                            </span>
                                            <button onClick={() => toast.info('Geocodifica disponibile dopo backend')}
                                                className="text-xs text-primary underline flex items-center gap-1">
                                                <Zap className="w-3 h-3 text-yellow-500" /> Geocodifica
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-muted/10" style={{ width: '34%' }}>
                            <div className="rounded-lg overflow-hidden h-full" style={{ minHeight: '220px' }}>
                                <MappaSingolaImmobile
                                    lat={immobile.lat}
                                    lng={immobile.lng}
                                    indirizzo={`${immobile.indirizzo}, ${immobile.citta}`}
                                    reputazione={reputazioneAgg?.reputazione}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ─── 3. FIGURE COINVOLTE (3 colonne fisse, box espandono in righe) ─ */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" /> Figure coinvolte
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* Colonna 1: Proprietari */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                    Proprietari ({immobile.proprietari.length})
                                </p>
                                {immobile.proprietari.map((prop, i) => (
                                    prop.coincideConlocatore ? (
                                        <div key={i} className="p-4 rounded-lg border bg-orange-50 border-orange-200 flex flex-col gap-3">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase">
                                                Proprietario {immobile.proprietari.length > 1 ? `${i + 1} di ${immobile.proprietari.length}` : ''}
                                            </p>
                                            <div className="flex-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mb-2">
                                                    Coincide con il locatore
                                                </span>
                                                <p className="text-sm font-semibold text-foreground">{prop.nome}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <FiguraBox
                                            key={i}
                                            titolo={`Proprietario ${immobile.proprietari.length > 1 ? `${i + 1} di ${immobile.proprietari.length}` : ''}`}
                                            dati={prop}
                                            color="bg-orange-50 border-orange-200"
                                            clienteId={prop.id}
                                        />
                                    )
                                ))}
                            </div>

                            {/* Colonna 2: locatori */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                    locatori ({immobile.locatori.length})
                                </p>
                                {immobile.locatori.map((loc, i) => (
                                    <FiguraBox
                                        key={i}
                                        titolo={`locatore ${immobile.locatori.length > 1 ? `${i + 1} di ${immobile.locatori.length}` : ''}`}
                                        dati={loc}
                                        color="bg-blue-50 border-blue-200"
                                        clienteId={loc.id}
                                    />
                                ))}
                            </div>

                            {/* Colonna 3: Inquilini */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                    Inquilini ({immobile.inquilini.length})
                                </p>
                                {immobile.inquilini.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic p-4 bg-muted/40 rounded-lg">
                                        Nessun inquilino — immobile vacante.
                                    </p>
                                ) : (
                                    immobile.inquilini.map((inq, i) => (
                                        <FiguraBox
                                            key={i}
                                            titolo={`Inquilino ${immobile.inquilini.length > 1 ? `${i + 1} di ${immobile.inquilini.length}` : ''}`}
                                            dati={inq}
                                            color="bg-green-50 border-green-200"
                                            clienteId={inq.id}
                                        />
                                    ))
                                )}
                            </div>

                        </div>
                    </CardContent>
                </Card>

                {/* ─── 4. STORICO PAGAMENTI ─────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" /> Storico pagamenti — ultimi 12 mesi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {immobile.prodotto === 2 ? (
                            <>
                                <div>
                                    <p className="text-sm font-medium mb-2">Pagamenti CRIA → locatore</p>
                                    <PaymentTimeline payments={immobile.criaPayments} />
                                </div>
                                <div className="bg-muted/40 rounded-lg p-4">
                                    <p className="text-sm font-medium mb-2">Pagamenti Inquilino → CRIA</p>
                                    <PaymentTimeline payments={immobile.tenantPayments} />
                                    <p className="text-xs text-muted-foreground mt-2">
                                        CRIA garantisce i pagamenti al locatore indipendentemente dal comportamento dell'inquilino.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <PaymentTimeline payments={immobile.pagamenti} />
                        )}
                    </CardContent>
                </Card>

                {/* ─── 5. STORICO INQUILINI (con motivo) ─────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" /> Storico inquilini
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Inquilino</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Dal</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Al</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Reputazione</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Motivo conclusione</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {STORICO_INQUILINI.map((s, i) => (
                                    <tr key={i} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium text-foreground">{s.nome}</td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">{s.dal}</td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">{s.al}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${REP_CONFIG[s.reputazione].badge}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${REP_CONFIG[s.reputazione].dot}`} />
                                                {REP_CONFIG[s.reputazione].label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.motivo}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* ─── 6. STORICO PROPRIETÀ ─────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" /> Storico proprietà
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Proprietario</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Dal</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Al</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {STORICO_PROPRIETA.map((s, i) => (
                                    <tr key={i} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium text-foreground">{s.proprietario}</td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">{s.dal}</td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">{s.al}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{s.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* ─── 7. DOCUMENTI (con caricato da) ────────────────────── */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" /> Documenti
                            </CardTitle>
                            <Button size="sm" variant="outline" className="gap-2"
                                onClick={() => toast.info('Funzionalità disponibile dopo backend')}>
                                <Upload className="w-4 h-4" /> Aggiungi documento
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nome file</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Tipo</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Appartenenza</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Caricato da</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {documenti.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3 font-medium text-foreground">{doc.nome}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{doc.tipo}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${APPARTENENZA_COLOR[doc.appartenenza]}`}>
                                                {doc.appartenenza}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${CARICATO_COLOR[doc.caricatoDa]}`}>
                                                {doc.caricatoDa}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">{doc.data}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_DOC[doc.stato]}`}>
                                                {doc.stato}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex gap-1 justify-end">
                                                <Button size="sm" variant="ghost" className="h-7 text-green-700" title="Verifica"
                                                    onClick={() => cambiaStatoDoc(doc.id, 'verificato')}>
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-7 text-red-700" title="Richiedi integrazione"
                                                    onClick={() => cambiaStatoDoc(doc.id, 'da verificare')}>
                                                    <XCircle className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* ─── 8. CONTESTAZIONI ──────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> Contestazioni
                            </CardTitle>
                            <Button size="sm" className="gap-2"
                                onClick={() => toast.info('Funzionalità disponibile dopo backend')}>
                                <Plus className="w-4 h-4" /> Nuova contestazione
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {CONTESTAZIONI.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">Nessuna contestazione registrata.</p>
                        ) : (
                            <div className="space-y-3">
                                {CONTESTAZIONI.map((c) => (
                                    <div key={c.id} className="p-4 bg-muted/40 rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-foreground text-sm">{c.mese}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.stato === 'risolta' ? 'bg-green-100 text-green-800' :
                                                    c.stato === 'aperta' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>{c.stato}</span>
                                                <Link to={`/dashboard/admin/contestazioni/${c.id}`}>
                                                    <Button variant="outline" size="sm">Gestisci</Button>
                                                </Link>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{c.descrizione}</p>
                                        <p className="text-xs text-muted-foreground">Aperta il {c.data}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ─── 9. NOTE INTERNE ──────────────────────────────────── */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <StickyNote className="w-5 h-5" /> Note interne
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <textarea
                                value={nota}
                                onChange={e => setNota(e.target.value)}
                                placeholder="Scrivi una nota interna..."
                                rows={2}
                                className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <Button onClick={invioNota} size="sm" className="gap-2 self-end">
                                <Send className="w-4 h-4" /> Salva
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {noteList.map((n, i) => (
                                <div key={i} className="p-3 bg-muted/40 rounded-lg">
                                    <p className="text-sm text-foreground">{n.testo}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{n.autore} — {n.data}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* ─── 10. AZIONI CRITICHE (5 azioni) ───────────────────── */}
                <Card className="border-red-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="w-5 h-5" /> Azioni critiche
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Le seguenti azioni modificano lo stato del contratto e/o del prodotto.
                            Lo storico verrà sempre conservato.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {azioniCritiche.map(({ tipo, label, icon: Icon, color, titolo, descrizione }) => (
                                <Button
                                    key={tipo}
                                    variant="outline"
                                    className={`gap-2 ${color}`}
                                    onClick={() => setModalAzione({ tipo, titolo, descrizione })}
                                >
                                    <Icon className="w-4 h-4" /> {label}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </>
    );
};

export default SchedaImmobilePage;