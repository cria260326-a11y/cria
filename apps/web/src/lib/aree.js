import { Home, KeyRound, Search, Briefcase, Scale, Shield } from 'lucide-react';

// ═════════════════════════════════════════════════════════════════════════════
// AREE DELLA PIATTAFORMA
// Un'area è il "cappello" con cui una persona guarda CRIA. Le aree del
// proprietario e dell'inquilino restano separate: nessuna schermata mostra due
// cappelli insieme (decisione del 14 settembre 2026). Si passa dall'una
// all'altra con il selettore di contesto.
// ═════════════════════════════════════════════════════════════════════════════

export const AREE = {
    locatore: {
        etichetta: 'Proprietario',
        cappello: 'Come proprietario',
        home: '/dashboard/locatore',
        profilo: '/profilo',
        icona: Home,
    },
    inquilino: {
        etichetta: 'Inquilino',
        cappello: 'Come inquilino',
        home: '/dashboard/inquilino',
        profilo: '/profilo',
        icona: KeyRound,
    },
    cliente: {
        etichetta: 'Cliente',
        cappello: 'Le mie verifiche',
        home: '/dashboard/cliente',
        profilo: '/profilo',
        icona: Search,
    },
    commerciale: {
        etichetta: 'Commerciale',
        cappello: 'Area commerciale',
        home: '/dashboard/commerciale',
        profilo: '/dashboard/commerciale/profilo',
        icona: Briefcase,
    },
    avvocato: {
        etichetta: 'Avvocato',
        cappello: 'Area legale',
        home: '/dashboard/avvocato',
        profilo: '/dashboard/avvocato/profilo',
        icona: Scale,
    },
    admin: {
        etichetta: 'Amministrazione',
        cappello: 'Area interna',
        home: '/dashboard/admin',
        profilo: '/dashboard/admin/profilo',
        icona: Shield,
    },
};

// Ordine in cui le aree compaiono nel selettore.
export const ORDINE_AREE = ['locatore', 'inquilino', 'cliente', 'commerciale', 'avvocato', 'admin'];

// Il verso della posizione decide l'area. Coobbligato, garante e delegato non
// hanno ancora un'area progettata: finché non c'è, non compaiono nel selettore.
export const AREA_DEL_VERSO = {
    locatore: 'locatore',
    conduttore: 'inquilino',
};

// Le aree di una persona: quelle che vengono dalle posizioni sui contratti,
// più quelle a cui accede per altre ragioni (cliente di una verifica, ruolo interno).
export const contestiDisponibili = (persona) => {
    if (!persona) return [];
    const perArea = {};
    for (const posizione of persona.posizioni || []) {
        const area = AREA_DEL_VERSO[posizione.verso];
        if (!area) continue;
        if (!perArea[area]) perArea[area] = [];
        perArea[area].push(posizione);
    }
    for (const area of persona.aree || []) {
        if (AREE[area] && !perArea[area]) perArea[area] = [];
    }
    return ORDINE_AREE
        .filter(area => perArea[area])
        .map(area => ({ area, ...AREE[area], posizioni: perArea[area] }));
};

export const nomeVisualizzato = (persona) => {
    if (!persona) return '';
    return persona.tipo === 'giuridica' ? persona.ragioneSociale : `${persona.nome} ${persona.cognome}`;
};

export const iniziali = (persona) => {
    if (!persona) return '';
    if (persona.tipo === 'giuridica') return persona.ragioneSociale.slice(0, 2).toUpperCase();
    return `${persona.nome[0]}${persona.cognome[0]}`.toUpperCase();
};

// Verificata = email confermata e identità controllata da una persona.
export const isVerificata = (persona) =>
    !!persona && persona.emailVerificata && persona.statoIdentita === 'verificato';

// "Via Verdi 3, Milano" → "Via Verdi 3"
export const via = (immobile) => immobile.split(',')[0];
