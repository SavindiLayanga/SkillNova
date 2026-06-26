import mongoose from 'mongoose';

const practiceSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  selectedTest: { type: Object, default: null }, // stores { title, isPath, pathSkill, pathType, testId, level }
  currentQuestionIndex: { type: Number, default: 0 },
  userAnswers: { type: Object, default: {} }, // map of question index to chosen option
  timeLeft: { type: Number, default: 300 },
  isFinished: { type: Boolean, default: false }
}, { timestamps: true });

export const PracticeSession = mongoose.model('PracticeSession', practiceSessionSchema);
