const Message = require('../models/Message');

// Store connected users: { userId: socketId }
const connectedUsers = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User registers their ID and type when connecting
    socket.on('register', ({ userId, userType }) => {
      socket.userId = userId;
      socket.userType = userType;
      
      // Join a room with their userId for private messaging
      socket.join(userId);
      connectedUsers.set(userId, socket.id);
      
      console.log(`${userType} ${userId} registered and joined room`);

      // Notify the user they're connected
      socket.emit('registered', { userId, userType });
    });

    // Send private message
    socket.on('private_message', async ({ receiverId, receiverType, content }) => {
      try {
        // Save message to MongoDB
        const message = new Message({
          senderId: socket.userId,
          senderModel: socket.userType,
          receiverId: receiverId,
          receiverModel: receiverType,
          content: content,
          createdAt: new Date()
        });

        await message.save();

        // Emit to receiver's room (all their connected devices)
        io.to(receiverId).emit('receive_message', {
          messageId: message._id,
          senderId: socket.userId,
          senderModel: socket.userType,
          content: content,
          createdAt: message.createdAt,
          isRead: false
        });

        // Emit back to sender for confirmation
        socket.emit('message_sent', {
          messageId: message._id,
          receiverId: receiverId,
          content: content,
          createdAt: message.createdAt
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ receiverId }) => {
      io.to(receiverId).emit('user_typing', {
        userId: socket.userId,
        userType: socket.userType
      });
    });

    socket.on('stop_typing', ({ receiverId }) => {
      io.to(receiverId).emit('user_stop_typing', {
        userId: socket.userId
      });
    });

    // Mark messages as read
    socket.on('mark_read', async ({ senderId }) => {
      try {
        await Message.updateMany(
          { senderId: senderId, receiverId: socket.userId, isRead: false },
          { isRead: true }
        );

        // Notify sender that messages were read
        io.to(senderId).emit('messages_read', {
          readBy: socket.userId
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });
};
