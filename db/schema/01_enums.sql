-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 01_enums.sql                                                     ║
-- ║  Tutti gli enum in un file solo. Dipende da 00_extensions.sql.           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- REGOLA: qui stanno solo insiemi CHIUSI, che non cambiano senza un rilascio.
-- Tutto ciò che l'azienda può voler cambiare da sola — prodotti, ruoli,
-- causali di proroga, tipi di documento — sta in tabella, non qui.
-- Aggiungere un valore a un enum in produzione richiede una migration;
-- aggiungere una riga a una tabella no.

-- ─── Identità ──────────────────────────────────────────────────────────────

-- Persona fisica e persona giuridica sono soggetti distinti, con reputazioni
-- che non si sommano: il comportamento di pagamento di una società dipende da
-- fattori che con le finanze del titolare non c'entrano.
create type tipo_persona as enum ('fisica', 'giuridica');

create type tipo_account as enum ('privato', 'agenzia');

-- Il legame fra una persona e un contratto ha un verso. Una persona ha tante
-- posizioni quante ne ha, di verso diverso, contemporaneamente attive.
create type verso_posizione as enum (
    'locatore', 'conduttore', 'coobbligato', 'garante', 'delegato'
);

create type titolarita_immobile as enum ('proprietario', 'gestore');


-- ─── Prodotti ──────────────────────────────────────────────────────────────
-- NON esiste categoria_prodotto. I prodotti si distinguono per attributi
-- in colonna sulla tabella prodotti: aggiungerne uno è un INSERT.
-- Questi due sono gli unici insiemi davvero chiusi.

create type tipo_cliente as enum (
    'proprietario', 'agenzia', 'inquilino', 'occasionale'
);

create type modello_prezzo as enum (
    'percentuale_canone', 'abbonamento_annuo', 'abbonamento_mensile', 'una_tantum'
);

create type incasso_canone as enum ('proprietario', 'cria', 'non_applicabile');


-- ─── Pratiche e flussi ─────────────────────────────────────────────────────

create type tipo_flusso as enum (
    'AB',   -- il proprietario acquista un prodotto sui propri immobili
    'C',    -- interrogazione una tantum (P3)
    'D'     -- autocandidatura dell'inquilino (P7)
);

-- Nessun preventivo: il prezzo lo calcola il listino.
create type stato_pratica as enum (
    'onboarding_completato', 'documenti_caricati', 'documenti_da_integrare',
    'in_verifica', 'verificata', 'in_attesa_pagamento',
    'attiva', 'sospesa', 'chiusa', 'annullata'
);

create type stato_documento as enum (
    'in_attesa', 'verificato', 'rifiutato', 'da_integrare',
    'non_conforme'   -- estratto conto non filtrato: si rifiuta e si cancella
);


-- ─── Contratti ─────────────────────────────────────────────────────────────
-- Due stati separati: il rapporto locatore↔conduttore e il rapporto
-- locatore↔CRIA. "In scadenza" da solo era ambiguo.

create type stato_contratto as enum (
    'attivo', 'in_scadenza', 'vacante', 'sospeso', 'concluso'
);

create type stato_prodotto as enum (
    'attivo', 'in_scadenza', 'scaduto', 'cancellato'
);


-- ─── Ciclo mensile e segnalazioni ──────────────────────────────────────────

create type stato_pagamento as enum (
    'atteso', 'segnalato_pagato', 'segnalato_non_pagato',
    'contestato', 'verificato', 'confermato', 'insoluto'
);

-- non_rilevato è il valore che scrive il cron quando il proprietario non
-- segnala: pesa zero sul semaforo. Scrivere 'pagato' per silenzio significava
-- inventare un dato nell'unica cosa che CRIA vende.
create type tipo_segnalazione as enum ('pagato', 'non_pagato', 'non_rilevato');

create type fonte_segnalazione as enum ('locatore', 'cria', 'automatica');

-- La copertura decade sia per silenzio sia per segnalazione tardiva, ma una
-- segnalazione tardiva entra comunque nel semaforo: sono due conseguenze
-- separate, una punisce il ritardo del proprietario, l'altra registra il
-- comportamento dell'inquilino.
create type stato_copertura as enum (
    'attiva', 'in_franchigia', 'decaduta_mancata_segnalazione', 'decaduta_tardiva'
);


-- ─── Contestazioni ─────────────────────────────────────────────────────────

create type stato_contestazione as enum (
    'aperta', 'in_verifica', 'documentazione_richiesta',
    'risolta_favore_locatore', 'risolta_favore_inquilino', 'chiusa'
);


-- ─── Semaforo e reputazione ────────────────────────────────────────────────

-- storico_insufficiente non è un semaforo spento: è un esito a sé.
-- Mostrare verde a chi ha tre mesi di storico è esattamente il rischio
-- contro cui il prodotto è venduto.
create type semaforo as enum (
    'verde', 'giallo', 'rosso', 'storico_insufficiente'
);

-- Due reputazioni distinte che non si contaminano.
create type ambito_reputazione as enum ('conduttore', 'locatore');

-- La fonte non pesa, etichetta. Un coefficiente sarebbe indifendibile
-- (quanto vale 0,7 di un verde?), l'etichetta è una frase che si sostiene.
create type fonte_storico as enum (
    'rilevato_cria', 'verificato_su_documentazione'
);

-- Livelli di prova per l'autocandidatura. Il minimo per emettere un
-- certificato è due prove forti indipendenti su almeno dodici mesi.
create type livello_prova as enum ('forte', 'medio', 'debole');

create type esito_verifica as enum ('verde', 'giallo', 'rosso', 'nessun_dato');


-- ─── Garanzia e morosità ───────────────────────────────────────────────────

create type fonte_recupero as enum ('rata', 'saldo', 'esecuzione');


-- ─── Denaro ────────────────────────────────────────────────────────────────

create type stato_provvigione as enum (
    'maturata', 'prelevabile', 'in_attesa', 'pagata'
);

-- Stato di abbinamento di un movimento bancario al contratto.
-- La causale col codice univoco funziona solo se chi paga la scrive:
-- quello che non si abbina da solo finisce in coda manuale.
create type stato_abbinamento as enum (
    'da_abbinare', 'abbinato_automatico', 'abbinato_manuale', 'non_abbinabile'
);


-- ─── Operatività interna ───────────────────────────────────────────────────

create type tipo_assegnazione as enum ('referente', 'gestore', 'avvocato');

-- accessi_log registra le LETTURE, audit_log registra le MODIFICHE.
-- 'deroga' è il vetro da rompere: accesso immediato a un fascicolo non
-- assegnato, con motivo, che finisce nel rapporto mensile del DPO.
create type tipo_accesso_log as enum ('normale', 'deroga', 'sessione_tecnica');

create type stato_ticket as enum ('aperto', 'in_corso', 'risolto');

-- Canale di notifica tenuto generico di proposito: il provider SMS non è
-- ancora scelto e la push arriva con l'app. Aggiungerne uno non deve
-- richiedere una migration dello schema.
create type canale_notifica as enum ('email', 'sms', 'push', 'in_app');
