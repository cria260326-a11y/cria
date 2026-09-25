import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import {
    Plus, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, ExternalLink, HelpCircle, FolderOpen, History, Globe, Lock, RotateCcw, Check, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import NotaMockup from '@/components/NotaMockup';
import { MODO_DEMO } from '@/lib/supabase';
import ModuloFaq from '@/components/admin/comunicazioni/ModuloFaq';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { motivoSoloAggregati } from '@/lib/comunicazioniDemo';
import {
    useFaqAdmin, puoScrivereFaq, risolviSegnaposto, creaFaq, modificaFaq, mostraNascondiFaq, eliminaFaq, spostaFaq,
    creaCategoria, rinominaCategoria, mostraNascondiCategoria, eliminaCategoria, spostaCategoria, ripristinaFaqDemo, PAGINE_FAQ,
} from '@/lib/faqDemo';
import { nomeOperatore } from '@/data/operatori';
import { ilData } from '@/data/scadenze';
import { fmtData } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// FAQ — O-29
// Una fonte sola: quello che si cambia qui lo legge la pagina pubblica Supporto
// (V-05), che prima leggeva un'altra copia. Ogni modifica dice chi l'ha fatta e
// quando, e finisce nel registro. Direzione e DPO leggono, non scrivono.
// ═════════════════════════════════════════════════════════════════════════════

const stesso = (a, b) => String(a) === String(b);
const selettore = 'text-sm border border-border rounded-lg px-3 py-2 bg-background max-w-full';

const Firma = ({ x }) => (
    <span className="text-xs text-muted-foreground">
        {x.modificataDa ? `Modificata da ${nomeOperatore(x.modificataDa)} ${ilData(x.modificataIl)}` : 'Testo di partenza'}
    </span>
);

const Conferma = ({ titolo, testo, etichetta, onConferma, disabled, children }) => (
    <AlertDialog>
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{titolo}</AlertDialogTitle>
                <AlertDialogDescription>{testo}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction disabled={disabled} onClick={onConferma}>{etichetta}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
);

const FaqAdminPage = () => {
    const { operatore, operatoreId } = useOperatoreAttivo();
    const { categorie, faq, registro } = useFaqAdmin();
    const puo = puoScrivereFaq(operatore);

    const [nuova, setNuova] = useState(false);
    const [inModifica, setInModifica] = useState(null);
    const [cerca, setCerca] = useState('');
    const [filtro, setFiltro] = useState('tutte');
    const [nuovaCategoria, setNuovaCategoria] = useState('');
    const [rinomina, setRinomina] = useState({ id: null, nome: '' });

    const visibile = (f) => f.attiva && categorie.some(c => stesso(c.id, f.categoriaId) && c.attiva);
    const pubblicate = faq.filter(visibile).length;
    const ultima = registro[0];

    const gruppi = useMemo(() => {
        const q = cerca.trim().toLowerCase();
        return categorie
            .filter(c => filtro === 'tutte' || stesso(c.id, filtro))
            .map(c => ({
                ...c,
                faq: faq.filter(f => stesso(f.categoriaId, c.id) && (!q || `${f.domanda} ${f.risposta}`.toLowerCase().includes(q))),
            }))
            .filter(c => c.faq.length || (!q && filtro !== 'tutte'));
    }, [categorie, faq, cerca, filtro]);

    const esegui = (fatto, messaggio) => {
        if (fatto) toast.success(messaggio);
        else toast.error(motivoSoloAggregati(operatore));
    };

    const aggiungiCategoria = () => {
        if (nuovaCategoria.trim().length < 3) { toast.error('Scrivi il nome della categoria'); return; }
        esegui(creaCategoria(nuovaCategoria, operatoreId), 'Categoria aggiunta');
        setNuovaCategoria('');
    };

    const confermaRinomina = (c) => {
        if (rinomina.nome.trim().length < 3) { toast.error('Il nome è troppo corto'); return; }
        esegui(rinominaCategoria(c, rinomina.nome, operatoreId), 'Categoria rinominata');
        setRinomina({ id: null, nome: '' });
    };

    const ripristina = () => {
        ripristinaFaqDemo();
        toast.success('FAQ ripristinate al contenuto di partenza');
    };

    return (
        <>
            <Helmet><title>FAQ - CRIA</title></Helmet>

            <div className="space-y-6">
                <IntestazionePagina
                    titolo="FAQ"
                    sottotitolo="Una fonte sola: quello che cambi qui lo leggono Supporto e i blocchi di domande delle pagine Per inquilini e Verifica un inquilino."
                    azioni={(
                        <>
                            <Button asChild variant="outline" className="gap-2">
                                <a href="/supporto" target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4" /> Apri la pagina pubblica</a>
                            </Button>
                            <Button className="gap-2" disabled={!puo} onClick={() => { setNuova(true); setInModifica(null); }}>
                                <Plus className="w-4 h-4" /> Nuova FAQ
                            </Button>
                        </>
                    )}
                />

                {!puo && (
                    <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" /> Le FAQ le scrive l’admin: qui le leggi.
                    </p>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Contatore icona={Globe} colore="bg-green-600" valore={pubblicate} etichetta="Pubblicate" nota="Si leggono su Supporto" />
                    <Contatore icona={EyeOff} colore="bg-slate-500" valore={faq.length - pubblicate} etichetta="Nascoste" nota="Anche per categoria nascosta" />
                    <Contatore icona={FolderOpen} colore="bg-[#1A2D52]" valore={categorie.filter(c => c.attiva).length} etichetta="Categorie visibili" />
                    <Contatore icona={History} colore="bg-amber-500" valore={ultima ? fmtData(ultima.il) : '—'} etichetta="Ultima modifica" nota={ultima ? nomeOperatore(ultima.da) : 'Nessuna modifica'} />
                </div>

                <Tabs defaultValue="faq" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="faq">Domande</TabsTrigger>
                        <TabsTrigger value="categorie">Categorie</TabsTrigger>
                        <TabsTrigger value="registro">Registro</TabsTrigger>
                    </TabsList>

                    <TabsContent value="faq" className="space-y-4">
                        {nuova && (
                            <ModuloFaq
                                iniziale={{ categoriaId: filtro !== 'tutte' ? categorie.find(c => stesso(c.id, filtro))?.id : categorie[0]?.id }}
                                categorie={categorie}
                                etichettaSalva="Aggiungi"
                                onAnnulla={() => setNuova(false)}
                                onSalva={(dati) => { esegui(creaFaq(dati, operatoreId), 'FAQ aggiunta: è già su Supporto'); setNuova(false); }}
                            />
                        )}

                        <Card>
                            <CardContent className="pt-4 pb-4 flex flex-wrap items-center gap-2">
                                <Input value={cerca} onChange={e => setCerca(e.target.value)} placeholder="Cerca nelle domande e nelle risposte" className="flex-1 min-w-[12rem]" aria-label="Cerca nelle FAQ" />
                                <select aria-label="Categoria" value={String(filtro)} onChange={e => setFiltro(e.target.value)} className={selettore}>
                                    <option value="tutte">Tutte le categorie</option>
                                    {categorie.map(c => <option key={c.id} value={String(c.id)}>{c.nome}</option>)}
                                </select>
                            </CardContent>
                        </Card>

                        {gruppi.length === 0 && (
                            <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nessuna domanda trovata.</CardContent></Card>
                        )}

                        {gruppi.map(c => (
                            <Card key={c.id} className={c.attiva ? '' : 'opacity-75'}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                                        <HelpCircle className="w-4 h-4 text-primary" /> {c.nome}
                                        <span className="text-sm font-normal text-muted-foreground">· {c.faq.length}</span>
                                        {!c.attiva && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">Categoria nascosta</span>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {c.faq.length === 0 && <p className="border-t border-border p-4 text-sm text-muted-foreground">Nessuna domanda in questa categoria.</p>}
                                    <ul className="divide-y divide-border border-t border-border">
                                        {c.faq.map((f, i) => (
                                            <li key={f.id} className="p-4 space-y-2">
                                                {stesso(inModifica, f.id) ? (
                                                    <ModuloFaq
                                                        iniziale={f}
                                                        categorie={categorie}
                                                        onAnnulla={() => setInModifica(null)}
                                                        onSalva={(dati) => { esegui(modificaFaq(f, dati, operatoreId), 'FAQ aggiornata anche su Supporto'); setInModifica(null); }}
                                                    />
                                                ) : (
                                                    <>
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className={`font-medium ${f.attiva ? 'text-foreground' : 'text-muted-foreground'}`}>{f.domanda}</p>
                                                                <p className="text-sm text-muted-foreground line-clamp-3">{risolviSegnaposto(f.risposta)}</p>
                                                            </div>
                                                            <div className="flex flex-shrink-0">
                                                                <Button size="icon" variant="ghost" className="h-8 w-8" disabled={!puo || i === 0} onClick={() => esegui(spostaFaq(f, -1, operatoreId), 'Spostata su')} aria-label="Sposta su">
                                                                    <ArrowUp className="w-4 h-4" />
                                                                </Button>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8" disabled={!puo || i === c.faq.length - 1} onClick={() => esegui(spostaFaq(f, 1, operatoreId), 'Spostata giù')} aria-label="Sposta giù">
                                                                    <ArrowDown className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                            {!f.attiva && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">Nascosta</span>}
                                                            {PAGINE_FAQ.filter(p => f.pagine?.includes(p.id)).map(p => (
                                                                <span key={p.id} className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800">Anche su {p.nome}</span>
                                                            ))}
                                                            <Firma x={f} />
                                                            <div className="flex flex-wrap gap-1 sm:ml-auto">
                                                                <Button size="sm" variant="ghost" className="h-8 gap-1.5" disabled={!puo} onClick={() => { setInModifica(f.id); setNuova(false); }}>
                                                                    <Pencil className="w-3.5 h-3.5" /> Modifica
                                                                </Button>
                                                                <Button size="sm" variant="ghost" className="h-8 gap-1.5" disabled={!puo} onClick={() => esegui(mostraNascondiFaq(f, operatoreId), f.attiva ? 'Nascosta da Supporto' : 'Di nuovo su Supporto')}>
                                                                    {f.attiva ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {f.attiva ? 'Nascondi' : 'Mostra'}
                                                                </Button>
                                                                <Conferma
                                                                    titolo="Eliminare questa FAQ?"
                                                                    testo={`«${f.domanda}» sparisce anche dalla pagina Supporto. Se vuoi solo toglierla per un po’, nascondila.`}
                                                                    etichetta="Elimina"
                                                                    onConferma={() => esegui(eliminaFaq(f, operatoreId), 'FAQ eliminata')}
                                                                >
                                                                    <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-red-700" disabled={!puo}>
                                                                        <Trash2 className="w-3.5 h-3.5" /> Elimina
                                                                    </Button>
                                                                </Conferma>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="categorie" className="space-y-4">
                        <Card>
                            <CardContent className="pt-4 pb-4 flex flex-wrap items-center gap-2">
                                <Input value={nuovaCategoria} onChange={e => setNuovaCategoria(e.target.value)} placeholder="Nome della categoria nuova" className="flex-1 min-w-[12rem]" disabled={!puo} aria-label="Nome della categoria nuova" />
                                <Button className="gap-2" disabled={!puo} onClick={aggiungiCategoria}><Plus className="w-4 h-4" /> Aggiungi</Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-0">
                                <ul className="divide-y divide-border">
                                    {categorie.map((c, i) => {
                                        const quante = faq.filter(f => stesso(f.categoriaId, c.id)).length;
                                        return (
                                            <li key={c.id} className="p-4 space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {stesso(rinomina.id, c.id) ? (
                                                        <div className="flex flex-1 items-center gap-2 min-w-[14rem]">
                                                            <Input value={rinomina.nome} onChange={e => setRinomina({ id: c.id, nome: e.target.value })} className="h-8" aria-label="Nuovo nome" autoFocus />
                                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => confermaRinomina(c)} aria-label="Conferma il nome"><Check className="w-4 h-4" /></Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setRinomina({ id: null, nome: '' })} aria-label="Annulla"><X className="w-4 h-4" /></Button>
                                                        </div>
                                                    ) : (
                                                        <p className={`flex-1 font-medium ${c.attiva ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                            {c.nome} <span className="text-sm font-normal text-muted-foreground">· {quante} {quante === 1 ? 'domanda' : 'domande'}</span>
                                                        </p>
                                                    )}
                                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${c.attiva ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{c.attiva ? 'Visibile' : 'Nascosta'}</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    <Firma x={c} />
                                                    <div className="flex flex-wrap gap-1 sm:ml-auto">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8" disabled={!puo || i === 0} onClick={() => esegui(spostaCategoria(c, -1, operatoreId), 'Categoria spostata')} aria-label="Sposta su"><ArrowUp className="w-4 h-4" /></Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8" disabled={!puo || i === categorie.length - 1} onClick={() => esegui(spostaCategoria(c, 1, operatoreId), 'Categoria spostata')} aria-label="Sposta giù"><ArrowDown className="w-4 h-4" /></Button>
                                                        <Button size="sm" variant="ghost" className="h-8 gap-1.5" disabled={!puo} onClick={() => setRinomina({ id: c.id, nome: c.nome })}><Pencil className="w-3.5 h-3.5" /> Rinomina</Button>
                                                        <Button size="sm" variant="ghost" className="h-8 gap-1.5" disabled={!puo} onClick={() => esegui(mostraNascondiCategoria(c, operatoreId), c.attiva ? 'Categoria nascosta' : 'Categoria di nuovo visibile')}>
                                                            {c.attiva ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {c.attiva ? 'Nascondi' : 'Mostra'}
                                                        </Button>
                                                        <Conferma
                                                            titolo="Eliminare questa categoria?"
                                                            testo={quante ? `Ha ancora ${quante} ${quante === 1 ? 'domanda' : 'domande'}: spostale o eliminale prima.` : `«${c.nome}» sparisce anche dalla pagina Supporto.`}
                                                            etichetta="Elimina"
                                                            disabled={quante > 0}
                                                            onConferma={() => esegui(eliminaCategoria(c, operatoreId), 'Categoria eliminata')}
                                                        >
                                                            <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-red-700" disabled={!puo}><Trash2 className="w-3.5 h-3.5" /> Elimina</Button>
                                                        </Conferma>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="registro">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Chi ha cambiato cosa</CardTitle>
                                <p className="text-sm text-muted-foreground">Le ultime cinquanta modifiche, dalla più recente.</p>
                            </CardHeader>
                            <CardContent className="p-0">
                                {registro.length === 0 ? (
                                    <p className="border-t border-border p-4 text-sm text-muted-foreground">Nessuna modifica: le FAQ sono quelle di partenza.</p>
                                ) : (
                                    <ul className="divide-y divide-border border-t border-border">
                                        {registro.map(r => (
                                            <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 p-4 text-sm">
                                                <span className="text-foreground"><span className="font-medium">{r.azione}</span> · {r.oggetto}</span>
                                                <span className="text-xs text-muted-foreground">{nomeOperatore(r.da)} · {fmtData(r.il)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {MODO_DEMO && (
                    <NotaMockup>
                        <p>Nei mockup locali le modifiche restano in questo browser. Sul sito pubblicato stanno nel database: le vede chiunque apra Supporto.</p>
                        <Button size="sm" variant="outline" className="mt-3 gap-2 bg-white" onClick={ripristina}>
                            <RotateCcw className="w-3.5 h-3.5" /> Ripristina le FAQ di partenza
                        </Button>
                    </NotaMockup>
                )}
            </div>
        </>
    );
};

export default FaqAdminPage;
