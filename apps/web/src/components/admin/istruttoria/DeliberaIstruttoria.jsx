import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Gavel, CheckCircle2, TrendingDown, Minus, AlertTriangle, Scale } from 'lucide-react';
import AzioneSeparata from '@/components/admin/AzioneSeparata';
import { ESITI, REGOLE_ISTRUTTORIA } from '@/data/istruttoria';
import { NESSUNA_INFORMAZIONE } from '@/data/verifiche';
import { nomeOperatore } from '@/data/operatori';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { verificaAzione } from '@/lib/separazione';
import { delibera, descriviEsito } from '@/lib/istruttoriaDemo';
import { SEMAFORO } from '@/lib/semaforo';
import { fmtData } from '@/lib/formato';
import { Pill, PulsanteFunzione } from '@/components/admin/istruttoria/Elementi';

// ═════════════════════════════════════════════════════════════════════════════
// La delibera (O-07). Il sistema propone, decide una persona: può confermare o
// dissentire, e il dissenso vuole un motivo scritto. Ogni dissenso si conta:
// se l'unico bottone fosse «conferma», la decisione sarebbe automatica comunque
// (art. 22 GDPR, §13.6). Delibera solo chi ha la pratica in coda, e mai chi
// ha acquisito il cliente (§13.4).
// ═════════════════════════════════════════════════════════════════════════════

const ICONA_EFFETTO = {
    favorevole: <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />,
    peggiora: <TrendingDown className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />,
    neutro: <Minus className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />,
};

const CONSEGUENZA = {
    approvata: 'Il proprietario vede la verifica conclusa e passa al pagamento.',
    approvata_franchigia: 'Il proprietario vede la verifica conclusa, con la franchigia più lunga, e passa al pagamento.',
    respinta: 'Il proprietario vede l’esito nella sua pratica.',
    emessa: 'Certificato emesso: l’inquilino lo vede nella sua area.',
    rifiutata: 'Autocandidatura non accolta: l’inquilino lo vede nella sua area.',
    pubblicata: 'Esito pubblicato: il cliente lo vede nella sua area.',
};

const EsitoPill = ({ esito, proposta = false }) => (
    <Pill classe={ESITI[esito]?.classe}>{(proposta && ESITI[esito]?.proposta) || ESITI[esito]?.etichetta || esito}</Pill>
);

const Fattori = ({ fattori }) => (
    <ul className="space-y-1.5">
        {fattori.map(f => (
            <li key={f.testo} className="flex items-start gap-2 text-sm text-foreground">{ICONA_EFFETTO[f.effetto] || ICONA_EFFETTO.neutro}<span>{f.testo}</span></li>
        ))}
    </ul>
);

const EsitoVerifica = ({ esito }) => {
    if (!esito) return null;
    if (esito.tipo === 'nessuna_informazione') return <p className="text-sm text-foreground">Pubblicato: «{NESSUNA_INFORMAZIONE}».</p>;
    return (
        <p className="text-sm text-foreground">
            Pubblicato: <span className="font-medium">{SEMAFORO[esito.semaforo]?.etichetta}</span>. {esito.sintesi}
        </p>
    );
};

const Deliberata = ({ voce }) => {
    const d = voce.delibera;
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <EsitoPill esito={d.esito} />
                {voce.tipo !== 'verifica' && <span className="text-sm text-foreground">{descriviEsito(voce, d.esito)}</span>}
            </div>
            <p className="text-sm text-muted-foreground">
                {d.daAltrove
                    ? `Conclusa il ${fmtData(d.deliberataIl)}, fuori da questa coda: nei mockup può averla chiusa una simulazione dell’area del cliente.`
                    : `${voce.tipo === 'verifica' ? 'Pubblicato' : 'Deliberata'} da ${nomeOperatore(d.deliberataDa)} il ${fmtData(d.deliberataIl)}.`}
            </p>
            {d.proposta && (
                <div className="rounded-lg bg-muted/30 p-3 space-y-2">
                    <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">Il sistema proponeva <EsitoPill esito={d.proposta} proposta /></p>
                    {d.fattori?.length > 0 && <Fattori fattori={d.fattori.map(testo => ({ testo, effetto: 'neutro' }))} />}
                </div>
            )}
            {d.dissenso && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-medium text-amber-900 flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" /> Dissenso motivato</p>
                    <p className="text-sm text-amber-950 mt-1">«{d.motivo}»</p>
                </div>
            )}
            {d.proposta && !d.dissenso && !d.daAltrove && d.conProposta !== false && <p className="text-xs text-muted-foreground">Ha confermato la proposta.</p>}
            {voce.tipo === 'pratica' && voce.raw.istruttoria?.nota && (
                <p className="text-xs text-muted-foreground">Il proprietario legge: «Verifica conclusa il {fmtData(voce.raw.istruttoria.conclusaIl)}: {voce.raw.istruttoria.nota}»</p>
            )}
            {voce.tipo === 'verifica' && <EsitoVerifica esito={voce.raw.esito} />}
            {voce.tipo === 'autocandidatura' && voce.raw.esito && (
                <p className="text-xs text-muted-foreground">
                    Prove forti di tipo diverso: {voce.raw.esito.forti}. Mesi coperti: {voce.raw.esito.copertura}. {voce.raw.esito.raggiunto ? 'Il valore viene dai mesi documentati.' : 'Il certificato dice «storico insufficiente».'}
                </p>
            )}
        </div>
    );
};

const DeliberaIstruttoria = ({ voce }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [dissento, setDissento] = useState(false);
    const [scelta, setScelta] = useState(null);
    const [motivo, setMotivo] = useState('');

    const titolare = voce.assegnazione.operatoreId;
    const mia = titolare === operatoreId;
    const record = { acquisitoDa: voce.acquisitoDa };
    const { consentito } = verificaAzione('delibera_istruttoria', { operatoreId, record });
    const p = voce.proposta;
    const minimo = REGOLE_ISTRUTTORIA.caratteriMinimiMotivo;
    const motivoOk = motivo.trim().length >= minimo;

    const esegui = (esito, conDissenso) => {
        const fatto = delibera({ voce, esito, dissenso: conDissenso, motivo, da: operatoreId });
        if (!fatto) { toast.error('Non è stato possibile deliberare: ricarica la pagina e riprova'); return; }
        toast.success(conDissenso ? `Delibera con dissenso registrata. ${CONSEGUENZA[esito]}` : `Delibera registrata. ${CONSEGUENZA[esito]}`);
        setDissento(false);
        setMotivo('');
        setScelta(null);
    };

    const titolo = voce.tipo === 'verifica' ? 'Esito' : 'Proposta e delibera';

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Gavel className="w-5 h-5" /> {titolo}</CardTitle>
                {voce.tipo !== 'verifica' && voce.fase !== 'deliberata' && (
                    <p className="text-xs text-muted-foreground">Il sistema propone, decide una persona. Si può sempre dissentire, con un motivo scritto: ogni dissenso si conta (art. 22 del GDPR).</p>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {voce.fase === 'deliberata' && voce.delibera ? <Deliberata voce={voce} /> : voce.tipo === 'verifica' ? (
                    <div className="space-y-3">
                        <p className="text-sm text-foreground">
                            Qui non si delibera: l’esito è il semaforo calcolato sulla persona, oppure «{NESSUNA_INFORMAZIONE}», e nessuno lo cambia a mano.
                            Chi pubblica controlla che la richiesta sia completa: nome, cognome, data e luogo di nascita e codice fiscale del candidato.
                        </p>
                        <PulsanteFunzione
                            funzioni={['istruttoria']} azione="Pubblicare l’esito"
                            disabled={!mia} motivoSpento={`La richiesta è nella coda di ${nomeOperatore(titolare)}: la pubblica chi ce l’ha.`}
                            onEsegui={() => esegui('pubblicata', false)}
                        >
                            Pubblica l’esito
                        </PulsanteFunzione>
                    </div>
                ) : !p ? (
                    <p className="text-sm text-muted-foreground">{voce.blocco || 'La proposta arriva quando i documenti sono verificati.'}</p>
                ) : (
                    <>
                        <div className="rounded-lg border border-border p-3 space-y-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs text-muted-foreground">Il sistema propone</span>
                                <EsitoPill esito={p.esito} proposta />
                                <span className="text-sm text-foreground">{descriviEsito(voce, p.esito)}</span>
                            </div>
                            <Fattori fattori={p.fattori} />
                            {voce.tipo === 'pratica' && (
                                <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                                    Come propone: il semaforo del candidato (storico CRIA se c’è, altrimenti i movimenti del canone) dà il punto di partenza;
                                    oltre il {REGOLE_ISTRUTTORIA.sogliaCanoneSuReddito}% del reddito netto si scende di un gradino; la franchigia più lunga aggiunge {REGOLE_ISTRUTTORIA.mesiFranchigiaAggiuntivi} mesi.
                                </p>
                            )}
                        </div>

                        {voce.blocco && (
                            <p className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {voce.blocco}
                            </p>
                        )}

                        {p.alternative.length > 1 ? (
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-start gap-3">
                                    <AzioneSeparata azione="delibera_istruttoria" record={record} disabled={Boolean(voce.blocco) || !mia || dissento} onEsegui={() => esegui(p.esito, false)}>
                                        Confermo la proposta
                                    </AzioneSeparata>
                                    {consentito && (
                                        <Button type="button" size="sm" variant="outline" disabled={Boolean(voce.blocco) || !mia} onClick={() => setDissento(d => !d)}>
                                            {dissento ? 'Torna alla proposta' : 'Dissento'}
                                        </Button>
                                    )}
                                </div>
                                {consentito && !mia && <p className="text-xs text-amber-800">La pratica è nella coda di {nomeOperatore(titolare)}: delibera chi ce l’ha.</p>}

                                {dissento && (
                                    <div className="rounded-lg border border-amber-300 bg-amber-50/60 p-3 space-y-3">
                                        <p className="text-sm font-medium text-amber-950">Dissenti dalla proposta: cosa decidi, e perché?</p>
                                        <div className="space-y-1.5">
                                            {p.alternative.filter(e => e !== p.esito).map(e => (
                                                <label key={e} className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer bg-white ${scelta === e ? 'border-amber-500' : 'border-amber-100'}`}>
                                                    <input type="radio" name={`esito-${voce.chiave}`} className="mt-1 accent-amber-600" checked={scelta === e} onChange={() => setScelta(e)} />
                                                    <span><span className="font-medium">{ESITI[e].proposta || ESITI[e].etichetta}</span><span className="block text-xs text-muted-foreground">{descriviEsito(voce, e)}</span></span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="space-y-1">
                                            <Textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3} className="bg-white text-sm" placeholder="Il motivo del dissenso: cosa non torna nella proposta" />
                                            <p className={`text-xs ${motivoOk ? 'text-muted-foreground' : 'text-amber-800'}`}>
                                                Obbligatorio, almeno {minimo} caratteri ({motivo.trim().length}). Resta nel registro: il proprietario non lo legge.
                                            </p>
                                        </div>
                                        <AzioneSeparata azione="delibera_istruttoria" record={record} disabled={!scelta || !motivoOk || !mia} onEsegui={() => esegui(scelta, true)}>
                                            Delibera con dissenso
                                        </AzioneSeparata>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">
                                    Qui non c’è una scelta da fare: il valore viene dalle prove verificate. Se una prova non è conforme, segnalalo nei documenti e il conteggio cambia.
                                </p>
                                <AzioneSeparata azione="delibera_istruttoria" record={record} disabled={Boolean(voce.blocco) || !mia} onEsegui={() => esegui('emessa', false)}>
                                    Emetti il certificato
                                </AzioneSeparata>
                                {consentito && !mia && <p className="text-xs text-amber-800">L’autocandidatura è nella coda di {nomeOperatore(titolare)}: delibera chi ce l’ha.</p>}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default DeliberaIstruttoria;
