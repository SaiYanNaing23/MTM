import express from 'express';
import { signUp, login, logout, onboard, me } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/signup", signUp)
router.post("/login", login)
router.post("/logout", logout)
router.post("/onboarding", protectRoute, onboard)

// if user is logging in,
router.get("/me", protectRoute, me)

export default router;