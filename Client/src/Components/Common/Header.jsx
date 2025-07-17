import React from 'react'
import { FaBell } from 'react-icons/fa'
import { useLocation } from 'react-router-dom';


const Header = ({headline="DateSet"}) => {
  const location = useLocation(); // Add this hook

  // Hide footer on certain routes (e.g., chat page)
  if (location.pathname === '/chat-box') {
    return null;
  }
  // if (location.pathname.startsWith('/profile')) {
  //   return null;
  // }
    
  return (
    <header className="flex items-center justify-between bg-pink-500 p-4 shadow-md fixed top-0 left-0 right-0 z-50">
      {/* Logo/Image */}
      <img
        src="https://cdn.pixabay.com/photo/2016/12/27/13/10/logo-1933884_640.png"
        alt="Logo"
        className="w-10 h-10 rounded-full"
      />

      {/* Title */}
      <h1 className="text-white text-xl font-bold">{headline}</h1>

      {/* Notification Bell */}
      <div className="relative">
        <FaBell className="text-white text-2xl cursor-pointer" />
        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full px-1">
          3
        </span>
      </div>
    </header>
  )
}

export default Header