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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const fetchStepLibraryItems = async (page: number = 1) => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await getAllStepLibraryItems({
        page,
        page_size: 10,
        search: search.trim() || undefined,
        sort_by: sortBy,
        sort_dir: sortDir
      });
      
      if (response.success) {
        setStepLibraryItems(response.data.items);
        setTotalItems(response.data.pagination.total_count);
        setTotalPages(response.data.pagination.total_pages);
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
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveFilters = useState(false);

  const applyFilters = useCallback(() => {
    setCurrentPage(1);
    fetchStepLibraryItems(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setSortBy('created_at');
    setSortDir('desc');
    setCurrentPage(1);
    fetchStepLibraryItems(1);
  }, []);

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
      fetchStepLibraryItems(1);
      setCurrentPage(1);
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
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
                fetchStepLibraryItems(1);
              }}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none"
            >
              <option value="created_at">Created</option>
              <option value="updated_at">Updated</option>
              <option value="step_name">Name</option>
            </select>
            <select
              value={sortDir}
              onChange={(e) => {
                setSortDir(e.target.value as 'asc' | 'desc');
                setCurrentPage(1);
                fetchStepLibraryItems(1);
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
            fetchStepLibraryItems(1);
          }}>Refresh</Button>
          <Button onClick={() => openStepItemDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Add Step Item
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Filter Steps</h3>
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
                placeholder="Name or description"
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
            Showing <span className="font-semibold text-blue-600">{((currentPage - 1) * 10) + 1}</span> to <span className="font-semibold text-blue-600">{Math.min(currentPage * 10, totalItems)}</span> of <span className="font-semibold text-blue-600">{totalItems}</span> steps
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => {
                if (currentPage > 1) {
                  const newPage = currentPage - 1;
                  setCurrentPage(newPage);
                  fetchStepLibraryItems(newPage);
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
                  fetchStepLibraryItems(newPage);
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