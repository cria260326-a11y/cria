import React from 'react';
import { LayoutDashboard, FileText, CreditCard, Bell, Scale, MessageSquare, Gauge, BadgeCheck } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const NAV = [
    { label: 'Panoramica', path: '/dashboard/inquilino', icon: LayoutDashboard },
    { label: 'Il mio semaforo', path: '/dashboard/inquilino/semaforo', icon: Gauge },
    { label: 'Il mio contratto', path: '/dashboard/inquilino/contratto', icon: FileText },
    { label: 'I miei pagamenti', path: '/dashboard/inquilino/pagamenti', icon: CreditCard },
    { label: 'Segnalazioni', path: '/dashboard/inquilino/segnalazioni', icon: Bell },
    { label: 'Contestazioni', path: '/dashboard/inquilino/contestazioni', icon: Scale },
    { label: 'Il mio certificato', path: '/dashboard/inquilino/certificato', icon: BadgeCheck },
    { label: 'Assistenza', path: '/dashboard/inquilino/assistenza', icon: MessageSquare },
];

const InquilinoLayout = ({ children, titolo }) => (
    <DashboardLayout area="inquilino" nav={NAV} titolo={titolo}>{children}</DashboardLayout>
);

export default InquilinoLayout;
