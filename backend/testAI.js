import { getAI } from "./utils/aiHelper.js";
import { AI_MODEL } from "./modelConfig.js";

async function test() {
  try {
    const ai = getAI();
    console.log("Model:", AI_MODEL);
    const res = await ai.models.generateContent({
      model: AI_MODEL,
      contents: "Hello",
    });
    console.log(res);
  } catch (err) {
    console.error("Failed:", err);
  }
}
test();
