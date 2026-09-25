import { PERSONE_DEMO } from '@/data/personeDemo';
import { nomeVisualizzato } from '@/lib/aree';

// Nome visualizzato di ogni persona demo, per le pagine pubbliche che non hanno una sessione.
export const persone = Object.fromEntries(PERSONE_DEMO.map(p => [p.id, nomeVisualizzato(p)]));
