import React, { useState } from 'react';
import { toast } from 'sonner';
import { Lock, NotebookPen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { nomeOperatore } from '@/data/operatori';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';
import { scriviNota } from '@/lib/garanziaDemo';
import { fmtData } from '@/lib/formato';
import AzioneGaranzia from './AzioneGaranzia';

// Le note interne della pratica: le scrivono il gestore e la responsabile
// legale, e non escono dal back office.
const NoteInterne = ({ pratica }) => {
    const { operatoreId } = useOperatoreAttivo();
    const [aperta, setAperta] = useState(false);
    const [testo, setTesto] = useState('');

    const salva = () => {
        const r = scriviNota(pratica, operatoreId, testo);
        if (!r.ok) return toast.error(r.motivo);
        toast.success('Nota salvata');
        setTesto('');
        return setAperta(false);
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><NotebookPen className="w-5 h-5" /> Note interne</CardTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Non le vedono né il proprietario né l’inquilino.</p>
            </CardHeader>
            <CardContent className="space-y-3">
                {pratica.note.length === 0
                    ? <p className="text-sm text-muted-foreground">Nessuna nota.</p>
                    : (
                        <ul className="space-y-3">
                            {pratica.note.map(n => (
                                <li key={n.id} className="text-sm">
                                    <p className="text-xs text-muted-foreground">{fmtData(n.il)} · {nomeOperatore(n.autore)}</p>
                                    <p className="text-foreground">{n.testo}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                {aperta ? (
                    <div className="space-y-2">
                        <Textarea rows={3} value={testo} onChange={e => setTesto(e.target.value)} aria-label="Testo della nota" placeholder="Solo quello che serve alla pratica." />
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" className="bg-[#1A2D52] hover:bg-[#0F1B33]" onClick={salva}>Salva la nota</Button>
                            <Button size="sm" variant="ghost" onClick={() => { setAperta(false); setTesto(''); }}>Annulla</Button>
                        </div>
                    </div>
                ) : (
                    <AzioneGaranzia azione="scrivi_nota" record={pratica} variant="outline" onEsegui={() => setAperta(true)}>Scrivi una nota</AzioneGaranzia>
                )}
            </CardContent>
        </Card>
    );
};

export default NoteInterne;
