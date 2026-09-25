import React, { useMemo, useState } from 'react';
import { Search, Mail, ChevronRight, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatoInvio from '@/components/admin/comunicazioni/StatoInvio';
import { MODELLI_EMAIL, STATI_INVIO, STATI_EMAIL } from '@/data/comunicazioni';
import { nomeOperatore } from '@/data/operatori';
import { fmtData, nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// O-23 — il registro degli invii: modello, destinatario, stato, data. Si cerca
// per nome, indirizzo o oggetto; il dettaglio mostra il testo come è partito.
// ═════════════════════════════════════════════════════════════════════════════

const PASSO = 25;
const selettore = 'text-sm border border-border rounded-lg px-3 py-2 bg-background max-w-full';

// '2026-09-11 18:42' → '11/09/2026 · 18:42'
export const dataOra = (il) => (il.length > 10 ? `${fmtData(il.slice(0, 10))} · ${il.slice(11, 16)}` : fmtData(il));

const DettaglioEmail = ({ email: e, onClose }) => (
    <Dialog open onOpenChange={(aperto) => { if (!aperto) onClose(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="leading-snug pr-6">{e.oggetto}</DialogTitle>
                <DialogDescription className="break-words">A {e.destinatario.nome}, {e.destinatario.email} · {e.destinatario.ruolo}</DialogDescription>
            </DialogHeader>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div><dt className="text-xs text-muted-foreground">Modello</dt><dd className="font-medium text-foreground">{MODELLI_EMAIL[e.modello]?.nome || e.modello}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Stato</dt><dd><StatoInvio stato={e.stato} canale="email" /></dd></div>
                <div><dt className="text-xs text-muted-foreground">Data</dt><dd className="text-foreground">{dataOra(e.il)}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Mandata da</dt><dd className="text-foreground">{e.inviataDa ? nomeOperatore(e.inviataDa) : 'La piattaforma'}</dd></div>
                <div className="col-span-2"><dt className="text-xs text-muted-foreground">Riguarda</dt><dd className="text-foreground">{e.contesto}</dd></div>
            </dl>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-foreground whitespace-pre-line">{e.testo}</div>
            {MODELLI_EMAIL[e.modello]?.nota && (
                <p className="flex items-start gap-2 text-xs text-muted-foreground"><ShieldCheck className="w-4 h-4 flex-shrink-0" /> {MODELLI_EMAIL[e.modello].nota}.</p>
            )}
            <p className="text-xs text-muted-foreground">In piattaforma qui ci saranno l’identificativo del messaggio di Postmark e la storia di consegna, apertura o rimbalzo.</p>
        </DialogContent>
    </Dialog>
);

const RegistroEmail = ({ registro }) => {
    const [cerca, setCerca] = useState('');
    const [stato, setStato] = useState('');
    const [modello, setModello] = useState('');
    const [mese, setMese] = useState('');
    const [quante, setQuante] = useState(PASSO);
    const [apertaId, setApertaId] = useState(null);
    // Si cerca per id: lo stato di un'email appena mandata cambia mentre la si guarda.
    const aperta = registro.find(e => e.id === apertaId) || null;

    const mesi = useMemo(() => [...new Set(registro.map(e => e.il.slice(0, 7)))].sort().reverse(), [registro]);
    const modelli = useMemo(() => [...new Set(registro.map(e => e.modello))], [registro]);

    const filtrate = useMemo(() => {
        const q = cerca.trim().toLowerCase();
        return registro.filter(e =>
            (!q || `${e.destinatario.nome} ${e.destinatario.email} ${e.oggetto}`.toLowerCase().includes(q))
            && (!stato || e.stato === stato)
            && (!modello || e.modello === modello)
            && (!mese || e.il.startsWith(mese)));
    }, [registro, cerca, stato, modello, mese]);

    const filtri = cerca || stato || modello || mese;
    const azzera = () => { setCerca(''); setStato(''); setModello(''); setMese(''); setQuante(PASSO); };

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="pt-4 pb-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                        <Input value={cerca} onChange={e => { setCerca(e.target.value); setQuante(PASSO); }} placeholder="Cerca per nome, indirizzo o oggetto" className="pl-9" aria-label="Cerca nel registro" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select aria-label="Stato" value={stato} onChange={e => setStato(e.target.value)} className={selettore}>
                            <option value="">Tutti gli stati</option>
                            {STATI_EMAIL.map(s => <option key={s} value={s}>{STATI_INVIO[s].f}</option>)}
                        </select>
                        <select aria-label="Modello" value={modello} onChange={e => setModello(e.target.value)} className={selettore}>
                            <option value="">Tutti i modelli</option>
                            {modelli.map(m => <option key={m} value={m}>{MODELLI_EMAIL[m]?.nome || m}</option>)}
                        </select>
                        <select aria-label="Mese" value={mese} onChange={e => setMese(e.target.value)} className={selettore}>
                            <option value="">Tutti i mesi</option>
                            {mesi.map(m => <option key={m} value={m}>{nomeMese(m)}</option>)}
                        </select>
                        {filtri && <Button variant="ghost" size="sm" onClick={azzera}>Togli i filtri</Button>}
                    </div>
                </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">{filtrate.length} email{filtri ? ' con questi filtri' : ''}, le più recenti prima</p>

            {filtrate.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center space-y-2">
                        <Mail className="w-8 h-8 mx-auto text-muted-foreground/50" aria-hidden="true" />
                        <p className="text-sm text-muted-foreground">Nessuna email con questi filtri.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <ul className="divide-y divide-border">
                            {filtrate.slice(0, quante).map(e => (
                                <li key={e.id}>
                                    <button
                                        type="button"
                                        onClick={() => setApertaId(e.id)}
                                        className="w-full text-left p-4 grid gap-2 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] md:items-center hover:bg-muted/40 focus-visible:outline-none focus-visible:bg-muted/40"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium text-foreground truncate">{e.oggetto}</p>
                                            <p className="text-xs text-muted-foreground truncate">{e.destinatario.nome} · {e.destinatario.email}</p>
                                        </div>
                                        <div className="min-w-0 text-xs text-muted-foreground">
                                            <p className="truncate">{MODELLI_EMAIL[e.modello]?.nome || e.modello}</p>
                                            <p className="truncate">{e.inviataDa ? `Da ${nomeOperatore(e.inviataDa)}` : 'Automatica'} · {e.contesto}</p>
                                        </div>
                                        <div className="flex items-center gap-2 md:justify-end">
                                            <StatoInvio stato={e.stato} canale="email" />
                                            <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">{dataOra(e.il)}</span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto md:ml-0" aria-hidden="true" />
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {filtrate.length > quante && (
                <div className="flex justify-center">
                    <Button variant="outline" size="sm" onClick={() => setQuante(n => n + PASSO)}>Mostra altre {Math.min(PASSO, filtrate.length - quante)}</Button>
                </div>
            )}

            {aperta && <DettaglioEmail email={aperta} onClose={() => setApertaId(null)} />}
        </div>
    );
};

export default RegistroEmail;
