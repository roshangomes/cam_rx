import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  LayoutDashboard,
  Camera,
  Calendar,
  User,
  Settings,
  BarChart3,
  Film,
  Users,
  Shield,
  Package,
  FileText,
  Clapperboard,
  Box,
  MapPin,
  Fuel,
  Navigation,
  UserCog,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

// Producer main menu items (full access)
const producerMainItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Film Equipment', url: '/inventory', icon: Camera },
  { title: 'Rental Bookings', url: '/bookings', icon: Calendar },
  { title: 'Active Rentals', url: '/orders', icon: Film },
  { title: 'Reports & Analytics', url: '/analytics', icon: BarChart3 },
];

// Vendor main menu items (user management focus)
const vendorMainItems = [
  { title: 'Dashboard', url: '/vendor/dashboard', icon: LayoutDashboard },
  { title: 'Film Equipment', url: '/vendor/inventory', icon: Camera },
  { title: 'RFQ Management', url: '/vendor/rfq', icon: FileText },
  { title: 'Photo Verification', url: '/vendor/photo-verification', icon: Shield },
  { title: 'Expendables', url: '/vendor/expendables', icon: Box },
  { title: 'Service Personnel', url: '/vendor/service-personnel', icon: UserCog },
];

const cameraDeptItems = [
  { title: 'Asset Handover', url: '/asset-handover', icon: Package },
  { title: 'RFQ Management', url: '/rfq', icon: FileText },
  { title: 'Camera Reports', url: '/camera-reports', icon: Clapperboard },
  { title: 'Expendables', url: '/expendables', icon: Box },
];

const transportItems = [
  { title: 'Trip Logger', url: '/trip-logger', icon: Navigation },
  { title: 'Fuel Entry', url: '/fuel-entry', icon: Fuel },
  { title: 'Geofence', url: '/geofence', icon: MapPin },
];

const operationsItems = [
  { title: 'Service Personnel', url: '/service-personnel', icon: Users },
  { title: 'Photo Verification', url: '/photo-verification', icon: Shield },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const collapsed = state === 'collapsed';

  const userRole = user?.role;

  // Role-based access flags
  const isProducer = ['producer', 'admin'].includes(userRole || '');
  const isVendor = userRole === 'vendor';
  const canAccessCamera = ['producer', 'admin', 'camera_crew'].includes(userRole || '');
  const canAccessTransport = ['producer', 'admin', 'driver'].includes(userRole || '');

  const isActive = (path: string) => location.pathname === path;

  const getLinkClasses = (path: string) => {
    const baseClasses = "flex items-center w-full transition-smooth rounded-lg";
    return isActive(path)
      ? `${baseClasses} bg-primary text-primary-foreground shadow-primary`
      : `${baseClasses} text-muted-foreground hover:text-foreground hover:bg-accent`;
  };

  // Settings items differ by role
  const settingsItems = isVendor
    ? [
        { title: 'Profile', url: '/vendor/profile', icon: User },
        { title: 'Settings', url: '/vendor/settings', icon: Settings },
      ]
    : [
        { title: 'Profile', url: '/profile', icon: User },
        { title: 'Settings', url: '/settings', icon: Settings },
      ];

  const renderMenuGroup = (label: string, items: typeof producerMainItems, className?: string) => (
    <SidebarGroup className={className}>
      <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} className={getLinkClasses(item.url)}>
                  <item.icon className="w-5 h-5" />
                  {!collapsed && <span className="ml-3">{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar className={`${collapsed ? 'w-18' : 'w-64'} bg-card border-r border-border shadow-soft transition-smooth`}>
      <SidebarContent className="p-4">
        {/* Logo */}
        <div className="mb-8 px-2">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Film className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">FilmGear Pro</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
              <Film className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* Producer: Full main navigation with reports */}
        {isProducer && renderMenuGroup('Main', producerMainItems)}

        {/* Vendor: User management navigation */}
        {isVendor && renderMenuGroup('Main', vendorMainItems)}

        {/* Camera Department - Producer & camera_crew only */}
        {canAccessCamera && renderMenuGroup('Camera Dept', cameraDeptItems, 'mt-6')}

        {/* Transport - Producer & driver only */}
        {canAccessTransport && renderMenuGroup('Transport', transportItems, 'mt-6')}

        {/* Operations - Producer only */}
        {isProducer && renderMenuGroup('Operations', operationsItems, 'mt-6')}

        {/* Settings */}
        {renderMenuGroup('Settings', settingsItems, 'mt-6')}
      </SidebarContent>
    </Sidebar>
  );
}
