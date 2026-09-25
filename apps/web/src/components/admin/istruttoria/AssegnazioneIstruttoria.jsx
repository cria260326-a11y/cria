import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Route, Ban, Handshake } from 'lucide-react';
import NotaMockup from '@/components/NotaMockup';
import { OGGI } from '@/data/datiDemo';
import { nomeOperatore, operatoriConFunzione } from '@/data/operatori';
import { LINGUE, SQUADRA_ISTRUTTORIA } from '@/data/istruttoria';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { forzaAssegnazione, annullaForzatura, simulaLingua } from '@/lib/istruttoriaDemo';
import { fmtData } from '@/lib/formato';
import { Pill, PulsanteFunzione } from '@/components/admin/istruttoria/Elementi';

// ═════════════════════════════════════════════════════════════════════════════
// Chi segue la voce, e perché (O-07). L'assegnazione è automatica, con i
// quattro criteri nell'ordine del documento (§13.6); il responsabile può
// forzarla, con un motivo che resta scritto. Non si può mai assegnare a chi ha
// acquisito il cliente: non potrebbe deliberare.
// ═════════════════════════════════════════════════════════════════════════════

const assenteOggi = (id) => (SQUADRA_ISTRUTTORIA[id]?.assenze || []).some(a => OGGI >= a.dal && OGGI <= a.al);

const Riassegna = ({ voce, onFatto }) => {
    const { operatoreId } = useOperatoreAttivo();
    const attuale = voce.assegnazione.operatoreId;
    const opzioni = operatoriConFunzione('istruttoria').map(o => ({
        id: o.id,
        spento: o.id === attuale ? 'ce l’ha già' : voce.acquisitoDa === o.id ? 'ha acquisito il cliente: non potrebbe deliberare' : assenteOggi(o.id) ? 'assente oggi' : null,
    }));
    const [scelto, setScelto] = useState(opzioni.find(o => !o.spento)?.id || '');
    const [motivo, setMotivo] = useState('');
    const conferma = () => {
        forzaAssegnazione({ chiave: voce.chiave, operatoreId: scelto, motivo, da: operatoreId });
        toast.success(`Assegnata a ${nomeOperatore(scelto)}`);
        onFatto();
    };
    return (
        <div className="rounded-lg border border-border p-3 space-y-3">
            <div className="space-y-1.5">
                {opzioni.map(o => (
                    <label key={o.id} className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${o.spento ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${scelto === o.id ? 'border-primary' : 'border-border'}`}>
                        <input type="radio" name={`riassegna-${voce.chiave}`} className="mt-1" disabled={Boolean(o.spento)} checked={scelto === o.id} onChange={() => setScelto(o.id)} />
                        <span>{nomeOperatore(o.id)}{o.spento && <span className="block text-xs text-muted-foreground">{o.spento}</span>}</span>
                    </label>
                ))}
            </div>
            <Textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={2} className="text-sm" placeholder="Perché la sposti: resta scritto" />
            <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={!scelto || motivo.trim().length < 5} onClick={conferma}>Assegna</Button>
                <Button size="sm" variant="outline" onClick={onFatto}>Annulla</Button>
            </div>
        </div>
    );
};

const AssegnazioneIstruttoria = ({ voce, lingue }) => {
    const [cambio, setCambio] = useState(false);
    const a = voce.assegnazione;
    const aperta = voce.fase !== 'deliberata';
    const linguaAttuale = lingue?.[voce.clienteId] || 'italiano';

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Route className="w-5 h-5" /> Chi la segue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{a.operatoreId ? nomeOperatore(a.operatoreId) : 'Nessuno: tocca al responsabile'}</span>
                    {a.forzata ? <Pill classe="bg-amber-100 text-amber-800">assegnata a mano</Pill>
                        : a.storica ? <Pill>{voce.tipo === 'verifica' ? 'ha pubblicato l’esito' : 'ha deliberato'}</Pill>
                            : <Pill classe="bg-blue-50 text-blue-800">automatica</Pill>}
                </div>
                {a.forzata && (
                    <p className="text-xs text-muted-foreground">
                        Spostata da {nomeOperatore(a.forzata.da)} il {fmtData(a.forzata.il)}: «{a.forzata.motivo}». Il motore l’avrebbe data a {nomeOperatore(a.auto.operatoreId)}.
                    </p>
                )}

                {a.auto.passi.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">{a.forzata || a.storica ? 'Come l’aveva assegnata il motore' : 'Come l’ha assegnata il motore'}, criterio per criterio</p>
                        <ol className="space-y-1.5">
                            {a.auto.passi.map((pa, i) => (
                                <li key={pa.criterio} className="flex items-start gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                    <span className="min-w-0">
                                        <span className="text-foreground">{pa.criterio}</span>
                                        <span className="text-muted-foreground"> · {pa.dato}</span>
                                        <span className="block text-xs text-muted-foreground">{pa.nota}</span>
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {a.auto.esclusi.map(e => (
                    <p key={e.id} className="flex items-start gap-2 text-xs text-muted-foreground"><Ban className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> Escluso {nomeOperatore(e.id)}: {e.motivo}.</p>
                ))}
                {voce.acquisizione?.nota && (
                    <p className="flex items-start gap-2 text-xs text-muted-foreground"><Handshake className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {voce.acquisizione.nota}.</p>
                )}
                <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    Il motore non legge origine, cittadinanza o nome della persona: solo la lingua che il cliente ha dichiarato, l’immobile, il carico e la complessità.
                </p>

                {aperta && (
                    <div className="space-y-2">
                        {cambio ? <Riassegna voce={voce} onFatto={() => setCambio(false)} /> : (
                            <div className="flex flex-wrap items-start gap-2">
                                <PulsanteFunzione funzioni={['responsabile_operativo']} azione="Riassegnare una pratica" variant="outline" onEsegui={() => setCambio(true)}>
                                    Riassegna
                                </PulsanteFunzione>
                                {a.forzata && (
                                    <PulsanteFunzione funzioni={['responsabile_operativo']} azione="Riassegnare una pratica" variant="ghost" onEsegui={() => { annullaForzatura(voce.chiave); toast.success('Torna all’assegnazione automatica'); }}>
                                        Torna all’automatica
                                    </PulsanteFunzione>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {aperta && (
                    <NotaMockup>
                        <p className="mb-2">La lingua la dichiara {voce.cliente} nelle sue preferenze. Simula che abbia scelto:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {LINGUE.map(l => (
                                <Button key={l} size="sm" variant={l === linguaAttuale ? 'default' : 'outline'} className={`h-7 px-2.5 ${l === linguaAttuale ? '' : 'bg-white'}`} onClick={() => simulaLingua(voce.clienteId, l)}>
                                    {l}
                                </Button>
                            ))}
                        </div>
                    </NotaMockup>
                )}
            </CardContent>
        </Card>
    );
};

export default AssegnazioneIstruttoria;
