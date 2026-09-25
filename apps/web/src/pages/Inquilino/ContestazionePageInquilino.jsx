import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import ListaContestazioni from '@/components/aree/ListaContestazioni';
import DettaglioContestazione from '@/components/aree/DettaglioContestazione';
import { useDatiInquilino } from '@/hooks/useDatiArea';
import { contestazioneChiusa } from '@/lib/etichette';

// I-06 — Contestazioni viste dall'inquilino. Si aprono dalla segnalazione;
// qui si seguono.

const BASE = '/dashboard/inquilino/contestazioni';

const ContestazionePageInquilino = () => {
    const { id } = useParams();
    const { contratti, contestazioni } = useDatiInquilino();

    if (id) {
        const k = contestazioni.find(x => x.id === id);
        if (!k) {
            return (
                <div className="space-y-6">
                    <IntestazionePagina titolo="Contestazione non trovata" indietro={{ to: BASE, label: 'Contestazioni' }} />
                    <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Questa contestazione non riguarda i tuoi contratti.</CardContent></Card>
                </div>
            );
        }
        return (
            <>
                <Helmet><title>Contestazione - CRIA</title></Helmet>
                <DettaglioContestazione key={k.id} contestazione={k} contratto={contratti.find(c => c.id === k.contrattoId)} prospettiva="conduttore" tornaA={{ to: BASE, label: 'Contestazioni' }} />
            </>
        );
    }

    const inCorso = contestazioni.filter(k => !contestazioneChiusa(k.stato)).length;

    return (
        <>
            <Helmet><title>Contestazioni - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Contestazioni"
                    sottotitolo={<>Le segnalazioni che hai contestato. Per contestarne una nuova apri le <Link to="/dashboard/inquilino/segnalazioni" className="text-primary hover:underline">segnalazioni ricevute</Link>.</>}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Contatore etichetta="In corso" valore={inCorso} colore="bg-blue-500" />
                    <Contatore etichetta="Chiuse" valore={contestazioni.length - inCorso} colore="bg-slate-400" />
                    <Contatore etichetta="Risolte a tuo favore" valore={contestazioni.filter(k => k.stato === 'risolta_favore_inquilino').length} colore="bg-purple-500" />
                </div>
                <ListaContestazioni contestazioni={contestazioni} contratti={contratti} prospettiva="conduttore" basePath={BASE} />
            </div>
        </>
    );
};

export default ContestazionePageInquilino;
