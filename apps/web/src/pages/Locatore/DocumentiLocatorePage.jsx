import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Download, User, Home } from 'lucide-react';
import { toast } from 'sonner';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import { useDatiProprietario } from '@/hooks/useDatiArea';
import { caricaDocumento, apriDocumento } from '@/lib/documentiFonte';
import { fmtData } from '@/lib/formato';
import { TIPO_DOCUMENTO, STATO_DOCUMENTO } from '@/lib/etichette';

// P-15 — I documenti del proprietario, con il loro stato di verifica.

const RigaDocumento = ({ d, apri }) => (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{d.nome}</p>
            <p className="text-xs text-muted-foreground">{TIPO_DOCUMENTO[d.tipo] || 'Documento'} · caricato il {fmtData(d.caricatoIl)}</p>
        </div>
        <span className={`text-xs font-medium flex-shrink-0 ${STATO_DOCUMENTO[d.stato].classe}`}>{STATO_DOCUMENTO[d.stato].etichetta}</span>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => apri(d)} aria-label={`Apri ${d.nome}`}><Download className="w-3.5 h-3.5" /></Button>
    </div>
);

const DocumentiLocatorePage = () => {
    const { persona, contratti, documenti } = useDatiProprietario();
    const [inCorso, setInCorso] = useState(false);
    const fileRef = useRef(null);
    const tutti = documenti;
    const personali = tutti.filter(d => !d.contrattoId);

    // Il file va nel magazzino e la riga nel database: nasce «in attesa», e
    // lo stato lo mette chi lo verifica, non chi lo carica.
    const carica = async (file) => {
        if (!file || inCorso) return;
        setInCorso(true);
        const esito = await caricaDocumento(file, { persona, entita: 'persona', tipo: 'altro' });
        setInCorso(false);
        if (esito.ok) toast.success('Documento caricato: lo verifica una persona del team CRIA');
        else toast.error(esito.messaggio || 'Caricamento non riuscito: riprova');
    };

    const apri = async (d) => {
        const esito = await apriDocumento(d);
        if (esito.ok) window.open(esito.url, '_blank', 'noopener');
        else toast.info(esito.messaggio);
    };

    return (
        <>
            <Helmet><title>Documenti - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Documenti"
                    sottotitolo="I tuoi documenti e quelli dei tuoi immobili, con lo stato della verifica"
                    azioni={<>
                        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => { carica(e.target.files?.[0]); e.target.value = ''; }} />
                        <Button className="gap-2" disabled={inCorso} onClick={() => fileRef.current?.click()}><Upload className="w-4 h-4" /> {inCorso ? 'Carico…' : 'Carica documento'}</Button>
                    </>}
                />

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <Contatore etichetta="Documenti" valore={tutti.length} colore="bg-blue-500" />
                    <Contatore etichetta="Verificati" valore={tutti.filter(d => d.stato === 'verificato').length} colore="bg-green-500" />
                    <Contatore etichetta="In verifica" valore={tutti.filter(d => d.stato === 'in_attesa').length} colore="bg-yellow-500" />
                    <Contatore etichetta="Da integrare" valore={tutti.filter(d => d.stato === 'da_integrare').length} colore="bg-orange-500" />
                </div>

                <Card>
                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><User className="w-5 h-5" /> I miei documenti</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {personali.length ? personali.map(d => <RigaDocumento key={d.id} d={d} apri={apri} />) : <p className="text-sm text-muted-foreground">Nessun documento personale.</p>}
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {contratti.map(c => {
                        const docs = tutti.filter(d => d.contrattoId === c.id);
                        return (
                            <Card key={c.id}>
                                <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Home className="w-5 h-5" /> {c.immobile.indirizzo} <span className="text-xs font-normal text-muted-foreground">({docs.length})</span></CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                    {docs.length ? docs.map(d => <RigaDocumento key={d.id} d={d} apri={apri} />) : <p className="text-sm text-muted-foreground">Nessun documento caricato.</p>}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default DocumentiLocatorePage;
