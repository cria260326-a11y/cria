import React from 'react';
import { Info, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OGGI } from '@/data/datiDemo';
import { FUNZIONI, nomeOperatore } from '@/data/operatori';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { mancanoAlTermine, etichettaCalendario } from '@/lib/calendario';
import { fmtData, nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// Pezzi comuni alle schermate dell'istruttoria e del ciclo mensile (O-07 → O-12).
// ═════════════════════════════════════════════════════════════════════════════

export const Pill = ({ classe = 'bg-slate-100 text-slate-700', className = '', children }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${classe} ${className}`}>{children}</span>
);

export const Voce = ({ etichetta, children, className = '' }) => (
    <div className={`min-w-0 ${className}`}>
        <p className="text-xs text-muted-foreground mb-0.5">{etichetta}</p>
        <div className="text-sm font-medium text-foreground break-words">{children || '—'}</div>
    </div>
);

const elenco = (nomi) => (nomi.length <= 1 ? nomi.join('') : `${nomi.slice(0, -1).join(', ')} o ${nomi[nomi.length - 1]}`);

// Quanto manca a un termine, nel suo calendario: lavorativi dentro CRIA,
// solari verso il cliente.
export const statoTermine = ({ data, calendario }) => {
    const n = mancanoAlTermine(OGGI, data, calendario);
    if (n > 1) return { testo: `entro il ${fmtData(data)} · mancano ${n} ${etichettaCalendario(calendario, n)}`, tono: 'normale', n };
    if (n === 1) return { testo: `entro il ${fmtData(data)} · manca 1 ${etichettaCalendario(calendario, 1)}`, tono: 'vicino', n };
    if (n === 0) return { testo: `scade oggi, ${fmtData(data)}`, tono: 'vicino', n };
    return { testo: `scaduto il ${fmtData(data)}, da ${-n} ${etichettaCalendario(calendario, -n)}`, tono: 'scaduto', n };
};

const TONI_TERMINE = { normale: 'text-muted-foreground', vicino: 'text-amber-700 font-medium', scaduto: 'text-red-700 font-medium' };

export const Termine = ({ termine, className = '' }) => {
    if (!termine) return null;
    const t = statoTermine(termine);
    return <span className={`text-xs ${TONI_TERMINE[t.tono]} ${className}`}>{t.testo}</span>;
};

// Un pulsante per un'azione che spetta a una funzione ma non è nella matrice
// delle incompatibilità (per quelle c'è AzioneSeparata). Spento, dice perché.
export const PulsanteFunzione = ({
    funzioni, azione, onEsegui, children, disabled = false, motivoSpento = null,
    variant, size = 'sm', className = '', allineamento = 'start', type = 'button',
}) => {
    const { operatore } = useOperatoreAttivo();
    const consentito = operatore.funzione === 'admin' || funzioni.includes(operatore.funzione);
    const chi = elenco(funzioni.map(f => FUNZIONI[f].etichetta.toLowerCase()));
    const motivo = !consentito ? `${azione} spetta a: ${chi}.` : disabled ? motivoSpento : null;
    return (
        <div className={`flex flex-col gap-1.5 ${allineamento === 'end' ? 'items-end text-right' : 'items-start'}`}>
            <Button type={type} size={size} variant={variant} className={className} disabled={!consentito || disabled} onClick={onEsegui}>
                {!consentito && <Lock className="w-3.5 h-3.5 mr-1.5" />}
                {children}
            </Button>
            {motivo && <p className="text-xs text-amber-800 max-w-sm">{motivo}</p>}
        </div>
    );
};

// Per chi vede solo i numeri o il registro: perché il dettaglio non c'è.
export const AvvisoAccesso = ({ testo }) => (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">{testo}</p>
    </div>
);

// Contatore compatto, per le righe di numeri in cima alle pagine.
export const Numero = ({ etichetta, valore, nota, tono = 'normale' }) => {
    const colore = { normale: 'text-foreground', attenzione: 'text-amber-700', allarme: 'text-red-700', buono: 'text-green-700' }[tono];
    // Gli importi lunghi scendono di una misura, così restano su una riga anche sul telefono.
    const misura = String(valore).length > 7 ? 'text-lg sm:text-xl' : 'text-2xl';
    return (
        <Card>
            <CardContent className="pt-4 pb-4">
                <p className={`${misura} font-bold tabular-nums whitespace-nowrap ${colore}`}>{valore}</p>
                <p className="text-xs text-muted-foreground">{etichetta}</p>
                {nota && <p className="text-[11px] text-muted-foreground/80 mt-0.5">{nota}</p>}
            </CardContent>
        </Card>
    );
};

// «da febbraio 2025 ad agosto 2026»
export const periodoMesi = (dal, al) => {
    const fine = nomeMese(al).toLowerCase();
    return `da ${nomeMese(dal).toLowerCase()} ${/^[aeiou]/.test(fine) ? 'ad' : 'a'} ${fine}`;
};

// Traccia di un'azione: chi e quando, sempre visibile.
export const Firma = ({ da, il, prefisso = '' }) => (
    <span className="text-xs text-muted-foreground">{prefisso}{prefisso ? ' ' : ''}{nomeOperatore(da)} · {fmtData(il)}</span>
);
