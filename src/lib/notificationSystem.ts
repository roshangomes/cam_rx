export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendBrowserNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      ...options,
    });
  }
};

export const notifyBookingAccepted = (equipmentName: string, invoiceRef: string, bookingId?: string) => {
  sendBrowserNotification('Booking Accepted! 🎉', {
    body: `Your booking for ${equipmentName} has been confirmed.\nInvoice: ${invoiceRef}`,
    tag: 'booking-accepted',
  });
  
  return {
    type: 'booking_accepted' as const,
    title: 'Booking Accepted! 🎉',
    message: `Your booking for ${equipmentName} has been confirmed. Invoice: ${invoiceRef}`,
    bookingId,
    invoiceRef,
  };
};

export const notifyBookingRejected = (equipmentName: string, bookingId?: string) => {
  sendBrowserNotification('Booking Update', {
    body: `Your booking for ${equipmentName} was not accepted by the vendor.`,
    tag: 'booking-rejected',
  });
  
  return {
    type: 'booking_rejected' as const,
    title: 'Booking Update',
    message: `Your booking for ${equipmentName} was not accepted by the vendor.`,
    bookingId,
  };
};

export const notifyInvoiceGenerated = (invoiceRef: string, bookingId?: string) => {
  sendBrowserNotification('Invoice Generated 📄', {
    body: `New invoice ${invoiceRef} is ready for download.`,
    tag: 'invoice-generated',
  });
  
  return {
    type: 'invoice_generated' as const,
    title: 'Invoice Generated 📄',
    message: `New invoice ${invoiceRef} is ready for download.`,
    bookingId,
    invoiceRef,
  };
};

export const notifyPaymentStatus = (status: string, amount: number, bookingId?: string) => {
  const messages = {
    held_in_escrow: `Payment of ₹${amount} is now held securely in escrow.`,
    released: `Payment of ₹${amount} has been released successfully.`,
    refunded: `Payment of ₹${amount} has been refunded.`,
  };
  
  const message = messages[status as keyof typeof messages] || `Payment status updated: ${status}`;
  
  sendBrowserNotification('Payment Update 💰', {
    body: message,
    tag: 'payment-status',
  });
  
  return {
    type: 'payment_status' as const,
    title: 'Payment Update 💰',
    message,
    bookingId,
  };
};
