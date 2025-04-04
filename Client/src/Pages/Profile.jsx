import React from 'react'
import Header from '../Components/Common/Header'
import Footer from '../Components/Common/Footer'
const Profile = () => {
  return (
     <div>
      <Header/>
      <div className='flex justify-center items-center h-screen bg-gray-100'>
        <h1> This is Profile Page </h1>
      </div>
      <Footer/>
    </div>
  )
}

export default Profile
