import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface EquipmentInvoiceItem {
  equipmentId: string;
  name: string;
  dailyRate: number;
  quantity: number;
  days: number;
  totalAmount: number;
}

export interface ServiceInvoiceItem {
  personnelId: string;
  personnelName: string;
  role: string;
  dailyRate: number;
  days: number;
  totalAmount: number;
}

export interface EnhancedInvoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  
  // Customer Details
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  
  // Vendor Details
  vendorName: string;
  vendorEmail: string;
  vendorPhone?: string;
  vendorAddress?: string;
  vendorGstin?: string;
  
  // Booking Details
  bookingStartDate: string;
  bookingEndDate: string;
  
  // Line Items
  equipmentItems: EquipmentInvoiceItem[];
  serviceItems: ServiceInvoiceItem[];
  
  // Totals
  equipmentSubtotal: number;
  serviceSubtotal: number;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  
  // Metadata
  generatedAt: string;
  status: 'draft' | 'pending' | 'paid' | 'cancelled';
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
}

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
};

export const calculateInvoiceTotals = (
  equipmentItems: EquipmentInvoiceItem[],
  serviceItems: ServiceInvoiceItem[]
): {
  equipmentSubtotal: number;
  serviceSubtotal: number;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
} => {
  const equipmentSubtotal = equipmentItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const serviceSubtotal = serviceItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const subtotal = equipmentSubtotal + serviceSubtotal;
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const grandTotal = subtotal + cgst + sgst;

  return {
    equipmentSubtotal,
    serviceSubtotal,
    subtotal,
    cgst,
    sgst,
    grandTotal,
  };
};

export const createEnhancedInvoice = (
  bookingId: string,
  customerDetails: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  },
  vendorDetails: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    gstin?: string;
  },
  bookingDates: {
    startDate: string;
    endDate: string;
  },
  equipmentItems: EquipmentInvoiceItem[],
  serviceItems: ServiceInvoiceItem[]
): EnhancedInvoice => {
  const totals = calculateInvoiceTotals(equipmentItems, serviceItems);

  return {
    id: `invoice-${bookingId}-${Date.now()}`,
    invoiceNumber: generateInvoiceNumber(),
    bookingId,
    customerName: customerDetails.name,
    customerEmail: customerDetails.email,
    customerPhone: customerDetails.phone,
    customerAddress: customerDetails.address,
    vendorName: vendorDetails.name,
    vendorEmail: vendorDetails.email,
    vendorPhone: vendorDetails.phone,
    vendorAddress: vendorDetails.address,
    vendorGstin: vendorDetails.gstin,
    bookingStartDate: bookingDates.startDate,
    bookingEndDate: bookingDates.endDate,
    equipmentItems,
    serviceItems,
    ...totals,
    generatedAt: new Date().toISOString(),
    status: 'pending',
  };
};

export const generateEnhancedInvoicePdf = (invoice: EnhancedInvoice): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth / 2, 25, { align: 'center' });
  
  // Invoice Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 15, 40);
  doc.text(`Date: ${new Date(invoice.generatedAt).toLocaleDateString('en-IN')}`, 15, 46);
  doc.text(`Booking ID: ${invoice.bookingId}`, 15, 52);
  
  // Status Badge
  doc.setFillColor(invoice.status === 'paid' ? 34 : 255, invoice.status === 'paid' ? 197 : 193, invoice.status === 'paid' ? 94 : 7);
  doc.roundedRect(pageWidth - 45, 35, 30, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(invoice.status.toUpperCase(), pageWidth - 30, 41, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  
  // Vendor Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('From:', 15, 65);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(invoice.vendorName, 15, 72);
  if (invoice.vendorAddress) doc.text(invoice.vendorAddress, 15, 78);
  if (invoice.vendorEmail) doc.text(`Email: ${invoice.vendorEmail}`, 15, 84);
  if (invoice.vendorPhone) doc.text(`Phone: ${invoice.vendorPhone}`, 15, 90);
  if (invoice.vendorGstin) doc.text(`GSTIN: ${invoice.vendorGstin}`, 15, 96);
  
  // Customer Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', pageWidth / 2 + 10, 65);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(invoice.customerName, pageWidth / 2 + 10, 72);
  if (invoice.customerAddress) doc.text(invoice.customerAddress, pageWidth / 2 + 10, 78);
  if (invoice.customerEmail) doc.text(`Email: ${invoice.customerEmail}`, pageWidth / 2 + 10, 84);
  if (invoice.customerPhone) doc.text(`Phone: ${invoice.customerPhone}`, pageWidth / 2 + 10, 90);
  
  // Booking Period
  doc.setFillColor(240, 240, 240);
  doc.rect(15, 105, pageWidth - 30, 12, 'F');
  doc.setFontSize(10);
  doc.text(
    `Rental Period: ${new Date(invoice.bookingStartDate).toLocaleDateString('en-IN')} - ${new Date(invoice.bookingEndDate).toLocaleDateString('en-IN')}`,
    pageWidth / 2,
    113,
    { align: 'center' }
  );
  
  let yPosition = 125;
  
  // Equipment Rental Table
  if (invoice.equipmentItems.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Equipment Rental', 15, yPosition);
    yPosition += 5;
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Equipment', 'Daily Rate', 'Qty', 'Days', 'Amount']],
      body: invoice.equipmentItems.map(item => [
        item.name,
        `₹${item.dailyRate.toFixed(2)}`,
        item.quantity.toString(),
        item.days.toString(),
        `₹${item.totalAmount.toFixed(2)}`,
      ]),
      foot: [['', '', '', 'Subtotal', `₹${invoice.equipmentSubtotal.toFixed(2)}`]],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { left: 15, right: 15 },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Service Personnel Table
  if (invoice.serviceItems.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Service Personnel', 15, yPosition);
    yPosition += 5;
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Personnel', 'Role', 'Daily Rate', 'Days', 'Amount']],
      body: invoice.serviceItems.map(item => [
        item.personnelName,
        item.role,
        `₹${item.dailyRate.toFixed(2)}`,
        item.days.toString(),
        `₹${item.totalAmount.toFixed(2)}`,
      ]),
      foot: [['', '', '', 'Subtotal', `₹${invoice.serviceSubtotal.toFixed(2)}`]],
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { left: 15, right: 15 },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Grand Total Section
  const totalsX = pageWidth - 80;
  
  doc.setFillColor(248, 250, 252);
  doc.rect(totalsX - 10, yPosition, 75, 50, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsX, yPosition + 10);
  doc.text(`₹${invoice.subtotal.toFixed(2)}`, pageWidth - 20, yPosition + 10, { align: 'right' });
  
  doc.text('CGST (9%):', totalsX, yPosition + 20);
  doc.text(`₹${invoice.cgst.toFixed(2)}`, pageWidth - 20, yPosition + 20, { align: 'right' });
  
  doc.text('SGST (9%):', totalsX, yPosition + 30);
  doc.text(`₹${invoice.sgst.toFixed(2)}`, pageWidth - 20, yPosition + 30, { align: 'right' });
  
  doc.setDrawColor(200, 200, 200);
  doc.line(totalsX - 5, yPosition + 35, pageWidth - 15, yPosition + 35);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total:', totalsX, yPosition + 45);
  doc.setTextColor(34, 197, 94);
  doc.text(`₹${invoice.grandTotal.toFixed(2)}`, pageWidth - 20, yPosition + 45, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  
  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  doc.text('This is a computer-generated invoice.', pageWidth / 2, footerY + 6, { align: 'center' });
  
  // Save PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
};
