import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { recommendedUsers, getMyFriends, sendFriendRequest, acceptFriendRequest, getFriendRequests, getOutGoingFriendRequests } from '../controllers/user.controller.js';

const router = express.Router();

// middleware
router.use(protectRoute);

router.get("/", recommendedUsers);
router.get("/friends", getMyFriends);
router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.get("/friend-requests", getFriendRequests);
router.get("outgoing-friend-requests", getOutGoingFriendRequests)

export default router;