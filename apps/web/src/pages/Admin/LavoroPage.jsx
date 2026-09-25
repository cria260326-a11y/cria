import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, Eye, Gauge, Scale, UserRound, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import NotaMockup from '@/components/NotaMockup';
import { FUNZIONI, OPERATORI, nomeOperatore, operatoriConFunzione, trovaOperatore } from '@/data/operatori';
import { OGGI } from '@/data/datiDemo';
import { fmtDataLunga } from '@/lib/formato';
import { INCOMPATIBILITA } from '@/lib/separazione';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { useRiepilogoAnagrafica } from '@/lib/anagraficheDemo';
import { useRiepilogoIstruttoria } from '@/lib/istruttoriaDemo';
import { useRiepilogoCicloMensile } from '@/lib/incassiDemo';
import { useRiepilogoGaranzia } from '@/lib/garanziaDemo';
import { useRiepilogoScadenze } from '@/lib/scadenzeDemo';

// ═════════════════════════════════════════════════════════════════════════════
// O-34 — IL LAVORO DI OGGI
// La giornata di chi lavora dentro CRIA, una funzione alla volta: cosa è in
// ritardo e chi lo ha in carico, le proprie code, le regole che valgono per
// lui. I responsabili vedono anche il carico della squadra; la direzione solo
// aggregati, senza nomi; il DPO il registro, non i dati (§13.5).
// Come va l'azienda — fatturato, entrate, uscite, utenti e mappa — sta nella
// Panoramica (O-01), che per ora apre solo l'admin.
// Ogni schermata del lotto espone il suo riepilogo nella stessa forma:
// { chiave, funzione, etichetta, valore, urgenti, nota, percorso, perOperatore },
// con urgentiPerOperatore (di chi sono le cose urgenti), gestitaDa (la
// funzione che lavora una voce che vedono anche altre) ed etichettaPerAltri
// quando servono.
// ═════════════════════════════════════════════════════════════════════════════

// Voci che sono una misura, non una coda: non si sommano ai carichi.
const UNITA_INDICATORI = { tasso_dissenso: '%' };

const normalizza = (v) => {
    const unita = v.unita || UNITA_INDICATORI[v.chiave];
    if (v.tipo !== 'indicatore' && !UNITA_INDICATORI[v.chiave]) return v;
    const testo = v.testo ?? (v.valore == null ? '—' : `${v.valore}${unita === '%' ? '%' : unita ? ` ${unita}` : ''}`);
    return { ...v, tipo: 'indicatore', unita, testo };
};

const useTutteLeVoci = () => {
    const anagrafica = useRiepilogoAnagrafica();
    const istruttoria = useRiepilogoIstruttoria();
    const ciclo = useRiepilogoCicloMensile();
    const garanzia = useRiepilogoGaranzia();
    const scadenze = useRiepilogoScadenze();
    return useMemo(
        () => [...anagrafica, ...istruttoria, ...ciclo, ...garanzia, ...scadenze].map(normalizza),
        [anagrafica, istruttoria, ciclo, garanzia, scadenze],
    );
};

// Le incompatibilità che toccano il lavoro di ciascuna funzione (§13.4).
const INCOMPATIBILITA_DI = {
    istruttoria: [0],
    gestore_pratica: [1],
    resp_legale: [1],
    tesoreria: [2],
    indennizzi: [2],
    resp_amministrativo: [2],
    assistenza: [3],
    responsabile_operativo: [0, 1, 2, 3],
};

const plurale = (n, uno, molti) => `${n} ${n === 1 ? uno : molti}`;

// Il numero da mostrare a chi guarda: le sue, se la coda è assegnata a persone.
const valorePer = (voce, operatoreId) => {
    const assegnate = voce.perOperatore && Object.keys(voce.perOperatore).length > 0;
    if (!assegnate || !(operatoreId in voce.perOperatore)) return { valore: voce.valore, tue: false };
    return { valore: voce.perOperatore[operatoreId], tue: true };
};

// ─── Pezzi ────────────────────────────────────────────────────────────────────
const Urgenti = ({ n }) => (n > 0 ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 text-xs font-medium">
        <AlertTriangle className="w-3 h-3" /> {n} in ritardo o al termine
    </span>
) : null);

const VoceCoda = ({ voce, operatoreId }) => {
    const { valore, tue } = valorePer(voce, operatoreId);
    return (
        <Link to={voce.percorso} className="group block rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{voce.etichetta}</p>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-3xl font-bold tabular-nums ${valore > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{valore}</span>
                {tue && voce.valore !== valore && <span className="text-xs text-muted-foreground">tue, su {voce.valore} in coda</span>}
            </div>
            {voce.nota && <p className="text-xs text-muted-foreground mt-1">{voce.nota}</p>}
            {voce.urgenti > 0 && <div className="mt-2"><Urgenti n={voce.urgenti} /></div>}
        </Link>
    );
};

const VoceIndicatore = ({ voce }) => (
    <Link to={voce.percorso} className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition">
        <p className="text-xs text-muted-foreground">{voce.etichetta}</p>
        <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{voce.testo}</p>
        {voce.nota && <p className="text-xs text-muted-foreground mt-1">{voce.nota}</p>}
    </Link>
);

// «Uno, due e tre»; davanti a una e, «ed»: «Valeria Monti ed Ettore Marini».
const elenco = (nomi, congiunzione = 'e') => {
    if (nomi.length < 2) return nomi[0] || '';
    const ultimo = nomi[nomi.length - 1];
    const e = congiunzione === 'e' && /^e/i.test(ultimo) ? 'ed' : congiunzione;
    return `${nomi.slice(0, -1).join(', ')} ${e} ${ultimo}`;
};

// Il nome della voce per chi guarda: «Fasi salite a te» solo al responsabile.
const etichettaPer = (voce, operatore) => (voce.funzione !== operatore.funzione && voce.etichettaPerAltri) || voce.etichetta;

// Chi se ne deve occupare: le persone a cui sono assegnate le cose urgenti.
// Se non sono assegnate a qualcuno, chi ha la funzione: una di loro la prende.
const incaricati = (voce) => {
    const funzione = voce.gestitaDa || voce.funzione;
    const conteggi = voce.urgentiPerOperatore ?? voce.perOperatore ?? {};
    const assegnati = Object.entries(conteggi).filter(([id, n]) => n > 0 && trovaOperatore(id)).map(([id]) => id);
    if (assegnati.length) return { funzione, persone: assegnati, assegnati: true };
    return { funzione, persone: operatoriConFunzione(funzione).map(o => o.id), assegnati: false };
};

// Un avviso per cosa da fare: una voce che vedono più funzioni (le richieste
// di accesso ai dati: assistenza, responsabile operativo, DPO) è un avviso
// solo, con chi lo gestisce e chi lo vede anche.
const avvisiDa = (voci) => {
    const gruppi = new Map();
    voci.filter(v => v.tipo !== 'indicatore' && v.urgenti > 0).forEach(v => {
        const chiave = `${v.chiave}:${v.gestitaDa || v.funzione}`;
        if (gruppi.has(chiave)) gruppi.get(chiave).funzioni.push(v.funzione);
        else gruppi.set(chiave, { chiave, voce: v, funzioni: [v.funzione] });
    });
    return [...gruppi.values()];
};

const ChiLoGestisce = ({ avviso, operatoreId }) => {
    const { funzione, persone, assegnati } = incaricati(avviso.voce);
    const nome = (id) => (id === operatoreId ? 'te' : nomeOperatore(id));
    const primaChiGuarda = [...persone].sort((a, b) => (b === operatoreId) - (a === operatoreId));
    // Chi lo segue da un'altra funzione; chi guarda lo sa già.
    const altri = avviso.funzioni.filter(f => f !== funzione)
        .flatMap(f => operatoriConFunzione(f).filter(o => o.id !== operatoreId).map(o => `${nomeOperatore(o.id)} (${FUNZIONI[f].etichetta})`));
    return (
        <span className="mt-0.5 flex items-start gap-1 text-xs text-red-800/90">
            <UserRound className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
            <span>
                In carico a <strong className="font-semibold text-red-900">{elenco(primaChiGuarda.map(nome), assegnati ? 'e' : 'o')}</strong>
                {' · '}{FUNZIONI[funzione]?.etichetta}
                {altri.length > 0 && ` · ${altri.length === 1 ? 'lo vede' : 'lo vedono'} anche ${elenco(altri)}`}
            </span>
        </span>
    );
};

const DaFareAdesso = ({ voci, operatore }) => {
    const avvisi = avvisiDa(voci);
    if (!avvisi.length) {
        return (
            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Niente in ritardo o al termine, oggi.
            </div>
        );
    }
    return (
        <div className="rounded-xl border border-red-200 bg-red-50/60 divide-y divide-red-100">
            {avvisi.map(a => (
                <Link key={a.chiave} to={a.voce.percorso} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-red-50">
                    <span className="flex items-start gap-2 text-sm text-red-900 min-w-0">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="min-w-0">
                            <span className="block"><strong className="font-semibold">{a.voce.urgenti}</strong> · {etichettaPer(a.voce, operatore)}</span>
                            <ChiLoGestisce avviso={a} operatoreId={operatore.id} />
                        </span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-red-700 flex-shrink-0" />
                </Link>
            ))}
        </div>
    );
};

const Squadra = ({ responsabileId, voci }) => {
    const squadra = OPERATORI.filter(o => o.responsabile === responsabileId);
    if (!squadra.length) return null;
    // Il carico si conta sulle code, non sui termini: la stessa contestazione è
    // una coda dell'assistenza e anche un termine in O-18, e non vale due.
    const code = voci.filter(v => v.tipo !== 'indicatore' && v.perOperatore && !v.percorso.startsWith('/dashboard/admin/scadenze'));
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> La tua squadra</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
                {squadra.map(o => {
                    const carico = code.reduce((t, v) => t + (v.perOperatore[o.id] || 0), 0);
                    return (
                        <div key={o.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground">{nomeOperatore(o.id)}</p>
                                <p className="text-xs text-muted-foreground">{FUNZIONI[o.funzione].etichetta}</p>
                            </div>
                            <span className="text-sm tabular-nums text-muted-foreground">{carico > 0 ? plurale(carico, 'cosa in coda', 'cose in coda') : 'niente in coda'}</span>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};

const Regole = ({ funzione }) => {
    const righe = (INCOMPATIBILITA_DI[funzione] || []).map(i => INCOMPATIBILITA[i]);
    if (!righe.length) return null;
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Scale className="w-4 h-4" /> Le regole che valgono qui</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {righe.map(r => (
                    <div key={r.coppia} className="text-sm">
                        <p className="font-medium text-foreground">Non insieme: {r.coppia.charAt(0).toLowerCase() + r.coppia.slice(1)}</p>
                        <p className="text-xs text-muted-foreground">{r.perche}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

const Griglia = ({ children }) => <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;

const Sezione = ({ titolo, children, nota }) => (
    <section className="space-y-3">
        <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{titolo}</h2>
            {nota && <p className="text-xs text-muted-foreground mt-0.5">{nota}</p>}
        </div>
        {children}
    </section>
);

// ─── Le viste ─────────────────────────────────────────────────────────────────
// L'admin ha accesso completo: le cose da fare di tutte le funzioni, e le code
// raggruppate per funzione più sotto (Tutte le funzioni).
const VistaFunzione = ({ operatore, voci }) => {
    const admin = operatore.funzione === 'admin';
    const mie = admin ? voci : voci.filter(v => v.funzione === operatore.funzione);
    const code = mie.filter(v => v.tipo !== 'indicatore');
    const misure = mie.filter(v => v.tipo === 'indicatore');
    const responsabile = FUNZIONI[operatore.funzione].livello === 'responsabile';
    return (
        <>
            <Sezione titolo="Da fare adesso">
                <DaFareAdesso voci={mie} operatore={operatore} />
            </Sezione>
            {!admin && (
                <Sezione titolo="Le tue code">
                    {code.length ? (
                        <Griglia>{code.map(v => <VoceCoda key={v.chiave} voce={v} operatoreId={operatore.id} />)}</Griglia>
                    ) : (
                        <p className="text-sm text-muted-foreground">Nessuna coda per questa funzione, per ora.</p>
                    )}
                </Sezione>
            )}
            {misure.length > 0 && (
                <Sezione titolo="Come sta andando">
                    <Griglia>{misure.map(v => <VoceIndicatore key={v.chiave} voce={v} />)}</Griglia>
                </Sezione>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
                {responsabile && <Squadra responsabileId={operatore.id} voci={voci} />}
                <Regole funzione={operatore.funzione} />
            </div>
        </>
    );
};

// Le code di tutte le funzioni: le vede chi coordina (il responsabile
// operativo) e l'admin, che ha accesso completo.
const TutteLeFunzioni = ({ voci, operatore }) => {
    const funzioni = Object.keys(FUNZIONI).filter(f => !['admin', operatore.funzione, 'direzione', 'dpo'].includes(f));
    return (
        <Sezione titolo="Tutte le funzioni" nota="Le code di ogni funzione, con chi ci lavora. Ogni collega entra con il suo account e vede la sua.">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {funzioni.map(f => {
                    const code = voci.filter(v => v.funzione === f && v.tipo !== 'indicatore');
                    const persone = operatoriConFunzione(f);
                    return (
                        <Card key={f}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{FUNZIONI[f].etichetta}</CardTitle>
                                <p className="text-xs text-muted-foreground">{persone.map(o => nomeOperatore(o.id)).join(' · ')}</p>
                            </CardHeader>
                            <CardContent className="space-y-1.5">
                                {code.length ? code.map(v => (
                                    <Link key={v.chiave} to={v.percorso} className="flex items-center justify-between gap-3 text-sm rounded-md -mx-2 px-2 py-1 hover:bg-muted">
                                        <span className="text-foreground min-w-0">{etichettaPer(v, operatore)}</span>
                                        <span className="flex items-center gap-2 flex-shrink-0">
                                            {v.urgenti > 0 && <span className="text-xs font-medium text-red-700">{v.urgenti} al termine</span>}
                                            <span className="tabular-nums font-semibold">{v.valore}</span>
                                        </span>
                                    </Link>
                                )) : <p className="text-sm text-muted-foreground">Nessuna coda.</p>}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </Sezione>
    );
};

// La direzione legge solo aggregati, senza nomi (§13.5).
const VistaDirezione = ({ voci }) => {
    const misure = voci.filter(v => v.tipo === 'indicatore');
    const funzioni = Object.keys(FUNZIONI).filter(f => !['direzione', 'dpo'].includes(f));
    return (
        <>
            <Sezione titolo="Gli indicatori che contano" nota="Aggregati, senza nomi. Il caso singolo si apre su richiesta, come per chiunque.">
                <Griglia>{misure.map(v => <VoceIndicatore key={v.chiave} voce={v} />)}</Griglia>
            </Sezione>
            <Sezione titolo="Il lavoro aperto, per funzione">
                <Card>
                    <CardContent className="pt-4 divide-y divide-border">
                        {funzioni.map(f => {
                            const code = voci.filter(v => v.funzione === f && v.tipo !== 'indicatore' && !v.percorso.startsWith('/dashboard/admin/scadenze'));
                            const aperte = code.reduce((t, v) => t + (v.valore || 0), 0);
                            const urgenti = code.reduce((t, v) => t + (v.urgenti || 0), 0);
                            return (
                                <div key={f} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 text-sm">
                                    <span className="text-foreground">{FUNZIONI[f].etichetta}</span>
                                    <span className="flex items-center gap-3 flex-shrink-0 tabular-nums">
                                        {urgenti > 0 && <span className="text-xs text-red-700">{urgenti} al termine</span>}
                                        <span className="font-semibold">{aperte}</span>
                                    </span>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </Sezione>
        </>
    );
};

// Il DPO controlla chi accede a cosa: vede il registro, non i dati (§13.5).
const VistaDpo = ({ voci }) => {
    const mie = voci.filter(v => v.funzione === 'dpo');
    return (
        <>
            <Sezione titolo="Da controllare">
                <Griglia>{mie.map(v => <VoceCoda key={v.chiave} voce={v} operatoreId="tommaso" />)}</Griglia>
            </Sezione>
            <Card>
                <CardContent className="pt-5 flex gap-3 text-sm">
                    <Eye className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-medium text-foreground">Il registro degli accessi arriva con il lotto 6</p>
                        <p className="text-muted-foreground">
                            Letture e deroghe del mese, con nome e motivo: chi ha aperto un fascicolo non assegnato lo ha fatto subito,
                            senza chiedere, e qui lo vedi. Nessuno lo impedisce, tutti sanno che si vede.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

// ─── La pagina ────────────────────────────────────────────────────────────────
const LavoroPage = () => {
    const { operatore } = useOperatoreAttivo();
    const voci = useTutteLeVoci();
    const funzione = FUNZIONI[operatore.funzione];

    const vista = {
        direzione: <VistaDirezione voci={voci} />,
        dpo: <VistaDpo voci={voci} />,
    }[operatore.funzione] || <VistaFunzione operatore={operatore} voci={voci} />;

    return (
        <div className="space-y-6">
            <Helmet><title>Il lavoro di oggi - CRIA</title></Helmet>
            <IntestazionePagina
                titolo={`Ciao ${operatore.nome}`}
                sottotitolo={`${funzione.etichetta} · ${funzione.cosaFa}. Oggi è il ${fmtDataLunga(OGGI)}.`}
                badge={<span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"><Gauge className="w-3 h-3" /> {funzione.etichetta}</span>}
            />

            {vista}

            {['responsabile_operativo', 'admin'].includes(operatore.funzione) && <TutteLeFunzioni voci={voci} operatore={operatore} />}

            <NotaMockup>
                Ognuno apre la giornata della sua funzione, con il suo account: per esempio
                valeria.monti@cri-affitti.it per l’istruttoria, silvia.barbieri@cri-affitti.it per le autorizzazioni,
                federica.villa@cri-affitti.it per la direzione (solo numeri, senza nomi). I numeri seguono quello che fai nelle altre schermate.
            </NotaMockup>
        </div>
    );
};

export default LavoroPage;
