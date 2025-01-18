import express from 'express';
import { googleCallback } from '@controlers/auth/google';
import { authorise } from '@controlers/auth';
import { protect } from '@middleware/authMiddleware';

const router = express.Router();

router.get('/google/callback', googleCallback);
router.get('/authorise', protect, authorise);

export { router as authRoutes };
