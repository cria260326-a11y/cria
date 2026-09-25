import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import NotaMockup from '@/components/NotaMockup';
import AzioneSeparata from '@/components/admin/AzioneSeparata';
import RiepilogoUtente from '@/components/admin/anagrafica/RiepilogoUtente';
import { VistaRistretta } from '@/components/admin/anagrafica/ElementiScheda';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { verificaAzione } from '@/lib/separazione';
import { normalizzaTelefono } from '@/lib/unicita';
import {
    useAnagrafica, livelloAnagrafica, preparaUtente, ripristinaAnagraficaDemo, chiUsa, controllaCodiceFiscale, isCodiceProvvisorio,
    vociStorico, avvisiRuoli, nomeDaAnagrafica, percorsoSoggetto,
    PERCORSI, RUOLI_UTENTE, CANALI_CONTATTO, VOCI_STORICO, STATO_ACCOUNT,
} from '@/lib/anagraficheDemo';
import { OGGI } from '@/data/datiDemo';
import { nomeOperatore } from '@/data/operatori';
import { fmtData } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// CREA UTENTE — da «Soggetti e utenti» (O-02)
// Serve a due cose: creare un utente nuovo, e rifare l'utente di una persona
// che in CRIA ha due anagrafiche (?coppia=…). Niente si unisce: si sente il
// cliente, si crea un utente con le credenziali giuste, si portano a mano le
// voci dello storico, e le anagrafiche vecchie si archiviano.
//
// Creare un utente da CRIA è un'eccezione alla regola per cui i clienti si
// registrano da soli (documento di stato §13.4: un operatore potrebbe
// inventare un proprietario). Per questo lo prepara un operatore e lo conferma
// un responsabile diverso, la password è provvisoria e l'identità si verifica
// come per chi si registra. In piattaforma l'utente non si crea dal browser: lo
// crea una Edge Function di Supabase con la chiave di servizio, chiamabile solo
// dall'admin, che registra tutto. Nei mockup è simulato.
// ═════════════════════════════════════════════════════════════════════════════

const PASSI = [
    { id: 'chi', titolo: 'Chi è' },
    { id: 'contatto', titolo: 'Contatto con il cliente' },
    { id: 'credenziali', titolo: 'Email e cellulare' },
    { id: 'ruoli', titolo: 'Ruoli' },
    { id: 'storico', titolo: 'Storico da portare' },
    { id: 'riepilogo', titolo: 'Riepilogo' },
];

const CAMPI_PERSONA = [
    { id: 'nome', etichetta: 'Nome' },
    { id: 'cognome', etichetta: 'Cognome' },
    { id: 'codiceFiscale', etichetta: 'Codice fiscale', maiuscolo: true },
    { id: 'dataNascita', etichetta: 'Data di nascita', tipo: 'date' },
    { id: 'luogoNascita', etichetta: 'Luogo di nascita', facoltativo: true },
];
const CAMPI_SOCIETA = [
    { id: 'ragioneSociale', etichetta: 'Ragione sociale' },
    { id: 'partitaIva', etichetta: 'Partita IVA', maiuscolo: true },
    { id: 'codiceFiscale', etichetta: 'Codice fiscale della società', maiuscolo: true, nota: 'Di solito è uguale alla partita IVA.' },
    { id: 'rapNome', etichetta: 'Legale rappresentante · nome' },
    { id: 'rapCognome', etichetta: 'Legale rappresentante · cognome' },
    { id: 'rapCodiceFiscale', etichetta: 'Legale rappresentante · codice fiscale', maiuscolo: true, facoltativo: true },
];
const CAMPI_INDIRIZZO = [
    { id: 'via', etichetta: 'Via e numero civico' },
    { id: 'cap', etichetta: 'CAP' },
    { id: 'citta', etichetta: 'Città' },
    { id: 'paese', etichetta: 'Paese' },
];

// Dove sta ogni campo in un'anagrafica che esiste già.
const rappresentanteDi = (s, modello) => s.legaleRappresentante || (s.rappresentante ? modello.trova(s.rappresentante) : null);
const VALORE = {
    nome: s => (s.tipo === 'fisica' ? s.nome : ''),
    cognome: s => (s.tipo === 'fisica' ? s.cognome : ''),
    codiceFiscale: s => s.codiceFiscale || '',
    dataNascita: s => s.dataNascita || '',
    luogoNascita: s => s.luogoNascita || '',
    ragioneSociale: s => s.ragioneSociale || '',
    partitaIva: s => s.partitaIva || '',
    rapNome: (s, m) => rappresentanteDi(s, m)?.nome || '',
    rapCognome: (s, m) => rappresentanteDi(s, m)?.cognome || '',
    rapCodiceFiscale: (s, m) => rappresentanteDi(s, m)?.codiceFiscale || '',
    via: s => s.indirizzo?.via || '',
    cap: s => s.indirizzo?.cap || '',
    citta: s => s.indirizzo?.citta || '',
    paese: s => s.indirizzo?.paese || '',
};

const VUOTO = {
    tipo: 'fisica', nome: '', cognome: '', codiceFiscale: '', dataNascita: '', luogoNascita: '',
    ragioneSociale: '', partitaIva: '', rapNome: '', rapCognome: '', rapCodiceFiscale: '',
    via: '', cap: '', citta: '', paese: 'Italia',
};

const pulito = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, ' ');
const maiuscolo = (v) => String(v || '').replace(/\s+/g, '').toUpperCase();

// Dove le anagrafiche dicono la stessa cosa si parte da lì; dove dicono cose
// diverse il campo parte vuoto, e sceglie l'operatore guardando i documenti.
const moduloNuovo = (vecchie, modello) => {
    const dati = { ...VUOTO, tipo: vecchie[0]?.tipo || 'fisica' };
    for (const campo of Object.keys(VALORE)) {
        const valori = [...new Set(vecchie.map(v => VALORE[campo](v, modello)).filter(Boolean))];
        if (valori.length === 1) dati[campo] = valori[0];
        else if (valori.length > 1) dati[campo] = '';
    }
    return {
        dati,
        contatto: { il: OGGI, canale: '', stessaPersona: false, recapitiScelti: false, nota: '' },
        credenziali: { email: '', telefono: '', liberaEmail: false, liberaTelefono: false },
        ruoli: [],
        storico: {},
        ricontrollato: false,
    };
};

// Una preparazione respinta si riprende da dov'era, per correggerla.
const moduloDaRipresa = (p) => {
    const a = p.anagrafica;
    const liberate = Object.values(p.libera || {});
    return {
        dati: {
            ...VUOTO,
            tipo: a.tipo || 'fisica',
            nome: a.nome || '', cognome: a.cognome || '', codiceFiscale: a.codiceFiscale || '',
            dataNascita: a.dataNascita || '', luogoNascita: a.luogoNascita || '',
            ragioneSociale: a.ragioneSociale || '', partitaIva: a.partitaIva || '',
            rapNome: a.rappresentante?.nome || '', rapCognome: a.rappresentante?.cognome || '', rapCodiceFiscale: a.rappresentante?.codiceFiscale || '',
            via: a.indirizzo?.via || '', cap: a.indirizzo?.cap || '', citta: a.indirizzo?.citta || '', paese: a.indirizzo?.paese || 'Italia',
        },
        contatto: {
            il: p.contatto?.il || OGGI, canale: p.contatto?.canale || '', nota: p.contatto?.nota || '',
            stessaPersona: Boolean(p.contatto?.stessaPersona), recapitiScelti: Boolean(p.contatto?.recapitiScelti),
        },
        credenziali: {
            email: p.credenziali?.email || '', telefono: p.credenziali?.telefono || '',
            liberaEmail: liberate.some(x => x.email), liberaTelefono: liberate.some(x => x.telefono),
        },
        ruoli: p.ruoli || [],
        storico: p.storico || {},
        ricontrollato: false,
    };
};

// ─── Pezzi ────────────────────────────────────────────────────────────────────
const selectClasse = 'w-full h-9 text-sm border border-input rounded-md px-3 bg-background';

// Un campo, con accanto i valori delle anagrafiche di partenza da cui sceglierlo.
const Campo = ({ campo, valore, onChange, fonti = [] }) => {
    const idCampo = `campo-${campo.id}`;
    const diversi = new Set(fonti.map(f => pulito(f.valore))).size > 1;
    return (
        <div className="space-y-1.5 min-w-0">
            <Label htmlFor={idCampo}>
                {campo.etichetta}{campo.facoltativo && <span className="text-muted-foreground font-normal"> · facoltativo</span>}
            </Label>
            <Input
                id={idCampo}
                type={campo.tipo || 'text'}
                value={valore}
                max={campo.tipo === 'date' ? OGGI : undefined}
                onChange={e => onChange(campo.maiuscolo ? e.target.value.toUpperCase() : e.target.value)}
                className={campo.maiuscolo ? 'font-mono' : ''}
                autoComplete="off"
            />
            {fonti.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {fonti.map(f => {
                        const scelto = pulito(valore) === pulito(f.valore);
                        return (
                            <button
                                key={f.n}
                                type="button"
                                onClick={() => onChange(f.valore)}
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs max-w-full ${scelto ? 'border-green-300 bg-green-50 text-green-900' : 'border-border bg-background text-muted-foreground hover:text-foreground'}`}
                            >
                                {scelto && <Check className="w-3 h-3 flex-shrink-0" />}
                                <span className="truncate">{f.n}: {campo.tipo === 'date' ? fmtData(f.valore) : f.valore}</span>
                            </button>
                        );
                    })}
                </div>
            )}
            {diversi && !valore && <p className="text-xs text-amber-800">Le anagrafiche non coincidono: scegli il valore giusto o scrivilo tu.</p>}
            {campo.nota && <p className="text-xs text-muted-foreground">{campo.nota}</p>}
        </div>
    );
};

const Problemi = ({ elenco }) => (elenco.length === 0 ? null : (
    <ul className="space-y-1">
        {elenco.map(t => <li key={t} className="flex items-start gap-1.5 text-xs text-amber-800"><AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-px" /> {t}</li>)}
    </ul>
));

// Il controllo di unicità su un'email o un cellulare.
const EsitoRecapito = ({ esito, campo, libera, onLibera }) => {
    if (esito.stato === 'vuoto') return null;
    if (esito.stato === 'libero') {
        return <p className="text-xs text-green-800 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Libero: in CRIA non lo usa nessuno.</p>;
    }
    if (esito.stato === 'da_liberare') {
        const s = esito.soggetto;
        return (
            <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 space-y-2">
                <p className="text-xs text-amber-900">
                    È dell’anagrafica di {s.nomeCompleto} ({s.origineBreve}), che stai rifacendo. {campo === 'email' ? 'Per usarla va liberata' : 'Per usarlo va liberato'}:{' '}
                    {campo === 'email'
                        ? <>all’anagrafica vecchia l’email diventa <span className="font-mono break-all">archiviato+{s.id}@cri-affitti.it</span>.</>
                        : 'dall’anagrafica vecchia il cellulare si toglie.'}
                </p>
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={libera} onChange={e => onLibera(e.target.checked)} className="mt-1 accent-primary" />
                    {campo === 'email' ? 'Libera questa email' : 'Libera questo cellulare'}
                </label>
            </div>
        );
    }
    return <p className="text-xs text-red-700">{esito.testo}</p>;
};

const ScegliRuolo = ({ id, ruolo, scelto, onCambia }) => (
    <label htmlFor={`ruolo-${id}`} className={`flex items-start gap-2 rounded-lg border p-3 cursor-pointer ${scelto ? 'border-primary bg-primary/5' : 'border-border'}`}>
        <input id={`ruolo-${id}`} type="checkbox" checked={scelto} onChange={e => onCambia(e.target.checked)} className="mt-1 accent-primary" />
        <span className="min-w-0">
            <span className="block text-sm font-medium text-foreground">{ruolo.etichetta}</span>
            <span className="block text-xs text-muted-foreground">{ruolo.spiegazione}</span>
        </span>
    </label>
);

// ─── La procedura ─────────────────────────────────────────────────────────────
const Procedura = ({ modello, vecchie, coppia, ripresa }) => {
    const navigate = useNavigate();
    const { operatoreId } = useOperatoreAttivo();
    const [f, setF] = useState(() => (ripresa ? moduloDaRipresa(ripresa) : moduloNuovo(vecchie, modello)));
    const [passo, setPasso] = useState(0);
    const vecchieIds = vecchie.map(v => v.id);
    const daCoppia = vecchie.length > 0;
    const d = f.dati;
    const fisica = d.tipo === 'fisica';

    const setDato = (campo) => (valore) => setF(x => ({ ...x, dati: { ...x.dati, [campo]: valore }, ricontrollato: campo === 'codiceFiscale' ? false : x.ricontrollato }));
    const setSezione = (sezione, campo) => (valore) => setF(x => ({ ...x, [sezione]: { ...x[sezione], [campo]: valore } }));
    const fontiDi = (campo) => vecchie.map((v, i) => ({ n: i + 1, valore: VALORE[campo](v, modello) })).filter(x => x.valore);

    // ── Chi è ──
    const cf = maiuscolo(d.codiceFiscale);
    let esitoCf = null;
    if (cf && fisica) esitoCf = isCodiceProvvisorio(cf, 'fisica') ? { valido: true, avvisi: [] } : controllaCodiceFiscale(cf, d);
    else if (cf) esitoCf = /^\d{11}$/.test(cf) ? { valido: true, avvisi: [] } : { valido: false, errore: 'Il codice fiscale di una società ha 11 cifre.', avvisi: [] };
    const usoCf = esitoCf?.valido ? chiUsa(modello, 'codiceFiscale', cf, { tranne: ripresa?.id }) : null;
    const cfDiAltri = usoCf && !(usoCf.tipo === 'soggetto' && vecchieIds.includes(usoCf.soggetto.id));
    const pivaDiAltri = !fisica && d.partitaIva ? modello.attivi.find(s => s.partitaIva === maiuscolo(d.partitaIva) && !vecchieIds.includes(s.id)) : null;
    const italia = pulito(d.paese) === 'italia';

    // ── Email e cellulare ──
    const esitoRecapito = (campo, valore) => {
        const v = String(valore || '').trim();
        if (!v) return { stato: 'vuoto' };
        if (campo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return { stato: 'errore', testo: 'Scrivi un’email valida.' };
        if (campo === 'telefono' && !/^\+\d{9,15}$/.test(normalizzaTelefono(v))) return { stato: 'errore', testo: 'Scrivi il cellulare con il prefisso, per esempio +39 333 1234567.' };
        const uso = chiUsa(modello, campo, v, { tranne: ripresa?.id });
        if (!uso) return { stato: 'libero' };
        if (uso.tipo === 'soggetto' && vecchieIds.includes(uso.soggetto.id)) return { stato: 'da_liberare', soggetto: uso.soggetto };
        if (uso.tipo === 'collaboratore') return { stato: 'di_altri', testo: `È di ${uso.nome}, che lavora con CRIA: ci si ferma qui.` };
        if (uso.tipo === 'preparazione') return { stato: 'di_altri', testo: `È già nell’utente di ${uso.nome}, che aspetta la conferma: ci si ferma qui.` };
        return { stato: 'di_altri', testo: `È già di ${uso.nome} (${uso.soggetto.origineBreve}): ci si ferma qui. Se è la stessa persona, segnala il doppione.` };
    };
    const esEmail = esitoRecapito('email', f.credenziali.email);
    const esTelefono = esitoRecapito('telefono', f.credenziali.telefono);

    const conContatto = daCoppia || Boolean(f.contatto.canale);
    const problemi = [
        [
            fisica && !d.nome.trim() && 'Manca il nome.',
            fisica && !d.cognome.trim() && 'Manca il cognome.',
            !fisica && !d.ragioneSociale.trim() && 'Manca la ragione sociale.',
            !fisica && !/^\d{11}$/.test(maiuscolo(d.partitaIva)) && 'La partita IVA ha 11 cifre.',
            !fisica && (!d.rapNome.trim() || !d.rapCognome.trim()) && 'Manca il legale rappresentante.',
            !cf && 'Manca il codice fiscale.',
            esitoCf && !esitoCf.valido && esitoCf.errore,
            cfDiAltri && `Il codice fiscale è già di ${usoCf.nome}: in CRIA una persona c’è una volta sola.`,
            pivaDiAltri && `La partita IVA è già di ${pivaDiAltri.nomeCompleto}.`,
            esitoCf?.valido && esitoCf.avvisi.length > 0 && !f.ricontrollato && 'Il codice fiscale non torna con nome o data di nascita: ricontrolla e spunta la conferma.',
            fisica && !d.dataNascita && 'Manca la data di nascita.',
            fisica && d.dataNascita && (d.dataNascita > OGGI || d.dataNascita < '1900-01-01') && 'La data di nascita non è possibile.',
            !d.via.trim() && 'Manca la via.',
            !d.cap.trim() && 'Manca il CAP.',
            italia && d.cap.trim() && !/^\d{5}$/.test(d.cap.trim()) && 'In Italia il CAP ha 5 cifre.',
            !d.citta.trim() && 'Manca la città.',
            !d.paese.trim() && 'Manca il paese.',
        ],
        conContatto ? [
            !f.contatto.il && 'Manca la data del contatto.',
            f.contatto.il > OGGI && 'La data del contatto non può essere dopo oggi.',
            !f.contatto.canale && 'Manca come l’hai sentito.',
            daCoppia && !f.contatto.stessaPersona && 'Serve la conferma che è la stessa persona.',
            daCoppia && !f.contatto.recapitiScelti && 'Serve la conferma dell’email e del cellulare che userà.',
        ] : [],
        [
            esEmail.stato === 'vuoto' && 'Manca l’email di accesso.',
            ['errore', 'di_altri'].includes(esEmail.stato) && `Email: ${esEmail.testo}`,
            esEmail.stato === 'da_liberare' && !f.credenziali.liberaEmail && 'L’email è di un’anagrafica che stai rifacendo: spunta che va liberata.',
            esTelefono.stato === 'vuoto' && 'Manca il cellulare.',
            ['errore', 'di_altri'].includes(esTelefono.stato) && `Cellulare: ${esTelefono.testo}`,
            esTelefono.stato === 'da_liberare' && !f.credenziali.liberaTelefono && 'Il cellulare è di un’anagrafica che stai rifacendo: spunta che va liberato.',
        ],
        [f.ruoli.length === 0 && 'Scegli almeno un ruolo.'],
        [],
        [],
    ].map(elenco => elenco.filter(Boolean));
    const raggiungibile = (i) => problemi.slice(0, i).every(p => p.length === 0);

    // La preparazione come la vedrà chi conferma: la stessa per il riepilogo e per l'invio.
    const preparazione = () => {
        const indirizzo = { via: d.via.trim(), cap: d.cap.trim(), citta: d.citta.trim(), paese: d.paese.trim() };
        const libera = {};
        if (esEmail.stato === 'da_liberare') libera[esEmail.soggetto.id] = { ...libera[esEmail.soggetto.id], email: true };
        if (esTelefono.stato === 'da_liberare') libera[esTelefono.soggetto.id] = { ...libera[esTelefono.soggetto.id], telefono: true };
        return {
            coppiaId: coppia?.id || null,
            ripresaDa: ripresa?.id || null,
            daAnagrafiche: vecchieIds,
            anagrafica: fisica
                ? { tipo: 'fisica', nome: d.nome.trim(), cognome: d.cognome.trim(), codiceFiscale: cf, dataNascita: d.dataNascita, luogoNascita: d.luogoNascita.trim() || null, indirizzo }
                : {
                    tipo: 'giuridica', ragioneSociale: d.ragioneSociale.trim(), partitaIva: maiuscolo(d.partitaIva), codiceFiscale: cf, indirizzo,
                    rappresentante: { nome: d.rapNome.trim(), cognome: d.rapCognome.trim(), codiceFiscale: maiuscolo(d.rapCodiceFiscale) || null },
                },
            contatto: conContatto ? { ...f.contatto, nota: f.contatto.nota.trim() || null } : null,
            credenziali: { email: f.credenziali.email.trim().toLowerCase(), telefono: f.credenziali.telefono.trim() },
            libera,
            ruoli: f.ruoli,
            storico: Object.fromEntries(Object.entries(f.storico).filter(([id]) => vecchieIds.includes(id))),
        };
    };

    const vai = (i) => {
        setPasso(i);
        document.querySelector('main')?.scrollTo({ top: 0 });
    };
    const prepara = () => {
        preparaUtente(preparazione(), operatoreId);
        toast.success('Utente preparato: ora lo conferma un responsabile diverso da te, in Soggetti e utenti');
        navigate(PERCORSI.soggetti);
    };

    // ── Storico ──
    const scelti = (vId, tipo) => f.storico[vId]?.[tipo] || [];
    const scegli = (vId, tipo, id, si) => setF(x => {
        const perV = x.storico[vId] || {};
        const attuali = perV[tipo] || [];
        const nuovi = si ? [...new Set([...attuali, id])] : attuali.filter(y => y !== id);
        return { ...x, storico: { ...x.storico, [vId]: { ...perV, [tipo]: nuovi } } };
    });
    const portaTutto = (vId, voci) => setF(x => ({
        ...x,
        storico: { ...x.storico, [vId]: Object.fromEntries(Object.keys(VOCI_STORICO).map(tipo => [tipo, voci[tipo].map(v => v.id)])) },
    }));

    const avvisi = avvisiRuoli({ ruoli: f.ruoli, storico: f.storico, daAnagrafiche: vecchieIds }, modello);
    const ultimo = passo === PASSI.length - 1;

    return (
        <div className="space-y-6">
            {/* I passi: sul telefono solo quello in corso, da sm in su tutti. */}
            <div className="sm:hidden space-y-2">
                <p className="text-sm font-medium text-foreground">Passo {passo + 1} di {PASSI.length} · {PASSI[passo].titolo}</p>
                <div className="flex gap-1">
                    {PASSI.map((p, i) => <span key={p.id} className={`h-1.5 flex-1 rounded-full ${i < passo ? 'bg-green-500' : i === passo ? 'bg-primary' : 'bg-muted'}`} />)}
                </div>
            </div>
            <ol className="hidden sm:grid grid-cols-6 gap-2">
                {PASSI.map((p, i) => (
                    <li key={p.id}>
                        <button
                            type="button"
                            onClick={() => vai(i)}
                            disabled={!raggiungibile(i)}
                            aria-current={i === passo ? 'step' : undefined}
                            className={`w-full h-full text-left rounded-lg border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${i === passo ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
                        >
                            <span className="flex items-center gap-1.5">
                                {i < passo && problemi[i].length === 0 ? <Check className="w-3.5 h-3.5 text-green-600" /> : <span className="tabular-nums">{i + 1}.</span>}
                                {p.titolo}
                            </span>
                        </button>
                    </li>
                ))}
            </ol>

            <Card>
                <CardContent className="pt-5 pb-5 space-y-5">
                    {PASSI[passo].id === 'chi' && (
                        <>
                            {daCoppia && (
                                <div className="rounded-lg bg-muted/40 p-3 space-y-1 text-xs text-muted-foreground">
                                    <p className="font-medium text-foreground">Le anagrafiche di partenza</p>
                                    {vecchie.map((v, i) => (
                                        <p key={v.id}>
                                            {i + 1} · <Link to={percorsoSoggetto(v.id)} className="underline">{v.nomeCompleto}</Link> · {v.origineBreve}, {fmtData(v.creatoIl)} · {STATO_ACCOUNT[v.account.stato].breve.toLowerCase()}
                                        </p>
                                    ))}
                                    <p>Dove dicono cose diverse il campo parte vuoto: scegli il valore giusto guardando i documenti, o correggilo a mano.</p>
                                </div>
                            )}
                            <fieldset className="space-y-2">
                                <legend className="text-sm font-medium text-foreground mb-1">È una persona o una società?</legend>
                                <div className="flex flex-wrap gap-2">
                                    {[['fisica', 'Persona fisica'], ['giuridica', 'Società']].map(([valore, etichetta]) => (
                                        <label key={valore} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer ${d.tipo === valore ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                            <input type="radio" name="tipo" checked={d.tipo === valore} onChange={() => setDato('tipo')(valore)} className="accent-primary" />
                                            {etichetta}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(fisica ? CAMPI_PERSONA : CAMPI_SOCIETA).map(c => (
                                    <Campo key={c.id} campo={c} valore={d[c.id]} onChange={setDato(c.id)} fonti={fontiDi(c.id)} />
                                ))}
                            </div>
                            {esitoCf?.valido && esitoCf.avvisi.length > 0 && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 space-y-2">
                                    {esitoCf.avvisi.map(t => <p key={t} className="text-xs text-amber-900">{t}</p>)}
                                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                                        <input type="checkbox" checked={f.ricontrollato} onChange={e => setF(x => ({ ...x, ricontrollato: e.target.checked }))} className="mt-1 accent-primary" />
                                        Ho ricontrollato sul documento: il codice è questo.
                                    </label>
                                </div>
                            )}
                            {usoCf && !cfDiAltri && (
                                <p className="text-xs text-muted-foreground">Il codice fiscale passa all’utente nuovo: l’anagrafica archiviata lo tiene solo come storia.</p>
                            )}
                            <div>
                                <p className="text-sm font-medium text-foreground mb-2">{fisica ? 'Indirizzo di residenza' : 'Sede'}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {CAMPI_INDIRIZZO.map(c => <Campo key={c.id} campo={c} valore={d[c.id]} onChange={setDato(c.id)} fonti={fontiDi(c.id)} />)}
                                </div>
                                {vecchie.some(v => v.indirizzo && v.indirizzo.fonte !== 'dichiarato') && (
                                    <p className="text-xs text-muted-foreground mt-2">Un indirizzo che non è stato dichiarato viene dalla casa in affitto o dalla fatturazione: chiedilo alla persona.</p>
                                )}
                            </div>
                        </>
                    )}

                    {PASSI[passo].id === 'contatto' && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                {daCoppia
                                    ? 'Prima di rifare l’utente si sente il cliente, ai recapiti che CRIA conosce: che sia la stessa persona, e con quale email e quale cellulare entrerà. Senza questo passaggio non si va avanti.'
                                    : 'Se la richiesta è arrivata da un contatto con il cliente, scrivi quando e come: resta nella storia dell’utente. Si può anche lasciare vuoto.'}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="contatto-il">Quando</Label>
                                    <Input id="contatto-il" type="date" max={OGGI} value={f.contatto.il} onChange={e => setSezione('contatto', 'il')(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="contatto-canale">Come</Label>
                                    <select id="contatto-canale" value={f.contatto.canale} onChange={e => setSezione('contatto', 'canale')(e.target.value)} className={selectClasse}>
                                        <option value="">Scegli…</option>
                                        {Object.entries(CANALI_CONTATTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                    </select>
                                </div>
                            </div>
                            {daCoppia && (
                                <fieldset className="space-y-2">
                                    <legend className="text-sm font-medium text-foreground mb-1">Che cosa ha confermato</legend>
                                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                                        <input type="checkbox" checked={f.contatto.stessaPersona} onChange={e => setSezione('contatto', 'stessaPersona')(e.target.checked)} className="mt-1 accent-primary" />
                                        È la stessa persona delle due anagrafiche.
                                    </label>
                                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                                        <input type="checkbox" checked={f.contatto.recapitiScelti} onChange={e => setSezione('contatto', 'recapitiScelti')(e.target.checked)} className="mt-1 accent-primary" />
                                        Ha scelto l’email e il cellulare con cui entrerà: li scrivi al passo dopo.
                                    </label>
                                </fieldset>
                            )}
                            <div className="space-y-1.5">
                                <Label htmlFor="contatto-nota">Nota, se serve</Label>
                                <Textarea id="contatto-nota" rows={2} value={f.contatto.nota} onChange={e => setSezione('contatto', 'nota')(e.target.value)} placeholder="Per esempio: ha risposto al cellulare del contratto, ha riconosciuto il contratto di Via Verdi 3" />
                            </div>
                        </>
                    )}

                    {PASSI[passo].id === 'credenziali' && (
                        <>
                            <p className="text-sm text-muted-foreground">
                                Email e cellulare in CRIA non si ripetono mai. Se sono di un’anagrafica che stai rifacendo, per usarli vanno liberati; se sono di qualcun altro, ci si ferma.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {[
                                    { campo: 'email', etichetta: 'Email di accesso', tipo: 'email', esito: esEmail, libera: f.credenziali.liberaEmail, chiaveLibera: 'liberaEmail', valori: vecchie.map(v => v.email) },
                                    { campo: 'telefono', etichetta: 'Cellulare', tipo: 'tel', esito: esTelefono, libera: f.credenziali.liberaTelefono, chiaveLibera: 'liberaTelefono', valori: vecchie.map(v => v.telefono) },
                                ].map(r => (
                                    <div key={r.campo} className="space-y-2 min-w-0">
                                        <Campo
                                            campo={{ id: r.campo, etichetta: r.etichetta, tipo: r.tipo }}
                                            valore={f.credenziali[r.campo]}
                                            onChange={(v) => setF(x => ({ ...x, credenziali: { ...x.credenziali, [r.campo]: v, [r.chiaveLibera]: false } }))}
                                            fonti={r.valori.map((valore, i) => ({ n: i + 1, valore })).filter(x => x.valore)}
                                        />
                                        <EsitoRecapito esito={r.esito} campo={r.campo} libera={r.libera} onLibera={setSezione('credenziali', r.chiaveLibera)} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {PASSI[passo].id === 'ruoli' && (
                        <>
                            <p className="text-sm text-muted-foreground">Si scelgono a mano, solo quelli che servono: nessun ruolo si spunta da solo.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {Object.entries(RUOLI_UTENTE).filter(([, r]) => !r.collaboratore).map(([id, r]) => (
                                    <ScegliRuolo key={id} id={id} ruolo={r} scelto={f.ruoli.includes(id)} onCambia={(si) => setF(x => ({ ...x, ruoli: si ? [...x.ruoli, id] : x.ruoli.filter(y => y !== id) }))} />
                                ))}
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Solo se la persona lavora con CRIA</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(RUOLI_UTENTE).filter(([, r]) => r.collaboratore).map(([id, r]) => (
                                        <ScegliRuolo key={id} id={id} ruolo={r} scelto={f.ruoli.includes(id)} onCambia={(si) => setF(x => ({ ...x, ruoli: si ? [...x.ruoli, id] : x.ruoli.filter(y => y !== id) }))} />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">I colleghi interni non si creano da qui: sono il lotto 6, in Collaboratori.</p>
                            </div>
                            {daCoppia && (
                                <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                                    <p className="text-xs font-medium text-foreground">I ruoli delle anagrafiche vecchie, solo per riferimento</p>
                                    {vecchie.map((v, i) => (
                                        <p key={v.id} className="text-xs text-muted-foreground">
                                            {i + 1} · {v.nomeCompleto}: {v.ruoli.length ? v.ruoli.map(r => RUOLI_UTENTE[r]?.etichetta || r).join(', ') : 'nessuno'} · {STATO_ACCOUNT[v.account.stato].etichetta.toLowerCase()}
                                        </p>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-amber-800 flex items-start gap-1.5">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> Un ruolo in più apre dati che la persona non deve vedere, con tutto quello che ne segue: in dubbio, lascialo fuori.
                            </p>
                        </>
                    )}

                    {PASSI[passo].id === 'storico' && (
                        !daCoppia ? (
                            <p className="text-sm text-muted-foreground">
                                L’utente è nuovo e parte senza storico: immobili, pagamenti e reputazione arriveranno con i contratti che farà su CRIA.
                            </p>
                        ) : (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    Scegli voce per voce cosa passa all’utente nuovo. Con una posizione sul contratto vengono l’immobile, i mesi e i pagamenti. La reputazione non si copia: si ricalcola dai contratti portati.
                                </p>
                                {vecchie.map((v, i) => {
                                    const voci = vociStorico(v, modello);
                                    const tipi = Object.keys(VOCI_STORICO).filter(tipo => voci[tipo].length > 0);
                                    return (
                                        <section key={v.id} className="rounded-lg border border-border p-3 sm:p-4 space-y-3">
                                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                <p className="text-sm font-medium text-foreground">{i + 1} · {v.nomeCompleto} <span className="text-muted-foreground font-normal">· {v.origineBreve}</span></p>
                                                {tipi.length > 0 && <button type="button" className="text-xs font-medium text-primary hover:underline" onClick={() => portaTutto(v.id, voci)}>Porta tutto da qui</button>}
                                            </div>
                                            {tipi.length === 0 ? <p className="text-sm text-muted-foreground">Nessuna voce da portare.</p> : tipi.map(tipo => (
                                                <fieldset key={tipo} className="space-y-1.5">
                                                    <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{VOCI_STORICO[tipo]}</legend>
                                                    {voci[tipo].map(x => (
                                                        <label key={x.id} className="flex items-start gap-2 text-sm cursor-pointer">
                                                            <input type="checkbox" checked={scelti(v.id, tipo).includes(x.id)} onChange={e => scegli(v.id, tipo, x.id, e.target.checked)} className="mt-1 accent-primary" />
                                                            <span className="min-w-0">
                                                                <span className="text-foreground">{x.etichetta}</span>
                                                                {x.nota && <span className="block text-xs text-muted-foreground">{x.nota}</span>}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </fieldset>
                                            ))}
                                        </section>
                                    );
                                })}
                                <Problemi elenco={avvisi} />
                            </>
                        )
                    )}

                    {PASSI[passo].id === 'riepilogo' && (
                        <>
                            <p className="text-sm text-muted-foreground">Ecco cosa succederà quando un responsabile diverso da te lo confermerà.</p>
                            <RiepilogoUtente p={preparazione()} modello={modello} />
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="flex flex-wrap items-start justify-between gap-3">
                <Button type="button" variant="outline" className="gap-2" disabled={passo === 0} onClick={() => vai(passo - 1)}>
                    <ArrowLeft className="w-4 h-4" /> Indietro
                </Button>
                <div className="flex flex-col items-end gap-2 max-w-md">
                    {ultimo ? (
                        <AzioneSeparata azione="prepara_utente" onEsegui={prepara} disabled={!raggiungibile(PASSI.length - 1)} allineamento="end">Prepara l’utente</AzioneSeparata>
                    ) : (
                        <Button type="button" className="gap-2" disabled={problemi[passo].length > 0} onClick={() => vai(passo + 1)}>
                            Avanti <ArrowRight className="w-4 h-4" />
                        </Button>
                    )}
                    <Problemi elenco={problemi[passo]} />
                </div>
            </div>
        </div>
    );
};

// ─── Pagina ───────────────────────────────────────────────────────────────────
const Fermo = ({ titolo, children }) => (
    <Card><CardContent className="py-10 text-center space-y-2">
        <p className="font-medium text-foreground">{titolo}</p>
        <div className="text-sm text-muted-foreground">{children}</div>
    </CardContent></Card>
);

const CreaUtentePage = () => {
    const [params] = useSearchParams();
    const modello = useAnagrafica();
    const { operatore, operatoreId } = useOperatoreAttivo();
    const livello = livelloAnagrafica(operatore.funzione);

    const idRipresa = params.get('riprendi');
    const ripresa = idRipresa ? modello.preparazione(idRipresa) : null;
    const idCoppia = ripresa ? ripresa.coppiaId : params.get('coppia');
    const coppia = idCoppia ? modello.coppie.find(c => c.id === idCoppia) || null : null;
    const vecchie = (ripresa ? ripresa.daAnagrafiche : coppia ? [coppia.a, coppia.b] : []).map(id => modello.trova(id)).filter(Boolean);
    const inAttesa = coppia?.preparazioni.find(p => p.stato === 'da_confermare' && p.id !== ripresa?.id);
    const sostituite = vecchie.find(v => v.archiviato);
    const nuovo = sostituite && modello.trova(sostituite.archiviato.sostituitoDa);
    const permesso = verificaAzione('prepara_utente', { operatoreId });

    let fermo = null;
    if (idRipresa && (!ripresa || ripresa.stato !== 'respinta')) fermo = <Fermo titolo="Questa preparazione non si può riprendere">Si riprende solo una preparazione respinta.</Fermo>;
    else if (idCoppia && !coppia) fermo = <Fermo titolo="Coppia non trovata">Questa coppia di anagrafiche non c’è più.</Fermo>;
    else if (coppia?.esito) fermo = <Fermo titolo="Questa coppia è già chiusa">La trovi fra le decisioni prese nella revisione delle anagrafiche.</Fermo>;
    else if (inAttesa) {
        fermo = (
            <Fermo titolo="C’è già un utente da confermare per questa coppia">
                Preparato da {nomeOperatore(inAttesa.preparatoDa)} il {fmtData(inAttesa.preparatoIl)}: lo trovi in cima a <Link to={PERCORSI.soggetti} className="underline">Soggetti e utenti</Link>.
            </Fermo>
        );
    } else if (sostituite) {
        fermo = (
            <Fermo titolo="Queste anagrafiche sono già state sostituite">
                Le sostituisce {nuovo ? <Link to={percorsoSoggetto(nuovo.id)} className="underline">{nuovo.nomeCompleto}</Link> : 'un utente nuovo'}: ora la coppia si segna risolta nella revisione.
            </Fermo>
        );
    }

    const daCoppia = vecchie.length > 0;
    const titolo = daCoppia ? `Crea l’utente di ${nomeDaAnagrafica(ripresa?.anagrafica) || vecchie[0].nomeCompleto}` : 'Crea utente';

    return (
        <>
            <Helmet><title>Crea utente - CRIA</title></Helmet>
            <div className="space-y-6">
                <IntestazionePagina
                    indietro={daCoppia && !ripresa ? { to: PERCORSI.revisione, label: 'Revisione anagrafiche' } : { to: PERCORSI.soggetti, label: 'Soggetti e utenti' }}
                    titolo={titolo}
                    sottotitolo={daCoppia
                        ? 'Con i dati delle due anagrafiche della stessa persona. Niente si unisce: nasce un utente nuovo, le due vecchie si archiviano e rimandano a lui.'
                        : 'Un utente creato da CRIA, per chi non può registrarsi da solo.'}
                />

                {livello !== 'L' ? <VistaRistretta livello={livello} /> : fermo || (
                    <>
                        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
                            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>Di regola i clienti si registrano da soli: un operatore che crea utenti potrebbe inventare un proprietario che non esiste. Per questo l’utente lo prepara un operatore e lo conferma un responsabile diverso, la password è provvisoria e l’identità si verifica come per chi si registra.</p>
                                <p>In piattaforma l’utente non si crea dal browser: lo crea una funzione del server, che può chiamare solo l’admin e che registra tutto. Qui è simulato.</p>
                            </div>
                        </div>
                        {!permesso.consentito && (
                            <p className="text-sm text-amber-800 flex items-start gap-2"><AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> Puoi compilare i passi, ma non preparare: {permesso.motivo}</p>
                        )}
                        {ripresa && (
                            <p className="text-sm text-muted-foreground">
                                Riprendi la preparazione di {nomeOperatore(ripresa.preparatoDa)} del {fmtData(ripresa.preparatoIl)}, respinta da {nomeOperatore(ripresa.esito.da)}: «{ripresa.esito.motivo}»
                            </p>
                        )}
                        <Procedura key={ripresa?.id || coppia?.id || 'nuovo'} modello={modello} vecchie={vecchie} coppia={coppia} ripresa={ripresa} />
                    </>
                )}

                <NotaMockup>
                    <p>Per provare: prepara l’utente operando come Valeria Monti (istruttoria), poi confermalo come Silvia Barbieri (responsabile amministrativa) in Soggetti e utenti. Chi prepara non può confermare.</p>
                    <p className="mt-1">Preparazioni e utenti creati restano in questo browser.</p>
                    <button type="button" className="underline font-medium mt-2" onClick={() => { ripristinaAnagraficaDemo(); toast.success('Anagrafica demo ripristinata'); }}>
                        Ripristina l’anagrafica demo
                    </button>
                </NotaMockup>
            </div>
        </>
    );
};

export default CreaUtentePage;
