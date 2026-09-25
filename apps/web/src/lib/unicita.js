import { PERSONE_DEMO } from '@/data/personeDemo';
import { contrattiAttuali } from '@/lib/contrattiFonte';

import { PRATICHE } from '@/data/pratiche';
import { SOGGETTI } from '@/data/anagrafiche';

// ═════════════════════════════════════════════════════════════════════════════
// UNA PERSONA, UNA VOLTA SOLA
// Email, cellulare e codice fiscale non si ripetono: chi li usa già non si può
// registrare di nuovo. La registrazione rifiuta email e cellulare già presenti;
// il codice fiscale si controlla quando entra (verifica dell'identità, codice
// definitivo al posto del provvisorio). Nome, indirizzo e paese invece possono
// ripetersi — omonimi, famiglie — e lì scatta la revisione delle anagrafiche.
//
// Nei mockup si confronta con le persone e i soggetti demo. In piattaforma
// l'email la protegge già Supabase Auth; cellulare e codice fiscale saranno
// vincoli UNIQUE della tabella delle persone, non controlli del browser.
// ═════════════════════════════════════════════════════════════════════════════

export const normalizzaEmail = (e) => String(e || '').trim().toLowerCase();
export const normalizzaTelefono = (t) => String(t || '').replace(/^00/, '+').replace(/[^\d+]/g, '');
export const normalizzaCodiceFiscale = (cf) => String(cf || '').replace(/\s+/g, '').toUpperCase();

const tutti = () => [
    ...PERSONE_DEMO.map(p => ({ email: p.email, telefono: p.telefono, codiceFiscale: p.codiceFiscale })),
    ...contrattiAttuali().flatMap(c => [c.locatore, c.conduttore]),
    ...PRATICHE.map(p => p.candidato).filter(Boolean),
    ...Object.values(SOGGETTI),
];

const presente = (campo, norma, valore) => {
    const v = norma(valore);
    return Boolean(v) && tutti().some(x => norma(x?.[campo]) === v);
};

export const emailGiaUsata = (email) => presente('email', normalizzaEmail, email);
export const telefonoGiaUsato = (telefono) => presente('telefono', normalizzaTelefono, telefono);
export const codiceFiscaleGiaUsato = (codice) => presente('codiceFiscale', normalizzaCodiceFiscale, codice);

export const MESSAGGI_UNICITA = {
    email: 'Questa email è già in CRIA: se hai un account, accedi; se ti abbiamo invitato, usa il link dell’invito.',
    telefono: 'Questo cellulare è già collegato a un account: in CRIA ci si registra una volta sola.',
    codiceFiscale: 'Questo codice fiscale è già di un’altra anagrafica: in CRIA una persona c’è una volta sola.',
};
