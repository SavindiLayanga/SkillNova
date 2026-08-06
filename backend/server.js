import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { connectDB } from "./db.js";
import { initializeFirebaseAdmin } from "./firebase.js";
import { verifyAuth } from "./middleware/auth.js";
import { require2FA } from "./middleware/require2FA.js";
import twoFactorRoutes from "./routes/twoFactorRoutes.js";
import skillTestRoutes from "./routes/skillTestRoutes.js";
import { AI_API_KEY, AI_MODEL } from "./aiConfig.js";
import { initializeCronJobs } from "./services/cronService.js";

import { User } from "./models/User.js";
import { CVAnalysis } from "./models/CVAnalysis.js";
import { ManualAnalysis } from "./models/ManualAnalysis.js";
import { SkillTest } from "./models/SkillTest.js";
import { LearningPath } from "./models/LearningPath.js";
import { UserSettings } from "./models/UserSettings.js";
import { PracticeSession } from "./models/PracticeSession.js";
import { LibraryTest } from "./models/LibraryTest.js";
import { generateDynamicTitle, generateDynamicDescription } from "./utils/testFallbackHelper.js";
import { sendCVAnalysisEmail } from "./services/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });



import adminAuthRoutes from './routes/adminAuthRoutes.js';
import adminUsersRoutes from './routes/adminUsersRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import adminJobsRoutes from './routes/adminJobsRoutes.js';
import userMatchesRoutes from './routes/userMatchesRoutes.js';
import adminNotificationRoutes from './routes/adminNotificationRoutes.js';
import adminCoursesRoutes from './routes/adminCoursesRoutes.js';
import adminCvReviewsRoutes from './routes/adminCvReviewsRoutes.js';
import preferencesRoutes from './routes/preferencesRoutes.js';

import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());

// Static file serving for uploads
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Mount Admin Routes
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/jobs', adminJobsRoutes);
app.use('/api/user/matches', userMatchesRoutes);
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/admin/courses', adminCoursesRoutes);
app.use('/api/admin/cv-reviews', adminCvReviewsRoutes);

app.use('/api/preferences', preferencesRoutes);

// Mount Skill Test Routes
app.use('/api', skillTestRoutes);

// Mount 2FA Routes
app.use('/api/2fa', twoFactorRoutes);

console.log("MONGO_URI loaded:", process.env.MONGO_URI ? "YES" : "NO");

connectDB();
initializeFirebaseAdmin();
initializeCronJobs();

app.get("/", (req, res) => {
  res.send("SkillNova Backend is running");
});


// User Profile
app.get("/api/user/profile", verifyAuth, require2FA, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/user/profile", verifyAuth, require2FA, async (req, res) => {
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

app.get("/api/user/cv-analyses", verifyAuth, require2FA, async (req, res) => {
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

app.delete("/api/user/cv-analyses/:id", verifyAuth, require2FA, async (req, res) => {
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

app.get("/api/user/manual-analyses", verifyAuth, require2FA, async (req, res) => {
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

app.delete("/api/user/manual-analyses/:id", verifyAuth, require2FA, async (req, res) => {
  try {
    const result = await ManualAnalysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.uid,
    });

    if (!result) return res.status(404).json({ error: "Analysis not found" });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Manual analysis delete error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/user/all-analyses", verifyAuth, require2FA, async (req, res) => {
  try {
    const cvAnalyses = await CVAnalysis.find({ userId: req.user.uid }).lean();
    const manualAnalyses = await ManualAnalysis.find({ userId: req.user.uid }).lean();
    
    const cvWithType = cvAnalyses.map(a => ({ ...a, analysisType: 'cv' }));
    const manualWithType = manualAnalyses.map(a => ({ ...a, analysisType: 'manual' }));
    
    const combined = [...cvWithType, ...manualWithType].sort((a, b) => b.createdAt - a.createdAt);
    
    res.json(combined);
  } catch (error) {
    console.error("All analyses fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/user/analyses/:id", verifyAuth, require2FA, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    let analysis = await CVAnalysis.findOne({ _id: id, userId: req.user.uid });
    let model = CVAnalysis;
    
    if (!analysis) {
      analysis = await ManualAnalysis.findOne({ _id: id, userId: req.user.uid });
      model = ManualAnalysis;
    }

    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    const updated = await model.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    
    res.json(updated);
  } catch (error) {
    console.error("Analysis update error:", error);
    res.status(500).json({ error: "Server error" });
  }
});



// Settings
app.get("/api/settings", verifyAuth, require2FA, async (req, res) => {
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

app.patch("/api/settings", verifyAuth, require2FA, async (req, res) => {
  try {
    const updates = req.body;

    const allowedStringKeys = ["notificationFrequency", "quietHoursStart", "quietHoursEnd", "language", "timezone", "dateFormat", "timeFormat", "theme", "currency"];

    for (const key in updates) {
      if (key.startsWith("twoFactor")) {
        return res.status(400).json({ error: "Cannot modify 2FA settings directly." });
      }
      
      const isStringAllowed = allowedStringKeys.includes(key);
      if (!isStringAllowed && typeof updates[key] !== "boolean") {
        return res.status(400).json({
          error: `Value for ${key} must be a boolean.`,
        });
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

// Security Review
app.get("/api/user/security-review", verifyAuth, require2FA, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Fetch user settings for 2FA status
    const settings = await UserSettings.findOne({ userId });
    
    // Dynamically import AuditLog since it might not be imported in server.js
    const { AuditLog } = await import("./models/AuditLog.js");
    
    // Fetch recent security events
    const recentLogs = await AuditLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('event ipAddress userAgent success createdAt');

    res.json({
      twoFactorEnabled: settings?.twoFactorAuth || false,
      twoFactorEnabledAt: settings?.twoFactorEnabledAt || null,
      recentActivity: recentLogs
    });
  } catch (error) {
    console.error("Security review fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Analyze CV
app.post("/api/analyze-cv", verifyAuth, require2FA, async (req, res) => {
  const { text, fileName, fileBase64 } = req.body;

  try {
    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "CV text is required" });
    }

    console.log("--- Analyze CV Request ---");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("USE_MOCK_AI:", process.env.USE_MOCK_AI);

    let data;

    console.log("Entering GenAI NLP mode...");
      
    const userProfile = await User.findOne({ uid: req.user.uid });
    const targetRole = userProfile?.targetRole || "Software Developer";
    
    try {
      const ai = getAI();
      const prompt = `
Analyze the attached PDF CV and extract the details strictly matching this JSON structure. If any field is not found, use an empty string or an empty array. Do NOT use placeholder text like "Not Detected". Pay special attention to "experience", "work experience", or "job experience" sections and extract them accurately into the experience array.

JSON Structure:
{
    "isITRelated": boolean (true if the CV is related to IT/Software/Tech, false otherwise),
    "name": "string",
    "email": "string",
    "phone": "string",
    "personalInformation": {
        "fullName": "string", "email": "string", "phone": "string", "linkedin": "string", "github": "string", "address": "string", "portfolio": "string"
    },
    "professionalSummary": "string",
    "primaryRole": { "role": "string", "confidence": 90, "reason": "string" },
    "technicalSkills": ["string"],
    "softSkills": ["string"],
    "skills": ["string"],
    "missingSkills": ["string"],
    "education": [{ "institution": "string", "degree": "string", "fieldOfStudy": "string", "startYear": "string", "endYear": "string" }],
    "experience": [{ "company": "string", "jobTitle": "string", "startDate": "string", "endDate": "string", "description": "string" }],
    "projects": [],
    "certifications": [],
    "matchPercentage": 85,
    "careerReadinessScore": 85,
    "jobRecommendations": ["string"],
    "summary": "string"
}

Target Role: ${targetRole}
      `;

      let contentsPayload = prompt;
      
      // If we have the raw PDF, send it directly to Gemini for OCR and deep reading
      if (fileBase64 && fileName && fileName.toLowerCase().endsWith(".pdf")) {
        const base64Data = fileBase64.replace(/^data:application\/pdf;base64,/, "");
        contentsPayload = [
          { text: prompt + "\n\nFallback CV Text:\n" + text },
          {
            inlineData: {
              data: base64Data,
              mimeType: "application/pdf"
            }
          }
        ];
      } else {
        contentsPayload = prompt + "\n\nCV Text:\n" + text;
      }

      const response = await ai.models.generateContent({
        model: AI_MODEL,
        contents: contentsPayload,
        config: { responseMimeType: "application/json" },
      });
      let responseText = response.text;
      if (responseText.includes("\`\`\`")) {
        responseText = responseText.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim();
      }
      data = JSON.parse(responseText);
    } catch (err) {
      console.error("GenAI failed, falling back to python server:", err);
      try {
        const nlpResponse = await fetch("http://127.0.0.1:5001/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, targetRole })
        });
        if (!nlpResponse.ok) throw new Error("Python NLP service failed");
        data = await nlpResponse.json();
      } catch (pythonErr) {
        throw new Error("Could not parse the CV using AI or Python fallback.");
      }
    }
    
    // We reject non-IT CVs directly with a 400 error now.
    if (data.isITRelated === false) {
      return res.status(400).json({ error: "This is not a software engineering field CV, please upload the correct field CV." });
    }
    
    // Map new NLP AI schema to existing frontend field names backward compatibility
    data.aiInsights = data.summary || data.aiInsights || "";
    data.careerRecommendations = data.jobRecommendations || data.careerRecommendations || [];
    data.learningPath = data.learningRoadmap || data.learningPath || [];
    data.skillMatchScore = data.matchPercentage || data.skillMatchScore || 0;
    data.cvScore = data.careerReadinessScore || data.cvScore || 0;

    console.log("Python NLP payload created.");

    try {
      const settings = await UserSettings.findOne({ userId: req.user.uid });
      const shouldStore = settings ? (settings.cvAnalysisStorage !== false) : true;
      
      if (shouldStore) {
        await CVAnalysis.updateMany({ userId: req.user.uid }, { isActive: false });
        await ManualAnalysis.updateMany({ userId: req.user.uid }, { isActive: false });

        let savedFileUrl = "";
        if (fileBase64) {
          try {
            const base64Data = fileBase64.replace(/^data:application\/pdf;base64,/, "");
            const uniqueName = `cv_${req.user.uid}_${Date.now()}.pdf`;
            const filePath = path.join(uploadsDir, uniqueName);
            fs.writeFileSync(filePath, base64Data, 'base64');
            savedFileUrl = `/uploads/${uniqueName}`;
          } catch (e) {
            console.error("Failed to save CV file:", e);
          }
        }

        const newAnalysis = new CVAnalysis({
          userId: req.user.uid,
          isActive: true,
          originalText: text,
          fileName: fileName || "",
          fileUrl: savedFileUrl,
          ...data,
        });

        await newAnalysis.save();
        console.log("MongoDB save SUCCESS.");

        // Async Email Notification Logic
        (async () => {
          try {
            const settings = await UserSettings.findOne({ userId: req.user.uid });
            if (settings?.emailNotifications && settings?.cvReviewUpdates) {
              let emailToSend = data.personalInformation?.email || data.email;
              if (!emailToSend) {
                const userRecord = await User.findOne({ uid: req.user.uid });
                emailToSend = userRecord?.email;
              }
              
              if (emailToSend) {
                await sendCVAnalysisEmail(emailToSend, {
                  cvScore: data.cvScore || 0,
                  targetRole: data.targetRole || targetRole
                });
              } else {
                console.warn("Email warning: Could not find extracted email or account email. Skipping CV analysis email.");
              }
            }
          } catch (emailErr) {
            console.error("Async email error during CV Analysis:", emailErr);
          }
        })();

        return res.json({
          ...data,
          _id: newAnalysis._id,
        });
      } else {
        console.log("CV Analysis Storage is disabled. Returning analysis without saving.");
        return res.json({
          ...data,
          _id: "temp_id_" + Date.now(),
        });
      }
    } catch (saveError) {
      console.error("MongoDB save FAILURE:", saveError);
      throw saveError; // Re-throw to be caught by the outer catch
    }
  } catch (error) {
    console.error("CV Analysis Error Full Details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error("CV Analysis Error Message:", error.message);

    const errorMessage = error?.message || "";
    const isQuotaError =
      error?.status === 429 ||
      errorMessage.includes("429") ||
      errorMessage.includes("RESOURCE_EXHAUSTED") ||
      errorMessage.toLowerCase().includes("quota exceeded");

    if (isQuotaError) {
      return res.status(429).json({
        error: "AI quota exceeded. Please try again later.",
      });
    }

    return res.status(500).json({
      error: `Failed to analyze CV. Please try again. Details: ${errorMessage}`,
    });
  }
});

// Manual Skill Analysis
app.post("/api/analyze-manual-skills", verifyAuth, require2FA, async (req, res) => {
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
  "jobMatches": [
    {
      "role": "",
      "company": "",
      "type": "Full-time/Remote",
      "location": "",
      "salary": "",
      "skills": [],
      "match": 0,
      "source": "",
      "url": ""
    }
  ],
  "skillMatchScore": 0,
  "cvScore": 0,
  "learningPath": [],
  "aiInsights": ""
}
`;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    const data = JSON.parse(response.text);

    if (Object.keys(data).length === 0) {
      throw new Error("Failed to extract data or invalid format.");
    }

    const settings = await UserSettings.findOne({ userId: req.user.uid });
    const shouldStore = settings ? (settings.cvAnalysisStorage !== false) : true;
    
    if (shouldStore) {
      await CVAnalysis.updateMany({ userId: req.user.uid }, { isActive: false });
      await ManualAnalysis.updateMany({ userId: req.user.uid }, { isActive: false });

      const newAnalysis = new ManualAnalysis({
        userId: req.user.uid,
        isActive: true,
        name,
        skills: Array.isArray(skills)
          ? skills
          : skills.split(",").map((s) => s.trim()),
        targetRole,
        experience,
        education,
        ...data,
      });

      await newAnalysis.save();

      res.json({
        ...data,
        _id: newAnalysis._id,
      });
    } else {
      res.json({
        ...data,
        _id: "temp_id_" + Date.now(),
      });
    }
  } catch (error) {
    console.error("Manual Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Archive Active Analysis
app.post("/api/user/analyses/archive-active", verifyAuth, require2FA, async (req, res) => {
  try {
    await CVAnalysis.updateMany({ userId: req.user.uid }, { isActive: false });
    await ManualAnalysis.updateMany({ userId: req.user.uid }, { isActive: false });
    res.json({ message: "Active analysis archived." });
  } catch (error) {
    console.error("Archive Analysis Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Chat
app.post("/api/chat", verifyAuth, require2FA, async (req, res) => {
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
      model: AI_MODEL,
      contents: formattedContents,
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== PRACTICE SESSION ====================

app.get("/api/user/current-practice", verifyAuth, require2FA, async (req, res) => {
  try {
    let session = await PracticeSession.findOne({ userId: req.user.uid });
    if (!session) {
      session = new PracticeSession({ userId: req.user.uid });
      await session.save();
    }
    res.json(session);
  } catch (error) {
    console.error("Fetch Practice Session Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/user/current-practice", verifyAuth, require2FA, async (req, res) => {
  try {
    const { selectedTest, currentQuestionIndex, userAnswers, timeLeft, isFinished } = req.body;
    let session = await PracticeSession.findOne({ userId: req.user.uid });
    if (!session) {
      session = new PracticeSession({ userId: req.user.uid });
    }
    
    if (selectedTest !== undefined) {
      session.selectedTest = selectedTest;
      session.markModified('selectedTest');
    }
    if (currentQuestionIndex !== undefined) session.currentQuestionIndex = currentQuestionIndex;
    if (userAnswers !== undefined) {
      session.userAnswers = userAnswers;
      session.markModified('userAnswers');
    }
    if (timeLeft !== undefined) session.timeLeft = timeLeft;
    if (isFinished !== undefined) session.isFinished = isFinished;
    
    await session.save();
    res.json(session);
  } catch (error) {
    console.error("Update Practice Session Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/user/current-practice", verifyAuth, require2FA, async (req, res) => {
  try {
    await PracticeSession.findOneAndDelete({ userId: req.user.uid });
    res.json({ message: "Practice session cleared" });
  } catch (error) {
    console.error("Clear Practice Session Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Custom Learning Path
app.post("/api/custom-learning-path", verifyAuth, require2FA, async (req, res) => {
  try {
    const { targetRole, missingSkills } = req.body;

    let safeMissingSkills = [];
    if (Array.isArray(missingSkills)) {
      safeMissingSkills = missingSkills.map((s) => s.skill || s);
    }
    
    if (!safeMissingSkills || safeMissingSkills.length === 0) {
      safeMissingSkills = ["Docker", "Kubernetes", "GraphQL"];
    }

    if (!targetRole) {
      return res.status(400).json({
        error: "Target role is required",
      });
    }

    const ai = getAI();

    const prompt = `
Create a personalized learning path for a ${targetRole}.

Missing Skills:
${safeMissingSkills.join(", ")}

Return ONLY valid JSON array:
[
  {
    "title": "",
    "duration": "",
    "description": ""
  }
]
`;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    let cleanText = response.text ? response.text.trim() : "";

    if (cleanText.startsWith("```")) {
      cleanText = cleanText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    }

    const modules = JSON.parse(cleanText);

    const newPath = new LearningPath({
      userId: req.user.uid,
      targetRole,
      missingSkills: safeMissingSkills,
      modules,
      status: "active",
      progress: 0,
    });

    await newPath.save();

    return res.json(newPath);
  } catch (error) {
    const errStr = error.message || String(error);
    if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
      console.warn("Learning Path AI Quota Exceeded. Using mock data.");
    } else {
      console.error("Learning Path Error:", error.message || error);
    }

    const mockModules = [
      {
        title: "Docker Fundamentals",
        duration: "3 Days",
        description: "Learn Docker images, containers, volumes and Docker Compose.",
      },
      {
        title: "Kubernetes Essentials",
        duration: "5 Days",
        description: "Understand Pods, Deployments, Services and basic cluster management.",
      },
      {
        title: "GraphQL Basics",
        duration: "4 Days",
        description: "Learn GraphQL schemas, queries, mutations and Apollo Client basics.",
      },
    ];

    let safeMissingSkills = [];
    if (Array.isArray(req.body.missingSkills)) {
      safeMissingSkills = req.body.missingSkills.map((s) => s.skill || s);
    }
    if (!safeMissingSkills || safeMissingSkills.length === 0) {
      safeMissingSkills = ["Docker", "Kubernetes", "GraphQL"];
    }

    const fallbackPath = {
      userId: req.user.uid,
      targetRole: req.body.targetRole || "Software Developer",
      missingSkills: safeMissingSkills,
      modules: mockModules,
      status: "active",
      progress: 0,
    };

    try {
      const newPath = new LearningPath(fallbackPath);
      await newPath.save();
      return res.json(newPath);
    } catch (dbError) {
      console.error("Mock Learning Path Save Error:", dbError.message || dbError);

      return res.json({
        _id: "mock-learning-path-" + Date.now(),
        ...fallbackPath,
        createdAt: new Date(),
        isMock: true,
      });
    }
  }
});

// Dashboard Summary
app.get("/api/dashboard/summary", verifyAuth, require2FA, async (req, res) => {
  try {
    const uid = req.user.uid;

    const latestCV = await CVAnalysis.findOne({ userId: uid, isActive: true }).sort({
      createdAt: -1,
    });

    const latestManual = await ManualAnalysis.findOne({ userId: uid, isActive: true }).sort({
      createdAt: -1,
    });

    let latestAnalysis = null;

    if (latestCV && latestManual) {
      latestAnalysis =
        latestCV.createdAt > latestManual.createdAt ? latestCV : latestManual;
    } else {
      latestAnalysis = latestCV || latestManual;
    }

    let totalSkills = 0;
    let totalTechnicalSkills = 0;
    let totalSoftSkills = 0;

    if (latestAnalysis) {
      if (latestAnalysis.skills && Array.isArray(latestAnalysis.skills)) {
        totalSkills = latestAnalysis.skills.length;
      } else if (
        latestAnalysis.extractedSkills &&
        Array.isArray(latestAnalysis.extractedSkills)
      ) {
        totalSkills = latestAnalysis.extractedSkills.length;
      }
      
      if (latestAnalysis.technicalSkills && Array.isArray(latestAnalysis.technicalSkills)) {
        totalTechnicalSkills = latestAnalysis.technicalSkills.length;
      }
      if (latestAnalysis.softSkills && Array.isArray(latestAnalysis.softSkills)) {
        totalSoftSkills = latestAnalysis.softSkills.length;
      }
    }

    const skillGapCount =
      latestAnalysis && latestAnalysis.missingSkills
        ? latestAnalysis.missingSkills.length
        : 0;

    const completedTests = await SkillTest.countDocuments({
      userId: uid,
      isCompleted: true,
    });

    const careerMatch = latestAnalysis
      ? latestAnalysis.skillMatchScore || latestAnalysis.cvScore || 0
      : 0;

    res.json({
      totalSkills,
      totalTechnicalSkills,
      totalSoftSkills,
      skillGapCount,
      completedTests,
      careerMatch,
      cvScore: latestAnalysis?.cvScore || 0,
      targetRole: latestAnalysis?.targetRole || "Unknown Role",
      aiInsights: latestAnalysis?.aiInsights || "",
      latestAnalysisDate: latestAnalysis?.createdAt || null,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Latest Analysis
app.get("/api/dashboard/latest-analysis", verifyAuth, require2FA, async (req, res) => {
  try {
    const uid = req.user.uid;

    const latestCV = await CVAnalysis.findOne({ userId: uid, isActive: true }).sort({
      createdAt: -1,
    });

    const latestManual = await ManualAnalysis.findOne({ userId: uid, isActive: true }).sort({
      createdAt: -1,
    });

    let latestAnalysis = null;

    if (latestCV && latestManual) {
      latestAnalysis =
        latestCV.createdAt > latestManual.createdAt ? latestCV : latestManual;
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
app.get("/api/dashboard/skill-gaps", verifyAuth, require2FA, async (req, res) => {
  try {
    const uid = req.user.uid;

    const latestCV = await CVAnalysis.findOne({ userId: uid, isActive: true }).sort({
      createdAt: -1,
    });

    const latestManual = await ManualAnalysis.findOne({ userId: uid, isActive: true }).sort({
      createdAt: -1,
    });

    let latestAnalysis = null;

    if (latestCV && latestManual) {
      latestAnalysis =
        latestCV.createdAt > latestManual.createdAt ? latestCV : latestManual;
    } else {
      latestAnalysis = latestCV || latestManual;
    }

    res.json({
      missingSkills: latestAnalysis ? latestAnalysis.missingSkills || [] : [],
    });
  } catch (error) {
    console.error("Dashboard skill gaps error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Learning Path
app.get("/api/dashboard/learning-path", verifyAuth, require2FA, async (req, res) => {
  try {
    const latestPath = await LearningPath.findOne({
      userId: req.user.uid,
    }).sort({
      createdAt: -1,
    });

    res.json(latestPath || {});
  } catch (error) {
    console.error("Dashboard learning path error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Recent Tests
app.get("/api/dashboard/recent-tests", verifyAuth, require2FA, async (req, res) => {
  try {
    const recentTests = await SkillTest.find({
      userId: req.user.uid,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(recentTests || []);
  } catch (error) {
    console.error("Dashboard recent tests error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Recent Activity
app.get("/api/dashboard/recent-activity", verifyAuth, require2FA, async (req, res) => {
  try {
    const activities = [];
    
    // 1. Fetch recent CV Analyses
    const recentAnalyses = await CVAnalysis.find({ uid: req.user.uid }).sort({ createdAt: -1 }).limit(3);
    for (const a of recentAnalyses) {
      activities.push({
        id: a._id.toString(),
        type: 'analysis',
        title: 'CV Analyzed',
        description: `Your CV was analyzed resulting in a ${a.skillMatchScore || a.cvScore || 0}% career match score.`,
        date: a.createdAt,
      });
    }

    // 2. Fetch recent Skill Tests
    const tests = await SkillTest.find({ userId: req.user.uid }).sort({ createdAt: -1 }).limit(3);
    for (const t of tests) {
      activities.push({
        id: t._id.toString(),
        type: 'test',
        title: `Skill Test Completed`,
        description: `You completed a test on ${t.skillName} with a score of ${t.score}%.`,
        date: t.completedAt || t.createdAt,
      });
    }

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(activities.slice(0, 5));
  } catch (error) {
    console.error("Dashboard recent activity error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
  });
}

export default app;