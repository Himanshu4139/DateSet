import React, { useEffect, useState } from "react";
import Header from "../Components/Common/Header";
import Footer from "../Components/Common/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie"; // Import Cookies

// For Vite projects
const API_URL = import.meta.env.VITE_API_URL;

const MessagePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const headline = "Your Messages";

  const token = Cookies.get("token"); // Retrieve the token from cookies

  const fetchMatches = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user/matches`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Transform the matches into conversation format
        const formattedConversations = response.data.data.map((match) => ({
          _id: match._id,
          name: match.name || "Unknown User",
          avatar:
            match.profile?.images?.[0] ||
            "https://randomuser.me/api/portraits/lego/1.jpg",
          lastMessage: "Start a conversation...", // Default message
          time: new Date(match.updatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          unread: 0,
          online: false, // You might want to implement real online status
        }));

        setConversations(formattedConversations);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      setError("Failed to load conversations");
      // Fallback to empty array
      setConversations([]);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleSearch = () => {
    setIsSearching(true);

    try {
      if (!searchQuery.trim()) {
        // If search is empty, reset to all conversations
        fetchMatches();
        return;
      }

      const filtered = conversations.filter((convo) => {
        const nameMatch = convo.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const messageMatch = convo.lastMessage
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return nameMatch || messageMatch;
      });

      setConversations(filtered);
    } catch (error) {
      console.error("Search error:", error);
      setError("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const navigateToChat = (userId) => {
    navigate(`/chat-box/${userId}`);
  };

  return (
    <div className="flex flex-col min-h-[calc(90vh)] bg-gray-50 overflow-hidden">
      <Header />
      <Footer activeTab="messages" setActiveTab={() => {}} />
      <div className="border-b border-gray-200 mt-20 fixed top-0 w-full bg-white z-10 shadow-sm">
        <div className="flex flex-col">
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
              {/* Search Button */}
              <button
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-sm font-medium h-8 flex items-center ${
                  isSearching
                    ? "bg-pink-300 cursor-not-allowed"
                    : "bg-pink-500 hover:bg-pink-600 text-white"
                }`}
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Message Area */}
      <main className="flex-1 pt-[136px] overflow-hidden m-2">
        <div className="h-full overflow-y-auto w-full">
          <div className="container mx-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : conversations.length > 0 ? (
              <div className="space-y-2 pt-2 pb-4">
                {conversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className="flex items-center bg-white p-3 rounded-lg shadow-xs hover:shadow-sm transition-shadow duration-150 cursor-pointer"
                    onClick={() => navigateToChat(conversation._id)}
                  >
                    <div className="relative mr-3">
                      <img
                        src={conversation.avatar}
                        alt={conversation.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conversation.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-800">
                          {conversation.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {conversation.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unread > 0 && (
                      <div className="ml-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unread}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10 text-gray-500 min-h-[calc(100vh-200px)]">
                {isSearching ? "No matches found" : "You have no matches yet"}
                <button
                  className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-full shadow hover:bg-pink-600 transition"
                  onClick={() => navigate("/")}
                >
                  Find Matches
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagePage;
