import express from "express"
import { registerUser, loginUser, logoutUser, generateAndSaveOtp, resetPassword, updateProfileDetails, getCurrentUser } from "../controllers/users.controller.js"
import { verifyJWT, verifyOTP } from "../middlewares/auth.middleware.js"
import { sendMail } from "../utils/mailerConfig.js"

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', verifyJWT, logoutUser)
router.post('/sendMail', sendMail)
router.post('/generateAndSaveOtp', generateAndSaveOtp)
// router.post('/verifyOTP', verifyOTP)
router.post('/resetPassword', verifyOTP, resetPassword)
router.put('/update-account', verifyJWT,updateProfileDetails)
router.get('/get-user', verifyJWT, getCurrentUser)

export default router