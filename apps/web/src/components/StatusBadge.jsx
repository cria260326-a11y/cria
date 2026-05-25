
import React from 'react';
import { Badge } from '@/components/ui/badge';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'verde':
        return {
          label: 'In regola',
          className: 'bg-[hsl(var(--status-green))] text-white hover:bg-[hsl(var(--status-green))]/90'
        };
      case 'giallo':
        return {
          label: 'Attenzione',
          className: 'bg-[hsl(var(--status-yellow))] text-white hover:bg-[hsl(var(--status-yellow))]/90'
        };
      case 'rosso':
        return {
          label: 'In ritardo',
          className: 'bg-[hsl(var(--status-red))] text-white hover:bg-[hsl(var(--status-red))]/90'
        };
      default:
        return {
          label: 'Sconosciuto',
          className: 'bg-muted text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
