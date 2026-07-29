import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-002',
      contents: 'Hello, this is a test.',
    });
    console.log("SUCCESS");
    console.log(response.text);
  } catch (error) {
    console.error("ERROR CAUGHT:");
    console.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  }
}

test();
