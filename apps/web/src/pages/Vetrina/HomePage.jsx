import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, CheckCircle2, AlertTriangle,
  XCircle, ChevronDown, Sparkles, Shield, Quote
} from 'lucide-react';

import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

// ─── HERO ──────────────────────────────────────────────────────────────────────
const Hero = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const yMockup = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacityMockup = useTransform(scrollYProgress, [0, 0.6], [1, 0.3]);

  return (
    <section ref={containerRef} className="relative pt-28 pb-20 overflow-hidden" style={{ background: '#FFFFFF' }}>
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
                Centrale Rischi Italia Affitti
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
              L'affitto, <span className="italic" style={{ color: '#C97B5C', fontWeight: 300 }}>finalmente</span> trasparente.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg lg:text-xl max-w-xl mb-10 leading-relaxed"
              style={{ fontFamily: fontBody, color: '#6B6B5E', fontWeight: 400 }}
            >
              La prima centrale rischi italiana dedicata agli affitti. Verifica gli inquilini, gestisci i pagamenti, risolvi le contestazioni — in un'unica piattaforma.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap gap-4 mb-14"
            >
              <Link to="/per-locatori">
                <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02] hover:shadow-2xl"
                  style={{ background: '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}>
                  Sono un locatore
                  <span className="w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1"
                    style={{ background: '#FFFFFF', color: '#1A2D52' }}>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </Link>
              <Link to="/verifica">
                <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                  style={{
                    background: 'transparent',
                    color: '#1A2D52',
                    fontFamily: fontBody,
                    border: '1.5px solid rgba(26, 45, 82, 0.2)',
                  }}>
                  Verifica un inquilino
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="grid grid-cols-3 gap-6 max-w-md pt-8"
              style={{ borderTop: '1px solid rgba(26, 45, 82, 0.1)' }}
            >
              {[
                { num: '500+', label: 'locatori attivi' },
                { num: '4,2M€', label: 'Gestiti' },
                { num: '94%', label: 'Pagamenti regolari' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-2xl lg:text-3xl font-bold tracking-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                    {s.num}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            style={{ y: yMockup, opacity: opacityMockup }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="lg:col-span-5 relative"
          >
            <DashboardMockup />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
            Scopri di più
          </span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown className="w-4 h-4" style={{ color: '#6B6B5E' }} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── DASHBOARD MOCKUP (hero) ──────────────────────────────────────────────────
const DashboardMockup = () => {
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
        <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.06)' }}>
          <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
          <div className="ml-auto text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>cria.it/dashboard</div>
        </div>

        <div className="p-6 space-y-4" style={{ background: '#FFFFFF' }}>
          <div>
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
              I miei immobili
            </div>
            <div className="text-2xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
              5 attivi · €4.230 incassati
            </div>
          </div>

          <div className="space-y-2">
            {[
              { addr: 'Via Roma 42', city: 'Milano', tenant: 'Sofia M.', status: 'verde' },
              { addr: 'Corso Venezia 18', city: 'Milano', tenant: 'Luca R.', status: 'giallo' },
              { addr: 'Piazza Navona 23', city: 'Roma', tenant: 'Marco E.', status: 'rosso' },
            ].map((im, i) => {
              const colors = { verde: '#22C55E', giallo: '#F59E0B', rosso: '#EF4444' };
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.15 }}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: '#F5F5F0', border: '1px solid rgba(26, 45, 82, 0.06)' }}
                >
                  <div className="w-2 h-12 rounded-full" style={{ background: colors[im.status] }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                      {im.addr}
                    </div>
                    <div className="text-[11px]" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                      {im.city} · {im.tenant}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider"
                    style={{ background: `${colors[im.status]}15`, color: colors[im.status], fontFamily: fontMono }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors[im.status] }} />
                    {im.status === 'verde' ? 'Regolare' : im.status === 'giallo' ? 'Ritardo' : 'Allerta'}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute -bottom-6 -left-8 rounded-2xl p-4 max-w-[220px]"
        style={{
          background: '#1A2D52',
          color: '#FFFFFF',
          boxShadow: '0 20px 40px -10px rgba(26, 45, 82, 0.4)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
            <CheckCircle2 className="w-4 h-4" style={{ color: '#22C55E' }} />
          </div>
          <div className="text-[10px] uppercase tracking-wider opacity-70" style={{ fontFamily: fontMono }}>
            Pagamento ricevuto
          </div>
        </div>
        <div className="text-base font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft }}>
          € 1.200 da Sofia M.
        </div>
        <div className="text-[11px] opacity-60 mt-0.5" style={{ fontFamily: fontBody }}>
          Aprile 2026 · puntuale
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute -top-4 -right-6 rounded-2xl px-4 py-3"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 15px 35px -8px rgba(26, 45, 82, 0.2)',
          border: '1px solid rgba(26, 45, 82, 0.08)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#22C55E' }} />
          <div className="text-xs font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>Score 94%</div>
        </div>
        <div className="text-[10px] mt-0.5" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
          Portafoglio sano
        </div>
      </motion.div>
    </div>
  );
};

// ─── PROBLEMA ──────────────────────────────────────────────────────────────────
const Problema = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-32 relative overflow-hidden" style={{ background: '#FFFFFF' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.25em] mb-6"
          style={{ fontFamily: fontMono, color: '#C97B5C' }}
        >
          Il problema
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
          Il mercato degli affitti in Italia <span className="italic" style={{ color: '#C97B5C' }}>è opaco</span>. Da troppo tempo.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
          {[
            { num: '01', titolo: 'Inquilini che non pagano', desc: 'Senza un sistema di tracciamento condiviso, ogni locatore si trova solo davanti agli inadempimenti. Tempi lunghi e costi legali alti.' },
            { num: '02', titolo: 'Nessuna verifica preventiva', desc: 'Prima di firmare un contratto non hai modo di sapere se chi ti sta davanti è un inquilino affidabile. Decidi al buio.' },
            { num: '03', titolo: 'Burocrazia infinita', desc: 'Contratti, pagamenti, contestazioni, comunicazioni con l\'avvocato. Tutto sparpagliato tra carta, mail e telefonate.' },
          ].map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.15 }}
            >
              <div className="text-5xl mb-6 leading-none"
                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#EF4444', fontWeight: 300, fontStyle: 'italic' }}>
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

// ─── PRODOTTI con MOCKUP P2 ───────────────────────────────────────────────────
const Prodotti = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-32 relative overflow-hidden" style={{ background: '#0F1B33' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.25em] mb-6"
          style={{ fontFamily: fontMono, color: '#E8B59C' }}
        >
          La soluzione · Tre prodotti
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="leading-[1.05] tracking-tight max-w-4xl mb-6"
          style={{
            fontFamily: fontHeader,
            fontVariationSettings: fontSettingsSoft,
            color: '#FFFFFF',
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 400,
          }}
        >
          Scegli il livello di <span className="italic" style={{ color: '#E8B59C' }}>tranquillità</span> che ti serve.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg max-w-2xl mb-20"
          style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.6)' }}
        >
          Tre prodotti pensati per scenari diversi. Dal "voglio strumenti" al "voglio dormire la notte".
        </motion.p>

        <ProdottoBlocco
          inView={inView}
          delay={0}
          numero="01"
          nome="CRIA Gestione"
          subtitle="Gestisci tu, ti diamo gli strumenti."
          target="Per locatori privati"
          colore="#22C55E"
          features={['Tracciamento pagamenti automatico', 'Sistema contestazioni integrato', 'Score inquilino in tempo reale', 'Report PDF mensili']}
          to="/per-locatori"
          mockup={<MockupP1 />}
          mockupSide="right"
        />

        <ProdottoBlocco
          inView={inView}
          delay={0.15}
          numero="02"
          nome="CRIA Completo"
          subtitle="Gestiamo noi. Tu ricevi puntualmente."
          target="Per chi vuole zero pensieri"
          colore="#E8B59C"
          features={['Pagamento garantito ogni mese il giorno 5', 'Recupero crediti incluso senza costi extra', 'Avvocato dedicato per contestazioni', 'CRIA gestisce tutta la relazione con l\'inquilino']}
          featured
          to="/per-locatori"
          mockup={<MockupP2 />}
          mockupSide="left"
        />

        <ProdottoBlocco
          inView={inView}
          delay={0.3}
          numero="03"
          nome="CRIA Verifica"
          subtitle="Una sola domanda, una sola risposta."
          target="Per verifiche one-shot"
          colore="#C97B5C"
          features={['Esito affidabilità entro 48 ore', 'Score storico ultimi 12 mesi', 'Niente abbonamenti né vincoli', 'Privacy GDPR garantita']}
          oneshot
          to="/verifica"
          mockup={<MockupP3 />}
          mockupSide="right"
        />

      </div>
    </section>
  );
};

const ProdottoBlocco = ({ inView, delay, numero, nome, subtitle, target, colore, features, featured, oneshot, to, mockup, mockupSide }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className="grid lg:grid-cols-12 gap-12 items-center mb-24 last:mb-0"
    >
      <div className={`lg:col-span-5 ${mockupSide === 'left' ? 'lg:order-2' : ''}`}>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs uppercase tracking-[0.2em]"
            style={{ fontFamily: fontMono, color: 'rgba(255, 255, 255, 0.4)' }}>
            {numero} — {target}
          </span>
        </div>

        <h3 className="text-4xl lg:text-5xl font-bold mb-3 leading-[1.05] tracking-tight"
          style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF', fontWeight: 400 }}>
          {nome}
        </h3>

        <p className="text-xl mb-8 italic"
          style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: colore, fontWeight: 300 }}>
          {subtitle}
        </p>

        <ul className="space-y-3 mb-8">
          {features.map((c, j) => (
            <li key={j} className="flex items-start gap-3 text-sm"
              style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.85)' }}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: colore }} />
              {c}
            </li>
          ))}
        </ul>

        {featured && (
          <div className="mb-6">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: '#C97B5C', color: '#FFFFFF', fontFamily: fontMono }}>
              ★ Più scelto
            </span>
          </div>
        )}

        <Link to={to}>
          <button className="group flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
            style={{
              background: featured ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
              color: featured ? '#1A2D52' : '#FFFFFF',
              fontFamily: fontBody,
              border: featured ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
            }}>
            Scopri {nome}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </Link>
      </div>

      <div className={`lg:col-span-7 ${mockupSide === 'left' ? 'lg:order-1' : ''}`}>
        {mockup}
      </div>
    </motion.div>
  );
};

// ─── MOCKUP P1 ──────────────────────────────────────────────────────────────
const MockupP1 = () => (
  <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.5)' }}>
    <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.08)' }}>
      <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
      <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
      <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
      <div className="ml-auto text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>cria.it/segnalazioni</div>
    </div>
    <div className="p-6 space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>Segnalazione del mese</div>
        <div className="text-lg font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
          Aprile 2026 — Via Roma 42
        </div>
      </div>
      <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: '#F0FDF4', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
        <div>
          <div className="text-sm font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#166534' }}>
            Sofia Martini ha pagato
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#15803D', fontFamily: fontBody }}>
            € 1.200 · 03/04/2026 · puntuale
          </div>
        </div>
        <CheckCircle2 className="w-7 h-7" style={{ color: '#22C55E' }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
          style={{ background: '#22C55E', color: '#FFFFFF', fontFamily: fontBody }}>
          <CheckCircle2 className="w-3.5 h-3.5" /> Pagato
        </button>
        <button className="py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
          style={{ background: '#FFFFFF', color: '#EF4444', fontFamily: fontBody, border: '1px solid #FCA5A5' }}>
          <XCircle className="w-3.5 h-3.5" /> Non ricevuto
        </button>
      </div>
      <div className="text-[10px] text-center pt-2" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
        Segnali tu, CRIA tiene il tracciamento
      </div>
    </div>
  </div>
);

const MockupP2 = () => (
  <div className="relative">
    <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.5)' }}>
      <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.08)' }}>
        <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
        <div className="ml-auto text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>cria.it/pagamenti</div>
      </div>
      <div className="p-6 space-y-5">

        <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: '#1A2D52', color: '#FFFFFF' }}>
          <Shield className="w-7 h-7 flex-shrink-0" style={{ color: '#E8B59C' }} />
          <div>
            <div className="text-xs uppercase tracking-wider opacity-80" style={{ fontFamily: fontMono }}>Garanzia CRIA Completo</div>
            <div className="text-sm font-semibold mt-0.5" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft }}>
              Ricevi sempre, indipendentemente dall'inquilino
            </div>
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
            CRIA → Te (puntuale)
          </div>
          <div className="space-y-2">
            {[
              { mese: 'Aprile', giorno: '5' },
              { mese: 'Marzo', giorno: '5' },
              { mese: 'Febbraio', giorno: '5' },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: '#F0FDF4' }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#22C55E' }} />
                <div className="flex-1 text-sm" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                  <strong>€ 1.200</strong> · {p.mese} 2026 · giorno {p.giorno}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: '#22C55E', color: '#FFFFFF', fontFamily: fontMono, fontWeight: 600 }}>
                  Ricevuto
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl" style={{ background: '#FEF3C7', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
            <div className="flex-1">
              <div className="text-xs font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#92400E' }}>
                CRIA sta gestendo un ritardo dell'inquilino
              </div>
              <div className="text-[11px] mt-1" style={{ color: '#A16207', fontFamily: fontBody }}>
                Marco E. è in ritardo di 12 giorni. Il nostro team sta avviando le procedure di sollecito. <strong>A te non cambia nulla.</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
      className="absolute -top-4 -right-4 rounded-2xl p-4 max-w-[200px]"
      style={{ background: '#E8B59C', color: '#1A2D52', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4" />
        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ fontFamily: fontMono }}>Il tuo vantaggio</span>
      </div>
      <div className="text-sm font-semibold leading-tight" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft }}>
        Tu dormi tranquillo. Noi gestiamo i problemi.
      </div>
    </motion.div>
  </div>
);

const MockupP3 = () => (
  <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 30px 80px -20px rgba(0,0,0,0.5)' }}>
    <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.08)' }}>
      <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
      <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
      <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
      <div className="ml-auto text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>Esito CRIA Verifica</div>
    </div>
    <div className="p-6 space-y-5">

      <div>
        <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
          Risultato verifica · #VR-2026-0042
        </div>
        <div className="text-xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
          Sofia Martini
        </div>
        <div className="text-xs mt-0.5" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
          CF: MRTSFI88L42F205Z · Verifica del 04/05/2026
        </div>
      </div>

      <div className="p-6 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-3" style={{ background: '#22C55E' }}>
          <CheckCircle2 className="w-10 h-10" style={{ color: '#FFFFFF' }} />
        </div>
        <div className="text-2xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#166534' }}>
          Inquilino affidabile
        </div>
        <div className="text-xs mt-1" style={{ color: '#15803D', fontFamily: fontBody }}>
          Score: 94/100 · ultimi 12 mesi
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>Storico pagamenti</div>
        <div className="flex gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 h-8 rounded"
              style={{ background: i === 8 ? '#F59E0B' : '#22C55E' }} />
          ))}
        </div>
        <div className="flex justify-between text-[10px] pt-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
          <span>Mag '25</span>
          <span>Apr '26</span>
        </div>
      </div>
    </div>
  </div>
);

// ─── COME FUNZIONA ────────────────────────────────────────────────────────────
const ComeFunziona = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    { num: '01', titolo: 'Registrati', desc: 'Crea il tuo account in 30 secondi. Email, password, codice referente se ce l\'hai.' },
    { num: '02', titolo: 'Onboarding guidato', desc: 'Scegli il prodotto, carica i documenti, indica gli immobili. Ti guidiamo passo passo.' },
    { num: '03', titolo: 'Verifica documentale', desc: 'Il nostro team verifica i documenti entro 24h. Se manca qualcosa te lo diciamo subito.' },
    { num: '04', titolo: 'Preventivo personalizzato', desc: 'Ricevi un preventivo basato sui tuoi immobili. Trasparente, senza sorprese.' },
    { num: '05', titolo: 'Sei attivo', desc: 'Il tuo account è attivo. Inizi a tracciare pagamenti, gestire contestazioni, ricevere report.' },
  ];

  return (
    <section ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

        <div className="mb-20">
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
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: 400,
            }}
          >
            Da zero ad <span className="italic" style={{ color: '#C97B5C' }}>attivo</span>, in 5 step.
          </motion.h2>
        </div>

        {/* 5 step orizzontali compatti con frecce connector */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6">
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

                <div className="text-2xl mb-3 leading-none"
                  style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#C97B5C', fontWeight: 400, fontStyle: 'italic' }}>
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

              {i < 4 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10 w-6 h-6 rounded-full items-center justify-center"
                  style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}>
                  <ArrowRight className="w-3 h-3" style={{ color: '#C97B5C' }} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/come-funziona">
            <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
              style={{
                background: 'transparent',
                color: '#1A2D52',
                fontFamily: fontBody,
                border: '1.5px solid rgba(26, 45, 82, 0.2)',
              }}>
              Vedi il processo nel dettaglio
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// ─── SCORE INQUILINO ──────────────────────────────────────────────────────────
const ScoreInquilino = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-32 relative" style={{ background: '#F5F5F0' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

        <div className="grid lg:grid-cols-12 gap-10">

          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="text-xs uppercase tracking-[0.25em] mb-6"
              style={{ fontFamily: fontMono, color: '#C97B5C' }}
            >
              Sistema di scoring
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
                fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                fontWeight: 400,
              }}
            >
              <span style={{ color: '#22C55E' }}>Verde</span>,{' '}
              <span style={{ color: '#F59E0B' }}>giallo</span>,{' '}
              <span style={{ color: '#EF4444' }}>rosso</span>.
              <br />
              <span className="italic" style={{ color: '#1A2D52' }}>Semplice come un semaforo.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg leading-relaxed mb-8"
              style={{ fontFamily: fontBody, color: '#6B6B5E' }}
            >
              Ogni inquilino su CRIA ha uno status che riflette la regolarità dei suoi pagamenti negli ultimi 12 mesi. Trasparente, condiviso, equo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="p-6 rounded-2xl max-w-md"
              style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.08)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4" style={{ color: '#C97B5C' }} />
                <span className="text-xs uppercase tracking-wider font-semibold"
                  style={{ fontFamily: fontMono, color: '#1A2D52' }}>
                  Il nostro principio
                </span>
              </div>
              <p className="text-base leading-relaxed italic"
                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52', fontWeight: 400 }}>
                "Vogliamo essere un sistema dove la fiducia prevale
                <br />
                e gli inquilini regolari ne traggono vantaggio."
              </p>
            </motion.div>
          </div>

          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1, delay: 0.3 }}
              className="space-y-4"
            >
              {[
                { status: 'verde', label: 'Affidabile', desc: 'Pagamenti regolari entro il giorno 5 di ogni mese', color: '#22C55E', perc: '94%', badge: 'Privilegiato' },
                { status: 'giallo', label: 'In ritardo', desc: 'Pagamenti regolari entro il giorno 10 del mese', color: '#F59E0B', perc: '5%', badge: 'In osservazione' },
                { status: 'rosso', label: 'Irregolare', desc: 'Pagamenti oltre il 10 del mese o saltuari', color: '#EF4444', perc: '1%', badge: 'Allerta' },
              ].map((s, i) => (
                <motion.div
                  key={s.status}
                  initial={{ opacity: 0, x: 30 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
                  className="rounded-2xl p-5 flex items-center gap-4 group hover:scale-[1.02] transition-transform"
                  style={{ background: '#FFFFFF', border: `1px solid ${s.color}25` }}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: `${s.color}15` }}>
                      <div className="w-6 h-6 rounded-full" style={{ background: s.color }} />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      className="absolute inset-0 rounded-full"
                      style={{ border: `2px solid ${s.color}` }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                      <span className="text-lg font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                        {s.label}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{ background: `${s.color}15`, color: s.color, fontFamily: fontMono }}>
                        {s.badge}
                      </span>
                    </div>
                    <p className="text-sm" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                      {s.desc}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-3xl font-bold tabular-nums" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: s.color }}>
                      {s.perc}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
                      Inquilini CRIA
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── TESTIMONIANZE ─────────────────────────────────────────────────────────────
const Testimonianze = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const items = [
    { quote: 'Ho recuperato 3 mesi di affitto in 30 giorni. Senza CRIA sarei ancora a inseguire telefonate e mail.', autore: 'Marco B.', ruolo: 'locatore, 5 immobili', colore: '#22C55E' },
    { quote: 'Per la mia agenzia è stata la svolta. Gestisco 47 contratti con la stessa fatica che prima ne richiedeva 10.', autore: 'Studio Conti', ruolo: 'Agenzia immobiliare, Milano', colore: '#1A2D52' },
    { quote: 'Inquilino da 4 anni con score verde. Quando ho cercato casa nuova, il nuovo locatore mi ha scelto subito.', autore: 'Sofia M.', ruolo: 'Inquilina dal 2022', colore: '#C97B5C' },
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
          Storie reali
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
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 400,
          }}
        >
          Chi ci ha già scelto, <span className="italic" style={{ color: '#C97B5C' }}>cosa dice.</span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="rounded-2xl p-8 relative overflow-hidden group hover:shadow-xl transition-shadow"
              style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.08)' }}
            >
              <div className="absolute top-4 right-4 opacity-10">
                <Quote className="w-12 h-12" style={{ color: t.colore }} />
              </div>
              <div className="w-2 h-2 rounded-full mb-6" style={{ background: t.colore }} />
              <p className="text-lg leading-relaxed mb-8 relative z-10"
                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52', fontWeight: 400 }}>
                "{t.quote}"
              </p>
              <div className="pt-6" style={{ borderTop: '1px solid rgba(26, 45, 82, 0.08)' }}>
                <div className="text-sm font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                  {t.autore}
                </div>
                <div className="text-xs mt-0.5" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                  {t.ruolo}
                </div>
              </div>
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
            Pronti a partire?
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
            L'affitto come <span className="italic" style={{ color: '#E8B59C' }}>dovrebbe essere.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl mb-12 max-w-2xl leading-relaxed"
            style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Inizia oggi. Nessuna carta richiesta in fase di registrazione, nessun vincolo.
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

// ─── HOMEPAGE ────────────────────────────────────────────────────────────────
const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>CRIA — Centrale Rischi Italia Affitti</title>
        <meta name="description" content="La prima centrale rischi italiana dedicata agli affitti. Verifica gli inquilini, gestisci i pagamenti, risolvi le contestazioni — in un'unica piattaforma." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300,50;0,9..144,400,50;0,9..144,500,50;0,9..144,600,50;0,9..144,700,50;1,9..144,300,50;1,9..144,400,50&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Helmet>

      <div style={{ background: '#FFFFFF', fontFamily: fontBody }}>
        <VetrinaHeader activePage="home" />
        <Hero />
        <Problema />
        <Prodotti />
        <ComeFunziona />
        <ScoreInquilino />
        <Testimonianze />
        <CTAFinale />
        <VetrinaFooter />
      </div>
    </>
  );
};

export default HomePage;