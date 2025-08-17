const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const connectDB = require('./db/db');
connectDB();

//added for socket.io

const messageRoutes = require('./routes/message.routes');

// ===== CORE MIDDLEWARE =====
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://date-set.vercel.app'
  ],
  credentials: true,
}));


// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES =====
const userRoutes = require('./routes/user.routes');

//socket app.use('/api/user', userRoutes);
app.use('/api/messages', messageRoutes);

const paymentRoutes = require('./routes/payment.routes');


app.get('/', (req, res) => {
  res.send('Chat Server is Running');
});

// Authentication routes (must come first)
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);



// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Export just the Express app
module.exports = app;
