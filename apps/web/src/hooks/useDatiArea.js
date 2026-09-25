import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { contestazioniDeiContratti } from '@/data/datiDemo';
import { useDocumenti, documentiDellaPersona } from '@/lib/documentiFonte';
import { useContestazioni, allaFormaDelleSchermate } from '@/lib/cicloFonte';
import { useContratti, contrattiPerVerso } from '@/lib/contrattiFonte';
import { analizzaMesi } from '@/lib/semaforo';
import { useContestazioniDemo, applicaContestazioniAlContratto, applicaEsitoContestazione } from '@/lib/incassiDemo';

// Ogni pagina delle aree legge da qui: i contratti della persona collegata,
// visti dal cappello attivo. Il semaforo è calcolato una volta sola.
// Le decisioni del back office sulle contestazioni (O-10: respinta, accolta
// con rettifica) si applicano qui, così proprietario e inquilino le vedono.

const conAnalisi = (c) => ({ ...c, analisi: analizzaMesi(c.mesi) });

// Le contestazioni di quei contratti: quelle vere del database più quelle dei
// dati di prova, che spariranno quando passeranno anche loro.
const contestazioniDi = (contratti, dalDatabase, esiti) => {
    const suoi = new Set(contratti.map(c => c.id));
    return [
        ...dalDatabase.filter(k => suoi.has(k.contrattoId)).map(allaFormaDelleSchermate),
        ...contestazioniDeiContratti(contratti).map(k => applicaEsitoContestazione(k, esiti)),
    ];
};

export const useDatiProprietario = () => {
    const { persona } = useAuth();
    const esiti = useContestazioniDemo();
    const tutti = useContratti();
    const documenti = useDocumenti();
    const dalDatabase = useContestazioni();
    return useMemo(() => {
        const contratti = contrattiPerVerso(tutti, persona?.id, 'locatore').map(c => conAnalisi(applicaContestazioniAlContratto(c, esiti)));
        return {
            persona,
            contratti,
            contestazioni: contestazioniDi(contratti, dalDatabase, esiti),
            documenti: documentiDellaPersona(documenti, persona?.id, contratti),
        };
    }, [persona, esiti, tutti, documenti, dalDatabase]);
};

export const useDatiInquilino = () => {
    const { persona } = useAuth();
    const esiti = useContestazioniDemo();
    const tutti = useContratti();
    const documenti = useDocumenti();
    const dalDatabase = useContestazioni();
    return useMemo(() => {
        const contratti = contrattiPerVerso(tutti, persona?.id, 'conduttore').map(c => conAnalisi(applicaContestazioniAlContratto(c, esiti)));
        return {
            persona,
            contratti,
            // Il semaforo della persona, non del singolo contratto (documento §13.3).
            analisiPersona: analizzaMesi(contratti.flatMap(c => c.mesi)),
            contestazioni: contestazioniDi(contratti, dalDatabase, esiti),
            documenti: documentiDellaPersona(documenti, persona?.id, contratti),
        };
    }, [persona, esiti, tutti, documenti, dalDatabase]);
};
