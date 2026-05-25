import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Plus, Edit2, Check, X, Trash2, ChevronDown, ChevronUp,
    Package, Zap, FileText, Euro, Users, Building2, Search,
    ToggleLeft, ToggleRight, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Categorie fisse — il comportamento non è modificabile ────────────────────
const CATEGORIE = [
    {
        id: 'A',
        nome: 'Gestione locatore',
        descrizione: 'Il locatore gestisce il contratto con gli strumenti CRIA. Segnala i pagamenti e gestisce il rapporto con l\'inquilino.',
        colore: 'bg-blue-100 text-blue-800 border-blue-200',
        coloreBadge: 'bg-blue-100 text-blue-800',
        icona: Building2,
    },
    {
        id: 'B',
        nome: 'Gestione CRIA',
        descrizione: 'CRIA gestisce il contratto e tutti i rapporti. Incassa dall\'inquilino e paga il locatore. Gestione completa.',
        colore: 'bg-purple-100 text-purple-800 border-purple-200',
        coloreBadge: 'bg-purple-100 text-purple-800',
        icona: Zap,
    },
    {
        id: 'C',
        nome: 'Verifica One-Shot',
        descrizione: 'Richiesta informazioni su un inquilino. Pagamento unico, nessun contratto continuativo. Risposta via email.',
        colore: 'bg-amber-100 text-amber-800 border-amber-200',
        coloreBadge: 'bg-amber-100 text-amber-800',
        icona: Search,
    },
];

// ─── Prodotti iniziali ────────────────────────────────────────────────────────
const PRODOTTI_INIZIALI = [
    {
        id: 1,
        categoriaId: 'A',
        nome: 'CRIA Gestione',
        descrizione: 'Il locatore gestisce autonomamente il rapporto con l\'inquilino utilizzando gli strumenti CRIA per monitoraggio pagamenti, segnalazioni e report.',
        stato: true,
        prezzoBase: '299',
        datiBancari: { intestatario: 'CRIA Srl', iban: 'IT60X0542811101000000123456', banca: 'Intesa Sanpaolo', causale: 'Attivazione CRIA Gestione' },
        documentiOnboarding: { richiesti: true, descrizione: 'Contratto di locazione, documento identità locatore, visura catastale immobile, documento identità inquilino.' },
        funzionalita: ['Dashboard locatore', 'Segnalazioni pagamenti', 'Storico 12 mesi', 'Report PDF', 'Gestione contestazioni', 'Chat assistenza'],
        provvigione: { commerciale: '50', avvocato: '80' },
    },
    {
        id: 2,
        categoriaId: 'B',
        nome: 'CRIA Completo',
        descrizione: 'CRIA gestisce interamente il contratto: incassa dall\'inquilino, paga il locatore puntualmente e gestisce ogni contestazione o irregolarità.',
        stato: true,
        prezzoBase: '499',
        datiBancari: { intestatario: 'CRIA Srl', iban: 'IT40Y0300203280573605681220', banca: 'UniCredit', causale: 'Attivazione CRIA Completo' },
        documentiOnboarding: { richiesti: true, descrizione: 'Contratto di locazione, documento identità locatore, visura catastale, planimetria immobile, documento identità inquilino, ultime 3 buste paga inquilino.' },
        funzionalita: ['Tutto di CRIA Gestione', 'Incasso da inquilino', 'Pagamento garantito al locatore', 'Gestione morosità', 'Supporto legale incluso', 'Avvocato assegnato'],
        provvigione: { commerciale: '80', avvocato: '150' },
    },
    {
        id: 3,
        categoriaId: 'C',
        nome: 'CRIA Verifica',
        descrizione: 'Richiesta one-shot di informazioni su un potenziale inquilino. CRIA verifica i dati e risponde via email entro 48 ore.',
        stato: true,
        prezzoBase: '49',
        datiBancari: { intestatario: 'CRIA Srl', iban: 'IT95O0501803400000000168507', banca: 'BancoBPM', causale: 'CRIA Verifica Inquilino' },
        documentiOnboarding: { richiesti: false, descrizione: '' },
        funzionalita: ['Verifica identità inquilino', 'Storico pagamenti (se disponibile)', 'Risposta via email entro 48h', 'Report PDF scaricabile'],
        provvigione: { commerciale: '10', avvocato: '0' },
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CampoEdit = ({ label, value, onSave, type = 'text', prefix }) => {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value);

    const conferma = () => { onSave(val); setEditing(false); toast.success(`${label} aggiornato`); };
    const annulla = () => { setVal(value); setEditing(false); };

    return (
        <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            {editing ? (
                <div className="flex items-center gap-2">
                    <div className="flex items-center flex-1 border border-border rounded-md overflow-hidden">
                        {prefix && <span className="px-2 text-sm text-muted-foreground bg-muted border-r border-border">{prefix}</span>}
                        <input
                            type={type}
                            value={val}
                            onChange={e => setVal(e.target.value)}
                            className="flex-1 px-2 py-1.5 text-sm bg-background text-foreground outline-none"
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') conferma(); if (e.key === 'Escape') annulla(); }}
                        />
                    </div>
                    <button onClick={conferma} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
                    <button onClick={annulla} className="text-red-600 hover:text-red-700"><X className="w-4 h-4" /></button>
                </div>
            ) : (
                <div className="flex items-center gap-2 group">
                    <p className="text-sm font-medium text-foreground">{prefix}{val || '—'}</p>
                    <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Modal nuovo prodotto ─────────────────────────────────────────────────────
const ModalNuovoProdotto = ({ onClose, onSave }) => {
    const [form, setForm] = useState({
        categoriaId: 'A', nome: '', descrizione: '', prezzoBase: '',
        ibanCria: '', bancaCria: '', causale: '',
        documentiRichiesti: false, documentiDescrizione: '',
        provvigione: '', compensoAvvocato: '',
    });

    const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

    const handleSave = () => {
        if (!form.nome.trim()) { toast.error('Il nome è obbligatorio'); return; }
        onSave(form);
        toast.success('Prodotto creato');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg my-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">Nuovo prodotto</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                </div>

                <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {/* Categoria */}
                    <div className="space-y-1.5">
                        <Label>Categoria <span className="text-red-500">*</span></Label>
                        <div className="grid grid-cols-1 gap-2">
                            {CATEGORIE.map(cat => {
                                const Icon = cat.icona;
                                return (
                                    <button key={cat.id} onClick={() => set('categoriaId', cat.id)}
                                        className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${form.categoriaId === cat.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                                            }`}>
                                        <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Categoria {cat.id} — {cat.nome}</p>
                                            <p className="text-xs text-muted-foreground">{cat.descrizione}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Nome prodotto <span className="text-red-500">*</span></Label>
                        <Input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Es. CRIA Gestione Plus" />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Descrizione</Label>
                        <textarea value={form.descrizione} onChange={e => set('descrizione', e.target.value)}
                            rows={3} placeholder="Descrizione del prodotto..."
                            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Prezzo base (€)</Label>
                        <Input type="number" value={form.prezzoBase} onChange={e => set('prezzoBase', e.target.value)} placeholder="Es. 299" />
                    </div>

                    {/* Dati bancari */}
                    <div className="space-y-3 p-3 bg-muted/40 rounded-lg">
                        <p className="text-sm font-medium text-foreground">Dati bancari per bonifico</p>
                        <Input value={form.ibanCria} onChange={e => set('ibanCria', e.target.value)} placeholder="IBAN" />
                        <Input value={form.bancaCria} onChange={e => set('bancaCria', e.target.value)} placeholder="Banca" />
                        <Input value={form.causale} onChange={e => set('causale', e.target.value)} placeholder="Causale" />
                    </div>

                    {/* Documenti onboarding */}
                    <div className="space-y-2">
                        <Label>Documenti onboarding richiesti</Label>
                        <div className="flex items-center gap-3">
                            <button onClick={() => set('documentiRichiesti', !form.documentiRichiesti)}
                                className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${form.documentiRichiesti ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-300'
                                    }`}>
                                {form.documentiRichiesti ? 'Sì' : 'No'}
                            </button>
                            <span className="text-xs text-muted-foreground">Clicca per alternare</span>
                        </div>
                        {form.documentiRichiesti && (
                            <textarea value={form.documentiDescrizione} onChange={e => set('documentiDescrizione', e.target.value)}
                                rows={2} placeholder="Elenca i documenti richiesti..."
                                className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        )}
                    </div>

                    {/* Provvigioni */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Provvigione commerciale (€)</Label>
                            <Input type="number" value={form.provvigione} onChange={e => set('provvigione', e.target.value)} placeholder="Es. 50" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Compenso avvocato (€)</Label>
                            <Input type="number" value={form.compensoAvvocato} onChange={e => set('compensoAvvocato', e.target.value)} placeholder="Es. 80" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-end px-6 py-4 border-t border-border">
                    <Button variant="outline" onClick={onClose}>Annulla</Button>
                    <Button onClick={handleSave} className="gap-2"><Plus className="w-4 h-4" /> Crea prodotto</Button>
                </div>
            </div>
        </div>
    );
};

// ─── Card singolo prodotto ────────────────────────────────────────────────────
const ProdottoCard = ({ prodotto, onUpdate, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const [showDeleteModal, setDeleteModal] = useState(false);
    const [nuovaFunz, setNuovaFunz] = useState('');

    const categoria = CATEGORIE.find(c => c.id === prodotto.categoriaId);
    const CatIcon = categoria?.icona || Package;

    const upd = (field, value) => onUpdate(prodotto.id, field, value);

    const toggleFunz = (idx) => {
        const nuova = prodotto.funzionalita.filter((_, i) => i !== idx);
        upd('funzionalita', nuova);
    };

    const aggiungiFunz = () => {
        if (!nuovaFunz.trim()) return;
        upd('funzionalita', [...prodotto.funzionalita, nuovaFunz.trim()]);
        setNuovaFunz('');
    };

    return (
        <>
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-foreground">Elimina prodotto</h3>
                                <p className="text-sm text-muted-foreground mt-1">Sei sicuro di voler eliminare <strong>{prodotto.nome}</strong>? Questa azione è irreversibile.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setDeleteModal(false)}>Annulla</Button>
                            <Button variant="destructive" onClick={() => { onDelete(prodotto.id); setDeleteModal(false); }}>Elimina</Button>
                        </div>
                    </div>
                </div>
            )}

            <Card className={`border-l-4 ${prodotto.categoriaId === 'A' ? 'border-l-blue-400' :
                prodotto.categoriaId === 'B' ? 'border-l-purple-400' : 'border-l-amber-400'
                }`}>
                {/* Header card */}
                <div className="flex items-start justify-between p-5 cursor-pointer" onClick={() => setExpanded(e => !e)}>
                    <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${categoria?.colore} flex-shrink-0`}>
                            <CatIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground">{prodotto.nome}</h3>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoria?.coloreBadge}`}>
                                    Cat. {prodotto.categoriaId} — {categoria?.nome}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${prodotto.stato ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {prodotto.stato ? 'Attivo' : 'Disattivo'}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{prodotto.descrizione}</p>
                            <p className="text-sm font-medium text-foreground mt-1">Prezzo base: € {prodotto.prezzoBase}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <button
                            onClick={e => { e.stopPropagation(); upd('stato', !prodotto.stato); toast.success(`Prodotto ${!prodotto.stato ? 'attivato' : 'disattivato'}`); }}
                            className={`p-1.5 rounded-lg transition-colors ${prodotto.stato ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                            title={prodotto.stato ? 'Disattiva' : 'Attiva'}
                        >
                            {prodotto.stato ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); setDeleteModal(true); }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Elimina prodotto"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                </div>

                {/* Contenuto espanso */}
                {expanded && (
                    <div className="border-t border-border px-5 pb-5 pt-4 space-y-6">

                        {/* Descrizione */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Descrizione</p>
                            <CampoEdit label="Testo descrizione" value={prodotto.descrizione} onSave={v => upd('descrizione', v)} />
                        </div>

                        {/* Prezzo e provvigioni */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Prezzi e provvigioni</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <CampoEdit label="Prezzo base" value={prodotto.prezzoBase} onSave={v => upd('prezzoBase', v)} prefix="€ " type="number" />
                                <CampoEdit label="Provvigione commerciale" value={prodotto.provvigione.commerciale} onSave={v => upd('provvigione', { ...prodotto.provvigione, commerciale: v })} prefix="€ " type="number" />
                                <CampoEdit label="Compenso avvocato" value={prodotto.provvigione.avvocato} onSave={v => upd('provvigione', { ...prodotto.provvigione, avvocato: v })} prefix="€ " type="number" />
                            </div>
                        </div>

                        {/* Dati bancari */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Dati bancari per bonifico</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <CampoEdit label="IBAN" value={prodotto.datiBancari.iban} onSave={v => upd('datiBancari', { ...prodotto.datiBancari, iban: v })} />
                                <CampoEdit label="Intestatario" value={prodotto.datiBancari.intestatario} onSave={v => upd('datiBancari', { ...prodotto.datiBancari, intestatario: v })} />
                                <CampoEdit label="Banca" value={prodotto.datiBancari.banca} onSave={v => upd('datiBancari', { ...prodotto.datiBancari, banca: v })} />
                                <CampoEdit label="Causale" value={prodotto.datiBancari.causale} onSave={v => upd('datiBancari', { ...prodotto.datiBancari, causale: v })} />
                            </div>
                        </div>

                        {/* Documenti onboarding */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Documenti onboarding</p>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-sm text-foreground">Richiesti:</span>
                                <button
                                    onClick={() => upd('documentiOnboarding', { ...prodotto.documentiOnboarding, richiesti: !prodotto.documentiOnboarding.richiesti })}
                                    className={`text-sm px-3 py-1 rounded-full border font-medium transition-colors ${prodotto.documentiOnboarding.richiesti
                                        ? 'bg-green-100 text-green-800 border-green-300'
                                        : 'bg-gray-100 text-gray-600 border-gray-300'
                                        }`}
                                >
                                    {prodotto.documentiOnboarding.richiesti ? 'Sì' : 'No'}
                                </button>
                            </div>
                            {prodotto.documentiOnboarding.richiesti && (
                                <CampoEdit
                                    label="Documenti richiesti"
                                    value={prodotto.documentiOnboarding.descrizione}
                                    onSave={v => upd('documentiOnboarding', { ...prodotto.documentiOnboarding, descrizione: v })}
                                />
                            )}
                        </div>

                        {/* Funzionalità incluse */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Funzionalità incluse</p>
                            <div className="space-y-2">
                                {prodotto.funzionalita.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between gap-2 py-1.5 px-3 bg-muted/40 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                            <span className="text-sm text-foreground">{f}</span>
                                        </div>
                                        <button onClick={() => toggleFunz(i)} className="text-muted-foreground hover:text-red-600 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        value={nuovaFunz}
                                        onChange={e => setNuovaFunz(e.target.value)}
                                        placeholder="Aggiungi funzionalità..."
                                        className="h-8 text-sm"
                                        onKeyDown={e => { if (e.key === 'Enter') aggiungiFunz(); }}
                                    />
                                    <Button size="sm" variant="outline" onClick={aggiungiFunz} className="h-8 gap-1">
                                        <Plus className="w-3.5 h-3.5" /> Aggiungi
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </Card>
        </>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const ProdottiPage = () => {
    const [prodotti, setProdotti] = useState(PRODOTTI_INIZIALI);
    const [showModal, setModal] = useState(false);
    const [filtroCategoria, setFiltro] = useState('tutti');

    const aggiornaProdotto = (id, field, value) => {
        setProdotti(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const eliminaProdotto = (id) => {
        setProdotti(prev => prev.filter(p => p.id !== id));
        toast.success('Prodotto eliminato');
    };

    const creaProdotto = (form) => {
        const nuovoProdotto = {
            id: Date.now(),
            categoriaId: form.categoriaId,
            nome: form.nome,
            descrizione: form.descrizione,
            stato: true,
            prezzoBase: form.prezzoBase || '0',
            datiBancari: { intestatario: 'CRIA Srl', iban: form.ibanCria, banca: form.bancaCria, causale: form.causale },
            documentiOnboarding: { richiesti: form.documentiRichiesti, descrizione: form.documentiDescrizione },
            funzionalita: [],
            provvigione: { commerciale: form.provvigione || '0', avvocato: form.compensoAvvocato || '0' },
        };
        setProdotti(prev => [...prev, nuovoProdotto]);
    };

    const prodottiFiltrati = filtroCategoria === 'tutti'
        ? prodotti
        : prodotti.filter(p => p.categoriaId === filtroCategoria);

    return (
        <>
            <Helmet><title>Prodotti - CRIA Admin</title></Helmet>

            {showModal && <ModalNuovoProdotto onClose={() => setModal(false)} onSave={creaProdotto} />}

            <div className="space-y-6">

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Prodotti</h1>
                        <p className="text-sm text-muted-foreground">Gestione dei prodotti CRIA e delle loro configurazioni</p>
                    </div>
                    <Button onClick={() => setModal(true)} className="gap-2 flex-shrink-0">
                        <Plus className="w-4 h-4" /> Nuovo prodotto
                    </Button>
                </div>

                {/* Categorie — solo informativo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Categorie disponibili</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {CATEGORIE.map(cat => {
                                const Icon = cat.icona;
                                return (
                                    <div key={cat.id} className={`p-4 rounded-lg border ${cat.colore}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Icon className="w-4 h-4" />
                                            <p className="font-medium text-sm">Categoria {cat.id} — {cat.nome}</p>
                                        </div>
                                        <p className="text-xs opacity-80">{cat.descrizione}</p>
                                        <p className="text-xs mt-2 opacity-60">Comportamento non modificabile</p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Filtro per categoria */}
                <div className="flex gap-2 flex-wrap">
                    {['tutti', 'A', 'B', 'C'].map(f => (
                        <button key={f} onClick={() => setFiltro(f)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filtroCategoria === f
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                                }`}>
                            {f === 'tutti' ? `Tutti (${prodotti.length})` : `Cat. ${f} (${prodotti.filter(p => p.categoriaId === f).length})`}
                        </button>
                    ))}
                </div>

                {/* Lista prodotti */}
                <div className="space-y-4">
                    {prodottiFiltrati.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Nessun prodotto in questa categoria.</p>
                    ) : prodottiFiltrati.map(p => (
                        <ProdottoCard
                            key={p.id}
                            prodotto={p}
                            onUpdate={aggiornaProdotto}
                            onDelete={eliminaProdotto}
                        />
                    ))}
                </div>

            </div>
        </>
    );
};

export default ProdottiPage;