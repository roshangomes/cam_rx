import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { TopNavigation } from './TopNavigation';

export const DashboardLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background">
        {/* Top Navigation */}
        <TopNavigation />
        
        <div className="flex w-full">
          {/* Sidebar */}
          <AppSidebar />
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};