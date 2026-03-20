const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { ensureRuntimeSchema } = require('./services/runtimeschemaservice');

const app = express();
const PORT = process.env.PORT || 5000;

// âœ… Middleware
app.use(cors());
app.use(express.json());

// âœ… Helper response
const response = (res, success, message, data = null) => {
  return res.status(success ? 200 : 400).json({
    success,
    message,
    data
  });
};

// âœ… Health Check
app.get('/api/health', (req, res) => {
  return response(res, true, 'EximHub API is running');
});

app.get('/', (req, res) => {
  res.send('EximHub API Root Working');
});

// âœ… Import Routes
const authRoutes = require('./routes/auth');
const discoveryRoutes = require('./routes/discovery');
const creditRoutes = require('./routes/credits');
const adminRoutes = require('./routes/admin');
const marketplaceRoutes = require('./routes/marketplace');
const marketIntelligenceRoutes = require('./routes/marketintelligence');
const siteRoutes = require('./routes/site');
const paymentRoutes = require('./routes/payments');

// âœ… Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/market-intelligence', marketIntelligenceRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/payments', paymentRoutes);

// âŒ 404 Handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// âŒ Global Error Handler
app.use((err, req, res, next) => {
  console.error('UNHANDLED_ERROR:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// âœ… Start Server AFTER schema ready
ensureRuntimeSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ðŸš€ EximHub Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('RUNTIME_SCHEMA_ERROR:', error);
    process.exit(1);
  });