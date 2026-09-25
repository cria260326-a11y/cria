import React, { useRef, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
    ArrowRight, Plus, Mail, LogIn, UserPlus
} from 'lucide-react';

import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';
import Ricco, { semplice } from '@/components/testi/Ricco';
import { useT } from '@/lib/testi';
import { useFaqPubbliche } from '@/lib/faqDemo';

// I testi della pagina sono in src/testi/catalogo/supporto.js: l'admin li cambia da
// Admin → Testi. Le domande frequenti e le loro categorie invece da Admin → FAQ.

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

// Le parti *in evidenza* dei titoli: il corsivo, colorato o del colore del titolo.
const corsivo = (colore) => (s) => <span className="italic" style={{ color: colore }}>{s}</span>;
const soloCorsivo = (s) => <span className="italic">{s}</span>;

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => {
    const t = useT();
    return (
        <section className="relative pt-32 pb-12" style={{ background: '#FFFFFF' }}>
            <div className="hidden md:block absolute top-32 right-0 w-1 h-72 rounded-full opacity-30" style={{ background: '#22C55E' }} />
            <div className="hidden md:block absolute top-32 right-3 w-1 h-48 rounded-full opacity-30" style={{ background: '#F59E0B' }} />
            <div className="hidden md:block absolute top-32 right-6 w-1 h-32 rounded-full opacity-30" style={{ background: '#EF4444' }} />

            <div className="max-w-[1100px] mx-auto px-6 lg:px-12 relative">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                    style={{ background: 'rgba(26, 45, 82, 0.06)', border: '1px solid rgba(26, 45, 82, 0.12)' }}>
                    <span className="relative flex w-2 h-2">
                        <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style={{ background: '#22C55E' }} />
                        <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
                    </span>
                    <span className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: '#1A2D52', fontFamily: fontMono }}>
                        {t('supporto.hero.occhiello')}
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="leading-[0.95] tracking-tight mb-6"
                    style={{
                        fontFamily: fontHeader,
                        fontVariationSettings: fontSettingsSoft,
                        color: '#1A2D52',
                        fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                        fontWeight: 400,
                        letterSpacing: '-0.03em',
                    }}
                >
                    <Ricco evidenza={corsivo('#C97B5C')}>{t('supporto.hero.titolo')}</Ricco>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-lg lg:text-xl max-w-2xl leading-relaxed"
                    style={{ fontFamily: fontBody, color: '#6B6B5E', fontWeight: 400 }}
                >
                    <Ricco>{t('supporto.hero.sottotitolo')}</Ricco>
                </motion.p>
            </div>
        </section>
    );
};

// ─── FAQ — UNA FONTE SOLA ─────────────────────────────────────────────────────
// Le domande arrivano dallo stesso posto in cui le modifica l'editor admin
// (O-29, lib/faqDemo.js): il contenuto di partenza è data/faqData.js, più quello
// che l'admin ha cambiato. Qui si mostrano solo categorie e domande attive, nel
// loro ordine, con prezzi e giorni presi dal listino.
const FaqSection = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-50px' });
    const { categorie, faq: FAQS } = useFaqPubbliche();

    const [activeCategory, setActiveCategory] = useState('tutte');
    const [openFaq, setOpenFaq] = useState(null);

    // Il filtro «Tutte» è un testo della pagina; le altre categorie vengono dalle FAQ.
    const etichettaTutte = semplice(t('supporto.faq.tutte'));
    const CATEGORIES = useMemo(() => [
        { id: 'tutte', label: etichettaTutte },
        ...categorie.map(c => ({ id: String(c.id), label: c.nome })),
    ], [categorie, etichettaTutte]);

    const filteredFaqs = useMemo(() => {
        if (activeCategory === 'tutte') return FAQS;
        return FAQS.filter(f => String(f.categoriaId) === activeCategory);
    }, [activeCategory, FAQS]);

    const countByCategory = useMemo(() => {
        const counts = { tutte: FAQS.length };
        CATEGORIES.forEach(c => {
            if (c.id === 'tutte') return;
            counts[c.id] = FAQS.filter(f => String(f.categoriaId) === c.id).length;
        });
        return counts;
    }, [FAQS, CATEGORIES]);

    const handleCategoryClick = (catId) => {
        setActiveCategory(catId);
        setOpenFaq(null);
    };

    return (
        <section ref={ref} className="py-20" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1100px] mx-auto px-6 lg:px-12">

                {/* Chip categorie */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="flex flex-wrap gap-2 mb-10"
                >
                    {CATEGORIES.map((cat) => {
                        const count = countByCategory[cat.id] || 0;
                        if (cat.id !== 'tutte' && count === 0) return null;

                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-[1.02]"
                                style={{
                                    background: isActive ? '#1A2D52' : '#F5F5F0',
                                    color: isActive ? '#FFFFFF' : '#1A2D52',
                                    fontFamily: fontBody,
                                    border: isActive ? 'none' : '1px solid rgba(26, 45, 82, 0.08)',
                                }}
                            >
                                {cat.label}
                                <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
                                    style={{
                                        background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(26, 45, 82, 0.08)',
                                        color: isActive ? '#FFFFFF' : '#6B6B5E',
                                        fontFamily: fontMono,
                                    }}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </motion.div>

                {/* Lista FAQ */}
                <div className="space-y-3">
                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl"
                            style={{ background: '#F5F5F0', border: '1px solid rgba(26, 45, 82, 0.08)' }}>
                            <p className="text-base" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                <Ricco>{t('supporto.faq.nessuna')}</Ricco>
                            </p>
                        </div>
                    ) : (
                        filteredFaqs.map((f, i) => (
                            <motion.div
                                key={f.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.4, delay: i * 0.04 }}
                                className="rounded-2xl overflow-hidden"
                                style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                                    className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[#F5F5F0]"
                                >
                                    <span className="text-base lg:text-lg font-semibold leading-tight"
                                        style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                        {f.domanda}
                                    </span>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform"
                                        style={{
                                            background: openFaq === f.id ? '#1A2D52' : 'rgba(26, 45, 82, 0.06)',
                                            transform: openFaq === f.id ? 'rotate(45deg)' : 'rotate(0deg)',
                                        }}>
                                        <Plus className="w-4 h-4" style={{ color: openFaq === f.id ? '#FFFFFF' : '#1A2D52' }} />
                                    </div>
                                </button>
                                {openFaq === f.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="px-5 pb-5"
                                    >
                                        <p className="text-base leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                            {f.risposta}
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

// ─── DUE CARD: ACCEDI O REGISTRATI ────────────────────────────────────────────
const ContattaciCards = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });
    // L'indirizzo è anche il link che apre la posta: senza i segni del testo ricco.
    const email = semplice(t('supporto.contatti.email.indirizzo')).trim();

    return (
        <section ref={ref} className="py-24" style={{ background: '#F5F5F0' }}>
            <div className="max-w-[1200px] mx-auto px-6 lg:px-12">

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-xs uppercase tracking-[0.25em] mb-6 text-center"
                    style={{ fontFamily: fontMono, color: '#C97B5C' }}
                >
                    {t('supporto.contatti.occhiello')}
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="leading-[1.1] tracking-tight text-center mb-12 max-w-3xl mx-auto"
                    style={{
                        fontFamily: fontHeader,
                        fontVariationSettings: fontSettingsSoft,
                        color: '#1A2D52',
                        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                        fontWeight: 400,
                    }}
                >
                    <Ricco evidenza={corsivo('#C97B5C')}>{t('supporto.contatti.titolo')}</Ricco>
                </motion.h2>

                <div className="grid md:grid-cols-2 gap-6 mb-8">

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="rounded-3xl p-8 lg:p-10 transition-all hover:-translate-y-1"
                        style={{
                            background: '#FFFFFF',
                            border: '1px solid rgba(26, 45, 82, 0.1)',
                            boxShadow: '0 4px 20px -8px rgba(26, 45, 82, 0.08)',
                        }}
                    >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                            style={{ background: '#22C55E15' }}>
                            <LogIn className="w-6 h-6" style={{ color: '#22C55E' }} />
                        </div>

                        <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ fontFamily: fontMono, color: '#22C55E' }}>
                            {t('supporto.contatti.accedi.occhiello')}
                        </p>
                        <h3 className="text-2xl lg:text-3xl font-bold leading-tight mb-4"
                            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                            <Ricco evidenza={soloCorsivo}>{t('supporto.contatti.accedi.titolo')}</Ricco>
                        </h3>
                        <p className="text-base leading-relaxed mb-8"
                            style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                            <Ricco>{t('supporto.contatti.accedi.testo')}</Ricco>
                        </p>

                        <Link to="/login">
                            <button className="group flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                                style={{ background: '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}>
                                {t('supporto.contatti.accedi.pulsante')}
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                            </button>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="rounded-3xl p-8 lg:p-10 relative overflow-hidden transition-all hover:-translate-y-1"
                        style={{
                            background: '#1A2D52',
                            color: '#FFFFFF',
                            boxShadow: '0 25px 60px -15px rgba(26, 45, 82, 0.4)',
                        }}
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-30"
                            style={{ background: 'radial-gradient(circle, rgba(232, 181, 156, 0.4), transparent 70%)' }} />

                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                                style={{ background: 'rgba(232, 181, 156, 0.15)' }}>
                                <UserPlus className="w-6 h-6" style={{ color: '#E8B59C' }} />
                            </div>

                            <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ fontFamily: fontMono, color: '#E8B59C' }}>
                                {t('supporto.contatti.registrati.occhiello')}
                            </p>
                            <h3 className="text-2xl lg:text-3xl font-bold leading-tight mb-4"
                                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF' }}>
                                <Ricco evidenza={corsivo('#E8B59C')}>{t('supporto.contatti.registrati.titolo')}</Ricco>
                            </h3>
                            <p className="text-base leading-relaxed mb-8"
                                style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.75)' }}>
                                <Ricco>{t('supporto.contatti.registrati.testo')}</Ricco>
                            </p>

                            <Link to="/signup">
                                <button className="group flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                                    style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}>
                                    {t('supporto.contatti.registrati.pulsante')}
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-center"
                >
                    <p className="text-sm" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                        {t('supporto.contatti.email.frase')}{' '}
                        <a
                            href={`mailto:${email}`}
                            className="font-semibold inline-flex items-center gap-1.5 hover:underline"
                            style={{ color: '#1A2D52' }}
                        >
                            <Mail className="w-3.5 h-3.5" />
                            {email}
                        </a>
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

// ─── PAGINA PRINCIPALE ────────────────────────────────────────────────────────
const SupportoPage = () => {
    const t = useT();
    return (
        <>
            <Helmet>
                <title>{semplice(t('supporto.meta.titolo'))}</title>
                <meta name="description" content={semplice(t('supporto.meta.descrizione'))} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300,50;0,9..144,400,50;0,9..144,500,50;0,9..144,600,50;0,9..144,700,50;1,9..144,300,50;1,9..144,400,50&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            </Helmet>

            <div style={{ background: '#FFFFFF', fontFamily: fontBody }}>
                <VetrinaHeader activePage="supporto" />
                <Hero />
                <FaqSection />
                <ContattaciCards />
                <VetrinaFooter />
            </div>
        </>
    );
};

export default SupportoPage;
