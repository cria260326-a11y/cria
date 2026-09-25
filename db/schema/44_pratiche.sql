-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 44_pratiche.sql                                                  ║
-- ║  La pratica: si apre, si istruisce, si delibera, diventa contratto.      ║
-- ║  Si esegue dopo 43_ciclo_mensile.sql.                                    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- LA PRATICA è l'oggetto centrale (§1.4): nasce quando qualcuno compra, passa
-- dai documenti e dall'istruttoria, e finisce in un contratto attivo.
--
-- COLONNE E `dati`. Quello che serve alle regole e alle code — chi, quale
-- prodotto, che stato, quanto, quando — sta in colonna. Il resto della pratica
-- (il candidato invitato, i documenti chiesti al proprietario, la nota
-- dell'istruttoria) sta in `dati` finché non serve interrogarlo: si sposta in
-- colonna quando una regola avrà bisogno di leggerlo, non prima.
--
-- LE PAROLE DELLO STATO. Nel database gli stati sono quelli dell'enum; nelle
-- schermate sono più corti («documenti», «pagamento», «firma»). La traduzione
-- sta qui sotto, in un posto solo.
--
-- CHI DELIBERA. L'istruttoria, e non chi ha portato il cliente: il commerciale
-- che ha in mano il codice referente non può deliberare la pratica che ha
-- portato (§13.4).

alter type stato_pratica add value if not exists 'in_attesa_firma';
alter type stato_pratica add value if not exists 'respinta';
alter table public.pratiche add column if not exists dati jsonb;
alter table public.pratiche add column if not exists di_prova boolean not null default false;

-- ─── Le parole dello stato ───────────────────────────────────────────────────
create or replace function public.stato_pratica_breve(lo_stato public.stato_pratica)
returns text
language sql
immutable
set search_path = ''
as $$
    select case lo_stato
        when 'documenti_caricati' then 'documenti'
        when 'documenti_da_integrare' then 'documenti'
        when 'in_verifica' then 'istruttoria'
        when 'verificata' then 'istruttoria'
        when 'in_attesa_pagamento' then 'pagamento'
        when 'in_attesa_firma' then 'firma'
        when 'attiva' then 'attiva'
        when 'respinta' then 'respinta'
        when 'annullata' then 'annullata'
        when 'chiusa' then 'chiusa'
        when 'sospesa' then 'sospesa'
        else 'documenti' end;
$$;

create or replace function public.stato_pratica_lungo(lo_stato text)
returns public.stato_pratica
language sql
immutable
set search_path = ''
as $$
    select case lo_stato
        when 'documenti' then 'documenti_caricati'
        when 'istruttoria' then 'in_verifica'
        when 'pagamento' then 'in_attesa_pagamento'
        when 'firma' then 'in_attesa_firma'
        when 'attiva' then 'attiva'
        when 'respinta' then 'respinta'
        when 'annullata' then 'annullata'
        when 'chiusa' then 'chiusa'
        when 'sospesa' then 'sospesa'
        else 'documenti_caricati' end::public.stato_pratica;
$$;

-- ─── Leggere ─────────────────────────────────────────────────────────────────
-- La pratica torna nella forma che usano le schermate: `dati` con sopra le
-- colonne, che sono quelle che comandano.
create or replace function public.pratiche_visibili()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(jsonb_agg(
        coalesce(p.dati, '{}'::jsonb) || jsonb_build_object(
            'id', coalesce(p.codice, p.id::text),
            'praticaDb', p.id,
            'personaId', public.id_con_account(pe),
            'soggettoId', pe.codice_demo,
            'prodotto', p.prodotto,
            'stato', public.stato_pratica_breve(p.stato),
            'canone', p.canone,
            'apertaIl', p.aperta_il::date,
            'quotaPagataIl', p.quota_pagata_il,
            'contrattoId', (select coalesce(k.codice_demo, k.id::text) from public.contratti k where k.id = p.contratto_id),
            'dalDatabase', true
        ) order by p.aperta_il desc), '[]'::jsonb)
    from public.pratiche p
    left join public.persone pe on pe.id = p.persona_id
    where public.e_interno()
       or p.persona_id = public.mia_persona()
       or p.commerciale_id = public.mia_persona()
       or p.avvocato_id = public.mia_persona();
$$;

-- ─── Aprire ──────────────────────────────────────────────────────────────────
create or replace function public.apri_pratica(i_dati jsonb)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    nuova uuid;
    codice text;
    prodotto text;
begin
    if public.mia_persona() is null then
        raise exception 'Serve l''accesso' using errcode = '42501';
    end if;
    prodotto := i_dati->>'prodotto';
    if not exists (select 1 from public.prodotti where codice = prodotto and attivo) then
        raise exception 'Prodotto non in listino: %', prodotto using errcode = '22023';
    end if;
    codice := 'PR-' || to_char(now(), 'YYYY') || '-' || lpad((
        select (count(*) + 1)::text from public.pratiche where aperta_il >= date_trunc('year', now())
    ), 4, '0');

    insert into public.pratiche (codice, persona_id, tipo_flusso, prodotto, stato, canone, dati, codice_referente)
    values (codice, public.mia_persona(),
            coalesce((i_dati->>'tipoFlusso'), 'AB')::public.tipo_flusso,
            prodotto, 'documenti_caricati',
            nullif(i_dati->>'canone', '')::numeric,
            i_dati - 'id' - 'personaId' - 'prodotto' - 'stato' - 'canone',
            i_dati->>'referente')
    returning id into nuova;
    return codice;
end;
$$;

-- ─── Farla avanzare ──────────────────────────────────────────────────────────
-- I passaggi del percorso: il cliente paga e firma, CRIA istruisce. Ogni
-- passaggio dice chi può farlo.
create or replace function public.avanza_pratica(la_pratica uuid, il_nuovo_stato text, i_cambi jsonb default '{}'::jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    p public.pratiche;
    sua boolean;
begin
    select * into p from public.pratiche where id = la_pratica;
    if not found then
        raise exception 'Pratica non trovata' using errcode = 'P0002';
    end if;
    sua := p.persona_id = public.mia_persona();
    if not (public.e_interno() or sua) then
        raise exception 'Questa pratica non è tua' using errcode = '42501';
    end if;
    -- Il cliente può pagare e firmare; l'istruttoria e il resto sono di CRIA.
    if not public.e_interno() and il_nuovo_stato not in ('pagamento', 'firma', 'attiva', 'documenti') then
        raise exception 'Questo passaggio lo fa CRIA' using errcode = '42501';
    end if;

    update public.pratiche
       set stato = public.stato_pratica_lungo(il_nuovo_stato),
           dati = coalesce(dati, '{}'::jsonb) || coalesce(i_cambi, '{}'::jsonb),
           quota_pagata_il = coalesce((i_cambi->>'quotaPagataIl')::date, quota_pagata_il),
           pagata_il = coalesce((i_cambi->'pagamento'->>'pagataIl')::date, pagata_il),
           importo_pagato = coalesce((i_cambi->'pagamento'->>'importo')::numeric, importo_pagato),
           conclusa_il = case when il_nuovo_stato in ('attiva', 'respinta', 'chiusa') then now() else conclusa_il end,
           aggiornato_il = now()
     where id = la_pratica;
end;
$$;

-- ─── Deliberare ──────────────────────────────────────────────────────────────
create or replace function public.delibera_pratica(la_pratica uuid, l_esito text, la_nota text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    p public.pratiche;
begin
    if not (public.e_admin() or public.ha_funzione('istruttoria') or public.ha_funzione('responsabile_operativo')) then
        raise exception 'La delibera la fa l''istruttoria' using errcode = '42501';
    end if;
    select * into p from public.pratiche where id = la_pratica;
    if not found then
        raise exception 'Pratica non trovata' using errcode = 'P0002';
    end if;
    -- Chi ha portato il cliente non delibera la sua pratica (§13.4).
    if p.commerciale_id is not null and p.commerciale_id = public.mia_persona() then
        raise exception 'Chi ha portato il cliente non delibera la sua pratica' using errcode = '42501';
    end if;
    if l_esito not in ('approvata', 'respinta') then
        raise exception 'Si approva o si respinge' using errcode = '22023';
    end if;
    if coalesce(length(trim(la_nota)), 0) < 5 then
        raise exception 'Serve la motivazione della delibera' using errcode = '22023';
    end if;

    update public.pratiche
       set stato = case when l_esito = 'approvata' then 'in_attesa_pagamento' else 'respinta' end::public.stato_pratica,
           esito = l_esito,
           motivo_esito = trim(la_nota),
           conclusa_il = case when l_esito = 'respinta' then now() else conclusa_il end,
           dati = coalesce(dati, '{}'::jsonb) || jsonb_build_object('istruttoria', jsonb_build_object(
               'conclusaIl', current_date, 'esito', l_esito, 'nota', trim(la_nota),
               'deliberataDa', public.nome_persona((select p2 from public.persone p2 where p2.id = public.mia_persona()))
           )),
           aggiornato_il = now()
     where id = la_pratica;
end;
$$;

revoke all on function public.pratiche_visibili() from public, anon;
grant execute on function public.pratiche_visibili() to authenticated;
revoke all on function public.apri_pratica(jsonb) from public, anon;
grant execute on function public.apri_pratica(jsonb) to authenticated;
revoke all on function public.avanza_pratica(uuid, text, jsonb) from public, anon;
grant execute on function public.avanza_pratica(uuid, text, jsonb) to authenticated;
revoke all on function public.delibera_pratica(uuid, text, text) from public, anon;
grant execute on function public.delibera_pratica(uuid, text, text) to authenticated;
