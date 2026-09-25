import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, CalendarClock, ShieldCheck, ShieldOff, User, MessageSquare, Lock } from 'lucide-react';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import { useDatiProprietario } from '@/hooks/useDatiArea';
import { OGGI } from '@/data/datiDemo';
import { morositaDeiContratti } from '@/data/pratiche';
import { PRODOTTI, nomeProdotto, fmtEuro, COLORE_PRODOTTO } from '@/data/catalogo';
import { fmtData, fmtDataLunga, nomeMese, giorniTra } from '@/lib/formato';
import { COPERTURA } from '@/lib/etichette';

// P-16 — Pratica di morosità vista dal proprietario. Vede lo stato, i passaggi
// principali, il piano di rientro e l'indennizzo: la corrispondenza con
// l'inquilino e le valutazioni legali restano a CRIA e qui non si leggono.

const leggibile = (s) => {
    const t = String(s).replace(/_/g, ' ');
    return t.charAt(0).toUpperCase() + t.slice(1);
};

const STATO_PRATICA = {
    aperta: { etichetta: 'Aperta', classe: 'bg-red-100 text-red-800' },
    piano_in_corso: { etichetta: 'Piano di rientro in corso', classe: 'bg-amber-100 text-amber-800' },
    chiusa: { etichetta: 'Chiusa', classe: 'bg-gray-100 text-gray-700' },
};
const statoPratica = (s) => STATO_PRATICA[s] || { etichetta: leggibile(s), classe: 'bg-gray-100 text-gray-700' };

const STATO_RATA = {
    pagata: { etichetta: 'Pagata', classe: 'bg-green-100 text-green-800' },
    in_scadenza: { etichetta: 'In scadenza', classe: 'bg-amber-100 text-amber-800' },
    futura: { etichetta: 'Futura', classe: 'bg-slate-100 text-slate-700' },
};
const statoRata = (s) => STATO_RATA[s] || { etichetta: leggibile(s), classe: 'bg-gray-100 text-gray-700' };

const quandoScade = (iso) => {
    const n = giorniTra(OGGI, iso);
    if (n > 1) return `scade tra ${n} giorni`;
    if (n === 1) return 'scade domani';
    if (n === 0) return 'scade oggi';
    return `scaduta il ${fmtData(iso)}`;
};

// L'indennizzo si mostra così come arriva dalla pratica: qui non si calcola
// nessun importo e nessun tempo. I campi interni non si mostrano mai.
const CAMPI_INTERNI = /intern|legal|corrispond|valutaz/i;
const ETICHETTE_CAMPI = { stato: 'Stato', importo: 'Importo', mesi: 'Mesi', previstoIl: 'Previsto il', pagatoIl: 'Pagato il' };
const etichettaCampo = (k) => ETICHETTE_CAMPI[k] || leggibile(k.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase());
const valoreCampo = (k, v) => {
    if (v == null || v === '') return '—';
    if (typeof v === 'boolean') return v ? 'Sì' : 'No';
    if (typeof v === 'number') return /importo|totale|somma/i.test(k) ? fmtEuro(v, Number.isInteger(v) ? 0 : 2) : v.toLocaleString('it-IT');
    if (Array.isArray(v)) return v.map(x => valoreCampo(k, x)).filter(x => x != null).join(', ');
    if (typeof v === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return fmtData(v);
        if (/^\d{4}-\d{2}$/.test(v)) return nomeMese(v);
        return /^[a-z_]+$/.test(v) ? leggibile(v) : v;
    }
    return null; // oggetti annidati: non si indovina come mostrarli
};

const Voce = ({ etichetta, children }) => (
    <div>
        <p className="text-xs text-muted-foreground mb-0.5">{etichetta}</p>
        <p className="font-medium text-foreground">{children}</p>
    </div>
);

const Cifra = ({ etichetta, valore }) => (
    <div className="p-3 rounded-lg bg-muted/30">
        <p className="text-lg font-bold tabular-nums text-foreground">{valore}</p>
        <p className="text-xs text-muted-foreground">{etichetta}</p>
    </div>
);

const MorositaLocatorePage = () => {
    const { id } = useParams();
    const { contratti } = useDatiProprietario();
    const pratica = morositaDeiContratti(contratti).find(m => m.id === id);
    const c = pratica && contratti.find(x => x.id === pratica.contrattoId);

    if (!pratica || !c) {
        return (
            <div className="space-y-6">
                <IntestazionePagina titolo="Pratica non trovata" indietro={{ to: '/dashboard/locatore/immobili', label: 'I miei immobili' }} />
                <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Questa pratica di morosità non è tra le tue.</CardContent></Card>
            </div>
        );
    }

    const p = PRODOTTI[c.prodotto];
    const stato = statoPratica(pratica.stato);
    const mesi = pratica.mesi.map(m => nomeMese(m).toLowerCase()).join(', ');
    const eventi = [...pratica.eventi].sort((a, b) => a.il.localeCompare(b.il));

    const rate = pratica.piano?.rate || [];
    const totale = rate.reduce((s, r) => s + r.importo, 0);
    const pagato = rate.filter(r => r.stato === 'pagata').reduce((s, r) => s + r.importo, 0);
    const residuo = totale - pagato;
    const prossimaRata = rate.find(r => r.stato !== 'pagata');

    const mesiContratto = pratica.mesi.map(m => c.mesi.find(x => x.mese === m)).filter(Boolean);
    const campiIndennizzo = pratica.indennizzo
        ? Object.entries(pratica.indennizzo)
            .filter(([k]) => !CAMPI_INTERNI.test(k))
            .map(([k, v]) => [k, valoreCampo(k, v)])
            .filter(([, v]) => v != null)
        : [];

    return (
        <>
            <Helmet><title>Pratica di morosità - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    indietro={{ to: `/dashboard/locatore/immobili/${c.id}`, label: c.immobile.indirizzo }}
                    titolo={`Pratica di morosità · ${c.immobile.indirizzo}`}
                    sottotitolo={`${pratica.mesi.length === 1 ? 'Canone' : 'Canoni'} di ${mesi} non pagat${pratica.mesi.length === 1 ? 'o' : 'i'} · ${fmtEuro(pratica.importo)} · aperta il ${fmtDataLunga(pratica.apertaIl)}`}
                    badge={<span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${stato.classe}`}>{stato.etichetta}</span>}
                    azioni={
                        <Link to="/dashboard/locatore/assistenza">
                            <Button variant="outline" size="sm" className="gap-2"><MessageSquare className="w-4 h-4" /> Contatta CRIA</Button>
                        </Link>
                    }
                />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><History className="w-5 h-5" /> Cosa è successo</CardTitle></CardHeader>
                            <CardContent>
                                <ol className="relative ml-1.5 border-l border-border">
                                    {eventi.map((e, i) => (
                                        <li key={`${e.il}-${i}`} className="ml-5 pb-5 last:pb-0">
                                            <span className={`absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full border-2 border-background ${i === eventi.length - 1 ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                                            <p className="text-xs text-muted-foreground">{fmtDataLunga(e.il)}</p>
                                            <p className="text-sm font-medium text-foreground">{e.titolo}</p>
                                            <p className="text-sm text-muted-foreground">{e.testo}</p>
                                        </li>
                                    ))}
                                    {prossimaRata && (
                                        <li className="ml-5">
                                            <span className="absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full border-2 border-dashed border-muted-foreground/60 bg-background" />
                                            <p className="text-xs text-muted-foreground">In programma · {fmtDataLunga(prossimaRata.scadenza)}</p>
                                            <p className="text-sm font-medium text-foreground">Rata {prossimaRata.n} di {rate.length}: {fmtEuro(prossimaRata.importo)}</p>
                                            <p className="text-sm text-muted-foreground">La rata {quandoScade(prossimaRata.scadenza)}.</p>
                                        </li>
                                    )}
                                </ol>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="w-5 h-5" /> Piano di rientro</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {rate.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Nessun piano di rientro per ora. Se ne viene concordato uno, qui trovi le rate e cosa è già rientrato.</p>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-3 gap-3">
                                            <Cifra etichetta="Già rientrati" valore={fmtEuro(pagato)} />
                                            <Cifra etichetta="Da rientrare" valore={fmtEuro(residuo)} />
                                            <Cifra etichetta={`Totale in ${rate.length} rate`} valore={fmtEuro(totale)} />
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${totale ? Math.round((pagato / totale) * 100) : 0}%` }} />
                                        </div>
                                        <div className="divide-y divide-border rounded-lg border border-border">
                                            {rate.map(r => {
                                                const s = statoRata(r.stato);
                                                return (
                                                    <div key={r.n} className="flex items-center gap-4 px-4 py-3 flex-wrap">
                                                        <div className="flex-1 min-w-[10rem]">
                                                            <p className="text-sm font-medium text-foreground">Rata {r.n}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {r.stato === 'pagata' && r.pagataIl
                                                                    ? `Scadenza ${fmtData(r.scadenza)} · pagata il ${fmtData(r.pagataIl)}`
                                                                    : `Scadenza ${fmtData(r.scadenza)}${r.stato === 'in_scadenza' ? ` · ${quandoScade(r.scadenza)}` : ''}`}
                                                            </p>
                                                        </div>
                                                        <span className="text-sm font-medium tabular-nums text-foreground">{fmtEuro(r.importo)}</span>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${s.classe}`}>{s.etichetta}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><User className="w-5 h-5" /> Chi se ne occupa</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                <div className="col-span-2"><Voce etichetta="Gestisce la pratica">{pratica.gestore}</Voce></div>
                                <Voce etichetta="Inquilino">{c.conduttore.nome}</Voce>
                                <Voce etichetta="Canone">{fmtEuro(c.canone)}/mese</Voce>
                                <div className="col-span-2">
                                    <p className="text-xs text-muted-foreground mb-1">Prodotto</p>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${COLORE_PRODOTTO[c.prodotto] || 'bg-slate-100 text-slate-700'}`}>{nomeProdotto(c.prodotto)}</span>
                                </div>
                                <div className="col-span-2 flex items-start gap-2 pt-3 border-t border-border">
                                    <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-muted-foreground">
                                        Qui vedi lo stato della pratica e i passaggi principali. La corrispondenza con {c.conduttore.nome} e le valutazioni legali restano a CRIA.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    {p?.garanzia ? <ShieldCheck className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />} Indennizzo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {pratica.indennizzo ? (
                                    campiIndennizzo.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            {campiIndennizzo.map(([k, v]) => <Voce key={k} etichetta={etichettaCampo(k)}>{v}</Voce>)}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">L’indennizzo è registrato sulla pratica: per i dettagli contatta CRIA.</p>
                                    )
                                ) : !p?.garanzia ? (
                                    <>
                                        <p className="font-medium text-foreground">Nessuna copertura, nessun indennizzo</p>
                                        <p className="text-muted-foreground">
                                            Questo contratto è su {nomeProdotto(c.prodotto)}, che non ha garanzia: il canone non pagato non è coperto e CRIA non ti versa un indennizzo.
                                        </p>
                                        <p className="text-muted-foreground">
                                            Il recupero però va avanti lo stesso: CRIA resta in contatto con {c.conduttore.nome} e ti aggiorna qui a ogni passaggio.
                                        </p>
                                        <p className="p-3 rounded-lg bg-muted/30 font-medium text-foreground">Non coperto non vuol dire non gestito.</p>
                                    </>
                                ) : (
                                    <>
                                        {mesiContratto.length > 0 && (
                                            <div className="space-y-1.5">
                                                {mesiContratto.map(m => (
                                                    <div key={m.mese} className="flex items-center justify-between gap-2">
                                                        <span className="text-foreground">{nomeMese(m.mese)}</span>
                                                        {COPERTURA[m.copertura] && (
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${COPERTURA[m.copertura].classe}`}>{COPERTURA[m.copertura].etichetta}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-muted-foreground">
                                            Nessun indennizzo registrato su questa pratica per ora. Quando CRIA lo definisce, lo trovi qui con importo e tempi.
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MorositaLocatorePage;
