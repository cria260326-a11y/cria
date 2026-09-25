import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellRing, CalendarRange, Check, Minus } from 'lucide-react';
import NotaMockup from '@/components/NotaMockup';
import { nomeProdotto, COLORE_PRODOTTO } from '@/data/catalogo';
import {
    CICLO, MESE_PROSSIMO, incassaCria, sollecitiDelMese, posizioneNellaFinestra, coperturaDelMese, coperturaNelGiorno,
} from '@/lib/incassiDemo';
import { SEGNALAZIONE } from '@/lib/etichette';
import { ESITI_MESE, esitoMese } from '@/lib/semaforo';
import { fmtData, nomeMese } from '@/lib/formato';
import { Pill, Voce } from '@/components/admin/istruttoria/Elementi';

// ═════════════════════════════════════════════════════════════════════════════
// Le segnalazioni di un mese, contratto per contratto (O-09): esito, finestra
// dei 5 giorni, copertura e i tre solleciti. E il prossimo ciclo, giorno per
// giorno, con lo stato della copertura: attiva, a rischio, decaduta.
// ═════════════════════════════════════════════════════════════════════════════

const ggmm = (iso) => fmtData(iso).slice(0, 5);
const elide = (g) => g === 8 || g === 11;
const ilGiorno = (g) => (elide(g) ? `l’${g}` : `il ${g}`);

export const contaDelMese = (contratti, mese) => {
    const righe = contratti.map(c => ({ c, m: c.mesi.find(x => x.mese === mese) })).filter(x => x.m);
    const segnalano = righe.filter(({ c }) => !incassaCria(c));
    const pos = (x) => posizioneNellaFinestra(x.c, x.m);
    return {
        righe,
        pagati: righe.filter(({ c, m }) => (incassaCria(c) ? m.stato === 'pagato' : m.segnalazione?.tipo === 'pagato')).length,
        entro: segnalano.filter(x => pos(x) === 'entro').length,
        dopo: segnalano.filter(x => pos(x) === 'dopo').length,
        nonRilevati: segnalano.filter(x => pos(x) === 'nessuna_risposta').length,
        cria: righe.length - segnalano.length,
        senzaRisposta: segnalano.filter(({ m }) => !m.segnalazione).length,
    };
};

const FINESTRA = {
    entro: { testo: `Entro ${ilGiorno(CICLO.ultimoUtile)}: in tempo`, classe: 'text-green-700' },
    dopo: { testo: `Dopo ${ilGiorno(CICLO.ultimoUtile)}: in ritardo`, classe: 'text-red-700' },
    pagato: { testo: 'Pagato: la finestra non serve', classe: 'text-muted-foreground' },
    nessuna_risposta: { testo: `Nessuna risposta entro ${ilGiorno(CICLO.chiusura)}`, classe: 'text-red-700' },
};

const Solleciti = ({ c, m }) => {
    const lista = sollecitiDelMese(c, m);
    if (!lista.length) return <span className="text-sm text-muted-foreground">Nessuno: incassa CRIA</span>;
    return (
        <div className="flex flex-wrap gap-1.5">
            {lista.map(s => (
                <span key={s.n} title={s.quando} className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs ${s.stato === 'inviato' ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-border text-muted-foreground'}`}>
                    {s.stato === 'inviato' ? <Check className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                    {s.n} · {ggmm(s.data)} {s.stato === 'inviato' ? 'inviato' : s.stato === 'in_programma' ? 'in programma' : 'non serviva'}
                </span>
            ))}
        </div>
    );
};

const Segnalazione = ({ c, m }) => {
    const s = m.segnalazione;
    if (incassaCria(c)) {
        return m.stato === 'pagato'
            ? <span className="flex flex-wrap items-center gap-1.5"><Pill classe={SEGNALAZIONE.pagato.classe}>Pagato</Pill><span className="text-xs text-muted-foreground">incassato da CRIA il {ggmm(m.pagatoIl)}</span></span>
            : <span className="text-sm text-muted-foreground">Non ancora incassato</span>;
    }
    if (!s) return <span className="text-sm text-muted-foreground">Nessuna risposta ancora</span>;
    return (
        <span className="flex flex-wrap items-center gap-1.5">
            <Pill classe={SEGNALAZIONE[s.tipo]?.classe}>{SEGNALAZIONE[s.tipo]?.etichetta}</Pill>
            <span className="text-xs text-muted-foreground">
                {s.fonte === 'automatica' ? `scritto dal sistema il ${ggmm(s.il)} alle ${CICLO.nonRilevato.ora}` : `il ${ggmm(s.il)}, dal proprietario`}
            </span>
        </span>
    );
};

const StatoMese = ({ c, m }) => {
    const esito = ESITI_MESE[esitoMese(m)];
    const parti = [];
    if (m.stato === 'pagato' && m.giorno) parti.push(`pagato il ${ggmm(m.pagatoIl)}`);
    if (m.rettificato) parti.push('rettificato dopo una contestazione accolta');
    if (m.stato === 'in_attesa') parti.push(`l’inquilino può contestare fino al ${fmtData(m.scadenzaContestazione)}`);
    if (m.stato === 'insoluto') parti.push('insoluto');
    return (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: esito.colore }} /> {esito.pesa ? `Nel semaforo: ${esito.etichetta.toLowerCase()}` : `Fuori dal semaforo: ${esito.etichetta.toLowerCase()}`}</span>
            {parti.length > 0 && <span>· {parti.join(' · ')}</span>}
            {m.contestazioneId && <Link className="underline underline-offset-2 hover:text-foreground" to={`/dashboard/admin/contestazioni/${m.contestazioneId}`}>contestazione</Link>}
        </p>
    );
};

export const RigheSegnalazioni = ({ righe }) => (
    <div className="space-y-2.5">
        {righe.map(({ c, m }) => {
            const pos = posizioneNellaFinestra(c, m);
            const cop = coperturaDelMese(c, m);
            return (
                <div key={c.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="font-semibold text-foreground">{c.immobile.indirizzo}</p>
                            <p className="text-xs text-muted-foreground">Proprietario {c.locatore.nome} · inquilino {c.conduttore.nome} · {c.codiceUnivoco}</p>
                        </div>
                        <Pill classe={COLORE_PRODOTTO[c.prodotto]}>{nomeProdotto(c.prodotto)}</Pill>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                        <Voce etichetta={incassaCria(c) ? 'Incasso' : 'Segnalazione'}><Segnalazione c={c} m={m} /></Voce>
                        <Voce etichetta="Rispetto alla finestra">
                            {pos ? <span className={`text-sm ${FINESTRA[pos].classe}`}>{FINESTRA[pos].testo}</span> : <span className="text-sm text-muted-foreground">Non si applica</span>}
                        </Voce>
                        <Voce etichetta="Copertura del mese"><Pill classe={cop.classe}>{cop.etichetta}</Pill></Voce>
                        <Voce etichetta="Solleciti"><Solleciti c={c} m={m} /></Voce>
                    </div>
                    <StatoMese c={c} m={m} />
                </div>
            );
        })}
    </div>
);

// Il prossimo ciclo: giorno per giorno, finché il proprietario non risponde.
const GIORNI = [CICLO.solleciti[0].giorno, CICLO.solleciti[1].giorno, CICLO.ultimoUtile, CICLO.ultimoUtile + 1, CICLO.nonRilevato.giorno];

export const ProssimoCiclo = ({ contratti, conNomi = true }) => {
    const [giorno, setGiorno] = useState(GIORNI[0]);
    const segnalano = contratti.filter(c => !incassaCria(c) && c.mesi.length);
    const nomeProssimo = nomeMese(MESE_PROSSIMO).toLowerCase();
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><CalendarRange className="w-5 h-5" /> Il prossimo ciclo · {nomeProssimo}</CardTitle>
                <p className="text-xs text-muted-foreground">
                    Dal {CICLO.solleciti[0].giorno} {nomeProssimo} si chiede ai proprietari di {segnalano.length} contratti se il canone è arrivato. Lo stato della copertura si vede sempre, prima che le cose accadano.
                </p>
            </CardHeader>
            <CardContent>
                <NotaMockup>
                    <p className="mb-2 flex items-center gap-1.5"><BellRing className="w-4 h-4" /> Simula {nomeProssimo}, senza nessuna risposta dai proprietari: che giorno è?</p>
                    <div className="flex flex-wrap gap-1.5">
                        {GIORNI.map(g => (
                            <Button key={g} size="sm" variant={g === giorno ? 'default' : 'outline'} className={`h-7 px-2.5 ${g === giorno ? '' : 'bg-white'}`} onClick={() => setGiorno(g)}>
                                giorno {g}{g === CICLO.ultimoUtile ? ' · ultimo utile' : ''}
                            </Button>
                        ))}
                    </div>
                    <div className="mt-3 space-y-2">
                        {segnalano.map((c, i) => {
                            const stato = coperturaNelGiorno(c, MESE_PROSSIMO, giorno);
                            const inviati = CICLO.solleciti.filter(s => s.giorno <= giorno).length;
                            return (
                                <div key={c.id} className="rounded-lg border border-amber-200 bg-white/80 p-3 space-y-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-sm font-medium text-foreground">{conNomi ? c.immobile.indirizzo : `Contratto ${i + 1}`} <span className="text-xs font-normal text-muted-foreground">· {nomeProdotto(c.prodotto)}</span></p>
                                        <Pill classe={stato.classe}>{stato.etichetta}</Pill>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{stato.nota}. Solleciti mandati: {inviati} di {CICLO.solleciti.length}.</p>
                                </div>
                            );
                        })}
                    </div>
                </NotaMockup>
            </CardContent>
        </Card>
    );
};
