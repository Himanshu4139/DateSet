import React from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import MessageBox from "../Components/MessageBox";

const MessagePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header - fixed at top */}
      <header className="fixed top-0 w-full z-10">
        <Header />
      </header>

      {/* Main content area - pushed down by header height */}
      <main className="flex-1 pt-16 pb-16 overflow-y-auto">
        {" "}
        {/* pt-16 matches header height, pb-16 matches footer height */}
        <div className="space-y-4 p-4">
          {" "}
          {/* Adds spacing between messages */}
          <MessageBox />
          <MessageBox />
          <MessageBox />
          <MessageBox />
          <MessageBox />
          <MessageBox />
          <MessageBox />
          <MessageBox />
          <MessageBox />
          <MessageBox />
        </div>
      </main>

      {/* Footer - fixed at bottom */}
      <footer className="fixed bottom-0 w-full">
        <Footer />
      </footer>
    </div>
  );
};

export default MessagePage;
