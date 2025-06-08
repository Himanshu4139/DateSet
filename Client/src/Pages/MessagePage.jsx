import React, { useState} from "react";
import Header from "../Components/Common/Header";
import Footer from "../Components/Common/Footer";
// import MessageBox from "../Components/Common/OnlineUserBox";
import { useNavigate } from "react-router-dom";

const MessagePage = () => {
  // Sample data with more variety
  
  const sampleConversations = [
    {
      name: "John Doe",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      lastMessage: "Hey there! How are you doing today?",
      time: "2:30 PM",
      unread: 1,
      online: true
    },
    {
      name: "Alice Smith",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      lastMessage: "Just got back from vacation! It was amazing.",
      time: "10:15 AM",
      unread: 0,
      online: false
    },
    {
      name: "Bob Johnson",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      lastMessage: "Meeting at 3pm tomorrow",
      time: "Yesterday",
      unread: 1,
      online: true
    },
    ...Array(17).fill({
      name: "Other User",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      lastMessage: "Sample conversation message...",
      time: "Yesterday",
      unread: 0,
      online: false
    })
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState(sampleConversations);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const headline = "Your Messages";

  // Debugging function to log state
  const logState = () => {
    console.log("Current State:", {
      searchQuery,
      conversations,
      isSearching
    });
  };

  const handleSearch = () => {
    setIsSearching(true);
    logState(); // Debug log
    
    try {
      if (!searchQuery.trim()) {
        setConversations(sampleConversations);
        return;
      }

      const filtered = sampleConversations.filter(convo => {
        const nameMatch = convo.name.toLowerCase().includes(searchQuery.toLowerCase());
        const messageMatch = convo.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
        return nameMatch || messageMatch;
      });

      setConversations(filtered);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Debug effect
  // useEffect(() => {
  //   console.log("Conversations updated:", conversations);
  // }, [conversations]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Fixed Header with integrated search */}
      <header className="fixed top-0 w-full z-10 bg-white shadow-sm">
        <Header headline={headline} />
        <div className="border-b border-gray-200 px-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-800 py-3">Messages</h1>
            <div className="relative pb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full py-3 pl-10 pr-24 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                {/* Search Icon */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                {/* Search Button - Added disabled state */}
                <button 
                  className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-sm font-medium h-8 flex items-center
                    ${isSearching 
                      ? 'bg-pink-300 cursor-not-allowed' 
                      : 'bg-pink-500 hover:bg-pink-600 text-white'}`}
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Message Area */}
      <main className="flex-1 pt-[136px] pb-16 overflow-hidden mt-8">
        <div className="h-full overflow-y-auto">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="space-y-2 pt-2 pb-4">
              {conversations.length > 0 ? (
                conversations.map((conversation, index) => (
                  <div 
                    key={index}
                    className="bg-white p-3 rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-150 cursor-pointer"
                    onClick={()=>{navigate('/chat-box')}}
                  >
                    {/* <MessageBox 
                    /> */}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  {isSearching ? 'Searching...' : 'No conversations found'}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-sm">
        <Footer />
      </footer>
    </div>
  );
};

export default MessagePage;