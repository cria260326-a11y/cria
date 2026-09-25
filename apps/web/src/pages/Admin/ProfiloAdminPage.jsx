import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import { Bell, Briefcase, Fingerprint, FileSearch, Lock, Mail, Monitor, Phone, RotateCcw, Send, Shield, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import NotaMockup from '@/components/NotaMockup';
import { Chip, Riquadro, Voce } from '@/components/admin/direzione/Elementi';
import { CampoProfilo, DueFattori, Preferenza, SessioneCorrente, SezionePassword, VoceAccount } from '@/components/admin/direzione/SezioniProfilo';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { creaStoreDemo, nuovoIdDemo } from '@/lib/storeDemo';
import { AZIONI } from '@/lib/separazione';
import { giorniSolariTra } from '@/lib/calendario';
import { aggiungiMesi } from '@/lib/aggregati';
import { iniziali, nomeVisualizzato } from '@/lib/aree';
import { fmtData } from '@/lib/formato';
import { FUNZIONI, OPERATORI, nomeOperatore, trovaOperatore } from '@/data/operatori';
import { MESI_UTENZA_INTERNA, utenzaDi } from '@/data/direzione';
import { OGGI } from '@/data/datiDemo';

// ═════════════════════════════════════════════════════════════════════════════
// IL MIO PROFILO, AREA INTERNA — O-32
// Unificato con il profilo personale (F-12): stesse sezioni, nello stesso ordine
// — dati, account, sicurezza, notifiche, sessione — con in più quello che vale
// solo per chi lavora dentro CRIA (§13.4): la funzione, il responsabile, la
// scadenza dell'utenza a 12 mesi con la riconferma.
// I dati personali li cambia ognuno da sé (e restano nel registro); il codice
// fiscale solo l'admin. Funzione e permessi li cambia l'admin: da qui si
// chiede, non si cambia. L'admin ha accesso completo e cambia anche i suoi.
// ═════════════════════════════════════════════════════════════════════════════

// Le richieste di modifica mandate all'amministrazione, nel browser.
const store = creaStoreDemo('criaProfiloInternoDemo', () => ({ richieste: [] }));

// Chi crea l'utenza di chi (§13.4): chi ha qualcuno sotto di sé, e nessun altro.
const LIVELLI = {
    admin: { etichetta: 'Accesso completo', creataDa: 'l’organo amministrativo' },
    operatore: { etichetta: 'Operatore', creataDa: 'il proprio responsabile' },
    responsabile: { etichetta: 'Responsabile di area', creataDa: 'il direttore della propria area' },
    direzione: { etichetta: 'Direzione', creataDa: 'l’amministrazione, su nomina dell’organo amministrativo' },
    controllo: { etichetta: 'Controllo', creataDa: 'l’amministrazione' },
};

const STATO_IDENTITA = {
    non_caricato: { etichetta: 'Da caricare', classe: 'bg-gray-100 text-gray-700' },
    in_attesa: { etichetta: 'In verifica', classe: 'bg-blue-100 text-blue-800' },
    verificato: { etichetta: 'Verificato', classe: 'bg-green-100 text-green-800' },
    da_integrare: { etichetta: 'Da integrare', classe: 'bg-amber-100 text-amber-800' },
};

const CARATTERI_MINIMI = 15;

const ChiediModifica = ({ operatore }) => {
    const [aperta, setAperta] = useState(false);
    const [testo, setTesto] = useState('');
    const { richieste } = store.useStore();
    const mie = richieste.filter(r => r.operatoreId === operatore.id);

    const invia = () => {
        if (testo.trim().length < CARATTERI_MINIMI) { toast.error('Scrivi cosa va cambiato e perché'); return; }
        store.aggiorna(s => ({
            richieste: [{ id: nuovoIdDemo('rich'), operatoreId: operatore.id, testo: testo.trim(), richiestaDa: operatore.id, richiestaIl: OGGI, stato: 'inviata' }, ...s.richieste],
        }));
        toast.success('Richiesta inviata all’amministrazione');
        setTesto('');
        setAperta(false);
    };

    return (
        <div className="rounded-xl border border-border p-4 space-y-3">
            <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                <div className="min-w-0 text-sm">
                    <p className="font-medium text-foreground">Funzione e permessi li cambia l’admin</p>
                    <p className="text-muted-foreground mt-0.5">
                        Funzione, responsabile, permessi e scadenza dell’utenza non si cambiano da sé. Se qualcosa non torna, chiedilo da qui.
                    </p>
                </div>
            </div>
            {aperta ? (
                <div className="space-y-2">
                    <label htmlFor="richiesta-modifica" className="text-xs text-muted-foreground">Cosa va cambiato, e perché</label>
                    <Textarea id="richiesta-modifica" value={testo} onChange={e => setTesto(e.target.value)} rows={3}
                        placeholder="Per esempio: da ottobre seguo anche le contestazioni, mi serve la funzione di assistenza." />
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="gap-1.5" onClick={invia}><Send className="w-3.5 h-3.5" /> Invia all’amministrazione</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setAperta(false); setTesto(''); }}>Annulla</Button>
                    </div>
                </div>
            ) : (
                <Button size="sm" variant="outline" onClick={() => setAperta(true)}>Chiedi una modifica</Button>
            )}
            {mie.length > 0 && (
                <ul className="space-y-2 border-t border-border pt-3">
                    {mie.map(r => (
                        <li key={r.id} className="text-sm">
                            <p className="text-foreground">{r.testo}</p>
                            <p className="text-xs text-muted-foreground">
                                Chiesta da {nomeOperatore(r.richiestaDa)} il {fmtData(r.richiestaIl)} · all’amministrazione · in attesa
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

// ═════════════════════════════════════════════════════════════════════════════
const ProfiloAdminPage = () => {
    const { persona, aggiornaPersona } = useAuth();
    const { operatore } = useOperatoreAttivo();
    const [preferenze, setPreferenze] = useState({ assegnate: true, riepilogo: true });

    if (!persona) return null;

    if (!operatore) {
        return (
            <div className="space-y-6">
                <Helmet><title>Il mio profilo - CRIA</title></Helmet>
                <h1 className="text-2xl font-bold text-foreground">Il mio profilo</h1>
                <Riquadro icona={Briefcase} titolo="Nessun ruolo interno">
                    <p className="text-sm text-muted-foreground">Questo account non ha una funzione dentro CRIA: il profilo è quello personale.</p>
                </Riquadro>
            </div>
        );
    }

    const funzione = FUNZIONI[operatore.funzione];
    const livello = LIVELLI[funzione.livello];
    const responsabile = trovaOperatore(operatore.responsabile);
    const utenza = utenzaDi(operatore.id);
    const scade = utenza ? aggiungiMesi(utenza.attivaDal, MESI_UTENZA_INTERNA) : null;
    const giorni = scade ? giorniSolariTra(OGGI, scade) : null;
    const sotto = OPERATORI.filter(o => o.responsabile === operatore.id);
    const admin = operatore.funzione === 'admin';
    const azioni = admin ? [] : Object.values(AZIONI).filter(a => a.funzioni.includes(operatore.funzione));
    const salva = (campo) => (valore) => aggiornaPersona({ [campo]: valore });
    const identita = STATO_IDENTITA[persona.statoIdentita] || STATO_IDENTITA.non_caricato;

    const cambiaPreferenza = (chiave) => (valore) => {
        setPreferenze(p => ({ ...p, [chiave]: valore }));
        toast.success('Preferenze aggiornate');
    };

    return (
        <>
            <Helmet><title>Il mio profilo - CRIA</title></Helmet>

            <div className="space-y-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold text-foreground mb-1">Il mio profilo</h1>
                        <p className="text-sm text-muted-foreground">Dati, sicurezza e preferenze. La funzione e i permessi li gestisce l’amministrazione.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-base font-bold text-primary">{iniziali(persona)}</span>
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{nomeVisualizzato(persona)}</p>
                            <p className="text-xs text-muted-foreground">{funzione.etichetta} · area interna</p>
                        </div>
                    </div>
                </div>


                <Riquadro icona={Briefcase} titolo="Il mio ruolo in CRIA"
                    sottotitolo="Ruolo provvisorio: la lista definitiva dei ruoli arriva con il governo degli accessi.">
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            <Voce etichetta="Funzione">{funzione.etichetta}</Voce>
                            <Voce etichetta="Livello">{livello.etichetta}</Voce>
                            <Voce etichetta="Responsabile">
                                {responsabile ? `${nomeOperatore(responsabile.id)} · ${FUNZIONI[responsabile.funzione].etichetta}` : 'Risponde all’organo amministrativo'}
                            </Voce>
                            <Voce etichetta="Utenza creata da">
                                {utenza ? nomeOperatore(utenza.creataDa) : '—'}
                                <span className="block text-xs font-normal text-muted-foreground">Per regola: {livello.creataDa}</span>
                            </Voce>
                            <Voce etichetta="Utenza attiva dal">{utenza ? fmtData(utenza.attivaDal) : '—'}</Voce>
                            <Voce etichetta="Scade il">
                                {scade ? fmtData(scade) : '—'}
                                {giorni != null && (
                                    <span className={`block text-xs font-normal ${giorni <= 30 ? 'text-amber-800' : 'text-muted-foreground'}`}>
                                        {giorni > 0 ? `tra ${giorni} giorni` : giorni === 0 ? 'oggi' : `scaduta da ${-giorni} giorni`}
                                    </span>
                                )}
                            </Voce>
                        </div>

                        <p className="text-sm text-foreground">{funzione.cosaFa}.</p>

                        <p className="text-sm text-muted-foreground">
                            Le utenze interne durano {MESI_UTENZA_INTERNA} mesi. Prima della scadenza la riconferma{' '}
                            {responsabile ? nomeOperatore(responsabile.id) : 'l’amministrazione'}; senza riconferma l’accesso si spegne da solo.
                            Quando lasci CRIA, l’amministrazione spegne tutti i tuoi accessi con un solo comando.
                        </p>

                        {sotto.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">Rispondono a te</p>
                                <div className="flex flex-wrap gap-2">
                                    {sotto.map(o => (
                                        <Chip key={o.id} classe="bg-muted text-foreground">{nomeOperatore(o.id)} · {FUNZIONI[o.funzione].etichetta}</Chip>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Le loro utenze le crei e le riconfermi tu, con permessi che hai anche tu. A nessun altro.
                                </p>
                            </div>
                        )}

                        {azioni.length > 0 && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">Azioni che ti spettano</p>
                                <ul className="space-y-1.5 text-sm">
                                    {azioni.map(a => (
                                        <li key={a.etichetta}>
                                            <span className="text-foreground">{a.etichetta}</span>
                                            {a.incompatibilita && <span className="block text-xs text-muted-foreground">{a.incompatibilita}</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <p className="text-sm text-muted-foreground">
                            Il ruolo dice che tipo di dati vedi, l’assegnazione su quali pratiche. Per aprire un fascicolo che non è tuo c’è
                            il vetro da rompere: l’accesso è immediato, e finisce con il motivo nel rapporto del DPO.
                        </p>

                        {admin ? (
                            <p className="text-sm text-muted-foreground">
                                Hai accesso completo: fai quello che fa ogni funzione. Resta una regola: non autorizzi e non confermi quello che hai
                                disposto o preparato tu, come tutti.
                            </p>
                        ) : (
                            <ChiediModifica operatore={operatore} />
                        )}
                    </div>
                </Riquadro>

                <Riquadro icona={User} titolo="Dati personali">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <CampoProfilo key={`nome-${persona.nome}`} etichetta="Nome" valore={persona.nome} onSalva={salva('nome')} />
                        <CampoProfilo key={`cognome-${persona.cognome}`} etichetta="Cognome" valore={persona.cognome} onSalva={salva('cognome')} />
                        <CampoProfilo key={`cf-${persona.codiceFiscale}`} etichetta="Codice fiscale" valore={persona.codiceFiscale}
                            onSalva={admin ? salva('codiceFiscale') : undefined} chiLoCambia="admin" />
                        <CampoProfilo key={`email-${persona.email}`} etichetta="Email" valore={persona.email} icona={Mail} tipo="email" onSalva={salva('email')} />
                        <CampoProfilo key={`tel-${persona.telefono}`} etichetta="Cellulare" valore={persona.telefono} icona={Phone} tipo="tel" onSalva={salva('telefono')} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                        {admin
                            ? 'Da admin cambi tutti i tuoi dati. L’email è anche quella con cui entri. Ogni modifica resta nel registro.'
                            : 'I tuoi dati li cambi tu; il codice fiscale lo cambia l’admin. L’email è anche quella con cui entri. Ogni modifica resta nel registro.'}
                    </p>
                </Riquadro>

                <Riquadro icona={ShieldCheck} titolo="Il mio account">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <VoceAccount to="/profilo/identita" icona={Fingerprint} titolo="Documento d’identità" testo="Caricato e verificato da una persona"
                            badge={<Chip classe={identita.classe}>{identita.etichetta}</Chip>} />
                        <VoceAccount to="/profilo/i-miei-dati" icona={FileSearch} titolo="I miei dati" testo="Chiedi gratis una copia di tutto quello che CRIA ha su di te" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Fatturazione e consensi riguardano i clienti: a chi lavora in CRIA non servono.</p>
                </Riquadro>

                <Riquadro icona={Shield} titolo="Sicurezza" contenuto="space-y-3">
                    <SezionePassword modificataIl={utenza?.attivaDal} />
                    <DueFattori attiva obbligatoria
                        perche="Obbligatorio per chi lavora dentro CRIA: da qui si leggono i dati di altre persone." />
                </Riquadro>

                <Riquadro icona={Bell} titolo="Notifiche" contenuto="space-y-1">
                    <Preferenza bloccata etichetta="Scadenze e risalite"
                        descrizione="Quando una fase si avvicina al termine o lo supera, lo sai tu e il tuo responsabile. Non si spengono: sono il motore delle scadenze." />
                    <Preferenza id="notifica-assegnate" etichetta="Pratiche assegnate a te" descrizione="Quando entra qualcosa nella tua coda"
                        attiva={preferenze.assegnate} onCambia={cambiaPreferenza('assegnate')} />
                    <Preferenza id="notifica-riepilogo" etichetta="Riepilogo del mattino" descrizione="Cosa scade oggi e domani, per email"
                        attiva={preferenze.riepilogo} onCambia={cambiaPreferenza('riepilogo')} />
                </Riquadro>

                <Riquadro icona={Monitor} titolo="Sessioni">
                    <SessioneCorrente onEsciAltrove={() => toast.success('Sei uscito dagli altri dispositivi')} />
                </Riquadro>

                <NotaMockup>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p>Le richieste di modifica restano in questo browser: in piattaforma arrivano all’amministrazione.</p>
                        <Button size="sm" variant="outline" className="gap-1.5 bg-white"
                            onClick={() => { store.ripristina(); toast.success('Richieste demo ripristinate'); }}>
                            <RotateCcw className="w-3.5 h-3.5" /> Ripristina
                        </Button>
                    </div>
                </NotaMockup>
            </div>
        </>
    );
};

export default ProfiloAdminPage;
