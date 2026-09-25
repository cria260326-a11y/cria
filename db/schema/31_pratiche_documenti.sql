-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 31_pratiche_documenti.sql                                        ║
-- ║  La pratica (l'oggetto centrale) e i documenti, con la loro              ║
-- ║  conservazione. Si esegue dopo 30_immobili_contratti.sql.                ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- LA PRATICA è l'unità di lavoro: nasce quando qualcuno compra, passa per i
-- documenti e l'istruttoria, e finisce in un contratto attivo (§1.4).
-- Tre flussi: AB il proprietario che compra sui suoi immobili, C
-- l'interrogazione una tantum (P3), D l'autocandidatura dell'inquilino (P7).
--
-- I DOCUMENTI stanno tutti in una tabella sola, agganciati a qualsiasi cosa
-- (entita_tipo + entita_id): la pratica, il contratto, la persona, la
-- contestazione. Il file non sta qui: qui c'è il percorso nello storage.
-- cancellare_il è la data oltre la quale il documento non si tiene: i
-- documenti dei candidati non assunti si cancellano a 30 giorni dalla
-- delibera (§14.5), e quella data si scrive quando il documento arriva, non
-- quando ci si ricorda.

-- ─── Pratiche ────────────────────────────────────────────────────────────────
create table if not exists public.pratiche (
    id                  uuid primary key default gen_random_uuid(),
    codice              text not null unique,
    persona_id          uuid not null references public.persone (id) on delete restrict,
    tipo_flusso         tipo_flusso not null default 'AB',
    prodotto            text references public.prodotti (codice) on delete restrict,
    stato               stato_pratica not null default 'onboarding_completato',
    canone              numeric(10, 2) check (canone is null or canone > 0),
    prezzo              numeric(10, 2) check (prezzo is null or prezzo >= 0),
    quota_pagata_il     date,
    pagata_il           date,
    importo_pagato      numeric(10, 2) check (importo_pagato is null or importo_pagato >= 0),
    -- Il contratto nasce dalla pratica: finché non è firmato resta vuoto.
    contratto_id        uuid references public.contratti (id) on delete set null,
    -- Chi l'ha portata e chi la segue. L'assegnazione vera, con le date, sta
    -- in assegnazioni (37): questi sono i due legami che non cambiano mai.
    codice_referente    text,
    commerciale_id      uuid references public.persone (id) on delete set null,
    avvocato_id         uuid references public.persone (id) on delete set null,
    aperta_il           timestamptz not null default now(),
    conclusa_il         timestamptz,
    esito               text,
    motivo_esito        text,
    note                text,
    aggiornato_il       timestamptz not null default now()
);
create index if not exists pratiche_persona_idx on public.pratiche (persona_id);
create index if not exists pratiche_stato_idx on public.pratiche (stato) where stato not in ('attiva', 'chiusa', 'annullata');
drop trigger if exists pratiche_aggiornato on public.pratiche;
create trigger pratiche_aggiornato before update on public.pratiche
    for each row execute function public.tocca_aggiornato_il();

-- Una pratica può coprire più immobili: il proprietario con sei appartamenti
-- non apre sei pratiche.
create table if not exists public.pratiche_immobili (
    pratica_id      uuid not null references public.pratiche (id) on delete cascade,
    immobile_id     uuid not null references public.immobili (id) on delete restrict,
    canone          numeric(10, 2) check (canone is null or canone > 0),
    creato_il       timestamptz not null default now(),
    primary key (pratica_id, immobile_id)
);

-- ─── Documenti ───────────────────────────────────────────────────────────────
create table if not exists public.documenti (
    id              uuid primary key default gen_random_uuid(),
    -- Di chi è il documento: la persona a cui i dati si riferiscono.
    persona_id      uuid references public.persone (id) on delete set null,
    entita_tipo     text not null check (entita_tipo in (
                        'pratica', 'contratto', 'persona', 'immobile', 'contestazione',
                        'morosita', 'verifica', 'autocandidatura', 'indennizzo')),
    entita_id       uuid not null,
    tipo            text not null,
    nome_file       text,
    percorso        text,
    mime            text,
    dimensione      bigint check (dimensione is null or dimensione >= 0),
    stato           stato_documento not null default 'in_attesa',
    -- Chi verifica non è chi carica: la verifica è umana, documento per
    -- documento, e resta scritta (§14.5).
    caricato_da     uuid references public.persone (id) on delete set null,
    caricato_il     timestamptz not null default now(),
    verificato_da   uuid references public.persone (id) on delete set null,
    verificato_il   timestamptz,
    motivo          text,
    note_interne    text,
    scadenza        date,
    -- Conservazione: oltre questa data il documento si cancella, e il sistema
    -- lo fa da sé (cron). Vuoto = si tiene finché serve il contratto.
    cancellare_il   date,
    cancellato_il   timestamptz,
    sensibile       boolean not null default false
);
create index if not exists documenti_entita_idx on public.documenti (entita_tipo, entita_id);
create index if not exists documenti_persona_idx on public.documenti (persona_id);
create index if not exists documenti_da_cancellare_idx on public.documenti (cancellare_il) where cancellato_il is null and cancellare_il is not null;

-- Quali documenti servono, per prodotto e per flusso: la lista non è nel
-- codice, così cambiarla non è un rilascio.
create table if not exists public.documenti_richiesti (
    id              uuid primary key default gen_random_uuid(),
    prodotto        text references public.prodotti (codice) on delete cascade,
    tipo_flusso     tipo_flusso,
    tipo            text not null,
    etichetta       text not null,
    -- Chi lo porta: il proprietario, il candidato, l'inquilino già dentro.
    di              text not null default 'proprietario' check (di in ('proprietario', 'candidato', 'inquilino', 'cria')),
    obbligatorio    boolean not null default true,
    condizione      text,
    giorni_conservazione integer check (giorni_conservazione is null or giorni_conservazione >= 0),
    ordine          integer not null default 0,
    attivo          boolean not null default true
);
create index if not exists documenti_richiesti_prodotto_idx on public.documenti_richiesti (prodotto, ordine);

-- ─── Chi legge ───────────────────────────────────────────────────────────────
alter table public.pratiche enable row level security;
alter table public.pratiche_immobili enable row level security;
alter table public.documenti enable row level security;
alter table public.documenti_richiesti enable row level security;

drop policy if exists pratiche_interni on public.pratiche;
create policy pratiche_interni on public.pratiche for select to authenticated using ((select public.e_interno()));
drop policy if exists pratiche_immobili_interni on public.pratiche_immobili;
create policy pratiche_immobili_interni on public.pratiche_immobili for select to authenticated using ((select public.e_interno()));
drop policy if exists documenti_interni on public.documenti;
create policy documenti_interni on public.documenti for select to authenticated using ((select public.e_interno()));
drop policy if exists documenti_richiesti_tutti on public.documenti_richiesti;
create policy documenti_richiesti_tutti on public.documenti_richiesti for select to authenticated using (attivo or (select public.e_interno()));
