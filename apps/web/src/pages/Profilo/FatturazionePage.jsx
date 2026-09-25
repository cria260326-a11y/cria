import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Receipt, CreditCard, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';

// ═════════════════════════════════════════════════════════════════════════════
// DATI DI FATTURAZIONE — F-13
// Non si chiedono alla registrazione: si chiedono al primo acquisto, e senza
// non si compra. Diversi per persona fisica e per società.
// ═════════════════════════════════════════════════════════════════════════════

const CAMPI = {
    fisica: [
        { id: 'intestatario', label: 'Nome e cognome', obbligatorio: true, largo: true },
        { id: 'codiceFiscale', label: 'Codice fiscale', obbligatorio: true },
        { id: 'paese', label: 'Paese', obbligatorio: true },
        { id: 'indirizzo', label: 'Indirizzo', obbligatorio: true, largo: true },
        { id: 'cap', label: 'CAP', obbligatorio: true },
        { id: 'citta', label: 'Città', obbligatorio: true },
        { id: 'provincia', label: 'Provincia', obbligatorio: true },
    ],
    giuridica: [
        { id: 'intestatario', label: 'Ragione sociale', obbligatorio: true, largo: true },
        { id: 'partitaIva', label: 'Partita IVA', obbligatorio: true },
        { id: 'codiceFiscale', label: 'Codice fiscale della società', obbligatorio: true },
        { id: 'sdi', label: 'Codice destinatario SDI', obbligatorio: false },
        { id: 'pec', label: 'PEC', obbligatorio: false },
        { id: 'indirizzo', label: 'Sede legale', obbligatorio: true, largo: true },
        { id: 'cap', label: 'CAP', obbligatorio: true },
        { id: 'citta', label: 'Città', obbligatorio: true },
        { id: 'provincia', label: 'Provincia', obbligatorio: true },
    ],
};

const valoriIniziali = (persona) => (persona.tipo === 'giuridica'
    ? { intestatario: persona.ragioneSociale, partitaIva: persona.partitaIva || '', codiceFiscale: '', sdi: '', pec: '', indirizzo: '', cap: '', citta: '', provincia: '' }
    : { intestatario: `${persona.nome} ${persona.cognome}`, codiceFiscale: persona.codiceFiscale || '', paese: 'Italia', indirizzo: '', cap: '', citta: '', provincia: '' });

const FatturazionePage = () => {
    const { persona, aggiornaPersona } = useAuth();
    const [valori, setValori] = useState(() => (persona ? { ...valoriIniziali(persona), ...(persona.fatturazione || {}) } : {}));
    const [errori, setErrori] = useState({});

    if (!persona) return null;

    const giuridica = persona.tipo === 'giuridica';
    const campi = CAMPI[persona.tipo] || CAMPI.fisica;

    const cambia = (id, valore) => {
        setValori(prev => ({ ...prev, [id]: valore }));
        if (errori[id]) setErrori(prev => ({ ...prev, [id]: undefined }));
    };

    const salva = async () => {
        const nuovi = {};
        campi.forEach(c => {
            if (c.obbligatorio && !String(valori[c.id] || '').trim()) nuovi[c.id] = 'Campo obbligatorio';
        });
        if (giuridica && !String(valori.sdi || '').trim() && !String(valori.pec || '').trim()) {
            nuovi.sdi = 'Serve il codice SDI oppure la PEC';
            nuovi.pec = 'Serve il codice SDI oppure la PEC';
        }
        setErrori(nuovi);
        if (Object.keys(nuovi).length) {
            toast.error('Controlla i campi evidenziati');
            return;
        }
        const esito = await aggiornaPersona({ fatturazione: valori });
        if (esito && esito.ok === false) { toast.error(esito.messaggio || 'Dati non salvati: riprova'); return; }
        toast.success('Dati di fatturazione salvati');
    };

    return (
        <>
            <Helmet><title>Dati di fatturazione - CRIA</title></Helmet>

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                        <Receipt className="w-6 h-6" /> Dati di fatturazione
                    </h1>
                    <p className="text-sm text-muted-foreground">A chi intestiamo le fatture dei tuoi acquisti.</p>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Servono al primo acquisto: senza, il pagamento non si completa.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{giuridica ? 'Intestazione della società' : 'Intestazione'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {campi.map(c => (
                                <div key={c.id} className={`space-y-1.5 ${c.largo ? 'sm:col-span-2' : ''}`}>
                                    <Label htmlFor={c.id} className={errori[c.id] ? 'text-destructive' : ''}>
                                        {c.label} {c.obbligatorio && <span className="text-red-500">*</span>}
                                    </Label>
                                    <Input id={c.id} value={valori[c.id] || ''} onChange={e => cambia(c.id, e.target.value)}
                                        className={errori[c.id] ? 'border-destructive' : ''} />
                                    {errori[c.id] && <p className="text-xs text-destructive">{errori[c.id]}</p>}
                                </div>
                            ))}
                        </div>
                        {giuridica && (
                            <p className="text-xs text-muted-foreground mt-4">Per la fattura elettronica serve almeno uno fra codice SDI e PEC.</p>
                        )}
                        <div className="flex justify-end mt-6">
                            <Button onClick={salva}>Salva</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base"><CreditCard className="w-5 h-5" /> Metodo di pagamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="p-4 bg-muted/30 rounded-xl flex items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0"><CreditCard className="w-4 h-4 text-blue-600" /></div>
                            <div className="flex-1">
                                <p className="font-medium text-sm text-foreground">Carta che termina con •••• 4242</p>
                                <p className="text-xs text-muted-foreground">Scadenza 12/27</p>
                            </div>
                            <Button variant="outline" size="sm">Modifica</Button>
                        </div>
                        <p className="text-xs text-muted-foreground">I dati della carta li conserva il circuito di pagamento, non CRIA.</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default FatturazionePage;
