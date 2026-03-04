import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dosage: { type: String, required: true },      // e.g. "500mg"
    frequency: { type: String, required: true },   // e.g. "Twice a day"
    duration: { type: String, required: true },    // e.g. "7 days"
    notes: { type: String, default: "" },          // e.g. "Take after meals"
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
    appointmentId: { type: String, required: true, unique: true },
    docId: { type: String, required: true },
    userId: { type: String, required: true },
    doctorInfo: { type: Object, required: true },   // snapshot: name, speciality, degree, experience
    patientInfo: { type: Object, required: true },  // snapshot: name, dob, gender
    medicines: { type: [medicineSchema], required: true },
    advice: { type: String, default: "" },
    followUpDate: { type: String, default: "" },
}, { timestamps: true });

const prescriptionModel = mongoose.models.prescription || mongoose.model("prescription", prescriptionSchema);

export default prescriptionModel;
