import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Send, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { useTutteLePratiche } from '@/lib/praticheDemo';
import { inviaEmail, puoScrivere, motivoSoloAggregati } from '@/lib/comunicazioniDemo';
import { MODELLI_EMAIL, componiManuale, destinatariLiberi, documentiDaIntegrare, proprietariConNumeroFisso } from '@/data/comunicazioni';
import { FUNZIONI, nomeOperatore } from '@/data/operatori';

// ═════════════════════════════════════════════════════════════════════════════
// O-23 — l'invio dalla sezione. Si parte da un modello e da un fatto dei dati —
// una pratica con documenti mancanti, un documento da integrare, un numero
// fisso che non riceve gli SMS — e il testo si compone da solo. Solo il
// messaggio dell'assistenza si scrive a mano. L'invio resta nel registro con
// il nome di chi l'ha mandato.
// ═════════════════════════════════════════════════════════════════════════════

const selettore = 'w-full text-sm border border-border rounded-lg px-3 py-2 bg-background disabled:opacity-60';

const Passo = ({ n, titolo, children }) => (
    <div className="space-y-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs text-primary">{n}</span>
            {titolo}
        </p>
        {children}
    </div>
);

const contestiDelModello = (modello, pratiche) => {
    switch (modello) {
        case 'promemoria_documenti':
            return pratiche
                .filter(p => p.stato === 'documenti' && p.candidato?.email && p.candidato.documenti.some(d => d.stato !== 'caricato'))
                .map(p => {
                    const mancanti = p.candidato.documenti.filter(d => d.stato !== 'caricato').map(d => d.etichetta);
                    return {
                        id: p.id,
                        etichetta: `${p.immobile.indirizzo} · ${p.candidato.nome} · mancano ${mancanti.length}`,
                        destinatario: { nome: p.candidato.nome, email: p.candidato.email, telefono: p.candidato.cellulare, ruolo: 'Candidato inquilino' },
                        mancanti,
                        immobile: p.immobile.indirizzo,
                        contesto: `${p.immobile.indirizzo} · pratica`,
                    };
                });
        case 'documento_da_integrare':
            return documentiDaIntegrare().map(d => ({
                id: d.id,
                etichetta: `${d.immobile || 'Documento personale'} · ${d.documento} · ${d.destinatario.nome}`,
                destinatario: d.destinatario,
                documento: d.documento,
                immobile: d.immobile,
                contesto: `${d.immobile || d.destinatario.nome} · documento`,
            }));
        case 'numero_cellulare':
            return proprietariConNumeroFisso().map(d => ({ id: d.email, etichetta: `${d.nome} · ${d.telefono}`, destinatario: d, contesto: 'Numero per i solleciti' }));
        case 'messaggio_assistenza':
            return destinatariLiberi().map(d => ({ id: d.email, etichetta: `${d.nome} · ${d.ruolo}`, destinatario: d, contesto: 'Messaggio dell’assistenza' }));
        default:
            return [];
    }
};

const InviaEmail = () => {
    const { operatore, operatoreId } = useOperatoreAttivo();
    const pratiche = useTutteLePratiche();
    const [modello, setModello] = useState('');
    const [scelta, setScelta] = useState('');
    const [oggetto, setOggetto] = useState('');
    const [testo, setTesto] = useState('');

    const puo = puoScrivere(operatore);
    const manuali = Object.entries(MODELLI_EMAIL).filter(([, m]) => m.manuale);
    const contesti = useMemo(() => contestiDelModello(modello, pratiche), [modello, pratiche]);
    const ctx = contesti.find(c => c.id === scelta) || null;
    const libero = modello === 'messaggio_assistenza';
    const composta = ctx && !libero ? componiManuale(modello, ctx) : null;
    const oggettoFinale = libero ? oggetto : composta?.oggetto || '';
    const testoFinale = libero ? testo : composta?.testo || '';
    const pronta = Boolean(ctx && oggettoFinale.trim() && testoFinale.trim());

    const scegliModello = (m) => { setModello(m); setScelta(''); setOggetto(''); setTesto(''); };
    const scegliContesto = (id) => {
        setScelta(id);
        const c = contesti.find(x => x.id === id);
        if (libero && c && !testo.trim()) setTesto(`Buongiorno ${c.destinatario.nome},\n\n`);
    };

    const invia = () => {
        const r = inviaEmail({ modello, destinatario: ctx.destinatario, oggetto: oggettoFinale, testo: testoFinale, contesto: ctx.contesto }, operatoreId);
        if (!r.ok) { toast.error(r.errore); return; }
        toast.success(`Email in coda per ${ctx.destinatario.nome}: la trovi nel registro`);
        setScelta(''); setOggetto(''); setTesto('');
    };

    return (
        <Card>
            <CardContent className="pt-5 space-y-6">
                {!puo && (
                    <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" /> {motivoSoloAggregati(operatore)}
                    </p>
                )}

                <Passo n={1} titolo="Il modello">
                    <select aria-label="Modello" value={modello} onChange={e => scegliModello(e.target.value)} className={selettore} disabled={!puo}>
                        <option value="">Scegli un modello</option>
                        {manuali.map(([id, m]) => <option key={id} value={id}>{m.nome}</option>)}
                    </select>
                    {modello && <p className="text-xs text-muted-foreground">A: {MODELLI_EMAIL[modello].a}. {MODELLI_EMAIL[modello].quando}.</p>}
                </Passo>

                {modello && (
                    <Passo n={2} titolo={libero ? 'A chi' : 'Per cosa'}>
                        {contesti.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Oggi non c’è niente per cui mandare questo modello.</p>
                        ) : (
                            <select aria-label={libero ? 'Destinatario' : 'Contesto'} value={scelta} onChange={e => scegliContesto(e.target.value)} className={selettore} disabled={!puo}>
                                <option value="">Scegli</option>
                                {contesti.map(c => <option key={c.id} value={c.id}>{c.etichetta}</option>)}
                            </select>
                        )}
                    </Passo>
                )}

                {ctx && (
                    <Passo n={3} titolo="Cosa parte">
                        <p className="text-sm text-muted-foreground break-words">A {ctx.destinatario.nome}, {ctx.destinatario.email}</p>
                        {libero ? (
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="oggetto-email">Oggetto</Label>
                                    <Input id="oggetto-email" value={oggetto} onChange={e => setOggetto(e.target.value)} maxLength={120} disabled={!puo} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="testo-email">Testo</Label>
                                    <Textarea id="testo-email" rows={6} value={testo} onChange={e => setTesto(e.target.value)} disabled={!puo} />
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                                <p className="text-sm font-semibold text-foreground">{oggettoFinale}</p>
                                <p className="text-sm text-foreground whitespace-pre-line">{testoFinale}</p>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Parte con Postmark a nome di CRIA e resta nel registro con il nome di chi la manda: {nomeOperatore(operatoreId)}, {FUNZIONI[operatore.funzione].etichetta.toLowerCase()}.
                        </p>
                        <Button type="button" onClick={invia} disabled={!puo || !pronta} className="gap-2">
                            <Send className="w-4 h-4" /> Manda l’email
                        </Button>
                    </Passo>
                )}
            </CardContent>
        </Card>
    );
};

export default InviaEmail;
