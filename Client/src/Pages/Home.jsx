import React, { useState, useEffect } from 'react';
import Header from '../Components/Common/Header';
import Footer from '../Components/Common/Footer';
import { MdMessage } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { RxChevronLeft, RxChevronRight } from "react-icons/rx";
import OnlineUserBox from '../Components/Common/OnlineUserBox';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [profiles, setProfiles] = useState([]);

  const navigate = useNavigate();

  // ... color palette remains the same
  const primaryColor = 'bg-indigo-600';
  const primaryHover = 'hover:bg-indigo-700';
  const secondaryColor = 'bg-pink-500';
  const secondaryHover = 'hover:bg-pink-600';
  const accentColor = 'bg-amber-400';
  const accentHover = 'hover:bg-amber-500';
  const actionColor = 'bg-emerald-500';
  const actionHover = 'hover:bg-emerald-600';

  // Auto slide effect for images
  useEffect(() => {
    let interval;
    if (isAutoPlaying && profiles.length > 0) {
      const currentImages = profiles[currentUserIndex]?.profile?.images || [];
      if (currentImages.length > 0) {
        interval = setInterval(() => {
          setCurrentImageIndex(prev => 
            prev === currentImages.length - 1 ? 0 : prev + 1
          );
        }, 2000);
      }
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentUserIndex, profiles]);

  const nextUser = async (id) => {
    setIsAutoPlaying(false);
    
    try {
      const res = await axios.post(`http://localhost:4000/api/user/rightSwipe/${id}`, {
        id: id
      }, { withCredentials: true });
      
      setProfiles((prevProfiles) => prevProfiles.filter((user) => user._id !== id));

      setCurrentUserIndex(prev => 
        prev === (profiles?.length || 1) - 1 ? 0 : prev + 1
      );
      
      setCurrentImageIndex(0);
      setTimeout(() => setIsAutoPlaying(true), 1000);
  
    } catch (error) {
      console.error('Error sending request:', 
        error.response?.data || error.message
      );
      setTimeout(() => setIsAutoPlaying(true), 1000);
    }
  };

  const prevUser = async (id) => {
    setIsAutoPlaying(false);
    
    try {
      const res = await axios.post(`http://localhost:4000/api/user/leftSwipe/${id}`, {
        id: id
      }, { withCredentials: true }
      );

      setProfiles((prevProfiles) => prevProfiles.filter((user) => user._id !== id));
  
      setCurrentUserIndex(prev => 
        prev === 0 ? (profiles?.length || 1) - 1 : prev - 1
      );
      
      setCurrentImageIndex(0);
      setTimeout(() => setIsAutoPlaying(true), 1000);
  
    } catch (error) {
      console.error('Error sending request:', 
        error.response?.data?.message || error.message
      );
      setTimeout(() => setIsAutoPlaying(true), 1000);
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
        const res = await axios.get('http://localhost:4000/api/user/allProfile', {
          withCredentials: true,
        });

        const currentUserProfile = await axios.get('http://localhost:4000/api/user/getUser', {
          withCredentials: true,
        });
        
        if (currentUserProfile.data) {
          // Ensure blockRequest, sendRequest, receiveRequest, and matched are arrays
          const blockRequest = currentUserProfile.data.data.blockRequest || [];
          const sendRequest = currentUserProfile.data.data.sendRequest || [];
          const receiveRequest = currentUserProfile.data.data.receiveRequest || [];
          const matched = currentUserProfile.data.data.matched || [];

          // Filter profiles to exclude those in blockRequest, sendRequest, receiveRequest, and matched
          const filteredProfiles = res.data.data.filter((user) => {
            return (
              !blockRequest.includes(user._id) &&
              !sendRequest.includes(user._id) &&
              !receiveRequest.includes(user._id) &&
              !matched.includes(user._id)
            );
          });

          setProfiles(
            filteredProfiles.map((user) => ({
              ...user,
              profile: {
                ...user.profile,
                images: user.profile?.images || [], // Ensure images array exists
              },
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };

    getAllProfile();
  }, []);


     console.log(profiles);


  const calculateAge = (dateOfBirth) => {
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || 
          (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      console.error('Error calculating age:', error);
      return 'N/A';
    }
  };

  const currentUser = profiles[currentUserIndex] || {};

  const currentImages = currentUser.profile?.images || [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* ... header remains the same */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <Header />
      </header>

      <main className="flex-grow pt-16 pb-16 overflow-y-auto px-4">
        <div className="flex flex-col justify-center items-center h-full max-w-4xl mx-auto">
          
          {/* Profile Container */}
          <div className="w-full p-4 m-4 bg-white rounded-lg shadow-md h-[55vh] flex flex-col">
            {/* Image Container */}
            <div className="flex-1 relative overflow-hidden">
  {currentImages.length > 0 ? (
    <div className="h-full w-full flex items-center justify-center">
      <img
        src={currentImages[currentImageIndex]}
        alt={`${currentUser.name}'s profile`}
        className="max-h-full max-w-full object-contain p-2"
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = '/default-profile.jpg';
        }}
      />
    </div>
  ) : (
    <div className="h-full w-full flex items-center justify-center text-gray-400">
      No images available
    </div>
  )}
</div>

            {/* Image Dots Indicator */}
            <div className="flex justify-center space-x-2 py-2">
              {currentImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* User Info */}
            <div className="text-center mb-4">
  <h2 className="text-xl font-bold text-gray-800">
    {currentUser.name}, 
    {currentUser.profile?.dateOfBirth ? (
      calculateAge(currentUser.profile.dateOfBirth)
    ) : 'Age: N/A'}
  </h2>
  <p className="text-gray-600">{currentUser.profile?.bio || 'No bio available'}</p>
</div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-2 pb-2">
            <button className={`h-12 w-12 rounded-full ${primaryColor} text-white flex items-center justify-center ${primaryHover} transition shadow-md`}>
                <MdMessage className="h-5 w-5" />
              </button>
              <button className={`h-12 w-12 rounded-full ${secondaryColor} text-white flex items-center justify-center ${secondaryHover} transition shadow-md`}
                onClick={()=>{
                  navigate(`/user-profile/${currentUser._id}`);
                }}
              >
                <FaRegUser className="h-5 w-5" />
              </button>
              <button 
                onClick={() => prevUser(currentUser?._id)}
                className={`h-12 w-12 rounded-full ${accentColor} text-white flex items-center justify-center ${accentHover} transition shadow-md`}
              >
                <RxChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => nextUser(currentUser?._id)}
                className={`h-12 w-12 rounded-full ${actionColor} text-white flex items-center justify-center ${actionHover} transition shadow-md`}
              >
                <RxChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ... online users section remains the same */}
          <div className="w-full p-4 m-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Online Users</h2>
            <div className="overflow-y-auto max-h-64 pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-4">
              <OnlineUserBox User={profiles}/>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ... footer remains the same */}
      <footer className={`fixed bottom-0 left-0 right-0 z-50 ${primaryColor} shadow-lg text-white`}>
        <Footer />
      </footer>
    </div>
  );
};

export default Home;