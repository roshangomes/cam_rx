import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Camera, 
  FileText, 
  Package, 
  ClipboardList,
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

const CameraModulePage: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { rfqs } = useSelector((state: RootState) => state.cameraDepartment);

  // Validate vendorId matches authenticated user
  if (!isAuthenticated || !user) {
    return <Navigate to="/vendor/login" replace />;
  }

  if (vendorId !== user.id) {
    return <Navigate to="/vendor/login" replace />;
  }

  // Filter RFQs for this vendor
  const pendingRfqs = rfqs.filter(rfq => rfq.status === 'pending').length;

  const moduleFeatures = [
    {
      title: 'Asset Handover',
      description: 'Digital manifesto for gear verification with swipe-to-confirm',
      icon: ClipboardList,
      href: '/asset-handover',
      count: 3,
      countLabel: 'Active',
      color: 'text-blue-500',
    },
    {
      title: 'RFQ Management',
      description: 'Review and respond to equipment quote requests',
      icon: FileText,
      href: '/rfq',
      count: pendingRfqs,
      countLabel: 'Pending',
      color: 'text-amber-500',
    },
    {
      title: 'Camera Reports',
      description: 'Digital camera reports with scene/shot/take metadata',
      icon: Camera,
      href: '/camera-reports',
      count: 12,
      countLabel: 'This Week',
      color: 'text-green-500',
    },
    {
      title: 'Expendables Tracker',
      description: 'Monitor consumable inventory with low-stock alerts',
      icon: Package,
      href: '/expendables',
      count: 2,
      countLabel: 'Low Stock',
      color: 'text-red-500',
    },
  ];

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
            <BreadcrumbPage>Camera Module</BreadcrumbPage>
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
              <Camera className="h-8 w-8 text-primary" />
              Camera Department
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage camera equipment, handovers, and production reports
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          Vendor: {user.name}
        </Badge>
      </div>

      {/* Module Features Grid */}
      <div className="grid gap-4 md:grid-cols-2">
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

      {/* Recent Activity */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Recent Camera Activity</CardTitle>
          <CardDescription>Latest updates from your camera department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Asset handover completed', item: 'Canon EOS R5 Kit', time: '2 hours ago', status: 'success' },
              { action: 'New RFQ received', item: 'Sony FX6 + Lenses', time: '4 hours ago', status: 'pending' },
              { action: 'Camera report submitted', item: 'Scene 12, Take 3', time: '6 hours ago', status: 'info' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.item}</p>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={activity.status === 'success' ? 'default' : activity.status === 'pending' ? 'secondary' : 'outline'}
                  >
                    {activity.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraModulePage;
