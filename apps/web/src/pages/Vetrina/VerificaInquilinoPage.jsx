import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useFaqPubbliche } from '@/lib/faqDemo';
import {
    ArrowRight, ArrowUpRight, CheckCircle2, AlertTriangle, XCircle, Hourglass,
    Search, Mail, Lock, Plus, Clock, Receipt, UserCheck, ShieldCheck,
    Building2, FileText, Eye
} from 'lucide-react';

import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';
import Ricco, { semplice } from '@/components/testi/Ricco';
import { useT } from '@/lib/testi';
import { PRODOTTI, PRODOTTI_PROPRIETARIO, nomeProdotto, prezzoProdotto, fmtEuro } from '@/data/catalogo';
import { SEMAFORO, ORDINE_SEMAFORO, MESI_SEMAFORO } from '@/lib/semaforo';

// I testi sono in src/testi/catalogo/verifica.js: l'admin li cambia da Admin → Testi.
// Qui restano nome e prezzo di CRIA Verifica, ore e giorni, che vengono dal listino.

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

// non ha ancora questo valore: sta qui, in un posto solo.
const P3 = PRODOTTI.P3;
const PREZZO = fmtEuro(P3.prezzo);
const ORE = P3.oreEsito;
const GIORNI_SCALA = P3.scalabileEntroGiorni;

// La risposta «non abbiamo informazioni in merito» (verifica.nessunaInformazione) dentro
// una frase: con l'iniziale minuscola.
const minuscola = (s) => s.charAt(0).toLowerCase() + s.slice(1);

const ICONA_SEMAFORO = {
    verde: CheckCircle2,
    giallo: AlertTriangle,
    rosso: XCircle,
    storico_insufficiente: Hourglass,
};

const fmtData = (d) => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

// ─── MATTONI DI TIPOGRAFIA ────────────────────────────────────────────────────
const Occhiello = ({ inView, colore = '#C97B5C', className = 'mb-6', children }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className={`text-xs uppercase tracking-[0.25em] ${className}`}
        style={{ fontFamily: fontMono, color: colore }}
    >
        {children}
    </motion.div>
);

const Titolo = ({ inView, colore = '#1A2D52', size = 'clamp(2rem, 5vw, 3.75rem)', className = 'mb-6', children }) => (
    <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className={`leading-[1.05] tracking-tight ${className}`}
        style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: colore, fontSize: size, fontWeight: 400 }}
    >
        {children}
    </motion.h2>
);

const Corsivo = ({ colore = '#C97B5C', children }) => (
    <span className="italic" style={{ color: colore }}>{children}</span>
);

// Le parti *in evidenza* dei titoli: il corsivo colorato, terracotta o chiaro.
const inCorsivo = (s) => <Corsivo>{s}</Corsivo>;
const inCorsivoChiaro = (s) => <Corsivo colore="#E8B59C">{s}</Corsivo>;

// ─── HERO ─────────────────────────────────────────────────────────────────────
// Le icone dei tre punti sotto i pulsanti: i testi sono verifica.hero.punto1…3.
const ICONE_PUNTI = [Clock, Lock, Receipt];

const Hero = () => {
    const t = useT();
    const nessunaInformazione = minuscola(t('verifica.nessunaInformazione'));
    const punti = ICONE_PUNTI.map((icon, i) => ({
        icon,
        label: t(`verifica.hero.punto${i + 1}`, { ore: ORE, giorni: GIORNI_SCALA }),
    }));

    return (
        <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: '#FFFFFF' }}>
            <div className="hidden md:block absolute top-32 right-0 w-1 h-72 rounded-full opacity-30" style={{ background: SEMAFORO.verde.colore }} />
            <div className="hidden md:block absolute top-32 right-3 w-1 h-48 rounded-full opacity-30" style={{ background: SEMAFORO.giallo.colore }} />
            <div className="hidden md:block absolute top-32 right-6 w-1 h-32 rounded-full opacity-30" style={{ background: SEMAFORO.rosso.colore }} />

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
                                {t('verifica.hero.occhiello', { nomeProdotto: P3.nome, prezzo: PREZZO })}
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
                            <Ricco evidenza={inCorsivo}>{t('verifica.hero.titolo')}</Ricco>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-lg lg:text-xl max-w-xl mb-10 leading-relaxed"
                            style={{ fontFamily: fontBody, color: '#6B6B5E', fontWeight: 400 }}
                        >
                            <Ricco>{t('verifica.hero.sottotitolo', { ore: ORE, nessunaInformazione })}</Ricco>
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-wrap gap-4 mb-12"
                        >
                            <Link to="/verifica/nuova">
                                <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02] hover:shadow-2xl"
                                    style={{ background: '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}>
                                    {t('verifica.hero.pulsanteRichiedi')}
                                    <span className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                                        style={{ background: '#FFFFFF', color: '#1A2D52' }}>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </button>
                            </Link>
                            <Link to="/signup">
                                <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                                    style={{ background: 'transparent', color: '#1A2D52', fontFamily: fontBody, border: '1.5px solid rgba(26, 45, 82, 0.2)' }}>
                                    {t('verifica.hero.pulsanteRegistrati')}
                                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </button>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.7 }}
                            className="grid sm:grid-cols-3 gap-6 max-w-2xl pt-8"
                            style={{ borderTop: '1px solid rgba(26, 45, 82, 0.1)' }}
                        >
                            {punti.map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#C97B5C15' }}>
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
                        <MockupEsito />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── MOCKUP DELL'ESITO IN PIATTAFORMA ────────────────────────────────────────
const MockupEsito = () => {
    const t = useT();
    const s = SEMAFORO.verde;
    const richiesta = new Date(2026, 8, 14);
    const esito = new Date(2026, 8, 15);

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
                    <div className="w-3 h-3 rounded-full" style={{ background: SEMAFORO.rosso.colore }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: SEMAFORO.giallo.colore }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: SEMAFORO.verde.colore }} />
                    <span className="ml-auto text-[9px] uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: '#F5F5F0', color: '#6B6B5E', fontFamily: fontMono }}>
                        {t('verifica.esempio.etichetta')}
                    </span>
                </div>

                <div className="p-6 space-y-4">
                    <div className="pb-3" style={{ borderBottom: '1px solid rgba(26, 45, 82, 0.08)' }}>
                        <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                            {t('verifica.esempio.occhiello')}
                        </div>
                        <div className="text-base font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                            {t('verifica.esempio.titolo', { nomeProdotto: P3.nome })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                            <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('verifica.esempio.voceCandidato')}</div>
                            <div className="text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>{t('verifica.esempio.candidato')}</div>
                        </div>
                        <div>
                            <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('verifica.esempio.voceCodiceFiscale')}</div>
                            <div className="text-sm font-semibold" style={{ fontFamily: fontMono, color: '#1A2D52' }}>{t('verifica.esempio.codiceFiscale')}</div>
                        </div>
                        <div>
                            <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('verifica.esempio.voceRichiesta')}</div>
                            <div className="text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>{fmtData(richiesta)}</div>
                        </div>
                        <div>
                            <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('verifica.esempio.voceEsito')}</div>
                            <div className="text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>{fmtData(esito)}</div>
                        </div>
                    </div>

                    <div className="p-5 rounded-xl text-center" style={{ background: `${s.colore}14`, border: `1px solid ${s.colore}4D` }}>
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3" style={{ background: s.colore }}>
                            <CheckCircle2 className="w-7 h-7" style={{ color: '#FFFFFF' }} />
                        </div>
                        <div className="text-xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                            {s.etichetta}
                        </div>
                        <div className="text-xs mt-1" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                            {s.spiegazione}
                        </div>
                    </div>

                    <div className="p-3 rounded-lg" style={{ background: '#F5F5F0' }}>
                        <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                            {t('verifica.esempio.voceSintesi')}
                        </div>
                        <p className="text-xs leading-relaxed" style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                            {t('verifica.esempio.sintesi', { mesi: MESI_SEMAFORO })}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <Eye className="w-3.5 h-3.5" style={{ color: '#6B6B5E' }} />
                        <div className="text-[10px]" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                            {t('verifica.esempio.nota')}
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -top-4 -right-4 rounded-xl px-4 py-3 max-w-[220px]"
                style={{ background: '#FFFFFF', boxShadow: '0 15px 35px -8px rgba(26, 45, 82, 0.2)', border: '1px solid rgba(26, 45, 82, 0.08)' }}
            >
                <div className="flex items-start gap-2">
                    <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#C97B5C' }} />
                    <div>
                        <div className="text-[9px] uppercase tracking-wider" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                            {t('verifica.esempio.email.occhiello')}
                        </div>
                        <div className="text-xs font-semibold leading-snug" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                            {t('verifica.esempio.email.testo')}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// ─── COSA TI RESTITUISCE ──────────────────────────────────────────────────────
const CosaRestituisce = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="esito" ref={ref} className="py-32" style={{ background: '#F5F5F0' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <div className="max-w-4xl mb-16">
                    <Occhiello inView={inView}>{t('verifica.esito.occhiello')}</Occhiello>
                    <Titolo inView={inView}>
                        <Ricco evidenza={inCorsivo}>{t('verifica.esito.titolo')}</Ricco>
                    </Titolo>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg leading-relaxed max-w-2xl"
                        style={{ fontFamily: fontBody, color: '#6B6B5E' }}
                    >
                        <Ricco>{t('verifica.esito.intro', { mesi: MESI_SEMAFORO })}</Ricco>
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {ORDINE_SEMAFORO.map((k, i) => {
                        const s = SEMAFORO[k];
                        const Icon = ICONA_SEMAFORO[k];
                        return (
                            <motion.div
                                key={k}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="rounded-2xl p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
                                style={{ background: '#FFFFFF', border: `1px solid ${s.colore}40` }}
                            >
                                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 relative" style={{ background: `${s.colore}15` }}>
                                    <Icon className="w-7 h-7" style={{ color: s.colore }} />
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                                        className="absolute inset-0 rounded-full"
                                        style={{ border: `2px solid ${s.colore}` }}
                                    />
                                </div>
                                <h3 className="text-xl font-bold mb-3" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    {s.etichetta}
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                    {s.spiegazione}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-5"
                    style={{ background: '#FFFFFF', border: '1.5px dashed rgba(26, 45, 82, 0.2)' }}
                >
                    <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(26, 45, 82, 0.06)' }}>
                        <Search className="w-7 h-7" style={{ color: '#6B6B5E' }} />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                            {t('verifica.esito.oppure')}
                        </div>
                        <h3 className="text-xl font-bold mb-1" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                            <Ricco>{`«${t('verifica.nessunaInformazione')}»`}</Ricco>
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                            <Ricco>{t('verifica.esito.oppureTesto')}</Ricco>
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// ─── COME FUNZIONA ────────────────────────────────────────────────────────────
const ComeFunziona = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const steps = [
        { icon: UserCheck, titolo: t('verifica.comeFunziona.passo1.titolo'), desc: t('verifica.comeFunziona.passo1.testo') },
        { icon: Search, titolo: t('verifica.comeFunziona.passo2.titolo'), desc: t('verifica.comeFunziona.passo2.testo', { prezzo: PREZZO }) },
        { icon: Mail, titolo: t('verifica.comeFunziona.passo3.titolo', { ore: ORE }), desc: t('verifica.comeFunziona.passo3.testo') },
    ];

    return (
        <section className="py-32" style={{ background: '#FFFFFF' }} ref={ref}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <div className="mb-16">
                    <Occhiello inView={inView}>{t('verifica.comeFunziona.occhiello')}</Occhiello>
                    <Titolo inView={inView} className="max-w-4xl">
                        <Ricco evidenza={inCorsivo}>{t('verifica.comeFunziona.titolo')}</Ricco>
                    </Titolo>
                </div>

                <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
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
                                <div className="p-6 rounded-2xl h-full transition-all hover:shadow-lg hover:-translate-y-1"
                                    style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-2xl leading-none italic"
                                            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#C97B5C', fontWeight: 400 }}>
                                            {String(i + 1).padStart(2, '0')}
                                        </div>
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#C97B5C15' }}>
                                            <Icon className="w-4 h-4" style={{ color: '#C97B5C' }} />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 leading-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                        <Ricco>{s.titolo}</Ricco>
                                    </h3>
                                    <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                        <Ricco>{s.desc}</Ricco>
                                    </p>
                                </div>

                                {i < steps.length - 1 && (
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

// ─── COSA VEDI, E I 47 € ─────────────────────────────────────────────────────
const VediEScali = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });
    const nessunaInformazione = minuscola(t('verifica.nessunaInformazione'));

    return (
        <section ref={ref} className="py-32" style={{ background: '#0F1B33' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="grid lg:grid-cols-12 gap-12 items-center">

                    <div className="lg:col-span-6">
                        <Occhiello inView={inView} colore="#E8B59C">{t('verifica.cosaVedi.occhiello')}</Occhiello>
                        <Titolo inView={inView} colore="#FFFFFF" size="clamp(2rem, 4.5vw, 3.5rem)">
                            <Ricco evidenza={inCorsivoChiaro}>{t('verifica.cosaVedi.titolo')}</Ricco>
                        </Titolo>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg leading-relaxed mb-8"
                            style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                            <Ricco>{t('verifica.cosaVedi.intro')}</Ricco>
                        </motion.p>
                        <ul className="space-y-3">
                            {[
                                t('verifica.cosaVedi.punto1'),
                                t('verifica.cosaVedi.punto2', { nessunaInformazione }),
                                t('verifica.cosaVedi.punto3'),
                            ].map((c, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.85)' }}>
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
                        className="lg:col-span-6"
                    >
                        <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.5)' }}>
                            <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid rgba(26, 45, 82, 0.08)', background: '#F5F5F0' }}>
                                <Receipt className="w-4 h-4" style={{ color: '#1A2D52' }} />
                                <div className="text-sm font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    <Ricco>{t('verifica.cosaVedi.scalabile.titolo', { prezzo: PREZZO })}</Ricco>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-sm leading-relaxed mb-5" style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                                    <Ricco>{t('verifica.cosaVedi.scalabile.testo', { giorni: GIORNI_SCALA })}</Ricco>
                                </p>
                                <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                                    {t('verifica.cosaVedi.scalabile.listino')}
                                </div>
                                <div>
                                    {PRODOTTI_PROPRIETARIO.map((codice, i) => (
                                        <div key={codice} className="flex items-center justify-between gap-4 py-2.5"
                                            style={{ borderTop: i > 0 ? '1px solid rgba(26, 45, 82, 0.08)' : 'none' }}>
                                            <span className="text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                                                {nomeProdotto(codice)}
                                            </span>
                                            <span className="text-xs text-right" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                                                {prezzoProdotto(codice)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/per-proprietari" className="group inline-flex items-center gap-2 mt-5 text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                                    {t('verifica.cosaVedi.scalabile.link')}
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── ALTRE STRADE ─────────────────────────────────────────────────────────────
const AltreStrade = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const casi = [
        {
            icon: ShieldCheck,
            titolo: t('verifica.altriCasi.caso1.titolo'),
            desc: t('verifica.altriCasi.caso1.testo'),
        },
        {
            icon: FileText,
            titolo: t('verifica.altriCasi.caso2.titolo'),
            desc: t('verifica.altriCasi.caso2.testo', { prezzo: fmtEuro(PRODOTTI.P7.prezzo) }),
            link: { to: '/per-inquilini', label: t('verifica.altriCasi.caso2.link') },
        },
        {
            icon: Building2,
            titolo: t('verifica.altriCasi.caso3.titolo'),
            desc: t('verifica.altriCasi.caso3.testo', { nomeProdotto: PRODOTTI.P6.nome, prezzo: prezzoProdotto('P6').toLowerCase(), sintesi: PRODOTTI.P6.sintesi }),
            link: { to: '/supporto', label: t('verifica.altriCasi.caso3.link') },
        },
    ];

    return (
        <section ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <Occhiello inView={inView}>{t('verifica.altriCasi.occhiello')}</Occhiello>
                <Titolo inView={inView} className="max-w-4xl mb-16">
                    <Ricco evidenza={inCorsivo}>{t('verifica.altriCasi.titolo')}</Ricco>
                </Titolo>

                <div className="grid md:grid-cols-3 gap-6">
                    {casi.map((c, i) => {
                        const Icon = c.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="rounded-2xl p-7 flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg"
                                style={{ background: '#F5F5F0', border: '1px solid rgba(26, 45, 82, 0.06)' }}
                            >
                                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-5" style={{ background: '#C97B5C15' }}>
                                    <Icon className="w-5 h-5" style={{ color: '#C97B5C' }} />
                                </div>
                                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    <Ricco>{c.titolo}</Ricco>
                                </h3>
                                <p className="text-sm leading-relaxed flex-1" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                    <Ricco>{c.desc}</Ricco>
                                </p>
                                {c.link && (
                                    <Link to={c.link.to} className="group inline-flex items-center gap-2 mt-5 text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                                        {c.link.label}
                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
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

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });
    const [open, setOpen] = useState(0);

    // Le domande di questa pagina le scrive l'admin (FAQ): sono quelle che hanno
    // «verifica» fra le pagine su cui compaiono.
    const { faq } = useFaqPubbliche();
    const faqs = faq.filter(f => f.pagine?.includes('verifica')).map(f => ({ q: f.domanda, a: f.risposta }));
    if (!faqs.length) return null;

    return (
        <section ref={ref} className="py-32" style={{ background: '#F5F5F0' }}>
            <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
                <Occhiello inView={inView}>{t('verifica.faq.occhiello')}</Occhiello>
                <Titolo inView={inView} size="clamp(2rem, 5vw, 3.5rem)" className="mb-12">
                    <Ricco evidenza={inCorsivo}>{t('verifica.faq.titolo')}</Ricco>
                </Titolo>

                <div className="space-y-3">
                    {faqs.map((f, i) => (
                        <motion.div
                            key={f.q}
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
    const t = useT();
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
                    <Occhiello inView={inView} colore="#E8B59C">{t('verifica.chiusura.occhiello')}</Occhiello>
                    <Titolo inView={inView} colore="#FFFFFF" size="clamp(2.5rem, 6vw, 5rem)" className="mb-10">
                        <Ricco evidenza={inCorsivoChiaro}>{t('verifica.chiusura.titolo', { ore: ORE })}</Ricco>
                    </Titolo>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl mb-12 max-w-2xl leading-relaxed"
                        style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                        <Ricco>{t('verifica.chiusura.testo', { prezzo: PREZZO, giorni: GIORNI_SCALA })}</Ricco>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-wrap items-center gap-4"
                    >
                        <Link to="/verifica/nuova">
                            <button className="group flex items-center gap-3 px-8 py-5 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                                style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}>
                                {t('verifica.chiusura.pulsanteRichiedi')}
                                <span className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                                    style={{ background: '#1A2D52', color: '#FFFFFF' }}>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                            </button>
                        </Link>
                        <Link to="/signup">
                            <button className="group flex items-center gap-3 px-8 py-5 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                                style={{ background: 'transparent', color: '#FFFFFF', fontFamily: fontBody, border: '1.5px solid rgba(255, 255, 255, 0.3)' }}>
                                {t('verifica.chiusura.pulsanteRegistrati')}
                                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </button>
                        </Link>
                        <p className="text-sm" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.55)' }}>
                            {t('verifica.chiusura.dubbi')}{' '}
                            <Link to="/supporto" className="font-semibold underline" style={{ color: '#E8B59C' }}>
                                {t('verifica.chiusura.scrivici')}
                            </Link>
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── PAGINA PRINCIPALE ────────────────────────────────────────────────────────
const VerificaInquilinoPage = () => {
    const t = useT();
    return (
        <>
            <Helmet>
                <title>{semplice(t('verifica.meta.titolo', { nomeProdotto: P3.nome }))}</title>
                <meta name="description" content={semplice(t('verifica.meta.descrizione', { ore: ORE, prezzo: prezzoProdotto('P3'), giorni: GIORNI_SCALA }))} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300,50;0,9..144,400,50;0,9..144,500,50;0,9..144,600,50;0,9..144,700,50;1,9..144,300,50;1,9..144,400,50&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            </Helmet>

            <div style={{ background: '#FFFFFF', fontFamily: fontBody }}>
                <VetrinaHeader activePage="prodotti" />
                <Hero />
                <CosaRestituisce />
                <ComeFunziona />
                <VediEScali />
                <AltreStrade />
                <FAQ />
                <CTAFinale />
                <VetrinaFooter />
            </div>
        </>
    );
};

export default VerificaInquilinoPage;
