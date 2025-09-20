import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { changePassword } from '@/services/passwordService';
import { User, Mail, Shield, Calendar, Building, Key, Lock } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, token } = useAuth();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (!user?.id || !token || isChangingPassword) return;

    // Validation
    if (!passwordData.old_password) {
      toast({
        title: "Validation Error",
        description: "Current password is required",
        variant: "destructive"
      });
      return;
    }

    if (!passwordData.new_password || passwordData.new_password.length < 8) {
      toast({
        title: "Validation Error",
        description: "New password must be at least 8 characters",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.old_password === passwordData.new_password) {
      toast({
        title: "Validation Error",
        description: "New password must be different from current password",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await changePassword(user.id, passwordData, token);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Password changed successfully"
        });
        setIsPasswordDialogOpen(false);
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      } else {
        throw new Error(result.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user || !user.id || !user.username || !user.user_type) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No user information available</p>
        </div>
      </div>
    );
  }

  const getUserTypeColor = (user_type: string) => {
    switch (user_type) {
      case 'Admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Supervisor':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Processor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'QC':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Typist':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Auditor':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account information and settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{user.username}</h3>
                <p className="text-gray-600">@{user.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">{(user as any).email || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">User Type</p>
                  <Badge className={`${getUserTypeColor(user.user_type)} border mt-1`}>
                    {user.user_type}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">User ID</p>
                  <p className="text-gray-900 font-mono text-sm">{user.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Account Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Account Status</span>
              <Badge className="bg-green-100 text-green-800 border-green-200 border">
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Access Level</span>
              <Badge className={`${getUserTypeColor(user.user_type)} border`}>
                {user.user_type}
              </Badge>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Permissions</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">View Dashboard</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Access Work Area</span>
                  <span className="text-green-600">✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">View My Queue</span>
                  <span className="text-green-600">✓</span>
                </div>
                {(user.user_type === 'Admin' || user.user_type === 'Supervisor') && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Create Orders</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Manage Users</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Manage Clients</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>Password & Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Password</p>
                <p className="text-xs text-gray-500">Change your account password</p>
              </div>
              <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Change Password</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Current Password *
                      </label>
                      <Input
                        type="password"
                        value={passwordData.old_password}
                        onChange={(e) => {
                          console.log('Old password input changed:', e.target.value);
                          setPasswordData(prev => ({ ...prev, old_password: e.target.value }));
                        }}
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        New Password *
                      </label>
                      <Input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => {
                          console.log('New password input changed:', e.target.value);
                          setPasswordData(prev => ({ ...prev, new_password: e.target.value }));
                        }}
                        placeholder="Enter new password"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Confirm New Password *
                      </label>
                      <Input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => {
                          console.log('Confirm password input changed:', e.target.value);
                          setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }));
                        }}
                        placeholder="Confirm new password"
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsPasswordDialogOpen(false);
                          setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePasswordChange}
                        disabled={isChangingPassword}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isChangingPassword && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        )}
                        {isChangingPassword ? 'Changing...' : 'Change Password'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="font-medium text-gray-600 mb-1">Last Login</p>
              <p className="text-gray-900">Current Session</p>
            </div>
            <div>
              <p className="font-medium text-gray-600 mb-1">Session Status</p>
              <Badge className="bg-green-100 text-green-800 border-green-200 border">
                Active
              </Badge>
            </div>
            <div>
              <p className="font-medium text-gray-600 mb-1">Application Version</p>
              <p className="text-gray-900">v1.0.0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
