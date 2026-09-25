import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ChevronRight, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { AREE, isVerificata } from '@/lib/aree';
import AttesaAccesso from '@/components/accesso/AttesaAccesso';
import SelettoreContesto from '@/components/SelettoreContesto';

const LOGO_URL = '/logo.png';

// ═════════════════════════════════════════════════════════════════════════════
// LAYOUT UNICO DELLE AREE — F-11
// Sostituisce i cinque layout che differivano solo per le voci di menu.
// Ogni area passa la propria navigazione: piatta (nav) o a gruppi (navGroups).
// Il selettore di contesto (F-10) sta in testata; in fondo alla barra laterale
// resta scritto con quale cappello si sta guardando.
// ═════════════════════════════════════════════════════════════════════════════

const DashboardLayout = ({ area, nav, navGroups, titolo, azioniTestata, children }) => {
    const { persona, contesti, contestoAttivo, scegliContesto, loading } = useAuth();
    const location = useLocation();
    const [menuAperto, setMenuAperto] = useState(false);
    const config = AREE[area];
    const home = config.home;

    // Arrivando a un'area da un link diretto, il contesto la segue —
    // purché la persona abbia davvero quel cappello.
    useEffect(() => {
        if (!persona || contestoAttivo?.area === area) return;
        if (contesti.some(c => c.area === area)) scegliContesto(area);
    }, [persona, area, contestoAttivo, contesti, scegliContesto]);

    // Sul telefono il menu è un cassetto: si chiude da solo quando si cambia pagina.
    useEffect(() => { setMenuAperto(false); }, [location.pathname]);

    // Senza accesso non si entra; con l'accesso, solo nelle aree che la persona ha.
    if (loading) return <AttesaAccesso />;
    if (!persona) return <Navigate to="/login" replace state={{ da: location.pathname }} />;
    if (!isVerificata(persona)) return <Navigate to="/in-attesa" replace />;
    if (!contesti.some(c => c.area === area)) return <Navigate to="/dashboard" replace />;

    const gruppi = navGroups || [{ label: null, items: nav || [] }];
    // Vince la voce più specifica: se due voci corrispondono, si accende quella col percorso più lungo.
    // `anche` elenca le rotte che appartengono a una voce senza stare sotto il suo percorso.
    const corrisponde = (path) => (path === home ? location.pathname === path : location.pathname.startsWith(path));
    const quantoCorrisponde = (n) => Math.max(-1, ...[n.path, ...(n.anche || [])].filter(corrisponde).map(p => p.length));
    const activeItem = gruppi.flatMap(g => g.items)
        .map(n => ({ n, l: quantoCorrisponde(n) }))
        .filter(x => x.l >= 0)
        .sort((x, y) => y.l - x.l)[0]?.n;
    const isActive = (path) => activeItem?.path === path;
    const briciola = titolo || (location.pathname !== home ? activeItem?.label : null);
    const posizioni = contesti.find(c => c.area === area)?.posizioni || [];

    return (
        <div className="flex h-screen bg-background overflow-hidden">

            {menuAperto && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMenuAperto(false)} aria-hidden="true" />}

            <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${menuAperto ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-20 flex items-center justify-center px-5 border-b border-border flex-shrink-0">
                    <Link to={home} className="flex items-center">
                        <img src={LOGO_URL} alt="CRIA" className="h-14 w-auto" />
                    </Link>
                </div>

                <nav className={`flex-1 overflow-y-auto py-4 px-3 ${navGroups ? 'space-y-5' : ''}`}>
                    {gruppi.map((gruppo, i) => (
                        <div key={gruppo.label || i}>
                            {gruppo.label && (
                                <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground/70">
                                    {gruppo.label}
                                </div>
                            )}
                            <div className="space-y-0.5">
                                {gruppo.items.map(({ label, path, icon: Icon }) => (
                                    <Link
                                        key={path}
                                        to={path}
                                        className={`flex items-center gap-3 px-3 ${navGroups ? 'py-2' : 'py-2.5'} rounded-lg text-sm font-medium transition-colors ${isActive(path)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-border p-4 flex-shrink-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground/70 mb-1">Stai guardando</p>
                    <p className="text-sm font-medium text-foreground">{config.cappello}</p>
                    {posizioni.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {posizioni.length === 1 ? posizioni[0].immobile : `${posizioni.length} immobili`}
                        </p>
                    )}
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-card border-b border-border flex items-center justify-between gap-3 px-4 lg:px-6 flex-shrink-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                        <button type="button" onClick={() => setMenuAperto(a => !a)} className="lg:hidden -ml-1 p-2 rounded-lg hover:bg-muted text-foreground" aria-label={menuAperto ? 'Chiudi il menu' : 'Apri il menu'}>
                            {menuAperto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <span className="hidden sm:inline">{config.etichetta}</span>
                        {briciola && (
                            <>
                                <ChevronRight className="w-4 h-4 flex-shrink-0 hidden sm:block" />
                                <span className="text-foreground font-medium truncate">{briciola}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {azioniTestata}
                        <SelettoreContesto />
                    </div>
                </header>

                <main data-scorre-pagina className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/30">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
