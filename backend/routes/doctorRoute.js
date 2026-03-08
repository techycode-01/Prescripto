import express from "express";
import { doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, appointmentCancel, doctorDashboard, doctorProfile, updateDoctorProfile, doctorRefreshToken, doctorLogout, getPatientProfile, getPatientAppointmentsDoctor, getPatientPrescriptionsDoctor } from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorList)
doctorRouter.post("/login", loginDoctor)
doctorRouter.get('/refresh', doctorRefreshToken)
doctorRouter.post('/logout', doctorLogout)
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor)
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete)
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel)
doctorRouter.get("/dashboard", authDoctor, doctorDashboard)
doctorRouter.get("/profile", authDoctor, doctorProfile)
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile)
doctorRouter.get("/patient-profile/:patientId", authDoctor, getPatientProfile)
doctorRouter.get("/patient-appointments/:patientId", authDoctor, getPatientAppointmentsDoctor)
doctorRouter.get("/patient-prescriptions/:patientId", authDoctor, getPatientPrescriptionsDoctor)

export default doctorRouter;