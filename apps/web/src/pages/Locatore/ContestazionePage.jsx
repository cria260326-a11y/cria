import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import ListaContestazioni from '@/components/aree/ListaContestazioni';
import DettaglioContestazione from '@/components/aree/DettaglioContestazione';
import { useDatiProprietario } from '@/hooks/useDatiArea';
import { contestazioneChiusa } from '@/lib/etichette';

// P-13 — Contestazioni viste dal proprietario. Elenco e dettaglio restano
// nell'area del proprietario; la decisione è di CRIA, qui non si risolve nulla.

const BASE = '/dashboard/locatore/contestazioni';

const ContestazionePage = () => {
    const { id } = useParams();
    const { contratti, contestazioni } = useDatiProprietario();

    if (id) {
        const k = contestazioni.find(x => x.id === id);
        if (!k) {
            return (
                <div className="space-y-6">
                    <IntestazionePagina titolo="Contestazione non trovata" indietro={{ to: BASE, label: 'Contestazioni' }} />
                    <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Questa contestazione non riguarda i tuoi immobili.</CardContent></Card>
                </div>
            );
        }
        return (
            <>
                <Helmet><title>Contestazione - CRIA</title></Helmet>
                <DettaglioContestazione
                    key={k.id}
                    contestazione={k}
                    contratto={contratti.find(c => c.id === k.contrattoId)}
                    prospettiva="locatore"
                    tornaA={{ to: BASE, label: 'Contestazioni' }}
                />
            </>
        );
    }

    const inCorso = contestazioni.filter(k => !contestazioneChiusa(k.stato)).length;
    const aFavore = contestazioni.filter(k => k.stato === 'risolta_favore_locatore').length;

    return (
        <>
            <Helmet><title>Contestazioni - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Contestazioni"
                    sottotitolo="Quando un inquilino contesta una tua segnalazione di mancato pagamento. Decide CRIA, sulla base delle prove di entrambi."
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Contatore etichetta="In corso" valore={inCorso} colore="bg-red-500" />
                    <Contatore etichetta="Chiuse" valore={contestazioni.length - inCorso} colore="bg-slate-400" />
                    <Contatore etichetta="Risolte a tuo favore" valore={aFavore} colore="bg-blue-500" />
                </div>
                <ListaContestazioni contestazioni={contestazioni} contratti={contratti} prospettiva="locatore" basePath={BASE} />
            </div>
        </>
    );
};

export default ContestazionePage;
