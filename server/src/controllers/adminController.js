// src/controllers/adminController.js
import User from '../models/User.js';
import Session from '../models/Session.js';
import { sendEmail } from '../utils/sendEmail.js';

export const getPendingMentors = async (req, res) => {
  const mentors = await User.find({ role: 'mentor', isApproved: false })
    .select('email profile.fullName profile.university createdAt');
  res.json(mentors);
};

export const approveMentor = async (req, res) => {
  const mentor = await User.findById(req.params.id);
  if (!mentor || mentor.role !== 'mentor') {
    return res.status(404).json({ message: 'Mentor not found' });
  }

  mentor.isApproved = true;
  await mentor.save();

  await sendEmail({
    to: mentor.email,
    subject: 'You’re Now a Verified Mentor!',
    html: `<p>Congratulations, ${mentor.profile.fullName}! Your mentor profile is approved.</p>`,
  });

  res.json({ message: 'Mentor approved' });
};

export const rejectMentor = async (req, res) => {
  const mentor = await User.findById(req.params.id);
  if (!mentor) return res.status(404).json({ message: 'Not found' });

  mentor.isActive = false;
  await mentor.save();

  res.json({ message: 'Mentor rejected' });
};

export const getAnalytics = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalMentors = await User.countDocuments({ role: 'mentor', isApproved: true });
  const totalMentees = await User.countDocuments({ role: 'mentee' });
  const totalSessions = await Session.countDocuments();
  const completedSessions = await Session.countDocuments({ status: 'completed' });

  res.json({
    totalUsers,
    totalMentors,
    totalMentees,
    totalSessions,
    completedSessions,
    pendingMentors: await User.countDocuments({ role: 'mentor', isApproved: false }),
  });
};