import React, { useState, useEffect, useCallback } from 'react';
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

  const fetchOrderTypes = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await getAllOrderTypes();
      
      if (response.success) {
        setOrderTypes(response.data);
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
    } finally {
      setIsLoading(false);
    }
  };

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
      fetchOrderTypes();
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

  const OrderTypeDialog = () => (
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
  );

  return (
    <div className="p-6 bg-gray-100 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600">Manage order types and their configurations</p>
        </div>
        <Button onClick={() => openOrderTypeDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Order Type
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
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
      
      <OrderTypeDialog />
    </div>
  );
};

export default OrderTypeManagement;
