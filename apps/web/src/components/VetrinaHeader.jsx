import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Building2, User, Search } from 'lucide-react';

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

const PRODOTTI = [
    { titolo: 'Per locatori e agenzie', desc: 'Gestione contratti, pagamenti e contestazioni', to: '/per-locatori', icon: Building2, color: '#1A2D52' },
    { titolo: 'Per inquilini', desc: 'Cosa cambia se il tuo locatore è su CRIA', to: '/per-inquilini', icon: User, color: '#22C55E' },
    { titolo: 'Verifica un inquilino', desc: 'Controllo affidabilità one-shot', to: '/verifica', icon: Search, color: '#C97B5C' },
];

const VetrinaHeader = ({ activePage = '' }) => {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);
    const location = useLocation();

    useEffect(() => { setOpen(false); }, [location.pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!open) return;
        const handleOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        const handleEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [open]);

    const isActive = (page) => activePage === page;

    const handleProdottiClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(prev => !prev);
    };

    return (
        <header
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                transition: 'all 0.5s',
                paddingTop: scrolled ? '12px' : '20px',
                paddingBottom: scrolled ? '12px' : '20px',
                background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(26, 45, 82, 0.08)' : '1px solid transparent',
            }}
        >
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">

                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1A2D52' }}>
                        <svg viewBox="0 0 24 24" fill="none" style={{ width: '24px', height: '24px' }}>
                            <path d="M12 3 L4 9 L4 20 L20 20 L20 9 Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                            <circle cx="12" cy="11" r="1.3" fill="#22C55E" />
                            <circle cx="12" cy="14.5" r="1.3" fill="#F59E0B" />
                            <circle cx="12" cy="18" r="1.3" fill="#EF4444" />
                        </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                        <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>CRIA</span>
                        <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.18em', marginTop: '2px', color: '#6B6B5E', fontFamily: fontBody, fontWeight: 500 }}>
                            Centrale Rischi Italia Affitti
                        </span>
                    </div>
                </Link>

                <nav className="hidden lg:flex" style={{ alignItems: 'center', gap: '36px', fontFamily: fontBody }}>
                    <Link to="/come-funziona" style={{ fontSize: '14px', fontWeight: 500, color: isActive('come-funziona') ? '#1A2D52' : '#1A1A1A', textDecoration: 'none' }}>
                        Come funziona
                    </Link>

                    {/* DROPDOWN PRODOTTI */}
                    <div ref={wrapperRef} style={{ position: 'relative' }}>
                        <button
                            type="button"
                            onClick={handleProdottiClick}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: isActive('prodotti') || open ? '#1A2D52' : '#1A1A1A',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px 0',
                                fontFamily: fontBody,
                            }}
                        >
                            Prodotti
                            <ChevronDown style={{ width: '14px', height: '14px', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        </button>

                        {open && (
                            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: '420px', paddingTop: '8px' }}>
                                <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                                    <div style={{ padding: '8px' }}>
                                        {PRODOTTI.map(({ titolo, desc, to, icon: Icon, color }) => (
                                            <Link
                                                key={to}
                                                to={to}
                                                onClick={() => setOpen(false)}
                                                style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', borderRadius: '12px', textDecoration: 'none', transition: 'background 0.2s' }}
                                                onMouseOver={(e) => { e.currentTarget.style.background = '#F5F5F0'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: `${color}15` }}>
                                                    <Icon style={{ width: '16px', height: '16px', color }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#1A2D52' }}>{titolo}</div>
                                                    <div style={{ fontSize: '12px', marginTop: '2px', color: '#6B6B5E' }}>{desc}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link to="/supporto" style={{ fontSize: '14px', fontWeight: 500, color: isActive('supporto') ? '#1A2D52' : '#1A1A1A', textDecoration: 'none' }}>
                        FAQ e contatti
                    </Link>
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link to="/login" className="hidden sm:block" style={{ fontSize: '14px', fontWeight: 500, color: '#1A2D52', fontFamily: fontBody, textDecoration: 'none' }}>
                        Accedi
                    </Link>
                    <Link to="/inizia" style={{ textDecoration: 'none' }}>
                        <button
                            style={{
                                padding: '10px 20px',
                                borderRadius: '999px',
                                fontSize: '14px',
                                fontWeight: 600,
                                background: '#1A2D52',
                                color: '#FFFFFF',
                                fontFamily: fontBody,
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            Inizia ora
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default VetrinaHeader;