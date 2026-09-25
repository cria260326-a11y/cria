-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 35_verifiche_certificati.sql                                     ║
-- ║  CRIA Verifica (P3), autocandidature (P7), referenze e certificati.      ║
-- ║  Si esegue dopo 34_denaro.sql.                                           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- LA VERIFICA (P3) è l'interrogazione una tantum: un cliente chiede com'è
-- andato un candidato, CRIA risponde con un semaforo, non con i dati. Il
-- prezzo si scala dal primo acquisto entro i giorni del listino: finché il
-- credito è aperto è uno sconto che il cliente può ancora chiedere (§9.7).
--
-- L'AUTOCANDIDATURA (P7) è il contrario: è l'inquilino che porta le prove del
-- suo storico. Il minimo per emettere un certificato sono due prove forti
-- indipendenti su almeno dodici mesi (§14.6): il livello della prova sta
-- scritto, e una referenza non vale come una ricevuta di bonifico.
--
-- IL CERTIFICATO dichiara in intestazione QUALE reputazione sta certificando
-- — conduttore o locatore — altrimenti chi lo riceve legge un numero senza
-- sapere di cosa parla (§13.3).

-- ─── Richieste di verifica (P3) ──────────────────────────────────────────────
create table if not exists public.richieste_verifica (
    id                  uuid primary key default gen_random_uuid(),
    codice              text unique,
    cliente_id          uuid not null references public.persone (id) on delete restrict,
    -- Il soggetto può non avere un account: si scrive quello che il cliente
    -- dichiara, e si collega alla persona solo se si trova con certezza.
    soggetto_id         uuid references public.persone (id) on delete set null,
    soggetto_nome       text,
    soggetto_cognome    text,
    soggetto_cf         text,
    soggetto_nascita    date,
    soggetto_luogo      text,
    consenso            boolean not null default false,
    consenso_il         timestamptz,
    stato               text not null default 'in_corso' check (stato in ('in_corso', 'evasa', 'annullata')),
    esito               esito_verifica,
    motivo              text,
    richiesta_il        timestamptz not null default now(),
    evasa_da            uuid references public.persone (id) on delete set null,
    evasa_il            timestamptz,
    termine             timestamptz,
    percorso_report     text,
    -- Il credito da scalare sul primo acquisto.
    credito_importo     numeric(10, 2) check (credito_importo is null or credito_importo >= 0),
    credito_scade_il    date,
    credito_usato_il    date,
    credito_usato_su    uuid references public.pratiche (id) on delete set null,
    vendita_id          uuid references public.vendite (id) on delete set null
);
create index if not exists verifiche_cliente_idx on public.richieste_verifica (cliente_id, richiesta_il desc);
create index if not exists verifiche_aperte_idx on public.richieste_verifica (stato) where stato = 'in_corso';

-- ─── Autocandidature (P7) ────────────────────────────────────────────────────
create table if not exists public.autocandidature (
    id              uuid primary key default gen_random_uuid(),
    codice          text unique,
    persona_id      uuid not null references public.persone (id) on delete restrict,
    stato           text not null default 'aperta' check (stato in (
                        'aperta', 'in_verifica', 'da_integrare', 'certificata', 'respinta', 'annullata'
                    )),
    aperta_il       timestamptz not null default now(),
    pagata_il       date,
    importo         numeric(10, 2) check (importo is null or importo >= 0),
    vendita_id      uuid references public.vendite (id) on delete set null,
    mesi_coperti    integer check (mesi_coperti is null or mesi_coperti >= 0),
    esito           text,
    motivo          text,
    conclusa_il     timestamptz,
    aggiornato_il   timestamptz not null default now()
);
create index if not exists autocandidature_persona_idx on public.autocandidature (persona_id);
drop trigger if exists autocandidature_aggiornato on public.autocandidature;
create trigger autocandidature_aggiornato before update on public.autocandidature
    for each row execute function public.tocca_aggiornato_il();

-- Le prove portate dall'inquilino: ricevute, bonifici, contratti registrati.
create table if not exists public.prove_autocandidatura (
    id                  uuid primary key default gen_random_uuid(),
    autocandidatura_id  uuid not null references public.autocandidature (id) on delete cascade,
    tipo                text not null,
    livello             livello_prova not null default 'medio',
    dal                 date,
    al                  date,
    documento_id        uuid references public.documenti (id) on delete set null,
    stato               text not null default 'da_verificare' check (stato in ('da_verificare', 'valida', 'non_valida')),
    verificata_da       uuid references public.persone (id) on delete set null,
    verificata_il       timestamptz,
    nota                text,
    caricata_il         timestamptz not null default now(),
    check (al is null or dal is null or al >= dal)
);
create index if not exists prove_autocandidatura_idx on public.prove_autocandidatura (autocandidatura_id);

-- La referenza del precedente proprietario: si chiede a lui, e la sua
-- risposta è una prova come le altre, con il suo livello.
create table if not exists public.referenze (
    id                  uuid primary key default gen_random_uuid(),
    autocandidatura_id  uuid not null references public.autocandidature (id) on delete cascade,
    referente_id        uuid references public.persone (id) on delete set null,
    nome                text,
    email               text,
    telefono            text,
    immobile            text,
    dal                 date,
    al                  date,
    stato               text not null default 'da_contattare' check (stato in (
                            'da_contattare', 'contattata', 'risposta', 'rifiutata', 'scaduta'
                        )),
    chiesta_il          timestamptz,
    risposta_il         timestamptz,
    giudizio            text,
    risposta            jsonb,
    creato_il           timestamptz not null default now()
);
create index if not exists referenze_autocandidatura_idx on public.referenze (autocandidatura_id);

-- ─── Certificati ─────────────────────────────────────────────────────────────
create table if not exists public.certificati (
    id                  uuid primary key default gen_random_uuid(),
    numero              text not null unique,
    persona_id          uuid not null references public.persone (id) on delete restrict,
    -- Quale delle due reputazioni: non si mescolano (§13.3).
    ambito              ambito_reputazione not null default 'conduttore',
    semaforo            semaforo not null,
    mesi_considerati    integer check (mesi_considerati is null or mesi_considerati >= 0),
    fonte               fonte_storico not null default 'rilevato_cria',
    autocandidatura_id  uuid references public.autocandidature (id) on delete set null,
    dati                jsonb,
    emesso_il           timestamptz not null default now(),
    scade_il            date,
    revocato_il         timestamptz,
    motivo_revoca       text,
    percorso_pdf        text,
    codice_pubblico     text unique
);
create index if not exists certificati_persona_idx on public.certificati (persona_id, emesso_il desc);

-- ─── Chi legge ───────────────────────────────────────────────────────────────
alter table public.richieste_verifica enable row level security;
alter table public.autocandidature enable row level security;
alter table public.prove_autocandidatura enable row level security;
alter table public.referenze enable row level security;
alter table public.certificati enable row level security;

drop policy if exists verifiche_interni on public.richieste_verifica;
create policy verifiche_interni on public.richieste_verifica for select to authenticated using ((select public.e_interno()));
drop policy if exists autocandidature_interni on public.autocandidature;
create policy autocandidature_interni on public.autocandidature for select to authenticated using ((select public.e_interno()));
drop policy if exists prove_interni on public.prove_autocandidatura;
create policy prove_interni on public.prove_autocandidatura for select to authenticated using ((select public.e_interno()));
drop policy if exists referenze_interni on public.referenze;
create policy referenze_interni on public.referenze for select to authenticated using ((select public.e_interno()));
drop policy if exists certificati_interni on public.certificati;
create policy certificati_interni on public.certificati for select to authenticated using ((select public.e_interno()));
