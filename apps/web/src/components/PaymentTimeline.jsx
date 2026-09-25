import React from 'react';
import { CheckCircle2, XCircle, Clock, MinusCircle } from 'lucide-react';
import { esitoMese, ESITI_MESE } from '@/lib/semaforo';
import { meseBreve, nomeMese, fmtData } from '@/lib/formato';

// Con `mesi` (dati demo delle aree) mostra gli ultimi 12 mesi con l'esito
// calcolato da lib/semaforo.js. Con `payments` resta il formato vecchio,
// usato ancora dalle pagine interne che non sono state riviste.
const ICONA_ESITO = {
  puntuale: CheckCircle2,
  ritardo: CheckCircle2,
  grave: CheckCircle2,
  insoluto: XCircle,
  non_rilevato: MinusCircle,
  in_sospeso: Clock,
};

const dettaglioMese = (m) => {
  const e = esitoMese(m);
  if (m.stato === 'pagato') return `Pagato il ${fmtData(m.pagatoIl)}`;
  if (e === 'non_rilevato') return 'Nessuna segnalazione entro l’11: non rilevato, pesa zero';
  if (e === 'insoluto') return 'Segnalato non pagato';
  if (m.stato === 'contestato') return 'Segnalato non pagato · contestazione in corso';
  return `Segnalato non pagato · contestabile fino al ${fmtData(m.scadenzaContestazione)}`;
};

const TimelineMesi = ({ mesi }) => {
  const ultimi = [...mesi].sort((a, b) => a.mese.localeCompare(b.mese)).slice(-12);
  const presenti = new Set(ultimi.map(esitoMese));
  return (
    <div className="bg-muted rounded-lg p-4">
      <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
        {ultimi.map(m => {
          const e = esitoMese(m);
          const Icona = ICONA_ESITO[e];
          return (
            <div key={m.mese} className="flex flex-col items-center gap-1" title={`${nomeMese(m.mese)} · ${dettaglioMese(m)}`}>
              <div className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">{meseBreve(m.mese)}</div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background">
                <Icona className="w-4 h-4" style={{ color: ESITI_MESE[e].colore }} />
              </div>
              <div className="text-[11px] text-muted-foreground tabular-nums">
                {m.stato === 'pagato' ? `il ${m.giorno}` : e === 'non_rilevato' ? 'n.r.' : e === 'insoluto' ? 'no' : '…'}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 pt-4 border-t border-border text-xs">
        {Object.entries(ESITI_MESE).filter(([k]) => presenti.has(k)).map(([k, v]) => {
          const Icona = ICONA_ESITO[k];
          return (
            <span key={k} className="flex items-center gap-1 text-muted-foreground">
              <Icona className="w-3 h-3" style={{ color: v.colore }} /> {v.etichetta}{v.pesa ? '' : ' · non conta nel semaforo'}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const PaymentTimeline = ({ payments, mesi }) => {
  if (mesi) return <TimelineMesi mesi={mesi} />;

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