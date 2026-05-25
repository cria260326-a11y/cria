import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
    ArrowRight, ArrowUpRight, CheckCircle2, AlertTriangle,
    XCircle, Search, Mail, Lock, Plus, Zap, FileText,
    CreditCard, ShieldCheck, Building2, Home, Users, Clock
} from 'lucide-react';

import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => {
    const scrollToEsito = () => {
        const el = document.getElementById('esito');
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
                            style={{ background: 'rgba(201, 123, 92, 0.08)', border: '1px solid rgba(201, 123, 92, 0.2)' }}>
                            <span className="relative flex w-2 h-2">
                                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style={{ background: '#C97B5C' }} />
                                <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: '#C97B5C' }} />
                            </span>
                            <span className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: '#C97B5C', fontFamily: fontMono }}>
                                CRIA Verifica
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
                            Scopri chi entrerà a casa Tua.<br />
                            <span className="italic" style={{ color: '#C97B5C' }}>Prima di firmare.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-lg lg:text-xl max-w-xl mb-10 leading-relaxed"
                            style={{ fontFamily: fontBody, color: '#6B6B5E', fontWeight: 400 }}
                        >
                            Score storico, regolarità pagamenti, esito documentato. Una sola domanda, una sola risposta — niente abbonamenti, niente vincoli.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-wrap gap-4 mb-12"
                        >
                            <Link to="/inizia">
                                <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02] hover:shadow-2xl"
                                    style={{ background: '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}>
                                    Verifica un inquilino
                                    <span className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                                        style={{ background: '#FFFFFF', color: '#1A2D52' }}>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </button>
                            </Link>
                            <button onClick={scrollToEsito} className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                                style={{
                                    background: 'transparent',
                                    color: '#1A2D52',
                                    fontFamily: fontBody,
                                    border: '1.5px solid rgba(26, 45, 82, 0.2)',
                                }}>
                                Vedi un esempio di esito
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </motion.div>

                        {/* Quick highlights */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.7 }}
                            className="grid grid-cols-3 gap-6 max-w-lg pt-8"
                            style={{ borderTop: '1px solid rgba(26, 45, 82, 0.1)' }}
                        >
                            {[
                                { icon: Clock, label: 'Esito in 48h' },
                                { icon: ShieldCheck, label: 'GDPR garantito' },
                                { icon: Zap, label: 'Pagamento singolo' },
                            ].map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: '#C97B5C15' }}>
                                            <Icon className="w-4 h-4" style={{ color: '#C97B5C' }} />
                                        </div>
                                        <span className="text-xs font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                                            {s.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="lg:col-span-5 relative"
                    >
                        <MockupEsitoMail />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── MOCKUP MAIL CON ESITO (HERO) ─────────────────────────────────────────────
const MockupEsitoMail = () => {
    return (
        <div className="relative">
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
                <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.08)' }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
                    <div className="ml-auto text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>Esito CRIA Verifica</div>
                </div>

                <div className="p-6 space-y-4" style={{ background: '#F5F5F0' }}>

                    <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid rgba(26, 45, 82, 0.08)' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#1A2D52' }}>
                            <Mail className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                esito@cria.it
                            </div>
                            <div className="text-[10px]" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                                04 Maggio 2026, ore 14:23
                            </div>
                        </div>
                    </div>

                    <div className="text-[10px] uppercase tracking-wider" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                        Esito verifica · #VR-2026-0042
                    </div>

                    <div className="text-base font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                        Verifica di Sofia Martini
                    </div>

                    <div className="p-5 rounded-xl text-center"
                        style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3" style={{ background: '#22C55E' }}>
                            <CheckCircle2 className="w-8 h-8" style={{ color: '#FFFFFF' }} />
                        </div>
                        <div className="text-xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#166534' }}>
                            Inquilino affidabile
                        </div>
                        <div className="text-xs mt-1" style={{ color: '#15803D', fontFamily: fontBody }}>
                            Score: 94/100 · ultimi 12 mesi
                        </div>
                    </div>

                    <div>
                        <div className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                            Storico pagamenti
                        </div>
                        <div className="flex gap-1">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="flex-1 h-6 rounded"
                                    style={{ background: i === 8 ? '#F59E0B' : '#22C55E' }} />
                            ))}
                        </div>
                    </div>

                    <div className="text-[10px] text-center pt-2" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                        PDF allegato · 3 pagine
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -top-4 -right-4 rounded-xl px-4 py-3"
                style={{
                    background: '#FFFFFF',
                    boxShadow: '0 15px 35px -8px rgba(26, 45, 82, 0.2)',
                    border: '1px solid rgba(26, 45, 82, 0.08)',
                }}
            >
                <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
                    <div>
                        <div className="text-[9px] uppercase tracking-wider" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                            Tempo medio
                        </div>
                        <div className="text-sm font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                            48 ore
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// ─── I 4 ESITI POSSIBILI ──────────────────────────────────────────────────────
const EsitiPossibili = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const esiti = [
        { color: '#22C55E', label: 'Verde', titolo: 'Affidabile', desc: 'Pagamenti regolari ultimi 12 mesi entro il giorno 5 di ogni mese.', icon: CheckCircle2 },
        { color: '#F59E0B', label: 'Giallo', titolo: 'In ritardo', desc: 'Pagamenti spesso oltre il giorno 5, ma entro il giorno 10. Storico stabile.', icon: AlertTriangle },
        { color: '#EF4444', label: 'Rosso', titolo: 'Irregolare', desc: 'Pagamenti saltuari o oltre il giorno 10. Possibili contestazioni aperte.', icon: XCircle },
        { color: '#6B6B5E', label: 'Nessun dato', titolo: 'Non disponibile', desc: 'La persona non risulta nel nostro database. Nessun precedente da segnalare.', icon: Search },
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
                            Cosa puoi ricevere
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
                            Quattro esiti, <span className="italic" style={{ color: '#C97B5C' }}>una decisione informata.</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg leading-relaxed max-w-2xl"
                            style={{ fontFamily: fontBody, color: '#6B6B5E' }}
                        >
                            Ogni verifica produce uno di questi quattro esiti. Anche "nessun dato" è una risposta utile: significa che non ci sono precedenti negativi da segnalare.
                        </motion.p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {esiti.map((e, i) => {
                        const Icon = e.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="rounded-2xl p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
                                style={{ background: '#FFFFFF', border: `1px solid ${e.color}25` }}
                            >
                                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 relative"
                                    style={{ background: `${e.color}15` }}>
                                    <Icon className="w-7 h-7" style={{ color: e.color }} />
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                                        className="absolute inset-0 rounded-full"
                                        style={{ border: `2px solid ${e.color}` }}
                                    />
                                </div>
                                <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: fontMono, color: e.color, fontWeight: 600 }}>
                                    {e.label}
                                </div>
                                <h3 className="text-xl font-bold mb-3"
                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    {e.titolo}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                    {e.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// ─── COME FUNZIONA — 4 step ──────────────────────────────────────────────────
const ComeFunziona = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const steps = [
        { num: '01', titolo: 'Acquista la verifica', desc: 'Pagamento singolo via Stripe. Niente abbonamenti, niente vincoli.', icon: CreditCard },
        { num: '02', titolo: 'Inserisci i dati', desc: 'Nome, cognome, codice fiscale della persona da verificare.', icon: Users },
        { num: '03', titolo: 'Carica i tuoi documenti', desc: 'Documento d\'identità tuo per la verifica GDPR.', icon: FileText },
        { num: '04', titolo: 'Ricevi l\'esito via mail', desc: 'Entro 48 ore ricevi un PDF firmato con score e storico.', icon: Mail },
    ];

    return (
        <section className="py-32" style={{ background: '#FFFFFF' }} ref={ref}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <div className="mb-16">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-xs uppercase tracking-[0.25em] mb-6"
                        style={{ fontFamily: fontMono, color: '#C97B5C' }}
                    >
                        Come funziona
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
                            fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                            fontWeight: 400,
                        }}
                    >
                        Da acquisto ad esito, in <span className="italic" style={{ color: '#C97B5C' }}>4 step.</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: i * 0.08 }}
                                className="relative"
                            >
                                <div className="p-5 rounded-2xl h-full transition-all hover:shadow-lg hover:-translate-y-1"
                                    style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}>

                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-2xl leading-none italic"
                                            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#C97B5C', fontWeight: 400 }}>
                                            {s.num}
                                        </div>
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                                            style={{ background: '#C97B5C15' }}>
                                            <Icon className="w-4 h-4" style={{ color: '#C97B5C' }} />
                                        </div>
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
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// ─── COSA CONTIENE L'ESITO — mockup PDF grande ────────────────────────────────
const CosaContieneEsito = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="esito" ref={ref} className="py-32" style={{ background: '#0F1B33' }}>
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
                            Il deliverable
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
                            Un PDF chiaro. <span className="italic" style={{ color: '#E8B59C' }}>Senza interpretazioni.</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg leading-relaxed mb-8"
                            style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                            L'esito arriva via mail con un PDF di 3 pagine, firmato digitalmente. Lo puoi conservare, stampare, o presentarlo come parte del tuo iter di valutazione.
                        </motion.p>

                        <ul className="space-y-3">
                            {[
                                'Dati anagrafici della persona verificata',
                                'Score complessivo (verde / giallo / rosso / nessun dato)',
                                'Storico pagamenti ultimi 12 mesi mese per mese',
                                'Eventuali contestazioni aperte o chiuse',
                                'Firma digitale CRIA per uso documentale',
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
                        <MockupPdfEsito />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── MOCKUP PDF DETTAGLIATO ──────────────────────────────────────────────────
const MockupPdfEsito = () => {
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
            {/* Top bar tipo PDF reader */}
            <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.08)', background: '#F5F5F0' }}>
                <FileText className="w-4 h-4" style={{ color: '#1A2D52' }} />
                <div className="text-xs font-semibold flex-1" style={{ fontFamily: fontMono, color: '#1A2D52' }}>
                    esito-VR-2026-0042.pdf
                </div>
                <div className="text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                    1 / 3
                </div>
            </div>

            <div className="p-7 space-y-5">

                {/* Header CRIA */}
                <div className="flex items-center justify-between pb-4" style={{ borderBottom: '2px solid #1A2D52' }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#1A2D52' }}>
                            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                                <path d="M12 3 L4 9 L4 20 L20 20 L20 9 Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                                <circle cx="12" cy="11" r="1.3" fill="#22C55E" />
                                <circle cx="12" cy="14.5" r="1.3" fill="#F59E0B" />
                                <circle cx="12" cy="18" r="1.3" fill="#EF4444" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-base font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                CRIA
                            </div>
                            <div className="text-[8px] uppercase tracking-[0.18em]" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                                Centrale Rischi Italia Affitti
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] uppercase tracking-wider" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                            Esito verifica
                        </div>
                        <div className="text-xs font-bold" style={{ fontFamily: fontMono, color: '#1A2D52' }}>
                            #VR-2026-0042
                        </div>
                    </div>
                </div>

                {/* Anagrafica */}
                <div>
                    <div className="text-[10px] uppercase tracking-wider mb-3" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                        Persona verificata
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                            <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>Nome e cognome</div>
                            <div className="text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>Sofia Martini</div>
                        </div>
                        <div>
                            <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>Codice fiscale</div>
                            <div className="text-sm font-semibold" style={{ fontFamily: fontMono, color: '#1A2D52' }}>MRTSFI88L42F205Z</div>
                        </div>
                        <div>
                            <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>Data verifica</div>
                            <div className="text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>04/05/2026</div>
                        </div>
                        <div>
                            <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>Richiedente</div>
                            <div className="text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>Marco B.</div>
                        </div>
                    </div>
                </div>

                {/* Esito principale */}
                <div className="p-5 rounded-xl text-center"
                    style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3" style={{ background: '#22C55E' }}>
                        <CheckCircle2 className="w-8 h-8" style={{ color: '#FFFFFF' }} />
                    </div>
                    <div className="text-xl font-bold mb-1" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#166534' }}>
                        Inquilino affidabile
                    </div>
                    <div className="text-sm font-semibold" style={{ color: '#15803D', fontFamily: fontBody }}>
                        Score 94/100
                    </div>
                </div>

                {/* Storico pagamenti */}
                <div>
                    <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                        Storico pagamenti · ultimi 12 mesi
                    </div>
                    <div className="flex gap-1 mb-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="flex-1 h-7 rounded"
                                style={{ background: i === 8 ? '#F59E0B' : '#22C55E' }} />
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px]" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                        <span>Mag '25</span>
                        <span>Apr '26</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }} />
                            <span style={{ fontFamily: fontBody, color: '#1A1A1A' }}>11 puntuali</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
                            <span style={{ fontFamily: fontBody, color: '#1A1A1A' }}>1 in ritardo</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }} />
                            <span style={{ fontFamily: fontBody, color: '#1A1A1A' }}>0 mancati</span>
                        </div>
                    </div>
                </div>

                {/* Note */}
                <div className="p-3 rounded-lg" style={{ background: '#F5F5F0' }}>
                    <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                        Note
                    </div>
                    <p className="text-xs leading-relaxed" style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                        Nessuna contestazione aperta. Storico stabile. Comportamento di pagamento conforme alla media degli inquilini "verdi" della piattaforma.
                    </p>
                </div>

                {/* Footer firma */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(26, 45, 82, 0.08)' }}>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
                        <div className="text-[10px]" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                            Firmato digitalmente · CRIA Verifica
                        </div>
                    </div>
                    <div className="text-[10px]" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                        Pag. 1 / 3
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ─── PER CHI È ────────────────────────────────────────────────────────────────
const PerChiE = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const casi = [
        {
            icon: Home,
            titolo: 'Privato che sta per affittare',
            desc: 'Hai un candidato per il tuo immobile. Vuoi sapere se in passato ha pagato regolarmente prima di firmare un contratto pluriennale.',
        },
        {
            icon: Building2,
            titolo: 'Agenzia in fase di screening',
            desc: 'Stai facendo selezione tra più candidati. Una verifica oggettiva ti aiuta a decidere senza basarti solo su buste paga e referenze.',
        },
        {
            icon: Users,
            titolo: 'Subentro o subaffitto',
            desc: 'Stai cedendo o subentrando in un contratto. Vuoi essere sicuro che chi ti precede o ti subentra abbia uno storico pulito.',
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
                    Per chi è pensato
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="leading-[1.05] tracking-tight max-w-4xl mb-16"
                    style={{
                        fontFamily: fontHeader,
                        fontVariationSettings: fontSettingsSoft,
                        color: '#1A2D52',
                        fontSize: 'clamp(2rem, 5vw, 3.75rem)',
                        fontWeight: 400,
                    }}
                >
                    Quando una <span className="italic" style={{ color: '#C97B5C' }}>verifica fa la differenza.</span>
                </motion.h2>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {casi.map((c, i) => {
                        const Icon = c.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="rounded-2xl p-7 transition-all hover:-translate-y-1 hover:shadow-lg"
                                style={{ background: '#F5F5F0', border: '1px solid rgba(26, 45, 82, 0.06)' }}
                            >
                                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
                                    style={{ background: '#C97B5C15' }}>
                                    <Icon className="w-5 h-5" style={{ color: '#C97B5C' }} />
                                </div>
                                <h3 className="text-lg font-semibold mb-3"
                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    {c.titolo}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                    {c.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Cross-sell: se invece vuoi gestire continuamente */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                    style={{ background: '#1A2D52', color: '#FFFFFF' }}
                >
                    <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(232, 181, 156, 0.15)' }}>
                            <Building2 className="w-5 h-5" style={{ color: '#E8B59C' }} />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-1"
                                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF' }}>
                                Vuoi <span className="italic" style={{ color: '#E8B59C' }}>gestire continuamente</span> i tuoi affitti?
                            </h4>
                            <p className="text-sm" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}>
                                Se hai immobili attivi e vuoi tracciamento mensile, contestazioni e dashboard, ti serve CRIA Gestione o Completo.
                            </p>
                        </div>
                    </div>
                    <Link to="/per-locatori">
                        <button className="group flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02] flex-shrink-0"
                            style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}>
                            Scopri i prodotti per locatori
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

// ─── PRIVACY GDPR ─────────────────────────────────────────────────────────────
const PrivacyGdpr = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-24" style={{ background: '#F5F5F0' }}>
            <div className="max-w-[1100px] mx-auto px-6 lg:px-12">

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-xs uppercase tracking-[0.25em] mb-6"
                    style={{ fontFamily: fontMono, color: '#C97B5C' }}
                >
                    Privacy e GDPR
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="leading-[1.1] tracking-tight mb-12 max-w-3xl"
                    style={{
                        fontFamily: fontHeader,
                        fontVariationSettings: fontSettingsSoft,
                        color: '#1A2D52',
                        fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
                        fontWeight: 400,
                    }}
                >
                    Una verifica <span className="italic" style={{ color: '#C97B5C' }}>fatta come si deve.</span>
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="grid md:grid-cols-2 gap-4"
                >
                    {[
                        { titolo: 'Dati oggettivi e verificabili', desc: 'Verifichiamo solo storico pagamenti e regolarità. Niente opinioni soggettive, niente discriminazioni, niente liste nere.' },
                        { titolo: 'GDPR garantito', desc: 'Trattiamo i dati nel pieno rispetto del Regolamento UE 2016/679. Ti chiediamo i documenti per garantire il legittimo interesse della verifica.' },
                        { titolo: 'L\'inquilino può saperlo', desc: 'La persona verificata ha diritto di sapere che è stata verificata e di accedere all\'esito su richiesta. Trasparenza totale.' },
                        { titolo: 'Conservazione limitata', desc: 'Conserviamo l\'esito della verifica per 12 mesi. Dopo viene cancellato. Puoi richiederne la cancellazione anticipata in qualsiasi momento.' },
                    ].map((p, i) => (
                        <div key={i} className="rounded-2xl p-6"
                            style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.06)' }}>
                            <div className="flex items-center gap-2 mb-2">
                                <Lock className="w-4 h-4" style={{ color: '#C97B5C' }} />
                                <h4 className="text-base font-semibold"
                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    {p.titolo}
                                </h4>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                {p.desc}
                            </p>
                        </div>
                    ))}
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
            q: 'Quanto costa una verifica?',
            a: 'Il prezzo è chiaro al momento del checkout. Pagamento singolo via Stripe, una sola fattura, niente abbonamenti. Sconti volume disponibili per chi acquista pacchetti multipli (utile per agenzie).',
        },
        {
            q: 'Cosa serve per fare una verifica?',
            a: 'Servono i dati anagrafici della persona da verificare (nome, cognome, codice fiscale) e un tuo documento d\'identità per attestare il legittimo interesse della richiesta. Tutto si fa online in 5 minuti.',
        },
        {
            q: 'Cosa succede se la persona non è nel database?',
            a: 'Riceverai un esito "Nessun dato disponibile". Significa che la persona non ha precedenti registrati su CRIA. Non è una bocciatura: semplicemente non ci sono informazioni storiche da segnalare.',
        },
        {
            q: 'L\'inquilino verrà a saperlo?',
            a: 'La persona verificata ha diritto di sapere, su richiesta, che è stata verificata e di accedere all\'esito. È previsto dal GDPR. Tu come richiedente non sei obbligato a comunicarlo proattivamente, ma se la persona te lo chiede sì.',
        },
        {
            q: 'Posso usarla per uno scopo diverso dall\'affitto?',
            a: 'No. CRIA Verifica è autorizzato solo per la valutazione di un potenziale rapporto di locazione. Usarlo per altri scopi (assunzioni, prestiti, valutazioni commerciali) viola i termini di servizio e la normativa GDPR.',
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
                    Le risposte alle <span className="italic" style={{ color: '#C97B5C' }}>domande più comuni.</span>
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
                        Pronto a firmare?
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
                            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                            fontWeight: 400,
                        }}
                    >
                        Verifica oggi. <span className="italic" style={{ color: '#E8B59C' }}>Firma con tranquillità.</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl mb-12 max-w-2xl leading-relaxed"
                        style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                        Prima di affidare casa tua per anni, dedica 5 minuti a una verifica seria. L'esito ti arriva entro 48 ore.
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
                                Verifica un inquilino
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
                                Hai dubbi? Scrivici
                                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── PAGINA PRINCIPALE ────────────────────────────────────────────────────────
const VerificaInquilinoPage = () => {
    return (
        <>
            <Helmet>
                <title>Verifica un inquilino — CRIA</title>
                <meta name="description" content="Verifica l'affidabilità di un inquilino prima di firmare. Score storico, regolarità pagamenti, esito documentato in 48 ore. Una sola domanda, una sola risposta." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300,50;0,9..144,400,50;0,9..144,500,50;0,9..144,600,50;0,9..144,700,50;1,9..144,300,50;1,9..144,400,50&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            </Helmet>

            <div style={{ background: '#FFFFFF', fontFamily: fontBody }}>
                <VetrinaHeader activePage="prodotti" />
                <Hero />
                <EsitiPossibili />
                <ComeFunziona />
                <CosaContieneEsito />
                <PerChiE />
                <PrivacyGdpr />
                <FAQ />
                <CTAFinale />
                <VetrinaFooter />
            </div>
        </>
    );
};

export default VerificaInquilinoPage;