require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/db');
const socketHandler = require('./src/sockets/socketHandler');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'TradeHub PK API is running' });
});

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/bids', require('./src/routes/bidRoutes'));
app.use('/api/ledger', require('./src/routes/ledgerRoutes'));
app.use('/api/escrow', require('./src/routes/escrowRoutes'));
app.use('/api/chat', require('./src/routes/chatRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/pools', require('./src/routes/poolRoutes'));
app.use('/api/inventory', require('./src/routes/inventoryRoutes'));
app.use('/api/insights', require('./src/routes/insightRoutes'));

// Socket.io
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});