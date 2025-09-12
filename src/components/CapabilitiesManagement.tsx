import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Settings 
} from 'lucide-react';
import { 
  getAllCapabilities, 
  createCapability, 
  updateCapability, 
  deleteCapability 
} from '@/services/capabilitiesService';

interface Capability {
  id: string;
  capability_name: string;
  created_at?: string;
  updated_at?: string;
}

interface CapabilitiesResponse {
  data: Capability[];
  message: string;
  success: boolean;
}

interface CapabilityFormData {
  capability_name: string;
}

const CapabilitiesManagement: React.FC = () => {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [selectedCapability, setSelectedCapability] = useState<Capability | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CapabilityFormData>({
    capability_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();

  const fetchCapabilities = async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const response = await getAllCapabilities();
      
      if (response.success) {
        setCapabilities(response.data);
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
      setCapabilities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCapability = async () => {
    if (!token || isSubmitting || !formData.capability_name.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await createCapability(formData.capability_name.trim());
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Capability created successfully"
        });
        
        fetchCapabilities();
        setIsDialogOpen(false);
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to create capability');
      }
    } catch (error: any) {
      console.error('Error creating capability:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create capability",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCapability = async () => {
    if (!selectedCapability || !token || !formData.capability_name.trim()) return;

    try {
      const response = await updateCapability(selectedCapability.id, formData.capability_name.trim());
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Capability updated successfully"
        });
        
        fetchCapabilities();
        setIsDialogOpen(false);
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to update capability');
      }
    } catch (error: any) {
      console.error('Error updating capability:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update capability",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCapability = async (capabilityId: string) => {
    if (!token) return;
    
    try {
      const response = await deleteCapability(capabilityId);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Capability deleted successfully"
        });
        
        fetchCapabilities();
      } else {
        throw new Error(response.message || 'Failed to delete capability');
      }
    } catch (error: any) {
      console.error('Error deleting capability:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete capability",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      capability_name: ''
    });
    setSelectedCapability(null);
  };

  const openCapabilityDialog = (capability?: Capability) => {
    if (capability) {
      setSelectedCapability(capability);
      setFormData({
        capability_name: capability.capability_name
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  useEffect(() => {
    if (token) {
      fetchCapabilities();
    }
  }, [token]);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.capability_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a capability name",
        variant: "destructive"
      });
      return;
    }
    
    selectedCapability ? handleUpdateCapability() : handleCreateCapability();
  }, [formData, selectedCapability, handleUpdateCapability, handleCreateCapability]);

  const CapabilityDialog = () => (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>{selectedCapability ? 'Edit Capability' : 'Add New Capability'}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Settings className="w-4 h-4 mr-2" />
                Capability Name
              </label>
              <Input
                value={formData.capability_name}
                onChange={(e) => setFormData(prev => ({ ...prev, capability_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter capability name (e.g., Search/Exam, Typing, Proofing)"
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
                    ? (selectedCapability ? 'Updating...' : 'Creating...') 
                    : (selectedCapability ? 'Update Capability' : 'Create Capability')
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
          <p className="text-gray-600">Manage system capabilities and permissions</p>
        </div>
        <Button onClick={() => openCapabilityDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Add Capability
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Capability Name</TableHead>
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
                    <span>Loading capabilities...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : capabilities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No capabilities found. Click "Add Capability" to create your first capability.
                </TableCell>
              </TableRow>
            ) : (
              capabilities.map(capability => (
                <TableRow key={capability.id}>
                  <TableCell className="font-medium">{capability.capability_name}</TableCell>
                  <TableCell>
                    {capability.created_at ? new Date(capability.created_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {capability.updated_at ? new Date(capability.updated_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openCapabilityDialog(capability)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteCapability(capability.id)}
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
      
      <CapabilityDialog />
    </div>
  );
};

export default CapabilitiesManagement;
