import React, { useState, useEffect, useRef } from "react";
import { io } from 'socket.io-client';
import { FaPaperPlane, FaUserCircle, FaDownload } from "react-icons/fa";
import { GrLinkNext  } from "react-icons/gr";
import { GrAttachment } from "react-icons/gr";
import { MdEmojiEmotions } from "react-icons/md";
import { BsCheck2All, BsFileEarmark } from "react-icons/bs";
import EmojiPicker from 'emoji-picker-react';
import { useParams } from 'react-router-dom';
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  // State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  
  // Refs
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  
  // Router params
  const { userId: otherUserId } = useParams();

  // Initialize socket connection
  useEffect(() => {
    console.log('[SOCKET] Initializing connection to server...');
    const token = localStorage.getItem('token');
    
    const newSocket = io('http://localhost:4000', {
      withCredentials: true,
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('[SOCKET] ✅ Connected with ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[SOCKET] ❌ Disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('[SOCKET] Connection error:', err);
      toast.error('Connection error: ' + err.message);
    });

    setSocket(newSocket);

    return () => {
      console.log('[SOCKET] Cleaning up connection');
      newSocket.disconnect();
    };
  }, []);

  // Message handling with detailed sender/receiver logging
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (message) => {
      console.groupCollapsed(`[MESSAGE] 📩 Incoming message from ${message.sender}`);
      console.log('Full message object:', message);
      
      if (!currentUser) {
        console.warn('Current user not loaded - message queued');
        console.groupEnd();
        return;
      }

      const isFromCurrentUser = message.sender === currentUser._id;
      const senderName = isFromCurrentUser ? 'You' : otherUser?.name || 'Unknown';
      
      console.log(`👤 Sender: ${senderName} (${message.sender})`);
      console.log(`👥 Receiver: ${isFromCurrentUser ? otherUser?.name || 'Unknown' : 'You'}`);
      console.log(`📝 Content: ${message.content || '(file attachment)'}`);
      console.log(`🕒 Timestamp: ${message.createdAt || 'now'}`);

      const newMessage = {
        text: message.content,
        sender: isFromCurrentUser,
        time: new Date(message.createdAt || Date.now()).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        read: isFromCurrentUser,
        ...(message.file && {
          fileType: message.fileType,
          fileUrl: message.fileUrl,
          fileName: message.fileName,
          fileSize: message.fileSize
        })
      };

      console.log('Processed message for UI:', newMessage);
      console.groupEnd();

      setMessages(prev => [...prev, newMessage]);
    };

    socket.on('private message', handleIncomingMessage);

    return () => {
      socket.off('private message', handleIncomingMessage);
    };
  }, [socket, currentUser, otherUser]);

  // Fetch user data and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('[API] Fetching current user data...');
        const userRes = await fetch('http://localhost:4000/api/user/getUser', {
          credentials: 'include'
        });
        
        if (!userRes.ok) throw new Error('Failed to fetch current user');
        
        const userData = await userRes.json();
        console.log('[API] Current user:', userData.data);
        setCurrentUser(userData.data);
        
        // Register with socket.io
        if (socket && userData.data?._id) {
          console.log(`[SOCKET] Registering user ID: ${userData.data._id}`);
          socket.emit('register', userData.data._id);
        }

        // Fetch other user if ID exists
        if (otherUserId) {
          console.log('[API] Fetching other user data...');
          const otherRes = await fetch(`http://localhost:4000/api/user/me/${otherUserId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          
          const otherUserData = await otherRes.json();
          console.log('[API] Other user:', otherUserData.data);
          setOtherUser(otherUserData.data);

          // Load message history
          console.log('[API] Fetching message history...');
          const messagesRes = await fetch(`http://localhost:4000/api/messages/${otherUserId}`, {
            credentials: 'include'
          });
          
          if (messagesRes.ok) {
            const messagesData = await messagesRes.json();
            console.log(`[API] Retrieved ${messagesData.length} historical messages`);
            
            const processedMessages = messagesData.map(msg => ({
              text: msg.content,
              sender: msg.sender === userData.data._id,
              time: new Date(msg.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              read: msg.read,
              ...(msg.file && {
                fileType: msg.fileType,
                fileUrl: msg.fileUrl,
                fileName: msg.fileName,
                fileSize: msg.fileSize
              })
            }));
            
            setMessages(processedMessages);
          }
        }
      } catch (err) {
        console.error('[ERROR] Fetch error:', err);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [socket, otherUserId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Enhanced send message with detailed logging
  const handleSend = () => {
    console.group('[MESSAGE] ✉️ Attempting to send message');
    
    if (!input.trim()) {
      console.log('❌ Empty message - aborting send');
      toast.error('Message cannot be empty');
      console.groupEnd();
      return;
    }
    
    if (!socket || !otherUserId || !currentUser) {
      console.log('❌ Missing requirements:', {
        socket: !!socket,
        otherUserId,
        currentUser: !!currentUser
      });
      toast.error('Cannot send message');
      console.groupEnd();
      return;
    }

    const message = {
      to: otherUserId,
      content: input.trim(),
      sender: currentUser._id,
      createdAt: new Date().toISOString()
    };

    console.log('📤 Outgoing message payload:', message);
    console.log(`👤 Sender: You (${currentUser._id})`);
    console.log(`👥 Receiver: ${otherUser?.name || 'Unknown'} (${otherUserId})`);

    // Optimistic update
    const optimisticMessage = {
      text: input.trim(),
      sender: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: true
    };
    
    console.log('🔄 Adding optimistic message to UI:', optimisticMessage);
    setMessages(prev => [...prev, optimisticMessage]);

    socket.emit('private message', message, (ack) => {
      if (ack?.error) {
        console.error('❌ Send failed:', ack.error);
        toast.error('Failed to send: ' + ack.error);
        setMessages(prev => prev.filter(m => m !== optimisticMessage));
      } else {
        console.log('✅ Message successfully delivered to server');
        console.log('🔄 Updating message status:', {
          messageId: ack?.messageId,
          status: 'delivered'
        });
      }
      console.groupEnd();
    });

    setInput("");
    setShowEmojiPicker(false);
  };

  // File upload handler with detailed logging
  const handleFileSend = async (file) => {
    console.group('[FILE] 📤 Uploading file');
    console.log('📄 File details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(1)} KB`
    });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('recipient', otherUserId);

      // Temporary message
      const tempMessage = {
        sender: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileType: file.type.split('/')[0] || 'file',
        fileSize: `${(file.size / 1024).toFixed(1)} KB`
      };
      
      console.log('🔄 Adding temporary file message to UI:', tempMessage);
      setMessages(prev => [...prev, tempMessage]);

      console.log('🔼 Starting file upload to server...');
      const res = await fetch('http://localhost:4000/api/messages/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const fileData = await res.json();
      console.log('✅ File upload successful:', fileData);

      // Replace temporary URL with permanent one
      setMessages(prev => prev.map(m => 
        m === tempMessage ? { 
          ...m, 
          fileUrl: fileData.fileUrl,
          fileType: fileData.fileType,
          fileSize: fileData.fileSize
        } : m
      ));

      console.log('📤 Sending file metadata via socket...');
      socket.emit('private message', {
        to: otherUserId,
        file: fileData,
        sender: currentUser._id
      }, (ack) => {
        console.log('📩 Server acknowledgement:', ack);
      });

    } catch (err) {
      console.error('❌ File upload error:', err);
      toast.error('Failed to send file');
      setMessages(prev => prev.filter(m => !m.fileUrl || m.fileUrl.includes('blob:')));
    } finally {
      console.groupEnd();
    }
  };

  // Helper functions
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData) => {
    setInput(prev => prev + emojiData.emoji);
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
      case 'image':
        return (
          <div className={`relative group ${maxWidth}`}>
            <img 
              src={message.fileUrl} 
              alt={message.fileName} 
              className="w-full h-auto max-h-64 object-cover rounded-lg"
            />
            <a 
              href={message.fileUrl} 
              download={message.fileName}
              className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaDownload className="w-4 h-4" />
            </a>
          </div>
        );
      case 'video':
        return (
          <div className={`relative group ${maxWidth}`}>
            <video 
              controls 
              className="w-full h-auto max-h-64 object-cover rounded-lg"
            >
              <source src={message.fileUrl} type={message.file?.type || 'video/mp4'} />
            </video>
            <a 
              href={message.fileUrl} 
              download={message.fileName}
              className="absolute bottom-2 right-2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaDownload className="w-4 h-4" />
            </a>
          </div>
        );
      default:
        return (
          <div className={`flex items-center justify-between bg-gray-100 p-3 rounded-lg ${maxWidth}`}>
            <div className="flex items-center">
              <BsFileEarmark className="text-gray-500 mr-2" size={24} />
              <div className="truncate">
                <p className="text-sm font-medium truncate">{message.fileName}</p>
                <p className="text-xs text-gray-500">{message.fileSize}</p>
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

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
    <div className="flex flex-col h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 w-full max-w-3xl mx-auto flex items-center justify-between p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg mb-2">
        <div className="flex items-center">
          <div className="relative">
            <FaUserCircle className="w-10 h-10" />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              isConnected ? 'bg-green-400' : 'bg-gray-400'
            }`}></div>
          </div>
          <div className="ml-4">
            <h1 className="text-lg font-semibold">{otherUser?.name}</h1>
            <p className="text-xs text-pink-100">
              {isConnected ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <GrLinkNext  className="w-6 h-6" />
        </button>
      </header>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto pt-10 pb-10">
        <div className="w-full max-w-3xl mx-auto px-4 space-y-3">
          {messages.map((message, index) => {
            console.log(`[RENDER] Message ${index}:`, {
              from: message.sender ? 'You' : otherUser?.name || 'Unknown',
              content: message.text || '(file)',
              time: message.time,
              isFile: !!message.fileUrl
            });
            
            return (
              <div
                key={index}
                className={`flex ${message.sender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-xs md:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                    message.sender
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none shadow"
                  }`}
                >
                  {message.fileUrl ? (
                    renderFileMessage(message)
                  ) : (
                    <p className="text-sm">{message.text}</p>
                  )}
                  <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                    message.sender ? 'text-pink-100' : 'text-gray-500'
                  }`}>
                    <span>{message.time}</span>
                    {message.sender && (
                      <BsCheck2All className={message.read ? "text-blue-300" : "text-gray-300"} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 w-full max-w-3xl mx-auto p-3 bg-white border-t border-gray-200 shadow-lg">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*, video/*, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt"
        />
        
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-16 right-4">
            <EmojiPicker 
              onEmojiClick={handleEmojiClick} 
              width={300} 
              height={400}
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
        
        <div className="relative flex items-center">
          <button 
            onClick={handleAttachmentClick}
            className="absolute left-3 p-2 text-gray-500 hover:text-pink-500 rounded-full transition-colors"
          >
            <GrAttachment className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 py-2 pl-10 pr-10 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
          />
          
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-12 p-2 text-gray-500 hover:text-pink-500 rounded-full transition-colors"
          >
            <MdEmojiEmotions className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`ml-2 p-2 rounded-full transition-all ${
              input.trim() 
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md hover:shadow-lg transform hover:scale-110' 
                : 'text-gray-400 bg-gray-200'
            }`}
          >
            <FaPaperPlane className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Chat;