const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Chat = require('../models/Chat');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper: Generate title
async function generateTitle(userMessage) {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Generate a concise 3-5 word title for a conversation that starts with: "${userMessage}". Return only the title text.`,
        },
      ],
      temperature: 0.2,
      max_tokens: 30,
    });

    const title = (completion.choices?.[0]?.message?.content || '')
      .replace(/["\n]/g, '')
      .substring(0, 50)
      .trim();

    return title || 'New Conversation';
  } catch (e) {
    console.error('Title generation error:', e);
    return userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '');
  }
}

// POST /chat/send
router.post('/send', async (req, res) => {
  try {
    const { userId, chatId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId and message are required',
      });
    }

    let chat;
    let historyMessages = [];

    if (chatId) {
      chat = await Chat.findOne({ chatId, userId });
      if (chat) {
        const previousMessages = chat.messages.slice(-20);
        historyMessages = previousMessages.flatMap((msg) => [
          { role: 'user', content: msg.userRequest },
          { role: 'assistant', content: msg.aiResponse },
        ]);
      }
    }

    const systemInstruction = `You are a compassionate and professional AI assistant for a person who has mental health concerns.
Provide supportive, empathetic responses while maintaining professional boundaries. Only answer questions related to mental health issues.`;

    const messages = [
      { role: 'system', content: systemInstruction },
      ...historyMessages,
      { role: 'user', content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices?.[0]?.message?.content?.trim() || '';

    const newChatId =
      chatId || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (chat) {
      // Always push new message and save first
      chat.messages.push({
        userRequest: message,
        aiResponse,
        timestamp: new Date(),
      });
      chat.updatedAt = new Date();
      await chat.save(); // ✅ Always save immediately

      // Update title in background if still default
      if (chat.messages.length <= 2 && chat.title === 'New Conversation') {
        generateTitle(message)
          .then(async (t) => {
            await Chat.findOneAndUpdate({ chatId: chat.chatId }, { title: t });
          })
          .catch(console.error);
      }
    } else {
      // New chat
      const title = await generateTitle(message);
      chat = new Chat({
        userId,
        chatId: newChatId,
        title,
        messages: [{ userRequest: message, aiResponse, timestamp: new Date() }],
      });
      await chat.save();
    }

    res.json({
      success: true,
      data: {
        chatId: newChatId,
        message: aiResponse,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      details: error.message,
    });
  }
});

// POST /chat/new — Create empty chat session
router.post('/new', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const newChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const chat = new Chat({
      userId,
      chatId: newChatId,
      title: 'New Conversation',
      messages: [],
    });

    await chat.save();

    res.json({
      success: true,
      data: { chatId: newChatId },
    });
  } catch (error) {
    console.error('New chat error:', error);
    res.status(500).json({ success: false, error: 'Failed to create chat' });
  }
});

// GET /chat/history/:userId — Fetch all chats for sidebar
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .select('chatId title updatedAt createdAt');

    res.json({
      success: true,
      data: chats.map((chat) => ({
        chatId: chat.chatId,   // ✅ consistent key
        title: chat.title,
        updatedAt: chat.updatedAt,
        createdAt: chat.createdAt,
      })),
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

// GET /chat/:chatId — Load a specific chat with all messages
router.get('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const chat = await Chat.findOne({ chatId, userId });

    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    res.json({
      success: true,
      data: {
        chatId: chat.chatId,
        title: chat.title,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    console.error('Load chat error:', error);
    res.status(500).json({ success: false, error: 'Failed to load chat' });
  }
});

// DELETE /chat/:chatId — Delete a chat
router.delete('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const result = await Chat.findOneAndDelete({ chatId, userId });

    if (!result) {
      return res.status(404).json({ success: false, error: 'Chat not found' });
    }

    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete chat' });
  }
});

module.exports = router;
