import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Home, FileClock, Receipt, Users, Package, Layers, ArrowRight } from 'lucide-react';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import NotaMockup from '@/components/NotaMockup';
import { BarreConPiano } from '@/components/admin/direzione/Grafici';
import { ChipProdotto, Riquadro } from '@/components/admin/direzione/Elementi';
import { useTutteLePratiche } from '@/lib/praticheDemo';
import { useTutteLeVerifiche } from '@/lib/verificheDemo';
import { useTutteLeAutocandidature } from '@/lib/autocandidatureDemo';
import { useTuttiICertificati } from '@/lib/certificatiDemo';
import { PRODOTTI, PRODOTTI_PROPRIETARIO, PARAMETRI, fmtEuro, nomeProdotto, prezzoProdotto } from '@/data/catalogo';
import { ALIQUOTE_PROVVIGIONE, COMMISSIONE_MEDIA_PIANO, COMPOSIZIONE_PIANO } from '@/data/direzione';
import { OGGI } from '@/data/datiDemo';
import { fmtData, nomeMese } from '@/lib/formato';
import {
    DODICI_MESI_FA, MESE_OGGI, portafoglio, praticheInCorso, composizionePortafoglio, commissioneMediaPonderata,
    elencoVendite, abbonamentiPerProdotto, unaTantum, perCanale, canaleDi, valoreAnnuo, quota, fmtPercentuale,
} from '@/lib/aggregati';

// ═════════════════════════════════════════════════════════════════════════════
// VENDITE — O-25
// Quello che si è venduto, riallineato al catalogo: i prodotti con i loro codici
// e nomi, i prezzi calcolati dal listino. Le vendite sono i fatti dei dati
// condivisi — contratti attivi, pratiche con quota e prezzo, CRIA Verifica,
// autocandidature — con il canale da cui arrivano: il codice referente del
// commerciale, legato al cliente per sempre, oppure la vendita diretta.
// Solo numeri, per prodotto e per canale: il registro delle vendite con i nomi
// dei clienti è stato tolto (22 settembre 2026).
// Il P4 aspetta la decisione del titolare: qui non ha prezzi né vendite.
// ═════════════════════════════════════════════════════════════════════════════

const euro = (n) => fmtEuro(n, Number.isInteger(n) ? 0 : 2);

const testoCanale = (c) => {
    if (c.tipo === 'diretto') return 'Diretto';
    if (c.tipo === 'referente') return `${c.commerciale} · ${c.codice}`;
    return `Codice ${c.codice} non riconosciuto`;
};

// ─── Per prodotto ─────────────────────────────────────────────────────────────
const TestaProdotto = ({ codice }) => (
    <div className="flex items-start gap-2 min-w-0">
        <ChipProdotto codice={codice} />
        <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{nomeProdotto(codice)}</p>
            <p className="text-xs text-muted-foreground">{prezzoProdotto(codice)}</p>
        </div>
    </div>
);

const Numero = ({ etichetta, children, className = '' }) => (
    <div className={`text-sm ${className}`}>
        <p className="text-[11px] text-muted-foreground lg:hidden">{etichetta}</p>
        <p className="tabular-nums text-foreground">{children}</p>
    </div>
);

const RigheAbbonamenti = ({ righe }) => (
    <div className="divide-y divide-border">
        <div className="hidden lg:grid lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] gap-4 pb-2 text-xs font-medium text-muted-foreground">
            <span>Sul contratto</span><span className="text-right">Contratti attivi</span><span className="text-right">In arrivo</span><span className="text-right">Valore annuo</span>
        </div>
        {righe.map(r => (
            <div key={r.codice} className="py-3 grid grid-cols-3 gap-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] lg:gap-4 lg:items-center">
                <div className="col-span-3 lg:col-span-1"><TestaProdotto codice={r.codice} /></div>
                <Numero etichetta="Contratti attivi" className="lg:text-right">{r.attivi}</Numero>
                <Numero etichetta="In arrivo" className="lg:text-right">{r.inCorso ? `${r.inCorso} · ${euro(r.valoreAtteso)} l’anno` : '—'}</Numero>
                <Numero etichetta="Valore annuo" className="lg:text-right">{euro(r.valoreAnnuo)}</Numero>
            </div>
        ))}
    </div>
);

const RigaUnaTantum = ({ testa, n, incassato, nota }) => (
    <div className="py-3 grid grid-cols-3 gap-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] lg:gap-4 lg:items-center">
        <div className="col-span-3 lg:col-span-1">{testa}</div>
        <Numero etichetta="Vendute" className="lg:text-right">{n}</Numero>
        <Numero etichetta="Incassato" className="lg:text-right">{euro(incassato)}</Numero>
        <div className="col-span-3 lg:col-span-1 text-xs text-muted-foreground lg:text-right">{nota}</div>
    </div>
);

// ═════════════════════════════════════════════════════════════════════════════
const VenditePage = () => {
    const pratiche = useTutteLePratiche();
    const verifiche = useTutteLeVerifiche();
    const autocandidature = useTutteLeAutocandidature();
    const certificati = useTuttiICertificati();

    const dati = useMemo(() => {
        const voci = portafoglio(pratiche);
        const inCorso = praticheInCorso(pratiche);
        const vendite = elencoVendite({ pratiche, verifiche, autocandidature });
        const delMese = vendite.filter(v => v.conta && v.data.startsWith(MESE_OGGI));
        const conCodice = voci.filter(v => canaleDi(v.clienteId, v.codiceReferente).tipo === 'referente').length;
        const composizione = composizionePortafoglio(voci);
        const conApp = voci.filter(v => PRODOTTI[v.prodotto].quotaAppAnnua || PRODOTTI[v.prodotto].prezzoAnnuo != null).length;
        return {
            voci, inCorso, delMese, conCodice, composizione, conApp,
            valorePortafoglio: voci.reduce((t, v) => t + valoreAnnuo(v.prodotto, v.canone), 0),
            valoreInArrivo: inCorso.reduce((t, p) => t + valoreAnnuo(p.prodotto, p.canone), 0),
            abbonamenti: abbonamentiPerProdotto(voci, inCorso),
            unaTantum: unaTantum(vendite, DODICI_MESI_FA),
            canali: perCanale(vendite, voci),
            certificatiGratuiti: certificati.filter(c => c.fonte === 'rilevato_cria' && c.emessoIl >= DODICI_MESI_FA).length,
        };
    }, [pratiche, verifiche, autocandidature, certificati]);

    const pianoApp = PRODOTTI_PROPRIETARIO
        .filter(c => PRODOTTI[c].quotaAppAnnua || PRODOTTI[c].prezzoAnnuo != null)
        .reduce((t, c) => t + COMPOSIZIONE_PIANO[c], 0) / 100;

    return (
        <>
            <Helmet><title>Vendite - CRIA</title></Helmet>

            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Vendite"
                    sottotitolo="Cosa si è venduto, prodotto per prodotto. Nomi e prezzi vengono dal listino; su ogni contratto vale il prezzo congelato al pagamento."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Contatore icona={Home} colore="bg-[#1A2D52]" etichetta="Contratti attivi" valore={dati.voci.length}
                        nota={`Valore annuo ${euro(dati.valorePortafoglio)}`} />
                    <Contatore icona={FileClock} colore="bg-blue-500" etichetta="Pratiche in corso" valore={dati.inCorso.length}
                        nota={`Quota pagata · ${euro(dati.valoreInArrivo)} l’anno in arrivo`} />
                    <Contatore icona={Receipt} colore="bg-emerald-600" etichetta={`Incassato a ${nomeMese(MESE_OGGI).toLowerCase()}`}
                        valore={euro(dati.delMese.reduce((t, v) => t + v.incassato, 0))}
                        nota={`${dati.delMese.length} vendite al ${fmtData(OGGI)}`} />
                    <Contatore icona={Users} colore="bg-amber-500" etichetta="Contratti portati da un commerciale"
                        valore={`${dati.conCodice} su ${dati.voci.length}`}
                        nota="Con il codice referente legato al cliente" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    <Riquadro className="xl:col-span-3" icona={Package} titolo="Per prodotto"
                        sottotitolo="Il valore annuo è il prezzo del listino sul canone di ogni contratto: commissione più quota dell’app, dove c’è.">
                        <RigheAbbonamenti righe={dati.abbonamenti} />

                        <div className="mt-5 hidden lg:grid lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] gap-4 pb-2 border-b border-border text-xs font-medium text-muted-foreground">
                            <span>Una tantum · ultimi 12 mesi</span><span className="text-right">Vendute</span><span className="text-right">Incassato</span><span />
                        </div>
                        <p className="mt-5 pb-1 text-xs font-medium text-muted-foreground lg:hidden">Una tantum · ultimi 12 mesi</p>
                        <div className="divide-y divide-border">
                            <RigaUnaTantum
                                testa={(
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Quota di iscrizione</p>
                                        <p className="text-xs text-muted-foreground">{fmtEuro(PARAMETRI.quotaIscrizione)} a pratica, all’avvio</p>
                                    </div>
                                )}
                                {...dati.unaTantum.quota}
                                nota="Si paga prima della verifica di CRIA" />
                            <RigaUnaTantum testa={<TestaProdotto codice="P3" />} {...dati.unaTantum.P3}
                                nota={`Diventa un credito per ${PRODOTTI.P3.scalabileEntroGiorni} giorni`} />
                            <RigaUnaTantum testa={<TestaProdotto codice="P7" />} {...dati.unaTantum.P7}
                                nota={`Più ${dati.certificatiGratuiti} certificati gratuiti a chi ha un contratto CRIA: non sono vendite`} />
                            <div className="py-3 flex items-start gap-3">
                                <TestaProdotto codice="P6" />
                                <p className="ml-auto text-xs text-muted-foreground text-right max-w-[16rem]">Nessuna vendita finché non si decidono gli scaglioni</p>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                            La Consulenza (P4) non è nel listino: aspetta la decisione del titolare, e qui non ha prezzi né vendite.
                        </p>
                    </Riquadro>

                    <Riquadro className="xl:col-span-2" icona={Layers} titolo="Composizione del portafoglio"
                        sottotitolo="Quanti contratti per prodotto, accanto alle quote del piano economico.">
                        <BarreConPiano
                            formato={(x) => fmtPercentuale(x)}
                            righe={dati.composizione.map(r => ({ chiave: r.codice, etichetta: `${r.codice} · ${nomeProdotto(r.codice)} (${r.n})`, valore: r.quota ?? 0, piano: r.piano }))}
                        />
                        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Commissione media ponderata</p>
                                <p className="text-lg font-semibold text-foreground">{fmtPercentuale(commissioneMediaPonderata(dati.voci), 1)}</p>
                                <p className="text-xs text-muted-foreground">Piano {String(COMMISSIONE_MEDIA_PIANO).replace('.', ',')}%</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Pagano la quota dell’app</p>
                                <p className="text-lg font-semibold text-foreground">{fmtPercentuale(quota(dati.conApp, dati.voci.length))}</p>
                                <p className="text-xs text-muted-foreground">Piano {fmtPercentuale(pianoApp)} · col P2 è inclusa</p>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-muted-foreground">
                            Con {dati.voci.length} contratti ogni contratto sposta la composizione di molti punti: il confronto col piano diventa leggibile con il portafoglio vero.
                        </p>
                    </Riquadro>
                </div>

                <Riquadro icona={Users} titolo="Per canale"
                    sottotitolo="Il codice referente si lega al cliente quando si registra, per sempre: ogni vendita a quel cliente è del commerciale che l’ha portato.">
                    <div className="hidden lg:grid lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))] gap-4 pb-2 border-b border-border text-xs font-medium text-muted-foreground">
                        <span>Canale</span><span className="text-right">Clienti</span><span className="text-right">Contratti attivi</span>
                        <span className="text-right">Valore annuo</span><span className="text-right">Provvigioni maturate</span>
                    </div>
                    <ul className="divide-y divide-border">
                        {dati.canali.map(c => (
                            <li key={c.chiave} className="py-3 grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(4,minmax(0,1fr))] lg:gap-4 lg:items-start">
                                <div className="col-span-2 lg:col-span-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground">{c.tipo === 'diretto' ? 'Vendite dirette' : c.tipo === 'referente' ? c.commerciale : testoCanale(c)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {c.tipo === 'diretto' ? 'Senza codice referente' : c.codice}
                                        {c.chiusoIl && ` · codice chiuso il ${fmtData(c.chiusoIl)}`}
                                    </p>
                                </div>
                                <Numero etichetta="Clienti" className="lg:text-right">{c.clienti}</Numero>
                                <Numero etichetta="Contratti attivi" className="lg:text-right">{c.contratti}</Numero>
                                <Numero etichetta="Valore annuo" className="lg:text-right">{euro(c.valoreAnnuo)}</Numero>
                                <div className="text-sm lg:text-right">
                                    <p className="text-[11px] text-muted-foreground lg:hidden">Provvigioni maturate</p>
                                    <p className="tabular-nums text-foreground">{c.tipo === 'diretto' ? '—' : euro(c.provvigioni)}</p>
                                    {c.senzaAliquota > 0 && <p className="text-xs text-muted-foreground">{c.senzaAliquota} {c.senzaAliquota === 1 ? 'vendita' : 'vendite'} senza aliquota</p>}
                                    {c.dopoLaChiusura > 0 && <p className="text-xs text-muted-foreground">{c.dopoLaChiusura} dopo la chiusura del codice</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                        <p className="max-w-3xl">
                            La provvigione è una quota del valore del primo anno, con le aliquote di Impostazioni:{' '}
                            {Object.entries(ALIQUOTE_PROVVIGIONE).map(([c, a]) => `${a}% ${c}`).join(', ')}.
                            P1E, P5 e P7 un’aliquota non ce l’hanno ancora.
                        </p>
                        <Link to="/dashboard/admin/provvigioni" className="inline-flex items-center gap-1 font-medium text-foreground hover:underline">
                            Pagamenti in Provvigioni <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </Riquadro>

                <NotaMockup>
                    <p>
                        I codici referente e i clienti che ogni commerciale ha portato sono dati di prova del back office. Per vedere cambiare i numeri:
                        entra come Immobiliare Verdi e firma la pratica di Via Bergamo 8 (diventa un contratto attivo), oppure come Mario Rossi paga
                        Via Savona 22 (conta nell’incassato del mese e matura la provvigione di Sara Esposito).
                    </p>
                </NotaMockup>
            </div>
        </>
    );
};

export default VenditePage;
