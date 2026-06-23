import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  careerGoal: { type: String, default: '' },
  currentJobTitle: { type: String, default: '' },
  targetRole: { type: String, default: '' },
  location: { type: String, default: '' },
  experience: { type: String, default: '' },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
