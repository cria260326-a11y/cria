// ═════════════════════════════════════════════════════════════════════════════
// CATALOGO PRODOTTI E PARAMETRI — SOLO PER I MOCKUP
// In piattaforma prezzi e parametri li decide l'admin dal pannello prodotti
// (decisione del 14 settembre 2026) e arrivano dal database. Qui c'è il listino
// del documento di stato (§1.1 e §9.2) in un posto solo: vetrina e aree lo
// leggono da qui, così un prezzo o un termine non può cambiare da una pagina
// all'altra.
// ═════════════════════════════════════════════════════════════════════════════

export const PRODOTTI = {
    P1: {
        codice: 'P1',
        nome: 'CRIA Gestione',
        variante: 'nuovo contratto',
        perChi: 'proprietario',
        percentuale: 8,
        quotaAppAnnua: 47,
        garanzia: true,
        franchigiaMesi: 1,
        incassa: 'proprietario',
        sintesi: 'Incassi tu il canone e ogni mese segnali se è arrivato. Se l’inquilino non paga, interviene la garanzia.',
    },
    P1E: {
        codice: 'P1E',
        nome: 'CRIA Gestione',
        variante: 'contratto esistente',
        perChi: 'proprietario',
        percentuale: 7,
        quotaAppAnnua: 47,
        garanzia: true,
        franchigiaMesi: 3,
        incassa: 'proprietario',
        sintesi: 'Per un contratto già in corso: incassi tu, segnali ogni mese, e la garanzia parte dopo una franchigia di 3 mesi.',
    },
    P2: {
        codice: 'P2',
        nome: 'CRIA Completo',
        perChi: 'proprietario',
        percentuale: 9,
        quotaAppAnnua: 0,
        garanzia: true,
        franchigiaMesi: 1,
        incassa: 'cria',
        sintesi: 'Incassa CRIA dall’inquilino e ti bonifica il canone. Non devi segnalare nulla. Se l’inquilino non paga, interviene la garanzia.',
    },
    P5: {
        codice: 'P5',
        nome: 'CRIA Segnalazione',
        perChi: 'proprietario',
        prezzoAnnuo: 47,
        garanzia: false,
        incassa: 'proprietario',
        sintesi: 'Segnali i pagamenti e costruisci lo storico dell’inquilino. Senza garanzia.',
    },
    P3: {
        codice: 'P3',
        nome: 'CRIA Verifica',
        perChi: 'chi sta per affittare',
        prezzo: 47,
        oreEsito: 48,
        scalabileEntroGiorni: 30,
        sintesi: 'Un’interrogazione sul candidato: semaforo e sintesi, oppure «non abbiamo informazioni».',
    },
    P6: {
        codice: 'P6',
        nome: 'CRIA Agenzie',
        perChi: 'agenzia immobiliare',
        prezzoMensile: null,
        sintesi: 'Abbonamento per interrogare il database mentre selezioni i candidati dei tuoi annunci.',
    },
    P7: {
        codice: 'P7',
        nome: 'Certificato su autocandidatura',
        perChi: 'inquilino senza storico CRIA',
        prezzo: 47,
        sintesi: 'Porti tu la documentazione, CRIA la istruisce e il certificato dichiara da dove viene il dato.',
    },
};

// I prodotti che un proprietario può mettere su un contratto.
export const PRODOTTI_PROPRIETARIO = ['P1', 'P1E', 'P2', 'P5'];

export const PARAMETRI = {
    giornoScadenzaCanone: 1,
    giorniFinestraCopertura: 5,      // segnalazione del mancato pagamento: copertura attiva
    giornoChiusuraMese: 11,          // dopo, il mese si marca non rilevato
    giorniContestazione: 7,          // l'inquilino può contestare entro 7 giorni
    giorniRispostaContestazione: 5,  // CRIA risponde entro 5 giorni
    mesiValiditaCertificato: 6,
    // Quota di iscrizione, pagata all'avvio della pratica (flusso 4.2). L'importo è
    // l'ipotesi del documento di stato §1.1: in piattaforma la decide l'admin.
    quotaIscrizione: 47,
    // La riassicurazione vale il 42% della commissione (§9.2): è la quota di
    // premio ceduta per i contratti con garanzia. Una fonte sola per garanzia,
    // contabilità e indicatori.
    quotaRiassicurazione: 42,
    solleciti: ['il giorno dopo la scadenza', 'il terzo giorno', 'la mattina dell’ultimo giorno utile'],
};

export const nomeProdotto = (codice) => {
    const p = PRODOTTI[codice];
    if (!p) return codice;
    return p.variante ? `${p.nome} · ${p.variante}` : p.nome;
};

export const fmtEuro = (n, decimali = 0) =>
    `${Number(n).toLocaleString('it-IT', { minimumFractionDigits: decimali, maximumFractionDigits: decimali })} €`;

export const prezzoProdotto = (codice) => {
    const p = PRODOTTI[codice];
    if (!p) return '';
    if (p.percentuale != null) {
        return p.quotaAppAnnua
            ? `${p.percentuale}% del canone + ${fmtEuro(p.quotaAppAnnua)}/anno`
            : `${p.percentuale}% del canone, app inclusa`;
    }
    if (p.prezzoAnnuo != null) return `${fmtEuro(p.prezzoAnnuo)}/anno`;
    if (p.prezzoMensile != null) return `${fmtEuro(p.prezzoMensile)} al mese`;
    if (codice === 'P3') return `${fmtEuro(p.prezzo)} a interrogazione`;
    if (codice === 'P6') return 'Abbonamento mensile · prezzo in definizione';
    if (p.prezzo != null) return fmtEuro(p.prezzo);
    return '';
};

export const COLORE_PRODOTTO = {
    P1: 'bg-blue-100 text-blue-800',
    P1E: 'bg-sky-100 text-sky-800',
    P2: 'bg-purple-100 text-purple-800',
    P5: 'bg-slate-100 text-slate-700',
};

// Il prezzo di un prodotto su un contratto, calcolato dal listino e dal canone
// dichiarato. Nessun preventivo: lo stesso calcolo lo rifà il checkout, e al
// pagamento il risultato si congela sulla pratica. I prodotti aggiunti
// dall'admin possono avere anche un prezzo al mese (si paga l'anno, come gli
// altri) o una tantum: quello si paga una volta sola e non è «l'anno».
export const calcolaPrezzo = (codice, canone) => {
    const p = PRODOTTI[codice];
    const voci = [];
    if (p.percentuale != null) {
        const mensile = Math.round(canone * p.percentuale) / 100;
        voci.push({
            etichetta: `Commissione ${p.percentuale}% del canone`,
            nota: p.incassa === 'cria' ? 'Trattenuta da CRIA sul canone che incassa' : `${fmtEuro(mensile, 2)} al mese`,
            annuo: Math.round(mensile * 12 * 100) / 100,
            trattenuta: p.incassa === 'cria',
        });
    }
    if (p.quotaAppAnnua) voci.push({ etichetta: 'App CRIA', nota: 'Quota annuale', annuo: p.quotaAppAnnua, trattenuta: false });
    if (p.prezzoAnnuo != null) voci.push({ etichetta: nomeProdotto(codice), nota: 'Quota annuale', annuo: p.prezzoAnnuo, trattenuta: false });
    if (p.cliente === 'proprietario' && p.prezzoMensile != null) {
        voci.push({ etichetta: nomeProdotto(codice), nota: `${fmtEuro(p.prezzoMensile, 2)} al mese`, annuo: Math.round(p.prezzoMensile * 12 * 100) / 100, trattenuta: false });
    }
    if (p.cliente === 'proprietario' && p.prezzo != null) {
        voci.push({ etichetta: nomeProdotto(codice), nota: 'Si paga una volta sola', annuo: p.prezzo, trattenuta: false, unaVolta: true });
    }
    const annuo = voci.reduce((t, v) => t + v.annuo, 0);
    const daPagare = voci.filter(v => !v.trattenuta).reduce((t, v) => t + v.annuo, 0);
    return {
        voci,
        annuo: Math.round(annuo * 100) / 100,
        daPagare: Math.round(daPagare * 100) / 100,
        // Con una voce una tantum il totale non è «annuo».
        unaVolta: voci.some(v => v.unaVolta),
    };
};
