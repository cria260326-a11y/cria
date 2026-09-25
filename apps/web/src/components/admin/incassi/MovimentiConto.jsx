import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Landmark, Sparkles, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { OGGI } from '@/data/datiDemo';
import { fmtEuro } from '@/data/catalogo';
import { nomeOperatore } from '@/data/operatori';
import { MOTIVI_NON_ABBINABILE, REGOLE_CICLO } from '@/data/incassi';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { registraMovimento, registraEsito, codiceNellaCausale, incassaCria, mesiAttesi, inCodaDa } from '@/lib/incassiDemo';
import { fmtData, nomeMese } from '@/lib/formato';
import { Pill, PulsanteFunzione } from '@/components/admin/istruttoria/Elementi';
import { contrattiAttuali, trovaContrattoAttuale } from '@/lib/contrattiFonte';

// ═════════════════════════════════════════════════════════════════════════════
// I movimenti del conto di incasso di CRIA (O-12). Si inseriscono a mano: il
// collegamento con la banca non c'è ancora (§16.1). Il sistema cerca il codice
// del contratto nella causale e propone; chi lavora gli incassi conferma, o
// abbina a mano con una nota, o dice perché non si abbina.
// ═════════════════════════════════════════════════════════════════════════════

const AZIONE = 'Lavorare i movimenti del conto';
const INCASSI = ['incassi'];

export const STATI_ABBINAMENTO = {
    da_abbinare: { etichetta: 'Da abbinare', classe: 'bg-amber-100 text-amber-800' },
    abbinato_automatico: { etichetta: 'Proposta confermata', classe: 'bg-green-100 text-green-800' },
    abbinato_manuale: { etichetta: 'Abbinato a mano', classe: 'bg-blue-100 text-blue-800' },
    non_abbinabile: { etichetta: 'Non abbinabile', classe: 'bg-red-100 text-red-800' },
};

// «1.100,50» o «1100.50» → 1100.5
const leggiImporto = (testo) => {
    const t = String(testo || '').replace(/[€\s]/g, '');
    const n = t.includes(',') ? Number(t.replace(/\./g, '').replace(',', '.')) : Number(t);
    // Al centesimo: più di due decimali non è un importo bancario.
    return Number.isFinite(n) && n > 0 && Math.abs(Math.round(n * 100) - n * 100) < 1e-6 ? n : null;
};

export const descriviAbbinamento = (e) => {
    const c = trovaContrattoAttuale(e.contrattoId);
    if (!c) return '—';
    if (e.tipo === 'rata') return `${c.immobile.indirizzo} · rata ${e.rata} del piano di rientro`;
    return `${c.immobile.indirizzo} · canone di ${nomeMese(e.mese).toLowerCase()}`;
};

// Il codice del contratto evidenziato nella causale, quando c'è.
const Causale = ({ testo }) => {
    const codice = codiceNellaCausale(testo);
    const i = codice ? testo.indexOf(codice) : -1;
    if (i < 0) return <span className="font-mono text-xs break-all">{testo}</span>;
    return (
        <span className="font-mono text-xs break-all">
            {testo.slice(0, i)}<mark className="bg-amber-100 text-amber-950 rounded px-0.5">{codice}</mark>{testo.slice(i + codice.length)}
        </span>
    );
};

export const NuovoMovimento = ({ iniziale }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [data, setData] = useState(iniziale?.data || OGGI);
    const [importo, setImporto] = useState(iniziale?.importo || '');
    const [ordinante, setOrdinante] = useState(iniziale?.ordinante || '');
    const [causale, setCausale] = useState(iniziale?.causale || '');
    const valore = leggiImporto(importo);
    const errori = [
        !data || data > OGGI ? 'La data non può essere dopo oggi' : null,
        importo && !valore ? 'Importo non valido: per esempio 1.100,00' : null,
    ].filter(Boolean);
    const pronto = data && data <= OGGI && valore && ordinante.trim() && causale.trim();

    const registra = () => {
        registraMovimento({ data, importo: valore, ordinante, causale }, operatoreId);
        toast.success('Movimento registrato: il sistema propone l’abbinamento qui sotto');
        setImporto(''); setOrdinante(''); setCausale('');
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Landmark className="w-5 h-5" /> Registra un movimento</CardTitle>
                <p className="text-xs text-muted-foreground">Dall’estratto del conto di incasso di CRIA, così come lo scrive la banca. È documentazione contabile: si conserva dieci anni.</p>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="block space-y-1"><span className="text-xs text-muted-foreground">Data di accredito</span>
                        <Input type="date" value={data} max={OGGI} onChange={e => setData(e.target.value)} />
                    </label>
                    <label className="block space-y-1"><span className="text-xs text-muted-foreground">Importo in euro</span>
                        <Input inputMode="decimal" value={importo} onChange={e => setImporto(e.target.value)} placeholder="1.100,00" />
                    </label>
                    <label className="block space-y-1 sm:col-span-2"><span className="text-xs text-muted-foreground">Ordinante</span>
                        <Input value={ordinante} onChange={e => setOrdinante(e.target.value)} placeholder="COGNOME NOME, come nell’estratto" />
                    </label>
                    <label className="block space-y-1 sm:col-span-2"><span className="text-xs text-muted-foreground">Causale</span>
                        <Input value={causale} onChange={e => setCausale(e.target.value)} placeholder="CRIA-XXXX-XXXX CANONE MESE" />
                    </label>
                </div>
                {errori.map(e => <p key={e} className="text-xs text-red-700">{e}</p>)}
                <PulsanteFunzione funzioni={INCASSI} azione={AZIONE} disabled={!pronto} onEsegui={registra}>Registra il movimento</PulsanteFunzione>
            </CardContent>
        </Card>
    );
};

// Abbinamento a mano: solo contratti dove incassa CRIA, sui mesi ancora attesi.
const AMano = ({ mov, movimenti, onFatto }) => {
    const { operatoreId } = useOperatoreAttivo();
    const contratti = contrattiAttuali().filter(incassaCria);
    const iniziale = contratti.find(c => c.id === mov.proposta?.contrattoId) || contratti[0];
    const [contrattoId, setContrattoId] = useState(iniziale.id);
    const attesi = mesiAttesi(contratti.find(c => c.id === contrattoId), movimenti);
    const [mese, setMese] = useState(mov.proposta?.mese || attesi[0]?.mese || '');
    const [nota, setNota] = useState('');
    const meseValido = attesi.some(a => a.mese === mese);
    return (
        <div className="rounded-lg border border-border p-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block space-y-1"><span className="text-xs text-muted-foreground">Contratto</span>
                    <select value={contrattoId} onChange={e => { setContrattoId(e.target.value); setMese(''); }} className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm">
                        {contratti.map(c => <option key={c.id} value={c.id}>{c.immobile.indirizzo} · {c.conduttore.nome}</option>)}
                    </select>
                </label>
                <label className="block space-y-1"><span className="text-xs text-muted-foreground">Canone del mese</span>
                    <select value={meseValido ? mese : ''} onChange={e => setMese(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm">
                        <option value="" disabled>{attesi.length ? 'Scegli il mese' : 'Nessun canone atteso'}</option>
                        {attesi.map(a => <option key={a.mese} value={a.mese}>{nomeMese(a.mese)} · attesi {fmtEuro(a.residuo, 2)}</option>)}
                    </select>
                </label>
            </div>
            <Textarea value={nota} onChange={e => setNota(e.target.value)} rows={2} className="text-sm" placeholder="Perché lo abbini a questo contratto: resta scritto" />
            <div className="flex flex-wrap gap-2">
                <PulsanteFunzione funzioni={INCASSI} azione={AZIONE} disabled={!meseValido || nota.trim().length < 10} motivoSpento="Scegli il mese e scrivi una nota di almeno 10 caratteri."
                    onEsegui={() => { registraEsito(mov.id, { stato: 'abbinato_manuale', tipo: 'canone', contrattoId, mese, nota: nota.trim() }, operatoreId); toast.success('Abbinato a mano'); onFatto(); }}>
                    Abbina
                </PulsanteFunzione>
                <Button size="sm" variant="outline" onClick={onFatto}>Annulla</Button>
            </div>
        </div>
    );
};

const NonAbbinabile = ({ mov, onFatto }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [motivo, setMotivo] = useState(mov.proposta?.suggerimento || 'estraneo');
    const [nota, setNota] = useState('');
    const serveNota = motivo === 'altro';
    return (
        <div className="rounded-lg border border-red-200 bg-red-50/40 p-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {Object.entries(MOTIVI_NON_ABBINABILE).map(([id, testo]) => (
                    <label key={id} className={`flex items-start gap-2 rounded-md border px-2.5 py-2 text-xs cursor-pointer bg-white ${motivo === id ? 'border-red-400' : 'border-red-100'}`}>
                        <input type="radio" name={`motivo-${mov.id}`} className="mt-0.5 accent-red-600" checked={motivo === id} onChange={() => setMotivo(id)} />
                        <span>{testo}</span>
                    </label>
                ))}
            </div>
            <Textarea value={nota} onChange={e => setNota(e.target.value)} rows={2} className="bg-white text-sm" placeholder={serveNota ? 'Spiega il motivo (obbligatorio)' : 'Nota (facoltativa)'} />
            <p className="text-xs text-red-900">Resta fuori dai canoni. La restituzione la dispone la tesoreria, dai bonifici in uscita.</p>
            <div className="flex flex-wrap gap-2">
                <PulsanteFunzione funzioni={INCASSI} azione={AZIONE} disabled={serveNota && !nota.trim()} variant="destructive"
                    onEsegui={() => { registraEsito(mov.id, { stato: 'non_abbinabile', motivo, nota: nota.trim() || null }, operatoreId); toast.success('Segnato come non abbinabile'); onFatto(); }}>
                    Non si abbina
                </PulsanteFunzione>
                <Button size="sm" variant="outline" className="bg-white" onClick={onFatto}>Annulla</Button>
            </div>
        </div>
    );
};

const AFFIDABILITA = {
    alta: { icona: CheckCircle2, classe: 'border-green-200 bg-green-50/60', testo: 'Il sistema non ha dubbi' },
    da_controllare: { icona: AlertTriangle, classe: 'border-amber-200 bg-amber-50/60', testo: 'Proposta da controllare' },
    nessuna: { icona: Info, classe: 'border-border bg-muted/30', testo: 'Nessun abbinamento possibile' },
};

export const MovimentoInCoda = ({ mov, movimenti }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [modo, setModo] = useState(null);
    const [nota, setNota] = useState('');
    const p = mov.proposta;
    const a = AFFIDABILITA[p.affidabilita];
    const Icona = a.icona;
    const giorni = inCodaDa(mov);
    const urgente = giorni >= REGOLE_CICLO.giorniLavorativiAbbinamento;
    const contratto = p.contrattoId && trovaContrattoAttuale(p.contrattoId);
    const abbinabile = contratto && (p.tipo === 'rata' || p.mese);
    const esito = { stato: p.affidabilita === 'alta' ? 'abbinato_automatico' : 'abbinato_manuale', tipo: p.tipo, contrattoId: p.contrattoId, ...(p.tipo === 'rata' ? { morositaId: p.morositaId, rata: p.rata } : { mese: p.mese }) };

    return (
        <div className={`rounded-xl border bg-card p-4 space-y-3 ${urgente ? 'border-amber-300' : 'border-border'}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                    <p className="text-lg font-bold tabular-nums text-foreground">{fmtEuro(mov.importo, 2)}</p>
                    <p className="text-sm text-foreground">{mov.ordinante}</p>
                    <Causale testo={mov.causale} />
                </div>
                <div className="text-right space-y-1">
                    <p className="text-sm text-foreground">Accreditato il {fmtData(mov.data)}</p>
                    <p className="text-xs text-muted-foreground">Registrato da {nomeOperatore(mov.registrato?.da)} il {fmtData(mov.registrato?.il)}</p>
                    <p className={`text-xs ${urgente ? 'text-amber-800 font-medium' : 'text-muted-foreground'}`}>In coda da {giorni} {giorni === 1 ? 'giorno lavorativo' : 'giorni lavorativi'}</p>
                </div>
            </div>

            <div className={`rounded-lg border p-3 space-y-2 ${a.classe}`}>
                <p className="text-sm font-medium text-foreground flex items-center gap-2"><Icona className="w-4 h-4 flex-shrink-0" /> {a.testo}{abbinabile ? `: ${descriviAbbinamento(esito)}` : ''}</p>
                {p.motivi.length > 0 && (
                    <ul className="space-y-1">
                        {p.motivi.map(m => <li key={m.codice + m.testo} className={`text-xs ${m.grave ? 'text-amber-900' : 'text-muted-foreground'}`}>· {m.testo}</li>)}
                    </ul>
                )}
            </div>

            {modo === null && (
                <div className="flex flex-wrap items-start gap-2">
                    {abbinabile && p.affidabilita === 'alta' && (
                        <PulsanteFunzione funzioni={INCASSI} azione={AZIONE} onEsegui={() => { registraEsito(mov.id, esito, operatoreId); toast.success('Abbinamento confermato'); }}>
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Conferma l’abbinamento
                        </PulsanteFunzione>
                    )}
                    {abbinabile && p.affidabilita === 'da_controllare' && (
                        <PulsanteFunzione funzioni={INCASSI} azione={AZIONE} onEsegui={() => setModo('cosi')}>Abbina come propone</PulsanteFunzione>
                    )}
                    <PulsanteFunzione funzioni={INCASSI} azione={AZIONE} variant="outline" onEsegui={() => setModo('mano')}>Abbina a un altro</PulsanteFunzione>
                    <PulsanteFunzione funzioni={INCASSI} azione={AZIONE} variant="outline" onEsegui={() => setModo('no')}>Non si abbina</PulsanteFunzione>
                </div>
            )}
            {modo === 'cosi' && (
                <div className="rounded-lg border border-border p-3 space-y-2">
                    <p className="text-sm text-foreground">Il sistema ha dei dubbi: scrivi perché l’abbinamento è giusto.</p>
                    <Textarea value={nota} onChange={e => setNota(e.target.value)} rows={2} className="text-sm" placeholder="Per esempio: l’inquilino ha confermato per telefono che è l’anticipo di ottobre" />
                    <div className="flex flex-wrap gap-2">
                        <PulsanteFunzione funzioni={INCASSI} azione={AZIONE} disabled={nota.trim().length < 10} motivoSpento="Almeno 10 caratteri."
                            onEsegui={() => { registraEsito(mov.id, { ...esito, stato: 'abbinato_manuale', nota: nota.trim() }, operatoreId); toast.success('Abbinato, con la nota'); setModo(null); }}>
                            Abbina
                        </PulsanteFunzione>
                        <Button size="sm" variant="outline" onClick={() => setModo(null)}>Annulla</Button>
                    </div>
                </div>
            )}
            {modo === 'mano' && <AMano mov={mov} movimenti={movimenti} onFatto={() => setModo(null)} />}
            {modo === 'no' && <NonAbbinabile mov={mov} onFatto={() => setModo(null)} />}
        </div>
    );
};

export const MovimentoChiuso = ({ mov }) => {
    const e = mov.esito;
    const stato = STATI_ABBINAMENTO[e.stato];
    return (
        <div className="rounded-lg border border-border p-3 space-y-1.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-sm font-semibold tabular-nums text-foreground">{fmtEuro(mov.importo, 2)} · {fmtData(mov.data)}</p>
                    <p className="text-xs text-foreground">{mov.ordinante}</p>
                    <Causale testo={mov.causale} />
                </div>
                <Pill classe={stato.classe}>{stato.etichetta}</Pill>
            </div>
            <p className="text-xs text-foreground">
                {e.stato === 'non_abbinabile' ? MOTIVI_NON_ABBINABILE[e.motivo] || e.motivo : descriviAbbinamento(e)}
            </p>
            {e.nota && <p className="text-xs text-muted-foreground">«{e.nota}»</p>}
            <p className="text-xs text-muted-foreground">{e.stato === 'abbinato_automatico' ? 'Proposta del sistema confermata da' : 'Deciso da'} {nomeOperatore(e.da)} il {fmtData(e.il)}</p>
        </div>
    );
};
