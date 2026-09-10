import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAI } from './utils/aiHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function testGroq() {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "llama-3.3-70b-versatile",
      contents: "Hello, who are you?",
      config: { responseMimeType: "application/json" }
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testGroq();
