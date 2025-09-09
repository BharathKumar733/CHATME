const Message = require("./models/Message");

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join user's personal room
    socket.on('joinUser', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        const { sender, receiver, content, isFile, fileName, fileUrl } = data;
        
        // Save message to database
        const message = new Message({ 
          sender, 
          receiver, 
          content, 
          isFile, 
          fileName, 
          fileUrl,
          status: 'delivered'
        });
        await message.save();
        
        // Emit to sender (for confirmation)
        io.to(sender).emit('newMessage', message);
        
        // Emit to receiver
        io.to(receiver).emit('newMessage', message);

      } catch (err) {
        console.error('Error sending message:', err);
        socket.emit('messageError', { error: 'Failed to send message' });
      }
    });

    // Handle message read status
    socket.on('markAsRead', async (data) => {
      try {
        const { messageIds, senderId } = data;
        
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { $set: { status: 'read' } }
        );
        
        // Notify sender that messages were read
        io.to(senderId).emit('messagesRead', { messageIds });

      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { receiver, isTyping } = data;
      io.to(receiver).emit('typing', { 
        sender: socket.userId, 
        isTyping 
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};