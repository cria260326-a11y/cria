import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Archive, KeyRound, MessageSquare, History, UserRound } from 'lucide-react';
import { Chip, Voce } from '@/components/admin/anagrafica/ElementiScheda';
import {
    avvisiRuoli, nomeDaAnagrafica, percorsoSoggetto, vociStorico,
    CANALI_CONTATTO, RUOLI_UTENTE, VOCI_STORICO,
} from '@/lib/anagraficheDemo';
import { fmtData } from '@/lib/formato';

// ═════════════════════════════════════════════════════════════════════════════
// Cosa succederà quando l'utente preparato viene confermato. Lo legge chi lo
// prepara, all'ultimo passo, e lo rilegge il responsabile che lo conferma:
// utente nuovo, accesso e ruoli, contatto col cliente, anagrafiche che si
// archiviano, storico che passa.
// ═════════════════════════════════════════════════════════════════════════════

const Blocco = ({ icona: Icona, titolo, children }) => (
    <section className="rounded-lg border border-border p-3 sm:p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Icona className="w-4 h-4" /> {titolo}</h3>
        {children}
    </section>
);

const indirizzoLeggibile = (i) => (i ? `${i.via}, ${[i.cap, i.citta].filter(Boolean).join(' ')} · ${i.paese}` : '—');

const RiepilogoUtente = ({ p, modello }) => {
    const a = p.anagrafica || {};
    const vecchie = (p.daAnagrafiche || []).map(id => modello.trova(id)).filter(Boolean);
    const avvisi = avvisiRuoli(p, modello);
    const liberate = (id) => Object.entries(p.libera?.[id] || {}).filter(([, si]) => si).map(([campo]) => (campo === 'email' ? 'l’email' : 'il cellulare'));

    return (
        <div className="space-y-3 text-sm">
            <Blocco icona={UserRound} titolo="L’utente nuovo">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Voce etichetta={a.tipo === 'giuridica' ? 'Ragione sociale' : 'Nome e cognome'}>{nomeDaAnagrafica(a) || '—'}</Voce>
                    <Voce etichetta="Codice fiscale"><span className="font-mono text-xs break-all">{a.codiceFiscale || '—'}</span></Voce>
                    {a.tipo === 'giuridica' ? (
                        <>
                            <Voce etichetta="Partita IVA"><span className="font-mono text-xs">{a.partitaIva || '—'}</span></Voce>
                            <Voce etichetta="Legale rappresentante">
                                {[a.rappresentante?.nome, a.rappresentante?.cognome].filter(Boolean).join(' ') || '—'}
                                {a.rappresentante?.codiceFiscale && <span className="block font-mono text-xs font-normal">{a.rappresentante.codiceFiscale}</span>}
                            </Voce>
                        </>
                    ) : (
                        <Voce etichetta="Nascita">{a.dataNascita ? `${fmtData(a.dataNascita)}${a.luogoNascita ? `, ${a.luogoNascita}` : ''}` : '—'}</Voce>
                    )}
                    <Voce etichetta={a.tipo === 'giuridica' ? 'Sede' : 'Indirizzo'} className="sm:col-span-2">{indirizzoLeggibile(a.indirizzo)}</Voce>
                </div>
            </Blocco>

            <Blocco icona={KeyRound} titolo="Accesso">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Voce etichetta="Email di accesso"><span className="break-all">{p.credenziali?.email || '—'}</span></Voce>
                    <Voce etichetta="Cellulare">{p.credenziali?.telefono || '—'}</Voce>
                    <Voce etichetta="Ruoli" className="sm:col-span-2">
                        {(p.ruoli || []).length === 0 ? '—' : (
                            <span className="flex flex-wrap gap-1.5">{p.ruoli.map(r => <Chip key={r} classe="bg-muted text-foreground">{RUOLI_UTENTE[r]?.etichetta || r}</Chip>)}</span>
                        )}
                    </Voce>
                </div>
                <p className="text-xs text-muted-foreground">
                    La password provvisoria si genera alla conferma e si mostra una volta sola a chi conferma. Al primo accesso la persona la cambia e conferma email e cellulare; poi l’identità si verifica come per chi si registra.
                </p>
            </Blocco>

            {p.contatto && (
                <Blocco icona={MessageSquare} titolo="Contatto con il cliente">
                    <p className="text-foreground">
                        {fmtData(p.contatto.il)} · {CANALI_CONTATTO[p.contatto.canale] || '—'}
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                        {p.contatto.stessaPersona && <li>Ha confermato di essere la stessa persona delle due anagrafiche.</li>}
                        {p.contatto.recapitiScelti && <li>Ha scelto l’email e il cellulare con cui entrerà.</li>}
                        {p.contatto.nota && <li>Nota: {p.contatto.nota}</li>}
                    </ul>
                </Blocco>
            )}

            {vecchie.length > 0 && (
                <Blocco icona={Archive} titolo="Anagrafiche che si archiviano">
                    <ul className="space-y-2">
                        {vecchie.map(v => (
                            <li key={v.id}>
                                <Link to={percorsoSoggetto(v.id)} className="font-medium text-foreground underline decoration-muted-foreground/40 hover:decoration-foreground">{v.nomeCompleto}</Link>
                                <span className="text-muted-foreground"> · {v.origineBreve}</span>
                                <span className="block text-xs text-muted-foreground break-all">
                                    Email nuova: <span className="font-mono">archiviato+{v.id}@cri-affitti.it</span> · cellulare tolto
                                </span>
                                {liberate(v.id).length > 0 && (
                                    <span className="block text-xs text-muted-foreground">Da qui {liberate(v.id).length > 1 ? 'passano' : 'passa'} all’utente nuovo {liberate(v.id).join(' e ')}.</span>
                                )}
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-muted-foreground">
                        L’accesso si chiude, email e cellulare cambiano. Restano in archivio e rimandano all’utente nuovo: niente si cancella.
                    </p>
                </Blocco>
            )}

            {vecchie.length > 0 && (
                <Blocco icona={History} titolo="Storico che passa all’utente nuovo">
                    {vecchie.map(v => {
                        const voci = vociStorico(v, modello);
                        const scelte = p.storico?.[v.id] || {};
                        const portate = Object.keys(VOCI_STORICO).flatMap(tipo => voci[tipo].filter(x => (scelte[tipo] || []).includes(x.id)).map(x => ({ ...x, tipo })));
                        return (
                            <div key={v.id} className="space-y-1">
                                <p className="text-xs font-medium text-foreground">Da {v.nomeCompleto} · {v.origineBreve}</p>
                                {portate.length === 0
                                    ? <p className="text-xs text-muted-foreground">Niente.</p>
                                    : (
                                        <ul className="text-xs text-muted-foreground space-y-0.5">
                                            {portate.map(x => <li key={`${x.tipo}-${x.id}`}>{VOCI_STORICO[x.tipo]}: {x.etichetta}</li>)}
                                        </ul>
                                    )}
                            </div>
                        );
                    })}
                    <p className="text-xs text-muted-foreground">La reputazione non si copia: si ricalcola dai contratti portati.</p>
                </Blocco>
            )}

            {avvisi.length > 0 && (
                <ul className="space-y-1.5">
                    {avvisi.map(t => (
                        <li key={t} className="flex items-start gap-1.5 text-xs text-amber-800"><AlertTriangle className="w-4 h-4 flex-shrink-0" /> {t}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RiepilogoUtente;
