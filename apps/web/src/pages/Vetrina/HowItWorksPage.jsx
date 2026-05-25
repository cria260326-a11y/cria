import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, CheckCircle2, AlertTriangle,
  XCircle, Sparkles, Shield, Clock,
  FileText, CreditCard, Search, Mail, User,
  Building2, Lock, Award, Plus, Minus
} from 'lucide-react';

import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
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
                Come funziona
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
              Tre flussi,<br />
              un solo obiettivo:<br />
              <span className="italic" style={{ color: '#C97B5C' }}>l'affitto trasparente.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg lg:text-xl max-w-xl mb-10 leading-relaxed"
              style={{ fontFamily: fontBody, color: '#6B6B5E', fontWeight: 400 }}
            >
              Scopri come si svolge il processo per ognuno dei nostri tre prodotti. Stessi principi, percorsi su misura.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { id: 'cria-gestione', label: 'CRIA Gestione', color: '#22C55E', num: '01' },
                { id: 'cria-completo', label: 'CRIA Completo', color: '#1A2D52', num: '02', featured: true },
                { id: 'cria-verifica', label: 'CRIA Verifica', color: '#C97B5C', num: '03' },
              ].map((p) => (
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
                    style={{ background: p.color, color: '#FFFFFF', fontFamily: fontMono }}>
                    {p.num}
                  </span>
                  <span className="text-sm font-semibold">{p.label}</span>
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
            <FlowMap />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FlowMap = () => {
  const flows = [
    { label: 'Gestione', target: 'Privati', color: '#22C55E', steps: ['Registrati', 'Onboarding', 'Documenti', 'Verifica', 'Attivo'], num: '01' },
    { label: 'Completo', target: 'Zero pensieri', color: '#1A2D52', steps: ['Registrati', 'Onboarding', 'Documenti', 'Verifica', 'Gestiamo noi'], num: '02', featured: true },
    { label: 'Verifica', target: 'One-shot', color: '#C97B5C', steps: ['Registrati', 'Acquista', 'Inserisci dati', 'Esito via mail'], num: '03' },
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
            I tre flussi
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#F59E0B' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#EF4444' }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {flows.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="relative"
            >
              <div className="text-center mb-3 pb-3" style={{ borderBottom: f.featured ? `2px solid ${f.color}` : '1px solid rgba(26, 45, 82, 0.08)' }}>
                <div className="text-[10px] uppercase tracking-wider mb-1"
                  style={{ fontFamily: fontMono, color: f.color, fontWeight: 600 }}>
                  {f.num}
                </div>
                <div className="text-sm font-bold leading-tight"
                  style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                  {f.label}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
                  {f.target}
                </div>
              </div>

              <div className="space-y-2">
                {f.steps.map((s, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 + j * 0.1 }}
                    className="flex items-center gap-2 relative"
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0 relative z-10" style={{ background: f.color }}>
                      {j < f.steps.length - 1 && (
                        <div className="absolute top-2 left-1/2 w-0.5 h-5 -translate-x-1/2" style={{ background: `${f.color}40` }} />
                      )}
                    </div>
                    <span className="text-[10px] truncate" style={{ fontFamily: fontBody, color: '#1A1A1A' }}>
                      {s}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative pt-4" style={{ borderTop: '1px solid rgba(26, 45, 82, 0.08)' }}>
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.2em] mb-1.5" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
              Stesso obiettivo
            </div>
            <div className="text-sm font-bold italic"
              style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#C97B5C' }}>
              "L'affitto trasparente"
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute -bottom-4 -right-4 rounded-xl p-3 max-w-[180px]"
        style={{
          background: '#1A2D52',
          color: '#FFFFFF',
          boxShadow: '0 15px 35px -8px rgba(26, 45, 82, 0.4)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider opacity-70" style={{ fontFamily: fontMono }}>
              Tempo medio
            </div>
            <div className="text-sm font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft }}>
              48 ore
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── FLUSSO P1 ────────────────────────────────────────────────────────────────
const FlussoP1 = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    { num: '01', titolo: 'Registrati', desc: 'Crea il tuo account in 30 secondi con email e password.' },
    { num: '02', titolo: 'Onboarding guidato', desc: 'Scegli "CRIA Gestione". Indica se il contratto esiste già o se è nuovo.' },
    { num: '03', titolo: 'Carica i documenti', desc: 'Contratto, documenti dell\'immobile, codice fiscale. Tutto via upload.' },
    { num: '04', titolo: 'Verifica e preventivo', desc: 'Il nostro team verifica entro 24h e ti invia un preventivo trasparente.' },
    { num: '05', titolo: 'Sei attivo', desc: 'Paghi e accedi alla dashboard. Inizi a tracciare i pagamenti dell\'inquilino.' },
  ];

  const operativo = [
    { icon: CheckCircle2, titolo: 'Segnali ogni mese', desc: 'Indichi se l\'inquilino ha pagato. Se non segnali entro l\'11, viene considerato regolare.', color: '#22C55E' },
    { icon: AlertTriangle, titolo: 'Gestisci contestazioni', desc: 'Se l\'inquilino contesta una segnalazione, parte una procedura interna di verifica.', color: '#F59E0B' },
    { icon: FileText, titolo: 'Scarichi report PDF', desc: 'Riepilogo dettagliato delle segnalazioni, scaricabile in qualsiasi momento.', color: '#1A2D52' },
  ];

  return (
    <section id="cria-gestione" ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

        <div className="grid lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="text-5xl leading-none italic"
                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#22C55E', fontWeight: 300 }}>
                01
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.25em]" style={{ fontFamily: fontMono, color: '#22C55E' }}>
                  Per locatori privati
                </p>
                <p className="text-2xl font-bold mt-1" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                  CRIA Gestione
                </p>
              </div>
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
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 400,
              }}
            >
              Tu gestisci. <span className="italic" style={{ color: '#22C55E' }}>Noi ti diamo gli strumenti.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg max-w-2xl leading-relaxed"
              style={{ fontFamily: fontBody, color: '#6B6B5E' }}
            >
              Mantieni il controllo della relazione con l'inquilino, ma con CRIA che traccia ogni pagamento, ogni contestazione, ogni documento.
            </motion.p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start mb-20">

          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <MockupP1 />
          </div>

          <div className="lg:col-span-7 space-y-8">
            {steps.map((s, i) => (
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
                      {s.num}
                    </span>
                  </div>
                </div>
                <div className="flex-1 pt-2 pb-4" style={{ borderBottom: i < steps.length - 1 ? '1px solid rgba(26, 45, 82, 0.08)' : 'none' }}>
                  <h3 className="text-xl font-semibold mb-2"
                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                    {s.titolo}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="rounded-3xl p-8 lg:p-12"
          style={{ background: '#F5F5F0' }}
        >
          <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ fontFamily: fontMono, color: '#22C55E' }}>
            Una volta attivo
          </p>
          <h3 className="text-2xl lg:text-3xl font-bold mb-10 max-w-2xl"
            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52', fontWeight: 400 }}>
            Cosa fai con <span className="italic" style={{ color: '#22C55E' }}>CRIA Gestione</span> tutti i giorni
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {operativo.map((o, i) => {
              const Icon = o.icon;
              return (
                <div key={i} className="p-6 rounded-2xl" style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.06)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: `${o.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: o.color }} />
                  </div>
                  <h4 className="text-lg font-semibold mb-2"
                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                    {o.titolo}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                    {o.desc}
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

const MockupP1 = () => (
  <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 30px 80px -20px rgba(26, 45, 82, 0.25)', border: '1px solid rgba(26, 45, 82, 0.06)' }}>
    <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.08)' }}>
      <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
      <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
      <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
      <div className="ml-auto text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>onboarding · step 2 di 4</div>
    </div>
    <div className="p-6 space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
          Step 2 — Tipo di contratto
        </div>
        <div className="text-xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
          Hai già un contratto attivo?
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-all"
          style={{ background: '#F0FDF4', border: '2px solid #22C55E' }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#22C55E' }}>
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#166534' }}>
              Sì, ho già un contratto in corso
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#15803D', fontFamily: fontBody }}>
              Lo carichi e iniziamo a monitorare
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl flex items-center gap-3 cursor-pointer"
          style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}>
          <div className="w-5 h-5 rounded-full" style={{ border: '2px solid rgba(26, 45, 82, 0.2)' }} />
          <div className="flex-1">
            <div className="text-sm font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
              No, devo crearne uno nuovo
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#6B6B5E', fontFamily: fontBody }}>
              Ti guidiamo nella stesura
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button className="text-sm font-medium" style={{ color: '#6B6B5E', fontFamily: fontBody }}>← Indietro</button>
        <button className="px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"
          style={{ background: '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}>
          Continua <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-1 pt-3">
        <div className="flex-1 h-1 rounded-full" style={{ background: '#22C55E' }} />
        <div className="flex-1 h-1 rounded-full" style={{ background: '#22C55E' }} />
        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(26, 45, 82, 0.1)' }} />
        <div className="flex-1 h-1 rounded-full" style={{ background: 'rgba(26, 45, 82, 0.1)' }} />
      </div>
    </div>
  </div>
);

// ─── FLUSSO P2 ────────────────────────────────────────────────────────────────
const FlussoP2 = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    { num: '01', titolo: 'Registrati', desc: 'Crea il tuo account. Inserisci se sei un privato o un\'agenzia.' },
    { num: '02', titolo: 'Onboarding dedicato', desc: 'Scegli "CRIA Completo". Configuriamo il piano insieme via questionario approfondito.' },
    { num: '03', titolo: 'Carica i documenti', desc: 'Contratto e documenti immobile. Forniamo anche assistenza legale per nuovi contratti.' },
    { num: '04', titolo: 'Verifica e preventivo', desc: 'Verifica e preventivo entro 24h. Il prezzo è personalizzato sui tuoi immobili.' },
    { num: '05', titolo: 'CRIA prende il controllo', desc: 'Da quel giorno: noi gestiamo l\'inquilino, riscuotiamo, e ti paghiamo puntuale.' },
  ];

  const differenze = [
    { icon: Shield, titolo: 'Pagamento garantito', desc: 'Anche se l\'inquilino non paga, tu ricevi puntualmente il giorno 5 di ogni mese.', color: '#E8B59C' },
    { icon: CreditCard, titolo: 'Recupero crediti incluso', desc: 'Ce ne occupiamo noi senza costi extra. Tu non vedi mai un sollecito da fare.', color: '#22C55E' },
    { icon: Award, titolo: 'Avvocato dedicato', desc: 'In caso di contestazioni complesse, un avvocato CRIA prende in carico la pratica.', color: '#F59E0B' },
  ];

  return (
    <section id="cria-completo" ref={ref} className="py-32 relative overflow-hidden" style={{ background: '#0F1B33' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

        <div className="grid lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="text-5xl leading-none italic"
                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#E8B59C', fontWeight: 300 }}>
                02
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs uppercase tracking-[0.25em]" style={{ fontFamily: fontMono, color: '#E8B59C' }}>
                    Per chi vuole zero pensieri
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: '#C97B5C', color: '#FFFFFF', fontFamily: fontMono }}>
                    ★ Più scelto
                  </span>
                </div>
                <p className="text-2xl font-bold mt-1" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF' }}>
                  CRIA Completo
                </p>
              </div>
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
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 400,
              }}
            >
              Noi gestiamo. <span className="italic" style={{ color: '#E8B59C' }}>Tu ricevi puntualmente.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg max-w-2xl leading-relaxed"
              style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Deleghi a CRIA tutta la relazione operativa con l'inquilino. Riceverai sempre l'affitto, anche se ci sono ritardi o problemi.
            </motion.p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start mb-20">

          <div className="lg:col-span-7 space-y-8">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                className="flex gap-6 group"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: 'rgba(232, 181, 156, 0.15)', border: '1px solid rgba(232, 181, 156, 0.3)' }}>
                    <span className="text-sm font-bold" style={{ fontFamily: fontMono, color: '#E8B59C' }}>
                      {s.num}
                    </span>
                  </div>
                </div>
                <div className="flex-1 pt-2 pb-4" style={{ borderBottom: i < steps.length - 1 ? '1px solid rgba(255, 255, 255, 0.08)' : 'none' }}>
                  <h3 className="text-xl font-semibold mb-2"
                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF' }}>
                    {s.titolo}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.65)' }}>
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <MockupP2 />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="rounded-3xl p-8 lg:p-12"
          style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ fontFamily: fontMono, color: '#E8B59C' }}>
            La vera differenza
          </p>
          <h3 className="text-2xl lg:text-3xl font-bold mb-10 max-w-2xl"
            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF', fontWeight: 400 }}>
            Cosa hai in più rispetto a <span className="italic" style={{ color: '#E8B59C' }}>CRIA Gestione</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {differenze.map((d, i) => {
              const Icon = d.icon;
              return (
                <div key={i} className="p-6 rounded-2xl"
                  style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: `${d.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: d.color }} />
                  </div>
                  <h4 className="text-lg font-semibold mb-2"
                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF' }}>
                    {d.titolo}
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.65)' }}>
                    {d.desc}
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

const MockupP2 = () => (
  <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.5)' }}>
    <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.08)' }}>
      <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
      <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
      <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
      <div className="ml-auto text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>cria.it/pagamenti</div>
    </div>
    <div className="p-6 space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
          Stato pagamenti — Aprile 2026
        </div>
        <div className="text-xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
          Tutto regolare per te
        </div>
      </div>

      <div className="p-4 rounded-xl" style={{ background: '#1A2D52', color: '#FFFFFF' }}>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4" style={{ color: '#E8B59C' }} />
          <span className="text-[10px] uppercase tracking-wider opacity-80" style={{ fontFamily: fontMono }}>
            CRIA → Te (puntuale)
          </span>
        </div>
        <div className="text-2xl font-bold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft }}>
          € 1.200
        </div>
        <div className="text-xs opacity-70 mt-0.5" style={{ fontFamily: fontBody }}>
          Bonificato il 5 Aprile 2026
        </div>
      </div>

      <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: '#FEF3C7', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
        <div className="text-xs">
          <div className="font-semibold" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#92400E' }}>
            CRIA gestisce ritardo inquilino
          </div>
          <div className="mt-0.5" style={{ color: '#A16207', fontFamily: fontBody }}>
            12 giorni di ritardo. <strong>A te non cambia nulla.</strong>
          </div>
        </div>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
          Cronologia
        </div>
        <div className="space-y-1.5">
          {[
            { mese: 'Apr', anno: '2026' },
            { mese: 'Mar', anno: '2026' },
            { mese: 'Feb', anno: '2026' },
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#22C55E' }} />
              <span style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                <strong>€ 1.200</strong> · {m.mese} {m.anno} · puntuale
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── FLUSSO P3 ────────────────────────────────────────────────────────────────
const FlussoP3 = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const steps = [
    { num: '01', titolo: 'Registrati', desc: 'Account base in 30 secondi.' },
    { num: '02', titolo: 'Acquista la verifica', desc: 'Pagamento one-shot via Stripe. Niente abbonamenti.' },
    { num: '03', titolo: 'Inserisci i dati', desc: 'Nome, cognome, codice fiscale della persona da verificare.' },
    { num: '04', titolo: 'Ricevi l\'esito via mail', desc: 'Entro 48 ore ricevi un PDF con lo score e lo storico.' },
  ];

  const esiti = [
    { color: '#22C55E', label: 'Verde', desc: 'Affidabile · pagamenti regolari ultimi 12 mesi', icon: CheckCircle2 },
    { color: '#F59E0B', label: 'Giallo', desc: 'In ritardo · pagamenti spesso oltre il giorno 5', icon: AlertTriangle },
    { color: '#EF4444', label: 'Rosso', desc: 'Irregolare · pagamenti saltuari o oltre il giorno 10', icon: XCircle },
    { color: '#6B6B5E', label: 'Nessun dato', desc: 'La persona non risulta nel nostro database', icon: Search },
  ];

  return (
    <section id="cria-verifica" ref={ref} className="py-32" style={{ background: '#FFFFFF' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

        <div className="grid lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="text-5xl leading-none italic"
                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#C97B5C', fontWeight: 300 }}>
                03
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.25em]" style={{ fontFamily: fontMono, color: '#C97B5C' }}>
                  Per verifiche one-shot
                </p>
                <p className="text-2xl font-bold mt-1" style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                  CRIA Verifica
                </p>
              </div>
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
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 400,
              }}
            >
              Una sola domanda, <span className="italic" style={{ color: '#C97B5C' }}>una sola risposta.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg max-w-2xl leading-relaxed"
              style={{ fontFamily: fontBody, color: '#6B6B5E' }}
            >
              Stai per affittare casa o stipulare un contratto? Verifica lo storico pagamenti dell'inquilino prima di firmare. Nessun abbonamento, paghi solo per quello che ti serve.
            </motion.p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start mb-20">

          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <MockupP3 />
          </div>

          <div className="lg:col-span-7 space-y-8">
            {steps.map((s, i) => (
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
                      {s.num}
                    </span>
                  </div>
                </div>
                <div className="flex-1 pt-2 pb-4" style={{ borderBottom: i < steps.length - 1 ? '1px solid rgba(26, 45, 82, 0.08)' : 'none' }}>
                  <h3 className="text-xl font-semibold mb-2"
                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                    {s.titolo}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="rounded-3xl p-8 lg:p-12 mb-12"
          style={{ background: '#F5F5F0' }}
        >
          <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ fontFamily: fontMono, color: '#C97B5C' }}>
            I quattro esiti possibili
          </p>
          <h3 className="text-2xl lg:text-3xl font-bold mb-10 max-w-2xl"
            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52', fontWeight: 400 }}>
            Cosa puoi <span className="italic" style={{ color: '#C97B5C' }}>ricevere</span>
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {esiti.map((e, i) => {
              const Icon = e.icon;
              return (
                <div key={i} className="p-6 rounded-2xl text-center"
                  style={{ background: '#FFFFFF', border: `1px solid ${e.color}25` }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: `${e.color}15` }}>
                    <Icon className="w-6 h-6" style={{ color: e.color }} />
                  </div>
                  <h4 className="text-lg font-bold mb-2"
                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: e.color }}>
                    {e.label}
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                    {e.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex items-start gap-5 p-6 rounded-2xl"
          style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}
        >
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#1A2D5215' }}>
            <Lock className="w-5 h-5" style={{ color: '#1A2D52' }} />
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2"
              style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
              Privacy e GDPR
            </h4>
            <p className="text-sm leading-relaxed" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
              I dati richiesti sono elaborati secondo il GDPR e in conformità a tutte le normative sulla protezione dei dati personali. Verifichiamo solo dati storici e oggettivi: niente opinioni, niente discriminazioni, niente liste nere.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const MockupP3 = () => (
  <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 30px 80px -20px rgba(26, 45, 82, 0.25)', border: '1px solid rgba(26, 45, 82, 0.06)' }}>
    <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: 'rgba(26, 45, 82, 0.08)' }}>
      <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
      <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
      <div className="w-3 h-3 rounded-full" style={{ background: '#22C55E' }} />
      <div className="ml-auto text-[10px]" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>cria.it/verifica</div>
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

      <div className="text-xs uppercase tracking-wider" style={{ color: '#6B6B5E', fontFamily: fontMono }}>
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
  </div>
);

// ─── TABELLA COMPARATIVA ──────────────────────────────────────────────────────
const TabellaComparativa = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const righe = [
    { feature: 'Tempo per attivazione', p1: '24-48 ore', p2: '3-5 giorni', p3: '48 ore' },
    { feature: 'Tipologia', p1: 'Abbonamento mensile', p2: 'Abbonamento mensile', p3: 'One-shot' },
    { feature: 'Dashboard', p1: '✓', p2: '✓', p3: '—' },
    { feature: 'Tracciamento pagamenti', p1: '✓ tu segnali', p2: '✓ CRIA gestisce', p3: '—' },
    { feature: 'Pagamento garantito', p1: '—', p2: '✓ il giorno 5', p3: '—' },
    { feature: 'Recupero crediti', p1: 'Su richiesta', p2: '✓ incluso', p3: '—' },
    { feature: 'Supporto contestazioni', p1: 'Procedure interne', p2: 'Avvocato dedicato', p3: '—' },
    { feature: 'Verifica storica inquilino', p1: '—', p2: '✓ inclusa', p3: '✓ esito via mail' },
    { feature: 'Report PDF', p1: '✓', p2: '✓', p3: '✓ esito completo' },
  ];

  return (
    <section ref={ref} className="py-32" style={{ background: '#F5F5F0' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-xs uppercase tracking-[0.25em] mb-6"
          style={{ fontFamily: fontMono, color: '#C97B5C' }}
        >
          Confronto rapido
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="leading-[1.05] tracking-tight mb-16 max-w-4xl"
          style={{
            fontFamily: fontHeader,
            fontVariationSettings: fontSettingsSoft,
            color: '#1A2D52',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 400,
          }}
        >
          I tre prodotti <span className="italic" style={{ color: '#C97B5C' }}>a confronto.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}
        >
          <div className="grid grid-cols-4 px-6 py-5" style={{ borderBottom: '1px solid rgba(26, 45, 82, 0.1)' }}>
            <div className="text-xs uppercase tracking-wider" style={{ fontFamily: fontMono, color: '#6B6B5E' }}>
              Feature
            </div>
            {[
              { nome: 'Gestione', color: '#22C55E' },
              { nome: 'Completo', color: '#1A2D52', featured: true },
              { nome: 'Verifica', color: '#C97B5C' },
            ].map(p => (
              <div key={p.nome} className="text-center">
                <div className="text-base font-bold flex items-center justify-center gap-2"
                  style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: p.color }}>
                  {p.nome}
                  {p.featured && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: '#C97B5C', color: '#FFFFFF', fontFamily: fontMono }}>★</span>}
                </div>
              </div>
            ))}
          </div>

          {righe.map((r, i) => (
            <div key={i} className="grid grid-cols-4 px-6 py-4 hover:bg-[#F5F5F0] transition-colors text-sm"
              style={{ borderBottom: i < righe.length - 1 ? '1px solid rgba(26, 45, 82, 0.06)' : 'none' }}>
              <div className="font-medium" style={{ fontFamily: fontBody, color: '#1A2D52' }}>
                {r.feature}
              </div>
              <div className="text-center" style={{ fontFamily: fontBody, color: r.p1 === '—' ? '#9CA3AF' : '#1A1A1A' }}>
                {r.p1}
              </div>
              <div className="text-center font-semibold" style={{ fontFamily: fontBody, color: r.p2 === '—' ? '#9CA3AF' : '#1A2D52' }}>
                {r.p2}
              </div>
              <div className="text-center" style={{ fontFamily: fontBody, color: r.p3 === '—' ? '#9CA3AF' : '#1A1A1A' }}>
                {r.p3}
              </div>
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
    { q: 'Quanto tempo ci vuole per essere attivi?', a: 'Per CRIA Gestione e Verifica, 24-48 ore dall\'invio dei documenti. Per CRIA Completo, 3-5 giorni perché serve un check più approfondito. Ti notifichiamo a ogni passaggio.' },
    { q: 'Posso passare da un prodotto all\'altro in seguito?', a: 'Sì. Se sei attivo su CRIA Gestione e vuoi passare a Completo, puoi farlo dalla tua area personale. Il passaggio richiede una nuova verifica documentale ma non perdi lo storico dell\'immobile.' },
    { q: 'Cosa succede se dimentico documenti?', a: 'Niente di grave. Il nostro team ti contatta entro 24h indicando cosa manca. La pratica resta in stato "documenti da integrare" fino a quando non completi il caricamento. Nessun costo aggiuntivo.' },
    { q: 'Posso disdire l\'abbonamento quando voglio?', a: 'Sì, sempre. Per CRIA Gestione e Completo non ci sono vincoli di durata. Pagamento mensile, disdici quando vuoi. Per CRIA Verifica non c\'è abbonamento da disdire — paghi solo la singola verifica.' },
    { q: 'CRIA è davvero "Centrale Rischi"? Come la CRIF?', a: 'Il principio è simile: tracciare il comportamento dei pagamenti per dare trasparenza al mercato. Ma CRIA è specifica per gli affitti, non per i finanziamenti. E il nostro principio è che la fiducia prevale: gli inquilini regolari ottengono uno score positivo che possono spendere quando cercano una nuova casa.' },
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
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 400,
            }}
          >
            Scegli il tuo flusso. <span className="italic" style={{ color: '#E8B59C' }}>Iniziamo subito.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl mb-12 max-w-2xl leading-relaxed"
            style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Hai capito quale dei 3 prodotti fa per te? Procedi direttamente oppure parla con noi se hai dubbi.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/per-locatori">
              <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}>
                Sono un locatore
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link to="/verifica">
              <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(232, 181, 156, 0.15)', color: '#E8B59C', fontFamily: fontBody, border: '1.5px solid rgba(232, 181, 156, 0.3)' }}>
                Verifica un inquilino
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </Link>
            <Link to="/supporto">
              <button className="group flex items-center gap-3 px-7 py-4 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
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

// ─── PAGINA PRINCIPALE ────────────────────────────────────────────────────────
const HowItWorksPage = () => {
  return (
    <>
      <Helmet>
        <title>Come funziona — CRIA</title>
        <meta name="description" content="Scopri come funzionano i tre prodotti CRIA: Gestione, Completo e Verifica. Tre flussi, un solo obiettivo: l'affitto trasparente." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300,50;0,9..144,400,50;0,9..144,500,50;0,9..144,600,50;0,9..144,700,50;1,9..144,300,50;1,9..144,400,50&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </Helmet>

      <div style={{ background: '#FFFFFF', fontFamily: fontBody }}>
        <VetrinaHeader activePage="come-funziona" />
        <Hero />
        <FlussoP1 />
        <FlussoP2 />
        <FlussoP3 />
        <TabellaComparativa />
        <FAQ />
        <CTAFinale />
        <VetrinaFooter />
      </div>
    </>
  );
};

export default HowItWorksPage;