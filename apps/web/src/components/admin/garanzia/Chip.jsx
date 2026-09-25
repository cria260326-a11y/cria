import React from 'react';

// Il bollino di stato delle schermate della garanzia: testo sempre, colore in più.
const Chip = ({ stato, children, className = '' }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stato?.classe || 'bg-gray-100 text-gray-700'} ${className}`}>
        {children ?? stato?.etichetta}
    </span>
);

export default Chip;
