import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, Check, ChevronRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { addEquipmentPhoto, addCapturedAngle, resetCapturedAngles, EquipmentPhoto } from '@/store/slices/photoVerificationSlice';
import { RootState } from '@/store/store';

interface GuidedPhotoCaptureProps {
  equipmentId: string;
  equipmentName: string;
  bookingId: string;
  onComplete?: (photos: EquipmentPhoto[]) => void;
}

const captureAngles = [
  { id: 'front', name: 'Front View', instruction: 'Position the equipment to show the front face clearly' },
  { id: 'back', name: 'Back View', instruction: 'Turn the equipment around to capture the back' },
  { id: 'left', name: 'Left Side', instruction: 'Capture the left side profile' },
  { id: 'right', name: 'Right Side', instruction: 'Capture the right side profile' },
  { id: 'top', name: 'Top View', instruction: 'Hold the camera above to capture the top' },
  { id: 'detail', name: 'Detail Shot', instruction: 'Capture any scratches, marks, or damage' },
];

export const GuidedPhotoCapture: React.FC<GuidedPhotoCaptureProps> = ({
  equipmentId,
  equipmentName,
  bookingId,
  onComplete,
}) => {
  const dispatch = useDispatch();
  const { equipmentPhotos, capturedAngles } = useSelector((state: RootState) => state.photoVerification);
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<Record<string, string>>({});
  const [showOverlay, setShowOverlay] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Get pre-rental photos for overlay guidance
  const preRentalPhotos = equipmentPhotos.filter(
    p => p.equipmentId === equipmentId && p.type === 'pre-rental'
  );

  const currentAngle = captureAngles[currentStep];
  const referencePhoto = preRentalPhotos.find(p => p.angle === currentAngle?.id);
  const progress = (Object.keys(capturedPhotos).length / captureAngles.length) * 100;

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowOverlay(true);
    } catch (error) {
      toast({
        title: 'Camera access denied',
        description: 'Please allow camera access to capture photos',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowOverlay(false);
  };

  const handleFileCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      processCapture(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processCapture = (imageData: string) => {
    const angle = currentAngle.id;
    setCapturedPhotos(prev => ({ ...prev, [angle]: imageData }));
    dispatch(addCapturedAngle(angle));

    const photo: EquipmentPhoto = {
      id: `photo-${equipmentId}-return-${angle}-${Date.now()}`,
      equipmentId,
      url: imageData,
      angle,
      capturedAt: new Date().toISOString(),
      uploadedBy: 'customer-1',
      type: 'post-rental',
      metadata: {
        width: 0,
        height: 0,
        fileSize: 0,
        mimeType: 'image/jpeg',
      },
    };

    dispatch(addEquipmentPhoto(photo));

    toast({
      title: 'Photo captured',
      description: `${currentAngle.name} captured successfully`,
    });

    if (currentStep < captureAngles.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      stopCamera();
      handleComplete();
    }
  };

  const handleComplete = () => {
    const allPhotos = Object.entries(capturedPhotos).map(([angle, url]) => ({
      id: `photo-${equipmentId}-return-${angle}-${Date.now()}`,
      equipmentId,
      url,
      angle,
      capturedAt: new Date().toISOString(),
      uploadedBy: 'customer-1',
      type: 'post-rental' as const,
      metadata: {
        width: 0,
        height: 0,
        fileSize: 0,
        mimeType: 'image/jpeg',
      },
    }));

    toast({
      title: 'All photos captured',
      description: 'Return verification photos saved successfully',
    });

    onComplete?.(allPhotos);
    dispatch(resetCapturedAngles());
  };

  const retakePhoto = () => {
    const angle = currentAngle.id;
    setCapturedPhotos(prev => {
      const newPhotos = { ...prev };
      delete newPhotos[angle];
      return newPhotos;
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Return Photo Verification
        </CardTitle>
        <CardDescription>
          Follow the guided overlay to capture {equipmentName} photos for damage detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Capture Progress</span>
            <span>{Object.keys(capturedPhotos).length} / {captureAngles.length} angles</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Angle Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {captureAngles.map((angle, index) => {
            const isCaptured = capturedPhotos[angle.id];
            const isCurrent = index === currentStep;

            return (
              <Badge
                key={angle.id}
                variant={isCaptured ? 'default' : isCurrent ? 'secondary' : 'outline'}
                className={`cursor-pointer whitespace-nowrap ${isCaptured ? 'bg-success' : ''}`}
                onClick={() => setCurrentStep(index)}
              >
                {isCaptured && <Check className="mr-1 h-3 w-3" />}
                {angle.name}
              </Badge>
            );
          })}
        </div>

        {/* Current Angle Instructions */}
        {currentAngle && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold flex items-center gap-2">
              Step {currentStep + 1}: {currentAngle.name}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {currentAngle.instruction}
            </p>
          </div>
        )}

        {/* Photo Preview / Reference Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Reference (Pre-rental)</p>
            <div className="aspect-square rounded-lg border-2 border-dashed overflow-hidden bg-muted/50">
              {referencePhoto ? (
                <img
                  src={referencePhoto.url}
                  alt="Reference"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No reference
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Your Capture</p>
            <div className="aspect-square rounded-lg border-2 border-dashed overflow-hidden bg-muted/50">
              {capturedPhotos[currentAngle?.id] ? (
                <img
                  src={capturedPhotos[currentAngle.id]}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Not captured
                </div>
              )}
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileCapture}
        />

        <div className="flex gap-3">
          {capturedPhotos[currentAngle?.id] ? (
            <>
              <Button variant="outline" className="flex-1" onClick={retakePhoto}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (currentStep < captureAngles.length - 1) {
                    setCurrentStep(prev => prev + 1);
                  } else {
                    handleComplete();
                  }
                }}
              >
                {currentStep < captureAngles.length - 1 ? (
                  <>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Complete
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
              </Button>
              <Button className="flex-1" onClick={startCamera}>
                Use Camera Overlay
              </Button>
            </>
          )}
        </div>

        {/* Camera Overlay Dialog */}
        <Dialog open={showOverlay} onOpenChange={(open) => !open && stopCamera()}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Guided Capture - {currentAngle?.name}</DialogTitle>
            </DialogHeader>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {referencePhoto && (
                <div className="absolute inset-0 pointer-events-none">
                  <img
                    src={referencePhoto.url}
                    alt="Overlay guide"
                    className="w-full h-full object-contain opacity-30"
                  />
                  <div className="absolute inset-0 border-4 border-dashed border-primary/50 rounded-lg m-8" />
                </div>
              )}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <Button
                  size="lg"
                  className="rounded-full h-16 w-16"
                  onClick={() => {
                    if (videoRef.current) {
                      const canvas = document.createElement('canvas');
                      canvas.width = videoRef.current.videoWidth;
                      canvas.height = videoRef.current.videoHeight;
                      const ctx = canvas.getContext('2d');
                      ctx?.drawImage(videoRef.current, 0, 0);
                      const imageData = canvas.toDataURL('image/jpeg', 0.8);
                      processCapture(imageData);
                      stopCamera();
                    }
                  }}
                >
                  <Camera className="h-8 w-8" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Align the equipment with the overlay guide and capture
            </p>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
