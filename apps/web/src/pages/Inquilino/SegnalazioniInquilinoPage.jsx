import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle2, XCircle, MinusCircle, Clock, Info, Upload, FileText, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import { useDatiInquilino } from '@/hooks/useDatiArea';
import { apriContestazione } from '@/lib/cicloFonte';
import { caricaDocumento } from '@/lib/documentiFonte';
import { OGGI } from '@/data/datiDemo';
import { PARAMETRI } from '@/data/catalogo';
import { nomeMese, fmtData, giorniTra, aggiungiGiorni } from '@/lib/formato';

// I-05 — Segnalazioni ricevute. Si contesta solo una segnalazione di mancato
// pagamento, entro 7 giorni dalla data della segnalazione.

const TIPO = {
    pagato: { etichetta: 'Pagato', classe: 'bg-green-100 text-green-800', icona: CheckCircle2 },
    non_pagato: { etichetta: 'Non pagato', classe: 'bg-red-100 text-red-800', icona: XCircle },
    non_rilevato: { etichetta: 'Non rilevato', classe: 'bg-gray-100 text-gray-700', icona: MinusCircle },
};

const ModalContesta = ({ riga, onChiudi, onInvia }) => {
    const [motivo, setMotivo] = useState('');
    const [file, setFile] = useState(null);
    const [inCorso, setInCorso] = useState(false);
    const fileRef = useRef(null);
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-bold text-foreground">Contesta la segnalazione</h3>
                    <button onClick={onChiudi} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="p-4 bg-muted/40 rounded-xl">
                        <p className="text-sm font-medium text-foreground">{nomeMese(riga.mese)} · mancato pagamento</p>
                        <p className="text-xs text-muted-foreground">Segnalato da {riga.c.locatore.nome} il {fmtData(riga.segnalazione.il)} · {riga.c.immobile.indirizzo}</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-900">Decide CRIA sulla base delle prove. Allega la ricevuta del bonifico: è la prova principale. Mentre la contestazione è in corso il mese non conta nel tuo semaforo.</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Perché la segnalazione è sbagliata <span className="text-red-500">*</span></Label>
                        <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={4}
                            placeholder="Es. ho fatto il bonifico il 3 settembre…"
                            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Prova</Label>
                        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0] || null)} />
                        {file ? (
                            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <FileText className="w-4 h-4 text-green-600" /><span className="text-sm flex-1 truncate">{file.name}</span>
                                <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-red-500"><X className="w-4 h-4" /></button>
                            </div>
                        ) : (
                            <button onClick={() => fileRef.current?.click()} className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-left">
                                <Upload className="w-4 h-4 text-muted-foreground" />
                                <div><p className="text-sm font-medium text-foreground">Carica la ricevuta del bonifico</p><p className="text-xs text-muted-foreground">PDF, JPG o PNG</p></div>
                            </button>
                        )}
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
                    <Button variant="outline" onClick={onChiudi}>Annulla</Button>
                    <Button className="gap-2" disabled={inCorso} onClick={async () => {
                        if (motivo.trim().length < 5) { toast.error('Scrivi perché la segnalazione è sbagliata'); return; }
                        setInCorso(true);
                        await onInvia({ motivo: motivo.trim(), file });
                        setInCorso(false);
                    }}>
                        <Send className="w-4 h-4" /> Invia a CRIA
                    </Button>
                </div>
            </div>
        </div>
    );
};

const SegnalazioniInquilinoPage = () => {
    const { persona, contratti } = useDatiInquilino();
    const [modale, setModale] = useState(null);
    const [inviate, setInviate] = useState({});
    const righe = contratti.flatMap(c => c.mesi.map(m => ({ ...m, c }))).sort((a, b) => b.mese.localeCompare(a.mese));
    const chiave = (r) => `${r.c.id}-${r.mese}`;
    const contestabili = righe.filter(r => r.stato === 'in_attesa' && !inviate[chiave(r)]);

    const invia = async ({ motivo, file }) => {
        const esito = await apriContestazione(modale.c, modale.mese, motivo);
        if (!esito.ok) { toast.error(esito.messaggio || 'Contestazione non inviata'); return; }
        if (file) {
            // La prova resta attaccata al contratto: la vede chi decide.
            await caricaDocumento(file, { persona, entita: 'contratto', entitaId: modale.c.contrattoDb, tipo: 'prova' });
        }
        setInviate(prev => ({ ...prev, [chiave(modale)]: aggiungiGiorni(OGGI, PARAMETRI.giorniRispostaContestazione) }));
        setModale(null);
        toast.success(`Contestazione inviata: CRIA risponde entro ${PARAMETRI.giorniRispostaContestazione} giorni`);
    };

    return (
        <>
            <Helmet><title>Segnalazioni - CRIA</title></Helmet>
            {modale && <ModalContesta riga={modale} onChiudi={() => setModale(null)} onInvia={invia} />}
            <div className="space-y-6">
                <IntestazionePagina titolo="Segnalazioni ricevute" sottotitolo="Cosa ha segnalato il proprietario, mese per mese" />

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <Contatore etichetta="Pagato" valore={righe.filter(r => r.segnalazione.tipo === 'pagato').length} colore="bg-green-500" />
                    <Contatore etichetta="Non pagato" valore={righe.filter(r => r.segnalazione.tipo === 'non_pagato').length} colore="bg-red-500" />
                    <Contatore etichetta="Non rilevato" valore={righe.filter(r => r.segnalazione.tipo === 'non_rilevato').length} colore="bg-gray-400" />
                    <Contatore etichetta="Contestabili ora" valore={contestabili.length} colore="bg-yellow-500" />
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">
                        Se il proprietario segnala un mancato pagamento che non è vero, puoi contestarlo entro {PARAMETRI.giorniContestazione} giorni dalla segnalazione, allegando la prova. Decide CRIA. Se il proprietario non segnala nulla entro l’{PARAMETRI.giornoChiusuraMese}, il mese è non rilevato e non conta nel tuo semaforo.
                    </p>
                </div>

                <div className="space-y-3">
                    {righe.map(r => {
                        const t = TIPO[r.segnalazione.tipo];
                        const Icona = t.icona;
                        const inviata = inviate[chiave(r)];
                        return (
                            <Card key={chiave(r)}>
                                <CardContent className="py-4 flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex-1 min-w-[16rem]">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <p className="font-semibold text-foreground">{nomeMese(r.mese)}</p>
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${t.classe}`}><Icona className="w-3 h-3" /> {t.etichetta}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {r.segnalazione.tipo === 'non_rilevato'
                                                ? 'Il proprietario non ha segnalato nulla entro l’11: il mese non conta nel tuo semaforo.'
                                                : `${r.segnalazione.fonte === 'cria' ? 'Segnalato da CRIA' : `Segnalato da ${r.c.locatore.nome}`} il ${fmtData(r.segnalazione.il)}${r.pagatoIl ? ` · pagamento del ${fmtData(r.pagatoIl)}` : ''}`}
                                        </p>
                                        {r.stato === 'in_attesa' && !inviata && (
                                            <p className="text-xs text-yellow-800 flex items-center gap-1 mt-2"><Clock className="w-3 h-3" /> Puoi contestare fino al {fmtData(r.scadenzaContestazione)} ({giorniTra(OGGI, r.scadenzaContestazione)} giorni)</p>
                                        )}
                                        {inviata && <p className="text-xs text-blue-800 mt-2">Contestazione inviata: CRIA risponde entro il {fmtData(inviata)}.</p>}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {r.stato === 'in_attesa' && !inviata && (
                                            <Button size="sm" variant="outline" className="gap-2 text-yellow-800 border-yellow-300 hover:bg-yellow-50" onClick={() => setModale(r)}>
                                                <AlertTriangle className="w-3.5 h-3.5" /> Contesta
                                            </Button>
                                        )}
                                        {r.contestazioneId && (
                                            <Link to={`/dashboard/inquilino/contestazioni/${r.contestazioneId}`} className="text-xs font-medium text-primary hover:underline">Vedi la contestazione →</Link>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default SegnalazioniInquilinoPage;
