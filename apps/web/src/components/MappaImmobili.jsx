import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { SEMAFORO } from '@/lib/semaforo';

// ═════════════════════════════════════════════════════════════════════════════
// MAPPA IMMOBILI — un componente solo per tutte le mappe con più immobili.
// Senza `immobili` mostra il portafoglio dimostrativo dell'area interna.
//
// Il CSS di Leaflet entra nel bundle, così la mappa non nasce prima degli stili.
// Leaflet si carica con un import asincrono: l'effetto tiene un segnale di
// annullamento, così in sviluppo (dove React esegue l'effetto due volte) la
// prima inizializzazione non si sovrappone alla seconda sullo stesso contenitore.
// ═════════════════════════════════════════════════════════════════════════════

const PORTAFOGLIO_INTERNO = [
    { id: 1, lat: 45.4654, lng: 9.1859, titolo: 'Via Torino 12, Milano', righe: ['Inquilino: Luca Ferrari'], stato: 'verde' },
    { id: 2, lat: 45.4708, lng: 9.1820, titolo: 'Corso Buenos Aires 40, Milano', righe: ['Inquilina: Marta Greco'], stato: 'giallo' },
    { id: 3, lat: 45.4408, lng: 12.3155, titolo: 'Calle Larga 8, Venezia', righe: ['Inquilina: Sara Conti'], stato: 'verde' },
    { id: 4, lat: 45.0703, lng: 7.6869, titolo: 'Corso Re Umberto 5, Torino', righe: ['Inquilina: Chiara Lombardi'], stato: 'rosso' },
    { id: 5, lat: 45.0650, lng: 7.6920, titolo: 'Via Po 18, Torino', righe: ['Inquilino: Giorgio Esposito'], stato: 'verde' },
    { id: 6, lat: 44.4949, lng: 11.3426, titolo: 'Via Indipendenza 22, Bologna', righe: ['Inquilino: Roberto Fabbri'], stato: 'giallo' },
    { id: 7, lat: 45.4384, lng: 10.9916, titolo: 'Via Mazzini 3, Verona', righe: ['Inquilina: Giulia Neri'], stato: 'verde' },
    { id: 8, lat: 44.1417, lng: 12.2484, titolo: 'Viale Roma 18, Rimini', righe: ['Inquilino: Marco Bianchi'], stato: 'verde' },
    { id: 9, lat: 45.6550, lng: 13.7768, titolo: 'Via Carducci 7, Trieste', righe: ['Inquilina: Anna Russo'], stato: 'giallo' },
    { id: 10, lat: 44.4056, lng: 8.9463, titolo: 'Via Garibaldi 56, Genova', righe: ['Inquilino: Paolo Gallo'], stato: 'rosso' },
    { id: 11, lat: 45.5416, lng: 10.2118, titolo: 'Corso Palestro 11, Brescia', righe: ['Inquilina: Elena Vitali'], stato: 'verde' },
    { id: 12, lat: 45.6495, lng: 9.1597, titolo: 'Via Libertà 4, Monza', righe: ['Inquilino: Fabio Colombo'], stato: 'verde' },
    { id: 13, lat: 44.8015, lng: 10.3279, titolo: 'Piazza Garibaldi 1, Parma', righe: ['Inquilina: Alessia Moretti'], stato: 'rosso' },
    { id: 14, lat: 45.4064, lng: 11.8768, titolo: 'Riviera Tito Livio 9, Padova', righe: ['Inquilino: Davide Ricci'], stato: 'verde' },
];

const PRIORITA = { rosso: 4, giallo: 3, storico_insufficiente: 2, verde: 1 };
const escape = (t) => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const MappaImmobili = ({ immobili, altezza = 420, onApri }) => {
    const mapRef = useRef(null);
    const onApriRef = useRef(onApri);
    onApriRef.current = onApri;

    const punti = (immobili || PORTAFOGLIO_INTERNO).filter(p => p.lat && p.lng);
    const usaCluster = punti.length > 8;
    const chiave = JSON.stringify(punti.map(p => [p.id, p.stato, p.lat, p.lng]));

    useEffect(() => {
        let annullato = false;
        let mappa = null;
        let osservatore = null;

        import('leaflet').then(async (mod) => {
            const L = mod.default || mod;
            if (usaCluster) {
                window.L = L;
                await import('leaflet.markercluster');
            }
            if (annullato || !mapRef.current) return;

            mappa = L.map(mapRef.current, { scrollWheelZoom: false, zoomControl: true });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(mappa);

            const livello = usaCluster
                ? L.markerClusterGroup({
                    maxClusterRadius: 50,
                    showCoverageOnHover: false,
                    iconCreateFunction: (cluster) => {
                        const peggiore = cluster.getAllChildMarkers()
                            .reduce((w, m) => (PRIORITA[m.options.stato] > PRIORITA[w] ? m.options.stato : w), 'verde');
                        return L.divIcon({
                            html: `<div style="width:36px;height:36px;background:${SEMAFORO[peggiore].colore};border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${cluster.getChildCount()}</div>`,
                            className: '', iconSize: [36, 36], iconAnchor: [18, 18],
                        });
                    },
                })
                : L.layerGroup();

            punti.forEach((p) => {
                const voce = SEMAFORO[p.stato] || SEMAFORO.storico_insufficiente;
                const icon = L.divIcon({
                    className: '',
                    html: `<div style="width:16px;height:16px;background:${voce.colore};border:3px solid white;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,0.35);"></div>`,
                    iconSize: [16, 16], iconAnchor: [8, 8], popupAnchor: [0, -10],
                });
                const marker = L.marker([p.lat, p.lng], { icon, stato: p.stato });
                marker.bindPopup(`
                    <div style="min-width:190px;font-family:inherit;">
                        <p style="font-weight:600;margin:0 0 2px;font-size:13px;">${escape(p.titolo)}</p>
                        ${(p.righe || []).map(r => `<p style="color:#6b7280;font-size:12px;margin:0 0 2px;">${escape(r)}</p>`).join('')}
                        <span style="display:inline-block;margin-top:6px;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:500;background:${voce.colore}22;color:#1f2937;">${voce.etichetta}</span>
                        ${onApriRef.current ? `<p style="margin:8px 0 0;"><a href="#" data-apri="1" style="font-size:12px;font-weight:600;color:#1A2D52;">Apri la scheda →</a></p>` : ''}
                    </div>
                `);
                marker.on('popupopen', (e) => {
                    const link = e.popup.getElement()?.querySelector('[data-apri]');
                    if (link) link.onclick = (ev) => { ev.preventDefault(); onApriRef.current?.(p.id); };
                });
                livello.addLayer(marker);
            });
            mappa.addLayer(livello);

            const inquadra = () => {
                if (!mappa) return;
                if (punti.length === 1) mappa.setView([punti[0].lat, punti[0].lng], 15);
                else if (punti.length > 1) mappa.fitBounds(L.latLngBounds(punti.map(p => [p.lat, p.lng])), { padding: [48, 48], maxZoom: 15 });
                else mappa.setView([45.4642, 9.19], 12);
            };
            inquadra();

            // Se il contenitore cambia misura dopo la creazione (una griglia che
            // finisce di impaginarsi), si ridisegna e si reinquadra: altrimenti le
            // tessere restano a metà e i punti finiscono sul bordo.
            const misura = () => `${mapRef.current?.offsetWidth}x${mapRef.current?.offsetHeight}`;
            let ultima = misura();
            osservatore = new ResizeObserver(() => {
                const ora = misura();
                if (!mappa || ora === ultima) return;
                ultima = ora;
                mappa.invalidateSize();
                inquadra();
            });
            osservatore.observe(mapRef.current);
        });

        return () => {
            annullato = true;
            if (osservatore) { osservatore.disconnect(); osservatore = null; }
            if (mappa) { mappa.remove(); mappa = null; }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chiave, usaCluster]);

    const statiPresenti = ['verde', 'giallo', 'rosso', 'storico_insufficiente'].filter(s => punti.some(p => p.stato === s));

    return (
        <div className="relative">
            <div ref={mapRef} style={{ height: `${altezza}px`, width: '100%', borderRadius: '10px', zIndex: 0 }} />
            {statiPresenti.length > 0 && (
                <div className="absolute bottom-6 left-4 z-[1000] bg-white rounded-lg px-3 py-2 shadow-md flex flex-col gap-1.5">
                    {statiPresenti.map(s => (
                        <div key={s} className="flex items-center gap-2 text-xs text-gray-700">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: SEMAFORO[s].colore }} />
                            {SEMAFORO[s].etichetta}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MappaImmobili;
