-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  CRIA — 00_extensions.sql                                                ║
-- ║  Estensioni PostgreSQL. Primo file da eseguire, nessuna dipendenza.      ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- PORTABILITÀ — l'approdo previsto è Postgres su server proprio.
-- Tutte le estensioni qui sotto sono PostgreSQL standard e si installano
-- identiche su una macchina propria. Non c'è niente di specifico di Supabase.

-- gen_random_uuid(), digest(), hashing. In PG 13+ gen_random_uuid() è nativo,
-- ma pgcrypto serve comunque per hash e cifratura.
create extension if not exists pgcrypto with schema extensions;

-- Ricerca fuzzy su testo: similarity() e l'operatore %.
-- Serve al confronto fra anagrafiche simili (nome + data + luogo di nascita)
-- che alimenta la coda di verifica manuale.
create extension if not exists pg_trgm with schema extensions;

-- Rimozione degli accenti nella normalizzazione dei nomi.
-- "Nicolò" e "Nicolo" devono confrontarsi uguali.
create extension if not exists unaccent with schema extensions;

-- Job schedulati: regola dell'11, apertura del mese, chiusura finestra
-- contestazioni, cancellazione documenti a 30 giorni, ricalcolo semafori.
-- ⚠️ Su Supabase va abilitata dal pannello (Database → Extensions).
create extension if not exists pg_cron;

-- Chiamate HTTP da dentro il database, usate dai job che devono
-- invocare una funzione esterna (invio email, invio SMS).
create extension if not exists pg_net with schema extensions;


-- ─── Schema applicativo ────────────────────────────────────────────────────
-- Tutto ciò che è nostro sta in app.*, separato da public.* e da auth.*.
-- Alla migrazione fuori da Supabase questo schema si sposta intatto.
create schema if not exists app;

comment on schema app is
  'Funzioni e tipi propri di CRIA. Tenuto separato da public e da auth '
  'per rendere la migrazione fuori da Supabase una sostituzione di adapter '
  'e non una riscrittura.';
