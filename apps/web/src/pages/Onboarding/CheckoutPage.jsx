import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Loader2, Lock, Info } from 'lucide-react';
import AccessoShell, { SCHEDA, TITOLO_STILE } from '@/components/AccessoShell';
import NotaMockup from '@/components/NotaMockup';
import MetodiPagamento from '@/components/aree/MetodiPagamento';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { usePratiche, aggiornaPratica } from '@/lib/praticheDemo';
import { OGGI } from '@/data/datiDemo';
import { PRODOTTI, nomeProdotto, fmtEuro, calcolaPrezzo } from '@/data/catalogo';
import { fmtData } from '@/lib/formato';
import { nomeVisualizzato } from '@/lib/aree';
import { useProdotti, causaleCliente } from '@/lib/prodottiDemo';

// ═════════════════════════════════════════════════════════════════════════════
// CHECKOUT — P-05
// Non riepiloga un preventivo: calcola il prezzo dal listino e dal canone, e al
// pagamento lo congela sulla pratica. Con CRIA Completo la commissione la
// trattiene CRIA dal canone: qui si lascia l'IBAN su cui ricevere il bonifico.
// ═════════════════════════════════════════════════════════════════════════════

const Cornice = ({ id, children }) => (
    <AccessoShell larghezza="max-w-3xl" azione={<Link to={`/dashboard/locatore/pratiche/${id}`} className="text-sm text-[#6B6B5E] hover:text-[#1A2D52]">Torna alla pratica</Link>}>
        {children}
    </AccessoShell>
);

const CheckoutPage = () => {
    const { praticaId } = useParams();
    const navigate = useNavigate();
    const { persona } = useAuth();
    const { trova } = usePratiche(persona?.id);
    const catalogo = useProdotti();
    const p = trova(praticaId);
    const [metodo, setMetodo] = useState('');
    const [iban, setIban] = useState('');
    const [errore, setErrore] = useState('');
    const [invio, setInvio] = useState(false);

    if (!p) {
        return <Cornice id={praticaId}><div className={`${SCHEDA} text-center text-sm text-[#6B6B5E]`}>Questa pratica non è tra le tue.</div></Cornice>;
    }
    if (p.stato !== 'pagamento') {
        const pagata = p.stato === 'firma' || p.stato === 'attiva';
        return (
            <Cornice id={p.id}>
                <div className={`${SCHEDA} text-center space-y-3`}>
                    {pagata ? <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" /> : <Info className="w-10 h-10 text-[#1A2D52] mx-auto" />}
                    <p className="text-[#1A2D52]">{pagata ? `Pagata il ${fmtData(p.pagamento?.pagataIl)}.` : 'Il prezzo si paga dopo la verifica di CRIA: non è ancora il momento.'}</p>
                    <Link to={`/dashboard/locatore/pratiche/${p.id}`} className="text-sm underline underline-offset-4 text-[#1A2D52]">Torna alla pratica</Link>
                </div>
            </Cornice>
        );
    }

    const prod = PRODOTTI[p.prodotto];
    const prezzo = calcolaPrezzo(p.prodotto, p.canone);
    const incassaCria = prod.incassa === 'cria';
    const daPagare = prezzo.daPagare;

    const conferma = () => {
        if (incassaCria && !/^IT\d{2}[A-Z]\d{10}[0-9A-Z]{12}$/.test(iban.replace(/\s/g, '').toUpperCase())) {
            setErrore('Serve un IBAN italiano valido: è il conto su cui ti bonifichiamo il canone');
            return;
        }
        if (daPagare > 0 && !metodo) {
            setErrore('Scegli come pagare');
            return;
        }
        setErrore('');
        setInvio(true);
        setTimeout(() => {
            aggiornaPratica(p.id, { stato: 'firma', pagamento: { pagataIl: OGGI, prezzoCongelato: true, importo: daPagare, metodo: metodo || 'trattenuta' } });
            navigate(`/firma/${p.id}`);
        }, 900);
    };

    return (
        <>
            <Helmet><title>Pagamento - CRIA</title></Helmet>
            <Cornice id={p.id}>
                <div className="space-y-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#6B6B5E]">Prezzo e pagamento</p>
                        <h1 className="text-3xl text-[#1A2D52]" style={TITOLO_STILE}>{p.immobile.indirizzo}</h1>
                        <p className="text-sm text-[#6B6B5E]">{nomeProdotto(p.prodotto)} · canone {fmtEuro(p.canone)}/mese · verifica di CRIA conclusa il {fmtData(p.istruttoria?.conclusaIl)}</p>
                    </div>

                    <div className={`${SCHEDA} space-y-4`}>
                        <div className="divide-y divide-[#E5E5DE]">
                            {prezzo.voci.map(v => (
                                <div key={v.etichetta} className="flex justify-between gap-4 py-3">
                                    <span><span className="text-sm text-foreground">{v.etichetta}</span><span className="block text-xs text-muted-foreground">{v.nota}</span></span>
                                    <span className="text-sm tabular-nums whitespace-nowrap text-foreground">{fmtEuro(v.annuo, 2)}{v.unaVolta ? '' : '/anno'}</span>
                                </div>
                            ))}
                            <div className="flex justify-between gap-4 py-3 text-sm font-semibold text-[#1A2D52]"><span>{prezzo.unaVolta ? 'Totale' : 'Totale annuo'}</span><span className="tabular-nums">{fmtEuro(prezzo.annuo, 2)}</span></div>
                        </div>
                        <div className="rounded-xl bg-[#1A2D52] text-white p-5 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-sm text-white/70">Da pagare adesso</p>
                                <p className="text-3xl" style={TITOLO_STILE}>{fmtEuro(daPagare, 2)}</p>
                            </div>
                            <p className="text-xs text-white/70 text-right max-w-[16rem]">Prezzo del listino al {fmtData(OGGI)}. Con il pagamento si congela sulla pratica: se il listino cambia, il tuo contratto no.</p>
                        </div>
                        {incassaCria && (
                            <p className="text-sm text-[#6B6B5E]">Con {nomeProdotto(p.prodotto)} la commissione del {prod.percentuale}% la trattiene CRIA dal canone che incassa: adesso non paghi niente.</p>
                        )}
                    </div>

                    <div className={`${SCHEDA} space-y-5`}>
                        {incassaCria && (
                            <div className="space-y-1.5">
                                <Label htmlFor="iban">IBAN su cui ricevere il canone <span className="text-red-500">*</span></Label>
                                <input id="iban" value={iban} onChange={e => { setIban(e.target.value); setErrore(''); }} placeholder="IT60 X054 2811 1010 0000 0123 456"
                                    className="w-full h-10 text-sm rounded-lg border border-[#E5E5DE] px-3 bg-white uppercase focus:outline-none focus:ring-2 focus:ring-[#1A2D52]/20" />
                                <p className="text-xs text-muted-foreground">Ogni mese CRIA incassa il canone dall’inquilino e te lo bonifica qui, al netto della commissione.</p>
                            </div>
                        )}
                        {daPagare > 0 && (
                            <MetodiPagamento
                                metodi={['carta', 'sepa', 'bonifico']}
                                valore={metodo}
                                onScegli={(m) => { setMetodo(m); setErrore(''); }}
                                prodotto={catalogo.trova(p.prodotto)}
                                importo={daPagare}
                                causale={causaleCliente(catalogo.trova(p.prodotto), p.immobile.indirizzo)}
                                notaBonifico="La pratica prosegue quando il bonifico arriva"
                            />
                        )}
                        <div className="text-sm text-[#6B6B5E] flex items-center justify-between gap-3 flex-wrap">
                            <span>Fattura intestata a <span className="text-foreground font-medium">{nomeVisualizzato(persona)}</span></span>
                            <Link to="/profilo/fatturazione" className="underline underline-offset-4 text-[#1A2D52]">Dati di fatturazione</Link>
                        </div>
                        {errore && <p className="text-sm text-red-600">{errore}</p>}
                        <Button onClick={conferma} disabled={invio} className="w-full h-12 text-base bg-[#1A2D52] hover:bg-[#0F1B33]">
                            {invio ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Conferma in corso…</> : daPagare > 0 ? `Paga ${fmtEuro(daPagare, 2)} e passa alla firma` : 'Conferma e passa alla firma'}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Pagamento protetto · poi firmi il contratto di servizio</p>
                    </div>

                    <NotaMockup>Nei mockup si paga l’importo annuo in un’unica soluzione: rate e scadenze le decide il pannello prodotti.</NotaMockup>
                </div>
            </Cornice>
        </>
    );
};

export default CheckoutPage;
