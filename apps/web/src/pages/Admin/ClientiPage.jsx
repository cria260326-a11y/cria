import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, X, ChevronRight, Building2, Home, ShieldCheck, User, UserRound, Users, UserX, GitMerge, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StatusBadge from '@/components/StatusBadge.jsx';
import { PRODOTTI } from '@/data/catalogo';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import Contatore from '@/components/aree/Contatore';
import NotaMockup from '@/components/NotaMockup';
import { Chip, VistaRistretta } from '@/components/admin/anagrafica/ElementiScheda';
import UtentiDaConfermare from '@/components/admin/anagrafica/UtentiDaConfermare';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import {
    useAnagrafica, livelloAnagrafica, ripristinaAnagraficaDemo, percorsoSoggetto,
    STATO_ACCOUNT, LEGAMI, PERCORSI,
} from '@/lib/anagraficheDemo';

// ═════════════════════════════════════════════════════════════════════════════
// UTENTI — O-02
// Tutte le persone e le società che CRIA conosce, anche senza account: chi è
// parte di un contratto, chi è candidato, chi ha dato una referenza. Una
// persona, un'anagrafica: proprietario e inquilino sono posizioni sui
// contratti, non tipi di persona (§13.2).
// Da qui si crea anche un utente, e in cima ci sono quelli che aspettano la
// conferma di un responsabile diverso da chi li ha preparati.
// ═════════════════════════════════════════════════════════════════════════════

const SENZA_ACCOUNT = ['senza_account', 'invitato'];

const selectClasse = 'text-sm border border-border rounded-lg px-3 py-2 bg-background w-full sm:w-auto';

const IconaTipo = ({ tipo }) => (tipo === 'giuridica'
    ? <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-label="Persona giuridica" />
    : <User className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-label="Persona fisica" />);

const Legami = ({ s }) => (s.legami.length === 0
    ? <span className="text-xs text-muted-foreground">Nessun legame</span>
    : (
        <div className="flex flex-wrap gap-1">
            {s.legami.map(l => <Chip key={l.id} classe="bg-muted text-foreground">{l.etichetta}</Chip>)}
        </div>
    ));

const DaRivedere = () => (
    <Link to={PERCORSI.revisione} onClick={e => e.stopPropagation()}>
        <Chip classe="bg-amber-100 text-amber-800 hover:bg-amber-200">Da rivedere</Chip>
    </Link>
);

const ClientiPage = () => {
    const navigate = useNavigate();
    const { operatore } = useOperatoreAttivo();
    const livello = livelloAnagrafica(operatore.funzione);
    const modello = useAnagrafica();

    const [cerca, setCerca] = useState('');
    const [fTipo, setFTipo] = useState('tutti');
    const [fAccount, setFAccount] = useState('tutti');
    const [fLegame, setFLegame] = useState('tutti');
    const [soloDaRivedere, setSoloDaRivedere] = useState(false);

    // Chi è in una coppia aperta o ha un codice fiscale provvisorio.
    const daRivedere = useMemo(() => new Set([
        ...modello.coppie.filter(c => !c.esito).flatMap(c => [c.a, c.b]),
        ...modello.provvisori.map(p => p.soggetto.id),
    ]), [modello]);

    const soggetti = modello.attivi;
    const filtrati = useMemo(() => {
        const q = cerca.trim().toLowerCase();
        // Le anagrafiche archiviate non si mescolano alle altre: si vedono solo se si chiedono.
        return (fAccount === 'archiviati' ? modello.archiviati : soggetti).filter(s => {
            if (q) {
                // Anche i codici precedenti: chi cerca col vecchio codice provvisorio trova la stessa persona.
                const testo = [s.nomeCompleto, s.codiceFiscale, s.partitaIva, s.email, s.telefono, ...s.codiciPrecedenti.map(c => c.codice)]
                    .filter(Boolean).join(' ').toLowerCase();
                if (!testo.includes(q)) return false;
            }
            if (fTipo !== 'tutti' && s.tipo !== fTipo) return false;
            if (fAccount === 'con' && SENZA_ACCOUNT.includes(s.account.stato)) return false;
            if (fAccount === 'senza' && !SENZA_ACCOUNT.includes(s.account.stato)) return false;
            if (fLegame !== 'tutti' && !s.legami.some(l => l.id === fLegame)) return false;
            if (soloDaRivedere && !daRivedere.has(s.id)) return false;
            return true;
        });
    }, [soggetti, modello.archiviati, cerca, fTipo, fAccount, fLegame, soloDaRivedere, daRivedere]);

    const filtriAttivi = cerca || fTipo !== 'tutti' || fAccount !== 'tutti' || fLegame !== 'tutti' || soloDaRivedere;
    const azzera = () => { setCerca(''); setFTipo('tutti'); setFAccount('tutti'); setFLegame('tutti'); setSoloDaRivedere(false); };
    const apri = (id) => navigate(percorsoSoggetto(id));

    // Proprietario, inquilino e cliente sono posizioni: si contano dai legami.
    const conLegame = (id) => soggetti.filter(s => s.legami.some(l => l.id === id)).length;
    const contatori = (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Contatore etichetta="Utenti" nota={`su ${soggetti.length} soggetti conosciuti`} valore={soggetti.filter(s => !SENZA_ACCOUNT.includes(s.account.stato)).length} icona={Users} colore="bg-[#1A2D52]" />
            <Contatore etichetta="Proprietari" nota="con un immobile su CRIA" valore={conLegame('proprietario')} icona={Home} colore="bg-blue-500" />
            <Contatore etichetta="Inquilini" nota="in un contratto seguito da CRIA" valore={conLegame('inquilino')} icona={UserRound} colore="bg-emerald-600" />
            <Contatore etichetta="Clienti Verifica" nota={`hanno comprato ${PRODOTTI.P3.nome}`} valore={conLegame('cliente_verifica')} icona={ShieldCheck} colore="bg-violet-500" />
            <Contatore etichetta="Senza account" nota="compresi gli invitati" valore={soggetti.filter(s => SENZA_ACCOUNT.includes(s.account.stato)).length} icona={UserX} colore="bg-gray-500" />
            <Contatore etichetta="Da rivedere" nota="doppioni e codici provvisori" valore={daRivedere.size} icona={GitMerge} colore="bg-amber-500" />
        </div>
    );

    const intestazione = (
        <IntestazionePagina
            titolo="Utenti"
            sottotitolo="Le persone e le società che CRIA conosce, con o senza account. Proprietario e inquilino sono posizioni sui contratti, non tipi di persona."
            azioni={livello === 'L' && (
                <>
                    {daRivedere.size > 0 && (
                        <Button asChild variant="outline" size="sm" className="gap-2">
                            <Link to={PERCORSI.revisione}><GitMerge className="w-4 h-4" /> Revisione anagrafiche ({daRivedere.size})</Link>
                        </Button>
                    )}
                    <Button asChild size="sm" className="gap-2">
                        <Link to={`${PERCORSI.soggetti}/nuovo`}><UserPlus className="w-4 h-4" /> Crea utente</Link>
                    </Button>
                </>
            )}
        />
    );

    if (livello !== 'L') {
        return (
            <>
                <Helmet><title>Utenti - CRIA</title></Helmet>
                <div className="space-y-6">
                    {intestazione}
                    {livello === 'agg' && contatori}
                    <VistaRistretta livello={livello} />
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet><title>Utenti - CRIA</title></Helmet>
            <div className="space-y-6">
                {intestazione}
                <UtentiDaConfermare modello={modello} />
                {contatori}

                <Card>
                    <CardContent className="pt-4 pb-4">
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="relative w-full sm:flex-1 sm:min-w-56">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Nome, codice fiscale, email…"
                                    value={cerca}
                                    onChange={e => setCerca(e.target.value)}
                                    className="pl-9"
                                    aria-label="Cerca un soggetto"
                                />
                            </div>
                            <select value={fTipo} onChange={e => setFTipo(e.target.value)} className={selectClasse} aria-label="Tipo di soggetto">
                                <option value="tutti">Persone fisiche e giuridiche</option>
                                <option value="fisica">Solo persone fisiche</option>
                                <option value="giuridica">Solo persone giuridiche</option>
                            </select>
                            <select value={fAccount} onChange={e => setFAccount(e.target.value)} className={selectClasse} aria-label="Account">
                                <option value="tutti">Con e senza account</option>
                                <option value="con">Con account</option>
                                <option value="senza">Senza account</option>
                                <option value="archiviati">Archiviate</option>
                            </select>
                            <select value={fLegame} onChange={e => setFLegame(e.target.value)} className={selectClasse} aria-label="Legame">
                                <option value="tutti">Tutti i legami</option>
                                {Object.entries(LEGAMI).map(([id, etichetta]) => <option key={id} value={id}>{etichetta}</option>)}
                            </select>
                            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                                <input type="checkbox" checked={soloDaRivedere} onChange={e => setSoloDaRivedere(e.target.checked)} className="w-4 h-4 accent-amber-600" />
                                Solo da rivedere
                            </label>
                            {filtriAttivi && (
                                <Button variant="ghost" size="sm" onClick={azzera}><X className="w-3.5 h-3.5 mr-1" /> Azzera</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {filtrati.length === 0 ? (
                    <Card><CardContent className="py-14 text-center text-sm text-muted-foreground">Nessun soggetto con questi filtri.</CardContent></Card>
                ) : (
                    <>
                        {/* Da md in su: tabella. Sotto: una scheda per soggetto. */}
                        <Card className="hidden md:block">
                            <CardContent className="p-0 overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="border-b border-border bg-muted/40">
                                        <tr className="text-left text-xs font-semibold text-muted-foreground uppercase">
                                            <th className="px-4 py-3">Soggetto</th>
                                            <th className="px-4 py-3">Codice fiscale</th>
                                            <th className="px-4 py-3">Account</th>
                                            <th className="px-4 py-3">Legami</th>
                                            <th className="px-4 py-3">Come inquilino</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filtrati.map(s => (
                                            <tr key={s.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => apri(s.id)}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <IconaTipo tipo={s.tipo} />
                                                        <Link to={percorsoSoggetto(s.id)} onClick={e => e.stopPropagation()} className="font-medium text-foreground hover:underline">{s.nomeCompleto}</Link>
                                                        {daRivedere.has(s.id) && <DaRivedere />}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5 ml-6">{s.origineBreve}</p>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">{s.codiceFiscale || <span className="text-muted-foreground font-sans">—</span>}</td>
                                                <td className="px-4 py-3"><Chip classe={STATO_ACCOUNT[s.account.stato].classe}>{STATO_ACCOUNT[s.account.stato].breve}</Chip></td>
                                                <td className="px-4 py-3"><Legami s={s} /></td>
                                                <td className="px-4 py-3">{s.inquilino ? <StatusBadge status={s.inquilino.analisi.semaforo} /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                                                <td className="px-4 py-3 text-right"><ChevronRight className="w-4 h-4 text-muted-foreground inline" /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        <div className="md:hidden space-y-3">
                            {filtrati.map(s => (
                                <Card key={s.id}>
                                    <Link to={percorsoSoggetto(s.id)} className="block">
                                        <CardContent className="pt-4 pb-4 space-y-2.5">
                                            <div className="flex items-start gap-2">
                                                <IconaTipo tipo={s.tipo} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-foreground">{s.nomeCompleto}</p>
                                                    <p className="text-xs text-muted-foreground">{s.origineBreve}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                            </div>
                                            {s.codiceFiscale && <p className="font-mono text-xs text-foreground break-all">{s.codiceFiscale}</p>}
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <Chip classe={STATO_ACCOUNT[s.account.stato].classe}>{STATO_ACCOUNT[s.account.stato].breve}</Chip>
                                                {s.inquilino && <StatusBadge status={s.inquilino.analisi.semaforo} />}
                                                {daRivedere.has(s.id) && <Chip classe="bg-amber-100 text-amber-800">Da rivedere</Chip>}
                                            </div>
                                            <Legami s={s} />
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    </>
                )}

                <p className="text-xs text-muted-foreground">
                    {fAccount === 'archiviati'
                        ? `${filtrati.length} ${filtrati.length === 1 ? 'anagrafica archiviata' : 'anagrafiche archiviate'}: ognuna rimanda all’utente che la sostituisce`
                        : filtrati.length === soggetti.length ? `${soggetti.length} soggetti` : `${filtrati.length} di ${soggetti.length} soggetti`}.
                    {' '}Il semaforo è della persona come inquilino, su tutti i suoi contratti. Commerciali, avvocati e colleghi interni non sono soggetti dell’anagrafica: stanno in{' '}
                    <Link to="/dashboard/admin/collaboratori" className="underline hover:text-foreground">Collaboratori</Link>.
                </p>

                <NotaMockup>
                    <p>Le anagrafiche che non sono persone demo — Davide Colombo, Chiara Lombardi, i candidati, gli utenti creati da CRIA — non hanno un accesso di prova. Utenti creati, inviti e codici registrati restano in questo browser.</p>
                    <button type="button" className="underline font-medium mt-2" onClick={() => { ripristinaAnagraficaDemo(); toast.success('Anagrafica demo ripristinata'); }}>
                        Ripristina l’anagrafica demo
                    </button>
                </NotaMockup>
            </div>
        </>
    );
};

export default ClientiPage;
