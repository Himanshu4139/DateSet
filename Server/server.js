const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const port = process.env.PORT || 3000;


// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173',
    "https://date-set.vercel.app"],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on('private message', (msg, callback) => {
  const { to, content, sender, createdAt, file } = msg;
  const conversationId = [sender, to].sort().join('-');

  if (!global.messages) global.messages = {};
  if (!global.messages[conversationId]) global.messages[conversationId] = [];
  const savedMsg = { sender, content, createdAt: createdAt || new Date(), read: false, ...(file && { file }) };
  global.messages[conversationId].push(savedMsg);

  const recipientSocketId = onlineUsers.get(to);
  if (recipientSocketId) io.to(recipientSocketId).emit('private message', savedMsg);

  if (callback) callback({ status: 'delivered' });
});


  socket.on('disconnect', () => {
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Socket.io available on ws://localhost:${port}`);
});
