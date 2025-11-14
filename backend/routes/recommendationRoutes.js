import express from 'express';
import { getRecommendations } from '../controllers/recommendationController.js';
import authJwt from '../config/authJwt.js';

const router = express.Router();

// Protected route - requires authentication
router.post('/recommendations', authJwt.verifyToken, getRecommendations);

export default router;

