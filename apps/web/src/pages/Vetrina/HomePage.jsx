import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, CheckCircle2, ChevronDown, Shield, ShieldOff,
  Search, BadgeCheck, Building2, Briefcase, BellRing, Lock, Eye,
  CalendarClock, MessageSquare, Gavel, Wallet, QrCode, FileText, PenLine, Scale,
} from 'lucide-react';

import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';
import { PRODOTTI, PRODOTTI_PROPRIETARIO, PARAMETRI, nomeProdotto, prezzoProdotto, fmtEuro } from '@/data/catalogo';
import { SEMAFORO, ORDINE_SEMAFORO, ESITI_MESE, esitoMese, analizzaMesi, MESI_SEMAFORO } from '@/lib/semaforo';
import Ricco, { semplice } from '@/components/testi/Ricco';
import { useT } from '@/lib/testi';

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

// ─── DATI ─────────────────────────────────────────────────────────────────────
// I testi sono in src/testi/catalogo/home.js: l'admin li cambia da Testi.
// Prezzi, percentuali, franchigie e giorni arrivano da catalogo.js e semaforo.js:
// in questa pagina non si scrive a mano nessun numero del listino o delle regole.
const P3 = PRODOTTI.P3;
const P6 = PRODOTTI.P6;
const P7 = PRODOTTI.P7;

const mesiTesto = (n) => `${n} ${n === 1 ? 'mese' : 'mesi'}`;
const giorniTesto = (n) => `${n} ${n === 1 ? 'giorno' : 'giorni'}`;
const elenco = (voci) => (voci.length < 2 ? voci.join('') : `${voci.slice(0, -1).join(', ')} e ${voci[voci.length - 1]}`);
const maiuscola = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const nomiUnici = (codici) => [...new Set(codici.map((c) => PRODOTTI[c].nome))];

const NOMI_PROPRIETARIO = nomiUnici(PRODOTTI_PROPRIETARIO);
const NOMI_CHI_SEGNALA = nomiUnici(PRODOTTI_PROPRIETARIO.filter((c) => PRODOTTI[c].incassa === 'proprietario'));

// Le parti *in evidenza* dei titoli: corsivo, a volte colorato.
const evidenza = (stile) => (testo) => <span className="italic" style={stile}>{testo}</span>;
const CORSIVO = evidenza();
const CORSIVO_TERRACOTTA = evidenza({ color: '#C97B5C' });
const CORSIVO_ROSA = evidenza({ color: '#E8B59C' });
const CORSIVO_HERO = evidenza({ color: '#C97B5C', fontWeight: 300 });

// Mesi d'esempio per i mockup: il semaforo mostrato è calcolato da semaforo.js, non scritto.
const MESI_ESEMPIO = [
  { mese: '2025-09', stato: 'pagato', giorno: 2 },
  { mese: '2025-10', stato: 'pagato', giorno: 3 },
  { mese: '2025-11', stato: 'pagato', giorno: 1 },
  { mese: '2025-12', stato: 'pagato', giorno: 4 },
  { mese: '2026-01', stato: 'non_rilevato' },
  { mese: '2026-02', stato: 'pagato', giorno: 3 },
  { mese: '2026-03', stato: 'pagato', giorno: 5 },
  { mese: '2026-04', stato: 'pagato', giorno: 2 },
  { mese: '2026-05', stato: 'pagato', giorno: 7 },
  { mese: '2026-06', stato: 'pagato', giorno: 3 },
  { mese: '2026-07', stato: 'pagato', giorno: 2 },
  { mese: '2026-08', stato: 'pagato', giorno: 4 },
];
const ESEMPIO = analizzaMesi(MESI_ESEMPIO);

const ABBR_MESI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const etichettaMese = (chiave) => {
  const [anno, mese] = chiave.split('-');
  return `${ABBR_MESI[Number(mese) - 1]} '${anno.slice(2)}`;
};
const fmtData = (d) => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
const CERT_DAL = new Date(2025, 8, 1);
const CERT_AL = new Date(2026, 7, 31);
const CERT_EMESSO = new Date(2026, 8, 1);
const CERT_SCADE = new Date(2026, 8 + PARAMETRI.mesiValiditaCertificato, 1);

// ─── ELEMENTI RICORRENTI ──────────────────────────────────────────────────────
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

const Titolo = ({ inView, colore = '#1A2D52', className = '', fontSize = 'clamp(2rem, 5vw, 4rem)', children }) => (
  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.8 }}
    className={`leading-[1.05] tracking-tight ${className}`}
    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: colore, fontSize, fontWeight: 400 }}
  >
    {children}
  </motion.h2>
);

const BarraFinestra = ({ etichetta }) => (
  <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.08)' }}>
    <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
    <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
    <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
    <div className="ml-auto text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>{etichetta}</div>
  </div>
);

// Su telefono il riquadro del hero arriva dopo il testo: niente dissolvenza
// legata allo scorrimento, altrimenti è già sbiadito quando lo si legge.
const useSchermoGrande = () => {
  const query = '(min-width: 1024px)';
  const [grande, setGrande] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const cambia = () => setGrande(mq.matches);
    mq.addEventListener('change', cambia);
    return () => mq.removeEventListener('change', cambia);
  }, []);
  return grande;
};

// ─── HERO ──────────────────────────────────────────────────────────────────────
const Hero = () => {
  const t = useT();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const yMockup = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacityMockup = useTransform(scrollYProgress, [0.35, 0.9], [1, 0.4]);
  const grande = useSchermoGrande();

  const regole = [
    { id: 'copertura', num: giorniTesto(PARAMETRI.giorniFinestraCopertura), label: t('home.hero.regola1.testo') },
    { id: 'esito', num: t('home.hero.regola2.numero', { ore: P3.oreEsito }), label: t('home.hero.regola2.testo', { nomeProdotto: P3.nome }) },
    { id: 'certificato', num: mesiTesto(PARAMETRI.mesiValiditaCertificato), label: t('home.hero.regola3.testo') },
  ];

  return (
    <section ref={containerRef} className="relative pt-32 pb-24 overflow-hidden" style={{ background: '#FFFFFF' }}>
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
                {t('home.hero.occhiello')}
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
                fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
                fontWeight: 400,
                letterSpacing: '-0.03em',
              }}
            >
              <Ricco evidenza={CORSIVO_HERO}>{t('home.hero.titolo')}</Ricco>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg lg:text-xl max-w-xl mb-10 leading-relaxed"
              style={{ fontFamily: fontBody, color: '#6B6B5E', fontWeight: 400 }}
            >
              <Ricco>{t('home.hero.sottotitolo')}</Ricco>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap gap-4 mb-6"
            >
              <Link
                to="/per-proprietari"
                className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02] hover:shadow-2xl"
                style={{ background: '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}
              >
                {t('home.hero.pulsanteProprietario')}
                <span className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                  style={{ background: '#FFFFFF', color: '#1A2D52' }}>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
              <Link
                to="/per-inquilini"
                className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                style={{ background: 'transparent', color: '#1A2D52', fontFamily: fontBody, border: '1.5px solid rgba(26, 45, 82, 0.2)' }}
              >
                {t('home.hero.pulsanteInquilino')}
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-sm mb-14"
              style={{ fontFamily: fontBody, color: '#6B6B5E' }}
            >
              {t('home.hero.verifica.domanda')}{' '}
              <Link to="/verifica" className="font-semibold underline underline-offset-4" style={{ color: '#1A2D52' }}>
                {t('home.hero.verifica.link', { nomeProdotto: P3.nome })}
              </Link>
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="grid grid-cols-3 gap-6 max-w-lg pt-8"
              style={{ borderTop: '1px solid rgba(26, 45, 82, 0.1)' }}
            >
              {regole.map((r) => (
                <div key={r.id}>
                  <div className="text-2xl lg:text-3xl font-bold tracking-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                    {r.num}
                  </div>
                  <div className="text-xs mt-1 leading-snug" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                    {r.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            style={grande ? { y: yMockup, opacity: opacityMockup } : undefined}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="lg:col-span-5 relative"
          >
            <MockupSemaforo />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
            {t('home.hero.scopriDiPiu')}
          </span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown className="w-4 h-4" style={{ color: '#6B6B5E' }} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── MOCKUP SEMAFORO (hero) ───────────────────────────────────────────────────
const MockupSemaforo = () => {
  const t = useT();
  const s = SEMAFORO[ESEMPIO.semaforo];
  const primo = MESI_ESEMPIO[0].mese;
  const ultimo = MESI_ESEMPIO[MESI_ESEMPIO.length - 1].mese;

  return (
    <div className="relative">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 30px 80px -20px rgba(26, 45, 82, 0.25), 0 10px 30px -10px rgba(26, 45, 82, 0.15)',
          border: '1px solid rgba(26, 45, 82, 0.06)',
        }}
      >
        <BarraFinestra etichetta={t('home.hero.mockup.finestra')} />

        <div className="p-6 space-y-5">
          <div>
            <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
              {t('home.hero.mockup.titolo', { mesi: MESI_SEMAFORO })}
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full" style={{ background: s.colore }} />
              <span className="text-2xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                {s.etichetta}
              </span>
            </div>
            <div className="text-xs mt-1" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
              {t('home.hero.mockup.spiegazione', { spiegazione: s.spiegazione })}
            </div>
          </div>

          <div>
            <div className="flex items-end gap-1 h-10">
              {MESI_ESEMPIO.map((m, i) => {
                const e = ESITI_MESE[esitoMese(m)];
                return (
                  <motion.div
                    key={m.mese}
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                    title={`${etichettaMese(m.mese)} · ${e.etichetta}`}
                    className="flex-1 h-full rounded origin-bottom"
                    style={{ background: e.colore, opacity: e.pesa ? 1 : 0.45 }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] pt-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
              <span>{etichettaMese(primo)}</span>
              <span>{etichettaMese(ultimo)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl" style={{ background: '#F5F5F0', border: '1px solid rgba(26, 45, 82, 0.06)' }}>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('home.hero.mockup.giornoMedio')}</div>
              <div className="text-lg font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                {ESEMPIO.media.toLocaleString('it-IT')}
              </div>
            </div>
            <div className="p-3 rounded-xl" style={{ background: '#F5F5F0', border: '1px solid rgba(26, 45, 82, 0.06)' }}>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('home.hero.mockup.nonRilevati')}</div>
              <div className="text-lg font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                {ESEMPIO.nonRilevati} <span className="text-[11px] font-normal" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>{t('home.hero.mockup.pesoZero')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {['puntuale', 'ritardo', 'non_rilevato'].map((k) => (
              <span key={k} className="flex items-center gap-1.5 text-[10px]" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: ESITI_MESE[k].colore }} />
                {ESITI_MESE[k].etichetta}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute -bottom-8 -left-8 rounded-2xl p-4 max-w-[230px]"
        style={{ background: '#1A2D52', color: '#FFFFFF', boxShadow: '0 20px 40px -10px rgba(26, 45, 82, 0.4)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(232, 181, 156, 0.2)' }}>
            <BellRing className="w-4 h-4" style={{ color: '#E8B59C' }} />
          </div>
          <div className="text-[10px] uppercase tracking-wider opacity-70" style={{ fontFamily: fontMono }}>
            {t('home.hero.mockup.promemoria.etichetta')}
          </div>
        </div>
        <div className="text-base font-semibold mb-2" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft }}>
          {t('home.hero.mockup.promemoria.domanda')}
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold" style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}>{t('home.hero.mockup.promemoria.si')}</span>
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold" style={{ border: '1px solid rgba(255,255,255,0.3)', fontFamily: fontBody }}>{t('home.hero.mockup.promemoria.no')}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute -top-4 -right-6 rounded-2xl px-4 py-3"
        style={{ background: '#FFFFFF', boxShadow: '0 15px 35px -8px rgba(26, 45, 82, 0.2)', border: '1px solid rgba(26, 45, 82, 0.08)' }}
      >
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5" style={{ color: '#1A2D52' }} />
          <div className="text-xs font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
            {t('home.hero.mockup.bloccato.titolo')}
          </div>
        </div>
        <div className="text-[10px] mt-0.5" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
          {t('home.hero.mockup.bloccato.testo')}
        </div>
      </motion.div>
    </div>
  );
};

// ─── IL SEMAFORO ──────────────────────────────────────────────────────────────
const CHIAVI_TAG_SEMAFORO = {
  verde: 'home.semaforo.tag.verde',
  giallo: 'home.semaforo.tag.giallo',
  rosso: 'home.semaforo.tag.rosso',
  storico_insufficiente: 'home.semaforo.tag.nessunColore',
};

const Semaforo = () => {
  const t = useT();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const principi = [
    { id: 'visibile', icon: Eye, testo: t('home.semaforo.principio1') },
    { id: 'nonRilevato', icon: CalendarClock, testo: t('home.semaforo.principio2') },
    { id: 'contestato', icon: MessageSquare, testo: t('home.semaforo.principio3') },
    { id: 'aMano', icon: Lock, testo: t('home.semaforo.principio4') },
  ];

  return (
    <section ref={ref} className="py-32 relative" style={{ background: '#F5F5F0' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-10">

          <div className="lg:col-span-6">
            <Occhiello inView={inView}>{t('home.semaforo.occhiello')}</Occhiello>

            <Titolo inView={inView} className="mb-8" fontSize="clamp(1.75rem, 3.5vw, 2.75rem)">
              <span style={{ color: SEMAFORO.verde.colore }}>{SEMAFORO.verde.etichetta}</span>,{' '}
              <span style={{ color: SEMAFORO.giallo.colore }}>{SEMAFORO.giallo.etichetta}</span>,{' '}
              <span style={{ color: SEMAFORO.rosso.colore }}>{SEMAFORO.rosso.etichetta}</span>.
              <br />
              <Ricco evidenza={CORSIVO}>{t('home.semaforo.titolo')}</Ricco>
            </Titolo>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg leading-relaxed mb-8"
              style={{ fontFamily: fontBody, color: '#6B6B5E' }}
            >
              <Ricco>{t('home.semaforo.testo', { mesi: MESI_SEMAFORO })}</Ricco>
            </motion.p>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="p-6 rounded-2xl space-y-4"
              style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.08)' }}
            >
              {principi.map(({ id, icon: Icon, testo }) => (
                <li key={id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201, 123, 92, 0.1)' }}>
                    <Icon className="w-4 h-4" style={{ color: '#C97B5C' }} />
                  </div>
                  <p className="text-sm leading-relaxed pt-1.5" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                    <Ricco>{testo}</Ricco>
                  </p>
                </li>
              ))}
            </motion.ul>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="space-y-4">
              {ORDINE_SEMAFORO.map((k, i) => {
                const s = SEMAFORO[k];
                const senzaColore = k === 'storico_insufficiente';
                return (
                  <motion.div
                    key={k}
                    initial={{ opacity: 0, x: 30 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
                    className="rounded-2xl p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform"
                    style={{ background: '#FFFFFF', border: `1px solid ${s.colore}25` }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: `${s.colore}15` }}>
                        <div className="w-6 h-6 rounded-full" style={senzaColore ? { border: `2px dashed ${s.colore}` } : { background: s.colore }} />
                      </div>
                      {!senzaColore && (
                        <motion.div
                          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                          className="absolute inset-0 rounded-full"
                          style={{ border: `2px solid ${s.colore}` }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                        <span className="text-lg font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                          {s.etichetta}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                          style={{ background: `${s.colore}15`, color: s.colore, fontFamily: fontMono }}>
                          {t(CHIAVI_TAG_SEMAFORO[k])}
                        </span>
                      </div>
                      <p className="text-sm" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                        {s.spiegazione}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── LE QUATTRO PORTE ─────────────────────────────────────────────────────────
const QuattroPorte = () => {
  const t = useT();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const porte = [
    {
      num: '01',
      icon: Search,
      colore: '#C97B5C',
      chi: t('home.porte.porta1.chi'),
      domanda: t('home.porte.porta1.domanda'),
      desc: P3.sintesi,
      prodotto: nomeProdotto('P3'),
      prezzo: prezzoProdotto('P3'),
      cta: t('home.porte.porta1.pulsante'),
      to: '/verifica',
    },
    {
      num: '02',
      icon: BadgeCheck,
      colore: '#22C55E',
      chi: t('home.porte.porta2.chi'),
      domanda: t('home.porte.porta2.domanda'),
      desc: t('home.porte.porta2.testo'),
      prodotto: t('home.porte.porta2.prodotto'),
      prezzo: t('home.porte.porta2.prezzo', { prezzo: fmtEuro(P7.prezzo) }),
      nota: t('home.porte.porta2.nota'),
      cta: t('home.porte.porta2.pulsante'),
      to: '/per-inquilini',
    },
    {
      num: '03',
      icon: Building2,
      colore: '#1A2D52',
      chi: t('home.porte.porta3.chi'),
      domanda: t('home.porte.porta3.domanda'),
      desc: t('home.porte.porta3.testo'),
      prodotto: elenco(NOMI_PROPRIETARIO),
      prezzo: t('home.porte.porta3.prezzo'),
      cta: t('home.porte.porta3.pulsante'),
      to: '/per-proprietari',
    },
    {
      num: '04',
      icon: Briefcase,
      colore: '#6B6B5E',
      chi: t('home.porte.porta4.chi'),
      domanda: t('home.porte.porta4.domanda'),
      desc: P6.sintesi,
      prodotto: nomeProdotto('P6'),
      prezzo: prezzoProdotto('P6'),
      cta: t('home.porte.porta4.pulsante'),
      to: '/supporto',
    },
  ];

  return (
    <section ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <Occhiello inView={inView}>{t('home.porte.occhiello')}</Occhiello>
        <Titolo inView={inView} className="max-w-4xl mb-6">
          <Ricco evidenza={CORSIVO_TERRACOTTA}>{t('home.porte.titolo')}</Ricco>
        </Titolo>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg max-w-2xl mb-16"
          style={{ fontFamily: fontBody, color: '#6B6B5E' }}
        >
          <Ricco>{t('home.porte.sottotitolo')}</Ricco>
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {porte.map(({ num, icon: Icon, colore, chi, domanda, desc, prodotto, prezzo, nota, cta, to }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="p-6 rounded-2xl h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1"
              style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${colore}15` }}>
                  <Icon className="w-5 h-5" style={{ color: colore }} />
                </div>
                <span className="text-2xl leading-none italic" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: colore, fontWeight: 300 }}>
                  {num}
                </span>
              </div>

              <p className="text-[10px] uppercase tracking-wider" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>{chi}</p>
              <h3 className="text-xl font-semibold mt-2 mb-3 leading-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                <Ricco>{domanda}</Ricco>
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ fontFamily: fontBody, color: '#6B6B5E' }}><Ricco>{desc}</Ricco></p>

              <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(26, 45, 82, 0.08)' }}>
                <div className="text-[10px] uppercase tracking-wider" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>{prodotto}</div>
                <div className="text-sm font-semibold mt-1" style={{ fontFamily: fontBody, color: '#1A2D52' }}>{prezzo}</div>
                {nota && (
                  <p className="text-xs leading-relaxed mt-3 p-2.5 rounded-lg" style={{ background: '#F0FDF4', color: '#166534', fontFamily: fontBody }}>
                    <Ricco>{nota}</Ricco>
                  </p>
                )}
                <Link to={to} className="group inline-flex items-center gap-2 mt-4 text-sm font-semibold" style={{ color: '#1A2D52', fontFamily: fontBody }}>
                  {cta}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── IL LISTINO PER PROPRIETARI ───────────────────────────────────────────────
const Listino = () => {
  const t = useT();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-32 relative overflow-hidden" style={{ background: '#0F1B33' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <Occhiello inView={inView} colore="#E8B59C">{t('home.listino.occhiello')}</Occhiello>
        <Titolo inView={inView} colore="#FFFFFF" className="max-w-4xl mb-6">
          <Ricco evidenza={CORSIVO_ROSA}>{t('home.listino.titolo')}</Ricco>
        </Titolo>
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg max-w-2xl mb-16"
          style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.6)' }}
        >
          <Ricco>{t('home.listino.sottotitolo')}</Ricco>
        </motion.p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODOTTI_PROPRIETARIO.map((codice, i) => {
            const p = PRODOTTI[codice];
            const IconaGaranzia = p.garanzia ? Shield : ShieldOff;
            return (
              <motion.div
                key={codice}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.1 }}
                className="p-6 rounded-2xl h-full flex flex-col"
                style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <h3 className="text-2xl leading-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF', fontWeight: 400 }}>
                  {p.nome}
                </h3>
                <p className="text-base italic min-h-[1.5rem] mb-5" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#E8B59C', fontWeight: 300 }}>
                  {p.variante || ''}
                </p>

                <div className="text-lg font-semibold mb-5" style={{ fontFamily: fontBody, color: '#FFFFFF' }}>
                  {prezzoProdotto(codice)}
                </div>

                <ul className="space-y-2.5 mb-5">
                  <li className="flex items-start gap-2.5 text-sm" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.85)' }}>
                    <IconaGaranzia className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: p.garanzia ? '#E8B59C' : 'rgba(255, 255, 255, 0.4)' }} />
                    {p.garanzia ? t('home.listino.garanzia', { mesi: mesiTesto(p.franchigiaMesi) }) : t('home.listino.senzaGaranzia')}
                  </li>
                  <li className="flex items-start gap-2.5 text-sm" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.85)' }}>
                    <Wallet className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#E8B59C' }} />
                    {p.incassa === 'cria' ? t('home.listino.incassaCria') : t('home.listino.incassiTu')}
                  </li>
                </ul>

                <p className="text-sm leading-relaxed mt-auto pt-4" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.6)', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  {p.sintesi}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row sm:items-center gap-6"
        >
          <Link
            to="/per-proprietari"
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02] self-start"
            style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}
          >
            {t('home.listino.pulsante')}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-sm max-w-xl" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.55)' }}>
            <Ricco>{t('home.listino.nota', { nomeProdotto: nomeProdotto('P5') })}</Ricco>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ─── PRIMA DI FIRMARE: VERIFICA E CERTIFICATO ─────────────────────────────────
const PuntoElenco = ({ children, colore }) => (
  <li className="flex items-start gap-3 text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: colore }} />
    <span>{children}</span>
  </li>
);

const MockupEsitoVerifica = () => {
  const t = useT();
  const s = SEMAFORO.verde;
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 20px 50px -20px rgba(26, 45, 82, 0.25)', border: '1px solid rgba(26, 45, 82, 0.08)' }}>
      <BarraFinestra etichetta={t('home.prima.verifica.esempio.finestra', { nomeProdotto: P3.nome })} />
      <div className="p-5 space-y-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('home.prima.verifica.esempio.candidato')}</div>
          <div className="text-lg font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>{t('home.prima.verifica.esempio.nome')}</div>
        </div>
        <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: `${s.colore}12`, border: `1px solid ${s.colore}40` }}>
          <span className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: s.colore }} />
          <div>
            <div className="text-base font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>{s.etichetta}</div>
            <div className="text-xs" style={{ color: '#6B6B5E', fontFamily: fontBody }}>{s.spiegazione}</div>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('home.prima.verifica.esempio.sintesi')}</div>
          <p className="text-xs leading-relaxed" style={{ color: '#1A2D52', fontFamily: fontBody }}>
            <Ricco>{t('home.prima.verifica.esempio.sintesiTesto', { mesi: MESI_SEMAFORO })}</Ricco>
          </p>
        </div>
        <div className="text-[11px] pt-3" style={{ color: '#6B6B5E', fontFamily: fontBody, borderTop: '1px solid rgba(26, 45, 82, 0.08)' }}>
          {t('home.prima.verifica.esempio.oppure')}
        </div>
      </div>
    </div>
  );
};

const MockupCertificato = () => {
  const t = useT();
  const s = SEMAFORO.verde;
  const righe = [
    { id: 'fonte', k: t('home.prima.certificato.esempio.fonte'), v: t('home.prima.certificato.esempio.fonteValore') },
    { id: 'codiceFiscale', k: t('home.prima.certificato.esempio.codiceFiscale'), v: '••••••••••••••••', mono: true },
    { id: 'emesso', k: t('home.prima.certificato.esempio.emesso'), v: fmtData(CERT_EMESSO) },
    { id: 'valido', k: t('home.prima.certificato.esempio.valido'), v: fmtData(CERT_SCADE) },
    { id: 'codice', k: t('home.prima.certificato.esempio.codice'), v: t('home.prima.certificato.esempio.codiceValore'), mono: true },
  ];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 20px 50px -20px rgba(26, 45, 82, 0.25)', border: '1px solid rgba(26, 45, 82, 0.08)' }}>
      <BarraFinestra etichetta={t('home.prima.certificato.esempio.finestra')} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>{t('home.prima.certificato.esempio.periodo')}</div>
            <div className="text-base font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
              {t('home.prima.certificato.esempio.date', { dal: fmtData(CERT_DAL), al: fmtData(CERT_AL) })}
            </div>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider"
              style={{ background: `${s.colore}15`, color: s.colore, fontFamily: fontMono }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.colore }} />
              {t('home.prima.certificato.esempio.semaforo', { semaforo: s.etichetta })}
            </div>
          </div>
          <div className="p-2 rounded-lg flex-shrink-0" style={{ border: '1px solid rgba(26, 45, 82, 0.1)' }}>
            <QrCode className="w-14 h-14" style={{ color: '#1A2D52' }} />
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] pt-3" style={{ borderTop: '1px solid rgba(26, 45, 82, 0.08)' }}>
          {righe.map((r) => (
            <React.Fragment key={r.id}>
              <dt style={{ color: '#6B6B5E', fontFamily: fontBody }}>{r.k}</dt>
              <dd style={{ color: '#1A2D52', fontFamily: r.mono ? fontMono : fontBody }}>{r.v}</dd>
            </React.Fragment>
          ))}
        </dl>
      </div>
    </div>
  );
};

const PrimaDiFirmare = () => {
  const t = useT();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const puntiVerifica = [
    t('home.prima.verifica.punto1'),
    t('home.prima.verifica.punto2'),
    t('home.prima.verifica.punto3', { ore: P3.oreEsito }),
    t('home.prima.verifica.punto4'),
    t('home.prima.verifica.punto5', { prezzo: fmtEuro(P3.prezzo), giorni: giorniTesto(P3.scalabileEntroGiorni) }),
  ];

  const puntiCertificato = [
    t('home.prima.certificato.punto1'),
    t('home.prima.certificato.punto2', { mesi: mesiTesto(PARAMETRI.mesiValiditaCertificato) }),
    t('home.prima.certificato.punto3'),
    t('home.prima.certificato.punto4'),
    t('home.prima.certificato.punto5'),
    t('home.prima.certificato.punto6', { prezzo: fmtEuro(P7.prezzo) }),
  ];

  return (
    <section ref={ref} className="py-32" style={{ background: '#F5F5F0' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <Occhiello inView={inView}>{t('home.prima.occhiello')}</Occhiello>
        <Titolo inView={inView} className="max-w-4xl mb-16">
          <Ricco evidenza={CORSIVO_TERRACOTTA}>{t('home.prima.titolo')}</Ricco>
        </Titolo>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* CRIA Verifica */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="rounded-3xl p-8 lg:p-10 flex flex-col"
            style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.06)' }}
          >
            <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ fontFamily: fontMono, color: '#C97B5C' }}>
              {t('home.prima.verifica.occhiello')}
            </p>
            <h3 className="text-3xl lg:text-4xl mb-1 leading-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52', fontWeight: 400 }}>
              {nomeProdotto('P3')}
            </h3>
            <p className="text-lg italic mb-8" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#C97B5C', fontWeight: 300 }}>
              {prezzoProdotto('P3')}
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <ul className="space-y-3">
                {puntiVerifica.map((testo, i) => <PuntoElenco key={i} colore="#C97B5C"><Ricco>{testo}</Ricco></PuntoElenco>)}
              </ul>
              <div>
                <MockupEsitoVerifica />
              </div>
            </div>

            <Link
              to="/verifica"
              className="group mt-auto inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02] self-start"
              style={{ background: '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}
            >
              {t('home.prima.verifica.pulsante')}
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Certificato */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="rounded-3xl p-8 lg:p-10 flex flex-col"
            style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.06)' }}
          >
            <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ fontFamily: fontMono, color: '#22C55E' }}>
              {t('home.prima.certificato.occhiello')}
            </p>
            <h3 className="text-3xl lg:text-4xl mb-1 leading-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52', fontWeight: 400 }}>
              <Ricco>{t('home.prima.certificato.titolo')}</Ricco>
            </h3>
            <p className="text-lg italic mb-8" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#15803D', fontWeight: 300 }}>
              {t('home.prima.certificato.prezzo', { prezzo: fmtEuro(P7.prezzo) })}
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <ul className="space-y-3">
                {puntiCertificato.map((testo, i) => <PuntoElenco key={i} colore="#22C55E"><Ricco>{testo}</Ricco></PuntoElenco>)}
              </ul>
              <div>
                <MockupCertificato />
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl mb-8" style={{ background: '#F0FDF4', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
              <Scale className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#166534' }} />
              <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#166534' }}>
                <Ricco>{t('home.prima.certificato.nota')}</Ricco>
              </p>
            </div>

            <Link
              to="/per-inquilini"
              className="group mt-auto inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02] self-start"
              style={{ background: '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}
            >
              {t('home.prima.certificato.pulsante')}
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── IL MESE, IN BREVE ────────────────────────────────────────────────────────
const IlMese = () => {
  const t = useT();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const {
    giornoScadenzaCanone, giorniFinestraCopertura, giornoChiusuraMese,
    giorniContestazione, giorniRispostaContestazione, solleciti,
  } = PARAMETRI;

  const passi = [
    {
      id: 'scadenza',
      quando: t('home.mese.passo1.quando', { giorno: giornoScadenzaCanone }),
      titolo: t('home.mese.passo1.titolo'),
      desc: t('home.mese.passo1.testo'),
    },
    {
      id: 'promemoria',
      quando: t('home.mese.passo2.quando', { numero: solleciti.length }),
      titolo: t('home.mese.passo2.titolo'),
      desc: t('home.mese.passo2.testo', { solleciti: maiuscola(elenco(solleciti)) }),
    },
    {
      id: 'segnalazione',
      quando: t('home.mese.passo3.quando', { giorni: giorniTesto(giorniFinestraCopertura) }),
      titolo: t('home.mese.passo3.titolo'),
      desc: t('home.mese.passo3.testo', { giorni: giorniTesto(giorniFinestraCopertura) }),
    },
    {
      id: 'ritardo',
      quando: t('home.mese.passo4.quando', { giorni: giorniTesto(giorniFinestraCopertura) }),
      titolo: t('home.mese.passo4.titolo'),
      desc: t('home.mese.passo4.testo'),
    },
    {
      id: 'chiusura',
      quando: t('home.mese.passo5.quando', { giorno: giornoChiusuraMese }),
      titolo: t('home.mese.passo5.titolo'),
      desc: t('home.mese.passo5.testo'),
    },
  ];

  const note = [
    {
      id: 'gestito',
      icon: Gavel,
      colore: '#1A2D52',
      titolo: t('home.mese.nota1.titolo'),
      desc: t('home.mese.nota1.testo'),
    },
    {
      id: 'incassaCria',
      icon: Wallet,
      colore: '#C97B5C',
      titolo: t('home.mese.nota2.titolo', { nomeProdotto: nomeProdotto('P2') }),
      desc: t('home.mese.nota2.testo'),
    },
    {
      id: 'senzaCopertura',
      icon: ShieldOff,
      colore: '#6B6B5E',
      titolo: t('home.mese.nota3.titolo', { nomeProdotto: nomeProdotto('P5') }),
      desc: t('home.mese.nota3.testo'),
    },
    {
      id: 'contestazione',
      icon: MessageSquare,
      colore: '#C97B5C',
      titolo: t('home.mese.nota4.titolo'),
      desc: t('home.mese.nota4.testo', {
        giorniContestazione: giorniTesto(giorniContestazione),
        giorniRisposta: giorniTesto(giorniRispostaContestazione),
      }),
    },
  ];

  return (
    <section ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

        <div className="mb-16">
          <Occhiello inView={inView}>{t('home.mese.occhiello')}</Occhiello>
          <Titolo inView={inView} className="max-w-4xl mb-6">
            <Ricco evidenza={CORSIVO_TERRACOTTA}>{t('home.mese.titolo')}</Ricco>
          </Titolo>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg max-w-2xl"
            style={{ fontFamily: fontBody, color: '#6B6B5E' }}
          >
            <Ricco>{t('home.mese.sottotitolo', { prodotti: elenco(NOMI_CHI_SEGNALA) })}</Ricco>
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6 mb-12">
          {passi.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="relative"
            >
              <div className="p-5 rounded-2xl h-full transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}>
                <div className="text-[11px] uppercase tracking-wider mb-3 font-semibold" style={{ fontFamily: fontMono, color: '#C97B5C' }}>
                  {s.quando}
                </div>
                <h3 className="text-base font-semibold mb-2 leading-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                  <Ricco>{s.titolo}</Ricco>
                </h3>
                <p className="text-xs leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                  <Ricco>{s.desc}</Ricco>
                </p>
              </div>

              {i < passi.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full items-center justify-center"
                  style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}>
                  <ArrowRight className="w-3 h-3" style={{ color: '#C97B5C' }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="rounded-3xl p-8 lg:p-12"
          style={{ background: '#F5F5F0' }}
        >
          <p className="text-xs uppercase tracking-[0.25em] mb-8" style={{ fontFamily: fontMono, color: '#C97B5C' }}>
            {t('home.mese.poi')}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {note.map(({ id, icon: Icon, colore, titolo, desc }) => (
              <div key={id} className="p-6 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.06)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${colore}15` }}>
                  <Icon className="w-5 h-5" style={{ color: colore }} />
                </div>
                <h4 className="text-lg font-semibold mb-2 leading-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                  <Ricco>{titolo}</Ricco>
                </h4>
                <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                  <Ricco>{desc}</Ricco>
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/come-funziona"
            className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
            style={{ background: 'transparent', color: '#1A2D52', fontFamily: fontBody, border: '1.5px solid rgba(26, 45, 82, 0.2)' }}
          >
            {t('home.mese.pulsante')}
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
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

  const punti = [
    { id: 'documenti', icon: FileText, testo: t('home.chiusura.punto1') },
    { id: 'movimenti', icon: Lock, testo: t('home.chiusura.punto2', { mesi: MESI_SEMAFORO }) },
    { id: 'contratto', icon: PenLine, testo: t('home.chiusura.punto3') },
  ];

  return (
    <section ref={ref} className="py-32 relative overflow-hidden" style={{ background: '#1A2D52' }}>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(201, 123, 92, 0.4), transparent 70%)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2), transparent 70%)' }} />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
        <div className="max-w-4xl">
          <Occhiello inView={inView} colore="#E8B59C">{t('home.chiusura.occhiello')}</Occhiello>

          <Titolo inView={inView} colore="#FFFFFF" className="mb-10" fontSize="clamp(2.5rem, 6vw, 5rem)">
            <Ricco evidenza={CORSIVO_ROSA}>{t('home.chiusura.titolo')}</Ricco>
          </Titolo>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl mb-10 max-w-2xl leading-relaxed"
            style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            <Ricco>{t('home.chiusura.testo')}</Ricco>
          </motion.p>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            {punti.map(({ id, icon: Icon, testo }) => (
              <li key={id} className="flex items-start gap-3">
                <Icon className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: '#E8B59C' }} />
                <span className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}><Ricco>{testo}</Ricco></span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link
              to="/inizia"
              className="group flex items-center gap-3 px-8 py-5 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
              style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}
            >
              {t('home.chiusura.pulsanteInizia')}
              <span className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                style={{ background: '#1A2D52', color: '#FFFFFF' }}>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-3 px-8 py-5 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
              style={{ background: 'transparent', color: '#FFFFFF', fontFamily: fontBody, border: '1.5px solid rgba(255, 255, 255, 0.3)' }}
            >
              {t('home.chiusura.pulsanteRegistrati')}
            </Link>
            <p className="text-sm sm:ml-2" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.6)' }}>
              {t('home.chiusura.giaRegistrato')}{' '}<Link to="/login" className="font-semibold underline underline-offset-4" style={{ color: '#FFFFFF' }}>{t('home.chiusura.accedi')}</Link>
              {' · '}
              {t('home.chiusura.domande')}{' '}<Link to="/supporto" className="font-semibold underline underline-offset-4" style={{ color: '#FFFFFF' }}>{t('home.chiusura.supporto')}</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── HOMEPAGE ────────────────────────────────────────────────────────────────
const HomePage = () => {
  const t = useT();
  return (
    <>
      <Helmet>
        <title>{semplice(t('home.meta.titolo'))}</title>
        <meta name="description" content={semplice(t('home.meta.descrizione', { nomeProdotto: P3.nome }))} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300,50;0,9..144,400,50;0,9..144,500,50;0,9..144,600,50;0,9..144,700,50;1,9..144,300,50;1,9..144,400,50&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Helmet>

      <div style={{ background: '#FFFFFF', fontFamily: fontBody }}>
        <VetrinaHeader activePage="home" />
        <Hero />
        <Semaforo />
        <QuattroPorte />
        <Listino />
        <PrimaDiFirmare />
        <IlMese />
        <CTAFinale />
        <VetrinaFooter />
      </div>
    </>
  );
};

export default HomePage;
