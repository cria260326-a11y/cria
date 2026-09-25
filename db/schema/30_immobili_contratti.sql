-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 30_immobili_contratti.sql                                        ║
-- ║  Immobili, titolarità, prodotti, contratti e posizioni.                  ║
-- ║  Si esegue dopo 01_enums.sql e 20_persone.sql.                           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- I TRE LIVELLI (§13.2 del documento di stato). Proprietario e inquilino non
-- sono tipi di persona: sono posizioni che una persona occupa su un contratto,
-- e la stessa persona ne ha quante ne vuole, contemporaneamente attive.
--   persona    una sola anagrafica, id immutabile        (20_persone.sql)
--   contratto  immobile, canone, date, e il CODICE che è la causale del bonifico
--   posizione  persona ↔ contratto, con un verso: locatore, conduttore,
--              coobbligato, garante, delegato
-- Per questo qui non esistono contratti.locatore_id né contratti.inquilino_id.
--
-- Le tabelle nascono vuote: i dati di contratti, pratiche e pagamenti vivono
-- ancora nel codice (dati di prova) e ci passeranno una schermata alla volta.
--
-- CHI LEGGE, per ora: chi lavora dentro CRIA. Le regole per proprietari e
-- inquilini si scrivono quando le pagine leggeranno da qui: le tabelle vuote
-- non devono essere aperte a nessun altro nel frattempo.
-- CHI SCRIVE: nessuno direttamente, come per le persone. Si passerà da
-- funzioni che controllano chi agisce e registrano cosa è cambiato.

-- ─── Il timbro dell'ultima modifica ──────────────────────────────────────────
-- Una funzione sola per tutte le tabelle che hanno aggiornato_il.
create or replace function public.tocca_aggiornato_il()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.aggiornato_il := now();
    return new;
end;
$$;

-- ─── Immobili ────────────────────────────────────────────────────────────────
-- L'id non cambia mai: l'immobile resta lo stesso anche quando cambia
-- proprietario, e il suo storico è quello che dà valore al semaforo (§9.4).
create table if not exists public.immobili (
    id              uuid primary key default gen_random_uuid(),
    codice          text unique,
    indirizzo       text not null check (length(indirizzo) between 2 and 160),
    civico          text check (civico is null or length(civico) <= 12),
    cap             text check (cap is null or cap ~ '^[0-9]{5}$'),
    citta           text not null check (length(citta) between 2 and 80),
    provincia       text check (provincia is null or provincia ~ '^[A-Z]{2}$'),
    paese           text not null default 'IT' check (paese ~ '^[A-Z]{2}$'),
    latitudine      numeric(9, 6) check (latitudine is null or latitudine between -90 and 90),
    longitudine     numeric(9, 6) check (longitudine is null or longitudine between -180 and 180),
    tipologia       text,
    mq              integer check (mq is null or mq between 1 and 10000),
    piano           text,
    catastale       jsonb,
    stato           text not null default 'in_pratica' check (stato in ('in_pratica', 'attivo', 'vacante', 'uscito')),
    note            text,
    creato_il       timestamptz not null default now(),
    aggiornato_il   timestamptz not null default now()
);
create index if not exists immobili_citta_idx on public.immobili (citta, indirizzo);
drop trigger if exists immobili_aggiornato on public.immobili;
create trigger immobili_aggiornato before update on public.immobili
    for each row execute function public.tocca_aggiornato_il();

-- ─── Titolarità ──────────────────────────────────────────────────────────────
-- Chi possiede o gestisce l'immobile, con le date: è lo storico dei passaggi
-- di proprietà. Caso particolare delle posizioni, ma sull'immobile e non sul
-- contratto: un immobile può cambiare proprietario a contratto in corso.
create table if not exists public.titolarita (
    id              uuid primary key default gen_random_uuid(),
    immobile_id     uuid not null references public.immobili (id) on delete cascade,
    persona_id      uuid not null references public.persone (id) on delete restrict,
    tipo            titolarita_immobile not null default 'proprietario',
    quota           numeric(5, 2) check (quota is null or quota between 0 and 100),
    dal             date not null,
    al              date,
    creato_il       timestamptz not null default now(),
    check (al is null or al >= dal)
);
create index if not exists titolarita_immobile_idx on public.titolarita (immobile_id, dal desc);
create index if not exists titolarita_persona_idx on public.titolarita (persona_id);

-- ─── Prodotti ────────────────────────────────────────────────────────────────
-- Nessun enum di categoria: i prodotti si distinguono per attributi in colonna,
-- e aggiungerne uno è un INSERT (§14.2). Oggi il listino che si vede nelle
-- pagine sta nel documento 'prodotti' di documenti_sito, scritto dall'admin:
-- questa tabella è dove andrà quando i contratti saranno nel database.
create table if not exists public.prodotti (
    codice              text primary key check (codice ~ '^[A-Z][A-Z0-9]{0,7}$'),
    nome                text not null,
    descrizione         text,
    per_cliente         tipo_cliente not null default 'proprietario',
    modello_prezzo      modello_prezzo not null,
    percentuale_canone  numeric(5, 2) check (percentuale_canone is null or percentuale_canone between 0 and 100),
    prezzo              numeric(10, 2) check (prezzo is null or prezzo >= 0),
    prezzo_annuo        numeric(10, 2) check (prezzo_annuo is null or prezzo_annuo >= 0),
    prezzo_mensile      numeric(10, 2) check (prezzo_mensile is null or prezzo_mensile >= 0),
    quota_app_annua     numeric(10, 2) check (quota_app_annua is null or quota_app_annua >= 0),
    quota_iscrizione    numeric(10, 2) check (quota_iscrizione is null or quota_iscrizione >= 0),
    garanzia            boolean not null default false,
    franchigia_mesi     integer check (franchigia_mesi is null or franchigia_mesi >= 0),
    incassa             incasso_canone not null default 'proprietario',
    provvigione         numeric(5, 2) check (provvigione is null or provvigione between 0 and 100),
    compenso_avvocato   numeric(10, 2) check (compenso_avvocato is null or compenso_avvocato >= 0),
    -- Dove il cliente manda il bonifico e come scrive la causale.
    dati_bancari        jsonb,
    funzionalita        text[],
    attivo              boolean not null default true,
    ordine              integer not null default 0,
    creato_il           timestamptz not null default now(),
    aggiornato_il       timestamptz not null default now()
);
drop trigger if exists prodotti_aggiornato on public.prodotti;
create trigger prodotti_aggiornato before update on public.prodotti
    for each row execute function public.tocca_aggiornato_il();

-- ─── Contratti ───────────────────────────────────────────────────────────────
-- Il codice è la causale del bonifico: è quello che fa riconoscere un
-- pagamento senza chiedere niente a nessuno (§13.2, riconciliazione O-12).
-- Due stati separati: il rapporto locatore↔conduttore e quello locatore↔CRIA.
create table if not exists public.contratti (
    id                  uuid primary key default gen_random_uuid(),
    codice              text not null unique check (length(codice) between 4 and 40),
    immobile_id         uuid not null references public.immobili (id) on delete restrict,
    prodotto            text references public.prodotti (codice) on delete restrict,
    canone              numeric(10, 2) not null check (canone > 0),
    giorno_scadenza     integer not null default 5 check (giorno_scadenza between 1 and 31),
    data_inizio         date not null,
    data_fine           date,
    durata_mesi         integer check (durata_mesi is null or durata_mesi > 0),
    tipo_contratto      text,
    deposito            numeric(10, 2) check (deposito is null or deposito >= 0),
    -- Da quando c'è CRIA su questo contratto: la franchigia della garanzia
    -- e il primo mese del semaforo si contano da qui, non dall'inizio.
    attivo_dal          date,
    stato               stato_contratto not null default 'attivo',
    stato_prodotto      stato_prodotto not null default 'attivo',
    concluso_il         date,
    note                text,
    creato_il           timestamptz not null default now(),
    aggiornato_il       timestamptz not null default now(),
    check (data_fine is null or data_fine >= data_inizio)
);
create index if not exists contratti_immobile_idx on public.contratti (immobile_id);
create index if not exists contratti_stato_idx on public.contratti (stato) where stato <> 'concluso';
drop trigger if exists contratti_aggiornato on public.contratti;
create trigger contratti_aggiornato before update on public.contratti
    for each row execute function public.tocca_aggiornato_il();

-- ─── Posizioni ───────────────────────────────────────────────────────────────
-- Il legame persona ↔ contratto, con il verso. Coobbligato e garante sono le
-- figure che contano quando si recupera un credito: senza questa tabella non
-- esistono da nessuna parte.
create table if not exists public.posizioni (
    id              uuid primary key default gen_random_uuid(),
    contratto_id    uuid not null references public.contratti (id) on delete cascade,
    persona_id      uuid not null references public.persone (id) on delete restrict,
    verso           verso_posizione not null,
    quota           numeric(5, 2) check (quota is null or quota between 0 and 100),
    dal             date not null,
    al              date,
    creato_il       timestamptz not null default now(),
    unique (contratto_id, persona_id, verso, dal),
    check (al is null or al >= dal)
);
create index if not exists posizioni_persona_idx on public.posizioni (persona_id, verso);
create index if not exists posizioni_contratto_idx on public.posizioni (contratto_id, verso);

-- ─── Chi legge ───────────────────────────────────────────────────────────────
alter table public.immobili enable row level security;
alter table public.titolarita enable row level security;
alter table public.prodotti enable row level security;
alter table public.contratti enable row level security;
alter table public.posizioni enable row level security;

drop policy if exists immobili_interni on public.immobili;
create policy immobili_interni on public.immobili for select to authenticated using ((select public.e_interno()));
drop policy if exists titolarita_interni on public.titolarita;
create policy titolarita_interni on public.titolarita for select to authenticated using ((select public.e_interno()));
drop policy if exists contratti_interni on public.contratti;
create policy contratti_interni on public.contratti for select to authenticated using ((select public.e_interno()));
drop policy if exists posizioni_interni on public.posizioni;
create policy posizioni_interni on public.posizioni for select to authenticated using ((select public.e_interno()));

-- Il listino attivo lo legge chiunque sia entrato: è quello che si compra.
drop policy if exists prodotti_attivi on public.prodotti;
create policy prodotti_attivi on public.prodotti for select to authenticated using (attivo or (select public.e_interno()));
