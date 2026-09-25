-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 42_conversazioni.sql                                             ║
-- ║  Le conversazioni con i clienti: chi le vede, chi scrive, quando si      ║
-- ║  chiudono. Si esegue dopo 41_documenti.sql.                              ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- UNA CONVERSAZIONE è un filo con una persona: assistenza, una domanda su un
-- prodotto, un documento da rifare. Chi l'ha aperta la vede tutta; chi lavora
-- dentro CRIA le vede tutte.
--
-- I MESSAGGI INTERNI non li legge il cliente: è una colonna, non il modo in cui
-- si disegna la pagina. Se il filtro stesse solo nell'interfaccia, basterebbe
-- guardare la risposta del server per leggerli.
--
-- QUANDO IL CLIENTE SCRIVE su una conversazione chiusa, si riapre: chiuderla
-- non deve diventare un modo per non rispondere.

-- ─── Chi può vedere una conversazione ────────────────────────────────────────
create or replace function public.posso_sulla_conversazione(la_conversazione uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select public.e_interno() or exists (
        select 1 from public.conversazioni c
        where c.id = la_conversazione and c.aperta_da = public.mia_persona()
    );
$$;

-- ─── Leggere ─────────────────────────────────────────────────────────────────
create or replace function public.conversazioni_visibili()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(jsonb_agg(jsonb_build_object(
        'id', c.id,
        'codice', c.codice,
        'oggetto', c.oggetto,
        'categoria', c.categoria,
        'area', c.area,
        'stato', c.stato,
        'priorita', c.priorita,
        'apertaDa', jsonb_build_object(
            'personaId', public.id_con_account(pe),
            'soggettoId', pe.codice_demo,
            'nome', public.nome_persona(pe)
        ),
        'assegnataA', (select jsonb_build_object('personaId', public.id_con_account(a), 'nome', public.nome_persona(a))
                         from public.persone a where a.id = c.assegnata_a),
        'creatoIl', c.creato_il,
        'ultimoMessaggioIl', c.ultimo_messaggio_il,
        'chiusaIl', c.chiusa_il,
        'messaggi', (
            select coalesce(jsonb_agg(jsonb_build_object(
                'id', m.id,
                'testo', m.testo,
                'il', m.il,
                'daCria', m.da_cria,
                'interno', m.interno,
                'autore', jsonb_build_object(
                    'personaId', public.id_con_account(au),
                    'nome', coalesce(public.nome_persona(au), 'CRIA')
                )
            ) order by m.il), '[]'::jsonb)
            from public.messaggi m
            left join public.persone au on au.id = m.autore_id
            where m.conversazione_id = c.id
              and (public.e_interno() or not m.interno)
        )
    ) order by coalesce(c.ultimo_messaggio_il, c.creato_il) desc), '[]'::jsonb)
    from public.conversazioni c
    left join public.persone pe on pe.id = c.aperta_da
    where public.e_interno() or c.aperta_da = public.mia_persona();
$$;

-- ─── Aprire ──────────────────────────────────────────────────────────────────
create or replace function public.apri_conversazione(
    l_oggetto text, la_categoria text, l_area text, il_testo text,
    per_persona uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    nuova uuid;
    di_chi uuid;
begin
    if public.mia_persona() is null then
        raise exception 'Serve l''accesso' using errcode = '42501';
    end if;
    if coalesce(length(trim(l_oggetto)), 0) < 3 then
        raise exception 'Serve un oggetto' using errcode = '22023';
    end if;
    if coalesce(length(trim(il_testo)), 0) < 2 then
        raise exception 'Serve un messaggio' using errcode = '22023';
    end if;
    -- Chi lavora dentro CRIA può aprirla per conto di un cliente.
    di_chi := case when per_persona is not null and public.e_interno() then per_persona else public.mia_persona() end;

    insert into public.conversazioni (oggetto, categoria, area, aperta_da, stato, ultimo_messaggio_il)
    values (trim(l_oggetto), la_categoria, l_area, di_chi, 'aperto', now())
    returning id into nuova;

    insert into public.messaggi (conversazione_id, autore_id, da_cria, testo)
    values (nuova, public.mia_persona(), public.e_interno(), trim(il_testo));

    update public.conversazioni set codice = 'ASS-' || to_char(now(), 'YYYY') || '-' || lpad((
        select count(*)::text from public.conversazioni where creato_il >= date_trunc('year', now())
    ), 4, '0') where id = nuova;
    return nuova;
end;
$$;

-- ─── Scrivere ────────────────────────────────────────────────────────────────
create or replace function public.scrivi_messaggio(la_conversazione uuid, il_testo text, l_interno boolean default false)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    nuovo uuid;
    interno boolean;
begin
    if not public.posso_sulla_conversazione(la_conversazione) then
        raise exception 'Questa conversazione non è tua' using errcode = '42501';
    end if;
    if coalesce(length(trim(il_testo)), 0) < 1 then
        raise exception 'Il messaggio è vuoto' using errcode = '22023';
    end if;
    -- Una nota interna la scrive solo chi lavora dentro CRIA.
    interno := l_interno and public.e_interno();

    insert into public.messaggi (conversazione_id, autore_id, da_cria, interno, testo)
    values (la_conversazione, public.mia_persona(), public.e_interno(), interno, trim(il_testo))
    returning id into nuovo;

    update public.conversazioni
       set ultimo_messaggio_il = now(),
           -- Se il cliente scrive su una conversazione chiusa, si riapre.
           stato = case
               when not public.e_interno() and stato = 'risolto' then 'aperto'::public.stato_ticket
               when public.e_interno() and stato = 'aperto' then 'in_corso'::public.stato_ticket
               else stato end,
           chiusa_il = case when not public.e_interno() and stato = 'risolto' then null else chiusa_il end
     where id = la_conversazione;
    return nuovo;
end;
$$;

-- ─── Chiudere, riaprire, assegnare ───────────────────────────────────────────
create or replace function public.cambia_stato_conversazione(la_conversazione uuid, il_nuovo text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not public.posso_sulla_conversazione(la_conversazione) then
        raise exception 'Questa conversazione non è tua' using errcode = '42501';
    end if;
    if il_nuovo not in ('aperto', 'in_corso', 'risolto') then
        raise exception 'Stato non previsto: %', il_nuovo using errcode = '22023';
    end if;
    update public.conversazioni
       set stato = il_nuovo::public.stato_ticket,
           chiusa_il = case when il_nuovo = 'risolto' then now() else null end
     where id = la_conversazione;
end;
$$;

create or replace function public.assegna_conversazione(la_conversazione uuid, a_persona uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not public.e_interno() then
        raise exception 'Le conversazioni le assegna chi lavora dentro CRIA' using errcode = '42501';
    end if;
    update public.conversazioni set assegnata_a = a_persona where id = la_conversazione;
    insert into public.assegnazioni (entita_tipo, entita_id, persona_id, tipo, assegnata_da)
    values ('conversazione', la_conversazione, a_persona, 'gestore', public.mia_persona());
end;
$$;

revoke all on function public.conversazioni_visibili() from public, anon;
grant execute on function public.conversazioni_visibili() to authenticated;
revoke all on function public.apri_conversazione(text, text, text, text, uuid) from public, anon;
grant execute on function public.apri_conversazione(text, text, text, text, uuid) to authenticated;
revoke all on function public.scrivi_messaggio(uuid, text, boolean) from public, anon;
grant execute on function public.scrivi_messaggio(uuid, text, boolean) to authenticated;
revoke all on function public.cambia_stato_conversazione(uuid, text) from public, anon;
grant execute on function public.cambia_stato_conversazione(uuid, text) to authenticated;
revoke all on function public.assegna_conversazione(uuid, uuid) from public, anon;
grant execute on function public.assegna_conversazione(uuid, uuid) to authenticated;
revoke all on function public.posso_sulla_conversazione(uuid) from public, anon;
grant execute on function public.posso_sulla_conversazione(uuid) to authenticated;
