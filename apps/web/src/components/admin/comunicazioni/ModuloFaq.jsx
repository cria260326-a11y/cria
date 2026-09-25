import React, { useRef, useState } from 'react';
import { Check, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PAGINE_FAQ, SEGNAPOSTO, risolviSegnaposto, segnapostoSconosciuti } from '@/lib/faqDemo';

// ═════════════════════════════════════════════════════════════════════════════
// O-29 — la domanda e la risposta di una FAQ. Un prezzo o un giorno del listino
// scritto a mano non cambia quando cambia il listino: si inserisce come
// segnaposto e la pagina pubblica mette il valore in vigore.
// ═════════════════════════════════════════════════════════════════════════════

const selettore = 'w-full text-sm border border-border rounded-lg px-3 py-2 bg-background';

const ModuloFaq = ({ iniziale, categorie, onSalva, onAnnulla, etichettaSalva = 'Salva' }) => {
    const [domanda, setDomanda] = useState(iniziale.domanda || '');
    const [risposta, setRisposta] = useState(iniziale.risposta || '');
    const [categoriaId, setCategoriaId] = useState(iniziale.categoriaId ?? categorie[0]?.id);
    const [pagine, setPagine] = useState(iniziale.pagine || []);
    const campoRisposta = useRef(null);

    const sconosciuti = segnapostoSconosciuti(risposta);
    const valida = domanda.trim().length >= 5 && risposta.trim().length >= 10 && categoriaId != null && !sconosciuti.length;

    // Il segnaposto va dove sta il cursore, non in fondo.
    const inserisci = (chiave) => {
        const el = campoRisposta.current;
        const segno = `{${chiave}}`;
        const da = el ? el.selectionStart : risposta.length;
        const a = el ? el.selectionEnd : risposta.length;
        setRisposta(r => `${r.slice(0, da)}${segno}${r.slice(a)}`);
        requestAnimationFrame(() => {
            if (!el) return;
            el.focus();
            el.setSelectionRange(da + segno.length, da + segno.length);
        });
    };

    const salva = () => onSalva({ domanda: domanda.trim(), risposta: risposta.trim(), categoriaId, pagine });
    const cambiaPagina = (id, si) => setPagine(p => (si ? [...p, id] : p.filter(x => x !== id)));

    return (
        <div className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="space-y-1.5">
                <Label htmlFor="faq-domanda">Domanda</Label>
                <Input id="faq-domanda" value={domanda} onChange={e => setDomanda(e.target.value)} maxLength={160} className="bg-white" />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="faq-categoria">Categoria</Label>
                <select
                    id="faq-categoria"
                    value={String(categoriaId)}
                    onChange={e => setCategoriaId(categorie.find(c => String(c.id) === e.target.value)?.id)}
                    className={selettore}
                >
                    {categorie.map(c => <option key={c.id} value={String(c.id)}>{c.nome}{c.attiva ? '' : ' (nascosta)'}</option>)}
                </select>
            </div>
            <fieldset className="space-y-1.5">
                <legend className="text-sm font-medium">Compare anche nella pagina</legend>
                <p className="text-xs text-muted-foreground">Tutte le domande attive stanno in Supporto. Queste pagine hanno un loro blocco di domande.</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {PAGINE_FAQ.map(p => (
                        <label key={p.id} className="inline-flex items-center gap-2 text-sm">
                            <input type="checkbox" className="h-4 w-4 accent-[#1A2D52]" checked={pagine.includes(p.id)} onChange={e => cambiaPagina(p.id, e.target.checked)} />
                            {p.nome}
                        </label>
                    ))}
                </div>
            </fieldset>
            <div className="space-y-1.5">
                <Label htmlFor="faq-risposta">Risposta</Label>
                <Textarea id="faq-risposta" ref={campoRisposta} rows={5} value={risposta} onChange={e => setRisposta(e.target.value)} className="bg-white" />
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Prezzi e giorni dal listino, al posto del cursore:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {SEGNAPOSTO.map(s => (
                            <button
                                key={s.chiave}
                                type="button"
                                onClick={() => inserisci(s.chiave)}
                                title={`Oggi: ${s.valore()}`}
                                className="rounded-full border border-border bg-white px-2 py-0.5 text-[11px] text-foreground hover:bg-muted"
                            >
                                {s.etichetta}
                            </button>
                        ))}
                    </div>
                </div>
                {sconosciuti.length > 0 && (
                    <p className="flex items-start gap-1.5 text-xs text-red-700">
                        <TriangleAlert className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Segnaposto che non esistono: {sconosciuti.map(k => `{${k}}`).join(', ')}
                    </p>
                )}
            </div>
            {risposta.trim() && (
                <div className="rounded-lg border border-border bg-white p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Come la legge il visitatore</p>
                    <p className="text-sm text-foreground">{risolviSegnaposto(risposta)}</p>
                </div>
            )}
            <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" className="gap-1.5" disabled={!valida} onClick={salva}><Check className="w-3.5 h-3.5" /> {etichettaSalva}</Button>
                <Button type="button" size="sm" variant="outline" onClick={onAnnulla}>Annulla</Button>
            </div>
        </div>
    );
};

export default ModuloFaq;
