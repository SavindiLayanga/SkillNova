import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, default: '' }
});

const libraryTestSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  skill: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  difficulty: { type: String, default: 'Intermediate' },
  estimatedMinutes: { type: Number, default: 15 },
  questionCount: { type: Number, default: 10 },
  questions: [questionSchema],
  coveredTopics: { type: [String], default: [] },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
  score: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  completedAt: { type: Date },
  lastPlayed: { type: Date }
}, { timestamps: true });

export const LibraryTest = mongoose.model('LibraryTest', libraryTestSchema);
