-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 33_garanzia.sql                                                  ║
-- ║  La garanzia: polizza, copertura del mese, morosità, indennizzi, piani   ║
-- ║  di rientro, recuperi e riassicurazione.                                 ║
-- ║  Si esegue dopo 32_ciclo_mensile.sql.                                    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- È l'area che giustifica il prezzo del prodotto (§14.3), e fino a oggi non
-- c'era niente nello schema.
--
-- COME GIRA. La copertura di un mese è attiva se il contratto ha la garanzia,
-- la franchigia è passata e la segnalazione è arrivata nella finestra. Se
-- l'inquilino non paga, si apre una pratica di morosità: un gestore lo
-- contatta, propone un piano di rientro, e intanto il proprietario prende
-- l'indennizzo. Pagato l'indennizzo, il credito verso l'inquilino passa a
-- CRIA, e le rate del piano lo riportano indietro.
--
-- LE DUE FIRME. Chi dispone non autorizza, chi propone non approva (§13.4).
-- Qui il vincolo è del database, non dell'interfaccia: un CHECK, non una
-- validazione React. Se sono la stessa persona, l'INSERT viene rifiutato.

-- ─── Polizze ─────────────────────────────────────────────────────────────────
create table if not exists public.polizze (
    id                  uuid primary key default gen_random_uuid(),
    contratto_id        uuid not null references public.contratti (id) on delete cascade,
    compagnia           text,
    numero              text,
    premio_annuo        numeric(10, 2) check (premio_annuo is null or premio_annuo >= 0),
    decorrenza          date not null,
    scadenza            date,
    franchigia_mesi     integer not null default 0 check (franchigia_mesi >= 0),
    massimale           numeric(12, 2) check (massimale is null or massimale >= 0),
    provvigione_cria    numeric(5, 2) check (provvigione_cria is null or provvigione_cria between 0 and 100),
    creato_il           timestamptz not null default now(),
    aggiornato_il       timestamptz not null default now(),
    check (scadenza is null or scadenza >= decorrenza)
);
create index if not exists polizze_contratto_idx on public.polizze (contratto_id);
drop trigger if exists polizze_aggiornato on public.polizze;
create trigger polizze_aggiornato before update on public.polizze
    for each row execute function public.tocca_aggiornato_il();

-- ─── Copertura del mese ──────────────────────────────────────────────────────
-- Una riga per contratto e per mese: dice se quel mese era coperto, e se no
-- perché. Si scrive alla chiusura del mese e non si tocca più: è la prova di
-- cosa CRIA doveva a quel proprietario.
create table if not exists public.coperture_mese (
    id              uuid primary key default gen_random_uuid(),
    contratto_id    uuid not null references public.contratti (id) on delete cascade,
    mese            text not null check (mese ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
    stato           stato_copertura not null,
    motivo          text,
    segnalata_il    date,
    decisa_il       timestamptz not null default now(),
    unique (contratto_id, mese)
);

-- ─── Pratiche di morosità ────────────────────────────────────────────────────
create table if not exists public.pratiche_morosita (
    id              uuid primary key default gen_random_uuid(),
    codice          text unique,
    contratto_id    uuid not null references public.contratti (id) on delete restrict,
    aperta_il       date not null default current_date,
    gestore_id      uuid references public.persone (id) on delete set null,
    stato           text not null default 'aperta' check (stato in (
                        'aperta', 'in_contatto', 'piano_proposto', 'piano_attivo',
                        'passata_al_legale', 'chiusa'
                    )),
    mesi_scoperti   integer not null default 0 check (mesi_scoperti >= 0),
    importo         numeric(12, 2) not null default 0 check (importo >= 0),
    primo_contatto_il date,
    chiusa_il       date,
    esito           text,
    aggiornato_il   timestamptz not null default now()
);
create index if not exists morosita_contratto_idx on public.pratiche_morosita (contratto_id);
create index if not exists morosita_aperte_idx on public.pratiche_morosita (stato) where chiusa_il is null;
drop trigger if exists morosita_aggiornato on public.pratiche_morosita;
create trigger morosita_aggiornato before update on public.pratiche_morosita
    for each row execute function public.tocca_aggiornato_il();

-- Ogni contatto con l'inquilino resta scritto: è quello che serve se si
-- arriva davanti a un giudice.
create table if not exists public.contatti_morosita (
    id              uuid primary key default gen_random_uuid(),
    morosita_id     uuid not null references public.pratiche_morosita (id) on delete cascade,
    il              timestamptz not null default now(),
    canale          text not null check (canale in ('telefono', 'email', 'sms', 'lettera', 'incontro', 'altro')),
    esito           text,
    nota            text,
    da_persona      uuid references public.persone (id) on delete set null
);
create index if not exists contatti_morosita_idx on public.contatti_morosita (morosita_id, il desc);

-- ─── Indennizzi ──────────────────────────────────────────────────────────────
-- Chi istruisce e dispone non è chi autorizza il pagamento.
create table if not exists public.indennizzi (
    id                  uuid primary key default gen_random_uuid(),
    morosita_id         uuid not null references public.pratiche_morosita (id) on delete cascade,
    mese                text not null check (mese ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
    importo             numeric(12, 2) not null check (importo > 0),
    beneficiario_id     uuid references public.persone (id) on delete set null,
    stato               text not null default 'da_disporre' check (stato in (
                            'da_disporre', 'disposto', 'autorizzato', 'pagato', 'respinto'
                        )),
    disposto_da         uuid references public.persone (id) on delete set null,
    disposto_il         timestamptz,
    autorizzato_da      uuid references public.persone (id) on delete set null,
    autorizzato_il      timestamptz,
    respinto_da         uuid references public.persone (id) on delete set null,
    motivo_respinta     text,
    pagato_il           date,
    riferimento         text,
    creato_il           timestamptz not null default now(),
    aggiornato_il       timestamptz not null default now(),
    -- La regola del §13.4, scritta dove non si può aggirare.
    constraint indennizzi_due_persone check (
        autorizzato_da is null or disposto_da is null or autorizzato_da <> disposto_da
    )
);
create index if not exists indennizzi_morosita_idx on public.indennizzi (morosita_id);
create index if not exists indennizzi_da_autorizzare_idx on public.indennizzi (stato) where stato in ('da_disporre', 'disposto');
drop trigger if exists indennizzi_aggiornato on public.indennizzi;
create trigger indennizzi_aggiornato before update on public.indennizzi
    for each row execute function public.tocca_aggiornato_il();

-- ─── Piani di rientro ────────────────────────────────────────────────────────
-- Chi propone non approva.
create table if not exists public.piani_rientro (
    id              uuid primary key default gen_random_uuid(),
    morosita_id     uuid not null references public.pratiche_morosita (id) on delete cascade,
    proposto_da     uuid references public.persone (id) on delete set null,
    proposto_il     timestamptz not null default now(),
    approvato_da    uuid references public.persone (id) on delete set null,
    approvato_il    timestamptz,
    respinto_il     timestamptz,
    motivo          text,
    n_rate          integer not null check (n_rate > 0),
    importo_totale  numeric(12, 2) not null check (importo_totale > 0),
    prima_scadenza  date,
    stato           text not null default 'proposto' check (stato in (
                        'proposto', 'approvato', 'respinto', 'attivo', 'saltato', 'completato'
                    )),
    aggiornato_il   timestamptz not null default now(),
    constraint piani_due_persone check (
        approvato_da is null or proposto_da is null or approvato_da <> proposto_da
    )
);
create index if not exists piani_morosita_idx on public.piani_rientro (morosita_id);
drop trigger if exists piani_aggiornato on public.piani_rientro;
create trigger piani_aggiornato before update on public.piani_rientro
    for each row execute function public.tocca_aggiornato_il();

create table if not exists public.rate_rientro (
    id              uuid primary key default gen_random_uuid(),
    piano_id        uuid not null references public.piani_rientro (id) on delete cascade,
    numero          integer not null check (numero > 0),
    scadenza        date not null,
    importo         numeric(10, 2) not null check (importo > 0),
    pagata_il       date,
    importo_pagato  numeric(10, 2) check (importo_pagato is null or importo_pagato >= 0),
    stato           text not null default 'attesa' check (stato in ('attesa', 'pagata', 'scaduta', 'saltata')),
    unique (piano_id, numero)
);
create index if not exists rate_scadenza_idx on public.rate_rientro (scadenza) where pagata_il is null;

-- ─── Recuperi ────────────────────────────────────────────────────────────────
-- I soldi che tornano indietro dopo l'indennizzo: rate del piano, saldo in
-- una volta, o esecuzione forzata.
create table if not exists public.recuperi (
    id              uuid primary key default gen_random_uuid(),
    morosita_id     uuid not null references public.pratiche_morosita (id) on delete cascade,
    rata_id         uuid references public.rate_rientro (id) on delete set null,
    data            date not null,
    importo         numeric(12, 2) not null check (importo > 0),
    fonte           fonte_recupero not null,
    nota            text,
    creato_il       timestamptz not null default now()
);
create index if not exists recuperi_morosita_idx on public.recuperi (morosita_id, data);

-- ─── Riassicurazione ─────────────────────────────────────────────────────────
-- Il rendiconto al riassicuratore, trimestre per trimestre.
create table if not exists public.riassicurazione_periodi (
    id                  uuid primary key default gen_random_uuid(),
    periodo             text not null unique check (periodo ~ '^[0-9]{4}-(T[1-4]|(0[1-9]|1[0-2]))$'),
    dal                 date not null,
    al                  date not null,
    premio_ceduto       numeric(12, 2) not null default 0,
    sinistri            integer not null default 0 check (sinistri >= 0),
    indennizzi_pagati   numeric(12, 2) not null default 0,
    recuperi            numeric(12, 2) not null default 0,
    stato               text not null default 'aperto' check (stato in ('aperto', 'da_inviare', 'inviato')),
    termine             date,
    rendiconto_inviato_il date,
    inviato_da          uuid references public.persone (id) on delete set null,
    nota                text,
    check (al >= dal)
);

-- ─── Chi legge ───────────────────────────────────────────────────────────────
alter table public.polizze enable row level security;
alter table public.coperture_mese enable row level security;
alter table public.pratiche_morosita enable row level security;
alter table public.contatti_morosita enable row level security;
alter table public.indennizzi enable row level security;
alter table public.piani_rientro enable row level security;
alter table public.rate_rientro enable row level security;
alter table public.recuperi enable row level security;
alter table public.riassicurazione_periodi enable row level security;

drop policy if exists polizze_interni on public.polizze;
create policy polizze_interni on public.polizze for select to authenticated using ((select public.e_interno()));
drop policy if exists coperture_interni on public.coperture_mese;
create policy coperture_interni on public.coperture_mese for select to authenticated using ((select public.e_interno()));
drop policy if exists morosita_interni on public.pratiche_morosita;
create policy morosita_interni on public.pratiche_morosita for select to authenticated using ((select public.e_interno()));
drop policy if exists contatti_morosita_interni on public.contatti_morosita;
create policy contatti_morosita_interni on public.contatti_morosita for select to authenticated using ((select public.e_interno()));
drop policy if exists indennizzi_interni on public.indennizzi;
create policy indennizzi_interni on public.indennizzi for select to authenticated using ((select public.e_interno()));
drop policy if exists piani_interni on public.piani_rientro;
create policy piani_interni on public.piani_rientro for select to authenticated using ((select public.e_interno()));
drop policy if exists rate_interni on public.rate_rientro;
create policy rate_interni on public.rate_rientro for select to authenticated using ((select public.e_interno()));
drop policy if exists recuperi_interni on public.recuperi;
create policy recuperi_interni on public.recuperi for select to authenticated using ((select public.e_interno()));
drop policy if exists riassicurazione_interni on public.riassicurazione_periodi;
create policy riassicurazione_interni on public.riassicurazione_periodi for select to authenticated using ((select public.e_interno()));
