const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ladiesRoutes = require('./routes/ladies');
const workRoutes = require('./routes/work');
const paymentRoutes = require('./routes/payments');
const reportRoutes = require('./routes/reports');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(morgan('dev'));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/ladies', ladiesRoutes);
app.use('/api/work', workRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'JSON File (Demo Mode)', timestamp: new Date() }));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Ladies Work System - DEMO MODE');
  console.log('==================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log('📁 Using JSON file database (no MongoDB needed!)');
  console.log(`🌐 API: http://localhost:${PORT}/api/health`);
  console.log('');
  console.log('👤 Register at: http://localhost:5173/register');
  console.log('');

  // Auto-seed database if empty
  try {
    require('./utils/seed');
  } catch (err) {
    console.error('Error auto-seeding database:', err);
  }
});
