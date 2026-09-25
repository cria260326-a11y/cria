import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import NotaMockup from '@/components/NotaMockup';
import { OGGI } from '@/data/datiDemo';
import { fmtEuro } from '@/data/catalogo';
import { REGOLE_CICLO } from '@/data/incassi';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { useCicloMensile, accessoCiclo, ripristinaRiconciliazioneDemo, inCodaDa, MESE_CORRENTE } from '@/lib/incassiDemo';
import { nomeMese } from '@/lib/formato';
import { Numero } from '@/components/admin/istruttoria/Elementi';
import { NuovoMovimento, MovimentoInCoda, MovimentoChiuso } from '@/components/admin/incassi/MovimentiConto';

// ═════════════════════════════════════════════════════════════════════════════
// RICONCILIAZIONE — O-12.
// I movimenti del conto di incasso di CRIA si inseriscono a mano (§16.1): il
// sistema cerca nella causale il codice univoco del contratto e propone
// l'abbinamento, chi lavora gli incassi conferma. Quello che non torna resta
// in coda, con il motivo scritto accanto.
// ═════════════════════════════════════════════════════════════════════════════

const ABBINATO = ['abbinato_automatico', 'abbinato_manuale'];

// Tre casi da provare: un anticipo pulito, un codice sbagliato, un contratto dove incassa il proprietario.
const ESEMPI = [
    { etichetta: 'anticipo di ottobre, codice giusto', dati: { data: OGGI, importo: '1.250,00', ordinante: 'RICCI STEFANO', causale: 'CRIA-2PZR-6YJF CANONE OTTOBRE' } },
    { etichetta: 'codice con un carattere sbagliato', dati: { data: OGGI, importo: '1.100,00', ordinante: 'COLOMBO DAVIDE', causale: 'CRIA-7Q4K-2M9B OTTOBRE' } },
    { etichetta: 'canone di un contratto dove incassa il proprietario', dati: { data: OGGI, importo: '1.400,00', ordinante: 'ROSSI MARIO', causale: 'CRIA-9WEN-4RB2 OTTOBRE' } },
];

const RiconciliazionePage = () => {
    const dati = useCicloMensile();
    const { operatore } = useOperatoreAttivo();
    const accesso = accessoCiclo('riconciliazione', operatore);
    const [vista, setVista] = useState('coda');
    const [mese, setMese] = useState(MESE_CORRENTE);
    const [esempio, setEsempio] = useState({ n: 0, dati: null });

    const coda = dati.movimenti.filter(m => !m.esito);
    const urgenti = coda.filter(m => inCodaDa(m) >= REGOLE_CICLO.giorniLavorativiAbbinamento).length;
    const delMese = dati.movimenti.filter(m => m.data.startsWith(mese));
    const abbinati = delMese.filter(m => ABBINATO.includes(m.esito?.stato));
    const nonAbbinabili = delMese.filter(m => m.esito?.stato === 'non_abbinabile');
    const automatici = abbinati.filter(m => m.esito.stato === 'abbinato_automatico').length;
    const incassato = abbinati.reduce((s, m) => s + m.importo, 0);
    const mesi = [...new Set(dati.movimenti.map(m => m.data.slice(0, 7)))].sort().reverse();
    const soloNumeri = accesso.livello === 'numeri';
    const lavora = accesso.livello === 'operativo';

    const VISTE = [
        { id: 'coda', t: 'Da abbinare', n: coda.length },
        { id: 'abbinati', t: 'Abbinati', n: abbinati.length },
        { id: 'non_abbinabili', t: 'Non abbinabili', n: nonAbbinabili.length },
    ];

    return (
        <div className="space-y-6">
            <Helmet><title>Riconciliazione - CRIA</title></Helmet>
            <IntestazionePagina
                titolo="Riconciliazione"
                sottotitolo="I bonifici in arrivo sul conto di CRIA, abbinati al contratto con il codice univoco scritto nella causale. Il collegamento con la banca non c’è ancora: i movimenti si inseriscono a mano."
                azioni={(
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        Mese
                        <select value={mese} onChange={e => setMese(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground">
                            {mesi.map(m => <option key={m} value={m}>{nomeMese(m)}</option>)}
                        </select>
                    </label>
                )}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Numero etichetta="In coda" valore={coda.length} nota={urgenti ? `${urgenti} da ${REGOLE_CICLO.giorniLavorativiAbbinamento} giorni lavorativi o più` : 'tutti recenti'} tono={urgenti ? 'allarme' : coda.length ? 'attenzione' : 'normale'} />
                <Numero etichetta={`Abbinati a ${nomeMese(mese).toLowerCase()}`} valore={abbinati.length} nota={`${automatici} proposte confermate, ${abbinati.length - automatici} a mano`} />
                <Numero etichetta="Non abbinabili" valore={nonAbbinabili.length} nota="da restituire" />
                <Numero etichetta="Incassato nel mese" valore={fmtEuro(incassato, 2)} tono="buono" />
            </div>

            {soloNumeri ? (
                <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">I movimenti li vede chi lavora gli incassi, la tesoreria e l’amministrazione.</CardContent></Card>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-3 min-w-0">
                        <div className="flex flex-wrap gap-1.5" role="tablist">
                            {VISTE.map(v => (
                                <button key={v.id} type="button" role="tab" aria-selected={vista === v.id} onClick={() => setVista(v.id)}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${vista === v.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                                    {v.t} <span className="tabular-nums text-xs">{v.n}</span>
                                </button>
                            ))}
                        </div>
                        {vista === 'coda' && (coda.length === 0
                            ? <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nessun movimento in coda.</CardContent></Card>
                            : coda.map(m => <MovimentoInCoda key={m.id} mov={m} movimenti={dati.movimenti} />))}
                        {vista === 'abbinati' && (abbinati.length === 0
                            ? <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nessun movimento abbinato a {nomeMese(mese).toLowerCase()}.</CardContent></Card>
                            : <div className="space-y-2">{abbinati.map(m => <MovimentoChiuso key={m.id} mov={m} />)}</div>)}
                        {vista === 'non_abbinabili' && (nonAbbinabili.length === 0
                            ? <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nessun movimento non abbinabile a {nomeMese(mese).toLowerCase()}.</CardContent></Card>
                            : <div className="space-y-2">{nonAbbinabili.map(m => <MovimentoChiuso key={m.id} mov={m} />)}</div>)}
                    </div>
                    <div className="space-y-6 min-w-0">
                        {lavora
                            ? <NuovoMovimento key={esempio.n} iniziale={esempio.dati} />
                            : <Card><CardContent className="py-6 text-sm text-muted-foreground">I movimenti li inserisce e li abbina la funzione incassi.</CardContent></Card>}
                        <Card>
                            <CardContent className="pt-5 space-y-2 text-sm">
                                <p className="font-medium text-foreground">Come propone il sistema</p>
                                <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                                    <li>Cerca nella causale il codice del contratto; se manca, prova con il nome di chi paga.</li>
                                    <li>Guarda il mese: il primo canone ancora atteso, o quello scritto nella causale.</li>
                                    <li>Confronta l’importo con quello atteso.</li>
                                </ol>
                                <p className="text-xs text-muted-foreground">Se tutto torna, basta confermare. Se qualcosa non torna, si abbina a mano con una nota, o si segna come non abbinabile: resta scritto chi e quando.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            <NotaMockup>
                <p className="mb-2">La coda la lavora Irene Caputo (incassi), o l’admin. Esempi da registrare:</p>
                <ul className="space-y-1.5">
                    {ESEMPI.map(e => (
                        <li key={e.etichetta}>
                            <button type="button" className="underline underline-offset-2 font-medium text-left" onClick={() => { setEsempio(prev => ({ n: prev.n + 1, dati: e.dati })); toast.success('Esempio caricato nel modulo'); }}>
                                {e.dati.ordinante} · {e.dati.importo} € · «{e.dati.causale}»
                            </button>
                            <span className="text-xs text-amber-800"> — {e.etichetta}</span>
                        </li>
                    ))}
                </ul>
                <button type="button" className="mt-3 underline underline-offset-2 font-medium" onClick={() => { ripristinaRiconciliazioneDemo(); toast.success('Riconciliazione ripristinata'); }}>
                    Ripristina la riconciliazione
                </button>
            </NotaMockup>
        </div>
    );
};

export default RiconciliazionePage;
