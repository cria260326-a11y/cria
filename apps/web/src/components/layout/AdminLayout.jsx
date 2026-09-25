import React from 'react';
import {
    LayoutDashboard, CalendarClock, Users, GitMerge, Home, ClipboardList, Bell, Scale, CreditCard,
    ArrowLeftRight, ShieldAlert, HandCoins, Umbrella, Banknote, Percent, Calculator, Mail, Smartphone,
    MessageSquare, HelpCircle, Package, ShoppingCart, UserCog, Settings, Type, Gauge, ListChecks,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FUNZIONI } from '@/data/operatori';
import { useOperatoreAttivo } from '@/lib/operatoreAttivo';

// Per funzione operativa (lotto 5): ogni gruppo è il lavoro di una funzione.
// Chi vede quali voci lo decidono ruolo e assegnazione, nel lotto 6; per ora
// ognuno vede tutte le voci e le pagine mostrano quello che spetta alla sua
// funzione. La funzione è quella dell'account con cui si è entrati.
const NAV_GROUPS = [
    {
        label: 'Oggi',
        items: [
            // La panoramica dell'azienda, per ora, la apre l'admin.
            { label: 'Panoramica', path: '/dashboard/admin', icon: LayoutDashboard, soloAdmin: true },
            { label: 'Il lavoro di oggi', path: '/dashboard/admin/lavoro', icon: ListChecks },
            { label: 'Scadenze', path: '/dashboard/admin/scadenze', icon: CalendarClock },
        ],
    },
    {
        label: 'Anagrafica',
        items: [
            { label: 'Utenti', path: '/dashboard/admin/clienti', icon: Users },
            { label: 'Revisione anagrafiche', path: '/dashboard/admin/anagrafiche', icon: GitMerge },
            { label: 'Contratti e immobili', path: '/dashboard/admin/contratti', icon: Home, anche: ['/dashboard/admin/immobili'] },
        ],
    },
    {
        label: 'Istruttoria',
        items: [
            { label: 'Pratiche da deliberare', path: '/dashboard/admin/onboarding', icon: ClipboardList },
        ],
    },
    {
        label: 'Ciclo mensile',
        items: [
            { label: 'Segnalazioni', path: '/dashboard/admin/segnalazioni', icon: Bell },
            { label: 'Contestazioni', path: '/dashboard/admin/contestazioni', icon: Scale },
            { label: 'Pagamenti', path: '/dashboard/admin/pagamenti', icon: CreditCard },
            { label: 'Riconciliazione', path: '/dashboard/admin/riconciliazione', icon: ArrowLeftRight },
        ],
    },
    {
        label: 'Garanzia',
        items: [
            { label: 'Morosità', path: '/dashboard/admin/morosita', icon: ShieldAlert },
            { label: 'Indennizzi', path: '/dashboard/admin/indennizzi', icon: HandCoins },
            { label: 'Riassicurazione', path: '/dashboard/admin/riassicurazione', icon: Umbrella },
        ],
    },
    {
        label: 'Tesoreria e conti',
        items: [
            { label: 'Bonifici in uscita', path: '/dashboard/admin/bonifici', icon: Banknote },
            { label: 'Provvigioni', path: '/dashboard/admin/provvigioni', icon: Percent },
            { label: 'Contabilità', path: '/dashboard/admin/contabilita', icon: Calculator },
        ],
    },
    {
        label: 'Comunicazioni',
        items: [
            { label: 'Email', path: '/dashboard/admin/email', icon: Mail },
            { label: 'Notifiche e SMS', path: '/dashboard/admin/notifiche', icon: Smartphone },
            { label: 'Assistenza', path: '/dashboard/admin/assistenza', icon: MessageSquare },
        ],
    },
    {
        label: 'Sito pubblico',
        items: [
            { label: 'Testi', path: '/dashboard/admin/testi', icon: Type },
            { label: 'FAQ', path: '/dashboard/admin/faq', icon: HelpCircle },
        ],
    },
    {
        label: 'Prodotto e direzione',
        items: [
            { label: 'Prodotti', path: '/dashboard/admin/prodotti', icon: Package },
            { label: 'Vendite', path: '/dashboard/admin/vendite', icon: ShoppingCart },
        ],
    },
    {
        label: 'Persone e sistema',
        items: [
            { label: 'Collaboratori', path: '/dashboard/admin/collaboratori', icon: UserCog },
            { label: 'Impostazioni', path: '/dashboard/admin/impostazioni', icon: Settings },
        ],
    },
];

// In testata, con che funzione si sta lavorando.
const FunzioneInTestata = ({ operatore }) => (
    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
        <Gauge className="w-3.5 h-3.5 text-muted-foreground" /> {FUNZIONI[operatore.funzione]?.etichetta}
    </span>
);

// Le voci che non sono di chi guarda non compaiono nel menu.
const menuPer = (operatore) => NAV_GROUPS
    .map(g => ({ ...g, items: g.items.filter(v => !v.soloAdmin || operatore?.funzione === 'admin') }))
    .filter(g => g.items.length > 0);

const AdminLayout = ({ children, titolo }) => {
    const { operatore } = useOperatoreAttivo();
    return (
        <DashboardLayout area="admin" navGroups={menuPer(operatore)} titolo={titolo} azioniTestata={operatore && <FunzioneInTestata operatore={operatore} />}>
            {operatore ? children : (
                <p className="text-sm text-muted-foreground">Questo account non ha una funzione interna: chiedi all’admin di assegnartela.</p>
            )}
        </DashboardLayout>
    );
};

export default AdminLayout;
