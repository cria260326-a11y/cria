import React from 'react';

// Riquadro per ciò che esiste solo nei mockup — profili demo, simulazioni di
// esiti. Tutto quello che sta qui dentro sparisce nella fase 4.
const NotaMockup = ({ children, className = '' }) => (
    <div className={`rounded-xl border border-dashed border-amber-300 bg-amber-50/70 p-4 text-sm text-amber-950 ${className}`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 mb-2">Solo nei mockup</p>
        {children}
    </div>
);

export default NotaMockup;
