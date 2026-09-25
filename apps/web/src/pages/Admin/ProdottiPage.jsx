import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertTriangle, Landmark, Plus, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import IntestazionePagina from '@/components/aree/IntestazionePagina';
import InfoSpiegazione from '@/components/aree/InfoSpiegazione';
import NotaMockup from '@/components/NotaMockup';
import AzioneSeparata from '@/components/admin/AzioneSeparata';
import { MODO_DEMO } from '@/lib/supabase';
import {
    useProdotti, ripristinaProdottiDemo, prezzoInBreve, etichettaTipo, perChi, bonificoPronto, causaleDelContratto,
    percorsoProdotto, PERCORSO_NUOVO_PRODOTTO,
} from '@/lib/prodottiDemo';

// ═════════════════════════════════════════════════════════════════════════════
// PRODOTTI — O-21
// Quello che CRIA vende, a box: prezzo, a chi, e dove il cliente fa il
// bonifico. Un box apre la scheda del prodotto, «Aggiungi prodotto» ne crea uno
// nuovo. Niente versioni del listino: un prezzo cambiato vale per chi paga da
// quel momento, e chi ha già pagato tiene il suo (è congelato sulla pratica).
// Aggiunge e modifica il responsabile prodotto.
// ═════════════════════════════════════════════════════════════════════════════

const Pillola = ({ children }) => (
    <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{children}</span>
);

const BoxProdotto = ({ p }) => (
    <Link to={percorsoProdotto(p.codice)} className="group block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
        <Card className={`h-full transition-shadow group-hover:shadow-md ${p.attivo ? '' : 'opacity-70'}`}>
            <CardContent className="flex h-full flex-col gap-3 pt-5 pb-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="font-semibold text-foreground">
                            {p.nome}{p.variante && <span className="font-normal text-muted-foreground"> · {p.variante}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {p.quota ? 'Per ogni pratica del proprietario' : `${etichettaTipo(p.tipo)} · per ${perChi(p.cliente)}`}
                        </p>
                    </div>
                    <span className="flex-shrink-0 rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-foreground">{p.quota ? 'Quota' : p.codice}</span>
                </div>

                <p className="text-xl font-bold text-foreground">{prezzoInBreve(p)}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{p.sintesi}</p>

                {p.cliente === 'proprietario' && !p.quota && (
                    <div className="flex flex-wrap gap-1.5">
                        <Pillola>{p.garanzia ? 'Con garanzia' : 'Senza garanzia'}</Pillola>
                        <Pillola>{p.incassa === 'cria' ? 'Il canone lo incassa CRIA' : 'Il canone lo incassa il proprietario'}</Pillola>
                    </div>
                )}

                <div className="mt-auto border-t border-border pt-3 text-xs">
                    {bonificoPronto(p) ? (
                        <p className="flex items-start gap-2 text-muted-foreground">
                            <Landmark className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span className="min-w-0">
                                {causaleDelContratto(p) ? 'Canone dell’inquilino su ' : 'Bonifico su '}
                                <span className="font-mono text-foreground break-all">{p.bonifico.iban}</span>
                                <span className="block">{causaleDelContratto(p) ? 'Causale: il codice del contratto' : `Causale: «${p.bonifico.causale}»`}</span>
                            </span>
                        </p>
                    ) : (
                        <p className="flex items-start gap-2 text-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            Manca l’IBAN: il cliente non può pagare con bonifico
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    </Link>
);

const ProdottiPage = () => {
    const navigate = useNavigate();
    const { attivi, nonAttivi } = useProdotti({ admin: true });

    const ripristina = () => {
        ripristinaProdottiDemo();
        toast.success('Prodotti ripristinati come all’inizio');
    };

    return (
        <>
            <Helmet><title>Prodotti - CRIA</title></Helmet>

            <div className="space-y-6">
                <IntestazionePagina
                    titolo="Prodotti"
                    sottotitolo="Quello che CRIA vende: il prezzo, a chi, e dove il cliente fa il bonifico."
                    badge={(
                        <InfoSpiegazione etichetta="Come funzionano i prodotti" allinea="start">
                            <p>Apri un box per cambiare nome, descrizione, prezzo o estremi del bonifico. «Aggiungi prodotto» ne crea uno nuovo.</p>
                            <p>I prodotti non si comprano dalla vetrina: il proprietario li sceglie all’inizio dell’iscrizione e li paga dopo la verifica di CRIA. Un prodotto nuovo del proprietario compare lì da subito; uno tolto dalla vendita sparisce.</p>
                            <p>Un prezzo cambiato vale per chi paga da quel momento: chi ha già pagato tiene il suo.</p>
                            <p>Tipo di prodotto, cliente, garanzia e chi incassa il canone si scelgono quando il prodotto nasce e poi non cambiano: su quelli poggiano i contratti firmati. Per cambiarli si crea un prodotto nuovo e si toglie dalla vendita il vecchio.</p>
                            <p>Gli estremi del bonifico li vede il cliente quando sceglie di pagare con bonifico. Senza IBAN il bonifico non si può scegliere.</p>
                            <p>Aggiunge e modifica il responsabile prodotto.</p>
                        </InfoSpiegazione>
                    )}
                    azioni={(
                        <AzioneSeparata azione="modifica_listino" allineamento="end" size="default" className="gap-2" onEsegui={() => navigate(PERCORSO_NUOVO_PRODOTTO)}>
                            <Plus className="w-4 h-4" /> Aggiungi prodotto
                        </AzioneSeparata>
                    )}
                />

                <section aria-label="Prodotti in vendita" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {attivi.map(p => <BoxProdotto key={p.codice} p={p} />)}
                </section>

                {nonAttivi.length > 0 && (
                    <section aria-labelledby="titolo-non-attivi" className="space-y-3">
                        <h2 id="titolo-non-attivi" className="text-base font-semibold text-foreground">Non più in vendita</h2>
                        <p className="text-sm text-muted-foreground -mt-2">Chi li ha già comprati li tiene. Si rimettono in vendita dalla loro scheda.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {nonAttivi.map(p => <BoxProdotto key={p.codice} p={p} />)}
                        </div>
                    </section>
                )}

                <NotaMockup>
                    <p>
                        {MODO_DEMO
                            ? 'I prodotti e le modifiche restano in questo browser. '
                            : 'I prodotti e le modifiche si salvano nel database: nomi, prezzi ed estremi del bonifico li vedono subito vetrina, aree e pagamenti. '}
                        Aggiungono e cambiano i prodotti l’admin e Matteo Sala, responsabile prodotto. Un prodotto nuovo per inquilini, agenzie o
                        chi sta per affittare è nel catalogo, ma non ha ancora un percorso di acquisto: oggi ce l’hanno solo quelli del proprietario.
                    </p>
                    {MODO_DEMO && (
                        <Button size="sm" variant="outline" className="mt-3 gap-2 bg-white" onClick={ripristina}>
                            <RotateCcw className="w-3.5 h-3.5" /> Ripristina i prodotti
                        </Button>
                    )}
                </NotaMockup>
            </div>
        </>
    );
};

export default ProdottiPage;
