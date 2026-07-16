import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    contactEmail: { type: String },
    companyLogo: { type: String },
    description: { type: String },
    location: { type: String },
    category: { type: String }, // Used for Industry
    jobType: { type: String }, // Used for Employment Type
    experienceRequired: { type: String },
    salaryRange: { type: String },
    numberOfOpenings: { type: Number },
    applicationDeadline: { type: Date },
    skills: { type: [String], default: [] },
    source: { type: String, required: true, default: "SkillNova Verified Vacancy" },
    sourceUrl: { type: String },
    externalId: { type: String },
    externalSource: { type: String },
    publishedAt: { type: Date },
    importedAt: { type: Date },
    status: { 
      type: String, 
      enum: ["active", "inactive", "archived", "deleted", "Pending Approval", "Active", "Closed", "Expired"], 
      default: "Pending Approval" 
    },
  },
  { timestamps: true }
);

jobSchema.index({ source: 1, externalId: 1 }, { unique: true, partialFilterExpression: { externalId: { $exists: true, $ne: null } } });
jobSchema.index({ sourceUrl: 1 }, { unique: true, partialFilterExpression: { sourceUrl: { $exists: true, $ne: null } } });

export default mongoose.model("Job", jobSchema);
