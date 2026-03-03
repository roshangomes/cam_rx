import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Truck, 
  Fuel, 
  MapPin,
  Route,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { RootState } from '@/store/store';

const TransportModulePage: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { trips, fuelEntries, outstationTriggers } = useSelector((state: RootState) => state.transportLogistics);

  // Validate vendorId matches authenticated user
  if (!isAuthenticated || !user) {
    return <Navigate to="/vendor/login" replace />;
  }

  if (vendorId !== user.id) {
    return <Navigate to="/vendor/login" replace />;
  }

  // Filter data for this vendor
  const vendorTrips = trips.filter(trip => trip.driverId === user.id || !trip.driverId);
  const activeTrips = vendorTrips.filter(trip => trip.status === 'active').length;
  const flaggedFuelEntries = fuelEntries.filter(entry => entry.flaggedAsFraud).length;

  const moduleFeatures = [
    {
      title: 'Trip Logger',
      description: 'GPS-verified trip logging with odometer validation',
      icon: Route,
      href: '/trip-logger',
      count: activeTrips,
      countLabel: 'Active Trips',
      color: 'text-blue-500',
    },
    {
      title: 'Fuel Entry',
      description: 'Fuel consumption tracking with fraud detection',
      icon: Fuel,
      href: '/fuel-entry',
      count: flaggedFuelEntries,
      countLabel: 'Flagged',
      color: 'text-amber-500',
    },
    {
      title: 'Geofence Monitor',
      description: 'Automated outstation allowance triggers',
      icon: MapPin,
      href: '/geofence',
      count: outstationTriggers.length,
      countLabel: 'Alerts',
      color: 'text-green-500',
    },
  ];

  // Calculate stats using correct property names
  const totalKm = vendorTrips.reduce((acc, trip) => {
    if (trip.distanceKm) {
      return acc + trip.distanceKm;
    }
    return acc;
  }, 0);

  const totalFuel = fuelEntries.reduce((acc, entry) => acc + entry.volume, 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard">Vendor Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Transport Module</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Truck className="h-8 w-8 text-primary" />
              Transport & Logistics
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage vehicles, trips, fuel consumption, and geofencing
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          Vendor: {user.name}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{totalKm.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Kilometers</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{totalFuel.toFixed(1)}L</p>
              <p className="text-sm text-muted-foreground">Total Fuel Consumed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {totalFuel > 0 ? (totalKm / totalFuel).toFixed(1) : '0'} km/L
              </p>
              <p className="text-sm text-muted-foreground">Average Efficiency</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Features Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {moduleFeatures.map((feature) => (
          <Card 
            key={feature.title} 
            className="shadow-soft hover:shadow-md transition-shadow cursor-pointer group"
          >
            <Link to={feature.href}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-muted ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {feature.count} {feature.countLabel}
                  </Badge>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Recent Trips */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Recent Transport Activity</CardTitle>
          <CardDescription>Latest trips and fuel entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vendorTrips.slice(0, 3).map((trip, index) => (
              <div key={trip.id || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">{trip.vehicleName}</p>
                  <p className="text-sm text-muted-foreground">
                    Started: {new Date(trip.startTimestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={trip.status === 'completed' ? 'default' : 'secondary'}
                  >
                    {trip.status}
                  </Badge>
                  {trip.distanceKm && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {trip.distanceKm} km
                    </p>
                  )}
                </div>
              </div>
            ))}
            {vendorTrips.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No trips recorded yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransportModulePage;
