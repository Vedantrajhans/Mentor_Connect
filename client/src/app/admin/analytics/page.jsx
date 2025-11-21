'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, Users, Calendar, Star, 
  Loader, ArrowUp, ArrowDown 
} from 'lucide-react';
import { getAnalytics } from '@/lib/api/admin';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    loadAnalytics();
  }, []);
  
  const loadAnalytics = async () => {
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to load analytics');
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
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  const metrics = [
    {
      title: 'Total Users',
      value: analytics?.totalUsers || 0,
      change: analytics?.userGrowth || 0,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Active Mentors',
      value: analytics?.activeMentors || 0,
      change: analytics?.mentorGrowth || 0,
      icon: Users,
      color: 'purple',
    },
    {
      title: 'Total Sessions',
      value: analytics?.totalSessions || 0,
      change: analytics?.sessionGrowth || 0,
      icon: Calendar,
      color: 'green',
    },
    {
      title: 'Average Rating',
      value: analytics?.averageRating?.toFixed(1) || '0.0',
      change: analytics?.ratingChange || 0,
      icon: Star,
      color: 'yellow',
    },
  ];
  
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">
          Platform performance and insights
        </p>
      </div>
      
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;
          
          return (
            <Card key={index} className={`border-l-4 border-l-${metric.color}-500`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${metric.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon size={24} className={`text-${metric.color}-600`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    {Math.abs(metric.change)}%
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-xs text-gray-500 mt-1">vs last month</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mentees</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics?.mentees || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mentors</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics?.mentors || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Admins</span>
              <span className="text-lg font-semibold text-gray-900">
                {analytics?.admins || 0}
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Session Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Session Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-lg font-semibold text-green-600">
                {analytics?.completedSessions || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Upcoming</span>
              <span className="text-lg font-semibold text-blue-600">
                {analytics?.upcomingSessions || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cancelled</span>
              <span className="text-lg font-semibold text-red-600">
                {analytics?.cancelledSessions || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Mentor Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              {analytics?.approvalRate || 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics?.approvedMentors || 0} of {analytics?.totalMentorApplications || 0} approved
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {analytics?.avgSessionDuration || 60}m
            </p>
            <p className="text-xs text-gray-500 mt-1">Per session</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Platform Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {analytics?.satisfaction || 95}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Based on {analytics?.totalReviews || 0} reviews
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
