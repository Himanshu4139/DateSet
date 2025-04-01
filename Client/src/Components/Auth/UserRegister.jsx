import React, {useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc'; // Import Google icon
import Header from '../Common/Header';
import { GoogleAuthProvider,signInWithPopup } from 'firebase/auth';
import { auth } from "./firebase";
import { useNavigate } from 'react-router-dom';


const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

    // Google login handler
    async function handleGoogleSignIn() {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        
        if (result.user) {
          console.log("Google login successful:", result.user);
          navigate("/profile");
        }
      } catch (error) {
        console.error("Google login failed:", error);
        navigate("/auth");
        // Handle specific errors
        if (error.code === 'auth/popup-closed-by-user') {
          alert("You closed the login popup. Please try again.");
        } else if (error.code === 'auth/network-request-failed') {
          alert("Network error. Please check your internet connection.");
        } else {
          alert("Login failed. Please try again later.");
        }
      }
    }

  return (
    <div>
      <Header/>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 ease-in-out">
            {/* Form header with toggle */}
            <div className="flex">
              <button
                onClick={() => setIsLogin(true)}  
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-300 ${
                  isLogin ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-300 ${
                  !isLogin ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form container */}
            <div className="p-8 space-y-6">
              <h2 className="text-2xl font-bold text-center text-gray-800">
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </h2>

              <form className="space-y-4">
                {!isLogin && (
                  <div className="space-y-4">
                    {/* Username field */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Username"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    {/* Mobile field */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        placeholder="Mobile number"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Password field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-red-600 hover:text-red-500">
                      Forgot password?
                    </a>
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Male', 'Female', 'Other'].map((gender) => (
                        <label key={gender} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="gender"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{gender}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white shadow-md hover:shadow-lg transition-all cursor-pointer ${
                    isLogin ? 'bg-pink-500 hover:bg-pink-600' : 'bg-pink-500 hover:bg-pink-600'
                  }`}
                >
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-3 text-sm text-gray-500">OR</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                className="cursor-pointer w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-full border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                onClick={handleGoogleSignIn}
              >
                <FcGoogle className="h-5 w-5" />
                <span>Sign in with Google</span>
              </button>

              <div className="text-center text-sm text-gray-600">
                {isLogin ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="text-pink-600 hover:text-blue-500 font-medium cursor-pointer"
                    >
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-pink-600 hover:text-purple-500 font-medium cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;