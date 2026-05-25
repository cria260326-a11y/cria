import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const TerminiPage = () => {
    return (
        <>
            <Helmet><title>Termini di servizio - CRIA</title></Helmet>
            <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7] p-8">
                <div className="text-center max-w-md">
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider mb-6"
                        style={{ background: 'rgba(26, 45, 82, 0.06)', color: '#1A2D52' }}>
                        Pagina in costruzione
                    </div>
                    <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Fraunces, serif', color: '#1A2D52' }}>
                        Termini di servizio
                    </h1>
                    <p className="text-base mb-8" style={{ fontFamily: 'Inter, sans-serif', color: '#6B6B5E' }}>
                        Questa pagina sarà costruita prossimamente con lo stesso stile della Home.
                    </p>
                    <Link to="/" className="inline-block px-6 py-3 rounded-full text-sm font-semibold"
                        style={{ background: '#1A2D52', color: '#FAFAF7', fontFamily: 'Inter, sans-serif' }}>
                        ← Torna alla home
                    </Link>
                </div>
            </div>
        </>
    );
};

export default TerminiPage;