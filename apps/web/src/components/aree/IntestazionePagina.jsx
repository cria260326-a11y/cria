import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Intestazione uguale per tutte le pagine delle aree: titolo, sottotitolo,
// azioni a destra, e il ritorno alla pagina madre quando serve. Dal tablet in
// su sono due colonne: il testo si stringe e le azioni (un selettore del mese,
// un pulsante) restano in alto a destra; sul telefono le azioni vanno sotto.
const IntestazionePagina = ({ titolo, sottotitolo, azioni, indietro, badge }) => (
    <div className="space-y-2">
        {indietro && (
            <Link to={indietro.to} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" /> {indietro.label}
            </Link>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0 sm:flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-foreground">{titolo}</h1>
                    {badge}
                </div>
                {sottotitolo && <p className="text-sm text-muted-foreground mt-1">{sottotitolo}</p>}
            </div>
            {azioni && <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0 sm:justify-end">{azioni}</div>}
        </div>
    </div>
);

export default IntestazionePagina;
