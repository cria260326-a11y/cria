import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import { fmtEuro, PRODOTTI } from '@/data/catalogo';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { useCicloMensile, accessoCiclo, MESE_CORRENTE, MESE_PROSSIMO } from '@/lib/incassiDemo';
import { nomeMese } from '@/lib/formato';
import { Numero } from '@/components/admin/istruttoria/Elementi';
import { RigheCanoni, MatriceCanoni, righeDelMese, totaliDelMese } from '@/components/admin/incassi/CanoniMese';

// ═════════════════════════════════════════════════════════════════════════════
// PAGAMENTI — O-11. Canoni attesi e ricevuti, per contratto e per mese.
// Con CRIA Completo incassa CRIA: il dato viene dal conto (O-12) e il canone
// si gira al proprietario. Con gli altri prodotti incassa il proprietario e il
// dato è la sua segnalazione (O-09): CRIA non vede i soldi, vede cosa dice lui.
// Un selettore solo, in alto: un mese (i numeri e l'elenco di quel mese) oppure
// «Tutti i mesi» (i totali di tutti i mesi e il prospetto completo).
// ═════════════════════════════════════════════════════════════════════════════

const TUTTI = 'tutti';

const plurale = (n, uno, molti) => `${n} ${n === 1 ? uno : molti}`;

const PagamentiPage = () => {
    const dati = useCicloMensile();
    const { operatore } = useOperatoreAttivo();
    const accesso = accessoCiclo('pagamenti', operatore);
    const [mese, setMese] = useState(MESE_CORRENTE);
    const tutti = mese === TUTTI;
    const soloNumeri = accesso.livello === 'numeri';
    const mesi = [MESE_PROSSIMO, ...[...dati.mesi].reverse()];

    const righe = useMemo(() => (tutti ? [] : righeDelMese(dati.contratti, mese, dati.movimenti)), [dati, mese, tutti]);

    // Con «Tutti i mesi» i numeri sono la somma dei mesi del prospetto; il mese
    // prossimo non entra, perché non è ancora cominciato.
    const t = useMemo(() => {
        if (!tutti) return totaliDelMese(righe);
        return dati.mesi
            .map(m => totaliDelMese(righeDelMese(dati.contratti, m, dati.movimenti)))
            .reduce((a, b) => Object.fromEntries(Object.keys(a).map(k => [k, a[k] + b[k]])));
    }, [dati, righe, tutti]);

    const periodo = tutti
        ? `da ${nomeMese(dati.mesi[0]).toLowerCase()} a ${nomeMese(dati.mesi[dati.mesi.length - 1]).toLowerCase()}`
        : `a ${nomeMese(mese).toLowerCase()}`;

    return (
        <div className="space-y-6">
            <Helmet><title>Pagamenti - CRIA</title></Helmet>
            <IntestazionePagina
                titolo="Pagamenti"
                sottotitolo={`Canoni attesi e ricevuti. Con ${PRODOTTI.P2.nome} il dato viene dal conto di CRIA; con gli altri prodotti è quello che segnala il proprietario.`}
                azioni={(
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        Mese
                        <select value={mese} onChange={e => setMese(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground">
                            <option value={TUTTI}>Tutti i mesi</option>
                            {mesi.map(m => <option key={m} value={m}>{nomeMese(m)}{m === MESE_PROSSIMO ? ' (prossimo)' : ''}</option>)}
                        </select>
                    </label>
                )}
            />

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <Numero etichetta={`Attesi ${periodo}`} valore={fmtEuro(t.attesi)} />
                <Numero etichetta="Ricevuti sul conto di CRIA" valore={fmtEuro(t.ricevutiCria)} nota={PRODOTTI.P2.nome} tono="buono" />
                <Numero etichetta="Ricevuti dai proprietari" valore={fmtEuro(t.ricevutiProprietario)} nota="secondo le loro segnalazioni" />
                <Numero
                    etichetta="Non pagati"
                    valore={fmtEuro(t.nonPagati)}
                    nota={`${tutti ? plurale(t.quantiNonPagati, 'mese', 'mesi') : plurale(t.quantiNonPagati, 'contratto', 'contratti')}, contestati compresi`}
                    tono={t.quantiNonPagati ? 'allarme' : 'normale'}
                />
                <Numero
                    etichetta="Non rilevati"
                    valore={t.nonRilevati}
                    nota={tutti ? 'mesi che nessuno ha segnalato' : 'nessuno sa se sono arrivati'}
                    tono={t.nonRilevati ? 'attenzione' : 'normale'}
                />
            </div>

            {soloNumeri ? (
                <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Il dettaglio per contratto lo vede chi segue gli incassi.</CardContent></Card>
            ) : (
                <div className="space-y-3">
                    {mese === MESE_PROSSIMO && <p className="text-xs text-muted-foreground">Il mese non è ancora cominciato: con {PRODOTTI.P2.nome} si vede se qualcuno ha pagato in anticipo.</p>}
                    {tutti
                        ? <MatriceCanoni contratti={dati.contratti} mesi={dati.mesi} movimenti={dati.movimenti} />
                        : <RigheCanoni righe={righe} />}
                </div>
            )}
        </div>
    );
};

export default PagamentiPage;
