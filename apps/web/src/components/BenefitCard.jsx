import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const BenefitCard = ({ title, description, icon: Icon = CheckCircle2 }) => {
  return (
    <div className="flex gap-4 p-6 rounded-2xl bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex-shrink-0 mt-1">
        <Icon className="w-6 h-6 text-secondary" />
      </div>
      <div>
        <h4 className="font-semibold text-lg mb-2">{title}</h4>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default BenefitCard;