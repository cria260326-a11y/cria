import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, CheckCircle2, XCircle,
  Users, CircleDashed, Scale, Eye, Lock, Bell,
  FolderOpen, Handshake, Shield, Paperclip, UserCheck
} from 'lucide-react';

import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';
import Ricco, { semplice } from '@/components/testi/Ricco';
import { useT } from '@/lib/testi';
import {
  PRODOTTI, PRODOTTI_PROPRIETARIO, PARAMETRI, nomeProdotto, prezzoProdotto, fmtEuro
} from '@/data/catalogo';
import { SEMAFORO, ORDINE_SEMAFORO, ESITI_MESE, esitoMese, analizzaMesi, MESI_SEMAFORO } from '@/lib/semaforo';

// I testi sono in src/testi/catalogo/comeFunziona.js: l'admin li cambia da Admin → Testi.
// Qui restano nomi dei prodotti, prezzi, giorni e mesi, che vengono dal listino e dal semaforo.

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

const G = PARAMETRI;

const maiuscola = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Le parti *in evidenza* dei titoli (corsivo colorato) e quelle **in grassetto**.
const corsivo = (colore) => (s) => <span className="italic" style={{ color: colore }}>{s}</span>;
const grassetto = (colore) => (s) => <strong style={{ color: colore }}>{s}</strong>;

// I prodotti del proprietario con garanzia, per nome (CRIA Gestione, CRIA Completo).
const NOMI_CON_GARANZIA = [...new Set(
  PRODOTTI_PROPRIETARIO.filter(c => PRODOTTI[c].garanzia).map(c => PRODOTTI[c].nome)
)].join(' e ');

// Titolo di sezione riusato: numero, sopratitolo, titolo, testo.
const IntestazioneSezione = ({ inView, num, kicker, accent, dark, children, testo }) => (
  <div className="grid lg:grid-cols-12 gap-12 mb-16">
    <div className="lg:col-span-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-6"
      >
        <span className="text-5xl leading-none italic"
          style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: accent, fontWeight: 300 }}>
          {num}
        </span>
        <p className="text-xs uppercase tracking-[0.25em]" style={{ fontFamily: fontMono, color: accent }}>
          {kicker}
        </p>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="leading-[1.05] tracking-tight mb-6"
        style={{
          fontFamily: fontHeader,
          fontVariationSettings: fontSettingsSoft,
          color: dark ? '#FFFFFF' : '#1A2D52',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 400,
        }}
      >
        {children}
      </motion.h2>

      {testo && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg max-w-2xl leading-relaxed"
          style={{ fontFamily: fontBody, color: dark ? 'rgba(255, 255, 255, 0.7)' : '#6B6B5E' }}
        >
          <Ricco>{testo}</Ricco>
        </motion.p>
      )}
    </div>
  </div>
);

// Lista a passi numerati, come nei vecchi flussi.
const Passi = ({ inView, passi, accent, dark, from = 20 }) => (
  <div className="space-y-8">
    {passi.map((s, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: from }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
        className="flex gap-6 group"
      >
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
            <span className="text-sm font-bold" style={{ fontFamily: fontMono, color: accent }}>
              {String(i + 1).padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className="flex-1 pt-2 pb-4"
          style={{ borderBottom: i < passi.length - 1 ? `1px solid ${dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(26, 45, 82, 0.08)'}` : 'none' }}>
          <h3 className="text-xl font-semibold mb-2"
            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: dark ? '#FFFFFF' : '#1A2D52' }}>
            <Ricco>{s.titolo}</Ricco>
          </h3>
          <p className="text-base leading-relaxed" style={{ fontFamily: fontBody, color: dark ? 'rgba(255, 255, 255, 0.65)' : '#6B6B5E' }}>
            <Ricco>{s.desc}</Ricco>
          </p>
        </div>
      </motion.div>
    ))}
  </div>
);

const BarraFinestra = ({ label }) => (
  <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.08)' }}>
    <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
    <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
    <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
    <div className="ml-auto text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>{label}</div>
  </div>
);

// ─── HERO ─────────────────────────────────────────────────────────────────────
// L'indice in alto: i nomi dei pulsanti sono comeFunziona.hero.indice1…6, nell'ordine.
const SEZIONI = [
  { id: 'per-iniziare', color: '#22C55E' },
  { id: 'semaforo', color: '#1A2D52', featured: true },
  { id: 'il-mese', color: '#C97B5C' },
  { id: 'contestazione', color: '#1A2D52' },
  { id: 'se-non-paga', color: '#EF4444' },
  { id: 'prodotti', color: '#C97B5C' },
];

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const Hero = () => {
  const t = useT();
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
                {t('comeFunziona.hero.occhiello')}
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
                fontSize: 'clamp(2.25rem, 5vw, 4.25rem)',
                fontWeight: 400,
                letterSpacing: '-0.03em',
              }}
            >
              <Ricco evidenza={corsivo('#C97B5C')}>{t('comeFunziona.hero.titolo')}</Ricco>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg lg:text-xl max-w-xl mb-10 leading-relaxed"
              style={{ fontFamily: fontBody, color: '#6B6B5E', fontWeight: 400 }}
            >
              <Ricco>{t('comeFunziona.hero.sottotitolo')}</Ricco>
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              {SEZIONI.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => scrollTo(p.id)}
                  className="group flex items-center gap-3 pl-3 pr-5 py-3 rounded-full transition-all hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    background: p.featured ? '#1A2D52' : '#FFFFFF',
                    color: p.featured ? '#FFFFFF' : '#1A2D52',
                    fontFamily: fontBody,
                    border: p.featured ? 'none' : `1.5px solid ${p.color}30`,
                  }}
                >
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: p.featured ? '#22C55E' : p.color, color: '#FFFFFF', fontFamily: fontMono }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-semibold">{t(`comeFunziona.hero.indice${i + 1}`)}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-50 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="lg:col-span-5 relative"
          >
            <MeseInBreve />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const MeseInBreve = () => {
  const t = useT();
  const righe = [
    { k: t('comeFunziona.hero.meseInBreve.riga1.quando', { giorno: G.giornoScadenzaCanone }), v: t('comeFunziona.hero.meseInBreve.riga1.testo'), color: '#1A2D52' },
    { k: t('comeFunziona.hero.meseInBreve.riga2.quando', { numeroSolleciti: G.solleciti.length }), v: t('comeFunziona.hero.meseInBreve.riga2.testo'), color: SEMAFORO.giallo.colore },
    { k: t('comeFunziona.hero.meseInBreve.riga3.quando', { giorni: G.giorniFinestraCopertura }), v: t('comeFunziona.hero.meseInBreve.riga3.testo'), color: SEMAFORO.verde.colore },
    { k: t('comeFunziona.hero.meseInBreve.riga4.quando', { giorno: G.giornoChiusuraMese }), v: t('comeFunziona.hero.meseInBreve.riga4.testo'), color: ESITI_MESE.non_rilevato.colore },
  ];

  return (
    <div className="relative">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-2xl p-6 lg:p-8"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 30px 80px -20px rgba(26, 45, 82, 0.18), 0 10px 30px -10px rgba(26, 45, 82, 0.1)',
          border: '1px solid rgba(26, 45, 82, 0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
            {t('comeFunziona.hero.meseInBreve.titolo')}
          </div>
          <div className="flex items-center gap-1.5">
            {['verde', 'giallo', 'rosso'].map(k => (
              <div key={k} className="w-1.5 h-1.5 rounded-full" style={{ background: SEMAFORO[k].colore }} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {righe.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.12 }}
              className="flex items-start gap-4"
            >
              <div className="relative flex-shrink-0 pt-1">
                <div className="w-3 h-3 rounded-full relative z-10" style={{ background: r.color }} />
                {i < righe.length - 1 && (
                  <div className="absolute top-4 left-1/2 w-0.5 h-8 -translate-x-1/2" style={{ background: `${r.color}40` }} />
                )}
              </div>
              <div>
                <div className="text-sm font-bold leading-tight"
                  style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                  {r.k}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                  {r.v}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute -bottom-6 -right-4 rounded-xl p-3"
        style={{ background: '#1A2D52', color: '#FFFFFF', boxShadow: '0 15px 35px -8px rgba(26, 45, 82, 0.4)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Bell className="w-3.5 h-3.5" style={{ color: '#E8B59C' }} />
          <span className="text-[9px] uppercase tracking-wider opacity-80" style={{ fontFamily: fontMono }}>
            {t('comeFunziona.hero.domanda.testo')}
          </span>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: SEMAFORO.verde.colore, fontFamily: fontBody }}>{t('comeFunziona.hero.domanda.si')}</span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(255, 255, 255, 0.12)', fontFamily: fontBody }}>{t('comeFunziona.hero.domanda.no')}</span>
        </div>
      </motion.div>
    </div>
  );
};

// ─── 01 PER INIZIARE ──────────────────────────────────────────────────────────
const PerIniziare = () => {
  const t = useT();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const passi = [1, 2, 3, 4, 5, 6].map(n => ({
    titolo: t(`comeFunziona.perIniziare.passo${n}.titolo`),
    desc: t(`comeFunziona.perIniziare.passo${n}.testo`, { mesi: MESI_SEMAFORO }),
  }));

  return (
    <section id="per-iniziare" ref={ref} className="py-32 scroll-mt-20" style={{ background: '#FFFFFF' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <IntestazioneSezione
          inView={inView} num="01" kicker={t('comeFunziona.perIniziare.occhiello')} accent="#22C55E"
          testo={t('comeFunziona.perIniziare.intro')}
        >
          <Ricco evidenza={corsivo('#22C55E')}>{t('comeFunziona.perIniziare.titolo')}</Ricco>
        </IntestazioneSezione>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <MockupContesto />
          </div>
          <div className="lg:col-span-7">
            <Passi inView={inView} passi={passi} accent="#22C55E" />
          </div>
        </div>
      </div>
    </section>
  );
};

const MockupContesto = () => {
  const t = useT();
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 30px 80px -20px rgba(26, 45, 82, 0.25)', border: '1px solid rgba(26, 45, 82, 0.06)' }}>
      <BarraFinestra label={t('comeFunziona.perIniziare.esempio.barra')} />
      <div className="p-6 space-y-5">
        <div>
          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
            {t('comeFunziona.perIniziare.esempio.occhiello')}
          </div>
          <div className="text-xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
            {t('comeFunziona.perIniziare.esempio.titolo')}
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: '#F0FDF4', border: '2px solid #22C55E' }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#22C55E' }}>
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#166534' }}>
                {t('comeFunziona.perIniziare.esempio.proprietario.titolo')}
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#15803D', fontFamily: fontBody }}>
                {t('comeFunziona.perIniziare.esempio.proprietario.testo')}
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}>
            <div className="w-5 h-5 rounded-full" style={{ border: '2px solid rgba(26, 45, 82, 0.2)' }} />
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                {t('comeFunziona.perIniziare.esempio.inquilino.titolo')}
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                {t('comeFunziona.perIniziare.esempio.inquilino.testo')}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-2" style={{ borderTop: '1px solid rgba(26, 45, 82, 0.08)' }}>
          <div className="flex items-center gap-2 text-xs" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
            <UserCheck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#22C55E' }} />
            {t('comeFunziona.perIniziare.esempio.identita')}
          </div>
          <div className="text-[10px] uppercase tracking-wider pt-2" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
            {t('comeFunziona.perIniziare.esempio.documenti')}
          </div>
          {[
            { nome: t('comeFunziona.perIniziare.esempio.documento1'), ok: true },
            { nome: t('comeFunziona.perIniziare.esempio.documento2', { mesi: MESI_SEMAFORO }), ok: false },
          ].map((d, i) => (
            <div key={i} className="flex items-center justify-between text-xs" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
              <span className="flex items-center gap-2">
                {d.ok
                  ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
                  : <CircleDashed className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />}
                {d.nome}
              </span>
              <span style={{ color: d.ok ? '#15803D' : '#6B6B5E' }}>{d.ok ? t('comeFunziona.perIniziare.esempio.caricato') : t('comeFunziona.perIniziare.esempio.manca')}</span>
            </div>
          ))}
          <div className="text-[10px] pt-1" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
            {t('comeFunziona.perIniziare.esempio.nota')}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── 02 IL SEMAFORO ───────────────────────────────────────────────────────────
// Mesi d'esempio per il mockup: il risultato lo calcola lib/semaforo, non la pagina.
const MESI_ESEMPIO = [
  { mese: '2025-10', stato: 'pagato', giorno: 3 },
  { mese: '2025-11', stato: 'pagato', giorno: 2 },
  { mese: '2025-12', stato: 'pagato', giorno: 4 },
  { mese: '2026-01', stato: 'non_rilevato' },
  { mese: '2026-02', stato: 'pagato', giorno: 3 },
  { mese: '2026-03', stato: 'pagato', giorno: 7 },
  { mese: '2026-04', stato: 'pagato', giorno: 2 },
  { mese: '2026-05', stato: 'pagato', giorno: 3 },
  { mese: '2026-06', stato: 'pagato', giorno: 4 },
  { mese: '2026-07', stato: 'contestato' },
  { mese: '2026-08', stato: 'pagato', giorno: 2 },
  { mese: '2026-09', stato: 'pagato', giorno: 3 },
];

// Le icone delle cinque regole: i testi sono comeFunziona.semaforo.regola1…5.
const ICONE_REGOLE = [Users, CircleDashed, Scale, Eye, Lock];

const IlSemaforo = () => {
  const t = useT();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const regole = ICONE_REGOLE.map((icon, i) => ({
    icon,
    titolo: t(`comeFunziona.semaforo.regola${i + 1}.titolo`),
    desc: t(`comeFunziona.semaforo.regola${i + 1}.testo`),
  }));

  return (
    <section id="semaforo" ref={ref} className="py-32 relative overflow-hidden scroll-mt-20" style={{ background: '#0F1B33' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <IntestazioneSezione
          inView={inView} num="02" kicker={t('comeFunziona.semaforo.occhiello')} accent="#E8B59C" dark
          testo={t('comeFunziona.semaforo.intro', { mesi: MESI_SEMAFORO })}
        >
          <Ricco evidenza={corsivo('#E8B59C')}>{t('comeFunziona.semaforo.titolo')}</Ricco>
        </IntestazioneSezione>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-10">
            <div className="grid sm:grid-cols-2 gap-4">
              {ORDINE_SEMAFORO.map((k, i) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                  className="p-6 rounded-2xl"
                  style={{ background: 'rgba(255, 255, 255, 0.04)', border: `1px solid ${SEMAFORO[k].colore}40` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-4 h-4 rounded-full flex-shrink-0"
                      style={k === 'storico_insufficiente'
                        ? { border: `2px dashed ${SEMAFORO[k].colore}` }
                        : { background: SEMAFORO[k].colore, boxShadow: `0 0 16px ${SEMAFORO[k].colore}80` }} />
                    <h3 className="text-lg font-semibold"
                      style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF' }}>
                      {SEMAFORO[k].etichetta}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.65)' }}>
                    {SEMAFORO[k].spiegazione}.
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="space-y-5">
              {regole.map((r, i) => {
                const Icon = r.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
                    className="flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(232, 181, 156, 0.12)' }}>
                      <Icon className="w-5 h-5" style={{ color: '#E8B59C' }} />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold"
                        style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF' }}>
                        <Ricco>{r.titolo}</Ricco>
                      </h4>
                      <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.65)' }}>
                        <Ricco>{r.desc}</Ricco>
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <MockupSemaforo />
          </div>
        </div>
      </div>
    </section>
  );
};

const MockupSemaforo = () => {
  const t = useT();
  const analisi = analizzaMesi(MESI_ESEMPIO);
  const s = SEMAFORO[analisi.semaforo];
  const media = analisi.media == null ? null : analisi.media.toLocaleString('it-IT');
  // Da gennaio a dicembre, separate da uno spazio.
  const iniziali = semplice(t('comeFunziona.semaforo.esempio.inizialiMesi')).trim().split(/\s+/);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.5)' }}>
      <BarraFinestra label={t('comeFunziona.semaforo.esempio.barra')} />
      <div className="p-6 space-y-5">
        <div>
          <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
            {t('comeFunziona.semaforo.esempio.occhiello', { mesi: MESI_SEMAFORO })}
          </div>
          <div className="text-xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
            {t('comeFunziona.semaforo.esempio.titolo')}
          </div>
        </div>

        <div className="p-4 rounded-xl flex items-center gap-4" style={{ background: `${s.colore}14`, border: `1px solid ${s.colore}40` }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: s.colore }}>
            <CheckCircle2 className="w-6 h-6" style={{ color: '#FFFFFF' }} />
          </div>
          <div>
            <div className="text-lg font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
              {s.etichetta}
            </div>
            <div className="text-xs" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
              {media ? t('comeFunziona.semaforo.esempio.giornoMedio', { media }) : s.spiegazione}
            </div>
          </div>
        </div>

        <div>
          <div className="flex gap-1">
            {MESI_ESEMPIO.map(m => {
              const e = ESITI_MESE[esitoMese(m)];
              return (
                <div key={m.mese} className="flex-1 text-center">
                  <div className="h-8 rounded"
                    title={e.etichetta}
                    style={e.pesa ? { background: e.colore } : { background: '#FFFFFF', border: `1.5px dashed ${e.colore}` }} />
                  <div className="text-[9px] mt-1" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                    {iniziali[Number(m.mese.slice(5)) - 1]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5 pt-3" style={{ borderTop: '1px solid rgba(26, 45, 82, 0.08)' }}>
          {[
            { colore: ESITI_MESE.puntuale.colore, testo: t('comeFunziona.semaforo.esempio.rilevati', { numero: analisi.rilevati }) },
            { colore: ESITI_MESE.non_rilevato.colore, testo: t('comeFunziona.semaforo.esempio.nonRilevati', { numero: analisi.nonRilevati }), tratteggio: true },
            { colore: ESITI_MESE.in_sospeso.colore, testo: t('comeFunziona.semaforo.esempio.contestati', { numero: analisi.inSospeso }), tratteggio: true },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-2 text-xs" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
              <span className="w-3 h-3 rounded-sm flex-shrink-0"
                style={r.tratteggio ? { border: `1.5px dashed ${r.colore}` } : { background: r.colore }} />
              {r.testo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── 03 IL MESE ───────────────────────────────────────────────────────────────
const IlMese = () => {
  const t = useT();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const tappe = [
    { k: t('comeFunziona.mese.tappa1.quando', { giorno: G.giornoScadenzaCanone }), v: t('comeFunziona.mese.tappa1.testo'), color: '#1A2D52' },
    { k: t('comeFunziona.mese.tappa2.quando', { numeroSolleciti: G.solleciti.length }), v: t('comeFunziona.mese.tappa2.testo', { solleciti: maiuscola(G.solleciti.join(', ')) }), color: SEMAFORO.giallo.colore },
    { k: t('comeFunziona.mese.tappa3.quando', { giorni: G.giorniFinestraCopertura }), v: t('comeFunziona.mese.tappa3.testo'), color: SEMAFORO.verde.colore },
    { k: t('comeFunziona.mese.tappa4.quando', { giorno: G.giornoChiusuraMese }), v: t('comeFunziona.mese.tappa4.testo'), color: ESITI_MESE.non_rilevato.colore },
  ];

  const esiti = [
    {
      color: SEMAFORO.verde.colore,
      titolo: t('comeFunziona.mese.esito1.titolo', { giorni: G.giorniFinestraCopertura }),
      semaforo: t('comeFunziona.mese.esito1.semaforo'),
      copertura: t('comeFunziona.mese.esito1.copertura'),
      icon: CheckCircle2,
    },
    {
      color: SEMAFORO.giallo.colore,
      titolo: t('comeFunziona.mese.esito2.titolo', { giorni: G.giorniFinestraCopertura }),
      semaforo: t('comeFunziona.mese.esito2.semaforo'),
      copertura: t('comeFunziona.mese.esito2.copertura'),
      icon: Bell,
    },
    {
      color: ESITI_MESE.non_rilevato.colore,
      titolo: t('comeFunziona.mese.esito3.titolo', { giorno: G.giornoChiusuraMese }),
      semaforo: t('comeFunziona.mese.esito3.semaforo'),
      copertura: t('comeFunziona.mese.esito3.copertura'),
      icon: CircleDashed,
    },
  ];

  return (
    <section id="il-mese" ref={ref} className="py-32 scroll-mt-20" style={{ background: '#FFFFFF' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <IntestazioneSezione
          inView={inView} num="03" kicker={t('comeFunziona.mese.occhiello')} accent="#C97B5C"
          testo={t('comeFunziona.mese.intro', { numeroSolleciti: G.solleciti.length })}
        >
          <Ricco evidenza={corsivo('#C97B5C')}>{t('comeFunziona.mese.titolo')}</Ricco>
        </IntestazioneSezione>

        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {tappe.map((tappa, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="relative pt-6"
              style={{ borderTop: `2px solid ${tappa.color}` }}
            >
              <div className="absolute -top-[7px] left-0 w-3 h-3 rounded-full" style={{ background: tappa.color }} />
              <div className="text-2xl font-bold mb-2"
                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                {tappa.k}
              </div>
              <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                <Ricco>{tappa.v}</Ricco>
              </p>
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
          <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ fontFamily: fontMono, color: '#C97B5C' }}>
            {t('comeFunziona.mese.esiti.occhiello')}
          </p>
          <h3 className="text-2xl lg:text-3xl font-bold mb-10 max-w-2xl"
            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52', fontWeight: 400 }}>
            <Ricco evidenza={corsivo('#C97B5C')}>{t('comeFunziona.mese.esiti.titolo')}</Ricco>
          </h3>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {esiti.map((e, i) => {
              const Icon = e.icon;
              return (
                <div key={i} className="p-6 rounded-2xl" style={{ background: '#FFFFFF', border: `1px solid ${e.color}30` }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${e.color}18` }}>
                    <Icon className="w-5 h-5" style={{ color: e.color }} />
                  </div>
                  <h4 className="text-lg font-semibold mb-4"
                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                    <Ricco>{e.titolo}</Ricco>
                  </h4>
                  {[
                    { id: 'semaforo', label: t('comeFunziona.mese.esiti.voceSemaforo'), testo: e.semaforo },
                    { id: 'copertura', label: t('comeFunziona.mese.esiti.voceCopertura'), testo: e.copertura },
                  ].map(r => (
                    <div key={r.id} className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(26, 45, 82, 0.06)' }}>
                      <div className="text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                        {r.label}
                      </div>
                      <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                        <Ricco>{r.testo}</Ricco>
                      </p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
            <p>
              <Ricco grassetto={grassetto('#1A2D52')}>{t('comeFunziona.mese.esiti.nota1')}</Ricco>
            </p>
            <p>
              <Ricco grassetto={grassetto('#1A2D52')}>{t('comeFunziona.mese.esiti.nota2', { nomeProdotto: nomeProdotto('P2') })}</Ricco>
            </p>
            <p>
              <Ricco grassetto={grassetto('#1A2D52')}>{t('comeFunziona.mese.esiti.nota3', { nomeProdotto: nomeProdotto('P5') })}</Ricco>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── 04 LA CONTESTAZIONE ──────────────────────────────────────────────────────
const LaContestazione = () => {
  const t = useT();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const passi = [
    { titolo: t('comeFunziona.contestazione.passo1.titolo'), desc: t('comeFunziona.contestazione.passo1.testo') },
    { titolo: t('comeFunziona.contestazione.passo2.titolo'), desc: t('comeFunziona.contestazione.passo2.testo') },
    { titolo: t('comeFunziona.contestazione.passo3.titolo'), desc: t('comeFunziona.contestazione.passo3.testo', { giorni: G.giorniContestazione }) },
    { titolo: t('comeFunziona.contestazione.passo4.titolo'), desc: t('comeFunziona.contestazione.passo4.testo') },
    { titolo: t('comeFunziona.contestazione.passo5.titolo'), desc: t('comeFunziona.contestazione.passo5.testo', { giorni: G.giorniRispostaContestazione }) },
  ];

  return (
    <section id="contestazione" ref={ref} className="py-32 scroll-mt-20" style={{ background: '#F5F5F0' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <IntestazioneSezione
          inView={inView} num="04" kicker={t('comeFunziona.contestazione.occhiello')} accent="#1A2D52"
          testo={t('comeFunziona.contestazione.intro')}
        >
          <Ricco evidenza={corsivo('#C97B5C')}>{t('comeFunziona.contestazione.titolo')}</Ricco>
        </IntestazioneSezione>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <Passi inView={inView} passi={passi} accent="#1A2D52" from={-20} />
          </div>
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <MockupContestazione />
          </div>
        </div>
      </div>
    </section>
  );
};

const MockupContestazione = () => {
  const t = useT();
  const sospeso = ESITI_MESE.in_sospeso;
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 30px 80px -20px rgba(26, 45, 82, 0.25)', border: '1px solid rgba(26, 45, 82, 0.06)' }}>
      <BarraFinestra label={t('comeFunziona.contestazione.esempio.barra')} />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-wider" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
            {t('comeFunziona.contestazione.esempio.occhiello')}
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: `${sospeso.colore}18`, color: sospeso.colore, fontFamily: fontMono }}>
            {sospeso.etichetta}
          </span>
        </div>

        <div className="text-xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
          {t('comeFunziona.contestazione.esempio.titolo')}
        </div>

        <div className="p-4 rounded-xl space-y-2" style={{ background: '#F5F5F0' }}>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
            {t('comeFunziona.contestazione.esempio.tuaContestazione')}
          </div>
          <p className="text-sm" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
            {t('comeFunziona.contestazione.esempio.messaggio')}
          </p>
          <div className="flex items-center gap-2 text-xs" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
            <Paperclip className="w-3.5 h-3.5" style={{ color: '#6B6B5E' }} />
            {t('comeFunziona.contestazione.esempio.allegato')}
          </div>
        </div>

        <div className="space-y-2 text-xs" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
          <div className="flex items-start gap-2">
            <CircleDashed className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: sospeso.colore }} />
            {t('comeFunziona.contestazione.esempio.meseFuori')}
          </div>
          <div className="flex items-start gap-2">
            <Scale className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#1A2D52' }} />
            {t('comeFunziona.contestazione.esempio.decisione', { giorni: G.giorniRispostaContestazione })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── 05 SE IL CANONE NON ARRIVA ───────────────────────────────────────────────
const SeNonPaga = () => {
  const t = useT();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const passi = [
    { icon: FolderOpen, titolo: t('comeFunziona.seNonPaga.passo1.titolo'), desc: t('comeFunziona.seNonPaga.passo1.testo', { giorni: G.giorniFinestraCopertura }), color: '#E8B59C' },
    { icon: Handshake, titolo: t('comeFunziona.seNonPaga.passo2.titolo'), desc: t('comeFunziona.seNonPaga.passo2.testo'), color: '#22C55E' },
    { icon: Shield, titolo: t('comeFunziona.seNonPaga.passo3.titolo'), desc: t('comeFunziona.seNonPaga.passo3.testo'), color: '#F59E0B' },
  ];

  return (
    <section id="se-non-paga" ref={ref} className="py-32 relative overflow-hidden scroll-mt-20" style={{ background: '#0F1B33' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <IntestazioneSezione
          inView={inView} num="05" kicker={t('comeFunziona.seNonPaga.occhiello')} accent="#E8B59C" dark
          testo={t('comeFunziona.seNonPaga.intro', { prodottiConGaranzia: NOMI_CON_GARANZIA })}
        >
          <Ricco evidenza={corsivo('#E8B59C')}>{t('comeFunziona.seNonPaga.titolo')}</Ricco>
        </IntestazioneSezione>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {passi.map((d, i) => {
            const Icon = d.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${d.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: d.color }} />
                </div>
                <h4 className="text-lg font-semibold mb-2"
                  style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF' }}>
                  <Ricco>{d.titolo}</Ricco>
                </h4>
                <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.65)' }}>
                  <Ricco>{d.desc}</Ricco>
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="rounded-3xl p-8 lg:p-12 grid lg:grid-cols-12 gap-8"
          style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ fontFamily: fontMono, color: '#E8B59C' }}>
              {t('comeFunziona.seNonPaga.senzaCopertura.occhiello')}
            </p>
            <h3 className="text-2xl lg:text-3xl mb-4"
              style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF', fontWeight: 400 }}>
              <Ricco evidenza={corsivo('#E8B59C')}>{t('comeFunziona.seNonPaga.senzaCopertura.titolo')}</Ricco>
            </h3>
            <p className="text-base leading-relaxed" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}>
              <Ricco>{t('comeFunziona.seNonPaga.senzaCopertura.testo')}</Ricco>
            </p>
          </div>
          <div className="lg:col-span-5 flex items-start gap-4 p-6 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
            <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}>
              <Ricco grassetto={grassetto('#FFFFFF')}>{t('comeFunziona.seNonPaga.senzaCopertura.nota', { nomeProdotto: nomeProdotto('P5') })}</Ricco>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── 06 I PRODOTTI DEL PROPRIETARIO ───────────────────────────────────────────
// Gli id restano quelli linkati dalle altre pagine (/come-funziona#cria-gestione).
const ANCORE_PRODOTTO = { P1: 'cria-gestione', P1E: 'cria-gestione-esistente', P2: 'cria-completo', P5: 'cria-segnalazione' };
const COLORI_PRODOTTO = { P1: '#22C55E', P1E: '#0EA5E9', P2: '#1A2D52', P5: '#6B6B5E' };

const Si = ({ testo }) => (
  <span className="inline-flex items-center gap-1.5 justify-center">
    <CheckCircle2 className="w-4 h-4" style={{ color: '#22C55E' }} /> {testo}
  </span>
);
const No = ({ testo }) => (
  <span className="inline-flex items-center gap-1.5 justify-center" style={{ color: '#9CA3AF' }}>
    <XCircle className="w-4 h-4" /> {testo}
  </span>
);

const TabellaProdotti = () => {
  const t = useT();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  // La franchigia in mesi, al singolare o al plurale.
  const franchigia = (n) => t(n === 1 ? 'comeFunziona.prodotti.tabella.franchigiaUnMese' : 'comeFunziona.prodotti.tabella.franchigiaMesi', { mesi: n });

  const righe = [
    { label: t('comeFunziona.prodotti.tabella.prezzo'), cella: (p, c) => <strong style={{ color: '#1A2D52' }}>{prezzoProdotto(c)}</strong> },
    { label: t('comeFunziona.prodotti.tabella.garanzia'), cella: (p) => (p.garanzia ? <Si testo={t('comeFunziona.prodotti.tabella.garanziaSi')} /> : <No testo={t('comeFunziona.prodotti.tabella.garanziaNo')} />) },
    { label: t('comeFunziona.prodotti.tabella.franchigia'), cella: (p) => (p.garanzia ? franchigia(p.franchigiaMesi) : t('comeFunziona.prodotti.tabella.franchigiaNessuna')) },
    { label: t('comeFunziona.prodotti.tabella.chiIncassa'), cella: (p) => (p.incassa === 'cria' ? t('comeFunziona.prodotti.tabella.incassaCria') : t('comeFunziona.prodotti.tabella.incassaTu')) },
    { label: t('comeFunziona.prodotti.tabella.segnalazione'), cella: (p) => (p.incassa === 'cria' ? t('comeFunziona.prodotti.tabella.segnalazioneCria') : t('comeFunziona.prodotti.tabella.segnalazioneTu')) },
    { label: t('comeFunziona.prodotti.tabella.semaforo'), cella: () => <Si testo={t('comeFunziona.prodotti.tabella.semaforoSi')} /> },
  ];

  return (
    <section id="prodotti" ref={ref} className="py-32 scroll-mt-20" style={{ background: '#F5F5F0' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <IntestazioneSezione
          inView={inView} num="06" kicker={t('comeFunziona.prodotti.occhiello')} accent="#C97B5C"
          testo={t('comeFunziona.prodotti.intro')}
        >
          <Ricco evidenza={corsivo('#C97B5C')}>{t('comeFunziona.prodotti.titolo')}</Ricco>
        </IntestazioneSezione>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-2xl overflow-x-auto"
          style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}
        >
          <div className="min-w-[820px]">
            <div className="grid grid-cols-5 px-6 py-5 gap-4" style={{ borderBottom: '1px solid rgba(26, 45, 82, 0.1)' }}>
              <div className="text-xs uppercase tracking-wider self-end" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                {t('comeFunziona.prodotti.tabella.prodotto')}
              </div>
              {PRODOTTI_PROPRIETARIO.map(c => {
                const p = PRODOTTI[c];
                return (
                  <div key={c} id={ANCORE_PRODOTTO[c]} className="text-center scroll-mt-32">
                    <div className="text-base font-bold"
                      style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: COLORI_PRODOTTO[c] }}>
                      {p.nome}
                    </div>
                    <div className="text-[11px] mt-0.5 min-h-[1rem]" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                      {p.variante || ' '}
                    </div>
                  </div>
                );
              })}
            </div>

            {righe.map((r, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-[#F5F5F0] transition-colors text-sm"
                style={{ borderBottom: '1px solid rgba(26, 45, 82, 0.06)' }}>
                <div className="font-medium" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                  {r.label}
                </div>
                {PRODOTTI_PROPRIETARIO.map(c => (
                  <div key={c} className="text-center" style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                    {r.cella(PRODOTTI[c], c)}
                  </div>
                ))}
              </div>
            ))}

            <div className="grid grid-cols-5 gap-4 px-6 py-5 text-xs leading-relaxed">
              <div className="font-medium text-sm" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                {t('comeFunziona.prodotti.tabella.inBreve')}
              </div>
              {PRODOTTI_PROPRIETARIO.map(c => (
                <div key={c} style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                  {PRODOTTI[c].sintesi}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── CTA FINALE — LE QUATTRO PORTE ────────────────────────────────────────────
const CTAFinale = () => {
  const t = useT();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const porte = [
    {
      chi: t('comeFunziona.chiusura.porta1.chi'),
      cosa: t('comeFunziona.chiusura.porta1.titolo'),
      dettaglio: t('comeFunziona.chiusura.porta1.testo'),
      to: '/per-proprietari',
    },
    {
      chi: t('comeFunziona.chiusura.porta2.chi'),
      cosa: t('comeFunziona.chiusura.porta2.titolo'),
      dettaglio: t('comeFunziona.chiusura.porta2.testo', { nomeProdotto: nomeProdotto('P3'), prezzo: prezzoProdotto('P3'), ore: PRODOTTI.P3.oreEsito }),
      to: '/verifica',
    },
    {
      chi: t('comeFunziona.chiusura.porta3.chi'),
      cosa: t('comeFunziona.chiusura.porta3.titolo'),
      dettaglio: t('comeFunziona.chiusura.porta3.testo', { prezzo: fmtEuro(PRODOTTI.P7.prezzo) }),
      to: '/per-inquilini',
    },
    {
      chi: t('comeFunziona.chiusura.porta4.chi'),
      cosa: t('comeFunziona.chiusura.porta4.titolo'),
      dettaglio: t('comeFunziona.chiusura.porta4.testo', { nomeProdotto: nomeProdotto('P6'), prezzo: prezzoProdotto('P6') }),
      to: '/supporto',
    },
  ];

  return (
    <section ref={ref} className="py-32 relative overflow-hidden" style={{ background: '#1A2D52' }}>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, rgba(201, 123, 92, 0.4), transparent 70%)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2), transparent 70%)' }} />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.25em] mb-6"
          style={{ fontFamily: fontMono, color: '#E8B59C' }}
        >
          {t('comeFunziona.chiusura.occhiello')}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="leading-[1.05] tracking-tight mb-12 max-w-4xl"
          style={{
            fontFamily: fontHeader,
            fontVariationSettings: fontSettingsSoft,
            color: '#FFFFFF',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 400,
          }}
        >
          <Ricco evidenza={corsivo('#E8B59C')}>{t('comeFunziona.chiusura.titolo')}</Ricco>
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {porte.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
            >
              <Link to={p.to}
                className="group block h-full p-6 rounded-2xl transition-all hover:-translate-y-1"
                style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <p className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: fontMono, color: '#E8B59C' }}>
                  {p.chi}
                </p>
                <h3 className="text-lg font-semibold mb-3 flex items-start justify-between gap-2"
                  style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF' }}>
                  {p.cosa}
                  <ArrowUpRight className="w-4 h-4 flex-shrink-0 mt-1 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </h3>
                <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}>
                  <Ricco>{p.dettaglio}</Ricco>
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Link to="/supporto" className="inline-block">
            <span className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
              style={{ background: 'transparent', color: '#FFFFFF', fontFamily: fontBody, border: '1.5px solid rgba(255, 255, 255, 0.3)' }}>
              {t('comeFunziona.chiusura.pulsante')}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// ─── PAGINA PRINCIPALE ────────────────────────────────────────────────────────
const HowItWorksPage = () => {
  const t = useT();
  const { hash } = useLocation();

  // ScrollToTop porta la pagina in cima: se il link ha un'ancora, ci si arriva dopo.
  useEffect(() => {
    if (!hash) return undefined;
    const attesa = setTimeout(() => scrollTo(decodeURIComponent(hash.slice(1))), 150);
    return () => clearTimeout(attesa);
  }, [hash]);

  return (
    <>
      <Helmet>
        <title>{semplice(t('comeFunziona.meta.titolo'))}</title>
        <meta name="description" content={semplice(t('comeFunziona.meta.descrizione'))} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300,50;0,9..144,400,50;0,9..144,500,50;0,9..144,600,50;0,9..144,700,50;1,9..144,300,50;1,9..144,400,50&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Helmet>

      <div style={{ background: '#FFFFFF', fontFamily: fontBody }}>
        <VetrinaHeader activePage="come-funziona" />
        <Hero />
        <PerIniziare />
        <IlSemaforo />
        <IlMese />
        <LaContestazione />
        <SeNonPaga />
        <TabellaProdotti />
        <CTAFinale />
        <VetrinaFooter />
      </div>
    </>
  );
};

export default HowItWorksPage;
