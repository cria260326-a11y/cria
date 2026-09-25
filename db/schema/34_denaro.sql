-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 34_denaro.sql                                                    ║
-- ║  Soldi in uscita, ricevute, vendite, provvigioni e compensi.             ║
-- ║  Si esegue dopo 33_garanzia.sql.                                         ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- I BONIFICI IN USCITA sono una tabella sola per tutto quello che esce:
-- canoni girati ai proprietari, indennizzi, provvigioni ai commerciali,
-- compensi agli avvocati. Chi dispone non autorizza, e qui il vincolo è del
-- database (§13.4).
--
-- LE VENDITE non sono una seconda verità sui contratti: sono il fatto
-- commerciale — chi ha comprato cosa, quando, tramite chi — e servono alle
-- provvigioni. Il prezzo lo calcola il listino, non si scrive a mano (§14.4).

-- ─── Bonifici in uscita ──────────────────────────────────────────────────────
create table if not exists public.bonifici_uscita (
    id                  uuid primary key default gen_random_uuid(),
    tipo                text not null check (tipo in ('canone', 'indennizzo', 'provvigione', 'compenso_avvocato', 'rimborso', 'altro')),
    beneficiario_id     uuid references public.persone (id) on delete set null,
    contratto_id        uuid references public.contratti (id) on delete set null,
    indennizzo_id       uuid references public.indennizzi (id) on delete set null,
    mese                text check (mese is null or mese ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
    importo             numeric(12, 2) not null check (importo > 0),
    iban                text check (iban is null or iban ~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$'),
    intestatario        text,
    causale             text,
    stato               text not null default 'da_disporre' check (stato in (
                            'da_disporre', 'disposto', 'autorizzato', 'eseguito', 'respinto'
                        )),
    urgente             boolean not null default false,
    termine             date,
    disposto_da         uuid references public.persone (id) on delete set null,
    disposto_il         timestamptz,
    autorizzato_da      uuid references public.persone (id) on delete set null,
    autorizzato_il      timestamptz,
    respinto_da         uuid references public.persone (id) on delete set null,
    motivo_respinta     text,
    eseguito_il         date,
    riferimento         text,
    creato_il           timestamptz not null default now(),
    aggiornato_il       timestamptz not null default now(),
    constraint bonifici_due_persone check (
        autorizzato_da is null or disposto_da is null or autorizzato_da <> disposto_da
    )
);
create index if not exists bonifici_stato_idx on public.bonifici_uscita (stato) where stato <> 'eseguito';
create index if not exists bonifici_beneficiario_idx on public.bonifici_uscita (beneficiario_id);
drop trigger if exists bonifici_aggiornato on public.bonifici_uscita;
create trigger bonifici_aggiornato before update on public.bonifici_uscita
    for each row execute function public.tocca_aggiornato_il();

-- ─── Ricevute ────────────────────────────────────────────────────────────────
create table if not exists public.ricevute (
    id              uuid primary key default gen_random_uuid(),
    numero          text not null unique,
    persona_id      uuid references public.persone (id) on delete set null,
    contratto_id    uuid references public.contratti (id) on delete set null,
    pratica_id      uuid references public.pratiche (id) on delete set null,
    mese            text check (mese is null or mese ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
    imponibile      numeric(10, 2) check (imponibile is null or imponibile >= 0),
    iva             numeric(10, 2) check (iva is null or iva >= 0),
    importo         numeric(10, 2) not null check (importo >= 0),
    emessa_il       date not null default current_date,
    percorso_pdf    text,
    annullata_il    date,
    motivo_annullo  text
);
create index if not exists ricevute_persona_idx on public.ricevute (persona_id, emessa_il desc);

-- ─── Codici referente ────────────────────────────────────────────────────────
-- Il codice del commerciale resta legato al cliente per sempre: è quello che
-- decide a chi matura la provvigione, anche sui rinnovi (§9.6).
create table if not exists public.codici_referente (
    codice          text primary key check (codice ~ '^[A-Z0-9-]{3,20}$'),
    commerciale_id  uuid not null references public.persone (id) on delete restrict,
    attivo          boolean not null default true,
    n_usi           integer not null default 0 check (n_usi >= 0),
    creato_il       timestamptz not null default now()
);

-- ─── Vendite ─────────────────────────────────────────────────────────────────
create table if not exists public.vendite (
    id                  uuid primary key default gen_random_uuid(),
    tipo                text not null check (tipo in ('attivazione', 'quota', 'prodotto', 'rinnovo', 'verifica', 'autocandidatura')),
    prodotto            text references public.prodotti (codice) on delete set null,
    persona_id          uuid references public.persone (id) on delete set null,
    pratica_id          uuid references public.pratiche (id) on delete set null,
    contratto_id        uuid references public.contratti (id) on delete set null,
    data                date not null default current_date,
    valore_annuo        numeric(12, 2) check (valore_annuo is null or valore_annuo >= 0),
    incassato           numeric(12, 2) not null default 0 check (incassato >= 0),
    canale              text not null default 'diretto' check (canale in ('diretto', 'referente', 'agenzia')),
    codice_referente    text references public.codici_referente (codice) on delete set null,
    commerciale_id      uuid references public.persone (id) on delete set null,
    stato               text,
    creato_il           timestamptz not null default now()
);
create index if not exists vendite_data_idx on public.vendite (data desc);
create index if not exists vendite_commerciale_idx on public.vendite (commerciale_id, data desc);

-- ─── Provvigioni ─────────────────────────────────────────────────────────────
create table if not exists public.provvigioni (
    id              uuid primary key default gen_random_uuid(),
    commerciale_id  uuid not null references public.persone (id) on delete restrict,
    vendita_id      uuid references public.vendite (id) on delete set null,
    aliquota        numeric(5, 2) check (aliquota is null or aliquota between 0 and 100),
    importo         numeric(10, 2) not null check (importo >= 0),
    stato           stato_provvigione not null default 'maturata',
    maturata_il     date not null default current_date,
    richiesta_il    date,
    pagata_il       date,
    bonifico_id     uuid references public.bonifici_uscita (id) on delete set null
);
create index if not exists provvigioni_commerciale_idx on public.provvigioni (commerciale_id, stato);

create table if not exists public.richieste_prelievo (
    id              uuid primary key default gen_random_uuid(),
    commerciale_id  uuid not null references public.persone (id) on delete restrict,
    importo         numeric(10, 2) not null check (importo > 0),
    stato           text not null default 'richiesta' check (stato in ('richiesta', 'confermata', 'pagata', 'respinta')),
    richiesta_il    timestamptz not null default now(),
    confermata_il   timestamptz,
    confermata_da   uuid references public.persone (id) on delete set null,
    pagata_il       date,
    bonifico_id     uuid references public.bonifici_uscita (id) on delete set null,
    motivo          text
);

-- ─── Compensi degli avvocati ─────────────────────────────────────────────────
create table if not exists public.compensi_avvocato (
    id              uuid primary key default gen_random_uuid(),
    avvocato_id     uuid not null references public.persone (id) on delete restrict,
    morosita_id     uuid references public.pratiche_morosita (id) on delete set null,
    riferimento     text,
    importo         numeric(10, 2) not null check (importo >= 0),
    stato           text not null default 'maturato' check (stato in ('maturato', 'in_pagamento', 'pagato')),
    maturato_il     date not null default current_date,
    pagato_il       date,
    bonifico_id     uuid references public.bonifici_uscita (id) on delete set null
);
create index if not exists compensi_avvocato_idx on public.compensi_avvocato (avvocato_id, stato);

-- ─── Chi legge ───────────────────────────────────────────────────────────────
alter table public.bonifici_uscita enable row level security;
alter table public.ricevute enable row level security;
alter table public.codici_referente enable row level security;
alter table public.vendite enable row level security;
alter table public.provvigioni enable row level security;
alter table public.richieste_prelievo enable row level security;
alter table public.compensi_avvocato enable row level security;

drop policy if exists bonifici_interni on public.bonifici_uscita;
create policy bonifici_interni on public.bonifici_uscita for select to authenticated using ((select public.e_interno()));
drop policy if exists ricevute_interni on public.ricevute;
create policy ricevute_interni on public.ricevute for select to authenticated using ((select public.e_interno()));
drop policy if exists codici_referente_interni on public.codici_referente;
create policy codici_referente_interni on public.codici_referente for select to authenticated using ((select public.e_interno()));
drop policy if exists vendite_interni on public.vendite;
create policy vendite_interni on public.vendite for select to authenticated using ((select public.e_interno()));
drop policy if exists provvigioni_interni on public.provvigioni;
create policy provvigioni_interni on public.provvigioni for select to authenticated using ((select public.e_interno()));
drop policy if exists prelievi_interni on public.richieste_prelievo;
create policy prelievi_interni on public.richieste_prelievo for select to authenticated using ((select public.e_interno()));
drop policy if exists compensi_interni on public.compensi_avvocato;
create policy compensi_interni on public.compensi_avvocato for select to authenticated using ((select public.e_interno()));
