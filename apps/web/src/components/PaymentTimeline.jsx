import React from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

const PaymentTimeline = ({ payments }) => {
  const months = [
    'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
    'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
  ];

  const getPaymentStatus = (payment) => {
    if (!payment) return 'pending';
    if (payment.paid) {
      if (payment.day <= 5) return 'verde';
      if (payment.day <= 10) return 'giallo';
      return 'rosso';
    }
    return 'pending';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verde':
        return <CheckCircle2 className="w-4 h-4 text-[hsl(var(--status-green))]" />;
      case 'giallo':
        return <CheckCircle2 className="w-4 h-4 text-[hsl(var(--status-yellow))]" />;
      case 'rosso':
        return <XCircle className="w-4 h-4 text-[hsl(var(--status-red))]" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="bg-muted rounded-lg p-4">
      <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
        {months.map((month, index) => {
          const payment = payments?.[index];
          const status = getPaymentStatus(payment);
          
          return (
            <div key={month} className="flex flex-col items-center gap-1">
              <div className="text-xs font-medium text-muted-foreground">{month}</div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background">
                {getStatusIcon(status)}
              </div>
              {payment?.paid && (
                <div className="text-xs text-muted-foreground font-variant-numeric-tabular">
                  {payment.day}/12
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border text-xs">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-[hsl(var(--status-green))]" />
          <span className="text-muted-foreground">Entro giorno 5</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-[hsl(var(--status-yellow))]" />
          <span className="text-muted-foreground">Entro giorno 10</span>
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="w-3 h-3 text-[hsl(var(--status-red))]" />
          <span className="text-muted-foreground">Dopo giorno 10</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">In attesa</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentTimeline;