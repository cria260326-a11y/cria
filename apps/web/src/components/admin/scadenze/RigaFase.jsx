import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CornerRightUp, Hourglass, Lock, Pause, Play, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FUNZIONI, nomeOperatore } from '@/data/operatori';
import { CAUSALI_PROROGA, FONTE_DURATA, dalData, ilData } from '@/data/scadenze';
import { STATI_FASE, testoMancano } from '@/lib/scadenzeDemo';
import { etichettaCalendario } from '@/lib/calendario';
import { fmtData } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// Una fase del motore delle scadenze: cosa, da quando, entro quando, cosa
// succede alla scadenza e a chi sale. Sotto, le proroghe con chi le ha concesse.
// ═════════════════════════════════════════════════════════════════════════════

export const Chip = ({ classe, children, title }) => (
    <span title={title} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${classe}`}>{children}</span>
);

const CHI_CLIENTE = { proprietario: 'Il proprietario', inquilino: 'L’inquilino' };

// «C. L.» al posto di «Chiara Lombardi», per chi vede i termini e non i dati.
export const iniziali = (nome) => String(nome || '').split(/\s+/).filter(Boolean).map(p => `${p[0].toUpperCase()}.`).join(' ');

const minuscola = (t) => t.charAt(0).toLowerCase() + t.slice(1);

export const statoInBreve = (f) => {
    if (f.stato === 'chiusa') {
        return f.nelTermine
            ? { etichetta: f.conProrogaFuoriLista ? 'Chiusa nel termine, con proroga' : 'Chiusa nel termine', classe: 'bg-green-50 text-green-800 border border-green-200' }
            : { etichetta: 'Chiusa fuori termine', classe: 'bg-red-50 text-red-800 border border-red-200' };
    }
    return STATI_FASE[f.stato];
};

const Voce = ({ etichetta, children }) => (
    <div className="min-w-0">
        <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{etichetta}</dt>
        <dd className="text-sm text-foreground break-words">{children}</dd>
    </div>
);

const quantoManca = (f) => {
    if (f.chiusaIl) return fmtData(f.chiusaIl);
    switch (f.stato) {
        case 'futura': return `parte ${ilData(f.decorrenza)}`;
        case 'sospesa': return 'termine fermo';
        case 'conseguenza_applicata': return 'scaduta';
        case 'non_dovuta': return 'non serve più';
        case 'in_attesa': return '—';
        default: return testoMancano(f);
    }
};

const Proroga = ({ p, conteggio }) => {
    const unita = (n) => etichettaCalendario(conteggio, n);
    const causale = CAUSALI_PROROGA[p.causale]?.etichetta || p.causale;
    let cosa;
    if (p.fuoriLista) cosa = `Fuori lista, +${p.giorni} ${unita(p.giorni)}`;
    else if (p.sospende) cosa = p.ripresaIl ? `${causale}: termine fermo, poi ripreso ${ilData(p.ripresaIl)}` : `${causale}: termine fermo`;
    else cosa = `${causale}, +${p.giorni} ${unita(p.giorni)}`;
    return (
        <li className={`rounded-lg px-3 py-2 text-xs ${p.fuoriLista ? 'bg-amber-50 border border-amber-200 text-amber-950' : 'bg-muted/40 text-foreground'}`}>
            <span className="font-medium">{cosa}</span>
            <span className="text-muted-foreground"> · concessa da {nomeOperatore(p.concessaDa)} {ilData(p.concessaIl)}</span>
            {p.motivazione && <span className="block mt-1 italic">«{p.motivazione}»</span>}
        </li>
    );
};

/**
 * @param {{ f: object, onProroga?: (f) => void, onRiprendi?: (f) => void, mascherato?: boolean }} props
 *   mascherato  il nome della persona diventa iniziali (vista del DPO)
 */
const RigaFase = ({ f, onProroga, onRiprendi, mascherato = false }) => {
    const stato = statoInBreve(f);
    const diCria = f.chi === 'cria';
    const dettaglio = mascherato && f.soggetto ? f.dettaglio.split(f.soggetto).join(iniziali(f.soggetto)) : f.dettaglio;
    const aperta = ['in_corso', 'in_scadenza', 'scaduta'].includes(f.stato);
    const chiusa = Boolean(f.chiusaIl) || ['conseguenza_applicata', 'non_dovuta'].includes(f.stato);

    return (
        <li className={`p-4 sm:p-5 space-y-3 ${f.risalita ? 'bg-amber-50/40' : ''}`}>
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                <div className="min-w-0 flex-1 basis-60">
                    <p className="font-semibold text-foreground">{f.titolo}</p>
                    <p className="text-sm text-muted-foreground break-words">
                        <span className="text-foreground">{f.oggetto}</span>{dettaglio ? ` · ${dettaglio}` : ''}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    <Chip classe={stato.classe}>{stato.etichetta}</Chip>
                    <Chip
                        classe={f.conteggio === 'lavorativi' ? 'bg-slate-100 text-slate-700' : 'bg-sky-50 text-sky-800'}
                        title={f.conteggio === 'lavorativi' ? 'Termine interno: si contano i giorni lavorativi' : 'Termine verso il cliente: si contano i giorni solari'}
                    >
                        {f.conteggio === 'lavorativi' ? 'Giorni lavorativi' : 'Giorni solari'}
                    </Chip>
                    {f.fonteDurata === 'ipotesi' && (
                        <Chip classe="bg-violet-50 text-violet-800" title="Nessun documento fissa questa durata">Durata: {FONTE_DURATA.ipotesi}</Chip>
                    )}
                </div>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                <Voce etichetta="Decorrenza">
                    {f.decorrenza ? fmtData(f.decorrenza) : 'Non ancora'}
                    <span className="block text-xs text-muted-foreground">{minuscola(f.regolaDecorrenza)}</span>
                </Voce>
                <Voce etichetta="Termine">
                    {f.termine ? fmtData(f.termine) : '—'}
                    {f.prorogata && <span className="block text-xs text-muted-foreground">era {ilData(f.termineBase)}</span>}
                </Voce>
                <Voce etichetta={f.chiusaIl ? 'Chiusa il' : 'Quanto manca'}>{quantoManca(f)}</Voce>
                <Voce etichetta="Chi">
                    {diCria
                        ? <>{nomeOperatore(f.assegnatario)}<span className="block text-xs text-muted-foreground">{FUNZIONI[f.funzione]?.etichetta}</span></>
                        : <>{CHI_CLIENTE[f.chi]}<span className="block text-xs text-muted-foreground">segue {nomeOperatore(f.assegnatario)}</span></>}
                </Voce>
            </dl>

            {f.stato === 'in_attesa' && f.attesa && (
                <p className="flex items-start gap-2 text-xs text-muted-foreground"><Hourglass className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {f.attesa}</p>
            )}
            {f.tappa && !chiusa && (
                <p className="text-xs text-foreground"><span className="font-medium">{f.tappa.etichetta}</span> {ilData(f.tappa.data)}</p>
            )}
            {f.nota && <p className="text-xs text-muted-foreground">{f.nota}</p>}
            {chiusa && f.esito && <p className="text-xs text-foreground"><span className="font-medium">Esito:</span> {f.esito}</p>}
            {!chiusa && (
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Alla scadenza:</span> {f.conseguenza}</p>
            )}

            {f.risalita && (
                <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                    <ArrowUpRight className="w-4 h-4 flex-shrink-0 text-amber-700" />
                    <span>
                        <span className="font-semibold">Salita a {nomeOperatore(f.risalita.a)}</span>, responsabile di chi la segue, {ilData(f.risalita.dal)}
                        {f.risalita.anche.length > 0 && <>; in copia al DPO, {f.risalita.anche.map(nomeOperatore).join(', ')}</>}.
                    </span>
                </p>
            )}
            {f.prossimaRisalita && (
                <p className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CornerRightUp className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>Se non si chiude, {ilData(f.prossimaRisalita.dal)} sale a {nomeOperatore(f.prossimaRisalita.a)}{f.prossimaRisalita.anche.length > 0 ? ' e al DPO' : ''}.</span>
                </p>
            )}
            {!diCria && !chiusa && (
                <p className="text-xs text-muted-foreground">Termine del cliente: non sale a nessuno, vale la conseguenza del contratto.</p>
            )}

            {f.proroghe.length > 0 && (
                <ul className="space-y-1.5">{f.proroghe.map(p => <Proroga key={p.id} p={p} conteggio={f.conteggio} />)}</ul>
            )}

            {(aperta || f.stato === 'sospesa' || (f.percorso && !mascherato)) && (
                <div className="flex flex-wrap items-center gap-2">
                    {aperta && f.proroga !== 'mai' && onProroga && (
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onProroga(f)}>
                            <CalendarPlus className="w-3.5 h-3.5" /> Proroga
                        </Button>
                    )}
                    {f.stato === 'sospesa' && (
                        <>
                            <span className="inline-flex items-center gap-1 text-xs text-purple-800"><Pause className="w-3.5 h-3.5" /> Ferma {dalData(f.sospesa.concessaIl)}: contenzioso aperto</span>
                            {onRiprendi && (
                                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onRiprendi(f)}>
                                    <Play className="w-3.5 h-3.5" /> Contenzioso chiuso: riprendi
                                </Button>
                            )}
                        </>
                    )}
                    {aperta && f.proroga === 'mai' && (
                        <span className="inline-flex items-start gap-1.5 text-xs text-muted-foreground"><Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {f.senzaProroga}</span>
                    )}
                    {f.percorso && !mascherato && (
                        <Link to={f.percorso} className="text-xs font-medium text-primary hover:underline sm:ml-auto">Apri la coda →</Link>
                    )}
                </div>
            )}
        </li>
    );
};

export default RigaFase;
