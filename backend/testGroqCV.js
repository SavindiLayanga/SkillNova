import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAI } from './utils/aiHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function testGroqCV() {
  try {
    const ai = getAI();
    const prompt = `
Analyze the attached PDF CV and extract the details strictly matching this JSON structure. If any field is not found, use an empty string or an empty array. Do NOT use placeholder text like "Not Detected". Pay special attention to "experience", "work experience", or "job experience" sections and extract them accurately into the experience array.

JSON Structure:
{
    "isITRelated": boolean,
    "name": "string",
    "experience": [{ "company": "string", "jobTitle": "string", "description": "string" }]
}
`;
    const contentsPayload = [
      { text: prompt + "\n\nFallback CV Text:\nJohn Doe, Web Developer" },
      {
        inlineData: {
          data: "fakeBase64",
          mimeType: "application/pdf"
        }
      }
    ];

    const response = await ai.models.generateContent({
      model: "llama-3.3-70b-versatile",
      contents: contentsPayload,
      config: { responseMimeType: "application/json" }
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testGroqCV();
