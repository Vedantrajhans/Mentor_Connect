import express from 'express';
import {
  getPendingMentors,
  approveMentor,
  rejectMentor,
  getAnalytics,
} from '../controllers/adminController.js';
import { authorize, protect } from '../middlewares/auth.js';


const adminRoutes = express.Router();

adminRoutes.use(protect, authorize('admin'));
adminRoutes.get('/mentors/pending', getPendingMentors);
adminRoutes.post('/mentors/:id/approve', approveMentor);
adminRoutes.post('/mentors/:id/reject', rejectMentor);
adminRoutes.get('/analytics', getAnalytics);

export default adminRoutes;