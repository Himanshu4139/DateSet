import React from "react";
import { FaBell } from "react-icons/fa";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full flex items-center justify-between bg-pink-500 p-4 shadow-md">
      {/* Logo/Image */}
      <img
        src="https://media.istockphoto.com/id/1445815190/vector/modern-gradient-colorful-heart-shape-logo-vector-design-element.jpg?s=612x612&w=0&k=20&c=NMrKHQHEefP6A8llcvmh6rmCikDlB1NRLEQUggMOVWs="
        alt="Logo"
        className="w-10 h-10 rounded-full border-2 border-white"
      />

      {/* Title */}
      <h1 className="text-white text-xl font-bold">DateSet</h1>

      {/* Notification Bell */}
      <div className="relative">
        <FaBell className="text-white text-2xl cursor-pointer" />
        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-1">
          3
        </span>
      </div>
    </header>
  );
};

export default Header;
