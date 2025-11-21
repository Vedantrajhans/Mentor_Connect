// src/controllers/reviewController.js
import Review from '../models/Review.js';
import Session from '../models/Session.js';
import User from '../models/User.js';

export const submitReview = async (req, res) => {
  const { sessionId, rating, comment } = req.body;
  const reviewerId = req.user.id;

  try {
    const session = await Session.findById(sessionId).populate('mentee mentor');
    if (!session || session.status !== 'completed') {
      return res.status(400).json({ message: 'Session not completed' });
    }

    const isMentee = session.mentee._id.toString() === reviewerId;
    const isMentor = session.mentor._id.toString() === reviewerId;
    if (!isMentee && !isMentor) {
      return res.status(403).json({ message: 'Not part of this session' });
    }

    if (isMentee && session.reviewedByMentee) {
      return res.status(400).json({ message: 'You already reviewed' });
    }
    if (isMentor && session.reviewedByMentor) {
      return res.status(400).json({ message: 'You already reviewed' });
    }

    const revieweeId = isMentee ? session.mentor._id : session.mentee._id;

    const review = await Review.create({
      session: sessionId,
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating,
      comment,
    });

    // Update rating
    const reviews = await Review.find({ reviewee: revieweeId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await User.findByIdAndUpdate(revieweeId, {
      'profile.rating': avgRating,
      'profile.totalReviews': reviews.length,
    });

    // Mark reviewed
    if (isMentee) session.reviewedByMentee = true;
    if (isMentor) session.reviewedByMentor = true;
    await session.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};