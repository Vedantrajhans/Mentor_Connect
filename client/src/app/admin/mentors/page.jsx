'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  CheckCircle, XCircle, Loader, Eye, Mail, Phone, 
  BookOpen, Award, Calendar, ExternalLink 
} from 'lucide-react';
import { getPendingMentors, approveMentor, rejectMentor } from '@/lib/api/admin';
import { getInitials, getAvatarColor } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

export default function MentorApprovalsPage() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  
  useEffect(() => {
    loadPendingMentors();
  }, []);
  
  const loadPendingMentors = async () => {
    try {
      const data = await getPendingMentors();
      setMentors(data);
    } catch (error) {
      toast.error('Failed to load pending mentors');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (mentorId) => {
    setProcessing(mentorId);
    try {
      await approveMentor(mentorId);
      toast.success('Mentor approved successfully!');
      loadPendingMentors();
    } catch (error) {
      toast.error('Failed to approve mentor');
    } finally {
      setProcessing(null);
    }
  };
  
  const handleRejectClick = (mentor) => {
    setSelectedMentor(mentor);
    setShowRejectModal(true);
  };
  
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    setProcessing(selectedMentor._id);
    try {
      await rejectMentor(selectedMentor._id, rejectReason);
      toast.success('Mentor application rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedMentor(null);
      loadPendingMentors();
    } catch (error) {
      toast.error('Failed to reject mentor');
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
            <p className="text-gray-600">Loading pending mentors...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout pendingCount={mentors.length}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentor Approvals</h1>
        <p className="text-gray-600">
          Review and approve mentor applications
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600">{mentors.length}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Mentors List */}
      {mentors.length > 0 ? (
        <div className="space-y-6">
          {mentors.map((mentor) => (
            <Card key={mentor._id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left - Profile Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 ${getAvatarColor(mentor.profile?.fullName)} rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
                        {getInitials(mentor.profile?.fullName || 'Unknown')}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {mentor.profile?.fullName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <BookOpen size={16} className="text-purple-500" />
                          <span>{mentor.profile?.university}</span>
                        </div>
                        <Badge variant="warning">Pending Approval</Badge>
                      </div>
                    </div>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Program</p>
                        <p className="text-sm font-medium text-gray-900">
                          {mentor.profile?.program}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Graduation Year</p>
                        <p className="text-sm font-medium text-gray-900">
                          {mentor.profile?.graduationYear}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <Mail size={14} />
                          {mentor.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <Phone size={14} />
                          {mentor.profile?.phone}
                        </p>
                      </div>
                    </div>
                    
                    {/* Bio */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Bio</p>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {mentor.profile?.bio}
                      </p>
                    </div>
                    
                    {/* Expertise */}
                    {mentor.profile?.expertise?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Expertise</p>
                        <div className="flex flex-wrap gap-2">
                          {mentor.profile.expertise.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Availability Count */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} className="text-purple-500" />
                      <span>
                        {mentor.profile?.availability?.length || 0} time slots available
                      </span>
                    </div>
                  </div>
                  
                  {/* Right - Student ID & Actions */}
                  <div className="lg:w-80 space-y-4">
                    {/* Student ID Proof */}
                    {mentor.profile?.studentIdProof && (
                      <Card className="bg-gray-50">
                        <CardHeader>
                          <CardTitle className="text-sm">Student ID Proof</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-white rounded-lg p-2 border border-gray-200">
                            <img 
                              src={mentor.profile.studentIdProof} 
                              alt="Student ID"
                              className="w-full h-auto rounded"
                            />
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => window.open(mentor.profile.studentIdProof, '_blank')}
                          >
                            <ExternalLink size={14} className="mr-2" />
                            View Full Size
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Actions */}
                    <div className="space-y-2">
                      <Button 
                        className="w-full"
                        onClick={() => handleApprove(mentor._id)}
                        disabled={processing === mentor._id}
                      >
                        {processing === mentor._id ? (
                          <>
                            <Loader className="animate-spin mr-2" size={16} />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} className="mr-2" />
                            Approve Mentor
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleRejectClick(mentor)}
                        disabled={processing === mentor._id}
                      >
                        <XCircle size={16} className="mr-2" />
                        Reject Application
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">
              No pending mentor applications to review
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Mentor Application</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please provide a reason for rejecting{' '}
              <span className="font-medium">{selectedMentor?.profile?.fullName}</span>'s application.
              This will be sent to them via email.
            </p>
            
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
                setSelectedMentor(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} />
                  Rejecting...
                </>
              ) : (
                'Confirm Rejection'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
