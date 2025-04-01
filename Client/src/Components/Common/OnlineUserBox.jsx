import React from "react";
import MsgData from "../../Data/MsgData";

const MessageBox = () => {
  return (
    <div>
      {MsgData.map((user, index) => (
        <div
          key={index}
          className="flex items-start p-4 bg-gray-100 rounded-lg shadow-md my-2"
        >
          <div className="flex flex-1">
            <img
              src={user.profilePicture} // ✅ Fix: Ensure image is coming from MsgData
              alt={user.userName}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <h4 className="text-lg font-semibold text-gray-800">
                {user.userName}
              </h4>
              <p className="text-gray-600">{user.message}</p>
            </div>
          </div>
          {/* Status dot */}
          {/* Center Dot */}
          <div className="flex self-center">
            <span
              className={`w-4 h-4 rounded-full ${
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

export default MessageBox;
