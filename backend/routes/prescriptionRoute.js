import express from "express";
import {
    createPrescription,
    updatePrescription,
    getPrescription,
    downloadPrescription,
} from "../controllers/prescriptionController.js";
import authDoctor from "../middlewares/authDoctor.js";
import authUser from "../middlewares/authUser.js";

const prescriptionRouter = express.Router();

// Doctor creates a prescription for a completed appointment
prescriptionRouter.post("/create", authDoctor, createPrescription);

// Doctor updates an existing prescription
prescriptionRouter.post("/update", authDoctor, updatePrescription);

// Both doctor and patient can GET a prescription
prescriptionRouter.get("/appointment/:appointmentId", authUser, getPrescription);
prescriptionRouter.get("/doctor/appointment/:appointmentId", authDoctor, getPrescription);

// Both doctor and patient can DOWNLOAD the PDF
prescriptionRouter.get("/download/:appointmentId", authUser, downloadPrescription);
prescriptionRouter.get("/doctor/download/:appointmentId", authDoctor, downloadPrescription);

export default prescriptionRouter;
