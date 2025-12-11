import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Send, Plus, MessageSquare, Menu, X, Loader2, Trash2 } from 'lucide-react';
import UserNavbar from './UserNavbar';
import axiosInstance from '../../axiosInstance';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pastChats, setPastChats] = useState([]);
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

  const fetchChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await axiosInstance.get(`/chat/history/${userId}`);
      if (response.data.success) {
        setPastChats(response.data.data);
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
      <div className="flex h-screen pt-16 bg-white">
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}>
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus size={18} />
              <span className="font-medium text-gray-700">New Chat</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              Past Chats
            </h3>
            {loadingHistory ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin text-gray-400" size={24} />
              </div>
            ) : pastChats.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No past chats</p>
            ) : (
              pastChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => loadChat(chat.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg hover:bg-gray-200 transition-colors mb-1 group relative ${
                    currentChatId === chat.id ? 'bg-gray-200' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-sm text-gray-800 truncate">{chat.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(chat.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">Psychology Consultation Bot</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Medical AI Assistant</h1>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="text-blue-500" size={32} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Welcome to Psychology Consultation
                  </h2>
                  <p className="text-gray-500">
                    Start a conversation by typing your message below
                  </p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-2xl ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' ? 'bg-gray-700' : 'bg-blue-500'
                    }`}>
                      <span className="text-white text-sm font-medium">
                        {message.sender === 'user' ? 'U' : 'AI'}
                      </span>
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'user' 
                        ? 'bg-gray-700 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {formatMessage(message.text)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-2xl">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500">
                      <span className="text-white text-sm font-medium">AI</span>
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-gray-100">
                      <Loader2 className="animate-spin text-gray-500" size={20} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-gray-200 bg-white px-4 py-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3 items-end">
                <div className="flex-1 bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:border-gray-400 transition-colors">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    disabled={loading}
                    className="w-full px-4 py-3 bg-transparent resize-none outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50"
                    rows="1"
                    style={{
                      minHeight: '44px',
                      maxHeight: '200px'
                    }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || loading}
                  className={`p-3 rounded-xl transition-all ${
                    inputValue.trim() && !loading
                      ? 'bg-gray-800 hover:bg-gray-700 text-white'
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
              <p className="text-xs text-gray-500 text-center mt-3">
                This AI assistant provides general information. For medical emergencies, please contact emergency services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;