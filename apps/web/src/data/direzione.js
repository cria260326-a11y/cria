// ═════════════════════════════════════════════════════════════════════════════
// DIREZIONE, CONTI E PROFILO — SOLO PER I MOCKUP (lotto 5: O-25, O-27, O-32)
// Quello che il back office sa e i dati condivisi non dicono: chi ha portato un
// cliente, le aliquote delle provvigioni, i numeri del piano, l'utenza interna.
// Ogni record punta a id veri dei dati condivisi (persone, operatori,
// contratti, pratiche).
//
// Fase 4: tabelle codici_referente, prodotti (provvigione_commerciale),
// parametri, utenze.
// ═════════════════════════════════════════════════════════════════════════════

import { PARAMETRI } from '@/data/catalogo';

// ─── Codici referente (§9.6) ──────────────────────────────────────────────────
// Formato CRIA-XX-AAAA: iniziali del commerciale e anno del codice. Il codice di
// Ettore Marini è chiuso da quando è passato all'istruttoria, ad aprile 2026: i
// clienti che ha portato restano suoi, perché l'assegnazione è permanente.
// L'area commerciale mostra ancora i dati finti del lotto 7 (Roberto Bruno,
// CRIA-RB-2026): quando si allinea, il codice di Sara Esposito è questo.
export const CODICI_REFERENTE = [
    { codice: 'CRIA-SE-2025', personaId: 'sara', attivoDal: '2025-03-01', attivoFinoAl: null },
    { codice: 'CRIA-EM-2023', operatoreId: 'ettore', attivoDal: '2023-09-01', attivoFinoAl: '2026-03-31' },
];

// Il codice si lega al cliente alla registrazione, per sempre (§9.6): ogni
// vendita a quel cliente è del commerciale che l'ha portato. Le stesse
// acquisizioni che l'istruttoria usa per l'incompatibilità (data/istruttoria.js).
export const CLIENTI_CON_REFERENTE = [
    { personaId: 'mario', codice: 'CRIA-SE-2025', dal: '2025-09-12' },
    { personaId: 'verdi', codice: 'CRIA-EM-2023', dal: '2023-11-20' },
];

// ─── Provvigioni ──────────────────────────────────────────────────────────────
// Percentuale sul valore del primo anno, dal listino. Sono le aliquote che oggi
// Impostazioni (O-31) tiene nella pagina; nel modello dati sono la colonna
// provvigione_commerciale dei prodotti (§6.6). P1E, P5 e P7 non ne hanno una:
// finché qualcuno non la decide, su quelle vendite la provvigione non si calcola.
export const ALIQUOTE_PROVVIGIONE = { P1: 17, P2: 16, P3: 20 };

// ─── Il piano (§1.1) ──────────────────────────────────────────────────────────
// Quote di portafoglio del modello economico e la commissione media ponderata
// che ne discende (0,2 × 8 + 0,3 × 7 + 0,4 × 9 + 0,1 × 0).
export const COMPOSIZIONE_PIANO = { P1: 20, P1E: 30, P2: 40, P5: 10 };
export const COMMISSIONE_MEDIA_PIANO = 7.3;

// Il premio ceduto al riassicuratore vale il 42% della commissione (§9.2): il
// valore sta fra i parametri del catalogo, dove lo imposta chi tiene il listino.
export const QUOTA_RIASSICURAZIONE = PARAMETRI.quotaRiassicurazione;

// ─── Utenze interne (§13.4) ───────────────────────────────────────────────────
// Ogni utenza interna scade dopo 12 mesi e la riconferma il responsabile; quelle
// degli esterni durano da 3 a 6 mesi. Qui c'è l'account con cui si entra nei
// mockup: le utenze di tutti arrivano con la scheda collaboratore (G-02).
export const MESI_UTENZA_INTERNA = 12;

export const UTENZE_INTERNE = [
    { operatoreId: 'luca', attivaDal: '2026-01-15', creataDa: 'federica', riconfermataIl: null },
];

export const utenzaDi = (operatoreId) => UTENZE_INTERNE.find(u => u.operatoreId === operatoreId) || null;
