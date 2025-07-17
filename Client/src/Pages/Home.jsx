import React, { useState, useEffect } from 'react';
import Header from '../Components/Common/Header';
import Footer from '../Components/Common/Footer';
import { MdMessage, MdFavorite, MdClose, MdInfo } from "react-icons/md";
import { FaRegUser, FaHeart } from "react-icons/fa";
import { IoMdFlash } from "react-icons/io";
import { BsThreeDotsVertical, BsGeoAlt } from "react-icons/bs";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const Home = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [user, setUser] = useState(null);
  const [swipeCount, setSwipeCount] = useState(0);

  const navigate = useNavigate();

  // Check and reset swipe count if 12 hours have passed
  useEffect(() => {
    const lastSwipeTime = localStorage.getItem("lastSwipeTime");
    const storedCount = parseInt(localStorage.getItem("swipeCount")) || 0;

    if (lastSwipeTime) {
      const hoursPassed = (Date.now() - parseInt(lastSwipeTime)) / (1000 * 60 * 60);
      if (hoursPassed >= 12) {
        localStorage.setItem("swipeCount", "0");
        localStorage.setItem("lastSwipeTime", Date.now().toString());
        setSwipeCount(0);
      } else {
        setSwipeCount(storedCount);
      }
    } else {
      localStorage.setItem("swipeCount", "0");
      localStorage.setItem("lastSwipeTime", Date.now().toString());
      setSwipeCount(0);
    }
  }, []);

  // Auto image slider
  useEffect(() => {
    let interval;
    if (isAutoPlaying && profiles.length > 0) {
      const currentImages = profiles[currentUserIndex]?.profile?.images || [];
      if (currentImages.length > 0) {
        interval = setInterval(() => {
          setCurrentImageIndex(prev =>
            prev === currentImages.length - 1 ? 0 : prev + 1
          );
        }, 1000);
      }
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentUserIndex, profiles]);

  const handleSwipeLimit = () => {
    if (!user?.subscribtion && swipeCount >= 0) {
      toast.error("Limit reached! Upgrade to continue!");
      navigate('/payment');
      return true;
    }
    return false;
  };

  const updateSwipeCount = () => {
    const newCount = swipeCount + 1;
    setSwipeCount(newCount);
    localStorage.setItem("swipeCount", newCount.toString());
    localStorage.setItem("lastSwipeTime", Date.now().toString());
  };

  const nextUser = async (id) => {
    if (handleSwipeLimit()) return;

    setIsAutoPlaying(false);
    setIsLiked(true);
    try {
      await axios.post(`${API_URL}/api/user/rightSwipe/${id}`, { id }, { withCredentials: true });
      setProfiles((prev) => prev.filter((user) => user._id !== id));
      setCurrentUserIndex(prev => prev === (profiles?.length || 1) - 1 ? 0 : prev + 1);
      setCurrentImageIndex(0);
      updateSwipeCount();
    } catch (error) {
      console.error("Right swipe error:", error);
    } finally {
      setTimeout(() => {
        setIsAutoPlaying(true);
        setIsLiked(false);
      }, 1000);
    }
  };

  const prevUser = async (id) => {
    if (handleSwipeLimit()) return;

    setIsAutoPlaying(false);
    setIsPassed(true);
    try {
      await axios.post(`${API_URL}/api/user/leftSwipe/${id}`, { id }, { withCredentials: true });
      setProfiles((prev) => prev.filter((user) => user._id !== id));
      setCurrentUserIndex(prev => prev === 0 ? (profiles?.length || 1) - 1 : prev - 1);
      setCurrentImageIndex(0);
      updateSwipeCount();
    } catch (error) {
      console.error("Left swipe error:", error);
    } finally {
      setTimeout(() => {
        setIsAutoPlaying(true);
        setIsPassed(false);
      }, 1000);
    }
  };

  const goToImage = (index) => {
    setIsAutoPlaying(false);
    setCurrentImageIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 1000);
  };

  useEffect(() => {
    const getAllProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/allProfile`, {
          withCredentials: true,
        });

        const currentUserProfile = await axios.get(`${API_URL}/api/user/getUser`, {
          withCredentials: true,
        });

        if (currentUserProfile.data) {
          setUser(currentUserProfile.data.data);
          const blockRequest = currentUserProfile.data.data.blockRequest || [];
          const sendRequest = currentUserProfile.data.data.sendRequest || [];
          const receiveRequest = currentUserProfile.data.data.receiveRequest || [];
          const matched = currentUserProfile.data.data.matched || [];
          const preference = currentUserProfile.data.data.profile?.preference || {};

          const filteredProfiles = res.data.data.filter((user) => {
            if (
              blockRequest.includes(user._id) ||
              sendRequest.includes(user._id) ||
              receiveRequest.includes(user._id) ||
              matched.includes(user._id)
            ) {
              return false;
            }

            if (user.gender !== preference) {
              return false;
            }

            return true;
          });

          setProfiles(
            filteredProfiles.map((user) => ({
              ...user,
              profile: {
                ...user.profile,
                images: user.profile?.images || [],
              },
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      }
    };

    getAllProfile();

    // const interval = setInterval(getAllProfile, 2000);
    // return () => clearInterval(interval);
  }, []);

  const calculateAge = (dateOfBirth) => {
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return '';
    }
  };

  const currentUser = profiles[currentUserIndex] || {};
  const currentImages = currentUser.profile?.images || [];

  return (
    <>
    <div className='flex flex-col min-h-[calc(100vh-140px)] '>
      <Header headline="DateSet" />
      <main className="flex-grow flex pt-24 px-3 justify-center items-center overflow-hidden bg-white">
        <div className="max-w-md w-full">
          {/* Profile Card Container */}
          <div className={`flex flex-col justify-center ${profiles.length === 0 ? 'items-center h-full' : ''}`}>
            {profiles.length > 0 ? (
              <div className={`w-full bg-white rounded-3xl shadow-xl overflow-hidden relative transition-all duration-300 ${isLiked ? 'animate-pulse' : ''} ${isPassed ? 'animate-shake' : ''}`}>
                {/* Image Carousel */}
                <div className="relative h-64 w-full">
                  {currentImages.length > 0 ? (
                    <div className="h-full w-full relative overflow-hidden">
                      <img
                        src={currentImages[currentImageIndex]}
                        alt={`${currentUser.name}'s profile`}
                        className="h-full w-full object-cover transition-opacity duration-500"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = '/default-profile.jpg';
                        }}
                      />
                      {/* Gradient overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-400">
                      <div className="text-center">
                        <FaRegUser className="text-6xl mx-auto mb-2" />
                        <p className="text-lg font-medium">No photos available</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Image Dots */}
                  {currentImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                      {currentImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToImage(index)}
                          className={`h-2 w-2 rounded-full transition-all ${
                            index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* User basic info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex justify-between items-end">
                      <div>
                        <h2 className="text-2xl font-bold flex items-center">
                          {currentUser.name}
                          {currentUser.profile?.dateOfBirth && (
                            <span className="ml-2 text-lg font-normal">
                              {calculateAge(currentUser.profile.dateOfBirth)}
                            </span>
                          )}
                        </h2>
                        <div className="flex items-center text-sm mt-1">
                          <BsGeoAlt className="mr-1" />
                          <span>{currentUser.profile?.city || 'Location not set'}</span>
                        </div>
                      </div>
                      <button 
                        className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition"
                        onClick={() => navigate(`/user-profile/${currentUser._id}`)}
                      >
                        <MdInfo className="text-xl" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Boost/More options */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between">
                    <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center">
                      <IoMdFlash className="mr-1" />
                      Boost
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/30 transition">
                      <BsThreeDotsVertical />
                    </button>
                  </div>
                </div>
                
                {/* Profile details */}
                <div className="p-4">
                  {/* Bio */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">About</h3>
                    <p className="text-gray-800">
                      {currentUser.profile?.bio || 'No bio yet.'}
                    </p>
                  </div>
                  
                  {/* Interests */}
                  {currentUser.profile?.interests?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-500 mb-2">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentUser.profile.interests.slice(0, 2).map((interest, idx) => (
                          <span 
                            key={idx} 
                            className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 mb-1">Zodiac</h3>
                      <p className="text-gray-800">{currentUser.profile?.zodiac || 'Not set'}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 mb-1">Gender</h3>
                      <p className="text-gray-800">{currentUser.gender || 'Not set'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="py-4">
                  <div className="flex justify-evenly items-center gap-4 w-full">
                    <button
                      onClick={() => prevUser(currentUser?._id)}
                      className="h-12 w-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-400 text-2xl shadow-lg hover:bg-gray-50 hover:border-red-300 hover:text-red-400 transition-all"
                      title="Pass"
                    >
                      <MdClose />
                    </button>
                    
                    <button
                      className="h-14 w-14 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-blue-500 text-2xl shadow-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
                      title="Super Like"
                    >
                      <IoMdFlash />
                    </button>
                    
                    <button
                      onClick={() => nextUser(currentUser?._id)}
                      className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white text-3xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                      title="Like"
                    >
                      <FaHeart />
                    </button>
                    
                    <button
                      onClick={() => {
                        user.subscribtion
                          ? navigate(`/chat-box/${currentUser._id}`)
                          : (
                            toast.error("Upgrade to continue!"),
                            navigate('/payment')
                          );
                      }}
                      className="h-14 w-14 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-purple-500 text-2xl shadow-lg hover:bg-purple-50 hover:border-purple-300 transition-all"
                      title="Message"
                    >
                      <MdMessage />
                    </button>
                    
                    <button
                      className="h-12 w-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-green-500 text-2xl shadow-lg hover:bg-green-50 hover:border-green-300 transition-all"
                      title="Favorite"
                    >
                      <MdFavorite />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <FaRegUser className="text-6xl mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-medium text-gray-600">No profiles available</h3>
                <p className="text-gray-500 mt-2">Check back later or adjust your preferences</p>
              </div>
            )}
          </div>
        </div>
        {/* Animation styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
      </main>
      <Footer activeTab='home' setActiveTab={() => {}} />
      </div>
      </>

  );
};

export default Home;