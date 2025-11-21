'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, Loader, Clock, Video, 
  CheckCircle, XCircle, Users 
} from 'lucide-react';
import { getAllSessions } from '@/lib/api/admin';
import { getInitials, getAvatarColor } from '@/lib/utils/helpers';
import { formatDateTime } from '@/lib/utils/date';
import toast from 'react-hot-toast';

export default function SessionsManagementPage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    loadSessions();
  }, []);
  
  const loadSessions = async () => {
    try {
      const data = await getAllSessions();
      setSessions(data);
    } catch (error) {
      toast.error('Failed to load sessions');
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
            <p className="text-gray-600">Loading sessions...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  const allSessions = sessions;
  const upcomingSessions = sessions.filter(s => s.status === 'pending');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled');
  
  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'default', label: 'Upcoming' },
      completed: { variant: 'success', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    };
    
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };
  
  const renderSessionsList = (sessionsList) => {
    if (sessionsList.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar size={40} className="mx-auto mb-3 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions found</h3>
            <p className="text-gray-600">
              Sessions will appear here when they are booked
            </p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-4">
        {sessionsList.map((session) => (
          <Card key={session._id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Session Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {session.topic}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar size={16} className="text-purple-500" />
                        <span>{formatDateTime(session.startTime)}</span>
                      </div>
                      {session.zoomLink && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Video size={16} className="text-purple-500" />
                          <span className="text-purple-600 truncate">
                            {session.zoomLink}
                          </span>
                        </div>
                      )}
                    </div>
                    {getStatusBadge(session.status)}
                  </div>
                  
                  {/* Participants */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    {/* Mentor */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${getAvatarColor(session.mentor?.fullName || session.mentor?.profile?.fullName)} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
                        {getInitials(session.mentor?.fullName || session.mentor?.profile?.fullName || 'M')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Mentor</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.mentor?.fullName || session.mentor?.profile?.fullName || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {session.mentor?.profile?.university || session.mentor?.university || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Mentee */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${getAvatarColor(session.mentee?.fullName)} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
                        {getInitials(session.mentee?.fullName || 'M')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Mentee</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.mentee?.fullName || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {session.mentee?.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sessions Management</h1>
        <p className="text-gray-600">
          View and manage all mentoring sessions
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total Sessions</p>
            <p className="text-3xl font-bold text-gray-900">{allSessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Upcoming</p>
            <p className="text-3xl font-bold text-blue-600">{upcomingSessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completedSessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Cancelled</p>
            <p className="text-3xl font-bold text-red-600">{cancelledSessions.length}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All ({allSessions.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedSessions.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledSessions.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {renderSessionsList(allSessions)}
        </TabsContent>
        
        <TabsContent value="upcoming">
          {renderSessionsList(upcomingSessions)}
        </TabsContent>
        
        <TabsContent value="completed">
          {renderSessionsList(completedSessions)}
        </TabsContent>
        
        <TabsContent value="cancelled">
          {renderSessionsList(cancelledSessions)}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
