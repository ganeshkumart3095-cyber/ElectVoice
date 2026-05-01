require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { apiRateLimiter } = require('./middleware/rateLimit');
const { sendSuccess, sendError } = require('./utils/response');

// Route imports
const chatRoutes = require('./routes/chat');
const newsRoutes = require('./routes/news');
const boothsRoutes = require('./routes/booths');
const timelineRoutes = require('./routes/timeline');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

// Global Rate Limiting
app.use('/api', apiRateLimiter);

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/booths', boothsRoutes);
app.use('/api/timeline', timelineRoutes);

// Health Check
app.get('/health', (req, res) => {
  sendSuccess(res, { status: 'online' }, 'Server is healthy');
});

// Serve static assets in production
app.use(express.static(path.join(__dirname, 'public')));

// Client-side routing fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 Handler
app.use((req, res) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An internal server error occurred' 
    : err.message;
    
  console.error('[Global Error]', err.stack);
  sendError(res, message, statusCode);
});

// Server Initialization
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`ElectVoice backend running on port ${PORT}`);
  });
}

module.exports = app;
