-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 43_ciclo_mensile.sql                                             ║
-- ║  Il mese che si muove: segnalazione, contestazione, decisione.           ║
-- ║  Si esegue dopo 42_conversazioni.sql.                                    ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- LE REGOLE DEL MESE (§9.2 e §9.3) non sono costanti nel codice: stanno in
-- `parametri`, così cambiarle è una riga, non un rilascio.
--
-- SEGNALARE lo fa il proprietario (o CRIA, quando incassa CRIA). La finestra
-- conta: dentro, la copertura del mese resta attiva; fuori, il mese entra
-- comunque nello storico dell'inquilino ma la copertura decade. Sono due
-- conseguenze diverse, una per ciascuna parte.
--
-- CONTESTARE lo fa l'inquilino, entro i giorni previsti dalla segnalazione di
-- mancato pagamento. Mentre la contestazione è aperta il mese non conta.
--
-- DECIDERE lo fa CRIA. Se la decisione cambia il semaforo — cioè rettifica il
-- mese — servono due firme diverse: chi decide non conferma da solo. Il
-- vincolo è del database (CHECK su contestazioni), non dell'interfaccia.

-- La data che la rettifica propone: il giorno in cui il canone risulta
-- pagato. Si scrive con la prima firma e si conferma con la seconda.
alter table public.contestazioni add column if not exists rettifica_data date;

-- ─── I parametri del ciclo ───────────────────────────────────────────────────
create table if not exists public.parametri (
    chiave      text primary key,
    valore      numeric not null,
    descrizione text,
    aggiornato_il timestamptz not null default now()
);
alter table public.parametri enable row level security;
drop policy if exists parametri_tutti on public.parametri;
create policy parametri_tutti on public.parametri for select to authenticated using (true);

insert into public.parametri (chiave, valore, descrizione) values
    ('giorno_scadenza_canone', 5, 'Entro che giorno del mese si paga il canone'),
    ('giorni_finestra_copertura', 1, 'Giorni dopo la scadenza per segnalare senza perdere la copertura'),
    ('giorno_chiusura_mese', 11, 'Oltre questo giorno il mese si chiude: senza segnalazione è non rilevato'),
    ('giorni_contestazione', 5, 'Giorni per contestare una segnalazione di mancato pagamento'),
    ('giorni_risposta_contestazione', 5, 'Giorni entro cui CRIA risponde a una contestazione')
on conflict (chiave) do nothing;

create or replace function public.parametro(la_chiave text)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$ select valore from public.parametri where chiave = la_chiave; $$;

-- ─── Chi è cosa su un contratto ──────────────────────────────────────────────
create or replace function public.ho_posizione(il_contratto uuid, il_verso public.verso_posizione)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.posizioni p
        where p.contratto_id = il_contratto and p.verso = il_verso
          and p.persona_id = public.mia_persona() and p.al is null
    );
$$;

-- ─── Segnalare il mese ───────────────────────────────────────────────────────
create or replace function public.segnala_mese(
    il_contratto uuid, il_mese text, il_tipo text, il_giorno integer default null, la_nota text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    k public.contratti;
    pagato boolean;
    quando date := current_date;
    dentro_finestra boolean;
    in_franchigia boolean;
    copertura public.stato_copertura;
    garanzia boolean;
begin
    select * into k from public.contratti where id = il_contratto;
    if not found then
        raise exception 'Contratto non trovato' using errcode = 'P0002';
    end if;
    if not (public.e_interno() or public.ho_posizione(il_contratto, 'locatore')) then
        raise exception 'Il mese lo segnala il proprietario' using errcode = '42501';
    end if;
    if il_tipo not in ('pagato', 'non_pagato') then
        raise exception 'Si segnala pagato o non pagato' using errcode = '22023';
    end if;
    if il_mese !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
        raise exception 'Mese scritto male: %', il_mese using errcode = '22023';
    end if;
    pagato := il_tipo = 'pagato';

    -- La finestra: si segnala nel mese stesso, entro la scadenza del canone
    -- più i giorni previsti. Dopo, il mese entra comunque nello storico
    -- dell'inquilino, ma la copertura di quel mese decade.
    dentro_finestra := to_char(quando, 'YYYY-MM') <= il_mese
        or (to_char(quando, 'YYYY-MM') = il_mese
            and extract(day from quando) <= public.parametro('giorno_scadenza_canone') + public.parametro('giorni_finestra_copertura'));
    select coalesce(p.garanzia, false) into garanzia from public.prodotti p where p.codice = k.prodotto;
    in_franchigia := garanzia and k.attivo_dal is not null
                     and il_mese < to_char(k.attivo_dal + (coalesce((select franchigia_mesi from public.prodotti where codice = k.prodotto), 0) || ' months')::interval, 'YYYY-MM');

    insert into public.segnalazioni (contratto_id, mese, tipo, fonte, autore_id, il, tardiva, contestabile)
    values (il_contratto, il_mese, il_tipo::public.tipo_segnalazione,
            case when public.e_interno() then 'cria' else 'locatore' end::public.fonte_segnalazione,
            public.mia_persona(), now(), not dentro_finestra, not pagato);

    insert into public.canoni_mese (contratto_id, mese, importo_atteso, importo_ricevuto, pagato_il, giorno, stato, fonte)
    values (il_contratto, il_mese, k.canone,
            case when pagato then k.canone end,
            case when pagato then (il_mese || '-' || lpad(coalesce(il_giorno, extract(day from quando)::integer)::text, 2, '0'))::date end,
            case when pagato then coalesce(il_giorno, extract(day from quando)::integer) end,
            case when pagato then 'segnalato_pagato' else 'segnalato_non_pagato' end::public.stato_pagamento,
            case when public.e_interno() then 'cria' else 'locatore' end::public.fonte_segnalazione)
    on conflict (contratto_id, mese) do update set
        importo_ricevuto = excluded.importo_ricevuto,
        pagato_il = excluded.pagato_il,
        giorno = excluded.giorno,
        stato = excluded.stato,
        fonte = excluded.fonte,
        aggiornato_il = now();

    if garanzia then
        copertura := case
            when in_franchigia then 'in_franchigia'
            when dentro_finestra then 'attiva'
            else 'decaduta_tardiva' end;
        insert into public.coperture_mese (contratto_id, mese, stato, motivo, segnalata_il)
        values (il_contratto, il_mese, copertura, la_nota, quando)
        on conflict (contratto_id, mese) do update set stato = excluded.stato, segnalata_il = excluded.segnalata_il;
    end if;
end;
$$;

-- Quello che il sistema scrive il giorno dopo la chiusura: nessuno ha
-- segnalato, il mese è «non rilevato» e non conta per nessuno.
create or replace function public.chiudi_mesi_non_rilevati(il_mese text)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
    quanti integer := 0;
    k record;
begin
    for k in
        select c.id, c.canone from public.contratti c
        where c.stato <> 'concluso'
          and not exists (select 1 from public.segnalazioni s where s.contratto_id = c.id and s.mese = il_mese)
    loop
        insert into public.segnalazioni (contratto_id, mese, tipo, fonte, il, contestabile)
        values (k.id, il_mese, 'non_rilevato', 'automatica', now(), false);
        insert into public.canoni_mese (contratto_id, mese, importo_atteso, stato, fonte)
        values (k.id, il_mese, k.canone, 'non_rilevato', 'automatica')
        on conflict (contratto_id, mese) do update set stato = 'non_rilevato', fonte = 'automatica', aggiornato_il = now();
        insert into public.coperture_mese (contratto_id, mese, stato, motivo)
        values (k.id, il_mese, 'decaduta_mancata_segnalazione', 'Nessuna segnalazione entro la chiusura del mese')
        on conflict (contratto_id, mese) do update set stato = 'decaduta_mancata_segnalazione';
        quanti := quanti + 1;
    end loop;
    return quanti;
end;
$$;

-- ─── Contestare ──────────────────────────────────────────────────────────────
create or replace function public.apri_contestazione(il_contratto uuid, il_mese text, il_motivo text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    s public.segnalazioni;
    nuova uuid;
begin
    if not (public.e_interno() or public.ho_posizione(il_contratto, 'conduttore')) then
        raise exception 'La contestazione la apre l''inquilino' using errcode = '42501';
    end if;
    if coalesce(length(trim(il_motivo)), 0) < 5 then
        raise exception 'Serve il motivo: chi decide deve sapere cosa contesti' using errcode = '22023';
    end if;
    select * into s from public.segnalazioni
     where contratto_id = il_contratto and mese = il_mese and tipo = 'non_pagato'
     order by il desc limit 1;
    if not found then
        raise exception 'Non c''è una segnalazione di mancato pagamento per questo mese' using errcode = 'P0002';
    end if;
    if s.il::date + public.parametro('giorni_contestazione')::integer < current_date then
        raise exception 'Il tempo per contestare è scaduto' using errcode = '22023';
    end if;
    if exists (select 1 from public.contestazioni where segnalazione_id = s.id and chiusa_il is null) then
        raise exception 'Questa segnalazione è già contestata' using errcode = '23505';
    end if;

    insert into public.contestazioni (segnalazione_id, contratto_id, mese, aperta_da, motivo, stato, termine)
    values (s.id, il_contratto, il_mese, public.mia_persona(), trim(il_motivo), 'aperta',
            current_date + public.parametro('giorni_risposta_contestazione')::integer)
    returning id into nuova;

    update public.segnalazioni set contestata = true where id = s.id;
    update public.canoni_mese set stato = 'contestato', aggiornato_il = now()
     where contratto_id = il_contratto and mese = il_mese;

    insert into public.contestazioni_messaggi (contestazione_id, autore_id, testo)
    values (nuova, public.mia_persona(), trim(il_motivo));
    return nuova;
end;
$$;

create or replace function public.scrivi_su_contestazione(la_contestazione uuid, il_testo text, l_interno boolean default false)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
    nuovo uuid;
    k public.contestazioni;
begin
    select * into k from public.contestazioni where id = la_contestazione;
    if not found then
        raise exception 'Contestazione non trovata' using errcode = 'P0002';
    end if;
    if not (public.e_interno()
            or public.ho_posizione(k.contratto_id, 'conduttore')
            or public.ho_posizione(k.contratto_id, 'locatore')) then
        raise exception 'Questa contestazione non ti riguarda' using errcode = '42501';
    end if;
    insert into public.contestazioni_messaggi (contestazione_id, autore_id, interno, testo)
    values (la_contestazione, public.mia_persona(), l_interno and public.e_interno(), trim(il_testo))
    returning id into nuovo;
    update public.contestazioni set aggiornato_il = now() where id = la_contestazione;
    return nuovo;
end;
$$;

-- ─── Decidere ────────────────────────────────────────────────────────────────
-- «respinta» chiude e basta. «accolta» rettifica il mese, e la rettifica vuole
-- due firme diverse: qui si mette la prima.
create or replace function public.decidi_contestazione(
    la_contestazione uuid, l_esito text, la_nota text, il_giorno_pagamento date default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    k public.contestazioni;
begin
    if not (public.e_admin() or public.ha_funzione('assistenza') or public.ha_funzione('responsabile_operativo')) then
        raise exception 'La contestazione la decide l''assistenza' using errcode = '42501';
    end if;
    select * into k from public.contestazioni where id = la_contestazione;
    if not found or k.chiusa_il is not null then
        raise exception 'Contestazione non trovata o già chiusa' using errcode = 'P0002';
    end if;
    if l_esito not in ('accolta', 'respinta') then
        raise exception 'Si accoglie o si respinge' using errcode = '22023';
    end if;
    if coalesce(length(trim(la_nota)), 0) < 5 then
        raise exception 'Serve la motivazione: la legge chi l''ha aperta' using errcode = '22023';
    end if;

    if l_esito = 'respinta' then
        update public.contestazioni
           set stato = 'risolta_favore_locatore', esito = trim(la_nota),
               chiusa_da = public.mia_persona(), chiusa_il = now()
         where id = la_contestazione;
        update public.canoni_mese set stato = 'insoluto', aggiornato_il = now()
         where contratto_id = k.contratto_id and mese = k.mese;
    else
        -- Prima firma: la rettifica resta in attesa della seconda.
        if il_giorno_pagamento is null then
            raise exception 'Serve il giorno in cui il canone risulta pagato' using errcode = '22023';
        end if;
        update public.contestazioni
           set stato = 'in_verifica', esito = trim(la_nota), rettifica = true,
               rettifica_data = il_giorno_pagamento,
               prima_firma_da = public.mia_persona(), prima_firma_il = now(),
               seconda_firma_entro = current_date + 2,
               aggiornato_il = now()
         where id = la_contestazione;
        -- Il giorno del pagamento dichiarato si tiene da parte fino alla conferma.
        insert into public.contestazioni_messaggi (contestazione_id, autore_id, interno, testo)
        values (la_contestazione, public.mia_persona(), true,
                'Rettifica proposta: il mese conta come pagato il ' || coalesce(il_giorno_pagamento::text, '—') || '. In attesa della seconda firma.');
    end if;
end;
$$;

-- La seconda firma: un'altra persona conferma, e solo allora il mese cambia.
create or replace function public.conferma_rettifica(la_contestazione uuid, il_giorno_pagamento date default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    k public.contestazioni;
begin
    if not (public.e_admin() or public.ha_funzione('assistenza') or public.ha_funzione('responsabile_operativo')) then
        raise exception 'La seconda firma la mette l''assistenza' using errcode = '42501';
    end if;
    select * into k from public.contestazioni where id = la_contestazione;
    if not found or not k.rettifica or k.chiusa_il is not null then
        raise exception 'Non c''è una rettifica da confermare' using errcode = 'P0002';
    end if;
    if k.prima_firma_da = public.mia_persona() then
        raise exception 'La seconda firma la mette una persona diversa dalla prima' using errcode = '42501';
    end if;
    -- Si conferma la data proposta con la prima firma, non un'altra.
    il_giorno_pagamento := coalesce(k.rettifica_data, il_giorno_pagamento);
    if il_giorno_pagamento is null then
        raise exception 'Manca il giorno del pagamento' using errcode = '22023';
    end if;

    update public.contestazioni
       set stato = 'risolta_favore_inquilino',
           seconda_firma_da = public.mia_persona(), seconda_firma_il = now(),
           chiusa_da = public.mia_persona(), chiusa_il = now()
     where id = la_contestazione;

    update public.canoni_mese
       set stato = 'verificato',
           pagato_il = il_giorno_pagamento,
           giorno = extract(day from il_giorno_pagamento)::integer,
           importo_ricevuto = importo_atteso,
           rettificato_il = now(), rettificato_da = public.mia_persona(), aggiornato_il = now()
     where contratto_id = k.contratto_id and mese = k.mese;
end;
$$;

-- ─── Leggere le contestazioni ────────────────────────────────────────────────
create or replace function public.contestazioni_visibili()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(jsonb_agg(jsonb_build_object(
        'id', k.id,
        'contrattoId', coalesce(c.codice_demo, c.id::text),
        'contrattoDb', c.id,
        'mese', k.mese,
        'segnalazione', (select jsonb_build_object('tipo', s.tipo, 'il', s.il::date)
                           from public.segnalazioni s where s.id = k.segnalazione_id),
        'apertaIl', k.aperta_il::date,
        'apertaDa', (select public.nome_persona(p) from public.persone p where p.id = k.aperta_da),
        'rispostaEntro', k.termine,
        'stato', k.stato,
        'motivo', k.motivo,
        'esito', k.esito,
        'chiusaIl', k.chiusa_il::date,
        'rettifica', k.rettifica,
        'rettificaData', k.rettifica_data,
        'primaFirmaDa', (select public.nome_persona(p) from public.persone p where p.id = k.prima_firma_da),
        'secondaFirmaDa', (select public.nome_persona(p) from public.persone p where p.id = k.seconda_firma_da),
        'secondaFirmaEntro', k.seconda_firma_entro,
        'assegnataA', (select public.id_con_account(p) from public.persone p where p.id = k.assegnata_a),
        'messaggi', (
            select coalesce(jsonb_agg(jsonb_build_object(
                'id', m.id, 'testo', m.testo, 'il', m.il, 'interno', m.interno,
                'autore', coalesce((select public.nome_persona(p) from public.persone p where p.id = m.autore_id), 'CRIA')
            ) order by m.il), '[]'::jsonb)
            from public.contestazioni_messaggi m
            where m.contestazione_id = k.id and (public.e_interno() or not m.interno)
        )
    ) order by k.aperta_il desc), '[]'::jsonb)
    from public.contestazioni k
    join public.contratti c on c.id = k.contratto_id
    where public.e_interno()
       or exists (select 1 from public.posizioni p
                   where p.contratto_id = k.contratto_id and p.persona_id = public.mia_persona() and p.al is null);
$$;

revoke all on function public.segnala_mese(uuid, text, text, integer, text) from public, anon;
grant execute on function public.segnala_mese(uuid, text, text, integer, text) to authenticated;
revoke all on function public.apri_contestazione(uuid, text, text) from public, anon;
grant execute on function public.apri_contestazione(uuid, text, text) to authenticated;
revoke all on function public.scrivi_su_contestazione(uuid, text, boolean) from public, anon;
grant execute on function public.scrivi_su_contestazione(uuid, text, boolean) to authenticated;
revoke all on function public.decidi_contestazione(uuid, text, text, date) from public, anon;
grant execute on function public.decidi_contestazione(uuid, text, text, date) to authenticated;
revoke all on function public.conferma_rettifica(uuid, date) from public, anon;
grant execute on function public.conferma_rettifica(uuid, date) to authenticated;
revoke all on function public.contestazioni_visibili() from public, anon;
grant execute on function public.contestazioni_visibili() to authenticated;
revoke all on function public.ho_posizione(uuid, public.verso_posizione) from public, anon;
grant execute on function public.ho_posizione(uuid, public.verso_posizione) to authenticated;
revoke all on function public.chiudi_mesi_non_rilevati(text) from public, anon, authenticated;
