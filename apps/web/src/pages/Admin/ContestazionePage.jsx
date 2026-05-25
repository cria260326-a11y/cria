import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ChatThread from '@/components/ChatThread';
import {
    ArrowLeft, ChevronRight, Clock, CheckCircle2, XCircle,
    Search, FileText, Scale, Eye, Users, Shield
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Mock contestazioni ────────────────────────────────────────────────────────
// Modello dati nuovo:
//   - locatori[]: anagrafiche (uno solo ha account_titolare = true)
//   - inquilini[]: anagrafiche (uno solo ha account_titolare = true)
//   - messaggi[]: ognuno ha un campo `canale: 'locatori' | 'inquilini'`
//     I messaggi del canale 'locatori' sono visibili solo a locatori + admin + avvocato
//     I messaggi del canale 'inquilini' sono visibili solo a inquilini + admin + avvocato
//
// Nei messaggi: il ruolo identifica la "parte" (sistema | admin | avvocato | locatore | inquilino)
const CONTESTAZIONI_INIZIALI = [
    {
        id: 1,
        immobile: 'Via Roma 42, Milano',
        mese: 'Marzo 2026',
        dataApertura: '2026-03-28',
        motivo: 'Mancato pagamento',
        stato: 'in verifica',
        locatori: [
            { nome: 'Marco Bianchi', email: 'marco.bianchi@email.it', telefono: '+39 333 1234567', accountTitolare: true },
        ],
        inquilini: [
            { nome: 'Sofia Martini', email: 'sofia.martini@email.it', telefono: '+39 347 9876543', accountTitolare: true },
        ],
        avvocato: null,
        documenti: [
            { id: 1, nome: 'Ricevuta pagamento.pdf', caricatoDa: 'inquilino', data: '2026-03-29', stato: 'da verificare' },
            { id: 2, nome: 'Screenshot bonifico.jpg', caricatoDa: 'inquilino', data: '2026-03-29', stato: 'da verificare' },
            { id: 3, nome: 'Estratto conto Marzo.pdf', caricatoDa: 'locatore', data: '2026-03-30', stato: 'da verificare' },
        ],
        messaggi: [
            // Canale LOCATORI
            { id: 1, canale: 'locatori', mittente: 'Sistema', testo: 'Contestazione aperta da Sofia Martini per mancato pagamento.', data: '2026-03-28 10:00', ruolo: 'sistema' },
            { id: 2, canale: 'locatori', mittente: 'Marco Bianchi', testo: 'Confermo: non ho ricevuto nessun accredito sul mio conto per Marzo.', data: '2026-03-29 09:00', ruolo: 'locatore' },
            { id: 3, canale: 'locatori', mittente: 'Admin CRIA', testo: 'Stiamo verificando con la documentazione fornita dall\'inquilino. Vi aggiorniamo a breve.', data: '2026-03-30 11:00', ruolo: 'admin' },

            // Canale INQUILINI
            { id: 4, canale: 'inquilini', mittente: 'Sistema', testo: 'Contestazione aperta. Carica i documenti che provano il pagamento.', data: '2026-03-28 10:00', ruolo: 'sistema' },
            { id: 5, canale: 'inquilini', mittente: 'Sofia Martini', testo: 'Ho pagato il bonifico il 3 Marzo. Allego ricevuta e screenshot.', data: '2026-03-28 10:30', ruolo: 'inquilino' },
            { id: 6, canale: 'inquilini', mittente: 'Admin CRIA', testo: 'Documenti ricevuti. Stiamo verificando con la banca dell\'altra parte.', data: '2026-03-30 11:00', ruolo: 'admin' },
        ],
        note: '',
    },
    {
        id: 2,
        immobile: 'Piazza Navona 23, Roma',
        mese: 'Marzo 2026',
        dataApertura: '2026-03-18',
        motivo: 'Mancato pagamento',
        stato: 'aperta',
        locatori: [
            { nome: 'Sara Conti', email: 'sara.conti@email.it', telefono: '+39 347 2345678', accountTitolare: true },
        ],
        inquilini: [
            { nome: 'Marco Esposito', email: 'marco.esposito@email.it', telefono: '+39 347 1234500', accountTitolare: true },
            { nome: 'Davide Romano', email: 'davide.romano@email.it', telefono: '+39 347 1234511', accountTitolare: false },
        ],
        avvocato: { nome: 'Avv. Paolo Conti', email: 'p.conti@studioconti.it' },
        documenti: [
            { id: 1, nome: 'Contratto locazione.pdf', caricatoDa: 'locatore', data: '2026-03-19', stato: 'verificato' },
        ],
        messaggi: [
            { id: 1, canale: 'inquilini', mittente: 'Sistema', testo: 'Contestazione aperta da Marco Esposito.', data: '2026-03-18 14:00', ruolo: 'sistema' },
            { id: 2, canale: 'inquilini', mittente: 'Marco Esposito', testo: 'Il pagamento è stato effettuato regolarmente. Chiedo verifica urgente.', data: '2026-03-18 14:30', ruolo: 'inquilino' },
            { id: 3, canale: 'locatori', mittente: 'Sistema', testo: 'Contestazione aperta. È stato assegnato un avvocato CRIA.', data: '2026-03-18 14:00', ruolo: 'sistema' },
        ],
        note: 'Caso complesso — assegnato ad avvocato. Coinquilini cointestatari coinvolti per responsabilità solidale.',
    },
    {
        id: 3,
        immobile: 'Via Libertà 4, Monza',
        mese: 'Febbraio 2026',
        dataApertura: '2026-02-15',
        motivo: 'Mancato pagamento',
        stato: 'risolta',
        esito: 'favore_locatore',
        locatori: [
            { nome: 'Davide Ricci', email: 'davide.ricci@email.it', telefono: '+39 348 7890123', accountTitolare: true },
        ],
        inquilini: [
            { nome: 'Stefano Bruno', email: 'stefano.bruno@email.it', telefono: '+39 320 5678904', accountTitolare: true },
        ],
        avvocato: null,
        documenti: [],
        messaggi: [
            { id: 1, canale: 'locatori', mittente: 'Sistema', testo: 'Contestazione aperta.', data: '2026-02-15 09:00', ruolo: 'sistema' },
            { id: 2, canale: 'locatori', mittente: 'Admin CRIA', testo: 'Contestazione risolta a favore del locatore — pagamento non trovato.', data: '2026-02-25 15:00', ruolo: 'admin' },
            { id: 3, canale: 'inquilini', mittente: 'Sistema', testo: 'Contestazione aperta.', data: '2026-02-15 09:00', ruolo: 'sistema' },
            { id: 4, canale: 'inquilini', mittente: 'Admin CRIA', testo: 'Contestazione chiusa a favore del locatore — non è stato possibile dimostrare il pagamento.', data: '2026-02-25 15:00', ruolo: 'admin' },
        ],
        note: '',
    },
    // Caso con 2 locatori cointestatari
    {
        id: 4,
        immobile: 'Via Dante 7, Roma',
        mese: 'Aprile 2026',
        dataApertura: '2026-04-05',
        motivo: 'Pagamento contestato',
        stato: 'in verifica',
        locatori: [
            { nome: 'Anna Verdi', email: 'anna.verdi@email.it', telefono: '+39 333 1112233', accountTitolare: true },
            { nome: 'Paolo Verdi', email: 'paolo.verdi@email.it', telefono: '+39 333 1112244', accountTitolare: false },
        ],
        inquilini: [
            { nome: 'Elena Greco', email: 'elena.greco@email.it', telefono: '+39 347 7778899', accountTitolare: true },
        ],
        avvocato: null,
        documenti: [
            { id: 1, nome: 'Bonifico Aprile.pdf', caricatoDa: 'inquilino', data: '2026-04-06', stato: 'da verificare' },
        ],
        messaggi: [
            { id: 1, canale: 'inquilini', mittente: 'Sistema', testo: 'Contestazione aperta da Elena Greco.', data: '2026-04-05 11:00', ruolo: 'sistema' },
            { id: 2, canale: 'inquilini', mittente: 'Elena Greco', testo: 'Il bonifico è stato effettuato il 1° Aprile. Allego ricevuta.', data: '2026-04-05 11:30', ruolo: 'inquilino' },
            { id: 3, canale: 'locatori', mittente: 'Sistema', testo: 'Contestazione aperta. Verificare con la banca se il bonifico è arrivato.', data: '2026-04-05 11:00', ruolo: 'sistema' },
            { id: 4, canale: 'locatori', mittente: 'Anna Verdi', testo: 'Verifichiamo con la banca e vi facciamo sapere.', data: '2026-04-06 09:00', ruolo: 'locatore' },
        ],
        note: '',
    },
];

const fmt = (d) => d ? new Date(d).toLocaleDateString('it-IT') : '—';

const STATO_BADGE = {
    'aperta': 'bg-red-100 text-red-800',
    'in verifica': 'bg-yellow-100 text-yellow-800',
    'risolta': 'bg-green-100 text-green-800',
    'chiusa': 'bg-gray-100 text-gray-600',
};

const ESITO_BADGE = {
    'favore_locatore': 'bg-blue-100 text-blue-800',
    'favore_inquilino': 'bg-purple-100 text-purple-800',
};

const DOC_BADGE = {
    'verificato': 'bg-green-100 text-green-800',
    'da verificare': 'bg-yellow-100 text-yellow-800',
};

// Helper: formato compatto persone per tabella lista
const formatPersone = (persone) => {
    if (!persone || persone.length === 0) return '—';
    if (persone.length === 1) return persone[0].nome;
    return `${persone[0].nome} + ${persone.length - 1}`;
};

// ─── Lista contestazioni ──────────────────────────────────────────────────────
const ListaContestazioni = ({ contestazioni }) => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filtroStato, setFiltro] = useState('tutti');
    const [filtroDa, setDa] = useState('');
    const [filtroA, setA] = useState('');

    const contatori = useMemo(() => ({
        aperte: contestazioni.filter(c => c.stato === 'aperta').length,
        inVerifica: contestazioni.filter(c => c.stato === 'in verifica').length,
        risolte: contestazioni.filter(c => c.stato === 'risolta').length,
    }), [contestazioni]);

    const filtrate = useMemo(() => {
        let list = [...contestazioni];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.immobile.toLowerCase().includes(q) ||
                c.locatori.some(l => l.nome.toLowerCase().includes(q)) ||
                c.inquilini.some(i => i.nome.toLowerCase().includes(q))
            );
        }
        if (filtroStato !== 'tutti') list = list.filter(c => c.stato === filtroStato);
        if (filtroDa) list = list.filter(c => c.dataApertura >= filtroDa);
        if (filtroA) list = list.filter(c => c.dataApertura <= filtroA);
        return list;
    }, [contestazioni, search, filtroStato, filtroDa, filtroA]);

    const hasFilters = search || filtroStato !== 'tutti' || filtroDa || filtroA;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Aperte', value: contatori.aperte, color: 'bg-red-500' },
                    { label: 'In verifica', value: contatori.inVerifica, color: 'bg-yellow-500' },
                    { label: 'Risolte', value: contatori.risolte, color: 'bg-green-500' },
                ].map(({ label, value, color }) => (
                    <Card key={label}>
                        <CardContent className="pt-5 pb-4 flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${color} flex-shrink-0`} />
                            <div>
                                <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
                                <p className="text-xs text-muted-foreground">{label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardContent className="pt-4 pb-4">
                    <div className="flex flex-wrap gap-3 items-end">
                        <div className="relative flex-1 min-w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Cerca immobile, locatore, inquilino..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                className="pl-9" />
                        </div>
                        <select value={filtroStato} onChange={e => setFiltro(e.target.value)}
                            className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none w-40">
                            <option value="tutti">Tutti gli stati</option>
                            <option value="aperta">Aperta</option>
                            <option value="in verifica">In verifica</option>
                            <option value="risolta">Risolta</option>
                            <option value="chiusa">Chiusa</option>
                        </select>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground px-1">Dal</span>
                            <Input type="date" value={filtroDa} onChange={e => setDa(e.target.value)} className="w-36" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground px-1">Al</span>
                            <Input type="date" value={filtroA} onChange={e => setA(e.target.value)} className="w-36" />
                        </div>
                        {hasFilters && (
                            <Button variant="ghost" size="sm"
                                onClick={() => { setSearch(''); setFiltro('tutti'); setDa(''); setA(''); }}>
                                Azzera
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="border-b border-border bg-muted/40">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Data apertura</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Immobile / Mese</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Locatori</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Inquilini</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Motivo</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stato</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Apri</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtrate.length === 0 ? (
                                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Nessuna contestazione trovata.</td></tr>
                            ) : filtrate.map(c => (
                                <tr key={c.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/dashboard/admin/contestazioni/${c.id}`)}>
                                    <td className="px-4 py-3 text-muted-foreground tabular-nums whitespace-nowrap">{fmt(c.dataApertura)}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-foreground text-xs">{c.immobile}</p>
                                        <p className="text-xs text-muted-foreground">{c.mese}</p>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground" title={c.locatori.map(l => l.nome).join(', ')}>
                                        {formatPersone(c.locatori)}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground" title={c.inquilini.map(i => i.nome).join(', ')}>
                                        {formatPersone(c.inquilini)}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.motivo}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATO_BADGE[c.stato]}`}>
                                            {c.stato}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" className="gap-1">
                                            <Eye className="w-3.5 h-3.5" /> Apri
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
};

// ─── Box persona (riusabile) ──────────────────────────────────────────────────
const PersonaBox = ({ titolo, persona, color, isAccountTitolare }) => (
    <div className={`p-4 rounded-xl border ${color} space-y-1 relative`}>
        {isAccountTitolare && (
            <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase bg-white/70 text-foreground border border-current/20">
                <Shield className="w-2.5 h-2.5" />
                Account
            </span>
        )}
        <p className="text-xs font-semibold text-muted-foreground uppercase">{titolo}</p>
        <p className="font-semibold text-foreground">{persona.nome}</p>
        <p className="text-xs text-muted-foreground">{persona.email}</p>
        {persona.telefono && <p className="text-xs text-muted-foreground">{persona.telefono}</p>}
    </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// DETTAGLIO CONTESTAZIONE — con sistema canali separati
// ═════════════════════════════════════════════════════════════════════════════
const DettaglioContestazione = ({ id, contestazioni, setContestazioni }) => {
    const contestazione = contestazioni.find(c => c.id === Number(id));
    const [nota, setNota] = useState(contestazione?.note || '');

    if (!contestazione) return (
        <div className="text-center py-12 text-muted-foreground">Contestazione non trovata.</div>
    );

    // Filtra messaggi per canale
    const messaggiLocatori = contestazione.messaggi.filter(m => m.canale === 'locatori');
    const messaggiInquilini = contestazione.messaggi.filter(m => m.canale === 'inquilini');

    // Determina se l'admin può scrivere in base allo stato
    // - aperta: tutti scrivono
    // - in verifica: solo admin scrive
    // - risolta/chiusa: nessuno scrive
    const canScrivere = contestazione.stato === 'aperta' || contestazione.stato === 'in verifica';

    // Invia messaggio nel canale specificato
    const inviaMessaggio = (testo, canale) => {
        const nuovoMsg = {
            id: Date.now(),
            mittente: 'Admin CRIA',
            testo,
            data: new Date().toLocaleString('it-IT'),
            ruolo: 'admin',
            canale,
        };

        setContestazioni(prev => prev.map(c => c.id === contestazione.id
            ? { ...c, messaggi: [...c.messaggi, nuovoMsg] }
            : c
        ));

        toast.success(`Messaggio inviato al canale ${canale === 'locatori' ? 'Locatori' : 'Inquilini'}`);
    };

    const cambiaStato = (nuovoStato, esito = null) => {
        setContestazioni(prev => prev.map(c => c.id === contestazione.id
            ? { ...c, stato: nuovoStato, ...(esito ? { esito } : {}) }
            : c
        ));
        toast.success(`Contestazione aggiornata: ${nuovoStato}`);
    };

    const verificaDoc = (docId) => {
        setContestazioni(prev => prev.map(c => c.id === contestazione.id
            ? { ...c, documenti: c.documenti.map(d => d.id === docId ? { ...d, stato: 'verificato' } : d) }
            : c
        ));
        toast.success('Documento verificato');
    };

    const salvaNota = () => {
        setContestazioni(prev => prev.map(c => c.id === contestazione.id ? { ...c, note: nota } : c));
        toast.success('Nota salvata');
    };

    const haAvvocato = !!contestazione.avvocato;

    // Calcolo destinatari email per canale
    const numeroLocatori = contestazione.locatori.length;
    const numeroInquilini = contestazione.inquilini.length;

    // Stato readonly: chat in sola lettura
    const readOnlyMsg = contestazione.stato === 'risolta'
        ? 'Chat in sola lettura — contestazione risolta'
        : contestazione.stato === 'chiusa'
            ? 'Chat in sola lettura — contestazione chiusa'
            : '';

    return (
        <div className="space-y-6">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <Link to="/dashboard/admin/contestazioni">
                    <Button variant="ghost" size="sm" className="gap-1 px-2">
                        <ArrowLeft className="w-4 h-4" /> Contestazioni
                    </Button>
                </Link>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{contestazione.immobile} — {contestazione.mese}</span>
            </div>

            {/* Header con titolo + stato */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground">{contestazione.immobile}</h2>
                    <p className="text-sm text-muted-foreground">{contestazione.mese} · Aperta il {fmt(contestazione.dataApertura)}</p>
                    <p className="text-sm text-muted-foreground">Motivo: {contestazione.motivo}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATO_BADGE[contestazione.stato]}`}>
                        {contestazione.stato}
                    </span>
                    {contestazione.esito && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${ESITO_BADGE[contestazione.esito]}`}>
                            {contestazione.esito === 'favore_locatore' ? 'A favore locatore' : 'A favore inquilino'}
                        </span>
                    )}
                </div>
            </div>

            {/* Azioni risolutive */}
            {canScrivere && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Scale className="w-5 h-5" /> Risolvi contestazione
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            {contestazione.stato === 'aperta' && (
                                <Button variant="outline" className="gap-2"
                                    onClick={() => cambiaStato('in verifica')}>
                                    <Clock className="w-4 h-4 text-yellow-500" /> Metti in verifica
                                </Button>
                            )}
                            <Button variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => cambiaStato('risolta', 'favore_locatore')}>
                                <CheckCircle2 className="w-4 h-4" /> Risolvi — favore locatore
                            </Button>
                            <Button variant="outline" className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
                                onClick={() => cambiaStato('risolta', 'favore_inquilino')}>
                                <CheckCircle2 className="w-4 h-4" /> Risolvi — favore inquilino
                            </Button>
                            <Button variant="outline" className="gap-2 text-gray-600"
                                onClick={() => cambiaStato('chiusa')}>
                                <XCircle className="w-4 h-4" /> Chiudi senza esito
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Figure coinvolte: 3 colonne fisse */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Users className="w-5 h-5" /> Figure coinvolte
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`grid gap-4 ${haAvvocato ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>

                        {/* Colonna Locatori */}
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">
                                Locatori ({contestazione.locatori.length})
                            </p>
                            {contestazione.locatori.map((loc, i) => (
                                <PersonaBox
                                    key={i}
                                    titolo={`Locatore ${contestazione.locatori.length > 1 ? `${i + 1} di ${contestazione.locatori.length}` : ''}`}
                                    persona={loc}
                                    color="bg-blue-50 border-blue-200"
                                    isAccountTitolare={loc.accountTitolare}
                                />
                            ))}
                        </div>

                        {/* Colonna Inquilini */}
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase">
                                Inquilini ({contestazione.inquilini.length})
                            </p>
                            {contestazione.inquilini.map((inq, i) => (
                                <PersonaBox
                                    key={i}
                                    titolo={`Inquilino ${contestazione.inquilini.length > 1 ? `${i + 1} di ${contestazione.inquilini.length}` : ''}`}
                                    persona={inq}
                                    color="bg-green-50 border-green-200"
                                    isAccountTitolare={inq.accountTitolare}
                                />
                            ))}
                        </div>

                        {/* Colonna Avvocato (solo se assegnato) */}
                        {haAvvocato && (
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                    Avvocato (mediatore)
                                </p>
                                <PersonaBox
                                    titolo="Avvocato CRIA"
                                    persona={contestazione.avvocato}
                                    color="bg-amber-50 border-amber-200"
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Documenti + Note */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="w-5 h-5" /> Documenti ({contestazione.documenti.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {contestazione.documenti.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">Nessun documento caricato.</p>
                        ) : contestazione.documenti.map(doc => (
                            <div key={doc.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{doc.nome}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{doc.caricatoDa} · {fmt(doc.data)}</p>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${DOC_BADGE[doc.stato] || 'bg-gray-100 text-gray-600'}`}>
                                    {doc.stato}
                                </span>
                                {doc.stato === 'da verificare' && (
                                    <Button size="sm" variant="ghost" className="h-7 text-green-600 flex-shrink-0"
                                        onClick={() => verificaDoc(doc.id)}>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="w-5 h-5" /> Note interne
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <textarea value={nota} onChange={e => setNota(e.target.value)} rows={5}
                            placeholder="Aggiungi note interne (non visibili alle parti)..."
                            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <Button size="sm" onClick={salvaNota} className="gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Salva nota
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* ── COMUNICAZIONI A 2 CANALI SEPARATI (con scrittura inline) ── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Users className="w-5 h-5" /> Comunicazioni — vista admin (mediatore)
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Locatori e inquilini hanno canali separati. I cointestatari della stessa parte si vedono tra loro,
                        ma non vedono mai l'altra parte. Scrivi direttamente nel canale di destinazione.
                    </p>
                </CardHeader>
                <CardContent>

                    {/* 2 canali affiancati con scrittura inline */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* Canale LOCATORI */}
                        <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/30">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <h4 className="text-sm font-semibold text-foreground">
                                    CRIA ↔ Locatori
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                    ({numeroLocatori} {numeroLocatori === 1 ? 'persona' : 'persone'})
                                </span>
                            </div>
                            <ChatThread
                                messaggi={messaggiLocatori}
                                canScrivere={canScrivere}
                                onInvia={(testo) => inviaMessaggio(testo, 'locatori')}
                                placeholder="Scrivi un messaggio ai locatori..."
                                readOnlyNote={readOnlyMsg || 'Chat in sola lettura'}
                                showHeader={false}
                                maxHeight="20rem"
                            />
                        </div>

                        {/* Canale INQUILINI */}
                        <div className="border border-green-200 rounded-xl p-4 bg-green-50/30">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <h4 className="text-sm font-semibold text-foreground">
                                    CRIA ↔ Inquilini
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                    ({numeroInquilini} {numeroInquilini === 1 ? 'persona' : 'persone'})
                                </span>
                            </div>
                            <ChatThread
                                messaggi={messaggiInquilini}
                                canScrivere={canScrivere}
                                onInvia={(testo) => inviaMessaggio(testo, 'inquilini')}
                                placeholder="Scrivi un messaggio agli inquilini..."
                                readOnlyNote={readOnlyMsg || 'Chat in sola lettura'}
                                showHeader={false}
                                maxHeight="20rem"
                            />
                        </div>
                    </div>

                </CardContent>
            </Card>

        </div>
    );
};

// ═════════════════════════════════════════════════════════════════════════════
const ContestazionePage = () => {
    const { id } = useParams();
    const [contestazioni, setContestazioni] = useState(CONTESTAZIONI_INIZIALI);

    return (
        <>
            <Helmet><title>{id ? 'Dettaglio Contestazione - CRIA Admin' : 'Contestazioni - CRIA Admin'}</title></Helmet>
            <div className="space-y-6">
                {!id && (
                    <>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground mb-1">Contestazioni</h1>
                            <p className="text-sm text-muted-foreground">Gestisci tutte le contestazioni aperte tra locatori e inquilini</p>
                        </div>
                        <ListaContestazioni contestazioni={contestazioni} />
                    </>
                )}
                {id && (
                    <DettaglioContestazione
                        id={id}
                        contestazioni={contestazioni}
                        setContestazioni={setContestazioni}
                    />
                )}
            </div>
        </>
    );
};

export default ContestazionePage;