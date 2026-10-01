require('dotenv').config();
const readline = require('readline');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
};

const setupAdmin = async () => {
  console.log('--- BloodLink Administrator Initial Setup ---');
  await connectDB();

  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log(`[Setup Notice] An administrator account already exists (${existingAdmin.email}).`);
      console.log('No additional admin account needed.');
      await disconnectDB();
      process.exit(0);
    }

    // Read from CLI arguments, environment variables, or prompt interactively
    const args = process.argv.slice(2);
    let email = args[0] || process.env.ADMIN_EMAIL;
    let password = args[1] || process.env.ADMIN_PASSWORD;
    let name = args[2] || process.env.ADMIN_NAME || 'BloodLink Administrator';

    if (!email) {
      email = await askQuestion('Enter Administrator Email: ');
    }
    if (!password) {
      password = await askQuestion('Enter Administrator Password (min 6 chars): ');
    }
    if (!name) {
      name = await askQuestion('Enter Administrator Full Name (default: BloodLink Administrator): ') || 'BloodLink Administrator';
    }

    if (!email || !password || password.length < 6) {
      console.error('[Error] Valid email and password (minimum 6 characters) are required.');
      await disconnectDB();
      process.exit(1);
    }

    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin',
      isActive: true,
    });

    console.log(`[Success] Administrator account created successfully: ${admin.email}`);
  } catch (err) {
    console.error('[Setup Error]', err.message);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

setupAdmin();
