import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { US_STATES } from '@/constants/states';
import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';
import { toast } from '@/components/ui/use-toast';

interface EditOrderDialogProps {
  orderId: string;
  orderData: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated: () => void;
}

const EditOrderDialog: React.FC<EditOrderDialogProps> = ({ 
  orderId, 
  orderData, 
  open, 
  onOpenChange, 
  onOrderUpdated 
}) => {
  const [formData, setFormData] = useState({
    rush_file: 'No',
    property_address_line1: '',
    property_address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    if (orderData && open) {
      setFormData({
        rush_file: orderData.rush_file || 'No',
        property_address_line1: orderData.property_address_line1 || '',
        property_address_line2: orderData.property_address_line2 || '',
        city: orderData.city || '',
        state: orderData.state || '',
        zip_code: orderData.zip_code?.toString() || '',
        comments: orderData.comments || ''
      });
    }
  }, [orderData, open]);

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
      { field: 'property_address_line1', name: 'Property Address Line 1' },
      { field: 'city', name: 'City' },
      { field: 'state', name: 'State' }
    ];

    const missingFields = requiredFields.filter(({ field }) => {
      const value = formData[field as keyof typeof formData];
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

      // Prepare the order data according to the API specification
      const updateData = {
        rush_file: formData.rush_file,
        property_address_line1: formData.property_address_line1,
        property_address_line2: formData.property_address_line2,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        comments: formData.comments
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.EDIT_ORDER(orderId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
          description: `Order ${orderId} updated successfully!`,
        });

        // Close dialog and refresh order data
        onOrderUpdated();
        onOpenChange(false);

      } else {
        throw new Error(data.message || 'Failed to update order');
      }

    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Order - {orderId}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg p-6 space-y-6">
            {/* Property Address Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Property Address</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                    Property Address Line 1 *
                  </Label>
                  <Input
                    type="text"
                    value={formData.property_address_line1}
                    onChange={(e) => handleInputChange('property_address_line1', e.target.value)}
                    className="w-full"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                    Property Address Line 2
                  </Label>
                  <Input
                    type="text"
                    value={formData.property_address_line2}
                    onChange={(e) => handleInputChange('property_address_line2', e.target.value)}
                    className="w-full"
                    placeholder="Apt 1B"
                  />
                </div>

                <div>
                  <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                    City *
                  </Label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full"
                    placeholder="Phoenix"
                  />
                </div>

                <div>
                  <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                    State *
                  </Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label} ({state.abbreviation})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                    </svg>
                    Zip Code
                  </Label>
                  <Input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange('zip_code', e.target.value)}
                    className="w-full"
                    placeholder="85001"
                  />
                </div>
              </div>
            </div>

            {/* Order Settings Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Order Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    Rush File
                  </Label>
                  <Select value={formData.rush_file} onValueChange={(value) => handleInputChange('rush_file', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select rush status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Comments</h3>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </Label>
                <Textarea
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', e.target.value)}
                  rows={4}
                  className="w-full"
                  placeholder="Enter any additional comments or notes..."
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isSubmitting ? 'Updating...' : 'Update Order'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;
