import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User, 
  Calendar,
  FileText,
  MapPin,
  Phone,
  Mail,
  Building,
  Edit,
  X,
  PauseCircle
} from 'lucide-react';
import { API_CONFIG, API_ENDPOINTS } from '@/constants/api';
import EditOrderDialog from './EditOrderDialog';
import { Textarea } from '@/components/ui/textarea';

interface OrderLogData {
  order_id: string;
  client_details: {
    name: string;
    email: string;
    phone: string;
  };
  order_details: {
    file_number: string;
    borrower_name: string;
    owner_name: string;
    order_type: string;
    priority: string;
    status: string;
    property_address_line1: string;
    property_address_line2: string;
    city: string;
    state: string;
    zip_code: number;
    county: string;
    client_order_number: number;
    online_ground: string;
    rush_file: string;
    comments: string;
    created_at: string;
    updated_at: string;
  };
  current_state: {
    order_status: string;
    current_step: {
      step_id: string;
      step_name: string;
      status: string;
      assigned_to: {
        username: string;
        user_type: string;
      };
      started_at: string;
      completed_at: string;
      duration: number | null;
      comments: string;
    };
    active_steps_count: number;
    next_action_required: string;
  };
  timeline: Array<{
    title: string;
    description: string;
    event_type: string;
    timestamp: string;
    details: any;
    user?: {
      id: string;
      username: string;
      user_type: string;
      name: string;
    };
    comments?: string;
  }>;
  metrics: {
    completion_percentage: number;
    total_duration_hours: number;
    total_duration_days: number;
    total_work_time_hours: number;
    average_step_time_hours: number;
  };
  total_steps: number;
  completed_steps: number;
  in_progress_steps: number;
  on_hold_steps: number;
  remaining_steps: Array<{
    step_name: string;
    status: string;
    assigned_to: {
      username: string;
      user_type: string;
    };
    started_at: string;
  }>;
}

interface OrderLogDialogProps {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderLogDialog: React.FC<OrderLogDialogProps> = ({ orderId, open, onOpenChange }) => {
  const [logData, setLogData] = useState<OrderLogData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; username: string; user_type: string }>>([]);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [isReassigning, setIsReassigning] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { token, user } = useAuth();
  const [statusComment, setStatusComment] = useState('');
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.USERS}?page=1&page_size=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      if (data.success && data.data?.items) {
        setUsers(
          data.data.items.map((u: any) => ({ id: u.id, username: u.username, user_type: u.user_type }))
        );
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    if (open && orderId && token) {
      fetchOrderLog();
      if (user?.user_type === 'Admin' || user?.user_type === 'Supervisor') {
        fetchUsers();
      }
    }
  }, [open, orderId, token]);

  const fetchOrderLog = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ORDER_LOG(orderId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setLogData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch order log');
      }
    } catch (error: any) {
      console.error('Error fetching order log:', error);
      setError(error.message || 'Failed to fetch order log');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'on hold':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'new':
        return <FileText className="h-5 w-5 text-purple-600" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'new':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'rush':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (hours: number) => {
    if (!hours) return 'N/A';
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours < 24) return `${Math.round(hours)} hours`;
    return `${Math.round(hours / 24)} days`;
  };

  const canEditOrder = () => {
    return user?.user_type === 'Admin' || user?.user_type === 'Supervisor';
  };

  const handleReassign = async () => {
    if (!orderId || !assigneeId || !token || !logData?.current_state?.current_step?.step_id) return;
    try {
      setIsReassigning(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.REASSIGN_STEP(orderId)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ step_id: logData.current_state.current_step.step_id, user_id: assigneeId }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${text}`);
      }
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Reassigned', description: 'Step reassigned successfully.' });
        setReassignOpen(false);
        setAssigneeId('');
        fetchOrderLog();
      } else {
        throw new Error(data.message || 'Failed to reassign');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to reassign', variant: 'destructive' });
    } finally {
      setIsReassigning(false);
    }
  };

  const handleToggleHoldStatus = async () => {
    if (!orderId || !token || !logData) return;
    
    if (!statusComment.trim()) {
      toast({ title: 'Comment required', description: 'Please enter a comment.', variant: 'destructive' });
      return;
    }
    
    const currentStatus = logData.order_details.status;
    const newStatus = currentStatus === 'On Hold' ? 'In Progress' : 'On Hold';
    
    try {
      setIsUpdatingStatus(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ORDER_STATUS(orderId)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, comment: statusComment }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${text}`);
      }
      
      const data = await response.json();
      if (data.success) {
        toast({ 
          title: 'Status Updated', 
          description: `Order status changed to ${newStatus}` 
        });
        fetchOrderLog();
        setStatusComment('');
        setIsStatusDialogOpen(false);
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update status', 
        variant: 'destructive' 
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const canToggleHoldStatus = () => {
    if (!logData) return false;
    const status = logData.order_details.status;
    return status === 'In Progress' || status === 'New' || status === 'On Hold';
  };

  const handleOrderUpdated = () => {
    // Refresh the order log data after edit
    if (open && orderId && token) {
      fetchOrderLog();
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-2 z-50 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="rounded-full shadow-md"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Order Log {logData?.order_details?.file_number && `- ${logData.order_details.file_number}`}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {canEditOrder() && logData && (
                <Button
                  size="sm"
                  onClick={() => setEditDialogOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Order</span>
                </Button>
              )}
              {canToggleHoldStatus() && (
                <Button
                  size="sm"
                  variant={logData?.order_details?.status === 'On Hold' ? 'default' : 'outline'}
                  onClick={() => {
                    setStatusComment('');
                    setIsStatusDialogOpen(true);
                  }}
                  disabled={isUpdatingStatus}
                  className="flex items-center space-x-2"
                >
                  {isUpdatingStatus ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      {logData?.order_details?.status === 'On Hold' ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Resume Order
                        </>
                      ) : (
                        <>
                          <PauseCircle className="h-4 w-4" />
                          Put On Hold
                        </>
                      )}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading order log...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {logData && (
          <div className="space-y-6">
            {/* Order Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Order Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">File Number:</span>
                      <p className="font-semibold">{logData.order_details.file_number}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Order Type:</span>
                      <p className="font-semibold">{logData.order_details.order_type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <Badge className={`${getStatusColor(logData.order_details.status)} border`}>
                        {logData.order_details.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Priority:</span>
                      <Badge className={`${getPriorityColor(logData.order_details.priority)} border`}>
                        {logData.order_details.priority}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Borrower:</span>
                      <p className="font-semibold">{logData.order_details.borrower_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Owner:</span>
                      <p className="font-semibold">{logData.order_details.owner_name}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-600">Property Address:</span>
                      <p className="font-semibold">
                        {logData.order_details.property_address_line1}
                        {logData.order_details.property_address_line2 && `, ${logData.order_details.property_address_line2}`}
                        <br />
                        {logData.order_details.city}, {logData.order_details.state} {logData.order_details.zip_code}
                        <br />
                        {logData.order_details.county} County
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Client Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="font-semibold">{logData.client_details.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="font-semibold">{logData.client_details.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-600">Phone:</span>
                      <span className="font-semibold">{logData.client_details.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{logData.total_steps}</div>
                    <div className="text-sm text-gray-600">Total Steps</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{logData.completed_steps}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{logData.in_progress_steps}</div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{logData.on_hold_steps}</div>
                    <div className="text-sm text-gray-600">On Hold</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(logData.metrics.completion_percentage)}%
                    </div>
                    <div className="text-sm text-gray-600">Complete</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current State */}
            {logData.current_state.current_step && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Step</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getStatusIcon(logData.current_state.current_step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{logData.current_state.current_step.step_name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(logData.current_state.current_step.status)} border`}>
                            {logData.current_state.current_step.status}
                          </Badge>
                          {canEditOrder() && (
                            <Button 
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => setReassignOpen(true)}
                            >
                              Reassign
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Assigned to:</span>
                          <p>{logData.current_state.current_step.assigned_to.username} ({logData.current_state.current_step.assigned_to.user_type})</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Started:</span>
                          <p>{formatDate(logData.current_state.current_step.started_at)}</p>
                        </div>
                        {logData.current_state.current_step.completed_at && (
                          <div>
                            <span className="font-medium text-gray-600">Completed:</span>
                            <p>{formatDate(logData.current_state.current_step.completed_at)}</p>
                          </div>
                        )}
                        {logData.current_state.current_step.duration && (
                          <div>
                            <span className="font-medium text-gray-600">Duration:</span>
                            <p>{formatDuration(logData.current_state.current_step.duration)}</p>
                          </div>
                        )}
                      </div>
                      {logData.current_state.current_step.comments && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <span className="font-medium text-gray-600">Comments:</span>
                          <p className="mt-1">{logData.current_state.current_step.comments}</p>
                        </div>
                      )}
                      {/* Reassign button moved to header next to status */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  <div className="space-y-6">
                    {logData.timeline.map((event, index) => (
                      <div key={index} className="relative flex items-start space-x-4">
                        {/* Timeline dot */}
                        <div className="relative z-10 flex items-center justify-center w-10 h-10 bg-white border border-blue-200 rounded-full mt-0.5">
                          {event.event_type === 'order_created' && <FileText className="h-5 w-5 text-blue-600" />}
                          {event.event_type === 'step_started' && <Clock className="h-5 w-5 text-blue-600" />}
                          {event.event_type === 'step_completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                          {event.event_type === 'order_updated' && <AlertCircle className="h-5 w-5 text-yellow-600" />}
                          {!['order_created', 'step_started', 'step_completed', 'order_updated'].includes(event.event_type) && 
                            <Calendar className="h-5 w-5 text-gray-600" />
                          }
                        </div>
                        
                        {/* Timeline content */}
                        <div className="flex-1 min-w-0 pb-6 pt-0.5 pr-36 relative">
                          <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
                          <span className="absolute top-0 right-0 text-sm text-gray-500">{formatDate(event.timestamp)}</span>
                          <p className="mt-1 text-gray-600">{event.description}</p>
                          {event.user?.name && (
                            <p className="mt-1 text-sm text-gray-700">
                              <span className="font-medium">By:</span> {event.user.name}
                            </p>
                          )}
                          {event.comments && (
                            <div className="mt-2 px-2 py-2 bg-gray-50 rounded-md text-sm text-gray-700">
                              <span className="font-medium">Comments:</span>
                              <p className="mt-1 whitespace-pre-wrap">{event.comments}</p>
                            </div>
                          )}
                          
                          {/* Additional details */}
                          {event.details && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              {event.details.step_name && (
                                <div className="text-sm">
                                  <span className="font-medium">Step:</span> {event.details.step_name}
                                  {event.details.assigned_user && (
                                    <span className="ml-4">
                                      <span className="font-medium">Assigned to:</span> {event.details.assigned_user.username} ({event.details.assigned_user.user_type})
                                    </span>
                                  )}
                                </div>
                              )}
                              {event.details.order_type && (
                                <div className="text-sm">
                                  <span className="font-medium">Type:</span> {event.details.order_type}
                                  <span className="ml-4">
                                    <span className="font-medium">Priority:</span> {event.details.priority}
                                  </span>
                                </div>
                              )}
                              {event.details.user && (
                                <div className="text-sm">
                                  <span className="font-medium">Updated by:</span> {event.details.user.username} ({event.details.user.user_type})
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Remaining Steps */}
            {logData.remaining_steps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Remaining Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {logData.remaining_steps.map((step, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(step.status)}
                          <div>
                            <h4 className="font-semibold">{step.step_name}</h4>
                            <p className="text-sm text-gray-600">
                              Assigned to: {step.assigned_to.username} ({step.assigned_to.user_type})
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getStatusColor(step.status)} border`}>
                            {step.status}
                          </Badge>
                          {step.started_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              Started: {formatDate(step.started_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Edit Order Dialog */}
        {logData && (
          <EditOrderDialog
            orderId={orderId}
            orderData={logData.order_details}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onOrderUpdated={handleOrderUpdated}
          />
        )}

        {logData?.current_state?.current_step && (
          <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Reassign Step</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select User</label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.username} ({u.user_type})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setReassignOpen(false)}>Cancel</Button>
                  <Button onClick={handleReassign} disabled={!assigneeId || isReassigning}>
                    {isReassigning ? 'Reassigning...' : 'Reassign'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Status Comment Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{logData?.order_details?.status === 'On Hold' ? 'Resume Order' : 'Put Order On Hold'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Comment</label>
                <Textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder={logData?.order_details?.status === 'On Hold' ? 'Reason to resume...' : 'Reason to put on hold...'}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleToggleHoldStatus} disabled={isUpdatingStatus || !statusComment.trim()}>
                  {isUpdatingStatus ? 'Updating...' : (logData?.order_details?.status === 'On Hold' ? 'Resume' : 'Put On Hold')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default OrderLogDialog;
