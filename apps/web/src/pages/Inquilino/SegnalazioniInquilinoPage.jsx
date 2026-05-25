import React, { useState, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Flag, Search, X, CheckCircle2, XCircle, AlertTriangle,
    Bell, Calendar, Upload, FileText, Send, Info, Clock
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mock segnalazioni ricevute ────────────────────────────────────────────────
const SEGNALAZIONI_INIZIALI = [
    {
        id: 1, dataRicezione: '2026-04-04', mese: 'Aprile 2026',
        locatore: 'Marco Bianchi', immobile: 'Via Roma 42, Milano',
        tipo: 'pagato',
        stato: 'confermata',
        contestabile: false,
        contestata: false,
        giorniRimanenti: 0,
    },
    {
        id: 2, dataRicezione: '2026-04-29', mese: 'Aprile 2026',
        locatore: 'Marco Bianchi', immobile: 'Via Roma 42, Milano',
        tipo: 'non_pagato',
        stato: 'da_contestare',
        contestabile: true,
        contestata: false,
        giorniRimanenti: 5,
        note: 'Il locatore ha segnalato un mancato pagamento per Aprile. Hai 7 giorni per contestare se ritieni che il pagamento sia stato effettuato.',
    },
    {
        id: 3, dataRicezione: '2026-03-04', mese: 'Marzo 2026',
        locatore: 'Marco Bianchi', immobile: 'Via Roma 42, Milano',
        tipo: 'pagato',
        stato: 'confermata',
        contestabile: false,
        contestata: false,
        giorniRimanenti: 0,
    },
    {
        id: 4, dataRicezione: '2026-03-29', mese: 'Marzo 2026',
        locatore: 'Marco Bianchi', immobile: 'Via Roma 42, Milano',
        tipo: 'non_pagato',
        stato: 'contestata',
        contestabile: false,
        contestata: true,
        contestazioneId: 1,
        giorniRimanenti: 0,
    },
];

const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const TIPO_BADGE = {
    pagato: { label: 'Pagamento confermato', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    non_pagato: { label: 'Mancato pagamento', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const STATO_BADGE = {
    confermata: 'bg-green-100 text-green-800',
    da_contestare: 'bg-yellow-100 text-yellow-800',
    contestata: 'bg-blue-100 text-blue-800',
};

// ─── Modal contestazione ──────────────────────────────────────────────────────
const ModalContesta = ({ segnalazione, onClose, onConferma }) => {
    const [motivazione, setMotivazione] = useState('');
    const [file, setFile] = useState(null);
    const fileRef = useRef(null);

    const conferma = () => {
        if (!motivazione.trim()) { toast.error('Inserisci una motivazione'); return; }
        onConferma({ motivazione, file });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
                    <h3 className="font-bold text-foreground">Contesta segnalazione</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">

                    <div className="p-4 bg-muted/40 rounded-xl space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase">Segnalazione</p>
                        <p className="text-sm font-medium text-foreground">{segnalazione.mese} — Mancato pagamento</p>
                        <p className="text-xs text-muted-foreground">Da {segnalazione.locatore} · {fmtData(segnalazione.dataRicezione)}</p>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                            CRIA verificherà la tua contestazione e i documenti che fornirai. Se contesti senza prove valide, la segnalazione resterà a tuo carico.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Motivazione <span className="text-red-500">*</span></Label>
                        <textarea value={motivazione} onChange={e => setMotivazione(e.target.value)} rows={4}
                            placeholder="Spiega perché ritieni che la segnalazione sia errata. Es: ho effettuato il bonifico il 3 aprile..."
                            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Documento di prova <span className="text-muted-foreground text-xs font-normal">(consigliato)</span></Label>
                        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                            onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
                        {file ? (
                            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-sm flex-1 truncate">{file.name}</span>
                                <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => fileRef.current?.click()}
                                className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-left">
                                <Upload className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-foreground">Carica ricevuta o screenshot bonifico</p>
                                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG — max 10MB</p>
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-border flex justify-end gap-3 flex-shrink-0">
                    <Button variant="outline" onClick={onClose}>Annulla</Button>
                    <Button onClick={conferma} className="gap-2">
                        <Send className="w-4 h-4" /> Invia contestazione
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const SegnalazioniInquilinoPage = () => {
    const [segnalazioni, setSegnalazioni] = useState(SEGNALAZIONI_INIZIALI);
    const [search, setSearch] = useState('');
    const [filtroTipo, setFTipo] = useState('tutti');
    const [contestaModal, setContestaModal] = useState(null);

    const contesta = (id, dati) => {
        setSegnalazioni(prev => prev.map(s => s.id === id
            ? { ...s, contestata: true, stato: 'contestata', contestazioneId: Date.now() }
            : s
        ));
        toast.success('Contestazione inviata — CRIA la sta gestendo');
    };

    const filtrate = useMemo(() => {
        let list = [...segnalazioni];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(s => s.mese.toLowerCase().includes(q) || s.locatore.toLowerCase().includes(q));
        }
        if (filtroTipo !== 'tutti') list = list.filter(s => s.tipo === filtroTipo);
        return list.sort((a, b) => b.dataRicezione.localeCompare(a.dataRicezione));
    }, [segnalazioni, search, filtroTipo]);

    const contatori = useMemo(() => ({
        totali: segnalazioni.length,
        pagati: segnalazioni.filter(s => s.tipo === 'pagato').length,
        nonPagati: segnalazioni.filter(s => s.tipo === 'non_pagato').length,
        daContestare: segnalazioni.filter(s => s.contestabile && !s.contestata).length,
    }), [segnalazioni]);

    return (
        <>
            <Helmet><title>Segnalazioni - CRIA</title></Helmet>

            {contestaModal && (
                <ModalContesta segnalazione={contestaModal}
                    onClose={() => setContestaModal(null)}
                    onConferma={(dati) => contesta(contestaModal.id, dati)} />
            )}

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">Segnalazioni ricevute</h1>
                    <p className="text-sm text-muted-foreground">Storico delle segnalazioni del tuo locatore sui pagamenti</p>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Totali', value: contatori.totali, color: 'bg-blue-500' },
                        { label: 'Pagamenti confermati', value: contatori.pagati, color: 'bg-green-500' },
                        { label: 'Mancati pagamenti', value: contatori.nonPagati, color: 'bg-red-500' },
                        { label: 'Da contestare', value: contatori.daContestare, color: 'bg-yellow-500' },
                    ].map(({ label, value, color }) => (
                        <Card key={label}>
                            <CardContent className="pt-5 pb-4 flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                                <div>
                                    <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Banner finestra contestazione */}
                {contatori.daContestare > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-medium">{contatori.daContestare} {contatori.daContestare === 1 ? 'segnalazione contestabile' : 'segnalazioni contestabili'}</p>
                            <p className="text-xs mt-0.5">Hai 7 giorni dalla data di ricezione per contestare una segnalazione di mancato pagamento.</p>
                        </div>
                    </div>
                )}

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca per mese o locatore..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }} />
                            </div>
                            <select value={filtroTipo} onChange={e => setFTipo(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti i tipi</option>
                                <option value="pagato">Pagamenti confermati</option>
                                <option value="non_pagato">Mancati pagamenti</option>
                            </select>
                            {(search || filtroTipo !== 'tutti') && (
                                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFTipo('tutti'); }}>
                                    <X className="w-3.5 h-3.5 mr-1" /> Azzera
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Lista segnalazioni */}
                {filtrate.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Bell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Nessuna segnalazione</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filtrate.map(s => {
                            const tcfg = TIPO_BADGE[s.tipo];
                            const Icon = tcfg.icon;
                            return (
                                <Card key={s.id}>
                                    <CardContent className="py-4">
                                        <div className="flex items-start justify-between gap-4 flex-wrap">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <p className="font-semibold text-foreground">{s.mese}</p>
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${tcfg.color}`}>
                                                        <Icon className="w-3 h-3" /> {tcfg.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Da {s.locatore} · {fmtData(s.dataRicezione)}
                                                </p>
                                                {s.note && (
                                                    <p className="text-xs text-muted-foreground italic mt-2">{s.note}</p>
                                                )}
                                                {s.contestabile && !s.contestata && (
                                                    <p className="text-xs text-yellow-700 flex items-center gap-1 mt-2">
                                                        <Clock className="w-3 h-3" /> Hai {s.giorniRimanenti} giorni per contestare
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_BADGE[s.stato]}`}>
                                                    {s.stato.replace('_', ' ')}
                                                </span>
                                                {s.contestabile && !s.contestata && (
                                                    <Button size="sm" variant="outline" className="gap-2 text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                                                        onClick={() => setContestaModal(s)}>
                                                        <AlertTriangle className="w-3.5 h-3.5" /> Contesta
                                                    </Button>
                                                )}
                                                {s.contestata && s.contestazioneId && (
                                                    <Button size="sm" variant="ghost" className="gap-1 text-xs"
                                                        onClick={() => window.location.href = `/dashboard/inquilino/contestazioni/${s.contestazioneId}`}>
                                                        Vedi contestazione →
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

            </div>
        </>
    );
};

export default SegnalazioniInquilinoPage;