import React, { useState, useEffect } from "react";
import Header from "../Components/Common/Header";
import Footer from "../Components/Common/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Match = () => {
  const [activeTab, setActiveTab] = useState("matches");
  const [activeView, setActiveView] = useState("match"); // 'send', 'receive', 'match'
  const [sendUsers, setSendUsers] = useState([]);
  const [receiveUsers, setReceiveUsers] = useState([]);
  const [matchUsers, setMatchUsers] = useState([]);
  const headline = "Your Matches";

  const navigate = useNavigate();

  // Fetch data for sendRequest, receiveRequest, and match
  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        // Fetch sendRequest users
        const sendRes = await axios.get("http://localhost:4000/api/user/sendRequests", {
          withCredentials: true,
        });
        
        setSendUsers(sendRes.data.data || []);

        // Fetch receiveRequest users
        const receiveRes = await axios.get("http://localhost:4000/api/user/receiveRequests", {
          withCredentials: true,
        });
        setReceiveUsers(receiveRes.data.data || []);

        // Fetch matched users
        const matchRes = await axios.get("http://localhost:4000/api/user/matches", {
          withCredentials: true,
        });
        setMatchUsers(matchRes.data.data || []);
      } catch (error) {
        console.error("Error fetching match data:", error);
      }
    };

    fetchMatchData();
  }, []);

  const calculateAge = (dateOfBirth) => {
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || 
          (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      return 'N/A';
    }
  };

  const removeSentRequest = async (userId) => {
    try {
      const response = await axios.delete(`http://localhost:4000/api/user/removeSentRequest/${userId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setSendUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      }
    } catch (error) {
      console.error('Error removing sent request:', error);
    }
  };

  const acceptRequest = async (userId) => {
    try {
        const response = await axios.put(`http://localhost:4000/api/user/acceptRequest/${userId}`, {}, {
            withCredentials: true,
        });

        if (response.data.success) {
            setReceiveUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
            setMatchUsers((prevUsers) => [...prevUsers, response.data.data]);
        }
    } catch (error) {
        console.error('Error accepting request:', error);
    }
  }

  const denyRequest = async (userId) => {
    try {
      const response = await axios.delete(`http://localhost:4000/api/user/denyRequest/${userId}`, {
        withCredentials: true,
      });

      console.log(response.data);

      if (response.data.success) {
        setReceiveUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      }
    } catch (error) {
      console.error('Error denying request:', error);
    }
  };

  const blockMatch = async (userId) => {
    try {
        const response = await axios.post(`http://localhost:4000/api/user/leftSwipe/${userId}`, {}, {
            withCredentials: true,
        });

        if (response.data.success) {
            setMatchUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
        }
    } catch (error) {
        console.error('Error blocking match:', error);
    }
  }

  const renderUserCard = (user) => {
    const userProfile = user.profile || {};
    const mainImage = userProfile.images?.[0] || '/default-profile.jpg';
    const age = userProfile.dateOfBirth
      ? calculateAge(userProfile.dateOfBirth)
      : 'N/A';
    const location = userProfile.location?.city || 'Location not specified';

    return (
      <div
        key={user._id}
        className="relative p-6 border border-pink-200 rounded-2xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 mb-6"
      >
        {/* Status Badges */}
        <div className="absolute top-2 right-2 flex space-x-2">
          {user.accountStatus === 'active' && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              Active
            </span>
          )}
          {user.isVerified && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              Verified
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <img
              src={mainImage}
              alt="User Profile"
              className="w-16 h-16 rounded-full object-cover border-2 border-pink-300 shadow-md"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {user.name}, {age}
            </h2>
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <span>{user.gender}</span>
              <span>•</span>
              <span>{user.profile.city}</span>
            </div>
            <div className="flex mt-1 space-x-1 flex-wrap">
              {userProfile.interests?.map((interest) => (
                <span
                  key={interest}
                  className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full mb-1"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bio */}
        {userProfile.bio && (
          <p className="text-gray-700 mb-6 italic">"{userProfile.bio}"</p>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {activeView === 'send' && (
            <>
              <button
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                onClick={() => {
                    navigate(`/user-profile/${user?._id}`);
                }}
              >
                View Profile
              </button>
              <button
                className="bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                onClick={() => removeSentRequest(user._id)}
              >
                Remove
              </button>
            </>
          )}
          {activeView === 'receive' && (
            <>
              <button
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                onClick={() => acceptRequest(user._id)}
              >
                Accept
              </button>
              <button
                className="bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                onClick={() => {denyRequest(user._id)}}
              >
                Deny
              </button>
            </>
          )}
          {activeView === 'match' && (
  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full">
    <div className="flex gap-3 w-full sm:w-auto">
      <button
        className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2 px-4 sm:px-6 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
        onClick={()=>{
            navigate(`/user-profile/${user._id}`);
        }}
      >
        View Profile
      </button>
      <button
        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 px-4 sm:px-6 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
        onClick={() => console.log('Message clicked')}
      >
        Message
      </button>
    </div>
    
    <button
      className="w-full sm:w-auto bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold py-2 px-4 sm:px-6 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
      onClick={() => blockMatch(user._id)}
    >
      Block User
    </button>
  </div>
)}
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>Last Active:</span>
            <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Member Since:</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <Header headline={headline} />
        <div className="container mx-auto px-4">
          <div className="flex justify-between border-t border-b border-gray-200">
            {["send", "receive", "match"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveView(tab)}
                className={`flex-1 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeView === tab
                    ? "border-pink-500 text-pink-600 font-bold"
                    : "border-transparent text-gray-500 hover:text-pink-500"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main scrollable area */}
      <main className="flex-grow pt-[170px] pb-16 container mx-auto px-4 overflow-y-auto scroll-smooth">
        <div className="max-w-md mx-auto">
          {/* Cards */}
          {activeView === "send" && sendUsers.map(renderUserCard)}
          {activeView === "receive" && receiveUsers.map(renderUserCard)}
          {activeView === "match" && matchUsers.map(renderUserCard)}

          {/* Empty States */}
          {activeView === "send" && sendUsers.length === 0 && (
            <div className="text-center py-12">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
                alt="No sent requests"
                className="w-24 h-24 mx-auto mb-4 opacity-70"
              />
              <p className="text-gray-500 text-lg">No sent requests yet</p>
              <button
                className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-full shadow hover:bg-pink-600 transition"
                onClick={()=>{
                    navigate('/');
                }
                }
              >
                Discover People
              </button>
            </div>
          )}

          {activeView === "receive" && receiveUsers.length === 0 && (
            <div className="text-center py-12">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076472.png"
                alt="No received requests"
                className="w-24 h-24 mx-auto mb-4 opacity-70"
              />
              <p className="text-gray-500 text-lg">No received requests</p>
            </div>
          )}

          {activeView === "match" && matchUsers.length === 0 && (
            <div className="text-center py-12">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076475.png"
                alt="No matches"
                className="w-24 h-24 mx-auto mb-4 opacity-70"
              />
              <p className="text-gray-500 text-lg">No matches yet</p>
              <button
                className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-full shadow hover:bg-pink-600 transition"
                onClick={() => {
                    navigate('/');
                }}
              >
                Start Matching
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-50">
      <Footer activeTab={activeTab} setActiveTab={setActiveTab} />
      </footer>
    </div>
  );
};

export default Match;