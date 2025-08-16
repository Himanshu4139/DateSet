import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  FaPaperPlane,
  FaUserCircle,
  FaDownload,
  FaInfoCircle,
} from "react-icons/fa";
import { GrAttachment, GrLinkNext } from "react-icons/gr";
import { MdEmojiEmotions } from "react-icons/md";
import { BsCheck2All, BsFileEarmark } from "react-icons/bs";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie"; // Add this import if not already present

const API_URL = import.meta.env.VITE_API_URL;

const Chat = ({ avatar }) => {
  const token = Cookies.get("token"); // Retrieve the token from cookies

  // State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [changed, setChanged] = useState(false);

  const navigate = useNavigate();

  // Refs
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Router params
  const { userId: otherUserId } = useParams();

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    const newSocket = io(API_URL, {
      withCredentials: true,
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));
    newSocket.on("connect_error", (err) => {
      toast.error("Connection error: " + err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Message handling
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (message) => {
      if (!currentUser) return;
      const isFromCurrentUser = message.sender === currentUser._id;
      const newMessage = {
        _id: message._id,
        text: message.content,
        sender: isFromCurrentUser,
        time: new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: isFromCurrentUser,
        ...(message.file && {
          fileType: message.file.fileType,
          fileUrl: message.file.fileUrl,
          fileName: message.file.fileName,
          fileSize: message.file.fileSize,
        }),
      };
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on("private message", handleIncomingMessage);

    return () => {
      socket.off("private message", handleIncomingMessage);
    };
  }, [socket, currentUser, otherUser]);

  // Fetch user data and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await fetch(`${API_URL}/api/user/getUser`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!userRes.ok) throw new Error("Failed to fetch current user");
        const userData = await userRes.json();
        setCurrentUser(userData.data);

        if (socket && userData.data?._id) {
          socket.emit("register", userData.data._id);
        }

        if (otherUserId) {
          const otherRes = await fetch(
            `${API_URL}/api/user/me/${otherUserId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const otherUserData = await otherRes.json();
          setOtherUser(otherUserData.data);

          // Load message history
          const messagesRes = await fetch(
            `${API_URL}/api/messages/${otherUserId}`,
            {
              credentials: "include",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (messagesRes.ok) {
            const messagesData = await messagesRes.json();
            const processedMessages = messagesData.map((msg) => ({
              _id: msg._id,
              text: msg.content,
              sender: msg.sender === userData.data._id,
              time: new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              read: msg.read,
              ...(msg.file && {
                fileType: msg.file.fileType,
                fileUrl: msg.file.fileUrl,
                fileName: msg.file.fileName,
                fileSize: msg.file.fileSize,
              }),
            }));
            setMessages(processedMessages);
          }
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(() => {
      fetchData();
    }, 1000);
    return () => clearInterval(interval);
  }, [socket, otherUserId, changed]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Delete message
  const handleDeleteMessage = async (msgId) => {
    try {
      await axios.delete(`${API_URL}/api/messages/${msgId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      toast.success("Message deleted");
      setChanged((prev) => !prev);
    } catch {
      toast.error("Failed to delete message");
    }
  };

  // Helper functions
  const handleKeyPress = (e) => {
    if (editingMessageId) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleEditMessage(editingMessageId);
      }
    } else {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    if (!socket || !otherUserId || !currentUser) {
      toast.error("Cannot send message");
      return;
    }

    const message = {
      to: otherUserId,
      content: input.trim(),
      sender: currentUser._id,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    const optimisticMessage = {
      _id: Math.random().toString(36).slice(2),
      text: input.trim(),
      sender: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: true,
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    // Send to backend using axios
    try {
      await axios.post(
        `${API_URL}/api/user/premiumMatch/${otherUserId}`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await axios.post(
        `${API_URL}/api/messages/send`,
        {
          to: otherUserId,
          content: input.trim(),
          file: null,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      // Optionally handle backend error
    }

    setInput("");
    setShowEmojiPicker(false);
  };

  // File upload handler with Cloudinary
  const handleFileSend = async (file) => {
    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/auto/upload`;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      // Temporary message for UI
      const tempMessage = {
        _id: Math.random().toString(36).slice(2),
        sender: true,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: true,
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileType: file.type.split("/")[0] || "file",
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      };

      setMessages((prev) => [...prev, tempMessage]);

      // Upload to Cloudinary
      const cloudRes = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      if (!cloudRes.ok) throw new Error("Cloudinary upload failed");
      const cloudData = await cloudRes.json();

      // Update message with Cloudinary URL
      setMessages((prev) =>
        prev.map((m) =>
          m === tempMessage
            ? {
                ...m,
                fileUrl: cloudData.secure_url,
                fileType: file.type.split("/")[0] || "file",
                fileSize: `${(file.size / 1024).toFixed(1)} KB`,
              }
            : m
        )
      );

      // Send file to backend using axios
      await axios.post(
        `${API_URL}/api/user/premiumMatch/${otherUserId}`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await axios.post(
        `${API_URL}/api/messages/send`,
        {
          to: otherUserId,
          content: "",
          file: {
            fileUrl: cloudData.secure_url,
            fileType: file.type.split("/")[0] || "file",
            fileName: file.name,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          },
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      toast.error("Failed to send file");
      setMessages((prev) =>
        prev.filter((m) => !m.fileUrl || m.fileUrl.includes("blob:"))
      );
    }
  };

  const handleEmojiClick = (emojiData) => {
    if (editingMessageId) {
      setEditInput((prev) => prev + emojiData.emoji);
    } else {
      setInput((prev) => prev + emojiData.emoji);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSend(file);
    e.target.value = null;
  };

  // Render file messages
  const renderFileMessage = (message) => {
    const maxWidth = "max-w-xs md:max-w-md";
    switch (message.fileType) {
      case "image":
        return (
          <div className={`relative group ${maxWidth}`}>
            <img
              src={message.fileUrl}
              alt={message.fileName}
              className="w-full h-auto max-h-64 object-cover rounded-2xl border-2 border-pink-200"
            />
            <a
              href={message.fileUrl}
              download={message.fileName}
              className="absolute bottom-2 right-2 bg-pink-500/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaDownload className="w-4 h-4" />
            </a>
          </div>
        );
      case "video":
        return (
          <div className={`relative group ${maxWidth}`}>
            <video
              controls
              className="w-full h-auto max-h-64 object-cover rounded-2xl border-2 border-pink-200"
            >
              <source
                src={message.fileUrl}
                type={message.file?.type || "video/mp4"}
              />
            </video>
            <a
              href={message.fileUrl}
              download={message.fileName}
              className="absolute bottom-2 right-2 bg-pink-500/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaDownload className="w-4 h-4" />
            </a>
          </div>
        );
      default:
        return (
          <div
            className={`flex items-center justify-between bg-pink-50 p-3 rounded-lg border border-pink-200 ${maxWidth}`}
          >
            <div className="flex items-center">
              <BsFileEarmark className="text-pink-400 mr-2" size={24} />
              <div className="truncate">
                <p className="text-sm font-medium truncate">
                  {message.fileName}
                </p>
                <p className="text-xs text-pink-400">{message.fileSize}</p>
              </div>
            </div>
            <a
              href={message.fileUrl}
              download={message.fileName}
              className="text-pink-500 hover:text-pink-600 p-2 flex-shrink-0"
            >
              <FaDownload className="w-5 h-5" />
            </a>
          </div>
        );
    }
  };

  // Format time helpers
  const formatMessageTime = (time) => time;
  const formatLastSeen = (lastActive) => {
    if (!lastActive) return "recently";
    const date = new Date(lastActive);
    return date.toLocaleString();
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Render no chat selected state
  if (!otherUserId) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        <div className="text-center">
          <FaUserCircle className="mx-auto text-5xl mb-4" />
          <p className="text-xl">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="flex flex-col min-h-[calc(100vh-4.5rem)] bg-gradient-to-b from-pink-50 to-purple-100">
      <header className="fixed top-0 left-0 right-0 z-10 w-full max-w-3xl mx-auto flex items-center justify-between p-4 bg-white/90 backdrop-blur border-b border-pink-100 shadow-sm">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={otherUser?.profile?.images?.[0] || "/default-profile.png"}
              alt={otherUser?.name}
              className="w-10 h-10 rounded-full border-2 border-pink-400 object-cover"
            />
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isConnected ? "bg-green-400" : "bg-gray-400"
              }`}
            ></div>
          </div>
          <div className="ml-4">
            <h1 className="text-lg font-semibold text-pink-600">
              {otherUser?.name}
            </h1>
            <p className="text-xs text-pink-400">
              {isConnected
                ? "Online"
                : `Last seen ${formatLastSeen(otherUser?.lastActive)}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-pink-100 transition-colors"
        >
          <GrLinkNext className="w-6 h-6 text-pink-500" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pt-24 pb-28 px-2 sm:px-4">
        <div className="w-full max-w-2xl mx-auto space-y-3">
          {messages.map((message, index) => (
            <div
              key={message._id || index}
              className={`flex ${
                message.sender ? "justify-end" : "justify-start"
              } group`}
            >
              <div
                className={`relative max-w-xs md:max-w-md px-10 py-2 rounded-2xl shadow-md ${
                  message.sender
                    ? "bg-gradient-to-br from-pink-400 to-pink-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none border border-pink-100"
                }`}
              >
                {message.fileUrl ? (
                  renderFileMessage(message)
                ) : (
                  <p className="text-base break-words">{message.text}</p>
                )}

                {/* Info icon for options */}
                {message.sender && (
                  <div className="absolute top-0 right-0 p-2">
                    <button
                      onClick={() => handleDeleteMessage(message._id)}
                      className="p-1 rounded-full hover:bg-pink-100 transition"
                    >
                      <FiTrash2 className="w-4 h-4 text-black drop-shadow" />
                    </button>
                  </div>
                )}

                <div
                  className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                    message.sender ? "text-pink-100" : "text-gray-500"
                  }`}
                >
                  <span>{message.time}</span>
                  {message.sender && (
                    <BsCheck2All
                      className={message.read ? "text-white" : "text-pink-200"}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-10 w-full max-w-3xl mx-auto p-3 bg-white border-t border-pink-100 shadow-lg">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*, video/*, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt"
        />

        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-16 right-4 z-20">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={300}
              height={400}
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}

        <div className="relative flex items-center bg-white rounded-full px-2 py-1 shadow-inner border border-pink-100">
          <button
            onClick={handleAttachmentClick}
            className="p-2 text-pink-500 hover:text-pink-600 rounded-full transition-colors"
          >
            <GrAttachment className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-pink-500 hover:text-pink-600 rounded-full transition-colors"
          >
            <MdEmojiEmotions className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={editingMessageId ? editInput : input}
            onChange={(e) =>
              editingMessageId
                ? setEditInput(e.target.value)
                : setInput(e.target.value)
            }
            onKeyDown={handleKeyPress}
            placeholder={
              editingMessageId ? "Edit your message..." : "Type a message..."
            }
            className="flex-1 py-2 px-3 bg-transparent focus:outline-none text-gray-700 placeholder-pink-400"
            disabled={isLoading}
          />
          <button
            className={`ml-2 p-2 rounded-full transition-all bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md hover:shadow-lg transform hover:scale-110`}
          >
            <FaPaperPlane className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
