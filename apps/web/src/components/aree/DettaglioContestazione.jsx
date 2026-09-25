import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Download, Lock, Send, Info, CheckCircle2, Scale } from 'lucide-react';
import { toast } from 'sonner';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import { Messaggio, MessaggioDiSistema } from '@/components/aree/Messaggio';
import { OGGI } from '@/data/datiDemo';
import { nomeMese, fmtData, fmtDataLunga, fmtQuando } from '@/lib/formato';
import { etichettaStatoContestazione, classeStatoContestazione, contestazioneChiusa } from '@/lib/etichette';

const PASSI = ['Aperta', 'In verifica', 'Esito'];
const passoAttuale = (stato) => (stato === 'aperta' ? 0 : contestazioneChiusa(stato) ? 2 : 1);

// Il dettaglio di una contestazione visto da una delle due parti.
// La decisione è di CRIA: qui non ci sono comandi per risolverla,
// né le note interne. Ognuno può aggiungere prove e scrivere a CRIA.
const DettaglioContestazione = ({ contestazione: k, contratto: c, prospettiva, tornaA }) => {
    const [messaggi, setMessaggi] = useState(k.messaggi);
    const [documenti, setDocumenti] = useState(k.documenti);
    const [testo, setTesto] = useState('');
    const fileRef = useRef(null);
    const chiusa = contestazioneChiusa(k.stato);
    const passo = passoAttuale(k.stato);

    // Il nome serve solo sui messaggi ricevuti: i miei stanno a destra, senza nome.
    const nomeAutore = (a) => {
        if (a === 'cria') return 'CRIA';
        return a === 'locatore' ? `${c.locatore.nome} · proprietario` : `${c.conduttore.nome} · inquilino`;
    };

    const invia = () => {
        if (!testo.trim()) return;
        setMessaggi(prev => [...prev, { id: Date.now(), autore: prospettiva, testo: testo.trim(), il: `${OGGI} ora` }]);
        setTesto('');
        toast.success('Messaggio inviato a CRIA');
    };

    const aggiungiProva = (file) => {
        if (!file) return;
        setDocumenti(prev => [...prev, { id: `nuovo-${Date.now()}`, nome: file.name, caricatoDa: prospettiva, il: OGGI }]);
        toast.success('Prova aggiunta: la esamina CRIA');
    };

    const segnalatoDa = k.segnalazione && (c.prodotto === 'P2' ? 'CRIA' : prospettiva === 'locatore' ? 'te' : c.locatore.nome);

    return (
        <div className="space-y-6">
            <IntestazionePagina
                indietro={tornaA}
                titolo={`Contestazione di ${nomeMese(k.mese).toLowerCase()}`}
                sottotitolo={`${c.immobile.indirizzo}, ${c.immobile.citta} · ${prospettiva === 'locatore' ? `inquilino ${c.conduttore.nome}` : `proprietario ${c.locatore.nome}`}`}
                badge={
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${classeStatoContestazione(k.stato)}`}>
                        {etichettaStatoContestazione(k.stato, prospettiva)}
                    </span>
                }
            />

            {/* Avanzamento */}
            <Card>
                <CardContent className="pt-5 pb-5">
                    <div className="flex items-center">
                        {PASSI.map((p, i) => (
                            <React.Fragment key={p}>
                                <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= passo ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                        {i < passo ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                    </div>
                                    <span className={`text-sm ${i <= passo ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{p}</span>
                                </div>
                                {i < PASSI.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${i < passo ? 'bg-primary' : 'bg-muted'}`} />}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                        {chiusa ? <Scale className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" /> : <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />}
                        <p className="text-sm text-blue-900">
                            {chiusa
                                ? <>Chiusa il {fmtDataLunga(k.chiusaIl)}. {k.esito}</>
                                : <>A decidere è CRIA, sulla base delle prove di entrambe le parti. Risposta entro il {fmtDataLunga(k.rispostaEntro)}. Nel frattempo il mese resta in verifica e non conta nel semaforo.</>}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Colonna sinistra */}
                <div className="xl:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-base">Cosa è stato contestato</CardTitle></CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground">Segnalazione</p>
                                <p className="font-medium text-foreground">Mancato pagamento di {nomeMese(k.mese).toLowerCase()}</p>
                                <p className="text-xs text-muted-foreground">Segnalato da {segnalatoDa} il {fmtData(k.segnalazione.il)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Contestazione</p>
                                <p className="font-medium text-foreground">Aperta {prospettiva === 'conduttore' ? 'da te' : `da ${c.conduttore.nome}`} il {fmtData(k.apertaIl)}</p>
                                <p className="text-muted-foreground mt-1">{k.motivo}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base"><FileText className="w-5 h-5" /> Prove ({documenti.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {documenti.map(d => {
                                const mio = d.caricatoDa === prospettiva;
                                return (
                                    <div key={d.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{d.nome}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {mio ? 'Caricata da te' : `Caricata da ${d.caricatoDa === 'locatore' ? c.locatore.nome : c.conduttore.nome}`} · {fmtData(d.il)}
                                            </p>
                                        </div>
                                        {mio ? (
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toast.info('Download disponibile con il collegamento al backend')}>
                                                <Download className="w-3.5 h-3.5" />
                                            </Button>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0" title="La esamina CRIA">
                                                <Lock className="w-3.5 h-3.5" /> la esamina CRIA
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                            {!chiusa && (
                                <>
                                    <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={e => { aggiungiProva(e.target.files?.[0]); e.target.value = ''; }} />
                                    <button onClick={() => fileRef.current?.click()}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-colors">
                                        <Upload className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Aggiungi una prova</p>
                                            <p className="text-xs text-muted-foreground">PDF, JPG o PNG</p>
                                        </div>
                                    </button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Comunicazioni */}
                <Card className="xl:col-span-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base"><Send className="w-5 h-5" /> Comunicazioni</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {messaggi.map(m => (
                                m.autore === 'sistema'
                                    ? <MessaggioDiSistema key={m.id}>{m.testo}</MessaggioDiSistema>
                                    : (
                                        <Messaggio key={m.id} mio={m.autore === prospettiva} autore={nomeAutore(m.autore)} quando={fmtQuando(m.il)}>
                                            {m.testo}
                                        </Messaggio>
                                    )
                            ))}
                        </div>
                        {!chiusa && (
                            <div className="flex gap-2 pt-3 border-t border-border">
                                <textarea value={testo} onChange={e => setTesto(e.target.value)} rows={2}
                                    placeholder="Scrivi a CRIA…"
                                    className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                <Button onClick={invia} className="gap-2 self-end"><Send className="w-4 h-4" /> Invia</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DettaglioContestazione;
