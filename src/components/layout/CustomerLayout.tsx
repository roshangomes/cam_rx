import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CustomerSidebar } from './CustomerSidebar';
import { CustomerTopNavigation } from './CustomerTopNavigation';

export const CustomerLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background">
        {/* Top Navigation */}
        <CustomerTopNavigation />
        
        <div className="flex w-full">
          {/* Sidebar */}
          <CustomerSidebar />
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};