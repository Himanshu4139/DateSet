import React, { useState } from "react";
import { FaPaperPlane, FaImage, FaFileAlt, FaUserCircle } from "react-icons/fa";
import { GrAttachment } from "react-icons/gr";
import { MdOutlineCameraAlt } from "react-icons/md";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: true }]);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="flex items-center p-4 bg-pink-500 text-white rounded-b-lg shadow-md">
        <FaUserCircle className="w-10 h-10" />
        <h1 className="ml-4 text-lg font-semibold">User Name</h1>
      </header>

      {/* Chat Box */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender ? "justify-end" : "justify-start"
            } mb-2`}
          >
            <div
              className={`p-3 rounded-2xl text-xl  ${
                message.sender
                  ? "bg-pink-500 text-white"
                  : "bg-pink-300 text-white"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="flex items-center p-4 bg-pink-500 rounded-t-lg shadow-md">
        <button className="p-2 text-white bg-pink rounded-full shadow-md ">
          <GrAttachment className="w-6 h-6" />
        </button>
        <button className="p-2 text-white bg-pink-500 rounded-full shadow-md ">
          <MdOutlineCameraAlt className="w-6 h-6" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          className="flex-1 px-4 py-2  rounded-full bg-white "
        />
        <button
          onClick={handleSend}
          className="p-2 text-white bg-pink-500 rounded-full  "
        >
          <FaPaperPlane className="w-6 h-6" />
        </button>
      </footer>
    </div>
  );
};

export default Chat;
