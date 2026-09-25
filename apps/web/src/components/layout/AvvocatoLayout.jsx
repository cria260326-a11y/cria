import React from 'react';
import { LayoutDashboard, ClipboardList, Users, Calendar, Euro } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const NAV = [
    { label: 'Panoramica', path: '/dashboard/avvocato', icon: LayoutDashboard },
    { label: 'Coda lavoro', path: '/dashboard/avvocato/coda', icon: ClipboardList },
    { label: 'Clienti assegnati', path: '/dashboard/avvocato/clienti', icon: Users },
    { label: 'Scadenze', path: '/dashboard/avvocato/scadenze', icon: Calendar },
    { label: 'Compensi', path: '/dashboard/avvocato/compensi', icon: Euro },
];

const AvvocatoLayout = ({ children, titolo }) => (
    <DashboardLayout area="avvocato" nav={NAV} titolo={titolo}>{children}</DashboardLayout>
);

export default AvvocatoLayout;
