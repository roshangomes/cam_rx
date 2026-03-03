import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { importScenesMaster, SceneMaster } from '@/store/slices/cameraDepartmentSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileText, 
  Check, 
  AlertCircle,
  Film,
  Clapperboard,
  Camera,
  Hash
} from 'lucide-react';
import { toast } from 'sonner';

const ScenesImportPage = () => {
  const dispatch = useDispatch();
  const { scenesMaster } = useSelector((state: RootState) => state.cameraDepartment);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedScenes, setParsedScenes] = useState<SceneMaster[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const parseCSV = (content: string): SceneMaster[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const projectIdx = headers.findIndex(h => h.includes('project'));
    const sceneIdx = headers.findIndex(h => h.includes('scene'));
    const shotIdx = headers.findIndex(h => h.includes('shot'));
    const takeIdx = headers.findIndex(h => h.includes('take'));
    const descIdx = headers.findIndex(h => h.includes('desc'));

    const scenes: SceneMaster[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      if (values.length < 2) continue;

      scenes.push({
        id: `scene-${Date.now()}-${i}`,
        projectName: values[projectIdx] || 'Unknown Project',
        sceneNumber: values[sceneIdx] || `SC${i}`,
        shotNumber: values[shotIdx] || '1',
        takeNumber: values[takeIdx] || '1',
        description: values[descIdx] || '',
        createdAt: new Date().toISOString(),
      });
    }

    return scenes;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const scenes = parseCSV(content);
        
        if (scenes.length === 0) {
          toast.error('No valid scenes found in CSV');
          setIsUploading(false);
          return;
        }

        setParsedScenes(scenes);
        toast.success(`Parsed ${scenes.length} scenes from CSV`);
      } catch (error) {
        toast.error('Failed to parse CSV file');
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setIsUploading(false);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parsedScenes.length === 0) {
      toast.error('No scenes to import');
      return;
    }

    dispatch(importScenesMaster(parsedScenes));
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(150);
    }
    
    toast.success(`Imported ${parsedScenes.length} scenes successfully!`);
    setParsedScenes([]);
    setFileName('');
  };

  const groupedScenes = scenesMaster.reduce((acc, scene) => {
    const key = scene.projectName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(scene);
    return acc;
  }, {} as Record<string, SceneMaster[]>);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Scenes Master Import</h1>
        <p className="text-muted-foreground">
          Upload CSV call-sheets to link Camera Reports with Project → Scene → Shot → Take
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Call-Sheet CSV
          </CardTitle>
          <CardDescription>
            CSV should have columns: Project, Scene, Shot, Take, Description
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-12 min-h-[48px]"
                disabled={isUploading}
              >
                <FileText className="mr-2 h-5 w-5" />
                {isUploading ? 'Reading...' : 'Select CSV File'}
              </Button>
              {fileName && (
                <span className="text-sm text-muted-foreground">{fileName}</span>
              )}
            </div>

            {/* Preview parsed scenes */}
            {parsedScenes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Preview: {parsedScenes.length} scenes found
                  </Label>
                  <Button onClick={handleImport} className="h-10 min-h-[40px]">
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Import
                  </Button>
                </div>
                <ScrollArea className="h-48 rounded-md border p-3">
                  <div className="space-y-2">
                    {parsedScenes.slice(0, 10).map((scene, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{scene.projectName}</Badge>
                        <span>Scene {scene.sceneNumber}</span>
                        <span>Shot {scene.shotNumber}</span>
                        <span>Take {scene.takeNumber}</span>
                      </div>
                    ))}
                    {parsedScenes.length > 10 && (
                      <p className="text-xs text-muted-foreground">
                        ... and {parsedScenes.length - 10} more
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Sample format */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium mb-2">Sample CSV Format:</p>
            <code className="text-xs text-muted-foreground block">
              Project,Scene,Shot,Take,Description<br/>
              Film A,1,1,1,Interior - Day - Office<br/>
              Film A,1,1,2,Interior - Day - Office (Alt)<br/>
              Film A,1,2,1,Wide establishing shot
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Imported Scenes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clapperboard className="h-5 w-5" />
            Imported Scenes ({scenesMaster.length})
          </CardTitle>
          <CardDescription>
            These scenes are available for Camera Reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedScenes).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
              <p>No scenes imported yet</p>
              <p className="text-sm">Upload a CSV file to get started</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-6">
                {Object.entries(groupedScenes).map(([project, scenes]) => (
                  <div key={project} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Film className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold">{project}</h3>
                      <Badge variant="secondary">{scenes.length} scenes</Badge>
                    </div>
                    <div className="grid gap-2 pl-6">
                      {scenes.map((scene) => (
                        <div 
                          key={scene.id}
                          className="flex items-center gap-3 text-sm p-2 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-1">
                            <Camera className="h-3 w-3 text-muted-foreground" />
                            <span>SC{scene.sceneNumber}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            <span>Shot {scene.shotNumber}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Take {scene.takeNumber}</span>
                          </div>
                          {scene.description && (
                            <span className="text-muted-foreground truncate max-w-[200px]">
                              {scene.description}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenesImportPage;
