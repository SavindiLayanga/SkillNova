import React, { useState } from "react";
import { CheckCircle2, X, Plus, Trash2, Edit2, AlertCircle, Save, RotateCcw } from "lucide-react";
import Button from "./ui/Button";
import Card from "./ui/Card";
import clsx from "../utils/clsx";

const safeString = (val) => {
  if (val === null || val === undefined) return "";
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
};

const Field = ({ label, value, onChange, placeholder = "Not Detected", isTextarea = false, required = false }) => {
  const safeVal = safeString(value);
  const isMissing = !safeVal || safeVal.trim() === "";
  
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-ink-700 flex justify-between">
        <span>{label} {required && <span className="text-rose-500">*</span>}</span>
        {isMissing && <span className="text-xs font-medium text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Please Enter</span>}
      </label>
      {isTextarea ? (
        <textarea
          value={safeVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={clsx(
            "w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:border-transparent transition-all resize-none",
            isMissing ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30 placeholder-rose-400" : "border-ink-200 focus:ring-primary-200 focus:border-primary-500"
          )}
        />
      ) : (
        <input
          type="text"
          value={safeVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={clsx(
            "w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:border-transparent transition-all",
            isMissing ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30 placeholder-rose-400" : "border-ink-200 focus:ring-primary-200 focus:border-primary-500"
          )}
        />
      )}
    </div>
  );
};

const TagInput = ({ label, tags = [], onChange, placeholder = "Type and press enter..." }) => {
  const [inputValue, setInputValue] = useState("");
  const safeTags = Array.isArray(tags) ? tags : [];

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !safeTags.includes(newTag)) {
        onChange([...safeTags, newTag]);
      }
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(safeTags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-semibold text-ink-700">{label}</label>
      <div className="min-h-[42px] w-full px-2 py-1.5 border border-ink-200 focus-within:ring-2 focus-within:ring-primary-200 focus-within:border-primary-500 rounded-lg bg-white flex flex-wrap gap-2 items-center transition-all">
        {safeTags.map((tag, index) => {
          const safeTagStr = typeof tag === "object" ? JSON.stringify(tag) : String(tag);
          return (
            <span key={index} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
              {safeTagStr}
              <button type="button" onClick={() => removeTag(index)} className="hover:text-primary-900 focus:outline-none">
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={safeTags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] text-sm bg-transparent outline-none py-0.5 px-1"
        />
      </div>
    </div>
  );
};

export default function CVVerificationForm({ initialData, onSave, onCancel }) {
  // Initialize state safely mapping from actual CV analysis data structure
  const [formData, setFormData] = useState({
    personalInformation: {
      fullName: initialData?.name || initialData?.personalInformation?.fullName || "", 
      email: initialData?.email || initialData?.personalInformation?.email || "", 
      phone: initialData?.personalInformation?.phone || "", 
      address: initialData?.personalInformation?.address || "", 
      linkedin: initialData?.personalInformation?.linkedin || "", 
      github: initialData?.personalInformation?.github || "", 
      portfolio: initialData?.personalInformation?.portfolio || ""
    },
    targetRole: initialData?.targetRole || "",
    professionalSummary: initialData?.professionalSummary || "",
    education: Array.isArray(initialData?.extracted?.education) ? initialData.extracted.education : (Array.isArray(initialData?.education) ? initialData.education : []),
    experience: Array.isArray(initialData?.extracted?.experience) ? initialData.extracted.experience : (Array.isArray(initialData?.experience) ? initialData.experience : []),
    projects: Array.isArray(initialData?.extracted?.projects) ? initialData.extracted.projects : (Array.isArray(initialData?.projects) ? initialData.projects : []),
    technicalSkills: Array.isArray(initialData?.technicalSkills) ? initialData.technicalSkills : [],
    softSkills: Array.isArray(initialData?.softSkills) ? initialData.softSkills : [],
    programmingLanguages: Array.isArray(initialData?.programmingLanguages) ? initialData.programmingLanguages : [],
    frameworks: Array.isArray(initialData?.frameworks) ? initialData.frameworks : [],
    databases: Array.isArray(initialData?.databases) ? initialData.databases : [],
    tools: Array.isArray(initialData?.tools) ? initialData.tools : [],
    cloudTechnologies: Array.isArray(initialData?.cloudTechnologies) ? initialData.cloudTechnologies : [],
    certifications: Array.isArray(initialData?.extracted?.certifications) ? initialData.extracted.certifications : (Array.isArray(initialData?.certifications) ? initialData.certifications : []),
    languages: Array.isArray(initialData?.languages) ? initialData.languages : [],
    achievements: Array.isArray(initialData?.achievements) ? initialData.achievements : []
  });

  const updatePersonalInfo = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      personalInformation: { ...prev.personalInformation, [field]: value }
    }));
  };

  const updateArrayField = (arrayName, index, field, value) => {
    setFormData((prev) => {
      const newArray = Array.isArray(prev[arrayName]) ? [...prev[arrayName]] : [];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData((prev) => {
      const arr = Array.isArray(prev[arrayName]) ? prev[arrayName] : [];
      return {
        ...prev,
        [arrayName]: arr.filter((_, i) => i !== index)
      };
    });
  };

  const addArrayItem = (arrayName, emptyTemplate) => {
    setFormData((prev) => {
      const arr = Array.isArray(prev[arrayName]) ? prev[arrayName] : [];
      return {
        ...prev,
        [arrayName]: [...arr, emptyTemplate]
      };
    });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ink-900 flex items-center gap-2">
          <Edit2 className="w-6 h-6 text-primary-500" /> Verify Your Information
        </h2>
        <p className="text-ink-500 mt-1 text-sm">
          We extracted the following details from your CV. Please verify and correct any missing or inaccurate information.
        </p>
      </div>

      <Card className="p-6 border border-ink-100 shadow-sm bg-white/60 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-ink-900 border-b border-ink-100 pb-3 mb-5">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Full Name" value={formData.personalInformation.fullName} onChange={(val) => updatePersonalInfo("fullName", val)} required />
          <Field label="Target Role" value={formData.targetRole} onChange={(val) => setFormData(prev => ({...prev, targetRole: val}))} required />
          <Field label="Email" value={formData.personalInformation.email} onChange={(val) => updatePersonalInfo("email", val)} />
          <Field label="Phone" value={formData.personalInformation.phone} onChange={(val) => updatePersonalInfo("phone", val)} />
          <Field label="Address" value={formData.personalInformation.address} onChange={(val) => updatePersonalInfo("address", val)} />
          <Field label="LinkedIn URL" value={formData.personalInformation.linkedin} onChange={(val) => updatePersonalInfo("linkedin", val)} />
          <Field label="GitHub URL" value={formData.personalInformation.github} onChange={(val) => updatePersonalInfo("github", val)} />
          <Field label="Portfolio URL" value={formData.personalInformation.portfolio} onChange={(val) => updatePersonalInfo("portfolio", val)} />
        </div>
        <div className="mt-5">
          <Field label="Professional Summary" isTextarea value={formData.professionalSummary} onChange={(val) => setFormData(prev => ({...prev, professionalSummary: val}))} />
        </div>
      </Card>

      <Card className="p-6 border border-ink-100 shadow-sm bg-white/60 backdrop-blur-sm">
        <div className="flex justify-between items-center border-b border-ink-100 pb-3 mb-5">
          <h3 className="text-lg font-bold text-ink-900">Experience</h3>
          <button onClick={() => addArrayItem("experience", { jobTitle: "", company: "", employmentType: "", startDate: "", endDate: "", currentlyWorking: false, description: "" })} className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Experience
          </button>
        </div>
        <div className="space-y-6">
          {(!Array.isArray(formData.experience) || formData.experience.length === 0) && <p className="text-sm text-ink-500 italic">No experience added.</p>}
          {Array.isArray(formData.experience) && formData.experience.map((exp, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-ink-100 bg-ink-50/30 relative group">
              <button onClick={() => removeArrayItem("experience", idx)} className="absolute top-4 right-4 text-ink-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
                <Field label="Job Title" value={exp?.jobTitle} onChange={(val) => updateArrayField("experience", idx, "jobTitle", val)} />
                <Field label="Company" value={exp?.company} onChange={(val) => updateArrayField("experience", idx, "company", val)} />
                <Field label="Start Date" value={exp?.startDate} onChange={(val) => updateArrayField("experience", idx, "startDate", val)} />
                <Field label="End Date" value={exp?.endDate} onChange={(val) => updateArrayField("experience", idx, "endDate", val)} />
              </div>
              <div className="mt-4">
                <Field label="Description" isTextarea value={exp?.description} onChange={(val) => updateArrayField("experience", idx, "description", val)} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 border border-ink-100 shadow-sm bg-white/60 backdrop-blur-sm">
        <div className="flex justify-between items-center border-b border-ink-100 pb-3 mb-5">
          <h3 className="text-lg font-bold text-ink-900">Education</h3>
          <button onClick={() => addArrayItem("education", { degree: "", fieldOfStudy: "", institution: "", startYear: "", endYear: "", gpa: "" })} className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Education
          </button>
        </div>
        <div className="space-y-6">
          {(!Array.isArray(formData.education) || formData.education.length === 0) && <p className="text-sm text-ink-500 italic">No education added.</p>}
          {Array.isArray(formData.education) && formData.education.map((edu, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-ink-100 bg-ink-50/30 relative group">
              <button onClick={() => removeArrayItem("education", idx)} className="absolute top-4 right-4 text-ink-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-6">
                <Field label="Degree / Qualification" value={edu?.degree} onChange={(val) => updateArrayField("education", idx, "degree", val)} />
                <Field label="Institution" value={edu?.institution} onChange={(val) => updateArrayField("education", idx, "institution", val)} />
                <Field label="Field of Study" value={edu?.fieldOfStudy} onChange={(val) => updateArrayField("education", idx, "fieldOfStudy", val)} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Start Year" value={edu?.startYear} onChange={(val) => updateArrayField("education", idx, "startYear", val)} />
                  <Field label="End Year" value={edu?.endYear} onChange={(val) => updateArrayField("education", idx, "endYear", val)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 border border-ink-100 shadow-sm bg-white/60 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-ink-900 border-b border-ink-100 pb-3 mb-5">Skills & Expertise</h3>
        <div className="space-y-5">
          <TagInput label="Technical Skills" tags={formData.technicalSkills} onChange={(tags) => setFormData(prev => ({...prev, technicalSkills: tags}))} />
          <TagInput label="Soft Skills" tags={formData.softSkills} onChange={(tags) => setFormData(prev => ({...prev, softSkills: tags}))} />
          <TagInput label="Programming Languages" tags={formData.programmingLanguages} onChange={(tags) => setFormData(prev => ({...prev, programmingLanguages: tags}))} />
          <TagInput label="Frameworks & Libraries" tags={formData.frameworks} onChange={(tags) => setFormData(prev => ({...prev, frameworks: tags}))} />
          <TagInput label="Tools & Technologies" tags={formData.tools} onChange={(tags) => setFormData(prev => ({...prev, tools: tags}))} />
          <TagInput label="Databases" tags={formData.databases} onChange={(tags) => setFormData(prev => ({...prev, databases: tags}))} />
          <TagInput label="Languages" tags={formData.languages} onChange={(tags) => setFormData(prev => ({...prev, languages: tags}))} />
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-12">
        <Button 
          className="w-full sm:flex-1 justify-center bg-primary-600 hover:bg-primary-700 text-white shadow-md border-transparent text-base py-3" 
          icon={Save}
          onClick={() => onSave(formData)}
        >
          Confirm & Save Profile
        </Button>
        <Button 
          variant="secondary"
          className="w-full sm:w-auto justify-center bg-white border-ink-200 text-ink-700 hover:bg-ink-50 py-3" 
          icon={RotateCcw}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

