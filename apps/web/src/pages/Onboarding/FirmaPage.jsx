import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, MessageSquareText, PenLine, Info } from 'lucide-react';
import AccessoShell, { SCHEDA, TITOLO_STILE } from '@/components/AccessoShell';
import NotaMockup from '@/components/NotaMockup';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { usePratiche, aggiornaPratica } from '@/lib/praticheDemo';
import { OGGI } from '@/data/datiDemo';
import { PRODOTTI, PARAMETRI, nomeProdotto, fmtEuro, calcolaPrezzo } from '@/data/catalogo';
import { fmtData } from '@/lib/formato';
import { nomeVisualizzato } from '@/lib/aree';

// ═════════════════════════════════════════════════════════════════════════════
// FIRMA ELETTRONICA — P-06
// Il contratto di servizio fra il proprietario e CRIA si firma qui, con un
// codice via SMS: niente stampa, scansione o originale da spedire.
// ═════════════════════════════════════════════════════════════════════════════

const CODICE_DEMO = '123456';

const Sezione = ({ n, titolo, children }) => (
    <div className="space-y-1">
        <p className="text-sm font-semibold text-[#1A2D52]">{n}. {titolo}</p>
        <div className="text-sm text-[#6B6B5E] leading-relaxed">{children}</div>
    </div>
);

const FirmaPage = () => {
    const { praticaId } = useParams();
    const { persona } = useAuth();
    const { trova } = usePratiche(persona?.id);
    const p = trova(praticaId);
    const [letto, setLetto] = useState(false);
    const [clausole, setClausole] = useState(false);
    const [inviato, setInviato] = useState(false);
    const [codice, setCodice] = useState('');
    const [errore, setErrore] = useState('');
    const [invio, setInvio] = useState(false);

    const cornice = (contenuto) => (
        <AccessoShell larghezza="max-w-3xl" azione={<Link to={`/dashboard/locatore/pratiche/${praticaId}`} className="text-sm text-[#6B6B5E] hover:text-[#1A2D52]">Torna alla pratica</Link>}>
            {contenuto}
        </AccessoShell>
    );

    if (!p) return cornice(<div className={`${SCHEDA} text-center text-sm text-[#6B6B5E]`}>Questa pratica non è tra le tue.</div>);

    if (p.stato === 'attiva') {
        return (
            <>
                <Helmet><title>Contratto firmato - CRIA</title></Helmet>
                {cornice(
                    <div className={`${SCHEDA} text-center space-y-5`}>
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
                        <div className="space-y-2">
                            <h1 className="text-3xl text-[#1A2D52]" style={TITOLO_STILE}>Contratto firmato</h1>
                            <p className="text-[#6B6B5E]">Firmato il {fmtData(p.firma?.firmataIl || OGGI)}. La pratica di {p.immobile.indirizzo} è attiva: il contratto firmato ti arriva via email e lo trovi nei documenti.</p>
                        </div>
                        <div className="flex gap-3 justify-center flex-wrap">
                            <Link to={`/dashboard/locatore/pratiche/${p.id}`}><Button variant="outline">Vai alla pratica</Button></Link>
                            <Link to="/dashboard/locatore"><Button className="bg-[#1A2D52] hover:bg-[#0F1B33]">Torna alla panoramica</Button></Link>
                        </div>
                    </div>
                )}
            </>
        );
    }
    if (p.stato !== 'firma') {
        return cornice(
            <div className={`${SCHEDA} text-center space-y-3`}>
                <Info className="w-10 h-10 text-[#1A2D52] mx-auto" />
                <p className="text-[#1A2D52]">La firma viene dopo il pagamento: non è ancora il momento.</p>
                <Link to={`/dashboard/locatore/pratiche/${p.id}`} className="text-sm underline underline-offset-4 text-[#1A2D52]">Torna alla pratica</Link>
            </div>
        );
    }

    const prod = PRODOTTI[p.prodotto];
    const prezzo = calcolaPrezzo(p.prodotto, p.canone);
    const finestra = PARAMETRI.giornoScadenzaCanone + PARAMETRI.giorniFinestraCopertura;

    const firma = () => {
        if (codice.trim() !== CODICE_DEMO) { setErrore('Il codice non è corretto'); return; }
        setErrore('');
        setInvio(true);
        setTimeout(() => { aggiornaPratica(p.id, { stato: 'attiva', firma: { firmataIl: OGGI } }); }, 900);
    };

    return (
        <>
            <Helmet><title>Firma - CRIA</title></Helmet>
            {cornice(
                <div className="space-y-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#6B6B5E]">Firma</p>
                        <h1 className="text-3xl text-[#1A2D52]" style={TITOLO_STILE}>Contratto di servizio</h1>
                        <p className="text-sm text-[#6B6B5E]">{nomeProdotto(p.prodotto)} · {p.immobile.indirizzo}, {p.immobile.citta}</p>
                    </div>

                    <div className={`${SCHEDA} space-y-5 max-h-[28rem] overflow-y-auto`}>
                        <Sezione n={1} titolo="Le parti">CRIA e {nomeVisualizzato(persona)}, {persona?.tipo === 'giuridica' ? `partita IVA ${persona.partitaIva}` : `codice fiscale ${persona?.codiceFiscale}`}.</Sezione>
                        <Sezione n={2} titolo="L’oggetto">{nomeProdotto(p.prodotto)} sul contratto di locazione dell’immobile in {p.immobile.indirizzo}, {p.immobile.citta}{p.candidato ? `, con ${p.candidato.nome}` : ''}, canone di {fmtEuro(p.canone)} al mese.</Sezione>
                        <Sezione n={3} titolo="Il prezzo">
                            {prezzo.voci.map(v => `${v.etichetta}: ${fmtEuro(v.annuo, 2)}${v.unaVolta ? ' una volta sola' : ' l’anno'}${v.trattenuta ? ', trattenuta sul canone' : ''}`).join('; ')}. Prezzo congelato il {fmtData(p.pagamento?.pagataIl)}.
                        </Sezione>
                        <Sezione n={4} titolo="Il canone ogni mese">
                            {prod.incassa === 'cria'
                                ? 'CRIA incassa il canone dall’inquilino e lo bonifica al proprietario, al netto della commissione. Il proprietario non deve segnalare nulla.'
                                : `Il proprietario incassa il canone e ogni mese segnala se è arrivato. Il mancato pagamento va segnalato entro il giorno ${finestra}; se entro l’${PARAMETRI.giornoChiusuraMese} non arriva nessuna segnalazione, il mese è non rilevato. Prima della scadenza CRIA manda tre promemoria.`}
                        </Sezione>
                        <Sezione n={5} titolo="La garanzia">
                            {prod.garanzia
                                ? `Copre i mesi segnalati entro il giorno ${finestra}, dopo una franchigia di ${prod.franchigiaMesi} ${prod.franchigiaMesi === 1 ? 'mese' : 'mesi'}. Un mese segnalato dopo quel giorno conta comunque come non pagato, ma non è coperto; un mese non rilevato non è coperto.`
                                : 'Questo prodotto non ha garanzia: la segnalazione serve allo storico dell’inquilino, e se il canone non arriva il recupero parte comunque.'}
                        </Sezione>
                        <Sezione n={6} titolo="Le contestazioni">L’inquilino può contestare una segnalazione di mancato pagamento entro {PARAMETRI.giorniContestazione} giorni, con una prova. Decide CRIA entro {PARAMETRI.giorniRispostaContestazione} giorni, sulle prove di entrambi.</Sezione>
                        <Sezione n={7} titolo="Il resto">Le altre condizioni sono nelle <Link to="/termini" className="underline underline-offset-4 text-[#1A2D52]">condizioni generali</Link>, che fanno parte di questo contratto.</Sezione>
                    </div>

                    <div className={`${SCHEDA} space-y-4`}>
                        <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 mt-0.5 accent-[#1A2D52]" checked={letto} onChange={e => setLetto(e.target.checked)} />
                            Ho letto il contratto di servizio e le condizioni generali
                        </label>
                        <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 mt-0.5 accent-[#1A2D52]" checked={clausole} onChange={e => setClausole(e.target.checked)} />
                            Approvo in modo specifico le clausole sulla segnalazione mensile, sulla garanzia e sulla franchigia
                        </label>
                        {!inviato ? (
                            <Button disabled={!letto || !clausole} onClick={() => setInviato(true)} className="w-full h-12 text-base gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]">
                                <MessageSquareText className="w-5 h-5" /> Mandami il codice via SMS
                            </Button>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-sm text-[#6B6B5E]">Abbiamo mandato un codice di 6 cifre al {persona?.telefono}.</p>
                                <div className="flex gap-3">
                                    <input value={codice} onChange={e => { setCodice(e.target.value.replace(/\D/g, '').slice(0, 6)); setErrore(''); }} inputMode="numeric" placeholder="000000"
                                        className="w-40 h-12 text-center text-xl tracking-[0.4em] rounded-lg border border-[#E5E5DE] focus:outline-none focus:ring-2 focus:ring-[#1A2D52]/20" />
                                    <Button onClick={firma} disabled={codice.length !== 6 || invio} className="flex-1 h-12 text-base gap-2 bg-[#1A2D52] hover:bg-[#0F1B33]">
                                        {invio ? <><Loader2 className="w-5 h-5 animate-spin" /> Firma in corso…</> : <><PenLine className="w-5 h-5" /> Firma</>}
                                    </Button>
                                </div>
                                {errore && <p className="text-sm text-red-600">{errore}</p>}
                            </div>
                        )}
                    </div>

                    {inviato && <NotaMockup>Il codice via SMS nei mockup è sempre {CODICE_DEMO}.</NotaMockup>}
                </div>
            )}
        </>
    );
};

export default FirmaPage;
