import React from 'react';
import { Link } from 'react-router-dom';

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

/**
 * Footer condiviso per tutte le pagine vetrina.
 */
const VetrinaFooter = () => {
    const colonne = [
        {
            titolo: 'Prodotti',
            link: [
                { l: 'Per locatori', to: '/per-locatori' },
                { l: 'Per inquilini', to: '/per-inquilini' },
                { l: 'CRIA Verifica', to: '/verifica' },
            ],
        },
        {
            titolo: 'Risorse',
            link: [
                { l: 'Come funziona', to: '/come-funziona' },
                { l: 'FAQ e contatti', to: '/supporto' },
                { l: 'Inizia ora', to: '/inizia' },
            ],
        },
        {
            titolo: 'Account',
            link: [
                { l: 'Accedi', to: '/login' },
                { l: 'Registrati', to: '/signup' },
            ],
        },
        {
            titolo: 'Legali',
            link: [
                { l: 'Privacy', to: '/privacy' },
                { l: 'Termini', to: '/termini' },
                { l: 'Cookie', to: '/cookie' },
            ],
        },
    ];

    return (
        <footer
            className="py-12"
            style={{ background: '#0F1B33', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
        >
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">

                    {/* Logo + descrizione + social */}
                    <div className="col-span-2 md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center"
                                style={{ background: '#1A2D52', border: '1px solid rgba(255,255,255,0.1)' }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                                    <path d="M12 3 L4 9 L4 20 L20 20 L20 9 Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
                                    <circle cx="12" cy="11" r="1.3" fill="#22C55E" />
                                    <circle cx="12" cy="14.5" r="1.3" fill="#F59E0B" />
                                    <circle cx="12" cy="18" r="1.3" fill="#EF4444" />
                                </svg>
                            </div>
                            <div>
                                <div
                                    className="text-lg font-bold tracking-tight"
                                    style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: '#FFFFFF' }}
                                >
                                    CRIA
                                </div>
                                <div
                                    className="text-[8px] uppercase tracking-[0.18em] mt-0.5"
                                    style={{ color: 'rgba(232, 181, 156, 0.7)', fontFamily: fontMono }}
                                >
                                    Centrale Rischi Italia Affitti
                                </div>
                            </div>
                        </Link>
                        <p
                            className="text-xs leading-relaxed mb-4 max-w-xs"
                            style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.55)' }}
                        >
                            La prima centrale rischi italiana dedicata agli affitti.
                        </p>
                        <div className="flex gap-2">
                            {['LK', 'IG', 'X'].map((s) => (
                                <a
                                    key={s}
                                    href="#"
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors hover:bg-[#FFFFFF] hover:text-[#1A2D52]"
                                    style={{
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        fontFamily: fontMono,
                                    }}
                                >
                                    {s}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Colonne link */}
                    {colonne.map((col) => (
                        <div key={col.titolo}>
                            <p
                                className="text-[10px] uppercase tracking-wider mb-3 font-semibold"
                                style={{ fontFamily: fontMono, color: 'rgba(232, 181, 156, 0.8)' }}
                            >
                                {col.titolo}
                            </p>
                            <ul className="space-y-2">
                                {col.link.map((l) => (
                                    <li key={l.l}>
                                        <Link
                                            to={l.to}
                                            className="text-xs transition-colors hover:text-[#FFFFFF]"
                                            style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.6)' }}
                                        >
                                            {l.l}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div
                    className="pt-6 flex flex-col sm:flex-row justify-between gap-3 items-center"
                    style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
                >
                    <p
                        className="text-[10px]"
                        style={{ fontFamily: fontMono, color: 'rgba(255, 255, 255, 0.4)' }}
                    >
                        © 2026 CRIA · Tutti i diritti riservati · P.IVA 12345678901
                    </p>
                    <div className="flex items-center gap-2">
                        <span
                            className="text-[10px] uppercase tracking-wider"
                            style={{ fontFamily: fontMono, color: 'rgba(255, 255, 255, 0.4)' }}
                        >
                            Made in
                        </span>
                        <span
                            className="text-xs font-semibold"
                            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                            Italia 🇮🇹
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default VetrinaFooter;