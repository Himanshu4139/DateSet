import React from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Import Cookies
import axios from "axios"; // Import axios if API calls are added

const OnlineUserBox = ({ User }) => {
  const navigate = useNavigate();
  const token = Cookies.get("token"); // Retrieve the token from cookies

  // Example API call (if needed in the future)
  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(`API_ENDPOINT/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  return (
    <div>
      {User.map((user, ind) => (
        <div
          key={ind} // Changed from index to user.id for better key
          className="flex items-start p-2 bg-gray-100 rounded-lg shadow-md my-1 cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => navigate(`/chat-box/${user?._id}`)}
        >
          <div className="flex flex-1">
            <img
              src={user.profile.images[0]}
              alt={user.name}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-md font-semibold text-gray-800">
                {user.name}
              </h4>
            </div>
          </div>
          <div className="flex self-center">
            <span
              className={`w-3 h-3 rounded-full ${
                user.isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
              title={user.isOnline ? "Online" : "Offline"}
            ></span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OnlineUserBox;
