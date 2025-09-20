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
import { US_STATES } from '@/constants/states';
import ErrorBoundary from '@/components/ErrorBoundary';
import { getAllOrderTypes } from '@/services/orderTypeService';
import { getAllCapabilities } from '@/services/capabilitiesService';
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
  const [orderTypes, setOrderTypes] = useState<{id: string, order_type_name: string}[]>([]);
  const [capabilities, setCapabilities] = useState<{id: string, capability_name: string}[]>([]);
  const [orderTypesLoading, setOrderTypesLoading] = useState(false);
  const [capabilitiesLoading, setCapabilitiesLoading] = useState(false);
  const { token } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [search, setSearch] = useState('');
  const [filterUserType, setFilterUserType] = useState('');
  const [filterActive, setFilterActive] = useState(''); // '', 'true', 'false'
  
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const fetchUsers = useCallback(async (page: number = 1) => {
    if (!token) return;
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: '10'
      });
      if (search.trim()) params.append('search', search.trim());
      if (filterUserType) params.append('user_type', filterUserType);
      if (filterActive) params.append('active', filterActive);
      if (sortBy) params.append('sort_by', sortBy);
      if (sortDir) params.append('sort_dir', sortDir);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS}?${params.toString()}`, {
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
        setTotalPages(data.data.pagination.total_pages);
        setTotalUsers(data.data.pagination.total_count);
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
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setIsLoading(false);
    }
  }, [token, search, filterUserType, filterActive, sortBy, sortDir]);

  const hasActiveFilters = useCallback(() => {
    return [search.trim(), filterUserType, filterActive].some(v => v && v.trim() !== '');
  }, [search, filterUserType, filterActive]);

  const applyFilters = useCallback(() => {
    setCurrentPage(1);
    fetchUsers(1);
  }, [fetchUsers]);

  const clearFilters = useCallback(() => {
    setSearch('');
    setFilterUserType('');
    setFilterActive('');
    setSortBy('created_at');
    setSortDir('desc');
    setCurrentPage(1);
    fetchUsers(1);
  }, [fetchUsers]);

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
    
    // Frontend validation for required fields
    if (!formData.employee_type) {
      toast({ title: 'Validation Error', description: 'Employee Type is required', variant: 'destructive' });
      return;
    }
    if (!formData.user_type) {
      toast({ title: 'Validation Error', description: 'User Type is required', variant: 'destructive' });
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      toast({ title: 'Validation Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }

    // Validate multi-selects against allowed lists
    const allowedCapabilities = new Set(capabilities.map(c => c.capability_name));
    const allowedOrderTypes = new Set(orderTypes.map(o => o.order_type_name));
    const allowedClients = new Set(clients.map(c => c.name));

    const invalidCapabilities = (formData.capabilities || []).filter(v => !allowedCapabilities.has(v));
    if (invalidCapabilities.length) {
      toast({ title: 'Validation Error', description: `Invalid capabilities: ${invalidCapabilities.join(', ')}`, variant: 'destructive' });
      return;
    }

    const invalidOrderTypes = (formData.order_types || []).filter(v => !allowedOrderTypes.has(v));
    if (invalidOrderTypes.length) {
      toast({ title: 'Validation Error', description: `Invalid order types: ${invalidOrderTypes.join(', ')}`, variant: 'destructive' });
      return;
    }

    const invalidClients = (formData.clients || []).filter(v => !allowedClients.has(v));
    if (invalidClients.length) {
      toast({ title: 'Validation Error', description: `Invalid clients: ${invalidClients.join(', ')}`, variant: 'destructive' });
      return;
    }

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
          capabilities: (formData.capabilities || []).join(','),
          select_states: (formData.select_states || []).join(','),
          clients: (formData.clients || []).join(','),
          skip_qc: formData.skip_qc,
          order_types: (formData.order_types || []).join(',')
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as any));
        const details = errorData?.missing_fields ? `Missing: ${errorData.missing_fields.join(', ')}` : (errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
        throw new Error(details);
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
  }, [token, isSubmitting, formData, fetchUsers, resetForm, capabilities, orderTypes, clients]);

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

  const fetchOrderTypes = async () => {
    if (!token) return;
    
    try {
      setOrderTypesLoading(true);
      const response = await getAllOrderTypes();
      
      if (response.success) {
        setOrderTypes(response.data?.items || response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch order types');
      }
    } catch (error: any) {
      console.error('Error fetching order types:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch order types",
        variant: "destructive"
      });
    } finally {
      setOrderTypesLoading(false);
    }
  };

  const fetchCapabilities = async () => {
    if (!token) return;
    
    try {
      setCapabilitiesLoading(true);
      const response = await getAllCapabilities();
      
      if (response.success) {
        setCapabilities(response.data?.items || response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch capabilities');
      }
    } catch (error: any) {
      console.error('Error fetching capabilities:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch capabilities",
        variant: "destructive"
      });
    } finally {
      setCapabilitiesLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers(1);
      fetchClients();
      fetchOrderTypes();
      fetchCapabilities();
      setCurrentPage(1);
    }
  }, [token]);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!formData.username || !formData.email || (!selectedUser && !formData.password)) {
        toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" });
        return;
      }
      if (!selectedUser) {
        if (!formData.employee_type) {
          toast({ title: 'Validation Error', description: 'Employee Type is required', variant: 'destructive' });
          return;
        }
        if (!formData.user_type) {
          toast({ title: 'Validation Error', description: 'User Type is required', variant: 'destructive' });
          return;
        }
        if (!formData.password || formData.password.length < 8) {
          toast({ title: 'Validation Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
          return;
        }
      }
      
      selectedUser ? handleUpdateUser() : handleCreateUser();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({ title: "Error", description: "An error occurred while submitting the form", variant: "destructive" });
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
                    options={capabilities.map(capability => ({ value: capability.capability_name, label: capability.capability_name }))}
                    selected={formData.capabilities}
                    onChange={(selected) => handleInputChange('capabilities', selected)}
                    placeholder={capabilitiesLoading ? "Loading capabilities..." : "Select capabilities"}
                    className="w-full"
                    showSelectAll={true}
                    disabled={capabilitiesLoading}
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
                    options={orderTypes.map(type => ({ value: type.order_type_name, label: type.order_type_name }))}
                    selected={formData.order_types}
                    onChange={(selected) => handleInputChange('order_types', selected)}
                    placeholder={orderTypesLoading ? "Loading order types..." : "Select order types"}
                    className="w-full"
                    showSelectAll={true}
                    disabled={orderTypesLoading}
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
  ), [isDialogOpen, selectedUser, formData, isSubmitting, handleFormSubmit, handleInputChange, handleCloseDialog, resetForm, clients, stateOptions, capabilities, orderTypes]);

  return (
    <ErrorBoundary>
      <div className="p-2 sm:p-4 lg:p-6 bg-gray-100 h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
            <p className="text-gray-600 mt-1">Manage system users and their roles</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                  fetchUsers(1);
                }}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none"
              >
                <option value="created_at">Created</option>
                <option value="username">Username</option>
                <option value="email">Email</option>
                <option value="user_type">User Type</option>
                <option value="active">Status</option>
              </select>
              <select
                value={sortDir}
                onChange={(e) => {
                  setSortDir(e.target.value as 'asc' | 'desc');
                  setCurrentPage(1);
                  fetchUsers(1);
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
                  {[search.trim(), filterUserType, filterActive].filter(v => v && v.trim() !== '').length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setSortBy('created_at');
                setSortDir('desc');
                setCurrentPage(1);
                fetchUsers(1);
              }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
            <Button onClick={() => openUserDialog()}>
              <UserPlus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Filter Users</h3>
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
                  placeholder="Username, Name, Email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filterUserType}
                  onChange={(e) => setFilterUserType(e.target.value)}
                >
                  <option value="">All</option>
                  {USER_TYPES.map(t => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
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
              Showing <span className="font-semibold text-blue-600">{((currentPage - 1) * 10) + 1}</span> to <span className="font-semibold text-blue-600">{Math.min(currentPage * 10, totalUsers)}</span> of <span className="font-semibold text-blue-600">{totalUsers}</span> users
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => {
                  if (currentPage > 1) {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    fetchUsers(newPage);
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
                    fetchUsers(newPage);
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
                  <TableHead className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</TableHead>
                  <TableHead className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</TableHead>
                  <TableHead className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Type</TableHead>
                  <TableHead className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</TableHead>
                  <TableHead className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-b border-gray-100">
                    <TableCell colSpan={5} className="px-2 sm:px-4 text-center py-8">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow className="border-b border-gray-100">
                    <TableCell colSpan={5} className="px-2 sm:px-4 text-center py-8 text-gray-500">
                      No users found. Click "Add New User" to create your first user.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map(user => (
                    <TableRow key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <TableCell className="px-2 sm:px-4 py-3">{user.username}</TableCell>
                      <TableCell className="px-2 sm:px-4 py-3">{user.email}</TableCell>
                      <TableCell className="px-2 sm:px-4 py-3">
                        <Badge variant="outline">{user.user_type}</Badge>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-3">
                        <Badge 
                          variant={user.active ? 'default' : 'destructive'}
                        >
                          {user.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-3">
                        <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openUserDialog(user)}
                            className="w-full sm:w-auto"
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-full sm:w-auto"
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
        </div>
        
        {UserDialog}
      </div>
    </ErrorBoundary>
  );
};

export default UserManagement;