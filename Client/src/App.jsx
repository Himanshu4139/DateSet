import React from 'react'
import { Routes, Route } from 'react-router-dom';
import UserRegister from './Components/Auth/UserRegister'
import Profile from './Pages/Profile'
import Home from './Pages/Home';
import Match from './Pages/Match';
import UserProfile from './Pages/UserProfile';


function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<UserRegister />} />
        <Route path="/profile" element={<Profile />} />
        <Route path='/match' element={<Match />} />
        <Route path='/user-profile/:id' element={<UserProfile />} />
      </Routes>    
    </>
  )
}

export default App
