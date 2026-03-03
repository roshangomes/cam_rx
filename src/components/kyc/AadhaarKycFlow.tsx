import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, FileText, Upload, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AadhaarKycFlowProps {
  onKycComplete: (kycData: KycData) => void;
  userType: 'vendor' | 'customer';
}

export interface KycData {
  aadhaarCardFile: File | null;
  filmUnionCardFile: File | null;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  verifiedAt?: string;
}

type KycStep = 'document-upload' | 'pending-verification' | 'verified';

export const AadhaarKycFlow: React.FC<AadhaarKycFlowProps> = ({ onKycComplete, userType }) => {
  const [step, setStep] = useState<KycStep>('document-upload');
  const [aadhaarCardFile, setAadhaarCardFile] = useState<File | null>(null);
  const [filmUnionCardFile, setFilmUnionCardFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [kycData, setKycData] = useState<KycData | null>(null);

  const handleAadhaarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should not exceed 5MB');
        return;
      }
      setAadhaarCardFile(file);
      toast.success('Aadhaar card uploaded successfully');
    }
  };

  const handleFilmUnionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPG, PNG) or PDF file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should not exceed 5MB');
        return;
      }
      setFilmUnionCardFile(file);
      toast.success('Film Union card uploaded successfully');
    }
  };

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aadhaarCardFile) {
      toast.error('Please upload your Aadhaar card');
      return;
    }

    setIsLoading(true);

    // Mock document submission and admin verification flow
    setTimeout(() => {
      const submittedKycData: KycData = {
        aadhaarCardFile,
        filmUnionCardFile,
        isVerified: false,
        verificationStatus: 'pending',
        submittedAt: new Date().toISOString(),
      };

      setKycData(submittedKycData);
      setStep('pending-verification');
      toast.success('Documents submitted successfully! Awaiting admin verification.');
      setIsLoading(false);

      // Mock admin approval after 3 seconds (simulate admin verification)
      setTimeout(() => {
        const approvedKycData: KycData = {
          ...submittedKycData,
          isVerified: true,
          verificationStatus: 'approved',
          verifiedAt: new Date().toISOString(),
        };
        setKycData(approvedKycData);
        setStep('verified');
        toast.success('Admin has verified your documents!');
        onKycComplete(approvedKycData);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* KYC Requirement Notice */}
      {userType === 'vendor' && step === 'document-upload' && (
        <Alert className="border-primary/50 bg-primary/5">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <AlertDescription className="text-sm">
            <strong>Vendor KYC Mandatory:</strong> Upload your Aadhaar card to verify your identity.
            Film Union card is optional but recommended for additional trust.
          </AlertDescription>
        </Alert>
      )}

      {userType === 'customer' && step === 'document-upload' && (
        <Alert className="border-accent/50 bg-accent/5">
          <AlertCircle className="h-5 w-5 text-accent" />
          <AlertDescription className="text-sm">
            <strong>Optional for Customers:</strong> Complete KYC to unlock premium features and 
            increase your trust score with vendors.
          </AlertDescription>
        </Alert>
      )}

      {/* Document Upload Step */}
      {step === 'document-upload' && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5 text-primary" />
              Upload KYC Documents
            </CardTitle>
            <CardDescription>
              Upload your identity documents for admin verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDocumentSubmit} className="space-y-6">
              {/* Aadhaar Card Upload */}
              <div className="space-y-2">
                <Label htmlFor="aadhaar-upload" className="flex items-center gap-2">
                  Aadhaar Card <span className="text-destructive">*</span>
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Input
                    id="aadhaar-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleAadhaarFileChange}
                    className="hidden"
                  />
                  <label htmlFor="aadhaar-upload" className="cursor-pointer">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    {aadhaarCardFile ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{aadhaarCardFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(aadhaarCardFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Click to upload Aadhaar card</p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG or PDF (max 5MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Film Union Card Upload (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="union-upload" className="flex items-center gap-2">
                  Film Union Card <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Input
                    id="union-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFilmUnionFileChange}
                    className="hidden"
                  />
                  <label htmlFor="union-upload" className="cursor-pointer">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    {filmUnionCardFile ? (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{filmUnionCardFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(filmUnionCardFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Click to upload Film Union card</p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG or PDF (max 5MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Your documents will be reviewed by our admin team. You'll receive a notification once verified.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full h-11"
                variant="default"
                disabled={isLoading || !aadhaarCardFile}
              >
                {isLoading ? 'Submitting Documents...' : 'Submit for Verification'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending Verification Step */}
      {step === 'pending-verification' && kycData && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-warning">
              <Clock className="h-5 w-5" />
              Verification Pending
            </CardTitle>
            <CardDescription>
              Your documents are under admin review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Aadhaar Card:</span>
                <span className="font-medium text-success flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Uploaded
                </span>
              </div>
              {kycData.filmUnionCardFile && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Film Union Card:</span>
                  <span className="font-medium text-success flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Uploaded
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-warning flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Awaiting Admin Review
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Submitted:</span>
                <span className="font-medium">
                  {new Date(kycData.submittedAt).toLocaleString()}
                </span>
              </div>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Verification typically takes 24-48 hours. You'll be notified via email once completed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Verification Success */}
      {step === 'verified' && kycData && (
        <Card className="border-success/50 bg-success/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-success">
              <CheckCircle2 className="h-5 w-5" />
              Documents Verified Successfully
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Aadhaar Card:</span>
                <span className="font-medium text-success flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Verified
                </span>
              </div>
              {kycData.filmUnionCardFile && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Film Union Card:</span>
                  <span className="font-medium text-success flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Verified
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-success flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Approved by Admin
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Verified At:</span>
                <span className="font-medium">
                  {kycData.verifiedAt && new Date(kycData.verifiedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
