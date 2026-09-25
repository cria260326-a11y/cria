-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 10_contenuti_sito.sql                                            ║
-- ║  Testi della vetrina e FAQ, modificabili dall'admin senza un rilascio.   ║
-- ║  Indipendente dal resto dello schema: si esegue anche da solo.           ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- I TESTI vivono nel codice (apps/web/src/testi/catalogo): sono l'originale.
-- Questa tabella tiene solo quello che l'admin cambia, in due stadi:
--   bozza       salvata ma NON visibile sul sito
--   pubblicato  quello che il sito mostra al posto dell'originale
-- «Pubblica» copia la bozza nel pubblicato e lo scrive nella cronologia;
-- «Torna all'originale» toglie la riga. Una modifica sbagliata non finisce
-- online per errore, e ogni pubblicazione si può ripercorrere.
--
-- Le FAQ sono un documento solo (le modifiche rispetto a quelle del codice),
-- perché si riordinano e si spostano fra categorie tutte insieme.
--
-- Chi legge: il sito, anche senza accesso, vede SOLO i testi pubblicati e le
-- FAQ attive, attraverso due funzioni. Le tabelle le legge e scrive solo
-- l'admin. PORTABILITÀ: auth.jwt() e auth.uid() sono di Supabase; sul server
-- proprio diventano le variabili di sessione impostate dall'applicazione.

-- ─── Chi è admin ─────────────────────────────────────────────────────────────
-- Il ruolo sta in app_metadata, che l'utente non può modificare da sé: lo
-- imposta solo il server. Con la tabella dei ruoli (lotto 6) questa funzione
-- leggerà da lì, e il resto del file non cambia.
create or replace function public.e_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
    select coalesce((auth.jwt() -> 'app_metadata' ->> 'ruolo') = 'admin', false);
$$;

-- L'email di chi sta agendo: firma bozze e pubblicazioni.
create or replace function public.email_attore()
returns text
language sql
stable
security definer
set search_path = ''
as $$
    select email from auth.users where id = auth.uid();
$$;

-- ─── Testi ───────────────────────────────────────────────────────────────────
create table if not exists public.testi_sito (
    chiave        text primary key check (chiave ~ '^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$'),
    bozza         text check (bozza is null or length(bozza) between 1 and 5000),
    bozza_il      timestamptz,
    bozza_di      text,
    pubblicato    text check (pubblicato is null or length(pubblicato) between 1 and 5000),
    pubblicato_il timestamptz,
    pubblicato_di text
);

comment on table public.testi_sito is
    'Testi della vetrina cambiati dall''admin. Senza riga, il sito mostra l''originale del codice.';

create table if not exists public.testi_sito_storico (
    id     bigint generated always as identity primary key,
    chiave text not null,
    valore text,                                   -- null: tornato all'originale
    azione text not null check (azione in ('pubblicato', 'ripristinato')),
    il     timestamptz not null default now(),
    di     text
);

create index if not exists testi_sito_storico_chiave_idx
    on public.testi_sito_storico (chiave, il desc);

-- Chi e quando della bozza li scrive il database, non il browser.
create or replace function public.testi_sito_firma_bozza()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if tg_op = 'INSERT' or new.bozza is distinct from old.bozza then
        if new.bozza is null then
            new.bozza_il := null;
            new.bozza_di := null;
        else
            new.bozza_il := now();
            new.bozza_di := public.email_attore();
        end if;
    end if;
    return new;
end;
$$;

drop trigger if exists testi_sito_firma_bozza on public.testi_sito;
create trigger testi_sito_firma_bozza
    before insert or update on public.testi_sito
    for each row execute function public.testi_sito_firma_bozza();

alter table public.testi_sito enable row level security;
alter table public.testi_sito_storico enable row level security;

drop policy if exists testi_sito_admin on public.testi_sito;
create policy testi_sito_admin on public.testi_sito
    for all to authenticated
    using ((select public.e_admin()))
    with check ((select public.e_admin()));

drop policy if exists testi_sito_storico_admin on public.testi_sito_storico;
create policy testi_sito_storico_admin on public.testi_sito_storico
    for select to authenticated
    using ((select public.e_admin()));

-- Dal browser l'admin scrive solo la bozza. Il pubblicato e la cronologia li
-- cambiano solo le due funzioni qui sotto: nessuno pubblica «di lato».
revoke all on public.testi_sito, public.testi_sito_storico from anon, authenticated;
grant select on public.testi_sito, public.testi_sito_storico to authenticated;
grant insert (chiave, bozza), update (bozza) on public.testi_sito to authenticated;

create or replace function public.pubblica_testi(chiavi text[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
    n integer;
begin
    if not public.e_admin() then
        raise exception 'Solo l''admin pubblica i testi del sito' using errcode = '42501';
    end if;
    with pubblicati as (
        update public.testi_sito
           set pubblicato = bozza, bozza = null,
               pubblicato_il = now(), pubblicato_di = public.email_attore()
         where chiave = any (chiavi) and bozza is not null
        returning chiave, pubblicato, pubblicato_di
    )
    insert into public.testi_sito_storico (chiave, valore, azione, di)
    select chiave, pubblicato, 'pubblicato', pubblicato_di from pubblicati;
    get diagnostics n = row_count;
    return n;
end;
$$;

create or replace function public.ripristina_testo(la_chiave text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not public.e_admin() then
        raise exception 'Solo l''admin cambia i testi del sito' using errcode = '42501';
    end if;
    if exists (select 1 from public.testi_sito where chiave = la_chiave and pubblicato is not null) then
        insert into public.testi_sito_storico (chiave, valore, azione, di)
        values (la_chiave, null, 'ripristinato', public.email_attore());
    end if;
    delete from public.testi_sito where chiave = la_chiave;
end;
$$;

-- Il sito, anche senza accesso: solo chiave e testo pubblicato.
create or replace function public.testi_pubblicati()
returns table (chiave text, testo text)
language sql
stable
security definer
set search_path = ''
as $$
    select t.chiave, t.pubblicato from public.testi_sito t where t.pubblicato is not null;
$$;

-- ─── FAQ e prodotti ──────────────────────────────────────────────────────────
-- Un documento per chiave:
--   'faq'       le modifiche rispetto alle FAQ del codice (nuove, cambiate,
--               nascoste, eliminate, ordine)
--   'prodotti'  il catalogo che decide l'admin (O-21): prodotti nuovi, prezzi,
--               prodotti tolti dalla vendita e gli estremi del bonifico che il
--               cliente legge quando paga
-- Dentro c'è anche il registro di chi ha fatto cosa, che il sito non vede.
create table if not exists public.documenti_sito (
    chiave        text primary key check (chiave in ('faq', 'prodotti')),
    contenuto     jsonb not null check (pg_column_size(contenuto) < 1000000),
    versione      integer not null default 1,
    aggiornato_il timestamptz not null default now(),
    aggiornato_di text
);

-- Sul database già creato con la sola 'faq' il vincolo si rifà.
alter table public.documenti_sito drop constraint if exists documenti_sito_chiave_check;
alter table public.documenti_sito add constraint documenti_sito_chiave_check check (chiave in ('faq', 'prodotti'));

alter table public.documenti_sito enable row level security;

drop policy if exists documenti_sito_admin on public.documenti_sito;
create policy documenti_sito_admin on public.documenti_sito
    for select to authenticated
    using ((select public.e_admin()));

revoke all on public.documenti_sito from anon, authenticated;
grant select on public.documenti_sito to authenticated;

-- Il sito: il documento senza il registro.
create or replace function public.documento_sito(la_chiave text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select d.contenuto - 'registro' from public.documenti_sito d where d.chiave = la_chiave;
$$;

-- L'admin salva il documento intero. Se nel frattempo un altro l'ha cambiato
-- (versione diversa da quella letta), il salvataggio si ferma: si ricarica e
-- si rifà, invece di cancellare il lavoro dell'altro.
create or replace function public.salva_documento_sito(la_chiave text, il_contenuto jsonb, versione_letta integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
    attuale integer;
begin
    if not public.e_admin() then
        raise exception 'Solo l''admin cambia i contenuti del sito' using errcode = '42501';
    end if;
    select versione into attuale from public.documenti_sito where chiave = la_chiave for update;
    if attuale is null then
        insert into public.documenti_sito (chiave, contenuto, versione, aggiornato_di)
        values (la_chiave, il_contenuto, 1, public.email_attore());
        return 1;
    end if;
    if versione_letta is distinct from attuale then
        raise exception 'Il documento è cambiato nel frattempo: ricarica e riprova' using errcode = '40001';
    end if;
    update public.documenti_sito
       set contenuto = il_contenuto, versione = attuale + 1,
           aggiornato_il = now(), aggiornato_di = public.email_attore()
     where chiave = la_chiave;
    return attuale + 1;
end;
$$;

-- ─── Chi può chiamare cosa ───────────────────────────────────────────────────
revoke all on function public.e_admin() from public;
revoke all on function public.email_attore() from public;
revoke all on function public.testi_sito_firma_bozza() from public;
revoke all on function public.pubblica_testi(text[]) from public;
revoke all on function public.ripristina_testo(text) from public;
revoke all on function public.testi_pubblicati() from public;
revoke all on function public.documento_sito(text) from public;
revoke all on function public.salva_documento_sito(text, jsonb, integer) from public;

-- Supabase dà l'esecuzione delle funzioni nuove ad anon e authenticated per
-- conto suo: «from public» non basta, si toglie a ciascuno.
revoke execute on function public.email_attore() from anon, authenticated;
revoke execute on function public.testi_sito_firma_bozza() from anon, authenticated;
revoke execute on function public.pubblica_testi(text[]) from anon;
revoke execute on function public.ripristina_testo(text) from anon;
revoke execute on function public.salva_documento_sito(text, jsonb, integer) from anon;
revoke execute on function public.e_admin() from anon;

grant execute on function public.e_admin() to authenticated;
grant execute on function public.testi_pubblicati() to anon, authenticated;
grant execute on function public.documento_sito(text) to anon, authenticated;
grant execute on function public.pubblica_testi(text[]) to authenticated;
grant execute on function public.ripristina_testo(text) to authenticated;
grant execute on function public.salva_documento_sito(text, jsonb, integer) to authenticated;
