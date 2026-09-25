// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  CRIA — genera_dati_prova.mjs                                            ║
// ║  Si esegue con: node db/seed/genera_dati_prova.mjs                       ║
// ║  Poi si carica il file prodotto: db/seed/dati_prova_lotto1.sql           ║
// ╚══════════════════════════════════════════════════════════════════════════╝
// Copia i dati di prova dei mockup nel database: prodotti, immobili,
// titolarità, persone senza account, contratti, posizioni, mesi del canone,
// segnalazioni e copertura. Scrive un file SQL, non tocca il database.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { createServer } from '/Volumes/bat-mac/CRIA/node_modules/vite/dist/node/index.js';

const require = createRequire('/Volumes/bat-mac/CRIA/apps/web/package.json');
const React = require('react');
const { renderToString } = require('react-dom/server');
globalThis.window = { dispatchEvent() {}, addEventListener() {}, removeEventListener() {} };

const server = await createServer({
    root: '/Volumes/bat-mac/CRIA/apps/web',
    configFile: '/Volumes/bat-mac/CRIA/apps/web/vite.config.js',
    server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error',
    // Il generatore legge i dati di prova come li vede il modo demo: senza
    // questo, le fonti che ora leggono dal database tornerebbero vuote.
    define: { 'import.meta.env.VITE_ACCESSO_DEMO': '"1"' },
});
const L = await server.ssrLoadModule('/src/lib/anagraficheDemo.js');
const D = await server.ssrLoadModule('/src/data/datiDemo.js');
const C = await server.ssrLoadModule('/src/data/catalogo.js');
const P = await server.ssrLoadModule('/src/data/pratiche.js');
const PR = P;
const G = await server.ssrLoadModule('/src/data/garanzia.js');
const V = await server.ssrLoadModule('/src/data/verifiche.js');
const A = await server.ssrLoadModule('/src/data/autocandidature.js');
const CE = await server.ssrLoadModule('/src/data/certificati.js');
let m; renderToString(React.createElement(() => { m = L.useAnagrafica(); return null; }));

// ─── Aiuti ───────────────────────────────────────────────────────────────────
const q = (v) => (v == null || v === '' ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const n = (v) => (v == null ? 'null' : Number(v));
const b = (v) => (v ? 'true' : 'false');
const j = (v) => (v == null ? 'null' : `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`);
const righe = [];
const scrivi = (s) => righe.push(s);

// ─── Persone già nel database ────────────────────────────────────────────────
// Quelle con un account (mario, giulia, verdi…) ci sono già: si riconoscono
// dal codice_demo. Le altre — controparti dei contratti, candidati, referenze —
// nascono qui come soggetti senza account.
const CON_ACCOUNT = new Set(['mario', 'giulia', 'verdi', 'martina', 'anna', 'elena', 'sara', 'paolo', 'admin']);
const STATO_IDENTITA = { attivo: 'verificato', da_verificare: 'in_attesa', da_attivare: 'non_caricato', invitato: 'non_caricato', senza_account: 'non_caricato' };

const nuovi = m.attivi.filter(s => !CON_ACCOUNT.has(s.id));
// Email, cellulare e codice fiscale non si ripetono: se un soggetto porta un
// recapito già usato (la rappresentante con i recapiti della società) il
// recapito si lascia vuoto, la persona resta.
const usati = { email: new Set(), telefono: new Set(), cf: new Set() };
m.attivi.filter(s => CON_ACCOUNT.has(s.id)).forEach(s => {
    if (s.email) usati.email.add(s.email.toLowerCase());
    if (s.telefono) usati.telefono.add(s.telefono.replace(/[^0-9+]/g, ''));
    if (s.codiceFiscale) usati.cf.add(s.codiceFiscale.toUpperCase());
});
const saltati = [];

scrivi('-- Persone senza account: controparti dei contratti, candidati, referenze.');
nuovi.forEach(s => {
    const email = s.email && !usati.email.has(s.email.toLowerCase()) ? s.email : null;
    const tel = s.telefono && !usati.telefono.has(s.telefono.replace(/[^0-9+]/g, '')) ? s.telefono : null;
    const cf = s.codiceFiscale && !usati.cf.has(s.codiceFiscale.toUpperCase()) ? s.codiceFiscale : null;
    if (s.email && !email) saltati.push(`${s.nomeCompleto}: email già usata`);
    if (s.telefono && !tel) saltati.push(`${s.nomeCompleto}: cellulare già usato`);
    if (s.codiceFiscale && !cf) saltati.push(`${s.nomeCompleto}: codice fiscale già usato`);
    if (email) usati.email.add(email.toLowerCase());
    if (tel) usati.telefono.add(tel.replace(/[^0-9+]/g, ''));
    if (cf) usati.cf.add(cf.toUpperCase());
    scrivi(`insert into public.persone (codice_demo, tipo, nome, cognome, ragione_sociale, partita_iva, codice_fiscale, data_nascita, luogo_nascita, email, telefono, indirizzo, stato_identita)
values (${q(s.id)}, ${q(s.tipo)}, ${q(s.nome || null)}, ${q(s.cognome || null)}, ${q(s.ragioneSociale || null)}, ${q(s.partitaIva || null)}, ${q(cf)}, ${q(s.dataNascita)}, ${q(s.luogoNascita)}, ${q(email)}, ${q(tel)}, ${j(s.indirizzo || null)}, ${q(STATO_IDENTITA[s.account.stato] || 'non_caricato')});`);
});

// ─── Prodotti ────────────────────────────────────────────────────────────────
const MODELLO = { P1: 'percentuale_canone', P1E: 'percentuale_canone', P2: 'percentuale_canone', P5: 'abbonamento_annuo', P3: 'una_tantum', P6: 'abbonamento_mensile', P7: 'una_tantum' };
const PER_CLIENTE = { P1: 'proprietario', P1E: 'proprietario', P2: 'proprietario', P5: 'proprietario', P3: 'occasionale', P6: 'agenzia', P7: 'inquilino' };
scrivi('\n-- Il listino, com\'è oggi nel catalogo del codice.');
Object.entries(C.PRODOTTI).forEach(([codice, p], i) => {
    scrivi(`insert into public.prodotti (codice, nome, descrizione, per_cliente, modello_prezzo, percentuale_canone, prezzo, prezzo_annuo, prezzo_mensile, quota_app_annua, garanzia, franchigia_mesi, incassa, attivo, ordine)
values (${q(codice)}, ${q(p.variante ? `${p.nome} · ${p.variante}` : p.nome)}, ${q(p.sintesi)}, ${q(PER_CLIENTE[codice])}, ${q(MODELLO[codice])}, ${n(p.percentuale)}, ${n(p.prezzo)}, ${n(p.prezzoAnnuo)}, ${n(p.prezzoMensile)}, ${n(p.quotaAppAnnua)}, ${b(p.garanzia)}, ${n(p.franchigiaMesi)}, ${q(p.incassa || 'non_applicabile')}, true, ${i + 1})
on conflict (codice) do nothing;`);
});

// ─── Immobili e titolarità ───────────────────────────────────────────────────
const idImmobile = {};   // contrattoId → codice dell'immobile
scrivi('\n-- Gli immobili, con il loro codice e chi ne è titolare.');
m.immobili.forEach(im => {
    const d = im.dati;
    scrivi(`insert into public.immobili (codice, codice_demo, indirizzo, cap, citta, provincia, latitudine, longitudine, tipologia, mq, catastale, stato, inserito_il, di_prova)
values (${q(im.codice)}, ${q(im.id)}, ${q(d.indirizzo)}, ${q(d.cap)}, ${q(d.citta)}, ${q(d.provincia)}, ${n(d.lat)}, ${n(d.lng)}, ${q(d.tipologia)}, ${n(d.mq)}, ${j(d.catasto ? { descrizione: d.catasto } : null)}, ${q(im.stato === 'in_pratica' ? 'in_pratica' : 'attivo')}, ${q(im.inseritoIl)}, true);`);
    (im.contratti || []).forEach(c => { idImmobile[c.id] = im.codice; });
    (im.titolarita || []).forEach(t => {
        scrivi(`insert into public.titolarita (immobile_id, persona_id, tipo, quota, dal, al)
select i.id, p.id, ${q(t.titolo === 'gestore' ? 'gestore' : 'proprietario')}, ${n(t.quota)}, ${q(t.dal)}, ${q(t.al)}
  from public.immobili i, public.persone p where i.codice = ${q(im.codice)} and p.codice_demo = ${q(t.soggettoId)};`);
    });
});

// ─── Contratti, posizioni, mesi ──────────────────────────────────────────────
const STATO_MESE = {
    pagato: 'segnalato_pagato', pagato_cria: 'verificato', insoluto: 'insoluto',
    contestato: 'contestato', in_attesa: 'segnalato_non_pagato', non_rilevato: 'non_rilevato',
};
const FONTE = { proprietario: 'locatore', cria: 'cria', automatica: 'automatica' };
const giornoScadenza = C.PARAMETRI?.giornoScadenzaCanone || 5;

scrivi('\n-- I contratti: il codice è la causale del bonifico.');
D.CONTRATTI.forEach(c => {
    const p = C.PRODOTTI[c.prodotto];
    const incassaCria = p.incassa === 'cria';
    scrivi(`insert into public.contratti (codice, codice_demo, immobile_id, prodotto, canone, giorno_scadenza, data_inizio, data_fine, durata_testo, deposito, attivo_dal, stato, stato_prodotto, registrazione_numero, registrazione_data, registrazione_ufficio, storico_inquilini, di_prova)
select ${q(c.codiceUnivoco)}, ${q(c.id)}, i.id, ${q(c.prodotto)}, ${n(c.canone)}, ${giornoScadenza}, ${q(c.inizio)}, ${q(c.fine)}, ${q(c.durata)}, ${n(c.deposito)}, ${q(`${c.attivoDal}-01`)}, 'attivo', 'attivo', ${q(c.registrazione?.numero)}, ${q(c.registrazione?.data)}, ${q(c.registrazione?.ufficio)}, ${j(c.storicoInquilini?.length ? c.storicoInquilini : null)}, true
  from public.immobili i where i.codice = ${q(idImmobile[c.id])};`);

    // Le posizioni: il verso del legame fra persona e contratto.
    m.attivi.forEach(s => (s.posizioni || []).filter(pos => pos.contrattoId === c.id).forEach(pos => {
        scrivi(`insert into public.posizioni (contratto_id, persona_id, verso, dal, al)
select k.id, p.id, ${q(pos.verso)}, ${q(pos.dal)}, ${q(pos.al)}
  from public.contratti k, public.persone p where k.codice = ${q(c.codiceUnivoco)} and p.codice_demo = ${q(s.id)};`);
    }));

    // I mesi: quanto era atteso, quanto è arrivato, e cosa è stato segnalato.
    c.mesi.forEach(mese => {
        const stato = mese.stato === 'pagato' && incassaCria ? STATO_MESE.pagato_cria : STATO_MESE[mese.stato];
        const commissione = incassaCria && p.percentuale ? Math.round(c.canone * p.percentuale) / 100 : null;
        scrivi(`insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, ${q(mese.mese)}, ${n(c.canone)}, ${n(mese.pagatoIl ? c.canone : null)}, ${q(mese.pagatoIl)}, ${n(mese.giorno)}, ${q(stato)}, ${q(FONTE[mese.segnalazione?.fonte] || null)}, ${n(commissione)}, ${q(mese.bonificoIl)}, ${n(mese.bonificoIl ? Math.round((c.canone - commissione) * 100) / 100 : null)}
  from public.contratti k where k.codice = ${q(c.codiceUnivoco)};`);
        if (mese.segnalazione) {
            const tardiva = mese.copertura === 'decaduta_tardiva';
            scrivi(`insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, ${q(mese.mese)}, ${q(mese.segnalazione.tipo)}, ${q(FONTE[mese.segnalazione.fonte])}, ${q(mese.segnalazione.il)}::timestamptz, ${b(tardiva)}, ${b(mese.segnalazione.tipo === 'non_pagato')}, ${b(!!mese.contestazioneId)}
  from public.contratti k where k.codice = ${q(c.codiceUnivoco)};`);
        }
        if (mese.copertura) {
            scrivi(`insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, ${q(mese.mese)}, ${q(mese.copertura)}, ${q(mese.segnalazione?.il || null)}
  from public.contratti k where k.codice = ${q(c.codiceUnivoco)};`);
        }
    });
});

// ─── Documenti ───────────────────────────────────────────────────────────────
// I documenti dei mockup: la riga c'è, il file no. Quelli veri arrivano
// quando qualcuno ne carica uno dall'area.
const TIPO_DOC = { identita: 'identita', contratto: 'contratto', registrazione: 'registrazione', visura: 'visura', visura_camerale: 'visura_camerale' };
scrivi('\n-- I documenti: riga senza file, il magazzino si riempie dall\'uso.');
D.DOCUMENTI.forEach(d => {
    const suContratto = Boolean(d.contrattoId);
    scrivi(`insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, stato, caricato_il, di_prova)
select p.id, ${q(suContratto ? 'contratto' : 'persona')}, ${suContratto ? `(select k.id from public.contratti k where k.codice_demo = ${q(d.contrattoId)})` : 'p.id'}, ${q(TIPO_DOC[d.tipo] || d.tipo)}, ${q(d.nome)}, ${q(d.stato)}, ${q(d.caricatoIl)}::timestamptz, true
  from public.persone p where p.codice_demo = ${q(d.personaId)};`);
});


// ─── Conversazioni ───────────────────────────────────────────────────────────
// Qualche filo con i clienti, per provare la chat: chi scrive, chi risponde, e
// una nota interna che il cliente non deve vedere.
const CONVERSAZIONI = [
    {
        oggetto: 'Domanda su CRIA Gestione', categoria: 'prodotti', area: 'locatore', stato: 'aperto', di: 'mario',
        messaggi: [
            ['mario', '2026-09-03 10:30', 'Salve, vorrei capire meglio cosa comprende CRIA Gestione.'],
            ['nicola', '2026-09-03 14:15', 'Buongiorno! Comprende la segnalazione mensile con i promemoria, il semaforo del suo inquilino, le contestazioni decise da CRIA e la garanzia dopo la franchigia.'],
            ['nicola', '2026-09-04 09:30', 'Il prezzo non si chiede: esce dal listino e dal canone dichiarato, e lo vede al momento del pagamento.'],
        ],
    },
    {
        oggetto: 'Cambio IBAN per i bonifici', categoria: 'pagamenti', area: 'locatore', stato: 'in_corso', di: 'mario',
        messaggi: [
            ['mario', '2026-09-08 16:00', 'Devo cambiare IBAN per ricevere i bonifici di CRIA Completo. Come procedo?'],
            ['nicola', '2026-09-09 09:00', 'Carichi il documento con il nuovo IBAN dalla pagina Documenti: lo verifichiamo e lo sostituiamo.'],
            ['mario', '2026-09-10 10:30', 'Caricato.'],
        ],
    },
    {
        oggetto: 'Il semaforo di agosto', categoria: 'semaforo', area: 'inquilino', stato: 'in_corso', di: 'giulia',
        messaggi: [
            ['giulia', '2026-09-05 08:20', 'Agosto risulta contestato ma avevo pagato il 1°. Il semaforo ne risente?'],
            ['nicola', '2026-09-05 11:40', 'No: la contestazione è stata accolta e il mese conta come pagato il 2. Il semaforo si rifà da solo.'],
            ['giulia', '2026-09-05 12:02', 'Perfetto, grazie.'],
        ],
    },
    {
        oggetto: 'Come si contesta una segnalazione', categoria: 'contestazioni', area: 'inquilino', stato: 'risolto', di: 'giulia',
        messaggi: [
            ['giulia', '2026-08-12 18:05', 'Dove trovo il pulsante per contestare?'],
            ['nicola', '2026-08-13 09:10', 'Nella pagina Segnalazioni, sul mese segnalato: c\'è tempo cinque giorni dalla segnalazione.'],
        ],
    },
    {
        oggetto: 'Chiedo di rateizzare', categoria: 'morosita', area: 'inquilino', stato: 'aperto', di: 'martina',
        messaggi: [
            ['martina', '2026-09-11 09:15', 'Sono in difficoltà con luglio. Posso pagare a rate?'],
            ['nicola', '2026-09-11 15:30', 'Sì: il piano glielo propone il gestore della pratica, e lo approva il responsabile legale. La ricontattiamo noi.'],
            ['nicola', '2026-09-11 15:32', 'Nota interna: prima rata già pagata il 19 agosto, il piano è in corso.', true],
        ],
    },
    {
        oggetto: 'Documenti per Via Tortona 27', categoria: 'documenti', area: 'locatore', stato: 'aperto', di: 'verdi',
        messaggi: [
            ['verdi', '2026-09-09 11:00', 'Il contratto registrato di Via Tortona risulta ancora in verifica.'],
            ['nicola', '2026-09-09 16:20', 'È in coda all\'istruttoria: se manca qualcosa le scriviamo qui con il motivo.'],
        ],
    },
];

scrivi('\n-- Le conversazioni con i clienti, con i loro messaggi.');
CONVERSAZIONI.forEach((k, i) => {
    const ultimo = k.messaggi[k.messaggi.length - 1][1];
    scrivi(`insert into public.conversazioni (codice, oggetto, categoria, area, aperta_da, stato, creato_il, ultimo_messaggio_il, chiusa_il, di_prova)
select ${q(`ASS-2026-${String(i + 1).padStart(4, '0')}`)}, ${q(k.oggetto)}, ${q(k.categoria)}, ${q(k.area)}, p.id, ${q(k.stato)}, ${q(k.messaggi[0][1])}::timestamptz, ${q(ultimo)}::timestamptz, ${k.stato === 'risolto' ? `${q(ultimo)}::timestamptz` : 'null'}, true
  from public.persone p where p.codice_demo = ${q(k.di)};`);
    k.messaggi.forEach(([chi, quando, testo, interno]) => {
        const daCria = chi !== k.di;
        scrivi(`insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, ${b(daCria)}, ${b(Boolean(interno))}, ${q(testo)}, ${q(quando)}::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = ${q(`ASS-2026-${String(i + 1).padStart(4, '0')}`)} and p.codice_demo = ${q(chi)};`);
    });
});


// ─── Pratiche ────────────────────────────────────────────────────────────────
// Le pratiche dei mockup: le colonne che servono alle regole, e il resto in
// `dati` finché non serve interrogarlo.
const STATO_LUNGO = { documenti: 'documenti_caricati', istruttoria: 'in_verifica', pagamento: 'in_attesa_pagamento', firma: 'in_attesa_firma', attiva: 'attiva', respinta: 'respinta' };
const immobileDellaPratica = {};
m.immobili.forEach(im => (im.pratiche || []).forEach(pr => { immobileDellaPratica[pr.id || pr] = im.codice; }));

scrivi('\n-- Le pratiche, con quello che le schermate mostrano.');
P.PRATICHE.forEach(pr => {
    const { id, personaId, prodotto, canone, stato, apertaIl, quotaPagataIl, ...resto } = pr;
    scrivi(`insert into public.pratiche (codice, persona_id, tipo_flusso, prodotto, stato, canone, aperta_il, quota_pagata_il, dati, di_prova)
select ${q(id)}, p.id, 'AB', ${q(prodotto)}, ${q(STATO_LUNGO[stato] || 'documenti_caricati')}, ${n(canone)}, ${q(apertaIl)}::timestamptz, ${q(quotaPagataIl)}, ${j(resto)}, true
  from public.persone p where p.codice_demo = ${q(personaId)};`);
    if (immobileDellaPratica[id]) {
        scrivi(`insert into public.pratiche_immobili (pratica_id, immobile_id, canone)
select pr.id, i.id, ${n(canone)} from public.pratiche pr, public.immobili i
 where pr.codice = ${q(id)} and i.codice = ${q(immobileDellaPratica[id])};`);
    }
});


// ─── Garanzia: morosità, contatti, piani, rate, indennizzi ───────────────────
// Le colonne che servono alle regole; il resto (eventi, note, richieste al
// legale) in `dati`, come per le pratiche.
const STATO_MOR = { aperta: 'aperta', in_contatto: 'in_contatto', piano_proposto: 'piano_proposto', piano_in_corso: 'piano_attivo', al_legale: 'passata_al_legale', chiusa: 'chiusa' };
const COLONNE_MOR = new Set(['id', 'contrattoId', 'mesi', 'importo', 'apertaIl', 'chiusaIl', 'esito', 'gestoreId', 'assegnataIl', 'contatti', 'piano', 'primoContattoIl', 'note']);
const perIdBackoffice = Object.fromEntries(G.PRATICHE_BACKOFFICE.map(x => [x.id, x]));

scrivi('\n-- Le pratiche di morosità, con contatti, piani e rate.');
PR.MOROSITA.forEach(mor => {
    const b = perIdBackoffice[mor.id] || {};
    const unito = { ...mor, ...b };
    const dati = Object.fromEntries(Object.entries(unito).filter(([k]) => !COLONNE_MOR.has(k)));
    scrivi(`insert into public.pratiche_morosita (codice, contratto_id, mesi, importo, aperta_il, chiusa_il, esito, gestore_id, assegnata_il, stato, primo_contatto_il, dati, di_prova)
select ${q(mor.id)}, k.id, ${unito.mesi ? `array[${unito.mesi.map(q).join(', ')}]` : 'null'}, ${n(unito.importo)}, ${q(unito.apertaIl)}, ${q(unito.chiusaIl)}, ${q(unito.esito)},
       (select p.id from public.persone p where p.codice_demo = ${q(b.gestoreId || 'giorgio')}), ${q(b.assegnataIl)}, ${q(STATO_MOR[unito.stato] || 'aperta')},
       ${q((b.contatti || [])[0]?.il)}, ${j(dati)}, true
  from public.contratti k where k.codice_demo = ${q(mor.contrattoId)};`);

    (b.note || []).forEach(nt => {
        scrivi(`insert into public.note_interne (entita_tipo, entita_id, autore_id, testo, il, di_prova)
select 'morosita', m.id, (select p.id from public.persone p where p.codice_demo = ${q(nt.autore || 'giorgio')}), ${q(nt.testo)}, ${q(nt.il)}::timestamptz, true
  from public.pratiche_morosita m where m.codice = ${q(mor.id)};`);
    });

    (b.contatti || []).forEach(ct => {
        scrivi(`insert into public.contatti_morosita (morosita_id, il, canale, esito, nota, da_persona)
select m.id, ${q(`${ct.il} ${ct.ora}`)}::timestamptz, ${q(ct.canale)}, ${q(ct.esito)}, ${q(ct.nota || null)},
       (select p.id from public.persone p where p.codice_demo = ${q(ct.registratoDa || 'giorgio')})
  from public.pratiche_morosita m where m.codice = ${q(mor.id)};`);
    });

    const pianoInterno = b.piano;
    const rate = mor.piano?.rate || [];
    if (pianoInterno || rate.length) {
        const totale = rate.reduce((s, r) => s + r.importo, 0) || unito.importo;
        scrivi(`insert into public.piani_rientro (morosita_id, proposto_da, proposto_il, approvato_da, approvato_il, accettato_il, nota, n_rate, importo_totale, prima_scadenza, stato)
select m.id,
       (select p.id from public.persone p where p.codice_demo = ${q(pianoInterno?.propostoDa || 'giorgio')}), ${q(pianoInterno?.propostoIl || mor.apertaIl)}::timestamptz,
       (select p.id from public.persone p where p.codice_demo = ${q(pianoInterno?.approvatoDa || 'laura')}), ${q(pianoInterno?.approvatoIl)}::timestamptz,
       ${q(pianoInterno?.accettatoIl)}, ${q(pianoInterno?.nota || null)}, ${rate.length || 1}, ${n(totale)}, ${q(rate[0]?.scadenza)}, ${q(pianoInterno?.approvatoIl ? 'attivo' : 'proposto')}
  from public.pratiche_morosita m where m.codice = ${q(mor.id)};`);
        rate.forEach(r => {
            scrivi(`insert into public.rate_rientro (piano_id, numero, scadenza, importo, pagata_il, stato)
select pi.id, ${r.n}, ${q(r.scadenza)}, ${n(r.importo)}, ${q(r.pagataIl || null)}, ${q(r.pagataIl ? 'pagata' : 'attesa')}
  from public.piani_rientro pi join public.pratiche_morosita m on m.id = pi.morosita_id where m.codice = ${q(mor.id)};`);
            if (r.pagataIl) {
                scrivi(`insert into public.recuperi (morosita_id, data, importo, fonte)
select m.id, ${q(r.pagataIl)}, ${n(r.importo)}, 'rata' from public.pratiche_morosita m where m.codice = ${q(mor.id)};`);
            }
        });
    }
});

scrivi('\n-- Gli indennizzi, con le tre firme: chi dispone, chi autorizza, chi esegue.');
G.INDENNIZZI.forEach(i => {
    scrivi(`insert into public.indennizzi (morosita_id, mese, importo, stato, nota_istruttoria, disposto_da, disposto_il, autorizzato_da, autorizzato_il, eseguito_da, eseguito_il, pagato_il, riferimento, beneficiario_id)
select m.id, ${q(i.mese)}, ${n(i.importo)}, ${q(i.eseguitoIl ? 'pagato' : i.autorizzatoIl ? 'autorizzato' : i.dispostoIl ? 'disposto' : 'da_disporre')}, ${q(i.notaIstruttoria || null)},
       (select p.id from public.persone p where p.codice_demo = ${q(i.dispostoDa)}), ${q(i.dispostoIl)}::timestamptz,
       (select p.id from public.persone p where p.codice_demo = ${q(i.autorizzatoDa)}), ${q(i.autorizzatoIl)}::timestamptz,
       (select p.id from public.persone p where p.codice_demo = ${q(i.eseguitoDa)}), ${q(i.eseguitoIl)}, ${q(i.eseguitoIl)}, ${q(i.riferimento)},
       (select pos.persona_id from public.posizioni pos join public.contratti k on k.id = pos.contratto_id
         where k.codice_demo = ${q(i.contrattoId)} and pos.verso = 'locatore' and pos.al is null limit 1)
  from public.pratiche_morosita m where m.codice = ${q(i.praticaId)};`);
});


// ─── Verifiche, autocandidature, certificati ─────────────────────────────────
scrivi('\n-- CRIA Verifica: le richieste dei clienti, con il loro credito.');
V.VERIFICHE.forEach(v => {
    const { id, personaId, richiestaIl, soggetto, stato, credito, ...resto } = v;
    scrivi(`insert into public.richieste_verifica (codice, cliente_id, soggetto_nome, soggetto_cognome, soggetto_cf, soggetto_nascita, soggetto_luogo, consenso, stato, esito, richiesta_il, credito_importo, credito_scade_il, credito_usato_il, dati, di_prova)
select ${q(id)}, p.id, ${q(soggetto.nome)}, ${q(soggetto.cognome)}, ${q(soggetto.codiceFiscale)}, ${q(soggetto.dataNascita)}, ${q(soggetto.luogoNascita)}, true,
       ${q(stato === 'conclusa' ? 'evasa' : 'in_corso')}, ${q(v.esito?.semaforo || (v.esito ? 'nessun_dato' : null))}, ${q(richiestaIl)}::timestamptz,
       ${n(credito?.importo)}, ${q(credito?.scadeIl)}, ${q(credito?.usatoIl)}, ${j(resto)}, true
  from public.persone p where p.codice_demo = ${q(personaId)};`);
});

scrivi('\n-- Le autocandidature (il certificato che porta l\'inquilino).');
A.AUTOCANDIDATURE.forEach(a => {
    const { id, personaId, apertaIl, stato, referenze: _referenze, ...resto } = a;
    scrivi(`insert into public.autocandidature (codice, persona_id, stato, aperta_il, pagata_il, importo, dati, di_prova)
select ${q(id)}, p.id, ${q(['certificata', 'respinta', 'annullata', 'in_verifica', 'da_integrare'].includes(stato) ? stato : 'aperta')}, ${q(apertaIl)}::timestamptz,
       ${q(a.pagamento?.pagataIl)}, ${n(a.pagamento?.importo)}, ${j({ stato, ...resto })}, true
  from public.persone p where p.codice_demo = ${q(personaId)};`);
});

scrivi('\n-- Le referenze chieste ai precedenti proprietari.');
A.AUTOCANDIDATURE.forEach(a => {
    (a.referenze || []).forEach(r => {
        const stato = { in_attesa: 'contattata', confermata: 'risposta', smentita: 'risposta', scaduta: 'scaduta' }[r.stato] || 'contattata';
        const giudizio = r.stato === 'confermata' ? 'conferma' : r.stato === 'smentita' ? 'smentita' : null;
        scrivi(`insert into public.referenze (autocandidatura_id, nome, email, telefono, immobile, dal, al, stato, giudizio, chiesta_il, risposta_il, token, tentativi, replica, risposta, inquilino, di_prova)
select x.id, ${q(r.proprietario?.nome)}, ${q(r.proprietario?.email)}, ${q(r.proprietario?.telefono)}, ${q(r.immobile)},
       ${q(`${r.dal}-01`)}, ${q(`${r.al}-01`)}, ${q(stato)}, ${q(giudizio)}, ${q(r.richiestaIl)}::timestamptz, ${q(r.risposta?.il)}::timestamptz,
       ${q(r.token)}, ${j(r.tentativi || [])}, ${j(r.replica)}, ${j(r.risposta)}, ${q(r.inquilino)}, true
  from public.autocandidature x where x.codice = ${q(a.id)};`);
    });
});

scrivi('\n-- I certificati emessi.');
CE.CERTIFICATI.forEach(c => {
    const { id, personaId, emessoIl, periodo, fonte, codice, revocatoIl, ...resto } = c;
    scrivi(`insert into public.certificati (numero, persona_id, ambito, semaforo, fonte, emesso_il, periodo_dal, periodo_al, codice_pubblico, revocato_il, dati, di_prova)
select ${q(id)}, p.id, 'conduttore', ${q(c.semaforo || 'verde')}, ${q(fonte === 'autocandidatura' ? 'verificato_su_documentazione' : 'rilevato_cria')}, ${q(emessoIl)}::timestamptz,
       ${q(periodo?.dal)}, ${q(periodo?.al)}, ${q(codice)}, ${q(revocatoIl)}::timestamptz, ${j(resto)}, true
  from public.persone p where p.codice_demo = ${q(personaId)};`);
});

// ─── Il file ─────────────────────────────────────────────────────────────────
const intestazione = `-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — dati_prova_lotto1.sql                                            ║
-- ║  I dati inventati dei mockup, copiati nel database: immobili,            ║
-- ║  contratti, posizioni e i mesi del canone. Generato da                   ║
-- ║  scratchpad/copia_lotto1.mjs, non si scrive a mano.                      ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Si riconoscono e si cancellano: gli immobili e i contratti hanno di_prova,
-- le persone senza account hanno un codice_demo che comincia per sog-, cand-
-- o prec-. Rieseguire questo file rifà tutto da capo.

begin;
delete from public.note_interne where di_prova;
delete from public.referenze where di_prova;
delete from public.certificati where di_prova;
delete from public.autocandidature where di_prova;
delete from public.richieste_verifica where di_prova;
delete from public.pratiche_morosita where di_prova;
delete from public.pratiche where di_prova;
delete from public.conversazioni where di_prova;
delete from public.documenti where di_prova;
delete from public.contratti where di_prova;
delete from public.immobili where di_prova;
delete from public.persone where codice_demo is not null and utente_id is null
   and (codice_demo like 'sog-%' or codice_demo like 'cand-%' or codice_demo like 'prec-%');

`;
fs.writeFileSync('/Volumes/bat-mac/CRIA/db/seed/dati_prova_lotto1.sql', `${intestazione}${righe.join('\n')}\n\ncommit;\n`);
console.log(`persone nuove: ${nuovi.length} · immobili: ${m.immobili.length} · contratti: ${D.CONTRATTI.length} · righe SQL: ${righe.length}`);
if (saltati.length) console.log('recapiti lasciati vuoti perché già usati:\n  ' + saltati.join('\n  '));
await server.close();
