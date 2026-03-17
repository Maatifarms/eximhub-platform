const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper for generic responses
const response = (res, success, message, data = null) => {
    res.status(success ? 200 : 400).json({ success, message, data });
};

// Test Route
app.get('/api/health', (req, res) => {
    response(res, true, "EximHub API is running");
});

// Import Routes
const authRoutes = require('./routes/auth');
const discoveryRoutes = require('./routes/discovery');
const creditRoutes = require('./routes/credits');
const adminRoutes = require('./routes/admin');
const marketplaceRoutes = require('./routes/marketplace');

app.use('/api/auth', authRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/marketplace', marketplaceRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('UNHANDLED_ERROR:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`EximHub Server running on port ${PORT}`);
});
