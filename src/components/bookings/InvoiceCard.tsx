import React from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Invoice } from '@/store/slices/bookingsSlice';
import { downloadInvoice } from '@/lib/invoiceGenerator';

interface InvoiceCardProps {
  invoice: Invoice;
  customerName: string;
  equipmentName: string;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice, customerName, equipmentName }) => {
  const handleDownload = () => {
    downloadInvoice(invoice, customerName, equipmentName);
  };

  return (
    <Card className="border-success/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-success" />
            <CardTitle className="text-lg">Invoice Generated</CardTitle>
          </div>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Paid
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Reference Number</span>
            <span className="font-mono font-semibold">{invoice.referenceNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Generated</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(invoice.generatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          {invoice.items.map((item, index) => (
            <div key={index} className="text-sm">
              <div className="flex justify-between">
                <span>{item.description}</span>
                <span className="font-medium">₹{item.amount.toFixed(2)}</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between text-sm text-muted-foreground pt-2">
            <span>Tax (18% GST)</span>
            <span>₹{invoice.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span className="text-success">₹{invoice.total.toFixed(2)}</span>
          </div>
        </div>

        <Button 
          onClick={handleDownload} 
          className="w-full"
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Invoice
        </Button>
      </CardContent>
    </Card>
  );
};
