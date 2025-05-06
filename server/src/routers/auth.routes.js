import express from 'express';
import { signUp, login, logout, onboard } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/signup", signUp)
router.post("/login", login)
router.post("/logout", logout)
router.post("/onboarding", protectRoute, onboard)

export default router;