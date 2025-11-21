'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Filter, Mail, Calendar, 
  Loader, UserX, UserCheck 
} from 'lucide-react';
import { getAllUsers, updateUserStatus } from '@/lib/api/admin';
import { getInitials, getAvatarColor } from '@/lib/utils/helpers';
import { formatDate } from '@/lib/utils/date';
import toast from 'react-hot-toast';

export default function UsersManagementPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [processing, setProcessing] = useState(null);
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, users]);
  
  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  const filterUsers = () => {
    let filtered = users;
    
    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.fullName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.profile?.university?.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(filtered);
  };
  
  const handleToggleStatus = async (userId, currentStatus) => {
    setProcessing(userId);
    try {
      await updateUserStatus(userId, !currentStatus);
      toast.success(`User ${currentStatus ? 'activated' : 'suspended'} successfully`);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setProcessing(null);
    }
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  const stats = {
    total: users.length,
    mentees: users.filter(u => u.role === 'mentee').length,
    mentors: users.filter(u => u.role === 'mentor').length,
    admins: users.filter(u => u.role === 'admin').length,
  };
  
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">
          Manage all platform users
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Mentees</p>
            <p className="text-3xl font-bold text-blue-600">{stats.mentees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Mentors</p>
            <p className="text-3xl font-bold text-purple-600">{stats.mentors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Admins</p>
            <p className="text-3xl font-bold text-red-600">{stats.admins}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or university..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 'mentee', 'mentor', 'admin'].map(role => (
                <Button
                  key={role}
                  variant={roleFilter === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter(role)}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                  {role !== 'all' && ` (${stats[role + 's'] || stats[role]})`}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Results */}
      <p className="text-sm text-gray-600 mb-4">
        Showing {filteredUsers.length} of {users.length} users
      </p>
      
      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 ${getAvatarColor(user.fullName)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                      {getInitials(user.fullName || 'User')}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {user.fullName || 'No Name'}
                        </h3>
                        <Badge 
                          variant={
                            user.role === 'admin' ? 'destructive' :
                            user.role === 'mentor' ? 'default' : 'secondary'
                          }
                          className="capitalize"
                        >
                          {user.role}
                        </Badge>
                        {user.isApproved === false && user.role === 'mentor' && (
                          <Badge variant="warning">Pending</Badge>
                        )}
                        {user.suspended && (
                          <Badge variant="destructive">Suspended</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail size={14} />
                          {user.email}
                        </p>
                        
                        {user.profile?.university && (
                          <p className="text-sm text-gray-600">
                            {user.profile.university} • {user.profile.program}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12} />
                          Joined {formatDate(user.createdAt || new Date())}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={user.suspended ? 'default' : 'destructive'}
                      size="sm"
                      onClick={() => handleToggleStatus(user._id, user.suspended)}
                      disabled={processing === user._id}
                    >
                      {processing === user._id ? (
                        <Loader className="animate-spin" size={16} />
                      ) : user.suspended ? (
                        <>
                          <UserCheck size={16} className="mr-2" />
                          Activate
                        </>
                      ) : (
                        <>
                          <UserX size={16} className="mr-2" />
                          Suspend
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Search size={40} className="mx-auto mb-3 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}
