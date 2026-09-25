import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useFaqPubbliche } from '@/lib/faqDemo';
import {
    ArrowRight, ArrowUpRight, CheckCircle2, Plus, Lock, Copy, Send, Check,
    MessageCircle, QrCode, ShieldCheck, Eye, FileSearch, Landmark, UserCheck,
    FileText, Paperclip, Scale, CircleDashed, CalendarDays
} from 'lucide-react';

import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';
import Ricco, { semplice } from '@/components/testi/Ricco';
import { PRODOTTI, PARAMETRI, fmtEuro } from '@/data/catalogo';
import { SEMAFORO, ORDINE_SEMAFORO, ESITI_MESE, esitoMese, analizzaMesi, MESI_SEMAFORO } from '@/lib/semaforo';
import { useT } from '@/lib/testi';

// I testi sono in src/testi/catalogo/perInquilini.js: l'admin li cambia da Testi.
// Nomi dei prodotti, prezzi, giorni ed etichette del semaforo restano del listino
// e del semaforo, e arrivano nei segnaposto. Le domande frequenti vengono da FAQ.

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

// ancora questo valore: sta qui, in un posto solo.
const P7 = PRODOTTI.P7;
const PREZZO_P7 = fmtEuro(P7.prezzo);

const fmtData = (d) => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
const spostaGiorni = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const spostaMesi = (d, n) => { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; };
const dataMese = (chiave) => { const [a, m] = chiave.split('-').map(Number); return new Date(a, m - 1, 1); };
const meseBreve = (chiave) => `${dataMese(chiave).toLocaleDateString('it-IT', { month: 'short' })} '${chiave.slice(2, 4)}`;
const meseLungo = (chiave) => dataMese(chiave).toLocaleDateString('it-IT', { month: 'long' });

const vaiA = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// ─── DATI D'ESEMPIO — inventati, calcolati con lo stesso codice della piattaforma ──
const MESI_ESEMPIO = [
    { mese: '2025-10', stato: 'pagato', giorno: 2 },
    { mese: '2025-11', stato: 'pagato', giorno: 3 },
    { mese: '2025-12', stato: 'pagato', giorno: 4 },
    { mese: '2026-01', stato: 'pagato', giorno: 7 },
    { mese: '2026-02', stato: 'pagato', giorno: 3 },
    { mese: '2026-03', stato: 'non_rilevato' },
    { mese: '2026-04', stato: 'pagato', giorno: 2 },
    { mese: '2026-05', stato: 'pagato', giorno: 4 },
    { mese: '2026-06', stato: 'pagato', giorno: 3 },
    { mese: '2026-07', stato: 'pagato', giorno: 5 },
    { mese: '2026-08', stato: 'pagato', giorno: 2 },
    { mese: '2026-09', stato: 'pagato', giorno: 3 },
];
const ANALISI_ESEMPIO = analizzaMesi(MESI_ESEMPIO);

const SEGNALAZIONE_ESEMPIO = new Date(2026, 3, 4);
const EMISSIONE_ESEMPIO = new Date(2026, 8, 1);

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

const Titolo = ({ inView, colore = '#1A2D52', size = 'clamp(2rem, 5vw, 3.5rem)', className = 'mb-6', children }) => (
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

// Per <Ricco>: le *parole* in evidenza diventano il corsivo colorato della pagina.
const corsivo = (colore) => (s) => <Corsivo colore={colore}>{s}</Corsivo>;

const Esempio = ({ scuro = false }) => {
    const t = useT();
    return (
        <span className="text-[9px] uppercase tracking-wider px-2 py-1 rounded-full"
            style={{ background: scuro ? 'rgba(255,255,255,0.12)' : '#F5F5F0', color: scuro ? 'rgba(255,255,255,0.8)' : '#6B6B5E', fontFamily: fontMono }}>
            {t('perInquilini.esempi.etichetta')}
        </span>
    );
};

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => {
    const t = useT();
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
                            style={{ background: 'rgba(26, 45, 82, 0.06)', border: '1px solid rgba(26, 45, 82, 0.12)' }}>
                            <span className="relative flex w-2 h-2">
                                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style={{ background: SEMAFORO.verde.colore }} />
                                <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: SEMAFORO.verde.colore }} />
                            </span>
                            <span className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: '#1A2D52', fontFamily: fontMono }}>
                                {t('perInquilini.hero.occhiello')}
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
                            <Ricco evidenza={corsivo()}>{t('perInquilini.hero.titolo')}</Ricco>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-lg lg:text-xl max-w-xl mb-10 leading-relaxed"
                            style={{ fontFamily: fontBody, color: '#6B6B5E', fontWeight: 400 }}
                        >
                            <Ricco>{t('perInquilini.hero.sottotitolo')}</Ricco>
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-wrap gap-4"
                        >
                            <button onClick={() => vaiA('semaforo')} className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02] hover:shadow-2xl"
                                style={{ background: '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}>
                                {t('perInquilini.hero.pulsanteSemaforo')}
                                <span className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                                    style={{ background: '#FFFFFF', color: '#1A2D52' }}>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                            </button>
                            <button onClick={() => vaiA('certificato')} className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                                style={{ background: 'transparent', color: '#1A2D52', fontFamily: fontBody, border: '1.5px solid rgba(26, 45, 82, 0.2)' }}>
                                {t('perInquilini.hero.pulsanteCertificato')}
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="lg:col-span-5 relative"
                    >
                        <SemaforoInquilinoCard />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── CARD DEL SEMAFORO — la vista dell'inquilino ─────────────────────────────
const SemaforoInquilinoCard = () => {
    const t = useT();
    const s = SEMAFORO[ANALISI_ESEMPIO.semaforo];
    const ultimo = MESI_ESEMPIO[MESI_ESEMPIO.length - 1];
    const esitoUltimo = ESITI_MESE[esitoMese(ultimo)];
    const esitiPresenti = [...new Set(MESI_ESEMPIO.map(esitoMese))];

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
                <div className="flex items-start justify-between gap-3 mb-6">
                    <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                            {t('perInquilini.schedaSemaforo.titolo')}
                        </div>
                        <div className="text-lg font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                            {t('perInquilini.esempi.nome')}
                        </div>
                    </div>
                    <Esempio />
                </div>

                <div className="rounded-2xl p-6 text-center mb-5" style={{ background: `${s.colore}14`, border: `1px solid ${s.colore}4D` }}>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3" style={{ background: s.colore }}>
                        <CheckCircle2 className="w-10 h-10" style={{ color: '#FFFFFF' }} />
                    </div>
                    <div className="text-2xl font-bold mb-1" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                        {s.etichetta}
                    </div>
                    <div className="text-xs" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                        {t('perInquilini.schedaSemaforo.media', { media: ANALISI_ESEMPIO.media.toLocaleString('it-IT'), mesi: MESI_SEMAFORO })}
                    </div>
                </div>

                <div className="mb-4">
                    <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                        {t('perInquilini.schedaSemaforo.meseAMese')}
                    </div>
                    <div className="flex gap-1">
                        {MESI_ESEMPIO.map(m => (
                            <div key={m.mese} className="flex-1 h-7 rounded" style={{ background: ESITI_MESE[esitoMese(m)].colore }} />
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] pt-1.5" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                        <span>{meseBreve(MESI_ESEMPIO[0].mese)}</span>
                        <span>{meseBreve(ultimo.mese)}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                        {esitiPresenti.map(e => (
                            <span key={e} className="flex items-center gap-1.5 text-[10px]" style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                                <span className="w-2 h-2 rounded-full" style={{ background: ESITI_MESE[e].colore }} />
                                {ESITI_MESE[e].etichetta}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="p-3 rounded-lg flex items-start gap-2" style={{ background: '#F5F5F0' }}>
                    <UserCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#C97B5C' }} />
                    <p className="text-xs leading-relaxed" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                        <Ricco>{t('perInquilini.schedaSemaforo.nota', { mesiNonRilevati: ANALISI_ESEMPIO.nonRilevati })}</Ricco>
                    </p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute -bottom-5 -left-6 rounded-xl p-3 max-w-[240px]"
                style={{ background: '#1A2D52', color: '#FFFFFF', boxShadow: '0 20px 40px -10px rgba(26, 45, 82, 0.4)' }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${esitoUltimo.colore}33` }}>
                        <CheckCircle2 className="w-4 h-4" style={{ color: esitoUltimo.colore }} />
                    </div>
                    <div>
                        <div className="text-[9px] uppercase tracking-wider opacity-70" style={{ fontFamily: fontMono }}>
                            {t('perInquilini.schedaSemaforo.ultimoCanone', { mese: meseLungo(ultimo.mese) })}
                        </div>
                        <div className="text-sm font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft }}>
                            {t('perInquilini.schedaSemaforo.ultimoEsito', { esito: esitoUltimo.etichetta.toLowerCase() })}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// ─── COME SI COSTRUISCE IL SEMAFORO ───────────────────────────────────────────
const ComeSiCostruisce = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const regole = [
        {
            icon: CircleDashed,
            colore: ESITI_MESE.non_rilevato.colore,
            titolo: t('perInquilini.costruzione.regola1.titolo', { nonRilevato: ESITI_MESE.non_rilevato.etichetta.toLowerCase() }),
            desc: t('perInquilini.costruzione.regola1.testo'),
        },
        { icon: Scale, colore: ESITI_MESE.in_sospeso.colore, titolo: t('perInquilini.costruzione.regola2.titolo'), desc: t('perInquilini.costruzione.regola2.testo') },
        { icon: Lock, colore: '#1A2D52', titolo: t('perInquilini.costruzione.regola3.titolo'), desc: t('perInquilini.costruzione.regola3.testo') },
    ];

    return (
        <section id="semaforo" ref={ref} className="py-32" style={{ background: '#F5F5F0' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <div className="max-w-4xl mb-16">
                    <Occhiello inView={inView}>{t('perInquilini.costruzione.occhiello')}</Occhiello>
                    <Titolo inView={inView} size="clamp(2rem, 5vw, 3.75rem)">
                        <Ricco evidenza={corsivo()}>{t('perInquilini.costruzione.titolo')}</Ricco>
                    </Titolo>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg leading-relaxed max-w-2xl"
                        style={{ fontFamily: fontBody, color: '#6B6B5E' }}
                    >
                        <Ricco>{t('perInquilini.costruzione.intro', { mesi: MESI_SEMAFORO })}</Ricco>
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {ORDINE_SEMAFORO.map((k, i) => {
                        const s = SEMAFORO[k];
                        const senzaColore = k === 'storico_insufficiente';
                        return (
                            <motion.div
                                key={k}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                                style={{ background: '#FFFFFF', border: `1px solid ${s.colore}40` }}
                            >
                                <div className="relative w-12 h-12 mb-5">
                                    <div className="w-12 h-12 rounded-full"
                                        style={senzaColore ? { border: `2px dashed ${s.colore}` } : { background: s.colore }} />
                                    {!senzaColore && (
                                        <motion.div
                                            animate={{ scale: [1, 1.45, 1], opacity: [0.55, 0, 0.55] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                                            className="absolute inset-0 rounded-full"
                                            style={{ border: `2px solid ${s.colore}` }}
                                        />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
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
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="rounded-2xl p-8 lg:p-10"
                    style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.08)' }}
                >
                    <div className="grid md:grid-cols-3 gap-6">
                        {regole.map((r, i) => {
                            const Icon = r.icon;
                            return (
                                <div key={i}>
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${r.colore}15` }}>
                                        <Icon className="w-5 h-5" style={{ color: r.colore }} />
                                    </div>
                                    <h4 className="text-base font-semibold mb-2" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                        <Ricco>{r.titolo}</Ricco>
                                    </h4>
                                    <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                        <Ricco>{r.desc}</Ricco>
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

// ─── IL TUO MESE ──────────────────────────────────────────────────────────────
const MeseMock = () => {
    const t = useT();
    const giorni = Array.from({ length: PARAMETRI.giornoChiusuraMese }, (_, i) => i + 1);
    const fasce = ['puntuale', 'ritardo', 'grave'];

    return (
        <div className="rounded-2xl p-6" style={{ background: '#FFFFFF', boxShadow: '0 30px 80px -20px rgba(26, 45, 82, 0.25)', border: '1px solid rgba(26, 45, 82, 0.06)' }}>
            <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-3.5 h-3.5" style={{ color: '#6B6B5E' }} />
                <div className="text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                    {t('perInquilini.mese.esempio.intestazione')}
                </div>
            </div>
            <div className="text-lg font-bold mb-5" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                {t('perInquilini.mese.esempio.titolo')}
            </div>

            <div className="grid gap-1 mb-3" style={{ gridTemplateColumns: `repeat(${giorni.length}, minmax(0, 1fr))` }}>
                {giorni.map(d => {
                    const e = ESITI_MESE[esitoMese({ stato: 'pagato', giorno: d })];
                    return (
                        <div key={d} className="h-10 rounded flex items-center justify-center text-[11px] font-semibold"
                            style={{ background: `${e.colore}26`, borderBottom: `3px solid ${e.colore}`, color: '#1A2D52', fontFamily: fontMono }}>
                            {d}
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-6">
                {fasce.map(f => (
                    <span key={f} className="flex items-center gap-1.5 text-[11px]" style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: ESITI_MESE[f].colore }} />
                        {ESITI_MESE[f].etichetta}
                    </span>
                ))}
            </div>

            <div className="space-y-2 pt-4" style={{ borderTop: '1px solid rgba(26, 45, 82, 0.08)' }}>
                {[
                    { giorno: PARAMETRI.giornoScadenzaCanone, testo: t('perInquilini.mese.esempio.scadenza') },
                    { giorno: PARAMETRI.giornoChiusuraMese, testo: t('perInquilini.mese.esempio.chiusura', { nonRilevato: ESITI_MESE.non_rilevato.etichetta.toLowerCase() }) },
                ].map(r => (
                    <div key={r.giorno} className="flex items-start gap-3 text-xs" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                        <span className="px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: '#F5F5F0', fontFamily: fontMono, color: '#6B6B5E' }}>
                            {t('perInquilini.mese.esempio.giorno', { giorno: r.giorno })}
                        </span>
                        <span className="pt-0.5"><Ricco>{r.testo}</Ricco></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const IlTuoMese = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const entro = ESITI_MESE.puntuale.etichetta.toLowerCase();
    const passi = [
        {
            titolo: t('perInquilini.mese.passo1.titolo', { giorno: PARAMETRI.giornoScadenzaCanone }),
            desc: t('perInquilini.mese.passo1.testo', {
                fasciaPuntuale: entro,
                semaforoVerde: SEMAFORO.verde.etichetta,
                fasciaRitardo: ESITI_MESE.ritardo.etichetta.toLowerCase(),
                semaforoGiallo: SEMAFORO.giallo.etichetta,
                fasciaGrave: ESITI_MESE.grave.etichetta.toLowerCase(),
                semaforoRosso: SEMAFORO.rosso.etichetta,
            }),
        },
        { titolo: t('perInquilini.mese.passo2.titolo'), desc: t('perInquilini.mese.passo2.testo') },
        { titolo: t('perInquilini.mese.passo3.titolo'), desc: t('perInquilini.mese.passo3.testo') },
        {
            titolo: t('perInquilini.mese.passo4.titolo', { giorno: PARAMETRI.giornoChiusuraMese }),
            desc: t('perInquilini.mese.passo4.testo', { nonRilevato: ESITI_MESE.non_rilevato.etichetta.toLowerCase() }),
        },
    ];

    return (
        <section id="mese" ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <div className="max-w-4xl mb-16">
                    <Occhiello inView={inView}>{t('perInquilini.mese.occhiello')}</Occhiello>
                    <Titolo inView={inView} size="clamp(2rem, 5vw, 3.75rem)">
                        <Ricco evidenza={corsivo()}>{t('perInquilini.mese.titolo', { fasciaPuntuale: entro })}</Ricco>
                    </Titolo>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="lg:col-span-5 lg:sticky lg:top-32"
                    >
                        <MeseMock />
                    </motion.div>

                    <div className="lg:col-span-7 space-y-8">
                        {passi.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={inView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                                className="flex gap-6 group"
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                                        style={{ background: '#C97B5C15', border: '1px solid #C97B5C30' }}>
                                        <span className="text-sm font-bold" style={{ fontFamily: fontMono, color: '#C97B5C' }}>
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 pt-2 pb-4" style={{ borderBottom: i < passi.length - 1 ? '1px solid rgba(26, 45, 82, 0.08)' : 'none' }}>
                                    <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                        <Ricco>{s.titolo}</Ricco>
                                    </h3>
                                    <p className="text-base leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                        <Ricco>{s.desc}</Ricco>
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.8, delay: 0.7 }}
                            className="p-5 rounded-2xl flex items-start gap-4"
                            style={{ background: '#F5F5F0' }}
                        >
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#1A2D5210' }}>
                                <Landmark className="w-5 h-5" style={{ color: '#1A2D52' }} />
                            </div>
                            <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                                <Ricco>{t('perInquilini.mese.notaIncassaCria', { nomeProdotto: PRODOTTI.P2.nome })}</Ricco>
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// ─── CONTESTAZIONE ────────────────────────────────────────────────────────────
const MockupContestazione = () => {
    const t = useT();
    const contestabileEntro = spostaGiorni(SEGNALAZIONE_ESEMPIO, PARAMETRI.giorniContestazione);
    const insoluto = ESITI_MESE.insoluto;
    const inVerifica = ESITI_MESE.in_sospeso;
    const meseSegnalato = SEGNALAZIONE_ESEMPIO.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

    return (
        <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-2xl overflow-hidden"
            style={{ background: '#FFFFFF', boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.5)' }}
        >
            <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.08)' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: SEMAFORO.rosso.colore }} />
                <div className="w-3 h-3 rounded-full" style={{ background: SEMAFORO.giallo.colore }} />
                <div className="w-3 h-3 rounded-full" style={{ background: SEMAFORO.verde.colore }} />
                <div className="ml-auto"><Esempio /></div>
            </div>

            <div className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-3 pb-4" style={{ borderBottom: '1px solid rgba(26, 45, 82, 0.08)' }}>
                    <div>
                        <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                            {t('perInquilini.contestazione.esempio.intestazione')}
                        </div>
                        <div className="text-lg font-bold capitalize" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                            {meseSegnalato}
                        </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                        style={{ background: `${insoluto.colore}1A`, color: insoluto.colore, fontFamily: fontMono }}>
                        {insoluto.etichetta}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('perInquilini.contestazione.esempio.segnalatoIl')}</div>
                        <div className="text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>{fmtData(SEGNALAZIONE_ESEMPIO)}</div>
                    </div>
                    <div>
                        <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('perInquilini.contestazione.esempio.contestabileEntro')}</div>
                        <div className="text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>{fmtData(contestabileEntro)}</div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#F5F5F0' }}>
                    <Paperclip className="w-4 h-4 flex-shrink-0" style={{ color: '#1A2D52' }} />
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate" style={{ fontFamily: fontMono, color: '#1A2D52' }}>{t('perInquilini.contestazione.esempio.allegato')}</div>
                        <div className="text-[10px]" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>{t('perInquilini.contestazione.esempio.allegatoNota')}</div>
                    </div>
                    <div className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}>
                        {t('perInquilini.contestazione.esempio.pulsante')}
                    </div>
                </div>

                <div className="p-4 rounded-xl" style={{ background: `${inVerifica.colore}10`, border: `1px solid ${inVerifica.colore}33` }}>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: inVerifica.colore }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: inVerifica.colore, fontFamily: fontMono }}>
                            {inVerifica.etichetta}
                        </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                        <Ricco>{t('perInquilini.contestazione.esempio.nota', { giorni: PARAMETRI.giorniRispostaContestazione })}</Ricco>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

const Contestazione = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section id="contestazione" ref={ref} className="py-32" style={{ background: '#0F1B33' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="grid lg:grid-cols-12 gap-12 items-center">

                    <div className="lg:col-span-5">
                        <Occhiello inView={inView} colore="#E8B59C">{t('perInquilini.contestazione.occhiello')}</Occhiello>
                        <Titolo inView={inView} colore="#FFFFFF" size="clamp(2rem, 4.5vw, 3.5rem)">
                            <Ricco evidenza={corsivo('#E8B59C')}>{t('perInquilini.contestazione.titolo')}</Ricco>
                        </Titolo>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg leading-relaxed mb-8"
                            style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                            <Ricco>{t('perInquilini.contestazione.intro')}</Ricco>
                        </motion.p>

                        <ul className="space-y-3">
                            {[
                                t('perInquilini.contestazione.punto1'),
                                t('perInquilini.contestazione.punto2', { giorni: PARAMETRI.giorniContestazione }),
                                t('perInquilini.contestazione.punto3'),
                                t('perInquilini.contestazione.punto4', { giorni: PARAMETRI.giorniRispostaContestazione }),
                            ].map((c, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.85)' }}>
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#E8B59C' }} />
                                    <Ricco>{c}</Ricco>
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
                        <MockupContestazione />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── CERTIFICATO ──────────────────────────────────────────────────────────────
const MockupCertificato = () => {
    const t = useT();
    const periodoDal = spostaMesi(EMISSIONE_ESEMPIO, -MESI_SEMAFORO);
    const periodoAl = spostaGiorni(EMISSIONE_ESEMPIO, -1);
    const validoFino = spostaMesi(EMISSIONE_ESEMPIO, PARAMETRI.mesiValiditaCertificato);
    const s = SEMAFORO.verde;

    return (
        <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-2xl overflow-hidden"
            style={{ background: '#FFFFFF', boxShadow: '0 30px 80px -20px rgba(26, 45, 82, 0.25)', border: '1px solid rgba(26, 45, 82, 0.06)' }}
        >
            <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.08)', background: '#F5F5F0' }}>
                <FileText className="w-4 h-4" style={{ color: '#1A2D52' }} />
                <div className="text-xs font-semibold flex-1" style={{ fontFamily: fontMono, color: '#1A2D52' }}>
                    {t('perInquilini.certificato.esempio.intestazione')}
                </div>
                <Esempio />
            </div>

            <div className="p-7 space-y-5">
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
                            <div className="text-base font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>CRIA</div>
                            <div className="text-[8px] uppercase tracking-[0.18em]" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                                {t('perInquilini.certificato.esempio.marchio')}
                            </div>
                        </div>
                    </div>
                    <div className="text-right text-[9px] uppercase tracking-wider" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                        {t('perInquilini.certificato.esempio.tipo')}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                        <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('perInquilini.certificato.esempio.intestatario')}</div>
                        <div className="text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>{t('perInquilini.esempi.nome')}</div>
                    </div>
                    <div>
                        <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('perInquilini.certificato.esempio.codiceFiscale')}</div>
                        <div className="text-sm font-semibold" style={{ fontFamily: fontMono, color: '#1A2D52' }}>{t('perInquilini.certificato.esempio.codiceFiscaleValore')}</div>
                    </div>
                </div>

                <div className="p-4 rounded-xl" style={{ background: `${s.colore}14`, border: `1px solid ${s.colore}4D` }}>
                    <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('perInquilini.certificato.esempio.periodo')}</div>
                    <div className="text-sm font-semibold mb-2" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                        {t('perInquilini.certificato.esempio.periodoDate', { dataInizio: fmtData(periodoDal), dataFine: fmtData(periodoAl) })}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: s.colore }} />
                        <span className="text-base font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                            {t('perInquilini.certificato.esempio.semaforo', { semaforo: s.etichetta })}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="col-span-2">
                        <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('perInquilini.certificato.esempio.fonte')}</div>
                        <div className="text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>{t('perInquilini.certificato.fonteCria')}</div>
                    </div>
                    <div>
                        <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('perInquilini.certificato.esempio.emesso')}</div>
                        <div className="text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>{fmtData(EMISSIONE_ESEMPIO)}</div>
                    </div>
                    <div>
                        <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('perInquilini.certificato.esempio.validoFino')}</div>
                        <div className="text-sm font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>{fmtData(validoFino)}</div>
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-4" style={{ borderTop: '1px solid rgba(26, 45, 82, 0.08)' }}>
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#F5F5F0', border: '1px dashed rgba(26, 45, 82, 0.25)' }}>
                        <QrCode className="w-10 h-10" style={{ color: '#1A2D52' }} />
                    </div>
                    <div>
                        <div className="text-[9px] uppercase" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('perInquilini.certificato.esempio.codice')}</div>
                        <div className="text-sm font-semibold mb-1" style={{ fontFamily: fontMono, color: '#1A2D52' }}>{t('perInquilini.certificato.esempio.codiceValore')}</div>
                        <div className="text-[10px] leading-snug" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                            <Ricco>{t('perInquilini.certificato.esempio.avviso')}</Ricco>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Certificato = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const dettagli = [
        { icon: ShieldCheck, titolo: t('perInquilini.certificato.dettaglio1.titolo'), desc: t('perInquilini.certificato.dettaglio1.testo') },
        { icon: Eye, titolo: t('perInquilini.certificato.dettaglio2.titolo'), desc: t('perInquilini.certificato.dettaglio2.testo') },
        { icon: CalendarDays, titolo: t('perInquilini.certificato.dettaglio3.titolo', { mesi: PARAMETRI.mesiValiditaCertificato }), desc: t('perInquilini.certificato.dettaglio3.testo') },
    ];

    return (
        <section id="certificato" ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <div className="max-w-4xl mb-16">
                    <Occhiello inView={inView}>{t('perInquilini.certificato.occhiello')}</Occhiello>
                    <Titolo inView={inView} size="clamp(2rem, 5vw, 3.75rem)">
                        <Ricco evidenza={corsivo()}>{t('perInquilini.certificato.titolo')}</Ricco>
                    </Titolo>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg leading-relaxed max-w-2xl"
                        style={{ fontFamily: fontBody, color: '#6B6B5E' }}
                    >
                        <Ricco>
                            {t('perInquilini.certificato.intro', {
                                fonteCria: t('perInquilini.certificato.fonteCria'),
                                fonteDocumenti: t('perInquilini.certificato.fonteDocumenti'),
                            })}
                        </Ricco>
                    </motion.p>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 items-start mb-12">
                    <div className="lg:col-span-5 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="rounded-2xl p-7"
                            style={{ background: '#F5F5F0', border: '1px solid rgba(26, 45, 82, 0.06)' }}
                        >
                            <div className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ fontFamily: fontMono, color: '#C97B5C' }}>
                                {t('perInquilini.certificato.prezzo.occhiello')}
                            </div>
                            <div className="text-3xl mb-1" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                {t('perInquilini.certificato.prezzo.titolo')}
                            </div>
                            <p className="text-sm leading-relaxed mb-4" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                <Ricco>{t('perInquilini.certificato.prezzo.condizione')}</Ricco>
                            </p>
                            <button onClick={() => vaiA('autocandidatura')} className="group flex items-center gap-2 text-sm font-semibold text-left"
                                style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                                {t('perInquilini.certificato.prezzo.autocandidatura', { prezzo: PREZZO_P7 })}
                                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                            </button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="rounded-2xl p-7"
                            style={{ background: `${SEMAFORO.verde.colore}0F`, border: `1px solid ${SEMAFORO.verde.colore}40` }}
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <FileSearch className="w-4 h-4" style={{ color: '#166534' }} />
                                <div className="text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: fontMono, color: '#166534' }}>
                                    {t('perInquilini.certificato.dati.occhiello')}
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed mb-4" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                                <Ricco>{t('perInquilini.certificato.dati.testo')}</Ricco>
                            </p>
                            <Link to="/profilo/i-miei-dati" className="group inline-flex items-center gap-2 text-sm font-semibold" style={{ fontFamily: fontBody, color: '#166534' }}>
                                {t('perInquilini.certificato.dati.link')}
                                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="lg:col-span-7"
                    >
                        <MockupCertificato />
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {dettagli.map((d, i) => {
                        const Icon = d.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
                                className="p-6 rounded-2xl"
                                style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}
                            >
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: '#C97B5C15' }}>
                                    <Icon className="w-5 h-5" style={{ color: '#C97B5C' }} />
                                </div>
                                <h4 className="text-lg font-semibold mb-2" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    <Ricco>{d.titolo}</Ricco>
                                </h4>
                                <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                    <Ricco>{d.desc}</Ricco>
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// ─── AUTOCANDIDATURA (P7) ─────────────────────────────────────────────────────
const Autocandidatura = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const prove = [
        { icon: Landmark, titolo: t('perInquilini.autocandidatura.prova1.titolo'), desc: t('perInquilini.autocandidatura.prova1.testo', { mesi: MESI_SEMAFORO }) },
        { icon: UserCheck, titolo: t('perInquilini.autocandidatura.prova2.titolo'), desc: t('perInquilini.autocandidatura.prova2.testo') },
        { icon: FileText, titolo: t('perInquilini.autocandidatura.prova3.titolo'), desc: t('perInquilini.autocandidatura.prova3.testo') },
    ];

    return (
        <section id="autocandidatura" ref={ref} className="py-32" style={{ background: '#F5F5F0' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <div className="max-w-4xl mb-16">
                    <Occhiello inView={inView}>{t('perInquilini.autocandidatura.occhiello', { nomeProdotto: P7.nome, prezzo: PREZZO_P7 })}</Occhiello>
                    <Titolo inView={inView} size="clamp(2rem, 5vw, 3.75rem)">
                        <Ricco evidenza={corsivo()}>{t('perInquilini.autocandidatura.titolo')}</Ricco>
                    </Titolo>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg leading-relaxed max-w-2xl"
                        style={{ fontFamily: fontBody, color: '#6B6B5E' }}
                    >
                        <Ricco>{t('perInquilini.autocandidatura.intro', { mesi: MESI_SEMAFORO })}</Ricco>
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {prove.map((p, i) => {
                        const Icon = p.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="rounded-2xl p-7 transition-all hover:-translate-y-1 hover:shadow-lg"
                                style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.06)' }}
                            >
                                <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-5" style={{ background: '#C97B5C15' }}>
                                    <Icon className="w-5 h-5" style={{ color: '#C97B5C' }} />
                                </div>
                                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    <Ricco>{p.titolo}</Ricco>
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                    <Ricco>{p.desc}</Ricco>
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                    style={{ background: '#1A2D52', color: '#FFFFFF' }}
                >
                    <ul className="space-y-2 flex-1">
                        {[
                            t('perInquilini.autocandidatura.nota1', { storicoInsufficiente: SEMAFORO.storico_insufficiente.etichetta }),
                            t('perInquilini.autocandidatura.nota2', { fonteDocumenti: t('perInquilini.certificato.fonteDocumenti') }),
                            t('perInquilini.autocandidatura.nota3'),
                        ].map((nota, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.85)' }}>
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#E8B59C' }} />
                                <Ricco>{nota}</Ricco>
                            </li>
                        ))}
                    </ul>
                    <Link to="/certificato/autocandidatura">
                        <button className="group flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02] flex-shrink-0"
                            style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}>
                            {t('perInquilini.autocandidatura.pulsante')}
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
    const t = useT();

    // Le domande di questa pagina le scrive l'admin (FAQ): sono quelle che hanno
    // «per-inquilini» fra le pagine su cui compaiono.
    const { faq } = useFaqPubbliche();
    const faqs = faq.filter(f => f.pagine?.includes('per-inquilini')).map(f => ({ q: f.domanda, a: f.risposta }));
    if (!faqs.length) return null;

    return (
        <section ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1000px] mx-auto px-6 lg:px-12">
                <Occhiello inView={inView}>{t('perInquilini.faq.occhiello')}</Occhiello>
                <Titolo inView={inView} className="mb-12">
                    <Ricco evidenza={corsivo()}>{t('perInquilini.faq.titolo')}</Ricco>
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

// ─── CTA — IL PROPRIETARIO NON È SU CRIA ─────────────────────────────────────
const CtaFinale = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const [copied, setCopied] = useState(false);

    // Lo stesso testo si legge nella pagina, si copia e si invia.
    const messaggio = t('perInquilini.chiusura.messaggio.testo');

    const handleCopy = () => {
        navigator.clipboard?.writeText(messaggio);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(messaggio)}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(t('perInquilini.chiusura.messaggio.oggettoEmail'))}&body=${encodeURIComponent(messaggio)}`;

    return (
        <section id="condividi" ref={ref} className="py-32 relative overflow-hidden" style={{ background: '#1A2D52' }}>
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(232, 181, 156, 0.4), transparent 70%)' }} />
                <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2), transparent 70%)' }} />
            </div>

            <div className="max-w-[1100px] mx-auto px-6 lg:px-12 relative">
                <Occhiello inView={inView} colore="#E8B59C">{t('perInquilini.chiusura.occhiello')}</Occhiello>
                <Titolo inView={inView} colore="#FFFFFF" size="clamp(2.25rem, 5vw, 4rem)">
                    <Ricco evidenza={corsivo('#E8B59C')}>{t('perInquilini.chiusura.titolo')}</Ricco>
                </Titolo>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-lg lg:text-xl mb-10 max-w-2xl leading-relaxed"
                    style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}
                >
                    <Ricco>{t('perInquilini.chiusura.testo')}</Ricco>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="rounded-2xl overflow-hidden mb-10"
                    style={{ background: '#FFFFFF', boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.5)' }}
                >
                    <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(26, 45, 82, 0.08)' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#1A2D5215' }}>
                            <Send className="w-4 h-4" style={{ color: '#1A2D52' }} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                {t('perInquilini.chiusura.messaggio.titolo')}
                            </div>
                            <div className="text-[10px]" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                                {t('perInquilini.chiusura.messaggio.sottotitolo')}
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
                                style={{ background: copied ? SEMAFORO.verde.colore : '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {t(copied ? 'perInquilini.chiusura.pulsanteCopiato' : 'perInquilini.chiusura.pulsanteCopia')}
                            </button>

                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                                style={{ background: SEMAFORO.verde.colore, color: '#FFFFFF', fontFamily: fontBody }}
                            >
                                <MessageCircle className="w-4 h-4" />
                                {t('perInquilini.chiusura.pulsanteWhatsapp')}
                            </a>

                            <a
                                href={mailtoLink}
                                className="group flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                                style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody, border: '1.5px solid rgba(26, 45, 82, 0.2)' }}
                            >
                                <Send className="w-4 h-4" />
                                {t('perInquilini.chiusura.pulsanteEmail')}
                            </a>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="flex flex-wrap items-center gap-4"
                >
                    <Link to="/signup">
                        <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                            style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}>
                            {t('perInquilini.chiusura.pulsanteRegistrati')}
                            <span className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                                style={{ background: '#1A2D52', color: '#FFFFFF' }}>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                        </button>
                    </Link>
                    <Link to="/login">
                        <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                            style={{ background: 'transparent', color: '#FFFFFF', fontFamily: fontBody, border: '1.5px solid rgba(255, 255, 255, 0.3)' }}>
                            {t('perInquilini.chiusura.pulsanteAccedi')}
                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                    </Link>
                    <p className="text-sm" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.55)' }}>
                        {t('perInquilini.chiusura.domandaProprietario')}{' '}
                        <Link to="/per-proprietari" className="font-semibold underline" style={{ color: '#E8B59C' }}>
                            {t('perInquilini.chiusura.linkProprietario')}
                        </Link>
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

// ─── PAGINA PRINCIPALE ────────────────────────────────────────────────────────
const PerInquiliniPage = () => {
    const t = useT();
    return (
        <>
            <Helmet>
                <title>{semplice(t('perInquilini.meta.titolo'))}</title>
                <meta name="description" content={semplice(t('perInquilini.meta.descrizione'))} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300,50;0,9..144,400,50;0,9..144,500,50;0,9..144,600,50;0,9..144,700,50;1,9..144,300,50;1,9..144,400,50&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            </Helmet>

            <div style={{ background: '#FFFFFF', fontFamily: fontBody }}>
                <VetrinaHeader activePage="prodotti" />
                <Hero />
                <ComeSiCostruisce />
                <IlTuoMese />
                <Contestazione />
                <Certificato />
                <Autocandidatura />
                <FAQ />
                <CtaFinale />
                <VetrinaFooter />
            </div>
        </>
    );
};

export default PerInquiliniPage;
