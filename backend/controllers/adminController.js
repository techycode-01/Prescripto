import validator from "validator"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
import jwt from "jsonwebtoken"



//API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;
    // console.log({name,email,password,speciality,degree,experience,about,fees,address,imageFile})

    //checking for all data to add doctor
    if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
      return res.json({ sucess: false, message: "Missing Details " })
    }

    //validating email format
    if (!validator.isEmail(email)) {
      return res.json({ sucess: false, message: "Please enter a valid email " })

    }

    //validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" })
    }

    //checking for duplicate email
    const exists = await doctorModel.findOne({ email: String(email) })
    if (exists) {
      return res.json({ success: false, message: "Doctor already exists with this email" })
    }

    //hashing doctor password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
    const imageUrl = imageUpload.secure_url
    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now()
    }
    const newDoctor = await doctorModel.create(doctorData)
    await newDoctor.save()
    res.json({ success: true, message: "Doctor added successfully" })

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message })
  }
};

//API For admin Login

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const accessToken = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: '15m' })
      const refreshToken = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: '7d' })

      res.cookie('adminRefreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      res.json({ success: true, token: accessToken })
    } else {
      return res.json({ success: false, message: "Invalid Credentials" })
    }
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })

  }
}

//APi to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password")
    res.json({ success: true, doctors })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//API to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({})
    res.json({ success: true, appointments })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

//API for appointment cancellation
const appointmentCancel = async (req, res) => {

  try {

    const { appointmentId } = req.body

    const appointmentData = await appointmentModel.findById(appointmentId)

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

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({})
    const users = await userModel.find({})
    const appointments = await appointmentModel.find({})
    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.reverse().slice(0, 5)
    }
    res.json({ success: true, dashData })
  } catch (error) {

  }
}

// API for admin refresh token
const adminRefreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.adminRefreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    const token_decode = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (token_decode.role !== "admin" || token_decode.email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({ success: false, message: "Invalid token role" });
    }

    const accessToken = jwt.sign({ email: token_decode.email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ success: true, token: accessToken });

  } catch (error) {
    console.log(error);
    res.status(403).json({ success: false, message: "Invalid refresh token" });
  }
}

// API for admin logout
const adminLogout = async (req, res) => {
  try {
    res.clearCookie('adminRefreshToken', {
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

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard, adminRefreshToken, adminLogout }