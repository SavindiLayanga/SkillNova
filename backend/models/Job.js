import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    category: { type: String },
    jobType: { type: String },
    skills: { type: [String], default: [] },
    source: { type: String, required: true, default: "SkillNova Admin" },
    sourceUrl: { type: String },
    externalId: { type: String },
    publishedAt: { type: Date },
    importedAt: { type: Date },
    status: { 
      type: String, 
      enum: ["active", "inactive", "archived"], 
      default: "active" 
    },
  },
  { timestamps: true }
);

jobSchema.index({ source: 1, externalId: 1 }, { unique: true, partialFilterExpression: { externalId: { $exists: true, $ne: null } } });
jobSchema.index({ sourceUrl: 1 }, { unique: true, partialFilterExpression: { sourceUrl: { $exists: true, $ne: null } } });

export default mongoose.model("Job", jobSchema);
