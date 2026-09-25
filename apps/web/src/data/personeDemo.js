// ═════════════════════════════════════════════════════════════════════════════
// PERSONE DI PROVA
// Le stesse persone che stanno nel database (db/seed/persone_prova.sql), con
// il loro account: una con due cappelli, una con uno solo, una società, una
// non ancora verificata, la cliente di CRIA Verifica, la commerciale,
// l'avvocato, l'admin e i colleghi interni, uno per funzione.
// Qui servono a due cose: al modo demo (i controlli automatici sul Mac) e a
// collegare ogni persona del database ai dati di prova ancora nel codice
// (contratti, pratiche, pagamenti), con codice_demo = id.
// Le posizioni sui contratti non si scrivono a mano: si ricavano dai contratti
// di datiDemo.js, così selettore e pagine raccontano sempre le stesse cose.
// ═════════════════════════════════════════════════════════════════════════════

import { CONTRATTI } from '@/data/datiDemo';
import { OPERATORI } from '@/data/operatori';

const posizioniDa = (personaId) => [
    ...CONTRATTI.filter(c => c.locatore.personaId === personaId)
        .map(c => ({ id: `pos-${c.id}-locatore`, verso: 'locatore', contrattoId: c.id, immobile: `${c.immobile.indirizzo}, ${c.immobile.citta}` })),
    ...CONTRATTI.filter(c => c.conduttore.personaId === personaId)
        .map(c => ({ id: `pos-${c.id}-conduttore`, verso: 'conduttore', contrattoId: c.id, immobile: `${c.immobile.indirizzo}, ${c.immobile.citta}` })),
];

export const PERSONE_DEMO = [
    {
        id: 'mario',
        tipo: 'fisica',
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'proprietario@cri-affitti.it',
        telefono: '+39 333 1234567',
        codiceFiscale: 'RSSMRA80A01F205X',
        dataNascita: '1980-01-01',
        emailVerificata: true,
        statoIdentita: 'verificato',
        fatturazione: { intestatario: 'Mario Rossi', codiceFiscale: 'RSSMRA80A01F205X', paese: 'Italia', indirizzo: 'Via Verdi 3', cap: '20121', citta: 'Milano', provincia: 'MI' },
        descrizione: 'Proprietario di due immobili e inquilino di un terzo',
        posizioni: posizioniDa('mario'),
        aree: [],
    },
    {
        id: 'giulia',
        tipo: 'fisica',
        nome: 'Giulia',
        cognome: 'Ferri',
        email: 'inquilino@cri-affitti.it',
        telefono: '+39 347 5550192',
        codiceFiscale: 'FRRGLI92D45F205W',
        dataNascita: '1992-04-05',
        emailVerificata: true,
        statoIdentita: 'verificato',
        descrizione: 'Solo inquilina',
        posizioni: posizioniDa('giulia'),
        aree: [],
    },
    {
        id: 'verdi',
        tipo: 'giuridica',
        ragioneSociale: 'Immobiliare Verdi S.r.l.',
        partitaIva: '10293847561',
        nome: 'Laura',
        cognome: 'Verdi',
        email: 'societa@cri-affitti.it',
        telefono: '+39 02 87654321',
        emailVerificata: true,
        statoIdentita: 'verificato',
        fatturazione: { intestatario: 'Immobiliare Verdi S.r.l.', partitaIva: '10293847561', codiceFiscale: '10293847561', sdi: 'M5UXCR1', pec: '', indirizzo: 'Corso Venezia 40', cap: '20121', citta: 'Milano', provincia: 'MI' },
        descrizione: 'Società proprietaria di tre immobili',
        posizioni: posizioniDa('verdi'),
        aree: [],
    },
    {
        id: 'martina',
        tipo: 'fisica',
        nome: 'Martina',
        cognome: 'Galli',
        email: 'morosita@cri-affitti.it',
        telefono: '+39 351 6677889',
        codiceFiscale: 'GLLMTN93S52F205I',
        dataNascita: '1993-11-12',
        emailVerificata: true,
        statoIdentita: 'verificato',
        descrizione: 'Inquilina con una pratica di morosità e un piano di rientro',
        posizioni: posizioniDa('martina'),
        aree: [],
    },
    {
        id: 'anna',
        tipo: 'fisica',
        nome: 'Anna',
        cognome: 'Conti',
        email: 'nonverificato@cri-affitti.it',
        telefono: '+39 340 7771234',
        codiceFiscale: 'CNTNNA95E50H501W',
        emailVerificata: true,
        statoIdentita: 'non_caricato',
        descrizione: "Registrata, documento d'identità ancora da caricare",
        posizioni: [],
        aree: [],
    },
    {
        id: 'elena',
        tipo: 'fisica',
        nome: 'Elena',
        cognome: 'Greco',
        email: 'cliente@cri-affitti.it',
        telefono: '+39 339 2468135',
        codiceFiscale: 'GRCLNE88C41F839A',
        dataNascita: '1988-03-01',
        emailVerificata: true,
        statoIdentita: 'verificato',
        fatturazione: { intestatario: 'Elena Greco', codiceFiscale: 'GRCLNE88C41F839A', paese: 'Italia', indirizzo: 'Via Chiaia 118', cap: '80132', citta: 'Napoli', provincia: 'NA' },
        descrizione: 'Cliente di CRIA Verifica, nessun contratto',
        posizioni: [],
        aree: ['cliente'],
    },
    {
        id: 'sara',
        tipo: 'fisica',
        nome: 'Sara',
        cognome: 'Esposito',
        email: 'commerciale@cri-affitti.it',
        telefono: '+39 331 9087766',
        codiceFiscale: 'SPSSRA90H50F839B',
        emailVerificata: true,
        statoIdentita: 'verificato',
        descrizione: 'Commerciale',
        posizioni: [],
        aree: ['commerciale'],
    },
    {
        id: 'paolo',
        tipo: 'fisica',
        nome: 'Paolo',
        cognome: 'Galli',
        email: 'avvocato@cri-affitti.it',
        telefono: '+39 02 55512345',
        codiceFiscale: 'GLLPLA75B12F205W',
        emailVerificata: true,
        statoIdentita: 'verificato',
        descrizione: 'Avvocato in convenzione',
        posizioni: [],
        aree: ['avvocato'],
    },
    {
        id: 'admin',
        tipo: 'fisica',
        nome: 'Amministratore',
        cognome: 'CRIA',
        email: 'admin@cri-affitti.it',
        emailVerificata: true,
        statoIdentita: 'verificato',
        descrizione: 'Accesso completo',
        posizioni: [],
        aree: ['admin'],
        operatoreId: 'admin',
    },
    // I colleghi interni, ognuno con il suo account e la sua funzione.
    ...OPERATORI.map(o => ({
        id: o.id,
        tipo: 'fisica',
        nome: o.nome,
        cognome: o.cognome,
        email: o.email,
        emailVerificata: true,
        statoIdentita: 'verificato',
        descrizione: 'Collega interno',
        posizioni: [],
        aree: ['admin'],
        operatoreId: o.id,
    })),
];

export const trovaPersonaDemo = (id) => PERSONE_DEMO.find(p => p.id === id) || null;

export const trovaPersonaDemoPerEmail = (email) =>
    PERSONE_DEMO.find(p => p.email.toLowerCase() === email.trim().toLowerCase()) || null;
