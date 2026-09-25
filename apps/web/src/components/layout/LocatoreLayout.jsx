import React from 'react';
import { LayoutDashboard, Home, Bell, Scale, CreditCard, FileText, MessageSquare, ClipboardList } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const NAV = [
    { label: 'Panoramica', path: '/dashboard/locatore', icon: LayoutDashboard },
    { label: 'I miei immobili', path: '/dashboard/locatore/immobili', icon: Home },
    { label: 'Pratiche', path: '/dashboard/locatore/pratiche', icon: ClipboardList },
    { label: 'Segnalazioni', path: '/dashboard/locatore/segnalazioni', icon: Bell },
    { label: 'Contestazioni', path: '/dashboard/locatore/contestazioni', icon: Scale },
    { label: 'Pagamenti', path: '/dashboard/locatore/pagamenti', icon: CreditCard },
    { label: 'Documenti', path: '/dashboard/locatore/documenti', icon: FileText },
    { label: 'Assistenza', path: '/dashboard/locatore/assistenza', icon: MessageSquare },
];

const LocatoreLayout = ({ children, titolo }) => (
    <DashboardLayout area="locatore" nav={NAV} titolo={titolo}>{children}</DashboardLayout>
);

export default LocatoreLayout;
