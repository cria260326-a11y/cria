import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { nomeVisualizzato, iniziali, via } from '@/lib/aree';
import {
    Check, ChevronDown, LogOut, LogIn, User, Fingerprint, Receipt, ShieldCheck, FileSearch,
} from 'lucide-react';

// ═════════════════════════════════════════════════════════════════════════════
// SELETTORE DI CONTESTO — F-10
// In testata, sempre visibile. Mostra con quale cappello si sta guardando e
// permette di cambiarlo. Contiene anche le voci dell'account, che sono di
// tutti i cappelli.
// ═════════════════════════════════════════════════════════════════════════════

const VOCI_ACCOUNT = [
    { label: "Documento d'identità", path: '/profilo/identita', icona: Fingerprint },
    { label: 'Dati di fatturazione', path: '/profilo/fatturazione', icona: Receipt },
    { label: 'Consensi', path: '/profilo/consensi', icona: ShieldCheck },
    { label: 'I miei dati', path: '/profilo/i-miei-dati', icona: FileSearch },
];

const etichettaVoce = 'text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold';

const SelettoreContesto = () => {
    const { persona, contesti, contestoAttivo, scegliContesto, esci } = useAuth();
    const navigate = useNavigate();

    if (!persona) {
        return (
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <LogIn className="w-4 h-4" /> Accedi
            </Link>
        );
    }

    const entra = (contesto) => {
        scegliContesto(contesto.area);
        navigate(contesto.home);
    };

    const esciDaCria = async () => {
        await esci();
        navigate('/login');
    };

    const IconaAttiva = contestoAttivo?.icona;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex items-center gap-3 rounded-lg border border-border bg-background px-2.5 py-1.5 text-left hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {iniziali(persona)}
                    </span>
                    <span className="min-w-0 hidden sm:block">
                        <span className="block text-sm font-medium text-foreground truncate max-w-[13rem]">
                            {nomeVisualizzato(persona)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            {IconaAttiva && <IconaAttiva className="w-3 h-3" />}
                            {contestoAttivo ? contestoAttivo.cappello : 'Nessuna area scelta'}
                        </span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                {contesti.length > 0 && (
                    <>
                        <DropdownMenuLabel className={etichettaVoce}>
                            {contesti.length > 1 ? 'Stai guardando come' : 'La tua area'}
                        </DropdownMenuLabel>
                        {contesti.map(contesto => {
                            const Icona = contesto.icona;
                            const attivo = contesto.area === contestoAttivo?.area;
                            return (
                                <DropdownMenuItem
                                    key={contesto.area}
                                    onSelect={() => entra(contesto)}
                                    className="items-start gap-3 py-2 cursor-pointer"
                                >
                                    <Icona className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{contesto.cappello}</p>
                                        {contesto.posizioni.length > 0 && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {contesto.posizioni.map(p => via(p.immobile)).join(' · ')}
                                            </p>
                                        )}
                                    </div>
                                    {attivo && <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />}
                                </DropdownMenuItem>
                            );
                        })}
                        <DropdownMenuSeparator />
                    </>
                )}

                <DropdownMenuLabel className={etichettaVoce}>Il mio account</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => navigate(contestoAttivo?.profilo || '/profilo')} className="gap-3 cursor-pointer">
                    <User className="w-4 h-4 text-muted-foreground" /> Il mio profilo
                </DropdownMenuItem>
                {VOCI_ACCOUNT.map(({ label, path, icona: Icona }) => (
                    <DropdownMenuItem key={path} onSelect={() => navigate(path)} className="gap-3 cursor-pointer">
                        <Icona className="w-4 h-4 text-muted-foreground" /> {label}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={esciDaCria} className="gap-3 cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4" /> Esci
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default SelettoreContesto;
