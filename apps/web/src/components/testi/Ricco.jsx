import React, { Fragment } from 'react';

// ═════════════════════════════════════════════════════════════════════════════
// Un testo del catalogo con i segni che l'admin può usare:
//   *parole*    in evidenza — lo stile lo decide la pagina con `evidenza`
//   **parole**  in grassetto
//   a capo      <br />
// Senza segni è il testo e basta. Un asterisco rimasto solo si vede com'è.
//
//   <Ricco evidenza={(s) => <span className="italic text-[#C97B5C]">{s}</span>}>
//       {t('home.hero.titolo')}
//   </Ricco>
// ═════════════════════════════════════════════════════════════════════════════

const PEZZI = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\n)/g;

const evidenzaPredefinita = (s) => <em>{s}</em>;
const grassettoPredefinito = (s) => <strong>{s}</strong>;

const Ricco = ({ children, evidenza = evidenzaPredefinita, grassetto = grassettoPredefinito }) => {
    const testo = String(children ?? '');
    const pezzi = testo.split(PEZZI).filter(p => p !== '');
    return pezzi.map((p, i) => {
        if (p === '\n') return <br key={i} />;
        if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <Fragment key={i}>{grassetto(p.slice(2, -2))}</Fragment>;
        if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <Fragment key={i}>{evidenza(p.slice(1, -1))}</Fragment>;
        return <Fragment key={i}>{p}</Fragment>;
    });
};

export default Ricco;

// Il testo senza segni: per title, alt, aria-label e meta description.
export const semplice = (testo) => String(testo ?? '').replace(/\*\*([^*\n]+)\*\*/g, '$1').replace(/\*([^*\n]+)\*/g, '$1').replace(/\n/g, ' ');
