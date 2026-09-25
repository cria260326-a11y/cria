-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 32_ciclo_mensile.sql                                             ║
-- ║  Il mese: canoni attesi e ricevuti, segnalazioni, contestazioni e i      ║
-- ║  movimenti del conto. Si esegue dopo 31_pratiche_documenti.sql.          ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- IL CICLO (§9.2). Ogni mese, per ogni contratto, una riga in canoni_mese:
-- quanto era atteso, quanto è arrivato, quando. Con i prodotti dove incassa
-- CRIA il dato viene dal conto; con gli altri è il proprietario che segnala.
-- Se nessuno segnala entro l'11, il sistema scrive 'non_rilevato': non è
-- «pagato». Scrivere «pagato» per silenzio significherebbe inventare un dato
-- nell'unica cosa che CRIA vende.
--
-- LA CONTESTAZIONE (§9.3) è dell'inquilino contro una segnalazione di non
-- pagamento: si apre entro la finestra, CRIA risponde entro i giorni del
-- parametro, e una rettifica del semaforo vuole due firme diverse.
--
-- Il mese si scrive 'AAAA-MM'. È una data monca di proposito: il canone di
-- settembre resta il canone di settembre anche se arriva il 3 ottobre.

-- ─── Canoni del mese ─────────────────────────────────────────────────────────
create table if not exists public.canoni_mese (
    id                  uuid primary key default gen_random_uuid(),
    contratto_id        uuid not null references public.contratti (id) on delete cascade,
    mese                text not null check (mese ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
    importo_atteso      numeric(10, 2) not null check (importo_atteso >= 0),
    importo_ricevuto    numeric(10, 2) check (importo_ricevuto is null or importo_ricevuto >= 0),
    pagato_il           date,
    giorno              integer check (giorno is null or giorno between 1 and 31),
    metodo              text,
    stato               stato_pagamento not null default 'atteso',
    fonte               fonte_segnalazione,
    -- Quando CRIA incassa e gira: quanto trattiene e quando ha girato.
    commissione         numeric(10, 2) check (commissione is null or commissione >= 0),
    girato_il           date,
    importo_girato      numeric(10, 2) check (importo_girato is null or importo_girato >= 0),
    -- Una rettifica dopo una contestazione non cancella la storia: resta qui.
    rettificato_il      timestamptz,
    rettificato_da      uuid references public.persone (id) on delete set null,
    creato_il           timestamptz not null default now(),
    aggiornato_il       timestamptz not null default now(),
    unique (contratto_id, mese)
);
create index if not exists canoni_mese_mese_idx on public.canoni_mese (mese);
drop trigger if exists canoni_mese_aggiornato on public.canoni_mese;
create trigger canoni_mese_aggiornato before update on public.canoni_mese
    for each row execute function public.tocca_aggiornato_il();

-- ─── Segnalazioni ────────────────────────────────────────────────────────────
-- Il fatto grezzo: chi ha detto cosa, quando. Non si modifica: se il
-- proprietario cambia idea, arriva un'altra riga.
create table if not exists public.segnalazioni (
    id              uuid primary key default gen_random_uuid(),
    contratto_id    uuid not null references public.contratti (id) on delete cascade,
    mese            text not null check (mese ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
    tipo            tipo_segnalazione not null,
    fonte           fonte_segnalazione not null,
    autore_id       uuid references public.persone (id) on delete set null,
    il              timestamptz not null default now(),
    -- Fuori finestra: conta per il semaforo, ma la copertura del mese decade.
    tardiva         boolean not null default false,
    contestabile    boolean not null default true,
    contestata      boolean not null default false,
    note            text
);
create index if not exists segnalazioni_contratto_idx on public.segnalazioni (contratto_id, mese);

-- ─── Contestazioni ───────────────────────────────────────────────────────────
create table if not exists public.contestazioni (
    id                  uuid primary key default gen_random_uuid(),
    segnalazione_id     uuid references public.segnalazioni (id) on delete set null,
    contratto_id        uuid not null references public.contratti (id) on delete cascade,
    mese                text not null check (mese ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
    aperta_da           uuid references public.persone (id) on delete set null,
    aperta_il           timestamptz not null default now(),
    motivo              text,
    stato               stato_contestazione not null default 'aperta',
    -- Entro quando CRIA deve rispondere.
    termine             date,
    assegnata_a         uuid references public.persone (id) on delete set null,
    esito               text,
    chiusa_da           uuid references public.persone (id) on delete set null,
    chiusa_il           timestamptz,
    -- La rettifica del semaforo vuole due firme diverse (§13.4).
    rettifica           boolean not null default false,
    prima_firma_da      uuid references public.persone (id) on delete set null,
    prima_firma_il      timestamptz,
    seconda_firma_da    uuid references public.persone (id) on delete set null,
    seconda_firma_il    timestamptz,
    seconda_firma_entro date,
    aggiornato_il       timestamptz not null default now(),
    check (seconda_firma_da is null or prima_firma_da is null or seconda_firma_da <> prima_firma_da)
);
create index if not exists contestazioni_contratto_idx on public.contestazioni (contratto_id, mese);
create index if not exists contestazioni_aperte_idx on public.contestazioni (stato) where chiusa_il is null;
drop trigger if exists contestazioni_aggiornato on public.contestazioni;
create trigger contestazioni_aggiornato before update on public.contestazioni
    for each row execute function public.tocca_aggiornato_il();

create table if not exists public.contestazioni_messaggi (
    id                  uuid primary key default gen_random_uuid(),
    contestazione_id    uuid not null references public.contestazioni (id) on delete cascade,
    autore_id           uuid references public.persone (id) on delete set null,
    -- Un messaggio interno non lo legge il cliente.
    interno             boolean not null default false,
    testo               text not null,
    il                  timestamptz not null default now()
);
create index if not exists contestazioni_messaggi_idx on public.contestazioni_messaggi (contestazione_id, il);

-- ─── Movimenti del conto ─────────────────────────────────────────────────────
-- Quello che arriva sul conto di CRIA. La causale col codice del contratto
-- fa l'abbinamento da sé; quello che non si abbina finisce in coda manuale
-- (O-12), e chi lo abbina resta scritto.
create table if not exists public.movimenti_banca (
    id              uuid primary key default gen_random_uuid(),
    data            date not null,
    importo         numeric(10, 2) not null,
    valuta          text not null default 'EUR' check (valuta ~ '^[A-Z]{3}$'),
    causale         text,
    ordinante       text,
    iban_ordinante  text,
    riferimento     text unique,
    stato           stato_abbinamento not null default 'da_abbinare',
    contratto_id    uuid references public.contratti (id) on delete set null,
    mese            text check (mese is null or mese ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
    abbinato_da     uuid references public.persone (id) on delete set null,
    abbinato_il     timestamptz,
    nota            text,
    caricato_il     timestamptz not null default now()
);
create index if not exists movimenti_banca_coda_idx on public.movimenti_banca (data) where stato = 'da_abbinare';
create index if not exists movimenti_banca_contratto_idx on public.movimenti_banca (contratto_id, mese);

-- ─── Chi legge ───────────────────────────────────────────────────────────────
alter table public.canoni_mese enable row level security;
alter table public.segnalazioni enable row level security;
alter table public.contestazioni enable row level security;
alter table public.contestazioni_messaggi enable row level security;
alter table public.movimenti_banca enable row level security;

drop policy if exists canoni_mese_interni on public.canoni_mese;
create policy canoni_mese_interni on public.canoni_mese for select to authenticated using ((select public.e_interno()));
drop policy if exists segnalazioni_interni on public.segnalazioni;
create policy segnalazioni_interni on public.segnalazioni for select to authenticated using ((select public.e_interno()));
drop policy if exists contestazioni_interni on public.contestazioni;
create policy contestazioni_interni on public.contestazioni for select to authenticated using ((select public.e_interno()));
drop policy if exists contestazioni_messaggi_interni on public.contestazioni_messaggi;
create policy contestazioni_messaggi_interni on public.contestazioni_messaggi for select to authenticated using ((select public.e_interno()));
-- I movimenti del conto li vede chi segue gli incassi, non tutti gli interni.
drop policy if exists movimenti_banca_incassi on public.movimenti_banca;
create policy movimenti_banca_incassi on public.movimenti_banca for select to authenticated
    using ((select public.e_admin()) or (select public.ha_funzione('incassi')) or (select public.ha_funzione('tesoreria'))
        or (select public.ha_funzione('resp_amministrativo')) or (select public.ha_funzione('responsabile_operativo')));
