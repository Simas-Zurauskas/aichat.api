import express from 'express';
import { protect } from '@middleware/authMiddleware';
import { deleteAccount } from '@controlers/account';

const router = express.Router();

router.delete('/', protect, deleteAccount);

export { router as accountRoutes };
