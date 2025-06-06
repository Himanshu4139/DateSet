import React from 'react';
import Cookies from 'js-cookie';
import { FaUser, FaEnvelope, FaHeart, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const Footer = () => {
    const navigate = useNavigate();
    return (
        <footer className="fixed bottom-0 left-0 w-full bg-pink-500 text-white flex justify-around items-center py-4">
            <Link to={"/profile"} className="flex flex-col items-center cursor-pointer">
                <FaUser size={24} />
                <span className="text-sm ">Profile</span>
            </Link>
            <div className="flex flex-col items-center cursor-pointer">
                <FaEnvelope size={24} />
                <span className="text-sm">Messages</span>
            </div>
            <Link to={'/match'} className="flex flex-col items-center cursor-pointer">
                <FaHeart size={24} />
                <span className="text-sm">Matches</span>
            </Link>
            <div className="flex flex-col items-center cursor-pointer" onClick={() =>{
                Cookies.remove('token'); // Remove the token from cookies
                navigate ("/auth");

            }}>
                <FaSignOutAlt size={24} />
                <span className="text-sm">Logout</span>
            </div>
        </footer>
    );
};

export default Footer;