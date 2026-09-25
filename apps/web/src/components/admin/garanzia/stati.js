import { Banknote, HandCoins, Percent } from 'lucide-react';
import { OGGI } from '@/data/datiDemo';
import { trovaPersonaDemo } from '@/data/personeDemo';
import { nomeOperatore } from '@/data/operatori';
import { fmtEuro } from '@/data/catalogo';
import { GIORNI_TOLLERANZA_RATA } from '@/data/garanzia';
import { nomeMese } from '@/lib/formato';
import { aggiungiGiorniSolari, etichettaCalendario, giorniSolariTra } from '@/lib/calendario';
import { dalGiorno, ilGiorno } from '@/lib/garanziaDemo';

// Etichette e colori degli stati della garanzia: un posto solo per le quattro
// schermate (O-13, O-14/O-15, O-17, O-20).

const neutro = 'bg-gray-100 text-gray-700';

export const STATO_PRATICA = {
    aperta: { etichetta: 'Aperta', classe: 'bg-red-100 text-red-800' },
    piano_proposto: { etichetta: 'Piano da approvare', classe: 'bg-blue-100 text-blue-800' },
    piano_approvato: { etichetta: 'Piano approvato', classe: 'bg-blue-100 text-blue-800' },
    piano_in_corso: { etichetta: 'Piano di rientro in corso', classe: 'bg-amber-100 text-amber-800' },
    al_legale: { etichetta: 'Al legale', classe: 'bg-purple-100 text-purple-800' },
    chiusa: { etichetta: 'Chiusa', classe: neutro },
};

export const ESITO_PRATICA = {
    pagato: 'canone pagato al proprietario dopo la chiusura del mese',
    rientrata: 'rientrata con il piano',
};

export const STATO_PIANO = {
    proposto: { etichetta: 'In attesa di decisione', classe: 'bg-blue-100 text-blue-800' },
    approvato: { etichetta: 'Approvato, in attesa dell’inquilino', classe: 'bg-blue-100 text-blue-800' },
    in_corso: { etichetta: 'In corso', classe: 'bg-amber-100 text-amber-800' },
    completato: { etichetta: 'Completato', classe: 'bg-green-100 text-green-800' },
    respinto: { etichetta: 'Respinto', classe: 'bg-red-100 text-red-800' },
    sostituito: { etichetta: 'Sostituito', classe: neutro },
    interrotto: { etichetta: 'Interrotto: al legale', classe: 'bg-purple-100 text-purple-800' },
};

export const STATO_RATA = {
    pagata: { etichetta: 'Pagata', classe: 'bg-green-100 text-green-800' },
    in_scadenza: { etichetta: 'In scadenza', classe: 'bg-amber-100 text-amber-800' },
    scaduta: { etichetta: 'Scaduta', classe: 'bg-orange-100 text-orange-800' },
    saltata: { etichetta: 'Saltata', classe: 'bg-red-100 text-red-800' },
    futura: { etichetta: 'Futura', classe: 'bg-slate-100 text-slate-700' },
};

export const STATO_INDENNIZZO = {
    da_disporre: { etichetta: 'Da istruire e disporre', classe: 'bg-red-100 text-red-800' },
    disposto: { etichetta: 'Da autorizzare', classe: 'bg-amber-100 text-amber-800' },
    autorizzato: { etichetta: 'Autorizzato, bonifico da eseguire', classe: 'bg-blue-100 text-blue-800' },
    pagato: { etichetta: 'Pagato', classe: 'bg-green-100 text-green-800' },
};

export const STATO_BONIFICO = {
    da_disporre: { etichetta: 'Da disporre', classe: 'bg-red-100 text-red-800' },
    disposto: { etichetta: 'Da autorizzare', classe: 'bg-amber-100 text-amber-800' },
    autorizzato: { etichetta: 'Da eseguire', classe: 'bg-blue-100 text-blue-800' },
    eseguito: { etichetta: 'Eseguito', classe: 'bg-green-100 text-green-800' },
};

export const TIPO_BONIFICO = {
    canone: { etichetta: 'Canone girato', plurale: 'Canoni girati', icona: Banknote },
    indennizzo: { etichetta: 'Indennizzo', plurale: 'Indennizzi', icona: HandCoins },
    provvigione: { etichetta: 'Provvigione', plurale: 'Provvigioni', icona: Percent },
};

export const STATO_FASE = {
    nel_termine: { etichetta: 'Nel termine', classe: 'bg-green-100 text-green-800' },
    fuori_termine: { etichetta: 'Fuori termine', classe: 'bg-red-100 text-red-800' },
    in_corso: { etichetta: 'In corso', classe: 'bg-blue-100 text-blue-800' },
    scaduta: { etichetta: 'Scaduta', classe: 'bg-red-100 text-red-800' },
    non_dovuta: { etichetta: 'Non servita', classe: neutro },
};

export const STATO_RENDICONTO = {
    inviato: { etichetta: 'Inviato', classe: 'bg-green-100 text-green-800' },
    da_inviare: { etichetta: 'Da inviare', classe: 'bg-amber-100 text-amber-800' },
    in_corso: { etichetta: 'Trimestre in corso', classe: neutro },
};

export const INIZIATIVA = { cria: 'Da CRIA', inquilino: 'Dall’inquilino' };

// Importi con i centesimi solo quando ci sono: 1.001 € · 1.137,50 €.
export const euro = (n) => fmtEuro(n, Number.isInteger(Math.round(n * 100) / 100) ? 0 : 2);

// Le select native dei moduli: sul telefono aprono il selettore di sistema.
export const classeSelect = 'h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-ring';

// «mancano 2 giorni lavorativi» · «scade oggi» · «scaduto da 3 giorni»
export const quantoManca = (mancano, calendario) => {
    if (mancano == null) return '';
    if (mancano === 0) return 'scade oggi';
    if (mancano > 0) return `${mancano === 1 ? 'manca' : 'mancano'} ${mancano} ${etichettaCalendario(calendario, mancano)}`;
    const n = -mancano;
    return `scaduto da ${n} ${etichettaCalendario(calendario, n)}`;
};

export const nomeAvvocato = (personaId) => {
    const p = trovaPersonaDemo(personaId);
    return p ? `Avv. ${p.nome} ${p.cognome}` : '—';
};

export const mesiPratica = (p) => p.mesi.map(m => nomeMese(m).toLowerCase()).join(', ');

// Il primo contatto in una riga: quando, e quanto dopo la chiusura del mese.
export const testoPrimoContatto = (p) => {
    if (!p.primoContatto) return p.chiusaIl ? 'Pagato prima di qualsiasi contatto' : null;
    const g = p.giorniAlPrimoContatto;
    const quando = `Primo contatto ${ilGiorno(p.primoContatto.il)}`;
    if (p.sospensione) {
        return g === 0 ? `${quando}, il giorno in cui si è chiusa la contestazione` : `${quando}, ${g} ${g === 1 ? 'giorno' : 'giorni'} dopo la fine della contestazione`;
    }
    return g === 0 ? `${quando}, il giorno della chiusura del mese` : `${quando}, ${g} ${g === 1 ? 'giorno' : 'giorni'} dopo la chiusura del mese`;
};

/**
 * Cosa succede adesso su una pratica, e a chi tocca.
 * @returns {{ testo: string, funzione: string | null, urgente: boolean }}
 */
export const prossimoPasso = (p) => {
    const faseDi = (chiave) => p.fasi.find(f => f.chiave === chiave && !['nel_termine', 'fuori_termine', 'non_dovuta'].includes(f.stato));
    if (p.stato === 'chiusa') {
        return { testo: `Chiusa ${ilGiorno(p.chiusaIl)}: ${ESITO_PRATICA[p.esito] || 'chiusa'}.`, funzione: null, urgente: false };
    }
    if (p.stato === 'al_legale') {
        return { testo: `Affidata a ${nomeAvvocato(p.legale.avvocatoId)} ${dalGiorno(p.legale.decisoIl)}: il fascicolo è nella sua area.`, funzione: null, urgente: false };
    }
    if (p.legale && !p.legale.decisione) {
        const f = faseDi('decisione_legale');
        return { testo: `Passaggio al legale da decidere entro ${ilGiorno(f.termine)} (${quantoManca(f.mancano, f.calendario)}).`, funzione: 'resp_legale', urgente: f.urgente };
    }
    if (p.pianoProposto) {
        const f = p.fasi.find(x => x.pianoId === p.pianoProposto.id);
        return { testo: `Piano proposto da ${nomeOperatore(p.pianoProposto.propostoDa)}: lo decide la responsabile legale entro ${ilGiorno(f.termine)}.`, funzione: 'resp_legale', urgente: f.urgente };
    }
    if (!p.primoContatto) {
        const f = faseDi('primo_contatto');
        return { testo: `Primo contatto da fare entro ${ilGiorno(f.termine)} (${quantoManca(f.mancano, f.calendario)}).`, funzione: 'gestore_pratica', urgente: f.urgente };
    }
    const piano = p.pianoAttivo;
    if (piano?.stato === 'approvato') {
        return { testo: `Piano approvato ${ilGiorno(piano.approvatoIl)}: si aspetta che l’inquilino lo accetti dalla sua area.`, funzione: 'gestore_pratica', urgente: false };
    }
    if (piano?.stato === 'in_corso') {
        const saltata = piano.rate.find(r => r.stato === 'saltata');
        if (saltata) return { testo: `La rata ${saltata.n} è saltata: nuovo piano o passaggio al legale.`, funzione: 'gestore_pratica', urgente: true };
        const r = piano.prossima;
        if (r.stato === 'scaduta') {
            return {
                testo: `Rata ${r.n} di ${piano.rate.length} scaduta ${ilGiorno(r.scadenza)}: se non arriva entro ${ilGiorno(aggiungiGiorniSolari(r.scadenza, GIORNI_TOLLERANZA_RATA))} conta come saltata.`,
                funzione: 'gestore_pratica', urgente: true,
            };
        }
        return { testo: `Rata ${r.n} di ${piano.rate.length}: ${fmtEuro(r.importo)} entro ${ilGiorno(r.scadenza)}.`, funzione: 'gestore_pratica', urgente: false };
    }
    const proposta = faseDi('proposta_piano');
    if (proposta) {
        return { testo: `L’inquilino ha chiesto un piano: da proporre entro ${ilGiorno(proposta.termine)}.`, funzione: 'gestore_pratica', urgente: proposta.urgente };
    }
    const giorni = giorniSolariTra(p.contatti[p.contatti.length - 1].il, OGGI);
    return { testo: `Ultimo contatto ${giorni === 0 ? 'oggi' : `${giorni} ${giorni === 1 ? 'giorno' : 'giorni'} fa`}: si aspetta il pagamento promesso.`, funzione: 'gestore_pratica', urgente: false };
};
