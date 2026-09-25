import React from 'react';
import { Paperclip } from 'lucide-react';

// ═════════════════════════════════════════════════════════════════════════════
// UN MESSAGGIO DI UNA CONVERSAZIONE — uguale in tutte le aree e per tutti i
// ruoli: quello che scrivo io sta a destra, quello che ricevo a sinistra, con
// il nome di chi l'ha scritto. I messaggi di sistema («contestazione aperta»)
// non sono di nessuno: stanno al centro, piccoli.
//
//   <Messaggio mio={m.mittente === 'tu'} autore="Giulia · CRIA" quando="03/05/2026 14:15">
//       …
//   </Messaggio>
// ═════════════════════════════════════════════════════════════════════════════

export const Messaggio = ({ mio = false, autore, ruolo, quando, allegati = [], children }) => (
    <div className={`flex ${mio ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[85%] sm:max-w-[75%] min-w-0 rounded-2xl px-3.5 py-2.5 ${mio ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-muted text-foreground'}`}>
            {!mio && autore && (
                <p className="text-xs font-semibold mb-0.5">
                    {autore}
                    {ruolo && <span className="font-normal text-muted-foreground"> · {ruolo}</span>}
                </p>
            )}
            <p className="text-sm whitespace-pre-wrap break-words">{children}</p>
            {allegati.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {allegati.map((a, i) => (
                        <span key={i} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${mio ? 'bg-primary-foreground/15' : 'bg-background border border-border'}`}>
                            <Paperclip className="w-3 h-3" /> {a}
                        </span>
                    ))}
                </div>
            )}
            {quando && (
                <p className={`text-[11px] mt-1 text-right ${mio ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{quando}</p>
            )}
        </div>
    </div>
);

export const MessaggioDiSistema = ({ children }) => (
    <p className="text-xs text-center text-muted-foreground italic py-1">{children}</p>
);

export default Messaggio;
