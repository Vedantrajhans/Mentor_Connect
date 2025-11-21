'use client';

import { useEffect, useState } from 'react';
import { MentorLayout } from '@/components/layout/mentor-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, Loader, TrendingUp } from 'lucide-react';
import { getMentorReviews } from '@/lib/api/reviews';
import { useAuth } from '@/hooks/useAuth';
import { StarRating } from '@/components/ui/star-rating';
import { formatDate } from '@/lib/utils/date';
import { getInitials, getAvatarColor, formatRating } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

export default function MentorReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  
  useEffect(() => {
    loadReviews();
  }, []);
  
  const loadReviews = async () => {
    try {
      const data = await getMentorReviews(user?.id);
      setReviews(data);
      
      // Calculate stats
      if (data.length > 0) {
        const total = data.length;
        const sum = data.reduce((acc, r) => acc + r.rating, 0);
        const avg = sum / total;
        
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        data.forEach(r => {
          distribution[r.rating]++;
        });
        
        setStats({
          averageRating: avg,
          totalReviews: total,
          ratingDistribution: distribution,
        });
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <MentorLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </MentorLayout>
    );
  }
  
  return (
    <MentorLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reviews</h1>
        <p className="text-gray-600">
          See what mentees are saying about your sessions
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Average Rating */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <p className="text-5xl font-bold text-gray-900">
                  {formatRating(stats.averageRating)}
                </p>
                <p className="text-gray-600 mt-1">out of 5.0</p>
              </div>
              <StarRating rating={stats.averageRating} readonly size={24} />
              <p className="text-sm text-gray-600 mt-4">
                Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
          
          {/* Rating Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = stats.ratingDistribution[rating];
                const percentage = stats.totalReviews > 0 
                  ? (count / stats.totalReviews) * 100 
                  : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-8">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
        
        {/* Reviews List */}
        <div className="lg:col-span-2">
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 ${getAvatarColor(review.reviewer?.fullName)} rounded-full flex items-center justify-center text-white font-semibold`}>
                          {getInitials(review.reviewer?.fullName || 'Anonymous')}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {review.reviewer?.fullName || 'Anonymous'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {review.reviewer?.university || 'Student'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} readonly size={18} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {review.session?.topic && (
                      <div className="bg-purple-50 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-purple-900">Session Topic:</p>
                        <p className="text-sm text-purple-700">{review.session.topic}</p>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2">
                      <MessageSquare size={16} className="text-gray-400 mt-1 flex-shrink-0" />
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
                  Complete sessions to receive reviews from your mentees
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MentorLayout>
  );
}
