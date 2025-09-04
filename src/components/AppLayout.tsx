import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import LoginForm from './LoginForm';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import MyQueue from './MyQueue';
import OrderEntry from './OrderEntry';
import UserManagement from './UserManagement';
import ClientManagement from './ClientManagement';
import WorkArea from './WorkArea';
import Profile from './Profile';

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar, currentView, setCurrentView } = useAppContext();
  const { user, logout, isLoading } = useAuth();
  const isMobile = useIsMobile();





  // Show loading state during authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    if (!user) return null;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard userRole={user.role} />;
      case 'workarea':
        return <WorkArea />;
      case 'queue':
        return <MyQueue />;
      case 'orders':
        return <OrderEntry />;
      case 'users':
        return <UserManagement />;
      case 'clients':
        return <ClientManagement />;
      case 'profile':
        return <Profile />;
      default:
        // Default view should be dashboard for all users now
        return <Dashboard userRole={user.role} />;
    }
  };

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Navigation 
        isMobile={isMobile} 
        sidebarOpen={sidebarOpen} 
        onViewChange={handleViewChange}
        userRole={user.role}
        username={user.username}
        onLogout={logout}
        currentView={currentView}
      />

      {/* Main Content Area */}
      <main className={`flex-1 bg-gray-100 transition-all duration-300 ease-in-out ${sidebarOpen && !isMobile ? 'ml-64' : ''}`}>
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default AppLayout;