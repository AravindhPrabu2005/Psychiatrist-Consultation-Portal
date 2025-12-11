const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyBbgp_pX3q11oJWvAh1zuuiZiX95ITUsmc');

// MongoDB Chat Model (assuming Mongoose is set up)
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chatId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [{
    userRequest: {
      type: String,
      required: true
    },
    aiResponse: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  title: {
    type: String,
    default: 'New Conversation'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Chat = mongoose.model('Chat', chatSchema);

// Helper function to generate titles
async function generateTitle(userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(`Generate a concise 3-5 word title for a conversation that starts with: "${userMessage}". Return only the title text.`);
    const title = result.response.text().replace(/["\n]/g, '').substring(0, 50).trim();
    return title || 'New Conversation';
  } catch (e) {
    console.error('Title generation error:', e);
    return userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '');
  }
}

// POST /api/chat/send - Send message and get AI response with Context
router.post('/send', async (req, res) => {
  try {
    const { userId, chatId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId and message are required' 
      });
    }

    // 1. Retrieve existing chat context if chatId is provided
    let chat;
    let history = [];

    if (chatId) {
      chat = await Chat.findOne({ chatId, userId });
      if (chat) {
        // Format existing messages for Gemini History (last 20 messages)
        const previousMessages = chat.messages.slice(-20);
        history = previousMessages.flatMap(msg => [
          { role: 'user', parts: [{ text: msg.userRequest }] },
          { role: 'model', parts: [{ text: msg.aiResponse }] }
        ]);
      }
    }

    // 2. Initialize Model with system instructions
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    });

    // System instruction
    const systemInstruction = `You are a compassionate and professional AI assistant for a psychology consultation service. 
Provide supportive, empathetic responses while maintaining professional boundaries. 
Always remind users that you're an AI assistant and encourage them to seek professional help for serious concerns.
Keep responses concise, clear, and focused on mental health support.`;

    // 3. Prepare full history with system instruction
    const fullHistory = [
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: 'Understood. I will act as a compassionate psychology consultation assistant.' }] },
      ...history
    ];

    // 4. Start Chat Session with History
    const chatSession = model.startChat({
      history: fullHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // 5. Send Message to AI
    const result = await chatSession.sendMessage(message);
    const aiResponse = result.response.text();

    // 5. Save to Database
    const newChatId = chatId || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (chat) {
      // Update existing chat
      chat.messages.push({ 
        userRequest: message, 
        aiResponse: aiResponse,
        timestamp: new Date()
      });
      chat.updatedAt = new Date();
      
      // Update title if it's a new conversation (runs in background)
      if (chat.messages.length <= 2 && chat.title === 'New Conversation') {
        generateTitle(message)
          .then(t => { 
            chat.title = t; 
            return chat.save(); 
          })
          .catch(console.error);
      } else {
        await chat.save();
      }
    } else {
      // Create new chat
      const title = await generateTitle(message);
      
      chat = new Chat({
        userId,
        chatId: newChatId,
        title: title,
        messages: [{ 
          userRequest: message, 
          aiResponse: aiResponse,
          timestamp: new Date()
        }]
      });
      
      await chat.save();
    }

    res.json({
      success: true,
      data: {
        chatId: newChatId,
        message: aiResponse,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process message',
      details: error.message 
    });
  }
});

// GET /api/chat/history/:userId - Get all chats for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({ userId })
      .select('chatId title createdAt updatedAt messages')
      .sort({ updatedAt: -1 });

    const formattedChats = chats.map(chat => ({
      id: chat.chatId,
      title: chat.title,
      messageCount: chat.messages.length,
      lastMessage: chat.messages.length > 0 
        ? (chat.messages[chat.messages.length - 1].userRequest.substring(0, 50) + '...') 
        : 'No messages',
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }));

    res.json({
      success: true,
      data: formattedChats
    });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch chat history' 
    });
  }
});

// GET /api/chat/:chatId - Get specific chat with all messages
router.get('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId is required' 
      });
    }

    const chat = await Chat.findOne({ chatId, userId });

    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        error: 'Chat not found' 
      });
    }

    res.json({
      success: true,
      data: {
        chatId: chat.chatId,
        title: chat.title,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }
    });

  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch chat' 
    });
  }
});

// DELETE /api/chat/:chatId - Delete a chat
router.delete('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId is required' 
      });
    }

    const result = await Chat.findOneAndDelete({ chatId, userId });

    if (!result) {
      return res.status(404).json({ 
        success: false, 
        error: 'Chat not found' 
      });
    }

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete chat' 
    });
  }
});

// POST /api/chat/new - Create a new chat
router.post('/new', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId is required' 
      });
    }

    const newChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const chat = new Chat({
      userId,
      chatId: newChatId,
      title: 'New Conversation',
      messages: []
    });

    await chat.save();

    res.json({
      success: true,
      data: {
        chatId: chat.chatId,
        title: chat.title,
        createdAt: chat.createdAt
      }
    });

  } catch (error) {
    console.error('New chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create new chat' 
    });
  }
});

module.exports = router;