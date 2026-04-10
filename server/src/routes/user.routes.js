import { Router } from 'express';
import { searchUsers, getPublicKey } from '../controllers/user.controller.js';
import auth from '../middleware/auth.js';

const router = Router();

// All user routes require authentication
router.use(auth);

// GET /api/users/search?q=
router.get('/search', searchUsers);

// GET /api/users/:id/public-key
router.get('/:id/public-key', getPublicKey);

export default router;
