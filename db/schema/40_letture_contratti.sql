-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 40_letture_contratti.sql                                         ║
-- ║  Come le pagine leggono i contratti: una funzione sola che dà a          ║
-- ║  ciascuno quello che gli spetta. Si esegue dopo 33_garanzia.sql.         ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- CHI VEDE COSA
--   chi lavora dentro CRIA   tutti i contratti, con i recapiti
--   proprietario, inquilino  i contratti su cui ha una posizione, o dove è
--                            titolare dell'immobile; della controparte legge
--                            il nome, non i recapiti
--   chiunque altro           niente
--
-- Perché una funzione e non le tabelle aperte: sulle tabelle si può decidere
-- QUALI righe si leggono, non QUALI colonne. L'inquilino deve sapere chi è il
-- proprietario, non il suo cellulare. Qui la differenza si scrive in chiaro.
--
-- La forma del risultato è quella che le pagine già usano (mesi, segnalazione,
-- copertura, posizioni): così il frontend cambia fonte senza cambiare
-- schermate. `id` resta il codice dei dati di prova finché ci sono.

-- Il nome che si mostra: la ragione sociale per le società, nome e cognome per
-- le persone.
create or replace function public.nome_persona(p public.persone)
returns text
language sql
immutable
set search_path = ''
as $$
    select coalesce(nullif(p.ragione_sociale, ''), trim(coalesce(p.nome, '') || ' ' || coalesce(p.cognome, '')));
$$;

-- Il codice della persona vale come identificativo solo se ha un account: le
-- controparti senza account restano senza, come nei dati di prova.
create or replace function public.id_con_account(p public.persone)
returns text
language sql
immutable
set search_path = ''
as $$
    select case when p.utente_id is null then null else coalesce(p.codice_demo, p.id::text) end;
$$;

-- Una parte del contratto: il nome sempre, i recapiti solo a chi lavora
-- dentro CRIA.
create or replace function public.parte_del_contratto(il_contratto uuid, il_verso public.verso_posizione)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select jsonb_build_object(
        'personaId', public.id_con_account(pe),
        'soggettoId', pe.codice_demo,
        'nome', public.nome_persona(pe),
        'email', case when public.e_interno() then pe.email end,
        'telefono', case when public.e_interno() then pe.telefono end
    )
    from public.posizioni p join public.persone pe on pe.id = p.persona_id
    where p.contratto_id = il_contratto and p.verso = il_verso and p.al is null
    order by p.dal desc
    limit 1;
$$;

-- I mesi del canone, con la segnalazione e la copertura di quel mese.
-- Gli stati tornano con le parole che usano le pagine.
create or replace function public.mesi_del_contratto(il_contratto uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(jsonb_agg(jsonb_build_object(
        'mese', c.mese,
        'scadenza', c.mese || '-01',
        'canone', c.importo_atteso,
        'stato', case c.stato
            when 'verificato' then 'pagato'
            when 'confermato' then 'pagato'
            when 'segnalato_pagato' then 'pagato'
            when 'segnalato_non_pagato' then 'in_attesa'
            when 'contestato' then 'contestato'
            when 'insoluto' then 'insoluto'
            when 'non_rilevato' then 'non_rilevato'
            else 'atteso' end,
        'giorno', c.giorno,
        'pagatoIl', c.pagato_il,
        'bonificoIl', c.girato_il,
        'contestazioneId', null,
        'segnalazione', (
            select jsonb_build_object(
                'tipo', s.tipo,
                'il', s.il::date,
                'fonte', case s.fonte when 'locatore' then 'proprietario' else s.fonte::text end
            )
            from public.segnalazioni s
            where s.contratto_id = c.contratto_id and s.mese = c.mese
            order by s.il desc limit 1
        ),
        'copertura', (
            select co.stato from public.coperture_mese co
            where co.contratto_id = c.contratto_id and co.mese = c.mese
        )
    ) order by c.mese), '[]'::jsonb)
    from public.canoni_mese c
    where c.contratto_id = il_contratto;
$$;


create or replace function public.contratti_visibili()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    select coalesce(jsonb_agg(riga order by riga->>'inizio'), '[]'::jsonb)
    from (
        select jsonb_build_object(
            'id', coalesce(k.codice_demo, k.id::text),
            'contrattoDb', k.id,
            'codiceUnivoco', k.codice,
            'prodotto', k.prodotto,
            'canone', k.canone,
            'deposito', k.deposito,
            'inizio', k.data_inizio,
            'fine', k.data_fine,
            'durata', k.durata_testo,
            'attivoDal', to_char(k.attivo_dal, 'YYYY-MM'),
            'stato', k.stato,
            'registrazione', case when k.registrazione_numero is null then null else jsonb_build_object(
                'numero', k.registrazione_numero, 'data', k.registrazione_data, 'ufficio', k.registrazione_ufficio
            ) end,
            'storicoInquilini', coalesce(k.storico_inquilini, '[]'::jsonb),
            'immobile', jsonb_build_object(
                'id', coalesce(i.codice_demo, i.id::text), 'immobileDb', i.id, 'codice', i.codice,
                'indirizzo', i.indirizzo, 'cap', i.cap, 'citta', i.citta, 'provincia', i.provincia,
                'lat', i.latitudine, 'lng', i.longitudine, 'tipologia', i.tipologia, 'mq', i.mq,
                'catasto', i.catastale->>'descrizione'
            ),
            'locatore', public.parte_del_contratto(k.id, 'locatore'),
            'conduttore', public.parte_del_contratto(k.id, 'conduttore'),
            'posizioni', (
                select coalesce(jsonb_agg(jsonb_build_object(
                    'verso', p.verso, 'personaId', public.id_con_account(pe), 'soggettoId', pe.codice_demo,
                    'nome', public.nome_persona(pe), 'dal', p.dal, 'al', p.al
                ) order by p.verso), '[]'::jsonb)
                from public.posizioni p join public.persone pe on pe.id = p.persona_id
                where p.contratto_id = k.id
            ),
            'mesi', public.mesi_del_contratto(k.id)
        ) as riga
        from public.contratti k
        join public.immobili i on i.id = k.immobile_id
        where public.e_interno()
           or exists (select 1 from public.posizioni p
                       where p.contratto_id = k.id and p.persona_id = public.mia_persona())
           or exists (select 1 from public.titolarita t
                       where t.immobile_id = k.immobile_id and t.persona_id = public.mia_persona() and t.al is null)
    ) x;
$$;

revoke all on function public.contratti_visibili() from public, anon;
grant execute on function public.contratti_visibili() to authenticated;
revoke all on function public.parte_del_contratto(uuid, public.verso_posizione) from public, anon;
grant execute on function public.parte_del_contratto(uuid, public.verso_posizione) to authenticated;
revoke all on function public.mesi_del_contratto(uuid) from public, anon;
grant execute on function public.mesi_del_contratto(uuid) to authenticated;
