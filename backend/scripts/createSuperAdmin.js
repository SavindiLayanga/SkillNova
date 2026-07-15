import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import readline from 'readline';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Must import User model AFTER dotenv config if it relies on env vars, 
// but we just set up env first.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { User } from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createSuperAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    console.log('\n--- Create Super Administrator ---\n');

    const fullName = await question('Full Name: ');
    const username = await question('Username: ');
    
    // Check for existing user
    const existing = await User.findOne({ username });
    if (existing) {
      console.log(`\nError: Username '${username}' already exists.`);
      process.exit(1);
    }

    let password = '';
    while (true) {
      password = await question('Password (min 8 chars, uppercase, lowercase, number): ');
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (passwordRegex.test(password)) {
        break;
      }
      console.log('Password does not meet complexity requirements. Try again.');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const superAdmin = new User({
      uid: uuidv4(), // Placeholder for admin since Firebase is not used
      name: fullName,
      email: `${username}@skillnova.admin.local`, // Dummy email
      username,
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
    });

    await superAdmin.save();
    
    console.log(`\nSuccess! Super Administrator '${username}' created successfully.`);
    console.log('You can now log in at /admin/login');

  } catch (error) {
    console.error('Error creating super admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    rl.close();
  }
}

createSuperAdmin();
