import React, { useState, useEffect } from 'react';
import { ORDER_TYPES, ORDER_TYPE_DESCRIPTIONS } from '@/constants/orderTypes';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface ClientsResponse {
  data: {
    items: Client[];
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

const OrderEntry: React.FC = () => {
  const [formData, setFormData] = useState({
    client: '',
    orderType: '',
    fileNumber: '',
    propertyAddress: '',
    county: '',
    state: '',
    borrowerName: '',
    isRush: false,
    sla: ''
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const { setCurrentView } = useAppContext();

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  useEffect(() => {
    if (token) {
      fetchClients();
    }
  }, [token]);

  const fetchClients = async () => {
    try {
      setClientsLoading(true);
      setClientsError(null);

      const response = await fetch('http://localhost:5001/clients?page=1&page_size=50', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ClientsResponse = await response.json();

      if (data.success) {
        setClients(data.data.items);
      } else {
        setClientsError('Failed to fetch clients: ' + data.message);
      }
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setClientsError('Failed to fetch clients: ' + err.message);
    } finally {
      setClientsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token not found. Please log in again.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare the order data according to the API specification
      const orderData = {
        client_id: formData.client,
        order_type: formData.orderType,
        file_number: formData.fileNumber,
        borrower_name: formData.borrowerName,
        property_address: formData.propertyAddress,
        county: formData.county,
        state: formData.state,
        rush_order: formData.isRush
      };

      console.log('Submitting order data:', orderData);

      const response = await fetch('http://localhost:5001/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: `Order ${formData.fileNumber} created successfully!`,
        });

        // Reset form
        setFormData({
          client: '',
          orderType: '',
          fileNumber: '',
          propertyAddress: '',
          county: '',
          state: '',
          borrowerName: '',
          isRush: false,
          sla: ''
        });

        // Navigate to dashboard or my queue after a short delay
        setTimeout(() => {
          setCurrentView('dashboard');
        }, 1500);

      } else {
        throw new Error(data.message || 'Failed to create order');
      }

    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getSelectedClient = () => {
    return clients.find(client => client.id === formData.client);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Order Entry</h1>
        <p className="text-gray-600">Create a new workflow order</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client *
            </label>
            {clientsError && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{clientsError}</p>
                <button
                  type="button"
                  onClick={fetchClients}
                  className="mt-1 text-xs text-red-700 underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}
            <select
              value={formData.client}
              onChange={(e) => handleInputChange('client', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
              disabled={clientsLoading}
            >
              <option value="">
                {clientsLoading ? 'Loading clients...' : 'Select Client'}
              </option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
            {clientsLoading && (
              <p className="mt-1 text-xs text-gray-500">Loading client data...</p>
            )}
            {formData.client && getSelectedClient() && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Selected Client Details:</h4>
                <div className="text-xs text-blue-800 space-y-1">
                  <p><strong>Name:</strong> {getSelectedClient()?.name}</p>
                  <p><strong>Email:</strong> {getSelectedClient()?.email}</p>
                  <p><strong>Phone:</strong> {getSelectedClient()?.phone}</p>
                  <p><strong>Address:</strong> {getSelectedClient()?.address}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Type *
            </label>
            <select
              value={formData.orderType}
              onChange={(e) => handleInputChange('orderType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Order Type</option>
              {ORDER_TYPES.map(type => (
                <option key={type} value={type}>
                  {type} - {ORDER_TYPE_DESCRIPTIONS[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Number *
            </label>
            <input
              type="text"
              value={formData.fileNumber}
              onChange={(e) => handleInputChange('fileNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="SW-2024-XXX"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Borrower Name *
            </label>
            <input
              type="text"
              value={formData.borrowerName}
              onChange={(e) => handleInputChange('borrowerName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Address *
            </label>
            <input
              type="text"
              value={formData.propertyAddress}
              onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              County *
            </label>
            <input
              type="text"
              value={formData.county}
              onChange={(e) => handleInputChange('county', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <select
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isRush}
                  onChange={(e) => handleInputChange('isRush', e.target.checked)}
                  className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Rush Order</span>
                {formData.isRush && (
                  <span className="ml-2 px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded-full">
                    RUSH
                  </span>
                )}
              </label>
            </div>
          </div>

          <div className="lg:col-span-2 flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || clientsLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isSubmitting ? 'Creating Order...' : 'Save Order'}</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setCurrentView('dashboard')}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderEntry;