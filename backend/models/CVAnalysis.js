import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: String,
  level: String,
});

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  year: String,
});

const experienceSchema = new mongoose.Schema({
  company: String,
  role: String,
  duration: String,
  description: String,
});

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  technologies: [String],
});

const cvAnalysisSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  originalText: { type: String, required: true },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  skills: [skillSchema],
  education: [educationSchema],
  experience: [experienceSchema],
  projects: [projectSchema],
  certifications: [String],
  targetRole: { type: String, default: '' },
  careerRecommendations: [String],
  missingSkills: [String],
  jobMatches: [String],
  skillMatchScore: { type: Number, default: 0 },
  cvScore: { type: Number, default: 0 },
  learningPath: [String],
  aiInsights: { type: String, default: '' }
}, { timestamps: true });

export const CVAnalysis = mongoose.model('CVAnalysis', cvAnalysisSchema);
