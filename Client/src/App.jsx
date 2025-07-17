import React from 'react'
import { Routes, Route } from 'react-router-dom';
import UserRegister from './Components/Auth/UserRegister'
import Profile from './Pages/Profile'
import Home from './Pages/Home';
import Match from './Pages/Match';
import UserProfile from './Pages/UserProfile';
import MessagePage from './Pages/MessagePage';
import Chat from './Pages/Chat';
import Payment from './Pages/Payment';  
import Layout from './Components/Common/Layout';
import { useState } from 'react';



function App() {

  return (
    <>
      <Routes>
       <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path='/match' element={<Match />} />
        <Route path='/user-profile/:id' element={<UserProfile />} />
        <Route path="payment" element={<Payment />} />
        <Route path="/chat-box/:userId" element={<Chat />} />
        <Route path="/messagepage" element={<MessagePage/>}/>
        <Route path="/chat-box/:userId" element={<Chat />} />
      </Route>  

        <Route path="*" element={<h1>404 Not Found</h1>} />
        <Route path="/auth" element={<UserRegister />} />

      </Routes>    
    </>
  )
}

export default App
