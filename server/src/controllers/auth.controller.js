import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import { generateJwtToken } from "../utils/generateToken.js";

export const signUp = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if( !fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if(password.length < 6){
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if( existingUser ){
            return res.status(400).json({ message: "Email already exists" });
        }

        const idx = Math.floor(Math.random() * 100) + 1;

        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            fullName,
            email,
            password,
            profilePic: randomAvatar,
        })

        if(newUser){
            // TODO : create the user in stream as well
            try {
                await upsertStreamUser({
                    id : newUser._id.toString(),
                    name : newUser.fullName,
                    image : newUser.profilePic || "",
                })
                console.log("Stream user created successfully" + newUser.fullName);
            } catch (error) {
                console.error("Error creating stream user:", error);
            }
            generateJwtToken(newUser._id, res);
            res.status(201).json({success : true, user : newUser});
        }
    } catch (error) {
        console.error("Error signing up:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const login = async ( req, res ) => {
    const { email, password } = req.body;

    try {
        if( !email || !password ){
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email }).select("+password");
        if(!user){
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await user.matchPassword(password);
        if(!isMatch){
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateJwtToken(user._id, res);
        res.status(200).json({ success : true, user });
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const logout = async ( req, res ) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
}

export const onboard = async ( req, res ) => {
    try {
        const userId = req.user._id;
        const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

        if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location){
            return res.status(400).json({ 
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ].filter(Boolean),
            });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarding: true,
        }, { new: true });

        if(!updatedUser){
            return res.status(400).json({ message: "User not found" });
        }

        try {
            await upsertStreamUser({
                id : updatedUser._id.toString(),
                name : updatedUser.fullName,
                image : updatedUser.profilePic || "",
            })
            console.log("Stream user updated successfully" + updatedUser.fullName);
        } catch (error) {
            console.error("Error updating stream user:", error);
        }

        res.status(200).json({ success: true, user: updatedUser });
        
    } catch (error) {
        console.error("Error during onboarding:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const me = async ( req, res ) => {
    res.status(200).json({ success: true, user: req.user });
}   