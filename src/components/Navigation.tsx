import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Zap, 
  FileText, 
  Users, 
  Building2, 
  Settings, 
  ClipboardList, 
  BookOpen, 
  User, 
  LogOut 
} from 'lucide-react';

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
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'workarea', label: 'Work Area', icon: Zap },
    ];

    if (userRole === 'Admin') {
      return [
        ...baseItems,
        { id: 'orders', label: 'Order Entry', icon: FileText },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'clients', label: 'Client Management', icon: Building2 },
        { id: 'capabilities', label: 'Capabilities Management', icon: Settings },
        { id: 'order-types', label: 'Order Types Management', icon: ClipboardList },
      ];
    }
    
    else if (userRole === 'Supervisor') {
      return [
        ...baseItems,
        { id: 'orders', label: 'Order Entry', icon: FileText },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'clients', label: 'Client Management', icon: Building2 },
        { id: 'steps-library', label: 'Steps Library Management', icon: BookOpen },
      ];
    }
    else {
      return [
        ...baseItems,
        { id: 'queue', label: 'My Queue', icon: ClipboardList },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 text-white transform ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } transition-transform duration-300 ease-in-out ${isMobile ? '' : 'relative translate-x-0'} shadow-xl border-r border-slate-700`}>
      <div className="p-6 h-full bg-slate-900 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-white">Swajay Workflow</h1>
          </div>
        </div>
        
        <nav className="flex-1">
          <ul className="space-y-1">
            {getMenuItems().map((item) => (
              <li key={item.id} className="w-full">
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
                  className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group text-left ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${
                    currentView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`} />
                  <span className="font-medium text-left whitespace-nowrap">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-slate-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 text-slate-300 hover:bg-red-600 hover:text-white group text-left"
          >
            <LogOut className="w-5 h-5 mr-3 text-slate-400 group-hover:text-white flex-shrink-0" />
            <span className="font-medium text-left whitespace-nowrap">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;