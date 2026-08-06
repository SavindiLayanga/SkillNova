import { GoogleGenAI } from "@google/genai";
import { AI_API_KEY } from "../aiConfig.js";
import { generateDynamicTitle, generateDynamicDescription } from "./testFallbackHelper.js";

export const getAI = () => {
  const apiKey = AI_API_KEY;

  if (!apiKey) {
    throw new Error("AI API key is missing in .env file");
  }

  return new GoogleGenAI({ apiKey });
};

export function getDeduplicationKey(test) {
  let topic = test.title || "";
  const match = topic.match(/:\s*(.*?)\s*-/);
  if (match) {
    topic = match[1];
  } else if (test.coveredTopics && test.coveredTopics.length > 0) {
    topic = test.coveredTopics.join("");
  }
  const cleanTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${test.userId}-${test.skill}-${test.difficulty}-Library-${cleanTopic}`;
}

export const FALLBACK_TOPICS = [
  "Fundamentals",
  "Core Concepts",
  "Practical Usage",
  "Error Handling",
  "Best Practices",
  "Debugging",
  "Performance",
  "Security",
  "Testing",
  "Real-world Scenarios",
  "Interview Preparation",
  "Mini Project Practice",
  "Architecture",
  "State Management",
  "Data Flow",
  "API Integration",
  "Advanced Patterns",
  "Optimization Techniques"
];

export const generateFallbackTests = (skill, count, existingTests = []) => {
  const existingTitles = existingTests.map(t => typeof t === 'string' ? t.toLowerCase() : (t.title || '').toLowerCase());
  const existingTopics = existingTests.flatMap(t => typeof t === 'object' && t.coveredTopics ? t.coveredTopics.map(ct => ct.toLowerCase()) : []);
  
  const normalizedExisting = [...existingTitles, ...existingTopics];
  
  const availableTopics = FALLBACK_TOPICS.filter(topic => {
    return !normalizedExisting.some(ex => ex.includes(topic.toLowerCase()));
  });

  const generated = [];
  for (let i = 0; i < count; i++) {
    const testNumber = existingTests.length + i + 1;
    const difficulty = "Intermediate";
    const title = generateDynamicTitle(skill, difficulty, testNumber);
    
    // We can infer the topic generated internally, but for the fallback structure we just need strings
    const topic = `Extended Concepts ${testNumber}`;
    const concepts = [`basics of ${topic}`, `practical application`, `common patterns`];
    
    generated.push({
      title,
      description: generateDynamicDescription(skill, testNumber),
      difficulty,
      estimatedMinutes: 10,
      questionCount: 5,
      coveredTopics: [skill, topic, ...concepts],
      questions: Array.from({ length: 5 }).map((_, q) => ({
        question: `Sample question ${q + 1} regarding ${topic} in ${skill}?`,
        options: [
          `Incorrect assumption about ${topic}`,
          `Correct application of ${topic}`,
          `Common anti-pattern in ${topic}`,
          `Outdated approach to ${topic}`
        ],
        correctAnswer: 1,
        explanation: `This is a placeholder explanation for ${topic}.`
      }))
    });
  }
  return generated;
};
