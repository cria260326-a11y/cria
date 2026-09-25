import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronDown, Copy, KeyRound, MessageSquareText, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AzioneSeparata from '@/components/admin/AzioneSeparata';
import RiepilogoUtente from '@/components/admin/anagrafica/RiepilogoUtente';
import { Chip, Termine } from '@/components/admin/anagrafica/ElementiScheda';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { verificaAzione } from '@/lib/separazione';
import {
    chiUsa, confermaUtente, respingiUtente, generaPasswordProvvisoria, inviaPasswordPerSms, nomeDaAnagrafica,
    percorsoSoggetto, RUOLI_UTENTE, TERMINI_ANAGRAFICA,
} from '@/lib/anagraficheDemo';
import { calcolaTermine, mancanoAlTermine } from '@/lib/calendario';
import { OGGI } from '@/data/datiDemo';
import { nomeOperatore } from '@/data/operatori';
import { fmtData } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// UTENTI DA CONFERMARE — in cima a «Soggetti e utenti» (O-02)
// Un utente creato da CRIA lo prepara un operatore e lo conferma un
// responsabile diverso, che rilegge il riepilogo. Alla conferma nasce
// l'account: la password provvisoria si mostra una volta sola a chi conferma,
// e non si conserva da nessuna parte. In piattaforma la crea una funzione del
// server chiamabile solo dall'admin; qui è simulato.
// ═════════════════════════════════════════════════════════════════════════════

const ETICHETTE_CAMPO = { email: 'l’email', telefono: 'il cellulare', codiceFiscale: 'il codice fiscale' };

const termineConferma = (p) => {
    const t = TERMINI_ANAGRAFICA.lavoroInterno;
    const scade = calcolaTermine({ decorrenza: p.preparatoIl, giorni: t.giorni, calendario: t.calendario });
    return { scade, calendario: t.calendario, mancano: mancanoAlTermine(OGGI, scade, t.calendario) };
};

// Chi conferma vede la password una volta sola: la copia o la manda per SMS, poi sparisce.
const PasswordProvvisoria = ({ creato, onSms, onChiudi }) => {
    const copia = () => {
        if (!navigator.clipboard) {
            toast.error('Copia non riuscita: scrivila a mano');
            return;
        }
        navigator.clipboard.writeText(creato.password)
            .then(() => toast.success('Password copiata'))
            .catch(() => toast.error('Copia non riuscita: scrivila a mano'));
    };
    return (
        <Card className="border-green-300 bg-green-50/60">
            <CardContent className="pt-5 pb-5 space-y-3">
                <p className="text-sm font-medium text-green-950">
                    Utente creato: <Link to={percorsoSoggetto(creato.soggettoId)} className="underline">{creato.nome}</Link>
                </p>
                <div className="space-y-2">
                    <p className="text-xs text-green-950">Password provvisoria, da dare alla persona:</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <code className="font-mono text-lg tracking-wider px-3 py-1.5 rounded-lg bg-white border border-green-200 text-foreground select-all">{creato.password}</code>
                        <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={copia}><Copy className="w-4 h-4" /> Copia</Button>
                        <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={onSms} disabled={creato.smsInviato}>
                            <MessageSquareText className="w-4 h-4" /> {creato.smsInviato ? 'SMS mandato' : `Invia per SMS al ${creato.telefono}`}
                        </Button>
                    </div>
                </div>
                <p className="text-xs text-green-950/80">
                    Si mostra una volta sola: chiuso questo riquadro, nemmeno CRIA la vede più. Al primo accesso la persona la cambia e conferma email e cellulare; poi l’identità si verifica come per chi si registra.
                </p>
                <Button type="button" size="sm" onClick={onChiudi}>Ho finito</Button>
            </CardContent>
        </Card>
    );
};

const Preparazione = ({ p, modello, aperta, onApri, onConfermato }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [respingi, setRespingi] = useState(false);
    const [motivo, setMotivo] = useState('');
    const record = { preparatoDa: p.preparatoDa };
    const { consentito } = verificaAzione('conferma_utente', { operatoreId, record });
    const nome = nomeDaAnagrafica(p.anagrafica);

    const conferma = () => {
        // Da quando è stato preparato, email, cellulare o codice fiscale potrebbero essere andati a qualcun altro.
        const conflitti = [
            ['email', p.credenziali.email],
            ['telefono', p.credenziali.telefono],
            ['codiceFiscale', p.anagrafica.codiceFiscale],
        ].map(([campo, valore]) => {
            const uso = chiUsa(modello, campo, valore, { tranne: p.id });
            const daArchiviare = uso?.tipo === 'soggetto' && p.daAnagrafiche.includes(uso.soggetto.id);
            return uso && !daArchiviare ? `${ETICHETTE_CAMPO[campo]} è di ${uso.nome}` : null;
        }).filter(Boolean);
        if (conflitti.length) {
            toast.error(`Non si può confermare: ${conflitti.join('; ')}. Respingila con il motivo.`);
            return;
        }
        const password = generaPasswordProvvisoria();
        confermaUtente(p.id, operatoreId);
        onConfermato({ soggettoId: p.soggettoId, nome, telefono: p.credenziali.telefono, password, smsInviato: false });
    };
    const invia = () => {
        respingiUtente(p.id, motivo.trim(), operatoreId);
        toast.success('Preparazione respinta: chi l’ha preparata la vede con il motivo');
    };

    return (
        <li>
            <button type="button" onClick={onApri} aria-expanded={aperta} className="w-full flex items-center gap-3 px-4 sm:px-6 py-3 text-left hover:bg-muted/30">
                <span className="flex-1 min-w-0 space-y-1">
                    <span className="block font-medium text-foreground">{nome}</span>
                    <span className="block text-xs text-muted-foreground break-all">{p.credenziali.email} · {p.credenziali.telefono}</span>
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {p.ruoli.map(r => <Chip key={r} classe="bg-muted text-foreground">{RUOLI_UTENTE[r]?.etichetta || r}</Chip>)}
                        {p.coppiaId && <Chip classe="bg-amber-100 text-amber-800">Rifà due anagrafiche</Chip>}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                        Preparato da {nomeOperatore(p.preparatoDa)} il {fmtData(p.preparatoIl)} · <Termine termine={termineConferma(p)} etichetta="da confermare entro il" />
                    </span>
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${aperta ? 'rotate-180' : ''}`} />
            </button>
            {aperta && (
                <div className="px-4 sm:px-6 pb-5 pt-1 space-y-4">
                    <RiepilogoUtente p={p} modello={modello} />
                    {!respingi ? (
                        <div className="flex flex-wrap items-start gap-3">
                            <AzioneSeparata azione="conferma_utente" record={record} onEsegui={conferma}>Conferma e crea l’utente</AzioneSeparata>
                            <Button type="button" size="sm" variant="outline" disabled={!consentito} onClick={() => setRespingi(true)}>Respingi</Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor={`respingi-${p.id}`}>Perché la respingi</Label>
                            <Textarea id={`respingi-${p.id}`} rows={2} value={motivo} onChange={e => setMotivo(e.target.value)} />
                            <div className="flex flex-wrap items-start gap-2">
                                <AzioneSeparata azione="conferma_utente" record={record} onEsegui={invia} disabled={motivo.trim().length < 5}>Respingi la preparazione</AzioneSeparata>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setRespingi(false)}>Annulla</Button>
                            </div>
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Chi prepara l’utente non lo conferma. Alla conferma nasce l’account e le anagrafiche vecchie si archiviano: rileggi tutto prima.
                    </p>
                </div>
            )}
        </li>
    );
};

const UtentiDaConfermare = ({ modello }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [aperta, setAperta] = useState(null);
    const [creato, setCreato] = useState(null);
    const pendenti = modello.preparazioni.filter(p => p.stato === 'da_confermare');
    // Una respinta già ripresa e corretta non serve più in elenco.
    const respinte = modello.preparazioni.filter(p => p.stato === 'respinta' && !modello.preparazioni.some(q => q.ripresaDa === p.id));
    if (!pendenti.length && !respinte.length && !creato) return null;

    const sms = () => {
        inviaPasswordPerSms(creato.soggettoId, creato.telefono, operatoreId);
        setCreato(c => ({ ...c, smsInviato: true }));
        toast.success(`SMS con la password provvisoria mandato al ${creato.telefono} (simulato)`);
    };

    return (
        <section className="space-y-3">
            {creato && <PasswordProvvisoria creato={creato} onSms={sms} onChiudi={() => setCreato(null)} />}
            {pendenti.length > 0 && (
                <Card className="border-blue-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base"><UserPlus className="w-5 h-5" /> Utenti da confermare ({pendenti.length})</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Preparati da un operatore, aspettano un responsabile diverso: rileggi il riepilogo e conferma o respingi con il motivo.
                        </p>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ul className="divide-y divide-border border-t border-border">
                            {pendenti.map(p => (
                                <Preparazione
                                    key={p.id}
                                    p={p}
                                    modello={modello}
                                    aperta={aperta === p.id}
                                    onApri={() => setAperta(a => (a === p.id ? null : p.id))}
                                    onConfermato={(c) => { setAperta(null); setCreato(c); }}
                                />
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
            {respinte.length > 0 && (
                <details className="rounded-xl border border-border bg-card px-4 sm:px-6 py-3">
                    <summary className="text-sm font-medium text-foreground cursor-pointer flex items-center gap-2"><KeyRound className="w-4 h-4" /> Preparazioni respinte ({respinte.length})</summary>
                    <ul className="mt-3 space-y-3">
                        {respinte.map(p => (
                            <li key={p.id} className="text-sm space-y-0.5">
                                <p className="font-medium text-foreground">{nomeDaAnagrafica(p.anagrafica)}</p>
                                <p className="text-xs text-muted-foreground">
                                    Preparata da {nomeOperatore(p.preparatoDa)} il {fmtData(p.preparatoIl)} · respinta da {nomeOperatore(p.esito.da)} il {fmtData(p.esito.il)}: {p.esito.motivo}
                                </p>
                                <Link to={`/dashboard/admin/clienti/nuovo?riprendi=${p.id}`} className="text-xs font-medium text-primary hover:underline">Riprendila e correggila →</Link>
                            </li>
                        ))}
                    </ul>
                </details>
            )}
        </section>
    );
};

export default UtentiDaConfermare;
