import React from 'react'
import { Routes, Route } from 'react-router-dom';
import UserRegister from './Components/Auth/UserRegister'
import Header from './Components/Common/Header'
import Profile from './Components/Pages/Profile'
import Home from './Components/Pages/Home';


function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<UserRegister />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>    
    </>
  )
}

export default App
