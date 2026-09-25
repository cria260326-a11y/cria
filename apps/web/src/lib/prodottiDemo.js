import { useMemo } from 'react';
import { OGGI } from '@/data/datiDemo';
import { PRODOTTI, PARAMETRI, COLORE_PRODOTTO, fmtEuro } from '@/data/catalogo';
import { creaStoreDemo } from '@/lib/storeDemo';
import { creaDocumentoSito } from '@/lib/documentoSito';
import { MODO_DEMO } from '@/lib/supabase';
import { verificaAzione } from '@/lib/separazione';

// ═════════════════════════════════════════════════════════════════════════════
// I PRODOTTI DI CRIA — O-21
// Il catalogo lo decide l'admin: prodotti nuovi, prezzi, e per ognuno dove il
// cliente fa il bonifico (intestatario, IBAN, banca, causale). Il catalogo di
// partenza è data/catalogo.js; lo store tiene solo quello che cambia —
// prodotti nuovi, modifiche, disattivazioni — e il registro di chi ha fatto
// cosa. Le modifiche si applicano al catalogo appena arrivano, così vetrina,
// aree e pagamenti leggono gli stessi nomi, gli stessi prezzi e gli stessi
// estremi del bonifico.
//
// Un prezzo nuovo vale per chi paga da quel momento: chi ha già pagato tiene
// il prezzo congelato sulla pratica (§14.4). Il tipo di prodotto, il cliente,
// la garanzia e chi incassa il canone si scelgono quando il prodotto nasce e
// poi non cambiano: su quelli poggiano contratti già firmati.
//
// In piattaforma lo store è il documento 'prodotti' di documenti_sito (lo legge
// anche chi non ha fatto l'accesso, senza il registro); nei mockup locali (modo
// demo) resta nel browser. Fase 4: una tabella dei prodotti.
// ═════════════════════════════════════════════════════════════════════════════

export const PERCORSO_PRODOTTI = '/dashboard/admin/prodotti';
export const PERCORSO_NUOVO_PRODOTTO = `${PERCORSO_PRODOTTI}/nuovo`;
export const percorsoProdotto = (codice) => `${PERCORSO_PRODOTTI}/${codice}`;

export const TIPI_PRODOTTO = [
    { id: 'percentuale_canone', etichetta: 'Percentuale del canone', descrizione: 'Una commissione sul canone, per tutta la durata del contratto' },
    { id: 'abbonamento_annuo', etichetta: 'Abbonamento annuo', descrizione: 'Un prezzo fisso all’anno' },
    { id: 'abbonamento_mensile', etichetta: 'Abbonamento mensile', descrizione: 'Un prezzo fisso al mese' },
    { id: 'una_tantum', etichetta: 'Una tantum', descrizione: 'Si paga una volta sola' },
];

// `perChi`: come lo dice la pagina Prodotti; `catalogo`: come lo scrive il catalogo.
export const CLIENTI = [
    { id: 'proprietario', etichetta: 'Proprietario', perChi: 'proprietari', catalogo: 'proprietario' },
    { id: 'inquilino', etichetta: 'Inquilino', perChi: 'inquilini', catalogo: 'inquilino' },
    { id: 'agenzia', etichetta: 'Agenzia immobiliare', perChi: 'agenzie immobiliari', catalogo: 'agenzia immobiliare' },
    { id: 'chiunque', etichetta: 'Chiunque stia per affittare', perChi: 'chi sta per affittare', catalogo: 'chi sta per affittare' },
];

export const INCASSO = [
    { id: 'proprietario', etichetta: 'Il proprietario', nota: 'L’inquilino paga il proprietario, che ogni mese segnala se il canone è arrivato' },
    { id: 'cria', etichetta: 'CRIA', nota: 'L’inquilino paga CRIA, che trattiene la commissione e bonifica il resto al proprietario' },
];

export const etichettaTipo = (id) => TIPI_PRODOTTO.find(t => t.id === id)?.etichetta || id;
export const perChi = (id) => CLIENTI.find(c => c.id === id)?.perChi || id;

// Il prezzo, a seconda del tipo. `facoltativo`: si può lasciare vuoto.
export const CAMPI_PREZZO = {
    percentuale_canone: [
        { chiave: 'percentuale', etichetta: 'Commissione', suffisso: '% del canone', tipo: 'percentuale' },
        { chiave: 'quotaAppAnnua', etichetta: 'App CRIA', suffisso: '€ l’anno', tipo: 'euro', facoltativo: true, nota: 'Vuoto se l’app è compresa nella commissione' },
    ],
    abbonamento_annuo: [{ chiave: 'prezzoAnnuo', etichetta: 'Prezzo', suffisso: '€ l’anno', tipo: 'euro' }],
    abbonamento_mensile: [{ chiave: 'prezzoMensile', etichetta: 'Prezzo', suffisso: '€ al mese', tipo: 'euro', facoltativo: true, nota: 'Vuoto se il prezzo è ancora da decidere' }],
    una_tantum: [{ chiave: 'prezzo', etichetta: 'Prezzo', suffisso: '€', tipo: 'euro' }],
};

// Un prodotto nuovo del proprietario non ha tempi del ciclo mensile suoi:
// finestra, solleciti e chiusura sono quelli del prodotto che gli somiglia,
// la franchigia è la sua.
export const modelloDelCiclo = ({ incassa, garanzia }) => (incassa === 'cria' ? 'P2' : garanzia ? 'P1' : 'P5');

// La quota di iscrizione non si sceglie come un prodotto, ma si paga come un
// prodotto: prezzo e bonifico stanno nello stesso posto.
export const CODICE_ISCRIZIONE = 'ISCRIZIONE';

// Il conto di CRIA. IBAN e banca veri non sono nei documenti: si inseriscono qui.
const CONTO_CRIA = { intestatario: 'CRIA Srl', iban: null, banca: null, bic: null, causale: null, istruzioni: '' };

// ─── Il catalogo di partenza ──────────────────────────────────────────────────
// Una copia di data/catalogo.js presa prima di ogni modifica: serve a tornare
// indietro quando una modifica sparisce (Ripristina, o un altro admin).
const ORIGINALI = JSON.parse(JSON.stringify(PRODOTTI));
const QUOTA_ORIGINALE = PARAMETRI.quotaIscrizione;

// Le causali sono quelle del documento di stato. Con CRIA Completo il canone ha
// come causale il codice del contratto: lì la causale del prodotto non serve.
const PARTENZA = [
    {
        codice: CODICE_ISCRIZIONE, quota: true, nome: 'Quota di iscrizione',
        sintesi: 'Si paga all’avvio di ogni pratica del proprietario, prima della verifica di CRIA. Il prezzo del prodotto si paga dopo.',
        tipo: 'una_tantum', cliente: 'proprietario', prezzo: QUOTA_ORIGINALE, causale: 'Quota di iscrizione CRIA',
    },
    { codice: 'P1', tipo: 'percentuale_canone', cliente: 'proprietario', causale: 'CRIA Gestione' },
    { codice: 'P1E', tipo: 'percentuale_canone', cliente: 'proprietario', causale: 'CRIA Gestione' },
    { codice: 'P2', tipo: 'percentuale_canone', cliente: 'proprietario', causale: null },
    { codice: 'P5', tipo: 'abbonamento_annuo', cliente: 'proprietario', causale: 'CRIA Segnalazione' },
    { codice: 'P3', tipo: 'una_tantum', cliente: 'chiunque', causale: 'CRIA Verifica Inquilino' },
    { codice: 'P7', tipo: 'una_tantum', cliente: 'inquilino', causale: 'Certificato su autocandidatura' },
    { codice: 'P6', tipo: 'abbonamento_mensile', cliente: 'agenzia', causale: 'CRIA Agenzie' },
].map(({ causale, ...p }) => {
    const c = ORIGINALI[p.codice] || {};
    return {
        nome: c.nome,
        variante: c.variante || '',
        sintesi: c.sintesi,
        percentuale: c.percentuale ?? null,
        quotaAppAnnua: c.quotaAppAnnua || null,   // 0 vuol dire app inclusa, come vuoto
        prezzoAnnuo: c.prezzoAnnuo ?? null,
        prezzoMensile: c.prezzoMensile ?? null,
        prezzo: c.prezzo ?? null,
        garanzia: Boolean(c.garanzia),
        franchigiaMesi: c.franchigiaMesi ?? null,
        incassa: c.incassa || null,
        ...p,
        attivo: true,
        bonifico: { ...CONTO_CRIA, causale },
    };
});

// ─── Store ────────────────────────────────────────────────────────────────────
const vuoto = () => ({ nuovi: [], modifiche: {}, registro: [] });

const store = MODO_DEMO ? creaStoreDemo('criaProdottiDemo', vuoto) : creaDocumentoSito('prodotti', vuoto);

export const ripristinaProdottiDemo = () => store.ripristina();

const unisci = (s) => {
    const modifiche = s.modifiche || {};
    const conModifiche = (p) => {
        const m = modifiche[p.codice];
        return m ? { ...p, ...m, bonifico: { ...p.bonifico, ...(m.bonifico || {}) } } : p;
    };
    return [
        ...PARTENZA.map(p => ({ ...conModifiche(p), iniziale: true })),
        ...(s.nuovi || []).map(p => ({ ...conModifiche(p), iniziale: false })),
    ];
};

// ─── Sul catalogo condiviso ───────────────────────────────────────────────────
// Vetrina, aree e checkout leggono PRODOTTI e PARAMETRI: ci si mettono sopra le
// modifiche dell'admin, ripartendo ogni volta dal catalogo di partenza.
const COLORI_ORIGINALI = { ...COLORE_PRODOTTO };

const applicaAlCatalogo = (elenco) => {
    Object.keys(PRODOTTI).forEach(k => { if (!ORIGINALI[k]) delete PRODOTTI[k]; });
    Object.keys(COLORE_PRODOTTO).forEach(k => { if (!COLORI_ORIGINALI[k]) delete COLORE_PRODOTTO[k]; });
    Object.entries(ORIGINALI).forEach(([k, v]) => {
        Object.keys(PRODOTTI[k]).forEach(campo => { delete PRODOTTI[k][campo]; });
        Object.assign(PRODOTTI[k], JSON.parse(JSON.stringify(v)));
    });
    PARAMETRI.quotaIscrizione = QUOTA_ORIGINALE;

    elenco.forEach(p => {
        if (p.quota) {
            PARAMETRI.quotaIscrizione = p.prezzo;
            return;
        }
        if (!PRODOTTI[p.codice]) {
            PRODOTTI[p.codice] = {
                codice: p.codice,
                perChi: CLIENTI.find(c => c.id === p.cliente)?.catalogo,
                garanzia: p.garanzia,
                franchigiaMesi: p.garanzia ? p.franchigiaMesi : undefined,
                incassa: p.incassa,
            };
            if (p.cliente === 'proprietario') COLORE_PRODOTTO[p.codice] = 'bg-teal-100 text-teal-800';
        }
        const voce = PRODOTTI[p.codice];
        voce.cliente = p.cliente;
        voce.nome = p.nome;
        voce.sintesi = p.sintesi;
        if (p.variante) voce.variante = p.variante;
        else delete voce.variante;
        CAMPI_PREZZO[p.tipo].forEach(c => { voce[c.chiave] = p[c.chiave] ?? null; });
        voce.attivo = p.attivo;
        voce.bonifico = p.bonifico;
    });
};

applicaAlCatalogo(unisci(store.leggi()));
store.segui(() => applicaAlCatalogo(unisci(store.leggi())));

// ─── Lettura ──────────────────────────────────────────────────────────────────
/** L'admin legge anche il registro; le altre pagine solo il catalogo. */
export const useProdotti = ({ admin = false } = {}) => {
    const s = store.useStore({ admin });
    return useMemo(() => {
        const tutti = unisci(s);
        return {
            tutti,
            attivi: tutti.filter(p => p.attivo),
            nonAttivi: tutti.filter(p => !p.attivo),
            // Quelli che il proprietario sceglie all'inizio dell'iscrizione e
            // paga dopo la verifica di CRIA.
            inVenditaAiProprietari: tutti.filter(p => p.attivo && p.cliente === 'proprietario' && !p.quota),
            registro: s.registro || [],
            trova: (codice) => tutti.find(p => p.codice === codice) || null,
        };
    }, [s]);
};

// Per chi deve solo ridisegnarsi quando il catalogo cambia (i testi del sito).
export const useCatalogoProdotti = () => store.useStore();

const perc = (v) => `${String(v).replace('.', ',')}%`;
const euro = (v) => fmtEuro(v, Number.isInteger(Number(v)) ? 0 : 2);

export const prezzoInBreve = (p) => {
    switch (p.tipo) {
        case 'percentuale_canone':
            return p.quotaAppAnnua ? `${perc(p.percentuale)} del canone + ${euro(p.quotaAppAnnua)}/anno` : `${perc(p.percentuale)} del canone, app inclusa`;
        case 'abbonamento_annuo': return `${euro(p.prezzoAnnuo)}/anno`;
        case 'abbonamento_mensile': return p.prezzoMensile == null ? 'Prezzo da decidere' : `${euro(p.prezzoMensile)} al mese`;
        default: return p.codice === 'P3' ? `${euro(p.prezzo)} a interrogazione` : euro(p.prezzo);
    }
};

export const nomeCompleto = (p) => (p.variante ? `${p.nome} · ${p.variante}` : p.nome);

// Con CRIA Completo l'inquilino paga il canone a CRIA: la causale è il codice
// del contratto, uno per contratto, e la riconciliazione lo cerca lì.
export const causaleDelContratto = (p) => p.incassa === 'cria';

// Il bonifico si può proporre solo quando ci sono intestatario e IBAN.
export const bonificoPronto = (p) => Boolean(p?.bonifico?.intestatario && p?.bonifico?.iban);

// La causale che il cliente scrive: quella del prodotto e il riferimento della
// pratica o della persona, così il bonifico si abbina da solo.
export const causaleCliente = (p, riferimento) => {
    if (causaleDelContratto(p)) return riferimento || '';
    return [p.bonifico?.causale, riferimento].filter(Boolean).join(' · ');
};

// ─── Controlli del modulo ─────────────────────────────────────────────────────
const IBAN_ITALIANO = /^IT\d{2}[A-Z]\d{10}[0-9A-Z]{12}$/;
const BIC = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

// Il controllo del codice dell'IBAN (mod 97): un errore di battitura manderebbe
// i soldi del cliente da un'altra parte.
const ibanTorna = (iban) => {
    const girato = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, ch => String(ch.charCodeAt(0) - 55));
    let resto = 0;
    for (const cifra of girato) resto = (resto * 10 + Number(cifra)) % 97;
    return resto === 1;
};

export const formattaIbanGruppi = (iban) => String(iban || '').replace(/\s/g, '').toUpperCase().replace(/(.{4})/g, '$1 ').trim();

const numero = (campo, grezzo) => {
    const testo = String(grezzo ?? '').trim();
    if (!testo) return campo.facoltativo ? { valore: null } : { errore: 'Serve un valore' };
    if (!/^\d{1,5}([.,]\d{1,2})?$/.test(testo)) return { errore: 'Un numero, al massimo con due decimali' };
    const n = Number(testo.replace(',', '.'));
    if (campo.tipo === 'percentuale' && (n <= 0 || n > 100)) return { errore: 'Fra 0 e 100' };
    if (n <= 0) return campo.facoltativo ? { valore: null } : { errore: 'Più di zero' };
    return { valore: n };
};

const testo = (grezzo, { massimo, obbligatorio }) => {
    const t = String(grezzo ?? '').trim();
    if (!t) return obbligatorio ? { errore: 'Serve un valore' } : { valore: '' };
    if (t.length > massimo) return { errore: `Al massimo ${massimo} caratteri` };
    return { valore: t };
};

/**
 * Dal modulo della pagina al prodotto da salvare.
 * @returns {{ prodotto: object, errori: Record<string, string> }}
 */
export const leggiModulo = (m) => {
    const errori = {};
    const prendi = (chiave, esito) => {
        if (esito.errore) errori[chiave] = esito.errore;
        return esito.valore ?? null;
    };

    if (!m.tipo) errori.tipo = 'Scegli il tipo di prodotto';
    if (!m.cliente) errori.cliente = 'Scegli a chi si vende';

    const prodotto = {
        tipo: m.tipo,
        cliente: m.cliente,
        nome: prendi('nome', testo(m.nome, { massimo: 60, obbligatorio: true })),
        variante: prendi('variante', testo(m.variante, { massimo: 40 })) || '',
        sintesi: prendi('sintesi', testo(m.sintesi, { massimo: 240, obbligatorio: true })),
        percentuale: null, quotaAppAnnua: null, prezzoAnnuo: null, prezzoMensile: null, prezzo: null,
    };
    (CAMPI_PREZZO[m.tipo] || []).forEach(c => { prodotto[c.chiave] = prendi(c.chiave, numero(c, m[c.chiave])); });

    // Garanzia e incasso contano solo per i prodotti del proprietario.
    const delProprietario = m.cliente === 'proprietario';
    prodotto.garanzia = delProprietario && m.garanzia === 'si';
    prodotto.franchigiaMesi = null;
    if (prodotto.garanzia) {
        const t = String(m.franchigiaMesi ?? '').trim();
        if (!/^\d{1,2}$/.test(t) || Number(t) > 12) errori.franchigiaMesi = 'Un numero di mesi, da 0 a 12';
        else prodotto.franchigiaMesi = Number(t);
    }
    prodotto.incassa = delProprietario ? (m.tipo === 'percentuale_canone' ? m.incassa || null : 'proprietario') : null;
    if (delProprietario && m.tipo === 'percentuale_canone' && !m.incassa) errori.incassa = 'Scegli chi incassa il canone';
    if (delProprietario && !m.garanzia) errori.garanzia = 'Scegli se c’è la garanzia';

    const ibanCompatto = String(m.iban || '').replace(/\s/g, '').toUpperCase();
    let iban = null;
    if (ibanCompatto) {
        if (!IBAN_ITALIANO.test(ibanCompatto)) errori.iban = 'Serve un IBAN italiano: IT, due cifre, una lettera e 23 caratteri';
        else if (!ibanTorna(ibanCompatto)) errori.iban = 'Questo IBAN non torna: controlla le cifre';
        else iban = formattaIbanGruppi(ibanCompatto);
    }
    const bicCompatto = String(m.bic || '').replace(/\s/g, '').toUpperCase();
    if (bicCompatto && !BIC.test(bicCompatto)) errori.bic = 'Il BIC ha 8 o 11 caratteri: 6 lettere e poi lettere o cifre';

    prodotto.bonifico = {
        intestatario: prendi('intestatario', testo(m.intestatario, { massimo: 70, obbligatorio: true })),
        iban,
        banca: prendi('banca', testo(m.banca, { massimo: 60 })) || null,
        bic: bicCompatto || null,
        causale: prodotto.incassa === 'cria' ? null : prendi('causale', testo(m.causale, { massimo: 60, obbligatorio: true })),
        istruzioni: prendi('istruzioni', testo(m.istruzioni, { massimo: 300 })) || '',
    };
    return { prodotto, errori };
};

// Il modulo pieno con un prodotto, per modificarlo.
const inCampo = (v) => (v == null ? '' : String(v).replace('.', ','));
export const moduloDa = (p) => ({
    tipo: p.tipo, cliente: p.cliente, nome: p.nome || '', variante: p.variante || '', sintesi: p.sintesi || '',
    percentuale: inCampo(p.percentuale), quotaAppAnnua: inCampo(p.quotaAppAnnua), prezzoAnnuo: inCampo(p.prezzoAnnuo),
    prezzoMensile: inCampo(p.prezzoMensile), prezzo: inCampo(p.prezzo),
    garanzia: p.cliente === 'proprietario' ? (p.garanzia ? 'si' : 'no') : '', incassa: p.incassa || '',
    franchigiaMesi: inCampo(p.franchigiaMesi),
    intestatario: p.bonifico?.intestatario || '', iban: p.bonifico?.iban || '', banca: p.bonifico?.banca || '',
    bic: p.bonifico?.bic || '', causale: p.bonifico?.causale || '', istruzioni: p.bonifico?.istruzioni || '',
});

export const MODULO_NUOVO = {
    ...moduloDa({ tipo: '', cliente: '', bonifico: { ...CONTO_CRIA } }),
    garanzia: '', incassa: '', franchigiaMesi: '1',
};

// ─── Azioni del responsabile prodotto ─────────────────────────────────────────
// Il controllo vero sta nell'interfaccia (AzioneSeparata); qui si ripete, così
// lo store non accetta quello che la pagina non avrebbe permesso.
const puoModificare = (operatoreId) => verificaAzione('modifica_listino', { operatoreId }).consentito;

const conNota = (s, voce) => [{ il: OGGI, ...voce }, ...(s.registro || [])].slice(0, 200);

// I codici nuovi partono da P8: il P4 è la consulenza, che aspetta una decisione.
const prossimoCodice = (tutti) => {
    let n = 8;
    while (tutti.some(p => p.codice === `P${n}`)) n += 1;
    return `P${n}`;
};

export const creaProdotto = (prodotto, operatoreId) => {
    if (!puoModificare(operatoreId)) return null;
    const s = store.leggi();
    const codice = prossimoCodice(unisci(s));
    store.scrivi({
        ...s,
        nuovi: [...(s.nuovi || []), { ...prodotto, codice, attivo: true }],
        registro: conNota(s, { da: operatoreId, codice, azione: 'creato' }),
    });
    return codice;
};

const CAMPI_MODIFICABILI = ['nome', 'variante', 'sintesi', 'percentuale', 'quotaAppAnnua', 'prezzoAnnuo', 'prezzoMensile', 'prezzo', 'bonifico'];

// Due valori uguali anche se le chiavi di un oggetto sono in un altro ordine.
const inChiaro = (v) => JSON.stringify(v && typeof v === 'object'
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, v[k] ?? null]))
    : v ?? null);

export const ETICHETTE_CAMPI = {
    nome: 'il nome', variante: 'la variante', sintesi: 'la descrizione', percentuale: 'la commissione', quotaAppAnnua: 'la quota dell’app',
    prezzoAnnuo: 'il prezzo', prezzoMensile: 'il prezzo', prezzo: 'il prezzo', bonifico: 'gli estremi del bonifico',
};

/** @returns {string[] | null} i campi cambiati; null se non si può */
export const salvaProdotto = (codice, prodotto, operatoreId) => {
    if (!puoModificare(operatoreId)) return null;
    const s = store.leggi();
    const prima = unisci(s).find(p => p.codice === codice);
    if (!prima) return null;
    const cambiati = CAMPI_MODIFICABILI.filter(k => inChiaro(prima[k]) !== inChiaro(prodotto[k]));
    if (!cambiati.length) return [];
    store.scrivi({
        ...s,
        modifiche: {
            ...(s.modifiche || {}),
            [codice]: { ...(s.modifiche?.[codice] || {}), ...Object.fromEntries(cambiati.map(k => [k, prodotto[k]])) },
        },
        registro: conNota(s, { da: operatoreId, codice, azione: 'modificato', campi: cambiati }),
    });
    return cambiati;
};

// Un prodotto non si cancella: si smette di venderlo. Chi l'ha già comprato lo tiene.
export const cambiaAttivo = (codice, attivo, operatoreId) => {
    if (!puoModificare(operatoreId) || codice === CODICE_ISCRIZIONE) return false;
    store.aggiorna(s => ({
        ...s,
        modifiche: { ...(s.modifiche || {}), [codice]: { ...(s.modifiche?.[codice] || {}), attivo } },
        registro: conNota(s, { da: operatoreId, codice, azione: attivo ? 'riattivato' : 'disattivato' }),
    }));
    return true;
};
