import React from 'react';
import { Link } from 'react-router-dom';

import { PRODOTTI } from '@/data/catalogo';
import { useT } from '@/lib/testi';
import Ricco from '@/components/testi/Ricco';

const fontHeader = `'Fraunces', 'Source Serif Pro', Georgia, serif`;
const fontBody = `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`;
const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;
const fontSettingsSoft = "'SOFT' 50, 'opsz' 144";

// Le colonne di link. I testi sono in src/testi/catalogo/comune.js (l'admin li
// cambia da Testi); i nomi dei prodotti arrivano dal catalogo dei prodotti.
// Le agenzie non hanno ancora una pagina: la voce porta al supporto.
const useColonne = () => {
    const t = useT();
    return [
        {
            id: 'perChiE',
            titolo: t('comune.piede.perChiE.titolo'),
            link: [
                { id: 'proprietari', l: t('comune.piede.perChiE.proprietari'), to: '/per-proprietari' },
                { id: 'inquilini', l: t('comune.piede.perChiE.inquilini'), to: '/per-inquilini' },
                { id: 'verifica', l: PRODOTTI.P3.nome, to: '/verifica' },
                { id: 'agenzie', l: t('comune.piede.perChiE.agenzie', { nomeProdotto: PRODOTTI.P6.nome }), to: '/supporto' },
            ],
        },
        {
            id: 'risorse',
            titolo: t('comune.piede.risorse.titolo'),
            link: [
                { id: 'comeFunziona', l: t('comune.piede.risorse.comeFunziona'), to: '/come-funziona' },
                { id: 'verificaCertificato', l: t('comune.piede.risorse.verificaCertificato'), to: '/verifica-certificato' },
                { id: 'supporto', l: t('comune.piede.risorse.supporto'), to: '/supporto' },
                { id: 'inizia', l: t('comune.piede.risorse.inizia'), to: '/inizia' },
            ],
        },
        {
            id: 'account',
            titolo: t('comune.piede.account.titolo'),
            link: [
                { id: 'accedi', l: t('comune.piede.account.accedi'), to: '/login' },
                { id: 'registrati', l: t('comune.piede.account.registrati'), to: '/signup' },
            ],
        },
        {
            id: 'legali',
            titolo: t('comune.piede.legali.titolo'),
            link: [
                { id: 'privacy', l: t('comune.piede.legali.privacy'), to: '/privacy' },
                { id: 'termini', l: t('comune.piede.legali.termini'), to: '/termini' },
                { id: 'cookie', l: t('comune.piede.legali.cookie'), to: '/cookie' },
            ],
        },
    ];
};

/**
 * Footer condiviso per tutte le pagine vetrina.
 */
const VetrinaFooter = () => {
    const t = useT();
    const colonne = useColonne();
    return (
        <footer
            className="py-12"
            style={{ background: '#0F1B33', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
        >
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">

                    {/* Logo + descrizione */}
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
                                    {t('comune.piede.marchio')}
                                </div>
                            </div>
                        </Link>
                        <p
                            className="text-xs leading-relaxed max-w-xs"
                            style={{ fontFamily: fontBody, color: 'rgba(255, 255, 255, 0.55)' }}
                        >
                            <Ricco>{t('comune.piede.descrizione')}</Ricco>
                        </p>
                    </div>

                    {/* Colonne link */}
                    {colonne.map((col) => (
                        <div key={col.id}>
                            <p
                                className="text-[10px] uppercase tracking-wider mb-3 font-semibold"
                                style={{ fontFamily: fontMono, color: 'rgba(232, 181, 156, 0.8)' }}
                            >
                                {col.titolo}
                            </p>
                            <ul className="space-y-2">
                                {col.link.map((l) => (
                                    <li key={l.id}>
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
                        {t('comune.piede.copyright')}{' · '}{t('comune.piede.partitaIva')}
                    </p>
                    <div className="flex items-center gap-2">
                        <span
                            className="text-[10px] uppercase tracking-wider"
                            style={{ fontFamily: fontMono, color: 'rgba(255, 255, 255, 0.4)' }}
                        >
                            {t('comune.piede.madeIn')}
                        </span>
                        <span
                            className="text-xs font-semibold"
                            style={{ fontFamily: fontHeader, fontVariationSettings: fontSettingsSoft, color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                            {t('comune.piede.italia')}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default VetrinaFooter;
