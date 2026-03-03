import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AlertTriangle, Check, X, Eye, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { addDamageReport, DamageReport, EquipmentPhoto } from '@/store/slices/photoVerificationSlice';

interface DamageDetectionProps {
  equipmentId: string;
  equipmentName: string;
  bookingId: string;
  preRentalPhotos: EquipmentPhoto[];
  postRentalPhotos: EquipmentPhoto[];
  onComplete?: (report: DamageReport) => void;
}

interface ComparisonResult {
  angle: string;
  prePhoto: EquipmentPhoto | undefined;
  postPhoto: EquipmentPhoto | undefined;
  damageScore: number;
  damageDetected: boolean;
  analysisComplete: boolean;
}

export const DamageDetection: React.FC<DamageDetectionProps> = ({
  equipmentId,
  equipmentName,
  bookingId,
  preRentalPhotos,
  postRentalPhotos,
  onComplete,
}) => {
  const dispatch = useDispatch();
  const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedComparison, setSelectedComparison] = useState<ComparisonResult | null>(null);
  const [damageNotes, setDamageNotes] = useState('');
  const [overallDamage, setOverallDamage] = useState(false);

  const angles = ['front', 'back', 'left', 'right', 'top', 'detail'];

  useEffect(() => {
    // Initialize comparisons
    const initialComparisons: ComparisonResult[] = angles.map(angle => ({
      angle,
      prePhoto: preRentalPhotos.find(p => p.angle === angle),
      postPhoto: postRentalPhotos.find(p => p.angle === angle),
      damageScore: 0,
      damageDetected: false,
      analysisComplete: false,
    }));
    setComparisons(initialComparisons);
  }, [preRentalPhotos, postRentalPhotos]);

  const simulateDamageAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    for (let i = 0; i < comparisons.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setComparisons(prev => {
        const updated = [...prev];
        // Simulate damage detection with random scores
        const damageScore = Math.random() * 100;
        updated[i] = {
          ...updated[i],
          damageScore,
          damageDetected: damageScore > 70,
          analysisComplete: true,
        };
        return updated;
      });

      setAnalysisProgress(((i + 1) / comparisons.length) * 100);
    }

    setIsAnalyzing(false);
    
    const hasDamage = comparisons.some(c => c.damageScore > 70);
    setOverallDamage(hasDamage);
    
    toast({
      title: 'Analysis complete',
      description: hasDamage 
        ? 'Potential damage detected. Please review the results.'
        : 'No significant damage detected.',
      variant: hasDamage ? 'destructive' : 'default',
    });
  };

  const handleSubmitReport = () => {
    const avgScore = comparisons.reduce((sum, c) => sum + c.damageScore, 0) / comparisons.length;
    const damageDetected = comparisons.some(c => c.damageDetected);

    const report: DamageReport = {
      id: `damage-${bookingId}-${Date.now()}`,
      equipmentId,
      bookingId,
      preRentalPhotoId: preRentalPhotos[0]?.id || '',
      postRentalPhotoId: postRentalPhotos[0]?.id || '',
      damageDetected,
      damageScore: avgScore,
      damageDescription: damageNotes || (damageDetected 
        ? 'Potential damage detected during automated analysis'
        : 'No damage detected'),
      createdAt: new Date().toISOString(),
      status: damageDetected ? 'pending' : 'resolved',
    };

    dispatch(addDamageReport(report));
    
    toast({
      title: 'Report submitted',
      description: 'Damage assessment report has been generated',
    });

    onComplete?.(report);
  };

  const getDamageLevel = (score: number) => {
    if (score < 30) return { label: 'Excellent', color: 'bg-success text-success-foreground' };
    if (score < 50) return { label: 'Good', color: 'bg-success/70 text-success-foreground' };
    if (score < 70) return { label: 'Minor Issues', color: 'bg-warning text-warning-foreground' };
    return { label: 'Damage Detected', color: 'bg-destructive text-destructive-foreground' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Damage Detection Analysis
        </CardTitle>
        <CardDescription>
          Comparing pre-rental and post-rental photos of {equipmentName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analyzing photos...</span>
              <span>{Math.round(analysisProgress)}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {comparisons.map((comparison) => {
            const damageLevel = getDamageLevel(comparison.damageScore);
            
            return (
              <div
                key={comparison.angle}
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:border-primary ${
                  comparison.damageDetected ? 'border-destructive bg-destructive/5' : ''
                }`}
                onClick={() => setSelectedComparison(comparison)}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium capitalize text-sm">{comparison.angle}</span>
                  {comparison.analysisComplete && (
                    <Badge className={damageLevel.color} variant="secondary">
                      {damageLevel.label}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-1 mb-2">
                  <div className="aspect-square bg-muted rounded overflow-hidden">
                    {comparison.prePhoto ? (
                      <img
                        src={comparison.prePhoto.url}
                        alt="Pre-rental"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="aspect-square bg-muted rounded overflow-hidden">
                    {comparison.postPhoto ? (
                      <img
                        src={comparison.postPhoto.url}
                        alt="Post-rental"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                </div>

                {comparison.analysisComplete && (
                  <div className="flex items-center gap-1 text-xs">
                    {comparison.damageDetected ? (
                      <>
                        <AlertTriangle className="h-3 w-3 text-destructive" />
                        <span className="text-destructive">Review needed</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-3 w-3 text-success" />
                        <span className="text-success">Clear</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!isAnalyzing && comparisons.every(c => !c.analysisComplete) && (
          <Button className="w-full" onClick={simulateDamageAnalysis}>
            <Eye className="mr-2 h-4 w-4" />
            Start Damage Analysis
          </Button>
        )}

        {comparisons.every(c => c.analysisComplete) && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${overallDamage ? 'bg-destructive/10' : 'bg-success/10'}`}>
              <div className="flex items-center gap-2">
                {overallDamage ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <Check className="h-5 w-5 text-success" />
                )}
                <span className={`font-semibold ${overallDamage ? 'text-destructive' : 'text-success'}`}>
                  {overallDamage 
                    ? 'Potential damage detected - Manual review recommended'
                    : 'Equipment condition verified - No damage detected'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes</label>
              <Textarea
                placeholder="Add any observations about the equipment condition..."
                value={damageNotes}
                onChange={(e) => setDamageNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button className="w-full" onClick={handleSubmitReport}>
              Submit Damage Report
            </Button>
          </div>
        )}

        {/* Comparison Detail Dialog */}
        <Dialog open={!!selectedComparison} onOpenChange={() => setSelectedComparison(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="capitalize">
                {selectedComparison?.angle} View Comparison
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-center">Pre-rental</p>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {selectedComparison?.prePhoto ? (
                    <img
                      src={selectedComparison.prePhoto.url}
                      alt="Pre-rental"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image available
                    </div>
                  )}
                </div>
                {selectedComparison?.prePhoto && (
                  <p className="text-xs text-muted-foreground text-center">
                    Captured: {new Date(selectedComparison.prePhoto.capturedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-center">Post-rental</p>
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {selectedComparison?.postPhoto ? (
                    <img
                      src={selectedComparison.postPhoto.url}
                      alt="Post-rental"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image available
                    </div>
                  )}
                </div>
                {selectedComparison?.postPhoto && (
                  <p className="text-xs text-muted-foreground text-center">
                    Captured: {new Date(selectedComparison.postPhoto.capturedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            {selectedComparison?.analysisComplete && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Damage Score:</span>
                  <Badge className={getDamageLevel(selectedComparison.damageScore).color}>
                    {selectedComparison.damageScore.toFixed(1)}% - {getDamageLevel(selectedComparison.damageScore).label}
                  </Badge>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedComparison(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
