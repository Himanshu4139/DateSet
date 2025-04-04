import React, { useState, useEffect } from 'react';
import Header from '../Components/Common/Header';
import Footer from '../Components/Common/Footer';
import { MdMessage } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { RxChevronLeft, RxChevronRight } from "react-icons/rx";
import OnlineUserBox from '../Components/Common/OnlineUserBox';


const images = [
  { id: 1, url: 'https://picsum.photos/800/600?random=1' },
  { id: 2, url: 'https://picsum.photos/800/600?random=2' },
  { id: 3, url: 'https://picsum.photos/800/600?random=3' },
  { id: 4, url: 'https://picsum.photos/800/600?random=4' },
  { id: 5, url: 'https://picsum.photos/800/600?random=5' },
];

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Color palette
  const primaryColor = 'bg-indigo-600';
  const primaryHover = 'hover:bg-indigo-700';
  const secondaryColor = 'bg-pink-500';
  const secondaryHover = 'hover:bg-pink-600';
  const accentColor = 'bg-amber-400';
  const accentHover = 'hover:bg-amber-500';
  const actionColor = 'bg-emerald-500';
  const actionHover = 'hover:bg-emerald-600';

  // Auto slide effect
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
      }, 3000); // Change slide every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextImage = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10 seconds
  };

  const prevImage = () => {
    setIsAutoPlaying(false);
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10 seconds
  };

  const goToImage = (index) => {
    setIsAutoPlaying(false);
    setCurrentImageIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10 seconds
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <Header />
      </header>

      {/* Scrollable Main Content */}
      <main className="flex-grow pt-16 pb-16 overflow-y-auto px-4">
        <div className="flex flex-col justify-center items-center h-full max-w-4xl mx-auto">
          
          {/* Upper Box - Image Carousel */}
          <div className="w-full p-4 m-4 bg-white rounded-lg shadow-md h-[55vh] flex flex-col">
            {/* Image Container */}
            <div className="flex-1 relative overflow-hidden">
              <div 
                className="flex h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
              >
                {images.map((image) => (
                  <div 
                    key={image.id} 
                    className="w-full flex-shrink-0 flex items-center justify-center"
                  >
                    <img
                      src={image.url}
                      alt={`Content ${image.id}`}
                      className="max-h-full max-w-full object-contain p-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2 py-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-2 pb-2">
              <button className={`h-12 w-12 rounded-full ${primaryColor} text-white flex items-center justify-center ${primaryHover} transition shadow-md`}>
                <MdMessage className="h-5 w-5" />
              </button>
              <button className={`h-12 w-12 rounded-full ${secondaryColor} text-white flex items-center justify-center ${secondaryHover} transition shadow-md`}>
                <FaRegUser className="h-5 w-5" />
              </button>
              <button 
                onClick={prevImage}
                className={`h-12 w-12 rounded-full ${accentColor} text-white flex items-center justify-center ${accentHover} transition shadow-md`}
              >
                <RxChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={nextImage}
                className={`h-12 w-12 rounded-full ${actionColor} text-white flex items-center justify-center ${actionHover} transition shadow-md`}
              >
                <RxChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Lower Box - Online Users */}
          <div className="w-full p-4 m-4 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Online Users</h2>
            <div className="overflow-y-auto max-h-64 pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-4">
              <OnlineUserBox/>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className={`fixed bottom-0 left-0 right-0 z-50 ${primaryColor} shadow-lg text-white`}>
        <Footer />
      </footer>
    </div>
  );
};

export default Home;