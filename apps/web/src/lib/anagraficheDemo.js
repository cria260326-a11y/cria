import { useMemo } from 'react';
import { CONTESTAZIONI, OGGI } from '@/data/datiDemo';
import { documentiAttuali, useDocumenti } from '@/lib/documentiFonte';
import { PERSONE_DEMO, trovaPersonaDemo } from '@/data/personeDemo';
import { MOROSITA } from '@/data/pratiche';
import { PRODOTTI, PARAMETRI, nomeProdotto } from '@/data/catalogo';
import { tipoProva } from '@/data/autocandidature';
import { IMMOBILI, REGISTRAZIONI, SOGGETTI } from '@/data/anagrafiche';
import { OPERATORI, nomeOperatore } from '@/data/operatori';
import { normalizzaEmail, normalizzaTelefono, normalizzaCodiceFiscale } from '@/lib/unicita';
import { fmtData } from '@/lib/formato';
import { useTutteLePratiche } from '@/lib/praticheDemo';
import { useTutteLeAutocandidature } from '@/lib/autocandidatureDemo';
import { useTutteLeVerifiche } from '@/lib/verificheDemo';
import { useTuttiICertificati } from '@/lib/certificatiDemo';
import { analizzaMesi } from '@/lib/semaforo';
import { isVerificata } from '@/lib/aree';
import { TIPO_DOCUMENTO } from '@/lib/etichette';
import { aggiungiGiorniSolari, calcolaTermine, mancanoAlTermine } from '@/lib/calendario';
import { creaStoreDemo, nuovoIdDemo } from '@/lib/storeDemo';
import { usePersone } from '@/lib/personeFonte';
import { contrattiAttuali, trovaContrattoAttuale, useContratti } from '@/lib/contrattiFonte';

// ═════════════════════════════════════════════════════════════════════════════
// ANAGRAFICA NEL BACK OFFICE — O-02 … O-06 (lotto 5)
// Soggetti con o senza account, posizioni sui contratti, le due reputazioni,
// doppioni e codici fiscali provvisori, estremi di registrazione, immobili.
//
// Nel browser si tengono solo gli EVENTI: chi ha fatto cosa, e quando. Lo stato
// — un utente creato, un codice definitivo, una ricevuta chiesta — si ricava
// dagli eventi, così la traccia non può mancare.
//
// Il sistema segnala, una persona decide: niente si unisce e niente si
// corregge da solo. Due anagrafiche della stessa persona non si fondono: si
// sente il cliente, si crea un utente nuovo con le credenziali giuste (lo
// prepara un operatore, lo conferma un responsabile diverso), si portano a mano
// le voci dello storico, e le anagrafiche vecchie si archiviano rimandando al
// nuovo. Fase 4: tabelle persone, posizioni, immobili_titolarita,
// registrazioni e il registro delle modifiche (lotto 6).
// ═════════════════════════════════════════════════════════════════════════════

export const PERCORSI = {
    soggetti: '/dashboard/admin/clienti',
    revisione: '/dashboard/admin/anagrafiche',
    contratti: '/dashboard/admin/contratti',
    registrazioni: '/dashboard/admin/contratti?scheda=registrazioni',
};
export const percorsoSoggetto = (id) => `${PERCORSI.soggetti}/${id}`;

// ─── Termini ──────────────────────────────────────────────────────────────────
// Il documento non li fissa: sono una proposta. Il lavoro interno si conta in
// giorni lavorativi, la risposta chiesta a un cliente in giorni solari (§13.6).
export const TERMINI_ANAGRAFICA = {
    lavoroInterno: { giorni: 5, calendario: 'lavorativi' },   // esaminare un doppione, inserire gli estremi da una ricevuta arrivata
    rispostaCliente: { giorni: 10, calendario: 'solari' },   // mandare il codice fiscale definitivo o la ricevuta
};

const termine = (decorrenza, quale) => {
    const t = TERMINI_ANAGRAFICA[quale];
    const scade = calcolaTermine({ decorrenza, giorni: t.giorni, calendario: t.calendario });
    const mancano = mancanoAlTermine(OGGI, scade, t.calendario);
    return { decorrenza, scade, calendario: t.calendario, mancano, scaduto: mancano < 0 };
};

// ─── Chi vede e chi fa ────────────────────────────────────────────────────────
// Il ruolo dice che tipo di dati si vedono (§13.5). La direzione legge solo
// aggregati, il DPO il registro e non i dati; il listino non ha bisogno di nomi.
// La matrice definitiva arriva con la lista dei ruoli (lotto 6).
const LIVELLI = { direzione: 'agg', resp_prodotto: 'agg', dpo: 'registro' };
export const livelloAnagrafica = (funzione) => LIVELLI[funzione] || 'L';

// ─── Etichette ────────────────────────────────────────────────────────────────
export const STATO_ACCOUNT = {
    attivo: { etichetta: 'Account attivo', breve: 'Attivo', classe: 'bg-green-100 text-green-800' },
    da_verificare: { etichetta: 'Identità da verificare', breve: 'Da verificare', classe: 'bg-amber-100 text-amber-800' },
    da_attivare: { etichetta: 'Creato da CRIA, da attivare', breve: 'Da attivare', classe: 'bg-violet-100 text-violet-800' },
    invitato: { etichetta: 'Invitato, non ancora attivo', breve: 'Invitato', classe: 'bg-blue-100 text-blue-800' },
    senza_account: { etichetta: 'Senza account', breve: 'Senza account', classe: 'bg-gray-100 text-gray-700' },
    archiviato: { etichetta: 'Archiviato, sostituito da un utente nuovo', breve: 'Archiviato', classe: 'bg-slate-200 text-slate-700' },
};

export const STATO_COPPIA = {
    da_rivedere: { etichetta: 'Da esaminare', classe: 'bg-amber-100 text-amber-800' },
    risolta: { etichetta: 'Risolto', classe: 'bg-green-100 text-green-800' },
    distinti: { etichetta: 'Soggetti diversi', classe: 'bg-slate-100 text-slate-700' },
};

// ─── Utenti creati da CRIA ────────────────────────────────────────────────────
// Di regola i clienti si registrano da soli (§13.4): un operatore che crea
// utenti potrebbe inventare un proprietario e fargli girare denaro. Creare un
// utente da CRIA è un'eccezione, e per questo ha una seconda firma, una
// password provvisoria da cambiare al primo accesso e la verifica
// dell'identità come per chi si registra. In piattaforma non lo fa il browser:
// lo fa una Edge Function di Supabase con la chiave di servizio, chiamabile
// solo dall'admin, che registra tutto. Qui è simulato.
export const RUOLI_UTENTE = {
    proprietario: { etichetta: 'Proprietario', spiegazione: 'Vede i suoi immobili, i contratti, le segnalazioni e i pagamenti.' },
    inquilino: { etichetta: 'Inquilino', spiegazione: 'Vede il suo contratto, il suo semaforo, i pagamenti e il certificato.' },
    cliente_verifica: { etichetta: 'Cliente CRIA Verifica', spiegazione: 'Chiede verifiche sui candidati e ne legge l’esito.' },
    commerciale: { etichetta: 'Commerciale', collaboratore: true, spiegazione: 'Vede i clienti e i contratti legati al suo codice.' },
    avvocato: { etichetta: 'Avvocato', collaboratore: true, spiegazione: 'Vede le pratiche che gli sono assegnate.' },
};

export const CANALI_CONTATTO = { telefono: 'Al telefono', di_persona: 'Di persona', email: 'Per email', sms: 'Per SMS' };

export const STATO_PREPARAZIONE = {
    da_confermare: { etichetta: 'Da confermare', classe: 'bg-blue-100 text-blue-800' },
    confermata: { etichetta: 'Utente creato', classe: 'bg-green-100 text-green-800' },
    respinta: { etichetta: 'Respinta', classe: 'bg-red-100 text-red-800' },
};

// Le voci dello storico che passano, una per una, da un'anagrafica vecchia a
// quella nuova. La reputazione non c'è: si ricalcola dai contratti portati.
export const VOCI_STORICO = {
    posizioni: 'Posizioni sui contratti',
    pratiche: 'Pratiche',
    verifiche: 'Richieste CRIA Verifica',
    certificati: 'Certificati',
    autocandidature: 'Autocandidature',
    documenti: 'Documenti',
    referenze: 'Referenze date',
};

export const STATO_REGISTRAZIONE = {
    completa: { etichetta: 'Estremi letti dalla ricevuta', breve: 'Riscontrata', classe: 'bg-green-100 text-green-800' },
    da_inserire: { etichetta: 'Ricevuta arrivata, estremi da inserire', breve: 'Estremi da inserire', classe: 'bg-blue-100 text-blue-800' },
    senza_ricevuta: { etichetta: 'Manca la ricevuta', breve: 'Senza ricevuta', classe: 'bg-amber-100 text-amber-800' },
};

export const STATO_IMMOBILE = {
    attivo: { etichetta: 'Su CRIA', classe: 'bg-green-100 text-green-800' },
    in_pratica: { etichetta: 'In pratica', classe: 'bg-blue-100 text-blue-800' },
};

export const VERSO = {
    locatore: { etichetta: 'Proprietario', classe: 'bg-blue-100 text-blue-800' },
    conduttore: { etichetta: 'Inquilino', classe: 'bg-green-100 text-green-800' },
};

export const MOTIVI_DISTINTI = {
    codice_fiscale: 'Codice fiscale diverso',
    nascita: 'Data o luogo di nascita diversi',
    rappresentante: 'Una società e chi la rappresenta',
    omonimi: 'Omonimi: stesso nome, persone diverse (per esempio padre e figlio)',
    altro: 'Altro',
};

export const FONTI_CODICE = {
    tessera_sanitaria: 'Tessera sanitaria caricata dalla persona',
    certificato_attribuzione: 'Certificato di attribuzione dell’Agenzia delle Entrate',
};

export const CANALI = { area: 'nell’area personale', email: 'via email', sms: 'via SMS' };

export const FONTE_TITOLARITA = { visura: 'Visura catastale', atto: 'Atto di compravendita', dichiarazione: 'Dichiarata dal proprietario' };
export const TITOLO = { proprietario: 'Proprietario', comproprietario: 'Comproprietario', usufruttuario: 'Usufruttuario' };

// Email, cellulare e codice fiscale non si ripetono mai: la registrazione
// rifiuta quelli già usati (lib/unicita.js), e la verifica dell'identità un
// codice fiscale già presente. Il controllo dei doppioni scatta dove una
// persona può davvero entrare due volte: stesso nome, stesso indirizzo, stesso
// paese — una seconda registrazione con recapiti nuovi, o due omonimi che
// vivono insieme. Una persona guarda i documenti e decide.
export const REGOLE_DOPPIONI = {
    nome_indirizzo: 'Stesso nome, indirizzo e paese',
    manuale: 'Segnalato da un operatore',
};

// Per quanto si tiene un documento (§14.5). La cancellazione a 30 giorni dalla
// delibera la fa un job, dopo aver estratto gli indicatori.
const CONSERVAZIONE = {
    identita: 'Vita del contratto + 10 anni',
    codice_fiscale: 'Vita del contratto + 10 anni',
    contratto: 'Vita del contratto + 10 anni',
    registrazione: 'Vita del contratto + 10 anni',
    visura: 'Vita del contratto + 10 anni',
    visura_camerale: 'Vita del contratto + 10 anni',
    movimenti_canone: '30 giorni dalla delibera, poi si cancella',
    reddito: '30 giorni dalla delibera, poi si cancella',
    prova: '10 anni dalla chiusura della contestazione',
    consenso: '10 anni dalla revoca',
};
const CANCELLATI_DOPO_DELIBERA = new Set(['movimenti_canone', 'reddito']);
const GIORNI_DOPO_DELIBERA = 30;
// Si aprono solo dove si lavorano, a chi ha la pratica in coda (§13.5).
const RISERVATI = new Set(['movimenti_canone', 'reddito', 'prova']);

// ─── Codice fiscale ───────────────────────────────────────────────────────────
// Undici cifre su una persona fisica sono il codice provvisorio; su una
// società sono il codice fiscale normale, uguale alla partita IVA.
export const isCodiceProvvisorio = (codice, tipo) => tipo === 'fisica' && /^\d{11}$/.test(String(codice || ''));

const DISPARI = {
    0: 1, 1: 0, 2: 5, 3: 7, 4: 9, 5: 13, 6: 15, 7: 17, 8: 19, 9: 21,
    A: 1, B: 0, C: 5, D: 7, E: 9, F: 13, G: 15, H: 17, I: 19, J: 21, K: 2, L: 4, M: 18,
    N: 20, O: 11, P: 3, Q: 6, R: 8, S: 12, T: 14, U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23,
};
const valorePari = (c) => (/\d/.test(c) ? Number(c) : c.charCodeAt(0) - 65);
const carattereControllo = (primi15) => {
    let somma = 0;
    for (let i = 0; i < 15; i += 1) somma += i % 2 === 0 ? DISPARI[primi15[i]] : valorePari(primi15[i]);
    return String.fromCharCode(65 + (somma % 26));
};

const lettere = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z]/g, '');
const consonanti = (s) => lettere(s).replace(/[AEIOU]/g, '');
const vocali = (s) => lettere(s).replace(/[^AEIOU]/g, '');
const codiceCognome = (c) => `${consonanti(c)}${vocali(c)}XXX`.slice(0, 3);
const codiceNome = (n) => {
    const k = consonanti(n);
    return k.length >= 4 ? `${k[0]}${k[2]}${k[3]}` : `${k}${vocali(n)}XXX`.slice(0, 3);
};
const MESI_CODICE = 'ABCDEHLMPRST';
// Con l'omocodia alcune cifre diventano lettere: per confrontare la data si riportano a cifre.
const OMOCODIA = { L: '0', M: '1', N: '2', P: '3', Q: '4', R: '5', S: '6', T: '7', U: '8', V: '9' };
const cifra = (c) => OMOCODIA[c] || c;
const FORMA_CODICE = /^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/;

/**
 * Controllo formale del codice definitivo. Forma e carattere di controllo
 * bloccano; nome e data che non tornano con l'anagrafica sono un avviso.
 * @returns {{ valido: boolean, codice?: string, errore?: string, avvisi: string[] }}
 */
export const controllaCodiceFiscale = (testo, soggetto) => {
    const codice = String(testo || '').toUpperCase().replace(/\s+/g, '');
    if (!FORMA_CODICE.test(codice)) {
        return { valido: false, errore: 'Il codice definitivo ha 16 caratteri: 6 lettere, 2 cifre, 1 lettera, 2 cifre, 1 lettera, 3 cifre, 1 lettera.', avvisi: [] };
    }
    if (carattereControllo(codice.slice(0, 15)) !== codice[15]) {
        return { valido: false, errore: 'L’ultimo carattere non torna con gli altri quindici: ricontrolla la copia.', avvisi: [] };
    }
    const avvisi = [];
    if (soggetto?.nome && soggetto?.cognome && codice.slice(0, 6) !== `${codiceCognome(soggetto.cognome)}${codiceNome(soggetto.nome)}`) {
        avvisi.push('Le lettere di cognome e nome non tornano con l’anagrafica.');
    }
    if (soggetto?.dataNascita) {
        const [a, m, g] = soggetto.dataNascita.split('-');
        const anno = `${cifra(codice[6])}${cifra(codice[7])}`;
        const giorno = Number(`${cifra(codice[9])}${cifra(codice[10])}`);
        const giornoOk = giorno === Number(g) || giorno === Number(g) + 40;
        if (anno !== a.slice(2) || codice[8] !== MESI_CODICE[Number(m) - 1] || !giornoOk) {
            avvisi.push('La data di nascita nel codice non torna con l’anagrafica.');
        }
    }
    return { valido: true, codice, avvisi };
};

// ─── Eventi ───────────────────────────────────────────────────────────────────
const store = creaStoreDemo('criaAnagraficaDemo', () => ({ eventi: [] }));
const eventiDi = (stato) => (Array.isArray(stato?.eventi) ? stato.eventi : []);

const registra = (evento) => store.aggiorna(s => ({ eventi: [...eventiDi(s), { id: nuovoIdDemo('ev'), il: OGGI, ...evento }] }));

export const ripristinaAnagraficaDemo = () => store.ripristina();

export const idCoppia = (a, b) => [a, b].sort().join('~');

export const segnalaDoppione = ({ a, b, motivo }, da) => registra({ tipo: 'doppione_segnalato', coppiaId: idCoppia(a, b), a, b, motivo, da });
export const dichiaraDistinti = (coppiaId, { motivo, nota }, da) => registra({ tipo: 'soggetti_distinti', coppiaId, motivo, nota, da });
// Dopo i passaggi fatti a mano — contatto col cliente, utente creato — la coppia si segna risolta.
export const risolviDoppione = (coppiaId, { nota, utenteId }, da) => registra({ tipo: 'doppione_risolto', coppiaId, nota, utenteId: utenteId || null, da });

/**
 * Prepara un utente creato da CRIA: non nasce finché un responsabile diverso non conferma.
 * dati: { coppiaId, daAnagrafiche, anagrafica, contatto, credenziali, libera, ruoli, storico }
 * @returns {{ preparazioneId: string, soggettoId: string }}
 */
export const preparaUtente = (dati, da) => {
    const preparazioneId = nuovoIdDemo('prep');
    const soggettoId = nuovoIdDemo('ute');
    registra({ tipo: 'utente_preparato', preparazioneId, soggettoId, ...dati, da });
    return { preparazioneId, soggettoId };
};
export const confermaUtente = (preparazioneId, da) => registra({ tipo: 'utente_confermato', preparazioneId, da });
export const respingiUtente = (preparazioneId, motivo, da) => registra({ tipo: 'utente_respinto', preparazioneId, motivo, da });
export const inviaPasswordPerSms = (soggettoId, telefono, da) => registra({ tipo: 'password_inviata', soggettoId, canale: 'sms', a: telefono, da });
// Solo nei mockup: sono passi della persona (primo accesso) e dell'istruttoria (documento d'identità).
export const simulaAttivazione = (soggettoId) => registra({ tipo: 'account_attivato', soggettoId, da: null });
export const simulaIdentitaVerificata = (soggettoId, da) => registra({ tipo: 'identita_verificata', soggettoId, da });

// In piattaforma la genera il server e il browser non la vede mai salvata: qui
// la genera il browser, si mostra una volta a chi conferma e non si conserva.
const ALFABETO_PASSWORD = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
export const generaPasswordProvvisoria = () => {
    const valori = new Uint32Array(12);
    crypto.getRandomValues(valori);
    const c = Array.from(valori, v => ALFABETO_PASSWORD[v % ALFABETO_PASSWORD.length]).join('');
    return `${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8)}`;
};
export const chiediCodice = (soggettoId, canale, da) => registra({ tipo: 'codice_chiesto', soggettoId, canale, da });
export const registraCodice = (soggettoId, { codice, fonte }, da) => registra({ tipo: 'codice_registrato', soggettoId, codice, fonte, da });
export const invitaSoggetto = (soggettoId, canale, da) => registra({ tipo: 'invito', soggettoId, canale, da });
export const chiediRicevuta = (contrattoId, da) => registra({ tipo: 'ricevuta_chiesta', contrattoId, canale: 'area', da });
export const inserisciEstremi = (contrattoId, { estremi, diversi, nota }, da) =>
    registra({ tipo: 'estremi_inseriti', contrattoId, estremi, diversi, nota, da });
// Solo nei mockup: la ricevuta la carica il proprietario dalla sua area (§14.5, ognuno consegna i propri).
export const simulaRicevutaCaricata = (contrattoId) => registra({ tipo: 'ricevuta_caricata', contrattoId, da: null });

// ─── Soggetti ─────────────────────────────────────────────────────────────────
const nomeDaIntero = (intero) => {
    const [nome = '', ...resto] = String(intero || '').trim().split(/\s+/);
    return { nome, cognome: resto.join(' ') };
};

export const nomeSoggetto = (s) => (!s ? '' : s.tipo === 'giuridica' ? s.ragioneSociale : `${s.nome} ${s.cognome}`.trim());

// Commerciali, avvocati e interni sono collaboratori, non soggetti dell'anagrafica.
const AREE_COLLABORATORI = ['commerciale', 'avvocato', 'admin'];
const PERSONE_CLIENTI = PERSONE_DEMO.filter(p => !(p.aree || []).some(a => AREE_COLLABORATORI.includes(a)));

// Chi sta dietro una parte di contratto che non è una persona demo.
const PARTI = Object.fromEntries(
    Object.entries(SOGGETTI).filter(([, s]) => s.parte).map(([id, s]) => [`${s.parte.contrattoId}:${s.parte.verso}`, id]),
);

/** L'anagrafica di una parte del contratto (verso: 'locatore' | 'conduttore'), senza seguire le unioni. */
export const soggettoDellaParte = (contratto, verso) => contratto?.[verso]?.personaId || PARTI[`${contratto?.id}:${verso}`] || null;

const IMMOBILE_DEL_CONTRATTO = Object.fromEntries(IMMOBILI.flatMap(i => (i.contratti || []).map(c => [c, i.id])));
/** La scheda immobile (O-06) di un contratto. La rotta accetta anche l'id del contratto o della pratica. */
export const percorsoImmobile = (contrattoId) => `/dashboard/admin/immobili/${IMMOBILE_DEL_CONTRATTO[contrattoId] || contrattoId}`;

const nuovoSoggetto = (campi) => ({
    tipo: 'fisica', nome: '', cognome: '', ragioneSociale: null, partitaIva: null,
    codiceFiscale: null, codiciPrecedenti: [], codiceDefinitivo: null, dataNascita: null, luogoNascita: null,
    email: null, telefono: null, sede: null, indirizzo: null,
    personaId: null, creatoIl: null, origine: null, rappresentante: null, rappresenta: null, legaleRappresentante: null,
    inviti: [], richiesteCodice: [], passwordInviate: [],
    posizioni: [], pratiche: [], verifiche: [], certificati: [], autocandidature: [], referenze: [], documenti: [],
    // creazione: la preparazione da cui nasce un utente creato da CRIA.
    // archiviato: { il, da, sostituitoDa, preparazioneId, emailPrima, telefonoPrima } quando un utente nuovo lo sostituisce.
    creazione: null, archiviato: null,
    ...campi,
});

// I campi di SOGGETTI che non vanno copiati così come sono sul soggetto. Gli
// elenchi si copiano: gli eventi del browser si aggiungono alla copia, mai ai dati di base.
const separaExtra = (extra = {}) => {
    const { account = {}, parte, richiesteCodice = [], ...resto } = extra;
    const { inviti = [], ...datiAccount } = account;
    return { parte, datiAccount, inviti: [...inviti], richiesteCodice: [...richiesteCodice], resto };
};

const daPersonaDemo = (p) => {
    const { datiAccount, inviti, richiesteCodice, resto } = separaExtra(SOGGETTI[p.id]);
    const giuridica = p.tipo === 'giuridica';
    return nuovoSoggetto({
        id: p.id,
        personaId: p.id,
        tipo: p.tipo,
        // Per una società nome e cognome dell'account sono di chi la rappresenta, non della società.
        nome: giuridica ? '' : p.nome,
        cognome: giuridica ? '' : p.cognome,
        ragioneSociale: p.ragioneSociale || null,
        partitaIva: p.partitaIva || null,
        codiceFiscale: giuridica ? (p.fatturazione?.codiceFiscale || p.partitaIva) : p.codiceFiscale,
        dataNascita: p.dataNascita || null,
        email: p.email,
        telefono: p.telefono,
        ...resto,
        account: { stato: isVerificata(p) ? 'attivo' : 'da_verificare', ...datiAccount },
        inviti,
        richiesteCodice,
    });
};

// Chi si è iscritto sul sito: sta nel database e non ha un posto nei dati di prova.
const daPersonaDatabase = (p) => nuovoSoggetto({
    id: p.id,
    personaId: p.id,
    tipo: p.tipo,
    nome: p.tipo === 'giuridica' ? '' : p.nome,
    cognome: p.tipo === 'giuridica' ? '' : p.cognome,
    ragioneSociale: p.ragioneSociale || null,
    partitaIva: p.partitaIva || null,
    codiceFiscale: p.codiceFiscale || null,
    dataNascita: p.dataNascita || null,
    luogoNascita: p.luogoNascita || null,
    email: p.email,
    telefono: p.telefono,
    creatoIl: p.creataIl,
    origine: { tipo: 'registrazione' },
    account: { stato: p.statoIdentita === 'verificato' ? 'attivo' : 'da_verificare', dal: p.creataIl },
});

// I dati personali di chi ha una riga nel database valgono più di quelli di
// prova: sono quelli che l'admin e la persona cambiano davvero.
const applicaDatiPersona = (s, p) => {
    const giuridica = p.tipo === 'giuridica';
    s.personaDb = p.personaDb;
    s.tipo = p.tipo;
    s.nome = giuridica ? '' : p.nome;
    s.cognome = giuridica ? '' : p.cognome;
    s.referente = giuridica ? { nome: p.nome, cognome: p.cognome } : null;
    s.ragioneSociale = p.ragioneSociale || null;
    s.partitaIva = p.partitaIva || null;
    s.codiceFiscale = p.codiceFiscale || null;
    s.dataNascita = p.dataNascita || null;
    s.luogoNascita = p.luogoNascita || null;
    s.email = p.email;
    s.telefono = p.telefono;
    s.statoIdentita = p.statoIdentita;
    if (p.indirizzo?.via) s.indirizzo = { via: p.indirizzo.via, cap: p.indirizzo.cap || '', citta: p.indirizzo.citta || '', provincia: p.indirizzo.provincia || '', paese: p.indirizzo.paese || 'Italia' };
    if (!['archiviato', 'da_attivare'].includes(s.account.stato)) {
        s.account = { ...s.account, stato: p.statoIdentita === 'verificato' ? 'attivo' : 'da_verificare' };
    }
};

const daParte = (id) => {
    const { parte, datiAccount, inviti, richiesteCodice, resto } = separaExtra(SOGGETTI[id]);
    const dati = trovaContrattoAttuale(parte.contrattoId)?.[parte.verso];
    if (!dati) return null;
    return nuovoSoggetto({
        id, ...nomeDaIntero(dati.nome), email: dati.email, telefono: dati.telefono,
        ...resto, account: { stato: 'senza_account', ...datiAccount }, inviti, richiesteCodice,
    });
};

const daCandidato = (pratica) => {
    const id = `cand-${pratica.id}`;
    const { resto } = separaExtra(SOGGETTI[id]);
    return nuovoSoggetto({
        id,
        ...nomeDaIntero(pratica.candidato.nome),
        email: pratica.candidato.email || null,
        telefono: pratica.candidato.cellulare || null,
        creatoIl: pratica.candidato.invitatoIl || pratica.apertaIl,
        origine: { tipo: 'candidato', praticaId: pratica.id },
        ...resto,
        account: { stato: 'senza_account' },
    });
};

const daReferenza = (autocandidatura, referenza) => nuovoSoggetto({
    id: `prec-${referenza.id}`,
    ...nomeDaIntero(referenza.proprietario?.nome),
    email: referenza.proprietario?.email || null,
    telefono: referenza.proprietario?.telefono || null,
    creatoIl: referenza.richiestaIl,
    origine: { tipo: 'referenza', autocandidaturaId: autocandidatura.id, referenzaId: referenza.id, personaId: autocandidatura.personaId },
    account: { stato: 'senza_account' },
});

// Anagrafiche nate solo in back office: chi si è registrato due volte, chi firma per una società.
const daBackOffice = (id) => {
    const { datiAccount, inviti, richiesteCodice, resto } = separaExtra(SOGGETTI[id]);
    const rappresentata = resto.rappresenta ? trovaPersonaDemo(resto.rappresenta) : null;
    const base = rappresentata
        ? { nome: rappresentata.nome, cognome: rappresentata.cognome, email: rappresentata.email, telefono: rappresentata.telefono }
        : {};
    return nuovoSoggetto({ id, ...base, ...resto, account: { stato: 'senza_account', ...datiAccount }, inviti, richiesteCodice });
};

// ─── Due reputazioni che non si mescolano (§13.3) ─────────────────────────────
const reputazioneInquilino = (contratti) => (contratti.length === 0 ? null : {
    analisi: analizzaMesi(contratti.flatMap(c => c.mesi)),
    perContratto: contratti.map(c => ({ contratto: c, analisi: analizzaMesi(c.mesi) })),
});

// Il documento dice cosa misura (§13.3): commissione pagata, termini di
// segnalazione rispettati, contestazioni fondate, documenti consegnati. Il
// colore non è definito: qui ci sono i fatti che lo comporranno.
const ULTIMO_GIORNO_FINESTRA = PARAMETRI.giornoScadenzaCanone + PARAMETRI.giorniFinestraCopertura;
const affidabilitaProprietario = (contratti, documenti) => {
    if (contratti.length === 0) return null;
    const conSegnalazione = contratti.filter(c => PRODOTTI[c.prodotto]?.incassa === 'proprietario');
    const mesi = conSegnalazione.flatMap(c => c.mesi);
    const nonRilevati = mesi.filter(m => m.stato === 'non_rilevato').length;
    const tardivi = mesi.filter(m => m.segnalazione.tipo === 'non_pagato' && Number(m.segnalazione.il.slice(8, 10)) > ULTIMO_GIORNO_FINESTRA).length;
    const ids = new Set(contratti.map(c => c.id));
    const contestazioni = CONTESTAZIONI.filter(k => ids.has(k.contrattoId));
    return {
        contratti: contratti.length,
        conSegnalazione: conSegnalazione.length,
        mesi: mesi.length,
        inTempo: mesi.length - nonRilevati - tardivi,
        tardivi,
        nonRilevati,
        rettificate: contestazioni.filter(k => k.stato === 'risolta_favore_inquilino').length,
        confermate: contestazioni.filter(k => k.stato === 'risolta_favore_locatore').length,
        documentiAperti: documenti.filter(d => d.stato === 'da_integrare' || d.stato === 'in_attesa').length,
    };
};

// ─── Documenti del soggetto: chi consegna cosa (§14.5) ────────────────────────
const documentiDelSoggetto = (s, pratichePerId) => {
    const out = [];
    for (const d of documentiAttuali().filter(x => (s.personaId && x.personaId === s.personaId) || (x.soggettoId && x.soggettoId === s.id))) {
        out.push({ id: d.id, tipo: d.tipo, etichetta: TIPO_DOCUMENTO[d.tipo] || d.nome, file: d.nome, il: d.caricatoIl, stato: d.stato, contrattoId: d.contrattoId });
    }
    for (const pos of s.posizioni) {
        if (pos.verso === 'locatore' && !s.personaId && REGISTRAZIONI[pos.contrattoId]?.ricevuta) {
            const r = REGISTRAZIONI[pos.contrattoId].ricevuta;
            out.push({ id: `ric-${pos.contrattoId}`, tipo: 'registrazione', etichetta: TIPO_DOCUMENTO.registrazione, file: r.nome, il: r.caricataIl, stato: null, contrattoId: pos.contrattoId });
        }
        for (const k of CONTESTAZIONI.filter(x => x.contrattoId === pos.contrattoId)) {
            for (const d of k.documenti.filter(x => x.caricatoDa === pos.verso)) {
                out.push({ id: d.id, tipo: 'prova', etichetta: 'Prova per una contestazione', file: d.nome, il: d.il, stato: null, contrattoId: pos.contrattoId, contestazioneId: k.id });
            }
        }
    }
    for (const rel of s.pratiche.filter(r => r.ruolo === 'candidato' || r.ruolo === 'inquilino_attuale')) {
        const p = pratichePerId[rel.praticaId];
        for (const d of p?.candidato?.documenti || []) {
            const delibera = p.istruttoria?.conclusaIl;
            out.push({
                id: `${p.id}-${d.tipo}`, tipo: d.tipo, etichetta: d.etichetta, file: null,
                il: d.stato === 'caricato' ? p.candidato.ultimoAccesso || null : null,
                stato: d.stato === 'caricato' ? 'caricato' : 'mancante',
                praticaId: p.id,
                cancellazioneIl: delibera && CANCELLATI_DOPO_DELIBERA.has(d.tipo) && d.stato === 'caricato'
                    ? aggiungiGiorniSolari(delibera, GIORNI_DOPO_DELIBERA) : null,
            });
        }
    }
    for (const a of s.autocandidature) {
        for (const pr of a.prove || []) {
            out.push({ id: pr.id, tipo: pr.tipo, etichetta: tipoProva(pr.tipo)?.etichetta || pr.tipo, file: pr.file, il: pr.caricataIl, stato: 'caricato', autocandidaturaId: a.id, riservato: true });
        }
    }
    return out.map(d => ({
        ...d,
        riservato: d.riservato || RISERVATI.has(d.tipo),
        conservazione: CONSERVAZIONE[d.tipo] || null,
    }));
};

// ─── Legami, per l'elenco ─────────────────────────────────────────────────────
export const LEGAMI = {
    proprietario: 'Proprietario',
    inquilino: 'Inquilino',
    candidato: 'Candidato',
    cliente_verifica: 'Cliente CRIA Verifica',
    autocandidatura: 'Autocandidatura',
    precedente_proprietario: 'Precedente proprietario',
    rappresentante: 'Legale rappresentante',
};

const legamiDi = (s) => {
    const n = (verso) => s.posizioni.filter(p => p.verso === verso).length;
    return [
        n('locatore') && { id: 'proprietario', etichetta: `${LEGAMI.proprietario} · ${n('locatore')}` },
        n('conduttore') && { id: 'inquilino', etichetta: `${LEGAMI.inquilino} · ${n('conduttore')}` },
        s.pratiche.some(r => r.ruolo === 'candidato' || r.ruolo === 'inquilino_attuale') && { id: 'candidato', etichetta: LEGAMI.candidato },
        s.verifiche.length && { id: 'cliente_verifica', etichetta: LEGAMI.cliente_verifica },
        s.autocandidature.length && { id: 'autocandidatura', etichetta: LEGAMI.autocandidatura },
        s.referenze.length && { id: 'precedente_proprietario', etichetta: LEGAMI.precedente_proprietario },
        s.rappresenta && { id: 'rappresentante', etichetta: LEGAMI.rappresentante },
    ].filter(Boolean);
};

// I ruoli di un'anagrafica: quelli scelti per un utente creato da CRIA,
// altrimenti quelli che vengono dalle posizioni e dalle aree. Servono da
// riferimento quando si rifà un utente: non si riportano mai da soli.
const ruoliDi = (s) => {
    if (s.account.ruoli) return s.account.ruoli;
    const aree = (s.personaId && trovaPersonaDemo(s.personaId)?.aree) || [];
    return [
        (s.posizioni.some(p => p.verso === 'locatore') || s.pratiche.some(r => r.ruolo === 'proprietario')) && 'proprietario',
        s.posizioni.some(p => p.verso === 'conduttore') && 'inquilino',
        (s.verifiche.length > 0 || aree.includes('cliente')) && 'cliente_verifica',
    ].filter(Boolean);
};

// ─── Da dove viene un'anagrafica ──────────────────────────────────────────────
const origineDi = (s, { nomeDi, pratichePerId, preparazioniPerId }) => {
    const o = s.origine || {};
    if (o.tipo === 'creato') {
        const p = preparazioniPerId[o.preparazioneId];
        return {
            origineBreve: 'Creato da CRIA',
            origineTesto: p?.esito
                ? `Creato da CRIA: preparato da ${nomeOperatore(p.preparatoDa)} il ${fmtData(p.preparatoIl)}, confermato da ${nomeOperatore(p.esito.da)} il ${fmtData(p.esito.il)}`
                : 'Creato da CRIA',
        };
    }
    if (o.tipo === 'contratto') {
        const c = trovaContrattoAttuale(o.contrattoId);
        const via = c?.immobile.indirizzo || '';
        return {
            origineBreve: `Contratto di ${via}`,
            origineTesto: `Dal contratto di ${via}, caricato da ${nomeDi(soggettoDellaParte(c, 'locatore')) || c?.locatore.nome}`,
        };
    }
    if (o.tipo === 'candidato') {
        const p = pratichePerId[o.praticaId];
        const via = p?.immobile.indirizzo || '';
        return {
            origineBreve: `Candidatura per ${via}`,
            origineTesto: `Invito come candidato inquilino per ${via}, mandato da ${nomeDi(p?.personaId)}`,
        };
    }
    if (o.tipo === 'referenza') {
        const r = s.referenze.find(x => x.referenza.id === o.referenzaId)?.referenza;
        return {
            origineBreve: `Referenza per ${nomeDi(o.personaId)}`,
            origineTesto: `Indicazione di ${nomeDi(o.personaId)}, come precedente proprietario di ${r?.immobile || 'un immobile fuori da CRIA'}`,
        };
    }
    if (o.tipo === 'firma') {
        const via = pratichePerId[o.praticaId]?.immobile.indirizzo || '';
        return {
            origineBreve: `Firma per ${nomeDi(s.rappresenta)}`,
            origineTesto: `Registrazione per firmare la pratica di ${via} per conto di ${nomeDi(s.rappresenta)}`,
        };
    }
    return { origineBreve: 'Registrazione su CRIA', origineTesto: 'Registrazione diretta su CRIA' };
};

// ─── Il modello ───────────────────────────────────────────────────────────────
const nomeDaConfrontare = (s) => (s.tipo === 'fisica' ? lettere(`${s.nome}${s.cognome}`) : lettere(s.ragioneSociale)) || null;

const REGOLE = [
    ['nome_indirizzo', s => {
        const nome = nomeDaConfrontare(s);
        const i = s.indirizzo;
        if (!nome || !i?.via) return null;
        return [nome, lettere(i.via), i.cap || lettere(i.citta), lettere(i.paese || 'Italia')].join('|');
    }],
];

// Dove vive una persona, se non l'ha dichiarato: la casa che ha in affitto, poi
// l'indirizzo di fatturazione. Per una società, la sede di fatturazione.
// fonte: dichiarato · casa · fatturazione, così nessuno scambia un indirizzo dedotto per uno dichiarato.
const residenzaDi = (s) => {
    if (s.indirizzo) return { fonte: 'dichiarato', ...s.indirizzo };
    const casa = s.posizioni.filter(p => p.verso === 'conduttore').map(p => trovaContrattoAttuale(p.contrattoId)).find(Boolean);
    if (casa) return { via: casa.immobile.indirizzo, cap: casa.immobile.cap, citta: casa.immobile.citta, paese: 'Italia', fonte: 'casa' };
    const f = s.personaId ? trovaPersonaDemo(s.personaId)?.fatturazione : null;
    if (f?.indirizzo) return { via: f.indirizzo, cap: f.cap, citta: f.citta, paese: f.paese || 'Italia', fonte: 'fatturazione' };
    return null;
};

const costruisci = ({ eventi, pratiche, autocandidature, verifiche, certificati, persone = [] }) => {
    const soggetti = {};
    const aggiungi = (s) => { if (s && !soggetti[s.id]) soggetti[s.id] = s; };

    PERSONE_CLIENTI.forEach(p => aggiungi(daPersonaDemo(p)));
    persone.filter(p => !p.codiceDemo && !p.aree.some(a => AREE_COLLABORATORI.includes(a))).forEach(p => aggiungi(daPersonaDatabase(p)));
    Object.keys(SOGGETTI).filter(id => SOGGETTI[id].parte).forEach(id => aggiungi(daParte(id)));
    pratiche.filter(p => p.candidato).forEach(p => aggiungi(daCandidato(p)));
    autocandidature.forEach(a => (a.referenze || []).forEach(r => aggiungi(daReferenza(a, r))));
    Object.keys(SOGGETTI).filter(id => !soggetti[id] && !SOGGETTI[id].parte && !id.startsWith('cand-')).forEach(id => aggiungi(daBackOffice(id)));

    // Posizioni sui contratti: il verso lo dice il contratto.
    for (const c of contrattiAttuali()) {
        for (const verso of ['locatore', 'conduttore']) {
            soggetti[soggettoDellaParte(c, verso)]?.posizioni.push({ id: `pos-${c.id}-${verso}`, verso, contrattoId: c.id, dal: c.inizio, al: null });
        }
    }
    for (const p of pratiche) {
        soggetti[p.personaId]?.pratiche.push({ praticaId: p.id, ruolo: 'proprietario' });
        if (p.candidato) soggetti[`cand-${p.id}`]?.pratiche.push({ praticaId: p.id, ruolo: p.candidato.inquilinoAttuale ? 'inquilino_attuale' : 'candidato' });
    }
    for (const s of Object.values(soggetti)) {
        if (s.origine?.tipo === 'firma') s.pratiche.push({ praticaId: s.origine.praticaId, ruolo: 'firmataria' });
    }
    verifiche.forEach(v => soggetti[v.personaId]?.verifiche.push(v));
    certificati.forEach(c => soggetti[c.personaId]?.certificati.push(c));
    for (const a of autocandidature) {
        soggetti[a.personaId]?.autocandidature.push(a);
        (a.referenze || []).forEach(r => soggetti[`prec-${r.id}`]?.referenze.push({ autocandidatura: a, referenza: r }));
    }

    // Inviti e codici fiscali, dagli eventi.
    for (const e of eventi) {
        const s = soggetti[e.soggettoId];
        if (!s) continue;
        if (e.tipo === 'invito') {
            s.inviti.push(e);
            if (s.account.stato === 'senza_account') s.account = { ...s.account, stato: 'invitato' };
        } else if (e.tipo === 'codice_chiesto') {
            s.richiesteCodice.push(e);
        } else if (e.tipo === 'codice_registrato' && s.codiceFiscale !== e.codice) {
            s.codiciPrecedenti = [...s.codiciPrecedenti, { codice: s.codiceFiscale, tipo: isCodiceProvvisorio(s.codiceFiscale, s.tipo) ? 'provvisorio' : 'precedente', dal: s.creatoIl, al: e.il }];
            s.codiceFiscale = e.codice;
            s.codiceDefinitivo = { il: e.il, da: e.da, fonte: e.fonte };
        }
    }

    // I dati personali dal database, dopo gli eventi del browser: vince il database.
    for (const p of persone) {
        if (soggetti[p.id]) applicaDatiPersona(soggetti[p.id], p);
    }

    const pratichePerId = Object.fromEntries(pratiche.map(p => [p.id, p]));
    // Documenti e indirizzo si ricavano prima dei passaggi a un utente nuovo: i
    // documenti poi si spostano voce per voce, l'indirizzo di un'anagrafica
    // archiviata resta quello di quando è stata sostituita.
    for (const s of Object.values(soggetti)) {
        s.documenti = documentiDelSoggetto(s, pratichePerId);
        s.indirizzo = residenzaDi(s);
    }

    // ── Utenti creati da CRIA ──
    // Una preparazione vale com'è finché un responsabile non la conferma o la
    // respinge: conta la prima decisione.
    const decisioni = {};
    for (const e of eventi) {
        if ((e.tipo === 'utente_confermato' || e.tipo === 'utente_respinto') && !decisioni[e.preparazioneId]) decisioni[e.preparazioneId] = e;
    }
    const preparazioni = eventi.filter(e => e.tipo === 'utente_preparato').map(e => {
        const esito = decisioni[e.preparazioneId] || null;
        return {
            id: e.preparazioneId,
            soggettoId: e.soggettoId,
            coppiaId: e.coppiaId || null,
            // La preparazione respinta che questa riprende e corregge.
            ripresaDa: e.ripresaDa || null,
            daAnagrafiche: e.daAnagrafiche || [],
            anagrafica: e.anagrafica || {},
            contatto: e.contatto || null,
            credenziali: e.credenziali || {},
            libera: e.libera || {},
            ruoli: e.ruoli || [],
            storico: e.storico || {},
            preparatoDa: e.da,
            preparatoIl: e.il,
            esito,
            stato: !esito ? 'da_confermare' : esito.tipo === 'utente_confermato' ? 'confermata' : 'respinta',
        };
    });
    const preparazioniPerId = Object.fromEntries(preparazioni.map(p => [p.id, p]));

    // Chi tiene ogni posizione: la parte del contratto, finché non passa a un utente nuovo.
    const titolarePosizione = {};
    for (const s of Object.values(soggetti)) s.posizioni.forEach(pos => { titolarePosizione[pos.id] = s.id; });

    const confermate = preparazioni
        .filter(p => p.stato === 'confermata')
        .sort((x, y) => eventi.indexOf(x.esito) - eventi.indexOf(y.esito));
    for (const p of confermate) {
        if (soggetti[p.soggettoId]) continue;
        const a = p.anagrafica;
        const giuridica = a.tipo === 'giuridica';
        const n = nuovoSoggetto({
            id: p.soggettoId,
            tipo: giuridica ? 'giuridica' : 'fisica',
            nome: giuridica ? '' : a.nome || '',
            cognome: giuridica ? '' : a.cognome || '',
            ragioneSociale: giuridica ? a.ragioneSociale || null : null,
            partitaIva: giuridica ? a.partitaIva || null : null,
            codiceFiscale: a.codiceFiscale || null,
            dataNascita: giuridica ? null : a.dataNascita || null,
            luogoNascita: giuridica ? null : a.luogoNascita || null,
            indirizzo: a.indirizzo || null,
            legaleRappresentante: giuridica ? a.rappresentante || null : null,
            email: p.credenziali.email || null,
            telefono: p.credenziali.telefono || null,
            creatoIl: p.esito.il,
            origine: { tipo: 'creato', preparazioneId: p.id },
            account: { stato: 'da_attivare', dal: p.esito.il, ruoli: p.ruoli },
            creazione: p,
        });
        soggetti[n.id] = n;
        // Le voci scelte passano, una per una, dalle anagrafiche vecchie a quella
        // nuova; quelle non scelte restano dove sono.
        for (const [vecchiaId, scelte] of Object.entries(p.storico)) {
            const v = soggetti[vecchiaId];
            if (!v || !scelte) continue;
            const sposta = (campo, chiave) => {
                const ids = scelte[campo] || [];
                const restano = [];
                v[campo].forEach(x => (ids.includes(chiave(x)) ? n[campo] : restano).push(x));
                v[campo] = restano;
            };
            sposta('posizioni', x => x.id);
            sposta('pratiche', x => `${x.praticaId}:${x.ruolo}`);
            sposta('verifiche', x => x.id);
            sposta('certificati', x => x.id);
            sposta('autocandidature', x => x.id);
            sposta('documenti', x => x.id);
            sposta('referenze', x => x.referenza.id);
        }
        n.posizioni.forEach(pos => { titolarePosizione[pos.id] = n.id; });
        // Le anagrafiche vecchie non si cancellano: si archiviano, con l'accesso
        // chiuso, e rimandano a quella nuova. Email e cellulare si liberano.
        for (const vecchiaId of p.daAnagrafiche) {
            const v = soggetti[vecchiaId];
            if (!v || v.archiviato) continue;
            v.archiviato = { il: p.esito.il, da: p.esito.da, sostituitoDa: n.id, preparazioneId: p.id, emailPrima: v.email, telefonoPrima: v.telefono };
            v.account = { ...v.account, statoPrima: v.account.stato, stato: 'archiviato' };
            v.email = `archiviato+${v.id}@cri-affitti.it`;
            v.telefono = null;
        }
    }
    // Quello che succede all'account nuovo dopo la conferma.
    for (const e of eventi) {
        const s = soggetti[e.soggettoId];
        if (!s?.creazione) continue;
        if (e.tipo === 'password_inviata') s.passwordInviate.push(e);
        else if (e.tipo === 'account_attivato' && s.account.stato === 'da_attivare') s.account = { ...s.account, stato: 'da_verificare', attivatoIl: e.il };
        else if (e.tipo === 'identita_verificata' && s.account.stato === 'da_verificare') {
            s.account = { ...s.account, stato: 'attivo', identitaVerificataIl: e.il, identitaVerificataDa: e.da };
        }
    }

    // Un'anagrafica archiviata rimanda a quella che la sostituisce.
    const risolvi = (id) => {
        let s = soggetti[id];
        for (let i = 0; s?.archiviato && i < 10; i += 1) s = soggetti[s.archiviato.sostituitoDa];
        return s?.id || id;
    };

    const tutti = Object.values(soggetti);
    tutti.forEach(s => { s.nomeCompleto = nomeSoggetto(s); });
    const nomeDi = (id) => soggetti[risolvi(id)]?.nomeCompleto || '';
    for (const s of tutti) {
        const daContratti = (verso) => s.posizioni.filter(p => p.verso === verso).map(p => trovaContrattoAttuale(p.contrattoId)).filter(Boolean);
        if (s.creazione) s.indirizzo = residenzaDi(s);
        Object.assign(s, origineDi(s, { nomeDi, pratichePerId, preparazioniPerId }));
        // La reputazione non si copia mai: si ricalcola dai contratti che l'anagrafica ha adesso.
        s.inquilino = reputazioneInquilino(daContratti('conduttore'));
        s.proprietario = affidabilitaProprietario(daContratti('locatore'), s.documenti);
        s.morosita = MOROSITA.filter(m => s.posizioni.some(p => p.contrattoId === m.contrattoId));
        s.contestazioni = CONTESTAZIONI.filter(k => s.posizioni.some(p => p.contrattoId === k.contrattoId));
        s.legami = legamiDi(s);
        s.ruoli = ruoliDi(s);
    }
    const perNome = (x, y) => x.nomeCompleto.localeCompare(y.nomeCompleto, 'it');
    const attivi = tutti.filter(s => !s.archiviato).sort(perNome);
    const archiviati = tutti.filter(s => s.archiviato).sort(perNome);

    // ── Possibili doppioni ──
    const coppie = {};
    const coppia = (idA, idB) => {
        const id = idCoppia(idA, idB);
        if (!coppie[id]) {
            const [a, b] = [soggetti[idA], soggetti[idB]].sort((x, y) => (x.creatoIl || '').localeCompare(y.creatoIl || ''));
            coppie[id] = { id, a: a.id, b: b.id, regole: [], manuale: null, rilevataIl: null, esito: null };
        }
        return coppie[id];
    };
    // Le anagrafiche archiviate restano fuori, tranne la coppia che uno stesso
    // utente nuovo ha sostituito: resta com'era, finché qualcuno la segna risolta.
    const daAccostare = (x, y) => (!x.archiviato && !y.archiviato)
        || (x.archiviato && y.archiviato && x.archiviato.preparazioneId === y.archiviato.preparazioneId);
    for (const [regola, chiave] of REGOLE) {
        const gruppi = {};
        for (const s of tutti) {
            const k = chiave(s);
            if (k) (gruppi[k] = gruppi[k] || []).push(s);
        }
        for (const gruppo of Object.values(gruppi)) {
            for (let i = 0; i < gruppo.length; i += 1) {
                for (let j = i + 1; j < gruppo.length; j += 1) {
                    if (!daAccostare(gruppo[i], gruppo[j])) continue;
                    const c = coppia(gruppo[i].id, gruppo[j].id);
                    c.regole.push(regola);
                    // Il doppione nasce quando arriva la seconda anagrafica.
                    c.rilevataIl = [gruppo[i].creatoIl, gruppo[j].creatoIl].filter(Boolean).sort().pop() || OGGI;
                }
            }
        }
    }
    for (const e of eventi.filter(x => x.tipo === 'doppione_segnalato')) {
        if (!soggetti[e.a] || !soggetti[e.b]) continue;
        const c = coppia(e.a, e.b);
        c.manuale = e;
        if (!c.rilevataIl) c.rilevataIl = e.il;
    }
    // Lo stato di ogni coppia viene dagli eventi, in ordine. Una coppia con un
    // utente preparato resta in coda anche quando le sue anagrafiche sono
    // archiviate: si chiude solo quando qualcuno la segna risolta. Gli eventi
    // della vecchia unione, se ce ne sono nel browser, non contano più.
    for (const e of eventi.filter(x => x.coppiaId)) {
        const [idA, idB] = e.coppiaId.split('~');
        if (!soggetti[idA] || !soggetti[idB]) continue;
        const c = coppia(idA, idB);
        c.rilevataIl = c.rilevataIl || e.il;
        if (c.esito) continue;
        if (e.tipo === 'doppione_risolto') c.esito = { tipo: 'risolta', nota: e.nota, utenteId: e.utenteId, da: e.da, il: e.il };
        else if (e.tipo === 'soggetti_distinti') c.esito = { tipo: 'distinti', motivo: e.motivo, nota: e.nota, da: e.da, il: e.il };
    }
    const elencoCoppie = Object.values(coppie)
        .map(c => ({
            ...c,
            stato: c.esito ? c.esito.tipo : 'da_rivedere',
            preparazioni: preparazioni.filter(p => p.coppiaId === c.id),
            termine: c.esito ? null : termine(c.rilevataIl, 'lavoroInterno'),
        }))
        .sort((x, y) => (x.esito ? 1 : 0) - (y.esito ? 1 : 0)
            || (x.esito ? (y.esito.il || '').localeCompare(x.esito.il || '') : x.termine.scade.localeCompare(y.termine.scade)));

    // ── Codici fiscali provvisori ──
    const provvisori = attivi
        .filter(s => isCodiceProvvisorio(s.codiceFiscale, s.tipo))
        .map(s => {
            const ultima = s.richiesteCodice[s.richiesteCodice.length - 1] || null;
            return { soggetto: s, codice: s.codiceFiscale, richieste: s.richiesteCodice, ultima, termine: ultima ? termine(ultima.il, 'rispostaCliente') : null };
        });
    const codiciRegolarizzati = tutti
        .filter(s => s.codiceDefinitivo)
        .map(s => ({ soggetto: s, provvisorio: s.codiciPrecedenti[s.codiciPrecedenti.length - 1]?.codice || null, ...s.codiceDefinitivo }));

    // ── Estremi di registrazione ──
    const registrazioni = contrattiAttuali().map(c => {
        const base = REGISTRAZIONI[c.id] || {};
        const ev = eventi.filter(e => e.contrattoId === c.id);
        const doc = documentiAttuali().find(d => d.contrattoId === c.id && d.tipo === 'registrazione');
        const caricata = ev.filter(e => e.tipo === 'ricevuta_caricata').pop();
        const ricevuta = doc
            ? { nome: doc.nome, caricataIl: doc.caricatoIl, documentoId: doc.id }
            : base.ricevuta || (caricata ? { nome: 'Ricevuta di registrazione.pdf', caricataIl: caricata.il } : null);
        const richieste = [...(base.richieste || []), ...ev.filter(e => e.tipo === 'ricevuta_chiesta')];
        const inserito = ev.filter(e => e.tipo === 'estremi_inseriti').pop();
        const inserimento = inserito || base.inserimento || null;
        const stato = inserimento ? 'completa' : ricevuta ? 'da_inserire' : 'senza_ricevuta';
        const ultimaRichiesta = richieste[richieste.length - 1] || null;
        return {
            contrattoId: c.id,
            contratto: c,
            dichiarati: c.registrazione,
            estremi: inserito?.estremi || c.registrazione,
            ricevuta,
            richieste,
            ultimaRichiesta,
            inserimento,
            stato,
            termine: stato === 'da_inserire' ? termine(ricevuta.caricataIl, 'lavoroInterno')
                : stato === 'senza_ricevuta' && ultimaRichiesta ? termine(ultimaRichiesta.il, 'rispostaCliente') : null,
            contrattoInVerifica: documentiAttuali().find(d => d.contrattoId === c.id && d.tipo === 'contratto' && d.stato !== 'verificato') || null,
        };
    });
    const registrazionePer = Object.fromEntries(registrazioni.map(r => [r.contrattoId, r]));

    // ── Immobili ──
    const costruisciImmobile = (i) => {
        const contratti = (i.contratti || []).map(trovaContrattoAttuale).filter(Boolean);
        const prat = (i.pratiche || []).map(id => pratichePerId[id]).filter(Boolean);
        const dati = contratti[0]?.immobile || prat[0]?.immobile;
        if (!dati) return null;
        return {
            id: i.id,
            codice: i.id.toUpperCase(),
            inseritoIl: i.inseritoIl,
            dati,
            contratti,
            pratiche: prat,
            stato: contratti.length || prat.some(p => p.stato === 'attiva') ? 'attivo' : 'in_pratica',
            titolarita: i.titolarita.map(t => ({
                ...t,
                soggetto: t.soggettoId ? soggetti[risolvi(t.soggettoId)] || null : null,
                documento: t.documentoId ? documentiAttuali().find(d => d.id === t.documentoId) || null : null,
            })),
        };
    };
    const conPratica = new Set(IMMOBILI.flatMap(i => i.pratiche || []));
    const immobili = [
        ...IMMOBILI,
        // Le pratiche aperte nel browser portano immobili nuovi, senza storia di titolarità.
        ...pratiche.filter(p => !conPratica.has(p.id)).map(p => ({
            id: `imm-${p.id}`, inseritoIl: p.apertaIl, pratiche: [p.id],
            titolarita: [{ soggettoId: p.personaId, titolo: 'proprietario', quota: 100, dal: null, al: null, fonte: 'dichiarazione', registrataDa: null, registrataIl: p.apertaIl }],
        })),
    ].map(costruisciImmobile).filter(Boolean);

    const trovaImmobile = (id) => immobili.find(i => i.id === id || i.contratti.some(c => c.id === id) || i.pratiche.some(p => p.id === id)) || null;

    return {
        soggetti: tutti,
        attivi,
        archiviati,
        trova: (id) => soggetti[id] || null,
        risolvi,
        // Chi tiene la posizione adesso: la parte del contratto, o l'utente nuovo a cui è passata.
        soggettoDi: (contratto, verso) => soggetti[titolarePosizione[`pos-${contratto?.id}-${verso}`]]
            || soggetti[risolvi(soggettoDellaParte(contratto, verso))] || null,
        pratica: (id) => pratichePerId[id] || null,
        preparazioni,
        preparazione: (id) => preparazioniPerId[id] || null,
        coppie: elencoCoppie,
        provvisori,
        codiciRegolarizzati,
        registrazioni,
        registrazioneDi: (contrattoId) => registrazionePer[contrattoId] || null,
        immobili,
        trovaImmobile,
        eventi,
    };
};

/** Tutto il modello dell'anagrafica, con le azioni fatte nel browser. */
export const useAnagrafica = () => {
    const contratti = useContratti();
    const documenti = useDocumenti();
    const stato = store.useStore();
    const pratiche = useTutteLePratiche();
    const autocandidature = useTutteLeAutocandidature();
    const verifiche = useTutteLeVerifiche();
    const certificati = useTuttiICertificati();
    const persone = usePersone();
    return useMemo(
        () => costruisci({ eventi: eventiDi(stato), pratiche, autocandidature, verifiche, certificati, persone }),
        // «contratti» non si legge qui dentro: serve a rifare il modello quando
        // arrivano dal database, perché costruisci li prende da sé.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [stato, pratiche, autocandidature, verifiche, certificati, persone, contratti, documenti],
    );
};

// Le coppie aperte che riguardano un soggetto: servono alla scheda e all'elenco.
export const coppieAperteDi = (modello, soggettoId) =>
    modello.coppie.filter(c => !c.esito && (c.a === soggettoId || c.b === soggettoId));

// Il nome di chi sta per nascere, dall'anagrafica di una preparazione.
export const nomeDaAnagrafica = (a = {}) => (a.tipo === 'giuridica' ? a.ragioneSociale || '' : `${a.nome || ''} ${a.cognome || ''}`.trim());

/** Le voci dello storico di un'anagrafica, come si scelgono una per una quando si rifà un utente. */
export const vociStorico = (s, modello) => ({
    posizioni: s.posizioni.map(p => {
        const c = trovaContrattoAttuale(p.contrattoId);
        return {
            id: p.id,
            verso: p.verso,
            etichetta: `${VERSO[p.verso].etichetta} · ${c.immobile.indirizzo}, ${c.immobile.citta}`,
            nota: `${nomeProdotto(c.prodotto)}, dal ${fmtData(c.inizio)}: l’immobile, i mesi e i pagamenti vengono con il contratto`,
        };
    }),
    pratiche: s.pratiche.map(r => {
        const p = modello.pratica(r.praticaId);
        const come = { proprietario: 'Pratica da proprietario', candidato: 'Candidatura', inquilino_attuale: 'Inquilino attuale', firmataria: 'Firma per la società' }[r.ruolo] || 'Pratica';
        return { id: `${r.praticaId}:${r.ruolo}`, ruolo: r.ruolo, etichetta: `${come} · ${p?.immobile.indirizzo || r.praticaId}`, nota: p ? `${nomeProdotto(p.prodotto)}, aperta il ${fmtData(p.apertaIl)}` : null };
    }),
    verifiche: s.verifiche.map(v => ({ id: v.id, etichetta: `Verifica chiesta il ${fmtData(v.richiestaIl)}`, nota: v.stato === 'in_corso' ? 'In corso' : 'Conclusa' })),
    certificati: s.certificati.map(c => ({ id: c.id, etichetta: `Certificato emesso il ${fmtData(c.emessoIl)}`, nota: c.revocatoIl ? 'Revocato' : null })),
    autocandidature: s.autocandidature.map(a => ({ id: a.id, etichetta: `Autocandidatura aperta il ${fmtData(a.apertaIl)}`, nota: null })),
    documenti: s.documenti.map(d => ({ id: d.id, etichetta: d.etichetta, nota: [d.file, d.il && fmtData(d.il)].filter(Boolean).join(' · ') || null })),
    referenze: s.referenze.map(({ autocandidatura, referenza }) => ({
        id: referenza.id,
        etichetta: `Referenza per ${modello.trova(modello.risolvi(autocandidatura.personaId))?.nomeCompleto || '—'}`,
        nota: referenza.immobile,
    })),
});

/**
 * I ruoli scelti a mano contro quello che l'utente porta con sé: una posizione
 * senza il ruolo non si vede; un ruolo in più apre dati che non servono.
 * @returns {string[]}
 */
export const avvisiRuoli = ({ ruoli = [], storico = {}, daAnagrafiche = [] }, modello) => {
    const porta = { locatore: false, conduttore: false, praticaProprietario: false, verifiche: false };
    for (const id of daAnagrafiche) {
        const v = modello.trova(id);
        const scelte = storico[id] || {};
        if (!v) continue;
        v.posizioni.filter(p => (scelte.posizioni || []).includes(p.id)).forEach(p => { porta[p.verso] = true; });
        if ((scelte.pratiche || []).some(k => k.endsWith(':proprietario'))) porta.praticaProprietario = true;
        if ((scelte.verifiche || []).length) porta.verifiche = true;
    }
    const daProprietario = porta.locatore || porta.praticaProprietario;
    const rifacendo = daAnagrafiche.length > 0;
    return [
        daProprietario && !ruoli.includes('proprietario') && 'Porta posizioni o pratiche da proprietario ma non ha il ruolo di proprietario: non le vedrebbe.',
        rifacendo && !daProprietario && ruoli.includes('proprietario') && 'Ha il ruolo di proprietario ma non porta niente da proprietario: la sua area partirà vuota. Va bene solo se sta per mettere un immobile su CRIA.',
        porta.conduttore && !ruoli.includes('inquilino') && 'Porta un contratto da inquilino ma non ha il ruolo di inquilino: non lo vedrebbe.',
        rifacendo && !porta.conduttore && ruoli.includes('inquilino') && 'Ha il ruolo di inquilino ma non porta nessun contratto da inquilino: la sua area partirà vuota.',
        porta.verifiche && !ruoli.includes('cliente_verifica') && 'Porta richieste CRIA Verifica ma non ha il ruolo di cliente: non le vedrebbe.',
        ruoli.some(r => RUOLI_UTENTE[r]?.collaboratore) && 'Commerciale e avvocato vedono dati di altri clienti: servono solo se la persona lavora con CRIA.',
    ].filter(Boolean);
};

// ─── Una persona, una volta sola: chi usa già un recapito ─────────────────────
// La registrazione controlla con lib/unicita.js sui dati demo. Qui serve il
// modello, perché sa quali account sono stati archiviati nel browser (email e
// cellulare liberati) e quali utenti aspettano la conferma.
const NORME = { email: normalizzaEmail, telefono: normalizzaTelefono, codiceFiscale: normalizzaCodiceFiscale };
const COLLABORATORI = [
    ...PERSONE_DEMO.filter(p => (p.aree || []).some(a => AREE_COLLABORATORI.includes(a)))
        .map(p => ({ nome: `${p.nome} ${p.cognome}`, email: p.email, telefono: p.telefono, codiceFiscale: p.codiceFiscale })),
    ...OPERATORI.map(o => ({ nome: nomeOperatore(o.id), email: o.email })),
];

/**
 * @param {'email' | 'telefono' | 'codiceFiscale'} campo
 * @param {{ tranne?: string }} opzioni  tranne: la preparazione da non contare (quella che si sta confermando)
 * @returns {null | { tipo: 'soggetto' | 'preparazione' | 'collaboratore', nome: string, soggetto?: object, preparazione?: object }}
 */
export const chiUsa = (modello, campo, valore, { tranne = null } = {}) => {
    const norma = NORME[campo];
    const v = norma(valore);
    if (!v) return null;
    const soggetto = modello.attivi.find(s => norma(s[campo]) === v);
    if (soggetto) return { tipo: 'soggetto', soggetto, nome: soggetto.nomeCompleto };
    const preparazione = modello.preparazioni.find(p => p.stato === 'da_confermare' && p.id !== tranne
        && norma(campo === 'codiceFiscale' ? p.anagrafica.codiceFiscale : p.credenziali[campo]) === v);
    if (preparazione) return { tipo: 'preparazione', preparazione, nome: nomeDaAnagrafica(preparazione.anagrafica) };
    const collaboratore = COLLABORATORI.find(c => norma(c[campo]) === v);
    return collaboratore ? { tipo: 'collaboratore', nome: collaboratore.nome } : null;
};

// ─── Riepilogo per la panoramica per funzione (O-01) ──────────────────────────
// Una voce per coda. «urgenti» sono quelle oltre il termine.
export const useRiepilogoAnagrafica = () => {
    const modello = useAnagrafica();
    return useMemo(() => {
        const daEsaminare = modello.coppie.filter(c => c.stato === 'da_rivedere');
        const daConfermare = modello.preparazioni.filter(p => p.stato === 'da_confermare');
        const aperte = modello.registrazioni.filter(r => r.stato !== 'completa');
        const conta = (elenco, fn) => elenco.filter(fn).length;
        return [
            {
                chiave: 'doppioni',
                funzione: 'istruttoria',
                etichetta: 'Possibili doppioni da esaminare',
                valore: daEsaminare.length,
                urgenti: conta(daEsaminare, c => c.termine.scaduto),
                nota: `Da esaminare entro ${TERMINI_ANAGRAFICA.lavoroInterno.giorni} giorni lavorativi: il sistema segnala, una persona decide`,
                percorso: PERCORSI.revisione,
            },
            {
                chiave: 'utenti_da_confermare',
                funzione: 'responsabile_operativo',
                etichetta: 'Utenti creati da CRIA da confermare',
                valore: daConfermare.length,
                urgenti: conta(daConfermare, p => termine(p.preparatoIl, 'lavoroInterno').scaduto),
                nota: `Chi prepara l’utente non lo conferma. Da confermare entro ${TERMINI_ANAGRAFICA.lavoroInterno.giorni} giorni lavorativi`,
                percorso: PERCORSI.soggetti,
            },
            {
                chiave: 'codici_provvisori',
                funzione: 'istruttoria',
                etichetta: 'Codici fiscali provvisori',
                valore: modello.provvisori.length,
                urgenti: conta(modello.provvisori, p => p.termine?.scaduto),
                nota: 'Urgente quando la persona non ha mandato il codice definitivo entro il termine',
                percorso: PERCORSI.revisione,
            },
            {
                chiave: 'registrazioni',
                funzione: 'istruttoria',
                etichetta: 'Estremi di registrazione senza ricevuta o da inserire',
                valore: aperte.length,
                urgenti: conta(aperte, r => r.termine?.scaduto),
                nota: `${conta(aperte, r => r.stato === 'da_inserire')} con la ricevuta arrivata, ${conta(aperte, r => r.stato === 'senza_ricevuta')} senza ricevuta`,
                percorso: PERCORSI.registrazioni,
            },
        ];
    }, [modello]);
};
