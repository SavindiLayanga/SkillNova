import mongoose from 'mongoose';

const employerIntroductionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  companyEmail: { type: String, required: true },
  jobMatchScore: { type: Number, required: true },
  subject: { type: String, default: '' },
  coverLetter: { type: String, default: '' },
  cvUrl: { type: String, default: '' },
  hasCvAttachment: { type: Boolean, default: false },
  hasCertificateAttachment: { type: Boolean, default: false },
  appliedVia: { type: String, enum: ['auto', 'manual'], default: 'manual' },
  status: { type: String, enum: ['Pending', 'Sent', 'Failed'], default: 'Pending' },
  sentAt: { type: Date }
}, { timestamps: true });

export const EmployerIntroduction = mongoose.model('EmployerIntroduction', employerIntroductionSchema, 'employer_introductions');
