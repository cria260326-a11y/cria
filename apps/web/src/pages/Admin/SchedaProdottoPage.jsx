import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Eye, History, Lock, Power } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import EstremiBonifico from '@/components/aree/EstremiBonifico';
import AzioneSeparata from '@/components/admin/AzioneSeparata';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { verificaAzione } from '@/lib/separazione';
import { nomeOperatore } from '@/data/operatori';
import { fmtData } from '@/lib/formato';
import { nomeProdotto } from '@/data/catalogo';
import {
    useProdotti, leggiModulo, moduloDa, creaProdotto, salvaProdotto, cambiaAttivo, prezzoInBreve, nomeCompleto,
    etichettaTipo, perChi, bonificoPronto, causaleCliente, formattaIbanGruppi, modelloDelCiclo,
    TIPI_PRODOTTO, CLIENTI, INCASSO, CAMPI_PREZZO, ETICHETTE_CAMPI, MODULO_NUOVO, PERCORSO_PRODOTTI,
} from '@/lib/prodottiDemo';

// ═════════════════════════════════════════════════════════════════════════════
// SCHEDA DI UN PRODOTTO — O-21, da «Prodotti»
// Una pagina per creare un prodotto (/prodotti/nuovo) e per cambiarlo
// (/prodotti/:codice): che prodotto è, il prezzo, garanzia e canone, e dove il
// cliente fa il bonifico. A destra si vede subito cosa leggerà il cliente.
// Tipo, cliente, garanzia e incasso si scelgono solo alla nascita.
// ═════════════════════════════════════════════════════════════════════════════

const Campo = ({ id, etichetta, obbligatorio, errore, nota, className = '', children }) => (
    <div className={`space-y-1.5 ${className}`}>
        <Label htmlFor={id}>{etichetta}{obbligatorio && <span className="text-red-500"> *</span>}</Label>
        {children}
        {errore ? <p className="text-xs text-red-600">{errore}</p> : nota && <p className="text-xs text-muted-foreground">{nota}</p>}
    </div>
);

// Una scelta fra poche opzioni, a pulsanti: si vede tutto senza aprire niente.
const Scelta = ({ id, opzioni, valore, onScegli, colonne = 'sm:grid-cols-2' }) => (
    <div id={id} role="radiogroup" className={`grid grid-cols-1 ${colonne} gap-2`}>
        {opzioni.map(o => (
            <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={valore === o.id}
                onClick={() => onScegli(o.id)}
                className={`rounded-lg border-2 p-3 text-left text-sm transition-colors ${valore === o.id ? 'border-primary bg-primary/5 font-medium text-foreground' : 'border-border text-muted-foreground hover:border-primary/40'}`}
            >
                {o.etichetta}
                {o.descrizione && <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{o.descrizione}</span>}
            </button>
        ))}
    </div>
);

const Fisso = ({ etichetta, children }) => (
    <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{etichetta}</p>
        <p className="text-sm text-muted-foreground">{children}</p>
    </div>
);

const SI_NO = [
    { id: 'si', etichetta: 'Sì', descrizione: 'Se l’inquilino non paga, CRIA indennizza il proprietario' },
    { id: 'no', etichetta: 'No', descrizione: 'CRIA segnala e costruisce lo storico, senza indennizzo' },
];

// Un esempio di riferimento per l'anteprima: come lo vedrà il cliente.
const esempioRiferimento = (m) => {
    if (m.incassa === 'cria' && m.tipo === 'percentuale_canone') return 'CRIA-7Q4K-2M9P';
    return m.cliente === 'proprietario' ? 'Via Roma 42' : 'Mario Rossi';
};

const mesi = (n) => `${n} ${n === 1 ? 'mese' : 'mesi'}`;

// I tempi del ciclo mensile di un prodotto nuovo: quelli del prodotto che gli somiglia.
const TempiDelCiclo = ({ modello }) => (
    modello ? <p className="text-xs text-muted-foreground">Finestra, solleciti e chiusura del mese sono quelli di {nomeProdotto(modello)}.</p> : null
);

const esempioImporto = (prodotto) => {
    switch (prodotto.tipo) {
        case 'abbonamento_annuo': return prodotto.prezzoAnnuo;
        case 'abbonamento_mensile': return prodotto.prezzoMensile;
        case 'una_tantum': return prodotto.prezzo;
        default: return null; // una percentuale: l'importo dipende dal canone
    }
};

const ModuloProdotto = ({ esistente, registro }) => {
    const navigate = useNavigate();
    const { operatoreId } = useOperatoreAttivo();
    const permesso = verificaAzione('modifica_listino', { operatoreId });
    const nuovo = !esistente;
    const [m, setM] = useState(() => (esistente ? moduloDa(esistente) : MODULO_NUOVO));
    const [errori, setErrori] = useState({});
    const [spegni, setSpegni] = useState(false);

    const cambia = (chiave, valore) => {
        setM(prev => ({ ...prev, [chiave]: valore }));
        if (errori[chiave]) setErrori(prev => ({ ...prev, [chiave]: undefined }));
    };
    const campo = (chiave) => ({ id: chiave, value: m[chiave], onChange: e => cambia(chiave, e.target.value) });

    const { prodotto: anteprima } = leggiModulo(m);
    const delProprietario = m.cliente === 'proprietario';
    const quota = Boolean(esistente?.quota);
    const aCria = m.incassa === 'cria' && m.tipo === 'percentuale_canone';
    const bonificoAnteprima = { ...anteprima.bonifico, iban: anteprima.bonifico.iban || (m.iban.trim() ? formattaIbanGruppi(m.iban) : null) };
    const prezzoCompleto = Boolean(m.tipo) && CAMPI_PREZZO[m.tipo].every(c => c.facoltativo || anteprima[c.chiave] != null);

    const salva = () => {
        const { prodotto, errori: trovati } = leggiModulo(m);
        const aperti = Object.fromEntries(Object.entries(trovati).filter(([, v]) => v));
        setErrori(aperti);
        const primo = Object.keys(aperti)[0];
        if (primo) {
            document.getElementById(primo)?.focus();
            toast.error('Controlla i campi segnati in rosso');
            return;
        }
        if (nuovo) {
            const codice = creaProdotto(prodotto, operatoreId);
            if (!codice) return;
            toast.success(`${nomeCompleto(prodotto)} aggiunto con il codice ${codice}`);
            navigate(PERCORSO_PRODOTTI);
            return;
        }
        const cambiati = salvaProdotto(esistente.codice, prodotto, operatoreId);
        if (cambiati == null) return;
        if (!cambiati.length) {
            toast('Non hai cambiato niente');
            return;
        }
        toast.success(`Salvato: ${cambiati.map(c => ETICHETTE_CAMPI[c]).filter((e, i, a) => a.indexOf(e) === i).join(', ')}`);
        navigate(PERCORSO_PRODOTTI);
    };

    const attiva = (acceso) => {
        if (!cambiaAttivo(esistente.codice, acceso, operatoreId)) return;
        toast.success(acceso ? 'Il prodotto è di nuovo in vendita' : 'Il prodotto non è più in vendita');
        navigate(PERCORSO_PRODOTTI);
    };

    const storia = esistente ? registro.filter(r => r.codice === esistente.codice).slice(0, 8) : [];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="space-y-6 xl:col-span-2 min-w-0">
                {!permesso.consentito && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{permesso.motivo} Puoi guardare la scheda, non cambiarla.</p>
                    </div>
                )}

                <fieldset disabled={!permesso.consentito} className="space-y-6 min-w-0">
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="text-base">Che prodotto è</CardTitle></CardHeader>
                        <CardContent className="space-y-5">
                            {nuovo ? (
                                <>
                                    <Campo id="tipo" etichetta="Tipo di prodotto" obbligatorio errore={errori.tipo}>
                                        <Scelta id="tipo" opzioni={TIPI_PRODOTTO} valore={m.tipo} onScegli={v => cambia('tipo', v)} />
                                    </Campo>
                                    <Campo id="cliente" etichetta="A chi si vende" obbligatorio errore={errori.cliente}>
                                        <Scelta id="cliente" opzioni={CLIENTI} valore={m.cliente} onScegli={v => cambia('cliente', v)} />
                                    </Campo>
                                </>
                            ) : (
                                <Fisso etichetta={quota ? 'Quota di iscrizione' : `${etichettaTipo(m.tipo)} · per ${perChi(m.cliente)}`}>
                                    {quota ? 'Si paga all’avvio di ogni pratica del proprietario.' : 'Il tipo e il cliente si scelgono quando il prodotto nasce.'}
                                </Fisso>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Campo id="nome" etichetta="Nome" obbligatorio errore={errori.nome}>
                                    <Input {...campo('nome')} maxLength={60} placeholder="Es. CRIA Gestione" />
                                </Campo>
                                {!quota && (
                                    <Campo id="variante" etichetta="Variante" errore={errori.variante} nota="Facoltativa. Es. nuovo contratto, contratto esistente">
                                        <Input {...campo('variante')} maxLength={40} />
                                    </Campo>
                                )}
                            </div>
                            <Campo id="sintesi" etichetta="Descrizione per il cliente" obbligatorio errore={errori.sintesi} nota={`Una o due frasi: cosa fa il prodotto. ${m.sintesi.length}/240`}>
                                <Textarea {...campo('sintesi')} rows={3} maxLength={240} />
                            </Campo>
                        </CardContent>
                    </Card>

                    {m.tipo && (
                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="text-base">Prezzo</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {CAMPI_PREZZO[m.tipo].map(c => (
                                        <Campo key={c.chiave} id={c.chiave} etichetta={c.etichetta} obbligatorio={!c.facoltativo} errore={errori[c.chiave]} nota={c.nota}>
                                            <div className="flex items-center gap-2">
                                                <Input {...campo(c.chiave)} inputMode="decimal" className="max-w-[9rem]" />
                                                <span className="text-sm text-muted-foreground">{c.suffisso}</span>
                                            </div>
                                        </Campo>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">Un prezzo cambiato vale per chi paga da adesso: chi ha già pagato tiene il suo.</p>
                            </CardContent>
                        </Card>
                    )}

                    {delProprietario && !quota && m.tipo && (
                        <Card>
                            <CardHeader className="pb-3"><CardTitle className="text-base">Garanzia e canone</CardTitle></CardHeader>
                            <CardContent className="space-y-5">
                                {nuovo ? (
                                    <>
                                        <Campo id="garanzia" etichetta="Garanzia sui canoni non pagati" obbligatorio errore={errori.garanzia}>
                                            <Scelta id="garanzia" opzioni={SI_NO} valore={m.garanzia} onScegli={v => cambia('garanzia', v)} />
                                        </Campo>
                                        {m.garanzia === 'si' && (
                                            <Campo id="franchigiaMesi" etichetta="Franchigia" obbligatorio errore={errori.franchigiaMesi} nota="I primi mesi del contratto, in cui la garanzia non copre ancora">
                                                <div className="flex items-center gap-2">
                                                    <Input {...campo('franchigiaMesi')} inputMode="numeric" className="max-w-[6rem]" />
                                                    <span className="text-sm text-muted-foreground">mesi</span>
                                                </div>
                                            </Campo>
                                        )}
                                        {m.tipo === 'percentuale_canone' && (
                                            <Campo id="incassa" etichetta="Chi incassa il canone" obbligatorio errore={errori.incassa}>
                                                <Scelta id="incassa" opzioni={INCASSO.map(i => ({ ...i, descrizione: i.nota }))} valore={m.incassa} onScegli={v => cambia('incassa', v)} />
                                            </Campo>
                                        )}
                                        {m.garanzia && (m.tipo !== 'percentuale_canone' || m.incassa) && (
                                            <TempiDelCiclo modello={modelloDelCiclo({ incassa: m.tipo === 'percentuale_canone' ? m.incassa : 'proprietario', garanzia: m.garanzia === 'si' })} />
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Fisso etichetta={esistente.garanzia ? `Con garanzia${esistente.franchigiaMesi != null ? ` · franchigia di ${mesi(esistente.franchigiaMesi)}` : ''}` : 'Senza garanzia'}>
                                            {esistente.garanzia ? 'Se l’inquilino non paga, CRIA indennizza il proprietario.' : 'CRIA segnala e costruisce lo storico, senza indennizzo.'}
                                        </Fisso>
                                        {esistente.incassa && (
                                            <Fisso etichetta={esistente.incassa === 'cria' ? 'Il canone lo incassa CRIA' : 'Il canone lo incassa il proprietario'}>
                                                {INCASSO.find(i => i.id === esistente.incassa)?.nota}.
                                            </Fisso>
                                        )}
                                        <TempiDelCiclo modello={esistente.iniziale ? null : modelloDelCiclo(esistente)} />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">{aCria ? 'Dove l’inquilino paga il canone' : 'Dove il cliente fa il bonifico'}</CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {aCria
                                    ? 'L’inquilino lo legge nella sua area, con il codice del suo contratto come causale.'
                                    : 'Il cliente lo legge quando sceglie di pagare con bonifico. Senza IBAN il bonifico non si può scegliere.'}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Campo id="intestatario" etichetta="Intestatario del conto" obbligatorio errore={errori.intestatario}>
                                    <Input {...campo('intestatario')} maxLength={70} />
                                </Campo>
                                <Campo id="iban" etichetta="IBAN" errore={errori.iban} nota="IBAN italiano: IT e 25 caratteri">
                                    <Input {...campo('iban')} className="font-mono uppercase" placeholder="IT60 X054 2811 1010 0000 0123 456" />
                                </Campo>
                                <Campo id="banca" etichetta="Banca" errore={errori.banca} nota="Facoltativa">
                                    <Input {...campo('banca')} maxLength={60} />
                                </Campo>
                                <Campo id="bic" etichetta="BIC / SWIFT" errore={errori.bic} nota="Facoltativo: serve a chi paga dall’estero">
                                    <Input {...campo('bic')} className="font-mono uppercase" maxLength={11} />
                                </Campo>
                            </div>
                            {aCria ? (
                                <Fisso etichetta="Causale">Il codice del contratto, che CRIA dà a ogni contratto: la riconciliazione abbina il bonifico con quello.</Fisso>
                            ) : (
                                <Campo id="causale" etichetta="Causale" obbligatorio errore={errori.causale}
                                    nota={`Il cliente la vede con il suo riferimento accanto (${m.cliente === 'proprietario' ? 'l’indirizzo dell’immobile' : 'il suo nome'}), così il bonifico si abbina.`}>
                                    <Input {...campo('causale')} maxLength={60} />
                                </Campo>
                            )}
                            <Campo id="istruzioni" etichetta="Istruzioni per il cliente" errore={errori.istruzioni} nota="Facoltative. Es. «Il bonifico istantaneo fa partire la pratica prima.»">
                                <Textarea {...campo('istruzioni')} rows={2} maxLength={300} />
                            </Campo>
                        </CardContent>
                    </Card>
                </fieldset>

                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-start gap-2">
                        <AzioneSeparata azione="modifica_listino" size="default" onEsegui={salva}>
                            {nuovo ? 'Crea il prodotto' : 'Salva le modifiche'}
                        </AzioneSeparata>
                        <Button asChild variant="outline"><Link to={PERCORSO_PRODOTTI}>Annulla</Link></Button>
                    </div>
                    {esistente && !quota && permesso.consentito && (
                        esistente.attivo ? (
                            spegni ? (
                                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2 text-sm">
                                    <span className="text-muted-foreground">Da oggi non si vende più. Chi l’ha già comprato lo tiene.</span>
                                    <Button size="sm" variant="destructive" onClick={() => attiva(false)}>Togli dalla vendita</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setSpegni(false)}>No</Button>
                                </div>
                            ) : (
                                <Button variant="ghost" className="gap-2 text-muted-foreground" onClick={() => setSpegni(true)}><Power className="w-4 h-4" /> Togli dalla vendita</Button>
                            )
                        ) : (
                            <Button variant="outline" className="gap-2" onClick={() => attiva(true)}><Power className="w-4 h-4" /> Rimetti in vendita</Button>
                        )
                    )}
                </div>
            </div>

            <div className="space-y-6 xl:sticky xl:top-4 min-w-0">
                <Card>
                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Eye className="w-4 h-4" /> Cosa vede il cliente</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="font-semibold text-foreground">{anteprima.nome ? nomeCompleto(anteprima) : 'Nome del prodotto'}</p>
                            {prezzoCompleto && <p className="text-lg font-bold text-foreground">{prezzoInBreve({ ...anteprima, codice: esistente?.codice })}</p>}
                            {anteprima.sintesi && <p className="text-sm text-muted-foreground mt-1">{anteprima.sintesi}</p>}
                        </div>
                        {bonificoPronto({ bonifico: bonificoAnteprima }) ? (
                            <EstremiBonifico
                                bonifico={bonificoAnteprima}
                                importo={esempioImporto(anteprima)}
                                causale={causaleCliente({ ...anteprima, incassa: aCria ? 'cria' : anteprima.incassa }, esempioRiferimento(m))}
                                titolo={aCria ? 'Fai il bonifico del canone a' : 'Fai il bonifico a'}
                            />
                        ) : (
                            <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">Con intestatario e IBAN, qui vedi gli estremi del bonifico come li legge il cliente.</p>
                        )}
                    </CardContent>
                </Card>

                {storia.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><History className="w-4 h-4" /> Modifiche</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {storia.map((r, i) => (
                                <p key={`${r.il}-${i}`} className="text-sm text-muted-foreground">
                                    <span className="text-foreground">{fmtData(r.il)}</span> · {nomeOperatore(r.da)}{' '}
                                    {r.azione === 'modificato'
                                        ? `ha cambiato ${(r.campi || []).map(c => ETICHETTE_CAMPI[c]).filter((e, j, a) => a.indexOf(e) === j).join(', ')}`
                                        : { creato: 'ha creato il prodotto', disattivato: 'l’ha tolto dalla vendita', riattivato: 'l’ha rimesso in vendita' }[r.azione]}
                                </p>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

const SchedaProdottoPage = () => {
    const { codice } = useParams();
    const { trova, registro } = useProdotti({ admin: true });
    const esistente = codice ? trova(codice) : null;
    const titolo = esistente ? nomeCompleto(esistente) : 'Nuovo prodotto';

    return (
        <>
            <Helmet><title>{`${titolo} - CRIA`}</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    indietro={{ to: PERCORSO_PRODOTTI, label: 'Prodotti' }}
                    titolo={titolo}
                    sottotitolo={esistente
                        ? `${esistente.quota ? 'Quota' : `Codice ${esistente.codice}`} · ${esistente.attivo ? 'in vendita' : 'non più in vendita'}`
                        : 'Scegli il tipo, a chi si vende e il prezzo, poi dove il cliente fa il bonifico.'}
                />
                {codice && !esistente ? (
                    <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Questo prodotto non c’è. <Link to={PERCORSO_PRODOTTI} className="text-primary hover:underline">Torna ai prodotti</Link></CardContent></Card>
                ) : (
                    // Se il prodotto cambia mentre la scheda è aperta (arriva la versione del
                    // database, o l'ha cambiato un altro admin), il modulo riparte da quella:
                    // salvare valori vecchi rimetterebbe indietro le modifiche degli altri.
                    <ModuloProdotto key={esistente ? JSON.stringify(esistente) : 'nuovo'} esistente={esistente} registro={registro} />
                )}
            </div>
        </>
    );
};

export default SchedaProdottoPage;
