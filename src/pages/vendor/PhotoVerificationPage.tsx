import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Camera, Shield, Image as ImageIcon, AlertTriangle, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RootState } from '@/store/store';
import { EquipmentPhotoUpload } from '@/components/photo-verification/EquipmentPhotoUpload';
import { GuidedPhotoCapture } from '@/components/photo-verification/GuidedPhotoCapture';
import { DamageDetection } from '@/components/photo-verification/DamageDetection';

const PhotoVerificationPage: React.FC = () => {
  const { equipment } = useSelector((state: RootState) => state.inventory);
  const { equipmentPhotos, damageReports } = useSelector((state: RootState) => state.photoVerification);
  const { bookings } = useSelector((state: RootState) => state.bookings);
  
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');

  const selectedEquipment = equipment.find(e => e.id === selectedEquipmentId);
  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

  const getEquipmentPhotoCount = (equipmentId: string) => {
    return equipmentPhotos.filter(p => p.equipmentId === equipmentId && p.type === 'pre-rental').length;
  };

  const getDamageReportStatus = (bookingId: string) => {
    const report = damageReports.find(r => r.bookingId === bookingId);
    if (!report) return null;
    return report;
  };

  const stats = {
    totalEquipment: equipment.length,
    withPhotos: equipment.filter(e => getEquipmentPhotoCount(e.id) >= 6).length,
    pendingReturns: confirmedBookings.length,
    damageReports: damageReports.filter(r => r.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Camera className="h-8 w-8 text-primary" />
          Photo Verification System
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload equipment photos and verify returns with guided capture
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.totalEquipment}</p>
            <p className="text-sm text-muted-foreground">Total Equipment</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Check className="h-8 w-8 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{stats.withPhotos}</p>
            <p className="text-sm text-muted-foreground">Fully Documented</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Camera className="h-8 w-8 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-bold">{stats.pendingReturns}</p>
            <p className="text-sm text-muted-foreground">Active Rentals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p className="text-2xl font-bold">{stats.damageReports}</p>
            <p className="text-sm text-muted-foreground">Pending Reviews</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">
            <ImageIcon className="mr-2 h-4 w-4" />
            Pre-Rental Upload
          </TabsTrigger>
          <TabsTrigger value="capture">
            <Camera className="mr-2 h-4 w-4" />
            Return Capture
          </TabsTrigger>
          <TabsTrigger value="damage">
            <Shield className="mr-2 h-4 w-4" />
            Damage Detection
          </TabsTrigger>
        </TabsList>

        {/* Pre-Rental Photo Upload */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Equipment</CardTitle>
              <CardDescription>Choose equipment to upload verification photos</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment..." />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map(item => {
                    const photoCount = getEquipmentPhotoCount(item.id);
                    return (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          <Badge variant={photoCount >= 6 ? 'default' : 'outline'} className="ml-2">
                            {photoCount}/6 photos
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedEquipment && (
            <EquipmentPhotoUpload
              equipmentId={selectedEquipment.id}
              equipmentName={selectedEquipment.name}
              onComplete={() => setSelectedEquipmentId('')}
            />
          )}
        </TabsContent>

        {/* Return Photo Capture */}
        <TabsContent value="capture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Active Rental</CardTitle>
              <CardDescription>Choose a rental to capture return photos</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select booking..." />
                </SelectTrigger>
                <SelectContent>
                  {confirmedBookings.map(booking => (
                    <SelectItem key={booking.id} value={booking.id}>
                      <div className="flex items-center gap-2">
                        <span>{booking.equipmentName}</span>
                        <span className="text-muted-foreground">- {booking.customerName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedBooking && (
            <GuidedPhotoCapture
              equipmentId={selectedBooking.equipmentId}
              equipmentName={selectedBooking.equipmentName}
              bookingId={selectedBooking.id}
              onComplete={() => setSelectedBookingId('')}
            />
          )}

          {confirmedBookings.length === 0 && !selectedBookingId && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active rentals pending return</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Damage Detection */}
        <TabsContent value="damage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Rental for Analysis</CardTitle>
              <CardDescription>Compare pre and post-rental photos to detect damage</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedBookingId} onValueChange={setSelectedBookingId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select booking..." />
                </SelectTrigger>
                <SelectContent>
                  {bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').map(booking => {
                    const report = getDamageReportStatus(booking.id);
                    return (
                      <SelectItem key={booking.id} value={booking.id}>
                        <div className="flex items-center gap-2">
                          <span>{booking.equipmentName}</span>
                          {report && (
                            <Badge variant={report.damageDetected ? 'destructive' : 'default'}>
                              {report.status}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedBooking && (
            <DamageDetection
              equipmentId={selectedBooking.equipmentId}
              equipmentName={selectedBooking.equipmentName}
              bookingId={selectedBooking.id}
              preRentalPhotos={equipmentPhotos.filter(
                p => p.equipmentId === selectedBooking.equipmentId && p.type === 'pre-rental'
              )}
              postRentalPhotos={equipmentPhotos.filter(
                p => p.equipmentId === selectedBooking.equipmentId && p.type === 'post-rental'
              )}
              onComplete={() => setSelectedBookingId('')}
            />
          )}

          {/* Damage Reports List */}
          {damageReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Damage Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {damageReports.slice(0, 5).map(report => {
                    const booking = bookings.find(b => b.id === report.bookingId);
                    return (
                      <div
                        key={report.id}
                        className={`p-3 rounded-lg border ${
                          report.damageDetected ? 'border-destructive/50 bg-destructive/5' : 'border-success/50 bg-success/5'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{booking?.equipmentName || 'Unknown Equipment'}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={report.damageDetected ? 'destructive' : 'default'}>
                            {report.damageDetected ? 'Damage Detected' : 'Clear'}
                          </Badge>
                        </div>
                        <p className="text-sm mt-2">{report.damageDescription}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PhotoVerificationPage;
