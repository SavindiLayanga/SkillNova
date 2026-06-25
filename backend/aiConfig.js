import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

export const AI_API_KEY = process.env.GEMINI_API_KEY;
export const AI_MODEL = "gemini-2.0-flash";
