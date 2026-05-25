
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

const ReportDownloadButton = ({ reportType = 'dettagliato', className = '' }) => {
  const handleDownload = () => {
    toast.success('Download del report avviato');
  };

  return (
    <Button 
      onClick={handleDownload}
      variant="outline"
      className={`gap-2 ${className}`}
    >
      <Download className="w-4 h-4" />
      Scarica report {reportType}
    </Button>
  );
};

export default ReportDownloadButton;
