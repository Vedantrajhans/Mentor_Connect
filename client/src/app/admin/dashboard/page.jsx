'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, Calendar, Star, TrendingUp, 
  UserCheck, CheckCircle, XCircle, Clock,
  Loader
} from 'lucide-react';
import { getAnalytics, getPendingMentors } from '@/lib/api/admin';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      const [analyticsData, pendingMentors] = await Promise.all([
        getAnalytics().catch(() => null),
        getPendingMentors().catch(() => [])
      ]);
      
      setStats(analyticsData);
      setPendingCount(pendingMentors.length || 0);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout pendingCount={pendingCount}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Platform overview and management
        </p>
      </div>
      
      {/* Pending Approvals Alert */}
      {pendingCount > 0 && (
        <Card className="mb-6 border-l-4 border-l-yellow-500 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserCheck size={24} className="text-yellow-600" />
                <div>
                  <h3 className="font-semibold text-yellow-900">
                    {pendingCount} Mentor{pendingCount !== 1 ? 's' : ''} Pending Approval
                  </h3>
                  <p className="text-sm text-yellow-800">
                    Review and approve mentor applications
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/admin/mentors">
                  Review Now
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.mentees || 0} Mentees, {stats?.mentors || 0} Mentors
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalSessions || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.completedSessions || 0} Completed
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved Mentors</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.approvedMentors || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.activeMentors || 0} Active
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg. Rating</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.averageRating?.toFixed(1) || '0.0'}
                  <span className="text-lg text-gray-500">/5.0</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.totalReviews || 0} Reviews
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star size={24} className="text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-yellow-600">{pendingCount}</span>
              <Clock className="text-yellow-500" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">
                {stats?.upcomingSessions || 0}
              </span>
              <Calendar className="text-blue-500" size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Platform Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">
                +{stats?.newUsersThisMonth || 0}
              </span>
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <p className="text-xs text-gray-500 mt-1">New users this month</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/mentors">
                <UserCheck size={18} className="mr-2" />
                Review Mentors
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/users">
                <Users size={18} className="mr-2" />
                Manage Users
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/admin/analytics">
                <TrendingUp size={18} className="mr-2" />
                View Analytics
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
