import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, ArrowRight, Home, FileText, User, Euro, CheckCircle2, Clock, CircleDashed, BellRing, CreditCard, PenLine, Lock, XCircle } from 'lucide-react';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import FasiPratica from '@/components/aree/FasiPratica';
import NotaMockup from '@/components/NotaMockup';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { usePratiche, aggiornaPratica } from '@/lib/praticheDemo';
import { FASI_PRATICA } from '@/data/pratiche';
import { OGGI } from '@/data/datiDemo';
import { PRODOTTI, nomeProdotto, fmtEuro, calcolaPrezzo, COLORE_PRODOTTO } from '@/data/catalogo';
import { fmtData } from '@/lib/formato';
import { STATO_DOCUMENTO } from '@/lib/etichette';

// ═════════════════════════════════════════════════════════════════════════════
// PRATICHE — P-07
// Dove si trova ogni pratica: documenti · verifica di CRIA · prezzo e pagamento ·
// firma · attiva. Del candidato il proprietario vede quali documenti mancano,
// non i documenti.
// ═════════════════════════════════════════════════════════════════════════════

const BASE = '/dashboard/locatore/pratiche';
const etichettaFase = (stato) => (stato === 'respinta' ? 'Non approvata' : FASI_PRATICA.find(f => f.id === stato)?.etichetta || stato);
const mancanti = (p) => (p.candidato?.documenti || []).filter(d => d.stato !== 'caricato');

const prossimoPasso = (p) => {
    switch (p.stato) {
        case 'documenti': return !p.candidato
            ? 'Invita l’inquilino: finché non carica i suoi documenti la verifica non parte'
            : mancanti(p).length ? `Mancano ${mancanti(p).length} documenti di ${p.candidato.nome}` : 'Documenti completi: la verifica parte a breve';
        case 'istruttoria': return 'Una persona del team CRIA sta controllando i documenti';
        case 'pagamento': return 'Verifica conclusa: il prezzo è pronto da pagare';
        case 'firma': return 'Pagamento ricevuto: manca la tua firma';
        case 'respinta': return 'CRIA non ha approvato il candidato: puoi proporne un altro';
        default: return 'Pratica completata';
    }
};

const ElencoPratiche = ({ pratiche }) => {
    const navigate = useNavigate();
    return (
        <div className="space-y-6">
            <IntestazionePagina
                titolo="Pratiche"
                sottotitolo="Gli immobili che stai mettendo su CRIA, dalla quota di iscrizione alla firma"
                azioni={<Link to="/scegli-prodotto"><Button className="gap-2"><Plus className="w-4 h-4" /> Aggiungi immobile</Button></Link>}
            />
            {pratiche.length === 0 ? (
                <Card><CardContent className="py-14 text-center space-y-3">
                    <p className="text-sm text-muted-foreground">Non hai pratiche in corso.</p>
                    <Link to="/scegli-prodotto"><Button variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Aggiungi un immobile</Button></Link>
                </CardContent></Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pratiche.map(p => (
                        <Card key={p.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`${BASE}/${p.id}`)}>
                            <CardContent className="pt-5 pb-5 space-y-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-foreground">{p.immobile.indirizzo}</p>
                                        <p className="text-xs text-muted-foreground">{p.immobile.cap} {p.immobile.citta} · aperta il {fmtData(p.apertaIl)}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${COLORE_PRODOTTO[p.prodotto]}`}>{nomeProdotto(p.prodotto)}</span>
                                </div>
                                <FasiPratica stato={p.stato} compatto />
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{etichettaFase(p.stato)}</span> · {prossimoPasso(p)}</p>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

const Voce = ({ etichetta, children }) => (
    <div><p className="text-xs text-muted-foreground mb-0.5">{etichetta}</p><p className="font-medium text-foreground">{children || '—'}</p></div>
);

const DettaglioPratica = ({ p }) => {
    const prezzo = calcolaPrezzo(p.prodotto, p.canone);
    const prod = PRODOTTI[p.prodotto];
    // L'istruttoria può allungare la franchigia (per esempio con lo storico autodichiarato, §15.2).
    const franchigia = p.istruttoria?.franchigiaMesi ?? prod.franchigiaMesi;
    const doc = mancanti(p);

    const azione = {
        documenti: p.candidato && doc.length > 0 && (
            <Button variant="outline" className="gap-2" onClick={() => toast.success(`Promemoria mandato a ${p.candidato.nome}, via SMS ed email`)}>
                <BellRing className="w-4 h-4" /> Ricorda a {p.candidato.nome.split(' ')[0]}
            </Button>
        ),
        pagamento: <Link to={`/checkout/${p.id}`}><Button className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]"><CreditCard className="w-4 h-4" /> Vai al pagamento</Button></Link>,
        firma: <Link to={`/firma/${p.id}`}><Button className="gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]"><PenLine className="w-4 h-4" /> Firma il contratto di servizio</Button></Link>,
    }[p.stato];

    const testoOra = {
        documenti: !p.candidato
            ? 'Manca l’invito all’inquilino: quando lo mandi, riceve un link personale per caricare i suoi documenti.'
            : doc.length ? `Aspettiamo ${doc.length} ${doc.length === 1 ? 'documento' : 'documenti'} di ${p.candidato.nome}. Appena ci sono tutti, la verifica parte da sola.` : 'I documenti ci sono tutti: la verifica parte a breve.',
        istruttoria: 'Una persona del team CRIA sta controllando i documenti tuoi e dell’inquilino. Ti avvisiamo appena decide.',
        pagamento: `Verifica conclusa il ${fmtData(p.istruttoria?.conclusaIl)}: ${p.istruttoria?.nota || 'approvata.'} Il prezzo è pronto: quando paghi, si congela.`,
        firma: `Pagamento ricevuto il ${fmtData(p.pagamento?.pagataIl)}. Manca la firma del contratto di servizio, che fai qui in piattaforma con un codice via SMS.`,
        attiva: `Firmato il ${fmtData(p.firma?.firmataIl || OGGI)}. La pratica è attiva: da qui in avanti l’immobile lo segui dalla panoramica.`,
        respinta: `Verifica conclusa il ${fmtData(p.istruttoria?.conclusaIl)}: ${p.istruttoria?.nota || 'il candidato non è stato approvato.'} Per lo stesso immobile puoi proporre un altro candidato.`,
    }[p.stato];

    return (
        <div className="space-y-6">
            <IntestazionePagina
                indietro={{ to: BASE, label: 'Pratiche' }}
                titolo={p.immobile.indirizzo}
                sottotitolo={`${p.immobile.cap} ${p.immobile.citta} · pratica aperta il ${fmtData(p.apertaIl)} · quota di iscrizione pagata il ${fmtData(p.quotaPagataIl)}`}
                badge={<span className={`px-2.5 py-1 rounded-full text-xs font-medium ${COLORE_PRODOTTO[p.prodotto]}`}>{nomeProdotto(p.prodotto)}</span>}
            />

            <FasiPratica stato={p.stato} />

            <Card className={p.stato === 'attiva' ? 'border-green-300 bg-green-50/40' : p.stato === 'respinta' ? 'border-red-300 bg-red-50/40' : 'border-[#1A2D52]/30'}>
                <CardContent className="pt-5 pb-5 flex items-center gap-4 flex-wrap">
                    {p.stato === 'attiva' ? <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" /> : p.stato === 'respinta' ? <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" /> : <Clock className="w-6 h-6 text-[#1A2D52] flex-shrink-0" />}
                    <div className="flex-1 min-w-[16rem]">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Adesso · {etichettaFase(p.stato)}</p>
                        <p className="text-sm text-foreground mt-0.5">{testoOra}</p>
                    </div>
                    {azione}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><User className="w-5 h-5" /> {p.candidato?.inquilinoAttuale ? 'Inquilino' : 'Candidato inquilino'}</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {!p.candidato ? (
                                <p className="text-sm text-muted-foreground">Non hai ancora invitato nessuno. Quando lo inviti, riceve un link personale per caricare i suoi documenti.</p>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                        <Voce etichetta="Nome">{p.candidato.nome}</Voce>
                                        <Voce etichetta="Invitato il">{fmtData(p.candidato.invitatoIl)}</Voce>
                                        <Voce etichetta="Ultimo accesso al link">{p.candidato.ultimoAccesso ? fmtData(p.candidato.ultimoAccesso) : 'Non ancora aperto'}</Voce>
                                    </div>
                                    <div className="space-y-2">
                                        {p.candidato.documenti.map(d => (
                                            <div key={d.tipo} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
                                                {d.stato === 'caricato' ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" /> : <CircleDashed className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                                                <span className="text-sm text-foreground flex-1">{d.etichetta}</span>
                                                <span className={`text-xs font-medium ${d.stato === 'caricato' ? 'text-green-700' : 'text-muted-foreground'}`}>{d.stato === 'caricato' ? 'Caricato' : 'Manca'}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Vedi quali documenti mancano, non i documenti: li esamina solo CRIA.</p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><FileText className="w-5 h-5" /> I tuoi documenti</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {p.documentiProprietario.map(d => (
                                <div key={d.tipo} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30">
                                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <span className="text-sm text-foreground flex-1">{d.etichetta}</span>
                                    <span className={`text-xs font-medium ${STATO_DOCUMENTO[d.stato]?.classe}`}>{STATO_DOCUMENTO[d.stato]?.etichetta}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Home className="w-5 h-5" /> Immobile e contratto</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div className="col-span-2"><Voce etichetta="Immobile">{p.immobile.tipologia}{p.immobile.mq ? `, ${p.immobile.mq} m²` : ''} · {p.immobile.catasto}</Voce></div>
                            <Voce etichetta="Canone">{fmtEuro(p.canone)}/mese</Voce>
                            <Voce etichetta="Deposito">{p.deposito ? fmtEuro(p.deposito) : '—'}</Voce>
                            <Voce etichetta={p.contratto === 'esistente' ? 'Inizio' : 'Inizio previsto'}>{fmtData(p.inizio || p.inizioPrevisto)}</Voce>
                            <Voce etichetta="Durata">{p.durata}</Voce>
                            {p.registrazione && <div className="col-span-2"><Voce etichetta="Registrazione">{p.registrazione.numero} · {fmtData(p.registrazione.data)}</Voce></div>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Euro className="w-5 h-5" /> Prezzo</CardTitle></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {prezzo.voci.map(v => (
                                <div key={v.etichetta} className="flex justify-between gap-3">
                                    <span className="text-muted-foreground">{v.etichetta}<span className="block text-xs">{v.nota}</span></span>
                                    <span className="text-foreground tabular-nums whitespace-nowrap">{fmtEuro(v.annuo, 2)}{v.unaVolta ? '' : '/anno'}</span>
                                </div>
                            ))}
                            <div className="flex justify-between gap-3 pt-2 border-t border-border font-semibold text-foreground"><span>{prezzo.unaVolta ? 'Totale' : 'Totale annuo'}</span><span className="tabular-nums">{fmtEuro(prezzo.annuo, 2)}</span></div>
                            <p className="text-xs text-muted-foreground pt-1">
                                {p.pagamento?.prezzoCongelato ? `Congelato il ${fmtData(p.pagamento.pagataIl)}: se il listino cambia, il tuo contratto no.` : 'Dal listino di oggi: si congela quando paghi.'}
                                {prod.garanzia ? ` Garanzia con franchigia di ${franchigia} ${franchigia === 1 ? 'mese' : 'mesi'}.` : ' Senza garanzia.'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {(p.stato === 'documenti' || p.stato === 'istruttoria') && (
                <NotaMockup>
                    {p.candidato?.token && (
                        <p className="mb-2">Il link personale del candidato: <Link className="underline font-medium" to={`/candidato/${p.candidato.token}`}>apri come lo vede {p.candidato.nome.split(' ')[0]}</Link></p>
                    )}
                    {p.stato === 'documenti' ? (
                        <button type="button" className="underline font-medium" onClick={() => aggiornaPratica(p.id, {
                            stato: 'istruttoria',
                            candidato: p.candidato ? { ...p.candidato, ultimoAccesso: OGGI, documenti: p.candidato.documenti.map(d => ({ ...d, stato: 'caricato' })) } : p.candidato,
                        })}>
                            Simula: {p.candidato ? `${p.candidato.nome} carica tutti i documenti` : 'l’inquilino è invitato e carica tutto'}
                        </button>
                    ) : (
                        <button type="button" className="underline font-medium" onClick={() => aggiornaPratica(p.id, {
                            stato: 'pagamento',
                            istruttoria: { conclusaIl: OGGI, esito: 'approvata', nota: 'documenti in ordine, garanzia con la franchigia standard.' },
                        })}>
                            Simula: CRIA conclude la verifica e approva
                        </button>
                    )}
                </NotaMockup>
            )}
        </div>
    );
};

const PraticheLocatorePage = () => {
    const { id } = useParams();
    const { persona } = useAuth();
    const { pratiche, trova } = usePratiche(persona?.id);

    if (id) {
        const p = trova(id);
        if (!p) {
            return (
                <div className="space-y-6">
                    <IntestazionePagina titolo="Pratica non trovata" indietro={{ to: BASE, label: 'Pratiche' }} />
                    <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Questa pratica non è tra le tue.</CardContent></Card>
                </div>
            );
        }
        return (<><Helmet><title>Pratica {p.immobile.indirizzo} - CRIA</title></Helmet><DettaglioPratica p={p} /></>);
    }
    return (<><Helmet><title>Pratiche - CRIA</title></Helmet><ElencoPratiche pratiche={pratiche} /></>);
};

export default PraticheLocatorePage;
