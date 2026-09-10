import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testPrompt() {
  try {
    const prompt = `
Analyze the attached PDF CV and extract the details strictly matching this JSON structure. If any field is not found, use an empty string or an empty array. Do NOT use placeholder text like "Not Detected". Pay special attention to "experience", "work experience", or "job experience" sections and extract them accurately into the experience array.

JSON Structure:
{
    "isITRelated": boolean (true if the CV is related to IT, Software Engineering, Web Development, Data Science, or Tech, false otherwise),
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

Target Role: Software Developer

CV Text:
I am a web developer with 5 years of experience in React and Node.js.
`;

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // Assuming this is the model
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    });
    
    console.log("Success! Output:");
    console.log(response.response.text());
  } catch (err) {
    console.error("Error from AI:", err);
  }
}

testPrompt();
