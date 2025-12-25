const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const hpp = require('hpp');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors({ origin: true, credentials: true })); // Moved Top for Preflight

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow Cross-Origin Resources

app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Body Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


// Test Route
app.get('/', (req, res) => {
    res.send('RemitWallet Backend is running!');
});

app.get('/api', (req, res) => {
    res.send('RemitWallet Backend API is Running Successfully! 🚀');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes'); // Task Routes
const supportRoutes = require('./routes/supportRoutes'); // Support Routes
const withdrawalRoutes = require('./routes/withdrawalRoutes'); // Withdrawal Routes
const agentRoutes = require('./routes/agentRoutes'); // Agent Routes

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/user', userRoutes);
app.use('/api/task', taskRoutes);
app.use('/api/support', supportRoutes); // Support Routes
app.use('/api/withdrawal', withdrawalRoutes); // Withdrawal Routes
app.use('/api/agent', agentRoutes); // Agent Routes

// Sync Database and Start Server
sequelize.sync() // alter: true disabled to prevent DB lock/errors
    .then(() => {
        console.log('Database connected and synced!');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection failed:', err);
    });
