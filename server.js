import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper function to get AI instance
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('Gemini API key is missing or invalid in server .env file');
  }
  return new GoogleGenAI({ apiKey });
};

// 1. Analyze CV
app.post('/api/analyze-cv', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'CV text is required' });
    }

    const ai = getAI();
    const prompt = `
You are an expert career guidance assistant. Analyze the following CV text and extract the information into a structured JSON format. 
If any information is missing or unclear, try to infer it or leave the array/string empty.

CRITICAL INSTRUCTION FOR SKILL GAPS: When determining the "missingSkills", you MUST specifically compare the candidate's extracted "skills" against the standard industry requirements for their "targetRole". The missingSkills array must ONLY contain skills that are crucial for the targetRole but are missing from their CV.

Return exactly and ONLY a JSON object with the following structure:
{
  "name": "Candidate's full name",
  "email": "Candidate's email address",
  "skills": [
    {
      "name": "Skill name (e.g. React, Node.js, Communication)",
      "category": "One of: Frontend, Backend, Mobile Development, Database, Cloud, DevOps, Soft Skills"
    }
  ],
  "education": [
    {
      "title": "Degree or certificate title",
      "provider": "University or institution",
      "detail": "Any relevant details, grades, or focus areas"
    }
  ],
  "experience": [
    {
      "role": "Job title",
      "place": "Company or organization",
      "period": "Duration",
      "detail": "Summary of responsibilities and achievements"
    }
  ],
  "projects": [
    {
      "title": "Project name",
      "detail": "Project description and technologies used"
    }
  ],
  "certifications": [
    "String array of certification names"
  ],
  "targetRole": "The main role the candidate is suited for (e.g., 'Frontend Developer', 'Data Scientist')",
  "careerRecommendations": [
    {
      "role": "Recommended job role",
      "matchPercentage": "Number representing match percentage (e.g. 85)"
    }
  ],
  "missingSkills": [
    {
      "skill": "Name of the missing skill",
      "recommendation": "Brief recommendation on how to learn it",
      "priority": "High, Medium, or Low",
      "current": 20,
      "required": 80
    }
  ],
  "jobMatches": [
    {
      "role": "Job role title",
      "company": "Fictional company or realistic example",
      "type": "Full-time / Part-time / Remote",
      "source": "LinkedIn / Glassdoor",
      "location": "City, Country or Remote",
      "salary": "Estimated salary range",
      "skills": ["Skill 1", "Skill 2"],
      "match": 85,
      "url": "#"
    }
  ],
  "skillMatchScore": "Overall skill match score out of 100 for their target role (number)",
  "cvScore": "Overall CV quality score out of 100 (number)",
  "learningPath": [
    {
      "skill": "Name of the missing skill",
      "courses": ["Course name 1", "Course name 2"],
      "certifications": ["Certification name 1"],
      "projects": ["Project idea to practice this skill"]
    }
  ],
  "aiInsights": "Human-readable feedback such as: 'Your profile is strong in React and JavaScript but lacks TypeScript, API Integration, and Testing skills required for a Junior React Developer role.'"
}

CV Text:
"""
${text}
"""
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let resultText = response.text;
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/^```json\n/, '').replace(/\n```$/, '');
    }
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze CV' });
  }
});

// 2. Analyze Manual Skills
app.post('/api/analyze-manual-skills', async (req, res) => {
  try {
    const { name, skills, targetRole, experience, education } = req.body;
    if (!skills) {
      return res.status(400).json({ error: 'Skills are required' });
    }

    const ai = getAI();
    const prompt = `
    You are an expert tech recruiter and career advisor.
    A user has manually provided their skills and target role.
    
    Name: ${name || 'User'}
    Target Role: ${targetRole || 'Software Developer'}
    Current Skills: ${skills}
    Experience Summary: ${experience || 'Not provided'}
    Education/Certifications: ${education || 'Not provided'}
    
    CRITICAL INSTRUCTION FOR SKILL GAPS: When determining the "missingSkills", you MUST specifically compare the user's "Current Skills" against the standard industry requirements for their "Target Role". The missingSkills array must ONLY contain skills that are crucial for the Target Role but are missing from their current skills.

    Please analyze these skills against the target role and output a JSON object containing:
    1. "name": The user's name
    2. "targetRole": The specific target role
    3. "extracted": Object containing:
        - "skills": List of skills they provided (each as an object with name and category)
    4. "careerRecommendations": Array of objects { role, matchPercentage }
    5. "missingSkills": Array of objects containing missing skill details:
        - "skill": Name of the missing skill
        - "recommendation": Brief recommendation
        - "priority": "High", "Medium", or "Low"
        - "current": Current level (0-100)
        - "required": Required level (0-100)
    6. "jobMatches": Array of realistic job match objects based on the user's skills:
        - "role": Job role title
        - "company": Fictional company
        - "type": "Full-time / Part-time / Remote"
        - "source": "LinkedIn / Glassdoor"
        - "location": Location
        - "salary": Estimated salary range
        - "skills": Array of string skills required
        - "match": Percentage match (number)
        - "url": "#"
    7. "skillMatchScore": Integer 0-100 (estimated match based on provided skills vs target role)
    8. "cvScore": Integer 0-100 (overall profile strength, evaluate based on the depth of skills)
    9. "learningPath": Array of objects { skill: string, courses: string[], certifications: string[], projects: string[] }
    10. "aiInsights": A short paragraph summarizing their readiness for the role.

    Return ONLY a valid JSON object matching this structure. No markdown blocks like \`\`\`json.
  `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let resultText = response.text;
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/^```json\n/, '').replace(/\n```$/, '');
    }
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error) {
    console.error('Gemini API Error (Manual Analysis):', error);
    res.status(500).json({ error: error.message || 'Failed to analyze manual skills' });
  }
});

// 3. Generate Skill Test
app.post('/api/generate-test', async (req, res) => {
  try {
    const { skillName, type } = req.body;
    if (!skillName) {
      return res.status(400).json({ error: 'Skill name is required' });
    }

    const ai = getAI();
    const isConceptual = type === 'quiz';
    const testTypeDesc = isConceptual
      ? 'a conceptual multiple-choice quiz'
      : 'a code debugging or error handling multiple-choice quiz';

    const prompt = `
You are an expert technical interviewer and educator. Generate ${testTypeDesc} for the skill: "${skillName}".
Create exactly 5 multiple-choice questions. 

Return exactly and ONLY a JSON array of objects with the following structure:
[
  {
    "question": "The question text here. (For debugging questions, include a code snippet to debug)",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": 0, // Integer index (0-3) of the correct option
    "explanation": "A short explanation of why the answer is correct."
  }
]
  `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let resultText = response.text;
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/^```json\n/, '').replace(/\n```$/, '');
    }
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error) {
    console.error('Gemini API Error (Test Generation):', error);
    res.status(500).json({ error: error.message || 'Failed to generate test' });
  }
});

// 4. Chat with Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, cvContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const ai = getAI();
    const systemInstruction =
      cvContext && cvContext.hasAnalysis
        ? `You are an expert, friendly AI Career Assistant for SkillNova. 
You are talking to a user named ${cvContext.analysis?.name || 'the user'}.
Their target role is: ${cvContext.analysis?.targetRole || 'Unknown'}.
They are missing these skills: ${
            cvContext.analysis?.missingSkills?.join(', ') || 'None'
          }.
Provide concise, actionable career advice. Be encouraging. Keep answers short and beautiful using markdown.`
        : `You are an expert, friendly AI Career Assistant for SkillNova. Provide concise, actionable career advice. The user has not uploaded a CV yet, so encourage them to do so if they ask about their profile.`;

    const formattedContents = messages.map((msg) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    res.json({ text: response.text });
  } catch (err) {
    console.error('Gemini Chat API Error:', err);
    res.status(500).json({ error: err.message || 'Failed to communicate with AI Assistant' });
  }
});

// 5. Generate Custom Learning Path
app.post('/api/custom-learning-path', async (req, res) => {
  try {
    const { targetRole, missingSkills } = req.body;
    if (!targetRole || !missingSkills) {
      return res.status(400).json({ error: 'Target role and missing skills are required' });
    }

    const ai = getAI();
    const prompt = `
    You are an expert career guidance system. The user wants to achieve the target role: "${targetRole}".
    However, they are currently missing these skills: ${missingSkills.join(', ')}.

    Please generate a custom, detailed learning path consisting of 3 to 5 logical milestones.
    For each milestone, provide the title, estimated duration (e.g. "2 weeks"), and a short action-oriented description.

    Output the result as a raw JSON array of objects with the exact structure below. Do NOT use markdown code blocks like \`\`\`json.
    [
      {
        "title": "Milestone title",
        "duration": "e.g., 2 weeks",
        "description": "Short description of what to learn and do."
      }
    ]
  `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let resultText = response.text;
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace(/^```json\n/, '').replace(/\n```$/, '');
    }
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error) {
    console.error('Gemini API Error (Custom Learning Path):', error);
    res.status(500).json({ error: error.message || 'Failed to generate custom learning path' });
  }
});

app.listen(port, () => {
  console.log(\`Backend server running on http://localhost:\${port}\`);
});
