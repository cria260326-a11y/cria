import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const StatCard = ({ label, value, icon: Icon, trend, className = '' }) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold text-foreground font-variant-numeric-tabular">{value}</p>
            {trend && (
              <p className={`text-xs mt-2 ${trend.positive ? 'text-secondary' : 'text-destructive'}`}>
                {trend.value}
              </p>
            )}
          </div>
          {Icon && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;