import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CalendarClock, CheckCircle2, CircleDashed, Clock, Plus, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AzioneSeparata from '@/components/admin/AzioneSeparata';
import { OGGI } from '@/data/datiDemo';
import { fmtEuro } from '@/data/catalogo';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { approvaPiano, calcolaRate, ilGiorno, proponiPiano, respingiPiano } from '@/lib/garanziaDemo';
import { aggiungiGiorniSolari } from '@/lib/calendario';
import { meseSuccessivo } from '@/lib/formato';
import AzioneGaranzia from './AzioneGaranzia';
import Chip from './Chip';
import Traccia from './Traccia';
import { STATO_PIANO, STATO_RATA, classeSelect } from './stati';

// ═════════════════════════════════════════════════════════════════════════════
// O-16 — IL PIANO DI RIENTRO, dentro la scheda della pratica.
// Il gestore propone, la responsabile legale approva o respinge: mai la stessa
// persona (§13.4). Poi l'inquilino lo accetta dalla sua area e paga le rate a
// CRIA. Un piano nuovo prende il posto di quello in corso solo quando è approvato.
// ═════════════════════════════════════════════════════════════════════════════

const IconaRata = ({ stato }) => {
    if (stato === 'pagata') return <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />;
    if (stato === 'in_scadenza' || stato === 'scaduta') return <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />;
    if (stato === 'saltata') return <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" aria-hidden="true" />;
    return <CircleDashed className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />;
};

const ElencoRate = ({ rate, conStato = true }) => (
    <ol className="divide-y divide-border rounded-lg border border-border">
        {rate.map(r => (
            <li key={r.n} className="flex items-center gap-3 px-3 sm:px-4 py-2.5 flex-wrap">
                <IconaRata stato={r.stato} />
                <div className="flex-1 min-w-[8rem]">
                    <p className="text-sm text-foreground">Rata {r.n}</p>
                    <p className="text-xs text-muted-foreground">Entro {ilGiorno(r.scadenza)}{r.pagataIl ? ` · pagata ${ilGiorno(r.pagataIl)}` : ''}</p>
                </div>
                <span className="text-sm font-medium tabular-nums text-foreground">{fmtEuro(r.importo)}</span>
                {conStato && r.stato && <Chip stato={STATO_RATA[r.stato]} />}
            </li>
        ))}
    </ol>
);

const passiDelPiano = (pi) => [
    { etichetta: 'Proposto', chi: pi.propostoDa, il: pi.propostoIl },
    pi.respintoIl
        ? { etichetta: 'Respinto', chi: pi.respintoDa, il: pi.respintoIl }
        : { etichetta: 'Approvato', chi: pi.approvatoDa, il: pi.approvatoIl, attesa: 'dalla responsabile legale' },
    ...(pi.respintoIl ? [] : [{ etichetta: 'Accettato', testoChi: 'dall’inquilino', il: pi.accettatoIl, attesa: 'dall’inquilino, nella sua area' }]),
];

const Cifra = ({ etichetta, valore }) => (
    <div className="p-3 rounded-lg bg-muted/30 min-w-0">
        <p className="text-base sm:text-lg font-bold tabular-nums text-foreground truncate">{valore}</p>
        <p className="text-xs text-muted-foreground">{etichetta}</p>
    </div>
);

// Il piano in corso (o approvato, completato, interrotto): cifre, avanzamento, traccia e rate.
const PianoAttivo = ({ pi }) => (
    <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
            <Chip stato={STATO_PIANO[pi.stato]} />
            {pi.nota && <p className="text-xs text-muted-foreground">{pi.nota}</p>}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Cifra etichetta="Già rientrati" valore={fmtEuro(pi.pagato)} />
            <Cifra etichetta="Da rientrare" valore={fmtEuro(pi.residuo)} />
            <Cifra etichetta={`In ${pi.rate.length} rate`} valore={fmtEuro(pi.totale)} />
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={pi.totale} aria-valuenow={pi.pagato} aria-label="Quanto è già rientrato">
            <div className="h-full bg-green-500" style={{ width: `${pi.totale ? Math.round((pi.pagato / pi.totale) * 100) : 0}%` }} />
        </div>
        <Traccia passi={passiDelPiano(pi)} />
        <ElencoRate rate={pi.rate} />
    </div>
);

const PianoRientro = ({ pratica }) => {
    const { operatoreId } = useOperatoreAttivo();
    const attivo = pratica.pianoAttivo;
    const proposto = pratica.pianoProposto;
    const passati = pratica.piani.filter(pi => pi !== attivo && pi !== proposto);
    const residuo = pratica.importo - pratica.recuperato;
    const puoProporre = pratica.stato !== 'chiusa' && pratica.stato !== 'al_legale' && !proposto && residuo > 0;

    const [forma, setForma] = useState(false);
    const [nRate, setNRate] = useState(3);
    const [prima, setPrima] = useState(`${meseSuccessivo(OGGI.slice(0, 7))}-20`);
    const [nota, setNota] = useState('');
    const [respingo, setRespingo] = useState(false);
    const [motivo, setMotivo] = useState('');
    const anteprima = useMemo(() => (prima > OGGI ? calcolaRate(residuo, nRate, prima) : []), [residuo, nRate, prima]);

    const esito = (r, testo) => {
        if (!r.ok) {
            toast.error(r.motivo);
            return false;
        }
        toast.success(testo);
        return true;
    };

    const proponi = (e) => {
        e.preventDefault();
        if (esito(proponiPiano(pratica, operatoreId, { nRate, primaScadenza: prima, nota }), 'Piano proposto: ora lo decide la responsabile legale')) {
            setForma(false);
            setNota('');
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="w-5 h-5" /> Piano di rientro</CardTitle>
                <p className="text-xs text-muted-foreground">Il gestore propone, la responsabile legale approva: mai la stessa persona. Le rate si pagano a CRIA.</p>
            </CardHeader>
            <CardContent className="space-y-5">
                {proposto && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">
                                {attivo ? 'Nuovo piano proposto al posto di quello in corso' : 'Piano proposto'}: {proposto.rate.length} rate per {fmtEuro(proposto.totale)}
                            </p>
                            <Chip stato={STATO_PIANO.proposto} />
                        </div>
                        {proposto.nota && <p className="text-sm text-muted-foreground">{proposto.nota}</p>}
                        <Traccia passi={passiDelPiano(proposto)} />
                        <ElencoRate rate={proposto.rate} conStato={false} />
                        {!respingo ? (
                            <div className="flex flex-wrap items-start gap-3">
                                <AzioneSeparata azione="approva_piano" record={{ propostoDa: proposto.propostoDa }} className="bg-[#1A2D52] hover:bg-[#0F1B33]"
                                    onEsegui={() => esito(approvaPiano(pratica, proposto, operatoreId), 'Piano approvato: ora tocca all’inquilino accettarlo')}>
                                    Approva il piano
                                </AzioneSeparata>
                                <AzioneGaranzia azione="respingi_piano" record={{ propostoDa: proposto.propostoDa }} variant="outline" onEsegui={() => setRespingo(true)}>
                                    Respingi
                                </AzioneGaranzia>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="piano-motivo">Perché lo respingi</Label>
                                <Textarea id="piano-motivo" rows={2} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Il gestore lo legge per proporne un altro, o per chiedere il passaggio al legale." />
                                <div className="flex flex-wrap gap-2">
                                    <Button size="sm" variant="destructive" onClick={() => {
                                        if (esito(respingiPiano(proposto, operatoreId, motivo), 'Piano respinto')) {
                                            setRespingo(false);
                                            setMotivo('');
                                        }
                                    }}>Respingi il piano</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setRespingo(false)}>Annulla</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {attivo ? <PianoAttivo pi={attivo} /> : !proposto && (
                    <p className="text-sm text-muted-foreground">
                        {pratica.stato === 'chiusa' ? 'Nessun piano: la pratica si è chiusa prima.' : 'Nessun piano per ora. Si propone quando l’inquilino chiede di rateizzare.'}
                    </p>
                )}

                {puoProporre && !forma && (
                    <AzioneSeparata azione="proponi_piano" record={{}} variant="outline" className="gap-2" onEsegui={() => setForma(true)}>
                        <Plus className="w-4 h-4" /> {attivo ? 'Proponi un nuovo piano' : 'Proponi un piano'}
                    </AzioneSeparata>
                )}

                {forma && (
                    <form onSubmit={proponi} className="rounded-lg border border-border p-4 space-y-4 bg-muted/20">
                        <p className="text-sm text-foreground">
                            Da rientrare: <span className="font-semibold">{fmtEuro(residuo)}</span>
                            {pratica.recuperato > 0 && <span className="text-muted-foreground"> ({fmtEuro(pratica.importo)} meno {fmtEuro(pratica.recuperato)} già rientrati)</span>}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="piano-rate">Numero di rate</Label>
                                <select id="piano-rate" className={classeSelect} value={nRate} onChange={e => setNRate(Number(e.target.value))}>
                                    {Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} {n === 1 ? 'rata' : 'rate'}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="piano-prima">Prima scadenza</Label>
                                <Input id="piano-prima" type="date" min={aggiungiGiorniSolari(OGGI, 1)} value={prima} onChange={e => setPrima(e.target.value)} required />
                            </div>
                        </div>
                        {anteprima.length > 0 && <ElencoRate rate={anteprima} />}
                        <div className="space-y-1.5">
                            <Label htmlFor="piano-nota">Perché questo piano</Label>
                            <Textarea id="piano-nota" rows={2} value={nota} onChange={e => setNota(e.target.value)} placeholder="Cosa regge la rata: la responsabile legale lo legge prima di decidere." />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button type="submit" size="sm" className="bg-[#1A2D52] hover:bg-[#0F1B33]">Manda alla responsabile legale</Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setForma(false)}>Annulla</Button>
                        </div>
                    </form>
                )}

                {passati.length > 0 && (
                    <div className="space-y-2 pt-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Piani precedenti</p>
                        {passati.map(pi => (
                            <div key={pi.id} className="rounded-lg border border-border p-3 space-y-2">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm text-foreground">{pi.rate.length} rate per {fmtEuro(pi.totale)}{pi.pagato > 0 ? ` · rientrati ${fmtEuro(pi.pagato)}` : ''}</p>
                                    <Chip stato={STATO_PIANO[pi.stato]} />
                                </div>
                                <Traccia passi={passiDelPiano(pi)} />
                                {pi.motivoRespinta && <p className="text-xs text-muted-foreground">Motivo: {pi.motivoRespinta}</p>}
                                {pi.sostituitoIl && <p className="text-xs text-muted-foreground">Sostituito {ilGiorno(pi.sostituitoIl)} da un piano nuovo: le rate già pagate restano rientrate.</p>}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PianoRientro;
