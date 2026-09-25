import React from 'react';
import { Bell, Mail, Smartphone } from 'lucide-react';
import { CANALI, STATI_INVIO, etichettaStatoInvio } from '@/data/comunicazioni';

// Lo stato di un invio, e il canale quando serve dirlo. L'SMS è maschile.
export const ICONA_CANALE = { notifica: Bell, email: Mail, sms: Smartphone };

const StatoInvio = ({ stato, canale, conCanale = false, title }) => {
    const Icona = ICONA_CANALE[canale];
    return (
        <span
            title={title}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${STATI_INVIO[stato]?.classe || 'bg-gray-100 text-gray-700'}`}
        >
            {conCanale && Icona && <Icona className="w-3 h-3" aria-hidden="true" />}
            {conCanale && <span>{CANALI[canale].etichetta}:</span>}
            {etichettaStatoInvio(stato, canale)}
        </span>
    );
};

export default StatoInvio;
