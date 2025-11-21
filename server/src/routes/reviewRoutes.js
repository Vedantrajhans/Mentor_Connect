import express from 'express';
import { submitReview } from '../controllers/reviewController.js';
import { protect } from '../middlewares/auth.js';


const reviewRoutes = express.Router();

reviewRoutes.post('/', protect, submitReview);

export default reviewRoutes;