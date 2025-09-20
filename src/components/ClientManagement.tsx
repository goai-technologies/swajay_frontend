import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

const ClientManagement: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { token } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const fetchClients = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '10'
      });
      if (search.trim()) params.append('search', search.trim());
      if (sortBy) params.append('sort_by', sortBy);
      if (sortDir) params.append('sort_dir', sortDir);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CLIENTS}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setClients(data.data.items);
        if (data.data.pagination) {
          setTotalPages(data.data.pagination.total_pages);
          setTotalClients(data.data.pagination.total_count);
        } else {
          // Fallback when backend doesn't return pagination
          setTotalPages(1);
          setTotalClients(data.data.items.length);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch clients');
      }
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch clients",
        variant: "destructive"
      });
      setClients([]);
      setTotalPages(1);
      setTotalClients(0);
    } finally {
      setIsLoading(false);
    }
  }, [token, search, sortBy, sortDir]);

  const hasActiveFilters = useCallback(() => {
    return [search.trim()].some(v => v && v.trim() !== '');
  }, [search]);

  const applyFilters = useCallback(() => {
    setCurrentPage(1);
    fetchClients(1);
  }, [fetchClients]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setSortBy('created_at');
    setSortDir('desc');
    setCurrentPage(1);
    fetchClients(1);
  }, [fetchClients]);

  const handleCreateClient = async (clientData: Partial<Client>) => {
    try {
      const sanitizedClientData = {
        ...clientData,
        phone: (clientData.phone || '').replace(/\D/g, ''),
      };
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CLIENTS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedClientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 422) {
          throw new Error('Invalid email format. Please enter a valid email address.');
        }
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Client created successfully"
        });
        
        fetchClients();
        setIsDialogOpen(false);
      } else {
        throw new Error(data.message || 'Failed to create client');
      }
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive"
      });
    }
  };

  const handleUpdateClient = async (clientData: Partial<Client>) => {
    if (!selectedClient) return;

    try {
      const sanitizedClientData = {
        ...clientData,
        phone: (clientData.phone || '').replace(/\D/g, ''),
      };
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CLIENT_BY_ID(selectedClient.id)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedClientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 422) {
          throw new Error('Invalid email format. Please enter a valid email address.');
        }
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Client updated successfully"
        });
        
        fetchClients();
        setIsDialogOpen(false);
        setSelectedClient(null);
      } else {
        throw new Error(data.message || 'Failed to update client');
      }
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update client",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (token) {
      fetchClients(1);
      setCurrentPage(1);
    }
  }, [token, fetchClients]);

  const ClientForm: React.FC<{ 
    client?: Client | null, 
    onSubmit: (clientData: Partial<Client>) => void,
    onCancel: () => void
  }> = ({ client, onSubmit, onCancel }) => {
    const [name, setName] = useState(client?.name || '');
    const [email, setEmail] = useState(client?.email || '');
    const [phone, setPhone] = useState(client?.phone || '');
    const [address, setAddress] = useState(client?.address || '');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({ name, email, phone, address });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter client name"
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter email address"
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <Input 
            value={phone} 
            onChange={(e) => {
              // Format phone number as user types
              let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
              if (value.length >= 6) {
                value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
              } else if (value.length >= 3) {
                value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
              }
              setPhone(value);
            }}
            placeholder="(555) 123-4567"
            maxLength={14}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <Input 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            placeholder="Enter full address"
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {client ? 'Save Changes' : 'Create Client'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Client Management</h1>
          <p className="text-gray-600 mt-1">Manage clients and their contact details</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
                fetchClients(1);
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none"
            >
              <option value="created_at">Created</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => {
                setSortDir(e.target.value as 'asc' | 'desc');
                setCurrentPage(1);
                fetchClients(1);
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
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
                {[search.trim()].filter(v => v && v.trim() !== '').length}
              </span>
            )}
          </button>
          <Button onClick={() => {
            setSortBy('created_at');
            setSortDir('desc');
            setCurrentPage(1);
            fetchClients(1);
          }}>Refresh</Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setSelectedClient(null);
                setIsDialogOpen(true);
              }}>
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedClient ? 'Edit Client' : 'Create New Client'}
                </DialogTitle>
              </DialogHeader>
              <ClientForm 
                client={selectedClient} 
                onSubmit={selectedClient ? handleUpdateClient : handleCreateClient}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setSelectedClient(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Filter Clients</h3>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, Email, Phone"
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
        <div className="p-4 border-b border-gray-200 flex items-center justify-between text-sm text-gray-700">
          <div>
            Showing <span className="font-semibold text-blue-600">{((currentPage - 1) * 10) + 1}</span> to <span className="font-semibold text-blue-600">{Math.min(currentPage * 10, totalClients)}</span> of <span className="font-semibold text-blue-600">{totalClients}</span> clients
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => {
                if (currentPage > 1) {
                  const newPage = currentPage - 1;
                  setCurrentPage(newPage);
                  fetchClients(newPage);
                }
              }}
            >
              Previous
            </Button>
            <span className="px-3 py-2 border rounded-md">Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => {
                if (currentPage < totalPages) {
                  const newPage = currentPage + 1;
                  setCurrentPage(newPage);
                  fetchClients(newPage);
                }
              }}
            >
              Next
            </Button>
          </div>
        </div>
        <div className="max-h-96 sm:max-h-[32rem] lg:max-h-[34rem] overflow-y-auto border border-gray-200 rounded-lg">
          <Table>
            <TableHeader className="sticky top-0 bg-white">
              <TableRow className="border-b border-gray-200">
                <TableHead className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</TableHead>
                <TableHead className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</TableHead>
                <TableHead className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</TableHead>
                <TableHead className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</TableHead>
                <TableHead className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-b border-gray-100">
                  <TableCell colSpan={5} className="px-2 sm:px-4 text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Loading clients...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : clients.length === 0 ? (
                <TableRow className="border-b border-gray-100">
                  <TableCell colSpan={5} className="px-2 sm:px-4 text-center py-8 text-gray-500">
                    No clients found. Click "Add New Client" to create your first client.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map(client => (
                  <TableRow key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <TableCell className="px-2 sm:px-4 py-3 font-medium">{client.name}</TableCell>
                    <TableCell className="px-2 sm:px-4 py-3">{client.email}</TableCell>
                    <TableCell className="px-2 sm:px-4 py-3">{client.phone || 'N/A'}</TableCell>
                    <TableCell className="px-2 sm:px-4 py-3 max-w-xs truncate" title={client.address}>
                      {client.address || 'N/A'}
                    </TableCell>
                    <TableCell className="px-2 sm:px-4 py-3">
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedClient(client);
                            setIsDialogOpen(true);
                          }}
                          className="w-full sm:w-auto"
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ClientManagement;

