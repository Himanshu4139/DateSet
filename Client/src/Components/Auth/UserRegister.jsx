import React, {useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc'; // Import Google icon
import Header from '../Common/Header';
import { GoogleAuthProvider,signInWithPopup } from 'firebase/auth';
import { auth } from "./firebase";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import toast from 'react-hot-toast';

// For Vite projects
const API_URL = import.meta.env.VITE_API_URL;

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");


  const navigate = useNavigate();



  // Sign Up handler
async function handleSignUp(e) {
  try {
    e.preventDefault();
    
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const response = await axios.post(`${API_URL}/api/user/register`, {
      email, password, name, mobile, gender
    });

    if (response.status === 201) {
      Cookies.set("token", response.data.token, {
         path: "/" ,
         expires: 30,
         sameSite: 'none',
          secure: true
        });
      toast.success('Registration successful!');
      navigate("/");
    }
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 400) {
        toast.error('This email is already registered');
      } 
      else if (status === 403 && data.authMethod === 'google') {
        toast.error('Account exists with Google. Please login via Google instead');
      }
    } else {
      toast.error('Registration failed. Please try again.');
    }
  }
}

// Sign In handler
async function handleSignIn(e) {
  try {
    e.preventDefault();

    const response = await axios.post(`${API_URL}/api/user/login`, {
      email, password
    });

    if (response.status === 200) {
      Cookies.set("token", response.data.token, {
         path: "/" ,
         expires: 30,
         sameSite: 'none',
          secure: true
        });
      toast.success('Login successful!');
      navigate("/");
    }
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        toast.error('Invalid email or password');
      }
      else if (status === 403 && data.authMethod === 'google') {
        toast.error('Please login via Google instead');
      }
    } else {
      toast.error('Login failed. Please try again.');
    }
  }
}

    // Google login handler handleGoogleSignIn
    async function handleGoogleSignIn() {
      try {
        //setIsLoading(true);
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        
        
        if (result.user) {
          const { displayName, email, uid } = result.user;
          
          // Automatically set defaults without prompting user
          const payload = {
            name: displayName || 'User',
            email,
            googleId: uid,
            gender: 'Non-Binary' // Default gender
          };

          const response = await axios.post(`${API_URL}/api/user/google-auth`, payload);

          if (response.status === 200 || response.status === 201) {
            Cookies.set("token", response.data.token, {
         path: "/" ,
         expires: 30,
         sameSite: 'none',
          secure: true
        });
            toast.success(
              response.status === 201 
                ? 'Account created successfully with Google!' 
                : 'Logged in successfully with Google!'
            );
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Google authentication failed:", error);
        
        if (error.code === 'auth/popup-closed-by-user') {
          toast.error("You closed the login popup. Please try again.");
        } else if (error.code === 'auth/network-request-failed') {
          toast.error("Network error. Please check your internet connection.");
        } else {
          toast.error(error.response?.data?.message || "Authentication failed. Please try again.");
        }
        
        navigate("/auth");
       } //finally {
      //   //setIsLoading(false);
      // }
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

              <form className="space-y-4" onSubmit={isLogin ? handleSignIn : handleSignUp}>
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                      {['Male', 'Female', 'Non-Binary'].map((gender) => (
                        <label key={gender} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
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