import express from "express";
import { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyPayment, userRefreshToken, userLogout } from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";


const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get('/refresh', userRefreshToken);
userRouter.post('/logout', userLogout);

userRouter.get('/get-profile', authUser, getProfile)
userRouter.post('/update-profile', upload.single("image"), authUser, updateProfile)
userRouter.post('/book-appointment', authUser, bookAppointment)
userRouter.get('/appointments', authUser, listAppointment)
userRouter.post('/cancel-appointment', authUser, cancelAppointment)
userRouter.post('/payment-razorpay', authUser, paymentRazorpay)
userRouter.post('/verifyRazorpay', authUser, verifyPayment)



export default userRouter;

