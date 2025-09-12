import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Calendar, Building } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user || !user.id || !user.username || !user.role) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No user information available</p>
        </div>
      </div>
    );
  }

  const getRoleColor = (role: string) => {
    switch (role) {
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
                  <p className="text-gray-900">{user.email || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Role</p>
                  <Badge className={`${getRoleColor(user.role)} border mt-1`}>
                    {user.role}
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
              <Badge className={`${getRoleColor(user.role)} border`}>
                {user.role}
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
                {(user.role === 'Admin' || user.role === 'Supervisor') && (
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
