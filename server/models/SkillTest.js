import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, default: '' }
});

const skillTestSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  skillName: { type: String, required: true },
  questions: [questionSchema],
  userAnswers: { type: [Number], default: [] },
  score: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

export const SkillTest = mongoose.model('SkillTest', skillTestSchema);
