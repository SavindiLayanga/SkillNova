import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: String,
  level: String,
});

const manualAnalysisSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, default: '' },
  skills: [String],
  targetRole: { type: String, default: '' },
  experience: { type: String, default: '' },
  education: { type: String, default: '' },
  
  // Analysis Output
  extractedSkills: [skillSchema],
  careerRecommendations: [String],
  missingSkills: [String],
  jobMatches: [String],
  skillMatchScore: { type: Number, default: 0 },
  cvScore: { type: Number, default: 0 },
  learningPath: [String],
  aiInsights: { type: String, default: '' }
}, { timestamps: true });

export const ManualAnalysis = mongoose.model('ManualAnalysis', manualAnalysisSchema);
