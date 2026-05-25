import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Settings, Percent, Euro, Save, Info, Building2, Clock
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Dati mock ─────────────────────────────────────────────────────────────────
const IMPOSTAZIONI_INIZIALI = {
    // Provvigioni
    provvigioneCommerciale_p1: 17,
    provvigioneCommerciale_p2: 16,
    provvigioneCommerciale_p3: 20,
    compensoAvvocato_p1: 80,
    compensoAvvocato_p2: 150,

    // Soglie temporali
    giornoSegnalazioneAuto: 11,
    giorniContestazione: 7,

    // Contatti azienda
    ragioneSociale: 'CRIA S.r.l.',
    partitaIva: 'IT12345678901',
    indirizzoSede: 'Via Roma 1, 20100 Milano (MI)',
    telefonoAssistenza: '+39 02 1234 5678',
    emailLegale: 'legal@cria.it',

    // Sistema
    manutenzioneAttiva: false,
};

// ─── Sezione configurabile ────────────────────────────────────────────────────
const Sezione = ({ titolo, icona: Icon, descrizione, children }) => (
    <Card>
        <CardHeader className="pb-4">
            <CardTitle className="flex items-start gap-3 text-base">
                <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <p>{titolo}</p>
                    {descrizione && <p className="text-xs text-muted-foreground font-normal mt-0.5">{descrizione}</p>}
                </div>
            </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

// ─── Campo numerico con suffisso ──────────────────────────────────────────────
const CampoNum = ({ label, value, onChange, suffisso, descrizione, min = 0, max }) => (
    <div className="space-y-1.5">
        <Label className="text-sm">{label}</Label>
        <div className="relative">
            <Input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
                min={min} max={max} className="pr-12" />
            {suffisso && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffisso}</span>
            )}
        </div>
        {descrizione && <p className="text-xs text-muted-foreground">{descrizione}</p>}
    </div>
);

// ─── Toggle booleano ──────────────────────────────────────────────────────────
const Toggle = ({ label, descrizione, value, onChange, color = 'bg-primary' }) => (
    <label className="flex items-start justify-between gap-4 p-4 bg-muted/30 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
        <div>
            <p className="font-medium text-foreground text-sm">{label}</p>
            {descrizione && <p className="text-xs text-muted-foreground mt-0.5">{descrizione}</p>}
        </div>
        <button type="button" onClick={() => onChange(!value)}
            className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? color : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
    </label>
);

// ─── Componente principale ────────────────────────────────────────────────────
const ImpostazioniPage = () => {
    const [imp, setImp] = useState(IMPOSTAZIONI_INIZIALI);
    const [modificato, setModificato] = useState(false);

    const set = (campo, val) => {
        setImp(p => ({ ...p, [campo]: val }));
        setModificato(true);
    };

    const salva = () => {
        // TODO: chiamata Edge Function per salvare le impostazioni
        toast.success('Impostazioni salvate');
        setModificato(false);
    };

    return (
        <>
            <Helmet><title>Impostazioni - CRIA Admin</title></Helmet>

            <div className="space-y-6">

                {/* Intestazione */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">Impostazioni piattaforma</h1>
                        <p className="text-sm text-muted-foreground">Configura il comportamento globale di CRIA</p>
                    </div>
                    {modificato && (
                        <Button onClick={salva} className="gap-2">
                            <Save className="w-4 h-4" /> Salva modifiche
                        </Button>
                    )}
                </div>

                {/* Alert modifiche non salvate */}
                {modificato && (
                    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <p className="text-sm text-amber-800">
                            Hai modifiche non salvate. Clicca "Salva modifiche" per applicarle.
                        </p>
                    </div>
                )}

                {/* ── PROVVIGIONI ─────────────────────────────────── */}
                <Sezione titolo="Provvigioni commerciali" icona={Percent}
                    descrizione="Percentuale sulla vendita corrisposta al commerciale per ogni prodotto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <CampoNum label="CRIA Gestione (P1)" value={imp.provvigioneCommerciale_p1} onChange={v => set('provvigioneCommerciale_p1', v)} suffisso="%" />
                        <CampoNum label="CRIA Completo (P2)" value={imp.provvigioneCommerciale_p2} onChange={v => set('provvigioneCommerciale_p2', v)} suffisso="%" />
                        <CampoNum label="CRIA Verifica (P3)" value={imp.provvigioneCommerciale_p3} onChange={v => set('provvigioneCommerciale_p3', v)} suffisso="%" />
                    </div>
                </Sezione>

                <Sezione titolo="Compensi avvocati" icona={Euro}
                    descrizione="Importo fisso assegnato all'avvocato per ogni pratica completata">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <CampoNum label="CRIA Gestione (P1)" value={imp.compensoAvvocato_p1} onChange={v => set('compensoAvvocato_p1', v)} suffisso="€" />
                        <CampoNum label="CRIA Completo (P2)" value={imp.compensoAvvocato_p2} onChange={v => set('compensoAvvocato_p2', v)} suffisso="€" />
                    </div>
                    <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800">
                            La logica di erogazione dei compensi avvocato (all'assegnazione, alla chiusura, mensile) verrà definita in un secondo momento.
                        </p>
                    </div>
                </Sezione>

                {/* ── SOGLIE AUTOMATICHE ───────────────────────────────── */}
                <Sezione titolo="Soglie automatiche" icona={Clock}
                    descrizione="Tempistiche per l'automazione del flusso operativo">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <CampoNum label="Giorno segnalazione automatica" value={imp.giornoSegnalazioneAuto} onChange={v => set('giornoSegnalazioneAuto', v)} suffisso="del mese" min={1} max={28}
                            descrizione="Se il locatore non segnala entro questo giorno, il pagamento viene considerato regolare" />
                        <CampoNum label="Finestra contestazione" value={imp.giorniContestazione} onChange={v => set('giorniContestazione', v)} suffisso="giorni" min={1} max={30}
                            descrizione="Giorni a disposizione dell'inquilino per contestare una segnalazione" />
                    </div>
                </Sezione>

                {/* ── DATI AZIENDA ────────────────────────────────────── */}
                <Sezione titolo="Dati azienda" icona={Building2}
                    descrizione="Informazioni legali mostrate in fatture, footer, termini">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <Label>Ragione sociale</Label>
                            <Input value={imp.ragioneSociale} onChange={e => set('ragioneSociale', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Partita IVA</Label>
                            <Input value={imp.partitaIva} onChange={e => set('partitaIva', e.target.value)} />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                            <Label>Indirizzo sede</Label>
                            <Input value={imp.indirizzoSede} onChange={e => set('indirizzoSede', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Telefono assistenza</Label>
                            <Input value={imp.telefonoAssistenza} onChange={e => set('telefonoAssistenza', e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Email legale</Label>
                            <Input value={imp.emailLegale} onChange={e => set('emailLegale', e.target.value)} />
                        </div>
                    </div>
                </Sezione>

                {/* ── SISTEMA ────────────────────────────────────── */}
                <Sezione titolo="Sistema" icona={Settings}
                    descrizione="Modalità globali della piattaforma">
                    <Toggle label="Manutenzione programmata"
                        descrizione="Se attiva, gli utenti vedranno una pagina di manutenzione invece dell'app"
                        value={imp.manutenzioneAttiva} onChange={v => set('manutenzioneAttiva', v)} color="bg-red-500" />
                </Sezione>

            </div>
        </>
    );
};

export default ImpostazioniPage;