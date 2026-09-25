// ═════════════════════════════════════════════════════════════════════════════
// SEMAFORO — un calcolo solo e un solo vocabolario per tutta la piattaforma
// Regole dal documento di stato §9.1 e §9.2:
//   media del giorno di pagamento sugli ultimi 12 mesi
//   verde ≤ 5 · giallo da 6 a 10 · rosso oltre 10
//   un mese insoluto → rosso (proposta §9.1, ancora da confermare)
//   un mese non rilevato pesa zero, né a favore né contro
//   un mese contestato o ancora contestabile resta fuori finché non si chiude
//   con meno di 3 mesi rilevati non si dà un colore: storico insufficiente
// ═════════════════════════════════════════════════════════════════════════════

// Finestra del calcolo, in mesi. In piattaforma diventa un parametro del prodotto (§9.2-bis).
export const MESI_SEMAFORO = 12;

export const SEMAFORO = {
    verde: {
        etichetta: 'Regolare',
        spiegazione: 'Paga in media entro il giorno 5',
        colore: '#22C55E',
        pieno: 'bg-[hsl(var(--status-green))] text-white hover:bg-[hsl(var(--status-green))]/90',
        tenue: 'bg-green-50 text-green-800 border-green-200',
    },
    giallo: {
        etichetta: 'In ritardo',
        spiegazione: 'Paga in media tra il giorno 6 e il giorno 10',
        colore: '#EAB308',
        pieno: 'bg-[hsl(var(--status-yellow))] text-white hover:bg-[hsl(var(--status-yellow))]/90',
        tenue: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    },
    rosso: {
        etichetta: 'Irregolare',
        spiegazione: 'Paga in media dopo il giorno 10, oppure ha un mese non pagato',
        colore: '#EF4444',
        pieno: 'bg-[hsl(var(--status-red))] text-white hover:bg-[hsl(var(--status-red))]/90',
        tenue: 'bg-red-50 text-red-800 border-red-200',
    },
    storico_insufficiente: {
        etichetta: 'Storico insufficiente',
        spiegazione: 'Meno di 3 mesi rilevati: non si dà un colore',
        colore: '#9CA3AF',
        pieno: 'bg-gray-400 text-white hover:bg-gray-400/90',
        tenue: 'bg-gray-50 text-gray-700 border-gray-200',
    },
};

export const ORDINE_SEMAFORO = ['verde', 'giallo', 'rosso', 'storico_insufficiente'];

// Esito del singolo mese, per timeline e tabelle.
export const ESITI_MESE = {
    puntuale: { etichetta: 'Entro il 5', colore: '#22C55E', pesa: true },
    ritardo: { etichetta: 'Dal 6 al 10', colore: '#EAB308', pesa: true },
    grave: { etichetta: 'Dopo il 10', colore: '#EF4444', pesa: true },
    insoluto: { etichetta: 'Non pagato', colore: '#EF4444', pesa: true },
    non_rilevato: { etichetta: 'Non rilevato', colore: '#9CA3AF', pesa: false },
    in_sospeso: { etichetta: 'In verifica', colore: '#3B82F6', pesa: false },
};

export const esitoMese = (m) => {
    switch (m.stato) {
        case 'pagato': return m.giorno <= 5 ? 'puntuale' : m.giorno <= 10 ? 'ritardo' : 'grave';
        case 'insoluto': return 'insoluto';
        case 'non_rilevato': return 'non_rilevato';
        default: return 'in_sospeso'; // contestato o ancora contestabile
    }
};

export const analizzaMesi = (mesi) => {
    const ultimi = [...mesi].sort((a, b) => a.mese.localeCompare(b.mese)).slice(-MESI_SEMAFORO);
    const esiti = ultimi.map(esitoMese);
    const pagati = ultimi.filter(m => m.stato === 'pagato');
    const insoluti = esiti.filter(e => e === 'insoluto').length;
    const rilevati = pagati.length + insoluti;
    const media = pagati.length ? pagati.reduce((s, m) => s + m.giorno, 0) / pagati.length : null;

    let semaforo;
    if (insoluti > 0) semaforo = 'rosso';
    else if (rilevati < 3) semaforo = 'storico_insufficiente';
    else if (media <= 5) semaforo = 'verde';
    else if (media <= 10) semaforo = 'giallo';
    else semaforo = 'rosso';

    return {
        semaforo,
        media: media == null ? null : Math.round(media * 10) / 10,
        rilevati,
        insoluti,
        nonRilevati: esiti.filter(e => e === 'non_rilevato').length,
        inSospeso: esiti.filter(e => e === 'in_sospeso').length,
        mesiConsiderati: ultimi.length,
    };
};

export const calcolaSemaforo = (mesi) => analizzaMesi(mesi).semaforo;
