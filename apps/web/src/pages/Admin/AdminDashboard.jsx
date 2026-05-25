import React from 'react';
import { Helmet } from 'react-helmet';
import StatCard from '@/components/StatCard.jsx';
import DisputeCard from '@/components/DisputeCard.jsx';
import MappaImmobili from '@/components/MappaImmobili.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, Home, Euro, AlertTriangle, UserX,
  FileText, BarChart3, CheckCircle2, XCircle, Clock,
  Activity, UserPlus, MessageSquare,
  FileClock, SendHorizonal, ShoppingBag,
  FileWarning, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── KPI globali piattaforma ───────────────────────────────────────────────────
const globalStats = [
  { label: 'Totale locatori', value: '1.384', icon: Users },
  { label: 'Totale inquilini', value: '2.847', icon: Users },
  { label: 'Immobili gestiti', value: '3.007', icon: Home },
  { label: 'Entrate previste (mese)', value: '€4.8M', icon: Euro },
];

// ─── Salute piattaforma ────────────────────────────────────────────────────────
const healthStats = [
  { label: 'Pagamenti in ritardo', value: '47', icon: Clock },
  { label: 'Contestazioni aperte', value: '12', icon: AlertTriangle },
  { label: 'Inquilini in rosso', value: '23', icon: XCircle },
];

// ─── Stato pagamenti (semaforo) ───────────────────────────────────────────────
const paymentStatusData = [
  { status: 'Verde', count: 3847, percentage: 91.2, icon: CheckCircle2, color: 'text-green-500', bar: 'bg-green-500' },
  { status: 'Giallo', count: 337, percentage: 7.1, icon: Clock, color: 'text-yellow-500', bar: 'bg-yellow-500' },
  { status: 'Rosso', count: 47, percentage: 1.7, icon: XCircle, color: 'text-red-500', bar: 'bg-red-500' },
];

// ─── Scadenze e criticità (2 voci, semplificate) ──────────────────────────────
// Source query (futuro):
//   - Contratti in scadenza:    SELECT count(*) FROM contratti WHERE data_fine BETWEEN now() AND now() + 30 days
//   - Documenti mancanti 3gg:   SELECT count(*) FROM pratiche
//                               WHERE stato = 'documenti_da_integrare'
//                               AND data_ingresso_stato < now() - 3 days
const expiringItems = [
  { icon: FileClock, label: 'Contratti in scadenza (30gg)', value: 6, color: 'text-orange-500' },
  { icon: FileWarning, label: 'Documenti mancanti da oltre 3gg', value: 11, color: 'text-yellow-600' },
];

// ─── Da attenzionare oggi (3 voci) ────────────────────────────────────────────
// Source query (futuro):
//   - Documenti da verificare:        SELECT count(*) FROM pratiche WHERE stato = 'documenti_in_verifica'
//   - Preventivi da inviare:          SELECT count(*) FROM pratiche WHERE stato = 'documenti_verificati'
//   - Assistenza senza risposta:      SELECT count(*) FROM tickets WHERE ultimo_mittente_ruolo != 'admin'
const urgentItems = [
  { icon: FileText, label: 'Documenti da verificare', value: 8, color: 'text-orange-500' },
  { icon: SendHorizonal, label: 'Preventivi da inviare', value: 3, color: 'text-blue-500' },
  { icon: MessageSquare, label: 'Richieste assistenza senza risposta', value: 4, color: 'text-yellow-600' },
];

// ─── Attività recenti (4 tipi di evento, mostro ultime 5) ─────────────────────
// Source query (futuro):
//   SELECT * FROM eventi
//   WHERE tipo IN ('onboarding_completato','nuovo_cliente_p1','nuovo_cliente_p2',
//                  'nuovo_cliente_p3','nuovo_cliente_p4','contestazione_aperta','ticket_aperto')
//   ORDER BY created_at DESC LIMIT 5
const recentActivities = [
  {
    tipo: 'onboarding_completato',
    icon: UserPlus,
    label: 'Nuovo onboarding',
    detail: 'Marco Bianchi — pratica #1284',
    time: '10 min fa',
    color: 'text-blue-500',
    link: '/dashboard/admin/clienti/1284',
  },
  {
    tipo: 'nuovo_cliente_p2',
    icon: ShoppingBag,
    label: 'Nuovo cliente CRIA Completo',
    detail: 'Giulia Neri — P2',
    time: '28 min fa',
    color: 'text-purple-500',
    link: '/dashboard/admin/clienti/892',
  },
  {
    tipo: 'contestazione_aperta',
    icon: AlertTriangle,
    label: 'Nuova contestazione',
    detail: 'Via Roma 15, Roma',
    time: '1h fa',
    color: 'text-orange-500',
    link: '/dashboard/admin/contestazioni/12',
  },
  {
    tipo: 'ticket_aperto',
    icon: MessageSquare,
    label: 'Nuovo ticket',
    detail: 'Luca Ferrari — assistenza',
    time: '2h fa',
    color: 'text-teal-500',
    link: '/dashboard/admin/assistenza',
  },
  {
    tipo: 'nuovo_cliente_p3',
    icon: ShoppingBag,
    label: 'Nuovo cliente CRIA Verifica',
    detail: 'Sara Conti — P3',
    time: '3h fa',
    color: 'text-amber-500',
    link: '/dashboard/admin/clienti/445',
  },
];

// ─── Contestazioni recenti ────────────────────────────────────────────────────
const recentDisputes = [
  { id: 1, property: 'Via Garibaldi 56, Torino', reason: 'Mancato pagamento segnalato', status: 'aperta', openedDate: '28/03/2026', month: 'Marzo 2026', description: 'locatore segnala mancato pagamento, inquilino contesta con ricevuta' },
  { id: 2, property: 'Corso Venezia 18, Milano', reason: 'Ritardo pagamento', status: 'in_revisione', openedDate: '25/03/2026', month: 'Marzo 2026', description: 'Pagamento effettuato con 8 giorni di ritardo' },
  { id: 3, property: 'Via Roma 15, Roma', reason: 'Contestazione importo', status: 'risolta', openedDate: '20/03/2026', month: 'Febbraio 2026', description: 'Risolto: errore di calcolo nel canone mensile' },
  { id: 4, property: 'Viale Europa 3, Napoli', reason: 'Mancato pagamento', status: 'aperta', openedDate: '18/03/2026', month: 'Marzo 2026', description: 'Inquilino non ha effettuato il pagamento di marzo' },
];

// ─── Inquilini problematici ───────────────────────────────────────────────────
const problematicTenants = [
  { address: 'Via Garibaldi 56, Torino', tenant: 'Chiara Lombardi', delayCount: 4, avgDelay: '12.3 giorni' },
  { address: 'Piazza Duomo 8, Milano', tenant: 'Roberto Fabbri', delayCount: 3, avgDelay: '9.7 giorni' },
  { address: 'Via Nazionale 42, Roma', tenant: 'Alessia Moretti', delayCount: 3, avgDelay: '8.2 giorni' },
];

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPALE
// ═════════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const navigate = useNavigate();
  const totalOpenDisputes = recentDisputes.filter(d => d.status === 'aperta' || d.status === 'in_revisione').length;

  const handleDisputeAction = (dispute) => {
    navigate(`/dashboard/admin/contestazioni/${dispute.id}`);
  };

  return (
    <>
      <Helmet>
        <title>Dashboard Amministratore - CRIA</title>
      </Helmet>

      <div className="space-y-8">

        {/* Intestazione */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard Amministratore</h1>
          <p className="text-muted-foreground">Panoramica completa della piattaforma CRIA</p>
        </div>

        {/* Panoramica globale */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {globalStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
          </div>
        </div>

        {/* Mappa immobili */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Immobili gestiti</h2>
          <Card>
            <CardContent className="p-2">
              <MappaImmobili />
            </CardContent>
          </Card>
        </div>

        {/* Salute della piattaforma */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Salute della piattaforma</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {healthStats.map((stat) => <StatCard key={stat.label} {...stat} />)}
          </div>
        </div>

        {/* Griglia 2x2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Stato pagamenti */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Stato pagamenti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentStatusData.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span className="font-medium">{item.status}</span>
                      </div>
                      <span className="text-muted-foreground tabular-nums">
                        {item.count.toLocaleString()} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`h-2 rounded-full ${item.bar}`} style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Scadenze e criticità */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileClock className="w-5 h-5" />
                Scadenze e criticità
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {expiringItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${item.color}`}>{item.value}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Attività recenti */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Attività recenti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentActivities.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => navigate(item.link)}
                    className="w-full flex items-start gap-3 py-2.5 border-b border-border last:border-0 text-left hover:bg-muted/30 -mx-2 px-2 rounded-md transition-colors"
                  >
                    <div className="mt-0.5 p-1.5 bg-muted rounded-md flex-shrink-0">
                      <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 pt-0.5">{item.time}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Da attenzionare oggi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Da attenzionare oggi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {urgentItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${item.color}`}>{item.value}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

        </div>

        {/* Contestazioni recenti */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Contestazioni recenti
              </CardTitle>
              <Badge variant="destructive" className="tabular-nums">
                {totalOpenDisputes} aperte
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentDisputes.map((dispute) => (
                <DisputeCard key={dispute.id} dispute={dispute} onAction={handleDisputeAction} />
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/dashboard/admin/contestazioni')}
            >
              Visualizza tutte le contestazioni
            </Button>
          </CardContent>
        </Card>

        {/* Inquilini problematici */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5" />
              Inquilini problematici
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {problematicTenants.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{item.tenant}</p>
                  <p className="text-sm text-muted-foreground">Immobile: {item.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground tabular-nums">{item.delayCount} ritardi</p>
                  <p className="text-xs text-muted-foreground tabular-nums">Media: {item.avgDelay}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </>
  );
};

export default AdminDashboard;