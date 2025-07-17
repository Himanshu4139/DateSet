import React, { useEffect, useState } from 'react';
import { FaUser, FaEnvelope, FaHeart, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const Footer = ({ activeTab = 'home', setActiveTab = () => {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Notification state for received requests
  const [hasRequest, setHasRequest] = useState(false);

  useEffect(() => {
    const fetchReceiveRequests = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) return;
        const res = await axios.get(`${API_URL}/api/user/receiveRequests`, {
          withCredentials: true,
        });
        setHasRequest(res.data?.data?.length > 0);
      } catch {
        setHasRequest(false);
      }
    };
    fetchReceiveRequests();
    // Optionally, poll every 1s for real-time effect
    const interval = setInterval(fetchReceiveRequests, 1000);
    return () => clearInterval(interval);
  },);

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
      case 'matches':
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
    <footer className="fixed bottom-0 left-0 w-full bg-pink-500 text-white flex justify-around items-center py-2 shadow-lg z-50">
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
        className={getButtonStyle('matches')}
        onClick={() => handleNavigation('matches')}
        style={{ position: 'relative' }}
      >
        <span className="relative flex items-center">
          <FaHeart size={24} />
          {/* Red dot notification */}
          {hasRequest && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </span>
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