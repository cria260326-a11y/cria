import React from 'react';
import { History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { nomeOperatore } from '@/data/operatori';
import { CANALI_CONTATTO, ESITI_CONTATTO, MOTIVI_LEGALE } from '@/data/garanzia';
import { fmtEuro } from '@/data/catalogo';
import { fmtData, fmtDataLunga } from '@/lib/formato';
import { nomeAvvocato } from './stati';

// ═════════════════════════════════════════════════════════════════════════════
// Cosa è successo, in ordine, e chi lo vede. I passaggi che vedono anche
// proprietario e inquilino sono quelli della loro area (MOROSITA): qui si
// aggiungono i passi interni, così il back office legge la stessa storia con
// in più quello che resta a CRIA.
// ═════════════════════════════════════════════════════════════════════════════

const CHI = {
    entrambi: { testo: 'Lo vedono proprietario e inquilino', classe: 'text-blue-800 bg-blue-50' },
    proprietario: { testo: 'Lo vede il proprietario', classe: 'text-blue-800 bg-blue-50' },
    cria: { testo: 'Solo CRIA', classe: 'text-muted-foreground bg-muted' },
};

const eventiDellaPratica = (p) => {
    const e = [];
    const aggiungi = (il, titolo, testo, chi = 'cria') => il && e.push({ il, titolo, testo, chi });
    const m = p.mesiDati[0];
    const pianoBase = p.pianoBase ? p.piani.find(pi => pi.id === p.pianoBase.id) : null;
    const pagataNeiDati = (n) => p.pianoBase?.rate.find(r => r.n === n)?.pagataIl;

    if (p.condivisa) {
        p.eventiCondivisi.forEach(x => aggiungi(x.il, x.titolo, x.testo, x.soloProprietario ? 'proprietario' : 'entrambi'));
    } else {
        if (m) {
            aggiungi(m.segnalazione.il, 'Mancato pagamento segnalato', m.copertura === 'attiva'
                ? 'Il proprietario lo segnala dentro la finestra dei 5 giorni: la copertura del mese è attiva.'
                : 'Il proprietario lo segnala: il mese non è coperto dalla garanzia.');
        }
        aggiungi(p.apertaIl, 'Pratica aperta', p.sospensione
            ? `Il mese si è chiuso senza incasso; la contestazione dell’inquilino ha tenuto ferma la pratica fino al ${fmtData(p.sospensione.al)}, quando CRIA l’ha decisa a favore del proprietario.`
            : 'Il mese si è chiuso senza incasso: il recupero parte.');
        if (p.primoContatto) {
            const c = p.primoContatto;
            aggiungi(c.il, 'Primo contatto andato a segno', `${CANALI_CONTATTO[c.canale]}, ${c.ora}: ${ESITI_CONTATTO[c.esito].etichetta.toLowerCase()}.`);
        }
        if (p.esito === 'pagato' && m?.pagatoIl) aggiungi(p.chiusaIl, 'Canone arrivato: pratica chiusa', `Il proprietario conferma l’incasso del ${fmtData(m.pagatoIl)}.`);
    }
    aggiungi(p.assegnataIl, `Assegnata a ${nomeOperatore(p.gestoreId)}`, p.assegnazione === 'automatica'
        ? 'Assegnazione automatica: lingua dell’inquilino, zona dell’immobile, carico di lavoro.'
        : 'Assegnata dal responsabile.');

    p.piani.forEach(pi => {
        aggiungi(pi.propostoIl, `${nomeOperatore(pi.propostoDa)} propone un piano`, `${pi.rate.length} rate per ${fmtEuro(pi.totale)}: lo decide la responsabile legale.`);
        if (pi.respintoIl) aggiungi(pi.respintoIl, `Piano respinto da ${nomeOperatore(pi.respintoDa)}`, pi.motivoRespinta);
        // Approvazione, accettazione e rate del piano condiviso sono già negli eventi dell'area.
        if (pi === pianoBase) {
            pi.rate.filter(r => r.pagataIl && !pagataNeiDati(r.n)).forEach(r => aggiungi(r.pagataIl, `Rata ${r.n} pagata`, `${fmtEuro(r.importo)} arrivati a CRIA.`));
            return;
        }
        if (pi.approvatoIl) aggiungi(pi.approvatoIl, `Piano approvato da ${nomeOperatore(pi.approvatoDa)}`, 'Mandato all’inquilino, che lo accetta dalla sua area.');
        if (pi.accettatoIl) aggiungi(pi.accettatoIl, 'Piano accettato dall’inquilino', null);
        if (pi.sostituitoIl) aggiungi(pi.sostituitoIl, 'Piano sostituito', 'Al suo posto il piano approvato lo stesso giorno.');
        pi.rate.filter(r => r.pagataIl).forEach(r => aggiungi(r.pagataIl, `Rata ${r.n} pagata`, `${fmtEuro(r.importo)} arrivati a CRIA.`));
    });

    const i = p.indennizzo;
    if (i) {
        const giaNellArea = (parola) => p.eventiCondivisi.some(x => new RegExp(`indennizzo ${parola}`, 'i').test(x.titolo));
        if (!giaNellArea('(disposto|riconosciuto)')) aggiungi(i.dispostoIl, `Indennizzo disposto da ${nomeOperatore(i.dispostoDa)}`, `${fmtEuro(i.importo)} al proprietario: il credito verso l’inquilino passa a CRIA.`);
        aggiungi(i.autorizzatoIl, `Indennizzo autorizzato da ${nomeOperatore(i.autorizzatoDa)}`, 'Chi dispone non autorizza.');
        if (!giaNellArea('pagato')) aggiungi(i.pagatoIl, 'Indennizzo pagato', `Bonifico di ${fmtEuro(i.importo)} a ${i.beneficiario}, eseguito da ${nomeOperatore(i.eseguitoDa)}.`);
    }

    p.richiesteLegale.forEach(r => {
        aggiungi(r.richiestoIl, `Passaggio al legale chiesto da ${nomeOperatore(r.richiestoDa)}`, MOTIVI_LEGALE[r.motivo]);
        if (r.decisione === 'passata') aggiungi(r.decisoIl, `Affidata a ${nomeAvvocato(r.avvocatoId)}`, `Decisione di ${nomeOperatore(r.decisoDa)}${r.notaDecisione ? `: ${r.notaDecisione}` : '.'}`);
        if (r.decisione === 'respinta') aggiungi(r.decisoIl, 'Resta al gestore', `Decisione di ${nomeOperatore(r.decisoDa)}: ${r.notaDecisione}`);
    });
    if (p.esito === 'rientrata') aggiungi(p.chiusaIl, 'Pratica chiusa', 'L’ultima rata è arrivata: rientrata con il piano.');

    // A parità di giorno resta l'ordine in cui i passi sono stati aggiunti.
    return e.map((x, n) => ({ ...x, n })).sort((a, b) => a.il.localeCompare(b.il) || a.n - b.n);
};

const CronologiaPratica = ({ pratica }) => {
    const eventi = eventiDellaPratica(pratica);
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><History className="w-5 h-5" /> Cosa è successo</CardTitle>
            </CardHeader>
            <CardContent>
                <ol className="relative ml-1.5 border-l border-border">
                    {eventi.map((e, i) => (
                        <li key={`${e.il}-${e.n}`} className="ml-5 pb-5 last:pb-0">
                            <span className={`absolute -left-1.5 mt-1 w-3 h-3 rounded-full border-2 border-background ${i === eventi.length - 1 ? 'bg-primary' : 'bg-muted-foreground/40'}`} aria-hidden="true" />
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <p className="text-xs text-muted-foreground">{fmtDataLunga(e.il)}</p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${CHI[e.chi].classe}`}>{CHI[e.chi].testo}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{e.titolo}</p>
                            {e.testo && <p className="text-sm text-muted-foreground">{e.testo}</p>}
                        </li>
                    ))}
                </ol>
            </CardContent>
        </Card>
    );
};

export default CronologiaPratica;
