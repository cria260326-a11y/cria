import { useMemo } from 'react';
import { OGGI } from '@/data/datiDemo';
import { FAQ_INIZIALI, CATEGORIE_INIZIALI } from '@/data/faqData';
import { PRODOTTI, PARAMETRI, fmtEuro, prezzoProdotto } from '@/data/catalogo';
import { trovaOperatore } from '@/data/operatori';
import { creaStoreDemo, nuovoIdDemo } from '@/lib/storeDemo';
import { creaDocumentoSito } from '@/lib/documentoSito';
import { MODO_DEMO } from '@/lib/supabase';

// ═════════════════════════════════════════════════════════════════════════════
// FAQ — UNA FONTE SOLA (O-29 e V-05)
// L'editor admin scrive qui e la pagina pubblica /supporto legge da qui: non ci
// sono più due copie. Il contenuto di partenza è data/faqData.js, in sola
// lettura; lo store tiene solo quello che cambia — FAQ e categorie nuove,
// modifiche, eliminazioni — e il registro di chi ha fatto cosa. Così una FAQ mai
// toccata continua a leggere prezzi e giorni dal catalogo.
// In piattaforma le modifiche stanno nel database (documenti_sito, chiave 'faq':
// db/schema/10_contenuti_sito.sql), così le vede chiunque apra il sito; nei
// mockup locali (modo demo) restano nel browser.
// ═════════════════════════════════════════════════════════════════════════════

const vuoto = () => ({
    faqNuove: [], faqModifiche: {}, faqEliminate: [],
    categorieNuove: [], categorieModifiche: {}, categorieEliminate: [],
    registro: [],
});

const store = MODO_DEMO ? creaStoreDemo('criaFaqDemo', vuoto) : creaDocumentoSito('faq', vuoto);

export const ripristinaFaqDemo = () => store.ripristina();

// ─── Su quali pagine ──────────────────────────────────────────────────────────
// Tutte le FAQ attive stanno in /supporto. Queste pagine della vetrina hanno un
// loro blocco di domande: ci compaiono quelle che hanno la pagina in `pagine`.
export const PAGINE_FAQ = [
    { id: 'per-inquilini', nome: 'Per inquilini', percorso: '/per-inquilini' },
    { id: 'verifica', nome: 'Verifica un inquilino', percorso: '/verifica' },
];

// ─── Segnaposto ───────────────────────────────────────────────────────────────
// Un numero del listino scritto a mano non cambia quando cambia il listino. In
// una risposta si scrive {prezzo_P3} e la pagina mette il prezzo in vigore.
export const SEGNAPOSTO = [
    { chiave: 'quota_iscrizione', etichetta: 'Quota di iscrizione', valore: () => fmtEuro(PARAMETRI.quotaIscrizione) },
    { chiave: 'prezzo_P1', etichetta: `Prezzo ${PRODOTTI.P1.nome}, nuovo contratto`, valore: () => prezzoProdotto('P1') },
    { chiave: 'prezzo_P1E', etichetta: `Prezzo ${PRODOTTI.P1E.nome}, contratto esistente`, valore: () => prezzoProdotto('P1E') },
    { chiave: 'prezzo_P2', etichetta: `Prezzo ${PRODOTTI.P2.nome}`, valore: () => prezzoProdotto('P2') },
    { chiave: 'prezzo_P5', etichetta: `Prezzo ${PRODOTTI.P5.nome}`, valore: () => prezzoProdotto('P5') },
    { chiave: 'prezzo_P3', etichetta: `Prezzo ${PRODOTTI.P3.nome}`, valore: () => prezzoProdotto('P3') },
    { chiave: 'prezzo_P7', etichetta: `Prezzo ${PRODOTTI.P7.nome}`, valore: () => prezzoProdotto('P7') },
    { chiave: 'giorni_finestra', etichetta: 'Giorni della finestra di copertura', valore: () => String(PARAMETRI.giorniFinestraCopertura) },
    { chiave: 'giorno_chiusura', etichetta: 'Giorno di chiusura del mese', valore: () => String(PARAMETRI.giornoChiusuraMese) },
    { chiave: 'giorni_contestazione', etichetta: 'Giorni per contestare', valore: () => String(PARAMETRI.giorniContestazione) },
    { chiave: 'giorni_risposta', etichetta: 'Giorni per la decisione di CRIA', valore: () => String(PARAMETRI.giorniRispostaContestazione) },
    { chiave: 'ore_esito', etichetta: `Ore per l’esito di ${PRODOTTI.P3.nome}`, valore: () => String(PRODOTTI.P3.oreEsito) },
];

const MAPPA_SEGNAPOSTO = Object.fromEntries(SEGNAPOSTO.map(s => [s.chiave, s.valore]));

export const risolviSegnaposto = (testo) =>
    String(testo || '').replace(/\{([a-zA-Z0-9_]+)\}/g, (intero, chiave) => (MAPPA_SEGNAPOSTO[chiave] ? MAPPA_SEGNAPOSTO[chiave]() : intero));

// Un segnaposto scritto male resta fra graffe: l'editor lo segnala.
export const segnapostoSconosciuti = (testo) =>
    [...String(testo || '').matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map(m => m[1]).filter(k => !MAPPA_SEGNAPOSTO[k]);

// ─── Lettura ──────────────────────────────────────────────────────────────────
const stessoId = (a, b) => String(a) === String(b);
const perOrdine = (a, b) => a.ordine - b.ordine;

const unisci = (s) => {
    const categorie = [...CATEGORIE_INIZIALI, ...s.categorieNuove]
        .filter(c => !s.categorieEliminate.some(id => stessoId(id, c.id)))
        .map(c => ({ ...c, ...(s.categorieModifiche[c.id] || {}), iniziale: CATEGORIE_INIZIALI.includes(c) }))
        .sort(perOrdine);
    const faq = [...FAQ_INIZIALI, ...s.faqNuove]
        .filter(f => !s.faqEliminate.some(id => stessoId(id, f.id)))
        .map(f => ({ ...f, ...(s.faqModifiche[f.id] || {}), iniziale: FAQ_INIZIALI.includes(f) }))
        .sort(perOrdine);
    return { categorie, faq, registro: s.registro };
};

const leggiStato = () => ({ ...vuoto(), ...store.leggi() });

export const useFaqAdmin = () => {
    const s = store.useStore({ admin: true });
    return useMemo(() => unisci({ ...vuoto(), ...s }), [s]);
};

// La vetrina: solo categorie e domande attive, nel loro ordine, con i
// segnaposto sostituiti dai valori del listino.
export const useFaqPubbliche = () => {
    const s = store.useStore();
    const { categorie, faq } = useMemo(() => unisci({ ...vuoto(), ...s }), [s]);
    return useMemo(() => {
        const attive = categorie.filter(c => c.attiva);
        return {
            categorie: attive,
            faq: attive.flatMap(c => faq
                .filter(f => f.attiva && stessoId(f.categoriaId, c.id))
                .map(f => ({ ...f, risposta: risolviSegnaposto(f.risposta) }))),
        };
    }, [categorie, faq]);
};

// ─── Scrittura ────────────────────────────────────────────────────────────────
// Le FAQ le scrive l'admin (decisione del titolare: «le domande del sito le
// imposta l'admin»); gli altri le leggono. Ogni modifica lascia una riga nel
// registro: chi, quando, cosa. Il database ha la stessa regola.
export const puoScrivereFaq = (operatore) => operatore?.funzione === 'admin';

const puo = (operatoreId) => puoScrivereFaq(trovaOperatore(operatoreId));

const scrivi = (operatoreId, cambia) => {
    if (!puo(operatoreId)) return false;
    store.scrivi(cambia(leggiStato()));
    return true;
};

const conRegistro = (s, operatoreId, voce) => ({
    ...s,
    registro: [{ id: nuovoIdDemo('reg'), da: operatoreId, il: oggi(), ...voce }, ...s.registro].slice(0, 50),
});

// Nei mockup vale la data della demo; in piattaforma quella vera.
const oggi = () => (MODO_DEMO ? OGGI : new Date().toISOString().slice(0, 10));

const firma = (operatoreId) => ({ modificataDa: operatoreId, modificataIl: oggi() });

const modificaFaqIn = (s, id, dati) => ({ ...s, faqModifiche: { ...s.faqModifiche, [id]: { ...(s.faqModifiche[id] || {}), ...dati } } });
const modificaCategoriaIn = (s, id, dati) => ({ ...s, categorieModifiche: { ...s.categorieModifiche, [id]: { ...(s.categorieModifiche[id] || {}), ...dati } } });

const breve = (testo) => (testo.length > 60 ? `${testo.slice(0, 57)}…` : testo);

export const creaFaq = ({ categoriaId, domanda, risposta, pagine = [] }, operatoreId) => scrivi(operatoreId, (s) => {
    const { faq } = unisci(s);
    const ordine = Math.max(0, ...faq.filter(f => stessoId(f.categoriaId, categoriaId)).map(f => f.ordine)) + 1;
    const nuova = { id: nuovoIdDemo('faq'), categoriaId, domanda: domanda.trim(), risposta: risposta.trim(), pagine, ordine, attiva: true, ...firma(operatoreId) };
    return conRegistro({ ...s, faqNuove: [...s.faqNuove, nuova] }, operatoreId, { azione: 'FAQ aggiunta', oggetto: breve(nuova.domanda) });
});

// Se cambia categoria, la domanda va in fondo alla nuova.
export const modificaFaq = (faq, dati, operatoreId) => scrivi(operatoreId, (s) => {
    const cambiaCategoria = dati.categoriaId != null && !stessoId(dati.categoriaId, faq.categoriaId);
    const ordine = cambiaCategoria
        ? { ordine: Math.max(0, ...unisci(s).faq.filter(f => stessoId(f.categoriaId, dati.categoriaId)).map(f => f.ordine)) + 1 }
        : {};
    return conRegistro(modificaFaqIn(s, faq.id, { ...dati, ...ordine, ...firma(operatoreId) }), operatoreId, { azione: 'FAQ modificata', oggetto: breve(dati.domanda || faq.domanda) });
});

export const mostraNascondiFaq = (faq, operatoreId) => scrivi(operatoreId, (s) =>
    conRegistro(modificaFaqIn(s, faq.id, { attiva: !faq.attiva, ...firma(operatoreId) }), operatoreId, { azione: faq.attiva ? 'FAQ nascosta' : 'FAQ di nuovo visibile', oggetto: breve(faq.domanda) }));

export const eliminaFaq = (faq, operatoreId) => scrivi(operatoreId, (s) =>
    conRegistro({ ...s, faqEliminate: [...s.faqEliminate, faq.id], faqNuove: s.faqNuove.filter(f => !stessoId(f.id, faq.id)) }, operatoreId, { azione: 'FAQ eliminata', oggetto: breve(faq.domanda) }));

// Scambia l'ordine con la domanda vicina della stessa categoria.
export const spostaFaq = (faq, verso, operatoreId) => scrivi(operatoreId, (s) => {
    const stesse = unisci(s).faq.filter(f => stessoId(f.categoriaId, faq.categoriaId));
    const i = stesse.findIndex(f => stessoId(f.id, faq.id));
    const altra = stesse[i + verso];
    if (!altra) return s;
    const scambiate = modificaFaqIn(modificaFaqIn(s, faq.id, { ordine: altra.ordine }), altra.id, { ordine: faq.ordine });
    return conRegistro(scambiate, operatoreId, { azione: 'Ordine delle FAQ cambiato', oggetto: breve(faq.domanda) });
});

export const creaCategoria = (nome, operatoreId) => scrivi(operatoreId, (s) => {
    const { categorie } = unisci(s);
    const nuova = { id: nuovoIdDemo('cat'), nome: nome.trim(), ordine: Math.max(0, ...categorie.map(c => c.ordine)) + 1, attiva: true, ...firma(operatoreId) };
    return conRegistro({ ...s, categorieNuove: [...s.categorieNuove, nuova] }, operatoreId, { azione: 'Categoria aggiunta', oggetto: nuova.nome });
});

export const rinominaCategoria = (categoria, nome, operatoreId) => scrivi(operatoreId, (s) =>
    conRegistro(modificaCategoriaIn(s, categoria.id, { nome: nome.trim(), ...firma(operatoreId) }), operatoreId, { azione: 'Categoria rinominata', oggetto: `${categoria.nome} → ${nome.trim()}` }));

export const mostraNascondiCategoria = (categoria, operatoreId) => scrivi(operatoreId, (s) =>
    conRegistro(modificaCategoriaIn(s, categoria.id, { attiva: !categoria.attiva, ...firma(operatoreId) }), operatoreId, { azione: categoria.attiva ? 'Categoria nascosta' : 'Categoria di nuovo visibile', oggetto: categoria.nome }));

// Una categoria si elimina solo vuota: le domande non restano senza posto.
export const eliminaCategoria = (categoria, operatoreId) => scrivi(operatoreId, (s) => {
    if (unisci(s).faq.some(f => stessoId(f.categoriaId, categoria.id))) return s;
    return conRegistro({
        ...s,
        categorieEliminate: [...s.categorieEliminate, categoria.id],
        categorieNuove: s.categorieNuove.filter(c => !stessoId(c.id, categoria.id)),
    }, operatoreId, { azione: 'Categoria eliminata', oggetto: categoria.nome });
});

export const spostaCategoria = (categoria, verso, operatoreId) => scrivi(operatoreId, (s) => {
    const { categorie } = unisci(s);
    const i = categorie.findIndex(c => stessoId(c.id, categoria.id));
    const altra = categorie[i + verso];
    if (!altra) return s;
    const scambiate = modificaCategoriaIn(modificaCategoriaIn(s, categoria.id, { ordine: altra.ordine }), altra.id, { ordine: categoria.ordine });
    return conRegistro(scambiate, operatoreId, { azione: 'Ordine delle categorie cambiato', oggetto: categoria.nome });
});
