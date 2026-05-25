import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FAQ_INIZIALI, CATEGORIE_INIZIALI } from '@/data/faqData.js';
import {
    Plus, Edit2, Trash2, Check, X, ChevronUp, ChevronDown,
    HelpCircle, Tag, Eye, EyeOff, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Modal conferma eliminazione ──────────────────────────────────────────────
const ModalElimina = ({ testo, onConferma, onAnnulla }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-foreground">Conferma eliminazione</h3>
                    <p className="text-sm text-muted-foreground mt-1">{testo}</p>
                </div>
            </div>
            <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={onAnnulla}>Annulla</Button>
                <Button variant="destructive" onClick={onConferma}>Elimina</Button>
            </div>
        </div>
    </div>
);

// ─── Riga FAQ modificabile ────────────────────────────────────────────────────
const RigaFaq = ({ faq, categorie, onUpdate, onDelete }) => {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ domanda: faq.domanda, risposta: faq.risposta, categoriaId: faq.categoriaId });
    const [showElimina, setShowElimina] = useState(false);

    const conferma = () => {
        onUpdate(faq.id, form);
        setEditing(false);
        toast.success('FAQ aggiornata');
    };

    const cat = categorie.find(c => c.id === faq.categoriaId);

    if (editing) {
        return (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3">
                <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                        <Label className="text-xs">Domanda</Label>
                        <Input value={form.domanda} onChange={e => setForm(p => ({ ...p, domanda: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Risposta</Label>
                        <textarea value={form.risposta} onChange={e => setForm(p => ({ ...p, risposta: e.target.value }))}
                            rows={3} className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Categoria</Label>
                        <select value={form.categoriaId} onChange={e => setForm(p => ({ ...p, categoriaId: Number(e.target.value) }))}
                            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                            {categorie.filter(c => c.attiva).map(c => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" onClick={conferma} className="gap-1.5"><Check className="w-3.5 h-3.5" /> Salva</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Annulla</Button>
                </div>
            </div>
        );
    }

    return (
        <>
            {showElimina && (
                <ModalElimina
                    testo={`Vuoi eliminare la domanda "${faq.domanda}"?`}
                    onConferma={() => { onDelete(faq.id); setShowElimina(false); }}
                    onAnnulla={() => setShowElimina(false)}
                />
            )}
            <div className={`flex items-start gap-3 p-4 rounded-lg border group ${faq.attiva ? 'bg-card border-border' : 'bg-muted/30 border-border opacity-60'}`}>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{faq.domanda}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{faq.risposta}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-2">
                        {cat?.nome || '—'}
                    </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                        onClick={() => onUpdate(faq.id, { attiva: !faq.attiva })}
                        title={faq.attiva ? 'Nascondi' : 'Mostra'}>
                        {faq.attiva ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditing(true)}>
                        <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        onClick={() => setShowElimina(true)}>
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>
        </>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const FaqAdminPage = () => {
    const [faqs, setFaqs] = useState(FAQ_INIZIALI);
    const [categorie, setCategorie] = useState(CATEGORIE_INIZIALI);
    const [tab, setTab] = useState('faq');

    // Nuova FAQ
    const [showNuovaFaq, setNuovaFaq] = useState(false);
    const [nuovaForm, setNuovaForm] = useState({ domanda: '', risposta: '', categoriaId: 1 });

    // Nuova categoria
    const [showNuovaCat, setNuovaCat] = useState(false);
    const [nuovaCatNome, setNuovaCatNome] = useState('');

    // Filtri
    const [filtroCategoria, setFiltro] = useState('tutti');
    const [search, setSearch] = useState('');
    const [mostraNascoste, setMostraNascoste] = useState(false);

    // Edita categoria inline
    const [editCat, setEditCat] = useState(null);
    const [editCatNome, setEditCatNome] = useState('');
    const [showEliminaCat, setShowEliminaCat] = useState(null);

    const contatori = useMemo(() => ({
        totale: faqs.length,
        attive: faqs.filter(f => f.attiva).length,
        nascoste: faqs.filter(f => !f.attiva).length,
        categorie: categorie.filter(c => c.attiva).length,
    }), [faqs, categorie]);

    const faqFiltrate = useMemo(() => {
        let list = [...faqs];
        if (!mostraNascoste) list = list.filter(f => f.attiva);
        if (filtroCategoria !== 'tutti') list = list.filter(f => f.categoriaId === Number(filtroCategoria));
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(f => f.domanda.toLowerCase().includes(q) || f.risposta.toLowerCase().includes(q));
        }
        return list;
    }, [faqs, filtroCategoria, search, mostraNascoste]);

    // FAQ per categoria (per visualizzazione raggruppata)
    const faqPerCategoria = useMemo(() => {
        return categorie
            .filter(c => c.attiva)
            .map(cat => ({
                ...cat,
                faqs: faqFiltrate.filter(f => f.categoriaId === cat.id),
            }))
            .filter(cat => cat.faqs.length > 0);
    }, [faqFiltrate, categorie]);

    const aggiornafaq = (id, dati) => {
        setFaqs(prev => prev.map(f => f.id === id ? { ...f, ...dati } : f));
    };

    const eliminaFaq = (id) => {
        setFaqs(prev => prev.filter(f => f.id !== id));
        toast.success('FAQ eliminata');
    };

    const creaNuovaFaq = () => {
        if (!nuovaForm.domanda.trim() || !nuovaForm.risposta.trim()) {
            toast.error('Domanda e risposta sono obbligatorie');
            return;
        }
        setFaqs(prev => [...prev, { id: Date.now(), ...nuovaForm, ordine: prev.length + 1, attiva: true }]);
        setNuovaForm({ domanda: '', risposta: '', categoriaId: 1 });
        setNuovaFaq(false);
        toast.success('FAQ creata');
    };

    const creaNuovaCategoria = () => {
        if (!nuovaCatNome.trim()) { toast.error('Inserisci il nome della categoria'); return; }
        setCategorie(prev => [...prev, { id: Date.now(), nome: nuovaCatNome, ordine: prev.length + 1, attiva: true }]);
        setNuovaCatNome('');
        setNuovaCat(false);
        toast.success('Categoria creata');
    };

    const eliminaCategoria = (id) => {
        const hasFaq = faqs.some(f => f.categoriaId === id);
        if (hasFaq) { toast.error('Non puoi eliminare una categoria con FAQ associate'); return; }
        setCategorie(prev => prev.filter(c => c.id !== id));
        toast.success('Categoria eliminata');
    };

    return (
        <>
            <Helmet><title>FAQ - CRIA Admin</title></Helmet>

            {showEliminaCat && (
                <ModalElimina
                    testo={`Vuoi eliminare la categoria "${categorie.find(c => c.id === showEliminaCat)?.nome}"? Assicurati che non ci siano FAQ associate.`}
                    onConferma={() => { eliminaCategoria(showEliminaCat); setShowEliminaCat(null); }}
                    onAnnulla={() => setShowEliminaCat(null)}
                />
            )}

            <div className="space-y-6">

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Gestione FAQ</h1>
                        <p className="text-sm text-muted-foreground">Le FAQ vengono mostrate nella pagina pubblica "Domande e Contatti"</p>
                    </div>
                    <Button onClick={() => tab === 'faq' ? setNuovaFaq(true) : setNuovaCat(true)} className="gap-2 flex-shrink-0">
                        <Plus className="w-4 h-4" /> {tab === 'faq' ? 'Nuova FAQ' : 'Nuova categoria'}
                    </Button>
                </div>

                {/* Contatori */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'FAQ totali', value: contatori.totale, color: 'text-foreground' },
                        { label: 'Attive', value: contatori.attive, color: 'text-green-600' },
                        { label: 'Nascoste', value: contatori.nascoste, color: 'text-gray-500' },
                        { label: 'Categorie', value: contatori.categorie, color: 'text-blue-600' },
                    ].map(({ label, value, color }) => (
                        <Card key={label}>
                            <CardContent className="pt-5 pb-4">
                                <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
                                <p className="text-sm text-muted-foreground mt-1">{label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tab */}
                <div className="flex gap-1 border-b border-border">
                    {[
                        { key: 'faq', label: 'FAQ', icon: HelpCircle },
                        { key: 'categorie', label: 'Categorie', icon: Tag },
                    ].map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setTab(key)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}>
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </div>

                {/* ── TAB FAQ ─────────────────────────────────────────────── */}
                {tab === 'faq' && (
                    <div className="space-y-4">
                        {/* Filtri */}
                        <Card>
                            <CardContent className="pt-4 pb-4">
                                <div className="flex flex-wrap gap-3 items-center">
                                    <div className="relative flex-1 min-w-48">
                                        <Input placeholder="Cerca nelle FAQ..." value={search}
                                            onChange={e => setSearch(e.target.value)} />
                                    </div>
                                    <select value={filtroCategoria} onChange={e => setFiltro(e.target.value)}
                                        className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none w-48">
                                        <option value="tutti">Tutte le categorie</option>
                                        {categorie.filter(c => c.attiva).map(c => (
                                            <option key={c.id} value={c.id}>{c.nome}</option>
                                        ))}
                                    </select>
                                    <Button variant="outline" size="sm" className="gap-2"
                                        onClick={() => setMostraNascoste(s => !s)}>
                                        {mostraNascoste ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        {mostraNascoste ? 'Nascondi disattivate' : 'Mostra disattivate'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Nuova FAQ */}
                        {showNuovaFaq && (
                            <Card className="border-primary/30">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> Nuova FAQ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-1">
                                        <Label>Domanda <span className="text-red-500">*</span></Label>
                                        <Input value={nuovaForm.domanda} onChange={e => setNuovaForm(p => ({ ...p, domanda: e.target.value }))}
                                            placeholder="Es. Come funziona CRIA?" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Risposta <span className="text-red-500">*</span></Label>
                                        <textarea value={nuovaForm.risposta} onChange={e => setNuovaForm(p => ({ ...p, risposta: e.target.value }))}
                                            rows={3} placeholder="Scrivi la risposta..."
                                            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>Categoria</Label>
                                        <select value={nuovaForm.categoriaId} onChange={e => setNuovaForm(p => ({ ...p, categoriaId: Number(e.target.value) }))}
                                            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none">
                                            {categorie.filter(c => c.attiva).map(c => (
                                                <option key={c.id} value={c.id}>{c.nome}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={creaNuovaFaq} className="gap-1.5"><Check className="w-3.5 h-3.5" /> Crea FAQ</Button>
                                        <Button variant="outline" onClick={() => setNuovaFaq(false)}>Annulla</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Lista FAQ raggruppate per categoria */}
                        {faqPerCategoria.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">Nessuna FAQ trovata.</p>
                        ) : faqPerCategoria.map(cat => (
                            <Card key={cat.id}>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-primary" /> {cat.nome}
                                        <span className="text-xs font-normal text-muted-foreground">({cat.faqs.length} domande)</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {cat.faqs.map(faq => (
                                        <RigaFaq key={faq.id} faq={faq} categorie={categorie}
                                            onUpdate={aggiornafaq} onDelete={eliminaFaq} />
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ── TAB CATEGORIE ────────────────────────────────────────── */}
                {tab === 'categorie' && (
                    <div className="space-y-4">
                        {showNuovaCat && (
                            <Card className="border-primary/30">
                                <CardContent className="pt-5 pb-5">
                                    <div className="flex gap-3 items-end">
                                        <div className="flex-1 space-y-1">
                                            <Label>Nome categoria <span className="text-red-500">*</span></Label>
                                            <Input value={nuovaCatNome} onChange={e => setNuovaCatNome(e.target.value)}
                                                placeholder="Es. Pagamenti" />
                                        </div>
                                        <Button onClick={creaNuovaCategoria} className="gap-1.5">
                                            <Check className="w-3.5 h-3.5" /> Crea
                                        </Button>
                                        <Button variant="outline" onClick={() => setNuovaCat(false)}>Annulla</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardContent className="p-0">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-border bg-muted/40">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Nome</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">FAQ associate</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {categorie.map(cat => (
                                            <tr key={cat.id} className="hover:bg-muted/30">
                                                <td className="px-4 py-3">
                                                    {editCat === cat.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <Input value={editCatNome} onChange={e => setEditCatNome(e.target.value)}
                                                                className="h-7 text-sm w-48" autoFocus
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') {
                                                                        setCategorie(prev => prev.map(c => c.id === cat.id ? { ...c, nome: editCatNome } : c));
                                                                        setEditCat(null);
                                                                        toast.success('Categoria aggiornata');
                                                                    }
                                                                    if (e.key === 'Escape') setEditCat(null);
                                                                }} />
                                                            <button onClick={() => {
                                                                setCategorie(prev => prev.map(c => c.id === cat.id ? { ...c, nome: editCatNome } : c));
                                                                setEditCat(null);
                                                                toast.success('Categoria aggiornata');
                                                            }} className="text-green-600"><Check className="w-4 h-4" /></button>
                                                            <button onClick={() => setEditCat(null)} className="text-red-600"><X className="w-4 h-4" /></button>
                                                        </div>
                                                    ) : (
                                                        <span className="font-medium text-foreground">{cat.nome}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground tabular-nums">
                                                    {faqs.filter(f => f.categoriaId === cat.id).length}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.attiva ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                        {cat.attiva ? 'Attiva' : 'Nascosta'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex gap-1 justify-end">
                                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                                            onClick={() => setCategorie(prev => prev.map(c => c.id === cat.id ? { ...c, attiva: !c.attiva } : c))}
                                                            title={cat.attiva ? 'Nascondi' : 'Mostra'}>
                                                            {cat.attiva ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                                            onClick={() => { setEditCat(cat.id); setEditCatNome(cat.nome); }}>
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                                                            onClick={() => setShowEliminaCat(cat.id)}>
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                )}

            </div>
        </>
    );
};

export default FaqAdminPage;