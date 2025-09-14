import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { 
  Edit, 
  Trash2, 
  Plus, 
  BookOpen 
} from 'lucide-react';
import { 
  getAllStepLibraryItems, 
  createStepLibraryItem, 
  updateStepLibraryItem, 
  deleteStepLibraryItem 
} from '@/services/stepsLibraryService';

interface StepLibraryItem {
  id: string;
  step_name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface StepLibraryResponse {
  data: StepLibraryItem[];
  message: string;
  success: boolean;
}

interface StepLibraryFormData {
  step_name: string;
  description: string;
}

const StepsLibraryManagement: React.FC = () => {
  const [stepLibraryItems, setStepLibraryItems] = useState<StepLibraryItem[]>([]);
  const [selectedStepItem, setSelectedStepItem] = useState<StepLibraryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<StepLibraryFormData>({
    step_name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const fetchStepLibraryItems = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await getAllStepLibraryItems();
      
      if (response.success) {
        setStepLibraryItems(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch step library items');
      }
    } catch (error: any) {
      console.error('Error fetching step library items:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch step library items",
        variant: "destructive"
      });
      setStepLibraryItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStepItem = async () => {
    if (!token || isSubmitting || !formData.step_name.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await createStepLibraryItem(
        formData.step_name.trim(), 
        formData.description.trim() || undefined
      );
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Step library item created successfully"
        });
        
        fetchStepLibraryItems();
        setIsDialogOpen(false);
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to create step library item');
      }
    } catch (error: any) {
      console.error('Error creating step library item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create step library item",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStepItem = async () => {
    if (!selectedStepItem || !token || !formData.step_name.trim()) return;

    try {
      const response = await updateStepLibraryItem(
        selectedStepItem.id, 
        formData.step_name.trim(),
        formData.description.trim() || undefined
      );
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Step library item updated successfully"
        });
        
        fetchStepLibraryItems();
        setIsDialogOpen(false);
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to update step library item');
      }
    } catch (error: any) {
      console.error('Error updating step library item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update step library item",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStepItem = async (stepId: string) => {
    if (!token) return;
    
    try {
      const response = await deleteStepLibraryItem(stepId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Step library item deleted successfully"
        });
        
        fetchStepLibraryItems();
      } else {
        throw new Error(response.message || 'Failed to delete step library item');
      }
    } catch (error: any) {
      console.error('Error deleting step library item:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete step library item",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      step_name: '',
      description: ''
    });
    setSelectedStepItem(null);
  };

  const openStepItemDialog = (stepItem?: StepLibraryItem) => {
    if (stepItem) {
      setSelectedStepItem(stepItem);
      setFormData({
        step_name: stepItem.step_name,
        description: stepItem.description || ''
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (token) {
      fetchStepLibraryItems();
    }
  }, [token]);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.step_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a step name",
        variant: "destructive"
      });
      return;
    }
    
    selectedStepItem ? handleUpdateStepItem() : handleCreateStepItem();
  }, [formData, selectedStepItem, handleUpdateStepItem, handleCreateStepItem]);

  const StepLibraryDialog = useMemo(() => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>{selectedStepItem ? 'Edit Step Library Item' : 'Add New Step Library Item'}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 mr-2" />
                Step Name *
              </label>
              <Input
                value={formData.step_name}
                onChange={(e) => setFormData(prev => ({ ...prev, step_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter step name (e.g., Document Review, Data Entry, Quality Check)"
                required
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="w-4 h-4 mr-2" />
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter step description (optional)"
                rows={3}
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
                    ? (selectedStepItem ? 'Updating...' : 'Creating...') 
                    : (selectedStepItem ? 'Update Step Item' : 'Create Step Item')
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
  ), [isDialogOpen, selectedStepItem, formData.step_name, formData.description, isSubmitting, handleFormSubmit]);

  return (
    <div className="p-6 bg-gray-100 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600">Manage reusable workflow steps that can be referenced across different order types</p>
        </div>
        <Button onClick={() => openStepItemDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Step Item
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Step Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading step library items...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : stepLibraryItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No step library items found. Click "Add Step Item" to create your first step.
                </TableCell>
              </TableRow>
            ) : (
              stepLibraryItems.map(stepItem => (
                <TableRow key={stepItem.id}>
                  <TableCell className="font-medium">{stepItem.step_name}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={stepItem.description}>
                      {stepItem.description || 'No description'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {stepItem.created_at ? new Date(stepItem.created_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {stepItem.updated_at ? new Date(stepItem.updated_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openStepItemDialog(stepItem)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteStepItem(stepItem.id)}
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
      
      {StepLibraryDialog}
    </div>
  );
};

export default StepsLibraryManagement;