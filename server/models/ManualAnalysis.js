import mongoose from 'mongoose';

const manualAnalysisSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  inputData: { type: mongoose.Schema.Types.Mixed, required: true },
  analysisData: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

export const ManualAnalysis = mongoose.model('ManualAnalysis', manualAnalysisSchema);
