import React, { useState, useEffect } from "react";
import Header from "../Components/Common/Header";
import Footer from "../Components/Common/Footer";
import axios from "axios";
import Cookies from "js-cookie"; // Import Cookies
import { useNavigate } from "react-router-dom";
import {
  MdMessage,
  MdFavorite,
  MdClose,
  MdInfo,
  MdBlock,
  MdPersonRemove,
} from "react-icons/md";
import { FaHeart, FaRegHeart, FaCheck, FaTimes } from "react-icons/fa";
import { IoMdFlash } from "react-icons/io";
import {
  BsThreeDotsVertical,
  BsGeoAlt,
  BsHeartFill,
  BsHeart,
} from "react-icons/bs";

const API_URL = import.meta.env.VITE_API_URL;

const Match = () => {
  const token = Cookies.get("token"); // Retrieve the token from cookies
  const [activeTab, setActiveTab] = useState("matches");
  const [activeView, setActiveView] = useState("match");
  const [sendUsers, setSendUsers] = useState([]);
  const [receiveUsers, setReceiveUsers] = useState([]);
  const [matchUsers, setMatchUsers] = useState([]);
  const [reload, setReload] = useState(false);
  const headline = "Your Matches";

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const [sendRes, receiveRes, matchRes] = await Promise.all([
          axios.get(`${API_URL}/api/user/sendRequests`, {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${API_URL}/api/user/receiveRequests`, {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${API_URL}/api/user/matches`, {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setSendUsers(sendRes.data.data || []);
        setReceiveUsers(receiveRes.data.data || []);
        setMatchUsers(matchRes.data.data || []);
      } catch (error) {
        console.error("Error fetching match data:", error);
      }
    };

    fetchMatchData();
  }, [reload]);

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

  const removeSentRequest = async (userId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/user/removeSentRequest/${userId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setReload((r) => !r);
      }
    } catch (error) {
      console.error("Error removing sent request:", error);
    }
  };

  const acceptRequest = async (userId) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/user/acceptRequest/${userId}`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setReload((r) => !r);
      }
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const denyRequest = async (userId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/api/user/denyRequest/${userId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setReload((r) => !r);
      }
    } catch (error) {
      console.error("Error denying request:", error);
    }
  };

  const removeMatch = async (userId) => {
    try {
      // 1. Remove the match
      const response = await axios.delete(
        `${API_URL}/api/user/removeMatch/${userId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 2. Delete all messages between current user and this user
      await axios.delete(`${API_URL}/api/messages/conversation/${userId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setReload((r) => !r);
      }
    } catch (error) {
      console.error("Error removing match or deleting messages:", error);
    }
  };

  const renderUserCard = (user) => {
    if (!user || !user.profile) return null;

    const userProfile = user.profile;
    const mainImage = userProfile.images?.[0] || "/default-profile.jpg";
    const age = calculateAge(userProfile.dateOfBirth);
    const location = userProfile.city || "Location not specified";
    const lastActive = new Date(user.updatedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return (
      <div
        key={user._id}
        className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 mb-6"
      >
        {/* User Image with Rounded Corners */}
        <div className="relative h-64 w-full">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-xl overflow-hidden">
            <img
              src={mainImage}
              alt="Profile"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-profile.jpg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-xl" />
          </div>

          {/* Online Status */}
          <div className="absolute top-3 right-3 flex items-center">
            <span
              className={`w-3 h-3 rounded-full mr-1 ${
                user.isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span className="text-xs text-white">
              {user.isOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* Basic Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold">
                  {user.name}, {age}
                </h2>
                <div className="flex items-center text-sm">
                  <BsGeoAlt className="mr-1" />
                  <span>{location}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/user-profile/${user._id}`)}
                className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition"
              >
                <MdInfo className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Rest of the card content remains the same */}
        <div className="p-5">
          {/* Bio */}
          {userProfile.bio && (
            <p className="text-gray-700 mb-4 line-clamp-2">
              "{userProfile.bio}"
            </p>
          )}

          {/* Interests */}
          {userProfile.interests?.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {userProfile.interests.slice(0, 4).map((interest) => (
                  <span
                    key={interest}
                    className="text-xs bg-pink-100 text-pink-800 px-3 py-1 rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Last Active */}
          <div className="text-xs text-gray-500 mb-4">
            Last active: {lastActive}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between space-x-3">
            {activeView === "send" && (
              <>
                <button
                  onClick={() => navigate(`/user-profile/${user._id}`)}
                  className="flex-1 bg-white border border-pink-500 text-pink-500 font-medium py-2 px-4 rounded-lg hover:bg-pink-50 transition flex items-center justify-center"
                >
                  <MdInfo className="mr-2" /> View
                </button>
                <button
                  onClick={() => removeSentRequest(user._id)}
                  className="flex-1 bg-white border border-gray-400 text-gray-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
                >
                  <MdPersonRemove className="mr-2" /> Cancel
                </button>
              </>
            )}

            {activeView === "receive" && (
              <>
                <button
                  onClick={() => acceptRequest(user._id)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium py-2 px-4 rounded-lg hover:shadow-md transition flex items-center justify-center"
                >
                  <FaCheck className="mr-2" /> Accept
                </button>
                <button
                  onClick={() => denyRequest(user._id)}
                  className="flex-1 bg-white border border-gray-400 text-gray-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
                >
                  <FaTimes className="mr-2" /> Decline
                </button>
              </>
            )}

            {activeView === "match" && (
              <>
                <button
                  onClick={() => navigate(`/chat-box/${user._id}`)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium py-2 px-4 rounded-lg hover:shadow-md transition flex items-center justify-center"
                >
                  <MdMessage className="mr-2" /> Message
                </button>
                <button
                  onClick={() => removeMatch(user._id)}
                  className="flex-1 bg-white border border-gray-400 text-gray-600 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
                >
                  <MdPersonRemove className="mr-2" /> Remove
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <Footer activeTab="matches" setActiveTab={setActiveTab} />
      <div className="fixed top-0 left-0 right-0 mt-18 z-50 bg-white shadow-md">
        {/* Tab Navigation */}
        <div className="container mx-auto px-4">
          <div className="flex justify-between border-b border-gray-200">
            {[
              {
                id: "match",
                label: "Matches",
                icon: <BsHeartFill className="mr-2" />,
              },
              {
                id: "receive",
                label: "Requests",
                icon: <FaRegHeart className="mr-2" />,
              },
              { id: "send", label: "Sent", icon: <BsHeart className="mr-2" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`relative flex-1 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                  activeView === tab.id
                    ? "text-pink-600 font-bold border-b-2 border-pink-500"
                    : "text-gray-500 hover:text-pink-500"
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === "receive" && receiveUsers.length > 0 && (
                  <span className="absolute top-2 right-4 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
        {/* Fixed Header */}

        {/* Main Content Area */}
        <main className="flex-grow pt-40 pb-12 px-4 overflow-y-auto">
          <div className="max-w-md mx-auto">
            {/* User Cards */}
            {activeView === "send" && sendUsers.map(renderUserCard)}
            {activeView === "receive" && receiveUsers.map(renderUserCard)}
            {activeView === "match" && matchUsers.map(renderUserCard)}

            {/* Empty States */}
            {activeView === "send" && sendUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-32 h-32 mx-auto mb-6 bg-pink-100 rounded-full flex items-center justify-center">
                  <FaRegHeart className="text-5xl text-pink-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No sent requests
                </h3>
                <p className="text-gray-500 mb-6">
                  Your sent requests will appear here
                </p>
                <button
                  className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full shadow hover:shadow-lg transition"
                  onClick={() => navigate("/")}
                >
                  Discover People
                </button>
              </div>
            )}

            {activeView === "receive" && receiveUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-32 h-32 mx-auto mb-6 bg-pink-100 rounded-full flex items-center justify-center">
                  <BsHeart className="text-5xl text-pink-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No new requests
                </h3>
                <p className="text-gray-500 mb-6">
                  When someone likes you, they'll appear here
                </p>
              </div>
            )}

            {activeView === "match" && matchUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-32 h-32 mx-auto mb-6 bg-pink-100 rounded-full flex items-center justify-center">
                  <BsHeartFill className="text-5xl text-pink-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No matches yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start swiping to find your perfect match!
                </p>
                <button
                  className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full shadow hover:shadow-lg transition"
                  onClick={() => navigate("/")}
                >
                  Start Matching
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Fixed Footer */}
      </div>
    </>
  );
};

export default Match;
