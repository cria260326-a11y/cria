import { PRODOTTI, PARAMETRI } from '@/data/catalogo';
import { modelloDelCiclo } from '@/lib/prodottiDemo';

// ═════════════════════════════════════════════════════════════════════════════
// I TEMPI DEL CICLO MENSILE — per prodotto
// Finestra, solleciti, giorno di chiusura e franchigia: quelli del documento di
// stato (§9.2). La pagina per cambiarli (Parametri del ciclo) è stata tolta il
// 22 settembre 2026, insieme alle versioni del listino: oggi c'è una versione
// sola e vale per tutti i contratti. La forma a versioni resta perché ogni
// contratto dice quale versione ha congelato alla firma (§9.2-bis): se i tempi
// torneranno modificabili, basterà aggiungerne una.
// Fase 4: tabella parametri_versioni e i parametri congelati sul contratto.
// ═════════════════════════════════════════════════════════════════════════════

const PRODOTTI_CICLO = ['P1', 'P1E', 'P2', 'P5'];

// Scadenza del canone: la dice il contratto di locazione, non il prodotto.
const GIORNO_SCADENZA = PARAMETRI.giornoScadenzaCanone;

const P = PRODOTTI;

// Finestra di 5 giorni, solleciti al giorno +1 e +3 e la mattina dell'ultimo
// giorno utile, chiusura l'11. Vale dal 1° gennaio 2024, prima del contratto
// demo più vecchio (Viale Monza 140).
const VERSIONI = [{
    id: 'parametri-1',
    tipo: 'parametri',
    numero: 1,
    validoDal: '2024-01-01',
    valori: {
        'P1.finestra': PARAMETRI.giorniFinestraCopertura,
        'P1.sollecito1': 1,
        'P1.sollecito2': 3,
        'P1.chiusura': PARAMETRI.giornoChiusuraMese,
        'P1.franchigia': P.P1.franchigiaMesi,
        'P1E.finestra': PARAMETRI.giorniFinestraCopertura,
        'P1E.sollecito1': 1,
        'P1E.sollecito2': 3,
        'P1E.chiusura': PARAMETRI.giornoChiusuraMese,
        'P1E.franchigia': P.P1E.franchigiaMesi,
        'P2.franchigia': P.P2.franchigiaMesi,
        'P5.finestra': PARAMETRI.giorniFinestraCopertura,
        'P5.sollecito1': 1,
        'P5.sollecito2': 3,
        'P5.chiusura': PARAMETRI.giornoChiusuraMese,
    },
}];

const versioneInVigore = (versioni, data) =>
    versioni
        .filter(v => v.validoDal <= data)
        .sort((a, b) => b.validoDal.localeCompare(a.validoDal) || b.numero - a.numero)[0] || null;

// I tempi di un prodotto: i suoi, o per un prodotto aggiunto dall'admin quelli
// del prodotto che gli somiglia (modelloDelCiclo).
const modelloPer = (codice) => {
    if (PRODOTTI_CICLO.includes(codice)) return codice;
    const p = PRODOTTI[codice];
    return p?.cliente === 'proprietario' ? modelloDelCiclo(p) : null;
};

// L'ultimo giorno utile del mese chiude la finestra: con la garanzia è anche
// l'ultimo giorno per tenere la copertura; con CRIA Segnalazione fissa solo il
// terzo sollecito, come per tutti (P-11, O-09).
const parametriDelProdotto = (valori, codice) => {
    const p = PRODOTTI[codice];
    const modello = modelloPer(codice);
    if (!p || !modello) return null;
    const segnala = p.incassa === 'proprietario';
    const finestra = segnala ? valori[`${modello}.finestra`] : null;
    return {
        segnala,
        garanzia: Boolean(p.garanzia),
        scadenza: GIORNO_SCADENZA,
        finestra,
        solleciti: segnala ? [valori[`${modello}.sollecito1`], valori[`${modello}.sollecito2`]] : [],
        chiusura: segnala ? valori[`${modello}.chiusura`] : null,
        // La franchigia di un prodotto nuovo è la sua, scelta quando è nato.
        franchigia: p.garanzia ? (modello === codice ? valori[`${codice}.franchigia`] : p.franchigiaMesi) : null,
        ultimoGiornoUtile: segnala ? GIORNO_SCADENZA + finestra : null,
    };
};

// Il contratto di servizio si firma all'attivazione: nei dati demo c'è il mese.
const firmaDelContratto = (c) => `${c.attivoDal}-01`;

// I tempi congelati su un contratto: quelli della versione in vigore alla firma.
export const parametriDelContratto = (c, versioni) => {
    const v = versioneInVigore(versioni, firmaDelContratto(c));
    return v ? { versione: v.numero, ...parametriDelProdotto(v.valori, c.prodotto) } : null;
};

// Le versioni dei parametri: oggi una sola, che non cambia.
export const useVersioniParametri = () => VERSIONI;
export const versioniParametri = () => VERSIONI;
