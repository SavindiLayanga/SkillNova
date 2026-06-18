import mongoose from 'mongoose';

const skillTestSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  skillName: { type: String, required: true },
  questions: { type: Array, required: true },
  answers: { type: Array, default: [] },
  score: { type: Number, default: 0 },
}, { timestamps: true });

export const SkillTest = mongoose.model('SkillTest', skillTestSchema);
