import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle2, Hourglass, Send, Stamp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { STATO_BONIFICO, TIPO_BONIFICO, euro } from '@/components/admin/garanzia/stati';
import { OGGI } from '@/data/datiDemo';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import {
    autorizzaBonifico, disponiBonifico, eseguiBonifico, formattaIban, ilGiorno, mascheraIban, rimandaBonifico,
    useGaranzia, vedeIban, vistaGaranzia,
} from '@/lib/garanziaDemo';
import { fmtData, nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// O-13 — BONIFICI IN USCITA
// Tutto quello che CRIA paga: i canoni incassati con CRIA Completo e girati ai
// proprietari, gli indennizzi autorizzati, le provvigioni dei commerciali.
// La tesoreria dispone, la responsabile amministrativa autorizza — mai la
// stessa persona (§13.4) — poi la tesoreria esegue. Gli indennizzi arrivano
// già disposti e autorizzati da O-17: qui si eseguono e basta.
// ═════════════════════════════════════════════════════════════════════════════

const SCHEDE = [
    { id: 'da_disporre', etichetta: 'Da disporre' },
    { id: 'disposto', etichetta: 'Da autorizzare' },
    { id: 'autorizzato', etichetta: 'Da eseguire' },
    { id: 'eseguito', etichetta: 'Eseguiti' },
];

// Con che scheda si apre la pagina: la coda di chi sta operando.
const schedaIniziale = (funzione, bonifici) => {
    const preferita = { tesoreria: bonifici.some(b => b.stato === 'da_disporre') ? 'da_disporre' : 'autorizzato', resp_amministrativo: 'disposto' }[funzione];
    return preferita || SCHEDE.find(s => bonifici.some(b => b.stato === s.id))?.id || 'eseguito';
};

const dettaglio = (b) => {
    if (b.tipo === 'canone') return `Incassato ${ilGiorno(b.natoIl)}: ${euro(b.canone)} meno la commissione del ${b.percentuale}% (${euro(b.commissione)}).`;
    if (b.tipo === 'indennizzo') return `Disposto e autorizzato in Indennizzi: il credito verso l’inquilino è passato a CRIA.`;
    return `Richiesta di prelievo del ${fmtData(b.natoIl)}, verificata in Provvigioni.`;
};

const RigaBonifico = ({ b, ibanPieno }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [rimando, setRimando] = useState(false);
    const [motivo, setMotivo] = useState('');
    const tipo = TIPO_BONIFICO[b.tipo];
    const Icona = tipo.icona;
    const esito = (r, testo) => {
        if (!r.ok) return toast.error(r.motivo);
        toast.success(testo);
        setRimando(false);
        return setMotivo('');
    };

    return (
        <li className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
            <span className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <Icona className="w-4 h-4 text-muted-foreground" />
            </span>
            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                    <div className="min-w-0">
                        <p className="font-semibold text-foreground">{b.beneficiario}</p>
                        <p className="text-xs text-muted-foreground">{tipo.etichetta} · {b.causale}</p>
                    </div>
                    <div className="ml-auto flex flex-col items-end gap-1">
                        <p className="font-bold tabular-nums text-foreground">{euro(b.importo)}</p>
                        <Chip stato={STATO_BONIFICO[b.stato]} />
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    IBAN <span className="font-mono">{ibanPieno ? formattaIban(b.iban) : mascheraIban(b.iban)}</span> · {dettaglio(b)}
                    {b.praticaId && <> <Link to={`/dashboard/admin/morosita/${b.praticaId}`} className="text-primary hover:underline">Pratica</Link></>}
                </p>
                <Traccia
                    passi={[
                        { etichetta: 'Disposto', chi: b.dispostoDa, il: b.dispostoIl, attesa: b.tipo === 'indennizzo' ? 'dalla funzione indennizzi' : 'dalla tesoreria' },
                        { etichetta: 'Autorizzato', chi: b.autorizzatoDa, il: b.autorizzatoIl, attesa: 'dalla responsabile amministrativa' },
                        { etichetta: 'Eseguito', chi: b.eseguitoDa, il: b.eseguitoIl, attesa: 'dalla tesoreria' },
                    ]}
                    rimandi={b.rimandi}
                />
                {b.riferimento && (
                    <p className="text-xs text-muted-foreground">
                        Riferimento <span className="font-mono">{b.riferimento}</span>
                        {b.nelTermine === false && <span className="text-red-700"> · oltre il termine del {fmtData(b.termineFinale)}</span>}
                    </p>
                )}
                {b.termine && (
                    <Termine termine={b.termine} mancano={b.mancano} calendario={b.calendario}
                        prefisso={b.stato === 'disposto' ? 'Da autorizzare entro' : b.tipo === 'canone' ? 'Al proprietario entro' : 'Da pagare entro'} />
                )}

                {b.stato === 'da_disporre' && (
                    <AzioneGaranzia azione="disponi_bonifico" record={b} className="bg-[#1A2D52] hover:bg-[#0F1B33]"
                        onEsegui={() => esito(disponiBonifico(b, operatoreId), 'Bonifico disposto: ora lo autorizza la responsabile amministrativa')}>
                        Disponi il bonifico
                    </AzioneGaranzia>
                )}
                {b.stato === 'disposto' && (rimando ? (
                    <div className="space-y-2">
                        <Label htmlFor={`rimando-${b.id}`}>Perché lo rimandi indietro</Label>
                        <Textarea id={`rimando-${b.id}`} rows={2} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Chi l’ha disposto lo legge e corregge." />
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => esito(rimandaBonifico(b, operatoreId, motivo), 'Bonifico rimandato alla tesoreria')}>Rimanda indietro</Button>
                            <Button size="sm" variant="ghost" onClick={() => setRimando(false)}>Annulla</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-wrap items-start gap-3">
                        <AzioneSeparata azione="autorizza_pagamento" record={{ dispostoDa: b.dispostoDa }} className="bg-[#1A2D52] hover:bg-[#0F1B33]"
                            onEsegui={() => esito(autorizzaBonifico(b, operatoreId), 'Bonifico autorizzato: la tesoreria può eseguirlo')}>
                            Autorizza
                        </AzioneSeparata>
                        <AzioneGaranzia azione="rimanda_pagamento" record={{ dispostoDa: b.dispostoDa }} variant="outline" onEsegui={() => setRimando(true)}>
                            Rimanda indietro
                        </AzioneGaranzia>
                    </div>
                ))}
                {b.stato === 'autorizzato' && (
                    <AzioneGaranzia azione="esegui_bonifico" record={b} className="bg-[#1A2D52] hover:bg-[#0F1B33]"
                        onEsegui={() => esito(eseguiBonifico(b, operatoreId), `Bonifico di ${euro(b.importo)} a ${b.beneficiario} eseguito`)}>
                        Segna come eseguito
                    </AzioneGaranzia>
                )}
            </div>
        </li>
    );
};

// Gli eseguiti, mese per mese, con il totale.
const perMese = (lista) => lista.reduce((gruppi, b) => {
    const mese = b.eseguitoIl.slice(0, 7);
    const g = gruppi.find(x => x.mese === mese);
    if (g) g.bonifici.push(b);
    else gruppi.push({ mese, bonifici: [b] });
    return gruppi;
}, []);

const BonificiPage = () => {
    const { operatore } = useOperatoreAttivo();
    const { bonifici } = useGaranzia();
    const vista = vistaGaranzia(operatore.funzione, 'bonifici');
    const [scheda, setScheda] = useState(() => schedaIniziale(operatore.funzione, bonifici));
    const [tipo, setTipo] = useState('tutti');

    const inStato = (stato) => bonifici.filter(b => b.stato === stato);
    const totale = (lista) => euro(lista.reduce((t, b) => t + b.importo, 0));
    const eseguitiNelMese = bonifici.filter(b => b.eseguitoIl?.startsWith(OGGI.slice(0, 7)));
    const nellaScheda = inStato(scheda);
    const elenco = nellaScheda.filter(b => tipo === 'tutti' || b.tipo === tipo);

    return (
        <>
            <Helmet><title>Bonifici in uscita - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Bonifici in uscita"
                    sottotitolo="Canoni girati ai proprietari, indennizzi, provvigioni. La tesoreria dispone, la responsabile amministrativa autorizza: mai la stessa persona."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Contatore etichetta="Da disporre" valore={inStato('da_disporre').length} icona={Hourglass} colore="bg-red-500" nota={totale(inStato('da_disporre'))} />
                    <Contatore etichetta="Da autorizzare" valore={inStato('disposto').length} icona={Stamp} colore="bg-amber-500" nota={totale(inStato('disposto'))} />
                    <Contatore etichetta="Da eseguire" valore={inStato('autorizzato').length} icona={Send} colore="bg-blue-500" nota={totale(inStato('autorizzato'))} />
                    <Contatore etichetta={`Eseguiti a ${nomeMese(OGGI.slice(0, 7)).split(' ')[0].toLowerCase()}`} valore={eseguitiNelMese.length} icona={CheckCircle2} colore="bg-green-600" nota={totale(eseguitiNelMese)} />
                </div>

                {vista !== 'dettaglio' ? <AccessoLimitato vista={vista} sezione="bonifici" /> : (
                    <section className="space-y-3" aria-label="Elenco dei bonifici">
                        <Schede etichetta="Stato dei bonifici" valore={scheda} onCambia={setScheda}
                            voci={SCHEDE.map(s => ({ ...s, conta: inStato(s.id).length }))} />
                        <Schede etichetta="Tipo di bonifico" valore={tipo} onCambia={setTipo}
                            voci={[
                                { id: 'tutti', etichetta: 'Tutti i tipi' },
                                ...Object.entries(TIPO_BONIFICO).map(([id, t]) => ({ id, etichetta: t.plurale, conta: nellaScheda.filter(b => b.tipo === id).length })),
                            ]} />

                        {elenco.length === 0 ? (
                            <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nessun bonifico in questa coda.</CardContent></Card>
                        ) : scheda === 'eseguito' ? (
                            perMese(elenco).map(gr => (
                                <Card key={gr.mese}>
                                    <div className="px-4 sm:px-5 py-3 border-b border-border bg-muted/40 flex flex-wrap items-baseline justify-between gap-2">
                                        <p className="text-sm font-semibold text-foreground">{nomeMese(gr.mese)}</p>
                                        <p className="text-xs text-muted-foreground">{gr.bonifici.length} {gr.bonifici.length === 1 ? 'bonifico' : 'bonifici'} · {totale(gr.bonifici)}</p>
                                    </div>
                                    <CardContent className="p-0">
                                        <ul className="divide-y divide-border">{gr.bonifici.map(b => <RigaBonifico key={b.id} b={b} ibanPieno={vedeIban(operatore.funzione)} />)}</ul>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card>
                                <CardContent className="p-0">
                                    <ul className="divide-y divide-border">{elenco.map(b => <RigaBonifico key={b.id} b={b} ibanPieno={vedeIban(operatore.funzione)} />)}</ul>
                                </CardContent>
                            </Card>
                        )}

                        <p className="text-xs text-muted-foreground">
                            Le provvigioni arrivano qui da <Link to="/dashboard/admin/provvigioni" className="text-primary hover:underline">Provvigioni</Link> quando la richiesta di prelievo è verificata;
                            gli indennizzi da <Link to="/dashboard/admin/indennizzi" className="text-primary hover:underline">Indennizzi</Link> quando sono autorizzati.
                            L’IBAN per intero lo vedono solo tesoreria e responsabile amministrativa.
                        </p>
                    </section>
                )}

                <NotaGaranzia>
                    <Link to="/dashboard/admin/indennizzi" className="underline font-medium inline-flex items-center gap-1">
                        Per avere un indennizzo da eseguire: disponilo e autorizzalo in Indennizzi <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </NotaGaranzia>
            </div>
        </>
    );
};

export default BonificiPage;
