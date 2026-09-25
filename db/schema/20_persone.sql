-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 20_persone.sql                                                   ║
-- ║  Le persone con i loro dati personali, i ruoli, e il registro di chi     ║
-- ║  ha cambiato cosa. Si esegue dopo 10_contenuti_sito.sql (usa e_admin).   ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- PERSONE: una riga per persona fisica o società. Chi ha un account ha
-- utente_id (auth.users); più avanti ci saranno anche i soggetti senza
-- account (la controparte di un contratto, un candidato).
-- codice_demo collega la persona ai dati di prova che vivono ancora nel
-- codice (contratti, pratiche, pagamenti): sparisce quando anche quelli
-- passano qui.
--
-- RUOLI: cosa fa una persona in CRIA. proprietario e inquilino vengono dai
-- contratti; qui si scrivono finché i contratti non sono nel database.
-- interno ha la funzione (istruttoria, incassi…) e il responsabile.
-- admin ha l'accesso completo; la regola vera sta anche in app_metadata
-- dell'account (e_admin), che l'utente non può toccare.
--
-- CHI SCRIVE: nessuno scrive le tabelle direttamente. Si passa da funzioni
-- che controllano chi agisce e registrano ogni modifica:
--   nuovo_utente        (trigger) all'iscrizione nasce la persona
--   dati_gia_usati      prima di iscriversi: email, cellulare, codice fiscale liberi?
--   aggiorna_persona    ognuno i suoi dati, l'admin quelli di tutti
--   diventa_cliente     al primo acquisto di CRIA Verifica
--
-- Chi legge: ognuno la sua riga; chi lavora dentro CRIA (admin e interni)
-- tutte. PORTABILITÀ: auth.uid() e auth.jwt() sono di Supabase; sul server
-- proprio diventano le variabili di sessione impostate dall'applicazione.

-- ─── Persone ─────────────────────────────────────────────────────────────────
create table if not exists public.persone (
    id                  uuid primary key default gen_random_uuid(),
    utente_id           uuid unique references auth.users (id) on delete set null,
    codice_demo         text unique,
    tipo                text not null default 'fisica' check (tipo in ('fisica', 'giuridica')),
    nome                text check (nome is null or length(nome) between 1 and 80),
    cognome             text check (cognome is null or length(cognome) between 1 and 80),
    ragione_sociale     text check (ragione_sociale is null or length(ragione_sociale) between 2 and 160),
    partita_iva         text check (partita_iva is null or partita_iva ~ '^[0-9]{11}$'),
    codice_fiscale      text check (codice_fiscale is null or codice_fiscale ~ '^([A-Z0-9]{16}|[0-9]{11})$'),
    data_nascita        date,
    luogo_nascita       text check (luogo_nascita is null or length(luogo_nascita) <= 80),
    email               text check (email is null or email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
    telefono            text check (telefono is null or telefono ~ '^\+?[0-9 ]{6,20}$'),
    indirizzo           jsonb,
    fatturazione        jsonb,
    stato_identita      text not null default 'non_caricato'
                        check (stato_identita in ('non_caricato', 'in_attesa', 'verificato', 'da_integrare')),
    motivo_integrazione text,
    tipo_account        text check (tipo_account is null or tipo_account in ('privato', 'agenzia')),
    creata_il           timestamptz not null default now(),
    aggiornata_il       timestamptz not null default now(),
    aggiornata_da       uuid references public.persone (id) on delete set null
);

-- Email, cellulare e codice fiscale non si ripetono: in CRIA una persona c'è
-- una volta sola. Il cellulare si confronta senza spazi.
create unique index if not exists persone_email_unica on public.persone (lower(email)) where email is not null;
create unique index if not exists persone_telefono_unico on public.persone (regexp_replace(telefono, '[^0-9+]', '', 'g')) where telefono is not null;
create unique index if not exists persone_codice_fiscale_unico on public.persone (upper(codice_fiscale)) where codice_fiscale is not null;

-- ─── Ruoli ───────────────────────────────────────────────────────────────────
create table if not exists public.ruoli (
    persona_id  uuid not null references public.persone (id) on delete cascade,
    ruolo       text not null check (ruolo in ('admin', 'interno', 'proprietario', 'inquilino', 'cliente', 'commerciale', 'avvocato')),
    funzione    text check (funzione is null or funzione in (
                    'responsabile_operativo', 'istruttoria', 'incassi', 'assistenza', 'gestore_pratica', 'indennizzi',
                    'tesoreria', 'resp_amministrativo', 'resp_legale', 'resp_prodotto', 'direzione', 'dpo')),
    responsabile uuid references public.persone (id) on delete set null,
    dal         date not null default current_date,
    primary key (persona_id, ruolo),
    check ((ruolo = 'interno') = (funzione is not null))
);

-- ─── Registro delle modifiche ────────────────────────────────────────────────
-- Una riga per campo cambiato: chi, quando, prima e dopo, e perché. Non si
-- cancella: i dati personali cambiati restano ricostruibili.
create table if not exists public.persone_modifiche (
    id          bigint generated always as identity primary key,
    persona_id  uuid not null references public.persone (id) on delete cascade,
    campo       text not null,
    prima       text,
    dopo        text,
    da_persona  uuid references public.persone (id) on delete set null,
    da_email    text,
    motivo      text,
    il          timestamptz not null default now()
);
create index if not exists persone_modifiche_persona_idx on public.persone_modifiche (persona_id, il desc);

-- ─── Chi sta agendo ──────────────────────────────────────────────────────────
create or replace function public.mia_persona()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
    select id from public.persone where utente_id = auth.uid();
$$;

-- Chi lavora dentro CRIA: l'admin e gli interni.
create or replace function public.e_interno()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select public.e_admin() or exists (
        select 1 from public.ruoli r
        where r.persona_id = public.mia_persona() and r.ruolo in ('admin', 'interno')
    );
$$;

-- ─── Chi legge ───────────────────────────────────────────────────────────────
alter table public.persone enable row level security;
alter table public.ruoli enable row level security;
alter table public.persone_modifiche enable row level security;

drop policy if exists persone_lettura on public.persone;
create policy persone_lettura on public.persone
    for select to authenticated
    using (utente_id = (select auth.uid()) or (select public.e_interno()));

drop policy if exists ruoli_lettura on public.ruoli;
create policy ruoli_lettura on public.ruoli
    for select to authenticated
    using (persona_id = (select public.mia_persona()) or (select public.e_interno()));

drop policy if exists persone_modifiche_lettura on public.persone_modifiche;
create policy persone_modifiche_lettura on public.persone_modifiche
    for select to authenticated
    using (persona_id = (select public.mia_persona()) or (select public.e_interno()));

revoke all on public.persone, public.ruoli, public.persone_modifiche from anon, authenticated;
grant select on public.persone, public.ruoli, public.persone_modifiche to authenticated;

-- ─── Normalizzazioni ─────────────────────────────────────────────────────────
create or replace function public.solo_cifre_telefono(t text)
returns text
language sql
immutable
set search_path = ''
as $$
    select nullif(regexp_replace(coalesce(t, ''), '[^0-9+]', '', 'g'), '');
$$;

-- ─── Iscrizione ──────────────────────────────────────────────────────────────
-- Prima di creare l'account la pagina chiede se email, cellulare e codice
-- fiscale sono liberi: risponde sì o no, non dice di chi sono.
create or replace function public.dati_gia_usati(p_email text, p_telefono text default null, p_codice_fiscale text default null)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select jsonb_build_object(
        'email', exists (select 1 from public.persone where lower(email) = lower(trim(p_email)))
              or exists (select 1 from auth.users where lower(email) = lower(trim(p_email))),
        'telefono', p_telefono is not null and exists (
            select 1 from public.persone where public.solo_cifre_telefono(telefono) = public.solo_cifre_telefono(p_telefono)),
        'codice_fiscale', p_codice_fiscale is not null and exists (
            select 1 from public.persone where upper(codice_fiscale) = upper(replace(p_codice_fiscale, ' ', '')))
    );
$$;

-- All'iscrizione nasce la persona, con i dati scritti nel modulo. Se c'è già
-- una persona con quell'email e senza account (un soggetto che CRIA conosceva)
-- l'account si aggancia a lei invece di crearne una seconda.
create or replace function public.nuovo_utente()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
    esistente uuid;
begin
    if exists (select 1 from public.persone where utente_id = new.id) then
        return new;
    end if;
    select id into esistente from public.persone
     where utente_id is null and lower(email) = lower(new.email)
     limit 1;
    if esistente is not null then
        update public.persone set utente_id = new.id, aggiornata_il = now() where id = esistente;
        return new;
    end if;
    -- Gli account di prova creati dal seed hanno già la loro persona.
    if coalesce((m ->> 'account_demo')::boolean, false) then
        return new;
    end if;
    insert into public.persone (utente_id, tipo, nome, cognome, ragione_sociale, partita_iva, email, telefono, tipo_account)
    values (
        new.id,
        case when m ->> 'tipo' = 'giuridica' then 'giuridica' else 'fisica' end,
        nullif(trim(m ->> 'nome'), ''),
        nullif(trim(m ->> 'cognome'), ''),
        nullif(trim(m ->> 'ragione_sociale'), ''),
        nullif(regexp_replace(coalesce(m ->> 'partita_iva', ''), '\s', '', 'g'), ''),
        lower(new.email),
        nullif(trim(m ->> 'telefono'), ''),
        case when m ->> 'tipo_account' in ('privato', 'agenzia') then m ->> 'tipo_account' end
    );
    return new;
end;
$$;

drop trigger if exists persone_da_nuovo_utente on auth.users;
create trigger persone_da_nuovo_utente
    after insert on auth.users
    for each row execute function public.nuovo_utente();

-- ─── Modifica dei dati ───────────────────────────────────────────────────────
-- Ognuno cambia i propri dati; l'admin quelli di tutti, anche i suoi.
-- Da solo non si cambiano codice fiscale e partita IVA, e lo stato
-- dell'identità si porta solo a «in attesa» (documento inviato): verificarlo
-- è di CRIA. Quando l'admin cambia i dati di un altro scrive il motivo.
-- Ogni campo cambiato va nel registro; un'email cambiata cambia anche
-- l'email con cui si entra.
create or replace function public.aggiorna_persona(p_persona uuid, p_campi jsonb, p_motivo text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    io uuid := public.mia_persona();
    admin boolean := public.e_admin();
    prima public.persone;
    dopo public.persone;
    ammessi text[];
    chiave text;
    email_attore text := (select email from auth.users where id = auth.uid());
begin
    if auth.uid() is null then
        raise exception 'Serve l''accesso' using errcode = '42501';
    end if;
    select * into prima from public.persone where id = p_persona for update;
    if not found then
        raise exception 'Persona non trovata' using errcode = 'P0002';
    end if;
    if not admin and p_persona is distinct from io then
        raise exception 'Solo l''admin cambia i dati di un''altra persona' using errcode = '42501';
    end if;

    ammessi := case when admin
        then array['tipo', 'nome', 'cognome', 'ragione_sociale', 'partita_iva', 'codice_fiscale', 'data_nascita', 'luogo_nascita',
                   'email', 'telefono', 'indirizzo', 'fatturazione', 'stato_identita', 'motivo_integrazione']
        else array['nome', 'cognome', 'ragione_sociale', 'data_nascita', 'luogo_nascita', 'email', 'telefono', 'indirizzo',
                   'fatturazione', 'stato_identita', 'motivo_integrazione']
    end;
    for chiave in select jsonb_object_keys(p_campi) loop
        if not chiave = any (ammessi) then
            raise exception 'Il campo % non si può cambiare da qui', chiave using errcode = '42501';
        end if;
    end loop;
    if not admin and p_campi ? 'stato_identita' and p_campi ->> 'stato_identita' <> 'in_attesa' then
        raise exception 'L''identità la verifica CRIA' using errcode = '42501';
    end if;
    if admin and p_persona is distinct from io and length(trim(coalesce(p_motivo, ''))) < 5 then
        raise exception 'Scrivi perché cambi i dati di questa persona' using errcode = '22023';
    end if;

    begin
        update public.persone set
            tipo                = case when p_campi ? 'tipo' then p_campi ->> 'tipo' else tipo end,
            nome                = case when p_campi ? 'nome' then nullif(trim(p_campi ->> 'nome'), '') else nome end,
            cognome             = case when p_campi ? 'cognome' then nullif(trim(p_campi ->> 'cognome'), '') else cognome end,
            ragione_sociale     = case when p_campi ? 'ragione_sociale' then nullif(trim(p_campi ->> 'ragione_sociale'), '') else ragione_sociale end,
            partita_iva         = case when p_campi ? 'partita_iva' then nullif(regexp_replace(coalesce(p_campi ->> 'partita_iva', ''), '\s', '', 'g'), '') else partita_iva end,
            codice_fiscale      = case when p_campi ? 'codice_fiscale' then nullif(upper(regexp_replace(coalesce(p_campi ->> 'codice_fiscale', ''), '\s', '', 'g')), '') else codice_fiscale end,
            data_nascita        = case when p_campi ? 'data_nascita' then nullif(p_campi ->> 'data_nascita', '')::date else data_nascita end,
            luogo_nascita       = case when p_campi ? 'luogo_nascita' then nullif(trim(p_campi ->> 'luogo_nascita'), '') else luogo_nascita end,
            email               = case when p_campi ? 'email' then lower(nullif(trim(p_campi ->> 'email'), '')) else email end,
            telefono            = case when p_campi ? 'telefono' then nullif(trim(p_campi ->> 'telefono'), '') else telefono end,
            indirizzo           = case when p_campi ? 'indirizzo' then nullif(p_campi -> 'indirizzo', 'null'::jsonb) else indirizzo end,
            fatturazione        = case when p_campi ? 'fatturazione' then nullif(p_campi -> 'fatturazione', 'null'::jsonb) else fatturazione end,
            stato_identita      = case when p_campi ? 'stato_identita' then p_campi ->> 'stato_identita' else stato_identita end,
            motivo_integrazione = case when p_campi ? 'motivo_integrazione' then nullif(trim(p_campi ->> 'motivo_integrazione'), '') else motivo_integrazione end,
            aggiornata_il       = now(),
            aggiornata_da       = io
        where id = p_persona
        returning * into dopo;
    exception
        when unique_violation then
            raise exception '%', case
                when sqlerrm like '%persone_email_unica%' then 'email_usata'
                when sqlerrm like '%persone_telefono_unico%' then 'telefono_usato'
                when sqlerrm like '%persone_codice_fiscale_unico%' then 'codice_fiscale_usato'
                else 'dato_usato' end
                using errcode = '23505';
        when check_violation then
            raise exception 'dato_non_valido: %', sqlerrm using errcode = '23514';
    end;

    -- Il registro: una riga per campo cambiato.
    insert into public.persone_modifiche (persona_id, campo, prima, dopo, da_persona, da_email, motivo)
    select p_persona, k, to_jsonb(prima) ->> k, to_jsonb(dopo) ->> k, io, email_attore, nullif(trim(p_motivo), '')
      from unnest(ammessi) as k
     where (to_jsonb(prima) -> k) is distinct from (to_jsonb(dopo) -> k);

    -- L'email è anche quella con cui si entra.
    if dopo.utente_id is not null and dopo.email is not null and dopo.email is distinct from prima.email then
        update auth.users set email = dopo.email, updated_at = now() where id = dopo.utente_id;
        update auth.identities
           set identity_data = jsonb_set(identity_data, '{email}', to_jsonb(dopo.email)), updated_at = now()
         where user_id = dopo.utente_id and provider = 'email';
    end if;

    return to_jsonb(dopo);
end;
$$;

-- Al primo acquisto di CRIA Verifica la persona diventa cliente: se lo fa da sé.
create or replace function public.diventa_cliente()
returns void
language sql
security definer
set search_path = ''
as $$
    insert into public.ruoli (persona_id, ruolo)
    select public.mia_persona(), 'cliente'
     where public.mia_persona() is not null
    on conflict do nothing;
$$;

-- ─── Chi può chiamare cosa ───────────────────────────────────────────────────
revoke all on function public.mia_persona() from public, anon;
revoke all on function public.e_interno() from public, anon;
revoke all on function public.solo_cifre_telefono(text) from public;
revoke all on function public.nuovo_utente() from public, anon, authenticated;
revoke all on function public.aggiorna_persona(uuid, jsonb, text) from public, anon;
revoke all on function public.diventa_cliente() from public, anon;
revoke all on function public.dati_gia_usati(text, text, text) from public;

grant execute on function public.mia_persona() to authenticated;
grant execute on function public.e_interno() to authenticated;
grant execute on function public.solo_cifre_telefono(text) to anon, authenticated;
grant execute on function public.aggiorna_persona(uuid, jsonb, text) to authenticated;
grant execute on function public.diventa_cliente() to authenticated;
grant execute on function public.dati_gia_usati(text, text, text) to anon, authenticated;
