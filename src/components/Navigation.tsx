import React from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'workarea', label: 'Work Area', icon: '⚡' },
    ];

    if (userRole === 'Admin') {
      return [
        ...baseItems,
        { id: 'orders', label: 'Order Entry', icon: '📝' },
        { id: 'users', label: 'User Management', icon: '👥' },
        { id: 'clients', label: 'Client Management', icon: '🏢' },
        { id: 'capabilities', label: 'Capabilities Management', icon: '🛠️' },
        { id: 'order-types', label: 'Order Types Management', icon: '📋' },
      ];
    }
    
    else if (userRole === 'Supervisor') {
      return [
        ...baseItems,
        { id: 'orders', label: 'Order Entry', icon: '📝' },
        { id: 'users', label: 'User Management', icon: '👥' },
        { id: 'clients', label: 'Client Management', icon: '🏢' },
        { id: 'steps-library', label: 'Steps Library Management', icon: '📚' },
      ];
    }
    else {
      return [
        ...baseItems,
        { id: 'queue', label: 'My Queue', icon: '📋' },
        { id: 'profile', label: 'Profile', icon: '👤' },
      ];
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 text-white transform ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } transition-transform duration-300 ease-in-out ${isMobile ? '' : 'relative translate-x-0'} shadow-lg`}>
      <div className="p-4 h-full bg-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Swajay Workflow</h1>
        </div>
        
        <ul className="space-y-2">
          {getMenuItems().map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  if (item.id === 'capabilities') {
                    navigate('/capabilities');
                  } else if (item.id === 'steps-library') {
                    navigate('/steps-library');
                  } else if (item.id === 'order-types') {
                    navigate('/order-types');
                  } else {
                    // All other views are handled within the dashboard
                    navigate(`/dashboard/${item.id}`);
                  }
                }}
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