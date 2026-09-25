import React, { useState } from 'react';
import { toast } from 'sonner';
import { Lock, PenLine, ListChecks } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AzioneSeparata from '@/components/admin/AzioneSeparata';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { OGGI } from '@/data/datiDemo';
import { CAUSALI_PROROGA } from '@/data/scadenze';
import {
    concediProroga, concediProrogaFuoriLista, puoProrogareInLista, usiDellaCausale, anteprimaTermine,
    MINIMO_MOTIVAZIONE, MASSIMO_GIORNI_FUORI_LISTA,
} from '@/lib/scadenzeDemo';
import { etichettaCalendario } from '@/lib/calendario';
import { fmtData, nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// O-19 — PROROGHE, dentro le scadenze.
// In lista: una causale fissa, con la sua durata e il suo tetto, e nessun testo
// libero. Fuori lista: solo un responsabile, con la motivazione scritta, e la
// proroga finisce nel cruscotto del mese con il suo nome.
// ═════════════════════════════════════════════════════════════════════════════

const MESE = nomeMese(OGGI.slice(0, 7)).toLowerCase();

const volte = (n) => (n === 1 ? 'una volta' : `${n} volte`);

const DialogProroga = ({ fase, onClose }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [causale, setCausale] = useState(null);
    const [giorni, setGiorni] = useState('');
    const [motivazione, setMotivazione] = useState('');

    if (!fase) return null;

    const unita = (n) => etichettaCalendario(fase.conteggio, n);
    const permessoLista = puoProrogareInLista(operatoreId, fase);
    const scelta = causale ? CAUSALI_PROROGA[causale] : null;
    const nGiorni = Number(giorni);
    const giorniValidi = Number.isInteger(nGiorni) && nGiorni >= 1 && nGiorni <= MASSIMO_GIORNI_FUORI_LISTA;
    const testo = motivazione.trim();

    const concedi = () => {
        const r = concediProroga(fase, causale, operatoreId);
        if (!r.ok) { toast.error(r.errore); return; }
        toast.success(scelta.sospende ? 'Termine fermo finché il contenzioso è aperto' : `Prorogata: nuovo termine ${fmtData(anteprimaTermine(fase, scelta.giorni))}`);
        onClose();
    };

    const concediFuoriLista = () => {
        const r = concediProrogaFuoriLista(fase, { giorni: nGiorni, motivazione: testo }, operatoreId);
        if (!r.ok) { toast.error(r.errore); return; }
        toast.success(`Proroga fuori lista concessa: compare nel cruscotto di ${MESE}`);
        onClose();
    };

    return (
        <Dialog open onOpenChange={(aperto) => { if (!aperto) onClose(); }}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Proroga · {fase.titolo}</DialogTitle>
                    <DialogDescription>
                        {fase.oggetto}. Termine attuale {fmtData(fase.termine)}, in {fase.conteggio === 'lavorativi' ? 'giorni lavorativi' : 'giorni solari'}.
                    </DialogDescription>
                </DialogHeader>

                {fase.proroga === 'lista' && (
                    <section className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><ListChecks className="w-4 h-4" /> Causali in lista</h3>
                        <p className="text-xs text-muted-foreground">Ogni causale ha una durata fissa e un tetto. Non si scrive niente: la causale basta.</p>
                        <div role="radiogroup" aria-label="Causale della proroga" className="space-y-2">
                            {fase.causali.map(k => {
                                const c = CAUSALI_PROROGA[k];
                                const usi = usiDellaCausale(fase, k);
                                const esaurita = usi >= c.tetto;
                                return (
                                    <label
                                        key={k}
                                        className={`flex items-start gap-3 rounded-lg border p-3 ${causale === k ? 'border-primary bg-primary/5' : 'border-border'} ${esaurita ? 'opacity-60' : 'cursor-pointer hover:bg-muted/40'}`}
                                    >
                                        <input type="radio" name="causale" value={k} disabled={esaurita} checked={causale === k} onChange={() => setCausale(k)} className="mt-1" />
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-foreground">{c.etichetta}</span>
                                            <span className="block text-xs text-muted-foreground">
                                                {c.sospende ? 'Ferma il termine finché dura' : `+${c.giorni} ${unita(c.giorni)}`} · al massimo {volte(c.tetto)} · usata {usi} di {c.tetto}
                                            </span>
                                            {esaurita && <span className="block text-xs text-amber-800">Tetto raggiunto: ora proroga solo un responsabile, fuori lista.</span>}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        {scelta && (
                            <p className="text-sm text-foreground">
                                {scelta.sospende
                                    ? 'Da oggi il termine si ferma. Quando il contenzioso si chiude riparte, con i giorni di sospensione in più.'
                                    : <>Nuovo termine: <span className="font-semibold">{fmtData(anteprimaTermine(fase, scelta.giorni))}</span></>}
                            </p>
                        )}
                        <div className="flex flex-col items-start gap-1.5">
                            <Button type="button" size="sm" disabled={!scelta || !permessoLista.consentito} onClick={concedi}>
                                {!permessoLista.consentito && <Lock className="w-3.5 h-3.5 mr-1.5" />}
                                Concedi la proroga
                            </Button>
                            {!permessoLista.consentito && <p className="text-xs text-amber-800 max-w-sm">{permessoLista.motivo}</p>}
                        </div>
                    </section>
                )}

                <section className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><PenLine className="w-4 h-4" /> Fuori lista</h3>
                    <p className="text-xs text-muted-foreground">
                        {fase.proroga === 'solo_fuori_lista' ? 'Per questa fase non ci sono causali in lista. ' : ''}
                        La concede solo un responsabile, per iscritto, e compare nel cruscotto di {MESE} con il suo nome.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-[8rem_1fr] sm:items-end">
                        <div className="space-y-1.5">
                            <Label htmlFor="giorni-proroga">Giorni</Label>
                            <Input id="giorni-proroga" inputMode="numeric" value={giorni} onChange={e => setGiorni(e.target.value.replace(/\D/g, ''))} placeholder="Es. 3" />
                        </div>
                        <p className="text-xs text-muted-foreground pb-2">
                            {giorniValidi
                                ? <>Nuovo termine: <span className="font-semibold text-foreground">{fmtData(anteprimaTermine(fase, nGiorni))}</span> ({nGiorni} {unita(nGiorni)})</>
                                : `Da 1 a ${MASSIMO_GIORNI_FUORI_LISTA} ${unita(2)}`}
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="motivazione-proroga">Motivazione scritta</Label>
                        <Textarea
                            id="motivazione-proroga"
                            rows={3}
                            value={motivazione}
                            onChange={e => setMotivazione(e.target.value)}
                            placeholder="Perché nessuna causale in lista basta, e perché questi giorni"
                            className="bg-white"
                        />
                        <p className={`text-xs ${testo.length >= MINIMO_MOTIVAZIONE ? 'text-muted-foreground' : 'text-amber-800'}`}>
                            {testo.length} caratteri, ne servono almeno {MINIMO_MOTIVAZIONE}
                        </p>
                    </div>
                    <AzioneSeparata azione="proroga_fuori_lista" onEsegui={concediFuoriLista} disabled={!giorniValidi || testo.length < MINIMO_MOTIVAZIONE}>
                        Concedi fuori lista
                    </AzioneSeparata>
                </section>
            </DialogContent>
        </Dialog>
    );
};

export default DialogProroga;
