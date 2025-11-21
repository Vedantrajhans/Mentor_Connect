'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Loader } from 'lucide-react';
import { getMyBookings, completeSession } from '@/lib/api/bookings';
import { SessionCard } from '@/components/features/session-card';
import { ReviewModal } from '@/components/features/review-modal';
import toast from 'react-hot-toast';

export default function MySessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  
  useEffect(() => {
    loadSessions();
  }, []);
  
  const loadSessions = async () => {
    try {
      const data = await getMyBookings();
      setSessions(data);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompleteSession = async (sessionId) => {
    try {
      await completeSession(sessionId);
      toast.success('Session marked as complete');
      loadSessions();
    } catch (error) {
      toast.error('Failed to complete session');
    }
  };
  
  const handleJoinSession = (zoomLink) => {
    window.open(zoomLink, '_blank');
    toast.success('Opening Zoom meeting...');
  };
  
  const handleReviewClick = (session) => {
    setSelectedSession(session);
    setShowReviewModal(true);
  };
  
  const handleReviewSuccess = () => {
    loadSessions();
  };
  
  const upcomingSessions = sessions.filter(s => s.status === 'pending');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled');
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your sessions...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  const renderSessionsList = (sessionsList, emptyMessage) => {
    if (sessionsList.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions found</h3>
            <p className="text-gray-600">{emptyMessage}</p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessionsList.map(session => (
          <SessionCard
            key={session._id}
            session={session}
            onComplete={handleCompleteSession}
            onReview={handleReviewClick}
            onJoin={handleJoinSession}
            userRole="mentee"
          />
        ))}
      </div>
    );
  };
  
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Sessions</h1>
        <p className="text-gray-600">
          Manage your mentorship sessions
        </p>
      </div>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Upcoming</p>
            <p className="text-3xl font-bold text-purple-600">{upcomingSessions.length}</p>
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
        
        <TabsContent value="upcoming">
          {renderSessionsList(
            upcomingSessions,
            'You have no upcoming sessions. Browse mentors to book a session!'
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {renderSessionsList(
            completedSessions,
            'You haven\'t completed any sessions yet.'
          )}
        </TabsContent>
        
        <TabsContent value="cancelled">
          {renderSessionsList(
            cancelledSessions,
            'No cancelled sessions.'
          )}
        </TabsContent>
      </Tabs>
      
      {/* Review Modal */}
      {selectedSession && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedSession(null);
          }}
          session={selectedSession}
          onSuccess={handleReviewSuccess}
        />
      )}
    </DashboardLayout>
  );
}
