import React from 'react';
import { OGGI } from '@/data/datiDemo';
import { PRODOTTI } from '@/data/catalogo';
import { CICLO, MESE_CORRENTE } from '@/lib/incassiDemo';
import { nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// Il calendario del ciclo mensile (§9.2), con i giorni presi dai parametri:
// scadenza, tre solleciti, ultimo giorno utile, chiusura, non rilevato. È una
// spiegazione: sta nella «i» accanto al titolo di Segnalazioni.
// ═════════════════════════════════════════════════════════════════════════════

// «il 6», «l’11»; «al 6», «all’11»
const elide = (g) => g === 8 || g === 11;
const ilGiorno = (g) => (elide(g) ? `l’${g}` : `il ${g}`);
const alGiorno = (g) => (elide(g) ? `all’${g}` : `al ${g}`);

export const PASSI_DEL_MESE = [
    { giorno: CICLO.scadenza, titolo: 'Scade il canone', testo: 'Chi incassa da sé riceve la domanda «il canone è arrivato?»' },
    ...CICLO.solleciti.map(s => ({
        giorno: s.giorno,
        titolo: `Sollecito ${s.n}${s.giorno === CICLO.ultimoUtile ? ', la mattina' : ''}`,
        testo: s.giorno === CICLO.ultimoUtile
            ? `Ultimo giorno utile: chi segnala il mancato pagamento entro oggi tiene la copertura`
            : `Se non ha ancora risposto: ${CICLO.canali.join(', ')}`,
    })),
    { giorno: CICLO.ultimoUtile + 1, titolo: 'Finestra chiusa', testo: 'Un mancato pagamento segnalato da qui conta per il semaforo, ma la copertura del mese decade' },
    { giorno: CICLO.chiusura, titolo: 'Chiusura del mese', testo: 'Ultimo giorno per rispondere' },
    { giorno: CICLO.nonRilevato.giorno, titolo: `Alle ${CICLO.nonRilevato.ora}: non rilevato`, testo: 'Il sistema lo scrive per chi non ha risposto: pesa zero sul semaforo e la copertura decade' },
];

export const ESITI_DEL_MESE = [
    { chi: `Segnala il mancato pagamento entro ${ilGiorno(CICLO.ultimoUtile)}`, esito: 'Non pagato', copertura: 'Attiva: la pratica di morosità parte subito' },
    { chi: `Lo segnala dopo ${ilGiorno(CICLO.ultimoUtile)}`, esito: 'Non pagato', copertura: 'Decaduta, ma il mese conta per il semaforo' },
    { chi: `Segnala che è arrivato, fino ${alGiorno(CICLO.chiusura)}`, esito: 'Pagato', copertura: '—' },
    { chi: `Non risponde entro ${ilGiorno(CICLO.chiusura)}`, esito: 'Non rilevato', copertura: 'Decaduta, e il mese resta fuori dal semaforo' },
];

const CalendarioCiclo = ({ conEsiti = true }) => {
    const oggi = Number(OGGI.slice(8));
    return (
        <div className="space-y-3">
            <div>
                <p className="text-sm font-semibold text-foreground">Il ciclo del mese</p>
                <p className="text-xs text-muted-foreground">
                    Giorni solari, perché sono termini verso il cliente. Oggi è il {oggi}: {oggi > CICLO.chiusura ? `il ciclo di ${nomeMese(MESE_CORRENTE).toLowerCase()} è chiuso.` : 'il ciclo del mese è aperto.'}
                </p>
            </div>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PASSI_DEL_MESE.map(p => (
                    <li key={p.titolo} className={`rounded-lg border p-3 ${p.giorno === CICLO.ultimoUtile ? 'border-amber-300 bg-amber-50/60' : 'border-border'}`}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Giorno {p.giorno}</p>
                        <p className="text-sm font-medium text-foreground">{p.titolo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.testo}</p>
                    </li>
                ))}
            </ol>
            {conEsiti && (
                <div className="rounded-lg border border-border divide-y divide-border">
                    {ESITI_DEL_MESE.map(e => (
                        <div key={e.chi} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3 px-3 py-2 text-xs">
                            <span className="text-foreground">{e.chi}</span>
                            <span className="font-medium text-foreground">{e.esito}</span>
                            <span className="text-muted-foreground">{e.copertura}</span>
                        </div>
                    ))}
                </div>
            )}
            <p className="text-xs text-muted-foreground">Con {PRODOTTI.P2.nome} incassa CRIA: al proprietario non si chiede nulla. Con {PRODOTTI.P5.nome} non c’è copertura: la risposta conta solo per il semaforo.</p>
        </div>
    );
};

export default CalendarioCiclo;
