-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 48_note_referenze.sql                                            ║
-- ║  Le note interne delle pratiche e le referenze delle autocandidature.    ║
-- ║  Si esegue dopo 47_verifiche_certificati.sql.                            ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- LE NOTE INTERNE non escono dal back office: le scrivono il gestore e la
-- responsabile legale, e il cliente non le vede mai. Stanno in `note_interne`,
-- che vale per qualsiasi cosa: una morosità, una pratica, un soggetto.
--
-- LA REFERENZA è la domanda al precedente proprietario: «ha pagato?». Si
-- risponde da un link personale, **senza account**: il token è la chiave, e
-- chi risponde vede solo quella referenza — non l'autocandidatura, non il
-- resto dello storico. Il link firmato arriverà: per ora il token è un codice
-- casuale, e la funzione controlla che la referenza sia ancora in attesa.

alter table public.referenze add column if not exists token text unique;
alter table public.referenze add column if not exists tentativi jsonb not null default '[]'::jsonb;
alter table public.referenze add column if not exists replica jsonb;
alter table public.referenze add column if not exists inquilino text;
alter table public.referenze add column if not exists di_prova boolean not null default false;
alter table public.note_interne add column if not exists di_prova boolean not null default false;

-- ─── Note interne ────────────────────────────────────────────────────────────
create or replace function public.scrivi_nota_interna(l_entita text, l_id uuid, il_testo text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    nuova uuid;
begin
    if not public.e_interno() then
        raise exception 'Le note interne le scrive chi lavora dentro CRIA' using errcode = '42501';
    end if;
    if coalesce(length(trim(il_testo)), 0) < 2 then
        raise exception 'La nota è vuota' using errcode = '22023';
    end if;
    insert into public.note_interne (entita_tipo, entita_id, autore_id, testo)
    values (l_entita, l_id, public.mia_persona(), trim(il_testo))
    returning id into nuova;
    return nuova;
end;
$$;

create or replace function public.note_interne_di(l_entita text, l_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select case when not public.e_interno() then '[]'::jsonb else coalesce(jsonb_agg(jsonb_build_object(
        'id', n.id, 'il', n.il::date, 'testo', n.testo,
        'autore', (select public.id_con_account(p) from public.persone p where p.id = n.autore_id)
    ) order by n.il), '[]'::jsonb) end
    from public.note_interne n
    where n.entita_tipo = l_entita and n.entita_id = l_id;
$$;

-- ─── Referenze ───────────────────────────────────────────────────────────────
-- La chiede l'inquilino sulla sua autocandidatura.
create or replace function public.chiedi_referenza(
    l_autocandidatura uuid, il_nome text, l_email text, il_telefono text,
    l_immobile text, il_dal text, l_al text, l_inquilino text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    a public.autocandidature;
    token text;
    nuova uuid;
begin
    select * into a from public.autocandidature where id = l_autocandidatura;
    if not found then
        raise exception 'Autocandidatura non trovata' using errcode = 'P0002';
    end if;
    if not (public.e_interno() or a.persona_id = public.mia_persona()) then
        raise exception 'Questa autocandidatura non è tua' using errcode = '42501';
    end if;
    if coalesce(length(trim(il_nome)), 0) < 2 or (coalesce(l_email, '') = '' and coalesce(il_telefono, '') = '') then
        raise exception 'Servono il nome e almeno un recapito' using errcode = '22023';
    end if;
    token := encode(extensions.gen_random_bytes(9), 'base64');
    token := replace(replace(replace(token, '/', ''), '+', ''), '=', '');

    insert into public.referenze (autocandidatura_id, nome, email, telefono, immobile, dal, al, stato, chiesta_il, token, tentativi, inquilino)
    values (l_autocandidatura, trim(il_nome), nullif(l_email, ''), nullif(il_telefono, ''), l_immobile,
            (il_dal || '-01')::date, (l_al || '-01')::date, 'contattata', now(), token,
            jsonb_build_array(jsonb_build_object('canale', case when coalesce(l_email, '') <> '' then 'email' else 'sms' end, 'il', current_date)),
            l_inquilino)
    returning id into nuova;
    return jsonb_build_object('id', nuova, 'token', token);
end;
$$;

-- La pagina pubblica: si entra col token, e si vede solo quella referenza.
create or replace function public.referenza_dal_token(il_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select case when r.id is null then null else jsonb_build_object(
        'id', r.id,
        'token', r.token,
        'inquilino', r.inquilino,
        'proprietario', jsonb_build_object('nome', r.nome, 'email', r.email, 'telefono', r.telefono),
        'immobile', r.immobile,
        'dal', to_char(r.dal, 'YYYY-MM'),
        'al', to_char(r.al, 'YYYY-MM'),
        'richiestaIl', r.chiesta_il::date,
        'stato', case r.stato when 'contattata' then 'in_attesa' else r.stato end,
        'risposta', r.risposta,
        'replica', r.replica,
        'tentativi', r.tentativi
    ) end
    from public.referenze r
    where r.token = il_token;
$$;

-- La risposta del precedente proprietario, dal link personale: conferma, o
-- smentita con i mesi e almeno un documento. Senza prova la smentita non si
-- registra: decade e non lascia traccia.
create or replace function public.rispondi_referenza(
    il_token text, l_esito text, i_mesi text[] default null, i_documenti jsonb default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    r public.referenze;
    mesi_validi text[];
begin
    select * into r from public.referenze where token = il_token;
    if not found or r.stato not in ('contattata', 'da_contattare') then
        return false;
    end if;
    if l_esito = 'conferma' then
        update public.referenze
           set stato = 'risposta', giudizio = 'conferma', risposta_il = now(),
               risposta = jsonb_build_object('esito', 'conferma', 'il', current_date)
         where id = r.id;
        return true;
    end if;
    if l_esito <> 'smentita' or i_documenti is null or jsonb_array_length(i_documenti) = 0 then
        return false;
    end if;
    select array_agg(distinct m order by m) into mesi_validi
      from unnest(coalesce(i_mesi, '{}')) as m
     where m >= to_char(r.dal, 'YYYY-MM') and m <= to_char(r.al, 'YYYY-MM');
    if mesi_validi is null or array_length(mesi_validi, 1) = 0 then
        return false;
    end if;
    update public.referenze
       set stato = 'risposta', giudizio = 'smentita', risposta_il = now(),
           risposta = jsonb_build_object('esito', 'smentita', 'il', current_date, 'mesi', to_jsonb(mesi_validi), 'documenti', i_documenti)
     where id = r.id;
    return true;
end;
$$;

-- L'inquilino risponde alla smentita con i movimenti del suo conto.
create or replace function public.replica_alla_smentita(la_referenza uuid, il_file text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    r public.referenze;
    a public.autocandidature;
begin
    select * into r from public.referenze where id = la_referenza;
    if not found or r.giudizio <> 'smentita' or r.replica is not null then
        return false;
    end if;
    select * into a from public.autocandidature where id = r.autocandidatura_id;
    if not (public.e_interno() or a.persona_id = public.mia_persona()) then
        raise exception 'Questa referenza non è tua' using errcode = '42501';
    end if;
    update public.referenze set replica = jsonb_build_object('file', il_file, 'il', current_date) where id = r.id;
    return true;
end;
$$;

create or replace function public.referenze_dell_autocandidatura(l_autocandidatura uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(jsonb_agg(jsonb_build_object(
        'id', r.id, 'token', r.token, 'inquilino', r.inquilino,
        'proprietario', jsonb_build_object('nome', r.nome, 'email', r.email, 'telefono', r.telefono),
        'immobile', r.immobile,
        'dal', to_char(r.dal, 'YYYY-MM'), 'al', to_char(r.al, 'YYYY-MM'),
        'richiestaIl', r.chiesta_il::date,
        'stato', case r.stato when 'contattata' then 'in_attesa' when 'risposta' then coalesce(r.giudizio, 'confermata') else r.stato end,
        'risposta', r.risposta, 'replica', r.replica, 'tentativi', r.tentativi
    ) order by r.creato_il), '[]'::jsonb)
    from public.referenze r
    where r.autocandidatura_id = l_autocandidatura;
$$;

revoke all on function public.scrivi_nota_interna(text, uuid, text) from public, anon;
grant execute on function public.scrivi_nota_interna(text, uuid, text) to authenticated;
revoke all on function public.note_interne_di(text, uuid) from public, anon;
grant execute on function public.note_interne_di(text, uuid) to authenticated;
revoke all on function public.chiedi_referenza(uuid, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.chiedi_referenza(uuid, text, text, text, text, text, text, text) to authenticated;
revoke all on function public.replica_alla_smentita(uuid, text) from public, anon;
grant execute on function public.replica_alla_smentita(uuid, text) to authenticated;
revoke all on function public.referenze_dell_autocandidatura(uuid) from public, anon;
grant execute on function public.referenze_dell_autocandidatura(uuid) to authenticated;
-- Queste due sì, anche senza account: è il link personale di chi risponde.
grant execute on function public.referenza_dal_token(text) to anon, authenticated;
grant execute on function public.rispondi_referenza(text, text, text[], jsonb) to anon, authenticated;
