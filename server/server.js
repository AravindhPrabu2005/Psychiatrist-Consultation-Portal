const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const bookingRoutes = require('./routes/bookingRoutes')
const chatbotRoutes = require('./routes/chatbotRoutes')

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

app.get('/testing', (req, res) => {
  res.send(process.env.GEMINI_API_KEY);
});
app.use('/', authRoutes);
app.use('/', protectedRoutes);
app.use('/', bookingRoutes);
app.use('/chat', chatbotRoutes );

// app.listen(port, () => console.log(`Server running on port ${port}`));
module.exports.handler = serverless(app, {
  binary: [
    'multipart/form-data',
    'image/jpeg',
    'image/png',
    'application/octet-stream'
  ]
});