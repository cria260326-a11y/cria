import React from 'react';
import { Helmet } from 'react-helmet';
import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';
import Ricco, { semplice } from '@/components/testi/Ricco';
import { useT } from '@/lib/testi';

// ⚠️ TESTO PROVVISORIO — da revisionare con un consulente legale prima del lancio.
// I testi sono in src/testi/catalogo/cookie.js: l'admin li cambia da Testi.
// Nella tabella il tipo del cookie decide il colore dell'etichetta: resta qui.
const COOKIE = [
    { riga: 1, tecnico: true },
    { riga: 2, tecnico: true },
    { riga: 3, tecnico: true },
    { riga: 4, tecnico: false },
];

const PARAGRAFI = [1, 2, 3, 4, 5];

const CookiePage = () => {
    const t = useT();
    return (
        <>
            <Helmet><title>{semplice(t('cookie.meta.titolo'))}</title></Helmet>
            <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
                <VetrinaHeader />

                <section className="max-w-3xl mx-auto px-6 pt-16 pb-10">
                    <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B5E] mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {t('cookie.hero.occhiello')}
                    </p>
                    <h1 className="text-4xl md:text-5xl font-semibold text-[#1A2D52] leading-tight mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
                        <Ricco>{t('cookie.hero.titolo')}</Ricco>
                    </h1>
                    <p className="text-[#6B6B5E]">
                        <Ricco>{t('cookie.hero.sottotitolo')}</Ricco>
                    </p>
                </section>

                <section className="max-w-3xl mx-auto px-6 pb-20">
                    <div className="space-y-8">
                        {PARAGRAFI.map((n) => (
                            <div key={n}>
                                <h2 className="text-lg font-semibold text-[#1A2D52] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                                    <Ricco>{t(`cookie.paragrafo${n}.titolo`)}</Ricco>
                                </h2>
                                <p className="text-[15px] leading-relaxed text-[#3D3D35]">
                                    <Ricco>{t(`cookie.paragrafo${n}.testo`)}</Ricco>
                                </p>
                            </div>
                        ))}

                        {/* Tabella cookie */}
                        <div>
                            <h2 className="text-lg font-semibold text-[#1A2D52] mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
                                <Ricco>{t('cookie.paragrafo6.titolo')}</Ricco>
                            </h2>
                            <div className="border border-[#E5E5DE] rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#F5F5F0]">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B5E] uppercase tracking-wide">{t('cookie.tabella.nome')}</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B5E] uppercase tracking-wide">{t('cookie.tabella.tipo')}</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B5E] uppercase tracking-wide">{t('cookie.tabella.durata')}</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B6B5E] uppercase tracking-wide">{t('cookie.tabella.scopo')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E5E5DE]">
                                        {COOKIE.map(({ riga, tecnico }) => (
                                            <tr key={riga}>
                                                <td className="px-4 py-3 font-mono text-xs text-[#1A2D52]">{t(`cookie.tabella.riga${riga}.nome`)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        tecnico ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                                                    }`}>
                                                        {t(tecnico ? 'cookie.tabella.tipoTecnico' : 'cookie.tabella.tipoAnalitico')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-[#3D3D35]">{t(`cookie.tabella.riga${riga}.durata`)}</td>
                                                <td className="px-4 py-3 text-[#3D3D35]"><Ricco>{t(`cookie.tabella.riga${riga}.scopo`)}</Ricco></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 p-4 bg-[#F5F5F0] rounded-xl text-sm text-[#6B6B5E]">
                        <Ricco>{t('cookie.contatti.testo')}</Ricco>{' '}
                        <a href={`mailto:${semplice(t('cookie.contatti.email'))}`} className="underline text-[#1A2D52]">{t('cookie.contatti.email')}</a>.
                    </div>
                </section>

                <VetrinaFooter />
            </div>
        </>
    );
};

export default CookiePage;
