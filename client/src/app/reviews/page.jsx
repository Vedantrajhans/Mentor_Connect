'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, Loader } from 'lucide-react';
import { getMyReviews } from '@/lib/api/reviews';
import { StarRating } from '@/components/ui/star-rating';
import { formatDate } from '@/lib/utils/date';
import { getInitials, getAvatarColor } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadReviews();
  }, []);
  
  const loadReviews = async () => {
    try {
      const data = await getMyReviews();
      setReviews(data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your reviews...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reviews</h1>
        <p className="text-gray-600">
          Reviews you've given to your mentors
        </p>
      </div>
      
      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 ${getAvatarColor(review.reviewee.fullName)} rounded-full flex items-center justify-center text-white font-semibold`}>
                      {getInitials(review.reviewee.fullName)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.reviewee.fullName}</h3>
                      <p className="text-sm text-gray-600">{review.reviewee.university}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} readonly size={18} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-purple-900 mb-2">Session Topic:</p>
                  <p className="text-sm text-purple-700">{review.session?.topic}</p>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Your Review:
                  </p>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={32} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-6">
              Complete sessions and leave reviews to help other mentees
            </p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
