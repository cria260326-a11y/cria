import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
    ArrowRight, ArrowUpRight, CheckCircle2, XCircle, Bell, Mail, MessageSquare,
    ShieldCheck, Scale, CalendarDays, Users, Receipt, Clock, Building2
} from 'lucide-react';

import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';
import Ricco, { semplice } from '@/components/testi/Ricco';
import { PRODOTTI, PRODOTTI_PROPRIETARIO, PARAMETRI, nomeProdotto, prezzoProdotto, fmtEuro } from '@/data/catalogo';
import { SEMAFORO, ORDINE_SEMAFORO, MESI_SEMAFORO } from '@/lib/semaforo';
import { useT } from '@/lib/testi';

// I testi sono in src/testi/catalogo/perProprietari.js: l'admin li cambia da Testi.
// Nomi dei prodotti, prezzi e giorni restano del listino e arrivano nei segnaposto.

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

// ─── DATI DAL CATALOGO ────────────────────────────────────────────────────────
const {
    giornoScadenzaCanone, giorniFinestraCopertura, giornoChiusuraMese,
    giorniContestazione, giorniRispostaContestazione, solleciti,
} = PARAMETRI;
const VERIFICA = PRODOTTI.P3;

const maiuscola = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const elenco = (voci) => (voci.length < 2 ? voci.join('') : `${voci.slice(0, -1).join(', ')} e ${voci[voci.length - 1]}`);
const nomiDove = (filtro) => elenco([...new Set(PRODOTTI_PROPRIETARIO.filter(c => filtro(PRODOTTI[c])).map(c => PRODOTTI[c].nome))]);

const CON_GARANZIA = nomiDove(p => p.garanzia);
const SENZA_GARANZIA = nomiDove(p => !p.garanzia);
const INCASSA_CRIA = nomiDove(p => p.incassa === 'cria');

// ─── ELEMENTI RICORRENTI ──────────────────────────────────────────────────────
const Accento = ({ colore = '#C97B5C', children }) => (
    <span className="italic" style={{ color: colore }}>{children}</span>
);

// Per <Ricco>: le *parole* in evidenza diventano il corsivo colorato della pagina.
const accento = (colore) => (s) => <Accento colore={colore}>{s}</Accento>;

// titolo e intro sono testi del catalogo: nel titolo le *parole* prendono il
// colore dell'occhiello.
const Intestazione = ({ inView, eyebrow, colore = '#C97B5C', titolo, intro, className = '' }) => (
    <div className={className}>
        <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-[0.25em] mb-6"
            style={{ fontFamily: fontMono, color: colore }}
        >
            {eyebrow}
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
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 400,
            }}
        >
            <Ricco evidenza={accento(colore)}>{titolo}</Ricco>
        </motion.h2>
        {intro && (
            <motion.p
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg max-w-2xl leading-relaxed"
                style={{ fontFamily: fontBody, color: '#6B6B5E' }}
            >
                <Ricco>{intro}</Ricco>
            </motion.p>
        )}
    </div>
);

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => {
    const t = useT();
    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: '#FFFFFF' }}>
            <div className="hidden md:block absolute top-32 right-0 w-1 h-72 rounded-full opacity-30" style={{ background: '#22C55E' }} />
            <div className="hidden md:block absolute top-32 right-3 w-1 h-48 rounded-full opacity-30" style={{ background: '#F59E0B' }} />
            <div className="hidden md:block absolute top-32 right-6 w-1 h-32 rounded-full opacity-30" style={{ background: '#EF4444' }} />

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
                                {t('perProprietari.hero.occhiello')}
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
                            <Ricco evidenza={accento()}>{t('perProprietari.hero.titolo')}</Ricco>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-lg lg:text-xl max-w-xl mb-10 leading-relaxed"
                            style={{ fontFamily: fontBody, color: '#6B6B5E', fontWeight: 400 }}
                        >
                            <Ricco>{t('perProprietari.hero.sottotitolo')}</Ricco>
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
                                    {t('perProprietari.hero.pulsanteInizia')}
                                    <span className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                                        style={{ background: '#FFFFFF', color: '#1A2D52' }}>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                </button>
                            </Link>
                            <button onClick={() => scrollTo('prodotti')} className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                                style={{
                                    background: 'transparent',
                                    color: '#1A2D52',
                                    fontFamily: fontBody,
                                    border: '1.5px solid rgba(26, 45, 82, 0.2)',
                                }}>
                                {t('perProprietari.hero.pulsanteProdotti')}
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
                        <DomandaDelMese />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── HERO: la domanda del mese ────────────────────────────────────────────────
const DomandaDelMese = () => {
    const t = useT();
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
                    <div className="ml-auto text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                        {t('perProprietari.domanda.intestazione')}
                    </div>
                </div>

                <div className="p-6 lg:p-8 space-y-6">
                    <div>
                        <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                            {t('perProprietari.domanda.scadenza', { giorno: giornoScadenzaCanone })}
                        </div>
                        <div className="text-2xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                            {t('perProprietari.domanda.domanda')}
                        </div>
                        <div className="text-xs mt-1" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                            {t('perProprietari.domanda.immobile')}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="py-3 rounded-xl text-center text-sm font-semibold"
                            style={{ background: '#F0FDF4', border: '1.5px solid #22C55E', color: '#15803D', fontFamily: fontBody }}>
                            {t('perProprietari.domanda.si')}
                        </div>
                        <div className="py-3 rounded-xl text-center text-sm font-semibold"
                            style={{ background: '#FEF2F2', border: '1.5px solid #EF4444', color: '#B91C1C', fontFamily: fontBody }}>
                            {t('perProprietari.domanda.no')}
                        </div>
                    </div>

                    <div className="pt-5" style={{ borderTop: '1px solid rgba(26, 45, 82, 0.08)' }}>
                        <div className="text-[10px] uppercase tracking-wider mb-3" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
                            {t('perProprietari.domanda.solleciti', { numeroSolleciti: solleciti.length })}
                        </div>
                        <ul className="space-y-2 mb-4">
                            {solleciti.map((s, i) => (
                                <motion.li
                                    key={s}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.15 }}
                                    className="flex items-center gap-3 text-sm"
                                    style={{ fontFamily: fontBody, color: '#1A1A1A' }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#C97B5C' }} />
                                    {maiuscola(s)}
                                </motion.li>
                            ))}
                        </ul>
                        <div className="flex items-center gap-4 text-[11px]" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                            <span className="flex items-center gap-1.5"><Bell className="w-3.5 h-3.5" /> {t('perProprietari.domanda.canaleNotifica')}</span>
                            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {t('perProprietari.domanda.canaleEmail')}</span>
                            <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> {t('perProprietari.domanda.canaleSms')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                            <div className="text-lg font-bold leading-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#15803D' }}>
                                {t('perProprietari.domanda.finestra', { giorni: giorniFinestraCopertura })}
                            </div>
                            <div className="text-[11px] mt-1 leading-snug" style={{ color: '#15803D', fontFamily: fontBody }}>
                                {t('perProprietari.domanda.finestraTesto')}
                            </div>
                        </div>
                        <div className="p-4 rounded-xl" style={{ background: '#F5F5F0', border: '1px solid rgba(26, 45, 82, 0.08)' }}>
                            <div className="text-lg font-bold leading-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                {t('perProprietari.domanda.chiusura', { giorno: giornoChiusuraMese })}
                            </div>
                            <div className="text-[11px] mt-1 leading-snug" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                                {t('perProprietari.domanda.chiusuraTesto')}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="absolute -bottom-6 -left-8 rounded-2xl p-4 max-w-[210px] hidden sm:block"
                style={{ background: '#1A2D52', color: '#FFFFFF', boxShadow: '0 20px 40px -10px rgba(26, 45, 82, 0.4)' }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#22C55E' }} />
                    <span className="text-[10px] uppercase tracking-wider opacity-70" style={{ fontFamily: fontMono }}>
                        {t('perProprietari.domanda.prezzoOcchiello')}
                    </span>
                </div>
                <div className="text-sm font-semibold leading-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft }}>
                    {t('perProprietari.domanda.prezzoTesto')}
                </div>
            </motion.div>
        </div>
    );
};

// ─── I QUATTRO PRODOTTI ───────────────────────────────────────────────────────
const STILE_PRODOTTO = {
    P1: { colore: '#22C55E' },
    P1E: { colore: '#C97B5C' },
    P2: { colore: '#E8B59C', scuro: true },
    P5: { colore: '#6B6B5E' },
};

// In cima alla scheda: la variante del listino, se c'è; se no chi incassa o la garanzia.
const etichettaProdotto = (p, t) => {
    if (p.variante != null) return maiuscola(p.variante);
    if (p.incassa === 'cria') return t('perProprietari.prodotti.etichettaIncassaCria');
    return !p.garanzia ? t('perProprietari.prodotti.etichettaSenzaGaranzia') : '';
};

const Prodotti = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const note = [
        {
            titolo: t('perProprietari.prodotti.nota1.titolo'),
            desc: t('perProprietari.prodotti.nota1.testo', { prodottoCompleto: PRODOTTI.P2.nome, prodottoSegnalazione: PRODOTTI.P5.nome }),
        },
        { titolo: t('perProprietari.prodotti.nota2.titolo'), desc: t('perProprietari.prodotti.nota2.testo') },
        { titolo: t('perProprietari.prodotti.nota3.titolo'), desc: t('perProprietari.prodotti.nota3.testo') },
    ];

    return (
        <section id="prodotti" ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <Intestazione
                    inView={inView}
                    eyebrow={t('perProprietari.prodotti.occhiello')}
                    titolo={t(PRODOTTI_PROPRIETARIO.length === 4 ? 'perProprietari.prodotti.titolo' : 'perProprietari.prodotti.titoloGenerico')}
                    intro={t('perProprietari.prodotti.intro')}
                    className="mb-16"
                />

                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                    {PRODOTTI_PROPRIETARIO.map((codice, i) => {
                        const p = PRODOTTI[codice];
                        const { colore, scuro } = STILE_PRODOTTO[codice] ?? { colore: '#1A2D52' };
                        const garanzia = p.franchigiaMesi === 1 ? 'perProprietari.prodotti.puntoGaranziaUnMese' : 'perProprietari.prodotti.puntoGaranzia';
                        const punti = [
                            { ok: p.garanzia, testo: p.garanzia ? t(garanzia, { mesi: p.franchigiaMesi }) : t('perProprietari.prodotti.puntoSenzaGaranzia') },
                            { ok: true, testo: t(p.incassa === 'cria' ? 'perProprietari.prodotti.puntoIncassaCria' : 'perProprietari.prodotti.puntoIncassiTu') },
                            { ok: true, testo: t(p.incassa === 'cria' ? 'perProprietari.prodotti.puntoNienteDaSegnalare' : 'perProprietari.prodotti.puntoSegnaliOgniMese') },
                            { ok: true, testo: t('perProprietari.prodotti.puntoSemaforo') },
                        ];

                        return (
                            <motion.div
                                key={codice}
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                                className="rounded-3xl p-8 flex flex-col"
                                style={scuro
                                    ? { background: '#1A2D52', color: '#FFFFFF' }
                                    : { background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-3 h-3 rounded-full" style={{ background: colore }} />
                                    <span className="text-xs uppercase tracking-wider" style={{ fontFamily: fontMono, color: colore }}>
                                        {etichettaProdotto(p, t)}
                                    </span>
                                </div>

                                <h3 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight"
                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: scuro ? '#FFFFFF' : '#1A2D52' }}>
                                    {p.nome}
                                </h3>

                                <p className="text-lg italic mb-5 leading-snug"
                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: scuro ? '#E8B59C' : colore, fontWeight: 400 }}>
                                    {prezzoProdotto(codice)}
                                </p>

                                <p className="text-sm leading-relaxed mb-6"
                                    style={{ fontFamily: fontBody, color: scuro ? 'rgba(255, 255, 255, 0.75)' : '#6B6B5E' }}>
                                    {p.sintesi}
                                </p>

                                <ul className="space-y-3 flex-1">
                                    {punti.map((pt, n) => {
                                        const Icon = pt.ok ? CheckCircle2 : XCircle;
                                        return (
                                            <li key={n} className="flex items-start gap-3 text-sm"
                                                style={{ fontFamily: fontBody, color: scuro ? 'rgba(255, 255, 255, 0.85)' : '#1A1A1A' }}>
                                                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5"
                                                    style={{ color: pt.ok ? (scuro ? '#E8B59C' : '#22C55E') : '#9CA3AF' }} />
                                                <Ricco>{pt.testo}</Ricco>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="grid md:grid-cols-3 rounded-2xl overflow-hidden"
                    style={{ background: '#F5F5F0', border: '1px solid rgba(26, 45, 82, 0.08)' }}
                >
                    {note.map((n, i) => (
                        <div key={i} className="p-6">
                            <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ fontFamily: fontMono, color: '#C97B5C' }}>
                                {n.titolo}
                            </p>
                            <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                                <Ricco>{n.desc}</Ricco>
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// ─── IL MESE: i 5 giorni e l'11 ───────────────────────────────────────────────
const IlMese = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const tappe = [
        {
            etichetta: t('perProprietari.mese.tappa1.etichetta', { giorno: giornoScadenzaCanone }),
            titolo: t('perProprietari.mese.tappa1.titolo'),
            desc: t('perProprietari.mese.tappa1.testo'),
            colore: '#1A2D52',
            icon: CalendarDays,
        },
        {
            etichetta: t('perProprietari.mese.tappa2.etichetta', { numeroSolleciti: solleciti.length }),
            titolo: t('perProprietari.mese.tappa2.titolo'),
            desc: t('perProprietari.mese.tappa2.testo', { solleciti: maiuscola(elenco(solleciti)) }),
            colore: '#C97B5C',
            icon: Bell,
        },
        {
            etichetta: t('perProprietari.mese.tappa3.etichetta', { giorni: giorniFinestraCopertura }),
            titolo: t('perProprietari.mese.tappa3.titolo'),
            desc: t('perProprietari.mese.tappa3.testo', { giorni: giorniFinestraCopertura }),
            colore: '#22C55E',
            icon: ShieldCheck,
        },
        {
            etichetta: t('perProprietari.mese.tappa4.etichetta', { giorno: giornoChiusuraMese }),
            titolo: t('perProprietari.mese.tappa4.titolo'),
            desc: t('perProprietari.mese.tappa4.testo', { giorno: giornoChiusuraMese }),
            colore: '#9CA3AF',
            icon: Clock,
        },
    ];

    const esiti = [
        {
            quando: t('perProprietari.mese.esito1.quando', { giorni: giorniFinestraCopertura }),
            semaforo: t('perProprietari.mese.esito1.semaforo'),
            copertura: t('perProprietari.mese.esito1.copertura'),
            colore: '#22C55E',
        },
        {
            quando: t('perProprietari.mese.esito2.quando', { giorni: giorniFinestraCopertura }),
            semaforo: t('perProprietari.mese.esito2.semaforo'),
            copertura: t('perProprietari.mese.esito2.copertura'),
            colore: '#F59E0B',
        },
        {
            quando: t('perProprietari.mese.esito3.quando', { giorno: giornoChiusuraMese }),
            semaforo: t('perProprietari.mese.esito3.semaforo'),
            copertura: t('perProprietari.mese.esito3.copertura'),
            colore: '#22C55E',
        },
        {
            quando: t('perProprietari.mese.esito4.quando', { giorno: giornoChiusuraMese }),
            semaforo: t('perProprietari.mese.esito4.semaforo'),
            copertura: t('perProprietari.mese.esito4.copertura'),
            colore: '#EF4444',
        },
    ];

    return (
        <section id="il-mese" ref={ref} className="py-32" style={{ background: '#F5F5F0' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <Intestazione
                    inView={inView}
                    eyebrow={t('perProprietari.mese.occhiello')}
                    colore="#22C55E"
                    titolo={t('perProprietari.mese.titolo')}
                    intro={t('perProprietari.mese.intro', { giorni: giorniFinestraCopertura, giornoChiusura: giornoChiusuraMese })}
                    className="mb-16"
                />

                <div className="grid lg:grid-cols-12 gap-12 items-start">

                    <div className="lg:col-span-5 space-y-8">
                        {tappe.map((tappa, i) => {
                            const Icon = tappa.icon;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                                    className="flex gap-5 group"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                                            style={{ background: `${tappa.colore}15`, border: `1px solid ${tappa.colore}30` }}>
                                            <Icon className="w-5 h-5" style={{ color: tappa.colore }} />
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-1 pb-4" style={{ borderBottom: i < tappe.length - 1 ? '1px solid rgba(26, 45, 82, 0.08)' : 'none' }}>
                                        <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ fontFamily: fontMono, color: tappa.colore }}>
                                            {tappa.etichetta}
                                        </p>
                                        <h3 className="text-xl font-semibold mb-2"
                                            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                            <Ricco>{tappa.titolo}</Ricco>
                                        </h3>
                                        <p className="text-base leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                            <Ricco>{tappa.desc}</Ricco>
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="lg:col-span-7 rounded-2xl overflow-hidden"
                        style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.08)', boxShadow: '0 30px 80px -30px rgba(26, 45, 82, 0.15)' }}
                    >
                        <div className="hidden sm:grid grid-cols-3 gap-4 px-6 py-4 text-[10px] uppercase tracking-[0.2em]"
                            style={{ fontFamily: fontMono, color: '#6B6B5E', borderBottom: '1px solid rgba(26, 45, 82, 0.08)' }}>
                            <div>{t('perProprietari.mese.colonnaSegnalazione')}</div>
                            <div>{t('perProprietari.mese.colonnaSemaforo')}</div>
                            <div>{t('perProprietari.mese.colonnaCopertura')}</div>
                        </div>

                        {esiti.map((e, i) => (
                            <div key={i} className="grid sm:grid-cols-3 gap-2 sm:gap-4 px-6 py-5 text-sm hover:bg-[#FAFAF7] transition-colors"
                                style={{ borderBottom: i < esiti.length - 1 ? '1px solid rgba(26, 45, 82, 0.06)' : 'none' }}>
                                <div className="flex items-start gap-3 font-semibold" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                                    <span className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: e.colore }} />
                                    <Ricco>{e.quando}</Ricco>
                                </div>
                                <div className="leading-relaxed" style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                                    <Ricco>{e.semaforo}</Ricco>
                                </div>
                                <div className="leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                    <Ricco>{e.copertura}</Ricco>
                                </div>
                            </div>
                        ))}

                        <div className="px-6 py-5 space-y-3" style={{ background: '#F0FDF4', borderTop: '1px solid rgba(34, 197, 94, 0.2)' }}>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
                                <p className="text-sm font-medium leading-relaxed" style={{ fontFamily: fontBody, color: '#15803D' }}>
                                    <Ricco>{t('perProprietari.mese.notaMeseSaltato')}</Ricco>
                                </p>
                            </div>
                            <p className="text-sm leading-relaxed pl-6" style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                                <Ricco>{t('perProprietari.mese.notaIncassaCria', { prodottiIncassaCria: INCASSA_CRIA })}</Ricco>
                            </p>
                            <p className="text-sm leading-relaxed pl-6" style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                                <Ricco>{t('perProprietari.mese.notaSenzaGaranzia', { prodottiSenzaGaranzia: SENZA_GARANZIA })}</Ricco>
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── IL SEMAFORO DEI TUOI INQUILINI ───────────────────────────────────────────
const SezioneSemaforo = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const regole = [1, 2, 3, 4, 5].map(n => t(`perProprietari.semaforo.regola${n}`));

    return (
        <section ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="grid lg:grid-cols-12 gap-12 items-center">

                    <div className="lg:col-span-6">
                        <Intestazione
                            inView={inView}
                            eyebrow={t('perProprietari.semaforo.occhiello')}
                            titolo={t('perProprietari.semaforo.titolo')}
                            intro={t('perProprietari.semaforo.intro', { mesi: MESI_SEMAFORO })}
                            className="mb-8"
                        />

                        <motion.ul
                            initial={{ opacity: 0 }}
                            animate={inView ? { opacity: 1 } : {}}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="space-y-3"
                        >
                            {regole.map((r, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm" style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
                                    <Ricco>{r}</Ricco>
                                </li>
                            ))}
                        </motion.ul>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="lg:col-span-6"
                    >
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
                                <div className="ml-auto text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                                    {t('perProprietari.semaforo.esempio.intestazione', { mesi: MESI_SEMAFORO })}
                                </div>
                            </div>

                            <div className="p-6 lg:p-8 space-y-3">
                                {ORDINE_SEMAFORO.map((k, i) => {
                                    const s = SEMAFORO[k];
                                    const senzaColore = k === 'storico_insufficiente';
                                    return (
                                        <motion.div
                                            key={k}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={inView ? { opacity: 1, x: 0 } : {}}
                                            transition={{ delay: 0.6 + i * 0.12 }}
                                            className="flex items-center gap-4 p-4 rounded-xl"
                                            style={{ border: `1px ${senzaColore ? 'dashed' : 'solid'} ${s.colore}40` }}
                                        >
                                            <div className="w-1 h-12 rounded-full flex-shrink-0"
                                                style={senzaColore ? { border: `1px dashed ${s.colore}` } : { background: s.colore }} />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-base font-semibold leading-tight"
                                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                                    {s.etichetta}
                                                </div>
                                                <div className="text-xs mt-0.5" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                                                    {s.spiegazione}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}

                                <div className="pt-4 text-[11px] leading-relaxed" style={{ borderTop: '1px solid rgba(26, 45, 82, 0.08)', color: '#6B6B5E', fontFamily: fontBody }}>
                                    <Ricco evidenza={(s) => <span style={{ fontFamily: fontMono, color: '#1A2D52' }}>{s}</span>}>
                                        {t('perProprietari.semaforo.esempio.nonRilevato')}
                                    </Ricco>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── PRIMA DI FIRMARE: CRIA VERIFICA ──────────────────────────────────────────
const PrimaDiFirmare = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const passi = [
        { num: '01', titolo: t('perProprietari.verifica.passo1.titolo'), desc: t('perProprietari.verifica.passo1.testo') },
        { num: '02', titolo: t('perProprietari.verifica.passo2.titolo'), desc: t('perProprietari.verifica.passo2.testo') },
        { num: '03', titolo: t('perProprietari.verifica.passo3.titolo', { prezzo: prezzoProdotto('P3') }), desc: t('perProprietari.verifica.passo3.testo') },
        { num: '04', titolo: t('perProprietari.verifica.passo4.titolo', { ore: VERIFICA.oreEsito }), desc: t('perProprietari.verifica.passo4.testo') },
    ];

    return (
        <section ref={ref} className="py-32" style={{ background: '#F5F5F0' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="grid lg:grid-cols-12 gap-12 items-start">

                    <div className="lg:col-span-7">
                        <Intestazione
                            inView={inView}
                            eyebrow={t('perProprietari.verifica.occhiello', { nomeProdotto: VERIFICA.nome })}
                            titolo={t('perProprietari.verifica.titolo')}
                            intro={t('perProprietari.verifica.intro', { prezzo: fmtEuro(VERIFICA.prezzo) })}
                            className="mb-12"
                        />

                        <div className="space-y-6 mb-10">
                            {passi.map((s, i) => (
                                <motion.div
                                    key={s.num}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                                    className="flex gap-6 group"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                                            style={{ background: '#C97B5C15', border: '1px solid #C97B5C30' }}>
                                            <span className="text-sm font-bold" style={{ fontFamily: fontMono, color: '#C97B5C' }}>
                                                {s.num}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-2 pb-4" style={{ borderBottom: i < passi.length - 1 ? '1px solid rgba(26, 45, 82, 0.08)' : 'none' }}>
                                        <h3 className="text-xl font-semibold mb-2"
                                            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                            <Ricco>{s.titolo}</Ricco>
                                        </h3>
                                        <p className="text-base leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                            <Ricco>{s.desc}</Ricco>
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <Link to="/verifica">
                            <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                                style={{ background: 'transparent', color: '#1A2D52', fontFamily: fontBody, border: '1.5px solid rgba(26, 45, 82, 0.2)' }}>
                                {t('perProprietari.verifica.pulsante', { nomeProdotto: VERIFICA.nome })}
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </Link>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="lg:col-span-5 lg:sticky lg:top-32 rounded-3xl p-8 lg:p-10"
                        style={{ background: '#1A2D52', color: '#FFFFFF', boxShadow: '0 25px 60px -15px rgba(26, 45, 82, 0.4)' }}
                    >
                        <div className="text-[10px] uppercase tracking-[0.2em] mb-6" style={{ fontFamily: fontMono, color: 'rgba(255, 255, 255, 0.5)' }}>
                            {t('perProprietari.verifica.esito.titolo')}
                        </div>

                        <div className="rounded-2xl p-5 mb-4" style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}>{t('perProprietari.verifica.esito.semaforo')}</span>
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                    style={{ background: `${SEMAFORO.verde.colore}25`, color: SEMAFORO.verde.colore, fontFamily: fontMono }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: SEMAFORO.verde.colore }} />
                                    {SEMAFORO.verde.etichetta}
                                </span>
                            </div>
                            <div className="text-sm mb-2" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}>{t('perProprietari.verifica.esito.sintesi')}</div>
                            <div className="space-y-2">
                                <div className="h-2 rounded-full w-full" style={{ background: 'rgba(255, 255, 255, 0.12)' }} />
                                <div className="h-2 rounded-full w-4/5" style={{ background: 'rgba(255, 255, 255, 0.12)' }} />
                                <div className="h-2 rounded-full w-3/5" style={{ background: 'rgba(255, 255, 255, 0.12)' }} />
                            </div>
                        </div>

                        <p className="text-center text-sm italic mb-6"
                            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#E8B59C' }}>
                            <Ricco>{t('perProprietari.verifica.esito.oppure')}</Ricco>
                        </p>

                        <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(232, 181, 156, 0.12)', border: '1px solid rgba(232, 181, 156, 0.3)' }}>
                            <div className="text-lg font-semibold leading-tight mb-1"
                                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF' }}>
                                <Ricco>{t('perProprietari.verifica.esito.scalabile', { prezzo: fmtEuro(VERIFICA.prezzo), giorni: VERIFICA.scalabileEntroGiorni })}</Ricco>
                            </div>
                            <div className="text-xs" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.65)' }}>
                                <Ricco>{t('perProprietari.verifica.esito.scalabileNota')}</Ricco>
                            </div>
                        </div>

                        <p className="text-xs leading-relaxed" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.6)' }}>
                            <Ricco>{t('perProprietari.verifica.esito.piede')}</Ricco>
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── SE IL CANONE NON ARRIVA ──────────────────────────────────────────────────
const SeNonPaga = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const casi = [
        {
            num: '01',
            titolo: t('perProprietari.nonArriva.caso1.titolo'),
            testo: t('perProprietari.nonArriva.caso1.testo', { giorni: giorniFinestraCopertura }),
            esito: t('perProprietari.nonArriva.caso1.esito'),
            positivo: true,
        },
        {
            num: '02',
            titolo: t('perProprietari.nonArriva.caso2.titolo'),
            testo: t('perProprietari.nonArriva.caso2.testo'),
            esito: t('perProprietari.nonArriva.caso2.esito'),
            positivo: true,
        },
        {
            num: '03',
            titolo: t('perProprietari.nonArriva.caso3.titolo'),
            testo: t('perProprietari.nonArriva.caso3.testo', { prodottiConGaranzia: CON_GARANZIA }),
            esito: t('perProprietari.nonArriva.caso3.esito', { prodottiSenzaGaranzia: SENZA_GARANZIA }),
            positivo: false,
        },
    ];

    return (
        <section ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <Intestazione
                    inView={inView}
                    eyebrow={t('perProprietari.nonArriva.occhiello')}
                    colore="#EF4444"
                    titolo={t('perProprietari.nonArriva.titolo')}
                    className="mb-16"
                />

                <div className="grid md:grid-cols-3 gap-12 lg:gap-16 mb-12">
                    {casi.map((c, i) => (
                        <motion.div
                            key={c.num}
                            initial={{ opacity: 0, y: 30 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8, delay: i * 0.15 }}
                        >
                            <div className="text-5xl mb-6 leading-none italic"
                                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#EF4444', fontWeight: 300 }}>
                                {c.num}
                            </div>
                            <h3 className="text-xl font-semibold mb-4 leading-tight"
                                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                <Ricco>{c.titolo}</Ricco>
                            </h3>
                            <p className="text-base leading-relaxed mb-4" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                <Ricco>{c.testo}</Ricco>
                            </p>
                            <div className="p-4 rounded-xl"
                                style={c.positivo
                                    ? { background: '#F0FDF4', border: '1px solid rgba(34, 197, 94, 0.2)' }
                                    : { background: '#F5F5F0', border: '1px solid rgba(26, 45, 82, 0.1)' }}>
                                <div className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: c.positivo ? '#22C55E' : '#6B6B5E' }} />
                                    <p className="text-sm font-medium leading-relaxed" style={{ fontFamily: fontBody, color: c.positivo ? '#15803D' : '#1A1A1A' }}>
                                        <Ricco>{c.esito}</Ricco>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-base leading-relaxed max-w-3xl pl-4"
                    style={{ fontFamily: fontBody, color: '#1A1A1A', borderLeft: '3px solid #1A2D52' }}
                >
                    <Ricco>{t('perProprietari.nonArriva.incassaCria', { prodottiIncassaCria: INCASSA_CRIA })}</Ricco>
                </motion.p>
            </div>
        </section>
    );
};

// ─── SE L'INQUILINO CONTESTA ──────────────────────────────────────────────────
const Contestazione = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    const regole = [
        { icon: Users, titolo: t('perProprietari.contestazione.regola1.titolo'), desc: t('perProprietari.contestazione.regola1.testo') },
        { icon: Clock, titolo: t('perProprietari.contestazione.regola2.titolo'), desc: t('perProprietari.contestazione.regola2.testo', { giorni: giorniContestazione }) },
        { icon: Receipt, titolo: t('perProprietari.contestazione.regola3.titolo'), desc: t('perProprietari.contestazione.regola3.testo') },
        { icon: Scale, titolo: t('perProprietari.contestazione.regola4.titolo'), desc: t('perProprietari.contestazione.regola4.testo', { giorni: giorniRispostaContestazione }) },
    ];

    return (
        <section ref={ref} className="py-32" style={{ background: '#F5F5F0' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <Intestazione
                    inView={inView}
                    eyebrow={t('perProprietari.contestazione.occhiello')}
                    titolo={t('perProprietari.contestazione.titolo')}
                    intro={t('perProprietari.contestazione.intro')}
                    className="mb-16"
                />

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {regole.map((r, i) => {
                        const Icon = r.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                                className="rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                                style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.06)' }}
                            >
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: '#1A2D5210' }}>
                                    <Icon className="w-5 h-5" style={{ color: '#1A2D52' }} />
                                </div>
                                <h3 className="text-lg font-semibold mb-2"
                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                    <Ricco>{r.titolo}</Ricco>
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                    <Ricco>{r.desc}</Ricco>
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// ─── COME SI INIZIA ───────────────────────────────────────────────────────────
const ComeSiInizia = () => {
    const t = useT();
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    // Sei passi; nel quinto il sito mette i mesi del semaforo.
    const passi = [1, 2, 3, 4, 5, 6].map(n => ({
        titolo: t(`perProprietari.inizio.passo${n}.titolo`),
        desc: t(`perProprietari.inizio.passo${n}.testo`, { mesi: MESI_SEMAFORO }),
    }));

    return (
        <section ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
                <div className="grid lg:grid-cols-12 gap-12 items-start">

                    <div className="lg:col-span-5 lg:sticky lg:top-32">
                        <Intestazione
                            inView={inView}
                            eyebrow={t('perProprietari.inizio.occhiello')}
                            titolo={t('perProprietari.inizio.titolo')}
                            className="mb-8"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="rounded-2xl p-6"
                            style={{ background: '#F5F5F0', border: '1px solid rgba(26, 45, 82, 0.06)' }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#1A2D5210' }}>
                                    <Building2 className="w-5 h-5" style={{ color: '#1A2D52' }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-1"
                                        style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                        <Ricco>{t('perProprietari.inizio.agenzia.titolo')}</Ricco>
                                    </h3>
                                    <p className="text-sm leading-relaxed mb-3" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                        <Ricco>{t('perProprietari.inizio.agenzia.testo', { nomeProdotto: nomeProdotto('P6'), prezzo: prezzoProdotto('P6') })}</Ricco>
                                    </p>
                                    <Link to="/supporto" className="group inline-flex items-center gap-1.5 text-sm font-semibold"
                                        style={{ fontFamily: fontBody, color: '#C97B5C' }}>
                                        {t('perProprietari.inizio.agenzia.link')}
                                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>

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
                                        style={{ background: '#22C55E15', border: '1px solid #22C55E30' }}>
                                        <span className="text-sm font-bold" style={{ fontFamily: fontMono, color: '#22C55E' }}>
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 pt-2 pb-4" style={{ borderBottom: i < passi.length - 1 ? '1px solid rgba(26, 45, 82, 0.08)' : 'none' }}>
                                    <h3 className="text-xl font-semibold mb-2"
                                        style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                        <Ricco>{s.titolo}</Ricco>
                                    </h3>
                                    <p className="text-base leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                        <Ricco>{s.desc}</Ricco>
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
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
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.6 }}
                        className="text-xs uppercase tracking-[0.25em] mb-6"
                        style={{ fontFamily: fontMono, color: '#E8B59C' }}
                    >
                        {t('perProprietari.chiusura.occhiello')}
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
                        <Ricco evidenza={accento('#E8B59C')}>{t('perProprietari.chiusura.titolo')}</Ricco>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-xl mb-12 max-w-2xl leading-relaxed"
                        style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                        <Ricco>{t('perProprietari.chiusura.testo', { nomeProdotto: VERIFICA.nome })}</Ricco>
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-wrap gap-4"
                    >
                        <Link to="/signup">
                            <button className="group flex items-center gap-3 px-8 py-5 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                                style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}>
                                {t('perProprietari.chiusura.pulsanteRegistrati')}
                                <span className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                                    style={{ background: '#1A2D52', color: '#FFFFFF' }}>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                            </button>
                        </Link>
                        <Link to="/verifica">
                            <button className="group flex items-center gap-3 px-8 py-5 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                                style={{ background: 'transparent', color: '#FFFFFF', fontFamily: fontBody, border: '1.5px solid rgba(255, 255, 255, 0.3)' }}>
                                {t('perProprietari.chiusura.pulsanteVerifica')}
                            </button>
                        </Link>
                        <Link to="/supporto" className="flex items-center px-4 text-base font-semibold"
                            style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}>
                            {t('perProprietari.chiusura.linkDomande')}
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ─── PAGINA PRINCIPALE ────────────────────────────────────────────────────────
const PerLocatoriPage = () => {
    const t = useT();
    return (
        <>
            <Helmet>
                <title>{semplice(t('perProprietari.meta.titolo'))}</title>
                <meta name="description" content={semplice(t('perProprietari.meta.descrizione', { nomeProdotto: VERIFICA.nome }))} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300,50;0,9..144,400,50;0,9..144,500,50;0,9..144,600,50;0,9..144,700,50;1,9..144,300,50;1,9..144,400,50&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            </Helmet>

            <div style={{ background: '#FFFFFF', fontFamily: fontBody }}>
                <VetrinaHeader activePage="prodotti" />
                <Hero />
                <Prodotti />
                <IlMese />
                <SezioneSemaforo />
                <PrimaDiFirmare />
                <SeNonPaga />
                <Contestazione />
                <ComeSiInizia />
                <CTAFinale />
                <VetrinaFooter />
            </div>
        </>
    );
};

export default PerLocatoriPage;
