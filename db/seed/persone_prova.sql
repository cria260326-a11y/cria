-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — seed/persone_prova.sql                                           ║
-- ║  Le persone inventate per provare la piattaforma, una per ruolo, con     ║
-- ║  il loro account. La password si passa quando si esegue il file:         ║
-- ║  psql ... -v password_prova=«quella che scegli» -f persone_prova.sql     ║
-- ║  Si esegue dopo db/schema/20_persone.sql. Si può rieseguire: non         ║
-- ║  duplica niente e non cambia la password di chi c'è già.                 ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- codice_demo è il nome con cui la persona compare nei dati di prova ancora
-- nel codice (contratti, pratiche, pagamenti) e in «Operi come» di prima.

-- ─── Gli account dei colleghi interni ────────────────────────────────────────
-- I clienti, l'avvocato, la commerciale e l'admin hanno già il loro account.
do $$
declare
    v record;
    v_id uuid;
begin
    for v in select * from (values
        ('luca.moretti@cri-affitti.it', 'Luca Moretti'),
        ('valeria.monti@cri-affitti.it', 'Valeria Monti'),
        ('ettore.marini@cri-affitti.it', 'Ettore Marini'),
        ('irene.caputo@cri-affitti.it', 'Irene Caputo'),
        ('nicola.pace@cri-affitti.it', 'Nicola Pace'),
        ('giorgio.fontana@cri-affitti.it', 'Giorgio Fontana'),
        ('beatrice.mancini@cri-affitti.it', 'Beatrice Mancini'),
        ('alberto.longo@cri-affitti.it', 'Alberto Longo'),
        ('silvia.barbieri@cri-affitti.it', 'Silvia Barbieri'),
        ('laura.testa@cri-affitti.it', 'Laura Testa'),
        ('matteo.sala@cri-affitti.it', 'Matteo Sala'),
        ('federica.villa@cri-affitti.it', 'Federica Villa'),
        ('tommaso.pellegrini@cri-affitti.it', 'Tommaso Pellegrini')
    ) as t(email, nome)
    loop
        continue when exists (select 1 from auth.users u where u.email = v.email);
        v_id := gen_random_uuid();
        insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
            confirmation_token, recovery_token, email_change_token_new, email_change,
            email_change_token_current, phone_change, phone_change_token, reauthentication_token,
            is_sso_user, is_anonymous)
        values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v.email,
            extensions.crypt(:'password_prova', extensions.gen_salt('bf', 10)), now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('nome', v.nome, 'account_demo', true), now(), now(),
            '', '', '', '', '', '', '', '', false, false);
        insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        values (gen_random_uuid(), v_id::text, v_id,
            jsonb_build_object('sub', v_id::text, 'email', v.email, 'email_verified', true, 'phone_verified', false),
            'email', now(), now(), now());
    end loop;
end $$;

-- ─── Le persone ──────────────────────────────────────────────────────────────
insert into public.persone (codice_demo, tipo, nome, cognome, ragione_sociale, partita_iva, codice_fiscale,
                            data_nascita, email, telefono, fatturazione, stato_identita)
values
    ('admin', 'fisica', 'Amministratore', 'CRIA', null, null, null, null, 'admin@cri-affitti.it', null, null, 'verificato'),
    ('mario', 'fisica', 'Mario', 'Rossi', null, null, 'RSSMRA80A01F205X', '1980-01-01', 'proprietario@cri-affitti.it', '+39 333 1234567',
        '{"intestatario":"Mario Rossi","codiceFiscale":"RSSMRA80A01F205X","paese":"Italia","indirizzo":"Via Verdi 3","cap":"20121","citta":"Milano","provincia":"MI"}', 'verificato'),
    ('giulia', 'fisica', 'Giulia', 'Ferri', null, null, 'FRRGLI92D45F205W', '1992-04-05', 'inquilino@cri-affitti.it', '+39 347 5550192', null, 'verificato'),
    ('verdi', 'giuridica', 'Laura', 'Verdi', 'Immobiliare Verdi S.r.l.', '10293847561', '10293847561', null, 'societa@cri-affitti.it', '+39 02 87654321',
        '{"intestatario":"Immobiliare Verdi S.r.l.","partitaIva":"10293847561","codiceFiscale":"10293847561","sdi":"M5UXCR1","pec":"","indirizzo":"Corso Venezia 40","cap":"20121","citta":"Milano","provincia":"MI"}', 'verificato'),
    ('martina', 'fisica', 'Martina', 'Galli', null, null, 'GLLMTN93S52F205I', '1993-11-12', 'morosita@cri-affitti.it', '+39 351 6677889', null, 'verificato'),
    ('anna', 'fisica', 'Anna', 'Conti', null, null, 'CNTNNA95E50H501W', null, 'nonverificato@cri-affitti.it', '+39 340 7771234', null, 'non_caricato'),
    ('elena', 'fisica', 'Elena', 'Greco', null, null, 'GRCLNE88C41F839A', '1988-03-01', 'cliente@cri-affitti.it', '+39 339 2468135',
        '{"intestatario":"Elena Greco","codiceFiscale":"GRCLNE88C41F839A","paese":"Italia","indirizzo":"Via Chiaia 118","cap":"80132","citta":"Napoli","provincia":"NA"}', 'verificato'),
    ('sara', 'fisica', 'Sara', 'Esposito', null, null, 'SPSSRA90H50F839B', null, 'commerciale@cri-affitti.it', '+39 331 9087766', null, 'verificato'),
    ('paolo', 'fisica', 'Paolo', 'Galli', null, null, 'GLLPLA75B12F205W', null, 'avvocato@cri-affitti.it', '+39 02 55512345', null, 'verificato'),
    ('luca', 'fisica', 'Luca', 'Moretti', null, null, null, null, 'luca.moretti@cri-affitti.it', null, null, 'verificato'),
    ('valeria', 'fisica', 'Valeria', 'Monti', null, null, null, null, 'valeria.monti@cri-affitti.it', null, null, 'verificato'),
    ('ettore', 'fisica', 'Ettore', 'Marini', null, null, null, null, 'ettore.marini@cri-affitti.it', null, null, 'verificato'),
    ('irene', 'fisica', 'Irene', 'Caputo', null, null, null, null, 'irene.caputo@cri-affitti.it', null, null, 'verificato'),
    ('nicola', 'fisica', 'Nicola', 'Pace', null, null, null, null, 'nicola.pace@cri-affitti.it', null, null, 'verificato'),
    ('giorgio', 'fisica', 'Giorgio', 'Fontana', null, null, null, null, 'giorgio.fontana@cri-affitti.it', null, null, 'verificato'),
    ('beatrice', 'fisica', 'Beatrice', 'Mancini', null, null, null, null, 'beatrice.mancini@cri-affitti.it', null, null, 'verificato'),
    ('alberto', 'fisica', 'Alberto', 'Longo', null, null, null, null, 'alberto.longo@cri-affitti.it', null, null, 'verificato'),
    ('silvia', 'fisica', 'Silvia', 'Barbieri', null, null, null, null, 'silvia.barbieri@cri-affitti.it', null, null, 'verificato'),
    ('laura', 'fisica', 'Laura', 'Testa', null, null, null, null, 'laura.testa@cri-affitti.it', null, null, 'verificato'),
    ('matteo', 'fisica', 'Matteo', 'Sala', null, null, null, null, 'matteo.sala@cri-affitti.it', null, null, 'verificato'),
    ('federica', 'fisica', 'Federica', 'Villa', null, null, null, null, 'federica.villa@cri-affitti.it', null, null, 'verificato'),
    ('tommaso', 'fisica', 'Tommaso', 'Pellegrini', null, null, null, null, 'tommaso.pellegrini@cri-affitti.it', null, null, 'verificato')
on conflict (codice_demo) do nothing;

-- Ogni persona con il suo account, per email.
update public.persone p
   set utente_id = u.id
  from auth.users u
 where p.utente_id is null and lower(u.email) = lower(p.email);

-- ─── I ruoli ─────────────────────────────────────────────────────────────────
insert into public.ruoli (persona_id, ruolo, funzione)
select p.id, r.ruolo, r.funzione
  from (values
    ('admin', 'admin', null),
    ('mario', 'proprietario', null),
    ('mario', 'inquilino', null),
    ('giulia', 'inquilino', null),
    ('verdi', 'proprietario', null),
    ('martina', 'inquilino', null),
    ('elena', 'cliente', null),
    ('sara', 'commerciale', null),
    ('paolo', 'avvocato', null),
    ('luca', 'interno', 'responsabile_operativo'),
    ('valeria', 'interno', 'istruttoria'),
    ('ettore', 'interno', 'istruttoria'),
    ('irene', 'interno', 'incassi'),
    ('nicola', 'interno', 'assistenza'),
    ('giorgio', 'interno', 'gestore_pratica'),
    ('beatrice', 'interno', 'indennizzi'),
    ('alberto', 'interno', 'tesoreria'),
    ('silvia', 'interno', 'resp_amministrativo'),
    ('laura', 'interno', 'resp_legale'),
    ('matteo', 'interno', 'resp_prodotto'),
    ('federica', 'interno', 'direzione'),
    ('tommaso', 'interno', 'dpo')
  ) as r(codice, ruolo, funzione)
  join public.persone p on p.codice_demo = r.codice
on conflict do nothing;

-- A chi risponde ogni collega.
update public.ruoli r
   set responsabile = capo.id
  from (values
    ('luca', 'federica'), ('valeria', 'luca'), ('ettore', 'luca'), ('irene', 'silvia'), ('nicola', 'luca'),
    ('giorgio', 'laura'), ('beatrice', 'silvia'), ('alberto', 'silvia'), ('silvia', 'federica'),
    ('laura', 'federica'), ('matteo', 'federica')
  ) as t(persona, capo_codice)
  join public.persone p on p.codice_demo = t.persona
  join public.persone capo on capo.codice_demo = t.capo_codice
 where r.persona_id = p.id and r.ruolo = 'interno';
