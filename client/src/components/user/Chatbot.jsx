import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Send, Plus, MessageSquare, Menu, X, Loader2, Trash2, Bot, User, Search, PanelLeftClose, PanelLeft } from 'lucide-react';
import UserNavbar from './UserNavbar';
import axiosInstance from '../../axiosInstance';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pastChats, setPastChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  
  const userId = localStorage.getItem('id');

  // Function to format message text with markdown-like syntax
  const formatMessage = (text) => {
    if (!text) return null;

    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      
      if (part.match(/^\d+\.\s+\*\*/)) {
        const lines = part.split('\n');
        return lines.map((line, lineIndex) => {
          if (line.match(/^\d+\.\s+\*\*/)) {
            const numberMatch = line.match(/^(\d+\.)\s+\*\*(.*?)\*\*:\s*(.*)/);
            if (numberMatch) {
              return (
                <div key={`${index}-${lineIndex}`} className="my-2">
                  <span className="font-medium">{numberMatch[1]} </span>
                  <strong className="font-semibold">{numberMatch[2]}</strong>
                  <span>: {numberMatch[3]}</span>
                </div>
              );
            }
          }
          return <span key={`${index}-${lineIndex}`}>{line}</span>;
        });
      }
      
      return part.split('\n').map((line, lineIndex) => (
        <Fragment key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < part.split('\n').length - 1 && <br />}
        </Fragment>
      ));
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Filter chats based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(pastChats);
    } else {
      const filtered = pastChats.filter(chat =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    }
  }, [searchQuery, pastChats]);

  const fetchChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await axiosInstance.get(`/chat/history/${userId}`);
      if (response.data.success) {
        setPastChats(response.data.data);
        setFilteredChats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadChat = async (chatId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/chat/${chatId}?userId=${userId}`);
      if (response.data.success) {
        const chat = response.data.data;
        setCurrentChatId(chatId);
        
        const formattedMessages = [];
        chat.messages.forEach((msg) => {
          formattedMessages.push({
            id: `user-${msg.timestamp}`,
            text: msg.userRequest,
            sender: 'user',
            timestamp: new Date(msg.timestamp)
          });
          formattedMessages.push({
            id: `bot-${msg.timestamp}`,
            text: msg.aiResponse,
            sender: 'bot',
            timestamp: new Date(msg.timestamp)
          });
        });
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (inputValue.trim() && !loading) {
      const userMessage = {
        id: `user-${Date.now()}`,
        text: inputValue,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      const messageText = inputValue;
      setInputValue('');
      setLoading(true);

      try {
        const response = await axiosInstance.post('/chat/send', {
          userId,
          chatId: currentChatId,
          message: messageText
        });

        if (response.data.success) {
          const { chatId, message: aiResponse } = response.data.data;
          
          if (!currentChatId) {
            setCurrentChatId(chatId);
          }

          const botMessage = {
            id: `bot-${Date.now()}`,
            text: aiResponse,
            sender: 'bot',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botMessage]);
          fetchChatHistory();
        }
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = {
          id: `error-${Date.now()}`,
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await axiosInstance.post('/chat/new', { userId });
      if (response.data.success) {
        setCurrentChatId(response.data.data.chatId);
        setMessages([
          {
            id: 'welcome',
            text: "Hello! I'm here to assist you with your psychology consultation. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
          }
        ]);
        fetchChatHistory();
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      setCurrentChatId(null);
      setMessages([
        {
          id: 'welcome',
          text: "Hello! I'm here to assist you with your psychology consultation. How can I help you today?",
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        const response = await axiosInstance.delete(`/chat/${chatId}?userId=${userId}`);
        if (response.data.success) {
          if (currentChatId === chatId) {
            handleNewChat();
          }
          fetchChatHistory();
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
      }
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const chatDate = new Date(date);
    const diffTime = Math.abs(now - chatDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <>
      <UserNavbar />
      <div className="flex h-screen pt-16 bg-gray-50">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden shadow-sm`}>
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#2ADA71] to-[#25c063] text-white rounded-lg hover:shadow-md transition-all font-medium"
            >
              <Plus size={18} />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ADA71] focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  <X size={14} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="flex items-center justify-between px-3 mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Recent Chats
              </h3>
              {searchQuery && (
                <span className="text-xs text-gray-500">
                  {filteredChats.length} result{filteredChats.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {loadingHistory ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin text-gray-300" size={24} />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageSquare className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-sm text-gray-400">
                  {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-[#2ADA71] hover:underline mt-2"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => loadChat(chat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all mb-1.5 group relative ${
                    currentChatId === chat.id 
                      ? 'bg-green-50 border border-green-100' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <MessageSquare 
                      size={16} 
                      className={`mt-0.5 flex-shrink-0 ${
                        currentChatId === chat.id ? 'text-[#2ADA71]' : 'text-gray-400'
                      }`} 
                    />
                    <div className="flex-1 min-w-0 pr-6">
                      <p className={`text-sm truncate ${
                        currentChatId === chat.id ? 'text-gray-900 font-medium' : 'text-gray-700'
                      }`}>
                        {chat.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(chat.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 size={14} className="text-red-400 hover:text-red-500" />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-400">
              <Bot size={16} />
              <p className="text-xs">AI Psychology Assistant</p>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 shadow-sm">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <PanelLeftClose size={20} className="text-gray-600" />
              ) : (
                <PanelLeft size={20} className="text-gray-600" />
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-r from-[#2ADA71] to-[#25c063] rounded-full flex items-center justify-center">
                <Bot className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-800">AI Medical Assistant</h1>
                <p className="text-xs text-gray-500">Always here to help</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.length === 0 && !loading && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-100">
                    <Bot className="text-[#2ADA71]" size={40} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Welcome to Your AI Psychology Assistant
                  </h2>
                  <p className="text-gray-500 max-w-md mx-auto">
                    I'm here to provide guidance and support. Start a conversation by typing your message below.
                  </p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-gray-700' 
                        : 'bg-gradient-to-r from-[#2ADA71] to-[#25c063]'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="text-white" size={18} />
                      ) : (
                        <Bot className="text-white" size={18} />
                      )}
                    </div>
                    <div className={`rounded-2xl px-5 py-3 shadow-sm ${
                      message.sender === 'user' 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-white text-gray-800 border border-gray-100'
                    }`}>
                      <div className="text-sm leading-relaxed">
                        {formatMessage(message.text)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-3xl">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-[#2ADA71] to-[#25c063]">
                      <Bot className="text-white" size={18} />
                    </div>
                    <div className="rounded-2xl px-5 py-3 bg-white border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin text-[#2ADA71]" size={18} />
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white px-6 py-4 shadow-sm">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3 items-end">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-[#2ADA71] focus-within:bg-white transition-all">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    disabled={loading}
                    className="w-full px-4 py-3 bg-transparent resize-none outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50"
                    rows="1"
                    style={{
                      minHeight: '48px',
                      maxHeight: '200px'
                    }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || loading}
                  className={`p-3 rounded-xl transition-all ${
                    inputValue.trim() && !loading
                      ? 'bg-gradient-to-r from-[#2ADA71] to-[#25c063] hover:shadow-lg text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                This AI provides general information. For emergencies, contact emergency services immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
