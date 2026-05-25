import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare, Paperclip, Lock } from 'lucide-react';

// ─── Stili visivi messaggi per ruolo mittente ─────────────────────────────────
const MSG_STYLE = {
    sistema: 'bg-muted/60 text-muted-foreground italic text-xs text-center',
    admin: 'bg-primary/10 text-foreground',
    avvocato: 'bg-amber-50 text-foreground',
    locatore: 'bg-blue-50 text-foreground',
    inquilino: 'bg-green-50 text-foreground',
};

// ═════════════════════════════════════════════════════════════════════════════
// CHATTHREAD — Componente riusabile per chat tematiche
//
// Props:
// - messaggi: [{ id, mittente, testo, data, ruolo }]
//   ruolo: 'sistema' | 'admin' | 'avvocato' | 'locatore' | 'inquilino'
//
// - canScrivere: boolean — se false la chat è in sola lettura
//
// - onInvia: (testo) => void  — chiamata quando l'utente invia un messaggio
//
// - placeholder: string opzionale per il campo di scrittura
// - footerNote: string opzionale (es. "Il messaggio sarà inviato a 4 persone")
// - readOnlyNote: string opzionale (es. "Chat chiusa: contestazione risolta")
// - title: string opzionale per l'header (default "Comunicazioni")
// - icon: lucide icon opzionale per l'header
// - maxHeight: string opzionale per il container messaggi (default '24rem')
// ═════════════════════════════════════════════════════════════════════════════
const ChatThread = ({
    messaggi = [],
    canScrivere = true,
    onInvia,
    placeholder = 'Scrivi un messaggio...',
    footerNote = null,
    readOnlyNote = 'Chat in sola lettura',
    title = 'Comunicazioni',
    icon: Icon = MessageSquare,
    maxHeight = '24rem',
    showHeader = true,
}) => {
    const [testo, setTesto] = useState('');
    const scrollRef = useRef(null);

    // Auto-scroll al fondo quando arrivano nuovi messaggi
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messaggi.length]);

    const handleInvia = () => {
        if (!testo.trim() || !onInvia) return;
        onInvia(testo);
        setTesto('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleInvia();
        }
    };

    return (
        <div className="space-y-3">
            {showHeader && (
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    <span className="text-xs text-muted-foreground ml-auto">
                        {messaggi.length} {messaggi.length === 1 ? 'messaggio' : 'messaggi'}
                    </span>
                </div>
            )}

            {/* Lista messaggi */}
            <div
                ref={scrollRef}
                className="space-y-2 overflow-y-auto pr-1 border border-border rounded-lg p-3 bg-background"
                style={{ maxHeight }}
            >
                {messaggi.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-6">
                        Nessun messaggio in questo canale.
                    </p>
                ) : (
                    messaggi.map(m => (
                        <div key={m.id} className={`p-2.5 rounded-lg text-sm ${MSG_STYLE[m.ruolo] || 'bg-muted'}`}>
                            {m.ruolo !== 'sistema' && (
                                <div className="flex items-center justify-between mb-1 gap-2">
                                    <span className="font-semibold text-xs">{m.mittente}</span>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{m.data}</span>
                                </div>
                            )}
                            <p className={m.ruolo === 'sistema' ? '' : 'text-foreground'}>{m.testo}</p>
                            {m.allegati && m.allegati.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {m.allegati.map((a, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-white/60 rounded border border-border">
                                            <Paperclip className="w-3 h-3" />
                                            {a}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Form scrittura o nota read-only */}
            {canScrivere ? (
                <div className="space-y-2">
                    {footerNote && (
                        <p className="text-xs text-muted-foreground">{footerNote}</p>
                    )}
                    <div className="flex gap-2">
                        <textarea
                            value={testo}
                            onChange={e => setTesto(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            rows={2}
                            className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <Button onClick={handleInvia} disabled={!testo.trim()} className="gap-2 self-end">
                            <Send className="w-4 h-4" /> Invia
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2 p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                    <Lock className="w-3.5 h-3.5" />
                    {readOnlyNote}
                </div>
            )}
        </div>
    );
};

export default ChatThread;