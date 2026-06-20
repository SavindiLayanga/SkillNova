import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: String, required: true },
  description: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }
});

const learningPathSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  targetRole: { type: String, required: true },
  missingSkills: { type: [String], required: true },
  modules: [moduleSchema],
}, { timestamps: true });

export const LearningPath = mongoose.model('LearningPath', learningPathSchema);
