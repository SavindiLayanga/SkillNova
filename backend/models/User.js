import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: { 
    type: String, 
    unique: true, 
    required: function() {
      // Required for regular users, admins might have auto-generated UUIDs
      return this.role === 'user';
    }
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['user', 'super_admin'], default: 'user' },
  
  // Admin specific fields
  username: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  password: { 
    type: String, 
    select: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },

  // Student specific fields
  careerGoal: { type: String, default: '' },
  currentJobTitle: { type: String, default: '' },
  targetRole: { type: String, default: '' },
  location: { type: String, default: '' },
  experience: { type: String, default: '' },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
