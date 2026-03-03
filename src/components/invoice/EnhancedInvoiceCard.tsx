import React from 'react';
import { FileText, Download, Calendar, Package, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EnhancedInvoice, generateEnhancedInvoicePdf } from '@/lib/enhancedInvoiceGenerator';

interface EnhancedInvoiceCardProps {
  invoice: EnhancedInvoice;
}

export const EnhancedInvoiceCard: React.FC<EnhancedInvoiceCardProps> = ({ invoice }) => {
  const handleDownloadPdf = () => {
    generateEnhancedInvoicePdf(invoice);
  };

  return (
    <Card className="border-success/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-success" />
            <CardTitle className="text-lg">Invoice</CardTitle>
          </div>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            {invoice.status === 'paid' ? 'Paid' : invoice.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invoice Header */}
        <div className="grid gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Invoice Number</span>
            <span className="font-mono font-semibold">{invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Generated</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(invoice.generatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <Separator />

        {/* Equipment Rental Section */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-primary" />
            Equipment Rental
          </h4>
          {invoice.equipmentItems.map((item, index) => (
            <div key={index} className="bg-muted/50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between">
                <span className="font-medium text-sm">{item.name}</span>
                <span className="font-medium">₹{item.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹{item.dailyRate}/day × {item.days} days × {item.quantity}</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between text-sm pt-1">
            <span className="text-muted-foreground">Equipment Subtotal</span>
            <span className="font-medium">₹{invoice.equipmentSubtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Service Personnel Section */}
        {invoice.serviceItems.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                Service Personnel
              </h4>
              {invoice.serviceItems.map((item, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{item.personnelName}</span>
                    <span className="font-medium">₹{item.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{item.role} - ₹{item.dailyRate}/day × {item.days} days</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-sm pt-1">
                <span className="text-muted-foreground">Service Subtotal</span>
                <span className="font-medium">₹{invoice.serviceSubtotal.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">CGST (9%)</span>
            <span>₹{invoice.cgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">SGST (9%)</span>
            <span>₹{invoice.sgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Grand Total</span>
            <span className="text-success">₹{invoice.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <Button 
          onClick={handleDownloadPdf} 
          className="w-full"
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF Invoice
        </Button>
      </CardContent>
    </Card>
  );
};
