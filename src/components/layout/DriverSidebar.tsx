import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Route, 
  Fuel, 
  MapPin, 
  User,
  LogOut,
  Truck
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
import { useAuth } from '@/hooks/useAuth';

const driverMenuItems = [
  { title: 'Trip Logger', url: '/driver/trips', icon: Route },
  { title: 'Fuel Entry', url: '/driver/fuel', icon: Fuel },
  { title: 'Geofence Status', url: '/driver/geofence', icon: MapPin },
];

const settingsItems = [
  { title: 'Profile', url: '/driver/profile', icon: User },
];

export function DriverSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { logout } = useAuth();
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => location.pathname === path;

  const getLinkClasses = (path: string) => {
    const baseClasses = 'flex items-center gap-3 rounded-lg px-3 py-3 transition-all min-h-[48px]';
    if (isActive(path)) {
      return `${baseClasses} bg-primary text-primary-foreground font-medium`;
    }
    return `${baseClasses} text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`;
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="p-4">
        {/* Logo */}
        {!collapsed && (
          <div className="mb-6 flex items-center gap-2 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">ProdSync</h1>
              <p className="text-xs text-muted-foreground">Driver Portal</p>
            </div>
          </div>
        )}

        {/* Transport Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {!collapsed && 'Transport'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {driverMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getLinkClasses(item.url)}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {!collapsed && 'Settings'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getLinkClasses(item.url)}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-destructive hover:bg-destructive/10 min-h-[48px]"
                  >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
