import React from 'react';
import { Check } from 'lucide-react';
import { FASI_PRATICA } from '@/data/pratiche';

// Le cinque fasi della pratica, con quella in corso evidenziata. Una pratica
// non approvata si ferma alla verifica di CRIA, segnata in rosso.
export const indiceFase = (stato) => FASI_PRATICA.findIndex(f => f.id === stato);

const FasiPratica = ({ stato, compatto = false }) => {
    const respinta = stato === 'respinta';
    const attuale = indiceFase(respinta ? 'istruttoria' : stato);
    if (compatto) {
        return (
            <div className="flex items-center gap-1" title={FASI_PRATICA[attuale]?.etichetta}>
                {FASI_PRATICA.map((f, i) => (
                    <span key={f.id} className={`h-1.5 flex-1 rounded-full ${i < attuale || stato === 'attiva' ? 'bg-green-500' : i === attuale ? (respinta ? 'bg-red-500' : 'bg-[#1A2D52]') : 'bg-muted'}`} />
                ))}
            </div>
        );
    }
    return (
        <ol className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {FASI_PRATICA.map((f, i) => {
                const fatta = i < attuale || stato === 'attiva';
                const ora = i === attuale && stato !== 'attiva';
                return (
                    <li key={f.id} className={`rounded-xl border p-3 ${ora ? (respinta ? 'border-red-300 bg-red-50' : 'border-[#1A2D52] bg-[#1A2D52]/5') : 'border-border'}`}>
                        <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${fatta ? 'bg-green-500 text-white' : ora ? (respinta ? 'bg-red-600 text-white' : 'bg-[#1A2D52] text-white') : 'bg-muted text-muted-foreground'}`}>
                                {fatta ? <Check className="w-3.5 h-3.5" /> : i + 1}
                            </span>
                            <span className={`text-sm font-medium ${ora || fatta ? 'text-foreground' : 'text-muted-foreground'}`}>{f.etichetta}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{ora && respinta ? 'CRIA non ha approvato il candidato' : f.descrizione}</p>
                    </li>
                );
            })}
        </ol>
    );
};

export default FasiPratica;
