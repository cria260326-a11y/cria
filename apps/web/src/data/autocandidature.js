// ═════════════════════════════════════════════════════════════════════════════
// AUTOCANDIDATURE — SOLO PER I MOCKUP
// Il certificato su autocandidatura (P7, documento di stato §14.6 e §15.2) è per
// chi su CRIA non ha storico: un certificato che dice «non abbiamo informazioni»
// non gli serve. Porta la sua documentazione, CRIA la istruisce come farebbe con
// un candidato, e il certificato dichiara da dove viene il dato: «verificato su
// documentazione fornita dall'interessato», non «rilevato da CRIA».
//
// Il livello di una prova lo fissa il TIPO di documento, mai il giudizio di un
// operatore. Per dare un colore servono due prove forti e indipendenti che
// coprano almeno 12 mesi; sotto, il valore è «storico insufficiente».
//
// La referenza del precedente proprietario parte solo se la chiede l'inquilino:
// non esiste un modo per segnalare qualcuno che non l'ha chiesta.
//
// Fase 4: tabelle autocandidature, prove, referenze e tentativi di contatto.
// ═════════════════════════════════════════════════════════════════════════════

import { PRODOTTI } from '@/data/catalogo';
import { MESI_SEMAFORO } from '@/lib/semaforo';

// ─── Il minimo per emettere ───────────────────────────────────────────────────
// In piattaforma diventano parametri del prodotto P7.
export const PROVE_FORTI_MINIME = 2;
export const MESI_MINIMI = MESI_SEMAFORO;

// ─── Livelli ──────────────────────────────────────────────────────────────────
export const LIVELLI_PROVA = {
    forte: {
        etichetta: 'Forte',
        spiegazione: 'Si verifica presso un terzo',
        effetto: 'Conta per il minimo',
        classe: 'bg-green-50 text-green-800 border-green-200',
    },
    medio: {
        etichetta: 'Medio',
        spiegazione: 'Conferma la coerenza, non fa storico',
        effetto: 'Non conta per il minimo',
        classe: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    debole: {
        etichetta: 'Debole',
        spiegazione: 'Non conta',
        effetto: 'Non conta',
        classe: 'bg-gray-100 text-gray-700 border-gray-200',
    },
};

export const ORDINE_LIVELLI = ['forte', 'medio', 'debole'];

// ─── Tipi di prova ────────────────────────────────────────────────────────────
// La referenza non si carica: la chiede CRIA al precedente proprietario, su
// richiesta dell'inquilino, e conta quando lui la conferma (E-09, E-10).
export const TIPI_PROVA = [
    {
        id: 'movimenti_canone',
        etichetta: 'Movimenti bancari dei pagamenti del canone',
        livello: 'forte',
        nota: `Solo i movimenti con cui hai pagato il canone, ${MESI_SEMAFORO} mesi: mai l’estratto conto intero.`,
        siCarica: true,
    },
    {
        id: 'referenza_proprietario',
        etichetta: 'Referenza del precedente proprietario',
        livello: 'forte',
        nota: 'La chiedi tu: CRIA lo contatta al recapito del contratto e lui risponde da un link personale. Conta quando è confermata.',
        siCarica: false,
    },
    {
        id: 'contratto_registrato',
        etichetta: 'Contratto di locazione registrato',
        livello: 'forte',
        nota: 'Con gli estremi della registrazione: numero, data e ufficio.',
        siCarica: true,
    },
    {
        id: 'ricevute_canone',
        etichetta: 'Ricevute del canone firmate dal proprietario',
        livello: 'medio',
        nota: 'Confermano che le altre prove sono coerenti, ma non fanno storico.',
        siCarica: true,
    },
    {
        id: 'autodichiarazione',
        etichetta: 'Autodichiarazione',
        livello: 'debole',
        nota: 'Non conta.',
        siCarica: true,
    },
    {
        id: 'referenza_datore',
        etichetta: 'Referenza del datore di lavoro',
        livello: 'debole',
        nota: 'Dice che hai un reddito, non che hai pagato l’affitto: non conta.',
        siCarica: true,
    },
];

export const tipoProva = (id) => TIPI_PROVA.find(t => t.id === id) || null;
export const livelloProva = (id) => tipoProva(id)?.livello || null;

// ─── Stati dell'autocandidatura ───────────────────────────────────────────────
// Si paga all'avvio; poi prove → istruttoria → certificato emesso. «Non accolta»
// solo se una smentita documentata contraddice quello che l'inquilino ha dichiarato.
export const STATI_AUTOCANDIDATURA = {
    prove: { etichetta: 'Raccolta delle prove', classe: 'bg-blue-100 text-blue-800' },
    istruttoria: { etichetta: 'In istruttoria', classe: 'bg-amber-100 text-amber-800' },
    emessa: { etichetta: 'Certificato emesso', classe: 'bg-green-100 text-green-800' },
    rifiutata: { etichetta: 'Non accolta', classe: 'bg-red-100 text-red-800' },
};

// ─── Referenza del precedente proprietario ────────────────────────────────────
// CRIA lo contatta al recapito del contratto, fino a tre tentativi su canali
// diversi entro dieci giorni lavorativi dalla richiesta. Senza risposta il
// certificato si emette lo stesso e lo dichiara.
export const TENTATIVI_REFERENZA = 3;
export const GIORNI_LAVORATIVI_REFERENZA = 10;

export const CANALI_CONTATTO = {
    email: 'Email',
    sms: 'SMS',
    telefonata: 'Telefonata',
};
export const ORDINE_CANALI = ['email', 'sms', 'telefonata'];

export const STATI_REFERENZA = {
    in_attesa: { etichetta: 'In attesa di risposta', classe: 'bg-blue-50 text-blue-800 border-blue-200' },
    confermata: { etichetta: 'Confermata', classe: 'bg-green-50 text-green-800 border-green-200' },
    smentita: { etichetta: 'Non confermata: contestazione', classe: 'bg-amber-50 text-amber-800 border-amber-200' },
    non_riscontrata: { etichetta: 'Richiesta, non riscontrata', classe: 'bg-gray-100 text-gray-700 border-gray-200' },
};

// Quello che il certificato dichiara quando il precedente proprietario non risponde.
export const DICITURA_NON_RISCONTRATA = 'Referenza del precedente proprietario — richiesta, non riscontrata';

// Se non conferma, il precedente proprietario indica i mesi e allega almeno uno di questi.
export const PROVE_SMENTITA = [
    { id: 'estratto_conto', etichetta: 'Estratto conto', nota: 'Solo i movimenti che riguardano l’affitto, non l’estratto conto intero.' },
    { id: 'diffida', etichetta: 'Diffida' },
    { id: 'decreto_ingiuntivo', etichetta: 'Decreto ingiuntivo' },
    { id: 'sfratto', etichetta: 'Provvedimento di sfratto' },
];

// ─── Demo ─────────────────────────────────────────────────────────────────────
// Elena Greco: verificata, nessun contratto da inquilino su CRIA. Ha pagato il
// 5 settembre, ha caricato il contratto registrato di Via Mazzini 3 e l'8 ha
// chiesto la referenza a Roberto Fabbri, che non ha ancora risposto.
export const TOKEN_REFERENZA_DEMO = 'demo-referenza';

export const AUTOCANDIDATURE = [
    {
        id: 'auto-elena',
        personaId: 'elena',
        apertaIl: '2026-09-05',
        pagamento: { pagataIl: '2026-09-05', importo: PRODOTTI.P7.prezzo, metodo: 'carta' },
        stato: 'prove',
        prove: [
            {
                id: 'prova-elena-contratto',
                tipo: 'contratto_registrato',
                file: 'Contratto Via Mazzini 3 registrato.pdf',
                dal: '2025-02',
                al: '2026-08',
                immobile: 'Via Mazzini 3, Verona',
                estremi: { numero: 'TVE25T000871000PX', data: '2025-01-24', ufficio: 'Agenzia delle Entrate · DP Verona' },
                caricataIl: '2026-09-06',
            },
        ],
        referenze: [
            {
                id: 'ref-elena-fabbri',
                token: TOKEN_REFERENZA_DEMO,
                inquilino: 'Elena Greco',
                proprietario: { nome: 'Roberto Fabbri', email: 'roberto.fabbri@esempio.it', telefono: '+39 340 5512876' },
                immobile: 'Via Mazzini 3, Verona',
                dal: '2025-02',
                al: '2026-08',
                richiestaIl: '2026-09-08',
                tentativi: [{ canale: 'email', il: '2026-09-08' }],
                stato: 'in_attesa',
                risposta: null,
                replica: null,
            },
        ],
        inviataIl: null,
        sottoMinimo: null,
        conclusaIl: null,
        certificatoId: null,
    },
];

export const autocandidatureDi = (personaId) => AUTOCANDIDATURE.filter(a => a.personaId === personaId);
