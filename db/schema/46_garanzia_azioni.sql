-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 46_garanzia_azioni.sql                                           ║
-- ║  Le azioni della garanzia, con le due firme scritte nel database.        ║
-- ║  Si esegue dopo 45_garanzia_letture.sql.                                 ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- LE QUATTRO INCOMPATIBILITÀ (§13.4) qui diventano codice:
--   chi istruisce e dispone un indennizzo non lo autorizza
--   chi propone un piano di rientro non lo approva
--   chi dispone un bonifico non lo autorizza
-- I vincoli CHECK sulle tabelle rifiutano comunque la riga: queste funzioni
-- danno l'errore giusto prima, e controllano anche la funzione di chi agisce.

create or replace function public.disponi_indennizzo(l_indennizzo uuid, la_nota text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not (public.e_admin() or public.ha_funzione('indennizzi')) then
        raise exception 'L''indennizzo lo istruisce e lo dispone la funzione indennizzi' using errcode = '42501';
    end if;
    update public.indennizzi
       set stato = 'disposto', disposto_da = public.mia_persona(), disposto_il = now(),
           nota_istruttoria = coalesce(la_nota, nota_istruttoria), aggiornato_il = now()
     where id = l_indennizzo and stato = 'da_disporre';
    if not found then
        raise exception 'Questo indennizzo non è da disporre' using errcode = 'P0002';
    end if;
end;
$$;

create or replace function public.autorizza_indennizzo(l_indennizzo uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    i public.indennizzi;
begin
    if not (public.e_admin() or public.ha_funzione('resp_amministrativo')) then
        raise exception 'I pagamenti li autorizza la responsabile amministrativa' using errcode = '42501';
    end if;
    select * into i from public.indennizzi where id = l_indennizzo;
    if not found or i.stato <> 'disposto' then
        raise exception 'Questo indennizzo non è da autorizzare' using errcode = 'P0002';
    end if;
    if i.disposto_da = public.mia_persona() then
        raise exception 'Chi dispone non autorizza: serve un''altra persona' using errcode = '42501';
    end if;
    update public.indennizzi
       set stato = 'autorizzato', autorizzato_da = public.mia_persona(), autorizzato_il = now(), aggiornato_il = now()
     where id = l_indennizzo;
end;
$$;

create or replace function public.esegui_indennizzo(l_indennizzo uuid, il_riferimento text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not (public.e_admin() or public.ha_funzione('tesoreria')) then
        raise exception 'Il bonifico lo esegue la tesoreria' using errcode = '42501';
    end if;
    update public.indennizzi
       set stato = 'pagato', eseguito_da = public.mia_persona(), eseguito_il = current_date,
           pagato_il = current_date, riferimento = il_riferimento, aggiornato_il = now()
     where id = l_indennizzo and stato = 'autorizzato';
    if not found then
        raise exception 'Questo indennizzo non è autorizzato' using errcode = 'P0002';
    end if;
end;
$$;

-- ─── Piani di rientro ────────────────────────────────────────────────────────
create or replace function public.proponi_piano(
    la_morosita uuid, le_rate integer, la_prima_scadenza date, la_nota text, l_importo numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    m public.pratiche_morosita;
    nuovo uuid;
    residuo numeric;
    base numeric;
    i integer;
    scadenza date;
begin
    if not (public.e_admin() or public.ha_funzione('gestore_pratica')) then
        raise exception 'Il piano lo propone il gestore della pratica' using errcode = '42501';
    end if;
    select * into m from public.pratiche_morosita where id = la_morosita;
    if not found or m.chiusa_il is not null then
        raise exception 'Pratica non trovata o chiusa' using errcode = 'P0002';
    end if;
    if le_rate is null or le_rate < 1 then
        raise exception 'Quante rate?' using errcode = '22023';
    end if;
    if la_prima_scadenza is null or la_prima_scadenza <= current_date then
        raise exception 'La prima rata deve scadere dopo oggi' using errcode = '22023';
    end if;
    if exists (select 1 from public.piani_rientro p where p.morosita_id = la_morosita and p.stato = 'proposto') then
        raise exception 'C''è già un piano in attesa di decisione' using errcode = '23505';
    end if;
    residuo := coalesce(l_importo, m.importo - coalesce((select sum(r.importo) from public.recuperi r where r.morosita_id = la_morosita), 0));
    if residuo <= 0 then
        raise exception 'Non c''è niente da rientrare' using errcode = '22023';
    end if;

    insert into public.piani_rientro (morosita_id, proposto_da, proposto_il, n_rate, importo_totale, prima_scadenza, nota, stato)
    values (la_morosita, public.mia_persona(), now(), le_rate, residuo, la_prima_scadenza, la_nota, 'proposto')
    returning id into nuovo;

    -- Rate uguali in euro interi; l'ultima assorbe il resto.
    base := floor(residuo / le_rate);
    for i in 1..le_rate loop
        scadenza := (la_prima_scadenza + ((i - 1) || ' months')::interval)::date;
        insert into public.rate_rientro (piano_id, numero, scadenza, importo, stato)
        values (nuovo, i, scadenza, case when i = le_rate then residuo - base * (le_rate - 1) else base end, 'attesa');
    end loop;
    update public.pratiche_morosita set stato = 'piano_proposto', aggiornato_il = now() where id = la_morosita;
    return nuovo;
end;
$$;

create or replace function public.approva_piano(il_piano uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    p public.piani_rientro;
begin
    if not (public.e_admin() or public.ha_funzione('resp_legale')) then
        raise exception 'Il piano lo approva il responsabile legale' using errcode = '42501';
    end if;
    select * into p from public.piani_rientro where id = il_piano;
    if not found or p.stato <> 'proposto' then
        raise exception 'Il piano non è in attesa di decisione' using errcode = 'P0002';
    end if;
    if p.proposto_da = public.mia_persona() then
        raise exception 'Chi propone non approva: serve un''altra persona' using errcode = '42501';
    end if;
    update public.piani_rientro
       set stato = 'approvato', approvato_da = public.mia_persona(), approvato_il = now(), aggiornato_il = now()
     where id = il_piano;
    update public.pratiche_morosita set stato = 'piano_attivo', aggiornato_il = now() where id = p.morosita_id;
end;
$$;

-- ─── Contatti con l'inquilino ────────────────────────────────────────────────
create or replace function public.registra_contatto(
    la_morosita uuid, il_canale text, l_esito text, la_nota text default null, il_quando timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    nuovo uuid;
begin
    if not (public.e_admin() or public.ha_funzione('gestore_pratica')) then
        raise exception 'I contatti li registra il gestore della pratica' using errcode = '42501';
    end if;
    insert into public.contatti_morosita (morosita_id, il, canale, esito, nota, da_persona)
    values (la_morosita, coalesce(il_quando, now()), il_canale, l_esito, la_nota, public.mia_persona())
    returning id into nuovo;
    update public.pratiche_morosita
       set primo_contatto_il = coalesce(primo_contatto_il, current_date),
           stato = case when stato = 'aperta' then 'in_contatto' else stato end,
           aggiornato_il = now()
     where id = la_morosita;
    return nuovo;
end;
$$;

revoke all on function public.disponi_indennizzo(uuid, text) from public, anon;
grant execute on function public.disponi_indennizzo(uuid, text) to authenticated;
revoke all on function public.autorizza_indennizzo(uuid) from public, anon;
grant execute on function public.autorizza_indennizzo(uuid) to authenticated;
revoke all on function public.esegui_indennizzo(uuid, text) from public, anon;
grant execute on function public.esegui_indennizzo(uuid, text) to authenticated;
revoke all on function public.proponi_piano(uuid, integer, date, text, numeric) from public, anon;
grant execute on function public.proponi_piano(uuid, integer, date, text, numeric) to authenticated;
revoke all on function public.approva_piano(uuid) from public, anon;
grant execute on function public.approva_piano(uuid) to authenticated;
revoke all on function public.registra_contatto(uuid, text, text, text, timestamptz) from public, anon;
grant execute on function public.registra_contatto(uuid, text, text, text, timestamptz) to authenticated;
