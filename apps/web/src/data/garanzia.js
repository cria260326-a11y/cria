// ═════════════════════════════════════════════════════════════════════════════
// GARANZIA E TESORERIA — DATI DEL SOLO BACK OFFICE, SOLO PER I MOCKUP (lotto 5)
// Quello che vede solo CRIA: il gestore titolare di ogni pratica di morosità,
// i contatti con data, ora, canale ed esito, le note interne, chi ha proposto e
// chi ha approvato il piano, chi ha disposto e chi ha autorizzato indennizzi e
// bonifici, i rendiconti al riassicuratore.
//
// Ogni record punta a id veri dei dati condivisi: contratti e mesi di
// datiDemo.js, MOROSITA di pratiche.js. Proprietario e inquilino vedono la
// stessa storia dalla loro area, senza queste parti.
//
// Fase 4: pratiche_morosita, assegnazioni, indennizzi, piani_rientro,
// rate_rientro, recuperi, riassicurazione_periodi, bonifici_uscita (§14.3).
// ═════════════════════════════════════════════════════════════════════════════

import { CONTRATTI } from '@/data/datiDemo';
import { PRODOTTI, PARAMETRI } from '@/data/catalogo';
import { aggiungiGiorniSolari } from '@/lib/calendario';
import { nomeMese } from '@/lib/formato';

// La riassicurazione vale il 42% della commissione (§9.2): il premio ceduto è
// quella quota delle commissioni dei contratti con garanzia, mese per mese. Il
// valore sta fra i parametri del catalogo (§9.2-bis); qui come frazione.
export const QUOTA_RIASSICURAZIONE = PARAMETRI.quotaRiassicurazione / 100;

// I termini della garanzia per il motore delle scadenze (§13.6): interni in
// giorni lavorativi, verso il cliente in giorni solari. Il documento non dà i
// numeri: sono proposte, da confermare.
export const TERMINI = {
    primo_contatto: { etichetta: 'Primo contatto con l’inquilino', giorni: 2, calendario: 'lavorativi', decorrenza: 'dall’apertura della pratica', funzione: 'gestore_pratica' },
    proposta_piano: { etichetta: 'Proposta del piano di rientro', giorni: 10, calendario: 'lavorativi', decorrenza: 'da quando l’inquilino lo chiede', funzione: 'gestore_pratica' },
    decisione_piano: { etichetta: 'Decisione sul piano proposto', giorni: 3, calendario: 'lavorativi', decorrenza: 'dalla proposta', funzione: 'resp_legale' },
    decisione_legale: { etichetta: 'Decisione sul passaggio al legale', giorni: 5, calendario: 'lavorativi', decorrenza: 'dalla richiesta', funzione: 'resp_legale' },
    disposizione_indennizzo: { etichetta: 'Istruttoria e disposizione dell’indennizzo', giorni: 10, calendario: 'lavorativi', decorrenza: 'dall’apertura della pratica', funzione: 'indennizzi' },
    autorizzazione: { etichetta: 'Autorizzazione del pagamento', giorni: 2, calendario: 'lavorativi', decorrenza: 'dalla disposizione', funzione: 'resp_amministrativo' },
    pagamento_indennizzo: { etichetta: 'Indennizzo accreditato al proprietario', giorni: 30, calendario: 'solari', decorrenza: 'dalla chiusura del mese', funzione: 'tesoreria' },
    canone_girato: { etichetta: 'Canone girato al proprietario', giorni: 2, calendario: 'solari', decorrenza: 'dall’incasso', funzione: 'tesoreria' },
    rendiconto: { etichetta: 'Rendiconto al riassicuratore', giorni: 90, calendario: 'solari', decorrenza: 'dalla fine del trimestre', funzione: 'resp_amministrativo' },
};

// Dopo quanti giorni dalla scadenza una rata non pagata conta come saltata.
export const GIORNI_TOLLERANZA_RATA = 5;

export const CANALI_CONTATTO = {
    telefono: 'Telefono',
    sms: 'SMS',
    email: 'Email',
    pec: 'PEC',
    raccomandata: 'Raccomandata',
};

// «Raggiunto» vuol dire che l'inquilino ha risposto: solo così un contatto
// ferma il contatore del primo contatto. I tentativi a vuoto restano in traccia.
export const ESITI_CONTATTO = {
    promessa_pagamento: { etichetta: 'Promette di pagare', raggiunto: true, classe: 'bg-green-100 text-green-800' },
    chiede_piano: { etichetta: 'Chiede un piano di rientro', raggiunto: true, classe: 'bg-blue-100 text-blue-800' },
    contesta: { etichetta: 'Contesta il debito', raggiunto: true, classe: 'bg-orange-100 text-orange-800' },
    raggiunto: { etichetta: 'Risponde, nessun impegno', raggiunto: true, classe: 'bg-slate-100 text-slate-700' },
    non_risponde: { etichetta: 'Non risponde', raggiunto: false, classe: 'bg-amber-100 text-amber-800' },
    consegnato: { etichetta: 'Messaggio consegnato', raggiunto: false, classe: 'bg-slate-100 text-slate-700' },
    recapito_errato: { etichetta: 'Recapito errato', raggiunto: false, classe: 'bg-red-100 text-red-800' },
};

export const MOTIVI_LEGALE = {
    rata_saltata: 'Una rata del piano non è arrivata',
    piano_respinto: 'Il piano di rientro è stato respinto',
    piano_rifiutato: 'L’inquilino rifiuta il piano',
    irreperibile: 'L’inquilino non si trova',
    contesta: 'Contesta il debito senza prove',
};

// L'avvocato esterno in convenzione: la persona demo 'paolo', con la sua area.
export const AVVOCATO_CONVENZIONATO = 'paolo';

// ─── Conti di accredito ───────────────────────────────────────────────────────
// Gli IBAN su cui CRIA bonifica. Numeri inventati (il codice banca non esiste);
// per intero li vedono solo tesoreria e responsabile amministrativa.
export const CONTI_ACCREDITO = {
    mario: { intestatario: 'Mario Rossi', iban: 'IT11K0123401600000000345671' },
    verdi: { intestatario: 'Immobiliare Verdi S.r.l.', iban: 'IT44P0123401633000000908812' },
};

// ─── Pratiche di morosità ─────────────────────────────────────────────────────
// La prima è MOROSITA di pratiche.js, quella che vedono proprietario e
// inquilina: qui ci sono solo le parti interne. Le altre cinque sono i mesi di
// Via Tortona 27 segnalati non pagati entro la finestra e pagati dopo la
// chiusura dell'11 (datiDemo.js): la pratica si è aperta il 12 e chiusa col
// pagamento, tra zero e quattro giorni dopo. Restano solo nel back office
// perché le aree di proprietario e inquilino elencano MOROSITA come pratiche
// in corso.
const contatto = (id, il, ora, canale, iniziativa, esito, nota = '') => ({ id, il, ora, canale, iniziativa, esito, nota, registratoDa: 'giorgio' });

export const PRATICHE_BACKOFFICE = [
    {
        id: 'mor-tortona27-2026-07',
        gestoreId: 'giorgio', assegnataIl: '2026-07-12', assegnazione: 'automatica',
        contatti: [
            contatto('ct-2607-1', '2026-07-13', '09:30', 'telefono', 'cria', 'non_risponde'),
            contatto('ct-2607-2', '2026-07-13', '09:34', 'sms', 'cria', 'consegnato', 'Avviso del canone di luglio non pagato, con il numero da richiamare.'),
            contatto('ct-2607-3', '2026-07-14', '17:40', 'telefono', 'cria', 'non_risponde'),
            contatto('ct-2607-4', '2026-07-15', '10:05', 'telefono', 'cria', 'chiede_piano', 'Conferma la difficoltà: da giugno lavora a orario ridotto. Chiede di pagare luglio a rate.'),
            contatto('ct-2607-5', '2026-07-15', '10:40', 'email', 'cria', 'consegnato', 'Riepilogo della telefonata e documenti sul reddito da mandare per valutare le rate.'),
            contatto('ct-2607-6', '2026-07-22', '11:15', 'email', 'inquilino', 'chiede_piano', 'Manda i documenti: può sostenere 350 € al mese oltre al canone.'),
            contatto('ct-2607-7', '2026-07-29', '16:20', 'email', 'cria', 'consegnato', 'Piano approvato: tre rate da 350 €, da accettare nell’area personale.'),
            contatto('ct-2607-8', '2026-08-17', '09:00', 'sms', 'cria', 'consegnato', 'Promemoria della rata 1, in scadenza il 20 agosto.'),
        ],
        note: [
            { id: 'nt-2607-1', il: '2026-07-22', autore: 'giorgio', testo: 'Documenti ricevuti: reddito ridotto da giugno. Tre rate da 350 € sono sostenibili insieme al canone.' },
            { id: 'nt-2607-2', il: '2026-07-29', autore: 'laura', testo: 'Piano approvato. Se salta una rata si valuta subito il passaggio al legale.' },
            { id: 'nt-2607-3', il: '2026-08-13', autore: 'giorgio', testo: 'Anche agosto arriva dopo la chiusura del mese (pratica a parte). Da seguire la rata del 20.' },
        ],
        // Il piano di MOROSITA, con chi l'ha proposto e chi l'ha approvato: le rate restano lì.
        piano: {
            id: 'piano-tortona27-2026-07',
            propostoDa: 'giorgio', propostoIl: '2026-07-27',
            nota: 'Tre rate mensili da 350 €, il 20 di ogni mese. Reddito ridotto da giugno: la rata regge insieme al canone.',
            approvatoDa: 'laura', approvatoIl: '2026-07-29',
            accettatoIl: '2026-08-02',
        },
    },
    {
        id: 'mor-tortona27-2025-11', contrattoId: 'c-tortona27', mesi: ['2025-11'],
        apertaIl: '2025-11-12', chiusaIl: '2025-11-12', esito: 'pagato',
        gestoreId: 'giorgio', assegnataIl: '2025-11-12', assegnazione: 'automatica',
        contatti: [
            contatto('ct-2511-1', '2025-11-12', '09:35', 'telefono', 'cria', 'promessa_pagamento', 'Dice di aver disposto il bonifico ieri sera: arriva in giornata.'),
        ],
        note: [],
    },
    {
        id: 'mor-tortona27-2026-02', contrattoId: 'c-tortona27', mesi: ['2026-02'],
        apertaIl: '2026-02-12', chiusaIl: '2026-02-13', esito: 'pagato',
        gestoreId: 'giorgio', assegnataIl: '2026-02-12', assegnazione: 'automatica',
        contatti: [
            contatto('ct-2602-1', '2026-02-12', '09:40', 'telefono', 'cria', 'non_risponde'),
            contatto('ct-2602-2', '2026-02-12', '09:42', 'sms', 'cria', 'consegnato', 'Avviso del canone di febbraio non pagato, con il numero da richiamare.'),
            contatto('ct-2602-3', '2026-02-13', '09:10', 'telefono', 'inquilino', 'promessa_pagamento', 'Richiama lei: lo stipendio è arrivato in ritardo, paga oggi.'),
        ],
        note: [],
    },
    {
        id: 'mor-tortona27-2026-04', contrattoId: 'c-tortona27', mesi: ['2026-04'],
        apertaIl: '2026-04-12', chiusaIl: '2026-04-12', esito: 'pagato',
        gestoreId: 'giorgio', assegnataIl: '2026-04-12', assegnazione: 'automatica',
        contatti: [],
        note: [
            { id: 'nt-2604-1', il: '2026-04-13', autore: 'giorgio', testo: 'Pagato domenica 12, prima di qualsiasi contatto: niente da fare.' },
        ],
    },
    {
        id: 'mor-tortona27-2026-06', contrattoId: 'c-tortona27', mesi: ['2026-06'],
        apertaIl: '2026-06-12', chiusaIl: '2026-06-14', esito: 'pagato',
        gestoreId: 'giorgio', assegnataIl: '2026-06-12', assegnazione: 'automatica',
        contatti: [
            contatto('ct-2606-1', '2026-06-12', '10:20', 'telefono', 'cria', 'promessa_pagamento', 'Paga entro domenica.'),
        ],
        note: [],
    },
    {
        id: 'mor-tortona27-2026-08', contrattoId: 'c-tortona27', mesi: ['2026-08'],
        apertaIl: '2026-08-12', chiusaIl: '2026-08-15', esito: 'pagato',
        gestoreId: 'giorgio', assegnataIl: '2026-08-12', assegnazione: 'automatica',
        contatti: [
            contatto('ct-2608-1', '2026-08-12', '09:45', 'telefono', 'cria', 'non_risponde'),
            contatto('ct-2608-2', '2026-08-12', '09:47', 'sms', 'cria', 'consegnato', 'Avviso del canone di agosto non pagato.'),
            contatto('ct-2608-3', '2026-08-13', '10:30', 'telefono', 'cria', 'promessa_pagamento', 'Paga sabato con lo stipendio. Ricordata anche la rata del piano, in scadenza il 20.'),
        ],
        note: [],
    },
];

// ─── Indennizzi ───────────────────────────────────────────────────────────────
// Luglio a Via Tortona 27: segnalato il 4, dentro la finestra, fuori franchigia.
// Il 20 luglio l'indennizzo è riconosciuto (MOROSITA): qui chi l'ha disposto,
// chi l'ha autorizzato e il bonifico che l'ha pagato.
export const INDENNIZZI = [
    {
        id: 'ind-tortona27-2026-07',
        praticaId: 'mor-tortona27-2026-07', contrattoId: 'c-tortona27', mese: '2026-07', importo: 1050,
        dispostoDa: 'beatrice', dispostoIl: '2026-07-20',
        notaIstruttoria: 'Segnalato il 4 luglio, dentro la finestra, e fuori franchigia: coperto. Il credito verso l’inquilina passa a CRIA.',
        autorizzatoDa: 'silvia', autorizzatoIl: '2026-07-21',
        eseguitoDa: 'alberto', eseguitoIl: '2026-07-22', riferimento: 'CRIA20260722001',
    },
];

// ─── Canoni girati ai proprietari (CRIA Completo) ─────────────────────────────
// CRIA incassa, trattiene la commissione e gira il resto: il bonifico parte due
// giorni dopo l'incasso (bonificoIl in datiDemo.js). Disposto dalla tesoreria il
// giorno dell'incasso, autorizzato il giorno dopo dalla responsabile amministrativa.
const compatta = (iso) => iso.replace(/-/g, '');

export const CANONI_GIRATI = CONTRATTI
    .filter(c => PRODOTTI[c.prodotto].incassa === 'cria')
    .flatMap(c => {
        const commissione = Math.round(c.canone * PRODOTTI[c.prodotto].percentuale) / 100;
        return c.mesi.filter(m => m.bonificoIl).map(m => ({
            id: `bon-canone-${c.id}-${m.mese}`,
            tipo: 'canone',
            contrattoId: c.id,
            mese: m.mese,
            beneficiarioId: c.locatore.personaId,
            beneficiario: c.locatore.nome,
            importo: Math.round((c.canone - commissione) * 100) / 100,
            canone: c.canone, commissione, percentuale: PRODOTTI[c.prodotto].percentuale,
            causale: `Canone di ${nomeMese(m.mese).toLowerCase()} · ${c.immobile.indirizzo} · ${c.codiceUnivoco}`,
            natoIl: m.pagatoIl,
            dispostoDa: 'alberto', dispostoIl: m.pagatoIl,
            autorizzatoDa: 'silvia', autorizzatoIl: aggiungiGiorniSolari(m.pagatoIl, 1),
            eseguitoDa: 'alberto', eseguitoIl: m.bonificoIl,
            riferimento: `CRIA${compatta(m.bonificoIl)}${c.id === 'c-verdi3' ? '011' : '012'}`,
        }));
    });

// ─── Provvigioni dei commerciali ──────────────────────────────────────────────
// Le richieste di prelievo dei commerciali come le mostra oggi Provvigioni (O-26,
// scheda «Richieste pagamento»). Quella pagina tiene i dati dentro di sé e non
// li esporta: qui c'è lo specchio, da leggere da un file condiviso quando ci sarà.
// Il compenso dell'avvocato che sta nella stessa scheda non è una provvigione.
export const PROVVIGIONI_DA_PAGARE = [
    {
        id: 'bon-provv-1', tipo: 'provvigione', richiestaO26: 1,
        beneficiario: 'Luca Verdi', iban: 'IT60X0542811101000000123456',
        importo: 180, causale: 'Provvigioni maturate · richiesta di prelievo', natoIl: '2026-04-03',
    },
    {
        id: 'bon-provv-3', tipo: 'provvigione', richiestaO26: 3,
        beneficiario: 'Sara Galli', iban: 'IT40Y0300203280573605681220',
        importo: 80, causale: 'Provvigioni maturate · richiesta di prelievo', natoIl: '2026-03-15',
        dispostoDa: 'alberto', dispostoIl: '2026-03-16', autorizzatoDa: 'silvia', autorizzatoIl: '2026-03-17',
        eseguitoDa: 'alberto', eseguitoIl: '2026-03-18', riferimento: 'CRIA20260318004',
    },
    {
        id: 'bon-provv-4', tipo: 'provvigione', richiestaO26: 4,
        beneficiario: 'Marco Fontana', iban: 'IT95O0501803400000000168507',
        importo: 50, causale: 'Provvigioni maturate · richiesta di prelievo', natoIl: '2026-03-10',
        dispostoDa: 'alberto', dispostoIl: '2026-03-10', autorizzatoDa: 'silvia', autorizzatoIl: '2026-03-11',
        eseguitoDa: 'alberto', eseguitoIl: '2026-03-12', riferimento: 'CRIA20260312002',
    },
];

// ─── Riassicurazione ──────────────────────────────────────────────────────────
// I trimestri partono da ottobre 2025, il primo mese dei dati demo. I numeri si
// calcolano dai contratti e dalle pratiche; qui solo quando è partito il rendiconto.
export const PRIMO_TRIMESTRE = '2025-T4';

export const RENDICONTI_INVIATI = {
    '2025-T4': { inviatoIl: '2026-03-20', inviatoDa: 'silvia' },
    '2026-T1': { inviatoIl: '2026-06-24', inviatoDa: 'silvia' },
};
