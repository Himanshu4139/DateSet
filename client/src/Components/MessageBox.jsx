import React from "react";

const MessageBox = ({
  profilePicture = "data:image/jpeg;base64,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",
  userName = "Himanshu",
  message,
}) => {
  return (
    <div className="flex items-start p-4 bg-gray-100 rounded-lg shadow-md m-y-2 ">
      <img
        src={profilePicture}
        alt={`${userName}'s profile`}
        className="w-12 h-12 rounded-full mr-4"
      />
      <div>
        <h4 className="text-lg font-semibold text-gray-800">{userName}</h4>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default MessageBox;
