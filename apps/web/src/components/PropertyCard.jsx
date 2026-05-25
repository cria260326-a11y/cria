
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, MapPin, User } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge.jsx';
import PaymentTimeline from '@/components/PaymentTimeline.jsx';

const PropertyCard = ({
  property,
  showTenant = false,
  showLandlord = false,
  onAction,
  actionLabel,
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{property.address}</CardTitle>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{property.city}</span>
              </div>
              {showTenant && property.tenant && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{property.tenant}</span>
                </div>
              )}
              {showLandlord && property.landlord && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{property.landlord}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={property.status} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Canone mensile</p>
              <p className="font-semibold font-variant-numeric-tabular">€{property.monthlyRent}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Durata prodotto</p>
              <p className="font-semibold">{property.contractDuration} mesi</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Inizio prodotto</p>
              <p className="font-semibold">{property.startDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Fine prodotto</p>
              <p className="font-semibold">{property.endDate}</p>
            </div>
          </div>

          {property.payments && (
            <div>
              <p className="text-sm font-medium mb-3">Cronologia pagamenti</p>
              <PaymentTimeline payments={property.payments} />
            </div>
          )}

          {children}

          {onAction && actionLabel && (
            <Button onClick={() => onAction(property)} className="w-full">
              {actionLabel}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default PropertyCard;
