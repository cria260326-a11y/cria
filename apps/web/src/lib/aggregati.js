import { OGGI, indirizzoCompleto } from '@/data/datiDemo';
import { MOROSITA } from '@/data/pratiche';
import { PRODOTTI, PRODOTTI_PROPRIETARIO, PARAMETRI, calcolaPrezzo } from '@/data/catalogo';
import { statoCredito } from '@/data/verifiche';
import { trovaPersonaDemo } from '@/data/personeDemo';
import { nomeOperatore } from '@/data/operatori';
import {
    ALIQUOTE_PROVVIGIONE, CLIENTI_CON_REFERENTE, CODICI_REFERENTE, COMPOSIZIONE_PIANO, QUOTA_RIASSICURAZIONE,
} from '@/data/direzione';
import { MESI_SEMAFORO } from '@/lib/semaforo';
import { aggiungiGiorniSolari, giorniSolariTra } from '@/lib/calendario';
import { nomeVisualizzato } from '@/lib/aree';
import { contrattiAttuali, trovaContrattoAttuale } from '@/lib/contrattiFonte';

// ═════════════════════════════════════════════════════════════════════════════
// AGGREGATI — vendite (O-25) e contabilità (O-27)
// Tutto si calcola dai dati condivisi: contratti e mesi, pratiche, verifiche,
// autocandidature, morosità. Prezzi e parametri
// vengono dal catalogo, mai scritti qui. Le funzioni sono pure: le pagine
// passano quello che leggono dagli hook, così il browser e i dati di base
// raccontano la stessa storia.
// Fase 4: viste sul database (v_kpi_admin e simili, §6.10).
// ═════════════════════════════════════════════════════════════════════════════

// ─── Numeri e mesi ────────────────────────────────────────────────────────────
export const arrotonda = (n, decimali = 2) => Math.round(n * 10 ** decimali) / 10 ** decimali;

const somma = (lista, campo) => arrotonda(lista.reduce((t, x) => t + (typeof campo === 'function' ? campo(x) : x[campo] || 0), 0));

// null quando non c'è niente da dividere: «nessun dato» non è «zero per cento».
export const quota = (parte, totale) => (totale ? parte / totale : null);

export const fmtPercentuale = (x, decimali = 0) => (x == null
    ? '—'
    : `${(x * 100).toLocaleString('it-IT', { minimumFractionDigits: decimali, maximumFractionDigits: decimali })}%`);

export const fmtGiorni = (n) => (n == null ? '—' : `${String(arrotonda(n, 1)).replace('.', ',')} ${n === 1 ? 'giorno' : 'giorni'}`);

const spostaMese = (mese, n) => {
    const [a, m] = mese.split('-').map(Number);
    const tot = a * 12 + (m - 1) + n;
    return `${Math.floor(tot / 12)}-${String((tot % 12) + 1).padStart(2, '0')}`;
};

export const MESE_OGGI = OGGI.slice(0, 7);

// Gli ultimi 12 mesi per i fatti datati al giorno: la stessa finestra degli
// indicatori di istruttoria e garanzia.
export const DODICI_MESI_FA = aggiungiGiorniSolari(OGGI, -365);

// I mesi della finestra, dal più vecchio: con OGGI = 2026-09-15, da 2025-10 a 2026-09.
export const ultimiMesi = (n = MESI_SEMAFORO, fino = MESE_OGGI) =>
    Array.from({ length: n }, (_, i) => spostaMese(fino, i - n + 1));

// '2026-01-15' + 12 → '2027-01-15'; se il giorno non esiste, l'ultimo del mese.
export const aggiungiMesi = (iso, n) => {
    const mese = spostaMese(iso.slice(0, 7), n);
    const [a, m] = mese.split('-').map(Number);
    const ultimo = new Date(Date.UTC(a, m, 0)).getUTCDate();
    return `${mese}-${String(Math.min(Number(iso.slice(8, 10)), ultimo)).padStart(2, '0')}`;
};

const nel = (mese) => (iso) => !!iso && iso.slice(0, 7) === mese;

// ─── Listino ──────────────────────────────────────────────────────────────────
export const valoreAnnuo = (codice, canone) => calcolaPrezzo(codice, canone).annuo;

export const commissioneMensile = (codice, canone) => {
    const p = PRODOTTI[codice];
    return p?.percentuale != null ? arrotonda((canone * p.percentuale) / 100) : 0;
};

const nomePersona = (id) => nomeVisualizzato(trovaPersonaDemo(id)) || '—';

// ─── Portafoglio ──────────────────────────────────────────────────────────────
// I contratti attivi: quelli dei dati condivisi più le pratiche arrivate alla
// firma nel browser, che da lì sono contratti anche loro (senza mesi, per ora).
export const portafoglio = (pratiche = []) => [
    ...contrattiAttuali().map(c => ({
        id: c.id,
        origine: 'contratto',
        prodotto: c.prodotto,
        canone: c.canone,
        clienteId: c.locatore.personaId,
        cliente: c.locatore.nome,
        immobile: indirizzoCompleto(c),
        dal: `${c.attivoDal}-01`,
        mesi: c.mesi,
    })),
    ...pratiche.filter(p => p.stato === 'attiva').map(p => ({
        id: p.id,
        origine: 'pratica',
        prodotto: p.prodotto,
        canone: p.canone,
        clienteId: p.personaId,
        cliente: nomePersona(p.personaId),
        immobile: `${p.immobile.indirizzo}, ${p.immobile.citta}`,
        dal: p.firma?.firmataIl || OGGI,
        codiceReferente: p.referente || null,
        mesi: [],
    })),
];

export const praticheInCorso = (pratiche = []) => pratiche.filter(p => p.stato !== 'attiva');

// Quanto pesa ogni prodotto del proprietario nel portafoglio, accanto al piano (§1.1).
export const composizionePortafoglio = (voci) => PRODOTTI_PROPRIETARIO.map(codice => {
    const n = voci.filter(v => v.prodotto === codice).length;
    return { codice, n, quota: quota(n, voci.length), piano: COMPOSIZIONE_PIANO[codice] / 100 };
});

// Commissioni sul totale dei canoni. Il P5 entra con zero, come nel piano (7,3%).
export const commissioneMediaPonderata = (voci) => quota(
    voci.reduce((t, v) => t + commissioneMensile(v.prodotto, v.canone), 0),
    voci.reduce((t, v) => t + v.canone, 0),
);

// ─── Canale: chi ha portato il cliente (§9.6) ─────────────────────────────────
const normalizzaCodice = (codice) => String(codice || '').trim().toUpperCase();

// Il commerciale di un codice: una persona della rete, o un collega interno che
// lo era quando ha portato il cliente.
const conNome = (c) => ({ ...c, nome: c.personaId ? nomePersona(c.personaId) : nomeOperatore(c.operatoreId) });

export const commercialeDelCodice = (codice) => {
    const c = CODICI_REFERENTE.find(x => x.codice === normalizzaCodice(codice));
    return c ? conNome(c) : null;
};

// Vince il codice legato al cliente, che è permanente; il codice scritto su una
// pratica conta solo per chi non ne ha uno. Se ne arrivano due diversi, il
// documento non ha ancora deciso chi vince (§9.6).
export const canaleDi = (clienteId, codicePratica = null) => {
    const legato = clienteId ? CLIENTI_CON_REFERENTE.find(r => r.personaId === clienteId) : null;
    const codice = legato?.codice || codicePratica;
    if (!codice) return { tipo: 'diretto', chiave: 'diretto' };
    const ref = commercialeDelCodice(codice);
    if (!ref) return { tipo: 'sconosciuto', chiave: `codice:${normalizzaCodice(codice)}`, codice: normalizzaCodice(codice) };
    return { tipo: 'referente', chiave: ref.codice, codice: ref.codice, commerciale: ref.nome, chiusoIl: ref.attivoFinoAl };
};

// ─── Vendite (O-25) ───────────────────────────────────────────────────────────
// Una vendita per fatto: l'attivazione di un contratto, la quota di iscrizione e
// il prezzo pagato su una pratica, una CRIA Verifica, un'autocandidatura.
//   valore      dal listino: il primo anno per gli abbonamenti, il prezzo per il resto
//   incassato   quello che è entrato con la vendita; col P2 la commissione si
//               trattiene mese per mese, quindi all'attivazione non entra niente
//   conta       false per un prezzo non ancora pagato: è in arrivo, non venduto
// La provvigione matura con la vendita. Non si calcola se il codice era già
// chiuso (se spetti lo stesso, il documento non lo dice) o se il prodotto non ha
// un'aliquota.
const provvigioneDi = (v) => {
    if (v.canale.tipo !== 'referente' || !v.conta || !v.prodotto) return null;
    if (v.canale.chiusoIl && v.data > v.canale.chiusoIl) return { aliquota: null, importo: null, motivo: 'codice_chiuso' };
    const aliquota = ALIQUOTE_PROVVIGIONE[v.prodotto];
    if (aliquota == null) return { aliquota: null, importo: null, motivo: 'senza_aliquota' };
    return { aliquota, importo: arrotonda((v.valore * aliquota) / 100), motivo: null };
};

export const elencoVendite = ({ pratiche = [], verifiche = [], autocandidature = [] }) => {
    const out = [];

    contrattiAttuali().forEach(c => {
        out.push({
            id: `att-${c.id}`, tipo: 'attivazione', data: `${c.attivoDal}-01`, prodotto: c.prodotto,
            clienteId: c.locatore.personaId, cliente: c.locatore.nome, immobile: indirizzoCompleto(c),
            valore: valoreAnnuo(c.prodotto, c.canone),
            incassato: calcolaPrezzo(c.prodotto, c.canone).daPagare,
            stato: 'attivo', conta: true,
        });
    });

    pratiche.forEach(p => {
        const base = {
            clienteId: p.personaId, cliente: nomePersona(p.personaId),
            immobile: `${p.immobile.indirizzo}, ${p.immobile.citta}`, codicePratica: p.referente || null,
        };
        out.push({
            ...base, id: `quota-${p.id}`, tipo: 'quota', data: p.quotaPagataIl || p.apertaIl, prodotto: null, perProdotto: p.prodotto,
            valore: PARAMETRI.quotaIscrizione, incassato: PARAMETRI.quotaIscrizione, stato: 'pagata', conta: true,
        });
        const prezzo = calcolaPrezzo(p.prodotto, p.canone);
        if (p.pagamento?.pagataIl) {
            out.push({
                ...base, id: `prezzo-${p.id}`, tipo: 'prodotto', data: p.pagamento.pagataIl, prodotto: p.prodotto,
                valore: prezzo.annuo, incassato: p.pagamento.importo ?? prezzo.daPagare,
                stato: p.stato === 'attiva' ? 'attivo' : 'da_firmare', conta: true,
            });
        } else if (p.stato === 'pagamento') {
            out.push({
                ...base, id: `prezzo-${p.id}`, tipo: 'prodotto', data: p.istruttoria?.conclusaIl || p.apertaIl, prodotto: p.prodotto,
                valore: prezzo.annuo, incassato: 0, stato: 'da_pagare', conta: false,
            });
        }
    });

    verifiche.forEach(v => {
        out.push({
            id: `ver-${v.id}`, tipo: 'verifica', data: v.richiestaIl, prodotto: 'P3',
            clienteId: v.personaId, cliente: nomePersona(v.personaId), immobile: null,
            valore: PRODOTTI.P3.prezzo, incassato: PRODOTTI.P3.prezzo,
            stato: `credito_${statoCredito(v)}`, scadeIl: v.credito.scadeIl, usatoIl: v.credito.usatoIl, conta: true,
        });
    });

    autocandidature.filter(a => a.pagamento?.pagataIl).forEach(a => {
        out.push({
            id: `auto-${a.id}`, tipo: 'autocandidatura', data: a.pagamento.pagataIl, prodotto: 'P7',
            clienteId: a.personaId, cliente: nomePersona(a.personaId), immobile: null,
            valore: a.pagamento.importo, incassato: a.pagamento.importo, stato: `auto_${a.stato}`, conta: true,
        });
    });

    return out
        .map(v => {
            const canale = canaleDi(v.clienteId, v.codicePratica);
            const conCanale = { ...v, canale };
            return { ...conCanale, provvigione: provvigioneDi(conCanale) };
        })
        .sort((a, b) => b.data.localeCompare(a.data) || a.id.localeCompare(b.id));
};

// Abbonamenti sul contratto: quanti sono attivi, quanti in arrivo, e il loro valore annuo.
export const abbonamentiPerProdotto = (voci, inCorso) => PRODOTTI_PROPRIETARIO.map(codice => {
    const attivi = voci.filter(v => v.prodotto === codice);
    const arrivo = inCorso.filter(p => p.prodotto === codice);
    return {
        codice,
        attivi: attivi.length,
        valoreAnnuo: somma(attivi, v => valoreAnnuo(codice, v.canone)),
        inCorso: arrivo.length,
        valoreAtteso: somma(arrivo, p => valoreAnnuo(codice, p.canone)),
    };
});

// Le vendite una tantum di un periodo: quote di iscrizione, CRIA Verifica, autocandidature.
export const unaTantum = (vendite, dal) => {
    const nelPeriodo = vendite.filter(v => v.conta && v.data >= dal);
    const riga = (filtro) => {
        const lista = nelPeriodo.filter(filtro);
        return { n: lista.length, incassato: somma(lista, 'incassato') };
    };
    return {
        quota: riga(v => v.tipo === 'quota'),
        P3: riga(v => v.tipo === 'verifica'),
        P7: riga(v => v.tipo === 'autocandidatura'),
    };
};

// Per canale: i commerciali col loro codice, più le vendite dirette.
export const perCanale = (vendite, voci) => {
    const righe = [
        ...CODICI_REFERENTE.map(conNome).map(c => ({ chiave: c.codice, tipo: 'referente', codice: c.codice, commerciale: c.nome, chiusoIl: c.attivoFinoAl })),
        { chiave: 'diretto', tipo: 'diretto' },
    ];
    vendite.forEach(v => {
        if (!righe.some(r => r.chiave === v.canale.chiave)) righe.push({ chiave: v.canale.chiave, tipo: v.canale.tipo, codice: v.canale.codice });
    });
    return righe.map(r => {
        const sue = vendite.filter(v => v.conta && v.canale.chiave === r.chiave);
        const contratti = voci.filter(v => canaleDi(v.clienteId, v.codiceReferente).chiave === r.chiave);
        const conProvvigione = sue.filter(v => v.provvigione);
        return {
            ...r,
            clienti: new Set(sue.map(v => v.clienteId || v.cliente)).size,
            contratti: contratti.length,
            valoreAnnuo: somma(contratti, v => valoreAnnuo(v.prodotto, v.canone)),
            vendite: sue.length,
            provvigioni: somma(conProvvigione.filter(v => v.provvigione.importo != null), v => v.provvigione.importo),
            senzaAliquota: conProvvigione.filter(v => v.provvigione.motivo === 'senza_aliquota').length,
            dopoLaChiusura: conProvvigione.filter(v => v.provvigione.motivo === 'codice_chiuso').length,
        };
    });
};

// ─── Contabilità (O-27) ───────────────────────────────────────────────────────
// Ricavi di competenza di un mese: le commissioni per ogni mese di contratto
// attivo, le quote annuali divise in dodicesimi, e nel mese in cui si pagano le
// quote di iscrizione, CRIA Verifica e le autocandidature. Un prezzo pagato su
// una pratica non ancora firmata non è ricavo: è un anticipo.
export const VOCI_RICAVO = [
    { chiave: 'commissione-P1', prodotto: 'P1', etichetta: 'Commissioni sui canoni', nota: 'pagate dal proprietario' },
    { chiave: 'commissione-P1E', prodotto: 'P1E', etichetta: 'Commissioni sui canoni', nota: 'pagate dal proprietario' },
    { chiave: 'commissione-P2', prodotto: 'P2', etichetta: 'Commissioni sui canoni', nota: 'trattenute sul canone che CRIA incassa' },
    { chiave: 'app', prodotti: ['P1', 'P1E'], etichetta: 'Quota annuale dell’app', nota: 'un dodicesimo al mese' },
    { chiave: 'P5', prodotto: 'P5', etichetta: 'Quota annuale', nota: 'un dodicesimo al mese' },
    { chiave: 'quota', etichetta: 'Quote di iscrizione', nota: 'una per pratica, all’avvio' },
    { chiave: 'P3', prodotto: 'P3', etichetta: 'Interrogazioni', nota: 'nel mese della richiesta' },
    { chiave: 'P7', prodotto: 'P7', etichetta: 'Autocandidature', nota: 'nel mese del pagamento' },
];

const attiviNelMese = (mese, pratiche) => portafoglio(pratiche).filter(v => (v.origine === 'contratto'
    ? v.mesi.some(m => m.mese === mese)
    : v.dal.slice(0, 7) <= mese));

export const ricaviDelMese = (mese, { pratiche = [], verifiche = [], autocandidature = [] }) => {
    const attivi = attiviNelMese(mese, pratiche);
    const conti = Object.fromEntries(VOCI_RICAVO.map(v => [v.chiave, { n: 0, importo: 0 }]));
    const aggiungi = (chiave, importo) => {
        conti[chiave].n += 1;
        conti[chiave].importo += importo;
    };

    attivi.forEach(v => {
        const p = PRODOTTI[v.prodotto];
        if (p.percentuale != null) aggiungi(`commissione-${v.prodotto}`, commissioneMensile(v.prodotto, v.canone));
        if (p.quotaAppAnnua) aggiungi('app', p.quotaAppAnnua / 12);
        if (p.prezzoAnnuo != null) aggiungi('P5', p.prezzoAnnuo / 12);
    });
    pratiche.filter(p => nel(mese)(p.quotaPagataIl)).forEach(() => aggiungi('quota', PARAMETRI.quotaIscrizione));
    verifiche.filter(v => nel(mese)(v.richiestaIl)).forEach(() => aggiungi('P3', PRODOTTI.P3.prezzo));
    autocandidature.filter(a => nel(mese)(a.pagamento?.pagataIl)).forEach(a => aggiungi('P7', a.pagamento.importo));

    const voci = VOCI_RICAVO.map(v => ({ ...v, n: conti[v.chiave].n, importo: arrotonda(conti[v.chiave].importo) }));
    return { voci, totale: somma(voci, 'importo') };
};

// Il premio ceduto al riassicuratore: una quota delle commissioni dei prodotti con garanzia (§9.2).
export const premioCeduto = (voci) => {
    const base = somma(voci.filter(v => v.chiave.startsWith('commissione-') && PRODOTTI[v.prodotto].garanzia), 'importo');
    return { base, quota: QUOTA_RIASSICURAZIONE, importo: arrotonda((base * QUOTA_RIASSICURAZIONE) / 100) };
};

export const provvigioniDelMese = (mese, vendite) => {
    const lista = vendite.filter(v => nel(mese)(v.data) && v.provvigione);
    return {
        importo: somma(lista.filter(v => v.provvigione.importo != null), v => v.provvigione.importo),
        n: lista.filter(v => v.provvigione.importo != null).length,
        senzaAliquota: lista.filter(v => v.provvigione.importo == null).length,
    };
};

// La garanzia: indennizzi riconosciuti ai proprietari (il credito verso
// l'inquilino passa a CRIA) e recuperi incassati con le rate. L'indennizzo di un
// mese vale il canone di quel mese.
const indennizziDi = (m) => (m.indennizzo?.riconosciutoIl
    ? [{
        morositaId: m.id, contrattoId: m.contrattoId, mese: m.indennizzo.mese,
        il: m.indennizzo.riconosciutoIl, importo: trovaContrattoAttuale(m.contrattoId)?.canone || 0,
    }]
    : []);

const recuperiDi = (m) => (m.piano?.rate || [])
    .filter(r => r.pagataIl)
    .map(r => ({ morositaId: m.id, contrattoId: m.contrattoId, numero: r.n, il: r.pagataIl, importo: r.importo }));

export const garanziaDelMese = (mese, oggi = OGGI) => {
    const indennizzi = MOROSITA.flatMap(indennizziDi);
    const recuperi = MOROSITA.flatMap(recuperiDi);
    const fine = mese === oggi.slice(0, 7) ? oggi : `${mese}-31`;
    const finoA = (lista) => somma(lista.filter(x => x.il <= fine), 'importo');
    return {
        indennizzi: indennizzi.filter(x => nel(mese)(x.il)),
        recuperi: recuperi.filter(x => nel(mese)(x.il)),
        creditoCeduto: finoA(indennizzi),
        recuperato: finoA(recuperi),
        daRecuperare: arrotonda(finoA(indennizzi) - finoA(recuperi)),
        pratiche: MOROSITA.map(m => {
            const suoiInd = indennizzi.filter(x => x.morositaId === m.id && x.il <= fine);
            const suoiRec = recuperi.filter(x => x.morositaId === m.id && x.il <= fine);
            const rate = m.piano?.rate || [];
            return {
                id: m.id, contrattoId: m.contrattoId, immobile: indirizzoCompleto(trovaContrattoAttuale(m.contrattoId)),
                ceduto: somma(suoiInd, 'importo'), recuperato: somma(suoiRec, 'importo'),
                prossimaRata: rate.find(r => !(r.pagataIl && r.pagataIl <= fine)) || null,
            };
        }).filter(p => p.ceduto > 0),
    };
};

// I canoni che CRIA incassa col P2 non sono ricavi: sono dei proprietari. Si
// incassa il canone, si trattiene la commissione, si gira il resto.
export const canoniContoTerzi = (mese, oggi = OGGI) => contrattiAttuali()
    .filter(c => PRODOTTI[c.prodotto].incassa === 'cria')
    .map(c => {
        const m = c.mesi.find(x => x.mese === mese);
        const base = { contrattoId: c.id, immobile: indirizzoCompleto(c), proprietario: c.locatore.nome };
        if (!m?.pagatoIl || m.pagatoIl > oggi) return { ...base, incassato: 0, commissione: 0, netto: 0, girato: 0, daGirare: 0, incassatoIl: null, giratoIl: null };
        const commissione = commissioneMensile(c.prodotto, c.canone);
        const netto = arrotonda(c.canone - commissione);
        const girato = !!m.bonificoIl && m.bonificoIl <= oggi;
        return {
            ...base, incassatoIl: m.pagatoIl, giratoIl: girato ? m.bonificoIl : null,
            incassato: c.canone, commissione, netto, girato: girato ? netto : 0, daGirare: girato ? 0 : netto,
        };
    });

// I 47 € di CRIA Verifica si scalano dal primo acquisto entro 30 giorni: finché
// il credito è aperto, è uno sconto che il cliente può ancora chiedere (§9.7).
export const creditiVerifica = (verifiche, oggi = OGGI) => {
    const conStato = verifiche.map(v => ({ ...v, statoCredito: statoCredito(v, oggi) }));
    const gruppo = (stato) => {
        const lista = conStato.filter(v => v.statoCredito === stato);
        return { n: lista.length, importo: somma(lista, v => v.credito.importo) };
    };
    return {
        disponibili: gruppo('disponibile'),
        usati: gruppo('usato'),
        scaduti: gruppo('scaduto'),
        aperti: conStato
            .filter(v => v.statoCredito === 'disponibile')
            .map(v => ({ id: v.id, clienteId: v.personaId, cliente: nomePersona(v.personaId), richiestaIl: v.richiestaIl, scadeIl: v.credito.scadeIl, importo: v.credito.importo, giorni: giorniSolariTra(oggi, v.credito.scadeIl) }))
            .sort((a, b) => a.scadeIl.localeCompare(b.scadeIl)),
    };
};

// Prezzi pagati su pratiche non ancora firmate: diventano ricavi dall'attivazione.
export const anticipiSuPratiche = (pratiche) => pratiche
    .filter(p => p.pagamento?.pagataIl && p.stato !== 'attiva')
    .map(p => ({
        id: p.id, prodotto: p.prodotto, cliente: nomePersona(p.personaId), immobile: `${p.immobile.indirizzo}, ${p.immobile.citta}`,
        pagataIl: p.pagamento.pagataIl, importo: p.pagamento.importo ?? calcolaPrezzo(p.prodotto, p.canone).daPagare,
    }))
    .filter(a => a.importo > 0);

// ─── I numeri dell'azienda (O-01) ─────────────────────────────────────────────
// Come va CRIA in un mese, con gli stessi conti della Contabilità (O-27):
//   fatturato  i ricavi di competenza del mese (commissioni, quote, prodotti)
//   entrate    i soldi entrati davvero: canoni incassati col P2 — che sono dei
//              proprietari e si girano —, prodotti pagati, rate dei piani
//   uscite     canoni girati ai proprietari, indennizzi, provvigioni e premio
// Non è l'utile: personale e spese non stanno nei dati di prova.
export const numeriAzienda = ({ mese = MESE_OGGI, pratiche = [], verifiche = [], autocandidature = [] } = {}) => {
    const ricavi = ricaviDelMese(mese, { pratiche, verifiche, autocandidature });
    const premio = premioCeduto(ricavi.voci);
    const vendite = elencoVendite({ pratiche, verifiche, autocandidature });
    const provvigioni = provvigioniDelMese(mese, vendite);
    const garanzia = garanziaDelMese(mese);
    const contoTerzi = canoniContoTerzi(mese);

    const entrate = {
        canoni: somma(contoTerzi, 'incassato'),
        prodotti: somma(vendite.filter(v => v.conta && nel(mese)(v.data)), 'incassato'),
        recuperi: somma(garanzia.recuperi, 'importo'),
    };
    const uscite = {
        girati: somma(contoTerzi, 'girato'),
        indennizzi: somma(garanzia.indennizzi, 'importo'),
        provvigioni: provvigioni.importo,
        premio: premio.importo,
    };
    const totale = (x) => arrotonda(Object.values(x).reduce((t, n) => t + n, 0));
    return {
        mese,
        fatturato: ricavi.totale,
        entrate: { ...entrate, totale: totale(entrate) },
        uscite: { ...uscite, totale: totale(uscite) },
    };
};
