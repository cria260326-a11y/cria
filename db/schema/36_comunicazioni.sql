-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 36_comunicazioni.sql                                             ║
-- ║  Conversazioni con i clienti, notifiche, email e SMS partiti.            ║
-- ║  Si esegue dopo 35_verifiche_certificati.sql.                            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Sono i `ticket` e l'`email_log` del §6.8, con i nomi che usano le pagine.
-- Una conversazione è un filo con una persona: assistenza, una contestazione,
-- una richiesta di documenti. I messaggi interni non li legge il cliente, e
-- questo lo decide una colonna, non il modo in cui si mostra la pagina.
--
-- I MODELLI delle email stanno in tabella e non nel codice: cambiare il testo
-- di un sollecito non deve essere un rilascio.

-- ─── Conversazioni ───────────────────────────────────────────────────────────
create table if not exists public.conversazioni (
    id                  uuid primary key default gen_random_uuid(),
    codice              text unique,
    oggetto             text not null,
    categoria           text,
    aperta_da           uuid references public.persone (id) on delete set null,
    -- Da che area è stata aperta: la stessa persona può scrivere come
    -- proprietario di un immobile e come inquilino di un altro.
    area                text check (area is null or area in ('locatore', 'inquilino', 'cliente', 'commerciale', 'avvocato', 'admin')),
    assegnata_a         uuid references public.persone (id) on delete set null,
    stato               stato_ticket not null default 'aperto',
    priorita            text not null default 'normale' check (priorita in ('bassa', 'normale', 'alta', 'urgente')),
    -- A cosa si riferisce, se si riferisce a qualcosa.
    entita_tipo         text,
    entita_id           uuid,
    termine             date,
    ultimo_messaggio_il timestamptz,
    chiusa_il           timestamptz,
    creato_il           timestamptz not null default now(),
    aggiornato_il       timestamptz not null default now()
);
create index if not exists conversazioni_aperte_idx on public.conversazioni (stato, ultimo_messaggio_il desc) where chiusa_il is null;
create index if not exists conversazioni_persona_idx on public.conversazioni (aperta_da);
drop trigger if exists conversazioni_aggiornato on public.conversazioni;
create trigger conversazioni_aggiornato before update on public.conversazioni
    for each row execute function public.tocca_aggiornato_il();

create table if not exists public.messaggi (
    id                  uuid primary key default gen_random_uuid(),
    conversazione_id    uuid not null references public.conversazioni (id) on delete cascade,
    autore_id           uuid references public.persone (id) on delete set null,
    -- Da CRIA o dal cliente: quello che scrivo io sta a destra, quello che
    -- ricevo a sinistra, e la differenza è questa colonna.
    da_cria             boolean not null default false,
    interno             boolean not null default false,
    testo               text not null,
    allegati            jsonb,
    il                  timestamptz not null default now(),
    letto_il            timestamptz
);
create index if not exists messaggi_conversazione_idx on public.messaggi (conversazione_id, il);

-- ─── Notifiche ───────────────────────────────────────────────────────────────
create table if not exists public.notifiche (
    id              uuid primary key default gen_random_uuid(),
    destinatario_id uuid not null references public.persone (id) on delete cascade,
    canale          canale_notifica not null default 'in_app',
    tipo            text not null,
    titolo          text not null,
    testo           text,
    link            text,
    entita_tipo     text,
    entita_id       uuid,
    creata_il       timestamptz not null default now(),
    letta_il        timestamptz
);
create index if not exists notifiche_destinatario_idx on public.notifiche (destinatario_id, creata_il desc);
create index if not exists notifiche_da_leggere_idx on public.notifiche (destinatario_id) where letta_il is null;

-- ─── Modelli e invii ─────────────────────────────────────────────────────────
create table if not exists public.modelli_comunicazione (
    chiave          text primary key,
    canale          canale_notifica not null default 'email',
    nome            text not null,
    oggetto         text,
    corpo           text not null,
    variabili       text[],
    attivo          boolean not null default true,
    aggiornato_il   timestamptz not null default now(),
    aggiornato_da   uuid references public.persone (id) on delete set null
);
drop trigger if exists modelli_aggiornato on public.modelli_comunicazione;
create trigger modelli_aggiornato before update on public.modelli_comunicazione
    for each row execute function public.tocca_aggiornato_il();

-- Quello che è partito davvero, con l'esito del provider: senza questo non si
-- sa se il sollecito è arrivato, e il termine di una fase non si difende.
create table if not exists public.comunicazioni (
    id              uuid primary key default gen_random_uuid(),
    canale          canale_notifica not null default 'email',
    modello         text references public.modelli_comunicazione (chiave) on delete set null,
    persona_id      uuid references public.persone (id) on delete set null,
    destinatario    text not null,
    oggetto         text,
    corpo           text,
    entita_tipo     text,
    entita_id       uuid,
    stato           text not null default 'in_coda' check (stato in ('in_coda', 'inviata', 'consegnata', 'aperta', 'errore', 'respinta')),
    id_provider     text,
    errore          text,
    creata_il       timestamptz not null default now(),
    inviata_il      timestamptz,
    consegnata_il   timestamptz
);
create index if not exists comunicazioni_persona_idx on public.comunicazioni (persona_id, creata_il desc);
create index if not exists comunicazioni_coda_idx on public.comunicazioni (stato) where stato = 'in_coda';

-- ─── Chi legge ───────────────────────────────────────────────────────────────
alter table public.conversazioni enable row level security;
alter table public.messaggi enable row level security;
alter table public.notifiche enable row level security;
alter table public.modelli_comunicazione enable row level security;
alter table public.comunicazioni enable row level security;

drop policy if exists conversazioni_interni on public.conversazioni;
create policy conversazioni_interni on public.conversazioni for select to authenticated using ((select public.e_interno()));
drop policy if exists messaggi_interni on public.messaggi;
create policy messaggi_interni on public.messaggi for select to authenticated using ((select public.e_interno()));
-- Le notifiche le legge chi le riceve: è l'unica cosa qui dentro che è sua.
drop policy if exists notifiche_mie on public.notifiche;
create policy notifiche_mie on public.notifiche for select to authenticated
    using (destinatario_id = (select public.mia_persona()) or (select public.e_interno()));
drop policy if exists modelli_interni on public.modelli_comunicazione;
create policy modelli_interni on public.modelli_comunicazione for select to authenticated using ((select public.e_interno()));
drop policy if exists comunicazioni_interni on public.comunicazioni;
create policy comunicazioni_interni on public.comunicazioni for select to authenticated using ((select public.e_interno()));
