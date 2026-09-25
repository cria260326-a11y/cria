// ═════════════════════════════════════════════════════════════════════════════
// CRIA VERIFICA (P3) — SOLO PER I MOCKUP
// L'interrogazione su un candidato inquilino, chiesta da chi sta per affittare
// (schermate E-03, E-04, E-05). L'esito arriva entro le ore del prodotto e si
// legge solo in piattaforma: il semaforo con una breve sintesi, oppure «Non
// abbiamo informazioni in merito». Niente mesi, niente importi, niente altri
// contratti, niente PDF.
// Quello che si paga diventa un credito: si scala dal primo prodotto acquistato
// con lo stesso account entro i giorni del prodotto, un'interrogazione per
// acquisto. Prezzo, ore e giorni vengono dal catalogo.
// Fase 4: tabella verifiche.
// ═════════════════════════════════════════════════════════════════════════════

import { PRODOTTI, fmtEuro } from '@/data/catalogo';
import { OGGI } from '@/data/datiDemo';
import { MESI_SEMAFORO } from '@/lib/semaforo';
import { aggiungiGiorni, fmtData, giorniTra } from '@/lib/formato';

const P3 = PRODOTTI.P3;

export const NESSUNA_INFORMAZIONE = 'Non abbiamo informazioni in merito';

// Il credito nasce con il pagamento: vale quanto si è pagato e si può scalare
// fino a scalabileEntroGiorni dalla richiesta.
export const nuovoCredito = (richiestaIl) => ({
    importo: P3.prezzo,
    scadeIl: aggiungiGiorni(richiestaIl, P3.scalabileEntroGiorni),
    usatoIl: null,
});

// esito: null finché la verifica è in corso, poi uno dei due
//   { tipo: 'semaforo', il, semaforo: una chiave di SEMAFORO, sintesi }
//   { tipo: 'nessuna_informazione', il }
export const VERIFICHE = [
    {
        id: 'ver-elena-2026-09-10',
        personaId: 'elena',
        richiestaIl: '2026-09-10',
        soggetto: { nome: 'Luca', cognome: 'Bianchi', dataNascita: '1990-03-11', luogoNascita: 'Napoli', codiceFiscale: 'BNCLCU90C11F839Z' },
        stato: 'conclusa',
        esito: {
            tipo: 'semaforo',
            il: '2026-09-11',
            semaforo: 'verde',
            sintesi: `Storico rilevato da CRIA su ${MESI_SEMAFORO} mesi: paga in media il giorno 3, nessun mese non pagato.`,
        },
        credito: nuovoCredito('2026-09-10'),
    },
    {
        id: 'ver-elena-2026-08-20',
        personaId: 'elena',
        richiestaIl: '2026-08-20',
        soggetto: { nome: 'Francesca', cognome: 'Serra', dataNascita: '1994-05-19', luogoNascita: 'Salerno', codiceFiscale: 'SRRFNC94E59H703Z' },
        stato: 'conclusa',
        esito: { tipo: 'nessuna_informazione', il: '2026-08-21' },
        credito: nuovoCredito('2026-08-20'),
    },
    {
        id: 'ver-elena-2026-09-14',
        personaId: 'elena',
        richiestaIl: '2026-09-14',
        soggetto: { nome: 'Andrea', cognome: 'Marino', dataNascita: '1988-02-06', luogoNascita: 'Caserta', codiceFiscale: 'MRNNDR88B06B963N' },
        stato: 'in_corso',
        esito: null,
        credito: nuovoCredito('2026-09-14'),
    },
];

export const verificheDi = (personaId) => VERIFICHE.filter(v => v.personaId === personaId);

export const STATO_VERIFICA = {
    in_corso: { etichetta: 'In corso', classe: 'bg-blue-50 text-blue-800' },
    conclusa: { etichetta: 'Concluso', classe: 'bg-slate-100 text-slate-700' },
};

// Il giorno entro cui arriva l'esito: le ore del prodotto, arrotondate al giorno.
export const esitoEntro = (v) => aggiungiGiorni(v.richiestaIl, Math.ceil(P3.oreEsito / 24));

// 'Luca', 'Bianchi' → 'Luca B.': nell'area il candidato si riconosce da nome,
// iniziale, codice fiscale mascherato e data della richiesta.
export const nomeCandidato = (soggetto) => {
    const nome = String(soggetto?.nome || '').trim();
    const cognome = String(soggetto?.cognome || '').trim();
    return cognome ? `${nome} ${cognome[0].toUpperCase()}.` : nome;
};

// ─── Credito ──────────────────────────────────────────────────────────────────
// 'disponibile' fino al giorno di scadenza compreso, poi 'scaduto'; 'usato'
// quando un acquisto con lo stesso account l'ha scalato.
export const statoCredito = (v, oggi = OGGI) => {
    if (v.credito.usatoIl) return 'usato';
    return oggi > v.credito.scadeIl ? 'scaduto' : 'disponibile';
};

export const giorniAllaScadenza = (v, oggi = OGGI) => giorniTra(oggi, v.credito.scadeIl);

export const testoCredito = (v, oggi = OGGI) => {
    const { importo, scadeIl, usatoIl } = v.credito;
    switch (statoCredito(v, oggi)) {
        case 'usato':
            return `Credito di ${fmtEuro(importo)} usato il ${fmtData(usatoIl)}`;
        case 'scaduto':
            return `Credito di ${fmtEuro(importo)} scaduto: valeva fino al ${fmtData(scadeIl)}`;
        default: {
            const giorni = giorniAllaScadenza(v, oggi);
            const resto = giorni === 0 ? 'scade oggi' : `ancora ${giorni} ${giorni === 1 ? 'giorno' : 'giorni'}`;
            return `Credito di ${fmtEuro(importo)} fino al ${fmtData(scadeIl)} · ${resto}`;
        }
    }
};
