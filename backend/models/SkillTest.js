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
  topic: { type: String, required: true, default: "Conceptual Quiz" },
  questions: [questionSchema],
  userAnswers: { type: [Number], default: [] },
  score: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  masteryLevel: { type: String, enum: ['Excellent', 'Good', 'Basic', 'Needs Improvement', 'None'], default: 'None' },
  difficulty: { type: String, default: 'Intermediate' },
  attempts: { type: Number, default: 1 },
  completedAt: { type: Date }
}, { timestamps: true });

export const SkillTest = mongoose.model('SkillTest', skillTestSchema);
