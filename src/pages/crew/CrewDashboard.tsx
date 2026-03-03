import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  FileText, 
  Clapperboard, 
  Box,
  LogOut,
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

const CrewDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { handovers, cameraReports } = useSelector((state: RootState) => state.cameraDepartment);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const pendingHandovers = handovers.filter(h => !h.confirmedAt).length;
  const completedReports = cameraReports.filter(r => r.syncedToServer).length;

  const modules = [
    {
      title: 'Asset Handover',
      description: 'Verify and receive equipment',
      icon: Package,
      path: '/crew/handover',
      stats: `${pendingHandovers} pending`,
    },
    {
      title: 'RFQ Management',
      description: 'Request quotes for equipment',
      icon: FileText,
      path: '/crew/rfq',
      stats: 'Submit requests',
    },
    {
      title: 'Camera Reports',
      description: 'Log scene/shot metadata',
      icon: Clapperboard,
      path: '/crew/reports',
      stats: `${completedReports} synced`,
    },
    {
      title: 'Expendables',
      description: 'Track consumable inventory',
      icon: Box,
      path: '/crew/expendables',
      stats: 'Check stock',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Camera Crew Portal</h1>
              <p className="text-sm text-muted-foreground">{user?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingHandovers}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedReports}</p>
                  <p className="text-xs text-muted-foreground">Reports Synced</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Camera Module</h2>
          <div className="grid gap-4">
            {modules.map((module) => (
              <Link key={module.path} to={module.path}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <module.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{module.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {module.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{module.stats}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default CrewDashboard;
