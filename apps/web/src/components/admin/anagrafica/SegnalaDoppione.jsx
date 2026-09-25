import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AzioneSeparata from '@/components/admin/AzioneSeparata';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { idCoppia, segnalaDoppione } from '@/lib/anagraficheDemo';
import { fmtData } from '@/lib/formato';

// Un operatore che si accorge di un doppione lo mette in coda, con il motivo.
// Non unisce niente: decide chi esamina la coppia (O-04).

const selectClasse = 'w-full text-sm border border-border rounded-lg px-3 py-2 bg-background';

const SegnalaDoppione = ({ modello, soggettoId = null, onFatto }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [a, setA] = useState(soggettoId || '');
    const [b, setB] = useState('');
    const [motivo, setMotivo] = useState('');

    const esistente = a && b && a !== b ? modello.coppie.find(c => c.id === idCoppia(a, b)) : null;
    const valido = a && b && a !== b && !esistente && motivo.trim().length >= 5;

    const invia = () => {
        segnalaDoppione({ a, b, motivo: motivo.trim() }, operatoreId);
        toast.success('Coppia messa in coda nella revisione delle anagrafiche');
        onFatto?.();
    };

    const opzioni = (escludi) => modello.attivi.filter(s => s.id !== escludi).map(s => (
        <option key={s.id} value={s.id}>{s.nomeCompleto} · {s.origineBreve}</option>
    ));

    return (
        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {!soggettoId && (
                    <div className="space-y-1.5">
                        <Label htmlFor="doppione-a">Prima anagrafica</Label>
                        <select id="doppione-a" value={a} onChange={e => setA(e.target.value)} className={selectClasse}>
                            <option value="">Scegli…</option>
                            {opzioni(b)}
                        </select>
                    </div>
                )}
                <div className="space-y-1.5">
                    <Label htmlFor="doppione-b">{soggettoId ? 'Potrebbe essere la stessa persona di' : 'Seconda anagrafica'}</Label>
                    <select id="doppione-b" value={b} onChange={e => setB(e.target.value)} className={selectClasse}>
                        <option value="">Scegli…</option>
                        {opzioni(a)}
                    </select>
                </div>
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="doppione-motivo">Perché pensi che sia un doppione</Label>
                <Textarea id="doppione-motivo" rows={2} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Per esempio: stessa persona al telefono, due recapiti diversi" />
            </div>
            {esistente && (
                <p className="text-xs text-amber-800">
                    {esistente.esito
                        ? `Questa coppia è già stata decisa il ${fmtData(esistente.esito.il)}.`
                        : 'Questa coppia è già in coda nella revisione.'}
                </p>
            )}
            <div className="flex flex-wrap items-start gap-2">
                <AzioneSeparata azione="segnala_doppione" onEsegui={invia} disabled={!valido}>Metti in coda</AzioneSeparata>
                {onFatto && <Button type="button" variant="ghost" size="sm" onClick={onFatto}>Annulla</Button>}
            </div>
        </div>
    );
};

export default SegnalaDoppione;
