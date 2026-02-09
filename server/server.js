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
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('📨 Webhook received:', event.type);

try {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
      
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
      
    case 'payment_intent.canceled':
      await handlePaymentCanceled(event.data.object);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
} catch (error) {
  console.error('Error processing webhook:', error);
  res.status(500).json({ error: 'Webhook processing failed' });
}
});

// NOW add express.json() AFTER webhook
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
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
// Webhook handler functions (UPDATE THESE)
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

// ADD THIS NEW HANDLER for Checkout Sessions
async function handleCheckoutSessionCompleted(session) {
  const bookingId = session.client_reference_id;

  console.log('✅ Checkout session completed for booking:', bookingId);

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
    booking.paymentIntentId = session.payment_intent;
    booking.amount = session.amount_total / 100;

    await booking.save();

    console.log('✅ Booking confirmed via Checkout:', bookingId);

  } catch (error) {
    console.error('❌ Error updating booking after checkout:', error);
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