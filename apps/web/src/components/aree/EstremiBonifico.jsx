import React from 'react';
import { Copy, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { fmtEuro } from '@/data/catalogo';

// ═════════════════════════════════════════════════════════════════════════════
// DOVE FARE IL BONIFICO — gli estremi che l'admin mette in ogni prodotto (O-21),
// come li legge il cliente: intestatario, IBAN, banca, importo e causale. IBAN
// e causale si copiano con un tocco, perché sbagliarli vuol dire un bonifico
// che non si abbina.
//
//   <EstremiBonifico bonifico={prodotto.bonifico} importo={47} causale="CRIA Verifica Inquilino · Mario Rossi" />
// ═════════════════════════════════════════════════════════════════════════════

const copia = async (valore, cosa) => {
    try {
        await navigator.clipboard.writeText(cosa === 'IBAN' ? valore.replace(/\s/g, '') : valore);
        toast.success(`${cosa} copiato`);
    } catch {
        toast.error('Non riesco a copiare: selezionalo e copialo a mano');
    }
};

const Riga = ({ etichetta, children, daCopiare }) => (
    <div className="flex items-start justify-between gap-3 py-2">
        <dt className="text-xs text-muted-foreground pt-0.5 flex-shrink-0">{etichetta}</dt>
        <dd className="flex min-w-0 items-start gap-1.5 text-right text-sm font-medium text-foreground">
            <span className="break-words min-w-0">{children}</span>
            {daCopiare && (
                <button type="button" onClick={() => copia(daCopiare, etichetta)} aria-label={`Copia ${etichetta}`} title={`Copia ${etichetta}`}
                    className="flex-shrink-0 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Copy className="w-3.5 h-3.5" />
                </button>
            )}
        </dd>
    </div>
);

const EstremiBonifico = ({ bonifico, importo, causale, titolo = 'Fai il bonifico a', className = '' }) => (
    <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground"><Landmark className="w-4 h-4" /> {titolo}</p>
        <dl className="mt-1 divide-y divide-border">
            <Riga etichetta="Intestatario">{bonifico.intestatario}</Riga>
            <Riga etichetta="IBAN" daCopiare={bonifico.iban}><span className="font-mono">{bonifico.iban}</span></Riga>
            {bonifico.banca && <Riga etichetta="Banca">{bonifico.banca}</Riga>}
            {bonifico.bic && <Riga etichetta="BIC"><span className="font-mono">{bonifico.bic}</span></Riga>}
            {importo != null && <Riga etichetta="Importo">{fmtEuro(importo, 2)}</Riga>}
            {causale && <Riga etichetta="Causale" daCopiare={causale}>{causale}</Riga>}
        </dl>
        {bonifico.istruzioni && <p className="mt-2 text-xs text-muted-foreground whitespace-pre-line">{bonifico.istruzioni}</p>}
    </div>
);

export default EstremiBonifico;
