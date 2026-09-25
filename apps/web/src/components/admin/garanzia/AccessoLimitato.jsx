import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { chiVedeLaSezione } from '@/lib/garanziaDemo';

// Quando la funzione attiva non vede il dettaglio (§13.5): la direzione vede
// solo aggregati, il DPO il registro e non i dati, le altre funzioni niente.
const TESTI = {
    aggregati: {
        titolo: 'Da qui vedi solo i numeri, senza nomi',
        testo: 'La direzione legge dati aggregati. Il caso singolo si apre su richiesta, con la stessa procedura di chiunque altro.',
    },
    registro: {
        titolo: 'Il DPO vede chi accede ai dati, non i dati',
        testo: 'Il suo lavoro è controllare chi apre cosa: se leggesse il merito, il controllore sarebbe dentro il perimetro che controlla.',
    },
};

const AccessoLimitato = ({ vista, sezione }) => {
    const t = TESTI[vista] || {
        titolo: 'Non è il lavoro della tua funzione',
        testo: `Questa sezione la vedono: ${chiVedeLaSezione(sezione)}. Per provarla, entra con l’account di uno di loro, o come admin.`,
    };
    return (
        <Card className="border-dashed">
            <CardContent className="py-8 flex flex-col items-center text-center gap-3">
                <span className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <EyeOff className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
                </span>
                <div className="space-y-1 max-w-md">
                    <p className="font-semibold text-foreground">{t.titolo}</p>
                    <p className="text-sm text-muted-foreground">{t.testo}</p>
                </div>
                {vista === 'aggregati' && (
                    <Link to="/dashboard/admin/riassicurazione" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                        Il rendiconto trimestrale <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                )}
            </CardContent>
        </Card>
    );
};

export default AccessoLimitato;
