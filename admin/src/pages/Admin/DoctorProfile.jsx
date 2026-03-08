import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";

const AdminDoctorProfile = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { aToken, doctors, getAllDoctors, changeAvailability } = useContext(AdminContext);
  const { currency } = useContext(AppContext);

  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (aToken) {
      if (doctors.length === 0) {
        getAllDoctors();
      } else {
        const foundDoc = doctors.find((doc) => doc._id === docId);
        if (foundDoc) setProfileData(foundDoc);
      }
    }
  }, [aToken, doctors, docId]);

  return (
    profileData && (
      <div className="w-full max-w-6xl m-5">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Doctor Profile</h2>
            <button 
                onClick={() => navigate(-1)} 
                className="text-sm text-gray-500 border border-gray-300 px-4 py-1.5 rounded-full hover:bg-gray-50 cursor-pointer transition-all"
            >
                ← Back
            </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 lg:h-full lg:object-cover lg:max-w-none rounded-lg"
              src={profileData.image}
              alt="Doctor Profile"
            />
          </div>

          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] lg:mt-0">
            {/* ---- Doc Info  : name, degree, experience -----*/}
            <p className="flex items-center gap-2 text-lg font-medium text-gray-900">
              {profileData.name}{" "}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {profileData.degree} - {profileData.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full cursor-pointer">
                {profileData.experience}
              </button>
            </div>

            {/* ---- Doctor About ----- */}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3 ">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {profileData.about}
              </p>
            </div>
            <p className=" text-gray-500 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-600 ">
                {currency}
                {profileData.fees}
              </span>
            </p>

            <div className="flex gap-2 py-2">
              <p>Address:</p>
              <p className="text-sm text-gray-600">
                {profileData.address?.line1}
                <br />
                {profileData.address?.line2}
              </p>
            </div>

            <div className="flex gap-1 pt-2 items-center">
              <input
                onChange={() => changeAvailability(profileData._id)}
                checked={profileData.available}
                type="checkbox"
                id="available"
                className="cursor-pointer"
              />
              <label htmlFor="available" className="cursor-pointer">Available</label>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default AdminDoctorProfile;
