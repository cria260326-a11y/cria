import React from 'react';

// Filtri a pillola: vanno a capo invece di allargare la pagina sul telefono.
//   voci [{ id, etichetta, conta? }]
const Schede = ({ voci, valore, onCambia, etichetta }) => (
    <div role="group" aria-label={etichetta} className="flex flex-wrap gap-2">
        {voci.map(v => {
            const attiva = v.id === valore;
            return (
                <button
                    key={v.id}
                    type="button"
                    aria-pressed={attiva}
                    onClick={() => onCambia(v.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${attiva
                        ? 'border-[#1A2D52] bg-[#1A2D52] text-white'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                    {v.etichetta}
                    {v.conta != null && <span className={`tabular-nums text-xs ${attiva ? 'text-white/80' : ''}`}>{v.conta}</span>}
                </button>
            );
        })}
    </div>
);

export default Schede;
