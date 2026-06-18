import mongoose from 'mongoose';

const cvAnalysisSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  originalText: { type: String, required: true },
  analysisData: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

export const CVAnalysis = mongoose.model('CVAnalysis', cvAnalysisSchema);
