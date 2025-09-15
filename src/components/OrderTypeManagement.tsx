import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Settings,
  ArrowRight
} from 'lucide-react';
import { 
  getAllOrderTypes, 
  createOrderType, 
  updateOrderType, 
  deleteOrderType 
} from '@/services/orderTypeService';

interface OrderType {
  id: string;
  order_type_name: string;
  created_at?: string;
  updated_at?: string;
}

interface OrderTypesResponse {
  data: OrderType[];
  message: string;
  success: boolean;
}

interface OrderTypeFormData {
  order_type_name: string;
}

const OrderTypeManagement: React.FC = () => {
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<OrderTypeFormData>({
    order_type_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const fetchOrderTypes = async (page: number = 1) => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await getAllOrderTypes({
        page,
        page_size: 10,
        search: search.trim() || undefined,
        sort_by: sortBy,
        sort_dir: sortDir
      });
      
      if (response.success) {
        setOrderTypes(response.data.items);
        setTotalItems(response.data.pagination.total_count);
        setTotalPages(response.data.pagination.total_pages);
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
      setOrderTypes([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveFilters = useState(false);

  const applyFilters = useCallback(() => {
    setCurrentPage(1);
    fetchOrderTypes(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setSortBy('created_at');
    setSortDir('desc');
    setCurrentPage(1);
    fetchOrderTypes(1);
  }, []);

  const handleCreateOrderType = async () => {
    if (!token || isSubmitting || !formData.order_type_name.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await createOrderType(formData.order_type_name.trim());
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Order type created successfully"
        });
        
        fetchOrderTypes();
        setIsDialogOpen(false);
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to create order type');
      }
    } catch (error: any) {
      console.error('Error creating order type:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create order type",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOrderType = async () => {
    if (!selectedOrderType || !token || !formData.order_type_name.trim()) return;

    try {
      const response = await updateOrderType(selectedOrderType.id, formData.order_type_name.trim());
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Order type updated successfully"
        });
        
        fetchOrderTypes();
        setIsDialogOpen(false);
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to update order type');
      }
    } catch (error: any) {
      console.error('Error updating order type:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order type",
        variant: "destructive"
      });
    }
  };

  const handleDeleteOrderType = async (orderTypeId: string) => {
    if (!token) return;
    
    try {
      const response = await deleteOrderType(orderTypeId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Order type deleted successfully"
        });
        
        fetchOrderTypes();
      } else {
        throw new Error(response.message || 'Failed to delete order type');
      }
    } catch (error: any) {
      console.error('Error deleting order type:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete order type",
        variant: "destructive"
      });
    }
  };

  const handleManageSteps = (orderTypeId: string) => {
    navigate(`/order-types/${orderTypeId}/steps-mapping`);
  };

  const resetForm = () => {
    setFormData({
      order_type_name: ''
    });
    setSelectedOrderType(null);
  };

  const openOrderTypeDialog = (orderType?: OrderType) => {
    if (orderType) {
      setSelectedOrderType(orderType);
      setFormData({
        order_type_name: orderType.order_type_name
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (token) {
      fetchOrderTypes(1);
      setCurrentPage(1);
    }
  }, [token]);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.order_type_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an order type name",
        variant: "destructive"
      });
      return;
    }
    
    selectedOrderType ? handleUpdateOrderType() : handleCreateOrderType();
  }, [formData, selectedOrderType, handleUpdateOrderType, handleCreateOrderType]);

  const OrderTypeDialog = useMemo(() => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>{selectedOrderType ? 'Edit Order Type' : 'Add New Order Type'}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Settings className="w-4 h-4 mr-2" />
                Order Type Name
              </label>
              <Input
                value={formData.order_type_name}
                onChange={(e) => setFormData(prev => ({ ...prev, order_type_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter order type name (e.g., COS, Refinance, Purchase)"
                required
              />
            </div>

            <div className="flex space-x-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  {isSubmitting 
                    ? (selectedOrderType ? 'Updating...' : 'Creating...') 
                    : (selectedOrderType ? 'Update Order Type' : 'Create Order Type')
                  }
                </span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
                className="px-8 py-3"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  ), [isDialogOpen, selectedOrderType, formData.order_type_name, isSubmitting, handleFormSubmit]);

  return (
    <div className="p-6 bg-gray-100 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600">Manage order types and their configurations</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
                fetchOrderTypes(1);
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none"
            >
              <option value="created_at">Created</option>
              <option value="updated_at">Updated</option>
              <option value="order_type_name">Name</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => {
                setSortDir(e.target.value as 'asc' | 'desc');
                setCurrentPage(1);
                fetchOrderTypes(1);
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
          </button>
          <Button onClick={() => {
            setSortBy('created_at');
            setSortDir('desc');
            setCurrentPage(1);
            fetchOrderTypes(1);
          }}>Refresh</Button>
          <Button onClick={() => openOrderTypeDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Add Order Type
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Filter Order Types</h3>
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
                placeholder="Order type name"
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
            Showing <span className="font-semibold text-blue-600">{((currentPage - 1) * 10) + 1}</span> to <span className="font-semibold text-blue-600">{Math.min(currentPage * 10, totalItems)}</span> of <span className="font-semibold text-blue-600">{totalItems}</span> order types
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => {
                if (currentPage > 1) {
                  const newPage = currentPage - 1;
                  setCurrentPage(newPage);
                  fetchOrderTypes(newPage);
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
                  fetchOrderTypes(newPage);
                }
              }}
            >
              Next
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Type Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading order types...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : orderTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No order types found. Click "Add Order Type" to create your first order type.
                </TableCell>
              </TableRow>
            ) : (
              orderTypes.map(orderType => (
                <TableRow key={orderType.id}>
                  <TableCell className="font-medium">{orderType.order_type_name}</TableCell>
                  <TableCell>
                    {orderType.created_at ? new Date(orderType.created_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {orderType.updated_at ? new Date(orderType.updated_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openOrderTypeDialog(orderType)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleManageSteps(orderType.id)}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" /> Manage Steps
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteOrderType(orderType.id)}
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
      
      {OrderTypeDialog}
    </div>
  );
};

export default OrderTypeManagement;
