import mongoose from 'mongoose';

const jobReadinessSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  targetRole: { type: String },
  score: { type: Number, default: 0 },
  requiredSkillsCompletedPercentage: { type: Number, default: 0 },
  assessmentAverage: { type: Number, default: 0 },
  isJobReady: { type: Boolean, default: false },
  certificateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
  lastEvaluatedAt: { type: Date }
}, { timestamps: true });

export const JobReadiness = mongoose.model('JobReadiness', jobReadinessSchema, 'job_readiness');
