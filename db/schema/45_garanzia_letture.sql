-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 45_garanzia_letture.sql                                          ║
-- ║  Le colonne che mancavano all'area garanzia e come si legge.             ║
-- ║  Si esegue dopo 44_pratiche.sql.                                         ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Come per le pratiche: in colonna quello che serve alle regole, in `dati`
-- quello che per ora si mostra soltanto (la richiesta al legale, le note di
-- istruttoria). La logica che calcola fasi, termini e stato delle rate resta
-- nel codice: è una regola di business, non un modo di conservare i dati.

alter table public.pratiche_morosita add column if not exists dati jsonb;
alter table public.pratiche_morosita add column if not exists di_prova boolean not null default false;
alter table public.pratiche_morosita add column if not exists mesi text[];
alter table public.pratiche_morosita add column if not exists assegnata_il date;

alter table public.indennizzi add column if not exists nota_istruttoria text;
alter table public.indennizzi add column if not exists eseguito_da uuid references public.persone (id) on delete set null;
alter table public.indennizzi add column if not exists eseguito_il date;
alter table public.indennizzi add column if not exists mese_riferimento text;

alter table public.piani_rientro add column if not exists nota text;
alter table public.piani_rientro add column if not exists accettato_il date;
alter table public.piani_rientro add column if not exists sostituito_il date;
alter table public.piani_rientro add column if not exists respinto_da uuid references public.persone (id) on delete set null;

-- ─── Leggere l'area garanzia ─────────────────────────────────────────────────
-- Le pratiche di morosità con dentro contatti, note, piano e rate, e gli
-- indennizzi con le tre firme. Chi lavora dentro CRIA le vede tutte; il
-- proprietario e l'inquilino quelle dei loro contratti.
create or replace function public.garanzia_visibile()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
    with viste as (
        select m.*, c.codice_demo as contratto_codice
        from public.pratiche_morosita m
        join public.contratti c on c.id = m.contratto_id
        where public.e_interno()
           or exists (select 1 from public.posizioni p
                       where p.contratto_id = m.contratto_id and p.persona_id = public.mia_persona() and p.al is null)
    )
    select jsonb_build_object(
        'pratiche', (
            select coalesce(jsonb_agg(
                coalesce(m.dati, '{}'::jsonb) || jsonb_build_object(
                    'id', coalesce(m.codice, m.id::text),
                    'morositaDb', m.id,
                    'contrattoId', coalesce(m.contratto_codice, m.contratto_id::text),
                    'mesi', coalesce(to_jsonb(m.mesi), '[]'::jsonb),
                    'importo', m.importo,
                    'apertaIl', m.aperta_il,
                    'chiusaIl', m.chiusa_il,
                    'esito', m.esito,
                    'gestoreId', (select public.id_con_account(p) from public.persone p where p.id = m.gestore_id),
                    'assegnataIl', m.assegnata_il,
                    'primoContattoIl', m.primo_contatto_il,
                    'note', public.note_interne_di('morosita', m.id),
                    'contatti', (
                        select coalesce(jsonb_agg(jsonb_build_object(
                            'id', t.id, 'il', t.il::date, 'ora', to_char(t.il, 'HH24:MI'),
                            'canale', t.canale, 'esito', t.esito, 'nota', t.nota,
                            'registratoDa', (select public.id_con_account(p) from public.persone p where p.id = t.da_persona)
                        ) order by t.il), '[]'::jsonb)
                        from public.contatti_morosita t where t.morosita_id = m.id
                    ),
                    'piani', (
                        select coalesce(jsonb_agg(jsonb_build_object(
                            'id', pi.id, 'propostoDa', (select public.id_con_account(p) from public.persone p where p.id = pi.proposto_da),
                            'propostoIl', pi.proposto_il::date, 'nota', pi.nota,
                            'approvatoDa', (select public.id_con_account(p) from public.persone p where p.id = pi.approvato_da),
                            'approvatoIl', pi.approvato_il::date,
                            'respintoIl', pi.respinto_il::date, 'accettatoIl', pi.accettato_il, 'sostituitoIl', pi.sostituito_il,
                            'motivoRespinta', pi.motivo,
                            'rate', (select coalesce(jsonb_agg(jsonb_build_object(
                                        'n', r.numero, 'scadenza', r.scadenza, 'importo', r.importo, 'pagataIl', r.pagata_il
                                     ) order by r.numero), '[]'::jsonb)
                                     from public.rate_rientro r where r.piano_id = pi.id)
                        ) order by pi.proposto_il), '[]'::jsonb)
                        from public.piani_rientro pi where pi.morosita_id = m.id
                    )
                ) order by m.aperta_il desc), '[]'::jsonb)
            from viste m
        ),
        'indennizzi', (
            select coalesce(jsonb_agg(jsonb_build_object(
                'id', i.id,
                'praticaId', (select coalesce(m2.codice, m2.id::text) from public.pratiche_morosita m2 where m2.id = i.morosita_id),
                'contrattoId', (select coalesce(c2.codice_demo, c2.id::text)
                                  from public.pratiche_morosita m3 join public.contratti c2 on c2.id = m3.contratto_id
                                 where m3.id = i.morosita_id),
                'mese', i.mese,
                'importo', i.importo,
                'stato', i.stato,
                'notaIstruttoria', i.nota_istruttoria,
                'dispostoDa', (select public.id_con_account(p) from public.persone p where p.id = i.disposto_da),
                'dispostoIl', i.disposto_il::date,
                'autorizzatoDa', (select public.id_con_account(p) from public.persone p where p.id = i.autorizzato_da),
                'autorizzatoIl', i.autorizzato_il::date,
                'eseguitoDa', (select public.id_con_account(p) from public.persone p where p.id = i.eseguito_da),
                'eseguitoIl', i.eseguito_il,
                'riferimento', i.riferimento
            ) order by i.creato_il), '[]'::jsonb)
            from public.indennizzi i
            where i.morosita_id in (select id from viste)
        )
    );
$$;

revoke all on function public.garanzia_visibile() from public, anon;
grant execute on function public.garanzia_visibile() to authenticated;
