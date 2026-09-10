import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { UserNotification } from './models/UserNotification.js';
import { User } from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");
  const users = await User.find({ role: 'user' });
  console.log("Total users:", users.length);
  const notifs = await UserNotification.find();
  console.log("Total notifications:", notifs.length);
  if (notifs.length > 0) {
    console.log("Sample:", notifs[0]);
  }
  process.exit(0);
}
check();
