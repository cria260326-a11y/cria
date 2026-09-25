import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Info, X } from 'lucide-react';
import { toast } from 'sonner';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import TabellaMesi from '@/components/aree/TabellaMesi';
import { useDatiProprietario } from '@/hooks/useDatiArea';
import { segnalaMese } from '@/lib/cicloFonte';
import { PARAMETRI, PRODOTTI } from '@/data/catalogo';
import { OGGI } from '@/data/datiDemo';
import { nomeMese } from '@/lib/formato';

// P-12 — Segnalazioni: i tre esiti del mese e cosa comportano.

// Il mese che aspetta una risposta: quello in corso, sui contratti dove
// incassa il proprietario, finché nessuno ha detto se il canone è arrivato.
const MESE_IN_CORSO = OGGI.slice(0, 7);

const daSegnalare = (contratti) => contratti.filter(c => PRODOTTI[c.prodotto]?.incassa === 'proprietario').map(c => {
    const m = c.mesi.find(x => x.mese === MESE_IN_CORSO);
    return m && (!m.segnalazione || m.stato === 'atteso') ? { c, mese: MESE_IN_CORSO } : null;
}).filter(Boolean);

const DaRispondere = ({ righe }) => {
    const [inCorso, setInCorso] = useState(null);
    if (!righe.length) return null;

    const rispondi = async ({ c, mese }, arrivato) => {
        setInCorso(`${c.id}-${mese}`);
        const esito = await segnalaMese(c, mese, arrivato ? 'pagato' : 'non_pagato');
        setInCorso(null);
        if (esito.ok) toast.success(arrivato ? 'Segnato come arrivato' : 'Segnalato: CRIA avvisa l’inquilino e apre la pratica se serve');
        else toast.error(esito.messaggio || 'Segnalazione non riuscita');
    };

    return (
        <Card className="border-amber-200 bg-amber-50/60">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Il canone di {nomeMese(MESE_IN_CORSO).toLowerCase()} è arrivato?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {righe.map(({ c, mese }) => (
                    <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/80 border border-amber-200 p-3">
                        <span className="text-sm text-foreground">{c.immobile.indirizzo} · {c.canone} €</span>
                        <span className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 bg-white" disabled={inCorso} onClick={() => rispondi({ c, mese }, true)}>Sì, è arrivato</Button>
                            <Button size="sm" variant="outline" className="h-8 bg-white" disabled={inCorso} onClick={() => rispondi({ c, mese }, false)}>No, non è arrivato</Button>
                        </span>
                    </div>
                ))}
                <p className="text-xs text-amber-900">
                    Rispondere entro il {PARAMETRI.giornoScadenzaCanone + PARAMETRI.giorniFinestraCopertura} tiene la copertura del mese. Dopo, il mese conta lo stesso nello storico dell’inquilino, ma la copertura decade.
                </p>
            </CardContent>
        </Card>
    );
};

const SegnalazioniLocatorePage = () => {
    const { contratti } = useDatiProprietario();
    const [fImmobile, setFImmobile] = useState('tutti');
    const [fTipo, setFTipo] = useState('tutti');

    const tutti = useMemo(() => contratti.flatMap(c => c.mesi.map(m => ({ ...m, contrattoId: c.id, immobile: c.immobile.indirizzo }))), [contratti]);
    const filtrati = tutti.filter(m => (fImmobile === 'tutti' || m.contrattoId === fImmobile) && (fTipo === 'tutti' || m.segnalazione.tipo === fTipo));
    const conta = (tipo) => tutti.filter(m => m.segnalazione.tipo === tipo).length;
    const finestra = PARAMETRI.giornoScadenzaCanone + PARAMETRI.giorniFinestraCopertura;

    return (
        <>
            <Helmet><title>Segnalazioni - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Segnalazioni"
                    sottotitolo="Ogni mese, per ogni contratto: cosa è stato segnalato e come conta"
                    azioni={<Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info('Esportazione disponibile con il collegamento al backend')}><Download className="w-4 h-4" /> Esporta CSV</Button>}
                />

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <Contatore etichetta="Pagato" valore={conta('pagato')} colore="bg-green-500" />
                    <Contatore etichetta="Non pagato" valore={conta('non_pagato')} colore="bg-red-500" />
                    <Contatore etichetta="Non rilevato" valore={conta('non_rilevato')} colore="bg-gray-400" />
                    <Contatore etichetta="Contestate" valore={tutti.filter(m => m.contestazioneId).length} colore="bg-amber-500" />
                </div>

                <Card>
                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Info className="w-5 h-5" /> Come funziona la segnalazione</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-sm">
                            <div className="p-3 rounded-lg border border-green-200 bg-green-50">
                                <p className="font-medium text-green-900">Segnali il mancato pagamento entro il {finestra}</p>
                                <p className="text-green-800 text-xs mt-1">Il mese conta come non pagato e la copertura è attiva: la pratica di morosità parte subito.</p>
                            </div>
                            <div className="p-3 rounded-lg border border-orange-200 bg-orange-50">
                                <p className="font-medium text-orange-900">Lo segnali dopo il {finestra}</p>
                                <p className="text-orange-800 text-xs mt-1">Il mese conta comunque come non pagato, perché è la verità sull’inquilino, ma la copertura di quel mese decade.</p>
                            </div>
                            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
                                <p className="font-medium text-gray-900">Non segnali nulla entro l’{PARAMETRI.giornoChiusuraMese}</p>
                                <p className="text-gray-700 text-xs mt-1">Il mese diventa non rilevato: non conta nel semaforo e la copertura decade.</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Prima della scadenza ricevi tre promemoria: {PARAMETRI.solleciti.join(', ')}. Con CRIA Completo segnala CRIA, che incassa il canone. Con CRIA Segnalazione non c’è copertura: la segnalazione serve allo storico.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <select value={fImmobile} onChange={e => setFImmobile(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutti gli immobili</option>
                                {contratti.map(c => <option key={c.id} value={c.id}>{c.immobile.indirizzo}</option>)}
                            </select>
                            <select value={fTipo} onChange={e => setFTipo(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-background">
                                <option value="tutti">Tutte le segnalazioni</option>
                                <option value="pagato">Pagato</option>
                                <option value="non_pagato">Non pagato</option>
                                <option value="non_rilevato">Non rilevato</option>
                            </select>
                            {(fImmobile !== 'tutti' || fTipo !== 'tutti') && (
                                <Button variant="ghost" size="sm" onClick={() => { setFImmobile('tutti'); setFTipo('tutti'); }}><X className="w-3.5 h-3.5 mr-1" /> Azzera</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <DaRispondere righe={daSegnalare(contratti)} />

                <TabellaMesi mesi={filtrati} prospettiva="locatore" percorsoContestazioni="/dashboard/locatore/contestazioni" immobile />
            </div>
        </>
    );
};

export default SegnalazioniLocatorePage;
