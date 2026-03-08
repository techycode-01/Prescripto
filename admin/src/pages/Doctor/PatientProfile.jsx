import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const PatientProfile = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { dToken, patientData, getPatientProfile, patientAppointments, getPatientAppointments, patientPrescriptions, getPatientPrescriptions, downloadPrescriptionPDF } = useContext(DoctorContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    if (dToken && patientId) {
      getPatientProfile(patientId);
      getPatientAppointments(patientId);
      getPatientPrescriptions(patientId);
    }
  }, [dToken, patientId]);

  return (
    patientData && (
      <div className="w-full max-w-4xl m-5">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Patient Profile</h2>
            <button 
                onClick={() => navigate(-1)} 
                className="text-sm text-gray-500 border border-gray-300 px-4 py-1.5 rounded-full hover:bg-gray-50 cursor-pointer transition-all"
            >
                ← Back
            </button>
        </div>

        <div className="max-w-lg flex flex-col gap-2 text-sm bg-white p-8 border rounded-lg shadow-sm">
          <img className="w-36 rounded" src={patientData.image} alt="Patient Profile" />

          <p className="font-medium text-3xl text-neutral-800 mt-4">
            {patientData.name}
          </p>

          <hr className="bg-zinc-400 h-[1px] border-none my-2" />
          
          <div>
            <p className="text-neutral-500 underline mt-3">CONTACT INFORMATION</p>
            <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
              <p className="font-medium">Email id:</p>
              <p className="text-blue-500">{patientData.email}</p>
              
              <p className="font-medium">Phone:</p>
              <p className="text-blue-400">{patientData.phone}</p>
              
              <p className="font-medium">Address:</p>
              <p className="text-gray-500 flex flex-col">
                <span>{patientData.address?.line1 || "N/A"}</span>
                <span>{patientData.address?.line2 || ""}</span>
              </p>
            </div>
          </div>

          <div>
            <p className="text-neutral-500 underline mt-3">BASIC INFORMATION</p>
            <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
              <p className="font-medium">Gender:</p>
              <p className="text-gray-400">{patientData.gender}</p>

              <p className="font-medium">Age:</p>
              <p className="text-gray-400">{calculateAge(patientData.dob)}</p>
              
              <p className="font-medium">DOB:</p>
              <p className="text-gray-400">{patientData.dob}</p>
            </div>
          </div>

        </div>

        {/* --- Appointment History --- */}
        <div className="mt-10 bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
          <p className="p-6 pb-3 text-lg font-semibold text-gray-800 border-b">Appointment History</p>
          <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1.5fr_2fr_2fr_1fr_1fr_1.5fr] grid-flow-col py-3 px-6 border-b font-medium text-gray-700">
            <p>#</p>
            <p>Date</p>
            <p>Time</p>
            <p>Doctor</p>
            <p>Speciality</p>
            <p>Fees</p>
            <p>Booking Date</p>
            <p>Status</p>
          </div>

          {patientAppointments && patientAppointments.length > 0 ? (
            patientAppointments.map((item, index) => (
              <div
                key={index}
                className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_1.5fr_2fr_2fr_1fr_1fr_1.5fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50 transition-all"
              >
                <p className="max-sm:hidden">{index + 1}</p>
                <p className="font-medium text-gray-900">{slotDateFormat(item.slotDate)}</p>
                <p>{item.slotTime}</p>
                <p>{item.docData.name}</p>
                <p>{item.docData.speciality}</p>
                <p>{currency}{item.amount}</p>
                <p>{new Date(item.date).toLocaleDateString()}</p>
                <div>
                  {item.cancelled ? (
                    <span className="text-red-400 text-xs font-medium">Cancelled</span>
                  ) : item.isCompleted ? (
                    <span className="text-green-500 text-xs font-medium">Completed</span>
                  ) : (
                    <span className="text-blue-500 text-xs font-medium">Upcoming</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-10 text-gray-400 italic">No appointment history found.</p>
          )}
        </div>

        {/* --- Prescription History --- */}
        <div className="mt-10 bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll mb-10">
          <p className="p-6 pb-3 text-lg font-semibold text-gray-800 border-b">Prescription History</p>
          <div className="hidden sm:grid grid-cols-[0.5fr_2fr_2fr_2.5fr_2fr_4fr_2fr_1.5fr] grid-flow-col py-3 px-6 border-b font-medium text-gray-700">
            <p>#</p>
            <p>Date</p>
            <p>Doctor</p>
            <p>Speciality</p>
            <p>Diagnosis</p>
            <p>Medicines</p>
            <p>Follow-up</p>
            <p className="text-center">Action</p>
          </div>

          {patientPrescriptions && patientPrescriptions.length > 0 ? (
            patientPrescriptions.map((item, index) => (
              <div
                key={index}
                className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_2.5fr_2fr_4fr_2fr_1.5fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50 transition-all text-xs"
              >
                <p className="max-sm:hidden">{index + 1}</p>
                <p className="font-medium text-gray-900">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
                <p>{item.doctorInfo.name}</p>
                <p>{item.doctorInfo.speciality}</p>
                <p className="truncate max-w-[150px]">{item.advice || "N/A"}</p>
                <p>
                  {item.medicines.map((m) => m.name).join(", ")}
                </p>
                <p>{item.followUpDate ? new Date(item.followUpDate).toLocaleDateString() : "N/A"}</p>
                <div className="text-center">
                  <button
                    onClick={() => downloadPrescriptionPDF(item.appointmentId)}
                    className="text-xs text-primary border border-primary px-3 py-1 rounded-full hover:bg-primary hover:text-white transition-all cursor-pointer"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-10 text-gray-400 italic">No prescriptions available.</p>
          )}
        </div>

      </div>
    )
  );
};

export default PatientProfile;
