import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addCameraReport, seedEquipmentDatabase } from '@/store/slices/cameraDepartmentSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Film,
  Clock,
  CheckCircle,
  Wifi,
  WifiOff,
  Clapperboard,
  Aperture,
  Timer,
  Gauge,
} from 'lucide-react';

// Filter presets
const filterPresets = ['None', 'ND .3', 'ND .6', 'ND .9', 'ND 1.2', 'Polarizer', 'Black Pro Mist 1/4', 'Black Pro Mist 1/2'];

// Scene/Shot/Take options
const sceneOptions = Array.from({ length: 50 }, (_, i) => `Scene ${i + 1}`);
const shotOptions = ['Wide', 'Medium', 'Close-up', 'Insert', 'POV', 'OTS', 'Two-shot', 'Tracking'];
const takeOptions = Array.from({ length: 20 }, (_, i) => `Take ${i + 1}`);
const fpsOptions = [23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60, 120, 240];
const shutterAngleOptions = [45, 90, 144, 172.8, 180, 270, 360];

export default function CameraReportsPage() {
  const dispatch = useDispatch();
  const { cameraReports, offlineQueue } = useSelector((state: RootState) => state.cameraDepartment);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [projectId, setProjectId] = useState('PROJ-2024-001');
  const [scene, setScene] = useState('');
  const [shot, setShot] = useState('');
  const [take, setTake] = useState('');
  const [lens, setLens] = useState('');
  const [filter, setFilter] = useState('');
  const [customFilter, setCustomFilter] = useState('');
  const [fps, setFps] = useState('');
  const [shutterAngle, setShutterAngle] = useState('');
  const [reelId, setReelId] = useState('');
  const [notes, setNotes] = useState('');
  
  const isOnline = navigator.onLine;
  
  // Get lenses from seed database
  const lensOptions = seedEquipmentDatabase.filter(e => e.category === 'Lenses');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scene || !shot || !take || !lens || !fps || !shutterAngle || !reelId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    dispatch(addCameraReport({
      projectId,
      scene,
      shot,
      take,
      lens,
      filter: filter === 'custom' ? customFilter : filter,
      fps: parseFloat(fps),
      shutterAngle: parseFloat(shutterAngle),
      reelId,
      notes,
      createdBy: user?.id || 'anonymous',
    }));
    
    toast.success('Camera report saved');
    
    // Reset form but keep project ID and increment take
    setScene(scene);
    setShot(shot);
    const currentTakeNum = parseInt(take.replace('Take ', ''));
    setTake(`Take ${currentTakeNum + 1}`);
    setNotes('');
  };
  
  const todaysReports = cameraReports.filter(
    r => new Date(r.createdAt).toDateString() === new Date().toDateString()
  );
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Digital Camera Reports</h1>
          <p className="text-muted-foreground">Capture technical metadata for post-production</p>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge className="bg-green-500/20 text-green-400">
              <Wifi className="w-3 h-3 mr-1" /> Online
            </Badge>
          ) : (
            <Badge className="bg-yellow-500/20 text-yellow-400">
              <WifiOff className="w-3 h-3 mr-1" /> Offline Mode
            </Badge>
          )}
          {offlineQueue.filter(q => q.type === 'cameraReport').length > 0 && (
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              {offlineQueue.filter(q => q.type === 'cameraReport').length} pending sync
            </Badge>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="new" className="space-y-6">
        <TabsList>
          <TabsTrigger value="new">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </TabsTrigger>
          <TabsTrigger value="today">
            Today's Reports ({todaysReports.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Reports ({cameraReports.length})
          </TabsTrigger>
        </TabsList>
        
        {/* New Entry Form */}
        <TabsContent value="new">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clapperboard className="w-5 h-5" />
                  New Camera Report
                </CardTitle>
                <CardDescription>Project: {projectId}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Scene / Shot / Take */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Film className="w-4 h-4" /> Scene *
                    </Label>
                    <Select value={scene} onValueChange={setScene}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scene" />
                      </SelectTrigger>
                      <SelectContent>
                        {sceneOptions.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Shot *</Label>
                    <Select value={shot} onValueChange={setShot}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shot" />
                      </SelectTrigger>
                      <SelectContent>
                        {shotOptions.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Take *</Label>
                    <Select value={take} onValueChange={setTake}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select take" />
                      </SelectTrigger>
                      <SelectContent>
                        {takeOptions.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Lens */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Aperture className="w-4 h-4" /> Lens *
                  </Label>
                  <Select value={lens} onValueChange={setLens}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lens from inventory" />
                    </SelectTrigger>
                    <SelectContent>
                      {lensOptions.map(l => (
                        <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Filter */}
                <div className="space-y-2">
                  <Label>Filter</Label>
                  <div className="flex gap-2">
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select filter" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterPresets.map(f => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                    {filter === 'custom' && (
                      <Input
                        placeholder="Enter filter name"
                        value={customFilter}
                        onChange={(e) => setCustomFilter(e.target.value)}
                        className="flex-1"
                      />
                    )}
                  </div>
                </div>
                
                {/* FPS and Shutter Angle */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Timer className="w-4 h-4" /> FPS *
                    </Label>
                    <Select value={fps} onValueChange={setFps}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select FPS" />
                      </SelectTrigger>
                      <SelectContent>
                        {fpsOptions.map(f => (
                          <SelectItem key={f} value={f.toString()}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Gauge className="w-4 h-4" /> Shutter Angle *
                    </Label>
                    <Select value={shutterAngle} onValueChange={setShutterAngle}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select angle" />
                      </SelectTrigger>
                      <SelectContent>
                        {shutterAngleOptions.map(a => (
                          <SelectItem key={a} value={a.toString()}>{a}°</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Reel ID */}
                <div className="space-y-2">
                  <Label>Reel ID *</Label>
                  <Input
                    placeholder="e.g., A001_C003"
                    value={reelId}
                    onChange={(e) => setReelId(e.target.value)}
                  />
                </div>
                
                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>
                
                <Button type="submit" size="lg" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Save Report
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
        
        {/* Today's Reports */}
        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Today's Camera Reports</CardTitle>
              <CardDescription>{new Date().toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              {todaysReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No reports recorded today
                </div>
              ) : (
                <div className="space-y-3">
                  {todaysReports.map(report => (
                    <div
                      key={report.id}
                      className="p-4 bg-muted/50 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4"
                    >
                      <div>
                        <p className="text-xs text-muted-foreground">Scene/Shot/Take</p>
                        <p className="font-medium">{report.scene} / {report.shot} / {report.take}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Lens</p>
                        <p className="font-medium">{report.lens}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">FPS / Shutter</p>
                        <p className="font-medium">{report.fps} / {report.shutterAngle}°</p>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Badge variant="outline">{report.reelId}</Badge>
                        {report.syncedToServer ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* All Reports */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Camera Reports</CardTitle>
              <CardDescription>{cameraReports.length} total reports</CardDescription>
            </CardHeader>
            <CardContent>
              {cameraReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No camera reports yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...cameraReports].reverse().map(report => (
                    <div
                      key={report.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge>{report.projectId}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(report.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {report.syncedToServer ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Scene:</span> {report.scene}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Shot:</span> {report.shot}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Take:</span> {report.take}
                        </div>
                        <div>
                          <span className="text-muted-foreground">FPS:</span> {report.fps}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Reel:</span> {report.reelId}
                        </div>
                      </div>
                      {report.notes && (
                        <p className="mt-2 text-sm text-muted-foreground italic">
                          Notes: {report.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
