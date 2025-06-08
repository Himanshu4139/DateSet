import React from 'react';
import { FaUser, FaEnvelope, FaHeart, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Footer = ({ activeTab = 'home', setActiveTab = () => {} }) => {
  const navigate = useNavigate();

  const location = useLocation(); // Add this hook

  // Hide footer on certain routes (e.g., chat page)
  if (location.pathname.startsWith('/chat-box')) {
    return null;
  }

  const handleNavigation = (tab) => {
    if (!Cookies.get('token')) {
      navigate('/auth');
      return;
    }

    setActiveTab(tab);
   
    switch(tab) {
      case 'home':
        navigate('/');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'matches':  // Changed from 'match' to 'matches'
        navigate('/match');
        break;
      case 'messages':
        navigate('/messagepage');
        break;
      default:
        navigate('/');
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('userData');
    navigate('/auth');
  };

  const getButtonStyle = (tab) => {
    return `flex flex-col items-center p-2 rounded-lg transition-colors ${
      activeTab === tab 
        ? 'bg-white text-pink-500' 
        : 'text-white hover:bg-pink-400'
    }`;
  };

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-pink-500 text-white flex justify-around items-center py-2 shadow-lg">
      <button
        className={getButtonStyle('home')}
        onClick={() => handleNavigation('home')}
      >
        <FaHome size={24} />
        <span className="text-xs mt-1">Home</span>
      </button>
      
      <button
        className={getButtonStyle('profile')}
        onClick={() => handleNavigation('profile')}
      >
        <FaUser size={24} />
        <span className="text-xs mt-1">Profile</span>
      </button>
      
      <button
        className={getButtonStyle('messages')}
        onClick={() => handleNavigation('messages')}
      >
        <FaEnvelope size={24} />
        <span className="text-xs mt-1">Messages</span>
      </button>
      
      <button
        className={getButtonStyle('matches')}  // Changed from 'match' to 'matches'
        onClick={() => handleNavigation('matches')}  // Changed from 'match' to 'matches'
      >
        <FaHeart size={24} />
        <span className="text-xs mt-1">Matches</span>
      </button>
      
      <button
        className="flex flex-col items-center p-2 rounded-lg text-white hover:bg-pink-400"
        onClick={handleLogout}
      >
        <FaSignOutAlt size={24} />
        <span className="text-xs mt-1">Logout</span>
      </button>
    </footer>
  );
};

export default Footer;