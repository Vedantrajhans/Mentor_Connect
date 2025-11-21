'use client';

import { useState } from 'react';
import { Loader } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { createReview } from '@/lib/api/reviews';
import { StarRating } from '@/components/ui/star-rating';

export const ReviewModal = ({ isOpen, onClose, session, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }
    
    setLoading(true);
    
    try {
      const reviewData = {
        sessionId: session._id,
        rating,
        comment: comment.trim(),
      };
      
      await createReview(reviewData);
      
      toast.success('Review submitted successfully!');
      setRating(0);
      setComment('');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };
  
  const otherUser = session?.mentor || session?.mentee;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Info */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-1">
              Session with {otherUser?.fullName}
            </h4>
            <p className="text-sm text-gray-600">{session?.topic}</p>
          </div>
          
          {/* Rating */}
          <div className="space-y-2">
            <Label>Your Rating *</Label>
            <div className="flex items-center gap-4">
              <StarRating 
                rating={rating} 
                onRatingChange={setRating}
                size={32}
              />
              {rating > 0 && (
                <span className="text-sm font-medium text-gray-700">
                  {rating} out of 5 stars
                </span>
              )}
            </div>
          </div>
          
          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review *</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this session..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              required
              maxLength={1000}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">{comment.length}/1000 characters</p>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader className="animate-spin mr-2" size={16} />}
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
