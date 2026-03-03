import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  Users,
  Film,
  Truck,
  ChevronRight,
  Download,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { RootState } from '@/store/store';
import { toast } from 'sonner';

const stats = [
  { title: 'Film Equipment', value: '127', change: '+8%', icon: Camera },
  { title: 'Active Rentals', value: '24', change: '+12%', icon: Film },
  { title: 'Monthly Revenue', value: '₹1,85,430', change: '+28%', icon: DollarSign },
  { title: 'Equipment Utilization', value: '78%', change: '+6%', icon: TrendingUp },
];

const departmentSummary = [
  { name: 'Camera Department', activeUsers: 12, equipment: 45, utilization: '82%' },
  { name: 'Transport & Logistics', activeUsers: 8, equipment: 15, utilization: '74%' },
  { name: 'Lighting', activeUsers: 5, equipment: 28, utilization: '68%' },
  { name: 'Audio', activeUsers: 3, equipment: 12, utilization: '91%' },
];

const recentBookings = [
  { id: '1', equipment: 'Canon EOS R5 + RF 24-70mm', customer: 'Mumbai Film Productions', date: '2024-01-15', status: 'confirmed' as const, amount: '₹18,500' },
  { id: '2', equipment: 'ARRI SkyPanel S60-C Kit', customer: 'Creative Studios Delhi', date: '2024-01-16', status: 'pending' as const, amount: '₹13,500' },
  { id: '3', equipment: 'Sony FX30 + DJI Ronin RS3', customer: 'Bangalore Documentary Co.', date: '2024-01-17', status: 'completed' as const, amount: '₹28,000' },
];

const alerts = [
  { id: '1', message: 'Canon RF 85mm lens needs cleaning service', type: 'warning' as const, time: '2 hours ago' },
  { id: '2', message: 'New rental request for Sony A7S III camera', type: 'info' as const, time: '4 hours ago' },
  { id: '3', message: 'Payment received from Mumbai Film Productions', type: 'success' as const, time: '6 hours ago' },
];

export const DashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { bookings } = useSelector((state: RootState) => state.bookings);
  const navigate = useNavigate();

  const activeRentalsCount = bookings.filter(
    b => b.status === 'confirmed' || b.status === 'pending'
  ).length;

  const handleExport = (format: string) => {
    toast.success(`Generating ${format.toUpperCase()} report...`);
    setTimeout(() => {
      toast.success(`${format.toUpperCase()} report downloaded successfully`);
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-success text-success-foreground">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-primary text-primary-foreground">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Clock className="w-4 h-4 text-primary" />;
    }
  };

  const modules = [
    { id: 'camera', title: 'Camera Department', description: 'Asset handovers, RFQs, camera reports, and expendables', icon: Camera, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { id: 'transport', title: 'Transport & Logistics', description: 'Trip logging, fuel entries, and geofence monitoring', icon: Truck, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  ];

  const handleModuleClick = (moduleId: string) => {
    if (user?.id) {
      navigate(`/vendor/${user.id}/${moduleId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Report Generation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.name || 'Producer'}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening across all departments today.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="gradient" className="shadow-primary">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <FileText className="w-4 h-4 mr-2" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Department Summary - Producer Only */}
      <Card className="shadow-soft bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Department Overview
          </CardTitle>
          <CardDescription>Summary of all departments and active users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {departmentSummary.map((dept) => (
              <div key={dept.name} className="p-4 rounded-lg bg-background shadow-soft">
                <p className="font-medium text-foreground text-sm">{dept.name}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Active Users: <span className="font-semibold text-foreground">{dept.activeUsers}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Equipment: <span className="font-semibold text-foreground">{dept.equipment}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Utilization: <span className="font-semibold text-success">{dept.utilization}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Module Navigation Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <Card 
            key={module.id}
            className="shadow-soft hover:shadow-md transition-all cursor-pointer group border-2 hover:border-primary/50"
            onClick={() => handleModuleClick(module.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${module.bgColor}`}>
                  <module.icon className={`h-6 w-6 ${module.color}`} />
                </div>
                <div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="mt-1">{module.description}</CardDescription>
                </div>
              </div>
              <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-soft bg-gradient-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.title === 'Active Rentals' ? activeRentalsCount : stat.value}
              </div>
              <p className="text-xs text-success">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Bookings */}
        <Card className="shadow-soft bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" />
              Recent Equipment Rentals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-background shadow-soft">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{booking.equipment}</p>
                    <p className="text-sm text-muted-foreground">{booking.customer}</p>
                    <p className="text-xs text-muted-foreground">{booking.date}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold text-foreground">{booking.amount}</p>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="shadow-soft bg-gradient-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Equipment Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-background shadow-soft">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-soft bg-gradient-card border-0">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="gradient" className="h-12" onClick={() => navigate('/inventory/add')}>
              <Camera className="w-4 h-4 mr-2" />
              Add Film Gear
            </Button>
            <Button variant="outline" className="h-12" onClick={() => navigate('/service-personnel')}>
              <Users className="w-4 h-4 mr-2" />
              Manage Team
            </Button>
            <Button variant="outline" className="h-12" onClick={() => navigate('/analytics')}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Full Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
