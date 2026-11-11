import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  targetRole: { type: String, required: true },
  skillsCompleted: { type: [String], default: [] },
  jobReadinessScore: { type: Number, required: true },
  certificateId: { type: String, required: true, unique: true },
  issueDate: { type: Date, default: Date.now },
  pdfUrl: { type: String }
}, { timestamps: true });

export const Certificate = mongoose.model('Certificate', certificateSchema, 'certificates');
