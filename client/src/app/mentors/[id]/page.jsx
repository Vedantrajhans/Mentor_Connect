'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, BookOpen, Calendar, Star, Mail, Phone, 
  CheckCircle, Clock, Award, Loader, ArrowLeft 
} from 'lucide-react';
import { getMentorById } from '@/lib/api/mentors';
import { getMentorReviews } from '@/lib/api/reviews'; // ✅ Fixed import
import { BookingModal } from '@/components/features/booking-modal';
import { StarRating } from '@/components/ui/star-rating';
import { getInitials, getAvatarColor, formatRating } from '@/lib/utils/helpers';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function MentorProfilePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mentorId = params.id;
  
  const [mentor, setMentor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  useEffect(() => {
    if (mentorId) {
      loadMentorData();
    }
    
    // Auto-open booking modal if action=book in URL
    if (searchParams.get('action') === 'book') {
      setShowBookingModal(true);
    }
  }, [mentorId]);
  
  const loadMentorData = async () => {
    setLoading(true);
    try {
      const [mentorData, reviewsData] = await Promise.all([
        getMentorById(mentorId),
        getMentorReviews(mentorId).catch(() => []) // Handle if reviews fail
      ]);
      
      setMentor(mentorData);
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error loading mentor:', error);
      toast.error('Failed to load mentor profile');
      router.push('/search');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectSlot = (slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };
  
  const handleBookingSuccess = () => {
    toast.success('Session booked! Check your email for details.');
    router.push('/sessions');
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading mentor profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!mentor) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Mentor not found</p>
          <Button asChild>
            <Link href="/search">Back to Search</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }
  
  const averageRating = mentor?.averageRating || 0;
  const totalReviews = reviews.length;
  
  return (
    <DashboardLayout>
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/search">
          <ArrowLeft size={16} className="mr-2" />
          Back to Search
        </Link>
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Mentor Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className={`w-24 h-24 ${getAvatarColor(mentor.fullName)} rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0`}>
                  {getInitials(mentor.fullName)}
                </div>
                
                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {mentor.fullName}
                  </h1>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin size={18} className="text-purple-500" />
                    <span className="font-medium">{mentor.university}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <BookOpen size={18} className="text-purple-500" />
                    <span>{mentor.program} • Class of {mentor.graduationYear}</span>
                  </div>
                  
                  {/* Rating */}
                  {totalReviews > 0 && (
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <StarRating rating={averageRating} readonly size={20} />
                        <span className="text-lg font-semibold">{formatRating(averageRating)}</span>
                      </div>
                      <span className="text-sm text-gray-500">({totalReviews} reviews)</span>
                    </div>
                  )}
                  
                  {/* Verification Badge */}
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle size={14} />
                      Verified Student
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {mentor.bio}
              </p>
            </CardContent>
          </Card>
          
          {/* Expertise */}
          {mentor.expertise && mentor.expertise.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award size={20} />
                  Expertise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star size={20} />
                Reviews ({totalReviews})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <div key={review._id || index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.reviewer?.fullName || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                        </div>
                        <StarRating rating={review.rating} readonly size={16} />
                      </div>
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Star size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No reviews yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Booking */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} />
                  Book a Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Availability */}
                {mentor.availability && mentor.availability.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Available Slots:</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {mentor.availability.slice(0, 10).map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectSlot(slot)}
                            className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                          >
                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={16} className="text-purple-500" />
                              <span>{formatDateTime(slot)}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => {
                        if (mentor.availability[0]) {
                          handleSelectSlot(mentor.availability[0]);
                        }
                      }}
                    >
                      Book Now
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">No available slots at the moment</p>
                  </div>
                )}
                
                {/* Contact Info */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {mentor.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} className="text-purple-500" />
                      <span className="truncate">{mentor.email}</span>
                    </div>
                  )}
                  {mentor.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} className="text-purple-500" />
                      <span>{mentor.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      {selectedSlot && mentor && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedSlot(null);
          }}
          mentor={mentor}
          selectedSlot={selectedSlot}
          onSuccess={handleBookingSuccess}
        />
      )}
    </DashboardLayout>
  );
}
