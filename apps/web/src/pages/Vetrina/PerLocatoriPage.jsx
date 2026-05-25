import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';
import {
    ArrowRight, ArrowUpRight, CheckCircle2, AlertTriangle,
    XCircle, ChevronDown, Sparkles, Shield, Clock,
    FileText, CreditCard, Search, Mail, User,
    Building2, Lock, Award, Plus, Users, TrendingUp,
    Zap, Phone, BarChart3, Briefcase, Headphones, Code
} from 'lucide-react';

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

<VetrinaHeader activePage="prodotti" />

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => {
    const scrollToProdotti = () => {
        const el = document.getElementById('prodotti');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: '#FFFFFF' }}>
            <div className="absolute top-32 right-0 w-1 h-72 rounded-full opacity-30" style={{ background: '#22C55E' }} />
            <div className="absolute top-32 right-3 w-1 h-48 rounded-full opacity-30" style={{ background: '#F59E0B' }} />
            <div className="absolute top-32 right-6 w-1 h-32 rounded-full opacity-30" style={{ background: '#EF4444' }} />

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
                <div className="grid lg:grid-cols-12 gap-12 items-center">

                    {/* Sinistra: testo */}
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
                                Per locatori e agenzie
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
                            Affitti gestiti<br />
                            senza pensieri.<br />
                            <span className="italic" style={{ color: '#C97B5C' }}>Pagamenti garantiti.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-lg lg:text-xl max-w-xl mb-10 leading-relaxed"
                            style={{ fontFamily: fontBody, color: '#6B6B5E', fontWeight: 400 }}
                        >
                            Per chi possiede uno o cento immobili. Per chi vuole il controllo o vuole delegarlo a noi.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-wrap gap-4"
                        >
                            <Link to="/inizia">
                                <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02] hover:shadow-2xl"
                                    style={{ background: '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}>
                                    Inizia ora
                                    <span className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                                        style={{ background: '#FFFFFF', color: '#1A2D52' }}>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </button>
                            </Link>
                            <button onClick={scrollToProdotti} className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                                style={{
                                    background: 'transparent',
                                    color: '#1A2D52',
                                    fontFamily: fontBody,
                                    border: '1.5px solid rgba(26, 45, 82, 0.2)',
                                }}>
                                Vedi i prodotti
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </motion.div>
                    </div>

                    {/* Destra: card stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="lg:col-span-5 relative"
                    >
                        <HeroStats />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── HERO STATS card ─────────────────────────────────────────────────────────
const HeroStats = () => {
    return (
        <div className="relative">
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-2xl p-8"
                style={{
                    background: '#FFFFFF',
                    boxShadow: '0 30px 80px -20px rgba(26, 45, 82, 0.18), 0 10px 30px -10px rgba(26, 45, 82, 0.1)',
                    border: '1px solid rgba(26, 45, 82, 0.06)',
                }}
            >
                <div className="text-[10px] uppercase tracking-[0.2em] mb-6" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                    La fiducia di chi ci ha scelto
                </div>

                <div className="space-y-6">
                    {[
                        { num: '2.300+', label: 'locatori attivi', desc: 'Privati e agenzie in tutta Italia', color: '#1A2D52' },
                        { num: '€ 12,4M', label: 'Canoni gestiti', desc: 'Negli ultimi 12 mesi', color: '#22C55E' },
                        { num: '94%', label: 'Pagamenti regolari', desc: 'Tasso medio sui contratti CRIA', color: '#22C55E' },
                        { num: '4.7 / 5', label: 'Recensione media', desc: 'Su Trustpilot e Google', color: '#F59E0B' },
                    ].map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="flex items-center gap-4 pb-4"
                            style={{ borderBottom: i < 3 ? '1px solid rgba(26, 45, 82, 0.06)' : 'none' }}
                        >
                            <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: s.color }} />
                            <div className="flex-1">
                                <div className="text-2xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    {s.num}
                                </div>
                                <div className="text-sm font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: s.color }}>
                                    {s.label}
                                </div>
                                <div className="text-[11px] mt-0.5" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                                    {s.desc}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Card flottante */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute -bottom-6 -left-8 rounded-2xl p-4 max-w-[200px]"
                style={{
                    background: '#1A2D52',
                    color: '#FFFFFF',
                    boxShadow: '0 20px 40px -10px rgba(26, 45, 82, 0.4)',
                }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#22C55E' }} />
                    <span className="text-[10px] uppercase tracking-wider opacity-70" style={{ fontFamily: fontMono }}>
                        Marco B. · Milano
                    </span>
                </div>
                <div className="text-sm font-semibold leading-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft }}>
                    € 8.400 recuperati in 4 mesi
                </div>
            </motion.div>
        </div>
    );
};

// ─── PROBLEMI ─────────────────────────────────────────────────────────────────
const Problemi = () => {
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
                    style={{ fontFamily: fontMono, color: '#EF4444' }}
                >
                    I problemi che conosci
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
                    Affittare un immobile in Italia <span className="italic" style={{ color: '#EF4444' }}>è uno stress.</span> Ma non deve esserlo.
                </motion.h2>

                <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
                    {[
                        {
                            num: '01',
                            titolo: 'L\'inquilino non paga e tu sei solo',
                            problema: 'Solleciti, telefonate, mail. E intanto le rate del mutuo arrivano comunque.',
                            soluzione: 'Con CRIA Completo, ricevi il canone il giorno 5 di ogni mese. Anche se l\'inquilino è in ritardo, il problema è nostro.',
                        },
                        {
                            num: '02',
                            titolo: 'Non sai a chi affittare',
                            problema: 'Buste paga e referenze sono fragili. Non hai modo di verificare lo storico vero.',
                            soluzione: 'Con CRIA Verifica scopri se il potenziale inquilino è regolare. Score storico, niente buste paga truccate.',
                        },
                        {
                            num: '03',
                            titolo: 'Burocrazia e pratiche legali',
                            problema: 'Avvocati cari, raccomandate, sfratti che durano anni. Il danno cresce mentre aspetti.',
                            soluzione: 'Con CRIA Completo c\'è un avvocato dedicato incluso. Le contestazioni si chiudono in giorni, non in anni.',
                        },
                    ].map((p, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8, delay: i * 0.15 }}
                        >
                            <div className="text-5xl mb-6 leading-none italic"
                                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#EF4444', fontWeight: 300 }}>
                                {p.num}
                            </div>
                            <h3 className="text-xl font-semibold mb-4 leading-tight"
                                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                {p.titolo}
                            </h3>
                            <p className="text-base leading-relaxed mb-4" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                {p.problema}
                            </p>
                            <div className="p-4 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
                                    <p className="text-sm font-medium leading-relaxed" style={{ fontFamily: fontBody, color: '#15803D' }}>
                                        {p.soluzione}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─── PRIVATO vs AGENZIA ──────────────────────────────────────────────────────
// ─── 1 IMMOBILE O 1000 ───────────────────────────────────────────────────────
const ScalaConTe = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-32" style={{ background: '#F5F5F0' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <div className="grid lg:grid-cols-12 gap-12 items-center">

                    {/* Sinistra: testo */}
                    <div className="lg:col-span-5">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.6 }}
                            className="text-xs uppercase tracking-[0.25em] mb-6"
                            style={{ fontFamily: fontMono, color: '#C97B5C' }}
                        >
                            Per ogni dimensione
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8 }}
                            className="leading-[1.05] tracking-tight mb-8"
                            style={{
                                fontFamily: fontHeader,
                                fontVariationSettings: fontSettingsSoft,
                                color: '#1A2D52',
                                fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                                fontWeight: 400,
                            }}
                        >
                            Gestisci 1 o più immobili? <span className="italic" style={{ color: '#C97B5C' }}>Ti aiutiamo lo stesso.</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg leading-relaxed mb-6"
                            style={{ fontFamily: fontBody, color: '#6B6B5E' }}
                        >
                            CRIA è pensato per scalare con te. Che tu sia un privato con un solo immobile o un'agenzia che ne gestisce centinaia, il prodotto è lo stesso. Cambiano i numeri, non lo strumento.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="space-y-3"
                        >
                            {[
                                'Stessa dashboard, stessi strumenti',
                                'Niente limiti sul numero di immobili',
                                'Filtri e ricerca per orientarsi anche con tanti contratti',
                            ].map((c, j) => (
                                <div key={j} className="flex items-start gap-3 text-sm"
                                    style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
                                    {c}
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Destra: mockup dashboard con 3 immobili */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="lg:col-span-7"
                    >
                        <MockupImmobili />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── MOCKUP DASHBOARD CON 3 IMMOBILI ──────────────────────────────────────────
const MockupImmobili = () => {
    return (
        <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-2xl overflow-hidden"
            style={{
                background: '#FFFFFF',
                boxShadow: '0 30px 80px -20px rgba(26, 45, 82, 0.18), 0 10px 30px -10px rgba(26, 45, 82, 0.1)',
                border: '1px solid rgba(26, 45, 82, 0.06)',
            }}
        >
            {/* Top bar finestra */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.08)' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
                <div className="ml-auto text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                    cria.it/dashboard/immobili
                </div>
            </div>

            <div className="p-6 lg:p-8 space-y-5">

                {/* Header con totali */}
                <div className="flex items-end justify-between flex-wrap gap-4 pb-5"
                    style={{ borderBottom: '1px solid rgba(26, 45, 82, 0.08)' }}>
                    <div>
                        <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                            I miei immobili
                        </div>
                        <div className="text-2xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                            3 attivi · €3.450 incassati
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="text-center">
                            <div className="text-lg font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#22C55E' }}>1</div>
                            <div className="text-[9px] uppercase tracking-wider" style={{ color: '#6B6B5E', fontFamily: fontMono }}>regolari</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#F59E0B' }}>1</div>
                            <div className="text-[9px] uppercase tracking-wider" style={{ color: '#6B6B5E', fontFamily: fontMono }}>ritardo</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#EF4444' }}>1</div>
                            <div className="text-[9px] uppercase tracking-wider" style={{ color: '#6B6B5E', fontFamily: fontMono }}>allerta</div>
                        </div>
                    </div>
                </div>

                {/* Lista immobili */}
                <div className="space-y-3">
                    {[
                        {
                            addr: 'Via Roma 42',
                            city: 'Milano',
                            tenant: 'Sofia Martini',
                            status: 'verde',
                            statusLabel: 'Regolare',
                            importo: '€ 1.200',
                            meta: 'Aprile 2026 · puntuale',
                        },
                        {
                            addr: 'Corso Venezia 18',
                            city: 'Milano',
                            tenant: 'Luca Romano',
                            status: 'giallo',
                            statusLabel: 'In ritardo',
                            importo: '€ 1.050',
                            meta: 'Aprile 2026 · 8 giorni di ritardo',
                        },
                        {
                            addr: 'Piazza Navona 23',
                            city: 'Roma',
                            tenant: 'Marco Esposito',
                            status: 'rosso',
                            statusLabel: 'Allerta',
                            importo: '€ 1.200',
                            meta: 'Aprile 2026 · pagamento mancato',
                        },
                    ].map((im, i) => {
                        const colors = { verde: '#22C55E', giallo: '#F59E0B', rosso: '#EF4444' };
                        const bgColors = { verde: '#F0FDF4', giallo: '#FEF3C7', rosso: '#FEE2E2' };

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.15 }}
                                className="flex items-center gap-4 p-4 rounded-xl transition-all hover:shadow-md"
                                style={{
                                    background: '#FFFFFF',
                                    border: `1px solid ${colors[im.status]}25`,
                                }}
                            >
                                {/* Indicatore colore verticale */}
                                <div className="w-1 h-14 rounded-full flex-shrink-0" style={{ background: colors[im.status] }} />

                                {/* Info immobile */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-base font-semibold leading-tight"
                                        style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                        {im.addr}
                                    </div>
                                    <div className="text-xs mt-0.5" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                                        {im.city} · {im.tenant}
                                    </div>
                                </div>

                                {/* Importo + meta */}
                                <div className="text-right hidden sm:block">
                                    <div className="text-base font-bold"
                                        style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: colors[im.status] }}>
                                        {im.importo}
                                    </div>
                                    <div className="text-[10px]" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                                        {im.meta}
                                    </div>
                                </div>

                                {/* Badge stato */}
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                                    style={{ background: bgColors[im.status], color: colors[im.status], fontFamily: fontMono }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors[im.status] }} />
                                    {im.statusLabel}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer: hint scalabilità */}
                <div className="flex items-center justify-between pt-4 text-[11px]"
                    style={{ borderTop: '1px solid rgba(26, 45, 82, 0.08)', color: '#6B6B5E', fontFamily: fontBody }}>
                    <span>Visualizzando 3 di 3 immobili</span>
                    <span style={{ fontFamily: fontMono, color: '#C97B5C' }}>
                        Filtri · Ordina · Esporta
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

// ─── PRODOTTI P1 vs P2 ────────────────────────────────────────────────────────
const Prodotti = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="prodotti" ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-xs uppercase tracking-[0.25em] mb-6"
                    style={{ fontFamily: fontMono, color: '#C97B5C' }}
                >
                    I prodotti per te
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="leading-[1.05] tracking-tight max-w-4xl mb-6"
                    style={{
                        fontFamily: fontHeader,
                        fontVariationSettings: fontSettingsSoft,
                        color: '#1A2D52',
                        fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                        fontWeight: 400,
                    }}
                >
                    Due prodotti, <span className="italic" style={{ color: '#C97B5C' }}>una sola filosofia.</span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg max-w-2xl mb-16"
                    style={{ fontFamily: fontBody, color: '#6B6B5E' }}
                >
                    Scegli quanto vuoi delegare. Mantieni il controllo o lascia tutto a noi: in entrambi i casi tracciamo, proteggiamo, semplifichiamo.
                </motion.p>

                {/* 2 card prodotto */}
                <div className="grid lg:grid-cols-2 gap-6 mb-16">

                    {/* P1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="rounded-3xl p-8 lg:p-10 relative"
                        style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
                            <span className="text-xs uppercase tracking-wider" style={{ fontFamily: fontMono, color: '#22C55E' }}>
                                Per locatori privati
                            </span>
                        </div>

                        <h3 className="text-3xl font-bold mb-2 leading-tight"
                            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                            CRIA Gestione
                        </h3>
                        <p className="text-lg italic mb-8"
                            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#22C55E', fontWeight: 300 }}>
                            Tu gestisci, noi diamo gli strumenti.
                        </p>

                        <ul className="space-y-3 mb-8">
                            {[
                                'Tracciamento pagamenti con segnalazioni mensili',
                                'Sistema contestazioni integrato a tutela di entrambe le parti',
                                'Score inquilino aggiornato in tempo reale',
                                'Report PDF scaricabili in qualsiasi momento',
                                'Chat assistenza con tempi rapidi',
                            ].map((c, j) => (
                                <li key={j} className="flex items-start gap-3 text-sm"
                                    style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
                                    {c}
                                </li>
                            ))}
                        </ul>

                        <Link to="/come-funziona#cria-gestione">
                            <button className="group w-full py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                style={{
                                    background: 'transparent',
                                    color: '#1A2D52',
                                    border: '1.5px solid rgba(26, 45, 82, 0.2)',
                                    fontFamily: fontBody,
                                }}>
                                Scopri CRIA Gestione
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                            </button>
                        </Link>
                    </motion.div>

                    {/* P2 - featured */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="rounded-3xl p-8 lg:p-10 relative"
                        style={{ background: '#1A2D52', color: '#FFFFFF' }}
                    >
                        <div className="absolute -top-3 right-8 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: '#C97B5C', color: '#FFFFFF', fontFamily: fontMono }}>
                            ★ Più scelto
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-3 h-3 rounded-full" style={{ background: '#E8B59C' }} />
                            <span className="text-xs uppercase tracking-wider" style={{ fontFamily: fontMono, color: '#E8B59C' }}>
                                Per chi vuole zero pensieri
                            </span>
                        </div>

                        <h3 className="text-3xl font-bold mb-2 leading-tight"
                            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF' }}>
                            CRIA Completo
                        </h3>
                        <p className="text-lg italic mb-8"
                            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#E8B59C', fontWeight: 300 }}>
                            Noi gestiamo, tu ricevi puntualmente.
                        </p>

                        <ul className="space-y-3 mb-8">
                            {[
                                'Pagamento garantito ogni mese il giorno 5',
                                'Recupero crediti incluso senza costi extra',
                                'Avvocato CRIA dedicato per contestazioni',
                                'Verifica preventiva inquilino inclusa',
                                'Onboarding dedicato e configurazione su misura',
                            ].map((c, j) => (
                                <li key={j} className="flex items-start gap-3 text-sm"
                                    style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.85)' }}>
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#E8B59C' }} />
                                    {c}
                                </li>
                            ))}
                        </ul>

                        <Link to="/come-funziona#cria-completo">
                            <button className="group w-full py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                                style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}>
                                Scopri CRIA Completo
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                            </button>
                        </Link>
                    </motion.div>
                </div>

                {/* Tabella comparativa rapida */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ background: '#F5F5F0', border: '1px solid rgba(26, 45, 82, 0.08)' }}
                >
                    <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(26, 45, 82, 0.08)' }}>
                        <p className="text-xs uppercase tracking-[0.2em]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                            Quale fa per te? In 5 punti.
                        </p>
                    </div>

                    {[
                        { feature: 'Tracciamento pagamenti', p1: 'Tu segnali ogni mese', p2: 'CRIA gestisce direttamente' },
                        { feature: 'Pagamento garantito', p1: 'No', p2: 'Sì — il giorno 5 di ogni mese' },
                        { feature: 'Recupero crediti', p1: 'Su richiesta', p2: 'Incluso, senza costi extra' },
                        { feature: 'Avvocato dedicato', p1: 'No', p2: 'Sì, per le contestazioni' },
                        { feature: 'Tipo di gestione', p1: 'Self-service', p2: 'Full-service' },
                    ].map((r, i) => (
                        <div key={i} className="grid grid-cols-3 px-6 py-4 hover:bg-white transition-colors text-sm"
                            style={{ borderBottom: i < 4 ? '1px solid rgba(26, 45, 82, 0.06)' : 'none' }}>
                            <div className="font-medium" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                                {r.feature}
                            </div>
                            <div className="text-center" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                {r.p1}
                            </div>
                            <div className="text-center font-semibold" style={{ fontFamily: fontBody, color: '#22C55E' }}>
                                {r.p2}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// ─── CASE STUDY ───────────────────────────────────────────────────────────────
const CaseStudy = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const stories = [
        {
            tipo: 'Privato · Milano',
            nome: 'Marco B.',
            ruolo: 'locatore, 5 immobili',
            titolo: 'Ha recuperato € 8.400 in 4 mesi',
            racconto: 'Tre inquilini in ritardo cronico. Marco aveva provato con avvocati per due anni senza successo. Con CRIA Completo, in 4 mesi: 1 contestazione risolta a suo favore, 2 inquilini rientrati con piani di rientro concordati, € 8.400 totali recuperati.',
            stats: [
                { num: '€ 8.400', label: 'Recuperati' },
                { num: '4 mesi', label: 'Tempo medio' },
                { num: '3', label: 'Casi risolti' },
            ],
            colore: '#22C55E',
            icon: TrendingUp,
        },
        {
            tipo: 'Agenzia · Roma',
            nome: 'Studio Conti',
            ruolo: 'Agenzia immobiliare, 47 contratti',
            titolo: 'Ha ridotto del 65% il tempo di gestione',
            racconto: 'Studio Conti gestisce 47 contratti per altrettanti proprietari. Prima di CRIA, 3 persone full-time per gestire pagamenti, solleciti, contestazioni. Oggi: 1 persona, integrazione API col loro CRM, e i clienti vedono in tempo reale lo stato dei loro immobili. Crescita del fatturato del 28% nello stesso anno.',
            stats: [
                { num: '−65%', label: 'Tempo gestione' },
                { num: '+28%', label: 'Fatturato' },
                { num: '47', label: 'Contratti gestiti' },
            ],
            colore: '#1A2D52',
            icon: Briefcase,
        },
    ];

    return (
        <section ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-xs uppercase tracking-[0.25em] mb-6"
                    style={{ fontFamily: fontMono, color: '#C97B5C' }}
                >
                    Storie di successo
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
                        fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                        fontWeight: 400,
                    }}
                >
                    Risultati reali, <span className="italic" style={{ color: '#C97B5C' }}>numeri concreti.</span>
                </motion.h2>

                <div className="space-y-8">
                    {stories.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.8, delay: i * 0.2 }}
                                className="grid lg:grid-cols-12 gap-8 items-center rounded-3xl p-8 lg:p-12"
                                style={{
                                    background: i === 1 ? '#1A2D52' : '#F5F5F0',
                                    color: i === 1 ? '#FFFFFF' : '#1A1A1A',
                                }}
                            >
                                {/* Sinistra: testo */}
                                <div className="lg:col-span-7">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ background: i === 1 ? 'rgba(232, 181, 156, 0.15)' : `${s.colore}15` }}>
                                            <Icon className="w-5 h-5" style={{ color: i === 1 ? '#E8B59C' : s.colore }} />
                                        </div>
                                        <span className="text-xs uppercase tracking-wider"
                                            style={{ fontFamily: fontMono, color: i === 1 ? '#E8B59C' : s.colore }}>
                                            {s.tipo}
                                        </span>
                                    </div>

                                    <h3 className="text-3xl font-bold mb-4 leading-tight"
                                        style={{
                                            fontFamily: fontHeader,
                                            fontVariationSettings: fontSettingsSoft,
                                            color: i === 1 ? '#FFFFFF' : '#1A2D52',
                                        }}>
                                        {s.titolo}
                                    </h3>

                                    <p className="text-base leading-relaxed mb-6"
                                        style={{
                                            fontFamily: fontBody,
                                            color: i === 1 ? 'rgba(255, 255, 255, 0.8)' : '#6B6B5E',
                                        }}>
                                        {s.racconto}
                                    </p>

                                    <div className="pt-4"
                                        style={{ borderTop: i === 1 ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(26, 45, 82, 0.1)' }}>
                                        <p className="text-sm font-semibold"
                                            style={{
                                                fontFamily: fontHeader,
                                                fontVariationSettings: fontSettingsSoft,
                                                color: i === 1 ? '#FFFFFF' : '#1A2D52',
                                            }}>
                                            {s.nome}
                                        </p>
                                        <p className="text-xs"
                                            style={{
                                                fontFamily: fontBody,
                                                color: i === 1 ? 'rgba(255, 255, 255, 0.5)' : '#6B6B5E',
                                            }}>
                                            {s.ruolo}
                                        </p>
                                    </div>
                                </div>

                                {/* Destra: stats grandi */}
                                <div className="lg:col-span-5 grid grid-cols-3 gap-4">
                                    {s.stats.map((stat, j) => (
                                        <div key={j} className="text-center">
                                            <div className="text-3xl lg:text-4xl font-bold mb-1 tabular-nums"
                                                style={{
                                                    fontFamily: fontHeader,
                                                    fontVariationSettings: fontSettingsSoft,
                                                    color: i === 1 ? '#E8B59C' : s.colore,
                                                }}>
                                                {stat.num}
                                            </div>
                                            <div className="text-[10px] uppercase tracking-wider"
                                                style={{
                                                    fontFamily: fontMono,
                                                    color: i === 1 ? 'rgba(255, 255, 255, 0.6)' : '#6B6B5E',
                                                }}>
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// ─── SEZIONE AGENZIE DEDICATA ─────────────────────────────────────────────────
const SezioneAgenzie = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const features = [
        { icon: BarChart3, titolo: 'Sconti volume', desc: 'Da -15% a -40% in base al numero di contratti gestiti.' },
        { icon: Headphones, titolo: 'Account manager', desc: 'Una persona dedicata in CRIA che ti segue. Email diretta, telefono, riunioni periodiche.' },
        { icon: Code, titolo: 'API REST', desc: 'Integra CRIA col tuo CRM o gestionale. Documentazione completa e sandbox di test.' },
        { icon: Zap, titolo: 'Onboarding white-glove', desc: 'Il nostro team ti aiuta a migrare i contratti esistenti. Niente configurazioni manuali.' },
        { icon: Award, titolo: 'SLA garantito', desc: 'Tempi di risposta entro 4 ore lavorative. 24/7 in caso di emergenze critiche.' },
        { icon: Building2, titolo: 'Branding personalizzato', desc: 'Comunicazioni e PDF con il logo della tua agenzia. I tuoi clienti vedono te, non noi.' },
    ];

    return (
        <section ref={ref} className="py-32" style={{ background: '#F5F5F0' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <div className="grid lg:grid-cols-12 gap-12 mb-16">
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.6 }}
                            className="text-xs uppercase tracking-[0.25em] mb-6"
                            style={{ fontFamily: fontMono, color: '#C97B5C' }}
                        >
                            Per agenzie e gestori professionali
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8 }}
                            className="leading-[1.05] tracking-tight mb-6"
                            style={{
                                fontFamily: fontHeader,
                                fontVariationSettings: fontSettingsSoft,
                                color: '#1A2D52',
                                fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                                fontWeight: 400,
                            }}
                        >
                            Per chi gestisce <span className="italic" style={{ color: '#C97B5C' }}>10 contratti o 500.</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg leading-relaxed max-w-2xl"
                            style={{ fontFamily: fontBody, color: '#6B6B5E' }}
                        >
                            Se gestisci affitti per professione, CRIA è il tuo nuovo strumento di lavoro. Ti diamo tutto quello che serve per scalare senza moltiplicare il personale.
                        </motion.p>
                    </div>
                </div>

                {/* Bento grid features */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                                className="rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                                style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.06)' }}
                            >
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                                    style={{ background: '#1A2D5210' }}>
                                    <Icon className="w-5 h-5" style={{ color: '#1A2D52' }} />
                                </div>
                                <h3 className="text-lg font-semibold mb-2"
                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    {f.titolo}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                    {f.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mt-12 rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                    style={{ background: '#1A2D52', color: '#FFFFFF' }}
                >
                    <div>
                        <h3 className="text-2xl lg:text-3xl font-bold mb-2"
                            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF', fontWeight: 400 }}>
                            Vuoi <span className="italic" style={{ color: '#E8B59C' }}>una demo personalizzata</span>?
                        </h3>
                        <p className="text-base" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}>
                            Prenota 30 minuti con un nostro commerciale. Ti facciamo vedere CRIA sul tuo caso reale.
                        </p>
                    </div>
                    <Link to="/supporto">
                        <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                            style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}>
                            <Phone className="w-4 h-4" />
                            Prenota una demo
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });
    const [open, setOpen] = useState(0);

    const faqs = [
        {
            q: 'Quanto costa davvero CRIA Gestione e CRIA Completo?',
            a: 'CRIA Gestione parte da € 19/mese per immobile (sconti volume da 3 immobili in su). CRIA Completo è personalizzato in base al canone e alla complessità: in media tra il 5% e l\'8% del canone mensile. Niente costi nascosti — il preventivo è chiaro fin dall\'inizio.',
        },
        {
            q: 'Posso disdire l\'abbonamento quando voglio?',
            a: 'Sì, sempre. Non ci sono vincoli di durata né penali di disdetta. Lo storico dell\'immobile rimane salvato per 24 mesi anche dopo la disdetta, in caso voglia rientrare.',
        },
        {
            q: 'E se l\'inquilino contesta una mia segnalazione?',
            a: 'Si apre una procedura interna di verifica. Entrambe le parti hanno 7 giorni per fornire prove (ricevute, screenshot, documenti). Il nostro team o un avvocato CRIA (se P2) decidono in base alle evidenze. Comunichiamo l\'esito a entrambi entro 14 giorni.',
        },
        {
            q: 'Che differenza c\'è con un property manager classico?',
            a: 'Un property manager si occupa di TUTTO: ricerca inquilini, manutenzione, controlli fisici. CRIA si concentra solo sulla parte finanziaria-legale-contrattuale. Costiamo molto meno e siamo ottimi per chi vuole solo "il pagamento garantito" senza delegare la cura dell\'immobile.',
        },
    ];

    return (
        <section ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
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
                    Le domande dei <span className="italic" style={{ color: '#C97B5C' }}>locatori come te.</span>
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

                <div className="text-center mt-12">
                    <Link to="/supporto">
                        <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02] mx-auto"
                            style={{
                                background: 'transparent',
                                color: '#1A2D52',
                                fontFamily: fontBody,
                                border: '1.5px solid rgba(26, 45, 82, 0.2)',
                            }}>
                            Vedi tutte le FAQ
                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

// ─── CTA FINALE ───────────────────────────────────────────────────────────────
const CTAFinale = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    return (
        <section ref={ref} className="py-32 relative overflow-hidden" style={{ background: '#1A2D52' }}>
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(201, 123, 92, 0.4), transparent 70%)' }} />
                <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2), transparent 70%)' }} />
            </div>

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
                <div className="max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-xs uppercase tracking-[0.25em] mb-6"
                        style={{ fontFamily: fontMono, color: '#E8B59C' }}
                    >
                        Affidati a CRIA
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8 }}
                        className="leading-[1.05] tracking-tight mb-10"
                        style={{
                            fontFamily: fontHeader,
                            fontVariationSettings: fontSettingsSoft,
                            color: '#FFFFFF',
                            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                            fontWeight: 400,
                        }}
                    >
                        Inizia oggi. <span className="italic" style={{ color: '#E8B59C' }}>Noi facciamo il resto.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl mb-12 max-w-2xl leading-relaxed"
                        style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                        La registrazione è gratuita. Procedi al tuo ritmo: scegli il prodotto, carica i documenti, e inizia quando sei pronto.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-wrap gap-4"
                    >
                        <Link to="/inizia">
                            <button className="group flex items-center gap-3 px-8 py-5 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                                style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}>
                                Inizia ora — è gratis
                                <span className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                                    style={{ background: '#1A2D52', color: '#FFFFFF' }}>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                            </button>
                        </Link>
                        <Link to="/supporto">
                            <button className="group flex items-center gap-3 px-8 py-5 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                                style={{
                                    background: 'transparent',
                                    color: '#FFFFFF',
                                    fontFamily: fontBody,
                                    border: '1.5px solid rgba(255, 255, 255, 0.3)',
                                }}>
                                Parla con noi
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── FOOTER ───────────────────────────────────────────────────────────────────
const Footer = () => {
    return (
        <footer className="py-12" style={{ background: '#0F1B33', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
                    <div className="col-span-2 md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#1A2D52', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                                    <path d="M12 3 L4 9 L4 20 L20 20 L20 9 Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                                    <circle cx="12" cy="11" r="1.3" fill="#22C55E" />
                                    <circle cx="12" cy="14.5" r="1.3" fill="#F59E0B" />
                                    <circle cx="12" cy="18" r="1.3" fill="#EF4444" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-lg font-bold tracking-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF' }}>CRIA</div>
                                <div className="text-[8px] uppercase tracking-[0.18em] mt-0.5" style={{ color: 'rgba(232, 181, 156, 0.7)', fontFamily: fontMono }}>Centrale Rischi Italia Affitti</div>
                            </div>
                        </Link>
                        <p className="text-xs leading-relaxed mb-4 max-w-xs" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.55)' }}>
                            La prima centrale rischi italiana dedicata agli affitti.
                        </p>
                        <div className="flex gap-2">
                            {['LK', 'IG', 'X'].map(s => (
                                <a key={s} href="#" className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors hover:bg-[#FFFFFF] hover:text-[#1A2D52]"
                                    style={{ border: '1px solid rgba(255, 255, 255, 0.15)', color: 'rgba(255, 255, 255, 0.7)', fontFamily: fontMono }}>
                                    {s}
                                </a>
                            ))}
                        </div>
                    </div>

                    {[
                        {
                            titolo: 'Prodotti', link: [
                                { l: 'Per locatori', to: '/per-locatori' },
                                { l: 'Per inquilini', to: '/per-inquilini' },
                                { l: 'CRIA Verifica', to: '/verifica' },
                            ]
                        },
                        {
                            titolo: 'Risorse', link: [
                                { l: 'Come funziona', to: '/come-funziona' },
                                { l: 'FAQ e contatti', to: '/supporto' },
                                { l: 'Inizia ora', to: '/inizia' },
                            ]
                        },
                        {
                            titolo: 'Account', link: [
                                { l: 'Accedi', to: '/login' },
                                { l: 'Registrati', to: '/signup' },
                            ]
                        },
                        {
                            titolo: 'Legali', link: [
                                { l: 'Privacy', to: '/privacy' },
                                { l: 'Termini', to: '/termini' },
                                { l: 'Cookie', to: '/cookie' },
                            ]
                        },
                    ].map(col => (
                        <div key={col.titolo}>
                            <p className="text-[10px] uppercase tracking-wider mb-3 font-semibold" style={{ fontFamily: fontMono, color: 'rgba(232, 181, 156, 0.8)' }}>
                                {col.titolo}
                            </p>
                            <ul className="space-y-2">
                                {col.link.map(l => (
                                    <li key={l.l}>
                                        <Link to={l.to} className="text-xs transition-colors hover:text-[#FFFFFF]" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.6)' }}>
                                            {l.l}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-6 flex flex-col sm:flex-row justify-between gap-3 items-center" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <p className="text-[10px]" style={{ fontFamily: fontMono, color: 'rgba(255, 255, 255, 0.4)' }}>
                        © 2026 CRIA · Tutti i diritti riservati · P.IVA 12345678901
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider" style={{ fontFamily: fontMono, color: 'rgba(255, 255, 255, 0.4)' }}>
                            Made in
                        </span>
                        <span className="text-xs font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: 'rgba(255, 255, 255, 0.7)' }}>
                            Italia 🇮🇹
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// ─── PAGINA PRINCIPALE ────────────────────────────────────────────────────────
const PerLocatoriPage = () => {
    return (
        <>
            <Helmet>
                <title>Per locatori e agenzie — CRIA</title>
                <meta name="description" content="Affitti gestiti senza pensieri, pagamenti garantiti. CRIA è la piattaforma per locatori privati e agenzie immobiliari che vogliono semplificare la gestione dei loro contratti." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300,50;0,9..144,400,50;0,9..144,500,50;0,9..144,600,50;0,9..144,700,50;1,9..144,300,50;1,9..144,400,50&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            </Helmet>

            <div style={{ background: '#FFFFFF', fontFamily: fontBody }}>
                <VetrinaHeader activePage="prodotti" />
                <Hero />
                <Problemi />
                <ScalaConTe />
                <Prodotti />
                <CaseStudy />
                <FAQ />
                <CTAFinale />
                <Footer />
            </div>
        </>
    );
};

export default PerLocatoriPage;