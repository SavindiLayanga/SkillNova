import { AI_API_KEY } from "./modelConfig.js";

async function test() {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { "Authorization": `Bearer ${AI_API_KEY}` }
    });
    const data = await res.json();
    console.log(data.data.map(m => m.id).join("\n"));
  } catch (err) {
    console.error("Failed:", err);
  }
}
test();
