import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Calendar, ChevronLeft, ChevronRight, Filter,
    Scale, FileText, MessageSquare, AlertTriangle,
    Clock, CheckCircle2, ArrowRight
} from 'lucide-react';

const SCADENZE = [
    { id: 1, data: '2026-05-04', tipo: 'documento', titolo: 'Verifica documenti contestazione', descrizione: 'Documenti caricati da Marco Esposito', ref: '/dashboard/avvocato/clienti/4', priorita: 'alta', cliente: 'Marco Esposito' },
    { id: 2, data: '2026-05-04', tipo: 'ticket', titolo: 'Risposta entro 48h', descrizione: 'Ticket aperto da Sofia Martini', ref: '/dashboard/avvocato/clienti/2', priorita: 'alta', cliente: 'Sofia Martini' },
    { id: 3, data: '2026-05-05', tipo: 'contestazione', titolo: 'Chiusura contestazione #2', descrizione: 'Finestra di 7 giorni in scadenza', ref: '/dashboard/avvocato/clienti/4', priorita: 'alta', cliente: 'Marco Esposito' },
    { id: 4, data: '2026-05-08', tipo: 'contestazione', titolo: 'Chiusura contestazione #5', descrizione: 'Aperta da locatore', ref: '/dashboard/avvocato/clienti/7', priorita: 'media', cliente: 'Chiara Lombardi' },
    { id: 5, data: '2026-05-10', tipo: 'documento', titolo: 'Visura camerale scaduta', descrizione: 'Studio Conti — richiedere aggiornamento', ref: '/dashboard/avvocato/clienti/8', priorita: 'media', cliente: 'Studio Conti' },
    { id: 6, data: '2026-05-12', tipo: 'ticket', titolo: 'Risposta cliente in attesa', descrizione: 'Sara Conti — chiarimento contratto', ref: '/dashboard/avvocato/clienti/5', priorita: 'media', cliente: 'Sara Conti' },
    { id: 7, data: '2026-05-20', tipo: 'documento', titolo: 'Aggiornamento note pratica', descrizione: 'Luca Romano — pratica in revisione', ref: '/dashboard/avvocato/clienti/3', priorita: 'bassa', cliente: 'Luca Romano' },
];

const TIPI_CONFIG = {
    documento: { label: 'Documenti', icon: FileText, color: 'bg-amber-500', bgLight: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700' },
    ticket: { label: 'Ticket', icon: MessageSquare, color: 'bg-purple-500', bgLight: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700' },
    contestazione: { label: 'Contestazioni', icon: Scale, color: 'bg-red-500', bgLight: 'bg-red-50 border-red-200', textColor: 'text-red-700' },
};

const PRIORITA_BADGE = {
    alta: 'bg-red-100 text-red-700',
    media: 'bg-yellow-100 text-yellow-700',
    bassa: 'bg-gray-100 text-gray-600',
};

const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const GIORNI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const isoDate = (d) => d.toISOString().split('T')[0];
const isToday = (iso) => iso === isoDate(new Date());
const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });

// ─── Vista mese ────────────────────────────────────────────────────────────────
const VistaMese = ({ anno, mese, scadenze, onClickGiorno, selezionato }) => {
    const primoGiorno = new Date(anno, mese, 1);
    const giorniMese = new Date(anno, mese + 1, 0).getDate();
    const offsetIniz = (primoGiorno.getDay() + 6) % 7;

    const cells = [];
    for (let i = 0; i < offsetIniz; i++) cells.push(null);
    for (let g = 1; g <= giorniMese; g++) cells.push(g);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <Card>
            <CardContent className="pt-5">
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {GIORNI.map(g => (
                        <div key={g} className="text-xs font-semibold text-muted-foreground uppercase text-center py-2">{g}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {cells.map((g, idx) => {
                        if (g === null) return <div key={idx} />;
                        const dataIso = isoDate(new Date(anno, mese, g));
                        const scadenzeGiorno = scadenze.filter(s => s.data === dataIso);
                        const oggi = isToday(dataIso);
                        const isSelected = selezionato === dataIso;

                        return (
                            <button key={idx} onClick={() => onClickGiorno(dataIso)}
                                className={`min-h-[88px] p-1.5 rounded-lg border text-left transition-all ${isSelected ? 'border-primary bg-primary/5 shadow-sm'
                                    : oggi ? 'border-primary/40 bg-primary/5'
                                        : 'border-border hover:border-primary/30 hover:bg-muted/30'
                                    }`}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-sm font-medium ${oggi ? 'text-primary font-bold' : 'text-foreground'}`}>{g}</span>
                                    {scadenzeGiorno.length > 0 && (
                                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                            {scadenzeGiorno.length}
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-0.5">
                                    {[...new Set(scadenzeGiorno.map(s => s.tipo))].slice(0, 6).map(t => (
                                        <div key={t} className={`w-1.5 h-1.5 rounded-full ${TIPI_CONFIG[t]?.color || 'bg-gray-400'}`} />
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const ScadenzeAvvocatoPage = () => {
    const oggi = new Date();
    const [anno, setAnno] = useState(oggi.getFullYear());
    const [mese, setMese] = useState(oggi.getMonth());
    const [filtri, setFiltri] = useState(Object.keys(TIPI_CONFIG));
    const [selezionato, setSelezionato] = useState(isoDate(oggi));

    const scadenzeFiltrate = useMemo(() =>
        SCADENZE.filter(s => filtri.includes(s.tipo)),
        [filtri]
    );

    const meseSuccessivo = () => {
        if (mese === 11) { setMese(0); setAnno(anno + 1); } else setMese(mese + 1);
    };

    const mesePrecedente = () => {
        if (mese === 0) { setMese(11); setAnno(anno - 1); } else setMese(mese - 1);
    };

    const oggi0 = () => {
        const o = new Date();
        setAnno(o.getFullYear());
        setMese(o.getMonth());
        setSelezionato(isoDate(o));
    };

    const toggleFiltro = (tipo) => {
        setFiltri(prev => prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]);
    };

    const scadenzeGiorno = scadenzeFiltrate.filter(s => s.data === selezionato);

    const prossime = useMemo(() =>
        scadenzeFiltrate
            .filter(s => s.data >= isoDate(oggi))
            .sort((a, b) => a.data.localeCompare(b.data))
            .slice(0, 6),
        [scadenzeFiltrate]
    );

    const contatori = useMemo(() => {
        const dataDa = isoDate(new Date(anno, mese, 1));
        const dataA = isoDate(new Date(anno, mese + 1, 0));
        const inMese = SCADENZE.filter(s => s.data >= dataDa && s.data <= dataA);
        return Object.fromEntries(
            Object.keys(TIPI_CONFIG).map(t => [t, inMese.filter(s => s.tipo === t).length])
        );
    }, [anno, mese]);

    return (
        <>
            <Helmet><title>Scadenze - CRIA Avvocato</title></Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Scadenze</h1>
                    <p className="text-sm text-muted-foreground">Calendario delle attività e scadenze delle tue pratiche</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={mesePrecedente}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-lg font-semibold text-foreground min-w-44 text-center">
                        {MESI[mese]} {anno}
                    </h2>
                    <Button variant="outline" size="sm" onClick={meseSuccessivo}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={oggi0} className="ml-2">
                        Oggi
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 space-y-4">
                        <VistaMese anno={anno} mese={mese} scadenze={scadenzeFiltrate}
                            onClickGiorno={setSelezionato} selezionato={selezionato} />

                        <Card>
                            <CardContent className="pt-4 pb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Filtri categoria</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(TIPI_CONFIG).map(([tipo, cfg]) => {
                                        const attivo = filtri.includes(tipo);
                                        const count = contatori[tipo] || 0;
                                        const Icon = cfg.icon;
                                        return (
                                            <button key={tipo} onClick={() => toggleFiltro(tipo)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${attivo ? `${cfg.bgLight} ${cfg.textColor} border-current` : 'bg-muted text-muted-foreground border-transparent'
                                                    }`}>
                                                <div className={`w-2 h-2 rounded-full ${cfg.color}`} />
                                                <Icon className="w-3.5 h-3.5" />
                                                {cfg.label}
                                                <span className="font-bold">{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Calendar className="w-4 h-4" /> {fmtData(selezionato)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {scadenzeGiorno.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4 text-center">Nessuna scadenza in questo giorno.</p>
                                ) : scadenzeGiorno.map(s => {
                                    const cfg = TIPI_CONFIG[s.tipo];
                                    const Icon = cfg.icon;
                                    return (
                                        <Link key={s.id} to={s.ref}
                                            className={`block p-3 rounded-lg border ${cfg.bgLight} hover:shadow-sm transition-shadow`}>
                                            <div className="flex items-start gap-2">
                                                <Icon className={`w-4 h-4 ${cfg.textColor} flex-shrink-0 mt-0.5`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                                        <p className={`font-semibold text-sm ${cfg.textColor}`}>{s.titolo}</p>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITA_BADGE[s.priorita]}`}>
                                                            {s.priorita}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">{s.descrizione}</p>
                                                    <p className="text-xs text-muted-foreground/80 mt-1">→ {s.cliente}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Clock className="w-4 h-4" /> Prossime scadenze
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {prossime.map(s => {
                                    const cfg = TIPI_CONFIG[s.tipo];
                                    const Icon = cfg.icon;
                                    return (
                                        <button key={s.id} onClick={() => setSelezionato(s.data)}
                                            className="w-full flex items-start gap-2 text-left hover:bg-muted/30 p-2 -mx-2 rounded-lg">
                                            <div className={`w-7 h-7 rounded-full ${cfg.bgLight} flex items-center justify-center flex-shrink-0`}>
                                                <Icon className={`w-3.5 h-3.5 ${cfg.textColor}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-muted-foreground tabular-nums">{fmtData(s.data)}</p>
                                                <p className="text-sm text-foreground truncate">{s.titolo}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </>
    );
};

export default ScadenzeAvvocatoPage;