import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verificaAzione } from '@/lib/separazione';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';

// ═════════════════════════════════════════════════════════════════════════════
// Un pulsante per un'azione sensibile (§13.4). Se l'operatore attivo non può
// farla — funzione sbagliata, o è la stessa persona che ha disposto/proposto —
// il pulsante è spento e sotto c'è scritto perché e a chi spetta.
//
//   <AzioneSeparata azione="autorizza_pagamento" record={{ dispostoDa }} onEsegui={autorizza}>
//       Autorizza
//   </AzioneSeparata>
// ═════════════════════════════════════════════════════════════════════════════

const AzioneSeparata = ({ azione, record, onEsegui, children, disabled = false, variant, size = 'sm', className = '', allineamento = 'start' }) => {
    const { operatoreId } = useOperatoreAttivo();
    const { consentito, motivo } = verificaAzione(azione, { operatoreId, record });

    return (
        <div className={`flex flex-col gap-1.5 ${allineamento === 'end' ? 'items-end text-right' : 'items-start'}`}>
            <Button type="button" size={size} variant={variant} className={className} disabled={disabled || !consentito} onClick={onEsegui}>
                {!consentito && <Lock className="w-3.5 h-3.5 mr-1.5" />}
                {children}
            </Button>
            {!consentito && <p className="text-xs text-amber-800 max-w-sm">{motivo}</p>}
        </div>
    );
};

export default AzioneSeparata;
