import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import LoginForm from '@/components/LoginForm';
import Navigation from '@/components/Navigation';
import OrderTypeStepsMapping from '@/components/OrderTypeStepsMapping';

const OrderTypeStepsMappingPage: React.FC = () => {
  const { sidebarOpen, toggleSidebar, currentView, setCurrentView } = useAppContext();
  const { user, logout, isLoading, setResetViewCallback } = useAuth();
  const isMobile = useIsMobile();

  // Register reset callback to reset view to dashboard on logout
  React.useEffect(() => {
    setResetViewCallback(() => () => setCurrentView('dashboard'));
  }, [setResetViewCallback, setCurrentView]);

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

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Navigation
        isMobile={isMobile}
        sidebarOpen={sidebarOpen}
        onViewChange={setCurrentView}
        userRole={user.role}
        username={user.username}
        onLogout={logout}
        currentView="order-types"
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Order Type Steps Mapping</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.username} ({user.role})</span>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <OrderTypeStepsMapping />
        </main>
      </div>
    </div>
  );
};

export default OrderTypeStepsMappingPage;
