import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Building2, User, Search, Briefcase, Menu, X } from 'lucide-react';

import { PRODOTTI, PRODOTTI_PROPRIETARIO, prezzoProdotto } from '@/data/catalogo';
import { useT } from '@/lib/testi';
import { semplice } from '@/components/testi/Ricco';

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

const NAVY = '#1A2D52';

const NOMI_PROPRIETARIO = [...new Set(PRODOTTI_PROPRIETARIO.map((c) => PRODOTTI[c].nome))].join(' · ');

// Le porte d'ingresso. I testi sono in src/testi/catalogo/comune.js (l'admin li
// cambia da Testi); nomi e prezzi arrivano dal catalogo dei prodotti.
// Le agenzie non hanno ancora una pagina: la voce porta al supporto.
const usePorte = () => {
    const t = useT();
    return [
        {
            id: 'proprietari',
            titolo: t('comune.menu.porta1.titolo'),
            desc: NOMI_PROPRIETARIO,
            to: '/per-proprietari',
            icon: Building2,
            color: NAVY,
        },
        {
            id: 'inquilini',
            titolo: t('comune.menu.porta2.titolo'),
            desc: t('comune.menu.porta2.testo'),
            to: '/per-inquilini',
            icon: User,
            color: '#22C55E',
        },
        {
            id: 'verifica',
            titolo: PRODOTTI.P3.nome,
            desc: t('comune.menu.porta3.testo', { prezzo: prezzoProdotto('P3'), ore: PRODOTTI.P3.oreEsito }),
            to: '/verifica',
            icon: Search,
            color: '#C97B5C',
        },
        {
            id: 'agenzie',
            titolo: PRODOTTI.P6.nome,
            desc: t('comune.menu.porta4.testo', { prezzo: prezzoProdotto('P6') }),
            to: '/supporto',
            icon: Briefcase,
            color: '#6B6B5E',
        },
    ];
};

const PERCORSI_PORTE = ['/per-proprietari', '/per-locatori', '/per-inquilini', '/verifica'];

const VetrinaHeader = ({ activePage = '' }) => {
    const t = useT();
    const porte = usePorte();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [menuMobile, setMenuMobile] = useState(false);
    const wrapperRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        setOpen(false);
        setMenuMobile(false);
    }, [location.pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!open && !menuMobile) return;
        const handleOutside = (e) => {
            if (open && wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                setOpen(false);
                setMenuMobile(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, [open, menuMobile]);

    const isActive = (page, path) => activePage === page || location.pathname === path;
    const porteAttive = activePage === 'prodotti' || PERCORSI_PORTE.includes(location.pathname);

    const linkStyle = (attivo) => ({
        fontSize: '14px',
        fontWeight: attivo ? 600 : 500,
        color: attivo ? NAVY : '#1A1A1A',
        textDecoration: 'none',
    });

    const solido = scrolled || menuMobile;

    const handlePorteClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen((prev) => !prev);
    };

    return (
        <header
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                transition: 'all 0.5s',
                paddingTop: scrolled ? '12px' : '20px',
                paddingBottom: scrolled ? '12px' : '20px',
                background: menuMobile ? '#FFFFFF' : scrolled ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
                backdropFilter: solido ? 'blur(20px)' : 'none',
                WebkitBackdropFilter: solido ? 'blur(20px)' : 'none',
                borderBottom: solido ? '1px solid rgba(26, 45, 82, 0.08)' : '1px solid transparent',
            }}
        >
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">

                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: NAVY }}>
                        <svg viewBox="0 0 24 24" fill="none" style={{ width: '24px', height: '24px' }}>
                            <path d="M12 3 L4 9 L4 20 L20 20 L20 9 Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                            <circle cx="12" cy="11" r="1.3" fill="#22C55E" />
                            <circle cx="12" cy="14.5" r="1.3" fill="#F59E0B" />
                            <circle cx="12" cy="18" r="1.3" fill="#EF4444" />
                        </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                        <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: NAVY }}>CRIA</span>
                        <span className="hidden sm:block" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.18em', marginTop: '2px', color: '#6B6B5E', fontFamily: fontBody, fontWeight: 500 }}>
                            {t('comune.testata.marchio')}
                        </span>
                    </div>
                </Link>

                <nav className="hidden lg:flex" style={{ alignItems: 'center', gap: '36px', fontFamily: fontBody }}>
                    <Link to="/come-funziona" style={linkStyle(isActive('come-funziona', '/come-funziona'))}>
                        {t('comune.menu.comeFunziona')}
                    </Link>

                    {/* DROPDOWN PORTE D'INGRESSO */}
                    <div ref={wrapperRef} style={{ position: 'relative' }}>
                        <button
                            type="button"
                            onClick={handlePorteClick}
                            aria-expanded={open}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '14px',
                                fontWeight: porteAttive ? 600 : 500,
                                color: porteAttive || open ? NAVY : '#1A1A1A',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px 0',
                                fontFamily: fontBody,
                            }}
                        >
                            {t('comune.menu.perChiE')}
                            <ChevronDown style={{ width: '14px', height: '14px', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        </button>

                        {open && (
                            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: '420px', paddingTop: '8px' }}>
                                <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#FFFFFF', border: '1px solid rgba(26, 45, 82, 0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                                    <div style={{ padding: '8px' }}>
                                        {porte.map(({ id, titolo, desc, to, icon: Icon, color }) => (
                                            <Link
                                                key={id}
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
                                                    <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: NAVY }}>{titolo}</div>
                                                    <div style={{ fontSize: '12px', marginTop: '2px', color: '#6B6B5E' }}>{desc}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link to="/supporto" style={linkStyle(isActive('supporto', '/supporto'))}>
                        {t('comune.menu.supporto')}
                    </Link>
                </nav>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/login" className="hidden sm:block" style={{ fontSize: '14px', fontWeight: 500, color: NAVY, fontFamily: fontBody, textDecoration: 'none' }}>
                        {t('comune.menu.accedi')}
                    </Link>
                    <Link
                        to="/inizia"
                        style={{
                            display: 'inline-block',
                            padding: '10px 20px',
                            borderRadius: '999px',
                            fontSize: '14px',
                            fontWeight: 600,
                            background: NAVY,
                            color: '#FFFFFF',
                            fontFamily: fontBody,
                            textDecoration: 'none',
                        }}
                    >
                        {t('comune.menu.inizia')}
                    </Link>
                    <button
                        type="button"
                        className="inline-flex lg:hidden"
                        onClick={() => setMenuMobile((prev) => !prev)}
                        aria-label={semplice(t(menuMobile ? 'comune.menu.chiudi' : 'comune.menu.apri'))}
                        aria-expanded={menuMobile}
                        style={{ width: '36px', height: '36px', borderRadius: '999px', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(26, 45, 82, 0.15)', color: NAVY, cursor: 'pointer' }}
                    >
                        {menuMobile
                            ? <X style={{ width: '18px', height: '18px' }} />
                            : <Menu style={{ width: '18px', height: '18px' }} />}
                    </button>
                </div>
            </div>

            {/* MENU MOBILE */}
            {menuMobile && (
                <div
                    className="lg:hidden"
                    style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        background: '#FFFFFF',
                        borderBottom: '1px solid rgba(26, 45, 82, 0.08)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                        maxHeight: 'calc(100vh - 80px)',
                        overflowY: 'auto',
                        fontFamily: fontBody,
                    }}
                >
                    <div className="max-w-[1400px] mx-auto px-6 py-4">
                        <Link to="/come-funziona" className="block py-3" style={linkStyle(isActive('come-funziona', '/come-funziona'))}>
                            {t('comune.menu.comeFunziona')}
                        </Link>

                        <div className="pt-3 pb-1 text-[10px] uppercase tracking-[0.2em]" style={{ color: '#6B6B5E' }}>
                            {t('comune.menu.perChiE')}
                        </div>
                        {porte.map(({ id, titolo, desc, to, icon: Icon, color }) => (
                            <Link key={id} to={to} className="flex items-start gap-3 py-2.5" style={{ textDecoration: 'none' }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                                    <Icon style={{ width: '15px', height: '15px', color }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: NAVY }}>{titolo}</div>
                                    <div style={{ fontSize: '12px', marginTop: '2px', color: '#6B6B5E' }}>{desc}</div>
                                </div>
                            </Link>
                        ))}

                        <Link to="/supporto" className="block py-3" style={linkStyle(isActive('supporto', '/supporto'))}>
                            {t('comune.menu.supporto')}
                        </Link>

                        <div className="flex items-center gap-6 pt-4 mt-2" style={{ borderTop: '1px solid rgba(26, 45, 82, 0.08)' }}>
                            <Link to="/login" style={{ fontSize: '14px', fontWeight: 600, color: NAVY, textDecoration: 'none' }}>
                                {t('comune.menu.accedi')}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default VetrinaHeader;
