import React from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { Info, ListChecks, Send, Timer, Umbrella } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import AzioneGaranzia from '@/components/admin/garanzia/AzioneGaranzia';
import Chip from '@/components/admin/garanzia/Chip';
import NotaGaranzia from '@/components/admin/garanzia/NotaGaranzia';
import Termine from '@/components/admin/garanzia/Termine';
import { STATO_RENDICONTO, euro } from '@/components/admin/garanzia/stati';
import { nomeOperatore } from '@/data/operatori';
import { PRODOTTI } from '@/data/catalogo';
import { QUOTA_RIASSICURAZIONE, TERMINI } from '@/data/garanzia';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { confiniTrimestre, ilGiorno, inviaRendiconto, useGaranzia } from '@/lib/garanziaDemo';
import { nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// O-20 — RIASSICURAZIONE
// Il rendiconto trimestrale al riassicuratore (§14.3, riassicurazione_periodi):
// premio ceduto, sinistri, indennizzi pagati, recuperi, e i due indicatori del
// §13.6 — tempo medio al primo contatto e fasi chiuse nel termine. Solo numeri
// calcolati dai contratti e dalle pratiche: nessun nome di inquilino o di
// proprietario, la vede anche la direzione. Lo invia la responsabile amministrativa.
// ═════════════════════════════════════════════════════════════════════════════

const QUOTA = Math.round(QUOTA_RIASSICURAZIONE * 100);
const fmtGiorni = (n) => (n == null ? '—' : `${n.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} giorni`);
const mesiDelTrimestre = (t) => {
    const { mesi } = confiniTrimestre(t.id);
    return `${nomeMese(mesi[0]).split(' ')[0].toLowerCase()}–${nomeMese(mesi[2]).toLowerCase()}`;
};

// Le voci del rendiconto, una riga ciascuna: valore e dettaglio.
const VOCI = [
    { chiave: 'contratti', etichetta: 'Contratti con garanzia', valore: t => t.contratti, dettaglio: t => `${t.mesiContratto} mesi-contratto` },
    { chiave: 'commissioni', etichetta: 'Commissioni', valore: t => euro(t.commissioni) },
    { chiave: 'premio', etichetta: `Premio ceduto (${QUOTA}%)`, valore: t => euro(t.premioCeduto), forte: true },
    { chiave: 'sinistri', etichetta: 'Sinistri aperti', valore: t => t.sinistri, dettaglio: t => `${t.sinistriConIndennizzo} con indennizzo` },
    { chiave: 'indennizzi', etichetta: 'Indennizzi pagati', valore: t => euro(t.indennizziPagati), forte: true },
    { chiave: 'recuperi', etichetta: 'Recuperi', valore: t => euro(t.recuperi) },
    {
        chiave: 'contatto', etichetta: 'Tempo medio al primo contatto', valore: t => fmtGiorni(t.indicatori.primoContatto.media),
        dettaglio: t => (t.indicatori.primoContatto.n ? `su ${t.indicatori.primoContatto.n} ${t.indicatori.primoContatto.n === 1 ? 'pratica' : 'pratiche'}` : 'nessun contatto'),
    },
    {
        chiave: 'fasi', etichetta: 'Fasi chiuse nel termine', valore: t => (t.indicatori.fasi.percentuale == null ? '—' : `${t.indicatori.fasi.percentuale}%`),
        dettaglio: t => `${t.indicatori.fasi.nelTermine} su ${t.indicatori.fasi.totale}`,
    },
];

const Rendiconto = ({ t }) => {
    const { operatoreId } = useOperatoreAttivo();
    const invia = () => {
        const r = inviaRendiconto(t, operatoreId);
        if (r.ok) toast.success(`Rendiconto del ${t.etichetta} inviato al riassicuratore`);
        else toast.error(r.motivo);
    };
    return (
        <div className="space-y-1.5">
            <Chip stato={STATO_RENDICONTO[t.stato]} />
            {t.stato === 'inviato' && <p className="text-xs text-muted-foreground">{ilGiorno(t.inviatoIl)} da {nomeOperatore(t.inviatoDa)}</p>}
            {t.stato === 'in_corso' && <p className="text-xs text-muted-foreground">si chiude {ilGiorno(t.al)}, dati parziali</p>}
            {t.stato === 'da_inviare' && (
                <>
                    <Termine termine={t.termine} mancano={t.mancano} calendario="solari" />
                    <AzioneGaranzia azione="invia_rendiconto" record={t} className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]" onEsegui={invia}>
                        <Send className="w-3.5 h-3.5" /> Invia
                    </AzioneGaranzia>
                </>
            )}
        </div>
    );
};

const RiassicurazionePage = () => {
    const g = useGaranzia();
    const periodi = [...g.periodi].reverse();
    const inCorso = g.periodi.find(t => t.stato === 'in_corso');
    const daInviare = g.periodi.filter(t => t.stato === 'da_inviare');
    const garantiti = Object.values(PRODOTTI).filter(p => p.garanzia).map(p => p.nome);

    return (
        <>
            <Helmet><title>Riassicurazione - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Riassicurazione"
                    sottotitolo="Il rendiconto trimestrale al riassicuratore. Solo numeri: nessun nome di inquilino o di proprietario."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Contatore etichetta="Tempo medio al primo contatto" valore={fmtGiorni(g.trimestreInCorso.primoContatto.media)} icona={Timer} colore="bg-[#1A2D52]"
                        nota={`Trimestre in corso · 12 mesi: ${fmtGiorni(g.indicatori.primoContatto.media)}`} />
                    <Contatore etichetta="Fasi chiuse nel termine" valore={g.trimestreInCorso.fasi.percentuale == null ? '—' : `${g.trimestreInCorso.fasi.percentuale}%`} icona={ListChecks} colore="bg-green-600"
                        nota={`Trimestre in corso · 12 mesi: ${g.indicatori.fasi.percentuale ?? '—'}%`} />
                    <Contatore etichetta="Premio ceduto nel trimestre" valore={euro(inCorso?.premioCeduto || 0)} icona={Umbrella} colore="bg-purple-500"
                        nota={`Il ${QUOTA}% di ${euro(inCorso?.commissioni || 0)} di commissioni`} />
                    <Contatore etichetta="Rendiconti da inviare" valore={daInviare.length} icona={Send} colore="bg-amber-500"
                        nota={daInviare.length ? `${daInviare[0].etichetta}: entro ${ilGiorno(daInviare[0].termine)}` : 'Tutti inviati'} />
                </div>

                {/* Da md in su: una colonna per trimestre, come un rendiconto. */}
                <Card className="hidden md:block">
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/40">
                                <tr className="text-left">
                                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Voce</th>
                                    {periodi.map(t => (
                                        <th key={t.id} scope="col" className="px-4 py-3 text-right align-bottom">
                                            <span className="block text-sm font-semibold text-foreground whitespace-nowrap">{t.etichetta}</span>
                                            <span className="block text-xs font-normal text-muted-foreground whitespace-nowrap">{mesiDelTrimestre(t)}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {VOCI.map(v => (
                                    <tr key={v.chiave}>
                                        <th scope="row" className="px-4 py-3 text-left font-medium text-foreground">{v.etichetta}</th>
                                        {periodi.map(t => (
                                            <td key={t.id} className="px-4 py-3 text-right tabular-nums">
                                                <span className={`whitespace-nowrap ${v.forte ? 'font-semibold text-foreground' : 'text-foreground'}`}>{v.valore(t)}</span>
                                                {v.dettaglio && <span className="block text-xs text-muted-foreground whitespace-nowrap">{v.dettaglio(t)}</span>}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                <tr>
                                    <th scope="row" className="px-4 py-3 text-left font-medium text-foreground align-top">Rendiconto</th>
                                    {periodi.map(t => (
                                        <td key={t.id} className="px-4 py-3 align-top">
                                            <div className="flex justify-end text-right"><Rendiconto t={t} /></div>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Sul telefono: una scheda per trimestre. */}
                <div className="space-y-4 md:hidden">
                    {periodi.map(t => (
                        <Card key={t.id}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">{t.etichetta}</CardTitle>
                                <p className="text-xs text-muted-foreground">{mesiDelTrimestre(t)}</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <dl className="divide-y divide-border">
                                    {VOCI.map(v => (
                                        <div key={v.chiave} className="py-2 flex items-start justify-between gap-3 text-sm">
                                            <dt className="text-muted-foreground">{v.etichetta}</dt>
                                            <dd className="text-right tabular-nums">
                                                <span className={v.forte ? 'font-semibold text-foreground' : 'text-foreground'}>{v.valore(t)}</span>
                                                {v.dettaglio && <span className="block text-xs text-muted-foreground">{v.dettaglio(t)}</span>}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                                <Rendiconto t={t} />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Info className="w-5 h-5" /> Come si legge</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
                            <li>La riassicurazione vale il {QUOTA}% della commissione: il premio ceduto è il {QUOTA}% delle commissioni dei contratti con garanzia ({garantiti.filter((n, i, a) => a.indexOf(n) === i).join(' e ')}), mese per mese. {PRODOTTI.P5.nome} non ha garanzia e non entra.</li>
                            <li>Sinistri: le pratiche di morosità aperte nel trimestre su un mese coperto. Quelle chiuse col pagamento dell’inquilino restano senza indennizzo.</li>
                            <li>Indennizzi pagati: i bonifici eseguiti ai proprietari nel trimestre. Recuperi: le rate dei piani di rientro arrivate a CRIA.</li>
                            <li>Tempo medio al primo contatto: giorni dalla chiusura del mese al primo contatto andato a segno con l’inquilino.</li>
                            <li>Fasi chiuse nel termine: le fasi della morosità e degli indennizzi chiuse nel trimestre, entro il loro termine.</li>
                            <li>Il mese non rilevato non è coperto: senza questa regola l’esposizione non avrebbe limite. Il rendiconto si invia entro {TERMINI.rendiconto.giorni} giorni dalla fine del trimestre.</li>
                        </ul>
                    </CardContent>
                </Card>

                <NotaGaranzia />
            </div>
        </>
    );
};

export default RiassicurazionePage;
