import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  FileText, 
  User, 
  MapPin,
  Calendar,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';

// TypeScript Interfaces
interface WorkItemSummary {
  total_items: number;
  in_progress: number;
  completed: number;
  pending: number;
}

interface WorkItem {
  step_id: string;
  order_id: string;
  file_number: string;
  borrower_name: string;
  owner_name: string;
  order_type: string;
  priority: 'Normal' | 'Rush';
  step_name: string;
  step_status: 'In Progress' | 'Completed' | 'Pending';
  started_at: string;
  property_address: string;
  county: string;
  state: string;
  folder_link?: string;
}

interface UserDashboardData {
  user_id: string;
  user_type: string;
  username: string;
  summary: WorkItemSummary;
  work_items: WorkItem[];
  can_request_new_work: boolean;
}

interface UserDashboardResponse {
  success: boolean;
  data: UserDashboardData;
}

interface AssignedWork {
  step_id: string;
  order_id: string;
  step_name: string;
  order_type: string;
  file_number: string;
  borrower_name: string;
  priority: string;
}

interface RequestWorkResponse {
  success: boolean;
  message: string;
  data: {
    assigned_work: AssignedWork;
    message: string;
    success: boolean;
  };
}

interface CompleteStepRequest {
  user_id: string;
  comments: string;
}

const WorkArea: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestingWork, setIsRequestingWork] = useState(false);
  const [completingStepId, setCompletingStepId] = useState<string | null>(null);
  const [completionComments, setCompletionComments] = useState('');
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const { token, user } = useAuth();

  // Fetch user dashboard data
  const fetchDashboard = async () => {
    if (!token || !user) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.USER_DASHBOARD(user.id)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: UserDashboardResponse = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error: any) {
      console.error('Error fetching dashboard:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get new file
  const handleRequestNewWork = async () => {
    if (!token || !user || isRequestingWork) return;


    try {
      setIsRequestingWork(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.REQUEST_WORK(user.id)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('Request work error response:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          const errorText = await response.text();
          console.error('Request work error text:', errorText);
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data: RequestWorkResponse = await response.json();
      
      if (data.success && data.data.success) {
        toast({
          title: "Success",
          description: data.data.message || data.message || "New work assigned successfully!",
        });
        
        // Refresh dashboard to show new work
        fetchDashboard();
      } else {
        throw new Error(data.data.message || data.message || 'Failed to get new file');
      }
    } catch (error: any) {
      console.error('Error requesting work:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get new file",
        variant: "destructive"
      });
    } finally {
      setIsRequestingWork(false);
    }
  };

  // Complete a workflow step
  const handleCompleteStep = async (stepId: string) => {
    if (!token || !user) return;

    try {
      const requestData: CompleteStepRequest = {
        user_id: user.id,
        comments: completionComments
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.COMPLETE_STEP(stepId)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Handle server error responses with specific error messages
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Step completed successfully!",
        });
        
        // Reset completion state
        setCompletingStepId(null);
        setCompletionComments('');
        setIsCompletionDialogOpen(false);
        
        // Refresh dashboard
        fetchDashboard();
      } else {
        throw new Error(data.message || 'Failed to complete step');
      }
    } catch (error: any) {
      console.error('Error completing step:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete step",
        variant: "destructive"
      });
    }
  };

  // Open completion dialog
  const openCompletionDialog = (stepId: string) => {
    setCompletingStepId(stepId);
    setCompletionComments('');
    setIsCompletionDialogOpen(true);
  };

  // Get priority badge variant
  const getPriorityVariant = (priority: string) => {
    return priority === 'Rush' ? 'destructive' : 'default';
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'Pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (token && user) {
      fetchDashboard();
    }
  }, [token, user]);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-100 h-full overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your work area...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6 bg-gray-100 h-full overflow-y-auto">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Work Area</h2>
          <p className="text-gray-600 mb-4">There was an error loading your dashboard data.</p>
          <Button onClick={fetchDashboard}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Work Area</h1>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={fetchDashboard} 
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          {dashboardData.can_request_new_work && (
            <Button 
              onClick={handleRequestNewWork}
              disabled={isRequestingWork}
            >
              {isRequestingWork ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Requesting...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Get New File
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.total_items}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.summary.in_progress}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.summary.completed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.summary.pending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Items */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Work Items</h2>
        
        {dashboardData.work_items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Active Work Items</h3>
              <p className="text-gray-500 mb-4">
                You don't have any active work items assigned to you right now.
              </p>
              {dashboardData.can_request_new_work && (
                <Button onClick={handleRequestNewWork} disabled={isRequestingWork}>
                  <Plus className="mr-2 h-4 w-4" />
                  Get New File
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData.work_items.map((item) => (
              <Card key={item.step_id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.file_number}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{item.step_name}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant={getPriorityVariant(item.priority)}>
                        {item.priority}
                      </Badge>
                      <Badge variant={getStatusVariant(item.step_status)}>
                        {item.step_status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>{item.owner_name}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{item.property_address}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Started: {formatDate(item.started_at)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm">
                        <span className="font-medium">Type:</span> {item.order_type} | 
                        <span className="font-medium"> County:</span> {item.county}, {item.state}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!item.folder_link}
                          onClick={() => {
                            if (item.folder_link) {
                              window.open(item.folder_link as string, '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          <FolderOpen className="mr-2 h-4 w-4" />
                          Open Folder
                        </Button>
                        {item.step_status === 'In Progress' && (
                          <Button 
                            size="sm"
                            onClick={() => openCompletionDialog(item.step_id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Step Completion Dialog */}
      <Dialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Work Step</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Completion Comments
              </label>
              <Textarea
                value={completionComments}
                onChange={(e) => setCompletionComments(e.target.value)}
                placeholder="Enter any comments about the completed work..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCompletionDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => completingStepId && handleCompleteStep(completingStepId)}
              >
                Complete Step
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkArea;
