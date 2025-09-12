import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
  const { user, logout, isLoading, setResetViewCallback } = useAuth();
  const isMobile = useIsMobile();
  const { view } = useParams<{ view: string }>();
  const location = useLocation();

  // Register reset callback to reset view to dashboard on logout
  React.useEffect(() => {
    setResetViewCallback(() => () => setCurrentView('dashboard'));
  }, [setResetViewCallback, setCurrentView]);

  // Handle URL-based view changes
  React.useEffect(() => {
    if (view) {
      setCurrentView(view);
    } else if (location.pathname === '/dashboard') {
      setCurrentView('dashboard');
    }
  }, [view, location.pathname, setCurrentView]);





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

    try {
      switch (currentView) {
        case 'dashboard':
          return <Dashboard userRole={user.user_type} />;
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
          return <Dashboard userRole={user.user_type} />;
      }
    } catch (error) {
      console.error('Error rendering current view:', error);
      return (
        <div className="p-6 bg-gray-100 h-full overflow-y-auto">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading View</h2>
            <p className="text-gray-600 mb-4">There was an error loading the {currentView} view.</p>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
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
        userRole={user.user_type}
        username={user.username}
        onLogout={logout}
        currentView={currentView}
      />

      {/* Main Content Area */}
      <main className={`flex-1 bg-gray-100 transition-all duration-300 ease-in-out ${sidebarOpen && !isMobile ? 'ml-80' : ''} overflow-hidden`}>
        {/* Welcome Message - Top Right */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex justify-end">
            <div className="text-sm text-gray-600">
              <span className="text-gray-500">Welcome, </span>
              <span className="font-medium">{user?.username}</span>
              <span className="text-gray-500 ml-2">({user?.user_type})</span>
            </div>
          </div>
        </div>
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default AppLayout;