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

// Helper to parse comma-separated origins from environment variables
const parseOrigins = (val) => {
  if (!val) return [];
  return val
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);
};

// Default allowed origins for local development
const defaultLocalOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

// Production origins configured via FRONTEND_URL or legacy CLIENT_URL
const configuredOrigins = [
  ...parseOrigins(process.env.FRONTEND_URL),
  ...parseOrigins(process.env.CLIENT_URL),
];

const allowedOrigins = [...new Set([...defaultLocalOrigins, ...configuredOrigins])];

// CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, '');

      // Allow wildcard, explicit match, local development, or any deployed .vercel.app origin
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(normalizedOrigin) ||
        (!process.env.VERCEL && process.env.NODE_ENV !== 'production') ||
        normalizedOrigin.endsWith('.vercel.app') ||
        normalizedOrigin.includes('vercel.app')
      ) {
        return callback(null, true);
      }

      console.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
      return callback(new Error(`CORS policy does not allow access from origin ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to ensure initial administrator exists if credentials provided in environment
let adminInitAttempted = false;
const ensureInitialAdmin = async () => {
  if (adminInitAttempted) return;
  adminInitAttempted = true;

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
};

// Database Connection Middleware for Serverless & Local Requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await ensureInitialAdmin();
    next();
  } catch (err) {
    console.error('[BloodLink DB] Database connection failure:', err.message);
    return res.status(503).json({
      success: false,
      message: 'Database connection failed. Please verify MONGODB_URI configuration.',
    });
  }
});

// Root & Health Check Endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'BloodLink Blood Donation Management System API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'BloodLink Blood Donation Management System',
    timestamp: new Date(),
  });
});

// Alias for /health
app.get('/health', (req, res) => {
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

// Alias for /eligibility-rules
app.get('/eligibility-rules', (req, res) => {
  res.json({
    success: true,
    rules: ELIGIBILITY_RULES,
    bloodGroups: ALL_BLOOD_GROUPS,
    compatibilityMatrix: BLOOD_COMPATIBILITY,
  });
});

// API Routes (mounted on both /api/* and root /* for seamless proxy & serverless routing)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/donor', donorRoutes);
app.use('/donor', donorRoutes);

app.use('/api/hospital', hospitalRoutes);
app.use('/hospital', hospitalRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/inventory', inventoryRoutes);
app.use('/inventory', inventoryRoutes);

app.use('/api/notifications', notificationRoutes);
app.use('/notifications', notificationRoutes);


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

// Start listening only in local development when executed directly (Vercel manages execution in serverless production)
if (!process.env.VERCEL && require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[BloodLink Server] Running on http://localhost:${PORT}`);
  });
}

module.exports = app;


