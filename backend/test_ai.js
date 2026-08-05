import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("NO API KEY");
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: "Return a JSON object with one key 'status' set to 'ok'.",
      config: { responseMimeType: "application/json" }
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Error:", err.message || err);
  }
}
test();
