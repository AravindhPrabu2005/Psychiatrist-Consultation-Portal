const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const bookingRoutes = require('./routes/bookingRoutes')

const app = express();
// const port = 8000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch((err) => console.log(err));

app.get('/', (req, res) => {
  res.send("iruken da!");
});
app.use('/', authRoutes);
app.use('/', protectedRoutes);
app.use('/', bookingRoutes);

// app.listen(port, () => console.log(`Server running on port ${port}`));
module.exports.handler = serverless(app);