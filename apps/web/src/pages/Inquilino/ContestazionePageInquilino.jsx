import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft, ChevronRight, AlertTriangle, Plus, Send,
    Upload, X, FileText, CheckCircle2, Scale, Info, Clock
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mock contestazioni ────────────────────────────────────────────────────────
const CONTESTAZIONI_INIZIALI = [
    {
        id: 1, mese: 'Marzo 2026', dataApertura: '2026-03-29',
        motivo: 'Pagamento contestato', stato: 'in verifica',
        apertaDa: 'me',
        documenti: [
            { id: 1, nome: 'Ricevuta bonifico Marzo.pdf', caricatoDa: 'Tu', data: '29/03/2026', stato: 'da verificare' },
            { id: 2, nome: 'Estratto conto.pdf', caricatoDa: 'locatore', data: '30/03/2026', stato: 'da verificare' },
        ],
        messaggi: [
            { id: 1, mittente: 'Sistema', testo: 'Hai aperto una contestazione per la segnalazione di mancato pagamento di Marzo.', data: '29/03/2026 10:30', ruolo: 'sistema' },
            { id: 2, mittente: 'Tu', testo: 'Ho effettuato il bonifico il 3 Marzo, allego la ricevuta.', data: '29/03/2026 10:31', ruolo: 'inquilino' },
            { id: 3, mittente: 'CRIA', testo: 'Abbiamo ricevuto i documenti. Stiamo verificando con il locatore.', data: '30/03/2026 11:00', ruolo: 'cria' },
        ],
    },
];

const fmtData = (iso) => new Date(iso).toLocaleDateString('it-IT');

const STATO_BADGE = {
    'aperta': 'bg-red-100 text-red-800',
    'in verifica': 'bg-yellow-100 text-yellow-800',
    'risolta': 'bg-green-100 text-green-800',
    'chiusa': 'bg-gray-100 text-gray-600',
};

const ESITO_LABEL = {
    'favore_locatore': { label: 'Risolta a favore locatore', cls: 'bg-red-100 text-red-800' },
    'favore_inquilino': { label: 'Risolta a tuo favore', cls: 'bg-green-100 text-green-800' },
};

const MSG_STYLE = {
    sistema: 'bg-muted/60 text-muted-foreground italic text-xs text-center py-2',
    cria: 'bg-primary/10 text-foreground',
    inquilino: 'bg-blue-50 text-foreground ml-8',
    locatore: 'bg-green-50 text-foreground',
};

// ─── Modal apri contestazione ──────────────────────────────────────────────────
const ModalApriContestazione = ({ onClose, onCreate }) => {
    const [motivo, setMotivo] = useState('');
    const [mese, setMese] = useState('');
    const [descrizione, setDescrizione] = useState('');
    const [file, setFile] = useState(null);
    const fileRef = useRef(null);

    const conferma = () => {
        if (!motivo) { toast.error('Seleziona un motivo'); return; }
        if (!mese.trim()) { toast.error('Indica il mese'); return; }
        if (!descrizione.trim()) { toast.error('Descrivi la situazione'); return; }
        onCreate({ motivo, mese, descrizione, file });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-bold text-foreground">Apri una contestazione</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">

                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800">
                            Apri una contestazione se ritieni di aver subito un'ingiustizia (es. pagamento non riconosciuto, problema con il contratto, addebito errato). CRIA verificherà la tua segnalazione.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Motivo <span className="text-red-500">*</span></Label>
                        <select value={motivo} onChange={e => setMotivo(e.target.value)}
                            className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background">
                            <option value="">— Seleziona un motivo —</option>
                            <option value="pagamento_non_riconosciuto">Pagamento non riconosciuto</option>
                            <option value="contratto">Problema con il contratto</option>
                            <option value="addebito_errato">Addebito errato</option>
                            <option value="manutenzione">Manutenzione non effettuata</option>
                            <option value="altro">Altro</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Mese di riferimento <span className="text-red-500">*</span></Label>
                        <Input value={mese} onChange={e => setMese(e.target.value)} placeholder="Es. Aprile 2026" />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Descrizione <span className="text-red-500">*</span></Label>
                        <textarea value={descrizione} onChange={e => setDescrizione(e.target.value)} rows={4}
                            placeholder="Descrivi nel dettaglio la situazione..."
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
                                    <p className="text-sm font-medium text-foreground">Carica documento</p>
                                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG — max 10MB</p>
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>Annulla</Button>
                    <Button onClick={conferma} className="gap-2">
                        <Send className="w-4 h-4" /> Apri contestazione
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ─── Lista ────────────────────────────────────────────────────────────────────
const Lista = ({ contestazioni, onApri }) => {
    const navigate = useNavigate();
    return (
        <div className="space-y-3">
            {contestazioni.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                        <p className="font-medium text-foreground">Nessuna contestazione attiva</p>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">Tutto regolare con il tuo contratto.</p>
                        <Button onClick={onApri} className="gap-2">
                            <Plus className="w-4 h-4" /> Apri una contestazione
                        </Button>
                    </CardContent>
                </Card>
            ) : contestazioni.map(c => (
                <Card key={c.id} className="cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => navigate(`/dashboard/inquilino/contestazioni/${c.id}`)}>
                    <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="space-y-1">
                                <p className="font-semibold text-foreground">Contestazione {c.mese}</p>
                                <p className="text-sm text-muted-foreground">Motivo: {c.motivo}</p>
                                <p className="text-xs text-muted-foreground">
                                    Aperta da {c.apertaDa === 'me' ? 'te' : 'locatore'} il {fmtData(c.dataApertura)}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_BADGE[c.stato]}`}>
                                    {c.stato}
                                </span>
                                {c.esito && (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ESITO_LABEL[c.esito]?.cls}`}>
                                        {ESITO_LABEL[c.esito]?.label}
                                    </span>
                                )}
                                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                    Dettaglio <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

// ─── Dettaglio ────────────────────────────────────────────────────────────────
const Dettaglio = ({ id, contestazioni, setContestazioni }) => {
    const c = contestazioni.find(x => x.id === Number(id));
    const [messaggio, setMessaggio] = useState('');
    const [fileUpload, setFileUpload] = useState(null);
    const fileRef = useRef(null);

    if (!c) return <p className="text-center text-muted-foreground py-12">Contestazione non trovata.</p>;

    const inviaMessaggio = () => {
        if (!messaggio.trim()) return;
        const nuovo = {
            id: Date.now(),
            mittente: 'Tu',
            testo: messaggio,
            data: new Date().toLocaleString('it-IT'),
            ruolo: 'inquilino',
        };
        setContestazioni(prev => prev.map(x => x.id === c.id ? { ...x, messaggi: [...x.messaggi, nuovo] } : x));
        setMessaggio('');
        toast.success('Messaggio inviato a CRIA');
    };

    const caricaDoc = () => {
        if (!fileUpload) return;
        const nuovoDoc = {
            id: Date.now(),
            nome: fileUpload.name,
            caricatoDa: 'Tu',
            data: new Date().toLocaleDateString('it-IT'),
            stato: 'da verificare',
        };
        setContestazioni(prev => prev.map(x => x.id === c.id ? { ...x, documenti: [...x.documenti, nuovoDoc] } : x));
        setFileUpload(null);
        toast.success('Documento caricato');
    };

    return (
        <div className="space-y-6">

            <div className="flex items-center gap-2 text-sm">
                <Link to="/dashboard/inquilino/contestazioni">
                    <Button variant="ghost" size="sm" className="gap-1 px-2">
                        <ArrowLeft className="w-4 h-4" /> Contestazioni
                    </Button>
                </Link>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{c.mese}</span>
            </div>

            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Contestazione {c.mese}</h2>
                    <p className="text-sm text-muted-foreground">Motivo: {c.motivo} · Aperta il {fmtData(c.dataApertura)}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATO_BADGE[c.stato]}`}>
                        {c.stato}
                    </span>
                    {c.esito && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ESITO_LABEL[c.esito]?.cls}`}>
                            {ESITO_LABEL[c.esito]?.label}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <Scale className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 space-y-1">
                    <p className="font-medium">CRIA sta gestendo questa contestazione</p>
                    <p className="text-xs">Riceverai aggiornamenti via email. Puoi caricare ulteriori prove o inviare un messaggio.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="w-5 h-5" /> Documenti ({c.documenti.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {c.documenti.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{doc.nome}</p>
                                <p className="text-xs text-muted-foreground">{doc.caricatoDa} · {doc.data}</p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${doc.stato === 'verificato' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {doc.stato}
                            </span>
                        </div>
                    ))}

                    {c.stato !== 'risolta' && c.stato !== 'chiusa' && (
                        <div className="pt-2 border-t border-border space-y-2">
                            <p className="text-xs text-muted-foreground">Carica ulteriori prove a tuo supporto</p>
                            {fileUpload ? (
                                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <span className="text-sm flex-1 truncate">{fileUpload.name}</span>
                                    <button onClick={() => setFileUpload(null)} className="text-muted-foreground hover:text-red-500">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <Button size="sm" onClick={caricaDoc} className="gap-1.5">
                                        <Upload className="w-3.5 h-3.5" /> Carica
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={e => { const f = e.target.files?.[0]; if (f) setFileUpload(f); }} />
                                    <button onClick={() => fileRef.current?.click()}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-left">
                                        <Upload className="w-5 h-5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Carica documento</p>
                                            <p className="text-xs text-muted-foreground">PDF, JPG, PNG — max 10MB</p>
                                        </div>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Send className="w-5 h-5" /> Comunicazioni
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {c.messaggi.map(m => (
                            <div key={m.id} className={`p-3 rounded-xl text-sm ${MSG_STYLE[m.ruolo] || 'bg-muted'}`}>
                                {m.ruolo !== 'sistema' && (
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-xs">{m.mittente}</span>
                                        <span className="text-xs text-muted-foreground">{m.data}</span>
                                    </div>
                                )}
                                <p className={m.ruolo === 'sistema' ? '' : 'text-foreground'}>{m.testo}</p>
                            </div>
                        ))}
                    </div>

                    {c.stato !== 'risolta' && c.stato !== 'chiusa' && (
                        <div className="flex gap-2 pt-2 border-t border-border">
                            <textarea value={messaggio} onChange={e => setMessaggio(e.target.value)}
                                placeholder="Scrivi un messaggio a CRIA..." rows={2}
                                className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            <Button onClick={inviaMessaggio} className="gap-2 self-end">
                                <Send className="w-4 h-4" /> Invia
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

// ─── Componente principale ────────────────────────────────────────────────────
const ContestazionePageInquilino = () => {
    const { id } = useParams();
    const [contestazioni, setContestazioni] = useState(CONTESTAZIONI_INIZIALI);
    const [showApri, setShowApri] = useState(false);

    const apriContestazione = (dati) => {
        const nuova = {
            id: Date.now(),
            mese: dati.mese,
            dataApertura: new Date().toISOString().split('T')[0],
            motivo: dati.motivo.replace(/_/g, ' '),
            stato: 'aperta',
            apertaDa: 'me',
            documenti: dati.file ? [{
                id: Date.now(), nome: dati.file.name, caricatoDa: 'Tu',
                data: new Date().toLocaleDateString('it-IT'), stato: 'da verificare',
            }] : [],
            messaggi: [
                { id: 1, mittente: 'Sistema', testo: 'Hai aperto una nuova contestazione.', data: new Date().toLocaleString('it-IT'), ruolo: 'sistema' },
                { id: 2, mittente: 'Tu', testo: dati.descrizione, data: new Date().toLocaleString('it-IT'), ruolo: 'inquilino' },
            ],
        };
        setContestazioni(prev => [nuova, ...prev]);
        toast.success('Contestazione aperta — CRIA la sta esaminando');
    };

    return (
        <>
            <Helmet><title>{id ? 'Contestazione - CRIA' : 'Contestazioni - CRIA'}</title></Helmet>

            {showApri && <ModalApriContestazione onClose={() => setShowApri(false)} onCreate={apriContestazione} />}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                {!id && (
                    <>
                        <div className="flex items-start justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground mb-1">Contestazioni</h1>
                                <p className="text-sm text-muted-foreground">Storico contestazioni e apertura di nuove segnalazioni</p>
                            </div>
                            <Button onClick={() => setShowApri(true)} className="gap-2">
                                <Plus className="w-4 h-4" /> Apri contestazione
                            </Button>
                        </div>
                        <Lista contestazioni={contestazioni} onApri={() => setShowApri(true)} />
                    </>
                )}
                {id && <Dettaglio id={id} contestazioni={contestazioni} setContestazioni={setContestazioni} />}
            </div>
        </>
    );
};

export default ContestazionePageInquilino;