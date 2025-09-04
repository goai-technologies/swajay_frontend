import React from 'react';

interface NavigationProps {
  isMobile: boolean;
  sidebarOpen: boolean;
  onViewChange: (view: string) => void;
  userRole: string;
  username: string;
  onLogout: () => void;
  currentView: string;
}

const Navigation: React.FC<NavigationProps> = ({ isMobile, sidebarOpen, onViewChange, userRole, username, onLogout, currentView }) => {
  const getMenuItems = () => {
    if (userRole === 'Admin' || userRole === 'Supervisor') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'orders', label: 'Order Entry', icon: '📝' },
        { id: 'users', label: 'User Management', icon: '👥' },
        { id: 'clients', label: 'Client Management', icon: '🏢' },
      ];
    } else {
      return [
        { id: 'queue', label: 'My Queue', icon: '📋' },
        { id: 'profile', label: 'Profile', icon: '👤' },
      ];
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white transform ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } transition-transform duration-300 ease-in-out ${isMobile ? '' : 'relative translate-x-0'}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Swajay Workflow</h1>
          <div className="text-sm">
            <span className="text-gray-300">{userRole}</span>
            <br />
            <span>{username}</span>
          </div>
        </div>
        
        <ul className="space-y-2">
          {getMenuItems().map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        
        <div className="mt-8">
          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2 rounded-md transition-colors hover:bg-red-600"
          >
            <span className="mr-2">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;