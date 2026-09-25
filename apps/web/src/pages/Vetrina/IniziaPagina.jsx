import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
    ArrowRight, ArrowUpRight, CheckCircle2,
    Building2, Search, User, ShieldCheck, UserCheck, Users, MessageCircle
} from 'lucide-react';

import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';
import { PRODOTTI, PRODOTTI_PROPRIETARIO, PARAMETRI, nomeProdotto, prezzoProdotto, fmtEuro } from '@/data/catalogo';
import Ricco, { semplice } from '@/components/testi/Ricco';
import { useT } from '@/lib/testi';

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

const { P3, P6, P7 } = PRODOTTI;

// I testi sono in src/testi/catalogo/inizia.js: l'admin li cambia da Testi.
// Le parti *in evidenza* dei titoli sono in corsivo colorato.
const corsivoTerracotta = (testo) => <span className="italic" style={{ color: '#C97B5C' }}>{testo}</span>;
const corsivoRosa = (testo) => <span className="italic" style={{ color: '#E8B59C' }}>{testo}</span>;

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
                        {t('inizia.hero.occhiello')}
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
                    <Ricco evidenza={corsivoTerracotta}>{t('inizia.hero.titolo')}</Ricco>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-lg lg:text-xl max-w-2xl leading-relaxed"
                    style={{ fontFamily: fontBody, color: '#6B6B5E', fontWeight: 400 }}
                >
                    <Ricco>{t('inizia.hero.sottotitolo')}</Ricco>
                </motion.p>
            </div>
        </section>
    );
};

// ─── LE QUATTRO PORTE ─────────────────────────────────────────────────────────
const QuattroPorte = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-50px' });

    const porte = [
        {
            id: 'verifica',
            tag: t('inizia.porta1.etichetta'),
            titolo: t('inizia.porta1.titolo'),
            sottotitolo: t('inizia.porta1.sottotitolo'),
            desc: t('inizia.porta1.testo'),
            prezzi: [{ voce: nomeProdotto('P3'), prezzo: prezzoProdotto('P3') }],
            bullets: [
                t('inizia.porta1.punto1', { ore: P3.oreEsito }),
                t('inizia.porta1.punto2', { prezzo: fmtEuro(P3.prezzo), giorni: P3.scalabileEntroGiorni }),
                t('inizia.porta1.punto3'),
            ],
            cta: t('inizia.porta1.pulsante'),
            to: '/verifica',
            color: '#C97B5C',
            icon: Search,
        },
        {
            id: 'certificato',
            tag: t('inizia.porta2.etichetta'),
            titolo: t('inizia.porta2.titolo'),
            sottotitolo: t('inizia.porta2.sottotitolo'),
            desc: t('inizia.porta2.testo'),
            prezzi: [
                { voce: t('inizia.porta2.prezzo1.voce'), prezzo: t('inizia.porta2.prezzo1.prezzo') },
                { voce: t('inizia.porta2.prezzo2.voce', { nomeProdotto: P7.nome }), prezzo: prezzoProdotto('P7') },
            ],
            bullets: [
                t('inizia.porta2.punto1', { mesi: PARAMETRI.mesiValiditaCertificato }),
                t('inizia.porta2.punto2'),
                t('inizia.porta2.punto3'),
            ],
            cta: t('inizia.porta2.pulsante'),
            to: '/per-inquilini',
            color: '#22C55E',
            icon: User,
        },
        {
            id: 'copertura',
            tag: t('inizia.porta3.etichetta'),
            titolo: t('inizia.porta3.titolo'),
            sottotitolo: t('inizia.porta3.sottotitolo'),
            desc: t('inizia.porta3.testo'),
            prezzi: PRODOTTI_PROPRIETARIO.map((c) => ({ voce: nomeProdotto(c), prezzo: prezzoProdotto(c) })),
            bullets: [],
            cta: t('inizia.porta3.pulsante'),
            to: '/per-proprietari',
            secondaria: { label: t('inizia.porta3.secondario'), to: '/signup' },
            color: '#1A2D52',
            icon: ShieldCheck,
            featured: true,
        },
        {
            id: 'agenzie',
            tag: t('inizia.porta4.etichetta'),
            titolo: t('inizia.porta4.titolo'),
            sottotitolo: t('inizia.porta4.sottotitolo'),
            desc: P6.sintesi,
            prezzi: [{ voce: nomeProdotto('P6'), prezzo: prezzoProdotto('P6') }],
            bullets: [t('inizia.porta4.punto1')],
            cta: t('inizia.porta4.pulsante'),
            to: '/supporto',
            color: '#6B6B5E',
            icon: Building2,
        },
    ];

    return (
        <section ref={ref} className="py-20" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {porte.map((p, i) => {
                        const Icon = p.icon;
                        const f = !!p.featured;
                        return (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.7, delay: i * 0.12 }}
                                className="rounded-3xl p-8 relative flex flex-col group transition-all hover:-translate-y-1"
                                style={{
                                    background: f ? '#1A2D52' : '#FFFFFF',
                                    color: f ? '#FFFFFF' : '#1A1A1A',
                                    border: f ? 'none' : '1px solid rgba(26, 45, 82, 0.12)',
                                    boxShadow: f
                                        ? '0 25px 60px -15px rgba(26, 45, 82, 0.4)'
                                        : '0 4px 20px -8px rgba(26, 45, 82, 0.08)',
                                }}
                            >
                                {/* Icona + tag */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{ background: f ? 'rgba(232, 181, 156, 0.15)' : `${p.color}15` }}>
                                        <Icon className="w-6 h-6" style={{ color: f ? '#E8B59C' : p.color }} />
                                    </div>
                                    <div className="text-[10px] uppercase tracking-[0.2em]"
                                        style={{ fontFamily: fontMono, color: f ? 'rgba(255, 255, 255, 0.5)' : '#6B6B5E' }}>
                                        {p.tag}
                                    </div>
                                </div>

                                {/* Titolo */}
                                <h2 className="text-2xl font-bold mb-2 leading-[1.1]"
                                    style={{
                                        fontFamily: fontHeader,
                                        fontVariationSettings: fontSettingsSoft,
                                        color: f ? '#FFFFFF' : '#1A2D52',
                                        fontWeight: 400,
                                    }}>
                                    <Ricco>{p.titolo}</Ricco>
                                </h2>

                                {/* Per chi */}
                                <p className="text-sm italic mb-5"
                                    style={{
                                        fontFamily: fontHeader,
                                        fontVariationSettings: fontSettingsSoft,
                                        color: f ? '#E8B59C' : p.color,
                                        fontWeight: 300,
                                    }}>
                                    <Ricco>{p.sottotitolo}</Ricco>
                                </p>

                                {/* Cosa ottieni */}
                                <p className="text-sm leading-relaxed mb-6"
                                    style={{ fontFamily: fontBody, color: f ? 'rgba(255, 255, 255, 0.75)' : '#6B6B5E' }}>
                                    <Ricco>{p.desc}</Ricco>
                                </p>

                                {/* Quanto costa */}
                                <div className="rounded-2xl p-4 mb-6"
                                    style={{
                                        background: f ? 'rgba(255, 255, 255, 0.06)' : '#F5F5F0',
                                        border: f ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(26, 45, 82, 0.06)',
                                    }}>
                                    <div className="text-[10px] uppercase tracking-[0.2em] mb-3"
                                        style={{ fontFamily: fontMono, color: f ? 'rgba(255, 255, 255, 0.5)' : '#6B6B5E' }}>
                                        {t('inizia.porte.quantoCosta')}
                                    </div>
                                    <ul className="space-y-3">
                                        {p.prezzi.map((pr, j) => (
                                            <li key={j}>
                                                <div className="text-xs" style={{ fontFamily: fontBody, color: f ? 'rgba(255, 255, 255, 0.65)' : '#6B6B5E' }}>
                                                    {pr.voce}
                                                </div>
                                                <div className="text-base font-semibold leading-snug"
                                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: f ? '#FFFFFF' : '#1A2D52' }}>
                                                    {pr.prezzo}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Punti */}
                                <ul className="space-y-3 mb-8 flex-1">
                                    {p.bullets.map((b, j) => (
                                        <li key={j} className="flex items-start gap-3 text-sm"
                                            style={{ fontFamily: fontBody, color: f ? 'rgba(255, 255, 255, 0.85)' : '#1A1A1A' }}>
                                            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5"
                                                style={{ color: f ? '#E8B59C' : p.color }} />
                                            <Ricco>{b}</Ricco>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Link to={p.to} className="block">
                                    <button className="group/btn w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                                        style={{
                                            background: f ? '#FFFFFF' : '#1A2D52',
                                            color: f ? '#1A2D52' : '#FFFFFF',
                                            fontFamily: fontBody,
                                        }}>
                                        {p.cta}
                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                                    </button>
                                </Link>
                                {p.secondaria && (
                                    <Link to={p.secondaria.to} className="block text-center text-sm font-semibold mt-3"
                                        style={{ fontFamily: fontBody, color: f ? '#E8B59C' : '#1A2D52' }}>
                                        {p.secondaria.label}
                                    </Link>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// ─── COSA SUCCEDE DOPO LA REGISTRAZIONE ──────────────────────────────────────
const CosaTroviDopo = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-24" style={{ background: '#F5F5F0' }}>
            <div className="max-w-[1100px] mx-auto px-6 lg:px-12">

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-xs uppercase tracking-[0.25em] mb-6 text-center"
                    style={{ fontFamily: fontMono, color: '#C97B5C' }}
                >
                    {t('inizia.dopo.occhiello')}
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
                    <Ricco evidenza={corsivoTerracotta}>{t('inizia.dopo.titolo')}</Ricco>
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="grid md:grid-cols-3 gap-6"
                >
                    {[
                        {
                            id: 'registrazione',
                            icon: UserCheck,
                            titolo: t('inizia.dopo.passo1.titolo'),
                            desc: t('inizia.dopo.passo1.testo'),
                        },
                        {
                            id: 'identita',
                            icon: ShieldCheck,
                            titolo: t('inizia.dopo.passo2.titolo'),
                            desc: t('inizia.dopo.passo2.testo'),
                        },
                        {
                            id: 'ruoli',
                            icon: Users,
                            titolo: t('inizia.dopo.passo3.titolo'),
                            desc: t('inizia.dopo.passo3.testo'),
                        },
                    ].map((c) => {
                        const Icon = c.icon;
                        return (
                            <div key={c.id} className="rounded-2xl p-6"
                                style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.06)' }}>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                                    style={{ background: '#22C55E15' }}>
                                    <Icon className="w-5 h-5" style={{ color: '#22C55E' }} />
                                </div>
                                <h4 className="text-base font-semibold mb-2"
                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    <Ricco>{c.titolo}</Ricco>
                                </h4>
                                <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                    <Ricco>{c.desc}</Ricco>
                                </p>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};

// ─── CTA SECONDARIA — DUBBI? ──────────────────────────────────────────────────
const HaiDubbi = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    return (
        <section ref={ref} className="py-20" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1100px] mx-auto px-6 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                    style={{ background: '#1A2D52', color: '#FFFFFF' }}
                >
                    <div className="flex items-start gap-5 flex-1">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(232, 181, 156, 0.15)' }}>
                            <MessageCircle className="w-6 h-6" style={{ color: '#E8B59C' }} />
                        </div>
                        <div>
                            <h3 className="text-2xl lg:text-3xl font-bold mb-2 leading-tight"
                                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF', fontWeight: 400 }}>
                                <Ricco evidenza={corsivoRosa}>{t('inizia.dubbi.titolo')}</Ricco>
                            </h3>
                            <p className="text-base" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}>
                                <Ricco>{t('inizia.dubbi.testo')}</Ricco>
                            </p>
                        </div>
                    </div>
                    <Link to="/supporto" className="flex-shrink-0">
                        <button className="group flex items-center gap-3 px-6 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                            style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}>
                            {t('inizia.dubbi.pulsante')}
                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

// ─── PAGINA PRINCIPALE ────────────────────────────────────────────────────────
const IniziaPagina = () => {
    const t = useT();
    return (
        <>
            <Helmet>
                <title>{semplice(t('inizia.meta.titolo'))}</title>
                <meta name="description" content={semplice(t('inizia.meta.descrizione'))} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300,50;0,9..144,400,50;0,9..144,500,50;0,9..144,600,50;0,9..144,700,50;1,9..144,300,50;1,9..144,400,50&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            </Helmet>

            <div style={{ background: '#FFFFFF', fontFamily: fontBody }}>
                <VetrinaHeader />
                <Hero />
                <QuattroPorte />
                <CosaTroviDopo />
                <HaiDubbi />
                <VetrinaFooter />
            </div>
        </>
    );
};

export default IniziaPagina;
