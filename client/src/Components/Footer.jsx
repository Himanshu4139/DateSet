import React from "react";
import { FaUser, FaEnvelope, FaHeart, FaSignOutAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="sticky bottom-0 z-50 w-full bg-pink-500 text-white flex justify-around items-center py-4">
      <div className="flex flex-col items-center">
        <FaUser size={24} />
        <span className="text-sm">Profile</span>
      </div>
      <div className="flex flex-col items-center">
        <FaEnvelope size={24} />
        <span className="text-sm">Messages</span>
      </div>
      <div className="flex flex-col items-center">
        <FaHeart size={24} />
        <span className="text-sm">Matches</span>
      </div>
      <div className="flex flex-col items-center">
        <FaSignOutAlt size={24} />
        <span className="text-sm">Logout</span>
      </div>
    </footer>
  );
};

export default Footer;
