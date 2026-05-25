import React, { useState, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    FileText, Search, Filter, X, Upload, Download, Trash2,
    User, Home, FolderOpen, Plus, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mock documenti ────────────────────────────────────────────────────────────
const DOCUMENTI_INIZIALI = [
    // Personali
    { id: 1, nome: 'Carta identità.pdf', categoria: 'personale', tipo: 'identita', data: '2026-01-15', dimensione: '320 KB', verificato: true, immobileId: null },
    { id: 2, nome: 'Codice fiscale.pdf', categoria: 'personale', tipo: 'cf', data: '2026-01-15', dimensione: '180 KB', verificato: true, immobileId: null },

    // Immobile 1
    { id: 3, nome: 'Visura catastale Roma 42.pdf', categoria: 'immobile', tipo: 'visura', data: '2026-01-10', dimensione: '245 KB', verificato: true, immobileId: 1, immobileLabel: 'Via Roma 42, Milano' },
    { id: 4, nome: 'Contratto Roma 42.pdf', categoria: 'immobile', tipo: 'contratto', data: '2026-01-01', dimensione: '512 KB', verificato: true, immobileId: 1, immobileLabel: 'Via Roma 42, Milano' },
    { id: 5, nome: 'Planimetria Roma 42.pdf', categoria: 'immobile', tipo: 'extra', data: '2026-01-15', dimensione: '180 KB', verificato: true, immobileId: 1, immobileLabel: 'Via Roma 42, Milano' },

    // Immobile 2
    { id: 6, nome: 'Visura Corso Venezia.pdf', categoria: 'immobile', tipo: 'visura', data: '2026-02-01', dimensione: '267 KB', verificato: true, immobileId: 2, immobileLabel: 'Corso Venezia 18, Milano' },
    { id: 7, nome: 'Contratto Corso Venezia.pdf', categoria: 'immobile', tipo: 'contratto', data: '2026-02-01', dimensione: '498 KB', verificato: false, immobileId: 2, immobileLabel: 'Corso Venezia 18, Milano' },

    // Immobile 3 (P2)
    { id: 8, nome: 'Visura Via Dante.pdf', categoria: 'immobile', tipo: 'visura', data: '2026-01-15', dimensione: '290 KB', verificato: true, immobileId: 3, immobileLabel: 'Via Dante 7, Roma' },
    { id: 9, nome: 'Contratto Via Dante.pdf', categoria: 'immobile', tipo: 'contratto', data: '2026-01-15', dimensione: '534 KB', verificato: true, immobileId: 3, immobileLabel: 'Via Dante 7, Roma' },
];

const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const TIPO_LABEL = {
    identita: 'Identità',
    cf: 'Codice fiscale',
    visura: 'Visura catastale',
    contratto: 'Contratto',
    extra: 'Documento extra',
};

const TIPO_COLOR = {
    identita: 'bg-blue-100 text-blue-800',
    cf: 'bg-purple-100 text-purple-800',
    visura: 'bg-amber-100 text-amber-800',
    contratto: 'bg-green-100 text-green-800',
    extra: 'bg-gray-100 text-gray-700',
};

const DocumentiLocatorePage = () => {
    const [documenti, setDocumenti] = useState(DOCUMENTI_INIZIALI);
    const [search, setSearch] = useState('');
    const [filtroCat, setFCat] = useState('tutte');
    const [filtroTipo, setFTipo] = useState('tutti');
    const fileInputRef = useRef(null);

    const filtrati = useMemo(() => {
        let list = [...documenti];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(d => d.nome.toLowerCase().includes(q) || (d.immobileLabel || '').toLowerCase().includes(q));
        }
        if (filtroCat !== 'tutte') list = list.filter(d => d.categoria === filtroCat);
        if (filtroTipo !== 'tutti') list = list.filter(d => d.tipo === filtroTipo);
        return list.sort((a, b) => b.data.localeCompare(a.data));
    }, [documenti, search, filtroCat, filtroTipo]);

    // Raggruppamento per immobile
    const raggruppati = useMemo(() => {
        const groups = { personale: [] };
        filtrati.forEach(d => {
            if (d.categoria === 'personale') groups.personale.push(d);
            else {
                const key = d.immobileLabel || 'Senza immobile';
                if (!groups[key]) groups[key] = [];
                groups[key].push(d);
            }
        });
        return groups;
    }, [filtrati]);

    const contatori = useMemo(() => ({
        totali: documenti.length,
        personali: documenti.filter(d => d.categoria === 'personale').length,
        immobili: documenti.filter(d => d.categoria === 'immobile').length,
        daVerificare: documenti.filter(d => !d.verificato).length,
    }), [documenti]);

    const handleUpload = (file) => {
        if (!file) return;
        const nuovo = {
            id: Date.now(),
            nome: file.name,
            categoria: 'personale',
            tipo: 'extra',
            data: new Date().toISOString().split('T')[0],
            dimensione: `${Math.round(file.size / 1024)} KB`,
            verificato: false,
            immobileId: null,
        };
        setDocumenti(prev => [nuovo, ...prev]);
        toast.success('Documento caricato — in attesa di verifica da CRIA');
    };

    const elimina = (id) => {
        if (!window.confirm('Vuoi eliminare questo documento?')) return;
        setDocumenti(prev => prev.filter(d => d.id !== id));
        toast.success('Documento eliminato');
    };

    const hasFilters = search || filtroCat !== 'tutte' || filtroTipo !== 'tutti';

    return (
        <>
            <Helmet><title>Documenti - CRIA</title></Helmet>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Documenti</h1>
                        <p className="text-sm text-muted-foreground">Archivio dei tuoi documenti personali e degli immobili</p>
                    </div>
                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
                    <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                        <Upload className="w-4 h-4" /> Carica documento
                    </Button>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Totali', value: contatori.totali, color: 'bg-blue-500' },
                        { label: 'Personali', value: contatori.personali, color: 'bg-purple-500' },
                        { label: 'Immobili', value: contatori.immobili, color: 'bg-amber-500' },
                        { label: 'Da verificare', value: contatori.daVerificare, color: 'bg-yellow-500' },
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

                {/* Filtri */}
                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative flex-1 min-w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Cerca documento o immobile..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ paddingLeft: '2.5rem' }} />
                            </div>
                            <select value={filtroCat} onChange={e => setFCat(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutte">Tutte le categorie</option>
                                <option value="personale">Personali</option>
                                <option value="immobile">Immobili</option>
                            </select>
                            <select value={filtroTipo} onChange={e => setFTipo(e.target.value)}
                                className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti i tipi</option>
                                {Object.entries(TIPO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFCat('tutte'); setFTipo('tutti'); }}>
                                    <X className="w-3.5 h-3.5 mr-1" /> Azzera
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Documenti raggruppati */}
                {Object.keys(raggruppati).length === 0 || filtrati.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <FolderOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Nessun documento trovato</p>
                        </CardContent>
                    </Card>
                ) : Object.entries(raggruppati).map(([gruppo, docs]) => {
                    if (docs.length === 0) return null;
                    const isPersonale = gruppo === 'personale';
                    return (
                        <Card key={gruppo}>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    {isPersonale ? <User className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                                    {isPersonale ? 'Documenti personali' : gruppo}
                                    <span className="text-xs text-muted-foreground font-normal">({docs.length})</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {docs.map(d => (
                                    <div key={d.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{d.nome}</p>
                                            <p className="text-xs text-muted-foreground">{fmtData(d.data)} · {d.dimensione}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${TIPO_COLOR[d.tipo]}`}>
                                            {TIPO_LABEL[d.tipo]}
                                        </span>
                                        {d.verificato ? (
                                            <span className="inline-flex items-center gap-1 text-xs text-green-600 flex-shrink-0">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Verificato
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-yellow-600 flex-shrink-0">
                                                <AlertTriangle className="w-3.5 h-3.5" /> In verifica
                                            </span>
                                        )}
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                            <Download className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                            onClick={() => elimina(d.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    );
                })}

            </div>
        </>
    );
};

export default DocumentiLocatorePage;