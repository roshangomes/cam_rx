import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { 
  Route, 
  Fuel, 
  MapPin, 
  User,
  ClipboardList,
  FileText,
  Package,
  Camera,
  Home,
  LayoutDashboard,
  UserCog,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const driverNavItems = [
  { title: 'Trips', url: '/driver/trips', icon: Route },
  { title: 'Fuel', url: '/driver/fuel', icon: Fuel },
  { title: 'Geofence', url: '/driver/geofence', icon: MapPin },
  { title: 'Profile', url: '/driver/profile', icon: User },
];

const crewNavItems = [
  { title: 'Handover', url: '/crew/handover', icon: ClipboardList },
  { title: 'Reports', url: '/crew/reports', icon: FileText },
  { title: 'Stock', url: '/crew/expendables', icon: Package },
  { title: 'RFQ', url: '/crew/rfq', icon: Camera },
];

const producerNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'Reports', url: '/analytics', icon: BarChart3 },
  { title: 'Profile', url: '/profile', icon: User },
];

const vendorNavItems = [
  { title: 'Dashboard', url: '/vendor/dashboard', icon: LayoutDashboard },
  { title: 'Team', url: '/vendor/service-personnel', icon: UserCog },
  { title: 'Profile', url: '/vendor/profile', icon: User },
];

const customerNavItems = [
  { title: 'Browse', url: '/customer/browse', icon: Camera },
  { title: 'Bookings', url: '/customer/bookings', icon: ClipboardList },
  { title: 'Favorites', url: '/customer/favorites', icon: Home },
  { title: 'Profile', url: '/customer/profile', icon: User },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const getNavItems = () => {
    switch (user?.role) {
      case 'driver':
        return driverNavItems;
      case 'camera_crew':
        return crewNavItems;
      case 'customer':
        return customerNavItems;
      case 'vendor':
        return vendorNavItems;
      case 'producer':
      case 'admin':
        return producerNavItems;
      default:
        return producerNavItems;
    }
  };

  const navItems = getNavItems();
  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors min-h-[56px]',
              isActive(item.url)
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className={cn(
              'h-5 w-5 transition-transform',
              isActive(item.url) && 'scale-110'
            )} />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
