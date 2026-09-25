import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle2, HandCoins, Hourglass, Info, ShieldCheck, Stamp, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import AzioneSeparata from '@/components/admin/AzioneSeparata';
import AccessoLimitato from '@/components/admin/garanzia/AccessoLimitato';
import AzioneGaranzia from '@/components/admin/garanzia/AzioneGaranzia';
import Chip from '@/components/admin/garanzia/Chip';
import NotaGaranzia from '@/components/admin/garanzia/NotaGaranzia';
import Schede from '@/components/admin/garanzia/Schede';
import Termine from '@/components/admin/garanzia/Termine';
import Traccia from '@/components/admin/garanzia/Traccia';
import { STATO_INDENNIZZO, euro } from '@/components/admin/garanzia/stati';
import { PARAMETRI, PRODOTTI } from '@/data/catalogo';
import { CONTI_ACCREDITO } from '@/data/garanzia';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import {
    DODICI_MESI_FA, apriPraticaDaContestazione, autorizzaIndennizzo, disponiIndennizzo, formattaIban, ilGiorno, ilGiornoDelMese,
    mascheraIban, rimandaIndennizzo, useGaranzia, vedeIban, vistaGaranzia,
} from '@/lib/garanziaDemo';
import { nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// O-17 — INDENNIZZI
// Dovuti ai proprietari per i mesi coperti: segnalati non pagati dentro la
// finestra, fuori franchigia, rimasti senza incasso. La funzione indennizzi li
// istruisce e li dispone, la responsabile amministrativa li autorizza — mai la
// stessa persona — e poi escono come bonifico dalla tesoreria (O-13).
// Pagato l'indennizzo, il credito verso l'inquilino passa a CRIA.
// ═════════════════════════════════════════════════════════════════════════════

const FINE_FINESTRA = PARAMETRI.giornoScadenzaCanone + PARAMETRI.giorniFinestraCopertura;

const MOTIVI_SENZA = {
    contestazione: { etichetta: 'Contestazione in corso', testo: 'Tutto fermo finché CRIA non decide la contestazione.' },
    non_rilevato: { etichetta: 'Non rilevato', testo: `Nessuna segnalazione entro ${ilGiornoDelMese(PARAMETRI.giornoChiusuraMese)}: il mese non è coperto.` },
    pagato_dopo: { etichetta: 'Pagato dopo la chiusura', testo: 'Il canone è arrivato prima dell’indennizzo: la pratica si è chiusa col pagamento.' },
    in_franchigia: { etichetta: 'In franchigia', testo: 'Mese nella franchigia iniziale del contratto.' },
    tardiva: { etichetta: 'Segnalato in ritardo', testo: 'Segnalato dopo la finestra: copertura decaduta, ma il mese entra nel semaforo.' },
    in_istruttoria: { etichetta: 'Da istruire', testo: 'Pratica aperta, indennizzo non ancora creato.' },
};

const Istruttoria = ({ controlli }) => (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {controlli.map(x => (
            <li key={x.chiave} className={`flex items-start gap-1.5 text-xs ${x.ok ? 'text-foreground' : 'text-red-700'}`}>
                {x.ok
                    ? <CheckCircle2 className="w-3.5 h-3.5 mt-px text-green-600 flex-shrink-0" aria-hidden="true" />
                    : <XCircle className="w-3.5 h-3.5 mt-px text-red-600 flex-shrink-0" aria-hidden="true" />}
                <span>{x.testo}</span>
            </li>
        ))}
    </ul>
);

const RigaIndennizzo = ({ i, ibanPieno }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [rimando, setRimando] = useState(false);
    const [motivo, setMotivo] = useState('');
    const c = i.contratto;
    const iban = CONTI_ACCREDITO[i.beneficiarioId]?.iban;
    const faseAperta = i.fasi.find(f => f.stato === 'in_corso' || f.stato === 'scaduta');
    const esito = (r, testo) => {
        if (!r.ok) return toast.error(r.motivo);
        toast.success(testo);
        setRimando(false);
        return setMotivo('');
    };

    return (
        <li className="p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                    <p className="font-semibold text-foreground">{c.immobile.indirizzo} · {nomeMese(i.mese).toLowerCase()}</p>
                    <p className="text-sm text-muted-foreground">
                        A {i.beneficiario} · IBAN <span className="font-mono">{ibanPieno ? formattaIban(iban) : mascheraIban(iban)}</span>
                    </p>
                    <Link to={`/dashboard/admin/morosita/${i.praticaId}`} className="text-xs text-primary hover:underline">Pratica di morosità · {c.conduttore.nome}</Link>
                </div>
                <div className="ml-auto flex flex-col items-end gap-1">
                    <p className="text-lg font-bold tabular-nums text-foreground">{euro(i.importo)}</p>
                    <Chip stato={STATO_INDENNIZZO[i.stato]} />
                </div>
            </div>

            <div className="rounded-lg bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Istruttoria della copertura</p>
                <Istruttoria controlli={i.istruttoria} />
                {i.notaIstruttoria && <p className="text-xs text-muted-foreground">{i.notaIstruttoria}</p>}
            </div>

            <Traccia
                passi={[
                    { etichetta: 'Disposto', chi: i.dispostoDa, il: i.dispostoIl, attesa: 'dalla funzione indennizzi' },
                    { etichetta: 'Autorizzato', chi: i.autorizzatoDa, il: i.autorizzatoIl, attesa: 'dalla responsabile amministrativa' },
                    { etichetta: 'Pagato', chi: i.eseguitoDa, il: i.pagatoIl, attesa: 'bonifico della tesoreria' },
                ]}
                rimandi={i.rimandi}
            />
            {i.riferimento && <p className="text-xs text-muted-foreground">Riferimento del bonifico: <span className="font-mono">{i.riferimento}</span></p>}
            {faseAperta && <Termine termine={faseAperta.termine} mancano={faseAperta.mancano} calendario={faseAperta.calendario} prefisso={`${faseAperta.etichetta}: entro`} />}

            {i.stato === 'da_disporre' && (
                <AzioneGaranzia azione="disponi_indennizzo" record={i} className="bg-[#1A2D52] hover:bg-[#0F1B33]"
                    onEsegui={() => esito(disponiIndennizzo(i, operatoreId), 'Indennizzo disposto: ora lo autorizza la responsabile amministrativa')}>
                    Disponi l’indennizzo
                </AzioneGaranzia>
            )}
            {i.stato === 'disposto' && (rimando ? (
                <div className="space-y-2">
                    <Label htmlFor={`rimando-${i.id}`}>Perché lo rimandi indietro</Label>
                    <Textarea id={`rimando-${i.id}`} rows={2} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Chi l’ha disposto lo legge e corregge." />
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => esito(rimandaIndennizzo(i, operatoreId, motivo), 'Indennizzo rimandato alla funzione indennizzi')}>Rimanda indietro</Button>
                        <Button size="sm" variant="ghost" onClick={() => setRimando(false)}>Annulla</Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap items-start gap-3">
                    <AzioneSeparata azione="autorizza_pagamento" record={{ dispostoDa: i.dispostoDa }} className="bg-[#1A2D52] hover:bg-[#0F1B33]"
                        onEsegui={() => esito(autorizzaIndennizzo(i, operatoreId), 'Indennizzo autorizzato: il bonifico passa alla tesoreria')}>
                        Autorizza il pagamento
                    </AzioneSeparata>
                    <AzioneGaranzia azione="rimanda_pagamento" record={{ dispostoDa: i.dispostoDa }} variant="outline" onEsegui={() => setRimando(true)}>
                        Rimanda indietro
                    </AzioneGaranzia>
                </div>
            ))}
            {i.stato === 'autorizzato' && (
                <Link to="/dashboard/admin/bonifici" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    Il bonifico è in Bonifici in uscita, da eseguire <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            )}
        </li>
    );
};

const IndennizziPage = () => {
    const { operatore } = useOperatoreAttivo();
    const g = useGaranzia();
    const vista = vistaGaranzia(operatore.funzione, 'indennizzi');
    const [scheda, setScheda] = useState('da_fare');

    const conta = (stato) => g.indennizzi.filter(i => i.stato === stato);
    const somma = (lista) => lista.reduce((t, i) => t + i.importo, 0);
    const daFare = g.indennizzi.filter(i => i.stato !== 'pagato');
    const pagati = g.indennizzi.filter(i => i.stato === 'pagato');
    const pagati12 = pagati.filter(i => i.pagatoIl >= DODICI_MESI_FA);
    const elenco = { da_fare: daFare, pagati, tutti: g.indennizzi }[scheda];
    const demoAperta = g.pratiche.some(p => p.sospensione?.contestazioneId === 'con-verdi5-2026-09');

    const simula = () => {
        const r = apriPraticaDaContestazione('con-verdi5-2026-09');
        if (r.ok) toast.success('Pratica aperta su Via Verdi 5: c’è un indennizzo di settembre da istruire');
        else toast.error(r.motivo);
    };

    return (
        <>
            <Helmet><title>Indennizzi - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Indennizzi"
                    sottotitolo="Ai proprietari, per i mesi coperti dalla garanzia. Li dispone la funzione indennizzi, li autorizza la responsabile amministrativa: mai la stessa persona."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Contatore etichetta="Da istruire e disporre" valore={conta('da_disporre').length} icona={Hourglass} colore="bg-red-500" nota={euro(somma(conta('da_disporre')))} />
                    <Contatore etichetta="Da autorizzare" valore={conta('disposto').length} icona={Stamp} colore="bg-amber-500" nota={euro(somma(conta('disposto')))} />
                    <Contatore etichetta="Bonifico da eseguire" valore={conta('autorizzato').length} icona={HandCoins} colore="bg-blue-500" nota={euro(somma(conta('autorizzato')))} />
                    <Contatore etichetta="Pagati negli ultimi 12 mesi" valore={euro(somma(pagati12))} icona={ShieldCheck} colore="bg-green-600" nota={`${pagati12.length} ${pagati12.length === 1 ? 'indennizzo' : 'indennizzi'}`} />
                </div>

                <Card>
                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Info className="w-5 h-5" /> Quando un mese è coperto</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
                            <li>Il proprietario segnala il mancato pagamento entro {PARAMETRI.giorniFinestraCopertura} giorni dalla scadenza, cioè entro {ilGiornoDelMese(FINE_FINESTRA)}: copertura attiva.</li>
                            <li>Lo segnala dopo: la copertura decade, ma il mese entra lo stesso nel semaforo dell’inquilino.</li>
                            <li>Non segnala entro {ilGiornoDelMese(PARAMETRI.giornoChiusuraMese)}: il mese è non rilevato e non è coperto.</li>
                            <li>
                                Franchigia: i primi mesi del contratto non sono coperti, {PRODOTTI.P1.franchigiaMesi} per {PRODOTTI.P1.nome} su contratto nuovo e per {PRODOTTI.P2.nome},
                                {' '}{PRODOTTI.P1E.franchigiaMesi} su contratto esistente. {PRODOTTI.P5.nome} non ha garanzia.
                            </li>
                            <li>Pagato l’indennizzo, il credito verso l’inquilino passa a CRIA, che lo recupera con la pratica di morosità.</li>
                        </ul>
                    </CardContent>
                </Card>

                {vista !== 'dettaglio' ? <AccessoLimitato vista={vista} sezione="indennizzi" /> : (
                    <>
                        <section className="space-y-3" aria-label="Elenco degli indennizzi">
                            <Schede
                                etichetta="Quali indennizzi"
                                valore={scheda}
                                onCambia={setScheda}
                                voci={[
                                    { id: 'da_fare', etichetta: 'Da lavorare', conta: daFare.length },
                                    { id: 'pagati', etichetta: 'Pagati', conta: pagati.length },
                                    { id: 'tutti', etichetta: 'Tutti', conta: g.indennizzi.length },
                                ]}
                            />
                            <Card>
                                <CardContent className="p-0">
                                    {elenco.length === 0 ? (
                                        <p className="py-12 text-center text-sm text-muted-foreground">
                                            {scheda === 'da_fare' ? 'Nessun indennizzo da lavorare.' : 'Nessun indennizzo qui.'}
                                        </p>
                                    ) : (
                                        <ul className="divide-y divide-border">
                                            {elenco.map(i => <RigaIndennizzo key={i.id} i={i} ibanPieno={vedeIban(operatore.funzione)} />)}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>
                        </section>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Mesi senza indennizzo, e perché</CardTitle>
                                <p className="text-xs text-muted-foreground">Contratti con garanzia, mesi pagati in ritardo, non pagati o non rilevati.</p>
                            </CardHeader>
                            <CardContent>
                                <ul className="divide-y divide-border">
                                    {g.senzaIndennizzo.map(x => {
                                        const motivo = MOTIVI_SENZA[x.motivo];
                                        return (
                                            <li key={x.id} className="py-2.5 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-foreground">{x.contratto.immobile.indirizzo} · {nomeMese(x.m.mese).toLowerCase()}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {motivo.testo}
                                                        {x.motivo === 'pagato_dopo' && ` Pagato ${ilGiorno(x.m.pagatoIl)}.`}
                                                        {x.pratica && <> <Link to={`/dashboard/admin/morosita/${x.pratica.id}`} className="text-primary hover:underline">Pratica</Link></>}
                                                    </p>
                                                </div>
                                                <Chip>{motivo.etichetta}</Chip>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </CardContent>
                        </Card>
                    </>
                )}

                <NotaGaranzia>
                    {!demoAperta && (
                        <button type="button" className="underline font-medium text-left" onClick={simula}>
                            Simula: la contestazione di Via Verdi 5 si chiude a favore del proprietario, e nasce l’indennizzo di settembre da istruire
                        </button>
                    )}
                </NotaGaranzia>
            </div>
        </>
    );
};

export default IndennizziPage;
