import User from "../models/users.models.js"
import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { randomInt } from 'crypto'
import { sendMail } from "../utils/mailerConfig.js"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId).select("-password -refreshToken")
        if(!user) {
            throw new Error("User not found")
        }
        
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new Error(`Error generating tokens: ${error.message}`)
    }
}

const generateOTP = () => {

    let res = '';

    for(let i=0;i<6;i++){
        res+=randomInt(0,10);
    }
    return res;
} 

const registerUser = asyncHandler(async(req,res) => {

    const {name, phone, email, password, dob, gender, occupation, role} = req.body;

    if(!name || !email || !password){
        throw new apiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({email});
    if(existingUser){
        throw new apiError(409, "User already exists")
    }

    const createdUser = await User.create({
        name,
        phone,
        email,
        password,
        dob,
        gender,
        occupation,
        role
    })

    const savedUser = await User.findById(createdUser._id)
                            .select('-password -refreshToken')
    if(!savedUser){
        throw new apiError(500, "User not created")
    }

    return res
            .status(201)
            .json(
                new apiResponse(
                    200,
                    savedUser,
                    "User created successfully"
                )
            )

})

const loginUser = asyncHandler(async(req,res) => {

    const {email, password} = req.body;

    if(!email || !password){
        throw new apiError(400, 'Email and Password are required')
    }
    
    const user = await User.findOne({email})
    if(!user){
        throw new apiError(404, 'User Not Found')
    }
    
    const isPasswordCorrect = await user.isPasswordValid(password)
    if(!isPasswordCorrect){
        throw new apiError(401, 'Invalid Login Credentials')
    }       

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    if(!loggedInUser){
        throw new apiError(500, 'Login Failed')
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser, accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req?.user._id,
        {
            $set: {refreshToken: undefined}
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new apiResponse(
                200,
                {},
                "User logged out successfully"
            )
        )
})

const generateAndSaveOtp = asyncHandler(async(req,res)=>{

    const { email } = req.body;
    if(!email){
        throw new apiError(400, "Email is required")
    }

    const user = await User.findOne({email})
    if(!user){
        throw new apiError(400, "User not found")
    }

    const generatedOTP = generateOTP()
    const expiresAt = new Date(Date.now()+10*60*1000); //5mins

    user.otp = {
        value: generatedOTP,
        expiresAt
    }

    await user.save()

    try {
        
        await sendMail(
            user.email,
            "",
            `
                <p>Hello ${user.name},</p>
                <p>We received a request to reset your password for your account. Please use the One-Time Password (OTP) below to complete the process:</p>
                <h2 style="color: #007bff;">${generatedOTP}</h2>
                <p>This OTP is valid for <strong>5 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
                <p>If you need any assistance, feel free to contact our support team.</p>
                <p>Thank you,<br/>The <strong>StayFinder</strong> Team</p>
            `
        )

        return res.status(200).json({ message: "OTP sent to your email" });

    } catch (error) {
        throw new apiError(500, "Failed to send the OTP")
    }

})

const resetPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword) {
        throw new apiError(400, 'Password is required');
    }

    const email = req?.user?.email;
    const user = await User.findOne({ email });
    
    if (!user) {
        throw new apiError(404, 'User not found');
    }

    user.password = newPassword;
    user.markModified('password');

    try {
        await user.save();
        return res.status(200).json(new apiResponse(200, {user}, "Password Reset Successfully"));
    } catch (error) {
        throw new apiError(500, 'Failed to update password');
    }
});

const updateProfileDetails = asyncHandler(async(req,res)=>{
    // const {email, name, phone, password, dob, gender,occupation, role} = req.body;
    
    const allowedFields = ['email', 'name', 'phone', 'password', 'dob', 'gender', 'occupation', 'role']

    const updatedFields = Object.keys(req.body).reduce((acc,key) => {
        if(allowedFields.includes(key) && req.body[key]){
            acc[key] = req.body[key]
        }
        return acc;
    },{})

    if(Object.keys(updatedFields).length === 0){
        return res
            .status(400)
            .json(
                new apiResponse(
                    400,
                    "No valid fields to update"
                )
            )
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        updatedFields,
        {new: true}
    )

    if(!updatedUser){
        return res
            .status(400)
            .json(
                new apiResponse(
                    400,
                    "User not found"
                )
            )
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                updatedUser,
                "Profile Updated Successfully"
            )
        )

})

const getCurrentUser = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user?._id).select("-password -refreshToken -otp")
    if(!user){
        return res
            .status(400)
            .json(
                new apiResponse(
                    400,
                    {},
                    "User not found"
                )
            )
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user,
                "User fetched Successfully"
            )
        )


})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const {incomingRefreshToken} = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new apiError(401, "Refresh Token is required")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new apiError(401, "Invalid Refresh Token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new apiError(401, "Refresh Token is invalid")
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new apiResponse(
                    200,
                    {accessToken, refreshToken: newRefreshToken},
                    "Access token refreshed successfully"
                ))
    } catch (error) {
        throw new apiError(500, "Error while refreshing access token")
    }
})

export { registerUser, loginUser, logoutUser, generateAndSaveOtp, updateProfileDetails, resetPassword, getCurrentUser, refreshAccessToken}