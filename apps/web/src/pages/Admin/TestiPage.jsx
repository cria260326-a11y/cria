import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { Download, ExternalLink, Eye, History, PenLine, RotateCcw, Search, Send, TriangleAlert, Undo2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import Contatore from '@/components/aree/Contatore';
import Ricco from '@/components/testi/Ricco';
import { PAGINE, VOCI, segnapostoDi } from '@/testi/catalogo';
import {
    EVENTO_TESTI, accendiAnteprima, caricaCronologia, caricaRighe, pubblica, salvaBozza, scartaBozza, tornaAllOriginale,
} from '@/lib/testiFonte';

// ═════════════════════════════════════════════════════════════════════════════
// TESTI DEL SITO — le scritte della vetrina, cambiate senza un rilascio.
// Come in Empathy: si modifica, si salva la BOZZA (il sito non cambia), poi si
// PUBBLICA (il sito mostra il testo nuovo a chi apre la pagina). Si può sempre
// tornare all'originale, che resta nel codice. Ogni pubblicazione finisce nella
// cronologia, con chi e quando.
// Il salvataggio rifiuta un testo che perde o inventa un segnaposto {…}: sono
// i punti in cui il sito mette prezzi e giorni dal listino.
// ═════════════════════════════════════════════════════════════════════════════

const STATI = {
    originale: { etichetta: 'Originale', classe: 'bg-gray-100 text-gray-700' },
    pubblicato: { etichetta: 'Pubblicato', classe: 'bg-green-100 text-green-800' },
    bozza: { etichetta: 'Bozza da pubblicare', classe: 'bg-amber-100 text-amber-800' },
};

const statoDi = (riga) => (riga?.bozza != null ? 'bozza' : riga?.pubblicato != null ? 'pubblicato' : 'originale');

const quando = (iso) => (iso ? new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');

const stessiSegnaposto = (a, b) => JSON.stringify(segnapostoDi(a)) === JSON.stringify(segnapostoDi(b));

// Un asterisco rimasto solo, dopo aver tolto le evidenze e i grassetti chiusi.
const asteriscoSolo = (testo) => testo.replace(/\*\*[^*\n]+\*\*/g, '').replace(/\*[^*\n]+\*/g, '').includes('*');

const controlla = (testo, originale) => {
    if (!testo.trim()) return 'Il testo non può essere vuoto: per togliere la modifica usa «Torna all’originale».';
    if (testo.length > 5000) return 'Troppo lungo: al massimo 5000 caratteri.';
    if (!stessiSegnaposto(testo, originale)) {
        const servono = segnapostoDi(originale).map(s => `{${s}}`).join(' ') || 'nessuno';
        return `I segnaposto devono restare quelli dell’originale: ${servono}.`;
    }
    if (asteriscoSolo(testo)) return 'C’è un asterisco senza il suo compagno: *parole* per l’evidenza, **parole** per il grassetto.';
    return null;
};

// ─── Una voce ─────────────────────────────────────────────────────────────────
const Voce = ({ voce, riga, onAggiorna }) => {
    const [modifica, setModifica] = useState(false);
    const [testo, setTesto] = useState('');
    const [cronologia, setCronologia] = useState(null);
    const [lavoro, setLavoro] = useState(false);

    const stato = statoDi(riga);
    const attuale = riga?.bozza ?? riga?.pubblicato ?? voce.testo;
    const errore = modifica ? controlla(testo, voce.testo) : null;
    const segnaposto = segnapostoDi(voce.testo);

    const esegui = async (azione, messaggio) => {
        setLavoro(true);
        try {
            await azione();
            if (messaggio) toast.success(messaggio);
            onAggiorna();
        } catch (e) {
            toast.error(e?.code === '42501' ? 'Solo l’admin può cambiare i testi del sito.' : 'Non sono riuscito a salvare: riprova tra poco.');
        } finally {
            setLavoro(false);
        }
    };

    const apri = () => {
        setTesto(attuale);
        setModifica(true);
    };

    const salva = () => esegui(async () => {
        await salvaBozza(voce.chiave, testo);
        setModifica(false);
    }, 'Bozza salvata. Sul sito non c’è ancora: premi «Pubblica».');

    const mostraCronologia = async () => {
        if (cronologia) {
            setCronologia(null);
            return;
        }
        try {
            setCronologia(await caricaCronologia(voce.chiave));
        } catch {
            toast.error('Non riesco a leggere la cronologia.');
        }
    };

    return (
        <li className="p-4 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{voce.etichetta}</p>
                    <p className="text-[11px] text-muted-foreground font-mono break-all">{voce.chiave}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STATI[stato].classe}`}>{STATI[stato].etichetta}</span>
            </div>

            {!modifica ? (
                <>
                    <p className="text-sm text-foreground whitespace-pre-line rounded-lg bg-muted/40 px-3 py-2">{attuale}</p>
                    {stato !== 'originale' && (
                        <details className="text-xs text-muted-foreground">
                            <summary className="cursor-pointer">L’originale</summary>
                            <p className="mt-1 whitespace-pre-line">{voce.testo}</p>
                            {stato === 'bozza' && riga?.pubblicato != null && <p className="mt-1">Ora sul sito: {riga.pubblicato}</p>}
                        </details>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                        {stato === 'bozza' && `Bozza di ${riga.bozza_di || '—'}, ${quando(riga.bozza_il)}. `}
                        {riga?.pubblicato != null && `Pubblicato da ${riga.pubblicato_di || '—'}, ${quando(riga.pubblicato_il)}.`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={apri} disabled={lavoro}><PenLine className="w-3.5 h-3.5" /> Modifica</Button>
                        {stato === 'bozza' && (
                            <>
                                <Button size="sm" className="gap-1.5" disabled={lavoro} onClick={() => esegui(() => pubblica([voce.chiave]), 'Pubblicato: il sito mostra il testo nuovo.')}>
                                    <Send className="w-3.5 h-3.5" /> Pubblica
                                </Button>
                                <Button size="sm" variant="ghost" className="gap-1.5" disabled={lavoro} onClick={() => esegui(() => scartaBozza(voce.chiave), 'Bozza scartata.')}>
                                    <Undo2 className="w-3.5 h-3.5" /> Scarta la bozza
                                </Button>
                            </>
                        )}
                        {riga && (
                            <Button
                                size="sm" variant="ghost" className="gap-1.5" disabled={lavoro}
                                onClick={() => {
                                    if (window.confirm('Il sito tornerà a mostrare il testo originale, e la bozza si perde. Procedo?')) {
                                        esegui(() => tornaAllOriginale(voce.chiave), 'Il sito mostra di nuovo l’originale.');
                                    }
                                }}
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Torna all’originale
                            </Button>
                        )}
                        <Button size="sm" variant="ghost" className="gap-1.5" onClick={mostraCronologia}><History className="w-3.5 h-3.5" /> Cronologia</Button>
                    </div>
                    {cronologia && (
                        <div className="rounded-lg border border-border p-3 space-y-2">
                            {cronologia.length === 0 && <p className="text-xs text-muted-foreground">Mai pubblicato: il sito mostra l’originale da sempre.</p>}
                            {cronologia.map(c => (
                                <div key={c.id} className="text-xs">
                                    <p className="text-muted-foreground">{c.azione === 'pubblicato' ? 'Pubblicato' : 'Tornato all’originale'} · {c.di || '—'} · {quando(c.il)}</p>
                                    {c.valore != null && (
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-foreground whitespace-pre-line">{c.valore}</p>
                                            <button type="button" className="text-primary hover:underline flex-shrink-0" onClick={() => { setTesto(c.valore); setModifica(true); setCronologia(null); }}>
                                                Riprendi
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="space-y-2">
                    <Textarea
                        value={testo}
                        onChange={e => setTesto(e.target.value)}
                        rows={voce.lungo || testo.length > 120 ? 5 : 2}
                        className="bg-white"
                        aria-label={`Nuovo testo: ${voce.etichetta}`}
                    />
                    {segnaposto.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                            Da lasciare come sono, li riempie il sito: {segnaposto.map(s => `{${s}}`).join(' ')}
                        </p>
                    )}
                    {errore && testo !== attuale && (
                        <p className="flex items-start gap-1.5 text-xs text-red-700"><TriangleAlert className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {errore}</p>
                    )}
                    {!errore && (
                        <div className="rounded-lg border border-border bg-white px-3 py-2">
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Anteprima</p>
                            <p className="text-sm text-foreground"><Ricco>{testo}</Ricco></p>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" disabled={lavoro || Boolean(errore) || testo === attuale} onClick={salva}>Salva la bozza</Button>
                        <Button size="sm" variant="outline" onClick={() => setModifica(false)}>Annulla</Button>
                    </div>
                </div>
            )}
        </li>
    );
};

// ─── Esporta ──────────────────────────────────────────────────────────────────
// Un CSV con tutte le voci: dove stanno, l'originale, quello pubblicato e la
// bozza. Con il BOM, se no Excel rovina le lettere accentate.
const esportaCsv = (righe) => {
    const cella = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const intestazione = ['Pagina', 'Sezione', 'Voce', 'Chiave', 'Originale', 'Pubblicato', 'Bozza'];
    const linee = VOCI.map(v => [v.nomePagina, v.sezione, v.etichetta, v.chiave, v.testo, righe[v.chiave]?.pubblicato, righe[v.chiave]?.bozza].map(cella).join(';'));
    const blob = new Blob([`﻿${[intestazione.map(cella).join(';'), ...linee].join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `testi-sito-cria-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

// ─── La pagina ────────────────────────────────────────────────────────────────
const EditorTesti = () => {
    const [righe, setRighe] = useState({});
    const [caricati, setCaricati] = useState(false);
    const [pagina, setPagina] = useState(PAGINE[0]?.id);
    const [cerca, setCerca] = useState('');
    const [filtro, setFiltro] = useState('tutti');
    const [pubblicando, setPubblicando] = useState(false);

    const ricarica = useCallback(() => caricaRighe()
        .then(r => { setRighe(r); setCaricati(true); })
        .catch(() => { toast.error('Non riesco a leggere i testi: sei entrato come admin?'); setCaricati(true); }), []);

    useEffect(() => {
        ricarica();
        window.addEventListener(EVENTO_TESTI, ricarica);
        return () => window.removeEventListener(EVENTO_TESTI, ricarica);
    }, [ricarica]);

    const bozze = useMemo(() => Object.values(righe).filter(r => r.bozza != null).map(r => r.chiave), [righe]);
    const modificati = useMemo(() => Object.values(righe).filter(r => r.pubblicato != null).length, [righe]);

    const voci = useMemo(() => {
        const q = cerca.trim().toLowerCase();
        return VOCI.filter(v => {
            if (!q && v.pagina !== pagina) return false;
            const riga = righe[v.chiave];
            if (filtro === 'modificati' && !riga) return false;
            if (filtro === 'bozze' && riga?.bozza == null) return false;
            if (!q) return true;
            return [v.chiave, v.etichetta, v.sezione, v.testo, riga?.bozza, riga?.pubblicato].some(x => String(x || '').toLowerCase().includes(q));
        });
    }, [cerca, pagina, filtro, righe]);

    // Per pagina e per sezione, nell'ordine in cui stanno sul sito.
    const gruppi = useMemo(() => {
        const out = [];
        voci.forEach(v => {
            const chiave = `${v.pagina}|${v.sezione}`;
            let g = out.find(x => x.chiave === chiave);
            if (!g) {
                g = { chiave, pagina: v.nomePagina, percorso: v.percorso, sezione: v.sezione, voci: [] };
                out.push(g);
            }
            g.voci.push(v);
        });
        return out;
    }, [voci]);

    const pubblicaTutte = async () => {
        setPubblicando(true);
        try {
            const n = await pubblica(bozze);
            toast.success(n === 1 ? 'Pubblicata 1 bozza: il sito è aggiornato.' : `Pubblicate ${n} bozze: il sito è aggiornato.`);
        } catch (e) {
            toast.error(e?.code === '42501' ? 'Solo l’admin può pubblicare.' : 'Pubblicazione non riuscita: riprova tra poco.');
        } finally {
            setPubblicando(false);
        }
    };

    const paginaScelta = PAGINE.find(p => p.id === pagina);

    return (
        <div className="space-y-6">
            <Helmet><title>Testi del sito - CRIA</title></Helmet>
            <IntestazionePagina
                titolo="Testi del sito"
                sottotitolo="Le scritte della vetrina. Modifichi e salvi la bozza, poi pubblichi: il sito si aggiorna senza un rilascio."
                azioni={(
                    <>
                        <Button variant="outline" className="gap-2" onClick={() => esportaCsv(righe)}><Download className="w-4 h-4" /> Esporta CSV</Button>
                        <Button className="gap-2" disabled={!bozze.length || pubblicando} onClick={pubblicaTutte}>
                            <Send className="w-4 h-4" /> {bozze.length ? `Pubblica ${bozze.length === 1 ? 'la bozza' : `le ${bozze.length} bozze`}` : 'Nessuna bozza'}
                        </Button>
                    </>
                )}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Contatore etichetta="Testi della vetrina" valore={VOCI.length} colore="bg-primary" />
                <Contatore etichetta="Pagine" valore={PAGINE.length} colore="bg-slate-500" />
                <Contatore etichetta="Cambiati e pubblicati" valore={modificati} colore="bg-green-600" />
                <Contatore etichetta="Bozze da pubblicare" valore={bozze.length} colore="bg-amber-500" />
            </div>

            <Card>
                <CardContent className="pt-4 pb-4 space-y-2 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Come si scrive.</strong> <code>*parole*</code> mette in evidenza (per esempio il corsivo colorato dei titoli), <code>**parole**</code> in grassetto; l’a capo va a capo.</p>
                    <p>Le parole fra graffe, come <code>{'{prezzo}'}</code>, le riempie il sito con i valori del listino: vanno lasciate come sono. Prezzi e nomi dei prodotti si cambiano da Prodotti.</p>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-4 pb-4 flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[14rem]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input value={cerca} onChange={e => setCerca(e.target.value)} placeholder="Cerca in tutte le pagine: testo, voce o chiave" className="pl-9" aria-label="Cerca nei testi" />
                    </div>
                    <select value={filtro} onChange={e => setFiltro(e.target.value)} aria-label="Quali testi" className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                        <option value="tutti">Tutti i testi</option>
                        <option value="modificati">Solo quelli cambiati</option>
                        <option value="bozze">Solo le bozze</option>
                    </select>
                </CardContent>
            </Card>

            {!cerca.trim() && (
                <div className="flex flex-wrap gap-2">
                    {PAGINE.map(p => {
                        const cambiati = p.testi.filter(v => righe[v.chiave]).length;
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setPagina(p.id)}
                                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${p.id === pagina ? 'bg-[#1A2D52] text-white border-[#1A2D52]' : 'bg-card border-border hover:bg-muted'}`}
                            >
                                {p.nome} <span className="opacity-70">· {p.testi.length}{cambiati ? ` · ${cambiati} cambiati` : ''}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {!cerca.trim() && paginaScelta && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <a href={paginaScelta.percorso} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                        Apri la pagina {paginaScelta.nome} <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {bozze.length > 0 && (
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 text-primary hover:underline"
                            onClick={() => { accendiAnteprima(true); window.open(paginaScelta.percorso, '_blank', 'noopener'); }}
                        >
                            <Eye className="w-3.5 h-3.5" /> Guarda le bozze sulla pagina, prima di pubblicarle
                        </button>
                    )}
                </div>
            )}

            {!caricati && <p className="text-sm text-muted-foreground">Leggo i testi…</p>}
            {caricati && gruppi.length === 0 && (
                <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nessun testo trovato.</CardContent></Card>
            )}

            {caricati && gruppi.map(g => (
                <Card key={g.chiave}>
                    <div className="px-4 pt-4 pb-2">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">{cerca.trim() ? `${g.pagina} · ` : ''}{g.sezione}</p>
                    </div>
                    <ul className="divide-y divide-border border-t border-border">
                        {g.voci.map(v => <Voce key={v.chiave} voce={v} riga={righe[v.chiave]} onAggiorna={ricarica} />)}
                    </ul>
                </Card>
            ))}
        </div>
    );
};

// Testi e FAQ li cambia l'admin (decisione del titolare): gli altri lo leggono qui.
const TestiPage = () => {
    const { operatore } = useOperatoreAttivo();
    if (operatore?.funzione === 'admin') return <EditorTesti />;
    return (
        <div className="space-y-6">
            <Helmet><title>Testi - CRIA</title></Helmet>
            <IntestazionePagina titolo="Testi del sito" />
            <Card className="border-dashed">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">I testi del sito li cambia l’admin.</CardContent>
            </Card>
        </div>
    );
};

export default TestiPage;
