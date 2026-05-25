import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard, ClipboardList, Users, Calendar,
    Euro, LogOut, ChevronRight, User
} from 'lucide-react';

const LOGO_URL = '/logo.png';

const NAV = [
    { label: 'Panoramica', path: '/dashboard/avvocato', icon: LayoutDashboard },
    { label: 'Coda lavoro', path: '/dashboard/avvocato/coda', icon: ClipboardList },
    { label: 'Clienti assegnati', path: '/dashboard/avvocato/clienti', icon: Users },
    { label: 'Scadenze', path: '/dashboard/avvocato/scadenze', icon: Calendar },
    { label: 'Compensi', path: '/dashboard/avvocato/compensi', icon: Euro },
];

const AvvocatoLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/dashboard/avvocato') return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    const activeItem = NAV.find(n => isActive(n.path));

    return (
        <div className="flex h-screen bg-background overflow-hidden">

            <aside className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col">
                <div className="h-20 flex items-center justify-center px-5 border-b border-border flex-shrink-0">
                    <Link to="/dashboard/avvocato" className="flex items-center">
                        <img src={LOGO_URL} alt="CRIA" className="h-14 w-auto" />
                    </Link>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
                    {NAV.map(({ label, path, icon: Icon }) => {
                        const active = isActive(path);
                        return (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                    }`}
                            >
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-border p-4 flex-shrink-0">
                    <Link
                        to="/dashboard/avvocato/profilo"
                        className="flex items-center gap-3 mb-3 p-1.5 rounded-lg hover:bg-accent transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary uppercase">
                                {user?.name?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{user?.name || 'Avvocato'}</p>
                            <p className="text-xs text-muted-foreground">Avvocato</p>
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

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Avvocato</span>
                        {location.pathname !== '/dashboard/avvocato' && activeItem && (
                            <>
                                <ChevronRight className="w-4 h-4" />
                                <span className="text-foreground font-medium">
                                    {activeItem.label}
                                </span>
                            </>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AvvocatoLayout;