const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Chat = require('../models/Chat');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

        historyMessages = previousMessages.flatMap((msg) => ([
          { role: 'user', content: msg.userRequest },
          { role: 'assistant', content: msg.aiResponse },
        ]));
      }
    }

    const systemInstruction = `You are a compassionate and professional AI assistant for a person who have few problems.
Provide supportive, empathetic responses while maintaining professional boundaries. don't answer other than the mental health issues.`;

    const messages = [
      { role: 'system', content: systemInstruction },
      ...historyMessages,
      { role: 'user', content: message },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // pick any Groq-supported chat model
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices?.[0]?.message?.content?.trim() || '';

    const newChatId =
      chatId || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (chat) {
      chat.messages.push({
        userRequest: message,
        aiResponse,
        timestamp: new Date(),
      });
      chat.updatedAt = new Date();

      if (chat.messages.length <= 2 && chat.title === 'New Conversation') {
        generateTitle(message)
          .then((t) => {
            chat.title = t;
            return chat.save();
          })
          .catch(console.error);
      } else {
        await chat.save();
      }
    } else {
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

module.exports = router;
