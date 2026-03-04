import appointmentModel from "../models/appointmentModel.js";
import prescriptionModel from "../models/prescriptionModel.js";
import sendEmail from "../utils/SendEmail.js";
import slotDateFormat from "../utils/slotDateFormat.js";
import PDFDocument from "pdfkit";

// ─── CREATE PRESCRIPTION (Doctor only) ───────────────────────────────────────
const createPrescription = async (req, res) => {
    try {
        const docId = req.docId;
        const { appointmentId, medicines, advice, followUpDate } = req.body;

        if (!appointmentId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
            return res.json({ success: false, message: "Appointment ID and at least one medicine are required." });
        }

        // Verify the appointment exists, is completed, and belongs to this doctor
        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({ success: false, message: "Appointment not found." });
        }
        if (appointment.docId !== docId) {
            return res.status(403).json({ success: false, message: "Unauthorized: This appointment does not belong to you." });
        }
        if (!appointment.isCompleted) {
            return res.json({ success: false, message: "Prescription can only be written for completed appointments." });
        }

        // Check if prescription already exists
        const existing = await prescriptionModel.findOne({ appointmentId });
        if (existing) {
            return res.json({ success: false, message: "A prescription has already been issued for this appointment." });
        }

        const { userData, docData, slotDate, slotTime, userId } = appointment;

        const prescription = await prescriptionModel.create({
            appointmentId,
            docId,
            userId,
            doctorInfo: {
                name: docData.name,
                speciality: docData.speciality,
                degree: docData.degree,
                experience: docData.experience,
            },
            patientInfo: {
                name: userData.name,
                dob: userData.dob,
                gender: userData.gender,
            },
            medicines,
            advice: advice || "",
            followUpDate: followUpDate || "",
        });

        // Send email notification to patient
        try {
            const dateStr = slotDateFormat(slotDate) + " at " + slotTime;
            await sendEmail({
                to: userData.email,
                subject: "Your Prescription is Ready - Prescripto",
                text: `Dear ${userData.name},\n\nYour prescription from ${docData.name} for your appointment on ${dateStr} is now available.\n\nPlease log in to Prescripto and go to "My Appointments" to download your prescription PDF.\n\nThank you for choosing Prescripto!`,
            });
        } catch (emailErr) {
            console.error("Error sending prescription email:", emailErr);
        }

        res.json({ success: true, message: "Prescription created successfully.", prescription });
    } catch (error) {
        if (error.code === 11000) {
            return res.json({ success: false, message: "A prescription already exists for this appointment." });
        }
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// ─── GET PRESCRIPTION (Doctor or Patient) ────────────────────────────────────
const getPrescription = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const prescription = await prescriptionModel.findOne({ appointmentId });

        if (!prescription) {
            return res.json({ success: false, message: "No prescription found for this appointment." });
        }

        // Authorisation: only the owning patient or doctor can view
        const requesterId = req.userId || req.docId;
        if (prescription.userId !== requesterId && prescription.docId !== requesterId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        res.json({ success: true, prescription });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// ─── DOWNLOAD PRESCRIPTION AS PDF ────────────────────────────────────────────
const downloadPrescription = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const prescription = await prescriptionModel.findOne({ appointmentId });

        if (!prescription) {
            return res.status(404).json({ success: false, message: "No prescription found for this appointment." });
        }

        // Authorisation: only the owning patient or doctor can download
        const requesterId = req.userId || req.docId;
        if (prescription.userId !== requesterId && prescription.docId !== requesterId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const { doctorInfo, patientInfo, medicines, advice, followUpDate, createdAt } = prescription;
        const issueDate = new Date(createdAt).toLocaleDateString("en-GB", {
            day: "numeric", month: "long", year: "numeric",
        });

        // ── Set HTTP headers for file download ──
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="prescription-${appointmentId}.pdf"`);

        const doc = new PDFDocument({ margin: 50, size: "A4" });
        doc.pipe(res);

        const primaryColor = "#0b3d91";
        const lightGray = "#f5f5f5";
        const darkText = "#1a1a1a";
        const mutedText = "#555555";

        // ── HEADER BANNER ──
        doc.rect(0, 0, doc.page.width, 90).fill(primaryColor);
        doc.fillColor("white")
            .fontSize(26).font("Helvetica-Bold")
            .text("PRESCRIPTO", 50, 22, { align: "left" });
        doc.fontSize(11).font("Helvetica")
            .text("Healthcare Appointment & Prescription System", 50, 56, { align: "left" });
        doc.text(`Issue Date: ${issueDate}`, 50, 56, { align: "right" });

        doc.moveDown(3.5);

        // ── DOCTOR INFO ──
        doc.fillColor(primaryColor).fontSize(13).font("Helvetica-Bold")
            .text("Prescribing Doctor");
        doc.rect(50, doc.y + 4, doc.page.width - 100, 1).fill(primaryColor).moveDown(0.5);
        doc.fillColor(darkText).fontSize(11).font("Helvetica-Bold")
            .text(doctorInfo.name, 50);
        doc.fillColor(mutedText).fontSize(10).font("Helvetica")
            .text(`${doctorInfo.speciality}  |  ${doctorInfo.degree}  |  Exp: ${doctorInfo.experience}`);
        doc.moveDown(1);

        // ── PATIENT INFO ──
        doc.fillColor(primaryColor).fontSize(13).font("Helvetica-Bold")
            .text("Patient Details");
        doc.rect(50, doc.y + 4, doc.page.width - 100, 1).fill(primaryColor).moveDown(0.5);

        const patientY = doc.y;
        doc.rect(50, patientY, doc.page.width - 100, 44).fill(lightGray);

        doc.fillColor(darkText).fontSize(10).font("Helvetica-Bold")
            .text("Name:", 60, patientY + 8);
        doc.font("Helvetica").text(patientInfo.name, 110, patientY + 8);

        doc.font("Helvetica-Bold").text("Gender:", 60, patientY + 24);
        doc.font("Helvetica").text(patientInfo.gender || "N/A", 110, patientY + 24);

        doc.font("Helvetica-Bold").text("Date of Birth:", 250, patientY + 8);
        doc.font("Helvetica").text(patientInfo.dob || "N/A", 340, patientY + 8);

        doc.moveDown(3.5);

        // ── MEDICINES TABLE ──
        doc.fillColor(primaryColor).fontSize(13).font("Helvetica-Bold")
            .text("℞  Prescription");
        doc.rect(50, doc.y + 4, doc.page.width - 100, 1).fill(primaryColor).moveDown(0.5);

        // Table header
        const tableTop = doc.y + 4;
        const col = { name: 50, dosage: 195, frequency: 280, duration: 385, notes: 455 };
        doc.rect(50, tableTop, doc.page.width - 100, 20).fill(primaryColor);
        doc.fillColor("white").fontSize(9).font("Helvetica-Bold");
        doc.text("Medicine", col.name + 4, tableTop + 5);
        doc.text("Dosage", col.dosage, tableTop + 5);
        doc.text("Frequency", col.frequency, tableTop + 5);
        doc.text("Duration", col.duration, tableTop + 5);
        doc.text("Notes", col.notes, tableTop + 5);

        // Table rows
        let rowY = tableTop + 22;
        medicines.forEach((med, i) => {
            const rowBg = i % 2 === 0 ? "white" : lightGray;
            doc.rect(50, rowY, doc.page.width - 100, 18).fill(rowBg);
            doc.fillColor(darkText).fontSize(9).font("Helvetica");
            doc.text(med.name || "", col.name + 4, rowY + 4, { width: 140 });
            doc.text(med.dosage || "", col.dosage, rowY + 4, { width: 80 });
            doc.text(med.frequency || "", col.frequency, rowY + 4, { width: 100 });
            doc.text(med.duration || "", col.duration, rowY + 4, { width: 65 });
            doc.text(med.notes || "", col.notes, rowY + 4, { width: 85 });
            rowY += 20;
        });

        doc.y = rowY + 10;

        // ── DOCTOR'S ADVICE ──
        if (advice && advice.trim()) {
            doc.moveDown(0.8);
            doc.fillColor(primaryColor).fontSize(13).font("Helvetica-Bold")
                .text("Doctor's Advice");
            doc.rect(50, doc.y + 4, doc.page.width - 100, 1).fill(primaryColor).moveDown(0.5);
            const adviceTop = doc.y;
            doc.rect(50, adviceTop, doc.page.width - 100, 50).fill(lightGray);
            doc.fillColor(darkText).fontSize(10).font("Helvetica")
                .text(advice, 60, adviceTop + 8, { width: doc.page.width - 120 });
            doc.moveDown(3.2);
        }

        // ── FOLLOW-UP DATE ──
        if (followUpDate && followUpDate.trim()) {
            doc.moveDown(0.5);
            doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(10)
                .text(`Follow-up Date:  `, 50, doc.y, { continued: true });
            doc.fillColor(darkText).font("Helvetica")
                .text(followUpDate);
            doc.moveDown(1);
        }

        // ── SIGNATURE ──
        doc.moveDown(2);
        doc.moveTo(doc.page.width - 200, doc.y).lineTo(doc.page.width - 50, doc.y).stroke(primaryColor);
        doc.fillColor(mutedText).fontSize(9).font("Helvetica")
            .text(doctorInfo.name, doc.page.width - 200, doc.y + 4, { width: 150, align: "center" });
        doc.text("Doctor's Signature", doc.page.width - 200, doc.y + 14, { width: 150, align: "center" });

        // ── FOOTER ──
        doc.fillColor(primaryColor)
            .rect(0, doc.page.height - 35, doc.page.width, 35).fill(primaryColor);
        doc.fillColor("white").fontSize(8).font("Helvetica")
            .text(
                "This prescription was digitally generated by Prescripto. It is valid only when issued by a registered doctor through the platform.",
                20,
                doc.page.height - 22,
                { align: "center" }
            );

        doc.end();
    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

export { createPrescription, getPrescription, downloadPrescription };
