import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const ComparisonTable = ({ features }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="p-6 font-semibold text-foreground border-b border-border w-1/3">Funzionalità</th>
            <th className="p-6 font-semibold text-center text-foreground border-b border-border w-1/3">Prodotto 1</th>
            <th className="p-6 font-semibold text-center text-primary border-b border-border w-1/3">Prodotto 2</th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature, index) => (
            <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
              <td className="p-6 text-muted-foreground font-medium">{feature.name}</td>
              <td className="p-6 text-center">
                {feature.p1 ? (
                  <CheckCircle2 className="w-5 h-5 text-secondary mx-auto" />
                ) : (
                  <XCircle className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                )}
              </td>
              <td className="p-6 text-center bg-primary/5">
                {feature.p2 ? (
                  <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                ) : (
                  <XCircle className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;