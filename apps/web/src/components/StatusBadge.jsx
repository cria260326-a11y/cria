import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SEMAFORO } from '@/lib/semaforo';

// Il bollino del semaforo. Etichette e colori vengono da lib/semaforo.js,
// l'unico posto in cui sono definiti.
const StatusBadge = ({ status, className = '' }) => {
    const voce = SEMAFORO[status];
    if (!voce) return <Badge className={`bg-muted text-muted-foreground ${className}`}>—</Badge>;
    return <Badge className={`${voce.pieno} ${className}`} title={voce.spiegazione}>{voce.etichetta}</Badge>;
};

export default StatusBadge;
