import { useAuth } from '@/contexts/AuthContext.jsx';
import { trovaOperatore } from '@/data/operatori';

// ═════════════════════════════════════════════════════════════════════════════
// CHI OPERA NELL'AREA INTERNA
// L'account con cui si è entrati: ogni collega ha il suo, con la funzione
// scritta nei ruoli del database; l'admin ha accesso completo. Per provare le
// regole «due persone diverse» (chi dispone non autorizza) si entra con due
// account diversi.
// ═════════════════════════════════════════════════════════════════════════════

export const useOperatoreAttivo = () => {
    const { persona } = useAuth();
    const operatore = trovaOperatore(persona?.operatoreId) || null;
    return { operatore, operatoreId: operatore?.id || null };
};
