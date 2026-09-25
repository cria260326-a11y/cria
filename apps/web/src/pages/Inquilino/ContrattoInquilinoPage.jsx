import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, User, Mail, Phone, MapPin, Euro, Download } from 'lucide-react';
import { toast } from 'sonner';
import MappaImmobili from '@/components/MappaImmobili.jsx';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import { useDatiInquilino } from '@/hooks/useDatiArea';
import { fmtEuro } from '@/data/catalogo';
import { fmtData, nomeMese } from '@/lib/formato';
import { TIPO_DOCUMENTO, STATO_DOCUMENTO } from '@/lib/etichette';

// I-03 — Il mio contratto.

const Voce = ({ etichetta, children }) => (
    <div><p className="text-xs text-muted-foreground mb-0.5">{etichetta}</p><p className="font-medium text-foreground">{children}</p></div>
);

const ContrattoInquilinoPage = () => {
    const { contratti, documenti } = useDatiInquilino();

    return (
        <>
            <Helmet><title>Il mio contratto - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Il mio contratto"
                    sottotitolo="I dati del contratto di locazione, del proprietario e della registrazione"
                    azioni={<Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info('Il PDF si genera con il collegamento al backend')}><Download className="w-4 h-4" /> Scarica PDF</Button>}
                />

                {contratti.map(c => {
                    const docs = documenti.filter(d => d.contrattoId === c.id || !d.contrattoId);
                    return (
                        <div key={c.id} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="xl:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center gap-2 text-base"><Euro className="w-5 h-5" /> {c.immobile.indirizzo}, {c.immobile.citta}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{c.immobile.cap} {c.immobile.citta} ({c.immobile.provincia}) · {c.immobile.tipologia}, {c.immobile.mq} m²</p>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                        <Voce etichetta="Canone">{fmtEuro(c.canone)}/mese</Voce>
                                        <Voce etichetta="Deposito">{fmtEuro(c.deposito)}</Voce>
                                        <Voce etichetta="Inizio">{fmtData(c.inizio)}</Voce>
                                        <Voce etichetta="Scadenza">{fmtData(c.fine)}</Voce>
                                        <Voce etichetta="Durata">{c.durata}</Voce>
                                        <Voce etichetta="Su CRIA dal">{nomeMese(c.attivoDal)}</Voce>
                                        <div className="col-span-2">
                                            <p className="text-xs text-muted-foreground mb-0.5">Registrazione</p>
                                            <p className="font-medium text-foreground font-mono text-xs">{c.registrazione.numero}</p>
                                            <p className="text-xs text-muted-foreground">{fmtData(c.registrazione.data)} · {c.registrazione.ufficio}</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><User className="w-5 h-5" /> Il proprietario</CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                        <Voce etichetta="Nome">{c.locatore.nome}</Voce>
                                        <div><p className="text-xs text-muted-foreground mb-0.5">Email</p><p className="font-medium text-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> {c.locatore.email}</p></div>
                                        <div><p className="text-xs text-muted-foreground mb-0.5">Telefono</p><p className="font-medium text-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-muted-foreground" /> {c.locatore.telefono}</p></div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><FileText className="w-5 h-5" /> Documenti</CardTitle></CardHeader>
                                    <CardContent className="space-y-2">
                                        {docs.map(d => (
                                            <div key={d.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">{d.nome}</p>
                                                    <p className="text-xs text-muted-foreground">{TIPO_DOCUMENTO[d.tipo]} · {fmtData(d.caricatoIl)}</p>
                                                </div>
                                                <span className={`text-xs font-medium ${STATO_DOCUMENTO[d.stato].classe}`}>{STATO_DOCUMENTO[d.stato].etichetta}</span>
                                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toast.info('Download disponibile con il collegamento al backend')}><Download className="w-3.5 h-3.5" /></Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="h-fit">
                                <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><MapPin className="w-5 h-5" /> Posizione</CardTitle></CardHeader>
                                <CardContent className="pt-0">
                                    <MappaImmobili immobili={[{ id: c.id, lat: c.immobile.lat, lng: c.immobile.lng, titolo: c.immobile.indirizzo, righe: [c.immobile.citta], stato: c.analisi.semaforo }]} altezza={280} />
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default ContrattoInquilinoPage;
