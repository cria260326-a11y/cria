-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 47_verifiche_certificati.sql                                     ║
-- ║  CRIA Verifica, autocandidature e certificati: come si leggono e come    ║
-- ║  si scrivono. Si esegue dopo 46_garanzia_azioni.sql.                     ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Stessa impostazione delle pratiche: in colonna quello che serve alle regole
-- (chi, quando, che stato, il credito), in `dati` il resto — l'esito con la
-- sua sintesi, le prove portate dall'inquilino, le letture del certificato.
--
-- CHI VEDE: il cliente le sue, chi lavora dentro CRIA tutte. Il certificato è
-- diverso: si verifica dal codice pubblico, senza account, ma quello che si
-- legge è solo il semaforo e il periodo — mai i dati della persona.

alter table public.richieste_verifica add column if not exists dati jsonb;
alter table public.richieste_verifica add column if not exists di_prova boolean not null default false;
alter table public.autocandidature add column if not exists dati jsonb;
alter table public.autocandidature add column if not exists di_prova boolean not null default false;
alter table public.certificati add column if not exists dati jsonb;
alter table public.certificati add column if not exists di_prova boolean not null default false;
alter table public.certificati add column if not exists periodo_dal text;
alter table public.certificati add column if not exists periodo_al text;

-- ─── CRIA Verifica ───────────────────────────────────────────────────────────
create or replace function public.verifiche_visibili()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(jsonb_agg(
        coalesce(v.dati, '{}'::jsonb) || jsonb_build_object(
            'id', coalesce(v.codice, v.id::text),
            'verificaDb', v.id,
            'personaId', public.id_con_account(pe),
            'richiestaIl', v.richiesta_il::date,
            'stato', v.stato,
            'soggetto', jsonb_build_object(
                'nome', v.soggetto_nome, 'cognome', v.soggetto_cognome,
                'codiceFiscale', v.soggetto_cf, 'dataNascita', v.soggetto_nascita, 'luogoNascita', v.soggetto_luogo
            ),
            'credito', case when v.credito_importo is null then null else jsonb_build_object(
                'importo', v.credito_importo, 'scadeIl', v.credito_scade_il, 'usatoIl', v.credito_usato_il
            ) end
        ) order by v.richiesta_il desc), '[]'::jsonb)
    from public.richieste_verifica v
    left join public.persone pe on pe.id = v.cliente_id
    where public.e_interno() or v.cliente_id = public.mia_persona();
$$;

create or replace function public.chiedi_verifica(i_dati jsonb)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
    nuova uuid;
    codice text;
    prezzo numeric;
    giorni integer;
begin
    if public.mia_persona() is null then
        raise exception 'Serve l''accesso' using errcode = '42501';
    end if;
    select prezzo into prezzo from public.prodotti where codice = 'P3';
    giorni := 30;
    codice := 'VER-' || to_char(now(), 'YYYYMMDD') || '-' || lpad((
        select (count(*) + 1)::text from public.richieste_verifica where richiesta_il::date = current_date
    ), 3, '0');

    insert into public.richieste_verifica (
        codice, cliente_id, soggetto_nome, soggetto_cognome, soggetto_cf, soggetto_nascita, soggetto_luogo,
        consenso, stato, credito_importo, credito_scade_il, dati
    ) values (
        codice, public.mia_persona(),
        i_dati->'soggetto'->>'nome', i_dati->'soggetto'->>'cognome', i_dati->'soggetto'->>'codiceFiscale',
        nullif(i_dati->'soggetto'->>'dataNascita', '')::date, i_dati->'soggetto'->>'luogoNascita',
        coalesce((i_dati->>'consenso')::boolean, true), 'in_corso',
        prezzo, current_date + giorni,
        i_dati - 'soggetto' - 'id' - 'personaId' - 'stato'
    ) returning id into nuova;
    return codice;
end;
$$;

-- L'esito lo mette l'istruttoria: semaforo e sintesi, oppure «non abbiamo
-- informazioni». I dati del soggetto non escono mai: esce un giudizio.
create or replace function public.esita_verifica(la_verifica uuid, l_esito jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if not (public.e_admin() or public.ha_funzione('istruttoria')) then
        raise exception 'L''esito lo mette l''istruttoria' using errcode = '42501';
    end if;
    update public.richieste_verifica
       set stato = 'evasa',
           esito = case when l_esito->>'semaforo' is null then 'nessun_dato' else (l_esito->>'semaforo') end::public.esito_verifica,
           evasa_da = public.mia_persona(), evasa_il = now(),
           dati = coalesce(dati, '{}'::jsonb) || jsonb_build_object('esito', l_esito)
     where id = la_verifica and stato = 'in_corso';
    if not found then
        raise exception 'Questa verifica non è in corso' using errcode = 'P0002';
    end if;
end;
$$;

-- ─── Autocandidature ─────────────────────────────────────────────────────────
create or replace function public.autocandidature_visibili()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(jsonb_agg(
        coalesce(a.dati, '{}'::jsonb) || jsonb_build_object(
            'id', coalesce(a.codice, a.id::text),
            'autocandidaturaDb', a.id,
            'personaId', public.id_con_account(pe),
            'apertaIl', a.aperta_il::date,
            'stato', a.stato,
            'referenze', public.referenze_dell_autocandidatura(a.id)
        ) order by a.aperta_il desc), '[]'::jsonb)
    from public.autocandidature a
    left join public.persone pe on pe.id = a.persona_id
    where public.e_interno() or a.persona_id = public.mia_persona();
$$;

-- ─── Certificati ─────────────────────────────────────────────────────────────
create or replace function public.certificati_visibili()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(jsonb_agg(
        coalesce(c.dati, '{}'::jsonb) || jsonb_build_object(
            'id', coalesce(c.numero, c.id::text),
            'certificatoDb', c.id,
            'personaId', public.id_con_account(pe),
            'codice', c.codice_pubblico,
            'emessoIl', c.emesso_il::date,
            'periodo', jsonb_build_object('dal', c.periodo_dal, 'al', c.periodo_al),
            'fonte', c.fonte,
            'revocatoIl', c.revocato_il::date
        ) order by c.emesso_il desc), '[]'::jsonb)
    from public.certificati c
    left join public.persone pe on pe.id = c.persona_id
    where public.e_interno() or c.persona_id = public.mia_persona();
$$;

-- Il controllo pubblico del certificato: si entra col codice, senza account,
-- e si legge solo quello che il certificato dichiara. Nessun dato personale.
create or replace function public.certificato_dal_codice(il_codice text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select case when c.id is null then null else jsonb_build_object(
        'codice', c.codice_pubblico,
        'emessoIl', c.emesso_il::date,
        'periodo', jsonb_build_object('dal', c.periodo_dal, 'al', c.periodo_al),
        'semaforo', c.semaforo,
        'ambito', c.ambito,
        'fonte', c.fonte,
        'revocatoIl', c.revocato_il::date,
        'iniziali', left(coalesce(p.nome, ''), 1) || '. ' || left(coalesce(p.cognome, ''), 1) || '.'
    ) end
    from public.certificati c
    left join public.persone p on p.id = c.persona_id
    where upper(replace(c.codice_pubblico, '-', '')) = upper(replace(il_codice, '-', ''));
$$;

revoke all on function public.verifiche_visibili() from public, anon;
grant execute on function public.verifiche_visibili() to authenticated;
revoke all on function public.chiedi_verifica(jsonb) from public, anon;
grant execute on function public.chiedi_verifica(jsonb) to authenticated;
revoke all on function public.esita_verifica(uuid, jsonb) from public, anon;
grant execute on function public.esita_verifica(uuid, jsonb) to authenticated;
revoke all on function public.autocandidature_visibili() from public, anon;
grant execute on function public.autocandidature_visibili() to authenticated;
revoke all on function public.certificati_visibili() from public, anon;
grant execute on function public.certificati_visibili() to authenticated;
-- Questo sì, anche senza account: è il controllo pubblico del certificato.
grant execute on function public.certificato_dal_codice(text) to anon, authenticated;
