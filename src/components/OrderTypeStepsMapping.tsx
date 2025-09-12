import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { 
  Edit, 
  Trash2, 
  Plus, 
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { 
  listOrderTypeStepMappings,
  createOrderTypeStepMappings,
  updateOrderTypeStepMapping,
  deleteOrderTypeStepMapping,
  StepMapping
} from '@/services/orderTypeStepsMappingService';
import { getAllStepLibraryItems } from '@/services/stepsLibraryService';
import { getOrderTypeById } from '@/services/orderTypeService';

interface StepLibraryItem {
  id: string;
  step_name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface StepMapping {
  id: string;
  order_type_id: string;
  step_library_id: string;
  sequence_number: number;
  created_at?: string;
  updated_at?: string;
}

interface StepMappingWithDetails extends StepMapping {
  step_detail: {
    id: string;
    step_name: string;
    description: string;
    created_at?: string;
    updated_at?: string;
  };
}

interface StepMappingsResponse {
  data: StepMapping[];
  message: string;
  success: boolean;
}

interface StepLibraryResponse {
  data: StepLibraryItem[];
  message: string;
  success: boolean;
}

interface OrderTypeResponse {
  data: {
    id: string;
    order_type_name: string;
  };
  message: string;
  success: boolean;
}

interface StepMappingFormData {
  step_library_id: string;
  sequence_number: number;
}

const OrderTypeStepsMapping: React.FC = () => {
  const { order_type_id } = useParams<{ order_type_id: string }>();
  const [stepMappings, setStepMappings] = useState<StepMapping[]>([]);
  const [stepMappingsWithDetails, setStepMappingsWithDetails] = useState<StepMappingWithDetails[]>([]);
  const [availableSteps, setAvailableSteps] = useState<StepLibraryItem[]>([]);
  const [orderType, setOrderType] = useState<{ id: string; order_type_name: string } | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<StepMappingWithDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<StepMappingFormData>({
    step_library_id: '',
    sequence_number: 1
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchStepMappings = async () => {
    if (!token || !order_type_id) return;
    
    try {
      setIsLoading(true);
      const response = await listOrderTypeStepMappings(order_type_id);
      
      console.log('Step mappings response:', response); // Debug log
      
      if (response.success && response.data) {
        // Ensure data is an array and has the expected structure
        const mappings = Array.isArray(response.data) ? response.data : [];
        setStepMappings(mappings);
      } else {
        console.log('No step mappings found or API error:', response);
        setStepMappings([]);
        setStepMappingsWithDetails([]);
      }
    } catch (error: any) {
      console.error('Error fetching step mappings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch step mappings",
        variant: "destructive"
      });
      setStepMappings([]);
      setStepMappingsWithDetails([]);
    } finally {
      setIsLoading(false);
    }
  };

  const enrichMappingsWithStepDetails = async (mappings: StepMapping[]) => {
    try {
      const enrichedMappings: StepMappingWithDetails[] = [];
      
      for (const mapping of mappings) {
        // Find the step details from availableSteps
        const stepDetail = availableSteps.find(step => step.id === mapping.step_library_id);
        
        if (stepDetail) {
          enrichedMappings.push({
            ...mapping,
            step_detail: {
              id: stepDetail.id,
              step_name: stepDetail.step_name,
              description: stepDetail.description,
              created_at: stepDetail.created_at,
              updated_at: stepDetail.updated_at
            }
          });
        } else {
          // If step details not found in availableSteps, create a placeholder
          enrichedMappings.push({
            ...mapping,
            step_detail: {
              id: mapping.step_library_id,
              step_name: 'Unknown Step',
              description: 'No description available',
              created_at: mapping.created_at,
              updated_at: mapping.updated_at
            }
          });
        }
      }
      
      setStepMappingsWithDetails(enrichedMappings);
    } catch (error) {
      console.error('Error enriching mappings with step details:', error);
      // Set mappings with placeholder details
      const enrichedMappings: StepMappingWithDetails[] = mappings.map(mapping => ({
        ...mapping,
        step_detail: {
          id: mapping.step_library_id,
          step_name: 'Unknown Step',
          description: 'No description available',
          created_at: mapping.created_at,
          updated_at: mapping.updated_at
        }
      }));
      setStepMappingsWithDetails(enrichedMappings);
    }
  };

  const fetchAvailableSteps = async () => {
    if (!token) return;
    
    try {
      const response = await getAllStepLibraryItems();
      
      console.log('Available steps response:', response); // Debug log
      
      if (response.success && response.data) {
        const steps = Array.isArray(response.data) ? response.data : [];
        setAvailableSteps(steps);
      } else {
        console.log('No available steps found or API error:', response);
        setAvailableSteps([]);
      }
    } catch (error: any) {
      console.error('Error fetching available steps:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch available steps",
        variant: "destructive"
      });
      setAvailableSteps([]);
    }
  };

  const fetchOrderType = async () => {
    if (!token || !order_type_id) return;
    
    try {
      const response = await getOrderTypeById(order_type_id);
      
      console.log('Order type response:', response); // Debug log
      
      if (response.success && response.data) {
        setOrderType(response.data);
      } else {
        console.log('Order type not found or API error:', response);
        setOrderType(null);
      }
    } catch (error: any) {
      console.error('Error fetching order type:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch order type",
        variant: "destructive"
      });
      setOrderType(null);
    }
  };

  const handleCreateStepMapping = async () => {
    if (!token || !order_type_id || isSubmitting || !formData.step_library_id) return;
    
    setIsSubmitting(true);
    
    try {
      const newMapping: StepMapping = {
        step_library_id: formData.step_library_id,
        sequence_number: formData.sequence_number
      };
      
      console.log('Creating step mapping with:', newMapping); // Debug log
      
      const response = await createOrderTypeStepMappings(order_type_id, [newMapping]);
      
      console.log('Create step mapping response:', response); // Debug log
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Step mapping created successfully"
        });
        
        fetchStepMappings();
        setIsDialogOpen(false);
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to create step mapping');
      }
    } catch (error: any) {
      console.error('Error creating step mapping:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create step mapping",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStepMapping = async () => {
    if (!selectedMapping || !token || !formData.step_library_id) return;

    try {
      console.log('Updating step mapping:', {
        mappingId: selectedMapping.id,
        stepLibraryId: formData.step_library_id,
        sequenceNumber: formData.sequence_number
      }); // Debug log
      
      const response = await updateOrderTypeStepMapping(
        selectedMapping.id,
        formData.step_library_id,
        formData.sequence_number
      );
      
      console.log('Update step mapping response:', response); // Debug log
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Step mapping updated successfully"
        });
        
        fetchStepMappings();
        setIsDialogOpen(false);
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to update step mapping');
      }
    } catch (error: any) {
      console.error('Error updating step mapping:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update step mapping",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStepMapping = async (mappingId: string) => {
    if (!token) return;
    
    try {
      const response = await deleteOrderTypeStepMapping(mappingId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Step mapping deleted successfully"
        });
        
        fetchStepMappings();
      } else {
        throw new Error(response.message || 'Failed to delete step mapping');
      }
    } catch (error: any) {
      console.error('Error deleting step mapping:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete step mapping",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      step_library_id: '',
      sequence_number: 1
    });
    setSelectedMapping(null);
  };

  const openStepMappingDialog = (mapping?: StepMappingWithDetails) => {
    if (mapping) {
      setSelectedMapping(mapping);
      // Use the step_library_id directly from the mapping
      setFormData({
        step_library_id: mapping.step_library_id || '',
        sequence_number: mapping.sequence_number || 1
      });
    } else {
      // For new mapping, set the next sequence number
      setFormData({
        step_library_id: '',
        sequence_number: getNextSequenceNumber()
      });
    }
    setIsDialogOpen(true);
  };

  const getNextSequenceNumber = () => {
    if (stepMappingsWithDetails.length === 0) return 1;
    const maxSequence = Math.max(...stepMappingsWithDetails.map(m => m.sequence_number || 0));
    return maxSequence + 1;
  };

  useEffect(() => {
    if (token && order_type_id) {
      fetchAvailableSteps();
      fetchOrderType();
    }
  }, [token, order_type_id]);

  useEffect(() => {
    if (availableSteps.length > 0 && stepMappings.length > 0) {
      enrichMappingsWithStepDetails(stepMappings);
    }
  }, [availableSteps, stepMappings]);

  useEffect(() => {
    if (token && order_type_id && availableSteps.length > 0) {
      fetchStepMappings();
    }
  }, [token, order_type_id, availableSteps.length]);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.step_library_id) {
      toast({
        title: "Validation Error",
        description: "Please select a step",
        variant: "destructive"
      });
      return;
    }
    
    selectedMapping ? handleUpdateStepMapping() : handleCreateStepMapping();
  }, [formData, selectedMapping, handleUpdateStepMapping, handleCreateStepMapping]);

  const StepMappingDialog = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>{selectedMapping ? 'Edit Step Mapping' : 'Add New Step Mapping'}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Settings className="w-4 h-4 mr-2" />
                Step
              </label>
              <Select
                value={formData.step_library_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, step_library_id: value }))}
              >
                <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select a step" />
                </SelectTrigger>
                <SelectContent>
                  {availableSteps.map(step => (
                    <SelectItem key={step.id} value={step.id}>
                      {step.step_name} - {step.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Settings className="w-4 h-4 mr-2" />
                Sequence Number
              </label>
              <Input
                type="number"
                min="1"
                value={formData.sequence_number}
                onChange={(e) => setFormData(prev => ({ ...prev, sequence_number: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    ? (selectedMapping ? 'Updating...' : 'Creating...') 
                    : (selectedMapping ? 'Update Mapping' : 'Create Mapping')
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

  // Show loading state if we don't have the order type ID
  if (!order_type_id) {
    return (
      <div className="p-6 bg-gray-100 h-full overflow-y-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Order Type</h2>
          <p className="text-gray-600 mb-4">No order type ID provided.</p>
          <Button onClick={() => navigate('/order-types')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Order Types
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600">
            Manage step mappings for order type: {orderType?.order_type_name || order_type_id}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/order-types')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Order Types
          </Button>
          <Button onClick={() => openStepMappingDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Add Step Mapping
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sequence</TableHead>
              <TableHead>Step Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading step mappings...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : stepMappingsWithDetails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No step mappings found. Click "Add Step Mapping" to create your first mapping.
                </TableCell>
              </TableRow>
            ) : (
              stepMappingsWithDetails
                .filter(mapping => mapping && mapping.id) // Filter out any undefined/null mappings
                .sort((a, b) => (a.sequence_number || 0) - (b.sequence_number || 0))
                .map((mapping, index) => {
                  // Use nested step_detail properties from the enriched mappings
                  const stepName = mapping?.step_detail?.step_name || 'Unknown Step';
                  const stepDescription = mapping?.step_detail?.description || 'No description';
                  const sequenceNumber = mapping?.sequence_number || (index + 1);
                  
                  return (
                    <TableRow key={mapping.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                            {sequenceNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{stepName}</TableCell>
                      <TableCell className="text-gray-600">{stepDescription}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openStepMappingDialog(mapping)}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteStepMapping(mapping.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </div>
      
      <StepMappingDialog />
    </div>
  );
};

export default OrderTypeStepsMapping;
