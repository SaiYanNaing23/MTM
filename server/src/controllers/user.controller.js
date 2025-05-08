import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

export const recommendedUsers = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                { _id : { $ne: currentUserId }},
                { $id : { $nin : currentUser.friends }},
                { isOnboarding : true }
            ]
        })
        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error("Error in recommendedUsers controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getMyFriends = async ( req, res ) => {
    try {
        const user = await User.findById(req.user._id).populate("friends", "fullName profilePic nativeLanguage learningLanguage");
        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error in getMyFriends controller:", error);
        res.status(500).json({ message: "Internal server error" });
        
    }
}

export const sendFriendRequest = async ( req, res ) => {
    try {
        const myId = req.user._id;
        const { id: recipientId } = req.params;

        if( myId === recipientId ) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself." });
        }

        const recipient = await User.findById(recipientId);
        if(!recipient) {
            return res.status(404).json({ success : false, message : "Recipient not found."})
        }

        if(recipient.friends.includes(myId)) {
            return res.status(400).json({ success : false, message : "You are already friends."})
        }
        
        const existingRequest = await FriendRequest.findOne({
            $or : [
                { sender : myId, recipient : recipientId },
                { sender : recipientId, recipient : myId }
            ]
        })

        if(existingRequest) {
            return res.status(400).json({ success : false, message : "Friend request already sent."})
        }

        const friendRequest = await FriendRequest.create({
            sender : myId,
            recipient : recipientId
        })
        
        res.status(201).json({ success : true, message : "Friend request sent successfully.", friendRequest });
    } catch (error) {
        console.error("Error in sendFriendRequest controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const acceptFriendRequest = async ( req, res ) => {
    try {
        const { id : requestId } = req.params;
        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest) {
            return res.status(404).json({ success : false, message : "Friend request not found."})
        }

        if(friendRequest.recipient.toString() !== req.user._id) {
            return res.status(403).json({ success : false, message : "You are not authorized to accept this friend request."})
        }
        if(friendRequest.status === "accepted") {
            return res.status(400).json({ success : false, message : "Friend request already accepted."})
        }
        friendRequest.status = "accepted";
        await friendRequest.save();

        // add each other to friends list
        // $addToSet is used to add a value to an array only if it doesn't already exist

        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet : { friends : friendRequest.recipient}
        })

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet : { friends : friendRequest.sender}
        })

        res.status(200).json({ success : true, message : "Friend request accepted successfully."})
    } catch (error) {
        console.error("Error in acceptFriendRequest controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getFriendRequests = async ( req, res ) => {
    try {
        const incomingRequests = await FriendRequest.find({
            recipient : req.user._id,
            status : "pending"
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

        const acceptedRequests = await FriendRequest.find({
            sender : req.user._id,
            status : "accepted"
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json({ incomingRequests, acceptedRequests });
    } catch (error) {
        console.error("Error in getFriendRequests controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getOutGoingFriendRequests= async ( req, res ) => {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender : req.user._id,
            status : "pending"
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");
        res.status(200).json(outgoingRequests);
    } catch (error) {
        console.error("Error in getOutGoingFriendRequests controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}