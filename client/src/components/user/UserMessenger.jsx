import React, { useEffect, useState, useRef } from 'react';
import UserNavbar from './UserNavbar';
import { Search, Send, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import axiosInstance from '../../axiosInstance';
import io from 'socket.io-client';

const UserMessenger = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const userId = localStorage.getItem('id');

  // Initialize Socket.IO connection
  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io('http://localhost:8000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Register user when connected
    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
      socketRef.current.emit('register', {
        userId: userId,
        userType: 'User'
      });
    });

    // Listen for registration confirmation
    socketRef.current.on('registered', (data) => {
      console.log('Registered successfully:', data);
    });

    // Listen for incoming messages
    socketRef.current.on('receive_message', (messageData) => {
      console.log('Received message:', messageData);
      
      // Only add message if it's from the currently selected user
      setMessages((prevMessages) => [...prevMessages, {
        id: messageData.messageId,
        senderId: messageData.senderId,
        text: messageData.content,
        timestamp: new Date(messageData.createdAt).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        isMine: false
      }]);
    });

    // Listen for message sent confirmation
    socketRef.current.on('message_sent', (data) => {
      console.log('Message sent confirmation:', data);
    });

    // Listen for typing indicator
    socketRef.current.on('user_typing', (data) => {
      if (data.userId === selectedUser?._id) {
        setIsTyping(true);
      }
    });

    socketRef.current.on('user_stop_typing', (data) => {
      if (data.userId === selectedUser?._id) {
        setIsTyping(false);
      }
    });

    // Listen for read receipts
    socketRef.current.on('messages_read', (data) => {
      console.log('Messages read by:', data.readBy);
      // Update message read status in UI if needed
    });

    // Handle connection errors
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketRef.current.on('message_error', (error) => {
      console.error('Message error:', error);
      alert('Failed to send message. Please try again.');
    });

    // Cleanup function - disconnect socket when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Socket disconnected');
      }
    };
  }, [userId]); // Only run once when component mounts

  // Fetch doctors list
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axiosInstance.get(`/messenger/getDoctors/${userId}`);
        setDoctors(response.data);
      } catch (error) {
        console.log('Error fetching doctors:', error);
      }
    };
    fetchDoctors();
  }, [userId]);

  // Fetch messages when a doctor is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser) {
        try {
          const response = await axiosInstance.get(
            `/messenger/messages/${userId}/${selectedUser._id}?userType=User&otherUserType=Admin`
          );
          
          // Transform messages to match UI format
          const formattedMessages = response.data.map((msg) => ({
            id: msg._id,
            senderId: msg.senderId,
            text: msg.content,
            timestamp: new Date(msg.createdAt).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            }),
            isMine: msg.senderId === userId
          }));
          
          setMessages(formattedMessages);

          // Mark messages as read
          await axiosInstance.patch(`/messenger/messages/read/${userId}/${selectedUser._id}`);
          
          // Emit mark_read event to notify sender
          if (socketRef.current) {
            socketRef.current.emit('mark_read', { senderId: selectedUser._id });
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };
    
    fetchMessages();
  }, [selectedUser, userId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredUsers = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim() && selectedUser && socketRef.current) {
      // Emit message through Socket.IO
      socketRef.current.emit('private_message', {
        receiverId: selectedUser._id,
        receiverType: 'Admin',
        content: message.trim()
      });

      // Add message to UI immediately (optimistic update)
      const newMessage = {
        id: Date.now(), // Temporary ID
        senderId: userId,
        text: message.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        isMine: true
      };
      
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage('');

      // Stop typing indicator
      socketRef.current.emit('stop_typing', { receiverId: selectedUser._id });
    }
  };

  const handleTyping = () => {
    if (selectedUser && socketRef.current) {
      // Emit typing event
      socketRef.current.emit('typing', { receiverId: selectedUser._id });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('stop_typing', { receiverId: selectedUser._id });
      }, 2000);
    }
  };

  return (
    <>
      <UserNavbar />
      <div className="flex h-screen pt-16 bg-white">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Messages</h2>
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A1D7C] focus:border-transparent"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((doctor) => (
                <div
                  key={doctor._id}
                  onClick={() => setSelectedUser(doctor)}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedUser?._id === doctor._id ? 'bg-blue-50 border-l-4 border-[#2A1D7C]' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={doctor.profilePhoto || 'https://via.placeholder.com/150'}
                      alt={doctor.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{doctor.name}</h3>
                    <p className="text-sm text-gray-600 truncate">Doctor</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <p className="text-center">No doctors found</p>
                <p className="text-xs text-center mt-2">Book an appointment to start messaging</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={selectedUser.profilePhoto || 'https://via.placeholder.com/150'}
                      alt={selectedUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{selectedUser.name}</h3>
                    <p className="text-xs text-gray-500">
                      {isTyping ? 'typing...' : 'Doctor'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.isMine
                            ? 'bg-[#2A1D7C] text-white rounded-br-none'
                            : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <span
                          className={`text-xs mt-1 block ${
                            msg.isMine ? 'text-gray-200' : 'text-gray-500'
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2A1D7C] focus:border-transparent"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-gray-100 p-1 rounded-full transition-colors">
                      <Smile className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    className="p-3 bg-[#2A1D7C] hover:bg-[#1f1557] text-white rounded-full transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a doctor from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserMessenger;
