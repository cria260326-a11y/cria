import React, { useRef, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
    ArrowRight, Plus, Mail, LogIn, UserPlus
} from 'lucide-react';

import VetrinaHeader from '@/components/VetrinaHeader';
import VetrinaFooter from '@/components/VetrinaFooter';

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

// ─── HERO ─────────────────────────────────────────────────────────────────────
const Hero = () => {
    return (
        <section className="relative pt-32 pb-12" style={{ background: '#FFFFFF' }}>
            <div className="absolute top-32 right-0 w-1 h-72 rounded-full opacity-30" style={{ background: '#22C55E' }} />
            <div className="absolute top-32 right-3 w-1 h-48 rounded-full opacity-30" style={{ background: '#F59E0B' }} />
            <div className="absolute top-32 right-6 w-1 h-32 rounded-full opacity-30" style={{ background: '#EF4444' }} />

            <div className="max-w-[1100px] mx-auto px-6 lg:px-12 relative">
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
                        Supporto
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="leading-[0.95] tracking-tight mb-6"
                    style={{
                        fontFamily: fontHeader,
                        fontVariationSettings: fontSettingsSoft,
                        color: '#1A2D52',
                        fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
                        fontWeight: 400,
                        letterSpacing: '-0.03em',
                    }}
                >
                    Siamo qui <span className="italic" style={{ color: '#C97B5C' }}>per aiutarti.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-lg lg:text-xl max-w-2xl leading-relaxed"
                    style={{ fontFamily: fontBody, color: '#6B6B5E', fontWeight: 400 }}
                >
                    Cerca tra le domande frequenti qui sotto. Per parlare direttamente con noi, accedi al tuo account: la chat in dashboard è il canale più veloce.
                </motion.p>
            </div>
        </section>
    );
};

// ─── FAQ — DEFINIZIONE INLINE ─────────────────────────────────────────────────
const CATEGORIES = [
    { id: 'tutte', label: 'Tutte' },
    { id: 'generale', label: 'Cosa è CRIA' },
    { id: 'prezzi', label: 'Prezzi e fatturazione' },
    { id: 'onboarding', label: 'Iscrizione e onboarding' },
    { id: 'locatori', label: 'Per locatori' },
    { id: 'inquilini', label: 'Per inquilini' },
    { id: 'verifica', label: 'Verifica inquilino' },
    { id: 'privacy', label: 'Privacy e GDPR' },
];

const FAQS = [
    // Generale
    {
        id: 'g1',
        cat: 'generale',
        q: 'Cosa è CRIA?',
        a: 'CRIA è la prima centrale rischi italiana dedicata agli affitti. Aiuta locatori e agenzie a tracciare i pagamenti dei contratti, gestire le contestazioni e verificare lo storico di un potenziale inquilino. Non è una lista nera: è un sistema di fiducia trasparente in cui gli inquilini regolari traggono vantaggio dal proprio storico positivo.',
    },
    {
        id: 'g2',
        cat: 'generale',
        q: 'Quali sono i prodotti CRIA?',
        a: 'Tre prodotti per scenari diversi. CRIA Gestione: tracci tu i pagamenti con i nostri strumenti. CRIA Completo: gestiamo noi il rapporto con l\'inquilino e ti garantiamo il bonifico puntuale ogni mese. CRIA Verifica: verifica one-shot dello storico di un potenziale inquilino, con esito documentato in 48 ore.',
    },
    {
        id: 'g3',
        cat: 'generale',
        q: 'CRIA è disponibile in tutta Italia?',
        a: 'Sì, CRIA è operativo su tutto il territorio italiano. Non ci sono limitazioni geografiche: che tu abbia un immobile a Milano, Bari o in un piccolo comune, il servizio è identico.',
    },

    // Prezzi
    {
        id: 'p1',
        cat: 'prezzi',
        q: 'Quanto costa CRIA?',
        a: 'I prezzi vengono comunicati in modo trasparente durante l\'onboarding, prima di qualsiasi pagamento. Sono pensati per essere sostenibili sia per privati con un solo immobile sia per agenzie con decine di contratti. Nessun costo nascosto, nessuna sorpresa.',
    },
    {
        id: 'p2',
        cat: 'prezzi',
        q: 'Come avviene la fatturazione?',
        a: 'Per CRIA Gestione e Completo la fatturazione è mensile via Stripe, con fattura elettronica automatica. Per CRIA Verifica è un pagamento singolo (one-shot), con ricevuta inviata via mail al momento dell\'acquisto.',
    },
    {
        id: 'p3',
        cat: 'prezzi',
        q: 'Posso cambiare prodotto in seguito?',
        a: 'Sì. Se sei attivo su CRIA Gestione e vuoi passare a Completo (o viceversa), puoi farlo dalla tua area personale. Il cambio richiede una nuova verifica documentale ma non perdi lo storico dell\'immobile né dei pagamenti registrati.',
    },
    {
        id: 'p4',
        cat: 'prezzi',
        q: 'Posso disdire l\'abbonamento?',
        a: 'Sì. Per CRIA Gestione e Completo non ci sono vincoli di durata: pagamento mensile, disdici quando vuoi dalla tua area personale. Per CRIA Verifica non c\'è abbonamento da disdire — paghi solo le singole verifiche che richiedi.',
    },

    // Onboarding
    {
        id: 'o1',
        cat: 'onboarding',
        q: 'Quanto tempo ci vuole per attivare CRIA?',
        a: 'Per CRIA Gestione e Verifica, 24-48 ore dall\'invio dei documenti. Per CRIA Completo, 3-5 giorni perché serve un check più approfondito (verifica del contratto, dell\'inquilino, configurazione del piano). Ti notifichiamo a ogni passaggio via email.',
    },
    {
        id: 'o2',
        cat: 'onboarding',
        q: 'Quali documenti servono?',
        a: 'Documento d\'identità (fronte/retro), codice fiscale, e per i locatori anche il contratto di affitto e i documenti dell\'immobile (visura catastale, ape, ecc.). L\'onboarding ti guida passo passo indicando esattamente cosa caricare.',
    },
    {
        id: 'o3',
        cat: 'onboarding',
        q: 'Cosa succede se mancano documenti?',
        a: 'Niente di grave. Il nostro team ti contatta entro 24 ore indicando esattamente cosa manca. La pratica resta in stato "documenti da integrare" finché non completi il caricamento. Nessun costo aggiuntivo, nessuna penale.',
    },
    {
        id: 'o4',
        cat: 'onboarding',
        q: 'Posso registrarmi senza ancora avere un contratto?',
        a: 'Sì. Puoi creare il tuo account gratuitamente, esplorare la piattaforma, e procedere con l\'onboarding solo quando sei pronto. La registrazione non ti vincola a nulla.',
    },

    // locatori
    {
        id: 'l1',
        cat: 'locatori',
        q: 'Posso usare CRIA con un contratto già esistente?',
        a: 'Certo. Sia che tu abbia un contratto in corso, sia che tu debba crearne uno nuovo, CRIA si adatta. Durante l\'onboarding indichi la tua situazione e ti guidiamo nei passaggi specifici.',
    },
    {
        id: 'l2',
        cat: 'locatori',
        q: 'Cosa succede se l\'inquilino non paga?',
        a: 'Dipende dal prodotto. Con CRIA Gestione, segnali tu la mancanza e si avvia la procedura di contestazione. Con CRIA Completo, ricevi comunque il bonifico puntuale ogni mese — è CRIA che gestisce il recupero crediti dall\'inquilino.',
    },
    {
        id: 'l3',
        cat: 'locatori',
        q: 'Devo essere io a comunicare a CRIA i pagamenti?',
        a: 'Solo con CRIA Gestione, ed è semplicissimo: clicchi "Pagato" o "Non ricevuto" sulla dashboard. Se non segnali entro l\'11 del mese, il pagamento viene considerato regolare. Con CRIA Completo è invece CRIA a incassare e tracciare tutto direttamente.',
    },

    // Inquilini
    {
        id: 'i1',
        cat: 'inquilini',
        q: 'Sono un inquilino: cosa cambia per me se il locatore usa CRIA?',
        a: 'Hai un accesso gratuito alla tua dashboard, dove vedi le stesse informazioni che vede il locatore di te: pagamenti, segnalazioni, storico. Hai 7 giorni per contestare ogni segnalazione, e costruisci uno storico positivo che ti seguirà nelle prossime case.',
    },
    {
        id: 'i2',
        cat: 'inquilini',
        q: 'Quanto costa CRIA per un inquilino?',
        a: 'Niente. Per l\'inquilino è completamente gratuito. È il locatore che attiva e paga il servizio. Tu hai accesso alla tua dashboard, ai tuoi dati, alle contestazioni e al tuo storico senza alcun costo.',
    },
    {
        id: 'i3',
        cat: 'inquilini',
        q: 'Posso contestare una segnalazione?',
        a: 'Sì, hai 7 giorni dalla segnalazione per inserire una contestazione. Puoi allegare ricevute, screenshot, documenti, e spiegare la tua versione. Il nostro team analizza le evidenze e comunica l\'esito a entrambe le parti entro 14 giorni.',
    },

    // Verifica
    {
        id: 'v1',
        cat: 'verifica',
        q: 'Come funziona CRIA Verifica?',
        a: 'È un servizio one-shot per verificare lo storico pagamenti di un potenziale inquilino prima di firmare. Acquisti la verifica, inserisci i dati della persona (nome, codice fiscale), carichi il tuo documento di identità, e ricevi l\'esito via mail in PDF entro 48 ore.',
    },
    {
        id: 'v2',
        cat: 'verifica',
        q: 'Cosa succede se la persona non è nel database?',
        a: 'Riceverai un esito "Nessun dato disponibile". Significa che la persona non ha precedenti registrati su CRIA. Non è una bocciatura: semplicemente non ci sono informazioni storiche da segnalare.',
    },
    {
        id: 'v3',
        cat: 'verifica',
        q: 'L\'inquilino verrà a saperlo?',
        a: 'La persona verificata ha diritto di sapere, su richiesta, di essere stata verificata e di accedere all\'esito. È previsto dal GDPR. Tu come richiedente non sei obbligato a comunicarlo proattivamente, ma se la persona te lo chiede sì.',
    },

    // Privacy
    {
        id: 'pr1',
        cat: 'privacy',
        q: 'CRIA è conforme al GDPR?',
        a: 'Sì. CRIA tratta i dati nel pieno rispetto del Regolamento UE 2016/679 e della normativa italiana. Raccogliamo solo i dati strettamente necessari (storico pagamenti, regolarità), conserviamo per il tempo minimo necessario e garantiamo i diritti di accesso, modifica e cancellazione previsti dalla legge.',
    },
    {
        id: 'pr2',
        cat: 'privacy',
        q: 'Quali dati raccogliete?',
        a: 'Solo dati di pagamento: data, importo, regolarità del versamento. Niente dati bancari, niente buste paga, niente referenze personali. Sappiamo solo se il pagamento è avvenuto e quando.',
    },
    {
        id: 'pr3',
        cat: 'privacy',
        q: 'Per quanto tempo conservate i dati?',
        a: 'Lo storico pagamenti resta attivo per 24 mesi dall\'ultimo pagamento registrato. Gli esiti delle verifiche per 12 mesi. Dopo, vengono archiviati in forma anonima per statistiche aggregate. Puoi richiedere la cancellazione anticipata in qualsiasi momento scrivendo a privacy@cria.it.',
    },
    {
        id: 'pr4',
        cat: 'privacy',
        q: 'Chi può vedere i miei dati?',
        a: 'Per gli inquilini: solo il locatore attuale e il team CRIA con limitazioni operative. Per i locatori: i dati dei loro inquilini ed eventuali avvocati assegnati alle pratiche. Quando cambi locatore, il nuovo non vede nulla del precedente. Tutto è tracciato negli audit log.',
    },
];

// ─── CHIP CATEGORIE + LISTA FAQ ───────────────────────────────────────────────
const FaqSection = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-50px' });

    const [activeCategory, setActiveCategory] = useState('tutte');
    const [openFaq, setOpenFaq] = useState(null);

    const filteredFaqs = useMemo(() => {
        if (activeCategory === 'tutte') return FAQS;
        return FAQS.filter(f => f.cat === activeCategory);
    }, [activeCategory]);

    const countByCategory = useMemo(() => {
        const counts = { tutte: FAQS.length };
        CATEGORIES.forEach(c => {
            if (c.id === 'tutte') return;
            counts[c.id] = FAQS.filter(f => f.cat === c.id).length;
        });
        return counts;
    }, []);

    const handleCategoryClick = (catId) => {
        setActiveCategory(catId);
        setOpenFaq(null);
    };

    return (
        <section ref={ref} className="py-20" style={{ background: '#FFFFFF' }}>
            <div className="max-w-[1100px] mx-auto px-6 lg:px-12">

                {/* Chip categorie */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="flex flex-wrap gap-2 mb-10"
                >
                    {CATEGORIES.map((cat) => {
                        const count = countByCategory[cat.id] || 0;
                        if (cat.id !== 'tutte' && count === 0) return null;

                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-[1.02]"
                                style={{
                                    background: isActive ? '#1A2D52' : '#F5F5F0',
                                    color: isActive ? '#FFFFFF' : '#1A2D52',
                                    fontFamily: fontBody,
                                    border: isActive ? 'none' : '1px solid rgba(26, 45, 82, 0.08)',
                                }}
                            >
                                {cat.label}
                                <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
                                    style={{
                                        background: isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(26, 45, 82, 0.08)',
                                        color: isActive ? '#FFFFFF' : '#6B6B5E',
                                        fontFamily: fontMono,
                                    }}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </motion.div>

                {/* Lista FAQ */}
                <div className="space-y-3">
                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl"
                            style={{ background: '#F5F5F0', border: '1px solid rgba(26, 45, 82, 0.08)' }}>
                            <p className="text-base" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                                Nessuna domanda in questa categoria.
                            </p>
                        </div>
                    ) : (
                        filteredFaqs.map((f, i) => (
                            <motion.div
                                key={f.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={inView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.4, delay: i * 0.04 }}
                                className="rounded-2xl overflow-hidden"
                                style={{ background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)' }}
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                                    className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[#F5F5F0]"
                                >
                                    <span className="text-base lg:text-lg font-semibold leading-tight"
                                        style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                                        {f.q}
                                    </span>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform"
                                        style={{
                                            background: openFaq === f.id ? '#1A2D52' : 'rgba(26, 45, 82, 0.06)',
                                            transform: openFaq === f.id ? 'rotate(45deg)' : 'rotate(0deg)',
                                        }}>
                                        <Plus className="w-4 h-4" style={{ color: openFaq === f.id ? '#FFFFFF' : '#1A2D52' }} />
                                    </div>
                                </button>
                                {openFaq === f.id && (
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
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

// ─── DUE CARD: ACCEDI O REGISTRATI ────────────────────────────────────────────
const ContattaciCards = () => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section ref={ref} className="py-24" style={{ background: '#F5F5F0' }}>
            <div className="max-w-[1200px] mx-auto px-6 lg:px-12">

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-xs uppercase tracking-[0.25em] mb-6 text-center"
                    style={{ fontFamily: fontMono, color: '#C97B5C' }}
                >
                    Vuoi parlare con noi?
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
                    La chat in dashboard è il <span className="italic" style={{ color: '#C97B5C' }}>canale più veloce.</span>
                </motion.h2>

                <div className="grid md:grid-cols-2 gap-6 mb-8">

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="rounded-3xl p-8 lg:p-10 transition-all hover:-translate-y-1"
                        style={{
                            background: '#FFFFFF',
                            border: '1px solid rgba(26, 45, 82, 0.1)',
                            boxShadow: '0 4px 20px -8px rgba(26, 45, 82, 0.08)',
                        }}
                    >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                            style={{ background: '#22C55E15' }}>
                            <LogIn className="w-6 h-6" style={{ color: '#22C55E' }} />
                        </div>

                        <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ fontFamily: fontMono, color: '#22C55E' }}>
                            Sei già su CRIA?
                        </p>
                        <h3 className="text-2xl lg:text-3xl font-bold leading-tight mb-4"
                            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>
                            Accedi e <span className="italic">scrivici in chat.</span>
                        </h3>
                        <p className="text-base leading-relaxed mb-8"
                            style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                            La chat di assistenza è disponibile direttamente dalla tua area personale. Risposte rapide, contesto già caricato, tutto in un posto solo.
                        </p>

                        <Link to="/login">
                            <button className="group flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                                style={{ background: '#1A2D52', color: '#FFFFFF', fontFamily: fontBody }}>
                                Accedi al tuo account
                                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                            </button>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="rounded-3xl p-8 lg:p-10 relative overflow-hidden transition-all hover:-translate-y-1"
                        style={{
                            background: '#1A2D52',
                            color: '#FFFFFF',
                            boxShadow: '0 25px 60px -15px rgba(26, 45, 82, 0.4)',
                        }}
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-30"
                            style={{ background: 'radial-gradient(circle, rgba(232, 181, 156, 0.4), transparent 70%)' }} />

                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                                style={{ background: 'rgba(232, 181, 156, 0.15)' }}>
                                <UserPlus className="w-6 h-6" style={{ color: '#E8B59C' }} />
                            </div>

                            <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ fontFamily: fontMono, color: '#E8B59C' }}>
                                Non hai ancora un account?
                            </p>
                            <h3 className="text-2xl lg:text-3xl font-bold leading-tight mb-4"
                                style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF' }}>
                                Registrati gratis e <span className="italic" style={{ color: '#E8B59C' }}>scrivici da lì.</span>
                            </h3>
                            <p className="text-base leading-relaxed mb-8"
                                style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.75)' }}>
                                La registrazione è gratuita e non ti vincola a nulla. Una volta dentro, hai accesso alla chat di assistenza anche prima di scegliere un prodotto.
                            </p>

                            <Link to="/signup">
                                <button className="group flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-[1.02]"
                                    style={{ background: '#FFFFFF', color: '#1A2D52', fontFamily: fontBody }}>
                                    Registrati gratis
                                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={inView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-center"
                >
                    <p className="text-sm" style={{ fontFamily: fontBody, color: '#6B6B5E' }}>
                        Per richieste generali o informazioni:{' '}
                        <a
                            href="mailto:info@cria.it"
                            className="font-semibold inline-flex items-center gap-1.5 hover:underline"
                            style={{ color: '#1A2D52' }}
                        >
                            <Mail className="w-3.5 h-3.5" />
                            info@cria.it
                        </a>
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

// ─── PAGINA PRINCIPALE ────────────────────────────────────────────────────────
const SupportoPage = () => {
    return (
        <>
            <Helmet>
                <title>Supporto e FAQ — CRIA</title>
                <meta name="description" content="Le domande frequenti su CRIA: prezzi, onboarding, prodotti, privacy. Per parlare direttamente con noi, accedi al tuo account o registrati." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300,50;0,9..144,400,50;0,9..144,500,50;0,9..144,600,50;0,9..144,700,50;1,9..144,300,50;1,9..144,400,50&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            </Helmet>

            <div style={{ background: '#FFFFFF', fontFamily: fontBody }}>
                <VetrinaHeader activePage="supporto" />
                <Hero />
                <FaqSection />
                <ContattaciCards />
                <VetrinaFooter />
            </div>
        </>
    );
};

export default SupportoPage;