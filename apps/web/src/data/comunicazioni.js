// ═════════════════════════════════════════════════════════════════════════════
// COMUNICAZIONI — SOLO PER I MOCKUP (lotto 5, O-23 e O-24)
// Tre canali: la notifica in piattaforma, l'email con Postmark e l'SMS, il cui
// fornitore è ancora da scegliere. I registri non si scrivono a mano: si
// ricavano dai fatti dei dati condivisi — i mesi dei contratti per i solleciti,
// le contestazioni, le pratiche, le verifiche, le autocandidature, le morosità —
// con le regole del documento di stato:
//   · tre solleciti prima della fine della finestra, al giorno +1, al +3 e la
//     mattina dell'ultimo giorno utile, su tutti e tre i canali (§9.2)
//   · a ogni cambio di stato della contestazione, un avviso a entrambe le
//     parti (§9.3)
//   · l'esito di CRIA Verifica per email dice solo di accedere (§9.7)
// Fase 4: tabelle email_log e notifiche (§6.8); gli stati arrivano dai webhook
// di Postmark e del fornitore SMS.
// ═════════════════════════════════════════════════════════════════════════════

import { OGGI, CONTRATTI, DOCUMENTI, trovaContratto, indirizzoCompleto } from '@/data/datiDemo';
import { trovaPersonaDemo, PERSONE_DEMO } from '@/data/personeDemo';
import { esitoEntro, nomeCandidato } from '@/data/verifiche';
import { PARAMETRI, PRODOTTI } from '@/data/catalogo';
import { RICHIESTE_DATI, ilData, dalData, alData } from '@/data/scadenze';
import { parametriDelContratto } from '@/lib/parametriCiclo';
import { aggiungiGiorniSolari } from '@/lib/calendario';
import { nomeVisualizzato } from '@/lib/aree';
import { TIPO_DOCUMENTO } from '@/lib/etichette';
import { nomeMese, meseSuccessivo } from '@/lib/formato';

// ─── Canali e stati ───────────────────────────────────────────────────────────
export const CANALI = {
    notifica: { etichetta: 'Notifica', descrizione: 'In piattaforma. Sul telefono arriva con l’app' },
    email: { etichetta: 'Email', descrizione: 'Con Postmark' },
    sms: { etichetta: 'SMS', descrizione: 'Fornitore da scegliere' },
};

export const ORDINE_CANALI = ['notifica', 'email', 'sms'];

// Un vocabolario per tutti i canali; l'SMS è maschile.
//   esito  ok · ko · attesa · nessuno
export const STATI_INVIO = {
    programmato: { f: 'Programmata', m: 'Programmato', classe: 'bg-blue-50 text-blue-800', esito: 'attesa' },
    in_coda: { f: 'In coda', m: 'In coda', classe: 'bg-slate-100 text-slate-700', esito: 'attesa' },
    inviata: { f: 'Inviata', m: 'Inviato', classe: 'bg-blue-100 text-blue-800', esito: 'attesa' },
    consegnata: { f: 'Consegnata', m: 'Consegnato', classe: 'bg-green-100 text-green-800', esito: 'ok' },
    aperta: { f: 'Aperta', m: 'Aperto', classe: 'bg-emerald-100 text-emerald-800', esito: 'ok' },
    letta: { f: 'Letta', m: 'Letto', classe: 'bg-emerald-100 text-emerald-800', esito: 'ok' },
    rimbalzata: { f: 'Rimbalzata', m: 'Rimbalzato', classe: 'bg-red-100 text-red-800', esito: 'ko' },
    spam: { f: 'Segnalata come spam', m: 'Segnalato come spam', classe: 'bg-red-100 text-red-800', esito: 'ko' },
    non_consegnata: { f: 'Non consegnata', m: 'Non consegnato', classe: 'bg-red-100 text-red-800', esito: 'ko' },
    non_inviato: { f: 'Non inviata', m: 'Non inviato', classe: 'bg-gray-100 text-gray-600', esito: 'nessuno' },
};

export const etichettaStatoInvio = (stato, canale) => {
    const s = STATI_INVIO[stato];
    if (!s) return stato;
    return canale === 'sms' ? s.m : s.f;
};

// Gli stati che Postmark rimanda con i webhook, per il filtro del registro email.
export const STATI_EMAIL = ['in_coda', 'inviata', 'consegnata', 'aperta', 'rimbalzata', 'spam'];

// ─── Postmark ─────────────────────────────────────────────────────────────────
export const POSTMARK = {
    stato: 'Account presente, modelli da caricare',
    flusso: 'Transazionale: solo messaggi che servono al servizio, niente promozioni',
    dominio: 'cri-affitti.it',
    note: [
        'Per mandare dal dominio servono i record DKIM e Return-Path di Postmark nei DNS, che stanno su SiteGround',
        'Consegne, aperture e rimbalzi arrivano con i webhook e aggiornano il registro',
        'Nei mockup gli invii sono simulati',
    ],
};

// ─── SMS: il fornitore è una decisione aperta (§16.1) ─────────────────────────
export const FORNITORE_SMS = {
    titolo: 'Fornitore SMS: da scegliere',
    perche: 'I tre solleciti del ciclo mensile vanno anche per SMS: con tre avvisi tracciati il proprietario non può dire di non aver saputo (§9.2)',
    criteri: [
        'Una ricevuta di consegna per ogni messaggio, da tenere nel registro',
        'Il nome CRIA come mittente, non un numero',
        'Dati trattati nell’Unione europea',
        'Invio a un’ora stabilita: l’ultimo sollecito parte la mattina',
        'Il costo per messaggio, sul volume dei solleciti',
    ],
    nelFrattempo: 'Finché non c’è, in piattaforma i solleciti partono su notifica ed email. Nei mockup gli SMS sono simulati',
    schema: 'Nello schema il canale è generico: aggiungere il fornitore è configurazione, non una modifica (§16.3)',
};

// I numeri fissi italiani cominciano con 0: gli SMS lì non arrivano.
export const eNumeroFisso = (telefono) => /^\+39\s*0/.test(String(telefono || '').trim());

// ─── I modelli delle email ────────────────────────────────────────────────────
//   automatico   parte da un evento della piattaforma
//   daOperatore  lo manda un operatore dalla sua schermata
//   manuale      si manda dalla sezione Email, con un contesto preso dai dati
export const MODELLI_EMAIL = {
    sollecito_segnalazione: { nome: 'Sollecito della segnalazione', a: 'Proprietario', automatico: true, quando: 'Giorno +1, giorno +3 e la mattina dell’ultimo giorno utile, finché il proprietario non risponde' },
    segnalazione_ricevuta: { nome: 'Segnalazione di mancato pagamento', a: 'Inquilino', automatico: true, quando: 'Quando il proprietario segnala un canone non pagato: con la data entro cui contestare' },
    contestazione_aperta: { nome: 'Contestazione aperta', a: 'Proprietario e inquilino', automatico: true, quando: 'All’apertura, a entrambe le parti' },
    contestazione_aggiornata: { nome: 'Contestazione: aggiornamento', a: 'Proprietario e inquilino', automatico: true, quando: 'A ogni cambio di stato, a entrambe le parti' },
    contestazione_decisa: { nome: 'Contestazione decisa', a: 'Proprietario e inquilino', automatico: true, quando: 'Alla decisione di CRIA, a entrambe le parti' },
    quota_ricevuta: { nome: 'Quota di iscrizione ricevuta', a: 'Proprietario', automatico: true, quando: 'All’avvio della pratica' },
    invito_candidato: { nome: 'Invito al candidato', a: 'Candidato inquilino', automatico: true, quando: 'Quando il proprietario lo invita: il link personale va anche per SMS' },
    verifica_conclusa: { nome: 'Verifica conclusa: il prezzo è pronto', a: 'Proprietario', automatico: true, quando: 'Alla delibera' },
    pagamento_ricevuto: { nome: 'Pagamento ricevuto', a: 'Proprietario', automatico: true, quando: 'Al pagamento, quando il prezzo si congela' },
    contratto_firmato: { nome: 'Contratto di servizio firmato', a: 'Proprietario', automatico: true, quando: 'Alla firma' },
    verifica_richiesta: { nome: 'CRIA Verifica: richiesta ricevuta', a: 'Cliente', automatico: true, quando: 'Al pagamento della richiesta' },
    verifica_esito_pronto: { nome: 'CRIA Verifica: risultato pronto', a: 'Cliente', automatico: true, quando: 'Quando l’esito è pronto', nota: 'Non contiene l’esito: dice solo di accedere' },
    autocandidatura_avviata: { nome: 'Autocandidatura avviata', a: 'Inquilino', automatico: true, quando: 'Al pagamento' },
    referenza_richiesta: { nome: 'Richiesta di referenza', a: 'Precedente proprietario', automatico: true, quando: 'Solo se l’inquilino la chiede, al recapito del contratto' },
    morosita_aperta: { nome: 'Pratica di morosità aperta', a: 'Proprietario', automatico: true, quando: 'Il giorno dopo la chiusura del mese senza incasso' },
    morosita_contatto: { nome: 'Email del gestore della pratica', a: 'Inquilino', daOperatore: true, quando: 'La manda il gestore dalla pratica di morosità, e resta fra i contatti tracciati' },
    indennizzo_accreditato: { nome: 'Indennizzo accreditato', a: 'Proprietario', automatico: true, quando: 'Quando parte il bonifico dell’indennizzo' },
    rata_ricevuta: { nome: 'Rata ricevuta', a: 'Inquilino', automatico: true, quando: 'A ogni rata pagata' },
    accesso_dati_ricevuta: { nome: 'Richiesta di accesso ai dati ricevuta', a: 'Interessato', automatico: true, quando: 'All’arrivo, con la data entro cui rispondiamo' },
    verifica_email: { nome: 'Conferma dell’indirizzo email', a: 'Chi si registra', automatico: true, quando: 'Alla registrazione', nota: 'Nessun invio nei mockup: la registrazione è simulata' },
    nuova_password: { nome: 'Nuova password', a: 'Chi la chiede', automatico: true, quando: 'Dal recupero della password', nota: 'Nessun invio nei mockup' },
    promemoria_documenti: { nome: 'Promemoria dei documenti', a: 'Candidato inquilino', manuale: true, quando: 'Dalla sezione, se mancano documenti' },
    documento_da_integrare: { nome: 'Documento da integrare', a: 'Proprietario', manuale: true, quando: 'Dalla sezione, per un documento da integrare' },
    numero_cellulare: { nome: 'Serve un numero di cellulare', a: 'Proprietario', manuale: true, quando: 'Dalla sezione, quando gli SMS non arrivano a un numero fisso' },
    messaggio_assistenza: { nome: 'Messaggio dell’assistenza', a: 'Chiunque abbia un recapito', manuale: true, quando: 'Dalla sezione, con oggetto e testo scritti da chi manda' },
};

// ─── Chi è chi ────────────────────────────────────────────────────────────────
const personaComeDestinatario = (id, ruolo) => {
    const p = trovaPersonaDemo(id);
    return p ? { nome: nomeVisualizzato(p), email: p.email, telefono: p.telefono, ruolo } : null;
};

const parte = (x, ruolo) => ({ nome: x.nome, email: x.email, telefono: x.telefono, ruolo });

const meseMinuscolo = (mese) => nomeMese(mese).toLowerCase();

const mesePrima = (mese) => {
    const [a, m] = mese.split('-').map(Number);
    return m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, '0')}`;
};

const giornoDelMese = (mese, g) => `${mese}-${String(g).padStart(2, '0')}`;

export const MESE_CORRENTE = OGGI.slice(0, 7);

// I cicli nel registro: il mese scorso, questo e il prossimo, già programmato.
export const MESI_REGISTRO = [mesePrima(MESE_CORRENTE), MESE_CORRENTE, meseSuccessivo(MESE_CORRENTE)];

// ─── I solleciti del ciclo mensile ────────────────────────────────────────────
// Partono per chi incassa da sé (CRIA Gestione e CRIA Segnalazione), con i
// parametri congelati sul contratto alla firma. Il primo e il secondo alle 9,
// l'ultimo alle 8: «la mattina dell'ultimo giorno utile». Quando il proprietario
// ha risposto, i solleciti che restano non partono.
const ORA_SOLLECITO = '09:00';
const ORA_ULTIMO = '08:00';

const testoRispostaCiclo = (m) => {
    const il = ilData(m.segnalazione.il);
    if (m.segnalazione.tipo === 'pagato') return { testo: `Ha risposto ${il}: pagato`, esito: 'risposto' };
    const perCopertura = {
        attiva: 'non pagato, entro la finestra: copertura attiva',
        decaduta_tardiva: 'non pagato, dopo la finestra: copertura decaduta',
        in_franchigia: 'non pagato, mese in franchigia',
    }[m.copertura] || 'non pagato, senza garanzia: conta per il semaforo';
    return { testo: `Ha risposto ${il}: ${perCopertura}`, esito: 'risposto' };
};

export const cicliSolleciti = (versioniParametri) => CONTRATTI
    .filter(c => PRODOTTI[c.prodotto]?.incassa === 'proprietario')
    .flatMap(c => {
        const par = parametriDelContratto(c, versioniParametri);
        const proprietario = parte(c.locatore, 'Proprietario');
        const offset = [...par.solleciti, par.ultimoGiornoUtile - par.scadenza];
        return MESI_REGISTRO.map(mese => {
            const m = c.mesi.find(x => x.mese === mese);
            const risposta = m && m.segnalazione.fonte !== 'automatica' ? m.segnalazione : null;
            const giorno = (g) => giornoDelMese(mese, g);
            const solleciti = offset.map((dopo, i) => {
                const il = giorno(par.scadenza + dopo);
                const base = {
                    n: i + 1,
                    il,
                    ora: i === 2 ? ORA_ULTIMO : ORA_SOLLECITO,
                    etichetta: i === 2 ? 'La mattina dell’ultimo giorno utile' : `Giorno +${dopo}`,
                };
                if (il > OGGI) return { ...base, stato: 'programmato', invii: ORDINE_CANALI.map(canale => ({ canale, stato: 'programmato' })) };
                if (risposta && risposta.il < il) return { ...base, stato: 'non_inviato', motivo: `Aveva già risposto ${ilData(risposta.il)}`, invii: [] };
                const letto = risposta?.il === il;
                return {
                    ...base,
                    stato: 'inviato',
                    invii: [
                        { canale: 'notifica', stato: letto ? 'letta' : 'consegnata' },
                        { canale: 'email', stato: letto ? 'aperta' : 'consegnata' },
                        eNumeroFisso(proprietario.telefono)
                            ? { canale: 'sms', stato: 'non_consegnata', nota: 'Numero fisso: non riceve SMS' }
                            : { canale: 'sms', stato: 'consegnata' },
                    ],
                };
            });
            const chiusura = giorno(par.chiusura);
            let esito;
            if (mese > MESE_CORRENTE) esito = { testo: `Si apre ${ilData(giorno(par.scadenza))}: tre solleciti programmati`, esito: 'programmato' };
            else if (risposta) esito = testoRispostaCiclo(m);
            else if (chiusura < OGGI) {
                esito = {
                    testo: `Nessuna risposta entro ${ilData(chiusura)}: ${dalData(giorno(par.chiusura + 1))} il mese è non rilevato${par.garanzia ? ', senza copertura' : ''}`,
                    esito: 'senza_risposta',
                };
            } else esito = { testo: `In attesa di risposta fino ${alData(chiusura)}`, esito: 'in_corso' };
            return {
                id: `${c.id}:${mese}`,
                contrattoId: c.id,
                mese,
                immobile: indirizzoCompleto(c),
                prodotto: c.prodotto,
                proprietario,
                parametri: par,
                solleciti,
                esito,
            };
        });
    });

// ─── Il registro delle email, dai fatti ───────────────────────────────────────
const email = (id, modello, destinatario, { il, oggetto, testo, stato = 'consegnata', contesto }) => ({
    id,
    modello,
    destinatario,
    il,
    oggetto,
    testo,
    stato,
    contesto,
    inviataDa: null,
});

const saluto = (d) => `Buongiorno ${d.nome},`;

const emailDeiSolleciti = (cicli) => cicli.flatMap(ciclo => ciclo.solleciti
    .filter(s => s.stato === 'inviato')
    .map(s => {
        const par = ciclo.parametri;
        const mese = meseMinuscolo(ciclo.mese);
        const scadenza = ilData(giornoDelMese(ciclo.mese, par.scadenza));
        const ultimo = ilData(giornoDelMese(ciclo.mese, par.ultimoGiornoUtile));
        const chiusura = ilData(giornoDelMese(ciclo.mese, par.chiusura));
        const regola = par.garanzia
            ? `Se non è arrivato, segnalalo entro ${ultimo} per tenere la copertura. Senza risposta entro ${chiusura} il mese è non rilevato.`
            : `Rispondi entro ${chiusura}: dopo, il mese è non rilevato e non conta nel semaforo.`;
        const oggi = s.n === 3 ? 'Oggi è l’ultimo giorno utile. ' : '';
        return email(`em-sol-${ciclo.id}-${s.n}`, 'sollecito_segnalazione', ciclo.proprietario, {
            il: `${s.il} ${s.ora}`,
            oggetto: `Il canone di ${mese} di ${ciclo.immobile.split(',')[0]} è arrivato?`,
            testo: `${saluto(ciclo.proprietario)} il canone di ${mese} scadeva ${scadenza}. ${oggi}È arrivato? Rispondi dall’app con un tocco: sì o no. ${regola}`,
            stato: s.invii.find(i => i.canale === 'email')?.stato || 'consegnata',
            contesto: `${ciclo.immobile.split(',')[0]} · ${nomeMese(ciclo.mese)} · sollecito ${s.n} di 3`,
        });
    }));

// Le segnalazioni di mancato pagamento da maggio: l'inquilino riceve la data
// entro cui può contestare.
const PRIMO_MESE_LOG = '2026-05';

const emailDelleSegnalazioni = () => CONTRATTI.flatMap(c => c.mesi
    .filter(m => m.mese >= PRIMO_MESE_LOG && m.segnalazione.tipo === 'non_pagato')
    .map(m => {
        const inquilino = parte(c.conduttore, 'Inquilino');
        const entro = m.scadenzaContestazione || aggiungiGiorniSolari(m.segnalazione.il, PARAMETRI.giorniContestazione);
        return email(`em-seg-${c.id}-${m.mese}`, 'segnalazione_ricevuta', inquilino, {
            il: m.segnalazione.il,
            oggetto: `Canone di ${meseMinuscolo(m.mese)} segnalato come non pagato`,
            testo: `${saluto(inquilino)} il proprietario di ${c.immobile.indirizzo} ha segnalato come non pagato il canone di ${meseMinuscolo(m.mese)}. Se l’hai pagato puoi contestare entro ${ilData(entro)} dalla tua area, con una prova: per esempio la ricevuta del bonifico.`,
            stato: m.contestazioneId ? 'aperta' : 'consegnata',
            contesto: `${c.immobile.indirizzo} · ${nomeMese(m.mese)}`,
        });
    }));

// A ogni cambio di stato, a tutte e due le parti. Le contestazioni arrivano con
// le decisioni prese nella loro coda (O-10). Il messaggio di CRIA del giorno
// della chiusura è la decisione.
const conOra = (il) => (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(il) ? il : il.slice(0, 10));

const emailDelleContestazioni = (contestazioni) => contestazioni.flatMap(k => {
    const c = trovaContratto(k.contrattoId);
    const parti = [parte(c.locatore, 'Proprietario'), parte(c.conduttore, 'Inquilino')];
    const mese = meseMinuscolo(k.mese);
    const contesto = `${c.immobile.indirizzo} · contestazione di ${mese}`;
    // Aperta se la parte ha scritto dopo l'avviso.
    const letta = (quando, ruolo) => k.messaggi.some(x => conOra(x.il) > quando && x.autore === (ruolo === 'Proprietario' ? 'locatore' : 'conduttore'));
    const primo = k.messaggi.find(x => x.autore === 'sistema');
    const eventi = [{ tipo: 'contestazione_aperta', il: primo ? conOra(primo.il) : k.apertaIl }];
    k.messaggi.filter(x => x.autore === 'cria' || (x.autore === 'sistema' && x !== primo)).forEach(x => {
        const il = conOra(x.il);
        eventi.push({ tipo: k.chiusaIl && x.autore === 'cria' && il.startsWith(k.chiusaIl) ? 'contestazione_decisa' : 'contestazione_aggiornata', il, testo: x.testo });
    });
    if (k.chiusaIl && !eventi.some(e => e.tipo === 'contestazione_decisa')) eventi.push({ tipo: 'contestazione_decisa', il: k.chiusaIl });

    return eventi.flatMap((e, i) => parti.map(d => {
        const perIlProprietario = d.ruolo === 'Proprietario';
        let oggetto;
        let testo;
        if (e.tipo === 'contestazione_aperta') {
            oggetto = perIlProprietario ? `Contestazione sul canone di ${mese} · ${c.immobile.indirizzo}` : 'Abbiamo ricevuto la tua contestazione';
            testo = perIlProprietario
                ? `${saluto(d)} ${c.conduttore.nome} ha contestato la segnalazione di mancato pagamento di ${mese}. Trovi le prove nella tua area e puoi rispondere da lì. CRIA decide entro ${ilData(k.rispostaEntro)}.`
                : `${saluto(d)} la contestazione sul canone di ${mese} è aperta. CRIA decide entro ${ilData(k.rispostaEntro)}, sulle prove di entrambe le parti. Finché è aperta, quel mese non conta nel semaforo.`;
        } else if (e.tipo === 'contestazione_aggiornata') {
            oggetto = `Contestazione sul canone di ${mese}: aggiornamento`;
            testo = `${saluto(d)} ${e.testo} Trovi tutto nella tua area.`;
        } else {
            oggetto = `Contestazione sul canone di ${mese}: decisa`;
            testo = `${saluto(d)} ${k.esito || e.testo} Trovi la decisione nella tua area.`;
        }
        return email(`em-con-${k.id}-${i}-${perIlProprietario ? 'p' : 'i'}`, e.tipo, d, {
            il: e.il, oggetto, testo, stato: letta(e.il, d.ruolo) ? 'aperta' : 'consegnata', contesto,
        });
    }));
});

const emailDellePratiche = (pratiche) => pratiche.flatMap(p => {
    const proprietario = personaComeDestinatario(p.personaId, 'Proprietario');
    if (!proprietario) return [];
    const via = p.immobile.indirizzo;
    const contesto = `${via} · pratica`;
    const out = [];
    if (p.quotaPagataIl) {
        out.push(email(`em-quota-${p.id}`, 'quota_ricevuta', proprietario, {
            il: p.quotaPagataIl,
            oggetto: `Quota di iscrizione ricevuta · ${via}`,
            testo: `${saluto(proprietario)} abbiamo ricevuto la quota di iscrizione per ${via}. Ora servono i documenti: i tuoi, e quelli del candidato, che li carica dal suo link personale.`,
            stato: 'aperta',
            contesto,
        }));
    }
    const c = p.candidato;
    if (c?.invitatoIl && c.email) {
        const candidato = { nome: c.nome, email: c.email, telefono: c.cellulare, ruolo: 'Candidato inquilino' };
        out.push(email(`em-invito-${p.id}`, 'invito_candidato', candidato, {
            il: c.invitatoIl,
            oggetto: `${proprietario.nome} ti invita su CRIA`,
            testo: `${saluto(candidato)} ${proprietario.nome} ti ha indicato come inquilino per ${via}. Dal tuo link personale leggi l’informativa, dai i consensi e carichi i tuoi documenti. Il proprietario vede quali mancano, non i documenti.`,
            stato: c.ultimoAccesso ? 'aperta' : 'consegnata',
            contesto,
        }));
    }
    if (p.istruttoria?.conclusaIl) {
        out.push(email(`em-delibera-${p.id}`, 'verifica_conclusa', proprietario, {
            il: p.istruttoria.conclusaIl,
            oggetto: `Verifica conclusa · ${via}`,
            testo: `${saluto(proprietario)} la verifica di CRIA su ${via} è conclusa. Il prezzo è pronto: quando paghi si congela, e se il listino cambia il tuo prezzo no.`,
            stato: p.pagamento ? 'aperta' : 'consegnata',
            contesto,
        }));
    }
    if (p.pagamento?.pagataIl) {
        const trattenuta = p.pagamento.metodo === 'trattenuta';
        out.push(email(`em-pagamento-${p.id}`, 'pagamento_ricevuto', proprietario, {
            il: p.pagamento.pagataIl,
            oggetto: trattenuta ? `Conto registrato · ${via}` : `Pagamento ricevuto · ${via}`,
            testo: trattenuta
                ? `${saluto(proprietario)} abbiamo registrato il conto su cui ti bonifichiamo il canone di ${via}. Il prezzo è congelato. Manca la firma del contratto di servizio, che fai in piattaforma con un codice via SMS.`
                : `${saluto(proprietario)} abbiamo ricevuto il pagamento per ${via}: il prezzo ora è congelato. Manca la firma del contratto di servizio, che fai in piattaforma con un codice via SMS.`,
            stato: p.firma ? 'aperta' : 'consegnata',
            contesto,
        }));
    }
    if (p.firma?.firmataIl) {
        out.push(email(`em-firma-${p.id}`, 'contratto_firmato', proprietario, {
            il: p.firma.firmataIl,
            oggetto: `Contratto di servizio firmato · ${via}`,
            testo: `${saluto(proprietario)} il contratto di servizio per ${via} è firmato e la pratica è attiva. Il contratto firmato lo trovi nei tuoi documenti.`,
            contesto,
        }));
    }
    return out;
});

const emailDelleVerifiche = (verifiche) => verifiche.flatMap(v => {
    const cliente = personaComeDestinatario(v.personaId, 'Cliente');
    if (!cliente) return [];
    const chi = nomeCandidato(v.soggetto);
    const contesto = `CRIA Verifica · ${chi}`;
    const out = [email(`em-ver-${v.id}`, 'verifica_richiesta', cliente, {
        il: v.richiestaIl,
        oggetto: 'CRIA Verifica: richiesta ricevuta',
        testo: `${saluto(cliente)} abbiamo ricevuto la tua richiesta su ${chi}. Il risultato arriva entro ${ilData(esitoEntro(v))}: ti avvisiamo per email e lo leggi in piattaforma.`,
        stato: 'aperta',
        contesto,
    })];
    if (v.esito?.il) {
        out.push(email(`em-esito-${v.id}`, 'verifica_esito_pronto', cliente, {
            il: v.esito.il,
            oggetto: 'CRIA Verifica: il risultato è pronto',
            testo: `${saluto(cliente)} il risultato della verifica su ${chi} è pronto. Per leggerlo accedi a CRIA: il risultato non viaggia per email.`,
            stato: 'aperta',
            contesto,
        }));
    }
    return out;
});

const emailDelleAutocandidature = (autocandidature) => autocandidature.flatMap(a => {
    const inquilino = personaComeDestinatario(a.personaId, 'Inquilino');
    if (!inquilino) return [];
    const out = [];
    if (a.pagamento?.pagataIl) {
        out.push(email(`em-auto-${a.id}`, 'autocandidatura_avviata', inquilino, {
            il: a.pagamento.pagataIl,
            oggetto: 'Autocandidatura avviata',
            testo: `${saluto(inquilino)} abbiamo ricevuto il pagamento. Ora carica le prove dalla tua area: per un colore servono almeno due prove forti, su dodici mesi.`,
            stato: 'aperta',
            contesto: 'Autocandidatura',
        }));
    }
    (a.referenze || []).forEach(r => r.tentativi.forEach((t, i) => {
        if (t.canale !== 'email' || !r.proprietario.email) return;
        const precedente = { nome: r.proprietario.nome, email: r.proprietario.email, telefono: r.proprietario.telefono, ruolo: 'Precedente proprietario' };
        out.push(email(`em-ref-${r.id}-${i}`, 'referenza_richiesta', precedente, {
            il: t.il,
            oggetto: `${r.inquilino} ti chiede una referenza`,
            testo: `${saluto(precedente)} ${r.inquilino} ha indicato te come proprietario di ${r.immobile}, da ${meseMinuscolo(r.dal)} a ${meseMinuscolo(r.al)}. Ti chiediamo di confermarlo dal tuo link personale: servono due minuti e non serve un account.`,
            stato: r.stato === 'in_attesa' ? 'consegnata' : 'aperta',
            contesto: `Referenza per ${r.inquilino}`,
        }));
    }));
    return out;
});

// Le morosità come le segue la pagina della garanzia (O-14, O-15): l'avviso al
// proprietario quando si apre la pratica, le email che il gestore ha mandato
// all'inquilino — sono fra i contatti tracciati —, le rate arrivate e il
// bonifico dell'indennizzo.
const emailDelleMorosita = (garanzia) => {
    if (!garanzia) return [];
    const out = [];
    garanzia.pratiche.forEach(p => {
        const c = p.contratto;
        const proprietario = parte(c.locatore, 'Proprietario');
        const inquilino = parte(c.conduttore, 'Inquilino');
        const mesi = p.mesi.map(meseMinuscolo).join(', ');
        const contesto = `${c.immobile.indirizzo} · morosità di ${mesi}`;
        if (p.apertaIl >= PRIMO_MESE_LOG) {
            out.push(email(`em-mor-${p.id}`, 'morosita_aperta', proprietario, {
                il: p.apertaIl,
                oggetto: `Pratica di morosità aperta · ${c.immobile.indirizzo}`,
                testo: `${saluto(proprietario)} il canone di ${mesi} di ${c.immobile.indirizzo} non è arrivato entro la chiusura del mese: abbiamo aperto la pratica di morosità e il recupero parte subito. La segui dalla tua area.`,
                stato: 'aperta',
                contesto,
            }));
        }
        p.contatti.filter(x => x.canale === 'email' && x.iniziativa === 'cria').forEach(x => {
            const risposta = p.contatti.some(y => `${y.il} ${y.ora}` > `${x.il} ${x.ora}` && y.iniziativa === 'inquilino');
            out.push({
                ...email(`em-mor-${x.id}`, 'morosita_contatto', inquilino, {
                    il: `${x.il} ${x.ora}`,
                    oggetto: `Il canone di ${mesi} · ${c.immobile.indirizzo}`,
                    testo: x.nota,
                    stato: risposta ? 'aperta' : 'consegnata',
                    contesto: `${contesto} · contatto del gestore`,
                }),
                inviataDa: x.registratoDa || p.gestoreId || null,
            });
        });
        (p.pianoAttivo?.rate || []).filter(r => r.pagataIl).forEach(r => {
            const prossima = p.pianoAttivo.rate.find(x => x.n === r.n + 1);
            out.push(email(`em-mor-rata-${p.id}-${r.n}`, 'rata_ricevuta', inquilino, {
                il: r.pagataIl,
                oggetto: 'Rata ricevuta',
                testo: `${saluto(inquilino)} abbiamo ricevuto la rata ${r.n} di ${p.pianoAttivo.rate.length} del piano di rientro.${prossima ? ` La prossima scade ${ilData(prossima.scadenza)}.` : ''}`,
                stato: 'aperta',
                contesto,
            }));
        });
    });
    (garanzia.indennizzi || []).filter(i => i.eseguitoIl).forEach(i => {
        const c = i.contratto;
        const proprietario = parte(c.locatore, 'Proprietario');
        out.push(email(`em-ind-${i.id}`, 'indennizzo_accreditato', proprietario, {
            il: i.eseguitoIl,
            oggetto: `Indennizzo di ${meseMinuscolo(i.mese)} · ${c.immobile.indirizzo}`,
            testo: `${saluto(proprietario)} ${meseMinuscolo(i.mese)} era coperto dalla garanzia: abbiamo disposto il bonifico dell’indennizzo. Il credito verso l’inquilino passa a CRIA, che segue il recupero.`,
            stato: 'aperta',
            contesto: `${c.immobile.indirizzo} · indennizzo`,
        }));
    });
    return out;
};

const emailDelleRichiesteDati = () => RICHIESTE_DATI.filter(r => r.canale === 'email').map(r => {
    const c = trovaContratto(r.interessato.contrattoId);
    const x = c.conduttore.nome === r.interessato.nome ? c.conduttore : null;
    if (!x) return null;
    const d = parte(x, 'Interessato');
    return email(`em-dati-${r.id}`, 'accesso_dati_ricevuta', d, {
        il: r.ricevutaIl,
        oggetto: 'Abbiamo ricevuto la tua richiesta di accesso ai dati',
        testo: `${saluto(d)} ti rispondiamo entro ${ilData(aggiungiGiorniSolari(r.ricevutaIl, 30))}, come prevede la legge. L’accesso ai tuoi dati è gratuito.`,
        stato: 'aperta',
        contesto: r.codice,
    });
}).filter(Boolean);

/**
 * Tutte le email che la piattaforma avrebbe mandato, le più recenti prima.
 * @param {{ pratiche, verifiche, autocandidature, cicli, contestazioni, garanzia }} fonti
 *   contestazioni  con le decisioni della loro coda (O-10)
 *   garanzia       { pratiche, indennizzi } dalla pagina della garanzia
 */
export const registroEmailDaiDati = ({ pratiche, verifiche, autocandidature, cicli, contestazioni, garanzia }) => [
    ...emailDeiSolleciti(cicli),
    ...emailDelleSegnalazioni(),
    ...emailDelleContestazioni(contestazioni),
    ...emailDellePratiche(pratiche),
    ...emailDelleVerifiche(verifiche),
    ...emailDelleAutocandidature(autocandidature),
    ...emailDelleMorosita(garanzia),
    ...emailDelleRichiesteDati(),
].sort((a, b) => b.il.localeCompare(a.il));

// ─── Gli altri messaggi, per notifica e SMS ───────────────────────────────────
// Gli inviti ai candidati e il codice di firma vanno per SMS; segnalazioni e
// contestazioni arrivano anche come notifica in piattaforma.
const messaggio = (id, canale, destinatario, { il, testo, stato = 'consegnata', contesto }) => ({ id, canale, destinatario, il, testo, stato, contesto });

export const altriMessaggiDaiDati = ({ pratiche, autocandidature, garanzia, email: registro }) => {
    const sms = [];
    (garanzia?.pratiche || []).forEach(p => p.contatti
        .filter(x => x.canale === 'sms' && x.iniziativa === 'cria')
        .forEach(x => sms.push(messaggio(`sms-mor-${x.id}`, 'sms', parte(p.contratto.conduttore, 'Inquilino'), {
            il: `${x.il} ${x.ora}`,
            testo: x.nota,
            stato: eNumeroFisso(p.contratto.conduttore.telefono) ? 'non_consegnata' : 'consegnata',
            contesto: `${p.contratto.immobile.indirizzo} · morosità · dal gestore`,
        }))));
    pratiche.forEach(p => {
        const proprietario = personaComeDestinatario(p.personaId, 'Proprietario');
        const c = p.candidato;
        if (c?.invitatoIl && c.cellulare) {
            sms.push(messaggio(`sms-invito-${p.id}`, 'sms', { nome: c.nome, telefono: c.cellulare, ruolo: 'Candidato inquilino' }, {
                il: c.invitatoIl,
                testo: `CRIA: ${proprietario?.nome || 'il proprietario'} ti invita a caricare i documenti per ${p.immobile.indirizzo}. Il link personale è anche nella tua email.`,
                stato: eNumeroFisso(c.cellulare) ? 'non_consegnata' : 'consegnata',
                contesto: `${p.immobile.indirizzo} · invito`,
            }));
        }
        if (p.firma?.firmataIl && proprietario?.telefono) {
            sms.push(messaggio(`sms-firma-${p.id}`, 'sms', { ...proprietario }, {
                il: p.firma.firmataIl,
                testo: 'CRIA: il codice per firmare il contratto di servizio è ••••••. Non darlo a nessuno.',
                stato: eNumeroFisso(proprietario.telefono) ? 'non_consegnata' : 'consegnata',
                contesto: `${p.immobile.indirizzo} · firma`,
            }));
        }
    });
    autocandidature.forEach(a => (a.referenze || []).forEach(r => r.tentativi.forEach((t, i) => {
        if (t.canale !== 'sms' || !r.proprietario.telefono) return;
        sms.push(messaggio(`sms-ref-${r.id}-${i}`, 'sms', { nome: r.proprietario.nome, telefono: r.proprietario.telefono, ruolo: 'Precedente proprietario' }, {
            il: t.il,
            testo: `CRIA: ${r.inquilino} ti chiede di confermare che è stato tuo inquilino. Trovi il link nella nostra email.`,
            stato: eNumeroFisso(r.proprietario.telefono) ? 'non_consegnata' : 'consegnata',
            contesto: `Referenza per ${r.inquilino}`,
        }));
    })));

    // Le notifiche seguono le email degli stessi eventi: letta se l'email è stata aperta.
    const EVENTI_NOTIFICA = ['segnalazione_ricevuta', 'contestazione_aperta', 'contestazione_aggiornata', 'contestazione_decisa'];
    const notifiche = registro
        .filter(e => EVENTI_NOTIFICA.includes(e.modello))
        .map(e => messaggio(e.id.replace(/^em-/, 'nt-'), 'notifica', e.destinatario, {
            il: e.il,
            testo: e.oggetto,
            stato: e.stato === 'aperta' ? 'letta' : 'consegnata',
            contesto: e.contesto,
        }));

    return [...sms, ...notifiche].sort((a, b) => b.il.localeCompare(a.il));
};

// ─── Destinatari e contesti per l'invio dalla sezione ─────────────────────────
// Si scrive solo a chi ha un recapito nei dati: persone demo, parti dei
// contratti, candidati delle pratiche.
const unoPerEmail = (elenco) => [...new Map(elenco.filter(d => d.email).map(d => [d.email, d])).values()];

export const destinatariLiberi = () => unoPerEmail([
    ...PERSONE_DEMO.filter(p => !(p.aree || []).includes('admin')).map(p => ({ nome: nomeVisualizzato(p), email: p.email, telefono: p.telefono, ruolo: 'Registrato' })),
    ...CONTRATTI.flatMap(c => [
        c.locatore.personaId ? null : parte(c.locatore, `Proprietario · ${c.immobile.indirizzo}`),
        c.conduttore.personaId ? null : parte(c.conduttore, `Inquilino · ${c.immobile.indirizzo}`),
    ]).filter(Boolean),
]);

// I documenti da integrare dei proprietari, con chi li deve integrare.
export const documentiDaIntegrare = () => DOCUMENTI
    .filter(d => d.stato === 'da_integrare')
    .map(d => {
        const c = d.contrattoId ? trovaContratto(d.contrattoId) : null;
        return {
            id: d.id,
            documento: TIPO_DOCUMENTO[d.tipo] || d.nome,
            immobile: c?.immobile.indirizzo || null,
            destinatario: personaComeDestinatario(d.personaId, 'Proprietario'),
        };
    })
    .filter(x => x.destinatario);

// I proprietari con un numero fisso: gli SMS dei solleciti non arrivano.
export const proprietariConNumeroFisso = () => unoPerEmail(CONTRATTI
    .filter(c => PRODOTTI[c.prodotto]?.incassa === 'proprietario' && eNumeroFisso(c.locatore.telefono))
    .map(c => parte(c.locatore, 'Proprietario')));

// Oggetto e testo dei modelli che si mandano dalla sezione.
export const componiManuale = (modello, contesto) => {
    const d = contesto.destinatario;
    switch (modello) {
        case 'promemoria_documenti': {
            const elenco = contesto.mancanti.join('; ');
            return {
                oggetto: `Mancano ${contesto.mancanti.length} documenti per ${contesto.immobile}`,
                testo: `${saluto(d)} per completare la tua candidatura per ${contesto.immobile} mancano: ${elenco}. Li carichi dal tuo link personale, lo stesso dell’invito.`,
            };
        }
        case 'documento_da_integrare':
            return {
                oggetto: 'Un documento da integrare',
                testo: `${saluto(d)} il documento «${contesto.documento}»${contesto.immobile ? ` di ${contesto.immobile}` : ''} va integrato. Caricalo di nuovo dalla tua area, nella sezione Documenti.`,
            };
        case 'numero_cellulare':
            return {
                oggetto: 'Ci serve un numero di cellulare',
                testo: `${saluto(d)} i promemoria del ciclo mensile arrivano anche per SMS, ma il numero che abbiamo (${d.telefono}) è un fisso e lì gli SMS non arrivano. Aggiorna il numero dal profilo con un cellulare: così non perdi un promemoria.`,
            };
        default:
            return { oggetto: '', testo: '' };
    }
};
