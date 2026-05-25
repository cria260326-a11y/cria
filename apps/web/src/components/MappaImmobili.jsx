import React, { useEffect, useRef } from 'react';

const immobili = [
    { id: 1, lat: 45.4654, lng: 9.1859, address: 'Via Torino 12, Milano', inquilino: 'Luca Ferrari', locatore: 'Marco Bianchi', stato: 'verde' },
    { id: 2, lat: 45.4708, lng: 9.1820, address: 'Corso Buenos Aires 40, Milano', inquilino: 'Marta Greco', locatore: 'Marco Bianchi', stato: 'giallo' },
    { id: 3, lat: 45.4408, lng: 12.3155, address: 'Calle Larga 8, Venezia', inquilino: 'Sara Conti', locatore: 'Marco Bianchi', stato: 'verde' },
    { id: 4, lat: 45.0703, lng: 7.6869, address: 'Corso Re Umberto 5, Torino', inquilino: 'Chiara Lombardi', locatore: 'Marco Bianchi', stato: 'rosso' },
    { id: 5, lat: 45.0650, lng: 7.6920, address: 'Via Po 18, Torino', inquilino: 'Giorgio Esposito', locatore: 'Marco Bianchi', stato: 'verde' },
    { id: 6, lat: 44.4949, lng: 11.3426, address: 'Via Indipendenza 22, Bologna', inquilino: 'Roberto Fabbri', locatore: 'Marco Bianchi', stato: 'giallo' },
    { id: 7, lat: 45.4384, lng: 10.9916, address: 'Via Mazzini 3, Verona', inquilino: 'Giulia Neri', locatore: 'Marco Bianchi', stato: 'verde' },
    { id: 8, lat: 44.1417, lng: 12.2484, address: 'Viale Roma 18, Rimini', inquilino: 'Marco Bianchi', locatore: 'Marco Bianchi', stato: 'verde' },
    { id: 9, lat: 45.6550, lng: 13.7768, address: 'Via Carducci 7, Trieste', inquilino: 'Anna Russo', locatore: 'Marco Bianchi', stato: 'giallo' },
    { id: 10, lat: 44.4056, lng: 8.9463, address: 'Via Garibaldi 56, Genova', inquilino: 'Paolo Gallo', locatore: 'Marco Bianchi', stato: 'rosso' },
    { id: 11, lat: 45.5416, lng: 10.2118, address: 'Corso Palestro 11, Brescia', inquilino: 'Elena Vitali', locatore: 'Marco Bianchi', stato: 'verde' },
    { id: 12, lat: 45.6495, lng: 9.1597, address: 'Via Libertà 4, Monza', inquilino: 'Fabio Colombo', locatore: 'Marco Bianchi', stato: 'verde' },
    { id: 13, lat: 44.8015, lng: 10.3279, address: 'Piazza Garibaldi 1, Parma', inquilino: 'Alessia Moretti', locatore: 'Marco Bianchi', stato: 'rosso' },
    { id: 14, lat: 45.4064, lng: 11.8768, address: 'Riviera Tito Livio 9, Padova', inquilino: 'Davide Ricci', locatore: 'Marco Bianchi', stato: 'verde' },
];

const colori = { verde: '#22c55e', giallo: '#eab308', rosso: '#ef4444' };
const etichette = { verde: 'Regolare', giallo: 'In ritardo', rosso: 'Irregolare' };
const priorita = { rosso: 3, giallo: 2, verde: 1 };

const MappaImmobili = () => {
    const mapRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        if (instanceRef.current) return;

        // CSS Leaflet
        if (!document.getElementById('leaflet-css')) {
            const l = document.createElement('link');
            l.id = 'leaflet-css'; l.rel = 'stylesheet';
            l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(l);
        }
        // CSS MarkerCluster
        if (!document.getElementById('cluster-css')) {
            const l = document.createElement('link');
            l.id = 'cluster-css'; l.rel = 'stylesheet';
            l.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css';
            document.head.appendChild(l);
        }

        // Prima Leaflet, poi markercluster che richiede window.L
        import('leaflet').then((mod) => {
            const Leaflet = mod.default || mod;

            // Rende Leaflet disponibile globalmente per markercluster
            window.L = Leaflet;

            delete Leaflet.Icon.Default.prototype._getIconUrl;
            Leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });

            // Ora importa markercluster (troverà window.L)
            import('leaflet.markercluster').then(() => {
                const map = Leaflet.map(mapRef.current, {
                    center: [45.2, 10.5],
                    zoom: 7,
                    scrollWheelZoom: false,
                });
                instanceRef.current = map;

                Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                }).addTo(map);

                const clusterGroup = Leaflet.markerClusterGroup({
                    maxClusterRadius: 50,
                    spiderfyOnMaxZoom: true,
                    showCoverageOnHover: false,
                    zoomToBoundsOnClick: true,
                    iconCreateFunction: (cluster) => {
                        const markers = cluster.getAllChildMarkers();
                        const worstStato = markers.reduce((worst, m) => {
                            const s = m.options.stato;
                            return priorita[s] > priorita[worst] ? s : worst;
                        }, 'verde');
                        const colore = colori[worstStato];
                        const count = cluster.getChildCount();
                        return Leaflet.divIcon({
                            html: `<div style="width:36px;height:36px;background:${colore};border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${count}</div>`,
                            className: '',
                            iconSize: [36, 36],
                            iconAnchor: [18, 18],
                        });
                    },
                });

                immobili.forEach((im) => {
                    const icon = Leaflet.divIcon({
                        className: '',
                        html: `<div style="width:14px;height:14px;background:${colori[im.stato]};border:2.5px solid white;border-radius:50%;box-shadow:0 1px 5px rgba(0,0,0,0.35);"></div>`,
                        iconSize: [14, 14],
                        iconAnchor: [7, 7],
                        popupAnchor: [0, -10],
                    });
                    const marker = Leaflet.marker([im.lat, im.lng], { icon, stato: im.stato });
                    marker.bindPopup(`
  <div style="min-width:190px;font-family:inherit;">
    <p style="font-weight:600;margin-bottom:2px;font-size:13px;">${im.inquilino}</p>
    <p style="color:#6b7280;font-size:12px;margin-bottom:2px;">locatore: ${im.locatore}</p>
    <p style="color:#6b7280;font-size:12px;margin-bottom:8px;">${im.address}</p>
              <span style="display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:500;
                background:${im.stato === 'verde' ? '#dcfce7' : im.stato === 'giallo' ? '#fef9c3' : '#fee2e2'};
                color:${im.stato === 'verde' ? '#166534' : im.stato === 'giallo' ? '#854d0e' : '#991b1b'};">
                ${etichette[im.stato]}
              </span>
            </div>
          `);
                    clusterGroup.addLayer(marker);
                });

                map.addLayer(clusterGroup);
                const bounds = Leaflet.latLngBounds(immobili.map(i => [i.lat, i.lng]));
                map.fitBounds(bounds, { padding: [40, 40] });
            });
        });

        return () => {
            if (instanceRef.current) {
                instanceRef.current.remove();
                instanceRef.current = null;
            }
        };
    }, []);

    return (
        <div style={{ position: 'relative' }}>
            <div ref={mapRef} style={{ height: '420px', width: '100%', borderRadius: '10px', zIndex: 0 }} />
            <div style={{
                position: 'absolute', bottom: '24px', left: '16px', zIndex: 1000,
                background: 'white', borderRadius: '8px', padding: '8px 12px',
                boxShadow: '0 1px 6px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '6px'
            }}>
                {Object.entries(colori).map(([stato, colore]) => (
                    <div key={stato} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#374151' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colore, flexShrink: 0 }} />
                        {etichette[stato]}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MappaImmobili;