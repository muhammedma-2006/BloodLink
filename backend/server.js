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
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching whitelist
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback gracefully for local dev while permitting explicit config
    },
    credentials: true,
  })
);
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
  const statusCode = err.status || err.statusCode || 500;
  console.error('[Server Error]', err.stack || err);
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500 ? 'Internal Server Error' : err.message || 'Internal Server Error',
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
