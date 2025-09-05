import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ORDER_TYPES } from '@/constants/orderTypes';
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
const CLIENT_NAMES = [
  'Radian Title',
  'Holler Law Firm', 
  'ETT',
  'VTR',
  'FlexC'
];
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

interface User {
  id: string;
  username: string;
  name?: string;
  email: string;
  role: 'Admin' | 'Supervisor' | 'Processor' | 'QC' | 'Typist' | 'Auditor';
  active: boolean;
  phone_number?: string;
  company?: string;
  address?: string;
  employee_type?: string;
  user_type?: string;
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

  const fetchUsers = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:5001/users?page=1&page_size=50', {
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
  };

  const handleCreateUser = async () => {
    if (!token || isSubmitting) return;
    
    console.log('Creating user with data:', formData);
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5001/users', {
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
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !token) return;

    try {
      const updateData = { 
        username: formData.username,
        name: formData.name,
        email: formData.email, 
        role: formData.role,
        phone_number: formData.phone_number,
        company: formData.company,
        address: formData.address,
        employee_type: formData.employee_type,
        user_type: formData.user_type,
        capabilities: formData.capabilities.join(','),
        select_states: formData.select_states.join(','),
        clients: formData.clients.join(','),
        skip_qc: formData.skip_qc,
        order_types: formData.order_types.join(','),
        skills: formData.skills.join(',')
      };

      const response = await fetch(`http://localhost:5001/users/${selectedUser.id}`, {
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
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:5001/users/${userId}`, {
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

  const resetForm = () => {
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
      const response = await fetch('http://localhost:5001/clients?page=1&page_size=100', {
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Form submitted, preventing default', { formData, selectedUser });
    
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
  };

  const UserDialog = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 bg-gray-50">
          {/* Header with toggle and clear */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-800">Add User</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Add User</span>
                <div className="relative inline-block w-12 h-6 mr-2 align-middle select-none">
                  <input 
                    type="checkbox" 
                    name="toggle" 
                    id="user-toggle" 
                    className="absolute right-0 w-6 h-6 rounded-full bg-white border-2 border-gray-300 appearance-none cursor-pointer transition-all duration-300 checked:right-6 checked:border-blue-500" 
                    defaultChecked
                  />
                  <label 
                    htmlFor="user-toggle" 
                    className="block overflow-hidden h-6 rounded-full bg-blue-500 cursor-pointer"
                  ></label>
                </div>
              </div>
            </div>
            <button 
              type="button" 
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              onClick={resetForm}
            >
              <span>Clear All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* First Row: Username, Name, Email, Password */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                    </svg>
                    Username
                  </label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="supervisor_mike"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                    </svg>
                    Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mike Supervisor"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {!selectedUser && (
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                      </svg>
                      Password
                    </label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="supervisor123"
                    />
                  </div>
                )}
              </div>

              {/* Second Row: Employee Type, User Type, Phone Number, Company */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                    Employee Type
                  </label>
                  <Select
                    value={formData.employee_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, employee_type: value }))}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select Employee Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                    User Type
                  </label>
                  <Select
                    value={formData.user_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, user_type: value }))}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select User Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    Phone Number
                  </label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="555-5678-9012"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
                    </svg>
                    Company
                  </label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Swajay Corp"
                  />
                </div>
              </div>

              {/* Third Row: Address, Capabilities, Select States, Clients */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                    Address
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="200 Management Lane, Toledo, OH 43604"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                    </svg>
                    Capabilities
                  </label>
                  <Select
                    value={formData.capabilities.join(',')}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, capabilities: value ? [value] : [] }))}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select Capabilities" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAPABILITIES.map(capability => (
                        <SelectItem key={capability} value={capability}>{capability}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                    Select States
                  </label>
                  <Input
                    value={formData.select_states.join(',')}
                    onChange={(e) => setFormData(prev => ({ ...prev, select_states: e.target.value.split(',').map(s => s.trim()) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="OH,MI,PA"
                  />
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 616 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                    </svg>
                    Clients
                  </label>
                  <Select
                    value={formData.clients.join(',')}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, clients: value ? [value] : [] }))}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select Clients" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLIENT_NAMES.map(client => (
                        <SelectItem key={client} value={client}>{client}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fourth Row: Skip QC, Order Types */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                    Skip QC
                  </label>
                  <Select
                    value={formData.skip_qc}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, skip_qc: value }))}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Skip QC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
                    </svg>
                    Order Types
                  </label>
                  <Select
                    value={formData.order_types.join(',')}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, order_types: value ? [value] : [] }))}
                  >
                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select Order Types" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* removed Skills and Role fields as requested */}
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{isSubmitting ? 'Creating...' : 'Create User'}</span>
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  className="flex-1 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
                >
                  Modify User
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <Button onClick={() => openUserDialog()}>
          <UserPlus className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
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
                    <Badge variant="outline">{user.role}</Badge>
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
      
      <UserDialog />
    </div>
  );
};

export default UserManagement;