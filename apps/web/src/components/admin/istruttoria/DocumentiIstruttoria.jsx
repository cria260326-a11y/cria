import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, FolderOpen, Lock, Clock, CheckCircle2, XCircle, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { fmtEuro } from '@/data/catalogo';
import { LIVELLI_PROVA } from '@/data/autocandidature';
import { MOTIVI_NON_CONFORMITA } from '@/data/istruttoria';
import { nomeOperatore } from '@/data/operatori';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import {
    STATI_DOCUMENTO, conservazione, puoAprire, verificaDocumento, registraLettura,
} from '@/lib/istruttoriaDemo';
import { fmtData, nomeMese } from '@/lib/formato';
import { Pill, periodoMesi } from '@/components/admin/istruttoria/Elementi';

// ═════════════════════════════════════════════════════════════════════════════
// O-08 — VERIFICA DEI DOCUMENTI, dentro l'istruttoria.
// Una persona guarda ogni documento e dice conforme o non conforme, con il
// motivo. Un documento non conforme si cancella subito e si chiede di nuovo:
// resta solo il registro del rifiuto. Movimenti del canone e reddito li apre
// solo chi ha la pratica in coda, e solo finché ce l'ha (§13.5); si cancellano
// 30 giorni dopo la delibera, e gli indicatori si estraggono prima (§14.5).
// ═════════════════════════════════════════════════════════════════════════════

const TONO = { rosso: 'text-red-700', ambra: 'text-amber-700', grigio: 'text-muted-foreground' };
const RICHIESTA_DI_NUOVO = {
    candidato: 'Si chiede di nuovo al candidato, dal suo link personale.',
    proprietario: 'Il proprietario lo vede «da integrare» nella sua pratica.',
    inquilino: 'L’autocandidatura prosegue senza questa prova: non conta per il minimo.',
};

const meseMeno = (mese, n) => {
    const [a, m] = mese.split('-').map(Number);
    const t = a * 12 + (m - 1) - n;
    return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`;
};

const SCOSTAMENTI = [0, -1, 1, 0, 1, -1, 0, 1, 0, -1, 0, 1];

// Nei mockup non c'è un file: l'anteprima mostra quello che il sistema ne ha
// estratto. Dei movimenti arrivano solo quelli del canone: data, importo, causale.
const Anteprima = ({ voce, doc }) => {
    const ind = voce.indicatori;
    if (doc.tipo === 'movimenti_canone' && ind?.movimenti) {
        const m = ind.movimenti;
        const arrivo = voce.arrivataIl.slice(0, 7);
        const righe = Array.from({ length: m.mensilita }, (_, i) => {
            const mese = meseMeno(arrivo, m.mensilita - i);
            const giorno = Math.min(28, Math.max(1, m.giornoMedio + SCOSTAMENTI[i % SCOSTAMENTI.length]));
            return { data: `${mese}-${String(giorno).padStart(2, '0')}`, causale: `Canone ${nomeMese(mese).toLowerCase()}` };
        });
        return (
            <div className="space-y-3">
                <div className="rounded-lg bg-muted/40 p-3 text-xs text-foreground space-y-1">
                    <p className="font-medium">Indicatori estratti</p>
                    <p>{m.mensilita} mensilità su {m.suMesi} · giorno medio {m.giornoMedio} · canone pagato {fmtEuro(m.canonePrecedente)}</p>
                    <p>
                        Importi {m.importiCoerenti ? 'coerenti' : 'non coerenti'} con il canone dichiarato · date {m.dateContinue ? 'continue' : 'con buchi'} · banca {m.bancaCoerente ? 'coerente' : 'diversa da quella dichiarata'}
                    </p>
                    <p className="text-muted-foreground">Gli indicatori restano anche dopo la cancellazione del documento.</p>
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-xs">
                        <thead className="bg-muted/40 text-muted-foreground">
                            <tr className="text-left"><th className="px-2.5 py-1.5 font-medium">Data</th><th className="px-2.5 py-1.5 font-medium text-right">Importo</th><th className="px-2.5 py-1.5 font-medium">Causale</th></tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {righe.map(r => (
                                <tr key={r.data}>
                                    <td className="px-2.5 py-1.5 tabular-nums whitespace-nowrap">{fmtData(r.data)}</td>
                                    <td className="px-2.5 py-1.5 tabular-nums text-right whitespace-nowrap">{fmtEuro(m.canonePrecedente)}</td>
                                    <td className="px-2.5 py-1.5">{r.causale}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
    if (doc.tipo === 'reddito' && ind?.reddito) {
        return (
            <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                <p className="font-medium text-foreground">Reddito netto mensile: {fmtEuro(ind.reddito.nettoMensile)}</p>
                <p className="text-muted-foreground">Fonte: {ind.reddito.fonte}. Il canone ne è il {Math.round((voce.raw.canone / ind.reddito.nettoMensile) * 100)}%.</p>
            </div>
        );
    }
    if (doc.estremi) {
        return (
            <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                <p className="font-medium text-foreground">{doc.file}</p>
                <p>Registrazione {doc.estremi.numero} del {fmtData(doc.estremi.data)} · {doc.estremi.ufficio}</p>
                <p className="text-muted-foreground">Controlla che gli estremi coincidano con la ricevuta: è questo che rende la prova forte.</p>
            </div>
        );
    }
    return (
        <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            Nei mockup non c’è un file vero. Controlla che sia leggibile, intestato a {doc.chi} e ancora valido.
        </div>
    );
};

const Origine = ({ doc }) => {
    if (doc.di === 'inquilino') {
        return (
            <p className="text-xs text-muted-foreground">
                {doc.file} · caricata il {fmtData(doc.caricataIl)}
                {doc.dal && ` · ${periodoMesi(doc.dal, doc.al)}`}
                {doc.immobile && ` · ${doc.immobile}`}
            </p>
        );
    }
    return <p className="text-xs text-muted-foreground">{doc.di === 'candidato' ? `Del candidato ${doc.chi}` : `Del proprietario · ${doc.chi}`}</p>;
};

const Storia = ({ doc }) => {
    if (doc.verificatoPrima) return <p className="text-xs text-muted-foreground">Verificato prima di questa coda.</p>;
    if (!doc.storico.length) return null;
    return (
        <ul className="space-y-0.5">
            {doc.storico.map((r, i) => (
                <li key={`${r.il}-${i}`} className="text-xs text-muted-foreground">
                    {r.esito === 'conforme' ? 'Conforme' : `Non conforme · ${MOTIVI_NON_CONFORMITA[r.motivo]?.etichetta || r.motivo}`}
                    {r.nota && ` · «${r.nota}»`} — {nomeOperatore(r.da)}, {fmtData(r.il)}
                </li>
            ))}
        </ul>
    );
};

const Rifiuto = ({ doc, onConferma, onAnnulla }) => {
    const motivi = Object.entries(MOTIVI_NON_CONFORMITA).filter(([, m]) => !m.soloPer || m.soloPer.includes(doc.tipo));
    const [motivo, setMotivo] = useState(motivi[0][0]);
    const [nota, setNota] = useState('');
    const serveNota = motivo === 'altro';
    return (
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 space-y-3">
            <p className="text-xs font-medium text-red-900">Perché non è conforme?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {motivi.map(([id, m]) => (
                    <label key={id} className={`flex items-start gap-2 rounded-md border px-2.5 py-2 text-xs cursor-pointer ${motivo === id ? 'border-red-400 bg-white' : 'border-red-100 bg-white/60'}`}>
                        <input type="radio" name={`motivo-${doc.chiave}`} className="mt-0.5 accent-red-600" checked={motivo === id} onChange={() => setMotivo(id)} />
                        <span>{m.etichetta}</span>
                    </label>
                ))}
            </div>
            <Textarea value={nota} onChange={e => setNota(e.target.value)} rows={2} placeholder={serveNota ? 'Spiega il motivo (obbligatorio)' : 'Nota per il registro (facoltativa)'} className="bg-white text-sm" />
            <p className="text-xs text-red-900">Il file si cancella subito, senza archiviarlo. {RICHIESTA_DI_NUOVO[doc.di]}</p>
            <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="destructive" disabled={serveNota && !nota.trim()} onClick={() => onConferma(motivo, nota)}>Rifiuta e cancella il file</Button>
                <Button size="sm" variant="outline" className="bg-white" onClick={onAnnulla}>Annulla</Button>
            </div>
        </div>
    );
};

const DocumentiIstruttoria = ({ voce }) => {
    const { operatore, operatoreId } = useOperatoreAttivo();
    const [aperto, setAperto] = useState(null);
    const [visti, setVisti] = useState(() => new Set());
    const [rifiuto, setRifiuto] = useState(null);

    // Verifica chi ha la pratica in coda, finché non è deliberata.
    const lavora = voce.fase !== 'deliberata'
        && (operatore.funzione === 'admin' || (operatore.funzione === 'istruttoria' && voce.assegnazione.operatoreId === operatoreId));
    const verificabili = voce.documenti.filter(d => d.verificabile);
    const conformi = verificabili.filter(d => d.stato === 'conforme').length;

    const apri = (doc) => {
        if (aperto === doc.chiave) { setAperto(null); return; }
        setAperto(doc.chiave);
        setVisti(v => new Set(v).add(doc.chiave));
        if (doc.sensibile) registraLettura({ voce, doc, da: operatoreId });
    };

    const conferma = (doc) => {
        verificaDocumento({ voce, doc, esito: 'conforme', da: operatoreId });
        setAperto(null);
        toast.success(`${doc.etichetta}: conforme`);
    };

    const rifiuta = (doc, motivo, nota) => {
        verificaDocumento({ voce, doc, esito: 'non_conforme', motivo, nota, da: operatoreId });
        setRifiuto(null);
        setAperto(null);
        toast.success(`${doc.etichetta}: non conforme. File cancellato e richiesto di nuovo`);
    };

    if (!voce.documenti.length) return null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                    <span className="flex items-center gap-2"><FolderOpen className="w-5 h-5" /> Documenti</span>
                    {voce.tipo !== 'contratto' && <span className="text-xs font-normal text-muted-foreground">{conformi} di {verificabili.length} conformi</span>}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    Li guarda una persona, uno per uno. Movimenti del canone e reddito li apre solo chi ha la pratica in coda, finché ce l’ha; ogni apertura resta nel registro.
                </p>
            </CardHeader>
            <CardContent className="space-y-3">
                {voce.documenti.map(d => {
                    const accesso = puoAprire(voce, d, operatoreId);
                    const tempo = conservazione(d, voce.conclusaIl);
                    const stato = STATI_DOCUMENTO[d.stato];
                    const daVerificare = lavora && d.verificabile && d.presente && d.stato === 'da_verificare';
                    const consensi = d.tipo === 'consenso' ? voce.raw.candidato?.consensi : null;
                    return (
                        <div key={d.chiave} className="rounded-lg border border-border p-3 space-y-2">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0 space-y-0.5">
                                    <p className="text-sm font-medium text-foreground flex flex-wrap items-center gap-2">
                                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        {d.etichetta}
                                        {d.sensibile && <Pill classe="bg-rose-50 text-rose-800">sensibile</Pill>}
                                        {d.livello && <Pill classe={`border ${LIVELLI_PROVA[d.livello].classe}`}>prova {LIVELLI_PROVA[d.livello].etichetta.toLowerCase()}</Pill>}
                                    </p>
                                    <Origine doc={d} />
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {d.ricaricato && <Pill classe="bg-blue-50 text-blue-800"><RotateCcw className="w-3 h-3" /> ricaricato</Pill>}
                                    {voce.tipo === 'contratto' ? <Pill>Cancellato</Pill> : <Pill classe={stato.classe}>{stato.etichetta}</Pill>}
                                </div>
                            </div>

                            {consensi && (
                                <p className="text-xs text-muted-foreground">
                                    Dato il {fmtData(consensi.il)} · informativa {consensi.versioneInformativa} · consenso all’inserimento nel database: {consensi.database ? 'sì' : 'no'}
                                </p>
                            )}
                            <Storia doc={d} />
                            {d.stato !== 'mancante' && (
                                <p className={`text-xs flex items-start gap-1.5 ${TONO[tempo.tono]}`}>
                                    <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {tempo.testo}
                                </p>
                            )}

                            {voce.tipo !== 'contratto' && d.verificabile && (
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {accesso.puo ? (
                                        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => apri(d)}>
                                            {aperto === d.chiave ? <><EyeOff className="w-3.5 h-3.5" /> Chiudi</> : <><Eye className="w-3.5 h-3.5" /> Apri</>}
                                        </Button>
                                    ) : (
                                        <p className="text-xs text-muted-foreground flex items-start gap-1.5"><Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {accesso.perche}</p>
                                    )}
                                    {daVerificare && (
                                        <>
                                            <Button size="sm" className="h-8 gap-1.5 bg-green-700 hover:bg-green-800" disabled={!visti.has(d.chiave)} onClick={() => conferma(d)}>
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Conforme
                                            </Button>
                                            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-red-700 border-red-200 hover:bg-red-50" onClick={() => setRifiuto(d.chiave)}>
                                                <XCircle className="w-3.5 h-3.5" /> Non conforme
                                            </Button>
                                            {!visti.has(d.chiave) && <span className="text-xs text-muted-foreground">Aprilo prima di dire che è conforme.</span>}
                                        </>
                                    )}
                                </div>
                            )}

                            {aperto === d.chiave && accesso.puo && <Anteprima voce={voce} doc={d} />}
                            {rifiuto === d.chiave && <Rifiuto doc={d} onConferma={(m, n) => rifiuta(d, m, n)} onAnnulla={() => setRifiuto(null)} />}
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};

export default DocumentiIstruttoria;
