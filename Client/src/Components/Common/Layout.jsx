import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Cookies from 'js-cookie';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    if (!Cookies.get('token')) {
      navigate('/auth');
      return;
    }

    const path = location.pathname;
    
    if (path === '/') {
      setActiveTab('home');
    } else if (path.startsWith('/profile')) {
      setActiveTab('profile');
    } else if (path.startsWith('/match')) {
      setActiveTab('matches');  // Keeping as 'matches' (plural)
    } else if (path.startsWith('/messagepage')) {
      setActiveTab('messages');
    }
  }, [location, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pb-16">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;