import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import {
    Euro, Umbrella, Banknote, Wallet, Calculator, ShieldAlert, ArrowLeftRight, Hourglass, HelpCircle, ArrowRight, ClipboardCheck,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import NotaMockup from '@/components/NotaMockup';
import { ConTabella, GraficoColonne } from '@/components/admin/direzione/Grafici';
import { AvvisoSoloAggregati, Chip, ChipProdotto, Riquadro, useVistaPerFunzione } from '@/components/admin/direzione/Elementi';
import { useTutteLePratiche } from '@/lib/praticheDemo';
import { useTutteLeVerifiche } from '@/lib/verificheDemo';
import { useTutteLeAutocandidature } from '@/lib/autocandidatureDemo';
import { PRODOTTI, fmtEuro, nomeProdotto } from '@/data/catalogo';
import { OGGI } from '@/data/datiDemo';
import { nomeOperatore, operatoriConFunzione } from '@/data/operatori';
import { QUOTA_RIASSICURAZIONE } from '@/data/direzione';
import { fmtData, meseBreve, nomeMese } from '@/lib/formato';
import {
    MESE_OGGI, ultimiMesi, ricaviDelMese, premioCeduto, elencoVendite, provvigioniDelMese, garanziaDelMese,
    canoniContoTerzi, creditiVerifica, anticipiSuPratiche, arrotonda,
} from '@/lib/aggregati';

// ═════════════════════════════════════════════════════════════════════════════
// CONTABILITÀ — O-27
// La pagina esisteva, il contenuto non era mai stato definito (§3.4). Questa è
// una proposta minima, da confermare con la responsabile amministrativa e con
// il commercialista: ricavi per prodotto, costi che nascono dai ricavi (premio
// ceduto, provvigioni), flussi della garanzia, e i soldi che passano da CRIA
// senza essere suoi — canoni del P2 da girare, crediti di CRIA Verifica,
// prezzi pagati su pratiche non ancora firmate. Tutto dai dati condivisi.
// I nomi di clienti e proprietari li vede chi tiene i conti; gli altri, i totali.
// ═════════════════════════════════════════════════════════════════════════════

const VEDONO_I_NOMI = ['responsabile_operativo', 'resp_amministrativo', 'tesoreria'];

const euro = (n) => fmtEuro(n, Number.isInteger(arrotonda(n)) ? 0 : 2);

const plurale = (n, uno, tanti) => `${n} ${n === 1 ? uno : tanti}`;

const DA_CHIARIRE = [
    'IVA su quote, commissioni e interrogazioni: aliquote e momento della fattura.',
    'Le quote annuali pagate in anticipo: ricavo di competenza un dodicesimo al mese, come qui, oppure tutto all’incasso.',
    'Il credito di CRIA Verifica scalato da un acquisto: sconto sul prodotto o rimborso dell’interrogazione.',
    'I canoni del P2: su un conto separato, intestato a chi, e in quanti giorni si girano al proprietario.',
    'Il premio ceduto: si versa ogni mese o col rendiconto trimestrale al riassicuratore.',
    'L’indennizzo pagato dalla garanzia: costo di CRIA o somma recuperata dal riassicuratore, e in che misura.',
];

const Riga = ({ etichetta, nota, valore, forte = false, tenue = false }) => (
    <div className={`flex items-start justify-between gap-4 py-2 ${tenue ? 'opacity-60' : ''}`}>
        <div className="min-w-0">
            <p className={`text-sm ${forte ? 'font-semibold' : ''} text-foreground`}>{etichetta}</p>
            {nota && <p className="text-xs text-muted-foreground">{nota}</p>}
        </div>
        <p className={`text-sm tabular-nums whitespace-nowrap text-foreground ${forte ? 'font-semibold' : ''}`}>{valore}</p>
    </div>
);

const Collegamento = ({ to, children }) => (
    <Link to={to} className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:underline">
        {children} <ArrowRight className="w-3.5 h-3.5" />
    </Link>
);

// ─── Ricavi di competenza ─────────────────────────────────────────────────────
const VoceRicavo = ({ v }) => (
    <li className={`py-2.5 flex items-start gap-3 ${v.n ? '' : 'opacity-60'}`}>
        <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
                {v.prodotto && <ChipProdotto codice={v.prodotto} />}
                {v.prodotti?.map(c => <ChipProdotto key={c} codice={c} />)}
                <span className="text-sm text-foreground">{v.etichetta}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
                {v.prodotto ? `${nomeProdotto(v.prodotto)} · ` : ''}{v.nota}{v.n ? ` · ${v.n}` : ''}
            </p>
        </div>
        <span className="text-sm tabular-nums whitespace-nowrap text-foreground">{v.n ? euro(v.importo) : '—'}</span>
    </li>
);

// ═════════════════════════════════════════════════════════════════════════════
const ContabilitaPage = () => {
    const pratiche = useTutteLePratiche();
    const verifiche = useTutteLeVerifiche();
    const autocandidature = useTutteLeAutocandidature();
    const { operatore, vedeNomi } = useVistaPerFunzione(VEDONO_I_NOMI);
    const [mese, setMese] = useState(MESE_OGGI);

    const mesi = useMemo(() => ultimiMesi(), []);
    const fonti = useMemo(() => ({ pratiche, verifiche, autocandidature }), [pratiche, verifiche, autocandidature]);
    const serie = useMemo(
        () => mesi.map(m => ({ chiave: m, etichetta: nomeMese(m), etichettaBreve: meseBreve(m), valore: ricaviDelMese(m, fonti).totale })),
        [mesi, fonti],
    );
    const vendite = useMemo(() => elencoVendite(fonti), [fonti]);

    const ricavi = ricaviDelMese(mese, fonti);
    const premio = premioCeduto(ricavi.voci);
    const provvigioni = provvigioniDelMese(mese, vendite);
    const garanzia = garanziaDelMese(mese);
    const contoTerzi = canoniContoTerzi(mese);
    const crediti = creditiVerifica(verifiche);
    const anticipi = anticipiSuPratiche(pratiche);

    const inCorso = mese === MESE_OGGI;
    const nomeDelMese = nomeMese(mese);
    const totaleP2 = contoTerzi.reduce((t, c) => ({
        incassato: t.incassato + c.incassato, commissione: t.commissione + c.commissione, girato: t.girato + c.girato, daGirare: t.daGirare + c.daGirare,
    }), { incassato: 0, commissione: 0, girato: 0, daGirare: 0 });
    const responsabile = operatoriConFunzione('resp_amministrativo')[0];

    const sceltaMese = (
        <Select value={mese} onValueChange={setMese}>
            <SelectTrigger className="w-full sm:w-56" aria-label="Mese"><SelectValue /></SelectTrigger>
            <SelectContent>
                {[...mesi].reverse().map(m => (
                    <SelectItem key={m} value={m}>{nomeMese(m)}{m === MESE_OGGI ? ' · in corso' : ''}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    return (
        <>
            <Helmet><title>Contabilità - CRIA</title></Helmet>

            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Contabilità"
                    sottotitolo="Ricavi, costi della garanzia e soldi che passano da CRIA senza essere suoi, mese per mese. Tutto si calcola dai contratti e dal listino."
                    badge={<Chip classe="bg-amber-100 text-amber-800">Proposta da confermare</Chip>}
                    azioni={sceltaMese}
                />

                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm">
                    <ClipboardCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-700" />
                    <p className="text-amber-950">
                        Cosa deve contenere questa pagina non era mai stato deciso. Questa è una proposta minima, da confermare con la responsabile
                        amministrativa ({nomeOperatore(responsabile?.id)}) e con il commercialista: le domande aperte sono in fondo.
                    </p>
                </div>

                {!vedeNomi && <AvvisoSoloAggregati operatore={operatore} funzioniConNomi={VEDONO_I_NOMI} cosa="i nomi di clienti e proprietari" />}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Contatore icona={Euro} colore="bg-[#1A2D52]" etichetta={`Ricavi di ${nomeDelMese.toLowerCase()}`} valore={euro(ricavi.totale)}
                        nota={inCorso ? `Di competenza, al ${fmtData(OGGI)}` : 'Di competenza'} />
                    <Contatore icona={Umbrella} colore="bg-blue-500" etichetta="Premio ceduto al riassicuratore" valore={euro(premio.importo)}
                        nota={`${premio.quota}% delle commissioni con garanzia`} />
                    <Contatore icona={Banknote} colore="bg-emerald-600" etichetta="Canoni da girare ai proprietari" valore={euro(totaleP2.daGirare)}
                        nota={`Incassati ${euro(totaleP2.incassato)} nel mese col P2`} />
                    <Contatore icona={Wallet} colore="bg-amber-500" etichetta="Crediti CRIA Verifica aperti" valore={euro(crediti.disponibili.importo)}
                        nota={`${crediti.disponibili.n} da scalare entro ${PRODOTTI.P3.scalabileEntroGiorni} giorni`} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    <Riquadro className="xl:col-span-3" icona={Calculator} titolo="Ricavi di competenza"
                        sottotitolo="Commissioni per ogni mese di contratto attivo; quote annuali divise in dodicesimi; quote di iscrizione, interrogazioni e autocandidature nel mese in cui si pagano. Clicca un mese per aprirlo.">
                        <ConTabella intestazioni={['Mese', 'Ricavi']} righe={serie.map(d => [d.etichetta, euro(d.valore)])}>
                            <GraficoColonne dati={serie} formato={euro} selezionato={mese} onSeleziona={setMese} />
                        </ConTabella>
                        <div className="mt-5 border-t border-border pt-3">
                            <p className="text-xs font-medium text-muted-foreground">{nomeDelMese}{inCorso ? ` · al ${fmtData(OGGI)}` : ''}</p>
                            <ul className="divide-y divide-border">
                                {ricavi.voci.map(v => <VoceRicavo key={v.chiave} v={v} />)}
                                <li className="py-2.5 flex items-start gap-3 opacity-60">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2"><ChipProdotto codice="P6" /><span className="text-sm text-foreground">Abbonamenti delle agenzie</span></div>
                                        <p className="text-xs text-muted-foreground mt-0.5">{nomeProdotto('P6')} · prezzo ancora da decidere</p>
                                    </div>
                                    <span className="text-sm">—</span>
                                </li>
                            </ul>
                            <Riga etichetta="Totale" valore={euro(ricavi.totale)} forte />
                        </div>
                    </Riquadro>

                    <div className="xl:col-span-2 space-y-6">
                        <Riquadro icona={Umbrella} titolo="Costi che nascono dai ricavi">
                            <div className="divide-y divide-border">
                                <Riga etichetta="Premio ceduto al riassicuratore"
                                    nota={`${QUOTA_RIASSICURAZIONE}% di ${euro(premio.base)} di commissioni sui prodotti con garanzia`}
                                    valore={euro(premio.importo)} />
                                <Riga etichetta="Provvigioni maturate ai commerciali"
                                    nota={[
                                        provvigioni.n ? plurale(provvigioni.n, 'vendita con un codice referente', 'vendite con un codice referente') : null,
                                        provvigioni.senzaAliquota ? `${plurale(provvigioni.senzaAliquota, 'vendita', 'vendite')} da decidere` : null,
                                    ].filter(Boolean).join(' · ') || 'Nessuna vendita con un codice referente'}
                                    valore={euro(provvigioni.importo)} />
                                <Riga etichetta="Dopo premio e provvigioni" nota="Prima di personale e spese: non è l’utile"
                                    valore={euro(ricavi.totale - premio.importo - provvigioni.importo)} forte />
                            </div>
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                                <Collegamento to="/dashboard/admin/riassicurazione">Riassicurazione</Collegamento>
                                <Collegamento to="/dashboard/admin/provvigioni">Provvigioni</Collegamento>
                            </div>
                        </Riquadro>

                        <Riquadro icona={ShieldAlert} titolo="Garanzia"
                            sottotitolo="L’indennizzo di un mese vale il canone di quel mese: pagato il proprietario, il credito verso l’inquilino passa a CRIA e le rate del piano lo riportano indietro.">
                            <div className="divide-y divide-border">
                                <Riga etichetta={`Indennizzi riconosciuti a ${nomeDelMese.toLowerCase()}`}
                                    nota={garanzia.indennizzi.length ? `${garanzia.indennizzi.length} ${garanzia.indennizzi.length === 1 ? 'mese coperto' : 'mesi coperti'}` : 'Nessuno'}
                                    valore={euro(garanzia.indennizzi.reduce((t, i) => t + i.importo, 0))} />
                                <Riga etichetta={`Recuperi incassati a ${nomeDelMese.toLowerCase()}`}
                                    nota={garanzia.recuperi.length ? `${garanzia.recuperi.length} ${garanzia.recuperi.length === 1 ? 'rata' : 'rate'} del piano di rientro` : 'Nessuno'}
                                    valore={euro(garanzia.recuperi.reduce((t, r) => t + r.importo, 0))} />
                                <Riga etichetta="Credito verso gli inquilini, da recuperare"
                                    nota={`${euro(garanzia.creditoCeduto)} passati a CRIA, ${euro(garanzia.recuperato)} già rientrati · ${inCorso ? `al ${fmtData(OGGI)}` : `a fine ${nomeDelMese.toLowerCase()}`}`}
                                    valore={euro(garanzia.daRecuperare)} forte />
                            </div>
                            {vedeNomi && garanzia.pratiche.length > 0 && (
                                <ul className="mt-2 space-y-1.5">
                                    {garanzia.pratiche.map(p => (
                                        <li key={p.id} className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">{p.immobile}</span> · ceduti {euro(p.ceduto)}, rientrati {euro(p.recuperato)}
                                            {p.prossimaRata && ` · prossima rata ${euro(p.prossimaRata.importo)} il ${fmtData(p.prossimaRata.scadenza)}`}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                                <Collegamento to="/dashboard/admin/indennizzi">Indennizzi</Collegamento>
                                <Collegamento to="/dashboard/admin/morosita">Morosità</Collegamento>
                            </div>
                        </Riquadro>
                    </div>
                </div>

                <div>
                    <h2 className="text-base font-semibold text-foreground">Soldi che passano da CRIA senza essere suoi</h2>
                    <p className="text-sm text-muted-foreground">Non sono ricavi: sono debiti verso proprietari e clienti finché non si chiudono.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <Riquadro icona={ArrowLeftRight} titolo={`Canoni incassati col P2 · ${nomeDelMese.toLowerCase()}`}
                        sottotitolo={`Con ${nomeProdotto('P2')} CRIA incassa il canone, trattiene la commissione e gira il resto al proprietario.`}>
                        <div className="divide-y divide-border">
                            <Riga etichetta="Incassati dagli inquilini" valore={euro(totaleP2.incassato)} />
                            <Riga etichetta="Commissione trattenuta" nota="L’unica parte di CRIA: è già nei ricavi" valore={euro(totaleP2.commissione)} />
                            <Riga etichetta="Girati ai proprietari" valore={euro(totaleP2.girato)} />
                            <Riga etichetta="Da girare" nota="Debito verso i proprietari" valore={euro(totaleP2.daGirare)} forte />
                        </div>
                        {vedeNomi && (
                            <ul className="mt-2 space-y-1.5">
                                {contoTerzi.map(c => (
                                    <li key={c.contrattoId} className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">{c.proprietario}</span> · {c.immobile}
                                        <span className="block">
                                            {c.incassatoIl
                                                ? `Incassato il ${fmtData(c.incassatoIl)} · ${c.giratoIl ? `girati ${euro(c.girato)} il ${fmtData(c.giratoIl)}` : `da girare ${euro(c.daGirare)}`}`
                                                : 'Canone del mese non ancora incassato'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-3"><Collegamento to="/dashboard/admin/bonifici">Bonifici in uscita</Collegamento></div>
                    </Riquadro>

                    <Riquadro icona={Wallet} titolo="Crediti di CRIA Verifica"
                        sottotitolo={`I ${fmtEuro(PRODOTTI.P3.prezzo)} si scalano dal primo acquisto dello stesso account entro ${PRODOTTI.P3.scalabileEntroGiorni} giorni, uno per acquisto: finché il credito è aperto, è uno sconto che il cliente può ancora chiedere.`}>
                        <div className="divide-y divide-border">
                            <Riga etichetta="Aperti" nota={`${crediti.disponibili.n} · al ${fmtData(OGGI)}`} valore={euro(crediti.disponibili.importo)} forte />
                            <Riga etichetta="Usati in un acquisto" nota={`${crediti.usati.n} ${crediti.usati.n === 1 ? 'credito' : 'crediti'} · diventati sconto`} valore={euro(crediti.usati.importo)} />
                            <Riga etichetta="Scaduti senza acquisto" nota={`${crediti.scaduti.n} ${crediti.scaduti.n === 1 ? 'credito' : 'crediti'} · restano ricavi`} valore={euro(crediti.scaduti.importo)} />
                        </div>
                        {vedeNomi && crediti.aperti.length > 0 && (
                            <ul className="mt-2 space-y-1.5">
                                {crediti.aperti.map(c => (
                                    <li key={c.id} className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">{c.cliente}</span> · richiesta del {fmtData(c.richiestaIl)}
                                        <span className="block">Scade il {fmtData(c.scadeIl)} · {c.giorni === 0 ? 'oggi' : `tra ${c.giorni} ${c.giorni === 1 ? 'giorno' : 'giorni'}`}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Riquadro>

                    <Riquadro icona={Hourglass} titolo="Anticipi su pratiche non firmate"
                        sottotitolo="Il prezzo del primo anno pagato prima della firma: diventa ricavo dall’attivazione, un dodicesimo al mese.">
                        <Riga etichetta="Anticipi da clienti" nota={`${anticipi.length} ${anticipi.length === 1 ? 'pratica' : 'pratiche'} · al ${fmtData(OGGI)}`}
                            valore={euro(anticipi.reduce((t, a) => t + a.importo, 0))} forte />
                        {vedeNomi && anticipi.length > 0 && (
                            <ul className="mt-2 space-y-1.5">
                                {anticipi.map(a => (
                                    <li key={a.id} className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">{a.cliente}</span> · {a.immobile}
                                        <span className="block">{nomeProdotto(a.prodotto)} · {euro(a.importo)} pagati il {fmtData(a.pagataIl)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Riquadro>
                </div>

                <Riquadro icona={HelpCircle} titolo="Da chiarire con il commercialista">
                    <ul className="space-y-2 text-sm text-foreground">
                        {DA_CHIARIRE.map(d => (
                            <li key={d} className="flex items-start gap-2">
                                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
                                <span>{d}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-x-4 gap-y-1">
                        <span className="text-xs text-muted-foreground">Dove si lavora:</span>
                        <Collegamento to="/dashboard/admin/pagamenti">Pagamenti</Collegamento>
                        <Collegamento to="/dashboard/admin/riconciliazione">Riconciliazione</Collegamento>
                        <Collegamento to="/dashboard/admin/bonifici">Bonifici</Collegamento>
                        <Collegamento to="/dashboard/admin/vendite">Vendite</Collegamento>
                    </div>
                </Riquadro>

                <NotaMockup>
                    <p>
                        Scegli luglio 2026 per l’indennizzo di Via Tortona 27, agosto per la prima rata del piano che lo riporta indietro.
                        Entra come Immobiliare Verdi e firma Via Bergamo 8: l’anticipo diventa un contratto e il suo primo dodicesimo entra nei ricavi di settembre.
                        Entra come Federica Villa (federica.villa@cri-affitti.it, direzione) per vedere la pagina senza nomi.
                    </p>
                </NotaMockup>
            </div>
        </>
    );
};

export default ContabilitaPage;
