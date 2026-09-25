import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import { PRODOTTI } from '@/data/catalogo';
import NotaMockup from '@/components/NotaMockup';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import {
    useIstruttoria, accessoIstruttoria, PERCORSO_ISTRUTTORIA,
    simulaDocumentiCandidato, simulaInvioAutocandidatura, simulaRicaricaProprietario, ripristinaIstruttoriaDemo,
} from '@/lib/istruttoriaDemo';
import { ripristinaAutocandidatureDemo } from '@/lib/autocandidatureDemo';
import { ripristinaVerificheDemo } from '@/lib/verificheDemo';
import { AvvisoAccesso, Numero } from '@/components/admin/istruttoria/Elementi';
import CodaIstruttoria, { VISTE } from '@/components/admin/istruttoria/CodaIstruttoria';
import DettaglioIstruttoria from '@/components/admin/istruttoria/DettaglioIstruttoria';
import { TassoDissenso, Squadra, ComeSiAssegna, NonConformita, RegistroLetture } from '@/components/admin/istruttoria/PannelliIstruttoria';

// ═════════════════════════════════════════════════════════════════════════════
// ISTRUTTORIA — O-07, con dentro la verifica dei documenti (O-08).
// La coda delle pratiche assegnate: pratiche dei proprietari, autocandidature
// inviate a CRIA e richieste di CRIA Verifica da esitare entro 48 ore.
// Il sistema propone, una persona delibera: conferma o dissenso motivato, e il
// tasso di dissenso si misura (art. 22 GDPR, §13.6). Chi ha acquisito il cliente
// non delibera (§13.4). I documenti li apre solo chi ha la pratica in coda (§13.5).
// ═════════════════════════════════════════════════════════════════════════════

const Numeri = ({ dati }) => {
    const aperte = dati.voci.filter(v => v.fase !== 'deliberata');
    const daDeliberare = aperte.filter(v => v.fase === 'da_deliberare' && v.tipo !== 'verifica').length;
    const inArrivo = aperte.filter(v => v.fase === 'in_arrivo').length;
    const verifiche = aperte.filter(v => v.tipo === 'verifica').length;
    const documenti = aperte.reduce((n, v) => n + v.documenti.filter(d => d.verificabile && d.stato === 'da_verificare').length, 0);
    const { mese } = dati.dissenso;
    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Numero etichetta="Da deliberare" valore={daDeliberare} tono={daDeliberare ? 'attenzione' : 'normale'} />
            <Numero etichetta="In arrivo" valore={inArrivo} nota="documenti o prove incompleti" />
            <Numero etichetta={`${PRODOTTI.P3.nome} da esitare`} valore={verifiche} nota={`entro ${PRODOTTI.P3.oreEsito} ore`} tono={verifiche ? 'attenzione' : 'normale'} />
            <Numero etichetta="Documenti da verificare" valore={documenti} />
            <Numero etichetta="Dissenso del mese" valore={mese.tasso == null ? '—' : `${mese.tasso}%`} nota={`${mese.dissensi} su ${mese.totale} delibere`} />
        </div>
    );
};

const Simulazioni = ({ dati }) => {
    const pratiche = dati.voci.filter(v => v.tipo === 'pratica' && v.fase === 'in_arrivo');
    const daCaricare = pratiche.filter(v => v.raw.candidato && v.raw.candidato.documenti.some(d => d.stato !== 'caricato'));
    const daRicaricare = dati.voci.filter(v => v.tipo === 'pratica' && v.fase !== 'deliberata')
        .flatMap(v => v.documenti.filter(d => d.di === 'proprietario' && d.stato === 'non_conforme').map(d => ({ v, d })));
    const autocandidature = dati.voci.filter(v => v.tipo === 'autocandidatura' && v.fase === 'in_arrivo');
    const bottone = 'underline underline-offset-2 font-medium text-left';
    return (
        <NotaMockup>
            <p className="mb-2">Per provare la coda entra come Ettore Marini o Valeria Monti (istruttoria), come Luca Moretti per riassegnare, come Federica Villa o Tommaso Pellegrini per vedere cosa vedono direzione e DPO.</p>
            <ul className="space-y-1.5">
                {daCaricare.map(v => (
                    <li key={v.chiave}><button type="button" className={bottone} onClick={() => { simulaDocumentiCandidato(v.raw); toast.success(`${v.candidato} ha caricato tutto: la pratica è da deliberare`); }}>
                        Simula: {v.candidato} carica tutti i documenti ({v.titolo})
                    </button></li>
                ))}
                {daRicaricare.map(({ v, d }) => (
                    <li key={`${v.chiave}-${d.chiave}`}><button type="button" className={bottone} onClick={() => simulaRicaricaProprietario(v.raw, d.tipo)}>
                        Simula: il proprietario ricarica {d.etichetta.toLowerCase()} ({v.titolo})
                    </button></li>
                ))}
                {autocandidature.map(v => (
                    <li key={v.chiave}><button type="button" className={bottone} onClick={() => { simulaInvioAutocandidatura(v.raw); toast.success(`${v.cliente} ha inviato le prove a CRIA`); }}>
                        Simula: {v.cliente} invia le prove a CRIA
                    </button></li>
                ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-amber-200 flex flex-wrap gap-x-4 gap-y-1.5">
                <button type="button" className={bottone} onClick={() => { ripristinaIstruttoriaDemo(); toast.success('Istruttoria ripristinata: le pratiche tornano com’erano'); }}>
                    Ripristina l’istruttoria
                </button>
                <button type="button" className={bottone} onClick={() => { ripristinaIstruttoriaDemo(); ripristinaAutocandidatureDemo(); ripristinaVerificheDemo(); toast.success('Ripristinate anche autocandidature e verifiche'); }}>
                    Ripristina anche autocandidature e verifiche
                </button>
            </div>
            <p className="mt-2 text-xs text-amber-800">Il primo toglie delibere, verifiche dei documenti, assegnazioni forzate e letture, e rimette le pratiche toccate da qui come erano. Il secondo rifà da capo anche i percorsi di inquilini e clienti.</p>
        </NotaMockup>
    );
};

const OnboardingPage = () => {
    const dati = useIstruttoria();
    const { operatore, operatoreId } = useOperatoreAttivo();
    const accesso = accessoIstruttoria(operatore);
    const [params, setParams] = useSearchParams();
    const [mie, setMie] = useState(null);

    // Cambiando operatore il filtro torna a quello della sua funzione.
    useEffect(() => { setMie(null); }, [operatoreId]);

    const apri = params.get('apri');
    const vista = VISTE.some(x => x.id === params.get('vista')) ? params.get('vista') : 'da_deliberare';
    const soloMie = mie ?? accesso.livello === 'operativo';
    const cambiaVista = (id) => setParams(id === 'da_deliberare' ? {} : { vista: id }, { replace: true });

    const intestazione = (
        <IntestazionePagina
            titolo="Istruttoria"
            sottotitolo="Le pratiche assegnate, la verifica dei documenti e la delibera. Il sistema propone, decide una persona: si può sempre dissentire, con un motivo."
        />
    );

    if (accesso.livello === 'numeri' || accesso.livello === 'registro') {
        return (
            <div className="space-y-6">
                <Helmet><title>Istruttoria - CRIA</title></Helmet>
                {intestazione}
                <AvvisoAccesso testo={accesso.testo} />
                <Numeri dati={dati} />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <TassoDissenso dissenso={dati.dissenso} conNomi={false} />
                    {accesso.livello === 'registro' ? <RegistroLetture letture={dati.letture} /> : <NonConformita nonConformita={dati.nonConformita} />}
                </div>
            </div>
        );
    }

    if (apri) {
        const voce = dati.voci.find(v => v.chiave === apri);
        return (
            <div className="space-y-6">
                <Helmet><title>{voce ? `${voce.titolo} · Istruttoria` : 'Istruttoria'} - CRIA</title></Helmet>
                {voce ? (
                    <DettaglioIstruttoria voce={voce} letture={dati.letture} lingue={dati.lingue} operatoreId={operatoreId} tornaA={vista === 'da_deliberare' ? PERCORSO_ISTRUTTORIA : `${PERCORSO_ISTRUTTORIA}?vista=${vista}`} />
                ) : (
                    <>
                        <IntestazionePagina titolo="Voce non trovata" indietro={{ to: PERCORSO_ISTRUTTORIA, label: 'Istruttoria' }} />
                        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Questa voce non è nella coda dell’istruttoria.</CardContent></Card>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Helmet><title>Istruttoria - CRIA</title></Helmet>
            {intestazione}
            <Numeri dati={dati} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 min-w-0">
                    <CodaIstruttoria
                        voci={dati.voci} vista={vista} onVista={cambiaVista}
                        mie={soloMie} onMie={setMie} operatoreId={operatoreId}
                        conFiltroMie={accesso.livello === 'operativo'}
                    />
                </div>
                <div className="space-y-6 min-w-0">
                    <TassoDissenso dissenso={dati.dissenso} />
                    <Squadra voci={dati.voci} />
                    <ComeSiAssegna />
                    <NonConformita nonConformita={dati.nonConformita} />
                </div>
            </div>

            <Simulazioni dati={dati} />
        </div>
    );
};

export default OnboardingPage;
