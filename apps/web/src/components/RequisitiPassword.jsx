import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const REQUISITI_PASSWORD = [
    { key: 'lunghezza', label: 'Almeno 8 caratteri', test: (p) => p.length >= 8 },
    { key: 'maiuscola', label: 'Una lettera maiuscola', test: (p) => /[A-Z]/.test(p) },
    { key: 'numero', label: 'Un numero', test: (p) => /[0-9]/.test(p) },
];

export const passwordValida = (password) => REQUISITI_PASSWORD.every(r => r.test(password));

const RequisitiPassword = ({ password }) => (
    <div className="space-y-1 pt-1">
        {REQUISITI_PASSWORD.map(r => {
            const ok = r.test(password);
            return (
                <p key={r.key} className={`text-xs flex items-center gap-1.5 ${ok ? 'text-green-600' : 'text-[#6B6B5E]'}`}>
                    <CheckCircle2 className={`w-3 h-3 ${ok ? '' : 'opacity-30'}`} /> {r.label}
                </p>
            );
        })}
    </div>
);

export default RequisitiPassword;
