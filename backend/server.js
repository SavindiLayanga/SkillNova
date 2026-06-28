import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./db.js";
import { initializeFirebaseAdmin } from "./firebase.js";
import { verifyAuth } from "./middleware/auth.js";
import { AI_API_KEY, AI_MODEL } from "./aiConfig.js";

import { User } from "./models/User.js";
import { CVAnalysis } from "./models/CVAnalysis.js";
import { ManualAnalysis } from "./models/ManualAnalysis.js";
import { SkillTest } from "./models/SkillTest.js";
import { LearningPath } from "./models/LearningPath.js";
import { UserSettings } from "./models/UserSettings.js";
import { PracticeSession } from "./models/PracticeSession.js";
import { LibraryTest } from "./models/LibraryTest.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

console.log("MONGO_URI loaded:", process.env.MONGO_URI ? "YES" : "NO");

connectDB();
initializeFirebaseAdmin();

app.get("/", (req, res) => {
  res.send("SkillNova Backend is running");
});

const getAI = () => {
  const apiKey = AI_API_KEY;

  if (!apiKey) {
    throw new Error("AI API key is missing in .env file");
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

app.delete("/api/user/manual-analyses/:id", verifyAuth, async (req, res) => {
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

app.get("/api/user/all-analyses", verifyAuth, async (req, res) => {
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


// Skill Test Library API
app.get("/api/skill-tests/library/:skill", verifyAuth, async (req, res) => {
  try {
    const skill = req.params.skill;
    let tests = await LibraryTest.find({ userId: req.user.uid, skill }).sort({ createdAt: 1 });
    
    if (tests.length === 0) {
      // Generate 6 initial tests
      const ai = getAI();
      const prompt = `Generate exactly 6 unique AI-generated practice test topics for the skill: ${skill}.
For each topic, provide:
- title: A short title for the test (e.g., "React Fundamentals", "Hooks Mastery").
- description: A short description of what it covers.
- difficulty: One of ["Beginner", "Intermediate", "Advanced"].
- estimatedMinutes: 5 to 15.
- questionCount: exactly 5.
- coveredTopics: An array of 2-4 string topics covered.
- questions: An array of exactly 5 questions. Each question must have:
  - "question": string
  - "options": array of 4 string options
  - "correctAnswer": integer (0-3)
  - "explanation": string

CRITICAL REQUIREMENTS:
- Every generated test must focus on a unique aspect of ${skill}.
- Avoid duplicate concepts across the 6 tests.
- Format the response as a JSON array of 6 objects. Do not wrap in markdown or any other text.`;

      let generatedData;
      try {
        const response = await ai.models.generateContent({
          model: AI_MODEL,
          contents: prompt,
          config: { responseMimeType: "application/json" },
        });
        
        let cleanText = response.text ? response.text.trim() : "";
        if (cleanText.startsWith("\`\`\`")) {
          cleanText = cleanText.replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/i, "").trim();
        }
        generatedData = JSON.parse(cleanText);
      } catch (genError) {
        console.error("AI Generation failed, falling back to mock tests:", genError);
        generatedData = Array.from({ length: 6 }).map((_, i) => ({
          title: `${skill} Mock Test ${i + 1}`,
          description: `Fallback test generated because AI rate limit was exceeded.`,
          difficulty: "Intermediate",
          estimatedMinutes: 10,
          questionCount: 5,
          coveredTopics: [skill, "Fundamentals"],
          questions: Array.from({ length: 5 }).map((_, q) => ({
            question: `Sample question ${q + 1} for ${skill}?`,
            options: ["Option A", "Option B (Correct)", "Option C", "Option D"],
            correctAnswer: 1,
            explanation: "Fallback explanation."
          }))
        }));
      }

      const newTests = generatedData.map(testData => ({
        ...testData,
        userId: req.user.uid,
        skill,
        status: 'Not Started',
        attempts: 0,
        score: 0
      }));
      
      const inserted = await LibraryTest.insertMany(newTests);
      tests = inserted;
    }
    
    res.json(tests);
  } catch (error) {
    console.error("Skill test library fetch/generate error:", error);
    if (error.status === 429) {
      res.status(429).json({ error: "AI Rate Limit Exceeded. Please try again in a few moments." });
    } else {
      res.status(500).json({ error: "Server error while generating tests." });
    }
  }
});

app.post("/api/skill-tests/library/generate-more", verifyAuth, async (req, res) => {
  try {
    const { skill, existingTests, count = 3 } = req.body;
    
    const existingTitles = (existingTests || []).map(t => t.title).join(", ");
    
    const ai = getAI();
    const prompt = `Generate exactly ${count} NEW unique AI-generated practice test topics for the skill: ${skill}.
Already generated topics to AVOID: ${existingTitles}.

For each new topic, provide:
- title: A short title for the test.
- description: A short description of what it covers.
- difficulty: One of ["Beginner", "Intermediate", "Advanced"].
- estimatedMinutes: 5 to 15.
- questionCount: exactly 5.
- coveredTopics: An array of 2-4 string topics covered.
- questions: An array of exactly 5 questions. Each question must have:
  - "question": string
  - "options": array of 4 string options
  - "correctAnswer": integer (0-3)
  - "explanation": string

CRITICAL REQUIREMENTS:
- Every generated test must focus on a unique aspect of ${skill} that is DIFFERENT from the ones to AVOID.
- Format the response as a JSON array of ${count} objects. Do not wrap in markdown or any other text.`;

    let generatedData;
    try {
      const response = await ai.models.generateContent({
        model: AI_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      
      let cleanText = response.text ? response.text.trim() : "";
      if (cleanText.startsWith("\`\`\`")) {
        cleanText = cleanText.replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/i, "").trim();
      }
      generatedData = JSON.parse(cleanText);
    } catch (genError) {
      console.error("AI Generation failed for 'generate-more', falling back to mock tests:", genError);
      generatedData = Array.from({ length: count }).map((_, i) => ({
        title: `${skill} Mock Extension Test ${Date.now() + i}`,
        description: `Fallback test generated because AI rate limit was exceeded.`,
        difficulty: "Intermediate",
        estimatedMinutes: 10,
        questionCount: 5,
        coveredTopics: [skill, "More Topics"],
        questions: Array.from({ length: 5 }).map((_, q) => ({
          question: `Sample extension question ${q + 1} for ${skill}?`,
          options: ["Wrong", "Wrong", "Correct", "Wrong"],
          correctAnswer: 2,
          explanation: "Fallback explanation for extension."
        }))
      }));
    }

    const newTests = generatedData.map(testData => ({
      ...testData,
      userId: req.user.uid,
      skill,
      status: 'Not Started',
      attempts: 0,
      score: 0
    }));
    
    const inserted = await LibraryTest.insertMany(newTests);
    res.json(inserted);
  } catch (error) {
    console.error("Skill test library generate more error:", error);
    if (error.status === 429) {
      res.status(429).json({ error: "AI Rate Limit Exceeded. Please try again in a few moments." });
    } else {
      res.status(500).json({ error: "Server error while generating tests." });
    }
  }
});

app.get("/api/skill-tests/library/test/:id", verifyAuth, async (req, res) => {
  try {
    const test = await LibraryTest.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!test) return res.status(404).json({ error: "Test not found" });
    res.json(test);
  } catch (error) {
    console.error("Skill test fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/skill-tests/library/:id/complete", verifyAuth, async (req, res) => {
  try {
    const { score } = req.body;
    const test = await LibraryTest.findOne({ _id: req.params.id, userId: req.user.uid });
    
    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }
    
    test.status = "Completed";
    test.score = score;
    test.attempts += 1;
    test.completedAt = new Date();
    test.lastPlayed = new Date();
    
    await test.save();
    res.json(test);
  } catch (error) {
    console.error("Skill test complete error:", error);
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

    for (const key in updates) {
      if (typeof updates[key] !== "boolean") {
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

// Analyze CV
app.post("/api/analyze-cv", verifyAuth, async (req, res) => {
  const { text } = req.body;

  try {
    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "CV text is required" });
    }

    const ai = getAI();

    const prompt = `
Analyze this CV and return ONLY valid JSON.
Identify and cleanly separate technical skills (e.g. React, Node.js, Python, Figma) from soft skills (e.g. Communication, Leadership, Problem Solving). Include all skills in the combined 'skills' array as well.

Return this structure:
{
  "name": "",
  "email": "",
  "technicalSkills": [],
  "softSkills": [],
  "skills": [],
  "education": [],
  "experience": [],
  "projects": [],
  "certifications": [],
  "targetRole": "",
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

CV Text:
${text}
`;

    const response = await ai.models.generateContent({
      model: AI_MODEL,
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

    return res.json({
      ...data,
      _id: newAnalysis._id,
    });
  } catch (error) {
    console.error("CV Analysis Error:", error);

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
      error: "Failed to analyze CV. Please try again.",
    });
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

    const newAnalysis = new ManualAnalysis({
      userId: req.user.uid,
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
  } catch (error) {
    console.error("Manual Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Skill Test
app.post("/api/generate-test", verifyAuth, async (req, res) => {
  const { skillName, type, topic } = req.body;
  const actualTopic = topic || type || "Conceptual Quiz";

  try {

    if (!skillName) {
      return res.status(400).json({ error: "Skill name is required" });
    }

    const previousTest = await SkillTest.findOne({ userId: req.user.uid, skillName, topic: actualTopic }).sort({ createdAt: -1 });
    let difficultyContext = "";
    let targetDifficulty = "Intermediate";
    let attemptsCount = 1;

    if (previousTest) {
      attemptsCount = previousTest.attempts + 1;
      if (previousTest.masteryLevel === "Needs Improvement") {
        difficultyContext = "The user previously struggled with this skill. Generate easier, beginner-level questions to build confidence.";
        targetDifficulty = "Beginner";
      } else if (previousTest.masteryLevel === "Basic") {
        difficultyContext = "The user has basic knowledge. Generate intermediate-level questions.";
        targetDifficulty = "Intermediate";
      } else if (previousTest.masteryLevel === "Good") {
        difficultyContext = "The user has good mastery. Generate intermediate to advanced questions to challenge them.";
        targetDifficulty = "Intermediate-Advanced";
      } else if (previousTest.masteryLevel === "Excellent") {
        difficultyContext = "The user has excellent mastery. Generate advanced-level, complex problem-solving questions.";
        targetDifficulty = "Advanced";
      }
    }

    const ai = getAI();

    const prompt = `
Generate 10 unique multiple choice questions for ${skillName}.
Topic/Focus: ${actualTopic}
Type: ${type || "quiz"}
Target Difficulty: ${targetDifficulty}
${difficultyContext ? `Context: ${difficultyContext}` : ""}

CRITICAL REQUIREMENTS:
- Each question must test a distinctly different concept, feature, or aspect of ${skillName}.
- Do NOT repeat the same phrasing, question structure, or similar answer options.
- Ensure high variety in topics (e.g., syntax, best practices, troubleshooting, architecture).

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
      model: AI_MODEL,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });

    let cleanText = response.text ? response.text.trim() : "";
    
    // More robust markdown stripping
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    }

    let questionsData;
    let parseError = null;

    try {
      questionsData = JSON.parse(cleanText);
    } catch (e) {
      console.error("Generate Test - JSON Parse Error:", e);
      parseError = e;
    }

    // If parse failed, trigger the fallback directly
    if (parseError || !questionsData) {
      throw new Error("Invalid JSON returned from AI");
    }

    // AI sometimes returns { questions: [...] } instead of directly returning the array
    const questions = Array.isArray(questionsData) ? questionsData : (questionsData.questions || []);

    const newTest = new SkillTest({
      userId: req.user.uid,
      skillName,
      topic: actualTopic,
      questions,
      difficulty: targetDifficulty,
      attempts: attemptsCount
    });

    await newTest.save();

    res.json({
      _id: newTest._id,
      questions,
      difficulty: targetDifficulty,
      attempts: attemptsCount
    });
  } catch (error) {
    const errMessage = error.message || "";
    
    // Fallback to mock data on ANY AI error in development, or if specifically quota error, OR if it's invalid JSON
    const isQuotaError = error.status === 429 || 
                         errMessage.includes("429") || 
                         errMessage.toLowerCase().includes("resource_exhausted") || 
                         errMessage.toLowerCase().includes("quota exceeded") || 
                         errMessage.toLowerCase().includes("too many requests");

    const isParseError = errMessage.includes("Invalid JSON") || error instanceof SyntaxError;

    if (!isQuotaError) {
      console.error("Skill Test Error:", error);
    } else {
      console.warn(`[AI Quota Exceeded]: ${errMessage.split('\\n')[0]}`);
    }

    // Trigger fallback for ANY error to ensure the user is not blocked, 
    // especially since we had issues with silent UI failures.
    // If it's a parse error/invalid JSON, ALWAYS return the fallback instead of 500
    if (process.env.NODE_ENV !== "production" || isQuotaError || isParseError) {
      console.log("Returning mock data fallback to prevent UI crash...");
      
      const mockQuestions = Array.from({ length: 10 }).map((_, idx) => ({
        question: `Mock Question ${idx + 1} for ${skillName} (${actualTopic}): Which of the following is correct?`,
        options: ["Option A (Correct)", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        explanation: `This is a mock explanation for question ${idx + 1} generated because the AI quota was exceeded or an error occurred.`
      }));
      
      try {
        const newTest = new SkillTest({
          userId: req.user.uid,
          skillName,
          topic: actualTopic,
          questions: mockQuestions,
          difficulty: targetDifficulty,
          attempts: attemptsCount
        });

        await newTest.save();

        return res.json({
          _id: newTest._id,
          questions: mockQuestions,
          difficulty: targetDifficulty,
          attempts: attemptsCount
        });
      } catch (dbError) {
        return res.status(500).json({ error: "Failed to save mock test: " + dbError.message });
      }
    } else {
      return res.status(429).json({ error: "AI service quota exceeded. Please try again later." });
    }
  }
});

// Submit Skill Test
app.post("/api/user/skill-tests/:id/submit", verifyAuth, async (req, res) => {
  try {
    const { userAnswers } = req.body;
    const testId = req.params.id;

    if (!userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({ error: "userAnswers array is required" });
    }

    const test = await SkillTest.findOne({ _id: testId, userId: req.user.uid });
    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    let correctCount = 0;
    test.questions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / test.questions.length) * 100);
    
    let masteryLevel = "Needs Improvement";
    if (score >= 95) {
      masteryLevel = "Excellent";
    } else if (score >= 90) {
      masteryLevel = "Good";
    } else if (score >= 80) {
      masteryLevel = "Basic";
    }

    const isCompleted = score >= 80;

    test.userAnswers = userAnswers;
    test.score = score;
    test.masteryLevel = masteryLevel;
    test.isCompleted = isCompleted;
    test.completedAt = new Date();
    
    // If this test was already completed or attempted, maybe they are re-submitting the same document instead of generating a new one
    // But since the generation endpoint handles attempts, we just save this as the submission for this document.
    await test.save();

    res.json({
      score: test.score,
      masteryLevel: test.masteryLevel,
      isCompleted: test.isCompleted,
      attempts: test.attempts,
      completedAt: test.completedAt,
      message: isCompleted ? `${masteryLevel} mastery achieved!` : "Keep practicing and try again!"
    });
  } catch (error) {
    console.error("Submit Skill Test Error:", error);
    res.status(500).json({ error: "Server error" });
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

app.get("/api/user/current-practice", verifyAuth, async (req, res) => {
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

app.post("/api/user/current-practice", verifyAuth, async (req, res) => {
  try {
    const { selectedTest, currentQuestionIndex, userAnswers, timeLeft, isFinished } = req.body;
    let session = await PracticeSession.findOne({ userId: req.user.uid });
    if (!session) {
      session = new PracticeSession({ userId: req.user.uid });
    }
    
    if (selectedTest !== undefined) session.selectedTest = selectedTest;
    if (currentQuestionIndex !== undefined) session.currentQuestionIndex = currentQuestionIndex;
    if (userAnswers !== undefined) session.userAnswers = userAnswers;
    if (timeLeft !== undefined) session.timeLeft = timeLeft;
    if (isFinished !== undefined) session.isFinished = isFinished;
    
    await session.save();
    res.json(session);
  } catch (error) {
    console.error("Update Practice Session Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/user/current-practice", verifyAuth, async (req, res) => {
  try {
    await PracticeSession.findOneAndDelete({ userId: req.user.uid });
    res.json({ message: "Practice session cleared" });
  } catch (error) {
    console.error("Clear Practice Session Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Custom Learning Path
app.post("/api/custom-learning-path", verifyAuth, async (req, res) => {
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
app.get("/api/dashboard/summary", verifyAuth, async (req, res) => {
  try {
    const uid = req.user.uid;

    const latestCV = await CVAnalysis.findOne({ userId: uid }).sort({
      createdAt: -1,
    });

    const latestManual = await ManualAnalysis.findOne({ userId: uid }).sort({
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
app.get("/api/dashboard/latest-analysis", verifyAuth, async (req, res) => {
  try {
    const uid = req.user.uid;

    const latestCV = await CVAnalysis.findOne({ userId: uid }).sort({
      createdAt: -1,
    });

    const latestManual = await ManualAnalysis.findOne({ userId: uid }).sort({
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
app.get("/api/dashboard/skill-gaps", verifyAuth, async (req, res) => {
  try {
    const uid = req.user.uid;

    const latestCV = await CVAnalysis.findOne({ userId: uid }).sort({
      createdAt: -1,
    });

    const latestManual = await ManualAnalysis.findOne({ userId: uid }).sort({
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
app.get("/api/dashboard/learning-path", verifyAuth, async (req, res) => {
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
app.get("/api/dashboard/recent-tests", verifyAuth, async (req, res) => {
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

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});