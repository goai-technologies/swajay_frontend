import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Order {
  id: string;
  client_id: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  assigned_to: string;
  order_type?: string;
}

interface OrdersResponse {
  data: {
    items: Order[];
    pagination: {
      current_page: number;
      page_size: number;
      total_count: number;
      total_pages: number;
    };
  };
  message: string;
  success: boolean;
}

interface DashboardProps {
  userRole: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { axiosInstance, token, user } = useAuth();


  useEffect(() => {
    if (token && user) {
      fetchOrders();
    }
  }, [token, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching orders...');
      console.log('🔑 Using token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
      
      if (!token) {
        setError('No authentication token available');
        return;
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      
      console.log('📤 Request headers:', headers);
      console.log('📤 Request URL:', 'http://localhost:5001/orders?page=1&page_size=50');
      
      // Use direct fetch call with corrected headers
      const response = await fetch('http://localhost:5001/orders?page=1&page_size=50', {
        method: 'GET',
        headers: headers,
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error text:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📡 Orders API Response:', data);
      
      if (data.success) {
        setOrders(data.data.items);
        console.log('✅ Orders loaded successfully:', data.data.items.length, 'orders');
      } else {
        console.error('❌ API returned success: false');
        setError('Failed to fetch orders: ' + data.message);
      }
    } catch (err: any) {
      console.error('❌ Error fetching orders:', err);
      console.error('❌ Error message:', err.message);
      setError('Failed to fetch orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const totalOrders = orders.length;
    const inProgress = orders.filter(order => order.status === 'In Progress').length;
    const completed = orders.filter(order => order.status === 'Completed').length;
    const onHold = orders.filter(order => order.status === 'On Hold').length;
    const newOrders = orders.filter(order => order.status === 'New').length;

    return [
      { title: 'Total Orders', value: totalOrders.toString(), change: '+12%', color: 'blue' },
      { title: 'Work in Progress', value: inProgress.toString(), change: '+5%', color: 'orange' },
      { title: 'Completed', value: completed.toString(), change: '+18%', color: 'green' },
      { title: 'On Hold', value: onHold.toString(), change: '-25%', color: 'red' },
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'New':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Rush':
        return 'bg-red-100 text-red-800';
      case 'Normal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const metrics = calculateMetrics();
  const recentOrders = orders.slice(0, 10); // Show first 10 orders

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Loading your workflow overview...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-lg shadow-sm animate-pulse">
          <div className="p-6 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your workflow overview.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your workflow overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-slate-800">{metric.value}</p>
              </div>
              <div className={`text-sm font-medium ${
                metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">Recent Orders</h2>
          <button
            onClick={fetchOrders}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600" title={order.client_id}>
                      {order.client_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.order_type || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;