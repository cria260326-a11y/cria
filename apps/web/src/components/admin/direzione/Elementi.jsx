import React from 'react';
import { EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COLORE_PRODOTTO, nomeProdotto } from '@/data/catalogo';
import { FUNZIONI, nomeOperatore } from '@/data/operatori';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';

// Pezzi piccoli comuni a vendite, contabilità, indicatori e profilo (O-25, O-27, O-30, O-32).

// I prodotti che il catalogo non colora, perché non stanno su un contratto.
const ALTRI_COLORI = {
    P3: 'bg-amber-100 text-amber-800',
    P6: 'bg-teal-100 text-teal-800',
    P7: 'bg-emerald-100 text-emerald-800',
};

export const ChipProdotto = ({ codice, conNome = false }) => (
    <span title={nomeProdotto(codice)}
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${COLORE_PRODOTTO[codice] || ALTRI_COLORI[codice] || 'bg-muted text-muted-foreground'}`}>
        {conNome ? nomeProdotto(codice) : codice}
    </span>
);

export const Chip = ({ classe = 'bg-muted text-muted-foreground', children }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${classe}`}>{children}</span>
);

// Una card con titolo, riga di spiegazione e azioni a destra.
export const Riquadro = ({ icona: Icona, titolo, sottotitolo, azioni, children, className = '', contenuto = '' }) => (
    <Card className={className}>
        <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <CardTitle className="flex items-center gap-2 text-base">
                        {Icona && <Icona className="w-5 h-5 flex-shrink-0" />} {titolo}
                    </CardTitle>
                    {sottotitolo && <p className="text-xs text-muted-foreground mt-1">{sottotitolo}</p>}
                </div>
                {azioni && <div className="flex-shrink-0">{azioni}</div>}
            </div>
        </CardHeader>
        <CardContent className={contenuto}>{children}</CardContent>
    </Card>
);

// Etichetta sopra, valore sotto.
export const Voce = ({ etichetta, children, className = '' }) => (
    <div className={`min-w-0 ${className}`}>
        <p className="text-xs text-muted-foreground mb-0.5">{etichetta}</p>
        <div className="font-medium text-foreground break-words">{children ?? '—'}</div>
    </div>
);

// Il numero grande di un indicatore, con cosa conta e su quanti casi.
export const Cifra = ({ valore, unita, nota }) => (
    <div>
        <p className="text-3xl font-semibold text-foreground leading-none">
            {valore}{unita && <span className="ml-1 text-base font-normal text-muted-foreground">{unita}</span>}
        </p>
        {nota && <p className="mt-2 text-xs text-muted-foreground">{nota}</p>}
    </div>
);

// ─── Chi vede i nomi (§13.5) ──────────────────────────────────────────────────
// Il ruolo dice che tipo di dati si vedono. Qui i nomi dei clienti li vede chi
// ci lavora sopra; la direzione e le altre funzioni leggono gli aggregati.
// La matrice vera arriva col lotto 6.
export const useVistaPerFunzione = (funzioniConNomi) => {
    const { operatore } = useOperatoreAttivo();
    return { operatore, vedeNomi: operatore.funzione === 'admin' || funzioniConNomi.includes(operatore.funzione) };
};

const elenco = (voci) => (voci.length <= 1 ? voci.join('') : `${voci.slice(0, -1).join(', ')} e ${voci[voci.length - 1]}`);

export const AvvisoSoloAggregati = ({ operatore, funzioniConNomi, cosa = 'i singoli clienti' }) => (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
        <EyeOff className="w-5 h-5 flex-shrink-0 mt-0.5 text-muted-foreground" />
        <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Stai operando come {nomeOperatore(operatore.id)} · {FUNZIONI[operatore.funzione].etichetta}: vedi solo aggregati, senza nomi.</span>{' '}
            {operatore.funzione === 'direzione'
                ? 'Alla direzione il caso singolo non serve: se serve, lo apre su richiesta, come chiunque.'
                : `Alla tua funzione ${cosa} non servono.`}{' '}
            Il dettaglio lo vedono {elenco(funzioniConNomi.map(f => FUNZIONI[f].etichetta.toLowerCase()))}.
        </p>
    </div>
);
