-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 21_permessi_contenuti.sql                                        ║
-- ║  Chi cambia i contenuti del sito oltre all'admin. Si esegue dopo         ║
-- ║  10_contenuti_sito.sql e 20_persone.sql.                                 ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Testi e FAQ: solo l'admin (decisione del titolare, 19 settembre).
-- Prodotti (documento 'prodotti'): l'admin e il responsabile prodotto, come
-- nella regola «modifica_listino» del back office.

-- Ha questa funzione interna chi sta agendo?
create or replace function public.ha_funzione(la_funzione text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.ruoli r
        where r.persona_id = public.mia_persona() and r.ruolo = 'interno' and r.funzione = la_funzione
    );
$$;

revoke all on function public.ha_funzione(text) from public, anon;
grant execute on function public.ha_funzione(text) to authenticated;

-- Chi può cambiare un documento del sito.
create or replace function public.puo_cambiare_documento(la_chiave text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select public.e_admin() or (la_chiave = 'prodotti' and public.ha_funzione('resp_prodotto'));
$$;

revoke all on function public.puo_cambiare_documento(text) from public, anon;
grant execute on function public.puo_cambiare_documento(text) to authenticated;

-- Chi legge la tabella (registro compreso): chi può cambiare quel documento.
drop policy if exists documenti_sito_admin on public.documenti_sito;
create policy documenti_sito_admin on public.documenti_sito
    for select to authenticated
    using ((select public.puo_cambiare_documento(chiave)));

-- Il salvataggio, con la stessa regola.
create or replace function public.salva_documento_sito(la_chiave text, il_contenuto jsonb, versione_letta integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
    attuale integer;
begin
    if not public.puo_cambiare_documento(la_chiave) then
        raise exception 'Questi contenuti li cambia l''admin' using errcode = '42501';
    end if;
    select versione into attuale from public.documenti_sito where chiave = la_chiave for update;
    if attuale is null then
        insert into public.documenti_sito (chiave, contenuto, versione, aggiornato_di)
        values (la_chiave, il_contenuto, 1, public.email_attore());
        return 1;
    end if;
    if versione_letta is distinct from attuale then
        raise exception 'Il documento è cambiato nel frattempo: ricarica e riprova' using errcode = '40001';
    end if;
    update public.documenti_sito
       set contenuto = il_contenuto, versione = attuale + 1,
           aggiornato_il = now(), aggiornato_di = public.email_attore()
     where chiave = la_chiave;
    return attuale + 1;
end;
$$;

revoke all on function public.salva_documento_sito(text, jsonb, integer) from public, anon;
grant execute on function public.salva_documento_sito(text, jsonb, integer) to authenticated;
