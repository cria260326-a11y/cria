import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
    ArrowRight, ArrowUpRight, CheckCircle2, Plus,
    Sparkles, Lock, MessageCircle, FileText, Copy, Send, Check,
    TrendingUp, UserCheck, Shield
} from 'lucide-react';

import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => {
    const scrollToCondividi = () => {
        const el = document.getElementById('condividi');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: '#FFFFFF' }}>
            <div className="absolute top-32 right-0 w-1 h-72 rounded-full opacity-30" style={{ background: '#22C55E' }} />
            <div className="absolute top-32 right-3 w-1 h-48 rounded-full opacity-30" style={{ background: '#F59E0B' }} />
            <div className="absolute top-32 right-6 w-1 h-32 rounded-full opacity-30" style={{ background: '#EF4444' }} />

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
                <div className="grid lg:grid-cols-12 gap-12 items-center">

                    <div className="lg:col-span-7">
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
                                Per inquilini
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="leading-[0.95] tracking-tight mb-8"
                            style={{
                                fontFamily: fontHeader,
                                fontVariationSettings: fontSettingsSoft,
                                color: '#1A2D52',
                                fontSize: 'clamp(2.5rem, 5.5vw, 5rem)',
                                fontWeight: 400,
                                letterSpacing: '-0.03em',
                            }}
                        >
                            L'affidabilità diventa<br />
                            <span className="italic" style={{ color: '#C97B5C' }}>il tuo vantaggio.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-lg lg:text-xl max-w-xl mb-10 leading-relaxed"
                            style={{ fontFamily: fontBody, color: '#6B6B5E', fontWeight: 400 }}
                        >
                            Se paghi puntuale, su CRIA hai uno storico positivo che ti segue. La prossima casa la trovi prima, e il prossimo locatore si fida da subito.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-wrap gap-4"
                        >
                            <button onClick={scrollToCondividi} className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02] hover:shadow-2xl"
                                style={{ background: '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}>
                                Parlane al tuo locatore
                                <span className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                                    style={{ background: '#FFFFFF', color: '#1A2D52' }}>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                            </button>
                            <Link to="/supporto">
                                <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                                    style={{
                                        background: 'transparent',
                                        color: '#1A2D52',
                                        fontFamily: fontBody,
                                        border: '1.5px solid rgba(26, 45, 82, 0.2)',
                                    }}>
                                    Hai dubbi? Scrivici
                                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </button>
                            </Link>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="lg:col-span-5 relative"
                    >
                        <ScoreInquilinoCard />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── CARD SCORE PERSONALE ─────────────────────────────────────────────────────
const ScoreInquilinoCard = () => {
    return (
        <div className="relative">
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-2xl p-7"
                style={{
                    background: '#FFFFFF',
                    boxShadow: '0 30px 80px -20px rgba(26, 45, 82, 0.18), 0 10px 30px -10px rgba(26, 45, 82, 0.1)',
                    border: '1px solid rgba(26, 45, 82, 0.06)',
                }}
            >
                <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                    Il tuo profilo CRIA
                </div>
                <div className="text-lg font-bold mb-6" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                    Sofia Martini
                </div>

                <div className="rounded-2xl p-6 text-center mb-5"
                    style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3" style={{ background: '#22C55E' }}>
                        <CheckCircle2 className="w-10 h-10" style={{ color: '#FFFFFF' }} />
                    </div>
                    <div className="text-2xl font-bold mb-1" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#166534' }}>
                        Affidabile
                    </div>
                    <div className="text-xs" style={{ color: '#15803D', fontFamily: fontBody }}>
                        Score 94/100 · ultimi 12 mesi
                    </div>
                </div>

                <div className="mb-4">
                    <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                        Pagamenti ultimi 12 mesi
                    </div>
                    <div className="flex gap-1">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="flex-1 h-7 rounded"
                                style={{ background: i === 8 ? '#F59E0B' : '#22C55E' }} />
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] pt-1.5" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                        <span>Mag '25</span>
                        <span>Apr '26</span>
                    </div>
                </div>

                <div className="p-3 rounded-lg flex items-start gap-2" style={{ background: '#F5F5F0' }}>
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#C97B5C' }} />
                    <p className="text-xs leading-relaxed" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                        Quando cerchi una nuova casa, questo storico ti precede. È il tuo biglietto da visita.
                    </p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute -bottom-5 -left-6 rounded-xl p-3 max-w-[200px]"
                style={{
                    background: '#1A2D52',
                    color: '#FFFFFF',
                    boxShadow: '0 20px 40px -10px rgba(26, 45, 82, 0.4)',
                }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
                        <CheckCircle2 className="w-4 h-4" style={{ color: '#22C55E' }} />
                    </div>
                    <div>
                        <div className="text-[9px] uppercase tracking-wider opacity-70" style={{ fontFamily: fontMono }}>Pagamento</div>
                        <div className="text-sm font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft }}>
                            Aprile · puntuale
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// ─── COSA È CRIA — propositiva, 30 secondi ───────────────────────────────────
const CosaECria = () => {
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
                    Cosa è CRIA
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
                    Un sistema dove <span className="italic" style={{ color: '#C97B5C' }}>la fiducia si vede.</span>
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="rounded-2xl p-8 lg:p-10"
                    style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.08)' }}
                >
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: TrendingUp, titolo: 'Tracciamento trasparente', desc: 'Ogni pagamento puntuale viene registrato. Mese dopo mese, costruisci il tuo storico positivo.' },
                            { icon: UserCheck, titolo: 'Score che cresce con te', desc: 'La regolarità si trasforma in un punteggio. Verde, giallo, rosso: semplice come un semaforo.' },
                            { icon: Sparkles, titolo: 'Storico che ti segue', desc: 'Quando cambi casa, il tuo storico positivo va con te. È il tuo biglietto da visita.' },
                        ].map((p, i) => {
                            const Icon = p.icon;
                            return (
                                <div key={i}>
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                                        style={{ background: '#22C55E15' }}>
                                        <Icon className="w-5 h-5" style={{ color: '#22C55E' }} />
                                    </div>
                                    <h4 className="text-base font-semibold mb-2"
                                        style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                        {p.titolo}
                                    </h4>
                                    <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                        {p.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// ─── I TUOI VANTAGGI ──────────────────────────────────────────────────────────
const TuoiVantaggi = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-xs uppercase tracking-[0.25em] mb-6"
                    style={{ fontFamily: fontMono, color: '#22C55E' }}
                >
                    Cosa ci guadagni
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="leading-[1.05] tracking-tight max-w-4xl mb-20"
                    style={{
                        fontFamily: fontHeader,
                        fontVariationSettings: fontSettingsSoft,
                        color: '#1A2D52',
                        fontSize: 'clamp(2rem, 5vw, 4rem)',
                        fontWeight: 400,
                    }}
                >
                    Tre vantaggi <span className="italic" style={{ color: '#22C55E' }}>concreti per te.</span>
                </motion.h2>

                <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
                    {[
                        {
                            num: '01',
                            titolo: 'Lo storico ti precede',
                            desc: 'Quando cerchi casa nuova, il prossimo locatore vede subito che paghi puntuale. Niente più buste paga, referenze, sospetti. Lo storico parla per te.',
                        },
                        {
                            num: '02',
                            titolo: 'Niente più diffidenza',
                            desc: 'Il tuo locatore attuale sa che paghi regolarmente perché lo vede in tempo reale. Basta dimostrare ogni mese di essere affidabile.',
                        },
                        {
                            num: '03',
                            titolo: 'Hai prove dalla tua parte',
                            desc: 'Se ricevi una segnalazione che non condividi, hai 7 giorni per contestare. Con ricevute, prove, e una procedura di verifica che tutela entrambi.',
                        },
                    ].map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8, delay: i * 0.15 }}
                        >
                            <div className="text-5xl mb-6 leading-none italic"
                                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#22C55E', fontWeight: 300 }}>
                                {p.num}
                            </div>
                            <h3 className="text-xl font-semibold mb-4 leading-tight"
                                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                {p.titolo}
                            </h3>
                            <p className="text-base leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                {p.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─── COSA VEDI TU — mockup dashboard inquilino ────────────────────────────────
const CosaVediTu = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-32" style={{ background: '#0F1B33' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <div className="grid lg:grid-cols-12 gap-12 items-center">

                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.6 }}
                            className="text-xs uppercase tracking-[0.25em] mb-6"
                            style={{ fontFamily: fontMono, color: '#E8B59C' }}
                        >
                            La tua dashboard
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8 }}
                            className="leading-[1.05] tracking-tight mb-6"
                            style={{
                                fontFamily: fontHeader,
                                fontVariationSettings: fontSettingsSoft,
                                color: '#FFFFFF',
                                fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                                fontWeight: 400,
                            }}
                        >
                            Tutto quello che ti riguarda, <span className="italic" style={{ color: '#E8B59C' }}>in un posto solo.</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg leading-relaxed mb-8"
                            style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                            Quando il tuo locatore attiva CRIA, anche tu hai il tuo accesso gratuito. Vedi le stesse identiche informazioni che vede lui di te.
                        </motion.p>

                        <ul className="space-y-3">
                            {[
                                'Stato dei tuoi pagamenti, mese per mese',
                                'Le segnalazioni che il locatore ha inserito',
                                'Il pulsante "Contesta" disponibile per 7 giorni',
                                'Lo storico per ogni immobile in cui hai vissuto',
                            ].map((c, j) => (
                                <li key={j} className="flex items-start gap-3 text-sm"
                                    style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.85)' }}>
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#E8B59C' }} />
                                    {c}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="lg:col-span-7"
                    >
                        <MockupDashboardInquilino />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

const MockupDashboardInquilino = () => {
    return (
        <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-2xl overflow-hidden"
            style={{
                background: '#FFFFFF',
                boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.5)',
            }}
        >
            <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.08)' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
                <div className="ml-auto text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                    cria.it/dashboard/inquilino
                </div>
            </div>

            <div className="p-6 space-y-5">
                <div className="pb-4" style={{ borderBottom: '1px solid rgba(26, 45, 82, 0.08)' }}>
                    <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                        Il mio contratto
                    </div>
                    <div className="text-lg font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                        Via Roma 42, Milano
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                        locatore: Studio Conti · Canone € 1.200/mese
                    </div>
                </div>

                <div className="p-4 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
                        <div className="flex-1">
                            <div className="text-sm font-semibold mb-1" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#166534' }}>
                                Il tuo locatore ha confermato il pagamento di Aprile
                            </div>
                            <div className="text-xs" style={{ color: '#15803D', fontFamily: fontBody }}>
                                € 1.200 · 03/04/2026 · contrassegnato come <strong>puntuale</strong>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full"
                                    style={{ background: '#FFFFFF', color: '#6B6B5E', fontFamily: fontMono, border: '1px solid rgba(26, 45, 82, 0.1)' }}>
                                    Contestabile fino al 10/04
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                        Il tuo storico ultimi 12 mesi
                    </div>
                    <div className="flex gap-1 mb-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="flex-1 h-6 rounded"
                                style={{ background: i === 8 ? '#F59E0B' : '#22C55E' }} />
                        ))}
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="text-[10px]" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                            Mag '25 → Apr '26
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
                            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#166534', fontFamily: fontMono }}>
                                Score Affidabile
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                    <button className="py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                        style={{ background: '#F5F5F0', color: '#1A2D52', fontFamily: fontBody }}>
                        <FileText className="w-3.5 h-3.5" /> Scarica PDF
                    </button>
                    <button className="py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                        style={{ background: '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}>
                        <MessageCircle className="w-3.5 h-3.5" /> Chat assistenza
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// ─── COME FUNZIONA PER TE — flusso operativo ─────────────────────────────────
const ComeFunzionaPerTe = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const steps = [
        { num: '01', titolo: 'Il tuo locatore attiva CRIA', desc: 'Per il vostro contratto, sceglie il prodotto CRIA che preferisce.' },
        { num: '02', titolo: 'Ricevi il tuo accesso gratuito', desc: 'Email di invito con le credenziali. Per te non c\'è alcun costo.' },
        { num: '03', titolo: 'Vedi i tuoi pagamenti tracciati', desc: 'Ogni mese vedi le segnalazioni del locatore. Hai 7 giorni per contestare se serve.' },
        { num: '04', titolo: 'Costruisci il tuo storico', desc: 'Mese dopo mese, lo storico positivo cresce. È il tuo biglietto da visita.' },
    ];

    return (
        <section ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <div className="mb-16">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-xs uppercase tracking-[0.25em] mb-6"
                        style={{ fontFamily: fontMono, color: '#C97B5C' }}
                    >
                        Come funziona per te
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                        className="leading-[1.05] tracking-tight max-w-4xl"
                        style={{
                            fontFamily: fontHeader,
                            fontVariationSettings: fontSettingsSoft,
                            color: '#1A2D52',
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: 400,
                        }}
                    >
                        Da invito ad attivo, in <span className="italic" style={{ color: '#C97B5C' }}>4 step.</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                    {steps.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: i * 0.08 }}
                            className="relative"
                        >
                            <div className="p-5 rounded-2xl h-full transition-all hover:shadow-lg hover:-translate-y-1"
                                style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}>

                                <div className="text-2xl mb-3 leading-none italic"
                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#C97B5C', fontWeight: 400 }}>
                                    {s.num}
                                </div>

                                <h3 className="text-base font-semibold mb-2 leading-tight"
                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    {s.titolo}
                                </h3>

                                <p className="text-xs leading-relaxed"
                                    style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                    {s.desc}
                                </p>
                            </div>

                            {i < 3 && (
                                <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full items-center justify-center"
                                    style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}>
                                    <ArrowRight className="w-3 h-3" style={{ color: '#C97B5C' }} />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─── FAQ — focus vantaggi ─────────────────────────────────────────────────────
const FAQ = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });
    const [open, setOpen] = useState(0);

    const faqs = [
        {
            q: 'Quanto mi costa essere su CRIA?',
            a: 'Niente. Per te è completamente gratuito. È il locatore che attiva e paga il servizio. Tu hai accesso alla tua dashboard, ai tuoi dati, alle contestazioni e al tuo storico senza alcun costo.',
        },
        {
            q: 'Come uso il mio storico per la prossima casa?',
            a: 'Quando cerchi un nuovo affitto, puoi scaricare un PDF ufficiale con il tuo score CRIA e lo storico degli ultimi 12 mesi. Lo presenti al nuovo locatore come faresti con buste paga e referenze, ma con dati oggettivi e verificabili.',
        },
        {
            q: 'Cosa succede se non sono d\'accordo con una segnalazione?',
            a: 'Hai 7 giorni dalla segnalazione per inserire una contestazione. Puoi allegare ricevute, screenshot, documenti, e spiegare la tua versione. Il nostro team analizza le evidenze e comunica l\'esito a entrambi entro 14 giorni.',
        },
        {
            q: 'Cambio casa. Il mio storico mi segue?',
            a: 'Sì. Il tuo storico positivo è tuo, non del locatore. Quando cambi contratto, lo porti con te. Il vecchio locatore non vedrà più i tuoi nuovi dati, e il nuovo partirà da zero ma vedrà il tuo storico aggregato come riferimento.',
        },
        {
            q: 'Il mio locatore non usa CRIA. Posso chiederlo io?',
            a: 'Certo, ed è anzi una buona idea. Se sei un inquilino regolare, hai tutto da guadagnare nel chiedere al tuo locatore di attivare CRIA. Più sotto trovi un messaggio già pronto da inviargli.',
        },
    ];

    return (
        <section ref={ref} className="py-32" style={{ background: '#F5F5F0' }}>
            <div className="max-w-[1000px] mx-auto px-6 lg:px-12">

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-xs uppercase tracking-[0.25em] mb-6"
                    style={{ fontFamily: fontMono, color: '#C97B5C' }}
                >
                    Domande frequenti
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="leading-[1.05] tracking-tight mb-12"
                    style={{
                        fontFamily: fontHeader,
                        fontVariationSettings: fontSettingsSoft,
                        color: '#1A2D52',
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        fontWeight: 400,
                    }}
                >
                    Le domande che <span className="italic" style={{ color: '#C97B5C' }}>ti stai facendo.</span>
                </motion.h2>

                <div className="space-y-3">
                    {faqs.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: i * 0.08 }}
                            className="rounded-2xl overflow-hidden"
                            style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}
                        >
                            <button
                                onClick={() => setOpen(open === i ? -1 : i)}
                                className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[#F5F5F0]"
                            >
                                <span className="text-base lg:text-lg font-semibold leading-tight"
                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    {f.q}
                                </span>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform"
                                    style={{ background: open === i ? '#1A2D52' : 'rgba(26, 45, 82, 0.06)', transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                                    <Plus className="w-4 h-4" style={{ color: open === i ? '#FFFFFF' : '#1A2D52' }} />
                                </div>
                            </button>
                            {open === i && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="px-5 pb-5"
                                >
                                    <p className="text-base leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                        {f.a}
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─── PRIVACY — striscia compatta ──────────────────────────────────────────────
const PrivacyStriscia = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    return (
        <section ref={ref} className="py-12" style={{ background: '#FFFFFF', borderTop: '1px solid rgba(26, 45, 82, 0.06)', borderBottom: '1px solid rgba(26, 45, 82, 0.06)' }}>
            <div className="max-w-[1100px] mx-auto px-6 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col md:flex-row items-start md:items-center gap-4"
                >
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#1A2D5210' }}>
                            <Lock className="w-4 h-4" style={{ color: '#1A2D52' }} />
                        </div>
                        <div className="text-sm font-semibold uppercase tracking-wider" style={{ fontFamily: fontMono, color: '#1A2D52' }}>
                            Privacy
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                        Raccogliamo solo dati di pagamento (data, importo, regolarità) — nessun dato bancario, nessuna busta paga. I tuoi dati sono visibili solo a te e al tuo locatore attuale, conservati per 24 mesi, conformi al GDPR. Puoi richiederne accesso o cancellazione in qualsiasi momento.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

// ─── CTA — PARLANE AL TUO locatore ──────────────────────────────────────────
const CondividiConlocatore = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const [copied, setCopied] = useState(false);

    const messaggio = `Ciao, ho scoperto CRIA — è la prima centrale rischi italiana dedicata agli affitti. Aiuta a tracciare i pagamenti in modo trasparente, sia per te come locatore che per me come inquilino. Ti lascio il link nel caso ti interessi: https://cria.it/per-locatori`;

    const handleCopy = () => {
        navigator.clipboard.writeText(messaggio);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(messaggio)}`;
    const mailtoLink = `mailto:?subject=Ti%20presento%20CRIA&body=${encodeURIComponent(messaggio)}`;

    return (
        <section id="condividi" ref={ref} className="py-32 relative overflow-hidden" style={{ background: '#1A2D52' }}>
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(232, 181, 156, 0.4), transparent 70%)' }} />
                <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2), transparent 70%)' }} />
            </div>

            <div className="max-w-[1100px] mx-auto px-6 lg:px-12 relative">

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-xs uppercase tracking-[0.25em] mb-6"
                    style={{ fontFamily: fontMono, color: '#E8B59C' }}
                >
                    Ti convince?
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="leading-[1.05] tracking-tight mb-6"
                    style={{
                        fontFamily: fontHeader,
                        fontVariationSettings: fontSettingsSoft,
                        color: '#FFFFFF',
                        fontSize: 'clamp(2.25rem, 5vw, 4rem)',
                        fontWeight: 400,
                    }}
                >
                    Falla scoprire al <span className="italic" style={{ color: '#E8B59C' }}>tuo locatore.</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg lg:text-xl mb-10 max-w-2xl leading-relaxed"
                    style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}
                >
                    Su CRIA è il locatore che attiva il servizio. Se ti interessa avere uno storico positivo che ti segue, il primo passo è farglielo conoscere. Ecco un messaggio già pronto.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="rounded-2xl overflow-hidden mb-6"
                    style={{
                        background: '#FFFFFF',
                        boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(26, 45, 82, 0.08)' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#1A2D5215' }}>
                            <Send className="w-4 h-4" style={{ color: '#1A2D52' }} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                Messaggio pronto da inviare
                            </div>
                            <div className="text-[10px]" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                                Personalizzalo come preferisci
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <p className="text-sm leading-relaxed mb-6" style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                            {messaggio}
                        </p>

                        <div className="grid sm:grid-cols-3 gap-3">
                            <button
                                onClick={handleCopy}
                                className="group flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                                style={{
                                    background: copied ? '#22C55E' : '#1A2D52',
                                    color: '#FFFFFF',
                                    fontFamily: fontBody,
                                }}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copiato!' : 'Copia il messaggio'}
                            </button>

                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                                style={{
                                    background: '#22C55E',
                                    color: '#FFFFFF',
                                    fontFamily: fontBody,
                                }}
                            >
                                <MessageCircle className="w-4 h-4" />
                                Apri WhatsApp
                            </a>

                            <a
                                href={mailtoLink}
                                className="group flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                                style={{
                                    background: '#FFFFFF',
                                    color: '#1A2D52',
                                    fontFamily: fontBody,
                                    border: '1.5px solid rgba(26, 45, 82, 0.2)',
                                }}
                            >
                                <Send className="w-4 h-4" />
                                Invia per email
                            </a>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-center"
                >
                    <p className="text-sm" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.55)' }}>
                        Vuoi prima leggere tu cosa offre a un locatore?{' '}
                        <Link to="/per-locatori" className="font-semibold underline" style={{ color: '#E8B59C' }}>
                            Scopri la pagina dedicata
                        </Link>
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

// ─── PAGINA PRINCIPALE ────────────────────────────────────────────────────────
const PerInquiliniPage = () => {
    return (
        <>
            <Helmet>
                <title>Per inquilini — CRIA</title>
                <meta name="description" content="Se paghi puntuale, su CRIA hai uno storico positivo che ti segue. La prossima casa la trovi prima, e il prossimo locatore si fida da subito." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300,50;0,9..144,400,50;0,9..144,500,50;0,9..144,600,50;0,9..144,700,50;1,9..144,300,50;1,9..144,400,50&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            </Helmet>

            <div style={{ background: '#FFFFFF', fontFamily: fontBody }}>
                <VetrinaHeader activePage="prodotti" />
                <Hero />
                <CosaECria />
                <TuoiVantaggi />
                <CosaVediTu />
                <ComeFunzionaPerTe />
                <FAQ />
                <PrivacyStriscia />
                <CondividiConlocatore />
                <VetrinaFooter />
            </div>
        </>
    );
};

export default PerInquiliniPage;