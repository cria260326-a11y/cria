import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
    Home, KeyRound, Building2, FileText, History, Link2, Lock, GitMerge, UserRound, ArrowRight, AlertTriangle, BadgeCheck, Archive, UserPlus, Pencil,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge.jsx';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import NotaMockup from '@/components/NotaMockup';
import AzioneSeparata from '@/components/admin/AzioneSeparata';
import SegnalaDoppione from '@/components/admin/anagrafica/SegnalaDoppione';
import ModificaAnagrafica from '@/components/admin/anagrafica/ModificaAnagrafica';
import { useModifiche, usePersone, ETICHETTE_CAMPI } from '@/lib/personeFonte';
import { Chip, Voce, VistaRistretta } from '@/components/admin/anagrafica/ElementiScheda';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { verificaDocumento } from '@/lib/documentiFonte';
import {
    useAnagrafica, livelloAnagrafica, coppieAperteDi, invitaSoggetto, ripristinaAnagraficaDemo, simulaAttivazione, simulaIdentitaVerificata,
    percorsoSoggetto, percorsoImmobile, isCodiceProvvisorio,
    STATO_ACCOUNT, STATO_COPPIA, VERSO, CANALI, CANALI_CONTATTO, FONTI_CODICE, MOTIVI_DISTINTI, REGOLE_DOPPIONI, RUOLI_UTENTE, VOCI_STORICO, PERCORSI,
} from '@/lib/anagraficheDemo';
import { trovaContratto } from '@/data/datiDemo';
import { FASI_PRATICA } from '@/data/pratiche';
import { PARAMETRI, nomeProdotto, COLORE_PRODOTTO } from '@/data/catalogo';
import { STATI_AUTOCANDIDATURA, STATI_REFERENZA } from '@/data/autocandidature';
import { nomeOperatore } from '@/data/operatori';
import { statoCertificato } from '@/lib/certificatiDemo';
import { SEMAFORO } from '@/lib/semaforo';
import { STATO_DOCUMENTO, etichettaStatoContestazione, classeStatoContestazione } from '@/lib/etichette';
import { fmtData, nomeMese } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// SCHEDA SOGGETTO — O-03
// Una persona o una società: le sue posizioni sui contratti, le due
// reputazioni che non si mescolano (§13.3), i legami con pratiche e verifiche,
// i documenti con chi li ha consegnati e per quanto restano (§14.5), e la
// storia dell'anagrafica con chi ha fatto cosa e quando. Un utente creato da
// CRIA dice da dove viene; un'anagrafica archiviata rimanda a chi la sostituisce.
// La consulenza P4 della vecchia scheda non c'è: aspetta la decisione sul P4.
// ═════════════════════════════════════════════════════════════════════════════

const etichettaFase = (stato) => FASI_PRATICA.find(f => f.id === stato)?.etichetta || stato;

const STATO_CARICAMENTO = {
    caricato: { etichetta: 'Caricato', classe: 'text-green-700' },
    mancante: { etichetta: 'Manca', classe: 'text-muted-foreground' },
};

const Titolo = ({ icona: Icona, children, destra }) => (
    <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="flex items-center gap-2 text-base"><Icona className="w-5 h-5" /> {children}</CardTitle>
            {destra}
        </div>
    </CardHeader>
);

const LinkSoggetto = ({ s, fallback }) => (s
    ? <Link to={percorsoSoggetto(s.id)} className="underline decoration-muted-foreground/40 hover:decoration-foreground">{s.nomeCompleto}</Link>
    : <span>{fallback || '—'}</span>);

// ─── Posizioni ────────────────────────────────────────────────────────────────
const Posizioni = ({ s, modello }) => (
    <Card>
        <Titolo icona={Home}>Posizioni sui contratti</Titolo>
        <CardContent className="space-y-3">
            {s.posizioni.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nessuna posizione sui contratti.</p>
            ) : (
                <ul className="divide-y divide-border rounded-lg border border-border">
                    {s.posizioni.map(pos => {
                        const c = trovaContratto(pos.contrattoId);
                        const altroVerso = pos.verso === 'locatore' ? 'conduttore' : 'locatore';
                        return (
                            <li key={pos.id} className="p-3 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Chip classe={VERSO[pos.verso].classe}>{VERSO[pos.verso].etichetta}</Chip>
                                    <Link to={percorsoImmobile(c.id)} className="font-medium text-foreground hover:underline">{c.immobile.indirizzo}, {c.immobile.citta}</Link>
                                    <Chip classe={COLORE_PRODOTTO[c.prodotto]}>{nomeProdotto(c.prodotto)}</Chip>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Dal {fmtData(c.inizio)} al {fmtData(c.fine)} · {VERSO[altroVerso].etichetta.toLowerCase()}:{' '}
                                    <LinkSoggetto s={modello.soggettoDi(c, altroVerso)} fallback={c[altroVerso].nome} />
                                </p>
                            </li>
                        );
                    })}
                </ul>
            )}
            <p className="text-xs text-muted-foreground">
                La persona non è il ruolo: proprietario e inquilino sono posizioni su un contratto, e la stessa persona può averne di tutti e due i versi.
            </p>
        </CardContent>
    </Card>
);

// ─── Le due reputazioni ───────────────────────────────────────────────────────
const ComeInquilino = ({ s }) => {
    const rep = s.inquilino;
    const voce = rep && SEMAFORO[rep.analisi.semaforo];
    return (
        <Card className="h-full">
            <Titolo icona={KeyRound}>Reputazione come inquilino</Titolo>
            <CardContent className="space-y-3 text-sm">
                {!rep ? (
                    <p className="text-muted-foreground">Nessuna posizione da inquilino: non c’è una reputazione da mostrare.</p>
                ) : (
                    <>
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-white border border-border shadow-sm flex items-center justify-center flex-shrink-0" aria-hidden="true">
                                <span className="w-5 h-5 rounded-full" style={{ background: voce.colore }} />
                            </span>
                            <div className="min-w-0">
                                <p className="font-semibold text-foreground">{voce.etichetta}</p>
                                <p className="text-xs text-muted-foreground">{voce.spiegazione}</p>
                            </div>
                        </div>
                        <dl className="grid grid-cols-2 gap-2">
                            {[
                                ['Giorno medio', rep.analisi.media == null ? '—' : `il ${String(rep.analisi.media).replace('.', ',')}`],
                                ['Mesi rilevati', rep.analisi.rilevati],
                                ['Non rilevati', rep.analisi.nonRilevati],
                                ['In verifica', rep.analisi.inSospeso],
                            ].map(([k, v]) => (
                                <div key={k} className="p-2 rounded-lg bg-muted/30">
                                    <dt className="text-xs text-muted-foreground">{k}</dt>
                                    <dd className="font-semibold tabular-nums text-foreground">{v}</dd>
                                </div>
                            ))}
                        </dl>
                        <ul className="space-y-1.5">
                            {rep.perContratto.map(({ contratto: c, analisi }) => (
                                <li key={c.id} className="flex items-center justify-between gap-2">
                                    <Link to={percorsoImmobile(c.id)} className="text-foreground hover:underline truncate">{c.immobile.indirizzo}</Link>
                                    <StatusBadge status={analisi.semaforo} />
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-muted-foreground">
                            È della persona, su tutti i suoi contratti da inquilino, negli ultimi 12 mesi. I semafori dei singoli contratti sono il dettaglio. I mesi non rilevati e quelli in verifica non contano.
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

const Fatto = ({ valore, allerta = false, children }) => (
    <li className="flex items-baseline gap-3">
        <span className={`w-14 flex-shrink-0 text-right tabular-nums font-semibold ${allerta && Number(valore) > 0 ? 'text-amber-700' : 'text-foreground'}`}>{valore}</span>
        <span className="text-muted-foreground">{children}</span>
    </li>
);

const ComeProprietario = ({ s }) => {
    const a = s.proprietario;
    return (
        <Card className="h-full">
            <Titolo icona={Building2}>Affidabilità come proprietario</Titolo>
            <CardContent className="space-y-3 text-sm">
                {!a ? (
                    <p className="text-muted-foreground">Nessuna posizione da proprietario.</p>
                ) : (
                    <>
                        <ul className="space-y-2">
                            {a.conSegnalazione === 0 ? (
                                <li className="text-muted-foreground">Nessuna segnalazione dovuta: sui suoi contratti incassa CRIA.</li>
                            ) : (
                                <>
                                    <Fatto valore={`${a.inTempo}/${a.mesi}`}>mesi segnalati nei termini</Fatto>
                                    <Fatto valore={a.tardivi} allerta>segnalati dopo i {PARAMETRI.giorniFinestraCopertura} giorni della finestra</Fatto>
                                    <Fatto valore={a.nonRilevati} allerta>non segnalati entro l’{PARAMETRI.giornoChiusuraMese}: non rilevati</Fatto>
                                </>
                            )}
                            <Fatto valore={a.rettificate} allerta>
                                segnalazioni rettificate da una contestazione{a.confermate ? ` · ${a.confermate} ${a.confermate === 1 ? 'confermata' : 'confermate'}` : ''}
                            </Fatto>
                            <Fatto valore={a.documentiAperti} allerta>documenti da integrare o in verifica</Fatto>
                        </ul>
                        <p className="text-xs text-muted-foreground">
                            Le commissioni pagate a CRIA si aggiungono con incassi e contabilità. Nessun colore finché CRIA non ne fissa le regole: qui ci sono i fatti.
                        </p>
                    </>
                )}
                <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Le due reputazioni non si mescolano: un proprietario lento a segnalare non è un cattivo inquilino.
                </p>
            </CardContent>
        </Card>
    );
};

// ─── Legami con pratiche, verifiche, referenze ────────────────────────────────
const Riga = ({ children, a }) => (
    <li className="p-3 text-sm">
        {a ? (
            <Link to={a} className="flex items-start justify-between gap-3 group">
                <div className="min-w-0 space-y-0.5">{children}</div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0 mt-0.5" />
            </Link>
        ) : <div className="min-w-0 space-y-0.5">{children}</div>}
    </li>
);

const Legami = ({ s, modello }) => {
    const righe = [];
    const rappresentante = s.rappresentante && modello.trova(modello.risolvi(s.rappresentante));
    const rappresentata = s.rappresenta && modello.trova(modello.risolvi(s.rappresenta));
    if (rappresentante) {
        righe.push(<Riga key="rapp" a={percorsoSoggetto(rappresentante.id)}><p className="font-medium text-foreground">Legale rappresentante: {rappresentante.nomeCompleto}</p><p className="text-xs text-muted-foreground">Firma per la società. È un’altra anagrafica: la sua reputazione è la sua.</p></Riga>);
    }
    if (rappresentata) {
        righe.push(<Riga key="rappd" a={percorsoSoggetto(rappresentata.id)}><p className="font-medium text-foreground">Legale rappresentante di {rappresentata.nomeCompleto}</p><p className="text-xs text-muted-foreground">Firma per la società. La reputazione della società resta della società.</p></Riga>);
    }
    for (const rel of s.pratiche) {
        const p = modello.pratica(rel.praticaId);
        if (!p) continue;
        const fase = `fase: ${etichettaFase(p.stato).toLowerCase()}`;
        if (rel.ruolo === 'proprietario') {
            righe.push(<Riga key={`${rel.ruolo}-${p.id}`} a="/dashboard/admin/onboarding"><p className="font-medium text-foreground">Pratica per {p.immobile.indirizzo}</p><p className="text-xs text-muted-foreground">{nomeProdotto(p.prodotto)} · aperta il {fmtData(p.apertaIl)} · {fase}</p></Riga>);
        } else if (rel.ruolo === 'firmataria') {
            righe.push(<Riga key={`${rel.ruolo}-${p.id}`} a="/dashboard/admin/onboarding"><p className="font-medium text-foreground">Firma la pratica di {p.immobile.indirizzo}</p><p className="text-xs text-muted-foreground">Per conto di {rappresentata?.nomeCompleto || 'una società'} · {fase}</p></Riga>);
        } else {
            const delibera = p.istruttoria ? `delibera del ${fmtData(p.istruttoria.conclusaIl)}: ${p.istruttoria.esito}` : 'delibera non ancora presa';
            righe.push(
                <Riga key={`${rel.ruolo}-${p.id}`} a="/dashboard/admin/onboarding">
                    <p className="font-medium text-foreground">{rel.ruolo === 'inquilino_attuale' ? 'Inquilino attuale' : 'Candidato inquilino'} per {p.immobile.indirizzo}</p>
                    <p className="text-xs text-muted-foreground">Pratica di {modello.trova(modello.risolvi(p.personaId))?.nomeCompleto || '—'} · {fase} · {delibera}</p>
                </Riga>,
            );
        }
    }
    if (s.verifiche.length) {
        const ultima = [...s.verifiche].sort((x, y) => y.richiestaIl.localeCompare(x.richiestaIl))[0];
        const inCorso = s.verifiche.filter(v => v.stato === 'in_corso').length;
        righe.push(<Riga key="verifiche"><p className="font-medium text-foreground">Cliente CRIA Verifica: {s.verifiche.length} {s.verifiche.length === 1 ? 'richiesta' : 'richieste'}</p><p className="text-xs text-muted-foreground">L’ultima il {fmtData(ultima.richiestaIl)}{inCorso ? ` · ${inCorso} in corso` : ''}. Gli esiti restano nella sua area: all’anagrafica non servono.</p></Riga>);
    }
    for (const a of s.autocandidature) {
        righe.push(<Riga key={a.id}><p className="font-medium text-foreground">Certificato su autocandidatura: {STATI_AUTOCANDIDATURA[a.stato]?.etichetta.toLowerCase()}</p><p className="text-xs text-muted-foreground">Aperta il {fmtData(a.apertaIl)} · {a.prove.length} {a.prove.length === 1 ? 'prova' : 'prove'} · {a.referenze.length} {a.referenze.length === 1 ? 'referenza chiesta' : 'referenze chieste'}</p></Riga>);
    }
    for (const { autocandidatura, referenza: r } of s.referenze) {
        righe.push(
            <Riga key={r.id} a={percorsoSoggetto(modello.risolvi(autocandidatura.personaId))}>
                <p className="font-medium text-foreground">Precedente proprietario di {r.immobile}</p>
                <p className="text-xs text-muted-foreground">Referenza chiesta da {modello.trova(modello.risolvi(autocandidatura.personaId))?.nomeCompleto} il {fmtData(r.richiestaIl)} · {STATI_REFERENZA[r.stato]?.etichetta.toLowerCase()}. Solo su richiesta dell’inquilino.</p>
            </Riga>,
        );
    }
    if (s.certificati.length) {
        const validi = s.certificati.filter(c => statoCertificato(c) === 'valido').length;
        const ultimo = [...s.certificati].sort((x, y) => y.emessoIl.localeCompare(x.emessoIl))[0];
        righe.push(<Riga key="certificati"><p className="font-medium text-foreground">Certificati di reputazione: {s.certificati.length} {s.certificati.length === 1 ? 'emesso' : 'emessi'}, {validi} {validi === 1 ? 'valido' : 'validi'}</p><p className="text-xs text-muted-foreground">L’ultimo emesso il {fmtData(ultimo.emessoIl)}</p></Riga>);
    }
    for (const m of s.morosita) {
        const c = trovaContratto(m.contrattoId);
        righe.push(<Riga key={m.id} a={`/dashboard/admin/morosita/${m.id}`}><p className="font-medium text-foreground">Pratica di morosità · {c.immobile.indirizzo}</p><p className="text-xs text-muted-foreground">{m.mesi.map(x => nomeMese(x).toLowerCase()).join(', ')} · aperta il {fmtData(m.apertaIl)}</p></Riga>);
    }
    for (const k of s.contestazioni) {
        const c = trovaContratto(k.contrattoId);
        righe.push(
            <Riga key={k.id} a={`/dashboard/admin/contestazioni/${k.id}`}>
                <p className="font-medium text-foreground">Contestazione di {nomeMese(k.mese).toLowerCase()} · {c.immobile.indirizzo}</p>
                <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">Aperta il {fmtData(k.apertaIl)} <Chip classe={classeStatoContestazione(k.stato)}>{etichettaStatoContestazione(k.stato)}</Chip></p>
            </Riga>,
        );
    }
    return (
        <Card>
            <Titolo icona={Link2}>Pratiche e altri legami</Titolo>
            <CardContent>
                {righe.length === 0
                    ? <p className="text-sm text-muted-foreground">Nessun altro legame.</p>
                    : <ul className="divide-y divide-border rounded-lg border border-border">{righe}</ul>}
            </CardContent>
        </Card>
    );
};

// ─── Anagrafica e account ─────────────────────────────────────────────────────
const STATO_IDENTITA = {
    non_caricato: 'Documento non caricato',
    in_attesa: 'Documento da verificare',
    da_integrare: 'Documento da integrare',
    verificato: 'Verificata',
};

// L'admin cambia i dati di chi ha una riga nel database (chi ha un account).
const Anagrafica = ({ s, puoModificare }) => {
    const [modifica, setModifica] = useState(false);
    const provvisorio = isCodiceProvvisorio(s.codiceFiscale, s.tipo);
    if (modifica) {
        return (
            <Card>
                <Titolo icona={UserRound}>Anagrafica · modifica</Titolo>
                <CardContent><ModificaAnagrafica s={s} onChiudi={() => setModifica(false)} /></CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <Titolo icona={UserRound} destra={puoModificare && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setModifica(true)}><Pencil className="w-3.5 h-3.5" /> Modifica</Button>
            )}>Anagrafica</Titolo>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
                {s.tipo === 'giuridica' ? (
                    <>
                        <Voce etichetta="Ragione sociale" className="col-span-2">{s.ragioneSociale}</Voce>
                        <Voce etichetta="Partita IVA"><span className="font-mono text-xs">{s.partitaIva}</span></Voce>
                        <Voce etichetta="Codice fiscale"><span className="font-mono text-xs">{s.codiceFiscale}</span></Voce>
                        {s.sede && <Voce etichetta="Sede" className="col-span-2">{s.sede}</Voce>}
                        {s.referente && (s.referente.nome || s.referente.cognome) && (
                            <Voce etichetta="Referente dell’account" className="col-span-2">{s.referente.nome} {s.referente.cognome}</Voce>
                        )}
                        {s.legaleRappresentante && (
                            <Voce etichetta="Legale rappresentante" className="col-span-2">
                                {s.legaleRappresentante.nome} {s.legaleRappresentante.cognome}
                                {s.legaleRappresentante.codiceFiscale && <span className="block font-mono text-xs font-normal">{s.legaleRappresentante.codiceFiscale}</span>}
                            </Voce>
                        )}
                    </>
                ) : (
                    <>
                        <Voce etichetta="Nome">{s.nome}</Voce>
                        <Voce etichetta="Cognome">{s.cognome || '—'}</Voce>
                        <Voce etichetta="Codice fiscale" className="col-span-2">
                            {s.codiceFiscale ? <span className="font-mono text-xs break-all">{s.codiceFiscale}</span> : <span className="text-muted-foreground font-normal">Non ancora acquisito</span>}
                            {provvisorio && (
                                <Link to={PERCORSI.revisione} className="ml-2 align-middle"><Chip classe="bg-amber-100 text-amber-800 hover:bg-amber-200">Provvisorio</Chip></Link>
                            )}
                        </Voce>
                        {s.dataNascita && <Voce etichetta="Nascita" className="col-span-2">{fmtData(s.dataNascita)}{s.luogoNascita ? `, ${s.luogoNascita}` : ''}</Voce>}
                    </>
                )}
                {s.indirizzo && (
                    <Voce etichetta={s.tipo === 'giuridica' ? 'Sede dichiarata' : 'Indirizzo'} className="col-span-2">
                        {s.indirizzo.via}, {[s.indirizzo.cap, s.indirizzo.citta].filter(Boolean).join(' ')} · {s.indirizzo.paese}
                        {s.indirizzo.fonte !== 'dichiarato' && (
                            <span className="block text-xs text-muted-foreground font-normal">
                                Non dichiarato: {s.indirizzo.fonte === 'casa' ? 'è la casa in affitto' : 'è l’indirizzo di fatturazione'}.
                            </span>
                        )}
                    </Voce>
                )}
                <Voce etichetta="Email" className="col-span-2"><span className="break-all">{s.email || '—'}</span></Voce>
                <Voce etichetta="Telefono" className="col-span-2">{s.telefono || '—'}</Voce>
                {s.statoIdentita && <Voce etichetta="Identità" className="col-span-2">{STATO_IDENTITA[s.statoIdentita] || s.statoIdentita}</Voce>}
                {s.archiviato && (
                    <Voce etichetta="Email e cellulare di prima" className="col-span-2">
                        <span className="block break-all font-normal">{s.archiviato.emailPrima || '—'}</span>
                        <span className="block font-normal">{s.archiviato.telefonoPrima || '—'}</span>
                        <span className="block text-xs text-muted-foreground font-normal mt-1">Liberati quando l’anagrafica è stata archiviata: restano scritti qui come storia.</span>
                    </Voce>
                )}
                {s.codiciPrecedenti.length > 0 && (
                    <Voce etichetta="Codici precedenti" className="col-span-2">
                        {s.codiciPrecedenti.map(c => (
                            <span key={c.codice} className="block text-xs font-normal">
                                <span className="font-mono">{c.codice}</span> · {c.tipo}{c.al ? ` fino al ${fmtData(c.al)}` : ''}
                            </span>
                        ))}
                        <span className="block text-xs text-muted-foreground font-normal mt-1">Chi cerca col vecchio codice trova questa anagrafica.</span>
                    </Voce>
                )}
                <Voce etichetta="In CRIA dal" className="col-span-2">
                    {fmtData(s.creatoIl)}
                    <span className="block text-xs text-muted-foreground font-normal">{s.origineTesto}</span>
                </Voce>
            </CardContent>
        </Card>
    );
};

const testoSenzaAccount = (s) => {
    if (s.account.nota) return s.account.nota;
    if (s.pratiche.some(r => r.ruolo === 'candidato' || r.ruolo === 'inquilino_attuale')) return 'Carica i documenti dal link personale della pratica: non gli serve un account.';
    if (s.referenze.length) return 'Risponde alla referenza da un link personale: non gli serve un account.';
    return 'Nessun account.';
};

const Account = ({ s }) => {
    const { operatoreId } = useOperatoreAttivo();
    const { stato, dal } = s.account;
    const creato = Boolean(s.creazione);
    const puoInvitare = !s.archiviato && s.posizioni.length > 0 && (stato === 'senza_account' || stato === 'invitato');
    const canale = s.email ? 'email' : 'sms';
    const invita = () => {
        invitaSoggetto(s.id, canale, operatoreId);
        toast.success(`Invito mandato a ${s.nomeCompleto} ${CANALI[canale]}: attivando l’account, si aggancia a questa anagrafica`);
    };
    return (
        <Card>
            <Titolo icona={BadgeCheck}>Account</Titolo>
            <CardContent className="space-y-3 text-sm">
                <Chip classe={STATO_ACCOUNT[stato].classe}>{STATO_ACCOUNT[stato].etichetta}</Chip>
                <ul className="text-xs text-muted-foreground space-y-1">
                    {creato && <li>Creato da CRIA il {fmtData(dal)}, con una password provvisoria.</li>}
                    {stato === 'da_attivare' && <li>Aspetta che la persona entri con la password provvisoria, la cambi e confermi email e cellulare.</li>}
                    {s.account.attivatoIl && <li>Attivato il {fmtData(s.account.attivatoIl)}: password cambiata, email e cellulare confermati.</li>}
                    {stato === 'da_verificare' && creato && <li>Ora l’identità si verifica come per chi si registra.</li>}
                    {stato === 'attivo' && !creato && <li>Attivo dal {fmtData(dal)}{s.account.daInvito ? ', dall’invito: si è agganciato a questa anagrafica' : ''}.</li>}
                    {s.account.identitaVerificataIl && <li>Identità verificata il {fmtData(s.account.identitaVerificataIl)}{s.account.identitaVerificataDa ? ` da ${nomeOperatore(s.account.identitaVerificataDa)}` : ''}.</li>}
                    {stato === 'da_verificare' && !creato && <li>Registrato il {fmtData(dal)}: il documento d’identità è da caricare e verificare.</li>}
                    {s.inviti.map((i, n) => (
                        <li key={i.id || n}>Invito mandato il {fmtData(i.il)} {CANALI[i.canale]}{i.da ? ` da ${nomeOperatore(i.da)}` : ', in automatico'}.</li>
                    ))}
                    {s.passwordInviate.map(e => (
                        <li key={e.id}>Password provvisoria mandata per SMS al {e.a} il {fmtData(e.il)}{e.da ? ` da ${nomeOperatore(e.da)}` : ''}.</li>
                    ))}
                    {stato === 'senza_account' && <li>{testoSenzaAccount(s)}</li>}
                    {s.archiviato && (
                        <li>
                            Archiviato il {fmtData(s.archiviato.il)}: accesso chiuso.
                            {s.account.statoPrima && ` Prima era: ${STATO_ACCOUNT[s.account.statoPrima]?.etichetta.toLowerCase()}.`}
                        </li>
                    )}
                </ul>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{creato ? 'Ruoli scelti alla creazione' : s.archiviato ? 'Ruoli che aveva' : 'Ruoli, dalle sue posizioni'}</p>
                    {s.ruoli.length === 0
                        ? <p className="text-xs text-muted-foreground">Nessuno.</p>
                        : <div className="flex flex-wrap gap-1.5">{s.ruoli.map(r => <Chip key={r} classe="bg-muted text-foreground">{RUOLI_UTENTE[r]?.etichetta || r}</Chip>)}</div>}
                </div>
                {puoInvitare && (
                    <AzioneSeparata azione="invita" variant="outline" onEsegui={invita}>
                        {stato === 'invitato' ? 'Rimanda l’invito' : 'Manda l’invito'}
                    </AzioneSeparata>
                )}
                {creato && (stato === 'da_attivare' || stato === 'da_verificare') && (
                    <NotaMockup className="py-3">
                        {stato === 'da_attivare' ? (
                            <button type="button" className="underline font-medium text-left" onClick={() => simulaAttivazione(s.id)}>
                                Simula: la persona entra, cambia la password e conferma email e cellulare
                            </button>
                        ) : (
                            <button type="button" className="underline font-medium text-left" onClick={() => simulaIdentitaVerificata(s.id, operatoreId)}>
                                Simula: l’identità è verificata
                            </button>
                        )}
                    </NotaMockup>
                )}
                <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                    Di regola i clienti si registrano da soli, o attivano l’account dall’invito. Un utente creato da CRIA è un’eccezione: due firme, password provvisoria e verifica dell’identità.
                </p>
            </CardContent>
        </Card>
    );
};

// Da dove viene un utente creato da CRIA: chi l'ha preparato, chi l'ha
// confermato, cosa ha detto il cliente, quali anagrafiche sostituisce.
const Creazione = ({ s, modello }) => {
    const p = s.creazione;
    const sostituite = p.daAnagrafiche.map(id => modello.trova(id)).filter(Boolean);
    const portate = Object.keys(VOCI_STORICO)
        .map(tipo => [tipo, Object.values(p.storico).reduce((n, scelte) => n + (scelte?.[tipo]?.length || 0), 0)])
        .filter(([, n]) => n > 0);
    return (
        <Card>
            <Titolo icona={UserPlus}>Da dove viene l’utente</Titolo>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Voce etichetta="Preparato da">{nomeOperatore(p.preparatoDa)} <span className="font-normal text-muted-foreground">il {fmtData(p.preparatoIl)}</span></Voce>
                <Voce etichetta="Confermato da">{nomeOperatore(p.esito.da)} <span className="font-normal text-muted-foreground">il {fmtData(p.esito.il)}</span></Voce>
                <Voce etichetta="Contatto con il cliente" className="sm:col-span-2">
                    {p.contatto ? (
                        <>
                            {fmtData(p.contatto.il)} · {CANALI_CONTATTO[p.contatto.canale] || '—'}
                            <span className="block text-xs text-muted-foreground font-normal">
                                {[
                                    p.contatto.stessaPersona && 'ha confermato di essere la stessa persona',
                                    p.contatto.recapitiScelti && 'ha scelto email e cellulare',
                                    p.contatto.nota,
                                ].filter(Boolean).join(' · ') || 'Nessuna nota.'}
                            </span>
                        </>
                    ) : <span className="font-normal text-muted-foreground">Nessun contatto registrato.</span>}
                </Voce>
                {sostituite.length > 0 && (
                    <Voce etichetta="Sostituisce le anagrafiche" className="sm:col-span-2">
                        {sostituite.map(v => (
                            <span key={v.id} className="block font-normal">
                                <LinkSoggetto s={v} /> <span className="text-muted-foreground">· {v.origineBreve}, archiviata</span>
                            </span>
                        ))}
                    </Voce>
                )}
                {sostituite.length > 0 && (
                    <Voce etichetta="Storico portato" className="sm:col-span-2">
                        <span className="block font-normal">{portate.length ? portate.map(([tipo, n]) => `${VOCI_STORICO[tipo]}: ${n}`).join(' · ') : 'Niente'}</span>
                        <span className="block text-xs text-muted-foreground font-normal">La reputazione non si è copiata: si ricalcola dai contratti portati.</span>
                    </Voce>
                )}
            </CardContent>
        </Card>
    );
};

// ─── Documenti: chi consegna cosa ─────────────────────────────────────────────
const chiLoApre = (d) => {
    if (d.contestazioneId) return 'La apre solo chi istruisce la contestazione.';
    if (d.autocandidaturaId) return 'La apre solo l’istruttoria che ha l’autocandidatura in coda.';
    return 'Lo apre solo l’istruttoria che ha la pratica in coda.';
};

// La verifica è umana e resta scritta: chi la fa, quando, e con che motivo
// se il documento va rifatto. I documenti dei dati di prova non si verificano:
// non hanno un file da guardare.
const daDatabase = (d) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(String(d.id));

const VerificaDocumento = ({ d }) => {
    const [motivo, setMotivo] = useState(null);
    const [inCorso, setInCorso] = useState(false);

    const decidi = async (esito, testo = null) => {
        setInCorso(true);
        const esitoScrittura = await verificaDocumento(d, esito, testo);
        setInCorso(false);
        if (!esitoScrittura.ok) { toast.error(esitoScrittura.messaggio || 'Non riuscito'); return; }
        setMotivo(null);
        toast.success(esito === 'verificato' ? 'Documento verificato' : 'Chiesto di caricarlo di nuovo');
    };

    if (motivo !== null) {
        return (
            <div className="flex flex-wrap items-center gap-2 pt-1">
                <Input value={motivo} onChange={e => setMotivo(e.target.value)} className="h-8 text-xs w-56"
                    placeholder="Cosa non va: lo legge chi l'ha caricato" autoFocus />
                <Button size="sm" className="h-8" disabled={inCorso || motivo.trim().length < 5} onClick={() => decidi('da_integrare', motivo.trim())}>Chiedi di rifarlo</Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={() => setMotivo(null)}>Lascia stare</Button>
            </div>
        );
    }
    return (
        <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" className="h-7 text-xs" disabled={inCorso} onClick={() => decidi('verificato')}>Verificato</Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setMotivo('')}>Da integrare</Button>
        </div>
    );
};

const Documenti = ({ s, puoVerificare }) => (
    <Card>
        <Titolo icona={FileText}>Documenti ({s.documenti.length})</Titolo>
        <CardContent className="space-y-3">
            {s.documenti.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nessun documento consegnato.</p>
            ) : (
                <ul className="space-y-2">
                    {s.documenti.map(d => {
                        const stato = STATO_DOCUMENTO[d.stato] || STATO_CARICAMENTO[d.stato];
                        const contratto = d.contrattoId && trovaContratto(d.contrattoId);
                        return (
                            <li key={d.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30">
                                {d.riservato
                                    ? <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" aria-label="Riservato" />
                                    : <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
                                <div className="flex-1 min-w-0 space-y-0.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-sm font-medium text-foreground">{d.etichetta}</p>
                                        {stato && <span className={`text-xs font-medium flex-shrink-0 ${stato.classe}`}>{stato.etichetta}</span>}
                                    </div>
                                    <p className="text-xs text-muted-foreground break-words">
                                        {[contratto && contratto.immobile.indirizzo, d.il && `${d.tipo === 'consenso' ? 'dato' : 'caricato'} il ${fmtData(d.il)}`].filter(Boolean).join(' · ')}
                                    </p>
                                    {d.cancellazioneIl ? (
                                        <p className="text-xs text-muted-foreground">Si cancella il {fmtData(d.cancellazioneIl)}, 30 giorni dopo la delibera: restano gli indicatori.</p>
                                    ) : d.conservazione && d.stato !== 'mancante' && (
                                        <p className="text-xs text-muted-foreground">Si conserva: {d.conservazione.charAt(0).toLowerCase()}{d.conservazione.slice(1)}.</p>
                                    )}
                                    {d.riservato && d.stato !== 'mancante' && <p className="text-xs text-amber-800">{chiLoApre(d)}</p>}
                                    {puoVerificare && daDatabase(d) && ['in_attesa', 'da_integrare'].includes(d.stato) && <VerificaDocumento d={d} />}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
            <p className="text-xs text-muted-foreground">Ognuno consegna i propri documenti. Qui si vede quali ci sono, in che stato e per quanto restano: si aprono dove si lavorano.</p>
        </CardContent>
    </Card>
);

// ─── Storia: chi ha fatto cosa, e quando ──────────────────────────────────────
const storiaDi = (s, modello) => {
    const p = s.creazione;
    const voci = p
        ? [
            { il: p.preparatoIl, testo: `Utente preparato da CRIA${p.daAnagrafiche.length ? ', per sostituire due anagrafiche della stessa persona' : ''}`, da: p.preparatoDa },
            ...(p.contatto ? [{
                il: p.contatto.il,
                testo: `Contatto con il cliente, ${(CANALI_CONTATTO[p.contatto.canale] || '').toLowerCase()}${p.contatto.stessaPersona ? ': ha confermato di essere la stessa persona' : ''}`,
                da: p.preparatoDa,
            }] : []),
            { il: p.esito.il, testo: 'Utente confermato: nasce l’account, con una password provvisoria', da: p.esito.da },
        ]
        : [{ il: s.creatoIl, testo: s.origineTesto }];
    const { account } = s;
    if (!p && account.dal && s.origine?.tipo !== 'registrazione' && account.dal !== s.creatoIl) {
        voci.push({ il: account.dal, testo: account.daInvito ? 'Account attivato dall’invito: si aggancia a questa anagrafica' : 'Account aperto con una registrazione' });
    }
    s.passwordInviate.forEach(e => voci.push({ il: e.il, testo: `Password provvisoria mandata per SMS al ${e.a}`, da: e.da }));
    if (account.attivatoIl) voci.push({ il: account.attivatoIl, testo: 'Primo accesso: password cambiata, email e cellulare confermati' });
    if (account.identitaVerificataIl) voci.push({ il: account.identitaVerificataIl, testo: 'Documento d’identità verificato', da: account.identitaVerificataDa });
    s.inviti.forEach(i => voci.push({ il: i.il, testo: `Invito ad attivare l’account, ${CANALI[i.canale]}`, da: i.da }));
    s.richiesteCodice.forEach(r => voci.push({ il: r.il, testo: `Chiesto il codice fiscale definitivo, ${CANALI[r.canale]}`, da: r.da }));
    if (s.codiceDefinitivo) {
        const prec = s.codiciPrecedenti[s.codiciPrecedenti.length - 1];
        voci.push({
            il: s.codiceDefinitivo.il,
            testo: `Registrato il codice fiscale definitivo al posto del ${prec?.tipo || 'precedente'} ${prec?.codice || ''}. Fonte: ${FONTI_CODICE[s.codiceDefinitivo.fonte] || '—'}`,
            da: s.codiceDefinitivo.da,
        });
    }
    if (s.archiviato) {
        voci.push({
            il: s.archiviato.il,
            testo: `Archiviata: la sostituisce l’utente ${modello.trova(s.archiviato.sostituitoDa)?.nomeCompleto || 'nuovo'}. Accesso chiuso, email e cellulare liberati`,
            da: s.archiviato.da,
        });
    }
    for (const c of modello.coppie.filter(x => x.a === s.id || x.b === s.id)) {
        const nome = modello.trova(c.a === s.id ? c.b : c.a)?.nomeCompleto || '—';
        if (c.manuale) voci.push({ il: c.manuale.il, testo: `Segnalato un possibile doppione con ${nome}: ${c.manuale.motivo}`, da: c.manuale.da });
        if (c.esito?.tipo === 'risolta') voci.push({ il: c.esito.il, testo: `Possibile doppione con ${nome} segnato come risolto: ${c.esito.nota}`, da: c.esito.da });
        if (c.esito?.tipo === 'distinti') {
            voci.push({ il: c.esito.il, testo: `Esaminata insieme a ${nome}: soggetti diversi · ${MOTIVI_DISTINTI[c.esito.motivo]?.toLowerCase()}${c.esito.nota ? ` · ${c.esito.nota}` : ''}`, da: c.esito.da });
        }
    }
    // Stesso giorno: resta l'ordine in cui sono avvenute.
    return voci.filter(v => v.il).map((v, i) => ({ ...v, i })).sort((x, y) => x.il.localeCompare(y.il) || x.i - y.i);
};

// Le modifiche ai dati personali, dal registro del database: un'azione per volta
// (stessi minuti, stessa persona, stesso motivo), con i campi cambiati.
const modificheInStoria = (righe, persone) => {
    const gruppi = new Map();
    for (const r of righe) {
        const chiave = `${String(r.il).slice(0, 16)}|${r.daEmail || r.daPersona}|${r.motivo || ''}`;
        if (!gruppi.has(chiave)) gruppi.set(chiave, { ...r, campi: [] });
        gruppi.get(chiave).campi.push(r.campo);
    }
    return [...gruppi.values()].map(g => {
        const chi = persone.find(p => p.personaDb === g.daPersona || (g.daEmail && p.email === g.daEmail));
        const campi = [...new Set(g.campi.filter(c => c !== 'motivoIntegrazione').map(c => ETICHETTE_CAMPI[c] || c))];
        return {
            il: String(g.il).slice(0, 10),
            testo: `Cambiati ${campi.join(', ')}${g.motivo ? `: «${g.motivo}»` : ''}`,
            chi: chi ? (chi.admin ? 'Amministratore CRIA' : `${chi.nome} ${chi.cognome}`.trim()) : g.daEmail || null,
        };
    });
};

const Storia = ({ s, modello }) => {
    const righe = useModifiche(s.personaDb);
    const persone = usePersone();
    const voci = [...storiaDi(s, modello), ...modificheInStoria(righe, persone)]
        .map((v, i) => ({ ...v, i }))
        .sort((x, y) => x.il.localeCompare(y.il) || x.i - y.i);
    return (
        <Card>
            <Titolo icona={History}>Storia dell’anagrafica</Titolo>
            <CardContent>
                <ol className="relative ml-1.5 border-l border-border">
                    {voci.map((v, i) => (
                        <li key={`${v.il}-${i}`} className="ml-5 pb-4 last:pb-0">
                            <span className={`absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full border-2 border-background ${i === voci.length - 1 ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                            <p className="text-xs text-muted-foreground">{fmtData(v.il)}{v.da ? ` · ${nomeOperatore(v.da)}` : v.chi ? ` · ${v.chi}` : ''}</p>
                            <p className="text-sm text-foreground">{v.testo}</p>
                        </li>
                    ))}
                </ol>
            </CardContent>
        </Card>
    );
};

// ─── Pagina ───────────────────────────────────────────────────────────────────
const DaRivedere = ({ s, modello }) => {
    const coppie = coppieAperteDi(modello, s.id);
    const provvisorio = modello.provvisori.find(p => p.soggetto.id === s.id);
    if (!coppie.length && !provvisorio) return null;
    return (
        <Card className="border-amber-300 bg-amber-50/60">
            <CardContent className="pt-4 pb-4 space-y-2">
                <p className="text-sm font-medium text-amber-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Da rivedere</p>
                <ul className="text-sm text-amber-900 space-y-1">
                    {coppie.map(c => {
                        const altro = modello.trova(c.a === s.id ? c.b : c.a);
                        return (
                            <li key={c.id}>
                                Possibile doppione con <LinkSoggetto s={altro} /> · {c.regole.map(r => REGOLE_DOPPIONI[r].toLowerCase()).join(', ')} · {STATO_COPPIA[c.stato].etichetta.toLowerCase()}
                            </li>
                        );
                    })}
                    {provvisorio && <li>Codice fiscale provvisorio: il definitivo è da acquisire.</li>}
                </ul>
                <Link to={PERCORSI.revisione} className="inline-flex items-center gap-1 text-sm font-medium text-amber-900 underline">Vai alla revisione delle anagrafiche <ArrowRight className="w-3.5 h-3.5" /></Link>
            </CardContent>
        </Card>
    );
};

const SchedaClientePage = () => {
    const { id } = useParams();
    const { operatore } = useOperatoreAttivo();
    const livello = livelloAnagrafica(operatore.funzione);
    const modello = useAnagrafica();
    const [segnala, setSegnala] = useState(false);
    const s = modello.trova(id);
    const indietro = { to: PERCORSI.soggetti, label: 'Soggetti e utenti' };

    if (livello !== 'L') {
        return (
            <>
                <Helmet><title>Scheda soggetto - CRIA</title></Helmet>
                <div className="space-y-6">
                    <IntestazionePagina titolo="Scheda soggetto" indietro={indietro} />
                    <VistaRistretta livello={livello} />
                </div>
            </>
        );
    }

    if (!s) {
        return (
            <>
                <Helmet><title>Anagrafica non trovata - CRIA</title></Helmet>
                <div className="space-y-6">
                    <IntestazionePagina titolo="Anagrafica non trovata" indietro={indietro} />
                    <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Nessun soggetto con questo codice.</CardContent></Card>
                </div>
            </>
        );
    }

    // Un'anagrafica archiviata rimanda all'utente che la sostituisce.
    const nuovo = s.archiviato && modello.trova(modello.risolvi(s.id));
    const identificativo = s.tipo === 'giuridica' ? `P. IVA ${s.partitaIva}` : s.codiceFiscale ? `CF ${s.codiceFiscale}` : 'codice fiscale da acquisire';

    return (
        <>
            <Helmet><title>{s.nomeCompleto} - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    indietro={indietro}
                    titolo={s.nomeCompleto}
                    sottotitolo={`${s.tipo === 'giuridica' ? 'Persona giuridica' : 'Persona fisica'} · ${identificativo} · in CRIA dal ${fmtData(s.creatoIl)}`}
                    badge={<Chip classe={STATO_ACCOUNT[s.account.stato].classe}>{STATO_ACCOUNT[s.account.stato].breve}</Chip>}
                    azioni={!s.archiviato && (
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => setSegnala(v => !v)} aria-expanded={segnala}>
                            <GitMerge className="w-4 h-4" /> Segnala un doppione
                        </Button>
                    )}
                />

                {segnala && <SegnalaDoppione modello={modello} soggettoId={s.id} onFatto={() => setSegnala(false)} />}

                {nuovo && (
                    <Card className="border-slate-300 bg-slate-50">
                        <CardContent className="pt-4 pb-4 text-sm text-slate-900 space-y-1">
                            <p className="font-medium flex items-center gap-2"><Archive className="w-4 h-4 flex-shrink-0" /> Archiviata il {fmtData(s.archiviato.il)}, con la conferma di {nomeOperatore(s.archiviato.da)}.</p>
                            <p>
                                La sostituisce l’utente <LinkSoggetto s={nuovo} />. L’accesso è chiuso, email e cellulare sono liberati; quello che non è passato all’utente nuovo resta qui. Niente si cancella.
                            </p>
                        </CardContent>
                    </Card>
                )}
                {!s.archiviato && <DaRivedere s={s} modello={modello} />}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                        {s.creazione && <Creazione s={s} modello={modello} />}
                        <Posizioni s={s} modello={modello} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ComeInquilino s={s} />
                            <ComeProprietario s={s} />
                        </div>
                        <Legami s={s} modello={modello} />
                        <Storia s={s} modello={modello} />
                    </div>
                    <div className="space-y-6">
                        <Anagrafica key={s.id} s={s} puoModificare={operatore?.funzione === 'admin' && Boolean(s.personaDb) && !s.archiviato} />
                        <Account s={s} />
                        <Documenti s={s} puoVerificare={['admin', 'istruttoria', 'responsabile_operativo'].includes(operatore?.funzione)} />
                    </div>
                </div>

                <NotaMockup>
                    <p>Inviti, utenti creati e codici registrati restano in questo browser.</p>
                    <button type="button" className="underline font-medium mt-2" onClick={() => { ripristinaAnagraficaDemo(); toast.success('Anagrafica demo ripristinata'); }}>
                        Ripristina l’anagrafica demo
                    </button>
                </NotaMockup>
            </div>
        </>
    );
};

export default SchedaClientePage;
