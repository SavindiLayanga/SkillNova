import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: String,
  level: String,
});

const jobMatchSchema = new mongoose.Schema({
  role: String,
  company: String,
  type: String,
  location: String,
  salary: String,
  skills: [String],
  match: Number,
  source: String,
  url: String
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
  technicalSkills: [skillSchema],
  softSkills: [skillSchema],
  careerRecommendations: [String],
  missingSkills: [String],
  jobMatches: [jobMatchSchema],
  skillMatchScore: { type: Number, default: 0 },
  cvScore: { type: Number, default: 0 },
  learningPath: [String],
  aiInsights: { type: String, default: '' }
}, { timestamps: true });

export const ManualAnalysis = mongoose.model('ManualAnalysis', manualAnalysisSchema);
