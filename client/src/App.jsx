import React from "react";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import MessageBox from "./Components/MessageBox";
import MessagePage from "./Pages/MessagePage";
import Chat from "./Components/Chat";
import Payment from "./Components/Payment";
import Match from "./Components/Match";
import ProfilePage from "./Components/profile/ProfilePage";

function App() {
  return (
    <div>
      {/* <MessagePage /> */}
      <Header />
      <ProfilePage/>
      <Footer />
      {/* <Chat /> */}
    </div>
  );
}

export default App;
