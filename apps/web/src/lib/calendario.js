// ═════════════════════════════════════════════════════════════════════════════
// CALENDARIO DEI TERMINI (lotto 5, motore delle scadenze §13.6)
// Due calendari, e la differenza va nel codice: giorni LAVORATIVI per i
// termini interni, giorni SOLARI per quelli che riguardano il cliente — un
// termine contrattuale espresso in giorni lavorativi si contesta.
// Date sempre come 'AAAA-MM-GG', fuso Europe/Rome; i conti si fanno in UTC a
// mezzogiorno così l'ora legale non sposta nessun giorno.
// ═════════════════════════════════════════════════════════════════════════════

const DAY = 86400000;
const aData = (iso) => new Date(`${iso}T12:00:00Z`);
const aIso = (d) => d.toISOString().slice(0, 10);

// Pasqua (algoritmo anonimo gregoriano): serve per il Lunedì dell'Angelo.
const pasqua = (anno) => {
    const a = anno % 19, b = Math.floor(anno / 100), c = anno % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mese = Math.floor((h + l - 7 * m + 114) / 31), giorno = ((h + l - 7 * m + 114) % 31) + 1;
    return `${anno}-${String(mese).padStart(2, '0')}-${String(giorno).padStart(2, '0')}`;
};

// Festività nazionali. I patroni locali non contano: CRIA lavora da una sede sola.
const FESTE_FISSE = ['01-01', '01-06', '04-25', '05-01', '06-02', '08-15', '11-01', '12-08', '12-25', '12-26'];

const festiviCache = {};
export const festiviDellAnno = (anno) => {
    if (!festiviCache[anno]) {
        const pasquetta = aIso(new Date(aData(pasqua(anno)).getTime() + DAY));
        festiviCache[anno] = new Set([...FESTE_FISSE.map(md => `${anno}-${md}`), pasquetta]);
    }
    return festiviCache[anno];
};

export const isFestivo = (iso) => festiviDellAnno(Number(iso.slice(0, 4))).has(iso);

export const isLavorativo = (iso) => {
    const g = aData(iso).getUTCDay();
    return g !== 0 && g !== 6 && !isFestivo(iso);
};

export const aggiungiGiorniSolari = (iso, n) => aIso(new Date(aData(iso).getTime() + n * DAY));

export const aggiungiGiorniLavorativi = (iso, n) => {
    let d = iso;
    let restano = n;
    const passo = n >= 0 ? 1 : -1;
    while (restano !== 0) {
        d = aggiungiGiorniSolari(d, passo);
        if (isLavorativo(d)) restano -= passo;
    }
    return d;
};

// Giorni solari da `da` ad `a` (positivo se `a` viene dopo).
export const giorniSolariTra = (da, a) => Math.round((aData(a) - aData(da)) / DAY);

// Giorni lavorativi da `da` (escluso) ad `a` (incluso); negativo se `a` viene prima.
export const giorniLavorativiTra = (da, a) => {
    if (da === a) return 0;
    const verso = a > da ? 1 : -1;
    let n = 0;
    for (let d = da; d !== a;) {
        d = aggiungiGiorniSolari(d, verso);
        if (isLavorativo(d)) n += verso;
    }
    return n;
};

/**
 * Un termine: decorrenza + durata, nel calendario giusto.
 * @param {{ decorrenza: string, giorni: number, calendario: 'lavorativi' | 'solari' }} t
 */
export const calcolaTermine = ({ decorrenza, giorni, calendario }) =>
    calendario === 'lavorativi' ? aggiungiGiorniLavorativi(decorrenza, giorni) : aggiungiGiorniSolari(decorrenza, giorni);

/**
 * Quanto manca a un termine, nel suo calendario: > 0 mancano, 0 scade oggi, < 0 è scaduto.
 */
export const mancanoAlTermine = (oggi, termine, calendario) =>
    calendario === 'lavorativi' ? giorniLavorativiTra(oggi, termine) : giorniSolariTra(oggi, termine);

export const etichettaCalendario = (calendario, n = 2) =>
    calendario === 'lavorativi' ? (n === 1 ? 'giorno lavorativo' : 'giorni lavorativi') : (n === 1 ? 'giorno' : 'giorni');
