import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: String,
  level: String,
});

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  fieldOfStudy: String,
  startYear: String,
  endYear: String,
});

const experienceSchema = new mongoose.Schema({
  company: String,
  jobTitle: String,
  startDate: String,
  endDate: String,
  description: String,
});

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  technologies: [String],
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

const roleConfidenceSchema = new mongoose.Schema({
  role: String,
  confidence: Number,
  reason: String,
});

const cvAnalysisSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  originalText: { type: String, required: true },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  fileName: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isITRelated: { type: Boolean, default: true },
  technicalSkills: [String],
  softSkills: [String],
  skills: [String],
  strongSkills: [String],
  weakSkills: [String],
  education: [educationSchema],
  experience: [experienceSchema],
  projects: [projectSchema],
  certifications: [String],
  targetRole: { type: String, default: '' },
  primaryRole: roleConfidenceSchema,
  topRoles: [roleConfidenceSchema],
  professionalSummary: { type: String, default: '' },
  personalInformation: {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    address: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  careerRecommendations: [String],
  missingSkills: [String],
  jobMatches: [jobMatchSchema],
  skillMatchScore: { type: Number, default: 0 },
  cvScore: { type: Number, default: 0 },
  matchPercentage: { type: Number, default: 0 },
  careerReadinessScore: { type: Number, default: 0 },
  learningPath: [String],
  aiInsights: { type: String, default: '' }
}, { timestamps: true });

export const CVAnalysis = mongoose.model('CVAnalysis', cvAnalysisSchema, 'cv_analyses');
