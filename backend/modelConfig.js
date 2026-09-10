import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

export const AI_API_KEY = process.env.GROQ_API_KEY || "";
export const AI_MODEL = "llama-3.1-8b-instant";
