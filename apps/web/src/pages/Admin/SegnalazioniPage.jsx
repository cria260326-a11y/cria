import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent } from '@/components/ui/card';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { useCicloMensile, accessoCiclo, MESE_CORRENTE } from '@/lib/incassiDemo';
import { nomeMese } from '@/lib/formato';
import { Numero } from '@/components/admin/istruttoria/Elementi';
import CalendarioCiclo from '@/components/admin/incassi/CalendarioCiclo';
import InfoSpiegazione from '@/components/aree/InfoSpiegazione';
import { RigheSegnalazioni, ProssimoCiclo, contaDelMese } from '@/components/admin/incassi/SegnalazioniMese';

// ═════════════════════════════════════════════════════════════════════════════
// SEGNALAZIONI — O-09.
// Il ciclo del mese per tutti i contratti: tre esiti più non rilevato, la
// finestra dei 5 giorni solari dalla scadenza, la chiusura all'11, i tre
// solleciti e lo stato della copertura (§9.2, §9.2-bis). Una segnalazione non
// si corregge a mano: solo con una contestazione accolta (O-10).
// ═════════════════════════════════════════════════════════════════════════════

const SegnalazioniPage = () => {
    const dati = useCicloMensile();
    const { operatore } = useOperatoreAttivo();
    const accesso = accessoCiclo('segnalazioni', operatore);
    const [mese, setMese] = useState(MESE_CORRENTE);
    const conto = contaDelMese(dati.contratti, mese);
    const soloNumeri = accesso.livello === 'numeri';

    return (
        <div className="space-y-6">
            <Helmet><title>Segnalazioni - CRIA</title></Helmet>
            <IntestazionePagina
                titolo="Segnalazioni"
                badge={<InfoSpiegazione etichetta="Il ciclo del mese" allinea="start" larga><CalendarioCiclo /></InfoSpiegazione>}
                sottotitolo="Il ciclo del mese: chi incassa da sé dice se il canone è arrivato. Tre esiti, più il non rilevato di chi non risponde."
                azioni={(
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        Mese
                        <select value={mese} onChange={e => setMese(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground">
                            {[...dati.mesi].reverse().map(m => <option key={m} value={m}>{nomeMese(m)}</option>)}
                        </select>
                    </label>
                )}
            />

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <Numero etichetta="Pagati" valore={conto.pagati} tono="buono" />
                <Numero etichetta="Non pagati, segnalati in tempo" valore={conto.entro} nota="copertura attiva" />
                <Numero etichetta="Non pagati, segnalati in ritardo" valore={conto.dopo} nota="copertura decaduta" tono={conto.dopo ? 'attenzione' : 'normale'} />
                <Numero etichetta="Non rilevati" valore={conto.nonRilevati} nota="fuori dal semaforo" tono={conto.nonRilevati ? 'allarme' : 'normale'} />
                <Numero etichetta="Incassa CRIA" valore={conto.cria} nota="nessuna domanda al proprietario" />
            </div>

            {soloNumeri ? (
                <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Il dettaglio per contratto lo vede chi segue il ciclo del mese.</CardContent></Card>
            ) : (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h2 className="text-lg font-semibold text-foreground">{nomeMese(mese)}</h2>
                        <p className="text-xs text-muted-foreground">Una segnalazione non si corregge a mano: solo con una contestazione accolta, con prova e due firme.</p>
                    </div>
                    <RigheSegnalazioni righe={conto.righe} />
                </div>
            )}

            <ProssimoCiclo contratti={dati.contratti} conNomi={!soloNumeri} />
        </div>
    );
};

export default SegnalazioniPage;
