import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
    ArrowRight, ArrowUpRight, CheckCircle2,
    Building2, Search, User, Sparkles, MessageCircle
} from 'lucide-react';

import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => {
    return (
        <section className="relative pt-32 pb-12" style={{ background: '#FFFFFF' }}>
            <div className="absolute top-32 right-0 w-1 h-72 rounded-full opacity-30" style={{ background: '#22C55E' }} />
            <div className="absolute top-32 right-3 w-1 h-48 rounded-full opacity-30" style={{ background: '#F59E0B' }} />
            <div className="absolute top-32 right-6 w-1 h-32 rounded-full opacity-30" style={{ background: '#EF4444' }} />

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
                        Iniziamo
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
                    Una sola domanda<br />
                    per partire: <span className="italic" style={{ color: '#C97B5C' }}>tu chi sei?</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-lg lg:text-xl max-w-2xl leading-relaxed"
                    style={{ fontFamily: fontBody, color: '#6B6B5E', fontWeight: 400 }}
                >
                    Su CRIA hai tre punti di ingresso, in base a cosa ti serve. Scegli quello giusto: ti guidiamo passo passo da lì.
                </motion.p>
            </div>
        </section>
    );
};

// ─── 3 PERCORSI ───────────────────────────────────────────────────────────────
const TrePercorsi = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-50px' });

    const percorsi = [
        {
            tag: 'Percorso 1',
            titolo: 'Ho immobili da gestire',
            sottotitolo: 'Privato o agenzia',
            desc: 'Vuoi tracciare i pagamenti dei tuoi inquilini, gestire le contestazioni, o delegarci tutto. Hai uno o più immobili attivi.',
            bullets: [
                'Onboarding guidato in 4 step',
                'Verifica documentale entro 24h',
                'Scegli tra CRIA Gestione o Completo',
            ],
            cta: 'Inizia come locatore',
            to: '/scegli-prodotto',
            color: '#22C55E',
            icon: Building2,
            featured: false,
        },
        {
            tag: 'Percorso 2',
            titolo: 'Voglio verificare un inquilino',
            sottotitolo: 'One-shot, prima di firmare',
            desc: 'Stai per affittare un immobile e vuoi sapere se la persona è affidabile. Una sola verifica, esito in 48 ore via mail.',
            bullets: [
                'Esito documentato in PDF',
                'Niente abbonamenti né vincoli',
                'Pagamento singolo via Stripe',
            ],
            cta: 'Verifica un inquilino',
            to: '/signup?intent=verifica',
            color: '#C97B5C',
            icon: Search,
            featured: true,
        },
        {
            tag: 'Percorso 3',
            titolo: 'Sono un inquilino',
            sottotitolo: 'Voglio capirne di più',
            desc: 'Il tuo locatore usa CRIA o stai pensando di proporglielo. Vuoi sapere cosa cambia per te e quali vantaggi hai.',
            bullets: [
                'Accesso gratuito alla tua dashboard',
                'Vedi tutto quello che vede il locatore',
                'Storico positivo che ti segue',
            ],
            cta: 'Scopri la pagina inquilini',
            to: '/per-inquilini',
            color: '#1A2D52',
            icon: User,
            featured: false,
        },
    ];

    return (
        <section ref={ref} className="py-20" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="grid lg:grid-cols-3 gap-6">
                    {percorsi.map((p, i) => {
                        const Icon = p.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.7, delay: i * 0.12 }}
                                className="rounded-3xl p-8 lg:p-10 relative flex flex-col group transition-all hover:-translate-y-1"
                                style={{
                                    background: p.featured ? '#1A2D52' : '#FFFFFF',
                                    color: p.featured ? '#FFFFFF' : '#1A1A1A',
                                    border: p.featured ? 'none' : '1px solid rgba(26, 45, 82, 0.12)',
                                    boxShadow: p.featured
                                        ? '0 25px 60px -15px rgba(26, 45, 82, 0.4)'
                                        : '0 4px 20px -8px rgba(26, 45, 82, 0.08)',
                                }}
                            >
                                {p.featured && (
                                    <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                        style={{ background: '#C97B5C', color: '#FFFFFF', fontFamily: fontMono }}>
                                        Più rapido
                                    </div>
                                )}

                                {/* Tag + numero */}
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                                        style={{
                                            background: p.featured ? 'rgba(232, 181, 156, 0.15)' : `${p.color}15`,
                                        }}>
                                        <Icon className="w-6 h-6" style={{ color: p.featured ? '#E8B59C' : p.color }} />
                                    </div>
                                    <div className="text-[10px] uppercase tracking-[0.2em]"
                                        style={{
                                            fontFamily: fontMono,
                                            color: p.featured ? 'rgba(255, 255, 255, 0.5)' : '#6B6B5E',
                                        }}>
                                        {p.tag}
                                    </div>
                                </div>

                                {/* Titolo */}
                                <h2 className="text-2xl lg:text-[1.7rem] font-bold mb-2 leading-[1.1]"
                                    style={{
                                        fontFamily: fontHeader,
                                        fontVariationSettings: fontSettingsSoft,
                                        color: p.featured ? '#FFFFFF' : '#1A2D52',
                                        fontWeight: 400,
                                    }}>
                                    {p.titolo}
                                </h2>

                                {/* Sottotitolo */}
                                <p className="text-sm italic mb-5"
                                    style={{
                                        fontFamily: fontHeader,
                                        fontVariationSettings: fontSettingsSoft,
                                        color: p.featured ? '#E8B59C' : p.color,
                                        fontWeight: 300,
                                    }}>
                                    {p.sottotitolo}
                                </p>

                                {/* Descrizione */}
                                <p className="text-base leading-relaxed mb-6"
                                    style={{
                                        fontFamily: fontBody,
                                        color: p.featured ? 'rgba(255, 255, 255, 0.75)' : '#6B6B5E',
                                    }}>
                                    {p.desc}
                                </p>

                                {/* Bullets */}
                                <ul className="space-y-3 mb-8 flex-1">
                                    {p.bullets.map((b, j) => (
                                        <li key={j} className="flex items-start gap-3 text-sm"
                                            style={{
                                                fontFamily: fontBody,
                                                color: p.featured ? 'rgba(255, 255, 255, 0.85)' : '#1A1A1A',
                                            }}>
                                            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5"
                                                style={{ color: p.featured ? '#E8B59C' : p.color }} />
                                            {b}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Link to={p.to} className="block">
                                    <button className="group/btn w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                                        style={{
                                            background: p.featured ? '#FFFFFF' : '#1A2D52',
                                            color: p.featured ? '#1A2D52' : '#FFFFFF',
                                            fontFamily: fontBody,
                                        }}>
                                        {p.cta}
                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                                    </button>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// ─── COSA TROVI DOPO LA REGISTRAZIONE ────────────────────────────────────────
const CosaTroviDopo = () => {
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
                    Cosa succede dopo
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
                    Una volta dentro, <span className="italic" style={{ color: '#C97B5C' }}>ti guidiamo passo passo.</span>
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="grid md:grid-cols-3 gap-6"
                >
                    {[
                        {
                            icon: Sparkles,
                            titolo: 'Niente costi nascosti',
                            desc: 'Il prezzo è chiaro a inizio onboarding, prima di qualsiasi pagamento. Niente sorprese.',
                        },
                        {
                            icon: CheckCircle2,
                            titolo: 'Verifica entro 24-48h',
                            desc: 'Il nostro team verifica i documenti rapidamente. Se manca qualcosa te lo diciamo subito.',
                        },
                        {
                            icon: MessageCircle,
                            titolo: 'Supporto sempre disponibile',
                            desc: 'Chat, email o telefono. Qualsiasi dubbio, hai sempre qualcuno con cui parlare.',
                        },
                    ].map((c, i) => {
                        const Icon = c.icon;
                        return (
                            <div key={i} className="rounded-2xl p-6"
                                style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.06)' }}>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                                    style={{ background: '#22C55E15' }}>
                                    <Icon className="w-5 h-5" style={{ color: '#22C55E' }} />
                                </div>
                                <h4 className="text-base font-semibold mb-2"
                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    {c.titolo}
                                </h4>
                                <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                    {c.desc}
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
                                Non sei sicuro <span className="italic" style={{ color: '#E8B59C' }}>di quale sia il percorso giusto?</span>
                            </h3>
                            <p className="text-base" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}>
                                Scrivici. Ti aiutiamo a capire qual è il prodotto adatto a te in pochi minuti.
                            </p>
                        </div>
                    </div>
                    <Link to="/supporto" className="flex-shrink-0">
                        <button className="group flex items-center gap-3 px-6 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                            style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}>
                            Parla con noi
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
    return (
        <>
            <Helmet>
                <title>Inizia ora — CRIA</title>
                <meta name="description" content="Tre punti di ingresso, in base a cosa ti serve. Inizia come locatore, verifica un inquilino o scopri cosa cambia se sei un inquilino." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300,50;0,9..144,400,50;0,9..144,500,50;0,9..144,600,50;0,9..144,700,50;1,9..144,300,50;1,9..144,400,50&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            </Helmet>

            <div style={{ background: '#FFFFFF', fontFamily: fontBody }}>
                <VetrinaHeader />
                <Hero />
                <TrePercorsi />
                <CosaTroviDopo />
                <HaiDubbi />
                <VetrinaFooter />
            </div>
        </>
    );
};

export default IniziaPagina;