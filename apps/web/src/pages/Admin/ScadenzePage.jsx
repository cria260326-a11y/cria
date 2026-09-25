import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowUpRight, AlarmClock, TimerOff, Gauge, RotateCcw, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import NotaMockup from '@/components/NotaMockup';
import InfoSpiegazione from '@/components/aree/InfoSpiegazione';
import RigaFase from '@/components/admin/scadenze/RigaFase';
import DialogProroga from '@/components/admin/scadenze/DialogProroga';
import CruscottoMese from '@/components/admin/scadenze/CruscottoMese';
import CausaliProroga from '@/components/admin/scadenze/CausaliProroga';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import {
    useFasi, useProroghe, fasiDi, riprendiTermine, ripristinaScadenzeDemo, riepilogoFasiChiuse, GRUPPI_STATO, STATI_APERTI,
} from '@/lib/scadenzeDemo';
import { OGGI } from '@/data/datiDemo';
import { FUNZIONI } from '@/data/operatori';
import { CALENDARI, ORDINE_CALENDARI, FASI } from '@/data/scadenze';
import { fmtDataLunga } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// SCADENZE — O-18, con le proroghe (O-19)
// Il motore delle scadenze (§13.6): ogni fase con decorrenza, termine e
// conseguenza, sui calendari di attivazione, ciclo mensile e morosità, più
// CRIA Verifica, autocandidatura e GDPR. I termini interni in giorni
// lavorativi, quelli verso il cliente in giorni solari. Quando una fase di CRIA
// arriva vicino al termine o lo supera, sale al responsabile di chi la segue.
// La direzione vede solo i numeri; il DPO vede i termini del GDPR, non i nomi.
// ═════════════════════════════════════════════════════════════════════════════

const FUNZIONI_CON_FASI = [...new Set(Object.values(FASI).map(d => d.funzione))];

const selettore = 'text-sm border border-border rounded-lg px-3 py-2 bg-background max-w-full';

// ─── Vista della direzione: solo numeri ───────────────────────────────────────
const VistaDirezione = ({ fasi, proroghe }) => {
    const righe = FUNZIONI_CON_FASI.map(funzione => {
        const sue = fasi.filter(f => f.funzione === funzione);
        return {
            funzione,
            aperte: sue.filter(f => STATI_APERTI.includes(f.stato)).length,
            risalita: sue.filter(f => f.risalita).length,
            scadute: sue.filter(f => f.stato === 'scaduta').length,
            chiuse: riepilogoFasiChiuse(sue),
        };
    });
    return (
        <div className="space-y-6">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                <ShieldCheck className="w-5 h-5 text-[#1A2D52] flex-shrink-0" />
                <p>La direzione vede solo dati aggregati, senza nomi (§13.5). Il caso singolo si apre su richiesta, come per chiunque.</p>
            </div>
            <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Per funzione</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y divide-border">
                        {righe.map(r => (
                            <li key={r.funzione} className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-4 text-sm">
                                <p className="col-span-2 sm:col-span-1 font-medium text-foreground">{FUNZIONI[r.funzione].etichetta}</p>
                                <p><span className="font-semibold tabular-nums">{r.aperte}</span> <span className="text-muted-foreground">aperte</span></p>
                                <p><span className="font-semibold tabular-nums">{r.risalita}</span> <span className="text-muted-foreground">in risalita</span></p>
                                <p><span className="font-semibold tabular-nums">{r.scadute}</span> <span className="text-muted-foreground">scadute</span></p>
                                <p>
                                    <span className="font-semibold tabular-nums">{r.chiuse.percentuale == null ? '—' : `${r.chiuse.percentuale}%`}</span>
                                    <span className="text-muted-foreground"> nel termine</span>
                                </p>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <CruscottoMese fasi={fasi} proroghe={proroghe} conOggetto={false} />
        </div>
    );
};

// ─── La pagina ────────────────────────────────────────────────────────────────
const ScadenzePage = () => {
    const { operatore, operatoreId } = useOperatoreAttivo();
    const fasi = useFasi();
    const proroghe = useProroghe();
    const [params, setParams] = useSearchParams();
    const location = useLocation();
    const [faseInProroga, setFaseInProroga] = useState(null);

    const livello = FUNZIONI[operatore.funzione]?.livello;
    const vistaDpo = operatore.funzione === 'dpo';
    const funzione = params.get('funzione') || 'tutte';
    const calendario = vistaDpo ? 'dati_personali' : (params.get('calendario') || 'tutti');
    const gruppo = GRUPPI_STATO[params.get('stato')] ? params.get('stato') : 'da_seguire';
    // «Le mie» è accesa di partenza per chi segue le fasi, spenta per i responsabili.
    const soloMie = params.has('mie') ? params.get('mie') === '1' : livello === 'operatore';

    const imposta = (chiave, valore) => {
        const p = new URLSearchParams(params);
        p.set(chiave, valore);
        setParams(p, { replace: true });
    };

    // Da un link con #cruscotto si arriva al cruscotto.
    useEffect(() => {
        if (location.hash === '#cruscotto') document.getElementById('cruscotto')?.scrollIntoView({ behavior: 'smooth' });
    }, [location.hash]);

    const mie = useMemo(() => fasiDi(fasi, operatoreId), [fasi, operatoreId]);

    const visibili = useMemo(() => (soloMie ? mie : fasi)
        .filter(f => funzione === 'tutte' || f.funzione === funzione)
        .filter(f => calendario === 'tutti' || f.calendario === calendario)
        .filter(GRUPPI_STATO[gruppo].filtro), [soloMie, mie, fasi, funzione, calendario, gruppo]);

    const perCalendario = ORDINE_CALENDARI
        .map(id => ({ id, fasi: visibili.filter(f => f.calendario === id) }))
        .filter(g => g.fasi.length);

    const contate = vistaDpo ? fasi.filter(f => f.calendario === 'dati_personali') : fasi;
    const inRisalita = contate.filter(f => f.risalita);
    const vicine = contate.filter(f => (f.stato === 'in_corso' || f.stato === 'in_scadenza') && f.mancano <= 2);
    const scadute = contate.filter(f => f.stato === 'scaduta');
    const storico = riepilogoFasiChiuse(contate);

    const riprendi = (f) => {
        if (riprendiTermine(f, operatoreId)) toast.success('Il termine riparte');
        else toast.error('Il termine lo fa ripartire chi segue la fase o il suo responsabile');
    };

    const ripristina = () => {
        ripristinaScadenzeDemo();
        toast.success('Proroghe demo ripristinate');
    };

    const intestazione = (
        <IntestazionePagina
            titolo="Scadenze"
            sottotitolo={`Ogni fase con decorrenza, termine e conseguenza. Termini interni in giorni lavorativi, verso il cliente in giorni solari. Oggi è il ${fmtDataLunga(OGGI)}.`}
        />
    );

    if (operatore.funzione === 'direzione') {
        return (
            <>
                <Helmet><title>Scadenze - CRIA</title></Helmet>
                <div className="space-y-6">{intestazione}<VistaDirezione fasi={fasi} proroghe={proroghe} /></div>
            </>
        );
    }

    return (
        <>
            <Helmet><title>Scadenze - CRIA</title></Helmet>

            <div className="space-y-6">
                {intestazione}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Contatore icona={ArrowUpRight} colore="bg-amber-500" valore={inRisalita.length} etichetta="In risalita" nota="Vicine al termine o scadute: salite al responsabile" />
                    <Contatore icona={AlarmClock} colore="bg-[#1A2D52]" valore={vicine.length} etichetta="Termini entro 2 giorni" nota="Nel calendario di ogni fase" />
                    <Contatore icona={TimerOff} colore="bg-red-500" valore={scadute.length} etichetta="Termine superato" nota="Fasi di CRIA ancora aperte" />
                    <Contatore
                        icona={Gauge}
                        colore="bg-green-600"
                        valore={storico.percentuale == null ? '—' : `${storico.percentuale}%`}
                        etichetta="Chiuse nel termine"
                        nota={`${storico.nelTermine} su ${storico.totale}${storico.conProrogaFuoriLista ? `, ${storico.conProrogaFuoriLista} con proroga fuori lista` : ''}`}
                    />
                </div>

                <Card>
                    <CardContent className="pt-4 pb-4 flex flex-wrap items-center gap-2">
                        {!vistaDpo && (
                            <>
                                <select aria-label="Funzione" value={funzione} onChange={e => imposta('funzione', e.target.value)} className={selettore}>
                                    <option value="tutte">Tutte le funzioni</option>
                                    {FUNZIONI_CON_FASI.map(f => <option key={f} value={f}>{FUNZIONI[f].etichetta}</option>)}
                                </select>
                                <select aria-label="Calendario" value={calendario} onChange={e => imposta('calendario', e.target.value)} className={selettore}>
                                    <option value="tutti">Tutti i calendari</option>
                                    {ORDINE_CALENDARI.map(c => <option key={c} value={c}>{CALENDARI[c].etichetta}</option>)}
                                </select>
                            </>
                        )}
                        <select aria-label="Stato" value={gruppo} onChange={e => imposta('stato', e.target.value)} className={selettore}>
                            {Object.entries(GRUPPI_STATO).map(([k, g]) => <option key={k} value={k}>{g.etichetta}</option>)}
                        </select>
                        <Button
                            type="button"
                            size="sm"
                            variant={soloMie ? 'default' : 'outline'}
                            aria-pressed={soloMie}
                            onClick={() => imposta('mie', soloMie ? '0' : '1')}
                            title="Le fasi che segui e quelle salite a te"
                        >
                            Le mie ({mie.length})
                        </Button>
                        <InfoSpiegazione etichetta="Come si contano i termini" className="ml-auto">
                            <p>Un termine contrattuale in giorni lavorativi si contesta: verso il cliente si contano i giorni solari, all’interno quelli lavorativi, senza sabati, domeniche e festivi.</p>
                            <p>Quando una fase di CRIA è vicina al termine o lo supera, sale al responsabile di chi la segue; quelle del GDPR anche al DPO. Le fasi del cliente non salgono: vale la conseguenza del contratto.</p>
                            {vistaDpo && <p className="font-medium text-foreground">Il DPO vede i termini del GDPR, non i dati: i nomi sono ridotti alle iniziali.</p>}
                        </InfoSpiegazione>
                    </CardContent>
                </Card>

                {perCalendario.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-sm text-muted-foreground">
                            Nessuna fase con questi filtri{soloMie ? ': prova a guardare tutte le fasi, non solo le tue' : ''}.
                        </CardContent>
                    </Card>
                ) : perCalendario.map(g => (
                    <Card key={g.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">{CALENDARI[g.id].etichetta} <span className="text-sm font-normal text-muted-foreground">· {g.fasi.length}</span></CardTitle>
                            <p className="text-xs text-muted-foreground">{CALENDARI[g.id].descrizione}</p>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ul className="divide-y divide-border border-t border-border">
                                {g.fasi.map(f => (
                                    <RigaFase key={f.id} f={f} mascherato={vistaDpo} onProroga={vistaDpo ? undefined : setFaseInProroga} onRiprendi={vistaDpo ? undefined : riprendi} />
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}

                <CruscottoMese fasi={contate} proroghe={proroghe} conOggetto={!vistaDpo} />

                <CausaliProroga />

                <NotaMockup>
                    <p>La data della demo è ferma al {fmtDataLunga(OGGI)}. Le proroghe che concedi restano in questo browser.</p>
                    <p className="mt-1">Per provare: entra come Nicola Pace e proroga la risposta alla contestazione di Via Verdi 5 con «Documenti attesi dal cliente»; poi come Luca Moretti concedi una proroga fuori lista e guardala nel cruscotto.</p>
                    <Button size="sm" variant="outline" className="mt-3 gap-2 bg-white" onClick={ripristina}>
                        <RotateCcw className="w-3.5 h-3.5" /> Ripristina le proroghe demo
                    </Button>
                </NotaMockup>
            </div>

            {faseInProroga && <DialogProroga key={faseInProroga.id} fase={faseInProroga} onClose={() => setFaseInProroga(null)} />}
        </>
    );
};

export default ScadenzePage;
