const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const messengerRoutes = require('./routes/messengerRoutes');
const patientCareRoutes = require('./routes/patientCare');
const reviewRoutes = require('./routes/reviews');
const messageHandler = require('./socket/messageHandler');
const paymentRoutes = require('./routes/payment');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('./models/Booking');

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

// ⚠️ CRITICAL: Webhook route MUST come BEFORE express.json()
app.post('/api/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('✅ Webhook received:', event.type);

    // ✅ PRIMARY: Handle Checkout Session completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      console.log('💳 Checkout session completed:', session.id);
      console.log('📦 BookingId from metadata:', bookingId);

      if (!bookingId) {
        console.log('⚠️ No bookingId in metadata — cannot update booking');
        return res.json({ received: true });
      }

      try {
        const booking = await Booking.findByIdAndUpdate(
          bookingId,
          {
            paid: true,
            paymentStatus: 'paid',
            status: 'Approved',
            paymentIntentId: session.id,
            transactionDate: new Date(),
            amount: session.amount_total / 100,
          },
          { new: true }
        );

        if (booking) {
          console.log('✅ Booking marked as paid:', booking._id);
        } else {
          console.log('⚠️ Booking not found for ID:', bookingId);
        }
      } catch (error) {
        console.error('❌ Error updating booking:', error);
      }
    }

    // ✅ Handle session expiry (user abandoned checkout)
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'failed',
          paid: false,
          status: 'cancelled',
        });
        console.log('⚠️ Session expired, booking cancelled:', bookingId);
      }
    }

    res.json({ received: true });
  }
);


// NOW add express.json() AFTER webhook
app.use(express.json());

// MongoDB connection
console.log("Mongo URI:", process.env.MONGO_URI);
mongoose.connect("mongodb://aravindhprabu2005:aravindhprabu2005@ac-qpplylh-shard-00-00.mhhwziy.mongodb.net:27017,ac-qpplylh-shard-00-01.mhhwziy.mongodb.net:27017,ac-qpplylh-shard-00-02.mhhwziy.mongodb.net:27017/?ssl=true&replicaSet=atlas-tppxn8-shard-0&authSource=admin&appName=Cluster0")
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Your existing routes
app.get('/test', (req, res) => {
  res.send("PsyCare! na iruken da dei!");
});
app.use('/', authRoutes);
app.use('/', protectedRoutes);
app.use('/', bookingRoutes);
app.use('/chat', chatbotRoutes);
app.use("/messenger", messengerRoutes);
app.use('/', patientCareRoutes);
app.use('/api/reviews', reviewRoutes);
app.use("/", paymentRoutes);

// Socket.IO
messageHandler(io);

// Webhook handler functions
async function handlePaymentSuccess(paymentIntent) {
  const { bookingId } = paymentIntent.metadata;

  console.log('✅ Payment succeeded for booking:', bookingId);

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      console.error('❌ Booking not found:', bookingId);
      return;
    }

    booking.paymentStatus = 'paid';
    booking.paid = true;
    booking.status = 'Approved';
    booking.transactionDate = new Date();
    booking.paymentIntentId = paymentIntent.id;
    booking.amount = paymentIntent.amount / 100;

    await booking.save();

    console.log('✅ Booking confirmed:', bookingId);

  } catch (error) {
    console.error('❌ Error updating booking after payment:', error);
  }
}

async function handlePaymentFailed(paymentIntent) {
  const { bookingId } = paymentIntent.metadata;

  console.log('❌ Payment failed for booking:', bookingId);

  try {
    const booking = await Booking.findById(bookingId);

    if (booking) {
      booking.paymentStatus = 'failed';
      booking.paid = false;
      booking.lastPaymentError = paymentIntent.last_payment_error?.message || 'Payment failed';
      await booking.save();
    }

  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

async function handlePaymentCanceled(paymentIntent) {
  const { bookingId } = paymentIntent.metadata;

  console.log('⚠️ Payment canceled for booking:', bookingId);

  try {
    const booking = await Booking.findById(bookingId);

    if (booking) {
      booking.paymentStatus = 'pending';
      booking.paid = false;
      booking.status = 'cancelled';
      await booking.save();
    }
  } catch (error) {
    console.error('Error handling canceled payment:', error);
  }
}

// Start server
server.listen(port, () => console.log(`Server running on port ${port}`));