import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { toast } from '@/components/ui/use-toast';
import { ORDER_TYPES } from '@/constants/orderTypes';
import { US_STATES } from '@/constants/states';
import ErrorBoundary from '@/components/ErrorBoundary';
import { 
  Edit, 
  Trash2, 
  UserPlus, 
  Lock, 
  User as UserIcon 
} from 'lucide-react';

// Constants for dropdown options
const EMPLOYEE_TYPES = ['Inhouse', 'Vendor'];
const USER_TYPES = ['Processor', 'Supervisor', 'Admin', 'Order Entry', 'test user'];
const CAPABILITIES = [
  'Search/Exam', 
  'Typing', 
  'Proofing', 
  'Commitment Review', 
  'Document Retrieval', 
  'Update', 
  'Update QC', 
  'Search QC', 
  'Final QC', 
  'Commitment Review QC'
];
// Convert US_STATES to MultiSelectOption format
const stateOptions = US_STATES.map(state => ({
  value: state.value,
  label: state.label,
  abbreviation: state.abbreviation
}));

interface User {
  id: string;
  username: string;
  name?: string;
  email: string;
  user_type: 'Admin' | 'Supervisor' | 'Processor' | 'QC' | 'Typist' | 'Auditor';
  active: boolean;
  phone_number?: string;
  company?: string;
  address?: string;
  employee_type?: string;
  capabilities?: string;
  select_states?: string;
  clients?: string;
  skip_qc?: string;
  order_types?: string;
  skills?: string;
}

interface UsersResponse {
  data: {
    items: User[];
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

interface UserFormData {
  username: string;
  name: string;
  email: string;
  password?: string;
  // role removed from creation UI
  phone_number: string;
  company: string;
  address: string;
  employee_type: string;
  user_type: string;
  capabilities: string[];
  select_states: string[];
  clients: string[];
  skip_qc: string;
  order_types: string[];
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    name: '',
    email: '',
    password: '',
    phone_number: '',
    company: '',
    address: '',
    employee_type: '',
    user_type: '',
    capabilities: [],
    select_states: [],
    clients: [],
    skip_qc: 'No',
    order_types: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<{id: string, name: string}[]>([]);
  const { token } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS}?page=1&page_size=50`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: UsersResponse = await response.json();
      
      if (data.success) {
        setUsers(data.data.items);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users",
        variant: "destructive"
      });
      setUsers([]); // Set empty array to prevent errors
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const resetForm = useCallback(() => {
    setFormData({
      username: '',
      name: '',
      email: '',
      password: '',
      phone_number: '',
      company: '',
      address: '',
      employee_type: '',
      user_type: '',
      capabilities: [],
      select_states: [],
      clients: [],
      skip_qc: 'No',
      order_types: []
    });
    setSelectedUser(null);
  }, []);

  const handleCreateUser = useCallback(async () => {
    if (!token || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          employee_type: formData.employee_type,
          user_type: formData.user_type,
          phone_number: formData.phone_number,
          company: formData.company,
          address: formData.address,
          capabilities: formData.capabilities.join(','),
          select_states: formData.select_states.join(','),
          clients: formData.clients.join(','),
          skip_qc: formData.skip_qc,
          order_types: formData.order_types.join(',')
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "User created successfully"
        });
        
        fetchUsers();
        setIsDialogOpen(false);
        resetForm();
      } else {
        throw new Error(data.message || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [token, isSubmitting, formData, fetchUsers, resetForm]);

  const handleUpdateUser = useCallback(async () => {
    if (!selectedUser || !token) return;

    try {
      const updateData = { 
        username: formData.username,
        name: formData.name,
        email: formData.email, 
        phone_number: formData.phone_number,
        company: formData.company,
        address: formData.address,
        employee_type: formData.employee_type,
        user_type: formData.user_type,
        capabilities: formData.capabilities.join(','),
        select_states: formData.select_states.join(','),
        clients: formData.clients.join(','),
        skip_qc: formData.skip_qc,
        order_types: formData.order_types.join(',')
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER_BY_ID(selectedUser.id)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "User updated successfully"
        });
        
        fetchUsers();
        setIsDialogOpen(false);
        resetForm();
      } else {
        throw new Error(data.message || 'Failed to update user');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive"
      });
    }
  }, [selectedUser, token, formData, fetchUsers, resetForm]);

  const handleDeleteUser = async (userId: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER_BY_ID(userId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "User deleted successfully"
        });
        
        fetchUsers();
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const openUserDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        name: user.name || '',
        email: user.email,
        phone_number: user.phone_number || '',
        company: user.company || '',
        address: user.address || '',
        employee_type: user.employee_type || '',
        user_type: user.user_type || '',
        capabilities: user.capabilities ? user.capabilities.split(',') : [],
        select_states: user.select_states ? user.select_states.split(',') : [],
        clients: user.clients ? user.clients.split(',') : [],
        skip_qc: user.skip_qc || 'No',
        order_types: user.order_types ? user.order_types.split(',') : []
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const fetchClients = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.CLIENTS}?page=1&page_size=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setClients(data.data.items.map((client: any) => ({
            id: client.id,
            name: client.name
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchClients();
    }
  }, [token]);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Additional check to ensure we don't have any undefined values causing issues
      if (!formData.username || !formData.email || (!selectedUser && !formData.password)) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
      
      selectedUser ? handleUpdateUser() : handleCreateUser();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "An error occurred while submitting the form",
        variant: "destructive"
      });
    }
  }, [selectedUser, handleUpdateUser, handleCreateUser, formData]);

  // Memoize the form handlers to prevent unnecessary re-renders
  const handleInputChange = useCallback((field: keyof UserFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    resetForm();
  }, [resetForm]);

  const UserDialog = useMemo(() => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {selectedUser ? 'Edit User' : 'Add User'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Username *
                  </label>
                  <Input
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter username"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                {!selectedUser && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Password *
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <Input
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter full address"
                  />
                </div>
              </div>
            </div>

            {/* Role & Permissions Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
                Role & Permissions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Employee Type
                  </label>
                  <Select
                    value={formData.employee_type}
                    onValueChange={(value) => handleInputChange('employee_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    User Type
                  </label>
                  <Select
                    value={formData.user_type}
                    onValueChange={(value) => handleInputChange('user_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Skip QC
                  </label>
                  <Select
                    value={formData.skip_qc}
                    onValueChange={(value) => handleInputChange('skip_qc', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select QC option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Capabilities & Access Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                </svg>
                Capabilities & Access
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Capabilities
                  </label>
                  <MultiSelect
                    options={CAPABILITIES.map(capability => ({ value: capability, label: capability }))}
                    selected={formData.capabilities}
                    onChange={(selected) => handleInputChange('capabilities', selected)}
                    placeholder="Select capabilities"
                    className="w-full"
                    showSelectAll={true}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    States
                  </label>
                  <MultiSelect
                    options={stateOptions}
                    selected={formData.select_states}
                    onChange={(selected) => handleInputChange('select_states', selected)}
                    placeholder="Select states"
                    showAbbreviation={true}
                    maxDisplay={3}
                    className="w-full"
                    showSelectAll={true}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Clients
                  </label>
                  <MultiSelect
                    options={clients.map(client => ({ value: client.name, label: client.name }))}
                    selected={formData.clients}
                    onChange={(selected) => handleInputChange('clients', selected)}
                    placeholder="Select clients"
                    className="w-full"
                    showSelectAll={true}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Order Types
                  </label>
                  <MultiSelect
                    options={ORDER_TYPES.map(type => ({ value: type, label: type }))}
                    selected={formData.order_types}
                    onChange={(selected) => handleInputChange('order_types', selected)}
                    placeholder="Select order types"
                    className="w-full"
                    showSelectAll={true}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Clear All
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {isSubmitting 
                  ? (selectedUser ? 'Updating...' : 'Creating...') 
                  : (selectedUser ? 'Update User' : 'Create User')
                }
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  ), [isDialogOpen, selectedUser, formData, isSubmitting, handleFormSubmit, handleInputChange, handleCloseDialog, resetForm, clients, stateOptions]);

  return (
    <ErrorBoundary>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
            <p className="text-gray-600 mt-1">Manage system users and their roles</p>
          </div>
          <Button onClick={() => openUserDialog()}>
            <UserPlus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Loading users...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No users found. Click "Add New User" to create your first user.
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.user_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.active ? 'default' : 'destructive'}
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openUserDialog(user)}
                        >
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {UserDialog}
      </div>
    </ErrorBoundary>
  );
};

export default UserManagement;