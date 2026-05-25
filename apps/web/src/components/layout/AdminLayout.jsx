import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard, Users, FileText, Home, Bell,
    CreditCard, UserCog, Package, ShoppingCart, HelpCircle,
    Percent, MessageSquare, ClipboardList, LogOut, ChevronRight,
    Scale, Banknote, Calculator, Shield,
    Mail, BarChart3, History, Settings, User
} from 'lucide-react';

const LOGO_URL = '/logo.png';

/* ───────── Struttura sidebar ─────────────────────────────────────────────
 * Raggruppata per area funzionale per evitare wall-of-icons.
 * Niente badge: contatori verranno aggiunti quando il backend li fornisce.
 * ─────────────────────────────────────────────────────────────────────── */
const NAV_GROUPS = [
    {
        label: 'Operatività',
        items: [
            { label: 'Panoramica', path: '/dashboard/admin', icon: LayoutDashboard },
            { label: 'Utenti', path: '/dashboard/admin/clienti', icon: Users },
            { label: 'Contratti e immobili', path: '/dashboard/admin/contratti', icon: Home },
            { label: 'Segnalazioni', path: '/dashboard/admin/segnalazioni', icon: Bell },
            { label: 'Contestazioni', path: '/dashboard/admin/contestazioni', icon: Scale },
            { label: 'Onboarding', path: '/dashboard/admin/onboarding', icon: ClipboardList },
            { label: 'Assistenza', path: '/dashboard/admin/assistenza', icon: MessageSquare },
        ],
    },
    {
        label: 'Business',
        items: [
            { label: 'Vendite', path: '/dashboard/admin/vendite', icon: ShoppingCart },
            { label: 'Bonifici', path: '/dashboard/admin/bonifici', icon: Banknote },
            { label: 'Pagamenti', path: '/dashboard/admin/pagamenti', icon: CreditCard },
            { label: 'Provvigioni', path: '/dashboard/admin/provvigioni', icon: Percent },
            { label: 'Contabilità', path: '/dashboard/admin/contabilita', icon: Calculator },
        ],
    },
    {
        label: 'Persone',
        items: [
            { label: 'Collaboratori', path: '/dashboard/admin/collaboratori', icon: UserCog },
        ],
    },
    {
        label: 'Sistema',
        items: [
            { label: 'Prodotti', path: '/dashboard/admin/prodotti', icon: Package },
            { label: 'FAQ', path: '/dashboard/admin/faq', icon: HelpCircle },
            { label: 'Email', path: '/dashboard/admin/email', icon: Mail },
            { label: 'Analytics', path: '/dashboard/admin/analytics', icon: BarChart3 },
            { label: 'Impostazioni', path: '/dashboard/admin/impostazioni', icon: Settings },
        ],
    },
];

const ROLE_LABELS = {
    admin: 'Amministratore',
    admin_visione: 'Admin (solo visione)',
    manager: 'Manager',
};

const AdminLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/dashboard/admin') return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    // Trova l'item attivo per il breadcrumb
    const allItems = NAV_GROUPS.flatMap(g => g.items);
    const activeItem = allItems.find(n => isActive(n.path));

    return (
        <div className="flex h-screen bg-background overflow-hidden">

            {/* ── Sidebar ─────────────────────────────────────────────── */}
            <aside className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col">

                {/* Logo */}
                <div className="h-20 flex items-center justify-center px-5 border-b border-border flex-shrink-0">
                    <Link to="/dashboard/admin" className="flex items-center">
                        <img src={LOGO_URL} alt="CRIA" className="h-14 w-auto" />
                    </Link>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                    {NAV_GROUPS.map((group) => (
                        <div key={group.label}>
                            <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.18em] font-semibold text-muted-foreground/70">
                                {group.label}
                            </div>
                            <div className="space-y-0.5">
                                {group.items.map(({ label, path, icon: Icon }) => {
                                    const active = isActive(path);
                                    return (
                                        <Link
                                            key={path}
                                            to={path}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate">{label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User + logout */}
                <div className="border-t border-border p-4 flex-shrink-0">
                    <Link
                        to="/dashboard/admin/profilo"
                        className="flex items-center gap-3 mb-3 p-1.5 rounded-lg hover:bg-accent transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary uppercase">
                                {user?.name?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                            <p className="text-xs text-muted-foreground">{ROLE_LABELS[user?.role] || user?.role}</p>
                        </div>
                        <User className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full gap-2 text-muted-foreground"
                    >
                        <LogOut className="w-4 h-4" />
                        Esci
                    </Button>
                </div>
            </aside>

            {/* ── Contenuto principale ────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Admin</span>
                        {location.pathname !== '/dashboard/admin' && activeItem && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-foreground font-medium">
                                    {activeItem.label}
                                </span>
                            </>
                        )}
                    </div>
                </header>

                {/* Pagina */}
                <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
                    {children}
                </main>
            </div>

        </div>
    );
};

export default AdminLayout;