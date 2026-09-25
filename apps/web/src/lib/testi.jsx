import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PREDEFINITI, SEGNAPOSTO } from '@/testi/catalogo';
import { accendiAnteprima, anteprimaAccesa, caricaBozze, caricaPubblicati, EVENTO_TESTI } from '@/lib/testiFonte';
import { useCatalogoProdotti } from '@/lib/prodottiDemo';

// ═════════════════════════════════════════════════════════════════════════════
// TESTI DEL SITO — quello che le pagine usano
//   const t = useT();
//   <h1><Ricco evidenza={...}>{t('home.hero.titolo')}</Ricco></h1>
//   <p>{t('verifica.hero.prezzo', { prezzo: fmtEuro(P3.prezzo) })}</p>
// t() restituisce il testo pubblicato dall'admin se c'è, altrimenti l'originale
// del catalogo, con i segnaposto riempiti. I testi pubblicati si scaricano una
// volta all'apertura del sito; una copia locale fa vedere quelli giusti già al
// primo disegno, senza aspettare la rete.
// Anteprima: l'admin può vedere le sue bozze sul sito prima di pubblicarle. Vale
// solo nel suo browser, e il database dà le bozze solo a lui.
// ═════════════════════════════════════════════════════════════════════════════

const CHIAVE_COPIA = 'criaTestiPubblicati';

const leggiCopia = () => {
    try {
        return JSON.parse(localStorage.getItem(CHIAVE_COPIA)) || {};
    } catch {
        return {};
    }
};

const scriviCopia = (pubblicati) => {
    try {
        localStorage.setItem(CHIAVE_COPIA, JSON.stringify(pubblicati));
    } catch {
        // storage non disponibile: si riscarica alla prossima apertura
    }
};

export const riempi = (testo, valori) =>
    valori ? String(testo).replace(SEGNAPOSTO, (intero, nome) => (valori[nome] != null ? String(valori[nome]) : intero)) : String(testo);

const TestiContext = createContext({ pubblicati: {} });

export const TestiProvider = ({ children }) => {
    const [pubblicati, setPubblicati] = useState(leggiCopia);
    const [bozze, setBozze] = useState(null);

    useEffect(() => {
        let vivo = true;
        const aggiorna = () => {
            caricaPubblicati()
                .then(p => {
                    if (!vivo) return;
                    setPubblicati(p);
                    scriviCopia(p);
                })
                .catch(() => {
                    // senza rete restano la copia locale o gli originali: il sito si legge lo stesso
                });
            if (anteprimaAccesa()) caricaBozze().then(b => vivo && setBozze(b)).catch(() => vivo && setBozze({}));
            else setBozze(null);
        };
        aggiorna();
        window.addEventListener(EVENTO_TESTI, aggiorna);
        return () => {
            vivo = false;
            window.removeEventListener(EVENTO_TESTI, aggiorna);
        };
    }, []);

    // I testi portano nomi e prezzi dei prodotti: quando l'admin cambia il
    // catalogo, le pagine che usano i testi si ridisegnano con i valori nuovi.
    const catalogo = useCatalogoProdotti();
    const valore = useMemo(
        () => ({ pubblicati: bozze ? { ...pubblicati, ...bozze } : pubblicati, catalogo }),
        [pubblicati, bozze, catalogo],
    );
    return (
        <TestiContext.Provider value={valore}>
            {children}
            {bozze && (
                <div className="fixed bottom-4 left-4 z-[100] flex items-center gap-3 rounded-full bg-amber-400 px-4 py-2 text-sm font-medium text-amber-950 shadow-lg">
                    Anteprima delle bozze: la vedi solo tu
                    <button type="button" className="underline underline-offset-2" onClick={() => accendiAnteprima(false)}>Chiudi</button>
                </div>
            )}
        </TestiContext.Provider>
    );
};

export const useT = () => {
    const { pubblicati } = useContext(TestiContext);
    return useCallback((chiave, valori) => {
        const testo = pubblicati[chiave] ?? PREDEFINITI[chiave];
        if (testo == null) {
            if (import.meta.env.DEV) console.warn(`Testi: manca la chiave ${chiave} nel catalogo`);
            return chiave;
        }
        return riempi(testo, valori);
    }, [pubblicati]);
};
