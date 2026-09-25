import React, { useState } from 'react';
import { toast } from 'sonner';
import { FileText, Mail, MessageSquare, Phone, PhoneCall, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OGGI } from '@/data/datiDemo';
import { nomeOperatore } from '@/data/operatori';
import { CANALI_CONTATTO, ESITI_CONTATTO } from '@/data/garanzia';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { registraContatto } from '@/lib/garanziaDemo';
import { fmtData } from '@/lib/formato';
import AzioneGaranzia from './AzioneGaranzia';
import Chip from './Chip';
import { INIZIATIVA, classeSelect } from './stati';

// ═════════════════════════════════════════════════════════════════════════════
// O-15 — I contatti con l'inquilino: data, ora, canale, chi ha cercato chi,
// esito e una nota. Li registra il gestore titolare; il primo andato a segno
// è quello che conta per l'indicatore del riassicuratore.
// ═════════════════════════════════════════════════════════════════════════════

const ICONA_CANALE = { telefono: Phone, sms: MessageSquare, email: Mail, pec: Mail, raccomandata: FileText };

const nuovoContatto = () => ({ il: OGGI, ora: '', canale: 'telefono', iniziativa: 'cria', esito: 'non_risponde', nota: '' });

const RigaContatto = ({ c, primo }) => {
    const Icona = ICONA_CANALE[c.canale] || MessageSquare;
    const esito = ESITI_CONTATTO[c.esito];
    return (
        <li className="flex gap-3 py-3">
            <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <Icona className="w-4 h-4 text-muted-foreground" />
            </span>
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-medium text-foreground tabular-nums">{fmtData(c.il)} · {c.ora}</span>
                    <span className="text-xs text-muted-foreground">{CANALI_CONTATTO[c.canale]} · {INIZIATIVA[c.iniziativa]}</span>
                    <Chip stato={esito} />
                    {primo && <Chip stato={{ classe: 'bg-[#1A2D52] text-white' }}>Primo contatto</Chip>}
                </div>
                {c.nota && <p className="text-sm text-muted-foreground">{c.nota}</p>}
                <p className="text-[11px] text-muted-foreground/80">Registrato da {nomeOperatore(c.registratoDa)}</p>
            </div>
        </li>
    );
};

const ContattiPratica = ({ pratica }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [aperto, setAperto] = useState(false);
    const [dati, setDati] = useState(nuovoContatto);
    const campo = (k) => (e) => setDati(d => ({ ...d, [k]: e.target.value }));
    const chiusa = pratica.stato === 'chiusa';

    const salva = (e) => {
        e.preventDefault();
        const r = registraContatto(pratica, operatoreId, dati);
        if (!r.ok) {
            toast.error(r.motivo);
            return;
        }
        toast.success(ESITI_CONTATTO[dati.esito].raggiunto && !pratica.primoContatto
            ? 'Primo contatto registrato: il contatore si ferma qui'
            : 'Contatto registrato');
        setDati(nuovoContatto());
        setAperto(false);
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><PhoneCall className="w-5 h-5" /> Contatti con l’inquilino</CardTitle>
                <p className="text-xs text-muted-foreground">
                    Conta il primo contatto andato a segno, quando l’inquilino risponde. I tentativi a vuoto restano qui ma non fermano il contatore.
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {pratica.contatti.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {chiusa ? 'Nessun contatto: il canone è arrivato prima.' : 'Nessun contatto ancora. Il primo va fatto entro il termine qui a fianco.'}
                    </p>
                ) : (
                    <ol className="divide-y divide-border">
                        {pratica.contatti.map(c => <RigaContatto key={c.id} c={c} primo={pratica.primoContatto?.id === c.id} />)}
                    </ol>
                )}

                {!chiusa && !aperto && (
                    <AzioneGaranzia azione="registra_contatto" record={pratica} variant="outline" className="gap-2" onEsegui={() => setAperto(true)}>
                        <Plus className="w-4 h-4" /> Registra un contatto
                    </AzioneGaranzia>
                )}

                {aperto && (
                    <form onSubmit={salva} className="rounded-lg border border-border p-4 space-y-4 bg-muted/20">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="ct-il">Data</Label>
                                <Input id="ct-il" type="date" min={pratica.apertaIl} max={OGGI} value={dati.il} onChange={campo('il')} required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="ct-ora">Ora</Label>
                                <Input id="ct-ora" type="time" value={dati.ora} onChange={campo('ora')} required />
                            </div>
                            <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                <Label htmlFor="ct-canale">Canale</Label>
                                <select id="ct-canale" className={classeSelect} value={dati.canale} onChange={campo('canale')}>
                                    {Object.entries(CANALI_CONTATTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                <Label htmlFor="ct-iniziativa">Chi ha cercato chi</Label>
                                <select id="ct-iniziativa" className={classeSelect} value={dati.iniziativa} onChange={campo('iniziativa')}>
                                    {Object.entries(INIZIATIVA).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <Label htmlFor="ct-esito">Esito</Label>
                                <select id="ct-esito" className={classeSelect} value={dati.esito} onChange={campo('esito')}>
                                    {Object.entries(ESITI_CONTATTO).map(([k, v]) => <option key={k} value={k}>{v.etichetta}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="ct-nota">Nota</Label>
                            <Textarea id="ct-nota" rows={2} value={dati.nota} onChange={campo('nota')} placeholder="Cosa ha detto, cosa si è concordato. Niente che non serva alla pratica." />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button type="submit" size="sm" className="bg-[#1A2D52] hover:bg-[#0F1B33]">Salva il contatto</Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => { setAperto(false); setDati(nuovoContatto()); }}>Annulla</Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};

export default ContattiPratica;
