import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MappaImmobili from '@/components/MappaImmobili.jsx';
import { useAnagrafica } from '@/lib/anagraficheDemo';
import { FASI_PRATICA } from '@/data/pratiche';
import { nomeProdotto } from '@/data/catalogo';
import { analizzaMesi } from '@/lib/semaforo';

// ═════════════════════════════════════════════════════════════════════════════
// TUTTI GLI IMMOBILI DI CRIA SULLA MAPPA — la stessa nella panoramica (O-01) e
// nella scheda «Immobili» di Contratti e immobili (O-05). Il colore è il
// semaforo del contratto in corso; grigio per chi è ancora in pratica. Un clic
// sul punto apre la scheda dell'immobile.
// ═════════════════════════════════════════════════════════════════════════════

export const percorsoImmobile = (id) => `/dashboard/admin/immobili/${id}`;

export const titolareAttuale = (immobile) => immobile.titolarita.find(t => !t.al) || null;

const etichettaFase = (stato) => FASI_PRATICA.find(f => f.id === stato)?.etichetta || stato;

// Cosa succede adesso nell'immobile, in una riga.
export const adessoNellImmobile = (immobile) => {
    const c = immobile.contratti[0];
    if (c) return `Inquilino: ${c.conduttore.nome} · ${nomeProdotto(c.prodotto)}`;
    const p = immobile.pratiche[0];
    return p ? `Pratica ${nomeProdotto(p.prodotto)} · fase: ${etichettaFase(p.stato).toLowerCase()}` : '—';
};

export const puntiSullaMappa = (immobili) => immobili
    .filter(i => i.dati.lat && i.dati.lng)
    .map(i => {
        const t = titolareAttuale(i);
        return {
            id: i.id,
            lat: i.dati.lat,
            lng: i.dati.lng,
            titolo: `${i.dati.indirizzo}, ${i.dati.citta}`,
            righe: [`Codice ${i.codice}`, `Proprietario: ${t?.soggetto?.nomeCompleto || t?.nome || '—'}`, adessoNellImmobile(i)],
            stato: i.contratti[0] ? analizzaMesi(i.contratti[0].mesi).semaforo : 'storico_insufficiente',
        };
    });

/** `immobili`: un sottoinsieme (per esempio quelli trovati da una ricerca); senza, tutti. */
const MappaImmobiliCria = ({ immobili, altezza = 360 }) => {
    const navigate = useNavigate();
    const modello = useAnagrafica();
    const elenco = immobili || modello.immobili;
    const punti = useMemo(() => puntiSullaMappa(elenco), [elenco]);
    return <MappaImmobili immobili={punti} altezza={altezza} onApri={(id) => navigate(percorsoImmobile(id))} />;
};

export default MappaImmobiliCria;
