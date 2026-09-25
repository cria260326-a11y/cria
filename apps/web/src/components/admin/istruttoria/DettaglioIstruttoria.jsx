import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, History, Clock, CheckCircle2, AlertTriangle, UserCheck, Mail, MessageSquare, Phone } from 'lucide-react';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import { PRODOTTI, nomeProdotto, fmtEuro, COLORE_PRODOTTO } from '@/data/catalogo';
import { ESITI, REGOLE_ISTRUTTORIA } from '@/data/istruttoria';
import { CANALI_CONTATTO, STATI_REFERENZA, TENTATIVI_REFERENZA } from '@/data/autocandidature';
import { nomeOperatore } from '@/data/operatori';
import { trovaPersonaDemo } from '@/data/personeDemo';
import { FASI, PERCORSO_ISTRUTTORIA, conservazione, etichettaProvincia } from '@/lib/istruttoriaDemo';
import { fmtData, nomeMese } from '@/lib/formato';
import { Pill, Voce, Termine, periodoMesi } from '@/components/admin/istruttoria/Elementi';
import DocumentiIstruttoria from '@/components/admin/istruttoria/DocumentiIstruttoria';
import DeliberaIstruttoria from '@/components/admin/istruttoria/DeliberaIstruttoria';
import AssegnazioneIstruttoria from '@/components/admin/istruttoria/AssegnazioneIstruttoria';

// ═════════════════════════════════════════════════════════════════════════════
// Una voce della coda (O-07 con dentro O-08): chi la segue, i documenti, la
// proposta, la delibera, e la traccia di chi ha fatto cosa e quando.
// ═════════════════════════════════════════════════════════════════════════════

const ICONA_CANALE = { email: Mail, sms: MessageSquare, telefonata: Phone };

const mascheraCf = (cf) => (cf ? `${cf.slice(0, 3)}•••••••••${cf.slice(-4)}` : '—');

const DatiPratica = ({ voce }) => {
    const p = voce.raw;
    const prod = PRODOTTI[p.prodotto];
    return (
        <div className="grid grid-cols-2 gap-4">
            <Voce etichetta="Immobile" className="col-span-2">{p.immobile.tipologia}{p.immobile.mq ? `, ${p.immobile.mq} m²` : ''} · {p.immobile.catasto}</Voce>
            <Voce etichetta="Canone">{fmtEuro(p.canone)}/mese</Voce>
            <Voce etichetta={p.contratto === 'esistente' ? 'Inizio' : 'Inizio previsto'}>{fmtData(p.inizio || p.inizioPrevisto)}</Voce>
            <Voce etichetta="Proprietario">{voce.cliente}</Voce>
            <Voce etichetta="Candidato">{p.candidato ? `${p.candidato.nome}${p.candidato.inquilinoAttuale ? ' (inquilino attuale)' : ''}` : 'Non ancora invitato'}</Voce>
            {p.candidato && <Voce etichetta="Invitato il">{fmtData(p.candidato.invitatoIl)}</Voce>}
            {p.candidato && <Voce etichetta="Ultimo accesso al link">{p.candidato.ultimoAccesso ? fmtData(p.candidato.ultimoAccesso) : 'Mai aperto'}</Voce>}
            <Voce etichetta="Garanzia">{prod?.garanzia ? `Franchigia standard di ${prod.franchigiaMesi} ${prod.franchigiaMesi === 1 ? 'mese' : 'mesi'}` : 'Senza garanzia'}</Voce>
            <Voce etichetta="Ubicazione">{etichettaProvincia(voce.provincia) || '—'}</Voce>
            {p.registrazione && <Voce etichetta="Registrazione" className="col-span-2">{p.registrazione.numero} · {fmtData(p.registrazione.data)} · {p.registrazione.ufficio}</Voce>}
        </div>
    );
};

const DatiVerifica = ({ voce, titolare }) => {
    const s = voce.soggetto;
    const richiedente = trovaPersonaDemo(voce.clienteId);
    return (
        <div className="grid grid-cols-2 gap-4">
            <Voce etichetta="Richiedente" className="col-span-2">{voce.cliente}{richiedente?.statoIdentita === 'verificato' ? ' · identità verificata' : ''}</Voce>
            <Voce etichetta="Candidato">{titolare ? `${s.nome} ${s.cognome}` : voce.candidato}</Voce>
            <Voce etichetta="Codice fiscale">{titolare ? s.codiceFiscale : mascheraCf(s.codiceFiscale)}</Voce>
            <Voce etichetta="Nato il">{fmtData(s.dataNascita)}</Voce>
            <Voce etichetta="A">{s.luogoNascita}</Voce>
            {!titolare && <p className="col-span-2 text-xs text-muted-foreground">I dati completi li vede chi ha la richiesta in coda.</p>}
        </div>
    );
};

const DatiAutocandidatura = ({ voce }) => {
    const a = voce.raw;
    return (
        <div className="grid grid-cols-2 gap-4">
            <Voce etichetta="Inquilino">{voce.cliente}</Voce>
            <Voce etichetta="Pagata il">{fmtData(a.pagamento?.pagataIl)} · {fmtEuro(a.pagamento?.importo || PRODOTTI.P7.prezzo)}</Voce>
            <Voce etichetta="Inviata a CRIA">{a.inviataIl ? fmtData(a.inviataIl) : 'Non ancora'}</Voce>
            <Voce etichetta="Ubicazione">{etichettaProvincia(voce.provincia) || '—'}</Voce>
        </div>
    );
};

const DatiContratto = ({ voce }) => {
    const c = voce.raw;
    return (
        <div className="grid grid-cols-2 gap-4">
            <Voce etichetta="Proprietario">{c.locatore.nome}</Voce>
            <Voce etichetta="Inquilino">{c.conduttore.nome}</Voce>
            <Voce etichetta="Canone">{fmtEuro(c.canone)}/mese</Voce>
            <Voce etichetta="Attivo da">{nomeMese(c.attivoDal)}</Voce>
        </div>
    );
};

const Referenze = ({ voce }) => (
    <Card>
        <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><UserCheck className="w-5 h-5" /> Referenze del precedente proprietario</CardTitle>
            <p className="text-xs text-muted-foreground">Partono solo se le chiede l’inquilino. CRIA contatta al recapito del contratto, fino a {TENTATIVI_REFERENZA} tentativi su canali diversi in 10 giorni lavorativi.</p>
        </CardHeader>
        <CardContent className="space-y-3">
            {voce.referenze.length === 0 ? <p className="text-sm text-muted-foreground">Nessuna referenza chiesta.</p> : voce.referenze.map(r => (
                <div key={r.id} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">{r.proprietario.nome}</p>
                            <p className="text-xs text-muted-foreground">{r.immobile} · {periodoMesi(r.dal, r.al)} · chiesta il {fmtData(r.richiestaIl)}</p>
                        </div>
                        <Pill classe={`border ${STATI_REFERENZA[r.stato]?.classe || ''}`}>{r.etichettaStato}</Pill>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {r.tentativi.map((t, i) => {
                            const Icona = ICONA_CANALE[t.canale] || Mail;
                            return <span key={`${t.canale}-${i}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Icona className="w-3.5 h-3.5" /> {CANALI_CONTATTO[t.canale]} {fmtData(t.il)}</span>;
                        })}
                    </div>
                    {r.stato === 'in_attesa' && <p className="text-xs text-muted-foreground">Tentativi: {r.tentativi.length} su {TENTATIVI_REFERENZA} · senza risposta si chiude il {fmtData(r.scadenza)}</p>}
                    {r.risposta?.mesi && (
                        <p className="text-xs text-amber-900">Non conferma i mesi {r.risposta.mesi.map(m => nomeMese(m).toLowerCase()).join(', ')}, con: {r.risposta.documenti.map(d => d.nome).join(', ')}.</p>
                    )}
                    {r.replica && <p className="text-xs text-foreground">L’inquilino ha risposto il {fmtData(r.replica.il)} con {r.replica.file}.</p>}
                </div>
            ))}
        </CardContent>
    </Card>
);

// La traccia: ogni passaggio con chi e quando. Le date sono quelle della demo.
const eventiDi = (voce, letture) => {
    const e = [];
    const arrivo = { pratica: 'Pratica aperta dal proprietario, quota di iscrizione pagata', autocandidatura: 'Autocandidatura aperta e pagata', verifica: 'Richiesta e pagata dal cliente', contratto: 'Pratica deliberata' }[voce.tipo];
    if (voce.tipo !== 'contratto') e.push({ il: voce.arrivataIl, testo: arrivo });
    if (voce.tipo === 'pratica' && voce.raw.candidato) e.push({ il: voce.raw.candidato.invitatoIl, testo: `Link personale mandato a ${voce.raw.candidato.nome}` });
    if (voce.tipo === 'autocandidatura' && voce.raw.inviataIl) e.push({ il: voce.raw.inviataIl, testo: 'Prove inviate a CRIA' });
    const a = voce.assegnazione;
    if (voce.tipo !== 'contratto' && a.auto.operatoreId) e.push({ il: voce.arrivataIl, testo: `Il motore la assegna a ${nomeOperatore(a.auto.operatoreId)}` });
    if (a.forzata) e.push({ il: a.forzata.il, seq: a.forzata.seq, testo: `${nomeOperatore(a.forzata.da)} la sposta a ${nomeOperatore(a.forzata.operatoreId)}: «${a.forzata.motivo}»` });
    voce.documenti.forEach(d => d.storico.forEach(r => e.push({
        il: r.il, seq: r.seq, testo: `${d.etichetta}: ${r.esito === 'conforme' ? 'conforme' : 'non conforme, file cancellato'} · ${nomeOperatore(r.da)}`,
    })));
    letture.filter(l => l.chiave === voce.chiave).forEach(l => e.push({ il: l.il, seq: l.seq, testo: `${l.documento} aperto da ${nomeOperatore(l.da)}` }));
    const d = voce.delibera;
    if (d && d.deliberataIl) {
        e.push({
            il: d.deliberataIl,
            seq: d.seq ?? Number.MAX_SAFE_INTEGER,
            testo: d.daAltrove ? `Conclusa: ${ESITI[d.esito]?.etichetta.toLowerCase()}` : `${voce.tipo === 'verifica' ? 'Esito pubblicato' : `Delibera: ${ESITI[d.esito]?.etichetta.toLowerCase()}`}${d.dissenso ? ', con dissenso' : ''} · ${nomeOperatore(d.deliberataDa)}`,
        });
    }
    const sensibile = voce.documenti.find(x => x.sensibile && x.stato !== 'non_conforme');
    if (sensibile && voce.conclusaIl) {
        const t = conservazione(sensibile, voce.conclusaIl);
        if (t.cancellatoIl) e.push({ il: t.cancellatoIl, testo: 'Il job cancella movimenti e reddito: restano gli indicatori' });
        if (t.il) e.push({ il: t.il, testo: 'Il job cancellerà movimenti e reddito', futuro: true });
    }
    // Stessa data: prima quello che non ha un numero d'ordine (arrivo, assegnazione), poi le azioni nell'ordine in cui sono state fatte.
    return e.map((x, i) => ({ ...x, i })).sort((x, y) => x.il.localeCompare(y.il) || (x.seq ?? -1) - (y.seq ?? -1) || x.i - y.i);
};

const Traccia = ({ voce, letture }) => {
    const eventi = eventiDi(voce, letture);
    return (
        <Card>
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><History className="w-5 h-5" /> Traccia</CardTitle></CardHeader>
            <CardContent>
                <ol className="relative ml-1.5 border-l border-border">
                    {eventi.map((x, i) => (
                        <li key={`${x.il}-${i}`} className="ml-5 pb-4 last:pb-0">
                            <span className={`absolute -left-1.5 mt-0.5 w-3 h-3 rounded-full border-2 border-background ${x.futuro ? 'bg-background border-dashed border-muted-foreground/60' : 'bg-muted-foreground/40'}`} />
                            <p className="text-xs text-muted-foreground">{x.futuro ? 'In programma · ' : ''}{fmtData(x.il)}</p>
                            <p className="text-sm text-foreground">{x.testo}</p>
                        </li>
                    ))}
                </ol>
            </CardContent>
        </Card>
    );
};

const DettaglioIstruttoria = ({ voce, letture, lingue, operatoreId, tornaA }) => {
    const esito = voce.delibera?.esito;
    const titolare = voce.assegnazione.operatoreId === operatoreId && voce.fase !== 'deliberata';
    const badge = voce.fase === 'deliberata'
        ? esito && <Pill classe={ESITI[esito]?.classe} className="text-sm px-3 py-1">{ESITI[esito]?.etichetta}</Pill>
        : <Pill classe={FASI[voce.fase].classe} className="text-sm px-3 py-1">{voce.tipo === 'verifica' ? 'Da pubblicare' : FASI[voce.fase].etichetta}</Pill>;

    return (
        <div className="space-y-6">
            <IntestazionePagina
                indietro={{ to: tornaA || PERCORSO_ISTRUTTORIA, label: 'Istruttoria' }}
                titolo={voce.titolo}
                sottotitolo={voce.sottotitolo}
                badge={<span className="flex flex-wrap items-center gap-2">{badge}{COLORE_PRODOTTO[voce.prodotto] && <Pill classe={COLORE_PRODOTTO[voce.prodotto]}>{nomeProdotto(voce.prodotto)}</Pill>}</span>}
            />

            <Card className={voce.fase === 'deliberata' ? '' : 'border-[#1A2D52]/30'}>
                <CardContent className="pt-5 pb-5 flex items-start gap-4 flex-wrap">
                    {voce.fase === 'deliberata' ? <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" /> : voce.blocco ? <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" /> : <Clock className="w-6 h-6 text-[#1A2D52] flex-shrink-0" />}
                    <div className="flex-1 min-w-[14rem] space-y-1">
                        <p className="text-sm font-medium text-foreground">{voce.statoTesto}</p>
                        {voce.termine && (
                            <p className="text-xs text-muted-foreground">Termine: <Termine termine={voce.termine} /> <span className="text-muted-foreground">({voce.termine.perche})</span></p>
                        )}
                        {voce.fase !== 'deliberata' && voce.blocco && <p className="text-xs text-amber-800">{voce.blocco}</p>}
                        {voce.fase === 'da_deliberare' && !voce.blocco && voce.tipo !== 'verifica' && <p className="text-xs text-green-700">Documenti verificati: si può deliberare.</p>}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6 min-w-0">
                    <DocumentiIstruttoria voce={voce} />
                    {voce.tipo === 'autocandidatura' && <Referenze voce={voce} />}
                    <DeliberaIstruttoria voce={voce} />
                </div>
                <div className="space-y-6 min-w-0">
                    <AssegnazioneIstruttoria voce={voce} lingue={lingue} />
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Home className="w-5 h-5" /> Dati</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {voce.tipo === 'pratica' && <DatiPratica voce={voce} />}
                            {voce.tipo === 'verifica' && <DatiVerifica voce={voce} titolare={titolare} />}
                            {voce.tipo === 'autocandidatura' && <DatiAutocandidatura voce={voce} />}
                            {voce.tipo === 'contratto' && <DatiContratto voce={voce} />}
                            <div className="border-t border-border pt-3 space-y-1">
                                <p className="text-xs text-muted-foreground">Complessità: <span className="text-foreground font-medium">{voce.complessita.livello}</span></p>
                                {voce.complessita.fattori.map(f => <p key={f} className="text-xs text-muted-foreground">· {f}</p>)}
                                {voce.tipo === 'pratica' && voce.fase !== 'deliberata' && (
                                    <p className="text-xs text-muted-foreground">Delibera entro {REGOLE_ISTRUTTORIA.giorniLavorativiDelibera} giorni lavorativi dai documenti completi.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Traccia voce={voce} letture={letture} />
                </div>
            </div>
        </div>
    );
};

export default DettaglioIstruttoria;
