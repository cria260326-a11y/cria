import React, { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import NotaMockup from '@/components/NotaMockup';
import AzioneSeparata from '@/components/admin/AzioneSeparata';
import { Chip, Termine, Voce } from '@/components/admin/anagrafica/ElementiScheda';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { STATO_REGISTRAZIONE, chiediRicevuta, inserisciEstremi, simulaRicevutaCaricata } from '@/lib/anagraficheDemo';
import { CONTRATTI, OGGI } from '@/data/datiDemo';
import { PRATICHE } from '@/data/pratiche';
import { nomeOperatore } from '@/data/operatori';
import { fmtData } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// Gli estremi di registrazione di un contratto (O-05, O-06). Non c'è un
// collegamento con l'Agenzia delle Entrate: un operatore li legge sulla
// ricevuta caricata dal proprietario e li scrive a mano. Poi si confrontano con
// quelli che il proprietario ha dichiarato: due fonti che devono tornare.
// ═════════════════════════════════════════════════════════════════════════════

// Il numero si confronta senza spazi e senza badare alle maiuscole.
const numeroPulito = (v) => String(v || '').replace(/\s+/g, '').toUpperCase();

const CAMPI = [
    { id: 'numero', etichetta: 'numero', norma: numeroPulito },
    { id: 'data', etichetta: 'data', norma: String },
    { id: 'ufficio', etichetta: 'ufficio', norma: String },
];

// Gli uffici che compaiono nei contratti: si sceglie, non si scrive, così un
// refuso non diventa una differenza.
const UFFICI = [...new Set([...CONTRATTI, ...PRATICHE].map(x => x.registrazione?.ufficio).filter(Boolean))].sort();

const FormEstremi = ({ r, onFatto }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [valori, setValori] = useState({ numero: '', data: '', ufficio: '' });
    const [nota, setNota] = useState('');
    const cambia = (campo) => (e) => setValori(v => ({ ...v, [campo]: e.target.value }));

    const completi = valori.numero.trim().length >= 6 && valori.data && valori.ufficio;
    const futura = valori.data > OGGI;
    const diversi = completi ? CAMPI.filter(c => c.norma(valori[c.id]) !== c.norma(r.dichiarati[c.id])) : [];
    const puoSalvare = completi && !futura && (diversi.length === 0 || nota.trim().length >= 10);
    const prefisso = `estremi-${r.contrattoId}`;

    const salva = () => {
        inserisciEstremi(r.contrattoId, {
            estremi: { numero: numeroPulito(valori.numero), data: valori.data, ufficio: valori.ufficio },
            diversi: diversi.map(c => c.id),
            nota: diversi.length ? nota.trim() : null,
        }, operatoreId);
        toast.success(`Estremi salvati, letti dalla ricevuta da ${nomeOperatore(operatoreId)}`);
        onFatto();
    };

    return (
        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-4">
            <p className="text-sm text-muted-foreground">Leggi gli estremi sulla ricevuta e scrivili qui: si confrontano con quelli dichiarati dal proprietario.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor={`${prefisso}-numero`}>Numero di registrazione</Label>
                    <Input id={`${prefisso}-numero`} value={valori.numero} onChange={cambia('numero')} className="font-mono uppercase" autoComplete="off" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor={`${prefisso}-data`}>Data</Label>
                    <Input id={`${prefisso}-data`} type="date" max={OGGI} value={valori.data} onChange={cambia('data')} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor={`${prefisso}-ufficio`}>Ufficio</Label>
                    <select id={`${prefisso}-ufficio`} value={valori.ufficio} onChange={cambia('ufficio')} className="w-full h-9 text-sm border border-input rounded-md px-3 bg-background">
                        <option value="">Scegli…</option>
                        {UFFICI.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>
            {futura && <p className="text-xs text-red-700">La data non può essere dopo oggi.</p>}
            {completi && !futura && (diversi.length === 0 ? (
                <p className="text-xs text-green-800 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Uguali a quelli dichiarati dal proprietario.</p>
            ) : (
                <div className="space-y-2">
                    <p className="text-xs text-amber-800 flex items-start gap-1.5">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        Diverso da quanto dichiarato: {diversi.map(c => c.etichetta).join(', ')}. Scrivi cosa hai visto sulla ricevuta: vale la ricevuta.
                    </p>
                    <Textarea rows={2} value={nota} onChange={e => setNota(e.target.value)} aria-label="Cosa c’è scritto sulla ricevuta" placeholder="Per esempio: sulla ricevuta il numero finisce con …" />
                </div>
            ))}
            <div className="flex flex-wrap items-start gap-2">
                <AzioneSeparata azione="inserisci_estremi" onEsegui={salva} disabled={!puoSalvare}>Salva gli estremi</AzioneSeparata>
                <Button type="button" variant="ghost" size="sm" onClick={onFatto}>Annulla</Button>
            </div>
            <NotaMockup className="py-3">
                <p>La ricevuta di prova riporta gli stessi estremi dichiarati dal proprietario.</p>
                <button type="button" className="underline font-medium mt-1" onClick={() => setValori({ ...r.dichiarati })}>
                    Compila con i dati della ricevuta di prova
                </button>
            </NotaMockup>
        </div>
    );
};

// conStato: false quando stato e termine li mostra già chi contiene il blocco (la coda di O-05).
const RegistrazioneContratto = ({ registrazione: r, conStato = true }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [aperto, setAperto] = useState(false);
    const stato = STATO_REGISTRAZIONE[r.stato];
    // Una richiesta ancora nel termine non si ripete: si aspetta la risposta.
    const inAttesa = r.stato === 'senza_ricevuta' && r.termine && !r.termine.scaduto;

    const chiedi = () => {
        chiediRicevuta(r.contrattoId, operatoreId);
        toast.success(r.ultimaRichiesta ? 'Sollecito mandato al proprietario, nella sua area' : 'Richiesta mandata al proprietario, nella sua area');
    };

    return (
        <div className="space-y-3">
            {conStato && (
                <div className="flex items-center gap-x-3 gap-y-1 flex-wrap">
                    <Chip classe={stato.classe}>{stato.etichetta}</Chip>
                    <Termine termine={r.termine} etichetta={r.stato === 'da_inserire' ? 'Da inserire entro il' : 'Risposta entro il'} />
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <Voce etichetta="Numero"><span className="font-mono text-xs break-all">{r.estremi.numero}</span></Voce>
                <Voce etichetta="Data">{fmtData(r.estremi.data)}</Voce>
                <Voce etichetta="Ufficio">{r.estremi.ufficio}</Voce>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
                <li>
                    {r.inserimento
                        ? `Letti dalla ricevuta da ${nomeOperatore(r.inserimento.da)} il ${fmtData(r.inserimento.il)}.`
                        : 'Dichiarati dal proprietario, non ancora letti su una ricevuta.'}
                    {r.inserimento?.diversi?.length > 0 && ` Diversi da quanto dichiarato: ${r.inserimento.nota}`}
                </li>
                <li>
                    {r.ricevuta
                        ? `Ricevuta: ${r.ricevuta.nome}, caricata dal proprietario il ${fmtData(r.ricevuta.caricataIl)}.`
                        : 'Ricevuta: il proprietario non l’ha ancora caricata.'}
                </li>
                {!r.ricevuta && r.ultimaRichiesta && (
                    <li>
                        Chiesta al proprietario il {fmtData(r.ultimaRichiesta.il)} da {nomeOperatore(r.ultimaRichiesta.da)}
                        {r.richieste.length > 1 ? ` · ${r.richieste.length} richieste in tutto` : ''}.
                    </li>
                )}
                {r.contrattoInVerifica && (
                    <li className="text-amber-800">Anche il contratto registrato, caricato il {fmtData(r.contrattoInVerifica.caricatoIl)}, è ancora in verifica.</li>
                )}
            </ul>

            {r.stato === 'senza_ricevuta' && !inAttesa && (
                <AzioneSeparata azione="chiedi_ricevuta" variant="outline" onEsegui={chiedi}>
                    {r.ultimaRichiesta ? 'Sollecita la ricevuta' : 'Chiedi la ricevuta al proprietario'}
                </AzioneSeparata>
            )}
            {r.stato === 'da_inserire' && !aperto && (
                <AzioneSeparata azione="inserisci_estremi" onEsegui={() => setAperto(true)}>Inserisci gli estremi dalla ricevuta</AzioneSeparata>
            )}
            {r.stato === 'da_inserire' && aperto && <FormEstremi r={r} onFatto={() => setAperto(false)} />}
            {r.stato === 'senza_ricevuta' && (
                <NotaMockup className="py-3">
                    <button type="button" className="underline font-medium" onClick={() => simulaRicevutaCaricata(r.contrattoId)}>
                        Simula: il proprietario carica la ricevuta
                    </button>
                </NotaMockup>
            )}
        </div>
    );
};

export default RegistrazioneContratto;
