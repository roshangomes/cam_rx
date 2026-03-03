import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { addEquipmentPhoto, EquipmentPhoto } from '@/store/slices/photoVerificationSlice';
import { RootState } from '@/store/store';

interface EquipmentPhotoUploadProps {
  equipmentId: string;
  equipmentName: string;
  onComplete?: () => void;
}

const requiredAngles = [
  { id: 'front', name: 'Front View', description: 'Clear front-facing photo' },
  { id: 'back', name: 'Back View', description: 'Back of the equipment' },
  { id: 'left', name: 'Left Side', description: 'Left side profile' },
  { id: 'right', name: 'Right Side', description: 'Right side profile' },
  { id: 'top', name: 'Top View', description: 'Top-down view' },
  { id: 'detail', name: 'Detail Shot', description: 'Close-up of any existing marks or damage' },
];

export const EquipmentPhotoUpload: React.FC<EquipmentPhotoUploadProps> = ({
  equipmentId,
  equipmentName,
  onComplete,
}) => {
  const dispatch = useDispatch();
  const { equipmentPhotos } = useSelector((state: RootState) => state.photoVerification);
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, string>>({});
  const [currentAngle, setCurrentAngle] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingPhotos = equipmentPhotos.filter(
    p => p.equipmentId === equipmentId && p.type === 'pre-rental'
  );

  const uploadedCount = Object.keys(uploadedPhotos).length + existingPhotos.length;
  const progress = (uploadedCount / requiredAngles.length) * 100;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, angle: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedPhotos(prev => ({ ...prev, [angle]: dataUrl }));

      const photo: EquipmentPhoto = {
        id: `photo-${equipmentId}-${angle}-${Date.now()}`,
        equipmentId,
        url: dataUrl,
        angle,
        capturedAt: new Date().toISOString(),
        uploadedBy: 'vendor-1',
        type: 'pre-rental',
        metadata: {
          width: 0,
          height: 0,
          fileSize: file.size,
          mimeType: file.type,
        },
      };

      dispatch(addEquipmentPhoto(photo));
      toast({
        title: 'Photo uploaded',
        description: `${angle} view captured successfully`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCaptureClick = (angle: string) => {
    setCurrentAngle(angle);
    fileInputRef.current?.click();
  };

  const removePhoto = (angle: string) => {
    setUploadedPhotos(prev => {
      const newPhotos = { ...prev };
      delete newPhotos[angle];
      return newPhotos;
    });
  };

  const isAngleUploaded = (angle: string) => {
    return uploadedPhotos[angle] || existingPhotos.some(p => p.angle === angle);
  };

  const handleComplete = () => {
    if (uploadedCount < requiredAngles.length) {
      toast({
        title: 'Incomplete photos',
        description: `Please upload all ${requiredAngles.length} required angles`,
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Photos saved',
      description: 'All equipment photos have been saved successfully',
    });
    onComplete?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Equipment Photo Verification
        </CardTitle>
        <CardDescription>
          Upload photos of {equipmentName} from all required angles before lending
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Upload Progress</span>
            <span>{uploadedCount} / {requiredAngles.length} photos</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {requiredAngles.map((angle) => {
            const isUploaded = isAngleUploaded(angle.id);
            const photoUrl = uploadedPhotos[angle.id] || existingPhotos.find(p => p.angle === angle.id)?.url;

            return (
              <div
                key={angle.id}
                className={`relative border-2 rounded-lg p-4 transition-all ${
                  isUploaded
                    ? 'border-success bg-success/5'
                    : 'border-dashed border-muted-foreground/30 hover:border-primary/50'
                }`}
              >
                {isUploaded && photoUrl ? (
                  <div className="space-y-2">
                    <div className="relative aspect-square rounded-md overflow-hidden">
                      <img
                        src={photoUrl}
                        alt={angle.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePhoto(angle.id)}
                        className="absolute top-1 right-1 p-1 bg-destructive rounded-full text-destructive-foreground hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-success text-xs">
                      <Check className="h-3 w-3" />
                      {angle.name}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCaptureClick(angle.id)}
                    className="w-full space-y-2 text-center"
                  >
                    <div className="aspect-square rounded-md bg-muted/50 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{angle.name}</p>
                      <p className="text-xs text-muted-foreground">{angle.description}</p>
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => currentAngle && handleFileSelect(e, currentAngle)}
        />

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload from Gallery
          </Button>
          <Button
            className="flex-1"
            onClick={handleComplete}
            disabled={uploadedCount < requiredAngles.length}
          >
            <Check className="mr-2 h-4 w-4" />
            Save All Photos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
