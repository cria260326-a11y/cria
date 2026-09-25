import React, { useState } from 'react';
import { toast } from 'sonner';
import { Gavel } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { nomeOperatore } from '@/data/operatori';
import { AVVOCATO_CONVENZIONATO, MOTIVI_LEGALE } from '@/data/garanzia';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { chiediPassaggioLegale, dalGiorno, decidiPassaggioLegale, ilGiorno } from '@/lib/garanziaDemo';
import { fmtData } from '@/lib/formato';
import AzioneGaranzia from './AzioneGaranzia';
import Termine from './Termine';
import { classeSelect, nomeAvvocato } from './stati';

// ═════════════════════════════════════════════════════════════════════════════
// O-15 — IL PASSAGGIO AL LEGALE. Il gestore lo chiede con un motivo della
// lista; lo decide la responsabile legale, che può anche disporlo lei. Passata
// all'avvocato esterno, la pratica compare nella sua area con il fascicolo.
// ═════════════════════════════════════════════════════════════════════════════

const PassaggioLegale = ({ pratica }) => {
    const { operatore, operatoreId } = useOperatoreAttivo();
    const l = pratica.legale;
    const fase = pratica.fasi.find(f => f.chiave === 'decisione_legale' && !f.chiusaIl);
    const precedenti = pratica.richiesteLegale.filter(r => r !== l);
    const decide = ['resp_legale', 'admin'].includes(operatore.funzione);

    const [modulo, setModulo] = useState(null); // 'chiedi' · 'passa' · 'decidi'
    const [motivo, setMotivo] = useState('rata_saltata');
    const [nota, setNota] = useState('');
    const chiudi = () => { setModulo(null); setNota(''); };
    const esito = (r, testo) => {
        if (!r.ok) return toast.error(r.motivo);
        toast.success(testo);
        return chiudi();
    };

    const campoMotivo = (
        <div className="space-y-1.5">
            <Label htmlFor="legale-motivo">Motivo</Label>
            <select id="legale-motivo" className={classeSelect} value={motivo} onChange={e => setMotivo(e.target.value)}>
                {Object.entries(MOTIVI_LEGALE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
        </div>
    );
    const campoNota = (etichetta, segnaposto) => (
        <div className="space-y-1.5">
            <Label htmlFor="legale-nota">{etichetta}</Label>
            <Textarea id="legale-nota" rows={2} value={nota} onChange={e => setNota(e.target.value)} placeholder={segnaposto} />
        </div>
    );

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Gavel className="w-5 h-5" /> Passaggio al legale</CardTitle>
                <p className="text-xs text-muted-foreground">
                    Se una rata salta, se il piano è respinto o rifiutato, o se l’inquilino non si trova. Lo chiede il gestore, lo decide la responsabile legale.
                </p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                {pratica.stato === 'al_legale' ? (
                    <div className="space-y-1.5">
                        <p className="font-medium text-foreground">Affidata a {nomeAvvocato(l.avvocatoId)}, avvocato esterno in convenzione, {dalGiorno(l.decisoIl)}</p>
                        <p className="text-muted-foreground">Motivo: {MOTIVI_LEGALE[l.motivo]?.toLowerCase()}. Decisione di {nomeOperatore(l.decisoDa)}{l.notaDecisione ? `: ${l.notaDecisione}` : '.'}</p>
                        <p className="text-xs text-muted-foreground">La vede nella sua area insieme al fascicolo; il piano in corso si ferma.</p>
                    </div>
                ) : l && !l.decisione ? (
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <p className="font-medium text-foreground">Chiesto da {nomeOperatore(l.richiestoDa)} {ilGiorno(l.richiestoIl)}</p>
                            <p className="text-muted-foreground">{MOTIVI_LEGALE[l.motivo]}{l.nota ? ` · ${l.nota}` : ''}</p>
                            {fase && <Termine termine={fase.termine} mancano={fase.mancano} calendario={fase.calendario} prefisso="Da decidere entro" />}
                        </div>
                        {modulo === 'decidi' ? (
                            <div className="space-y-3">
                                {campoNota('Nota della decisione', 'Obbligatoria se la pratica resta al gestore.')}
                                <div className="flex flex-wrap gap-2">
                                    <Button size="sm" className="bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={() => esito(decidiPassaggioLegale(pratica, operatoreId, { decisione: 'passata', nota }), `Pratica affidata a ${nomeAvvocato(AVVOCATO_CONVENZIONATO)}`)}>
                                        Affida all’avvocato
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => esito(decidiPassaggioLegale(pratica, operatoreId, { decisione: 'respinta', nota }), 'La pratica resta al gestore')}>
                                        Resta al gestore
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={chiudi}>Annulla</Button>
                                </div>
                            </div>
                        ) : (
                            <AzioneGaranzia azione="decidi_legale" record={pratica} onEsegui={() => setModulo('decidi')}>Decidi</AzioneGaranzia>
                        )}
                    </div>
                ) : pratica.stato === 'chiusa' ? (
                    <p className="text-muted-foreground">Pratica chiusa: nessun passaggio al legale.</p>
                ) : modulo ? (
                    <div className="space-y-3">
                        {campoMotivo}
                        {campoNota('Nota', modulo === 'chiedi' ? 'Cosa è successo, in una riga.' : 'Perché la affidi all’avvocato.')}
                        <div className="flex flex-wrap gap-2">
                            {modulo === 'chiedi' ? (
                                <Button size="sm" className="bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={() => esito(chiediPassaggioLegale(pratica, operatoreId, { motivo, nota }), 'Richiesta mandata alla responsabile legale')}>
                                    Manda la richiesta
                                </Button>
                            ) : (
                                <Button size="sm" className="bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={() => esito(decidiPassaggioLegale(pratica, operatoreId, { decisione: 'passata', nota, motivo }), `Pratica affidata a ${nomeAvvocato(AVVOCATO_CONVENZIONATO)}`)}>
                                    Affida all’avvocato
                                </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={chiudi}>Annulla</Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-muted-foreground">Nessun passaggio al legale: la pratica è del gestore.</p>
                        {decide ? (
                            <AzioneGaranzia azione="decidi_legale" record={pratica} variant="outline" onEsegui={() => setModulo('passa')}>Affida all’avvocato</AzioneGaranzia>
                        ) : (
                            <AzioneGaranzia azione="chiedi_legale" record={pratica} variant="outline" onEsegui={() => setModulo('chiedi')}>Chiedi il passaggio al legale</AzioneGaranzia>
                        )}
                    </div>
                )}

                {precedenti.length > 0 && (
                    <div className="pt-3 border-t border-border space-y-1.5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Richieste precedenti</p>
                        {precedenti.map(r => (
                            <p key={`${r.richiestoIl}-${r.motivo}`} className="text-xs text-muted-foreground">
                                {fmtData(r.richiestoIl)} · {MOTIVI_LEGALE[r.motivo]} · resta al gestore per decisione di {nomeOperatore(r.decisoDa)} del {fmtData(r.decisoIl)}{r.notaDecisione ? `: ${r.notaDecisione}` : ''}
                            </p>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PassaggioLegale;
