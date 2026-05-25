import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const DisputeCard = ({ dispute, onAction }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'aperta':
        return {
          label: 'Aperta',
          icon: AlertCircle,
          className: 'bg-[hsl(var(--status-yellow))] text-white'
        };
      case 'in_revisione':
        return {
          label: 'In revisione',
          icon: Clock,
          className: 'bg-blue-500 text-white'
        };
      case 'risolta':
        return {
          label: 'Risolta',
          icon: CheckCircle2,
          className: 'bg-[hsl(var(--status-green))] text-white'
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: 'bg-muted text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig(dispute.status);
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{dispute.property}</CardTitle>
          <Badge className={config.className}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Motivo</p>
          <p className="text-foreground">{dispute.reason}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Data apertura</p>
            <p className="font-medium">{dispute.openedDate}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Mese riferimento</p>
            <p className="font-medium">{dispute.month}</p>
          </div>
        </div>

        {dispute.description && (
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">Descrizione</p>
            <p className="text-foreground">{dispute.description}</p>
          </div>
        )}

        {onAction && dispute.status === 'aperta' && (
          <Button 
            onClick={() => onAction(dispute)} 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            Gestisci contestazione
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DisputeCard;