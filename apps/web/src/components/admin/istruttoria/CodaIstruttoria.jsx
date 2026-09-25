import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Inbox } from 'lucide-react';
import { ESITI } from '@/data/istruttoria';
import { nomeOperatore } from '@/data/operatori';
import { COLORE_PRODOTTO, PRODOTTI } from '@/data/catalogo';
import { FASI, percorsoVoce } from '@/lib/istruttoriaDemo';
import { Pill, Termine } from '@/components/admin/istruttoria/Elementi';

// ═════════════════════════════════════════════════════════════════════════════
// La coda dell'istruttoria (O-07): per fase, con il filtro «le mie».
// ═════════════════════════════════════════════════════════════════════════════

export const VISTE = [
    { id: 'da_deliberare', etichetta: 'Da deliberare', filtro: v => v.fase === 'da_deliberare' && v.tipo !== 'verifica', vuota: 'Nessuna pratica da deliberare.' },
    { id: 'in_arrivo', etichetta: 'In arrivo', filtro: v => v.fase === 'in_arrivo', vuota: 'Nessuna pratica in attesa di documenti.' },
    { id: 'verifiche', etichetta: PRODOTTI.P3.nome, filtro: v => v.tipo === 'verifica', vuota: `Nessuna richiesta di ${PRODOTTI.P3.nome}.` },
    { id: 'deliberate', etichetta: 'Deliberate', filtro: v => v.fase === 'deliberata' && v.tipo !== 'verifica', vuota: 'Nessuna delibera.' },
];

const COLORE_TIPO = { autocandidatura: 'bg-teal-100 text-teal-800', verifica: 'bg-amber-100 text-amber-800' };

const ordina = (voci) => [...voci].sort((a, b) => {
    const chiusaA = a.fase === 'deliberata';
    const chiusaB = b.fase === 'deliberata';
    if (chiusaA !== chiusaB) return chiusaA ? 1 : -1;
    if (chiusaA) return (b.conclusaIl || '').localeCompare(a.conclusaIl || '');
    return (a.termine?.data || '9999').localeCompare(b.termine?.data || '9999') || a.arrivataIl.localeCompare(b.arrivataIl);
});

const RigaVoce = ({ v, vista }) => {
    const esito = v.delibera?.esito;
    return (
        <Link to={`${percorsoVoce(v.chiave)}${vista === 'da_deliberare' ? '' : `&vista=${vista}`}`} className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition">
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{v.titolo}</p>
                        <Pill classe={COLORE_TIPO[v.tipo] || COLORE_PRODOTTO[v.prodotto] || 'bg-slate-100 text-slate-700'}>{v.tipo === 'pratica' || v.tipo === 'contratto' ? v.prodotto : v.etichettaTipo}</Pill>
                        {v.fase === 'deliberata'
                            ? esito && <Pill classe={ESITI[esito]?.classe}>{ESITI[esito]?.etichetta}</Pill>
                            : <Pill classe={FASI[v.fase].classe}>{v.tipo === 'verifica' ? 'Da pubblicare' : FASI[v.fase].etichetta}</Pill>}
                        {v.delibera?.dissenso && <Pill classe="bg-amber-50 text-amber-800 border border-amber-200">dissenso</Pill>}
                    </div>
                    <p className="text-xs text-muted-foreground">{v.sottotitolo}</p>
                    <p className="text-sm text-foreground">
                        {v.tipo === 'verifica' ? `Cliente ${v.cliente}` : v.tipo === 'autocandidatura' ? `Inquilino ${v.cliente}` : `${v.cliente}${v.candidato ? ` · candidato ${v.candidato}` : ''}`}
                    </p>
                    <p className="text-sm text-muted-foreground">{v.statoTesto}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                        <span>
                            {v.fase === 'deliberata' ? 'Seguita da' : 'In coda a'} {v.assegnazione.operatoreId ? nomeOperatore(v.assegnazione.operatoreId) : '—'}
                            {v.assegnazione.forzata && ' · assegnata a mano'}
                        </span>
                        {v.fase !== 'deliberata' && <Termine termine={v.termine} />}
                        {v.fase !== 'deliberata' && v.avanzamento?.totale > 0 && <span>Documenti conformi: {v.avanzamento.verificati} di {v.avanzamento.totale}</span>}
                        {v.fase === 'da_deliberare' && v.proposta && <span>Proposta: {(ESITI[v.proposta.esito]?.proposta || ESITI[v.proposta.esito]?.etichetta || '').toLowerCase()}</span>}
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
            </div>
        </Link>
    );
};

const CodaIstruttoria = ({ voci, vista, onVista, mie, onMie, operatoreId, conFiltroMie }) => {
    const base = mie ? voci.filter(v => v.assegnazione.operatoreId === operatoreId) : voci;
    const attiva = VISTE.find(x => x.id === vista) || VISTE[0];
    const elenco = ordina(base.filter(attiva.filtro));

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5" role="tablist">
                    {VISTE.map(x => {
                        const n = base.filter(x.filtro).filter(v => x.id === 'deliberate' || v.fase !== 'deliberata').length;
                        return (
                            <button
                                key={x.id} type="button" role="tab" aria-selected={x.id === attiva.id} onClick={() => onVista(x.id)}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${x.id === attiva.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                            >
                                {x.etichetta}
                                <span className={`tabular-nums text-xs ${x.id === attiva.id ? 'text-primary-foreground/80' : ''}`}>{n}</span>
                            </button>
                        );
                    })}
                </div>
                {conFiltroMie && (
                    <div className="inline-flex rounded-lg border border-border p-0.5 text-sm">
                        {[{ id: true, t: 'Le mie' }, { id: false, t: 'Tutte' }].map(o => (
                            <button key={String(o.id)} type="button" onClick={() => onMie(o.id)}
                                className={`rounded-md px-3 py-1 ${mie === o.id ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                                {o.t}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {elenco.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center space-y-2">
                        <Inbox className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                        <p className="text-sm text-muted-foreground">{attiva.vuota}{mie ? ' Guarda anche «Tutte».' : ''}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-2.5">{elenco.map(v => <RigaVoce key={v.chiave} v={v} vista={attiva.id} />)}</div>
            )}
        </div>
    );
};

export default CodaIstruttoria;
