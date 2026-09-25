import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Fingerprint, Upload, X, FileCheck2, CheckCircle2, Clock, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { caricaDocumento } from '@/lib/documentiFonte';
import { isVerificata } from '@/lib/aree';

// ═════════════════════════════════════════════════════════════════════════════
// DOCUMENTO D'IDENTITÀ — F-07
// Si caricano documenti e immagini, poi li controlla una persona: non c'è una
// verifica automatica. In produzione l'elenco dei documenti richiesti arriva
// dalla configurazione (documenti_richiesti); qui è scritto per il mockup.
// ═════════════════════════════════════════════════════════════════════════════

const RICHIESTI = {
    fisica: [
        { id: 'documento', titolo: "Documento d'identità", dettaglio: "Carta d'identità, passaporto o patente", facce: ['Fronte', 'Retro'] },
        { id: 'codiceFiscale', titolo: 'Codice fiscale', dettaglio: 'Tessera sanitaria o tesserino del codice fiscale', facce: ['Fronte'] },
    ],
    giuridica: [
        { id: 'visura', titolo: 'Visura camerale', dettaglio: 'Della società che si registra', facce: ['Documento'] },
        { id: 'rappresentante', titolo: 'Documento del legale rappresentante', dettaglio: "Carta d'identità, passaporto o patente", facce: ['Fronte', 'Retro'] },
    ],
};

const BANNER = {
    non_caricato: { icona: Info, classe: 'border-border bg-card text-foreground', titolo: 'Documenti da caricare', testo: 'Carica i documenti richiesti: li controlla una persona del nostro team.' },
    in_attesa: { icona: Clock, classe: 'border-blue-200 bg-blue-50 text-blue-900', titolo: 'Documenti in verifica', testo: 'Li sta controllando una persona del nostro team. Ti scriviamo appena è fatto.' },
    verificato: { icona: CheckCircle2, classe: 'border-green-200 bg-green-50 text-green-900', titolo: 'Identità verificata', testo: 'Se un documento scade o cambia, caricane uno nuovo qui sotto.' },
    da_integrare: { icona: AlertTriangle, classe: 'border-amber-200 bg-amber-50 text-amber-900', titolo: "Serve un'integrazione", testo: null },
};

const formatoDimensione = (byte) => (byte < 1024 * 1024 ? `${Math.max(1, Math.round(byte / 1024))} KB` : `${(byte / 1048576).toFixed(1)} MB`);

const SlotFile = ({ etichetta, valore, onScegli, onTogli, disabilitato }) => (
    <div>
        <p className="text-xs text-muted-foreground mb-1.5">{etichetta}</p>
        {valore ? (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <FileCheck2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="flex-1 min-w-0 text-sm text-foreground truncate">{valore.nome}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{formatoDimensione(valore.dimensione)}</span>
                <button type="button" onClick={onTogli} className="text-muted-foreground hover:text-foreground" aria-label="Togli il file">
                    <X className="w-4 h-4" />
                </button>
            </div>
        ) : (
            <label className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-3 py-5 text-center transition-colors ${disabilitato
                ? 'border-border opacity-50 cursor-not-allowed'
                : 'border-border hover:border-primary/40 hover:bg-accent cursor-pointer'}`}>
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Scegli un file</span>
                <span className="text-xs text-muted-foreground">JPG, PNG o PDF</span>
                <input type="file" accept="image/jpeg,image/png,application/pdf" className="sr-only"
                    disabled={disabilitato} onChange={onScegli} />
            </label>
        )}
    </div>
);

const DocumentoIdentitaPage = () => {
    const { persona, aggiornaPersona } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState({});
    const [inviando, setInviando] = useState(false);

    if (!persona) return null;

    const richiesti = RICHIESTI[persona.tipo] || RICHIESTI.fisica;
    const chiavi = richiesti.flatMap(d => d.facce.map(f => `${d.id}:${f}`));
    const stato = persona.statoIdentita || 'non_caricato';
    const inVerifica = stato === 'in_attesa';
    const giaVerificata = isVerificata(persona);
    const pronti = giaVerificata ? Object.keys(file).length > 0 : chiavi.every(k => file[k]);
    const banner = BANNER[stato] || BANNER.non_caricato;
    const IconaBanner = banner.icona;

    const scegli = (chiave) => (e) => {
        const scelto = e.target.files?.[0];
        if (!scelto) return;
        // Si tiene il file vero: all'invio va nel magazzino, non solo il nome.
        setFile(prev => ({ ...prev, [chiave]: { nome: scelto.name, dimensione: scelto.size, file: scelto } }));
    };

    const togli = (chiave) => () => setFile(prev => {
        const prossimo = { ...prev };
        delete prossimo[chiave];
        return prossimo;
    });

    const invia = async () => {
        if (inviando) return;
        setInviando(true);
        // Prima i file, poi lo stato: se un file non sale, l'identità non
        // risulta «in attesa» di qualcosa che non è arrivato.
        const scelti = Object.entries(file).filter(([, v]) => v.file);
        for (const [chiave, v] of scelti) {
            const esito = await caricaDocumento(v.file, {
                persona, entita: 'persona', tipo: `identita:${chiave.split(':')[0]}`, sensibile: true,
            });
            if (!esito.ok) {
                setInviando(false);
                toast.error(esito.messaggio || 'Un documento non è stato caricato: riprova');
                return;
            }
        }
        setFile({});
        if (giaVerificata) {
            setInviando(false);
            toast.success('Documento ricevuto: lo verifichiamo, e intanto il tuo accesso resta attivo');
            return;
        }
        const esito = await aggiornaPersona({ statoIdentita: 'in_attesa', motivoIntegrazione: null });
        setInviando(false);
        if (esito && esito.ok === false) { toast.error(esito.messaggio || 'Invio non riuscito: riprova'); return; }
        toast.success('Documenti inviati: li controlla una persona del nostro team');
        navigate('/in-attesa');
    };

    return (
        <>
            <Helmet><title>Documento d'identità - CRIA</title></Helmet>

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                        <Fingerprint className="w-6 h-6" /> Documento d'identità
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Carichi documenti e immagini, poi li controlla una persona: non c'è una verifica automatica.
                    </p>
                </div>

                <div className={`flex items-start gap-3 rounded-xl border p-4 ${banner.classe}`}>
                    <IconaBanner className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">{banner.titolo}</p>
                        <p className="text-sm opacity-90">
                            {stato === 'da_integrare'
                                ? `Motivo: ${persona.motivoIntegrazione || 'il documento non è leggibile'}. Carica di nuovo i documenti.`
                                : banner.testo}
                        </p>
                    </div>
                </div>

                {richiesti.map(doc => (
                    <Card key={doc.id}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">{doc.titolo}</CardTitle>
                            <p className="text-sm text-muted-foreground">{doc.dettaglio}</p>
                        </CardHeader>
                        <CardContent>
                            <div className={`grid gap-4 ${doc.facce.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                                {doc.facce.map(faccia => {
                                    const chiave = `${doc.id}:${faccia}`;
                                    return (
                                        <SlotFile key={chiave} etichetta={faccia} valore={file[chiave]}
                                            onScegli={scegli(chiave)} onTogli={togli(chiave)} disabilitato={inVerifica} />
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-xs text-muted-foreground">L'elenco dei documenti richiesti lo stabilisce CRIA e può cambiare.</p>
                    <Button onClick={invia} disabled={!pronti || inVerifica || inviando} className="gap-2">
                        <Upload className="w-4 h-4" /> {giaVerificata ? 'Invia il documento aggiornato' : 'Invia per la verifica'}
                    </Button>
                </div>
            </div>
        </>
    );
};

export default DocumentoIdentitaPage;
