import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Info } from 'lucide-react';
import NotaMockup from '@/components/NotaMockup';
import { OGGI } from '@/data/datiDemo';
import { PRODOTTI, PARAMETRI, nomeProdotto } from '@/data/catalogo';
import { COPERTURA, SEGNALAZIONE } from '@/lib/etichette';
import { nomeMese, fmtData, meseSuccessivo } from '@/lib/formato';

// P-11 — «Il canone è arrivato?». Ogni mese il canone scade il giorno
// giornoScadenzaCanone e chi incassa da sé (P1, P1E, P5) dice se è arrivato.
// Il mancato pagamento segnalato entro la finestra tiene la copertura; dopo
// conta lo stesso come non pagato ma la copertura del mese decade; senza
// risposta entro giornoChiusuraMese il mese è non rilevato. Con CRIA
// Segnalazione non c'è copertura: la risposta conta solo per il semaforo.
// Tutti i giorni vengono da PARAMETRI.

const SCADENZA = PARAMETRI.giornoScadenzaCanone;
const ULTIMO_UTILE = SCADENZA + PARAMETRI.giorniFinestraCopertura;
const CHIUSURA = PARAMETRI.giornoChiusuraMese;
// Giorni della simulazione: il primo giorno della domanda, l'ultimo utile,
// uno a copertura decaduta, il primo a mese chiuso.
const GIORNI_SIMULATI = [SCADENZA + 1, ULTIMO_UTILE, ULTIMO_UTILE + 2, CHIUSURA + 1];

const VERDE = 'bg-green-100 text-green-800';
const AMBRA = 'bg-amber-100 text-amber-800';
const ROSSO = 'bg-red-100 text-red-800';
const GRIGIO = 'bg-gray-100 text-gray-700';
const ARDESIA = 'bg-slate-100 text-slate-700';

// «il 6», «l’11»; «dal 2», «dall’8»
const elide = (g) => g === 8 || g === 11;
const ilGiorno = (g) => (elide(g) ? `l’${g}` : `il ${g}`);
const dalGiorno = (g) => (elide(g) ? `dall’${g}` : `dal ${g}`);
const ggmm = (iso) => fmtData(iso).slice(0, 5);
const soloMese = (mese) => nomeMese(mese).split(' ')[0]; // '2026-10' → 'Ottobre'

const conGaranzia = (c) => Boolean(PRODOTTI[c.prodotto]?.garanzia);

// Mese ancora in franchigia: la garanzia non lo copre.
const inFranchigia = (c, mese) => {
    const p = PRODOTTI[c.prodotto];
    if (!p?.garanzia || !c.attivoDal) return false;
    let fine = c.attivoDal;
    for (let i = 0; i < (p.franchigiaMesi || 0); i += 1) fine = meseSuccessivo(fine);
    return mese < fine;
};

// Com'è messo il contratto nel giorno g del mese, finché non si risponde.
const statoDelGiorno = (c, mese, g) => {
    const m = soloMese(mese).toLowerCase();
    if (g > CHIUSURA) {
        return {
            chiuso: true, etichetta: 'Mese chiuso: non rilevato', classe: GRIGIO,
            nota: conGaranzia(c)
                ? `Nessuna risposta entro ${ilGiorno(CHIUSURA)}: il mese non conta nel semaforo e la copertura decade.`
                : `Nessuna risposta entro ${ilGiorno(CHIUSURA)}: il mese non conta nel semaforo.`,
        };
    }
    if (!conGaranzia(c)) {
        return { etichetta: 'Senza garanzia', classe: ARDESIA, nota: `Conta solo per il semaforo. Rispondi entro ${ilGiorno(CHIUSURA)} ${m}, poi il mese è non rilevato.` };
    }
    if (inFranchigia(c, mese)) {
        return { etichetta: COPERTURA.in_franchigia.etichetta, classe: COPERTURA.in_franchigia.classe, nota: 'La garanzia non copre ancora questo mese: la risposta conta per il semaforo.' };
    }
    if (g < ULTIMO_UTILE) {
        const n = ULTIMO_UTILE - g + 1;
        return { etichetta: 'Copertura attiva', classe: VERDE, nota: `Ancora ${n} giorni, oggi compreso: se non è arrivato, segnalalo entro ${ilGiorno(ULTIMO_UTILE)} ${m}.` };
    }
    if (g === ULTIMO_UTILE) {
        return { etichetta: 'Ultimo giorno utile', classe: AMBRA, nota: 'Se non è arrivato, segnalalo oggi: da domani la copertura di questo mese decade.' };
    }
    return { etichetta: 'Copertura decaduta per questo mese', classe: ROSSO, nota: `Ma se non è arrivato segnalalo lo stesso: conta per il semaforo. Rispondi entro ${ilGiorno(CHIUSURA)} ${m}.` };
};

// Cosa succede dopo la risposta data nel giorno g.
const conseguenza = (c, mese, valore, g) => {
    if (valore === 'si') return { etichetta: 'Pagato', classe: VERDE, testo: 'Pagato: entra nel semaforo.' };
    if (!conGaranzia(c)) return { etichetta: 'Non pagato', classe: ROSSO, testo: 'Non pagato · senza garanzia: conta solo per il semaforo.' };
    if (inFranchigia(c, mese)) {
        return { etichetta: COPERTURA.in_franchigia.etichetta, classe: COPERTURA.in_franchigia.classe, testo: 'Non pagato: conta per il semaforo. Il mese è in franchigia, la garanzia non lo copre ancora.' };
    }
    if (g <= ULTIMO_UTILE) {
        return { etichetta: COPERTURA.attiva.etichetta, classe: COPERTURA.attiva.classe, testo: 'Non pagato: copertura attiva, la pratica di morosità parte subito.' };
    }
    return { etichetta: COPERTURA.decaduta_tardiva.etichetta, classe: COPERTURA.decaduta_tardiva.classe, testo: 'Non pagato: copertura decaduta per questo mese, ma conta per il semaforo.' };
};

// Una riga sul prossimo giro di domande, per contratto.
const notaProssimo = (c, mese) => {
    if (!conGaranzia(c)) return 'senza garanzia: conta solo per il semaforo';
    if (inFranchigia(c, mese)) return COPERTURA.in_franchigia.etichetta.toLowerCase();
    return `copertura se segnali entro ${ilGiorno(ULTIMO_UTILE)}`;
};

const Pill = ({ classe, children }) => (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${classe}`}>{children}</span>
);

// Com'è finito il mese chiuso, dal record del contratto.
const EsitoMese = ({ c, m }) => {
    if (!m) return <span className="text-xs text-muted-foreground">Nessun dato</span>;
    const tipo = m.segnalazione?.tipo;
    const s = SEGNALAZIONE[tipo];
    let dettaglio = '';
    if (tipo === 'pagato') dettaglio = `arrivato il ${ggmm(m.pagatoIl || m.segnalazione.il)}`;
    else if (tipo === 'non_pagato') {
        dettaglio = `segnalato il ${ggmm(m.segnalazione.il)}`;
        if (m.stato === 'pagato' && m.pagatoIl) dettaglio += ` · poi pagato il ${ggmm(m.pagatoIl)}`;
        if (m.stato === 'contestato') dettaglio += ' · contestazione in corso';
    } else if (tipo === 'non_rilevato') dettaglio = `nessuna risposta entro ${ilGiorno(CHIUSURA)}`;

    return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {s && <Pill classe={s.classe}>{s.etichetta}</Pill>}
            {dettaglio && <span className="text-xs text-muted-foreground">{dettaglio}</span>}
            {!conGaranzia(c)
                ? <span className="text-xs text-muted-foreground">· senza garanzia</span>
                : COPERTURA[m.copertura] && <Pill classe={COPERTURA[m.copertura].classe}>{COPERTURA[m.copertura].etichetta}</Pill>}
        </div>
    );
};

const CanoneArrivato = ({ contratti = [] }) => {
    const [giorno, setGiorno] = useState(GIORNI_SIMULATI[0]);
    const [risposte, setRisposte] = useState({}); // { [contrattoId]: { valore: 'si' | 'no', giorno } }

    if (!contratti.length) return null;

    // La demo è al 15: la finestra del mese in corso è già chiusa, il prossimo
    // giro di domande è quello del mese dopo.
    const meseChiuso = OGGI.slice(0, 7);
    const prossimo = meseSuccessivo(meseChiuso);
    const nomeProssimo = soloMese(prossimo);
    const prossimoMin = nomeProssimo.toLowerCase();
    const nomeChiuso = soloMese(meseChiuso);

    const segnala = contratti.filter(c => PRODOTTI[c.prodotto]?.incassa === 'proprietario');
    const incassaCria = contratti.filter(c => PRODOTTI[c.prodotto]?.incassa === 'cria');
    const conP5 = segnala.some(c => !conGaranzia(c));
    const prodottiCria = [...new Set(incassaCria.map(c => nomeProdotto(c.prodotto)))].join(', ');

    const rispondi = (id, valore) => setRisposte(prev => ({ ...prev, [id]: { valore, giorno } }));

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><CalendarCheck className="w-5 h-5" /> Il canone è arrivato?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {segnala.length > 0 && (
                    <>
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-muted-foreground">
                                Il canone scade il {SCADENZA === 1 ? '1°' : SCADENZA} di ogni mese. Se non arriva, segnalalo entro {ilGiorno(ULTIMO_UTILE)} per tenere la copertura;
                                dopo conta lo stesso come non pagato, ma la copertura del mese decade. Senza risposta entro {ilGiorno(CHIUSURA)} il mese è non rilevato: non conta nel semaforo e la copertura decade.
                                Promemoria: {PARAMETRI.solleciti.join(', ')}.
                                {conP5 && ' Con CRIA Segnalazione non c’è garanzia: la risposta conta solo per il semaforo.'}
                            </p>
                        </div>

                        <div className="divide-y divide-border rounded-lg border border-border">
                            {segnala.map(c => (
                                <div key={c.id} className="px-4 py-3 space-y-1.5">
                                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                                        <p className="text-sm font-medium text-foreground">{c.immobile.indirizzo}</p>
                                        <p className="text-xs text-muted-foreground">{c.conduttore.nome} · {nomeProdotto(c.prodotto)}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-medium text-foreground">{nomeChiuso}:</span>
                                        <EsitoMese c={c} m={c.mesi.find(x => x.mese === meseChiuso)} />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">{nomeProssimo}:</span> {dalGiorno(SCADENZA + 1)} {prossimoMin} ti chiediamo se il canone è arrivato · {notaProssimo(c, prossimo)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {incassaCria.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {incassaCria.map(c => c.immobile.indirizzo).join(', ')}: con {prodottiCria} incassa CRIA, non devi segnalare nulla.
                    </p>
                )}

                {segnala.length > 0 && (
                    <NotaMockup>
                        <p className="mb-2">Simula {prossimoMin}: che giorno è?</p>
                        <div className="flex flex-wrap gap-1.5">
                            {GIORNI_SIMULATI.map(g => (
                                <Button key={g} size="sm" variant={g === giorno ? 'default' : 'outline'} className={`h-7 px-2.5 ${g === giorno ? '' : 'bg-white'}`} onClick={() => setGiorno(g)}>
                                    giorno {g}{g === ULTIMO_UTILE ? ' · ultimo utile' : ''}
                                </Button>
                            ))}
                        </div>

                        <div className="mt-3 space-y-2">
                            {segnala.map(c => {
                                const r = risposte[c.id];
                                const risposto = r && r.giorno <= giorno;
                                const stato = statoDelGiorno(c, prossimo, giorno);
                                const esito = risposto ? conseguenza(c, prossimo, r.valore, r.giorno) : null;
                                return (
                                    <div key={c.id} className="rounded-lg border border-amber-200 bg-white/80 p-3 space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-sm font-medium text-foreground">{c.immobile.indirizzo}</p>
                                            {esito ? <Pill classe={esito.classe}>{esito.etichetta}</Pill> : <Pill classe={stato.classe}>{stato.etichetta}</Pill>}
                                        </div>
                                        {esito ? (
                                            <p className="text-xs text-foreground">
                                                Hai risposto «{r.valore === 'si' ? 'Sì' : 'No'}» {ilGiorno(r.giorno)} {prossimoMin}. {esito.testo}
                                            </p>
                                        ) : stato.chiuso ? (
                                            <p className="text-xs text-muted-foreground">{stato.nota}</p>
                                        ) : (
                                            <>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm text-foreground">Il canone è arrivato?</span>
                                                    <Button size="sm" variant="outline" className="h-7 px-3 bg-white" onClick={() => rispondi(c.id, 'si')}>Sì</Button>
                                                    <Button size="sm" variant="outline" className="h-7 px-3 bg-white" onClick={() => rispondi(c.id, 'no')}>No</Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{stato.nota}</p>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {Object.keys(risposte).length > 0 && (
                            <button type="button" className="mt-2 text-xs underline underline-offset-2 text-amber-800 hover:text-amber-950" onClick={() => setRisposte({})}>
                                Azzera le risposte
                            </button>
                        )}
                    </NotaMockup>
                )}
            </CardContent>
        </Card>
    );
};

export default CanoneArrivato;
