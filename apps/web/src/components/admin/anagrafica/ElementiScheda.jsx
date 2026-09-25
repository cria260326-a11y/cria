import React from 'react';
import { Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { etichettaCalendario } from '@/lib/calendario';
import { fmtData } from '@/lib/formato';

// Pezzi piccoli comuni alle schermate dell'anagrafica (O-02 … O-06).

export const Voce = ({ etichetta, children, className = '' }) => (
    <div className={`min-w-0 ${className}`}>
        <p className="text-xs text-muted-foreground mb-0.5">{etichetta}</p>
        <div className="font-medium text-foreground break-words">{children ?? '—'}</div>
    </div>
);

// aCapo: per le etichette lunghe (il nome di un prodotto) in colonne strette.
export const Chip = ({ classe = 'bg-muted text-muted-foreground', aCapo = false, children, className = '' }) => (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium ${aCapo ? 'rounded-lg' : 'rounded-full whitespace-nowrap'} ${classe} ${className}`}>{children}</span>
);

// Un termine nel suo calendario: lavorativi per il lavoro interno, solari verso il cliente.
export const Termine = ({ termine, etichetta = 'Entro il' }) => {
    if (!termine) return null;
    const { scade, mancano, calendario } = termine;
    const unita = etichettaCalendario(calendario, Math.abs(mancano));
    const resto = mancano > 0 ? `mancano ${mancano} ${unita}` : mancano === 0 ? 'scade oggi' : `scaduto da ${-mancano} ${unita}`;
    const colore = mancano < 0 ? 'text-red-700 font-medium' : mancano === 0 ? 'text-amber-800 font-medium' : 'text-muted-foreground';
    return <span className={`text-xs ${colore}`}>{etichetta} {fmtData(scade)} · {resto}</span>;
};

// Quello che vede chi non deve leggere le anagrafiche (§13.5).
export const VistaRistretta = ({ livello }) => (
    <Card className="border-dashed">
        <CardContent className="py-10 px-6 text-center space-y-2">
            <Lock className="w-8 h-8 mx-auto text-muted-foreground/60" />
            {livello === 'registro' ? (
                <>
                    <p className="font-medium text-foreground">Il DPO vede il registro degli accessi, non i dati</p>
                    <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                        Il suo lavoro è controllare chi apre cosa. Se leggesse le anagrafiche, il controllore starebbe dentro il perimetro che controlla.
                    </p>
                </>
            ) : (
                <>
                    <p className="font-medium text-foreground">Con la tua funzione vedi solo dati aggregati, senza nomi</p>
                    <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                        Il caso singolo si apre su richiesta, con la stessa procedura di chiunque altro.
                    </p>
                </>
            )}
        </CardContent>
    </Card>
);
