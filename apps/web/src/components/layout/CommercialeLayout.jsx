import React from 'react';
import { LayoutDashboard, Users, FileText, Percent, MessageSquare } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const NAV = [
    { label: 'Panoramica', path: '/dashboard/commerciale', icon: LayoutDashboard },
    { label: 'I miei clienti', path: '/dashboard/commerciale/clienti', icon: Users },
    { label: 'Contratti', path: '/dashboard/commerciale/contratti', icon: FileText },
    { label: 'Provvigioni', path: '/dashboard/commerciale/provvigioni', icon: Percent },
    { label: 'Assistenza', path: '/dashboard/commerciale/assistenza', icon: MessageSquare },
];

const CommercialeLayout = ({ children, titolo }) => (
    <DashboardLayout area="commerciale" nav={NAV} titolo={titolo}>{children}</DashboardLayout>
);

export default CommercialeLayout;
