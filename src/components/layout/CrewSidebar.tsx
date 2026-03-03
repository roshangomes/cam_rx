import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Camera, 
  FileText, 
  Package, 
  ClipboardList,
  User,
  LogOut,
  Film
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

const crewMenuItems = [
  { title: 'Asset Handover', url: '/crew/handover', icon: ClipboardList },
  { title: 'Camera Reports', url: '/crew/reports', icon: FileText },
  { title: 'Expendables', url: '/crew/expendables', icon: Package },
  { title: 'RFQ Request', url: '/crew/rfq', icon: Camera },
];

const settingsItems = [
  { title: 'Profile', url: '/crew/profile', icon: User },
];

export function CrewSidebar() {
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
              <Film className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">ProdSync</h1>
              <p className="text-xs text-muted-foreground">Camera Crew</p>
            </div>
          </div>
        )}

        {/* Camera Department Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {!collapsed && 'Camera Dept'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {crewMenuItems.map((item) => (
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
