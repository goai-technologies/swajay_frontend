import React, { useState, useEffect } from 'react';
import { ORDER_TYPES, ORDER_TYPE_DESCRIPTIONS } from '@/constants/orderTypes';
import { US_STATES } from '@/constants/states';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { MultiSelect } from '@/components/ui/multi-select';
import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';

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
    clientOrderNumber: '',
    propertyAddressLine1: '',
    propertyAddressLine2: '',
    city: '',
    states: [] as string[],
    zipCode: '',
    county: '',
    ownerName: '',
    onlineGround: 'Online',
    rushFile: 'No',
    folderLink: '',
    comments: ''
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const { setCurrentView } = useAppContext();

  // Convert US_STATES to MultiSelectOption format
  const stateOptions = US_STATES.map(state => ({
    value: state.value,
    label: state.label,
    abbreviation: state.abbreviation
  }));

  useEffect(() => {
    if (token) {
      fetchClients();
    }
  }, [token]);

  const fetchClients = async () => {
    try {
      setClientsLoading(true);
      setClientsError(null);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CLIENTS}?page=1&page_size=50`, {
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

    // Validate required fields
    const requiredFields = [
      { field: 'client', name: 'Client' },
      { field: 'orderType', name: 'Order Type' },
      { field: 'clientOrderNumber', name: 'Client Order Number' },
      { field: 'ownerName', name: 'Owner Name' },
      { field: 'propertyAddressLine1', name: 'Property Address Line 1' },
      { field: 'city', name: 'City' },
      { field: 'states', name: 'States' },
      { field: 'county', name: 'County' }
    ];

    const missingFields = requiredFields.filter(({ field }) => {
      const value = formData[field as keyof typeof formData];
      if (field === 'states') {
        return !Array.isArray(value) || value.length === 0;
      }
      return !value;
    });
    
    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in the following required fields: ${missingFields.map(f => f.name).join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare the order data according to the updated API specification
      const orderData = {
        client_id: formData.client,
        order_type: formData.orderType,
        client_order_number: formData.clientOrderNumber,
        owner_name: formData.ownerName,
        property_address_line1: formData.propertyAddressLine1,
        property_address_line2: formData.propertyAddressLine2,
        city: formData.city,
        county: formData.county,
        states: formData.states,
        zip_code: formData.zipCode,
        online_ground: formData.onlineGround,
        rush_file: formData.rushFile,
        folder_link: formData.folderLink,
        comments: formData.comments
      };


      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ORDERS}`, {
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
          description: `Order ${formData.clientOrderNumber} created successfully!`,
        });

        // Reset form
        setFormData({
          client: '',
          orderType: '',
          clientOrderNumber: '',
          propertyAddressLine1: '',
          propertyAddressLine2: '',
          city: '',
          states: [],
          zipCode: '',
          county: '',
          ownerName: '',
          onlineGround: 'Online',
          rushFile: 'No',
          folderLink: '',
          comments: ''
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
    <div className="p-6 bg-gray-50 min-h-screen">
      
      {/* Header with clear */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-800">Order Entry</h1>
        </div>
        <button 
          type="button" 
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          onClick={() => setFormData({
            client: '',
            orderType: '',
            clientOrderNumber: '',
            propertyAddressLine1: '',
            propertyAddressLine2: '',
            city: '',
            states: [],
            zipCode: '',
            county: '',
            ownerName: '',
            onlineGround: 'Online',
            rushFile: 'No',
            folderLink: '',
            comments: ''
          })}
        >
          <span>Clear All</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Row: Client Order Number, Order Type, Clients, Prop Address Line 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Client Order Number *
              </label>
              <input
                type="text"
                value={formData.clientOrderNumber}
                onChange={(e) => handleInputChange('clientOrderNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
                </svg>
                Order Type *
              </label>
              <select
                value={formData.orderType}
                onChange={(e) => handleInputChange('orderType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Order Type</option>
                {[...ORDER_TYPES].sort().map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                Clients *
              </label>
              <select
                value={formData.client}
                onChange={(e) => handleInputChange('client', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={clientsLoading}
              >
                <option value="">
                  {clientsLoading ? 'Loading...' : 'Clients'}
                </option>
                {clients.sort((a, b) => a.name.localeCompare(b.name)).map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                Prop Address Line 1 *
              </label>
              <input
                type="text"
                value={formData.propertyAddressLine1}
                onChange={(e) => handleInputChange('propertyAddressLine1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Second Row: Prop Address Line 2, City, State, Zip Code */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                Prop Address Line 2
              </label>
              <input
                type="text"
                value={formData.propertyAddressLine2}
                onChange={(e) => handleInputChange('propertyAddressLine2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                Select States *
              </label>
              <MultiSelect
                options={stateOptions}
                selected={formData.states}
                onChange={(selected) => setFormData(prev => ({ ...prev, states: selected }))}
                placeholder="Select states..."
                showAbbreviation={true}
                maxDisplay={3}
                className="w-full"
                showSelectAll={true}
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                Zip Code
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Third Row: County, Owner Name, Online/Ground, Rush File */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                County *
              </label>
              <input
                type="text"
                value={formData.county}
                onChange={(e) => handleInputChange('county', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                Owner Name *
              </label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
                </svg>
                Online/Ground
              </label>
              <select
                value={formData.onlineGround}
                onChange={(e) => handleInputChange('onlineGround', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Online">Online</option>
                <option value="Ground">Ground</option>
              </select>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                Rush File
              </label>
              <select
                value={formData.rushFile}
                onChange={(e) => handleInputChange('rushFile', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {/* Folder Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Folder Link
            </label>
            <input
              type="url"
              value={formData.folderLink}
              onChange={(e) => handleInputChange('folderLink', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          {/* Comments Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Enter any additional comments or notes..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting || clientsLoading}
              className="flex-1 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isSubmitting ? 'Creating...' : 'Submit Order Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderEntry;