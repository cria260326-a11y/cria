import React from 'react';
import { Helmet } from 'react-helmet';
import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';
import Ricco, { semplice } from '@/components/testi/Ricco';
import { useT } from '@/lib/testi';

// ⚠️ TESTO PROVVISORIO — da revisionare con un consulente legale prima del lancio.
// I testi sono in src/testi/catalogo/privacy.js: l'admin li cambia da Testi.
const PARAGRAFI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const PrivacyPage = () => {
    const t = useT();
    return (
        <>
            <Helmet><title>{semplice(t('privacy.meta.titolo'))}</title></Helmet>
            <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}>
                <VetrinaHeader />

                {/* Hero */}
                <section className="max-w-3xl mx-auto px-6 pt-16 pb-10">
                    <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B5E] mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {t('privacy.hero.occhiello')}
                    </p>
                    <h1 className="text-4xl md:text-5xl font-semibold text-[#1A2D52] leading-tight mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
                        <Ricco>{t('privacy.hero.titolo')}</Ricco>
                    </h1>
                    <p className="text-[#6B6B5E]">
                        <Ricco>{t('privacy.hero.sottotitolo')}</Ricco>
                    </p>
                </section>

                {/* Contenuto */}
                <section className="max-w-3xl mx-auto px-6 pb-20">
                    <div className="space-y-8">
                        {PARAGRAFI.map((n) => (
                            <div key={n}>
                                <h2 className="text-lg font-semibold text-[#1A2D52] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
                                    <Ricco>{t(`privacy.paragrafo${n}.titolo`)}</Ricco>
                                </h2>
                                <p className="text-[15px] leading-relaxed text-[#3D3D35]">
                                    <Ricco>{t(`privacy.paragrafo${n}.testo`)}</Ricco>
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-4 bg-[#F5F5F0] rounded-xl text-sm text-[#6B6B5E]">
                        <Ricco>{t('privacy.contatti.testo')}</Ricco>{' '}
                        <a href={`mailto:${semplice(t('privacy.contatti.email'))}`} className="underline text-[#1A2D52]">{t('privacy.contatti.email')}</a>.
                    </div>
                </section>

                <VetrinaFooter />
            </div>
        </>
    );
};

export default PrivacyPage;
