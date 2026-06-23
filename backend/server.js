import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./db.js";
// import { initializeFirebaseAdmin } from "./firebase.js";
import { verifyAuth } from "./middleware/auth.js";

import { User } from "./models/User.js";
import { CVAnalysis } from "./models/CVAnalysis.js";
import { ManualAnalysis } from "./models/ManualAnalysis.js";
import { SkillTest } from "./models/SkillTest.js";
import { LearningPath } from "./models/LearningPath.js";
import { UserSettings } from "./models/UserSettings.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log("MONGO_URI loaded:", process.env.MONGO_URI ? "YES" : "NO");

// Connect MongoDB
connectDB();

// Firebase initialize
initializeFirebaseAdmin();

app.get("/", (req, res) => {
  res.send("SkillNova Backend is running");
});

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is missing in .env file");
  }

  return new GoogleGenAI({ apiKey });
};

// User Profile
app.get("/api/user/profile", verifyAuth, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/user/profile", verifyAuth, async (req, res) => {
  try {
    const { name, targetRole, location, experience } = req.body;

    let user = await User.findOne({ uid: req.user.uid });

    if (user) {
      if (name !== undefined) user.name = name;
      if (targetRole !== undefined) user.targetRole = targetRole;
      if (location !== undefined) user.location = location;
      if (experience !== undefined) user.experience = experience;
      await user.save();
    } else {
      user = new User({
        uid: req.user.uid,
        email: req.user.email,
        name: name || req.user.name || "User",
        targetRole: targetRole || "",
        location: location || "",
        experience: experience || "",
      });
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error("Profile save error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/user/cv-analyses", verifyAuth, async (req, res) => {
  try {
    const analyses = await CVAnalysis.find({ userId: req.user.uid }).sort({
      createdAt: -1,
    });

    res.json(analyses);
  } catch (error) {
    console.error("CV analyses fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/user/cv-analyses/:id", verifyAuth, async (req, res) => {
  try {
    const result = await CVAnalysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.uid,
    });

    if (!result) return res.status(404).json({ error: "Analysis not found" });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("CV analysis delete error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/user/manual-analyses", verifyAuth, async (req, res) => {
  try {
    const analyses = await ManualAnalysis.find({ userId: req.user.uid }).sort({
      createdAt: -1,
    });

    res.json(analyses);
  } catch (error) {
    console.error("Manual analyses fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/user/skill-tests", verifyAuth, async (req, res) => {
  try {
    const tests = await SkillTest.find({ userId: req.user.uid }).sort({
      createdAt: -1,
    });

    res.json(tests);
  } catch (error) {
    console.error("Skill tests fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Settings
app.get("/api/settings", verifyAuth, async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.user.uid });
    if (!settings) {
      settings = new UserSettings({ userId: req.user.uid });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    console.error("Settings fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.patch("/api/settings", verifyAuth, async (req, res) => {
  try {
    const updates = req.body;
    // Validate boolean values
    for (const key in updates) {
      if (typeof updates[key] !== "boolean") {
        return res.status(400).json({ error: `Value for ${key} must be a boolean.` });
      }
    }

    let settings = await UserSettings.findOne({ userId: req.user.uid });
    if (!settings) {
      settings = new UserSettings({ userId: req.user.uid, ...updates });
    } else {
      for (const key in updates) {
        settings[key] = updates[key];
      }
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error("Settings update error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Analyze CV
app.post("/api/analyze-cv", verifyAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "CV text is required" });

    const ai = getAI();

    const prompt = `
Analyze this CV and return ONLY valid JSON.

Return this structure:
{
  "name": "",
  "email": "",
  "skills": [],
  "education": [],
  "experience": [],
  "projects": [],
  "certifications": [],
  "targetRole": "",
  "careerRecommendations": [],
  "missingSkills": [],
  "jobMatches": [],
  "skillMatchScore": 0,
  "cvScore": 0,
  "learningPath": [],
  "aiInsights": ""
}

CV Text:
${text}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const data = JSON.parse(response.text);

    const newAnalysis = new CVAnalysis({
      userId: req.user.uid,
      originalText: text,
      ...data,
    });

    await newAnalysis.save();
    data._id = newAnalysis._id;

    res.json(data);
  } catch (error) {
    console.error("CV Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Manual Skill Analysis
app.post("/api/analyze-manual-skills", verifyAuth, async (req, res) => {
  try {
    const { name, skills, targetRole, experience, education } = req.body;

    if (!skills) return res.status(400).json({ error: "Skills are required" });

    const ai = getAI();

    const prompt = `
Analyze user skills for career readiness.

Name: ${name || "User"}
Skills: ${skills}
Target Role: ${targetRole || "Software Developer"}
Experience: ${experience || "Not provided"}
Education: ${education || "Not provided"}

Return ONLY valid JSON:
{
  "name": "",
  "targetRole": "",
  "extracted": { "skills": [] },
  "careerRecommendations": [],
  "missingSkills": [],
  "jobMatches": [],
  "skillMatchScore": 0,
  "cvScore": 0,
  "learningPath": [],
  "aiInsights": ""
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const data = JSON.parse(response.text);

    const newAnalysis = new ManualAnalysis({
      userId: req.user.uid,
      name,
      skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()),
      targetRole,
      experience,
      education,
      ...data,
    });

    await newAnalysis.save();
    data._id = newAnalysis._id;

    res.json(data);
  } catch (error) {
    console.error("Manual Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Skill Test
app.post("/api/generate-test", verifyAuth, async (req, res) => {
  try {
    const { skillName, type } = req.body;

    if (!skillName) {
      return res.status(400).json({ error: "Skill name is required" });
    }

    const ai = getAI();

    const prompt = `
Generate 5 multiple choice questions for ${skillName}.
Type: ${type || "quiz"}

Return ONLY JSON array:
[
  {
    "question": "",
    "options": ["", "", "", ""],
    "correctAnswer": 0,
    "explanation": ""
  }
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const questions = JSON.parse(response.text);

    const newTest = new SkillTest({
      userId: req.user.uid,
      skillName,
      questions,
    });

    await newTest.save();

    res.json({
      _id: newTest._id,
      questions,
    });
  } catch (error) {
    console.error("Skill Test Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Chat
app.post("/api/chat", verifyAuth, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const ai = getAI();

    const formattedContents = messages.map((msg) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: formattedContents,
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Custom Learning Path
app.post("/api/custom-learning-path", verifyAuth, async (req, res) => {
  try {
    const { targetRole, missingSkills } = req.body;

    if (!targetRole || !missingSkills) {
      return res.status(400).json({
        error: "Target role and missing skills are required",
      });
    }

    const ai = getAI();

    const prompt = `
Create a learning path for ${targetRole}.
Missing skills: ${missingSkills.map((s) => s.skill || s).join(", ")}

Return ONLY JSON array:
[
  {
    "title": "",
    "duration": "",
    "description": ""
  }
]
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const modules = JSON.parse(response.text);

    const newPath = new LearningPath({
      userId: req.user.uid,
      targetRole,
      missingSkills: missingSkills.map((s) => s.skill || s),
      modules,
    });

    await newPath.save();

    res.json(newPath);
  } catch (error) {
    console.error("Learning Path Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Dashboard APIs ---

// Dashboard Summary
app.get("/api/dashboard/summary", verifyAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    
    const latestCV = await CVAnalysis.findOne({ userId: uid }).sort({ createdAt: -1 });
    const latestManual = await ManualAnalysis.findOne({ userId: uid }).sort({ createdAt: -1 });
    
    let latestAnalysis = null;
    if (latestCV && latestManual) {
      latestAnalysis = latestCV.createdAt > latestManual.createdAt ? latestCV : latestManual;
    } else {
      latestAnalysis = latestCV || latestManual;
    }

    let totalSkills = 0;
    if (latestAnalysis) {
      if (latestAnalysis.skills && Array.isArray(latestAnalysis.skills)) {
        totalSkills = latestAnalysis.skills.length;
      } else if (latestAnalysis.extractedSkills && Array.isArray(latestAnalysis.extractedSkills)) {
        totalSkills = latestAnalysis.extractedSkills.length;
      }
    }

    const skillGapCount = latestAnalysis && latestAnalysis.missingSkills ? latestAnalysis.missingSkills.length : 0;
    const completedTests = await SkillTest.countDocuments({ userId: uid, isCompleted: true });
    const careerMatch = latestAnalysis ? (latestAnalysis.skillMatchScore || latestAnalysis.cvScore || 0) : 0;

    res.json({
      totalSkills,
      skillGapCount,
      completedTests,
      careerMatch
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Latest Analysis
app.get("/api/dashboard/latest-analysis", verifyAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const latestCV = await CVAnalysis.findOne({ userId: uid }).sort({ createdAt: -1 });
    const latestManual = await ManualAnalysis.findOne({ userId: uid }).sort({ createdAt: -1 });
    
    let latestAnalysis = null;
    if (latestCV && latestManual) {
      latestAnalysis = latestCV.createdAt > latestManual.createdAt ? latestCV : latestManual;
    } else {
      latestAnalysis = latestCV || latestManual;
    }

    res.json(latestAnalysis || {});
  } catch (error) {
    console.error("Dashboard latest analysis error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Skill Gaps
app.get("/api/dashboard/skill-gaps", verifyAuth, async (req, res) => {
  try {
    const uid = req.user.uid;
    const latestCV = await CVAnalysis.findOne({ userId: uid }).sort({ createdAt: -1 });
    const latestManual = await ManualAnalysis.findOne({ userId: uid }).sort({ createdAt: -1 });
    
    let latestAnalysis = null;
    if (latestCV && latestManual) {
      latestAnalysis = latestCV.createdAt > latestManual.createdAt ? latestCV : latestManual;
    } else {
      latestAnalysis = latestCV || latestManual;
    }

    res.json({ missingSkills: latestAnalysis ? (latestAnalysis.missingSkills || []) : [] });
  } catch (error) {
    console.error("Dashboard skill gaps error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Learning Path
app.get("/api/dashboard/learning-path", verifyAuth, async (req, res) => {
  try {
    const latestPath = await LearningPath.findOne({ userId: req.user.uid }).sort({ createdAt: -1 });
    res.json(latestPath || {});
  } catch (error) {
    console.error("Dashboard learning path error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Recent Tests
app.get("/api/dashboard/recent-tests", verifyAuth, async (req, res) => {
  try {
    const recentTests = await SkillTest.find({ userId: req.user.uid }).sort({ createdAt: -1 }).limit(5);
    res.json(recentTests || []);
  } catch (error) {
    console.error("Dashboard recent tests error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});