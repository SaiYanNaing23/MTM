import { generateStreamToken } from "../lib/stream.js";

export const getStreamToken = async (req, res) => {
    try {
        const token = generateStreamToken(req.user._id);

        res.status(200).json({token});
    } catch (error) {
        console.error("Error generating Stream token:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}