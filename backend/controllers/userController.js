import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay"


//API to register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing Details" })
        }
        //validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a valid Email" })
        }
        //validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Enter a strong password" })
        }

        //checking for duplicate email
        const exists = await userModel.findOne({ email: String(email) })
        if (exists) {
            return res.json({ success: false, message: "User already exists with this email" })
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name, email, password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const accessToken = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: '15m' })
        const refreshToken = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie('userRefreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.json({ success: true, token: accessToken })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        // Cast to string to prevent NoSQL Injection
        const user = await userModel.findOne({ email: String(email) })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const accessToken = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: '15m' })
            const refreshToken = jwt.sign({ id: user._id, role: "user" }, process.env.JWT_SECRET, { expiresIn: '7d' })

            res.cookie('userRefreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            return res.json({ success: true, token: accessToken })
        } else {
            return res.json({ success: false, message: "Invalid Credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}

//API to get user profile data
const getProfile = async (req, res) => {
    try {

        const userId = req.userId
        const userData = await userModel.findById(userId).select("-password")

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API to update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId
        const { name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !address || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }
        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {
            // upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageUrl = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageUrl })

        }
        res.json({ success: true, message: "Profile Updated" })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

import mongoose from "mongoose";

//API to book appointment
const bookAppointment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.userId
        const { docId, slotDate, slotTime } = req.body
        const docData = await doctorModel.findById(docId).session(session).select("-password")
        if (!docData.available) {
            await session.abortTransaction();
            session.endSession();
            return res.json({ success: false, message: 'Doctor not available' })
        }
        let slots_booked = docData.slots_booked


        //checking for slot availablity
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                await session.abortTransaction();
                session.endSession();
                return res.json({ success: false, message: 'Slot not available' })
            } else {
                slots_booked[slotDate].push(slotTime)

            }
        }
        else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).session(session).select("-password")

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        }
        const newAppointment = await appointmentModel(appointmentData)
        await newAppointment.save({ session })

        //save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked }, { session })

        await session.commitTransaction();
        session.endSession();

        res.json({ success: true, message: 'Appointment booked' })


    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get user appointments for fronetd my-appointments page

const listAppointment = async (req, res) => {
    try {
        const userId = req.userId
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to cancel appointment
const cancelAppointment = async (req, res) => {

    try {

        const userId = req.userId
        const { appointmentId } = req.body

        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment already cancelled' })
        }

        //verify appointment user
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })


        //releasing doctor slot

        const { docId, slotDate, slotTime } = appointmentData

        const doctorData = await doctorModel.findById(docId)
        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime)

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ success: true, message: 'Appointment cancelled' })


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// API to make payment of appointmnet using razorpay
const paymentRazorpay = async (req, res) => {
    try {
        const userId = req.userId
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' })

        }

        // Verify appointment ownership
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        //creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId
        }

        //creation of an order
        const order = await razorpayInstance.orders.create(options)

        res.json({ success: true, order })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }



}

import crypto from "crypto";

// API to verify payment of razorpay
const verifyPayment = async (req, res) => {
    try {
        const userId = req.userId
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

        // Verify the Razorpay signature to prevent tampering
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.json({ success: false, message: 'Payment Verification Failed' })
        }

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        // Verify appointment ownership
        const appointmentData = await appointmentModel.findById(orderInfo.receipt)
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' })
        }

        if (orderInfo.status === "paid") {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.json({ success: true, message: 'Payment Successful' })
        } else {
            res.json({ success: false, message: 'Payment Failed' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}

// API for user refresh token
const userRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.userRefreshToken;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "No refresh token provided" });
        }

        const token_decode = jwt.verify(refreshToken, process.env.JWT_SECRET);
        if (token_decode.role !== "user") {
            return res.status(401).json({ success: false, message: "Invalid token role" });
        }

        const accessToken = jwt.sign({ id: token_decode.id, role: "user" }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ success: true, token: accessToken });

    } catch (error) {
        console.log(error);
        res.status(403).json({ success: false, message: "Invalid refresh token" });
    }
}

// API for user logout
const userLogout = async (req, res) => {
    try {
        res.clearCookie('userRefreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyPayment, userRefreshToken, userLogout }