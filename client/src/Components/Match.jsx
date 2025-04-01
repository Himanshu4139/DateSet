import React from "react";

const Match = () => {
  return (
    <div className="flex justify-between items-center p-4 border rounded-lg shadow-md bg-white max-w-md mx-auto my-4">
      {/* Left Side: Profile Picture and Info */}
      <div className="flex items-center">
        <img
          src="https://media.istockphoto.com/id/1445815190/vector/modern-gradient-colorful-heart-shape-logo-vector-design-element.jpg?s=612x612&w=0&k=20&c=NMrKHQHEefP6A8llcvmh6rmCikDlB1NRLEQUggMOVWs="
          alt="User Profile"
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div>
          <h2 className="text-lg font-semibold">John Doe</h2>
          <p className="text-sm text-gray-600">25, New York</p>
        </div>
      </div>

      {/* Right Side: Accept and Deny Badges */}
      <div className="flex space-x-2">
        <span className="bg-green-500 text-white text-sm font-semibold py-1 px-3 rounded-full cursor-pointer hover:bg-green-600">
          Accept
        </span>
        <span className="bg-pink-500 text-white text-sm font-semibold py-1 px-3 rounded-full cursor-pointer hover:bg-pink-600">
          Deny
        </span>
      </div>
    </div>
  );
};

export default Match;
