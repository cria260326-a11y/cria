// ═════════════════════════════════════════════════════════════════════════════
// CATALOGO DEI TESTI DEL SITO — gli originali
// Un file per pagina in questa cartella, raccolto da solo. Ogni file esporta:
//   {
//     id: 'home', nome: 'Home', percorso: '/', ordine: 10,
//     testi: [
//       { chiave: 'home.hero.titolo', sezione: 'In alto', etichetta: 'Titolo',
//         testo: 'Il semaforo del *tuo affitto*', lungo?: true },
//     ],
//   }
// Nel testo si possono usare:
//   {nome}      un segnaposto: lo riempie la pagina (prezzi e giorni vengono dal
//               listino, non si scrivono a mano); l'admin deve lasciarlo com'è
//   *parole*    in evidenza, con lo stile che la pagina dà a quel titolo
//   **parole**  in grassetto
//   a capo      va a capo
// La chiave è pagina.sezione.elemento, in camelCase: non si cambia mai, perché
// è quella con cui l'admin l'ha modificata nel database.
// ═════════════════════════════════════════════════════════════════════════════

const moduli = import.meta.glob('./*.js', { eager: true });

export const PAGINE = Object.entries(moduli)
    .filter(([percorso]) => !percorso.endsWith('/index.js'))
    .map(([, m]) => m.default)
    .filter(Boolean)
    .sort((a, b) => (a.ordine ?? 999) - (b.ordine ?? 999));

export const VOCI = PAGINE.flatMap(p => p.testi.map(t => ({ ...t, pagina: p.id, nomePagina: p.nome, percorso: p.percorso })));

export const PREDEFINITI = Object.fromEntries(VOCI.map(v => [v.chiave, v.testo]));

// In sviluppo una chiave doppia è un errore da vedere subito.
if (import.meta.env.DEV) {
    const viste = new Set();
    VOCI.forEach(v => {
        if (viste.has(v.chiave)) console.error(`Testi: la chiave ${v.chiave} è in due voci del catalogo`);
        viste.add(v.chiave);
    });
}

export const SEGNAPOSTO = /\{([a-zA-Z0-9_]+)\}/g;

export const segnapostoDi = (testo) => [...String(testo || '').matchAll(SEGNAPOSTO)].map(m => m[1]).sort();
