import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Navigation, 
  Fuel, 
  MapPin, 
  LogOut,
  Truck,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

const DriverDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { trips } = useSelector((state: RootState) => state.transportLogistics);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const todayTrips = trips.filter(t => {
    const today = new Date().toDateString();
    return new Date(t.startTimestamp).toDateString() === today;
  });

  const totalDistance = trips.reduce((acc, t) => acc + (t.distanceKm || 0), 0);

  const modules = [
    {
      title: 'Trip Logger',
      description: 'Log your trips with GPS tracking',
      icon: Navigation,
      path: '/driver/trips',
      stats: `${todayTrips.length} trips today`,
    },
    {
      title: 'Fuel Entry',
      description: 'Record fuel purchases',
      icon: Fuel,
      path: '/driver/fuel',
      stats: 'Track fuel usage',
    },
    {
      title: 'Geofence',
      description: 'View zone boundaries',
      icon: MapPin,
      path: '/driver/geofence',
      stats: 'Check zones',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Driver Portal</h1>
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
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayTrips.length}</p>
                  <p className="text-xs text-muted-foreground">Trips Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalDistance}</p>
                  <p className="text-xs text-muted-foreground">Total KM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Transport Module</h2>
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

export default DriverDashboard;
