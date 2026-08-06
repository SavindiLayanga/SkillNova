import { SkillTest } from "../models/SkillTest.js";
import { LibraryTest } from "../models/LibraryTest.js";
import { AI_MODEL } from "../aiConfig.js";
import { getAI, getDeduplicationKey, generateFallbackTests } from "../utils/aiHelper.js";

// Fetch User Skill Tests
export const getUserSkillTests = async (req, res) => {
  try {
    const tests = await SkillTest.find({ userId: req.user.uid }).sort({
      createdAt: -1,
    });
    res.json(tests);
  } catch (error) {
    console.error("Skill tests fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Fetch or Generate Library Tests
export const getLibraryTests = async (req, res) => {
  try {
    const skill = req.params.skill;
    let tests = await LibraryTest.find({ userId: req.user.uid, skill }).sort({ createdAt: 1 });
    
    if (tests.length === 0) {
      // Generate 6 initial tests
      const ai = getAI();
      const prompt = `Generate exactly 6 unique AI-generated practice test topics for the skill: ${skill}.
For each topic, provide:
- title: A title EXACTLY following this format: "{Skill}: {Specific Topic} - {Level or Focus}" (e.g., "React: Hooks & State - Intermediate Quiz"). DO NOT use vague titles.
- description: A short description of what it covers. MUST explicitly mention 3-5 specific concepts covered in the test (e.g., "Practice useState, useEffect, custom hooks, state updates, and common React hook mistakes.").
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
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        }
        generatedData = JSON.parse(cleanText);
      } catch (genError) {
        console.error("AI Generation failed, falling back to dynamic mock tests:", genError);
        generatedData = generateFallbackTests(skill, 6, []);
      }

      const newTests = generatedData.map(testData => ({
        ...testData,
        userId: req.user.uid,
        skill,
        status: 'Not Started',
        attempts: 0,
        score: 0
      }));
      
      const currentTests = await LibraryTest.find({ userId: req.user.uid, skill });
      const currentKeys = new Set(currentTests.map(getDeduplicationKey));
      
      const uniqueNewTests = [];
      for (const t of newTests) {
        const key = getDeduplicationKey(t);
        if (!currentKeys.has(key)) {
          uniqueNewTests.push(t);
          currentKeys.add(key);
        }
      }
      
      if (uniqueNewTests.length > 0) {
        await LibraryTest.insertMany(uniqueNewTests);
      }
      
      tests = await LibraryTest.find({ userId: req.user.uid, skill }).sort({ createdAt: 1 });
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
};

// Generate More Library Tests
export const generateMoreLibraryTests = async (req, res) => {
  try {
    const { skill, existingTests, count = 3 } = req.body;
    
    const existingTitles = (existingTests || []).map(t => t.title).join(", ");
    const existingTopics = (existingTests || []).flatMap(t => t.coveredTopics || []).join(", ");
    
    const ai = getAI();
    const prompt = `Generate exactly ${count} NEW unique AI-generated practice test topics for the skill: ${skill}.
Already generated titles to AVOID: ${existingTitles}.
Already covered concepts to AVOID: ${existingTopics}.

For each new topic, provide:
- title: A title EXACTLY following this format: "{Skill}: {Specific Topic} - {Level or Focus}" (e.g., "Docker: Volumes & Networks - Intermediate Quiz"). DO NOT use vague titles.
- description: A short description of what it covers. MUST explicitly mention 3-5 specific concepts covered in the test.
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
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      }
      generatedData = JSON.parse(cleanText);
    } catch (genError) {
      console.error("AI Generation failed for 'generate-more', falling back to mock tests:", genError);
      generatedData = generateFallbackTests(skill, count, existingTests);
    }

    const newTests = generatedData.map(testData => ({
      ...testData,
      userId: req.user.uid,
      skill,
      status: 'Not Started',
      attempts: 0,
      score: 0
    }));
    
    const currentTests = await LibraryTest.find({ userId: req.user.uid, skill });
    const currentKeys = new Set(currentTests.map(getDeduplicationKey));
    
    const uniqueNewTests = [];
    let skippedDuplicates = 0;
    for (const t of newTests) {
      const key = getDeduplicationKey(t);
      if (!currentKeys.has(key)) {
        uniqueNewTests.push(t);
        currentKeys.add(key);
      } else {
        skippedDuplicates++;
      }
    }
    
    let inserted = [];
    if (uniqueNewTests.length > 0) {
      inserted = await LibraryTest.insertMany(uniqueNewTests);
    }
    
    res.json({ newTests: inserted, skippedDuplicates });
  } catch (error) {
    console.error("Skill test library generate more error:", error);
    if (error.status === 429) {
      res.status(429).json({ error: "AI Rate Limit Exceeded. Please try again in a few moments." });
    } else {
      res.status(500).json({ error: "Server error while generating tests." });
    }
  }
};

// Get Library Test by ID
export const getLibraryTestById = async (req, res) => {
  try {
    const test = await LibraryTest.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!test) return res.status(404).json({ error: "Test not found" });
    res.json(test);
  } catch (error) {
    console.error("Skill test fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Complete Library Test
export const completeLibraryTest = async (req, res) => {
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
};

// Submit Skill Test
export const submitSkillTest = async (req, res) => {
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
    console.error("Skill test submit error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Generate General Skill Test
export const generateSkillTest = async (req, res) => {
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

    if (parseError || !questionsData) {
      throw new Error("Invalid JSON returned from AI");
    }

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
      console.warn(`[AI Quota Exceeded]: ${errMessage.split('\n')[0]}`);
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
};
