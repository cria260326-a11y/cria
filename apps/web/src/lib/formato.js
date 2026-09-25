// Formati di date e mesi usati in tutte le aree.

const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const MESI_BREVI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

const parti = (iso) => iso.split('-').map(Number);

// '2026-09-04' → '04/09/2026'
export const fmtData = (iso) => {
    if (!iso) return '—';
    const [a, m, g] = parti(iso);
    return `${String(g).padStart(2, '0')}/${String(m).padStart(2, '0')}/${a}`;
};

// '2026-09-04' → '4 settembre 2026'
export const fmtDataLunga = (iso) => {
    if (!iso) return '—';
    const [a, m, g] = parti(iso);
    return `${g} ${MESI[m - 1]} ${a}`;
};

// Quando è stato scritto un messaggio, uguale in tutte le conversazioni:
// '2026-09-03 10:15' → '03/09/2026 10:15'. Quello appena scritto nella demo
// ('2026-09-15 ora', o 'adesso') dice «adesso»; una data già all'italiana
// ('03/09/2026 10:15') resta com'è.
export const fmtQuando = (valore) => {
    const v = String(valore || '');
    if (v === 'adesso' || / ora$/.test(v)) return 'adesso';
    const m = v.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
    if (m) return `${fmtData(m[1])} ${m[2]}`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return fmtData(v);
    return v;
};

// '2026-09' → 'Settembre 2026'
export const nomeMese = (mese) => {
    const [a, m] = parti(mese);
    const nome = MESI[m - 1];
    return `${nome[0].toUpperCase()}${nome.slice(1)} ${a}`;
};

// '2026-09' → 'Set 26'
export const meseBreve = (mese) => {
    const [a, m] = parti(mese);
    return `${MESI_BREVI[m - 1]} ${String(a).slice(2)}`;
};

export const giorniTra = (daIso, aIso) => {
    const [a1, m1, g1] = parti(daIso);
    const [a2, m2, g2] = parti(aIso);
    return Math.round((Date.UTC(a2, m2 - 1, g2) - Date.UTC(a1, m1 - 1, g1)) / 86400000);
};

export const aggiungiGiorni = (iso, n) => {
    const [a, m, g] = parti(iso);
    const d = new Date(Date.UTC(a, m - 1, g + n));
    return d.toISOString().slice(0, 10);
};

export const iniziali = (nome) => nome.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase();

// '2026-09' → '2026-10'
export const meseSuccessivo = (mese) => {
    const [a, m] = parti(mese);
    return m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, '0')}`;
};
