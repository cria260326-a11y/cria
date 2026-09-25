import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck, ScanFace, Repeat, KeyRound } from 'lucide-react';
import SemaforoAnimato from '@/components/accesso/SemaforoAnimato';
import Ricco from '@/components/testi/Ricco';
import { useT } from '@/lib/testi';

// ═════════════════════════════════════════════════════════════════════════════
// CORNICE DI ACCESSO E REGISTRAZIONE — due colonne
// I testi sono in src/testi/catalogo/accesso.js: l'admin li cambia da Testi.
// A destra il modulo della pagina. A sinistra il semaforo che si accende e,
// sotto, un testo che cambia con la pagina: nel login il bentornato, nella
// registrazione cosa succede dopo. Sotto i 1024 px resta solo il modulo.
// ═════════════════════════════════════════════════════════════════════════════

export const fontTitolo = { fontFamily: "'Fraunces', 'Source Serif Pro', Georgia, serif" };
const fontMono = { fontFamily: "'JetBrains Mono', 'SF Mono', monospace" };

const Marchio = ({ chiaro }) => {
    const t = useT();
    return (
        <Link to="/" className="flex items-center gap-3">
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${chiaro ? 'bg-[#F5F5F0] text-[#1A2D52]' : 'bg-[#1A2D52] text-white'}`}>C</span>
            <span className="leading-tight">
                <span className={`block font-bold text-sm ${chiaro ? 'text-white' : 'text-[#1A2D52]'}`}>CRIA</span>
                <span className={`block text-[9px] tracking-widest uppercase ${chiaro ? 'text-white/60' : 'text-[#6B6B5E]'}`}>{t('accesso.marchio.sottotitolo')}</span>
            </span>
        </Link>
    );
};

const Bentornato = () => {
    const t = useT();
    return (
        <div className="space-y-2">
            <h2 className="text-4xl xl:text-5xl leading-tight" style={fontTitolo}><Ricco>{t('accesso.bentornato.titolo')}</Ricco></h2>
            <p className="text-white/70"><Ricco>{t('accesso.bentornato.frase')}</Ricco></p>
        </div>
    );
};

const ICONE_PASSI = [MailCheck, ScanFace, Repeat, KeyRound];

const DopoLaRegistrazione = () => {
    const t = useT();
    const passi = ICONE_PASSI.map((icona, i) => ({
        icona,
        titolo: t(`accesso.registrazione.passo${i + 1}.titolo`),
        testo: t(`accesso.registrazione.passo${i + 1}.testo`),
    }));
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-4xl xl:text-5xl leading-tight" style={fontTitolo}><Ricco>{t('accesso.registrazione.titolo')}</Ricco></h2>
                <p className="text-white/70"><Ricco>{t('accesso.registrazione.frase')}</Ricco></p>
            </div>
            <ol className="space-y-4">
                {passi.map(({ titolo, icona: Icona, testo }, i) => (
                    <li key={i} className="flex gap-4">
                        <span className="mt-0.5 w-8 h-8 rounded-full bg-white/10 text-white/80 flex items-center justify-center flex-shrink-0 text-xs" style={fontMono}>
                            {i + 1}
                        </span>
                        <div>
                            <p className="text-sm font-medium text-white flex items-center gap-2"><Icona className="w-4 h-4 text-white/60" /> {titolo}</p>
                            <p className="text-sm text-white/70 leading-relaxed"><Ricco>{testo}</Ricco></p>
                        </div>
                    </li>
                ))}
            </ol>
        </div>
    );
};

const PannelloAccesso = ({ variante }) => {
    const t = useT();
    return (
        <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen flex-col justify-between gap-10 bg-[#1A2D52] text-white px-12 xl:px-16 py-10 overflow-y-auto">
            <Marchio chiaro />
            <div className="space-y-10 max-w-xl">
                <SemaforoAnimato />
                {variante === 'registrazione' ? <DopoLaRegistrazione /> : <Bentornato />}
            </div>
            <p className="text-xs text-white/50">{t('accesso.piede')}</p>
        </aside>
    );
};

const CorniceAccesso = ({ variante = 'accesso', children }) => {
    const t = useT();
    return (
        <div className="min-h-screen grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] bg-white">
            <PannelloAccesso variante={variante} />
            <div className="flex flex-col min-h-screen">
                <header className="h-16 px-6 sm:px-10 flex items-center justify-between gap-4">
                    <span className="lg:invisible"><Marchio /></span>
                    <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#6B6B5E] hover:text-[#1A2D52]">
                        <ArrowLeft className="w-4 h-4" /> {t('accesso.testata.tornaAlSito')}
                    </Link>
                </header>
                <main className="flex-1 flex items-center justify-center px-6 sm:px-10 pb-12">
                    <div className="w-full max-w-md">{children}</div>
                </main>
            </div>
        </div>
    );
};

export default CorniceAccesso;
