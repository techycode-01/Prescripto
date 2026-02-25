import doctorModel from "../models/doctorModel.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import appointmentModel from "../models/appointmentModel.js"


const changeAvailability = async (req, res) => {
    try {

        const docId = req.docId

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: "Availability changed", })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message, })
    }

}
const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find().select(["-password", "-email"])
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API for doctor login
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body
        // Cast to string to prevent NoSQL Injection
        const doctor = await doctorModel.findOne({ email: String(email) })

        if (!doctor) {
            return res.json({ success: false, message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)
        if (isMatch) {
            const accessToken = jwt.sign({ id: doctor._id, role: "doctor" }, process.env.JWT_SECRET, { expiresIn: '15m' })
            const refreshToken = jwt.sign({ id: doctor._id, role: "doctor" }, process.env.JWT_SECRET, { expiresIn: '7d' })

            res.cookie('doctorRefreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            res.json({ success: true, token: accessToken })
        } else {
            return res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {
        const docId = req.docId
        const appointments = await appointmentModel.find({ docId })
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }


}

//API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {
        const docId = req.docId
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true })
            res.json({ success: true, message: "Appointment completed" })
        }
        else {
            res.json({ success: false, message: "Mark Failed" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to cancel appointment completed for doctor panel
const appointmentCancel = async (req, res) => {
    try {
        const docId = req.docId
        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

            //releasing doctor slot
            const { slotDate, slotTime } = appointmentData
            const doctorData = await doctorModel.findById(docId)
            let slots_booked = doctorData.slots_booked
            if (slots_booked[slotDate]) {
                slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime)
                await doctorModel.findByIdAndUpdate(docId, { slots_booked })
            }

            res.json({ success: true, message: "Appointment cancelled" })
        }
        else {
            res.json({ success: false, message: "Cancellation Failed" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {
        const docId = req.docId
        const appointments = await appointmentModel.find({ docId })

        let earnings = 0
        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []
        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }
        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//API to get doctor profile for Doctor Panel
const doctorProfile = async (req, res) => {
    try {
        const docId = req.docId
        const profileData = await doctorModel.findById(docId).select("-password")

        res.json({ success: true, profileData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to update doctor profile data for Doctor Panel
const updateDoctorProfile = async (req, res) => {
    try {
        const docId = req.docId
        const { fees, address, available } = req.body
        await doctorModel.findByIdAndUpdate(docId, { fees, address, available })

        res.json({ success: true, message: "Profile Updated" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}
// API for doctor refresh token
const doctorRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.doctorRefreshToken;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "No refresh token provided" });
        }

        const token_decode = jwt.verify(refreshToken, process.env.JWT_SECRET);
        if (token_decode.role !== "doctor") {
            return res.status(401).json({ success: false, message: "Invalid token role" });
        }

        const accessToken = jwt.sign({ id: token_decode.id, role: "doctor" }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.json({ success: true, token: accessToken });

    } catch (error) {
        console.log(error);
        res.status(403).json({ success: false, message: "Invalid refresh token" });
    }
}

// API for doctor logout
const doctorLogout = async (req, res) => {
    try {
        res.clearCookie('doctorRefreshToken', {
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

export {
    changeAvailability,
    doctorList,
    loginDoctor,
    appointmentsDoctor,
    appointmentComplete,
    appointmentCancel,
    doctorDashboard,
    doctorProfile,
    updateDoctorProfile,
    doctorRefreshToken,
    doctorLogout
}