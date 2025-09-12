import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import OrderLogDialog from './OrderLogDialog';

interface Order {
  id: string;
  client_id: string;
  client_name?: string;
  file_number?: string;
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
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [clients, setClients] = useState<{[key: string]: string}>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const { axiosInstance, token, user } = useAuth();


  useEffect(() => {
    if (token && user) {
      fetchClients();
      fetchOrders();
    }
  }, [token, user]);

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:5001/clients?page=1&page_size=100', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.items) {
          const clientMap: {[key: string]: string} = {};
          data.data.items.forEach((client: any) => {
            clientMap[client.id] = client.name;
          });
          setClients(clientMap);
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchOrders = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setError('No authentication token available');
        return;
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      
      // Use direct fetch call with corrected headers
      const response = await fetch(`http://localhost:5001/orders?page=${page}&page_size=10`, {
        method: 'GET',
        headers: headers,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data.items);
        setTotalPages(data.data.pagination.total_pages);
        setTotalOrders(data.data.pagination.total_count);
      } else {
        setError('Failed to fetch orders: ' + data.message);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const inProgress = orders.filter(order => order.status === 'In Progress').length;
    const completed = orders.filter(order => order.status === 'Completed').length;
    const onHold = orders.filter(order => order.status === 'On Hold').length;
    const newOrders = orders.filter(order => order.status === 'New').length;

    return [
      { title: 'Total Orders', value: totalOrders.toString(), change: null as string | null, color: 'blue' },
      { title: 'Work in Progress', value: inProgress.toString(), change: null as string | null, color: 'orange' },
      { title: 'Completed', value: completed.toString(), change: null as string | null, color: 'green' },
      { title: 'On Hold', value: onHold.toString(), change: null as string | null, color: 'red' },
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

  const handleViewLog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsLogDialogOpen(true);
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 h-full overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
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
      <div className="p-6 bg-gray-100 h-full overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
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
    <div className="p-6 bg-gray-100 h-full overflow-y-auto">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <button
          onClick={() => {
            fetchClients();
            fetchOrders(currentPage);
          }}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-slate-800">{metric.value}</p>
              </div>
              {metric.change && (
                <div className={`text-sm font-medium ${
                  metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-slate-800">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {order.file_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {clients[order.client_id] || 'Loading...'}
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
                    <td className="px-6 py-4">
                      <Button
                        onClick={() => handleViewLog(order.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Log</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalOrders)} of {totalOrders} orders
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                    fetchOrders(currentPage - 1);
                  }
                }}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1);
                    fetchOrders(currentPage + 1);
                  }
                }}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
      {selectedOrderId && (
        <OrderLogDialog
          orderId={selectedOrderId}
          open={isLogDialogOpen}
          onOpenChange={setIsLogDialogOpen}
        />
      )}
    </div>
  );
};

export default Dashboard;