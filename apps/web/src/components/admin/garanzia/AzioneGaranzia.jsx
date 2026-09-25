import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AzioneSeparata from '@/components/admin/AzioneSeparata';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { AZIONI_GARANZIA, verificaGaranzia } from '@/lib/garanziaDemo';

// ═════════════════════════════════════════════════════════════════════════════
// Il pulsante di un'azione della garanzia. Le azioni della matrice delle
// incompatibilità (disporre, autorizzare, proporre, approvare) passano sempre
// da AzioneSeparata; le altre spettano a una funzione precisa e, se l'operatore
// attivo non ce l'ha, il pulsante è spento e sotto c'è scritto a chi spettano.
// Per «disporre» c'è un passo in più: in O-13 dispone la tesoreria, in O-17 la
// funzione indennizzi.
// ═════════════════════════════════════════════════════════════════════════════

const AzioneGaranzia = ({ azione, record, onEsegui, children, disabled = false, variant, size = 'sm', className = '', allineamento = 'start' }) => {
    const { operatoreId } = useOperatoreAttivo();
    const a = AZIONI_GARANZIA[azione];
    const separata = (nome) => (
        <AzioneSeparata azione={nome} record={record} onEsegui={onEsegui} disabled={disabled} variant={variant} size={size} className={className} allineamento={allineamento}>
            {children}
        </AzioneSeparata>
    );

    if (!a) return separata(azione);
    const { consentito, motivo } = verificaGaranzia(azione, { operatoreId, record });
    if (consentito && a.separata) return separata(a.separata);

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

export default AzioneGaranzia;
