import React from 'react';
import { Clock } from 'lucide-react';
import { ilGiorno } from '@/lib/garanziaDemo';
import { quantoManca } from './stati';

// Un termine con quanto manca, nel suo calendario: rosso se è passato, ambra
// se scade entro un giorno.
const Termine = ({ termine, mancano, calendario, prefisso = 'Entro' }) => {
    if (!termine) return null;
    const colore = mancano == null ? 'text-muted-foreground'
        : mancano < 0 ? 'text-red-700 font-medium'
            : mancano <= 1 ? 'text-amber-800 font-medium' : 'text-muted-foreground';
    return (
        <span className={`inline-flex items-start gap-1 text-xs ${colore}`}>
            <Clock className="w-3.5 h-3.5 mt-px flex-shrink-0" aria-hidden="true" />
            <span>{prefisso} {ilGiorno(termine)}{mancano != null ? ` · ${quantoManca(mancano, calendario)}` : ''}</span>
        </span>
    );
};

export default Termine;
