import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { Download, ScanLine, Keyboard, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TITOLO_STILE } from '@/components/AccessoShell';
import { FONTE_CERTIFICATO } from '@/data/certificati';
import { PARAMETRI } from '@/data/catalogo';
import { SEMAFORO, MESI_SEMAFORO } from '@/lib/semaforo';
import { fmtData, fmtDataLunga } from '@/lib/formato';
import { nomeVisualizzato } from '@/lib/aree';
import {
    fattiCertificato, statoCertificato, scadenzaCertificato, mascheraCodiceFiscale,
    fmtPeriodo, fmtPeriodoMesi, INDIRIZZO_VERIFICA, PERCORSO_VERIFICA,
} from '@/lib/certificatiDemo';

// ═════════════════════════════════════════════════════════════════════════════
// IL FOGLIO DEL CERTIFICATO — I-07
// Il documento da consegnare, con i campi del documento di stato §15.1. Il
// periodo certificato e lo storico complessivo sono due campi distinti. Il foglio
// da solo non fa fede: accanto al QR ci sono le due strade per verificarlo.
// ═════════════════════════════════════════════════════════════════════════════

const NAVY = '#1A2D52';

// ─── QR segnaposto ────────────────────────────────────────────────────────────
// Solo decorativo: una griglia sempre uguale per lo stesso codice, con i tre
// mirini agli angoli perché si riconosca. Non codifica niente. Il QR vero,
// con il link alla verifica, lo genera il backend.
const LATO = 21;
const ANGOLI = [[0, 0], [0, LATO - 7], [LATO - 7, 0]];

// true scuro, false chiaro, null fuori dai mirini
const mirino = (r, c) => {
    for (const [r0, c0] of ANGOLI) {
        const dr = r - r0;
        const dc = c - c0;
        if (dr < -1 || dr > 7 || dc < -1 || dc > 7) continue;
        if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return false;
        return dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
    }
    return null;
};

const tracciatoQr = (codice) => {
    let x = 2166136261;
    for (let i = 0; i < codice.length; i++) {
        x ^= codice.charCodeAt(i);
        x = Math.imul(x, 16777619) >>> 0;
    }
    x = x || 1;
    const caso = () => {
        x ^= x << 13; x >>>= 0;
        x ^= x >>> 17;
        x ^= x << 5; x >>>= 0;
        return x / 4294967296;
    };
    let d = '';
    for (let r = 0; r < LATO; r++) {
        for (let c = 0; c < LATO; c++) {
            const m = mirino(r, c);
            const scuro = m ?? (r === 6 || c === 6 ? (r + c) % 2 === 0 : caso() < 0.5);
            if (scuro) d += `M${c} ${r}h1v1h-1z`;
        }
    }
    return d;
};

const QrSegnaposto = ({ codice }) => {
    const d = useMemo(() => tracciatoQr(codice), [codice]);
    return (
        <svg viewBox={`-2 -2 ${LATO + 4} ${LATO + 4}`} className="w-full h-full" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
            <rect x="-2" y="-2" width={LATO + 4} height={LATO + 4} fill="#FFFFFF" />
            <path d={d} fill={NAVY} />
        </svg>
    );
};

// ─── Mattoni ──────────────────────────────────────────────────────────────────
const Campo = ({ etichetta, nota, children }) => (
    <div className="min-w-0">
        <dt className="text-[10px] uppercase tracking-[0.14em] text-[#6B6B5E]">{etichetta}</dt>
        <dd className="mt-1 text-sm font-semibold text-[#1A2D52] break-words">{children}</dd>
        {nota && <dd className="mt-0.5 text-xs text-[#6B6B5E]">{nota}</dd>}
    </div>
);

const plurale = (n, uno, molti) => `${n} ${n === 1 ? uno : molti}`;

const AVVISO_STATO = {
    scaduto: (c, scadenza) => ({
        classe: 'bg-gray-100 text-gray-800 border-gray-200',
        testo: `Scaduto il ${fmtData(scadenza)}: il foglio è vecchio, non falso. Chi lo verifica lo vede scaduto.`,
    }),
    revocato: (c) => ({
        classe: 'bg-red-50 text-red-800 border-red-200',
        testo: `Codice revocato il ${fmtData(c.revocatoIl)}: chi prova a verificarlo vede solo che è stato revocato.`,
    }),
};

// ─── Il foglio ────────────────────────────────────────────────────────────────
const FoglioCertificato = ({ certificato, persona, contratti }) => {
    const fatti = useMemo(() => fattiCertificato(certificato, contratti), [certificato, contratti]);
    const stato = statoCertificato(certificato);
    const scadenza = scadenzaCertificato(certificato);
    const voce = SEMAFORO[fatti.valore];
    const documentato = certificato.fonte === 'verificato_su_documentazione';
    const { codice } = certificato;
    const avviso = AVVISO_STATO[stato]?.(certificato, scadenza);
    const { storico } = fatti;

    const scaricaPdf = () => toast.info('Il PDF si genera quando c’è il collegamento al backend');

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
                <p className="text-xs text-muted-foreground">Il foglio da consegnare a chi ti affitta casa</p>
                <Button variant="outline" size="sm" className="gap-2" onClick={scaricaPdf}>
                    <Download className="w-4 h-4" /> Scarica PDF
                </Button>
            </div>

            <article
                className="bg-white text-[#1A2D52] rounded-2xl border border-[#E5E5DE] shadow-sm overflow-hidden print:shadow-none"
                aria-label={`Certificato ${codice}`}
            >
                {avviso && <p className={`px-6 sm:px-10 py-2.5 text-xs font-medium border-b ${avviso.classe}`}>{avviso.testo}</p>}

                <header className="flex flex-wrap items-start justify-between gap-4 px-6 sm:px-10 pt-8 pb-5 border-b-2 border-[#1A2D52]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1A2D52] rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold">C</span>
                        </div>
                        <div className="leading-tight">
                            <p className="font-bold text-sm">CRIA</p>
                            <p className="text-[9px] tracking-widest text-[#6B6B5E] uppercase">Centrale Rischi Immobiliare Affitti</p>
                        </div>
                    </div>
                    <div className="sm:text-right">
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B6B5E]">Codice univoco</p>
                        <p className="font-mono text-sm font-semibold tracking-wider">{codice}</p>
                    </div>
                </header>

                <div className="px-6 sm:px-10 py-8 space-y-8">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#C97B5C]">Reputazione come inquilino</p>
                        <h2 className="text-2xl sm:text-3xl mt-1 leading-tight" style={TITOLO_STILE}>Certificato di reputazione abitativa</h2>
                        <p className="text-sm text-[#6B6B5E] mt-1">Attesta come l’intestatario ha pagato il canone in un periodo preciso, non in un istante.</p>
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Campo etichetta="Intestatario">{nomeVisualizzato(persona) || '—'}</Campo>
                        <Campo etichetta="Codice fiscale">
                            <span className="font-mono tracking-wider">{mascheraCodiceFiscale(persona?.codiceFiscale)}</span>
                        </Campo>
                        <Campo etichetta="Data di nascita">{fmtData(persona?.dataNascita)}</Campo>
                    </dl>

                    <section
                        className="rounded-xl p-5 sm:p-6"
                        style={{ background: `${voce.colore}14`, border: `1px solid ${voce.colore}4D` }}
                        aria-label="Periodo certificato"
                    >
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B6B5E]">Periodo certificato</p>
                        <p className="text-lg font-semibold mt-1 first-letter:uppercase">{fmtPeriodo(certificato.periodo)}</p>
                        <div className="flex items-center gap-3 mt-4">
                            <span className="w-5 h-5 rounded-full flex-shrink-0 ring-4 ring-white" style={{ background: voce.colore }} />
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.14em] text-[#6B6B5E]">Semaforo del periodo</p>
                                <p className="text-2xl leading-tight" style={TITOLO_STILE}>{voce.etichetta}</p>
                            </div>
                        </div>
                        <p className="text-sm text-[#3D3D35] mt-2">{documentato && fatti.valore === 'storico_insufficiente' ? 'Meno di 12 mesi coperti da due prove forti: non si dà un colore' : voce.spiegazione}.</p>
                        <p className="text-xs text-[#6B6B5E] mt-4 pt-3 border-t border-[#1A2D52]/10">
                            {documentato
                                ? `Il valore è calcolato sui mesi documentati dall’intestatario e verificati da CRIA (${MESI_SEMAFORO} al massimo): media del giorno di pagamento, verde entro il 5, giallo dal 6 al 10, rosso oltre il 10 o con un mese non pagato.`
                                : `Il valore è calcolato sui ${MESI_SEMAFORO} mesi precedenti l’emissione, su tutti i contratti d’affitto dell’intestatario: media del giorno di pagamento, verde entro il 5, giallo dal 6 al 10, rosso oltre il 10 o con un mese non pagato.`}
                        </p>
                    </section>

                    <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
                        <Campo etichetta="Mensilità verificate" nota="Con un pagamento o un mancato pagamento registrato">
                            {fatti.mensilitaVerificate} su {fatti.mesiDelPeriodo}
                        </Campo>
                        <Campo etichetta="Giorno medio di pagamento" nota="Del mese, nel periodo">
                            {fatti.media == null ? '—' : `il ${String(fatti.media).replace('.', ',')}`}
                        </Campo>
                        <Campo etichetta="Segnalazioni di mancato pagamento" nota="Nel periodo">{fatti.segnalazioni}</Campo>
                        <Campo etichetta="Accordi di rientro" nota="Nel periodo">{fatti.accordi}</Campo>
                    </dl>

                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 pt-6 border-t border-[#E5E5DE]">
                        <Campo
                            etichetta="Storico complessivo"
                            nota={storico.dal
                                ? `Tutti i mesi su CRIA, ${fmtPeriodoMesi({ dal: storico.dal, al: certificato.periodo.al })}: non coincide con il periodo certificato.`
                                : 'Nessun mese su CRIA fino alla fine del periodo.'}
                        >
                            {plurale(storico.mesi, 'mese', 'mesi')} · {plurale(storico.contratti, 'contratto', 'contratti')}
                        </Campo>
                        <Campo etichetta="Fonte del dato">{FONTE_CERTIFICATO[certificato.fonte] || certificato.fonte}</Campo>
                        {certificato.annotazioni?.length > 0 && (
                            <div className="sm:col-span-2"><Campo etichetta="Annotazioni">{certificato.annotazioni.join(' · ')}</Campo></div>
                        )}
                        <Campo etichetta="Emesso il">{fmtDataLunga(certificato.emessoIl)}</Campo>
                        <Campo etichetta="Valido fino al" nota={`${PARAMETRI.mesiValiditaCertificato} mesi dall’emissione`}>{fmtDataLunga(scadenza)}</Campo>
                    </dl>
                </div>

                <footer className="px-6 sm:px-10 py-7 bg-[#F5F5F0] border-t border-[#E5E5DE] flex flex-col md:flex-row gap-6 md:gap-8">
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        <a
                            href={`${PERCORSO_VERIFICA}?codice=${encodeURIComponent(codice)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-32 h-32 rounded-lg border border-[#E5E5DE] bg-white p-1.5 transition-shadow hover:shadow-md"
                            aria-label={`Apri la verifica pubblica del codice ${codice}`}
                            title="Nei mockup il QR si clicca: apre la verifica pubblica"
                        >
                            <QrSegnaposto codice={codice} />
                        </a>
                        <p className="font-mono text-xs font-semibold tracking-wider">{codice}</p>
                        <p className="text-[10px] leading-snug text-amber-700 text-center max-w-[8.5rem] print:hidden">
                            QR di esempio: nei mockup non si inquadra, si clicca
                        </p>
                    </div>

                    <div className="flex-1 min-w-0 space-y-4 text-sm">
                        <div>
                            <p className="font-semibold">Come si verifica</p>
                            <ul className="mt-2 space-y-2 text-[#3D3D35]">
                                <li className="flex items-start gap-2">
                                    <ScanLine className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#1A2D52]" />
                                    <span>Inquadra il QR con la fotocamera del telefono.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Keyboard className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#1A2D52]" />
                                    <span>
                                        Oppure vai su <span className="font-medium text-[#1A2D52]">{INDIRIZZO_VERIFICA}</span> e
                                        scrivi il codice <span className="font-mono font-medium text-[#1A2D52] whitespace-nowrap">{codice}</span>.
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-[#1A2D52]/20 bg-white p-4">
                            <p className="flex items-center gap-2 font-semibold text-base" style={TITOLO_STILE}>
                                <ShieldAlert className="w-4 h-4 flex-shrink-0" /> Questo foglio da solo non fa fede.
                            </p>
                            <p className="text-xs text-[#3D3D35] mt-1.5 leading-relaxed">
                                Va verificato con il QR o con il codice: la verifica è gratuita e non serve registrarsi. Chi verifica vede se il
                                certificato è autentico, l’intestatario con il codice fiscale mascherato, il periodo e il semaforo certificati con
                                la fonte del dato, la data di emissione e la validità, e se dopo l’emissione il semaforo è peggiorato, senza sapere
                                di quanto.
                            </p>
                        </div>

                        <p className="text-xs text-[#6B6B5E]">
                            Consegnare questo codice è il consenso dell’intestatario a far vedere a chi lo riceve queste informazioni, comprese
                            le variazioni successive all’emissione.
                        </p>
                    </div>
                </footer>
            </article>
        </div>
    );
};

export default FoglioCertificato;
