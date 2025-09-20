import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// Removed View Log button; rows are now clickable to open details
import OrderLogDialog from './OrderLogDialog';
import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';

// Filter interface
interface FilterState {
  fileNumber: string;
  clientName: string;
  orderType: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface Order {
  id: string;
  client_id: string;
  client_name?: string;
  file_number?: string;
  client_order_number?: string;
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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    fileNumber: '',
    clientName: '',
    orderType: '',
    status: '',
    startDate: '',
    endDate: ''
  });
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const { axiosInstance, token, user } = useAuth();


  useEffect(() => {
    if (token && user) {
      fetchClients();
      fetchOrders();
    }
  }, [token, user]);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    fetchOrders(1, filters);
  };

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters: FilterState = {
      fileNumber: '',
      clientName: '',
      orderType: '',
      status: '',
      startDate: '',
      endDate: ''
    };
    setFilters(emptyFilters);
    setCurrentPage(1);
    fetchOrders(1, emptyFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value.trim() !== '');
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CLIENTS}?page=1&page_size=100`, {
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

  const fetchOrders = async (page: number = 1, filterParams?: FilterState) => {
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
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: '10'
      });
      
      // Sorting params
      if (sortBy) {
        queryParams.append('sort_by', sortBy);
      }
      if (sortDir) {
        queryParams.append('sort_dir', sortDir);
      }
      
      // Add filter parameters if provided
      const activeFilters = filterParams || filters;
      if (activeFilters.fileNumber) {
        queryParams.append('file_number', activeFilters.fileNumber);
      }
      if (activeFilters.orderType) {
        queryParams.append('order_type', activeFilters.orderType);
      }
      if (activeFilters.status) {
        queryParams.append('status', activeFilters.status);
      }
      if (activeFilters.startDate) {
        const start = activeFilters.startDate.includes('T') ? activeFilters.startDate : `${activeFilters.startDate}T00:00:00`;
        queryParams.append('start_date', start);
      }
      if (activeFilters.endDate) {
        const end = activeFilters.endDate.includes('T') ? activeFilters.endDate : `${activeFilters.endDate}T23:59:59`;
        queryParams.append('end_date', end);
      }
      if (activeFilters.clientName) {
        // Find client ID by name
        const clientId = Object.keys(clients).find(id => 
          clients[id].toLowerCase().includes(activeFilters.clientName.toLowerCase())
        );
        if (clientId) {
          queryParams.append('client_id', clientId);
        }
      }
      
      // Use direct fetch call with corrected headers
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ORDERS}?${queryParams.toString()}`, {
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
              onClick={() => fetchOrders()}
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
    <div className="p-2 sm:p-4 lg:p-6 bg-gray-100 h-full overflow-y-auto">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => {
                const v = e.target.value;
                setSortBy(v);
                setCurrentPage(1);
                fetchOrders(1);
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none"
            >
              <option value="client_name">Client Name</option>
              <option value="order_type">Type</option>
              <option value="status">Status</option>
              <option value="created_at">Created</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => {
                const v = (e.target.value as 'asc' | 'desc');
                setSortDir(v);
                setCurrentPage(1);
                fetchOrders(1);
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
            {hasActiveFilters() && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">
                {Object.values(filters).filter(v => v.trim() !== '').length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setCurrentPage(1);
              fetchClients();
              fetchOrders(1, filters);
            }}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
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

      {/* Filter Section */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Filter Orders</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Clear All</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* File Number Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File/Client Order #
              </label>
              <input
                type="text"
                value={filters.fileNumber}
                onChange={(e) => handleFilterChange('fileNumber', e.target.value)}
                placeholder="Search by file or client order number..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Client Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </label>
              <input
                type="text"
                value={filters.clientName}
                onChange={(e) => handleFilterChange('clientName', e.target.value)}
                placeholder="Search by client name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Order Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Type
              </label>
              <select
                value={filters.orderType}
                onChange={(e) => handleFilterChange('orderType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="COS">COS</option>
                <option value="Commitment Review">Commitment Review</option>
                <option value="TOS">TOS</option>
                <option value="FS">FS</option>
                <option value="Document Retrieval">Document Retrieval</option>
                <option value="Update">Update</option>
                <option value="AVR">AVR</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-slate-800">Recent Orders</h2>
        </div>

        {/* Top Pagination Controls */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between text-sm text-gray-700">
          <div>
            Showing <span className="font-semibold text-blue-600">{((currentPage - 1) * 10) + 1}</span> to <span className="font-semibold text-blue-600">{Math.min(currentPage * 10, totalOrders)}</span> of <span className="font-semibold text-blue-600">{totalOrders}</span> orders
          </div>
          <div className="space-x-2">
            <button
              onClick={() => {
                if (currentPage > 1) {
                  const newPage = currentPage - 1;
                  setCurrentPage(newPage);
                  fetchOrders(newPage, filters);
                }
              }}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-2 border rounded-md">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => {
                if (currentPage < totalPages) {
                  const newPage = currentPage + 1;
                  setCurrentPage(newPage);
                  fetchOrders(newPage, filters);
                }
              }}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">File Number</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Client Order #</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Client Name</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Type</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Status</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Priority</th>
                <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase border-b border-gray-200">Created</th>
                {/* Actions column removed; click row to view details */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                    onClick={() => handleViewLog(order.id)}
                  >
                    <td className="px-2 sm:px-4 py-3 text-sm font-medium text-slate-800">
                      {order.file_number || 'N/A'}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-sm text-gray-600">
                      {order.client_order_number || 'N/A'}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-sm text-gray-600">
                      {clients[order.client_id] || 'Loading...'}
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-sm text-gray-600">
                      {order.order_type || 'N/A'}
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-2 sm:px-4 py-6 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Removed bottom pagination to keep a single top bar matching Users page */}
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