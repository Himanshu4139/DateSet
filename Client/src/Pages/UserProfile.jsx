import React, { useEffect, useState } from "react";
import Header from "../Components/Common/Header";
import Footer from "../Components/Common/Footer";
import { FaVenusMars, FaHiking, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { IoIosHeart } from "react-icons/io";
import { IoArrowBack } from "react-icons/io5"; // Corrected import
import axios from "axios";
import Cookies from "js-cookie"; // Import Cookies
import { useParams, useNavigate } from "react-router-dom";

// For Vite projects
const API_URL = import.meta.env.VITE_API_URL;

const UserProfile = () => {
  const primaryColor = "bg-indigo-600";
  const gradient = "bg-gradient-to-r from-indigo-500 to-purple-600";
  const [profile, setProfile] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();
  const token = Cookies.get("token"); // Retrieve the token from cookies

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/me/${id}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.data?.data) {
          setProfile(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [id, token]);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-purple-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl mt-18">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          {/* Profile Header with Back Button */}
          <div className={`${gradient} pt-8 pb-6 px-6 text-center relative`}>
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full text-white transition-all"
            >
              <IoArrowBack className="text-xl" />
            </button>

            <div className="relative inline-block group">
              <img
                className="h-32 w-32 rounded-full border-4 border-white/80 object-cover transform group-hover:scale-105 transition-transform duration-300 shadow-xl"
                src={profile.profile?.images?.[0] || "/default-profile.jpg"}
                alt="Profile"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-profile.jpg";
                }}
              />
              <div
                className={`absolute bottom-0 right-2 w-5 h-5 rounded-full border-2 border-white ${
                  profile.accountStatus === "active"
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              ></div>
            </div>

            <h1 className="text-3xl font-bold text-white mt-4">
              {profile.name}
            </h1>
            <div className="flex items-center justify-center space-x-3 mt-2">
              <span className="text-white/90">
                {calculateAge(profile.profile?.dateOfBirth)} years old
              </span>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <ProfileSection
                icon={<FaVenusMars className="text-pink-500" />}
                title="Gender & Status"
                content={
                  <div className="space-y-1">
                    <p className="text-gray-700">{profile.gender}</p>
                    <div className="flex items-center space-x-2">
                      <IoIosHeart className="text-rose-500" />
                      <span className="text-gray-600">
                        {profile.profile?.status || "Not specified"}
                      </span>
                    </div>
                  </div>
                }
              />

              <ProfileSection
                icon={<FaMapMarkerAlt className="text-blue-500" />}
                title="Location"
                content={profile.profile?.city || "Location not specified"}
                badge={`${profile.profile?.distance || "N/A"} km away`}
              />

              <ProfileSection
                icon={<FaStar className="text-purple-500" />}
                title="Zodiac"
                content={profile.profile?.zodiac || "N/A"}
                badge={profile.profile?.zodiacTraits || "Traits not specified"}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <ProfileSection
                icon={<FaHiking className="text-emerald-500" />}
                title="Interests"
                content={
                  <div className="flex flex-wrap gap-2">
                    {profile.profile?.interests?.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    )) || "No interests specified"}
                  </div>
                }
              />

              <ProfileSection
                title="About Me"
                content={profile.profile?.bio || "No bio available"}
              />

              <ProfileSection
                title="Preferences"
                content={
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-700">Looking for:</span>
                      <span className="text-indigo-600">
                        {profile.profile?.preference || "Not specified"}
                      </span>
                    </div>
                  </div>
                }
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              {profile.accountStatus === "active" ? "Active now" : "Inactive"} •
              Member since {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

const ProfileSection = ({ icon, title, content, badge }) => (
  <div className="relative">
    <div className="flex items-start space-x-3">
      {icon && <div className="text-2xl pt-1">{icon}</div>}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-600 mb-1.5">{title}</h3>
        <div className="text-gray-800 leading-relaxed">{content}</div>
        {badge && (
          <span className="inline-block mt-2 px-2.5 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
            {badge}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default UserProfile;
