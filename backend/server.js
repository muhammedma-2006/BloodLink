require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { ELIGIBILITY_RULES, ALL_BLOOD_GROUPS, BLOOD_COMPATIBILITY } = require('./config/eligibilityConfig');

const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const adminRoutes = require('./routes/adminRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'BloodLink Blood Donation Management System',
    timestamp: new Date(),
  });
});

// Configurable Rules Endpoint
app.get('/api/eligibility-rules', (req, res) => {
  res.json({
    success: true,
    rules: ELIGIBILITY_RULES,
    bloodGroups: ALL_BLOOD_GROUPS,
    compatibilityMatrix: BLOOD_COMPATIBILITY,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // If optional admin credentials are provided in environment, ensure initial admin exists
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    try {
      const User = require('./models/User');
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (!existingAdmin) {
        await User.create({
          name: process.env.ADMIN_NAME || 'BloodLink Administrator',
          email: process.env.ADMIN_EMAIL.toLowerCase(),
          password: process.env.ADMIN_PASSWORD,
          role: 'admin',
          isActive: true,
        });
        console.log(`[BloodLink Init] Initial administrator account initialized from environment (${process.env.ADMIN_EMAIL}).`);
      }
    } catch (adminErr) {
      console.warn('[BloodLink Init] Admin initialization warning:', adminErr.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`[BloodLink Server] Running on http://localhost:${PORT}`);
  });
};

startServer();
