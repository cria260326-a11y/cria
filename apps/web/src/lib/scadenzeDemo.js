import { useMemo } from 'react';
import { OGGI, CONTESTAZIONI, indirizzoCompleto } from '@/data/datiDemo';
import { PRATICHE } from '@/data/pratiche';
import { VERIFICHE, esitoEntro, nomeCandidato } from '@/data/verifiche';
import { AUTOCANDIDATURE, STATI_AUTOCANDIDATURA, STATI_REFERENZA, TENTATIVI_REFERENZA } from '@/data/autocandidature';
import { PARAMETRI, PRODOTTI, fmtEuro, nomeProdotto } from '@/data/catalogo';
import { persone } from '@/data/personeDemoIndice';
import { FUNZIONI, trovaOperatore, nomeOperatore, operatoriConFunzione } from '@/data/operatori';
import { CONTESTAZIONI_INTERNE } from '@/data/incassi';
import { FASI, CAUSALI_PROROGA, RICHIESTE_DATI, CANALE_RICHIESTA, PROROGHE, ilData, dalData, delData } from '@/data/scadenze';
import { useTutteLePratiche } from '@/lib/praticheDemo';
import { useTutteLeVerifiche } from '@/lib/verificheDemo';
import { useTutteLeAutocandidature, scadenzaReferenza } from '@/lib/autocandidatureDemo';
import { useIstruttoria } from '@/lib/istruttoriaDemo';
import { useContestazioniDemo, leggiContestazioniDemo, applicaEsitoContestazione } from '@/lib/incassiDemo';
import { useGaranzia, garanziaAttuale } from '@/lib/garanziaDemo';
import { useVersioniParametri, versioniParametri, parametriDelContratto } from '@/lib/parametriCiclo';
import {
    aggiungiGiorniLavorativi, aggiungiGiorniSolari, giorniLavorativiTra, giorniSolariTra, mancanoAlTermine, etichettaCalendario,
} from '@/lib/calendario';
import { contestazioneChiusa, etichettaStatoContestazione } from '@/lib/etichette';
import { nomeMese, meseSuccessivo } from '@/lib/formato';
import { creaStoreDemo, nuovoIdDemo } from '@/lib/storeDemo';
import { verificaAzione } from '@/lib/separazione';
import { contrattiAttuali, trovaContrattoAttuale } from '@/lib/contrattiFonte';

// ═════════════════════════════════════════════════════════════════════════════
// IL MOTORE DELLE SCADENZE NEI MOCKUP — O-18, O-19
// Le fasi si ricavano dai dati condivisi e dagli store degli altri schermi, così
// una delibera, un esito, una decisione su una contestazione o un contatto con
// l'inquilino fatti nel browser spostano subito lo stato della fase. Chi segue
// una pratica lo dice il motore di assegnazione dell'istruttoria; le fasi della
// garanzia le calcola la sua pagina. Qui c'è il resto: termine con le proroghe,
// giorni che mancano nel calendario giusto, risalita al responsabile. Le
// proroghe concesse restano in questo browser.
// Fase 4: sla_fasi aggiornate da trigger e da un job, la risalita come notifica.
// ═════════════════════════════════════════════════════════════════════════════

const MESE_CORRENTE = OGGI.slice(0, 7);
const UN_ANNO_FA = `${Number(OGGI.slice(0, 4)) - 1}${OGGI.slice(4)}`;
const PERCORSO = '/dashboard/admin/scadenze';

const unico = (funzione) => operatoriConFunzione(funzione)[0]?.id || null;
const DPO = unico('dpo');
const ADDETTI_ISTRUTTORIA = operatoriConFunzione('istruttoria').map(o => o.id);

// Chi segue una voce dell'istruttoria lo decide il suo motore di assegnazione
// (lib/istruttoriaDemo.js), per chiave 'pratica:id', 'verifica:id',
// 'autocandidatura:id'. Senza (nella lettura senza hook) si va a rotazione.
const assegnatarioIstruttoria = (chiave, assegnazioni = {}) => {
    if (assegnazioni[chiave]) return assegnazioni[chiave];
    const somma = [...String(chiave)].reduce((t, c) => t + c.charCodeAt(0), 0);
    return ADDETTI_ISTRUTTORIA[somma % ADDETTI_ISTRUTTORIA.length];
};

const sposta = (data, giorni, conteggio) =>
    (conteggio === 'lavorativi' ? aggiungiGiorniLavorativi(data, giorni) : aggiungiGiorniSolari(data, giorni));

const giorniFra = (da, a, conteggio) =>
    (conteggio === 'lavorativi' ? giorniLavorativiTra(da, a) : giorniSolariTra(da, a));

const nomePersona = (id) => persone[id] || '—';
const nomeMeseMinuscolo = (mese) => nomeMese(mese).toLowerCase();
const giornoDelMese = (mese, g) => `${mese}-${String(g).padStart(2, '0')}`;
const meseDopo = (mese, n) => {
    let m = mese;
    for (let i = 0; i < n; i += 1) m = meseSuccessivo(m);
    return m;
};

// ─── Stati ────────────────────────────────────────────────────────────────────
export const STATI_FASE = {
    in_attesa: { etichetta: 'In attesa', classe: 'bg-slate-100 text-slate-700' },
    futura: { etichetta: 'In arrivo', classe: 'bg-blue-50 text-blue-800' },
    in_corso: { etichetta: 'Nei termini', classe: 'bg-green-100 text-green-800' },
    in_scadenza: { etichetta: 'Vicina al termine', classe: 'bg-amber-100 text-amber-800' },
    scaduta: { etichetta: 'Termine superato', classe: 'bg-red-100 text-red-800' },
    sospesa: { etichetta: 'Sospesa', classe: 'bg-purple-100 text-purple-800' },
    chiusa: { etichetta: 'Chiusa', classe: 'bg-gray-100 text-gray-700' },
    conseguenza_applicata: { etichetta: 'Scaduta, conseguenza applicata', classe: 'bg-gray-100 text-gray-700' },
    non_dovuta: { etichetta: 'Non è servita', classe: 'bg-gray-100 text-gray-600' },
};

export const STATI_APERTI = ['in_attesa', 'in_corso', 'in_scadenza', 'scaduta', 'sospesa'];
const PROROGABILI = ['in_corso', 'in_scadenza', 'scaduta'];

export const GRUPPI_STATO = {
    da_seguire: { etichetta: 'Da seguire', filtro: f => STATI_APERTI.includes(f.stato) },
    risalita: { etichetta: 'In risalita', filtro: f => Boolean(f.risalita) },
    in_arrivo: { etichetta: 'In arrivo', filtro: f => f.stato === 'futura' },
    chiuse: { etichetta: 'Chiuse', filtro: f => ['chiusa', 'conseguenza_applicata', 'non_dovuta'].includes(f.stato) },
    tutte: { etichetta: 'Tutte', filtro: () => true },
};

const PESO = { scaduta: 0, in_scadenza: 1, sospesa: 2, in_corso: 3, in_attesa: 4, futura: 5, chiusa: 6, conseguenza_applicata: 6, non_dovuta: 6 };

export const ordinaFasi = (fasi) => [...fasi].sort((a, b) => {
    const p = PESO[a.stato] - PESO[b.stato];
    if (p) return p;
    if (PESO[a.stato] === 6) return (b.chiusaIl || b.termine || '').localeCompare(a.chiusaIl || a.termine || '');
    return (a.termine || a.decorrenza || '9').localeCompare(b.termine || b.decorrenza || '9');
});

// «mancano 3 giorni lavorativi», «scade oggi», «scaduta da 2 giorni»
export const testoMancano = (f) => {
    if (f.mancano == null) return '';
    const unita = (n) => etichettaCalendario(f.conteggio, n);
    if (f.mancano > 1) return `mancano ${f.mancano} ${unita(f.mancano)}`;
    if (f.mancano === 1) return `manca 1 ${unita(1)}`;
    if (f.mancano === 0) return 'scade oggi';
    return `scaduta da ${-f.mancano} ${unita(-f.mancano)}`;
};

// ─── Le fasi, dai dati ────────────────────────────────────────────────────────
// Ogni costruttore restituisce fasi «grezze»: chi, cosa, decorrenza, termine
// senza proroghe, chiusura. Il resto lo aggiunge completa().

const fasiDellePratiche = (pratiche, assegnazioni) => pratiche.flatMap(p => {
    const assegnatario = assegnatarioIstruttoria(`pratica:${p.id}`, assegnazioni);
    const c = p.candidato;
    const mancanti = (c?.documenti || []).filter(d => d.stato !== 'caricato').length;
    const decorrenza = c && mancanti === 0 ? (c.ultimoAccesso || p.apertaIl) : null;
    const conclusa = p.istruttoria?.conclusaIl || null;
    const oggetto = `${p.immobile.indirizzo}, ${p.immobile.citta}`;
    const fasi = [{
        id: `istruttoria:${p.id}`,
        tipo: 'istruttoria',
        oggetto,
        dettaglio: [nomePersona(p.personaId), nomeProdotto(p.prodotto), c ? `candidato ${c.nome}` : null].filter(Boolean).join(' · '),
        soggetto: c?.nome || null,
        assegnatario,
        decorrenza,
        termineBase: decorrenza ? sposta(decorrenza, FASI.istruttoria.durata, 'lavorativi') : null,
        chiusaIl: conclusa,
        esito: conclusa ? `Delibera ${delData(conclusa)}: ${p.istruttoria.esito || 'conclusa'}` : null,
        attesa: decorrenza ? null : !c
            ? 'Il candidato non è ancora invitato: il termine parte dal suo ultimo documento'
            : `Mancano ${mancanti} ${mancanti === 1 ? 'documento' : 'documenti'} del candidato: il termine parte dall’ultimo`,
    }];
    if (conclusa) {
        fasi.push({
            id: `cancellazione:${p.id}`,
            tipo: 'cancellazione_documenti',
            oggetto,
            dettaglio: `Candidato ${c?.nome || '—'} · delibera ${delData(conclusa)}`,
            soggetto: c?.nome || null,
            assegnatario,
            decorrenza: conclusa,
            termineBase: sposta(conclusa, FASI.cancellazione_documenti.durata, 'solari'),
            chiusaIl: p.documentiCancellatiIl || null,
            esito: p.documentiCancellatiIl ? `Cancellati ${ilData(p.documentiCancellatiIl)}` : null,
        });
    }
    return fasi;
});

// Mese in corso e mese dopo, per chi incassa da sé, con i parametri congelati
// sul contratto alla firma.
const testoRisposta = (m) => {
    const il = ilData(m.segnalazione.il);
    if (m.segnalazione.tipo === 'pagato') return `Pagato, segnalato ${il}`;
    switch (m.copertura) {
        case 'attiva': return `Non pagato, segnalato ${il}: entro la finestra, copertura attiva`;
        case 'decaduta_tardiva': return `Non pagato, segnalato ${il}: dopo la finestra, copertura decaduta`;
        case 'in_franchigia': return `Non pagato, segnalato ${il}: mese in franchigia`;
        default: return `Non pagato, segnalato ${il}: senza garanzia, conta per il semaforo`;
    }
};

const fasiDelleSegnalazioni = (versioniParametri) => {
    const addetto = unico('incassi');
    return contrattiAttuali().filter(c => PRODOTTI[c.prodotto]?.incassa === 'proprietario').flatMap(c => {
        const par = parametriDelContratto(c, versioniParametri);
        return [MESE_CORRENTE, meseSuccessivo(MESE_CORRENTE)].map(mese => {
            const m = c.mesi.find(x => x.mese === mese);
            const inFranchigia = par.garanzia && mese < meseDopo(c.attivoDal, par.franchigia || 0);
            const coperto = par.garanzia && !inFranchigia;
            const risposta = m && m.segnalazione.fonte !== 'automatica' ? m.segnalazione : null;
            const giorno = (g) => giornoDelMese(mese, g);
            return {
                id: `segnalazione:${c.id}:${mese}`,
                tipo: 'segnalazione_mese',
                titolo: `Segnalazione di ${nomeMeseMinuscolo(mese)}`,
                oggetto: indirizzoCompleto(c),
                dettaglio: `${c.locatore.nome} · ${nomeProdotto(c.prodotto)} · parametri v${par.versione}`,
                assegnatario: addetto,
                contrattoId: c.id,
                decorrenza: giorno(par.scadenza),
                termineBase: giorno(par.chiusura),
                tappa: coperto ? { etichetta: 'Copertura se segnala entro', data: giorno(par.ultimoGiornoUtile) } : null,
                conseguenza: coperto
                    ? `Dopo ${ilData(giorno(par.ultimoGiornoUtile))} la copertura del mese decade; senza risposta entro ${ilData(giorno(par.chiusura))} il mese è non rilevato: fuori dal semaforo e senza copertura`
                    : `Senza risposta entro ${ilData(giorno(par.chiusura))} il mese è non rilevato e non conta nel semaforo`,
                chiusaIl: risposta?.il || null,
                esito: risposta ? testoRisposta(m) : null,
                seScade: `Nessuna risposta: ${dalData(giorno(par.chiusura + 1))} il mese è non rilevato${par.garanzia ? ', fuori dal semaforo e senza copertura' : ' e non conta nel semaforo'}`,
            };
        });
    });
};

// Le segnalazioni di mancato pagamento dell'ultimo mese: l'inquilino ha la
// sua finestra per contestare.
const fasiDelleFinestre = () => {
    const addetto = unico('assistenza');
    return contrattiAttuali().flatMap(c => c.mesi
        .filter(m => m.segnalazione.tipo === 'non_pagato' && giorniSolariTra(m.segnalazione.il, OGGI) <= 30)
        .map(m => {
            const k = m.contestazioneId ? CONTESTAZIONI.find(x => x.id === m.contestazioneId) : null;
            return {
                id: `finestra:${c.id}:${m.mese}`,
                tipo: 'finestra_contestazione',
                titolo: `Finestra di contestazione · ${nomeMeseMinuscolo(m.mese)}`,
                oggetto: indirizzoCompleto(c),
                dettaglio: `${c.conduttore.nome} · segnalazione ${delData(m.segnalazione.il)}`,
                soggetto: c.conduttore.nome,
                assegnatario: addetto,
                contrattoId: c.id,
                decorrenza: m.segnalazione.il,
                termineBase: m.scadenzaContestazione || aggiungiGiorniSolari(m.segnalazione.il, PARAMETRI.giorniContestazione),
                chiusaIl: k?.apertaIl || null,
                esito: k ? `Contestata ${ilData(k.apertaIl)}` : null,
                seScade: 'Non contestata: la segnalazione resta e il mese conta nel semaforo',
            };
        }));
};

// Le contestazioni con le decisioni prese nella loro coda (O-10): risposta
// entro il termine del contratto, poi, se accolta, la seconda firma della
// rettifica entro il termine interno dalla prima.
const fasiDelleContestazioni = (statoContestazioni) => CONTESTAZIONI.flatMap(originale => {
    const k = applicaEsitoContestazione(originale, statoContestazioni);
    const c = trovaContrattoAttuale(k.contrattoId);
    const locale = statoContestazioni[k.id] || {};
    const interna = CONTESTAZIONI_INTERNE[k.id] || {};
    const assegnatario = locale.assegnataA || interna.assegnataA || unico('assistenza');
    const chiusa = contestazioneChiusa(k.stato);
    const base = { oggetto: indirizzoCompleto(c), soggetto: c.conduttore.nome, assegnatario, contrattoId: c.id };
    const fasi = [{
        ...base,
        id: `contestazione:${k.id}`,
        tipo: 'risposta_contestazione',
        dettaglio: `${c.conduttore.nome} contesta ${nomeMeseMinuscolo(k.mese)} · segnalazione ${delData(k.segnalazione.il)}`,
        decorrenza: k.apertaIl,
        termineBase: k.rispostaEntro,
        chiusaIl: chiusa ? k.chiusaIl : null,
        esito: chiusa ? `Decisa ${ilData(k.chiusaIl)}: ${etichettaStatoContestazione(k.stato).toLowerCase()}` : null,
    }];
    const rettifica = locale.rettifica !== undefined ? locale.rettifica : interna.rettifica || null;
    if (rettifica?.primaFirma) {
        fasi.push({
            ...base,
            id: `rettifica:${k.id}`,
            tipo: 'rettifica',
            dettaglio: `${nomeMese(k.mese)} · prima firma di ${nomeOperatore(rettifica.primaFirma.da)} ${ilData(rettifica.primaFirma.il)}`,
            decorrenza: rettifica.primaFirma.il,
            termineBase: sposta(rettifica.primaFirma.il, FASI.rettifica.durata, 'lavorativi'),
            chiusaIl: rettifica.secondaFirma?.il || null,
            esito: rettifica.secondaFirma ? `Seconda firma di ${nomeOperatore(rettifica.secondaFirma.da)} ${ilData(rettifica.secondaFirma.il)}: il mese è rettificato` : null,
        });
    }
    return fasi;
});

// Le fasi della garanzia come le calcola la sua pagina (lib/garanziaDemo.js),
// più le rate dei piani in corso, che sono termini dell'inquilino.
const ESITO_GARANZIA = {
    primo_contatto: 'Inquilino raggiunto',
    proposta_piano: 'Piano proposto',
    decisione_piano: 'Piano deciso',
    decisione_legale: 'Passaggio al legale deciso',
    disposizione_indennizzo: 'Indennizzo disposto',
    autorizzazione: 'Pagamento autorizzato',
    pagamento_indennizzo: 'Indennizzo accreditato',
};

const chiSegue = (f, p, indennizzo) => {
    if (f.chiave === 'primo_contatto' || f.chiave === 'proposta_piano') return p?.gestoreId || unico('gestore_pratica');
    if (f.chiave === 'disposizione_indennizzo') return indennizzo?.dispostoDa || unico('indennizzi');
    if (f.chiave === 'pagamento_indennizzo') return indennizzo?.eseguitoDa || unico('tesoreria');
    return unico(FASI[f.chiave].funzione);
};

const fasiDellaGaranzia = (garanzia) => {
    if (!garanzia) return [];
    const pratiche = Object.fromEntries(garanzia.pratiche.map(p => [p.id, p]));
    const indennizzi = Object.fromEntries((garanzia.indennizzi || []).map(i => [i.id, i]));
    const fasi = garanzia.fasi.filter(f => FASI[f.chiave]).map(f => {
        const p = pratiche[f.praticaId] || null;
        const c = p?.contratto || null;
        return {
            id: `garanzia:${f.id}`,
            tipo: f.chiave,
            oggetto: c ? indirizzoCompleto(c) : '—',
            dettaglio: c ? `${c.conduttore.nome} · ${p.mesi.map(nomeMeseMinuscolo).join(', ')}` : '',
            soggetto: c?.conduttore.nome || null,
            assegnatario: chiSegue(f, p, indennizzi[f.indennizzoId]),
            contrattoId: c?.id || null,
            decorrenza: f.decorrenza,
            termineBase: f.termine,
            chiusaIl: f.chiusaIl || null,
            nonDovuta: f.stato === 'non_dovuta',
            esito: f.chiusaIl ? `${ESITO_GARANZIA[f.chiave]} ${ilData(f.chiusaIl)}` : 'La pratica si è chiusa prima',
        };
    });
    const rate = garanzia.pratiche
        .filter(p => ['in_corso', 'completato'].includes(p.pianoAttivo?.stato))
        .flatMap(p => p.pianoAttivo.rate.map((r, i, tutte) => ({
            id: `rata:${p.pianoAttivo.id}:${r.n}`,
            tipo: 'rata_piano',
            titolo: `Rata ${r.n} di ${tutte.length} del piano di rientro`,
            oggetto: indirizzoCompleto(p.contratto),
            dettaglio: `${p.contratto.conduttore.nome} · ${fmtEuro(r.importo)}`,
            soggetto: p.contratto.conduttore.nome,
            assegnatario: p.gestoreId || unico('gestore_pratica'),
            contrattoId: p.contratto.id,
            decorrenza: i === 0 ? (p.pianoAttivo.accettatoIl || p.apertaIl) : tutte[i - 1].scadenza,
            termineBase: r.scadenza,
            chiusaIl: r.pagataIl || null,
            esito: r.pagataIl ? `Pagata ${ilData(r.pagataIl)}` : null,
        })));
    return [...fasi, ...rate];
};

// Del candidato si vede il nome con l'iniziale: l'esito qui non serve.
const fasiDelleVerifiche = (verifiche, assegnazioni) => verifiche.map(v => ({
    id: `verifica:${v.id}`,
    tipo: 'esito_verifica',
    oggetto: `Candidato ${nomeCandidato(v.soggetto)}`,
    dettaglio: `Chiesta da ${nomePersona(v.personaId)} ${ilData(v.richiestaIl)}`,
    soggetto: nomeCandidato(v.soggetto),
    assegnatario: assegnatarioIstruttoria(`verifica:${v.id}`, assegnazioni),
    decorrenza: v.richiestaIl,
    termineBase: esitoEntro(v),
    chiusaIl: v.esito?.il || null,
    esito: v.esito ? `Esito dato ${ilData(v.esito.il)}` : null,
}));

const fasiDelleAutocandidature = (autocandidature, assegnazioni) => autocandidature.flatMap(a => {
    const assegnatario = assegnatarioIstruttoria(`autocandidatura:${a.id}`, assegnazioni);
    const chi = nomePersona(a.personaId);
    const referenze = (a.referenze || []).map(r => {
        const chiusa = r.stato === 'non_riscontrata' ? (r.chiusaIl || scadenzaReferenza(r))
            : r.stato !== 'in_attesa' ? (r.risposta?.il || null) : null;
        return {
            id: `referenza:${a.id}:${r.id}`,
            tipo: 'referenza_p7',
            oggetto: `Autocandidatura di ${chi}`,
            dettaglio: `${r.proprietario.nome} · ${r.immobile}`,
            soggetto: chi,
            assegnatario,
            decorrenza: r.richiestaIl,
            termineBase: scadenzaReferenza(r),
            chiusaIl: chiusa,
            esito: chiusa ? STATI_REFERENZA[r.stato]?.etichetta : null,
            nota: `Tentativi di contatto: ${r.tentativi.length} di ${TENTATIVI_REFERENZA}`,
            seScade: 'Referenza richiesta, non riscontrata: il certificato esce e lo dichiara',
        };
    });
    if (!a.inviataIl) return referenze;
    return [...referenze, {
        id: `istruttoria-p7:${a.id}`,
        tipo: 'istruttoria_p7',
        oggetto: `Autocandidatura di ${chi}`,
        dettaglio: `${(a.prove || []).length} prove caricate${a.sottoMinimo ? ' · sotto il minimo' : ''}`,
        soggetto: chi,
        assegnatario,
        decorrenza: a.inviataIl,
        termineBase: sposta(a.inviataIl, FASI.istruttoria_p7.durata, 'lavorativi'),
        chiusaIl: a.conclusaIl || null,
        esito: a.conclusaIl ? `${STATI_AUTOCANDIDATURA[a.stato]?.etichetta || 'Conclusa'} ${ilData(a.conclusaIl)}` : null,
    }];
});

const fasiDelleRichiesteDati = () => {
    const addetto = unico('assistenza');
    return RICHIESTE_DATI.map(r => {
        const c = trovaContrattoAttuale(r.interessato.contrattoId);
        return {
            id: `dati:${r.id}`,
            tipo: 'accesso_dati',
            oggetto: r.codice,
            riferimento: r.codice,
            dettaglio: `${r.interessato.nome}, ${r.interessato.ruolo} di ${c.immobile.indirizzo} · arrivata ${CANALE_RICHIESTA[r.canale]}`,
            soggetto: r.interessato.nome,
            assegnatario: addetto,
            decorrenza: r.ricevutaIl,
            termineBase: sposta(r.ricevutaIl, FASI.accesso_dati.durata, 'solari'),
            chiusaIl: r.evasaIl,
            esito: r.evasaIl ? `Evasa ${ilData(r.evasaIl)}` : null,
        };
    });
};

// ─── Termine, stato e risalita ────────────────────────────────────────────────
const completa = (grezza, proroghe, oggi) => {
    const def = FASI[grezza.tipo];
    const { conteggio } = def;
    const sue = proroghe.filter(p => p.faseId === grezza.id).sort((a, b) => a.concessaIl.localeCompare(b.concessaIl));

    let termine = grezza.termineBase;
    let sospesa = null;
    sue.forEach(p => {
        if (!termine) return;
        if (p.sospende) {
            if (p.ripresaIl) termine = sposta(termine, Math.max(0, giorniFra(p.concessaIl, p.ripresaIl, conteggio)), conteggio);
            else sospesa = p;
        } else if (p.giorni) {
            termine = sposta(termine, p.giorni, conteggio);
        }
    });

    let stato;
    let mancano = null;
    if (grezza.nonDovuta) stato = 'non_dovuta';
    else if (grezza.chiusaIl) stato = 'chiusa';
    else if (!grezza.decorrenza) stato = 'in_attesa';
    else if (grezza.decorrenza > oggi) stato = 'futura';
    else if (sospesa) stato = 'sospesa';
    else {
        mancano = mancanoAlTermine(oggi, termine, conteggio);
        if (mancano < 0) stato = def.automatica ? 'conseguenza_applicata' : 'scaduta';
        else stato = mancano <= def.soglia ? 'in_scadenza' : 'in_corso';
    }

    // Sale al responsabile di chi segue la fase, e per il GDPR anche al DPO.
    // Solo le fasi di CRIA: quelle del cliente hanno la loro conseguenza.
    const diCria = def.chi === 'cria';
    const responsabile = trovaOperatore(grezza.assegnatario)?.responsabile || null;
    const inizio = termine && grezza.decorrenza ? sposta(termine, -def.soglia, conteggio) : null;
    const salita = diCria && inizio ? {
        a: responsabile,
        anche: def.dpo && DPO ? [DPO] : [],
        dal: inizio < grezza.decorrenza ? grezza.decorrenza : inizio,
    } : null;

    return {
        ...grezza,
        etichetta: def.etichetta,
        titolo: grezza.titolo || def.etichetta,
        calendario: def.calendario,
        chi: def.chi,
        funzione: def.funzione,
        conteggio,
        fonteDurata: def.fonteDurata,
        soglia: def.soglia,
        automatica: Boolean(def.automatica),
        proroga: def.proroga,
        causali: def.causali || [],
        senzaProroga: def.senzaProroga || null,
        dpo: Boolean(def.dpo),
        regolaDecorrenza: def.decorrenza,
        conseguenza: grezza.conseguenza || def.conseguenza,
        percorso: grezza.percorso ?? def.percorso,
        termine,
        proroghe: sue,
        prorogata: Boolean(termine && termine !== grezza.termineBase),
        conProrogaFuoriLista: sue.some(p => p.fuoriLista),
        sospesa,
        stato,
        mancano,
        nelTermine: stato === 'chiusa' ? !termine || grezza.chiusaIl <= termine : null,
        esito: stato === 'conseguenza_applicata' ? grezza.seScade || grezza.esito : stato === 'non_dovuta' || grezza.chiusaIl ? grezza.esito : null,
        risalita: salita && (stato === 'in_scadenza' || stato === 'scaduta') ? salita : null,
        prossimaRisalita: salita && stato === 'in_corso' ? salita : null,
    };
};

/**
 * Tutte le fasi, dai dati condivisi e dagli store del browser.
 *   assegnazioni          { 'pratica:id': operatoreId, … } dal motore dell'istruttoria
 *   statoContestazioni    lo store delle contestazioni (O-10)
 *   garanzia              { pratiche, fasi, indennizzi } dalla pagina della garanzia
 */
export const calcolaFasi = ({
    pratiche, verifiche, autocandidature, proroghe, versioniParametri,
    assegnazioni = {}, statoContestazioni = {}, garanzia = null, oggi = OGGI,
}) => ordinaFasi([
    ...fasiDellePratiche(pratiche, assegnazioni),
    ...fasiDelleSegnalazioni(versioniParametri),
    ...fasiDelleFinestre(),
    ...fasiDelleContestazioni(statoContestazioni),
    ...fasiDellaGaranzia(garanzia),
    ...fasiDelleVerifiche(verifiche, assegnazioni),
    ...fasiDelleAutocandidature(autocandidature, assegnazioni),
    ...fasiDelleRichiesteDati(),
].map(f => completa(f, proroghe, oggi)));

// Le fasi di una persona: quelle che segue, e quelle salite a lei.
export const fasiDi = (fasi, operatoreId) => fasi.filter(f =>
    f.assegnatario === operatoreId || f.risalita?.a === operatoreId || f.risalita?.anche.includes(operatoreId));

// ─── Proroghe ─────────────────────────────────────────────────────────────────
const store = creaStoreDemo('criaScadenzeDemo', () => ({ proroghe: [] }));

export const ripristinaScadenzeDemo = () => store.ripristina();

const tutteLeProroghe = (s = store.leggi()) => [...PROROGHE, ...(s.proroghe || [])];

export const useProroghe = () => {
    const s = store.useStore();
    return useMemo(() => tutteLeProroghe(s), [s]);
};

// La motivazione scritta di una proroga fuori lista: almeno una frase vera.
export const MINIMO_MOTIVAZIONE = 30;
export const MASSIMO_GIORNI_FUORI_LISTA = 30;

// La proroga in lista la concede chi segue la fase per funzione, il
// responsabile di chi ce l'ha in carico o il responsabile operativo.
export const puoProrogareInLista = (operatoreId, fase) => {
    const op = trovaOperatore(operatoreId);
    const responsabile = trovaOperatore(fase.assegnatario)?.responsabile;
    if (op && (op.funzione === fase.funzione || op.id === responsabile || ['responsabile_operativo', 'admin'].includes(op.funzione))) {
        return { consentito: true, motivo: null };
    }
    return {
        consentito: false,
        motivo: `La proroga in lista spetta a chi segue la fase (${FUNZIONI[fase.funzione].etichetta.toLowerCase()}) o al suo responsabile, ${nomeOperatore(responsabile)}.`,
    };
};

export const usiDellaCausale = (fase, causale) => fase.proroghe.filter(p => p.causale === causale).length;

// Il termine che avrebbe la fase con qualche giorno in più, nel suo calendario.
export const anteprimaTermine = (fase, giorni) => (fase.termine ? sposta(fase.termine, giorni, fase.conteggio) : null);

const aggiungiProroga = (record) => {
    store.aggiorna(s => ({ ...s, proroghe: [...(s.proroghe || []), record] }));
    return { ok: true, proroga: record };
};

/** @returns {{ ok: boolean, errore?: string }} */
export const concediProroga = (fase, causale, operatoreId) => {
    const c = CAUSALI_PROROGA[causale];
    if (!c || fase.proroga !== 'lista' || !fase.causali.includes(causale)) return { ok: false, errore: 'Questa causale non vale per questa fase' };
    if (!PROROGABILI.includes(fase.stato)) return { ok: false, errore: 'La fase non è aperta' };
    const permesso = puoProrogareInLista(operatoreId, fase);
    if (!permesso.consentito) return { ok: false, errore: permesso.motivo };
    if (usiDellaCausale(fase, causale) >= c.tetto) return { ok: false, errore: 'Tetto raggiunto: ora proroga solo un responsabile, fuori lista' };
    return aggiungiProroga({
        id: nuovoIdDemo('prg'),
        faseId: fase.id,
        tipoFase: fase.tipo,
        causale,
        fuoriLista: false,
        giorni: c.giorni || null,
        sospende: Boolean(c.sospende),
        concessaDa: operatoreId,
        concessaIl: OGGI,
        ripresaIl: null,
    });
};

/** @returns {{ ok: boolean, errore?: string }} */
export const concediProrogaFuoriLista = (fase, { giorni, motivazione }, operatoreId) => {
    if (fase.proroga === 'mai') return { ok: false, errore: fase.senzaProroga };
    if (!PROROGABILI.includes(fase.stato)) return { ok: false, errore: 'La fase non è aperta' };
    const permesso = verificaAzione('proroga_fuori_lista', { operatoreId });
    if (!permesso.consentito) return { ok: false, errore: permesso.motivo };
    const n = Number(giorni);
    if (!Number.isInteger(n) || n < 1 || n > MASSIMO_GIORNI_FUORI_LISTA) return { ok: false, errore: `Da 1 a ${MASSIMO_GIORNI_FUORI_LISTA} giorni` };
    const testo = String(motivazione || '').trim();
    if (testo.length < MINIMO_MOTIVAZIONE) return { ok: false, errore: 'Scrivi il motivo per esteso: la proroga fuori lista si concede per iscritto' };
    return aggiungiProroga({
        id: nuovoIdDemo('prg'),
        faseId: fase.id,
        tipoFase: fase.tipo,
        causale: null,
        fuoriLista: true,
        giorni: n,
        sospende: false,
        motivazione: testo,
        concessaDa: operatoreId,
        concessaIl: OGGI,
    });
};

// Il contenzioso si è chiuso: il termine riparte e si allunga dei giorni di sospensione.
export const riprendiTermine = (fase, operatoreId) => {
    const p = fase.sospesa;
    if (!p || !puoProrogareInLista(operatoreId, fase).consentito) return false;
    store.aggiorna(s => ({
        ...s,
        proroghe: (s.proroghe || []).map(x => (x.id === p.id ? { ...x, ripresaIl: OGGI, ripresaDa: operatoreId } : x)),
    }));
    return true;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useFasi = () => {
    const pratiche = useTutteLePratiche();
    const verifiche = useTutteLeVerifiche();
    const autocandidature = useTutteLeAutocandidature();
    const proroghe = useProroghe();
    const versioniDeiParametri = useVersioniParametri();
    const { voci } = useIstruttoria();
    const statoContestazioni = useContestazioniDemo();
    const garanzia = useGaranzia();
    const assegnazioni = useMemo(
        () => Object.fromEntries(voci.filter(v => v.assegnazione?.operatoreId).map(v => [v.chiave, v.assegnazione.operatoreId])),
        [voci],
    );
    return useMemo(
        () => calcolaFasi({ pratiche, verifiche, autocandidature, proroghe, versioniParametri: versioniDeiParametri, assegnazioni, statoContestazioni, garanzia }),
        [pratiche, verifiche, autocandidature, proroghe, versioniDeiParametri, assegnazioni, statoContestazioni, garanzia],
    );
};

// ─── Indicatori ───────────────────────────────────────────────────────────────
// La percentuale di fasi chiuse nel termine va nel rendiconto al riassicuratore
// (§13.6). Contano solo le fasi di CRIA; una fase scaduta e ancora aperta conta
// come fuori termine. Il termine è quello con le proroghe: quante stanno nel
// termine solo grazie a una proroga fuori lista si dice a parte.
export const riepilogoFasiChiuse = (fasi, { dal, al } = {}) => {
    const entro = (d) => Boolean(d) && (!dal || d >= dal) && (!al || d <= al);
    const diCria = fasi.filter(f => f.chi === 'cria');
    const chiuse = diCria.filter(f => f.stato === 'chiusa' && entro(f.chiusaIl));
    const scaduteAperte = diCria.filter(f => f.stato === 'scaduta' && entro(f.termine));
    const nelTermine = chiuse.filter(f => f.nelTermine);
    const totale = chiuse.length + scaduteAperte.length;
    return {
        totale,
        nelTermine: nelTermine.length,
        fuoriTermine: totale - nelTermine.length,
        scaduteAperte: scaduteAperte.length,
        conProrogaFuoriLista: nelTermine.filter(f => f.conProrogaFuoriLista).length,
        percentuale: totale ? Math.round((nelTermine.length / totale) * 100) : null,
    };
};

// Senza hook: legge gli store come sono adesso nel browser. Gli store dei lotti
// precedenti hanno tutti la forma { nuove, modifiche }. Le fasi della garanzia
// si calcolano solo nella sua pagina, con un hook: qui mancano.
const leggiJson = (chiave) => {
    try {
        return JSON.parse(localStorage.getItem(chiave)) || {};
    } catch {
        return {};
    }
};

const conModifiche = (base, s) => [...(Array.isArray(s.nuove) ? s.nuove : []), ...base]
    .map(x => ({ ...x, ...((s.modifiche || {})[x.id] || {}) }));

export const fasiAttuali = () => calcolaFasi({
    pratiche: conModifiche(PRATICHE, leggiJson('criaPraticheDemo')),
    verifiche: conModifiche(VERIFICHE, leggiJson('criaVerificheDemo')),
    autocandidature: conModifiche(AUTOCANDIDATURE, leggiJson('criaAutocandidatureDemo')).map(a => ({ prove: [], referenze: [], ...a })),
    proroghe: tutteLeProroghe(),
    versioniParametri: versioniParametri(),
    statoContestazioni: leggiContestazioniDemo(),
    garanzia: garanziaAttuale(),
});

/**
 * Per la direzione (O-01, O-30): quante fasi di CRIA si chiudono nel termine.
 *   fasi      quelle di useFasi(); se mancano si leggono gli store da qui,
 *             garanzia compresa
 *   dal, al   'AAAA-MM-GG', facoltativi: senza, tutto lo storico
 * riepilogoFasiChiuseNelTermine restituisce il dettaglio, la percentuale è un
 * intero da 0 a 100, o null se non c'è ancora niente da contare.
 */
export const riepilogoFasiChiuseNelTermine = ({ fasi, dal, al } = {}) => riepilogoFasiChiuse(fasi || fasiAttuali(), { dal, al });
export const percentualeFasiChiuseNelTermine = (opzioni) => riepilogoFasiChiuseNelTermine(opzioni).percentuale;

// Il cruscotto del mese: fasi chiuse, proroghe in lista per causale, e quelle
// fuori lista una per una, con il nome di chi le ha concesse.
export const cruscottoDelMese = (fasi, proroghe, mese = MESE_CORRENTE) => {
    const nelMese = (d) => Boolean(d) && d.slice(0, 7) === mese;
    const chiuse = riepilogoFasiChiuse(fasi, { dal: `${mese}-01`, al: `${mese}-31` });
    const delMese = proroghe.filter(p => nelMese(p.concessaIl));
    const perCausale = Object.entries(delMese.filter(p => !p.fuoriLista).reduce((t, p) => ({ ...t, [p.causale]: (t[p.causale] || 0) + 1 }), {}))
        .map(([causale, n]) => ({ causale, etichetta: CAUSALI_PROROGA[causale]?.etichetta || causale, n }));
    const fuoriLista = delMese.filter(p => p.fuoriLista)
        .map(p => ({ proroga: p, fase: fasi.find(f => f.id === p.faseId) || null }))
        .sort((a, b) => b.proroga.concessaIl.localeCompare(a.proroga.concessaIl));
    return { mese, chiuse, inLista: perCausale, totaleInLista: delMese.length - fuoriLista.length, fuoriLista };
};

// ─── Il riepilogo per la panoramica per funzione (O-01) ───────────────────────
// Un array di voci { chiave, funzione, etichetta, valore, urgenti, nota,
// percorso, perOperatore, urgentiPerOperatore }. valore e perOperatore
// contano la stessa cosa; urgenti sono le fasi scadute o in risalita, secondo
// la voce, e urgentiPerOperatore dice di chi sono.
// Una voce che più funzioni vedono ma una sola lavora porta gestitaDa: la
// funzione che se ne occupa (le altre la seguono).
// etichettaPerAltri, quando c'è, è il nome della voce per chi non è di
// quella funzione («Fasi salite a te» per il responsabile, «al responsabile»
// per l'admin).
const FUNZIONI_CON_FASI = [...new Set(Object.values(FASI).map(d => d.funzione))];
const RESPONSABILI_DI_RISALITA = ['responsabile_operativo', 'resp_amministrativo', 'resp_legale'];

const conta = (fasi, chi) => Object.fromEntries(chi.map(id => [id, fasi.filter(f => f.assegnatario === id).length]));

const breve = (f) => `${f.titolo} · ${f.oggetto}`;

const costruisciRiepilogo = ({ fasi, proroghe }) => {
    const voci = [];

    FUNZIONI_CON_FASI.forEach(funzione => {
        const sue = fasi.filter(f => f.funzione === funzione);
        const vicine = sue.filter(f => (f.stato === 'in_corso' || f.stato === 'in_scadenza') && f.mancano <= 2);
        const scadute = sue.filter(f => f.stato === 'scaduta');
        const prima = ordinaFasi([...scadute, ...vicine])[0];
        voci.push({
            chiave: 'scadenze_vicine',
            funzione,
            etichetta: 'Termini nei prossimi 2 giorni',
            valore: vicine.length,
            urgenti: scadute.length,
            nota: prima ? `Il primo: ${breve(prima)}, ${prima.stato === 'scaduta' ? testoMancano(prima) : `entro ${ilData(prima.termine)}`}` : 'Nessun termine vicino',
            percorso: `${PERCORSO}?funzione=${funzione}`,
            perOperatore: conta(vicine, operatoriConFunzione(funzione).map(o => o.id)),
            urgentiPerOperatore: conta(scadute, operatoriConFunzione(funzione).map(o => o.id)),
        });
    });

    const salite = fasi.filter(f => f.risalita);
    [...RESPONSABILI_DI_RISALITA, 'dpo'].forEach(funzione => {
        const chi = operatoriConFunzione(funzione).map(o => o.id);
        const loro = salite.filter(f => chi.includes(f.risalita.a) || f.risalita.anche.some(id => chi.includes(id)));
        voci.push({
            chiave: 'fasi_in_risalita',
            funzione,
            etichetta: funzione === 'dpo' ? 'Fasi salite anche al DPO' : 'Fasi salite a te',
            etichettaPerAltri: funzione === 'dpo' ? undefined : 'Fasi salite al responsabile',
            valore: loro.length,
            urgenti: loro.filter(f => f.stato === 'scaduta').length,
            nota: loro.length ? loro.slice(0, 2).map(breve).join('; ') : 'Nessuna fase in risalita',
            percorso: `${PERCORSO}?stato=risalita`,
            perOperatore: Object.fromEntries(chi.map(id => [id, loro.filter(f => f.risalita.a === id || f.risalita.anche.includes(id)).length])),
            urgentiPerOperatore: Object.fromEntries(chi.map(id => [id, loro.filter(f => f.stato === 'scaduta' && (f.risalita.a === id || f.risalita.anche.includes(id))).length])),
        });
    });

    const fuoriLista = proroghe.filter(p => p.fuoriLista && p.concessaIl.slice(0, 7) === MESE_CORRENTE);
    const perChi = fuoriLista.reduce((t, p) => ({ ...t, [p.concessaDa]: (t[p.concessaDa] || 0) + 1 }), {});
    ['responsabile_operativo', 'direzione'].forEach(funzione => voci.push({
        chiave: 'proroghe_fuori_lista',
        funzione,
        etichetta: `Proroghe fuori lista di ${nomeMeseMinuscolo(MESE_CORRENTE)}`,
        valore: fuoriLista.length,
        urgenti: 0,
        nota: fuoriLista.length
            ? `Concesse da ${Object.entries(perChi).map(([id, n]) => `${nomeOperatore(id)} (${n})`).join(', ')}`
            : 'Nessuna proroga fuori lista',
        percorso: `${PERCORSO}#cruscotto`,
        perOperatore: perChi,
    }));

    const richieste = fasi.filter(f => f.tipo === 'accesso_dati' && STATI_APERTI.includes(f.stato));
    const assistenza = operatoriConFunzione('assistenza').map(o => o.id);
    ['assistenza', 'responsabile_operativo', 'dpo'].forEach(funzione => voci.push({
        chiave: 'accesso_dati',
        funzione,
        gestitaDa: 'assistenza',
        etichetta: 'Richieste di accesso ai dati aperte',
        valore: richieste.length,
        urgenti: richieste.filter(f => f.risalita).length,
        nota: richieste.length ? richieste.map(f => `${f.riferimento}: ${testoMancano(f)}`).join(' · ') : 'Nessuna richiesta aperta',
        percorso: `${PERCORSO}?calendario=dati_personali`,
        perOperatore: conta(richieste, assistenza),
        urgentiPerOperatore: conta(richieste.filter(f => f.risalita), assistenza),
        elenco: richieste.map(f => ({ codice: f.riferimento, termine: f.termine, mancano: f.mancano })),
    }));

    const cancellazioni = fasi.filter(f => f.tipo === 'cancellazione_documenti' && STATI_APERTI.includes(f.stato));
    const primaCancellazione = ordinaFasi(cancellazioni)[0];
    voci.push({
        chiave: 'cancellazioni_documenti',
        funzione: 'dpo',
        etichetta: 'Documenti dei candidati da cancellare',
        valore: cancellazioni.length,
        urgenti: cancellazioni.filter(f => f.risalita).length,
        nota: primaCancellazione ? `La prima entro ${ilData(primaCancellazione.termine)}` : 'Niente da cancellare',
        percorso: `${PERCORSO}?calendario=dati_personali`,
        perOperatore: {},
    });

    // Una misura, non una coda (tipo 'indicatore'). Chiave diversa da
    // 'fasi_nel_termine' della garanzia, che conta solo morosità e indennizzi
    // (quella del rendiconto al riassicuratore): qui ci sono tutte le fasi di
    // CRIA del motore, sugli stessi ultimi 12 mesi.
    const nelTermine = riepilogoFasiChiuse(fasi, { dal: UN_ANNO_FA, al: OGGI });
    voci.push({
        chiave: 'termini_rispettati',
        funzione: 'direzione',
        tipo: 'indicatore',
        unita: '%',
        etichetta: 'Fasi chiuse nel termine, tutte le funzioni',
        valore: nelTermine.percentuale,
        testo: nelTermine.percentuale == null ? '—' : `${nelTermine.percentuale}%`,
        urgenti: 0,
        nota: nelTermine.totale
            ? [
                `${nelTermine.nelTermine} su ${nelTermine.totale}, ultimi 12 mesi`,
                nelTermine.scaduteAperte ? `${nelTermine.scaduteAperte} ancora aperte oltre il termine` : null,
                nelTermine.conProrogaFuoriLista ? `${nelTermine.conProrogaFuoriLista} nel termine grazie a una proroga fuori lista` : null,
            ].filter(Boolean).join(' · ')
            : 'Ancora nessuna fase chiusa',
        percorso: `${PERCORSO}#cruscotto`,
        perOperatore: {},
    });

    return voci;
};

export const useRiepilogoScadenze = () => {
    const fasi = useFasi();
    const proroghe = useProroghe();
    return useMemo(() => costruisciRiepilogo({ fasi, proroghe }), [fasi, proroghe]);
};
