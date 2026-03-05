import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DoctorContext } from "../../context/DoctorContext";
import { toast } from "react-toastify";

const EMPTY_MEDICINE = { name: "", dosage: "", frequency: "", duration: "", notes: "" };

const WritePrescription = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { createPrescription, updatePrescription, getPrescriptionByAppointment, downloadPrescriptionPDF } = useContext(DoctorContext);

  const [medicines, setMedicines] = useState([{ ...EMPTY_MEDICINE }]);
  const [advice, setAdvice] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingPrescription, setExistingPrescription] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // On mount check if prescription already exists to show read-only mode
  useEffect(() => {
    const checkExisting = async () => {
      const result = await getPrescriptionByAppointment(appointmentId);
      if (result.success && result.prescription) {
        setExistingPrescription(result.prescription);
      }
      setCheckingExisting(false);
    };
    checkExisting();
  }, [appointmentId]);

  const handleEditClick = () => {
    // Populate form with existing data
    setMedicines(existingPrescription.medicines.length > 0 ? existingPrescription.medicines : [{ ...EMPTY_MEDICINE }]);
    setAdvice(existingPrescription.advice || "");
    setFollowUpDate(existingPrescription.followUpDate || "");
    setEditMode(true);
  };

  const addMedicine = () => setMedicines((prev) => [...prev, { ...EMPTY_MEDICINE }]);

  const removeMedicine = (idx) =>
    setMedicines((prev) => prev.filter((_, i) => i !== idx));

  const updateMedicine = (idx, field, value) =>
    setMedicines((prev) =>
      prev.map((med, i) => (i === idx ? { ...med, [field]: value } : med))
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const med of medicines) {
      if (!med.name.trim() || !med.dosage.trim() || !med.frequency.trim() || !med.duration.trim()) {
        toast.error("Please fill in all required medicine fields (Name, Dosage, Frequency, Duration).");
        return;
      }
    }
    setLoading(true);
    let result;
    if (editMode) {
      result = await updatePrescription({ appointmentId, medicines, advice, followUpDate });
    } else {
      result = await createPrescription({ appointmentId, medicines, advice, followUpDate });
    }
    setLoading(false);

    if (result.success) {
      toast.success(editMode ? "Prescription updated successfully!" : "Prescription issued successfully!");
      if (editMode) {
        setExistingPrescription(result.prescription);
        setEditMode(false);
      } else {
        navigate("/doctor-appointments");
      }
    } else {
      toast.error(result.message || "Failed to save prescription.");
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary";
  const labelClass = "block text-xs text-gray-500 mb-1";

  if (checkingExisting) {
    return <div className="flex items-center justify-center h-60 text-gray-400">Loading...</div>;
  }

  // ── Read-only view (prescription already exists and not in edit mode) ────
  if (existingPrescription && !editMode) {
    const { doctorInfo, patientInfo, medicines: meds, advice: adv, followUpDate: fud } = existingPrescription;
    return (
      <div className="w-full max-w-4xl m-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Prescription Already Issued</h2>
            <p className="text-sm text-gray-400">This prescription has been sent to the patient.</p>
          </div>
          <div className="flex gap-2 text-sm">
            <button
              onClick={handleEditClick}
              className="border border-primary text-primary px-4 py-2 rounded-md hover:bg-blue-50"
            >
              ✎ Edit Prescription
            </button>
            <button
              onClick={() => downloadPrescriptionPDF(appointmentId)}
              className="bg-primary text-white px-4 py-2 rounded-md hover:opacity-90 flex items-center gap-1"
            >
              ⬇ Download PDF
            </button>
            <button
              onClick={() => navigate("/doctor-appointments")}
              className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-medium text-gray-600">Doctor:</span> {doctorInfo.name}</div>
            <div><span className="font-medium text-gray-600">Patient:</span> {patientInfo.name}</div>
          </div>
          <hr />
          <h3 className="font-medium text-gray-700">Medicines</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600">
                  <th className="p-2">Medicine</th><th className="p-2">Dosage</th>
                  <th className="p-2">Frequency</th><th className="p-2">Duration</th><th className="p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {meds.map((m, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{m.name}</td><td className="p-2">{m.dosage}</td>
                    <td className="p-2">{m.frequency}</td><td className="p-2">{m.duration}</td>
                    <td className="p-2 text-gray-400">{m.notes || "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {adv && <div><span className="font-medium text-gray-600">Advice:</span> <span className="text-sm text-gray-500">{adv}</span></div>}
          {fud && <div><span className="font-medium text-gray-600">Follow-up:</span> <span className="text-sm text-gray-500">{fud}</span></div>}
        </div>
      </div>
    );
  }

  // ── Write / Edit prescription form ─────────────────────────────────────────
  return (
    <div className="w-full max-w-4xl m-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            {editMode ? "Edit Prescription" : "Write Prescription"}
          </h2>
          <p className="text-xs text-gray-400">
            {editMode 
              ? "Update the details below. Generating a new PDF will reflect these changes."
              : "The patient will be notified and can download the PDF from their portal."}
          </p>
        </div>
        <button 
          onClick={() => editMode ? setEditMode(false) : navigate("/doctor-appointments")} 
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-5">

        {/* Medicines */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">℞ Medicines <span className="text-red-400">*</span></h3>
          <div className="space-y-3">
            {medicines.map((med, idx) => (
              <div key={idx} className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1.5fr_auto] gap-2 items-end">
                <div>
                  {idx === 0 && <label className={labelClass}>Medicine Name *</label>}
                  <input
                    className={inputClass}
                    placeholder="e.g. Paracetamol"
                    value={med.name}
                    onChange={(e) => updateMedicine(idx, "name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  {idx === 0 && <label className={labelClass}>Dosage *</label>}
                  <input
                    className={inputClass}
                    placeholder="500mg"
                    value={med.dosage}
                    onChange={(e) => updateMedicine(idx, "dosage", e.target.value)}
                    required
                  />
                </div>
                <div>
                  {idx === 0 && <label className={labelClass}>Frequency *</label>}
                  <input
                    className={inputClass}
                    placeholder="Twice a day"
                    value={med.frequency}
                    onChange={(e) => updateMedicine(idx, "frequency", e.target.value)}
                    required
                  />
                </div>
                <div>
                  {idx === 0 && <label className={labelClass}>Duration *</label>}
                  <input
                    className={inputClass}
                    placeholder="7 days"
                    value={med.duration}
                    onChange={(e) => updateMedicine(idx, "duration", e.target.value)}
                    required
                  />
                </div>
                <div>
                  {idx === 0 && <label className={labelClass}>Notes (optional)</label>}
                  <input
                    className={inputClass}
                    placeholder="After meals"
                    value={med.notes}
                    onChange={(e) => updateMedicine(idx, "notes", e.target.value)}
                  />
                </div>
                <div className={idx === 0 ? "mt-4" : ""}>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(idx)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none px-2"
                      title="Remove"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addMedicine}
            className="mt-3 text-sm text-primary border border-primary rounded-md px-3 py-1 hover:bg-blue-50"
          >
            + Add Medicine
          </button>
        </div>

        <hr />

        {/* Doctor's Advice */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Doctor's Advice / General Notes</label>
          <textarea
            className={`${inputClass} h-24 resize-none`}
            placeholder="e.g. Drink plenty of water, avoid spicy food, rest well..."
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
          />
        </div>

        {/* Follow-Up Date */}
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date (Optional)</label>
          <input
            type="date"
            className={inputClass}
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => editMode ? setEditMode(false) : navigate("/doctor-appointments")}
            className="border border-gray-300 px-5 py-2 rounded-md text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Saving..." : (editMode ? "Update Prescription" : "Issue Prescription")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WritePrescription;
