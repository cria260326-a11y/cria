# CRIA — Progetto Unificato

## Cosa è stato fatto in questo merge

Questo progetto unisce le due versioni:
- `CRIA_WEB_E_FORSE_BACKEND` → base pubblica/vetrina completa
- `CRIA_BACKEND` → dashboard più evolute

---

## Modifiche principali

### Header.jsx (nuovo, unificato)
- Se l'utente NON è loggato → mostra nav pubblica con tutti i link vetrina + pulsante Accedi
- Se l'utente È loggato → mostra header dashboard con nome, ruolo, pulsante Esci

### App.jsx (aggiornato)
- Tutti i route pubblici presenti (/, /come-funziona, /prodotto-1, /prodotto-2, /prodotto-3, /per-locatori, /per-agenzie, /faq, /contatti, /login)
- Tutti i route dashboard protetti per ruolo (/dashboard/admin, /dashboard/tenant, /dashboard/landlord-p1, /dashboard/landlord-p2, /dashboard/avvocato, /dashboard/commerciale, /dashboard/cliente)

### ProtectedRoute.jsx (aggiornato)
- Gestisce tutti i ruoli: admin, admin_visione, manager, avvocato, locatore, locatore_prodotto1, locatore_prodotto2, inquilino, cliente, commerciale
- Redirect automatico alla dashboard corretta se il ruolo non corrisponde

### HomePage.jsx
- Sostituita con la versione backend (più completa, 372 righe)

### LoginPage.jsx
- Usata la versione web (268 righe, più completa con validazione, Google login placeholder, recupero password)

### Terminologia
- ❌ "affittuario" / "Affittuario" eliminati ovunque
- ✅ Sostituiti con "inquilino" / "Inquilino"

---

## Ruoli disponibili nel login (demo)
| Ruolo | Dashboard |
|-------|-----------|
| admin | /dashboard/admin |
| admin_visione | /dashboard/admin |
| manager | /dashboard/admin (con limitazioni) |
| avvocato | /dashboard/avvocato (placeholder) |
| locatore / locatore_prodotto1 | /dashboard/landlord-p1 |
| locatore_prodotto2 | /dashboard/landlord-p2 |
| inquilino | /dashboard/tenant |
| cliente | /dashboard/cliente (placeholder) |
| commerciale | /dashboard/commerciale (placeholder) |

---

## Dashboard da sviluppare (placeholder attivi)
- Avvocato
- Commerciale
- Cliente (stato richiesta)
- Manager (usa Admin per ora, con differenziazione visiva da fare)

## Prossimi step suggeriti
1. Completare le dashboard mancanti (avvocato, commerciale, manager, cliente)
2. Integrare Supabase Auth al posto del mock login
3. Implementare onboarding flow
4. Aggiungere mappa immobili nella dashboard admin
