const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const bookingRoutes = require('./routes/bookingRoutes')
const chatbotRoutes = require('./routes/chatbotRoutes')
const messengerRoutes = require('./routes/messengerRoutes')
const messageHandler = require('./socket/messageHandler');

const app = express();
const port = 8000;

const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.get('/test', (req, res) => {
  res.send("na iruken da!");
});
app.use('/', authRoutes);
app.use('/', protectedRoutes);
app.use('/', bookingRoutes);
app.use('/chat', chatbotRoutes );
app.use("/messenger", messengerRoutes)

messageHandler(io);

// server.listen(port, () => console.log(`Server running on port ${port}`));
module.exports.handler = serverless(app, {
  binary: [
    'multipart/form-data',
    'image/jpeg',
    'image/png',
    'application/octet-stream'
  ]
});