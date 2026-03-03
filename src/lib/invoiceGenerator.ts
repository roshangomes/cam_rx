import { Invoice } from '@/store/slices/bookingsSlice';

export const generateInvoiceNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

export const generateInvoice = (
  bookingId: string,
  equipmentName: string,
  customerName: string,
  startDate: string,
  endDate: string,
  dailyRate: number,
  quantity: number = 1
): Invoice => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const subtotal = dailyRate * days * quantity;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  return {
    id: `invoice-${bookingId}`,
    referenceNumber: generateInvoiceNumber(),
    bookingId,
    generatedAt: new Date().toISOString(),
    items: [
      {
        description: `${equipmentName} rental for ${days} day(s)`,
        quantity,
        rate: dailyRate * days,
        amount: subtotal,
      },
    ],
    subtotal,
    tax,
    total,
  };
};

export const downloadInvoice = (invoice: Invoice, customerName: string, equipmentName: string) => {
  const invoiceText = `
INVOICE
Reference: ${invoice.referenceNumber}
Generated: ${new Date(invoice.generatedAt).toLocaleString()}

Customer: ${customerName}

ITEMS:
${invoice.items.map(item => 
  `${item.description}
  Quantity: ${item.quantity}
  Rate: ₹${item.rate}
  Amount: ₹${item.amount}`
).join('\n\n')}

Subtotal: ₹${invoice.subtotal.toFixed(2)}
Tax (18% GST): ₹${invoice.tax.toFixed(2)}
TOTAL: ₹${invoice.total.toFixed(2)}
  `.trim();

  const blob = new Blob([invoiceText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${invoice.referenceNumber}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
