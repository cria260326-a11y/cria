-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 37_operativita.sql                                               ║
-- ║  I due motori — assegnazione e termini — più il registro delle           ║
-- ║  modifiche, quello delle letture e le note interne.                      ║
-- ║  Si esegue dopo 36_comunicazioni.sql.                                    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- ASSEGNAZIONI: chi segue cosa, con le date. Una pratica ha un referente, una
-- morosità un gestore, un passaggio al legale un avvocato. Cambiare
-- assegnatario non cancella chi c'era prima: si chiude una riga e se ne apre
-- un'altra.
--
-- FASI (le `sla_fasi` del §14.3): ogni cosa che ha un termine è una fase, con
-- decorrenza, termine e chiusura. È il motore che alimenta «Da fare adesso» e
-- le Scadenze: una tabella sola, non un contatore per pagina.
--
-- PROROGHE: un termine si sposta solo con una causale della lista e il nome
-- di chi l'ha concessa. Fuori lista si può, ma si vede: il flag esiste perché
-- la direzione conti quante volte succede, non per impedirlo.
--
-- I DUE REGISTRI sono cose diverse e servono entrambi (§14.3):
--   audit_log    le MODIFICHE: chi ha cambiato cosa, prima e dopo
--   accessi_log  le LETTURE: chi ha aperto un fascicolo, e con che motivo se
--                non era suo. È quello che il DPO legge ogni mese (§13.5).

-- ─── Assegnazioni ────────────────────────────────────────────────────────────
create table if not exists public.assegnazioni (
    id              uuid primary key default gen_random_uuid(),
    entita_tipo     text not null check (entita_tipo in (
                        'pratica', 'contratto', 'morosita', 'contestazione', 'verifica',
                        'autocandidatura', 'conversazione', 'indennizzo', 'persona')),
    entita_id       uuid not null,
    persona_id      uuid not null references public.persone (id) on delete restrict,
    tipo            tipo_assegnazione not null default 'gestore',
    dal             timestamptz not null default now(),
    al              timestamptz,
    assegnata_da    uuid references public.persone (id) on delete set null,
    motivo          text,
    check (al is null or al >= dal)
);
create index if not exists assegnazioni_entita_idx on public.assegnazioni (entita_tipo, entita_id) where al is null;
create index if not exists assegnazioni_persona_idx on public.assegnazioni (persona_id) where al is null;

-- ─── Fasi con un termine ─────────────────────────────────────────────────────
create table if not exists public.fasi (
    id              uuid primary key default gen_random_uuid(),
    entita_tipo     text not null,
    entita_id       uuid not null,
    chiave          text not null,
    titolo          text not null,
    -- La funzione che ci deve lavorare, e la persona se è assegnata.
    funzione        text,
    assegnatario_id uuid references public.persone (id) on delete set null,
    decorrenza      timestamptz not null default now(),
    termine         timestamptz not null,
    -- Giorni lavorativi o solari: cambia il calcolo, e va scritto.
    calendario      text not null default 'lavorativi' check (calendario in ('lavorativi', 'solari')),
    stato           text not null default 'in_corso' check (stato in (
                        'futura', 'in_corso', 'in_scadenza', 'scaduta', 'sospesa',
                        'chiusa', 'conseguenza_applicata', 'non_dovuta'
                    )),
    chiusa_il       timestamptz,
    chiusa_da       uuid references public.persone (id) on delete set null,
    -- Quando un termine scade sale al responsabile, e al DPO se tocca i dati.
    salita_a        uuid references public.persone (id) on delete set null,
    salita_il       timestamptz,
    nota            text,
    creato_il       timestamptz not null default now(),
    aggiornato_il   timestamptz not null default now()
);
create index if not exists fasi_entita_idx on public.fasi (entita_tipo, entita_id);
create index if not exists fasi_aperte_idx on public.fasi (termine) where chiusa_il is null;
create index if not exists fasi_funzione_idx on public.fasi (funzione, stato) where chiusa_il is null;
drop trigger if exists fasi_aggiornato on public.fasi;
create trigger fasi_aggiornato before update on public.fasi
    for each row execute function public.tocca_aggiornato_il();

-- Le causali con cui si può spostare un termine: in tabella, così l'azienda
-- le cambia senza un rilascio.
create table if not exists public.causali_proroga (
    chiave          text primary key,
    etichetta       text not null,
    giorni_massimi  integer check (giorni_massimi is null or giorni_massimi > 0),
    attiva          boolean not null default true,
    ordine          integer not null default 0
);

create table if not exists public.proroghe (
    id              uuid primary key default gen_random_uuid(),
    fase_id         uuid not null references public.fasi (id) on delete cascade,
    causale         text references public.causali_proroga (chiave) on delete set null,
    giorni          integer not null check (giorni > 0),
    termine_prima   timestamptz not null,
    termine_dopo    timestamptz not null,
    concessa_da     uuid references public.persone (id) on delete set null,
    concessa_il     timestamptz not null default now(),
    motivazione     text,
    -- Fuori dalla lista delle causali: si può, ma si conta.
    fuori_lista     boolean not null default false,
    check (termine_dopo > termine_prima)
);
create index if not exists proroghe_fase_idx on public.proroghe (fase_id);
create index if not exists proroghe_fuori_lista_idx on public.proroghe (concessa_il desc) where fuori_lista;

-- ─── Registro delle modifiche ────────────────────────────────────────────────
create table if not exists public.audit_log (
    id              bigint generated always as identity primary key,
    attore_id       uuid references public.persone (id) on delete set null,
    attore_email    text,
    azione          text not null,
    entita_tipo     text not null,
    entita_id       uuid,
    campo           text,
    prima           jsonb,
    dopo            jsonb,
    motivo          text,
    ip              inet,
    il              timestamptz not null default now()
);
create index if not exists audit_entita_idx on public.audit_log (entita_tipo, entita_id, il desc);
create index if not exists audit_attore_idx on public.audit_log (attore_id, il desc);

-- ─── Registro delle letture ──────────────────────────────────────────────────
-- Non impedisce: registra. Chi apre un fascicolo non suo lo fa subito, senza
-- chiedere il permesso, e scrive perché. Il rapporto mensile del DPO nasce da
-- qui, e tutti sanno che si vede.
create table if not exists public.accessi_log (
    id              bigint generated always as identity primary key,
    attore_id       uuid references public.persone (id) on delete set null,
    entita_tipo     text not null,
    entita_id       uuid,
    tipo            tipo_accesso_log not null default 'normale',
    motivo          text,
    ip              inet,
    il              timestamptz not null default now(),
    -- Una deroga senza motivo non si scrive: sarebbe un registro inutile.
    check (tipo <> 'deroga' or motivo is not null)
);
create index if not exists accessi_entita_idx on public.accessi_log (entita_tipo, entita_id, il desc);
create index if not exists accessi_deroghe_idx on public.accessi_log (il desc) where tipo = 'deroga';

-- ─── Note interne ────────────────────────────────────────────────────────────
create table if not exists public.note_interne (
    id              uuid primary key default gen_random_uuid(),
    entita_tipo     text not null,
    entita_id       uuid not null,
    autore_id       uuid references public.persone (id) on delete set null,
    testo           text not null,
    il              timestamptz not null default now()
);
create index if not exists note_interne_entita_idx on public.note_interne (entita_tipo, entita_id, il desc);

-- ─── Chi legge ───────────────────────────────────────────────────────────────
alter table public.assegnazioni enable row level security;
alter table public.fasi enable row level security;
alter table public.causali_proroga enable row level security;
alter table public.proroghe enable row level security;
alter table public.audit_log enable row level security;
alter table public.accessi_log enable row level security;
alter table public.note_interne enable row level security;

drop policy if exists assegnazioni_interni on public.assegnazioni;
create policy assegnazioni_interni on public.assegnazioni for select to authenticated using ((select public.e_interno()));
drop policy if exists fasi_interni on public.fasi;
create policy fasi_interni on public.fasi for select to authenticated using ((select public.e_interno()));
drop policy if exists causali_interni on public.causali_proroga;
create policy causali_interni on public.causali_proroga for select to authenticated using ((select public.e_interno()));
drop policy if exists proroghe_interni on public.proroghe;
create policy proroghe_interni on public.proroghe for select to authenticated using ((select public.e_interno()));
drop policy if exists note_interne_interni on public.note_interne;
create policy note_interne_interni on public.note_interne for select to authenticated using ((select public.e_interno()));

-- I due registri li legge chi controlla: l'admin e il DPO. Un operatore non
-- deve poter guardare cosa hanno aperto i colleghi.
drop policy if exists audit_controllo on public.audit_log;
create policy audit_controllo on public.audit_log for select to authenticated
    using ((select public.e_admin()) or (select public.ha_funzione('dpo')) or (select public.ha_funzione('direzione')));
drop policy if exists accessi_controllo on public.accessi_log;
create policy accessi_controllo on public.accessi_log for select to authenticated
    using ((select public.e_admin()) or (select public.ha_funzione('dpo')));
