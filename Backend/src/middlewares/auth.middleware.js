import User from "../models/users.models.js"
import { apiError } from "../utils/apiError.js"
import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"

const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        
        const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken

        if(!token){
            throw new apiError(400, "Token not found")
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select('-password -refreshToken')
        if(!user){
            throw new apiError(400, "Invalid access token")
        }

        req.user = user
        next()

    } catch (error) {
        throw new apiError(401, error?.message || "Invalid access token")
    }
})

const verifyOTP = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body;

    // Check if email and otp are provided
    if (!email || !otp) {
        throw new apiError(400, "Email and OTP are required");
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
        throw new apiError(400, "User not found");
    }

    // Check if OTP exists and is not expired
    if (user.otp && user.otp.expiresAt > Date.now()) {
        // Compare OTP value
        if (user.otp.value === otp) {
            // If OTP is valid, proceed to next middleware or route handler
            req.user = user
            return next(); // Call next() to continue with password reset logic
        } else {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
    } else {
        return res.status(400).json({ message: 'OTP expired or not generated' });
    }
});


export { verifyJWT, verifyOTP }