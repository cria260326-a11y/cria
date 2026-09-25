import React from 'react';
import { CreditCard, Landmark, Repeat } from 'lucide-react';
import EstremiBonifico from '@/components/aree/EstremiBonifico';
import { bonificoPronto } from '@/lib/prodottiDemo';

// ═════════════════════════════════════════════════════════════════════════════
// COME PAGA IL CLIENTE — carta, addebito SEPA o bonifico, uguale in onboarding,
// checkout e verifica. Con il bonifico compaiono sotto gli estremi che l'admin
// ha messo nel prodotto (O-21); finché il prodotto non ha IBAN e intestatario,
// il bonifico non si può scegliere.
//
//   <MetodiPagamento metodi={['carta', 'bonifico']} valore={metodo} onScegli={setMetodo}
//       prodotto={prodotto} importo={47} causale="CRIA Verifica Inquilino · Mario Rossi"
//       notaBonifico="La richiesta parte quando il bonifico arriva" />
// ═════════════════════════════════════════════════════════════════════════════

const METODI = {
    carta: { etichetta: 'Carta di credito o debito', icona: CreditCard },
    sepa: { etichetta: 'Addebito diretto SEPA', icona: Repeat },
    bonifico: { etichetta: 'Bonifico bancario', icona: Landmark },
};

const COLONNE = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' };

const MetodiPagamento = ({ metodi, valore, onScegli, prodotto, importo, causale, notaBonifico, disabled = false, id = 'titolo-metodo' }) => {
    const bonificoOk = bonificoPronto(prodotto);
    return (
        <div className="space-y-3">
            <p id={id} className="text-sm font-medium text-foreground">Come paghi</p>
            <div className={`grid grid-cols-1 ${COLONNE[metodi.length] || 'sm:grid-cols-3'} gap-2`} role="group" aria-labelledby={id}>
                {metodi.map(m => {
                    const { etichetta, icona: Icona } = METODI[m];
                    const spento = disabled || (m === 'bonifico' && !bonificoOk);
                    const nota = m === 'bonifico' ? (bonificoOk ? notaBonifico : 'Non ancora disponibile') : null;
                    return (
                        <button
                            key={m}
                            type="button"
                            aria-pressed={valore === m}
                            disabled={spento}
                            onClick={() => onScegli(m)}
                            className={`text-left p-3 rounded-lg border-2 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed ${valore === m ? 'border-[#1A2D52] bg-[#1A2D52]/5 text-[#1A2D52] font-medium' : 'border-[#E5E5DE] text-muted-foreground hover:border-[#1A2D52]/40'}`}
                        >
                            <Icona className="w-4 h-4 mb-1" />{etichetta}
                            {nota && <span className="block text-xs font-normal text-muted-foreground mt-0.5">{nota}</span>}
                        </button>
                    );
                })}
            </div>
            {valore === 'bonifico' && bonificoOk && (
                <EstremiBonifico bonifico={prodotto.bonifico} importo={importo} causale={causale} />
            )}
        </div>
    );
};

export default MetodiPagamento;
