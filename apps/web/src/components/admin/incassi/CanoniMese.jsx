import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { nomeProdotto, fmtEuro, COLORE_PRODOTTO, PRODOTTI } from '@/data/catalogo';
import { STATI_CANONE, canoneDelMese, MESE_PROSSIMO } from '@/lib/incassiDemo';
import { ESITI_MESE, esitoMese } from '@/lib/semaforo';
import { fmtData, meseBreve, nomeMese } from '@/lib/formato';
import { Pill, Voce } from '@/components/admin/istruttoria/Elementi';

// ═════════════════════════════════════════════════════════════════════════════
// Canoni attesi e ricevuti (O-11). Con CRIA Completo incassa CRIA: il dato
// viene dal conto, e il canone si gira al proprietario meno la commissione.
// Con gli altri prodotti incassa il proprietario: il dato è la sua segnalazione.
// ═════════════════════════════════════════════════════════════════════════════

const FONTE = {
    riconciliazione: 'dal conto di CRIA',
    proprietario: 'segnalato dal proprietario',
    automatica: 'nessuna risposta: scritto dal sistema',
};

export const totaliDelMese = (righe) => {
    const conCanone = righe.filter(r => r.stato !== 'fuori');
    const somma = (lista, campo) => lista.reduce((s, r) => s + (r[campo] || 0), 0);
    const nonPagati = conCanone.filter(r => ['non_pagato', 'contestato', 'contestabile'].includes(r.stato));
    return {
        attesi: somma(conCanone, 'atteso'),
        ricevutiCria: somma(conCanone.filter(r => r.cria), 'ricevuto'),
        ricevutiProprietario: somma(conCanone.filter(r => !r.cria), 'ricevuto'),
        nonPagati: somma(nonPagati, 'atteso'),
        quantiNonPagati: nonPagati.length,
        nonRilevati: conCanone.filter(r => r.stato === 'non_rilevato').length,
    };
};

export const righeDelMese = (contratti, mese, movimenti) =>
    contratti.map(c => canoneDelMese(c, mese, movimenti)).filter(r => r.stato !== 'fuori');

const Ricevuto = ({ r }) => {
    if (!r.ricevuto) return <span className="text-sm text-muted-foreground">—</span>;
    return (
        <span className="text-sm">
            {fmtEuro(r.ricevuto)} il {fmtData(r.ricevutoIl)}
            <span className="block text-xs text-muted-foreground">{FONTE[r.fonte]}{r.rettificato ? ' · rettificato dopo una contestazione' : ''}</span>
        </span>
    );
};

export const RigheCanoni = ({ righe }) => (
    <div className="space-y-2.5">
        {righe.map(r => {
            const c = r.contratto;
            const stato = STATI_CANONE[r.stato];
            return (
                <div key={c.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="font-semibold text-foreground">{c.immobile.indirizzo}</p>
                            <p className="text-xs text-muted-foreground">Proprietario {c.locatore.nome} · inquilino {c.conduttore.nome}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <Pill classe={COLORE_PRODOTTO[c.prodotto]}>{nomeProdotto(c.prodotto)}</Pill>
                            <Pill classe={r.cria ? 'bg-purple-50 text-purple-800' : 'bg-slate-100 text-slate-700'}>{r.cria ? 'incassa CRIA' : 'incassa il proprietario'}</Pill>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                        <Voce etichetta="Atteso">{fmtEuro(r.atteso)}</Voce>
                        <Voce etichetta="Stato"><Pill classe={stato.classe}>{stato.etichetta}</Pill></Voce>
                        <Voce etichetta="Ricevuto"><Ricevuto r={r} /></Voce>
                        {r.cria ? (
                            <Voce etichetta={`Al proprietario, meno il ${PRODOTTI[c.prodotto].percentuale}%`}>
                                {r.giratoIl ? <span className="text-sm">{fmtEuro(r.girato, 2)} il {fmtData(r.giratoIl)}<span className="block text-xs text-muted-foreground">trattenuti {fmtEuro(r.trattenuta, 2)}</span></span>
                                    : <span className="text-sm text-muted-foreground">{r.ricevuto ? 'Da girare: lo dispone la tesoreria' : '—'}</span>}
                            </Voce>
                        ) : (
                            <Voce etichetta="Chi lo sa">{r.fonte === 'automatica' ? 'Nessuno: il proprietario non ha risposto' : 'Il proprietario, che incassa'}</Voce>
                        )}
                    </div>
                    {(r.nota || r.contestazioneId || r.contestabileFino || r.morosita || r.movimenti?.length > 0) && (
                        <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            {r.nota && <span>{r.nota}</span>}
                            {r.contestabileFino && <span>L’inquilino può contestare fino al {fmtData(r.contestabileFino)}</span>}
                            {r.contestazioneId && <Link className="underline underline-offset-2 hover:text-foreground" to={`/dashboard/admin/contestazioni/${r.contestazioneId}`}>Contestazione in corso</Link>}
                            {r.morosita && <Link className="underline underline-offset-2 hover:text-foreground" to={`/dashboard/admin/morosita/${r.morosita.id}`}>Pratica di morosità</Link>}
                            {r.movimenti?.map(m => (
                                <Link key={m.id} className="underline underline-offset-2 hover:text-foreground" to="/dashboard/admin/riconciliazione">Bonifico del {fmtData(m.data)} · {fmtEuro(m.importo)}</Link>
                            ))}
                        </p>
                    )}
                </div>
            );
        })}
    </div>
);

// I dodici mesi, contratto per contratto: dentro la tabella si scorre, la pagina no.
const coloreCella = (r) => {
    if (r.stato === 'ricevuto' && r.meseDati) return ESITI_MESE[esitoMese(r.meseDati)].colore;
    return { anticipo: '#22C55E', parziale: '#F59E0B', non_pagato: '#EF4444', contestato: '#3B82F6', contestabile: '#F97316', non_rilevato: '#9CA3AF' }[r.stato] || null;
};

export const MatriceCanoni = ({ contratti, mesi, movimenti }) => {
    const colonne = [...mesi, MESE_PROSSIMO];
    return (
        <Card>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="text-xs">
                        <thead className="bg-muted/40 text-muted-foreground">
                            <tr>
                                <th className="sticky left-0 bg-muted/90 px-3 py-2 text-left font-medium min-w-[9rem]">Contratto</th>
                                {colonne.map(m => <th key={m} className="px-1.5 py-2 font-medium whitespace-nowrap" title={nomeMese(m)}>{meseBreve(m)}{m === MESE_PROSSIMO ? ' ·' : ''}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {contratti.map(c => (
                                <tr key={c.id}>
                                    <td className="sticky left-0 bg-card px-3 py-2">
                                        <p className="font-medium text-foreground whitespace-nowrap">{c.immobile.indirizzo}</p>
                                        <p className="text-muted-foreground whitespace-nowrap">{nomeProdotto(c.prodotto)}</p>
                                    </td>
                                    {colonne.map(m => {
                                        const r = canoneDelMese(c, m, movimenti);
                                        const colore = coloreCella(r);
                                        // Dentro la casella solo il giorno di pagamento: il resto lo dice il colore.
                                        const testo = r.stato === 'ricevuto' ? r.giorno : '';
                                        return (
                                            <td key={m} className="px-1.5 py-2 text-center" title={`${nomeMese(m)}: ${STATI_CANONE[r.stato].etichetta}${r.ricevutoIl ? ` il ${fmtData(r.ricevutoIl)}` : ''}`}>
                                                {r.stato === 'fuori' ? null : (
                                                    <span className={`inline-flex w-7 h-7 items-center justify-center rounded-md font-semibold tabular-nums ${colore ? 'text-white' : 'border border-dashed border-blue-300 text-blue-700'}`} style={colore ? { backgroundColor: colore } : undefined}>
                                                        {testo}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-4 py-3 border-t border-border text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: ESITI_MESE.puntuale.colore }} /> Il numero è il giorno: entro il 5</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: ESITI_MESE.ritardo.colore }} /> dal 6 al 10</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: ESITI_MESE.grave.colore }} /> dopo il 10, o non pagato</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500" /> contestato</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-orange-500" /> contestabile</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-400" /> non rilevato</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm border border-dashed border-blue-300" /> {nomeMese(MESE_PROSSIMO)}: atteso</span>
                </div>
            </CardContent>
        </Card>
    );
};
