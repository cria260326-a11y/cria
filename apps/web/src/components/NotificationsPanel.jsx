
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';

const NotificationsPanel = ({ notifications }) => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [contestText, setContestText] = useState('');

  const handleContest = (notification) => {
    setSelectedNotification(notification);
  };

  const submitContest = () => {
    toast.success('Contestazione inviata');
    setSelectedNotification(null);
    setContestText('');
  };

  if (!notifications || notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifiche</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nessuna notifica al momento
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Notifiche e segnalazioni
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((notification) => (
          <div key={notification.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-foreground mb-1">{notification.property}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Data segnalazione: {notification.date}
                </p>
              </div>
              {notification.daysLeft > 0 && (
                <Badge variant="outline">
                  {notification.daysLeft} giorni rimasti
                </Badge>
              )}
            </div>

            {notification.daysLeft > 0 && !selectedNotification && (
              <Button 
                onClick={() => handleContest(notification)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Contesta segnalazione
              </Button>
            )}

            {selectedNotification?.id === notification.id && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div>
                  <Label htmlFor={`receipt-${notification.id}`}>Carica ricevuta pagamento</Label>
                  <Input 
                    id={`receipt-${notification.id}`}
                    type="file" 
                    accept="image/*,.pdf"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor={`message-${notification.id}`}>Messaggio per amministratore</Label>
                  <Textarea
                    id={`message-${notification.id}`}
                    placeholder="Descrivi la tua contestazione..."
                    value={contestText}
                    onChange={(e) => setContestText(e.target.value)}
                    className="mt-1 text-foreground"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={submitContest} className="flex-1">
                    Invia contestazione
                  </Button>
                  <Button 
                    onClick={() => setSelectedNotification(null)}
                    variant="outline"
                  >
                    Annulla
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NotificationsPanel;
