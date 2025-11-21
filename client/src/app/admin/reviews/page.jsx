'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, Loader } from 'lucide-react';
import { getAllSessions } from '@/lib/api/admin';
import { StarRating } from '@/components/ui/star-rating';
import { formatDate } from '@/lib/utils/date';
import { getInitials, getAvatarColor } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  
  useEffect(() => {
    loadReviews();
  }, []);
  
  const loadReviews = async () => {
    try {
      // Get all completed sessions with reviews
      const sessions = await getAllSessions();
      const reviewsList = sessions
        .filter(s => s.status === 'completed' && s.review)
        .map(s => ({
          ...s.review,
          session: s,
        }));
      
      setReviews(reviewsList);
    } catch (error) {
      toast.error('Failed to load reviews');
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
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
    : 0;
  
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews</h1>
        <p className="text-gray-600">
          All platform reviews and feedback
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-5xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </p>
            <StarRating rating={averageRating} readonly size={24} />
            <p className="text-sm text-gray-600 mt-2">
              Average platform rating
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-5xl font-bold text-gray-900 mb-2">
              {reviews.length}
            </p>
            <p className="text-sm text-gray-600">
              Total reviews
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 ${getAvatarColor(review.reviewer?.fullName || 'User')} rounded-full flex items-center justify-center text-white font-semibold`}>
                      {getInitials(review.reviewer?.fullName || 'User')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {review.reviewer?.fullName || 'Anonymous'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        reviewed {review.reviewee?.fullName || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(review.createdAt || new Date())}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating || 0} readonly size={18} />
                </div>
              </CardHeader>
              <CardContent>
                {review.session?.topic && (
                  <div className="bg-purple-50 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-purple-900">Session:</p>
                    <p className="text-sm text-purple-700">{review.session.topic}</p>
                  </div>
                )}
                
                <div className="flex items-start gap-2">
                  <MessageSquare size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-700 leading-relaxed">{review.comment || 'No comment'}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Star size={40} className="mx-auto mb-3 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">
              Reviews will appear here as users complete sessions
            </p>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}
