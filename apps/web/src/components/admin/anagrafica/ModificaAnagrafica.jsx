import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { aggiornaDatiPersona, ETICHETTE_CAMPI } from '@/lib/personeFonte';

// ═════════════════════════════════════════════════════════════════════════════
// L'ADMIN CAMBIA L'ANAGRAFICA DI UNA PERSONA — dalla scheda del soggetto (O-03)
// Tutti i dati personali: nome o ragione sociale, codici, nascita, email,
// cellulare, indirizzo e lo stato dell'identità (qui l'admin verifica chi si è
// iscritto). Il motivo è obbligatorio e va nel registro con ogni campo
// cambiato. L'email è anche quella con cui la persona entra.
// Salva il database (aggiorna_persona), con le sue regole: email, cellulare e
// codice fiscale non si ripetono.
// ═════════════════════════════════════════════════════════════════════════════

const STATI_IDENTITA = [
    { id: 'non_caricato', etichetta: 'Documento non caricato' },
    { id: 'in_attesa', etichetta: 'Documento da verificare' },
    { id: 'da_integrare', etichetta: 'Da integrare' },
    { id: 'verificato', etichetta: 'Verificata' },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO = /^\+?[0-9 ]{6,20}$/;
const CODICE = /^([A-Z0-9]{16}|[0-9]{11})$/;

const moduloDa = (s) => ({
    nome: s.tipo === 'giuridica' ? s.referente?.nome || '' : s.nome || '',
    cognome: s.tipo === 'giuridica' ? s.referente?.cognome || '' : s.cognome || '',
    ragioneSociale: s.ragioneSociale || '',
    partitaIva: s.partitaIva || '',
    codiceFiscale: s.codiceFiscale || '',
    dataNascita: s.dataNascita || '',
    luogoNascita: s.luogoNascita || '',
    email: s.email || '',
    telefono: s.telefono || '',
    via: s.indirizzo?.fonte === 'dichiarato' ? s.indirizzo.via || '' : '',
    cap: s.indirizzo?.fonte === 'dichiarato' ? s.indirizzo.cap || '' : '',
    citta: s.indirizzo?.fonte === 'dichiarato' ? s.indirizzo.citta || '' : '',
    provincia: s.indirizzo?.fonte === 'dichiarato' ? s.indirizzo.provincia || '' : '',
    paese: s.indirizzo?.fonte === 'dichiarato' ? s.indirizzo.paese || 'Italia' : 'Italia',
    statoIdentita: s.statoIdentita || (s.account?.stato === 'attivo' ? 'verificato' : 'non_caricato'),
    motivoIntegrazione: '',
});

const controlla = (m, giuridica) => {
    const e = {};
    if (giuridica && m.ragioneSociale.trim().length < 2) e.ragioneSociale = 'Scrivi la ragione sociale';
    if (giuridica && m.partitaIva && !/^\d{11}$/.test(m.partitaIva.replace(/\s/g, ''))) e.partitaIva = 'La partita IVA ha 11 cifre';
    if (!giuridica && !m.nome.trim()) e.nome = 'Scrivi il nome';
    if (!giuridica && !m.cognome.trim()) e.cognome = 'Scrivi il cognome';
    if (m.codiceFiscale && !CODICE.test(m.codiceFiscale.toUpperCase().replace(/\s/g, ''))) e.codiceFiscale = '16 caratteri, oppure 11 cifre';
    if (!EMAIL.test(m.email.trim())) e.email = 'Email non valida';
    if (m.telefono && !TELEFONO.test(m.telefono.trim())) e.telefono = 'Cellulare non valido';
    if (m.via.trim() && (!m.citta.trim() || !m.paese.trim())) e.citta = 'Con la via servono città e paese';
    if (m.statoIdentita === 'da_integrare' && !m.motivoIntegrazione.trim()) e.motivoIntegrazione = 'Scrivi cosa va integrato';
    return e;
};

const Campo = ({ id, etichetta, errore, className = '', children }) => (
    <div className={`space-y-1.5 ${className}`}>
        <Label htmlFor={id}>{etichetta}</Label>
        {children}
        {errore && <p className="text-xs text-red-600">{errore}</p>}
    </div>
);

const ModificaAnagrafica = ({ s, onChiudi }) => {
    const { persona: io } = useAuth();
    const giuridica = s.tipo === 'giuridica';
    const iniziale = moduloDa(s);
    const [m, setM] = useState(iniziale);
    const [motivo, setMotivo] = useState('');
    const [errori, setErrori] = useState({});
    const [invio, setInvio] = useState(false);

    const campo = (chiave) => ({
        id: `anag-${chiave}`,
        value: m[chiave],
        onChange: (e) => {
            setM(prev => ({ ...prev, [chiave]: e.target.value }));
            if (errori[chiave]) setErrori(prev => ({ ...prev, [chiave]: undefined }));
        },
    });

    const salva = async () => {
        const trovati = controlla(m, giuridica);
        if (motivo.trim().length < 5) trovati.motivo = 'Scrivi perché cambi questi dati (almeno 5 caratteri)';
        setErrori(trovati);
        if (Object.keys(trovati).length) return;

        // Solo i campi cambiati: il registro scrive quelli.
        const cambi = {};
        const semplici = giuridica
            ? ['ragioneSociale', 'partitaIva', 'codiceFiscale', 'nome', 'cognome', 'email', 'telefono']
            : ['nome', 'cognome', 'codiceFiscale', 'dataNascita', 'luogoNascita', 'email', 'telefono'];
        semplici.forEach(k => { if (m[k].trim() !== iniziale[k].trim()) cambi[k] = m[k]; });
        const indirizzo = m.via.trim()
            ? { via: m.via.trim(), cap: m.cap.trim(), citta: m.citta.trim(), provincia: m.provincia.trim().toUpperCase(), paese: m.paese.trim() }
            : null;
        const indirizzoPrima = iniziale.via ? { via: iniziale.via, cap: iniziale.cap, citta: iniziale.citta, provincia: iniziale.provincia.toUpperCase(), paese: iniziale.paese } : null;
        if (JSON.stringify(indirizzo) !== JSON.stringify(indirizzoPrima)) cambi.indirizzo = indirizzo;
        if (m.statoIdentita !== iniziale.statoIdentita) {
            cambi.statoIdentita = m.statoIdentita;
            cambi.motivoIntegrazione = m.statoIdentita === 'da_integrare' ? m.motivoIntegrazione : null;
        }
        if (!Object.keys(cambi).length) {
            toast('Non hai cambiato niente');
            return;
        }

        setInvio(true);
        const bersaglio = {
            id: s.id, personaDb: s.personaDb, tipo: s.tipo,
            ...Object.fromEntries(semplici.map(k => [k, iniziale[k] || null])),
            indirizzo: indirizzoPrima, statoIdentita: iniziale.statoIdentita, motivoIntegrazione: null,
        };
        const esito = await aggiornaDatiPersona(bersaglio, cambi, { motivo, attore: io?.id });
        setInvio(false);
        if (!esito.ok) {
            const suCampo = { email_usata: 'email', telefono_usato: 'telefono', codice_fiscale_usato: 'codiceFiscale', motivo: 'motivo' }[esito.errore];
            if (suCampo) setErrori(prev => ({ ...prev, [suCampo]: esito.messaggio }));
            toast.error(esito.messaggio);
            return;
        }
        toast.success(`Salvato: ${Object.keys(cambi).filter(k => k !== 'motivoIntegrazione').map(k => ETICHETTE_CAMPI[k]).join(', ')}`);
        onChiudi();
    };

    return (
        <div className="space-y-4 text-sm">
            {giuridica ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Campo id="anag-ragioneSociale" etichetta="Ragione sociale" errore={errori.ragioneSociale} className="sm:col-span-2"><Input {...campo('ragioneSociale')} /></Campo>
                    <Campo id="anag-partitaIva" etichetta="Partita IVA" errore={errori.partitaIva}><Input {...campo('partitaIva')} inputMode="numeric" className="font-mono" /></Campo>
                    <Campo id="anag-codiceFiscale" etichetta="Codice fiscale" errore={errori.codiceFiscale}><Input {...campo('codiceFiscale')} className="font-mono uppercase" /></Campo>
                    <Campo id="anag-nome" etichetta="Referente: nome" errore={errori.nome}><Input {...campo('nome')} /></Campo>
                    <Campo id="anag-cognome" etichetta="Referente: cognome" errore={errori.cognome}><Input {...campo('cognome')} /></Campo>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Campo id="anag-nome" etichetta="Nome" errore={errori.nome}><Input {...campo('nome')} /></Campo>
                    <Campo id="anag-cognome" etichetta="Cognome" errore={errori.cognome}><Input {...campo('cognome')} /></Campo>
                    <Campo id="anag-codiceFiscale" etichetta="Codice fiscale" errore={errori.codiceFiscale} className="sm:col-span-2"><Input {...campo('codiceFiscale')} className="font-mono uppercase" /></Campo>
                    <Campo id="anag-dataNascita" etichetta="Data di nascita"><Input {...campo('dataNascita')} type="date" /></Campo>
                    <Campo id="anag-luogoNascita" etichetta="Luogo di nascita"><Input {...campo('luogoNascita')} /></Campo>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Campo id="anag-email" etichetta="Email (anche per entrare)" errore={errori.email} className="sm:col-span-2"><Input {...campo('email')} type="email" /></Campo>
                <Campo id="anag-telefono" etichetta="Cellulare" errore={errori.telefono} className="sm:col-span-2"><Input {...campo('telefono')} type="tel" placeholder="+39 333 1234567" /></Campo>
            </div>

            <div className="grid grid-cols-6 gap-3">
                <Campo id="anag-via" etichetta={giuridica ? 'Sede: via e numero' : 'Indirizzo: via e numero'} className="col-span-6"><Input {...campo('via')} /></Campo>
                <Campo id="anag-cap" etichetta="CAP" className="col-span-2"><Input {...campo('cap')} inputMode="numeric" maxLength={5} /></Campo>
                <Campo id="anag-citta" etichetta="Città" errore={errori.citta} className="col-span-4"><Input {...campo('citta')} /></Campo>
                <Campo id="anag-provincia" etichetta="Provincia" className="col-span-2"><Input {...campo('provincia')} maxLength={2} className="uppercase" /></Campo>
                <Campo id="anag-paese" etichetta="Paese" className="col-span-4"><Input {...campo('paese')} /></Campo>
            </div>

            <Campo id="anag-statoIdentita" etichetta="Identità">
                <select id="anag-statoIdentita" value={m.statoIdentita} onChange={e => setM(prev => ({ ...prev, statoIdentita: e.target.value }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                    {STATI_IDENTITA.map(x => <option key={x.id} value={x.id}>{x.etichetta}</option>)}
                </select>
            </Campo>
            {m.statoIdentita === 'da_integrare' && (
                <Campo id="anag-motivoIntegrazione" etichetta="Cosa va integrato (lo legge la persona)" errore={errori.motivoIntegrazione}>
                    <Input {...campo('motivoIntegrazione')} placeholder="Es. la foto del retro è sfocata" />
                </Campo>
            )}

            <Campo id="anag-motivo" etichetta="Perché cambi questi dati" errore={errori.motivo}>
                <Textarea id="anag-motivo" value={motivo} onChange={e => { setMotivo(e.target.value); if (errori.motivo) setErrori(prev => ({ ...prev, motivo: undefined })); }}
                    rows={2} placeholder="Es. richiesta della cliente al telefono, documento verificato" />
            </Campo>

            <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={salva} disabled={invio}>{invio ? 'Salvo…' : 'Salva'}</Button>
                <Button type="button" variant="outline" onClick={onChiudi} disabled={invio}>Annulla</Button>
            </div>
            <p className="text-xs text-muted-foreground">Ogni campo cambiato resta nella storia dell’anagrafica, con il motivo e chi l’ha cambiato.</p>
        </div>
    );
};

export default ModificaAnagrafica;
