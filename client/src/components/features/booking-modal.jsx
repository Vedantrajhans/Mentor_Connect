'use client';

import { useState } from 'react';
import { Calendar, Clock, MessageSquare, Loader } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';
import { createBooking } from '@/lib/api/bookings';
import { formatDate, formatTime } from '@/lib/utils/date';

export const BookingModal = ({ isOpen, onClose, mentor, selectedSlot, onSuccess }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      toast.error('Please enter a topic for the session');
      return;
    }
    
    setLoading(true);
    
    try {
      const bookingData = {
        mentorId: mentor.id,
        startTime: selectedSlot,
        topic: topic.trim(),
      };
      
      const result = await createBooking(bookingData);
      
      toast.success('Session booked successfully!');
      setTopic('');
      onSuccess?.(result);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to book session');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book a Session</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mentor Info */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-1">{mentor.fullName}</h4>
            <p className="text-sm text-gray-600">{mentor.university} • {mentor.program}</p>
          </div>
          
          {/* Selected Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-purple-500" />
              <span className="font-medium">{formatDate(selectedSlot)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-purple-500" />
              <span className="font-medium">{formatTime(selectedSlot)}</span>
            </div>
          </div>
          
          {/* Topic Input */}
          <div className="space-y-2">
            <Label htmlFor="topic">Session Topic *</Label>
            <Textarea
              id="topic"
              placeholder="What would you like to discuss? (e.g., 'Help with Stanford CS application essay')"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={4}
              required
              maxLength={500}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">{topic.length}/500 characters</p>
          </div>
          
          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <MessageSquare size={14} className="inline mr-1" />
              You'll receive a confirmation email with the Zoom link once the booking is confirmed.
            </p>
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
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
