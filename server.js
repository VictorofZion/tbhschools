const express = require('express');
const cors = require('cors'); // 1. Import cors

// 2. Enable CORS for your specific frontend domain
app.use(cors({
  origin: 'https://tbhschools.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
// ... rest of your routes
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const academicRoutes = require('./routes/academicRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const examRoutes = require('./routes/examRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const materialRoutes = require('./routes/materialRoutes');

const app = express();

// 1. Enable Trust Proxy for Render / Reverse Proxies (Required for express-rate-limit)
app.set('trust proxy', 1);

// 2. Security Headers via Helmet
app.use(helmet());

// 3. Define Allowed Origins (Hardcoded fallbacks + trimmed ENV variables)
const defaultOrigins = [
  'https://tbhschools.netlify.app',
  'http://localhost:5000',
  'http://localhost:3000',
  'http://127.0.0.1:5500'
];

const envOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim().replace(/\/$/, ''))
  : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

// 4. Safe CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser calls (like Postman or server-to-server) or local development
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // Normalize incoming request origin by removing any trailing slash
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      // Pass 'false' instead of an Error to return clean 403 response without breaking preflight headers
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// 5. Express JSON Parser
app.use(express.json({ limit: '10mb' }));

// 6. Rate Limiter for Authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 attempts
  message: { error: "Too many login attempts from this IP. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);

// 7. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/materials', materialRoutes);

// Base Route
app.get('/', (req, res) => {
  res.status(200).send('TBHS Secure API Gateway is active.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TBHS Server running on port ${PORT}`);
});