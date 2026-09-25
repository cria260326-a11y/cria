import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ═════════════════════════════════════════════════════════════════════════════
// OGNI PAGINA SI APRE DALL'ALTO
// Cambiando pagina si riparte sempre dall'inizio, anche se quella pagina l'avevi
// già vista e ti eri fermato a metà. Due cose da mettere in cima:
//   - la finestra, che è dove scorrono vetrina e pagine singole
//   - i contenitori con data-scorre-pagina: nelle aree riservate la pagina
//     scorre dentro <main>, e la finestra non si muove mai
// Il salto è immediato: il sito ha lo scorrimento morbido (index.css), e senza
// «instant» la pagina nuova si vedrebbe prima a metà e poi risalire.
// Il browser non rimette la posizione di prima tornando indietro.
// Un link con ancora (#sezione) porta alla sezione: lì non si torna in cima.
// ═════════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
}

const IN_CIMA = { top: 0, left: 0, behavior: 'instant' };

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    useLayoutEffect(() => {
        if (hash) return;
        window.scrollTo(IN_CIMA);
        document.querySelectorAll('[data-scorre-pagina]').forEach(el => el.scrollTo(IN_CIMA));
    }, [pathname, hash]);

    return null;
};

export default ScrollToTop;
