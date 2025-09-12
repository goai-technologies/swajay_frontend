import React, { useState, useEffect } from 'react';
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

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CLIENTS}?page=1&page_size=50`, {
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
      setClients([]); // Set empty array to prevent map error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClient = async (clientData: Partial<Client>) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CLIENTS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
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
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CLIENT_BY_ID(selectedClient.id)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
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
      fetchClients();
    }
  }, [token]);

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
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Client Management</h1>
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

      <div className="bg-white rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading clients...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No clients found. Click "Add New Client" to create your first client.
                </TableCell>
              </TableRow>
            ) : (
              clients.map(client => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate" title={client.address}>
                    {client.address || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setIsDialogOpen(true);
                        }}
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
  );
};

export default ClientManagement;

