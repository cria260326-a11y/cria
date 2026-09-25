-- ╔══════════════════════════════════════════════════════════════════════════╗
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

-- Persone senza account: controparti dei contratti, candidati, referenze.
insert into public.persone (codice_demo, tipo, nome, cognome, ragione_sociale, partita_iva, codice_fiscale, data_nascita, luogo_nascita, email, telefono, indirizzo, stato_identita)
values ('sog-chiara-lombardi', 'fisica', 'Chiara', 'Lombardi', null, null, '31265480972', '1994-02-17', 'Lugano (Svizzera)', 'chiara.lombardi@esempio.it', '+39 339 4455667', '{"via":"Via Verdi 5","cap":"20121","citta":"Milano","paese":"Italia","fonte":"casa"}'::jsonb, 'verificato');
insert into public.persone (codice_demo, tipo, nome, cognome, ragione_sociale, partita_iva, codice_fiscale, data_nascita, luogo_nascita, email, telefono, indirizzo, stato_identita)
values ('sog-davide-colombo', 'fisica', 'Davide', 'Colombo', null, null, 'CLMDVD87H14F205W', '1987-06-14', 'Milano', 'davide.colombo@esempio.it', '+39 348 1122334', '{"via":"Via Verdi 3","cap":"20121","citta":"Milano","paese":"Italia","fonte":"casa"}'::jsonb, 'non_caricato');
insert into public.persone (codice_demo, tipo, nome, cognome, ragione_sociale, partita_iva, codice_fiscale, data_nascita, luogo_nascita, email, telefono, indirizzo, stato_identita)
values ('sog-davide-colombo-2', 'fisica', 'Davide', 'Colombo', null, null, 'CLMDVD87H04F205V', '1987-06-04', 'Milano', 'd.colombo87@esempio.it', '+39 348 5566778', '{"fonte":"dichiarato","via":"Via Verdi 3","cap":"20121","citta":"Milano","paese":"Italia"}'::jsonb, 'verificato');
insert into public.persone (codice_demo, tipo, nome, cognome, ragione_sociale, partita_iva, codice_fiscale, data_nascita, luogo_nascita, email, telefono, indirizzo, stato_identita)
values ('sog-francesca-bellini', 'fisica', 'Francesca', 'Bellini', null, null, 'BLLFNC68P62F205Y', '1968-09-22', 'Milano', 'francesca.bellini@esempio.it', '+39 347 9988776', null, 'verificato');
insert into public.persone (codice_demo, tipo, nome, cognome, ragione_sociale, partita_iva, codice_fiscale, data_nascita, luogo_nascita, email, telefono, indirizzo, stato_identita)
values ('cand-pr-bergamo8', 'fisica', 'Irene', 'Fontana', null, null, 'FNTRNI89R70F205W', '1989-10-30', 'Milano', 'irene.fontana@esempio.it', '+39 333 404 5566', null, 'non_caricato');
insert into public.persone (codice_demo, tipo, nome, cognome, ragione_sociale, partita_iva, codice_fiscale, data_nascita, luogo_nascita, email, telefono, indirizzo, stato_identita)
values ('sog-laura-verdi', 'fisica', 'Laura', 'Verdi', null, null, 'VRDLRA71L52F205E', '1971-07-12', 'Milano', null, null, null, 'non_caricato');
insert into public.persone (codice_demo, tipo, nome, cognome, ragione_sociale, partita_iva, codice_fiscale, data_nascita, luogo_nascita, email, telefono, indirizzo, stato_identita)
values ('cand-pr-solferino14', 'fisica', 'Luca', 'Bianchi', null, null, null, null, null, 'luca.bianchi@esempio.it', '+39 340 111 2233', null, 'non_caricato');
insert into public.persone (codice_demo, tipo, nome, cognome, ragione_sociale, partita_iva, codice_fiscale, data_nascita, luogo_nascita, email, telefono, indirizzo, stato_identita)
values ('sog-mario-rossi-2', 'fisica', 'Mario', 'Rossi', null, null, 'RSSMRA04C21F205P', '2004-03-21', 'Milano', 'mario.rossi04@esempio.it', '+39 347 9081726', '{"fonte":"dichiarato","via":"Corso Italia 88","cap":"20122","citta":"Milano","paese":"Italia"}'::jsonb, 'verificato');
insert into public.persone (codice_demo, tipo, nome, cognome, ragione_sociale, partita_iva, codice_fiscale, data_nascita, luogo_nascita, email, telefono, indirizzo, stato_identita)
values ('prec-ref-elena-fabbri', 'fisica', 'Roberto', 'Fabbri', null, null, null, null, null, 'roberto.fabbri@esempio.it', '+39 340 5512876', null, 'non_caricato');
insert into public.persone (codice_demo, tipo, nome, cognome, ragione_sociale, partita_iva, codice_fiscale, data_nascita, luogo_nascita, email, telefono, indirizzo, stato_identita)
values ('cand-pr-savona22', 'fisica', 'Sara', 'Neri', null, null, 'NRESRA91E45F205N', '1991-05-05', 'Milano', 'sara.neri@esempio.it', '+39 347 998 1122', null, 'non_caricato');
insert into public.persone (codice_demo, tipo, nome, cognome, ragione_sociale, partita_iva, codice_fiscale, data_nascita, luogo_nascita, email, telefono, indirizzo, stato_identita)
values ('sog-stefano-ricci', 'fisica', 'Stefano', 'Ricci', null, null, 'RCCSFN85S03Z600N', '1985-11-03', 'Buenos Aires (Argentina)', 'stefano.ricci@esempio.it', '+39 340 2233445', '{"via":"Viale Monza 140","cap":"20127","citta":"Milano","paese":"Italia","fonte":"casa"}'::jsonb, 'non_caricato');

-- Il listino, com'è oggi nel catalogo del codice.
insert into public.prodotti (codice, nome, descrizione, per_cliente, modello_prezzo, percentuale_canone, prezzo, prezzo_annuo, prezzo_mensile, quota_app_annua, garanzia, franchigia_mesi, incassa, attivo, ordine)
values ('P1', 'CRIA Gestione · nuovo contratto', 'Incassi tu il canone e ogni mese segnali se è arrivato. Se l’inquilino non paga, interviene la garanzia.', 'proprietario', 'percentuale_canone', 8, null, null, null, 47, true, 1, 'proprietario', true, 1)
on conflict (codice) do nothing;
insert into public.prodotti (codice, nome, descrizione, per_cliente, modello_prezzo, percentuale_canone, prezzo, prezzo_annuo, prezzo_mensile, quota_app_annua, garanzia, franchigia_mesi, incassa, attivo, ordine)
values ('P1E', 'CRIA Gestione · contratto esistente', 'Per un contratto già in corso: incassi tu, segnali ogni mese, e la garanzia parte dopo una franchigia di 3 mesi.', 'proprietario', 'percentuale_canone', 7, null, null, null, 47, true, 3, 'proprietario', true, 2)
on conflict (codice) do nothing;
insert into public.prodotti (codice, nome, descrizione, per_cliente, modello_prezzo, percentuale_canone, prezzo, prezzo_annuo, prezzo_mensile, quota_app_annua, garanzia, franchigia_mesi, incassa, attivo, ordine)
values ('P2', 'CRIA Completo', 'Incassa CRIA dall’inquilino e ti bonifica il canone. Non devi segnalare nulla. Se l’inquilino non paga, interviene la garanzia.', 'proprietario', 'percentuale_canone', 9, null, null, null, 0, true, 1, 'cria', true, 3)
on conflict (codice) do nothing;
insert into public.prodotti (codice, nome, descrizione, per_cliente, modello_prezzo, percentuale_canone, prezzo, prezzo_annuo, prezzo_mensile, quota_app_annua, garanzia, franchigia_mesi, incassa, attivo, ordine)
values ('P5', 'CRIA Segnalazione', 'Segnali i pagamenti e costruisci lo storico dell’inquilino. Senza garanzia.', 'proprietario', 'abbonamento_annuo', null, null, 47, null, null, false, null, 'proprietario', true, 4)
on conflict (codice) do nothing;
insert into public.prodotti (codice, nome, descrizione, per_cliente, modello_prezzo, percentuale_canone, prezzo, prezzo_annuo, prezzo_mensile, quota_app_annua, garanzia, franchigia_mesi, incassa, attivo, ordine)
values ('P3', 'CRIA Verifica', 'Un’interrogazione sul candidato: semaforo e sintesi, oppure «non abbiamo informazioni».', 'occasionale', 'una_tantum', null, 47, null, null, null, false, null, 'non_applicabile', true, 5)
on conflict (codice) do nothing;
insert into public.prodotti (codice, nome, descrizione, per_cliente, modello_prezzo, percentuale_canone, prezzo, prezzo_annuo, prezzo_mensile, quota_app_annua, garanzia, franchigia_mesi, incassa, attivo, ordine)
values ('P6', 'CRIA Agenzie', 'Abbonamento per interrogare il database mentre selezioni i candidati dei tuoi annunci.', 'agenzia', 'abbonamento_mensile', null, null, null, null, null, false, null, 'non_applicabile', true, 6)
on conflict (codice) do nothing;
insert into public.prodotti (codice, nome, descrizione, per_cliente, modello_prezzo, percentuale_canone, prezzo, prezzo_annuo, prezzo_mensile, quota_app_annua, garanzia, franchigia_mesi, incassa, attivo, ordine)
values ('P7', 'Certificato su autocandidatura', 'Porti tu la documentazione, CRIA la istruisce e il certificato dichiara da dove viene il dato.', 'inquilino', 'una_tantum', null, 47, null, null, null, false, null, 'non_applicabile', true, 7)
on conflict (codice) do nothing;

-- Gli immobili, con il loro codice e chi ne è titolare.
insert into public.immobili (codice, codice_demo, indirizzo, cap, citta, provincia, latitudine, longitudine, tipologia, mq, catastale, stato, inserito_il, di_prova)
values ('IMM-0001', 'imm-0001', 'Viale Monza 140', '20127', 'Milano', 'MI', 45.50391, 9.22433, 'Trilocale', 78, '{"descrizione":"Foglio 158 · Particella 44 · Sub 21"}'::jsonb, 'attivo', '2023-12-18', true);
insert into public.titolarita (immobile_id, persona_id, tipo, quota, dal, al)
select i.id, p.id, 'proprietario', 100, '2016-02-01', null
  from public.immobili i, public.persone p where i.codice = 'IMM-0001' and p.codice_demo = 'verdi';
insert into public.immobili (codice, codice_demo, indirizzo, cap, citta, provincia, latitudine, longitudine, tipologia, mq, catastale, stato, inserito_il, di_prova)
values ('IMM-0002', 'imm-0002', 'Via Padova 12', '20127', 'Milano', 'MI', 45.49588, 9.22291, 'Bilocale', 48, '{"descrizione":"Foglio 187 · Particella 301 · Sub 9"}'::jsonb, 'attivo', '2025-02-12', true);
insert into public.titolarita (immobile_id, persona_id, tipo, quota, dal, al)
select i.id, p.id, 'proprietario', 100, '2004-06-18', '2024-11-19'
  from public.immobili i, public.persone p where i.codice = 'IMM-0002' and p.codice_demo = null;
insert into public.titolarita (immobile_id, persona_id, tipo, quota, dal, al)
select i.id, p.id, 'proprietario', 100, '2024-11-20', null
  from public.immobili i, public.persone p where i.codice = 'IMM-0002' and p.codice_demo = 'verdi';
insert into public.immobili (codice, codice_demo, indirizzo, cap, citta, provincia, latitudine, longitudine, tipologia, mq, catastale, stato, inserito_il, di_prova)
values ('IMM-0003', 'imm-0003', 'Via Tortona 27', '20144', 'Milano', 'MI', 45.45204, 9.16508, 'Loft', 70, '{"descrizione":"Foglio 476 · Particella 90 · Sub 2"}'::jsonb, 'attivo', '2025-05-20', true);
insert into public.titolarita (immobile_id, persona_id, tipo, quota, dal, al)
select i.id, p.id, 'proprietario', 100, '2019-09-12', null
  from public.immobili i, public.persone p where i.codice = 'IMM-0003' and p.codice_demo = 'verdi';
insert into public.immobili (codice, codice_demo, indirizzo, cap, citta, provincia, latitudine, longitudine, tipologia, mq, catastale, stato, inserito_il, di_prova)
values ('IMM-0004', 'imm-0004', 'Corso Italia 88', '20122', 'Milano', 'MI', 45.45612, 9.18804, 'Trilocale', 85, '{"descrizione":"Foglio 437 · Particella 58 · Sub 12"}'::jsonb, 'attivo', '2025-09-16', true);
insert into public.titolarita (immobile_id, persona_id, tipo, quota, dal, al)
select i.id, p.id, 'proprietario', 100, '2009-04-02', null
  from public.immobili i, public.persone p where i.codice = 'IMM-0004' and p.codice_demo = 'sog-francesca-bellini';
insert into public.immobili (codice, codice_demo, indirizzo, cap, citta, provincia, latitudine, longitudine, tipologia, mq, catastale, stato, inserito_il, di_prova)
values ('IMM-0005', 'imm-0005', 'Via Verdi 3', '20121', 'Milano', 'MI', 45.46852, 9.18942, 'Bilocale', 62, '{"descrizione":"Foglio 349 · Particella 112 · Sub 7"}'::jsonb, 'attivo', '2025-09-22', true);
insert into public.titolarita (immobile_id, persona_id, tipo, quota, dal, al)
select i.id, p.id, 'proprietario', 100, '2018-05-10', null
  from public.immobili i, public.persone p where i.codice = 'IMM-0005' and p.codice_demo = 'mario';
insert into public.immobili (codice, codice_demo, indirizzo, cap, citta, provincia, latitudine, longitudine, tipologia, mq, catastale, stato, inserito_il, di_prova)
values ('IMM-0006', 'imm-0006', 'Via Verdi 5', '20121', 'Milano', 'MI', 45.46902, 9.18871, 'Monolocale', 38, '{"descrizione":"Foglio 349 · Particella 114 · Sub 3"}'::jsonb, 'attivo', '2025-10-25', true);
insert into public.titolarita (immobile_id, persona_id, tipo, quota, dal, al)
select i.id, p.id, 'proprietario', 100, '2018-05-10', null
  from public.immobili i, public.persone p where i.codice = 'IMM-0006' and p.codice_demo = 'mario';
insert into public.immobili (codice, codice_demo, indirizzo, cap, citta, provincia, latitudine, longitudine, tipologia, mq, catastale, stato, inserito_il, di_prova)
values ('IMM-0007', 'imm-0007', 'Via Savona 22', '20144', 'Milano', 'MI', 45.45561, 9.16655, 'Trilocale', 78, '{"descrizione":"Foglio 470 · Particella 58 · Sub 12"}'::jsonb, 'in_pratica', '2026-08-28', true);
insert into public.titolarita (immobile_id, persona_id, tipo, quota, dal, al)
select i.id, p.id, 'proprietario', 100, '2021-03-15', null
  from public.immobili i, public.persone p where i.codice = 'IMM-0007' and p.codice_demo = 'mario';
insert into public.immobili (codice, codice_demo, indirizzo, cap, citta, provincia, latitudine, longitudine, tipologia, mq, catastale, stato, inserito_il, di_prova)
values ('IMM-0008', 'imm-0008', 'Via Bergamo 8', '20135', 'Milano', 'MI', 45.46128, 9.21079, 'Bilocale', 62, '{"descrizione":"Foglio 512 · Particella 33 · Sub 4"}'::jsonb, 'in_pratica', '2026-09-01', true);
insert into public.titolarita (immobile_id, persona_id, tipo, quota, dal, al)
select i.id, p.id, 'proprietario', 100, '2020-07-01', null
  from public.immobili i, public.persone p where i.codice = 'IMM-0008' and p.codice_demo = 'verdi';
insert into public.immobili (codice, codice_demo, indirizzo, cap, citta, provincia, latitudine, longitudine, tipologia, mq, catastale, stato, inserito_il, di_prova)
values ('IMM-0009', 'imm-0009', 'Via Solferino 14', '20121', 'Milano', 'MI', 45.47538, 9.18823, 'Bilocale', 55, '{"descrizione":"Foglio 348 · Particella 112 · Sub 7"}'::jsonb, 'in_pratica', '2026-09-08', true);
insert into public.titolarita (immobile_id, persona_id, tipo, quota, dal, al)
select i.id, p.id, 'proprietario', 100, '2023-11-30', null
  from public.immobili i, public.persone p where i.codice = 'IMM-0009' and p.codice_demo = 'mario';

-- I contratti: il codice è la causale del bonifico.
insert into public.contratti (codice, codice_demo, immobile_id, prodotto, canone, giorno_scadenza, data_inizio, data_fine, durata_testo, deposito, attivo_dal, stato, stato_prodotto, registrazione_numero, registrazione_data, registrazione_ufficio, storico_inquilini, di_prova)
select 'CRIA-7Q4K-2M9P', 'c-verdi3', i.id, 'P2', 1100, 1, '2025-10-01', '2029-09-30', '4 + 4 anni', 3300, '2025-10-01', 'attivo', 'attivo', 'TMV25T012345000QF', '2025-10-08', 'Agenzia delle Entrate · DP I Milano', '[{"nome":"Elisa Ferrara","dal":"2021-02-01","al":"2025-08-31"}]'::jsonb, true
  from public.immobili i where i.codice = 'IMM-0005';
insert into public.posizioni (contratto_id, persona_id, verso, dal, al)
select k.id, p.id, 'conduttore', '2025-10-01', null
  from public.contratti k, public.persone p where k.codice = 'CRIA-7Q4K-2M9P' and p.codice_demo = 'sog-davide-colombo';
insert into public.posizioni (contratto_id, persona_id, verso, dal, al)
select k.id, p.id, 'locatore', '2025-10-01', null
  from public.contratti k, public.persone p where k.codice = 'CRIA-7Q4K-2M9P' and p.codice_demo = 'mario';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-10', 1100, 1100, '2025-10-02', 2, 'verificato', 'cria', 99, '2025-10-04', 1001
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-10', 'pagato', 'cria', '2025-10-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2025-10', 'in_franchigia', '2025-10-02'
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-11', 1100, 1100, '2025-11-01', 1, 'verificato', 'cria', 99, '2025-11-03', 1001
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-11', 'pagato', 'cria', '2025-11-01'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2025-11', 'attiva', '2025-11-01'
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-12', 1100, 1100, '2025-12-03', 3, 'verificato', 'cria', 99, '2025-12-05', 1001
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-12', 'pagato', 'cria', '2025-12-03'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2025-12', 'attiva', '2025-12-03'
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-01', 1100, 1100, '2026-01-02', 2, 'verificato', 'cria', 99, '2026-01-04', 1001
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-01', 'pagato', 'cria', '2026-01-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-01', 'attiva', '2026-01-02'
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-02', 1100, 1100, '2026-02-01', 1, 'verificato', 'cria', 99, '2026-02-03', 1001
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-02', 'pagato', 'cria', '2026-02-01'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-02', 'attiva', '2026-02-01'
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-03', 1100, 1100, '2026-03-02', 2, 'verificato', 'cria', 99, '2026-03-04', 1001
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-03', 'pagato', 'cria', '2026-03-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-03', 'attiva', '2026-03-02'
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-04', 1100, 1100, '2026-04-03', 3, 'verificato', 'cria', 99, '2026-04-05', 1001
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-04', 'pagato', 'cria', '2026-04-03'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-04', 'attiva', '2026-04-03'
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-05', 1100, 1100, '2026-05-01', 1, 'verificato', 'cria', 99, '2026-05-03', 1001
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-05', 'pagato', 'cria', '2026-05-01'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-05', 'attiva', '2026-05-01'
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-06', 1100, 1100, '2026-06-02', 2, 'verificato', 'cria', 99, '2026-06-04', 1001
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-06', 'pagato', 'cria', '2026-06-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-06', 'attiva', '2026-06-02'
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-07', 1100, 1100, '2026-07-02', 2, 'verificato', 'cria', 99, '2026-07-04', 1001
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-07', 'pagato', 'cria', '2026-07-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-07', 'attiva', '2026-07-02'
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-08', 1100, 1100, '2026-08-01', 1, 'verificato', 'cria', 99, '2026-08-03', 1001
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-08', 'pagato', 'cria', '2026-08-01'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-08', 'attiva', '2026-08-01'
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-09', 1100, 1100, '2026-09-03', 3, 'verificato', 'cria', 99, '2026-09-05', 1001
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-09', 'pagato', 'cria', '2026-09-03'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-09', 'attiva', '2026-09-03'
  from public.contratti k where k.codice = 'CRIA-7Q4K-2M9P';
insert into public.contratti (codice, codice_demo, immobile_id, prodotto, canone, giorno_scadenza, data_inizio, data_fine, durata_testo, deposito, attivo_dal, stato, stato_prodotto, registrazione_numero, registrazione_data, registrazione_ufficio, storico_inquilini, di_prova)
select 'CRIA-3HX8-KD5T', 'c-verdi5', i.id, 'P1E', 950, 1, '2023-06-01', '2027-05-31', '4 + 4 anni', 2850, '2025-11-01', 'attivo', 'attivo', 'TMV23T004512000KP', '2023-06-12', 'Agenzia delle Entrate · DP I Milano', '[{"nome":"Paolo Neri","dal":"2019-06-01","al":"2023-05-31"}]'::jsonb, true
  from public.immobili i where i.codice = 'IMM-0006';
insert into public.posizioni (contratto_id, persona_id, verso, dal, al)
select k.id, p.id, 'conduttore', '2023-06-01', null
  from public.contratti k, public.persone p where k.codice = 'CRIA-3HX8-KD5T' and p.codice_demo = 'sog-chiara-lombardi';
insert into public.posizioni (contratto_id, persona_id, verso, dal, al)
select k.id, p.id, 'locatore', '2023-06-01', null
  from public.contratti k, public.persone p where k.codice = 'CRIA-3HX8-KD5T' and p.codice_demo = 'mario';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-11', 950, 950, '2025-11-06', 6, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-11', 'pagato', 'locatore', '2025-11-06'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2025-11', 'in_franchigia', '2025-11-06'
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-12', 950, 950, '2025-12-08', 8, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-12', 'pagato', 'locatore', '2025-12-08'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2025-12', 'in_franchigia', '2025-12-08'
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-01', 950, 950, '2026-01-07', 7, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-01', 'pagato', 'locatore', '2026-01-07'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-01', 'in_franchigia', '2026-01-07'
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-02', 950, 950, '2026-02-09', 9, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-02', 'pagato', 'locatore', '2026-02-09'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-02', 'attiva', '2026-02-09'
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-03', 950, 950, '2026-03-06', 6, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-03', 'pagato', 'locatore', '2026-03-06'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-03', 'attiva', '2026-03-06'
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-04', 950, null, null, null, 'non_rilevato', 'automatica', null, null, null
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-04', 'non_rilevato', 'automatica', '2026-04-12'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-04', 'decaduta_mancata_segnalazione', '2026-04-12'
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-05', 950, 950, '2026-05-14', 14, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-05', 'non_pagato', 'locatore', '2026-05-04'::timestamptz, false, true, true
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-05', 'attiva', '2026-05-04'
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-06', 950, 950, '2026-06-07', 7, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-06', 'pagato', 'locatore', '2026-06-07'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-06', 'attiva', '2026-06-07'
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-07', 950, 950, '2026-07-08', 8, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-07', 'pagato', 'locatore', '2026-07-08'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-07', 'attiva', '2026-07-08'
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-08', 950, 950, '2026-08-06', 6, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-08', 'pagato', 'locatore', '2026-08-06'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-08', 'attiva', '2026-08-06'
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-09', 950, null, null, null, 'contestato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-09', 'non_pagato', 'locatore', '2026-09-04'::timestamptz, false, true, true
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-09', 'attiva', '2026-09-04'
  from public.contratti k where k.codice = 'CRIA-3HX8-KD5T';
insert into public.contratti (codice, codice_demo, immobile_id, prodotto, canone, giorno_scadenza, data_inizio, data_fine, durata_testo, deposito, attivo_dal, stato, stato_prodotto, registrazione_numero, registrazione_data, registrazione_ufficio, storico_inquilini, di_prova)
select 'CRIA-9WEN-4RB2', 'c-italia88', i.id, 'P1', 1400, 1, '2024-09-01', '2028-08-31', '4 + 4 anni', 4200, '2025-10-01', 'attivo', 'attivo', 'TMV24T009876000ZA', '2024-09-10', 'Agenzia delle Entrate · DP II Milano', null, true
  from public.immobili i where i.codice = 'IMM-0004';
insert into public.posizioni (contratto_id, persona_id, verso, dal, al)
select k.id, p.id, 'locatore', '2024-09-01', null
  from public.contratti k, public.persone p where k.codice = 'CRIA-9WEN-4RB2' and p.codice_demo = 'sog-francesca-bellini';
insert into public.posizioni (contratto_id, persona_id, verso, dal, al)
select k.id, p.id, 'conduttore', '2024-09-01', null
  from public.contratti k, public.persone p where k.codice = 'CRIA-9WEN-4RB2' and p.codice_demo = 'mario';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-10', 1400, 1400, '2025-10-01', 1, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-10', 'pagato', 'locatore', '2025-10-01'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2025-10', 'in_franchigia', '2025-10-01'
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-11', 1400, 1400, '2025-11-02', 2, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-11', 'pagato', 'locatore', '2025-11-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2025-11', 'attiva', '2025-11-02'
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-12', 1400, 1400, '2025-12-01', 1, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-12', 'pagato', 'locatore', '2025-12-01'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2025-12', 'attiva', '2025-12-01'
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-01', 1400, 1400, '2026-01-03', 3, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-01', 'pagato', 'locatore', '2026-01-03'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-01', 'attiva', '2026-01-03'
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-02', 1400, 1400, '2026-02-02', 2, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-02', 'pagato', 'locatore', '2026-02-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-02', 'attiva', '2026-02-02'
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-03', 1400, 1400, '2026-03-01', 1, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-03', 'pagato', 'locatore', '2026-03-01'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-03', 'attiva', '2026-03-01'
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-04', 1400, 1400, '2026-04-02', 2, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-04', 'pagato', 'locatore', '2026-04-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-04', 'attiva', '2026-04-02'
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-05', 1400, 1400, '2026-05-01', 1, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-05', 'pagato', 'locatore', '2026-05-01'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-05', 'attiva', '2026-05-01'
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-06', 1400, 1400, '2026-06-02', 2, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-06', 'pagato', 'locatore', '2026-06-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-06', 'attiva', '2026-06-02'
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-07', 1400, 1400, '2026-07-03', 3, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-07', 'pagato', 'locatore', '2026-07-03'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-07', 'attiva', '2026-07-03'
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-08', 1400, 1400, '2026-08-01', 1, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-08', 'pagato', 'locatore', '2026-08-01'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-08', 'attiva', '2026-08-01'
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-09', 1400, 1400, '2026-09-02', 2, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-09', 'pagato', 'locatore', '2026-09-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-09', 'attiva', '2026-09-02'
  from public.contratti k where k.codice = 'CRIA-9WEN-4RB2';
insert into public.contratti (codice, codice_demo, immobile_id, prodotto, canone, giorno_scadenza, data_inizio, data_fine, durata_testo, deposito, attivo_dal, stato, stato_prodotto, registrazione_numero, registrazione_data, registrazione_ufficio, storico_inquilini, di_prova)
select 'CRIA-5TGA-8LVC', 'c-padova12', i.id, 'P5', 780, 1, '2025-03-01', '2029-02-28', '4 + 4 anni', 2340, '2025-03-01', 'attivo', 'attivo', 'TMV25T002233000LM', '2025-03-07', 'Agenzia delle Entrate · DP II Milano', '[{"nome":"Andrea Costa","dal":"2020-01-01","al":"2025-01-31"}]'::jsonb, true
  from public.immobili i where i.codice = 'IMM-0002';
insert into public.posizioni (contratto_id, persona_id, verso, dal, al)
select k.id, p.id, 'conduttore', '2025-03-01', null
  from public.contratti k, public.persone p where k.codice = 'CRIA-5TGA-8LVC' and p.codice_demo = 'giulia';
insert into public.posizioni (contratto_id, persona_id, verso, dal, al)
select k.id, p.id, 'locatore', '2025-03-01', null
  from public.contratti k, public.persone p where k.codice = 'CRIA-5TGA-8LVC' and p.codice_demo = 'verdi';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-10', 780, 780, '2025-10-05', 5, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-10', 'pagato', 'locatore', '2025-10-05'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-11', 780, 780, '2025-11-07', 7, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-11', 'pagato', 'locatore', '2025-11-07'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-12', 780, 780, '2025-12-06', 6, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-12', 'pagato', 'locatore', '2025-12-06'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-01', 780, null, null, null, 'non_rilevato', 'automatica', null, null, null
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-01', 'non_rilevato', 'automatica', '2026-01-12'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-02', 780, 780, '2026-02-08', 8, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-02', 'pagato', 'locatore', '2026-02-08'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-03', 780, 780, '2026-03-06', 6, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-03', 'pagato', 'locatore', '2026-03-06'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-04', 780, 780, '2026-04-09', 9, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-04', 'pagato', 'locatore', '2026-04-09'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-05', 780, 780, '2026-05-07', 7, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-05', 'pagato', 'locatore', '2026-05-07'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-06', 780, 780, '2026-06-06', 6, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-06', 'pagato', 'locatore', '2026-06-06'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-07', 780, 780, '2026-07-07', 7, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-07', 'pagato', 'locatore', '2026-07-07'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-08', 780, 780, '2026-08-02', 2, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-08', 'non_pagato', 'locatore', '2026-08-04'::timestamptz, false, true, true
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-09', 780, null, null, null, 'segnalato_non_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-09', 'non_pagato', 'locatore', '2026-09-10'::timestamptz, false, true, false
  from public.contratti k where k.codice = 'CRIA-5TGA-8LVC';
insert into public.contratti (codice, codice_demo, immobile_id, prodotto, canone, giorno_scadenza, data_inizio, data_fine, durata_testo, deposito, attivo_dal, stato, stato_prodotto, registrazione_numero, registrazione_data, registrazione_ufficio, storico_inquilini, di_prova)
select 'CRIA-2PZR-6YJF', 'c-monza140', i.id, 'P2', 1250, 1, '2024-01-01', '2027-12-31', '4 + 4 anni', 3750, '2024-01-01', 'attivo', 'attivo', 'TMV24T000187000RB', '2024-01-09', 'Agenzia delle Entrate · DP II Milano', null, true
  from public.immobili i where i.codice = 'IMM-0001';
insert into public.posizioni (contratto_id, persona_id, verso, dal, al)
select k.id, p.id, 'locatore', '2024-01-01', null
  from public.contratti k, public.persone p where k.codice = 'CRIA-2PZR-6YJF' and p.codice_demo = 'verdi';
insert into public.posizioni (contratto_id, persona_id, verso, dal, al)
select k.id, p.id, 'conduttore', '2024-01-01', null
  from public.contratti k, public.persone p where k.codice = 'CRIA-2PZR-6YJF' and p.codice_demo = 'sog-stefano-ricci';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-10', 1250, 1250, '2025-10-03', 3, 'verificato', 'cria', 112.5, '2025-10-05', 1137.5
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-10', 'pagato', 'cria', '2025-10-03'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2025-10', 'attiva', '2025-10-03'
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-11', 1250, 1250, '2025-11-02', 2, 'verificato', 'cria', 112.5, '2025-11-04', 1137.5
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-11', 'pagato', 'cria', '2025-11-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2025-11', 'attiva', '2025-11-02'
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-12', 1250, 1250, '2025-12-04', 4, 'verificato', 'cria', 112.5, '2025-12-06', 1137.5
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-12', 'pagato', 'cria', '2025-12-04'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2025-12', 'attiva', '2025-12-04'
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-01', 1250, 1250, '2026-01-02', 2, 'verificato', 'cria', 112.5, '2026-01-04', 1137.5
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-01', 'pagato', 'cria', '2026-01-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-01', 'attiva', '2026-01-02'
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-02', 1250, 1250, '2026-02-03', 3, 'verificato', 'cria', 112.5, '2026-02-05', 1137.5
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-02', 'pagato', 'cria', '2026-02-03'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-02', 'attiva', '2026-02-03'
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-03', 1250, 1250, '2026-03-01', 1, 'verificato', 'cria', 112.5, '2026-03-03', 1137.5
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-03', 'pagato', 'cria', '2026-03-01'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-03', 'attiva', '2026-03-01'
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-04', 1250, 1250, '2026-04-02', 2, 'verificato', 'cria', 112.5, '2026-04-04', 1137.5
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-04', 'pagato', 'cria', '2026-04-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-04', 'attiva', '2026-04-02'
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-05', 1250, 1250, '2026-05-04', 4, 'verificato', 'cria', 112.5, '2026-05-06', 1137.5
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-05', 'pagato', 'cria', '2026-05-04'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-05', 'attiva', '2026-05-04'
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-06', 1250, 1250, '2026-06-03', 3, 'verificato', 'cria', 112.5, '2026-06-05', 1137.5
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-06', 'pagato', 'cria', '2026-06-03'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-06', 'attiva', '2026-06-03'
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-07', 1250, 1250, '2026-07-02', 2, 'verificato', 'cria', 112.5, '2026-07-04', 1137.5
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-07', 'pagato', 'cria', '2026-07-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-07', 'attiva', '2026-07-02'
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-08', 1250, 1250, '2026-08-03', 3, 'verificato', 'cria', 112.5, '2026-08-05', 1137.5
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-08', 'pagato', 'cria', '2026-08-03'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-08', 'attiva', '2026-08-03'
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-09', 1250, 1250, '2026-09-02', 2, 'verificato', 'cria', 112.5, '2026-09-04', 1137.5
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-09', 'pagato', 'cria', '2026-09-02'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-09', 'attiva', '2026-09-02'
  from public.contratti k where k.codice = 'CRIA-2PZR-6YJF';
insert into public.contratti (codice, codice_demo, immobile_id, prodotto, canone, giorno_scadenza, data_inizio, data_fine, durata_testo, deposito, attivo_dal, stato, stato_prodotto, registrazione_numero, registrazione_data, registrazione_ufficio, storico_inquilini, di_prova)
select 'CRIA-8MCU-3NQE', 'c-tortona27', i.id, 'P1', 1050, 1, '2025-06-01', '2029-05-31', '4 + 4 anni', 3150, '2025-06-01', 'attivo', 'attivo', 'TMV25T006611000TC', '2025-06-06', 'Agenzia delle Entrate · DP III Milano', null, true
  from public.immobili i where i.codice = 'IMM-0003';
insert into public.posizioni (contratto_id, persona_id, verso, dal, al)
select k.id, p.id, 'locatore', '2025-06-01', null
  from public.contratti k, public.persone p where k.codice = 'CRIA-8MCU-3NQE' and p.codice_demo = 'verdi';
insert into public.posizioni (contratto_id, persona_id, verso, dal, al)
select k.id, p.id, 'conduttore', '2025-06-01', null
  from public.contratti k, public.persone p where k.codice = 'CRIA-8MCU-3NQE' and p.codice_demo = 'martina';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-10', 1050, 1050, '2025-10-09', 9, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-10', 'pagato', 'locatore', '2025-10-09'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2025-10', 'attiva', '2025-10-09'
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-11', 1050, 1050, '2025-11-12', 12, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-11', 'non_pagato', 'locatore', '2025-11-04'::timestamptz, false, true, false
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2025-11', 'attiva', '2025-11-04'
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2025-12', 1050, 1050, '2025-12-11', 11, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2025-12', 'pagato', 'locatore', '2025-12-11'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2025-12', 'attiva', '2025-12-11'
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-01', 1050, null, null, null, 'non_rilevato', 'automatica', null, null, null
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-01', 'non_rilevato', 'automatica', '2026-01-12'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-01', 'decaduta_mancata_segnalazione', '2026-01-12'
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-02', 1050, 1050, '2026-02-13', 13, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-02', 'non_pagato', 'locatore', '2026-02-04'::timestamptz, false, true, false
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-02', 'attiva', '2026-02-04'
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-03', 1050, 1050, '2026-03-10', 10, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-03', 'pagato', 'locatore', '2026-03-10'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-03', 'attiva', '2026-03-10'
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-04', 1050, 1050, '2026-04-12', 12, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-04', 'non_pagato', 'locatore', '2026-04-04'::timestamptz, false, true, false
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-04', 'attiva', '2026-04-04'
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-05', 1050, null, null, null, 'non_rilevato', 'automatica', null, null, null
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-05', 'non_rilevato', 'automatica', '2026-05-12'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-05', 'decaduta_mancata_segnalazione', '2026-05-12'
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-06', 1050, 1050, '2026-06-14', 14, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-06', 'non_pagato', 'locatore', '2026-06-04'::timestamptz, false, true, false
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-06', 'attiva', '2026-06-04'
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-07', 1050, null, null, null, 'insoluto', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-07', 'non_pagato', 'locatore', '2026-07-04'::timestamptz, false, true, false
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-07', 'attiva', '2026-07-04'
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-08', 1050, 1050, '2026-08-15', 15, 'segnalato_pagato', 'locatore', null, null, null
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-08', 'non_pagato', 'locatore', '2026-08-04'::timestamptz, false, true, false
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-08', 'attiva', '2026-08-04'
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte, commissione, girato_il, importo_girato)
select k.id, '2026-09', 1050, null, null, null, 'non_rilevato', 'automatica', null, null, null
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, tardiva, contestabile, contestata)
select k.id, '2026-09', 'non_rilevato', 'automatica', '2026-09-12'::timestamptz, false, false, false
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';
insert into public.coperture_mese (contratto_id, mese, stato, segnalata_il)
select k.id, '2026-09', 'decaduta_mancata_segnalazione', '2026-09-12'
  from public.contratti k where k.codice = 'CRIA-8MCU-3NQE';

-- I documenti: riga senza file, il magazzino si riempie dall'uso.
insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, stato, caricato_il, di_prova)
select p.id, 'persona', p.id, 'identita', 'Carta d’identità.pdf', 'verificato', '2025-09-20'::timestamptz, true
  from public.persone p where p.codice_demo = 'mario';
insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, stato, caricato_il, di_prova)
select p.id, 'contratto', (select k.id from public.contratti k where k.codice_demo = 'c-verdi3'), 'contratto', 'Contratto di locazione registrato.pdf', 'verificato', '2025-09-22'::timestamptz, true
  from public.persone p where p.codice_demo = 'mario';
insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, stato, caricato_il, di_prova)
select p.id, 'contratto', (select k.id from public.contratti k where k.codice_demo = 'c-verdi3'), 'registrazione', 'Ricevuta di registrazione.pdf', 'verificato', '2025-10-09'::timestamptz, true
  from public.persone p where p.codice_demo = 'mario';
insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, stato, caricato_il, di_prova)
select p.id, 'contratto', (select k.id from public.contratti k where k.codice_demo = 'c-verdi3'), 'visura', 'Visura catastale.pdf', 'verificato', '2025-09-22'::timestamptz, true
  from public.persone p where p.codice_demo = 'mario';
insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, stato, caricato_il, di_prova)
select p.id, 'contratto', (select k.id from public.contratti k where k.codice_demo = 'c-verdi5'), 'contratto', 'Contratto di locazione registrato.pdf', 'verificato', '2025-10-25'::timestamptz, true
  from public.persone p where p.codice_demo = 'mario';
insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, stato, caricato_il, di_prova)
select p.id, 'contratto', (select k.id from public.contratti k where k.codice_demo = 'c-verdi5'), 'visura', 'Visura catastale.pdf', 'da_integrare', '2025-10-25'::timestamptz, true
  from public.persone p where p.codice_demo = 'mario';
insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, stato, caricato_il, di_prova)
select p.id, 'persona', p.id, 'visura_camerale', 'Visura camerale.pdf', 'verificato', '2025-02-10'::timestamptz, true
  from public.persone p where p.codice_demo = 'verdi';
insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, stato, caricato_il, di_prova)
select p.id, 'contratto', (select k.id from public.contratti k where k.codice_demo = 'c-padova12'), 'contratto', 'Contratto di locazione registrato.pdf', 'verificato', '2025-03-08'::timestamptz, true
  from public.persone p where p.codice_demo = 'verdi';
insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, stato, caricato_il, di_prova)
select p.id, 'contratto', (select k.id from public.contratti k where k.codice_demo = 'c-monza140'), 'contratto', 'Contratto di locazione registrato.pdf', 'verificato', '2024-01-10'::timestamptz, true
  from public.persone p where p.codice_demo = 'verdi';
insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, stato, caricato_il, di_prova)
select p.id, 'contratto', (select k.id from public.contratti k where k.codice_demo = 'c-tortona27'), 'contratto', 'Contratto di locazione registrato.pdf', 'in_attesa', '2025-06-07'::timestamptz, true
  from public.persone p where p.codice_demo = 'verdi';
insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, stato, caricato_il, di_prova)
select p.id, 'persona', p.id, 'identita', 'Carta d’identità.pdf', 'verificato', '2025-03-02'::timestamptz, true
  from public.persone p where p.codice_demo = 'giulia';
insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, stato, caricato_il, di_prova)
select p.id, 'contratto', (select k.id from public.contratti k where k.codice_demo = 'c-padova12'), 'contratto', 'Contratto di locazione registrato.pdf', 'verificato', '2025-03-08'::timestamptz, true
  from public.persone p where p.codice_demo = 'giulia';
insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, stato, caricato_il, di_prova)
select p.id, 'contratto', (select k.id from public.contratti k where k.codice_demo = 'c-italia88'), 'contratto', 'Contratto di locazione registrato.pdf', 'verificato', '2025-09-30'::timestamptz, true
  from public.persone p where p.codice_demo = 'mario';

-- Le conversazioni con i clienti, con i loro messaggi.
insert into public.conversazioni (codice, oggetto, categoria, area, aperta_da, stato, creato_il, ultimo_messaggio_il, chiusa_il, di_prova)
select 'ASS-2026-0001', 'Domanda su CRIA Gestione', 'prodotti', 'locatore', p.id, 'aperto', '2026-09-03 10:30'::timestamptz, '2026-09-04 09:30'::timestamptz, null, true
  from public.persone p where p.codice_demo = 'mario';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, false, false, 'Salve, vorrei capire meglio cosa comprende CRIA Gestione.', '2026-09-03 10:30'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0001' and p.codice_demo = 'mario';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, true, false, 'Buongiorno! Comprende la segnalazione mensile con i promemoria, il semaforo del suo inquilino, le contestazioni decise da CRIA e la garanzia dopo la franchigia.', '2026-09-03 14:15'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0001' and p.codice_demo = 'nicola';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, true, false, 'Il prezzo non si chiede: esce dal listino e dal canone dichiarato, e lo vede al momento del pagamento.', '2026-09-04 09:30'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0001' and p.codice_demo = 'nicola';
insert into public.conversazioni (codice, oggetto, categoria, area, aperta_da, stato, creato_il, ultimo_messaggio_il, chiusa_il, di_prova)
select 'ASS-2026-0002', 'Cambio IBAN per i bonifici', 'pagamenti', 'locatore', p.id, 'in_corso', '2026-09-08 16:00'::timestamptz, '2026-09-10 10:30'::timestamptz, null, true
  from public.persone p where p.codice_demo = 'mario';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, false, false, 'Devo cambiare IBAN per ricevere i bonifici di CRIA Completo. Come procedo?', '2026-09-08 16:00'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0002' and p.codice_demo = 'mario';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, true, false, 'Carichi il documento con il nuovo IBAN dalla pagina Documenti: lo verifichiamo e lo sostituiamo.', '2026-09-09 09:00'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0002' and p.codice_demo = 'nicola';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, false, false, 'Caricato.', '2026-09-10 10:30'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0002' and p.codice_demo = 'mario';
insert into public.conversazioni (codice, oggetto, categoria, area, aperta_da, stato, creato_il, ultimo_messaggio_il, chiusa_il, di_prova)
select 'ASS-2026-0003', 'Il semaforo di agosto', 'semaforo', 'inquilino', p.id, 'in_corso', '2026-09-05 08:20'::timestamptz, '2026-09-05 12:02'::timestamptz, null, true
  from public.persone p where p.codice_demo = 'giulia';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, false, false, 'Agosto risulta contestato ma avevo pagato il 1°. Il semaforo ne risente?', '2026-09-05 08:20'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0003' and p.codice_demo = 'giulia';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, true, false, 'No: la contestazione è stata accolta e il mese conta come pagato il 2. Il semaforo si rifà da solo.', '2026-09-05 11:40'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0003' and p.codice_demo = 'nicola';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, false, false, 'Perfetto, grazie.', '2026-09-05 12:02'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0003' and p.codice_demo = 'giulia';
insert into public.conversazioni (codice, oggetto, categoria, area, aperta_da, stato, creato_il, ultimo_messaggio_il, chiusa_il, di_prova)
select 'ASS-2026-0004', 'Come si contesta una segnalazione', 'contestazioni', 'inquilino', p.id, 'risolto', '2026-08-12 18:05'::timestamptz, '2026-08-13 09:10'::timestamptz, '2026-08-13 09:10'::timestamptz, true
  from public.persone p where p.codice_demo = 'giulia';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, false, false, 'Dove trovo il pulsante per contestare?', '2026-08-12 18:05'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0004' and p.codice_demo = 'giulia';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, true, false, 'Nella pagina Segnalazioni, sul mese segnalato: c''è tempo cinque giorni dalla segnalazione.', '2026-08-13 09:10'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0004' and p.codice_demo = 'nicola';
insert into public.conversazioni (codice, oggetto, categoria, area, aperta_da, stato, creato_il, ultimo_messaggio_il, chiusa_il, di_prova)
select 'ASS-2026-0005', 'Chiedo di rateizzare', 'morosita', 'inquilino', p.id, 'aperto', '2026-09-11 09:15'::timestamptz, '2026-09-11 15:32'::timestamptz, null, true
  from public.persone p where p.codice_demo = 'martina';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, false, false, 'Sono in difficoltà con luglio. Posso pagare a rate?', '2026-09-11 09:15'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0005' and p.codice_demo = 'martina';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, true, false, 'Sì: il piano glielo propone il gestore della pratica, e lo approva il responsabile legale. La ricontattiamo noi.', '2026-09-11 15:30'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0005' and p.codice_demo = 'nicola';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, true, true, 'Nota interna: prima rata già pagata il 19 agosto, il piano è in corso.', '2026-09-11 15:32'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0005' and p.codice_demo = 'nicola';
insert into public.conversazioni (codice, oggetto, categoria, area, aperta_da, stato, creato_il, ultimo_messaggio_il, chiusa_il, di_prova)
select 'ASS-2026-0006', 'Documenti per Via Tortona 27', 'documenti', 'locatore', p.id, 'aperto', '2026-09-09 11:00'::timestamptz, '2026-09-09 16:20'::timestamptz, null, true
  from public.persone p where p.codice_demo = 'verdi';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, false, false, 'Il contratto registrato di Via Tortona risulta ancora in verifica.', '2026-09-09 11:00'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0006' and p.codice_demo = 'verdi';
insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo, il)
select c.id, p.id, true, false, 'È in coda all''istruttoria: se manca qualcosa le scriviamo qui con il motivo.', '2026-09-09 16:20'::timestamptz
  from public.conversazioni c, public.persone p
 where c.codice = 'ASS-2026-0006' and p.codice_demo = 'nicola';

-- Le pratiche, con quello che le schermate mostrano.
insert into public.pratiche (codice, persona_id, tipo_flusso, prodotto, stato, canone, aperta_il, quota_pagata_il, dati, di_prova)
select 'pr-solferino14', p.id, 'AB', 'P2', 'documenti_caricati', 1300, '2026-09-08'::timestamptz, '2026-09-08', '{"contratto":"nuovo","immobile":{"indirizzo":"Via Solferino 14","cap":"20121","citta":"Milano","provincia":"MI","lat":45.47538,"lng":9.18823,"tipologia":"Bilocale","mq":55,"catasto":"Foglio 348 · Particella 112 · Sub 7"},"titolarita":"proprietario","deposito":2600,"inizioPrevisto":"2026-11-01","durata":"4 + 4 anni","documentiProprietario":[{"tipo":"visura","etichetta":"Visura catastale","stato":"verificato"}],"candidato":{"nome":"Luca Bianchi","email":"luca.bianchi@esempio.it","cellulare":"+39 340 111 2233","invitatoIl":"2026-09-08","ultimoAccesso":"2026-09-12","token":"solferino14-lb","documenti":[{"tipo":"consenso","etichetta":"Informativa letta e consenso alla valutazione","stato":"caricato"},{"tipo":"identita","etichetta":"Documento d’identità","stato":"caricato"},{"tipo":"codice_fiscale","etichetta":"Codice fiscale","stato":"caricato"},{"tipo":"movimenti_canone","etichetta":"Pagamenti del canone degli ultimi 12 mesi (solo quei movimenti)","stato":"mancante"},{"tipo":"reddito","etichetta":"Documenti di reddito","stato":"mancante"}]}}'::jsonb, true
  from public.persone p where p.codice_demo = 'mario';
insert into public.pratiche_immobili (pratica_id, immobile_id, canone)
select pr.id, i.id, 1300 from public.pratiche pr, public.immobili i
 where pr.codice = 'pr-solferino14' and i.codice = 'IMM-0009';
insert into public.pratiche (codice, persona_id, tipo_flusso, prodotto, stato, canone, aperta_il, quota_pagata_il, dati, di_prova)
select 'pr-savona22', p.id, 'AB', 'P1', 'in_attesa_pagamento', 900, '2026-08-28'::timestamptz, '2026-08-28', '{"contratto":"nuovo","immobile":{"indirizzo":"Via Savona 22","cap":"20144","citta":"Milano","provincia":"MI","lat":45.45561,"lng":9.16655,"tipologia":"Trilocale","mq":78,"catasto":"Foglio 470 · Particella 58 · Sub 12"},"titolarita":"proprietario","deposito":1800,"inizioPrevisto":"2026-10-15","durata":"3 + 2 anni, canone concordato","documentiProprietario":[{"tipo":"visura","etichetta":"Visura catastale","stato":"verificato"}],"candidato":{"nome":"Sara Neri","email":"sara.neri@esempio.it","cellulare":"+39 347 998 1122","invitatoIl":"2026-08-28","ultimoAccesso":"2026-09-02","token":"savona22-sn","documenti":[{"tipo":"consenso","etichetta":"Informativa letta e consenso alla valutazione","stato":"caricato"},{"tipo":"identita","etichetta":"Documento d’identità","stato":"caricato"},{"tipo":"codice_fiscale","etichetta":"Codice fiscale","stato":"caricato"},{"tipo":"movimenti_canone","etichetta":"Pagamenti del canone degli ultimi 12 mesi (solo quei movimenti)","stato":"caricato"},{"tipo":"reddito","etichetta":"Documenti di reddito","stato":"caricato"}]},"istruttoria":{"conclusaIl":"2026-09-12","esito":"approvata","nota":"Storico rilevato da CRIA su 12 mesi, semaforo Regolare. Garanzia con la franchigia standard."}}'::jsonb, true
  from public.persone p where p.codice_demo = 'mario';
insert into public.pratiche_immobili (pratica_id, immobile_id, canone)
select pr.id, i.id, 900 from public.pratiche pr, public.immobili i
 where pr.codice = 'pr-savona22' and i.codice = 'IMM-0007';
insert into public.pratiche (codice, persona_id, tipo_flusso, prodotto, stato, canone, aperta_il, quota_pagata_il, dati, di_prova)
select 'pr-bergamo8', p.id, 'AB', 'P1E', 'in_attesa_firma', 1150, '2026-09-01'::timestamptz, '2026-09-01', '{"contratto":"esistente","immobile":{"indirizzo":"Via Bergamo 8","cap":"20135","citta":"Milano","provincia":"MI","lat":45.46128,"lng":9.21079,"tipologia":"Bilocale","mq":62,"catasto":"Foglio 512 · Particella 33 · Sub 4"},"titolarita":"societa","deposito":2300,"inizio":"2024-03-01","durata":"4 + 4 anni","registrazione":{"numero":"TNE24T003411000KF","data":"2024-03-12","ufficio":"Agenzia delle Entrate · DP II Milano"},"documentiProprietario":[{"tipo":"visura_camerale","etichetta":"Visura camerale","stato":"verificato"},{"tipo":"contratto","etichetta":"Contratto di locazione registrato","stato":"verificato"}],"candidato":{"nome":"Irene Fontana","email":"irene.fontana@esempio.it","cellulare":"+39 333 404 5566","invitatoIl":"2026-09-01","ultimoAccesso":"2026-09-04","inquilinoAttuale":true,"token":"bergamo8-if","documenti":[{"tipo":"consenso","etichetta":"Informativa letta e consenso alla valutazione","stato":"caricato"},{"tipo":"identita","etichetta":"Documento d’identità","stato":"caricato"},{"tipo":"codice_fiscale","etichetta":"Codice fiscale","stato":"caricato"},{"tipo":"movimenti_canone","etichetta":"Pagamenti del canone degli ultimi 12 mesi (solo quei movimenti)","stato":"caricato"},{"tipo":"reddito","etichetta":"Documenti di reddito","stato":"caricato"}]},"istruttoria":{"conclusaIl":"2026-09-10","esito":"approvata","nota":"Contratto registrato e pagamenti degli ultimi 12 mesi coerenti con il canone. Franchigia del contratto esistente."},"pagamento":{"pagataIl":"2026-09-14","prezzoCongelato":true}}'::jsonb, true
  from public.persone p where p.codice_demo = 'verdi';
insert into public.pratiche_immobili (pratica_id, immobile_id, canone)
select pr.id, i.id, 1150 from public.pratiche pr, public.immobili i
 where pr.codice = 'pr-bergamo8' and i.codice = 'IMM-0008';

-- Le pratiche di morosità, con contatti, piani e rate.
insert into public.pratiche_morosita (codice, contratto_id, mesi, importo, aperta_il, chiusa_il, esito, gestore_id, assegnata_il, stato, primo_contatto_il, dati, di_prova)
select 'mor-tortona27-2026-07', k.id, array['2026-07'], 1050, '2026-07-12', null, null,
       (select p.id from public.persone p where p.codice_demo = 'giorgio'), '2026-07-12', 'piano_attivo',
       '2026-07-13', '{"stato":"piano_in_corso","gestore":"Ufficio recupero CRIA","eventi":[{"il":"2026-07-04","titolo":"Mancato pagamento segnalato","testo":"Luglio segnalato come non pagato entro il 6: la copertura del mese è attiva."},{"il":"2026-07-12","titolo":"Pratica aperta","testo":"Il mese si è chiuso senza incasso: il recupero parte subito."},{"il":"2026-07-15","titolo":"Primo contatto con l’inquilina","testo":"Telefonata ed email a Martina Galli: conferma la difficoltà e chiede di rateizzare."},{"il":"2026-07-20","titolo":"Indennizzo riconosciuto","testo":"Luglio era coperto dalla garanzia: il credito verso l’inquilina passa a CRIA.","soloProprietario":true},{"il":"2026-07-22","titolo":"Indennizzo pagato","testo":"Bonifico di 1050 € sul conto della società.","soloProprietario":true},{"il":"2026-07-29","titolo":"Piano di rientro proposto","testo":"Tre rate mensili, approvate dal responsabile legale."},{"il":"2026-08-02","titolo":"Piano accettato","testo":"L’inquilina ha accettato il piano dalla sua area."},{"il":"2026-08-19","titolo":"Prima rata pagata","testo":"La prima rata è arrivata a CRIA."}],"indennizzo":{"stato":"pagato","mese":"2026-07","importo":1050,"riconosciutoIl":"2026-07-20","pagatoIl":"2026-07-22","nota":"Luglio segnalato entro il giorno 6, dopo la franchigia: coperto."},"assegnazione":"automatica"}'::jsonb, true
  from public.contratti k where k.codice_demo = 'c-tortona27';
insert into public.note_interne (entita_tipo, entita_id, autore_id, testo, il, di_prova)
select 'morosita', m.id, (select p.id from public.persone p where p.codice_demo = 'giorgio'), 'Documenti ricevuti: reddito ridotto da giugno. Tre rate da 350 € sono sostenibili insieme al canone.', '2026-07-22'::timestamptz, true
  from public.pratiche_morosita m where m.codice = 'mor-tortona27-2026-07';
insert into public.note_interne (entita_tipo, entita_id, autore_id, testo, il, di_prova)
select 'morosita', m.id, (select p.id from public.persone p where p.codice_demo = 'laura'), 'Piano approvato. Se salta una rata si valuta subito il passaggio al legale.', '2026-07-29'::timestamptz, true
  from public.pratiche_morosita m where m.codice = 'mor-tortona27-2026-07';
insert into public.note_interne (entita_tipo, entita_id, autore_id, testo, il, di_prova)
select 'morosita', m.id, (select p.id from public.persone p where p.codice_demo = 'giorgio'), 'Anche agosto arriva dopo la chiusura del mese (pratica a parte). Da seguire la rata del 20.', '2026-08-13'::timestamptz, true
  from public.pratiche_morosita m where m.codice = 'mor-tortona27-2026-07';
insert into public.contatti_morosita (morosita_id, il, canale, esito, nota, da_persona)
select m.id, '2026-07-13 09:30'::timestamptz, 'telefono', 'non_risponde', null,
       (select p.id from public.persone p where p.codice_demo = 'giorgio')
  from public.pratiche_morosita m where m.codice = 'mor-tortona27-2026-07';
insert into public.contatti_morosita (morosita_id, il, canale, esito, nota, da_persona)
select m.id, '2026-07-13 09:34'::timestamptz, 'sms', 'consegnato', 'Avviso del canone di luglio non pagato, con il numero da richiamare.',
       (select p.id from public.persone p where p.codice_demo = 'giorgio')
  from public.pratiche_morosita m where m.codice = 'mor-tortona27-2026-07';
insert into public.contatti_morosita (morosita_id, il, canale, esito, nota, da_persona)
select m.id, '2026-07-14 17:40'::timestamptz, 'telefono', 'non_risponde', null,
       (select p.id from public.persone p where p.codice_demo = 'giorgio')
  from public.pratiche_morosita m where m.codice = 'mor-tortona27-2026-07';
insert into public.contatti_morosita (morosita_id, il, canale, esito, nota, da_persona)
select m.id, '2026-07-15 10:05'::timestamptz, 'telefono', 'chiede_piano', 'Conferma la difficoltà: da giugno lavora a orario ridotto. Chiede di pagare luglio a rate.',
       (select p.id from public.persone p where p.codice_demo = 'giorgio')
  from public.pratiche_morosita m where m.codice = 'mor-tortona27-2026-07';
insert into public.contatti_morosita (morosita_id, il, canale, esito, nota, da_persona)
select m.id, '2026-07-15 10:40'::timestamptz, 'email', 'consegnato', 'Riepilogo della telefonata e documenti sul reddito da mandare per valutare le rate.',
       (select p.id from public.persone p where p.codice_demo = 'giorgio')
  from public.pratiche_morosita m where m.codice = 'mor-tortona27-2026-07';
insert into public.contatti_morosita (morosita_id, il, canale, esito, nota, da_persona)
select m.id, '2026-07-22 11:15'::timestamptz, 'email', 'chiede_piano', 'Manda i documenti: può sostenere 350 € al mese oltre al canone.',
       (select p.id from public.persone p where p.codice_demo = 'giorgio')
  from public.pratiche_morosita m where m.codice = 'mor-tortona27-2026-07';
insert into public.contatti_morosita (morosita_id, il, canale, esito, nota, da_persona)
select m.id, '2026-07-29 16:20'::timestamptz, 'email', 'consegnato', 'Piano approvato: tre rate da 350 €, da accettare nell’area personale.',
       (select p.id from public.persone p where p.codice_demo = 'giorgio')
  from public.pratiche_morosita m where m.codice = 'mor-tortona27-2026-07';
insert into public.contatti_morosita (morosita_id, il, canale, esito, nota, da_persona)
select m.id, '2026-08-17 09:00'::timestamptz, 'sms', 'consegnato', 'Promemoria della rata 1, in scadenza il 20 agosto.',
       (select p.id from public.persone p where p.codice_demo = 'giorgio')
  from public.pratiche_morosita m where m.codice = 'mor-tortona27-2026-07';
insert into public.piani_rientro (morosita_id, proposto_da, proposto_il, approvato_da, approvato_il, accettato_il, nota, n_rate, importo_totale, prima_scadenza, stato)
select m.id,
       (select p.id from public.persone p where p.codice_demo = 'giorgio'), '2026-07-27'::timestamptz,
       (select p.id from public.persone p where p.codice_demo = 'laura'), '2026-07-29'::timestamptz,
       '2026-08-02', 'Tre rate mensili da 350 €, il 20 di ogni mese. Reddito ridotto da giugno: la rata regge insieme al canone.', 3, 1050, '2026-08-20', 'attivo'
  from public.pratiche_morosita m where m.codice = 'mor-tortona27-2026-07';
insert into public.rate_rientro (piano_id, numero, scadenza, importo, pagata_il, stato)
select pi.id, 1, '2026-08-20', 350, '2026-08-19', 'pagata'
  from public.piani_rientro pi join public.pratiche_morosita m on m.id = pi.morosita_id where m.codice = 'mor-tortona27-2026-07';
insert into public.recuperi (morosita_id, data, importo, fonte)
select m.id, '2026-08-19', 350, 'rata' from public.pratiche_morosita m where m.codice = 'mor-tortona27-2026-07';
insert into public.rate_rientro (piano_id, numero, scadenza, importo, pagata_il, stato)
select pi.id, 2, '2026-09-20', 350, null, 'attesa'
  from public.piani_rientro pi join public.pratiche_morosita m on m.id = pi.morosita_id where m.codice = 'mor-tortona27-2026-07';
insert into public.rate_rientro (piano_id, numero, scadenza, importo, pagata_il, stato)
select pi.id, 3, '2026-10-20', 350, null, 'attesa'
  from public.piani_rientro pi join public.pratiche_morosita m on m.id = pi.morosita_id where m.codice = 'mor-tortona27-2026-07';

-- Gli indennizzi, con le tre firme: chi dispone, chi autorizza, chi esegue.
insert into public.indennizzi (morosita_id, mese, importo, stato, nota_istruttoria, disposto_da, disposto_il, autorizzato_da, autorizzato_il, eseguito_da, eseguito_il, pagato_il, riferimento, beneficiario_id)
select m.id, '2026-07', 1050, 'pagato', 'Segnalato il 4 luglio, dentro la finestra, e fuori franchigia: coperto. Il credito verso l’inquilina passa a CRIA.',
       (select p.id from public.persone p where p.codice_demo = 'beatrice'), '2026-07-20'::timestamptz,
       (select p.id from public.persone p where p.codice_demo = 'silvia'), '2026-07-21'::timestamptz,
       (select p.id from public.persone p where p.codice_demo = 'alberto'), '2026-07-22', '2026-07-22', 'CRIA20260722001',
       (select pos.persona_id from public.posizioni pos join public.contratti k on k.id = pos.contratto_id
         where k.codice_demo = 'c-tortona27' and pos.verso = 'locatore' and pos.al is null limit 1)
  from public.pratiche_morosita m where m.codice = 'mor-tortona27-2026-07';

-- CRIA Verifica: le richieste dei clienti, con il loro credito.
insert into public.richieste_verifica (codice, cliente_id, soggetto_nome, soggetto_cognome, soggetto_cf, soggetto_nascita, soggetto_luogo, consenso, stato, esito, richiesta_il, credito_importo, credito_scade_il, credito_usato_il, dati, di_prova)
select 'ver-elena-2026-09-10', p.id, 'Luca', 'Bianchi', 'BNCLCU90C11F839Z', '1990-03-11', 'Napoli', true,
       'evasa', 'verde', '2026-09-10'::timestamptz,
       47, '2026-10-10', null, '{"esito":{"tipo":"semaforo","il":"2026-09-11","semaforo":"verde","sintesi":"Storico rilevato da CRIA su 12 mesi: paga in media il giorno 3, nessun mese non pagato."}}'::jsonb, true
  from public.persone p where p.codice_demo = 'elena';
insert into public.richieste_verifica (codice, cliente_id, soggetto_nome, soggetto_cognome, soggetto_cf, soggetto_nascita, soggetto_luogo, consenso, stato, esito, richiesta_il, credito_importo, credito_scade_il, credito_usato_il, dati, di_prova)
select 'ver-elena-2026-08-20', p.id, 'Francesca', 'Serra', 'SRRFNC94E59H703Z', '1994-05-19', 'Salerno', true,
       'evasa', 'nessun_dato', '2026-08-20'::timestamptz,
       47, '2026-09-19', null, '{"esito":{"tipo":"nessuna_informazione","il":"2026-08-21"}}'::jsonb, true
  from public.persone p where p.codice_demo = 'elena';
insert into public.richieste_verifica (codice, cliente_id, soggetto_nome, soggetto_cognome, soggetto_cf, soggetto_nascita, soggetto_luogo, consenso, stato, esito, richiesta_il, credito_importo, credito_scade_il, credito_usato_il, dati, di_prova)
select 'ver-elena-2026-09-14', p.id, 'Andrea', 'Marino', 'MRNNDR88B06B963N', '1988-02-06', 'Caserta', true,
       'in_corso', null, '2026-09-14'::timestamptz,
       47, '2026-10-14', null, '{"esito":null}'::jsonb, true
  from public.persone p where p.codice_demo = 'elena';

-- Le autocandidature (il certificato che porta l'inquilino).
insert into public.autocandidature (codice, persona_id, stato, aperta_il, pagata_il, importo, dati, di_prova)
select 'auto-elena', p.id, 'aperta', '2026-09-05'::timestamptz,
       '2026-09-05', 47, '{"stato":"prove","pagamento":{"pagataIl":"2026-09-05","importo":47,"metodo":"carta"},"prove":[{"id":"prova-elena-contratto","tipo":"contratto_registrato","file":"Contratto Via Mazzini 3 registrato.pdf","dal":"2025-02","al":"2026-08","immobile":"Via Mazzini 3, Verona","estremi":{"numero":"TVE25T000871000PX","data":"2025-01-24","ufficio":"Agenzia delle Entrate · DP Verona"},"caricataIl":"2026-09-06"}],"inviataIl":null,"sottoMinimo":null,"conclusaIl":null,"certificatoId":null}'::jsonb, true
  from public.persone p where p.codice_demo = 'elena';

-- Le referenze chieste ai precedenti proprietari.
insert into public.referenze (autocandidatura_id, nome, email, telefono, immobile, dal, al, stato, giudizio, chiesta_il, risposta_il, token, tentativi, replica, risposta, inquilino, di_prova)
select x.id, 'Roberto Fabbri', 'roberto.fabbri@esempio.it', '+39 340 5512876', 'Via Mazzini 3, Verona',
       '2025-02-01', '2026-08-01', 'contattata', null, '2026-09-08'::timestamptz, null::timestamptz,
       'demo-referenza', '[{"canale":"email","il":"2026-09-08"}]'::jsonb, null, null, 'Elena Greco', true
  from public.autocandidature x where x.codice = 'auto-elena';

-- I certificati emessi.
insert into public.certificati (numero, persona_id, ambito, semaforo, fonte, emesso_il, periodo_dal, periodo_al, codice_pubblico, revocato_il, dati, di_prova)
select 'cert-giulia-2026-08', p.id, 'conduttore', 'verde', 'rilevato_cria', '2026-08-03'::timestamptz,
       '2025-08', '2026-07', 'CRIA-7K2Q-94HF', null::timestamptz, '{"verifiche":["2026-08-05 10:12","2026-08-05 18:40","2026-08-21 09:03"]}'::jsonb, true
  from public.persone p where p.codice_demo = 'giulia';
insert into public.certificati (numero, persona_id, ambito, semaforo, fonte, emesso_il, periodo_dal, periodo_al, codice_pubblico, revocato_il, dati, di_prova)
select 'cert-giulia-2026-02', p.id, 'conduttore', 'verde', 'rilevato_cria', '2026-02-10'::timestamptz,
       '2025-02', '2026-01', 'CRIA-3XDM-5PLA', '2026-03-01'::timestamptz, '{"verifiche":["2026-02-12 11:30"]}'::jsonb, true
  from public.persone p where p.codice_demo = 'giulia';

commit;
