-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 41_documenti.sql                                                 ║
-- ║  I documenti veri: il magazzino dei file, chi può caricarli, chi li      ║
-- ║  verifica e quando si cancellano. Dopo 40_letture_contratti.sql.        ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- IL FILE sta nel magazzino (storage), la riga in `documenti`. Il percorso è
-- sempre  <persona>/<documento>-<nome del file>: così una cartella è di una
-- persona sola e la regola del magazzino è una riga.
--
-- CHI CARICA: la persona, sui propri documenti e su quelli dei contratti su
-- cui ha una posizione; chi lavora dentro CRIA su qualsiasi cosa. Un
-- documento nasce sempre «in attesa»: lo stato non lo sceglie chi carica.
--
-- CHI VERIFICA: l'istruttoria e l'admin. La verifica è umana, documento per
-- documento, e resta scritta con il nome di chi l'ha fatta (§14.5).
--
-- QUANDO SI CANCELLA: `cancellare_il` si scrive quando il documento arriva,
-- non quando ci si ricorda. Il file si toglie dal magazzino e la riga resta,
-- senza percorso: così si sa che c'era e che è stato cancellato.

-- ─── Il magazzino ────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documenti', 'documenti', false, 15728640,
        array['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/webp'])
on conflict (id) do update set
    public = false, file_size_limit = 15728640, allowed_mime_types = excluded.allowed_mime_types;

-- La cartella è la persona: ognuno scrive nella sua, e legge la sua.
drop policy if exists documenti_carica on storage.objects;
create policy documenti_carica on storage.objects for insert to authenticated
    with check (
        bucket_id = 'documenti'
        and ((storage.foldername(name))[1] = (select public.mia_persona())::text or (select public.e_interno()))
    );

drop policy if exists documenti_leggi on storage.objects;
create policy documenti_leggi on storage.objects for select to authenticated
    using (
        bucket_id = 'documenti'
        and ((storage.foldername(name))[1] = (select public.mia_persona())::text or (select public.e_interno()))
    );

-- Togliere un file dal magazzino lo fa solo chi lavora dentro CRIA: la
-- cancellazione è una decisione, non un ripensamento.
drop policy if exists documenti_togli on storage.objects;
create policy documenti_togli on storage.objects for delete to authenticated
    using (bucket_id = 'documenti' and (select public.e_interno()));

-- ─── Chi può attaccare un documento a cosa ───────────────────────────────────
create or replace function public.posso_sul_documento(l_entita text, l_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select case
        when public.e_interno() then true
        when l_entita = 'persona' then l_id = public.mia_persona()
        when l_entita = 'contratto' then exists (
            select 1 from public.posizioni p
            where p.contratto_id = l_id and p.persona_id = public.mia_persona()
        )
        when l_entita = 'immobile' then exists (
            select 1 from public.titolarita t
            where t.immobile_id = l_id and t.persona_id = public.mia_persona() and t.al is null
        )
        else false
    end;
$$;

-- ─── Caricare ────────────────────────────────────────────────────────────────
-- Si chiama dopo aver messo il file nel magazzino: la riga tiene insieme il
-- file e quello che significa.
create or replace function public.registra_documento(
    l_entita text, l_id uuid, il_tipo text, il_nome text, il_percorso text,
    il_mime text default null, la_dimensione bigint default null,
    la_persona uuid default null, sensibile boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    nuovo uuid;
    di_chi uuid;
begin
    if not public.posso_sul_documento(l_entita, l_id) then
        raise exception 'Questo documento non si può caricare qui' using errcode = '42501';
    end if;
    -- Di chi è il documento: la persona a cui i dati si riferiscono. Se non
    -- lo dice chi carica, è di chi carica.
    di_chi := coalesce(la_persona, case when l_entita = 'persona' then l_id else public.mia_persona() end);
    insert into public.documenti (persona_id, entita_tipo, entita_id, tipo, nome_file, percorso, mime, dimensione,
                                  stato, caricato_da, sensibile)
    values (di_chi, l_entita, l_id, il_tipo, il_nome, il_percorso, il_mime, la_dimensione,
            'in_attesa', public.mia_persona(), sensibile)
    returning id into nuovo;
    return nuovo;
end;
$$;

-- ─── Verificare ──────────────────────────────────────────────────────────────
create or replace function public.verifica_documento(il_documento uuid, l_esito text, il_motivo text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not (public.e_admin() or public.ha_funzione('istruttoria') or public.ha_funzione('responsabile_operativo')) then
        raise exception 'La verifica dei documenti la fa l''istruttoria' using errcode = '42501';
    end if;
    if l_esito not in ('verificato', 'rifiutato', 'da_integrare', 'non_conforme') then
        raise exception 'Esito non previsto: %', l_esito using errcode = '22023';
    end if;
    if l_esito <> 'verificato' and coalesce(length(trim(il_motivo)), 0) < 5 then
        raise exception 'Serve il motivo: chi ha caricato il documento deve sapere cosa sistemare' using errcode = '22023';
    end if;
    update public.documenti
       set stato = l_esito::public.stato_documento,
           motivo = il_motivo,
           verificato_da = public.mia_persona(),
           verificato_il = now()
     where id = il_documento and cancellato_il is null;
    if not found then
        raise exception 'Documento non trovato' using errcode = 'P0002';
    end if;
end;
$$;

-- ─── Cancellare ──────────────────────────────────────────────────────────────
-- Il file sparisce, la riga resta: serve sapere che quel documento c'era.
create or replace function public.cancella_documento(il_documento uuid, il_motivo text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    d public.documenti;
begin
    select * into d from public.documenti where id = il_documento;
    if not found then
        raise exception 'Documento non trovato' using errcode = 'P0002';
    end if;
    -- Chi lavora dentro CRIA sempre; chi l'ha caricato solo finché nessuno
    -- l'ha guardato.
    if not (public.e_interno() or (d.caricato_da = public.mia_persona() and d.verificato_il is null)) then
        raise exception 'Questo documento non lo puoi cancellare' using errcode = '42501';
    end if;
    delete from storage.objects where bucket_id = 'documenti' and name = d.percorso;
    update public.documenti
       set cancellato_il = now(), percorso = null, motivo = coalesce(il_motivo, motivo)
     where id = il_documento;
end;
$$;

-- I documenti scaduti di conservazione: li toglie il sistema, ogni notte.
create or replace function public.cancella_documenti_scaduti()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
    quanti integer := 0;
    d public.documenti;
begin
    for d in select * from public.documenti
              where cancellato_il is null and cancellare_il is not null and cancellare_il <= current_date
    loop
        delete from storage.objects where bucket_id = 'documenti' and name = d.percorso;
        update public.documenti set cancellato_il = now(), percorso = null,
               motivo = coalesce(motivo, 'Conservazione scaduta')
         where id = d.id;
        quanti := quanti + 1;
    end loop;
    return quanti;
end;
$$;

-- ─── Leggere ─────────────────────────────────────────────────────────────────
-- I documenti che chi guarda può vedere: i suoi, quelli dei contratti su cui
-- ha una posizione, quelli dei suoi immobili. Gli interni tutti.
create or replace function public.documenti_visibili()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(jsonb_agg(jsonb_build_object(
        'id', d.id,
        'personaId', public.id_con_account(pe),
        'soggettoId', pe.codice_demo,
        'entitaTipo', d.entita_tipo,
        'entitaId', d.entita_id,
        'contrattoId', case when d.entita_tipo = 'contratto' then (select coalesce(k.codice_demo, k.id::text) from public.contratti k where k.id = d.entita_id) end,
        'tipo', d.tipo,
        'nome', d.nome_file,
        'percorso', d.percorso,
        'mime', d.mime,
        'dimensione', d.dimensione,
        'stato', d.stato,
        'motivo', d.motivo,
        'caricatoIl', d.caricato_il::date,
        'verificatoIl', d.verificato_il::date,
        'verificatoDa', (select public.nome_persona(v) from public.persone v where v.id = d.verificato_da),
        'cancellatoIl', d.cancellato_il::date,
        'conservazioneFinoA', d.cancellare_il
    ) order by d.caricato_il desc), '[]'::jsonb)
    from public.documenti d
    left join public.persone pe on pe.id = d.persona_id
    where d.cancellato_il is null
      and (public.e_interno()
           or d.persona_id = public.mia_persona()
           or public.posso_sul_documento(d.entita_tipo, d.entita_id));
$$;

revoke all on function public.registra_documento(text, uuid, text, text, text, text, bigint, uuid, boolean) from public, anon;
grant execute on function public.registra_documento(text, uuid, text, text, text, text, bigint, uuid, boolean) to authenticated;
revoke all on function public.verifica_documento(uuid, text, text) from public, anon;
grant execute on function public.verifica_documento(uuid, text, text) to authenticated;
revoke all on function public.cancella_documento(uuid, text) from public, anon;
grant execute on function public.cancella_documento(uuid, text) to authenticated;
revoke all on function public.cancella_documenti_scaduti() from public, anon, authenticated;
revoke all on function public.documenti_visibili() from public, anon;
grant execute on function public.documenti_visibili() to authenticated;
revoke all on function public.posso_sul_documento(text, uuid) from public, anon;
grant execute on function public.posso_sul_documento(text, uuid) to authenticated;
