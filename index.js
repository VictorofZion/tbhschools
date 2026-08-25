const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('../routes/authRoutes');
const adminRoutes = require('../routes/adminRoutes');
const academicRoutes = require('../routes/academicRoutes');
const paymentRoutes = require('../routes/paymentRoutes');
const examRoutes = require('../routes/examRoutes');
const assignmentRoutes = require('../routes/assignmentRoutes');
const materialRoutes = require('../routes/materialRoutes');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/materials', materialRoutes);

app.get('/api', (req, res) => {
  res.status(200).send('TBHS Secure API Gateway is active on Vercel.');
});

module.exports = app;