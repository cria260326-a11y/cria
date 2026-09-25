import React from 'react';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotaMockup from '@/components/NotaMockup';
import { ripristinaGaranziaDemo } from '@/lib/garanziaDemo';

// Il riquadro «Solo nei mockup» delle schermate della garanzia: le simulazioni
// della pagina, se ci sono, e il ripristino dello store.
const NotaGaranzia = ({ children }) => {
    const ripristina = () => {
        ripristinaGaranziaDemo();
        toast.success('Garanzia demo ripristinata');
    };
    return (
        <NotaMockup>
            <p>
                Contatti, piani, decisioni, disposizioni, autorizzazioni e rendiconti fatti in queste pagine restano in questo browser;
                le aree di proprietario e inquilino continuano a leggere i dati condivisi. Per provare chi dispone e chi autorizza,
                entra con due account diversi (per esempio alberto.longo@ e silvia.barbieri@cri-affitti.it).
            </p>
            {children && <div className="mt-3 flex flex-col items-start gap-2">{children}</div>}
            <Button size="sm" variant="outline" className="mt-3 gap-2 bg-white" onClick={ripristina}>
                <RotateCcw className="w-3.5 h-3.5" /> Ripristina la garanzia demo
            </Button>
        </NotaMockup>
    );
};

export default NotaGaranzia;
