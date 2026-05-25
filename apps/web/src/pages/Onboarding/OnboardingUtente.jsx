import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { salvaStep, avanzaStep, caricaDocumento } from '@/services/onboardingService.js';
import {
    CheckCircle2, Upload, ChevronRight, ChevronLeft,
    FileText, X, Shield, Loader2, Plus, Trash2,
    User, Home, Building2, Info
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const flussoId = () => sessionStorage.getItem('onboarding_flusso') || 'AB';
const tipoAccount = () => sessionStorage.getItem('tipo_account') || 'privato';
const nomeUtente = () => ({ nome: 'Marco', cognome: 'Bianchi', email: 'marco.bianchi@email.it' }); // TODO: da auth

// ─── Campo upload documento ───────────────────────────────────────────────────
const UploadDoc = ({ label, obbligatorio, value, onChange, nota }) => {
    const ref = useRef(null);
    return (
        <div className="space-y-1.5">
            <Label className="flex items-center gap-1">
                {label} {obbligatorio && <span className="text-red-500">*</span>}
                {nota && <span className="text-xs text-muted-foreground font-normal">— {nota}</span>}
            </Label>
            <input ref={ref} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
            {value ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-foreground flex-1 truncate">{value.name}</span>
                    <button onClick={() => onChange(null)} className="text-muted-foreground hover:text-red-500">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button onClick={() => ref.current?.click()}
                    className="w-full flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Carica file</p>
                        <p className="text-xs text-muted-foreground">PDF, JPG, PNG — max 10MB</p>
                    </div>
                </button>
            )}
        </div>
    );
};

// ─── Step 1 AB — Identità ─────────────────────────────────────────────────────
const StepIdentita = ({ dati, setDati }) => {
    const utente = nomeUtente();
    const isAgenzia = tipoAccount() === 'agenzia';

    return (
        <div className="space-y-6">
            {/* Riepilogo utente */}
            <div className="p-4 bg-muted/40 rounded-xl space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Il tuo account</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <p className="text-xs text-muted-foreground">Nome e cognome</p>
                        <p className="font-medium text-foreground">{utente.nome} {utente.cognome}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium text-foreground">{utente.email}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Tipo account</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {tipoAccount()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Info documenti */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 space-y-1">
                    <p className="font-medium">Documenti richiesti per {isAgenzia ? 'le agenzie' : 'i privati'}:</p>
                    {isAgenzia ? (
                        <ul className="space-y-0.5 text-xs">
                            <li>• Documento di identità (carta identità o passaporto)</li>
                            <li>• Codice fiscale</li>
                            <li>• Partita IVA</li>
                            <li>• Visura camerale (aggiornata, non oltre 3 mesi)</li>
                        </ul>
                    ) : (
                        <ul className="space-y-0.5 text-xs">
                            <li>• Documento di identità (carta identità o passaporto)</li>
                            <li>• Codice fiscale</li>
                        </ul>
                    )}
                </div>
            </div>

            {/* Campi */}
            <div className="space-y-4">
                <div className="space-y-1.5">
                    <Label>Codice fiscale <span className="text-red-500">*</span></Label>
                    <Input value={dati.codiceFiscale || ''} onChange={e => setDati(p => ({ ...p, codiceFiscale: e.target.value }))}
                        placeholder="RSSMRC85M12F205Z" className="uppercase" />
                </div>

                {isAgenzia && (
                    <div className="space-y-1.5">
                        <Label>Partita IVA <span className="text-red-500">*</span></Label>
                        <Input value={dati.partitaIva || ''} onChange={e => setDati(p => ({ ...p, partitaIva: e.target.value }))}
                            placeholder="12345678901" />
                    </div>
                )}

                <UploadDoc label="Documento di identità" obbligatorio nota="Carta identità o passaporto"
                    value={dati.docIdentita} onChange={f => setDati(p => ({ ...p, docIdentita: f }))} />

                {isAgenzia && (
                    <UploadDoc label="Visura camerale" obbligatorio nota="Non oltre 3 mesi"
                        value={dati.visuraCamerale} onChange={f => setDati(p => ({ ...p, visuraCamerale: f }))} />
                )}
            </div>
        </div>
    );
};

// ─── Selettore prodotto per immobile ─────────────────────────────────────────
const SelettoreProdotto = ({ value, onChange }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
            { id: 'gestione', nome: 'CRIA Gestione', desc: 'Gestisci tu il rapporto con l\'inquilino. CRIA ti fornisce gli strumenti per tracciare pagamenti, documenti e contestazioni.', colore: 'border-blue-300 bg-blue-50' },
            { id: 'completo', nome: 'CRIA Completo', desc: 'CRIA gestisce tutto al posto tuo. Incassiamo noi l\'affitto e ti bonifichiamo puntualmente ogni mese, anche in caso di morosità.', colore: 'border-purple-300 bg-purple-50' },
        ].map(p => (
            <button key={p.id} type="button" onClick={() => onChange(p.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${value === p.id ? p.colore : 'border-border hover:border-primary/40 bg-card'
                    }`}>
                <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-foreground text-sm">{p.nome}</p>
                    {value === p.id && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </button>
        ))}
    </div>
);

// ─── Singolo immobile nel form ────────────────────────────────────────────────
const FormImmobile = ({ idx, dati, onChange, onRimuovi, mostraRimuovi }) => {
    const set = (campo, val) => onChange({ ...dati, [campo]: val });
    const isGestore = dati.ruolo === 'gestore';

    return (
        <div className="border border-border rounded-xl p-5 space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Home className="w-4 h-4 text-primary" /> Immobile {idx + 1}
                </h3>
                {mostraRimuovi && (
                    <button onClick={onRimuovi} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Indirizzo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                    <Label>Indirizzo <span className="text-red-500">*</span></Label>
                    <Input value={dati.indirizzo || ''} onChange={e => set('indirizzo', e.target.value)} placeholder="Via Roma 42" />
                </div>
                <div className="space-y-1.5">
                    <Label>Città <span className="text-red-500">*</span></Label>
                    <Input value={dati.citta || ''} onChange={e => set('citta', e.target.value)} placeholder="Milano" />
                </div>
                <div className="space-y-1.5">
                    <Label>CAP <span className="text-red-500">*</span></Label>
                    <Input value={dati.cap || ''} onChange={e => set('cap', e.target.value)} placeholder="20100" />
                </div>
                <div className="space-y-1.5">
                    <Label>Provincia <span className="text-red-500">*</span></Label>
                    <Input value={dati.provincia || ''} onChange={e => set('provincia', e.target.value)} placeholder="MI" maxLength={2} className="uppercase" />
                </div>
            </div>

            {/* Prodotto */}
            <div className="space-y-2">
                <Label>Scegli il prodotto per questo immobile <span className="text-red-500">*</span></Label>
                <SelettoreProdotto value={dati.prodotto} onChange={v => set('prodotto', v)} />
            </div>

            {/* Ruolo */}
            <div className="space-y-2">
                <Label>Sei il proprietario o il gestore di questo immobile? <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-3">
                    {['proprietario', 'gestore'].map(r => (
                        <button key={r} type="button" onClick={() => set('ruolo', r)}
                            className={`px-4 py-3 rounded-lg border-2 text-sm font-medium capitalize transition-all ${dati.ruolo === r ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'
                                }`}>
                            {r === 'proprietario' ? '🏠 Proprietario' : '🤝 Gestore'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dati proprietario (solo se gestore) */}
            {isGestore && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-4">
                    <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Dati del proprietario
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Nome proprietario <span className="text-red-500">*</span></Label>
                            <Input value={dati.propNome || ''} onChange={e => set('propNome', e.target.value)} placeholder="Mario" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Cognome proprietario <span className="text-red-500">*</span></Label>
                            <Input value={dati.propCognome || ''} onChange={e => set('propCognome', e.target.value)} placeholder="Rossi" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Email proprietario <span className="text-red-500">*</span></Label>
                            <Input type="email" value={dati.propEmail || ''} onChange={e => set('propEmail', e.target.value)} placeholder="mario.rossi@email.it" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Telefono proprietario</Label>
                            <Input value={dati.propTelefono || ''} onChange={e => set('propTelefono', e.target.value)} placeholder="+39 333 1234567" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Step 2 AB — Immobili ─────────────────────────────────────────────────────
const StepImmobili = ({ immobili, setImmobili }) => {
    const aggiungi = () => setImmobili(prev => [...prev, { id: Date.now(), indirizzo: '', citta: '', cap: '', provincia: '', prodotto: '', ruolo: '' }]);
    const rimuovi = (id) => setImmobili(prev => prev.filter(i => i.id !== id));
    const aggiorna = (id, dati) => setImmobili(prev => prev.map(i => i.id === id ? { ...i, ...dati } : i));

    return (
        <div className="space-y-4">
            {immobili.map((im, idx) => (
                <FormImmobile key={im.id} idx={idx} dati={im}
                    onChange={d => aggiorna(im.id, d)}
                    onRimuovi={() => rimuovi(im.id)}
                    mostraRimuovi={immobili.length > 1} />
            ))}
            <button onClick={aggiungi}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm font-medium text-muted-foreground hover:text-primary">
                <Plus className="w-4 h-4" /> Aggiungi un altro immobile
            </button>
        </div>
    );
};

// ─── Step 3 AB — Documenti ────────────────────────────────────────────────────
const StepDocumenti = ({ immobili, dati, setDati }) => {
    const set = (imId, campo, val) => setDati(prev => ({
        ...prev, [imId]: { ...prev[imId], [campo]: val }
    }));

    const aggiungiExtra = (imId) => {
        const extras = dati[imId]?.extras || [];
        setDati(prev => ({ ...prev, [imId]: { ...prev[imId], extras: [...extras, { id: Date.now(), file: null, nota: '' }] } }));
    };

    return (
        <div className="space-y-6">
            {immobili.map((im, idx) => (
                <div key={im.id} className="border border-border rounded-xl p-5 space-y-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Home className="w-4 h-4 text-primary" />
                        Immobile {idx + 1} — {im.indirizzo || 'Indirizzo non inserito'}, {im.citta}
                    </h3>

                    <UploadDoc label="Visura catastale" obbligatorio
                        value={dati[im.id]?.visura} onChange={f => set(im.id, 'visura', f)} />

                    <UploadDoc label="Contratto di locazione" nota="Se già esistente"
                        value={dati[im.id]?.contratto} onChange={f => set(im.id, 'contratto', f)} />

                    {im.ruolo === 'gestore' && (
                        <UploadDoc label="Atto di proprietà / delega" obbligatorio nota="Richiesto poiché sei il gestore"
                            value={dati[im.id]?.attoProprietà} onChange={f => set(im.id, 'attoProprietà', f)} />
                    )}

                    {/* Documenti inquilino */}
                    <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                        <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" /> Documento inquilino
                        </p>
                        <p className="text-xs text-muted-foreground">Se già conosci l'inquilino puoi caricare i suoi documenti ora, altrimenti potrai farlo in seguito.</p>
                        <UploadDoc label="Documento identità inquilino"
                            value={dati[im.id]?.docInquilino} onChange={f => set(im.id, 'docInquilino', f)} />
                    </div>

                    {/* Documenti extra */}
                    {(dati[im.id]?.extras || []).map((ex, i) => (
                        <div key={ex.id} className="flex gap-3 items-start">
                            <div className="flex-1 space-y-1.5">
                                <Input placeholder="Descrizione documento (es. Planimetria)" value={ex.nota}
                                    onChange={e => setDati(prev => {
                                        const extras = [...(prev[im.id]?.extras || [])];
                                        extras[i] = { ...extras[i], nota: e.target.value };
                                        return { ...prev, [im.id]: { ...prev[im.id], extras } };
                                    })} />
                                <UploadDoc label="File" value={ex.file} onChange={f => setDati(prev => {
                                    const extras = [...(prev[im.id]?.extras || [])];
                                    extras[i] = { ...extras[i], file: f };
                                    return { ...prev, [im.id]: { ...prev[im.id], extras } };
                                })} />
                            </div>
                            <button onClick={() => setDati(prev => {
                                const extras = (prev[im.id]?.extras || []).filter((_, j) => j !== i);
                                return { ...prev, [im.id]: { ...prev[im.id], extras } };
                            })} className="text-red-400 hover:text-red-600 mt-1">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}

                    <button onClick={() => aggiungiExtra(im.id)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Plus className="w-4 h-4" /> Aggiungi documento opzionale
                    </button>
                </div>
            ))}
        </div>
    );
};

// ─── Step 4 AB — Referente ────────────────────────────────────────────────────
const StepReferente = ({ dati, setDati }) => (
    <div className="space-y-5">
        <div className="space-y-1.5">
            <Label>Codice referente</Label>
            <Input value={dati.codiceReferente || ''} onChange={e => setDati(p => ({ ...p, codiceReferente: e.target.value }))}
                placeholder="Es. REF-001" />
            <p className="text-xs text-muted-foreground">Inserisci il codice se sei stato indirizzato da un nostro commerciale. Campo opzionale.</p>
        </div>
        <label className="flex items-start gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${dati.supportoLegale ? 'bg-primary border-primary' : 'border-border group-hover:border-primary/50'
                }`} onClick={() => setDati(p => ({ ...p, supportoLegale: !p.supportoLegale }))}>
                {dati.supportoLegale && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">Richiedo supporto legale</p>
                <p className="text-xs text-muted-foreground mt-0.5">Un avvocato CRIA ti verrà assegnato per gestire aspetti documentali e contrattuali.</p>
            </div>
        </label>
    </div>
);

// ─── Step 1 C — Documenti richiedente ────────────────────────────────────────
const StepDocRichiedente = ({ dati, setDati }) => {
    const utente = nomeUtente();
    return (
        <div className="space-y-5">
            <div className="p-4 bg-muted/40 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">La tua richiesta</p>
                <p className="text-sm text-foreground">{utente.nome} {utente.cognome} — {utente.email}</p>
            </div>
            <div className="space-y-1.5">
                <Label>Codice fiscale <span className="text-red-500">*</span></Label>
                <Input value={dati.codiceFiscale || ''} onChange={e => setDati(p => ({ ...p, codiceFiscale: e.target.value }))} placeholder="RSSMRC85M12F205Z" className="uppercase" />
            </div>
            <UploadDoc label="Documento di identità" obbligatorio nota="Carta identità o passaporto"
                value={dati.docIdentita} onChange={f => setDati(p => ({ ...p, docIdentita: f }))} />
        </div>
    );
};

// ─── Step 2 C — Dati persona da verificare ────────────────────────────────────
const StepDatiPersona = ({ dati, setDati }) => {
    const set = (k, v) => setDati(p => ({ ...p, [k]: v }));
    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">Il potenziale inquilino deve aver firmato l'informativa privacy e il consenso al trattamento dei dati prima che la verifica possa partire.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label>Nome <span className="text-red-500">*</span></Label>
                    <Input value={dati.nome || ''} onChange={e => set('nome', e.target.value)} placeholder="Mario" />
                </div>
                <div className="space-y-1.5">
                    <Label>Cognome <span className="text-red-500">*</span></Label>
                    <Input value={dati.cognome || ''} onChange={e => set('cognome', e.target.value)} placeholder="Rossi" />
                </div>
                <div className="space-y-1.5">
                    <Label>Data di nascita <span className="text-red-500">*</span></Label>
                    <Input type="date" value={dati.dataNascita || ''} onChange={e => set('dataNascita', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <Label>Luogo di nascita <span className="text-red-500">*</span></Label>
                    <Input value={dati.luogoNascita || ''} onChange={e => set('luogoNascita', e.target.value)} placeholder="Roma" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                    <Label>Codice fiscale <span className="text-red-500">*</span></Label>
                    <Input value={dati.codiceFiscale || ''} onChange={e => set('codiceFiscale', e.target.value)} placeholder="RSSMRC85M12F205Z" className="uppercase" />
                </div>
            </div>
        </div>
    );
};

// ─── Step 3 C — Pagamento ─────────────────────────────────────────────────────
const StepPagamento = ({ dati, setDati }) => (
    <div className="space-y-4">
        <div className="p-4 bg-muted/40 rounded-xl flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-foreground">CRIA Verifica</p>
                <p className="text-xs text-muted-foreground">Verifica identità e affidabilità — risposta entro 48 ore</p>
            </div>
            <p className="text-2xl font-bold text-foreground">€ 49</p>
        </div>
        <Label>Metodo di pagamento <span className="text-red-500">*</span></Label>
        <div className="space-y-3">
            {[
                { id: 'stripe', label: 'Carta di credito / debito', desc: 'Pagamento sicuro tramite Stripe' },
                { id: 'bonifico', label: 'Bonifico bancario', desc: 'Attivazione dopo ricezione del bonifico (2-3 giorni)' },
            ].map(m => (
                <button key={m.id} type="button" onClick={() => setDati(p => ({ ...p, metodo: m.id }))}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${dati.metodo === m.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                        }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-sm text-foreground">{m.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                        </div>
                        {dati.metodo === m.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                </button>
            ))}
        </div>
    </div>
);

// ─── Configurazione flussi ────────────────────────────────────────────────────
const STEPS_AB = [
    { id: 1, nome: 'Identità', breve: 'Identità' },
    { id: 2, nome: 'Immobili', breve: 'Immobili' },
    { id: 3, nome: 'Documenti', breve: 'Documenti' },
    { id: 4, nome: 'Referente', breve: 'Referente' },
];

const STEPS_C = [
    { id: 1, nome: 'I tuoi documenti', breve: 'Documenti' },
    { id: 2, nome: 'Dati persona da verificare', breve: 'Persona' },
    { id: 3, nome: 'Pagamento', breve: 'Pagamento' },
];

// ─── Componente principale ────────────────────────────────────────────────────
const OnboardingUtente = () => {
    const navigate = useNavigate();
    const flId = flussoId();
    const steps = flId === 'C' ? STEPS_C : STEPS_AB;
    const totale = steps.length;

    const [stepIdx, setStepIdx] = useState(0);
    const [loading, setLoading] = useState(false);
    const [completato, setCompletato] = useState(false);

    // Dati per ogni step
    const [datiIdentita, setDatiIdentita] = useState({});
    const [immobili, setImmobili] = useState([{ id: 1, indirizzo: '', citta: '', cap: '', provincia: '', prodotto: '', ruolo: '' }]);
    const [datiDocumenti, setDatiDocumenti] = useState({});
    const [datiReferente, setDatiReferente] = useState({});
    const [datiDocRich, setDatiDocRich] = useState({});
    const [datiPersona, setDatiPersona] = useState({});
    const [datiPagamento, setDatiPagamento] = useState({});

    const step = steps[stepIdx];

    const validaStep = () => {
        if (flId === 'AB') {
            if (stepIdx === 0) {
                const isAgenzia = tipoAccount() === 'agenzia';
                if (!datiIdentita.codiceFiscale?.trim()) { toast.error('Inserisci il codice fiscale'); return false; }
                if (!datiIdentita.docIdentita) { toast.error('Carica il documento di identità'); return false; }
                if (isAgenzia && !datiIdentita.partitaIva?.trim()) { toast.error('Inserisci la partita IVA'); return false; }
                if (isAgenzia && !datiIdentita.visuraCamerale) { toast.error('Carica la visura camerale'); return false; }
            }
            if (stepIdx === 1) {
                for (const im of immobili) {
                    if (!im.indirizzo?.trim() || !im.citta?.trim()) { toast.error('Compila indirizzo e città per tutti gli immobili'); return false; }
                    if (!im.prodotto) { toast.error('Seleziona il prodotto per ogni immobile'); return false; }
                    if (!im.ruolo) { toast.error('Indica se sei proprietario o gestore per ogni immobile'); return false; }
                    if (im.ruolo === 'gestore' && (!im.propNome?.trim() || !im.propCognome?.trim() || !im.propEmail?.trim())) {
                        toast.error('Compila i dati del proprietario per gli immobili in gestione'); return false;
                    }
                }
            }
            if (stepIdx === 2) {
                for (const im of immobili) {
                    if (!datiDocumenti[im.id]?.visura) { toast.error(`Carica la visura catastale per l'immobile ${im.indirizzo || im.id}`); return false; }
                }
            }
        }
        if (flId === 'C') {
            if (stepIdx === 0) {
                if (!datiDocRich.codiceFiscale?.trim()) { toast.error('Inserisci il codice fiscale'); return false; }
                if (!datiDocRich.docIdentita) { toast.error('Carica il documento di identità'); return false; }
            }
            if (stepIdx === 1) {
                if (!datiPersona.nome?.trim() || !datiPersona.cognome?.trim()) { toast.error('Inserisci nome e cognome della persona da verificare'); return false; }
                if (!datiPersona.codiceFiscale?.trim()) { toast.error('Inserisci il codice fiscale della persona da verificare'); return false; }
            }
            if (stepIdx === 2) {
                if (!datiPagamento.metodo) { toast.error('Seleziona un metodo di pagamento'); return false; }
            }
        }
        return true;
    };

    const handleAvanti = async () => {
        if (!validaStep()) return;
        setLoading(true);
        try {
            await salvaStep('mock-pratica-1', step.id, {});
            const { completato: done } = await avanzaStep('mock-pratica-1', stepIdx + 1, totale);
            if (done) {
                sessionStorage.removeItem('onboarding_flusso');
                setCompletato(true);
            } else {
                setStepIdx(s => s + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch { toast.error('Errore nel salvataggio. Riprova.'); }
        finally { setLoading(false); }
    };

    // ── Completato ──
    if (completato) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 text-center space-y-6">
                <img src="/logo.png" alt="CRIA" className="h-14 w-auto" />
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div className="space-y-3 max-w-md">
                    <h1 className="text-2xl font-bold text-foreground">Richiesta inviata con successo!</h1>
                    {flId === 'C' ? (
                        <p className="text-muted-foreground">La tua richiesta è stata inviata. Riceverai una email con il risultato della verifica entro 24 ore.</p>
                    ) : (
                        <>
                            <p className="text-muted-foreground">Il tuo profilo è in fase di verifica. Entro 24 ore riceverai via email il preventivo per il servizio scelto.</p>
                            <p className="text-sm text-muted-foreground">Puoi seguire la procedura di verifica dalla tua dashboard.</p>
                        </>
                    )}
                </div>
                <Button onClick={() => navigate('/dashboard/locatore')} className="gap-2">
                    Vai alla dashboard <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <>
            <Helmet><title>{step.nome} - Onboarding CRIA</title></Helmet>
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">

                <div className="flex justify-center pt-8 pb-2">
                    <img src="/logo.png" alt="CRIA" className="h-12 w-auto" />
                </div>

                <div className="flex-1 flex items-start justify-center px-4 py-6">
                    <div className="w-full max-w-lg space-y-6">

                        {/* Progress */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-foreground">{flId === 'C' ? 'CRIA Verifica' : 'CRIA — Onboarding'}</span>
                                <span className="text-muted-foreground">Step {stepIdx + 1} di {totale}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${((stepIdx + 1) / totale) * 100}%` }} />
                            </div>
                            <div className="flex justify-between">
                                {steps.map((s, i) => (
                                    <div key={s.id} className="flex flex-col items-center gap-1" style={{ width: `${100 / totale}%` }}>
                                        <div className={`w-2 h-2 rounded-full transition-colors ${i <= stepIdx ? 'bg-primary' : 'bg-muted'}`} />
                                        <span className={`text-xs text-center hidden sm:block ${i === stepIdx ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                            {s.breve}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Card step */}
                        <Card className="shadow-sm">
                            <CardContent className="pt-6 pb-6 space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-foreground">{step.nome}</h2>
                                </div>

                                {/* Rendering step */}
                                {flId === 'AB' && stepIdx === 0 && <StepIdentita dati={datiIdentita} setDati={setDatiIdentita} />}
                                {flId === 'AB' && stepIdx === 1 && <StepImmobili immobili={immobili} setImmobili={setImmobili} />}
                                {flId === 'AB' && stepIdx === 2 && <StepDocumenti immobili={immobili} dati={datiDocumenti} setDati={setDatiDocumenti} />}
                                {flId === 'AB' && stepIdx === 3 && <StepReferente dati={datiReferente} setDati={setDatiReferente} />}
                                {flId === 'C' && stepIdx === 0 && <StepDocRichiedente dati={datiDocRich} setDati={setDatiDocRich} />}
                                {flId === 'C' && stepIdx === 1 && <StepDatiPersona dati={datiPersona} setDati={setDatiPersona} />}
                                {flId === 'C' && stepIdx === 2 && <StepPagamento dati={datiPagamento} setDati={setDatiPagamento} />}

                                {/* Navigazione */}
                                <div className="flex items-center justify-between pt-2">
                                    <Button variant="outline" onClick={() => { setStepIdx(s => s - 1); window.scrollTo({ top: 0 }); }}
                                        disabled={stepIdx === 0 || loading} className="gap-2">
                                        <ChevronLeft className="w-4 h-4" /> Indietro
                                    </Button>
                                    <Button onClick={handleAvanti} disabled={loading} className="gap-2 min-w-32">
                                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvataggio...</> :
                                            stepIdx === totale - 1 ? <>Completa <CheckCircle2 className="w-4 h-4" /></> :
                                                <>Avanti <ChevronRight className="w-4 h-4" /></>}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pb-6">
                            <Shield className="w-3.5 h-3.5" />
                            <span>I tuoi dati sono protetti e crittografati</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OnboardingUtente;