import React, { useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ═════════════════════════════════════════════════════════════════════════════
// La «i»: una spiegazione che non occupa la pagina.
// Si apre passandoci sopra col mouse e si richiude uscendo; sul telefono, dove
// il mouse non c'è, si apre e si chiude toccandola. Passare dalla «i» al
// riquadro non lo chiude, così il testo si può leggere con calma.
//
//   <InfoSpiegazione etichetta="Come si contano i termini">
//       <p>…</p>
//   </InfoSpiegazione>
// ═════════════════════════════════════════════════════════════════════════════

const RITARDO_CHIUSURA = 150;

const InfoSpiegazione = ({ etichetta, children, className = '', lato = 'bottom', allinea = 'end', larga = false }) => {
    const [aperta, setAperta] = useState(false);
    const chiusura = useRef(null);

    const apri = () => {
        clearTimeout(chiusura.current);
        setAperta(true);
    };
    const chiudiTraPoco = () => {
        clearTimeout(chiusura.current);
        chiusura.current = setTimeout(() => setAperta(false), RITARDO_CHIUSURA);
    };

    return (
        <Popover open={aperta} onOpenChange={setAperta}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label={etichetta}
                    title={etichetta}
                    onMouseEnter={apri}
                    onMouseLeave={chiudiTraPoco}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${className}`}
                >
                    <Info className="w-4 h-4" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                side={lato}
                align={allinea}
                onMouseEnter={apri}
                onMouseLeave={chiudiTraPoco}
                className={`${larga ? 'w-[40rem] max-h-[70vh] overflow-y-auto' : 'w-80'} max-w-[calc(100vw-2rem)] space-y-2 text-sm text-muted-foreground`}
            >
                {children}
            </PopoverContent>
        </Popover>
    );
};

export default InfoSpiegazione;
